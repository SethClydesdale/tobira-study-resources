// appendix tools
(function (window, document) {
  'use strict';
  
  Genki.appendix = {

    // dictionary functions
    jisho : {
      mode : 'ja', // dictionary mode
      selected : [], // selected definitions
      
      // node cache for improving performance
      cache : {
        box : {}, // checkbox cache used for mirrors
        group : {}, // group checkbox cache used for selecting groups
        
        // cache used for searches
        search : {
          ja : [],
          en : []
        }
      },
      
      
      // Initial setup of the dictionary by adding checkboxes, filling out the English-Japanese dictionary, and more..
      init : function () {
        var def, i, j, k, ja, en, cleaned, list,
            checked = storageOK && localStorage.selectedDefinitions ? localStorage.selectedDefinitions.split(',') : [],
            sorted = [],
            defList = {},
            frag, group, first,
            n = 0;
        
        for (k in Genki.jisho) {
          list = document.getElementById('list-' + k);
          frag = document.createDocumentFragment();
          
          for (i = 0, j = Genki.jisho[k].length; i < j; i++) {
            if (Genki.jisho[k][i].en) { // ignore empty definitions
              def = document.createElement('LI');
              def.className = 'definition clear';
              def.dataset.def = k + i; // use key and index as unique identifier
              
              // parse definition
              ja = Genki.jisho[k][i].ja.split('|');
              def.innerHTML = 
                '<input class="def-selector genki_input_hidden" type="checkbox" onchange="Genki.appendix.jisho.updateCheckboxes(this, \'' + def.dataset.def + '\');"' + (checked.indexOf(def.dataset.def) != -1 ? 'checked' : '') + '>'+
                '<span tabindex="0" class="genki_pseudo_checkbox" onclick="this.previousSibling.click();" onkeypress="event.key == \'Enter\' && this.previousSibling.click();"></span>'+
                '<span class="def-ja' + (ja[1] ? ' def-furi' : '') + '">'+
                  ja[0]+
                  (ja[1] ? '<i>' + ja[1] + '</i>' : '')+
                '</span>'+
                '<span class="def-en">' + Genki.jisho[k][i].en + '</span>'+
                (Genki.jisho[k][i].v ? ' <span class="def-vtype">[<i>' + Genki.jisho[k][i].v + '</i>]</span>' : '')+
                '<span class="def-label">' + Genki.jisho[k][i].l + '</span>';

              // add definition to dictionary
              frag.appendChild(def);

              // compile english definitions
              // cleans the english string and converts it to lowercase so words can be sorted more accurately
              cleaned = Genki.jisho[k][i].en.replace(/^\(.*?\) |^to be |^to |^the |^it |^\.\.\.(?:,|)|^\d+-|^\d+|^"|^-/i, '').toLowerCase();

              if (defList[cleaned]) { // if a key already exists, add the key with a random id
                cleaned = cleaned + '-' + ++n;
              }

              defList[cleaned] = def.cloneNode(true);
              sorted.push(cleaned);

              // cache japanese definition
              Genki.appendix.jisho.cache.box[def.dataset.def] = {
                ja : def.firstChild
              };

              // cache japanese definition group
              if (!Genki.appendix.jisho.cache.group[k]) {
                Genki.appendix.jisho.cache.group[k] = [];
              }
              Genki.appendix.jisho.cache.group[k].push(def.firstChild);

              // cache japanese definition for searches
              Genki.appendix.jisho.cache.search.ja.push(def);
            }
          }
          
          list.appendChild(frag);
        }
        
        // sort english definitions
        sorted = sorted.sort();
        group = 'A';
        frag = document.createDocumentFragment();
        
        // add english definitions to the English-Japanese dictionary
        for (i = 0, j = sorted.length; i < j; i++) {
          first = sorted[i].charAt(0);
          
          // append current group and start a new one
          if (first != group) {
            // checks if the definition key is valid
            if (/[a-z]/.test(first)) {
              document.getElementById('list-' + group).appendChild(frag);

              group = first.toUpperCase();
              frag = document.createDocumentFragment();
            } 
            // throws a soft error in the console if a definition is not valid so that we can fix it
            else if (Genki.debug) {
              console.error('STRING CLEAN ERROR: "' + first + '" is an invalid definition key. The key must be alphabetical. (A-Z)\nDefinition Source: { ja : "' + defList[sorted[i]].querySelector('.def-ja').innerHTML.replace(/<span class="def-en">.*?<\/span>/, '') + '", en : "' + defList[sorted[i]].querySelector('.def-en').innerHTML + '" }');
            }

          }
          
          // move the english definition to the front
          en = defList[sorted[i]].innerHTML.match(/<span class="def-en">.*?<\/span>/);
          
          if (en[0]) { // only move definition if there's a match
            // build the english definition
            defList[sorted[i]].innerHTML = defList[sorted[i]].innerHTML.replace(/<span class="def-en">.*?<\/span>/, '').replace(/(<input.*?<\/span>)/, '$1' + en[0] + ' ');
            frag.appendChild(defList[sorted[i]]);
            
            // cache english definition
            Genki.appendix.jisho.cache.box[defList[sorted[i]].dataset.def].en = defList[sorted[i]].firstChild;
            
            // cache english definition group
            if (!Genki.appendix.jisho.cache.group[group]) {
              Genki.appendix.jisho.cache.group[group] = [];
            }
            Genki.appendix.jisho.cache.group[group].push(defList[sorted[i]].firstChild);
            
            // cache english definition for searches
            Genki.appendix.jisho.cache.search.en.push(defList[sorted[i]]);
          }
        }
        
        // append final group
        document.getElementById('list-' + group).appendChild(frag);
        
        // add definition count to each group's title
        for (var title = document.querySelectorAll('.dictionary-group .section-title'), i = 0, j = title.length, grp; i < j; i++) {
          grp = Genki.appendix.jisho.cache.group[title[i].id.replace('section-', '')];
          title[i].insertAdjacentHTML('beforeend', '<span class="definition-count">(' + (grp ? grp.length : 0) + ')</span>');
        }
        
        // add total definition count to the introduction
        document.getElementById('total-definitions').innerHTML = '<strong>' + Genki.appendix.jisho.cache.search.ja.length + '</strong>';
        
        // restore preferences
        Genki.appendix.jisho.restoreSettings();
        
        // add jump arrows
        AddJumpArrowsTo('.dictionary-group .section-title', 'dictionary-top', 'Return to the top of the dictionary');
        
        // update exercise title name
        document.getElementById('exercise-title').insertAdjacentHTML('beforeend', ' Word Practice');
        
        // cache nodes for searching
        Genki.appendix.jisho.cache.search.res_ja = document.getElementById('dict-search-results-ja');
        Genki.appendix.jisho.cache.search.res_en = document.getElementById('dict-search-results-en');
        Genki.appendix.jisho.cache.search.hit_ja = document.getElementById('dict-search-hits-ja');
        Genki.appendix.jisho.cache.search.hit_en = document.getElementById('dict-search-hits-en');
        
        // finally show the dictionary
        Genki.appendix.finishedLoading();
      },
      
      
      // switches dictionary mode
      // ja = japanese-english
      // en = english-japanese
      switchMode : function (mode, init) {
        var ja = {
          button : document.getElementById('ja-mode'),
            dict : document.getElementById('japanese-english')
        },

        en = {
          button : document.getElementById('en-mode'),
            dict : document.getElementById('english-japanese')
        };

        // japanese-english mode
        if (mode == 'ja' && Genki.appendix.jisho.mode != 'ja') {
          // update active button
          ja.button.className += ' active-mode';
          en.button.className = en.button.className.replace(' active-mode', '');

          // show the active dictionary
          en.dict.className += ' dict-hidden';
          ja.dict.className = ja.dict.className.replace(' dict-hidden', '');
        } 

        // english-japanese mode
        else if (mode == 'en' && Genki.appendix.jisho.mode != 'en') {
          // update active button
          en.button.className += ' active-mode';
          ja.button.className = ja.button.className.replace(' active-mode', '');

          // show the active dictionary
          ja.dict.className += ' dict-hidden';
          en.dict.className = en.dict.className.replace(' dict-hidden', '');
        }
        
        Genki.appendix.jisho.mode = mode;

        // save preferences
        if (!init && storageOK) {
          localStorage.genkiJishoMode = mode;
        }
      },
      
      
      // updates localStorage and checkbox mirrors
      updateCheckboxes : function (caller, id, selectAll) {
        var box = Genki.appendix.jisho.cache.box[id],
            index = Genki.appendix.jisho.selected.indexOf(id),
            k;

        if (caller.checked) {
          for (k in box) {
            if (caller != box[k]) {
              box[k].checked = true;
            }
          }

          // add definition to array
          if (index == -1) {
            Genki.appendix.jisho.selected.push(id);
          }

        } else if (!caller.checked) {
          for (k in box) {
            if (caller != box[k]) {
              box[k].checked = false;
            }
          }

          // remove definition from array
          if (index != -1) {
            Genki.appendix.jisho.selected.splice(index, 1);
          }
        }

        // save selected
        if (!selectAll && storageOK) {
          localStorage.selectedDefinitions = Genki.appendix.jisho.selected;
        }
      },
      
      
      // select/deselect helper
      // state: true||false (checkbox state)
      // target: '#list-{A|B|C|あ|い|う}' (selects the target group; ex: '#list-A')
      // custom: true||false (allows custom target selector if true)
      selectAll : function (state, target) {
        var a = target ? Genki.appendix.jisho.cache.group[target] : Genki.appendix.jisho.cache.box, i, j, k;
        
        if (!a) {
          return;
        }
        
        // update all checkboxes
        if (target) { // target selection
          for (i = 0, j = a.length; i < j; i++) {
            if (a[i].checked != state) {
              a[i].checked = state;
              Genki.appendix.jisho.updateCheckboxes(a[i], a[i].parentNode.dataset.def, true);
            }
          }
          
        } else { // select all using the node cache
          for (k in a) {
            if (a[k].ja.checked != state) {
              a[k].ja.checked = state;
              Genki.appendix.jisho.updateCheckboxes(a[k].ja, a[k].ja.parentNode.dataset.def, true);
            }
          }
        }
        
        // save selected
        if (storageOK) {
          localStorage.selectedDefinitions = Genki.appendix.jisho.selected;
        }
      },
      
      
      // toggles word lists
      toggleList : function (caller, all) {
        // toggle all word lists
        if (all) {
          var parent = caller.parentNode.parentNode.parentNode.parentNode,
              buttons = parent.querySelectorAll('.dictionary-group .group-selectors'),
              list = parent.querySelectorAll('.dictionary-group .word-list'),
              toggles = parent.querySelectorAll('.dictionary-group .toggle-word-list'),
              i = 0, j = list.length;
          
          // show definitions
          if (/Show/.test(caller.innerHTML)) {
            for (; i < j; i++) {
              list[i].className = list[i].className.replace(' hidden', '');
              buttons[i].className = buttons[i].className.replace(' hidden', '');
              toggles[i].innerHTML = toggles[i].innerHTML.replace('Show', 'Hide');
            }
            
            caller.innerHTML = caller.innerHTML.replace('Show', 'Hide');
          } 
          
          // hide definitions
          else {
            for (; i < j; i++) {
              if (!/hidden/.test(list[i].className)) list[i].className += ' hidden';
              if (!/hidden/.test(buttons[i].className)) buttons[i].className += ' hidden';
              toggles[i].innerHTML = toggles[i].innerHTML.replace('Hide', 'Show');
            }
            
            caller.innerHTML = caller.innerHTML.replace('Hide', 'Show');
          }
        }
        
        // toggle single word lists
        else {
          var parent = caller.parentNode.parentNode,
              buttons = parent.querySelector('.group-selectors'),
              list = parent.querySelector('.word-list');
          
          // show definitions
          if (/hidden/.test(list.className)) {
            list.className = list.className.replace(' hidden', '');
            buttons.className = buttons.className.replace(' hidden', '');
            caller.innerHTML = caller.innerHTML.replace('Show', 'Hide')
          }

          // hide definitions
          else {
            list.className += ' hidden';
            buttons.className += ' hidden';
            caller.innerHTML = caller.innerHTML.replace('Hide', 'Show')
          }
        }
      },
      
      
      // quick search
      search : function (value, mode, retry) {
        // clear existing timeout
        if (Genki.appendix.jisho.searchTimeout) {
          window.clearTimeout(Genki.appendix.jisho.searchTimeout);
        }
        
        // wait 300ms before submitting search, just in case the user is still typing
        Genki.appendix.jisho.searchTimeout = window.setTimeout(function() {
          var frag = document.createDocumentFragment(),
              results = Genki.appendix.jisho.cache.search['res_' + mode],
              hitsCounter = Genki.appendix.jisho.cache.search['hit_' + mode],
              def = Genki.appendix.jisho.cache.search[mode],
              defLen = def.length,
              hits = 0,
              i = 0,
              k,
              clone;

          // uncache clones
          for (k in Genki.appendix.jisho.cache.box) {
            if (Genki.appendix.jisho.cache.box[k]['search_' + mode]) {
              delete Genki.appendix.jisho.cache.box[k]['search_' + mode]
            }
          }
          Genki.appendix.jisho.cache.group['search_' + mode] = [];

          // clear prior searches
          results.innerHTML = '';

          // loop over the dictionary if a value is present
          if (value) {
            for (; i < defLen; i++) {
              if (def[i].innerText.toLowerCase().indexOf(value.toLowerCase()) != -1) {
                clone = def[i].cloneNode(true);
                frag.appendChild(clone); // clone the match for displaying in the results node

                // cache search clone
                Genki.appendix.jisho.cache.box[def[i].dataset.def]['search_' + mode] = clone.firstChild;
                Genki.appendix.jisho.cache.group['search_' + mode].push(clone.firstChild);

                hits++; // increment hits
              }
            }
          }
          
          // perform a kanji only search if the previous one yeilded no results
          if (!retry && !frag.childNodes.length && value && /[\u3400-\u9faf]/.test(value)) {
            var kanji = value.match(/[\u3400-\u9faf]+/);
            
            if (kanji && kanji[0]) {
              Genki.appendix.jisho.search(kanji[0], mode, true);
            }
          } 
          
          // show results
          else {
            // append the matched exercises or display an error message/hide the search results
            if (frag.childNodes.length) {
              results.parentNode.querySelector('.group-selectors').style.visibility = '';
              results.appendChild(frag);

            } else {
              results.parentNode.querySelector('.group-selectors').style.visibility = 'hidden';
              results.innerHTML = value ? '<li>No results found for "' + value + '".</li>' : '';
            }

            hitsCounter.innerHTML = hits ? '(' + hits + ') ' : '';
          }
          
          delete Genki.appendix.jisho.searchTimeout;
        }, 300);
      },
      
      
      // purges bad definition ids (don't exist anymore or on the current site; e.g. going from tobira --> genki version which have different selectors)
      purgeBadSelectors : function () {
        var j = Genki.appendix.jisho.selected.length;
        
        // verify selected definitions
        for (var i = 0, badId = []; i < j; i++) {
          if (!document.querySelector('#japanese-english [data-def="' + Genki.appendix.jisho.selected[i] + '"]')) {
            badId.push(Genki.appendix.jisho.selected[i]);
          }
        }
        
        // purge bad selectors
        if (badId.length) {
          while (badId.length) {
            Genki.appendix.jisho.selected.splice(Genki.appendix.jisho.selected.indexOf(badId[0]), 1);
            badId.splice(0, 1);
          }
          
          // update storage with correction
          if (storageOK) {
            localStorage.selectedDefinitions = Genki.appendix.jisho.selected;
          }
          
          // update with new length
          j = Genki.appendix.jisho.selected.length;
        }
      },
      
      
      // launches an exercise based on a selected list of words
      launchExercise : function () {
        var j = Genki.appendix.jisho.selected.length;
        
        // remove bad selectors before starting
        Genki.appendix.jisho.purgeBadSelectors();
        
        // initiate an exercise once 5 or more words have been selected
        if (j < 5) {
          GenkiModal.open({
            title : 'Please select more words.',
            content : 'Please select <b>' + (5 - j) + '</b> more word' + (5 - j == 1 ? '' : 's') + ' to begin a practice exercise.'
          });
          
        } else {
          GenkiModal.open({
            title : 'Begin Practice?',
            content : 'Are you ready to practice your selected words?',
            buttonText : 'Yes',
            keepOpen : true,
            
            callback : function () {
              var sel = Genki.appendix.jisho.selected,
                  quizlet = {}, i = 0, def, furi;

              for (; i < j; i++) {
                def = document.querySelector('#japanese-english [data-def="' + sel[i] + '"]');
                furi = def.querySelector('.def-furi i');

                quizlet[def.querySelector('.def-ja').innerHTML.replace(/<i>.*?<\/i>/, '') + (furi ? '|' + furi.innerHTML : '')] = def.querySelector('.def-en').innerHTML;
              }
              
              Genki.generateQuiz({
                format : 'vocab',
                type : ['multi', 'drag', 'writing', 'fill'],
                info : [Genki.lang.vocab_multi, Genki.lang.std_drag, Genki.lang.vocab_writing, Genki.lang.vocab_fill],

                quizlet : quizlet
              });
              
              Genki.appendix.showExercise();
            }
          });
        }
      },
      
      
      // opens a modal for managing/viewing the words selected in the dictionary
      manageWords : function () {
        GenkiModal.open({
          title : 'Manage Selected Words',
          content : '<ol id="selected_words_list" class="dict-search-results"></ol>',
          
          buttonText : 'Close',
          noFocus : true,

          customSize : {
            top : '5%',
            left : '10%',
            bottom : '5%',
            right : '10%'
          }
        });
        
        // remove bad selectors before showing current selection
        Genki.appendix.jisho.purgeBadSelectors();

        // disply currently selected words
        var list = document.getElementById('selected_words_list'),
            checked = storageOK && localStorage.selectedDefinitions ? localStorage.selectedDefinitions.split(',') : [],
            i = 0,
            j = Genki.appendix.jisho.selected.length,
            frag, def, ja, ja_def;
        
        if (j) {
          frag = document.createDocumentFragment();
          
          // parse selected definitions
          for (; i < j; i++) {
            def = document.createElement('LI');
            def.className = 'definition clear';
            def.dataset.def = Genki.appendix.jisho.selected[i];
            
            // selected definition data
            ja = Genki.jisho[Genki.appendix.jisho.selected[i].slice(0, 1)][Genki.appendix.jisho.selected[i].slice(1)];
            ja_def = ja.ja.split('|');
            
            def.innerHTML = 
              '<input class="def-selector genki_input_hidden" type="checkbox" onchange="Genki.appendix.jisho.updateCheckboxes(this, \'' + def.dataset.def + '\');"' + (checked.indexOf(def.dataset.def) != -1 ? 'checked' : '') + '>'+
              '<span tabindex="0" class="genki_pseudo_checkbox" onclick="this.previousSibling.click(); Genki.appendix.jisho.removeSelectedWord(this);" onkeypress="if (event.key == \'Enter\') { this.previousSibling.click(); Genki.appendix.jisho.removeSelectedWord(this); }"></span>'+
              '<span class="def-ja' + (ja_def[1] ? ' def-furi' : '') + '">'+
                ja_def[0]+
                (ja_def[1] ? '<i>' + ja_def[1] + '</i>' : '')+
              '</span>&nbsp;'+
              '<span class="def-en">' + ja.en + '</span>'+
              (ja.v ? ' <span class="def-vtype">[<i>' + ja.v + '</i>]</span>' : '')+
              '<span class="def-label">' + ja.l + '</span>';
            
            frag.appendChild(def);
          }
          
          list.appendChild(frag);
          list.querySelector('.genki_pseudo_checkbox').focus();
          
        } else {
          list.innerHTML = 'No words selected.';
        }
      },
      
      
      // removes selected dictionary word
      removeSelectedWord : function (caller) {
        var list = document.getElementById('selected_words_list');
        list.removeChild(caller.parentNode);
        
        if (!list.childNodes.length) {
          list.innerHTML = 'No words selected.';
        }
      },
      
      
      // restores preferences for the dictionary
      restoreSettings : function () {
        if (storageOK) {
          
          // dictionary mode pref.
          if (localStorage.genkiJishoMode && localStorage.genkiJishoMode != 'ja') {
            Genki.appendix.jisho.switchMode(localStorage.genkiJishoMode, true);
          }
          
          // restore selected definitions
          if (localStorage.selectedDefinitions) {
            Genki.appendix.jisho.selected = localStorage.selectedDefinitions.split(',');
          }
          
        }
      }
      
    },
    
    // hides the appendix page and shows the exercise
    showExercise : function () {
      document.getElementById('appendix-tool').style.display = 'none';
      document.getElementById('exercise').style.display = '';
    },
    
    
    // shows page after setup
    finishedLoading : function () {
      var loading = document.querySelector('.loading');
      loading.className = loading.className.replace('loading', '');
    }
  };
  
  // clone more exercises and add it to the appendix pages
  document.getElementById('appendix-tool').appendChild(document.querySelector('.more-exercises').cloneNode(true));
}(window, document));

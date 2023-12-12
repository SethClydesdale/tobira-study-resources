// # MODIFICATIONS FOR THE HOMEPAGE ONLY #
(function (window, document) {
  'use strict';
  
  // [DISABLED] # EDITION PREFERENCE #
  // stores the currently selected edition so the student can be correctly redirected when clicking home links
  /*if (storageOK) {
    localStorage.GenkiEdition = /lessons-3rd/.test(window.location.pathname) ? '3rd' : '2nd';
  }*/
  
  
  // # ANNOUNCEMENTS #
  if (document.getElementById('announcement')) {
    window.GenkiAnn = {
      rotation : false, // determines if the announcements rotate
      //edition : /lessons-3rd/.test(window.location.pathname) ? '3rd' : '2nd', // determines current edition

      // announcement messages
      // params:
      // date: [OPTIONAL] adds a date to the announcement, useful for highlighting updates and what not.
      // content: message body for the announcement; write your announcements here!
      // [NOT USED CURRENTLY; GSR remnant] edition: [OPTIONAL] restricts the announcement to a specific edition, possible values are: 3rd || 2nd, announcements are global by default
      msg : [
        {
          content : 'As of March 3rd, 2023, all exercises for Tobira\'s lessons are now available! If you encounter any issues or have a question, please feel free to contact me on <a href="https://github.com/SethClydesdale/tobira-study-resources/issues">GitHub</a>. I wish you all the best on your Japanese studies! 頑張って！٩( \'ω\' )و'
        },
      
        {
          content : 'Interested in learning Japanese? Check out <a href="' + getPaths() + 'help/japanese-guide/">our guide</a> for more information on how to learn the language, as well as useful tools that you can utilize in your studies!'
        },
        
        {
          content : 'Looking for more self-study resources? Visit the <a href="https://tobiraweb.9640.jp/">official website</a> for Tobira or check out some of the resources in the <a href="https://github.com/SethClydesdale/tobira-study-resources#resources-for-studying-japanese">readme</a> on GitHub.'
        },

        {
          content : 'Want to stay up to date on the latest changes made to Tobira Study Resources? You can follow updates via <a href="https://github.com/SethClydesdale/tobira-study-resources/commits/main">GitHub</a>, <a href="https://twitter.com/search?q=%23TobiraStudyResources%20from%3Asethc1995&src=typed_query&f=live">Twitter</a>, or <a href="https://ko-fi.com/sethc95/posts">Ko-fi</a>. Feel free to also contact us on <a href="https://github.com/SethClydesdale/tobira-study-resources/issues">GitHub\</a> if you have any questions or feedback.'
        },

        {
          content : 'Have a question about the site? Check out the <a href="' + getPaths() + 'help/">FAQ</a>! If you can\'t find an answer to your question, feel free to contact us via <a href="https://github.com/SethClydesdale/tobira-study-resources/issues">GitHub\'s issues</a> and we\'ll try to answer your question in a timely manner.'
        },

        {
          content : 'Find a bug or mistake on the site? Want to submit a suggestion or give us feedback? Check out the <a href="' + getPaths() + 'report/">report page</a> for more information. We\'d love to hear from you!'
        },

        {
          content : 'Don\'t have a network connection all the time? Tobira Study Resources can be used offline as well! Head on over to the <a href="' + getPaths() + 'download/">download page</a> to get the latest release.'
        },

        {
          content : 'If you found this tool helpful for studying with Tobira, please consider making <a href="' + getPaths() + 'donate/">a donation</a> to help support my work. Thank you!'
        }
      ],

      index : 0,
      list : document.getElementById('announce-list'),


      // shows the next announcement
      next : function (n, manual) {
        // hide old message
        GenkiAnn.msg[GenkiAnn.index].className += ' announce-hidden';

        // add +1 or -1 depending on the button press
        if (typeof n == 'number') {
          GenkiAnn.index += n;

          if (GenkiAnn.index == -1) {
            GenkiAnn.index = GenkiAnn.msg.length - 1;
          }
        } 

        // for automatic rotation increase index by 1
        else {
          GenkiAnn.index++;
        }

        // reset index if it exceeds the current announcements
        if (!GenkiAnn.msg[GenkiAnn.index]) {
          GenkiAnn.index = 0;
        }

        // show new message
        GenkiAnn.msg[GenkiAnn.index].className = GenkiAnn.msg[GenkiAnn.index].className.replace(' announce-hidden', '');

        // reset rotation if messages were moved manually
        if (GenkiAnn.rotation && manual) {
          window.clearInterval(GenkiAnn.rotator);
          GenkiAnn.rotate();
        }
      },


      // start announcement rotation
      rotate : function () {
        GenkiAnn.rotator = window.setInterval(GenkiAnn.next, 15000);
      },


      // sets up the announcements
      init : function () {
        // set up if more than 1 announcement
        if (GenkiAnn.msg.length > 1) {
          document.getElementById('announcement-controls').style.display = '';

          // parse announcements
          for (var i = 0, j = GenkiAnn.msg.length, ann = '', first = true; i < j; i++) {
            if (!GenkiAnn.msg[i].edition || GenkiAnn.msg[i].edition.toLowerCase() == GenkiAnn.edition) {
              ann += '<div class="announcement' + (first ? '' : ' announce-hidden') + '">'+
                (GenkiAnn.msg[i].date ? '<span class="date">' + GenkiAnn.msg[i].date + '</span>' : '')+
                GenkiAnn.msg[i].content+
              '</div>';

              // first announcement is shown, so hide the rest
              first && (first = false);
            }
          }

          // add announcements to the document
          GenkiAnn.list.insertAdjacentHTML('beforeend', ann);
          GenkiAnn.msg = document.querySelectorAll('.announcement');

          // commence rotation if enabled
          if (GenkiAnn.rotation) {
            GenkiAnn.rotate();
          }
        }
      }
    };

    // initialize the announcement module
    GenkiAnn.init();
  }
  
  
  // # QUICK SEARCH #
  if (document.getElementById('quick-search')) {
    window.QuickSearcher = {
      grammarIndex : /grammar-index/.test(window.location.href),
      search : document.getElementById('quick-search'),
      results : document.getElementById('quick-search-results'),
      hitsCounter : document.getElementById('quick-search-hits'),
      
      // set after definition
      li : null,
      exLen : null,
      
      // search for the specified value
      query : function (value) {
        // clear existing timeout
        if (window.GenkiSearchTimeout) {
          window.clearTimeout(GenkiSearchTimeout);
        }

        // wait 300ms before submitting search, just in case the user is still typing
        window.GenkiSearchTimeout = window.setTimeout(function() {
          var frag = document.createDocumentFragment(),
              hits = 0,
              i = 0,
              clone;

          // clear prior searches
          QuickSearcher.results.innerHTML = '';

          // loop over the exercises if a value is present
          if (value) {
            for (; i < QuickSearcher.exLen; i++) {
              if (QuickSearcher.li[i].innerText.toLowerCase().indexOf(value.toLowerCase()) != -1 && QuickSearcher.li[i].getElementsByTagName('A')[0] && !/note/.test(QuickSearcher.li[i].id)) {
                // clone the link (if on homepage) or create a new link (if on the grammar index)
                if (QuickSearcher.grammarIndex) {
                  clone = document.createElement('LI');
                  clone.innerHTML = '<a href="#' + QuickSearcher.li[i].id + '">' + QuickSearcher.li[i].innerText.replace(/|/g, '') + '</a>';
                } else {
                  clone = QuickSearcher.li[i].cloneNode(true); // clone the match for displaying in the results node
                }

                // add lesson number to exercise or grammar point
                clone.dataset.lesson = QuickSearcher.grammarIndex ? 'L' + QuickSearcher.li[i].id.replace(/l(\d+)-p\d+/, '$1') : clone.getElementsByTagName('A')[0].href.replace(/.*?\/(lesson-\d+).*|.*?\/(study-tools).*|.*?\/(appendix).*/, function (Match, $1, $2, $3) {
                  if ($1) {
                    return $1.charAt(0).toUpperCase() + $1.split('-').pop();

                  } else if ($2) {
                    return 'tool'

                  } else if ($3) {
                    return 'appendix'
                  }
                });

                // add tooltip in case the text gets cut off
                clone.title = clone.innerText;

                // add the clone to the fragment if it's valid
                if (!/^file|^http/.test(clone.dataset.lesson)) {
                  frag.appendChild(clone);
                  hits++; // increment hits
                }
              }
            }
          }

          // append the matched exercises or display an error message/hide the search results
          if (frag.childNodes.length) {
            QuickSearcher.results.appendChild(frag);

          } else {
            QuickSearcher.results.innerHTML = value ? '<li>No results found for "' + value + '".</li>' : '';
          }

          // update the hits counter and add a button to copy the search link
          QuickSearcher.hitsCounter.innerHTML = hits ? '(' + hits + ') '+
            '<a '+
              'class="fa" '+
              'style="color:#17A;" '+
              'href="#copy-search-link" '+
              'title="Copy the search link" '+
              'onclick="GenkiModal.open({'+
                'title : \'Copy Search Link\','+
                'content : \'<div class=&quot;center&quot;><p>You can copy the direct search link from the box below.</p>'+
                '<textarea id=&quot;copied-search-link&quot; onfocus=&quot;this.select();&quot; style=&quot;width:80%;height:100px;&quot;>' + (window.location.protocol + '//' + window.location.host + window.location.pathname) + '?search=' + encodeURIComponent(value) + '#quick-search-exercises</textarea></div>\','+
                'focus : \'#copied-search-link\''+
              '}); return false;"'+
            '>&#xf0ea;</a>' : '';

          delete window.GenkiSearchTimeout;
        }, 300);
      }
    };
    
    // set remaining data for search functionality
    QuickSearcher.li = document.querySelectorAll(QuickSearcher.grammarIndex ?  '.workbook-title' : '.lesson-exercises li');
    QuickSearcher.exLen = QuickSearcher.li.length;


    // set the value of the search field via the url (e.g. ?search=kanji)
    if (window.location.search) {
      var query = window.location.search.slice(1).split('&'),
          i = 0,
          j = query.length,
          keyVal;

      for (; i < j; i++) {
        keyVal = query[i].split('=');

        if (/^search$/i.test(keyVal[0])) {
          QuickSearcher.search.value = decodeURIComponent(keyVal[1]);
          break;
        }
      }
    }

    // search for exercises when the user inputs text
    QuickSearcher.search.oninput = function () {
      QuickSearcher.query(this.value);
    };

    // resume previous searches (in the event the user goes back in history) or those initiated by ?search=query
    if (QuickSearcher.search.value) {
      QuickSearcher.query(QuickSearcher.search.value);
    }
  }
  
  
  // # QUICK NAV SUB-SECTIONS #
  // Adds buttons for showing sub-sections in each lesson.
  for (var a = document.querySelectorAll('#quick-nav-list a'), i = 0, j = a.length, l; i < j; i++) {
    if (/lesson-(?:grammar-|)\d+/.test(a[i])) {
      l = a[i].href.replace(/.*?lesson-(?:grammar-|)(\d+).*/, '$1'); // get lesson number
      
      // create button and list
      a[i].insertAdjacentHTML('beforebegin', '<a class="sub-section-button fa" href="#toggle-sub-section" onclick="ToggleSubSection(this, '+ l +'); return false;" title="Toggle sub-sections" data-open="false"></a>');
      a[i].insertAdjacentHTML('afterend', '<ul style="display:none;"></ul>');
      
      // hide bullet style
      a[i].parentNode.className += ' noBullet';
    }
  }
  
  // toggles the display of each sub-section
  window.ToggleSubSection = function (caller, lesson) {
    var list = caller.parentNode.lastChild;
    
    // gets the sub-section title for the lesson
    if (!list.innerHTML) {
      // gets all sub section titles and parses them into a list
      for (var sec = document.querySelectorAll('#exercises-' + lesson + ' h3'), i = 0, j = sec.length, str = ''; i < j; i++) {
        str += '<li><a href="#' + sec[i].id + '">' + sec[i].innerText.replace(/\s\(.*\)$/, '').replace(/|/g, '') + '</a></li>';
      }
      
      // add the html to the list
      list.innerHTML = str;
    }
    
    // toggle list display and button icon
    if (/none/.test(list.style.display)) {
      list.style.display = 'block';
      caller.dataset.open = true;
      
    } else {
      list.style.display = 'none';
      caller.dataset.open = false;
    }
  };
  
  
  // # JUMP ARROWS #
  // Add arrows to each lesson title that will take the student back to the quick navigation
  AddJumpArrowsTo('.lesson-title', 'quick-nav', 'Jump to Quick Navigation');
  
  
  // # EXERCISE RESULTS #
  // Displays exercise results next to each exercise
  if (storageOK && localStorage.TobiraResults) {
    var exResults = JSON.parse(localStorage.TobiraResults), k, a;

    for (k in exResults) {
      a = document.querySelector('a[href*="' + k + '"]');

      if (a) {
        a.parentNode.insertAdjacentHTML('beforeend', '&nbsp;<span class="exercise-results result--' + (exResults[k] == 100 ? 'perfect' : exResults[k] >= 70 ? 'good' : exResults[k] >= 50 ? 'average' : 'low') + '" title="Exercise score"><i class="fa">' + (exResults[k] == 100 ? '&#xf005;' : exResults[k] >= 70 ? '&#xf00c;' : exResults[k] >= 50 ? '&#xf10c;' : '&#xf00d;') + '</i> ' + exResults[k] + '%</span>');
      }
    }
  }  
  
}(window, document));
// # MODIFICATIONS FOR THE HOMEPAGE ONLY #
(function (window, document) {
  'use strict';
  
  // [DISABLED] # EDITION PREFERENCE #
  // stores the currently selected edition so the student can be correctly redirected when clicking home links
  /*if (storageOK) {
    localStorage.GenkiEdition = /lessons-3rd/.test(window.location.pathname) ? '3rd' : '2nd';
  }*/
  
  
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
        str += '<li><a href="#' + sec[i].id + '">' + sec[i].innerHTML.replace(/\s\(.*\)$/, '').replace(/<a.*?>.*?<\/a>/g, '') + '</a></li>';
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
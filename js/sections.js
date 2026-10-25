/* Keep optional scenes intact while excluding disabled scenes from both views.
   This runs before book.js builds the chapter list and app.js starts effects. */
(function () {
  'use strict';
  var sections = (window.INVITE || {}).sections || {};
  Array.prototype.forEach.call(document.querySelectorAll('[data-optional-section]'), function (section) {
    section.hidden = sections[section.getAttribute('data-optional-section')] !== true;
  });
})();

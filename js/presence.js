/* Leaving the invitation is a temporary hold, not the guest's Pause choice.
   Share that distinction between the book, scroll view and music. */
(function () {
  'use strict';
  var doc = document, blurred = false, departed = false, away = doc.hidden;
  var listeners = [];
  function update() {
    var next = doc.hidden || blurred || departed;
    if (next === away) return;
    away = next;
    listeners.forEach(function (fn) { fn(away); });
  }
  window.InvitationPresence = {
    isAway: function () { return away; },
    subscribe: function (fn) { listeners.push(fn); }
  };
  doc.addEventListener('visibilitychange', function () {
    // Mobile browsers may restore visibility without a separate focus event.
    if (!doc.hidden) blurred = false;
    update();
  });
  window.addEventListener('blur', function () { blurred = true; update(); });
  window.addEventListener('focus', function () { blurred = false; update(); });
  window.addEventListener('pagehide', function () { departed = true; update(); });
  window.addEventListener('pageshow', function () { departed = false; blurred = false; update(); });
})();

/* An automatic tour with guest pause/resume controls. Uses elapsed time rather
   than frame counts so the pace stays the same on phones and desktops. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var controls = doc.getElementById('autoScrollControls');
  var button = doc.getElementById('autoScroll');
  var label = doc.getElementById('autoScrollLabel');
  var speed = doc.getElementById('autoScrollSpeed');
  var status = doc.getElementById('scrollStatus');
  if (!controls || !button || !window.requestAnimationFrame) return;

  var config = (window.INVITE || {}).autoScroll || {};
  var pace = Number(config.pixelsPerSecond);
  if (!isFinite(pace) || pace <= 0) pace = 80;
  var running = false, started = false, frame = 0, last = null, position = 0;
  var presence = window.InvitationPresence, finished = false;
  var ready = false, autoStartPending = config.startAutomatically !== false;

  function y() { return window.pageYOffset || root.scrollTop || 0; }
  function end() { return Math.max(0, Math.max(root.scrollHeight, doc.body.scrollHeight) - window.innerHeight); }
  function atEnd() { return y() >= end() - 1; }
  function render() {
    var replay = atEnd(), active = running && !finished;
    label.textContent = replay ? 'Replay' : active ? 'Pause scroll' : started ? 'Resume' : 'Auto-scroll';
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    button.setAttribute('aria-label', replay ? 'Replay auto-scroll from the beginning' : active ? 'Pause auto-scroll' : started ? 'Resume auto-scroll' : 'Start auto-scroll');
    controls.classList[active ? 'add' : 'remove']('on');
  }
  function pause(message) {
    autoStartPending = false;
    if (!running) return;
    running = false;
    window.cancelAnimationFrame(frame);
    frame = 0; last = null;
    root.classList.remove('is-auto-scrolling');
    render();
    status.textContent = message || 'Auto-scroll paused. Choose Resume to continue.';
  }
  function tick(time) {
    frame = 0;
    if (!running || presence.isAway()) { last = null; return; }
    // Continue from a guest's scroll or anchor jump rather than snapping back.
    if (Math.abs(y() - position) > 2) { position = y(); last = null; }
    // Retain fractional pixels: rounding every frame stalls slow speeds.
    if (last !== null) position += pace * Number(speed.value) * Math.min((time - last) / 1000, 0.05);
    last = time;
    var limit = end();
    position = Math.min(position, limit);
    window.scrollTo(0, position);
    if (position >= limit) {
      finished = true; last = null; render();
      status.textContent = 'You have reached the end of the invitation. Choose Replay to watch again.';
      return;
    }
    kick();
  }
  function kick() {
    if (!frame && running && !finished && !presence.isAway()) frame = window.requestAnimationFrame(tick);
  }
  function start() {
    autoStartPending = false;
    root.classList.add('is-auto-scrolling');
    if (atEnd()) window.scrollTo(0, 0);
    position = y(); last = null;
    running = true; started = true; finished = false;
    render();
    status.textContent = 'Auto-scroll started. Use Pause scroll to stop. The invitation waits while you are away and continues when you return.';
    var cue = doc.getElementById('cue');
    if (cue) cue.classList.remove('on');
    kick();
  }
  function autoStart() {
    if (ready && autoStartPending && !presence.isAway()) start();
  }
  button.addEventListener('click', function () { if (running && !finished) pause(); else start(); });
  speed.addEventListener('change', function () { status.textContent = 'Auto-scroll speed: ' + speed.options[speed.selectedIndex].text + '.'; });
  function followPosition() {
    if (Math.abs(y() - position) > 2) { position = y(); last = null; }
    if (!atEnd()) finished = false;
    render(); kick();
  }
  window.addEventListener('scroll', followPosition, { passive: true });
  window.addEventListener('resize', followPosition);
  window.addEventListener('hashchange', followPosition);
  presence.subscribe(function (away) {
    last = null;
    if (away) { window.cancelAnimationFrame(frame); frame = 0; }
    else { position = y(); autoStart(); kick(); }
  });
  // app.js signals after layout and any initial chapter-link positioning.
  window.AutoScroll = {
    isOn: function () { return running; },
    ready: function () { ready = true; autoStart(); }
  };
  controls.hidden = false;
  render();
})();

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
  var ready = false, autoStartPending = config.startAutomatically !== false;

  function y() { return window.pageYOffset || root.scrollTop || 0; }
  function end() { return Math.max(0, Math.max(root.scrollHeight, doc.body.scrollHeight) - window.innerHeight); }
  function atEnd() { return y() >= end() - 1; }
  function render() {
    var replay = atEnd();
    label.textContent = running ? 'Pause scroll' : replay ? 'Replay' : started ? 'Resume' : 'Auto-scroll';
    button.setAttribute('aria-pressed', running ? 'true' : 'false');
    button.setAttribute('aria-label', running ? 'Pause auto-scroll' : replay ? 'Replay auto-scroll from the beginning' : started ? 'Resume auto-scroll' : 'Start auto-scroll');
    controls.classList[running ? 'add' : 'remove']('on');
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
    if (!running) return;
    // Retain fractional pixels: rounding every frame stalls slow speeds.
    if (last !== null) position += pace * Number(speed.value) * Math.min((time - last) / 1000, 0.05);
    last = time;
    var limit = end();
    position = Math.min(position, limit);
    window.scrollTo(0, position);
    if (position >= limit) { pause('You have reached the end of the invitation. Choose Replay to watch again.'); return; }
    frame = window.requestAnimationFrame(tick);
  }
  function start() {
    if (doc.hidden) return;
    autoStartPending = false;
    root.classList.add('is-auto-scrolling');
    if (atEnd()) window.scrollTo(0, 0);
    position = y(); last = null;
    running = true; started = true;
    render();
    status.textContent = 'Auto-scroll started. Use Pause scroll, scroll manually, or press Escape to pause.';
    var cue = doc.getElementById('cue');
    if (cue) cue.classList.remove('on');
    frame = window.requestAnimationFrame(tick);
  }
  function autoStart() {
    if (ready && autoStartPending && !doc.hidden) start();
  }
  function inControls(target) {
    var music = doc.getElementById('music');
    return controls.contains(target) || (music && music.contains(target));
  }
  button.addEventListener('click', function () { if (running) pause(); else start(); });
  speed.addEventListener('change', function () { status.textContent = 'Auto-scroll speed: ' + speed.options[speed.selectedIndex].text + '.'; });
  doc.addEventListener('wheel', function () { pause(); }, { passive: true });
  // Taps and focus changes can unlock music without stopping the tour.
  // Real touch scrolling is handled by the scroll-position check below.
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || (!inControls(e.target) && /^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| |Spacebar)$/.test(e.key))) pause();
  });
  window.addEventListener('scroll', function () {
    // Also catch scrollbar dragging and navigation by other page controls.
    if (running && Math.abs(y() - position) > 2) pause();
    if (!running) render();
  }, { passive: true });
  window.addEventListener('resize', function () { position = y(); last = null; render(); });
  window.addEventListener('hashchange', function () { pause(); });
  window.addEventListener('pagehide', function () { pause(); });
  doc.addEventListener('visibilitychange', function () {
    if (doc.hidden) { if (running) pause(); }
    else autoStart();
  });
  if (window.matchMedia) {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var motionChanged = function () { if (reduced.matches) pause(); };
    if (reduced.addEventListener) reduced.addEventListener('change', motionChanged);
    else if (reduced.addListener) reduced.addListener(motionChanged);
  }
  // app.js signals after layout and any initial chapter-link positioning.
  window.AutoScroll = {
    isOn: function () { return running; }, pause: pause,
    ready: function () { ready = true; autoStart(); }
  };
  controls.hidden = false;
  render();
})();

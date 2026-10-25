/* A guest-controlled tour of the invitation. Uses elapsed time rather
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
    if (!running) return;
    running = false;
    window.cancelAnimationFrame(frame);
    frame = 0; last = null;
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
    if (atEnd()) window.scrollTo(0, 0);
    position = y(); last = null;
    running = true; started = true;
    render();
    status.textContent = 'Auto-scroll started. Scroll, touch the page, or press Escape to pause.';
    var cue = doc.getElementById('cue');
    if (cue) cue.classList.remove('on');
    frame = window.requestAnimationFrame(tick);
  }
  function inControls(target) {
    var music = doc.getElementById('music');
    return controls.contains(target) || (music && music.contains(target));
  }
  button.addEventListener('click', function () { if (running) pause(); else start(); });
  speed.addEventListener('change', function () { status.textContent = 'Auto-scroll speed: ' + speed.options[speed.selectedIndex].text + '.'; });
  doc.addEventListener('wheel', function () { pause(); }, { passive: true });
  function manual(e) { if (!inControls(e.target)) pause(); }
  if (window.PointerEvent) doc.addEventListener('pointerdown', manual, { passive: true });
  else {
    doc.addEventListener('mousedown', manual);
    doc.addEventListener('touchstart', manual, { passive: true });
  }
  doc.addEventListener('touchmove', function () { pause(); }, { passive: true });
  doc.addEventListener('focusin', manual);
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
  doc.addEventListener('visibilitychange', function () { if (doc.hidden) pause(); });
  if (window.matchMedia) {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var motionChanged = function () { if (reduced.matches) pause(); };
    if (reduced.addEventListener) reduced.addEventListener('change', motionChanged);
    else if (reduced.addListener) reduced.addListener(motionChanged);
  }
  // No automatic start, including for guests who prefer reduced motion.
  window.AutoScroll = { isOn: function () { return running; }, pause: pause };
  controls.hidden = false;
  render();
})();

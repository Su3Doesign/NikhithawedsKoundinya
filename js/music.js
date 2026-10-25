/* Play only the owner's configured recording. Try on opening, then use the
   first interaction if the browser requires a gesture for audible playback. */
(function () {
  'use strict';
  var config = (window.INVITE || {}).music || {};
  var source = typeof config.src === 'string' ? config.src.trim() : '';
  var volume = typeof config.volume === 'number' && isFinite(config.volume) ? Math.max(0, Math.min(1, config.volume)) : 0.36;
  var requested = false, playing = false, requestId = 0;
  var message = '', listener = null, retryOnInteraction = false;
  var track = source ? new Audio(source) : null;

  function notify() { if (listener) listener(); }
  function failed(id, error, automatic) {
    if (id !== requestId || !requested) return;
    requested = false; playing = false;
    track.pause();
    var blocked = error && error.name === 'NotAllowedError';
    retryOnInteraction = blocked && automatic;
    message = blocked ? 'Tap anywhere on the invitation to start music.' : 'The music could not load. Tap Play music to retry.';
    notify();
  }
  function setTrack(want, automatic) {
    var id = ++requestId;
    retryOnInteraction = false;
    requested = !!track && want; message = '';
    if (!track) { notify(); return; }
    if (!want) { track.pause(); playing = false; notify(); return; }
    notify();
    try {
      if (track.error) track.load();
      var pending = track.play();
      if (pending && pending.catch) pending.catch(function (error) { failed(id, error, automatic); });
    } catch (error) { failed(id, error, automatic); }
  }

  window.Music = {
    supported: function () { return !!track; },
    play: function () { setTrack(true, false); },
    pause: function () { setTrack(false, false); },
    toggle: function () { setTrack(!requested, false); },
    isOn: function () { return playing; },
    isPending: function () { return requested && !playing; },
    error: function () { return message; },
    subscribe: function (fn) { listener = fn; notify(); },
    chime: function () {} // Never mix synthesized sounds into the recording.
  };
  if (!track) return;

  track.preload = 'auto'; track.loop = true; track.volume = volume;
  track.setAttribute('playsinline', '');
  track.addEventListener('playing', function () {
    if (!requested) { track.pause(); return; }
    playing = true; retryOnInteraction = false; message = ''; notify();
  });
  track.addEventListener('waiting', function () { playing = false; notify(); });
  track.addEventListener('pause', function () {
    if (track.paused) { playing = false; notify(); }
  });
  track.addEventListener('error', function () { failed(requestId, track.error, false); });

  function firstInteraction(event) {
    if (!retryOnInteraction || document.hidden) return;
    // The music button has its own toggle; avoid playing and then pausing it.
    if (event.target.closest && event.target.closest('#music')) return;
    if (event.type === 'keydown' && (event.altKey || event.ctrlKey || event.metaKey || event.key === 'Escape')) return;
    setTrack(true, true);
  }
  document.addEventListener('pointerdown', firstInteraction, true);
  document.addEventListener('keydown', firstInteraction, true);
  // Stop in background tabs; only an explicit play resumes after a pause.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) setTrack(false, false);
  });
  window.addEventListener('pagehide', function () { setTrack(false, false); });
  if (!document.hidden) setTrack(true, true);
})();

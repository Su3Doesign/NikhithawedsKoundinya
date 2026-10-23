/* ------------------------------------------------------------------
   A tanpura, synthesised: four plucked strings (Pa, Sa, Sa, low Sa) by
   Karplus-Strong, a soft room, and a small temple bell for the moments
   that call for one. Off until the guest turns it on.
   ------------------------------------------------------------------ */
(function () {
  'use strict';
  var ctx = null, master = null, room = null, on = false, timer = 0, bufs = null;

  function pluck(freq, dur, bright) {
    var sr = ctx.sampleRate, n = Math.floor(sr * dur), out = ctx.createBuffer(1, n, sr), d = out.getChannelData(0);
    var N = Math.max(2, Math.round(sr / freq)), line = new Float32Array(N);
    for (var i = 0; i < N; i++) line[i] = (Math.random() * 2 - 1) * (0.6 + 0.4 * Math.sin(i / N * Math.PI));
    var p = 0, prev = 0, decay = 0.9986;
    for (var k = 0; k < n; k++) {
      var cur = line[p];
      var nxt = line[(p + 1) % N];
      var avg = (cur + nxt) * 0.5;
      // a touch of the bridge's buzz (jawari): soft-clip the loop a little
      var v = avg * decay;
      v = v + bright * (v - prev) * 0.5;
      v = Math.tanh(v * 1.25) / 1.25;
      line[p] = v; prev = v;
      d[k] = cur * Math.min(1, k / 60);
      p = (p + 1) % N;
    }
    return out;
  }

  function impulse(sec) {
    var sr = ctx.sampleRate, n = Math.floor(sr * sec), b = ctx.createBuffer(2, n, sr);
    for (var ch = 0; ch < 2; ch++) {
      var d = b.getChannelData(ch);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6);
    }
    return b;
  }

  function init() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    var comp = ctx.createDynamicsCompressor();
    room = ctx.createConvolver(); room.buffer = impulse(2.8);
    var wet = ctx.createGain(); wet.gain.value = 0.35;
    var dry = ctx.createGain(); dry.gain.value = 0.8;
    master.connect(dry); master.connect(room); room.connect(wet);
    dry.connect(comp); wet.connect(comp); comp.connect(ctx.destination);
    var sa = 138.59;    // C# : a common sruti
    bufs = [pluck(sa * 0.75, 6, 0.25), pluck(sa, 6, 0.3), pluck(sa, 6, 0.3), pluck(sa / 2, 7, 0.2)];
    return true;
  }

  function play(buf, at, gain) {
    var s = ctx.createBufferSource(); s.buffer = buf;
    var g = ctx.createGain(); g.gain.value = gain;
    s.connect(g); g.connect(master); s.start(at);
  }

  function cycle() {
    if (!on) return;
    var t = ctx.currentTime + 0.05, step = 0.72;
    play(bufs[0], t, 0.55);
    play(bufs[1], t + step + Math.random() * 0.03, 0.5);
    play(bufs[2], t + step * 2 + Math.random() * 0.03, 0.5);
    play(bufs[3], t + step * 3 + Math.random() * 0.04, 0.7);
    timer = setTimeout(cycle, step * 4 * 1000 + 600);
  }

  function bell(strength) {
    if (!ctx || !on) return;
    var t = ctx.currentTime, base = 784, parts = [1, 2.32, 4.25, 6.63, 9.38], amps = [1, 0.5, 0.3, 0.16, 0.08];
    parts.forEach(function (m, i) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = base * m;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.09 * (strength || 1) * amps[i], t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2 / (1 + i * 0.6));
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 3.4);
    });
  }

  function set(want) {
    if (want && !init()) return false;
    if (!ctx) return false;
    if (ctx.state === 'suspended') ctx.resume();
    on = want;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(want ? 0.5 : 0, t + (want ? 1.8 : 0.6));
    clearTimeout(timer);
    if (want) cycle();
    return on;
  }

  window.Sound = { set: set, bell: bell, isOn: function () { return on; } };
})();

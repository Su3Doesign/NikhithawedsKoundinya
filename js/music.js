/* ------------------------------------------------------------------
   Music, made in the browser: a slow shehnai line over soft strings
   and a tanpura drone, in a minor raga (D, with komal ga, dha and ni).
   It is an original tune, written to be quiet: long notes, slides
   between them, and rests. Off until the guest taps the button.
   ------------------------------------------------------------------ */
(function () {
  'use strict';
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master = null, verb = null, dry = null, on = false, timer = 0, next = 0, step = 0, silent = null, plucks = null;
  var SA = 293.66;                         // D4
  var BEAT = 60 / 62;

  function hz(semi) { return SA * Math.pow(2, semi / 12); }

  /* the tune: [semitones from Sa, beats], null for a rest.
     S=0 R=2 g=3 M=5 P=7 d=8 n=10 S'=12 R'=14 */
  var PHRASES = [
    { notes: [[7, 1.5], [8, 0.5], [7, 1], [5, 1], [3, 1.5], [5, 0.5], [3, 1], [2, 1], [0, 3], [null, 1]],
      chords: [[0, 'Dm', 4], [4, 'Gm', 4], [8, 'Dm', 5]] },
    { notes: [[2, 1], [3, 1], [5, 1], [7, 1], [10, 1.5], [8, 0.5], [7, 2], [null, 1]],
      chords: [[0, 'Bb', 4], [4, 'C', 5]] },
    { notes: [[7, 1], [10, 1], [12, 2], [14, 1], [12, 0.5], [10, 0.5], [8, 1], [7, 1], [5, 3], [null, 1]],
      chords: [[0, 'F', 4], [4, 'C', 4], [8, 'Bb', 4]] },
    { notes: [[3, 1], [5, 1], [7, 1.5], [5, 0.5], [3, 1], [2, 1], [0, 3], [null, 2]],
      chords: [[0, 'Gm', 4], [4, 'Am', 2], [6, 'Dm', 5]] },
    { notes: [[null, 7]], chords: [[0, 'Dm', 4], [4, 'Bb', 4]] }
  ];
  // chord tones, as semitones from D3
  var CH = { Dm: [0, 3, 7], Gm: [5, 8, 12], Bb: [8, 12, 15], C: [10, 14, 17], F: [3, 7, 10], Am: [7, 10, 14] };

  function impulse(sec) {
    var sr = ctx.sampleRate, n = Math.floor(sr * sec), b = ctx.createBuffer(2, n, sr);
    for (var ch = 0; ch < 2; ch++) {
      var d = b.getChannelData(ch);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.8);
    }
    return b;
  }

  function pluck(freq, dur) {
    var sr = ctx.sampleRate, n = Math.floor(sr * dur), out = ctx.createBuffer(1, n, sr), d = out.getChannelData(0);
    var N = Math.max(2, Math.round(sr / freq)), line = new Float32Array(N), p = 0;
    for (var i = 0; i < N; i++) line[i] = Math.random() * 2 - 1;
    for (var k = 0; k < n; k++) {
      var cur = line[p], nx = line[(p + 1) % N];
      line[p] = Math.tanh((cur + nx) * 0.4985 * 1.2) / 1.2;
      d[k] = cur * Math.min(1, k / 80);
      p = (p + 1) % N;
    }
    return out;
  }

  function init() {
    if (ctx) return true;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    var comp = ctx.createDynamicsCompressor();
    verb = ctx.createConvolver(); verb.buffer = impulse(3.4);
    var wet = ctx.createGain(); wet.gain.value = 0.42;
    dry = ctx.createGain(); dry.gain.value = 0.7;
    master.connect(dry); master.connect(verb); verb.connect(wet);
    dry.connect(comp); wet.connect(comp); comp.connect(ctx.destination);
    plucks = [pluck(SA / 2 * 1.5, 5), pluck(SA / 2, 5), pluck(SA / 2, 5), pluck(SA / 4, 6)];
    return true;
  }

  /* the shehnai: a buzzy reed tone through nasal formants, sliding between notes */
  function shehnai(t0, notes) {
    var osc = ctx.createOscillator(); osc.type = 'sawtooth';
    var vib = ctx.createOscillator(), vibAmt = ctx.createGain(); vib.frequency.value = 5.4; vibAmt.gain.value = 0;
    vib.connect(vibAmt); vibAmt.connect(osc.frequency);
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 340;
    var sum = ctx.createGain(); sum.gain.value = 1;
    [[1050, 2.6, 1], [2500, 3.5, 0.7], [3700, 4, 0.35]].forEach(function (f) {
      var b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f[0]; b.Q.value = f[1];
      var g = ctx.createGain(); g.gain.value = f[2];
      hp.connect(b); b.connect(g); g.connect(sum);
    });
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200;
    var amp = ctx.createGain(); amp.gain.value = 0;
    osc.connect(hp); sum.connect(lp); lp.connect(amp); amp.connect(master);

    var t = t0, first = true, end = t0;
    notes.forEach(function (n) {
      var d = n[1] * BEAT;
      if (n[0] === null) { amp.gain.setTargetAtTime(0, t, 0.09); t += d; first = true; return; }
      var f = hz(n[0]);
      if (first) { osc.frequency.setValueAtTime(f * 0.97, t); }
      else if (Math.random() < 0.35 && d > BEAT * 0.9) {
        // a kan: touch the note above before landing
        osc.frequency.setTargetAtTime(f * Math.pow(2, 2 / 12), t, 0.015);
        t += 0.06;
      }
      osc.frequency.setTargetAtTime(f, t, first ? 0.05 : 0.045);       // the slide into the note
      amp.gain.setTargetAtTime(first ? 0.2 : 0.17, t, first ? 0.07 : 0.03);
      if (d > BEAT * 0.9) {                                            // long notes open into vibrato
        vibAmt.gain.setTargetAtTime(0, t, 0.02);
        vibAmt.gain.setTargetAtTime(f * 0.007, t + 0.35, 0.25);
        amp.gain.setTargetAtTime(0.2, t + 0.3, 0.4);
      } else {
        vibAmt.gain.setTargetAtTime(f * 0.002, t, 0.05);
      }
      if (d > BEAT * 1.4) amp.gain.setTargetAtTime(0.12, t + d - 0.25, 0.12);   // a breath before the next
      first = false; t += d; end = t;
    });
    amp.gain.setTargetAtTime(0, end, 0.18);
    osc.start(t0); vib.start(t0);
    osc.stop(end + 1.5); vib.stop(end + 1.5);
    return t;
  }

  /* strings: soft, slow-opening chords under the line */
  function strings(t0, name, beats) {
    var tones = CH[name] || CH.Dm, d = beats * BEAT;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.Q.value = 0.5;
    var amp = ctx.createGain(); amp.gain.value = 0;
    lp.connect(amp); amp.connect(master);
    amp.gain.setValueAtTime(0, t0);
    amp.gain.linearRampToValueAtTime(0.05, t0 + Math.min(1.6, d * 0.5));
    amp.gain.setValueAtTime(0.05, t0 + d);
    amp.gain.linearRampToValueAtTime(0, t0 + d + 2.2);
    var oscs = [];
    tones.forEach(function (s) {
      [-7, 7].forEach(function (cents) {
        var o = ctx.createOscillator(); o.type = 'sawtooth';
        o.frequency.value = SA / 2 * Math.pow(2, (s * 100 + cents) / 1200);
        o.connect(lp); oscs.push(o);
      });
    });
    var sub = ctx.createOscillator(), sg = ctx.createGain(); sub.type = 'sine'; sub.frequency.value = SA / 4 * Math.pow(2, tones[0] / 12); sg.gain.value = 0.5;
    sub.connect(sg); sg.connect(lp); oscs.push(sub);
    oscs.forEach(function (o) { o.start(t0); o.stop(t0 + d + 2.4); });
  }

  /* the tanpura, low and steady */
  function drone(t0, until) {
    var t = t0, k = 0, gains = [0.16, 0.14, 0.14, 0.2];
    while (t < until) {
      var s = ctx.createBufferSource(), g = ctx.createGain();
      s.buffer = plucks[k % 4]; g.gain.value = gains[k % 4];
      s.connect(g); g.connect(master); s.start(t);
      t += BEAT * 1.2; k++;
    }
  }

  function schedule() {
    if (!on) return;
    while (next < ctx.currentTime + 1.2) {
      var ph = PHRASES[step % PHRASES.length], t0 = next;
      var beats = ph.notes.reduce(function (a, n) { return a + n[1]; }, 0);
      ph.chords.forEach(function (c) { strings(t0 + c[0] * BEAT, c[1], c[2]); });
      if (ph.notes[0][0] !== null) shehnai(t0 + BEAT * 0.15, ph.notes);
      drone(t0, t0 + beats * BEAT);
      next = t0 + beats * BEAT;
      step++;
    }
    timer = setTimeout(schedule, 300);
  }

  // iPhones on silent mute Web Audio unless a media element is playing: play a silent one alongside
  function unmuteIOS() {
    try {
      if (silent) { silent.play(); return; }
      var sr = 8000, n = 4000, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
      function w(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
      w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true);
      v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
      v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
      silent = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
      silent.loop = true; silent.setAttribute('playsinline', '');
      var p = silent.play(); if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  function set(want) {
    if (want && !init()) return false;
    if (!ctx) return false;
    on = want;
    var t = ctx.currentTime;
    clearTimeout(timer);
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    if (want) {
      unmuteIOS();
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      master.gain.linearRampToValueAtTime(0.36, t + 2.5);
      next = Math.max(next, ctx.currentTime + 0.25);
      schedule();
    } else {
      master.gain.linearRampToValueAtTime(0, t + 0.8);
      if (silent) try { silent.pause(); } catch (e) {}
      setTimeout(function () { if (!on && ctx.suspend) ctx.suspend(); }, 1200);
    }
    return on;
  }

  /* a small temple bell, only when the music is on */
  function chime(strength) {
    if (!ctx || !on) return;
    var t = ctx.currentTime, base = 1046, parts = [1, 2.32, 4.25, 6.63], amps = [1, 0.45, 0.25, 0.12];
    parts.forEach(function (m, i) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = base * m;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05 * (strength || 1) * amps[i], t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6 / (1 + i * 0.6));
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 2.8);
    });
  }

  window.Music = {
    supported: function () { return !!AC; },
    toggle: function () { return set(!on); },
    isOn: function () { return on; },
    chime: chime
  };
})();

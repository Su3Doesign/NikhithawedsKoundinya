/* ------------------------------------------------------------------
   Talambralu, staged with real grains. Each line of the verse brings a
   handful thrown up from below: hers from the left, his from the right,
   each a little higher than the last, the way the game is played, and
   the last one from both together. Grains only show in the band between
   the heading and the verse, so the words stay clear.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  function create(canvas) {
    var ctx = canvas.getContext('2d');
    var W = 1, H = 1, dpr = 1, spr = null, big = 1;
    var band = { top: 0, bottom: 1 };
    var P = [], last = 0, drizzle = false, dz = 0;
    var api = {};

    api.resize = function () {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      big = W < 700 ? 1 : 1.15;
      spr = Rice.set(11 * big, 4.3 * big);
    };
    api.band = function (top, bottom) { band.top = top; band.bottom = bottom; };
    api.drizzle = function (on) { drizzle = on; };

    function grain(x, y, vx, vy, kind) {
      P.push({ x: x, y: y, vx: vx, vy: vy, k: kind, a: Math.random() * 6.28, va: (Math.random() - 0.5) * 9,
        f: Math.random() * 6.28, vf: (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 9),
        sc: 0.8 + Math.random() * 0.45, life: 6 });
    }

    /* a handful thrown from x (fraction of the width), rising to h (fraction
       of the band's height), leaning toward the middle */
    api.toss = function (fx, h, n, mix, delay) {
      var x0 = W * fx, y0 = band.bottom + 30, top = band.bottom - (band.bottom - band.top) * h;
      var v0 = Math.sqrt(2 * 1250 * Math.max(60, y0 - top)) * 1.1;
      var lean = (0.5 - fx) * 0.9;
      for (var i = 0; i < n; i++) {
        (function (i) {
          setTimeout(function () {
            var ang = -Math.PI / 2 + lean + (Math.random() - 0.5) * 0.55;
            var sp = v0 * (0.78 + Math.random() * 0.26);
            grain(x0 + (Math.random() - 0.5) * 50, y0 + Math.random() * 10, Math.cos(ang) * sp, Math.sin(ang) * sp, Rice.pick(mix || Rice.MIX));
          }, (delay || 0) + i / n * 260);
        })(i);
      }
    };

    // a tap: a small handful from where the finger is
    api.tap = function (cx, cy) {
      var r = canvas.getBoundingClientRect(), x = cx - r.left, y = cy - r.top;
      for (var i = 0; i < 46; i++) {
        var ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.5, sp = 380 + Math.random() * 520;
        grain(x, y, Math.cos(ang) * sp, Math.sin(ang) * sp, Rice.pick(Rice.MIX));
      }
    };

    api.tick = function (now) {
      var t = now / 1000, dt = Math.min(0.05, last ? t - last : 0.016); last = t;
      if (drizzle) {                       // a few stray grains still coming down
        dz += dt * 4;
        while (dz > 1) { dz -= 1; grain(W * (0.12 + Math.random() * 0.76), band.top - 10, (Math.random() - 0.5) * 30, 60 + Math.random() * 80, Rice.pick(Rice.MIX)); }
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var drag = Math.pow(0.5, dt);
      for (var i = P.length - 1; i >= 0; i--) {
        var g = P[i];
        g.vy += 1250 * dt; g.vx *= drag; g.vy *= drag;
        g.x += g.vx * dt; g.y += g.vy * dt; g.a += g.va * dt; g.f += g.vf * dt; g.life -= dt;
        if (g.life <= 0 || (g.vy > 0 && g.y > band.bottom + 40) || g.y > H + 20) { P.splice(i, 1); continue; }
        Rice.draw(ctx, spr[g.k], dpr, g.x, g.y, g.a, g.f, g.sc, 1);
      }
      // keep the words clear: rice fades out above and below the band
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'destination-in';
      var fade = Math.min(70, (band.bottom - band.top) * 0.2);
      var gr = ctx.createLinearGradient(0, band.top * dpr, 0, band.bottom * dpr);
      var a = fade / Math.max(1, band.bottom - band.top);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(a, 'rgba(0,0,0,1)');
      gr.addColorStop(1 - a, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      return P.length > 0;
    };

    api.count = function () { return P.length; };
    api.resize();
    return api;
  }

  window.Talambralu = { create: create };
})();

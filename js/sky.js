/* ------------------------------------------------------------------
   Arundhati: the Saptarishi (the Big Dipper) from their real places in
   the sky, turned the way they stand over the northern horizon from
   India on a summer evening: the bowl on the left, upside down, the
   handle climbing to the right. The sages are named in Telugu.

   Then a long zoom into Vasishtha (Mizar) until faint Arundhati (Alcor)
   separates beside him, a little to his right and below, the way the
   bride stands beside the groom in the photograph that follows. The two
   stars draw together into one light, and the moon opens from it.

   Canvas 2D; draw(progress) is called from the scroll timeline.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  // [name in Telugu, name, RA deg, Dec deg, magnitude, where its name goes]
  var STARS = [
    ['క్రతు', 'Kratu', 165.93, 61.75, 1.8, 'b'],      // Dubhe
    ['పులహ', 'Pulaha', 165.46, 56.38, 2.4, 'a'],      // Merak
    ['పులస్త్య', 'Pulastya', 178.46, 53.69, 2.4, 'a'], // Phecda
    ['అత్రి', 'Atri', 183.86, 57.03, 3.3, 'b'],        // Megrez
    ['అంగీరస', 'Angiras', 193.51, 55.96, 1.8, 'a'],    // Alioth
    ['వసిష్ఠ', 'Vasishtha', 200.98, 54.93, 2.2, 'b'],  // Mizar
    ['మరీచి', 'Marichi', 206.89, 49.31, 1.9, 'l'],     // Alkaid
  ];
  var ALCOR = ['అరుంధతి', 'Arundhati', 201.31, 54.99, 4.0];
  var LINES = [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]];
  var RA0 = 186.5, DEC0 = 55.6, COS = Math.cos(DEC0 * Math.PI / 180);

  // the chart turned half round: north down, east to the right
  function proj(ra, dec) { return [(ra - RA0) * COS, (dec - DEC0)]; }

  function clamp(v) { return Math.min(1, Math.max(0, v)); }
  function smooth(t) { t = clamp(t); return t * t * (3 - 2 * t); }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function sprite(rgb, size) {
    var c = document.createElement('canvas'); c.width = c.height = size;
    var x = c.getContext('2d'), g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(' + rgb + ',1)'); g.addColorStop(0.12, 'rgba(' + rgb + ',.9)');
    g.addColorStop(0.35, 'rgba(' + rgb + ',.22)'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    x.fillStyle = g; x.fillRect(0, 0, size, size);
    return c;
  }

  function create(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var W = 1, H = 1, dpr = 1, scale = 10, cx = 0, cy = 0, zmax = 30;
    var warm = sprite('255,244,222', 64), cool = sprite('200,215,255', 64), gold = sprite('255,214,150', 64);
    var S = STARS.map(function (s) { var p = proj(s[2], s[3]); return { te: s[0], en: s[1], x: p[0], y: p[1], mag: s[4], at: s[5] }; });
    var A = (function () { var p = proj(ALCOR[2], ALCOR[3]); return { te: ALCOR[0], en: ALCOR[1], x: p[0], y: p[1], mag: ALCOR[4] }; })();
    var V = S[5];
    var mid = { x: (V.x + A.x) / 2, y: (V.y + A.y) / 2 };
    var sep = Math.hypot(A.x - V.x, A.y - V.y);

    // three layers of field stars; the deeper ones only show as we zoom
    var rnd = rng(7), field = [];
    for (var L = 0; L < 3; L++) {
      var n = Math.round([700, 900, 1400][L] * (opts.low ? 0.5 : 1)), span = [70, 14, 2.4][L];
      for (var i = 0; i < n; i++) {
        var ox = L === 0 ? 0 : mid.x, oy = L === 0 ? 0 : mid.y;
        field.push({ x: ox + (rnd() - 0.5) * span * (L === 0 ? 1.4 : 1), y: oy + (rnd() - 0.5) * span, m: rnd(), tw: rnd() * 6.28, L: L, c: rnd() < 0.25 ? 1 : 0 });
      }
    }

    var focus = { x: 0, y: 0, r: 100, set: false };
    var mx = 0, my = 0;
    var api = {};

    api.pointer = function (x, y) { mx = x; my = y; };
    // where the pair must end up on screen (the centre of the moon), and the moon's radius
    api.focus = function (x, y, r) { focus.x = x; focus.y = y; focus.r = r; focus.set = true; };
    api.resize = function () {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height; dpr = opts.dpr || Math.min(window.devicePixelRatio || 1, 1.5);
      if (!W || !H) return;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      // fit the dipper (about 24 x 13 degrees) below the heading
      scale = Math.min(W * 0.76 / 25, H * 0.4 / 13);
      cx = W / 2; cy = H * (W < 700 ? 0.58 : 0.57);
      // zoom until the two stars stand well apart
      zmax = Math.min(60, Math.max(12, Math.min(W, H) * 0.2 / (sep * scale)));
      if (!focus.set) { focus.x = W / 2; focus.y = H * 0.3; }
    };

    function star(x, y, r, spr, a) {
      if (a <= 0) return;
      ctx.globalAlpha = a;
      ctx.drawImage(spr, x - r, y - r, r * 2, r * 2);
    }

    api.draw = function (p, t) {
      t = t || 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var lineP = clamp((p - 0.02) / 0.2);
      var nameP = clamp((p - 0.14) / 0.12);
      var ez = smooth((p - 0.3) / 0.25);
      var Z = Math.exp(Math.log(zmax) * ez);
      var big = smooth((ez - 0.6) / 0.4) * (1 - smooth((p - 0.6) / 0.05));
      var merge = smooth((p - 0.62) / 0.09);           // the two stars come together
      var dark = smooth((p - 0.64) / 0.1);             // moonlight drowns the faint stars
      var gone = smooth((p - 0.72) / 0.06);            // the merged light hands over to the moon

      // the pair's midpoint travels from its place in the dipper to the moon
      var natX = cx + mid.x * scale, natY = cy + mid.y * scale;
      var Fx = natX + (focus.x - natX) * ez, Fy = natY + (focus.y - natY) * ez;
      var px = mx * 10 * (1 - ez), py = my * 8 * (1 - ez);
      function sx(x) { return Fx + (x - mid.x) * scale * Z + px; }
      function sy(y) { return Fy + (y - mid.y) * scale * Z + py; }

      // field stars
      for (var i = 0; i < field.length; i++) {
        var f = field[i];
        var vis = f.L === 0 ? 1 : f.L === 1 ? clamp((Z - 2) / 4) : clamp((Z - 10) / 10);
        if (vis <= 0) continue;
        var X = sx(f.x), Y = sy(f.y);
        if (X < -10 || X > W + 10 || Y < -10 || Y > H + 10) continue;
        var tw = 0.65 + 0.35 * Math.sin(t * 1.3 + f.tw);
        var rr = (0.8 + f.m * 1.6) * (f.L === 2 ? 0.9 : 1);
        star(X, Y, rr * 2.4, f.c ? cool : warm, (0.18 + f.m * 0.45) * tw * vis * (1 - dark * 0.45));
      }

      // the dark the moon rises into: deepest around the couple
      if (dark > 0) {
        ctx.globalAlpha = dark;
        ctx.save();
        ctx.translate(focus.x, focus.y + focus.r * 1.9);
        ctx.scale(1, 1.9);
        var R0 = focus.r * 1.25, R1 = focus.r * 2.6;
        var g = ctx.createRadialGradient(0, 0, R0, 0, 0, R1);
        g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.55, 'rgba(0,0,0,.72)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, R1, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // constellation lines, drawn one after another
      ctx.globalAlpha = 0.55 * (1 - smooth(ez / 0.45));
      ctx.strokeStyle = '#C9A35C'; ctx.lineWidth = 1;
      ctx.beginPath();
      LINES.forEach(function (e, i) {
        var f = clamp(lineP * LINES.length - i);
        if (f <= 0) return;
        var a = S[e[0]], b = S[e[1]];
        ctx.moveTo(sx(a.x), sy(a.y));
        ctx.lineTo(sx(a.x + (b.x - a.x) * f), sy(a.y + (b.y - a.y) * f));
      });
      ctx.stroke();

      // the seven sages
      S.forEach(function (s, i) {
        if (i === 5) return;
        var r = (5.2 - s.mag) * 4.2 * Math.min(2.2, 1 + ez * 1.2);
        star(sx(s.x), sy(s.y), r * 2, warm, 1 - dark);
        var na = nameP * (1 - ez) * 0.9;
        if (na > 0.01) label(s, sx(s.x), sy(s.y), na, false);
      });

      // Vasishtha and Arundhati: drawn last, and drawn together as they meet
      var vx = sx(V.x), vy = sy(V.y), ax = sx(A.x), ay = sy(A.y);
      var k = merge * merge * (3 - 2 * merge);
      vx += (Fx - vx) * k; vy += (Fy - vy) * k; ax += (Fx - ax) * k; ay += (Fy - ay) * k;
      var vr = (5.2 - V.mag) * 4.2 * Math.min(2.2, 1 + ez * 1.2);
      var ar = (5.2 - A.mag) * 4.2 * (1 + ez * 1.8);
      star(vx, vy, vr * 2, warm, 1 - gone);
      star(ax, ay, ar * 2, gold, (0.55 + ez * 0.45) * (1 - gone));
      if (nameP * (1 - ez) > 0.01) label(V, vx, vy, nameP * (1 - ez), false);
      if (merge > 0) {                                   // one light where there were two
        var fl = Math.sin(Math.PI * clamp((p - 0.66) / 0.12));
        star(Fx, Fy, (vr * 2 + 26 * fl) * (1 + merge * 0.6), gold, merge * (1 - gone * 0.6));
      }
      if (big > 0.01) {
        ctx.globalAlpha = big * 0.85;
        ctx.strokeStyle = '#D9B56E'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(ax, ay, 24 + (1 - big) * 30, 0, Math.PI * 2); ctx.stroke();
        label(A, ax, ay, big, true, 1);
        label(V, vx, vy, big, true, -1);
      }
      ctx.globalAlpha = 1;
    };

    function label(s, x, y, a, big, side) {
      ctx.globalAlpha = a;
      ctx.textBaseline = 'middle';
      var te = big ? '500 22px' : '400 15px', en = big ? '11px' : '9.5px';
      var tx = x, ty, ey, al = 'center';
      if (big) { al = side < 0 ? 'right' : 'left'; tx = x + 34 * (side || 1); ty = y - 2; ey = ty + 20; }
      else if (s.at === 'b') { ty = y + 17; ey = y + 32; }
      else if (s.at === 'l') { al = 'right'; tx = x - 13; ty = y - 6; ey = y + 9; }
      else { ty = y - 31; ey = y - 16; }
      ctx.textAlign = al;
      ctx.fillStyle = '#E8C98A';
      ctx.font = te + ' Gurajada, "Noto Sans Telugu", sans-serif';
      ctx.fillText(s.te, tx, ty);
      ctx.fillStyle = 'rgba(243,235,221,.7)';
      ctx.font = en + ' Jost, system-ui, sans-serif';
      ctx.fillText(s.en.toUpperCase(), tx, ey);
    }

    api.resize();
    return api;
  }

  window.Sky = { create: create };
})();

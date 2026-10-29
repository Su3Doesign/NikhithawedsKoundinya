/* ------------------------------------------------------------------
   Arundhati: the Saptarishi (the Big Dipper) from their real places in
   the sky, turned the way they stand over the northern horizon from
   India on a summer evening: the bowl on the left, upside down, the
   handle climbing to the right. The sages are named in Telugu.

   Then a long zoom into Vasishtha (Mizar) until faint Arundhati (Alcor)
   separates beside him, a little to his right and below, the way the
   bride stands beside the groom in the photograph that follows. The two
   stars draw together into one light, whose stardust writes their names.

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

  /* Stardust: once the two stars are one light, that light rises to sit
     above the names as their ornament, and its stardust streams out to
     write నిఖిత, then సాయి కౌండిన్య, letter by letter. The printed names
     glow in beneath it, a sheen of starlight crosses them, and a few stars
     stay on the letters, glinting. Each frame depends on progress alone,
     so the scene plays backwards as faithfully as forwards. */
  function dust(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var W = 1, H = 1, dpr = 1, parts = [], from = { x: 0, y: 0 }, to = { x: 0, y: 0 }, lo = 0, hi = 1;
    var dot = (function () {
      var s = 32, c = document.createElement('canvas'); c.width = c.height = s;
      var x = c.getContext('2d'), g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, 'rgba(255,250,240,1)'); g.addColorStop(0.22, 'rgba(255,234,194,.9)');
      g.addColorStop(0.5, 'rgba(255,214,150,.2)'); g.addColorStop(1, 'rgba(255,214,150,0)');
      x.fillStyle = g; x.fillRect(0, 0, s, s);
      return c;
    })();
    var halo = sprite('255,214,150', 64);
    // a four-pointed glint: two long soft rays over a bright heart
    var glint = (function () {
      var s = 64, h = s / 2, c = document.createElement('canvas'); c.width = c.height = s;
      var x = c.getContext('2d');
      [[1, 0.07], [0.07, 1]].forEach(function (k) {
        x.save(); x.translate(h, h); x.scale(k[0], k[1]);
        var g = x.createRadialGradient(0, 0, 0, 0, 0, h);
        g.addColorStop(0, 'rgba(255,248,230,1)'); g.addColorStop(0.35, 'rgba(255,228,176,.45)'); g.addColorStop(1, 'rgba(255,214,150,0)');
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, h, 0, Math.PI * 2); x.fill(); x.restore();
      });
      x.drawImage(sprite('255,244,222', s), s * 0.25, s * 0.25, s * 0.5, s * 0.5);
      return c;
    })();
    var api = {};

    api.resize = function () {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      dpr = opts.dpr || Math.min(window.devicePixelRatio || 1, 1.5);
      if (!W || !H) return;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    };

    // lines: [{ text, font, size, x: centre, top, height }] in the canvas's own pixels;
    // start: the merged light; end: the ornament above the names
    api.write = function (lines, start, end) {
      from = start; to = end; parts = []; lo = Infinity; hi = -Infinity;
      var rnd = rng(11), maps = [], ink = 0;
      lines.forEach(function (ln) {
        var c = document.createElement('canvas'), x = c.getContext('2d');
        x.font = ln.font;
        var m = x.measureText(ln.text);
        var fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
        if (!(fa > 0)) { fa = ln.size * 1.05; fd = ln.size * 0.5; }
        var l = Math.ceil(m.actualBoundingBoxLeft || m.width / 2) + 3, r = Math.ceil(m.actualBoundingBoxRight || m.width / 2) + 3;
        var a = Math.ceil(m.actualBoundingBoxAscent || fa) + 3, d = Math.ceil(m.actualBoundingBoxDescent || fd) + 3;
        c.width = l + r; c.height = a + d;
        x.font = ln.font; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillStyle = '#fff';
        x.fillText(ln.text, l, a);
        var px = x.getImageData(0, 0, c.width, c.height).data;
        for (var i = 3; i < px.length; i += 4) if (px[i] > 140) ink++;
        // the page centres the font's ascent and descent in the line box
        var base = ln.top + (ln.height - (fa + fd)) / 2 + fa;
        maps.push({ px: px, w: c.width, h: c.height, ox: ln.x - l, oy: base - a });
      });
      // about one mote per seven pixels of ink, fewer on modest phones
      var step = Math.max(1.6, Math.sqrt(ink / (opts.low ? 360 : Math.min(1000, Math.max(600, ink / 7)))));
      maps.forEach(function (mp, li) {
        for (var gy = 0; gy < mp.h; gy += step) for (var gx = 0; gx < mp.w; gx += step) {
          var sx = gx + rnd() * step, sy = gy + rnd() * step;
          if (sx >= mp.w || sy >= mp.h || mp.px[((sy | 0) * mp.w + (sx | 0)) * 4 + 3] <= 140) continue;
          var tx = mp.ox + sx;
          lo = Math.min(lo, tx); hi = Math.max(hi, tx);
          // the bride's name first, then the groom's, each written from left to right
          var o = (sx / mp.w) * 0.85 + rnd() * 0.15;
          parts.push({ tx: tx, ty: mp.oy + sy, li: li, e: li ? 0.16 + o * 0.24 : 0.02 + o * 0.18, d: 0.14 + rnd() * 0.08,
            jx: (rnd() - 0.5) * 12, jy: (rnd() - 0.5) * 12, bend: (rnd() - 0.5) * 1.3, lift: 0.1 + rnd() * 0.3,
            r: 0.9 + rnd() * 0.7, g: rnd() < 0.1, ph: rnd() * 6.283, w: 0.9 + rnd() * 1.6 });
        }
      });
    };

    function core(p) { var k = smooth(p / 0.35); return { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k }; }
    // leaves the light quickly and settles softly into its letter
    function ease(u) { return 1 - Math.pow(1 - u, 3); }
    function at(x0, y0, cx, cy, x1, y1, k, r, a) {
      if (a <= 0.01) return;
      var m = 1 - k, x = m * m * x0 + 2 * m * k * cx + k * k * x1, y = m * m * y0 + 2 * m * k * cy + k * k * y1;
      ctx.globalAlpha = a; ctx.drawImage(dot, x - r * 2, y - r * 2, r * 4, r * 4);
    }

    api.draw = function (p, t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (p <= 0) return;
      t = t || 0;
      // each name's dust gives way to the printed name once it is written
      var settle = [smooth((p - 0.42) / 0.14), smooth((p - 0.62) / 0.14)];
      var sw = (p - 0.8) / 0.14, sheenX = lo - 40 + (hi - lo + 80) * sw, sheen = sw > 0 && sw < 1;
      for (var i = 0; i < parts.length; i++) {
        var q = parts[i];
        if (p < q.e) continue;
        var u = (p - q.e) / q.d;
        if (u < 1) {
          // in flight, on a gentle arc from where the light was when it left
          var s = core(q.e), x0 = s.x + q.jx, y0 = s.y + q.jy, dx = q.tx - x0, dy = q.ty - y0;
          var len = Math.sqrt(dx * dx + dy * dy), cx = (x0 + q.tx) / 2 - dy * q.bend, cy = (y0 + q.ty) / 2 + dx * q.bend - len * q.lift;
          var a = Math.min(1, u / 0.1);
          at(x0, y0, cx, cy, q.tx, q.ty, ease(Math.max(0, u - 0.07)), q.r * 0.75, 0.35 * a);
          at(x0, y0, cx, cy, q.tx, q.ty, ease(u), q.r * 1.15, 0.9 * a);
          continue;
        }
        var flash = Math.exp(-(p - q.e - q.d) / 0.02);
        var al = 0.92 * (1 - settle[q.li]), on = 0;
        if (q.g) { on = Math.pow(0.5 + 0.5 * Math.sin(t * q.w + q.ph), 10) * settle[q.li]; al = Math.max(al, 0.95 * on); }
        var gl = sheen ? Math.exp(-Math.pow((q.tx - sheenX) / 22, 2)) : 0;
        al = Math.min(1, al + flash * 0.5 + gl * 0.9);
        if (al < 0.02) continue;
        ctx.globalAlpha = al;
        if (on > 0.25) { var gs = 4 + 9 * on; ctx.drawImage(glint, q.tx - gs, q.ty - gs, gs * 2, gs * 2); }
        else { var rr = q.r * (1.05 + flash * 1.4 + gl * 1.1); ctx.drawImage(dot, q.tx - rr * 2, q.ty - rr * 2, rr * 4, rr * 4); }
      }
      // the one light, rising to become the names' ornament
      var cA = 1 - smooth((p - 0.3) / 0.14);
      if (cA > 0) {
        var c = core(p), k = smooth(p / 0.35), beat = 1 + 0.08 * Math.sin(t * 2.4), R = (30 - 18 * k) * beat, G = (17 - 6 * k) * beat;
        ctx.globalAlpha = cA * 0.9; ctx.drawImage(halo, c.x - R, c.y - R, R * 2, R * 2);
        ctx.globalAlpha = cA; ctx.drawImage(glint, c.x - G, c.y - G, G * 2, G * 2);
      }
      ctx.globalAlpha = 1;
    };

    api.resize();
    return api;
  }

  window.Sky = { create: create, dust: dust };
})();

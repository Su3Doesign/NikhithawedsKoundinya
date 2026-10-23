/* ------------------------------------------------------------------
   Talambralu: grains of rice. Most are coloured with turmeric, some are
   left white, a few are red with kumkum. Each kind is drawn once into a
   small sprite; a grain turning in the air is the sprite rotated and
   squashed along its length.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  // fill, light edge, shadow edge
  var KINDS = {
    y: ['#E3A31D', '#F9D978', '#A56A09'],
    w: ['#F2EDE1', '#FFFFFF', '#BDB29B'],
    r: ['#B4251C', '#E45A43', '#6F1009']
  };

  function sprite(k, L, Wd, s) {
    var c = document.createElement('canvas'), pad = 1.5;
    c.width = Math.ceil((L + pad * 2) * s); c.height = Math.ceil((Wd + pad * 2) * s);
    var x = c.getContext('2d'), col = KINDS[k];
    x.scale(s, s); x.translate(pad + L / 2, pad + Wd / 2);
    // an oval a little fuller at one end, the way a grain of sona masoori is
    x.beginPath();
    for (var i = 0; i <= 48; i++) {
      var t = i / 48 * Math.PI * 2, ct = Math.cos(t), st = Math.sin(t);
      var px = (L / 2) * ct, py = (Wd / 2) * st * (1 + 0.14 * ct) * (1 - 0.18 * Math.pow(Math.abs(ct), 6));
      if (i) x.lineTo(px, py); else x.moveTo(px, py);
    }
    x.closePath();
    var g = x.createLinearGradient(0, -Wd / 2, 0, Wd / 2);
    g.addColorStop(0, col[1]); g.addColorStop(0.38, col[0]); g.addColorStop(1, col[2]);
    x.fillStyle = g; x.fill();
    // a soft sheen along the top of the grain
    x.save(); x.clip();
    x.globalAlpha = k === 'w' ? 0.5 : 0.35;
    x.fillStyle = '#FFFFFF';
    x.beginPath(); x.ellipse(-L * 0.06, -Wd * 0.2, L * 0.34, Wd * 0.13, 0, 0, Math.PI * 2); x.fill();
    x.restore();
    c.w = L + pad * 2; c.h = Wd + pad * 2;
    return c;
  }

  // sprites for a grain size, in CSS pixels
  function set(L, Wd) {
    var s = Math.min(4, Math.max(2, (window.devicePixelRatio || 1) * 1.5));
    return { y: sprite('y', L, Wd, s), w: sprite('w', L, Wd, s), r: sprite('r', L, Wd, s) };
  }

  // choose a kind from a mix such as { y: .75, w: .15, r: .1 }
  function pick(mix) {
    var u = Math.random();
    if (u < mix.y) return 'y';
    return u < mix.y + mix.w ? 'w' : 'r';
  }

  /* one grain: x, y in CSS px, a = angle in the picture plane, f = phase
     of its turn end over end, sc = size, al = alpha */
  function draw(ctx, spr, dpr, x, y, a, f, sc, al) {
    var fs = 0.45 + 0.55 * Math.abs(Math.cos(f));
    var c = Math.cos(a) * sc * dpr, s = Math.sin(a) * sc * dpr;
    ctx.globalAlpha = al;
    ctx.setTransform(c * fs, s * fs, -s, c, x * dpr, y * dpr);
    ctx.drawImage(spr, -spr.w / 2, -spr.h / 2, spr.w, spr.h);
  }

  window.Rice = { set: set, pick: pick, draw: draw, MIX: { y: 0.74, w: 0.16, r: 0.1 } };
})();

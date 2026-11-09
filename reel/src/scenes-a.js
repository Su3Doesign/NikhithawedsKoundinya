/* Pendli Pilupu reel · scenes 1–4 (0 – 22.75 s)
   Music: "Dichotomy of Fame" from 57.5 s; every time below is in reel seconds,
   placed on the track's measured kicks. The drum drop lands at 30.09. */
(function () {
  const { W, H, E, span, clamp, lerp, hit, rng, noise1 } = C;
  C.DURATION = 42;
  C.T = { ignite: 0.09, ganesha: 1.06, hud: 2.43, toPatrika: 3.71, title: 5.03, pasupu: 6.33, kumkum: 7.63, toMuggu: 8.98,
    fill1: 11.63, fill2: 12.21, toStars: 14.25, merge: 15.2, bride1: 16.53, groom1: 18.13, lockNames: 20.47, date: 21.52,
    toPortraits: 22.75, groomPortrait: 26.3, drop: 30.09, resume: 31.06, word: 32.06, toDetails: 34.03, ev2: 35.36, ev3: 35.96, ev4: 37.98, toEnd: 39.0 };
  const T = C.T;
  const SCENES = window.SCENES = window.SCENES || [];

  // reveal a string character by character (spaced labels, so no Telugu shaping is split)
  function typeOn(textObj, full, k) { const n = Math.round(full.length * clamp(k)); const s = full.slice(0, n); if (textObj.text !== s) textObj.text = s || ' '; }
  // a mask that wipes a display object open from one side
  function wipeMask(root, x, y, w, h) { const m = new PIXI.Graphics(); root.addChild(m); return { g: m, set(k, dir = 'up') {
    m.clear();
    if (dir === 'up') m.rect(x, y + h * (1 - k), w, h * k); else if (dir === 'right') m.rect(x, y, w * k, h); else m.rect(x + w * (1 - k) / 2, y, w * k, h);
    m.fill(0xffffff);
  } }; }
  // a teardrop flame, white at the root
  const flameTex = () => C.canvasTex(200, 400, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(214,92,24,0)'); g.addColorStop(0.18, 'rgba(232,120,30,.9)'); g.addColorStop(0.5, 'rgba(255,200,90,1)'); g.addColorStop(0.8, 'rgba(255,240,200,1)'); g.addColorStop(1, 'rgba(255,255,255,1)');
    x.fillStyle = g; x.beginPath(); x.moveTo(w / 2, 0);
    x.bezierCurveTo(w * 0.62, h * 0.3, w * 0.98, h * 0.55, w * 0.92, h * 0.76);
    x.bezierCurveTo(w * 0.86, h * 0.96, w * 0.62, h, w / 2, h);
    x.bezierCurveTo(w * 0.38, h, w * 0.14, h * 0.96, w * 0.08, h * 0.76);
    x.bezierCurveTo(w * 0.02, h * 0.55, w * 0.38, h * 0.3, w / 2, 0); x.fill();
  });
  C.flameTex = () => C._flame || (C._flame = flameTex());
  // a lit diya: brass lamp, living flame, warm light
  C.diya = function (parent, x, y, scale) {
    const c = new PIXI.Container(); c.position.set(x, y); parent.addChild(c);
    const halo = new PIXI.Sprite(C.glowTex()); halo.anchor.set(0.5); halo.tint = 0xffa53a; halo.blendMode = 'add'; c.addChild(halo);
    // scale is the lamp's width in pixels; the wick sits at (112, 113) of the 220 x 290 drawing
    const lamp = new PIXI.Sprite(C.A.lamp); lamp.anchor.set(0.5, 1); lamp.scale.set(scale / lamp.texture.width); c.addChild(lamp);
    const base = { x: (112 - 110) / 220 * scale, y: -(290 - 116) / 290 * lamp.height };
    scale = scale / 220;
    const glow = new PIXI.Sprite(C.glowTex()); glow.anchor.set(0.5); glow.tint = 0xffc25a; glow.blendMode = 'add'; glow.position.set(base.x, base.y - 40 * scale); c.addChild(glow);
    const flame = new PIXI.Sprite(C.flameTex()); flame.anchor.set(0.5, 0.94); flame.position.set(base.x, base.y); c.addChild(flame);
    const core = new PIXI.Sprite(C.flameTex()); core.anchor.set(0.5, 0.94); core.tint = 0xffffff; core.blendMode = 'add'; core.position.set(base.x, base.y); c.addChild(core);
    return { c, base, set(t, lit, flare = 0) {
      const fl = 1 + 0.05 * noise1(t * 6.5, 9) + flare * 0.5, sway = 0.05 * noise1(t * 2.7, 8);
      const fs = scale * 0.18 * lit;
      flame.scale.set(fs * (1 - 0.04 * noise1(t * 5, 7)), fs * 1.15 * fl); flame.rotation = sway; flame.alpha = clamp(lit * 2);
      core.scale.set(fs * 0.42, fs * 0.55 * fl); core.rotation = sway; core.alpha = lit * 0.9;
      glow.scale.set(scale * 0.55 * lit * (1 + flare)); glow.alpha = 0.75 * lit;
      halo.position.set(base.x, base.y - 30 * scale); halo.scale.set(scale * 2.6 * lit * (1 + 0.6 * flare)); halo.alpha = 0.28 * lit;
    } };
  };
  // turmeric or kumkum powder dab, with specks
  function dabTex(color, seed) {
    return C.canvasTex(220, 220, (x, w) => {
      const r = rng(seed); x.fillStyle = color; x.globalAlpha = 1;
      for (let i = 0; i < 26; i++) { const a = r() * 6.283, d = r() * 26; x.beginPath(); x.arc(w / 2 + Math.cos(a) * d, w / 2 + Math.sin(a) * d, 22 + r() * 22, 0, 6.283); x.fill(); }
      for (let i = 0; i < 160; i++) { const a = r() * 6.283, d = 50 + r() * 55; x.globalAlpha = 0.35 + r() * 0.5; x.beginPath(); x.arc(w / 2 + Math.cos(a) * d, w / 2 + Math.sin(a) * d, 0.8 + r() * 2.4, 0, 6.283); x.fill(); }
    });
  }
  // powder that bursts out and settles
  function powder(parent, n, color, seed) {
    const r = rng(seed), ps = [];
    for (let i = 0; i < n; i++) { const s = new PIXI.Sprite(C.dotTex()); s.anchor.set(0.5); s.tint = color; parent.addChild(s); const a = r() * 6.283; ps.push({ s, a, v: 120 + r() * 380, k: 4 + r() * 4, sz: 0.04 + r() * 0.07 }); }
    return (x, y, dt) => ps.forEach(p => {
      if (dt < 0) { p.s.visible = false; return; }
      p.s.visible = true; const d = p.v * (1 - Math.exp(-p.k * dt)) / p.k;
      p.s.position.set(x + Math.cos(p.a) * d, y + Math.sin(p.a) * d + 30 * dt * dt); p.s.scale.set(p.sz); p.s.alpha = clamp(1 - dt / 2.2) * 0.9;
    });
  }
  C.powder = powder; C.dabTex = dabTex; C.typeOn = typeOn; C.wipeMask = wipeMask;

  /* ================================================================ 1 · the lamp is lit (0 – 3.71) */
  SCENES.push(() => C.scene(0, T.toPatrika, (root) => {
    C.bg(root, C.radial([[0, '#4c140f'], [0.5, '#1f0807'], [1, '#060203']], 512));
    const rays = new PIXI.Sprite(C.glowTex()); rays.anchor.set(0.5); rays.tint = 0xff8a2a; rays.blendMode = 'add'; rays.position.set(540, 960); root.addChild(rays);
    const diya = C.diya(root, 540, 1760, 430);
    const fb = { x: 540 + diya.base.x, y: 1760 + diya.base.y };
    // sparks lifted by the first flame
    const r = rng(3), sparks = [];
    for (let i = 0; i < 30; i++) { const s = new PIXI.Sprite(C.dotTex()); s.anchor.set(0.5); s.blendMode = 'add'; s.tint = 0xffc870; root.addChild(s); sparks.push({ s, vx: (r() - 0.5) * 260, vy: -260 - r() * 420, life: 0.8 + r() * 1.2, sz: 0.03 + r() * 0.04 }); }
    // Ganesha in gold, written upward by the light
    const gGlow = new PIXI.Sprite(C.A.ganesha); gGlow.anchor.set(0.5); gGlow.tint = 0xffb84a; gGlow.blendMode = 'add'; gGlow.filters = [new PIXI.BlurFilter({ strength: 22, quality: 4 })];
    const gan = new PIXI.Sprite(C.A.ganesha); gan.anchor.set(0.5); gan.tint = C.GOLD;
    const gk = 600 / gan.texture.height; [gGlow, gan].forEach(s => { s.scale.set(gk); s.position.set(540, 620); root.addChild(s); });
    const gm = wipeMask(root, 180, 290, 720, 680); gan.mask = gm.g;
    const gm2 = wipeMask(root, 180, 290, 720, 680); gGlow.mask = gm2.g;
    const edge = new PIXI.Sprite(C.glowTex()); edge.anchor.set(0.5); edge.tint = 0xffd27a; edge.blendMode = 'add'; root.addChild(edge);
    const om = C.text('శ్రీ గణేశాయ నమః', { font: C.TE2, size: 78, fill: C.GOLD_HI }); om.position.set(540, 1030); root.addChild(om);
    const omMask = wipeMask(root, 200, 975, 680, 120); om.mask = omMask.g;
    // the reel's quiet spec voice
    const hud = new PIXI.Graphics(); root.addChild(hud);
    const L = [['NO. 01 — SHUBHALEKHA', 100, 214, 0], ['13 · 12 · 2026', 980, 214, 1], ['NIDADAVOLU · A.P.', 100, 1800, 0], ['20:22 IST', 980, 1800, 1]]
      .map(([s, x, y, ax]) => { const t = C.label(s, { size: 27, fill: C.GOLD, ls: 8, ax }); t.position.set(x, y); root.addChild(t); return [t, s]; });
    return (t) => {
      const lit = E.out5(span(t, T.ignite, T.ignite + 0.5)), flare = hit(t, T.hud, 5) * 0.4 + E.in3(span(t, 3.0, T.toPatrika)) * 1.6;
      diya.set(t, lit, flare);
      rays.scale.set(5 + 3 * lit); rays.alpha = 0.22 * lit + 0.3 * flare;
      sparks.forEach(p => { const dt = t - T.ignite - 0.05; const on = dt > 0 && dt < p.life; p.s.visible = on; if (!on) return;
        p.s.position.set(fb.x + p.vx * dt, fb.y - 40 + p.vy * dt + 220 * dt * dt); p.s.scale.set(p.sz * (1 - dt / p.life)); p.s.alpha = 1 - dt / p.life; });
      const g = E.out3(span(t, T.ganesha, T.ganesha + 0.95));
      gm.set(g); gm2.set(g);
      gan.scale.set(gk * (1.04 - 0.04 * g)); gGlow.scale.set(gan.scale.x);
      gGlow.alpha = 0.35 + 0.5 * hit(t, T.ganesha + 0.9, 2.5);
      edge.visible = g > 0 && g < 1; edge.position.set(540, 290 + 680 * (1 - g)); edge.scale.set(3.2, 0.35); edge.alpha = 0.8 * (1 - g);
      omMask.set(E.out3(span(t, 1.75, 2.45)), 'right'); om.alpha = span(t, 1.75, 2.0);
      const h = span(t, T.hud, T.hud + 0.5);
      L.forEach(([o, s], i) => typeOn(o, s, span(h, i * 0.12, i * 0.12 + 0.6)));
      hud.clear(); if (h > 0) C.cropMarks(hud, 70, 150, 940, 1700, 46 * E.out3(h), C.GOLD, 2, 0.8);
      // into the flame, and the light becomes paper
      const push = E.expoIn(span(t, 2.95, T.toPatrika));
      C.cam.x = fb.x; C.cam.y = fb.y - 90; C.cam.s = 1 + 2.4 * push; C.cam.zoomBlur = 0.22 * push; C.cam.zoomCenter = [fb.x, fb.y - 90];
      C.cam.floodColor = C.IVORY; C.cam.flood = E.in3(span(t, 3.25, T.toPatrika));
      C.cam.grain = 0.1;
    };
  }));

  /* ================================================================ 2 · the patrika (3.71 – 8.98) */
  SCENES.push(() => C.scene(T.toPatrika, T.toMuggu, (root) => {
    C.bg(root, C.paperTex());
    const frame = new PIXI.Sprite(C.A.frame); frame.anchor.set(0.5); const fk = C.fit(frame, 1010, 1520); frame.position.set(540, 960); root.addChild(frame);
    const gan = new PIXI.Sprite(C.A.ganesha); gan.anchor.set(0.5); gan.tint = C.KUM; const gk = 150 / gan.texture.height; gan.position.set(540, 520); root.addChild(gan);
    const ausp = C.text('శ్రీరస్తు     శుభమస్తు     అవిఘ్నమస్తు', { font: C.TE2, size: 40, fill: C.KUM }); ausp.position.set(540, 405); root.addChild(ausp);
    const l1 = C.text('చల్లపల్లి వారి', { font: C.TE, size: 100, fill: C.KUM }); l1.position.set(540, 742); root.addChild(l1);
    const l2 = C.text('పెండ్లి పిలుపు', { font: C.TE, size: 146, fill: C.KUM }); l2.position.set(540, 905); root.addChild(l2);
    const rule = new PIXI.Graphics(); root.addChild(rule);
    // the two names, laid out by their measured widths with a heart between
    const nA = C.text('నిఖిత', { font: C.TE, size: 68, fill: C.INK, ax: 0 }), nB = C.text('సాయి కౌండిన్య', { font: C.TE, size: 68, fill: C.INK, ax: 0 });
    const gap = 84, total = nA.width + gap + nB.width, x0 = 540 - total / 2;
    nA.x = x0; nB.x = x0 + nA.width + gap;
    const names = new PIXI.Container(); names.addChild(nA, nB); names.y = 1150; root.addChild(names);
    const heart = new PIXI.Graphics(); heart.position.set(x0 + nA.width + gap / 2, 1156); root.addChild(heart);
    const en = C.label('NIKHITHA  ×  SAI KOUNDINYA', { size: 31, fill: C.GOLD_D, ls: 10 }); en.position.set(540, 1252); root.addChild(en);
    const date = C.label('SUNDAY · 13 DECEMBER 2026 · 8:22 PM', { size: 26, fill: C.INK2, ls: 6 }); date.position.set(540, 1322); root.addChild(date);
    const orn = new PIXI.Sprite(C.A.ornament); orn.anchor.set(0.5); orn.tint = C.GOLD; const ok = 620 / orn.texture.width; orn.position.set(540, 1478); root.addChild(orn);
    const ornMask = wipeMask(root, 230, 1380, 620, 200); orn.mask = ornMask.g;
    // pasupu and kumkuma touched to the card's corners
    const corners = [[150, 380], [930, 380], [150, 1600], [930, 1600]];
    const pas = dabTex('#e3a62a', 5), kum = dabTex('#b3261e', 6);
    const dust = new PIXI.Container(); root.addChild(dust);
    const dabs = corners.map(([x, y], i) => {
      const a = new PIXI.Sprite(pas); a.anchor.set(0.5); a.position.set(x + (i % 2 ? 22 : -22), y); root.addChild(a);
      const b = new PIXI.Sprite(kum); b.anchor.set(0.5); b.position.set(x + (i % 2 ? -26 : 26), y + 4); root.addChild(b);
      return { a, b, pa: powder(dust, 16, C.TUR, 20 + i), pb: powder(dust, 16, C.KUM, 40 + i), x, y };
    });
    const fig1 = C.label('FIG. 01 — PASUPU · TURMERIC', { size: 22, fill: C.INK2, ls: 5, ax: 0 }); fig1.position.set(96, 1790); root.addChild(fig1);
    const fig2 = C.label('FIG. 02 — KUMKUMA', { size: 22, fill: C.INK2, ls: 5, ax: 1 }); fig2.position.set(984, 1790); root.addChild(fig2);
    return (t) => {
      const lt = t - T.toPatrika;
      C.cam.floodColor = C.IVORY; C.cam.flood = 1 - E.out3(span(t, T.toPatrika, T.toPatrika + 0.45));
      const f = E.expo(span(t, T.toPatrika, T.toPatrika + 0.9)); frame.scale.set(fk * (1.07 - 0.07 * f));
      gan.scale.set(gk * (0.92 + 0.08 * E.out3(span(t, 3.9, 4.4)))); gan.alpha = span(t, 3.9, 4.2);
      ausp.alpha = span(t, 4.0, 4.4); ausp.y = 415 - 10 * E.out3(span(t, 4.0, 4.5));
      const a1 = E.out3(span(t, 4.3, 4.85)); l1.alpha = a1; l1.y = 762 - 20 * a1;
      // the slam
      const s2 = E.expo(span(t, T.title, T.title + 0.4)); l2.alpha = span(t, T.title, T.title + 0.05); l2.scale.set(1.32 - 0.32 * s2);
      rule.clear(); const rk = E.out3(span(t, T.title + 0.1, T.title + 0.7));
      if (rk > 0) { rule.moveTo(540 - 300 * rk, 1022).lineTo(540 + 300 * rk, 1022).stroke({ width: 2.5, color: C.GOLD });
        rule.poly([540, 1010, 552, 1022, 540, 1034, 528, 1022]).fill(C.GOLD); }
      const n = E.out3(span(t, 5.7, 6.3)); names.alpha = n; names.y = 1172 - 22 * n; nA.y = nB.y = 0;
      heart.clear(); if (n > 0) { heart.scale.set(1.5 * E.back(span(t, 5.9, 6.3))); heart.poly([0, 6, -9, -3, -9, -8, -5, -12, 0, -9, 5, -12, 9, -8, 9, -3]).fill(C.KUM); }
      typeOn(en, 'NIKHITHA  ×  SAI KOUNDINYA', span(t, 6.8, 7.4));
      orn.scale.set(ok); ornMask.set(E.inOut(span(t, 7.0, 8.0)), 'center'); typeOn(date, 'SUNDAY · 13 DECEMBER 2026 · 8:22 PM', span(t, 7.9, 8.5));
      dabs.forEach((d, i) => {
        const ta = T.pasupu + i * 0.07, tb = T.kumkum + i * 0.07;
        d.a.scale.set(0.55 * E.back(span(t, ta, ta + 0.28))); d.a.alpha = span(t, ta, ta + 0.04);
        d.b.scale.set(0.42 * E.back(span(t, tb, tb + 0.28))); d.b.alpha = span(t, tb, tb + 0.04);
        d.pa(d.a.x, d.a.y, t - ta); d.pb(d.b.x, d.b.y, t - tb);
      });
      typeOn(fig1, 'FIG. 01 — PASUPU · TURMERIC', span(t, T.pasupu + 0.2, T.pasupu + 0.8)); typeOn(fig2, 'FIG. 02 — KUMKUMA', span(t, T.kumkum + 0.2, T.kumkum + 0.7));
      C.cam.shake = hit(t, T.title, 9) * 0.55 + hit(t, T.pasupu, 12) * 0.15 + hit(t, T.kumkum, 12) * 0.15;
      // push through the card's heart into the floor below
      const push = E.expoIn(span(t, 8.3, T.toMuggu));
      C.cam.x = 540; C.cam.y = 1022; C.cam.s = 1 + 2.6 * push + 0.03 * hit(t, T.title, 7); C.cam.zoomBlur = 0.3 * push; C.cam.zoomCenter = [540, 1022];
      C.cam.floodColor = C.TUR; if (t > 8.6) C.cam.flood = 0.55 * E.in3(span(t, 8.6, T.toMuggu));
      C.cam.grain = 0.2;
    };
  }));

  /* ================================================================ 3 · the muggu (8.98 – 14.25) */
  SCENES.push(() => C.scene(T.toMuggu, T.toStars, (root) => {
    C.bg(root, C.canvasTex(1080, 1920, (x, w, h) => {
      x.fillStyle = '#86391f'; x.fillRect(0, 0, w, h); const r = rng(21);
      for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${r() < .5 ? '60,20,8' : '190,110,70'},${0.04 + r() * 0.06})`; x.beginPath(); x.arc(r() * w, r() * h, 20 + r() * 90, 0, 6.283); x.fill(); }
      for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(255,220,190,${r() * 0.08})`; x.fillRect(r() * w, r() * h, 1.5, 1.5); }
      const g = x.createRadialGradient(w / 2, h * 0.5, 0, w / 2, h * 0.5, h * 0.62); g.addColorStop(0, 'rgba(255,170,110,.22)'); g.addColorStop(1, 'rgba(20,4,0,.55)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    }));
    const cx = 540, cy = 980;
    const art = new PIXI.Container(); art.position.set(cx, cy); root.addChild(art);
    const fills = new PIXI.Graphics(), fills2 = new PIXI.Graphics(); art.addChild(fills2); art.addChild(fills);
    const halo = new PIXI.Graphics(), chalk = new PIXI.Graphics(), dots = new PIXI.Graphics(); art.addChild(halo); art.addChild(chalk); art.addChild(dots);
    const spec = new PIXI.Graphics(); root.addChild(spec);
    // geometry: an 8-fold lotus, a 16-petal ring, eight outer loops, kolam dots
    const pol = (r, a) => [Math.cos(a) * r, Math.sin(a) * r];
    function petal(r0, r1, a, wA, bulge) {
      const pts = [], N = 36;
      for (let i = 0; i <= N; i++) { const k = i / N, s = Math.sin(k * Math.PI); const r = lerp(r0, r1, k); pts.push(pol(r, a - wA * s * bulge * (1 - 0.25 * k))); }
      for (let i = N; i >= 0; i--) { const k = i / N, s = Math.sin(k * Math.PI); const r = lerp(r0, r1, k); pts.push(pol(r, a + wA * s * bulge * (1 - 0.25 * k))); }
      return pts;
    }
    const circle = (r, n = 96) => Array.from({ length: n + 1 }, (_, i) => pol(r, (i / n) * 6.283 - 1.5708));
    const strokes = [];
    const add = (pts, t0, t1, w = 9) => strokes.push({ pts, t0, t1, w });
    add(circle(34, 40), 8.98, 9.3, 8);
    for (let i = 0; i < 8; i++) add(petal(40, 215, i * 0.7854 - 1.5708, 0.36, 1), 9.05 + i * 0.08, 9.95 + i * 0.08);
    add(circle(236), 9.9, 10.7, 6);
    for (let i = 0; i < 16; i++) add(petal(244, 350, i * 0.3927 - 1.5708 + 0.196, 0.15, 1), 10.3 + i * 0.045, 11.0 + i * 0.045, 7);
    for (let i = 0; i < 8; i++) { const a = i * 0.7854 - 1.5708; add(petal(360, 452, a, 0.13, 1.3), 10.9 + i * 0.07, 11.6 + i * 0.07, 7); }
    add(circle(470, 140), 11.0, 12.0, 4);
    const dotPts = [];
    for (let i = 0; i < 8; i++) { const a = i * 0.7854 - 1.5708 + 0.3927; dotPts.push([...pol(300, a), 8.98 + i * 0.04]); dotPts.push([...pol(410, a), 9.1 + i * 0.04]); }
    for (let i = 0; i < 16; i++) dotPts.push([...pol(505, i * 0.3927 - 1.5708), 9.4 + i * 0.03]);
    const len = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
    strokes.forEach(s => s.L = len(s.pts));
    function partial(g, s, k, w, color, alpha) {
      if (k <= 0) return; const target = s.L * k; let acc = 0;
      g.moveTo(s.pts[0][0], s.pts[0][1]);
      for (let i = 1; i < s.pts.length; i++) {
        const [x0, y0] = s.pts[i - 1], [x1, y1] = s.pts[i], d = Math.hypot(x1 - x0, y1 - y0);
        if (acc + d >= target) { const f = (target - acc) / d; g.lineTo(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f); break; }
        g.lineTo(x1, y1); acc += d;
      }
      g.stroke({ width: w, color, alpha, cap: 'round', join: 'round' });
    }
    // colour: turmeric lotus, kumkum ring
    for (let i = 0; i < 8; i++) fills.poly(petal(48, 205, i * 0.7854 - 1.5708, 0.3, 1).flat()).fill(C.TUR);
    fills.circle(0, 0, 26).fill(C.KUM);
    for (let i = 0; i < 16; i++) fills2.poly(petal(250, 342, i * 0.3927 - 1.5708 + 0.196, 0.12, 1).flat()).fill(C.KUM);
    const title = C.text('ముగ్గు', { font: C.TE, size: 110, fill: C.CREAM }); title.position.set(540, 300); root.addChild(title);
    const sub = C.label('MUGGU — RICE FLOUR ON TERRACOTTA', { size: 22, fill: 0xF1C99A, ls: 7 }); sub.position.set(540, 392); root.addChild(sub);
    const fig = C.label('FIG. 03 — EIGHT-FOLD LOTUS · DRAWN AT DAWN', { size: 20, fill: 0xE9B98E, ls: 5, ax: 0 }); fig.position.set(96, 1700); root.addChild(fig);
    const dim = C.label('Ø 1010', { size: 20, fill: 0xF1C99A, ls: 4, ax: 0 }); dim.position.set(905, 980); dim.rotation = Math.PI / 2; root.addChild(dim);
    const core = new PIXI.Sprite(C.glowTex()); core.anchor.set(0.5); core.position.set(cx, cy); core.blendMode = 'add'; core.tint = 0xffe2a8; root.addChild(core);
    return (t) => {
      const rot = 0.1 * E.inOut(span(t, T.toMuggu, T.toStars)); art.rotation = rot;
      chalk.clear(); halo.clear();
      strokes.forEach(s => { const k = E.inOut(span(t, s.t0, s.t1)); partial(halo, s, k, s.w * 2.4, 0xfff4e0, 0.16); partial(chalk, s, k, s.w, 0xFBF4E6, 0.96); });
      dots.clear(); dotPts.forEach(([x, y, t0]) => { const k = E.back(span(t, t0, t0 + 0.3)); if (k > 0) dots.circle(x, y, 9 * k).fill({ color: 0xFBF4E6, alpha: 0.95 }); });
      const f1 = E.back(span(t, T.fill1, T.fill1 + 0.35)); fills.alpha = clamp(f1); fills.scale.set(0.7 + 0.3 * f1);
      const f2 = E.back(span(t, T.fill2, T.fill2 + 0.35)); fills2.alpha = clamp(f2); fills2.scale.set(0.85 + 0.15 * f2);
      const tt = E.out3(span(t, 9.3, 9.9)); title.alpha = tt; title.y = 320 - 20 * tt; C.typeOn(sub, 'MUGGU — RICE FLOUR ON TERRACOTTA', span(t, 9.6, 10.3));
      C.typeOn(fig, 'FIG. 03 — EIGHT-FOLD LOTUS · DRAWN AT DAWN', span(t, 11.7, 12.6)); dim.alpha = span(t, 11.2, 11.6);
      // the spec ring: a measured circle with ticks, swept open
      spec.clear(); const sk = E.inOut(span(t, 9.5, 11.2));
      if (sk > 0) {
        spec.arc(cx, cy, 540, -Math.PI / 2, -Math.PI / 2 + 6.283 * sk).stroke({ width: 1.5, color: 0xF1C99A, alpha: 0.6 });
        for (let i = 0; i < 72 * sk; i++) { const a = -Math.PI / 2 + i / 72 * 6.283, r0 = i % 9 === 0 ? 522 : 532; spec.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0).lineTo(cx + Math.cos(a) * 540, cy + Math.sin(a) * 540); }
        spec.stroke({ width: 1.5, color: 0xF1C99A, alpha: 0.6 });
        spec.moveTo(880, cy - 505).lineTo(880, cy + 505).stroke({ width: 1.2, color: 0xF1C99A, alpha: 0.5 * span(t, 11.2, 11.6) });
      }
      // arrive from the push, breathe on the kicks, then dive into the centre
      const arrive = E.expo(span(t, T.toMuggu, T.toMuggu + 0.9)), dive = E.expoIn(span(t, 13.3, T.toStars));
      C.cam.x = cx; C.cam.y = cy;
      C.cam.s = (3.2 - 2.2 * arrive) * (1 + 0.035 * hit(t, T.fill1, 6) + 0.035 * hit(t, T.fill2, 6)) * (1 + 11 * dive);
      C.cam.zoomBlur = 0.3 * (1 - arrive) + 0.35 * dive; C.cam.zoomCenter = [540, 960];
      C.cam.floodColor = C.TUR; C.cam.flood = 0.55 * (1 - E.out3(span(t, T.toMuggu, T.toMuggu + 0.35)));
      core.scale.set(0.4 + 4 * dive); core.alpha = 0.2 + 0.8 * dive;
      if (t > 13.9) { C.cam.floodColor = 0xffffff; C.cam.flood = E.in3(span(t, 13.9, T.toStars)) * 0.9; }
      C.cam.grain = 0.2;
    };
  }));

  /* ================================================================ 4 · written in the stars (14.25 – 22.75) */
  SCENES.push(() => C.scene(T.toStars, T.toPortraits, (root) => {
    C.bg(root, C.linear(8, 512, [[0, '#06050c'], [0.55, '#110b1d'], [1, '#22102a']]));
    const neb = new PIXI.Container(); root.addChild(neb);
    [[300, 600, 0x5a2a6a, 7], [820, 1300, 0x6a3a1a, 8], [520, 1000, 0x2a2a6a, 10]].forEach(([x, y, c, s]) => { const n = new PIXI.Sprite(C.glowTex()); n.anchor.set(0.5); n.position.set(x, y); n.tint = c; n.scale.set(s); n.alpha = 0.18; n.blendMode = 'add'; neb.addChild(n); });
    const r = rng(77), field = new PIXI.Container(); root.addChild(field); const stars = [];
    for (let i = 0; i < 650; i++) { const s = new PIXI.Sprite(C.dotTex()); s.anchor.set(0.5); s.blendMode = 'add'; const z = r(); s.tint = r() < 0.15 ? 0xffe0b0 : 0xdfe6ff; field.addChild(s); stars.push({ s, x: r() * W, y: r() * H, z, a: 0.25 + 0.75 * r() * r() + 0.2 * z, sz: 0.02 + 0.07 * z * z }); }
    const warp = new PIXI.Graphics(); root.addChild(warp);
    const outGlow = new PIXI.Sprite(C.glowTex()); outGlow.anchor.set(0.5); outGlow.position.set(540, 960); outGlow.tint = 0xfff0d0; outGlow.blendMode = 'add'; root.addChild(outGlow);
    const flareTex = C.canvasTex(512, 512, (x, w) => { [[0, 1], [1, 0]].forEach(([a, b]) => { const g = a ? x.createLinearGradient(0, w / 2, w, w / 2) : x.createLinearGradient(w / 2, 0, w / 2, w); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; a ? x.fillRect(0, w / 2 - 2, w, 4) : x.fillRect(w / 2 - 2, 0, 4, w); }); });
    function star(tint) { const c = new PIXI.Container(); const g = new PIXI.Sprite(C.glowTex()); g.anchor.set(0.5); g.tint = tint; g.blendMode = 'add'; const f = new PIXI.Sprite(flareTex); f.anchor.set(0.5); f.blendMode = 'add'; f.tint = tint; const d = new PIXI.Sprite(C.dotTex()); d.anchor.set(0.5); d.blendMode = 'add'; c.addChild(g, f, d); root.addChild(c); return { c, g, f, d }; }
    const vas = star(0xcfe0ff), aru = star(0xffd59a), one = star(0xfff0d0);
    const ring = new PIXI.Graphics(); root.addChild(ring);
    const burst = new PIXI.Sprite(C.glowTex()); burst.anchor.set(0.5); burst.position.set(540, 700); burst.tint = 0xffc977; burst.blendMode = 'add'; root.addChild(burst);
    const arrive = new PIXI.Sprite(C.glowTex()); arrive.anchor.set(0.5); arrive.position.set(540, 960); arrive.tint = 0xffd9a0; arrive.blendMode = 'add'; root.addChild(arrive);
    // stardust that writes their names
    function targets(str, size, y, step) {
      const c = document.createElement('canvas'); c.width = W; c.height = 400; const x = c.getContext('2d');
      x.font = `${size}px Ramabhadra`; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(str, W / 2, 200);
      const d = x.getImageData(0, 0, W, 400).data, pts = [];
      for (let py = 0; py < 400; py += step) for (let px = 0; px < W; px += step) if (d[(py * W + px) * 4 + 3] > 140) pts.push([px, y - 200 + py]);
      return pts;
    }
    const dust = new PIXI.Container(); root.addChild(dust);
    const rr = rng(91), parts = [];
    [['నిఖిత', 230, 860, 7, T.bride1, 1.45], ['సాయి కౌండిన్య', 158, 1110, 6, T.groom1, 2.0]].forEach(([str, size, y, step, t0, dur]) => {
      const pts = targets(str, size, y, step); const xs = pts.map(p => p[0]); const x0 = Math.min(...xs), x1 = Math.max(...xs);
      pts.forEach(([x, y]) => { const s = new PIXI.Sprite(C.dotTex()); s.anchor.set(0.5); s.blendMode = 'add'; s.tint = rr() < 0.3 ? 0xffffff : 0xffd98c; dust.addChild(s);
        parts.push({ s, x, y, t0: t0 + (x - x0) / (x1 - x0 || 1) * dur * 0.78 + rr() * 0.12, fly: 0.55 + rr() * 0.35, cx: (rr() - 0.5) * 520, cy: -120 - rr() * 260, sz: 0.045 + rr() * 0.03, ph: rr() * 6 }); });
    });
    const n1 = C.text('నిఖిత', { font: C.TE, size: 230, fill: C.GOLD_HI }), n2 = C.text('సాయి కౌండిన్య', { font: C.TE, size: 158, fill: C.GOLD_HI });
    n1.position.set(540, 860); n2.position.set(540, 1110);
    const glowN = new PIXI.Container(); [n1, n2].forEach(n => { const g = C.text(n.text, { font: C.TE, size: n.style.fontSize, fill: 0xffb547 }); g.position.copyFrom(n.position); g.blendMode = 'add'; g.filters = [new PIXI.BlurFilter({ strength: 16, quality: 3 })]; glowN.addChild(g); });
    root.addChild(glowN); root.addChild(n1); root.addChild(n2);
    const orn = new PIXI.Graphics(); root.addChild(orn);
    const witness = C.text('అరుంధతి నక్షత్రం సాక్షిగా', { font: C.TE2, size: 66, fill: C.CREAM }); witness.position.set(540, 1340); root.addChild(witness);
    const date = C.label('13 · 12 · 2026', { size: 34, fill: C.GOLD, ls: 14 }); date.position.set(540, 1440); root.addChild(date);
    const starPos = (t) => {
      const k = span(t, T.toStars, T.merge), rad = 170 * (1 - E.inOut(k)), ang = 2.2 + 9 * Math.pow(k, 1.7);
      return { a: [540 + Math.cos(ang) * rad, 700 + Math.sin(ang) * rad * 0.55], b: [540 - Math.cos(ang) * rad, 700 - Math.sin(ang) * rad * 0.55] };
    };
    return (t) => {
      const lt = t - T.toStars;
      C.cam.flood = 1 - E.out3(span(t, T.toStars, T.toStars + 0.4)); C.cam.floodColor = 0xffe2b0; C.cam.floodAdd = true;
      arrive.alpha = 0.9 * (1 - E.out3(span(t, T.toStars, T.toStars + 0.9))); arrive.scale.set(4 + 10 * E.out3(span(t, T.toStars, T.toStars + 0.9)));
      const wk = E.expoIn(span(t, 21.95, T.toPortraits));
      const drift = lt * 6;
      stars.forEach(p => { const px = p.x, py = (p.y - drift * (0.3 + p.z)) % H; p.s.position.set(px, py < 0 ? py + H : py); p.s.scale.set(p.sz); p.s.alpha = p.a * (1 - wk); });
      // the two stars, circling closer until they are one light
      const pos = starPos(t), merged = t >= T.merge;
      [vas, aru].forEach((s, i) => { s.c.visible = !merged; const p = i ? pos.b : pos.a; s.c.position.set(p[0], p[1]);
        const k = span(t, T.toStars, T.merge); s.g.scale.set(1.0 + 0.6 * k); s.g.alpha = 0.55; s.f.scale.set(0.5 + 0.4 * k, 0.5 + 0.4 * k); s.f.rotation = lt * 0.3; s.d.scale.set(0.22); });
      const rise = E.inOut(span(t, T.merge + 0.25, T.merge + 1.25)), oy = lerp(700, 470, rise);
      one.c.visible = merged; one.c.position.set(540, oy);
      const m = hit(t, T.merge, 2.2);
      one.g.scale.set(1.6 + 2.6 * m); one.g.alpha = 0.7; one.f.scale.set(0.9 + 1.4 * m); one.f.rotation = 0.2 + lt * 0.08; one.d.scale.set(0.3 + 0.3 * m);
      ring.clear(); const rk = span(t, T.merge, T.merge + 1.1); if (rk > 0 && rk < 1) ring.circle(540, 700, 40 + 700 * E.out3(rk)).stroke({ width: 3, color: 0xffd98c, alpha: 0.7 * (1 - rk) });
      if (t >= T.merge && t < T.merge + 1.1) C.cam.shock = { x: 540, y: 700, time: (t - T.merge) * 0.75, opts: { amplitude: 16, wavelength: 150, speed: 1300, brightness: 1.08 } };
      burst.alpha = hit(t, T.merge, 3.2); burst.scale.set(6 + 10 * (1 - hit(t, T.merge, 2)));
      // stardust streams from the star and writes their names
      parts.forEach(p => {
        const k = span(t, p.t0, p.t0 + p.fly);
        if (k <= 0) { p.s.visible = false; return; }
        p.s.visible = true; const e = E.inOut(k), sx = 540, sy = oy;
        const mx = (sx + p.x) / 2 + p.cx, my = (sy + p.y) / 2 + p.cy;
        const x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * mx + e * e * p.x, y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * my + e * e * p.y;
        const settle = k >= 1 ? 1.2 * Math.sin(t * 3 + p.ph) : 0;
        p.s.position.set(x + settle, y); p.s.scale.set(p.sz * (k < 1 ? 1.3 : 1)); p.s.alpha = (k < 1 ? 1 : 0.9) * (1 - E.out3(span(t, T.lockNames, T.lockNames + 0.8)));
      });
      const lock = span(t, T.lockNames - 0.25, T.lockNames + 0.1);
      n1.alpha = n2.alpha = E.smooth(lock); glowN.alpha = 0.5 * E.smooth(lock) + 0.6 * hit(t, T.lockNames, 2.5);
      const punch = 1 + 0.04 * hit(t, T.lockNames, 5); n1.scale.set(punch); n2.scale.set(punch); glowN.children.forEach(g => g.scale.set(punch));
      
      orn.clear(); const ok = E.out3(span(t, 20.8, 21.4)); if (ok > 0) { orn.moveTo(540 - 120 * ok, 985).lineTo(540 - 18, 985).moveTo(540 + 18, 985).lineTo(540 + 120 * ok, 985).stroke({ width: 2, color: C.GOLD }); orn.poly([540, 975, 550, 985, 540, 995, 530, 985]).fill(C.GOLD); }
      const wi = E.out3(span(t, 21.0, 21.6)); witness.alpha = wi; witness.y = 1360 - 20 * wi;
      C.typeOn(date, '13 · 12 · 2026', span(t, T.date, T.date + 0.45));
      // warp: stars stretch into light and we fall through to paper
      warp.clear();
      if (wk > 0) { stars.forEach(p => { const dx = p.s.x - 540, dy = p.s.y - 960, l = 1 + 7 * wk * (0.3 + p.z); warp.moveTo(540 + dx, 960 + dy).lineTo(540 + dx * l, 960 + dy * l); }); warp.stroke({ width: 2.6, color: 0xfff1d8, alpha: 0.9 * wk }); }
      outGlow.alpha = 0.9 * wk; outGlow.scale.set(3 + 12 * wk);
      C.cam.s = 1 + 0.5 * wk; C.cam.zoomBlur = Math.max(C.cam.zoomBlur, 0.3 * wk);
      if (t > 22.45) { C.cam.floodColor = 0xfff0d8; C.cam.floodAdd = true; C.cam.flood = E.in3(span(t, 22.45, T.toPortraits)); }
      C.cam.grain = 0.09;
    };
  }));
})();

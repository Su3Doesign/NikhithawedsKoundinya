/* Pendli Pilupu · the invitation film (about two minutes)
   "Dichotomy of Fame" from its first note. Scenes change on the song's bar lines
   (measured: 123 bpm, phrases at 21.8, 46.7, 62.7, 80.0, the drop at 87.7, 103.6, 111.4)
   and dissolve into each other; nothing cuts, shakes or flashes. */
(function () {
  const { W, H, E, span, clamp, lerp, hit, rng, noise1 } = C;
  const B = { light: 1.53, ganesha: 3.2, om: 6.69, shloka: 8.48, patrika: 10.29, line1: 12.12, line2: 14.07, names: 16.02, en: 17.9, date: 19.85,
    muggu: 21.83, fill1: 27.61, fill2: 29.58, bride: 33.37, groom: 41.1, stars: 48.69, merge: 52.66, nik: 54.61, sai: 56.61, lock: 60.72,
    muhurtham: 62.72, day: 64.69, time: 66.5, venue: 72.24, hush: 80.04, drop: 87.7, toss2: 89.58, toss3: 91.51, coupleNames: 93.55,
    events: 103.58, shubham: 111.43, invite: 113.64, sign: 117.59, end: 121.5 };
  C.DURATION = B.end; C.B = B;
  const SCENES = window.SCENES = [];
  const XF = 1.2; // dissolve length

  /* ============================================================ 1 · the lamp and the blessing */
  SCENES.push(() => C.scene(0, B.patrika + XF, (root, s) => {
    C.bg(root, C.radial([[0, '#4a130e'], [0.5, '#1d0807'], [1, '#060203']], 512));
    const warm = new PIXI.Sprite(C.glowTex()); warm.anchor.set(0.5); warm.tint = 0xff8a2a; warm.blendMode = 'add'; warm.position.set(540, 1250); root.addChild(warm);
    const diya = C.diya(root, 540, 1720, 400);
    const gGlow = new PIXI.Sprite(C.A.ganesha), gan = new PIXI.Sprite(C.A.ganesha);
    gGlow.tint = 0xffb84a; gGlow.blendMode = 'add'; gGlow.filters = [new PIXI.BlurFilter({ strength: 24, quality: 4 })]; gan.tint = C.GOLD;
    const gk = 560 / gan.texture.height; [gGlow, gan].forEach(g => { g.anchor.set(0.5); g.scale.set(gk); g.position.set(540, 600); root.addChild(g); });
    const m1 = C.wipeMask(root, 180, 290, 720, 640), m2 = C.wipeMask(root, 180, 290, 720, 640); gan.mask = m1.g; gGlow.mask = m2.g;
    const edge = new PIXI.Sprite(C.glowTex()); edge.anchor.set(0.5); edge.tint = 0xffd27a; edge.blendMode = 'add'; root.addChild(edge);
    const om = C.text('శ్రీ గణేశాయ నమః', { font: C.TE2, size: 80, fill: C.GOLD_HI }); om.position.set(540, 1000); root.addChild(om);
    const sh = C.text('శ్రీరస్తు   ·   శుభమస్తు   ·   అవిఘ్నమస్తు', { font: C.TE2, size: 46, fill: 0xF3D9A6 }); sh.position.set(540, 1105); root.addChild(sh);
    return (t) => {
      const lit = E.out3(span(t, B.light, B.light + 1.4)); diya.set(t, lit, E.in3(span(t, 9.2, B.patrika + 0.6)) * 1.2);
      warm.scale.set(4 + 4 * lit); warm.alpha = 0.25 * lit;
      const g = E.inOut(span(t, B.ganesha, B.om)); m1.set(g); m2.set(g);
      edge.visible = g > 0 && g < 1; edge.position.set(540, 290 + 640 * (1 - g)); edge.scale.set(3.2, 0.35); edge.alpha = 0.7 * Math.sin(Math.PI * g);
      gGlow.alpha = 0.35 + 0.35 * Math.sin(Math.PI * span(t, B.om - 0.6, B.om + 2.2));
      C.rise(om, t, B.om, 1.4); C.rise(sh, t, B.shloka, 1.4);
      s.cam.s = 1 + 0.06 * E.inOut(span(t, 0, B.patrika + XF)); s.cam.y = 960 + 60 * E.inOut(span(t, 0, B.patrika));
      C.cam.dust = 0.9 * E.smooth(span(t, 0, 2.5)); C.cam.dustTint = 0xffcf80; C.cam.grain = 0.08;
      // the flame's light swells into warm paper
      C.cam.floodAdd = true; C.cam.floodColor = 0xffd9a6; C.cam.flood = 0.55 * E.inOut(span(t, 9.4, B.patrika + 0.4)) * (1 - E.smooth(span(t, B.patrika + 0.4, B.patrika + XF)));
    };
  }));

  /* ============================================================ 2 · the patrika */
  SCENES.push(() => C.scene(B.patrika, B.muggu + XF, (root, s) => {
    C.bg(root, C.paperTex());
    const frame = new PIXI.Sprite(C.A.frame); frame.anchor.set(0.5); const fk = C.fit(frame, 1010, 1520); frame.position.set(540, 960); root.addChild(frame);
    const gan = new PIXI.Sprite(C.A.ganesha); gan.anchor.set(0.5); gan.tint = C.KUM; gan.scale.set(150 / gan.texture.height); gan.position.set(540, 525); root.addChild(gan);
    const au = C.text('శ్రీరస్తు     శుభమస్తు     అవిఘ్నమస్తు', { font: C.TE2, size: 40, fill: C.KUM }); au.position.set(540, 410); root.addChild(au);
    const l1 = C.text('చల్లపల్లి వారి', { font: C.TE, size: 100, fill: C.KUM }); l1.position.set(540, 742); root.addChild(l1);
    const l2 = C.text('పెండ్లి పిలుపు', { font: C.TE, size: 146, fill: C.KUM }); l2.position.set(540, 900); root.addChild(l2);
    const shine = C.gleam(root, 540, 900, 760, 170);
    const rule = new PIXI.Graphics(); root.addChild(rule);
    const names = C.namePair(root, 'నిఖిత', 'సాయి కౌండిన్య', { font: C.TE, size: 70, fill: C.INK, gap: 84 }); names.y = 1150;
    const en = C.label('NIKHITHA  ×  SAI KOUNDINYA', { size: 30, fill: C.GOLD_D, ls: 10 }); en.position.set(540, 1252); root.addChild(en);
    const vv = C.text('వివాహ మహోత్సవ శుభ ఆహ్వానము', { font: C.TE2, size: 44, fill: C.INK2 }); vv.position.set(540, 1328); root.addChild(vv);
    const orn = new PIXI.Sprite(C.A.ornament); orn.anchor.set(0.5); orn.tint = C.GOLD; orn.scale.set(600 / orn.texture.width); orn.position.set(540, 1478); root.addChild(orn);
    const om = C.wipeMask(root, 240, 1380, 600, 200); orn.mask = om.g;
    const pas = C.dabTex('#e3a62a', 5), kum = C.dabTex('#b3261e', 6);
    const dabs = [[150, 380], [930, 380], [150, 1600], [930, 1600]].map(([x, y], i) => {
      const a = new PIXI.Sprite(pas), b = new PIXI.Sprite(kum); [a, b].forEach(d => { d.anchor.set(0.5); root.addChild(d); });
      a.position.set(x + (i % 2 ? 22 : -22), y); b.position.set(x + (i % 2 ? -26 : 26), y + 4); return { a, b, i };
    });
    return (t) => {
      const f = E.out3(span(t, B.patrika, B.patrika + 2.4)); frame.scale.set(fk * (1.05 - 0.05 * f));
      C.rise(gan, t, B.patrika + 0.8, 1.2, 12); C.rise(au, t, B.patrika + 1.2, 1.2, 12);
      C.rise(l1, t, B.line1, 1.3); C.rise(l2, t, B.line2, 1.5, 28); shine(t, B.line2 + 1.3, 1.8);
      rule.clear(); const rk = E.inOut(span(t, B.line2 + 0.6, B.line2 + 2.0));
      if (rk > 0) { rule.moveTo(540 - 300 * rk, 1022).lineTo(540 + 300 * rk, 1022).stroke({ width: 2.5, color: C.GOLD }); rule.poly([540, 1010, 552, 1022, 540, 1034, 528, 1022]).fill({ color: C.GOLD, alpha: rk }); }
      C.rise(names, t, B.names, 1.4); C.rise(en, t, B.en, 1.2, 14); C.rise(vv, t, B.en + 0.8, 1.2, 14);
      om.set(E.inOut(span(t, B.date - 1.0, B.date + 1.2)), 'center');
      dabs.forEach(d => { const ta = B.names + 0.5 + d.i * 0.25; d.a.alpha = E.smooth(span(t, ta, ta + 0.8)); d.a.scale.set(0.5 + 0.05 * E.out3(span(t, ta, ta + 0.8)));
        d.b.alpha = E.smooth(span(t, ta + 0.4, ta + 1.2)); d.b.scale.set(0.38 + 0.04 * E.out3(span(t, ta + 0.4, ta + 1.2))); });
      s.cam.s = 1 + 0.035 * E.inOut(span(t, B.patrika, B.muggu + XF)); s.cam.y = 960 - 20 * E.inOut(span(t, B.patrika, B.muggu));
      C.cam.petals = 0.85 * E.smooth(span(t, B.line2, B.line2 + 2)); C.cam.grain = 0.14;
    };
  }, XF));

  /* ============================================================ 3 · the muggu at our doorstep */
  SCENES.push(() => C.scene(B.muggu, B.bride + XF, (root, s) => {
    C.bg(root, C.canvasTex(1080, 1920, (x, w, h) => {
      x.fillStyle = '#86391f'; x.fillRect(0, 0, w, h); const r = rng(21);
      for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${r() < .5 ? '60,20,8' : '190,110,70'},${0.04 + r() * 0.06})`; x.beginPath(); x.arc(r() * w, r() * h, 20 + r() * 90, 0, 6.283); x.fill(); }
      for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(255,220,190,${r() * 0.08})`; x.fillRect(r() * w, r() * h, 1.5, 1.5); }
      const g = x.createRadialGradient(w / 2, h * 0.52, 0, w / 2, h * 0.52, h * 0.62); g.addColorStop(0, 'rgba(255,170,110,.24)'); g.addColorStop(1, 'rgba(20,4,0,.5)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    }));
    const cx = 540, cy = 1000, art = new PIXI.Container(); art.position.set(cx, cy); root.addChild(art);
    const fills2 = new PIXI.Graphics(), fills = new PIXI.Graphics(), halo = new PIXI.Graphics(), chalk = new PIXI.Graphics(), dots = new PIXI.Graphics();
    art.addChild(fills2, fills, halo, chalk, dots);
    const pol = (r, a) => [Math.cos(a) * r, Math.sin(a) * r];
    const petal = (r0, r1, a, wA, bulge) => { const pts = [], N = 36;
      for (let i = 0; i <= N; i++) { const k = i / N, q = Math.sin(k * Math.PI); pts.push(pol(lerp(r0, r1, k), a - wA * q * bulge * (1 - 0.25 * k))); }
      for (let i = N; i >= 0; i--) { const k = i / N, q = Math.sin(k * Math.PI); pts.push(pol(lerp(r0, r1, k), a + wA * q * bulge * (1 - 0.25 * k))); } return pts; };
    const circle = (r, n = 96) => Array.from({ length: n + 1 }, (_, i) => pol(r, (i / n) * 6.283 - 1.5708));
    const T0 = B.muggu + 0.6, strokes = [], add = (pts, a, b, w = 9) => strokes.push({ pts, t0: T0 + a, t1: T0 + b, w });
    add(circle(34, 40), 0, 0.6, 8);
    for (let i = 0; i < 8; i++) add(petal(40, 215, i * 0.7854 - 1.5708, 0.36, 1), 0.3 + i * 0.22, 1.8 + i * 0.22);
    add(circle(236), 1.8, 3.2, 6);
    for (let i = 0; i < 16; i++) add(petal(244, 350, i * 0.3927 - 1.5708 + 0.196, 0.15, 1), 2.6 + i * 0.1, 3.8 + i * 0.1, 7);
    for (let i = 0; i < 8; i++) add(petal(360, 452, i * 0.7854 - 1.5708, 0.13, 1.3), 3.8 + i * 0.16, 5.0 + i * 0.16, 7);
    add(circle(470, 140), 4.4, 6.4, 4);
    const dotPts = [];
    for (let i = 0; i < 8; i++) { const a = i * 0.7854 - 1.5708 + 0.3927; dotPts.push([...pol(300, a), T0 + 0.2 + i * 0.08], [...pol(410, a), T0 + 0.6 + i * 0.08]); }
    for (let i = 0; i < 16; i++) dotPts.push([...pol(505, i * 0.3927 - 1.5708), T0 + 1.0 + i * 0.05]);
    strokes.forEach(st => { let L = 0; for (let i = 1; i < st.pts.length; i++) L += Math.hypot(st.pts[i][0] - st.pts[i - 1][0], st.pts[i][1] - st.pts[i - 1][1]); st.L = L; });
    const partial = (g, st, k, w, color, alpha) => { if (k <= 0) return; const target = st.L * k; let acc = 0; g.moveTo(st.pts[0][0], st.pts[0][1]);
      for (let i = 1; i < st.pts.length; i++) { const [x0, y0] = st.pts[i - 1], [x1, y1] = st.pts[i], d = Math.hypot(x1 - x0, y1 - y0);
        if (acc + d >= target) { const f = (target - acc) / d; g.lineTo(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f); break; } g.lineTo(x1, y1); acc += d; }
      g.stroke({ width: w, color, alpha, cap: 'round', join: 'round' }); };
    for (let i = 0; i < 8; i++) fills.poly(petal(48, 205, i * 0.7854 - 1.5708, 0.3, 1).flat()).fill(C.TUR);
    fills.circle(0, 0, 26).fill(C.KUM);
    for (let i = 0; i < 16; i++) fills2.poly(petal(250, 342, i * 0.3927 - 1.5708 + 0.196, 0.12, 1).flat()).fill(C.KUM);
    const welcome = C.text('మా ఇంటి ముంగిట మీకు స్వాగతం', { font: C.TE2, size: 66, fill: C.CREAM }); welcome.position.set(540, 300); root.addChild(welcome);
    const wen = C.label('WELCOME TO OUR HOME', { size: 26, fill: 0xF1C99A, ls: 12 }); wen.position.set(540, 382); root.addChild(wen);
    const lamps = [C.diya(root, 140, 1760, 170), C.diya(root, 940, 1760, 170)];
    return (t) => {
      art.rotation = 0.08 * E.inOut(span(t, B.muggu, B.bride + XF));
      chalk.clear(); halo.clear();
      strokes.forEach(st => { const k = E.inOut(span(t, st.t0, st.t1)); partial(halo, st, k, st.w * 2.4, 0xfff4e0, 0.16); partial(chalk, st, k, st.w, 0xFBF4E6, 0.96); });
      dots.clear(); dotPts.forEach(([x, y, t0]) => { const k = E.out3(span(t, t0, t0 + 0.6)); if (k > 0) dots.circle(x, y, 9 * k).fill({ color: 0xFBF4E6, alpha: 0.95 }); });
      const f1 = E.out3(span(t, B.fill1, B.fill1 + 1.6)); fills.alpha = f1; fills.scale.set(0.9 + 0.1 * f1);
      const f2 = E.out3(span(t, B.fill2, B.fill2 + 1.6)); fills2.alpha = f2; fills2.scale.set(0.95 + 0.05 * f2);
      C.rise(welcome, t, B.muggu + 2.0, 1.5); C.rise(wen, t, B.muggu + 2.8, 1.3, 14);
      lamps.forEach((l, i) => l.set(t + i * 2.3, E.out3(span(t, 25.61 + i * 0.5, 27.0 + i * 0.5))));
      s.cam.y = 1000; s.cam.s = 1.06 - 0.06 * E.out3(span(t, B.muggu, B.muggu + 3)) + 0.05 * E.inOut(span(t, 31.0, B.bride + XF));
      C.cam.dust = 0.5; C.cam.dustTint = 0xffd9a8; C.cam.grain = 0.16;
    };
  }, XF));

  /* ============================================================ 4 · the bride, the groom, and their families */
  SCENES.push(() => C.scene(B.bride, B.stars + XF, (root, s) => {
    C.bg(root, C.paperTex());
    const LOBES = [[50, 34, 1], [36, 48, 0.85], [64, 46, 0.88], [44, 70, 0.82], [58, 20, 0.8], [52, 90, 0.78], [22, 80, 0.7], [80, 78, 0.7]];
    const people = [
      { tex: C.A.bride, ink: 'bride', zoom: 1.3, box: { x: 540, y: 640, w: 900, h: 860 }, t0: B.bride, t1: B.groom,
        name: 'చి.ల.సౌ. నిఖిత', lines: ['శ్రీ చల్లపల్లి శ్రీధర్ గారు', 'శ్రీమతి వెంకట కృష్ణవేణి గార్ల కుమార్తె'] },
      { tex: C.A.groom, ink: 'groom', zoom: 1.0, box: { x: 540, y: 640, w: 900, h: 860 }, t0: B.groom, t1: B.stars,
        name: 'చి. సాయి కౌండిన్య', lines: ['కొవ్వూరు వాస్తవ్యులు', 'శ్రీ కొక్కిరాల వి.వి. హరిమోహన్ గారు', 'శ్రీమతి శైలజ గార్ల కుమారుడు'] },
    ].map(p => {
      const g = new PIXI.Container(); root.addChild(g); p.g = g;
      p.pic = C.bloomPortrait(g, p.tex, p.box, LOBES, p.zoom);
      p.ink = C.inkLettering(g, p.ink, 540, 1180, 420);
      p.nm = C.text(p.name, { font: C.TE, size: 62, fill: C.INK }); p.nm.position.set(540, 1338); g.addChild(p.nm);
      p.ls = p.lines.map((l, i) => { const x = C.text(l, { font: C.TE2, size: 42, fill: C.INK2 }); x.position.set(540, 1412 + i * 50); g.addChild(x); return x; });
      return p;
    });
    s.prep = async (t) => { for (const p of people) if (t >= p.t0 - 0.2 && t < p.t1 + XF) await p.ink.set(span(t, p.t0 + 1.4, p.t0 + 4.2)); };
    return (t) => {
      people.forEach((p, i) => {
        const on = t >= p.t0 - 0.1 && t < p.t1 + XF; p.g.visible = on; if (!on) return;
        p.pic.set(E.out3(span(t, p.t0 + 0.1, p.t0 + 2.4)));
        const inK = i ? E.smooth(span(t, p.t0, p.t0 + XF)) : 1, outK = i ? 0 : E.smooth(span(t, p.t1, p.t1 + XF));
        p.g.alpha = inK * (1 - outK); p.g.x = (i ? 40 * (1 - inK) : -40 * outK);
        C.rise(p.nm, t, p.t0 + 3.6, 1.2, 14); p.ls.forEach((l, j) => C.rise(l, t, p.t0 + 4.2 + j * 0.45, 1.2, 12));
      });
      s.cam.s = 1 + 0.03 * E.inOut(span(t, B.bride, B.groom)) + 0.03 * E.inOut(span(t, B.groom, B.stars));
      C.cam.dust = 0.25; C.cam.dustTint = 0xffe2b0; C.cam.grain = 0.12;
      C.cam.floodAdd = true; C.cam.floodColor = 0xfff0d8; C.cam.flood = 0.0;
    };
  }, XF));

  /* ============================================================ 5 · written in the stars */
  SCENES.push(() => C.scene(B.stars, B.muhurtham + XF, (root, s) => {
    C.bg(root, C.linear(8, 512, [[0, '#06050c'], [0.55, '#110b1d'], [1, '#22102a']]));
    [[300, 600, 0x5a2a6a, 7], [820, 1300, 0x6a3a1a, 8], [520, 1000, 0x2a2a6a, 10]].forEach(([x, y, c, k]) => { const n = new PIXI.Sprite(C.glowTex()); n.anchor.set(0.5); n.position.set(x, y); n.tint = c; n.scale.set(k); n.alpha = 0.18; n.blendMode = 'add'; root.addChild(n); });
    const r = rng(77), stars = [];
    for (let i = 0; i < 650; i++) { const st = new PIXI.Sprite(C.dotTex()); st.anchor.set(0.5); st.blendMode = 'add'; const z = r(); st.tint = r() < 0.15 ? 0xffe0b0 : 0xdfe6ff; root.addChild(st); stars.push({ s: st, x: r() * W, y: r() * H, z, a: 0.25 + 0.75 * r() * r() + 0.2 * z, sz: 0.02 + 0.07 * z * z }); }
    const flareTex = C.canvasTex(512, 512, (x, w) => { [[0, 1], [1, 0]].forEach(([a]) => { const g = a ? x.createLinearGradient(0, w / 2, w, w / 2) : x.createLinearGradient(w / 2, 0, w / 2, w); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; a ? x.fillRect(0, w / 2 - 2, w, 4) : x.fillRect(w / 2 - 2, 0, 4, w); }); });
    const mk = tint => { const c = new PIXI.Container(); const g = new PIXI.Sprite(C.glowTex()); g.anchor.set(0.5); g.tint = tint; g.blendMode = 'add'; const f = new PIXI.Sprite(flareTex); f.anchor.set(0.5); f.blendMode = 'add'; f.tint = tint; const d = new PIXI.Sprite(C.dotTex()); d.anchor.set(0.5); d.blendMode = 'add'; c.addChild(g, f, d); root.addChild(c); return { c, g, f, d }; };
    const vas = mk(0xcfe0ff), aru = mk(0xffd59a), one = mk(0xfff0d0);
    const bloom = new PIXI.Sprite(C.glowTex()); bloom.anchor.set(0.5); bloom.tint = 0xffc977; bloom.blendMode = 'add'; root.addChild(bloom);
    const ring = new PIXI.Graphics(); root.addChild(ring);
    function targets(str, size, y, step) {
      const c = document.createElement('canvas'); c.width = W; c.height = 400; const x = c.getContext('2d');
      x.font = `${size}px Ramabhadra`; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(str, W / 2, 200);
      const d = x.getImageData(0, 0, W, 400).data, pts = []; for (let py = 0; py < 400; py += step) for (let px = 0; px < W; px += step) if (d[(py * W + px) * 4 + 3] > 140) pts.push([px, y - 200 + py]); return pts;
    }
    const rr = rng(91), parts = [];
    [['నిఖిత', 230, 860, 7, B.nik, 2.4], ['సాయి కౌండిన్య', 158, 1110, 6, B.sai, 3.0]].forEach(([str, size, y, step, t0, dur]) => {
      const pts = targets(str, size, y, step), xs = pts.map(p => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs);
      pts.forEach(([x, y]) => { const sp = new PIXI.Sprite(C.dotTex()); sp.anchor.set(0.5); sp.blendMode = 'add'; sp.tint = rr() < 0.3 ? 0xffffff : 0xffd98c; root.addChild(sp);
        parts.push({ s: sp, x, y, t0: t0 + (x - x0) / (x1 - x0 || 1) * dur * 0.8 + rr() * 0.15, fly: 0.9 + rr() * 0.5, cx: (rr() - 0.5) * 520, cy: -120 - rr() * 260, sz: 0.045 + rr() * 0.03, ph: rr() * 6 }); });
    });
    const glowN = new PIXI.Container(); root.addChild(glowN);
    const n1 = C.text('నిఖిత', { font: C.TE, size: 230, fill: C.GOLD_HI }), n2 = C.text('సాయి కౌండిన్య', { font: C.TE, size: 158, fill: C.GOLD_HI });
    n1.position.set(540, 860); n2.position.set(540, 1110);
    [n1, n2].forEach(n => { const g = C.text(n.text, { font: C.TE, size: n.style.fontSize, fill: 0xffb547 }); g.position.copyFrom(n.position); g.blendMode = 'add'; g.filters = [new PIXI.BlurFilter({ strength: 16, quality: 3 })]; glowN.addChild(g); });
    root.addChild(n1, n2);
    const orn = new PIXI.Graphics(); root.addChild(orn);
    const wit = C.text('అరుంధతి నక్షత్రం సాక్షిగా', { font: C.TE2, size: 68, fill: C.CREAM }); wit.position.set(540, 1340); root.addChild(wit);
    const wen = C.label('WITH ARUNDHATI AS OUR WITNESS', { size: 24, fill: C.GOLD, ls: 9 }); wen.position.set(540, 1420); root.addChild(wen);
    return (t) => {
      const lt = t - B.stars;
      stars.forEach(p => { const py = ((p.y - lt * 5 * (0.3 + p.z)) % H + H) % H; p.s.position.set(p.x, py); p.s.scale.set(p.sz); p.s.alpha = p.a; });
      const k = span(t, B.stars, B.merge), rad = 190 * (1 - E.inOut(k)), ang = 2.2 + 7 * Math.pow(k, 1.5);
      const merged = t >= B.merge;
      [[vas, 1], [aru, -1]].forEach(([st, sg]) => { st.c.visible = !merged; st.c.position.set(540 + sg * Math.cos(ang) * rad, 700 + sg * Math.sin(ang) * rad * 0.55);
        st.g.scale.set(1.0 + 0.6 * k); st.g.alpha = 0.55; st.f.scale.set(0.5 + 0.4 * k); st.f.rotation = lt * 0.2; st.d.scale.set(0.22); });
      const rise = E.inOut(span(t, B.merge + 0.6, B.merge + 2.4)), oy = lerp(700, 470, rise);
      one.c.visible = merged; one.c.position.set(540, oy);
      const m = merged ? Math.exp(-(t - B.merge) * 1.2) : 0;
      one.g.scale.set(1.6 + 2.2 * m); one.g.alpha = 0.7; one.f.scale.set(0.9 + 1.0 * m); one.f.rotation = 0.2 + lt * 0.05; one.d.scale.set(0.3 + 0.25 * m);
      bloom.position.set(540, 700); bloom.scale.set(5 + 8 * (1 - m)); bloom.alpha = merged ? 0.8 * m : 0;
      ring.clear(); const rk = span(t, B.merge, B.merge + 2.6); if (rk > 0 && rk < 1) ring.circle(540, 700, 40 + 620 * E.out3(rk)).stroke({ width: 2, color: 0xffd98c, alpha: 0.45 * (1 - rk) });
      parts.forEach(p => { const q = span(t, p.t0, p.t0 + p.fly); if (q <= 0) { p.s.visible = false; return; } p.s.visible = true;
        const e = E.inOut(q), sx = 540, sy = oy, mx = (sx + p.x) / 2 + p.cx, my = (sy + p.y) / 2 + p.cy;
        p.s.position.set((1 - e) * (1 - e) * sx + 2 * (1 - e) * e * mx + e * e * p.x + (q >= 1 ? 1.2 * Math.sin(t * 2 + p.ph) : 0), (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * my + e * e * p.y);
        p.s.scale.set(p.sz * (q < 1 ? 1.3 : 1)); p.s.alpha = 1 - E.smooth(span(t, B.lock, B.lock + 1.6)); });
      const lock = E.smooth(span(t, B.lock - 0.6, B.lock + 0.6)); n1.alpha = n2.alpha = lock; glowN.alpha = 0.55 * lock;
      orn.clear(); const ok = E.out3(span(t, B.lock + 0.4, B.lock + 1.6)); if (ok > 0) { orn.moveTo(540 - 120 * ok, 985).lineTo(522, 985).moveTo(558, 985).lineTo(540 + 120 * ok, 985).stroke({ width: 2, color: C.GOLD }); orn.poly([540, 975, 550, 985, 540, 995, 530, 985]).fill(C.GOLD); }
      C.rise(wit, t, B.lock + 0.8, 1.4); C.rise(wen, t, B.lock + 1.4, 1.2, 12);
      s.cam.s = 1 + 0.04 * E.inOut(span(t, B.stars, B.muhurtham + XF));
      C.cam.dust = 0; C.cam.grain = 0.08;
    };
  }, XF));

  /* ============================================================ 6 · the muhurtham and the venue */
  SCENES.push(() => C.scene(B.muhurtham, B.hush + XF, (root, s) => {
    C.bg(root, C.radial([[0, '#b8251c'], [0.6, '#851811'], [1, '#3c0705']], 512));
    const sheen = new PIXI.Sprite(C.linear(1080, 1920, [[0, 'rgba(255,220,180,0)'], [0.45, 'rgba(255,220,180,.08)'], [0.5, 'rgba(255,235,200,.13)'], [0.55, 'rgba(255,220,180,.06)'], [1, 'rgba(255,220,180,0)']], false)); sheen.blendMode = 'add'; root.addChild(sheen);
    const frameG = new PIXI.Graphics(); root.addChild(frameG);
    const head = C.text('సుముహూర్తం', { font: C.TE, size: 124, fill: C.GOLD_HI }); head.position.set(540, 330); root.addChild(head);
    const hen = C.label('THE MUHURTHAM', { size: 26, fill: C.GOLD, ls: 14 }); hen.position.set(540, 425); root.addChild(hen);
    const day = C.text('ఆదివారం  ·  13 డిసెంబర్ 2026', { font: C.TE, size: 58, fill: C.CREAM }); day.position.set(540, 560); root.addChild(day);
    const den = C.label('SUNDAY · 13 DECEMBER 2026', { size: 26, fill: 0xF3D9A6, ls: 9 }); den.position.set(540, 636); root.addChild(den);
    // the time arrives as a slow odometer, settling on 8:22
    const clock = new PIXI.Container(); clock.position.set(540, 800); root.addChild(clock);
    const roll = ['8:19', '8:20', '8:21', '8:22'].map((str, i) => { const x = C.text(str, { font: C.EN, size: 210, fill: C.GOLD_HI, weight: '300', ls: 6 }); x.y = i * 230; clock.addChild(x); return x; });
    const cm = new PIXI.Graphics().rect(140, 680, 800, 240).fill(0xffffff); root.addChild(cm); clock.mask = cm;
    const pm = C.label('రాత్రి  ·  PM', { size: 30, fill: C.GOLD, ls: 10, font: C.EN }); pm.position.set(540, 945); root.addChild(pm);
    const pin = new PIXI.Graphics().circle(0, -10, 18).fill(C.GOLD_HI).poly([-16, -2, 16, -2, 0, 28]).fill(C.GOLD_HI).circle(0, -10, 7).fill(0x8a1912); pin.position.set(540, 1102); root.addChild(pin);
    const v1 = C.text('శ్రీ కొత్తపల్లి శ్రీరాములు కనకమ్మ\nలయన్స్ A/C కళ్యాణమండపం', { font: C.TE2, size: 54, fill: C.CREAM, lh: 74 }); v1.position.set(540, 1240); root.addChild(v1);
    const v2 = C.text('Sri Kothapalli Sriramulu Kanakamma\nLions A/C Kalyana Mandapam', { font: C.EN, size: 32, fill: 0xF3D9A6, weight: '400', lh: 46, ls: 1 }); v2.position.set(540, 1400); root.addChild(v2);
    const v3 = C.label('R.T.C COMPLEX ROAD · NIDADAVOLU 534301', { size: 24, fill: C.GOLD, ls: 6 }); v3.position.set(540, 1490); root.addChild(v3);
    return (t) => {
      sheen.x = -500 + 1000 * E.inOut(span(t, B.muhurtham, B.hush));
      frameG.clear(); const fk = E.inOut(span(t, B.muhurtham + 0.4, B.muhurtham + 2.6));
      if (fk > 0) { const x0 = 70, y0 = 200, w = 940, h = 1380, L = (2 * w + 2 * h) * fk; let rest = L; frameG.moveTo(x0, y0);
        [[x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h], [x0, y0]].reduce((p, q) => { if (rest <= 0) return q; const d = Math.hypot(q[0] - p[0], q[1] - p[1]), f = Math.min(1, rest / d); frameG.lineTo(p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f); rest -= d; return q; }, [x0, y0]);
        frameG.stroke({ width: 2, color: C.GOLD, alpha: 0.8 }); }
      C.rise(head, t, B.muhurtham + 0.5, 1.4); C.rise(hen, t, B.muhurtham + 1.2, 1.2, 12);
      C.rise(day, t, B.day, 1.3); C.rise(den, t, B.day + 0.6, 1.2, 12);
      let k = 0; for (let i = 0; i < 3; i++) k += E.inOut(span(t, B.time + 0.6 + i * 0.95, B.time + 1.3 + i * 0.95));
      clock.alpha = E.smooth(span(t, B.time, B.time + 0.8)); clock.y = 800 - k * 230 - 20 * (1 - clock.alpha);
      roll.forEach(x => { x.y = roll.indexOf(x) * 230; });
      C.rise(pm, t, B.time + 3.3, 1.0, 10);
      C.rise(pin, t, B.venue, 1.0, 14); C.rise(v1, t, B.venue + 0.4, 1.4); C.rise(v2, t, B.venue + 1.2, 1.3, 14); C.rise(v3, t, B.venue + 1.9, 1.2, 10);
      s.cam.s = 1 + 0.03 * E.inOut(span(t, B.muhurtham, B.hush + XF));
      C.cam.dust = 0.45; C.cam.dustTint = 0xffd27a; C.cam.grain = 0.1;
    };
  }, XF));

  /* ============================================================ 7–8 · the hush, then the moment */
  SCENES.push(() => C.scene(B.hush, B.events + XF, (root, s) => {
    const dark = C.bg(root, C.radial([[0, '#3a0d0a'], [0.6, '#1a0605'], [1, '#070202']], 512));
    const silk = C.bg(root, C.radial([[0, '#c22a20'], [0.55, '#8c1a13'], [1, '#3e0806']], 512));
    const mandala = new PIXI.Graphics(); root.addChild(mandala);
    const R0 = 560; const drawMandala = () => { mandala.clear();
      for (let ring = 0; ring < 3; ring++) { const R = R0 + ring * 70, n = 24 + ring * 12;
        for (let i = 0; i < n; i++) { const a = i / n * 6.283, a2 = (i + 0.5) / n * 6.283;
          mandala.moveTo(Math.cos(a) * R, Math.sin(a) * R).quadraticCurveTo(Math.cos(a2) * (R + 46), Math.sin(a2) * (R + 46), Math.cos(a + 6.283 / n) * R, Math.sin(a + 6.283 / n) * R); }
        mandala.stroke({ width: 2, color: C.GOLD_HI, alpha: 0.5 - ring * 0.12 }); mandala.circle(0, 0, R - 14).stroke({ width: 1.2, color: C.GOLD, alpha: 0.4 }); } };
    drawMandala(); mandala.position.set(540, 880);
    const pic = new PIXI.Container(); pic.position.set(540, 880); root.addChild(pic);
    const aw = 680, ah = 900, arch = (g, inset = 0) => { const w = aw / 2 - inset, top = -ah / 2 + inset, bot = ah / 2 - inset; g.moveTo(-w, bot).lineTo(-w, top + w).arc(0, top + w, w, Math.PI, 0).lineTo(w, bot).closePath(); };
    const shadow = new PIXI.Sprite(C.glowTex()); shadow.anchor.set(0.5); shadow.tint = 0x1a0201; shadow.scale.set(5.5, 6.5); shadow.alpha = 0.5; pic.addChild(shadow);
    const ph = new PIXI.Sprite(C.A.couple); ph.anchor.set(0.5, 0.48); ph.scale.set(Math.max(aw / ph.texture.width, ah / ph.texture.height) * 1.02); pic.addChild(ph);
    const am = new PIXI.Graphics(); arch(am); am.fill(0xffffff); pic.addChild(am); ph.mask = am;
    const lightIn = new PIXI.Sprite(C.glowTex()); lightIn.anchor.set(0.5); lightIn.tint = 0xfff0cc; lightIn.blendMode = 'add'; pic.addChild(lightIn);
    const line = new PIXI.Graphics(); pic.addChild(line);
    // gold arch outline, drawn during the hush
    const archPts = (inset) => { const w = aw / 2 - inset, top = -ah / 2 + inset, bot = ah / 2 - inset, pts = [[-w, bot], [-w, top + w]];
      for (let i = 0; i <= 40; i++) { const a = Math.PI + i / 40 * Math.PI; pts.push([Math.cos(a) * w, top + w + Math.sin(a) * w]); } pts.push([w, bot], [-w, bot]); return pts; };
    const outer = archPts(-10), inner = archPts(-24);
    const drawPart = (pts, k, width, color) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      let rest = L * k; line.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length && rest > 0; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]), f = Math.min(1, rest / d); line.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f); rest -= d; }
      line.stroke({ width, color }); };
    // talambralu, thrown three times and falling in slow motion
    const r = rng(101), rice = [], rl = new PIXI.Container(); root.addChild(rl);
    [B.drop, B.toss2, B.toss3].forEach((t0, b) => { for (let i = 0; i < 150; i++) { const sp = new PIXI.Sprite(C.riceTex()); sp.anchor.set(0.5); rl.addChild(sp);
      const a = -Math.PI / 2 + (r() - 0.5) * 1.9, v = 700 + r() * 900; rice.push({ s: sp, t0: t0 + r() * 0.2, x0: 540 + (r() - 0.5) * 300, y0: 1500, vx: Math.cos(a) * v, vy: Math.sin(a) * v, sp: (r() - 0.5) * 6, ph: r() * 6, sz: 0.55 + r() * 0.7 }); } });
    const hushRice = []; for (let i = 0; i < 80; i++) { const sp = new PIXI.Sprite(C.riceTex()); sp.anchor.set(0.5); rl.addChild(sp); hushRice.push({ s: sp, x: r() * W, y0: H * (0.3 + r()), v: 30 + r() * 60, ph: r() * 6, sz: 0.4 + r() * 0.5 }); }
    const garland = C.toranam(root, 70, 9);
    const names = C.namePair(root, 'నిఖిత', 'సాయి కౌండిన్య', { font: C.TE, size: 80, fill: C.CREAM, heart: C.GOLD_HI, hs: 1.7, gap: 96 }); names.y = 1455;
    const when = C.label('13 · 12 · 2026  ·  8:22 PM', { size: 30, fill: C.GOLD_HI, ls: 10 }); when.position.set(540, 1555); root.addChild(when);
    const tal = C.text('తలంబ్రాలు', { font: C.TE2, size: 52, fill: C.GOLD_HI }); tal.position.set(540, 300); root.addChild(tal);
    return (t) => {
      silk.alpha = E.smooth(span(t, B.drop - 0.2, B.drop + 1.6));
      const pre = E.inOut(span(t, B.hush + 1.0, B.drop - 0.4));
      line.clear(); drawPart(outer, pre, 7, C.GOLD); drawPart(inner, E.inOut(span(t, B.hush + 2.0, B.drop - 0.2)), 2, C.GOLD_HI);
      // the photograph appears inside the arch in a swell of warm light
      const open = E.smooth(span(t, B.drop - 0.15, B.drop + 1.8)); ph.alpha = open; shadow.alpha = 0.5 * open;
      const L = t >= B.drop - 0.3 ? Math.exp(-Math.max(0, t - B.drop) * 1.1) * E.smooth(span(t, B.drop - 0.3, B.drop + 0.1)) : 0;
      lightIn.scale.set(7 + 6 * (1 - L)); lightIn.alpha = 0.95 * L;
      pic.scale.set(1.04 - 0.04 * E.out3(span(t, B.drop, B.drop + 3)) + 0.03 * E.inOut(span(t, B.drop + 3, B.events + XF)));
      mandala.alpha = 0.9 * E.smooth(span(t, B.drop + 0.4, B.drop + 2.4)); mandala.rotation = 0.05 * (t - B.drop); mandala.scale.set(0.9 + 0.1 * E.out3(span(t, B.drop, B.drop + 3)));
      hushRice.forEach(h => { const vis = t < B.drop + 1; h.s.visible = vis; if (!vis) return; h.s.position.set(h.x + 20 * Math.sin(t * 0.8 + h.ph), h.y0 - h.v * (t - B.hush)); h.s.rotation = h.ph + t * 0.3; h.s.scale.set(h.sz); h.s.alpha = 0.7 * E.smooth(span(t, B.hush + 0.5, B.hush + 2.5)) * (1 - E.smooth(span(t, B.drop, B.drop + 1))); });
      const SLOW = 0.38, G = 700;
      rice.forEach(g => { const dt = (t - g.t0) * SLOW; g.s.visible = dt > 0; if (dt <= 0) return;
        g.s.position.set(g.x0 + g.vx * dt, g.y0 + g.vy * dt + 0.5 * G * dt * dt + 8 * Math.sin(t * 2 + g.ph)); g.s.rotation = g.ph + g.sp * dt; g.s.scale.set(g.sz); g.s.alpha = g.s.y > H + 40 ? 0 : 1; });
      garland.set(t, B.toss2 - 0.4, 1.8);
      C.rise(tal, t, B.toss2, 1.4, 14);
      C.rise(names, t, B.coupleNames, 1.5); C.rise(when, t, B.coupleNames + 1.0, 1.3, 12);
      s.cam.s = 1 + 0.02 * E.inOut(span(t, B.hush, B.drop));
      C.cam.dust = 0.5 + 0.3 * E.smooth(span(t, B.drop, B.drop + 2)); C.cam.dustTint = 0xffd27a;
      C.cam.petals = 0.9 * E.smooth(span(t, B.toss2, B.toss2 + 2)); C.cam.grain = 0.1;
    };
  }, XF));

  /* ============================================================ 9 · the celebrations */
  SCENES.push(() => C.scene(B.events, B.shubham + XF, (root, s) => {
    C.bg(root, C.paperTex());
    const head = C.text('వేడుకలు', { font: C.TE, size: 124, fill: C.KUM }); head.position.set(540, 300); root.addChild(head);
    const sub = C.label('THE CELEBRATIONS', { size: 26, fill: C.GOLD_D, ls: 12 }); sub.position.set(540, 398); root.addChild(sub);
    const rows = [
      { icon: C.A.gorintaku, te: 'గోరింటాకు', en: 'MEHENDI', when: 'FRI · 11 DEC · 4:00 PM ONWARDS' },
      { icon: C.A.marigold, te: 'హల్దీ', en: 'HALDI', when: 'SAT · 12 DEC · 3:30 PM ONWARDS' },
      { icon: C.A.bangles, te: 'పెండ్లికూతురు', en: 'PENDLIKUTHURU', when: 'SAT · 12 DEC · 9:25 AM' },
      { icon: C.A.kalasham, te: 'వివాహం', en: 'THE WEDDING', when: 'SUN · 13 DEC · 8:22 PM', hero: true },
    ].map((e, i) => {
      const c = new PIXI.Container(); c.y = 570 + i * 230; root.addChild(c);
      const card = new PIXI.Graphics(); if (e.hero) card.roundRect(80, -100, 920, 220, 6).fill(C.KUM); else card.moveTo(110, 115).lineTo(970, 115).stroke({ width: 1.5, color: C.GOLD, alpha: 0.6 }); c.addChild(card);
      const ic = new PIXI.Sprite(e.icon); ic.anchor.set(0.5); C.fit(ic, 150, 150); ic.position.set(200, 6); c.addChild(ic);
      const te = C.text(e.te, { font: C.TE, size: e.hero ? 84 : 72, fill: e.hero ? C.GOLD_HI : C.KUM, ax: 0 }); te.position.set(312, -26); c.addChild(te);
      const en = C.label(e.en, { size: 22, fill: e.hero ? C.CREAM : C.INK2, ls: 7, ax: 0 }); en.position.set(316, 34); c.addChild(en);
      const wh = C.label(e.when, { size: 28, fill: e.hero ? C.CREAM : C.INK, ls: 4, weight: '500', ax: 0 }); wh.position.set(316, 78); c.addChild(wh);
      return Object.assign(e, { c, at: B.events + 1.2 + i * 1.0 });
    });
    return (t) => {
      C.rise(head, t, B.events + 0.3, 1.3); C.rise(sub, t, B.events + 0.8, 1.2, 12);
      rows.forEach(e => { const k = E.out3(span(t, e.at, e.at + 1.2)); e.c.alpha = k; e.c.x = 60 * (1 - k); });
      s.cam.s = 1 + 0.025 * E.inOut(span(t, B.events, B.shubham + XF));
      C.cam.petals = 0.35; C.cam.grain = 0.14;
    };
  }, XF));

  /* ============================================================ 10 · శుభం, and the family's invitation */
  SCENES.push(() => C.scene(B.shubham, B.end + 0.1, (root, s) => {
    C.bg(root, C.radial([[0, '#c0281f'], [0.6, '#8a1912'], [1, '#420806']], 512));
    const garland = C.toranam(root, 60, 13);
    const orn = new PIXI.Sprite(C.A.ornament); orn.anchor.set(0.5); orn.tint = C.GOLD_HI; orn.scale.set(600 / orn.texture.width); orn.position.set(540, 400); root.addChild(orn);
    const grad = new PIXI.FillGradient(0, 470, 0, 850); grad.addColorStop(0, 0xFCE7A6); grad.addColorStop(0.5, 0xE2B04A); grad.addColorStop(1, 0xA8741F);
    const glow = C.text('శుభం', { font: C.TE, size: 300, fill: 0xffa53a }); glow.position.set(540, 660); glow.blendMode = 'add'; glow.filters = [new PIXI.BlurFilter({ strength: 24, quality: 3 })]; root.addChild(glow);
    const word = C.text('శుభం', { font: C.TE, size: 300, fill: grad }); word.position.set(540, 660); root.addChild(word);
    const shine = C.gleam(root, 540, 660, 680, 360);
    const inv = ['మీరు సకుటుంబ సపరివార సమేతంగా విచ్చేసి,', 'నూతన వధూవరులను ఆశీర్వదించవలసినదిగా', 'సాదరంగా ఆహ్వానిస్తున్నాము.'].map((l, i) => { const x = C.text(l, { font: C.TE2, size: 46, fill: C.CREAM }); x.position.set(540, 930 + i * 64); root.addChild(x); return x; });
    const names = C.namePair(root, 'నిఖిత', 'సాయి కౌండిన్య', { font: C.TE, size: 76, fill: C.GOLD_HI, heart: C.GOLD_HI, hs: 1.7, gap: 92 }); names.y = 1160;
    const sign = C.text('ఇట్లు, చల్లపల్లి కుటుంబ సభ్యులు', { font: C.TE2, size: 48, fill: 0xF3D9A6 }); sign.position.set(540, 1290); root.addChild(sign);
    const date = C.label('SUNDAY · 13 · 12 · 2026 · 8:22 PM · NIDADAVOLU', { size: 22, fill: C.GOLD_HI, ls: 6 }); date.position.set(540, 1370); root.addChild(date);
    const lamps = [C.diya(root, 210, 1700, 240), C.diya(root, 870, 1700, 240)];
    return (t) => {
      garland.set(t, B.shubham + 0.6, 1.8);
      C.rise(orn, t, B.shubham + 0.4, 1.4, 12);
      const wk = E.out3(span(t, B.shubham + 0.6, B.shubham + 2.2)); word.alpha = wk; word.scale.set(1.06 - 0.06 * wk); glow.scale.copyFrom(word.scale); glow.alpha = 0.55 * wk;
      shine(t, B.shubham + 2.4, 2.0);
      inv.forEach((l, i) => C.rise(l, t, B.invite + i * 0.6, 1.3, 12));
      C.rise(names, t, 115.61, 1.4); C.rise(sign, t, B.sign, 1.3, 12); C.rise(date, t, B.sign + 0.8, 1.2, 10);
      lamps.forEach((l, i) => l.set(t + i * 3.1, E.out3(span(t, B.shubham + 1.2 + i * 0.4, B.shubham + 2.6 + i * 0.4))));
      s.cam.s = 1 + 0.03 * E.inOut(span(t, B.shubham, B.end));
      C.cam.dust = 0.5; C.cam.dustTint = 0xffd27a; C.cam.petals = 0.4; C.cam.grain = 0.1;
      C.cam.floodColor = 0x000000; C.cam.flood = E.inOut(span(t, B.end - 2.2, B.end));
    };
  }, XF));
})();

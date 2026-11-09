/* Pendli Pilupu · the invitation film (about two minutes)
   "Dichotomy of Fame" from its first note. Scenes change on the song's bar lines
   (measured: 123 bpm, phrases at 21.8, 46.7, 62.7, 80.0, the drop at 87.7, 103.6, 111.4)
   and dissolve into each other. Materials: silk, brocade, gold foil, filigree, lamplight. */
(function () {
  const { W, H, E, span, clamp, lerp, rng } = C;
  const B = { light: 1.53, ganesha: 3.2, om: 6.69, shloka: 8.48, patrika: 10.29, line1: 12.12, line2: 14.07, names: 16.02, en: 17.9, date: 19.85,
    muggu: 21.83, fill1: 27.61, fill2: 29.58, bride: 33.37, groom: 41.1, stars: 48.69, merge: 52.66, nik: 54.61, sai: 56.61, lock: 60.72,
    muhurtham: 62.72, day: 64.69, time: 66.5, venue: 72.24, hush: 80.04, drop: 87.7, toss2: 89.58, toss3: 91.51, coupleNames: 93.55,
    events: 103.58, shubham: 111.43, invite: 113.64, sign: 117.59, end: 121.5 };
  C.DURATION = B.end; C.B = B;
  const SCENES = window.SCENES = [];
  const XF = 1.4; // dissolve length
  const RED = () => C._red || (C._red = C.brocadeTex('#b9271d', '#86170f', '#360604', 'rgba(255,214,150,.07)', 3));
  const DEEP = () => C._deep || (C._deep = C.brocadeTex('#3d0f0b', '#1c0605', '#060202', 'rgba(255,200,140,.045)', 4));

  /* ============================================================ 1 · the lamp and the blessing */
  SCENES.push(() => C.scene(0, B.patrika + XF, (root, s) => {
    C.bg(root, DEEP());
    const rays = C.rays(root, 540, 1330, 0xffb860, 2.4);
    const warm = new PIXI.Sprite(C.glowTex()); warm.anchor.set(0.5); warm.tint = 0xff8a2a; warm.blendMode = 'add'; warm.position.set(540, 1300); root.addChild(warm);
    const diya = C.diya(root, 540, 1740, 380);
    // Ganesha in gold, written upward by the lamp's light, with a light that crosses it
    const gc = new PIXI.Container(); root.addChild(gc);
    const gGlow = new PIXI.Sprite(C.A.ganesha), gan = new PIXI.Sprite(C.A.ganesha), gm = new PIXI.Sprite(C.A.ganesha);
    gGlow.tint = 0xffb84a; gGlow.blendMode = 'add'; gGlow.filters = [new PIXI.BlurFilter({ strength: 26, quality: 4 })]; gan.tint = 0xE2B04A;
    const gk = 580 / gan.texture.height; [gGlow, gan, gm].forEach(g => { g.anchor.set(0.5); g.scale.set(gk); g.position.set(540, 610); gc.addChild(g); });
    const sweep = new PIXI.Sprite(C.linear(200, 8, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,250,230,.9)'], [1, 'rgba(255,255,255,0)']], false)); sweep.anchor.set(0.5); sweep.width = 220; sweep.height = 1200; sweep.rotation = 0.35; sweep.blendMode = 'add'; sweep.mask = gm; gc.addChild(sweep);
    const wm = C.wipeMask(root, 160, 290, 760, 660); gc.mask = wm.g;
    const edge = new PIXI.Sprite(C.glowTex()); edge.anchor.set(0.5); edge.tint = 0xffd27a; edge.blendMode = 'add'; root.addChild(edge);
    const om = C.foil(root, 'శ్రీ గణేశాయ నమః', { font: C.TE2, size: 92 }); om.position.set(540, 1010);
    const sh = C.text('శ్రీరస్తు   ·   శుభమస్తు   ·   అవిఘ్నమస్తు', { font: C.TE2, size: 48, fill: 0xF3D9A6 }); sh.position.set(540, 1118); root.addChild(sh);
    const fg = C.foreground(root, [['marigold', 70, 1900, 1.5, 0.3, 14], ['leaf', 1040, 1820, 1.2, -0.6, 10], ['marigold', 1010, 1960, 1.2, 0, 16], ['leaf', 40, -40, 1.4, 2.6, 12]]);
    return (t) => {
      const lit = E.out3(span(t, B.light, B.light + 1.6)); diya.set(t, lit, E.in3(span(t, 9.4, B.patrika + 0.6)));
      rays(t, 0.55 * lit); warm.scale.set(4 + 4 * lit); warm.alpha = 0.25 * lit;
      const g = E.inOut(span(t, B.ganesha, B.om)); wm.set(g);
      edge.visible = g > 0 && g < 1; edge.position.set(540, 290 + 660 * (1 - g)); edge.scale.set(3.4, 0.35); edge.alpha = 0.7 * Math.sin(Math.PI * g);
      gGlow.alpha = 0.3 + 0.3 * Math.sin(Math.PI * span(t, B.om - 0.6, B.om + 2.4));
      const sk = span(t, B.om + 0.3, B.om + 2.3); sweep.visible = sk > 0 && sk < 1; sweep.position.set(lerp(260, 820, E.inOut(sk)), 610);
      C.rise(om, t, B.om, 1.5); om.sweep(t, B.shloka - 0.6, 1.8); C.rise(sh, t, B.shloka, 1.5);
      s.cam.s = 1 + 0.07 * E.inOut(span(t, 0, B.patrika + XF)); s.cam.y = 960 + 50 * E.inOut(span(t, 0, B.patrika));
      fg(t, 0, -30 * E.inOut(span(t, 0, B.patrika + XF)), E.smooth(span(t, 0.5, 2.5)));
      C.cam.dust = 0.85 * E.smooth(span(t, 0, 2.5)); C.cam.dustTint = 0xffcf80; C.cam.grain = 0.07;
      C.cam.floodAdd = true; C.cam.floodColor = 0xffd9a6; C.cam.flood = 0.5 * E.inOut(span(t, 9.6, B.patrika + 0.5)) * (1 - E.smooth(span(t, B.patrika + 0.5, B.patrika + XF)));
    };
  }));

  /* ============================================================ 2 · the patrika */
  SCENES.push(() => C.scene(B.patrika, B.muggu + XF, (root, s) => {
    C.bg(root, C.silkTex());
    const sheen = C.sheen(root, 0.1);
    const frame = new PIXI.Sprite(C.A.frame); frame.anchor.set(0.5); const fk = C.fit(frame, 1010, 1520); frame.position.set(540, 960); root.addChild(frame);
    const gan = new PIXI.Sprite(C.A.ganesha); gan.anchor.set(0.5); gan.tint = C.KUM; gan.scale.set(150 / gan.texture.height); gan.position.set(540, 525); root.addChild(gan);
    const au = C.text('శ్రీరస్తు     శుభమస్తు     అవిఘ్నమస్తు', { font: C.TE2, size: 42, fill: C.KUM }); au.position.set(540, 410); root.addChild(au);
    const l1 = C.text('చల్లపల్లి వారి', { font: C.TE, size: 100, fill: C.KUM }); l1.position.set(540, 735); root.addChild(l1);
    const l2 = C.foil(root, 'పెండ్లి పిలుపు', { font: C.TE, size: 150, shadow: 0x6b3a12 }); l2.position.set(540, 895);
    const rule = new PIXI.Graphics(); root.addChild(rule);
    const names = C.namePair(root, 'నిఖిత', 'సాయి కౌండిన్య', { font: C.TE, size: 72, fill: C.INK, gap: 86 }); names.y = 1150;
    const en = C.label('NIKHITHA  ×  SAI KOUNDINYA', { size: 30, fill: C.GOLD_D, ls: 10 }); en.position.set(540, 1252); root.addChild(en);
    const vv = C.text('వివాహ మహోత్సవ శుభ ఆహ్వానము', { font: C.TE2, size: 46, fill: C.INK2 }); vv.position.set(540, 1330); root.addChild(vv);
    const orn = new PIXI.Sprite(C.A.ornament); orn.anchor.set(0.5); orn.tint = C.GOLD; orn.scale.set(600 / orn.texture.width); orn.position.set(540, 1480); root.addChild(orn);
    const om = C.wipeMask(root, 240, 1380, 600, 200); orn.mask = om.g;
    const pas = C.dabTex('#e3a62a', 5), kum = C.dabTex('#b3261e', 6);
    const dabs = [[150, 380], [930, 380], [150, 1600], [930, 1600]].map(([x, y], i) => { const a = new PIXI.Sprite(pas), b = new PIXI.Sprite(kum); [a, b].forEach(d => { d.anchor.set(0.5); root.addChild(d); });
      a.position.set(x + (i % 2 ? 22 : -22), y); b.position.set(x + (i % 2 ? -26 : 26), y + 4); return { a, b, i }; });
    const fg = C.foreground(root, [['marigold', -10, 170, 1.4, 0, 16], ['leaf', 90, 60, 1.3, 2.2, 12], ['marigold', 1090, 210, 1.3, 0.5, 18], ['leaf', 1000, 40, 1.2, -2.3, 12]]);
    return (t) => {
      sheen(t, B.patrika, B.muggu + XF);
      const f = E.out3(span(t, B.patrika, B.patrika + 2.6)); frame.scale.set(fk * (1.05 - 0.05 * f));
      C.rise(gan, t, B.patrika + 0.9, 1.3, 12); C.rise(au, t, B.patrika + 1.3, 1.3, 12);
      C.rise(l1, t, B.line1, 1.4); C.rise(l2, t, B.line2, 1.6, 26); l2.sweep(t, B.line2 + 1.6, 2.0);
      rule.clear(); const rk = E.inOut(span(t, B.line2 + 0.8, B.line2 + 2.2));
      if (rk > 0) { rule.moveTo(540 - 300 * rk, 1022).lineTo(540 + 300 * rk, 1022).stroke({ width: 2.5, color: C.GOLD }); rule.poly([540, 1010, 552, 1022, 540, 1034, 528, 1022]).fill({ color: C.GOLD, alpha: rk }); }
      C.rise(names, t, B.names, 1.5); C.rise(en, t, B.en, 1.3, 14); C.rise(vv, t, B.en + 0.9, 1.3, 14);
      om.set(E.inOut(span(t, B.date - 1.0, B.date + 1.4)), 'center');
      dabs.forEach(d => { const ta = B.names + 0.6 + d.i * 0.3; d.a.alpha = E.smooth(span(t, ta, ta + 0.9)); d.a.scale.set(0.5 + 0.05 * E.out3(span(t, ta, ta + 0.9)));
        d.b.alpha = E.smooth(span(t, ta + 0.4, ta + 1.3)); d.b.scale.set(0.38 + 0.04 * E.out3(span(t, ta + 0.4, ta + 1.3))); });
      s.cam.s = 1 + 0.04 * E.inOut(span(t, B.patrika, B.muggu + XF)); s.cam.y = 960 - 20 * E.inOut(span(t, B.patrika, B.muggu));
      fg(t, -18 * E.inOut(span(t, B.patrika, B.muggu)), 0, E.smooth(span(t, B.patrika, B.patrika + 2)));
      C.cam.petals = 0.75 * E.smooth(span(t, B.line2, B.line2 + 2)); C.cam.dust = 0.18; C.cam.dustTint = 0xffe6b0; C.cam.grain = 0.12;
    };
  }, XF));

  /* ============================================================ 3 · the muggu at our doorstep */
  SCENES.push(() => C.scene(B.muggu, B.bride + XF, (root, s) => {
    C.bg(root, C.canvasTex(1080, 1920, (x, w, h) => {
      x.fillStyle = '#86391f'; x.fillRect(0, 0, w, h); const r = rng(21);
      for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${r() < .5 ? '60,20,8' : '190,110,70'},${0.04 + r() * 0.06})`; x.beginPath(); x.arc(r() * w, r() * h, 20 + r() * 90, 0, 6.283); x.fill(); }
      for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(255,220,190,${r() * 0.08})`; x.fillRect(r() * w, r() * h, 1.5, 1.5); }
      const g = x.createRadialGradient(w * 0.3, h * 0.2, 0, w / 2, h * 0.52, h * 0.75); g.addColorStop(0, 'rgba(255,190,130,.3)'); g.addColorStop(1, 'rgba(20,4,0,.55)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    }));
    const rays = C.rays(root, 120, -80, 0xffd2a0, 3.2);
    const cx = 540, cy = 1010, art = new PIXI.Container(); art.position.set(cx, cy); root.addChild(art);
    const fills2 = new PIXI.Graphics(), fills = new PIXI.Graphics(), halo = new PIXI.Graphics(), chalk = new PIXI.Graphics(), dots = new PIXI.Graphics();
    art.addChild(fills2, fills, halo, chalk, dots);
    const pol = (r, a) => [Math.cos(a) * r, Math.sin(a) * r];
    const petal = (r0, r1, a, wA, bulge) => { const pts = [], N = 36;
      for (let i = 0; i <= N; i++) { const k = i / N, q = Math.sin(k * Math.PI); pts.push(pol(lerp(r0, r1, k), a - wA * q * bulge * (1 - 0.25 * k))); }
      for (let i = N; i >= 0; i--) { const k = i / N, q = Math.sin(k * Math.PI); pts.push(pol(lerp(r0, r1, k), a + wA * q * bulge * (1 - 0.25 * k))); } return pts; };
    const circle = (r, n = 96) => Array.from({ length: n + 1 }, (_, i) => pol(r, (i / n) * 6.283 - 1.5708));
    const T0 = B.muggu + 0.8, strokes = [], add = (pts, a, b, w = 9) => strokes.push({ pts, t0: T0 + a, t1: T0 + b, w });
    add(circle(34, 40), 0, 0.6, 8);
    for (let i = 0; i < 8; i++) add(petal(40, 215, i * 0.7854 - 1.5708, 0.36, 1), 0.3 + i * 0.22, 1.8 + i * 0.22);
    add(circle(236), 1.8, 3.2, 6);
    for (let i = 0; i < 16; i++) add(petal(244, 350, i * 0.3927 - 1.5708 + 0.196, 0.15, 1), 2.6 + i * 0.1, 3.8 + i * 0.1, 7);
    for (let i = 0; i < 8; i++) add(petal(360, 452, i * 0.7854 - 1.5708, 0.13, 1.3), 3.8 + i * 0.16, 5.0 + i * 0.16, 7);
    add(circle(470, 140), 4.4, 6.4, 4);
    const dotPts = [];
    for (let i = 0; i < 8; i++) { const a = i * 0.7854 - 1.5708 + 0.3927; dotPts.push([...pol(300, a), T0 + 0.2 + i * 0.08], [...pol(410, a), T0 + 0.6 + i * 0.08]); }
    for (let i = 0; i < 16; i++) dotPts.push([...pol(505, i * 0.3927 - 1.5708), T0 + 1.0 + i * 0.05]);
    for (let i = 0; i < 8; i++) fills.poly(petal(48, 205, i * 0.7854 - 1.5708, 0.3, 1).flat()).fill(C.TUR);
    fills.circle(0, 0, 26).fill(C.KUM);
    for (let i = 0; i < 16; i++) fills2.poly(petal(250, 342, i * 0.3927 - 1.5708 + 0.196, 0.12, 1).flat()).fill(C.KUM);
    const welcome = C.foil(root, 'మా ఇంటి ముంగిట మీకు స్వాగతం', { font: C.TE2, size: 74, shadow: 0x2a0602 }); welcome.position.set(540, 285);
    const wen = C.label('WELCOME TO OUR HOME', { size: 26, fill: 0xF6D6A6, ls: 12 }); wen.position.set(540, 372); root.addChild(wen);
    const lamps = [C.diya(root, 150, 1770, 170), C.diya(root, 930, 1770, 170)];
    const fg = C.foreground(root, [['marigold', 40, 1880, 1.0, 0, 12], ['marigold', 1050, 1900, 1.1, 0.4, 14]]);
    return (t) => {
      rays(t, 0.5 * E.smooth(span(t, B.muggu, B.muggu + 3)));
      art.rotation = 0.07 * E.inOut(span(t, B.muggu, B.bride + XF));
      chalk.clear(); halo.clear();
      strokes.forEach(st => { const k = E.inOut(span(t, st.t0, st.t1)); C.drawPart(halo, st.pts, k); halo.stroke({ width: st.w * 2.4, color: 0xfff4e0, alpha: 0.16, cap: 'round', join: 'round' }); C.drawPart(chalk, st.pts, k); chalk.stroke({ width: st.w, color: 0xFBF4E6, alpha: 0.96, cap: 'round', join: 'round' }); });
      dots.clear(); dotPts.forEach(([x, y, t0]) => { const k = E.out3(span(t, t0, t0 + 0.6)); if (k > 0) dots.circle(x, y, 9 * k).fill({ color: 0xFBF4E6, alpha: 0.95 }); });
      const f1 = E.out3(span(t, B.fill1, B.fill1 + 1.6)); fills.alpha = f1; fills.scale.set(0.92 + 0.08 * f1);
      const f2 = E.out3(span(t, B.fill2, B.fill2 + 1.6)); fills2.alpha = f2; fills2.scale.set(0.96 + 0.04 * f2);
      C.rise(welcome, t, B.muggu + 2.2, 1.6); welcome.sweep(t, B.muggu + 4.2, 2.0); C.rise(wen, t, B.muggu + 3.0, 1.4, 14);
      lamps.forEach((l, i) => l.set(t + i * 2.3, E.out3(span(t, 25.61 + i * 0.5, 27.0 + i * 0.5))));
      s.cam.y = 1010; s.cam.s = 1.07 - 0.07 * E.out3(span(t, B.muggu, B.muggu + 3.5)) + 0.05 * E.inOut(span(t, 31.0, B.bride + XF));
      fg(t, 0, 20 * E.inOut(span(t, B.muggu, B.bride)), 0.9);
      C.cam.dust = 0.45; C.cam.dustTint = 0xffd9a8; C.cam.grain = 0.15;
    };
  }, XF));

  /* ============================================================ 4 · the bride, the groom, and their families */
  SCENES.push(() => C.scene(B.bride, B.stars + XF, (root, s) => {
    C.bg(root, C.silkTex());
    const sheen = C.sheen(root, 0.08);
    const LOBES = [[50, 34, 1], [36, 48, 0.85], [64, 46, 0.88], [44, 70, 0.82], [58, 20, 0.8], [52, 90, 0.78], [22, 80, 0.7], [80, 78, 0.7]];
    const box = { x: 540, y: 650, w: 840, h: 920 };
    const people = [
      { tex: C.A.bride, ink: 'bride', zoom: 1.28, dy: 0, t0: B.bride, t1: B.groom, role: 'THE BRIDE',
        name: 'చి.ల.సౌ. నిఖిత', lines: ['శ్రీ చల్లపల్లి శ్రీధర్ గారు', 'శ్రీమతి వెంకట కృష్ణవేణి గార్ల కుమార్తె'] },
      { tex: C.A.groom, ink: 'groom', zoom: 1.18, dy: 10, t0: B.groom, t1: B.stars, role: 'THE GROOM',
        name: 'చి. సాయి కౌండిన్య', lines: ['కొవ్వూరు వాస్తవ్యులు', 'శ్రీ కొక్కిరాల వి.వి. హరిమోహన్ గారు', 'శ్రీమతి శైలజ గార్ల కుమారుడు'] },
    ].map(p => {
      const g = new PIXI.Container(); root.addChild(g); p.g = g;
      p.pic = C.bloomPortrait(g, p.tex, Object.assign({}, box, { y: box.y + p.dy }), LOBES, p.zoom);
      const clip = new PIXI.Graphics().rect(124, 194, 832, 912).fill(0xffffff); g.addChild(clip); p.pic.c.mask = clip;
      p.frame = C.filigree(g, 110, 180, 860, 940, { crest: true });
      p.roleT = C.label(p.role, { size: 24, fill: C.GOLD_D, ls: 12 }); p.roleT.position.set(540, 1158); g.addChild(p.roleT);
      p.ink = C.inkLettering(g, p.ink, 540, 1272, 400);
      p.nm = C.foil(g, p.name, { font: C.TE, size: 66, shadow: 0x6b3a12 }); p.nm.position.set(540, 1418);
      p.ls = p.lines.map((l, i) => { const x = C.text(l, { font: C.TE2, size: 44, fill: C.INK2 }); x.position.set(540, 1498 + i * 52 - (p.lines.length - 2) * 26); g.addChild(x); return x; });
      return p;
    });
    s.prep = async (t) => { for (const p of people) if (t >= p.t0 - 0.2 && t < p.t1 + XF) await p.ink.set(span(t, p.t0 + 1.8, p.t0 + 4.6)); };
    return (t) => {
      sheen(t, B.bride, B.stars);
      people.forEach((p, i) => {
        const on = t >= p.t0 - 0.1 && t < p.t1 + XF; p.g.visible = on; if (!on) return;
        p.pic.set(E.out3(span(t, p.t0 + 0.2, p.t0 + 2.6))); p.frame.set(span(t, p.t0 + 0.3, p.t0 + 2.8));
        const inK = i ? E.smooth(span(t, p.t0, p.t0 + XF)) : 1, outK = i ? 0 : E.smooth(span(t, p.t1, p.t1 + XF));
        p.g.alpha = inK * (1 - outK);
        C.rise(p.roleT, t, p.t0 + 1.4, 1.2, 10);
        C.rise(p.nm, t, p.t0 + 4.2, 1.3, 14); p.nm.sweep(t, p.t0 + 5.4, 1.8);
        p.ls.forEach((l, j) => C.rise(l, t, p.t0 + 4.9 + j * 0.5, 1.3, 12));
      });
      s.cam.s = 1 + 0.03 * E.inOut(span(t, B.bride, B.groom)) + 0.03 * E.inOut(span(t, B.groom, B.stars));
      C.cam.dust = 0.22; C.cam.dustTint = 0xffe2b0; C.cam.grain = 0.1;
    };
  }, XF));

  /* ============================================================ 5 · written in the stars */
  SCENES.push(() => C.scene(B.stars, B.muhurtham + XF, (root, s) => {
    C.bg(root, C.linear(8, 512, [[0, '#06050c'], [0.55, '#110b1d'], [1, '#22102a']]));
    [[300, 600, 0x5a2a6a, 7], [820, 1300, 0x6a3a1a, 8], [520, 1000, 0x2a2a6a, 10]].forEach(([x, y, c, k]) => { const n = new PIXI.Sprite(C.glowTex()); n.anchor.set(0.5); n.position.set(x, y); n.tint = c; n.scale.set(k); n.alpha = 0.18; n.blendMode = 'add'; root.addChild(n); });
    const r = rng(77), stars = [];
    for (let i = 0; i < 650; i++) { const st = new PIXI.Sprite(C.dotTex()); st.anchor.set(0.5); st.blendMode = 'add'; const z = r(); st.tint = r() < 0.15 ? 0xffe0b0 : 0xdfe6ff; root.addChild(st); stars.push({ s: st, x: r() * W, y: r() * H, z, a: 0.25 + 0.75 * r() * r() + 0.2 * z, sz: 0.02 + 0.07 * z * z }); }
    const flareTex = C.canvasTex(512, 512, (x, w) => { [[0], [1]].forEach(([a]) => { const g = a ? x.createLinearGradient(0, w / 2, w, w / 2) : x.createLinearGradient(w / 2, 0, w / 2, w); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; a ? x.fillRect(0, w / 2 - 2, w, 4) : x.fillRect(w / 2 - 2, 0, 4, w); }); });
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
    [['నిఖిత', 230, 860], ['సాయి కౌండిన్య', 158, 1110]].forEach(([str, size, y]) => { const g = C.text(str, { font: C.TE, size, fill: 0xffb547 }); g.position.set(540, y); g.blendMode = 'add'; g.filters = [new PIXI.BlurFilter({ strength: 16, quality: 3 })]; glowN.addChild(g); });
    const n1 = C.foil(root, 'నిఖిత', { font: C.TE, size: 230, shadow: 0x000000 }), n2 = C.foil(root, 'సాయి కౌండిన్య', { font: C.TE, size: 158, shadow: 0x000000 });
    n1.position.set(540, 860); n2.position.set(540, 1110);
    const orn = new PIXI.Graphics(); root.addChild(orn);
    const wit = C.text('అరుంధతి నక్షత్రం సాక్షిగా', { font: C.TE2, size: 70, fill: C.CREAM }); wit.position.set(540, 1340); root.addChild(wit);
    const wen = C.label('WITH ARUNDHATI AS OUR WITNESS', { size: 25, fill: C.GOLD, ls: 9 }); wen.position.set(540, 1422); root.addChild(wen);
    return (t) => {
      const lt = t - B.stars;
      stars.forEach(p => { const py = ((p.y - lt * 5 * (0.3 + p.z)) % H + H) % H; p.s.position.set(p.x, py); p.s.scale.set(p.sz); p.s.alpha = p.a; });
      const k = span(t, B.stars, B.merge), rad = 190 * (1 - E.inOut(k)), ang = 2.2 + 7 * Math.pow(k, 1.5), merged = t >= B.merge;
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
      const lock = E.smooth(span(t, B.lock - 0.6, B.lock + 0.6)); n1.alpha = n2.alpha = lock; glowN.alpha = 0.5 * lock;
      n1.sweep(t, B.lock + 0.8, 1.8); n2.sweep(t, B.lock + 1.1, 1.9);
      orn.clear(); const ok = E.out3(span(t, B.lock + 0.4, B.lock + 1.6)); if (ok > 0) { orn.moveTo(540 - 120 * ok, 985).lineTo(522, 985).moveTo(558, 985).lineTo(540 + 120 * ok, 985).stroke({ width: 2, color: C.GOLD }); orn.poly([540, 975, 550, 985, 540, 995, 530, 985]).fill(C.GOLD); }
      C.rise(wit, t, B.lock + 0.8, 1.5); C.rise(wen, t, B.lock + 1.5, 1.3, 12);
      s.cam.s = 1 + 0.04 * E.inOut(span(t, B.stars, B.muhurtham + XF));
      C.cam.grain = 0.07;
    };
  }, XF));

  /* ============================================================ 6 · the muhurtham and the venue */
  SCENES.push(() => C.scene(B.muhurtham, B.hush + XF, (root, s) => {
    C.bg(root, RED()); const sheen = C.sheen(root, 0.12);
    const frame = C.filigree(root, 70, 190, 940, 1420, { crest: true });
    const head = C.foil(root, 'సుముహూర్తం', { font: C.TE, size: 128 }); head.position.set(540, 335);
    const hen = C.label('THE MUHURTHAM', { size: 27, fill: C.GOLD_HI, ls: 14 }); hen.position.set(540, 432); root.addChild(hen);
    const day = C.text('ఆదివారం  ·  13 డిసెంబర్ 2026', { font: C.TE, size: 60, fill: C.CREAM }); day.position.set(540, 565); root.addChild(day);
    const den = C.label('SUNDAY · 13 DECEMBER 2026', { size: 27, fill: 0xF3D9A6, ls: 9 }); den.position.set(540, 642); root.addChild(den);
    const clock = new PIXI.Container(); clock.position.set(540, 800); root.addChild(clock);
    ['8:19', '8:20', '8:21', '8:22'].forEach((str, i) => { const x = C.foil(clock, str, { font: C.EN, size: 220, weight: '400', ls: 6 }); x.y = i * 230; });
    const cm = new PIXI.Graphics().rect(140, 680, 800, 240).fill(0xffffff); root.addChild(cm); clock.mask = cm;
    const pm = C.label('PM  ·  రాత్రి', { size: 30, fill: C.GOLD_HI, ls: 10 }); pm.position.set(540, 948); root.addChild(pm);
    const pin = new PIXI.Graphics().circle(0, -10, 18).fill(C.GOLD_HI).poly([-16, -2, 16, -2, 0, 28]).fill(C.GOLD_HI).circle(0, -10, 7).fill(0x8a1912); pin.position.set(540, 1102); root.addChild(pin);
    const v1 = C.text('శ్రీ కొత్తపల్లి శ్రీరాములు కనకమ్మ\nలయన్స్ A/C కళ్యాణమండపం', { font: C.TE2, size: 56, fill: C.CREAM, lh: 76 }); v1.position.set(540, 1245); root.addChild(v1);
    const v2 = C.text('Sri Kothapalli Sriramulu Kanakamma\nLions A/C Kalyana Mandapam', { font: C.EN, size: 32, fill: 0xF3D9A6, weight: '400', lh: 46, ls: 1 }); v2.position.set(540, 1405); root.addChild(v2);
    const v3 = C.label('R.T.C COMPLEX ROAD · NIDADAVOLU 534301', { size: 25, fill: C.GOLD_HI, ls: 6 }); v3.position.set(540, 1495); root.addChild(v3);
    const fg = C.foreground(root, [['marigold', -30, 1880, 1.4, 0, 16], ['leaf', 70, 1960, 1.3, 0.4, 12], ['marigold', 1100, 1850, 1.3, 0.4, 18], ['leaf', 1020, 1960, 1.2, -0.5, 12]]);
    return (t) => {
      sheen(t, B.muhurtham, B.hush + XF); frame.set(span(t, B.muhurtham + 0.3, B.muhurtham + 3.2));
      C.rise(head, t, B.muhurtham + 0.6, 1.5); head.sweep(t, B.muhurtham + 2.2, 2.0); C.rise(hen, t, B.muhurtham + 1.3, 1.3, 12);
      C.rise(day, t, B.day, 1.4); C.rise(den, t, B.day + 0.6, 1.3, 12);
      let k = 0; for (let i = 0; i < 3; i++) k += E.inOut(span(t, B.time + 0.7 + i * 1.0, B.time + 1.45 + i * 1.0));
      clock.alpha = E.smooth(span(t, B.time, B.time + 0.9)); clock.y = 800 - k * 230;
      clock.children[3].sweep(t, B.time + 3.9, 1.8);
      C.rise(pm, t, B.time + 3.5, 1.1, 10);
      C.rise(pin, t, B.venue, 1.1, 14); C.rise(v1, t, B.venue + 0.4, 1.5); C.rise(v2, t, B.venue + 1.3, 1.4, 14); C.rise(v3, t, B.venue + 2.0, 1.3, 10);
      s.cam.s = 1 + 0.03 * E.inOut(span(t, B.muhurtham, B.hush + XF));
      fg(t, 0, -20 * E.inOut(span(t, B.muhurtham, B.hush)), 0.95);
      C.cam.dust = 0.4; C.cam.dustTint = 0xffd27a; C.cam.grain = 0.09;
    };
  }, XF));

  /* ============================================================ 7–8 · the hush, then the moment */
  SCENES.push(() => C.scene(B.hush, B.events + XF, (root, s) => {
    C.bg(root, DEEP()); const silk = C.bg(root, RED()); const sheen = C.sheen(root, 0.12);
    const rays = C.rays(root, 540, 860, 0xffd08a, 2.8);
    const mandala = new PIXI.Graphics(); root.addChild(mandala);
    for (let ring = 0; ring < 3; ring++) { const R = 560 + ring * 70, n = 24 + ring * 12;
      for (let i = 0; i < n; i++) { const a = i / n * 6.283, a2 = (i + 0.5) / n * 6.283;
        mandala.moveTo(Math.cos(a) * R, Math.sin(a) * R).quadraticCurveTo(Math.cos(a2) * (R + 46), Math.sin(a2) * (R + 46), Math.cos(a + 6.283 / n) * R, Math.sin(a + 6.283 / n) * R); }
      mandala.stroke({ width: 2, color: C.GOLD_HI, alpha: 0.5 - ring * 0.12 }); mandala.circle(0, 0, R - 14).stroke({ width: 1.2, color: C.GOLD, alpha: 0.4 }); }
    mandala.position.set(540, 880);
    const pic = new PIXI.Container(); pic.position.set(540, 880); root.addChild(pic);
    const aw = 680, ah = 900, arch = (g, inset = 0) => { const w = aw / 2 - inset, top = -ah / 2 + inset, bot = ah / 2 - inset; g.moveTo(-w, bot).lineTo(-w, top + w).arc(0, top + w, w, Math.PI, 0).lineTo(w, bot).closePath(); };
    const shadow = new PIXI.Sprite(C.glowTex()); shadow.anchor.set(0.5); shadow.tint = 0x1a0201; shadow.scale.set(5.5, 6.5); shadow.alpha = 0.5; pic.addChild(shadow);
    const ph = new PIXI.Sprite(C.A.couple); ph.anchor.set(0.5, 0.48); ph.scale.set(Math.max(aw / ph.texture.width, ah / ph.texture.height) * 1.02); pic.addChild(ph);
    const am = new PIXI.Graphics(); arch(am); am.fill(0xffffff); pic.addChild(am); ph.mask = am;
    const lightIn = new PIXI.Sprite(C.glowTex()); lightIn.anchor.set(0.5); lightIn.tint = 0xfff0cc; lightIn.blendMode = 'add'; pic.addChild(lightIn);
    const line = new PIXI.Graphics(); pic.addChild(line);
    const archPts = (inset) => { const w = aw / 2 - inset, top = -ah / 2 + inset, bot = ah / 2 - inset, pts = [[-w, bot], [-w, top + w]];
      for (let i = 0; i <= 40; i++) { const a = Math.PI + i / 40 * Math.PI; pts.push([Math.cos(a) * w, top + w + Math.sin(a) * w]); } pts.push([w, bot], [-w, bot]); return pts; };
    const outer = archPts(-10), inner = archPts(-24);
    const r = rng(101), rice = [], rl = new PIXI.Container(); root.addChild(rl);
    [B.drop, B.toss2, B.toss3].forEach((t0) => { for (let i = 0; i < 150; i++) { const sp = new PIXI.Sprite(C.riceTex()); sp.anchor.set(0.5); rl.addChild(sp);
      const a = -Math.PI / 2 + (r() - 0.5) * 1.9, v = 700 + r() * 900; rice.push({ s: sp, t0: t0 + r() * 0.2, x0: 540 + (r() - 0.5) * 300, y0: 1500, vx: Math.cos(a) * v, vy: Math.sin(a) * v, sp: (r() - 0.5) * 6, ph: r() * 6, sz: 0.55 + r() * 0.7 }); } });
    const hushRice = []; for (let i = 0; i < 80; i++) { const sp = new PIXI.Sprite(C.riceTex()); sp.anchor.set(0.5); rl.addChild(sp); hushRice.push({ s: sp, x: r() * W, y0: H * (0.3 + r()), v: 30 + r() * 60, ph: r() * 6, sz: 0.4 + r() * 0.5 }); }
    const garland = C.toranam(root, 70, 9);
    const tal = C.foil(root, 'తలంబ్రాలు', { font: C.TE2, size: 62 }); tal.position.set(540, 300);
    const names = new PIXI.Container(); root.addChild(names);
    const nA = C.foil(names, 'నిఖిత', { font: C.TE, size: 82 }), nB = C.foil(names, 'సాయి కౌండిన్య', { font: C.TE, size: 82 });
    const wA = nA.getLocalBounds().width, wB = nB.getLocalBounds().width, gap = 100, x0 = 540 - (wA + gap + wB) / 2; nA.x = x0 + wA / 2; nB.x = x0 + wA + gap + wB / 2;
    const heart = new PIXI.Graphics(); C.heartPath(heart, C.GOLD_HI); heart.scale.set(1.7); heart.position.set(x0 + wA + gap / 2, 6); names.addChild(heart); names.y = 1455;
    const when = C.label('13 · 12 · 2026  ·  8:22 PM', { size: 31, fill: C.GOLD_HI, ls: 10 }); when.position.set(540, 1555); root.addChild(when);
    const fg = C.foreground(root, [['marigold', -40, 1870, 1.5, 0, 16], ['leaf', 60, 1950, 1.3, 0.4, 12], ['marigold', 1110, 1880, 1.4, 0.4, 18]]);
    return (t) => {
      silk.alpha = E.smooth(span(t, B.drop - 0.2, B.drop + 1.8)); sheen(t, B.drop, B.events + XF);
      rays(t, 0.6 * E.smooth(span(t, B.drop, B.drop + 2.5)));
      const pre = E.inOut(span(t, B.hush + 1.0, B.drop - 0.4));
      line.clear(); C.drawPart(line, outer, pre); line.stroke({ width: 7, color: C.GOLD }); C.drawPart(line, inner, E.inOut(span(t, B.hush + 2.0, B.drop - 0.2))); line.stroke({ width: 2, color: C.GOLD_HI });
      const open = E.smooth(span(t, B.drop - 0.15, B.drop + 2.0)); ph.alpha = open; shadow.alpha = 0.5 * open;
      const L = t >= B.drop - 0.3 ? Math.exp(-Math.max(0, t - B.drop) * 1.0) * E.smooth(span(t, B.drop - 0.3, B.drop + 0.1)) : 0;
      lightIn.scale.set(7 + 6 * (1 - L)); lightIn.alpha = 0.95 * L;
      pic.scale.set(1.04 - 0.04 * E.out3(span(t, B.drop, B.drop + 3)) + 0.03 * E.inOut(span(t, B.drop + 3, B.events + XF)));
      mandala.alpha = 0.9 * E.smooth(span(t, B.drop + 0.4, B.drop + 2.6)); mandala.rotation = 0.04 * (t - B.drop); mandala.scale.set(0.9 + 0.1 * E.out3(span(t, B.drop, B.drop + 3)));
      hushRice.forEach(h => { const vis = t < B.drop + 1; h.s.visible = vis; if (!vis) return; h.s.position.set(h.x + 20 * Math.sin(t * 0.8 + h.ph), h.y0 - h.v * (t - B.hush)); h.s.rotation = h.ph + t * 0.3; h.s.scale.set(h.sz); h.s.alpha = 0.7 * E.smooth(span(t, B.hush + 0.5, B.hush + 2.5)) * (1 - E.smooth(span(t, B.drop, B.drop + 1))); });
      const SLOW = 0.38, G = 700;
      rice.forEach(g => { const dt = (t - g.t0) * SLOW; g.s.visible = dt > 0; if (dt <= 0) return;
        g.s.position.set(g.x0 + g.vx * dt, g.y0 + g.vy * dt + 0.5 * G * dt * dt + 8 * Math.sin(t * 2 + g.ph)); g.s.rotation = g.ph + g.sp * dt; g.s.scale.set(g.sz); g.s.alpha = g.s.y > H + 40 ? 0 : 1; });
      garland.set(t, B.toss2 - 0.4, 1.8);
      C.rise(tal, t, B.toss2, 1.5, 14); tal.sweep(t, B.toss2 + 1.5, 1.8);
      C.rise(names, t, B.coupleNames, 1.6); nA.sweep(t, B.coupleNames + 1.4, 1.8); nB.sweep(t, B.coupleNames + 1.7, 2.0); C.rise(when, t, B.coupleNames + 1.0, 1.4, 12);
      s.cam.s = 1 + 0.02 * E.inOut(span(t, B.hush, B.drop));
      fg(t, 0, -16 * E.inOut(span(t, B.drop, B.events)), E.smooth(span(t, B.drop, B.drop + 2)));
      C.cam.dust = 0.5 + 0.3 * E.smooth(span(t, B.drop, B.drop + 2)); C.cam.dustTint = 0xffd27a;
      C.cam.petals = 0.85 * E.smooth(span(t, B.toss2, B.toss2 + 2)); C.cam.grain = 0.09;
    };
  }, XF));

  /* ============================================================ 9 · the celebrations */
  SCENES.push(() => C.scene(B.events, B.shubham + XF, (root, s) => {
    C.bg(root, C.silkTex()); const sheen = C.sheen(root, 0.08);
    const frame = C.filigree(root, 60, 170, 960, 1480, { crest: true });
    const head = C.text('వేడుకలు', { font: C.TE, size: 124, fill: C.KUM }); head.position.set(540, 315); root.addChild(head);
    const sub = C.label('THE CELEBRATIONS', { size: 27, fill: C.GOLD_D, ls: 12 }); sub.position.set(540, 412); root.addChild(sub);
    const rows = [
      { icon: C.A.gorintaku, te: 'గోరింటాకు', en: 'MEHENDI', when: 'FRI · 11 DEC · 4:00 PM ONWARDS' },
      { icon: C.A.marigold, te: 'హల్దీ', en: 'HALDI', when: 'SAT · 12 DEC · 3:30 PM ONWARDS' },
      { icon: C.A.bangles, te: 'పెండ్లికూతురు', en: 'PENDLIKUTHURU', when: 'SAT · 12 DEC · 9:25 AM' },
      { icon: C.A.kalasham, te: 'వివాహం', en: 'THE WEDDING', when: 'SUN · 13 DEC · 8:22 PM', hero: true },
    ].map((e, i) => {
      const c = new PIXI.Container(); c.y = 580 + i * 228; root.addChild(c);
      if (e.hero) { const card = new PIXI.Sprite(RED()); card.width = 900; card.height = 220; card.position.set(90, -100); c.addChild(card);
        const edge = new PIXI.Graphics().rect(90, -100, 900, 220).stroke({ width: 2, color: C.GOLD_HI }).rect(100, -90, 880, 200).stroke({ width: 1, color: C.GOLD, alpha: 0.7 }); c.addChild(edge); }
      else { const ln = new PIXI.Graphics().moveTo(120, 115).lineTo(960, 115).stroke({ width: 1.5, color: C.GOLD, alpha: 0.55 }); c.addChild(ln); }
      const ic = new PIXI.Sprite(e.icon); ic.anchor.set(0.5); C.fit(ic, 150, 150); ic.position.set(205, 6); c.addChild(ic);
      const te = e.hero ? C.foil(c, e.te, { font: C.TE, size: 84, ax: 0 }) : C.text(e.te, { font: C.TE, size: 72, fill: C.KUM, ax: 0 }); te.position.set(315, -26); if (!e.hero) c.addChild(te);
      const en = C.label(e.en, { size: 22, fill: e.hero ? C.CREAM : C.INK2, ls: 7, ax: 0 }); en.position.set(319, 34); c.addChild(en);
      const wh = C.label(e.when, { size: 28, fill: e.hero ? C.CREAM : C.INK, ls: 4, weight: '500', ax: 0 }); wh.position.set(319, 78); c.addChild(wh);
      return Object.assign(e, { c, te, at: B.events + 1.2 + i * 1.0 });
    });
    return (t) => {
      sheen(t, B.events, B.shubham + XF); frame.set(span(t, B.events + 0.2, B.events + 2.8));
      C.rise(head, t, B.events + 0.4, 1.4); C.rise(sub, t, B.events + 0.9, 1.3, 12);
      rows.forEach(e => { const k = E.out3(span(t, e.at, e.at + 1.3)); e.c.alpha = k; e.c.x = 50 * (1 - k); if (e.hero) e.te.sweep(t, e.at + 1.2, 1.8); });
      s.cam.s = 1 + 0.025 * E.inOut(span(t, B.events, B.shubham + XF));
      C.cam.petals = 0.3; C.cam.dust = 0.15; C.cam.dustTint = 0xffe6b0; C.cam.grain = 0.12;
    };
  }, XF));

  /* ============================================================ 10 · శుభం, and the family's invitation */
  SCENES.push(() => C.scene(B.shubham, B.end + 0.1, (root, s) => {
    C.bg(root, RED()); const sheen = C.sheen(root, 0.13);
    const rays = C.rays(root, 540, 650, 0xffd08a, 2.4);
    const garland = C.toranam(root, 60, 13);
    const orn = new PIXI.Sprite(C.A.ornament); orn.anchor.set(0.5); orn.tint = C.GOLD_HI; orn.scale.set(600 / orn.texture.width); orn.position.set(540, 395); root.addChild(orn);
    const glow = C.text('శుభం', { font: C.TE, size: 310, fill: 0xffa53a }); glow.position.set(540, 660); glow.blendMode = 'add'; glow.filters = [new PIXI.BlurFilter({ strength: 26, quality: 3 })]; root.addChild(glow);
    const word = C.foil(root, 'శుభం', { font: C.TE, size: 310 }); word.position.set(540, 660);
    const inv = ['మీరు సకుటుంబ సపరివార సమేతంగా విచ్చేసి,', 'నూతన వధూవరులను ఆశీర్వదించవలసినదిగా', 'సాదరంగా ఆహ్వానిస్తున్నాము.'].map((l, i) => { const x = C.text(l, { font: C.TE2, size: 48, fill: C.CREAM }); x.position.set(540, 935 + i * 66); root.addChild(x); return x; });
    const names = new PIXI.Container(); root.addChild(names);
    const nA = C.foil(names, 'నిఖిత', { font: C.TE, size: 78 }), nB = C.foil(names, 'సాయి కౌండిన్య', { font: C.TE, size: 78 });
    const wA = nA.getLocalBounds().width, wB = nB.getLocalBounds().width, gap = 96, x0 = 540 - (wA + gap + wB) / 2; nA.x = x0 + wA / 2; nB.x = x0 + wA + gap + wB / 2;
    const heart = new PIXI.Graphics(); C.heartPath(heart, C.GOLD_HI); heart.scale.set(1.7); heart.position.set(x0 + wA + gap / 2, 6); names.addChild(heart); names.y = 1170;
    const sign = C.text('ఇట్లు, చల్లపల్లి కుటుంబ సభ్యులు', { font: C.TE2, size: 50, fill: 0xF3D9A6 }); sign.position.set(540, 1295); root.addChild(sign);
    const date = C.label('SUNDAY · 13 · 12 · 2026 · 8:22 PM · NIDADAVOLU', { size: 23, fill: C.GOLD_HI, ls: 6 }); date.position.set(540, 1378); root.addChild(date);
    const lamps = [C.diya(root, 210, 1700, 240), C.diya(root, 870, 1700, 240)];
    const fg = C.foreground(root, [['marigold', -30, 1890, 1.4, 0, 16], ['marigold', 1110, 1900, 1.3, 0.4, 18]]);
    return (t) => {
      sheen(t, B.shubham, B.end); rays(t, 0.5 * E.smooth(span(t, B.shubham + 0.5, B.shubham + 3)));
      garland.set(t, B.shubham + 0.6, 1.8); C.rise(orn, t, B.shubham + 0.4, 1.5, 12);
      const wk = E.out3(span(t, B.shubham + 0.6, B.shubham + 2.4)); word.alpha = wk; word.scale.set(1.06 - 0.06 * wk); glow.scale.copyFrom(word.scale); glow.alpha = 0.5 * wk;
      word.sweep(t, B.shubham + 2.4, 2.2);
      inv.forEach((l, i) => C.rise(l, t, B.invite + i * 0.6, 1.4, 12));
      C.rise(names, t, 115.61, 1.5); nA.sweep(t, 117.0, 1.8); nB.sweep(t, 117.3, 2.0); C.rise(sign, t, B.sign, 1.4, 12); C.rise(date, t, B.sign + 0.8, 1.3, 10);
      lamps.forEach((l, i) => l.set(t + i * 3.1, E.out3(span(t, B.shubham + 1.2 + i * 0.4, B.shubham + 2.6 + i * 0.4))));
      s.cam.s = 1 + 0.03 * E.inOut(span(t, B.shubham, B.end));
      fg(t, 0, -14 * E.inOut(span(t, B.shubham, B.end)), 0.95);
      C.cam.dust = 0.5; C.cam.dustTint = 0xffd27a; C.cam.petals = 0.4; C.cam.grain = 0.09;
      C.cam.floodColor = 0x000000; C.cam.flood = E.inOut(span(t, B.end - 2.2, B.end));
    };
  }, XF));
})();

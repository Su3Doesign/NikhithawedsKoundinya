/* Pendli Pilupu · the invitation film (about two minutes)
   "Dichotomy of Fame" from its first note. Scenes change on the song's bar lines
   (measured: 123 bpm, phrases at 21.8, 46.7, 62.7, 80.0, the drop at 87.7, 103.6, 111.4)
   and dissolve into each other. Materials: silk, brocade, gold foil, filigree, lamplight. */
(function () {
  const { W, H, E, span, clamp, lerp, rng } = C;
  const B = { start: 44.91, title: 50.67, patrika: 52.66, line1: 52.9, line2: 53.3, names: 54.1, en: 54.7, date: 55.3,
    bride: 56.61, groom: 60.72, stars: 64.69, merge: 66.6, nik: 67.0, sai: 67.8, lock: 69.3,
    muhurtham: 70.31, day: 71.6, time: 72.6, venue: 74.2, hush: 83.8, drop: 87.7, toss2: 89.58, toss3: 91.51, coupleNames: 92.5,
    events: 97.59, shubham: 103.58, invite: 104.9, sign: 106.6, end: 109.51 };
  C.OFFSET = B.start; C.DURATION = B.end - B.start; C.B = B;
  const SCENES = window.SCENES = [];
  const XF = 0.9; // dissolve length: soft, but never a muddy double exposure
  const RED = () => C._red || (C._red = C.brocadeTex('#b9271d', '#86170f', '#360604', 'rgba(255,214,150,.07)', 3));
  const DEEP = () => C._deep || (C._deep = C.brocadeTex('#3d0f0b', '#1c0605', '#060202', 'rgba(255,200,140,.045)', 4));

  /* ============================================================ 1 · Ganesha, gathered from gold dust */
  SCENES.push(() => C.scene(B.start, B.title + XF, (root, s) => {
    const L = 10.29;   // the scene is authored on a 10.29 s clock and played over its real length
    C.bg(root, DEEP());
    const rays = C.rays(root, 540, 760, 0xffc77a, 2.6);
    const halo = new PIXI.Sprite(C.glowTex()); halo.anchor.set(0.5); halo.tint = 0xff9a40; halo.blendMode = 'add'; halo.position.set(540, 760); root.addChild(halo);
    // the form, sampled from the line-art: where each mote will settle
    const GH = 660, src = C.A.ganesha, GW = Math.round(src.width * GH / src.height), cx = 540, cy = 760;
    const cv = document.createElement('canvas'); cv.width = GW; cv.height = GH; const cx2 = cv.getContext('2d'); cx2.drawImage(src.source.resource, 0, 0, GW, GH);
    const data = cx2.getImageData(0, 0, GW, GH).data, r = rng(19), motes = [];
    for (let y = 0; y < GH; y += 5) for (let x = 0; x < GW; x += 5) if (data[(y * GW + x) * 4 + 3] > 120) {
      const sp = new PIXI.Sprite(C.dotTex()); sp.anchor.set(0.5); sp.blendMode = 'add'; sp.tint = r() < 0.25 ? 0xfff3d6 : 0xffcf7a; root.addChild(sp);
      const tx = cx - GW / 2 + x, ty = cy - GH / 2 + y, a = r() * 6.283, d = 380 + r() * 700;
      motes.push({ sp, tx, ty, sx: cx + Math.cos(a) * d, sy: cy + Math.sin(a) * d * 1.3, t0: 1.3 + (1 - y / GH) * 2.6 + r() * 0.9, dur: 1.6 + r() * 0.8, ph: r() * 6, sw: (r() - 0.5) * 220, sz: 0.035 + r() * 0.03 });
    }
    const glow = new PIXI.Sprite(src), gan = new PIXI.Sprite(src);
    glow.tint = 0xffb84a; glow.blendMode = 'add'; glow.filters = [new PIXI.BlurFilter({ strength: 24, quality: 4 })]; gan.tint = 0xF2D28C;
    [glow, gan].forEach(g => { g.anchor.set(0.5); g.scale.set(GH / src.height); g.position.set(cx, cy); root.addChild(g); });
    const om = C.foil(root, 'శ్రీ గణేశాయ నమః', { font: C.TE2, size: 92 }); om.position.set(540, 1200);
    const sh = C.text('శ్రీరస్తు   ·   శుభమస్తు   ·   అవిఘ్నమస్తు', { font: C.TE2, size: 48, fill: 0xF3D9A6 }); sh.position.set(540, 1308); root.addChild(sh);
    const fg = C.foreground(root, [['marigold', 70, 1900, 1.5, 0.3, 14], ['leaf', 1040, 1820, 1.2, -0.6, 10], ['marigold', 1010, 1960, 1.2, 0, 16], ['leaf', 40, -40, 1.4, 2.6, 12]]);
    return (t) => {
      t = (t - B.start) * (L / (B.title - B.start));
      const form = E.smooth(span(t, 4.6, 6.2));
      motes.forEach(m => { const k = span(t, m.t0, m.t0 + m.dur), e = E.inOut(k);
        // drifting before they are called, then each one curves into its place
        const dx = 20 * Math.sin(t * 0.5 + m.ph), dy = -12 * t;
        const x = lerp(m.sx + dx, m.tx, e) + m.sw * Math.sin(Math.PI * e) * 0.5, y = lerp(m.sy + dy, m.ty, e);
        m.sp.position.set(x, y); m.sp.scale.set(m.sz * (1 + 0.6 * (1 - e)));
        m.sp.alpha = E.smooth(span(t, 0.2, 1.6)) * (0.55 + 0.45 * e) * (1 - 0.85 * form); });
      gan.alpha = form; glow.alpha = 0.45 * form + 0.25 * Math.sin(Math.PI * span(t, 5.4, 8.4));
      const lit = E.smooth(span(t, 1.0, 6.0)); rays(t, 0.45 * lit); halo.scale.set(3 + 4 * lit); halo.alpha = 0.22 * lit;
      C.rise(om, t, 6.69, 1.5); C.rise(sh, t, 8.48, 1.5);
      s.cam.s = 1 + 0.06 * E.inOut(span(t, 0, L + XF)); s.cam.y = 960 - 30 * E.inOut(span(t, 0, L));
      fg(t, 0, -30 * E.inOut(span(t, 0, L + XF)), E.smooth(span(t, 0.5, 2.5)));
      C.cam.dust = 0.6 * E.smooth(span(t, 0, 2.5)); C.cam.dustTint = 0xffcf80; C.cam.grain = 0.07;
      C.cam.floodAdd = true; C.cam.floodColor = 0xffd9a6; C.cam.flood = 0.5 * E.inOut(span(t, 9.6, L + 0.5)) * (1 - E.smooth(span(t, L + 0.5, L + XF)));
    };
  }));

  /* ============================================================ 2a · the title, filled with the couple */
  SCENES.push(() => C.scene(B.title, B.patrika + XF, (root, s) => {
    C.bg(root, RED()); const sheen = C.sheen(root, 0.12);
    const rays = C.rays(root, 540, 880, 0xffc77a, 2.6);
    const echo = C.echo(root, 'పెండ్లి', { font: C.TE, size: 360 }, 3, 2.6); root.children[root.children.length - 1].position.set(540, 860);
    const word = C.photoText(root, 'పెండ్లి', { font: C.TE, size: 360 }, C.A.couple); word.position.set(540, 860);
    const sub = C.foil(root, 'పిలుపు', { font: C.TE, size: 120 }); sub.position.set(540, 1130);
    const en = C.label('NIKHITHA  ×  SAI KOUNDINYA', { size: 30, fill: C.GOLD_TEXT, ls: 12 }); en.position.set(540, 1250); root.addChild(en);
    return (t) => {
      const u = span(t, B.title, B.patrika + XF);
      sheen(t, B.title, B.patrika + XF); rays(t, 0.4); echo(t, E.smooth(span(t, B.title + 0.6, B.title + 1.4)));
      word.drift(u); word.scale.set(1.06 - 0.06 * E.out3(span(t, B.title, B.title + 1.6)));
      C.rise(sub, t, B.title + 0.5, 0.9, 16); C.rise(en, t, B.title + 0.9, 0.9, 10);
      s.cam.s = 1 + 0.04 * E.inOut(u);
      C.cam.dust = 0.5; C.cam.dustTint = 0xffd27a; C.cam.grain = 0.08;
    };
  }, XF, 'burn'));

  /* ============================================================ 2 · the patrika */
  SCENES.push(() => C.scene(B.patrika, B.bride + XF, (root, s) => {
    C.bg(root, C.silkTex());
    const sheen = C.sheen(root, 0.1);
    const frame = new PIXI.Sprite(C.A.frame); frame.anchor.set(0.5); const fk = C.fit(frame, 1010, 1520); frame.position.set(540, 960); root.addChild(frame);
    const gan = new PIXI.Sprite(C.A.ganesha); gan.anchor.set(0.5); gan.tint = C.KUM; gan.scale.set(150 / gan.texture.height); gan.position.set(540, 525); root.addChild(gan);
    const au = C.text('శ్రీరస్తు     శుభమస్తు     అవిఘ్నమస్తు', { font: C.TE2, size: 42, fill: C.KUM }); au.position.set(540, 410); root.addChild(au);
    const l1 = C.text('చల్లపల్లి వారి', { font: C.TE, size: 100, fill: C.KUM }); l1.position.set(540, 735); root.addChild(l1);
    const l2 = C.foil(root, 'పెండ్లి పిలుపు', { font: C.TE, size: 150, on: 'light' }); l2.position.set(540, 895);
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
      sheen(t, B.patrika, B.bride + XF);
      const f = E.out3(span(t, B.patrika, B.patrika + 2.6)); frame.scale.set(fk * (1.05 - 0.05 * f));
      C.rise(gan, t, B.patrika + 0.9, 1.3, 12); C.rise(au, t, B.patrika + 1.3, 1.3, 12);
      C.rise(l1, t, B.line1, 1.4); C.rise(l2, t, B.line2, 1.6, 26); l2.sweep(t, B.line2 + 1.6, 2.0);
      rule.clear(); const rk = E.inOut(span(t, B.line2 + 0.8, B.line2 + 2.2));
      if (rk > 0) { rule.moveTo(540 - 300 * rk, 1022).lineTo(540 + 300 * rk, 1022).stroke({ width: 2.5, color: C.GOLD }); rule.poly([540, 1010, 552, 1022, 540, 1034, 528, 1022]).fill({ color: C.GOLD, alpha: rk }); }
      C.rise(names, t, B.names, 1.5); C.rise(en, t, B.en, 1.3, 14); C.rise(vv, t, B.en + 0.9, 1.3, 14);
      om.set(E.inOut(span(t, B.date - 1.0, B.date + 1.4)), 'center');
      dabs.forEach(d => { const ta = B.names + 0.6 + d.i * 0.3; d.a.alpha = E.smooth(span(t, ta, ta + 0.9)); d.a.scale.set(0.5 + 0.05 * E.out3(span(t, ta, ta + 0.9)));
        d.b.alpha = E.smooth(span(t, ta + 0.4, ta + 1.3)); d.b.scale.set(0.38 + 0.04 * E.out3(span(t, ta + 0.4, ta + 1.3))); });
      s.cam.s = 1 + 0.04 * E.inOut(span(t, B.patrika, B.bride + XF)); s.cam.y = 960 - 20 * E.inOut(span(t, B.patrika, B.bride));
      fg(t, -18 * E.inOut(span(t, B.patrika, B.bride)), 0, E.smooth(span(t, B.patrika, B.patrika + 2)));
      C.cam.petals = 0.4 * E.smooth(span(t, B.line2, B.line2 + 2)); C.cam.dust = 0.18; C.cam.dustTint = 0xffe6b0; C.cam.grain = 0.12;
    };
  }, XF, 'burn'));

  /* ============================================================ 4 · the bride and the groom: silhouette, light, colour */
  SCENES.push(() => C.scene(B.bride, B.stars + XF, (root, s) => {
    C.bg(root, C.silkTex());
    const sheen = C.sheen(root, 0.07);
    const FX = 150, FY = 180, FW = 780, FH = 860;
    const people = [
      { tex: C.A.brideMatte, ink: 'bride', h: 1380, cy: 640, t0: B.bride, t1: B.groom, role: 'THE BRIDE',
        name: 'చి.ల.సౌ. నిఖిత', lines: ['శ్రీ చల్లపల్లి శ్రీధర్ గారు', 'శ్రీమతి వెంకట కృష్ణవేణి గార్ల కుమార్తె'] },
      { tex: C.A.groomMatte, ink: 'groom', h: 1020, cy: 615, t0: B.groom, t1: B.stars, role: 'THE GROOM',
        name: 'చి. సాయి కౌండిన్య', lines: ['కొవ్వూరు వాస్తవ్యులు', 'శ్రీ కొక్కిరాల వి.వి. హరిమోహన్ గారు', 'శ్రీమతి శైలజ గార్ల కుమారుడు'] },
    ].map(p => {
      const g = new PIXI.Container(); root.addChild(g); p.g = g;
      const pic = new PIXI.Container(); g.addChild(pic);
      p.rev = C.lightReveal(pic, p.tex, 540, p.cy, p.h);
      const clip = new PIXI.Graphics().rect(FX + 8, FY + 8, FW - 16, FH - 16).fill(0xffffff); g.addChild(clip); pic.mask = clip;
      p.frame = C.filigree(g, FX, FY, FW, FH, { crest: true });
      p.roleT = C.label(p.role, { size: 25, fill: C.GOLD_D, ls: 12 }); p.roleT.position.set(540, 1095); g.addChild(p.roleT);
      p.ink = C.inkLettering(g, p.ink, 540, 1200, 380);
      p.rule = new PIXI.Graphics().moveTo(450, 1302).lineTo(526, 1302).moveTo(554, 1302).lineTo(630, 1302).stroke({ width: 1.5, color: C.GOLD }).poly([540, 1295, 547, 1302, 540, 1309, 533, 1302]).fill(C.GOLD); g.addChild(p.rule);
      p.nm = C.text(p.name, { font: C.TE, size: 64, fill: C.KUM }); p.nm.position.set(540, 1370); g.addChild(p.nm);
      p.ls = p.lines.map((l, i) => { const x = C.text(l, { font: C.TE2, size: 44, fill: 0x4a3a2c }); x.position.set(540, 1446 + i * 54); g.addChild(x); return x; });
      return p;
    });
    s.prep = async (t) => { for (const p of people) if (t >= p.t0 - 0.2 && t < p.t1 + XF) await p.ink.set(span(t, p.t0 + 1.5, p.t0 + 3.2)); };
    return (t) => {
      sheen(t, B.bride, B.stars);
      people.forEach((p, i) => {
        const on = t >= p.t0 - 0.1 && t < p.t1 + XF; p.g.visible = on; if (!on) return;
        p.rev.set(span(t, p.t0, p.t0 + 0.6), span(t, p.t0 + 0.7, p.t0 + 2.3)); p.frame.set(span(t, p.t0 + 0.1, p.t0 + 1.6));
        const inK = i ? E.smooth(span(t, p.t0 + XF * 0.45, p.t0 + XF)) : 1, outK = i ? 0 : E.smooth(span(t, p.t1, p.t1 + XF * 0.5));
        p.g.alpha = inK * (1 - outK);
        C.rise(p.roleT, t, p.t0 + 0.4, 0.9, 10); p.rule.alpha = E.smooth(span(t, p.t0 + 2.4, p.t0 + 3.0));
        C.rise(p.nm, t, p.t0 + 2.5, 1.0, 14);
        p.ls.forEach((l, j) => C.rise(l, t, p.t0 + 2.9 + j * 0.3, 0.9, 12));
      });
      s.cam.s = 1 + 0.025 * E.inOut(span(t, B.bride, B.groom)) + 0.025 * E.inOut(span(t, B.groom, B.stars));
      C.cam.dust = 0.18; C.cam.dustTint = 0xffe2b0; C.cam.grain = 0.1;
    };
  }, XF, 'burn'));

  /* ============================================================ 5 · written in the stars */
  SCENES.push(() => C.scene(B.stars, B.muhurtham + XF, (root, s) => {
    C.bg(root, C.linear(8, 512, [[0, '#06050c'], [0.55, '#110b1d'], [1, '#22102a']]));
    [[300, 600, 0x5a2a6a, 7], [820, 1300, 0x6a3a1a, 8], [520, 1000, 0x2a2a6a, 10]].forEach(([x, y, c, k]) => { const n = new PIXI.Sprite(C.glowTex()); n.anchor.set(0.5); n.position.set(x, y); n.tint = c; n.scale.set(k); n.alpha = 0.18; n.blendMode = 'add'; root.addChild(n); });
    const sky = new PIXI.Container(); root.addChild(sky);
    const DIPPER = [[150, 600], [330, 520], [470, 590], [600, 640], [640, 820], [860, 860], [880, 660]], MIZAR = DIPPER[1];
    const cons = new PIXI.Graphics(); sky.addChild(cons);
    const big = DIPPER.map(([x, y], i) => { const d = new PIXI.Sprite(C.glowTex()); d.anchor.set(0.5); d.blendMode = 'add'; d.tint = 0xe8eeff; d.position.set(x, y); sky.addChild(d); const c = new PIXI.Sprite(C.dotTex()); c.anchor.set(0.5); c.blendMode = 'add'; c.position.set(x, y); sky.addChild(c); return { d, c, i }; });
    const sap = C.text('సప్తర్షి మండలం', { font: C.TE2, size: 64, fill: C.CREAM }); sap.position.set(540, 300); root.addChild(sap);
    const sapEn = C.label('THE SAPTARISHI · SEVEN SAGES', { size: 24, fill: C.GOLD, ls: 9 }); sapEn.position.set(540, 378); root.addChild(sapEn);
    const r = rng(77), stars = [];
    for (let i = 0; i < 650; i++) { const st = new PIXI.Sprite(C.dotTex()); st.anchor.set(0.5); st.blendMode = 'add'; const z = r(); st.tint = r() < 0.15 ? 0xffe0b0 : 0xdfe6ff; sky.addChildAt(st, 0); stars.push({ s: st, x: r() * W, y: r() * H, z, a: 0.25 + 0.75 * r() * r() + 0.2 * z, sz: 0.02 + 0.07 * z * z }); }
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
    [['నిఖిత', 230, 860, 7, B.nik, 1.0], ['సాయి కౌండిన్య', 158, 1110, 6, B.sai, 1.3]].forEach(([str, size, y, step, t0, dur]) => {
      const pts = targets(str, size, y, step), xs = pts.map(p => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs);
      pts.forEach(([x, y]) => { const sp = new PIXI.Sprite(C.dotTex()); sp.anchor.set(0.5); sp.blendMode = 'add'; sp.tint = rr() < 0.3 ? 0xffffff : 0xffd98c; root.addChild(sp);
        parts.push({ s: sp, x, y, t0: t0 + (x - x0) / (x1 - x0 || 1) * dur * 0.8 + rr() * 0.15, fly: 0.9 + rr() * 0.5, cx: (rr() - 0.5) * 520, cy: -120 - rr() * 260, sz: 0.045 + rr() * 0.03, ph: rr() * 6 }); });
    });
    const glowN = new PIXI.Container(); root.addChild(glowN);
    [['నిఖిత', 230, 860], ['సాయి కౌండిన్య', 158, 1110]].forEach(([str, size, y]) => { const g = C.text(str, { font: C.TE, size, fill: 0xffb547 }); g.position.set(540, y); g.blendMode = 'add'; g.filters = [new PIXI.BlurFilter({ strength: 16, quality: 3 })]; glowN.addChild(g); });
    const n1 = C.foil(root, 'నిఖిత', { font: C.TE, size: 230, glow: false }), n2 = C.foil(root, 'సాయి కౌండిన్య', { font: C.TE, size: 158, glow: false });
    n1.position.set(540, 860); n2.position.set(540, 1110);
    const orn = new PIXI.Graphics(); root.addChild(orn);
    const wit = C.text('అరుంధతి నక్షత్రం సాక్షిగా', { font: C.TE2, size: 70, fill: C.CREAM }); wit.position.set(540, 1340); root.addChild(wit);
    const wen = C.label('WITH ARUNDHATI AS OUR WITNESS', { size: 25, fill: C.GOLD, ls: 9 }); wen.position.set(540, 1422); root.addChild(wen);
    return (t) => {
      const lt = t - B.stars;
      stars.forEach(p => { p.s.position.set(p.x, p.y); p.s.scale.set(p.sz); p.s.alpha = p.a; });
      // draw the seven sages, then glide in to the second star of the handle
      cons.clear(); const ck = span(t, B.stars + 0.1, B.stars + 1.0); C.drawPart(cons, DIPPER.concat([DIPPER[3]]), E.inOut(ck)); cons.stroke({ width: 2, color: 0xcfd8ff, alpha: 0.55 });
      const after = 1 - E.smooth(span(t, B.merge, B.merge + 1.6));
      big.forEach(b => { const kk = E.out3(span(t, B.stars + 0.1 + b.i * 0.08, B.stars + 0.5 + b.i * 0.08)); b.d.scale.set(0.5 * kk); b.d.alpha = 0.5 * after; b.c.scale.set(0.16 * kk); b.c.alpha = after; });
      const z = E.inOut(span(t, B.stars + 0.8, B.merge - 0.3)), zs = 1 + 1.9 * z;
      sky.scale.set(zs); sky.pivot.set(lerp(540, MIZAR[0], z), lerp(960, MIZAR[1], z)); sky.position.set(540, lerp(960, 700, z));
      cons.alpha = (1 - 0.7 * z) * after;
      C.rise(sap, t, B.stars + 0.2, 0.8, 12); C.rise(sapEn, t, B.stars + 0.45, 0.8, 10); sap.alpha *= 1 - E.smooth(span(t, B.merge - 0.7, B.merge - 0.2)); sapEn.alpha *= 1 - E.smooth(span(t, B.merge - 0.7, B.merge - 0.2));
      const pc = [540 + (MIZAR[0] - sky.pivot.x) * zs, sky.position.y + (MIZAR[1] - sky.pivot.y) * zs];
      const k = span(t, B.stars, B.merge), rad = (14 + 120 * z) * (1 - E.inOut(span(t, B.merge - 0.8, B.merge))), ang = 2.2 + 5 * Math.pow(k, 1.5), merged = t >= B.merge;
      [[vas, 1], [aru, -1]].forEach(([st, sg]) => { st.c.visible = !merged && z > 0.05; st.c.alpha = E.smooth(span(z, 0.05, 0.4)); st.c.position.set(pc[0] + sg * Math.cos(ang) * rad, pc[1] + sg * Math.sin(ang) * rad * 0.55);
        st.g.scale.set(1.0 + 0.6 * k); st.g.alpha = 0.55; st.f.scale.set(0.5 + 0.4 * k); st.f.rotation = lt * 0.2; st.d.scale.set(0.22); });
      const rise = E.inOut(span(t, B.merge + 0.2, B.merge + 1.0)), oy = lerp(700, 470, rise);
      one.c.visible = merged; one.c.position.set(540, oy);
      const m = merged ? Math.exp(-(t - B.merge) * 1.2) : 0;
      one.g.scale.set(1.6 + 2.2 * m); one.g.alpha = 0.7; one.f.scale.set(0.9 + 1.0 * m); one.f.rotation = 0.2 + lt * 0.05; one.d.scale.set(0.3 + 0.25 * m);
      bloom.position.set(540, 700); bloom.scale.set(5 + 8 * (1 - m)); bloom.alpha = merged ? 0.8 * m : 0;
      ring.clear(); const rk = span(t, B.merge, B.merge + 1.5); if (rk > 0 && rk < 1) ring.circle(540, 700, 40 + 620 * E.out3(rk)).stroke({ width: 2, color: 0xffd98c, alpha: 0.45 * (1 - rk) });
      parts.forEach(p => { const q = span(t, p.t0, p.t0 + p.fly); if (q <= 0) { p.s.visible = false; return; } p.s.visible = true;
        const e = E.inOut(q), sx = 540, sy = oy, mx = (sx + p.x) / 2 + p.cx, my = (sy + p.y) / 2 + p.cy;
        p.s.position.set((1 - e) * (1 - e) * sx + 2 * (1 - e) * e * mx + e * e * p.x + (q >= 1 ? 1.2 * Math.sin(t * 2 + p.ph) : 0), (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * my + e * e * p.y);
        p.s.scale.set(p.sz * (q < 1 ? 1.3 : 1)); p.s.alpha = 1 - E.smooth(span(t, B.lock, B.lock + 1.6)); });
      const lock = E.smooth(span(t, B.lock - 0.6, B.lock + 0.6)); n1.alpha = n2.alpha = lock; glowN.alpha = 0.5 * lock;
      n1.sweep(t, B.lock + 0.8, 1.8); n2.sweep(t, B.lock + 1.1, 1.9);
      orn.clear(); const ok = E.out3(span(t, B.lock + 0.4, B.lock + 1.6)); if (ok > 0) { orn.moveTo(540 - 120 * ok, 985).lineTo(522, 985).moveTo(558, 985).lineTo(540 + 120 * ok, 985).stroke({ width: 2, color: C.GOLD }); orn.poly([540, 975, 550, 985, 540, 995, 530, 985]).fill(C.GOLD); }
      C.rise(wit, t, B.lock + 0.2, 0.8); C.rise(wen, t, B.lock + 0.5, 0.8, 12);
      s.cam.s = 1 + 0.04 * E.inOut(span(t, B.stars, B.muhurtham + XF));
      C.cam.grain = 0.07;
    };
  }, XF, 'burn'));

  /* ============================================================ 6 · the muhurtham and the venue */
  SCENES.push(() => C.scene(B.muhurtham, B.hush + XF, (root, s) => {
    C.bg(root, RED()); const sheen = C.sheen(root, 0.1);
    const frame = C.filigree(root, 80, 200, 920, 1380, { crest: true });
    const div = (y) => { const g = new PIXI.Graphics().moveTo(400, y).lineTo(526, y).moveTo(554, y).lineTo(680, y).stroke({ width: 1.5, color: C.GOLD_HI, alpha: 0.85 }).poly([540, y - 8, 548, y, 540, y + 8, 532, y]).fill(C.GOLD_HI); root.addChild(g); return g; };
    const echo = C.echo(root, 'సుముహూర్తం', { font: C.TE, size: 124 }, 3, 3.0); root.children[root.children.length - 1].position.set(540, 345);
    const head = C.foil(root, 'సుముహూర్తం', { font: C.TE, size: 124 }); head.position.set(540, 345);
    const hen = C.label('THE MUHURTHAM', { size: 26, fill: C.GOLD_TEXT, ls: 14 }); hen.position.set(540, 440); root.addChild(hen);
    const d1 = div(505);
    const dayTe = C.text('ఆదివారం, 13 డిసెంబర్ 2026', { font: C.TE2, size: 60, fill: 0xFBEFD8 }); dayTe.position.set(540, 590); root.addChild(dayTe);
    const dayEn = C.label('SUNDAY · 13 DECEMBER 2026', { size: 26, fill: C.GOLD_TEXT, ls: 9 }); dayEn.position.set(540, 665); root.addChild(dayEn);
    const time = C.foil(root, '8:22', { font: C.EN, size: 210, weight: '300', ls: 4 }); time.position.set(540, 830);
    const timeTe = C.text('రాత్రి 8:22 గంటలకు', { font: C.TE2, size: 50, fill: 0xFBEFD8 }); timeTe.position.set(540, 985); root.addChild(timeTe);
    const d2 = div(1065);
    const pin = new PIXI.Graphics().circle(0, -10, 16).fill(C.GOLD_TEXT).poly([-14, -2, 14, -2, 0, 24]).fill(C.GOLD_TEXT).circle(0, -10, 6).fill(0x8a1912); pin.position.set(540, 1135); root.addChild(pin);
    const v1 = C.text('శ్రీ కొత్తపల్లి శ్రీరాములు కనకమ్మ\nలయన్స్ A/C కళ్యాణమండపం', { font: C.TE2, size: 54, fill: 0xFBEFD8, lh: 74 }); v1.position.set(540, 1255); root.addChild(v1);
    const v2 = C.text('Sri Kothapalli Sriramulu Kanakamma\nLions A/C Kalyana Mandapam', { font: C.EN, size: 31, fill: C.GOLD_TEXT, weight: '400', lh: 44 }); v2.position.set(540, 1410); root.addChild(v2);
    const v3 = C.label('R.T.C COMPLEX ROAD · NIDADAVOLU 534301', { size: 24, fill: C.GOLD_TEXT, ls: 6 }); v3.position.set(540, 1497); root.addChild(v3);
    const fg = C.foreground(root, [['marigold', -30, 1880, 1.4, 0, 16], ['leaf', 70, 1960, 1.3, 0.4, 12], ['marigold', 1100, 1850, 1.3, 0.4, 18], ['leaf', 1020, 1960, 1.2, -0.5, 12]]);
    return (t) => {
      sheen(t, B.muhurtham, B.hush + XF); frame.set(span(t, B.muhurtham + 0.3, B.muhurtham + 2.4)); echo(t, E.smooth(span(t, B.muhurtham + 1.2, B.muhurtham + 2.2)));
      C.rise(head, t, B.muhurtham + 0.6, 1.5); C.rise(hen, t, B.muhurtham + 1.3, 1.3, 12); d1.alpha = E.smooth(span(t, B.muhurtham + 1.8, B.muhurtham + 2.8));
      C.rise(dayTe, t, B.day, 1.4); C.rise(dayEn, t, B.day + 0.6, 1.3, 12);
      C.rise(time, t, B.time, 1.8, 30); C.rise(timeTe, t, B.time + 1.4, 1.4, 12); d2.alpha = E.smooth(span(t, B.time + 2.6, B.time + 3.6));
      C.rise(pin, t, B.venue, 1.1, 14); C.rise(v1, t, B.venue + 0.4, 1.5); C.rise(v2, t, B.venue + 1.3, 1.4, 14); C.rise(v3, t, B.venue + 2.0, 1.3, 10);
      s.cam.s = 1 + 0.025 * E.inOut(span(t, B.muhurtham, B.hush + XF));
      fg(t, 0, -20 * E.inOut(span(t, B.muhurtham, B.hush)), 0.95);
      C.cam.dust = 0.35; C.cam.dustTint = 0xffd27a; C.cam.grain = 0.09;
    };
  }, XF, 'burn'));

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
    [B.drop, B.toss2, B.toss3].forEach((t0) => { for (let i = 0; i < 40; i++) { const sp = new PIXI.Sprite(C.riceTex()); sp.anchor.set(0.5); rl.addChild(sp);
      const a = -Math.PI / 2 + (r() - 0.5) * 1.9, v = 700 + r() * 900; rice.push({ s: sp, t0: t0 + r() * 0.35, x0: 540 + (r() - 0.5) * 760, y0: 1980 + r() * 120, vx: Math.cos(a) * v, vy: Math.sin(a) * v, sp: (r() - 0.5) * 6, ph: r() * 6, sz: 0.2 + r() * 0.14 }); } });
    const hushRice = []; for (let i = 0; i < 26; i++) { const sp = new PIXI.Sprite(C.riceTex()); sp.anchor.set(0.5); rl.addChild(sp); hushRice.push({ s: sp, x: r() * W, y0: H * (0.3 + r()), v: 30 + r() * 60, ph: r() * 6, sz: 0.2 + r() * 0.12 }); }
    const garland = C.toranam(root, 70, 9);
    const tal = C.foil(root, 'తలంబ్రాలు', { font: C.TE2, size: 62 }); tal.position.set(540, 395);
    const names = new PIXI.Container(); root.addChild(names);
    const nA = C.foil(names, 'నిఖిత', { font: C.TE, size: 82 }), nB = C.foil(names, 'సాయి కౌండిన్య', { font: C.TE, size: 82 });
    const wA = nA.getLocalBounds().width, wB = nB.getLocalBounds().width, gap = 100, x0 = 540 - (wA + gap + wB) / 2; nA.x = x0 + wA / 2; nB.x = x0 + wA + gap + wB / 2;
    const heart = new PIXI.Graphics(); C.heartPath(heart, C.GOLD_HI); heart.scale.set(1.7); heart.position.set(x0 + wA + gap / 2, 6); names.addChild(heart); names.y = 1455;
    const when = C.label('13 · 12 · 2026  ·  8:22 PM', { size: 31, fill: C.GOLD_HI, ls: 10 }); when.position.set(540, 1555); root.addChild(when);
    const fg = C.foreground(root, [['marigold', -40, 1870, 1.5, 0, 16], ['leaf', 60, 1950, 1.3, 0.4, 12], ['marigold', 1110, 1880, 1.4, 0.4, 18]]);
    return (t) => {
      silk.alpha = E.smooth(span(t, B.drop - 0.2, B.drop + 1.8)); sheen(t, B.drop, B.events + XF);
      rays(t, 0.6 * E.smooth(span(t, B.drop, B.drop + 2.5)));
      const pre = E.inOut(span(t, B.hush + 0.2, B.drop - 0.4));
      line.clear(); C.drawPart(line, outer, pre); line.stroke({ width: 7, color: C.GOLD }); C.drawPart(line, inner, E.inOut(span(t, B.hush + 0.7, B.drop - 0.2))); line.stroke({ width: 2, color: C.GOLD_HI });
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
      C.cam.petals = 0.4 * E.smooth(span(t, B.toss2, B.toss2 + 2)) * (1 - 0.6 * E.smooth(span(t, B.coupleNames - 1, B.coupleNames + 1))); C.cam.grain = 0.09;
    };
  }, XF));

  /* ============================================================ 9 · the celebrations */
  SCENES.push(() => C.scene(B.events, B.shubham + XF, (root, s) => {
    C.bg(root, C.silkTex()); const sheen = C.sheen(root, 0.08);
    const frame = C.filigree(root, 60, 170, 960, 1480, { crest: true });
    const thread = new PIXI.Graphics(); root.addChild(thread);
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
      rows.forEach((e, i) => { const k = E.out3(span(t, e.at, e.at + 1.3)); e.c.alpha = k; e.c.x = 50 * (1 - k); if (e.hero) e.te.sweep(t, e.at + 1.2, 1.8); e.c.children.forEach(ch => { if (ch.texture === e.icon) ch.y = 6 + 4 * Math.sin(t * 0.9 + i); }); });
      thread.clear(); C.drawPart(thread, [[205, 520], [205, 1330]], E.inOut(span(t, B.events + 1.0, B.events + 4.6))); thread.stroke({ width: 2, color: C.GOLD, alpha: 0.6 });
      s.cam.s = 1 + 0.025 * E.inOut(span(t, B.events, B.shubham + XF));
      C.cam.petals = 0.3; C.cam.dust = 0.15; C.cam.dustTint = 0xffe6b0; C.cam.grain = 0.12;
    };
  }, XF, 'burn'));

  /* ============================================================ 10 · శుభం, and the family's invitation */
  SCENES.push(() => C.scene(B.shubham, B.end + 0.1, (root, s) => {
    C.bg(root, RED()); const sheen = C.sheen(root, 0.13);
    const rays = C.rays(root, 540, 650, 0xffd08a, 2.4); const wmark = C.watermark(root, 540, 660, 460, C.GOLD_HI, 0.07);
    const garland = C.toranam(root, 60, 13);
    const orn = new PIXI.Sprite(C.A.ornament); orn.anchor.set(0.5); orn.tint = C.GOLD_HI; orn.scale.set(600 / orn.texture.width); orn.position.set(540, 395); root.addChild(orn);
    const glow = C.text('శుభం', { font: C.TE, size: 310, fill: 0xffa53a }); glow.position.set(540, 660); glow.blendMode = 'add'; glow.filters = [new PIXI.BlurFilter({ strength: 26, quality: 3 })]; root.addChild(glow);
    const echo = C.echo(root, 'శుభం', { font: C.TE, size: 310 }, 3, 2.8); root.children[root.children.length - 1].position.set(540, 660);
    const word = C.foil(root, 'శుభం', { font: C.TE, size: 310 }); word.position.set(540, 660);
    const inv = ['మీరు సకుటుంబ సపరివార సమేతంగా విచ్చేసి,', 'నూతన వధూవరులను ఆశీర్వదించవలసినదిగా', 'సాదరంగా ఆహ్వానిస్తున్నాము.'].map((l, i) => { const x = C.text(l, { font: C.TE2, size: 48, fill: C.CREAM }); x.position.set(540, 935 + i * 66); root.addChild(x); return x; });
    const names = new PIXI.Container(); root.addChild(names);
    const nA = C.foil(names, 'నిఖిత', { font: C.TE, size: 78 }), nB = C.foil(names, 'సాయి కౌండిన్య', { font: C.TE, size: 78 });
    const wA = nA.getLocalBounds().width, wB = nB.getLocalBounds().width, gap = 96, x0 = 540 - (wA + gap + wB) / 2; nA.x = x0 + wA / 2; nB.x = x0 + wA + gap + wB / 2;
    const heart = new PIXI.Graphics(); C.heartPath(heart, C.GOLD_HI); heart.scale.set(1.7); heart.position.set(x0 + wA + gap / 2, 6); names.addChild(heart); names.y = 1170;
    const sign = C.text('ఇట్లు, చల్లపల్లి కుటుంబ సభ్యులు', { font: C.TE2, size: 50, fill: 0xF3D9A6 }); sign.position.set(540, 1295); root.addChild(sign);
    const date = C.label('SUNDAY · 13 · 12 · 2026 · 8:22 PM · NIDADAVOLU', { size: 23, fill: C.GOLD_HI, ls: 6 }); date.position.set(540, 1378); root.addChild(date);
    const fg = C.foreground(root, [['marigold', -30, 1890, 1.4, 0, 16], ['marigold', 1110, 1900, 1.3, 0.4, 18]]);
    return (t) => {
      sheen(t, B.shubham, B.end); wmark(t, E.smooth(span(t, B.shubham + 0.8, B.shubham + 3))); rays(t, 0.5 * E.smooth(span(t, B.shubham + 0.5, B.shubham + 3)));
      garland.set(t, B.shubham + 0.6, 1.8); C.rise(orn, t, B.shubham + 0.4, 1.5, 12);
      const wk = E.out3(span(t, B.shubham + 0.6, B.shubham + 2.4)); word.alpha = wk; word.scale.set(1.06 - 0.06 * wk); glow.scale.copyFrom(word.scale); glow.alpha = 0.5 * wk;
      echo(t, E.smooth(span(t, B.shubham + 1.0, B.shubham + 2.0)));
      inv.forEach((l, i) => C.rise(l, t, B.invite + i * 0.4, 1.1, 12));
      C.rise(names, t, B.shubham + 2.6, 1.0); nA.sweep(t, 117.0, 1.8); nB.sweep(t, 117.3, 2.0); C.rise(sign, t, B.sign, 1.0, 12); C.rise(date, t, B.sign + 0.5, 1.0, 10);
      s.cam.s = 1 + 0.03 * E.inOut(span(t, B.shubham, B.end));
      fg(t, 0, -14 * E.inOut(span(t, B.shubham, B.end)), 0.95);
      C.cam.dust = 0.5; C.cam.dustTint = 0xffd27a; C.cam.petals = 0.4; C.cam.grain = 0.09;
      C.cam.floodColor = 0x000000; C.cam.flood = E.inOut(span(t, B.end - 1.3, B.end));
    };
  }, XF, 'burn'));
})();

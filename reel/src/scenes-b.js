/* Pendli Pilupu reel · scenes 5–8 (22.75 – 42 s) */
(function () {
  const { W, H, E, span, clamp, lerp, hit, rng, noise1, T } = C;
  const SCENES = window.SCENES;

  // an organic watercolour blob: a soft core with an uneven, pigment-pooled edge
  const blobTex = () => C._blob || (C._blob = C.canvasTex(256, 256, (x, w) => {
    const r = rng(33);
    for (let i = 0; i < 40; i++) { const a = r() * 6.283, d = r() * 30, rad = 60 + r() * 50;
      const g = x.createRadialGradient(w / 2 + Math.cos(a) * d, w / 2 + Math.sin(a) * d, 0, w / 2 + Math.cos(a) * d, w / 2 + Math.sin(a) * d, rad);
      g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(0.75, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.beginPath(); x.arc(w / 2 + Math.cos(a) * d, w / 2 + Math.sin(a) * d, rad, 0, 6.283); x.fill(); }
  }));
  // a portrait that blooms open like paint spreading on wet paper
  function bloomPortrait(parent, tex, box, lobes, zoom = 1) {
    const c = new PIXI.Container(); parent.addChild(c);
    const s = new PIXI.Sprite(tex); s.anchor.set(0.5); s.scale.set(C.fit(s, box.w, box.h) * zoom); s.position.set(box.x, box.y); c.addChild(s);
    const mw = 360, mh = 480, rt = PIXI.RenderTexture.create({ width: mw, height: mh });
    const mc = new PIXI.Container(); const blobs = lobes.map(([lx, ly, k]) => { const b = new PIXI.Sprite(blobTex()); b.anchor.set(0.5); b.position.set(lx / 100 * mw, ly / 100 * mh); mc.addChild(b); return { b, k }; });
    const feather = new PIXI.Sprite(C.canvasTex(mw, mh, (x, w, h) => {
      x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = 'destination-out'; x.filter = 'blur(26px)'; x.fillStyle = '#000'; x.fillRect(w * 0.1, h * 0.08, w * 0.8, h * 0.84);
    }));
    feather.blendMode = 'erase'; mc.addChild(feather);
    const m = new PIXI.Sprite(rt); m.anchor.set(0.5); m.position.set(box.x, box.y); m.width = s.width; m.height = s.height; c.addChild(m); s.mask = m;
    return { c, s, set(k) { blobs.forEach(({ b, k: w }) => b.scale.set(Math.max(0.001, 7 * w * k))); C.app.renderer.render({ container: mc, target: rt, clear: true }); } };
  }
  // a turmeric-coated grain of rice
  const riceTex = () => C._rice || (C._rice = C.canvasTex(24, 56, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#c98a12'); g.addColorStop(0.45, '#ffd76a'); g.addColorStop(1, '#d99a1e');
    x.fillStyle = g; x.beginPath(); x.ellipse(w / 2, h / 2, w / 2 - 1, h / 2 - 1, 0, 0, 6.283); x.fill();
    x.fillStyle = 'rgba(255,255,240,.55)'; x.beginPath(); x.ellipse(w * 0.4, h * 0.38, 3, 10, 0, 0, 6.283); x.fill();
  }));
  // a toranam: mango leaves and marigolds hung on a string, swinging into place
  function toranam(parent, y, seed) {
    const c = new PIXI.Container(); parent.addChild(c); const r = rng(seed), items = [];
    const str = new PIXI.Graphics(); c.addChild(str);
    for (let i = 0; i <= 15; i++) {
      const x = -20 + i * 1120 / 15, sag = 40 * Math.sin(Math.PI * i / 15);
      if (i % 2 === 0) { const l = new PIXI.Sprite(C.A.leaf); l.anchor.set(0.5, 0.04); l.scale.set(0.42 + r() * 0.06); l.position.set(x, sag); c.addChild(l); items.push({ s: l, ph: r() * 6, base: (r() - 0.5) * 0.12 }); }
      else { const m = new PIXI.Sprite(C.A.marigold); m.anchor.set(0.5); m.scale.set(0.42 + r() * 0.08); m.position.set(x, sag + 16); c.addChild(m); items.push({ s: m, ph: r() * 6, base: 0, flower: true }); }
    }
    str.moveTo(-40, 0); for (let i = 0; i <= 30; i++) str.lineTo(-20 + i * 1120 / 30, 40 * Math.sin(Math.PI * i / 30)); str.stroke({ width: 3, color: 0x6b4a22 });
    c.y = y;
    return { c, set(t, t0) { const k = E.out3(span(t, t0, t0 + 0.6)), dt = Math.max(0, t - t0);
      c.y = y - 320 * (1 - k); const swing = Math.exp(-dt * 2.2) * Math.sin(dt * 9);
      items.forEach(it => { it.s.rotation = it.flower ? swing * 0.2 + it.ph : it.base + swing * 0.35 + 0.03 * noise1(t * 0.8, it.ph); }); } };
  }
  C.toranam = toranam;

  /* ================================================================ 5 · the bride, the groom (22.75 – 30.09) */
  SCENES.push(() => C.scene(T.toPortraits, T.drop, (root) => {
    C.bg(root, C.paperTex());
    const box = { x: 540, y: 850, w: 1080, h: 1240 };
    const marks = new PIXI.Graphics(); root.addChild(marks);
    const LOBES = [[50, 34, 1], [36, 48, 0.85], [64, 46, 0.88], [44, 70, 0.82], [58, 20, 0.8], [52, 90, 0.78], [22, 80, 0.7], [80, 78, 0.7]];
    const people = [
      { tex: C.A.bride, te: 'వధువు', en: 'NIKHITHA', l1: 'DAUGHTER OF SRI CHALLAPALLI SREEDHAR', l2: '& SMT. VENKATA KRISHNA VENI', idx: '01 / 02', t0: T.toPortraits + 0.1, t1: T.groomPortrait, zoom: 1.32, dy: 40 },
      { tex: C.A.groom, te: 'వరుడు', en: 'SAI KOUNDINYA', l1: 'SON OF SRI KOKKIRALA V. V. HARI MOHAN', l2: '& SMT. SAILAJA · KOVVUR', idx: '02 / 02', t0: T.groomPortrait, t1: 28.2, zoom: 1.08, dy: 0 },
    ].map(p => {
      const g = new PIXI.Container(); root.addChild(g);
      p.g = g; p.pic = bloomPortrait(g, p.tex, Object.assign({}, box, { y: box.y + p.dy }), LOBES, p.zoom);
      p.teT = C.text(p.te, { font: C.TE, size: 124, fill: C.KUM }); p.teT.position.set(540, 1478); g.addChild(p.teT);
      p.enT = C.label(p.en, { size: 36, fill: C.INK, ls: 16 }); p.enT.position.set(540, 1580); g.addChild(p.enT);
      p.a = C.label(p.l1, { size: 21, fill: C.INK2, ls: 5 }); p.a.position.set(540, 1636); g.addChild(p.a);
      p.b = C.label(p.l2, { size: 21, fill: C.INK2, ls: 5 }); p.b.position.set(540, 1670); g.addChild(p.b);
      p.i = C.label(p.idx, { size: 22, fill: C.GOLD_D, ls: 6, ax: 1 }); p.i.position.set(984, 214); g.addChild(p.i);
      p.c = C.label('PORTRAIT · WATERCOLOUR', { size: 22, fill: C.GOLD_D, ls: 6, ax: 0 }); p.c.position.set(96, 214); g.addChild(p.c);
      return p;
    });
    // the build: the page darkens, turmeric rice lifts off the floor
    const dim = new PIXI.Graphics().rect(0, 0, W, H).fill(C.KUM_DEEP); dim.alpha = 0; root.addChild(dim);
    const lift = new PIXI.Container(); root.addChild(lift); const r = rng(55), grains = [];
    for (let i = 0; i < 170; i++) { const s = new PIXI.Sprite(riceTex()); s.anchor.set(0.5); lift.addChild(s); grains.push({ s, x: r() * W, y0: H * (0.15 + r() * 1.0), v: 90 + r() * 260, ph: r() * 6, sp: (r() - 0.5) * 3, sz: 0.45 + r() * 0.75, d: r() * 0.5 }); }
    const glow = new PIXI.Sprite(C.glowTex()); glow.anchor.set(0.5); glow.position.set(540, 900); glow.tint = 0xffb84a; glow.blendMode = 'add'; root.addChild(glow);
    const TICKS = [[28.75, '8:19'], [29.12, '8:20'], [29.49, '8:21'], [29.84, '8:22']];
    const clock = TICKS.map(([at, str]) => { const c = C.text(str, { font: C.EN, size: 300, fill: C.GOLD_HI, weight: '300', ls: 6 }); c.position.set(540, 900); root.addChild(c); return { c, at }; });
    const pm = C.label('PM · MUHURTHAM', { size: 30, fill: C.GOLD, ls: 14 }); pm.position.set(540, 1110); root.addChild(pm);
    return (t) => {
      C.cam.floodColor = C.IVORY; C.cam.flood = 1 - E.out3(span(t, T.toPortraits, T.toPortraits + 0.3));
      people.forEach((p, i) => {
        const on = t >= p.t0 - 0.6 && t < p.t1 + 0.7; p.g.visible = on; if (!on) return;
        const bloom = span(t, p.t0, p.t0 + 1.6); p.pic.set(E.out3(bloom));
        const enter = E.expo(span(t, p.t0 - 0.05, p.t0 + 0.6)), leave = E.in3(span(t, p.t1 - 0.05, p.t1 + 0.5));
        p.g.x = (i ? 260 * (1 - enter) : 0) - 420 * leave; p.g.alpha = (i ? enter : 1) * (1 - leave); p.g.rotation = -0.04 * leave;
        const tk = E.out3(span(t, p.t0 + 0.7, p.t0 + 1.2)); p.teT.alpha = tk; p.teT.y = 1500 - 22 * tk;
        C.typeOn(p.enT, p.en, span(t, p.t0 + 1.0, p.t0 + 1.5)); C.typeOn(p.a, p.l1, span(t, p.t0 + 1.3, p.t0 + 2.0)); C.typeOn(p.b, p.l2, span(t, p.t0 + 1.6, p.t0 + 2.2));
        C.typeOn(p.i, p.idx, span(t, p.t0 + 0.3, p.t0 + 0.6)); C.typeOn(p.c, 'PORTRAIT · WATERCOLOUR', span(t, p.t0 + 0.3, p.t0 + 0.9));
      });
      marks.clear(); const mk = E.out3(span(t, T.toPortraits + 0.2, T.toPortraits + 0.8)) * (1 - span(t, 28.2, 28.6));
      if (mk > 0) C.cropMarks(marks, 96, 250, 888, 1150, 44 * mk, C.GOLD, 2, 0.9);
      // tension into the drop: darker, closer, rice rising slowly
      const b = span(t, 28.55, T.drop), be = E.in3(b);
      dim.alpha = 0.9 * E.inOut(span(t, 28.2, 28.75));
      grains.forEach(g => { const k = span(t, 28.7 + g.d * 0.6, T.drop); g.s.visible = k > 0; if (!k) return;
        g.s.position.set(g.x + 30 * Math.sin(t * 1.3 + g.ph), g.y0 - g.v * (t - 28.7 - g.d * 0.6) * (1 + 1.5 * be)); g.s.rotation = g.ph + g.sp * t; g.s.scale.set(g.sz); g.s.alpha = Math.min(1, k * 3); });
      glow.scale.set(2 + 6 * be); glow.alpha = 0.5 * be;
      clock.forEach((c, i) => { const next = clock[i + 1], k = E.expo(span(t, c.at, c.at + 0.22)), out = next ? E.in3(span(t, next.at - 0.06, next.at + 0.1)) : 0;
        c.c.visible = t >= c.at && (!next || t < next.at + 0.1); c.c.alpha = k * (1 - out); c.c.y = 900 + 60 * (1 - k) - 60 * out; c.c.scale.set(i === 3 ? 1 + 0.06 * hit(t, c.at, 4) : 1); });
      pm.alpha = E.out3(span(t, 28.85, 29.2)); C.cam.shake += 0.25 * (hit(t, 29.12, 10) + hit(t, 29.49, 10) + hit(t, 29.84, 8));
      C.cam.x = 540; C.cam.y = 900; C.cam.s = 1 + 0.16 * be; C.cam.shake = 0.18 * be;
      C.cam.grain = 0.16;
    };
  }));

  /* ================================================================ 6 · the drop: talambralu held in the air (30.09 – 34.03) */
  SCENES.push(() => C.scene(T.drop, T.toDetails + 0.3, (root) => {
    C.bg(root, C.radial([[0, '#c22a20'], [0.55, '#8c1a13'], [1, '#3e0806']], 512));
    const sheen = new PIXI.Sprite(C.linear(1080, 1920, [[0, 'rgba(255,220,180,0)'], [0.45, 'rgba(255,220,180,.10)'], [0.5, 'rgba(255,235,200,.16)'], [0.55, 'rgba(255,220,180,.08)'], [1, 'rgba(255,220,180,0)']], false)); sheen.blendMode = 'add'; root.addChild(sheen);
    const word = C.text('పెండ్లి', { font: C.TE, size: 470, fill: { color: 0x000000, alpha: 0 }, stroke: { color: C.GOLD, width: 4 } }); word.position.set(540, 900); root.addChild(word);
    const mandala = new PIXI.Graphics(); root.addChild(mandala);
    // the photograph in a gold arch
    const pic = new PIXI.Container(); pic.position.set(540, 880); root.addChild(pic);
    const aw = 680, ah = 900, arch = (g, inset = 0) => { const w = aw / 2 - inset, top = -ah / 2 + inset, bot = ah / 2 - inset; g.moveTo(-w, bot).lineTo(-w, top + w).arc(0, top + w, w, Math.PI, 0).lineTo(w, bot).closePath(); };
    const shadow = new PIXI.Sprite(C.glowTex()); shadow.anchor.set(0.5); shadow.tint = 0x1a0201; shadow.scale.set(5.5, 6.5); shadow.alpha = 0.55; pic.addChild(shadow);
    const ph = new PIXI.Sprite(C.A.couple); ph.anchor.set(0.5, 0.48); const pk = Math.max(aw / ph.texture.width, ah / ph.texture.height) * 1.02; ph.scale.set(pk); pic.addChild(ph);
    const am = new PIXI.Graphics(); arch(am); am.fill(0xffffff); pic.addChild(am); ph.mask = am;
    const frameG = new PIXI.Graphics(); arch(frameG, -10); frameG.stroke({ width: 8, color: C.GOLD }); arch(frameG, -24); frameG.stroke({ width: 2, color: C.GOLD_HI }); pic.addChild(frameG);
    const impact = new PIXI.Sprite(C.A.impact), impactInv = new PIXI.Sprite(C.A.impactInv);
    [impact, impactInv].forEach(s => { s.anchor.set(0.5); s.scale.set(Math.max(W / s.texture.width, H / s.texture.height)); s.position.set(540, 960); root.addChild(s); });
    // the rice
    const r = rng(101), rice = []; const riceLayer = new PIXI.Container(); root.addChild(riceLayer);
    for (let i = 0; i < 520; i++) { const s = new PIXI.Sprite(riceTex()); s.anchor.set(0.5); riceLayer.addChild(s); const a = r() * 6.283, v = 1500 + r() * 3000;
      rice.push({ s, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 500, k: 1.6 + r() * 1.4, sp: (r() - 0.5) * 16, ph: r() * 6, sz: 0.6 + r() * 0.8, x0: 540 + (r() - 0.5) * 80, y0: 880 + (r() - 0.5) * 80 }); }
    const garland = toranam(root, 70, 9);
    const nA = C.text('నిఖిత', { font: C.TE, size: 78, fill: C.CREAM, ax: 0 }), nB = C.text('సాయి కౌండిన్య', { font: C.TE, size: 78, fill: C.CREAM, ax: 0 });
    const gap = 96, x0 = 540 - (nA.width + gap + nB.width) / 2; nA.x = x0; nB.x = x0 + nA.width + gap;
    const names = new PIXI.Container(); names.addChild(nA, nB); names.y = 1455; root.addChild(names);
    const heart = new PIXI.Graphics(); heart.position.set(x0 + nA.width + gap / 2, 1460); root.addChild(heart);
    const when = C.label('13 · 12 · 2026  ·  8:22 PM', { size: 30, fill: C.GOLD_HI, ls: 10 }); when.position.set(540, 1560); root.addChild(when);
    const tal = C.label('తలంబ్రాలు — TALAMBRALU', { size: 24, fill: C.GOLD_HI, ls: 8 }); tal.position.set(540, 300); root.addChild(tal);
    const held = C.label('TIME HELD · 0.64 S', { size: 20, fill: C.GOLD_HI, ls: 6, ax: 0 }); held.position.set(96, 1700); root.addChild(held);
    // time runs, stops in the air, then runs again
    const FREEZE = 30.42;
    const tau = t => t < FREEZE ? t - (T.drop + 0.08) : t < T.resume ? (FREEZE - T.drop - 0.08) + (t - FREEZE) * 0.04 : (FREEZE - T.drop - 0.08) + (T.resume - FREEZE) * 0.04 + (t - T.resume);
    return (t) => {
      const lt = t - T.drop;
      // impact: two frames of ink, one inverted, then colour
      impact.visible = t < T.drop + 0.067; impactInv.visible = t >= T.drop + 0.067 && t < T.drop + 0.1;
      C.cam.shake = hit(t, T.drop, 5) * 1.1 + hit(t, T.resume, 6) * 0.6 + hit(t, T.word, 7) * 0.5;
      const reveal = E.expo(span(t, T.drop + 0.1, T.drop + 0.9));
      pic.scale.set((1.14 - 0.14 * reveal) * (1 + 0.05 * hit(t, T.resume, 6)));
      // rice: burst, held mid-air, then the shower
      const tt = Math.max(0, tau(t));
      rice.forEach(g => { const vis = t >= T.drop + 0.08; g.s.visible = vis; if (!vis) return;
        const x = g.x0 + g.vx * (1 - Math.exp(-g.k * tt)) / g.k, y = g.y0 + g.vy * (1 - Math.exp(-g.k * tt)) / g.k + 0.5 * 900 * Math.max(0, tt - 0.25) ** 2;
        g.s.position.set(x, y); g.s.rotation = g.ph + g.sp * tt; g.s.scale.set(g.sz); });
      const frozen = t >= FREEZE && t < T.resume;
      C.cam.rgb = frozen ? 3 + 2 * Math.sin((t - FREEZE) * 3) : 0;
      held.visible = frozen; if (frozen) C.typeOn(held, 'TIME HELD · 0.64 S', span(t, FREEZE, FREEZE + 0.3));
      C.typeOn(tal, 'తలంబ్రాలు — TALAMBRALU', span(t, FREEZE, FREEZE + 0.4));
      // resume: a gold mandala shockwave locks the picture in place
      if (t >= T.resume && t < T.resume + 1.3) C.cam.shock = { x: 540, y: 880, time: (t - T.resume) * 0.8, opts: { amplitude: 26, wavelength: 200, speed: 1500, brightness: 1.12 } };
      mandala.clear(); const mk = span(t, T.resume, T.resume + 1.4);
      if (mk > 0 && mk < 1) { const R = 120 + 900 * E.out3(mk), a = 1 - mk;
        for (let i = 0; i < 24; i++) { const an = i / 24 * 6.283 + mk * 0.4; const x = 540 + Math.cos(an) * R, y = 880 + Math.sin(an) * R;
          mandala.moveTo(540 + Math.cos(an - 0.06) * (R - 60), 880 + Math.sin(an - 0.06) * (R - 60)).quadraticCurveTo(x * 1.0, y * 1.0, 540 + Math.cos(an + 0.06) * (R - 60), 880 + Math.sin(an + 0.06) * (R - 60)); }
        mandala.stroke({ width: 4, color: C.GOLD_HI, alpha: a }); mandala.circle(540, 880, R - 80).stroke({ width: 2, color: C.GOLD, alpha: a * 0.8 }); mandala.circle(540, 880, R * 0.7).stroke({ width: 1.5, color: C.GOLD_HI, alpha: a * 0.6 }); }
      garland.set(t, T.resume);
      const wk = E.expo(span(t, T.word, T.word + 0.4)); word.alpha = wk * 0.85; word.scale.set(1.25 - 0.25 * wk);
      const nk = E.out3(span(t, T.word + 0.2, T.word + 0.7)); names.alpha = nk; names.y = 1475 - 20 * nk;
      heart.clear(); if (nk > 0) { heart.scale.set(1.7 * E.back(span(t, T.word + 0.3, T.word + 0.7))); heart.poly([0, 6, -9, -3, -9, -8, -5, -12, 0, -9, 5, -12, 9, -8, 9, -3]).fill(C.GOLD_HI); }
      C.typeOn(when, '13 · 12 · 2026  ·  8:22 PM', span(t, T.word + 0.5, T.word + 1.0));
      sheen.x = -300 + 600 * E.inOut(span(t, T.drop, T.toDetails));
      C.cam.x = 540; C.cam.y = 960; C.cam.s = 1 + 0.04 * E.inOut(span(t, T.resume, T.toDetails)) + 0.06 * hit(t, T.drop, 8);
      C.cam.flood = 0.35 * hit(t, T.drop + 0.1, 24); C.cam.floodColor = 0xfff3dc;
      C.cam.grain = 0.12;
    };
  }));

  /* ================================================================ 7 · the celebrations (34.03 – 39.0) */
  SCENES.push(() => C.scene(T.toDetails, T.toEnd + 0.5, (root) => {
    const body = new PIXI.Container(); root.addChild(body);
    C.bg(body, C.paperTex());
    const wipe = new PIXI.Graphics(); root.addChild(wipe); body.mask = wipe;
    const edge = new PIXI.Graphics(); root.addChild(edge);
    const head = C.text('వేడుకలు', { font: C.TE, size: 124, fill: C.KUM }); head.position.set(540, 296); body.addChild(head);
    const sub = C.label('CELEBRATIONS · DECEMBER 2026', { size: 24, fill: C.GOLD_D, ls: 9 }); sub.position.set(540, 392); body.addChild(sub);
    const rows = [
      { at: 34.35, icon: C.A.gorintaku, te: 'గోరింటాకు', en: 'MEHENDI', when: 'FRI · 11 DEC · 4:00 PM ONWARDS' },
      { at: T.ev2, icon: C.A.marigold, te: 'హల్దీ', en: 'HALDI', when: 'SAT · 12 DEC · 3:30 PM ONWARDS' },
      { at: T.ev3, icon: C.A.bangles, te: 'పెండ్లికూతురు', en: 'PENDLIKUTHURU', when: 'SAT · 12 DEC · 9:25 AM' },
      { at: T.ev4, icon: C.A.kalasham, te: 'వివాహం', en: 'THE WEDDING', when: 'SUN · 13 DEC · 8:22 PM', hero: true },
    ].map((e, i) => {
      const c = new PIXI.Container(); c.y = 560 + i * 222 + (e.hero ? 20 : 0); body.addChild(c);
      const card = new PIXI.Graphics(); if (e.hero) card.roundRect(80, -100, 920, 220, 6).fill(C.KUM); else card.moveTo(110, 110).lineTo(970, 110).stroke({ width: 1.5, color: C.GOLD, alpha: 0.6 }); c.addChild(card);
      const ic = new PIXI.Sprite(e.icon); ic.anchor.set(0.5); C.fit(ic, 150, 150); ic.position.set(200, 6); c.addChild(ic);
      const te = C.text(e.te, { font: C.TE, size: e.hero ? 84 : 70, fill: e.hero ? C.GOLD_HI : C.KUM, ax: 0 }); te.position.set(312, -26); c.addChild(te);
      const en = C.label(e.en, { size: 22, fill: e.hero ? C.CREAM : C.INK2, ls: 7, ax: 0 }); en.position.set(316, 34); c.addChild(en);
      const wh = C.label(e.when, { size: 27, fill: e.hero ? C.CREAM : C.INK, ls: 4, weight: '500', ax: 0 }); wh.position.set(316, 76); c.addChild(wh);
      const num = C.label('0' + (i + 1), { size: 22, fill: e.hero ? C.GOLD_HI : C.GOLD_D, ls: 4, ax: 1 }); num.position.set(970, -60); c.addChild(num);
      return Object.assign(e, { c, wh });
    });
    const venue = new PIXI.Container(); venue.y = 1530; body.addChild(venue);
    const vline = new PIXI.Graphics().moveTo(110, -40).lineTo(970, -40).stroke({ width: 1.5, color: C.GOLD, alpha: 0.6 }); venue.addChild(vline);
    const pin = new PIXI.Graphics().circle(0, -10, 16).fill(C.KUM).poly([-14, -2, 14, -2, 0, 26]).fill(C.KUM).circle(0, -10, 6).fill(C.IVORY); pin.position.set(130, 32); venue.addChild(pin);
    const vTe = C.text('శ్రీ కొత్తపల్లి శ్రీరాములు కనకమ్మ లయన్స్ A/C కళ్యాణమండపం', { font: C.TE2, size: 40, fill: C.INK, ax: 0, wrap: 800 }); vTe.position.set(170, 22); venue.addChild(vTe);
    const vEn = C.label('R.T.C COMPLEX ROAD · NIDADAVOLU 534301', { size: 22, fill: C.INK2, ls: 5, ax: 0 }); vEn.position.set(172, 104); venue.addChild(vEn);
    return (t) => {
      // a diagonal sweep of paper over the red, with a gold edge
      const w = E.expo(span(t, T.toDetails, T.toDetails + 0.5)), off = -700 + 3200 * w;
      wipe.clear().poly([0, H, off, H, off - 900, 0, 0, 0].map((v, i) => i % 2 ? v : Math.max(0, v))).fill(0xffffff);
      if (w >= 1) { wipe.clear().rect(0, 0, W, H).fill(0xffffff); }
      edge.clear(); if (w < 1) edge.moveTo(off, H).lineTo(off - 900, 0).stroke({ width: 6, color: C.GOLD_HI });
      const hk = E.out3(span(t, T.toDetails + 0.15, T.toDetails + 0.6)); head.alpha = hk; head.y = 316 - 20 * hk;
      C.typeOn(sub, 'CELEBRATIONS · DECEMBER 2026', span(t, T.toDetails + 0.3, T.toDetails + 0.8));
      rows.forEach(e => { const k = E.expo(span(t, e.at, e.at + 0.55)); e.c.alpha = clamp(k * 1.5); e.c.x = 260 * (1 - k); e.c.skew.x = -0.18 * (1 - k);
        if (e.hero) e.c.scale.set(1 + 0.08 * (1 - k)); C.typeOn(e.wh, e.when, span(t, e.at + 0.12, e.at + 0.55)); });
      const vk = E.out3(span(t, 36.5, 37.1)); venue.alpha = vk; venue.y = 1550 - 20 * vk;
      C.cam.shake = hit(t, T.ev4, 9) * 0.35;
      C.cam.x = 540; C.cam.y = 960; C.cam.s = 1 + 0.025 * hit(t, T.ev2, 7) + 0.025 * hit(t, T.ev3, 7) + 0.04 * hit(t, T.ev4, 6);
      C.cam.grain = 0.16;
    };
  }));

  /* ================================================================ 8 · శుభం (39.0 – 42) */
  SCENES.push(() => C.scene(T.toEnd, C.DURATION + 0.1, (root) => {
    const body = new PIXI.Container(); root.addChild(body);
    C.bg(body, C.radial([[0, '#c0281f'], [0.6, '#8a1912'], [1, '#420806']], 512));
    const rise = new PIXI.Graphics(); root.addChild(rise); body.mask = rise;
    const orn = new PIXI.Sprite(C.A.ornament); orn.anchor.set(0.5); orn.tint = C.GOLD_HI; const ok = 640 / orn.texture.width; orn.scale.set(ok); orn.position.set(540, 520); body.addChild(orn);
    const grad = new PIXI.FillGradient(0, 560, 0, 960); grad.addColorStop(0, 0xFCE7A6); grad.addColorStop(0.5, 0xE2B04A); grad.addColorStop(1, 0xA8741F);
    const glow = C.text('శుభం', { font: C.TE, size: 330, fill: 0xffa53a }); glow.position.set(540, 780); glow.blendMode = 'add'; glow.filters = [new PIXI.BlurFilter({ strength: 24, quality: 3 })]; body.addChild(glow);
    const word = C.text('శుభం', { font: C.TE, size: 330, fill: grad }); word.position.set(540, 780); body.addChild(word);
    const gleam = new PIXI.Sprite(C.linear(220, 8, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,250,230,.55)'], [1, 'rgba(255,255,255,0)']], false)); gleam.anchor.set(0.5); gleam.height = 520; gleam.rotation = 0.25; gleam.blendMode = 'add'; body.addChild(gleam);
    const gm = new PIXI.Graphics().rect(180, 560, 720, 440).fill(0xffffff); body.addChild(gm); gleam.mask = gm;
    const bless = C.text('మీ ఆశీస్సులతో… మా కొత్త ప్రయాణం', { font: C.TE2, size: 56, fill: C.CREAM }); bless.position.set(540, 1060); body.addChild(bless);
    const nA = C.text('నిఖిత', { font: C.TE, size: 84, fill: C.GOLD_HI, ax: 0 }), nB = C.text('సాయి కౌండిన్య', { font: C.TE, size: 84, fill: C.GOLD_HI, ax: 0 });
    const gap = 100, x0 = 540 - (nA.width + gap + nB.width) / 2; nA.x = x0; nB.x = x0 + nA.width + gap;
    const names = new PIXI.Container(); names.addChild(nA, nB); names.y = 1190; body.addChild(names);
    const heart = new PIXI.Graphics(); heart.position.set(x0 + nA.width + gap / 2, 1196); body.addChild(heart);
    const date = C.label('SUNDAY · 13 · 12 · 2026 · 8:22 PM', { size: 28, fill: C.CREAM, ls: 8 }); date.position.set(540, 1300); body.addChild(date);
    const fam = C.label('WITH LOVE — THE CHALLAPALLI FAMILY', { size: 22, fill: C.GOLD_HI, ls: 7 }); fam.position.set(540, 1356); body.addChild(fam);
    const left = C.diya(body, 210, 1690, 250), right = C.diya(body, 870, 1690, 250);
    const garland = toranam(body, 60, 13);
    return (t) => {
      const k = E.expo(span(t, T.toEnd, T.toEnd + 0.55));
      rise.clear().rect(0, H * (1 - k), W, H * k + 2).fill(0xffffff);
      garland.set(t, T.toEnd + 0.2);
      const wk = E.expo(span(t, T.toEnd + 0.15, T.toEnd + 0.6)); word.alpha = clamp(wk * 2); word.scale.set(1.2 - 0.2 * wk); glow.scale.copyFrom(word.scale);
      glow.alpha = 0.4 + 0.5 * hit(t, T.toEnd + 0.2, 1.8);
      gleam.x = lerp(80, 1000, E.inOut(span(t, 39.7, 40.6)));
      orn.alpha = E.out3(span(t, 39.3, 39.8));
      const bk = E.out3(span(t, 39.6, 40.1)); bless.alpha = bk; bless.y = 1080 - 20 * bk;
      const nk = E.out3(span(t, 39.85, 40.35)); names.alpha = nk; names.y = 1210 - 20 * nk;
      heart.clear(); if (nk > 0) { heart.scale.set(1.8 * E.back(span(t, 40.0, 40.4))); heart.poly([0, 6, -9, -3, -9, -8, -5, -12, 0, -9, 5, -12, 9, -8, 9, -3]).fill(C.GOLD_HI); }
      C.typeOn(date, 'SUNDAY · 13 · 12 · 2026 · 8:22 PM', span(t, 40.1, 40.6)); C.typeOn(fam, 'WITH LOVE — THE CHALLAPALLI FAMILY', span(t, 40.3, 40.9));
      const lit = E.out5(span(t, 39.4, 39.9)); left.set(t, lit); right.set(t + 3.7, lit);
      C.cam.x = 540; C.cam.y = 960; C.cam.s = 1 + 0.03 * E.inOut(span(t, T.toEnd, C.DURATION)) + 0.03 * hit(t, T.toEnd, 6);
      C.cam.floodColor = 0x000000; C.cam.flood = E.in3(span(t, 41.1, C.DURATION));
      C.cam.grain = 0.1;
    };
  }));
})();

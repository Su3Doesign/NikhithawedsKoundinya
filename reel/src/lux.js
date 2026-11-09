/* Pendli Pilupu · luxury materials: silk, brocade, gold foil, filigree, light, depth */
(function () {
  const { W, H, E, span, clamp, lerp, rng, noise1 } = C;

  /* ------------------------------------------------------------ woven grounds */
  function motif(x, cx, cy, s, color) {
    x.fillStyle = color; x.strokeStyle = color; x.lineWidth = s * 0.06;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.beginPath();
      x.ellipse(cx + Math.cos(a) * s * 0.32, cy + Math.sin(a) * s * 0.32, s * 0.2, s * 0.08, a, 0, 6.283); x.fill(); }
    x.beginPath(); x.arc(cx, cy, s * 0.1, 0, 6.283); x.fill();
    x.beginPath(); x.arc(cx, cy, s * 0.62, 0, 6.283); x.stroke();
  }
  // deep silk brocade: base light, a tone-on-tone lattice of lotus buttis, a fine weave
  C.brocadeTex = (c0, c1, c2, ink, seed = 3) => C.canvasTex(1080, 1920, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, h * 0.8); g.addColorStop(0, c0); g.addColorStop(0.55, c1); g.addColorStop(1, c2);
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const S = 120; x.globalAlpha = 1;
    for (let row = -1; row < h / S + 1; row++) for (let col = -1; col < w / S + 1; col++) {
      const cx = col * S + (row % 2 ? S / 2 : 0), cy = row * S * 0.9; motif(x, cx, cy, S * 0.42, ink);
      x.beginPath(); x.arc(cx + S / 2, cy + S * 0.45, S * 0.03, 0, 6.283); x.fill();
    }
    x.globalAlpha = 0.05; x.strokeStyle = '#000'; x.lineWidth = 1;
    for (let y = 0; y < h; y += 3) { x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }
    x.globalAlpha = 1; const v = x.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.42)');
    x.fillStyle = v; x.fillRect(0, 0, w, h);
  });
  // ivory silk paper with a whisper of damask
  C.silkTex = () => C._silk || (C._silk = C.canvasTex(1080, 1920, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, h * 0.8); g.addColorStop(0, '#fbf6ea'); g.addColorStop(0.6, '#f4ebd8'); g.addColorStop(1, '#eadbbd');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const S = 140; for (let row = -1; row < h / S + 1; row++) for (let col = -1; col < w / S + 1; col++) motif(x, col * S + (row % 2 ? S / 2 : 0), row * S * 0.9, S * 0.4, 'rgba(176,138,80,.07)');
    const r = rng(12); for (let i = 0; i < 1800; i++) { const px = r() * w, py = r() * h, l = 8 + r() * 30; x.strokeStyle = r() < 0.5 ? 'rgba(160,128,80,.05)' : 'rgba(255,255,255,.4)'; x.lineWidth = 0.7; x.beginPath(); x.moveTo(px, py); x.lineTo(px + l, py + (r() - 0.5) * 3); x.stroke(); }
  }));
  // a band of sheen that travels across silk
  C.sheen = (parent, strength = 0.14) => {
    const s = new PIXI.Sprite(C.linear(1400, 8, [[0, 'rgba(255,236,200,0)'], [0.42, `rgba(255,236,200,${strength * 0.5})`], [0.5, `rgba(255,244,220,${strength})`], [0.58, `rgba(255,236,200,${strength * 0.5})`], [1, 'rgba(255,236,200,0)']], false));
    s.anchor.set(0.5); s.height = 2600; s.rotation = 0.5; s.blendMode = 'add'; parent.addChild(s);
    return (t, t0, t1) => { s.position.set(lerp(-700, 1780, E.inOut(span(t, t0, t1))), 960); };
  };

  /* ------------------------------------------------------------ gold foil */
  const goldFill = (y0, y1) => { const g = new PIXI.FillGradient(0, y0, 0, y1);
    [[0, 0xFFF1C1], [0.28, 0xE9BE5C], [0.5, 0xB98328], [0.7, 0xF2CF78], [1, 0x9E6C1E]].forEach(([o, c]) => g.addColorStop(o, c)); return g; };
  // stamped gold-foil text: a soft cast shadow, a gradient foil face and a light that sweeps across it
  C.foil = function (parent, str, o) {
    const c = new PIXI.Container(); parent.addChild(c); const size = o.size || 80;
    const sh = C.text(str, Object.assign({}, o, { fill: o.shadow || 0x2a0805 })); sh.position.set(2, 4); sh.alpha = 0.55; sh.filters = [new PIXI.BlurFilter({ strength: Math.max(2, size / 28), quality: 3 })]; c.addChild(sh);
    const face = C.text(str, Object.assign({}, o, { fill: goldFill(-size * 0.55, size * 0.6) })); c.addChild(face);
    const tex = C.app.renderer.generateTexture({ target: face, resolution: 2 }); const m = new PIXI.Sprite(tex);
    const b = face.getLocalBounds(); m.position.set(b.x, b.y); m.width = b.width; m.height = b.height; c.addChild(m);
    const sweep = new PIXI.Sprite(C.linear(200, 8, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,252,236,.95)'], [1, 'rgba(255,255,255,0)']], false));
    sweep.anchor.set(0.5); sweep.height = b.height * 2.4; sweep.width = Math.max(120, size * 1.6); sweep.rotation = 0.35; sweep.blendMode = 'add'; sweep.mask = m; c.addChild(sweep);
    c.sweep = (t, t0, dur = 1.8) => { const k = span(t, t0, t0 + dur); sweep.visible = k > 0 && k < 1; sweep.position.set(lerp(b.x - 150, b.x + b.width + 150, E.inOut(k)), b.y + b.height / 2); };
    c.sweep(-1, 0); return c;
  };

  /* ------------------------------------------------------------ filigree */
  // a curl: a spiral that unwinds from (x, y) toward a direction
  function curl(x, y, a, r, turns, dir) { const pts = []; for (let i = 0; i <= 40; i++) { const k = i / 40, rr = r * (1 - k * 0.85), aa = a + dir * k * turns * 6.283; pts.push([x + Math.cos(aa) * rr - Math.cos(a) * r, y + Math.sin(aa) * rr - Math.sin(a) * r]); } return pts; }
  const len = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
  function drawPart(g, pts, k) { if (k <= 0) return; let rest = len(pts) * k; g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length && rest > 0; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]), f = Math.min(1, rest / d);
      g.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f); rest -= d; } }
  C.drawPart = drawPart;
  // a gold frame with double rules, corner flourishes and a crest; draws itself on with set(k)
  C.filigree = function (parent, x, y, w, h, o = {}) {
    const g = new PIXI.Graphics(), dots = new PIXI.Graphics(); parent.addChild(g, dots);
    const color = o.color || C.GOLD, hi = o.hi || C.GOLD_HI, paths = [];
    const rect = (ins) => [[x + ins, y + ins], [x + w - ins, y + ins], [x + w - ins, y + h - ins], [x + ins, y + h - ins], [x + ins, y + ins]];
    paths.push({ p: rect(0), w: 2.4, c: color }, { p: rect(12), w: 1.2, c: hi });
    [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([cx, cy, sx, sy]) => {
      const a = Math.atan2(sy, sx);
      paths.push({ p: curl(cx + sx * 34, cy + sy * 34, a + Math.PI, 30, 1.1, sx * sy), w: 2, c: hi });
      paths.push({ p: [[cx + sx * 12, cy + sy * 70], [cx + sx * 12, cy + sy * 150]], w: 1.5, c: color });
      paths.push({ p: [[cx + sx * 70, cy + sy * 12], [cx + sx * 150, cy + sy * 12]], w: 1.5, c: color });
      paths.push({ p: curl(cx + sx * 92, cy + sy * 30, -Math.PI / 2 * sy, 16, 0.9, -sx * sy), w: 1.6, c: hi });
      paths.push({ p: curl(cx + sx * 30, cy + sy * 92, Math.PI / 2 * (sx > 0 ? 2 : 0), 16, 0.9, sx * sy), w: 1.6, c: hi });
    });
    if (o.crest !== false) { const cx = x + w / 2; [-1, 1].forEach(s => { paths.push({ p: curl(cx + s * 46, y - 2, s > 0 ? 0 : Math.PI, 26, 1.0, s), w: 1.8, c: hi }); paths.push({ p: [[cx + s * 20, y], [cx + s * 110, y]], w: 3, c: color }); }); }
    paths.forEach(p => p.L = len(p.p));
    return { set(k) {
      g.clear(); paths.forEach((p, i) => { const kk = span(k, i / paths.length * 0.4, 0.6 + i / paths.length * 0.4); drawPart(g, p.p, E.inOut(kk)); g.stroke({ width: p.w, color: p.c, cap: 'round', join: 'round' }); });
      dots.clear(); const dk = span(k, 0.75, 1); if (dk > 0 && o.crest !== false) { dots.poly([x + w / 2, y - 16, x + w / 2 + 12, y, x + w / 2, y + 16, x + w / 2 - 12, y]).fill({ color: hi, alpha: dk }); }
    } };
  };

  /* ------------------------------------------------------------ light */
  C.raysTex = () => C._rays || (C._rays = C.canvasTex(1024, 1024, (x, w) => {
    const r = rng(8); x.translate(w / 2, w / 2);
    for (let i = 0; i < 46; i++) { const a = r() * 6.283, sp = 0.012 + r() * 0.04, L = w * (0.32 + r() * 0.18);
      const g = x.createLinearGradient(0, 0, Math.cos(a) * L, Math.sin(a) * L); g.addColorStop(0, `rgba(255,240,210,${0.05 + r() * 0.1})`); g.addColorStop(1, 'rgba(255,240,210,0)');
      x.fillStyle = g; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, L, a - sp, a + sp); x.closePath(); x.fill(); }
  }));
  C.rays = (parent, x, y, tint, scale = 2) => { const s = new PIXI.Sprite(C.raysTex()); s.anchor.set(0.5); s.position.set(x, y); s.tint = tint; s.blendMode = 'add'; s.scale.set(scale); parent.addChild(s);
    return (t, a) => { s.rotation = t * 0.02; s.alpha = a; }; };

  /* ------------------------------------------------------------ depth: flowers close to the lens */
  const blurred = (tex, px) => { const src = tex.source.resource, w = tex.width, h = tex.height, pad = px * 3;
    return C.canvasTex(w + pad * 2, h + pad * 2, (x) => { x.filter = `blur(${px}px)`; x.drawImage(src, pad, pad, w, h); }); };
  C.foreground = function (parent, items) {
    const c = new PIXI.Container(); parent.addChild(c); const cache = {};
    const sprites = items.map(([kind, x, y, s, rot, blur]) => { const key = kind + blur; cache[key] = cache[key] || blurred(C.A[kind], blur);
      const sp = new PIXI.Sprite(cache[key]); sp.anchor.set(0.5); sp.position.set(x, y); sp.scale.set(s); sp.rotation = rot; c.addChild(sp); return { sp, x, y }; });
    // the foreground moves more than the scene behind it, and drifts a little
    return (t, dx = 0, dy = 0, alpha = 1) => sprites.forEach((o, i) => { o.sp.position.set(o.x + dx + 6 * Math.sin(t * 0.4 + i), o.y + dy + 5 * Math.cos(t * 0.35 + i)); o.sp.alpha = alpha; });
  };
})();

/* ---------------------------------------------------------------- always-alive layers (busy, yet calm) */
(function () {
  const { W, H, E, span, clamp, lerp, rng } = C;
  // rich mandala line-art: petal rings, beads and circles
  C.mandalaArt = function (g, R, color, alpha = 1, rings = 4) {
    for (let k = 0; k < rings; k++) {
      const r0 = R * (0.25 + k * 0.2), n = 8 * (k + 1), h = R * 0.12;
      for (let i = 0; i < n; i++) { const a = i / n * 6.283, a1 = (i + 1) / n * 6.283, am = (i + 0.5) / n * 6.283;
        g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0).quadraticCurveTo(Math.cos(am) * (r0 + h), Math.sin(am) * (r0 + h), Math.cos(a1) * r0, Math.sin(a1) * r0);
        g.moveTo(Math.cos(am) * (r0 + h * 0.45), Math.sin(am) * (r0 + h * 0.45)).lineTo(Math.cos(am) * (r0 + h * 0.75), Math.sin(am) * (r0 + h * 0.75)); }
      g.stroke({ width: 1.6, color, alpha });
      g.circle(0, 0, r0 - 6).stroke({ width: 1, color, alpha: alpha * 0.7 });
      for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * 6.283; g.circle(Math.cos(a) * (r0 - 16), Math.sin(a) * (r0 - 16), 2).fill({ color, alpha: alpha * 0.8 }); }
    }
    g.circle(0, 0, R * 1.05).stroke({ width: 1.2, color, alpha: alpha * 0.6 });
  };
  // a large mandala that turns slowly behind everything
  C.watermark = function (parent, x, y, R, color, alpha) {
    const g = new PIXI.Graphics(); C.mandalaArt(g, R, color, 1, 5); g.position.set(x, y); g.alpha = alpha; parent.addChild(g);
    return (t, a = 1) => { g.rotation = t * 0.012; g.alpha = alpha * a; g.scale.set(1 + 0.01 * Math.sin(t * 0.25)); };
  };
  // filigree corners that draw in and then breathe
  C.corners = function (parent, color, inset = 46) {
    const items = [[inset, inset, 1, 1], [W - inset, inset, -1, 1], [inset, H - inset, 1, -1], [W - inset, H - inset, -1, -1]].map(([x, y, sx, sy]) => {
      const g = new PIXI.Graphics(); g.position.set(x, y); g.scale.set(sx, sy); parent.addChild(g);
      const pts = []; for (let i = 0; i <= 50; i++) { const k = i / 50, a = -Math.PI / 2 + k * 4.4, r = 46 * (1 - k * 0.8); pts.push([70 + Math.cos(a) * r, 70 + Math.sin(a) * r]); }
      return { g, paths: [[[0, 150], [0, 0], [150, 0]], [[14, 110], [14, 14], [110, 14]], pts] };
    });
    return (t, k) => items.forEach((it, i) => { it.g.clear(); it.paths.forEach((p, j) => { C.drawPart(it.g, p, E.inOut(span(k, j * 0.2, 0.6 + j * 0.2))); it.g.stroke({ width: j === 1 ? 1 : 2, color, alpha: 0.85 }); });
      const b = 1 + 0.015 * Math.sin(t * 0.6 + i); it.g.scale.set(Math.sign(it.g.scale.x) * b, Math.sign(it.g.scale.y) * b); });
  };
  // a soft-edged ink wipe that reveals a line of text from left to right
  const wipeTex = () => C._wipe || (C._wipe = C.linear(512, 8, [[0, 'rgba(255,255,255,1)'], [0.75, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']], false));
  C.inkWipe = function (parent, obj) {
    const m = new PIXI.Sprite(wipeTex()); parent.addChild(m); obj.mask = m; const b = obj.getBounds();
    m.height = b.height + 80; m.y = b.y - 40;
    return (t, t0, dur = 1.6) => { const k = E.inOut(span(t, t0, t0 + dur)), w = (b.width + 300) * k; m.width = Math.max(1, w); m.x = b.x - 150; obj.alpha = k > 0 ? 1 : 0; };
  };
  // watercolour washes that bloom and drift behind a picture
  C.washes = function (parent, specs) {
    const list = specs.map(([x, y, s, color, seed]) => { const tex = C.canvasTex(512, 512, (c, w) => { const r = rng(seed);
      for (let i = 0; i < 26; i++) { const a = r() * 6.283, d = r() * 90, rad = 60 + r() * 110, cx = w / 2 + Math.cos(a) * d, cy = w / 2 + Math.sin(a) * d;
        const g = c.createRadialGradient(cx, cy, 0, cx, cy, rad); g.addColorStop(0, color.replace('A', '.16')); g.addColorStop(0.7, color.replace('A', '.08')); g.addColorStop(1, color.replace('A', '0'));
        c.fillStyle = g; c.beginPath(); c.arc(cx, cy, rad, 0, 6.283); c.fill(); } });
      const sp = new PIXI.Sprite(tex); sp.anchor.set(0.5); sp.position.set(x, y); parent.addChild(sp); return { sp, s, seed }; });
    return (t, k) => list.forEach(o => { o.sp.scale.set(o.s * (0.6 + 0.4 * E.out3(k)) * (1 + 0.03 * Math.sin(t * 0.3 + o.seed))); o.sp.rotation = 0.05 * Math.sin(t * 0.2 + o.seed); o.sp.alpha = E.smooth(k); });
  };
  // sprigs of mango leaf and marigold that grow at a frame's corners
  C.sprigs = function (parent, pts) {
    const list = pts.map(([x, y, rot, kind, s, delay]) => { const sp = new PIXI.Sprite(C.A[kind]); sp.anchor.set(kind === 'leaf' ? 0.5 : 0.5, kind === 'leaf' ? 0.95 : 0.5); sp.position.set(x, y); sp.rotation = rot; parent.addChild(sp); return { sp, s, rot, delay }; });
    return (t, t0) => list.forEach((o, i) => { const k = E.back(span(t, t0 + o.delay, t0 + o.delay + 0.9)); o.sp.scale.set(o.s * k); o.sp.rotation = o.rot + 0.04 * Math.sin(t * 0.7 + i); o.sp.alpha = clamp(k * 2); });
  };
  // a slow glint of light that travels along a line
  C.glint = function (parent) { const s = new PIXI.Sprite(C.glowTex()); s.anchor.set(0.5); s.blendMode = 'add'; s.tint = 0xfff0c0; s.scale.set(0.5, 0.18); parent.addChild(s);
    return (t, x0, x1, y, t0, dur) => { const k = span(t, t0, t0 + dur); s.visible = k > 0 && k < 1; s.position.set(lerp(x0, x1, E.inOut(k)), y); s.alpha = Math.sin(Math.PI * k); }; };
})();

/* Pendli Pilupu reel · the craft kit shared by every scene */
(function () {
  const { W, H, E, span, clamp, lerp, rng, noise1 } = C;

  /* ------------------------------------------------------------ text that arrives gently */
  // fade in while rising a little; returns the eased amount so callers can chain
  C.rise = (obj, t, t0, dur = 1.1, dist = 22) => {
    if (obj._y === undefined) obj._y = obj.y;
    const k = E.out3(span(t, t0, t0 + dur)); obj.alpha = k; obj.y = obj._y + dist * (1 - k); return k;
  };
  C.fadeOut = (obj, t, t0, dur = 0.8) => { obj.alpha *= 1 - E.smooth(span(t, t0, t0 + dur)); };
  C.wipeMask = (root, x, y, w, h) => { const m = new PIXI.Graphics(); root.addChild(m); return { g: m, set(k, dir = 'up') {
    m.clear();
    if (dir === 'up') m.rect(x, y + h * (1 - k), w, h * k); else if (dir === 'right') m.rect(x, y, w * k, h); else m.rect(x + w * (1 - k) / 2, y, w * k, h);
    m.fill(0xffffff);
  } }; };
  // a soft light passing across text once
  C.gleam = (parent, x, y, w, h) => {
    const g = new PIXI.Sprite(C.linear(240, 8, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,248,225,.5)'], [1, 'rgba(255,255,255,0)']], false));
    g.anchor.set(0.5); g.height = h * 1.6; g.rotation = 0.28; g.blendMode = 'add'; parent.addChild(g);
    const m = new PIXI.Graphics().rect(x - w / 2, y - h / 2, w, h).fill(0xffffff); parent.addChild(m); g.mask = m;
    return (t, t0, dur = 1.6) => { const k = span(t, t0, t0 + dur); g.visible = k > 0 && k < 1; g.x = lerp(x - w / 2 - 200, x + w / 2 + 200, E.inOut(k)); g.y = y; };
  };
  C.heartPath = (g, color) => g.poly([0, 6, -9, -3, -9, -8, -5, -12, 0, -9, 5, -12, 9, -8, 9, -3]).fill(color);
  // two words with a small heart between, laid out by measured widths
  C.namePair = (parent, a, b, o) => {
    const nA = C.text(a, Object.assign({}, o, { ax: 0 })), nB = C.text(b, Object.assign({}, o, { ax: 0 }));
    const gap = o.gap || 90, x0 = 540 - (nA.width + gap + nB.width) / 2; nA.x = x0; nB.x = x0 + nA.width + gap;
    const c = new PIXI.Container(); c.addChild(nA, nB);
    const h = new PIXI.Graphics(); C.heartPath(h, o.heart || C.KUM); h.scale.set(o.hs || 1.5); h.position.set(x0 + nA.width + gap / 2, 6); c.addChild(h);
    parent.addChild(c); return c;
  };

  /* ------------------------------------------------------------ light and fire */
  C.flameTex = () => C._flame || (C._flame = C.canvasTex(200, 400, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(214,92,24,0)'); g.addColorStop(0.18, 'rgba(232,120,30,.9)'); g.addColorStop(0.5, 'rgba(255,200,90,1)'); g.addColorStop(0.8, 'rgba(255,240,200,1)'); g.addColorStop(1, 'rgba(255,255,255,1)');
    x.fillStyle = g; x.beginPath(); x.moveTo(w / 2, 0);
    x.bezierCurveTo(w * 0.62, h * 0.3, w * 0.98, h * 0.55, w * 0.92, h * 0.76); x.bezierCurveTo(w * 0.86, h * 0.96, w * 0.62, h, w / 2, h);
    x.bezierCurveTo(w * 0.38, h, w * 0.14, h * 0.96, w * 0.08, h * 0.76); x.bezierCurveTo(w * 0.02, h * 0.55, w * 0.38, h * 0.3, w / 2, 0); x.fill();
  }));
  // a brass diya; `width` is the lamp's width in pixels
  C.diya = function (parent, x, y, width) {
    const c = new PIXI.Container(); c.position.set(x, y); parent.addChild(c);
    const halo = new PIXI.Sprite(C.glowTex()); halo.anchor.set(0.5); halo.tint = 0xffa53a; halo.blendMode = 'add'; c.addChild(halo);
    const lamp = new PIXI.Sprite(C.A.lamp); lamp.anchor.set(0.5, 1); lamp.scale.set(width / lamp.texture.width); c.addChild(lamp);
    const base = { x: (112 - 110) / 220 * width, y: -(290 - 116) / 290 * lamp.height }, k = width / 220;
    const glow = new PIXI.Sprite(C.glowTex()); glow.anchor.set(0.5); glow.tint = 0xffc25a; glow.blendMode = 'add'; glow.position.set(base.x, base.y - 40 * k); c.addChild(glow);
    const flame = new PIXI.Sprite(C.flameTex()); flame.anchor.set(0.5, 0.94); flame.position.set(base.x, base.y); c.addChild(flame);
    const core = new PIXI.Sprite(C.flameTex()); core.anchor.set(0.5, 0.94); core.blendMode = 'add'; core.position.set(base.x, base.y); c.addChild(core);
    return { c, base, set(t, lit, flare = 0) {
      const fl = 1 + 0.04 * noise1(t * 5.5, 9) + flare * 0.4, sway = 0.04 * noise1(t * 2.2, 8), fs = k * 0.18 * lit;
      flame.scale.set(fs * (1 - 0.03 * noise1(t * 4, 7)), fs * 1.15 * fl); flame.rotation = sway; flame.alpha = clamp(lit * 2);
      core.scale.set(fs * 0.42, fs * 0.55 * fl); core.rotation = sway; core.alpha = lit * 0.9;
      glow.scale.set(k * 0.55 * lit * (1 + flare)); glow.alpha = 0.75 * lit;
      halo.position.set(base.x, base.y - 30 * k); halo.scale.set(k * 2.6 * lit * (1 + 0.5 * flare)); halo.alpha = 0.28 * lit;
    } };
  };
  C.dabTex = (color, seed) => C.canvasTex(220, 220, (x, w) => {
    const r = rng(seed); x.fillStyle = color;
    for (let i = 0; i < 26; i++) { const a = r() * 6.283, d = r() * 26; x.beginPath(); x.arc(w / 2 + Math.cos(a) * d, w / 2 + Math.sin(a) * d, 22 + r() * 22, 0, 6.283); x.fill(); }
    for (let i = 0; i < 160; i++) { const a = r() * 6.283, d = 50 + r() * 55; x.globalAlpha = 0.35 + r() * 0.5; x.beginPath(); x.arc(w / 2 + Math.cos(a) * d, w / 2 + Math.sin(a) * d, 0.8 + r() * 2.4, 0, 6.283); x.fill(); }
  });

  /* ------------------------------------------------------------ watercolour bloom for portraits */
  const blobTex = () => C._blob || (C._blob = C.canvasTex(256, 256, (x, w) => {
    const r = rng(33);
    for (let i = 0; i < 40; i++) { const a = r() * 6.283, d = r() * 30, rad = 60 + r() * 50, cx = w / 2 + Math.cos(a) * d, cy = w / 2 + Math.sin(a) * d;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(0.75, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, rad, 0, 6.283); x.fill(); }
  }));
  C.bloomPortrait = function (parent, tex, box, lobes, zoom = 1) {
    const c = new PIXI.Container(); parent.addChild(c);
    const s = new PIXI.Sprite(tex); s.anchor.set(0.5); s.scale.set(C.fit(s, box.w, box.h) * zoom); s.position.set(box.x, box.y); c.addChild(s);
    const mw = 360, mh = 480, rt = PIXI.RenderTexture.create({ width: mw, height: mh });
    const mc = new PIXI.Container(); const blobs = lobes.map(([lx, ly, k]) => { const b = new PIXI.Sprite(blobTex()); b.anchor.set(0.5); b.position.set(lx / 100 * mw, ly / 100 * mh); mc.addChild(b); return { b, k }; });
    const feather = new PIXI.Sprite(C.canvasTex(mw, mh, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'destination-out'; x.filter = 'blur(26px)'; x.fillStyle = '#000'; x.fillRect(w * 0.1, h * 0.08, w * 0.8, h * 0.84); }));
    feather.blendMode = 'erase'; mc.addChild(feather);
    const m = new PIXI.Sprite(rt); m.anchor.set(0.5); m.position.set(box.x, box.y); m.width = s.width; m.height = s.height; c.addChild(m); s.mask = m;
    return { c, s, set(k) { blobs.forEach(({ b, k: w }) => b.scale.set(Math.max(0.001, 7 * w * k))); C.app.renderer.render({ container: mc, target: rt, clear: true }); } };
  };

  /* ------------------------------------------------------------ the website's brush lettering, on paper */
  // Draws img/lettering/<name>.svg with its brush masks written to `k` (0..1), exactly as the site does.
  C.inkLettering = function (parent, name, x, y, width) {
    const doc = new DOMParser().parseFromString(C.SVG[name], 'image/svg+xml');
    const svg = doc.documentElement, vb = svg.getAttribute('viewBox').split(/[ ,]+/).map(Number);
    const scale = 8, cw = Math.round(vb[2] * scale), ch = Math.round(vb[3] * scale);
    svg.setAttribute('width', cw); svg.setAttribute('height', ch);
    const strokes = [...svg.querySelectorAll('.ink-stroke')].map(p => ({ p, a: +p.getAttribute('data-start'), b: +p.getAttribute('data-end') }));
    const finish = svg.querySelector('.ink-finish');
    const canvas = document.createElement('canvas'); canvas.width = cw; canvas.height = ch; const ctx = canvas.getContext('2d');
    const tex = PIXI.Texture.from(canvas); const sp = new PIXI.Sprite(tex); sp.anchor.set(0.5); sp.scale.set(width / cw); sp.position.set(x, y); parent.addChild(sp);
    let last = -1;
    return { sprite: sp, async set(k) {
      const ink = clamp(k) * 1.08, key = Math.round(ink * 2000);
      if (key === last) return; last = key;
      strokes.forEach(({ p, a, b }) => { const w = E.smooth(span(ink, a, b)); p.setAttribute('stroke-dasharray', '1'); p.setAttribute('stroke-dashoffset', (1 - w).toFixed(4)); p.setAttribute('visibility', w > 0 ? 'visible' : 'hidden'); });
      if (finish) finish.setAttribute('opacity', (E.smooth(span(ink, 0.91, 1.08)) * 0.65).toFixed(3));
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
      const img = new Image(); img.src = url; await img.decode(); URL.revokeObjectURL(url);
      ctx.clearRect(0, 0, cw, ch); ctx.drawImage(img, 0, 0, cw, ch); tex.source.update();
    } };
  };

  /* ------------------------------------------------------------ rice, petals, toranam */
  C.riceTex = () => C._rice || (C._rice = C.canvasTex(24, 56, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#c98a12'); g.addColorStop(0.45, '#ffd76a'); g.addColorStop(1, '#d99a1e');
    x.fillStyle = g; x.beginPath(); x.ellipse(w / 2, h / 2, w / 2 - 1, h / 2 - 1, 0, 0, 6.283); x.fill();
    x.fillStyle = 'rgba(255,255,240,.55)'; x.beginPath(); x.ellipse(w * 0.4, h * 0.38, 3, 10, 0, 0, 6.283); x.fill();
  }));
  C.petalTex = (c1, c2, seed) => C.canvasTex(60, 90, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g;
    x.beginPath(); x.moveTo(w / 2, h); x.bezierCurveTo(-4, h * 0.62, w * 0.12, h * 0.05, w / 2, 2); x.bezierCurveTo(w * 0.88, h * 0.05, w + 4, h * 0.62, w / 2, h); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(w / 2, h - 6); x.lineTo(w / 2, 12); x.stroke();
  });
  C.toranam = function (parent, y, seed) {
    const c = new PIXI.Container(); parent.addChild(c); const r = rng(seed), items = [];
    const str = new PIXI.Graphics(); c.addChild(str);
    for (let i = 0; i <= 15; i++) {
      const x = -20 + i * 1120 / 15, sag = 40 * Math.sin(Math.PI * i / 15);
      if (i % 2 === 0) { const l = new PIXI.Sprite(C.A.leaf); l.anchor.set(0.5, 0.04); l.scale.set(0.42 + r() * 0.06); l.position.set(x, sag); c.addChild(l); items.push({ s: l, ph: r() * 6, base: (r() - 0.5) * 0.12 }); }
      else { const m = new PIXI.Sprite(C.A.marigold); m.anchor.set(0.5); m.scale.set(0.42 + r() * 0.08); m.position.set(x, sag + 16); c.addChild(m); items.push({ s: m, ph: r() * 6, base: 0, flower: true }); }
    }
    str.moveTo(-40, 0); for (let i = 0; i <= 30; i++) str.lineTo(-20 + i * 1120 / 30, 40 * Math.sin(Math.PI * i / 30)); str.stroke({ width: 3, color: 0x6b4a22 });
    c.y = y;
    return { c, set(t, t0, dur = 1.6) { const k = E.out3(span(t, t0, t0 + dur)), dt = Math.max(0, t - t0);
      c.y = y - 320 * (1 - k); const swing = Math.exp(-dt * 1.4) * Math.sin(dt * 5);
      items.forEach(it => { it.s.rotation = it.flower ? swing * 0.15 + it.ph : it.base + swing * 0.25 + 0.03 * noise1(t * 0.6, it.ph); }); } };
  };

  /* ------------------------------------------------------------ the air: gold dust and falling petals */
  C.buildLayers = function () {
    const dust = new PIXI.Container(), petals = new PIXI.Container();
    C.app.stage.addChildAt(dust, C.app.stage.getChildIndex(C.overlay)); C.app.stage.addChildAt(petals, C.app.stage.getChildIndex(C.overlay));
    const r = rng(404), motes = [], fall = [];
    for (let i = 0; i < 110; i++) { const s = new PIXI.Sprite(C.dotTex()); s.anchor.set(0.5); s.blendMode = 'add'; dust.addChild(s); const z = r();
      motes.push({ s, x: r() * W, y: r() * H, z, sp: 12 + 40 * z, sz: 0.05 + 0.35 * z * z * z + 0.04, a: 0.18 + 0.5 * (1 - z) + 0.2 * r(), ph: r() * 6 }); }
    const tex = [C.petalTex('#ffb23a', '#f07a12', 1), C.petalTex('#ffd36a', '#f2a21e', 2), C.petalTex('#e8473a', '#a81e18', 3)];
    for (let i = 0; i < 46; i++) { const s = new PIXI.Sprite(tex[i % 3]); s.anchor.set(0.5); petals.addChild(s); fall.push({ s, x: r() * W, y0: r() * H, v: 60 + r() * 80, sw: 30 + r() * 60, ph: r() * 6, sp: (r() - 0.5) * 1.6, sz: 0.35 + r() * 0.35 }); }
    C.layers = (t) => {
      const d = C.cam.dust; dust.visible = d > 0.01;
      if (dust.visible) motes.forEach(m => { const y = ((m.y - t * m.sp) % (H + 200) + H + 200) % (H + 200) - 100;
        m.s.position.set(m.x + 26 * Math.sin(t * 0.3 + m.ph), y); m.s.scale.set(m.sz); m.s.tint = C.cam.dustTint; m.s.alpha = m.a * d; });
      const p = C.cam.petals; petals.visible = p > 0.01;
      if (petals.visible) fall.forEach(f => { const y = ((f.y0 + t * f.v) % (H + 240) + H + 240) % (H + 240) - 120;
        f.s.position.set(f.x + f.sw * Math.sin(t * 0.7 + f.ph), y); f.s.rotation = f.ph + Math.sin(t * 0.9 + f.ph) * 0.8 + t * f.sp * 0.3;
        f.s.scale.set(f.sz, f.sz * (0.6 + 0.4 * Math.abs(Math.cos(t * 1.1 + f.ph)))); f.s.alpha = p; });
    };
  };
})();

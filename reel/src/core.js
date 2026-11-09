/* Pelli Pilupu reel · core
   Every frame is a pure function of time: renderAt(t) builds the frame for t seconds.
   Nothing reads the wall clock, so frames can be rendered in any order, by any worker. */
(function () {
  const W = 1080, H = 1920, FPS = 30;
  const C = window.C = {
    W, H, FPS,
    // palette: kumkum, turmeric, true gold, ivory paper, night
    KUM: 0xB3261E, KUM_D: 0x7A1611, KUM_DEEP: 0x4A0B08, TUR: 0xE3A62A, GOLD: 0xD9A441, GOLD_HI: 0xF6D58A,
    GOLD_D: 0x9C6E24, IVORY: 0xF6EFE2, PAPER: 0xEFE4CE, INK: 0x231D18, INK2: 0x6A5D50, NIGHT: 0x0B0912,
    LEAF: 0x3E5B2E, CREAM: 0xF4ECDD,
    TE: 'Ramabhadra', TE2: 'Gurajada', EN: 'Jost',
  };

  /* ------------------------------------------------------------ math */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const span = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const E = {
    lin: k => k,
    smooth: k => k * k * (3 - 2 * k),
    inOut: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
    out3: k => 1 - Math.pow(1 - k, 3),
    out5: k => 1 - Math.pow(1 - k, 5),
    expo: k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k),
    in3: k => k * k * k,
    in5: k => k * k * k * k * k,
    expoIn: k => k <= 0 ? 0 : Math.pow(2, 10 * k - 10),
    back: k => { const c = 1.6; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
  };
  // a hit: instant rise, exponential decay
  const hit = (t, at, decay = 6) => t < at ? 0 : Math.exp(-(t - at) * decay);
  function rng(seed) {
    let s = seed >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ x >>> 15, x | 1); x ^= x + Math.imul(x ^ x >>> 7, x | 61); return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  }
  // smooth deterministic noise in one dimension
  function noise1(x, seed = 0) {
    const i = Math.floor(x), f = x - i, h = n => { const s = Math.sin((n + seed * 131.7) * 127.1) * 43758.5453; return s - Math.floor(s); };
    const u = f * f * (3 - 2 * f); return lerp(h(i), h(i + 1), u) * 2 - 1;
  }
  Object.assign(C, { clamp, span, lerp, E, hit, rng, noise1 });

  /* ------------------------------------------------------------ textures made in code */
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    return PIXI.Texture.from(c);
  }
  C.canvasTex = canvasTex;
  C.radial = (stops, size = 256) => canvasTex(size, size, (x, w) => {
    const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    stops.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, w, w);
  });
  C.linear = (w, h, stops, vertical = true) => canvasTex(w, h, (x) => {
    const g = vertical ? x.createLinearGradient(0, 0, 0, h) : x.createLinearGradient(0, 0, w, 0);
    stops.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, w, h);
  });

  /* ------------------------------------------------------------ text */
  C.text = (str, o = {}) => {
    const t = new PIXI.Text({
      text: str, resolution: o.res || 2,
      style: {
        fontFamily: o.font || C.EN, fontSize: o.size || 40, fill: o.fill ?? C.INK, fontWeight: o.weight || '400',
        letterSpacing: o.ls || 0, align: o.align || 'center', lineHeight: o.lh, padding: o.pad ?? 20,
        stroke: o.stroke, dropShadow: o.shadow, wordWrap: !!o.wrap, wordWrapWidth: o.wrap || 0, breakWords: false,
      },
    });
    t.anchor.set(o.ax ?? 0.5, o.ay ?? 0.5);
    return t;
  };
  // spaced capitals for labels, the reel's "mono" voice
  C.label = (str, o = {}) => C.text(str.toUpperCase(), Object.assign({ font: C.EN, size: 26, ls: 8, weight: '500' }, o));

  /* ------------------------------------------------------------ stage */
  C.scenes = [];
  // A scene is visible from t0 to t1 and dissolves in over `fade` seconds, on top
  // of the scene before it. It moves its own camera by writing s.cam.
  C.scene = (t0, t1, build, fade = 0, kind = null) => {
    const root = new PIXI.Container(); root.visible = false;
    const s = { t0, t1, fade, kind, root, update: null, prep: null, cam: null };
    s.update = build(root, s) || (() => {});
    C.scenes.push(s); C.world.addChild(root);
    return s;
  };

  C.init = async function () {
    const app = new PIXI.Application();
    await app.init({ width: W, height: H, background: 0x000000, antialias: true, preserveDrawingBuffer: true, autoStart: false, resolution: 1 });
    document.body.appendChild(app.canvas);
    C.app = app;
    // camera > world (scenes) ; overlay (flood, grain) sits above the camera
    C.camera = new PIXI.Container(); app.stage.addChild(C.camera);
    C.world = new PIXI.Container(); C.camera.addChild(C.world);
    C.trans = new PIXI.Graphics(); app.stage.addChild(C.trans);
    C.overlay = new PIXI.Container(); app.stage.addChild(C.overlay);
    C.flood = new PIXI.Graphics().rect(0, 0, W, H).fill(0xffffff); C.flood.alpha = 0; C.overlay.addChild(C.flood);
    // film grain: one noise tile, offset per frame
    const grainTex = canvasTex(512, 512, (x, w, h) => {
      const d = x.createImageData(w, h); const r = rng(7);
      for (let i = 0; i < d.data.length; i += 4) { const v = 110 + r() * 145; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      x.putImageData(d, 0, 0);
    });
    grainTex.source.style.addressMode = 'repeat';
    C.grain = new PIXI.TilingSprite({ texture: grainTex, width: W, height: H }); C.grain.blendMode = 'multiply'; C.grain.alpha = 0.16;
    C.overlay.addChild(C.grain);
    // post effects on the camera, switched on only when used
    C.fx = {
      shock: new PIXI.filters.ShockwaveFilter({ center: { x: W / 2, y: H / 2 }, amplitude: 30, wavelength: 220, speed: 1400, brightness: 1.15, radius: -1, time: 0 }),
      zoom: new PIXI.filters.ZoomBlurFilter({ strength: 0, center: { x: W / 2, y: H / 2 }, innerRadius: 80 }),
      rgb: new PIXI.filters.RGBSplitFilter({ red: { x: 0, y: 0 }, green: { x: 0, y: 0 }, blue: { x: 0, y: 0 } }),
    };
  };

  // per-frame camera state that scenes may write
  C.cam = { x: W / 2, y: H / 2, s: 1, r: 0, shake: 0, flood: 0, floodColor: 0xffffff, zoomBlur: 0, zoomCenter: [W / 2, H / 2], shock: null, rgb: 0, grain: 0.16 };

  C.renderAt = async function (t) {
    const cam = C.cam;
    Object.assign(cam, { x: W / 2, y: H / 2, s: 1, r: 0, shake: 0, flood: 0, floodColor: 0xffffff, zoomBlur: 0, zoomCenter: [W / 2, H / 2], shock: null, rgb: 0, grain: 0.16, floodAdd: false, dust: 0, dustTint: 0xffd58a, petals: 0 });
    if (C.trans) { C.trans.clear(); C.trans.visible = true; }
    for (const s of C.scenes) {
      const on = t >= s.t0 && t < s.t1;
      s.root.visible = on;
      if (!on) continue;
      if (s.prep) await s.prep(t);
      s.cam = { x: W / 2, y: H / 2, s: 1, r: 0 };
      s.update(t, t - s.t0);
      s.root.alpha = s.fade && !s.kind ? E.smooth(span(t, s.t0, s.t0 + s.fade)) : 1;
      // designed transitions: a mandala iris or a silk swipe with a gold edge
      if (s.kind && s.fade) {
        const k = E.inOut(span(t, s.t0, s.t0 + s.fade)), m = s.maskG || (s.maskG = new PIXI.Graphics());
        if (!m.parent) C.app.stage.addChild(m);
        m.clear();
        if (k >= 1) { s.root.mask = null; m.visible = false; }
        else {
          m.visible = true; s.root.mask = m;
          if (s.kind === 'iris') { const R = 1180 * k; m.circle(W / 2, H * 0.47, Math.max(1, R)).fill(0xffffff);
            C.trans.circle(W / 2, H * 0.47, R).stroke({ width: 5, color: 0xE9BE5C, alpha: 0.95 }).circle(W / 2, H * 0.47, R + 14).stroke({ width: 1.5, color: 0xF6D58A, alpha: 0.8 });
            for (let i = 0; i < 36; i++) { const a = i / 36 * 6.283 + k; C.trans.circle(W / 2 + Math.cos(a) * (R + 30), H * 0.47 + Math.sin(a) * (R + 30), 3).fill({ color: 0xF6D58A, alpha: 0.85 }); } }
          else { const off = -900 + (W + 2000) * k; m.poly([0, H, off, H, off + 700, 0, 0, 0].map((v, i) => i % 2 ? v : Math.max(0, Math.min(W, v)))).fill(0xffffff);
            C.trans.moveTo(off, H).lineTo(off + 700, 0).stroke({ width: 5, color: 0xE9BE5C, alpha: 0.95 }).moveTo(off - 18, H).lineTo(off + 682, 0).stroke({ width: 1.5, color: 0xF6D58A, alpha: 0.8 }); }
        }
      }
      s.root.pivot.set(s.cam.x, s.cam.y); s.root.position.set(W / 2, H / 2); s.root.scale.set(s.cam.s); s.root.rotation = s.cam.r;
    }
    if (C.layers) C.layers(t);
    // camera: scale and rotate about (cam.x, cam.y), plus seeded shake
    const sx = cam.shake * noise1(t * 38, 1) * 26, sy = cam.shake * noise1(t * 41, 2) * 26;
    C.camera.pivot.set(cam.x, cam.y);
    C.camera.position.set(W / 2 + sx, H / 2 + sy);
    C.camera.scale.set(cam.s);
    C.camera.rotation = cam.r + cam.shake * noise1(t * 30, 3) * 0.006;
    C.flood.tint = cam.floodColor; C.flood.alpha = clamp(cam.flood); C.flood.blendMode = cam.floodAdd ? 'add' : 'normal';
    C.flood.visible = C.flood.alpha > 0.001;
    C.grain.tilePosition.set(Math.floor(noise1(t * 97, 4) * 4000), Math.floor(noise1(t * 89, 5) * 4000));
    C.grain.alpha = cam.grain;
    // filters: a fresh array each frame (Pixi freezes assigned arrays)
    const f = [];
    if (cam.zoomBlur > 0.002) { C.fx.zoom.strength = cam.zoomBlur; C.fx.zoom.center = { x: cam.zoomCenter[0], y: cam.zoomCenter[1] }; f.push(C.fx.zoom); }
    if (cam.shock) { Object.assign(C.fx.shock, cam.shock.opts || {}); C.fx.shock.center = { x: cam.shock.x, y: cam.shock.y }; C.fx.shock.time = cam.shock.time; f.push(C.fx.shock); }
    if (cam.rgb > 0.05) { const r = cam.rgb; C.fx.rgb.red = { x: -r, y: 0 }; C.fx.rgb.green = { x: 0, y: 0 }; C.fx.rgb.blue = { x: r, y: 0 }; f.push(C.fx.rgb); }
    C.camera.filters = f.length ? f : null;
    // Pixi v8 drops a container's filters if it holds an empty visible Graphics: hide those
    hideEmpty(C.app.stage);
    C.app.render();
  };
  function hideEmpty(node) {
    if (!node.visible) return;
    if (node instanceof PIXI.Graphics && node.context && node.context.instructions && node.context.instructions.length === 0) { node.visible = false; return; }
    if (node.children) for (const c of node.children) hideEmpty(c);
  }

  /* ------------------------------------------------------------ helpers used by many scenes */
  // a soft dot shared by particles and glows
  C.dotTex = () => C._dot || (C._dot = C.radial([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,.85)'], [0.6, 'rgba(255,255,255,.18)'], [1, 'rgba(255,255,255,0)']], 128));
  C.glowTex = () => C._glow || (C._glow = C.radial([[0, 'rgba(255,255,255,.9)'], [0.2, 'rgba(255,255,255,.35)'], [0.5, 'rgba(255,255,255,.08)'], [1, 'rgba(255,255,255,0)']], 256));
  // paper with fibres, for the ivory scenes
  C.paperTex = () => C._paper || (C._paper = canvasTex(1080, 1920, (x, w, h) => {
    x.fillStyle = '#f6efe2'; x.fillRect(0, 0, w, h);
    const r = rng(11);
    for (let i = 0; i < 2600; i++) {
      const px = r() * w, py = r() * h, l = 6 + r() * 26, a = r() * Math.PI;
      x.strokeStyle = r() < .5 ? 'rgba(160,128,80,.07)' : 'rgba(255,255,255,.35)'; x.lineWidth = .6 + r() * .8;
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
    }
    const g = x.createRadialGradient(w / 2, h * .42, 0, w / 2, h * .42, h * .75);
    g.addColorStop(0, 'rgba(255,252,244,.5)'); g.addColorStop(1, 'rgba(226,210,180,.0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }));
  // a full-frame background sprite
  C.bg = (root, tex) => { const s = new PIXI.Sprite(tex); s.width = W; s.height = H; root.addChild(s); return s; };
  // fit a sprite into a box, keeping its shape
  C.fit = (sprite, w, h) => { const k = Math.min(w / sprite.texture.width, h / sprite.texture.height); sprite.scale.set(k); return k; };
  // crop marks around a box (Lilium-style spec framing)
  C.cropMarks = (g, x, y, w, h, len, color, width = 2, alpha = 1) => {
    const L = len;
    [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([cx, cy, dx, dy]) => {
      g.moveTo(cx, cy + dy * L).lineTo(cx, cy).lineTo(cx + dx * L, cy);
    });
    g.stroke({ width, color, alpha, cap: 'square' });
  };
})();

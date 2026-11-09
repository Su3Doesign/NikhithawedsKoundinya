/* Pendli Pilupu · cinematic tools: light-burn transitions, photo-filled type,
   silhouette-to-colour reveals, natural petals, lens bokeh, echoing type */
(function () {
  const { W, H, E, span, clamp, lerp, rng } = C;

  /* ------------------------------------------------------------ the light-burn transition */
  // The incoming scene appears where it is brightest first, through drifting noise,
  // with a warm burning edge: a luma-keyed dissolve, as in a film lab.
  const FRAG = `
    precision highp float;
    in vec2 vTextureCoord;
    out vec4 finalColor;
    uniform sampler2D uTexture;
    uniform highp vec4 uInputSize;
    uniform float uK;
    uniform float uSeed;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed) * 43758.5453); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(h(i), h(i + vec2(1.0, 0.0)), u.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), u.x), u.y); }
    float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * n(p); p *= 2.03; a *= 0.5; } return v; }
    void main(){
      vec4 c = texture(uTexture, vTextureCoord);
      vec2 px = vTextureCoord * uInputSize.xy / 260.0;
      // a soft diagonal wash of light, from the lower left, with only a hint of texture
      float diag = 0.62 * vTextureCoord.x + 0.38 * (1.0 - vTextureCoord.y);
      float key = 0.85 * diag + 0.15 * fbm(px * 0.6 + vec2(0.0, uK));
      float th = 1.12 - uK * 1.45;
      float a = smoothstep(th - 0.22, th + 0.22, key);
      float rim = exp(-pow((key - th) / 0.09, 2.0));
      vec3 glow = vec3(1.0, 0.82, 0.55) * rim * 0.55 * sin(3.14159 * uK);
      finalColor = vec4(c.rgb * a + glow * c.a, c.a * a + rim * 0.5 * (1.0 - uK));
    }`;
  C.lightBurn = (seed) => new PIXI.Filter({
    glProgram: PIXI.GlProgram.from({ vertex: PIXI.defaultFilterVert, fragment: FRAG, name: 'light-burn' }),
    resources: { burn: { uK: { value: 0, type: 'f32' }, uSeed: { value: seed || 1, type: 'f32' } } },
  });

  /* ------------------------------------------------------------ photo-filled type */
  // A word whose letters are windows onto a photograph that drifts slowly inside them.
  C.photoText = function (parent, str, o, tex) {
    const c = new PIXI.Container(); parent.addChild(c);
    const t = C.text(str, Object.assign({ fill: 0xffffff }, o));
    const mtex = C.app.renderer.generateTexture({ target: t, resolution: 2 }); const b = t.getLocalBounds();
    const mask = new PIXI.Sprite(mtex); mask.position.set(b.x, b.y); mask.width = b.width; mask.height = b.height;
    const ph = new PIXI.Sprite(tex); ph.anchor.set(0.5); const k = Math.max(b.width / tex.width, b.height / tex.height) * 1.35; ph.scale.set(k);
    const shade = C.text(str, Object.assign({}, o, { fill: 0x1a0503 })); shade.alpha = 0.35; shade.position.set(3, 6); shade.filters = [new PIXI.BlurFilter({ strength: 6, quality: 3 })];
    const rimT = C.text(str, Object.assign({}, o, { fill: { color: 0x000000, alpha: 0 }, stroke: { color: C.GOLD_TEXT, width: 3 } })); rimT.alpha = 0.9;
    c.addChild(shade, ph, mask, rimT); ph.mask = mask;
    c.drift = (u) => { ph.position.set(b.x + b.width / 2 + lerp(-0.12, 0.12, u) * b.width, b.y + b.height / 2 + lerp(0.08, -0.06, u) * b.height); };
    c.drift(0); return c;
  };

  /* ------------------------------------------------------------ a portrait that arrives in warm light */
  // The person is always fully visible, in colour. As they arrive they lift into place
  // and a soft band of warm light passes once across them.
  C.lightReveal = function (parent, tex, x, y, h) {
    const c = new PIXI.Container(); parent.addChild(c);
    const k = h / tex.height;
    const col = new PIXI.Sprite(tex); col.anchor.set(0.5); col.scale.set(k); col.position.set(x, y); c.addChild(col);
    const lit = new PIXI.Sprite(tex); lit.anchor.set(0.5); lit.scale.set(k); lit.position.set(x, y); lit.blendMode = 'add'; lit.tint = 0x6a4a20; c.addChild(lit);
    const band = new PIXI.Sprite(C.linear(512, 8, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']], false));
    band.anchor.set(0.5); band.rotation = -0.5; c.addChild(band); lit.mask = band;
    const diag = Math.hypot(tex.width * k, h); band.width = 420; band.height = diag * 1.6;
    return { c, set(appear, reveal) {
      const a = E.out3(appear); c.alpha = a; col.y = lit.y = y + 24 * (1 - a);
      const along = lerp(-diag * 0.7, diag * 0.7, E.inOut(reveal)), ca = Math.cos(-0.5), sa = Math.sin(-0.5);
      band.position.set(x + along * ca, y + along * sa);
      lit.visible = reveal > 0 && reveal < 1; lit.alpha = Math.sin(Math.PI * clamp(reveal));
    } };
  };

  /* ------------------------------------------------------------ natural petals and lens bokeh */
  // Petals cut from the marigold photograph itself, so their texture and colour are real.
  C.photoPetals = () => C._pp || (C._pp = [0, 1, 2, 3, 4, 5].map(i => C.canvasTex(70, 100, (x, w, h) => {
    const r = rng(300 + i), src = C.A.marigold.source.resource;
    x.beginPath(); x.moveTo(w / 2, h - 2); x.bezierCurveTo(-2, h * 0.6, w * 0.15, h * 0.06, w / 2 + (r() - 0.5) * 8, 3);
    x.bezierCurveTo(w * 0.85, h * 0.06, w + 2, h * 0.6, w / 2, h - 2); x.closePath(); x.clip();
    const s = 2.2 + r() * 0.8; x.drawImage(src, -40 - r() * 60, -40 - r() * 60, 200 * s, 200 * s);
    const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(0,0,0,.18)'); g.addColorStop(0.5, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(0,0,0,.18)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  })));
  C.bokehTex = () => C._bokeh || (C._bokeh = C.canvasTex(128, 128, (x, w) => {
    const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(0.72, 'rgba(255,255,255,.42)'); g.addColorStop(0.86, 'rgba(255,255,255,.75)'); g.addColorStop(0.94, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + 0.26; x[i ? 'lineTo' : 'moveTo'](w / 2 + Math.cos(a) * w / 2, w / 2 + Math.sin(a) * w / 2); } x.closePath(); x.fill();
  }));

  /* ------------------------------------------------------------ echoing outline type */
  // Hollow copies of a word that drift outward and fade, one after another, behind it.
  C.echo = function (parent, str, o, n = 3, period = 3.2) {
    const c = new PIXI.Container(); parent.addChild(c);
    const copies = Array.from({ length: n }, () => { const t = C.text(str, Object.assign({}, o, { fill: { color: 0, alpha: 0 }, stroke: { color: o.color || C.GOLD_TEXT, width: 2 } })); c.addChild(t); return t; });
    return (t, on) => copies.forEach((cp, i) => { const ph = ((t / period + i / n) % 1 + 1) % 1; cp.scale.set(1 + 0.35 * ph); cp.alpha = on * 0.45 * Math.sin(Math.PI * ph) * (1 - ph * 0.3); });
  };
})();

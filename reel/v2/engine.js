/* Pendli Pilupu v2 · a real 3D film engine (three.js)
   One world, one continuous camera. Every frame is a pure function of time. */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export { THREE };
export const W = 1080, H = 1920, FPS = 30;

/* ------------------------------------------------------------ math */
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const span = (t, a, b) => clamp((t - a) / (b - a));
export const lerp = (a, b, k) => a + (b - a) * k;
export const E = {
  lin: k => k, smooth: k => k * k * (3 - 2 * k), smoother: k => k * k * k * (k * (k * 6 - 15) + 10),
  inOut: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  out3: k => 1 - Math.pow(1 - k, 3), out5: k => 1 - Math.pow(1 - k, 5), expo: k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k),
  in3: k => k * k * k, back: k => { const c = 1.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
};
export function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ x >>> 15, x | 1); x ^= x + Math.imul(x ^ x >>> 7, x | 61); return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
export function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i, h = n => { const s = Math.sin((n + seed * 131.7) * 127.1) * 43758.5453; return s - Math.floor(s); }; return lerp(h(i), h(i + 1), f * f * (3 - 2 * f)) * 2 - 1; }

/* ------------------------------------------------------------ renderer and post */
export const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1;
export const scene = new THREE.Scene(); scene.background = new THREE.Color(0x070204);
export const camera = new THREE.PerspectiveCamera(36, W / H, 0.05, 900);
const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
export const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, camera));
export const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.16, 0.6, 0.97); composer.addPass(bloom);
composer.addPass(new OutputPass());
// the lens: a soft vignette, fine grain, and a fade to black
export const lens = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uFade: { value: 0 }, uVig: { value: 0.32 }, uGrain: { value: 0.035 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uFade, uVig, uGrain; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime * 37.0) * 43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 q = vUv - 0.5; q.x *= 0.5625;
      c.rgb *= 1.0 - uVig * smoothstep(0.25, 0.75, length(q) * 1.35);
      c.rgb += (h(gl_FragCoord.xy) - 0.5) * uGrain; c.rgb *= 1.0 - uFade; gl_FragColor = vec4(c.rgb, 1.0); }`,
});
composer.addPass(lens);

/* ------------------------------------------------------------ light: a warm studio to reflect in gold */
export function buildEnvironment() {
  const env = new THREE.Scene(); env.background = new THREE.Color(0x0a0303);
  const panel = (w, h, color, intensity, pos, look = [0, 0, 0]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(...look); env.add(m); };
  panel(9, 5, 0xfff1dc, 16, [0, 12, 3]);            // overhead softbox
  panel(3, 14, 0xffd9a0, 9, [-11, 2, 4]);           // warm strip, left
  panel(2.2, 12, 0xffe8c8, 6, [11, 3, -2]);         // strip, right
  panel(7, 3, 0xffb060, 4, [0, -7, 9]);             // warm floor bounce
  panel(4, 4, 0xfff6e8, 10, [5, 6, 12]);            // a key, front right
  panel(16, 10, 0x4a0d08, 1.2, [0, 0, -14]);        // deep red wall behind
  // in front of the type: dark, crossed by bright strips, so flat gold faces show a
  // gradient of reflections that slides as letters tilt
  panel(14, 1.1, 0xfff0d8, 9, [0, 4.5, 15]);
  panel(14, 0.6, 0xffd9a0, 5, [0, -2.5, 15]);
  panel(3, 3, 0xffffff, 6, [-5, 6, 12]);
  panel(18, 12, 0x2a0805, 1.0, [0, 0, 18]);
  const pm = new THREE.PMREMGenerator(renderer); const tex = pm.fromScene(env, 0.035).texture; pm.dispose();
  scene.environment = tex; return tex;
}
export const GOLD = 0xf3b44e;
export const goldMat = (o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: GOLD, metalness: 1, roughness: 0.2, envMapIntensity: 1.35 }, o));

/* ------------------------------------------------------------ canvas helpers */
export function canvasTex(w, h, draw, o = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = o.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  if (o.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } return t;
}
export const loadImage = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('image ' + src)); i.src = src; });

/* ------------------------------------------------------------ flat text labels (crisp canvas type on a plane) */
// size = world height of one line of text; Telugu is never letter-spaced
export function label(text, o = {}) {
  const px = o.px || 96, lh = o.lh || 1.3, font = `${o.weight || 400} ${px}px ${o.font || 'Jost'}`, lines = String(text).split('\n');
  const m = document.createElement('canvas').getContext('2d'); m.font = font; if (o.ls) m.letterSpacing = o.ls * px + 'px';
  const wpx = Math.ceil(Math.max(...lines.map(l => m.measureText(l).width)) + px * 0.6), hpx = Math.ceil(lines.length * px * lh + px * 0.5);
  const tex = canvasTex(wpx, hpx, (x) => { x.font = font; if (o.ls) x.letterSpacing = o.ls * px + 'px'; x.fillStyle = o.color || '#fbefd8'; x.textAlign = 'center'; x.textBaseline = 'middle';
    lines.forEach((l, i) => x.fillText(l, wpx / 2 + (o.ls ? o.ls * px / 2 : 0), px * 0.25 + px * lh * (i + 0.5))); });
  const k = (o.size || 0.2) / px, mesh = new THREE.Mesh(new THREE.PlaneGeometry(wpx * k, hpx * k), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 1 }));
  mesh.renderOrder = o.order ?? 20; mesh.userData = { w: wpx * k, h: hpx * k, y0: null }; return mesh;
}
// fade in while rising a little
export function rise(obj, t, t0, dur = 1.0, dist = 0.12) {
  if (obj.userData.y0 == null) obj.userData.y0 = obj.position.y;
  const k = E.out3(span(t, t0, t0 + dur)); if (obj.material) obj.material.opacity = k; obj.visible = k > 0.001; obj.position.y = obj.userData.y0 - dist * (1 - k); return k;
}

/* ------------------------------------------------------------ 3D type from shaped outlines */
let OUT = null; export const setOutlines = (o) => { OUT = o; };
function shapesOf(d) {
  // split into contours, then classify by winding: contours wound like the largest one are
  // solid; the rest are holes, each given to the smallest solid that contains it
  const contours = []; let cur = null;
  for (const c of d) {
    if (c[0] === 'M') { cur = new THREE.Path(); cur.moveTo(c[1], c[2]); contours.push(cur); }
    else if (c[0] === 'L') cur.lineTo(c[1], c[2]); else if (c[0] === 'Q') cur.quadraticCurveTo(c[1], c[2], c[3], c[4]);
    else if (c[0] === 'C') cur.bezierCurveTo(c[1], c[2], c[3], c[4], c[5], c[6]);
  }
  const info = contours.map(p => { const pts = p.getPoints(10); return { p, pts, area: THREE.ShapeUtils.area(pts) }; }).filter(o => Math.abs(o.area) > 1e-7);
  if (!info.length) return [];
  const sign = Math.sign(info.reduce((m, o) => Math.abs(o.area) > Math.abs(m.area) ? o : m).area);
  const inside = (pt, poly) => { let r = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < (b.x - a.x) * (pt.y - a.y) / (b.y - a.y) + a.x) r = !r; } return r; };
  const solids = info.filter(o => Math.sign(o.area) === sign).map(o => { const sh = new THREE.Shape(); sh.curves = o.p.curves; sh.currentPoint = o.p.currentPoint; o.shape = sh; return o; });
  info.filter(o => Math.sign(o.area) !== sign).forEach(h => {
    const owners = solids.filter(s2 => inside(h.pts[0], s2.pts)).sort((x, y) => Math.abs(x.area) - Math.abs(y.area));
    if (owners.length) owners[0].shape.holes.push(h.p);
  });
  return solids.map(o => o.shape);
}
// returns { group, letters[], w, h } with the group centred on the string; size = world units per em
export function text3d(key, o = {}) {
  const src = OUT[key], size = o.size || 1, depth = (o.depth ?? 0.12) * size, bev = (o.bevel ?? 0.014) * size, mat = o.material || goldMat();
  const group = new THREE.Group(), letters = [], cx = (src.x0 + src.x1) / 2, cy = (src.y0 + src.y1) / 2;
  for (const cl of src.clusters) {
    const g = new THREE.ExtrudeGeometry(shapesOf(cl.d), { depth: depth / size, bevelEnabled: true, bevelThickness: bev / size, bevelSize: bev / size, bevelOffset: -bev / size * 0.6, bevelSegments: 3, curveSegments: o.curve || 7 });
    const px = (cl.x0 + cl.x1) / 2, py = src.y0;            // pivot: bottom centre of the syllable
    g.translate(-px, -py, -depth / size / 2); g.scale(size, size, size);
    const m = new THREE.Mesh(g, mat); m.position.set((px - cx) * size, (py - cy) * size, 0); m.userData.home = m.position.clone(); group.add(m); letters.push(m);
  }
  return { group, letters, w: (src.x1 - src.x0) * size, h: (src.y1 - src.y0) * size };
}
// each syllable tips up into place, one after another
export function riseLetters(tx, t, t0, o = {}) {
  const st = o.stagger ?? 0.07, dur = o.dur ?? 0.9;
  tx.letters.forEach((m, i) => { const k = E.out5(span(t, t0 + i * st, t0 + i * st + dur)); m.visible = k > 0.001; m.scale.setScalar(Math.max(0.001, 0.55 + 0.45 * k) * (k > 0 ? 1 : 0.001));
    m.rotation.x = -1.35 * (1 - k); m.position.y = m.userData.home.y - 0.35 * (o.drop ?? 0.4) * (1 - k); m.position.z = m.userData.home.z - 0.3 * (1 - k); });
}

/* ------------------------------------------------------------ sprites with real lens blur */
// Instanced camera-facing quads. Each one grows and softens with its distance from the
// focus plane, like a point seen through a fast lens.
export const focus = { dist: 10, aperture: 0.05 };
const SPRITE_VERT = `
  attribute vec3 iPos; attribute vec4 iData; attribute vec4 iTint;
  uniform float uFocus, uAperture, uAspect, uEnergy; uniform vec2 uGrid;
  varying vec2 vUv; varying vec2 vLocal; varying vec4 vTint; varying float vBlur;
  void main(){
    vec4 mv = viewMatrix * modelMatrix * vec4(iPos, 1.0);
    float depth = max(-mv.z, 0.02), size = iData.x;
    float blurW = uAperture * abs(depth - uFocus) / uFocus * (0.6 + 0.4 * depth / uFocus);
    float grown = size + 2.0 * blurW, ratio = size / grown;
    vBlur = clamp(blurW / size, 0.0, 6.0);
    vec2 c = position.xy; c.y *= uAspect; c.x *= iData.z;
    float cr = cos(iData.y), sr = sin(iData.y); c = vec2(c.x * cr - c.y * sr, c.x * sr + c.y * cr);
    mv.xy += c * grown; gl_Position = projectionMatrix * mv;
    float fr = floor(iData.w + 0.5); vec2 cell = vec2(mod(fr, uGrid.x), floor(fr / uGrid.x));
    vUv = (cell + uv) / uGrid; vLocal = uv * 2.0 - 1.0;
    vTint = iTint; vTint.a *= pow(ratio, uEnergy);
  }`;
const SPRITE_FRAG = `
  uniform sampler2D uMap; varying vec2 vUv; varying vec2 vLocal; varying vec4 vTint; varying float vBlur;
  void main(){
    vec4 c = texture2D(uMap, vUv, min(vBlur * 2.2, 4.5));
    float disc = smoothstep(1.0, 0.55, length(vLocal));
    c *= mix(1.0, disc, clamp(vBlur * 0.8, 0.0, 1.0));
    gl_FragColor = vec4(c.rgb * vTint.rgb, c.a) * vTint.a;
    if (gl_FragColor.a < 0.002 && dot(gl_FragColor.rgb, vec3(1.0)) < 0.002) discard;
  }`;
export class Sprites {
  constructor(n, tex, o = {}) {
    this.n = n; this.sort = !o.additive; this.items = Array.from({ length: n }, () => ({ x: 0, y: 0, z: 0, s: 0, rot: 0, flip: 1, frame: 0, r: 1, g: 1, b: 1, a: 0, _d: 0 }));
    const g = new THREE.InstancedBufferGeometry(); g.index = new THREE.PlaneGeometry(1, 1).index; const p = new THREE.PlaneGeometry(1, 1);
    g.setAttribute('position', p.getAttribute('position')); g.setAttribute('uv', p.getAttribute('uv'));
    this.aPos = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3); this.aData = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4); this.aTint = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4);
    g.setAttribute('iPos', this.aPos); g.setAttribute('iData', this.aData); g.setAttribute('iTint', this.aTint); g.instanceCount = n;
    this.mat = new THREE.ShaderMaterial({ vertexShader: SPRITE_VERT, fragmentShader: SPRITE_FRAG, transparent: true, depthWrite: false, depthTest: o.depthTest ?? true,
      premultipliedAlpha: true, blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: { uMap: { value: tex }, uFocus: { value: 10 }, uAperture: { value: 0.05 }, uAspect: { value: o.aspect || 1 }, uEnergy: { value: o.energy ?? (o.additive ? 1.4 : 1.7) }, uGrid: { value: new THREE.Vector2(o.cols || 1, o.rows || 1) } } });
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.frustumCulled = false; this.mesh.renderOrder = o.order ?? 10; this.blurScale = o.blur ?? 1;
  }
  // call after writing this.items; world = the Object3D the items are expressed in (or null for world space)
  update() {
    const it = this.items, m = this.mesh.matrixWorld, v = camera.matrixWorldInverse, e = new THREE.Matrix4().multiplyMatrices(v, m).elements;
    if (this.sort) { for (const p of it) p._d = e[2] * p.x + e[6] * p.y + e[10] * p.z + e[14]; it.sort((a, b) => a._d - b._d); }
    const P = this.aPos.array, D = this.aData.array, T = this.aTint.array;
    for (let i = 0; i < this.n; i++) { const p = it[i]; P[i * 3] = p.x; P[i * 3 + 1] = p.y; P[i * 3 + 2] = p.z; D[i * 4] = Math.max(p.s, 1e-5); D[i * 4 + 1] = p.rot; D[i * 4 + 2] = p.flip; D[i * 4 + 3] = p.frame;
      T[i * 4] = p.r; T[i * 4 + 1] = p.g; T[i * 4 + 2] = p.b; T[i * 4 + 3] = p.s > 0 ? p.a : 0; }
    this.aPos.needsUpdate = this.aData.needsUpdate = this.aTint.needsUpdate = true;
    this.mat.uniforms.uFocus.value = focus.dist; this.mat.uniforms.uAperture.value = focus.aperture * this.blurScale;
  }
}

/* ------------------------------------------------------------ animation tracks (smooth, with holds) */
// keys: [{ t, v: number | number[], stop?: true }] → f(t). Cubic Hermite with Catmull-Rom
// tangents; a key marked stop has zero velocity, so the camera settles there.
export function track(keys) {
  const arr = keys.map(k => ({ t: k.t, v: Array.isArray(k.v) ? k.v : [k.v], stop: !!k.stop })), n = arr[0].v.length, scalar = !Array.isArray(keys[0].v);
  // monotone tangents (harmonic mean of the neighbouring slopes): a fast move never overshoots into a slow hold
  const m = arr.map((k, i) => { if (k.stop || i === 0 || i === arr.length - 1) return new Array(n).fill(0); const a = arr[i - 1], b = arr[i + 1];
    return k.v.map((_, j) => { const d0 = (k.v[j] - a.v[j]) / (k.t - a.t), d1 = (b.v[j] - k.v[j]) / (b.t - k.t); return d0 * d1 <= 0 ? 0 : 2 / (1 / d0 + 1 / d1); }); });
  return (t) => {
    let i = 0; while (i < arr.length - 2 && t > arr[i + 1].t) i++;
    const a = arr[i], b = arr[i + 1], dt = b.t - a.t, u = clamp((t - a.t) / dt), u2 = u * u, u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    const out = a.v.map((_, j) => h00 * a.v[j] + h10 * dt * m[i][j] + h01 * b.v[j] + h11 * dt * m[i + 1][j]);
    return scalar ? out[0] : out;
  };
}

/* ------------------------------------------------------------ the frame loop */
export const film = { duration: 60, update: null, prep: null, mbHint: null, cam: null };
const _probe = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
function applyCamera(t) {
  const c = film.cam(t); camera.position.set(...c.pos); camera.up.set(Math.sin(c.roll || 0), Math.cos(c.roll || 0), 0); camera.lookAt(...c.look); camera.fov = c.fov || 36; camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
  focus.dist = c.focus ?? Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]); focus.aperture = c.aperture ?? 0.05; return c;
}
function screenOf(t, pts) { const c = applyCamera(t); return pts.map((p, i) => { const v = _probe[i].set(c.look[0] + p[0], c.look[1] + p[1], c.look[2] + p[2]).project(camera); return [v.x * W / 2, v.y * H / 2]; }); }
async function frame(t) {
  applyCamera(t); if (film.prep) await film.prep(t); film.update(t); scene.updateMatrixWorld(true);
  lens.uniforms.uTime.value = t; composer.render();
}
const acc = document.createElement('canvas'); acc.width = W; acc.height = H; const actx = acc.getContext('2d');
export async function renderAt(t, q = 0.93) {
  // adaptive motion blur: more sub-frames the faster the picture moves
  const pts = [[0, 0, 0], [1.5, 2.5, 0], [-1.5, -2.5, 0]], a = screenOf(t - 0.5 / FPS, pts), b = screenOf(t + 0.5 / FPS, pts);
  let move = 0; a.forEach((p, i) => { move = Math.max(move, Math.hypot(b[i][0] - p[0], b[i][1] - p[1])); });
  if (film.mbHint) move = Math.max(move, film.mbHint(t));
  const N = Math.round(clamp(move / 9, 1, 8));
  if (N === 1) { await frame(t); return renderer.domElement.toDataURL('image/jpeg', q); }
  for (let i = 0; i < N; i++) { await frame(t + 0.5 * ((i + 0.5) / N - 0.5) / FPS); actx.globalAlpha = 1 / (i + 1); actx.drawImage(renderer.domElement, 0, 0); }
  return acc.toDataURL('image/jpeg', q);
}

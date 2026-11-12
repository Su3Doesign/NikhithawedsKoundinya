/* Pendli Pilupu v2 · one continuous camera through a world of gold
   The song runs from 0:44.91; scene times below are film seconds, placed on its bars. */
import { THREE, W, H, scene, camera, renderer, film, renderAt, buildEnvironment, goldMat, text3d, riseLetters, setOutlines, label, rise, canvasTex, loadImage, span, clamp, E, lerp, rng, noise1, Sprites, focus, track, bloom, lens } from './engine.js';

const S = { gan: 0, title: 5.76, bride: 11.7, groom: 16.0, stars: 21.0, merge: 23.6, names: 24.0, lock: 25.8, muh: 28.4, time: 30.0, venue: 32.0,
  hush: 38.89, drop: 42.79, toss2: 44.67, toss3: 46.6, events: 52.68, shubham: 58.67, note: 64.4, end: 70.4 };
const Z = { gan: 0, title: -16, bride: -34, stars: -66, muh: -92, arch: -122, events: -152, shubham: -178 };
film.duration = S.end;

/* ------------------------------------------------------------ load */
const fonts = [['400 100px Ramabhadra', 'నిఖిత శుభం'], ['400 100px Gurajada', 'కుమార్తె ఆహ్వానిస్తున్నాము'], ['300 100px Jost', 'A'], ['400 100px Jost', 'A'], ['500 100px Jost', 'A']];
await Promise.all(fonts.map(([f, s]) => document.fonts.load(f, s)));
setOutlines(await (await fetch('outlines.json')).json());
const IMG = {};
for (const [k, src] of Object.entries({ ganesha: '../assets/ganesha-hd.png', bride: '../assets/bride-matte.png', groom: '../assets/groom-matte.png', couple: '../../img/pair-silk-1086.webp',
  marigold: '../../img/art/marigold.png', gorintaku: '../../img/art/gorintaku.webp', bangles: '../../img/art/bangles.webp', kalasham: '../../img/art/kalasham.webp' })) IMG[k] = await loadImage(src);
const SVG = { bride: await (await fetch('../../img/lettering/bride.svg')).text(), groom: await (await fetch('../../img/lettering/groom.svg')).text() };
buildEnvironment(); document.body.appendChild(renderer.domElement);
const imgTex = (img) => { const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; return t; };
const G = (o) => goldMat(o);

/* ------------------------------------------------------------ the sky: red silk, turning to night, and mist */
scene.add(camera);
const silk = canvasTex(1024, 1820, (x, w, h) => {
  const g = x.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, h * 0.75); g.addColorStop(0, '#6e140e'); g.addColorStop(0.55, '#360706'); g.addColorStop(1, '#0e0203');
  x.fillStyle = g; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(255,190,120,.045)'; x.lineWidth = 2; const S2 = 110;
  for (let r = -1; r < h / S2 + 1; r++) for (let c = -1; c < w / S2 + 1; c++) { const cx = c * S2 + (r % 2 ? S2 / 2 : 0), cy = r * S2 * 0.9;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.beginPath(); x.ellipse(cx + Math.cos(a) * 15, cy + Math.sin(a) * 15, 10, 4, a, 0, 6.283); x.stroke(); } }
});
const night = canvasTex(512, 910, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#04030a'); g.addColorStop(0.6, '#0b0818'); g.addColorStop(1, '#170a20'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
const backMat = new THREE.ShaderMaterial({ uniforms: { a: { value: silk }, b: { value: night }, k: { value: 0 }, dim: { value: 1 } }, depthWrite: false, depthTest: false, fog: false,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform sampler2D a, b; uniform float k, dim; varying vec2 vUv; void main(){ vec3 c = mix(texture2D(a, vUv).rgb, texture2D(b, vUv).rgb, k) * dim; gl_FragColor = vec4(c, 1.0); }' });
backMat.toneMapped = false;
const back = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), backMat); back.renderOrder = -10; back.frustumCulled = false; camera.add(back);
{ const d = 400, hh = 2 * d * Math.tan(THREE.MathUtils.degToRad(19)) * 1.25; back.position.z = -d; back.scale.set(hh * W / H, hh, 1); }
scene.fog = new THREE.FogExp2(0x2a0605, 0.03);

/* ------------------------------------------------------------ shared craft */
const dotTex = canvasTex(64, 64, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); });
const riceTex = canvasTex(32, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#d9a23a'); g.addColorStop(0.5, '#fde4a2'); g.addColorStop(1, '#d39a34'); x.fillStyle = g; x.beginPath(); x.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, 0, 0, 6.283); x.fill(); });
const petalAtlas = canvasTex(6 * 96, 128, (x) => { const r = rng(300);
  for (let i = 0; i < 6; i++) { x.save(); x.translate(i * 96, 0); x.beginPath(); x.moveTo(48, 124); x.bezierCurveTo(2, 80, 14, 8, 48 + (r() - 0.5) * 10, 4); x.bezierCurveTo(82, 8, 94, 80, 48, 124); x.closePath(); x.clip();
    const s = 2.4 + r(); x.drawImage(IMG.marigold, -60 - r() * 70, -60 - r() * 70, 200 * s, 200 * s); x.restore(); } });

function petalShape(len, wid) { const s = new THREE.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(wid, len * 0.45, 0, len); s.quadraticCurveTo(-wid, len * 0.45, 0, 0); return s; }
// a mandala of gold petals in concentric rings, with fine rims; set(t, on) turns it slowly
function mandala(R, o = {}) {
  const g = new THREE.Group(), rings = o.rings || 4, inner = o.inner ?? 0.38, mat = G({ roughness: o.rough ?? 0.42, color: o.color ?? 0xb98236 });
  for (let k = 0; k < rings; k++) {
    const r0 = R * (inner + (1 - inner) * k / rings), n = 12 + k * 8, len = R * (1 - inner) / rings * 0.9;
    const geo = new THREE.ExtrudeGeometry(petalShape(len, len * 0.32), { depth: 0.03, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 2, curveSegments: 8 });
    const im = new THREE.InstancedMesh(geo, mat, n), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < n; i++) { const a = (i + (k % 2) * 0.5) / n * Math.PI * 2; e.set(0, 0, a - Math.PI / 2); q.setFromEuler(e); m.compose(new THREE.Vector3(Math.cos(a) * r0, Math.sin(a) * r0, 0), q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(i, m); }
    g.add(im);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(r0 - len * 0.12, 0.012 * R / 2.4, 8, 160), mat); g.add(rim);
  }
  const outer = new THREE.Mesh(new THREE.TorusGeometry(R * 1.02, 0.03 * R / 2.4, 12, 220), G({ roughness: 0.3, color: 0xd99c45 })); g.add(outer);
  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035 * R / 2.4, 10, 8), G({ roughness: 0.25, color: 0xd99c45 }), 72), m = new THREE.Matrix4();
  for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2; m.makeTranslation(Math.cos(a) * R * 1.1, Math.sin(a) * R * 1.1, 0); beads.setMatrixAt(i, m); } g.add(beads);
  g.userData.set = (t, on, spin = 0.05) => { g.visible = on > 0.002; g.rotation.z = t * spin; g.scale.setScalar(0.85 + 0.15 * E.out3(on)); g.children.forEach(c => { c.material.transparent = on < 1; c.material.opacity = on; }); };
  return g;
}
// an arch outline (round top) as a shape; inset shrinks it
function archShape(w, h, inset = 0) { const s = new THREE.Shape(), hw = w / 2 - inset, top = h / 2 - inset, bot = -h / 2 + inset, cy = top - hw;
  s.moveTo(-hw, bot); s.lineTo(-hw, cy); s.absarc(0, cy, hw, Math.PI, 0, true); s.lineTo(hw, bot); s.lineTo(-hw, bot); return s; }
function archPath(w, h, inset) { const s = archShape(w, h, inset), p = new THREE.Path(); p.curves = s.curves; return p; }
function archFrame(w, h, band = 0.11, depth = 0.08) { const s = archShape(w, h, 0); s.holes.push(archPath(w, h, band));
  return new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.018, bevelSegments: 3, curveSegments: 48 }), G()); }
// a picture cut to an arch
function archPicture(tex, w, h, imgAspect) { const g = new THREE.ShapeGeometry(archShape(w, h, 0), 48), pos = g.attributes.position, uv = g.attributes.uv;
  const sw = Math.max(w, h * imgAspect), sh = sw / imgAspect;   // cover
  for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5 + pos.getX(i) / sw, 0.5 + pos.getY(i) / sh);
  return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })); }
function fitUV(g) { g.computeBoundingBox(); const b = g.boundingBox, p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - b.min.x) / (b.max.x - b.min.x), (p.getY(i) - b.min.y) / (b.max.y - b.min.y)); uv.needsUpdate = true; }
// a flat picture
function picture(img, h, o = {}) { const w = h * img.width / img.height; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: imgTex(img), transparent: true, toneMapped: false, depthWrite: false, fog: o.fog ?? true })); m.renderOrder = o.order ?? 5; return m; }
// a left-aligned label
const fit3 = (tx, maxW) => { tx.group.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(tx.group), w = b.max.x - b.min.x;
  if (w > maxW) tx.group.scale.multiplyScalar(maxW / w); return tx; };
const fitW = (m, maxW) => { if (m.userData.w > maxW) m.scale.multiplyScalar(maxW / m.userData.w); return m; };
function pairRow(a, b, maxW, y, z, parent, ampSize = 0.2) { const wOf = (t) => { const bx = new THREE.Box3().setFromObject(t.group); return bx.max.x - bx.min.x; };
  const amp = text3d('amp', { size: ampSize, depth: 0.05, material: G({ color: 0xf6d38a, roughness: 0.2 }) }); a.amp = amp;
  let w1 = wOf(a), w2 = wOf(b), wa = wOf(amp), gap = 0.14; const k = Math.min(1, maxW / (w1 + wa + w2 + 2 * gap)); [a, b, amp].forEach(t => t.group.scale.multiplyScalar(k)); w1 *= k; w2 *= k; wa *= k; gap *= k;
  const x0 = -(w1 + wa + w2 + 2 * gap) / 2; a.group.position.set(x0 + w1 / 2, y, z); amp.group.position.set(x0 + w1 + gap + wa / 2, y, z); b.group.position.set(x0 + w1 + gap + wa + gap + w2 / 2, y, z); parent.add(a.group, amp.group, b.group); }
const leftLabel = (text, o, x, y, z = 0) => { const m = label(text, o); m.position.set(x + m.userData.w / 2, y, z); return m; };
// a gold ring to fly through
function portal(R) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.TorusGeometry(R, 0.035, 14, 220), G()));
  g.add(new THREE.Mesh(new THREE.TorusGeometry(R * 1.06, 0.012, 8, 220), G({ roughness: 0.4 })));
  const b = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 10, 8), G({ roughness: 0.16 }), 96), m = new THREE.Matrix4();
  for (let i = 0; i < 96; i++) { const a = i / 96 * Math.PI * 2; m.makeTranslation(Math.cos(a) * R * 0.94, Math.sin(a) * R * 0.94, 0); b.setMatrixAt(i, m); } g.add(b); return g; }

const shadeTex = canvasTex(256, 256, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(34,4,3,.86)'); g.addColorStop(0.55, 'rgba(34,4,3,.6)'); g.addColorStop(1, 'rgba(34,4,3,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); });
const shade = (w, h, x, y, z, parent, a = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: shadeTex, transparent: true, opacity: a, depthWrite: false, toneMapped: false })); m.position.set(x, y, z); parent.add(m); return m; };
/* ------------------------------------------------------------ the air: gold dust along the whole path */
const DUSTN = 1600, dust = new Sprites(DUSTN, dotTex, { additive: true, blur: 1.0 }); scene.add(dust.mesh);
const dr = rng(9), motes = Array.from({ length: DUSTN }, () => ({ x: (dr() - 0.5) * 12, y: (dr() - 0.5) * 16, z: 12 - dr() * 200, s: 0.008 + dr() * 0.02, ph: dr() * 6, v: 0.04 + dr() * 0.12, g: 0.7 + dr() * 0.2 }));

/* ============================================================ 1 · Ganesha, gathered from gold dust */
const gan = new THREE.Group(); gan.position.set(0, 0.62, Z.gan); scene.add(gan);
const medal = new THREE.Group(); gan.add(medal);
const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.1, 128), G({ roughness: 0.42, color: 0xd99b3e })); disc.rotation.x = Math.PI / 2; disc.position.z = -0.05; medal.add(disc);
medal.add(new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.055, 20, 200), G({ roughness: 0.18 })));
const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.36, 0.014, 10, 200), G()); ring2.position.z = 0.01; medal.add(ring2);
// the relief: a height field drawn from the line-art, so light rakes across real raised strokes
const RW = 230, RH = Math.round(RW * IMG.ganesha.height / IMG.ganesha.width), cv = document.createElement('canvas'); cv.width = RW; cv.height = RH;
const cx2 = cv.getContext('2d'); cx2.filter = 'blur(2.2px)'; cx2.drawImage(IMG.ganesha, 0, 0, RW, RH); const hd = cx2.getImageData(0, 0, RW, RH).data;
const relH = 2.1, relW = relH * RW / RH, relief = new THREE.PlaneGeometry(relW, relH, RW - 1, RH - 1);
{ const p = relief.attributes.position; for (let i = 0; i < p.count; i++) { const a = hd[i * 4 + 3] / 255; p.setZ(i, a < 0.04 ? -0.02 : 0.085 * Math.pow(a, 0.7)); } relief.computeVertexNormals(); }
const reliefMesh = new THREE.Mesh(relief, G({ roughness: 0.16, color: 0xffc35e })); reliefMesh.position.z = 0.0; medal.add(reliefMesh);
const ganTx = fit3(text3d('ganesha', { size: 0.31, depth: 0.1 }), 2.75); ganTx.group.position.set(0, -1.9, 0.12); gan.add(ganTx.group);
const shloka = label('శ్రీరస్తు   ·   శుభమస్తు   ·   అవిఘ్నమస్తు', { font: 'Gurajada', size: 0.17, px: 110, color: '#f4dcab' }); shloka.position.set(0, -2.36, 0.05); gan.add(shloka);
// the dust that becomes him
const ganPts = []; for (let y = 0; y < RH; y += 2) for (let x = 0; x < RW; x += 2) if (hd[(y * RW + x) * 4 + 3] > 150) ganPts.push([(x / RW - 0.5) * relW, (0.5 - y / RH) * relH, y / RH]);
const GN = Math.min(1800, ganPts.length), gDust = new Sprites(GN, dotTex, { additive: true, blur: 0.8 }); gan.add(gDust.mesh);
const gr = rng(21), gm = Array.from({ length: GN }, (_, i) => { const p = ganPts[Math.floor(i * ganPts.length / GN)], a = gr() * 6.283, b = (gr() - 0.5) * 2.4, d = 3 + gr() * 4;
  return { tx: p[0], ty: p[1], tz: 0.1, sx: Math.cos(a) * d, sy: Math.sin(a) * d * 1.4, sz: b * 2, t0: 0.6 + (1 - p[2]) * 2.0 + gr() * 0.6, dur: 1.3 + gr() * 0.6, s: 0.016 + gr() * 0.014 }; });

/* ============================================================ 2 · చల్లపల్లి వారి పెండ్లి పిలుపు */
const ttlG = new THREE.Group(); ttlG.position.z = Z.title; scene.add(ttlG);
const fam = fit3(text3d('family', { size: 0.62, depth: 0.14 }), 2.7); fam.group.position.set(0, 1.05, 0); ttlG.add(fam.group);
const ttl = fit3(text3d('title', { size: 0.74, depth: 0.18 }), 3.05); ttl.group.position.set(0, -0.12, 0); ttlG.add(ttl.group);
shade(4.8, 2.0, 0, -1.35, -0.3, ttlG, 0.7);
const ttlEn = label('NIKHITHA  ×  SAI KOUNDINYA', { size: 0.12, ls: 0.3, weight: 500, color: '#f2d28c' }); ttlEn.position.set(0, -1.18, 0.05); ttlG.add(ttlEn);
const ttlSub = label('వివాహ మహోత్సవ శుభ ఆహ్వానము', { font: 'Gurajada', size: 0.19, px: 110, color: '#f4dcab' }); ttlSub.position.set(0, -1.55, 0.05); ttlG.add(ttlSub);
const ttlMandala = mandala(2.9); ttlMandala.position.set(0, 0.3, -3.2); ttlG.add(ttlMandala);

/* ============================================================ 3 · the bride, the groom */
class Ink {   // the website's brush lettering, written stroke by stroke onto a texture
  constructor(svgText, width) {
    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml'); this.svg = doc.documentElement; const vb = this.svg.getAttribute('viewBox').split(/[ ,]+/).map(Number);
    this.cw = Math.round(vb[2] * 7); this.ch = Math.round(vb[3] * 7); this.svg.setAttribute('width', this.cw); this.svg.setAttribute('height', this.ch);
    this.strokes = [...this.svg.querySelectorAll('.ink-stroke')].map(p => ({ p, a: +p.getAttribute('data-start'), b: +p.getAttribute('data-end') })); this.finish = this.svg.querySelector('.ink-finish');
    const DEEP = { '#704059': '#4b1834', '#b67577': '#86344f', '#234859': '#0f3243', '#678184': '#2b5864' }; this.svg.querySelectorAll('stop').forEach(st => { const c = (st.getAttribute('stop-color') || '').toLowerCase(); if (DEEP[c]) st.setAttribute('stop-color', DEEP[c]); });
    this.canvas = document.createElement('canvas'); this.canvas.width = this.cw; this.canvas.height = this.ch; this.ctx = this.canvas.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace; this.last = -1;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width * this.ch / this.cw), new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, depthWrite: false, toneMapped: false })); this.mesh.renderOrder = 15;
  }
  async set(k) { const ink = clamp(k) * 1.08, key = Math.round(ink * 1500); if (key === this.last) return; this.last = key;
    this.strokes.forEach(({ p, a, b }) => { const w = E.smooth(span(ink, a, b)); p.setAttribute('stroke-dasharray', '1'); p.setAttribute('stroke-dashoffset', (1 - w).toFixed(4)); p.setAttribute('visibility', w > 0 ? 'visible' : 'hidden'); });
    if (this.finish) this.finish.setAttribute('opacity', (E.smooth(span(ink, 0.91, 1.08)) * 0.65).toFixed(3));
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(this.svg)], { type: 'image/svg+xml' })); const img = new Image(); img.src = url; await img.decode(); URL.revokeObjectURL(url);
    this.ctx.clearRect(0, 0, this.cw, this.ch); this.ctx.drawImage(img, 0, 0, this.cw, this.ch); this.ctx.drawImage(img, 0, 0, this.cw, this.ch); this.tex.needsUpdate = true; }
}
// a cream card behind each portrait, so the plum ink and the painting sit on paper
const paperTex = canvasTex(512, 900, (x, w, h) => { const g = x.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.45, h * 0.7); g.addColorStop(0, '#fbf3e3'); g.addColorStop(1, '#ead9b8'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const r = rng(4); for (let i = 0; i < 1400; i++) { x.strokeStyle = r() < 0.5 ? 'rgba(160,120,70,.06)' : 'rgba(255,255,255,.45)'; const px = r() * w, py = r() * h; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 6 + r() * 20, py + (r() - 0.5) * 2); x.stroke(); } });
const PEOPLE = [
  { key: 'bride', img: IMG.bride, x: 0, t0: S.bride, t1: S.groom, h: 3.05, py: 0.62, name: 'bride', nameSize: 0.4, role: 'THE BRIDE', lines: ['శ్రీ చల్లపల్లి శ్రీధర్ గారు', 'శ్రీమతి వెంకట కృష్ణవేణి గార్ల కుమార్తె'] },
  { key: 'groom', img: IMG.groom, x: 4.4, t0: S.groom, t1: S.stars, h: 2.85, py: 0.66, name: 'groom', nameSize: 0.3, role: 'THE GROOM', lines: ['కొవ్వూరు వాస్తవ్యులు', 'శ్రీ కొక్కిరాల వి.వి. హరిమోహన్ గారు', 'శ్రీమతి శైలజ గార్ల కుమారుడు'] },
].map(p => {
  const g = new THREE.Group(); g.position.set(p.x, 0, Z.bride); scene.add(g); p.g = g;
  const card = new THREE.Mesh(new THREE.ShapeGeometry(archShape(3.3, 5.8), 48), new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.9, metalness: 0, emissive: 0xffffff, emissiveMap: paperTex, emissiveIntensity: 0.62 })); card.position.set(0, -0.2, -0.12); fitUV(card.geometry); g.add(card);
  const edge = archFrame(3.42, 5.92, 0.06, 0.05); edge.position.set(0, -0.2, -0.14); g.add(edge);
  const frame = archFrame(2.7, 3.45, 0.06, 0.05); frame.position.set(0, p.py + 0.05, -0.02); g.add(frame);
  p.pic = picture(p.img, p.h); p.pic.position.set(0, p.py, 0); g.add(p.pic);
  p.roleT = label(p.role, { size: 0.1, ls: 0.35, weight: 500, color: '#9c6e24' }); p.roleT.position.set(0, -1.16, 0.02); g.add(p.roleT);
  p.ink = new Ink(SVG[p.key], 1.5); p.ink.mesh.position.set(0, -1.62, 0.02); g.add(p.ink.mesh);
  p.nm = fit3(text3d(p.name, { size: p.nameSize, depth: 0.07, material: G({ color: 0xc9302a, metalness: 0.35, roughness: 0.35 }) }), 2.4); p.nm.group.position.set(0, -2.12, 0.04); g.add(p.nm.group);
  p.ls = p.lines.map((l, i) => { const m = fitW(label(l, { font: 'Gurajada', size: 0.165, px: 120, color: '#2e1f16' }), 3.0); m.position.set(0, -2.43 - i * 0.215, 0.02); g.add(m); return m; });
  return p;
});

/* ============================================================ 4 · written in the stars */
const sky = new THREE.Group(); sky.position.z = Z.stars; scene.add(sky);
const STARN = 900, stars = new Sprites(STARN, dotTex, { additive: true, blur: 0.5 }); sky.add(stars.mesh);
const sr = rng(77), starPts = Array.from({ length: STARN }, () => ({ x: (sr() - 0.5) * 22, y: (sr() - 0.5) * 34, z: -6 - sr() * 30, s: 0.01 + sr() * sr() * 0.05, a: 0.4 + 0.6 * sr(), w: sr() < 0.2 }));
const DIP = [[-2.3, 1.2], [-1.05, 1.75], [0.05, 1.3], [1.0, 0.95], [1.25, -0.25], [2.55, -0.45], [2.75, 0.85]].map(([x, y]) => [(x - 0.22) * 0.6, y * 0.6 + 1.3]);
const MIZ = DIP[1];
const consGeo = new THREE.BufferGeometry().setFromPoints([...DIP, DIP[3]].map(([x, y]) => new THREE.Vector3(x, y, 0)));
const cons = new THREE.Line(consGeo, new THREE.LineBasicMaterial({ color: 0xbfd0ff, transparent: true, opacity: 0.6, fog: false })); sky.add(cons);
const bright = new Sprites(10, dotTex, { additive: true, blur: 0.3, depthTest: false }); sky.add(bright.mesh);
const sapT = label('సప్తర్షి మండలం', { font: 'Gurajada', size: 0.24, px: 110, color: '#f4e6c8' }); sapT.position.set(0, 2.85, 0); sky.add(sapT);
const sapE = label('THE SAPTARISHI · SEVEN SAGES', { size: 0.09, ls: 0.3, weight: 500, color: '#d9b06a' }); sapE.position.set(0, 2.58, 0); sky.add(sapE);
const nik = fit3(text3d('bride', { size: 0.62, depth: 0.12 }), 1.5); nik.group.position.set(0, 0.35, 0); sky.add(nik.group);
const sai = fit3(text3d('groom', { size: 0.44, depth: 0.1 }), 2.6); sai.group.position.set(0, -0.55, 0); sky.add(sai.group);
const wit = label('అరుంధతి నక్షత్రం సాక్షిగా', { font: 'Gurajada', size: 0.21, px: 110, color: '#f4e6c8' }); wit.position.set(0, -1.32, 0); sky.add(wit);
const witE = label('WITH ARUNDHATI AS OUR WITNESS', { size: 0.09, ls: 0.3, weight: 500, color: '#d9b06a' }); witE.position.set(0, -1.6, 0); sky.add(witE);
// stardust targets on the names
function sampleText(text, font, px, wWorld, cx, cy, step) { const c = document.createElement('canvas'); c.width = 1400; c.height = 360; const x = c.getContext('2d'); x.font = `${px}px ${font}`; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 700, 180);
  const tw = x.measureText(text).width, k = wWorld / tw, d = x.getImageData(0, 0, 1400, 360).data, pts = []; for (let y = 0; y < 360; y += step) for (let xx = 0; xx < 1400; xx += step) if (d[(y * 1400 + xx) * 4 + 3] > 140) pts.push([cx + (xx - 700) * k, cy + (180 - y) * k, (xx - 700 + tw / 2) / tw]); return pts; }
function onto(pts, tx, j) { const b = new THREE.Box3().setFromObject(tx.group); b.min.sub(sky.position); b.max.sub(sky.position);
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  return pts.map(p => [b.min.x + (p[0] - x0) / (x1 - x0) * (b.max.x - b.min.x), b.min.y + (p[1] - y0) / (y1 - y0) * (b.max.y - b.min.y), p[2], j]); }
sky.updateMatrixWorld(true);
const namePts = [...onto(sampleText('నిఖిత', 'Ramabhadra', 260, 1, 0, 0, 4), nik, 0), ...onto(sampleText('సాయి కౌండిన్య', 'Ramabhadra', 260, 1, 0, 0, 4), sai, 1)];
const ND = namePts.length, nDust = new Sprites(ND, dotTex, { additive: true, blur: 0.3, depthTest: false }); sky.add(nDust.mesh);
const nr = rng(91), nd = namePts.map(p => ({ x: p[0], y: p[1], t0: S.names + p[3] * 0.45 + p[2] * 0.5 + nr() * 0.1, fly: 0.6 + nr() * 0.3, cx: (nr() - 0.5) * 2, cy: 0.6 + nr() * 0.8, s: 0.011 + nr() * 0.006 }));

/* ============================================================ 5 · శుభ ముహూర్తం */
const muh = new THREE.Group(); muh.position.z = Z.muh; scene.add(muh);
const muhMandala = mandala(3.0, { rings: 3 }); muhMandala.position.set(0, -0.1, -3.4); muh.add(muhMandala);
shade(5.0, 7.2, 0, -0.25, -0.4, muh, 0.95);
const muhTx = fit3(text3d('muhurtham', { size: 0.5, depth: 0.12 }), 2.9); muhTx.group.position.set(0, 1.85, 0); muh.add(muhTx.group);
const muhEn = label('SUBHA MUHURTHAM', { size: 0.105, ls: 0.4, weight: 500, color: '#f2d28c' }); muhEn.position.set(0, 1.38, 0); muh.add(muhEn);
const dayTe = label('ఆదివారం, 13 డిసెంబర్ 2026', { font: 'Gurajada', size: 0.2, px: 110, color: '#fbefd8' }); fitW(dayTe, 3.0); dayTe.position.set(0, 0.98, 0); muh.add(dayTe);
const dayEn = label('SUNDAY · 13 DECEMBER 2026', { size: 0.1, ls: 0.3, weight: 500, color: '#f2d28c' }); dayEn.position.set(0, 0.7, 0); muh.add(dayEn);
const timeTx = fit3(text3d('time', { size: 1.05, depth: 0.22 }), 2.5); timeTx.group.position.set(0, -0.12, 0.05); muh.add(timeTx.group);
const timeTe = label('రాత్రి 8:22 గంటలకు', { font: 'Gurajada', size: 0.2, px: 110, color: '#fbefd8' }); timeTe.position.set(0, -0.95, 0); muh.add(timeTe);
const v1 = label('శ్రీ కొత్తపల్లి శ్రీరాములు కనకమ్మ\nలయన్స్ A/C కళ్యాణమండపం', { font: 'Gurajada', size: 0.2, px: 120, lh: 1.25, color: '#fff3dc' }); fitW(v1, 3.1); v1.position.set(0, -1.62, 0); muh.add(v1);
const v2 = label('Sri Kothapalli Sriramulu Kanakamma\nLions A/C Kalyana Mandapam', { size: 0.115, px: 100, lh: 1.35, color: '#f6dc9e' }); fitW(v2, 3.1); v2.position.set(0, -2.12, 0); muh.add(v2);
const v3 = label('R.T.C COMPLEX ROAD · NIDADAVOLU 534301', { size: 0.09, ls: 0.25, weight: 500, color: '#f2d28c' }); v3.position.set(0, -2.42, 0); muh.add(v3);
const pin = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), G()); pin.position.set(0, -1.3, 0); muh.add(pin);

/* ============================================================ 6 · the hush, the arch, the moment */
const arch = new THREE.Group(); arch.position.z = Z.arch; scene.add(arch);
const AW = 2.55, AH = 3.45;
const archMandala = mandala(2.75, { rings: 4, inner: 0.5 }); archMandala.position.set(0, 0.15, -1.2); arch.add(archMandala);
const glowTex = canvasTex(256, 256, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,240,210,1)'); g.addColorStop(0.4, 'rgba(255,200,120,.35)'); g.addColorStop(1, 'rgba(255,180,90,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); });
const halo = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); halo.position.set(0, 0.15, -0.6); arch.add(halo);
const archF = archFrame(AW + 0.24, AH + 0.24, 0.12, 0.1); archF.position.set(0, 0.15, -0.02); arch.add(archF);
const coupleTex = imgTex(IMG.couple), photo = archPicture(coupleTex, AW, AH, IMG.couple.width / IMG.couple.height); photo.position.set(0, 0.15, 0); arch.add(photo);
shade(4.6, 1.9, 0, -2.25, 0.04, arch, 0.9);
const talT = label('తలంబ్రాలు', { font: 'Gurajada', size: 0.24, px: 110, color: '#f2d28c' }); talT.position.set(0, 2.3, 0.1); arch.add(talT);
const cn1 = text3d('bride', { size: 0.34, depth: 0.08 }), cn2 = text3d('groom', { size: 0.27, depth: 0.07 });
pairRow(cn1, cn2, 2.7, -2.05, 0.1, arch, 0.24);
const cWhen = label('13 · 12 · 2026  ·  8:22 PM', { size: 0.115, ls: 0.35, weight: 500, color: '#f2d28c' }); cWhen.position.set(0, -2.45, 0.1); arch.add(cWhen);
const RICEN = 330, rice = new Sprites(RICEN, riceTex, { aspect: 2, blur: 1.0, energy: 1.2 }); arch.add(rice.mesh);
const rr = rng(101), grains = Array.from({ length: RICEN }, (_, i) => { const toss = [S.drop, S.toss2, S.toss3][i % 3], a = -Math.PI / 2 + (rr() - 0.5) * 1.6, v = 3.2 + rr() * 2.6;
  return { t0: toss + rr() * 0.3, x0: (rr() - 0.5) * 1.6, y0: -3.4, z0: 0.4 + rr() * 2.2, vx: -Math.cos(a) * v * 0.55, vy: -Math.sin(a) * v, vz: (rr() - 0.5) * 0.8, sp: (rr() - 0.5) * 8, ph: rr() * 6, s: 0.016 + rr() * 0.01 }; });
const PETN = 70, petals = new Sprites(PETN, petalAtlas, { cols: 6, aspect: 1.33, blur: 1.2, energy: 1.0 }); arch.add(petals.mesh);
const pr = rng(55), pts2 = Array.from({ length: PETN }, () => ({ x: (pr() - 0.5) * 5, y0: 2.6 + pr() * 5, z: -0.5 + pr() * 4, v: 0.35 + pr() * 0.35, sw: 0.2 + pr() * 0.4, ph: pr() * 6, s: 0.06 + pr() * 0.05, f: Math.floor(pr() * 6) }));

/* ============================================================ 7 · the celebrations */
const ev = new THREE.Group(); ev.position.z = Z.events; scene.add(ev);
const evCard = new THREE.Mesh(new THREE.ShapeGeometry(archShape(3.3, 5.6), 48), new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.9, emissive: 0xffffff, emissiveMap: paperTex, emissiveIntensity: 0.62 })); evCard.position.set(0, -0.2, -0.1); fitUV(evCard.geometry); ev.add(evCard);
const evEdge = archFrame(3.42, 5.72, 0.06, 0.05); evEdge.position.set(0, -0.2, -0.12); ev.add(evEdge);
const evHead = label('వేడుకలు', { font: 'Ramabhadra', size: 0.4, px: 130, color: '#b3261e' }); evHead.position.set(0, 1.62, 0); ev.add(evHead);
const evSub = label('THE CELEBRATIONS', { size: 0.08, ls: 0.35, weight: 500, color: '#9c6e24' }); evSub.position.set(0, 1.28, 0); ev.add(evSub);
const ROWS = [[IMG.gorintaku, 'గోరింటాకు', 'MEHENDI', 'FRI · 11 DEC · 4:00 PM ONWARDS'], [IMG.marigold, 'హల్దీ', 'HALDI', 'SAT · 12 DEC · 3:30 PM ONWARDS'], [IMG.bangles, 'పెండ్లికూతురు', 'PENDLIKUTHURU', 'SAT · 12 DEC · 9:25 AM'], [IMG.kalasham, 'వివాహం', 'THE WEDDING', 'SUN · 13 DEC · 8:22 PM']]
  .map(([img, te, en, when], i) => { const g = new THREE.Group(); g.position.set(0, 0.68 - i * 0.84, 0); ev.add(g); const hero = i === 3;
    const ic = picture(img, 0.5, { order: 16 }); ic.position.set(-1.1, -0.02, 0.02); g.add(ic);
    g.add(leftLabel(te, { font: 'Ramabhadra', size: hero ? 0.26 : 0.22, px: 120, color: '#b3261e' }, -0.72, 0.16, 0.02));
    g.add(leftLabel(en, { size: 0.07, ls: 0.25, weight: 500, color: '#5b4c40' }, -0.71, -0.06, 0.02));
    g.add(fitW(leftLabel(when, { size: 0.098, weight: 500, color: '#1d1712' }, -0.71, -0.23, 0.02), 2.3)); { const m = g.children[g.children.length - 1]; m.position.x = -0.71 + m.userData.w * m.scale.x / 2; }
    if (!hero) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.008), new THREE.MeshBasicMaterial({ color: 0xc9a14f })); ln.position.set(0, -0.4, 0.02); g.add(ln); }
    else { const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.68), new THREE.MeshBasicMaterial({ color: 0xf6e3bd, transparent: true, opacity: 0.6 })); glow.position.set(0, -0.03, 0.005); g.add(glow); }
    return g; });

/* ============================================================ 8 · శుభం */
const sh = new THREE.Group(); sh.position.z = Z.shubham; scene.add(sh);
const shMandala = mandala(2.6, { rings: 4 }); shMandala.position.set(0, 1.1, -2.6); sh.add(shMandala);
const shTx = fit3(text3d('shubham', { size: 1.05, depth: 0.24 }), 2.5); shTx.group.position.set(0, 1.05, 0); sh.add(shTx.group);
const inv = ['మీరు సకుటుంబ సపరివార సమేతంగా విచ్చేసి,', 'నూతన వధూవరులను ఆశీర్వదించవలసినదిగా', 'సాదరంగా ఆహ్వానిస్తున్నాము.'].map((l, i) => { const m = fitW(label(l, { font: 'Gurajada', size: 0.175, px: 120, color: '#fff3dc' }), 3.2); m.position.set(0, -0.15 - i * 0.24, 0); sh.add(m); return m; });
shade(5.0, 4.6, 0, -0.75, -0.3, sh, 0.95);
const shN1 = text3d('bride', { size: 0.3, depth: 0.07 }), shN2 = text3d('groom', { size: 0.24, depth: 0.06 });
pairRow(shN1, shN2, 2.8, -1.12, 0, sh, 0.21);
const sign = fitW(label('ఇట్లు, చల్లపల్లి కుటుంబ సభ్యులు', { font: 'Gurajada', size: 0.18, px: 110, color: '#f4dcab' }), 3.1); sign.position.set(0, -1.58, 0); sh.add(sign);
const shDate = label('SUNDAY · 13 · 12 · 2026 · 8:22 PM · NIDADAVOLU', { size: 0.085, ls: 0.25, weight: 500, color: '#f2d28c' }); fitW(shDate, 3.1); shDate.position.set(0, -1.86, 0); sh.add(shDate);
// the last word: శుభం gives way to a quiet note, inside the same mandala
const shMain = new THREE.Group(); [...sh.children].filter(c => c !== shMandala).forEach(c => shMain.add(c)); sh.add(shMain);
const note = new THREE.Group(); note.position.set(0, 0, 0.2); sh.add(note);
const noteShade = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 4.2), new THREE.MeshBasicMaterial({ map: shadeTex, transparent: true, depthWrite: false, toneMapped: false })); noteShade.position.set(0, 0.75, -0.25); note.add(noteShade);
const noteH = label('ఒక చిన్న మనవి', { font: 'Gurajada', size: 0.23, px: 110, color: '#f3c66c' }); noteH.position.set(0, 1.78, 0); note.add(noteH);
const gift1 = fit3(text3d('gift1', { size: 0.42, depth: 0.12, material: G({ color: 0xffcb66, roughness: 0.16, envMapIntensity: 1.8 }) }), 2.75); gift1.group.position.set(0, 1.1, 0); note.add(gift1.group);
const gift2 = fit3(text3d('gift2', { size: 0.4, depth: 0.1, material: G({ color: 0xffcb66, roughness: 0.16, envMapIntensity: 1.8 }) }), 2.4); gift2.group.position.set(0, 0.42, 0); note.add(gift2.group);
const gift3 = label('మీ ఆశీస్సులే మాకు శ్రీరామరక్ష', { font: 'Gurajada', size: 0.22, px: 110, color: '#fbefd8' }); fitW(gift3, 2.8); gift3.position.set(0, 0.0, 0); note.add(gift3);
const noteRule = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.006), new THREE.MeshBasicMaterial({ color: 0xe9bf6a, transparent: true })); noteRule.position.set(0, -0.33, 0); note.add(noteRule);
const noteEn = label('NO GIFTS, PLEASE', { size: 0.11, ls: 0.32, weight: 500, color: '#f6dc9e' }); noteEn.position.set(0, -0.58, 0); note.add(noteEn);
const noteEn2 = label('YOUR PRESENCE IS OUR PRESENT', { size: 0.09, ls: 0.28, weight: 500, color: '#f2d28c' }); fitW(noteEn2, 2.9); noteEn2.position.set(0, -0.8, 0); note.add(noteEn2);

/* ------------------------------------------------------------ portals between worlds */
const PORTALS = [[-46, 2.2], [-78, 2.3], [-138, 2.2], [-164, 2.2]].map(([z, R]) => { const p = portal(R); p.position.set(0, 0.15, z); scene.add(p); return p; });

/* ============================================================ the camera: one continuous move */
const camT = track([      // [x, y, z, look x, y, z, aperture]; distances chosen so each scene fills a 9:16 frame
  { t: 0, v: [0, 0.4, 12.5, 0, 0.3, 0, 0.05] },
  { t: 4.2, v: [0, 0.3, 8.8, 0, 0.25, 0, 0.06] },
  { t: 5.5, v: [0, 0.3, 8.1, 0, 0.25, 0, 0.06], stop: true },
  { t: 6.5, v: [0.3, 0.2, -1.5, 0, 0.1, -16, 0.04] },
  { t: 7.6, v: [0, 0.1, -6.2, 0, 0.1, -16, 0.06] },
  { t: 11.0, v: [0.12, 0.05, -6.9, 0, 0.05, -16, 0.06] },
  { t: 12.5, v: [0, -0.2, -23.4, 0, -0.2, -34, 0.05] },
  { t: 16.0, v: [0, -0.2, -23.8, 0, -0.2, -34, 0.05], stop: true },
  { t: 17.2, v: [4.4, -0.2, -23.5, 4.4, -0.2, -34, 0.05] },
  { t: 20.4, v: [4.4, -0.2, -24.0, 4.4, -0.2, -34, 0.05], stop: true },
  { t: 21.7, v: [1.2, 1.0, -53.0, 0, 1.0, -66, 0.04] },
  { t: 23.4, v: [0, 1.0, -57.6, 0, 1.0, -66, 0.05] },
  { t: 25.6, v: [0, 0.4, -57.9, 0, 0.35, -66, 0.05], stop: true },
  { t: 27.8, v: [0, 0.4, -58.2, 0, 0.35, -66, 0.05], stop: true },
  { t: 29.0, v: [0, 0.0, -81.6, 0, -0.1, -92, 0.05] },
  { t: 38.6, v: [0.1, -0.05, -82.3, 0, -0.15, -92, 0.05], stop: true },
  { t: 42.2, v: [0, 0.1, -111.6, 0, 0.0, -122, 0.05] },
  { t: 52.2, v: [0, 0.05, -112.4, 0, -0.05, -122, 0.05], stop: true },
  { t: 53.6, v: [0, -0.2, -141.5, 0, -0.2, -152, 0.05] },
  { t: 58.3, v: [0, -0.2, -142.0, 0, -0.2, -152, 0.05], stop: true },
  { t: 59.7, v: [0, 0.15, -167.8, 0, 0.15, -178, 0.05] },
  { t: 64.4, v: [0, 0.15, -168.5, 0, 0.15, -178, 0.05] },
  { t: 70.4, v: [0, 0.75, -169.4, 0, 0.75, -178, 0.05] },
]);
film.cam = (t) => { const v = camT(t); const sway = 0.04 * noise1(t * 0.35, 3); return { pos: [v[0] + sway, v[1] + 0.03 * noise1(t * 0.3, 4), v[2]], look: [v[3], v[4], v[5]], fov: 38, aperture: v[6] }; };
film.mbHint = (t) => 0;

/* ============================================================ the frame */
film.prep = async (t) => { for (const p of PEOPLE) if (t > p.t0 - 0.3 && t < p.t1 + 1.5) await p.ink.set(span(t, p.t0 + 0.6, p.t0 + 2.2)); };
/* scenes appear out of the distance as the camera nears them, and dissolve just before it passes through */
const FADED = new Set();
function restoreFades() { FADED.forEach(m => { m.opacity = m.userData.pre; }); FADED.clear(); }
function fadeScene(g, o) { const dz = camera.position.z - g.position.z; let k = 1;
  if (o.leave) k *= 1 - E.smooth(span(film.t, o.leave, o.leave + 0.6)); if (o.in) k *= E.smooth(span(dz, 23, 15));
  if (k >= 0.999 || !g.visible) return; if (k <= 0.001) { g.visible = false; return; }
  g.traverse(m => { if (!m.material || m.material.isShaderMaterial || FADED.has(m.material)) return; const mt = m.material; mt.userData.pre = mt.opacity; mt.transparent = true; mt.opacity *= k; FADED.add(mt); }); }
film.update = (t) => {
  film.t = t; restoreFades();
  // sky: red silk, night for the stars, a darker hush before the arch fills with light
  const nightK = E.smooth(span(t, S.stars - 0.2, S.stars + 0.9)) * (1 - E.smooth(span(t, S.muh - 0.4, S.muh + 0.6)));
  backMat.uniforms.k.value = nightK; backMat.uniforms.dim.value = 1 - 0.55 * E.smooth(span(t, S.hush, S.hush + 1.5)) * (1 - E.smooth(span(t, S.drop - 0.2, S.drop + 1.5)));
  scene.fog.color.setRGB(lerp(0.17, 0.02, nightK), lerp(0.03, 0.015, nightK), lerp(0.025, 0.05, nightK));
  lens.uniforms.uFade.value = 1 - E.smooth(span(t, 0, 0.8)) + E.smooth(span(t, S.end - 1.4, S.end));

  // dust everywhere along the path
  motes.forEach((m, i) => { const p = dust.items[i]; p.x = m.x + 0.12 * Math.sin(t * 0.35 + m.ph); p.y = m.y + ((t * m.v + m.ph) % 3) - 1.5; p.z = m.z; p.s = m.s; p.r = 1; p.g = m.g; p.b = 0.45; p.a = 0.85 * (1 - 0.6 * nightK); });
  dust.update();

  /* 1 · Ganesha */
  const gk = E.smooth(span(t, 3.4, 4.6));
  medal.children.forEach(c => { c.material.transparent = gk < 1; c.material.opacity = gk; }); medal.visible = gk > 0.01;
  gm.forEach((m, i) => { const p = gDust.items[i], k = E.inOut(span(t, m.t0, m.t0 + m.dur)), arc = Math.sin(Math.PI * k);
    p.x = lerp(m.sx, m.tx, k) + arc * 0.4 * Math.sin(m.ph || i); p.y = lerp(m.sy, m.ty, k) + arc * 0.3; p.z = lerp(m.sz, m.tz, k); p.s = m.s * (1 + 0.8 * (1 - k)); p.r = 1; p.g = 0.84; p.b = 0.5; p.a = E.smooth(span(t, 0.2, 1.2)) * (1 - gk * 0.92); });
  gDust.update();
  riseLetters(ganTx, t, 3.3, { stagger: 0.07 }); rise(shloka, t, 3.9, 0.9, 0.08);
  const turn = E.inOut(span(t, 5.5, 6.5)); gan.rotation.y = turn * 1.45; gan.position.x = -turn * 2.2; gan.visible = t < 7.5;
  medal.rotation.y = 0.12 * Math.sin(t * 0.6) * (1 - turn);

  /* 2 · title */
  riseLetters(fam, t, S.title + 0.6, { stagger: 0.09 }); riseLetters(ttl, t, S.title + 1.3, { stagger: 0.11, dur: 1.1 });
  [fam, ttl].forEach((x, j) => x.letters.forEach((m, i) => { if (t > S.title + 2.6) m.rotation.x += 0.05 * Math.sin(t * 0.8 + i * 0.6 + j); }));
  rise(ttlEn, t, S.title + 2.4, 0.9, 0.08); rise(ttlSub, t, S.title + 2.9, 0.9, 0.08);
  ttlMandala.userData.set(t, 0.7 * E.smooth(span(t, S.title + 0.2, S.title + 2.2)), 0.06); ttlG.visible = t > S.title - 1.5 && t < S.bride + 1.5;

  /* 3 · bride and groom */
  PEOPLE.forEach(p => { const on = t > p.t0 - 1.5 && t < p.t1 + 1.6; p.g.visible = on; if (!on) return;
    const a = E.smooth(span(t, p.t0 - 0.4, p.t0 + 0.8)); p.pic.material.opacity = a; p.pic.position.y = p.py - 0.08 * (1 - a);
    rise(p.roleT, t, p.t0 + 0.5, 0.8, 0.05); riseLetters(p.nm, t, p.t0 + 1.6, { stagger: 0.07, dur: 0.8, drop: 0.2 });
    p.ls.forEach((l, j) => rise(l, t, p.t0 + 1.9 + j * 0.22, 0.8, 0.05)); });

  /* 4 · stars */
  sky.visible = t > S.stars - 1.5 && t < S.muh + 1.5;
  if (sky.visible) {
    starPts.forEach((s, i) => { const p = stars.items[i]; p.x = s.x; p.y = s.y; p.z = s.z; p.s = s.s; p.r = s.w ? 1 : 0.86; p.g = s.w ? 0.9 : 0.9; p.b = s.w ? 0.78 : 1; p.a = s.a * nightK; }); stars.update();
    const ck = E.inOut(span(t, S.stars + 0.3, S.stars + 1.5)); consGeo.setDrawRange(0, Math.max(2, Math.ceil(ck * 8))); cons.material.opacity = 0.55 * nightK * (1 - E.smooth(span(t, S.merge, S.merge + 1)));
    const merged = t >= S.merge, sep = 0.12 * (1 - E.inOut(span(t, S.merge - 1.1, S.merge))), ang = t * 2.2, m = merged ? Math.exp(-(t - S.merge) * 1.4) : 0;
    DIP.forEach(([x, y], i) => { const p = bright.items[i], k = E.out3(span(t, S.stars + 0.2 + i * 0.12, S.stars + 0.8 + i * 0.12));
      p.x = x; p.y = y; p.z = 0; p.s = 0.05 * k; p.r = 0.95; p.g = 0.95; p.b = 1; p.a = nightK * (i === 1 ? 0 : 1) * (1 - E.smooth(span(t, S.merge, S.merge + 1.2))); });
    [[0, 1], [1, -1]].forEach(([j, sg]) => { const p = bright.items[7 + j]; p.x = MIZ[0] + sg * Math.cos(ang) * sep; p.y = MIZ[1] + sg * Math.sin(ang) * sep * 0.6; p.z = 0; p.s = 0.06; p.r = j ? 1 : 0.85; p.g = j ? 0.88 : 0.92; p.b = j ? 0.7 : 1; p.a = merged ? 0 : nightK; });
    { const p = bright.items[9], lift = E.inOut(span(t, S.merge + 0.2, S.merge + 1.2)); p.x = lerp(MIZ[0], 0, lift); p.y = lerp(MIZ[1], 1.55, lift); p.z = 0; p.s = 0.075 + 0.12 * m; p.r = 1; p.g = 0.95; p.b = 0.85; p.a = merged ? 1 : 0; }
    bright.update();
    const star = bright.items.find(() => true);
    const sx = lerp(MIZ[0], 0, E.inOut(span(t, S.merge + 0.2, S.merge + 1.2))), sy = lerp(MIZ[1], 1.55, E.inOut(span(t, S.merge + 0.2, S.merge + 1.2)));
    nd.forEach((d, i) => { const p = nDust.items[i], q = span(t, d.t0, d.t0 + d.fly), e = E.inOut(q);
      const mx = (sx + d.x) / 2 + d.cx, my = (sy + d.y) / 2 + d.cy;
      p.x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * mx + e * e * d.x; p.y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * my + e * e * d.y; p.z = 0.05; p.s = q > 0 ? d.s : 0;
      p.r = 1; p.g = 0.86; p.b = 0.55; p.a = (1 - E.smooth(span(t, S.lock + 0.1, S.lock + 0.8))); }); nDust.update();
    const lock = E.smooth(span(t, S.lock - 0.4, S.lock + 0.5)); [nik, sai].forEach(x => { x.group.visible = lock > 0.01; x.letters.forEach(l => { l.material.transparent = lock < 1; l.material.opacity = lock; }); });
    rise(sapT, t, S.stars + 0.6, 0.8, 0.06); rise(sapE, t, S.stars + 0.9, 0.8, 0.04); [sapT, sapE].forEach(o => { o.material.opacity *= 1 - E.smooth(span(t, S.merge - 0.8, S.merge)); });
    rise(wit, t, S.lock + 0.3, 0.8, 0.06); rise(witE, t, S.lock + 0.55, 0.8, 0.04);
  }

  /* 5 · శుభ ముహూర్తం */
  muh.visible = t > S.muh - 1.5 && t < S.hush + 2;
  if (muh.visible) {
    muhMandala.userData.set(t, E.smooth(span(t, S.muh + 0.3, S.muh + 2.3)) * 0.5, 0.04);
    riseLetters(muhTx, t, S.muh + 0.6, { stagger: 0.08 }); rise(muhEn, t, S.muh + 1.4, 0.8, 0.04);
    rise(dayTe, t, S.muh + 1.8, 0.9, 0.06); rise(dayEn, t, S.muh + 2.2, 0.8, 0.04);
    riseLetters(timeTx, t, S.time, { stagger: 0.1, dur: 1.0, drop: 0.6 }); timeTx.letters.forEach((l, i) => { if (t > S.time + 1.4) l.rotation.y = 0.08 * Math.sin(t * 0.7 + i); });
    rise(timeTe, t, S.time + 1.0, 0.9, 0.05);
    const pk = E.back(span(t, S.venue, S.venue + 0.6)); pin.scale.setScalar(Math.max(0.001, pk)); pin.visible = pk > 0.01;
    rise(v1, t, S.venue + 0.3, 1.0, 0.06); rise(v2, t, S.venue + 1.0, 0.9, 0.05); rise(v3, t, S.venue + 1.6, 0.8, 0.04);
  }

  /* 6 · the arch */
  arch.visible = t > S.hush - 1 && t < S.events + 1.6;
  if (arch.visible) {
    const flash = t >= S.drop ? Math.exp(-(t - S.drop) * 1.2) : 0, open = E.smooth(span(t, S.drop - 0.1, S.drop + 0.9));
    photo.material.opacity = open; photo.material.color.setScalar(1 + 2.2 * flash);
    halo.material.opacity = 0.15 * E.smooth(span(t, S.hush + 0.5, S.drop)) + 0.9 * flash + 0.25 * open; halo.scale.setScalar(1 + 0.6 * flash);
    archMandala.userData.set(t, E.smooth(span(t, S.drop + 0.2, S.drop + 2.2)), 0.05);
    bloom.strength = 0.16 + 0.55 * flash;
    rise(talT, t, S.toss2, 1.0, 0.06);
    riseLetters(cn1, t, S.toss3 + 1.2, { stagger: 0.07 }); riseLetters(cn1.amp, t, S.toss3 + 1.35); riseLetters(cn2, t, S.toss3 + 1.45, { stagger: 0.06 }); rise(cWhen, t, S.toss3 + 2.2, 0.9, 0.04);
    const SLOW = 0.42, GR = 1.6;
    grains.forEach((g, i) => { const p = rice.items[i], dt = (t - g.t0) * SLOW; if (dt <= 0) { p.s = 0; return; }
      p.x = g.x0 + g.vx * dt; p.y = g.y0 + g.vy * dt - 0.5 * GR * dt * dt + 0.05 * Math.sin(t * 2 + g.ph); p.z = g.z0 + g.vz * dt; p.rot = g.ph + g.sp * dt; p.s = g.s; p.r = 1; p.g = 1; p.b = 1; p.a = p.y < -3.6 ? 0 : 1; });
    rice.update();
    pts2.forEach((q, i) => { const p = petals.items[i], k = Math.max(0, t - (S.toss2 + 0.4)); p.x = q.x + q.sw * Math.sin(t * 0.8 + q.ph); p.y = q.y0 - q.v * k; p.z = q.z; p.rot = q.ph + Math.sin(t * 0.9 + q.ph) * 0.9; p.flip = 0.35 + 0.65 * Math.abs(Math.cos(t * 1.2 + q.ph)); p.frame = q.f; p.s = q.s; p.r = p.g = p.b = 1; p.a = k > 0 && p.y > -3.8 ? 1 : 0; });
    petals.update();
  } else bloom.strength = 0.16;

  /* 7 · celebrations */
  ev.visible = t > S.events - 1.5 && t < S.shubham + 1.6;
  if (ev.visible) { rise(evHead, t, S.events + 0.5, 0.9, 0.06); rise(evSub, t, S.events + 0.9, 0.8, 0.04);
    ROWS.forEach((g, i) => { const k = E.out3(span(t, S.events + 1.0 + i * 0.55, S.events + 1.9 + i * 0.55)); g.visible = k > 0.01; g.rotation.x = -1.3 * (1 - k); g.position.z = -0.4 * (1 - k);
      g.traverse(o => { if (o.material) { o.material.transparent = true; o.material.opacity = k * (o.userData.base ?? (o.userData.base = o.material.opacity)); } }); }); }

  /* 8 · శుభం */
  sh.visible = t > S.shubham - 1.5;
  if (sh.visible) { shMandala.userData.set(t, E.smooth(span(t, S.shubham + 0.2, S.shubham + 2)) * (0.6 - 0.3 * E.smooth(span(t, S.note, S.note + 1.2))), 0.05);
    riseLetters(shTx, t, S.shubham + 0.4, { stagger: 0.12, dur: 1.2, drop: 0.6 }); shTx.letters.forEach((l, i) => { if (t > S.shubham + 1.8) l.rotation.y = 0.1 * Math.sin(t * 0.7 + i * 1.3); });
    inv.forEach((l, i) => rise(l, t, S.shubham + 1.2 + i * 0.3, 0.8, 0.05));
    riseLetters(shN1, t, S.shubham + 2.2, { stagger: 0.06 }); riseLetters(shN1.amp, t, S.shubham + 2.32); riseLetters(shN2, t, S.shubham + 2.4, { stagger: 0.05 });
    rise(sign, t, S.shubham + 2.7, 0.8, 0.05); rise(shDate, t, S.shubham + 3.0, 0.8, 0.04);
    note.visible = t > S.note; noteShade.material.opacity = E.smooth(span(t, S.note, S.note + 0.9)); rise(noteH, t, S.note + 0.5, 0.9, 0.05);
    riseLetters(gift1, t, S.note + 0.75, { stagger: 0.08, dur: 1.0 }); riseLetters(gift2, t, S.note + 1.3, { stagger: 0.07, dur: 1.0 }); rise(gift3, t, S.note + 1.9, 0.9, 0.05);
    const rk = E.inOut(span(t, S.note + 2.4, S.note + 3.1)); noteRule.scale.x = Math.max(0.001, rk); noteRule.material.opacity = rk;
    rise(noteEn, t, S.note + 2.7, 0.9, 0.04); rise(noteEn2, t, S.note + 2.95, 0.9, 0.04); }

  { const cz = camera.position.z; PORTALS.forEach((p, i) => { p.rotation.z = t * 0.12 * (i % 2 ? -1 : 1); const d = cz - p.position.z, k = E.smooth(span(d, 15, 7)) * E.smooth(span(d, -2.5, -0.5));
    p.visible = k > 0.003; p.children.forEach(c => { c.material.transparent = true; c.material.opacity = k; }); }); }

  // each scene leaves the moment the camera sets off from it (the keys where its hold ends)
  fadeScene(ttlG, { in: 1, leave: 11.0 }); PEOPLE.forEach(p => fadeScene(p.g, { in: 1, leave: 20.4 })); fadeScene(sky, { leave: 27.8 });
  fadeScene(muh, { in: 1, leave: 38.6 }); fadeScene(arch, { leave: 52.2 }); fadeScene(ev, { in: 1, leave: 58.3 }); fadeScene(sh, { in: 1 }); fadeScene(shMain, { leave: S.note });
};

window.renderAt = renderAt; window.duration = film.duration; window.ready = true;

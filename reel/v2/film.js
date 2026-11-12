/* Pendli Pilupu v2 · style test */
import { THREE, W, H, scene, camera, renderer, film, renderAt, buildEnvironment, goldMat, text3d, riseLetters, setOutlines, label, rise, canvasTex, span, E, lerp, rng, Sprites, focus, track } from './engine.js';

const fonts = [['400 100px Ramabhadra', 'నిఖిత'], ['400 100px Gurajada', 'కుమార్తె'], ['300 100px Jost', 'A'], ['400 100px Jost', 'A'], ['500 100px Jost', 'A']];
await Promise.all(fonts.map(([f, s]) => document.fonts.load(f, s)));
setOutlines(await (await fetch('outlines.json')).json());
buildEnvironment();
document.body.appendChild(renderer.domElement);

// deep red silk far behind, and a warm glow
const silk = canvasTex(1024, 1820, (x, w, h) => {
  const g = x.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, h * 0.75); g.addColorStop(0, '#7a1610'); g.addColorStop(0.55, '#3d0807'); g.addColorStop(1, '#120203');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(255,190,120,.05)'; x.lineWidth = 2; const S = 110;
  for (let r = -1; r < h / S + 1; r++) for (let c = -1; c < w / S + 1; c++) { const cx = c * S + (r % 2 ? S / 2 : 0), cy = r * S * 0.9;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.beginPath(); x.ellipse(cx + Math.cos(a) * 15, cy + Math.sin(a) * 15, 10, 4, a, 0, 6.283); x.stroke(); } }
});
const back = new THREE.Mesh(new THREE.PlaneGeometry(26, 46), new THREE.MeshBasicMaterial({ map: silk })); back.position.z = -12; scene.add(back);

const fam = text3d('family', { size: 0.62, depth: 0.14 }); fam.group.position.set(0, 1.0, 0); scene.add(fam.group);
const ttl = text3d('title', { size: 0.72, depth: 0.18 }); ttl.group.position.set(0, -0.15, 0); scene.add(ttl.group);
const en = label('NIKHITHA  ×  SAI KOUNDINYA', { size: 0.12, ls: 0.3, weight: 500, color: '#f2d28c' }); en.position.set(0, -1.2, 0.1); scene.add(en);

// gold dust with real depth of field
const dot = canvasTex(64, 64, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); });
const dust = new Sprites(500, dot, { additive: true, blur: 1.0 }); scene.add(dust.mesh);
const r = rng(5), motes = Array.from({ length: 500 }, () => ({ x: (r() - 0.5) * 16, y: (r() - 0.5) * 22, z: -9 + r() * 17, s: 0.012 + r() * 0.02, ph: r() * 6, v: 0.05 + r() * 0.15 }));

film.duration = 6;
film.cam = (t) => ({ pos: [Math.sin(t * 0.15) * 1.2, 0.2, 9.5 - t * 0.25], look: [0, 0.1, 0], fov: 38, aperture: 0.09 });
film.update = (t) => {
  riseLetters(fam, t, 0.3, { stagger: 0.09 }); riseLetters(ttl, t, 1.0, { stagger: 0.1, dur: 1.1 });
  [fam, ttl].forEach((x, j) => x.letters.forEach((m, i) => { if (t > 2.5) m.rotation.x += 0.06 * Math.sin(t * 0.8 + i * 0.6 + j); }));
  rise(en, t, 2.0, 1.0, 0.1);
  motes.forEach((m, i) => { const p = dust.items[i]; p.x = m.x + 0.15 * Math.sin(t * 0.4 + m.ph); p.y = m.y + t * m.v; p.z = m.z; p.s = m.s; p.r = 1; p.g = 0.82; p.b = 0.5; p.a = 0.9; });
  dust.update();
};
window.renderAt = renderAt; window.duration = film.duration; window.ready = true;

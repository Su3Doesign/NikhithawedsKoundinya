#!/usr/bin/env node
/* Render the reel frame by frame in headless Chromium and encode with ffmpeg.
   node render.js --out out/x.mp4 [--from 0 --to 42] [--mb 4 --shutter 0.5] [--workers 3]
   node render.js --stills out/st --at 1.2,5,9.5       stills at those seconds
   node render.js --sheet 1.0 --stills out/sheet       a still every N seconds */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const ROOT = path.resolve(__dirname, '..');
const FPS = 30, MB = +arg('mb', 1), SHUTTER = +arg('shutter', 0.5), WORKERS = +arg('workers', 3), Q = +arg('q', 0.93);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.avif': 'image/avif' };
function serve() {
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r);
    }).listen(0, () => res(s));
  });
}
async function openPage(browser, port) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.error('page error:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(`http://localhost:${port}/reel/${arg('page', 'reel.html')}`);
  await page.waitForFunction(() => window.ready || window.failed, null, { timeout: 120000 });
  const failed = await page.evaluate(() => window.failed);
  if (failed) throw new Error(failed);
  return page;
}
const grab = async (page, t) => Buffer.from((await page.evaluate(([t, q]) => renderAt(t, q), [t, Q])).split(',')[1], 'base64');
(async () => {
  const server = await serve(), port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const stills = arg('stills');
    if (stills) {
      fs.mkdirSync(stills, { recursive: true });
      const page = await openPage(browser, port);
      const dur = await page.evaluate(() => window.duration);
      let times = arg('at') ? arg('at').split(',').map(Number) : [];
      if (arg('sheet')) for (let t = 0; t < dur; t += +arg('sheet')) times.push(+t.toFixed(3));
      for (const t of times) fs.writeFileSync(path.join(stills, `t${t.toFixed(2).padStart(6, '0')}.jpg`), await grab(page, t));
      console.log(`${times.length} stills in ${stills}`);
      return;
    }
    const out = arg('out', 'out/reel.mp4'); fs.mkdirSync(path.dirname(out), { recursive: true });
    const probe = await openPage(browser, port); const dur = await probe.evaluate(() => window.duration); await probe.close();
    const f0 = Math.round(+arg('from', 0) * FPS), f1 = Math.round(+arg('to', dur) * FPS);
    const n = f1 - f0, per = Math.ceil(n / WORKERS), chunks = [];
    const started = Date.now(); let done = 0;
    await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
      const a = f0 + w * per, b = Math.min(f1, a + per); if (a >= b) return;
      const file = `${out}.part${w}.mp4`; chunks[w] = file;
      const vf = MB > 1 ? `tmix=frames=${MB}:weights='${Array(MB).fill(1).join(' ')}',select='eq(mod(n\\,${MB})\\,${MB - 1})',setpts=N/${FPS}/TB` : 'null';
      const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS * MB), '-c:v', 'mjpeg', '-i', '-', '-vf', vf, '-r', String(FPS),
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-pix_fmt', 'yuv420p', file], { stdio: ['pipe', 'inherit', 'inherit'] });
      const page = await openPage(browser, port);
      for (let f = a; f < b; f++) {
        for (let k = 0; k < MB; k++) {
          const t = (f + (MB > 1 ? SHUTTER * ((k + 0.5) / MB - 0.5) : 0)) / FPS;
          const buf = await grab(page, Math.max(0, t));
          if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
        }
        if (++done % 30 === 0) { const el = (Date.now() - started) / 1000; console.log(`${done}/${n} frames · ${(el / done * (n - done) / 60).toFixed(1)} min left`); }
      }
      ff.stdin.end(); await new Promise(r => ff.on('close', r)); await page.close();
    }));
    const list = out + '.txt'; fs.writeFileSync(list, chunks.filter(Boolean).map(c => `file '${path.resolve(c)}'`).join('\n'));
    await new Promise(r => spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out], { stdio: 'inherit' }).on('close', r));
    chunks.filter(Boolean).forEach(c => fs.unlinkSync(c)); fs.unlinkSync(list);
    console.log(`wrote ${out} (${n} frames, ${((Date.now() - started) / 60000).toFixed(1)} min)`);
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });

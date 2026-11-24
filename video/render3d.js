// Uso: node render3d.js [--preview t1,t2,...] [--out arquivo.mp4]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const FPS = 30;
const dir = __dirname;
const tl = JSON.parse(fs.readFileSync(path.join(dir, 'build/timeline.json'), 'utf8'));
const tipos = { '.js': 'text/javascript', '.html': 'text/html' };
const PAGE = `<!doctype html><html><body style="margin:0;background:#000">
<canvas id="c" width="1080" height="1920"></canvas>
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>
<script src="/cena.js"></script>
<script type="module" src="/cena3d.js"></script></body></html>`;

const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(PAGE); }
  const f = path.join(dir, u);
  if (!f.startsWith(dir) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': tipos[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('[page]', m.text()); });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(tl => window.__setup(tl), tl);

  const argi = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
  const prev = argi('--preview');
  if (prev) {
    fs.mkdirSync(path.join(dir, 'build/preview3d'), { recursive: true });
    for (const t of prev.split(',').map(Number)) {
      const t0 = Date.now();
      const b64 = await page.evaluate(t => window.__render(t), t);
      fs.writeFileSync(path.join(dir, `build/preview3d/t_${t.toFixed(2).padStart(6, '0')}.jpg`), Buffer.from(b64, 'base64'));
      console.log(`t=${t} ${(Date.now() - t0)}ms`);
    }
  } else {
    const total = Math.ceil(tl.duration * FPS);
    const outFile = argi('--out') || path.join(dir, 'build/video3d_mudo.mp4');
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-r', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = 0; f < total; f++) {
      const b64 = await page.evaluate(t => window.__render(t), f / FPS);
      if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 60 === 0) console.log(`quadro ${f}/${total} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('vídeo ok');
  }
  await browser.close(); server.close();
})();

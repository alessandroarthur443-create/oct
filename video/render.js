// Uso: node render.js [--preview t1,t2,...]  -> renderiza build/video_mudo.mp4 (ou PNGs de prévia)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = 30;
const dir = __dirname;
const tl = JSON.parse(fs.readFileSync(path.join(dir, 'build/timeline.json'), 'utf8'));
const code = fs.readFileSync(path.join(dir, 'cena.js'), 'utf8');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(`<html><body style="margin:0"><canvas id="c" width="1080" height="1920"></canvas>
    <div style="font-family:Inter;font-weight:900">.</div><div style="font-family:Inter;font-weight:800">.</div></body></html>`);
  await page.addScriptTag({ content: code + '\nwindow.__render=(t)=>{const c=document.getElementById("c").getContext("2d");render(c,t);return document.getElementById("c").toDataURL("image/jpeg",0.93).split(",")[1];};' });
  await page.evaluate(tl => setTimeline(tl), tl);
  await page.evaluate(() => document.fonts.ready);

  const prev = process.argv.indexOf('--preview');
  if (prev > 0) {
    const times = process.argv[prev + 1].split(',').map(Number);
    fs.mkdirSync(path.join(dir, 'build/preview'), { recursive: true });
    for (const t of times) {
      const b64 = await page.evaluate(t => window.__render(t), t);
      fs.writeFileSync(path.join(dir, `build/preview/t_${t.toFixed(2)}.jpg`), Buffer.from(b64, 'base64'));
    }
    await browser.close(); return;
  }

  const total = Math.ceil(tl.duration * FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', path.join(dir, 'build/video_mudo.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < total; f++) {
    const b64 = await page.evaluate(t => window.__render(t), f / FPS);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`quadro ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('vídeo ok');
})();

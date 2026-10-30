// Рендер ролика покадрово: node motion/render.js 16x9|9x16 [fps] [from] [to]
// Требует локальный сервер из корня проекта: python3 -m http.server 8765
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const path = require('path');
const fmt = process.argv[2] || '16x9', fps = +(process.argv[3] || 30);
const [W, H] = fmt === '9x16' ? [1080, 1920] : [1920, 1080];
const out = path.join(__dirname, 'out', `mastermind-motion-${fmt}.mp4`);
(async () => {
  require('fs').mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/motion/mastermind.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const dur = await p.evaluate(() => window.MM.duration);
  const from = +(process.argv[4] || 0), to = +(process.argv[5] || dur);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((to - from) * fps);
  for (let i = 0; i < n; i++) {
    const t = from + i / fps;
    await p.evaluate(t => new Promise(r => { window.MM.seek(t); requestAnimationFrame(() => requestAnimationFrame(r)); }), t);
    const buf = await p.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (fps * 5) === 0) console.log(fmt, `${t.toFixed(1)}s / ${to}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('готово:', out, errs.length ? 'ОШИБКИ: ' + errs.join(' | ') : 'без ошибок JS');
  await b.close();
})();

/* Local harness: NODE_PATH may point to a preinstalled Playwright runtime. */
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { build } = require('esbuild');
const { chromium } = require('playwright');

(async () => {
  const root = path.resolve('test-images');
  const output = path.join(root, 'benchmark-results');
  await fs.mkdir(output, { recursive: true });
  const files = [];
  for (const folder of ['Sims Claro', 'Sims liberty']) {
    for (const name of (await fs.readdir(path.join(root, folder))).sort()) {
      if (/\.(jpe?g|png)$/i.test(name)) files.push({ folder, name });
    }
  }
  const bundle = await build({ stdin: { contents: 'export { readEvidenceBarcode } from "./src/modules/shipments/utils/analyze-evidence-image";', resolveDir: process.cwd() }, bundle: true, write: false, format: 'iife', globalName: 'benchmark', platform: 'browser' });
  const server = http.createServer(async (req, res) => {
    try {
      if (req.url === '/bundle.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(bundle.outputFiles[0].contents); return; }
      const match = /^\/image\/(\d+)$/.exec(req.url);
      if (match && files[Number(match[1])]) {
        const f = files[Number(match[1])]; res.setHeader('Content-Type', 'image/jpeg');
        res.end(await fs.readFile(path.join(root, f.folder, f.name))); return;
      }
      res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><body><script src="/bundle.js"></script></body>');
    } catch (e) { res.statusCode = 500; res.end(String(e)); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.BARCODE_CHROME ? { executablePath: process.env.BARCODE_CHROME } : {}) });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const rows = [];
    for (let i = 0; i < Math.min(files.length, Number(process.env.BARCODE_LIMIT) || files.length); i++) {
      const row = await page.evaluate(async ({ i, info }) => {
        const blob = await (await fetch(`/image/${i}`)).blob();
        const file = new File([blob], info.name, { type: blob.type });
        const results = {};
        for (const regions of (i % 2 ? [true, false] : [false, true])) {
          const key = regions ? 'proposed' : 'baseline';
          try { results[key] = await benchmark.readEvidenceBarcode(file, regions); }
          catch (error) { results[key] = { error: String(error) }; }
        }
        return { ...info, ...results };
      }, { i, info: files[i] });
      rows.push(row);
      if (i === 0 && process.env.BARCODE_DEBUG) {
        const crop = await page.evaluate(async r => {
          const bitmap = await createImageBitmap(await (await fetch('/image/0')).blob());
          const angle = -r.angle, c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle));
          const fit = Math.min(1, 1200 / Math.max(r.width * c + r.height * s, r.width * s + r.height * c));
          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil((r.width * c + r.height * s) * fit); canvas.height = Math.ceil((r.width * s + r.height * c) * fit);
          const ctx = canvas.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate(angle);
          ctx.drawImage(bitmap, r.x, r.y, r.width, r.height, -r.width * fit / 2, -r.height * fit / 2, r.width * fit, r.height * fit);
          bitmap.close(); return canvas.toDataURL().split(',')[1];
        }, row.proposed.regions.candidates[0]);
        await fs.writeFile(path.join(output, 'browser-crop.png'), Buffer.from(crop, 'base64'));
      }
      console.log(JSON.stringify({ index: i + 1, file: row.name, baseline: row.baseline.barcode, proposed: row.proposed.barcode, baselineMs: row.baseline.totalMs, proposedMs: row.proposed.totalMs, candidates: row.proposed.regions?.candidates.length }));
      await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ userAgent: await page.evaluate(() => navigator.userAgent), rows }, null, 2));
    }
  } finally { await browser?.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

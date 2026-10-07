/* eslint-disable @typescript-eslint/no-require-imports */
/* Run with NODE_PATH pointing to the bundled Playwright runtime, if needed. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { build } = require('esbuild');
const { chromium } = require('playwright');
const { Code128Reader } = require('@zxing/library');

(async () => {
  const files = [];
  for (const folder of ['Sims Claro', 'Sims liberty']) {
    const names = (await fs.readdir(path.join('test-images', folder))).filter(name => /\.jpe?g$/i.test(name)).sort().slice(0, 15);
    for (const name of names) files.push({ name, folder });
  }
  const bundle = await build({ stdin: { contents: 'export * from "./src/modules/shipments/utils/simple-barcode-batch";', resolveDir: process.cwd() }, bundle: true, write: false, format: 'iife', globalName: 'simpleBarcode', platform: 'browser' });
  const server = http.createServer(async (req, res) => {
    try {
      if (req.url === '/bundle.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(bundle.outputFiles[0].contents); return; }
      const match = /^\/image\/(\d+)$/.exec(req.url);
      if (match && files[Number(match[1])]) {
        const file = files[Number(match[1])];
        res.setHeader('Content-Type', 'image/jpeg');
        res.end(await fs.readFile(path.join('test-images', file.folder, file.name))); return;
      }
      res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><body><script src="/bundle.js"></script></body>');
    } catch (error) { res.statusCode = 500; res.end(String(error)); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.BARCODE_CHROME ? { executablePath: process.env.BARCODE_CHROME } : {}) });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const contract = await page.evaluate(async () => {
      const canvas = document.createElement('canvas'); canvas.width = 100; canvas.height = 80;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 100, 80);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const small = new File([blob], 'blank.png', { type: 'image/png' });
      const phases = [];
      const batch = await simpleBarcode.scanSimpleBarcodeBatch(Array.from({ length: 31 }, (_, i) => ({ id: String(i), file: small })), {
        onProgress: progress => phases.push(progress.phase),
      });
      return { count: batch.rows.length, rows: batch.rows, phases,
        atLimit: simpleBarcode.barcodeImageSettings(1024 * 1024, false, 1200, 800),
        above: simpleBarcode.barcodeImageSettings(1024 * 1024 + 1, false, 4000, 3000),
        hd: simpleBarcode.barcodeImageSettings(1024 * 1024 + 1, true, 4000, 3000),
        leftover: document.querySelectorAll('[id^="barcode-simple-"]').length };
    });
    assert.equal(contract.count, 30);
    assert.deepEqual(contract.atLimit, { scale: 1, quality: 1 });
    assert.deepEqual(contract.above, { scale: 0.4, quality: 0.7 });
    assert.deepEqual(contract.hd, { scale: 0.64, quality: 0.82 });
    assert.equal(contract.leftover, 0);
    assert.deepEqual(contract.phases.slice(0, 30), Array(30).fill('optimizing'));
    assert(contract.phases.slice(30).every(phase => phase === 'scanning'));
    assert(contract.rows.every(row => row.barcode === null && row.originalWidth === 100 && row.optimizedWidth === 100 && row.optimizedHeight === 80 && row.optimizedBytes > 0));
    console.log('PASS: threshold, dimensions, two phases, 30 limit, failed-read continuation, container cleanup');
    const control = await page.evaluate(async patterns => {
      const value = '895000000000000000';
      const pairs = value.match(/../g).map(Number);
      const checksum = (105 + pairs.reduce((sum, pair, i) => sum + pair * (i + 1), 0)) % 103;
      const widths = [105, ...pairs, checksum, 106].flatMap(index => Array.from(patterns[index]));
      const canvas = document.createElement('canvas');
      canvas.width = (widths.reduce((sum, width) => sum + width, 0) + 40) * 3; canvas.height = 200;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black'; let x = 60;
      for (const [i, width] of widths.entries()) { if (i % 2 === 0) ctx.fillRect(x, 20, width * 3, 160); x += width * 3; }
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 1));
      const file = new File([blob], 'control.jpg', { type: 'image/jpeg' });
      const result = await simpleBarcode.scanSimpleBarcodeBatch([
        { id: 'broken', file: new File(['invalid'], 'broken.jpg', { type: 'image/jpeg' }) },
        { id: 'control', file },
      ]);
      const controller = new AbortController(); controller.abort();
      let aborted = false;
      try { await simpleBarcode.scanSimpleBarcodeBatch([{ id: 'cancelled', file }], { signal: controller.signal }); }
      catch (error) { aborted = error.name === 'AbortError'; }
      return { result, aborted, nativeDetectorAvailable: typeof BarcodeDetector !== 'undefined' };
    }, Code128Reader.CODE_PATTERNS.map(pattern => Array.from(pattern)));
    assert.equal(control.result.rows[0].barcode, null);
    assert.match(control.result.rows[0].error, /Optimización/);
    assert.equal(control.result.rows[1].barcode, '895000000000000000');
    assert.equal(control.aborted, true);
    console.log('PASS: exact CODE_128 result, corrupt-file continuation, cancellation; native detector available:', control.nativeDetectorAvailable);
    if (process.env.BARCODE_CONTRACT_ONLY) return;
    const results = [];
    for (const hd of [false, true]) {
      const result = await page.evaluate(async ({ files, hd }) => {
        const inputs = [];
        for (const [i, info] of files.entries()) {
          const blob = await (await fetch(`/image/${i}`)).blob();
          inputs.push({ id: String(i), hd, file: new File([blob], info.name, { type: 'image/jpeg' }) });
        }
        return simpleBarcode.scanSimpleBarcodeBatch(inputs);
      }, { files, hd });
      for (const row of result.rows) {
        const maxSide = hd ? 2560 : 1600;
        const scale = Math.min(1, maxSide / Math.max(row.originalWidth, row.originalHeight));
        assert.equal(row.optimizedWidth, Math.max(1, Math.round(row.originalWidth * scale)));
        assert.equal(row.optimizedHeight, Math.max(1, Math.round(row.originalHeight * scale)));
        if (scale === 1 && row.originalBytes <= 1024 * 1024) {
          assert.equal(row.originalBytes, row.optimizedBytes);
        }
      }
      console.log(JSON.stringify({ mode: hd ? 'HD' : 'Normal', count: result.rows.length, detected: result.rows.filter(row => row.barcode).length, totalMs: result.totalMs }));
      results.push({ hd, ...result });
    }
    await fs.mkdir('test-images/benchmark-results', { recursive: true });
    await fs.writeFile('test-images/benchmark-results/simple-results.json', JSON.stringify({ userAgent: await page.evaluate(() => navigator.userAgent), files, results }, null, 2));
  } finally { await browser?.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

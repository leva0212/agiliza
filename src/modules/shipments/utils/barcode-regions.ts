/** Browser-only, bounded region proposal stage. No assumptions about label position. */
export type BarcodeRegion = { x: number; y: number; width: number; height: number; angle: number; score: number };
export type RegionDiagnostics = {
  detectionMs: number;
  decodeMs: number;
  totalMs: number;
  candidates: BarcodeRegion[];
  attempts: Array<{ candidate: number; width: number; height: number; rotation: number; reader: string; result: string | null; accepted: boolean; ms: number }>;
  error?: string;
};

// Structure tensor: repeated gradients with a common direction indicate parallel bars.
// Connected tiles retain multiple spatially separate proposals at arbitrary orientations.
export function findBarcodeRegions(data: Uint8ClampedArray, width: number, height: number): BarcodeRegion[] {
  const size = 16, cols = Math.ceil(width / size), rows = Math.ceil(height / size);
  const scores = new Float32Array(cols * rows), angles = new Float32Array(cols * rows);
  const gray = new Float32Array(width * height);
  for (let i = 0; i < gray.length; i++) gray[i] = (data[i * 4] * 77 + data[i * 4 + 1] * 150 + data[i * 4 + 2] * 29) / 256;
  for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
    let xx = 0, yy = 0, xy = 0, edges = 0, count = 0;
    for (let y = Math.max(1, ty * size); y < Math.min(height - 1, (ty + 1) * size); y++) {
      for (let x = Math.max(1, tx * size); x < Math.min(width - 1, (tx + 1) * size); x++) {
        const i = y * width + x, gx = gray[i + 1] - gray[i - 1], gy = gray[i + width] - gray[i - width];
        xx += gx * gx; yy += gy * gy; xy += gx * gy;
        if (gx * gx + gy * gy > 625) edges++;
        count++;
      }
    }
    const coherence = Math.hypot(xx - yy, 2 * xy) / (xx + yy + 1);
    const density = edges / Math.max(1, count), index = ty * cols + tx;
    if (coherence > 0.55 && density > 0.16) scores[index] = coherence * density;
    angles[index] = Math.atan2(2 * xy, xx - yy) / 2;
  }
  const visited = new Uint8Array(scores.length), regions: BarcodeRegion[] = [];
  for (let seed = 0; seed < scores.length; seed++) {
    if (!scores[seed] || visited[seed]) continue;
    const queue = [seed]; visited[seed] = 1;
    let minX = cols, maxX = 0, minY = rows, maxY = 0, cx = 0, cy = 0, score = 0;
    for (let head = 0; head < queue.length; head++) {
      const i = queue[head], x = i % cols, y = Math.floor(i / cols);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      score += scores[i]; cx += Math.cos(2 * angles[i]) * scores[i]; cy += Math.sin(2 * angles[i]) * scores[i];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy, n = ny * cols + nx;
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows || visited[n] || !scores[n]) continue;
        if (Math.cos(2 * (angles[n] - angles[seed])) < 0.5) continue;
        visited[n] = 1; queue.push(n);
      }
    }
    if (queue.length < 3) continue;
    // Margin preserves quiet zones and bars lost to glare at the component boundary.
    const pad = Math.max(24, Math.max(maxX - minX + 1, maxY - minY + 1) * size * 0.18);
    const x = Math.max(0, minX * size - pad), y = Math.max(0, minY * size - pad);
    regions.push({ x, y, width: Math.min(width, (maxX + 1) * size + pad) - x,
      height: Math.min(height, (maxY + 1) * size + pad) - y, angle: Math.atan2(cy, cx) / 2, score });
  }
  return regions.sort((a, b) => b.score - a.score).filter((r, i, all) => !all.slice(0, i).some(p => {
    const overlap = Math.max(0, Math.min(r.x + r.width, p.x + p.width) - Math.max(r.x, p.x)) * Math.max(0, Math.min(r.y + r.height, p.y + p.height) - Math.max(r.y, p.y));
    return overlap / Math.min(r.width * r.height, p.width * p.height) > 0.8;
  })).slice(0, 8);
}

export async function readBarcodeRegions(file: File): Promise<{ barcode: string | null; diagnostics: RegionDiagnostics }> {
  const started = performance.now();
  const diagnostics: RegionDiagnostics = { detectionMs: 0, decodeMs: 0, totalMs: 0, candidates: [], attempts: [] };
  let bitmap: ImageBitmap | undefined;
  let barcode: string | null = null;
  try {
    bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const preview = document.createElement('canvas');
    preview.width = Math.max(1, Math.round(bitmap.width * scale)); preview.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = preview.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas unavailable');
    ctx.drawImage(bitmap, 0, 0, preview.width, preview.height);
    const sx = bitmap.width / preview.width, sy = bitmap.height / preview.height;
    diagnostics.candidates = findBarcodeRegions(ctx.getImageData(0, 0, preview.width, preview.height).data, preview.width, preview.height)
      .map(r => ({ ...r, x: r.x * sx, y: r.y * sy, width: r.width * sx, height: r.height * sy }));
    preview.width = preview.height = 1;
    diagnostics.detectionMs = performance.now() - started;
    console.log('[Barcode][Regions] Detection', { file: file.name, ...diagnostics });
    if (!diagnostics.candidates.length) return { barcode, diagnostics };
    const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType, Code128Reader, BitArray }] = await Promise.all([import('@zxing/browser'), import('@zxing/library')]);
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints);
    const rowReader = new Code128Reader();
    const deadline = performance.now() + 2500;
    outer: for (const offset of [0, -6, 6, 90]) {
      for (const [candidate, r] of diagnostics.candidates.entries()) {
        if (performance.now() >= deadline) break outer;
        await new Promise(resolve => setTimeout(resolve, 0));
        const rotation = -r.angle + offset * Math.PI / 180;
        const c = Math.abs(Math.cos(rotation)), s = Math.abs(Math.sin(rotation));
        const fit = Math.min(1, 1200 / Math.max(r.width * c + r.height * s, r.width * s + r.height * c));
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil((r.width * c + r.height * s) * fit);
        canvas.height = Math.ceil((r.width * s + r.height * c) * fit);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas unavailable');
        context.fillStyle = 'white'; context.fillRect(0, 0, canvas.width, canvas.height);
        context.translate(canvas.width / 2, canvas.height / 2); context.rotate(rotation);
        context.drawImage(bitmap, r.x, r.y, r.width, r.height, -r.width * fit / 2, -r.height * fit / 2, r.width * fit, r.height * fit);
        const before = performance.now();
        let result: string | null = null;
        try { result = reader.decodeFromCanvas(canvas).getText().trim().replace(/\s+/g, ''); } catch { /* A failed decode is expected. */ }
        let ms = performance.now() - before, accepted = result !== null && /^895\d{15,16}$/.test(result);
        const attempt = { candidate, width: canvas.width, height: canvas.height, rotation: rotation * 180 / Math.PI, reader: 'ZXing CODE_128', result, accepted, ms };
        diagnostics.decodeMs += ms; diagnostics.attempts.push(attempt);
        console.log('[Barcode][Regions] Decode', { file: file.name, ...attempt });
        // Plastic glare and soft edges can defeat HybridBinarizer. Sample only crop
        // scanlines with several thresholds; ZXing still verifies CODE_128 checksum.
        if (!accepted && performance.now() < deadline) {
          const rowStarted = performance.now();
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          const luminance = new Uint8Array(canvas.width);
          const rowDeadline = Math.min(deadline, rowStarted + 140);
          rows: for (let step = 0; step < Math.ceil(canvas.height * 0.4); step++) {
            if (performance.now() >= rowDeadline) break;
            const y = Math.min(canvas.height - 1, Math.max(0, Math.floor(canvas.height / 2) + (step % 2 ? 1 : -1) * Math.ceil(step / 2) * 2));
            const histogram = new Uint32Array(256);
            for (let x = 0; x < canvas.width; x++) {
              const index = (y * canvas.width + x) * 4;
              const value = (pixels[index] * 77 + pixels[index + 1] * 150 + pixels[index + 2] * 29) >> 8;
              luminance[x] = value; histogram[value]++;
            }
            let low = 0, high = 255, count = 0;
            for (let value = 0; value < 256; value++) {
              count += histogram[value];
              if (count < canvas.width * 0.08) low = value;
              if (count >= canvas.width * 0.85) { high = value; break; }
            }
            if (high - low < 20) continue;
            const thresholds = [0.2, 0.35, 0.5, 0.65].map(factor => low + (high - low) * factor);
            thresholds.push(60, 75, 90, 105, 120, 135, 150, 165, 180);
            for (const threshold of thresholds) {
              const bits = new BitArray(canvas.width);
              for (let x = 0; x < canvas.width; x++) if (luminance[x] < threshold) bits.set(x);
              for (const reverse of [false, true]) {
                if (reverse) bits.reverse();
                try {
                  const value = rowReader.decodeRow(y, bits, hints).getText();
                  if (/^895\d{15,16}$/.test(value)) { result = value; accepted = true; break rows; }
                } catch { /* Try another threshold or scanline. */ }
              }
            }
          }
          ms = performance.now() - rowStarted;
          const rowAttempt = { ...attempt, reader: 'ZXing CODE_128 scanlines', result, accepted, ms };
          diagnostics.decodeMs += ms; diagnostics.attempts.push(rowAttempt);
          console.log('[Barcode][Regions] Decode', { file: file.name, ...rowAttempt });
        }
        canvas.width = canvas.height = 1;
        if (accepted) { barcode = result; break outer; }
      }
    }
  } catch (error) {
    diagnostics.error = String(error);
    console.debug('[Barcode][Regions] Continuing with existing fallback', error);
  } finally {
    bitmap?.close();
    diagnostics.totalMs = performance.now() - started;
    console.log('[Barcode][Regions] Finished', { file: file.name, barcode, candidateCount: diagnostics.candidates.length, ...diagnostics });
  }
  return { barcode, diagnostics };
}

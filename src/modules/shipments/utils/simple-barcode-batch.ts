import { generateId } from "@/shared/utils/generate-id";

/** Browser-only reproduction of the Flutter Web photo pipeline. */
export type BarcodeInput = { id: string; file: File; hd?: boolean };
export type BarcodeMetrics = {
  id: string;
  name: string;
  hd: boolean;
  originalWidth: number | null;
  originalHeight: number | null;
  originalBytes: number;
  optimizedWidth: number | null;
  optimizedHeight: number | null;
  optimizedBytes: number | null;
  optimizationMs: number;
  scanMs: number;
  barcode: string | null;
  error?: string;
};
export type BatchProgress = { phase: 'optimizing' | 'scanning'; completed: number; total: number };

export const MAX_BARCODE_IMAGES = 30;
export const BARCODE_LIMIT_MESSAGE = 'Solo las primeras 30 imágenes serán tomadas en cuenta';

export function barcodeImageSettings(bytes: number, hd = false) {
  return bytes <= 1024 * 1024
    ? { scale: 1, quality: 1 }
    : { scale: hd ? 0.9 : 0.5, quality: hd ? 0.75 : 0.6 };
}

async function optimize(input: BarcodeInput, metrics: BarcodeMetrics): Promise<File> {
  const started = performance.now();
  let bitmap: ImageBitmap | undefined;
  let canvas: HTMLCanvasElement | undefined;
  try {
    bitmap = await createImageBitmap(input.file);
    const { scale, quality } = barcodeImageSettings(input.file.size, input.hd);
    metrics.originalWidth = bitmap.width;
    metrics.originalHeight = bitmap.height;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    metrics.optimizedWidth = width;
    metrics.optimizedHeight = height;
    // Preserve small JPEGs byte-for-byte. Other formats must actually be encoded.
    let blob: Blob = input.file;
    const header = new Uint8Array(await input.file.slice(0, 3).arrayBuffer());
    const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    if (scale !== 1 || !isJpeg) {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('No se pudo preparar la imagen');
      context.fillStyle = 'white';
      context.fillRect(0, 0, width, height);
      context.drawImage(bitmap, 0, 0, width, height);
      blob = await new Promise<Blob>((resolve, reject) => {
        canvas!.toBlob(value => value ? resolve(value) : reject(new Error('No se pudo generar JPEG')), 'image/jpeg', quality);
      });
    }
    const file = new File([blob], `${input.file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' });
    metrics.optimizedBytes = file.size;
    return file;
  } finally {
    bitmap?.close();
    if (canvas) canvas.width = canvas.height = 1;
    metrics.optimizationMs = performance.now() - started;
  }
}

/** One direct attempt; no ICC filter, OCR, timeout race, regions or fallback. */
export async function scanJpegDirect(file: File): Promise<{ barcode: string | null; scanMs: number; error?: string }> {
  const { Html5Qrcode } = await import('html5-qrcode');
  const container = document.createElement('div');
  container.id = `barcode-simple-${generateId()}`;
  container.style.display = 'none';
  document.body.appendChild(container);
  let scanner: InstanceType<typeof Html5Qrcode> | undefined;
  let started = 0;
  let scanMs = 0;
  try {
    scanner = new Html5Qrcode(container.id);
    started = performance.now();
    const barcode = await scanner.scanFile(file, true);
    scanMs = performance.now() - started;
    return { barcode: barcode || null, scanMs };
  } catch (error) {
    scanMs = started ? performance.now() - started : 0;
    return { barcode: null, scanMs, error: String(error) };
  } finally {
    try { await scanner?.clear(); } catch { /* Always remove this attempt's container. */ }
    container.remove();
  }
}

export async function scanSimpleBarcodeBatch(
  inputs: BarcodeInput[],
  options: {
    signal?: AbortSignal;
    onProgress?: (progress: BatchProgress) => void;
    onResult?: (metrics: BarcodeMetrics) => void;
  } = {},
) {
  const started = performance.now();
  const batch = inputs.slice(0, MAX_BARCODE_IMAGES);
  const prepared: Array<{ file: File | null; metrics: BarcodeMetrics }> = [];
  // Phase 1 must complete for the entire batch before any scanFile call.
  for (const input of batch) {
    options.signal?.throwIfAborted();
    options.onProgress?.({ phase: 'optimizing', completed: prepared.length, total: batch.length });
    const metrics: BarcodeMetrics = {
      id: input.id, name: input.file.name, hd: input.hd ?? false,
      originalBytes: input.file.size, originalWidth: null, originalHeight: null,
      optimizedBytes: null, optimizedWidth: null, optimizedHeight: null,
      optimizationMs: 0, scanMs: 0, barcode: null,
    };
    let file: File | null = null;
    try { file = await optimize(input, metrics); }
    catch (error) { metrics.error = `Optimización: ${String(error)}`; }
    prepared.push({ file, metrics });
  }
  const optimizationMs = performance.now() - started;
  const rows: BarcodeMetrics[] = [];
  // Phase 2: sequential decoding, including immediate continuation on failure.
  for (const entry of prepared) {
    options.signal?.throwIfAborted();
    options.onProgress?.({ phase: 'scanning', completed: rows.length, total: batch.length });
    if (entry.file) {
      try { Object.assign(entry.metrics, await scanJpegDirect(entry.file)); }
      catch (error) { entry.metrics.error = String(error); }
    }
    entry.file = null;
    options.signal?.throwIfAborted();
    rows.push(entry.metrics);
    console.info('[Barcode][Flutter Web]', { ...entry.metrics, result: entry.metrics.barcode ?? 'NO DETECTADO' });
    options.onResult?.(entry.metrics);
  }
  options.onProgress?.({ phase: 'scanning', completed: rows.length, total: batch.length });
  const result = { rows, optimizationMs, totalMs: performance.now() - started };
  console.info('[Barcode][Flutter Web] Lote terminado', result);
  return result;
}

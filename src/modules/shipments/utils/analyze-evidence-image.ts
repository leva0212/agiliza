export type EvidenceAnalysisStage =
  | "starting"
  | "barcode-start"
  | "barcode-detected"
  | "barcode-not-detected"
  | "barcode-error"
  | "ocr-start"
  | "ocr-finished"
  | "ocr-error"
  | "finished";

export type EvidenceAnalysisProgress = {
  stage: EvidenceAnalysisStage;
  message: string;
  barcode?: string | null;
  elapsedMs: number;
};

export type EvidenceImageAnalysis = {
  barcode: string | null;
  text: string;
  internalCompanyCode: string | null;
  barcodeMs: number;
  ocrMs: number;
  totalMs: number;
};

class EvidenceAnalysisTimeoutError extends Error {
  constructor(step: string) {
    super(`La ${step} tardó demasiado tiempo.`);
    this.name = "EvidenceAnalysisTimeoutError";
  }
}

function withTimeout<T>(operation: Promise<T>, milliseconds: number, step: string) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new EvidenceAnalysisTimeoutError(step)),
      milliseconds,
    );
  });

  return Promise.race([operation, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function findInternalCompanyCode(text: string) {
  const candidates = text.match(/\b[0Oo][0-9OoIiLl]{2}\b/g) ?? [];

  for (const candidate of candidates) {
    const normalized = candidate
      .replace(/[Oo]/g, "0")
      .replace(/[IiLl]/g, "1");

    if (/^0\d{2}$/.test(normalized)) {
      return normalized;
    }
  }

  return null;
}

async function readBarcode(file: File) {
  const startedAt = performance.now();
  const { Html5Qrcode } = await import("html5-qrcode");

  const elementId =
    `evidence-barcode-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const container = document.createElement("div");

  container.id = elementId;
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "-10000px";
  container.style.width = "1px";
  container.style.height = "1px";
  container.style.overflow = "hidden";
  container.style.pointerEvents = "none";

  document.body.appendChild(container);

  const scanner = new Html5Qrcode(elementId);

  try {
    console.log("[Barcode][Html5Qrcode] Analizando imagen:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const decodedText = await scanner.scanFile(file, true);
    const barcode = decodedText.trim().replace(/\s+/g, "");

    console.log("[Barcode][Html5Qrcode] Código encontrado:", barcode);
    return barcode || null;
  } catch (error) {
    console.log(
      `[Barcode][Html5Qrcode] Sin código después de ${(
        (performance.now() - startedAt) /
        1000
      ).toFixed(2)} segundos`,
    );
    console.debug("[Barcode][Html5Qrcode] Detalle:", error);
    return null;
  } finally {
    try {
      scanner.clear();
    } catch {
      // El contenedor se elimina igualmente.
    }

    container.remove();

    console.log(
      `[Barcode] Tiempo total Html5Qrcode: ${(
        (performance.now() - startedAt) /
        1000
      ).toFixed(2)} segundos`,
    );
  }
}

type TesseractModule = typeof import("tesseract.js");
type TesseractWorker = Awaited<ReturnType<TesseractModule["createWorker"]>>;

let tesseractWorkerPromise: Promise<TesseractWorker> | null = null;
let tesseractQueue: Promise<void> = Promise.resolve();

async function getTesseractWorker() {
  if (!tesseractWorkerPromise) {
    tesseractWorkerPromise = (async () => {
      const startedAt = performance.now();
      const { createWorker, PSM } = await import("tesseract.js");

      const worker = await withTimeout(
        createWorker("eng", undefined, {
          logger: () => undefined,
          errorHandler: () => undefined,
        }),
        20_000,
        "preparación del lector de texto",
      );

      await withTimeout(
        worker.setParameters({
          tessedit_pageseg_mode: PSM.SPARSE_TEXT,
          preserve_interword_spaces: "1",
        }),
        5_000,
        "configuración del lector de texto",
      );

      console.log(
        `[Tesseract] Worker preparado en ${(
          (performance.now() - startedAt) /
          1000
        ).toFixed(2)} segundos`,
      );

      return worker;
    })().catch((error) => {
      tesseractWorkerPromise = null;
      throw error;
    });
  }

  return tesseractWorkerPromise;
}

async function createOcrCanvas(file: File) {
  const bitmap = await createImageBitmap(file);

  try {
    const MAX_SIDE = 2200;
    const longestSide = Math.max(bitmap.width, bitmap.height);
    const scale = longestSide > MAX_SIDE ? MAX_SIDE / longestSide : 1;

    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      throw new Error("No se pudo crear el contexto para preparar la imagen OCR.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      bitmap,
      0,
      0,
      bitmap.width,
      bitmap.height,
      0,
      0,
      width,
      height,
    );

    console.log("[Tesseract] Imagen OCR preparada:", {
      originalWidth: bitmap.width,
      originalHeight: bitmap.height,
      width,
      height,
    });

    return canvas;
  } finally {
    bitmap.close();
  }
}

async function readText(file: File) {
  const previous = tesseractQueue;
  let releaseQueue!: () => void;

  tesseractQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve;
  });

  await previous;

  const startedAt = performance.now();

  try {
    const worker = await getTesseractWorker();
    const recognizeStartedAt = performance.now();
    const canvas = await createOcrCanvas(file);

    const result = await withTimeout(
      worker.recognize(canvas),
      25_000,
      "lectura de texto",
    );

    const text = result.data.text.replace(/\s+/g, " ").trim();

    console.log(
      `[Tesseract] Reconocimiento: ${(
        (performance.now() - recognizeStartedAt) /
        1000
      ).toFixed(2)} segundos`,
    );

    console.log(
      `[Tesseract] TOTAL readText: ${(
        (performance.now() - startedAt) /
        1000
      ).toFixed(2)} segundos`,
    );

    console.log("[Tesseract] Texto:", text);
    return text;
  } catch (error) {
    const workerPromise = tesseractWorkerPromise;
    tesseractWorkerPromise = null;

    if (workerPromise) {
      try {
        const worker = await workerPromise;
        await worker.terminate();
      } catch {
        // Conservamos el error original.
      }
    }

    throw error;
  } finally {
    releaseQueue();
  }
}

/** Analiza localmente una evidencia; no carga la imagen a un servicio externo. */
export async function analyzeEvidenceImage(
  file: File,
  onProgress?: (progress: EvidenceAnalysisProgress) => void,
): Promise<EvidenceImageAnalysis> {
  const analysisStartedAt = performance.now();

  const report = (
    stage: EvidenceAnalysisStage,
    message: string,
    barcode?: string | null,
  ) => {
    onProgress?.({
      stage,
      message,
      barcode,
      elapsedMs: performance.now() - analysisStartedAt,
    });
  };

  console.log("[EvidenceAnalysis] Inicio:", {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  report("starting", "Iniciando análisis");

  let barcode: string | null = null;
  let text = "";
  let internalCompanyCode: string | null = null;
  let barcodeMs = 0;
  let ocrMs = 0;

  const barcodeStartedAt = performance.now();
  report("barcode-start", "Leyendo código de barras");

  try {
    barcode = await withTimeout(
      readBarcode(file),
      15_000,
      "lectura del código de barras",
    );

    barcodeMs = performance.now() - barcodeStartedAt;

    if (barcode) {
      report("barcode-detected", `Código detectado: ${barcode}`, barcode);
    } else {
      report("barcode-not-detected", "No se detectó código de barras", null);
    }
  } catch (error) {
    barcodeMs = performance.now() - barcodeStartedAt;
    const message = error instanceof Error ? error.message : String(error);

    console.warn(
      "[EvidenceAnalysis] La lectura del código de barras falló o agotó el tiempo:",
      error,
    );

    report("barcode-error", `Barcode error: ${message}`, null);
  }

  const ocrStartedAt = performance.now();
  report("ocr-start", "Leyendo texto OCR", barcode);

  try {
    text = await withTimeout(
      readText(file),
      35_000,
      "proceso OCR completo",
    );
    ocrMs = performance.now() - ocrStartedAt;
    internalCompanyCode = findInternalCompanyCode(text);
    report("ocr-finished", "OCR terminado", barcode);
  } catch (error) {
    ocrMs = performance.now() - ocrStartedAt;
    const message = error instanceof Error ? error.message : String(error);

    console.warn("[EvidenceAnalysis] La lectura de texto falló:", error);
    report("ocr-error", `OCR error: ${message}`, barcode);
  }

  const totalMs = performance.now() - analysisStartedAt;

  const result: EvidenceImageAnalysis = {
    barcode,
    text,
    internalCompanyCode,
    barcodeMs,
    ocrMs,
    totalMs,
  };

  report("finished", "Análisis terminado", barcode);

  console.log(
    `[EvidenceAnalysis] PROCESAMIENTO COMPLETO: ${(totalMs / 1000).toFixed(2)} segundos`,
    {
      archivo: file.name,
      milisegundos: Math.round(totalMs),
      barcodeMs: Math.round(barcodeMs),
      ocrMs: Math.round(ocrMs),
    },
  );

  return result;
}

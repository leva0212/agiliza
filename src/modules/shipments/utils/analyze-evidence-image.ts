import { readBarcodeRegions } from "./barcode-regions";

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

function normalizeBarcode(value: string) {
  return value.trim().replace(/\s+/g, "");
}

function isPreferredIccBarcode(value: string) {
  return /^895\d{15,16}$/.test(value);
}

async function createBarcodeCropFile(
  file: File,
  crop: {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
  },
) {
  const bitmap = await createImageBitmap(file);

  try {
    const sx = Math.max(0, Math.round(bitmap.width * crop.x));
    const sy = Math.max(0, Math.round(bitmap.height * crop.y));
    const sw = Math.max(
      1,
      Math.min(bitmap.width - sx, Math.round(bitmap.width * crop.width)),
    );
    const sh = Math.max(
      1,
      Math.min(bitmap.height - sy, Math.round(bitmap.height * crop.height)),
    );

    const MAX_SIDE = 2400;
    const scale = Math.min(1, MAX_SIDE / Math.max(sw, sh));
    const outputWidth = Math.max(1, Math.round(sw * scale));
    const outputHeight = Math.max(1, Math.round(sh * scale));

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("No se pudo preparar el recorte para leer el código.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      bitmap,
      sx,
      sy,
      sw,
      sh,
      0,
      0,
      outputWidth,
      outputHeight,
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("No se pudo generar el recorte del código."));
        },
        "image/jpeg",
        0.95,
      );
    });

    return new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, "")}-${crop.name}.jpg`,
      { type: "image/jpeg" },
    );
  } finally {
    bitmap.close();
  }
}

async function scanBarcodeFile(file: File, label: string) {
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
    console.log(`[Barcode][Html5Qrcode] Intento ${label}:`, {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const decodedText = await scanner.scanFile(file, true);
    const barcode = normalizeBarcode(decodedText);

    console.log(
      `[Barcode][Html5Qrcode] ${label} encontró:`,
      barcode,
    );

    return barcode || null;
  } catch (error) {
    console.debug(
      `[Barcode][Html5Qrcode] ${label} sin resultado:`,
      error,
    );
    return null;
  } finally {
    try {
      scanner.clear();
    } catch {
      // El contenedor se elimina igualmente.
    }

    container.remove();
  }
}

type ImageBarcodeDetector = {
  detect: (source: ImageBitmap) => Promise<Array<{ rawValue: string }>>;
};

type ImageBarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => ImageBarcodeDetector;

async function readBarcodeWithNativeDetector(file: File) {
  const Detector = (
    globalThis as typeof globalThis & {
      BarcodeDetector?: ImageBarcodeDetectorConstructor;
    }
  ).BarcodeDetector;

  if (!Detector) {
    console.log(
      "[Barcode][Native] BarcodeDetector no está disponible; se usará Html5Qrcode.",
    );
    return null;
  }

  const startedAt = performance.now();
  const bitmap = await createImageBitmap(file);

  try {
    const detector = new Detector({
      formats: [
        "code_128",
        "code_39",
        "ean_13",
        "ean_8",
        "upc_a",
        "upc_e",
        "itf",
      ],
    });

    console.log("[Barcode][Native] Analizando imagen completa:", {
      name: file.name,
      width: bitmap.width,
      height: bitmap.height,
    });

    const results = await detector.detect(bitmap);

    const barcodes = Array.from(
      new Set(
        results
          .map((result) => normalizeBarcode(result.rawValue ?? ""))
          .filter(Boolean),
      ),
    );

    console.log("[Barcode][Native] Códigos encontrados:", barcodes);
    console.log(
      `[Barcode][Native] Tiempo: ${(
        (performance.now() - startedAt) /
        1000
      ).toFixed(2)} segundos`,
    );

    const icc = barcodes.find(isPreferredIccBarcode) ?? null;

    if (icc) {
      console.log("[Barcode][Native] ICC correcto encontrado:", icc);
      return icc;
    }

    if (barcodes.length > 0) {
      console.log(
        "[Barcode][Native] Encontró código(s), pero ninguno corresponde al ICC 895 esperado. Se probará Html5Qrcode.",
      );
    }

    return null;
  } catch (error) {
    console.debug(
      "[Barcode][Native] BarcodeDetector no pudo leer la imagen; se probará Html5Qrcode:",
      error,
    );
    return null;
  } finally {
    bitmap.close();
  }
}

async function readBarcodeWithHtml5Qrcode(file: File) {
  const startedAt = performance.now();

  /*
   * Html5Qrcode queda como respaldo.
   * Si encuentra primero un EAN pequeño, no lo aceptamos como ICC:
   * seguimos buscando el 895 en recortes amplios.
   */
  const attempts = [
    { name: "completa", x: 0, y: 0, width: 1, height: 1, original: true },
    { name: "mitad-inferior", x: 0, y: 0.45, width: 1, height: 0.55 },
    { name: "dos-tercios-inferiores", x: 0, y: 0.30, width: 1, height: 0.70 },
    { name: "mitad-superior", x: 0, y: 0, width: 1, height: 0.55 },
    { name: "centro", x: 0.05, y: 0.20, width: 0.90, height: 0.65 },
  ] as const;

  console.log("[Barcode][Html5Qrcode] Iniciando respaldo ICC:", {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  for (const attempt of attempts) {
    try {
      const attemptFile =
        "original" in attempt && attempt.original
          ? file
          : await createBarcodeCropFile(file, attempt);

      const found = await withTimeout(
        scanBarcodeFile(attemptFile, attempt.name),
        4_000,
        `intento de código ${attempt.name}`,
      );

      if (!found) continue;

      if (isPreferredIccBarcode(found)) {
        console.log(
          `[Barcode][Html5Qrcode] ICC correcto encontrado en "${attempt.name}":`,
          found,
        );
        console.log(
          `[Barcode][Html5Qrcode] Tiempo total: ${(
            (performance.now() - startedAt) /
            1000
          ).toFixed(2)} segundos`,
        );
        return found;
      }

      console.log(
        `[Barcode][Html5Qrcode] Código "${found}" rechazado como ICC; continuando búsqueda.`,
      );
    } catch (error) {
      console.debug(
        `[Barcode][Html5Qrcode] Falló intento "${attempt.name}":`,
        error,
      );
    }
  }

  console.log(
    `[Barcode][Html5Qrcode] Sin ICC después de ${(
      (performance.now() - startedAt) /
      1000
    ).toFixed(2)} segundos`,
  );

  return null;
}

export async function readEvidenceBarcode(file: File, useRegions = true) {
  const startedAt = performance.now();
  const regions = useRegions ? await readBarcodeRegions(file) : null;
  const barcode = regions?.barcode ?? await readBarcodeFallback(file);
  const result = { barcode, regions: regions?.diagnostics ?? null, fallbackUsed: !regions?.barcode, totalMs: performance.now() - startedAt };
  console.log("[Barcode] Pipeline", { file: file.name, ...result });
  return result;
}

async function readBarcodeFallback(file: File) {
  const startedAt = performance.now();

  /*
   * PRIMERA OPCIÓN: BarcodeDetector del navegador.
   *
   * Es el mismo motor que usa BarcodeLiveScannerDialog cuando está
   * disponible en Android Chrome. A diferencia de scanFile(), detect()
   * puede devolver varios códigos de una misma imagen, por lo que podemos
   * escoger el ICC 895 aunque también exista un EAN pequeño.
   */
  const nativeBarcode = await withTimeout(
    readBarcodeWithNativeDetector(file),
    5_000,
    "BarcodeDetector nativo",
  ).catch((error) => {
    console.debug("[Barcode][Native] Error/timeout:", error);
    return null;
  });

  if (nativeBarcode) {
    console.log(
      `[Barcode] ICC encontrado con BarcodeDetector en ${(
        (performance.now() - startedAt) /
        1000
      ).toFixed(2)} segundos`,
    );
    return nativeBarcode;
  }

  /*
   * SEGUNDA OPCIÓN: Html5Qrcode.
   *
   * Se conserva como respaldo para navegadores sin BarcodeDetector o
   * imágenes que el detector nativo no pueda resolver.
   */
  const html5Barcode = await readBarcodeWithHtml5Qrcode(file);

  console.log(
    `[Barcode] Tiempo total de búsqueda: ${(
      (performance.now() - startedAt) /
      1000
    ).toFixed(2)} segundos`,
  );

  return html5Barcode;
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
      readEvidenceBarcode(file).then((result) => result.barcode),
      20_000,
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

export type EvidenceImageAnalysis = {
  barcode: string | null;
  text: string;
  internalCompanyCode: string | null;
};

type NativeBarcodeDetector = {
  detect: (source: ImageBitmap) => Promise<Array<{ rawValue: string }>>;
};

type NativeBarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => NativeBarcodeDetector;

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
  const NativeDetector = (globalThis as typeof globalThis & {
    BarcodeDetector?: NativeBarcodeDetectorConstructor;
  }).BarcodeDetector;

  if (NativeDetector) {
    const bitmap = await createImageBitmap(file);

    try {
      const detector = new NativeDetector({
        formats: ["code_128", "code_39", "ean_13", "ean_8", "upc_a", "upc_e", "itf"],
      });
      const result = await detector.detect(bitmap);
      return result[0]?.rawValue.trim() || null;
    } catch {
      return null;
    } finally {
      bitmap.close();
    }
  }

  const { BrowserMultiFormatReader } = await import("@zxing/browser");
  const reader = new BrowserMultiFormatReader();
  const url = URL.createObjectURL(file);

  try {
    const result = await reader.decodeFromImageUrl(url);
    return result.getText().trim() || null;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function readText(file: File) {
  const { createWorker, PSM } = await import("tesseract.js");
  const worker = await createWorker(
    "eng",
    undefined,
    {
      logger: () => undefined,
      errorHandler: () => undefined,
    },
  );

  try {
    // Las fotos de evidencia combinan etiquetas, códigos de barras y texto en
    // distintas posiciones. El modo disperso evita que el OCR intente formar
    // una línea con trazos muy delgados del código de barras.
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      preserve_interword_spaces: "1",
    });
    const result = await worker.recognize(file);
    return result.data.text.replace(/\s+/g, " ").trim();
  } finally {
    await worker.terminate();
  }
}

/** Analiza localmente una evidencia; no carga la imagen a un servicio externo. */
export async function analyzeEvidenceImage(file: File): Promise<EvidenceImageAnalysis> {
  const barcode = await readBarcode(file);

  try {
    const text = await readText(file);
    return {
      barcode,
      text,
      internalCompanyCode: findInternalCompanyCode(text),
    };
  } catch {
    return {
      barcode,
      text: "",
      internalCompanyCode: null,
    };
  }
}

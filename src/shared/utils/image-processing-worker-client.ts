export type WorkerTransformRequest = {
  kind: "transform";
  file: File;
  maxSize: number;
  quality: number;
  preserveSmallJpeg: boolean;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
};

export type WorkerThumbnailRequest = {
  kind: "thumbnail";
  file: File;
  size: number;
  quality: number;
};

export type WorkerImageResult = {
  blob: Blob;
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
  preserved: boolean;
};

type Pending = { resolve: (result: WorkerImageResult) => void; reject: (error: Error) => void };
type WorkerResponse = ({ id: number; ok: true } & WorkerImageResult) | { id: number; ok: false; error: string };

let worker: Worker | null = null;
let nextId = 1;
let idleTerminationTimer: ReturnType<typeof setTimeout> | null = null;
const pending = new Map<number, Pending>();

function scheduleIdleTermination() {
  if (pending.size > 0 || !worker) return;
  if (idleTerminationTimer) clearTimeout(idleTerminationTimer);
  idleTerminationTimer = setTimeout(() => {
    if (pending.size === 0) {
      worker?.terminate();
      worker = null;
    }
    idleTerminationTimer = null;
  }, 1500);
}

function supportsWorkerImageProcessing() {
  return typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined" && typeof createImageBitmap !== "undefined";
}

function getWorker() {
  if (!supportsWorkerImageProcessing()) return null;
  if (idleTerminationTimer) {
    clearTimeout(idleTerminationTimer);
    idleTerminationTimer = null;
  }
  if (worker) return worker;

  worker = new Worker("/workers/image-processing-worker.js");
  worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
    const operation = pending.get(data.id);
    if (!operation) return;
    pending.delete(data.id);
    if (data.ok) operation.resolve(data);
    else operation.reject(new Error(data.error));
    scheduleIdleTermination();
  };
  worker.onerror = (event) => {
    const error = new Error(event.message || "Falló el procesador de imágenes");
    for (const operation of pending.values()) operation.reject(error);
    pending.clear();
    if (idleTerminationTimer) clearTimeout(idleTerminationTimer);
    idleTerminationTimer = null;
    worker?.terminate();
    worker = null;
  };
  return worker;
}

export function processImageOffThread(
  request: WorkerTransformRequest | WorkerThumbnailRequest,
): Promise<WorkerImageResult> | null {
  const imageWorker = getWorker();
  if (!imageWorker) return null;
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    imageWorker.postMessage({ id, request });
  });
}

import { createClient } from "@/lib/supabase/client";

export class UploadAbortedError extends Error {
  constructor() {
    super("La subida fue cancelada.");
    this.name = "UploadAbortedError";
  }
}

type Options = {
  bucket: string;
  path: string;
  file: File;
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new UploadAbortedError();
  }
}

export async function uploadFileWithProgress({
  bucket,
  path,
  file,
  signal,
  onProgress,
}: Options) {
  throwIfAborted(signal);

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("La sesión expiró. Inicie sesión nuevamente.");
  }

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`;

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();

    const cleanup = () => {
      signal?.removeEventListener("abort", abortRequest);
    };

    const abortRequest = () => {
      request.abort();
    };

    request.open("POST", url);
    request.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");
    request.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    request.setRequestHeader("x-upsert", "false");
    request.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      cleanup();

      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }

      reject(new Error("No fue posible subir el archivo al almacenamiento."));
    };

    request.onerror = () => {
      cleanup();
      reject(new Error("Ocurrió un error de red durante la subida."));
    };

    request.onabort = () => {
      cleanup();
      reject(new UploadAbortedError());
    };

    signal?.addEventListener("abort", abortRequest, { once: true });
    request.send(file);
  });
}

export function ensureUploadNotAborted(signal?: AbortSignal) {
  throwIfAborted(signal);
}

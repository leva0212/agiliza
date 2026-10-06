"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";

type NativeBarcodeDetector = {
  detect: (source: ImageBitmap) => Promise<Array<{ rawValue: string }>>;
};

type NativeBarcodeDetectorConstructor = new (options?: { formats?: string[] }) => NativeBarcodeDetector;

type Props = {
  open: boolean;
  onClose: () => void;
  onDetected: (barcodes: string[]) => void;
};

export function BarcodeLiveScannerDialog({ open, onClose, onDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState("Iniciando cámara…");

  useEffect(() => {
    if (!open || !videoRef.current) return;

    let cancelled = false;
    let stream: MediaStream | null = null;
    let timer: number | null = null;
    let controls: { stop: () => void } | null = null;

    const stop = () => {
      if (timer !== null) window.clearTimeout(timer);
      controls?.stop();
      stream?.getTracks().forEach((track) => track.stop());
    };

    const finish = (barcodes: string[]) => {
      if (cancelled) return;
      cancelled = true;
      stop();
      onDetected(barcodes);
    };

    async function startNativeScanner(Detector: NativeBarcodeDetectorConstructor) {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      if (!videoRef.current || cancelled) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setMessage("Apunte al código de barras dentro del recuadro");
      const detector = new Detector({ formats: ["code_128", "code_39", "ean_13", "ean_8", "upc_a", "upc_e", "itf"] });

      const scan = async () => {
        if (cancelled || !videoRef.current) return;
        try {
          const bitmap = await createImageBitmap(videoRef.current);
          const results = await detector.detect(bitmap);
          bitmap.close();
          const barcodes = Array.from(
            new Set(results.map((result) => result.rawValue?.trim()).filter(Boolean)),
          ) as string[];
          if (barcodes.length) {
            finish(barcodes);
            return;
          }
        } catch {
          // Un cuadro sin código es normal mientras la cámara sigue buscando.
        }
        timer = window.setTimeout(scan, 180);
      };
      void scan();
    }

    async function startFallbackScanner() {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      if (!videoRef.current || cancelled) return;
      const reader = new BrowserMultiFormatReader();
      controls = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } }, audio: false },
        videoRef.current,
        (result) => {
          const barcode = result?.getText().trim();
          if (barcode) finish([barcode]);
        },
      );
      setMessage("Apunte al código de barras dentro del recuadro");
    }

    async function start() {
      try {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
          throw new Error("La cámara requiere HTTPS o localhost.");
        }
        const Detector = (globalThis as typeof globalThis & { BarcodeDetector?: NativeBarcodeDetectorConstructor }).BarcodeDetector;
        if (Detector) await startNativeScanner(Detector);
        else await startFallbackScanner();
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "No fue posible abrir la cámara.");
        }
      }
    }

    void start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [onDetected, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center bg-black/85 p-4" role="dialog" aria-modal="true" aria-label="Escanear código de barras">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-black shadow-2xl">
        <video ref={videoRef} muted playsInline className="aspect-3/4 w-full object-cover" />
        <div className="pointer-events-none absolute inset-[17%_10%_25%] rounded-2xl border-4 border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.2)]" />
        <button type="button" onClick={onClose} title="Cerrar lector" aria-label="Cerrar lector" className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white"><X size={21} /></button>
        <div className="absolute inset-x-0 bottom-0 bg-black/75 p-4 text-center text-sm text-white">
          <div className="flex justify-center gap-2 font-semibold"><Camera size={18} /> Escanear código</div>
          <p className="mt-1 text-xs text-white/75">{message}</p>
        </div>
      </div>
    </div>
  );
}

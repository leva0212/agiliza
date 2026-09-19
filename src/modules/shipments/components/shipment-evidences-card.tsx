"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { Camera } from "lucide-react";

import { useShipmentEvidences } from "../hooks/use-shipment-evidences";

import { CachedEvidenceThumbnail } from "./cached-evidence-thumbnail";

const ShipmentEvidencesDialog = dynamic(
  () => import("./shipment-evidences-dialog").then((module) => module.ShipmentEvidencesDialog),
  { ssr: false },
);

type Props = {
  shipmentId: string;

  trackingNumber: string;

};

export function ShipmentEvidencesCard({
  shipmentId,
  trackingNumber,
}: Props) {
  const [galleryOpen, setGalleryOpen] = useState(false);

  const { data: evidences = [] } = useShipmentEvidences(shipmentId);

  const activeEvidences = evidences.filter(
    (evidence) => !evidence.deleted_at,
  );

  return (
    <div className="border rounded-xl p-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setGalleryOpen(true)}
          className="
          font-semibold
          hover:text-blue-600
        "
        >
          📷 Evidencias
        </button>

        <button
          type="button"
          onClick={() => setGalleryOpen(true)}
          className="
          flex
          items-center
          gap-2
          px-3
          py-2
          rounded-lg
          border
          hover:bg-gray-50
        "
        >
          <Camera size={16} />

          <span>Agregar Foto</span>
        </button>
      </div>

      {activeEvidences.length > 0 && (
        <>
          <div
            className="
            grid
            grid-cols-4
            gap-2
            mt-4
          "
          >
            {activeEvidences.slice(0, 8).map((evidence) => (
              <div key={evidence.id} className="relative">
                <button
                  type="button"
                  onClick={() => setGalleryOpen(true)}
                  className="
                  block
                  w-full
                  overflow-hidden
                  rounded-lg
                "
                >
                  <CachedEvidenceThumbnail
                    evidenceId={evidence.id}
                    fileUrl={evidence.file_url}
                    thumbnailUrl={evidence.thumbnail_url}
                    className="
                    w-full
                    aspect-square
                    object-cover
                    border
                    rounded-lg
                  "
                  />
                </button>
              </div>
            ))}
          </div>

          <div
            className="
            text-sm
            text-gray-500
            
          "
          >
            {activeEvidences.length} evidencia
            {activeEvidences.length === 1 ? "" : "s"}
          </div>
        </>
      )}

      <div className="p-4">
        {activeEvidences.length === 0 && (
          <div className="mt-3 text-sm text-gray-500">
            No hay evidencias registradas.
          </div>
        )}
        {galleryOpen && (
          <ShipmentEvidencesDialog
            open
            trackingNumber={trackingNumber}
            onClose={() => setGalleryOpen(false)}
            shipmentId={shipmentId}
          />
        )}
      </div>
    </div>
  );
}

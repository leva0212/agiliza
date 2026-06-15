"use client";

import { useRef, useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Camera, Trash2 } from "lucide-react";

import { createShipmentEvidence } from "../api/create-shipment-evidence";

import { deleteShipmentEvidence } from "../api/delete-shipment-evidence";

import { UiMessage } from "@/shared/components/ui-message";

import { CachedEvidenceImage } from "./cached-evidence-image";

import { useShipmentEvidences } from "../hooks/use-shipment-evidences";

import { CachedEvidenceThumbnail } from "./cached-evidence-thumbnail";
import { ShipmentEvidencesDialog } from "./shipment-evidences-dialog";

type Props = {
  shipmentId: string;

  trackingNumber: string;

  createdBy?: string | null;
};

export function ShipmentEvidencesCard({
  shipmentId,
  trackingNumber,
  createdBy,
}: Props) {
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedEvidenceId, setSelectedEvidenceId] = useState<
    string | undefined
  >();

  const [galleryOpen, setGalleryOpen] = useState(false);

  const { data: evidences = [] } = useShipmentEvidences(shipmentId);

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      createShipmentEvidence({
        shipmentId,

        file,

        createdBy,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["shipment-evidences", shipmentId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShipmentEvidence,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["shipment-evidences", shipmentId],
      });
    },
  });

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
          onClick={() => fileInputRef.current?.click()}
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (!file) {
            return;
          }

          uploadMutation.mutate(file);

          e.target.value = "";
        }}
      />

      {uploadMutation.isPending && (
        <div className="mt-3 text-sm text-gray-500">Subiendo foto...</div>
      )}

      {evidences.length > 0 && (
        <>
          <div
            className="
            grid
            grid-cols-4
            gap-2
            mt-4
          "
          >
            {evidences.slice(0, 8).map((evidence) => (
              <div key={evidence.id} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEvidenceId(evidence.id);

                    setGalleryOpen(true);
                  }}
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
            {evidences.length} evidencia
            {evidences.length === 1 ? "" : "s"}
          </div>
        </>
      )}

      <div className="p-4">
        {evidences.length === 0 && (
          <div className="mt-3 text-sm text-gray-500">
            No hay evidencias registradas.
          </div>
        )}

        <ShipmentEvidencesDialog
          open={galleryOpen}
          trackingNumber={trackingNumber}
          onClose={() => {
            setGalleryOpen(false);

            setSelectedEvidenceId(undefined);
          }}
          shipmentId={shipmentId}
          initialEvidenceId={selectedEvidenceId ?? undefined}
        />
      </div>

      <UiMessage
        open={deleteDialogOpen}
        type="danger"
        title="Eliminar evidencia"
        message={
          <>
            Esta acción eliminará la evidencia permanentemente.
            <br />
            <br />
            ¿Desea continuar?
          </>
        }
        cancelText="Cancelar"
        confirmText="Eliminar"
        onClose={() => {
          setDeleteDialogOpen(false);

          setSelectedEvidenceId(undefined);
        }}
        onConfirm={() => {
          if (!selectedEvidenceId) {
            return;
          }

          deleteMutation.mutate(selectedEvidenceId);

          setDeleteDialogOpen(false);

          setSelectedEvidenceId(undefined);
        }}
      />
    </div>
  );
}

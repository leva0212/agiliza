"use client";

import { useShipmentEvidences } from "../hooks/use-shipment-evidences";

import { CachedEvidenceImage } from "./cached-evidence-image";

import { EvidenceCacheBadge } from "./evidence-cache-badge";

import {
  Camera,
  Image as ImageIcon,
  Trash2,
  FolderDown,
  Share2,
} from "lucide-react";

import { X } from "lucide-react";
import { shareEvidences } from "../services/share-evidences";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentProfile } from "@/modules/auth/hooks/use-current-profile";
import { validateAllShipmentEvidences } from "../api/validate-all-shipment-evidences";
import { toast } from "sonner";
import { useState } from "react";
import { UiMessage } from "@/shared/components/ui-message";
import { updateShipmentEvidenceNotes } from "../api/update-shipment-evidence-notes";

import { reopenShipmentEvidences } from "../api/reopen-shipment-evidences";
import { saveEvidencesToFolder } from "../services/save-evidences-to-folder";

import { EvidenceViewerDialog } from "./evidence-viewer-dialog";

type Props = {
  open: boolean;

  onClose: () => void;

  shipmentId: string;

  initialEvidenceId?: string;

  trackingNumber: string;
};

export function ShipmentEvidencesDialog({
  open,
  onClose,
  shipmentId,
  initialEvidenceId,
  trackingNumber,
}: Props) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const [viewerEvidence, setViewerEvidence] = useState<any>(null);
  const { data: evidences = [] } = useShipmentEvidences(shipmentId);
  const { data: profile } = useCurrentProfile();

  const queryClient = useQueryClient();

  const validateAllMutation = useMutation({
    mutationFn: validateAllShipmentEvidences,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["shipment-evidences", shipmentId],
      });

      toast.success("Evidencias aprobadas");
    },
  });

  const reopenMutation = useMutation({
    mutationFn: reopenShipmentEvidences,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["shipment-evidences", shipmentId],
      });

      toast.success(
        "Revisión reabierta. Las evidencias ya no son visibles para el cliente.",
      );
    },
  });

  const notesMutation = useMutation({
    mutationFn: updateShipmentEvidenceNotes,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["shipment-evidences", shipmentId],
      });

      toast.success("Comentario actualizado");

      setNotesDialogOpen(false);
    },
  });

  const isOwnerCompanyUser = profile?.is_owner_company_user === true;
  const visibleEvidences = isOwnerCompanyUser
    ? evidences
    : evidences.filter(
        (evidence) =>
          evidence.validated ||
          evidence.creator?.company_id === profile?.company_id,
      );

  const hasPendingEvidences = evidences.some((e) => !e.validated);
  const pendingCount = visibleEvidences.filter((e) => !e.validated).length;

  const allReviewed = visibleEvidences.length > 0 && pendingCount === 0;

  const reviewedEvidence = visibleEvidences.find((e) => e.validated);

  const reviewedBy = reviewedEvidence?.validator;

  const reviewedAt = reviewedEvidence?.validated_at;

  const [confirmReviewOpen, setConfirmReviewOpen] = useState(false);

  const [confirmReopenOpen, setConfirmReopenOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);

  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);

  const [notesValue, setNotesValue] = useState("");
  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm px-5 py-1 flex items-center justify-between shadow-sm">
        <div className="mt-2">
          {allReviewed ? (
            <div
              className="
        text-sm
        text-green-700
      "
            >
              🟢 Aprobado por{" "}
              <span className="font-medium">{reviewedBy?.full_name}</span>
              <div className="text-xs text-gray-500">
                {reviewedAt ? new Date(reviewedAt).toLocaleString("es-CR") : ""}
              </div>
            </div>
          ) : (
            <div
              className="
        text-sm
        text-yellow-700
      "
            >
              🟡 {pendingCount} evidencias pendientes
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-3xl mx-auto">
          {/* Toolbar */}
          <div
            className="
  sticky
  top-0
  z-10
  bg-white
  border-b
  px-4
  py-1
  flex
  items-center
  gap-2
"
          >
            <button className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
              <Camera size={18} />
              <span className="hidden sm:inline">Tomar foto</span>
            </button>

            <button className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
              <ImageIcon size={18} />
              <span className="hidden sm:inline">Subir imagen</span>
            </button>

            {isOwnerCompanyUser &&
              (allReviewed ? (
                <button
                  type="button"
                  onClick={() => setConfirmReopenOpen(true)}
                  className="
        flex
        items-center
        gap-2
        px-3
        py-2
        rounded-lg
        bg-amber-600
        text-white
        shadow-sm
        hover:bg-amber-700
      "
                >
                  <span>↩</span>

                  <span className="hidden sm:inline">Reabrir aprobación</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={
                    !hasPendingEvidences || validateAllMutation.isPending
                  }
                  onClick={() => setConfirmReviewOpen(true)}
                  className="
        flex
        items-center
        gap-2
        px-3
        py-2
        rounded-lg
        bg-green-600
        text-white
        shadow-sm
        hover:bg-green-700
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
                >
                  <span>✓</span>

                  <span className="hidden sm:inline">Aprobar evidencias</span>
                </button>
              ))}

            {isMobile ? (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await shareEvidences({
                      trackingNumber,
                      evidences,
                    });

                    toast.success("Evidencias compartidas");
                  } catch (error) {
                    console.error(error);

                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "No fue posible compartir las evidencias",
                      {
                        duration: 7000,
                      },
                    );
                  }
                }}
                className="
      flex
      items-center
      gap-2
      px-3
      py-2
      border
      rounded-lg
      bg-white
      shadow-sm
      text-sm
      font-medium
      text-gray-700
      hover:bg-gray-50
    "
              >
                <Share2 size={18} />

                <span className="hidden sm:inline">Compartir</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await saveEvidencesToFolder({
                      trackingNumber,
                      evidences,
                    });

                    toast.success("Evidencias guardadas");
                  } catch (error) {
                    console.error(error);

                    toast.error("No fue posible guardar las evidencias");
                  }
                }}
                className="
      flex
      items-center
      gap-2
      px-3
      py-2
      border
      rounded-lg
      bg-white
      shadow-sm
      text-sm
      font-medium
      text-gray-700
      hover:bg-gray-50
    "
              >
                <FolderDown size={18} />

                <span className="hidden sm:inline">Guardar archivos</span>
              </button>
            )}

            <button className="ml-auto flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm text-sm font-medium text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
              <Trash2 size={18} />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          </div>

          {/* Evidence list */}
          {evidences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <ImageIcon size={40} className="mb-3 opacity-50" />
              <p className="text-sm">Aún no hay evidencias registradas</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {visibleEvidences.map((evidence) => (
                <div
                  key={evidence.id}
                  className="break-inside-avoid mb-4 border rounded-xl p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-center bg-gray-50 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setViewerEvidence(evidence);

                        setViewerOpen(true);
                      }}
                      className="w-full"
                    >
                      <CachedEvidenceImage
                        evidenceId={evidence.id}
                        shipmentId={evidence.shipment_id}
                        fileUrl={evidence.file_url}
                        className="w-full object-contain rounded-lg"
                      />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <EvidenceCacheBadge evidenceId={evidence.id} />

                      <span className="text-xs text-gray-400">
                        {new Date(evidence.created_at).toLocaleString("es-CR")}
                      </span>
                    </div>

                    {evidence.validated ? (
                      <div
                        className="
        inline-flex
        items-center
        gap-2
        px-2
        py-1
        rounded-full
        bg-green-100
        text-green-700
        text-xs
      "
                      >
                        ✓ Revisada
                      </div>
                    ) : (
                      <div
                        className="
        inline-flex
        items-center
        gap-2
        px-2
        py-1
        rounded-full
        bg-yellow-100
        text-yellow-700
        text-xs
      "
                      >
                        Pendiente de revisión
                      </div>
                    )}
                  </div>

                  <div className="mt-2 space-y-2">
                    <div className="text-xs text-gray-500">
                      Subida por:
                      <span className="font-medium ml-1">
                        {evidence.creator?.full_name ?? "Usuario desconocido"}
                      </span>
                    </div>

                    {evidence.creator?.company && (
                      <div className="text-xs text-gray-500">
                        Empresa:
                        <span className="font-medium ml-1">
                          {evidence.creator.company.name}
                        </span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 leading-relaxed">
                        {evidence.notes?.trim()
                          ? evidence.notes
                          : "Sin comentarios"}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEvidence(evidence);

                          setNotesValue(evidence.notes ?? "");

                          setNotesDialogOpen(true);
                        }}
                        className="
      text-xs
      text-blue-600
      hover:underline
    "
                      >
                        {evidence.notes?.trim()
                          ? "Editar comentario"
                          : "Agregar comentario"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <UiMessage
        open={confirmReviewOpen}
        type="question"
        title="Aprobar evidencias"
        message={
          <>
            Las evidencias serán marcadas como aprobadas y quedarán visibles
            para la empresa cliente.
            <br />
            <br />
            Antes de continuar confirme que:
            <ul className="list-disc ml-5 mt-2">
              <li>Las fotografías son legibles.</li>
              <li>La documentación está completa.</li>
              <li>No existen imágenes incorrectas o duplicadas.</li>
              <li>Los comentarios son correctos.</li>
            </ul>
            <br />
            ¿Desea continuar?
          </>
        }
        cancelText="Cancelar"
        confirmText={
          validateAllMutation.isPending
            ? "Aprobando envidencias..."
            : "Aprobar evidencias"
        }
        onClose={() => setConfirmReviewOpen(false)}
        onConfirm={() => {
          if (!profile?.id) {
            return;
          }

          validateAllMutation.mutate({
            shipmentId,
            profileId: profile.id,
          });

          setConfirmReviewOpen(false);
        }}
      />

      <UiMessage
        open={confirmReopenOpen}
        type="question"
        title="Reabrir revisión"
        message={
          <>
            Las evidencias volverán a estado pendiente y dejarán de ser visibles
            para la empresa cliente.
            <br />
            <br />
            Utilice esta opción únicamente si detectó un error después de haber
            realizado la aprobación.
            <br />
            <br />
            ¿Desea continuar?
          </>
        }
        cancelText="Cancelar"
        confirmText={reopenMutation.isPending ? "Reabriendo..." : "Reabrir"}
        onClose={() => setConfirmReopenOpen(false)}
        onConfirm={() => {
          reopenMutation.mutate(shipmentId);

          setConfirmReopenOpen(false);
        }}
      />
      <UiMessage
        open={notesDialogOpen}
        type="question"
        title="Comentario"
        message={
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            className="
        w-full
        min-h-[140px]
        border
        rounded-lg
        p-3
      "
            placeholder="
Ingrese un comentario...
"
          />
        }
        cancelText="Cancelar"
        confirmText={notesMutation.isPending ? "Guardando..." : "Guardar"}
        onClose={() => {
          if (notesMutation.isPending) {
            return;
          }

          setNotesDialogOpen(false);
        }}
        onConfirm={() => {
          if (!selectedEvidence) {
            return;
          }

          notesMutation.mutate({
            evidenceId: selectedEvidence.id,

            notes: notesValue.trim(),
          });
        }}
      />

      <EvidenceViewerDialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        evidenceId={viewerEvidence?.id ?? ""}
        shipmentId={viewerEvidence?.shipment_id ?? ""}
        fileUrl={viewerEvidence?.file_url ?? ""}
        notes={viewerEvidence?.notes}
      />
    </div>
  );
}

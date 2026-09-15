"use client";

import { useShipmentEvidences } from "../hooks/use-shipment-evidences";

import { CachedEvidenceImage } from "./cached-evidence-image";
import { formatFileSize } from "../utils/format-file-size";

import { EvidenceCacheBadge } from "./evidence-cache-badge";

import { ArrowLeft, Camera, Check, Image as ImageIcon, Trash2, Share2 } from "lucide-react";
import { useRef } from "react";
import { ShipmentEvidenceEditor } from "./evidence-editor/shipment-evidence-editor";

import { createShipmentEvidence } from "../api/create-shipment-evidence";
import { X, Send } from "lucide-react";
import { shareEvidences } from "../services/share-evidences";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentProfile } from "@/modules/auth/hooks/use-current-profile";
import { validateAllShipmentEvidences } from "../api/validate-all-shipment-evidences";
import { toast } from "sonner";
import { useState } from "react";
import { UiMessage } from "@/shared/components/ui-message";
import { updateShipmentEvidenceNotes } from "../api/update-shipment-evidence-notes";
import { deleteShipmentEvidences } from "../api/delete-shipment-evidence";

import { reopenShipmentEvidences } from "../api/reopen-shipment-evidences";
import { saveEvidencesToFolder } from "../services/save-evidences-to-folder";

import { EvidenceViewerDialog } from "./evidence-viewer-dialog";
import { processImage } from "@/shared/utils/process-image";
import {
  ensureUploadNotAborted,
  UploadAbortedError,
} from "../utils/upload-file-with-progress";
import { EvidenceUploadProgressDialog } from "./evidence-upload-progress-dialog";
import {
  createCompressedPendingEvidence,
  type PendingEvidence,
} from "../types/pending-evidence";
type Props = {
  open: boolean;

  onClose: () => void;

  shipmentId: string;

  trackingNumber: string;
};

type EvidenceUploadProgress = {
  currentFileName: string;
  currentFileIndex: number;
  totalFiles: number;
  currentProgress: number;
  totalProgress: number;
  stage: "preparing" | "uploading" | "saving";
};

function getActionErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

export function ShipmentEvidencesDialog({
  open,
  onClose,
  shipmentId,
  trackingNumber,
}: Props) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortControllerRef = useRef<AbortController | null>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [viewerEvidence, setViewerEvidence] = useState<any>(null);
  const { data: evidences = [] } = useShipmentEvidences(shipmentId);
  const hasComments = evidences.some((e) => e.notes?.trim());
  const { data: profile } = useCurrentProfile();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<EvidenceUploadProgress | null>(null);
  const [confirmCancelUploadOpen, setConfirmCancelUploadOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [pendingEvidences, setPendingEvidences] = useState<PendingEvidence[]>(
    [],
  );
  const validateAllMutation = useMutation({
    mutationFn: validateAllShipmentEvidences,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["shipment-evidences", shipmentId],
      });

      toast.success("Evidencias aprobadas");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      isProcessed,
      hd,
      notes,
      signal,
      onProgress,
    }: {
      file: File;
      isProcessed?: boolean;
      hd?: boolean;
      notes?: string;
      signal?: AbortSignal;
      onProgress?: (progress: { stage: "preparing" | "uploading" | "saving"; percent: number }) => void;
      suppressNotifications?: boolean;
    }) => {
      console.log("[UPLOAD MUTATION]", {
        name: file.name,
        type: file.type,
        size: file.size,
        notes,
      });

      return createShipmentEvidence({
        shipmentId,

        file,

        isProcessed,

        hd,

        notes,

        createdBy: profile?.id,

        signal,

        onProgress,
      });
    },

    onSuccess: async (_, variables) => {
      console.log("[UPLOAD SUCCESS]");

      await queryClient.invalidateQueries({
        queryKey: ["shipment-evidences", shipmentId],
      });

      if (!variables.suppressNotifications) {
        toast.success("Evidencia agregada");
      }
    },

    onError: (error, variables) => {
      if (error instanceof UploadAbortedError) {
        return;
      }

      console.error("[UPLOAD ERROR]", error);

      if (!variables.suppressNotifications) {
        toast.error("Error subiendo evidencia");
      }
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

  const activeVisibleEvidences = visibleEvidences.filter(
    (evidence) => !evidence.deleted_at,
  );

  const hasPendingEvidences = activeVisibleEvidences.some(
    (evidence) => !evidence.validated,
  );
  const pendingCount = activeVisibleEvidences.filter(
    (evidence) => !evidence.validated,
  ).length;

  const allReviewed = activeVisibleEvidences.length > 0 && pendingCount === 0;

  const reviewedEvidence = activeVisibleEvidences.find((e) => e.validated);

  const reviewedBy = reviewedEvidence?.validator;

  const reviewedAt = reviewedEvidence?.validated_at;

  const deletableEvidences = visibleEvidences.filter(
    (evidence) =>
      !evidence.deleted_at &&
      evidence.created_by === profile?.id,
  );

  const selectedDeletableEvidenceIds = selectedEvidenceIds.filter(
    (evidenceId) =>
      deletableEvidences.some(
        (evidence) => evidence.id === evidenceId,
      ),
  );

  const [confirmReviewOpen, setConfirmReviewOpen] = useState(false);

  const [confirmReopenOpen, setConfirmReopenOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);

  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);

  const [notesValue, setNotesValue] = useState("");

  const deleteMutation = useMutation({
    mutationFn: deleteShipmentEvidences,

    onSuccess: async ({
      deletedIds,
      storageCleanupFailed,
    }) => {
      await queryClient.invalidateQueries({
        queryKey: ["shipment-evidences", shipmentId],
      });

      setSelectedEvidenceIds([]);
      setSelectionMode(false);
      setViewerOpen(false);
      setShareMenuOpen(false);

      toast.success(
        `${deletedIds.length} archivo(s) marcado(s) como eliminado(s)`,
      );

      if (storageCleanupFailed) {
        toast.warning(
          "El historial se conservó, pero no se pudo limpiar el archivo físico.",
        );
      }
    },

    onError: (error) => {
      console.error("[DELETE EVIDENCES]", error);
      toast.error(
        getActionErrorMessage(
          error,
          "No fue posible eliminar los archivos seleccionados.",
        ),
      );
    },
  });

  const shareMenuItemClass = `
  w-full
  text-left
  px-4
  py-3

  transition-all
  duration-75

  hover:bg-blue-50
  hover:text-blue-700

  active:bg-blue-100
  active:text-blue-800

  active:scale-[0.98]

  focus:bg-blue-100
  focus:outline-none
`;

  async function handleUpload(items: PendingEvidence[]) {
    const controller = new AbortController();
    const completedEvidenceIds: string[] = [];

    uploadAbortControllerRef.current = controller;

    try {
      for (const [index, item] of items.entries()) {
        const updateProgress = (
          currentProgress: number,
          stage: EvidenceUploadProgress["stage"],
        ) => {
          setUploadProgress({
            currentFileName: item.originalFile.name,
            currentFileIndex: index + 1,
            totalFiles: items.length,
            currentProgress: Math.round(currentProgress),
            totalProgress: Math.round(((index + currentProgress / 100) / items.length) * 100),
            stage,
          });
        };

        updateProgress(5, "preparing");

        const file = await processImage(item.originalFile, {
          hd: item.hd,
          rotation: item.rotation,
          flipX: item.flipX,
          flipY: item.flipY,
          cropX: item.cropX,
          cropY: item.cropY,
          cropWidth: item.cropWidth,
          cropHeight: item.cropHeight,
        });

        ensureUploadNotAborted(controller.signal);
        updateProgress(20, "preparing");

        await uploadMutation.mutateAsync({
          file,
          isProcessed: true,
          hd: item.hd,
          notes: item.notes,
          signal: controller.signal,
          onProgress: ({ stage, percent }) => updateProgress(percent, stage),
          suppressNotifications: true,
        });

        completedEvidenceIds.push(item.id);
      }

      await queryClient.invalidateQueries({
        queryKey: ["shipment-evidences", shipmentId],
      });

      toast.success(`${items.length} evidencia(s) subida(s)`);
      setEditorOpen(false);
      setPendingEvidences([]);
    } catch (error) {
      if (error instanceof UploadAbortedError) {
        const remainingEvidences = items.filter(
          (item) => !completedEvidenceIds.includes(item.id),
        );

        setPendingEvidences(remainingEvidences);
        toast.info(
          completedEvidenceIds.length > 0
            ? `Carga cancelada. ${completedEvidenceIds.length} archivo(s) ya se guardaron.`
            : "Carga cancelada.",
        );
      } else {
        console.error(error);
        toast.error("No fue posible subir las evidencias");
      }
    } finally {
      uploadAbortControllerRef.current = null;
      setUploadProgress(null);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);

          if (files.length === 0) {
            return;
          }

          if (files.length > 30) {
            toast.error("Máximo 30 imágenes");

            return;
          }

          (async () => {
            const evidences = await Promise.all(
              files.map(createCompressedPendingEvidence),
            );

            setPendingEvidences(evidences);

            setEditorOpen(true);
          })();

          e.target.value = "";
        }}
      />
      ;
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (!file) {
            return;
          }

          (async () => {
            const evidence = await createCompressedPendingEvidence(file);

            setPendingEvidences([evidence]);

            setEditorOpen(true);
          })();

          setEditorOpen(true);

          e.target.value = "";
        }}
      />
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm px-5 py-1 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Volver"
              title="Volver"
              className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>

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
                  {reviewedAt
                    ? new Date(reviewedAt).toLocaleString("es-CR")
                    : ""}
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
          <div className="max-w-[1000px] mx-auto">
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
              {isMobile && (
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
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
    hover:border-gray-300
    transition-colors
  "
                >
                  <Camera size={18} />

                  <span className="hidden sm:inline">Tomar foto</span>
                </button>
              )}

              <button
                title="Subir imágenes"
                type="button"
                onClick={() => fileInputRef.current?.click()}
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
    hover:border-gray-300
    transition-colors
  "
              >
                <ImageIcon size={18} />

                <span className="hidden sm:inline">Subir imagen</span>
              </button>

              {isOwnerCompanyUser &&
                (allReviewed ? (
                  <button
                    title="Desaprovar evidencias"
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
                    title="Aprobar evidencias"
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

              <div className="relative">
                <button
                  title="Compartir archivos"
                  type="button"
                  disabled={activeVisibleEvidences.length === 0}
                  onClick={() => setShareMenuOpen(!shareMenuOpen)}
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
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
                >
                  <Share2 size={18} />

                  <span className="hidden sm:inline">Compartir</span>
                </button>

                {shareMenuOpen && (
                  <>
                    <div
                      className="
        fixed
        inset-0
        z-[998]
      "
                      onClick={() => setShareMenuOpen(false)}
                    />
                    <div
                      className={`
  absolute
  top-full
  mt-2
  min-w-[320px]
  bg-white
  border
  rounded-xl
  shadow-xl
  overflow-hidden
  z-[999]

  ${isMobile ? "left-[-200px]" : "left-0"}
`}
                    >
                      <button
                        type="button"
                        onClick={async () => {
                          setShareMenuOpen(false);

                          try {
                            await shareEvidences({
                              trackingNumber,
                              evidences: activeVisibleEvidences,
                              includeComments: false,
                            });

                            toast.success("Evidencias compartidas");
                          } catch (error) {
                            console.error(error);

                            if (
                              error instanceof Error &&
                              (error.message.includes("canceled") ||
                                error.message.includes("AbortError"))
                            ) {
                              return;
                            }

                            toast.error(
                              error instanceof Error
                                ? error.message
                                : "No fue posible compartir las evidencias",
                            );
                          }
                        }}
                        className={shareMenuItemClass}
                      >
                        📤 Compartir archivos
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          setShareMenuOpen(false);

                          try {
                            await shareEvidences({
                              trackingNumber,
                              evidences: activeVisibleEvidences,
                              includeComments: true,
                            });

                            toast.success("Evidencias compartidas");
                          } catch (error) {
                            console.error(error);

                            if (
                              error instanceof Error &&
                              (error.message.includes("canceled") ||
                                error.message.includes("AbortError"))
                            ) {
                              return;
                            }

                            toast.error(
                              error instanceof Error
                                ? error.message
                                : "No fue posible compartir las evidencias",
                            );
                          }
                        }}
                        className={shareMenuItemClass}
                      >
                        📝 Compartir archivos + comentarios
                      </button>

                      <div className="border-t" />

                      <button
                        type="button"
                        onClick={async () => {
                          setShareMenuOpen(false);

                          try {
                            await saveEvidencesToFolder({
                              trackingNumber,
                              evidences: activeVisibleEvidences,
                            });

                            toast.success("Evidencias guardadas");
                          } catch (error) {
                            console.error(error);

                            if (
                              error instanceof Error &&
                              (error.message.includes("canceled") ||
                                error.message.includes("AbortError"))
                            ) {
                              return;
                            }

                            toast.error(
                              error instanceof Error
                                ? error.message
                                : "No fue posible guardar las evidencias",
                            );
                          }
                        }}
                        className={shareMenuItemClass}
                      >
                        📁 Guardar archivos
                      </button>
                    </div>
                  </>
                )}
              </div>

              {selectionMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectionMode(false);
                      setSelectedEvidenceIds([]);
                    }}
                    className="ml-auto px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    disabled={
                      selectedDeletableEvidenceIds.length === 0 ||
                      deleteMutation.isPending
                    }
                    onClick={() => setConfirmDeleteOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                    <span>
                      Eliminar ({selectedDeletableEvidenceIds.length})
                    </span>
                  </button>
                </>
              ) : (
                <button
                  title="Eliminar imágenes propias"
                  type="button"
                  disabled={deletableEvidences.length === 0}
                  onClick={() => {
                    if (activeVisibleEvidences.length === 1) {
                      setSelectedEvidenceIds([deletableEvidences[0].id]);
                      setConfirmDeleteOpen(true);
                      return;
                    }

                    setSelectionMode(true);
                  }}
                  className="ml-auto flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm text-sm font-medium text-gray-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">Eliminar</span>
                </button>
              )}
            </div>

            {/* Evidence list */}
            {visibleEvidences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                <ImageIcon size={40} className="mb-3 opacity-50" />
                <p className="text-sm">Aún no hay evidencias registradas</p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                {visibleEvidences.map((evidence) => {
                  const canDelete =
                    !evidence.deleted_at &&
                    evidence.created_by === profile?.id;

                  const isSelected = selectedDeletableEvidenceIds.includes(
                    evidence.id,
                  );

                  if (evidence.deleted_at) {
                    return (
                      <div
                        key={evidence.id}
                        className="break-inside-avoid mb-4 rounded-xl border border-dashed border-red-200 bg-red-50/50 p-4 text-gray-500"
                      >
                        <div className="flex items-center gap-2 font-medium text-gray-700">
                          <Trash2 size={18} />
                          Archivo eliminado
                        </div>
                        <p className="mt-2 text-xs">
                          {evidence.deleted_by_profile?.full_name ?? "Usuario"}{" "}
                          lo eliminó el{" "}
                          {new Date(evidence.deleted_at).toLocaleString("es-CR")}
                        </p>
                        <p className="mt-1 text-xs">
                          Tamaño: {formatFileSize(evidence.file_size)}
                        </p>
                      </div>
                    );
                  }

                  return (
                  <div
                    key={evidence.id}
                    className={`break-inside-avoid relative mb-4 border rounded-xl p-3 bg-white shadow-sm transition-shadow hover:shadow-md ${
                      isSelected ? "ring-2 ring-red-500" : ""
                    }`}
                  >
                    {selectionMode && canDelete && (
                      <label className="absolute right-3 top-3 z-10 flex cursor-pointer items-center gap-2 rounded-full bg-black/45 px-2 py-1 text-xs font-medium text-white shadow">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedEvidenceIds((current) =>
                              current.includes(evidence.id)
                                ? current.filter((id) => id !== evidence.id)
                                : [...current, evidence.id],
                            );
                          }}
                        />
                        <span className="flex size-4 items-center justify-center rounded border border-white/70 bg-white/80 peer-checked:border-red-600 peer-checked:bg-red-600 peer-checked:[&>svg]:block">
                          <Check className="hidden size-3 text-white" strokeWidth={3} />
                        </span>
                        Seleccionar
                      </label>
                    )}
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
                          {new Date(evidence.created_at).toLocaleString(
                            "es-CR",
                          )}
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
                      <div className="text-xs text-gray-500">
                        Tamaño: {formatFileSize(evidence.file_size)}
                      </div>
                    </div>
                  </div>
                  );
                })}
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
              Las evidencias volverán a estado pendiente y dejarán de ser
              visibles para la empresa cliente.
              <br />
              <br />
              Utilice esta opción únicamente si detectó un error después de
              haber realizado la aprobación.
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
          open={confirmDeleteOpen}
          type="danger"
          title="Eliminar archivo"
          message={
            <>
              {selectedDeletableEvidenceIds.length === 1
                ? "Se eliminará 1 archivo."
                : `Se eliminarán ${selectedDeletableEvidenceIds.length} archivos.`}
              <br />
              <br />
              La imagen dejará de estar disponible, pero se conservará el
              mensaje “Archivo eliminado” con el usuario y la fecha para
              mantener el contexto del envío.
              <br />
              <br />
              ¿Desea continuar?
            </>
          }
          cancelText="Cancelar"
          confirmText={
            deleteMutation.isPending
              ? "Eliminando..."
              : "Eliminar"
          }
          onClose={() => {
            if (!deleteMutation.isPending) {
              setConfirmDeleteOpen(false);
            }
          }}
          onConfirm={() => {
            if (selectedDeletableEvidenceIds.length === 0) {
              return;
            }

            deleteMutation.mutate(selectedDeletableEvidenceIds);
            setConfirmDeleteOpen(false);
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

        <ShipmentEvidenceEditor
          open={editorOpen}
          evidences={pendingEvidences}
          onClose={() => {
            setEditorOpen(false);

            setPendingEvidences([]);
          }}
          onUpload={handleUpload}
          isUploading={uploadProgress !== null}
        />

        <EvidenceUploadProgressDialog
          open={uploadProgress !== null}
          currentFileName={uploadProgress?.currentFileName ?? ""}
          currentFileIndex={uploadProgress?.currentFileIndex ?? 0}
          totalFiles={uploadProgress?.totalFiles ?? 0}
          currentProgress={uploadProgress?.currentProgress ?? 0}
          totalProgress={uploadProgress?.totalProgress ?? 0}
          stage={uploadProgress?.stage ?? "preparing"}
          onCancel={() => setConfirmCancelUploadOpen(true)}
        />

        <UiMessage
          open={confirmCancelUploadOpen}
          type="question"
          title="Cancelar carga de archivos"
          message="¿Desea cancelar la subida de archivos? Los archivos ya completados permanecerán guardados."
          cancelText="Continuar subiendo"
          confirmText="Cancelar carga"
          onClose={() => setConfirmCancelUploadOpen(false)}
          onConfirm={() => {
            uploadAbortControllerRef.current?.abort();
            setConfirmCancelUploadOpen(false);
          }}
        />
      </div>
    </>
  );
}

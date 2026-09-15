"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Archive,
  Check,
  Cloud,
  FileAudio,
  FileSpreadsheet,
  FileText,
  HardDrive,
  Pencil,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { generateId } from "@/shared/utils/generate-id";
import { UiMessage } from "@/shared/components/ui-message";
import { useCurrentProfile } from "@/modules/auth/hooks/use-current-profile";
import { createShipmentAttachment } from "../api/create-shipment-attachment";
import { deleteShipmentAttachments } from "../api/delete-shipment-attachments";
import { updateShipmentAttachmentNotes } from "../api/update-shipment-attachment-notes";
import { useShipmentAttachments } from "../hooks/use-shipment-attachments";
import { getAttachmentFormat } from "../utils/get-attachment-format";
import { formatFileSize } from "../utils/format-file-size";
import type {
  PendingShipmentAttachment,
  ShipmentAttachment,
} from "../types/shipment-attachment";
import {
  ensureUploadNotAborted,
  UploadAbortedError,
} from "../utils/upload-file-with-progress";
import { EvidenceUploadProgressDialog } from "./evidence-upload-progress-dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  shipmentId: string;
};

type UploadProgress = {
  currentFileName: string;
  currentFileIndex: number;
  totalFiles: number;
  currentProgress: number;
  totalProgress: number;
  stage: "preparing" | "uploading" | "saving";
};

function getErrorMessage(error: unknown, fallback: string) {
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

function AttachmentThumbnail({ attachment }: { attachment: ShipmentAttachment }) {
  const mimeType = attachment.mime_type ?? "";
  const filename = attachment.original_filename.toLowerCase();

  if (mimeType.startsWith("image/")) {
    return (
      <img
        src={attachment.file_url}
        alt={attachment.original_filename}
        className="h-full w-full object-cover"
      />
    );
  }

  if (mimeType.startsWith("video/")) {
    return <Video className="size-14 text-violet-600" />;
  }

  if (mimeType.startsWith("audio/")) {
    return <FileAudio className="size-14 text-amber-600" />;
  }

  if (mimeType.includes("pdf") || filename.endsWith(".pdf")) {
    return <FileText className="size-14 text-red-600" />;
  }

  if (
    mimeType.includes("spreadsheet") ||
    /\.(xlsx|xls|csv)$/i.test(filename)
  ) {
    return <FileSpreadsheet className="size-14 text-emerald-600" />;
  }

  if (/\.(zip|rar|7z)$/i.test(filename)) {
    return <Archive className="size-14 text-slate-600" />;
  }

  return <FileText className="size-14 text-blue-600" />;
}

export function ShipmentAttachmentsDialog({ open, onClose, shipmentId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();
  const { data: profile } = useCurrentProfile();
  const { data: attachments = [] } = useShipmentAttachments(shipmentId);
  const [pendingAttachments, setPendingAttachments] = useState<
    PendingShipmentAttachment[]
  >([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<ShipmentAttachment | null>(null);
  const [editedNotes, setEditedNotes] = useState("");

  const activeAttachments = attachments.filter((attachment) => !attachment.deleted_at);
  const deletableAttachments = activeAttachments.filter(
    (attachment) => attachment.created_by === profile?.id,
  );
  const selectedDeletableIds = selectedAttachmentIds.filter((attachmentId) =>
    deletableAttachments.some((attachment) => attachment.id === attachmentId),
  );

  const deleteMutation = useMutation({
    mutationFn: deleteShipmentAttachments,
    onSuccess: async ({ deletedIds, storageCleanupFailed }) => {
      await queryClient.invalidateQueries({
        queryKey: ["shipment-attachments", shipmentId],
      });
      setSelectedAttachmentIds([]);
      setSelectionMode(false);
      toast.success(`${deletedIds.length} archivo(s) marcado(s) como eliminado(s)`);

      if (storageCleanupFailed) {
        toast.warning("Se guardó el historial, pero no se pudo limpiar el archivo físico.");
      }
    },
    onError: (error) => {
      console.error("[DELETE ATTACHMENTS]", error);
      toast.error(getErrorMessage(error, "No fue posible eliminar los archivos seleccionados."));
    },
  });

  const notesMutation = useMutation({
    mutationFn: updateShipmentAttachmentNotes,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["shipment-attachments", shipmentId],
      });
      setNotesDialogOpen(false);
      setEditingAttachment(null);
      toast.success("Comentario actualizado");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No fue posible actualizar el comentario."));
    },
  });

  function addFiles(files: File[]) {
    setPendingAttachments((current) => [
      ...current,
      ...files.map((file) => ({
        id: generateId(),
        file,
        notes: "",
      })),
    ]);
  }

  async function uploadPendingAttachments() {
    if (pendingAttachments.length === 0) {
      return;
    }

    const items = pendingAttachments;
    const controller = new AbortController();
    const completedIds: string[] = [];
    abortControllerRef.current = controller;

    try {
      for (const [index, item] of items.entries()) {
        const updateProgress = (
          currentProgress: number,
          stage: UploadProgress["stage"],
        ) => {
          setUploadProgress({
            currentFileName: item.file.name,
            currentFileIndex: index + 1,
            totalFiles: items.length,
            currentProgress: Math.round(currentProgress),
            totalProgress: Math.round(((index + currentProgress / 100) / items.length) * 100),
            stage,
          });
        };

        updateProgress(5, "preparing");
        ensureUploadNotAborted(controller.signal);

        await createShipmentAttachment({
          shipmentId,
          file: item.file,
          notes: item.notes,
          signal: controller.signal,
          onProgress: ({ stage, percent }) => updateProgress(percent, stage),
        });

        completedIds.push(item.id);
      }

      await queryClient.invalidateQueries({
        queryKey: ["shipment-attachments", shipmentId],
      });
      setPendingAttachments([]);
      toast.success(`${items.length} archivo(s) subido(s)`);
    } catch (error) {
      if (error instanceof UploadAbortedError) {
        setPendingAttachments(items.filter((item) => !completedIds.includes(item.id)));
        toast.info(
          completedIds.length > 0
            ? `Carga cancelada. ${completedIds.length} archivo(s) ya se guardaron.`
            : "Carga cancelada.",
        );
      } else {
        console.error("[UPLOAD ATTACHMENTS]", error);
        toast.error(getErrorMessage(error, "No fue posible subir los adjuntos."));
      }
    } finally {
      abortControllerRef.current = null;
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
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) {
            addFiles(files);
          }
          event.target.value = "";
        }}
      />

      <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
        <header className="flex items-center justify-between border-b bg-white px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Volver"
              title="Volver"
              className="rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Adjuntos</h2>
              <p className="text-xs text-slate-500">
                Documentos, audio, video y más.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Cerrar"
            className="rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-5xl space-y-4">
            <section className="flex flex-wrap items-center gap-2 rounded-xl border bg-white p-3 shadow-sm">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Upload size={18} />
                Agregar archivos
              </button>

              {selectionMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectionMode(false);
                      setSelectedAttachmentIds([]);
                    }}
                    className="ml-auto px-3 py-2 text-sm font-medium text-slate-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={selectedDeletableIds.length === 0 || deleteMutation.isPending}
                    onClick={() => setConfirmDeleteOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={17} />
                    Eliminar ({selectedDeletableIds.length})
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={deletableAttachments.length === 0}
                  onClick={() => {
                    if (activeAttachments.length === 1) {
                      setSelectedAttachmentIds([deletableAttachments[0].id]);
                      setConfirmDeleteOpen(true);
                    } else {
                      setSelectionMode(true);
                    }
                  }}
                  className="ml-auto flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={17} />
                  Eliminar
                </button>
              )}
            </section>

            {pendingAttachments.length > 0 && (
              <section className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">Archivos por subir</h3>
                    <p className="text-xs text-slate-600">Agrega un comentario opcional a cada archivo.</p>
                  </div>
                  <button
                    type="button"
                    disabled={uploadProgress !== null}
                    onClick={uploadPendingAttachments}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Subir {pendingAttachments.length}
                  </button>
                </div>

                <div className="space-y-3">
                  {pendingAttachments.map((attachment) => (
                    <div key={attachment.id} className="rounded-lg border bg-white p-3">
                      <div className="flex items-center gap-2">
                        <FileText size={36} className="shrink-0 text-blue-600" />
                        <p className="min-w-0 flex-1 truncate text-sm font-medium" title={attachment.file.name}>
                          {attachment.file.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => setPendingAttachments((current) => current.filter((item) => item.id !== attachment.id))}
                          className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          title="Quitar archivo"
                        >
                          <X size={17} />
                        </button>
                      </div>
                      <textarea
                        value={attachment.notes}
                        maxLength={500}
                        onChange={(event) => setPendingAttachments((current) => current.map((item) => (
                          item.id === attachment.id
                            ? { ...item, notes: event.target.value }
                            : item
                        )))}
                        placeholder="Comentario para este archivo (opcional)"
                        className="mt-2 min-h-16 w-full rounded-lg border p-2 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {attachments.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-white py-16 text-center text-slate-500">
                <FileText className="mx-auto mb-3 size-10 text-slate-300" />
                No hay adjuntos registrados.
              </div>
            ) : (
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {attachments.map((attachment) => {
                  const canDelete = !attachment.deleted_at && attachment.created_by === profile?.id;
                  const canEditNotes =
                    attachment.created_by === profile?.id ||
                    profile?.role === "super_admin";
                  const isSelected = selectedDeletableIds.includes(attachment.id);
                  const format = getAttachmentFormat(
                    attachment.original_filename,
                    attachment.mime_type,
                  );

                  if (attachment.deleted_at) {
                    return (
                      <article key={attachment.id} className="rounded-xl border border-dashed border-red-200 bg-red-50/50 p-4 text-slate-500">
                        <div className="flex items-center gap-2 font-medium text-slate-700">
                          <Trash2 size={18} />
                          Archivo eliminado
                        </div>
                        <p className="mt-2 truncate text-sm" title={attachment.original_filename}>{attachment.original_filename}</p>
                        <p className="mt-1 text-xs">
                          {attachment.deleted_by_profile?.full_name ?? "Usuario"} lo eliminó el {new Date(attachment.deleted_at).toLocaleString("es-CR")}
                        </p>
                        {attachment.storage_provider === "cloudinary" ? (
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                            <span className="flex items-center gap-1"><Cloud size={13} />Cloud: {attachment.optimized_file_size === null ? "Procesando..." : formatFileSize(attachment.optimized_file_size)}</span>
                            <span className="flex items-center gap-1"><HardDrive size={13} />Local: {formatFileSize(attachment.file_size)}</span>
                          </div>
                        ) : <p className="mt-1 text-xs">Tamaño: {formatFileSize(attachment.file_size)}</p>}
                      </article>
                    );
                  }

                  return (
                    <article
                      key={attachment.id}
                      className={`relative overflow-hidden rounded-xl border bg-white shadow-sm ${isSelected ? "ring-2 ring-red-500" : ""}`}
                    >
                      {selectionMode && canDelete && (
                        <label className="absolute right-2 top-2 z-10 flex cursor-pointer items-center gap-2 rounded-full bg-black/45 px-2 py-1 text-xs font-medium text-white shadow">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={isSelected}
                            onChange={() => setSelectedAttachmentIds((current) => (
                              current.includes(attachment.id)
                                ? current.filter((id) => id !== attachment.id)
                                : [...current, attachment.id]
                            ))}
                          />
                          <span className="flex size-4 items-center justify-center rounded border border-white/70 bg-white/80 peer-checked:border-red-600 peer-checked:bg-red-600 peer-checked:[&>svg]:block">
                            <Check className="hidden size-3 text-white" strokeWidth={3} />
                          </span>
                          Seleccionar
                        </label>
                      )}

                      <button
                        type="button"
                        onClick={() => window.open(attachment.file_url, "_blank", "noopener,noreferrer")}
                        className="relative flex h-24 w-full items-center justify-center bg-slate-100"
                        title={`Abrir ${attachment.original_filename}`}
                      >
                        <AttachmentThumbnail attachment={attachment} />
                        <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                          {format.type}
                        </span>
                      </button>

                      <div className="space-y-2 p-3">
                        <p className="truncate text-sm font-semibold text-slate-900" title={attachment.original_filename}>
                          {attachment.original_filename}
                        </p>
                        <div className="flex flex-wrap gap-1.5 text-[11px] font-medium">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                            {format.type}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                            {format.extension}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(attachment.created_at).toLocaleString("es-CR")}
                        </p>
                        <p className="text-xs text-slate-600">
                          Subido por <span className="font-medium">{attachment.creator?.full_name ?? "Usuario desconocido"}</span>
                        </p>
                        {attachment.creator?.company && (
                          <p className="text-xs text-slate-600">
                            Empresa: <span className="font-medium">{attachment.creator.company.trade_name || attachment.creator.company.name}</span>
                          </p>
                        )}
                        <div>
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Comentarios
                            </p>
                            {canEditNotes && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAttachment(attachment);
                                  setEditedNotes(attachment.notes);
                                  setNotesDialogOpen(true);
                                }}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                              >
                                <Pencil size={13} />
                                Editar
                              </button>
                            )}
                          </div>
                          <p className="min-h-5 text-sm text-slate-700">
                            {attachment.notes.trim() || "Sin comentarios"}
                          </p>
                          {attachment.notes_updated_at && (
                            <p className="mt-1 text-xs text-slate-400">
                              Editado el {new Date(attachment.notes_updated_at).toLocaleString("es-CR")}
                            </p>
                          )}
                        </div>
                        {attachment.storage_provider === "cloudinary" ? (
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Cloud size={13} />Cloud: {attachment.optimized_file_size === null ? "Procesando..." : formatFileSize(attachment.optimized_file_size)}</span>
                            <span className="flex items-center gap-1"><HardDrive size={13} />Local: {formatFileSize(attachment.file_size)}</span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">Tamaño: {formatFileSize(attachment.file_size)}</p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </div>
        </main>
      </div>

      <EvidenceUploadProgressDialog
        open={uploadProgress !== null}
        currentFileName={uploadProgress?.currentFileName ?? ""}
        currentFileIndex={uploadProgress?.currentFileIndex ?? 0}
        totalFiles={uploadProgress?.totalFiles ?? 0}
        currentProgress={uploadProgress?.currentProgress ?? 0}
        totalProgress={uploadProgress?.totalProgress ?? 0}
        stage={uploadProgress?.stage ?? "preparing"}
        onCancel={() => setConfirmCancelOpen(true)}
      />

      <UiMessage
        open={confirmCancelOpen}
        type="question"
        title="Cancelar carga de archivos"
        message="¿Desea cancelar la subida de archivos? Los archivos ya completados permanecerán guardados."
        cancelText="Continuar subiendo"
        confirmText="Cancelar carga"
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={() => {
          abortControllerRef.current?.abort();
          setConfirmCancelOpen(false);
        }}
      />

      <UiMessage
        open={notesDialogOpen}
        type="question"
        title="Editar comentario"
        message={
          <textarea
            value={editedNotes}
            maxLength={500}
            onChange={(event) => setEditedNotes(event.target.value)}
            className="min-h-32 w-full rounded-lg border p-3"
            placeholder="Ingrese un comentario..."
          />
        }
        cancelText="Cancelar"
        confirmText={notesMutation.isPending ? "Guardando..." : "Guardar"}
        onClose={() => {
          if (!notesMutation.isPending) {
            setNotesDialogOpen(false);
            setEditingAttachment(null);
          }
        }}
        onConfirm={() => {
          if (!editingAttachment) {
            return;
          }

          notesMutation.mutate({
            attachmentId: editingAttachment.id,
            notes: editedNotes.trim(),
          });
        }}
      />

      <UiMessage
        open={confirmDeleteOpen}
        type="danger"
        title="Eliminar archivo"
        message={
          <>
            {selectedDeletableIds.length === 1
              ? "Se eliminará 1 archivo."
              : `Se eliminarán ${selectedDeletableIds.length} archivos.`}
            <br />
            <br />
            El archivo dejará de estar disponible, pero se conservará el mensaje
            “Archivo eliminado” con usuario y fecha.
            <br />
            <br />
            ¿Desea continuar?
          </>
        }
        cancelText="Cancelar"
        confirmText={deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setConfirmDeleteOpen(false);
          }
        }}
        onConfirm={() => {
          if (selectedDeletableIds.length > 0) {
            deleteMutation.mutate(selectedDeletableIds);
            setConfirmDeleteOpen(false);
          }
        }}
      />
    </>
  );
}

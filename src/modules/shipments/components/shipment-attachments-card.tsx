"use client";

import { useState } from "react";
import {
  Archive,
  FileAudio,
  FileSpreadsheet,
  FileText,
  Paperclip,
  Video,
} from "lucide-react";
import { useShipmentAttachments } from "../hooks/use-shipment-attachments";
import { getAttachmentFormat } from "../utils/get-attachment-format";
import { ShipmentAttachmentsDialog } from "./shipment-attachments-dialog";

type Props = {
  shipmentId: string;
};

function AttachmentCardThumbnail({
  fileUrl,
  filename,
  mimeType,
}: {
  fileUrl: string;
  filename: string;
  mimeType: string | null;
}) {
  const normalizedName = filename.toLowerCase();
  const normalizedMimeType = mimeType ?? "";

  if (normalizedMimeType.startsWith("image/")) {
    return <img src={fileUrl} alt="" className="size-7 object-cover" />;
  }

  if (normalizedMimeType.startsWith("video/")) {
    return <Video size={24} className="text-violet-600" />;
  }

  if (normalizedMimeType.startsWith("audio/")) {
    return <FileAudio size={24} className="text-amber-600" />;
  }

  if (
    normalizedMimeType.includes("spreadsheet") ||
    /\.(xlsx|xls|csv)$/i.test(normalizedName)
  ) {
    return <FileSpreadsheet size={24} className="text-emerald-600" />;
  }

  if (/\.(zip|rar|7z)$/i.test(normalizedName)) {
    return <Archive size={24} className="text-slate-600" />;
  }

  return <FileText size={24} className="text-blue-600" />;
}

export function ShipmentAttachmentsCard({ shipmentId }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: attachments = [] } = useShipmentAttachments(shipmentId);
  const activeAttachments = attachments.filter((attachment) => !attachment.deleted_at);

  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="font-semibold hover:text-blue-600"
        >
          📎 Adjuntos
        </button>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
        >
          <Paperclip size={16} />
          Agregar archivo
        </button>
      </div>

      {activeAttachments.length > 0 ? (
        <>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {activeAttachments.slice(0, 8).map((attachment) => {
              const format = getAttachmentFormat(
                attachment.original_filename,
                attachment.mime_type,
              );

              return (
              <button
                key={attachment.id}
                type="button"
                onClick={() => setDialogOpen(true)}
                title={attachment.original_filename}
                className="flex aspect-square min-w-0 flex-col items-center justify-center rounded-lg border bg-slate-50 p-2 text-slate-600 hover:bg-slate-100"
              >
                <div className="flex items-center gap-1">
                  <AttachmentCardThumbnail
                    fileUrl={attachment.file_url}
                    filename={attachment.original_filename}
                    mimeType={attachment.mime_type}
                  />
                  <span className="rounded bg-slate-200 px-1 py-0.5 text-[9px] font-semibold text-slate-700">
                    {format.type}
                  </span>
                </div>
                <span className="mt-1 w-full truncate text-[10px]">{attachment.original_filename}</span>
                <span className="text-[9px] text-slate-500">{format.extension}</span>
              </button>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {activeAttachments.length} adjunto{activeAttachments.length === 1 ? "" : "s"}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No hay adjuntos registrados.</p>
      )}

      <ShipmentAttachmentsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        shipmentId={shipmentId}
      />
    </div>
  );
}

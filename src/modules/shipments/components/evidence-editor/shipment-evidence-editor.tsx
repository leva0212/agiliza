"use client";

import { useEffect, useState } from "react";

import { X, RotateCw, FlipHorizontal } from "lucide-react";

import type { PendingEvidence } from "../../types/pending-evidence";
import { EvidenceViewerDialog } from "../evidence-viewer-dialog";

type Props = {
  open: boolean;

  evidences: PendingEvidence[];

  onClose: () => void;
};

export function ShipmentEvidenceEditor({ open, evidences, onClose }: Props) {
  const [index, setIndex] = useState(0);

  const [items, setItems] = useState<PendingEvidence[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const current = items[index];
  useEffect(() => {
    if (open) {
      setItems(evidences);

      setIndex(0);
    }
  }, [open, evidences]);

  if (!open || items.length === 0) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        bg-white
        flex
        flex-col
      "
    >
      {/* Header */}

      <div
        className="
          sticky
          top-0
          z-10
          border-b
          bg-white
          px-4
          py-3
          flex
          items-center
          justify-between
        "
      >
        <button
          onClick={onClose}
          className="
            p-2
            rounded-lg
            hover:bg-gray-100
          "
        >
          <X size={20} />
        </button>

        <div
          className="
            text-sm
            font-medium
          "
        >
          {index + 1}/{items.length}
        </div>
      </div>

      {/* Imagen */}

      <div
        className="
          flex-1
          bg-gray-100
          flex
          items-center
          justify-center
          overflow-hidden
        "
      >
        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          className="
    max-w-full
    max-h-full
  "
        >
          <img
            src={current.previewUrl}
            alt=""
            style={{
              transform: `
        rotate(${current.rotation}deg)
        scaleX(
          ${current.flipX ? -1 : 1}
        )
      `,
            }}
            className="
      max-w-full
      max-h-full
      object-contain
    "
          />
        </button>
      </div>

      {/* Herramientas */}

      <div
        className="
          border-t
          p-4
          space-y-4
          bg-white
        "
      >
        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          <label
            className="
              flex
              items-center
              gap-2
            "
          >
            <input
              type="checkbox"
              checked={current.hd}
              onChange={(e) => {
                const copy = [...items];

                copy[index] = {
                  ...copy[index],

                  hd: e.target.checked,
                };

                setItems(copy);
              }}
            />
            HD
          </label>

          <button
            type="button"
            onClick={() => {
              const copy = [...items];

              copy[index] = {
                ...copy[index],

                rotation: copy[index].rotation + 90,
              };

              setItems(copy);
            }}
            className="
              flex
              items-center
              gap-2
              px-3
              py-2
              border
              rounded-lg
            "
          >
            <RotateCw size={18} />
            Rotar
          </button>

          <button
            type="button"
            onClick={() => {
              const copy = [...items];

              copy[index] = {
                ...copy[index],

                flipX: !copy[index].flipX,
              };

              setItems(copy);
            }}
            className="
              flex
              items-center
              gap-2
              px-3
              py-2
              border
              rounded-lg
            "
          >
            <FlipHorizontal size={18} />
            Espejo
          </button>
        </div>

        <textarea
          value={current.notes}
          placeholder="Comentario de la evidencia..."
          rows={3}
          onChange={(e) => {
            const copy = [...items];

            copy[index] = {
              ...copy[index],

              notes: e.target.value,
            };

            setItems(copy);
          }}
          className="
            w-full
            border
            rounded-lg
            p-3
            resize-none
          "
        />
      </div>

      {/* Miniaturas */}

      <div
        className="
          border-t
          bg-white
          p-2
          flex
          gap-2
          overflow-x-auto
        "
      >
        {items.map((evidence, i) => (
          <button
            key={evidence.id}
            type="button"
            onClick={() => setIndex(i)}
            className="
                relative
                shrink-0
              "
          >
            {evidence.hd && (
              <div
                className="
                    absolute
                    top-1
                    right-1
                    bg-blue-600
                    text-white
                    text-[10px]
                    px-1.5
                    py-0.5
                    rounded
                    z-10
                  "
              >
                HD
              </div>
            )}

            <img
              src={evidence.previewUrl}
              alt=""
              className={`
                  w-16
                  h-16
                  object-cover
                  rounded-lg
                  border-2
                  ${i === index ? "border-blue-600" : "border-gray-200"}
                `}
            />
          </button>
        ))}
      </div>

      {/* Footer */}

      <div
        className="
          border-t
          bg-white
          p-4
        "
      >
        <button
          type="button"
          className="
            w-full
            py-3
            rounded-xl
            bg-blue-600
            text-white
            font-medium
          "
        >
          Subir {items.length} imagen
          {items.length === 1 ? "" : "es"}
        </button>
      </div>
      <EvidenceViewerDialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        imageUrl={current.previewUrl}
        notes={current.notes}
      />
    </div>
  );
}

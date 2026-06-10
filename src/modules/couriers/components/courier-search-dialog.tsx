"use client";

import { useEffect, useMemo, useState } from "react";

import { getCouriersOptions } from "../api/get-couriers-options";

type CourierOption = {
  id: string;

  name: string;
};

type Props = {
  open: boolean;

  onClose: () => void;

  onSelect: (courier: CourierOption) => void;
};

export function CourierSearchDialog({
  open,

  onClose,

  onSelect,
}: Props) {
  const [couriers, setCouriers] = useState<CourierOption[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSearch("");

    async function load() {
      try {
        setLoading(true);

        const result = await getCouriersOptions();

        setCouriers(result);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [open]);

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return couriers;
    }

    return couriers.filter((courier) =>
      courier.name

        .toLowerCase()

        .includes(text),
    );
  }, [couriers, search]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/50
        flex
        items-center
        justify-center
        z-50
        p-4
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white
          rounded-3xl
          shadow-xl
          w-full
          max-w-lg
          p-5
          max-h-[80vh]
          overflow-hidden
          flex
          flex-col
        "
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="
            flex
            justify-between
            items-center
            mb-4
          "
        >
          <h2
            className="
              text-lg
              font-semibold
            "
          >
            Buscar mensajero
          </h2>

          <button
            onClick={onClose}
            className="
              text-xl
              px-2
            "
          >
            ✕
          </button>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="
            Buscar por nombre...
          "
          className="
            border
            rounded-lg
            p-3
            w-full
            mb-4
          "
        />

        <div
          className="
            overflow-y-auto
            flex-1
          "
        >
          {loading && (
            <div
              className="
                p-4
                text-center
              "
            >
              Cargando...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div
              className="
                  p-4
                  text-center
                  text-gray-500
                "
            >
              No se encontraron resultados
            </div>
          )}

          {!loading &&
            filtered.map((courier, index) => (
              <div key={courier.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(courier);

                    onClose();
                  }}
                  className="
          w-full
          text-left
          p-3
          hover:bg-blue-50
          transition
        "
                >
                  {courier.name}
                </button>

                {index < filtered.length - 1 && (
                  <div
                    className="
            border-b
            border-gray-200
          "
                  />
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

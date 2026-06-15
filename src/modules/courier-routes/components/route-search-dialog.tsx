"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getRoutesOptions,
} from "@/modules/routes/api/get-routes-options";

import type {
  RouteOption,
} from "@/modules/routes/types/route-option";

type Props = {

  open: boolean;

  onClose: () => void;

  onSelect: (
    route: RouteOption,
  ) => void;

};

export function RouteSearchDialog({

  open,

  onClose,

  onSelect,

}: Props) {

  const [
    routes,
    setRoutes,
  ] = useState<
    RouteOption[]
  >([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  useEffect(() => {

    if (!open) {
      return;
    }

    setSearch("");

    async function load() {

      try {

        setLoading(
          true,
        );

        const result =
          await getRoutesOptions();

        setRoutes(
          result,
        );

      } finally {

        setLoading(
          false,
        );

      }

    }

    load();

  }, [open]);

  const filtered =
    useMemo(() => {

      const text =
        search
          .trim()
          .toLowerCase();

      if (!text) {

        return routes;

      }

      return routes.filter(

        (
          route,
        ) =>

          route.name

            .toLowerCase()

            .includes(
              text,
            ),

      );

    }, [

      routes,

      search,

    ]);

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
        onClick={(e) =>
          e.stopPropagation()
        }
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
            Buscar ruta
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
          onChange={(e) =>
            setSearch(
              e.target.value,
            )
          }
          placeholder="
            Buscar ruta...
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

          {!loading &&
            filtered.map(
              (
                route,
                index,
              ) => (

                <div
                  key={
                    route.id
                  }
                >

                  <button
                    type="button"
                    onClick={() => {

                      onSelect(
                        route,
                      );

                      onClose();

                    }}
                    className="
                      w-full
                      text-left
                      p-3
                      rounded-lg
                      hover:bg-blue-50
                    "
                  >

                    {
                      route.name
                    }

                  </button>

                  {index <
                    filtered.length - 1 && (

                    <div
                      className="
                        border-b
                        border-gray-200
                      "
                    />

                  )}

                </div>

              ),
            )}

        </div>

      </div>

    </div>

  );

}
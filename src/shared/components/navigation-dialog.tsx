"use client";

import {
    MapPin,
    Navigation,
    Copy,
    Apple,
} from "lucide-react";

import { toast } from "sonner";

type Props = {
    open: boolean;

    googleMaps: string;

    waze: string;

    coordinates?: string;

    onClose: () => void;
};

export function NavigationDialog({
    open,
    googleMaps,
    waze,
    coordinates,
    onClose,
}: Props) {

    if (!open) return null;

    const isIOS =
        typeof navigator !== "undefined" &&
        /iPhone|iPad|iPod/i.test(
            navigator.userAgent
        );

    const isAndroid =
        typeof navigator !== "undefined" &&
        /Android/i.test(
            navigator.userAgent
        );

    const isDesktop =
        !isIOS && !isAndroid;

    function openAppleMaps() {

        if (!coordinates) {
            toast.error(
                "Coordenadas no disponibles"
            );

            return;
        }

        const [lat, lng] =
            coordinates
                .split(",")
                .map(
                    (x) =>
                        x.trim()
                );

        window.location.href =
            `maps://maps.apple.com/?q=${lat},${lng}`;
    }

    return (

        <div
            className="
      fixed
      inset-0
      z-[60]
      bg-black/40
      backdrop-blur-sm
      flex
      items-center
      justify-center
      p-4
    "
            onClick={(e) => {

                if (
                    e.target ===
                    e.currentTarget
                ) {

                    onClose();

                }

            }}
        >

            <div
                className="
        w-full
        max-w-md
        bg-gradient-to-b
        from-white
        to-sky-50
        rounded-3xl
        shadow-2xl
        border
        border-sky-200
        p-6
      "
            >

                <div className="mb-6">

                    <div
                        className="
            inline-flex
            items-center
            gap-2
            px-3
            py-1
            rounded-full
            bg-sky-100
            text-sky-700
            text-xs
            font-semibold
            mb-3
          "
                    >
                        🚚 Agiliza Navegación
                    </div>

                    <h2
                        className="
            font-bold
            text-xl
            text-blue-900
          "
                    >
                        Abrir ubicación
                    </h2>

                    <p
                        className="
            text-sm
            text-slate-600
          "
                    >
                        Seleccione una opción
                    </p>

                </div>

                <div className="space-y-3">

                    {/* GOOGLE */}

                    <button
                        onClick={() => {

                            window.open(
                                googleMaps,
                                "_blank"
                            );

                            onClose();

                        }}

                        className="
            w-full
            rounded-2xl
            border
            border-sky-200
            bg-white
            p-4
            flex
            items-center
            gap-4
            hover:bg-sky-50
            hover:border-sky-400
            hover:shadow-md
            transition-all
          "
                    >

                        <MapPin
                            size={22}
                            className="text-blue-700"
                        />

                        <div className="text-left">

                            <div className="font-semibold text-blue-900">

                                Google Maps

                            </div>

                            <div className="text-xs text-slate-500">

                                Abrir ubicación

                            </div>

                        </div>

                    </button>


                    {/* WAZE */}

                    <button
                        disabled={isDesktop}
                        onClick={() => {

                            window.open(
                                waze,
                                "_blank"
                            );

                            onClose();

                        }
                        }
                        className="
            w-full
            rounded-2xl
            border
            border-sky-200
            bg-white
            p-4
            flex
            items-center
            gap-4
            hover:bg-sky-50
            hover:border-sky-400
            hover:shadow-md
            transition-all
            disabled:opacity-40
          "
                    >

                        <Navigation
                            size={22}
                            className="text-sky-600"
                        />

                        <div className="text-left">

                            <div className="font-semibold text-blue-900">

                                Waze

                            </div>

                            <div className="text-xs text-slate-500">

                                Navegación paso a paso

                            </div>

                        </div>

                    </button>


                    {/* APPLE */}

                    {isIOS && (

                        <button
                            onClick={() => {

                                openAppleMaps();

                                onClose();

                            }}
                            className="
            w-full
            rounded-2xl
            border
            border-sky-200
            bg-white
            p-4
            flex
            items-center
            gap-4
            hover:bg-sky-50
            hover:border-sky-400
            hover:shadow-md
            transition-all
          "
                        >

                            <Apple
                                size={22}
                                className="text-slate-700"
                            />

                            <div className="text-left">

                                <div className="font-semibold text-blue-900">

                                    Apple Maps

                                </div>

                                <div className="text-xs text-slate-500">

                                    Navegación integrada iPhone

                                </div>

                            </div>

                        </button>

                    )}


                    {/* COPIAR */}

                    <button
                        onClick={async () => {

                            if (
                                !coordinates
                            ) {

                                toast.error(
                                    "Coordenadas no disponibles"
                                );

                                return;
                            }

                            await navigator.clipboard.writeText(
                                coordinates
                            );

                            toast.success(
                                "Coordenadas copiadas"
                            );
                            onClose();

                        }}
                        className="
            w-full
            rounded-2xl
            border
            border-sky-200
            bg-white
            p-4
            flex
            items-center
            gap-4
            hover:bg-sky-50
            hover:border-sky-400
            hover:shadow-md
            transition-all
          "
                    >

                        <Copy
                            size={22}
                            className="text-blue-700"
                        />

                        <div className="text-left">

                            <div className="font-semibold text-blue-900">

                                Copiar coordenadas

                            </div>

                            <div className="text-xs text-slate-500">

                                Copiar al portapapeles

                            </div>

                        </div>

                    </button>

                </div>

                <button
                    onClick={onClose}
                    className="
          mt-6
          w-full
          bg-gradient-to-r
          from-blue-900
          to-sky-600
          text-white
          font-medium
          py-3
          rounded-2xl
        "
                >
                    Cerrar
                </button>

            </div>

        </div>

    );

}
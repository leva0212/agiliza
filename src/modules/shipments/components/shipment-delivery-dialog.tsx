"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CircleDollarSign,
  LoaderCircle,
  LocateFixed,
  MapPin,
  PackageCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { NavigationDialog } from "@/shared/components/navigation-dialog";
import { getDeliveryCouriers } from "../api/get-delivery-couriers";
import type { CompleteShipmentDeliveryInput } from "../api/complete-shipment-delivery";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Props = {
  open: boolean;
  shipmentId: string;
  currentUserId?: string;
  assignedDepositAmount: number;
  assignedShippingFee: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (input: CompleteShipmentDeliveryInput) => void;
};

function formatCoordinates(coordinates: Coordinates) {
  return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
}

export function ShipmentDeliveryDialog({
  open,
  shipmentId,
  currentUserId,
  assignedDepositAmount,
  assignedShippingFee,
  isSubmitting,
  onCancel,
  onConfirm,
}: Props) {
  const [deliveredBy, setDeliveredBy] = useState("");
  const [receiverType, setReceiverType] = useState<"owner" | "authorized">(
    "owner",
  );
  const [depositAmount, setDepositAmount] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [observations, setObservations] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [locationError, setLocationError] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);

  const couriersQuery = useQuery({
    queryKey: ["delivery-couriers"],
    queryFn: getDeliveryCouriers,
    enabled: open,
    staleTime: 1000 * 60 * 5,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("Este dispositivo no permite obtener la ubicación GPS.");
      return;
    }

    setLocationStatus("loading");
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("success");
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Permita el acceso a la ubicación para confirmar la entrega."
            : "No fue posible obtener la ubicación. Intente nuevamente.";

        setCoordinates(null);
        setLocationStatus("error");
        setLocationError(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 0,
      },
    );
  }, []);

  useEffect(() => {
    if (!open) {
      setDeliveredBy("");
      setCoordinates(null);
      setLocationStatus("idle");
      setLocationError("");
      setNavigationOpen(false);
      return;
    }

    setObservations("");
    setReceiverType("owner");
    setDepositAmount(String(assignedDepositAmount));
    setShippingFee(String(assignedShippingFee));
    requestLocation();
  }, [assignedDepositAmount, assignedShippingFee, open, requestLocation]);

  useEffect(() => {
    if (!open || deliveredBy || !couriersQuery.data) {
      return;
    }

    const currentUserCanDeliver = couriersQuery.data.some(
      (courier) => courier.profile_id === currentUserId,
    );

    if (currentUserCanDeliver && currentUserId) {
      const currentCourier = couriersQuery.data.find(
        (courier) => courier.profile_id === currentUserId,
      );
      setDeliveredBy(currentCourier?.id ?? "");
    }
  }, [couriersQuery.data, currentUserId, deliveredBy, open]);

  const navigationLinks = useMemo(() => {
    if (!coordinates) {
      return null;
    }

    const value = formatCoordinates(coordinates);
    return {
      coordinates: value,
      googleMaps: `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`,
      waze: `https://waze.com/ul?ll=${coordinates.latitude},${coordinates.longitude}&navigate=yes`,
    };
  }, [coordinates]);

  if (!open) {
    return null;
  }

  const submit = () => {
    if (!deliveredBy) {
      toast.error("Seleccione quién realizó la entrega.");
      return;
    }

    if (!coordinates) {
      toast.error("Debe obtener la ubicación GPS antes de marcar como entregado.");
      return;
    }

    const parsedDeposit = Number(depositAmount || 0);
    const parsedShippingFee = Number(shippingFee || 0);

    if (
      !Number.isFinite(parsedDeposit) ||
      !Number.isFinite(parsedShippingFee) ||
      parsedDeposit < 0 ||
      parsedShippingFee < 0
    ) {
      toast.error("Los montos deben ser números iguales o mayores que cero.");
      return;
    }

    onConfirm({
      shipmentId,
      deliveredBy,
      receiverType,
      depositAmount: assignedDepositAmount > 0 ? parsedDeposit : 0,
      shippingFee: assignedShippingFee > 0 ? parsedShippingFee : 0,
      observations: observations.trim(),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-3 backdrop-blur-sm sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delivery-dialog-title"
      >
        <div className="my-auto w-full max-w-lg rounded-3xl border border-emerald-200 bg-white p-4 shadow-2xl dark:border-emerald-700/70 dark:bg-slate-900 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <PackageCheck size={24} />
              </div>
              <div>
                <h2 id="delivery-dialog-title" className="text-lg font-bold">
                  Confirmar entrega
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Complete los datos antes de marcar el envío como entregado.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              aria-label="Cancelar confirmación de entrega"
              title="Cancelar"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="delivery-courier" className="mb-1 block text-sm font-semibold">
                Entregado por
              </label>
              <select
                id="delivery-courier"
                value={deliveredBy}
                onChange={(event) => setDeliveredBy(event.target.value)}
                disabled={couriersQuery.isLoading || isSubmitting}
              >
                <option value="">
                  {couriersQuery.isLoading
                    ? "Cargando usuarios..."
                    : "Seleccione un usuario"}
                </option>
                {(couriersQuery.data ?? []).map((courier) => (
                  <option key={courier.id} value={courier.id}>
                    {courier.full_name}
                  </option>
                ))}
              </select>
              {couriersQuery.isError && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {couriersQuery.error.message}
                </p>
              )}
              {!couriersQuery.isLoading &&
                !couriersQuery.isError &&
                (couriersQuery.data?.length ?? 0) === 0 && (
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                    No existen usuarios activos habilitados para realizar entregas.
                  </p>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
              <div>
                <label htmlFor="delivery-receiver" className="mb-1 block text-sm font-semibold">
                  Recibido por
                </label>
                <select
                  id="delivery-receiver"
                  value={receiverType}
                  onChange={(event) =>
                    setReceiverType(event.target.value as "owner" | "authorized")
                  }
                  disabled={isSubmitting}
                >
                  <option value="owner">Titular</option>
                  <option value="authorized">Autorizado</option>
                </select>
              </div>

              <div>
                <label htmlFor="delivery-observations" className="mb-1 block text-sm font-semibold">
                  Observaciones
                </label>
                <textarea
                  id="delivery-observations"
                  value={observations}
                  onChange={(event) => setObservations(event.target.value)}
                  maxLength={500}
                  rows={3}
                  disabled={isSubmitting}
                  placeholder="Detalle opcional de la entrega"
                  className="min-h-24 resize-y"
                />
                <div className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">
                  {observations.length}/500
                </div>
              </div>
            </div>

            {(assignedDepositAmount > 0 || assignedShippingFee > 0) && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-800/70 dark:bg-amber-950/30">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
                  <CircleDollarSign size={18} />
                  Montos de la entrega
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {assignedDepositAmount > 0 && (
                    <div>
                      <label htmlFor="delivery-deposit" className="mb-1 block text-sm font-medium">
                        Depósito (₡)
                      </label>
                      <input
                        id="delivery-deposit"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={depositAmount}
                        onChange={(event) => setDepositAmount(event.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                  {assignedShippingFee > 0 && (
                    <div>
                      <label htmlFor="delivery-shipping-fee" className="mb-1 block text-sm font-medium">
                        Costo de envío (₡)
                      </label>
                      <input
                        id="delivery-shipping-fee"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={shippingFee}
                        onChange={(event) => setShippingFee(event.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3 dark:border-sky-800/70 dark:bg-sky-950/30">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-sky-900 dark:text-sky-200">
                    {locationStatus === "loading" ? (
                      <LoaderCircle className="animate-spin" size={18} />
                    ) : (
                      <MapPin size={18} />
                    )}
                    {locationStatus === "loading"
                      ? "Obteniendo ubicación GPS..."
                      : "Ubicación de la entrega"}
                  </div>
                  {coordinates && (
                    <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
                      {formatCoordinates(coordinates)}
                    </p>
                  )}
                  {locationError && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {locationError}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  {coordinates && (
                    <button
                      type="button"
                      onClick={() => setNavigationOpen(true)}
                      title="Ver ubicación"
                      aria-label="Ver ubicación en mapas"
                      className="flex size-9 items-center justify-center rounded-full text-sky-700 hover:bg-sky-100 dark:text-sky-300 dark:hover:bg-sky-900"
                    >
                      <MapPin size={19} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={requestLocation}
                    disabled={locationStatus === "loading" || isSubmitting}
                    title="Obtener ubicación nuevamente"
                    aria-label="Obtener ubicación nuevamente"
                    className="flex size-9 items-center justify-center rounded-full text-sky-700 hover:bg-sky-100 disabled:opacity-50 dark:text-sky-300 dark:hover:bg-sky-900"
                  >
                    <LocateFixed size={19} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={
                isSubmitting ||
                couriersQuery.isLoading ||
                !deliveredBy ||
                !coordinates
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <LoaderCircle className="animate-spin" size={18} />}
              Listo
            </button>
          </div>
        </div>
      </div>

      {navigationLinks && (
        <NavigationDialog
          open={navigationOpen}
          onClose={() => setNavigationOpen(false)}
          coordinates={navigationLinks.coordinates}
          googleMaps={navigationLinks.googleMaps}
          waze={navigationLinks.waze}
        />
      )}
    </>
  );
}

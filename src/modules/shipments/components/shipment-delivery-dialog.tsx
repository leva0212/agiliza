"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type DeliveryItem = { id: string; productName: string; quantity: number };

type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

type Props = {
  open: boolean;
  shipmentId: string;
  currentUserId?: string;
  currentUserRole?: string;
  items: DeliveryItem[];
  assignedDepositAmount: number;
  assignedShippingFee: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (input: CompleteShipmentDeliveryInput) => void;
};

function formatMoney(amount: number) { return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 2 }).format(amount); }

function formatCoordinates(coordinates: Coordinates) {
  return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
}

export function ShipmentDeliveryDialog({
  open,
  shipmentId,
  currentUserId,
  currentUserRole,
  items,
  assignedDepositAmount,
  assignedShippingFee,
  isSubmitting,
  onCancel,
  onConfirm,
}: Props) {
  const [deliveredBy, setDeliveredBy] = useState("");
  const [receiverType, setReceiverType] = useState<"" | "owner" | "authorized">("");
  const [depositAmount, setDepositAmount] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [observations, setObservations] = useState("");
  const [deliveredQuantities, setDeliveredQuantities] = useState<Record<string, string>>({});
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [latitudeInput, setLatitudeInput] = useState("");
  const [longitudeInput, setLongitudeInput] = useState("");
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [locationError, setLocationError] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const requestedLocationForOpenRef = useRef(false);
  const initializedItemsForOpenRef = useRef(false);

  useEffect(() => {
    if (!open) { initializedItemsForOpenRef.current = false; return; }
    if (initializedItemsForOpenRef.current) return;
    initializedItemsForOpenRef.current = true;
    setDeliveredQuantities(Object.fromEntries(items.map((item) => [item.id, String(item.quantity)])));
  }, [open, items]);
  const couriersQuery = useQuery({
    queryKey: ["delivery-couriers"],
    queryFn: getDeliveryCouriers,
    enabled: open,
    staleTime: 1000 * 60 * 5,
  });

  const requestLocation = useCallback(() => {
    if (!window.isSecureContext) {
      setLocationStatus("error");
      setLocationError("El navegador bloquea la ubicación en HTTP. Abra la app por HTTPS o use localhost en esta computadora.");
      return;
    }
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("Este dispositivo no permite obtener la ubicación GPS. Puede continuar sin ella.");
      return;
    }

    setLocationStatus("loading");
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLatitudeInput(String(position.coords.latitude));
        setLongitudeInput(String(position.coords.longitude));
        setLocationStatus("success");
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "No se pudo obtener la ubicación porque el permiso fue rechazado. Puede continuar sin ella."
            : "No fue posible obtener la ubicación. Puede continuar sin ella o intentar nuevamente.";

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
      requestedLocationForOpenRef.current = false;
      return;
    }
    if (requestedLocationForOpenRef.current) return;
    requestedLocationForOpenRef.current = true;
    // La apertura del diálogo es una acción explícita del usuario; el navegador resuelve el permiso y el GPS de forma asíncrona.
    requestLocation();
  }, [open, requestLocation]);

  const defaultDeliveredBy = (couriersQuery.data ?? []).find(
    (courier) => courier.profile_id === currentUserId,
  )?.id ?? "";
  const selectedDeliveredBy = deliveredBy || defaultDeliveredBy;
  const canChooseDeliveredBy = currentUserRole !== "courier";

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
    if (!selectedDeliveredBy) {
      toast.error("Falta indicar quién entregó el envío.");
      return;
    }

    if (!receiverType) {
      toast.error("Falta indicar quién recibió el envío.");
      return;
    }

    const pendingCollections: string[] = [];
    if (assignedDepositAmount > 0 && !depositAmount.trim()) {
      pendingCollections.push(`depósito: se espera ${formatMoney(assignedDepositAmount)}`);
    }
    if (assignedShippingFee > 0 && !shippingFee.trim()) {
      pendingCollections.push(`envío: se esperan ${formatMoney(assignedShippingFee)}`);
    }
    if (pendingCollections.length > 0) {
      toast.warning(`Falta registrar ${pendingCollections.join(" · ")}. Ingrese el monto recibido o 0 si no se recolectó.`);
      return;
    }

    const deliveredItems = items.map((item) => ({ shipmentItemId: item.id, quantity: Number(deliveredQuantities[item.id] ?? "") }));
    const invalidQuantity = deliveredItems.find((item) => !Number.isInteger(item.quantity) || item.quantity < 0);
    if (invalidQuantity) {
      toast.error("Indique una cantidad entregada válida (entero igual o mayor que 0) para cada artículo.");
      return;
    }
    const manualCoordinatesEntered = Boolean(latitudeInput.trim() || longitudeInput.trim());
    let coordinatesToSave = coordinates;
    if (manualCoordinatesEntered) {
      if (!latitudeInput.trim() || !longitudeInput.trim()) { toast.error("Ingrese latitud y longitud para guardar la ubicación manual."); return; }
      const latitude = Number(latitudeInput); const longitude = Number(longitudeInput);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) { toast.error("Las coordenadas deben ser válidas: latitud entre -90 y 90, longitud entre -180 y 180."); return; }
      coordinatesToSave = { latitude, longitude, accuracy: null };
    }
    const parsedDeposit = assignedDepositAmount > 0 ? Number(depositAmount) : 0;
    const parsedShippingFee = assignedShippingFee > 0 ? Number(shippingFee) : 0;

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
      deliveredBy: selectedDeliveredBy,
      receiverType,
      depositAmount: parsedDeposit,
      shippingFee: parsedShippingFee,
      deliveredItems,
      observations: observations.trim(),
      latitude: coordinatesToSave?.latitude ?? null,
      longitude: coordinatesToSave?.longitude ?? null,
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
                value={selectedDeliveredBy}
                onChange={(event) => setDeliveredBy(event.target.value)}
                disabled={!canChooseDeliveredBy || couriersQuery.isLoading || isSubmitting}
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
              {!canChooseDeliveredBy && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Se registra automáticamente a su usuario como quien entregó.</p>}
              {couriersQuery.isError && (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
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

            <section className="rounded-2xl border border-violet-200 bg-violet-50/60 p-3 dark:border-violet-800/70 dark:bg-violet-950/20">
              <div className="text-sm font-semibold text-violet-900 dark:text-violet-200">Artículos entregados</div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Ajuste la cantidad real entregada. Este valor rebajará el inventario del mensajero.</p>
              <div className="mt-3 space-y-2">
                {items.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-violet-200 bg-white/80 p-2.5 dark:border-violet-900/70 dark:bg-slate-900/70">
                  <span className="min-w-0 flex-1 text-sm font-medium">{item.productName}<span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">· solicitado: {item.quantity}</span></span>
                  <label className="w-24 shrink-0 text-xs font-medium text-slate-600 dark:text-slate-300">Entregado<input type="number" inputMode="numeric" min={0} step={1} value={deliveredQuantities[item.id] ?? ""} onChange={(event) => setDeliveredQuantities((current) => ({ ...current, [item.id]: event.target.value }))} disabled={isSubmitting} className="mt-1 w-full" /></label>
                </div>)}
              </div>
            </section>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="delivery-receiver" className="mb-1 block text-sm font-semibold">
                  Recibido por
                </label>
                <select
                  id="delivery-receiver"
                  value={receiverType}
                  onChange={(event) =>
                    setReceiverType(event.target.value as "" | "owner" | "authorized")
                  }
                  disabled={isSubmitting}
                  className="min-w-0"
                >
                  <option value="">Seleccione una opción</option>
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
                  rows={2}
                  disabled={isSubmitting}
                  placeholder="Detalle opcional de la entrega"
                  className="min-h-16 max-h-28 resize-y"
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
{assignedDepositAmount > 0 && assignedShippingFee > 0 ? "Costos de depósito y envío" : assignedDepositAmount > 0 ? "Costo de depósito" : "Costo de envío"}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {assignedDepositAmount > 0 && (
                    <div className="min-w-0 rounded-xl border border-amber-200 bg-white/70 p-3 dark:border-amber-800 dark:bg-slate-900/60">
                      <label htmlFor="delivery-deposit" className="block text-sm font-semibold">Depósito</label>
                      <p className="mb-2 mt-0.5 text-xs text-slate-600 dark:text-slate-400">Esperado: {formatMoney(assignedDepositAmount)}</p>
                      <input
                        id="delivery-deposit"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={depositAmount}
                        onChange={(event) => setDepositAmount(event.target.value)}
                        disabled={isSubmitting}
                        placeholder="Monto recibido"
                        className="min-w-0"
                      />
                    </div>
                  )}
                  {assignedShippingFee > 0 && (
                    <div className="min-w-0 rounded-xl border border-amber-200 bg-white/70 p-3 dark:border-amber-800 dark:bg-slate-900/60">
                      <label htmlFor="delivery-shipping-fee" className="block text-sm font-semibold">Envío</label>
                      <p className="mb-2 mt-0.5 text-xs text-slate-600 dark:text-slate-400">Esperado: {formatMoney(assignedShippingFee)}</p>
                      <input
                        id="delivery-shipping-fee"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={shippingFee}
                        onChange={(event) => setShippingFee(event.target.value)}
                        disabled={isSubmitting}
                        placeholder="Monto recibido"
                        className="min-w-0"
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
                      : "Ubicación de la entrega (opcional)"}
                  </div>
                  {coordinates && (
                    <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
                      {formatCoordinates(coordinates)}
                      {coordinates.accuracy !== null && <span className="ml-1 font-sans text-slate-500 dark:text-slate-400">(±{Math.round(coordinates.accuracy)} m)</span>}
                    </p>
                  )}
                  {locationError && (
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
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
                    disabled={isSubmitting || locationStatus === "loading"}
                    title="Reintentar ubicación para mejorar la precisión"
                    className="flex items-center gap-2 rounded-lg border border-sky-300 px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-100 disabled:opacity-50 dark:border-sky-700 dark:text-sky-200 dark:hover:bg-sky-900"
                  >
                    <LocateFixed size={18} className={locationStatus === "loading" ? "animate-pulse" : undefined} />
                    <span>{locationStatus === "loading" ? "Buscando GPS..." : coordinates ? "Mejorar precisión" : "Reintentar ubicación"}</span>
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Latitud<input type="number" inputMode="decimal" step="any" value={latitudeInput} onChange={(event) => setLatitudeInput(event.target.value)} disabled={isSubmitting} placeholder="9.932..." className="mt-1 min-w-0" /></label>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Longitud<input type="number" inputMode="decimal" step="any" value={longitudeInput} onChange={(event) => setLongitudeInput(event.target.value)} disabled={isSubmitting} placeholder="-84.08..." className="mt-1 min-w-0" /></label>
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
              disabled={isSubmitting}
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

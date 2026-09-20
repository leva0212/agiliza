"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getShipment } from "@/modules/shipments/api/get-shipment";

import { getShipmentItems } from "@/modules/shipments/api/get-shipment-items";
import { getShipmentContactMethods } from "@/modules/shipments/api/get-shipment-contact-methods";
import { useState } from "react";
import { updateShipmentStatus } from "@/modules/shipments/api/update-shipment-status";
import { NavigationDialog } from "@/shared/components/navigation-dialog";
import {
  Copy,
  XCircle,
  Settings,
  Pencil,
  MapPin,
  RefreshCw,
  Ban,
  CircleDollarSign,
} from "lucide-react";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shipmentStatusOptions } from "@/modules/shipments/constants/shipment-status-options";
import { getShipmentStatusHistory } from "@/modules/shipments/api/get-shipment-status-history";
import { getShipmentStatusOption } from "@/modules/shipments/utils/get-shipment-status-option";
import { useShipmentsRealtime } from "@/modules/shipments/hooks/use-shipments-realtime";
import { ContactActionsDialog } from "@/components/contact-actions-dialog";
import { ShipmentEvidencesCard } from "@/modules/shipments/components/shipment-evidences-card";
import { ShipmentAttachmentsCard } from "@/modules/shipments/components/shipment-attachments-card";
import { useCurrentProfile } from "@/modules/auth/hooks/use-current-profile";
import { ShipmentDeliveryDialog } from "@/modules/shipments/components/shipment-delivery-dialog";
import { completeShipmentDelivery } from "@/modules/shipments/api/complete-shipment-delivery";
import { CustomerLocationRequestCard } from "@/modules/shipments/components/customer-location-request-card";
export default function ShipmentDetailPage() {
  const router = useRouter();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [customerNavigationOpen, setCustomerNavigationOpen] = useState(false);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const params = useParams();
  const { data: profile } = useCurrentProfile();
  const shipmentId = params.id as string;
  useShipmentsRealtime(true, shipmentId);

  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: updateShipmentStatus,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["shipment", shipmentId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["shipment-status-history", shipmentId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["shipments"],
      });

      setStatusDialogOpen(false);

      setActionsOpen(false);
    },

    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "No fue posible cambiar el estado",
      );
    },
  });

  const completeDeliveryMutation = useMutation({
    mutationFn: completeShipmentDelivery,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["shipment", shipmentId] }),
        queryClient.invalidateQueries({
          queryKey: ["shipment-status-history", shipmentId],
        }),
        queryClient.invalidateQueries({ queryKey: ["shipments"] }),
      ]);

      setDeliveryDialogOpen(false);
      setStatusDialogOpen(false);
      setActionsOpen(false);
      toast.success("Entrega registrada correctamente");
    },

    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible confirmar la entrega",
      );
    },
  });

  const { data: shipment, isLoading: shipmentLoading } = useQuery({
    queryKey: ["shipment", shipmentId],

    queryFn: () => getShipment(shipmentId),
  });

  const { data: statusHistory = [] } = useQuery({
    queryKey: ["shipment-status-history", shipmentId],

    queryFn: () => getShipmentStatusHistory(shipmentId),
  });
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["shipment-items", shipmentId],

    queryFn: () => getShipmentItems(shipmentId),
  });

  const { data: contactMethods = [] } = useQuery({
    queryKey: ["shipment-contact-methods", shipmentId],

    queryFn: () => getShipmentContactMethods(shipmentId),
  });

  const assignedDepositAmount = items.reduce(
    (total, item) => total + Number(item.deposit_amount || 0),
    0,
  );
  const assignedShippingFee = items.reduce(
    (total, item) => total + Number(item.shipping_fee || 0),
    0,
  );

  if (shipmentLoading || itemsLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!shipment) {
    return <div className="p-6">Envío no encontrado</div>;
  }

  const currentStatus = getShipmentStatusOption(shipment.status);

  return (
    <div className="max-w-4xl max-w-[500px] p-1 space-y-6">
      <div className="max-w-4xl mx-auto p-3 space-y-3">
        <div className="border rounded-xl p-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-gray-500">Guía</div>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold">
                  {shipment.tracking_number}
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      shipment.tracking_number,
                    );

                    toast.success("Número de guía copiado al portapapeles");
                  }}
                  className="
          p-1
          rounded
          hover:bg-gray-100
        "
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActionsOpen(true)}
              className="
      flex
      items-center
      gap-2
      px-3
      py-2
      rounded-lg
      border
      hover:bg-gray-50
    "
            >
              <Settings size={18} />

              <span className="text-sm">Acciones</span>
            </button>
          </div>

          <div className="text-2xl font-bold text-blue-700 mt-2">
            {shipment.company?.name}
          </div>

          {currentStatus && (
            <div
              className={`
      inline-flex
      items-center
      gap-2
      px-3
      py-1
      rounded-full
      border
      ${currentStatus.className}
    `}
            >
              {currentStatus.label}
            </div>
          )}
        </div>
        {(assignedDepositAmount > 0 || assignedShippingFee > 0) && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm dark:border-amber-700 dark:bg-amber-950/30">
            <div className="mb-3 flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200"><CircleDollarSign size={19} />Montos importantes del envío</div>
            <div className="grid grid-cols-2 gap-3">
              {assignedDepositAmount > 0 && <div className="rounded-lg bg-white/80 p-3 dark:bg-slate-900/70"><div className="text-xs font-medium text-slate-500 dark:text-slate-400">Depósito esperado</div><div className="mt-1 text-xl font-bold tabular-nums text-amber-900 dark:text-amber-100">{formatCRC(assignedDepositAmount)}</div></div>}
              {assignedShippingFee > 0 && <div className="rounded-lg bg-white/80 p-3 dark:bg-slate-900/70"><div className="text-xs font-medium text-slate-500 dark:text-slate-400">Envío esperado</div><div className="mt-1 text-xl font-bold tabular-nums text-amber-900 dark:text-amber-100">{formatCRC(assignedShippingFee)}</div></div>}
            </div>
          </div>
        )}
        <div className="border rounded-xl p-3">
          <div className="font-semibold mb-2">Artículos</div>

          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-left gap-2 items-center"
              >
                <span>({item.quantity})</span>
                <span>{item.product?.name ?? item.product_id}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border rounded-xl p-3 border-blue-300">
          <div className="font-semibold">Cliente</div>

          <div>{shipment.customer_name}</div>

          <div className="text-sm text-gray-600">
            {shipment.identification_type?.name}
          </div>

          <div className="text-sm text-gray-600">
            {shipment.customer_identification}
          </div>

          {contactMethods.length > 0 && (
            <div className="mt-3 space-y-2">
              {contactMethods.map((contact) => (
                <div key={contact.id} className="text-sm">
                  <div className="font-medium">{contact.contact_name}</div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPhone(contact.value);

                      setContactDialogOpen(true);
                    }}
                    className="
    text-blue-600
    underline
  "
                  >
                    {contact.value}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border rounded-xl p-3">
          <div className="font-semibold">Observaciones</div>

          <div className="mt-2 whitespace-pre-wrap">
            {shipment.notes?.trim() ? shipment.notes : "Sin observaciones"}
          </div>
        </div>
        {profile?.is_owner_company_user && <CustomerLocationRequestCard shipmentId={shipmentId} trackingNumber={shipment.tracking_number} phoneNumber={contactMethods[0]?.value} />}
        {shipment.customer_latitude != null && shipment.customer_longitude != null && (
          <div className="rounded-xl border border-sky-300 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950/30">
            <div className="font-semibold text-sky-900 dark:text-sky-200">Ubicación compartida por el cliente</div>
            <div className="mt-1 break-all font-mono text-sm">{shipment.customer_latitude.toFixed(6)}, {shipment.customer_longitude.toFixed(6)}</div>
            {shipment.customer_location_accuracy_meters != null && <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Precisión aproximada: ±{Math.round(shipment.customer_location_accuracy_meters)} m</div>}
            {shipment.customer_location_received_at && <div className="mt-1 text-xs text-slate-500">Recibida {new Date(shipment.customer_location_received_at).toLocaleString("es-CR")}</div>}
            <button type="button" onClick={() => setCustomerNavigationOpen(true)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-sky-300 px-3 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-100 dark:border-sky-700 dark:text-sky-200 dark:hover:bg-sky-900"><MapPin size={17}/>Abrir ubicación</button>
          </div>
        )}
        <div className="border rounded-xl p-3">
          <div className="font-semibold">
            Dirección: Provincia{" - "}Canton{" - "}Distrito{" - "}Barrio
          </div>

          <div className="text-sm text-gray-600 mt-1">
            {shipment.district?.canton?.province?.name}

            {" - "}

            {shipment.district?.canton?.name}

            {" - "}

            {shipment.district?.name}

            {" - "}

            {shipment.neighborhood?.name}
          </div>

          <div className="mt-2">{shipment.customer_address}</div>

          <div className="mt-3 text-sm">🏘️ Centro del barrio</div>

          <button
            type="button"
            onClick={() => setNavigationOpen(true)}
            className="
        mt-2
        text-blue-600
        font-medium
      "
          >
            📍 Navegar
          </button>
        </div>
        <div className="border rounded-xl p-3">
          <div className="font-semibold">Ruta</div>

          <div className="mt-2">
            Ruta: {shipment.route?.name ?? "Sin ruta asignada"}
          </div>

          {profile?.is_owner_company_user && (
            <div className="mt-1">
              Mensajero: {shipment.courier?.full_name ?? "Sin asignar"}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <ShipmentAttachmentsCard
            shipmentId={shipmentId}
            trackingNumber={shipment.tracking_number}
          />
          <ShipmentEvidencesCard
            shipmentId={shipmentId}
            trackingNumber={shipment.tracking_number}
          />
          <div
            className="
    bg-white
    rounded-2xl
    border
    p-4
  "
          >
            <div
              className="
      text-lg
      font-semibold
      mb-4
    "
            >
              Historial
            </div>

            <div
              className="
      space-y-4
    "
            >
              {statusHistory.map((history) => {
                const currentStatus = getShipmentStatusOption(history.status);

                const previousStatus = history.previous_status
                  ? getShipmentStatusOption(history.previous_status)
                  : null;

                const Icon = currentStatus?.icon;

                return (
                  <div
                    key={history.id}
                    className="
              relative
              pl-8
            "
                  >
                    <div
                      className="
                absolute
                left-0
                top-1
                w-4
                h-4
                rounded-full
                bg-white
                border-2
                border-gray-300
              "
                    />

                    <div
                      className="
                absolute
                left-[7px]
                top-5
                bottom-[-24px]
                w-[2px]
                bg-gray-200
              "
                    />

                    <div
                      className={`
                inline-flex
                items-center
                gap-2
                px-3
                py-1
                rounded-full
                border
                font-medium
                text-sm
                ${currentStatus?.className}
              `}
                    >
                      {Icon && <Icon size={14} />}

                      {currentStatus?.label}
                    </div>

                    <div
                      className="
                mt-2
                text-sm
                font-medium
              "
                    >
                      {history.profile?.full_name ?? "Sistema"}
                    </div>

                    <div
                      className="
                text-xs
                text-gray-500
              "
                    >
                      {new Date(history.created_at).toLocaleString("es-CR")}
                    </div>

                    {previousStatus && (
                      <div
                        className="
                  mt-2
                  text-xs
                  text-gray-500
                "
                      >
                        Estado anterior:{" "}
                        <span
                          className="
                    font-medium
                  "
                        >
                          {previousStatus.label}
                        </span>
                      </div>
                    )}

                    {history.notes && (
                      <div
                        className="
                  mt-2
                  text-sm
                  bg-gray-50
                  border
                  rounded-lg
                  p-2
                "
                      >
                        📝 {history.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {actionsOpen && (
        <div
          className="
      fixed
      inset-0
      bg-black/30
      z-50
      flex
      items-center
      justify-center
      p-4
    "
          onClick={() => setActionsOpen(false)}
        >
          <div
            className="
        w-full
        max-w-sm
        bg-white
        rounded-2xl
        p-4
        space-y-2
      "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="font-bold">Acciones</div>
              <button
                type="button"
                aria-label="Cerrar acciones"
                title="Cerrar"
                onClick={() => setActionsOpen(false)}
                className="flex size-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <XCircle size={20} />
              </button>
            </div>
            <button
              onClick={() => {
                setActionsOpen(false);

                setStatusDialogOpen(true);
              }}
              className="
    w-full
    text-left
    p-3
    rounded-xl
    border
    border-slate-200/80
    dark:border-slate-700/70
    transition-colors
    hover:bg-blue-50
    hover:text-blue-700
    dark:hover:bg-blue-950/60
    dark:hover:text-blue-200
    flex
    items-center
    gap-3
  "
            >
              <RefreshCw size={18} />

              <span>Cambiar estado</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActionsOpen(false);
                router.push(`/dashboard/shipments/${shipmentId}/edit`);
              }}
              className="
    w-full
    text-left
    p-3
    rounded-xl
    border
    border-slate-200/80
    dark:border-slate-700/70
    transition-colors
    hover:bg-violet-50
    hover:text-violet-700
    dark:hover:bg-violet-950/60
    dark:hover:text-violet-200
    flex
    items-center
    gap-3
  "
            >
              <Pencil size={18} />

              <span>Modificar envío</span>
            </button>
            <button
              onClick={() => {
                setActionsOpen(false);

                router.push(`/dashboard/shipments?copyFrom=${shipmentId}`);
                //router.push(`/dashboard/shipments/new?copyFrom=${shipmentId}`);
              }}
              className="
    w-full
    text-left
    p-3
    rounded-xl
    border
    border-slate-200/80
    dark:border-slate-700/70
    transition-colors
    hover:bg-cyan-50
    hover:text-cyan-700
    dark:hover:bg-cyan-950/60
    dark:hover:text-cyan-200
    flex
    items-center
    gap-3
  "
            >
              <Copy size={18} />

              <span>Duplicar envío</span>
            </button>

            <button
              className="
    w-full
    text-left
    p-3
    rounded-xl
    border
    border-red-200/70
    dark:border-red-900/50
    text-red-600
    transition-colors
    hover:bg-red-50
    dark:text-red-400
    dark:hover:bg-red-950/60
    dark:hover:text-red-200
    flex
    items-center
    gap-3
  "
            >
              <Ban size={18} />

              <span>Cancelar envío</span>
            </button>

            <button
              type="button"
              onClick={() => setActionsOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200/80 p-3 text-left transition-colors hover:bg-slate-100 dark:border-slate-700/70 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <XCircle size={18} />
              <span>Cerrar</span>
            </button>
          </div>
        </div>
      )}
      {statusDialogOpen && (
        <div
          className="
      fixed
      inset-0
      bg-black/30
      z-50
      flex
      items-center
      justify-center
      p-4
    "
        >
          <div
            className="
        bg-white
        text-slate-900
        dark:bg-slate-900
        dark:text-slate-100
        rounded-2xl
        p-4
        w-full
        max-w-sm
      "
          >
            <div className="font-bold mb-3">Cambiar estado</div>

            <div className="space-y-2">
              {shipmentStatusOptions

                .filter((option) => option.value !== shipment.status)

                .map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (option.value === "delivered") {
                          setStatusDialogOpen(false);
                          setDeliveryDialogOpen(true);
                          return;
                        }

                        updateStatusMutation.mutate({
                          shipmentId,

                          status: option.value,
                        });
                      }}
                      className={`
            w-full
            p-3
            rounded-xl
            border
            flex
            items-center
            gap-3
            text-left
            ${option.className}
          `}
                    >
                      <Icon size={18} />

                      <span>{option.label}</span>
                    </button>
                  );
                })}
            </div>

            <button
              onClick={() => setStatusDialogOpen(false)}
              className="
          mt-4
          w-full
          border
          border-slate-300
          text-slate-700
          transition-colors
          hover:bg-slate-100
          dark:border-slate-600
          dark:text-slate-100
          dark:hover:bg-slate-800
          rounded-lg
          p-3
        "
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      <ShipmentDeliveryDialog
        key={deliveryDialogOpen ? shipmentId + "-delivery-open" : shipmentId + "-delivery-closed"}
        open={deliveryDialogOpen}
        shipmentId={shipmentId}
        currentUserId={profile?.id}
        assignedDepositAmount={assignedDepositAmount}
        assignedShippingFee={assignedShippingFee}
        isSubmitting={completeDeliveryMutation.isPending}
        onCancel={() => setDeliveryDialogOpen(false)}
        onConfirm={(input) => completeDeliveryMutation.mutate(input)}
      />
      <NavigationDialog
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        coordinates={`${shipment.neighborhood?.latitude},${shipment.neighborhood?.longitude}`}
        googleMaps={`https://www.google.com/maps?q=${shipment.neighborhood?.latitude},${shipment.neighborhood?.longitude}`}
        waze={`https://waze.com/ul?ll=${shipment.neighborhood?.latitude},${shipment.neighborhood?.longitude}&navigate=yes`}
      />

      {shipment.customer_latitude != null && shipment.customer_longitude != null && (
        <NavigationDialog open={customerNavigationOpen} onClose={() => setCustomerNavigationOpen(false)} coordinates={shipment.customer_latitude + "," + shipment.customer_longitude} googleMaps={"https://www.google.com/maps?q=" + shipment.customer_latitude + "," + shipment.customer_longitude} waze={"https://waze.com/ul?ll=" + shipment.customer_latitude + "," + shipment.customer_longitude + "&navigate=yes"} />
      )}
      <ContactActionsDialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        phone={selectedPhone}
        customerName={shipment.customer_name ?? undefined}
        trackingNumber={shipment.tracking_number}
        companyName={profile?.company?.name ?? undefined}
        provinceName={shipment.district?.canton?.province?.name}
        cantonName={shipment.district?.canton?.name}
        districtName={shipment.district?.name}
        neighborhoodName={shipment.neighborhood?.name}
        customerAddress={shipment.customer_address ?? undefined}
      />
    </div>
  );
}

function formatCRC(value: number) { return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 2 }).format(value); }

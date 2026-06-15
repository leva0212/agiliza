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
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  Settings,
  Pencil,
  Package,
  Phone,
  MapPin,
  RefreshCw,
  Ban,
} from "lucide-react";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shipmentStatusOptions } from "@/modules/shipments/constants/shipment-status-options";
import { getShipmentStatusHistory } from "@/modules/shipments/api/get-shipment-status-history";
import { getShipmentStatusOption } from "@/modules/shipments/utils/get-shipment-status-option";
import { useShipmentsRealtime } from "@/modules/shipments/hooks/use-shipments-realtime";
import { ContactActionsDialog } from "@/components/contact-actions-dialog";
import { ShipmentEvidencesCard } from "@/modules/shipments/components/shipment-evidences-card";
import { useCurrentProfile } from "@/modules/auth/hooks/use-current-profile";
export default function ShipmentDetailPage() {
  useShipmentsRealtime();
  const router = useRouter();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState("");

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const params = useParams();
  const { data: profile } = useCurrentProfile();
  const shipmentId = params.id as string;

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

  if (shipmentLoading || itemsLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!shipment) {
    return <div className="p-6">Envío no encontrado</div>;
  }

  const currentStatus = getShipmentStatusOption(shipment.status);
  console.log("Estado actual:", shipment.status);

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
        <div className="border rounded-xl p-3">
          <div className="font-semibold mb-2">Artículos</div>

          <div className="space-y-1">
            {items.map((item: any) => (
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
          <ShipmentEvidencesCard
            shipmentId={shipmentId}
            createdBy={profile?.id}
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
            <div className="font-bold mb-2">Acciones</div>
            <button
              onClick={() => {
                setActionsOpen(false);

                setStatusDialogOpen(true);
              }}
              className="
    w-full
    text-left
    p-3
    rounded
    hover:bg-gray-100
    flex
    items-center
    gap-3
  "
            >
              <RefreshCw size={18} />

              <span>Cambiar estado</span>
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
    rounded
    hover:bg-gray-100
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
    rounded
    text-red-600
    hover:bg-red-50
    flex
    items-center
    gap-3
  "
            >
              <Ban size={18} />

              <span>Cancelar envío</span>
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
                      onClick={() =>
                        updateStatusMutation.mutate({
                          shipmentId,

                          status: option.value,
                        })
                      }
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
          rounded-lg
          p-3
        "
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      <NavigationDialog
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        coordinates={`${shipment.neighborhood?.latitude},${shipment.neighborhood?.longitude}`}
        googleMaps={`https://www.google.com/maps?q=${shipment.neighborhood?.latitude},${shipment.neighborhood?.longitude}`}
        waze={`https://waze.com/ul?ll=${shipment.neighborhood?.latitude},${shipment.neighborhood?.longitude}&navigate=yes`}
      />

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

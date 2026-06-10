"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { getRoutesOptions } from "@/modules/rates/api/get-routes-options";

import { getCouriersOptions } from "@/modules/rates/api/get-couriers-options";

import { getDeliveryRates } from "@/modules/rates/api/get-delivery-rates";

import { DeliveryRatesTable } from "@/modules/rates/components/delivery-rates-table";

export default function RatesPage() {
  const [activeTab, setActiveTab] = useState<"dts" | "courier">("dts");

  const [routeId, setRouteId] = useState("");

  const [courierId, setCourierId] = useState("");

  const { data: routes = [] } = useQuery({
    queryKey: ["rates-routes"],

    queryFn: getRoutesOptions,
  });

  const { data: couriers = [] } = useQuery({
    queryKey: ["rates-couriers"],

    queryFn: getCouriersOptions,
  });

  const { data: deliveryRates = [] } = useQuery({
    queryKey: ["delivery-rates", routeId],

    queryFn: () => getDeliveryRates(routeId),

    enabled: !!routeId,
  });

  return (
    <div className="p-6 space-y-6">
      <h1
        className="
          text-2xl
          font-bold
        "
      >
        Tarifas
      </h1>

      <div
        className="
          flex
          gap-2
        "
      >
        <button
          onClick={() => setActiveTab("dts")}
          className={`
            px-4
            py-2
            rounded-xl

            ${activeTab === "dts" ? "bg-blue-600 text-white" : "border"}
          `}
        >
          Cobros DTS
        </button>

        <button
          onClick={() => setActiveTab("courier")}
          className={`
            px-4
            py-2
            rounded-xl

            ${activeTab === "courier" ? "bg-blue-600 text-white" : "border"}
          `}
        >
          Pagos Mensajeros
        </button>
      </div>

      <div
        className="
          grid
          md:grid-cols-2
          gap-4
        "
      >
        <div>
          <label
            className="
              block
              mb-1
              font-medium
            "
          >
            Ruta
          </label>

          <select
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            className="
              w-full
              border
              rounded-xl
              p-2
            "
          >
            <option value="">Seleccione ruta</option>

            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>
        </div>

        {activeTab === "courier" && (
          <div>
            <label
              className="
                block
                mb-1
                font-medium
              "
            >
              Mensajero
            </label>

            <select
              value={courierId}
              onChange={(e) => setCourierId(e.target.value)}
              className="
                w-full
                border
                rounded-xl
                p-2
              "
            >
              <option value="">Seleccione mensajero</option>

              {couriers.map((courier) => (
                <option key={courier.id} value={courier.id}>
                  {courier.full_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeTab === "dts" && (
        <div
          className="
            space-y-4
          "
        >
          <div
            className="
              flex
              justify-between
              items-center
            "
          >
            <h2
              className="
                text-lg
                font-semibold
              "
            >
              Cobros DTS
            </h2>

            <button
              className="
                px-4
                py-2
                bg-blue-600
                text-white
                rounded-xl
              "
            >
              Nueva tarifa
            </button>
          </div>

          <DeliveryRatesTable data={deliveryRates} />
        </div>
      )}

      {activeTab === "courier" && (
        <div
          className="
            border
            rounded-xl
            p-6
            text-center
            text-gray-500
          "
        >
          Próximamente: tarifas de mensajeros.
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { getRoutesOptions } from "@/modules/rates/api/get-routes-options";

import { getCouriersOptions } from "@/modules/rates/api/get-couriers-options";

import { getDeliveryRates } from "@/modules/rates/api/get-delivery-rates";

import { DeliveryRatesTable } from "@/modules/rates/components/delivery-rates-table";
import { useQueryClient } from "@tanstack/react-query";
import { deleteCourierDeliveryRate } from "@/modules/rates/api/delete-courier-delivery-rate";
import { DeliveryRateForm } from "@/modules/rates/components/delivery-rate-form";
import { CourierDeliveryRateForm } from "@/modules/rates/components/courier-delivery-rate-form";
import { DeliveryRateDetail } from "@/modules/rates/types/delivery-rate";
import { deleteDeliveryRate } from "@/modules/rates/api/delete-delivery-rate";
import { UiMessage } from "@/shared/components/ui-message";
import { getCompaniesOptions } from "@/modules/companies/api/get-companies-options";
import { getCourierDeliveryRates } from "@/modules/rates/api/get-courier-delivery-rates";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import IconButton from "@mui/material/IconButton";

import Tooltip from "@mui/material/Tooltip";
import { CourierDeliveryRatesTable } from "@/modules/rates/components/courier-delivery-rates-table";
export default function RatesPage() {
  const [activeTab, setActiveTab] = useState<"dts" | "courier">("dts");
  const [filterRoute, setFilterRoute] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,

    pageSize: 50,
  });
  const [helpOpen, setHelpOpen] = useState(false);

  const [filterCompany, setFilterCompany] = useState(true);
  const [routeId, setRouteId] = useState("");

  const [companyId, setCompanyId] = useState("");

  const [courierId, setCourierId] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const [editingRate, setEditingRate] = useState<DeliveryRateDetail | null>(
    null,
  );
  const [editingCourierRate, setEditingCourierRate] = useState<any | null>(
    null,
  );
  const [deleteRateId, setDeleteRateId] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: routes = [] } = useQuery({
    queryKey: ["rates-routes"],

    queryFn: getRoutesOptions,
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["rates-companies"],

    queryFn: getCompaniesOptions,
  });

  const { data: couriers = [] } = useQuery({
    queryKey: ["rates-couriers"],

    queryFn: getCouriersOptions,
  });

  const { data: deliveryRates = [] } = useQuery({
    queryKey: [
      "delivery-rates",

      filterRoute ? routeId : "",

      filterCompany ? companyId : "",
    ],

    queryFn: () =>
      getDeliveryRates(
        routeId,

        companyId,

        filterRoute,

        filterCompany,
      ),

    enabled: true,
  });

  const { data: courierRates = [] } = useQuery({
    queryKey: [
      "courier-rates",

      filterRoute,

      filterRoute ? routeId : "",

      courierId,
    ],

    queryFn: () =>
      getCourierDeliveryRates(
        routeId,

        courierId,

        filterRoute,
      ),

    enabled: activeTab === "courier" && !!courierId,
  });
  //console.log("Tarifas configuradas");
  //console.log("courierRates", courierRates);
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
          Cobros a Empresas
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
          Pagos a Mensajeros
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
          <div
            className="
    flex
    items-center
    gap-2
    mb-1
  "
          >
            <input
              id="filter-route"
              type="checkbox"
              checked={filterRoute}
              onChange={(e) => setFilterRoute(e.target.checked)}
            />

            <label
              htmlFor="filter-route"
              className="
      font-medium
      cursor-pointer
      select-none
    "
            >
              Ruta
            </label>
          </div>

          <select
            //disabled={!filterRoute}
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

          {activeTab === "dts" && (
            <div>
              <div
                className="
    flex
    items-center
    gap-2
    mb-1
  "
              >
                <input
                  id="filter-company"
                  type="checkbox"
                  checked={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.checked)}
                />

                <label
                  htmlFor="filter-company"
                  className="
      font-medium
      cursor-pointer
      select-none
    "
                >
                  Empresa
                </label>
              </div>

              <select
                //disabled={!filterCompany}
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="
      w-full
      border
      rounded-xl
      p-2
      disabled:bg-gray-100
    "
              >
                <option value="">Seleccione empresa</option>

                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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
            <div
              className="
    flex
    items-center
    gap-2
  "
            >
              <h2
                className="
      text-lg
      font-semibold
    "
              >
                Cobros a Empresas
              </h2>

              <Tooltip title="¿Cómo funcionan las tarifas?">
                <IconButton size="small" onClick={() => setHelpOpen(true)}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>

            <button
              onClick={() => {
                setEditingRate(null);

                setFormOpen(true);
              }}
              disabled={!routeId}
              className="
    px-4
    py-2
    bg-blue-600
    text-white
    rounded-xl
    disabled:opacity-50
  "
            >
              Nueva tarifa de cobro
            </button>
          </div>

          <DeliveryRatesTable
            data={deliveryRates}
            onEdit={(rate) => {
              setEditingRate(rate);

              setFormOpen(true);
            }}
            onDelete={(rateId) => {
              setDeleteRateId(rateId);

              setDeleteOpen(true);
            }}
          />
        </div>
      )}

      {activeTab === "courier" && (
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
            <div
              className="
    flex
    items-center
    gap-2
  "
            >
              <h2
                className="
      text-lg
      font-semibold
    "
              >
                Pagos a Mensajeros
              </h2>

              <Tooltip title="¿Cómo funcionan las tarifas?">
                <IconButton size="small" onClick={() => setHelpOpen(true)}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>

            <button
              disabled={!routeId || !courierId}
              onClick={() => {
                setEditingCourierRate(null);

                setFormOpen(true);
              }}
              className="
          px-4
          py-2
          bg-blue-600
          text-white
          rounded-xl
          disabled:opacity-50
        "
            >
              Nueva tarifa de pago
            </button>
          </div>

          <CourierDeliveryRatesTable
            data={courierRates}
            onEdit={(rate) => {
              setEditingCourierRate(rate);

              setFormOpen(true);
            }}
            onDelete={(rateId) => {
              setDeleteRateId(rateId);

              setDeleteOpen(true);
            }}
          />
        </div>
      )}

      <UiMessage
        open={helpOpen}
        type="info"
        title="¿Cómo funcionan las tarifas?"
        message={
          <div className="space-y-4 text-left">
            <div>
              <div className="font-semibold">Tarifas por defecto</div>

              <div>
                Las tarifas generales se configuran en:
                <ul className="list-disc ml-5 mt-1">
                  <li>Empresas → Cobros a Empresas por defecto.</li>

                  <li>Usuarios → Pagos por defecto al mensajero.</li>
                </ul>
              </div>
            </div>

            <div>
              <div className="font-semibold">Tarifas especiales</div>

              <div>
                Esta pantalla se utiliza únicamente para crear excepciones por
                ruta, provincia, cantón, distrito o barrio.
              </div>
            </div>

            <div>
              <div className="font-semibold">Prioridad</div>
              <div className="mt-2 font-medium text-amber-700">
                Las tarifas configuradas en esta pantalla son excepciones que
                reemplazan temporalmente las tarifas por defecto cuando existe
                una coincidencia más específica.
              </div>
              <div className="min-h-[20px]"> </div>
              <div>
                La configuración más específica siempre tiene prioridad:
                <div className="mt-2">
                  Barrio → Distrito → Cantón → Provincia → Ruta → Tarifa por
                  defecto
                </div>
              </div>
            </div>

            <div>
              <div className="font-semibold">Ejemplos</div>

              <div className="space-y-3 mt-2">
                <div>
                  <strong>Cobros a Empresas</strong>

                  <div>
                    Si a una empresa se le cobra ₡8.000 por defecto por cada
                    entrega y se configura un cobro especial de ₡10.000 para un
                    barrio específico, las entregas realizadas en ese barrio
                    cobrarán ₡10.000 y el resto continuará cobrando ₡8.000.
                  </div>
                </div>

                <div>
                  <strong>Pagos a Mensajeros</strong>

                  <div>
                    Si un mensajero recibe ₡3.500 por defecto por cada entrega y
                    se configura un pago especial de ₡5.000 para un barrio
                    específico, las entregas realizadas en ese barrio pagarán
                    ₡5.000 al mensajero y el resto continuará pagando ₡3.500.
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        onClose={() => setHelpOpen(false)}
      />

      <UiMessage
        open={deleteOpen}
        type="question"
        title="Eliminar tarifa"
        message="¿Desea eliminar esta tarifa?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onClose={() => {
          setDeleteOpen(false);

          setDeleteRateId(null);
        }}
        onConfirm={async () => {
          if (!deleteRateId) {
            return;
          }

          if (activeTab === "dts") {
            await deleteDeliveryRate(deleteRateId);

            queryClient.invalidateQueries({
              queryKey: ["delivery-rates"],
            });
          } else {
            await deleteCourierDeliveryRate(deleteRateId);

            queryClient.invalidateQueries({
              queryKey: ["courier-rates"],
            });
          }

          setDeleteOpen(false);

          setDeleteRateId(null);
        }}
      />

      {activeTab === "dts" && (
        <DeliveryRateForm
          open={formOpen}
          routeId={routeId}
          rate={editingRate}
          onClose={() => {
            setFormOpen(false);

            setEditingRate(null);
          }}
          onSaved={() => {
            setFormOpen(false);

            setEditingRate(null);

            queryClient.invalidateQueries({
              queryKey: ["delivery-rates", routeId],
            });
          }}
        />
      )}

      {activeTab === "courier" && (
        <CourierDeliveryRateForm
          open={formOpen}
          routeId={routeId}
          courierId={courierId}
          rate={editingCourierRate}
          onClose={() => {
            setFormOpen(false);

            setEditingCourierRate(null);
          }}
          onSaved={() => {
            setFormOpen(false);

            setEditingCourierRate(null);

            queryClient.invalidateQueries({
              queryKey: ["courier-rates"],
            });
          }}
        />
      )}
    </div>
  );
}

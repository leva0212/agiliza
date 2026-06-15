"use client";

import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { getProvinces } from "@/modules/routes/api/get-provinces";

import { getCantons } from "@/modules/routes/api/get-cantons";

import { getDistricts } from "@/modules/routes/api/get-districts";

import { getNeighborhoods } from "@/modules/routes/api/get-neighborhoods";
import { SearchSelector } from "@/shared/components/search-selector";
import { createDeliveryRate } from "../api/create-delivery-rate";

import { CompanySearchDialog } from "@/modules/companies/components/company-search-dialog";
import { UiMessage } from "@/shared/components/ui-message";
import type { DeliveryRateDetail } from "../types/delivery-rate";
import { updateDeliveryRate } from "../api/update-delivery-rate";
type Props = {
  open: boolean;

  routeId: string;

  rate?: DeliveryRateDetail | null;

  onClose: () => void;

  onSaved: () => void;
};

export function DeliveryRateForm({
  open,
  routeId,
  rate,
  onClose,
  onSaved,
}: Props) {
  const [level, setLevel] = useState("route");

  const [provinceId, setProvinceId] = useState<number | null>(null);

  const [cantonId, setCantonId] = useState<number | null>(null);

  const [districtId, setDistrictId] = useState<number | null>(null);

  const [neighborhoodId, setNeighborhoodId] = useState<number | null>(null);

  const [deliveryCharge, setDeliveryCharge] = useState("");

  const [failedCharge, setFailedCharge] = useState("");
  const [saving, setSaving] = useState(false);

  const [messageOpen, setMessageOpen] = useState(false);

  const [messageTitle, setMessageTitle] = useState("");

  const [messageText, setMessageText] = useState("");

  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  const [companyId, setCompanyId] = useState("");

  const [companyName, setCompanyName] = useState("");

  const [companyOpen, setCompanyOpen] = useState(false);

  const { data: provinces = [] } = useQuery({
    queryKey: ["provinces"],

    queryFn: getProvinces,
  });

  const { data: cantons = [] } = useQuery({
    queryKey: ["cantons", provinceId],

    queryFn: () => getCantons(provinceId!),

    enabled: provinceId !== null,
  });

  const { data: districts = [] } = useQuery({
    queryKey: ["districts", cantonId],

    queryFn: () => getDistricts(cantonId!),

    enabled: cantonId !== null,
  });

  const { data: neighborhoods = [] } = useQuery({
    queryKey: ["neighborhoods", districtId],

    queryFn: () => getNeighborhoods(districtId!),

    enabled: districtId !== null,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!rate) {
      resetForm();

      return;
    }

    setCompanyId(rate.company_id);

    setCompanyName(rate.company?.name ?? "");

    setProvinceId(rate.province_id);

    setCantonId(rate.canton_id);

    setDistrictId(rate.district_id);

    setNeighborhoodId(rate.neighborhood_id);

    setDeliveryCharge(String(rate.delivery_charge));

    setFailedCharge(String(rate.failed_charge));

    if (rate.neighborhood_id) {
      setLevel("neighborhood");
    } else if (rate.district_id) {
      setLevel("district");
    } else if (rate.canton_id) {
      setLevel("canton");
    } else if (rate.province_id) {
      setLevel("province");
    } else {
      setLevel("route");
    }
  }, [open, rate]);

  function resetForm() {
    setCompanyId("");

    setCompanyName("");

    setLevel("route");

    setProvinceId(null);

    setCantonId(null);

    setDistrictId(null);

    setNeighborhoodId(null);

    setDeliveryCharge("");

    setFailedCharge("");
  }
  async function handleSave() {
    try {
      if (!companyId) {
        setMessageType("warning");

        setMessageTitle("Validación");

        setMessageText("Debe seleccionar una empresa.");

        setMessageOpen(true);

        return;
      }
      setSaving(true);

      const payload = {
        company_id: companyId,

        route_id: routeId,

        province_id:
          level === "province" ||
          level === "canton" ||
          level === "district" ||
          level === "neighborhood"
            ? provinceId
            : null,

        canton_id:
          level === "canton" || level === "district" || level === "neighborhood"
            ? cantonId
            : null,

        district_id:
          level === "district" || level === "neighborhood" ? districtId : null,

        neighborhood_id: level === "neighborhood" ? neighborhoodId : null,

        delivery_charge: Number(deliveryCharge),

        failed_charge: Number(failedCharge),
      };

      if (rate) {
        await updateDeliveryRate(
          rate.id,

          payload,
        );
      } else {
        await createDeliveryRate(payload);
      }

      onSaved();
    } catch (error: any) {
      console.error(error);

      if (error?.code === "23505") {
        setMessageType("warning");

        setMessageTitle("Tarifa duplicada");

        setMessageText(
          `
Ya existe una tarifa configurada para esta combinación de ruta y zona.

Puede modificar la tarifa existente en lugar de crear una nueva.
      `,
        );
      } else {
        setMessageType("error");

        setMessageTitle("Error");

        setMessageText("No fue posible guardar la tarifa.");
      }

      setMessageOpen(true);
    } finally {
      /* catch (error) {
      console.error(error);

      setMessageType("error");

      setMessageTitle("Error");

      setMessageText("No fue posible guardar la tarifa.");

      setMessageOpen(true);
    }*/ setSaving(false);
    }
  }
  if (!open) {
    return null;
  }

  return (
    <div
      className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/50
    "
    >
      <div
        className="
        bg-white
        rounded-xl
        shadow-xl
        w-full
        max-w-2xl
        max-h-[90vh]
        overflow-y-auto
      "
      >
        <div
          className="
          flex
          justify-between
          items-center
          border-b
          p-4
        "
        >
          <h2
            className="
            text-xl
            font-bold
          "
          >
            {rate ? "Modificar tarifa de cobro a Empresa" : "Nueva tarifa de cobro a Empresa"}
          </h2>

          <button
            onClick={onClose}
            className="
            text-gray-500
            hover:text-black
          "
          >
            ✕
          </button>
        </div>

        <div
          className="
          p-4
          space-y-4
        "
        >
          <div>
            <SearchSelector
              label="Empresa"
              valueName={companyName}
              placeholder="
    Seleccione una empresa
  "
              disabled={!!rate}
              onSearch={() => setCompanyOpen(true)}
            />
            <label className="block mb-1">Nivel</label>

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="
              w-full
              border
              rounded-xl
              p-2
            "
            >
              <option value="route">Toda la ruta</option>

              <option value="province">Provincia</option>

              <option value="canton">Cantón</option>

              <option value="district">Distrito</option>

              <option value="neighborhood">Barrio</option>
            </select>
          </div>

          {level !== "route" && (
            <div>
              <label className="block mb-1">Provincia</label>

              <select
                value={provinceId ?? ""}
                onChange={(e) => setProvinceId(Number(e.target.value))}
                className="
                w-full
                border
                rounded-xl
                p-2
              "
              >
                <option value="">Seleccione</option>

                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(level === "canton" ||
            level === "district" ||
            level === "neighborhood") && (
            <div>
              <label className="block mb-1">Cantón</label>

              <select
                value={cantonId ?? ""}
                onChange={(e) => setCantonId(Number(e.target.value))}
                className="
                w-full
                border
                rounded-xl
                p-2
              "
              >
                <option value="">Seleccione</option>

                {cantons.map((canton) => (
                  <option key={canton.id} value={canton.id}>
                    {canton.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(level === "district" || level === "neighborhood") && (
            <div>
              <label className="block mb-1">Distrito</label>

              <select
                value={districtId ?? ""}
                onChange={(e) => setDistrictId(Number(e.target.value))}
                className="
                w-full
                border
                rounded-xl
                p-2
              "
              >
                <option value="">Seleccione</option>

                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {level === "neighborhood" && (
            <div>
              <label className="block mb-1">Barrio</label>

              <select
                value={neighborhoodId ?? ""}
                onChange={(e) => setNeighborhoodId(Number(e.target.value))}
                className="
                w-full
                border
                rounded-xl
                p-2
              "
              >
                <option value="">Seleccione</option>

                {neighborhoods.map((neighborhood) => (
                  <option key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block mb-1">Cobro por entrega</label>

            <input
              type="number"
              value={deliveryCharge}
              onChange={(e) => setDeliveryCharge(e.target.value)}
              className="
              w-full
              border
              rounded-xl
              p-2
            "
            />
          </div>

          <div>
            <label className="block mb-1">Cobro por intento fallido</label>

            <input
              type="number"
              value={failedCharge}
              onChange={(e) => setFailedCharge(e.target.value)}
              className="
              w-full
              border
              rounded-xl
              p-2
            "
            />
          </div>
        </div>

        <div
          className="
          border-t
          p-4
          flex
          justify-end
          gap-2
        "
        >
          <button
            onClick={onClose}
            className="
            px-4
            py-2
            border
            rounded-xl
          "
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="
    px-4
    py-2
    bg-blue-600
    text-white
    rounded-xl
    disabled:opacity-50
  "
          >
            {saving
              ? "Guardando..."
              : rate
                ? "Actualizar tarifa"
                : "Guardar tarifa"}
          </button>
        </div>
      </div>

      <CompanySearchDialog
        open={companyOpen}
        onClose={() => setCompanyOpen(false)}
        onSelect={(company) => {
          setCompanyId(company.id);

          setCompanyName(company.name);
        }}
      />
      <UiMessage
        open={messageOpen}
        title={messageTitle}
        message={messageText}
        type={messageType}
        onClose={() => setMessageOpen(false)}
      />
    </div>
  );
}

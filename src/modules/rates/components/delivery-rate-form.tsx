"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { getProvinces } from "@/modules/routes/api/get-provinces";

import { getCantons } from "@/modules/routes/api/get-cantons";

import { getDistricts } from "@/modules/routes/api/get-districts";

import { getNeighborhoods } from "@/modules/routes/api/get-neighborhoods";

type Props = {
  routeId: string;

  onSave: () => void;

  onCancel: () => void;
};

export function DeliveryRateForm({ routeId, onSave, onCancel }: Props) {
  const [level, setLevel] = useState("route");

  const [provinceId, setProvinceId] = useState<number | null>(null);

  const [cantonId, setCantonId] = useState<number | null>(null);

  const [districtId, setDistrictId] = useState<number | null>(null);

  const [neighborhoodId, setNeighborhoodId] = useState<number | null>(null);

  const [deliveryCharge, setDeliveryCharge] = useState("");

  const [failedCharge, setFailedCharge] = useState("");

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

  return (
    <div
      className="
        border
        rounded-xl
        p-4
        space-y-4
      "
    >
      <h2
        className="
          text-lg
          font-bold
        "
      >
        Nueva tarifa
      </h2>

      <div>
        <label
          className="
            block
            mb-1
          "
        >
          Nivel
        </label>

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
          <label>Provincia</label>

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
    </div>
  );
}

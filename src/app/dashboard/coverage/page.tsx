"use client";

import { useEffect, useState } from "react";
import { LocalidadesService } from "@/services/localidades_service";
import { getProvinceCoverageCounts } from "@/modules/routes/api/get-province-coverage-counts";
import { getDistrictNeighborhoods } from "@/modules/routes/api/get-district-neighborhoods";
import { ClientCoverageTable } from "@/modules/routes/components/client-coverage-table";
import { CoverageNeighborhoodsDialog } from "@/modules/routes/components/coverage-neighborhoods-dialog";
import Image from "next/image";
import { AppVersion } from "@/shared/components/app-version";

type CoverageRow = {
  district_id: number;
  canton: string;
  district: string;
  covered_count: number;
  min_hours: number;
  max_hours: number;
  visit_days: string[];
};

export default function CoveragePage() {
  const provinces = LocalidadesService.provinciasLista;

  const STORAGE_KEY = "coverage_selected_province";

  const [selectedProvince, setSelectedProvince] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    }
    return "";
  });
  const [coverageData, setCoverageData] = useState<CoverageRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [coveredNeighborhoods, setCoveredNeighborhoods] = useState<string[]>([]);
  const [uncoveredNeighborhoods, setUncoveredNeighborhoods] = useState<string[]>([]);
  const [selectedCanton, setSelectedCanton] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  function handleProvinceChange(province: string) {
    setSelectedProvince(province);
    if (typeof window !== "undefined") {
      province ? localStorage.setItem(STORAGE_KEY, province) : localStorage.removeItem(STORAGE_KEY);
    }
  }

  function loose(s: string): string {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
  }

  async function loadCoverage(provinceName: string) {
    try {
      const provinceMap = LocalidadesService.localidadesMap[provinceName];
      if (!provinceMap) { setCoverageData([]); return; }

      const localDistricts: Omit<CoverageRow, "district_id">[] = [];
      Object.entries(provinceMap).forEach(([cantonName, districtsMap]) => {
        Object.keys(districtsMap).forEach((districtName) => {
          localDistricts.push({
            canton: cantonName,
            district: districtName,
            covered_count: 0,
            min_hours: 0,
            max_hours: 0,
            visit_days: [],
          });
        });
      });

      const counts = await getProvinceCoverageCounts(provinceName);

      const merged: CoverageRow[] = localDistricts.map((district) => {
        const match = counts.find(
          (item: any) =>
            loose(item.canton) === loose(district.canton) &&
            loose(item.district) === loose(district.district),
        );
        return {
          ...district,
          district_id: match?.district_id ?? 0,
          covered_count: Number(match?.covered_count ?? 0),
          min_hours: match?.min_hours ?? 0,
          max_hours: match?.max_hours ?? 0,
          visit_days: match?.visit_days ?? [],
        };
      });

      setCoverageData(merged);
      
    } catch (error) {
      console.error(error);
    }
  }

  async function handleViewDistrict(row: any) {
    if (!row.district_id) return;
    const result = await getDistrictNeighborhoods(row.district_id, null);
    setDialogTitle(`${row.canton} → ${row.district}`);
    setSelectedCanton(row.canton);
    setSelectedDistrict(row.district);
    setCoveredNeighborhoods(
      result.filter((item: any) => item.has_coverage).map((item: any) => item.name),
    );
    setUncoveredNeighborhoods(
      result.filter((item: any) => !item.has_coverage).map((item: any) => item.name),
    );
    setDialogOpen(true);
  }

  useEffect(() => {
    if (!selectedProvince) return;
    loadCoverage(selectedProvince);
  }, [selectedProvince]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Contenedor con padding responsivo */}
      <div className="max-w-5xl mx-auto px-3 py-4 sm:px-6 sm:py-6 space-y-4">

        {/* HEADER */}
        <div className="bg-white border border-sky-600 rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <Image
              src="/images/agiliza-logo.jpg"
              alt="Agiliza"
              width={90}
              height={90}
              className="object-contain shrink-0"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Cobertura Agiliza</h1>
              <p className="text-sm text-slate-600 mt-1">
                Cobertura por zonas, días de visita y barrios atendidos.
              </p>
            </div>
          </div>
        </div>

        {/* FILTRO */}
<div className="bg-white border border-sky-600 rounded-2xl shadow-sm p-4">

  <div className="mb-3">
    <h2 className="text-sm font-semibold text-slate-700">
      Seleccione una provincia para visualizar su mapa de cobertura
    </h2>
    <p className="text-xs text-slate-500 mt-1">
      Consulte zonas cubiertas, horarios de visita y barrios atendidos.
    </p>
  </div>

  <div className="flex items-center gap-2 w-full max-w-[390px]">
    <select
      value={selectedProvince}
      className="border rounded-xl p-3 w-full max-w-[350px] focus:ring-2 focus:ring-blue-500 outline-none text-sm"
      onChange={(e) => handleProvinceChange(e.target.value)}
    >
      <option value="">Seleccione provincia</option>
      {provinces.map((province) => (
        <option key={province} value={province}>
          {province}
        </option>
      ))}
    </select>

    <button
      type="button"
      title="Actualizar datos para obtener la información más reciente"
      disabled={!selectedProvince}
      onClick={() => loadCoverage(selectedProvince)}
      className="shrink-0 p-3 rounded-xl border border-sky-600 text-sky-700 hover:bg-sky-50 active:bg-sky-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M8 16H3v5"/>
      </svg>
    </button>
  </div>
</div>

        {/* TABLA — overflow-x-auto para scroll horizontal solo dentro de la tabla */}
        <div className="bg-white border border-sky-600 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <ClientCoverageTable              
              data={coverageData}
              onViewDistrict={handleViewDistrict}
            />
          </div>
        </div>

        <div className="text-left">
          <AppVersion />
        </div>
      </div>

      {/* DIALOG */}
      <CoverageNeighborhoodsDialog
        province={selectedProvince}
        canton={selectedCanton}
        district={selectedDistrict}
        open={dialogOpen}
        title={dialogTitle}
        covered={coveredNeighborhoods}
        uncovered={uncoveredNeighborhoods}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
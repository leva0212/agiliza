"use client";

import { useEffect, useState } from "react";
import { LocalidadesService } from "@/services/localidades_service";
import { getProvinceCoverageCounts } from "@/modules/routes/api/get-province-coverage-counts";
import { getDistrictNeighborhoods } from "@/modules/routes/api/get-district-neighborhoods";
import { ClientCoverageTable } from "@/modules/routes/components/client-coverage-table";
import { CoverageNeighborhoodsDialog } from "@/modules/routes/components/coverage-neighborhoods-dialog";
import Image from "next/image";
import { AppVersion } from "@/shared/components/app-version";
import { Button } from "@mui/material";

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
  const provinces =
  LocalidadesService.provinciasLista;

  const [selectedProvince, setSelectedProvince] = useState("");
  const [coverageData, setCoverageData] = useState<CoverageRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [coveredNeighborhoods, setCoveredNeighborhoods] = useState<string[]>([]);
  const [uncoveredNeighborhoods, setUncoveredNeighborhoods] = useState<string[]>([]);

  async function loadCoverage(provinceName: string) {
    try {
 const provinceMap =
  LocalidadesService.localidadesMap[
    provinceName
  ];
      if (!provinceMap) {
        setCoverageData([]);
        return;
      }

      // Construir lista local con canton+distrito de BarriosService
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

      // Traer conteos reales con district_id de BD
      const counts = await getProvinceCoverageCounts(provinceName);

      // BUG FIX: antes se asignaba un district_id temporal (districtIndex++) a cada
      // fila y se reemplazaba solo si había un match en counts. Los distritos sin
      // cobertura quedaban con un ID inventado (1, 2, 3…), lo que hacía que
      // getDistrictNeighborhoods los llamara con IDs incorrectos y no devolviera nada.
      //
      // Solución: si counts no trae un district_id para ese distrito, dejamos district_id = 0.
      // El botón "Ver barrios" en ClientCoverageTable solo debe habilitarse (o su handler
      // debe guardar) cuando district_id > 0.
      const merged: CoverageRow[] = localDistricts.map((district) => {
        const match = counts.find(
          (item: any) =>
            item.canton === district.canton && item.district === district.district,
        );

        return {
          ...district,
          // Si hay match usamos el district_id real de BD; si no, 0 (desconocido)
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
    // BUG FIX: si district_id es 0 (desconocido) no podemos consultar los barrios
    if (!row.district_id) return;

    const result = await getDistrictNeighborhoods(row.district_id, null);

    setDialogTitle(`${row.canton} → ${row.district}`);
    setSelectedCanton(
  row.canton,
);

setSelectedDistrict(
  row.district,
);
    setCoveredNeighborhoods(
      result.filter((item: any) => item.has_coverage).map((item: any) => item.name),
    );
    setUncoveredNeighborhoods(
      result.filter((item: any) => !item.has_coverage).map((item: any) => item.name),
    );
    setDialogOpen(true);
  }
const [

  selectedCanton,

  setSelectedCanton,

] = useState(
  "",
);

const [

  selectedDistrict,

  setSelectedDistrict,

] = useState(
  "",
);

  useEffect(() => {
    if (!selectedProvince) return;
    loadCoverage(selectedProvince);
  }, [selectedProvince]);

  return (

   
    
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      

      {/* HEADER */}
      <div className="bg-white border border-sky-600 rounded-2xl shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Image
            src="/images/agiliza-logo.jpg"
            alt="Agiliza"
            width={120}
            height={120}
            className="object-contain"
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-blue-900">Cobertura Agiliza</h1>
            <p className="text-sm text-slate-600 mt-1">
              Cobertura por zonas, días de visita y barrios atendidos.
            </p>
          </div>
        </div>
      </div>

      {/* FILTRO */}
      <div className="bg-white border border-sky-600 rounded-2xl shadow-sm p-4 mb-6">
        <select
          value={selectedProvince}
          className="border rounded-xl p-3 max-w-[260px] focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setSelectedProvince(e.target.value)}
        >
          <option value="">Seleccione provincia</option>
          {provinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      {/* TABLA */}
      <div className="bg-white border border-sky-600 rounded-2xl shadow-sm p-2">
        <ClientCoverageTable data={coverageData} onViewDistrict={handleViewDistrict} />
      </div>

      <div className="mt-4 text-left flex justify-start">
        <AppVersion />
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
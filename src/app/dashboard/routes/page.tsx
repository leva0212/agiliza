"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, MapPinned } from "lucide-react";
import { toast } from "sonner";

import { UiMessage } from "@/shared/components/ui-message";
import { getRouteById } from "@/modules/routes/api/get-route-by-id";
import { saveRoute } from "@/modules/routes/api/save-route";
import { getRouteDistrictCoverage } from "@/modules/routes/api/get-route-district-coverage";
import { getCantons } from "@/modules/routes/api/get-cantons";
import { getDistricts } from "@/modules/routes/api/get-districts";
import { getNeighborhoods } from "@/modules/routes/api/get-neighborhoods";
import { getDistrictNeighborhoods } from "@/modules/routes/api/get-district-neighborhoods";
import { getRouteDistrictVisitDays } from "@/modules/routes/api/get-route-district-visit-days";
import { useProvinces } from "@/modules/routes/hooks/use-provinces";
import { CoverageGroupedTable } from "@/modules/routes/components/coverage-grouped-table";
import { CoverageNeighborhoodsDialog } from "@/modules/routes/components/coverage-neighborhoods-dialog";
import { LocalidadesService } from "@/services/localidades_service";

const WEEK_DAYS = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

const DISTRICT_DAYS = [
  { label: "L", value: "monday" },
  { label: "M", value: "tuesday" },
  { label: "M", value: "wednesday" },
  { label: "J", value: "thursday" },
  { label: "V", value: "friday" },
  { label: "S", value: "saturday" },
  { label: "D", value: "sunday" },
];

export default function RoutesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeId = searchParams.get("id");
  const { data: provinces } = useProvinces();

  // ─── Selección territorial
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCanton, setSelectedCanton] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedDistrictName, setSelectedDistrictName] = useState("");

  const [cantons, setCantons] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<number[]>([]);

  // selectedProvince / selectedCanton guardan IDs.
  // LocalidadesService indexa por NOMBRE → derivamos los nombres aquí.
  const selectedProvinceName =
    provinces?.find((p: any) => String(p.id) === selectedProvince)?.name || "";
  const selectedCantonName =
    cantons.find((c: any) => String(c.id) === selectedCanton)?.name || "";

  // ─── Datos de ruta
  const [routeName, setRouteName] = useState("");
  const [estimatedHours, setEstimatedHours] = useState(24);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // ─── Horas por defecto
  const [defaultMinHours, setDefaultMinHours] = useState(24);
  const [defaultMaxHours, setDefaultMaxHours] = useState(0);

  // ─── Horas por distrito
  const [districtMinHours, setDistrictMinHours] = useState(24);
  const [districtMaxHours, setDistrictMaxHours] = useState(0);

  const [districtVisitDays, setDistrictVisitDays] = useState<
    { district_id: number; days: string[] }[]
  >([]);
  const [districtDeliveryTimes, setDistrictDeliveryTimes] = useState<
    { district_id: number; min_hours: number; max_hours: number }[]
  >([]);

  // ─── Cobranzas
  const [companyDeliveryCharge, setCompanyDeliveryCharge] = useState(0);
  const [courierDeliveryPay, setCourierDeliveryPay] = useState(0);
  const [companyFailedCharge, setCompanyFailedCharge] = useState(0);
  const [courierFailedPay, setCourierFailedPay] = useState(0);

  // ─── Cobertura / tabla
  const [coverageView, setCoverageView] = useState<any[]>([]);
  const [coverageTotal, setCoverageTotal] = useState(0);
  const [coveragePagination, setCoveragePagination] = useState({
    pageIndex: 0,
    pageSize: 100,
  });

  // ─── Diálogo de barrios cubiertos
  const [neighborhoodsDialogOpen, setNeighborhoodsDialogOpen] = useState(false);
  const [neighborhoodsDialogTitle, setNeighborhoodsDialogTitle] = useState("");
  const [dialogProvince, setDialogProvince] = useState("");
  const [dialogCanton, setDialogCanton] = useState("");
  const [dialogDistrict, setDialogDistrict] = useState("");
  const [coveredNeighborhoods, setCoveredNeighborhoods] = useState<string[]>([]);
  const [uncoveredNeighborhoods, setUncoveredNeighborhoods] = useState<string[]>([]);

  // ─── Mensajes UI
  const [uiMessage, setUiMessage] = useState({
    open: false,
    type: "info" as "success" | "error" | "warning" | "info" | "question",
    title: "",
    message: "",
  });

  // ─── BUG FIX: ref para acceder al valor actualizado de selectedDays
  // dentro de callbacks sin stale closure
  const selectedDaysRef = useRef<string[]>([]);

  // ─── BUG FIX: ref para saber si el efecto de districtDeliveryTimes
  // debe ignorar la ejecución (evita race condition con handleDistrictChange)
  const skipDeliveryEffect = useRef(false);

  // Mantener ref sincronizado con el state
  useEffect(() => {
    selectedDaysRef.current = selectedDays;
  }, [selectedDays]);

  // ─── BUG FIX: districtDeliveryTimes effect
  // Antes: se disparaba con los valores de horas del distrito ANTERIOR antes de que
  // handleDistrictChange terminara de actualizarlos → race condition.
  // Ahora: handleDistrictChange marca skipDeliveryEffect = true antes de
  // setear districtMinHours/MaxHours, para que este efecto no pise esos valores.
  useEffect(() => {
    if (!selectedDistrict) return;
    if (skipDeliveryEffect.current) {
      skipDeliveryEffect.current = false;
      return;
    }

    setDistrictDeliveryTimes((previous) => {
      const exists = previous.some(
        (item) => item.district_id === selectedDistrict,
      );
      const updatedItem = {
        district_id: selectedDistrict,
        min_hours: districtMinHours,
        max_hours: districtMinHours === 0 ? 0 : districtMaxHours,
      };
      if (exists) {
        return previous.map((item) =>
          item.district_id === selectedDistrict ? updatedItem : item,
        );
      }
      return [...previous, updatedItem];
    });
  }, [selectedDistrict, districtMinHours, districtMaxHours]);

  // ─── BUG FIX: districtVisitDays effect
  // Antes: usaba selectedDays directamente → stale closure, leía el valor
  // al momento de definir el effect, no el valor actual.
  // Ahora: usa selectedDaysRef.current para leer siempre el valor más reciente.
  useEffect(() => {
    if (!selectedDistrict) return;

    setDistrictVisitDays((previous) => {
      const currentDistrict = previous.find(
        (item) => item.district_id === selectedDistrict,
      );
      const currentDays = currentDistrict?.days ?? [...selectedDaysRef.current];
      const updatedItem = {
        district_id: selectedDistrict,
        days: [...currentDays],
      };
      const exists = previous.some(
        (item) => item.district_id === selectedDistrict,
      );
      if (exists) {
        return previous.map((item) =>
          item.district_id === selectedDistrict ? updatedItem : item,
        );
      }
      return [...previous, updatedItem];
    });
  }, [selectedDistrict]);

  // ─── BUG FIX: coveragePagination eliminado de las dependencias
  // Antes: cualquier cambio de página en la tabla recargaba toda la ruta desde BD.
  // Ahora: solo carga cuando cambia routeId.
  useEffect(() => {
    async function loadRoute() {
      if (!routeId) return;

      try {
        const route = await getRouteById(routeId);
        const coverage = await getRouteDistrictCoverage(routeId);

        setCoverageView(coverage || []);
        setCoverageTotal(coverage?.length || 0);

        setDistrictDeliveryTimes(
          (coverage || []).map((item: any) => ({
            district_id: item.district_id,
            min_hours: item.min_hours ?? 0,
            max_hours: item.max_hours ?? 0,
          })),
        );

        setRouteName(route.name || "");
        setEstimatedHours(route.estimated_hours || 0);

        const days = route.route_visit_days?.map((item: any) => item.day) || [];
        setSelectedDays(days);
        selectedDaysRef.current = days;

        setSelectedNeighborhoods(
          route.route_coverage?.map((item: any) => item.neighborhood_id) || [],
        );

        const districtDays = await getRouteDistrictVisitDays(routeId);
        const groupedDays = districtDays.reduce((acc: any, item: any) => {
          const existing = acc.find(
            (x: any) => x.district_id === item.district_id,
          );
          if (existing) {
            existing.days.push(item.day);
          } else {
            acc.push({ district_id: item.district_id, days: [item.day] });
          }
          return acc;
        }, []);

        setDistrictVisitDays(groupedDays);
      } catch (error) {
        console.error("loadRoute error:", error);
        setCoverageView([]);
        setCoverageTotal(0);
      }
    }

    loadRoute();
  }, [routeId]);

  function handleClear() {
    setSelectedProvince("");
    setSelectedCanton("");
    setSelectedDistrict(null);
    setCantons([]);
    setDistricts([]);
    setNeighborhoods([]);

    if (routeId) return;

    setRouteName("");
    setEstimatedHours(24);
    setSelectedDays([]);
    selectedDaysRef.current = [];
    setSelectedNeighborhoods([]);
    setCompanyDeliveryCharge(0);
    setCourierDeliveryPay(0);
    setCompanyFailedCharge(0);
    setCourierFailedPay(0);
  }

  function toggleDistrictVisitDay(day: string) {
    if (!selectedDistrict) return;

    setDistrictVisitDays((previous) => {
      const districtConfig = previous.find(
        (item) => item.district_id === selectedDistrict,
      );
      const currentDays = districtConfig?.days || [];
      const updatedDays = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];

      const otherDistricts = previous.filter(
        (item) => item.district_id !== selectedDistrict,
      );

      return [
        ...otherDistricts,
        { district_id: selectedDistrict, days: updatedDays },
      ];
    });
  }

  function toggleDay(day: string) {
    setSelectedDays((prev) => {
      const next = prev.includes(day)
        ? prev.filter((x) => x !== day)
        : [...prev, day];
      selectedDaysRef.current = next;
      return next;
    });
  }

  async function handleSaveRoute() {
    try {
      if (!routeName.trim()) {
        setUiMessage({
          open: true,
          type: "warning",
          title: "Validación",
          message: "Debe ingresar un nombre.",
        });
        return;
      }

      if (selectedNeighborhoods.length === 0) {
        setUiMessage({
          open: true,
          type: "warning",
          title: "Validación",
          message: "Debe seleccionar barrios.",
        });
        return;
      }

      const savedRouteId = await saveRoute({
        routeId,
        routeName,
        estimatedHours: defaultMinHours,
        selectedDays,
        selectedNeighborhoods,
        company_delivery_charge: companyDeliveryCharge,
        courier_delivery_pay: courierDeliveryPay,
        company_failed_charge: companyFailedCharge,
        courier_failed_pay: courierFailedPay,
        districtDeliveryTimes,
        districtVisitDays,
      });

      if (!routeId) {
        router.replace(`/dashboard/routes?id=${savedRouteId}`);
      }

      if (routeId) {
        const coverage = await getRouteDistrictCoverage(routeId);
        setCoverageView(coverage || []);
        setCoverageTotal(coverage?.length || 0);
      }

      setUiMessage({
        open: true,
        type: "success",
        title: routeId ? "Ruta actualizada" : "Ruta creada",
        message: "Guardado correctamente.",
      });
    } catch (error) {
      console.error(error);
      setUiMessage({
        open: true,
        type: "error",
        title: "Error",
        message: "No fue posible guardar.",
      });
    }
  }

  async function handleProvinceChange(provinceId: number) {
    const data = await getCantons(provinceId);
    setCantons(data || []);
    setDistricts([]);
    setNeighborhoods([]);
  }

  async function handleCantonChange(cantonId: number) {
    const data = await getDistricts(cantonId);
    setDistricts(data || []);
    setNeighborhoods([]);
  }

  async function handleDistrictChange(districtId: number) {
    // Guardar nombre real del distrito (para maps / localidades_service)
    const districtName =
      districts.find((district: any) => district.id === districtId)?.name || "";
    setSelectedDistrictName(districtName);
    console.log("handleDistrictChange, selectedDistrictName:", districtName);

    // ─── BARRIOS
    const data = await getNeighborhoods(districtId);
    setNeighborhoods(data || []);

    const currentDistrictNeighborhoodIds = data.map(
      (neighborhood: any) => neighborhood.id,
    );

    // Primero revisar memoria
    const localDistrictIds = selectedNeighborhoods.filter((neighborhoodId) =>
      currentDistrictNeighborhoodIds.includes(neighborhoodId),
    );

    // Si no está en memoria, buscar BD
    if (localDistrictIds.length === 0 && routeId) {
      const coverage = await getDistrictNeighborhoods(districtId, routeId);
      const coveredIds = coverage
        .filter((item: any) => item.has_coverage)
        .map((item: any) => item.id);

      setSelectedNeighborhoods((previous) => {
        const otherDistricts = previous.filter(
          (neighborhoodId) =>
            !currentDistrictNeighborhoodIds.includes(neighborhoodId),
        );
        return [...otherDistricts, ...coveredIds];
      });
    }

    // ─── HORAS (prioridad: memoria → BD → defaults)
    let minToUse = defaultMinHours;
    let maxToUse = defaultMaxHours;

    const tempHours = districtDeliveryTimes.find(
      (item) => item.district_id === districtId,
    );

    if (tempHours) {
      minToUse = tempHours.min_hours;
      maxToUse = tempHours.max_hours;
    } else {
      const savedHours = coverageView.find(
        (item: any) => item.district_id === districtId,
      );
      if (savedHours) {
        minToUse = savedHours.min_hours ?? 0;
        maxToUse = savedHours.max_hours ?? 0;
      }
    }

    setDistrictMinHours(minToUse);
    setDistrictMaxHours(maxToUse);

    setDistrictDeliveryTimes((previous) => [
      ...previous.filter((item) => item.district_id !== districtId),
      {
        district_id: districtId,
        min_hours: minToUse,
        max_hours: minToUse === 0 ? 0 : maxToUse,
      },
    ]);

    // ─── DÍAS (prioridad: memoria → BD → defaults)
    let daysToUse = [...selectedDaysRef.current];

    const tempDays = districtVisitDays.find(
      (item) => item.district_id === districtId,
    );

    if (tempDays?.days?.length) {
      daysToUse = [...tempDays.days];
    }

    setDistrictVisitDays((previous) => [
      ...previous.filter((item) => item.district_id !== districtId),
      {
        district_id: districtId,
        days: [...daysToUse],
      },
    ]);
  }

  function handleToggleDistrict() {
    if (neighborhoods.length === 0) return;

    const districtNeighborhoodIds = neighborhoods.map(
      (neighborhood: any) => neighborhood.id,
    );

    setSelectedNeighborhoods((previous) => {
      const allSelected = districtNeighborhoodIds.every((id: number) =>
        previous.includes(id),
      );

      if (allSelected) {
        if (selectedDistrict) {
          setDistrictDeliveryTimes((prev) =>
            prev.filter((item) => item.district_id !== selectedDistrict),
          );
        }
        return previous.filter((id) => !districtNeighborhoodIds.includes(id));
      }

      return Array.from(new Set([...previous, ...districtNeighborhoodIds]));
    });
  }

  function toggleNeighborhood(neighborhoodId: number) {
    setSelectedNeighborhoods((previous) =>
      previous.includes(neighborhoodId)
        ? previous.filter((id) => id !== neighborhoodId)
        : [...previous, neighborhoodId],
    );

    if (selectedDistrict) {
      setDistrictDeliveryTimes((previous) => {
        const exists = previous.some(
          (item) => item.district_id === selectedDistrict,
        );
        if (exists) {
          return previous.map((item) =>
            item.district_id === selectedDistrict
              ? {
                  ...item,
                  min_hours: districtMinHours,
                  max_hours: districtMinHours === 0 ? 0 : districtMaxHours,
                }
              : item,
          );
        }
        return [
          ...previous,
          {
            district_id: selectedDistrict,
            min_hours: districtMinHours,
            max_hours: districtMinHours === 0 ? 0 : districtMaxHours,
          },
        ];
      });
    }
  }

  async function handleViewDistrict(row: any) {
    if (!routeId) return;

    setDialogProvince(row.province);
    setDialogCanton(row.canton);
    setDialogDistrict(row.district);

    const result = await getDistrictNeighborhoods(row.district_id, routeId);

    setCoveredNeighborhoods(
      result.filter((x: any) => x.has_coverage).map((x: any) => x.name),
    );
    setUncoveredNeighborhoods(
      result.filter((x: any) => !x.has_coverage).map((x: any) => x.name),
    );
    setNeighborhoodsDialogTitle(
      `${row.province} → ${row.canton} → ${row.district}`,
    );
    setNeighborhoodsDialogOpen(true);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">
          {routeId ? "Editar Ruta" : "Nueva Ruta"}
        </h1>

        {/* NOMBRE + TIEMPO BASE */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <input
            placeholder="Nombre de ruta"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
          />

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium">Tiempo base:</label>
            <select
              value={defaultMinHours}
              onChange={(e) => {
                const value = Number(e.target.value);
                setDefaultMinHours(value);
                if (value === 0) setDefaultMaxHours(0);
              }}
              className="max-w-[150px] border rounded px-2 py-1"
            >
              <option value={24}>24 horas</option>
              <option value={48}>48 horas</option>
              <option value={72}>72 horas</option>
              <option value={0}>Cronograma</option>
            </select>

            {defaultMinHours !== 0 && (
              <>
                <span>a</span>
                <select
                  value={defaultMaxHours === 0 ? "" : defaultMaxHours}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    setDefaultMaxHours(value);
                  }}
                  className="max-w-[150px] border rounded px-2 py-1"
                >
                  <option value="">Igual</option>
                  <option value={24}>24 horas</option>
                  <option value={48}>48 horas</option>
                  <option value={72}>72 horas</option>
                  <option value={96}>96 horas</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* DÍAS BASE */}
        <div className="flex gap-2 flex-wrap mb-6">
          {WEEK_DAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                selectedDays.includes(day.value)
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white hover:bg-violet-50"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>

        {/* SELECTS PROVINCIA / CANTÓN / DISTRITO */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 max-w-[600px] md:grid-cols-2 gap-4">
            <select
              value={selectedProvince}
              className="border max-w-[300px] rounded-lg p-2"
              onChange={(e) => {
                const provinceId = e.target.value;
                setSelectedProvince(provinceId);
                setSelectedCanton("");
                setSelectedDistrict(null);
                setCantons([]);
                setDistricts([]);
                setNeighborhoods([]);
                if (!provinceId) return;
                handleProvinceChange(Number(provinceId));
              }}
            >
              <option value="">Provincia</option>
              {provinces?.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCanton}
              className="border max-w-[300px] rounded-lg p-3"
              onChange={(e) => {
                const cantonId = e.target.value;
                setSelectedCanton(cantonId);
                setSelectedDistrict(null);
                setDistricts([]);
                setNeighborhoods([]);
                if (!cantonId) return;
                handleCantonChange(Number(cantonId));
              }}
            >
              <option value="">Cantón</option>
              {cantons.map((canton) => (
                <option key={canton.id} value={canton.id}>
                  {canton.name}
                </option>
              ))}
            </select>
          </div>

          {/* DISTRITO + HORAS + DÍAS */}
          <div className="border p-2 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-end gap-2 rounded-lg p-4 flex-wrap">
              <select
                value={selectedDistrict || ""}
                className="border max-w-[300px] rounded-lg p-3"
                onChange={async (e) => {
                  const districtId = Number(e.target.value);
                  if (!districtId) {
                    setSelectedDistrict(null);
                    setNeighborhoods([]);
                    return;
                  }
                  setSelectedDistrict(districtId);
                  await handleDistrictChange(districtId);
                }}
              >
                <option value="">Distrito</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>

              <select
                value={districtMinHours}
                className="border rounded-lg p-1 max-w-[150px]"
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setDistrictMinHours(value);
                  if (value === 0) setDistrictMaxHours(0);
                }}
              >
                <option value={24}>24 horas</option>
                <option value={48}>48 horas</option>
                <option value={72}>72 horas</option>
                <option value={0}>Cronograma</option>
              </select>

              {districtMinHours !== 0 && (
                <select
                  value={districtMaxHours === 0 ? "" : districtMaxHours}
                  className="max-w-[150px] border rounded-lg p-3"
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    setDistrictMaxHours(value);
                  }}
                >
                  <option value="">Igual</option>
                  <option value={24}>24 horas</option>
                  <option value={48}>48 horas</option>
                  <option value={72}>72 horas</option>
                  <option value={96}>96 horas</option>
                </select>
              )}

              {selectedDistrict && (
                <button
                  type="button"
                  onClick={handleToggleDistrict}
                  className="max-w-[150px] border px-3 py-3 rounded-lg text-sm whitespace-nowrap"
                >
                  + / − Distrito
                </button>
              )}
            </div>

            {/* DÍAS POR DISTRITO */}
            <div className="flex gap-2 flex-wrap mt-2">
              {DISTRICT_DAYS.map((day) => {
                const districtConfig = districtVisitDays.find(
                  (item) => item.district_id === selectedDistrict,
                );
                const districtDays = districtConfig?.days || [];
                const isSelected = districtDays.includes(day.value);

                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDistrictVisitDay(day.value)}
                    className={`w-8 h-8 rounded-full border text-sm font-medium ${
                      isSelected
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* BARRIOS */}
        <div className="mt-6 border rounded-xl p-4 max-h-96 overflow-y-auto">
          <h2 className="font-semibold mb-4">Barrios</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {neighborhoods.map((neighborhood) => {
              const localidad = LocalidadesService.getLocalidades(
                selectedProvinceName,
                selectedCantonName,
                selectedDistrictName,
              ).find(
                (item) =>
                  item.nombre.toLowerCase() === neighborhood.name.toLowerCase(),
              );

              return (
                <div
                  key={neighborhood.id}
                  className="flex items-center justify-between border rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <label className="flex items-start gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={selectedNeighborhoods.includes(neighborhood.id)}
                      onChange={() => toggleNeighborhood(neighborhood.id)}
                      className="h-4 w-4 shrink-0 cursor-pointer mt-1"
                    />

                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700 select-none">
                        {neighborhood.name}
                      </span>

                      {localidad && (
                        <span className="text-xs text-gray-500">
                          {localidad.tipo}
                        </span>
                      )}
                    </div>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Ver ubicación"
                      onClick={() => {
                        const url = LocalidadesService.getGoogleMapsUrl(
                          selectedProvinceName,
                          selectedCantonName,
                          selectedDistrictName,
                          neighborhood.name,
                        );
                        if (!url) {
                          toast.error("Ubicación no encontrada");
                          return;
                        }
                        window.open(url, "_blank");
                      }}
                    >
                      <MapPinned size={25} />
                    </button>

                    <button
                      type="button"
                      title="Copiar coordenadas"
                      onClick={async () => {
                        const coords = LocalidadesService.getCoordsLocalidad(
                          selectedProvinceName,
                          selectedCantonName,
                          selectedDistrictName,
                          neighborhood.name,
                        );
                        if (!coords) {
                          toast.error("Ubicación no encontrada");
                          return;
                        }
                        await navigator.clipboard.writeText(
                          `${coords.lat}, ${coords.lng}`,
                        );
                        toast.success("Ubicación copiada");
                      }}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTONES */}
        {/* BUG FIX: Guardar necesitaba type="button" para no hacer submit accidental */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={handleSaveRoute}
            className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Guardar Ruta
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="border border-gray-300 bg-white px-6 py-3 rounded-xl hover:bg-gray-50"
          >
            Limpiar
          </button>
        </div>

        {/* TABLA DE COBERTURA */}
        {routeId && coverageView?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Cobertura actual</h2>
            <CoverageGroupedTable
              data={coverageView}
              pagination={coveragePagination}
              setPagination={setCoveragePagination}
              totalRows={coverageTotal}
              onViewDistrict={handleViewDistrict}
              onUpdateHours={(districtId, minHours, maxHours) => {
                setDistrictDeliveryTimes((previous) => {
                  const exists = previous.some(
                    (item) => item.district_id === districtId,
                  );
                  if (exists) {
                    return previous.map((item) =>
                      item.district_id === districtId
                        ? { ...item, min_hours: minHours, max_hours: maxHours }
                        : item,
                    );
                  }
                  return [
                    ...previous,
                    {
                      district_id: districtId,
                      min_hours: minHours,
                      max_hours: maxHours,
                    },
                  ];
                });

                setCoverageView((previous) =>
                  previous.map((row: any) =>
                    row.district_id === districtId
                      ? { ...row, min_hours: minHours, max_hours: maxHours }
                      : row,
                  ),
                );
              }}
            />
          </div>
        )}
      </div>

      <CoverageNeighborhoodsDialog
        province={dialogProvince}
        canton={dialogCanton}
        district={dialogDistrict}
        open={neighborhoodsDialogOpen}
        title={neighborhoodsDialogTitle}
        covered={coveredNeighborhoods}
        uncovered={uncoveredNeighborhoods}
        onClose={() => setNeighborhoodsDialogOpen(false)}
      />

      <UiMessage
        open={uiMessage.open}
        title={uiMessage.title}
        message={uiMessage.message}
        type={uiMessage.type}
        onClose={() => setUiMessage((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

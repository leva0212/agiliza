"use client";
import { UiMessage } from "@/shared/components/ui-message";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getRouteById } from "@/modules/routes/api/get-route-by-id";
import { CoverageGroupedTable } from "@/modules/routes/components/coverage-grouped-table";
import { saveRoute } from "@/modules/routes/api/save-route";
//import { getRouteCoverageView } from "@/modules/routes/api/get-route-coverage-view";
import { getRouteDistrictCoverage } from "@/modules/routes/api/get-route-district-coverage";
import { useProvinces } from "@/modules/routes/hooks/use-provinces";

import { getCantons } from "@/modules/routes/api/get-cantons";
import { getDistricts } from "@/modules/routes/api/get-districts";
import { getNeighborhoods } from "@/modules/routes/api/get-neighborhoods";

import { getDistrictNeighborhoods } from "@/modules/routes/api/get-district-neighborhoods";

import { CoverageNeighborhoodsDialog } from "@/modules/routes/components/coverage-neighborhoods-dialog";
import { getRouteDistrictVisitDays } from "@/modules/routes/api/get-route-district-visit-days";
//import { BarriosService } from "@/barrios.service";
export default function RoutesPage() {
  const router = useRouter();
  const [defaultMinHours, setDefaultMinHours] = useState(24);

  const [defaultMaxHours, setDefaultMaxHours] = useState(0);
  /*
  const [districtDeliveryTimes, setDistrictDeliveryTimes] = useState<
    {
      district_id: number;

      min_hours: number;

      max_hours: number;
    }[]
  >([]);*/

  const [districtMinHours, setDistrictMinHours] = useState(24);

  const [districtMaxHours, setDistrictMaxHours] = useState(0);
  const [districtVisitDays, setDistrictVisitDays] = useState<
    {
      district_id: number;

      days: string[];
    }[]
  >([]);

  const [districtDeliveryTimes, setDistrictDeliveryTimes] = useState<
    {
      district_id: number;

      min_hours: number;

      max_hours: number;
    }[]
  >([]);

  const [coveragePagination, setCoveragePagination] = useState({
    pageIndex: 0,

    pageSize: 100,
  });
  const [coverageTotal, setCoverageTotal] = useState(0);
  const [selectedProvince, setSelectedProvince] = useState("");

  const [selectedCanton, setSelectedCanton] = useState("");

  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const searchParams = useSearchParams();

  const routeId = searchParams.get("id");
  const [coverageView, setCoverageView] = useState<any[]>([]);
  const [neighborhoodsDialogOpen, setNeighborhoodsDialogOpen] = useState(false);

  const [neighborhoodsDialogTitle, setNeighborhoodsDialogTitle] = useState("");

  const [coveredNeighborhoods, setCoveredNeighborhoods] = useState<string[]>(
    [],
  );

  const [uncoveredNeighborhoods, setUncoveredNeighborhoods] = useState<
    string[]
  >([]);

  useEffect(() => {

  if (
    !selectedDistrict
  ) {

    return;

  }

  setDistrictDeliveryTimes(

    (
      previous
    ) => {

      const exists =

        previous.some(

          (
            item
          ) =>

            item.district_id === selectedDistrict

        );

      const updatedItem = {

        district_id:
          selectedDistrict,

        min_hours:
          districtMinHours,

        max_hours:

          districtMinHours === 0

            ? 0

            : districtMaxHours,

      };

      if (
        exists
      ) {

        return previous.map(

          (
            item
          ) =>

            item.district_id === selectedDistrict

              ? updatedItem

              : item

        );

      }

      return [

        ...previous,

        updatedItem,

      ];

    }

  );

}, [

  selectedDistrict,

  districtMinHours,

  districtMaxHours,

]);

useEffect(() => {

  if (
    !selectedDistrict
  ) {

    return;

  }

  setDistrictVisitDays(

    (
      previous
    ) => {

      // buscar config actual del distrito

      const currentDistrict =

        previous.find(

          (
            item
          ) =>

            item.district_id === selectedDistrict

        );

      // si no existe, copiar días base

      const currentDays =

        currentDistrict?.days ||

        [...selectedDays];

      const updatedItem = {

        district_id:
          selectedDistrict,

        days: [

          ...currentDays,

        ],

      };

      const exists =

        previous.some(

          (
            item
          ) =>

            item.district_id === selectedDistrict

        );

      if (
        exists
      ) {

        return previous.map(

          (
            item
          ) =>

            item.district_id === selectedDistrict

              ? updatedItem

              : item

        );

      }

      return [

        ...previous,

        updatedItem,

      ];

    }

  );

}, [

  selectedDistrict,

]);

  useEffect(() => {
    async function loadRoute() {
      if (!routeId) {
        return;
      }

      try {
        // ============================
        // Cargar datos principales de la ruta
        // ============================

        const route = await getRouteById(routeId);

        // ============================
        // Cargar SOLO distritos
        // (NO barrios)
        // ============================

        const coverage = await getRouteDistrictCoverage(routeId);

        //console.log("district coverage:", coverage);

        // tabla inferior

        setCoverageView(coverage || []);

        setCoverageTotal(coverage?.length || 0);
        setDistrictDeliveryTimes(
          (coverage || []).map((item: any) => ({
            district_id: item.district_id,

            min_hours: item.min_hours ?? 0,

            max_hours: item.max_hours ?? 0,
          })),
        );

        // ============================
        // Formulario
        // ============================

        // nombre

        setRouteName(route.name || "");

        // horas

        setEstimatedHours(route.estimated_hours || 0);

        // días

        setSelectedDays(
          route.route_visit_days?.map((item: any) => item.day) || [],
        );

        // barrios seleccionados
        // (para el formulario de edición)

        setSelectedNeighborhoods(
          route.route_coverage?.map((item: any) => item.neighborhood_id) || [],
        );

        const districtDays = await getRouteDistrictVisitDays(routeId);

        const groupedDays = districtDays.reduce(
          (
            acc: any,

            item: any,
          ) => {
            const existing = acc.find(
              (x: any) => x.district_id === item.district_id,
            );

            if (existing) {
              existing.days.push(item.day);
            } else {
              acc.push({
                district_id: item.district_id,

                days: [item.day],
              });
            }

            return acc;
          },

          [],
        );

        setDistrictVisitDays(groupedDays);

        // costos
        /*
    setCompanyDeliveryCharge(
      route.company_delivery_charge || 0
    );

    setCourierDeliveryPay(
      route.courier_delivery_pay || 0
    );

    setCompanyFailedCharge(
      route.company_failed_charge || 0
    );

    setCourierFailedPay(
      route.courier_failed_pay || 0
    );*/
      } catch (error) {
        console.error("loadRoute error:", error);

        setCoverageView([]);

        setCoverageTotal(0);
      }
    }

    loadRoute();
  }, [routeId, coveragePagination]);

  const [uiMessage, setUiMessage] = useState({
    open: false,

    type: "info" as "success" | "error" | "warning" | "info" | "question",

    title: "",

    message: "",
  });
  const weekDays = [
    {
      value: "monday",
      label: "Lunes",
    },
    {
      value: "tuesday",
      label: "Martes",
    },
    {
      value: "wednesday",
      label: "Miércoles",
    },
    {
      value: "thursday",
      label: "Jueves",
    },
    {
      value: "friday",
      label: "Viernes",
    },
    {
      value: "saturday",
      label: "Sábado",
    },
    {
      value: "sunday",
      label: "Domingo",
    },
  ];
  const [estimatedHours, setEstimatedHours] = useState(24);

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const { data: provinces } = useProvinces();

  const [routeName, setRouteName] = useState("");

  const [cantons, setCantons] = useState<any[]>([]);

  const [districts, setDistricts] = useState<any[]>([]);

  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);

  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<number[]>(
    [],
  );

  const [companyDeliveryCharge, setCompanyDeliveryCharge] = useState(0);

  const [courierDeliveryPay, setCourierDeliveryPay] = useState(0);

  const [companyFailedCharge, setCompanyFailedCharge] = useState(0);

  const [courierFailedPay, setCourierFailedPay] = useState(0);

  function handleClear() {
    // ===================================
    // LIMPIAR SELECTS VISUALES SIEMPRE
    // ===================================

    setSelectedProvince("");

    setSelectedCanton("");

    setSelectedDistrict(null);

    setCantons([]);

    setDistricts([]);

    setNeighborhoods([]);

    // ===================================
    // SI ESTÁ EDITANDO
    // SOLO LIMPIAR FILTROS
    // ===================================

    if (routeId) {
      return;
    }

    // ===================================
    // SI ESTÁ CREANDO
    // LIMPIAR TODO
    // ===================================

    setRouteName("");

    setEstimatedHours(24);

    setSelectedDays([]);

    setSelectedNeighborhoods([]);

    // costos

    setCompanyDeliveryCharge(0);

    setCourierDeliveryPay(0);

    setCompanyFailedCharge(0);

    setCourierFailedPay(0);
  }

  function toggleDistrictVisitDay(day: string) {
    if (!selectedDistrict) {
      return;
    }

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

      console.log("districtVisitDays:", previous);

      return [
        ...otherDistricts,

        {
          district_id: selectedDistrict,

          days: updatedDays,
        },
      ];
    });
  }
  function toggleDay(day: string) {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((x) => x !== day);
      }

      return [...prev, day];
    });
  }
  async function handleSaveRoute() {
    try {
      // VALIDACIONES UI

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

      console.log("districtDeliveryTimes:", districtDeliveryTimes);

      const savedRouteId =

  await saveRoute({

    routeId,

    routeName,

    estimatedHours:
      defaultMinHours,

    selectedDays,

    selectedNeighborhoods,

    company_delivery_charge:
      companyDeliveryCharge,

    courier_delivery_pay:
      courierDeliveryPay,

    company_failed_charge:
      companyFailedCharge,

    courier_failed_pay:
      courierFailedPay,

    districtDeliveryTimes,

    districtVisitDays,

  });

      // si era nueva ruta

      if (!routeId) {
        router.replace(`/dashboard/routes?id=${savedRouteId}`);
      }

      // refrescar tabla si estoy editando

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
    // ======================
    // Cargar barrios
    // ======================

    const data = await getNeighborhoods(districtId);

    setNeighborhoods(data || []);

    // ======================
    // HORAS
    // ======================

    const existingDistrict = coverageView.find(
      (item: any) => item.district_id === districtId,
    );

    if (existingDistrict) {
      // usar valores guardados

      setDistrictMinHours(existingDistrict.min_hours ?? 0);

      setDistrictMaxHours(existingDistrict.max_hours ?? 0);
    } else {
      // distrito nuevo:
      // heredar tiempo base

      setDistrictMinHours(defaultMinHours);

      setDistrictMaxHours(defaultMaxHours);
    }

    // ======================
    // DÍAS
    // ======================

    const existingVisitDays = districtVisitDays.find(
      (item) => item.district_id === districtId,
    );

    const daysToUse = existingVisitDays?.days?.length
      ? existingVisitDays.days
      : selectedDays;

    // siempre sincronizar el distrito activo

    setDistrictVisitDays((previous) => [
      ...previous.filter((item) => item.district_id !== districtId),

      {
        district_id: districtId,

        days: [...daysToUse],
      },
    ]);
  }

  function handleToggleDistrict() {

  if (
    neighborhoods.length === 0
  ) {

    return;

  }

  const districtNeighborhoodIds =

    neighborhoods.map(

      (
        neighborhood: any
      ) =>

        neighborhood.id

    );

  setSelectedNeighborhoods(

    (
      previous
    ) => {

      const allSelected =

        districtNeighborhoodIds.every(

          (
            id: number
          ) =>

            previous.includes(
              id
            )

        );

      // quitar

      if (
        allSelected
      ) {

        return previous.filter(

          (
            id
          ) =>

            !districtNeighborhoodIds.includes(
              id
            )

        );

      }

      // agregar

      return Array.from(

        new Set([

          ...previous,

          ...districtNeighborhoodIds,

        ])

      );

    }

  );

}

  function toggleNeighborhood(neighborhoodId: number) {
    // barrios

    setSelectedNeighborhoods((previous) =>
      previous.includes(neighborhoodId)
        ? previous.filter((id) => id !== neighborhoodId)
        : [...previous, neighborhoodId],
    );

    // guardar SLA del distrito automáticamente

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
    if (!routeId) {
      return;
    }

    const result = await getDistrictNeighborhoods(
      row.district_id,

      routeId,
    );

    setCoveredNeighborhoods(
      result

        .filter((x: any) => x.has_coverage)

        .map((x: any) => x.name),
    );

    setUncoveredNeighborhoods(
      result

        .filter((x: any) => !x.has_coverage)

        .map((x: any) => x.name),
    );

    setNeighborhoodsDialogTitle(
      `${row.province} → ` + `${row.canton} → ` + `${row.district}`,
    );

    setNeighborhoodsDialogOpen(true);
  }

  return (
    <div className="max-w-6xl mx-auto p-6 ">
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">
          {routeId ? "Editar Ruta" : "Nueva Ruta"}
        </h1>

        {/* NOMBRE RUTA */}

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <input
            placeholder="Nombre de ruta"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
          />
          {/* HORAS ESTIMADAS */}
          <div
            className="
    flex
    items-center
    gap-3
    mb-4
  "
          >
            <label
              className="
      text-sm
      font-medium
    "
            >
              Tiempo base:
            </label>
            <select
              value={defaultMinHours}
              onChange={(e) => {
                const value = Number(e.target.value);

                setDefaultMinHours(value);

                // cronograma

                if (value === 0) {
                  setDefaultMaxHours(0);
                }
              }}
              className="
    max-w-[150px]
    border
    rounded
    px-2
    py-1
  "
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
                  className="
         max-w-[150px]
        border
        rounded
        px-2
        py-1
      "
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
          {/*<select
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(Number(e.target.value))}
          >
            <option value={24}>24 horas</option>

            <option value={48}>48 horas</option>

            <option value={72}>72 horas</option>
            <option value={0}>Cronograma</option>
          </select>*/}
        </div>
        <div className="flex gap-2 flex-wrap mb-6">
          {weekDays.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition
        
        ${
          selectedDays.includes(day.value)
            ? "bg-violet-600 text-white border-violet-600"
            : "bg-white hover:bg-violet-50"
        }
      `}
            >
              {day.label}
            </button>
          ))}
        </div>

        {/* SELECTS INICIO*/}
        <div className="space-y-4">
          {/* FILA 1 */}

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

                if (!provinceId) {
                  return;
                }

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

                if (!cantonId) {
                  return;
                }

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

          {/* FILA 2 */}
          <div className="border  p-2 rounded-lg">
            <div
              className="
    flex
    flex-col
    md:flex-row
    md:items-end
    gap-2
              
    rounded-lg
    p-4 
    flex-wrap
  "
            >
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

                  // primero cambiar distrito activo

                  setSelectedDistrict(districtId);

                  // luego sincronizar UI

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

                  // si es cronograma
                  // sincronizamos max

                  if (value === 0) {
                    setDistrictMaxHours(0);
                  }
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
                  className="
                 max-w-[150px]
      border
      rounded-lg
      p-3
    "
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
                  className="
                 max-w-[150px]
          border
          px-3
          py-3
          rounded-lg
          text-sm
          whitespace-nowrap
        "
                >
                  + / − Distrito
                </button>
              )}
            </div>
            <div
              className="
    flex
    gap-2
    flex-wrap
    mt-2
  "
            >
              {[
  {
    label: "L",
    value: "monday",
  },

  {
    label: "M",
    value: "tuesday",
  },

  {
    label: "M",
    value: "wednesday",
  },

  {
    label: "J",
    value: "thursday",
  },

  {
    label: "V",
    value: "friday",
  },

  {
    label: "S",
    value: "saturday",
  },

  {
    label: "D",
    value: "sunday",
  },

].map(

  (
    day
  ) => {

    const districtConfig =

      districtVisitDays.find(

        (
          item
        ) =>

          item.district_id === selectedDistrict

      );

    const districtDays =

      districtConfig?.days || [];

    const isSelected =

      districtDays.includes(
        day.value
      );

    return (

      <button

        key={day.value}

        type="button"

        onClick={() =>

          toggleDistrictVisitDay(
            day.value
          )

        }

        className={`

          w-8
          h-8
          rounded-full
          border
          text-sm
          font-medium

          ${

            isSelected

              ? "bg-green-600 text-white border-green-600"

              : "bg-white text-gray-700 border-gray-300"

          }

        `}
      >

        {day.label}

      </button>

    );

  }

)}
            </div>
          </div>
        </div>
        {/* SELECTS FIN*/}

        {/* BARRIOS */}
        <div className="mt-6 border rounded-xl p-4 max-h-96 overflow-y-auto">
          <h2 className="font-semibold mb-4">Barrios</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {neighborhoods.map((neighborhood) => (
              <label
                key={neighborhood.id}
                className="
            flex
            items-center
            gap-3
            border
            rounded-lg
            px-3
            py-2
            cursor-pointer
            hover:bg-gray-50
            transition-colors
          "
              >
                {/* CHECKBOX */}
                <input
                  type="checkbox"
                  checked={selectedNeighborhoods.includes(neighborhood.id)}
                  onChange={() => toggleNeighborhood(neighborhood.id)}
                  className="
              h-4
              w-4
              shrink-0
              cursor-pointer
            "
                />

                {/* TEXTO */}
                <span
                  className="
            flex-1
            text-sm
            text-gray-700
            select-none
          "
                >
                  {neighborhood.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSaveRoute}
            className="
      bg-black
      text-white
      px-6
      py-3
      rounded-lg
      hover:opacity-90
      transition-opacity
    "
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
        {routeId && coverageView?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Cobertura actual</h2>
            <CoverageGroupedTable
              data={coverageView}
              pagination={coveragePagination}
              setPagination={setCoveragePagination}
              totalRows={coverageTotal}
              onViewDistrict={handleViewDistrict}
              onUpdateHours={(
                districtId,

                minHours,

                maxHours,
              ) => {
                // state para guardar en BD

                setDistrictDeliveryTimes((previous) => {
                  const exists = previous.some(
                    (item) => item.district_id === districtId,
                  );

                  if (exists) {
                    return previous.map((item) =>
                      item.district_id === districtId
                        ? {
                            ...item,

                            min_hours: minHours,

                            max_hours: maxHours,
                          }
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

                // state visual de la tabla

                setCoverageView((previous) =>
                  previous.map((row: any) =>
                    row.district_id === districtId
                      ? {
                          ...row,

                          min_hours: minHours,

                          max_hours: maxHours,
                        }
                      : row,
                  ),
                );
              }}
            />
            {/*<CoverageGroupedTable
              data={coverageView}
              pagination={coveragePagination}
              setPagination={setCoveragePagination}
              totalRows={coverageTotal}
              onViewDistrict={handleViewDistrict}
            />*/}
          </div>
        )}
      </div>

      <CoverageNeighborhoodsDialog
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
        onClose={() =>
          setUiMessage((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </div>
  );
}

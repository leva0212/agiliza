"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, MapPinned, Power, Save, Search } from "lucide-react";
import { toast } from "sonner";

import { UiMessage } from "@/shared/components/ui-message";
import { NavigationDialog } from "@/shared/components/navigation-dialog";
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
import { createClient } from "@/lib/supabase/client";
import { AppBarActionButton, AppBarActions } from "@/shared/components/app-bar-actions";
import { usePageCloseGuard } from "@/shared/components/page-close-guard";
import { useCurrentProfile } from "@/modules/auth/hooks/use-current-profile";
import { setRouteActive } from "@/modules/routes/api/set-route-active";
import { applyRouteBulkSchedule } from "@/modules/routes/api/apply-route-bulk-schedule";
import { BulkRouteScheduleEditor } from "@/modules/routes/components/bulk-route-schedule-editor";
import { BulkRouteCoverageEditor } from "@/modules/routes/components/bulk-route-coverage-editor";
import { addRouteBulkCoverage } from "@/modules/routes/api/add-route-bulk-coverage";

export default function RoutesPage() {
  const supabase = createClient();
  const { data: profile } = useCurrentProfile();
  const DISTRICT_DAYS = [

    {
      label: "L",
      value: "monday"
    },

    {
      label: "M",
      value: "tuesday"
    },

    {
      label: "X",
      value: "wednesday"
    },

    {
      label: "J",
      value: "thursday"
    },

    {
      label: "V",
      value: "friday"
    },

    {
      label: "S",
      value: "saturday"
    },

    {
      label: "D",
      value: "sunday"
    }

  ];
  const router = useRouter();

  const searchParams = useSearchParams();

  const routeId =
    searchParams.get("id");

  const { data: provinces } =
    useProvinces();


  // ======================================
  // Protección contra race conditions
  // ======================================

  const districtRequestRef =
    useRef<number>(0);


  // ======================================
  // Estado temporal completo por distrito
  // ======================================

  const districtStateRef = useRef<
    Record<
      number,
      {
        min_hours: number;
        max_hours: number;
        days: string[];
        neighborhoods: number[];
      }
    >
  >({});


  // ======================================
  // Distritos cargados
  // (mantener temporalmente para saveRoute)
  // ======================================

  const [visitedDistricts, setVisitedDistricts] =
    useState<number[]>([]);


  // ======================================
  // Selección territorial
  // ======================================

  const [selectedProvince, setSelectedProvince] =
    useState("");

  const [selectedCanton, setSelectedCanton] =
    useState("");

  const [selectedDistrict, setSelectedDistrict] =
    useState<number | null>(
      null
    );

  const [
    selectedDistrictName,
    setSelectedDistrictName
  ] = useState("");


  // ======================================
  // Catálogos
  // ======================================

  const [cantons, setCantons] =
    useState<any[]>([]);

  const [districts, setDistricts] =
    useState<any[]>([]);

  const [neighborhoods, setNeighborhoods] =
    useState<any[]>([]);


  // ======================================
  // Cobertura seleccionada
  // ======================================

  const [
    selectedNeighborhoods,
    setSelectedNeighborhoods
  ] = useState<number[]>([]);


  // ======================================
  // nombres derivados
  // ======================================

  const selectedProvinceName =

    provinces?.find(
      (p: any) =>

        String(
          p.id
        )

        === selectedProvince

    )?.name || "";

  const selectedCantonName =

    cantons.find(
      (c: any) =>

        String(
          c.id
        )

        === selectedCanton

    )?.name || "";


  // ======================================
  // Ruta
  // ======================================

  const [
    routeName,
    setRouteName
  ] = useState("");


  // ======================================
  // Horas distrito
  // ======================================

  const [
    districtMinHours,
    setDistrictMinHours
  ] = useState(24);

  const [
    districtMaxHours,
    setDistrictMaxHours
  ] = useState(0);


  // ======================================
  // Config distrito
  // ======================================

  const [
    districtVisitDays,
    setDistrictVisitDays
  ] = useState<
    {
      district_id: number;
      days: string[];
    }[]
  >([]);


  const [
    districtDeliveryTimes,
    setDistrictDeliveryTimes
  ] = useState<
    {
      district_id: number;
      min_hours: number;
      max_hours: number;
    }[]
  >([]);


  const [routeActive, setRouteActiveState] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [neighborhoodSearch, setNeighborhoodSearch] = useState("");
  const [navigationData, setNavigationData] = useState<{ googleMaps: string; waze: string; coordinates?: string } | null>(null);
  const [navigationOpen, setNavigationOpen] = useState(false);
  usePageCloseGuard(hasUnsavedChanges);

  // ======================================
  // Tabla
  // ======================================

  const [
    coverageView,
    setCoverageView
  ] = useState<any[]>([]);

  const [
    coverageTotal,
    setCoverageTotal
  ] = useState(0);

  const [
    coveragePagination,
    setCoveragePagination
  ] = useState({

    pageIndex: 0,
    pageSize: 100

  });


  // ======================================
  // Dialog
  // ======================================

  const [
    neighborhoodsDialogOpen,
    setNeighborhoodsDialogOpen
  ] = useState(false);

  const [
    neighborhoodsDialogTitle,
    setNeighborhoodsDialogTitle
  ] = useState("");

  const [
    dialogProvince,
    setDialogProvince
  ] = useState("");

  const [
    dialogCanton,
    setDialogCanton
  ] = useState("");

  const [
    dialogDistrict,
    setDialogDistrict
  ] = useState("");

  const [
    coveredNeighborhoods,
    setCoveredNeighborhoods
  ] = useState<string[]>([]);

  const [
    uncoveredNeighborhoods,
    setUncoveredNeighborhoods
  ] = useState<string[]>([]);


  // ======================================
  // Mensajes
  // ======================================

  const [
    uiMessage,
    setUiMessage
  ] = useState({

    open: false,

    type:
      "info" as
      "success"
      |
      "error"
      |
      "warning"
      |
      "info"
      |
      "question",

    title: "",
    message: ""

  });

  // ======================================
  // CARGA INICIAL DE RUTA
  // ======================================

  useEffect(() => {

    async function loadRoute() {

      if (!routeId)
        return;

      try {

        const [

          route,
          coverage,
          districtDays

        ] = await Promise.all([

          getRouteById(
            routeId
          ),

          getRouteDistrictCoverage(
            routeId
          ),

          getRouteDistrictVisitDays(
            routeId
          )

        ]);


        setCoverageView(
          coverage || []
        );

        setCoverageTotal(
          coverage?.length || 0
        );


        // =====================
        // horas distrito
        // =====================

        const deliveryTimes =

          (coverage || []).map(
            (item: any) => ({

              district_id:
                item.district_id,

              min_hours:
                item.min_hours ?? 0,

              max_hours:
                item.max_hours ?? 0

            })
          );

        setDistrictDeliveryTimes(
          deliveryTimes
        );


        // =====================
        // días distrito
        // =====================

        const groupedDays =

          districtDays.reduce(

            (
              acc: {
                district_id: number;
                days: string[];
              }[],

              item: any

            ) => {

              const existing =

                acc.find(

                  district =>

                    district.district_id
                    === item.district_id

                );

              if (existing) {

                existing.days.push(
                  item.day
                );

              }
              else {

                acc.push({

                  district_id:
                    item.district_id,

                  days: [
                    item.day
                  ]

                });

              }

              return acc;

            },

            []

          );

        setDistrictVisitDays(
          groupedDays
        );


        // =====================
        // cargar barrios
        // =====================

        const {

          data: allCoverage

        } = await supabase

          .from(
            "route_coverage"
          )

          .select(
            "neighborhood_id,neighborhoods(district_id)"
          )

          .eq(
            "route_id",
            routeId
          )

          .limit(
            15000
          );


        const neighborhoodIds =

          Array.from(

            new Set(

              allCoverage?.map(
                (item: any) =>

                  Number(
                    item.neighborhood_id
                  )
              )

              ?? []

            )

          );

        setSelectedNeighborhoods(
          neighborhoodIds
        );


        // =====================
        // nombre
        // =====================

        setRouteName(
          route.name || ""
        );
        setRouteActiveState(route.active !== false);


        // =====================
        // memoria local
        // =====================

        const groupedCoverage =
          new Map<
            number,
            number[]
          >();

        allCoverage?.forEach(
          (item: any) => {

            const districtId =

              Number(
                item.neighborhoods
                  ?.district_id
              );

            if (
              !districtId
            )
              return;

            if (
              !groupedCoverage.has(
                districtId
              )
            ) {

              groupedCoverage.set(
                districtId,
                []
              );

            }

            groupedCoverage
              .get(
                districtId
              )
              ?.push(

                Number(
                  item.neighborhood_id
                )

              );

          }
        );


        deliveryTimes.forEach(

          (
            item: {
              district_id: number;
              min_hours: number;
              max_hours: number;
            }

          ) => {

            districtStateRef.current[
              item.district_id
            ] = {

              min_hours:
                item.min_hours,

              max_hours:
                item.max_hours,

              days:

                groupedDays.find(

                  (
                    district: {
                      district_id: number;
                      days: string[];
                    }
                  ) =>

                    district.district_id
                    === item.district_id

                )?.days || [],

              neighborhoods:

                groupedCoverage.get(
                  item.district_id
                )

                || []

            };

          });

      }
      catch (error) {

        console.error(
          "loadRoute",
          error
        );

        setCoverageView(
          []
        );

        setCoverageTotal(
          0
        );

      }

    }

    loadRoute();

  }, [
    routeId
  ]);



  // ======================================
  // MANTENER districtDeliveryTimes
  // sincronizado con memoria local
  // ======================================

  useEffect(() => {

    const values =

      Object.entries(

        districtStateRef.current

      );

    const updated =

      values.map(

        ([districtId, state]) => ({

          district_id:
            Number(
              districtId
            ),

          min_hours:
            state.min_hours,

          max_hours:
            state.max_hours

        })

      );

    setDistrictDeliveryTimes(
      updated
    );

  }, [

    districtMinHours,
    districtMaxHours,
    selectedNeighborhoods

  ]);



  // ======================================
  // MANTENER districtVisitDays
  // sincronizado con memoria local
  // ======================================

  useEffect(() => {

    const values =

      Object.entries(

        districtStateRef.current

      );

    const updated =

      values.map(

        ([districtId, state]) => ({

          district_id:
            Number(
              districtId
            ),

          days:
            state.days

        })

      );

    setDistrictVisitDays(
      updated
    );

  }, [
    selectedDistrict
  ]);


  function delay(
    ms: number
  ) {

    return new Promise(
      resolve =>
        setTimeout(
          resolve,
          ms
        )
    );

  }


  // ======================================
  // PROVINCIA
  // ======================================

  async function handleProvinceChange(
    provinceId: number
  ) {

    const data =

      await getCantons(
        provinceId
      );

    setCantons(
      data || []
    );

    setDistricts([]);

    setNeighborhoods([]);

  }


  // ======================================
  // CANTON
  // ======================================

  async function handleCantonChange(
    cantonId: number
  ) {

    const data =

      await getDistricts(
        cantonId
      );

    setDistricts(
      data || []
    );

    setNeighborhoods([]);

  }


  // ======================================
  // HORAS
  // ======================================

  function updateDistrictHours(

    min: number,
    max: number

  ) {
    setHasUnsavedChanges(true);

    if (
      !selectedDistrict
    )
      return;

    const current =

      districtStateRef.current[
      selectedDistrict
      ];

    districtStateRef.current[
      selectedDistrict
    ] = {

      ...current,

      min_hours:
        min,

      max_hours:

        min === 0
          ? 0
          : max

    };

    setDistrictMinHours(
      min
    );

    setDistrictMaxHours(

      min === 0
        ? 0
        : max

    );

  }


  // ======================================
  // DIAS
  // ======================================

  function toggleDistrictVisitDay(
    day: string
  ) {
    setHasUnsavedChanges(true);

    if (
      !selectedDistrict
    )
      return;

    const current =

      districtStateRef.current[
      selectedDistrict
      ];

    const days =

      current.days.includes(
        day
      )

        ? current.days.filter(
          (d: string) =>
            d !== day
        )

        : [

          ...current.days,

          day

        ];


    districtStateRef.current[
      selectedDistrict
    ] = {

      ...current,

      days

    };


    setDistrictVisitDays(
      previous => {

        const others =

          previous.filter(
            item =>

              item.district_id
              !== selectedDistrict

          );

        return [

          ...others,

          {

            district_id:
              selectedDistrict,

            days

          }

        ];

      }
    );

  }


  // ======================================
  // DISTRITO
  // ======================================

  async function handleDistrictChange(
    districtId: number
  ) {

    const requestId =

      ++districtRequestRef.current;

    await delay(
      250
    );

    if (

      requestId
      !== districtRequestRef.current

    ) {

      return;

    }

    setSelectedDistrict(
      districtId
    );


    setVisitedDistricts(

      previous =>

        previous.includes(
          districtId
        )

          ? previous

          : [

            ...previous,

            districtId

          ]

    );


    const districtName =

      districts.find(

        (
          district: any
        ) =>

          district.id
          === districtId

      )?.name || "";

    setSelectedDistrictName(
      districtName
    );


    const data =

      await getNeighborhoods(
        districtId
      );


    if (

      requestId
      !== districtRequestRef.current

    ) {

      return;

    }


    setNeighborhoods(
      data || []
    );


    let state =

      districtStateRef.current[
      districtId
      ];


    if (
      !state
    ) {

      const coverage =

        await getDistrictNeighborhoods(

          districtId,
          routeId

        );

      const savedHours =

        coverageView.find(

          (
            item: any
          ) =>

            item.district_id
            === districtId

        );


      const savedDays =

        districtVisitDays.find(

          (
            item
          ) =>

            item.district_id
            === districtId

        );


      state = {

        min_hours:

          savedHours
            ?.min_hours
          ?? 0,

        max_hours:

          savedHours
            ?.max_hours
          ?? 0,

        days:

          savedDays
            ?.days
          ?? [],

        neighborhoods:

          coverage.map(

            (
              item: any
            ) =>

              Number(
                item.neighborhood_id
              )

          )

      };


      districtStateRef.current[
        districtId
      ] = state;

    }


    if (

      requestId
      !== districtRequestRef.current

    ) {

      return;

    }


    setDistrictMinHours(
      state.min_hours
    );

    setDistrictMaxHours(
      state.max_hours
    );


    const districtNeighborhoodIds =

      data.map(

        (
          item: any
        ) =>

          Number(
            item.id
          )

      );


    setSelectedNeighborhoods(

      previous => {

        const others =

          previous.filter(

            id =>

              !districtNeighborhoodIds.includes(
                id
              )

          );

        return [

          ...others,

          ...state.neighborhoods

        ];

      }

    );

  }


  // ======================================
  // TOGGLE DISTRITO
  // ======================================

  function handleToggleDistrict() {
    setHasUnsavedChanges(true);

    if (
      !selectedDistrict
      ||
      neighborhoods.length === 0
    )
      return;


    const districtIds =

      neighborhoods
        .map(

          (item: any) =>

            Number(
              item.id
            )

        )
        .filter(
          id =>

            !isNaN(id)
            &&
            id > 0
        );


    const allSelected =

      districtIds.every(
        id =>

          selectedNeighborhoods.includes(
            id
          )

      );


    const updated =

      allSelected

        ? selectedNeighborhoods.filter(
          id =>

            !districtIds.includes(
              id
            )
        )

        : [

          ...selectedNeighborhoods,

          ...districtIds

        ];


    const cleaned =

      Array.from(
        new Set(
          updated
        )
      )
        .filter(
          id =>

            typeof id === "number"
            &&
            !isNaN(id)
            &&
            id > 0
        );


    setSelectedNeighborhoods(
      cleaned
    );


    districtStateRef.current[
      selectedDistrict
    ] = {

      ...districtStateRef.current[
      selectedDistrict
      ],

      neighborhoods:

        allSelected
          ? []
          : districtIds

    };

  }


  // ======================================
  // TOGGLE BARRIO
  // ======================================

  function toggleNeighborhood(
    neighborhoodId: number
  ) {
    setHasUnsavedChanges(true);

    if (
      !selectedDistrict
    )
      return;


    setSelectedNeighborhoods(

      previous => {

        const updated =

          previous.includes(
            neighborhoodId
          )

            ? previous.filter(
              id =>
                id !== neighborhoodId
            )

            : [

              ...previous,

              neighborhoodId

            ];


        const cleaned =

          updated.filter(
            id =>

              typeof id === "number"
              &&
              !isNaN(id)
              &&
              id > 0
          );


        const districtIds =

          cleaned.filter(
            id =>

              neighborhoods.some(

                (neighborhood: any) =>

                  Number(
                    neighborhood.id
                  )
                  === id

              )

          );


        districtStateRef.current[
          selectedDistrict
        ] = {

          ...districtStateRef.current[
          selectedDistrict
          ],

          neighborhoods:
            districtIds

        };

        return cleaned;

      }

    );

  }


  // ======================================
  // GUARDAR
  // ======================================

  async function handleSaveRoute() {
    if (!routeName.trim()) {
      setUiMessage({ open: true, type: "warning", title: "Validación", message: "Ingresa un nombre para la ruta." });
      return;
    }
    if (selectedNeighborhoods.length === 0) {
      setUiMessage({ open: true, type: "warning", title: "Validación", message: "Selecciona al menos un barrio con cobertura." });
      return;
    }

    setIsSaving(true);
    try {
      const savedRouteId = await saveRoute({
        routeId,
        routeName,
        selectedNeighborhoods,
        districtDeliveryTimes,
        districtVisitDays,
        loadedDistrictIds: visitedDistricts,
      });
      setHasUnsavedChanges(false);
      setUiMessage({ open: true, type: "success", title: routeId ? "Ruta actualizada" : "Ruta creada", message: "Los cambios se guardaron correctamente." });
      if (!routeId) router.replace(`/dashboard/routes?id=${savedRouteId}`);
    } catch (error) {
      console.error("save route", error);
      setUiMessage({ open: true, type: "error", title: "No fue posible guardar", message: error instanceof Error ? error.message : "Intenta nuevamente." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRouteActiveChange() {
    if (!routeId || !profile?.active || profile.role !== "super_admin") return;
    try {
      const updated = await setRouteActive(routeId, !routeActive);
      setRouteActiveState(updated.active);
      setUiMessage({ open: true, type: "success", title: updated.active ? "Ruta activada" : "Ruta desactivada", message: updated.active ? "La ruta vuelve a participar en la cobertura." : "La configuración se conserva, pero deja de participar en cobertura." });
    } catch (error) {
      setUiMessage({ open: true, type: "error", title: "No fue posible actualizar el estado", message: error instanceof Error ? error.message : "Intenta nuevamente." });
    }
  }
  async function handleBulkCoverage(districtIds: number[], neighborhoodIds: number[] = [], action: "add" | "remove" = "add") {
    if (!routeId) return;
    try {
      const result = await addRouteBulkCoverage(routeId, districtIds, neighborhoodIds, action);
      const [coverage, { data: allCoverage }] = await Promise.all([
        getRouteDistrictCoverage(routeId),
        supabase.from("route_coverage").select("neighborhood_id").eq("route_id", routeId).limit(15000),
      ]);
      setCoverageView(coverage || []); setCoverageTotal(coverage?.length || 0);
      setSelectedNeighborhoods(Array.from(new Set(allCoverage?.map((item: any) => Number(item.neighborhood_id)) ?? [])));
      setUiMessage({ open: true, type: "success", title: action === "add" ? "Cobertura agregada" : "Cobertura eliminada", message: action === "add" ? `Se agregaron ${result.added_neighborhoods ?? 0} barrios en ${result.affected_districts} distritos.` : `Se quitaron ${result.removed_neighborhoods ?? 0} barrios en ${result.affected_districts} distritos.` });
    } catch (error) { setUiMessage({ open: true, type: "error", title: "No fue posible agregar cobertura", message: error instanceof Error ? error.message : "Intenta nuevamente." }); }
  }
  async function handleBulkSchedule(input: { districtIds: number[]; minHours: number; maxHours: number; days: string[] }) {
    if (!routeId) return;
    try {
      const result = await applyRouteBulkSchedule({ routeId, ...input });
      const selected = new Set(input.districtIds);
      setCoverageView((previous) => previous.map((item: any) => selected.has(item.district_id) ? { ...item, min_hours: input.minHours, max_hours: input.minHours === 0 ? 0 : input.maxHours } : item));
      setDistrictDeliveryTimes((previous) => {
        const untouched = previous.filter((item) => !selected.has(item.district_id));
        return [...untouched, ...input.districtIds.map((district_id) => ({ district_id, min_hours: input.minHours, max_hours: input.minHours === 0 ? 0 : input.maxHours }))];
      });
      setDistrictVisitDays((previous) => {
        const untouched = previous.filter((item) => !selected.has(item.district_id));
        return [...untouched, ...input.districtIds.map((district_id) => ({ district_id, days: input.days }))];
      });
      input.districtIds.forEach((districtId) => {
        districtStateRef.current[districtId] = { ...districtStateRef.current[districtId], min_hours: input.minHours, max_hours: input.minHours === 0 ? 0 : input.maxHours, days: input.days };
      });
      setHasUnsavedChanges(false);
      setUiMessage({ open: true, type: "success", title: "Configuración aplicada", message: `Se actualizaron ${result.updatedDistricts} distritos sin modificar sus barrios.` });
    } catch (error) {
      setUiMessage({ open: true, type: "error", title: "No fue posible aplicar la configuración", message: error instanceof Error ? error.message : "Intenta nuevamente." });
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
    <div className="mx-auto w-full max-w-none px-0 py-3 sm:px-4 lg:max-w-6xl lg:p-6">
      <AppBarActions>
        <AppBarActionButton label={isSaving ? "Guardando ruta" : "Guardar ruta"} tone="success" onClick={() => void handleSaveRoute()} disabled={isSaving || !hasUnsavedChanges}>
          <Save size={19} />
        </AppBarActionButton>
      </AppBarActions>
      <div className="rounded-2xl border bg-white px-3 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
        <header className="mb-7 border-b border-slate-200 pb-5 dark:border-slate-700">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-sky-700 dark:text-sky-300">{routeId ? "Configuración de ruta" : "Nueva ruta"}</p>
              <h1 className="mt-1 text-xl font-bold">{routeName.trim() || "Ruta sin nombre"}</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Define barrios, tiempos de entrega y días de visita por distrito.</p>
            </div>
            <div className="flex items-center gap-2">
              {routeId && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${routeActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>{routeActive ? "Activa" : "Inactiva"}</span>}
              {routeId && profile?.active && profile.role === "super_admin" && <button type="button" onClick={() => void handleRouteActiveChange()} className="inline-flex items-center gap-2 rounded-xl border border-amber-500 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/30"><Power size={16} />{routeActive ? "Desactivar" : "Activar"}</button>}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border p-3 dark:border-slate-700"><p className="text-xs text-slate-500">Barrios cubiertos</p><p className="mt-1 text-lg font-bold">{selectedNeighborhoods.length}</p></div>
            <div className="rounded-xl border p-3 dark:border-slate-700"><p className="text-xs text-slate-500">Distritos configurados</p><p className="mt-1 text-lg font-bold">{coverageView.length}</p></div>
            <div className="col-span-2 rounded-xl border p-3 dark:border-slate-700 sm:col-span-1"><p className="text-xs text-slate-500">Estado</p><p className="mt-1 text-sm font-semibold">{isSaving ? "Guardando…" : hasUnsavedChanges ? "Cambios sin guardar" : "Guardado"}</p></div>
          </div>
        </header>

        {routeId && provinces && <BulkRouteCoverageEditor provinces={provinces} coveredDistricts={coverageView} routeId={routeId} onApply={handleBulkCoverage} />}
        {routeId && coverageView.length > 0 && (
          <div className="mb-7">
            <BulkRouteScheduleEditor data-testid="bulk-route-schedule" districts={coverageView} onApply={handleBulkSchedule} />
          </div>
        )}
        {/* NOMBRE */}
        <div className=" gap-4 mb-6 max-w-[300px]">
          <label>
            NOMBRE DE LA RUTA
          </label>
          <input
            placeholder="Nombre de ruta"
            value={routeName}
            onChange={(e) => { setRouteName(e.target.value); setHasUnsavedChanges(true); }}
          />
        </div>{/* SELECTS PROVINCIA / CANTÓN / DISTRITO */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 max-w-[600px] md:grid-cols-2 gap-4">
            <label className="grid gap-1 text-sm font-medium">Provincia
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
            </label>

            <label className="grid gap-1 text-sm font-medium">Cantón
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
            </label>
          </div>

          {/* DISTRITO + HORAS + DÍAS */}
          <div className="border p-2 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-end gap-2 rounded-lg p-4 flex-wrap">
              <label className="grid gap-1 text-sm font-medium">Distrito
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
              </label>

              <label className="grid gap-1 text-sm font-medium">Tiempo mínimo
              <select
                value={districtMinHours}
                className="border rounded-lg p-1 max-w-[150px]"
                onChange={(e) => {

                  const value =
                    Number(
                      e.target.value
                    );

                  updateDistrictHours(

                    value,

                    value === 0
                      ? 0
                      : districtMaxHours

                  );

                }}
              >
                <option value={24}>24 horas</option>
                <option value={48}>48 horas</option>
                <option value={72}>72 horas</option>
                <option value={0}>Cronograma</option>
              </select>
              </label>

              {districtMinHours !== 0 && (
                <label className="grid gap-1 text-sm font-medium">Tiempo máximo
                <select
                  value={districtMaxHours === 0 ? "" : districtMaxHours}
                  className="max-w-[150px] border rounded-lg p-3"
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    updateDistrictHours(districtMinHours, value);
                  }}
                >
                  <option value="">Igual</option>
                  <option value={24}>24 horas</option>
                  <option value={48}>48 horas</option>
                  <option value={72}>72 horas</option>
                  <option value={96}>96 horas</option>
                </select>
                </label>
              )}

              {selectedDistrict && (
                <button
                  type="button"
                  onClick={handleToggleDistrict}
                  className="max-w-[220px] border border-emerald-600 px-3 py-3 rounded-lg text-sm font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap"
                >
                  {neighborhoods.length > 0 && neighborhoods.every((neighborhood) => selectedNeighborhoods.includes(neighborhood.id)) ? "Quitar todos los barrios" : "Incluir todos los barrios"}
                </button>
              )}
            </div>

            {/* DÍAS POR DISTRITO */}
            <div className="mt-2"><p className="mb-2 text-sm font-medium">Días que se visita la zona</p><div className="flex gap-2 flex-wrap">
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
                    className={`w-8 h-8 rounded-full border text-sm font-medium ${isSelected
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-300"
                      }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div></div>
          </div>
        </div>

        {/* BARRIOS */}
        <div className="mt-6 rounded-xl border p-4">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="font-semibold">Barrios del distrito</h2><p className="text-sm text-slate-500">{neighborhoods.filter((neighborhood) => selectedNeighborhoods.includes(neighborhood.id)).length} de {neighborhoods.length} incluidos</p></div>
            <label className="relative w-full sm:w-72"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input value={neighborhoodSearch} onChange={(event) => setNeighborhoodSearch(event.target.value)} placeholder="Buscar barrio..." className="w-full rounded-lg border py-2 pl-9 pr-3 dark:bg-slate-800" /></label>
          </div>

          <div className="grid max-h-96 grid-cols-1 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
            {neighborhoods.filter((neighborhood) => neighborhood.name.toLocaleLowerCase("es").includes(neighborhoodSearch.trim().toLocaleLowerCase("es"))).map((neighborhood) => {
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
                        const urls = LocalidadesService.getNavUrls(selectedProvinceName, selectedCantonName, selectedDistrictName, neighborhood.name);
                        const coords = LocalidadesService.getCoordsLocalidad(selectedProvinceName, selectedCantonName, selectedDistrictName, neighborhood.name);
                        if (!urls) {
                          toast.error("Ubicación no encontrada");
                          return;
                        }
                        setNavigationData({ ...urls, coordinates: coords ? `${coords.lat}, ${coords.lng}` : undefined });
                        setNavigationOpen(true);
                      }}
                    >
                      <MapPinned size={25} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* TABLA DE COBERTURA */}
        {routeId && coverageView?.length > 0 && (
          <div className="mt-10 -mx-3 sm:mx-0">
            <h2 className="mb-4 px-3 text-xl font-semibold sm:px-0">Cobertura actual</h2>
            <CoverageGroupedTable
              data={coverageView}
              pagination={coveragePagination}
              setPagination={setCoveragePagination}
              totalRows={coverageTotal}
              onViewDistrict={handleViewDistrict}/>
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

      <NavigationDialog
        open={navigationOpen}
        googleMaps={navigationData?.googleMaps || ""}
        waze={navigationData?.waze || ""}
        coordinates={navigationData?.coordinates}
        onClose={() => setNavigationOpen(false)}
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
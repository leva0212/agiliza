"use client";

import Link from "next/link";
import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useQuery } from "@tanstack/react-query";
import Chip from "@mui/material/Chip";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { ImageIcon, RotateCcw, ScanBarcode, X } from "lucide-react";

import { BarcodeLiveScannerDialog } from "@/modules/shipments/components/barcode-live-scanner-dialog";
import { getSerializedInventoryItems } from "@/modules/inventory/api/get-serialized-inventory-items";
import type {
  SerializedInventoryFilters,
  SerializedInventoryItem,
} from "@/modules/inventory/types/serialized-inventory-item";
import { standardMrtFeatures } from "@/shared/config/material-react-table";
import { useDialogBrowserBack } from "@/shared/hooks/use-dialog-browser-back";

type FilterKey =
  | "barcode"
  | "company"
  | "courier"
  | "product"
  | "importedBy"
  | "status"
  | "imageFilter"
  | "from"
  | "to";

const initialEnabled: Record<FilterKey, boolean> = {
  barcode: false,
  company: false,
  courier: false,
  product: false,
  importedBy: false,
  status: false,
  imageFilter: false,
  from: false,
  to: false,
};

function localDayBoundary(date: string, endOfDay = false) {
  return new Date(
    `${date}T${endOfDay ? "23:59:59.999" : "00:00:00"}`,
  ).toISOString();
}

function statusLabel(status: SerializedInventoryItem["status"]) {
  if (status === "delivered") return "Usado en entrega";
  if (status === "voided") return "Anulado";
  return "Disponible";
}

export default function SerializedInventoryPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [barcode, setBarcode] = useState("");
  const [company, setCompany] = useState("");
  const [courier, setCourier] = useState("");
  const [product, setProduct] = useState("");
  const [importedBy, setImportedBy] = useState("");
  const [status, setStatus] = useState("");
  const [imageFilter, setImageFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [enabled, setEnabled] =
    useState<Record<FilterKey, boolean>>(initialEnabled);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    barcode: string;
  } | null>(null);

  const closePhoto = useCallback(() => setSelectedPhoto(null), []);
  const requestClosePhoto = useDialogBrowserBack({
    open: Boolean(selectedPhoto),
    blocked: false,
    historyKey: "serialized-inventory-photo",
    onClose: closePhoto,
    onBlocked: () => undefined,
  });

  const filters = useMemo<SerializedInventoryFilters>(
    () => ({
      barcode: enabled.barcode ? barcode.trim() : undefined,
      company: enabled.company ? company.trim() : undefined,
      courier: enabled.courier ? courier.trim() : undefined,
      product: enabled.product ? product.trim() : undefined,
      importedBy: enabled.importedBy ? importedBy.trim() : undefined,
      status: enabled.status ? status : undefined,
      imageFilter: enabled.imageFilter ? imageFilter : undefined,
      from: enabled.from && from ? localDayBoundary(from) : undefined,
      to: enabled.to && to ? localDayBoundary(to, true) : undefined,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    }),
    [
      barcode,
      company,
      courier,
      enabled,
      from,
      imageFilter,
      importedBy,
      pagination,
      product,
      status,
      to,
    ],
  );

  const serializedItemsQuery = useQuery({
    queryKey: ["inventory-serialized-items", filters],
    queryFn: () => getSerializedInventoryItems(filters),
    placeholderData: (previous) => previous,
  });
  const rows = serializedItemsQuery.data?.rows ?? [];
  const totalRows = serializedItemsQuery.data?.totalRows ?? 0;
  const loading = serializedItemsQuery.isLoading || serializedItemsQuery.isFetching;
  const error = serializedItemsQuery.error
    ? serializedItemsQuery.error instanceof Error
      ? serializedItemsQuery.error.message
      : "No fue posible consultar las SIM importadas."
    : "";

  const columns = useMemo<MRT_ColumnDef<SerializedInventoryItem>[]>(
    () => [
      {
        id: "photo",
        header: "Foto",
        size: 88,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => {
          const photo = row.original.thumbnail_url || row.original.image_url;
          return photo ? (
            <button
              type="button"
              className="block overflow-hidden rounded-lg border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
              onClick={() =>
                setSelectedPhoto({
                  url: row.original.image_url || photo,
                  barcode: row.original.barcode,
                })
              }
              title="Ver foto completa"
            >
              {/* Las URLs son públicas y dinámicas de Supabase Storage. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={`SIM ${row.original.barcode}`}
                className="size-16 object-cover"
                loading="lazy"
              />
            </button>
          ) : (
            <div className="flex size-16 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
              <ImageIcon size={22} />
            </div>
          );
        },
      },
      {
        accessorKey: "barcode",
        header: "Código de barras",
        size: 210,
        Cell: ({ cell }) => (
          <span className="font-mono font-semibold">{String(cell.getValue())}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        Cell: ({ row }) => (
          <Chip
            size="small"
            color={
              row.original.status === "available"
                ? "success"
                : row.original.status === "delivered"
                  ? "primary"
                  : "default"
            }
            label={statusLabel(row.original.status)}
          />
        ),
      },
      { accessorKey: "product_name", header: "Producto" },
      { accessorKey: "company_name", header: "Empresa" },
      { accessorKey: "courier_name", header: "Mensajero" },
      { accessorKey: "imported_by_name", header: "Registrado por" },
      {
        accessorKey: "imported_at",
        header: "Fecha de importación",
        size: 190,
        Cell: ({ cell }) =>
          new Date(String(cell.getValue())).toLocaleString("es-CR"),
      },
      {
        accessorKey: "tracking_number",
        header: "Envío utilizado",
        Cell: ({ row }) =>
          row.original.shipment_id && row.original.tracking_number ? (
            <Link
              href={`/dashboard/shipments/${row.original.shipment_id}`}
              className="font-medium text-blue-600 underline dark:text-cyan-300"
            >
              {row.original.tracking_number}
            </Link>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "delivered_at",
        header: "Fecha de uso",
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? new Date(value).toLocaleString("es-CR") : "—";
        },
      },
      { accessorKey: "notes", header: "Notas" },
    ],
    [],
  );

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-950";

  function changeFilter(
    key: FilterKey,
    setter: (value: string) => void,
  ) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(event.target.value);
      setEnabled((current) => ({ ...current, [key]: true }));
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    };
  }

  function filterTitle(key: FilterKey, label: string) {
    return (
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled[key]}
          onChange={(event) => {
            setEnabled((current) => ({
              ...current,
              [key]: event.target.checked,
            }));
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
          title={`Activar filtro por ${label.toLowerCase()}`}
        />
        {label}
      </span>
    );
  }

  function resetFilters() {
    setBarcode("");
    setCompany("");
    setCourier("");
    setProduct("");
    setImportedBy("");
    setStatus("");
    setImageFilter("");
    setFrom("");
    setTo("");
    setEnabled(initialEnabled);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }

  return (
    <div className="space-y-4 p-2 sm:p-6">
      <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h2 className="font-semibold">Filtros de SIM importadas</h2>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Active únicamente los filtros que necesite. Sin filtros se muestran
          todas las unidades permitidas para su usuario.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-medium">
            {filterTitle("barcode", "Código de barras")}
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={barcode}
                onChange={changeFilter("barcode", setBarcode)}
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white"
                title="Escanear código con cámara"
                aria-label="Escanear código con cámara"
              >
                <ScanBarcode size={21} />
              </button>
            </div>
          </label>
          <label className="text-sm font-medium">
            {filterTitle("company", "Empresa")}
            <input className={inputClass} value={company} onChange={changeFilter("company", setCompany)} />
          </label>
          <label className="text-sm font-medium">
            {filterTitle("courier", "Mensajero")}
            <input className={inputClass} value={courier} onChange={changeFilter("courier", setCourier)} />
          </label>
          <label className="text-sm font-medium">
            {filterTitle("product", "Producto")}
            <input className={inputClass} value={product} onChange={changeFilter("product", setProduct)} />
          </label>
          <label className="text-sm font-medium">
            {filterTitle("importedBy", "Registrado por")}
            <input className={inputClass} value={importedBy} onChange={changeFilter("importedBy", setImportedBy)} />
          </label>
          <label className="text-sm font-medium">
            {filterTitle("status", "Estado")}
            <select className={inputClass} value={status} onChange={changeFilter("status", setStatus)}>
              <option value="">Todos</option>
              <option value="available">Disponible</option>
              <option value="delivered">Usado en entrega</option>
              <option value="voided">Anulado</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            {filterTitle("imageFilter", "Foto")}
            <select className={inputClass} value={imageFilter} onChange={changeFilter("imageFilter", setImageFilter)}>
              <option value="">Todas</option>
              <option value="with_image">Con foto</option>
              <option value="without_image">Sin foto</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            {filterTitle("from", "Desde")}
            <input type="date" className={inputClass} value={from} onChange={changeFilter("from", setFrom)} />
          </label>
          <label className="text-sm font-medium">
            {filterTitle("to", "Hasta")}
            <input type="date" className={inputClass} value={to} onChange={changeFilter("to", setTo)} />
          </label>
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 self-end rounded-lg border border-amber-500 bg-amber-50 p-3 font-medium text-amber-800 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-200"
          >
            <RotateCcw size={17} /> Limpiar filtros
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-400 p-4 text-red-600">
          {error}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-3 text-sm dark:border-cyan-900 dark:bg-cyan-950/30">
            BD · <strong>{totalRows}</strong> SIM importadas coincidentes
          </div>
          <MaterialReactTable
            {...standardMrtFeatures}
            columns={columns}
            data={rows}
            localization={MRT_Localization_ES}
            manualPagination
            rowCount={totalRows}
            state={{ isLoading: loading, pagination }}
            onPaginationChange={setPagination}
            initialState={{ density: "compact" }}
          />
        </>
      )}

      <BarcodeLiveScannerDialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={(barcodes) => {
          setBarcode(barcodes[0] ?? "");
          setEnabled((current) => ({ ...current, barcode: true }));
          setPagination((current) => ({ ...current, pageIndex: 0 }));
          setScannerOpen(false);
        }}
      />

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[1800] flex items-center justify-center bg-black/90 p-3"
          role="dialog"
          aria-modal="true"
          aria-label={`Foto de SIM ${selectedPhoto.barcode}`}
          onClick={requestClosePhoto}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-black/70 text-white"
            onClick={requestClosePhoto}
            aria-label="Cerrar foto"
          >
            <X size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedPhoto.url}
            alt={`SIM ${selectedPhoto.barcode}`}
            className="max-h-full max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          <div className="absolute bottom-4 rounded-lg bg-black/70 px-4 py-2 font-mono text-white">
            {selectedPhoto.barcode}
          </div>
        </div>
      )}
    </div>
  );
}

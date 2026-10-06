"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";

import type { Province } from "@/modules/routes/types/province";
import { getCantons } from "@/modules/routes/api/get-cantons";
import { getDistricts } from "@/modules/routes/api/get-districts";
import { getDistrictRouteCoverage } from "@/modules/routes/api/get-district-route-coverage";
import { RouteCoverageSummary } from "./route-coverage-summary";

import {
  trackingStatusOptions,
  type TrackingStatus,
} from "../constants/tracking-status-options";

import type {
  TrackingRecord,
  TrackingRecordInput,
} from "../types/tracking-record";

type Props = {
  open: boolean;
  record: TrackingRecord | null;
  provinces: Province[];
  companies: Array<{ id: string; code: string; name: string | null }>;
  defaultCompanyId: string;
  canManageStatus: boolean;
  onClose: () => void;
  onSave: (input: TrackingRecordInput) => Promise<void>;
};

const defaultStatus: TrackingStatus = "EN RUTA";

function normalizeForm(input: TrackingRecordInput): TrackingRecordInput {
  return {
    ...input,
    company_id: input.company_id.trim(),
    full_name: input.full_name.trim(),
    identification: input.identification.trim(),
    province_id: Number(input.province_id),
    canton_id: Number(input.canton_id),
    district_id: Number(input.district_id),
    comment: input.comment.trim(),
  };
}

function hasEditableChanges(
  current: TrackingRecordInput,
  initial: TrackingRecordInput,
  canManageStatus: boolean,
) {
  const commonFieldsChanged =
    current.full_name !== initial.full_name ||
    current.identification !== initial.identification ||
    current.province_id !== initial.province_id;

  const locationChanged =
    current.canton_id !== initial.canton_id ||
    current.district_id !== initial.district_id;

  if (!canManageStatus) {
    return commonFieldsChanged || locationChanged;
  }

  return (
    commonFieldsChanged ||
    locationChanged ||
    current.company_id !== initial.company_id ||
    current.status !== initial.status ||
    current.comment !== initial.comment
  );
}

function getInitialForm(
  record: TrackingRecord | null,
  defaultCompanyId: string,
): TrackingRecordInput {
  if (record) {
    return {
      company_id: record.company_id,
      full_name: record.full_name,
      identification: record.identification,
      province_id: record.province_id,
      canton_id: record.canton_id,
      district_id: record.district_id,
      status: record.status,
      comment: record.comment ?? "",
    };
  }

  return {
    company_id: defaultCompanyId,
    full_name: "",
    identification: "",
    province_id: 0,
    canton_id: 0,
    district_id: 0,
    status: defaultStatus,
    comment: "",
  };
}

export function TrackingFormDialog({
  open,
  record,
  provinces,
  companies,
  defaultCompanyId,
  canManageStatus,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<TrackingRecordInput>(() =>
    getInitialForm(record, defaultCompanyId),
  );

  const [saving, setSaving] = useState(false);

  const cantonQuery = useQuery({
    queryKey: ["tracking-cantons", form.province_id],
    queryFn: () => getCantons(form.province_id),
    enabled: form.province_id > 0,
  });

  const districtQuery = useQuery({
    queryKey: ["tracking-districts", form.canton_id],
    queryFn: () => getDistricts(form.canton_id),
    enabled: form.canton_id > 0,
  });

  const selectedCanton = (cantonQuery.data ?? []).find(
    (canton) => canton.id === form.canton_id,
  );

  const cantonClassification =
    selectedCanton?.area_classification === "gam"
      ? "GAM"
      : selectedCanton?.area_classification === "rural"
        ? "RURAL"
        : "Sin clasificar";

  const coverageQuery = useQuery({
    queryKey: ["tracking-district-route-coverage", form.district_id],
    queryFn: () => getDistrictRouteCoverage([form.district_id]),
    enabled: form.district_id > 0,
  });

  const districtHasCoverage =
    form.district_id > 0 &&
    (coverageQuery.data ?? []).some((route) => route.hasCoverage);

  const districtWithoutCoverage =
    form.district_id > 0 &&
    !coverageQuery.isLoading &&
    !coverageQuery.isFetching &&
    !coverageQuery.isError &&
    !districtHasCoverage;

  if (!open) {
    return null;
  }

  const normalizedForm = normalizeForm(form);

  const initialForm = normalizeForm(getInitialForm(record, defaultCompanyId));

  const hasChanges =
    !record || hasEditableChanges(normalizedForm, initialForm, canManageStatus);

  const isFormValid = Boolean(
    normalizedForm.company_id &&
    normalizedForm.full_name &&
    normalizedForm.identification &&
    normalizedForm.province_id &&
    normalizedForm.canton_id &&
    normalizedForm.district_id,
  );

  const canSave = !saving && isFormValid && hasChanges;

  const updateField = <Key extends keyof TrackingRecordInput>(
    key: Key,
    value: TrackingRecordInput[Key],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSave) {
      return;
    }

    setSaving(true);

    try {
      await onSave(normalizedForm);
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/50 p-3 sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:max-w-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {record ? "Editar tracking" : "Nuevo tracking"}
            </h2>

            {record && (
              <p className="mt-1 text-sm text-slate-500">
                Fecha: {new Date(record.created_at).toLocaleString("es-CR")}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto p-4 sm:p-6 md:grid-cols-2">
          {canManageStatus && (
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                Empresa
              </span>

              <select
                value={form.company_id}
                onChange={(event) =>
                  updateField("company_id", event.target.value)
                }
                required
                className="w-full rounded-xl border p-3"
              >
                <option value="">Seleccione una empresa</option>

                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {[company.code, company.name].filter(Boolean).join(" - ")}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Nombre</span>

            <input
              value={form.full_name}
              onChange={(event) => updateField("full_name", event.target.value)}
              required
              className="w-full rounded-xl border p-3"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Cédula</span>

            <input
              value={form.identification}
              onChange={(event) =>
                updateField("identification", event.target.value)
              }
              required
              className="w-full rounded-xl border p-3"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">
              Provincia
            </span>

            <select
              value={form.province_id || ""}
              onChange={(event) => {
                updateField("province_id", Number(event.target.value));
                updateField("canton_id", 0);
                updateField("district_id", 0);
              }}
              required
              className="w-full rounded-xl border p-3"
            >
              <option value="">Seleccione una provincia</option>

              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Cantón</span>

            <select
              value={form.canton_id || ""}
              onChange={(event) => {
                updateField("canton_id", Number(event.target.value));
                updateField("district_id", 0);
              }}
              disabled={!form.province_id || cantonQuery.isLoading}
              required
              className="w-full rounded-xl border p-3 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                {cantonQuery.isLoading
                  ? "Cargando cantones..."
                  : "Seleccione un cantón"}
              </option>

              {(cantonQuery.data ?? []).map((canton) => (
                <option key={canton.id} value={canton.id}>
                  {canton.name}
                </option>
              ))}
            </select>
          </label>

          {/* Distrito + validación de cobertura */}
          <div className="space-y-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">
                Distrito
              </span>

              <select
                value={form.district_id || ""}
                onChange={(event) =>
                  updateField("district_id", Number(event.target.value))
                }
                disabled={!form.canton_id || districtQuery.isLoading}
                required
                className="w-full rounded-xl border p-3 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  {districtQuery.isLoading
                    ? "Cargando distritos..."
                    : "Seleccione un distrito"}
                </option>

                {(districtQuery.data ?? []).map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </label>

            {form.district_id > 0 && coverageQuery.isLoading && (
              <p className="text-xs text-slate-500">Verificando cobertura...</p>
            )}

            {districtWithoutCoverage && (
              <div
                role="alert"
                className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
              >
                <p className="font-semibold">
                  ⚠️ Sin cobertura en este distrito
                </p>

                <p className="mt-1 text-xs sm:text-sm">
                  Actualmente no contamos con cobertura para el distrito
                  seleccionado.
                </p>
              </div>
            )}
          </div>

          <div
            className="space-y-1"
            title="Clasificación registrada para el cantón seleccionado."
          >
            <span className="text-sm font-medium text-slate-700">
              Clasificación del cantón
            </span>

            <div
              role="status"
              aria-readonly="true"
              className="flex min-h-[50px] cursor-not-allowed items-center rounded-xl border border-dashed bg-slate-100 px-3 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {form.canton_id ? cantonClassification : "Seleccione un cantón"}
            </div>
          </div>

          {form.district_id > 0 && !coverageQuery.isLoading && !coverageQuery.isFetching && !coverageQuery.isError && (
            <div className="md:col-span-2">
              <RouteCoverageSummary coverage={coverageQuery.data ?? []} />
            </div>
          )}

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Estatus</span>

            <select
              value={form.status}
              onChange={(event) =>
                updateField("status", event.target.value as TrackingStatus)
              }
              disabled={!canManageStatus}
              className="w-full rounded-xl border p-3 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              {trackingStatusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">
              Comentario
            </span>

            <textarea
              value={form.comment}
              onChange={(event) => updateField("comment", event.target.value)}
              disabled={!canManageStatus}
              maxLength={500}
              rows={4}
              className="w-full resize-none rounded-xl border p-3 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-4 py-2"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={!canSave}
            title={
              record && !hasChanges ? "No hay cambios por guardar" : undefined
            }
            className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

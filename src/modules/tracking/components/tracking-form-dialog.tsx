"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { Company } from "@/modules/companies/types/company";
import type { Province } from "@/modules/routes/types/province";
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
  companies: Company[];
  defaultCompanyId: string;
  canManageStatus: boolean;
  onClose: () => void;
  onSave: (input: TrackingRecordInput) => Promise<void>;
};

const defaultStatus: TrackingStatus = "EN RUTA";

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
      status: record.status,
      comment: record.comment ?? "",
    };
  }

  return {
    company_id: defaultCompanyId,
    full_name: "",
    identification: "",
    province_id: 0,
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

  if (!open) {
    return null;
  }

  const updateField = <Key extends keyof TrackingRecordInput>(
    key: Key,
    value: TrackingRecordInput[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.full_name.trim() || !form.identification.trim() || !form.province_id) {
      return;
    }

    setSaving(true);

    try {
      await onSave({
        ...form,
        full_name: form.full_name.trim(),
        identification: form.identification.trim(),
        comment: form.comment.trim(),
      });
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:max-w-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {record ? "Editar seguimiento" : "Nuevo seguimiento"}
            </h2>
            {record && (
              <p className="mt-1 text-sm text-slate-500">
                Fecha: {new Date(record.created_at).toLocaleString("es-CR")}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            ✕
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto p-4 sm:p-6 md:grid-cols-2">
          {canManageStatus && (
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Empresa</span>
              <select
                value={form.company_id}
                onChange={(event) => updateField("company_id", event.target.value)}
                required
                className="w-full rounded-xl border p-3"
              >
                <option value="">Seleccione una empresa</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.trade_name?.trim() || company.name}
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
              onChange={(event) => updateField("identification", event.target.value)}
              required
              className="w-full rounded-xl border p-3"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Provincia</span>
            <select
              value={form.province_id || ""}
              onChange={(event) => updateField("province_id", Number(event.target.value))}
              required
              className="w-full rounded-xl border p-3"
            >
              <option value="">Seleccione una provincia</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>{province.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Estatus</span>
            <select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value as TrackingStatus)}
              disabled={!canManageStatus}
              className="w-full rounded-xl border p-3 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              {trackingStatusOptions.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Comentario</span>
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
          <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

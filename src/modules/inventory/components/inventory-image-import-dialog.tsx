"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { SearchSelector } from "@/shared/components/search-selector";
import { CourierSearchDialog } from "@/modules/couriers/components/courier-search-dialog";
import { CompanySearchDialog } from "@/modules/companies/components/company-search-dialog";
import { ProductSearchDialog } from "@/modules/company-products/components/product-search-dialog";
import { ShipmentEvidenceEditor } from "@/modules/shipments/components/evidence-editor/shipment-evidence-editor";
import { createPendingEvidence, type PendingEvidence } from "@/modules/shipments/types/pending-evidence";
import {
  deletePendingEvidenceFile,
  savePendingEvidenceFile,
} from "@/modules/shipments/services/pending-evidence-storage";
import { createClient } from "@/lib/supabase/client";
import { evidenceDb } from "@/modules/shipments/services/evidence-cache-service";
import { clearDraft, readDraft, serializeDraft } from "../services/import-draft";
import { importInventoryImages } from "../api/import-inventory-images";

const MAX_IMAGES = 30;

type Selection = { id: string; name: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onImported: () => Promise<void> | void;
  initialCourier?: Selection;
  initialCompany?: Selection;
  initialProduct?: Selection;
};

export function InventoryImageImportDialog({
  open,
  onClose,
  onImported,
  initialCourier,
  initialCompany,
  initialProduct,
}: Props) {
  const filesInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PendingEvidence[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [courier, setCourier] = useState<Selection | null>(initialCourier ?? null);
  const [company, setCompany] = useState<Selection | null>(initialCompany ?? null);
  const [product, setProduct] = useState<Selection | null>(initialProduct ?? null);
  const [courierOpen, setCourierOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  const [draftId, setDraftId] = useState("");
  const [restoring, setRestoring] = useState(true);
  const [savingFiles, setSavingFiles] = useState(false);
  const latestItems = useRef<PendingEvidence[]>([]);
  const writes = useRef<Promise<unknown>>(Promise.resolve());
  const savingEnabled = useRef(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    savingEnabled.current = false;
    void (async () => {
      setRestoring(true);
      try {
        await writes.current;
        const { data } = await createClient().auth.getUser();
        if (!data.user) throw new Error("Debe iniciar sesión para recuperar el borrador");
        const id = `inventory-import:${data.user.id}`;
        const draft = await readDraft(id);
        if (cancelled) return;
        setDraftId(id);
        latestItems.current = draft?.items ?? [];
        setItems(draft?.items ?? []);
        if (draft) {
          setCourier(draft.courier); setCompany(draft.company); setProduct(draft.product);
          if (draft.items.length > 0) {
            setEditorOpen(true);
            toast.info(`Borrador recuperado: ${draft.items.length} imagen${draft.items.length === 1 ? "" : "es"}`);
          }
        }
        savingEnabled.current = true;
        if (navigator.storage?.persist) void navigator.storage.persist().catch(() => false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo recuperar el borrador");
      } finally { if (!cancelled) setRestoring(false); }
    })();
    return () => { cancelled = true; };
  }, [open]);

  const saveChanges = useCallback((next: PendingEvidence[]) => {
    latestItems.current = next;
    if (!draftId || !savingEnabled.current) return;
    const metadata = serializeDraft({ courier, company, product, items: next });
    writes.current = writes.current.catch(() => undefined).then(() =>
      evidenceDb.importSessions.put({ id: draftId, metadata }),
    );
    void writes.current.catch(() => toast.error("No se pudo guardar el borrador local. No cierre la página."));
  }, [draftId, courier, company, product]);

  useEffect(() => {
    if (open && !restoring) saveChanges(latestItems.current);
  }, [open, restoring, saveChanges]);

  if (!open) return null;

  async function addFiles(files: File[]) {
    if (savingFiles || restoring || !savingEnabled.current) return;
    const available = MAX_IMAGES - latestItems.current.length;
    if (available <= 0) {
      toast.info("Ya alcanzó el máximo de 30 imágenes");
      return;
    }

    const accepted = files.slice(0, available);
    if (files.length > available) {
      toast.info(`Solo las primeras ${accepted.length} imágenes serán tomadas en cuenta`);
    }

    setSavingFiles(true);
    const newItems: PendingEvidence[] = [];
    try {
      for (const file of accepted) {
        const item = createPendingEvidence(file);
        await savePendingEvidenceFile(item.id, draftId, file);
        const placeholder = new File([], file.name, { type: file.type });
        newItems.push({ ...item, file: placeholder, originalFile: placeholder, storedLocally: true });
        const savedSoFar = [...latestItems.current, newItems.at(-1)!];
        saveChanges(savedSoFar);
        await writes.current;
        setItems(savedSoFar);
      }
      setEditorOpen(true);
    } catch (error) {
      console.error("[InventoryImport] No se guardaron las imágenes en IndexedDB", error);
      toast.error("No fue posible guardar todas las imágenes. Se conservaron las guardadas.");
    } finally { setSavingFiles(false); }
  }

  function validateDestination() {
    if (!courier || !company || !product) {
      toast.error("Seleccione mensajero, empresa y producto antes de agregar imágenes");
      return false;
    }
    return true;
  }

  async function discardAndClose() {
    if (!window.confirm("¿Descartar todas las fotos y ediciones de este borrador?")) return;
    savingEnabled.current = false;
    await writes.current;
    await clearDraft(draftId, latestItems.current);
    latestItems.current = [];
    setItems([]);
    setEditorOpen(false);
    onClose();
  }

  async function handleImport(pendingItems: PendingEvidence[]) {
    if (!courier || !company || !product) return;

    setImporting(true);
    try {
      await importInventoryImages({
        courierId: courier.id,
        companyId: company.id,
        productId: product.id,
        lowStock: 20,
        mediumStock: 50,
        items: pendingItems,
      });
      savingEnabled.current = false;
      await writes.current;
      await clearDraft(draftId, pendingItems);
      latestItems.current = [];
      setItems([]);
      setEditorOpen(false);
      await onImported();
      toast.success(`${pendingItems.length} SIM(s) importada(s) al inventario`);
      onClose();
    } catch (error) {
      console.error("[InventoryImport] Error al importar", error);
      toast.error(error instanceof Error ? error.message : "No fue posible importar el inventario");
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <input
        ref={filesInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length > 0 && validateDestination()) void addFiles(files);
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file && validateDestination()) void addFiles([file]);
        }}
      />

      {!editorOpen && <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
          <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-700">
            <div>
              <h2 className="text-lg font-semibold">Importar inventario desde imágenes</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Las fotos se guardan primero en este dispositivo, se leen automáticamente y se importan solo al confirmar.
              </p>
            </div>
            <button type="button" onClick={async () => { await writes.current; onClose(); }} disabled={importing || savingFiles || restoring} aria-label="Cerrar" className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X size={20} />
            </button>
          </div>

          <fieldset disabled={restoring || savingFiles || importing || !draftId} className="space-y-4 p-5 disabled:opacity-60">
            {restoring && <p role="status">Recuperando borrador…</p>}
            {savingFiles && <p role="status">Guardando fotos en este dispositivo…</p>}
            <SearchSelector label="Mensajero" valueName={courier?.name ?? ""} placeholder="Seleccione un mensajero" onSearch={() => setCourierOpen(true)} />
            <SearchSelector label="Empresa" valueName={company?.name ?? ""} placeholder="Seleccione una empresa" onSearch={() => setCompanyOpen(true)} />
            <SearchSelector label="Producto" valueName={product?.name ?? ""} placeholder={company ? "Seleccione un producto" : "Seleccione una empresa primero"} disabled={!company} onSearch={() => setProductOpen(true)} />

            <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
              <p className="text-sm font-medium">Fotos del lote: {items.length}/{MAX_IMAGES}</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Cada SIM debe mostrar un código único. Las imágenes permanecen en IndexedDB hasta importar o descartar.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => { if (validateDestination()) filesInputRef.current?.click(); }} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">
                  <ImagePlus size={18} /> Seleccionar fotos
                </button>
                <button type="button" onClick={() => { if (validateDestination()) cameraInputRef.current?.click(); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-600">
                  <Camera size={18} /> Tomar foto
                </button>
              </div>
            </div>

            {items.length > 0 && (
              <button type="button" onClick={() => setEditorOpen(true)} className="w-full rounded-lg border border-blue-300 py-2.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:text-blue-300">
                Revisar {items.length} imagen{items.length === 1 ? "" : "es"} y leer códigos
              </button>
            )}
            {items.length > 0 && <button type="button" onClick={() => void discardAndClose()} className="text-sm text-red-500 underline">Descartar borrador</button>}
          </fieldset>
        </div>
      </div>}

      <CourierSearchDialog open={courierOpen} onClose={() => setCourierOpen(false)} onSelect={(value) => setCourier({ id: value.id, name: value.name })} />
      <CompanySearchDialog open={companyOpen} onClose={() => setCompanyOpen(false)} onSelect={(value) => { setCompany({ id: value.id, name: value.name }); setProduct(null); }} />
      <ProductSearchDialog companyId={company?.id ?? ""} open={productOpen} onClose={() => setProductOpen(false)} onSelect={(value) => setProduct({ id: value.id, name: value.name })} />

      <ShipmentEvidenceEditor
        open={editorOpen}
        evidences={items}
        onClose={async () => {
          await writes.current;
          setItems(latestItems.current);
          setEditorOpen(false);
        }}
        onItemsChange={saveChanges}
        onUpload={handleImport}
        onRemoveEvidence={(id) => {
          const next = latestItems.current.filter((item) => item.id !== id);
          saveChanges(next);
          setItems(next);
          void writes.current.then(() => deletePendingEvidenceFile(id));
        }}
        isUploading={importing}
        submitLabel="Importar inventario"
      />
    </>
  );
}

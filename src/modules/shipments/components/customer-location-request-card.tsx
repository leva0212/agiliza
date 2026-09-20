"use client";
import { useState } from "react";
import { Copy, ExternalLink, MapPin, Share2 } from "lucide-react";
import { toast } from "sonner";
type Props = { shipmentId: string; trackingNumber: string; phoneNumber?: string };
export function CustomerLocationRequestCard({ shipmentId, trackingNumber, phoneNumber }: Props) {
  const [url, setUrl] = useState(""); const [loading, setLoading] = useState(false);
  async function createLink() {
    setLoading(true);
    try { const response = await fetch("/api/customer-location-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shipmentId }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "No fue posible crear el enlace."); setUrl(data.url); toast.success("Enlace temporal creado; vence en 24 horas y se usa una vez."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible crear el enlace."); } finally { setLoading(false); }
  }
  const message = `Agiliza: para coordinar la entrega del envío ${trackingNumber}, compártenos tu ubicación actual desde este enlace: ${url}. El enlace vence en 24 horas.`;
  const digits = phoneNumber?.replace(/\D/g, "");
  const phone = digits?.length === 8 ? "506" + digits : digits;
  const whatsappUrl = `https://wa.me/${phone || ""}?text=${encodeURIComponent(message)}`;
  return <section className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-800 dark:bg-sky-950/30">
    <div className="flex items-start gap-3"><MapPin className="mt-0.5 shrink-0 text-sky-700 dark:text-sky-300" size={20}/><div><h3 className="font-semibold text-sky-950 dark:text-sky-100">Solicitar ubicación al cliente</h3><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Genera un enlace privado y de un solo uso. El cliente decide cuándo compartirla y se registra su precisión GPS.</p></div></div>
    {!url ? <button type="button" disabled={loading} onClick={createLink} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"><Share2 size={17}/>{loading ? "Creando enlace…" : "Crear enlace"}</button> : <div className="mt-3 space-y-2"><input aria-label="Enlace para compartir" readOnly value={url} className="w-full text-sm"/><div className="flex flex-wrap gap-2"><a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800"><ExternalLink size={16}/>Enviar por WhatsApp</a><button type="button" onClick={() => navigator.clipboard.writeText(url).then(() => toast.success("Enlace copiado"), () => toast.error("No se pudo copiar el enlace"))} className="inline-flex items-center gap-2 rounded-lg border border-sky-300 px-3 py-2 text-sm font-semibold text-sky-800 dark:border-sky-700 dark:text-sky-200"><Copy size={16}/>Copiar enlace</button><button type="button" onClick={createLink} disabled={loading} className="rounded-lg px-3 py-2 text-sm text-sky-800 underline dark:text-sky-200">Crear otro</button></div></div>}
  </section>;
}
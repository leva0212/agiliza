"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { UiMessage } from "@/shared/components/ui-message";
import { changePassword } from "@/modules/users/api/change-password";
import { Eye, EyeOff } from "lucide-react";
import { useCurrentProfile } from "@/modules/auth/hooks/use-current-profile";
import { createClient } from "@/lib/supabase/client";

type RecoveryState = { recovery_email: string | null; recovery_email_verified_at: string | null; email_recovery_available: boolean };

export default function SecurityPage() {
  const router = useRouter();
  const { data: profile } = useCurrentProfile();
  const [recovery, setRecovery] = useState<RecoveryState | null>(null);
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [changeConfirmationOpen, setChangeConfirmationOpen] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [message, setMessage] = useState<{ title: string; text: string; type: "success" | "error" | "warning" | "info" } | null>(null);

  async function load() {
    const response = await fetch("/api/account/recovery-email");
    if (!response.ok) return;
    const data = await response.json();
    setRecovery(data); setEmail(data.recovery_email ?? "");
  }
  useEffect(() => { void load(); }, []);

  async function saveRecovery() {
    const response = await fetch("/api/account/recovery-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await response.json();
    if (!response.ok) return setMessage({ title: "No se pudo guardar", text: data.message, type: "error" });
    setMessage({ title: "Verifica tu correo", text: "Enviamos un enlace de verificación. Hasta confirmarlo no podrá usarse para iniciar sesión ni recuperar la contraseña.", type: "info" });
    await load();
  }
  async function removeRecovery() {
    const response = await fetch("/api/account/recovery-email", { method: "DELETE" });
    if (!response.ok) return setMessage({ title: "Error", text: "No fue posible eliminar el correo.", type: "error" });
    setRecovery((current) => ({ recovery_email: null, recovery_email_verified_at: null, email_recovery_available: current?.email_recovery_available ?? false })); setEmail("");
  }
  async function resendVerification() {
    const response = await fetch("/api/account/recovery-email/resend", { method: "POST" });
    const data = await response.json();
    setMessage({ title: response.ok ? "Verificación reenviada" : "No se pudo reenviar", text: response.ok ? "Revisa tu correo para verificarlo." : data.message, type: response.ok ? "info" : "error" });
  }
  async function savePassword() {
    try { await changePassword(password, confirmation, currentPassword); setCurrentPassword(""); setPassword(""); setConfirmation(""); setPasswordChanged(true); setMessage({ title: "Contraseña actualizada", text: "Tu contraseña se actualizó correctamente. Ahora inicia sesión con tu nueva contraseña.", type: "success" }); }
    catch (error) { setMessage({ title: "No se pudo actualizar", text: error instanceof Error ? error.message : "Inténtalo de nuevo.", type: "error" }); }
  }

  const field = "mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900";
  const status = !recovery?.recovery_email ? "Sin configurar" : recovery.recovery_email_verified_at ? "Verificado" : "Pendiente de verificación";
  return <div className="mx-auto max-w-2xl space-y-6"><div><h2 className="text-xl font-bold">Seguridad</h2><p className="text-sm text-slate-500">{profile?.is_owner_company_user ? "Administra tu contraseña y correo de recuperación." : "Administra tu contraseña."}</p></div>
    {profile?.is_owner_company_user && <section className="space-y-4 rounded-2xl border p-5"><div><h3 className="font-semibold">Correo de recuperación</h3>{recovery?.email_recovery_available ? <p className="text-sm text-slate-500">Estado: <strong>{status}</strong></p> : <p className="text-sm text-slate-500">La recuperación por correo estará disponible próximamente. Si olvidas tu contraseña, usa <strong>Solicitar ayuda a Agiliza</strong> desde el inicio de sesión.</p>}</div>{recovery?.email_recovery_available && <><label>Correo<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={field} /></label><div className="flex flex-wrap gap-3"><button onClick={() => void saveRecovery()} className="rounded-xl bg-blue-600 px-4 py-2 text-white">{recovery?.recovery_email ? "Cambiar y verificar" : "Agregar y verificar"}</button>{recovery?.recovery_email && !recovery.recovery_email_verified_at && <button onClick={() => void resendVerification()} className="rounded-xl border px-4 py-2">Reenviar verificación</button>}{recovery?.recovery_email && <button onClick={() => void removeRecovery()} className="rounded-xl border border-red-300 px-4 py-2 text-red-700">Eliminar</button>}</div></>}</section>}
    <section className="space-y-4 rounded-2xl border p-5"><div><h3 className="font-semibold">Cambiar contraseña</h3><p className="text-sm text-slate-500">Confirma tu contraseña actual y usa al menos 10 caracteres para la nueva.</p></div><label>Contraseña actual<span className="relative mt-1 block"><input type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={`${field} input-has-trailing-icon`} autoComplete="current-password" /><button type="button" onClick={() => setShowCurrentPassword((value) => !value)} title={showCurrentPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-label={showCurrentPassword ? "Ocultar contraseña actual" : "Mostrar contraseña actual"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:hover:text-white">{showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label><label>Nueva contraseña<span className="relative mt-1 block"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className={`${field} input-has-trailing-icon`} autoComplete="new-password" /><button type="button" onClick={() => setShowPassword((value) => !value)} title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label><label>Confirmar nueva contraseña<span className="relative mt-1 block"><input type={showConfirmation ? "text" : "password"} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={`${field} input-has-trailing-icon`} autoComplete="new-password" /><button type="button" onClick={() => setShowConfirmation((value) => !value)} title={showConfirmation ? "Ocultar contraseña" : "Mostrar contraseña"} aria-label={showConfirmation ? "Ocultar confirmación" : "Mostrar confirmación"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:hover:text-white">{showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label><button onClick={() => setChangeConfirmationOpen(true)} className="mx-auto mt-6 block rounded-xl bg-blue-600 px-5 py-2 text-white">Actualizar contraseña</button></section>
    <UiMessage open={changeConfirmationOpen} type="question" title="¿Cambiar contraseña?" message="Al cambiar la contraseña se cerrarán todas las sesiones activas. Deberás iniciar sesión nuevamente con tu nueva contraseña." confirmText="Cambiar contraseña" cancelText="Cancelar" onClose={() => setChangeConfirmationOpen(false)} onConfirm={() => { setChangeConfirmationOpen(false); void savePassword(); }} />
    <UiMessage open={Boolean(message)} title={message?.title ?? ""} message={message?.text ?? ""} type={message?.type ?? "info"} onClose={() => { setMessage(null); if (passwordChanged) { const supabase = createClient(); void supabase.auth.signOut({ scope: "local" }).finally(() => { router.replace("/login"); router.refresh(); }); } }} />
  </div>;
}

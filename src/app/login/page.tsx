"use client";

import { FormEvent, useRef, useState } from "react";
import { Eye, EyeOff, KeyRound, Lock, UserRound } from "lucide-react";
import { UiMessage } from "@/shared/components/ui-message";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ title: string; text: string; type: "success" | "error" | "warning" | "info" } | null>(null);

  async function handleLogin(event?: FormEvent) {
    event?.preventDefault();
    if (!identifier.trim() || !password) return setMessage({ title: "Datos requeridos", text: "Ingresa tu usuario o correo y tu contraseña.", type: "warning" });
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, password }) });
      if (!response.ok) return setMessage({ title: "Acceso denegado", text: "No fue posible iniciar sesión con esos datos.", type: "error" });
      const data = await response.json();
      if (!data.session?.access_token || !data.session?.refresh_token) throw new Error("La sesión no fue recibida.");
      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.setSession(data.session);
      if (sessionError) throw sessionError;
      window.location.replace("/dashboard");
    } catch {
      setMessage({ title: "Error", text: "No fue posible iniciar sesión.", type: "error" });
    } finally { setLoading(false); }
  }

  async function requestRecovery(help = false) {
    if (!identifier.trim()) return setMessage({ title: "Indica tu cuenta", text: "Escribe primero tu usuario o correo electrónico.", type: "warning" });
    setLoading(true);
    try {
      const endpoint = help ? "/api/auth/request-reset-help" : "/api/auth/forgot-password";
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier }) });
      const data = await response.json();
      setMessage({ title: help ? "Solicitud enviada" : "Revisa tu correo", text: data.message, type: "info" });
    } catch { setMessage({ title: "Error", text: "No fue posible procesar la solicitud.", type: "error" }); }
    finally { setLoading(false); }
  }

  return <>
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4">
      <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center"><h1 className="text-3xl font-bold text-white">Portal administrativo</h1><p className="mt-2 text-sm text-slate-400">Inicia sesión para continuar</p></div>
        <div className="space-y-5">
          <div className="relative"><UserRound className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" /><input autoComplete="username" placeholder="Usuario o correo electrónico" value={identifier} onChange={(event) => setIdentifier(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") passwordRef.current?.focus(); }} className="input-has-leading-icon w-full rounded-2xl border border-white/10 bg-white/5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-400" /></div>
          <div className="relative"><Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" /><input ref={passwordRef} type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Contraseña" value={password} onChange={(event) => setPassword(event.target.value)} className="input-has-both-icons w-full rounded-2xl border border-white/10 bg-white/5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-400" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          <button disabled={loading} className="w-full rounded-2xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50">{loading ? "Entrando..." : "Ingresar"}</button>
          <div className="flex flex-col items-center gap-2 text-sm"><button type="button" disabled={loading} onClick={() => void requestRecovery()} className="text-sky-300 hover:text-sky-200">¿Olvidaste tu contraseña?</button><button type="button" disabled={loading} onClick={() => void requestRecovery(true)} className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200"><KeyRound size={15} /> Solicitar ayuda a Agiliza</button></div>
        </div>
      </form>
    </main>
    <UiMessage open={Boolean(message)} title={message?.title ?? ""} message={message?.text ?? ""} type={message?.type ?? "info"} onClose={() => setMessage(null)} />
  </>;
}

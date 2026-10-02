"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PASSWORD_MIN_LENGTH } from "@/modules/auth/identity";

export default function ResetPasswordPage() {
  const params = useSearchParams(); const router = useRouter(); const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: params.get("token"), password, confirmPassword }) }); const data = await response.json(); setLoading(false); if (!response.ok) return setMessage(data.message); setMessage("Contraseña actualizada. Ya puedes iniciar sesión."); setTimeout(() => router.replace("/login"), 1500); }
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4"><form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl bg-slate-900 p-6 text-white"><h1 className="text-2xl font-bold">Nueva contraseña</h1><p className="text-sm text-slate-400">Usa al menos {PASSWORD_MIN_LENGTH} caracteres.</p><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva contraseña" className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3" /><input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar contraseña" className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3" /><button disabled={loading} className="w-full rounded-xl bg-blue-600 p-3 font-semibold">{loading ? "Guardando..." : "Guardar contraseña"}</button>{message && <p className="text-sm text-sky-200">{message}</p>}</form></main>;
}

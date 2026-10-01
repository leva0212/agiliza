"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyRecoveryEmailPage() {
  const params = useSearchParams(); const [message, setMessage] = useState("Verificando correo...");
  useEffect(() => { void fetch("/api/account/recovery-email/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: params.get("token") }) }).then(async (response) => { const data = await response.json(); setMessage(response.ok ? "Correo verificado. Ya puedes cerrar esta página." : data.message); }); }, [params]);
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white"><div className="w-full max-w-md rounded-2xl bg-slate-900 p-6"><h1 className="text-xl font-bold">Correo de recuperación</h1><p className="mt-3 text-slate-300">{message}</p></div></main>;
}

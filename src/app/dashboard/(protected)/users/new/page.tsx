"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/modules/users/api/create-user";
import { getCompaniesOptions } from "@/modules/companies/api/get-companies-options";
import { getRoleLabel } from "@/modules/users/utils/get-role-label";
import { UiMessage } from "@/shared/components/ui-message";
import { isValidUsername, normalizeUsername } from "@/modules/auth/identity";
import { copyTemporaryPassword } from "@/modules/auth/copy-temporary-password";
import { generateTemporaryPassword } from "@/modules/auth/temporary-password";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";

export default function NewUserPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [fullName, setFullName] = useState(""); const [username, setUsername] = useState(""); const [recoveryEmail, setRecoveryEmail] = useState(""); const [phone, setPhone] = useState("");
  const [companyId, setCompanyId] = useState(""); const [role, setRole] = useState("company_admin"); const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [canDeliver, setCanDeliver] = useState(false); const [deliveryPay, setDeliveryPay] = useState("0"); const [failedPay, setFailedPay] = useState("0"); const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ title: string; text: string; type: "success" | "error" | "warning" | "info" } | null>(null);
  const selectedCompany = companies.find((company) => company.id === companyId); const isSystemCompany = selectedCompany?.is_system_company === true || selectedCompany?.is_owner_company === true;

  useEffect(() => { void getCompaniesOptions().then(setCompanies).catch(() => setMessage({ title: "Error", text: "No fue posible cargar empresas.", type: "error" })); setPassword(generateTemporaryPassword()); }, []);
  async function handleSave() {
    const normalized = normalizeUsername(username);
    if (!isValidUsername(normalized)) return setMessage({ title: "Usuario inválido", text: "Usa entre 3 y 32 caracteres: letras minúsculas, números, punto, guion o guion bajo.", type: "warning" });
    setLoading(true);
    try {
      await createUser({ username: normalized, full_name: fullName, phone, company_id: companyId, role: role as "super_admin" | "company_admin" | "courier" | "seller", recovery_email: recoveryEmail || undefined, temporary_password: password, can_deliver: isSystemCompany && canDeliver, delivery_pay: Number(deliveryPay), failed_pay: Number(failedPay) });
      setMessage({ title: "Usuario creado", text: "La cuenta se creó correctamente. Entrega la contraseña temporal de forma segura: solo se usará para el primer ingreso.", type: "success" });
    } catch (error) { setMessage({ title: "Error", text: error instanceof Error ? error.message : "No fue posible crear el usuario.", type: "error" }); }
    finally { setLoading(false); }
  }
  const field = "w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
  return <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-slate-200 p-6 dark:border-slate-700"><div><h2 className="text-xl font-bold">Nuevo usuario</h2><p className="text-sm text-slate-500">El correo de recuperación es opcional y deberá verificarse antes de usarse.</p></div><div className="grid gap-4 sm:grid-cols-2">
    <label className="sm:col-span-2">Nombre<input value={fullName} onChange={(e) => setFullName(e.target.value)} className={field} /></label>
    <label>Usuario<input value={username} onChange={(e) => setUsername(normalizeUsername(e.target.value))} autoCapitalize="none" autoCorrect="off" className={field} placeholder="jperez" /><span className="text-xs text-slate-500">Será su forma principal de ingresar.</span></label>
    <label>Correo de recuperación <span className="text-slate-500">(opcional)</span><input type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} className={field} /></label>
    <label>Empresa<select value={companyId} onChange={(e) => { const nextCompany = companies.find((c) => c.id === e.target.value); const nextIsSystemCompany = nextCompany?.is_system_company === true || nextCompany?.is_owner_company === true; setCompanyId(e.target.value); if (!nextIsSystemCompany) { setCanDeliver(false); if (["courier", "super_admin"].includes(role)) setRole("company_admin"); } }} className={field}><option value="">Seleccione empresa</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
    <label>Rol<select value={role} disabled={!companyId} onChange={(e) => { setRole(e.target.value); setCanDeliver(e.target.value === "courier"); }} className={field}>{isSystemCompany && <option value="super_admin">{getRoleLabel("super_admin")}</option>}<option value="company_admin">{getRoleLabel("company_admin")}</option><option value="seller">{getRoleLabel("seller")}</option>{isSystemCompany && <option value="courier">{getRoleLabel("courier")}</option>}</select></label>
    <label className="sm:col-span-2">Contraseña temporal<span className="relative mt-1 block"><input type={showPassword ? "text" : "password"} value={password} readOnly className={`${field} input-has-double-trailing-icon`} autoComplete="new-password" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña temporal" : "Mostrar contraseña temporal"} title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button><button type="button" onClick={() => void copyTemporaryPassword(password)} aria-label="Copiar contraseña temporal" title="Copiar contraseña temporal" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:hover:text-white"><Copy size={18} /></button></span><span className="mt-1 flex items-center gap-2 text-xs text-slate-500">Se genera automáticamente y solo se usa una vez. <button type="button" onClick={() => setPassword(generateTemporaryPassword())} className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"><RefreshCw size={13} /> Generar otra</button></span></label>
    <label>Teléfono<input value={phone} onChange={(e) => setPhone(e.target.value)} className={field} /></label>
  </div>{isSystemCompany && <label className="flex items-center gap-3 rounded-xl border p-3"><input type="checkbox" checked={canDeliver} disabled={role === "courier"} onChange={(e) => setCanDeliver(e.target.checked)} /> Puede realizar entregas</label>}
  {isSystemCompany && canDeliver && <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2"><label>Pago por entrega<input type="number" min="0" value={deliveryPay} onChange={(e) => setDeliveryPay(e.target.value)} className={field} /></label><label>Pago por intento fallido<input type="number" min="0" value={failedPay} onChange={(e) => setFailedPay(e.target.value)} className={field} /></label></div>}
  <div className="flex gap-3"><button type="button" onClick={() => router.back()} className="rounded-xl border px-4 py-3">Cancelar</button><button type="button" onClick={() => void handleSave()} disabled={loading} className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Guardando..." : "Crear usuario"}</button></div>
  <UiMessage open={Boolean(message)} title={message?.title ?? ""} message={message?.text ?? ""} type={message?.type ?? "info"} onClose={() => { const success = message?.type === "success"; setMessage(null); if (success) router.push("/dashboard/users/list"); }} />
  </div>;
}

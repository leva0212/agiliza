"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Tooltip from "@mui/material/Tooltip";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";
import { standardMrtActionColumnSizing, standardMrtFeatures } from "@/shared/config/material-react-table";
import { User } from "@/modules/users/types/user";
import { toggleUserActive } from "../api/toggle-user-active";
import { getRoleLabel } from "@/modules/users/utils/get-role-label";
import { UiMessage } from "@/shared/components/ui-message";
import { copyTemporaryPassword } from "@/modules/auth/copy-temporary-password";
import { generateTemporaryPassword } from "@/modules/auth/temporary-password";

export function UsersTable({ data }: { data: User[] }) {
  const router = useRouter(); const queryClient = useQueryClient();
  const [selected, setSelected] = useState<User | null>(null); const [temporaryPassword, setTemporaryPassword] = useState(""); const [showTemporaryPassword, setShowTemporaryPassword] = useState(false); const [resetOpen, setResetOpen] = useState(false); const [message, setMessage] = useState<{title:string;text:string;type:"success"|"error"|"warning"|"info"|"question"}|null>(null);
  async function toggle(user: User) { try { await toggleUserActive(user.id, !user.active); await queryClient.invalidateQueries({ queryKey: ["users"] }); } catch (error) { setMessage({ title:"Error", text:error instanceof Error ? error.message : "No fue posible actualizar el usuario.", type:"error" }); } }
  async function reset() { if (!selected) return; const response = await fetch("/api/users/reset-password", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ profileId:selected.id, temporaryPassword }) }); const body = await response.json(); if (!response.ok) return setMessage({title:"No se pudo restablecer",text:body.message,type:"error"}); setResetOpen(false); setTemporaryPassword(""); setMessage({title:"Contraseña temporal establecida",text:"Entrégala de forma segura. El usuario deberá cambiarla al ingresar.",type:"success"}); }
  const columns = useMemo<MRT_ColumnDef<User>[]>(() => [
    { accessorKey:"full_name", header:"Nombre" }, { accessorKey:"username", header:"Usuario", Cell:({cell}) => cell.getValue<string>() || "Sin asignar" }, { accessorKey:"email", header:"Correo técnico", Cell:() => "Cuenta interna" }, { accessorFn:(row) => row.company?.name ?? "", id:"company", header:"Empresa" }, { accessorFn:(row) => getRoleLabel(row.role), id:"role", header:"Rol" }, { accessorKey:"active", header:"Activo", Cell:({cell}) => cell.getValue<boolean>() ? "Sí" : "No" },
    { accessorKey:"actions", header:"Acciones", ...standardMrtActionColumnSizing, Cell:({row}) => <div className="flex gap-2"><Tooltip title="Editar usuario"><button onClick={() => router.push(`/dashboard/users/edit/${row.original.id}`)} className="rounded bg-blue-600 px-2 py-1 text-white">✏️</button></Tooltip><Tooltip title={row.original.active ? "Desactivar usuario" : "Activar usuario"}><button onClick={() => void toggle(row.original)} className="rounded bg-slate-700 px-2 py-1 text-white">{row.original.active ? "🔒" : "🔓"}</button></Tooltip><Tooltip title="Establecer contraseña temporal"><button onClick={() => { setSelected(row.original); setTemporaryPassword(generateTemporaryPassword()); setShowTemporaryPassword(false); setResetOpen(true); }} className="rounded bg-amber-500 px-2 py-1 text-white">🔑</button></Tooltip></div> },
  ], [router, data]);
  return <><MaterialReactTable {...standardMrtFeatures} columns={columns} data={data} /><UiMessage open={resetOpen} type="question" title="Restablecer contraseña" message={<div className="space-y-3"><p>Se generó una contraseña temporal para {selected?.full_name}. No quedará guardada en el sistema y deberá entregarla de forma segura.</p><div className="relative"><input type={showTemporaryPassword ? "text" : "password"} value={temporaryPassword} readOnly className="input-has-double-trailing-icon w-full rounded border p-2 text-slate-900"/><button type="button" onClick={() => setShowTemporaryPassword((value) => !value)} title={showTemporaryPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-label={showTemporaryPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-500">{showTemporaryPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button><button type="button" onClick={() => void copyTemporaryPassword(temporaryPassword)} title="Copiar contraseña temporal" aria-label="Copiar contraseña temporal" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"><Copy size={18} /></button></div><button type="button" onClick={() => setTemporaryPassword(generateTemporaryPassword())} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"><RefreshCw size={14} /> Generar otra</button></div>} confirmText="Restablecer" cancelText="Cancelar" onClose={() => setResetOpen(false)} onConfirm={() => void reset()} /><UiMessage open={Boolean(message)} title={message?.title ?? ""} message={message?.text ?? ""} type={message?.type ?? "info"} onClose={() => setMessage(null)} /></>;
}

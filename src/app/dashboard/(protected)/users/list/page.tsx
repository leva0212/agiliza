"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getUsers } from "@/modules/users/services/get-users";
import { UsersTable } from "../../../../../modules/users/components/users-table";
import { AppBarActionLink, AppBarActions } from "@/shared/components/app-bar-actions";
import type { User, UserRole } from "@/modules/users/types/user";
import { SearchSelector } from "@/shared/components/search-selector";
import { FilterSearchInput } from "@/shared/components/filter-search-input";

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: "super_admin", label: "Administrativo" },
  { value: "company_admin", label: "Operativo" },
  { value: "courier", label: "Mensajero" },
  { value: "seller", label: "Vendedor" },
];

export default function UsersListPage() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const [nameEnabled, setNameEnabled] = useState(false); const [name, setName] = useState("");
  const [roleEnabled, setRoleEnabled] = useState(false); const [role, setRole] = useState<UserRole | "">("");
  const [companyEnabled, setCompanyEnabled] = useState(false); const [companyId, setCompanyId] = useState("");
  const [canDeliverOnly, setCanDeliverOnly] = useState(false);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false); const [companySearch, setCompanySearch] = useState("");

  const companies = useMemo(() => Array.from(new Map(data.filter((user) => user.company).map((user) => [user.company!.id, user.company!])).values()).sort((a, b) => a.name.localeCompare(b.name)), [data]);
  const selectedCompany = companies.find((company) => company.id === companyId);
  const filteredData = useMemo(() => data.filter((user) => {
    const matchesName = !nameEnabled || user.full_name.toLocaleLowerCase().includes(name.trim().toLocaleLowerCase()) || (user.username ?? "").toLocaleLowerCase().includes(name.trim().toLocaleLowerCase());
    const matchesRole = !roleEnabled || !role || user.role === role;
    const matchesCompany = !companyEnabled || !companyId || user.company_id === companyId;
    const matchesCanDeliver = !canDeliverOnly || user.can_deliver === true;
    return matchesName && matchesRole && matchesCompany && matchesCanDeliver;
  }), [data, nameEnabled, name, roleEnabled, role, companyEnabled, companyId, canDeliverOnly]);
  const visibleCompanies = companies.filter((company) => company.name.toLocaleLowerCase().includes(companySearch.trim().toLocaleLowerCase()));
  const checkboxClass = "size-4 accent-sky-600";

  if (isLoading) return <p>Cargando usuarios...</p>;
  if (error) return <p>Error cargando usuarios</p>;

  return <div className="mx-auto max-w-[1100px] space-y-4">
    <AppBarActions><AppBarActionLink href="/dashboard/users/new" label="Nuevo usuario"><Plus size={20} /></AppBarActionLink></AppBarActions>
    <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900/50"><div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"><div className="flex items-baseline gap-2"><h2 className="font-semibold">Filtros</h2><p className="text-xs text-slate-500">Marca para activar.</p></div><p className="text-xs text-slate-500">Mostrando {filteredData.length} de {data.length} usuarios.</p></div><div className="grid gap-2 md:grid-cols-3">
      <div className="min-w-0 rounded-lg border border-slate-200 p-2 dark:border-slate-700" title="Filtra usuarios por su nombre completo o usuario."><label title="Marca para aplicar el filtro por nombre o usuario" className="mb-1 flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={nameEnabled} onChange={(event) => setNameEnabled(event.target.checked)} title="Marca para aplicar el filtro por nombre o usuario" className={checkboxClass} />Nombre o usuario</label><FilterSearchInput helpText="Escribe parte del nombre o usuario que deseas encontrar." value={name} onChange={(event) => { setName(event.target.value); if (event.target.value) setNameEnabled(true); }} placeholder="Ej.: leo" aria-label="Nombre o usuario" className="rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></div>
      <div className="min-w-0 rounded-lg border border-slate-200 p-2 dark:border-slate-700" title="Filtra usuarios por rol."><label title="Marca para aplicar el filtro por rol" className="mb-1 flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={roleEnabled} onChange={(event) => setRoleEnabled(event.target.checked)} title="Marca para aplicar el filtro por rol" className={checkboxClass} />Rol</label><select title="Selecciona el rol que deseas usar como filtro." value={role} onChange={(event) => { setRole(event.target.value as UserRole); if (event.target.value) setRoleEnabled(true); }} aria-label="Rol" className="w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">Seleccione un rol</option>{ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
      <div className="min-w-0 rounded-lg border border-slate-200 p-2 dark:border-slate-700" title="Filtra usuarios por empresa."><label title="Marca para aplicar el filtro por empresa" className="mb-1 flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={companyEnabled} onChange={(event) => setCompanyEnabled(event.target.checked)} title="Marca para aplicar el filtro por empresa" className={checkboxClass} />Empresa</label><SearchSelector label="" valueName={selectedCompany?.name ?? ""} placeholder="Seleccione una empresa" tooltip="Abre la lista de empresas para filtrar usuarios." onSearch={() => setCompanyDialogOpen(true)} /></div>
      <label title="Muestra únicamente usuarios habilitados para realizar entregas." className="flex items-center gap-2 text-sm font-medium md:col-span-3"><input type="checkbox" checked={canDeliverOnly} onChange={(event) => setCanDeliverOnly(event.target.checked)} title="Muestra únicamente usuarios que pueden realizar entregas" className={checkboxClass} />Puede hacer entregas</label>
    </div></section>
    <UsersTable data={filteredData} />
    {companyDialogOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900"><div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold">Seleccionar empresa</h3><p className="text-sm text-slate-500">Busca y selecciona una empresa.</p></div><button title="Cierra el selector de empresa." onClick={() => setCompanyDialogOpen(false)} aria-label="Cerrar selector de empresa" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20} /></button></div><FilterSearchInput autoFocus helpText="Busca una empresa por código o nombre." value={companySearch} onChange={(event) => setCompanySearch(event.target.value)} placeholder="Buscar empresa" className="mb-3 rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-950" /><button title="Quita el filtro por empresa y muestra todos los usuarios." onClick={() => { setCompanyId(""); setCompanyDialogOpen(false); }} className="mb-2 w-full rounded-lg p-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Todas las empresas</button><div className="max-h-72 overflow-y-auto">{visibleCompanies.map((company) => <button title={`Filtra usuarios por ${company.name}.`} key={company.id} onClick={() => { setCompanyId(company.id); setCompanyEnabled(true); setCompanyDialogOpen(false); }} className={`w-full rounded-lg p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${company.id === companyId ? "bg-sky-100 dark:bg-sky-950" : ""}`}>{company.name}</button>)}</div></div></div>}
  </div>;
}


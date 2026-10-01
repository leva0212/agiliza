"use client";

import { AppVersion } from "@/shared/components/app-version";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import { createContext, type MouseEvent, type ReactNode, useContext, useState } from "react";
import { ChevronDown, ChevronRight, Monitor, Moon, Search, Sun, UserRound, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { type ThemeMode, useAppTheme } from "@/app/theme-provider";
import { UiMessage } from "@/shared/components/ui-message";

export type DashboardProfile = {
  id: string;

  company_id: string | null;

  role: "super_admin" | "company_admin" | "courier" | "seller";

  full_name: string;

  active: boolean;

  is_owner_company_user: boolean;
  dts_chat_enabled: boolean;
  restricted_supervisor_mode: boolean;
  company_label?: string | null;
};

type Props = {
  profile: DashboardProfile;
  expanded: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

type SidebarSectionProps = {
  title: string;
  expanded: boolean;
  collapsed: boolean;
  onToggle: () => void;
  className: string;
  forceOpen?: boolean;
  visible?: boolean;
  children: ReactNode;
};

const SidebarSearchContext = createContext("");

function SidebarSection({ title, expanded, collapsed, onToggle, className, forceOpen = false, visible = true, children }: SidebarSectionProps) {
  if (!visible) return null;
  return <div className={className}>
    {expanded && <button type="button" onClick={onToggle} aria-expanded={!collapsed} className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 hover:bg-white/[0.06] hover:text-gray-200">
      <span>{title}</span>
      {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
    </button>}
    <div className={expanded && collapsed && !forceOpen ? "hidden" : "space-y-1"}>{children}</div>
  </div>;
}

type SidebarNavLinkProps = {
  href: string;
  className: string;
  children: ReactNode;
  prefetch?: boolean;
  searchTerms?: string;
};

function SidebarNavLink({ href, className, children, prefetch = false, searchTerms = "" }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const searchQuery = useContext(SidebarSearchContext);
  const active = href === "/dashboard"
    ? pathname === "/dashboard" || pathname === "/dashboard/"
    : pathname === href || (href.endsWith("/list") && pathname.startsWith(`${href.slice(0, -4)}/`));

  const label = typeof children === "string" ? children : "";
  const searchableText = `${label} ${searchTerms}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (searchQuery && !searchableText.includes(searchQuery)) return null;

  return (
    <Link
      href={href}
      prefetch={prefetch}
      aria-current={active ? "page" : undefined}
      className={`${className} ${active ? "border border-sky-400/70 bg-sky-800/80 text-white shadow-[inset_3px_0_0_0_#38bdf8]" : ""}`}
    >
      {children}
    </Link>
  );
}

export function DashboardSidebar({
  profile,
  expanded,
  mobileOpen,
  onCloseMobile,
}: Props) {
  const router = useRouter();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [navigationFilter, setNavigationFilter] = useState("");
  const [navigationSearchActive, setNavigationSearchActive] = useState(false);
  const { mode, setMode } = useAppTheme();

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/login");

    router.refresh();
  }

  const isSuperAdmin = profile.role === "super_admin";

  const isCompanyAdmin = profile.role === "company_admin";

  const isCourier = profile.role === "courier";
  const canAccessInternalFeatures = profile.is_owner_company_user;
  const isRestrictedSupervisor = canAccessInternalFeatures && isCompanyAdmin && profile.restricted_supervisor_mode;
  const normalizedNavigationFilter = navigationFilter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const roleLabel: Record<DashboardProfile["role"], string> = {
    super_admin: "Administrador",
    company_admin: "Supervisor",
    courier: "Mensajero",
    seller: "Vendedor",
  };
  const menuSectionClassName = expanded
    ? "rounded-xl border border-white/[0.06] bg-white/[0.035] p-1.5"
    : "rounded-xl border border-white/[0.05] bg-white/[0.025] p-1";

  function toggleSection(section: string) {
    setCollapsedSections((current) => ({ ...current, [section]: !current[section] }));
  }

  function handleMobileNavigation(event: MouseEvent<HTMLElement>) {
    const clickedLink = event.target instanceof Element && event.target.closest("a");

    if (clickedLink && window.matchMedia("(max-width: 767px)").matches) {
      onCloseMobile();
    }
  }

  function selectTheme(themeMode: ThemeMode) {
    setMode(themeMode);
    setThemeMenuOpen(false);
  }

  function sectionMatches(...terms: string[]) {
    return !normalizedNavigationFilter || terms.some((term) => term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(normalizedNavigationFilter));
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="

            fixed
            inset-0
            bg-black/40
            z-40
            md:hidden
          "
          onClick={() => onCloseMobile()}
        />
      )}

      <aside
        className={`
          fixed
          top-0
          left-0
          h-screen
          md:sticky
          md:top-0
          shrink-0
          z-50
          flex
          flex-col
          overflow-hidden

          bg-black
          text-white

          transition-all
          duration-300

          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}

          w-64
          ${expanded ? "md:w-64" : "md:w-20"}
        `}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-700 px-3">
          <div className="flex items-center gap-1">

            <div className="relative">
              <button
                type="button"
                title={`Tema: ${mode === "system" ? "Sistema" : mode === "dark" ? "Oscuro" : "Claro"}`}
                aria-label="Cambiar tema"
                onClick={() => setThemeMenuOpen((current) => !current)}
                className="flex size-10 items-center justify-center rounded-lg text-gray-200 hover:bg-gray-800"
              >
                {mode === "dark" ? <Moon size={18} /> : mode === "light" ? <Sun size={18} /> : <Monitor size={18} />}
              </button>

              {themeMenuOpen && (
                <div className="absolute left-0 top-full z-[70] mt-2 w-40 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 p-1 shadow-xl">
                  <button type="button" onClick={() => selectTheme("light")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-800 ${mode === "light" ? "bg-gray-800 text-white" : "text-gray-300"}`}>
                    <Sun size={16} /> Claro
                  </button>
                  <button type="button" onClick={() => selectTheme("dark")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-800 ${mode === "dark" ? "bg-gray-800 text-white" : "text-gray-300"}`}>
                    <Moon size={16} /> Oscuro
                  </button>
                  <button type="button" onClick={() => selectTheme("system")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-800 ${mode === "system" ? "bg-gray-800 text-white" : "text-gray-300"}`}>
                    <Monitor size={16} /> Sistema
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => onCloseMobile()}
            className="flex size-10 items-center justify-center rounded-lg hover:bg-gray-800 md:hidden"
          >
            ✕
          </button>
        </div>

        <div className="shrink-0 border-b border-gray-700 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sky-300"><UserRound size={17} /></span>
            <div className="min-w-0">
              <div className="truncate font-medium">{profile.full_name}</div>
              <div className="text-xs text-gray-400">{roleLabel[profile.role]}</div>
              {profile.company_label && (
                <div className="truncate text-xs text-sky-300">{profile.company_label}</div>
              )}
            </div>
          </div>
        </div>

        <nav
          className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3"
          onClick={handleMobileNavigation}
        >
          {canAccessInternalFeatures && !isRestrictedSupervisor && expanded && <div className="sticky top-0 z-20 -mx-3 -mt-3 bg-gray-950 px-4 py-3 shadow-[0_6px_10px_-8px_rgba(0,0,0,0.9)]"><div className="relative"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="search" name="sidebar-menu-search" autoComplete="off" data-lpignore="true" data-1p-ignore="true" readOnly={!navigationSearchActive} onFocus={() => setNavigationSearchActive(true)} onBlur={() => setNavigationSearchActive(false)} value={navigationFilter} onChange={(event) => setNavigationFilter(event.target.value)} placeholder="Buscar en el menú" aria-label="Buscar opción del menú" title="Filtra las opciones disponibles del menú." className="input-has-both-icons w-full rounded-lg border border-gray-700 bg-gray-900 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-sky-400" />{navigationFilter && <button type="button" onClick={() => setNavigationFilter("")} aria-label="Limpiar búsqueda" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><X size={16} /></button>}</div></div>}
          <SidebarSearchContext.Provider value={canAccessInternalFeatures ? normalizedNavigationFilter : ""}>
          <SidebarSection title="Principal" expanded={expanded} collapsed={Boolean(collapsedSections.principal)} onToggle={() => toggleSection("principal")} className={menuSectionClassName} forceOpen={Boolean(normalizedNavigationFilter)} visible={sectionMatches("principal", "inicio", "chat", "seguridad", "mi seguridad")}>
          <SidebarNavLink prefetch={false}
            href="/dashboard"
            className="block p-3 rounded-lg hover:bg-gray-800"
          >
            {expanded ? "🏠 Inicio" : "🏠"}
          </SidebarNavLink>















          {(!isRestrictedSupervisor && (canAccessInternalFeatures || profile.dts_chat_enabled)) && <SidebarNavLink prefetch={false} href="/dashboard/chat" className="block rounded-lg p-3 hover:bg-gray-800">
            {expanded ? "💬 Chat" : "💬"}
          </SidebarNavLink>}
          <SidebarNavLink prefetch={false} href="/dashboard/profile/security" className="block p-3 rounded-lg hover:bg-gray-800">
            {expanded ? "🔐 Mi seguridad" : "🔐"}
          </SidebarNavLink>
          </SidebarSection>

          <SidebarSection title="Operación" expanded={expanded} collapsed={Boolean(collapsedSections.operation)} onToggle={() => toggleSection("operation")} className={menuSectionClassName} forceOpen={Boolean(normalizedNavigationFilter)} visible={sectionMatches("operacion", "tracking", "cobertura", "envios", "mis entregas")}>
          <SidebarNavLink prefetch={false}
            href="/dashboard/tracking"
            className="block p-3 rounded-lg hover:bg-gray-800"
          >
            {expanded ? "📋 Tracking" : "📋"}
          </SidebarNavLink>

          <SidebarNavLink prefetch={false}
            href="/dashboard/coverage"
            className="block p-3 rounded-lg hover:bg-gray-800"
          >
            {expanded ? "🗺️ Cobertura" : "🗺️"}
          </SidebarNavLink>

          {canAccessInternalFeatures && !isRestrictedSupervisor && (isSuperAdmin || isCompanyAdmin) && (
            <SidebarNavLink prefetch={false}
              href="/dashboard/shipments/list"
              className="block p-3 rounded-lg hover:bg-gray-800"
            >
              {expanded ? "📦 Envíos" : "📦"}
            </SidebarNavLink>
          )}

          {canAccessInternalFeatures && isCourier && (
            <SidebarNavLink prefetch={false}
              href="/dashboard/my-shipments"
              className="block p-3 rounded-lg hover:bg-gray-800"
            >
              {expanded ? "🚚 Mis entregas" : "🚚"}
            </SidebarNavLink>
          )}
          </SidebarSection>

          {canAccessInternalFeatures && !isRestrictedSupervisor && (isSuperAdmin || isCompanyAdmin) && (
            <SidebarSection title="Configuración" expanded={expanded} collapsed={Boolean(collapsedSections.settings)} onToggle={() => toggleSection("settings")} className={menuSectionClassName} forceOpen={Boolean(normalizedNavigationFilter)} visible={sectionMatches("configuracion", "chat", "empresas dts")}>
              <SidebarNavLink prefetch={false} href="/dashboard/settings/chat" searchTerms="configuracion empresas dts" className="block rounded-lg p-3 hover:bg-gray-800">
                {expanded ? "⚙️ Configuración global" : "⚙️"}
              </SidebarNavLink>
            </SidebarSection>
          )}

          {isSuperAdmin && (
            <>
              <SidebarSection title="Gestión operativa" expanded={expanded} collapsed={Boolean(collapsedSections.operationsManagement)} onToggle={() => toggleSection("operationsManagement")} className={menuSectionClassName} forceOpen={Boolean(normalizedNavigationFilter)} visible={sectionMatches("gestion operativa", "rutas", "ruta", "empresas", "productos", "inventario", "movimientos", "tarifas")}>
              <SidebarNavLink prefetch={false}
                href="/dashboard/routes/list"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {expanded ? "📋 Ver rutas" : "📋"}
              </SidebarNavLink>

              <SidebarNavLink prefetch={false}
                href="/dashboard/routes"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {expanded ? "➕ Crear ruta" : "➕"}
              </SidebarNavLink>

              <SidebarNavLink prefetch={false}
                href="/dashboard/companies/list"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {expanded ? "🏢 Empresas" : "🏢"}
              </SidebarNavLink>

              <SidebarNavLink prefetch={false}
                href="/dashboard/products/list"
                className="
    block
    p-3
    rounded-lg
    hover:bg-gray-800
  "
              >
                {expanded ? "📦 Productos" : "📦"}
              </SidebarNavLink>
              <SidebarNavLink prefetch={false}
                href="/dashboard/inventory/list"
                className="
    block
    p-3
    rounded-lg
    hover:bg-gray-800
  "
              >
                {expanded ? "📦 Inventario" : "📦"}
              </SidebarNavLink>
              <SidebarNavLink prefetch={false} href="/dashboard/inventory/movements" className="block p-3 rounded-lg hover:bg-gray-800">
                {expanded ? "📜 Movimientos de inventario" : "📜"}
              </SidebarNavLink>
              <SidebarNavLink prefetch={false}
                href="/dashboard/rates"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {expanded ? "💰 Tarifas" : "💰"}
              </SidebarNavLink>
              </SidebarSection>
              <SidebarSection title="Administración" expanded={expanded} collapsed={Boolean(collapsedSections.administration)} onToggle={() => toggleSection("administration")} className={menuSectionClassName} forceOpen={Boolean(normalizedNavigationFilter)} visible={sectionMatches("administracion", "usuarios", "usuario")}>
              <SidebarNavLink prefetch={false}
                href="/dashboard/users/list"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {expanded ? "👤 Usuarios" : "👤"}
              </SidebarNavLink>
              </SidebarSection>
            </>
          )}

          {canAccessInternalFeatures && !isRestrictedSupervisor && (isSuperAdmin || isCompanyAdmin) && (
            <SidebarSection title="Liquidaciones y reportes" expanded={expanded} collapsed={Boolean(collapsedSections.settlements)} onToggle={() => toggleSection("settlements")} className={menuSectionClassName} forceOpen={Boolean(normalizedNavigationFilter)} visible={sectionMatches("liquidaciones", "reportes", "cobros", "pagos", "cronogramas", "totales", "dts", "mensajeros")}>
              <SidebarNavLink prefetch={false} href="/dashboard/reports/dts-charges" searchTerms="reportes" className="block p-3 rounded-lg hover:bg-gray-800">
                {expanded ? "💳 Cobros a DTS" : "💳"}
              </SidebarNavLink>
              <SidebarNavLink prefetch={false} href="/dashboard/reports/courier-payments" searchTerms="reportes" className="block p-3 rounded-lg hover:bg-gray-800">
                {expanded ? "💰 Pagos a mensajeros" : "💰"}
              </SidebarNavLink>
              <SidebarNavLink prefetch={false} href="/dashboard/settlements/schedules" searchTerms="reportes liquidaciones" className="block p-3 rounded-lg hover:bg-gray-800">
                {expanded ? "📅 Cronogramas de liquidación" : "📅"}
              </SidebarNavLink>
              <SidebarNavLink prefetch={false} href="/dashboard/settlements/dts" searchTerms="reportes liquidaciones" className="block p-3 rounded-lg hover:bg-gray-800">
                {expanded ? "🏢 Totales por DTS" : "🏢"}
              </SidebarNavLink>
              <SidebarNavLink prefetch={false} href="/dashboard/settlements/couriers" searchTerms="reportes liquidaciones" className="block p-3 rounded-lg hover:bg-gray-800">
                {expanded ? "🚚 Totales por mensajero" : "🚚"}
              </SidebarNavLink>
            </SidebarSection>
          )}

          <button
            type="button"
            onClick={() => setLogoutConfirmationOpen(true)}
            className="
              w-full
              text-left
              p-3
              rounded-lg
              hover:bg-red-900
            "
          >
            {expanded ? "🚪 Cerrar sesión" : "🚪"}
          </button>
          </SidebarSearchContext.Provider>
        </nav>

        <UiMessage
          open={logoutConfirmationOpen}
          type="question"
          title="¿Cerrar sesión?"
          message="Se cerrará tu sesión en este dispositivo. Para volver a iniciar sesión necesitarás conexión a internet."
          cancelText="Cancelar"
          confirmText="Cerrar sesión"
          onClose={() => setLogoutConfirmationOpen(false)}
          onConfirm={() => {
            setLogoutConfirmationOpen(false);
            void handleLogout();
          }}
        />

        <div
          className="
            mt-auto
            shrink-0
            flex
            justify-center
            py-3
          "
        >
          <AppVersion showUpdateTooltip={expanded || mobileOpen} />
        </div>
      </aside>

    </>
  );
}

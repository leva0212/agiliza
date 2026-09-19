"use client";

import { AppVersion } from "@/shared/components/app-version";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { type MouseEvent, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { type ThemeMode, useAppTheme } from "@/app/theme-provider";

export type DashboardProfile = {
  id: string;

  company_id: string | null;

  role: "super_admin" | "company_admin" | "courier" | "seller";

  full_name: string;

  active: boolean;

  is_owner_company_user: boolean;
};

type Props = {
  profile: DashboardProfile;
  expanded: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function DashboardSidebar({
  profile,
  expanded,
  mobileOpen,
  onCloseMobile,
}: Props) {
  const router = useRouter();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
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

        <div className="shrink-0 px-4 py-3 border-b border-gray-700">
          <div className="text-sm text-gray-400">Usuario</div>

          <div className="font-medium truncate">{profile.full_name}</div>

          {isSuperAdmin && (
            <div className="text-xs text-gray-400">{profile.role}</div>
          )}
        </div>

        <nav
          className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3"
          onClick={handleMobileNavigation}
        >
          <Link prefetch={false}
            href="/dashboard"
            className="block p-3 rounded-lg hover:bg-gray-800"
          >
            {expanded ? "🏠 Inicio" : "🏠"}
          </Link>

          <Link prefetch={false}
            href="/dashboard/tracking"
            className="block p-3 rounded-lg hover:bg-gray-800"
          >
            {expanded ? "📋 Tracking" : "📋"}
          </Link>

          <Link prefetch={false}
            href="/dashboard/coverage"
            className="block p-3 rounded-lg hover:bg-gray-800"
          >
            {expanded ? "🗺️ Cobertura" : "🗺️"}
          </Link>

          {canAccessInternalFeatures && (isSuperAdmin || isCompanyAdmin) && (
            <Link prefetch={false}
              href="/dashboard/shipments/list"
              className="block p-3 rounded-lg hover:bg-gray-800"
            >
              {expanded ? "📦 Envíos" : "📦"}
            </Link>
          )}

          {isSuperAdmin && (
            <>
              <Link prefetch={false}
                href="/dashboard/routes/list"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {expanded ? "📋 Ver rutas" : "📋"}
              </Link>

              <Link prefetch={false}
                href="/dashboard/routes"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {expanded ? "➕ Crear ruta" : "➕"}
              </Link>

              <Link prefetch={false}
                href="/dashboard/companies/list"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {expanded ? "🏢 Empresas" : "🏢"}
              </Link>

              <Link prefetch={false}
                href="/dashboard/products/list"
                className="
    block
    p-3
    rounded-lg
    hover:bg-gray-800
  "
              >
                {expanded ? "📦 Productos" : "📦"}
              </Link>
              <Link prefetch={false}
                href="/dashboard/inventory/list"
                className="
    block
    p-3
    rounded-lg
    hover:bg-gray-800
  "
              >
                {expanded ? "📦 Inventario" : "📦"}
              </Link>

              <Link prefetch={false}
                href="/dashboard/rates"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {expanded ? "💰 Tarifas" : "💰"}
              </Link>

              <Link prefetch={false}
                href="/dashboard/users/list"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {expanded ? "👤 Usuarios" : "👤"}
              </Link>
            </>
          )}

          {canAccessInternalFeatures && isCourier && (
            <Link prefetch={false}
              href="/dashboard/my-shipments"
              className="block p-3 rounded-lg hover:bg-gray-800"
            >
              {expanded ? "🚚 Mis entregas" : "🚚"}
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
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
        </nav>

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

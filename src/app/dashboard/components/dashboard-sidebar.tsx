"use client";

import { AppVersion } from "@/shared/components/app-version";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { type MouseEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;

  company_id: string | null;

  role: "super_admin" | "company_admin" | "courier" | "seller";

  full_name: string;

  active: boolean;

  is_owner_company_user: boolean;
};

type Props = {
  profile: Profile;
};

export function DashboardSidebar({ profile }: Props) {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/login");

    router.refresh();
  }

  const isSuperAdmin = profile.role === "super_admin";

  const isCompanyAdmin = profile.role === "company_admin";

  const isCourier = profile.role === "courier";
  const isSeller = profile.role === "seller";
  const canAccessInternalFeatures = profile.is_owner_company_user;

  function handleMobileNavigation(event: MouseEvent<HTMLElement>) {
    const clickedLink = event.target instanceof Element && event.target.closest("a");

    if (clickedLink && window.matchMedia("(max-width: 767px)").matches) {
      setMobileOpen(false);
    }
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
          onClick={() => setMobileOpen(false)}
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

          ${sidebarOpen ? "w-64" : "w-20"}
        `}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-700 px-3">
          <button
            type="button"
            aria-label="Contraer o expandir menú"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex size-10 items-center justify-center rounded-lg hover:bg-gray-800"
          >
            ☰
          </button>

          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
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
          <Link
            href="/dashboard/tracking"
            className="block p-3 rounded-lg hover:bg-gray-800"
          >
            {sidebarOpen ? "📋 Seguimiento" : "📋"}
          </Link>

          <Link
            href="/dashboard/coverage"
            className="block p-3 rounded-lg hover:bg-gray-800"
          >
            {sidebarOpen ? "🗺️ Cobertura" : "🗺️"}
          </Link>

          {canAccessInternalFeatures && (isSuperAdmin || isCompanyAdmin) && (
            <Link
              href="/dashboard/shipments/list"
              className="block p-3 rounded-lg hover:bg-gray-800"
            >
              {sidebarOpen ? "📦 Envíos" : "📦"}
            </Link>
          )}

          {isSuperAdmin && (
            <>
              <Link
                href="/dashboard/routes/list"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {sidebarOpen ? "📋 Ver rutas" : "📋"}
              </Link>

              <Link
                href="/dashboard/routes"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {sidebarOpen ? "➕ Crear ruta" : "➕"}
              </Link>

              <Link
                href="/dashboard/companies/list"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {sidebarOpen ? "🏢 Empresas" : "🏢"}
              </Link>

              <Link
                href="/dashboard/products/list"
                className="
    block
    p-3
    rounded-lg
    hover:bg-gray-800
  "
              >
                {sidebarOpen ? "📦 Productos" : "📦"}
              </Link>
              <Link
                href="/dashboard/inventory/list"
                className="
    block
    p-3
    rounded-lg
    hover:bg-gray-800
  "
              >
                {sidebarOpen ? "📦 Inventario" : "📦"}
              </Link>

              <Link
                href="/dashboard/rates"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {sidebarOpen ? "💰 Tarifas" : "💰"}
              </Link>

              <Link
                href="/dashboard/users/list"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {sidebarOpen ? "👤 Usuarios" : "👤"}
              </Link>
            </>
          )}

          {canAccessInternalFeatures && isCourier && (
            <Link
              href="/dashboard/my-shipments"
              className="block p-3 rounded-lg hover:bg-gray-800"
            >
              {sidebarOpen ? "🚚 Mis entregas" : "🚚"}
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
            {sidebarOpen ? "🚪 Cerrar sesión" : "🚪"}
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
          <AppVersion showUpdateTooltip />
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="
          fixed
          top-4
          left-4
          z-30
          md:hidden
          bg-black
          text-white
          p-2
          rounded-lg
        "
      >
        ☰
      </button>
    </>
  );
}

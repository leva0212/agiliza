"use client";

import { AppVersion } from "@/shared/components/app-version";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;

  company_id: string | null;

  role: "super_admin" | "company_admin" | "courier" | "seller";

  full_name: string;

  active: boolean;
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
          min-h-[800]
          fixed
          top-0
          left-0
          h-screen
          md:sticky
          md:top-0
          shrink-0
          z-50

          bg-black
          text-white

          transition-all
          duration-300

          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}

          ${sidebarOpen ? "w-64" : "w-20"}
        `}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between">
          <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-3 border-b border-gray-700">
          <div className="text-sm text-gray-400">Usuario</div>

          <div className="font-medium truncate">{profile.full_name}</div>

          <div className="text-xs text-gray-400">{profile.role}</div>
        </div>

        <nav className="p-3 space-y-2">
          {(isSuperAdmin || isCompanyAdmin) && (
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
                href="/dashboard/coverage"
                className="block p-3 rounded-lg hover:bg-gray-800"
              >
                {sidebarOpen ? "🗺️ Cobertura" : "🗺️"}
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

          {isCourier && (
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
            flex
            justify-center
            py-10
          "
        >
          <AppVersion />
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

"use client";

import { AppVersion } from "@/shared/components/app-version";
import Link from "next/link";

import {
  useState,
} from "react";

export function DashboardSidebar() {

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(true);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  return (

    <>

      {/* MOBILE BACKDROP */}

      {mobileOpen && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            z-40
            md:hidden
          "
          onClick={() =>
            setMobileOpen(
              false
            )
          }
        />

      )}

      {/* SIDEBAR */}

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

          bg-black
          text-white
          transition-all
          duration-300

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }

          ${
            sidebarOpen
              ? "w-64"
              : "w-20"
          }
        `}
      >

        {/* HEADER */}

        <div className="p-4 border-b border-gray-700 flex justify-between">

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(
                !sidebarOpen
              )
            }
          >
            ☰
          </button>

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                false
              )
            }
            className="md:hidden"
          >
            ✕
          </button>

        </div>

        {/* MENU */}

        <nav className="p-3 space-y-2">

          <Link
            href="/dashboard/routes/list"
            className="block p-3 rounded-lg hover:bg-gray-800"
          >
            {
              sidebarOpen
                ? "📋 Ver rutas"
                : "📋"
            }
          </Link>

          <Link
            href="/dashboard/routes"
            className="block p-3 rounded-lg hover:bg-gray-800"
          >
            {
              sidebarOpen
                ? "➕ Crear ruta"
                : "➕"
            }
          </Link>

          <Link
            href="/dashboard/coverage"
            className="block p-3 rounded-lg hover:bg-gray-800"
          >
            {
              sidebarOpen
                ? "🗺️ Cobertura"
                : "🗺️"
            }
          </Link>

        </nav>

        <div   className="
    mt-4
    flex
    justify-center py-35
  ">
 <AppVersion />
        </div>
       

      </aside>

      {/* BOTÓN MOBILE */}

      <button
        type="button"
        onClick={() =>
          setMobileOpen(
            true
          )
        }
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
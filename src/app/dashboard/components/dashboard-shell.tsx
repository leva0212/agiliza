"use client";

import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { PageCloseGuardProvider } from "@/shared/components/page-close-guard";
import { UiMessage } from "@/shared/components/ui-message";
import {
  DashboardSidebar,
  type DashboardProfile,
} from "./dashboard-sidebar";

type Props = {
  children: React.ReactNode;
  profile?: DashboardProfile | null;
  contentClassName?: string;
};

function getPageTitle(pathname: string, searchParams: Pick<URLSearchParams, "has">) {
  if (pathname === "/dashboard" || pathname === "/dashboard/") return "Inicio";
  if (pathname === "/dashboard/tracking") return "Tracking";
  if (pathname === "/dashboard/coverage") return "Cobertura";
  if (pathname === "/dashboard/shipments") return "Nuevo envío";
  if (pathname === "/dashboard/shipments/list") return "Envíos";
  if (/^\/dashboard\/shipments\/[^/]+\/edit$/.test(pathname)) return "Modificar envío";
  if (/^\/dashboard\/shipments\/[^/]+$/.test(pathname)) return "Detalle del envío";
  if (pathname === "/dashboard/routes/list") return "Rutas";
  if (pathname === "/dashboard/routes") return searchParams.has("id") ? "Modificar ruta" : "Nueva ruta";
  if (pathname === "/dashboard/companies/list") return "Empresas";
  if (pathname === "/dashboard/companies") return searchParams.has("id") ? "Modificar empresa" : "Nueva empresa";
  if (pathname === "/dashboard/products/list") return "Productos";
  if (pathname === "/dashboard/products/new") return "Nuevo producto";
  if (/^\/dashboard\/products\/edit\/[^/]+$/.test(pathname)) return "Modificar producto";
  if (pathname === "/dashboard/inventory/list") return "Inventario";
  if (pathname === "/dashboard/inventory/movements") return "Movimientos de inventario";
  if (pathname === "/dashboard/rates") return "Tarifas";
  if (pathname === "/dashboard/users/list") return "Usuarios";
  if (pathname === "/dashboard/users/new") return "Nuevo usuario";
  if (/^\/dashboard\/users\/edit\/[^/]+$/.test(pathname)) return "Modificar usuario";
  if (pathname === "/dashboard/change-password") return "Cambiar contraseña";
  return "Agiliza";
}
function getPageCloseDestination(pathname: string) {
  const shipmentEdit = pathname.match(/^\/dashboard\/shipments\/([^/]+)\/edit$/);
  if (shipmentEdit) return "/dashboard/shipments/" + shipmentEdit[1];
  if (/^\/dashboard\/shipments\/[^/]+$/.test(pathname)) return "/dashboard/shipments/list";
  if (pathname === "/dashboard/shipments") return "/dashboard/shipments/list";

  if (pathname === "/dashboard/companies") return "/dashboard/companies/list";
  if (pathname === "/dashboard/routes") return "/dashboard/routes/list";
  if (pathname === "/dashboard/products/new" || /^\/dashboard\/products\/edit\/[^/]+$/.test(pathname)) {
    return "/dashboard/products/list";
  }
  if (pathname === "/dashboard/users/new" || /^\/dashboard\/users\/edit\/[^/]+$/.test(pathname)) {
    return "/dashboard/users/list";
  }

  return "/dashboard";
}
function DashboardPageTitle({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  return getPageTitle(pathname, searchParams);
}

export function DashboardShell({ children, profile, contentClassName = "" }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [closeConfirmationOpen, setCloseConfirmationOpen] = useState(false);
  const isHomePage = pathname === "/dashboard" || pathname === "/dashboard/";

  const handleGuardChange = useCallback((dirty: boolean) => {
    setHasUnsavedChanges(dirty);
  }, []);

  useEffect(() => {
    const resetDirtyState = window.setTimeout(() => {
      setHasUnsavedChanges(false);
    }, 0);

    return () => window.clearTimeout(resetDirtyState);
  }, [pathname]);

  function closeCurrentPage() {
    router.replace(getPageCloseDestination(pathname));
  }

  function requestCloseCurrentPage() {
    if (hasUnsavedChanges) {
      setCloseConfirmationOpen(true);
      return;
    }

    closeCurrentPage();
  }

  return (
    <PageCloseGuardProvider onChange={handleGuardChange}>
      <>
        <div className="flex min-h-screen overscroll-y-none bg-gray-50 dark:bg-slate-950">
          {profile && (
            <DashboardSidebar
              profile={profile}
              expanded={sidebarExpanded}
              mobileOpen={mobileSidebarOpen}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="fixed inset-x-0 top-0 z-30 flex h-14 shrink-0 touch-manipulation items-center gap-3 border-b-2 border-sky-200/80 bg-gradient-to-r from-white via-sky-50 to-white px-3 shadow-[0_7px_20px_-12px_rgba(15,23,42,0.65),inset_0_-1px_0_rgba(14,165,233,0.12)] dark:border-sky-900/70 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 sm:h-16 sm:px-5 md:sticky md:inset-x-auto md:backdrop-blur-md">
              {profile && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setSidebarExpanded(true);
                      setMobileSidebarOpen(true);
                    }}
                    aria-label="Abrir menú principal"
                    title="Abrir menú"
                    className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 md:hidden"
                  >
                    <Menu size={21} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSidebarExpanded((current) => !current)}
                    aria-label={sidebarExpanded ? "Contraer menú principal" : "Expandir menú principal"}
                    title={sidebarExpanded ? "Contraer menú" : "Expandir menú"}
                    className="hidden size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 md:flex"
                  >
                    {sidebarExpanded ? <PanelLeftClose size={21} /> : <PanelLeftOpen size={21} />}
                  </button>
                </>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="hidden size-2 rounded-full bg-sky-500 sm:block" />
                  <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-lg">
                    <Suspense fallback="Agiliza">
                      <DashboardPageTitle pathname={pathname} />
                    </Suspense>
                  </h1>
                </div>
                <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                  Agiliza · Logística y mensajería empresarial
                </p>
              </div>

              <div id="dashboard-appbar-actions" className="ml-auto flex shrink-0 items-center gap-2" />

              {!isHomePage && (pathname !== "/dashboard/coverage" || profile) && (
                <button
                  type="button"
                  onClick={requestCloseCurrentPage}
                  aria-label="Cerrar página actual"
                  title="Cerrar página"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-950/50 dark:hover:text-red-300"
                >
                  <X size={20} />
                </button>
              )}
            </header>

            <main className="min-w-0 flex-1 pt-14 sm:pt-16 md:pt-0">
              <div className={contentClassName}>{children}</div>
            </main>
          </div>
        </div>

        <UiMessage
          open={closeConfirmationOpen}
          title="¿Descartar cambios?"
          message="Los cambios sin guardar se perderán al cerrar esta página."
          type="question"
          cancelText="Seguir editando"
          confirmText="Descartar cambios"
          onClose={() => setCloseConfirmationOpen(false)}
          onConfirm={() => {
            setCloseConfirmationOpen(false);
            setHasUnsavedChanges(false);
            closeCurrentPage();
          }}
        />
      </>
    </PageCloseGuardProvider>
  );
}
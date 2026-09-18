import { ArrowRight, Boxes, Building2, Map, Package, Radar, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { RealtimeClock } from "@/modules/dashboard/components/realtime-clock";
import { getRoleLabel } from "@/modules/users/utils/get-role-label";

type QuickLink = {
  href: string;
  label: string;
  description: string;
  icon: typeof Radar;
  iconClass: string;
};

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      id,
      company_id,
      role,
      full_name,
      active,
      company:companies(id, name, trade_name, is_owner_company)
    `)
    .eq("id", user!.id)
    .single();

  const company = Array.isArray(profile?.company) ? profile.company[0] : profile?.company;
  const displayName = profile?.full_name?.trim() || "Usuario";
  const firstName = displayName.split(/\s+/)[0];
  const isOwnerCompany = Boolean(company?.is_owner_company);
  const isInternalAdmin = isOwnerCompany &&
    (profile?.role === "super_admin" || profile?.role === "company_admin");

  const quickLinks: QuickLink[] = [
    {
      href: "/dashboard/tracking",
      label: "Tracking",
      description: "Consulta y actualiza el seguimiento de entregas.",
      icon: Radar,
      iconClass: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    },
    {
      href: "/dashboard/coverage",
      label: "Cobertura",
      description: "Revisa las zonas disponibles para tus envíos.",
      icon: Map,
      iconClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    },
  ];

  if (isInternalAdmin) {
    quickLinks.push({
      href: "/dashboard/shipments/list",
      label: "Envíos",
      description: "Administra los envíos y sus evidencias.",
      icon: Package,
      iconClass: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    });
  }

  if (profile?.role === "super_admin") {
    quickLinks.push(
      {
        href: "/dashboard/inventory/list",
        label: "Inventario",
        description: "Controla productos y existencias.",
        icon: Boxes,
        iconClass: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
      },
      {
        href: "/dashboard/companies/list",
        label: "Empresas",
        description: "Gestiona las empresas registradas.",
        icon: Building2,
        iconClass: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
      },
      {
        href: "/dashboard/users/list",
        label: "Usuarios",
        description: "Administra accesos y permisos.",
        icon: Users,
        iconClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      },
    );
  }

  return (
    <div className="min-h-full overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50/60 to-blue-100/60 px-4 py-6 dark:from-slate-950 dark:via-slate-950 dark:to-sky-950/40 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-sky-900/10 backdrop-blur dark:border-white/10 dark:bg-slate-900/90 sm:p-8">
          <div className="absolute -right-20 -top-24 size-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-700/20" />
          <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            <div className="relative size-32 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg shadow-blue-900/15 dark:border-slate-700 sm:size-40">
              <Image
                src="/images/agiliza-logo-corporate.jpg"
                alt="Agiliza Logística y Mensajería Empresarial"
                fill
                priority
                sizes="160px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Sesión activa
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                ¡Bienvenido, {firstName}!
              </h2>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
                Todo listo para gestionar tu operación en Agiliza.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {company?.trade_name || company?.name || "Agiliza"}
                </span>
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300">
                  {getRoleLabel(profile?.role ?? "")}
                </span>
              </div>
            </div>
          </div>
        </section>

        <RealtimeClock />

        <section>
          <div className="mb-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Accesos rápidos</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Continúa con una de tus áreas disponibles.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map(({ href, label, description, icon: Icon, iconClass }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/85 dark:hover:border-sky-800"
              >
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}>
                  <Icon size={23} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white">{label}</div>
                  <div className="mt-0.5 text-sm leading-snug text-slate-500 dark:text-slate-400">{description}</div>
                </div>
                <ArrowRight className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-sky-600 dark:text-slate-600" size={19} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
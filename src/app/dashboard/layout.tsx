import {
  cookies,
} from "next/headers";

import {
  DashboardSidebar,
} from "./components/dashboard-sidebar";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {

  const cookieStore =
    await cookies();

  const isAuthenticated =
    cookieStore.get(
      "role"
    )?.value ===
    "admin";

  return (

    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR SOLO ADMIN */}

      {isAuthenticated && (
        <DashboardSidebar />
      )}

      {/* CONTENIDO */}

      <main className="flex-1">

        <div className="p-6">
          {children}
        </div>

      </main>

    </div>

  );

}
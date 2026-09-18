import { DashboardShell } from "../components/dashboard-shell";

export default function ChangePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return <DashboardShell>{children}</DashboardShell>;

}
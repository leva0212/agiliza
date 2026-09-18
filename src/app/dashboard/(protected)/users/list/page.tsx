"use client";

import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getUsers } from "@/modules/users/services/get-users";
import { UsersTable } from "../../../../../modules/users/components/users-table";
import { AppBarActionLink, AppBarActions } from "@/shared/components/app-bar-actions";

export default function UsersListPage() {
  const {
    data = [],

    isLoading,

    error,
  } = useQuery({
    queryKey: ["users"],

    queryFn: getUsers,
  });

  if (isLoading) {
    return <p>Cargando usuarios...</p>;
  }

  if (error) {
    return <p>Error cargando usuarios</p>;
  }

  return (
    <div className="space-y-4 max-w-[900px] mx-auto">
      <AppBarActions>
        <AppBarActionLink href="/dashboard/users/new" label="Nuevo usuario">
          <Plus size={20} />
        </AppBarActionLink>
      </AppBarActions>

      <UsersTable data={data} />
    </div>
  );
}

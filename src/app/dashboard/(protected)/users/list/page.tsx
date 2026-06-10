"use client";

import { useQuery } from "@tanstack/react-query";

import { getUsers } from "@/modules/users/services/get-users";
import { UsersTable } from "../../../../../modules/users/components/users-table";
import Link from "next/link";

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Usuarios</h1>

        <Link
          href="/dashboard/users/new"
          className="
      bg-blue-600
      hover:bg-blue-700
      text-white
      px-4
      py-2
      rounded-lg
      font-medium
    "
        >
          + Nuevo usuario
        </Link>
      </div>

      <UsersTable data={data} />
    </div>
  );
}

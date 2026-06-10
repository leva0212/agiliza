"use client";

import { User } from "@/modules/users/types/user";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";

import { toggleUserActive } from "../api/toggle-user-active";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UiMessage } from "@/shared/components/ui-message";
import Tooltip from "@mui/material/Tooltip";
import { getLastPassword } from "@/modules/users/api/get-last-password";
import { resetUserPassword } from "@/modules/users/api/reset-user-password";
import {
  getRoleLabel,
} from "@/modules/users/utils/get-role-label";
type Props = {
  data: User[];
};

export function UsersTable({ data }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [passwordText, setPasswordText] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(false);

  const [messageOpen, setMessageOpen] = useState(false);

  const [messageTitle, setMessageTitle] = useState("");

  const [messageText, setMessageText] = useState("");

  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | "info" | "question"
  >("info");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copySuccessOpen, setCopySuccessOpen] = useState(false);
  /*
const [
  passwordModalOpen,
  setPasswordModalOpen,
] = useState(false);

const [
  selectedUser,
  setSelectedUser,
] = useState<User | null>(
  null,
);*/

  async function copyPassword() {
    await navigator.clipboard.writeText(generatedPassword);

    setCopySuccessOpen(true);
  }

  async function handleResetPassword(user: User) {
    try {
      const result = await resetUserPassword(user.id);

      setSelectedUser(user);

      setGeneratedPassword(result.temporaryPassword);

      setPasswordModalOpen(true);
    } catch (error: any) {
      setMessageTitle("Error");

      setMessageText(error.message);

      setMessageType("error");

      setMessageOpen(true);
    }
  }
  async function showLastPassword(profileId: string) {
    try {
      const result = await getLastPassword(profileId);

      setPasswordText(
        result.temporaryPassword ?? "Sin contraseña temporal registrada",
      );

      setPasswordModalOpen(true);
    } catch (error: any) {
      setMessageTitle("Error");

      setMessageText(error.message);

      setMessageType("error");

      setMessageOpen(true);
    }
  }
  function askToggleUser(user: User) {
    setSelectedUser(user);

    setDialogOpen(true);
  }
  async function confirmToggleUser() {
    if (!selectedUser) {
      return;
    }

    try {
      setLoading(true);

      await toggleUserActive(
        selectedUser.id,

        !selectedUser.active,
      );

      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      setDialogOpen(false);

      setMessageTitle("Correcto");

      setMessageText(
        selectedUser.active ? "Usuario desactivado" : "Usuario activado",
      );

      setMessageType("success");

      setMessageOpen(true);
    } catch (error: any) {
      setMessageTitle("Error");

      setMessageText(error.message);

      setMessageType("error");

      setMessageOpen(true);
    } finally {
      setLoading(false);
    }
  }
  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "full_name",

        header: "Nombre",
      },

      {
        accessorKey: "email",

        header: "Correo",
      },

      {
        accessorFn: (row) => row.company?.name ?? "",

        id: "company",

        header: "Empresa",
      },

      {
  accessorFn: (row) =>
    getRoleLabel(
      row.role,
    ),

  id: "role",

  header: "Rol",
},

      {
        accessorKey: "phone",

        header: "Teléfono",
      },

      {
        accessorKey: "active",

        header: "Activo",

        Cell: ({ cell }) => (cell.getValue<boolean>() ? "Sí" : "No"),
      },

      {
        accessorKey: "actions",

        header: "Acciones",

        Cell: ({ row }) => (
          <div className="flex gap-2">
            <Tooltip title="Editar usuario">
              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/users/edit/${row.original.id}`)
                }
                className="
        px-2
        py-1
        rounded
        bg-blue-600
        text-white
      "
              >
                ✏️
              </button>
            </Tooltip>

            <Tooltip
              title={
                row.original.active ? "Desactivar usuario" : "Activar usuario"
              }
            >
              <button
                type="button"
                onClick={() => askToggleUser(row.original)}
                className={
                  row.original.active
                    ? "px-2 py-1 rounded bg-red-600 text-white"
                    : "px-2 py-1 rounded bg-green-600 text-white"
                }
              >
                {row.original.active ? "🔒" : "🔓"}
              </button>
            </Tooltip>
            <Tooltip
              title="
    Ver última contraseña temporal
  "
            >
              <button
                type="button"
                onClick={() => showLastPassword(row.original.id)}
                className="
      px-2
      py-1
      rounded
      bg-indigo-600
      text-white
    "
              >
                👁
              </button>
            </Tooltip>

            <Tooltip
              title="
    Generar nueva contraseña temporal
  "
            >
              <button
                type="button"
                onClick={() => handleResetPassword(row.original)}
                className="
      px-2
      py-1
      rounded
      bg-yellow-500
      text-white
    "
              >
                🔑
              </button>
            </Tooltip>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <>
      {" "}
      <MaterialReactTable columns={columns} data={data} />
      <UiMessage
        open={dialogOpen}
        title={selectedUser?.active ? "Desactivar usuario" : "Activar usuario"}
        message={
          <div className="space-y-2">
            <div>
              <strong>Nombre:</strong> {selectedUser?.full_name}
            </div>

            <div>
              <strong>Correo:</strong> {selectedUser?.email ?? "No registrado"}
            </div>

            <div>
              <strong>Rol:</strong> {selectedUser?.role}
            </div>

            <div>
              <strong>Empresa:</strong>{" "}
              {selectedUser?.company?.name ?? "Sin empresa"}
            </div>

            <div className="pt-3 font-medium">
              {selectedUser?.active
                ? "¿Desea desactivar este usuario?"
                : "¿Desea activar este usuario?"}
            </div>
          </div>
        }
        type="question"
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmToggleUser}
      />
      <UiMessage
        open={messageOpen}
        title={messageTitle}
        message={messageText}
        type={messageType}
        onClose={() => setMessageOpen(false)}
      />
      <UiMessage
        open={passwordModalOpen}
        title="
    Última contraseña temporal
  "
        message={
          <div>
            <div>
              <strong>Contraseña:</strong>
            </div>

            <div
              className="
        mt-2
        text-lg
        font-mono
      "
            >
              {passwordText}
            </div>
          </div>
        }
        type="info"
        onClose={() => setPasswordModalOpen(false)}
      />
      <UiMessage
        open={passwordModalOpen}
        title="
    Contraseña temporal generada
  "
        message={
          <div className="space-y-3">
            <div>
              <strong>Usuario:</strong> {selectedUser?.full_name}
            </div>

            <div>
              <strong>Correo:</strong> {selectedUser?.email}
            </div>

            <div>
              <strong>Contraseña:</strong>
            </div>

            <div
              className="
          text-lg
          font-mono
          bg-gray-100
          p-3
          rounded
        "
            >
              {generatedPassword}
            </div>
            <button
              type="button"
              onClick={copyPassword}
              className="
    px-3
    py-2
    rounded
    bg-blue-600
    text-white
  "
            >
              Copiar
            </button>
          </div>
        }
        type="info"
        onClose={() => setPasswordModalOpen(false)}
      />

      <UiMessage

  open={
    copySuccessOpen
  }

  title="
    Copiado
  "

  message="
    Contraseña copiada al portapapeles.
  "

  type="success"

  onClose={() =>
    setCopySuccessOpen(
      false,
    )
  }

/>
    </>
  );
}

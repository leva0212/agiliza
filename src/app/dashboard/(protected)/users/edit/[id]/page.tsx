"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import { useRouter } from "next/navigation";

import { getUser } from "@/modules/users/api/get-user";

import { updateUser } from "@/modules/users/api/update-user";

import { getCompaniesOptions } from "@/modules/companies/api/get-companies-options";

import { UiMessage } from "@/shared/components/ui-message";
import { READ_ONLY_INPUT_CLASS } from "@/shared/constants/ui";
import { useQueryClient } from "@tanstack/react-query";
import { getPermissions } from "@/modules/permissions/api/get-permissions";

import { getProfilePermissions } from "@/modules/permissions/api/get-profile-permissions";

import { saveProfilePermissions } from "@/modules/permissions/api/save-profile-permissions";
export default function EditUserPage() {
  const params = useParams();
  const queryClient = useQueryClient();

  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);

  const [companies, setCompanies] = useState<any[]>([]);

  const [fullName, setFullName] = useState("");

  const [phone, setPhone] = useState("");

  const [companyId, setCompanyId] = useState("");

  const [role, setRole] = useState("");

  const [active, setActive] = useState(true);
  const [canDeliver, setCanDeliver] = useState(false);

  const [email, setEmail] = useState("");

  const [messageOpen, setMessageOpen] = useState(false);

  const [messageTitle, setMessageTitle] = useState("");

  const [messageText, setMessageText] = useState("");

  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");
  const [permissions, setPermissions] = useState<any[]>([]);

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  useEffect(() => {
    async function load() {
      try {
        const [user, companiesData, permissionsData, profilePermissionsData] =
          await Promise.all([
            getUser(id),

            getCompaniesOptions(),

            getPermissions(),

            getProfilePermissions(id),
          ]);

        setCompanies(companiesData);

        setEmail(user.email ?? "");

        setFullName(user.full_name ?? "");

        setPhone(user.phone ?? "");

        setCompanyId(user.company_id ?? "");

        setRole(user.role ?? "");

        setActive(user.active);
        setCanDeliver(user.can_deliver ?? false);
        setPermissions(permissionsData);

        setSelectedPermissions(profilePermissionsData);
      } catch (error: any) {
        setMessageTitle("Error");

        setMessageText(error.message);

        setMessageType("error");

        setMessageOpen(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  async function handleSave() {
    try {
      await updateUser({
        id,

        company_id: companyId,

        full_name: fullName,

        phone,

        role,

        active,

        can_deliver: canDeliver,
      });
      await saveProfilePermissions(
        id,

        selectedPermissions,
      );

      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      setMessageTitle("Correcto");

      setMessageText("Usuario actualizado.");

      setMessageType("success");

      setMessageOpen(true);
    } catch (error: any) {
      setMessageTitle("Error");

      setMessageText(error.message);

      setMessageType("error");

      setMessageOpen(true);
    }
  }

  function togglePermission(permissionId: string) {
    setSelectedPermissions((previous) =>
      previous.includes(permissionId)
        ? previous.filter((x) => x !== permissionId)
        : [...previous, permissionId],
    );
  }

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 max-w-[400px] border p-6 rounded-xl">
      <h1 className="text-2xl font-bold">Editar usuario</h1>

      <div>
        <label className="block mb-1 font-medium">Correo electrónico</label>

        <input disabled value={email} className={READ_ONLY_INPUT_CLASS} />
      </div>

      <div>
        <label className="block mb-1 font-medium">Empresa</label>

        <input
          disabled
          value={
            companies.find((company) => company.id === companyId)?.name ?? ""
          }
          className={READ_ONLY_INPUT_CLASS}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Nombre completo</label>

        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="
      w-full
      border
      rounded-xl
      p-3
    "
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Teléfono</label>

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="
      w-full
      border
      rounded-xl
      p-3
    "
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Rol</label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="
      w-full
      border
      rounded-xl
      p-3
    "
        >
          <option value="super_admin">Administrador General</option>

          <option value="company_admin">Supervisor Empresa</option>

          <option value="courier">Mensajero</option>
          <option value="seller">Vendedor</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Estado</label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Usuario activo
        </label>
      </div>
      <div>
        <label className="block mb-1 font-medium">Entregas</label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={canDeliver}
            disabled={role === "courier"}
            onChange={(e) => setCanDeliver(e.target.checked)}
          />
          Puede realizar entregas
        </label>
      </div>
      <div>
        <label
          className="
    block
    mb-3
    font-medium
  "
        >
          Permisos específicos
        </label>

        <div
          className="
    border
    rounded-xl
    p-4
    space-y-2
    max-h-80
    overflow-auto
  "
        >
          {permissions.map((permission) => (
            <label
              key={permission.id}
              className="
            flex
            items-center
            gap-2
          "
            >
              <input
                type="checkbox"
                checked={selectedPermissions.includes(permission.id)}
                onChange={() => togglePermission(permission.id)}
              />

              <span>{permission.description}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-3 border rounded-xl"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-3 bg-blue-600 text-white rounded-xl"
        >
          Guardar
        </button>
      </div>

      <UiMessage
        open={messageOpen}
        title={messageTitle}
        message={messageText}
        type={messageType}
        onClose={() => {
          setMessageOpen(false);

          if (messageType === "success") {
            router.push("/dashboard/users/list");
          }
        }}
      />
    </div>
  );
}

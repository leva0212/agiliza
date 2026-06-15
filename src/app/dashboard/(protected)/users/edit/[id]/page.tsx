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
import { propagateCourierRates } from "@/modules/courier-rates/api/propagate-courier-rates";

import { saveProfilePermissions } from "@/modules/permissions/api/save-profile-permissions";
import { getRoutesOptions } from "@/modules/routes/api/get-routes-options";

import { getCourierIdByProfileId } from "@/modules/couriers/api/get-courier-id-by-profile-id";

import { getSelectedRouteIds } from "@/modules/courier-routes/api/get-selected-route-ids";
import { RouteSearchDialog } from "@/modules/courier-routes/components/route-search-dialog";

import { CourierRoutesTable } from "@/modules/courier-routes/components/courier-routes-table";

import type { RouteOption } from "@/modules/routes/types/route-option";
import { saveCourierRoutes } from "@/modules/courier-routes/api/save-courier-routes";
export default function EditUserPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const [initialFormState, setInitialFormState] = useState("");
  const [routes, setRoutes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedRoutes, setSelectedRoutes] = useState<RouteOption[]>([]);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);

  const [courierId, setCourierId] = useState<string | null>(null);
  const router = useRouter();
  const [propagateOpen, setPropagateOpen] = useState(false);

  const [propagating, setPropagating] = useState(false);
  const id = params.id as string;

  const [loading, setLoading] = useState(true);

  const [companies, setCompanies] = useState<any[]>([]);

  const [fullName, setFullName] = useState("");

  const [phone, setPhone] = useState("");

  const [companyId, setCompanyId] = useState("");

  const [role, setRole] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [unlinkRouteOpen, setUnlinkRouteOpen] = useState(false);

  const [routeToUnlink, setRouteToUnlink] = useState<RouteOption | null>(null);
  const [active, setActive] = useState(true);
  const [canDeliver, setCanDeliver] = useState(false);
  const [deliveryPay, setDeliveryPay] = useState("0");

  const [failedPay, setFailedPay] = useState("0");

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
    if (!initialFormState) {
      return;
    }

    setHasUnsavedChanges(buildFormState() !== initialFormState);
  }, [
    fullName,

    phone,

    companyId,

    role,

    active,

    canDeliver,

    deliveryPay,

    failedPay,

    selectedPermissions,

    selectedRoutes,

    initialFormState,
  ]);
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();

      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  function buildFormState() {
    return JSON.stringify({
      fullName,

      phone,

      companyId,

      role,

      active,

      canDeliver,

      deliveryPay,

      failedPay,

      selectedPermissions: [...selectedPermissions].sort(),

      selectedRoutes: selectedRoutes

        .map((route) => route.id)

        .sort(),
    });
  }

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

        setDeliveryPay(String(user.delivery_pay ?? 0));

        setFailedPay(String(user.failed_pay ?? 0));

        setPermissions(permissionsData);

        setSelectedPermissions(profilePermissionsData);

        const routesData = await getRoutesOptions();

        setRoutes(routesData);

        const courierIdValue = await getCourierIdByProfileId(id);

        setCourierId(courierIdValue);

        let routeIds: string[] = [];

        if (courierIdValue) {
          routeIds = await getSelectedRouteIds(courierIdValue);

          setSelectedRoutes(
            routesData.filter((route) => routeIds.includes(route.id)),
          );
        } else {
          setSelectedRoutes([]);
        }

        setInitialFormState(
          JSON.stringify({
            fullName: user.full_name ?? "",

            phone: user.phone ?? "",

            companyId: user.company_id ?? "",

            role: user.role ?? "",

            active: user.active,

            canDeliver: user.can_deliver ?? false,

            deliveryPay: String(user.delivery_pay ?? 0),

            failedPay: String(user.failed_pay ?? 0),

            selectedPermissions: [...profilePermissionsData].sort(),

            selectedRoutes: [...routeIds].sort(),
          }),
        );
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
      setSaving(true);
      await updateUser({
        id,

        company_id: companyId,

        full_name: fullName,

        phone,

        role,

        active,

        can_deliver: canDeliver,

        delivery_pay: Number(deliveryPay),

        failed_pay: Number(failedPay),
      });
      await saveProfilePermissions(
        id,

        selectedPermissions,
      );
      if (courierId) {
        await saveCourierRoutes(
          courierId,

          selectedRoutes.map((route) => route.id),
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      setMessageTitle("Correcto");

      setMessageText("Usuario actualizado.");

      setMessageType("success");

      setMessageOpen(true);

      setHasUnsavedChanges(false);
    } catch (error: any) {
      setMessageTitle("Error");

      setMessageText(error.message);

      setMessageType("error");

      setMessageOpen(true);
    } finally {
      setSaving(false);
    }
  }

  function togglePermission(permissionId: string) {
    setSelectedPermissions((previous) =>
      previous.includes(permissionId)
        ? previous.filter((x) => x !== permissionId)
        : [...previous, permissionId],
    );
    //setHasUnsavedChanges(true);
  }

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 border p-4 sm:p-6 rounded-xl">
      {/*<div className="max-w-2xl mx-auto space-y-4 max-w-[800px] border p-6 rounded-xl">*/}
      <h1 className="text-2xl font-bold">Editar usuario</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            onChange={(e) => {
              setFullName(e.target.value);

              //setHasUnsavedChanges(true);
            }}
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
            onChange={(e) => {
              setPhone(e.target.value);

              //setHasUnsavedChanges(true);
            }}
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
            onChange={(e) => {
              setRole(e.target.value);

              //setHasUnsavedChanges(true);
            }}
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
              onChange={(e) => {
                setActive(e.target.checked);

                //setHasUnsavedChanges(true);
              }}
            />
            Usuario activo
          </label>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={canDeliver}
            disabled={role === "courier"}
            onChange={(e) => {
              setCanDeliver(e.target.checked);

              //setHasUnsavedChanges(true);
            }}
          />
          Puede realizar entregas
        </label>

        {canDeliver && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div
              className="
    w-full
    min-w-[500px]
    border
    rounded-xl
    p-4
    space-y-2
    flex
    flex-col
    items-center
  "
            >
              <h3
                className="
        font-semibold
      "
              >
                Pagos por mensajería
              </h3>

              <div>
                <label
                  className="
          block
          mb-1
          font-medium
        "
                >
                  Pago entrega
                </label>

                <input
                  type="number"
                  min="0"
                  value={deliveryPay}
                  onChange={(e) => {
                    setDeliveryPay(e.target.value);

                    //setHasUnsavedChanges(true);
                  }}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  className="
          w-full
          border
          rounded-xl
          p-3
        "
                />
              </div>

              <div>
                <label
                  className="
          block
          mb-1
          font-medium
        "
                >
                  Pago intento fallido
                </label>

                <input
                  type="number"
                  min="0"
                  value={failedPay}
                  onChange={(e) => {
                    setFailedPay(e.target.value);

                    //setHasUnsavedChanges(true);
                  }}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  className="
          w-full
          border
          rounded-xl
          p-3
        "
                />
              </div>
              {canDeliver && (
                <button
                  type="button"
                  disabled={propagating || hasUnsavedChanges}
                  title={
                    hasUnsavedChanges
                      ? "Guarda los cambios para poder propagar tarifas a las rutas de este mensajero."
                      : "Propagar cambios a todas las rutas asignadas a este mensajero."
                  }
                  onClick={() => setPropagateOpen(true)}
                  className={`
    px-4
    py-3
    rounded-lg
    font-medium
    transition

    ${
      hasUnsavedChanges
        ? `
          bg-amber-100
          text-amber-800
          border
          border-amber-300
          cursor-not-allowed
        `
        : `
          bg-violet-600
          text-white
          hover:bg-violet-700
        `
    }

    ${propagating ? "opacity-70" : ""}
  `}
                >
                  {propagating
                    ? "Propagando..."
                    : hasUnsavedChanges
                      ? "Guardar cambios primero"
                      : "Propagar pagos"}
                </button>
              )}

              {canDeliver && (
                <div
                  className="
      border
      rounded-xl
      p-4
      space-y-4
      w-full
    "
                >
                  <div
                    className="
        flex
        justify-between
        items-center
      "
                  >
                    <h3
                      className="
          text-lg
          font-semibold
        "
                    >
                      Rutas asignadas
                    </h3>

                    <button
                      type="button"
                      onClick={() => setRouteDialogOpen(true)}
                      className="
          bg-blue-600
          text-white
          px-4
          py-2
          rounded-lg
        "
                    >
                      Agregar ruta
                    </button>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <CourierRoutesTable
                      data={selectedRoutes}
                      onDelete={(routeId) => {
                        const route = selectedRoutes.find(
                          (r) => r.id === routeId,
                        );

                        if (!route) {
                          return;
                        }

                        setRouteToUnlink(route);

                        setUnlinkRouteOpen(true);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button
          type="button"
          disabled={saving || propagating}
          onClick={() => {
            if (hasUnsavedChanges) {
              setExitConfirmOpen(true);

              return;
            }

            router.back();
          }}
          className={`
    px-4
    py-3
    border
    rounded-xl
    transition

    ${
      saving || propagating
        ? `
          opacity-50
          cursor-not-allowed
        `
        : ""
    }
  `}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasUnsavedChanges}
          title={
            !hasUnsavedChanges
              ? "No hay cambios pendientes de guardar."
              : "Guardar cambios."
          }
          className={`
    px-4
    py-3
    rounded-xl
    font-medium
    transition

    ${
      !hasUnsavedChanges
        ? `
          bg-gray-100
          text-gray-500
          border
          border-gray-300
          cursor-not-allowed
        `
        : saving
          ? `
            bg-blue-400
            text-white
            cursor-not-allowed
          `
          : `
            bg-blue-600
            text-white
            hover:bg-blue-700
          `
    }
  `}
        >
          {saving
            ? "Guardando..."
            : !hasUnsavedChanges
              ? "Sin cambios"
              : "Guardar"}
        </button>
      </div>
      <UiMessage
        open={propagateOpen}
        type="question"
        title="
    Propagar pagos
  "
        message={
          <>
            <p>
              ¿Desea guardar la configuración actual y propagarla a todas las
              rutas?
            </p>

            <br />

            <p>
              Se crearán o actualizarán únicamente los pagos de nivel
              <strong> Toda la ruta</strong>.
            </p>

            <br />

            <p>
              Los pagos específicos por provincia, cantón, distrito o barrio no
              serán modificados.
            </p>
          </>
        }
        confirmText="
    Propagar
  "
        cancelText="
    Cancelar
  "
        onClose={() => setPropagateOpen(false)}
        onConfirm={async () => {
          setPropagateOpen(false);

          setPropagating(true);

          try {
            await updateUser({
              id,

              company_id: companyId,

              full_name: fullName,

              phone,

              role,

              active,

              can_deliver: canDeliver,

              delivery_pay: Number(deliveryPay),

              failed_pay: Number(failedPay),
            });

            await propagateCourierRates({
              profileId: id,

              deliveryPay: Number(deliveryPay),

              failedPay: Number(failedPay),
            });

            await queryClient.invalidateQueries({
              queryKey: ["users"],
            });

            setMessageTitle("Configuración propagada");

            setMessageText(
              "El usuario fue actualizado y los pagos fueron propagados correctamente.",
            );

            setMessageType("success");

            setMessageOpen(true);
          } catch (error) {
            console.error(error);

            setMessageTitle("Error");

            setMessageText("No fue posible propagar los pagos.");

            setMessageType("error");

            setMessageOpen(true);
          } finally {
            setPropagating(false);
          }
        }}
      />
      <RouteSearchDialog
        open={routeDialogOpen}
        onClose={() => setRouteDialogOpen(false)}
        onSelect={(route) => {
          if (selectedRoutes.some((x) => x.id === route.id)) {
            return;
          }

          setSelectedRoutes((previous) => [...previous, route]);

          //setHasUnsavedChanges(true);
        }}
      />
      <UiMessage
        open={exitConfirmOpen}
        type="question"
        title="
    Cambios sin guardar
  "
        message={
          <>
            <p>Existen cambios pendientes de guardar.</p>

            <br />

            <p>¿Desea salir sin guardar?</p>
          </>
        }
        confirmText="
    Salir sin guardar
  "
        cancelText="
    Continuar editando
  "
        onClose={() => setExitConfirmOpen(false)}
        onConfirm={() => {
          setExitConfirmOpen(false);

          router.back();
        }}
      />
      <UiMessage
        open={unlinkRouteOpen}
        type="question"
        title="
    Desvincular ruta
  "
        message={
          <>
            <p>¿Está seguro de que desea desvincular la ruta:</p>

            <br />

            <p>
              <strong>{routeToUnlink?.name}</strong>
            </p>

            <br />

            <p>del mensajero:</p>

            <br />

            <p>
              <strong>{fullName}</strong>
            </p>

            <br />

            <p>La modificación se aplicará cuando guarde los cambios.</p>
          </>
        }
        confirmText="
    Desvincular
  "
        cancelText="
    Cancelar
  "
        onClose={() => {
          setUnlinkRouteOpen(false);

          setRouteToUnlink(null);
        }}
        onConfirm={() => {
          if (!routeToUnlink) {
            return;
          }

          setSelectedRoutes((previous) =>
            previous.filter((route) => route.id !== routeToUnlink.id),
          );

          //setHasUnsavedChanges(true);

          setRouteToUnlink(null);

          setUnlinkRouteOpen(false);
        }}
      />
      <UiMessage
        open={messageOpen}
        title={messageTitle}
        message={messageText}
        type={messageType}
        onClose={() => {
          setMessageOpen(false);
        }}
      />
    </div>
  );
}

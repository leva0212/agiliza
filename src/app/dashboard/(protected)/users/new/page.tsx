"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { createUser } from "@/modules/users/api/create-user";

import { getCompaniesOptions } from "@/modules/companies/api/get-companies-options";

import { UiMessage } from "@/shared/components/ui-message";
import { getRoleLabel } from "@/modules/users/utils/get-role-label";

export default function NewUserPage() {
  const router = useRouter();

  const [companies, setCompanies] = useState<any[]>([]);

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [companyId, setCompanyId] = useState("");

  const [role, setRole] = useState("company_admin");

  const [canDeliver, setCanDeliver] = useState(false);
  const [deliveryPay, setDeliveryPay] = useState("0");

  const [failedPay, setFailedPay] = useState("0");
  const selectedCompany = companies.find((company) => company.id === companyId);

  const isSystemCompany = selectedCompany?.is_system_company === true;
 

  const [loading, setLoading] = useState(false);

  const [messageOpen, setMessageOpen] = useState(false);

  const [messageTitle, setMessageTitle] = useState("");

  const [messageText, setMessageText] = useState("");

  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  useEffect(() => {
    async function load() {
      try {
        const data = await getCompaniesOptions();

        setCompanies(data);
      } catch {
        setMessageTitle("Error");

        setMessageText("No fue posible cargar empresas.");

        setMessageType("error");

        setMessageOpen(true);
      }
    }

    load();
  }, []);

  async function handleSave() {
    try {
      setLoading(true);

      const result = await createUser({
        email,

        full_name: fullName,

        phone,

        company_id: companyId,

        role: role as "super_admin" | "company_admin" | "courier",

        can_deliver: canDeliver,

        delivery_pay: Number(deliveryPay),

        failed_pay: Number(failedPay),
      });

      setMessageTitle("Usuario creado");

      setMessageText(`Contraseña temporal: ${result.temporaryPassword}`);

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

  return (
    <div className="max-w-2xl mx-auto max-w-[400px] border p-6 rounded-xl space-y-6">
      <h1 className="text-2xl font-bold">Nuevo usuario</h1>

      <div className="space-y-4">
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nombre completo"
          className="w-full border rounded-xl p-3"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo"
          className="w-full border rounded-xl p-3"
        />

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Teléfono"
          className="w-full border rounded-xl p-3"
        />

        <select
          value={companyId}
          onChange={(e) => {
            const value = e.target.value;

            setCompanyId(value);

            const company = companies.find((c) => c.id === value);

            if (
              !company?.is_system_company &&
              (role === "courier" || role === "super_admin")
            ) {
              setRole("company_admin");

              setCanDeliver(false);
            }
          }}
          className="w-full border rounded-xl p-3"
        >
          <option value="" disabled>
            Seleccione empresa
          </option>

          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>

        <select
          value={role}
          disabled={!companyId}
          onChange={(e) => {
            const value = e.target.value;

            if (value === "courier" && !isSystemCompany) {
              return;
            }

            setRole(value);

            if (value === "courier") {
              setCanDeliver(true);
            } else {
              setCanDeliver(false);
            }
          }}
          className="w-full border rounded-xl p-3"
        >
          {isSystemCompany && (
            <option value="super_admin">{getRoleLabel("super_admin")}</option>
          )}

          <option value="company_admin">{getRoleLabel("company_admin")}</option>

          <option value="seller">{getRoleLabel("seller")}</option>

          {isSystemCompany && (
            <option value="courier">{getRoleLabel("courier")}</option>
          )}
        </select>

        {isSystemCompany && (
          <label className="flex items-center gap-3 border rounded-xl p-3">
            <input
              type="checkbox"
              checked={canDeliver}
              disabled={role === "courier"}
              onChange={(e) => setCanDeliver(e.target.checked)}
            />

            <span>Puede realizar entregas</span>
          </label>
        )}

        {isSystemCompany && canDeliver && (
          <div
            className="
        border
        rounded-xl
        p-4
        space-y-4
      "
          >
            <h3
              className="
          font-semibold
        "
            >
              Pagos mensajero
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
                onChange={(e) => setDeliveryPay(e.target.value)}
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
                onChange={(e) => setFailedPay(e.target.value)}
                className="
            w-full
            border
            rounded-xl
            p-3
          "
              />
            </div>
          </div>
        )}
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
          disabled={loading}
          className="px-4 py-3 bg-blue-600 text-white rounded-xl"
        >
          {loading ? "Guardando..." : "Guardar"}
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

"use client";

import { useEffect, useState } from "react";

import { getContactMethods } from "@/modules/contacts/api/get-contact-methods";

import { createContactMethod } from "@/modules/contacts/api/create-contact-method";

import { deleteContactMethod } from "@/modules/contacts/api/delete-contact-method";

import type { ContactMethod } from "@/modules/contacts/types/contact-method";

type Props = {
  contactId: string;
};

export function ContactMethodsEditor({ contactId }: Props) {
  const [methods, setMethods] = useState<ContactMethod[]>([]);

  const [loading, setLoading] = useState(false);

  const [methodType, setMethodType] = useState("phone");

  const [labelx, setLabelx] = useState("");

  const [value, setValue] = useState("");

  const [label, setLabel] = useState("");

  const [customLabel, setCustomLabel] = useState("");

  const finalLabel = label === "__custom__" ? customLabel : label;

  async function loadMethods() {
    if (!contactId) {
      return;
    }

    setLoading(true);

    try {
      const data = await getContactMethods(contactId);

      setMethods(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMethods();
  }, [contactId]);

  async function handleAdd() {
    if (!value.trim()) {
      return;
    }

    await createContactMethod({
      contactId,

      methodType,

      label: finalLabel,

      value,

      isPrimary: false,
    });

    setLabelx("");

    setValue("");

    await loadMethods();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar método de contacto?")) {
      return;
    }

    await deleteContactMethod(id);

    await loadMethods();
  }

  return (
    <div className="border rounded-lg p-4 mt-6">
      <h3 className="font-semibold text-lg mb-4">Métodos de contacto</h3>

      <div  className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={methodType}
          onChange={(e) => setMethodType(e.target.value)}
          className="border rounded-lg p-3 max-w-[120px]"
        >
          <option value="phone">Teléfono</option>

          <option value="email">Correo</option>
        </select>

        <select
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="border rounded-lg p-3 max-w-[120px]"
        >
          {methodType === "phone" ? (
            <>
              <option value="">Seleccione</option>

              <option value="Oficina">Oficina</option>

              <option value="Móvil">Móvil</option>

              <option value="Ventas">Ventas</option>

              <option value="Cobros">Cobros</option>

              <option value="Soporte">Soporte</option>

              <option value="Gerencia">Gerencia</option>

              <option value="__custom__">Otro...</option>
            </>
          ) : (
            <>
              <option value="">Seleccione</option>

              <option value="Facturación">Facturación</option>

              <option value="Ventas">Ventas</option>

              <option value="Compras">Compras</option>

              <option value="Cobros">Cobros</option>

              <option value="Soporte">Soporte</option>

              <option value="Personal">Personal</option>

              <option value="__custom__">Otro...</option>
            </>
          )}
        </select>
        {label === "__custom__" && (
          <input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Etiqueta personalizada"
            className="border rounded-lg p-3"
          />
        )}

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Valor"
          className="border rounded-lg p-3 min-w-[250px]"
        />

        <button
          type="button"
          onClick={handleAdd}
          className="bg-blue-600 text-white rounded-lg px-1 py-1 max-w-[100px] w-full"
        >
          Agregar
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Tipo</th>

              <th className="border p-2">Etiqueta</th>

              <th className="border p-2">Valor</th>

              <th className="border p-2">Acción</th>
            </tr>
          </thead>

          <tbody>
            {methods.map((method) => (
              <tr key={method.id}>
                <td className="border p-2">
                  {method.method_type === "phone" ? "Teléfono" : "Correo"}
                </td>

                <td className="border p-2">{method.label}</td>

                <td className="border p-2">{method.value}</td>

                <td className="border p-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(method.id)}
                    className="text-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

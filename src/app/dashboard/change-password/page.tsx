"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { changePassword } from "@/modules/users/api/change-password";

import { UiMessage } from "@/shared/components/ui-message";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [messageOpen, setMessageOpen] = useState(false);

  const [messageTitle, setMessageTitle] = useState("");

  const [messageText, setMessageText] = useState("");

  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  async function handleSave() {
    if (password.length < 8) {
      setMessageTitle("Contraseña inválida");

      setMessageText("La contraseña debe tener al menos 8 caracteres.");

      setMessageType("warning");

      setMessageOpen(true);

      return;
    }

    if (password !== confirmPassword) {
      setMessageTitle("Contraseñas distintas");

      setMessageText("Las contraseñas no coinciden.");

      setMessageType("warning");

      setMessageOpen(true);

      return;
    }

    try {
      await changePassword(password);

      setMessageTitle("Contraseña actualizada");

      setMessageText("Su contraseña fue actualizada correctamente.");

      setMessageType("success");

      setMessageOpen(true);
    } catch (error: any) {
      setMessageTitle("Error");

      setMessageText(error.message);

      setMessageType("error");

      setMessageOpen(true);
    }
  }

  return (
    <div
      className="
      max-w-md
      mx-auto
      mt-12
      space-y-4
    "
    >
      <h1
        className="
        text-2xl
        font-bold
      "
      >
        Cambiar contraseña
      </h1>

      <p
        className="
        text-sm
        text-gray-600
      "
      >
        Debe cambiar la contraseña temporal antes de continuar.
      </p>

      <div>
        <label
          className="
          block
          mb-1
          font-medium
        "
        >
          Nueva contraseña
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          Confirmar contraseña
        </label>

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="
            w-full
            border
            rounded-xl
            p-3
          "
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="
          w-full
          bg-blue-600
          text-white
          py-3
          rounded-xl
        "
      >
        Guardar contraseña
      </button>

      <UiMessage
        open={messageOpen}
        title={messageTitle}
        message={messageText}
        type={messageType}
        onClose={() => {
          setMessageOpen(false);

          if (messageType === "success") {
            window.location.href = "/dashboard";

            /* router.push(
              "/dashboard",
            );*/
          }
        }}
      />
    </div>
  );
}

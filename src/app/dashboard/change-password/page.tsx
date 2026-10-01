"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { changePassword } from "@/modules/users/api/change-password";

import { UiMessage } from "@/shared/components/ui-message";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [messageOpen, setMessageOpen] = useState(false);

  const [messageTitle, setMessageTitle] = useState("");

  const [messageText, setMessageText] = useState("");

  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  async function handleSave() {
    if (password.length < 10) {
      setMessageTitle("Contraseña inválida");

      setMessageText("La contraseña debe tener al menos 10 caracteres.");

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
      await changePassword(password, confirmPassword);

      setMessageTitle("Contraseña actualizada");

      setMessageText("Su contraseña fue actualizada correctamente. Ahora deberá iniciar sesión con esta nueva contraseña.");

      setMessageType("success");

      setMessageOpen(true);
    } catch (error: any) {
      setMessageTitle("Error");

      setMessageText(error.message);

      setMessageType("error");

      setMessageOpen(true);
    }
  }

  async function returnToLogin() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
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

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-has-trailing-icon w-full rounded-xl border p-3"
          />
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:hover:text-white">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
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

        <div className="relative">
          <input
            type={showConfirmation ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-has-trailing-icon w-full rounded-xl border p-3"
          />
          <button type="button" onClick={() => setShowConfirmation((value) => !value)} aria-label={showConfirmation ? "Ocultar confirmación" : "Mostrar confirmación"} title={showConfirmation ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:hover:text-white">
            {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
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
            void returnToLogin();
          }
        }}
      />
    </div>
  );
}


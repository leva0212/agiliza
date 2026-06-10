"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UiMessage } from "@/shared/components/ui-message";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
//import { supabase } from "@/services/supabase/client";
import {
  createClient,
} from "@/lib/supabase/client";
export default function LoginPage() {
  const router = useRouter();
  const passwordRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [messageOpen, setMessageOpen] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  async function handleLogin() {
    const supabase =
  createClient();

  if (!email.trim()) {

    setMessageTitle(
      "Correo requerido",
    );

    setMessageText(
      "Ingrese su correo electrónico.",
    );

    setMessageType(
      "warning",
    );

    setMessageOpen(
      true,
    );

    return;
  }

  if (!password.trim()) {

    setMessageTitle(
      "Contraseña requerida",
    );

    setMessageText(
      "Ingrese su contraseña.",
    );

    setMessageType(
      "warning",
    );

    setMessageOpen(
      true,
    );

    return;
  }

  try {

    setLoading(
      true,
    );

  const {
  data,
  error,
} =
  await supabase.auth.signInWithPassword({
    email,
    password,
  });

console.log(
  "LOGIN DATA",
  data,
);

console.log(
  "LOGIN ERROR",
  error,
);

    if (error) {

      setMessageTitle(
        "Acceso denegado",
      );

      setMessageText(
        error.message,
      );

      setMessageType(
        "error",
      );

      setMessageOpen(
        true,
      );

      return;
    }

    setMessageTitle(
      "Bienvenido",
    );

    setMessageText(
      "Inicio de sesión exitoso.",
    );

    setMessageType(
      "success",
    );

    setMessageOpen(
      true,
    );
    if (error) {

  return;
}

window.location.href =
  "/dashboard/";
/*
    setTimeout(
      () => {

        router.push(
          "/dashboard/routes/list",
        );

      },
      500,
    );*/

  } catch {

    setMessageTitle(
      "Error",
    );

    setMessageText(
      "No fue posible iniciar sesión.",
    );

    setMessageType(
      "error",
    );

    setMessageOpen(
      true,
    );

  } finally {

    setLoading(
      false,
    );

  }

}

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              Portal administrativo
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Inicia sesión para continuar
            </p>
          </div>

          <div className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    passwordRef.current?.focus();
                  }
                }}
                className="w-full rounded-2xl bg-white/5 border border-white/10 pl-14 pr-4 py-4 text-white placeholder:text-slate-500 outline-none focus:border-blue-400"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                className="w-full rounded-2xl bg-white/5 border border-white/10 pl-14 pr-14 py-4 text-white placeholder:text-slate-500 outline-none focus:border-blue-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-2xl py-3 font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Ingresar"}
            </button>
          </div>
        </div>
      </div>

      <UiMessage
        open={messageOpen}
        title={messageTitle}
        message={messageText}
        type={messageType}
        onClose={() => setMessageOpen(false)}
      />
    </>
  );
}

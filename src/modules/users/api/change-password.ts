import { createClient } from "@/lib/supabase/client";

export async function changePassword(password: string, confirmPassword: string, currentPassword?: string) {
  const supabase = createClient();
  async function submit(accessToken?: string) {
    return fetch("/api/change-password", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ password, confirmPassword, currentPassword }),
    });
  }
  const { data: { session } } = await supabase.auth.getSession();
  let response = await submit(session?.access_token);
  // Retry only an authentication rejection, before any password mutation.
  if (response.status === 401) {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) response = await submit(data.session.access_token);
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? "No fue posible actualizar la contraseña.");
  return data;
}

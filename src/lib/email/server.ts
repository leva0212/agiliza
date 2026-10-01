import "server-only";

type MailInput = { to: string; subject: string; html: string; text: string };

/**
 * Mail is intentionally server-only. Configure RESEND_API_KEY and EMAIL_FROM before
 * enabling email verification or password recovery in production.
 */
export async function sendAccountEmail(input: MailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error("El correo de cuenta aún no está configurado.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: input.to, subject: input.subject, html: input.html, text: input.text }),
  });
  if (!response.ok) throw new Error("No fue posible enviar el correo de seguridad.");
}

export function getPublicAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

import "server-only";

import { createHash, randomBytes } from "crypto";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isEmailIdentifier, normalizeEmail, normalizeUsername } from "@/modules/auth/identity";

type ProfileIdentity = {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  company_id: string | null;
  recovery_email: string | null;
  recovery_email_verified_at: string | null;
  active: boolean;
};

export function createOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

export function hashOpaqueToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function resolveProfileIdentifier(identifier: string): Promise<ProfileIdentity | null> {
  const trimmed = identifier.trim();
  if (!trimmed) return null;

  const query = supabaseAdmin
    .from("profiles")
    .select("id,email,username,full_name,company_id,recovery_email,recovery_email_verified_at,active")
    .limit(1);

  const result = isEmailIdentifier(trimmed)
    ? await query
        .eq("recovery_email", normalizeEmail(trimmed))
        .not("recovery_email_verified_at", "is", null)
        .maybeSingle()
    : await query.eq("username", normalizeUsername(trimmed)).maybeSingle();

  if (result.error) throw result.error;
  return result.data as ProfileIdentity | null;
}

export async function getAuthorizedPasswordManager() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, active, can_reset_user_passwords, company:companies(is_owner_company,is_system_company)")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data?.active) return null;

  const company = Array.isArray(data.company) ? data.company[0] : data.company;
  if (!company || (company.is_owner_company !== true && company.is_system_company !== true)) return null;
  const { data: permission } = await supabaseAdmin.from("profile_permissions")
    .select("permission_id").eq("profile_id", user.id).eq("permission_id", "reset_passwords").maybeSingle();
  if (data.can_reset_user_passwords !== true && !permission) return null;
  return { userId: user.id };
}

export async function consumeRateLimit(action: string, subject: string, maxAttempts = 5, windowMinutes = 15) {
  const subjectHash = hashOpaqueToken(`${action}:${subject.toLowerCase()}`);
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();
  const { count, error } = await supabaseAdmin
    .from("account_security_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("action", action)
    .eq("subject_hash", subjectHash)
    .gte("created_at", since);
  if (error) throw error;
  if ((count ?? 0) >= maxAttempts) return false;
  const { error: insertError } = await supabaseAdmin
    .from("account_security_rate_limits")
    .insert({ action, subject_hash: subjectHash });
  if (insertError) throw insertError;
  return true;
}

export async function notifyPasswordManagers(title: string, body: string, data: Record<string, unknown>) {
  const { data: managers, error } = await supabaseAdmin
    .from("profiles")
    .select("id,company:companies(is_owner_company,is_system_company)")
    .eq("active", true)
    .eq("can_reset_user_passwords", true);
  if (error) throw error;

  const recipients = (managers ?? []).filter((manager) => {
    const company = Array.isArray(manager.company) ? manager.company[0] : manager.company;
    return company?.is_owner_company === true || company?.is_system_company === true;
  });
  if (!recipients.length) return;

  await supabaseAdmin.from("user_notifications").insert(
    recipients.map((manager) => ({ recipient_profile_id: manager.id, type: "password_reset_request", title, body, data })),
  );
}

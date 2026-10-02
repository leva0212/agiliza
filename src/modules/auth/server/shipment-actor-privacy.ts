import "server-only";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type ActorRole = "super_admin" | "company_admin" | "courier" | "seller" | string;

type ActorCompany = {
  id: string;
  code?: string | null;
  name: string;
  is_owner_company: boolean;
};

type ActorProfile = {
  id: string;
  full_name: string;
  role: ActorRole;
  company_id: string | null;
  company?: ActorCompany | ActorCompany[] | null;
};

export type ShipmentViewer = {
  id: string;
  companyId: string;
  isOwnerCompanyUser: boolean;
  isCourier: boolean;
};

type ShipmentAccess =
  | { allowed: true; viewer: ShipmentViewer }
  | { allowed: false; status: 401 | 403 | 404 };

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function agilizaRoleLabel(role: ActorRole) {
  switch (role) {
    case "super_admin":
      return "Administrativo Agiliza";
    case "company_admin":
      return "Operativo Agiliza";
    case "courier":
      return "Mensajero Agiliza";
    case "seller":
      return "Personal Agiliza";
    default:
      return "Personal Agiliza";
  }
}

export async function authorizeShipmentAccess(
  shipmentId: string,
): Promise<ShipmentAccess> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { allowed: false, status: 401 };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, company_id, role, active, company:companies(is_owner_company)")
    .eq("id", user.id)
    .maybeSingle();

  const company = firstRelation(
    profile?.company as { is_owner_company: boolean } | { is_owner_company: boolean }[] | null,
  );

  if (!profile?.active || !profile.company_id) {
    return { allowed: false, status: 403 };
  }

  const { data: shipment } = await supabaseAdmin
    .from("shipments")
    .select("id, company_id")
    .eq("id", shipmentId)
    .maybeSingle();

  if (!shipment) return { allowed: false, status: 404 };

  const isOwnerCompanyUser = company?.is_owner_company === true;
  if (!isOwnerCompanyUser && shipment.company_id !== profile.company_id) {
    return { allowed: false, status: 403 };
  }

  return {
    allowed: true,
    viewer: {
      id: profile.id,
      companyId: profile.company_id,
      isOwnerCompanyUser,
      isCourier: profile.role === "courier",
    },
  };
}

export function sanitizeActor(
  viewer: ShipmentViewer,
  value: ActorProfile | ActorProfile[] | null | undefined,
) {
  const actor = firstRelation(value);
  if (!actor) return null;

  const company = firstRelation(actor.company);
  let displayName: string;

  if (viewer.isOwnerCompanyUser || actor.company_id === viewer.companyId) {
    displayName = actor.full_name;
  } else if (company?.is_owner_company) {
    displayName = agilizaRoleLabel(actor.role);
  } else {
    displayName = "Usuario externo";
  }

  const visibleCompany = company ? {
    id: company.id,
    code: company.code ?? null,
    name: viewer.isCourier ? null : company.name,
    is_owner_company: company.is_owner_company,
  } : null;

  return {
    id: actor.id,
    full_name: displayName,
    company_id: actor.company_id,
    company: visibleCompany,
  };
}

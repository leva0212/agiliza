import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ message: "No autorizado" }, { status: 401 });
    }

    const { data: currentProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("active, company_id")
      .eq("id", user.id)
      .single();

    if (profileError || !currentProfile?.active) {
      return Response.json(
        { message: "El usuario no está habilitado" },
        { status: 403 },
      );
    }

    const { data: systemCompanies, error: companiesError } = await supabaseAdmin
      .from("companies")
      .select("id")
      .or("is_owner_company.eq.true,is_system_company.eq.true");

    if (companiesError) {
      return Response.json({ message: companiesError.message }, { status: 400 });
    }

    const companyIds = (systemCompanies ?? []).map((company) => company.id);

    if (
      companyIds.length === 0 ||
      !currentProfile.company_id ||
      !companyIds.includes(currentProfile.company_id)
    ) {
      return Response.json(
        { message: "Solo la empresa del sistema puede confirmar entregas" },
        { status: 403 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("couriers")
      .select(`
        id,
        profile_id,
        profile:profiles!inner(
          id,
          full_name,
          company_id,
          active,
          can_deliver
        )
      `)
      .eq("active", true)
      .in("profile.company_id", companyIds)
      .eq("profile.active", true)
      .eq("profile.can_deliver", true);

    if (error) {
      return Response.json({ message: error.message }, { status: 400 });
    }

    const couriers = (data ?? [])
      .map((courier) => {
        const profile = Array.isArray(courier.profile)
          ? courier.profile[0]
          : courier.profile;

        if (!profile) {
          return null;
        }

        return {
          id: courier.id,
          profile_id: courier.profile_id,
          full_name: profile.full_name,
        };
      })
      .filter((courier): courier is NonNullable<typeof courier> => courier !== null)
      .sort((first, second) =>
        first.full_name.localeCompare(second.full_name, "es"),
      );

    return Response.json({ data: couriers });
  } catch (error) {
    return Response.json({ message: String(error) }, { status: 500 });
  }
}

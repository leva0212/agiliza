import { createClient } from "@/lib/supabase/client";

type CourierProfile = { full_name: string; active: boolean | null; can_deliver: boolean };
type AssignedCourier = { id: string; active: boolean; profile: CourierProfile | CourierProfile[] | null };
type RouteWithCouriers = {
  id: string;
  name: string;
  estimated_hours: number;
  active: boolean;
  courier_routes: { courier: AssignedCourier | AssignedCourier[] | null }[];
};

type Params = {
  pageIndex: number;

  pageSize: number;
};

export async function getRoutes({
  pageIndex,

  pageSize,
}: Params) {
  const supabase = createClient();
  const from =
    pageIndex * pageSize;

  const to =
    from + pageSize - 1;

  const {
    data,

    count,

    error,
  } =
    await supabase
      .from("routes")
      .select(
        `*, courier_routes(
          courier:couriers(id, active, profile:profiles(full_name, active, can_deliver))
        )`,
        {
          count:
            "exact",
        }
      )
      .range(
        from,
        to
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      ).returns<RouteWithCouriers[]>();

  if (
    error
  ) {
    throw error;
  }

  return {
    data:
      (data ?? []).map((route) => ({
        ...route,
        courier_names: (route.courier_routes ?? []).map((assignment) => {
          const courier = Array.isArray(assignment.courier) ? assignment.courier[0] : assignment.courier;
          const profile = Array.isArray(courier?.profile) ? courier.profile[0] : courier?.profile;
          const name = profile?.full_name ?? "Mensajero sin perfil visible";
          const active = courier?.active === true && profile?.active === true && profile?.can_deliver === true;
          return active ? name : `${name} (inactivo o no habilitado)`;
        }).sort((a, b) => a.localeCompare(b, "es")).join(", "),
      })),

    total:
      count || 0,
  };
}
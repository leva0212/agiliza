import { supabase } from "@/services/supabase/client";

type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export async function saveRouteDays(
  routeId: string,
  days: WeekDay[]
) {
  const payload =
    days.map((day) => ({
      route_id: routeId,

      day,
    }));

  const { error } =
    await supabase
      .from("route_visit_days")
      .insert(payload);

  if (error) throw error;
}
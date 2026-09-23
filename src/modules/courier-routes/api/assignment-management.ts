import { createClient } from "@/lib/supabase/client";

export type AssignmentOption = { id: string; name: string; active: boolean };
export type AssignmentEditorData = { selectedIds: string[]; options: AssignmentOption[] };

export async function getRouteCouriers(routeId: string): Promise<AssignmentEditorData> {
  const supabase = createClient();
  const [assignments, couriers] = await Promise.all([
    supabase.from("courier_routes").select("courier_id").eq("route_id", routeId),
    supabase.from("couriers").select("id, active, profile:profiles(full_name, active, can_deliver)").order("created_at"),
  ]);
  if (assignments.error) throw assignments.error;
  if (couriers.error) throw couriers.error;
  const options = couriers.data.map((courier) => {
    const profile = Array.isArray(courier.profile) ? courier.profile[0] : courier.profile;
    return {
      id: courier.id,
      name: profile?.full_name ?? "Mensajero sin perfil visible",
      active: courier.active === true && profile?.active === true && profile?.can_deliver === true,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, "es"));
  return { selectedIds: assignments.data.map((item) => item.courier_id), options };
}

export async function saveAssignments(axis: "courier" | "route", subjectId: string, ids: string[], expectedIds: string[]) {
  const { error } = await createClient().rpc("save_courier_route_assignments", {
    p_axis: axis, p_subject_id: subjectId,
    p_ids: [...new Set(ids)], p_expected_ids: [...new Set(expectedIds)],
  });
  if (error) throw new Error(error.code === "PGRST202"
    ? "Debe aplicar la migración de asignaciones de mensajeros y rutas antes de guardar."
    : error.message);
}

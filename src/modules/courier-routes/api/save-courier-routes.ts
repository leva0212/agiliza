import { saveAssignments } from "./assignment-management";

export async function saveCourierRoutes(courierId: string, routeIds: string[], expectedRouteIds: string[]) {
  await saveAssignments("courier", courierId, routeIds, expectedRouteIds);
}

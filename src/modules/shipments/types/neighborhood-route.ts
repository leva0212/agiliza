export type NeighborhoodRoute = {

  route_id: string;

  route_name: string;

  estimated_hours:
    number | null;

  min_hours:
    number | null;

  max_hours:
    number | null;

  visit_days:
    string[];

};
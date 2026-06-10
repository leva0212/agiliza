export type ShipmentStatus =
  | "created"
  | "assigned"
  | "in_route"
  | "delivered"
  | "failed_attempt"
  | "rejected"
  | "cancelled";

export type Shipment = {
  id: string;

  tracking_number: string;

  company_id: string;

  courier_id: string | null;

  route_id: string | null;

  status: ShipmentStatus;

  customer_name: string | null;

  customer_identification_type_id:
  number | null;

  customer_identification:
  string | null;

  customer_address:
  string | null;

  receiver_name:
  string | null;

  district_id:
  number | null;

  neighborhood_id:
  number | null;

  latitude:
  number | null;

  longitude:
  number | null;

  notes:
  string | null;

  commercial_notes:
  string | null;

  internal_reference:
  string | null;

  delivered_at:
  string | null;

  created_at:
  string;

  company?: {
    id: string;

    name: string;
  } | null;

  route?: {
    id: string;

    name: string;

    estimated_hours:
    number | null;
  } | null;
};

export type ShipmentListResponse = {
  data: Shipment[];

  total: number;
};

export type ShipmentDetail = Shipment & {
  courier: {
    id: string;
    full_name: string;
  } | null;
  identification_type: {

    id: number;

    name: string;

  } | null;

  company: {
    id: string;
    name: string;
  } | null;

  route: {
    id: string;
    name: string;
    estimated_hours:
    number | null;
  } | null;

  district: {
    id: number;
    name: string;

    canton: {
      id: number;
      name: string;

      province: {
        id: number;
        name: string;
      };
    };
  } | null;

  neighborhood: {
    id: number;
    name: string;
    latitude:
    number | null;
    longitude:
    number | null;
  } | null;

};
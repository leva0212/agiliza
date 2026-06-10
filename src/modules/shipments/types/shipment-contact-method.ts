export type ShipmentContactMethodType =
  | "phone"
  | "whatsapp"
  | "email";

export type ShipmentContactType =
  | "customer"
  | "authorized"
  | "reference";

export type ShipmentContactMethod = {
  id: string;

  shipment_id: string;

  contact_name: string | null;

  contact_type:
    ShipmentContactType | null;

  relationship:
    string | null;

  can_receive: boolean;

  method_type:
    ShipmentContactMethodType;

  value: string;

  label: string | null;

  is_primary: boolean;

  notes: string | null;

  created_at: string;
};

export type CreateShipmentContactMethodInput = {

  contact_name: string;

  contact_type:
    ShipmentContactType;

  relationship?: string;

  can_receive?: boolean;

  method_type:
    ShipmentContactMethodType;

  value: string;

  label?: string;

  is_primary?: boolean;

  notes?: string;

};
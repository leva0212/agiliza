import type {
  CreateShipmentContactMethodInput,
} from "./shipment-contact-method";

import type {
  CreateShipmentItemInput,
} from "./shipment-item";

export type CreateShipmentInput = {

  company_id: string;

  customer_identification_type_id:
    number | null;

  customer_identification:
    string;

  customer_name:
    string;

  receiver_name:
    string;
    
    receiver_type:
  "owner" |
  "authorized";

  district_id:
    number | null;

  neighborhood_id:
    number | null;

  customer_address:
    string;

  latitude:
    number | null;

  longitude:
    number | null;

  route_id:
    string | null;

  internal_reference:
    string;

  commercial_notes:
    string;

  notes:
    string;

  contact_methods:
    CreateShipmentContactMethodInput[];

  items:
    CreateShipmentItemInput[];

};
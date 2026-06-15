export type Company = {
  id: string;

  code: string;

  name: string;

  trade_name: string | null;

  address: string | null;

  active: boolean;

  created_at: string;

  delivery_charge: number;

  failed_charge: number;

  primary_contact: {
    id: string;

    full_name: string;

    position: string | null;
  } | null;
};
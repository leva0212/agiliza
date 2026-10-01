export type Company = {
  id: string;

  code: string;

  name: string;

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

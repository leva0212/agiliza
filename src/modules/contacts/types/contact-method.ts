export type ContactMethod = {
  id: string;

  contact_id: string;

  method_type: string;

  value: string;

  label: string | null;

  is_primary: boolean;

  active: boolean;
};
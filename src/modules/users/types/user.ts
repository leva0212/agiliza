export type UserRole =
  | "super_admin"
  | "company_admin"
  | "courier"
  | "seller";

export type User = {
  id: string;

  email: string;

  company_id: string | null;

  full_name: string;

  phone: string | null;

  role: UserRole;

  active: boolean;

  created_at: string;

  must_change_password?: boolean;

  company?: {
    id: string;
    name: string;
  } | null;

  last_password?: string | null;

  delivery_pay: number;

  failed_pay: number;

};
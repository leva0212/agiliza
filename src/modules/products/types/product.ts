export type Product = {

  id: string;

  name: string;

  sku: string | null;

  default_deposit: number | null;

  default_shipping_fee: number | null;

  notes: string | null;

  active: boolean;

  created_at: string;

};
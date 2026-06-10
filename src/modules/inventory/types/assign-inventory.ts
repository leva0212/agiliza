export type AssignInventoryInput = {

  courier_id: string;

  company_id: string;

  product_id: string;

  quantity: number;

  low_stock: number;

  medium_stock: number;

  reason: string;

  notes?: string;

  created_by: string;

};
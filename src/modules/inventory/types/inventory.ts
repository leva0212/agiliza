export type Inventory = {

  id: string;

  courier_id: string;

  company_id: string;

  product_id: string;

  quantity: number;

  low_stock: number;

  medium_stock: number;

  updated_at: string;

  courier_name?: string;

  company_name?: string;

  product_name?: string;

  stock_status?:
    | "low"
    | "medium"
    | "high";

};

export type InventoryFilters = {

  pageIndex: number;

  pageSize: number;

  courierId?: string;

  companyId?: string;

  productId?: string;

  quantityOperator?:
    | "="
    | "<"
    | "<="
    | ">"
    | ">="
    | "between";

  quantityValue?: number;

  quantityValue2?: number;

};
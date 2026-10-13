export type SerializedInventoryItem = {
  id: string;
  barcode: string;
  status: "available" | "delivered" | "voided";
  imported_at: string;
  company_name: string | null;
  courier_name: string | null;
  product_name: string | null;
  imported_by_name: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  original_filename: string | null;
  notes: string | null;
  delivered_at: string | null;
  shipment_id: string | null;
  tracking_number: string | null;
  total_count: number;
};

export type SerializedInventoryFilters = {
  barcode?: string;
  company?: string;
  courier?: string;
  product?: string;
  importedBy?: string;
  status?: string;
  imageFilter?: string;
  from?: string;
  to?: string;
  pageIndex: number;
  pageSize: number;
};

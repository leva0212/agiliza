export type ShipmentAttachment = {
  id: string;
  shipment_id: string;
  storage_path: string;
  storage_provider: "supabase" | "cloudinary";
  file_url: string;
  original_filename: string;
  mime_type: string | null;
  file_size: number | null;
  optimized_file_size: number | null;
  optimized_at: string | null;
  notes: string;
  notes_updated_at: string | null;
  created_at: string;
  created_by: string;
  created_company_id: string;
  deleted_at: string | null;
  deleted_by: string | null;
  creator?: {
    id: string;
    full_name: string;
    company_id: string;
    company?: {
      id: string;
      name: string;
      trade_name: string | null;
    } | null;
  } | null;
  deleted_by_profile?: {
    id: string;
    full_name: string;
  } | null;
};

export type PendingShipmentAttachment = {
  id: string;
  file: File;
  notes: string;
};

export type ShipmentEvidenceType =
  | "photo"
  | "video"
  | "audio"
  | "document";

export type ShipmentEvidence = {
  id: string;

  shipment_id: string;
  validated: boolean;

  validated_at: string | null;

  validated_by: string | null;

  evidence_type: ShipmentEvidenceType;

  file_url: string | null;

  storage_path: string | null;

  thumbnail_url: string | null;

  original_filename: string | null;

  mime_type: string | null;

  file_size: number | null;

  metadata: Record<string, unknown> | null;

  notes: string | null;

  created_at: string;

  created_by: string | null;

  validator?: {
    id: string;
    full_name: string;
  } | null;

  creator?: {
    id: string;

    full_name: string;

    company_id: string;

    company?: {
      id: string;

      name: string;

      is_owner_company: boolean;
    } | null;
  } | null;
};
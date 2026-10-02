import type { TrackingStatus } from "../constants/tracking-status-options";

export type TrackingRecord = {
  id: string;
  created_at: string;
  created_by_label: string;
  created_by_company_label: string;
  company_id: string;
  full_name: string;
  identification: string;
  province_id: number;
  canton_id: number;
  district_id: number;
  status: TrackingStatus;
  comment: string | null;
  company: {
    id: string;
    code: string;
    name: string | null;
    display_name?: string;
  } | null;
  province: {
    id: number;
    name: string;
  } | null;
  canton: {
    id: number;
    name: string;
    area_classification: "gam" | "rural" | null;
  } | null;
  district: {
    id: number;
    name: string;
  } | null;
};

export type TrackingRecordInput = {
  company_id: string;
  full_name: string;
  identification: string;
  province_id: number;
  canton_id: number;
  district_id: number;
  status: TrackingStatus;
  comment: string;
};

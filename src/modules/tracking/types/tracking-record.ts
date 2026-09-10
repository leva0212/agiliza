import type { TrackingStatus } from "../constants/tracking-status-options";

export type TrackingRecord = {
  id: string;
  created_at: string;
  company_id: string;
  full_name: string;
  identification: string;
  province_id: number;
  status: TrackingStatus;
  comment: string | null;
  company: {
    id: string;
    name: string;
    trade_name: string | null;
  } | null;
  province: {
    id: number;
    name: string;
  } | null;
};

export type TrackingRecordInput = {
  company_id: string;
  full_name: string;
  identification: string;
  province_id: number;
  status: TrackingStatus;
  comment: string;
};

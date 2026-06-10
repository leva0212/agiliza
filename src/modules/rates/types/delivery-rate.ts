export type DeliveryRate = {
  id: string;

  route_id: string;

  province_id: number | null;

  canton_id: number | null;

  district_id: number | null;

  neighborhood_id: number | null;

  delivery_charge: number;

  failed_charge: number;

  active: boolean;

  created_at: string;
};

export type CreateDeliveryRateInput = {
  route_id: string;

  province_id?: number | null;

  canton_id?: number | null;

  district_id?: number | null;

  neighborhood_id?: number | null;

  delivery_charge: number;

  failed_charge: number;
};

export type DeliveryRateDetail =
  DeliveryRate & {

    province?: {
      id: number;
      name: string;
    } | null;

    canton?: {
      id: number;
      name: string;
    } | null;

    district?: {
      id: number;
      name: string;
    } | null;

    neighborhood?: {
      id: number;
      name: string;
    } | null;

  };
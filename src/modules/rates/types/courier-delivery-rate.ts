export type CourierDeliveryRate = {
  id: string;

  courier_id: string;

  route_id: string;

  province_id: number | null;

  canton_id: number | null;

  district_id: number | null;

  neighborhood_id: number | null;

  delivery_pay: number;

  failed_pay: number;

  active: boolean;

  created_at: string;
};

export type CreateCourierDeliveryRateInput = {
  courier_id: string;

  route_id: string;

  province_id?: number | null;

  canton_id?: number | null;

  district_id?: number | null;

  neighborhood_id?: number | null;

  delivery_pay: number;

  failed_pay: number;
};
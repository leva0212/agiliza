export type ShipmentItem = {
  id: string;

  shipment_id: string;

  product_id: string;

  quantity: number;

  serial_number: string | null;

  barcode: string | null;

  deposit_amount: number;

  shipping_fee: number;

  notes: string | null;

  created_at: string;
};

export type CreateShipmentItemInput = {
  product_id: string;

  quantity: number;

  serial_number?: string;

  barcode?: string;

  deposit_amount: number;

  shipping_fee: number;

  notes?: string;
};
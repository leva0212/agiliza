export type Route = {
  id: string;
  name: string;
  active: boolean;

  company_delivery_charge: number;
  courier_delivery_pay: number;

  company_failed_charge: number;
  courier_failed_pay: number;
};
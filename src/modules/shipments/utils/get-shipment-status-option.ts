import {
  shipmentStatusOptions,
} from "../constants/shipment-status-options";

export function getShipmentStatusOption(
  value: string,
) {

  return shipmentStatusOptions.find(
    option =>
      option.value === value,
  );

}
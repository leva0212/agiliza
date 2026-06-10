import {
  InventoryMovement,
} from "../types/inventory-movement";

export async function getInventoryMovements(
  inventoryId: string,
): Promise<
  InventoryMovement[]
> {

  const response =
    await fetch(

      `/api/inventory/movements?inventoryId=${inventoryId}`,

    );

  const data =
    await response.json();

  if (
    !response.ok
  ) {

    throw new Error(

      data.message ??

      "Error obteniendo movimientos",

    );

  }

  return data;

}
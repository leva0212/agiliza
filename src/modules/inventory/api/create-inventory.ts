import {
  assignInventory,
} from "./assign-inventory";

type Input = {
  courier_id: string;

  company_id: string;

  product_id: string;

  quantity: number;
};

export async function createInventory(
  input: Input,
) {

  return assignInventory({

    courier_id:
      input.courier_id,

    company_id:
      input.company_id,

    product_id:
      input.product_id,

    quantity:
      input.quantity,

    low_stock:
      5,

    medium_stock:
      10,

    reason:
      "Inventario inicial",

    notes:
      "",

    created_by:
      crypto.randomUUID(),

  });

}
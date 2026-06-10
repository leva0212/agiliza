import { createClient } from "@/lib/supabase/client";

import { AssignInventoryInput } from "../types/assign-inventory";

export async function assignInventory(
  input: AssignInventoryInput,
) {

  const supabase =
    createClient();

  const {
    data: existing,
    error: existingError,
  } = await supabase

    .from("inventory")

    .select(`
      id,
      quantity
    `)

    .eq(
      "courier_id",
      input.courier_id,
    )

    .eq(
      "company_id",
      input.company_id,
    )

    .eq(
      "product_id",
      input.product_id,
    )

    .maybeSingle();

  if (existingError) {

    throw existingError;

  }

  /*
  ==================================
  INVENTARIO EXISTENTE
  ==================================
  */

  if (existing) {

    const quantityBefore =
      existing.quantity;

    const quantityAfter =
      quantityBefore +
      input.quantity;

    const {
      error: updateError,
    } = await supabase

      .from("inventory")

      .update({

        quantity:
          quantityAfter,

        updated_at:
          new Date()
            .toISOString(),

      })

      .eq(
        "id",
        existing.id,
      );

    if (updateError) {

      throw updateError;

    }

    const {
      error: movementError,
    } = await supabase

      .from(
        "inventory_movements",
      )

      .insert({

        inventory_id:
          existing.id,

        quantity_before:
          quantityBefore,

        quantity_change:
          input.quantity,

        quantity_after:
          quantityAfter,

        reason:
          input.reason,

        notes:
          input.notes ??
          null,

        created_by:
          input.created_by,

      });

    if (movementError) {

      throw movementError;

    }

    return {

      id:
        existing.id,

      quantity:
        quantityAfter,

      created:
        false,

    };

  }

  /*
  ==================================
  INVENTARIO NUEVO
  ==================================
  */

  const {

    data: inventory,

    error: insertError,

  } = await supabase

    .from("inventory")

    .insert({

      courier_id:
        input.courier_id,

      company_id:
        input.company_id,

      product_id:
        input.product_id,

      quantity:
        input.quantity,

      low_stock:
        input.low_stock,

      medium_stock:
        input.medium_stock,

    })

    .select()

    .single();

  if (insertError) {

    throw insertError;

  }

  const {

    error: movementError,

  } = await supabase

    .from(
      "inventory_movements",
    )

    .insert({

      inventory_id:
        inventory.id,

      quantity_before:
        0,

      quantity_change:
        input.quantity,

      quantity_after:
        input.quantity,

      reason:
        input.reason,

      notes:
        input.notes ??
        null,

      created_by:
        input.created_by,

    });

  if (movementError) {

    throw movementError;

  }

  return {

    id:
      inventory.id,

    quantity:
      inventory.quantity,

    created:
      true,

  };

}
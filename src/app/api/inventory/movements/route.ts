import { NextRequest } from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
) {

  try {

    const inventoryId =

      request.nextUrl.searchParams.get(
        "inventoryId",
      );

    if (!inventoryId) {

      return Response.json(
        {
          message:
            "inventoryId requerido",
        },
        {
          status: 400,
        },
      );

    }

    const supabase =
      await createClient();

    const {
      data,
      error,
    } = await supabase

      .from(
        "inventory_movements",
      )

      .select(`
        id,

        created_at,

        quantity_before,

        quantity_change,

        quantity_after,

        reason,

        notes
      `)

      .eq(
        "inventory_id",
        inventoryId,
      )

      .order(
        "created_at",
        {
          ascending:
            false,
        },
      );

    if (error) {

      return Response.json(
        {
          message:
            error.message,
        },
        {
          status: 400,
        },
      );

    }

    return Response.json(
      data,
    );

  } catch (error) {

    return Response.json(
      {
        message:
          String(error),
      },
      {
        status: 500,
      },
    );

  }

}
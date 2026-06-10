import { NextResponse } from "next/server";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

export async function GET() {

  const {
    data,

    error,
  } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {

    return NextResponse.json(
      error,
      {
        status: 500,
      },
    );

  }

  return NextResponse.json({
    total:
      data.users.length,
  });

}
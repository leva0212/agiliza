import { redirect } from "next/navigation";

export default async function HomePage() {
  redirect("/dashboard/coverage");
}

/*import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard/routes");
  }

  redirect("/dashboard/coverage");
}

*/
/*import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/dashboard/routes");
}*/

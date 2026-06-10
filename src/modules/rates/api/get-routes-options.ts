import { createClient } from "@/lib/supabase/client";

export type RouteOption = {
    id: string;
    name: string;
};

export async function getRoutesOptions(): Promise<
    RouteOption[]
> {
    const supabase =
        createClient();

    const {
        data,
        error,
    } = await supabase

        .from("routes")

        .select(`
      id,
      name
    `)

        .eq(
            "active",
            true,
        )

        .order(
            "name",
        );

    if (error) {
        throw error;
    }

    return data ?? [];
}
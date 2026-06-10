import { createClient } from "@/lib/supabase/client";

type Params = {
  pageIndex: number;

  pageSize: number;
};

export async function getCompanies({
  pageIndex,

  pageSize,
}: Params) {
  const supabase = createClient();

  const from =
    pageIndex * pageSize;

  const to =
    from + pageSize - 1;

  const {
    data: companies,

    count,

    error,
  } = await supabase

    .from("companies")

    .select(
      `
      *
      `,
      {
        count: "exact",
      },
    )

    .range(from, to)

    .order("name");

  if (error) {
    throw error;
  }

  const companyIds =
    companies.map(
      (company) => company.id,
    );

  const {
    data: relations,
  } = await supabase

    .from("company_contacts")

    .select(`
      company_id,
      is_primary,

      contact:contacts(
        id,
        full_name,
        position
      )
    `)

    .in(
      "company_id",
      companyIds,
    );

  const data =
    companies.map(
      (company) => {

        const primary =
          relations?.find(
            (relation) =>

              relation.company_id ===
                company.id &&

              relation.is_primary,
          );

        return {

          ...company,

          primary_contact:
            primary?.contact ||
            null,
        };
      },
    );

  return {

    data,

    total:
      count || 0,
  };
}
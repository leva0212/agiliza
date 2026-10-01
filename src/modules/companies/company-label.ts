export type CompanyIdentity = {
  code?: string | null;
  name?: string | null;
  display_name?: string | null;
};

export function getCompanyLabel(company: CompanyIdentity | null | undefined) {
  if (!company) return "";
  return company.display_name || [company.code, company.name].filter(Boolean).join(" - ") || company.code || "";
}

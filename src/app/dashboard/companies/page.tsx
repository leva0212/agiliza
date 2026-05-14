'use client'

import { useCompanies } from '@/modules/companies/hooks/use-companies'

export default function CompaniesPage() {
  const { data, isLoading } = useCompanies()

  if (isLoading) return <div>Cargando...</div>

  return (
    <div>
      {data?.map((company) => (
        <div key={company.id}>
          {company.name}
        </div>
      ))}
    </div>
  )
}
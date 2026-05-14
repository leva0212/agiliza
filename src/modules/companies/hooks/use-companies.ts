import { useQuery } from '@tanstack/react-query'
import { getCompanies } from '../api/get-companies'

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies,
  })
}
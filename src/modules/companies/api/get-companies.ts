import { supabase } from '@/services/supabase/client';

export async function getCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')

  if (error) throw error

  return data
}
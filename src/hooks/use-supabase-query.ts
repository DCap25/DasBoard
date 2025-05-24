import { useQuery } from '@tanstack/react-query';
import { PostgrestError } from '@supabase/supabase-js';

export function useSupabaseQuery<T>(
  queryKey: unknown[],
  queryFn: () => Promise<any>,
  options?: any
) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
}

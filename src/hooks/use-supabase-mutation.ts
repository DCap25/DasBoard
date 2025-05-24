import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { PostgrestError } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

type SupabaseMutationFn<TData, TVariables> = (variables: TVariables) => Promise<{
  data: TData | null;
  error: PostgrestError | null;
}>;

export function useSupabaseMutation<TData = unknown, TVariables = unknown, TContext = unknown>(
  mutationFn: SupabaseMutationFn<TData, TVariables>,
  options?: Omit<UseMutationOptions<TData, PostgrestError, TVariables, TContext>, 'mutationFn'>
): UseMutationResult<TData, PostgrestError, TVariables, TContext> {
  const { toast } = useToast();

  return useMutation<TData, PostgrestError, TVariables, TContext>({
    mutationFn: async variables => {
      const { data, error } = await mutationFn(variables);

      if (error) {
        console.error('Supabase mutation error:', error);

        // Show toast notification for errors unless explicitly disabled
        if (options?.useErrorBoundary !== true) {
          toast({
            title: 'Error',
            description: error.message || 'Something went wrong',
            variant: 'destructive',
          });
        }

        throw error;
      }

      // Handle successful mutation with custom toast message
      if (options?.onSuccess && !options.onError) {
        toast({
          title: 'Success',
          description: 'Operation completed successfully',
        });
      }

      return data as TData;
    },
    ...options,
  });
}

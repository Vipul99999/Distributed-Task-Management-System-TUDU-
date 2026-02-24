import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Improvement } from "@/types/improve";
import { improveApi } from "@/lib/api/improveApi";

const IMPROVE_KEYS = {
  all: ["improvements"] as const,
  streaks: ["streaks"] as const,
  categories: ["categories"] as const,
};

export const useImprove = () => {
  const queryClient = useQueryClient();

  // Fetch all improvements
  const improvementsQuery = useQuery({
    queryKey: IMPROVE_KEYS.all,
    queryFn: improveApi.getAll,
    staleTime: 60 * 1000,
  });

  // Fetch streaks
  const streaksQuery = useQuery({
    queryKey: IMPROVE_KEYS.streaks,
    queryFn: improveApi.getStreaks,
    staleTime: 60 * 1000,
  });

  // Fetch categories (for create form)
  const categoriesQuery = useQuery({
    queryKey: IMPROVE_KEYS.categories,
    queryFn: improveApi.getCategories,
    staleTime: 5 * 60 * 1000, // longer cache since categories change less often
  });

  // Mutation to create an improvement
  const createImprovement = useMutation({
    mutationFn: improveApi.create,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: IMPROVE_KEYS.all }),
        queryClient.invalidateQueries({ queryKey: IMPROVE_KEYS.streaks }),
      ]);
    },
  });

  // Mutation to update an improvement
  const updateImprovement = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Improvement, "id">>;
    }) => improveApi.update(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: IMPROVE_KEYS.all }),
        queryClient.invalidateQueries({ queryKey: IMPROVE_KEYS.streaks }),
      ]);
    },
  });

  return {
    improvements: improvementsQuery.data,
    isLoadingImprovements: improvementsQuery.isLoading,
    improvementsError: improvementsQuery.error,

    streaks: streaksQuery.data,
    isLoadingStreaks: streaksQuery.isLoading,
    streaksError: streaksQuery.error,

    categories: categoriesQuery.data,
    isLoadingCategories: categoriesQuery.isLoading,
    categoriesError: categoriesQuery.error,

    createImprovement,
    updateImprovement,
  };
};

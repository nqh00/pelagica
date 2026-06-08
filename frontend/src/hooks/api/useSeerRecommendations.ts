import { useQuery } from '@tanstack/react-query';
import type { MovieDetails } from '@/api/seer/types';

export function useSeerRecommendations(tmdbId: string | undefined) {
    return useQuery<MovieDetails[]>({
        queryKey: ['seerRecommendations', tmdbId],
        queryFn: async () => {
            const response = await fetch(`/api/seer/movie/${tmdbId}/recommendations`);
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }
            return response.json();
        },
        enabled: !!tmdbId,
    });
}

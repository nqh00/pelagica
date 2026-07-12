import { useQuery } from '@tanstack/react-query';
import type { SeerrMovieRecommendation } from '@/api/seer/types';
import { getServerUrl } from '@/utils/localstorageCredentials';
import { getSeerrMovieRecommendations } from '@/api/seer/recommendations';

export function useSeerrRecommendations(tmdbId: string | undefined) {
    return useQuery<SeerrMovieRecommendation[]>({
        queryKey: ['seerrRecommendations', tmdbId, getServerUrl()],
        queryFn: () => getSeerrMovieRecommendations(tmdbId!),
        enabled: !!tmdbId,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
}

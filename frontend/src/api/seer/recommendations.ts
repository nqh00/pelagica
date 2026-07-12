import { getServerUrl } from '@/utils/localstorageCredentials';
import type { SeerrMovieRecommendation, SeerrMovieRecommendationsResponse } from './types';

export async function getSeerrMovieRecommendations(
    tmdbId: string
): Promise<SeerrMovieRecommendation[]> {
    const response = await fetch(
        `/api/seerr/movie/${tmdbId}/recommendations?jellyfin_url=${encodeURIComponent(getServerUrl() || '')}`
    );
    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }
    const data: SeerrMovieRecommendationsResponse = await response.json();
    return data.results;
}

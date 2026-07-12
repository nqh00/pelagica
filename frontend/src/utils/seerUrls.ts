import type { SeerrMediaType } from '../api/seerr/types';

const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

export interface SeerrItemUrlParams {
    seerrUrl: string;
    tmdbId: number;
    mediaType: SeerrMediaType;
}

export function getSeerrItemUrl({ seerrUrl, tmdbId, mediaType }: SeerrItemUrlParams): string {
    return `${seerrUrl.replace(/\/$/, '')}/${mediaType}/${tmdbId}`;
}

export function getSeerrItemPosterUrl(posterPath: string): string {
    return `${TMDB_POSTER_BASE}${posterPath}`;
}

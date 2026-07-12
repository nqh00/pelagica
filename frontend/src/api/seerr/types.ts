export interface SeerrMovieRecommendation {
    id: number;
    title: string;
    posterPath?: string;
    releaseDate?: string;
}

export interface SeerrMovieRecommendationsResponse {
    page: number;
    totalPages: number;
    totalResults: number;
    results: SeerrMovieRecommendation[];
}

export interface SeerrTvRecommendation {
    id: number;
    name: string;
    posterPath?: string;
    firstAirDate?: string;
}

export interface SeerrTvRecommendationsResponse {
    page: number;
    totalPages: number;
    totalResults: number;
    results: SeerrTvRecommendation[];
}

export type SeerrMediaType = 'movie' | 'tv';

export interface SeerrRecommendationItem {
    id: number;
    title: string;
    posterPath?: string;
    releaseDate?: string;
}

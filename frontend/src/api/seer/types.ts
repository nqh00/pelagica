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

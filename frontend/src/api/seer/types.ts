export interface Genre {
    id: number;
    name: string;
}

export interface RelatedVideo {
    url: string;
    key: string;
    name: string;
    size: number;
    type: string;
    site: string;
}

export interface ProductionCompany {
    id: number;
    logoPath: string;
    originCountry: string;
    name: string;
}

export interface ProductionCountry {
    iso_3166_1: string;
    name: string;
}

export interface SpokenLanguage {
    englishName: string;
    iso_639_1: string;
    name: string;
}

export interface CastMember {
    id: number;
    castId: number;
    character: string;
    creditId: string;
    gender: number;
    name: string;
    order: number;
    profilePath: string;
}

export interface CrewMember {
    id: number;
    creditId: string;
    gender: number;
    name: string;
    job: string;
    department: string;
    profilePath: string;
}

export interface Credits {
    cast: CastMember[];
    crew: CrewMember[];
}

export interface ExternalIds {
    facebookId: string;
    freebaseId: string;
    freebaseMid: string;
    imdbId: string;
    instagramId: string;
    tvdbId: number;
    tvrageId: number;
    twitterId: string;
}

export interface User {
    id: number;
    email: string;
    username: string;
    plexUsername: string;
    plexToken: string;
    jellyfinAuthToken: string;
    userType: number;
    permissions: number;
    avatar: string;
    createdAt: string;
    updatedAt: string;
    requestCount: number;
}

export interface MediaRequest {
    id: number;
    status: number;
    createdAt: string;
    updatedAt: string;
    requestedBy: User;
    modifiedBy: User;
    is4k: boolean;
    serverId: number;
    profileId: number;
    rootFolder: string;
}

export interface WatchProvider {
    displayPriority: number;
    logoPath: string;
    id: number;
    name: string;
}

export interface WatchProviderRegion {
    iso_3166_1: string;
    link: string;
    buy: WatchProvider[];
    flatrate: WatchProvider[];
}

// Movie specific

export interface ReleaseDate {
    certification: string;
    iso_639_1: string;
    note: string;
    release_date: string;
    type: number;
}

export interface ReleaseResult {
    iso_3166_1: string;
    rating: string;
    release_dates: ReleaseDate[];
}

export interface Releases {
    results: ReleaseResult[];
}

export interface Collection {
    id: number;
    name: string;
    posterPath: string;
    backdropPath: string;
}

export interface MovieMediaInfo {
    id: number;
    tmdbId: number;
    tvdbId: number;
    status: number;
    requests: MediaRequest[];
    createdAt: string;
    updatedAt: string;
}

export interface MovieDetails {
    id: number;
    imdbId: string;
    adult: boolean;
    backdropPath: string;
    posterPath: string;
    budget: number;
    genres: Genre[];
    homepage: string;
    relatedVideos: RelatedVideo[];
    originalLanguage: string;
    originalTitle: string;
    overview: string;
    popularity: number;
    productionCompanies: ProductionCompany[];
    productionCountries: ProductionCountry[];
    releaseDate: string;
    releases: Releases;
    revenue: number;
    runtime: number;
    spokenLanguages: SpokenLanguage[];
    status: string;
    tagline: string;
    title: string;
    video: boolean;
    voteAverage: number;
    voteCount: number;
    credits: Credits;
    collection: Collection | null;
    externalIds: ExternalIds;
    mediaInfo: MovieMediaInfo | null;
    watchProviders: WatchProviderRegion[];
}

// TV-specific

export interface ContentRating {
    iso_3166_1: string;
    rating: string;
}

export interface ContentRatings {
    results: ContentRating[];
}

export interface TvSeason {
    id: number;
    name: string;
    seasonNumber: number;
    episodeCount: number;
    airDate: string;
    posterPath: string;
    overview: string;
}

export interface TvEpisode {
    id: number;
    name: string;
    overview: string;
    episodeNumber: number;
    seasonNumber: number;
    airDate: string;
    stillPath: string;
    voteAverage: number;
    voteCount: number;
}

export interface TvNetwork {
    id: number;
    name: string;
    logoPath: string;
    originCountry: string;
}

export interface TvMediaSeason {
    id: number;
    seasonNumber: number;
    status: number;
    createdAt: string;
    updatedAt: string;
}

export interface TvMediaInfo {
    id: number;
    tmdbId: number;
    tvdbId: number;
    status: number;
    requests: MediaRequest[];
    seasons: TvMediaSeason[];
    createdAt: string;
    updatedAt: string;
}

export interface TvDetails {
    id: number;
    name: string;
    originalName: string;
    adult: boolean;
    backdropPath: string;
    posterPath: string;
    genres: Genre[];
    homepage: string;
    relatedVideos: RelatedVideo[];
    originalLanguage: string;
    originCountry: string[];
    overview: string;
    popularity: number;
    networks: TvNetwork[];
    productionCompanies: ProductionCompany[];
    firstAirDate: string;
    lastAirDate: string;
    contentRatings: ContentRatings;
    numberOfEpisodes: number;
    numberOfSeasons: number;
    seasons: TvSeason[];
    lastEpisodeToAir: TvEpisode | null;
    nextEpisodeToAir: TvEpisode | null;
    spokenLanguages: SpokenLanguage[];
    status: string;
    tagline: string;
    video: boolean;
    voteAverage: number;
    voteCount: number;
    credits: Credits;
    externalIds: ExternalIds;
    mediaInfo: TvMediaInfo | null;
    watchProviders: WatchProviderRegion[];
}

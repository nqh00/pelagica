import SectionScroller from '@/components/SectionScroller';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeerrRecommendations } from '@/hooks/api/useSeerrRecommendations';
import { useSeerrLoginStatus } from '@/hooks/api/useSeerrLoginStatus';
import { ImageOff } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import type React from 'react';

const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

interface SeerrRecommendationsRowProps {
    title?: React.ReactNode;
    tmdbId: string;
    seerrUrl: string;
}

const skeletonItems = Array.from({ length: 5 }, (_, index) => (
    <div key={index} className="w-36 lg:w-44 2xl:w-52">
        <Skeleton className="w-36 h-54 lg:w-44 lg:h-64 2xl:w-52 2xl:h-80 rounded-md mb-2" />
        <Skeleton className="w-32 lg:w-40 2xl:w-48 h-4 mb-1" />
        <Skeleton className="w-20 lg:w-24 2xl:w-28 h-3" />
    </div>
));

const SeerrRecommendationPoster = ({
    seerrUrl,
    tmdbId,
    title,
    posterPath,
    year,
}: {
    seerrUrl: string;
    tmdbId: number;
    title: string;
    posterPath?: string;
    year?: string;
}) => {
    const [posterFailed, setPosterFailed] = useState(false);

    return (
        <a
            href={`${seerrUrl.replace(/\/$/, '')}/movie/${tmdbId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-36 lg:w-44 2xl:w-52 shrink-0"
        >
            <div className="relative overflow-hidden rounded-md group w-36 h-54 lg:w-44 lg:h-64 2xl:w-52 2xl:h-80 bg-muted">
                {posterPath && !posterFailed ? (
                    <img
                        src={`${TMDB_POSTER_BASE}${posterPath}`}
                        alt={title}
                        className="w-full h-full object-cover rounded-md group-hover:opacity-75 transition-all group-hover:scale-105 transform-gpu will-change-transform"
                        loading="lazy"
                        onError={() => setPosterFailed(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="text-muted-foreground" size={32} />
                    </div>
                )}
            </div>
            <p className="mt-2 text-sm line-clamp-1 text-ellipsis break-all max-w-36 lg:max-w-44 2xl:max-w-52">
                {title}
            </p>
            {year && <span className="text-xs text-muted-foreground mt-1">{year}</span>}
        </a>
    );
};

const SeerrRecommendationsRow: React.FC<SeerrRecommendationsRowProps> = memo(
    ({ title, tmdbId, seerrUrl }) => {
        const { data: isLoggedIn, isLoading: isLoadingLoginStatus } = useSeerrLoginStatus();
        const { data: recommendations, isLoading } = useSeerrRecommendations(
            isLoggedIn ? tmdbId : undefined
        );

        const itemElements = useMemo(() => {
            if (!recommendations) return [];
            return recommendations.map((movie) => (
                <SeerrRecommendationPoster
                    key={movie.id}
                    seerrUrl={seerrUrl}
                    tmdbId={movie.id}
                    title={movie.title}
                    posterPath={movie.posterPath}
                    year={
                        movie.releaseDate
                            ? new Date(movie.releaseDate).getFullYear().toString()
                            : undefined
                    }
                />
            ));
        }, [recommendations, seerrUrl]);

        if (isLoadingLoginStatus || !isLoggedIn) {
            return null;
        }

        if (isLoading) {
            return <SectionScroller title={title} items={skeletonItems} />;
        }

        if (!recommendations || recommendations.length === 0) {
            return null;
        }

        return <SectionScroller title={title} items={itemElements} />;
    }
);

SeerrRecommendationsRow.displayName = 'SeerrRecommendationsRow';

export default SeerrRecommendationsRow;

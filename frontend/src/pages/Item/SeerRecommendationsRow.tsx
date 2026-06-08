import ScrollableSectionPoster from '@/components/ScrollableSectionPoster';
import SectionScroller from '@/components/SectionScroller';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeerRecommendations } from '@/hooks/api/useSeerRecommendations';
import type { MovieDetails } from '@/api/seer/types';
import { memo, useMemo } from 'react';
import type React from 'react';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

interface SeerRecommendationsRowProps {
    title?: React.ReactNode;
    tmdbId: string;
}

const skeletonItems = Array.from({ length: 5 }, (_, index) => (
    <div key={index} className="w-36 lg:w-44 2xl:w-52">
        <Skeleton className="w-36 h-54 lg:w-44 lg:h-64 2xl:w-52 2xl:h-80 rounded-md mb-2" />
        <Skeleton className="w-32 lg:w-40 2xl:w-48 h-4 mb-1" />
        <Skeleton className="w-20 lg:w-24 2xl:w-28 h-3" />
    </div>
));

const SeerRecommendationsRow: React.FC<SeerRecommendationsRowProps> = memo(
    ({ title, tmdbId }) => {
        const { data: recommendations, isLoading } = useSeerRecommendations(tmdbId);

        const itemElements = useMemo(() => {
            if (!recommendations) return [];
            return recommendations.map((movie: MovieDetails) => (
                <ScrollableSectionPoster
                    key={movie.id}
                    posterUrl={movie.posterPath ? `${TMDB_IMAGE_BASE}${movie.posterPath}` : undefined}
                    itemName={movie.title}
                >
                    {movie.releaseDate && (
                        <span className="text-xs text-muted-foreground mt-1">
                            {new Date(movie.releaseDate).getFullYear()}
                        </span>
                    )}
                </ScrollableSectionPoster>
            ));
        }, [recommendations]);

        if (isLoading) {
            return <SectionScroller title={title} items={skeletonItems} />;
        }

        if (!recommendations || recommendations.length === 0) {
            return null;
        }

        return <SectionScroller title={title} items={itemElements} />;
    }
);

SeerRecommendationsRow.displayName = 'SeerRecommendationsRow';

export default SeerRecommendationsRow;

import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { Button } from './ui/button';
import { Film } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { buildPlayerUrl } from '@/utils/playerUrl';
import { useLocalTrailers } from '@/hooks/api/useLocalTrailers';

export const TrailerButton = ({ item }: { item: BaseItemDto }) => {
    const location = useLocation();
    const hasLocalTrailers = (item.LocalTrailerCount ?? 0) > 0;
    const { data: localTrailers } = useLocalTrailers(item.Id ?? undefined, hasLocalTrailers);

    const firstLocalTrailer = localTrailers?.[0];

    if (firstLocalTrailer?.Id) {
        return (
            <Button variant="outline" asChild>
                <Link
                    to={buildPlayerUrl(firstLocalTrailer.Id, location.pathname + location.search)}
                >
                    <Film />
                    Trailer
                </Link>
            </Button>
        );
    }

    if (!item.RemoteTrailers || item.RemoteTrailers.length === 0) return null;

    const firstTrailer = item.RemoteTrailers[0];
    if (!firstTrailer.Url) return null;

    return (
        <Button variant="outline" asChild>
            <a href={firstTrailer.Url} target="_blank" rel="noopener noreferrer">
                <Film />
                Trailer
            </a>
        </Button>
    );
};

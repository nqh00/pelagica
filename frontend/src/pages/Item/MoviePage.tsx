import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import BaseMediaPage from './BaseMediaPage';
import DescriptionItem from './DescriptionItem';
import { getPrimaryImageUrl } from '@/utils/jellyfinUrls';
import { ImageOff } from 'lucide-react';
import PeopleRow from './PeopleRow';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import MoreLikeThisRow from './MoreLikeThisRow';
import type { AppConfig } from '@/hooks/api/useConfig';
import DetailBadges from './DetailBadges';
import MediaInfoDialog from '../../components/MediaInfoDialog';
import FavoriteButton from '../../components/FavoriteButton';
import WatchListButton from '../../components/WatchlistButton';
import PlayStateButton from '../../components/PlayStateButton';
import { getUserId } from '@/utils/localstorageCredentials';
import ItemAdminButton from '@/components/ItemAdminButton';
import { useState } from 'react';
import { TrailerButton } from '../../components/TrailerButton';
import ItemDownloadButton from '../../components/ItemDownloadButton';
import SourcePickerButton from '@/components/SourcePickerButton';

interface MoviePageProps {
    item: BaseItemDto;
    config: AppConfig;
}

const MoviePage = ({ item, config }: MoviePageProps) => {
    const { t } = useTranslation('item');
    const [postersFailed, setPostersFailed] = useState(false);

    const writers =
        item.People?.filter((person) => person.Type === 'Writer').filter((person) => person.Name) ||
        [];
    const directors =
        item.People?.filter((person) => person.Type === 'Director').filter(
            (person) => person.Name
        ) || [];
    const studios = item.Studios?.filter((studio) => studio.Name) || [];

    const isCurrentlyPlaying =
        item.UserData?.PlaybackPositionTicks &&
        item.UserData.PlaybackPositionTicks > 0 &&
        item.RunTimeTicks &&
        item.UserData.PlaybackPositionTicks < item.RunTimeTicks;

    return (
        <BaseMediaPage itemId={item.Id || ''} name={item.Name || ''}>
            <div className="flex flex-col md:flex-row gap-6 max-w-7xl">
                {!postersFailed ? (
                    <div className="relative w-60 min-w-60 h-90 sm:w-72 sm:min-w-72 sm:h-108 hidden sm:block">
                        <img
                            src={getPrimaryImageUrl(
                                item.Id || '',
                                undefined,
                                item.ImageTags?.Primary
                            )}
                            alt={item.Name + ' Primary'}
                            className="object-cover rounded-md w-full h-full"
                            onError={() => setPostersFailed(true)}
                        />
                        <Skeleton className="absolute inset-0 w-full h-full rounded-md -z-1" />
                    </div>
                ) : (
                    <div className="w-60 min-w-60 h-90 sm:w-72 sm:min-w-72 sm:h-108 rounded-md bg-muted flex items-center justify-center">
                        <ImageOff className="text-muted-foreground" size={32} />
                    </div>
                )}
                <div className="flex flex-col gap-3">
                    <h2 className="text-4xl sm:text-5xl font-bold mt-2">{item.Name}</h2>
                    <DetailBadges item={item} appConfig={config} />
                    <div className="mt-1 flex items-center gap-2">
                        <SourcePickerButton
                            itemId={item.Id || ''}
                            mediaSources={item.MediaSources}
                            isCurrentlyPlaying={Boolean(isCurrentlyPlaying)}
                            playLabel={t('play')}
                            resumeLabel={t('resume')}
                        />
                        <TrailerButton item={item} />
                        <FavoriteButton
                            item={item}
                            showFavoriteButton={
                                item.Type && config.itemPage?.favoriteButton?.includes(item.Type)
                            }
                        />
                        <WatchListButton
                            item={item}
                            showWatchlistButton={config.itemPage?.showWatchlistButton}
                        />
                        <PlayStateButton itemId={item.Id || ''} userId={getUserId() || ''} />
                        <ItemDownloadButton
                            item={item}
                            showDownloadButton={config.itemPage?.showDownloadButton}
                        />
                        <MediaInfoDialog streams={item.MediaStreams || []} />
                        <ItemAdminButton item={item} showSubtitlesButton={true} />
                    </div>
                    <p>{item.Overview}</p>
                    <DescriptionItem
                        label={t('genres')}
                        items={
                            item.GenreItems?.map((genre) => ({
                                link: `/item/${genre.Id}`,
                                name: genre.Name!,
                            })) || []
                        }
                    />
                    <DescriptionItem
                        label={t('writers')}
                        items={writers.map((person) => ({
                            link: `/person/${person.Id}`,
                            name: person.Name!,
                        }))}
                    />
                    <DescriptionItem
                        label={t('directors')}
                        items={directors.map((person) => ({
                            link: `/person/${person.Id}`,
                            name: person.Name!,
                        }))}
                    />
                    <DescriptionItem
                        label={t('studios')}
                        items={studios.map((studio) => ({
                            link: `/item/${studio.Id}`,
                            name: studio.Name!,
                        }))}
                    />
                </div>
            </div>
            <PeopleRow
                title={<h3 className="text-3xl font-bold">{t('cast_and_crew')}</h3>}
                people={item.People || []}
            />
            <MoreLikeThisRow
                title={<h3 className="text-3xl font-bold">{t('more_like_this')}</h3>}
                itemId={item.Id || ''}
            />
        </BaseMediaPage>
    );
};

export default MoviePage;

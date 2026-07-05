import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { useRef, type ReactNode } from 'react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from './ui/context-menu';
import ManageImageButton from './ManageImageButton';
import RefreshItemMetadataButton from './RefreshItemMetadataButton';
import EditItemMetadataButton from './EditItemMetadataButton';
import MediaDeleteButton from './MediaDeleteButton';
import { useCurrentUser } from '../hooks/api/useCurrentUser';
import { useTranslation } from 'react-i18next';
import {
    Bookmark,
    Download,
    Heart,
    Image,
    PencilLine,
    Play,
    RotateCcw,
    Trash2,
} from 'lucide-react';
import { useFavorite } from '../hooks/api/useFavorite';
import { useConfig } from '../hooks/api/useConfig';
import { Link } from 'react-router';
import { useLike } from '../hooks/api/useLike';
import { WATCHLISTABLE_ITEM_TYPES } from '../utils/watchlistableItems';
import { DOWNLOADABLE_ITEM_TYPES } from '../utils/downloadableItems';
import { getDownloadurl } from '../utils/jellyfinUrls';

interface GeneralItemContextMenuProps {
    item: BaseItemDto;
    playLink?: string;
    children: ReactNode;
}

const GeneralItemContextMenu = ({ item, playLink, children }: GeneralItemContextMenuProps) => {
    const { t } = useTranslation('item');
    const { config } = useConfig();
    const { data: currentUser } = useCurrentUser();

    const { isFavorite, toggleFavorite, isLoading: isFavoriteLoading } = useFavorite(item.Id);
    const showFavoriteToggle = item.Type && config?.itemPage?.favoriteButton?.includes(item.Type);

    const { isLiked, toggleLike, isLoading } = useLike(item.Id);
    const showWatchlistToggle =
        item.Type &&
        WATCHLISTABLE_ITEM_TYPES.includes(item.Type) &&
        config?.itemPage?.showWatchlistButton;

    const showDownloadButton =
        item.Type &&
        DOWNLOADABLE_ITEM_TYPES.includes(item.Type) &&
        config?.itemPage?.showDownloadButton;

    const manageImagesTriggerRef = useRef<HTMLButtonElement>(null);
    const refreshMetadataTriggerRef = useRef<HTMLButtonElement>(null);
    const deleteTriggerRef = useRef<HTMLButtonElement>(null);
    const editMetadataTriggerRef = useRef<HTMLButtonElement>(null);

    const isAdmin = currentUser?.Policy?.IsAdministrator ?? false;
    const hasItemsAbove =
        Boolean(playLink) ||
        Boolean(showFavoriteToggle) ||
        Boolean(showWatchlistToggle) ||
        Boolean(showDownloadButton);

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
                <ContextMenuContent className="w-52">
                    {playLink && (
                        <ContextMenuItem asChild>
                            <Link to={playLink}>
                                <Play />
                                {t('play')}
                            </Link>
                        </ContextMenuItem>
                    )}
                    {showFavoriteToggle && (
                        <ContextMenuItem
                            onClick={() => toggleFavorite(!isFavorite)}
                            disabled={isFavoriteLoading}
                        >
                            <Heart fill={isFavorite ? 'currentColor' : 'none'} />
                            {isFavorite ? t('unfavorite') : t('favorite')}
                        </ContextMenuItem>
                    )}
                    {showWatchlistToggle && (
                        <ContextMenuItem onClick={() => toggleLike(!isLiked)} disabled={isLoading}>
                            <Bookmark fill={isLiked ? 'currentColor' : 'none'} />
                            {isLiked ? t('remove_from_watchlist') : t('add_to_watchlist')}
                        </ContextMenuItem>
                    )}
                    {showDownloadButton && (
                        <ContextMenuItem asChild>
                            <a
                                href={getDownloadurl(item.Id || '')}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Download />
                                {t('download')}
                            </a>
                        </ContextMenuItem>
                    )}
                    {isAdmin && (
                        <>
                            {hasItemsAbove && <ContextMenuSeparator />}
                            <ContextMenuItem
                                onClick={() => {
                                    setTimeout(() => manageImagesTriggerRef.current?.click(), 0);
                                }}
                            >
                                <Image />
                                {t('manage_images')}
                            </ContextMenuItem>
                            <ContextMenuItem
                                onClick={() => {
                                    setTimeout(() => refreshMetadataTriggerRef.current?.click(), 0);
                                }}
                            >
                                <RotateCcw />
                                {t('refreshMetadata')}
                            </ContextMenuItem>
                            <ContextMenuItem
                                onClick={() => {
                                    setTimeout(() => editMetadataTriggerRef.current?.click(), 0);
                                }}
                            >
                                <PencilLine />
                                {t('editMetadata')}
                            </ContextMenuItem>
                            <ContextMenuItem
                                onClick={() => {
                                    setTimeout(() => deleteTriggerRef.current?.click(), 0);
                                }}
                            >
                                <Trash2 />
                                {t('deleteItem')}
                            </ContextMenuItem>
                        </>
                    )}
                </ContextMenuContent>
            </ContextMenu>
            <div style={{ display: 'none' }}>
                {isAdmin && (
                    <>
                        <ManageImageButton
                            item={item}
                            trigger={<button ref={manageImagesTriggerRef} />}
                        />
                        <RefreshItemMetadataButton
                            item={item}
                            trigger={<button ref={refreshMetadataTriggerRef} />}
                        />
                        <EditItemMetadataButton
                            item={item}
                            trigger={<button ref={editMetadataTriggerRef} />}
                        />
                        <MediaDeleteButton
                            item={item}
                            trigger={<button ref={deleteTriggerRef} />}
                        />
                    </>
                )}
            </div>
        </>
    );
};

export default GeneralItemContextMenu;

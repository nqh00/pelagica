import { Clapperboard, Disc3, Folder, MonitorPlay, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ITEM_FALLBACK_ICONS: Record<string, LucideIcon> = {
    MusicAlbum: Disc3,
    Audio: Disc3,
    MusicArtist: UserRound,
    Person: UserRound,
    Movie: Clapperboard,
    Series: MonitorPlay,
};

export function getItemFallbackIcon(type: string | undefined): LucideIcon {
    return ITEM_FALLBACK_ICONS[type || ''] || Folder;
}

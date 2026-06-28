import {
    AudioLines,
    Mic2,
    MoonStar,
    Podcast,
    SlidersHorizontal,
    Volume1,
    type LucideIcon,
} from 'lucide-react';
import type { BuiltInEqualizerPresetId } from './presets';

export const BUILT_IN_PRESET_ICONS: Record<BuiltInEqualizerPresetId, LucideIcon> = {
    flat: AudioLines,
    bassBoost: Volume1,
    vocalBoost: Mic2,
    podcast: Podcast,
    sleep: MoonStar,
};

export const CUSTOM_PRESET_ICON = SlidersHorizontal;

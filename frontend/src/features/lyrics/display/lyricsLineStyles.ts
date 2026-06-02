import { cn } from '@/lib/utils';
import type { LyricLineState } from '../types';

export function getLineState(index: number, activeIndex: number): LyricLineState {
    if (activeIndex < 0) {
        return 'future';
    }

    if (index < activeIndex) {
        return 'past';
    }

    if (index === activeIndex) {
        return 'active';
    }

    return 'future';
}

export function getLineClassName(state: LyricLineState): string {
    return cn(
        'w-full transition-all duration-300 whitespace-pre-wrap',
        state === 'active' && 'text-xl font-semibold text-foreground scale-[1.02]',
        state === 'past' && 'text-base text-muted-foreground/45',
        state === 'future' && 'text-base text-muted-foreground/75',
    );
}

export const staticLineClassName =
    'max-w-lg px-4 text-center text-base leading-relaxed text-foreground/85 whitespace-pre-wrap';

export const syncedLineClassName = 'max-w-lg cursor-pointer px-4 text-center';

import type { LyricLine } from '@jellyfin/sdk/lib/generated-client/models';
import { cn } from '@/lib/utils';
import { useSyncedLyrics } from '../hooks/useSyncedLyrics';
import LyricsScrollArea from './LyricsScrollArea';
import { getLineClassName, getLineState, syncedLineClassName } from './lyricsLineStyles';

interface SyncedLinesProps {
    lines: LyricLine[];
    currentTime: number;
    offset?: number | null;
    onLineClick: (startTicks: number) => void;
}

const SyncedLines = ({ lines, currentTime, offset, onLineClick }: SyncedLinesProps) => {
    const {
        activeIndex,
        containerRef,
        edgePadding,
        enableAutoScroll,
        onUserScroll,
        scrollActiveLineIntoView,
        setLineRef,
    } = useSyncedLyrics({
        lines,
        currentTime,
        offset,
        enabled: true,
    });

    return (
        <LyricsScrollArea
            containerRef={containerRef}
            edgePadding={edgePadding}
            onUserScroll={onUserScroll}
        >
            {lines.map((line, index) => {
                const state = getLineState(index, activeIndex);
                const start = line.Start ?? 0;

                return (
                    <button
                        key={`${index}-${line.Text}`}
                        ref={(element) => setLineRef(index, element)}
                        type="button"
                        className={cn(getLineClassName(state), syncedLineClassName)}
                        onClick={() => {
                            enableAutoScroll();
                            onLineClick(start);
                            requestAnimationFrame(() => scrollActiveLineIntoView('smooth'));
                        }}
                    >
                        {line.Text}
                    </button>
                );
            })}
        </LyricsScrollArea>
    );
};

export default SyncedLines;

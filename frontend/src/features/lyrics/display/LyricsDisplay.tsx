import type { ProcessedLyrics } from '../types';
import StaticLines from './StaticLines';
import SyncedLines from './SyncedLines';

interface LyricsDisplayProps {
    lyrics: ProcessedLyrics;
    currentTime: number;
    onLineClick: (startTicks: number) => void;
}

const LyricsDisplay = ({ lyrics, currentTime, onLineClick }: LyricsDisplayProps) => {
    if (lyrics.isSynced) {
        return (
            <SyncedLines
                lines={lyrics.lines}
                currentTime={currentTime}
                offset={lyrics.offset}
                onLineClick={onLineClick}
            />
        );
    }

    return <StaticLines lines={lyrics.lines} />;
};

export default LyricsDisplay;

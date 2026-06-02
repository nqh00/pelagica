import type { LyricLine } from '@jellyfin/sdk/lib/generated-client/models';
import { useTranslation } from 'react-i18next';
import { useLyricsEdgePadding } from '../hooks/useLyricsEdgePadding';
import LyricsScrollArea from './LyricsScrollArea';
import { staticLineClassName } from './lyricsLineStyles';

interface StaticLinesProps {
    lines: LyricLine[];
}

const StaticLines = ({ lines }: StaticLinesProps) => {
    const { t } = useTranslation('player');
    const { containerRef, edgePadding } = useLyricsEdgePadding();

    return (
        <LyricsScrollArea containerRef={containerRef} edgePadding={edgePadding}>
            <p className="text-xs text-muted-foreground">{t('unsyncedLyrics')}</p>
            {lines.map((line, index) => (
                <p key={`${index}-${line.Text}`} className={staticLineClassName}>
                    {line.Text}
                </p>
            ))}
        </LyricsScrollArea>
    );
};

export default StaticLines;

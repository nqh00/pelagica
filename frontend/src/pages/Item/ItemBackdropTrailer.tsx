import { useLocalTrailers } from '@/hooks/api/useLocalTrailers';
import { getDirectStreamUrl } from '@/utils/jellyfinUrls';
import { Volume2, VolumeOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ItemBackdropTrailerProps {
    itemId: string;
    enabled: boolean;
}

const START_DELAY_MS = 3000;

const ItemBackdropTrailer = ({ itemId, enabled }: ItemBackdropTrailerProps) => {
    const { data: localTrailers } = useLocalTrailers(itemId, enabled);
    const firstTrailer = localTrailers?.[0];
    const videoRef = useRef<HTMLVideoElement>(null);
    const [canPlay, setCanPlay] = useState(false);
    const [muted, setMuted] = useState(true);
    const [shouldPlay, setShouldPlay] = useState(false);

    const trailerUrl = firstTrailer?.Id
        ? getDirectStreamUrl(firstTrailer.Id, { mediaSourceId: firstTrailer.Id })
        : null;

    useEffect(() => {
        if (!enabled || !trailerUrl) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShouldPlay(false);
            return;
        }
        const timer = setTimeout(() => setShouldPlay(true), START_DELAY_MS);
        return () => clearTimeout(timer);
    }, [enabled, trailerUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !shouldPlay) return;

        video.muted = muted;
        video.play().catch(() => {
            if (!video.muted) {
                video.muted = true;
                setMuted(true);
                video.play().catch(() => {});
            }
        });
    }, [shouldPlay, muted]);

    if (!enabled || !trailerUrl || !shouldPlay) return null;

    const MuteIcon = muted ? VolumeOff : Volume2;

    return (
        <>
            <video
                ref={videoRef}
                src={trailerUrl}
                muted={muted}
                loop
                autoPlay
                playsInline
                onCanPlay={() => setCanPlay(true)}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                style={{ opacity: canPlay ? 1 : 0 }}
            />
            {canPlay && (
                <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    className="absolute bottom-4 right-4 z-20 bg-black/60 hover:bg-black/80 rounded-full p-2 pointer-events-auto transition-colors"
                >
                    <MuteIcon className="w-4 h-4 text-white" />
                </button>
            )}
        </>
    );
};

export default ItemBackdropTrailer;

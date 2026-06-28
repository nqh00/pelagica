import { useEffect, useState } from 'react';

export function formatSleepFadeRemaining(ms: number): string {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getSleepFadeRemainingMs(
    startedAt: number | null,
    durationMs: number,
    enabled: boolean
): number | null {
    if (!enabled || startedAt === null || durationMs <= 0) return null;

    return Math.max(0, durationMs - (Date.now() - startedAt));
}

export function useSleepFadeRemainingMs(
    startedAt: number | null,
    durationMs: number,
    enabled: boolean
): number | null {
    const [, setTick] = useState(0);

    useEffect(() => {
        if (!enabled || startedAt === null || durationMs <= 0) return;

        const intervalId = setInterval(() => setTick((tick) => tick + 1), 1000);
        return () => clearInterval(intervalId);
    }, [startedAt, durationMs, enabled]);

    return getSleepFadeRemainingMs(startedAt, durationMs, enabled);
}

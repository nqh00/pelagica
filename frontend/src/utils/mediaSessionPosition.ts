const TICKS_PER_SECOND = 10_000_000;

export interface MediaSessionPositionState {
    duration: number;
    position: number;
    playbackRate: number;
}

export function ticksToSeconds(ticks: number): number {
    return ticks / TICKS_PER_SECOND;
}

export function clampPlaybackTicks(currentTimeTicks: number, durationTicks: number): number {
    if (!Number.isFinite(currentTimeTicks) || currentTimeTicks < 0) return 0;
    if (!Number.isFinite(durationTicks) || durationTicks <= 0) return Math.max(0, currentTimeTicks);

    return Math.min(Math.max(0, currentTimeTicks), durationTicks);
}

export function buildMediaSessionPositionState(
    currentTimeTicks: number,
    durationTicks: number,
    playbackRate = 1
): MediaSessionPositionState | null {
    const durationSec = ticksToSeconds(durationTicks);
    if (!Number.isFinite(durationSec) || durationSec <= 0) return null;

    const clampedTicks = clampPlaybackTicks(currentTimeTicks, durationTicks);
    const positionSec = ticksToSeconds(clampedTicks);

    if (!Number.isFinite(positionSec) || positionSec < 0 || positionSec > durationSec) {
        return null;
    }

    const rate = Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1;

    return {
        duration: durationSec,
        position: positionSec,
        playbackRate: rate,
    };
}

export function setSafeMediaSessionPositionState(
    currentTimeTicks: number,
    durationTicks: number,
    playbackRate = 1
): void {
    if (!('mediaSession' in navigator)) return;

    const positionState = buildMediaSessionPositionState(
        currentTimeTicks,
        durationTicks,
        playbackRate
    );
    if (!positionState) return;

    try {
        navigator.mediaSession.setPositionState(positionState);
    } catch (error) {
        console.warn('MediaSession.setPositionState failed:', error, positionState);
    }
}

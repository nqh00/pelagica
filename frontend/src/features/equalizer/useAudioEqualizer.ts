import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import {
    SLEEP_FADE_HIGH_SHELF_END,
    SLEEP_FADE_HIGH_SHELF_START,
    SLEEP_FADE_LOWPASS_END,
    SLEEP_FADE_LOWPASS_START,
    type EqualizerBand,
    lerp,
} from './presets';

interface UseAudioEqualizerOptions {
    audioRef: RefObject<HTMLAudioElement>;
    bands: EqualizerBand[];
    isSleepPreset: boolean;
    sleepFadeEnabled: boolean;
    sleepFadeDurationMs: number;
    volume: number;
    isPlaying: boolean;
    onSleepFadeComplete?: () => void;
}

interface EqualizerGraph {
    context: AudioContext;
    source: MediaElementAudioSourceNode;
    filters: BiquadFilterNode[];
    sleepLowPass: BiquadFilterNode;
    gainNode: GainNode;
}

function applyBandToFilter(filter: BiquadFilterNode, band: EqualizerBand) {
    filter.type = band.type;
    filter.frequency.value = band.frequency;
    filter.gain.value = band.gain;
    if (band.Q !== undefined) {
        filter.Q.value = band.Q;
    }
}

export function useAudioEqualizer({
    audioRef,
    bands,
    isSleepPreset,
    sleepFadeEnabled,
    sleepFadeDurationMs,
    volume,
    isPlaying,
    onSleepFadeComplete,
}: UseAudioEqualizerOptions) {
    const graphRef = useRef<EqualizerGraph | null>(null);
    const sleepFadeStartedAtRef = useRef<number | null>(null);
    const sleepFadeCompletedRef = useRef(false);
    const fadeFrameRef = useRef<number | null>(null);
    const initAttemptedRef = useRef(false);
    const [equalizerAvailable, setEqualizerAvailable] = useState(true);

    const initGraph = useCallback((): EqualizerGraph | null => {
        if (graphRef.current) return graphRef.current;

        const audio = audioRef.current;
        if (!audio) return null;

        try {
            audio.crossOrigin = 'anonymous';

            const context = new AudioContext();
            const source = context.createMediaElementSource(audio);
            const filters = Array.from({ length: 5 }, () => context.createBiquadFilter());
            const sleepLowPass = context.createBiquadFilter();
            sleepLowPass.type = 'lowpass';
            sleepLowPass.frequency.value = SLEEP_FADE_LOWPASS_START;
            sleepLowPass.Q.value = 0.7;

            const gainNode = context.createGain();

            source.connect(filters[0]!);
            for (let i = 0; i < filters.length - 1; i++) {
                filters[i]!.connect(filters[i + 1]!);
            }
            filters[filters.length - 1]!.connect(sleepLowPass);
            sleepLowPass.connect(gainNode);
            gainNode.connect(context.destination);

            audio.volume = 1;

            const graph: EqualizerGraph = {
                context,
                source,
                filters,
                sleepLowPass,
                gainNode,
            };
            graphRef.current = graph;
            return graph;
        } catch (error) {
            console.warn('Audio equalizer unavailable, falling back to direct playback:', error);
            return null;
        }
    }, [audioRef]);

    const ensureGraph = useCallback(() => {
        const graph = initGraph();
        if (!initAttemptedRef.current) {
            initAttemptedRef.current = true;
            setEqualizerAvailable(graph !== null);
        }
        return graph;
    }, [initGraph]);

    const resumeContext = useCallback(async () => {
        const graph = ensureGraph();
        if (graph && graph.context.state === 'suspended') {
            await graph.context.resume();
        }
    }, [ensureGraph]);

    const applyBands = useCallback(
        (activeBands: EqualizerBand[], fadeProgress = 0) => {
            const graph = graphRef.current;
            if (!graph) return;

            activeBands.forEach((band, index) => {
                const filter = graph.filters[index];
                if (!filter) return;

                const isHighShelf = index === activeBands.length - 1 && band.type === 'highshelf';
                if (isSleepPreset && isHighShelf && sleepFadeEnabled) {
                    applyBandToFilter(filter, {
                        ...band,
                        gain: lerp(
                            SLEEP_FADE_HIGH_SHELF_START,
                            SLEEP_FADE_HIGH_SHELF_END,
                            fadeProgress
                        ),
                    });
                } else {
                    applyBandToFilter(filter, band);
                }
            });

            if (isSleepPreset && sleepFadeEnabled) {
                graph.sleepLowPass.frequency.value = lerp(
                    SLEEP_FADE_LOWPASS_START,
                    SLEEP_FADE_LOWPASS_END,
                    fadeProgress
                );
            } else {
                graph.sleepLowPass.type = 'lowpass';
                graph.sleepLowPass.frequency.value = SLEEP_FADE_LOWPASS_START;
            }
        },
        [isSleepPreset, sleepFadeEnabled]
    );

    const applyVolume = useCallback(
        (fadeProgress = 0) => {
            const graph = graphRef.current;
            const audio = audioRef.current;

            const sleepActive = isSleepPreset && sleepFadeEnabled;
            const effectiveVolume = sleepActive
                ? volume * lerp(1, 0, fadeProgress)
                : volume;

            if (graph) {
                graph.gainNode.gain.value = effectiveVolume;
            } else if (audio) {
                audio.volume = effectiveVolume;
            }
        },
        [audioRef, isSleepPreset, sleepFadeEnabled, volume]
    );

    const getFadeProgress = useCallback(() => {
        if (!sleepFadeStartedAtRef.current) return 0;
        const elapsed = Date.now() - sleepFadeStartedAtRef.current;
        return Math.min(1, elapsed / sleepFadeDurationMs);
    }, [sleepFadeDurationMs]);

    const resetSleepFadeSession = useCallback(() => {
        sleepFadeStartedAtRef.current = null;
        sleepFadeCompletedRef.current = false;
        if (fadeFrameRef.current !== null) {
            cancelAnimationFrame(fadeFrameRef.current);
            fadeFrameRef.current = null;
        }
    }, []);

    const startSleepFadeSession = useCallback(() => {
        sleepFadeCompletedRef.current = false;
        sleepFadeStartedAtRef.current = Date.now();
    }, []);

    const updateSleepFade = useCallback(() => {
        const progress = getFadeProgress();
        applyBands(bands, progress);
        applyVolume(progress);

        if (progress >= 1 && !sleepFadeCompletedRef.current) {
            sleepFadeCompletedRef.current = true;
            onSleepFadeComplete?.();
            resetSleepFadeSession();
        }
    }, [applyBands, applyVolume, bands, getFadeProgress, onSleepFadeComplete, resetSleepFadeSession]);

    useEffect(() => {
        if (isSleepPreset && sleepFadeEnabled) {
            if (sleepFadeStartedAtRef.current === null) {
                startSleepFadeSession();
            }
        } else {
            resetSleepFadeSession();
        }
    }, [isSleepPreset, sleepFadeEnabled, resetSleepFadeSession, startSleepFadeSession]);

    useEffect(() => {
        if (!isSleepPreset || !sleepFadeEnabled) return;
        resetSleepFadeSession();
        startSleepFadeSession();
    }, [sleepFadeDurationMs, isSleepPreset, sleepFadeEnabled, resetSleepFadeSession, startSleepFadeSession]);

    useEffect(() => {
        initGraph();
        const progress = isSleepPreset && sleepFadeEnabled ? getFadeProgress() : 0;
        applyBands(bands, progress);
        applyVolume(progress);
    }, [
        bands,
        isSleepPreset,
        sleepFadeEnabled,
        volume,
        applyBands,
        applyVolume,
        getFadeProgress,
        initGraph,
    ]);

    useEffect(() => {
        if (!isPlaying || !isSleepPreset || !sleepFadeEnabled) {
            if (fadeFrameRef.current !== null) {
                cancelAnimationFrame(fadeFrameRef.current);
                fadeFrameRef.current = null;
            }
            return;
        }

        const tick = () => {
            updateSleepFade();
            fadeFrameRef.current = requestAnimationFrame(tick);
        };

        fadeFrameRef.current = requestAnimationFrame(tick);

        return () => {
            if (fadeFrameRef.current !== null) {
                cancelAnimationFrame(fadeFrameRef.current);
                fadeFrameRef.current = null;
            }
        };
    }, [isPlaying, isSleepPreset, sleepFadeEnabled, updateSleepFade]);

    return {
        equalizerAvailable,
        resumeContext,
        resetSleepFadeSession,
    };
}

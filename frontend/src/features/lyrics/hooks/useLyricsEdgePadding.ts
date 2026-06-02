import { useEffect, useRef, useState } from 'react';

export function useLyricsEdgePadding(enabled = true) {
    const [edgePadding, setEdgePadding] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !enabled) {
            return;
        }

        const updatePadding = () => {
            setEdgePadding(Math.max(container.clientHeight / 2 - 24, 0));
        };

        updatePadding();

        const observer = new ResizeObserver(updatePadding);
        observer.observe(container);

        return () => observer.disconnect();
    }, [enabled]);

    return { containerRef, edgePadding };
}

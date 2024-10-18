import React, { useEffect, useRef } from "react";
import { useEditorContext } from "../../context/EditorContext";

interface ZoomableContainerProps {
    children: React.ReactNode;
    pixelsPerSecond: number;
    setScrollLeft: React.Dispatch<React.SetStateAction<number>>;
    localPlaybackPosition: number;
}

const ZoomableContainer: React.FC<ZoomableContainerProps> = ({
    children,
    pixelsPerSecond,
    setScrollLeft,
    localPlaybackPosition,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const { zoom, setZoom, timelinePanelWidth } = useEditorContext();
    let localZoom = zoom;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            const container = containerRef.current;
            if (!container) return;

            if (event.altKey) {
                const mouseX =
                    event.clientX - container.getBoundingClientRect().left;
                const relativeMouseX = mouseX + container.scrollLeft;
                const percentPosition =
                    relativeMouseX / (timelinePanelWidth || 1);

                localZoom += event.deltaY * -0.002;
                localZoom = Math.min(Math.max(localZoom, 0.5), 10);
                const clampedZoom = localZoom;

                const newTimelineWidth = 60 * pixelsPerSecond * clampedZoom;
                const newScrollLeft =
                    percentPosition * newTimelineWidth - mouseX;

                container.scrollLeft = newScrollLeft;
                setScrollLeft(newScrollLeft);
                setZoom(clampedZoom);
            } else {
                container.scrollLeft += event.deltaY;
                setScrollLeft(container.scrollLeft);
            }
        };

        container.addEventListener("wheel", handleWheel);
        return () => container.removeEventListener("wheel", handleWheel);
    }, [setZoom, setScrollLeft, timelinePanelWidth, pixelsPerSecond]);

    useEffect(() => {
        localZoom = zoom; // Aktualizacja lokalnej zmiennej zoom po zmianie zoomu
    }, [zoom]);

    // Nowy useEffect do śledzenia wskaźnika odtwarzania
    useEffect(() => {
        if (containerRef.current) {
            const indicatorPositionPx =
                localPlaybackPosition * pixelsPerSecond * zoom;
            const container = containerRef.current;
            const timelineVisibleStartPx = container.scrollLeft;
            const timelineVisibleEndPx =
                container.scrollLeft + timelinePanelWidth;

            if (indicatorPositionPx < timelineVisibleStartPx) {
                // Przewijanie w lewo, gdy wskaźnik wyjdzie poza widoczny zakres z lewej strony
                const newScrollLeft = Math.max(0, indicatorPositionPx - 10);
                container.scrollLeft = newScrollLeft;
                setScrollLeft(newScrollLeft);
            } else if (indicatorPositionPx > timelineVisibleEndPx) {
                // Przewijanie w prawo, gdy wskaźnik wyjdzie poza widoczny zakres z prawej strony
                const newScrollLeft = indicatorPositionPx - 10;
                container.scrollLeft = newScrollLeft;
                setScrollLeft(newScrollLeft);
            }
        }
    }, [
        localPlaybackPosition,
        zoom,
        pixelsPerSecond,
        timelinePanelWidth,
        setScrollLeft,
    ]);

    return (
        <div className="timeline-panel" ref={containerRef}>
            {children}
        </div>
    );
};

export default ZoomableContainer;

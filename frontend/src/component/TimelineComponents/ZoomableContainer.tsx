import React, { useEffect, useRef, useState, ReactElement } from "react";
import TimelineTrackContainer from "../TimelineComponents/TimelineTrackContainer";

interface ZoomableContainerProps {
    children: React.ReactNode;
    zoom: number;
    setZoom: React.Dispatch<React.SetStateAction<number>>;
    setMouseScrollOffset: React.Dispatch<React.SetStateAction<number>>;
    timelineWidth: number;
    pixelsPerSecond: number;
    setScrollLeft: React.Dispatch<React.SetStateAction<number>>;
    localPlaybackPosition: number;
}

const ZoomableContainer: React.FC<ZoomableContainerProps> = ({
    children,
    zoom,
    setZoom,
    setMouseScrollOffset,
    timelineWidth,
    pixelsPerSecond,
    setScrollLeft,
    localPlaybackPosition,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();

            if (event.altKey && container) {
                const mouseX =
                    event.clientX - container.getBoundingClientRect().left;
                const relativeMouseX = mouseX + container.scrollLeft;
                const percentPosition = relativeMouseX / (timelineWidth || 1);

                setZoom((prevZoom) => {
                    const newZoom = prevZoom + event.deltaY * -0.001;
                    const clampedZoom = Math.min(Math.max(newZoom, 0.5), 10);
                    const newTimelineWidth = 60 * pixelsPerSecond * clampedZoom;
                    const newScrollLeft =
                        percentPosition * newTimelineWidth - mouseX;
                    container.scrollLeft = newScrollLeft;

                    // console.log("scrollLeft:", newScrollLeft);
                    setScrollLeft(newScrollLeft);
                    return clampedZoom;
                });
            } else if (container) {
                container.scrollLeft += event.deltaY;
                setMouseScrollOffset(event.deltaY);

                // console.log("Scroll left:", container.scrollLeft);
                setScrollLeft(container.scrollLeft);
            }
        };

        if (container) {
            container.addEventListener("wheel", handleWheel);
            return () => container.removeEventListener("wheel", handleWheel);
        }
    }, [timelineWidth, pixelsPerSecond, zoom]);

    useEffect(() => {
        const container = containerRef.current;

        if (container) {
            const playbackIndicatorPosition =
                localPlaybackPosition * pixelsPerSecond * zoom;

            const containerStart = container.scrollLeft;
            const containerEnd = container.scrollLeft + container.offsetWidth;

            // Jeśli wskaźnik odtwarzania jest poza widocznym obszarem, przewiń do niego
            if (
                playbackIndicatorPosition < containerStart ||
                playbackIndicatorPosition > containerEnd
            ) {
                const newScrollPosition = playbackIndicatorPosition - 10;
                container.scrollLeft = newScrollPosition;
                setScrollLeft(newScrollPosition);
            }
        }
    }, [localPlaybackPosition, zoom, pixelsPerSecond]);

    return (
        <div className="timeline-panel" ref={containerRef}>
            {children}
        </div>
    );
};

export default ZoomableContainer;

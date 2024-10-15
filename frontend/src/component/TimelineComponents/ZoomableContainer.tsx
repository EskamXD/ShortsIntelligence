import React, { useEffect, useRef, useState, ReactElement } from "react";
import TimelineTrackContainer from "../TimelineComponents/TimelineTrackContainer";
import { useEditorContext } from "../../context/EditorContext";

interface ZoomableContainerProps {
    children: React.ReactNode;
    setMouseScrollOffset: React.Dispatch<React.SetStateAction<number>>;
    pixelsPerSecond: number;
    setScrollLeft: React.Dispatch<React.SetStateAction<number>>;
}

const ZoomableContainer: React.FC<ZoomableContainerProps> = ({
    children,
    setMouseScrollOffset,
    pixelsPerSecond,
    setScrollLeft,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const { zoom, setZoom, timelinePanelWidth } = useEditorContext();

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            if (event.altKey) {
                const mouseX =
                    event.clientX - container.getBoundingClientRect().left;
                const relativeMouseX = mouseX + container.scrollLeft;
                const percentPosition =
                    relativeMouseX / (timelinePanelWidth || 1);

                const newZoom = zoom + event.deltaY * -0.001;
                const clampedZoom = Math.min(Math.max(newZoom, 0.5), 10);
                const newTimelineWidth = 60 * pixelsPerSecond * clampedZoom;
                const newScrollLeft =
                    percentPosition * newTimelineWidth - mouseX;

                container.scrollLeft = newScrollLeft;
                setScrollLeft(newScrollLeft);

                setZoom(clampedZoom);
            } else {
                container.scrollLeft += event.deltaY;
                setMouseScrollOffset(event.deltaY);
                setScrollLeft(container.scrollLeft);
            }
        };

        container.addEventListener("wheel", handleWheel);
        return () => container.removeEventListener("wheel", handleWheel);
    }, [
        setZoom,
        setScrollLeft,
        setMouseScrollOffset,
        timelinePanelWidth,
        pixelsPerSecond,
    ]);

    return (
        <div className="timeline-panel" ref={containerRef}>
            {children}
        </div>
    );
};

export default ZoomableContainer;

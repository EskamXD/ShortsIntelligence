import React, { useEffect, useState } from "react";
import TimelineTrack from "../TimelineComponents/TimelineTrack";
import { useEditorContext } from "../../context/EditorContext";
import { v4 as uuidv4 } from "uuid";
import { TrackItem } from "../../interfaces";

interface TimelineTrackContainerProps {
    pixelsPerSecond: number;
    scrollLeft: number;
    localPlaybackPosition: number;
    handleMouseDown: (event: React.MouseEvent) => void;
}

const TimelineTrackContainer: React.FC<TimelineTrackContainerProps> = ({
    pixelsPerSecond,
    scrollLeft,
    localPlaybackPosition,
    handleMouseDown,
}) => {
    const { timelineItems, setTimelineItems, zoom } = useEditorContext();

    useEffect(() => {
        // Sprawdzamy, czy aktualnie odtwarzane są elementy wideo
        timelineItems.forEach((item) => {
            const itemStartPositionInPixels = item.leftOffset;
            const itemEndPositionInPixels =
                itemStartPositionInPixels + item.itemWidth;

            if (
                localPlaybackPosition >= itemStartPositionInPixels &&
                localPlaybackPosition <= itemEndPositionInPixels
            ) {
                // console.clear();
                // console.log(`Playing video: ${item.name}`);
            }
        });
    }, [localPlaybackPosition, timelineItems]);

    // Funkcja do obsługi przetwarzania plików
    const handleFileProcessed = (
        file: { name: string; duration: number },
        trackType: "video" | "audio"
    ) => {
        console.log(`File processed: ${file.name}`);

        //generate unique id for new item
        const id = uuidv4();

        const itemWidth = file.duration * pixelsPerSecond * zoom;

        const lastTrackItem = timelineItems
            .filter((item) => item.type === trackType)
            .slice(-1)[0];

        const leftOffset = lastTrackItem
            ? lastTrackItem.leftOffset + lastTrackItem.itemWidth
            : 0;

        const startPosition = leftOffset;

        const newItem = {
            id: id,
            type: trackType,
            name: file.name,
            duration: file.duration,
            leftOffset,
            itemWidth,
            startPosition,
        } as TrackItem;

        // push new item to timelineItems
        console.log("Adding new item to timeline:", newItem);
        setTimelineItems((prevItems: TrackItem[]) => [...prevItems, newItem]);
    };

    return (
        <div
            id="timeline-track-container"
            className="d-flex flex-column"
            style={{ width: `${6000 * zoom}px` }}
            onClick={handleMouseDown}>
            <TimelineTrack
                trackType="video"
                pixelsPerSecond={pixelsPerSecond}
                scrollLeft={scrollLeft}
                onFileProcessed={handleFileProcessed}
                handleMouseDown={handleMouseDown}
            />
            <TimelineTrack
                trackType="audio"
                pixelsPerSecond={pixelsPerSecond}
                scrollLeft={scrollLeft}
                onFileProcessed={handleFileProcessed}
                handleMouseDown={handleMouseDown}
            />
        </div>
    );
};

export default TimelineTrackContainer;


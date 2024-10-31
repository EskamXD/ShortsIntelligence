import React from "react";
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
    handleMouseDown,
}) => {
    const { timelineTrackContainerWidthPx, timelineItems, setTimelineItems } =
        useEditorContext();

    const handleFileProcessing = (file: File) => {
        const id = uuidv4();
        const lastTrackItem = timelineItems
            .filter(
                (item) =>
                    item.type ===
                    (file.type.startsWith("video/") ? "video" : "audio")
            )
            .slice(-1)[0];

        const processDurationAndAddItem = (
            duration: number,
            trackType: "video" | "audio"
        ) => {
            const durationInPx = duration * pixelsPerSecond;
            const startPosition = lastTrackItem
                ? lastTrackItem.startPosition + lastTrackItem.durationInPx
                : 0;

            const newItem: TrackItem = {
                id,
                type: trackType,
                file,
                name:
                    trackType === "audio" ? `${file.name} (audio)` : file.name,
                durationInS: duration,
                durationInPx,
                startPosition,
                startTime: 0,
                endPosition: startPosition + durationInPx,
            };

            console.log("Adding new item to timeline:", newItem);
            setTimelineItems((prevItems: TrackItem[]) => [
                ...prevItems,
                newItem,
            ]);
        };

        if (file.type.startsWith("video/")) {
            const videoElement = document.createElement("video");
            videoElement.src = URL.createObjectURL(file);

            videoElement.onloadedmetadata = () => {
                const duration = videoElement.duration;
                processDurationAndAddItem(duration, "video");

                videoElement.onplay = () => {
                    const audioContext = new (window.AudioContext ||
                        (window as any).webkitAudioContext)();
                    const videoSource =
                        audioContext.createMediaElementSource(videoElement);

                    if (videoSource.mediaElement) {
                        processDurationAndAddItem(duration, "audio");
                    }
                };

                videoElement.play().then(() => videoElement.pause());
            };
        } else if (file.type.startsWith("audio/")) {
            const audioElement = document.createElement("audio");
            audioElement.src = URL.createObjectURL(file);

            audioElement.onloadedmetadata = () => {
                const duration = audioElement.duration;
                processDurationAndAddItem(duration, "audio");
            };
        }
    };

    return (
        <div
            id="timeline-track-container"
            className="d-flex flex-column"
            style={{ width: `${timelineTrackContainerWidthPx}px` }}
            onClick={handleMouseDown}>
            <TimelineTrack
                trackType="video"
                pixelsPerSecond={pixelsPerSecond}
                scrollLeft={scrollLeft}
                handleFileProcessing={handleFileProcessing}
            />
            <TimelineTrack
                trackType="audio"
                pixelsPerSecond={pixelsPerSecond}
                scrollLeft={scrollLeft}
                handleFileProcessing={handleFileProcessing}
            />
        </div>
    );
};

export default TimelineTrackContainer;

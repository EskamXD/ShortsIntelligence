import React, { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../../context/EditorContext"; // Import kontekstu
import Draggable, { DraggableEvent } from "react-draggable";

interface TimelineTrackProps {
    trackType: "video" | "audio";
    pixelsPerSecond: number;
    scrollLeft: number;
    onFileProcessed: (
        file: { name: string; duration: number },
        trackType: "video" | "audio"
    ) => void;
    handleMouseDown: (event: React.MouseEvent) => void;
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({
    trackType,
    pixelsPerSecond,
    scrollLeft,
    onFileProcessed,
    // handleMouseDown,
}) => {
    const {
        files,
        timelinePanelWidth,
        timelineTrackContainerWidthPx,
        timelineItems,
        setTimelineItems,
    } = useEditorContext();
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [draggedItemId, setDraggedItemId] = useState<string>("");
    const [draggedPosition, setDraggedPosition] = useState<number>(0);
    const textMeasureRef = useRef<HTMLDivElement | null>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);

    const handleDragStart = (event: DraggableEvent, data: any, id: string) => {
        console.log("Drag start x:", data.x);
        setDraggedPosition(data.x);
        setIsDragging(true);
        setDraggedItemId(id);
    };

    const handleDrag = (event: DraggableEvent, data: any) => {};

    const handleDragStop = (event: DraggableEvent, data: any, id: string) => {
        const item = timelineItems.find((item) => item.id === id);
        if (!item) {
            return;
        }

        const dataXdifference = data.x - draggedPosition;
        let newLeftOffset = item.leftOffset + dataXdifference;

        if (
            dataXdifference + item.leftOffset + item.itemWidth >
            timelineTrackContainerWidthPx
        ) {
            newLeftOffset = timelineTrackContainerWidthPx - item.itemWidth - 3;
        } else if (dataXdifference + item.leftOffset < 0) {
            newLeftOffset = 0;
        }

        const newItems = timelineItems.map((item) =>
            item.id === id ? { ...item, leftOffset: newLeftOffset } : item
        );

        setTimelineItems(newItems);

        setIsDragging(false);
        setDraggedItemId("");
    };

    const handleDragEnter = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDraggingOver(true);
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    const handleDragLeave = () => {
        setIsDraggingOver(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDraggingOver(false);

        const fileName = event.dataTransfer.getData("text/plain");

        const file = files.find((file) => file.name === fileName);
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        if (file.type.startsWith("video/")) {
            const videoElement = document.createElement("video");
            videoElement.src = URL.createObjectURL(file);

            videoElement.onloadedmetadata = () => {
                const duration = videoElement.duration;

                onFileProcessed({ name: file.name, duration }, "video");

                videoElement.onplay = () => {
                    const audioContext = new (window.AudioContext ||
                        (window as any).webkitAudioContext)();
                    const videoSource =
                        audioContext.createMediaElementSource(videoElement);

                    if (videoSource.mediaElement) {
                        onFileProcessed(
                            { name: `${file.name} (audio)`, duration },
                            "audio"
                        );
                    }
                };

                videoElement.play().then(() => {
                    videoElement.pause();
                });
            };
        } else if (file.type.startsWith("audio/")) {
            const audioElement = document.createElement("audio");
            audioElement.src = URL.createObjectURL(file);

            audioElement.onloadedmetadata = () => {
                const duration = audioElement.duration;

                onFileProcessed({ name: file.name, duration }, "audio");
            };
        }
    };

    const totalDuration = timelineItems.reduce(
        (sum, item) => sum + item.duration,
        0
    );

    const minDuration = 60;
    const containerWidth =
        Math.max(totalDuration, minDuration) * pixelsPerSecond;

    const measureTextWidth = (text: string) => {
        if (textMeasureRef.current) {
            textMeasureRef.current.innerText = text;
            const width = textMeasureRef.current.getBoundingClientRect().width;
            return width;
        }
        return 0;
    };

    const formatTime = (timeInSeconds: number, fps: number) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        const frames = Math.floor((timeInSeconds % 1) * fps);

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
        )}:${String(seconds).padStart(2, "0")}:${String(frames).padStart(
            2,
            "0"
        )}`;
    };

    return (
        <div
            ref={trackRef}
            className="timeline-track"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                width: `${containerWidth}px`,
                border: isDraggingOver
                    ? "2px dashed #2d8ceb"
                    : "2px solid #ccc",
                backgroundColor: isDraggingOver
                    ? "rgba(45, 140, 235, 0.1)"
                    : "transparent",
            }}>
            <div
                ref={textMeasureRef}
                style={{
                    position: "absolute",
                    visibility: "hidden",
                    whiteSpace: "nowrap",
                }}
            />

            {timelineItems
                .filter((item) => item.type === trackType)
                .map((item, index) => {
                    const itemText = `${item.name} - ${formatTime(
                        item.duration,
                        30
                    )}`;
                    const textWidth = measureTextWidth(itemText);
                    const left = item.leftOffset;

                    const maxTextLeft = item.itemWidth - textWidth - 10;

                    let textLeft = 10;
                    if (left + 10 < scrollLeft + timelinePanelWidth) {
                        textLeft = Math.max(
                            10,
                            Math.min(scrollLeft + 10 - left, maxTextLeft)
                        );
                    }

                    return (
                        <Draggable
                            key={item.id}
                            axis="x"
                            position={{ x: left, y: 0 }}
                            onStart={(event, data) =>
                                handleDragStart(event, data, item.id)
                            }
                            onDrag={(event, data) => handleDrag(event, data)}
                            onStop={(event, data) =>
                                handleDragStop(event, data, item.id)
                            }>
                            <div
                                id={item.id}
                                key={`dropped-${index}`}
                                className="media-item"
                                style={{
                                    backgroundColor:
                                        trackType === "video"
                                            ? "darkslateblue"
                                            : "darkgreen",
                                    width: `${
                                        item.duration * pixelsPerSecond
                                    }px`,
                                    borderColor:
                                        trackType === "video"
                                            ? "#241e45"
                                            : "#084808",
                                    opacity:
                                        isDragging && draggedItemId === item.id
                                            ? 0.5
                                            : 1,
                                }}>
                                <div
                                    className="media-item-text"
                                    style={{
                                        left: `${textLeft}px`,
                                    }}>
                                    {itemText}
                                </div>
                            </div>
                        </Draggable>
                    );
                })}
        </div>
    );
};

export default TimelineTrack;

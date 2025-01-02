import React, { useEffect } from "react";
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

const parseSubtitles = (subtitles: string) => {
    const items: TrackItem[] = [];
    const lines = subtitles.split("\n");

    let startTime = 0;
    let endTime = 0;
    let text = "";

    lines.forEach((line) => {
        const timeMatch = line.match(
            /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/
        );
        if (timeMatch) {
            // Jeśli jest tekst do zapisania, dodajemy go jako element
            if (text) {
                items.push({
                    id: uuidv4(),
                    type: "subtitles",
                    file: null,
                    name: text.trim(),
                    durationInS: endTime - startTime,
                    durationInPx: (endTime - startTime) * 100, // Przykładowe przeliczenie
                    startPosition: startTime * 100, // Przykładowe przeliczenie
                    startTime,
                    endPosition: endTime * 100, // Przykładowe przeliczenie
                });
                text = ""; // Reset tekstu
            }

            // Aktualizacja czasu
            startTime = convertToSeconds(timeMatch[1]);
            endTime = convertToSeconds(timeMatch[2]);
        } else if (line.trim()) {
            // Sklejanie linii napisu
            text += `${line} `;
        }
    });

    // Dodaj ostatni element (jeśli istnieje tekst)
    if (text) {
        items.push({
            id: uuidv4(),
            type: "subtitles",
            file: null,
            name: text.trim(),
            durationInS: endTime - startTime,
            durationInPx: (endTime - startTime) * 100,
            startPosition: startTime * 100,
            startTime,
            endPosition: endTime * 100,
        });
    }

    return items;
};

const convertToSeconds = (time: string) => {
    const [hours, minutes, seconds] = time.split(":");
    const [sec, ms] = seconds.split(",");
    return (
        parseInt(hours) * 3600 +
        parseInt(minutes) * 60 +
        parseInt(sec) +
        parseInt(ms) / 1000
    );
};

const TimelineTrackContainer: React.FC<TimelineTrackContainerProps> = ({
    pixelsPerSecond,
    scrollLeft,
    handleMouseDown,
}) => {
    const {
        timelineTrackContainerWidthPx,
        timelineItems,
        setTimelineItems,
        subtitles,
    } = useEditorContext();

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

        if (subtitles) {
            console.group("Parsing subtitles");
            console.log("Parsing subtitles:", subtitles);
            const subtitleItems = parseSubtitles(subtitles);
            console.log("Parsed subtitle items:", subtitleItems);
            setTimelineItems((prevItems) => {
                const existingIds = new Set(prevItems.map((item) => item.id));
                const filteredItems = subtitleItems.filter(
                    (item) => !existingIds.has(item.id)
                );
                return [...prevItems, ...filteredItems];
            });
            console.groupEnd();
        }
    };

    useEffect(() => {
        if (subtitles) {
            const subtitleItems = parseSubtitles(subtitles);
            setTimelineItems((prevItems) => {
                const existingIds = new Set(prevItems.map((item) => item.id));
                const filteredItems = subtitleItems.filter(
                    (item) => !existingIds.has(item.id)
                );
                return [...prevItems, ...filteredItems];
            });
        }
    }, [subtitles, setTimelineItems]);

    return (
        <div
            id="timeline-track-container"
            className="d-flex flex-column"
            style={{ width: `${timelineTrackContainerWidthPx}px` }}
            onClick={handleMouseDown}>
            <TimelineTrack
                trackType="subtitles"
                pixelsPerSecond={pixelsPerSecond}
                scrollLeft={scrollLeft}
                handleFileProcessing={() => {}} // Napisy są już obsługiwane
            />

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

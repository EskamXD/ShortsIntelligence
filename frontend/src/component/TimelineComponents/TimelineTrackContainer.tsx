import React, { useEffect, useState } from "react";
import TimelineTrack from "../TimelineComponents/TimelineTrack";
import { useEditorContext } from "../../context/EditorContext";

interface TrackItem {
    name: string;
    duration: number;
    leftOffset: number; // Pozycja elementu na osi czasu
    widthInPixels: number; // Szerokość elementu w pikselach
}

interface TimelineTrackContainerProps {
    pixelsPerSecond: number;
    scrollLeft: number;
}

const TimelineTrackContainer: React.FC<TimelineTrackContainerProps> = ({
    pixelsPerSecond,
    scrollLeft,
}) => {
    const { zoom } = useEditorContext();

    const [videoTrackItems, setVideoTrackItems] = useState<TrackItem[]>([]);
    const [audioTrackItems, setAudioTrackItems] = useState<TrackItem[]>([]);

    // Funkcja dodająca przetworzony plik do odpowiedniego tracka z leftOffset i widthInPixels
    const handleFileProcessed = (
        file: { name: string; duration: number },
        trackType: "video" | "audio"
    ) => {
        const widthInPixels = file.duration * pixelsPerSecond * zoom;
        const leftOffset = videoTrackItems.length
            ? videoTrackItems[videoTrackItems.length - 1].leftOffset +
              videoTrackItems[videoTrackItems.length - 1].widthInPixels /
                  (pixelsPerSecond * zoom)
            : 0;

        const newItem: TrackItem = {
            name: file.name,
            duration: file.duration,
            leftOffset,
            widthInPixels,
        };

        if (trackType === "video") {
            setVideoTrackItems((prevItems) => [...prevItems, newItem]);
        } else {
            setAudioTrackItems((prevItems) => [...prevItems, newItem]);
        }
    };

    return (
        <div
            className="d-flex flex-column"
            style={{ width: `${6000 * zoom}px` }}>
            <TimelineTrack
                trackType="video"
                trackItems={videoTrackItems}
                pixelsPerSecond={pixelsPerSecond}
                scrollLeft={scrollLeft}
                onFileProcessed={handleFileProcessed}
            />
            <TimelineTrack
                trackType="audio"
                trackItems={audioTrackItems}
                pixelsPerSecond={pixelsPerSecond}
                scrollLeft={scrollLeft}
                onFileProcessed={handleFileProcessed}
            />
        </div>
    );
};

export default TimelineTrackContainer;


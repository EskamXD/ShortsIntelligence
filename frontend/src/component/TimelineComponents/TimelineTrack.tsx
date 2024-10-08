import React, { useEffect } from "react";

interface TimelineTrackProps {
    trackType: "video" | "audio";
    trackItems: { name: string; duration: number }[]; // Dane o długości ścieżki w sekundach
    onDropFile: (file: File, trackType: string) => void;
    timelineOffset: number; // Offset przesunięcia na osi czasu
    zoom: number; // Wartość zoomu
    files: File[];
    pixelsPerSecond: number; // Piksele na sekundę
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({
    trackType,
    trackItems,
    onDropFile,
    timelineOffset,
    zoom,
    files,
    pixelsPerSecond,
}) => {
    // Oblicz sumę długości trwania wszystkich trackItems
    const totalDuration = trackItems.reduce(
        (sum, item) => sum + item.duration,
        0
    );

    // Ustaw minimalną szerokość kontenera jako 60 sekund
    const minDuration = 60;

    // Oblicz szerokość kontenera na podstawie sumy czasu trwania lub minimum 60 sekund
    const containerWidth =
        Math.max(totalDuration, minDuration) * pixelsPerSecond * zoom;

    useEffect(() => {
        console.group("Timeline Track Information");
        console.log("Files:", files);
        console.log("Track Type:", trackType);
        console.log("Track Items:", trackItems);
        console.log("Timeline Offset:", timelineOffset);
        console.log("Zoom:", zoom);
        console.log("Pixels Per Second:", pixelsPerSecond);
        console.log("Total Duration (seconds):", totalDuration);
        console.log("Container Width (px):", containerWidth);
        console.groupEnd();
    }, [
        files,
        trackType,
        trackItems,
        timelineOffset,
        zoom,
        pixelsPerSecond,
        totalDuration,
        containerWidth,
    ]);

    return (
        <div
            className="timeline-track"
            style={{
                position: "relative",
                left: `-${timelineOffset * pixelsPerSecond * zoom}px`, // Przesuwanie ścieżki na podstawie przekazanych danych
                display: "flex",
                alignItems: "center",
                width: `${containerWidth}px`, // Szerokość kontenera, minimum 60 sekund
            }}>
            {trackItems.map((item, index) => (
                <div
                    key={index}
                    style={{
                        backgroundColor:
                            trackType === "video"
                                ? "mediumslateblue"
                                : "lightgreen",
                        width: `${item.duration * pixelsPerSecond * zoom}px`, // Przeliczanie szerokości na podstawie czasu trwania ścieżki
                        height: "30px",
                        borderRadius: "4px",
                        marginLeft: "10px", // Ustawienie odstępu między elementami
                    }}>
                    {item.name} - {item.duration.toFixed(2)}s
                </div>
            ))}
        </div>
    );
};

export default TimelineTrack;

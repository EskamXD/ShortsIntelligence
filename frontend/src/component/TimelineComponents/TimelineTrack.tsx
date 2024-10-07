import React, { useState } from "react";

interface TimelineTrackProps {
    trackType: "video" | "audio";
    trackItems: { name: string; width: number }[];
    onDropFile: (file: File, trackType: string) => void;
    timelineOffset: number;
    zoom: number;
    files: File[];
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({
    trackType,
    trackItems,
    onDropFile,
    timelineOffset,
    zoom,
    files,
}) => {
    const [highlight, setHighlight] = useState(false);

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        const fileName = event.dataTransfer.getData("fileInfo");
        if (!fileName) return;

        // Pobieramy plik z listy przeciągniętych plików
        const file = Array.from(files).find((f) => f.name === fileName);

        if (file && file instanceof File) {
            console.log("Dropped file:", file);
            onDropFile(file, trackType); // Przekazujemy obiekt File do nadrzędnego komponentu
            setHighlight(false);
        } else {
            console.error(
                "Invalid file format. Expected a File object.",
                file,
                typeof file
            );
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault(); // Zapobiegamy domyślnemu zachowaniu, aby umożliwić upuszczanie
    };

    const handleDragStart = (
        event: React.DragEvent<HTMLDivElement>,
        file: File
    ) => {
        // Przekazujemy tylko nazwę pliku
        event.dataTransfer.setData("fileInfo", file.name);
    };

    const handleDragLeave = () => {
        setHighlight(false);
    };

    return (
        <div
            className={`timeline-track ${highlight ? "highlight" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            // onDragStart={(e) => handleDragStart(e, trackItems[0])}
            style={{
                border: "2px dashed #ccc",
                position: "relative",
                left: `-${timelineOffset}px`, // Przesuwanie ścieżki na osi czasu
                padding: "10px",
                minHeight: "50px",
                marginBottom: "10px",
            }}>
            {/* Renderujemy elementy na osi czasu */}
            {trackItems.map((item, index) => (
                <div
                    key={index}
                    style={{
                        backgroundColor:
                            trackType === "video"
                                ? "mediumslateblue"
                                : "lightgreen",
                        width: `${item.width * zoom}px`,
                        height: "30px",
                        borderRadius: "4px",
                        marginBottom: "5px",
                    }}>
                    {item.name}
                </div>
            ))}
        </div>
    );
};

export default TimelineTrack;

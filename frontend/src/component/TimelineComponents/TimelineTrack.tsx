import React, { useRef, useState } from "react";
import { useEditorContext } from "../../context/EditorContext"; // Import kontekstu

interface TimelineTrackProps {
    trackType: "video" | "audio";
    trackItems: { name: string; duration: number }[]; // Dane o długości ścieżki w sekundach
    pixelsPerSecond: number; // Piksele na sekundę
    scrollLeft: number;
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({
    trackType,
    trackItems,
    pixelsPerSecond,
    scrollLeft,
}) => {
    const { zoom, files, timelinePanelWidth } = useEditorContext(); // Pobieramy zoom i files z Contextu
    const [isDragging, setIsDragging] = useState(false); // Stan przeciągania
    const [droppedItems, setDroppedItems] = useState<
        { name: string; duration: number; widthInPixels: number }[]
    >([]); // Stan przechowujący upuszczone elementy
    const textMeasureRef = useRef<HTMLDivElement | null>(null); // Referencja do elementu mierzącego szerokość tekstu

    // Funkcja snapowania (np. co 1 sekundę), z uwzględnieniem długości filmu
    const snapToGrid = (position: number, itemWidth: number) => {
        const snapInterval = pixelsPerSecond; // Przyciąganie co sekundę
        const maxPosition = containerWidth - itemWidth; // Unikamy wyjścia poza oś czasu

        const snappedPosition =
            Math.round(position / snapInterval) * snapInterval;
        return Math.min(snappedPosition, maxPosition); // Ograniczenie do szerokości osi
    };

    // Funkcje obsługujące przeciąganie elementu
    const handleDragStart = (event: React.DragEvent, index: number) => {
        event.dataTransfer.setData("index", index.toString()); // Przechowuje indeks elementu w trakcie przeciągania
    };

    const handleDragEnter = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(true); // Ustawia stan przeciągania na true
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    const handleDragLeave = () => {
        setIsDragging(false); // Zmiana stanu przeciągania na false, gdy plik opuści obszar
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false); // Reset stanu przeciągania

        const fileName = event.dataTransfer.getData("text/plain");
        console.log("Dropped file name:", fileName);

        const file = files.find((file) => file.name === fileName);
        if (file) {
            console.log("Dropped file:", file);
            processFile(file); // Przetwarzanie pliku
        }
    };

    const processFile = (file: File) => {
        if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
            const mediaElement = document.createElement(
                file.type.startsWith("video/") ? "video" : "audio"
            );
            mediaElement.src = URL.createObjectURL(file);

            mediaElement.onloadedmetadata = () => {
                const duration = mediaElement.duration;
                const widthInPixels = duration * pixelsPerSecond * zoom;

                console.log(
                    `File: ${file.name}, Duration: ${duration}s, Width: ${widthInPixels}px`
                );

                // Dodanie pliku do stanu
                setDroppedItems((prevItems) => [
                    ...prevItems,
                    {
                        name: file.name,
                        duration,
                        widthInPixels,
                    },
                ]);
            };
        } else {
            console.log("File is not a video or audio type:", file.name);
        }
    };

    const handleDragEnd = (event: React.DragEvent, index: number) => {
        setIsDragging(false); // Reset stanu przeciągania
        console.log("Drag end:", index);
    };

    const totalDuration = [...trackItems, ...droppedItems].reduce(
        (sum, item) => sum + item.duration,
        0
    );

    const minDuration = 60;
    const containerWidth =
        Math.max(totalDuration, minDuration) * pixelsPerSecond * zoom;

    const measureTextWidth = (text: string) => {
        if (textMeasureRef.current) {
            textMeasureRef.current.innerText = text;
            const width = textMeasureRef.current.getBoundingClientRect().width;
            return width;
        }
        return 0;
    };

    return (
        <div
            className="timeline-track"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                width: `${containerWidth}px`,
                border: isDragging ? "2px dashed #2d8ceb" : "2px solid #ccc",
                backgroundColor: isDragging
                    ? "rgba(45, 140, 235, 0.1)"
                    : "transparent",
                transition: "background-color 0.3s ease",
            }}>
            <div
                ref={textMeasureRef}
                style={{
                    position: "absolute",
                    visibility: "hidden",
                    whiteSpace: "nowrap",
                }}
            />

            {droppedItems.map((item, index) => {
                const itemText = `${item.name} - ${item.duration.toFixed(2)}s`;
                const textWidth = measureTextWidth(itemText);

                return (
                    <div
                        key={`dropped-${index}`}
                        className="media-item"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={(e) => handleDragEnd(e, index)}
                        style={{
                            position: "relative",
                            backgroundColor:
                                trackType === "video"
                                    ? "darkslateblue"
                                    : "darkgreen",
                            width: `${
                                item.duration * pixelsPerSecond * zoom
                            }px`,
                            height: "30px",
                            borderRadius: "4px",
                        }}>
                        <div
                            className="media-item-text"
                            style={{
                                position: "absolute",
                                left: `${Math.min(
                                    scrollLeft + timelinePanelWidth / 2,
                                    item.duration * pixelsPerSecond * zoom -
                                        textWidth -
                                        10
                                )}px`,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                transition: "left 0.25s ease",
                            }}>
                            {itemText}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TimelineTrack;

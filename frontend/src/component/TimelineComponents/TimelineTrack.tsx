import React, { useRef, useState } from "react";
import { useEditorContext } from "../../context/EditorContext"; // Import kontekstu

interface TimelineTrackItem {
    name: string;
    duration: number;
    leftOffset: number; // Nowa właściwość określająca pozycję elementu na osi czasu
}
interface TimelineTrackProps {
    trackType: "video" | "audio";
    trackItems: TimelineTrackItem[]; // Dane o długości ścieżki w sekundach
    pixelsPerSecond: number; // Piksele na sekundę
    scrollLeft: number;
    onFileProcessed: (
        file: { name: string; duration: number },
        trackType: "video" | "audio"
    ) => void; // Callback do przekazywania przetworzonych plików
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({
    trackType,
    trackItems,
    pixelsPerSecond,
    scrollLeft,
    onFileProcessed,
}) => {
    const { zoom, files, timelinePanelWidth } = useEditorContext(); // Pobieramy zoom i files z Contextu
    const [isDragging, setIsDragging] = useState(false); // Stan przeciągania
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

    // Funkcja do przetwarzania pliku, rozdzielająca wideo i audio
    const processFile = (file: File) => {
        if (file.type.startsWith("video/")) {
            const videoElement = document.createElement("video");
            videoElement.src = URL.createObjectURL(file);

            videoElement.onloadedmetadata = () => {
                const duration = videoElement.duration;
                const widthInPixels = duration * pixelsPerSecond * zoom;

                console.log(
                    `File: ${file.name}, Duration: ${duration}s, Width: ${widthInPixels}px`
                );

                // Dodanie pliku wideo
                onFileProcessed({ name: file.name, duration }, "video");

                // Dodanie pliku audio (zakładając, że audio jest wbudowane)
                onFileProcessed(
                    { name: `${file.name} (audio)`, duration },
                    "audio"
                );
            };
        } else if (file.type.startsWith("audio/")) {
            const audioElement = document.createElement("audio");
            audioElement.src = URL.createObjectURL(file);

            audioElement.onloadedmetadata = () => {
                const duration = audioElement.duration;
                const widthInPixels = duration * pixelsPerSecond * zoom;

                console.log(
                    `File: ${file.name}, Duration: ${duration}s, Width: ${widthInPixels}px`
                );

                // Dodanie pliku audio
                onFileProcessed({ name: file.name, duration }, "audio");
            };
        } else {
            console.log("File is not a video or audio type:", file.name);
        }
    };

    const handleDragEnd = (event: React.DragEvent, index: number) => {
        setIsDragging(false); // Reset stanu przeciągania
        console.log("Drag end:", index);
    };

    const totalDuration = trackItems.reduce(
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

            {trackItems.map((item, index) => {
                const itemText = `${item.name} - ${item.duration.toFixed(2)}s`;
                const textWidth = measureTextWidth(itemText);
                const left = item.leftOffset * pixelsPerSecond * zoom;

                console.group();
                console.log(index);
                console.log(left, scrollLeft, left + scrollLeft + 10);
                console.log(
                    item.duration,
                    pixelsPerSecond,
                    zoom,
                    textWidth,
                    item.duration * pixelsPerSecond * zoom - textWidth - 10
                );
                console.groupEnd();

                return (
                    <div
                        key={`dropped-${index}`}
                        className="media-item"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={(e) => handleDragEnd(e, index)}
                        style={{
                            position: "absolute",
                            backgroundColor:
                                trackType === "video"
                                    ? "darkslateblue"
                                    : "darkgreen",
                            width: `${
                                item.duration * pixelsPerSecond * zoom
                            }px`,
                            border: "1px solid",
                            borderColor:
                                trackType === "video" ? "#241e45" : "#084808",
                            left: `${left}px`,
                            height: "30px",
                            borderRadius: "4px",
                        }}>
                        <div
                            className="media-item-text"
                            style={{
                                position: "absolute",
                                left: `${Math.min(
                                    left + scrollLeft + 10,
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


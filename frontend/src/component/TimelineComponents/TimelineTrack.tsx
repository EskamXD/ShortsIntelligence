import React, { useEffect, useRef, useState } from "react";

interface TimelineTrackProps {
    trackType: "video" | "audio";
    trackItems: { name: string; duration: number }[]; // Dane o długości ścieżki w sekundach
    zoom: number; // Wartość zoomu
    pixelsPerSecond: number; // Piksele na sekundę
    files: File[];
    scrollLeft: number;
    timelinePanelWidth: number;
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({
    trackType,
    trackItems,
    zoom,
    pixelsPerSecond,
    files,
    scrollLeft,
    timelinePanelWidth,
}) => {
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

    // Funkcje obsługujące przeciąganie
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

        // Pobieramy nazwę pliku z dataTransfer
        const fileName = event.dataTransfer.getData("text/plain");
        if (fileName) {
            // Szukamy pełnego obiektu File na podstawie nazwy
            const file = files.find((file) => file.name === fileName);
            if (file) {
                console.log("Dropped file:", file);

                processFile(file); // Przetwarzanie pliku
            } else {
                console.log("File not found:", fileName);
            }
        }
    };

    const processFile = (file: File) => {
        // Sprawdzenie, czy plik jest typu video lub audio
        if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
            // Tworzymy element video lub audio, aby odczytać długość pliku
            const mediaElement = document.createElement(
                file.type.startsWith("video/") ? "video" : "audio"
            );
            mediaElement.src = URL.createObjectURL(file);

            mediaElement.onloadedmetadata = () => {
                const duration = mediaElement.duration; // Długość pliku w sekundach
                // const frames = duration * fps; // Obliczenie liczby klatek
                const widthInPixels = duration * pixelsPerSecond * zoom; // Przeliczenie na piksele

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

    // Oblicz sumę długości trwania wszystkich trackItems i droppedItems
    const totalDuration = [...trackItems, ...droppedItems].reduce(
        (sum, item) => sum + item.duration,
        0
    );

    // Ustaw minimalną szerokość kontenera jako 60 sekund
    const minDuration = 60;

    // Oblicz szerokość kontenera na podstawie sumy czasu trwania lub minimum 60 sekund
    const containerWidth =
        Math.max(totalDuration, minDuration) * pixelsPerSecond * zoom;

    // Funkcja do zmierzenia szerokości tekstu
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
                width: `${containerWidth}px`, // Szerokość kontenera, minimum 60 sekund
                border: isDragging ? "2px dashed #2d8ceb" : "2px solid #ccc", // Zmiana stylu obramowania podczas przeciągania
                backgroundColor: isDragging
                    ? "rgba(45, 140, 235, 0.1)" // Zmiana koloru tła podczas przeciągania
                    : "transparent",
                transition: "background-color 0.3s ease",
            }}>
            {/* Ukryty element do mierzenia szerokości tekstu */}
            <div
                ref={textMeasureRef}
                style={{
                    position: "absolute",
                    visibility: "hidden",
                    whiteSpace: "nowrap",
                }}
            />

            {/* Wizualizacja droppedItems */}
            {droppedItems.map((item, index) => {
                const itemText = `${item.name} - ${item.duration.toFixed(2)}s`;
                const textWidth = measureTextWidth(itemText);

                return (
                    <div
                        key={`dropped-${index}`}
                        className="media-item"
                        draggable // Element jest przeciągalny
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={(e) => handleDragEnd(e, index)}
                        style={{
                            position: "relative", // Używamy pozycji względnej dla elementu rodzica
                            backgroundColor:
                                trackType === "video"
                                    ? "darkslateblue"
                                    : "darkgreen",
                            width: `${
                                item.duration * pixelsPerSecond * zoom
                            }px`, // Szerokość komponentu wideo
                            height: "30px",
                            borderRadius: "4px",
                        }}>
                        {/* Element z tekstem */}
                        <div
                            className="media-item-text"
                            style={{
                                position: "absolute",
                                // Obliczanie left na podstawie scrollLeft, szerokości kontenera oraz szerokości tekstu
                                left: `${Math.min(
                                    scrollLeft + timelinePanelWidth / 2,
                                    item.duration * pixelsPerSecond * zoom -
                                        textWidth -
                                        10 // Własna długość tekstu minus 10 px
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

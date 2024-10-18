import React, { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../../context/EditorContext"; // Import kontekstu

interface TimelineTrackProps {
    trackType: "video" | "audio";
    pixelsPerSecond: number; // Piksele na sekundę
    scrollLeft: number;
    onFileProcessed: (
        file: { name: string; duration: number },
        trackType: "video" | "audio"
    ) => void; // Callback do przekazywania przetworzonych plików
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({
    trackType,
    pixelsPerSecond,
    scrollLeft,
    onFileProcessed,
}) => {
    const { zoom, files, timelinePanelWidth, timelineItems } =
        useEditorContext(); // Pobieramy zoom i files z Contextu
    const [isDragging, setIsDragging] = useState(false); // Stan przeciągania
    const [isAltPressed, setIsAltPressed] = useState(false); // Nowy stan do śledzenia klawisza Alt
    const textMeasureRef = useRef<HTMLDivElement | null>(null); // Referencja do elementu mierzącego szerokość tekstu

    // Obsługa klawisza Alt
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.altKey) {
                setIsAltPressed(true);
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (!event.altKey) {
                setIsAltPressed(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    // useEffect(() => {
    //     console.log(scrollLeft);
    // }, [scrollLeft]);

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
                    `Type: video, File: ${file.name}, Duration: ${duration}s, Width: ${widthInPixels}px`
                );

                // Dodanie pliku wideo
                onFileProcessed({ name: file.name, duration }, "video");

                // Po dodaniu wideo, sprawdźmy, czy ma audio
                videoElement.onplay = () => {
                    const audioContext = new (window.AudioContext ||
                        (window as any).webkitAudioContext)();
                    const videoSource =
                        audioContext.createMediaElementSource(videoElement);

                    if (videoSource.mediaElement) {
                        console.log("Video has an audio track");
                        // Dodanie audio, jeśli istnieje
                        onFileProcessed(
                            { name: `${file.name} (audio)`, duration },
                            "audio"
                        );
                    } else {
                        console.log("Video has no audio track");
                    }
                };

                // Odtwórz wideo, aby aktywować `onplay` i przetworzyć audio
                videoElement.play().then(() => {
                    // Możesz zatrzymać wideo, jeśli nie chcesz go odtwarzać
                    videoElement.pause();
                });
            };
        } else if (file.type.startsWith("audio/")) {
            const audioElement = document.createElement("audio");
            audioElement.src = URL.createObjectURL(file);

            audioElement.onloadedmetadata = () => {
                const duration = audioElement.duration;
                const widthInPixels = duration * pixelsPerSecond * zoom;

                console.log(
                    `Type: audio, File: ${file.name}, Duration: ${duration}s, Width: ${widthInPixels}px`
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

    const totalDuration = timelineItems.reduce(
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
            className="timeline-track"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                width: `${containerWidth}px`,
                border: isDragging ? "2px dashed #2d8ceb" : "2px solid #ccc",
                backgroundColor: isDragging
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
                    const left = item.leftOffset * pixelsPerSecond * zoom;

                    // Obliczanie maksymalnej pozycji dla tekstu
                    const maxTextLeft =
                        left +
                        item.duration * pixelsPerSecond * zoom -
                        textWidth -
                        10;

                    let textLeft = 10;
                    if (
                        !isAltPressed &&
                        left + 10 < scrollLeft + timelinePanelWidth
                    ) {
                        // console.log("Item is visible:", index);
                        textLeft = Math.max(
                            10,
                            Math.min(scrollLeft + 10 - left, maxTextLeft)
                        ); // Dopiero gdy przewiniemy wystarczająco daleko, zaczynamy przesuwać
                    }

                    // console.table(item);
                    // console.log("Item left:", index, textLeft);

                    return (
                        <div
                            id={item.id}
                            key={`dropped-${index}`}
                            className="media-item"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnd={(e) => handleDragEnd(e, index)}
                            style={{
                                backgroundColor:
                                    trackType === "video"
                                        ? "darkslateblue"
                                        : "darkgreen",
                                width: `${
                                    item.duration * pixelsPerSecond * zoom
                                }px`,
                                borderColor:
                                    trackType === "video"
                                        ? "#241e45"
                                        : "#084808",
                                left: `${left}px`,
                            }}>
                            <div
                                className="media-item-text"
                                style={{
                                    left: `${textLeft}px`,
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

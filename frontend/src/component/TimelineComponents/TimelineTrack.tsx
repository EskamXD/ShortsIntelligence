import React, { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../../context/EditorContext"; // Import kontekstu

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
    const { zoom, files, timelinePanelWidth, timelineItems, setTimelineItems } =
        useEditorContext();
    const [isDragging, setIsDragging] = useState(false);
    const [draggedItemId, setDraggedItemId] = useState<string>("");
    const [draggedPosition, setDraggedPosition] = useState<number>(0);
    const [isAltPressed, setIsAltPressed] = useState(false);
    const textMeasureRef = useRef<HTMLDivElement | null>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);

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

    // Funkcja snapowania do najbliższego elementu (audio lub wideo)
    const snapToGrid = (position: number, itemWidth: number) => {
        // Zbieramy krawędzie wszystkich elementów na osi czasu
        const allEdges: number[] = [];

        timelineItems.forEach((item) => {
            const itemStart = item.leftOffset; // Początek elementu w pikselach
            const itemEnd = item.leftOffset + item.itemWidth; // Koniec elementu w pikselach

            // Dodajemy początek i koniec każdego elementu do listy krawędzi
            allEdges.push(itemStart, itemEnd);
        });

        if (allEdges.length === 0) {
            return position; // Brak elementów do przyciągnięcia, zwracamy pierwotną pozycję
        }

        // Znalezienie najbliższej krawędzi
        let closestEdge = allEdges[0];
        let minDistance = Math.abs(position - closestEdge);

        allEdges.forEach((edge) => {
            const distance = Math.abs(position - edge);
            if (distance < minDistance) {
                closestEdge = edge;
                minDistance = distance;
            }
        });

        // Upewniamy się, że element nie wychodzi poza oś czasu
        const maxPosition = containerWidth - itemWidth; // Zapobiegamy wyjściu poza oś czasu
        return Math.min(Math.max(closestEdge, 0), maxPosition); // Zwracamy najbliższą krawędź
    };

    const handleMouseDown = (event: React.MouseEvent, id: string) => {
        console.log(
            "Mouse down:",
            id,
            "Initial mouse position:",
            event.clientX
        );

        setDraggedItemId(id); // Zapisujemy, który element jest przeciągany
        setDraggedPosition(event.clientX); // Zapisujemy początkową pozycję myszy
        setIsDragging(true); // Ustawienie stanu przeciągania

        // Zaczynamy od aktualnej pozycji lewego offsetu przeciąganego elementu
        const initialItem = timelineItems.find((item) => item.id === id);
        if (!initialItem) return;

        const initialLeftOffset = initialItem.leftOffset;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newMousePosition = moveEvent.clientX; // Nowa pozycja myszy
            const deltaX = newMousePosition - draggedPosition; // Obliczamy różnicę między starą a nową pozycją

            console.log(
                "Delta X:",
                deltaX,
                "New mouse position:",
                newMousePosition,
                "Old position:",
                draggedPosition,
                "Zoom:",
                zoom
            );

            const newLeftOffset = initialLeftOffset + deltaX / zoom; // Obliczamy nową pozycję elementu
            console.log(
                "New left offset:",
                newLeftOffset,
                "Old left offset:",
                initialLeftOffset
            );

            // Aktualizujemy pozycję elementu
            const updatedTimelineItems = [...timelineItems];
            const updatedItem = updatedTimelineItems.find(
                (item) => item.id === id
            );
            if (updatedItem) {
                updatedItem.leftOffset = newLeftOffset; // Zaktualizuj pozycję elementu
                setTimelineItems(updatedTimelineItems); // Zaktualizuj stan osi czasu
            }

            setDraggedPosition(newMousePosition); // Zaktualizuj pozycję myszy
        };

        const handleMouseUp = () => {
            console.log("Mouse up detected for:", id);
            const item = timelineItems.find((item) => item.id === id);
            if (!item) return;

            // Snapowanie pozycji do siatki lub najbliższego elementu
            const snappedLeftOffset = snapToGrid(
                item.leftOffset,
                item.itemWidth
            );
            console.log("Snapped position:", snappedLeftOffset);

            // Aktualizacja pozycji po snapowaniu
            const updatedTimelineItems = [...timelineItems];
            const updatedItem = updatedTimelineItems.find(
                (item) => item.id === id
            );
            if (updatedItem) {
                updatedItem.leftOffset = snappedLeftOffset;
                setTimelineItems(updatedTimelineItems);
            }

            setDraggedItemId(""); // Reset przeciągania
            setIsDragging(false); // Koniec przeciągania

            // Usuń nasłuchiwanie na ruch myszy
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        // Dodaj nasłuchiwanie na ruch myszy i zwolnienie przycisku
        console.log("Adding mousemove and mouseup listeners for:", id);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    // useEffect do nasłuchiwania mousedown po załadowaniu komponentu
    useEffect(() => {
        const trackContainer = trackRef.current;
        if (!trackContainer) return;

        // Funkcja do nasłuchiwania zdarzeń mousedown na wszystkich elementach tracka
        const handleTrackMouseDown = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const id = target.getAttribute("data-id"); // Przyjmujemy, że element ma atrybut `data-id`
            if (id) {
                handleMouseDown(event as unknown as React.MouseEvent, id);
            }
        };

        // Dodaj listener na mousedown
        trackContainer.addEventListener("mousedown", handleTrackMouseDown);

        // Cleanup listenerów przy odmontowaniu komponentu
        return () => {
            trackContainer.removeEventListener(
                "mousedown",
                handleTrackMouseDown
            );
        };
    }, [timelineItems, zoom]); // Dodajemy zależności, aby upewnić się, że aktualizacje są odświeżane

    const handleDragStart = (event: React.DragEvent, id: string) => {
        const ghostImage = document.createElement("div"); // Tworzymy pusty element
        event.dataTransfer.setDragImage(ghostImage, 1, 1); // Ustawiamy "ghost image"
        event.preventDefault(); // Zapobiegamy domyślnemu zachowaniu

        // console.log("Drag start:", id);
        // setDraggedItemId(id); // Zapisujemy, który element jest przeciągany
        // setDraggedPosition(event.clientX); // Zapisujemy początkową pozycję
        // setIsDragging(true); // Rozpoczęcie przeciągania
    };

    // Funkcja obsługująca przeciąganie
    const handleDrag = (event: React.DragEvent) => {
        if (draggedItemId !== "") {
            // console.log("Dragging:", draggedItemId);
            const item = timelineItems.filter(
                (item) => item.id === draggedItemId
            )[0];
            if (!item) return;

            const deltaX = (event.clientX - draggedPosition) / zoom / 4; // Różnica w pozycji X
            const newLeftOffset = item.leftOffset + deltaX; // Nowy offset
            console.log("item.leftOffset:", item.leftOffset, deltaX);
            setDraggedPosition(event.clientX); // Aktualizacja pozycji przeciągania

            // Aktualizujemy pozycję elementu na osi czasu podczas przeciągania
            const updatedTimelineItems = [...timelineItems];
            const updatedItem = updatedTimelineItems.find(
                (item) => item.id === draggedItemId
            );
            if (updatedItem) {
                updatedItem.leftOffset = newLeftOffset;
                setTimelineItems(updatedTimelineItems);
            }
        }
    };

    const handleDragEnter = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);

        const fileName = event.dataTransfer.getData("text/plain");
        // console.log("Dropped file name:", fileName);

        const file = files.find((file) => file.name === fileName);
        if (file) {
            // console.log("Dropped file:", file);
            processFile(file);
        }
    };

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

                onFileProcessed({ name: file.name, duration }, "video");

                videoElement.onplay = () => {
                    const audioContext = new (window.AudioContext ||
                        (window as any).webkitAudioContext)();
                    const videoSource =
                        audioContext.createMediaElementSource(videoElement);

                    if (videoSource.mediaElement) {
                        console.log("Video has an audio track");

                        onFileProcessed(
                            { name: `${file.name} (audio)`, duration },
                            "audio"
                        );
                    } else {
                        console.log("Video has no audio track");
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
                const widthInPixels = duration * pixelsPerSecond * zoom;

                console.log(
                    `Type: audio, File: ${file.name}, Duration: ${duration}s, Width: ${widthInPixels}px`
                );

                onFileProcessed({ name: file.name, duration }, "audio");
            };
        } else {
            console.log("File is not a video or audio type:", file.name);
        }
    };

    // Funkcja obsługująca zakończenie przeciągania
    const handleDragEnd = (event: React.DragEvent, id: string) => {
        if (draggedItemId !== "") {
            const item = timelineItems.filter((item) => item.id === id)[0];
            if (!item) return;

            const snappedLeftOffset = snapToGrid(
                item.leftOffset,
                item.itemWidth
            );

            console.log("Drag end:", id, snappedLeftOffset);

            // Aktualizujemy pozycję elementu zgodnie z siatką (snap to grid)
            const updatedTimelineItems = [...timelineItems];
            const updatedItem = updatedTimelineItems.find(
                (item) => item.id === id
            );
            if (updatedItem) {
                updatedItem.leftOffset = snappedLeftOffset;
                setTimelineItems(updatedTimelineItems);
            }

            setDraggedItemId(""); // Reset przeciągania
            setIsDragging(false); // Koniec przeciągania
        }
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
            ref={trackRef}
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
                    const left = item.leftOffset * zoom;

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
                        textLeft = Math.max(
                            10,
                            Math.min(scrollLeft + 10 - left, maxTextLeft)
                        );
                    }

                    return (
                        <div
                            id={item.id}
                            key={`dropped-${index}`}
                            className="media-item"
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onDrag={(e) => handleDrag(e)}
                            onDragEnd={(e) => handleDragEnd(e, item.id)}
                            onClick={(event) => handleMouseDown(event, item.id)}
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
                    );
                })}
        </div>
    );
};

export default TimelineTrack;


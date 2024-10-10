import React, { useState, useRef, useEffect } from "react";
import TimelineTrack from "../TimelineComponents/TimelineTrack";

interface TimelinePanelProps {
    files: File[];
    subtitles: string;
    fps: number; // Dodajemy FPS jako parametr
}

const TimelinePanel: React.FC<TimelinePanelProps> = ({
    files,
    subtitles,
    fps,
}) => {
    const [videoTrack1, setVideoTrack1] = useState<
        { name: string; duration: number }[]
    >([]);
    const [audioTrack1, setAudioTrack1] = useState<
        { name: string; duration: number }[]
    >([]);
    const [playbackPosition, setPlaybackPosition] = useState(0); // Wskaźnik odtwarzania w sekundach

    const zoom = 1; // Możesz dostosować zoom od 1 do 10
    const timelineLengthInSeconds = 60; // Zmieniamy długość timeline'a na 60 sekund (1 minuta)
    const pixelsPerSecond = 100; // Zwiększamy liczbę pikseli na sekundę dla lepszej precyzji
    const timelineRef = useRef<HTMLDivElement>(null); // Referencja do osi czasu
    const containerRef = useRef<HTMLDivElement>(null); // Referencja do kontenera, który będziemy przesuwać

    const timelineWidth = timelineLengthInSeconds * pixelsPerSecond * zoom; // Obliczamy szerokość timeline'a

    // Formatowanie czasu na hh:mm:ss:fps
    const formatTime = (timeInSeconds: number) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);

        // Precyzyjne obliczenie liczby klatek na podstawie ułamkowej części sekundy
        const fractionalSeconds = timeInSeconds % 1;
        const frames = Math.floor(fractionalSeconds * fps);

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
        )}:${String(seconds).padStart(2, "0")}:${String(frames).padStart(
            2,
            "0"
        )}`;
    };

    // Obsługa przeciągnięcia pliku na ścieżkę
    const handleDropFile = (file: File, trackType: string) => {
        const mediaElement =
            trackType === "video"
                ? document.createElement("video")
                : document.createElement("audio");
        mediaElement.src = URL.createObjectURL(file);

        mediaElement.addEventListener("loadedmetadata", () => {
            const duration = mediaElement.duration; // Czas trwania w sekundach

            if (trackType === "video") {
                setVideoTrack1((prev) => [
                    ...prev,
                    { name: file.name, duration },
                ]);
            } else if (trackType === "audio") {
                setAudioTrack1((prev) => [
                    ...prev,
                    { name: file.name, duration },
                ]);
            }
        });
    };

    // Obsługa przeciągania wskaźnika odtwarzania po osi czasu
    const handleMouseMove = (event: React.MouseEvent) => {
        if (!timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const mouseX = event.clientX - rect.left; // Pozycja myszki względem osi czasu
        const newPlaybackPosition = Math.min(
            Math.max(mouseX / (pixelsPerSecond * zoom), 0),
            timelineLengthInSeconds
        ); // Obliczamy nową pozycję wskaźnika w sekundach

        setPlaybackPosition(newPlaybackPosition); // Aktualizujemy pozycję odtwarzania
    };

    const handleMouseDown = (event: React.MouseEvent) => {
        handleMouseMove(event); // Aktualizujemy pozycję odtwarzania przy kliknięciu
        window.addEventListener("mousemove", handleMouseMove); // Obsługa przeciągania myszką
        window.addEventListener("mouseup", () => {
            window.removeEventListener("mousemove", handleMouseMove); // Usuwamy event po zwolnieniu przycisku myszy
        });
    };

    // Obsługa scrollowania poziomo kółkiem myszki
    const handleWheel = (event: WheelEvent) => {
        if (containerRef.current) {
            event.preventDefault(); // Zapobiegamy domyślnemu przewijaniu pionowemu
            containerRef.current.scrollLeft += event.deltaY; // Scrollujemy poziomo na podstawie ruchu pionowego
        }
    };

    // Dodanie event listenera do kontenera po zamontowaniu komponentu
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener("wheel", handleWheel);

            return () => {
                container.removeEventListener("wheel", handleWheel); // Czyszczenie event listenera
            };
        }
    }, []);

    // Wybór jednostek czasowych w zależności od wartości zoom
    const determineTickUnit = () => {
        if (zoom >= 5) {
            return "frames"; // Wyświetlamy jednostki co 5 FPS
        } else if (zoom >= 2) {
            return "seconds"; // Wyświetlamy jednostki co sekundę
        } else if (zoom >= 1) {
            return "5-seconds"; // Wyświetlamy jednostki co 5 sekund
        } else {
            return "15-seconds"; // Wyświetlamy jednostki co 15 sekund
        }
    };

    const tickUnit = determineTickUnit();

    const timelineScale = [];
    for (let i = 0; i <= timelineLengthInSeconds; i++) {
        if (tickUnit === "frames") {
            for (let frame = 0; frame < fps; frame += 5) {
                const timeInSeconds = i + frame / fps;
                timelineScale.push({
                    timeInSeconds,
                    label: formatTime(timeInSeconds),
                    isMajor: frame === 0,
                });
            }
        } else if (tickUnit === "seconds") {
            timelineScale.push({
                timeInSeconds: i,
                label: formatTime(i),
                isMajor: true,
            });
        } else if (tickUnit === "5-seconds" && i % 5 === 0) {
            timelineScale.push({
                timeInSeconds: i,
                label: formatTime(i),
                isMajor: true,
            });
        } else if (tickUnit === "15-seconds" && i % 15 === 0) {
            timelineScale.push({
                timeInSeconds: i,
                label: formatTime(i),
                isMajor: true,
            });
        }
    }

    return (
        <div
            style={{
                position: "relative",
            }}>
            {/* Wyświetlanie aktualnego czasu odtwarzania w lewym górnym rogu */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    padding: "5px",
                    // backgroundColor: "#fff",
                    color: "#2d8ceb",
                    zIndex: 100,
                }}>
                {formatTime(playbackPosition)}
            </div>
            <div
                className="timeline-panel"
                ref={containerRef} // Referencja do kontenera
                style={{
                    position: "relative",
                    overflowX: "scroll",
                    padding: 0,
                    paddingTop: "40px",
                }}>
                {/* <h3>Timeline</h3> */}

                {/* Wskaźnik odtwarzania - pozycjonowany względem kontenera, aby przecinał od skali do dołu */}
                <div
                    className="playback-indicator"
                    style={{
                        position: "absolute",
                        top: "48px", // Rozpoczynamy wskaźnik od samej góry kontenera
                        left: `${playbackPosition * pixelsPerSecond * zoom}px`, // Pozycja wskaźnika
                        height: "calc(100% - 48px)", // Wysokość od skali (pomniejszona o padding górny)
                        width: "2px",
                        backgroundColor: "red", // Wskaźnik odtwarzania
                        zIndex: 10, // Wyższy z-index, aby wskaźnik był na wierzchu
                    }}>
                    {/* Zgrubienie u góry wskaźnika */}
                    <div
                        className="grab-handle"
                        style={{
                            position: "absolute",
                            top: "-5px", // Wystaje trochę ponad wskaźnik
                            left: "-4px", // Aby było na środku wskaźnika
                            width: "10px",
                            height: "10px",
                            backgroundColor: "red",
                            borderRadius: "50%", // Zgrubienie w formie okręgu
                            cursor: "pointer", // Zmieniamy kursor na pointer
                        }}
                        onMouseDown={handleMouseDown} // Przeciąganie wskaźnika za zgrubienie
                    />
                </div>
                {/* Skala czasu */}
                <div
                    className="timeline-scale d-flex"
                    ref={timelineRef}
                    style={{
                        position: "relative",
                        width: `${timelineWidth}px`,
                        cursor: "pointer",
                        height: "30px",
                    }}
                    onMouseDown={handleMouseDown}>
                    {timelineScale.map((tick, index) => (
                        <div
                            key={index}
                            style={{
                                position: "absolute", // Używamy pozycjonowania absolutnego
                                left: `${
                                    tick.timeInSeconds *
                                        pixelsPerSecond *
                                        zoom -
                                    (index === 0 ||
                                    index === timelineScale.length - 1
                                        ? 99
                                        : 0) // Przesuwamy pierwszy i ostatni tick o 99px w lewo
                                }px`,
                                width: `${pixelsPerSecond * zoom}px`, // Ustawiamy szerokość ticka, zależnie od pixelsPerSecond i zoom
                                textAlign: "center",
                                borderRight: tick.isMajor
                                    ? "1px solid #ccc"
                                    : "1px solid #eee",
                                height: tick.isMajor ? "20px" : "10px",
                            }}>
                            {tick.isMajor && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "-20px",
                                        left:
                                            index === 0
                                                ? "100%" // Pierwsza etykieta po prawej od kreski
                                                : index ===
                                                  timelineScale.length - 1
                                                ? "auto"
                                                : "50%", // Pozostałe wyśrodkowane
                                        // right:
                                        //     index === timelineScale.length - 1
                                        //         ? "100%"
                                        //         : "auto", // Ostatnia etykieta przesunięta w lewo
                                        transform:
                                            index !== 0 &&
                                            index !== timelineScale.length - 1
                                                ? "translateX(10%)"
                                                : "none", // Wyśrodkowanie pozostałych etykiet
                                    }}>
                                    {tick.label}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="d-flex flex-column">
                    {/* Ścieżka wideo */}
                    <TimelineTrack
                        trackType="video"
                        trackItems={videoTrack1}
                        onDropFile={handleDropFile}
                        timelineOffset={0} // Nie potrzeba offsetu, ponieważ scrollbar zajmie się przewijaniem
                        zoom={zoom}
                        files={files}
                        pixelsPerSecond={pixelsPerSecond}
                    />

                    {/* Ścieżka audio */}
                    <TimelineTrack
                        trackType="audio"
                        trackItems={audioTrack1}
                        onDropFile={handleDropFile}
                        timelineOffset={0} // Nie potrzeba offsetu, ponieważ scrollbar zajmie się przewijaniem
                        zoom={zoom}
                        files={files}
                        pixelsPerSecond={pixelsPerSecond}
                    />
                </div>
            </div>
        </div>
    );
};

export default TimelinePanel;


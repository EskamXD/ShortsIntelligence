import React, { useEffect, useRef, useState } from "react";
import TimelineScale from "../TimelineComponents/TimelineScale";
import PlaybackIndicator from "../TimelineComponents/PlaybackIndicator";
import ZoomableContainer from "../TimelineComponents/ZoomableContainer";
import TimelineTrackContainer from "../TimelineComponents/TimelineTrackContainer";
import { useEditorContext } from "../../context/EditorContext";

const TimelinePanel: React.FC = () => {
    const {
        files,
        playbackPosition,
        isPlaying,
        setIsPlaying,
        setPlaybackPosition,
        subtitles,
        zoom,
        setZoom,
        timelinePanelWidth,
        setTimelinePanelWidth,
    } = useEditorContext();

    const [mouseScrollOffset, setMouseScrollOffset] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [localPlaybackPosition, setLocalPlaybackPosition] =
        useState(playbackPosition);

    const timelinePanelRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(Date.now());
    const timelineRef = useRef<HTMLDivElement>(null);

    const pixelsPerSecond = 100;
    const timelineLengthInSeconds = 60;
    const timelineWidth = timelineLengthInSeconds * pixelsPerSecond * zoom;

    // Animacja wskaźnika odtwarzania
    const animatePlaybackIndicator = () => {
        const now = Date.now();
        const deltaTime = (now - lastUpdateRef.current) / 1000;
        lastUpdateRef.current = now;

        setLocalPlaybackPosition((prev) => {
            const newPosition = prev + deltaTime;
            if (newPosition > timelineLengthInSeconds) {
                cancelAnimationFrame(requestRef.current!);
                return prev;
            }
            return newPosition;
        });

        if (isPlaying) {
            requestRef.current = requestAnimationFrame(
                animatePlaybackIndicator
            );
        }
    };

    // Ustawienie szerokości timeline panelu
    useEffect(() => {
        if (timelinePanelRef.current) {
            setTimelinePanelWidth(timelinePanelRef.current.offsetWidth);
        }

        const handleResize = () => {
            if (timelinePanelRef.current) {
                setTimelinePanelWidth(timelinePanelRef.current.offsetWidth);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (isPlaying) {
            lastUpdateRef.current = Date.now();
            requestRef.current = requestAnimationFrame(
                animatePlaybackIndicator
            );
        } else if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isPlaying]);

    useEffect(() => {
        if (playbackPosition !== localPlaybackPosition) {
            setLocalPlaybackPosition(playbackPosition);
        }
    }, [playbackPosition]);

    // Obsługa kliknięcia i przeciągania na skali czasu
    const handleTimelineMouseDown = (event: React.MouseEvent) => {
        if (!timelineRef.current) return;

        const updatePosition = (clientX: number) => {
            const rect = timelineRef.current!.getBoundingClientRect();
            const mouseX = clientX - rect.left;
            const newPlaybackPosition = Math.min(
                Math.max(mouseX / (pixelsPerSecond * zoom), 0),
                timelineLengthInSeconds
            );

            setLocalPlaybackPosition(newPlaybackPosition);
            setPlaybackPosition(newPlaybackPosition); // Aktualizujemy globalny stan
            setIsPlaying(false); // Zatrzymujemy odtwarzanie po kliknięciu lub przeciąganiu
        };

        updatePosition(event.clientX);

        const handleMouseMove = (event2: MouseEvent) => {
            if (event2.buttons !== 1) return;
            updatePosition(event2.clientX);
        };

        const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    // Generowanie ticków
    const generateTimelineScale = () => {
        const timelineScale = [];
        const majorTickInterval =
            zoom >= 4 ? 1 : zoom >= 3 ? 2 : zoom >= 2 ? 5 : 10;
        const minorTickDensity = zoom >= 4 ? 10 : 5;

        for (let i = 0; i <= timelineLengthInSeconds; i += majorTickInterval) {
            timelineScale.push({
                timeInSeconds: i,
                label: `${new Date(i * 1000).toISOString().substr(11, 8)}:00`,
                isMajor: true,
            });
            for (let j = 1; j < minorTickDensity; j++) {
                const minorTick =
                    i + j * (majorTickInterval / minorTickDensity);
                if (minorTick < timelineLengthInSeconds) {
                    timelineScale.push({
                        timeInSeconds: minorTick,
                        label: "",
                        isMajor: false,
                    });
                }
            }
        }

        return timelineScale;
    };

    const timelineScale = generateTimelineScale();

    // Funkcja formatująca czas do formatu hh:mm:ss:fps
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
            ref={timelinePanelRef}
            id="timeline-panel-container"
            className="timeline-panel-container">
            <div className="current-time">{`${formatTime(
                localPlaybackPosition,
                30 // Założenie 30 fps
            )}`}</div>

            <ZoomableContainer
                setMouseScrollOffset={setMouseScrollOffset}
                pixelsPerSecond={pixelsPerSecond}
                setScrollLeft={setScrollLeft}>
                <div ref={timelineRef} onClick={handleTimelineMouseDown}>
                    <PlaybackIndicator
                        localPlaybackPosition={localPlaybackPosition}
                        pixelsPerSecond={pixelsPerSecond}
                        zoom={zoom}
                        handleMouseDown={handleTimelineMouseDown}
                    />

                    <TimelineScale
                        timelineScale={timelineScale}
                        zoom={zoom}
                        pixelsPerSecond={pixelsPerSecond}
                    />

                    <TimelineTrackContainer
                        videoTrack={[]}
                        audioTrack={[]}
                        zoom={zoom}
                        pixelsPerSecond={pixelsPerSecond}
                        files={files}
                        scrollLeft={scrollLeft}
                        timelinePanelWidth={timelinePanelWidth}
                    />
                </div>
            </ZoomableContainer>
        </div>
    );
};

export default TimelinePanel;

import React, { useCallback, useEffect, useRef, useState } from "react";
import TimelineScale from "../TimelineComponents/TimelineScale";
import PlaybackIndicator from "../TimelineComponents/PlaybackIndicator";
import ZoomableContainer from "../TimelineComponents/ZoomableContainer";
import TimelineTrackContainer from "../TimelineComponents/TimelineTrackContainer";
import { useEditorContext } from "../../context/EditorContext";

import MouseIcon from "@mui/icons-material/Mouse";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DeleteIcon from "@mui/icons-material/Delete";
import { ButtonGroup, ToggleButton } from "react-bootstrap";

const TimelinePanel: React.FC = () => {
    const {
        files,
        playbackPosition,
        setPlaybackPosition,
        isPlaying,
        setIsPlaying,
        setIsDragingPlaybackIndicator,
        setVideoURL,
        subtitles,
        zoom,
        setTimelinePanelWidth,
        timelineItems,
        setTimelineItems,
    } = useEditorContext();

    const [scrollLeft, setScrollLeft] = useState(0);
    const [localPlaybackPosition, setLocalPlaybackPosition] =
        useState(playbackPosition);
    const [selectedMediaItem, setSelectedMediaItem] = useState<string>("");
    const [toolValue, setToolValue] = useState("mouse");

    const timelinePanelRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(Date.now());
    const zoomableContainerRef = useRef<HTMLDivElement>(null);

    const pixelsPerSecond = 100;
    const timelineLengthInSeconds = 60;

    // Obsługa klawisza Delete do usunięcia wybranego elementu
    useEffect(() => {
        console.log(timelineItems);
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Delete" && selectedMediaItem) {
                const newTimelineItems = timelineItems.filter((item) => {
                    return item.id !== selectedMediaItem;
                });
                console.log(newTimelineItems);
                setTimelineItems(newTimelineItems);
                setSelectedMediaItem("");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedMediaItem]);

    const animatePlaybackIndicator = useCallback(() => {
        if (!isPlaying) {
            cancelAnimationFrame(requestRef.current!);
            return;
        }

        const now = Date.now();
        const deltaTime = (now - lastUpdateRef.current) / 1000;
        lastUpdateRef.current = now;

        setLocalPlaybackPosition((prev) => {
            const newPositionInSeconds = prev + deltaTime;

            if (newPositionInSeconds > timelineLengthInSeconds) {
                cancelAnimationFrame(requestRef.current!);
                setPlaybackPosition(newPositionInSeconds);
                return prev;
            }

            return newPositionInSeconds;
        });

        requestRef.current = requestAnimationFrame(animatePlaybackIndicator);
    }, [isPlaying, timelineLengthInSeconds, setPlaybackPosition]);

    useEffect(() => {
        setPlaybackPosition(localPlaybackPosition);
        if (isPlaying) {
            lastUpdateRef.current = Date.now();
            requestRef.current = requestAnimationFrame(
                animatePlaybackIndicator
            );
        } else {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
        };
    }, [isPlaying, animatePlaybackIndicator]);

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
    }, [setTimelinePanelWidth]);

    useEffect(() => {
        if (!isPlaying) {
            setLocalPlaybackPosition(playbackPosition);
        }

        if (localPlaybackPosition >= timelineLengthInSeconds) {
            setIsPlaying(false);
        }
    }, [playbackPosition, localPlaybackPosition]);

    const handleIndicatorDrag = (event: React.MouseEvent) => {
        if (!zoomableContainerRef.current) return;

        const updatePosition = (clientX: number) => {
            const rect = zoomableContainerRef.current!.getBoundingClientRect();
            const mouseX = clientX - rect.left;
            const newPlaybackPosition = Math.min(
                Math.max(mouseX / (pixelsPerSecond * zoom), 0),
                timelineLengthInSeconds
            );

            setLocalPlaybackPosition(newPlaybackPosition);
            setPlaybackPosition(newPlaybackPosition);
        };

        const handleMouseMove = (event2: MouseEvent) => {
            setIsDragingPlaybackIndicator(true);
            updatePosition(event2.clientX);
        };

        const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            setIsDragingPlaybackIndicator(false);
        };

        const handleMouseDown = (mouseDownEvent: MouseEvent) => {
            if (mouseDownEvent.button === 0) {
                window.addEventListener("mousemove", handleMouseMove);
                window.addEventListener("mouseup", handleMouseUp);
            }
        };
        zoomableContainerRef.current?.addEventListener(
            "mousedown",
            handleMouseDown
        );
    };

    const handleTimelineMouseDown = useCallback(
        (event: React.MouseEvent) => {
            const target = event.target as HTMLElement;

            const handleMediaItemClick = (target: HTMLElement) => {
                const mediaItems =
                    document.getElementsByClassName("media-item");
                if (!mediaItems) return;

                Array.from(mediaItems).forEach((item) => {
                    (item as HTMLElement).style.border =
                        "2px solid transparent";
                });

                let itemElement: HTMLElement | null = null;
                if (
                    target.classList.contains("media-item-text") &&
                    target.parentElement
                ) {
                    itemElement = target.parentElement as HTMLElement;
                } else if (target.classList.contains("media-item")) {
                    itemElement = target;
                }

                if (itemElement) {
                    itemElement.style.border = "2px solid white";
                    setSelectedMediaItem(itemElement.id);
                }
            };

            console.log("terget:", target.id, "-", target.parentElement?.id);
            if (
                ["playback-indicator", "timeline-scale"].includes(target.id) &&
                (target.id !== "timeline-track-container" ||
                    target.parentElement?.id !== "timeline-track-container")
            ) {
                handleIndicatorDrag(event); // Inicjalizacja przeciągania
            } else if (target.id === "timeline-track-container") {
                // Do nothing
            } else {
                handleMediaItemClick(target);
            }

            event.stopPropagation();
        },
        [
            zoomableContainerRef,
            pixelsPerSecond,
            zoom,
            timelineLengthInSeconds,
            setIsPlaying,
            setPlaybackPosition,
        ]
    );

    useEffect(() => {
        return () => {
            window.removeEventListener("mouseup", () => {});
            window.removeEventListener("mousemove", () => {});
        };
    }, []);

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

    const toolbar = [
        {
            value: "mouse",
            component: <MouseIcon />,
            onClick: () => {
                console.log("Mouse");
                setToolValue("mouse");
            },
            tooltip: "Mouse",
        },
        {
            value: "cut",
            component: <ContentCutIcon />,
            onClick: () => {
                console.log("Cut");
                setToolValue("cut");
            },
            tooltip: "Cut",
        },
    ];

    return (
        <div
            ref={timelinePanelRef}
            id="timeline-panel-container"
            className="timeline-panel-container">
            <div className="current-time">{`${formatTime(
                localPlaybackPosition,
                30
            )}`}</div>
            <div
                className="d-flex flex-column gap-3 align-center"
                // style={{ width: "60px" }}
            >
                <ButtonGroup vertical>
                    {toolbar.map((tool, index) => (
                        <ToggleButton
                            key={index}
                            id={`${tool.value}-button`}
                            type="radio"
                            value={tool.value}
                            // variant="secondary"
                            checked={toolValue === tool.value}
                            onClick={tool.onClick}>
                            {tool.component}
                        </ToggleButton>
                    ))}
                </ButtonGroup>
            </div>

            <ZoomableContainer
                pixelsPerSecond={pixelsPerSecond}
                setScrollLeft={setScrollLeft}
                localPlaybackPosition={localPlaybackPosition}>
                <div ref={zoomableContainerRef}>
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
                        handleMouseDown={handleTimelineMouseDown}
                    />
                </div>
                <TimelineTrackContainer
                    pixelsPerSecond={pixelsPerSecond}
                    scrollLeft={scrollLeft}
                    localPlaybackPosition={localPlaybackPosition}
                    handleMouseDown={handleTimelineMouseDown}
                />
            </ZoomableContainer>
        </div>
    );
};

export default TimelinePanel;


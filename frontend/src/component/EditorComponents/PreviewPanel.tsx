import React, { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../../context/EditorContext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const PreviewPanel: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const backgroundVideoRef = useRef<HTMLVideoElement>(null);
    const localPlaybackPositionRef = useRef(0); // Ref for latest playback position
    const [isMuted, setIsMuted] = useState(false);
    const [hasTriggered, setHasTriggered] = useState("");
    const [localPlaybackPosition, setLocalPlaybackPosition] = useState(0);
    const videoBlobURLs = useRef(new Map<string, string>());
    const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
    const [videoWidth, setVideoWidth] = useState<number>(0);

    const {
        playbackPosition,
        setPlaybackPosition,
        isPlaying,
        setIsPlaying,
        videoURL,
        setVideoURL,
        timelineItems,
        pixelsPerSecond,
        subtitleStyles,
    } = useEditorContext();

    const getVideoBlobURL = (file: File, itemId: string): string => {
        if (!videoBlobURLs.current.has(itemId)) {
            const blob = new Blob([file], { type: file.type || "video/mp4" });
            const url = URL.createObjectURL(blob);
            videoBlobURLs.current.set(itemId, url);
        }
        return videoBlobURLs.current.get(itemId) as string;
    };

    /**
     * Sync `localPlaybackPosition` with `playbackPosition` changes.
     */
    useEffect(() => {
        if (videoRef.current && backgroundVideoRef.current) {
            videoRef.current.pause();
            backgroundVideoRef.current.pause();
            setLocalPlaybackPosition(playbackPosition);
        }
    }, [playbackPosition]);

    /**
     * Update videoURL and set currentTime for videoRef based on playbackPosition.
     */
    useEffect(() => {
        const playbackPositionPx = localPlaybackPosition * pixelsPerSecond;

        // Znajdź bieżące wideo i napisy
        const videoItem = timelineItems.find(
            (item) =>
                item.type === "video" &&
                playbackPositionPx >= item.startPosition &&
                playbackPositionPx <= item.endPosition
        );

        const subtitleItem = timelineItems.find(
            (item) =>
                item.type === "subtitles" &&
                playbackPositionPx >= item.startPosition &&
                playbackPositionPx <= item.endPosition
        );

        // Obsługa wideo
        if (videoItem && hasTriggered !== videoItem.id && videoItem.file) {
            const fileURL = getVideoBlobURL(videoItem.file, videoItem.id);

            if (videoURL !== fileURL) {
                setVideoURL(fileURL);
            }
            setHasTriggered(videoItem.id);

            if (videoRef.current && backgroundVideoRef.current) {
                if (
                    videoRef.current.src !== fileURL ||
                    backgroundVideoRef.current.src !== fileURL
                ) {
                    videoRef.current.src = fileURL;
                    backgroundVideoRef.current.src = fileURL;
                }
                videoRef.current.load();
                backgroundVideoRef.current.load();

                const videoCurrentTime =
                    (playbackPositionPx - videoItem.startPosition) /
                        pixelsPerSecond +
                    videoItem.startTime;

                videoRef.current.currentTime = videoCurrentTime;
                backgroundVideoRef.current.currentTime = videoCurrentTime;

                if (isPlaying) {
                    videoRef.current
                        .play()
                        .catch((error) =>
                            console.error("Error playing video:", error)
                        );
                    backgroundVideoRef.current
                        .play()
                        .catch((error) =>
                            console.error("Error playing video:", error)
                        );
                }
            }
        } else if (
            !videoItem &&
            videoRef.current &&
            backgroundVideoRef.current
        ) {
            videoRef.current.src = "";
            videoRef.current.currentTime = 0;
            backgroundVideoRef.current.src = "";
            backgroundVideoRef.current.currentTime = 0;
            setVideoURL(null);
            setHasTriggered("");
        }

        // // Obsługa napisów
        // if (subtitleItem) {
        //     setCurrentSubtitle(subtitleItem.name);
        // } else {
        //     setCurrentSubtitle(null);
        // }
    }, [localPlaybackPosition, pixelsPerSecond, timelineItems]);

    useEffect(() => {
        const handleTimeUpdate = () => {
            if (!videoRef.current || !backgroundVideoRef.current) return;

            const playbackPositionPx =
                videoRef.current.currentTime * pixelsPerSecond;

            // Znajdź napisy pasujące do bieżącej pozycji
            const subtitleItem = timelineItems.find(
                (item) =>
                    item.type === "subtitles" &&
                    playbackPositionPx >= item.startPosition &&
                    playbackPositionPx <= item.endPosition
            );

            if (subtitleItem) {
                setCurrentSubtitle(subtitleItem.name);
            } else {
                setCurrentSubtitle(null);
            }
        };

        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.addEventListener("timeupdate", handleTimeUpdate);
        }

        return () => {
            if (videoElement) {
                videoElement.removeEventListener(
                    "timeupdate",
                    handleTimeUpdate
                );
            }
        };
    }, [timelineItems, pixelsPerSecond]);

    useEffect(() => {
        localPlaybackPositionRef.current = localPlaybackPosition; // Sync ref with state
    }, [localPlaybackPosition]);

    /**
     * Animation loop to update playback position when isPlaying is true.
     */
    useEffect(() => {
        let animationFrameId: number | null = null;
        let previousTime: number | null = null;

        const updatePlaybackPosition = (currentTime: number) => {
            if (previousTime != null && isPlaying) {
                const deltaTime = (currentTime - previousTime) / 1000;
                localPlaybackPositionRef.current += deltaTime;
                setLocalPlaybackPosition(localPlaybackPositionRef.current);
            }
            previousTime = currentTime;
            animationFrameId = requestAnimationFrame(updatePlaybackPosition);
        };

        if (isPlaying) {
            animationFrameId = requestAnimationFrame(updatePlaybackPosition);
            setHasTriggered("");
        } else if (animationFrameId != null) {
            previousTime = null;
            cancelAnimationFrame(animationFrameId);
        }

        return () => {
            if (animationFrameId != null) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isPlaying]);

    useEffect(() => {
        return () => {
            videoBlobURLs.current.forEach((url) => URL.revokeObjectURL(url));
            videoBlobURLs.current.clear();
        };
    }, []);

    const togglePlayPause = () => {
        if (isPlaying) {
            setIsPlaying(false);
            if (videoRef.current && backgroundVideoRef.current && videoURL) {
                videoRef.current.pause();
                backgroundVideoRef.current.pause();
            }
            setHasTriggered("");
        } else {
            setIsPlaying(true);
        }
    };

    const stopVideo = () => {
        if (videoRef.current && backgroundVideoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            backgroundVideoRef.current.pause();
            backgroundVideoRef.current.currentTime = 0;
        }
        setPlaybackPosition(0);
        setLocalPlaybackPosition(0);
        setIsPlaying(false);
    };

    const switchSound = () => {
        if (videoRef.current && backgroundVideoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            backgroundVideoRef.current.muted =
                !backgroundVideoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    useEffect(() => {
        const updateVideoWidth = () => {
            if (videoRef.current) {
                const boundingRect = videoRef.current.getBoundingClientRect();
                setVideoWidth(boundingRect.width); // Ustaw szerokość wideo
            }
        };

        // Wywołaj raz na początek i dodaj listener na resize
        updateVideoWidth();
        window.addEventListener("resize", updateVideoWidth);

        return () => {
            window.removeEventListener("resize", updateVideoWidth);
        };
    }, []);

    return (
        <div className="preview-panel">
            <div
                className="preview-panel-video-placeholder"
                style={{
                    position: "relative",
                    overflow: "hidden",
                    aspectRatio: "9/16",
                }}>
                {videoURL && (
                    <video
                        ref={backgroundVideoRef}
                        className="background-video"
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            // width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            filter: "blur(20px) brightness(0.5)",
                            zIndex: 0,
                            pointerEvents: "none", // Ignorowanie kliknięć
                        }}
                        muted>
                        <source src={videoURL} type="video/mp4" />
                    </video>
                )}
                {videoURL !== undefined ? (
                    <video
                        ref={videoRef}
                        className="black-screen"
                        style={{
                            zIndex: 1,
                        }}>
                        <source src={videoURL || ""} type="video/mp4" />
                    </video>
                ) : (
                    <div
                        className="black-screen"
                        style={{ backgroundColor: "red", zIndex: 1 }}></div>
                )}
                {currentSubtitle && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: "10px",
                            width: `${videoWidth}px`,
                            textAlign: "center",
                            color: subtitleStyles.color,
                            // backgroundColor: "rgba(0, 0, 0, 0.6)",
                            textShadow: subtitleStyles.outline
                                ? `
                    -${subtitleStyles.outline} -${subtitleStyles.outline} 0 ${subtitleStyles.outlineColor},
                    ${subtitleStyles.outline} -${subtitleStyles.outline} 0 ${subtitleStyles.outlineColor},
                    -${subtitleStyles.outline} ${subtitleStyles.outline} 0 ${subtitleStyles.outlineColor},
                    ${subtitleStyles.outline} ${subtitleStyles.outline} 0 ${subtitleStyles.outlineColor}
                  `
                                : "none",
                            padding: "5px",
                            fontSize: subtitleStyles.size,
                            fontFamily: subtitleStyles.font,
                            zIndex: 1,
                        }}>
                        {currentSubtitle}
                    </div>
                )}
            </div>

            <div className="custom-controls">
                <button onClick={togglePlayPause} aria-label="play">
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </button>
                <button onClick={stopVideo} aria-label="stop">
                    <StopIcon />
                </button>
                <button onClick={switchSound} aria-label="volume">
                    {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </button>
            </div>
        </div>
    );
};

export default PreviewPanel;

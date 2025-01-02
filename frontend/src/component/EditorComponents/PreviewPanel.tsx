import React, { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../../context/EditorContext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const PreviewPanel: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const localPlaybackPositionRef = useRef(0); // Ref for latest playback position
    const [isMuted, setIsMuted] = useState(false);
    const [hasTriggered, setHasTriggered] = useState("");
    const [localPlaybackPosition, setLocalPlaybackPosition] = useState(0);
    const videoBlobURLs = useRef(new Map<string, string>());
    const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);

    const {
        playbackPosition,
        setPlaybackPosition,
        isPlaying,
        setIsPlaying,
        videoURL,
        setVideoURL,
        timelineItems,
        pixelsPerSecond,
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
        if (videoRef.current) {
            videoRef.current.pause();
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

            if (videoRef.current) {
                if (videoRef.current.src !== fileURL) {
                    videoRef.current.src = fileURL;
                }
                videoRef.current.load();

                const videoCurrentTime =
                    (playbackPositionPx - videoItem.startPosition) /
                        pixelsPerSecond +
                    videoItem.startTime;

                videoRef.current.currentTime = videoCurrentTime;

                if (isPlaying) {
                    videoRef.current
                        .play()
                        .catch((error) =>
                            console.error("Error playing video:", error)
                        );
                }
            }
        } else if (!videoItem && videoRef.current) {
            videoRef.current.src = "";
            videoRef.current.currentTime = 0;
            setVideoURL(null);
            setHasTriggered("");
        }

        // Obsługa napisów
        if (subtitleItem) {
            setCurrentSubtitle(subtitleItem.name);
        } else {
            setCurrentSubtitle(null);
        }
    }, [localPlaybackPosition, pixelsPerSecond, timelineItems]);

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
            if (videoRef.current && videoURL) videoRef.current.pause();
            setHasTriggered("");
        } else {
            setIsPlaying(true);
        }
    };

    const stopVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
        setPlaybackPosition(0);
        setLocalPlaybackPosition(0);
        setIsPlaying(false);
    };

    const switchSound = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    return (
        <div className="preview-panel">
            <div
                className="preview-panel-video-placeholder"
                style={{ position: "relative" }}>
                {videoURL !== undefined ? (
                    <video ref={videoRef} className="black-screen">
                        <source src={videoURL || ""} type="video/mp4" />
                    </video>
                ) : (
                    <div
                        className="black-screen"
                        style={{ backgroundColor: "red" }}></div>
                )}
                {currentSubtitle && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: "10px",
                            width: "100%",
                            textAlign: "center",
                            color: "white",
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                            padding: "5px",
                            fontSize: "16px",
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

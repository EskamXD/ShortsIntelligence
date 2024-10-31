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
        const videoItem = timelineItems.find(
            (item) =>
                item.type === "video" &&
                playbackPositionPx >= item.startPosition &&
                playbackPositionPx <= item.endPosition
        );
        // console.log("Video item:", videoItem);

        if (videoItem && hasTriggered !== videoItem.id) {
            const fileURL = getVideoBlobURL(videoItem.file, videoItem.id);
            if (videoURL !== fileURL) {
                // console.log("Setting video URL:", fileURL);
                setVideoURL(fileURL);
            }
            setHasTriggered(videoItem.id);

            if (videoRef.current) {
                if (videoRef.current.src !== fileURL) {
                    // console.log("Setting video source:", fileURL);
                    videoRef.current.src = fileURL;
                }
                videoRef.current.load();

                const videoCurrentTime =
                    playbackPosition -
                    videoItem.startPosition / pixelsPerSecond +
                    videoItem.startTime;
                // console.log("Setting video currentTime:", videoCurrentTime);
                videoRef.current.currentTime = videoCurrentTime;

                if (isPlaying) {
                    videoRef.current.play().catch((error) => {
                        console.error("Error playing video:", error);
                    });
                }
            }
        } else if (!videoItem && videoRef.current) {
            // console.log(
            //     "Setting video URL to null",
            //     videoItem,
            //     videoRef.current
            // );
            videoRef.current.src = "";
            videoRef.current.currentTime = 0;
            setVideoURL(null);
            setHasTriggered("");
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
            <div className="preview-panel-video-placeholder">
                {videoURL !== undefined ? (
                    <video ref={videoRef} className="black-screen">
                        <source src={videoURL || ""} type="video/mp4" />
                    </video>
                ) : (
                    <div
                        className="black-screen"
                        style={{ backgroundColor: "red" }}></div>
                )}
            </div>

            <div className="custom-controls">
                <button onClick={togglePlayPause}>
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </button>
                <button onClick={stopVideo}>
                    <StopIcon />
                </button>
                <button onClick={switchSound}>
                    {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </button>
            </div>
        </div>
    );
};

export default PreviewPanel;

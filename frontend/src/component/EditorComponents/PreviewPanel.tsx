import React, { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../../context/EditorContext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";

const PreviewPanel: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const {
        playbackPosition,
        setPlaybackPosition,
        isPlaying,
        setIsPlaying,
        isDragingPlaybackIndicator,
        videoURL,
        halfQualityVideoURL, // Dodane źródło niskiej jakości
        timelineItems,
    } = useEditorContext();

    useEffect(() => {
        console.log(timelineItems);
    }, [timelineItems]);

    useEffect(() => {
        console.log(isDragingPlaybackIndicator);
    }, [isDragingPlaybackIndicator]);

    useEffect(() => {
        if (isDragingPlaybackIndicator && videoRef.current) {
            let animationFrameId: number;

            const updateCurrentTime = () => {
                // Sprawdzamy, czy przeciąganie wskaźnika nadal trwa
                if (!isDragingPlaybackIndicator) {
                    cancelAnimationFrame(animationFrameId);
                    return;
                }

                if (videoRef.current) {
                    // Ustawiamy niską jakość podczas przeciągania
                    if (
                        videoRef.current.src !== halfQualityVideoURL &&
                        halfQualityVideoURL
                    ) {
                        videoRef.current.src = halfQualityVideoURL;
                    }

                    videoRef.current.currentTime = playbackPosition;
                    // console.log(
                    //     "Dragging playback indicator (with requestAnimationFrame and low quality)",
                    //     isDragingPlaybackIndicator
                    // );
                }

                animationFrameId = requestAnimationFrame(updateCurrentTime);
            };

            // Używamy requestAnimationFrame do aktualizacji currentTime
            animationFrameId = requestAnimationFrame(updateCurrentTime);

            return () => cancelAnimationFrame(animationFrameId);
        }
    }, [playbackPosition, isDragingPlaybackIndicator, halfQualityVideoURL]);

    useEffect(() => {
        if (!isDragingPlaybackIndicator && videoRef.current && videoURL) {
            // Po zakończeniu przeciągania wracamy do wysokiej jakości
            if (videoRef.current.src !== videoURL) {
                videoRef.current.src = videoURL;
                videoRef.current.currentTime = playbackPosition;
                // console.log("Switching back to high quality");
            }
        }
    }, [isDragingPlaybackIndicator]);

    useEffect(() => {
        if (!isPlaying && videoURL && videoRef.current) {
            videoRef.current.src = videoURL;
            videoRef.current.currentTime = playbackPosition;
            // console.log("Setting video source and playback position");
        }
    }, [videoURL]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.currentTime = playbackPosition;
            // console.log("Setting playback position");
        }
    }, [playbackPosition]);

    // Funkcja play/pause
    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                // console.log("Pausing video");
            } else {
                videoRef.current.play();
                // console.log("Playing video");
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Funkcja zatrzymania odtwarzania
    const stopVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setPlaybackPosition(0);
            setIsPlaying(false);
            // console.log("Stopping video");
        }
    };

    return (
        <div className="preview-panel">
            <video ref={videoRef}>
                <source src={videoURL || ""} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Niestandardowe kontrolki */}
            <div className="custom-controls">
                <button onClick={togglePlayPause}>
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </button>
                <button onClick={stopVideo}>
                    <StopIcon />
                </button>
            </div>
        </div>
    );
};

export default PreviewPanel;

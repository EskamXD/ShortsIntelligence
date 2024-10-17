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
        videoURL,
    } = useEditorContext();

    useEffect(() => {
        // Zmiana src wideo, gdy zmieni się URL
        if (videoRef.current && videoURL) {
            videoRef.current.src = videoURL;
            videoRef.current.currentTime = playbackPosition; // Ustawiamy wideo na aktualną pozycję
        }
    }, [videoURL]);

    useEffect(() => {
        // Aktualizacja pozycji wideo, gdy zmieni się wskaźnik na osi czasu
        if (
            videoRef.current &&
            playbackPosition !== videoRef.current.currentTime
        ) {
            videoRef.current.currentTime = playbackPosition;
        }
    }, [playbackPosition]);

    // Throttling przy aktualizacji pozycji odtwarzania
    const updatePlaybackPosition = () => {
        if (videoRef.current) {
            setPlaybackPosition(videoRef.current.currentTime);
        }
    };

    // Funkcja play/pause
    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                updatePlaybackPosition();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Funkcja zatrzymania odtwarzania
    const stopVideo = () => {
        if (videoRef.current) {
            console.log(videoRef);
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setPlaybackPosition(0); // Reset playbackPosition do początku
            setIsPlaying(false);
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


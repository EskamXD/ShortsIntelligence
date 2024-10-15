import React, { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../../context/EditorContext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";

interface PreviewPanelProps {
    isPlaying: boolean; // Stan odtwarzania
    setIsPlaying: (isPlaying: boolean) => void; // Funkcja do ustawiania stanu odtwarzania
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
    isPlaying,
    setIsPlaying,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const { setPlaybackPosition } = useEditorContext();

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
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setPlaybackPosition(0); // Reset playbackPosition do początku
            setIsPlaying(false);
        }
    };

    return (
        <div className="preview-panel">
            <video ref={videoRef}>
                <source src={""} type="video/mp4" />
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

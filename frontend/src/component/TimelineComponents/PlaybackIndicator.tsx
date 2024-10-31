import React from "react";

interface PlaybackIndicatorProps {
    localPlaybackPosition: number;
    pixelsPerSecond: number;
    handleMouseDown: (event: React.MouseEvent) => void;
}

const PlaybackIndicator: React.FC<PlaybackIndicatorProps> = ({
    localPlaybackPosition,
    pixelsPerSecond,
    handleMouseDown,
}) => {
    return (
        <div
            id="playback-indicator"
            className="playback-indicator"
            style={{
                left: `${localPlaybackPosition * pixelsPerSecond}px`,
            }}>
            <div className="grab-handle" onMouseDown={handleMouseDown} />
        </div>
    );
};

export default PlaybackIndicator;

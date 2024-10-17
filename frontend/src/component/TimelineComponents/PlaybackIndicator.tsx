import React from "react";
import { useEditorContext } from "../../context/EditorContext";

interface PlaybackIndicatorProps {
    localPlaybackPosition: number;
    pixelsPerSecond: number;
    zoom: number;
    handleMouseDown: (event: React.MouseEvent) => void;
}

const PlaybackIndicator: React.FC<PlaybackIndicatorProps> = ({
    localPlaybackPosition,
    pixelsPerSecond,
    zoom,
    handleMouseDown,
}) => {
    const { timelinePanelWidth } = useEditorContext();
    return (
        <div
            className="playback-indicator"
            style={{
                left: `${localPlaybackPosition * pixelsPerSecond * zoom}px`,
            }}>
            <div className="grab-handle" onMouseDown={handleMouseDown} />
        </div>
    );
};

export default PlaybackIndicator;


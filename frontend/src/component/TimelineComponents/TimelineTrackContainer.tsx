import React, { useEffect } from "react";
import TimelineTrack from "../TimelineComponents/TimelineTrack";
import { useEditorContext } from "../../context/EditorContext";

interface TimelineTrackContainerProps {
    videoTrack: { name: string; duration: number }[];
    audioTrack: { name: string; duration: number }[];
    zoom: number;
    pixelsPerSecond: number;
    files: File[];
    scrollLeft: number;
    timelinePanelWidth: number;
}

const TimelineTrackContainer: React.FC<TimelineTrackContainerProps> = ({
    videoTrack,
    audioTrack,
    pixelsPerSecond,
    scrollLeft,
}) => {
    const { zoom } = useEditorContext();
    return (
        <div
            className="d-flex flex-column"
            style={{ width: `${6000 * zoom}px` }}>
            <TimelineTrack
                trackType="video"
                trackItems={videoTrack}
                pixelsPerSecond={pixelsPerSecond}
                scrollLeft={Number(scrollLeft)}
            />
            <TimelineTrack
                trackType="audio"
                trackItems={audioTrack}
                pixelsPerSecond={pixelsPerSecond}
                scrollLeft={Number(scrollLeft)}
            />
        </div>
    );
};

export default TimelineTrackContainer;

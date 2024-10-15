import React, { useEffect } from "react";
import TimelineTrack from "../TimelineComponents/TimelineTrack";

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
    zoom,
    pixelsPerSecond,
    files,
    scrollLeft,
    timelinePanelWidth,
}) => {
    // useEffect(() => {
    //     console.log("Scroll left:", scrollLeft);
    // }, [scrollLeft]);

    return (
        <div
            className="d-flex flex-column"
            style={{ width: `${6000 * zoom}px` }}>
            <TimelineTrack
                trackType="video"
                trackItems={videoTrack}
                zoom={zoom}
                pixelsPerSecond={pixelsPerSecond}
                files={files}
                scrollLeft={Number(scrollLeft)}
                timelinePanelWidth={timelinePanelWidth}
            />
            <TimelineTrack
                trackType="audio"
                trackItems={audioTrack}
                zoom={zoom}
                pixelsPerSecond={pixelsPerSecond}
                files={files}
                scrollLeft={Number(scrollLeft)}
                timelinePanelWidth={timelinePanelWidth}
            />
        </div>
    );
};

export default TimelineTrackContainer;

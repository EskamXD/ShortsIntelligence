import React, { useState } from "react";
import TimelineSlider from "../TimelineComponents/TimelineSlider";
import TimelineTrack from "../TimelineComponents/TimelineTrack"; // Importujemy komponent TimelineTrack

interface TimelinePanelProps {
    files: File[];
    subtitles: string;
}

const TimelinePanel: React.FC<TimelinePanelProps> = ({ files, subtitles }) => {
    const [videoTrack1, setVideoTrack1] = useState<
        { name: string; width: number }[]
    >([]);
    const [audioTrack1, setAudioTrack1] = useState<
        { name: string; width: number }[]
    >([]);
    const [timelineOffset, setTimelineOffset] = useState(0);
    const [zoom, setZoom] = useState(1);

    const timelineLength = 600; // Oś czasu: 600 sekund = 10 minut

    const calculateWidth = (duration: number) => {
        const pixelsPerSecond = 10;
        return duration * pixelsPerSecond * zoom;
    };

    const handleDropFile = (file: File, trackType: string) => {
        const mediaElement =
            trackType === "video"
                ? document.createElement("video")
                : document.createElement("audio");
        mediaElement.src = URL.createObjectURL(file);

        mediaElement.addEventListener("loadedmetadata", () => {
            const duration = mediaElement.duration;
            const width = calculateWidth(duration);

            if (trackType === "video") {
                setVideoTrack1((prev) => [...prev, { name: file.name, width }]);
            } else if (trackType === "audio") {
                setAudioTrack1((prev) => [...prev, { name: file.name, width }]);
            }
        });
    };

    const handleTimelineScroll = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTimelineOffset(parseInt(event.target.value));
    };

    const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setZoom(parseFloat(event.target.value));
    };

    const generateTimelineScale = (length: number) => {
        const scale = [];
        const step = 60;
        for (let i = 0; i <= length; i += step) {
            scale.push(`${i / 60}:00`);
        }
        return scale;
    };

    const timelineScale = generateTimelineScale(timelineLength);

    return (
        <div className="timeline-panel" style={{ overflow: "hidden" }}>
            <h3>Timeline</h3>

            <div
                className="timeline-scale d-flex"
                style={{
                    display: "flex",
                    position: "relative",
                    left: `-${timelineOffset}px`,
                    width: `${timelineLength * 10 * zoom}px`, // Skala zoom wpływa na szerokość osi czasu
                }}>
                {timelineScale.map((time, index) => (
                    <div
                        key={index}
                        style={{
                            flex: 1,
                            textAlign: "center",
                            borderRight: "1px solid #ccc",
                        }}>
                        {time}
                    </div>
                ))}
            </div>

            {/* Suwak do przewijania osi czasu */}
            <div style={{ marginTop: "10px" }}>
                <TimelineSlider
                    timelineOffset={timelineOffset}
                    handleTimeLineScroll={handleTimelineScroll}
                />
            </div>

            {/* Suwak do zmiany zoomu */}
            <div style={{ marginTop: "10px" }}>
                <label>Zoom: </label>
                <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={handleZoomChange}
                    style={{ width: "100%" }}
                />
            </div>

            <div className="d-flex flex-column" style={{ overflowY: "scroll" }}>
                {/* Ścieżka wideo */}
                <TimelineTrack
                    trackType="video"
                    trackItems={videoTrack1}
                    onDropFile={handleDropFile}
                    timelineOffset={timelineOffset}
                    zoom={zoom}
                    files={files}
                />

                {/* Ścieżka audio */}
                <TimelineTrack
                    trackType="audio"
                    trackItems={audioTrack1}
                    onDropFile={handleDropFile}
                    timelineOffset={timelineOffset}
                    zoom={zoom}
                    files={files}
                />
            </div>
        </div>
    );
};

export default TimelinePanel;

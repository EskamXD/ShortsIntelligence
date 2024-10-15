import React from "react";

interface TimelineScaleProps {
    timelineScale: {
        timeInSeconds: number;
        label: string;
        isMajor: boolean;
    }[];
    zoom: number;
    pixelsPerSecond: number;
}

const TimelineScale: React.FC<TimelineScaleProps> = ({
    timelineScale,
    zoom,
    pixelsPerSecond,
}) => {
    return (
        <div
            className="timeline-scale d-flex"
            style={{ width: `${6000 * zoom}px` }}>
            {timelineScale.map((tick, index) => (
                <div
                    key={index}
                    className="timeline-tick"
                    style={{
                        left: `${
                            tick.timeInSeconds * pixelsPerSecond * zoom
                        }px`,
                        borderRight: tick.isMajor
                            ? "1px solid #ccc"
                            : "1px solid #eee",
                        height: tick.isMajor ? "20px" : "10px",
                    }}>
                    {tick.isMajor && (
                        <div
                            className="timeline-tick-label"
                            style={{
                                left:
                                    index === 0
                                        ? "100%"
                                        : index === timelineScale.length - 1
                                        ? "50%"
                                        : "100%",
                                transform:
                                    index !== 0 ? "translateX(-50%)" : "none",
                            }}>
                            {tick.label}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TimelineScale;

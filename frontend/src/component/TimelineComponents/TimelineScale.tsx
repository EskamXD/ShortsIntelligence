import React, { forwardRef } from "react";

interface TimelineScaleProps {
    timelineScale: {
        timeInSeconds: number;
        label: string;
        isMajor: boolean;
    }[];
    pixelsPerSecond: number;
    handleMouseDown: (event: React.MouseEvent) => void;
}

const TimelineScale: React.FC<TimelineScaleProps> = ({
    timelineScale,
    pixelsPerSecond,
    handleMouseDown,
}) => {
    return (
        <div
            id="timeline-scale"
            className="timeline-scale d-flex"
            style={{ width: `${6000}px` }}
            onClick={handleMouseDown}>
            {timelineScale.map((tick, index) => (
                <div
                    key={index}
                    className="timeline-tick"
                    style={{
                        left: `${tick.timeInSeconds * pixelsPerSecond}px`,
                        borderRight: tick.isMajor
                            ? "1px solid #ccc"
                            : "1px solid #eee",
                        height: tick.isMajor ? "35px" : "20px",
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

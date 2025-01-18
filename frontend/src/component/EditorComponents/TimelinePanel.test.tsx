import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import TimelinePanel from "./TimelinePanel";
import { EditorContext } from "../../context/EditorContext";
import { TrackItem } from "../../interfaces";

const timelineItems: TrackItem[] = [
    {
        id: "1",
        name: "Sample Media Item",
        type: "video", // Typ elementu (np. video, audio itp.)
        file: new File([""], "sample.mp4", { type: "video/mp4" }), // Możesz użyć mockowanego pliku, jeśli wymagane
        durationInS: 10,
        durationInPx: 300,
        startPosition: 0,
        startTime: 0,
        endPosition: 300, // Przykładowe wartości
    },
];

const mockContextValue = {
    effects: [],
    files: [],
    halfQualityVideoURL: null,
    isDragingPlaybackIndicator: false,
    isPlaying: false,
    pixelsPerSecond: 30,
    playbackPosition: 0,
    projectID: -1,
    quarterQualityVideoURL: null,
    subtitles: "",
    timelineItems: timelineItems,
    timelinePanelWidth: 600,
    timelineTrackContainerWidthPx: 6000,
    videoURL: null,
    zoom: 1,
    setEffects: jest.fn(),
    setFiles: jest.fn(),
    setHalfQualityVideoURL: jest.fn(),
    setIsDragingPlaybackIndicator: jest.fn(),
    setIsPlaying: jest.fn(),
    setPixelsPerSecond: jest.fn(),
    setPlaybackPosition: jest.fn(),
    setProjectID: jest.fn(),
    setQuarterQualityVideoURL: jest.fn(),
    setSubtitles: jest.fn(),
    setTimelineItems: jest.fn(),
    setTimelinePanelWidth: jest.fn(),
    setTimeLineTrackContainerWidthPx: jest.fn(),
    setVideoURL: jest.fn(),
    setZoom: jest.fn(),
};

const MockEditorContextProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => (
    <EditorContext.Provider value={mockContextValue}>
        {children}
    </EditorContext.Provider>
);

test("renders playback position and zoom info", () => {
    render(
        <MockEditorContextProvider>
            <TimelinePanel />
        </MockEditorContextProvider>
    );

    expect(screen.getByText(/Zoom:/i)).toBeInTheDocument();

    // Get all elements matching the text
    const allTimeElements = screen.getAllByText(/00:00:00:00/i);

    // Assume the one inside "current-time" is the first
    const timeElement = allTimeElements.find((el) =>
        el.closest(".current-time")
    );

    expect(timeElement).toBeInTheDocument();

    // Check if the parent has the class "current-time"
    if (timeElement)
        expect(timeElement.closest(".current-time")).toBeInTheDocument();
});

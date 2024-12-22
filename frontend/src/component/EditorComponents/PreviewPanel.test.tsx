import React from "react";
import { render, screen } from "@testing-library/react";
import PreviewPanel from "./PreviewPanel";
import { EditorContext } from "../../context/EditorContext"; // Adjust import path
import { TrackItem } from "../../interfaces"; // Adjust import path

// Mock the `URL.revokeObjectURL` and `URL.createObjectURL`
beforeAll(() => {
    global.URL.revokeObjectURL = jest.fn();
    global.URL.createObjectURL = jest.fn();
});

// Mock `HTMLMediaElement` methods
beforeAll(() => {
    Object.defineProperty(HTMLMediaElement.prototype, "load", {
        configurable: true,
        value: jest.fn(),
    });
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
        configurable: true,
        value: jest.fn(),
    });
    Object.defineProperty(HTMLMediaElement.prototype, "pause", {
        configurable: true,
        value: jest.fn(),
    });
});

// Clean up mocks after the tests
afterAll(() => {
    (global.URL.revokeObjectURL as any) = undefined;
    (global.URL.createObjectURL as any) = undefined;
    delete (HTMLMediaElement.prototype as any).load;
    delete (HTMLMediaElement.prototype as any).play;
    delete (HTMLMediaElement.prototype as any).pause;
});

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

test("renders video controls", () => {
    render(
        <EditorContext.Provider value={mockContextValue}>
            <PreviewPanel />
        </EditorContext.Provider>
    );

    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /volume/i })).toBeInTheDocument();
});

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { EditorContext } from "../../context/EditorContext";
import SubtitlesPanel from "./SubtitlesPanel";
import "@testing-library/jest-dom";
import { fetchSubtitles } from "../../api/apiService";

jest.mock("../../api/apiService", () => ({
    fetchSubtitles: jest.fn(() => Promise.resolve("Fetched Subtitles")),
}));

let dynamicSubtitles = ""; // Dynamiczna wartość subtitles

const mockSetSubtitles = jest.fn((newSubtitles) => {
    dynamicSubtitles = newSubtitles; // Aktualizacja dynamicznej wartości
});

const mockContextValue = {
    effects: [],
    files: [],
    halfQualityVideoURL: null,
    isDragingPlaybackIndicator: false,
    isPlaying: false,
    pixelsPerSecond: 30,
    playbackPosition: 0,
    projectID: 7,
    quarterQualityVideoURL: null,
    subtitles: dynamicSubtitles,
    timelineItems: [],
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
    setSubtitles: mockSetSubtitles,
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

const refreshView = () => {
    render(
        <EditorContext.Provider
            value={{ ...mockContextValue, subtitles: dynamicSubtitles }}>
            <SubtitlesPanel />
        </EditorContext.Provider>
    );
};

test("renders textarea for subtitles", () => {
    render(
        <MockEditorContextProvider>
            <SubtitlesPanel />
        </MockEditorContextProvider>
    );

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
});

test("updates subtitles text on input", async () => {
    refreshView();

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

    // Symuluj wprowadzenie tekstu
    fireEvent.change(textarea, { target: { value: "New Subtitle Text" } });

    // Oczekuj, że wartość `textarea` się zmieni
    expect(dynamicSubtitles).toBe("New Subtitle Text");
    expect(mockSetSubtitles).toHaveBeenCalledWith("New Subtitle Text");
});

test("fetches and sets subtitles on load", async () => {
    (fetchSubtitles as jest.Mock).mockResolvedValueOnce("Fetched Subtitles");

    await act(async () => {
        refreshView();
    });

    // Sprawdź, czy `fetchSubtitles` zostało wywołane z odpowiednim `projectID`
    expect(fetchSubtitles).toHaveBeenCalledWith(7);

    // Sprawdź, czy `setSubtitles` zostało wywołane z odpowiednimi napisami
    expect(mockSetSubtitles).toHaveBeenCalledWith("Fetched Subtitles");
    expect(dynamicSubtitles).toBe("Fetched Subtitles");
});

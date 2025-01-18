import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorContext } from "../../context/EditorContext";
import FileToolsPanel from "./FileToolsPanel";
import "@testing-library/jest-dom";
import { useFileManagement } from "../../hooks/useFileManagement";

// Mockowanie useFileManagement
jest.mock("../../hooks/useFileManagement", () => ({
    useFileManagement: jest.fn(),
}));

const mockRemoveFile = jest.fn();
const mockSetFiles = jest.fn();

const mockFileManagementValue = {
    files: [
        {
            name: "test-file.txt",
            type: "text/plain",
        },
    ],
    addFiles: jest.fn(),
    removeFile: mockRemoveFile,
    handleDrop: jest.fn(),
    uploading: false,
    inputKey: "test-key",
};

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

test("handles drag and drop", () => {
    (useFileManagement as jest.Mock).mockReturnValue(mockFileManagementValue);

    render(
        <MockEditorContextProvider>
            <FileToolsPanel />
        </MockEditorContextProvider>
    );

    const deleteArea = screen.getByTestId("DeleteIcon").closest(".delete-file");
    expect(deleteArea).toBeInTheDocument();

    fireEvent.dragOver(deleteArea!);
    fireEvent.drop(deleteArea!, {
        dataTransfer: {
            getData: jest.fn(() => "test-file.txt"),
        },
    });

    expect(mockRemoveFile).toHaveBeenCalledWith("test-file.txt");
    expect(mockSetFiles).not.toHaveBeenCalled(); // Upewnij się, że `setFiles` nie jest wywoływane.
});

test("renders file tools panel", () => {
    render(
        <MockEditorContextProvider>
            <FileToolsPanel />
        </MockEditorContextProvider>
    );
    expect(screen.getByText(/Files/i)).toBeInTheDocument();
});

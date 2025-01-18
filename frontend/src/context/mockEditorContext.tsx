import { EditorProvider } from "./EditorContext";

const mockEditorContext = {
    playbackPosition: 0,
    setPlaybackPosition: jest.fn(),
    isPlaying: false,
    setIsPlaying: jest.fn(),
    videoURL: "",
    setVideoURL: jest.fn(),
    timelineItems: [],
    setTimelineItems: jest.fn(),
    pixelsPerSecond: 30,
    setTimelinePanelWidth: jest.fn(),
    setIsDragingPlaybackIndicator: jest.fn(),
};

export const MockEditorContextProvider = ({ children }) => (
    <EditorProvider value={mockEditorContext}>{children}</EditorProvider>
);

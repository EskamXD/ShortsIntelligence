import React, { createContext, useContext, useState, ReactNode } from "react";
import { TrackItem } from "../interfaces";

interface EditorContextType {
    effects: string[];
    files: File[];
    halfQualityVideoURL: string | null;
    isDragingPlaybackIndicator: boolean;
    isPlaying: boolean;
    pixelsPerSecond: number;
    playbackPosition: number;
    projectID: number;
    quarterQualityVideoURL: string | null;
    subtitles: string;
    timelineItems: TrackItem[];
    timelinePanelWidth: number;
    timelineTrackContainerWidthPx: number;
    videoURL: string | null;
    zoom: number;
    setEffects: (effects: string[]) => void;
    setFiles: (files: File[]) => void;
    setHalfQualityVideoURL: (url: string | null) => void;
    setIsDragingPlaybackIndicator: (
        isDragingPlaybackIndicator: boolean
    ) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setPixelsPerSecond: (pixelsPerSecond: number) => void;
    setPlaybackPosition: (position: number) => void;
    setProjectID: (projectID: number) => void;
    setQuarterQualityVideoURL: (url: string | null) => void;
    setSubtitles: (subtitles: string) => void;
    setTimelineItems: React.Dispatch<React.SetStateAction<TrackItem[]>>;
    setTimelinePanelWidth: (width: number) => void;
    setTimeLineTrackContainerWidthPx: (width: number) => void;
    setVideoURL: (url: string | null) => void;
    setZoom: (zoom: number) => void;
}

interface EditorProviderProps {
    children: ReactNode;
}

// Kontekst
const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditorContext = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error(
            "useEditorContext must be used within a EditorProvider"
        );
    }
    return context;
};

// Provider kontekstu
export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
    const [effects, setEffects] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [halfQualityVideoURL, setHalfQualityVideoURL] = useState<
        string | null
    >(null);
    const [isDragingPlaybackIndicator, setIsDragingPlaybackIndicator] =
        useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [pixelsPerSecond, setPixelsPerSecond] = useState<number>(100);
    const [playbackPosition, setPlaybackPosition] = useState<number>(0);
    const [projectID, setProjectID] = useState<number>(-1);
    const [quarterQualityVideoURL, setQuarterQualityVideoURL] = useState<
        string | null
    >(null);
    const [subtitles, setSubtitles] = useState<string>("");
    const [timelineItems, setTimelineItems] = useState<TrackItem[]>([]);
    const [timelinePanelWidth, setTimelinePanelWidth] = useState<number>(0);
    const [timelineTrackContainerWidthPx, setTimeLineTrackContainerWidthPx] =
        useState<number>(6000);
    const [videoURL, setVideoURL] = useState<string | null>(null);
    const [zoom, setZoom] = useState<number>(1.0);

    const value = {
        effects,
        files,
        halfQualityVideoURL,
        isDragingPlaybackIndicator,
        isPlaying,
        pixelsPerSecond,
        playbackPosition,
        projectID,
        quarterQualityVideoURL,
        subtitles,
        timelineItems,
        timelinePanelWidth,
        timelineTrackContainerWidthPx,
        videoURL,
        zoom,
        setEffects,
        setFiles,
        setHalfQualityVideoURL,
        setIsDragingPlaybackIndicator,
        setIsPlaying,
        setPixelsPerSecond,
        setPlaybackPosition,
        setProjectID,
        setQuarterQualityVideoURL,
        setSubtitles,
        setTimelineItems,
        setTimelinePanelWidth,
        setTimeLineTrackContainerWidthPx,
        setVideoURL,
        setZoom,
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};

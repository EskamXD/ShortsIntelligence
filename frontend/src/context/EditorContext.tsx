import React, { createContext, useContext, useState, ReactNode } from "react";
import { TrackItem } from "../interfaces";

interface EditorContextType {
    files: File[];
    videoURL: string | null;
    halfQualityVideoURL: string | null;
    quarterQualityVideoURL: string | null;
    effects: string[];
    subtitles: string;
    playbackPosition: number;
    isPlaying: boolean;
    isDragingPlaybackIndicator: boolean;
    zoom: number;
    timelinePanelWidth: number;
    timelineItems: TrackItem[];
    setFiles: (files: File[]) => void;
    setVideoURL: (url: string | null) => void;
    setHalfQualityVideoURL: (url: string | null) => void;
    setQuarterQualityVideoURL: (url: string | null) => void;
    setEffects: (effects: string[]) => void;
    setSubtitles: (subtitles: string) => void;
    setPlaybackPosition: (position: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setIsDragingPlaybackIndicator: (
        isDragingPlaybackIndicator: boolean
    ) => void;
    setZoom: (zoom: number) => void;
    setTimelinePanelWidth: (width: number) => void;
    setTimelineItems: React.Dispatch<React.SetStateAction<TrackItem[]>>;
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
    const [files, setFiles] = useState<File[]>([]);
    const [videoURL, setVideoURL] = useState<string | null>(null);
    const [halfQualityVideoURL, setHalfQualityVideoURL] = useState<
        string | null
    >(null);
    const [quarterQualityVideoURL, setQuarterQualityVideoURL] = useState<
        string | null
    >(null);
    const [effects, setEffects] = useState<string[]>([]);
    const [subtitles, setSubtitles] = useState<string>("");
    const [playbackPosition, setPlaybackPosition] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isDragingPlaybackIndicator, setIsDragingPlaybackIndicator] =
        useState<boolean>(false);
    const [zoom, setZoom] = useState<number>(1.0);
    const [timelinePanelWidth, setTimelinePanelWidth] = useState<number>(0);
    const [timelineItems, setTimelineItems] = useState<TrackItem[]>([]);

    const value = {
        files,
        videoURL,
        halfQualityVideoURL,
        quarterQualityVideoURL,
        effects,
        subtitles,
        playbackPosition,
        isPlaying,
        isDragingPlaybackIndicator,
        zoom,
        timelinePanelWidth,
        timelineItems,
        setFiles,
        setVideoURL,
        setHalfQualityVideoURL,
        setQuarterQualityVideoURL,
        setEffects,
        setSubtitles,
        setPlaybackPosition,
        setIsPlaying,
        setIsDragingPlaybackIndicator,
        setZoom,
        setTimelinePanelWidth,
        setTimelineItems,
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};

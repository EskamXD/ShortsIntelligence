import React, { createContext, useContext, useState, ReactNode } from "react";

// Typy stanów
interface TimelineItem {
    name: string;
    type: "video" | "audio";
    startTime: number; // Pozycja początkowa na osi czasu
    duration: number; // Czas trwania w sekundach
    file: File; // Odniesienie do pliku
}

interface EditorContextType {
    files: File[];
    videoURL: string | null;
    effects: string[];
    subtitles: string;
    playbackPosition: number;
    isPlaying: boolean;
    zoom: number;
    timelinePanelWidth: number;
    timelineItems: TimelineItem[];
    setFiles: (files: File[]) => void;
    setVideoURL: (url: string | null) => void;
    setEffects: (effects: string[]) => void;
    setSubtitles: (subtitles: string) => void;
    setPlaybackPosition: (position: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setZoom: (zoom: number) => void;
    setTimelinePanelWidth: (width: number) => void;
    setTimelineItems: (items: TimelineItem[]) => void;
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
    const [effects, setEffects] = useState<string[]>([]);
    const [subtitles, setSubtitles] = useState<string>("");
    const [playbackPosition, setPlaybackPosition] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [zoom, setZoom] = useState<number>(1); // Dodajemy zoom
    const [timelinePanelWidth, setTimelinePanelWidth] = useState<number>(0);
    const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);

    const value = {
        files,
        videoURL,
        effects,
        subtitles,
        playbackPosition,
        isPlaying,
        zoom,
        timelinePanelWidth,
        timelineItems,
        setFiles,
        setVideoURL,
        setEffects,
        setSubtitles,
        setPlaybackPosition,
        setIsPlaying,
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

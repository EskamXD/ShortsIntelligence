export interface TrackItem {
    id: string; // Unique identifier UUIDv4
    type: "video" | "audio" | "subtitles"; // Item type
    file: File | null; // Item file
    name: string; // Item name
    durationInS: number; // Item duration in seconds
    durationInPx: number; // Item width in pixels
    startPosition: number; // Item start position on timeline in pixels
    startTime: number; // Start time of item itself in seconds
    endPosition: number; // Item end position on timeline in pixels
}

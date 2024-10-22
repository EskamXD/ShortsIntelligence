export interface TrackItem {
    id: string; // Unique identifier UUIDv4
    type: "video" | "audio"; // Item type
    name: string; // Item name
    duration: number; // Item duration in seconds
    itemWidth: number; // Item width in pixels
    leftOffset: number; // Item left offset in pixels
    startPosition: number; // Item start position in pixels
}


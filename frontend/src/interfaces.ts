export interface TrackItem {
    id: string;
    type: "video" | "audio";
    name: string;
    duration: number;
    leftOffset: number; // Pozycja elementu na osi czasu
    itemWidth: number; // Szerokość elementu w pikselach
    startPosition: number;
}

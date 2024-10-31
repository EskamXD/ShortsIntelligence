import React from "react";

interface TimelineSliderProps {
    playbackPosition: number; // Pozycja odtwarzania w sekundach
    onSliderChange: (newPosition: number) => void; // Funkcja do zmiany pozycji odtwarzania
    timelineLength: number; // Długość timeline'a w sekundach
    pixelsPerSecond: number; // Piksele na sekundę
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({
    playbackPosition,
    onSliderChange,
    timelineLength,
}) => {
    // Funkcja obsługująca zmianę wskaźnika odtwarzania
    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newPosition = parseFloat(event.target.value);
        onSliderChange(newPosition); // Wywołujemy funkcję, która aktualizuje playbackPosition
    };

    return (
        <input
            type="range"
            min="0"
            max={timelineLength}
            value={playbackPosition} // Używamy playbackPosition jako wartości slidera
            step={0.1} // Slider operuje na sekundach z precyzją do 0.1
            style={{ width: "100%" }}
            onChange={handleSliderChange} // Wywołujemy handleSliderChange przy przesunięciu slidera
        />
    );
};

export default TimelineSlider;

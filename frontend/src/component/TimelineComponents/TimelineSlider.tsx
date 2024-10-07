import React, { useState, useEffect } from "react";

interface TimelineSliderProps {
    timelineOffset: number;
    handleTimeLineScroll: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({
    timelineOffset,
    handleTimeLineScroll,
}) => {
    const [maxValue, setMaxValue] = useState(2400); // Wartość początkowa

    // Funkcja do przeliczania `60vw` i `4rem`
    const calculateMaxValue = () => {
        const viewportWidth = window.innerWidth; // Pobierz szerokość okna przeglądarki
        const remInPx = parseFloat(
            getComputedStyle(document.documentElement).fontSize
        ); // Pobierz rozmiar `rem` w pikselach
        const max = 3000 - (0.6 * viewportWidth - 4 * remInPx); // Oblicz nową wartość maksymalną
        setMaxValue(max); // Ustawienie wartości max
    };

    // Przelicz wartości, gdy komponent się montuje oraz gdy zmienia się rozmiar okna
    useEffect(() => {
        calculateMaxValue();
        window.addEventListener("resize", calculateMaxValue); // Przeliczaj przy zmianie rozmiaru okna

        return () => {
            window.removeEventListener("resize", calculateMaxValue);
        };
    }, []);

    return (
        <input
            type="range"
            min="0"
            max={maxValue} // Dynamicznie obliczona wartość maksymalna
            value={timelineOffset}
            onChange={handleTimeLineScroll}
            style={{ width: "100%" }}
        />
    );
};

export default TimelineSlider;

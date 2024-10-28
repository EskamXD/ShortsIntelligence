export const formatTime = (timeInSeconds: number, fps: number) => {
    // Przeliczanie do odpowiednich wartości czasowych
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const frames = Math.round((timeInSeconds % 1) * fps);

    // Formatowanie do `00:00:MM:SS` bez godzin
    const returnValue = `00:${String(minutes).padStart(2, "0")}:${String(
        seconds
    ).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;

    console.log("Return value:", returnValue);

    return returnValue;
};

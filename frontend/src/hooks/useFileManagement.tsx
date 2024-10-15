import { useState, useCallback } from "react";
import { useEditorContext } from "../context/EditorContext";

export const useFileManagement = () => {
    const { files, setFiles } = useEditorContext();
    const [inputKey, setInputKey] = useState(0); // Aby resetować input

    // Dodaj plik
    const addFile = useCallback(
        (file: File) => {
            console.log("Próba dodania pliku:", file.name);
            // Sprawdź, czy plik już istnieje
            const isFileExist = files.some((f) => f.name === file.name);
            console.log("Czy plik już istnieje?", isFileExist);

            if (!isFileExist) {
                // Tworzymy nową tablicę plików i ustawiamy ją w stanie
                const newFiles = [...files, file];
                setFiles(newFiles);
                console.log("Dodano plik:", file.name, newFiles);
                setInputKey((prevKey) => prevKey + 1); // Reset input po dodaniu pliku
            } else {
                console.log("Plik już istnieje i nie można dodać:", file.name);
            }
        },
        [files, setFiles]
    );

    // Usuń plik
    const removeFile = useCallback(
        (fileName: string) => {
            console.log("Próba usunięcia pliku:", fileName);
            // Tworzymy nową tablicę z usuniętym plikiem
            const newFiles = files.filter((file) => file.name !== fileName);
            setFiles(newFiles);
            console.log("Plik usunięty:", fileName, newFiles);
            setInputKey((prevKey) => prevKey + 1); // Reset input po usunięciu pliku
        },
        [files, setFiles]
    );

    // Obsługa przeciągania i upuszczania plików
    const handleDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const fileName = event.dataTransfer.getData("text/plain");
            const file = files.find((file) => file.name === fileName);
            console.log("Przeciągnięto plik:", file ? file.name : "brak pliku");

            if (file) {
                addFile(file);
            }

            // Resetuj dataTransfer po zakończeniu operacji
            event.dataTransfer.clearData();
        },
        [addFile]
    );

    return {
        files,
        addFile,
        removeFile,
        handleDrop,
        inputKey, // Klucz do resetu input[type="file"]
    };
};

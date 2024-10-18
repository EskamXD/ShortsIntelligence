import { useState, useCallback } from "react";
import { useEditorContext } from "../context/EditorContext";

export const useFileManagement = () => {
    const { files, setFiles } = useEditorContext();
    const [inputKey, setInputKey] = useState(0); // Aby resetować input

    // Dodaj wiele plików
    const addFiles = useCallback(
        (newFiles: File[]) => {
            // Logujemy każdy plik
            newFiles.forEach((file) => {
                console.log("Próba dodania pliku:", file.name);
            });

            // Filtrujemy nowe pliki, aby dodać tylko te, które jeszcze nie istnieją
            const filesToAdd = newFiles.filter(
                (file) => !files.some((f) => f.name === file.name)
            );

            if (filesToAdd.length > 0) {
                // Tworzymy nową tablicę z istniejącymi plikami i nowymi plikami
                const updatedFiles = [...files, ...filesToAdd];
                setFiles(updatedFiles);

                filesToAdd.forEach((file) => {
                    console.log("Dodano plik:", file.name);
                });

                setInputKey((prevKey) => prevKey + 1); // Reset input po dodaniu pliku
            } else {
                console.log(
                    "Żaden nowy plik nie został dodany. Wszystkie pliki już istnieją."
                );
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

            // Pobieramy wszystkie pliki przeciągnięte do obszaru
            const droppedFiles = event.dataTransfer.files;
            if (droppedFiles.length > 0) {
                // Konwertujemy FileList do tablicy i przekazujemy do addFiles
                const filesArray = Array.from(droppedFiles);
                console.log(
                    "Przeciągnięto pliki:",
                    filesArray.map((file) => file.name)
                );

                addFiles(filesArray); // Dodajemy wszystkie pliki naraz
            }

            // Resetuj dataTransfer po zakończeniu operacji
            event.dataTransfer.clearData();
        },
        [addFiles] // Zależy od addFiles
    );

    return {
        files,
        addFiles,
        removeFile,
        handleDrop,
        inputKey, // Klucz do resetu input[type="file"]
    };
};

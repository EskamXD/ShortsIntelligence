import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import DeleteIcon from "@mui/icons-material/Delete";
import FileInputButton from "./FileInputButton";

interface FileToolsPanelProps {
    onFileChange: (file: File) => void; // Funkcja do obsługi zmiany pliku
    files: File[]; // Aktualnie wybrane pliki
    setFiles: (files: File[]) => void;
}

const FileToolsPanel: React.FC<FileToolsPanelProps> = ({
    onFileChange,
    files,
    setFiles,
}) => {
    const [fileList, setFileList] = useState<File[]>([]);

    useEffect(() => {
        const handleFileChange = (newFiles: File[]) => {
            // Sprawdzamy, czy plik jest nowy, porównując nazwy plików
            const updatedFileList = newFiles.filter(
                (newFile) =>
                    !fileList.some((file) => file.name === newFile.name)
            );

            if (updatedFileList.length > 0) {
                console.log("Adding new files:", updatedFileList);
                setFileList((prevFiles) => [...prevFiles, ...updatedFileList]);
            }
        };

        // Wywołujemy handleFileChange tylko wtedy, gdy pliki się zmieniły
        if (files.length > 0) {
            handleFileChange(files);
        }
    }, [files, fileList]); // Sprawdzamy, czy pliki się zmieniły

    const handleRemoveFile = (fileName: string) => {
        console.log("Removing file:", fileName);
        const updatedFiles = fileList.filter((file) => file.name !== fileName);
        console.log("Updated files:", updatedFiles);
        setFileList(updatedFiles);
        setFiles(updatedFiles);
    };

    const handleFileDragStart = (
        event: React.DragEvent<HTMLElement>,
        file: File
    ) => {
        // Zapisujemy dane pliku jako string w dataTransfer
        event.dataTransfer.setData("text/plain", file.name);
        console.log("Dragging file:", file);
    };

    const handleDragOver = (event: React.DragEvent<any>) => {
        event.preventDefault(); // Aby obsłużyć upuszczanie, musimy zapobiec domyślnemu zachowaniu przeglądarki
    };

    const handleDrop = (event: React.DragEvent<any>) => {
        event.preventDefault();
        const fileData = event.dataTransfer.getData("file"); // Pobranie danych pliku
        const fileInfo = JSON.parse(fileData); // Parsowanie danych pliku
        handleRemoveFile(fileInfo.name); // Usunięcie pliku na podstawie jego nazwy
    };

    return (
        <div className="file-tools-panel">
            <h5>Files</h5>

            <ListGroup>
                {fileList.map((file, index) => (
                    <ListGroup.Item
                        key={index}
                        className="d-flex space-between align-center"
                        draggable
                        onDragStart={(event) =>
                            handleFileDragStart(event, file)
                        }>
                        {file.name}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <div className="d-flex space-between">
                <FileInputButton onFileChange={onFileChange} />
                {/* Obszar do upuszczania pliku, aby usunąć */}
                <div
                    onDragOver={handleDragOver} // Pozwala na upuszczanie plików
                    onDrop={handleDrop} // Obsługuje usunięcie po upuszczeniu
                    className="delete-file-button">
                    <DeleteIcon />
                </div>
            </div>
        </div>
    );
};

export default FileToolsPanel;

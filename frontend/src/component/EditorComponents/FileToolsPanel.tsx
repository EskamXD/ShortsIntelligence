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
            console.log("Adding new files:", newFiles);
            if (newFiles.length > 0) {
                newFiles.forEach((file) => {
                    setFileList((prevFiles) => [...prevFiles, file]);
                });
            }
        };

        handleFileChange(files);
    }, [onFileChange, files]);

    const handleRemoveFile = (fileName: string) => {
        console.log("Removing file:", fileName);
        const updatedFiles = fileList.filter((file) => file.name !== fileName);
        console.log("Updated files:", updatedFiles);
        setFileList(updatedFiles);
        setFiles(updatedFiles);
    };

    const handleFileDragStart = (
        event: React.DragEvent<HTMLDivElement>,
        file: File
    ) => {
        // Przekazujemy nazwę pliku
        event.dataTransfer.setData("fileInfo", file.name);
    };

    const handleDragOver = (event: React.DragEvent<any>) => {
        event.preventDefault(); // Aby obsłużyć upuszczanie, musimy zapobiec domyślnemu zachowaniu przeglądarki
    };

    const handleDrop = (event: React.DragEvent<any>) => {
        event.preventDefault();
        const fileName = event.dataTransfer.getData("fileInfo"); // Pobranie nazwy pliku
        const fileInfo = JSON.parse(fileName); // Parsowanie danych pliku
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

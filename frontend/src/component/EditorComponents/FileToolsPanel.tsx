import React from "react";
import { ListGroup, Spinner } from "react-bootstrap";
import { useFileManagement } from "../../hooks/useFileManagement";
import FileInputButton from "./FileInputButton";
import DeleteIcon from "@mui/icons-material/Delete";
import "./FileToolsPanel.css";

const FileToolsPanel: React.FC = () => {
    const { files, addFiles, removeFile, handleDrop, uploading, inputKey } =
        useFileManagement();

    const handleDragStart = (event: React.DragEvent, file: File) => {
        event.dataTransfer.setData("text/plain", file.name);
        console.log("Rozpoczęto przeciąganie pliku:", file.name);
    };

    const handleDropOnDelete = (event: React.DragEvent) => {
        event.preventDefault();
        const fileName = event.dataTransfer.getData("text/plain");
        if (fileName) {
            console.log("Upuszczono plik do usunięcia:", fileName);
            removeFile(fileName);
        }
    };

    return (
        <div className="file-tools-panel">
            <h5>Files</h5>

            <ListGroup>
                {files
                    .filter(
                        (file) =>
                            file.type.startsWith("video/") ||
                            file.type.startsWith("audio/")
                    )
                    .map((file, index) => (
                        <ListGroup.Item
                            key={index}
                            className="d-flex justify-content-between align-items-center"
                            draggable
                            onDragStart={(e) => {
                                handleDragStart(e, file);
                            }}>
                            <span>{file.name}</span>
                        </ListGroup.Item>
                    ))}
                {uploading && (
                    <div className="uploading-indicator">
                        <Spinner animation="border" role="status" />
                        <span className="visually-hidden">Loading...</span>
                    </div>
                )}
            </ListGroup>

            <div className="d-flex justify-content-between mt-3">
                <FileInputButton onFileChange={addFiles} inputKey={inputKey} />
                <div
                    onDrop={handleDropOnDelete}
                    onDragOver={(e) => e.preventDefault()} // Zapobiegaj domyślnemu zachowaniu przeglądarki
                    className="delete-file d-flex align-items-center justify-content-center">
                    <DeleteIcon style={{ color: "white" }} />
                </div>
            </div>
        </div>
    );
};

export default FileToolsPanel;

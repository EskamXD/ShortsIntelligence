import React, { useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Button } from "react-bootstrap";

interface FileInputButtonProps {
    onFileChange: (file: File[]) => void; // Funkcja do obsługi zmiany pliku
    inputKey: number; // Klucz inputu
}

const FileInputButton: React.FC<FileInputButtonProps> = ({
    onFileChange,
    inputKey,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFiles = Array.from(event.target.files); // Tworzymy tablicę plików
            onFileChange(selectedFiles); // Przekazujemy całą tablicę plików
        }
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Kliknij ukryty input, gdy klikniesz przycisk
        }
    };

    return (
        <div className="d-flex align-items-center">
            <input
                type="file"
                accept="video/*, audio/*"
                ref={fileInputRef}
                style={{ display: "none" }} // Ukrywamy input
                onChange={handleFileChange}
                key={inputKey}
                multiple
            />
            <Button
                className="add-file-button btn btn-primary"
                onClick={handleButtonClick}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                }}>
                <AddIcon style={{ color: "white" }} />
            </Button>
        </div>
    );
};

export default FileInputButton;

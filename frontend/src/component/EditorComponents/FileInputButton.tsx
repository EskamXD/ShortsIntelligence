import React, { useRef } from "react";
import { Form } from "react-bootstrap";
import AddIcon from "@mui/icons-material/Add";

interface FileInputButtonProps {
    onFileChange: (file: File) => void; // Funkcja do obsługi zmiany pliku
}

const FileInputButton: React.FC<FileInputButtonProps> = ({ onFileChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            onFileChange(file);
        }
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Kliknij ukryty input, gdy klikniesz przycisk
        }
    };

    return (
        <div>
            <input
                type="file"
                accept="video/*, audio/*"
                ref={fileInputRef}
                style={{ display: "none" }} // Ukrywamy input
                onChange={handleFileChange}
            />
            <button className="add-file-button" onClick={handleButtonClick}>
                <AddIcon />
            </button>
        </div>
    );
};

export default FileInputButton;

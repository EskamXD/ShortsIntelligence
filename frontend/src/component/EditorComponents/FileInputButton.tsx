import React, { useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Button } from "react-bootstrap";

interface FileInputButtonProps {
    onFileChange: (file: File[]) => void;
    inputKey: number;
}

const FileInputButton: React.FC<FileInputButtonProps> = ({
    onFileChange,
    inputKey,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFiles = Array.from(event.target.files);
            onFileChange(selectedFiles);
        }
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="d-flex align-items-center">
            <input
                type="file"
                accept="video/*, audio/*"
                ref={fileInputRef}
                style={{ display: "none" }}
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

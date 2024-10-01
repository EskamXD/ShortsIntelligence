// VideoEditor.tsx
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import "./VideoEditor.css"; // Stylizacja komponentu

interface VideoEditorProps {
    projectId: number; // ID projektu, do którego wideo jest przypisane
    onClose: () => void; // Funkcja do zamykania edytora
}

const VideoEditor: React.FC<VideoEditorProps> = ({ projectId, onClose }) => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoURL, setVideoURL] = useState<string | null>(null);
    const [subtitles, setSubtitles] = useState<string>("");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setVideoFile(file);
            setVideoURL(URL.createObjectURL(file));
        }
    };

    const handleSubtitlesChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setSubtitles(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Video file:", videoFile);
        console.log("Subtitles:", subtitles);
        // Logika do przesyłania wideo i napisów na backend
    };

    return (
        <div className="video-editor">
            <div className="editor-top">
                <div className="effects-panel">
                    <h3>Effects</h3>
                    {/* Tutaj można dodać efekty */}
                    <Button variant="light">Effect 1</Button>
                    <Button variant="light">Effect 2</Button>
                    <Button variant="light">Effect 3</Button>
                </div>
                <div className="preview-panel">
                    <h3>Preview</h3>
                    {videoURL && (
                        <video width="400" controls>
                            <source src={videoURL} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>
            </div>
            <div className="editor-bottom">
                <div className="file-tools-panel">
                    <h3>Files</h3>
                    <Form.Group controlId="videoUpload">
                        <Form.Label>Upload Video</Form.Label>
                        <Form.Control
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="subtitles">
                        <Form.Label>Subtitles</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={subtitles}
                            onChange={handleSubtitlesChange}
                        />
                    </Form.Group>
                </div>
                <div className="timeline-panel">
                    <h3>Timeline</h3>
                    {/* Tutaj można dodać logikę do zarządzania timeline */}
                    <div className="timeline">
                        <div className="timeline-item">Video Clip</div>
                        <div className="timeline-item">Audio Track</div>
                    </div>
                </div>
            </div>
            {/* <Button variant="primary" type="submit" onClick={handleSubmit}>
                Save Changes
            </Button>
            <Button variant="secondary" onClick={onClose}>
                Close
            </Button> */}
        </div>
    );
};

export default VideoEditor;

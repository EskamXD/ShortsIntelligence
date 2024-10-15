import React from "react";
import { Form, Button } from "react-bootstrap";

interface AudioPanelProps {
    files: File[];
    onAddAudio: (file: File) => void;
}

const AudioPanel: React.FC<AudioPanelProps> = ({ files, onAddAudio }) => {
    const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onAddAudio(event.target.files[0]);
        }
    };

    return (
        <div className="audio-panel">
            <h3>Audio Tracks</h3>
            <Form.Group>
                <Form.Label>Add Audio</Form.Label>
                <Form.Control
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                />
            </Form.Group>
        </div>
    );
};

export default AudioPanel;

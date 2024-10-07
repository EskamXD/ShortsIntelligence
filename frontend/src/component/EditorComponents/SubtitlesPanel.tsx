import React from "react";
import { Form } from "react-bootstrap";

interface SubtitlesPanelProps {
    subtitles: string;
    onSubtitlesChange: (subtitles: string) => void;
}

const SubtitlesPanel: React.FC<SubtitlesPanelProps> = ({
    subtitles,
    onSubtitlesChange,
}) => {
    const handleSubtitlesChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        onSubtitlesChange(event.target.value);
    };

    return (
        <div className="subtitles-panel">
            <h3>Subtitles</h3>
            <Form.Group>
                <Form.Label>Edit Subtitles</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={subtitles}
                    onChange={handleSubtitlesChange}
                />
            </Form.Group>
        </div>
    );
};

export default SubtitlesPanel;

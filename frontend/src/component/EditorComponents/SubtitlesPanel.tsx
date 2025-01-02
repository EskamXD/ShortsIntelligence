import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Modal, Button, Form } from "react-bootstrap";
import { useEditorContext } from "../../context/EditorContext";
import { fetchSubtitles } from "../../api/apiService";
import DeleteIcon from "@mui/icons-material/Delete";

interface Subtitle {
    id: string;
    start: string;
    end: string;
    text: string;
}

const SubtitlesPanel: React.FC = () => {
    const { projectID, subtitles, setSubtitles } = useEditorContext();
    const [subtitleList, setSubtitleList] = useState<Subtitle[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newSubtitle, setNewSubtitle] = useState<Subtitle>({
        id: uuidv4(),
        start: "",
        end: "",
        text: "",
    });

    useEffect(() => {
        const parseSRT = (subtitles: string): Subtitle[] => {
            if (!subtitles) return [];
            const entries = subtitles.split("\n\n");
            return entries
                .map((entry) => {
                    const [times, ...textLines] = entry.split("\n");
                    if (!times || textLines.length === 0) return null;

                    const [start, end] = times.split(" --> ");
                    if (!start || !end) return null;

                    return {
                        id: uuidv4(),
                        start: start.trim(),
                        end: end.trim(),
                        text: textLines.join(" ").trim(),
                    };
                })
                .filter(Boolean) as Subtitle[];
        };

        setSubtitleList(parseSRT(subtitles));
    }, [subtitles]);

    const handleAddSubtitle = () => {
        const updatedList = [...subtitleList, newSubtitle];
        setSubtitleList(updatedList);
        setSubtitles(
            updatedList
                .map(({ start, end, text }) => `${start} --> ${end}\n${text}`)
                .join("\n\n")
        );
        setShowModal(false);
        setNewSubtitle({ id: uuidv4(), start: "", end: "", text: "" });
    };

    const handleInputChange = (field: keyof Subtitle, value: string) => {
        setNewSubtitle({ ...newSubtitle, [field]: value });
    };

    const handleDeleteSubtitle = (index: number) => {
        const updatedList = subtitleList.filter((_, i) => i !== index);
        setSubtitleList(updatedList);
        setSubtitles(
            updatedList
                .map(({ start, end, text }) => `${start} --> ${end}\n${text}`)
                .join("\n\n")
        );
    };

    return (
        <div className="subtitles-panel">
            <Button
                onClick={() => setShowModal(true)}
                style={{ marginBottom: "10px" }}>
                + Add New Subtitle
            </Button>

            {subtitleList.map((subtitle) => (
                <div
                    key={subtitle.id}
                    className="subtitle-item"
                    style={{
                        display: "flex",
                        marginBottom: "10px",
                        gap: "10px",
                        alignItems: "center",
                        paddingBottom: "10px",
                        borderBottom: "1px solid #ccc",
                    }}>
                    <Form.Control
                        type="text"
                        value={subtitle.start}
                        readOnly
                        style={{ width: "120px" }}
                    />
                    <span>{">"}</span>
                    <Form.Control
                        type="text"
                        value={subtitle.end}
                        readOnly
                        style={{ width: "120px" }}
                    />
                    <Form.Control
                        type="text"
                        value={subtitle.text}
                        readOnly
                        style={{ flex: "1" }}
                    />
                    <Button
                        variant="danger"
                        onClick={() =>
                            handleDeleteSubtitle(subtitleList.indexOf(subtitle))
                        }>
                        <DeleteIcon />
                    </Button>
                </div>
            ))}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Subtitle</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="startTime">
                            <Form.Label>Start Time</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="00:00:00,000"
                                value={newSubtitle.start}
                                onChange={(e) =>
                                    handleInputChange("start", e.target.value)
                                }
                            />
                        </Form.Group>
                        <Form.Group controlId="endTime">
                            <Form.Label>End Time</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="00:00:01,000"
                                value={newSubtitle.end}
                                onChange={(e) =>
                                    handleInputChange("end", e.target.value)
                                }
                            />
                        </Form.Group>
                        <Form.Group controlId="subtitleText">
                            <Form.Label>Subtitle Text</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Subtitle text here"
                                value={newSubtitle.text}
                                onChange={(e) =>
                                    handleInputChange("text", e.target.value)
                                }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddSubtitle}>
                        Accept
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SubtitlesPanel;

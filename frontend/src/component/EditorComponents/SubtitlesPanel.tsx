import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useEditorContext } from "../../context/EditorContext";
import { fetchSubtitles, generateSubtitles } from "../../api/apiService";
import DeleteIcon from "@mui/icons-material/Delete";

interface SubtitleChunk {
    text: string;
    start: number;
    end: number;
}

const splitTextIntoChunksWithTime = (
    text: string,
    maxLength: number,
    startTime: number,
    endTime: number
): SubtitleChunk[] => {
    const words = text.split(" ");
    const totalDuration = endTime - startTime;

    // Funkcja pomocnicza do obliczania wagi słowa (długość w znakach)
    const calculateWordWeight = (word: string) => word.length;

    // Obliczenie całkowitej wagi wszystkich słów
    const totalWeight = words.reduce(
        (sum, word) => sum + calculateWordWeight(word),
        0
    );

    const chunks: SubtitleChunk[] = [];
    let currentChunk: string[] = [];
    let chunkWeight = 0;
    let chunkStartTime = startTime;

    words.forEach((word, index) => {
        const wordWeight = calculateWordWeight(word);

        // Dodanie słowa do bieżącego chunku
        currentChunk.push(word);
        chunkWeight += wordWeight;

        // Jeśli dodanie słowa przekroczy maksymalną długość lub występuje kropka/przecinek
        if (
            currentChunk.join(" ").length > maxLength ||
            /[.,!?]/.test(word[word.length - 1]) ||
            index === words.length - 1
        ) {
            // Oblicz czas chunku na podstawie jego wagi
            const chunkDuration = (totalDuration * chunkWeight) / totalWeight;

            chunks.push({
                text: currentChunk.join(" ").trim(),
                start: chunkStartTime,
                end: chunkStartTime + chunkDuration,
            });

            chunkStartTime += chunkDuration;
            currentChunk = [];
            chunkWeight = 0;
        }
    });

    return chunks;
};

const convertToSeconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(":");
    const [sec, ms] = seconds.split(",");
    return (
        parseInt(hours) * 3600 +
        parseInt(minutes) * 60 +
        parseInt(sec) +
        parseInt(ms) / 1000
    );
};

const convertToTimecode = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
    const millis = Math.round((seconds % 1) * 1000)
        .toString()
        .padStart(3, "0");
    return `${hours}:${minutes}:${secs},${millis}`;
};

const parseSRT = (subtitles: string): Subtitle[] => {
    if (!subtitles) return [];
    const entries = subtitles.trim().split("\n\n");

    return entries
        .map((entry) => {
            try {
                let lines = entry.split("\n");

                // Usuń numer linijki i puste linie
                lines = lines.filter(
                    (line) => !/^\d+$/.test(line.trim()) && line.trim() !== ""
                );

                if (lines.length < 2) return null;

                const times = lines[0];
                const [start, end] = times.split(" --> ");
                if (!start || !end) return null;

                const startSeconds = convertToSeconds(start.trim());
                const endSeconds = convertToSeconds(end.trim());
                const textLines = lines.slice(1);
                const fullText = textLines.join(" ").trim();

                // Podziel tekst na chunki
                const textChunks = splitTextIntoChunksWithTime(
                    fullText,
                    25, // Maksymalna długość chunku
                    startSeconds,
                    endSeconds
                );

                return textChunks.map((chunk) => ({
                    id: uuidv4(),
                    start: convertToTimecode(chunk.start),
                    end: convertToTimecode(chunk.end),
                    text: chunk.text.trim(), // Usuń zbędne spacje
                    font: "Arial",
                    color: "#ffffff",
                    size: "32px",
                    outline: "2px",
                    outlineColor: "#000000",
                }));
            } catch (error) {
                console.error("Error parsing SRT entry:", entry, error);
                return null;
            }
        })
        .flat()
        .filter(Boolean) as Subtitle[];
};

interface Subtitle {
    id: string;
    start: string;
    end: string;
    text: string;
    font: string;
    color: string;
    size: string;
    outline: string;
    outlineColor: string;
}

const SubtitlesPanel: React.FC = () => {
    const { projectID, processedSubtitles, setProcessedSubtitles } =
        useEditorContext();

    const [subtitleList, setSubtitleList] = useState<Subtitle[]>([]);
    const [editingSubtitle, setEditingSubtitle] = useState<Subtitle | null>(
        null
    );
    const [showModal, setShowModal] = useState(false);
    const [newSubtitle, setNewSubtitle] = useState<Subtitle>({
        id: uuidv4(),
        start: "00:00:00,000",
        end: "00:00:05,000",
        text: "",
        font: "Arial",
        color: "#ffffff",
        size: "32px",
        outline: "2px",
        outlineColor: "#000000",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadSubtitlesFromProject = async () => {
            try {
                const response = await fetchSubtitles(projectID);
                if (response) {
                    const parsedSubtitles = parseSRT(response);
                    console.log(
                        "Loaded subtitles after parseSRT",
                        parsedSubtitles
                    );
                    parsedSubtitles.forEach((item) => {
                        console.log("Subtitles text after parseSRT", item.text);
                    });
                    setSubtitleList(parsedSubtitles);
                    setProcessedSubtitles(parsedSubtitles);
                }
            } catch (error) {
                console.error("Failed to load subtitles:", error);
            }
        };

        loadSubtitlesFromProject();
    }, [projectID, setProcessedSubtitles]);

    const handleAddOrEditSubtitle = () => {
        const updatedList = editingSubtitle
            ? processedSubtitles.map((subtitle) =>
                  subtitle.id === editingSubtitle.id
                      ? editingSubtitle
                      : subtitle
              )
            : [...processedSubtitles, newSubtitle];

        setProcessedSubtitles(updatedList);
        setShowModal(false);
        setEditingSubtitle(null);
    };

    const handleEditSubtitle = (subtitle: Subtitle) => {
        setEditingSubtitle(subtitle);
        setShowModal(true);
    };

    const handleInputChange = (field: keyof Subtitle, value: string) => {
        if (editingSubtitle) {
            setEditingSubtitle({ ...editingSubtitle, [field]: value });
        } else {
            setNewSubtitle({ ...newSubtitle, [field]: value });
        }
    };

    const handleDeleteSubtitle = (index: number) => {
        const updatedList = subtitleList.filter((_, i) => i !== index);
        setSubtitleList(updatedList);
        setProcessedSubtitles(updatedList);
    };

    const handleGenerateSubtitles = async () => {
        setLoading(true); // Ustawienie stanu ładowania
        try {
            await generateSubtitles(projectID); // Wywołanie API do generowania napisów
            const response = await fetchSubtitles(projectID);
            const parsedSubtitles = parseSRT(response);
            console.log("New generated subtitles", parsedSubtitles);
            parsedSubtitles.forEach((item) => {
                console.log("Subtitles text new generated", item.text);
            });
            setSubtitleList(parsedSubtitles);
            setProcessedSubtitles(parsedSubtitles);
        } catch (error) {
            console.error("Failed to generate subtitles:", error);
            alert("Failed to generate subtitles. Please try again.");
        } finally {
            setLoading(false); // Wyłączenie stanu ładowania
        }
    };

    return (
        <div className="subtitles-panel">
            <Button
                onClick={() => {
                    setEditingSubtitle(null);
                    setShowModal(true);
                }}
                style={{ marginBottom: "10px" }}>
                + Add New Subtitle
            </Button>
            <Button
                variant="success"
                onClick={handleGenerateSubtitles}
                disabled={loading} // Wyłączony przycisk w trakcie ładowania
                style={{ marginBottom: "10px" }}>
                {loading ? (
                    <>
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />{" "}
                        Generating...
                    </>
                ) : (
                    "Generate Subtitles"
                )}
            </Button>

            <div style={{ overflowY: "auto", height: "90%" }}>
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
                            variant="info"
                            onClick={() => handleEditSubtitle(subtitle)}>
                            Edit
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() =>
                                handleDeleteSubtitle(
                                    subtitleList.indexOf(subtitle)
                                )
                            }>
                            <DeleteIcon />
                        </Button>
                    </div>
                ))}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingSubtitle ? "Edit Subtitle" : "Add New Subtitle"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="startTime">
                            <Form.Label>Start Time</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="00:00:00,000"
                                value={
                                    editingSubtitle?.start || newSubtitle.start
                                }
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
                                value={editingSubtitle?.end || newSubtitle.end}
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
                                value={
                                    editingSubtitle?.text || newSubtitle.text
                                }
                                onChange={(e) =>
                                    handleInputChange("text", e.target.value)
                                }
                            />
                        </Form.Group>
                        {/* Add other input fields for font, color, size, etc., similar to above */}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddOrEditSubtitle}>
                        Accept
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SubtitlesPanel;

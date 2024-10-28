import React, { useState } from "react";
import { Col, Row, Button, FloatingLabel, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // For navigation to the AI project page
import { ProjectData, postProject } from "../api/apiService"; // Ensure path is correct

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SlideshowIcon from "@mui/icons-material/Slideshow";

interface StartProjectProps {
    onProjectCreated: () => void; // Callback for when the project is created
}

const StartProject: React.FC<StartProjectProps> = ({ onProjectCreated }) => {
    const [projectData, setProjectData] = useState<ProjectData>({
        id: 0,
        title: "",
        description: "",
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isNormalEditorSelected, setIsNormalEditorSelected] = useState(false);

    const navigate = useNavigate();

    const handleTitleClick = (editorType: "AI" | "Normal") => {
        if (editorType === "AI") {
            navigate("/new-ai-project/");
        } else {
            setIsNormalEditorSelected(true);
        }
    };

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;
        setProjectData({ ...projectData, [name]: value });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            await postProject(projectData);
            setSuccess("Project created successfully!");
            onProjectCreated(); // Refresh the project list
            setProjectData({ id: 0, title: "", description: "" }); // Reset form fields
        } catch (error) {
            setError("Error creating project. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <Row>
                <Col>
                    <Button
                        onClick={() => handleTitleClick("AI")}
                        style={{
                            width: "100%",
                        }}
                        size="lg">
                        <div className="d-flex gap-3">
                            <AutoAwesomeIcon fontSize="large" />
                            AI Project
                        </div>
                    </Button>
                </Col>
                <Col>
                    <Button
                        onClick={() => handleTitleClick("Normal")}
                        style={{
                            width: "100%",
                        }}
                        size="lg">
                        <div className="d-flex gap-3">
                            <SlideshowIcon fontSize="large" />
                            Normal Editor
                        </div>
                    </Button>
                </Col>
            </Row>

            {isNormalEditorSelected && (
                <form onSubmit={handleSubmit}>
                    <FloatingLabel
                        controlId="floatingTitle"
                        label="Title"
                        className="mb-3">
                        <Form.Control
                            name="title"
                            type="text"
                            placeholder="Your title here"
                            onChange={handleChange}
                        />
                    </FloatingLabel>
                    <FloatingLabel
                        controlId="floatingDescription"
                        label="Description"
                        className="mb-3">
                        <Form.Control
                            as="textarea"
                            name="description"
                            placeholder="Your description here"
                            rows={4}
                            className="resize-none"
                            onChange={handleChange}
                        />
                    </FloatingLabel>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Project"}
                    </Button>
                </form>
            )}

            {error && (
                <div
                    className="mt-3"
                    style={{
                        backgroundColor: "rgba(255, 100, 100, 0.85)",
                        padding: "2px 10px",
                        borderRadius: 6,
                    }}>
                    {error}
                </div>
            )}
            {success && (
                <div
                    className="mt-3"
                    style={{
                        backgroundColor: "rgba(52, 121, 40, 0.85)",
                        padding: "2px 10px",
                        borderRadius: 6,
                    }}>
                    {success}
                </div>
            )}
        </div>
    );
};

export default StartProject;

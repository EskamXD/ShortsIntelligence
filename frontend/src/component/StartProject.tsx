// StartProject.tsx
import React, { useState } from "react";
import { Button, FloatingLabel, Form } from "react-bootstrap";
import { ProjectData, postProject } from "../api/apiService"; // Upewnij się, że ścieżka jest poprawna

interface StartProjectProps {
    onProjectCreated: () => void; // Funkcja wywoływana po utworzeniu projektu
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

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;
        console.log("handleChange", name, value);
        setProjectData({ ...projectData, [name]: value });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        console.log("Creating project:", projectData);

        try {
            await postProject(projectData);
            setSuccess("Project created successfully!");
            onProjectCreated(); // Odświeżenie listy projektów
            setProjectData({ id: 0, title: "", description: "" }); // Reset pól formularza
        } catch (error) {
            setError("Error creating project. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
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

// App.tsx
import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Card from "react-bootstrap/Card";
import StartProject from "./component/StartProject";
import VideoEditor from "./component/VideoEditor"; // Import VideoEditor
import { getProjects } from "./api/apiService"; // Upewnij się, że ścieżka jest poprawna
import "./App.css";

interface Project {
    id: number;
    title: string;
    description: string;
}

const App: React.FC = () => {
    const [recentProjects, setRecentProjects] = useState<Project[]>([]);
    // const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
    const [showNewProjectModal, setShowNewProjectModal] =
        useState<boolean>(false);
    const [isEditorOn, setIsEditorOn] = useState<boolean>(false);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
        null
    ); // Przechowywanie ID wybranego projektu

    useEffect(() => {
        fetchRecentProjects();
    }, []);

    const fetchRecentProjects = async () => {
        try {
            const projects = await getProjects(); // Używamy funkcji z apiService
            setRecentProjects(projects);
        } catch (error) {
            console.error("Error fetching recent projects:", error);
        }
    };

    const handleCreateProjectClick = () => {
        setShowNewProjectModal(true);
    };

    const handleOpenProjectClick = () => {};

    const handleRecentProjectClick = (project: Project) => {
        console.log("Open project:", project);
        setIsEditorOn(true); // Włączenie edytora projektu
        setSelectedProjectId(project.id); // Ustawienie ID wybranego projektu
    };

    const handleNewProjectModalClose = () => {
        setShowNewProjectModal(false);
    };

    const handleProjectCreated = () => {
        setShowNewProjectModal(false);
        fetchRecentProjects(); // Odświeżenie listy projektów
        setIsEditorOn(true); // Włączenie edytora projektu
    };

    const handleEditorClose = () => {
        setIsEditorOn(false);
        setSelectedProjectId(null); // Reset ID wybranego projektu
    };

    return (
        <div style={{ display: "flex" }}>
            {!isEditorOn ? (
                <>
                    <div
                        style={{
                            width: "200px",
                            padding: "20px",
                            borderRight: "1px solid #ccc",
                        }}>
                        <h2 style={{ textAlign: "left" }}>Project Actions</h2>
                        <div className="d-grid gap-2">
                            <Button
                                onClick={handleCreateProjectClick}
                                className="mb-3">
                                New Project
                            </Button>
                            <Button onClick={handleOpenProjectClick}>
                                Open Project
                            </Button>
                        </div>
                    </div>
                    <div style={{ flex: 1, padding: "20px" }}>
                        <div>
                            <h2>Recently Opened Projects</h2>
                            {recentProjects.map((project) => (
                                <Card
                                    key={project.id}
                                    style={{ width: "18rem" }}>
                                    <Card.Img
                                        variant="top"
                                        src="holder.js/100px180"
                                    />
                                    <Card.Body>
                                        <Card.Title>{project.title}</Card.Title>
                                        <Card.Text>
                                            {project.description}
                                        </Card.Text>
                                        <Button
                                            variant="primary"
                                            onClick={() =>
                                                handleRecentProjectClick(
                                                    project
                                                )
                                            }>
                                            Open
                                        </Button>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <Modal
                        show={showNewProjectModal}
                        onHide={handleNewProjectModalClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Start a New Project</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <StartProject
                                onProjectCreated={handleProjectCreated}
                            />
                        </Modal.Body>
                    </Modal>
                </>
            ) : (
                <VideoEditor
                    projectId={selectedProjectId!}
                    onClose={handleEditorClose}
                />
            )}
        </div>
    );
};

export default App;


// App.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Card from "react-bootstrap/Card";
import StartProject from "./component/StartProject";
import { useEditorContext } from "./context/EditorContext";

import { getProjects } from "./api/apiService"; // Upewnij się, że ścieżka jest poprawna
import "./App.css";

interface Project {
    id: number;
    title: string;
    description: string;
}

const App: React.FC = () => {
    let context;
    try {
        context = useEditorContext();
    } catch (error) {
        console.error("Error using EditorContext:", error);
        return null;
    }

    const { projectID, setProjectID } = context;

    const [recentProjects, setRecentProjects] = useState<Project[]>([]);
    const [showNewProjectModal, setShowNewProjectModal] =
        useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchRecentProjects();
    }, []);

    const fetchRecentProjects = async () => {
        try {
            const projects = await getProjects();
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
        setProjectID(project.id);
        navigate(`/editor/${project.id}`);
    };

    const handleNewProjectModalClose = () => {
        setShowNewProjectModal(false);
    };

    const handleProjectCreated = () => {
        setShowNewProjectModal(false);
        fetchRecentProjects();
        navigate(`/editor/${projectID}`);
    };

    return (
        <div
            style={{
                display: "flex",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                height: "100vh",
            }}>
            <div
                style={{
                    width: "200px",
                    padding: "20px",
                    borderRight: "1px solid #ccc",
                }}>
                <h2 style={{ textAlign: "left" }}>Project Actions</h2>
                <div className="d-grid gap-2">
                    <Button onClick={handleCreateProjectClick} className="mb-3">
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
                    <div className="d-flex gap-3 flex-wrap">
                        {recentProjects.map((project, index) => {
                            // if (index > 3) return null;
                            return (
                                <Card
                                    key={project.id}
                                    style={{ width: "18rem" }}>
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
                            );
                        })}
                    </div>
                </div>
            </div>
            <Modal
                show={showNewProjectModal}
                onHide={handleNewProjectModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Start a New Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <StartProject onProjectCreated={handleProjectCreated} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default App;

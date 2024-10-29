import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Nav, Tab } from "react-bootstrap";
import EffectsPanel from "./EditorComponents/EffectsPanel";
import AudioPanel from "./EditorComponents/AudioPanel";
import SubtitlesPanel from "./EditorComponents/SubtitlesPanel";
import PreviewPanel from "./EditorComponents/PreviewPanel";
import FileToolsPanel from "./EditorComponents/FileToolsPanel";
import TimelinePanel from "./EditorComponents/TimelinePanel";

import "./VideoEditor.css";
import { useEditorContext } from "../context/EditorContext";

const VideoEditor: React.FC = () => {
    const { setProjectID } = useEditorContext();

    const { projectID } = useParams<{ projectID: string }>();

    useEffect(() => {
        console.log("Project ID:", projectID);
        if (projectID) {
            setProjectID(parseInt(projectID));
        }
    }, [projectID]);

    return (
        <div className="video-editor">
            <div className="editor-top">
                <div className="panel">
                    <Tab.Container
                        id="panel-tabs"
                        defaultActiveKey="effect-panel">
                        <div>
                            <Nav variant="tabs">
                                <Nav.Item>
                                    <Nav.Link eventKey="effect-panel">
                                        Effects
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="audio-panel">
                                        Audio
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="subtitle-panel">
                                        Subtitles
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>
                        <div style={{ height: "100%" }}>
                            <Tab.Content style={{ height: "100%" }}>
                                <Tab.Pane eventKey="effect-panel">
                                    {/* <EffectsPanel /> */}
                                </Tab.Pane>
                                <Tab.Pane eventKey="audio-panel">
                                    {/* <AudioPanel /> */}
                                </Tab.Pane>
                                <Tab.Pane
                                    eventKey="subtitle-panel"
                                    style={{ height: "100%" }}>
                                    {/* <SubtitlesPanel /> */}
                                    <SubtitlesPanel />
                                </Tab.Pane>
                            </Tab.Content>
                        </div>
                    </Tab.Container>
                </div>
                <PreviewPanel />
            </div>
            <div className="editor-bottom">
                <FileToolsPanel />
                <TimelinePanel />
            </div>
        </div>
    );
};

export default VideoEditor;

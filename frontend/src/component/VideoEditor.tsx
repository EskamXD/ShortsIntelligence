import React, { useState, useEffect } from "react";
import EffectsPanel from "./EditorComponents/EffectsPanel";
import PreviewPanel from "./EditorComponents/PreviewPanel";
import FileToolsPanel from "./EditorComponents/FileToolsPanel";
import TimelinePanel from "./EditorComponents/TimelinePanel";
import AudioPanel from "./EditorComponents/AudioPanel";
import SubtitlesPanel from "./EditorComponents/SubtitlesPanel";
import "./VideoEditor.css";
import { Nav, Tab } from "react-bootstrap";

interface VideoEditorProps {
    projectId: number;
    onClose: () => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ projectId, onClose }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [videoURL, setVideoURL] = useState<string | null>(null);
    const [effects, setEffects] = useState<string[]>([]);
    const [subtitles, setSubtitles] = useState<string>("");

    // Obsługa zmiany pliku (zarówno dla wideo, jak i audio)
    const handleFileChange = (file: File) => {
        setFiles((prevFiles) => [...prevFiles, file]);

        if (file.type.startsWith("video/")) {
            setVideoURL(URL.createObjectURL(file)); // Zmiana videoURL na podstawie nowego pliku

            const videoElement = document.createElement("video");
            videoElement.src = URL.createObjectURL(file);

            videoElement.addEventListener("loadedmetadata", function () {
                const videoDuration = videoElement.duration.toFixed(2);
                const videoTracks = videoElement.videoTracks;
                let fps = null;
                if (videoTracks && videoTracks[0]) {
                    const track = videoTracks[0];
                    fps =
                        track.frameRate ||
                        (track.frameRate
                            ? track.frameRate.toFixed(2)
                            : "unknown");
                } else {
                    fps = "unknown";
                }
            });
        } else if (file.type.startsWith("audio/")) {
            const audioElement = document.createElement("audio");
            audioElement.src = URL.createObjectURL(file);

            audioElement.addEventListener("loadedmetadata", function () {
                const audioDuration = audioElement.duration.toFixed(2);
            });
        }
    };

    // Obsługa dodawania efektów
    const handleApplyEffect = (effect: string) => {
        setEffects((prevEffects) => [...prevEffects, effect]);
    };

    // Obsługa dodawania napisów
    const handleSubtitlesChange = (newSubtitles: string) => {
        setSubtitles(newSubtitles);
    };

    // Funkcja do usunięcia efektu
    const handleRemoveEffect = (effect: string) => {
        setEffects((prevEffects) => prevEffects.filter((e) => e !== effect));
    };

    return (
        <div className="video-editor">
            <div className="editor-top">
                <div className="panel">
                    <Tab.Container
                        id="panel-tabs"
                        defaultActiveKey="effect-panel">
                        <div>
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
                            <div>
                                <Tab.Content>
                                    <Tab.Pane eventKey="effect-panel">
                                        <EffectsPanel
                                            onApplyEffect={handleApplyEffect}
                                            activeEffects={effects}
                                            onRemoveEffect={handleRemoveEffect}
                                        />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="audio-panel">
                                        <AudioPanel
                                            files={files.filter((file) =>
                                                file.type.startsWith("audio/")
                                            )} // Filtruj pliki audio
                                            onAddAudio={handleFileChange}
                                        />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="subtitle-panel">
                                        <SubtitlesPanel
                                            subtitles={subtitles}
                                            onSubtitlesChange={
                                                handleSubtitlesChange
                                            }
                                        />
                                    </Tab.Pane>
                                </Tab.Content>
                            </div>
                        </div>
                    </Tab.Container>
                </div>
                {/* Podgląd wideo */}
                <PreviewPanel videoURL={videoURL} effects={effects} />
            </div>
            <div className="editor-bottom">
                {/* Panel plików */}
                <FileToolsPanel
                    onFileChange={handleFileChange}
                    files={files}
                    setFiles={setFiles}
                />

                {/* Oś czasu */}
                <TimelinePanel files={files} subtitles={subtitles} fps={30} />
            </div>
        </div>
    );
};

export default VideoEditor;

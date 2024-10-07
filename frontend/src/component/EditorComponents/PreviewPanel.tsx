import React from "react";

interface PreviewPanelProps {
    videoURL: string | null; // URL wideo do podglądu
    effects: string[]; // Lista efektów
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ videoURL, effects }) => {
    return (
        <div className="preview-panel">
            <h3>Preview</h3>
            {videoURL ? (
                <video width="400" controls>
                    <source src={videoURL} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            ) : (
                <p>No video selected</p>
            )}
        </div>
    );
};

export default PreviewPanel;

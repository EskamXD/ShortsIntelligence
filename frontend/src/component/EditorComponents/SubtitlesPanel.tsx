import React, { useEffect } from "react";
import { useEditorContext } from "../../context/EditorContext";
import { fetchSubtitles } from "../../api/apiService";

const SubtitlesPanel: React.FC = () => {
    const { projectID, subtitles, setSubtitles } = useEditorContext();

    useEffect(() => {
        if (projectID === -1) return;

        const loadSubtitles = async () => {
            const subtitleText = await fetchSubtitles(projectID);
            if (subtitleText) {
                setSubtitles(subtitleText);
            } else {
                console.log("No subtitles found for this project.");
            }
        };

        loadSubtitles();
    }, [projectID]);

    return (
        <div className="subtitles-panel">
            <textarea
                value={subtitles}
                onChange={(e) => setSubtitles(e.target.value)}
                style={{
                    width: "100%",
                    height: "100%",
                }}></textarea>
        </div>
    );
};

export default SubtitlesPanel;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.tsx";
import NewAIProject from "./component/NewAIProject";
import VideoEditor from "./component/VideoEditor";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { EditorProvider } from "./context/EditorContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <EditorProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/new-ai-project" element={<NewAIProject />} />
                    <Route
                        path="/editor/:projectID"
                        element={<VideoEditor />}
                    />
                    {/* Catch-all route for undefined paths, redirecting to App */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </EditorProvider>
    </StrictMode>
);


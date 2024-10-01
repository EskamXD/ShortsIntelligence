// VideoUploader.tsx
import React, { useState, useEffect } from "react";
import { getVideos, postVideos } from "../api/apiService";
import { Container, Row, Col } from "react-bootstrap";

interface Video {
    id: number;
    title: string;
    description: string;
    file: string; // Zakładamy, że to URL do pliku wideo
}

const VideoUploader: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await getVideos();
            setVideos(response);
        } catch (error) {
            console.error("Error fetching videos:", error);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!file) return; // Zabezpieczenie przed przesyłaniem pustego pliku

        try {
            await postVideos(title, description, file);
            fetchVideos(); // Refresh the list after upload
            setTitle("");
            setDescription("");
            setFile(null);
        } catch (error) {
            console.error("Error uploading video:", error);
        }
    };

    return (
        <Col>
            <h1>Video Uploader</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Title:
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Description:
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Video File:
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            required
                        />
                    </label>
                </div>
                <button type="submit">Upload Video</button>
            </form>

            <h2>Uploaded Videos</h2>
            <ul>
                {videos.map((video) => (
                    <li key={video.id}>
                        <h3>{video.title}</h3>
                        <p>{video.description}</p>
                        <video width="320" height="240" controls>
                            <source src={video.file} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </li>
                ))}
            </ul>
        </Col>
    );
};

export default VideoUploader;

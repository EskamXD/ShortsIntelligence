import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Dropdown,
    DropdownButton,
    Form,
    Modal,
    ProgressBar,
    Container,
    Spinner,
} from "react-bootstrap";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import {
    getVideoMetadata,
    processVideo,
    postProject,
    finalizeResponse,
} from "../api/apiService";
import { formatTime } from "./utils/timeUtils";
import { useEditorContext } from "../context/EditorContext";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckIcon from "@mui/icons-material/Check";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const NewAIProject: React.FC = () => {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoFileName, setVideoFileName] = useState<string>("");
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [timestamps, setTimestamps] = useState<{
        start: number;
        end: number;
    }>({ start: 0, end: 0 });
    const [fps, setFps] = useState<number>(0);
    const [totalFrames, setTotalFrames] = useState<number>(1);
    const [options, setOptions] = useState({
        resolution: "1080",
        enhanceAudio: false,
        addSubtitles: false,
    });
    const [loading, setLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [processedData, setProcessedData] = useState<{
        video_url: string;
        subtitles_url?: string;
    } | null>(null);
    const [done, setDone] = useState(false);

    const { projectID, setProjectID } = useEditorContext();

    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    // Handlers for each step
    const handleNextStep = () => setStep((prev) => Math.min(prev + 1, 5));
    const handlePrevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoFileName(file.name);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            try {
                const response = await getVideoMetadata(file);
                setFps(response.fps);
                setTotalFrames(response.total_frames);
                setTimestamps({ start: 0, end: response.total_frames });

                const videoBlobUrl = URL.createObjectURL(file);
                console.log("Video Blob URL:", videoBlobUrl);
                setVideoUrl(videoBlobUrl);
            } catch (error) {
                console.error("Error fetching video metadata:", error);
            }
        }
    };

    useEffect(() => {
        if (step === 3 && videoRef.current && videoUrl) {
            videoRef.current.src = videoUrl;
            console.log("Video src set:", videoUrl);
        }
    }, [step, videoUrl]);

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        const [start, end] = newValue as number[];
        setTimestamps({ start, end });

        if (videoRef.current) {
            videoRef.current.currentTime = start / fps;
        }
    };

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            const handleTimeUpdate = () => {
                if (videoElement.currentTime >= timestamps.end / fps) {
                    videoElement.pause();
                    setIsPlaying(false);
                    videoElement.currentTime = timestamps.start / fps;
                }
            };

            videoElement.addEventListener("timeupdate", handleTimeUpdate);
            return () =>
                videoElement.removeEventListener(
                    "timeupdate",
                    handleTimeUpdate
                );
        }
    }, [timestamps]);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.currentTime = timestamps.end / fps;
            const timeout = setTimeout(() => {
                videoElement.currentTime = timestamps.start / fps;
            }, 1000); // 1 sekunda na wyświetlenie end przed powrotem do start

            return () => clearTimeout(timeout);
        }
    }, [timestamps.end, fps]);

    const togglePlayPause = () => {
        if (isPlaying) {
            setIsPlaying(false);
            if (videoRef.current) videoRef.current.pause();
        } else {
            setIsPlaying(true);
            if (videoRef.current) videoRef.current.play();
        }
    };

    const stopVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = timestamps.start / fps;
        }
        setIsPlaying(false);
    };

    const switchSound = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    const handleOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setOptions((prev) => ({ ...prev, [name]: checked }));
    };

    const handleResolutionChange = (eventKey: any, event: Object) => {
        const resolution = eventKey as string;
        setOptions((prev) => ({ ...prev, resolution }));
    };

    const handleProcessVideo = async () => {
        setLoading(true);
        try {
            // Step 1: Process the video and get URLs
            const data = await processVideo(
                videoFile as File,
                timestamps.start / fps,
                timestamps.end / fps,
                options.resolution,
                options.enhanceAudio,
                options.addSubtitles
            );

            // Step 2: Fetch video blob and generate blob URL
            const videoBlobResponse = await fetch(data.video_url);
            const videoBlob = await videoBlobResponse.blob();
            const videoBlobUrl = URL.createObjectURL(videoBlob);

            // Step 3: Fetch subtitles blob and generate blob URL (if available)
            let subtitlesBlobUrl;
            if (data.subtitles_url) {
                const subtitlesBlobResponse = await fetch(data.subtitles_url);
                const subtitlesBlob = await subtitlesBlobResponse.blob();
                subtitlesBlobUrl = URL.createObjectURL(subtitlesBlob);
            }

            // Update processed data with blob URLs
            setProcessedData({
                video_url: videoBlobUrl,
                subtitles_url: subtitlesBlobUrl,
            });

            // Step 4: Post project to the backend
            const projectData = {
                id: 0,
                title,
                description,
            };
            const createdProjectId = await postProject(projectData);
            setProjectID(createdProjectId);

            // Step 5: Finalize project files on the backend
            await finalizeResponse(createdProjectId, videoFileName);

            // Show success modal
            setShowModal(true);
            setDone(true);
        } catch (error) {
            console.error("Error during video processing:", error);
            alert("Video processing failed.");
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => setShowModal(false);

    useEffect(() => {
        return () => {
            // Clean up the Blob URLs when component unmounts
            if (processedData?.video_url)
                URL.revokeObjectURL(processedData.video_url);
            if (processedData?.subtitles_url)
                URL.revokeObjectURL(processedData.subtitles_url);
        };
    }, [processedData]);

    const handleReset = () => {
        setStep(1);
        setTitle("");
        setDescription("");
        setVideoFile(null);
        setVideoUrl(null);
        setTimestamps({ start: 0, end: 0 });
        setFps(0);
        setTotalFrames(1);
        setOptions({
            resolution: "1080",
            enhanceAudio: false,
            addSubtitles: false,
        });
        setLoading(false);
        setIsPlaying(false);
        setIsMuted(false);
        setShowModal(false);
        setProcessedData(null);
        setDone(false);
    };

    const handleLeave = () => {
        // Redirect to the projects page
        navigate("/");
    };

    return (
        <Container>
            <h1>New AI Project</h1>
            <ProgressBar
                now={(step / 5) * 100}
                label={`Step ${step} of 5`}
                className="mb-4"
            />

            {step === 1 && (
                <div>
                    <h3>1. Project Details</h3>
                    <Form.Group controlId="projectTitle" className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="projectDescription" className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>
                    <Button
                        onClick={handleNextStep}
                        disabled={!title || !description}>
                        <ArrowForwardIosIcon /> Next
                    </Button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h3>2. Import Video</h3>
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Select a video file to start</Form.Label>
                        <Form.Control
                            type="file"
                            accept="video/*"
                            onChange={handleFileUpload}
                            ref={fileInputRef}
                        />
                        {videoFile && (
                            <p className="mt-2">
                                Selected File: {videoFile.name}
                            </p>
                        )}
                    </Form.Group>
                    <Button onClick={handleNextStep} disabled={!videoFile}>
                        <ArrowForwardIosIcon />
                    </Button>
                </div>
            )}

            {step === 3 && (
                <div>
                    {loading ? (
                        <Spinner />
                    ) : (
                        <>
                            <h3>3. Select Timestamps</h3>
                            <p>
                                Select the start and end timestamps for your
                                video segment.
                            </p>

                            {videoFile && (
                                <video
                                    ref={videoRef}
                                    controls={false}
                                    style={{
                                        width: "100%",
                                        maxHeight: "50vh",
                                        marginBottom: "1rem",
                                        aspectRatio: "16 / 9",
                                    }}
                                />
                            )}

                            <div className="custom-controls mt-3">
                                <button onClick={togglePlayPause}>
                                    {isPlaying ? (
                                        <PauseIcon />
                                    ) : (
                                        <PlayArrowIcon />
                                    )}
                                </button>
                                <button onClick={stopVideo}>
                                    <StopIcon />
                                </button>
                                <button onClick={switchSound}>
                                    {isMuted ? (
                                        <VolumeOffIcon />
                                    ) : (
                                        <VolumeUpIcon />
                                    )}
                                </button>
                            </div>

                            <Box sx={{ marginBottom: 2 }}>
                                <Slider
                                    getAriaLabel={() => "Time range"}
                                    value={[timestamps.start, timestamps.end]}
                                    onChange={handleSliderChange}
                                    valueLabelDisplay="off"
                                    min={0}
                                    max={totalFrames}
                                />
                            </Box>
                            <div className="d-flex justify-content-between mt-2">
                                <Form.Text>{`Start: ${formatTime(
                                    timestamps.start,
                                    fps
                                )}`}</Form.Text>
                                <Form.Text>{`End: ${formatTime(
                                    timestamps.end,
                                    fps
                                )}`}</Form.Text>
                            </div>

                            <Button onClick={handlePrevStep} className="me-2">
                                <ArrowBackIosIcon />
                            </Button>
                            <Button onClick={handleNextStep}>
                                <ArrowForwardIosIcon />
                            </Button>
                        </>
                    )}
                </div>
            )}

            {step === 4 && (
                <div>
                    <h3>4. Additional Options</h3>
                    <Form.Group
                        className="mb-3"
                        style={{ width: "fit-content", margin: "0 auto" }}>
                        <Form.Check
                            type="checkbox"
                            label="Enhance Audio Quality"
                            name="enhanceAudio"
                            checked={options.enhanceAudio}
                            onChange={handleOptionsChange}
                        />
                        <Form.Check
                            type="checkbox"
                            label="Add Subtitles"
                            name="addSubtitles"
                            checked={options.addSubtitles}
                            onChange={handleOptionsChange}
                        />

                        {/* Dropdown dla rozdzielczości */}
                        <DropdownButton
                            id="dropdown-resolution"
                            title={`Resolution: ${options.resolution}`}
                            onSelect={handleResolutionChange}
                            className="mt-3">
                            <Dropdown.Item eventKey="480p">SD</Dropdown.Item>
                            <Dropdown.Item eventKey="720p">HD</Dropdown.Item>
                            <Dropdown.Item eventKey="1080p">
                                FullHD
                            </Dropdown.Item>
                            <Dropdown.Item eventKey="1440p">WQHD</Dropdown.Item>
                            <Dropdown.Item eventKey="4K">4K</Dropdown.Item>
                        </DropdownButton>
                    </Form.Group>
                    <Button onClick={handlePrevStep} className="me-2">
                        <ArrowBackIosIcon />
                    </Button>
                    <Button onClick={handleNextStep}>
                        <ArrowForwardIosIcon />
                    </Button>
                </div>
            )}

            {step === 5 && (
                <>
                    <div>
                        <h3>5. Prepare Video</h3>
                        <p>
                            Ready to process your video with the selected
                            options?
                        </p>
                        {done ? (
                            <>
                                <Button onClick={handleReset} className="me-2">
                                    <RestartAltIcon />
                                    Start again
                                </Button>
                                <Button onClick={handleLeave}>
                                    Leave <ExitToAppIcon />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={handlePrevStep}
                                    className="me-2">
                                    <ArrowBackIosIcon />
                                </Button>
                                <Button
                                    onClick={handleProcessVideo}
                                    disabled={loading}>
                                    {loading ? (
                                        "Processing..."
                                    ) : (
                                        <>
                                            Prepare Video <CheckIcon />
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>

                    <Modal show={showModal} onHide={closeModal} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Video Processing Complete</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>
                                Download your processed video or proceed to the
                                editor.
                            </p>
                            {processedData?.video_url && (
                                <a
                                    href={processedData.video_url}
                                    download="processed_video.mp4">
                                    <Button
                                        variant="secondary"
                                        className="me-2">
                                        Download Video
                                    </Button>
                                </a>
                            )}
                            {processedData?.subtitles_url && (
                                <a
                                    href={processedData.subtitles_url}
                                    download="subtitles.srt">
                                    <Button
                                        variant="secondary"
                                        className="me-2">
                                        Download Subtitles
                                    </Button>
                                </a>
                            )}
                            <Button
                                variant="primary"
                                onClick={() =>
                                    navigate(`/editor/${projectID}`)
                                }>
                                Go to Editor
                            </Button>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={closeModal}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
        </Container>
    );
};

export default NewAIProject;

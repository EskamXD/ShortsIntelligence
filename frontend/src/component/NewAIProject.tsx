import React, { useEffect, useRef, useState } from "react";
import {
    Button,
    Dropdown,
    DropdownButton,
    Form,
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
import { getVideoMetadata, processVideo } from "../api/apiService";
import { formatTime } from "./utils/timeUtils";

const NewAIProject: React.FC = () => {
    const [step, setStep] = useState(1);
    const [videoFile, setVideoFile] = useState<File | null>(null);
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
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handlers for each step
    const handleNextStep = () => setStep((prev) => Math.min(prev + 1, 4));
    const handlePrevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            try {
                const response = await getVideoMetadata(file);
                setFps(response.fps);
                setTotalFrames(response.total_frames);
                setTimestamps({ start: 0, end: response.total_frames });

                const videoBlobUrl = URL.createObjectURL(file);
                setVideoUrl(videoBlobUrl);
            } catch (error) {
                console.error("Error fetching video metadata:", error);
            }
        }
    };

    useEffect(() => {
        if (step === 2 && videoRef.current && videoUrl) {
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
            const data = await processVideo(
                videoFile as File,
                timestamps.start / fps,
                timestamps.end / fps,
                options.resolution,
                options.enhanceAudio,
                options.addSubtitles
            );

            alert("Video processing complete. Check your downloads.");
            window.open(data.video_url, "_blank");
            if (data.subtitles_url) {
                window.open(data.subtitles_url, "_blank");
            }
        } catch (error) {
            console.error("Error during video processing:", error);
            alert("Video processing failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <h1>New AI Project</h1>
            <ProgressBar
                now={(step / 4) * 100}
                label={`Step ${step} of 4`}
                className="mb-4"
            />

            {step === 1 && (
                <div>
                    <h3>1. Import Video</h3>
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
                        Next
                    </Button>
                </div>
            )}

            {step === 2 && (
                <div>
                    {loading ? (
                        <Spinner />
                    ) : (
                        <>
                            <h3>2. Select Timestamps</h3>
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
                                Back
                            </Button>
                            <Button onClick={handleNextStep}>Next</Button>
                        </>
                    )}
                </div>
            )}

            {step === 3 && (
                <div>
                    <h3>3. Additional Options</h3>
                    <Form.Group className="mb-3">
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
                        Back
                    </Button>
                    <Button onClick={handleNextStep}>Next</Button>
                </div>
            )}

            {step === 4 && (
                <div>
                    <h3>4. Prepare Video</h3>
                    <p>
                        Ready to process your video with the selected options?
                    </p>
                    <Button onClick={handlePrevStep} className="me-2">
                        Back
                    </Button>
                    <Button onClick={handleProcessVideo} disabled={loading}>
                        {loading ? "Processing..." : "Prepare Video"}
                    </Button>
                </div>
            )}
        </Container>
    );
};

export default NewAIProject;

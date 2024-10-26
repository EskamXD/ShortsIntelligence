import React, { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../../context/EditorContext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

/**
 * `PreviewPanel` - React Component
 *
 * The `PreviewPanel` component provides a custom video player interface with playback controls
 * for previewing video files within a media editor application. The player supports play/pause,
 * stop, mute/unmute, and dynamically switches between high and low-quality video streams during
 * user interactions.
 *
 * @component
 * @example
 * // Usage
 * import PreviewPanel from './PreviewPanel';
 *
 * function App() {
 *   return (
 *     <div>
 *       <h1>Video Preview</h1>
 *       <PreviewPanel />
 *     </div>
 *   );
 * }
 *
 * export default App;
 *
 * @requires useEditorContext
 * @requires useRef
 * @requires useState
 * @requires useEffect
 * @requires PlayArrowIcon
 * @requires PauseIcon
 * @requires StopIcon
 * @requires VolumeOffIcon
 * @requires VolumeUpIcon
 */
const PreviewPanel: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [hasTriggered, setHasTriggered] = useState("");
    const [previewItems, setPreviewItems] = useState<
        { id: string; file: File; startPosition: number; endPosition: number }[]
    >([]);
    const [localPlaybackPosition, setLocalPlaybackPosition] = useState(0);

    const {
        files,
        playbackPosition,
        setPlaybackPosition,
        isPlaying,
        setIsPlaying,
        isDragingPlaybackIndicator,
        videoURL,
        setVideoURL,
        halfQualityVideoURL, // Dodane źródło niskiej jakości
        timelineItems,
        pixelsPerSecond,
    } = useEditorContext();

    /**
     * Prepare array of video files for playback, based on the timeline items left offsets.
     */
    useEffect(() => {
        setPreviewItems([]);
        const videoFiles = timelineItems.filter(
            (item) => item.type === "video"
        );

        videoFiles.forEach((item) => {
            const file = files.find((file) => file.name === item.name);
            if (file) {
                setPreviewItems((prev) => [
                    ...prev,
                    {
                        id: item.id,
                        file: file,
                        startPosition: item.leftOffset,
                        endPosition: item.leftOffset + item.itemWidth,
                    },
                ]);
            }
        });

        // console.log("Preview items:", previewItems);
    }, [timelineItems, files, setVideoURL]);

    /**
     * Preview update after playback position change.
     */
    useEffect(() => {
        if (playbackPosition && !isDragingPlaybackIndicator) {
            setLocalPlaybackPosition(playbackPosition);
            const playbackPositionPx = playbackPosition * pixelsPerSecond;
            // console.log(
            //     "Playback position:",
            //     playbackPosition,
            //     playbackPositionPx
            // );
            previewItems.forEach((item) => {
                if (
                    playbackPositionPx >= item.startPosition &&
                    playbackPositionPx <= item.endPosition
                ) {
                    // console.log(
                    //     "Playing video:",
                    //     item.file.name,
                    //     item.startPosition,
                    //     item.endPosition
                    // );
                    // create a new URL for the video file and set video.current.time to the correct position
                    const fileURL = URL.createObjectURL(item.file);
                    setVideoURL(fileURL);
                    if (videoRef.current) {
                        videoRef.current.currentTime =
                            playbackPosition - item.startPosition;
                    }
                } else {
                    setVideoURL("");
                }
            });
        }
    }, [playbackPosition, isDragingPlaybackIndicator]);

    useEffect(() => {
        let foundInRange = false;

        previewItems.forEach((item) => {
            if (
                localPlaybackPosition * pixelsPerSecond >= item.startPosition &&
                localPlaybackPosition * pixelsPerSecond <= item.endPosition
            ) {
                foundInRange = true;
                if (hasTriggered !== item.id) {
                    setHasTriggered(item.id);
                    const fileURL = URL.createObjectURL(item.file);
                    console.log("Playing video:", item.file.name);

                    if (videoRef.current) {
                        videoRef.current.src = fileURL;
                        videoRef.current.currentTime =
                            localPlaybackPosition -
                            item.startPosition / pixelsPerSecond;

                        if (isPlaying) {
                            videoRef.current.play();
                        }
                    }
                }
            }
        });

        // Jeśli `localPlaybackPosition` nie jest w zakresie żadnego `previewItem`, ustaw `videoURL` na pusty string
        if (!foundInRange) {
            if (videoRef.current) {
                videoRef.current.src = "";
            }
            setHasTriggered(""); // Zresetuj `hasTriggered`, aby pozwolić na ponowne odtwarzanie, gdy wróci do zakresu
        }
    }, [localPlaybackPosition, previewItems, isPlaying]);

    // Animation loop for playback position when isPlaying is true
    useEffect(() => {
        let animationFrameId: number | null = null;
        let previousTime: number | null = null;

        const updatePlaybackPosition = (currentTime: number) => {
            if (previousTime != null && isPlaying) {
                const deltaTime = (currentTime - previousTime) / 1000; // czas w sekundach
                setLocalPlaybackPosition(
                    (prevPosition) => prevPosition + deltaTime
                );
            }
            previousTime = currentTime;
            animationFrameId = requestAnimationFrame(updatePlaybackPosition);
        };

        if (isPlaying) {
            animationFrameId = requestAnimationFrame(updatePlaybackPosition);
            setHasTriggered(""); // Reset trigger on play
        } else if (animationFrameId != null) {
            previousTime = null;
            cancelAnimationFrame(animationFrameId);
        }

        return () => {
            if (animationFrameId != null) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isPlaying]);

    /**
     * Toggles play and pause of the video.
     * @function
     */
    const togglePlayPause = () => {
        if (isPlaying) {
            setIsPlaying(false);
            if (videoRef.current && videoURL) videoRef.current.pause();
            setHasTriggered("");
            // console.log("Pausing video");
        } else {
            setIsPlaying(true);
            if (videoRef.current && videoURL) videoRef.current.play();
            // console.log("Playing video");
        }
        setIsPlaying(!isPlaying);
    };

    /**
     * Stops the video, resets the `currentTime` to 0, and sets `playbackPosition` to 0.
     * @function
     */
    const stopVideo = () => {
        if (videoRef.current) {
            console.log("Stopping video");
            videoRef.current.pause();
            setLocalPlaybackPosition(0);
            setPlaybackPosition(0);
            setIsPlaying(false);
            // console.log("Stopping video");
        }
    };

    /**
     * Toggles the mute state of the video.
     * @function
     */
    const switchSound = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    return (
        <div className="preview-panel">
            <div className="preview-panel-video-placeholder">
                <video ref={videoRef} className="black-screen">
                    {videoURL ? (
                        <source src={videoURL || ""} type="video/mp4" />
                    ) : (
                        <>
                            Your browser does not support the video tag.
                            <div className="black-screen"></div>
                        </>
                    )}
                </video>
            </div>

            {/* Niestandardowe kontrolki */}
            <div className="custom-controls">
                <button onClick={togglePlayPause}>
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </button>
                <button onClick={stopVideo}>
                    <StopIcon />
                </button>
                <button onClick={switchSound}>
                    {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </button>
            </div>
        </div>
    );
};

export default PreviewPanel;

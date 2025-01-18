import apiClient from "./apiClient";

export interface Video {
    id: number;
    title: string;
    description: string;
    file: string;
}

export interface ProjectData {
    id: number;
    title: string;
    description: string;
}

interface FileResponse {
    name: string;
    url: string;
}

export const getVideos = async (): Promise<Video[]> => {
    const response = await apiClient.get("videos/");
    return response.data;
};

export const postVideos = async (
    title: string,
    description: string,
    file: File
): Promise<void> => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    await apiClient.post("videos/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const deleteVideo = async (id: string): Promise<void> => {
    await apiClient.delete(`videos/${id}/`);
};

export const getProjects = async (): Promise<ProjectData[]> => {
    const response = await apiClient.get("projects/");
    return response.data;
};

export const postProject = async (
    projectData: ProjectData
): Promise<number> => {
    const response = await apiClient.post("projects/", projectData);
    const projectId = response.data.id;
    return projectId;
};

export const deleteProject = async (id: string): Promise<void> => {
    await apiClient.delete(`projects/${id}/`);
};

export const getVideoMetadata = async (
    file: File
): Promise<{
    fps: number;
    duration: number;
    total_frames: number;
}> => {
    const formData = new FormData();
    formData.append("video", file);

    const response = await apiClient.post("get-video-fps/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    console.table(response.data);
    return response.data;
};

export const processVideo = async (
    videoFile: File,
    startTime: number,
    endTime: number,
    resolution: string,
    enhanceAudio: boolean,
    addSubtitles: boolean
): Promise<{ video_url: string; subtitles_url: string }> => {
    try {
        const formData = new FormData();
        formData.append("video", videoFile);
        formData.append("start_time", startTime.toString());
        formData.append("end_time", endTime.toString());
        formData.append("resolution", resolution);
        formData.append("enhance_audio", enhanceAudio.toString());
        formData.append("add_subtitles", addSubtitles.toString());

        const response = await apiClient.post("process-video/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error processing video:", error);
        return { video_url: "", subtitles_url: "" };
    }
};

export const finalizeResponse = async (
    projectID: number,
    videoName: string
): Promise<{ video_url: string; subtitles_url: string }> => {
    try {
        const response = await apiClient.post("finalize-project-files/", {
            project_id: projectID,
            video_name: videoName,
        });

        return response.data;
    } catch (error) {
        console.error("Error finalizing project:", error);
        return { video_url: "", subtitles_url: "" };
    }
};

export const uploadFileToBackend = async (
    file: File,
    projectID: number
): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", projectID.toString());

    try {
        const response = await apiClient.post("upload-file/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data.file_url;
    } catch (error) {
        console.error("Error uploading file:", error);
        return "";
    }
};

const BASE_URL = "http://localhost:8000"; // Base URL for backend

export const fetchExistingFiles = async (
    projectID: number
): Promise<File[]> => {
    const response = await apiClient.get("list-files/", {
        params: { project_id: projectID },
    });
    const data = response.data;

    const files = await Promise.all(
        data.files.map(async ({ name, url }: { name: string; url: string }) => {
            // Ensure the full URL is used
            const fileUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

            console.log("Fetching file:", name, fileUrl);
            const fileResponse = await fetch(fileUrl);

            if (!fileResponse.ok) {
                throw new Error(`Failed to fetch file: ${name}`);
            }

            const fileBlob = await fileResponse.blob();
            return new File([fileBlob], name, { type: fileBlob.type });
        })
    );

    return files;
};

export const fetchSubtitles = async (projectID: number) => {
    try {
        const response = await apiClient.get(`fetch-subtitles/`, {
            params: { project_id: projectID },
        });
        return response.data; // This will be the subtitle text
    } catch (error) {
        console.error("Error fetching subtitles:", error);
        return null;
    }
};

export const getGPUInfo = async () => {
    try {
        const response = await apiClient.get("gpu-info/");
        return response.data;
    } catch (error) {
        console.error("Error fetching GPU info:", error);
        return null;
    }
};

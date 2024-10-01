import apiClient from "./apiClient";

export interface Video {
    id: number;
    title: string;
    description: string;
    file: string; // Zakładamy, że to URL do pliku wideo
}

export interface ProjectData {
    id: number;
    title: string;
    description: string;
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
// Compare this snippet from frontend/src/component/VideoUploader.tsx:

export const getProjects = async (): Promise<ProjectData[]> => {
    const response = await apiClient.get("projects/");
    return response.data;
};

export const postProject = async (projectData: ProjectData): Promise<void> => {
    await apiClient.post("projects/", projectData);
};

export const deleteProject = async (id: string): Promise<void> => {
    await apiClient.delete(`projects/${id}/`);
};

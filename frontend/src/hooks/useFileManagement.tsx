import { useEffect, useState, useCallback } from "react";
import { useEditorContext } from "../context/EditorContext";
import { uploadFileToBackend, fetchExistingFiles } from "../api/apiService";

export const useFileManagement = () => {
    const { files, setFiles, projectID } = useEditorContext();
    const [inputKey, setInputKey] = useState(0);
    const [uploading, setUploading] = useState(false);

    const handleFetchExistingFiles = useCallback(async () => {
        try {
            const files: File[] = await fetchExistingFiles(projectID);

            setFiles(files);
        } catch (error) {
            console.error("Error fetching existing files:", error);
        }
    }, [projectID, setFiles]);

    useEffect(() => {
        handleFetchExistingFiles();
    }, [fetchExistingFiles, projectID]);

    const addFiles = useCallback(
        async (newFiles: File[]) => {
            setUploading(true);
            const uploadedFiles: File[] = [];

            for (const file of newFiles) {
                if (
                    !file.type.startsWith("video/") &&
                    !file.type.startsWith("audio/")
                ) {
                    console.warn("Skipped non-media file:", file.name);
                    continue;
                }

                const fileExists = files.some((f) => f.name === file.name);
                if (!fileExists) {
                    const fileUrl: string = await uploadFileToBackend(
                        file,
                        projectID
                    );
                    if (fileUrl) {
                        uploadedFiles.push(file);
                        console.log("Added file:", file.name, "URL:", fileUrl);
                    }
                }
            }

            setFiles([...files, ...uploadedFiles]);
            setUploading(false);
            setInputKey((prevKey) => prevKey + 1); // Reset input after adding files
        },
        [files, setFiles]
    );

    const removeFile = useCallback(
        (fileName: string) => {
            console.log("Attempting to delete file:", fileName);
            const newFiles = files.filter((file) => file.name !== fileName);
            setFiles(newFiles);
            setInputKey((prevKey) => prevKey + 1); // Reset input after deleting
        },
        [files, setFiles]
    );

    const handleDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const droppedFiles = event.dataTransfer.files;
            if (droppedFiles.length > 0) {
                const filesArray = Array.from(droppedFiles).filter(
                    (file) =>
                        file.type.startsWith("video/") ||
                        file.type.startsWith("audio/")
                );

                console.log(
                    "Przeciągnięto pliki:",
                    filesArray.map((file) => file.name)
                );

                addFiles(filesArray);
            }

            event.dataTransfer.clearData();
        },
        [addFiles]
    );

    return {
        files,
        addFiles,
        removeFile,
        handleDrop,
        uploading,
        inputKey,
    };
};

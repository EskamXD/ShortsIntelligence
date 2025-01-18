import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    server: {
        host: "0.0.0.0", // Umożliwia dostęp spoza kontenera
        port: 5173, // Upewnij się, że port jest zgodny z tym, który jest mapowany w Dockerze
        strictPort: true,
        watch: {
            usePolling: true, // Może pomóc w środowiskach Docker
        },
    },
});


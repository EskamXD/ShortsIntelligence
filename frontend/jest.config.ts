import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/tsconfig.app.json",
            },
        ],
    },
    moduleNameMapper: {
        "\\.(css|scss)$": "identity-obj-proxy", // Mock CSS
        "^@/(.*)$": "<rootDir>/src/$1", // Alias
        "^axios$": "<rootDir>/__mocks__/axios.ts", // Mock Axios
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"], // Jest setup file
};

export default config;

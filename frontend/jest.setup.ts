// jest.setup.ts
import "@testing-library/jest-dom"; // Adds custom matchers for DOM elements

Object.defineProperty(global.HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: jest.fn(),
});

global.URL.createObjectURL = jest.fn(() => "mocked-url");

jest.mock("axios");

beforeAll(() => {
    global.URL.revokeObjectURL = jest.fn();
    global.URL.createObjectURL = jest.fn();
});

afterAll(() => {
    (global.URL.revokeObjectURL as any) = undefined;
    (global.URL.createObjectURL as any) = undefined;
});

import type { AxiosStatic } from "axios";

const mockAxios = {
    create: jest.fn(() => mockAxios), // Metoda `create` zwraca sam obiekt `mockAxios`
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    request: jest.fn(),
    defaults: {} as any,
    interceptors: {
        request: {
            use: jest.fn(),
            eject: jest.fn(),
            clear: jest.fn(), // Dodaj metodę `clear`
        },
        response: {
            use: jest.fn(),
            eject: jest.fn(),
            clear: jest.fn(), // Dodaj metodę `clear`
        },
    },
} as unknown as AxiosStatic;

export default mockAxios;

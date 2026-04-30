import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token && token.trim() !== "") {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log("Erro:", error.response?.status, error.config?.url);

        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default api;
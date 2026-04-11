import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
});


// 👇 REQUEST INTERCEPTOR (COM DEBUG)
api.interceptors.request.use((config) => {
    console.log("Enviando request para:", config.url);
    console.log("Token:", localStorage.getItem("token"));

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
        console.log("Erro na request:", error.response?.status, error.config?.url);

        if (error.response?.status === 401) {
            console.warn("401 detectado → redirecionando para login");

            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;
import axios from "axios"

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// 🔒 Interceptor de requisição
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token && token.trim() !== "") {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// 🔐 Interceptor de resposta
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
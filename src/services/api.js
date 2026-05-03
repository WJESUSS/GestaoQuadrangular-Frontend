import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
    baseURL: API_URL,
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")?.replace(/"/g, "").trim(); // 👈 corrigido aqui
    if (token && token.trim() !== "") {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || "";
        const status = error.response?.status;
        if (status === 401 && !url.includes("actuator") && !url.includes("auth/login")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);
export default api;
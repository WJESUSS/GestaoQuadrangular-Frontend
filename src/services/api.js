import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
    if (token && token !== "") {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || "";
        const status = error.response?.status;

        const ignorar = [
            "actuator",
            "auth/login",
            "auth/registro",
        ];

        const deveIgnorar = ignorar.some(u => url.includes(u));

        if (status === 401 && !deveIgnorar) {
            // ✅ Verifica se o token realmente está expirado antes de redirecionar
            const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
            if (token) {
                try {
                    const [, payload] = token.split(".");
                    const decoded = JSON.parse(atob(payload));
                    const expirado = decoded.exp && decoded.exp < Date.now() / 1000;
                    if (!expirado) {
                        // Token ainda válido — não redireciona, só rejeita
                        console.warn("401 recebido mas token ainda válido:", url);
                        return Promise.reject(error);
                    }
                } catch (_) {}
            }
            console.warn("Token expirado ou inválido, redirecionando...");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default api;
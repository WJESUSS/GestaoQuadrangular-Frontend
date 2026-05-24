import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Providers
import { AuthProvider } from "./auth/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { HelmetProvider } from "react-helmet-async";

// Registro do Service Worker (PWA)
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => console.log("✅ Service Worker registrado:", reg.scope))
            .catch((err) => console.error("❌ Falha ao registrar Service Worker:", err));
    });
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <HelmetProvider>
            <ThemeProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ThemeProvider>
        </HelmetProvider>
    </React.StrictMode>
);
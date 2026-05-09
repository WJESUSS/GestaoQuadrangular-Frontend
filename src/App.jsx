import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Carrega imediatamente — são as telas de entrada
import Home  from "./pages/Home";
import Login from "./pages/Login";

// Carrega só quando o usuário navegar até lá
const AdminPage      = lazy(() => import("./pages/admin/AdminUsers"));
const PastorPage     = lazy(() => import("./pages/pastor/PastorPage"));
const SecretariaPage = lazy(() => import("./pages/secretaria/SecretariaPage"));
const DashboardLider = lazy(() => import("./pages/lider/DashboardLider"));
const TesourariaPage = lazy(() => import("./pages/tesouraria/TesourariaPage"));

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");

    if (!token) return <Navigate to="/login" replace />;

    try {
        const decoded = jwtDecode(token);
        const perfil  = decoded.perfil?.replace("ROLE_", "").toUpperCase();

        if (!perfil) {
            localStorage.removeItem("token");
            return <Navigate to="/login" replace />;
        }

        if (!allowedRoles) return children;

        const roles     = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        const autorizado = roles.some(r => r.toUpperCase() === perfil);

        return autorizado ? children : <Navigate to="/unauthorized" replace />;
    } catch {
        localStorage.removeItem("token");
        return <Navigate to="/login" replace />;
    }
};

// Tela de loading exibida enquanto o chunk carrega
function CarregandoTela() {
    return (
        <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            height: "100vh", background: "#0A0608", gap: 16
        }}>
            <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
                <rect x="38" y="4"  width="24" height="92" rx="3" fill="#C8102E" />
                <rect x="4"  y="38" width="92" height="24" rx="3" fill="#003DA5" />
                <rect x="38" y="38" width="24" height="24" rx="2" fill="#FDB813" />
            </svg>
            <p style={{
                fontFamily: "serif", letterSpacing: ".25em",
                fontSize: 11, color: "rgba(200,16,46,.7)"
            }}>
                CARREGANDO...
            </p>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<CarregandoTela />}>
                <Routes>

                    {/* PÚBLICA */}
                    <Route path="/"      element={<Home />} />
                    <Route path="/login" element={<Login />} />

                    {/* ADMIN */}
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute allowedRoles="ADMIN">
                                <AdminPage />
                            </PrivateRoute>
                        }
                    />

                    {/* SECRETARIA */}
                    <Route
                        path="/secretaria"
                        element={
                            <PrivateRoute allowedRoles={["SECRETARIO", "PASTOR", "ADMIN"]}>
                                <SecretariaPage />
                            </PrivateRoute>
                        }
                    />

                    {/* PASTOR */}
                    <Route
                        path="/pastor/*"
                        element={
                            <PrivateRoute allowedRoles="PASTOR">
                                <PastorPage />
                            </PrivateRoute>
                        }
                    />

                    {/* TESOURARIA */}
                    <Route
                        path="/tesouraria/*"
                        element={
                            <PrivateRoute allowedRoles="TESOUREIRO">
                                <TesourariaPage />
                            </PrivateRoute>
                        }
                    />

                    {/* LÍDER */}
                    <Route
                        path="/lider"
                        element={
                            <PrivateRoute allowedRoles="LIDER_CELULA">
                                <DashboardLider />
                            </PrivateRoute>
                        }
                    />

                    {/* ACESSO NEGADO */}
                    <Route
                        path="/unauthorized"
                        element={
                            <div style={{
                                display: "flex", alignItems: "center",
                                justifyContent: "center", height: "100vh"
                            }}>
                                <h1 style={{ color: "#C8102E", fontFamily: "serif" }}>
                                    🚫 Acesso Negado
                                </h1>
                            </div>
                        }
                    />

                    {/* FALLBACK */}
                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
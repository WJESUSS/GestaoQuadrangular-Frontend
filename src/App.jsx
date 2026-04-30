
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Login = lazy(() => import("./pages/Login"));
const AdminPage = lazy(() => import("./pages/admin/AdminUsers"));
const PastorPage = lazy(() => import("./pages/pastor/PastorPage"));
const SecretariaPage = lazy(() => import("./pages/secretaria/SecretariaPage"));
const DashboardLider = lazy(() => import("./pages/lider/DashboardLider"));
const TesourariaPage = lazy(() => import("./pages/tesouraria/TesourariaPage"));

const Loading = () => (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
    </div>
);

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/login" replace />;
    try {
        const decoded = jwtDecode(token);
        const agora = Date.now() / 1000;
        if (decoded.exp && decoded.exp < agora) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return <Navigate to="/login" replace />;
        }
        const perfil = decoded.perfil?.replace("ROLE_", "").toUpperCase();
        if (!perfil) {
            localStorage.removeItem("token");
            return <Navigate to="/login" replace />;
        }
        if (!allowedRoles) return children;
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        const autorizado = roles.some(r => r.toUpperCase() === perfil);
        return autorizado ? children : <Navigate to="/unauthorized" replace />;
    } catch {
        localStorage.removeItem("token");
        return <Navigate to="/login" replace />;
    }
};

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={<PrivateRoute allowedRoles="ADMIN"><AdminPage /></PrivateRoute>} />
                    <Route path="/secretaria" element={<PrivateRoute allowedRoles={["SECRETARIO", "PASTOR", "ADMIN"]}><SecretariaPage /></PrivateRoute>} />
                    <Route path="/pastor/*" element={<PrivateRoute allowedRoles="PASTOR"><PastorPage /></PrivateRoute>} />
                    <Route path="/tesouraria/*" element={<PrivateRoute allowedRoles="TESOUREIRO"><TesourariaPage /></PrivateRoute>} />
                    <Route path="/lider" element={<PrivateRoute allowedRoles="LIDER_CELULA"><DashboardLider /></PrivateRoute>} />
                    <Route path="/unauthorized" element={<div className="flex items-center justify-center h-screen"><h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1></div>} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

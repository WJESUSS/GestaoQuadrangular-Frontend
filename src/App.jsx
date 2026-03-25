import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// PÁGINAS
import Login from "./pages/Login";
import AdminPage from "./pages/admin/AdminUsers";
import PastorPage from "./pages/pastor/PastorPage";
import SecretariaPage from "./pages/secretaria/SecretariaPage";
import DashboardLider from "./pages/lider/DashboardLider";
import TesourariaPage from "./pages/tesouraria/TesourariaPage";

// PROTEÇÃO DE ROTAS
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
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
      <Routes>
        {/* ROTAS PÚBLICAS */}
        <Route path="/" element={<Navigate to="/login" replace />} />
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
            <div className="flex items-center justify-center h-screen">
              <h1 className="text-2xl font-bold text-red-600">
                🚫 Acesso Negado
              </h1>
            </div>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

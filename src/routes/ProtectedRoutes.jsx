import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children, allowedProfiles }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Verifica expiração
    const agora = Date.now() / 1000;
    if (decoded.exp && decoded.exp < agora) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return <Navigate to="/" replace />;
    }

    const perfil = decoded?.perfil?.replace("ROLE_", "").toUpperCase();

    if (!perfil) {
      localStorage.removeItem("token");
      return <Navigate to="/" replace />;
    }

    if (
        Array.isArray(allowedProfiles) &&
        !allowedProfiles.map(p => p.toUpperCase()).includes(perfil)
    ) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  } catch (error) {
    console.error("Token inválido:", error);
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }
}
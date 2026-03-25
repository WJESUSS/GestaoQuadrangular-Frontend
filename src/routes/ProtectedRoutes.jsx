// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

export default function ProtectedRoute({ children, allowedProfiles }) {
  const token = localStorage.getItem("token");

  // Não logado
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Remove ROLE_ se existir e deixa maiúsculo
    const perfil = decoded?.perfil?.replace("ROLE_", "").toUpperCase();

    // Token inválido ou sem perfil
    if (!perfil) {
      localStorage.removeItem("token");
      return <Navigate to="/" replace />;
    }

    // Perfil não autorizado
    if (
      Array.isArray(allowedProfiles) &&
      !allowedProfiles.map(p => p.toUpperCase()).includes(perfil)
    ) {
      return <Navigate to="/unauthorized" replace />;
    }

    // Tudo OK
    return children;
  } catch (error) {
    console.error("Token inválido:", error);
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }
}

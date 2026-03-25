// auth/AuthContext.jsx
import { createContext, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const login = async (email, senha) => {
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    if (!res.ok) throw new Error("Credenciais inválidas");

    const data = await res.json();

    // Salva o token no localStorage
    localStorage.setItem("token", data.token);

    return data.token;
  };

  const logout = () => {
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

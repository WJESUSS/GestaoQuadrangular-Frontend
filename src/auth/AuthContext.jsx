import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const login = async (email, senha) => {
    try {
      const response = await api.post("auth/login", { email, senha });
      const receivedToken = response.data.token;
      if (!receivedToken) throw new Error("Token não recebido do servidor");

      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);
      return receivedToken;
    } catch (error) {
      console.error("Erro no login:", error);
      throw new Error("Credenciais inválidas ou erro de conexão");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    window.location.href = "/login";
  };

  return (
      <AuthContext.Provider value={{ login, logout, token }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
// auth/AuthContext.jsx
import { createContext, useContext } from "react";
import api from "../services/api"; // ajuste o caminho se necessário

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const login = async (email, senha) => {
    try {
      const response = await api.post("auth/login", {
        email,
        senha
      });

      // 🔐 pega o token corretamente
      const token = response.data.token;

      if (!token) {
        throw new Error("Token não recebido do servidor");
      }

      // 💾 salva token
      localStorage.setItem("token", token);

      return token;

    } catch (error) {
      console.error("Erro no login:", error);
      throw new Error("Credenciais inválidas ou erro de conexão");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
      <AuthContext.Provider value={{ login, logout }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
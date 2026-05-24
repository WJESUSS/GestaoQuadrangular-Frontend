import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const login = async (email, senha) => {
    try {
      const response = await api.post("auth/login", { email, senha });
      const receivedToken = response.data.token;
      if (!receivedToken) throw new Error("sem_token");
      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);
      return receivedToken;
    } catch (error) {
      // ✅ Relança o erro original — preserva error.response.status e error.response.data
      throw error;
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
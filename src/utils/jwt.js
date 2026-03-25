// src/utils/jwt.js

export function getPerfilFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    // Decodifica o payload do JWT sem depender de bibliotecas externas
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role; // ADMIN ou LIDER
  } catch (err) {
    console.error("Token inválido", err);
    return null;
  }
}

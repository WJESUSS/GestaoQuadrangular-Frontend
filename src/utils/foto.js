const API_URL = import.meta.env.VITE_API_URL;

export function getFotoUrl(fotoPerfil) {
  if (!fotoPerfil) return null;
  if (fotoPerfil.startsWith("data:")) return fotoPerfil;
  if (fotoPerfil.startsWith("http://") || fotoPerfil.startsWith("https://")) return fotoPerfil;
  if (fotoPerfil.startsWith("/")) return `${API_URL}${fotoPerfil}`;
  return fotoPerfil;
}

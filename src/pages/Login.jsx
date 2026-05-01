import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Loader2, Lock, Mail, ShieldCheck, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = await login(email, password);
      if (!token) throw new Error("Token não recebido");

      const decoded = jwtDecode(token);

      localStorage.setItem("user", JSON.stringify({
        id: decoded.id,
        username: decoded.sub,
        perfil: decoded.perfil
      }));

      const perfil = decoded.perfil?.replace("ROLE_", "").toUpperCase();

      switch (perfil) {
        case "ADMIN": navigate("/admin"); break;
        case "PASTOR": navigate("/pastor"); break;
        case "LIDER_CELULA": navigate("/lider"); break;
        case "TESOUREIRO": navigate("/tesouraria"); break;
        case "SECRETARIO": navigate("/secretaria"); break;
        default: setError("Perfil não reconhecido: " + perfil);
      }

    } catch (err) {
      setError("Credenciais inválidas ou erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-500 bg-white dark:bg-black">

      {/* Fundo animado */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-200 via-white to-purple-200 dark:from-indigo-900 dark:via-black dark:to-purple-900 animate-gradient"></div>

      {/* Glow */}
      <div className="absolute w-[900px] h-[900px] pointer-events-none bg-indigo-600/20 rounded-full blur-[200px] animate-pulse"></div>

      {/* Toggle Tema */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-full backdrop-blur-xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 text-black dark:text-white hover:scale-110 transition"
      >
        {theme === "dark" ? <Sun size={26} /> : <Moon size={26} />}
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg p-12 rounded-3xl backdrop-blur-3xl bg-white/70 dark:bg-white/10 border border-white/40 dark:border-white/20 shadow-[0_0_60px_rgba(99,102,241,0.5)] transition-colors duration-500">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="p-6 rounded-full bg-gradient-to-br from-red-600 via-yellow-500 to-blue-600 shadow-[0_0_50px_rgba(255,255,255,0.3)]">
            <ShieldCheck size={70} className="text-white drop-shadow-[0_0_10px_white]" />
          </div>

          <h1 className="mt-6 text-5xl font-extrabold tracking-widest text-gray-900 dark:text-white">
            IEQ GESTÃO
          </h1>

          <p className="mt-3 text-sm uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
            Plataforma Administrativa Eclesiástica
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-center bg-red-600/20 border border-red-500/40 text-red-600 dark:text-red-300 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-300" />
            <input
              type="email"
              placeholder="usuario@ieq.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/70 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Senha */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-300" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/70 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold tracking-widest text-white bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 hover:brightness-125 transition-all shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            {loading ? (
              <div className="flex justify-center gap-2">
                <Loader2 className="animate-spin" />
                AUTENTICANDO...
              </div>
            ) : (
              "ACESSAR SISTEMA"
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 300% 300%;
          animation: gradient 15s ease infinite;
        }
      `}</style>
    </div>
  );
}
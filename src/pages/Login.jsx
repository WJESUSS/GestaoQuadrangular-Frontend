import { useState, useEffect, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Loader2, Lock, Mail, ShieldCheck, Sun, Moon, ArrowRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const hasWokenUp = useRef(false);

  useEffect(() => {
    if (!hasWokenUp.current) {
      api.get("/actuator/health").catch(() => {});
      hasWokenUp.current = true;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await login(email, password);
      if (!token) throw new Error("Falha na autenticação.");
      const decoded = jwtDecode(token);
      localStorage.setItem("user", JSON.stringify({
        id: decoded.id,
        username: decoded.sub,
        perfil: decoded.perfil
      }));
      const perfil = (decoded.perfil || "").replace("ROLE_", "").toUpperCase();
      const rotas = { ADMIN: "/admin", PASTOR: "/pastor", LIDER_CELULA: "/lider", TESOUREIRO: "/tesouraria", SECRETARIO: "/secretaria" };
      if (rotas[perfil]) navigate(rotas[perfil]);
      else setError("Acesso restrito a perfis autorizados.");
    } catch (err) {
      setError(err.response?.status === 401 ? "Credenciais inválidas." : "Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">

        {/* Background Decorativo Profissional */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-[0.05]" />
        </div>

        {/* Botão de Tema Flutuante */}
        <button
            onClick={toggleTheme}
            className="absolute top-6 right-6 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm hover:shadow-indigo-500/20 transition-all duration-300"
        >
          {theme === "dark" ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-slate-700" />}
        </button>

        <div className="relative z-10 w-full max-w-md">
          {/* Card Principal */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/40 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">

            {/* Barra de progresso do gradiente IEQ no topo do card */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500" />

            <div className="p-8 md:p-10">
              {/* Logo e Título */}
              <div className="text-center mb-10">
                <div className="inline-flex p-4 rounded-2xl bg-slate-950 dark:bg-white shadow-xl mb-6">
                  <ShieldCheck size={32} className="text-white dark:text-slate-950" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  IEQ <span className="text-indigo-600 dark:text-indigo-400">Portal</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
                  Gestão Administrativa Integrada
                </p>
              </div>

              {error && (
                  <div className="mb-6 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium animate-shake text-center">
                    {error}
                  </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">E-mail</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@exemplo.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">Senha</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        required
                    />
                  </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                  ) : (
                      <>
                        Acessar Painel
                        <ArrowRight size={18} />
                      </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                  Igreja do Evangelho Quadrangular
                </p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
      </div>
  );
}
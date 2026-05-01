import { useState, useEffect } from "react";
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

  // Acorda o backend assim que a tela de login abre
  useEffect(() => {
    api.get("/actuator/health").catch(() => {});
  }, []);

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

      const rotas = {
        ADMIN: "/admin",
        PASTOR: "/pastor",
        LIDER_CELULA: "/lider",
        TESOUREIRO: "/tesouraria",
        SECRETARIO: "/secretaria",
      };

      if (rotas[perfil]) {
        navigate(rotas[perfil]);
      } else {
        setError("Perfil de acesso não reconhecido.");
      }

    } catch (err) {
      setError("Credenciais inválidas ou erro de servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#050505] transition-colors duration-700">

        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 dark:from-indigo-950/30 dark:via-black dark:to-purple-950/30 animate-gradient"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <button
            onClick={toggleTheme}
            className="absolute top-8 right-8 z-50 p-3 rounded-2xl backdrop-blur-md bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 text-slate-800 dark:text-slate-200 shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
        >
          {theme === "dark" ? <Sun size={22} className="text-yellow-400" /> : <Moon size={22} className="text-indigo-600" />}
        </button>

        <div className="relative z-10 w-full max-w-[480px] mx-4">
          <div className="p-1 rounded-[2.5rem] bg-gradient-to-b from-white/60 to-white/20 dark:from-white/20 dark:to-transparent shadow-2xl">
            <div className="p-8 md:p-12 rounded-[2.3rem] backdrop-blur-2xl bg-white/80 dark:bg-black/60 border border-white/20">

              <div className="flex flex-col items-center mb-10 text-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition duration-500"></div>
                  <div className="relative p-5 rounded-3xl bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 shadow-2xl">
                    <ShieldCheck size={52} className="text-white" />
                  </div>
                </div>

                <h1 className="mt-8 text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                  IEQ <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">GESTÃO</span>
                </h1>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 opacity-80">
                  Administrative Intelligence
                </p>
              </div>

              {error && (
                  <div className="mb-6 p-4 text-sm font-medium text-center bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl animate-shake">
                    {error}
                  </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                <div className="space-y-1">
                  <label className="text-[10px] ml-4 font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">E-mail Corporativo</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="email"
                        placeholder="exemplo@ieq.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-white/10 outline-none transition-all duration-300"
                        required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] ml-4 font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Senha de Acesso</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="password"
                        placeholder="????????"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-white/10 outline-none transition-all duration-300"
                        required
                    />
                  </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full mt-4 group overflow-hidden py-4 rounded-2xl font-bold tracking-widest text-white transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 group-hover:scale-105 transition-transform duration-500"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                          <span>ENTRAR NO SISTEMA</span>
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                  </div>
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500 font-medium">
                &copy; 2026 Igreja do Evangelho Quadrangular <br/>
                SGE - Sistema de Gestão Integrado
              </p>
            </div>
          </div>
        </div>

        <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 10s ease infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
      </div>
  );
}
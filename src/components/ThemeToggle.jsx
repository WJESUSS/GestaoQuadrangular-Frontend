import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { Loader2, Lock, Mail, ShieldCheck, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext"; // ajuste o caminho se necessário

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

      const usuarioParaSalvar = {
        id: decoded.id,
        username: decoded.sub,
        perfil: decoded.perfil
      };
      localStorage.setItem("user", JSON.stringify(usuarioParaSalvar));

      const perfil = decoded.perfil?.replace("ROLE_", "").toUpperCase();

      switch (perfil) {
        case "ADMIN": navigate("/admin"); break;
        case "PASTOR": navigate("/pastor"); break;
        case "LIDER_CELULA": navigate("/lider"); break;
        case "TESOUREIRO": navigate("/tesouraria"); break;
        case "SECRETARIO": navigate("/secretaria"); break;
        default:
          setError("Perfil de acesso não reconhecido: " + perfil);
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Credenciais inválidas ou erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 overflow-hidden transition-colors duration-500">

      {/* Botão de alternar tema */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-20 p-3 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 shadow-lg hover:scale-110 transition-all duration-300"
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? (
          <Sun size={24} className="text-yellow-500" />
        ) : (
          <Moon size={24} className="text-indigo-500" />
        )}
      </button>

      {/* Background decorativo */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-red-500/10 dark:bg-red-900/20 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-900/20 blur-[140px]" />
        <div className="absolute top-[15%] right-[10%] w-[40%] h-[40%] rounded-full bg-yellow-400/10 dark:bg-yellow-900/15 blur-[120px]" />
        <div className="absolute bottom-[15%] left-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-900/20 blur-[120px]" />
      </div>

      {/* Card central */}
      <div className="relative z-10 w-full max-w-md px-8 py-12 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl shadow-slate-400/30 dark:shadow-black/60 transition-colors duration-500">

        {/* Logo e Título */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="p-5 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/40 rounded-full border border-indigo-300 dark:border-indigo-500/30 shadow-lg">
              <ShieldCheck size={56} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            IEQ <span className="text-indigo-600 dark:text-indigo-400 font-light">GESTÃO</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 font-medium tracking-wide">
            Administração Eclesiástica Digital
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100/80 dark:bg-red-900/30 border border-red-300 dark:border-red-700/50 rounded-2xl text-red-800 dark:text-red-300 text-sm text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase ml-1 tracking-wider">
              Acesso do Usuário
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={20} />
              <input
                type="email"
                placeholder="exemplo@ieq.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase ml-1 tracking-wider">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={20} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
              />
            </div>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading}
            className={`relative w-full py-4 px-6 mt-6 overflow-hidden rounded-2xl font-black text-white tracking-widest transition-all duration-300 transform active:scale-95 shadow-xl
              ${loading
                ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 dark:from-red-700 dark:via-yellow-600 dark:to-blue-700 hover:brightness-110 hover:shadow-indigo-500/40'}`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="animate-spin" size={20} />
                AUTENTICANDO...
              </div>
            ) : (
              "ENTRAR NO SISTEMA"
            )}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-700/60 opacity-70"></div>
          </button>
        </form>

        {/* Rodapé decorativo */}
        <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-700/50 flex justify-center gap-5">
          <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.7)]"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.7)]"></div>
          <div className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.7)]"></div>
          <div className="w-3 h-3 rounded-full bg-purple-600 shadow-[0_0_12px_rgba(147,51,234,0.7)]"></div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
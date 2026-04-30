import { useState, useEffect } from "react";
import { Users, UserPlus, Home, FileText, Building2, Sun, Moon, LogOut } from "lucide-react";
// Se estiver usando rotas, importe o hook de navegação:
// import { useNavigate } from "react-router-dom";

import Membros from "./Membros";
import Celulas from "./Celulas";
import Visitantes from "./Visitante";
import FichasEncontro from "./FichasEncontro";
import SecretariaCelulas from "./SecretariaCelulas";

export default function SecretariaPage() {
  const [moduloAtivo, setModuloAtivo] = useState("MEMBROS");
  const [darkMode, setDarkMode] = useState(false);
  // const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    if (window.confirm("Deseja realmente sair do sistema?")) {
      localStorage.removeItem("token"); // Limpa o token
      window.location.href = "/"; // Redireciona para o login
      // navigate("/"); // Ou use o navigate se estiver com Router
    }
  };

  const modulos = [
    { id: "MEMBROS", label: "Membros", icon: <Users size={20} />, color: "blue" },
    { id: "VISITANTES", label: "Visitantes", icon: <UserPlus size={20} />, color: "purple" },
    { id: "CELULAS", label: "Células", icon: <Home size={20} />, color: "emerald" },
    { id: "FICHAS", label: "Fichas Encontro", icon: <FileText size={20} />, color: "orange" },
    { id: "SECRETARIACELULAS", label: "Secretaria Células", icon: <Building2 size={20} />, color: "teal" },
  ];

  const getActiveColor = (color) => {
    const colors = {
      blue: "bg-blue-600 shadow-blue-500/40",
      purple: "bg-purple-600 shadow-purple-500/40",
      emerald: "bg-emerald-600 shadow-emerald-500/40",
      orange: "bg-orange-600 shadow-orange-500/40",
      teal: "bg-teal-600 shadow-teal-500/40",
    };
    return colors[color] || "bg-gray-600";
  };

  return (
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500">

        {/* SIDEBAR PREMIUM */}
        <aside className="w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 p-8 flex flex-col shrink-0 transition-all z-20">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic">
              Secretaria<span className="text-blue-600">.</span>
            </h1>

            <button
                onClick={toggleTheme}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:scale-110 active:scale-95 transition-all shadow-inner border border-transparent dark:border-slate-700"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <nav className="space-y-2.5 flex-1">
            {modulos.map((m) => (
                <button
                    key={m.id}
                    onClick={() => setModuloAtivo(m.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 group ${
                        moduloAtivo === m.id
                            ? `${getActiveColor(m.color)} text-white shadow-xl scale-[1.02]`
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
              <span className={`${moduloAtivo === m.id ? "text-white" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"}`}>
                {m.icon}
              </span>
                  {m.label}
                </button>
            ))}
          </nav>

          {/* BOTÃO DE SAIR - ADICIONADO AQUI */}
          <div className="mt-auto space-y-6">
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 group"
            >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              Sair do Sistema
            </button>

            {/* Footer Sidebar */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Gestão Eclesiástica v3.0
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-12 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-200/50 via-transparent to-transparent dark:from-blue-900/10">
          {/* ... (resto do cabeçalho e conteúdo permanecem iguais) */}
          <header className="mb-10 flex justify-between items-end">
            <div>
              <p className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-[0.3em] mb-2 ml-1">
                Módulo Ativo
              </p>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {modulos.find((m) => m.id === moduloAtivo)?.label}
              </h2>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-500/20 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistema Online
            </div>
          </header>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3rem] blur opacity-10 dark:opacity-20 group-hover:opacity-30 transition duration-1000"></div>

            <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white dark:border-slate-800 overflow-hidden transition-all duration-500">
              <div className="min-h-[600px] transition-colors duration-500 p-2">
                {/* O switch de conteúdo aqui */}
                {moduloAtivo === "MEMBROS" && <Membros />}
                {moduloAtivo === "VISITANTES" && <Visitantes />}
                {moduloAtivo === "CELULAS" && <Celulas />}
                {moduloAtivo === "FICHAS" && <FichasEncontro />}
                {moduloAtivo === "SECRETARIACELULAS" && <SecretariaCelulas />}
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}
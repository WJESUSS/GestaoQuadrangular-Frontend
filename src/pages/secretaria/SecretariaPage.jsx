import { useState, useEffect } from "react";
import { Users, UserPlus, Home, FileText, Building2, Sun, Moon, LogOut, Menu, X } from "lucide-react";

import Membros from "./Membros";
import Celulas from "./Celulas";
import Visitantes from "./Visitante";
import FichasEncontro from "./FichasEncontro";
import SecretariaCelulas from "./SecretariaCelulas";

export default function SecretariaPage() {
  const [moduloAtivo, setModuloAtivo] = useState("MEMBROS");
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para o menu mobile

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
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  const modulos = [
    { id: "MEMBROS", label: "Membros", icon: <Users size={20} />, color: "blue" },
    { id: "VISITANTES", label: "Visitantes", icon: <UserPlus size={20} />, color: "purple" },
    { id: "CELULAS", label: "Células", icon: <Home size={20} />, color: "emerald" },
    { id: "FICHAS", label: "Fichas", icon: <FileText size={20} />, color: "orange" },
    { id: "SECRETARIACELULAS", label: "Secretaria", icon: <Building2 size={20} />, color: "teal" },
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
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500">

        {/* HEADER MOBILE */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-50">
          <h1 className="text-lg font-black text-slate-800 dark:text-white uppercase italic">
            Secretaria<span className="text-blue-600">.</span>
          </h1>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-xl bg-blue-600 text-white">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* SIDEBAR / MOBILE OVERLAY */}
        <aside className={`
        fixed inset-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 md:w-72 lg:w-80
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
        bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col
      `}>
          <div className="hidden md:flex items-center justify-between mb-10">
            <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic">
              Secretaria<span className="text-blue-600">.</span>
            </h1>
            <button onClick={toggleTheme} className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:scale-110 transition-all">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <nav className="space-y-1.5 flex-1 mt-12 md:mt-0">
            {modulos.map((m) => (
                <button
                    key={m.id}
                    onClick={() => {
                      setModuloAtivo(m.id);
                      setIsMenuOpen(false); // Fecha o menu no mobile após clicar
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${
                        moduloAtivo === m.id
                            ? `${getActiveColor(m.color)} text-white shadow-lg`
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                >
              <span className={moduloAtivo === m.id ? "text-white" : "text-slate-400"}>
                {m.icon}
              </span>
                  {m.label}
                </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
              <LogOut size={20} />
              Sair do Sistema
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
          <header className="mb-6 md:mb-10 flex justify-between items-end">
            <div>
              <p className="text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-1">
                Módulo Ativo
              </p>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {modulos.find((m) => m.id === moduloAtivo)?.label}
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-500/20 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </div>
          </header>

          {/* CONTAINER DO CONTEÚDO */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[2rem] blur-xl" />
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="min-h-[500px] p-4 md:p-6">
                {/* O switch de conteúdo */}
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
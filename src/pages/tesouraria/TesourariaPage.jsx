import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart2, DollarSign, FileText, Users,
  TrendingUp, ArrowLeft, LogOut, Sun, Moon,
  LayoutDashboard, ChevronRight
} from "lucide-react";

// Imports das sub-páginas
import TesourariaDashboard from "./TesourariaDashboard.jsx";
import TesourariaLancamento from "./TesourariaLancamento.jsx";
import TesourariaRelatorio from "./TesourariaRelatorio.jsx";
import TesourariaDizimistas from "./TesourariaDizimistas.jsx";
import TesourariaComparativo from "./TesourariaComparativo.jsx";

export default function TesourariaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(
      localStorage.getItem("theme") === "dark"
  );

  const isHome = location.pathname === "/tesouraria" || location.pathname === "/tesouraria/";

  // Efeito CRÍTICO: Aplica a classe no elemento RAIZ (HTML)
  useEffect(() => {
    const root = window.document.documentElement; // Pega o <html>
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const cards = [
    { titulo: "Dashboard", desc: "Análise Geral", icone: <BarChart2 size={24} />, cor: "from-indigo-500 to-blue-600", rota: "dashboard" },
    { titulo: "Lançamento", desc: "Gestão de Fluxo", icone: <DollarSign size={24} />, cor: "from-emerald-500 to-teal-600", rota: "lancamento" },
    { titulo: "Relatório", desc: "Exportação e Docs", icone: <FileText size={24} />, cor: "from-amber-400 to-orange-500", rota: "relatorio" },
    { titulo: "Dizimistas", desc: "Base de Dados", icone: <Users size={24} />, cor: "from-rose-500 to-red-600", rota: "dizimistas" },
    { titulo: "Comparativo", desc: "Evolução Anual", icone: <TrendingUp size={24} />, cor: "from-purple-500 to-fuchsia-600", rota: "comparativo" },
  ];

  return (
      // Removi a condicional de classe daqui e deixei apenas no useEffect acima
      <div className="min-h-screen transition-colors duration-500 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-slate-100 font-sans p-4 md:p-10">

        {/* NAV BAR PREMIUM */}
        <nav className="max-w-7xl mx-auto flex items-center justify-between mb-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-[2rem] border border-white dark:border-slate-800 shadow-xl">
          <div className="flex items-center gap-4">
            {!isHome ? (
                <button
                    onClick={() => navigate("/tesouraria")}
                    className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:scale-110 transition-all text-indigo-600"
                >
                  <ArrowLeft size={20} />
                </button>
            ) : (
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 text-white">
                  <LayoutDashboard size={20} />
                </div>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic leading-none">
                Tesouraria <span className="text-indigo-600 dark:text-indigo-400 font-light">IEQ</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Financial Management v2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* THEME SWITCHER CORRIGIDO */}
            <button
                onClick={toggleTheme}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-inner border border-transparent dark:border-slate-700"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-500/20"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Encerrar</span>
            </button>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto">
          {isHome ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards.map((card) => (
                    <button
                        key={card.titulo}
                        onClick={() => navigate(card.rota)}
                        className="group relative h-56 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-500 hover:-translate-y-3 flex flex-col justify-between overflow-hidden text-left"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.cor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                      <div className="flex justify-between items-start relative z-10">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.cor} text-white shadow-lg`}>
                          {card.icone}
                        </div>
                        <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:translate-x-2 transition-transform" />
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white">
                          {card.titulo}
                        </h3>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-40 dark:opacity-60 mt-1">
                          {card.desc}
                        </p>
                      </div>

                      <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${card.cor} blur-3xl opacity-0 group-hover:opacity-20 transition-all duration-700`} />
                    </button>
                ))}
              </div>
          ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-6 md:p-10 border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Routes>
                  <Route path="dashboard" element={<TesourariaDashboard />} />
                  <Route path="lancamento" element={<TesourariaLancamento />} />
                  <Route path="relatorio" element={<TesourariaRelatorio />} />
                  <Route path="dizimistas" element={<TesourariaDizimistas />} />
                  <Route path="comparativo" element={<TesourariaComparativo />} />
                </Routes>
              </div>
          )}
        </main>

        {/* FOOTER DECORATIVO */}
        {isHome && (
            <footer className="max-w-7xl mx-auto mt-20 flex justify-between items-center opacity-30 dark:opacity-20 grayscale hover:grayscale-0 transition-all duration-1000">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-400 dark:to-slate-600" />
              <p className="px-6 text-[10px] font-black uppercase tracking-[0.5em]">Conselho Nacional de Diretores</p>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-400 dark:to-slate-600" />
            </footer>
        )}
      </div>
  );
}
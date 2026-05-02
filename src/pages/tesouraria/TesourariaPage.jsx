import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart2, DollarSign, FileText, Users,
  TrendingUp, ArrowLeft, LogOut, Sun, Moon,
  LayoutDashboard, ChevronRight
} from "lucide-react";

import TesourariaDashboard from "./TesourariaDashboard.jsx";
import TesourariaLancamento from "./TesourariaLancamento.jsx";
import TesourariaRelatorio from "./TesourariaRelatorio.jsx";
import TesourariaDizimistas from "./TesourariaDizimistas.jsx";
import TesourariaComparativo from "./TesourariaComparativo.jsx";

export default function TesourariaPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  const isHome = location.pathname === "/tesouraria" || location.pathname === "/tesouraria/";

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) { root.classList.add("dark");    localStorage.setItem("theme", "dark");  }
    else          { root.classList.remove("dark"); localStorage.setItem("theme", "light"); }
  }, [darkMode]);

  const toggleTheme  = () => setDarkMode(!darkMode);
  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const cards = [
    { titulo: "Dashboard",   desc: "Análise Geral",      icone: <BarChart2  size={22} />, cor: "from-indigo-500 to-blue-600",    rota: "dashboard"   },
    { titulo: "Lançamento",  desc: "Gestão de Fluxo",    icone: <DollarSign size={22} />, cor: "from-emerald-500 to-teal-600",   rota: "lancamento"  },
    { titulo: "Relatório",   desc: "Exportação e Docs",  icone: <FileText   size={22} />, cor: "from-amber-400 to-orange-500",   rota: "relatorio"   },
    { titulo: "Dizimistas",  desc: "Base de Dados",      icone: <Users      size={22} />, cor: "from-rose-500 to-red-600",       rota: "dizimistas"  },
    { titulo: "Comparativo", desc: "Evolução Anual",     icone: <TrendingUp size={22} />, cor: "from-violet-500 to-purple-600",  rota: "comparativo" },
  ];

  return (
      <div className="min-h-screen transition-colors duration-300 bg-[#f5f6f8] dark:bg-[#0a0c10] text-slate-900 dark:text-slate-100" style={{fontFamily:"'Inter',sans-serif"}}>

        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .card-nav {
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.9);
        }
        .dark .card-nav {
          background: rgba(15,18,25,0.85);
          border-color: rgba(255,255,255,0.05);
        }

        .menu-card {
          background: #fff;
          border: 1px solid #eaecf0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .dark .menu-card {
          background: #111318;
          border-color: #1e2330;
        }
        .menu-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.1);
        }
        .dark .menu-card:hover {
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
        }

        .content-wrap {
          background: #fff;
          border: 1px solid #eaecf0;
        }
        .dark .content-wrap {
          background: #111318;
          border-color: #1e2330;
        }

        .btn-back {
          background: #fff;
          border: 1px solid #eaecf0;
          color: #5046e5;
          transition: all 0.15s;
        }
        .dark .btn-back {
          background: #1a1d27;
          border-color: #2a2f40;
          color: #818cf8;
        }
        .btn-back:hover { background: #f0effe; }
        .dark .btn-back:hover { background: #1e1b4b; }

        .btn-theme {
          background: #f1f3f5;
          border: 1px solid #e5e7eb;
          transition: all 0.15s;
        }
        .dark .btn-theme {
          background: #1a1d27;
          border-color: #2a2f40;
          color: #fbbf24;
        }
        .btn-theme:hover { background: #e5e7eb; }
        .dark .btn-theme:hover { background: #252836; }

        .btn-logout {
          background: #fff1f0;
          border: 1px solid #fecdca;
          color: #d92d20;
          transition: all 0.15s;
        }
        .dark .btn-logout {
          background: rgba(217,45,32,0.1);
          border-color: rgba(217,45,32,0.2);
          color: #f97066;
        }
        .btn-logout:hover { background: #d92d20; color: #fff; border-color: #d92d20; }
      `}</style>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">

          {/* NAV BAR */}
          <nav className="card-nav backdrop-blur-md rounded-2xl px-5 py-4 mb-10 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              {!isHome ? (
                  <button onClick={() => navigate("/tesouraria")} className="btn-back p-2.5 rounded-xl shadow-sm">
                    <ArrowLeft size={18} />
                  </button>
              ) : (
                  <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-500/25">
                    <LayoutDashboard size={18} />
                  </div>
              )}
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-none text-slate-900 dark:text-white">
                  Tesouraria <span className="text-indigo-600 dark:text-indigo-400 font-light">IEQ</span>
                </h1>
                <p className="text-[10px] font-medium text-slate-400 tracking-widest mt-0.5 uppercase">
                  Financial Management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="btn-theme p-2.5 rounded-xl">
                {darkMode ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button onClick={handleLogout} className="btn-logout flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs">
                <LogOut size={15} />
                <span className="hidden sm:inline">Encerrar</span>
              </button>
            </div>
          </nav>

          {/* CONTEÚDO */}
          <main>
            {isHome ? (
                <>
                  {/* HEADER DA HOME */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Módulos</h2>
                    <p className="text-sm text-slate-400 mt-1">Selecione uma área para começar</p>
                  </div>

                  {/* CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cards.map((card) => (
                        <button
                            key={card.titulo}
                            onClick={() => navigate(card.rota)}
                            className="menu-card group rounded-2xl p-6 text-left flex flex-col gap-10 shadow-sm"
                        >
                          <div className="flex items-start justify-between">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${card.cor} text-white shadow-md`}>
                              {card.icone}
                            </div>
                            <ChevronRight
                                size={16}
                                className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all mt-1"
                            />
                          </div>

                          <div>
                            <h3 className="text-base font-700 font-bold text-slate-900 dark:text-white leading-none">
                              {card.titulo}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1.5 font-medium">
                              {card.desc}
                            </p>
                          </div>
                        </button>
                    ))}
                  </div>
                </>
            ) : (
                <div className="content-wrap rounded-2xl shadow-sm p-6 md:p-8">
                  <Routes>
                    <Route path="dashboard"   element={<TesourariaDashboard />} />
                    <Route path="lancamento"  element={<TesourariaLancamento />} />
                    <Route path="relatorio"   element={<TesourariaRelatorio />} />
                    <Route path="dizimistas"  element={<TesourariaDizimistas />} />
                    <Route path="comparativo" element={<TesourariaComparativo />} />
                  </Routes>
                </div>
            )}
          </main>

          {/* FOOTER */}
          {isHome && (
              <footer className="mt-16 flex items-center gap-6 opacity-30 dark:opacity-20">
                <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                  Conselho Nacional de Diretores
                </p>
                <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
              </footer>
          )}
        </div>
      </div>
  );
}
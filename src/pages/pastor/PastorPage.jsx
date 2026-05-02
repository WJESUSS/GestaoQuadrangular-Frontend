import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";

import PainelPastor from "./PainelPastor";
import RelatorioCelula from "./RelatorioCelula";
import SecretariaDiscipulado from "./SecretariaDiscipulado";
import SolicitacoesMultiplicacao from "./SolicitacoesMultiplicacao";
import RankingCelulas from "./RankingCelulas";
import PainelAlertas from "./PainelAlertas";

import {
  LayoutDashboard, FileText, Users, Share2, Trophy,
  AlertTriangle, ChevronRight, Activity, Settings,
  ShieldCheck, Bell, Menu, X, LogOut
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/pastor",                   icon: LayoutDashboard, label: "Dashboard",    end: true },
  { to: "/pastor/relatorio-celulas", icon: FileText,        label: "Relatórios"             },
  { to: "/pastor/discipulado",       icon: Users,           label: "Secretaria"             },
  { to: "/pastor/multiplicacoes",    icon: Share2,          label: "Multiplicações"         },
  { to: "/pastor/ranking-celulas",   icon: Trophy,          label: "Ranking"                },
];

const PAGE_TITLES = {
  "pastor":            "Dashboard Geral",
  "relatorio-celulas": "Relatórios",
  "discipulado":       "Secretaria",
  "multiplicacoes":    "Multiplicações",
  "ranking-celulas":   "Ranking",
  "alertas":           "Painel de Alertas",
};

export default function PastorPage() {
  const [celulas, setCelulas]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const carregarDadosGerais = async () => {
    const token = localStorage.getItem("token")?.replace(/"/g, "");
    try {
      const res = await api.get("/celulas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCelulas(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar resumo de células:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDadosGerais(); }, []);

  // Fecha sidebar ao trocar de rota no mobile
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const totalAtivas = celulas.filter((c) => c.ativa === true).length;

  const getPageTitle = () => {
    const seg = location.pathname.split("/").pop();
    return PAGE_TITLES[seg] || PAGE_TITLES["pastor"];
  };

  return (
      <div className="flex h-screen bg-[#f8fafc] dark:bg-[#020617] overflow-hidden text-slate-900 dark:text-slate-100">

        {/* OVERLAY MOBILE */}
        {isSidebarOpen && (
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
            />
        )}

        {/* SIDEBAR */}
        <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 dark:bg-slate-950
        text-white flex flex-col shadow-2xl
        transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>

          {/* LOGO */}
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ShieldCheck size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight leading-none text-white">IGREJA</h2>
                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Gestão Pastoral</p>
              </div>
            </div>
            <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* INDICADOR DE STATUS */}
          <div className="mx-6 mb-8 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Rede de Células</span>
              <Activity size={13} className="text-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{loading ? "—" : totalAtivas}</span>
              <span className="text-xs font-bold text-slate-500">/ {celulas.length} ativas</span>
            </div>
            <div className="w-full bg-slate-700 h-1 rounded-full mt-3 overflow-hidden">
              <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: loading || celulas.length === 0 ? "0%" : `${Math.round((totalAtivas / celulas.length) * 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-indigo-500 h-full rounded-full"
              />
            </div>
          </div>

          {/* NAVEGAÇÃO */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <p className="px-3 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Menu Principal</p>

            {NAV_ITEMS.map(item => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                        `group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-150 text-sm font-semibold
                ${isActive
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                            : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                        }`
                    }
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={17} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={13} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                </NavLink>
            ))}

            <div className="pt-5 mt-4 border-t border-slate-800/80">
              <p className="px-3 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Urgente</p>
              <NavLink
                  to="/pastor/alertas"
                  className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-150 text-sm font-semibold
                ${isActive
                          ? "bg-red-600 text-white shadow-md shadow-red-600/25"
                          : "text-red-400/80 hover:bg-red-500/10 hover:text-red-300"
                      }`
                  }
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={17} className="animate-pulse" />
                  <span>Painel de Alertas</span>
                </div>
                <ChevronRight size={13} className="opacity-60" />
              </NavLink>
            </div>
          </nav>

          {/* FOOTER */}
          <div className="p-5 mt-auto">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold border border-indigo-500/20">
                PS
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-300 leading-none">Pastor</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Administrador</p>
              </div>
              <button
                  onClick={() => { localStorage.clear(); window.location.href = "/"; }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Sair"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* HEADER */}
          <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <Menu size={18} />
              </button>
              <h1 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">Total</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 leading-tight">
                {celulas.length} Células
              </span>
              </div>
              <button className="h-9 w-9 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors border border-slate-200 dark:border-slate-700">
                <Bell size={16} />
              </button>
              <button className="h-9 w-9 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors border border-slate-200 dark:border-slate-700">
                <Settings size={16} />
              </button>
            </div>
          </header>

          {/* ÁREA DE RENDERIZAÇÃO */}
          {/* CORREÇÃO: key estável por pathname, sem exit animation que causava duplo-render */}
          <section className="flex-1 overflow-y-auto p-5 md:p-8 bg-[#f8fafc] dark:bg-[#020617]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="h-full"
              >
                <Routes location={location}>
                  <Route index                    element={<PainelPastor />} />
                  <Route path="relatorio-celulas" element={<RelatorioCelula />} />
                  <Route path="discipulado"       element={<SecretariaDiscipulado />} />
                  <Route path="multiplicacoes"    element={<SolicitacoesMultiplicacao />} />
                  <Route path="ranking-celulas"   element={<RankingCelulas />} />
                  <Route path="alertas"           element={<PainelAlertas />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </section>
        </main>
      </div>
  );
}
import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";

// Páginas
import PainelPastor from "./PainelPastor";
import RelatorioCelula from "./RelatorioCelula";
import SecretariaDiscipulado from "./SecretariaDiscipulado";
import SolicitacoesMultiplicacao from "./SolicitacoesMultiplicacao";
import RankingCelulas from "./RankingCelulas";
import PainelAlertas from "./PainelAlertas";

// Ícones
import {
  LayoutDashboard,
  FileText,
  Users,
  Share2,
  Trophy,
  AlertTriangle,
  ChevronRight,
  Activity,
  Settings,
  ShieldCheck,
  Bell
} from "lucide-react";

export default function PastorPage() {
  const [celulas, setCelulas] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    carregarDadosGerais();
  }, []);

  const totalAtivas = celulas.filter((c) => c.ativa === true).length;

  // Função para formatar o título baseado na rota
  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    if (!path || path === "pastor") return "Dashboard Geral";
    return path.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
      <div className="flex h-screen bg-[#f8fafc] dark:bg-[#020617] overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">

        {/* SIDEBAR PREMIUM */}
        <aside className="w-72 bg-slate-900 dark:bg-slate-950 text-white flex flex-col shadow-2xl z-50">

          {/* LOGO AREA */}
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-none text-white">IGREJA</h2>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Gestão Pastoral</p>
            </div>
          </div>

          {/* INDICADOR DE STATUS (ESTILIZADO) */}
          <div className="mx-6 mb-8 p-4 bg-slate-800/40 rounded-[1.5rem] border border-slate-700/50 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Rede de Células</span>
              <Activity size={14} className="text-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">
              {loading ? "..." : totalAtivas}
            </span>
              <span className="text-xs font-bold text-slate-500">Ativas</span>
            </div>
            <div className="w-full bg-slate-700 h-1 rounded-full mt-3 overflow-hidden">
              <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: loading ? "0%" : "100%" }}
                  className="bg-indigo-500 h-full"
              />
            </div>
          </div>

          {/* NAVEGAÇÃO PRINCIPAL */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Menu Principal</p>

            <NavItem to="/pastor" icon={LayoutDashboard} label="Dashboard" end />
            <NavItem to="/pastor/relatorio-celulas" icon={FileText} label="Relatórios" />
            <NavItem to="/pastor/discipulado" icon={Users} label="Secretaria" />
            <NavItem to="/pastor/multiplicacoes" icon={Share2} label="Multiplicações" />
            <NavItem to="/pastor/ranking-celulas" icon={Trophy} label="Ranking" />

            <div className="pt-4 mt-4 border-t border-slate-800">
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Urgente</p>
              <NavItem to="/pastor/alertas" icon={AlertTriangle} label="Painel de Alertas" variant="danger" />
            </div>
          </nav>

          {/* FOOTER SIDEBAR */}
          <div className="p-6 bg-slate-950/50 mt-auto">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold border border-indigo-500/30">V1</div>
              <div className="text-[10px] text-slate-500 font-medium italic">Sistema de Gestão v1.0</div>
            </div>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

          {/* TOP BAR PREMIUM */}
          <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 flex justify-between items-center z-40">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black text-slate-800 dark:text-white">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end mr-2 text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total Registrado</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{celulas.length} Células</span>
              </div>
              <button className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors border border-slate-200 dark:border-slate-700">
                <Bell size={18} />
              </button>
              <button className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors border border-slate-200 dark:border-slate-700">
                <Settings size={18} />
              </button>
            </div>
          </header>

          {/* ÁREA DE RENDERIZAÇÃO */}
          <section className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc] dark:bg-[#020617]">
            <AnimatePresence mode="wait">
              <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="h-full"
              >
                <Routes>
                  <Route index element={<PainelPastor />} />
                  <Route path="relatorio-celulas" element={<RelatorioCelula />} />
                  <Route path="discipulado" element={<SecretariaDiscipulado />} />
                  <Route path="multiplicacoes" element={<SolicitacoesMultiplicacao />} />
                  <Route path="ranking-celulas" element={<RankingCelulas />} />
                  <Route path="alertas" element={<PainelAlertas />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </section>
        </main>
      </div>
  );
}

/**
 * COMPONENTE DE ITEM DE NAVEGAÇÃO
 */
function NavItem({ to, icon: Icon, label, end = false, variant = "default" }) {
  const isDanger = variant === "danger";

  return (
      <NavLink
          to={to}
          end={end}
          className={({ isActive }) => `
        group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm
        ${isActive
              ? (isDanger ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20")
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          }
      `}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className="transition-transform group-hover:scale-110" />
          <span>{label}</span>
        </div>
        <ChevronRight size={14} className={`transition-opacity duration-300 ${isDanger ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />
      </NavLink>
  );
}
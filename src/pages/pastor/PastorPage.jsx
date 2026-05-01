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
  Bell,
  Menu,
  X
} from "lucide-react";

export default function PastorPage() {
  const [celulas, setCelulas] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    carregarDadosGerais();
  }, []);

  // Fecha a sidebar automaticamente ao mudar de rota no mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const totalAtivas = celulas.filter((c) => c.ativa === true).length;

  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    if (!path || path === "pastor") return "Dashboard Geral";
    return path.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
      <div className="flex h-screen bg-[#f8fafc] dark:bg-[#020617] overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">

        {/* OVERLAY MOBILE */}
        <AnimatePresence>
          {isSidebarOpen && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
              />
          )}
        </AnimatePresence>

        {/* SIDEBAR */}
        <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-slate-900 dark:bg-slate-950 text-white flex flex-col shadow-2xl transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
          {/* LOGO AREA */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black leading-none uppercase">Igreja</h2>
                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Gestão Pastoral</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400">
              <X size={24} />
            </button>
          </div>

          {/* INDICADOR DE STATUS */}
          <div className="mx-6 mb-6 p-4 bg-slate-800/40 rounded-3xl border border-slate-700/50">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Status da Rede</span>
              <Activity size={14} className="text-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{loading ? "..." : totalAtivas}</span>
              <span className="text-xs font-bold text-slate-500">Ativas</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: loading ? "0%" : "100%" }}
                  className="bg-indigo-500 h-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
              />
            </div>
          </div>

          {/* NAVEGAÇÃO PRINCIPAL */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Menu Principal</p>
            <NavItem to="/pastor" icon={LayoutDashboard} label="Dashboard" end />
            <NavItem to="/pastor/relatorio-celulas" icon={FileText} label="Relatórios" />
            <NavItem to="/pastor/discipulado" icon={Users} label="Secretaria" />
            <NavItem to="/pastor/multiplicacoes" icon={Share2} label="Multiplicações" />
            <NavItem to="/pastor/ranking-celulas" icon={Trophy} label="Ranking" />

            <div className="pt-4 mt-4 border-t border-slate-800">
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Emergencial</p>
              <NavItem to="/pastor/alertas" icon={AlertTriangle} label="Painel de Alertas" variant="danger" />
            </div>
          </nav>

          {/* FOOTER SIDEBAR */}
          <div className="p-4 bg-slate-950/50">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold">V1</div>
              <div className="text-[10px] text-slate-500 font-medium italic leading-tight">Sistema de Inteligência Pastoral</div>
            </div>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

          {/* HEADER */}
          <header className="h-20 lg:h-24 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex justify-between items-center z-40">
            <div className="flex items-center gap-4">
              <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-lg lg:text-xl font-black text-slate-800 dark:text-white truncate max-w-[200px] md:max-w-none">
                  {getPageTitle()}
                </h1>
                <span className="lg:hidden text-[10px] font-bold text-indigo-500 uppercase tracking-tight">Rede Pastoral</span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">Células Totais</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{celulas.length}</span>
              </div>
              <button className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 transition-all border border-slate-200 dark:border-slate-700">
                <Bell size={18} />
              </button>
              <button className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 transition-all border border-slate-200 dark:border-slate-700">
                <Settings size={18} />
              </button>
            </div>
          </header>

          {/* ÁREA DE CONTEÚDO */}
          <section className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.02, y: -10 }}
                  transition={{ duration: 0.25, ease: "circOut" }}
                  className="min-h-full"
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

        {/* ESTILOS CSS EXTRA PARA SCROLLBAR */}
        <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #e2e8f0; 
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}} />
      </div>
  );
}

function NavItem({ to, icon: Icon, label, end = false, variant = "default" }) {
  const isDanger = variant === "danger";

  return (
      <NavLink
          to={to}
          end={end}
          className={({ isActive }) => `
        group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 font-bold text-sm
        ${isActive
              ? (isDanger ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30")
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
          }
      `}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className={`transition-transform duration-500 ${isDanger ? 'animate-pulse' : 'group-hover:scale-110'}`} />
          <span>{label}</span>
        </div>
        <ChevronRight size={16} className={`transition-all duration-300 ${isDanger ? 'opacity-100' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
      </NavLink>
  );
}
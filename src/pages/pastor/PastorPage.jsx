import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";

import PainelPastor from "./PainelPastor";
import RelatorioCelula from "./RelatorioCelula";
import SolicitacoesMultiplicacao from "./SolicitacoesMultiplicacao";
import RankingCelulas from "./RankingCelulas";
import PainelAlertas from "./PainelAlertas";

import {
  LayoutDashboard, FileText, Users, Share2, Trophy,
  AlertTriangle, ChevronRight, Activity, Settings,
  ShieldCheck, Bell, Menu, X, LogOut, Sun, Moon,
} from "lucide-react";
import Discipulado from "./Discipulado.jsx";

/* ═══════════════════════════════════════════════
   🎨 Cores Oficiais Igreja do Evangelho Quadrangular
═══════════════════════════════════════════════ */
const IEQ = {
  red:        "#C8102E",
  redDark:    "#8B0B1F",
  redLight:   "#E8294A",
  yellow:     "#FDB813",
  yellowDark: "#C48C00",
  blue:       "#003DA5",
  blueDark:   "#002470",
  blueLight:  "#1A56C4",
  white:      "#FFFFFF",
  offWhite:   "#F5F0E8",
  dark:       "#0A0608",
  darkCard:   "#110A0D",
};

const NAV_ITEMS = [
  { to: "/pastor",                   icon: LayoutDashboard, label: "Dashboard",     badge: null, end: true },
  { to: "/pastor/relatorio-celulas", icon: FileText,        label: "Relatórios",    badge: null },
  { to: "/pastor/discipulado",       icon: Users,           label: "Secretaria",    badge: null },
  { to: "/pastor/multiplicacoes",    icon: Share2,          label: "Multiplicações",badge: null },
  { to: "/pastor/ranking-celulas",   icon: Trophy,          label: "Ranking",       badge: null },
];

const PAGE_TITLES = {
  "pastor":            "Dashboard Geral",
  "relatorio-celulas": "Relatórios de Células",
  "discipulado":       "Secretaria de Discipulado",   // ✅ CORRIGIDO: removido ".jsx"
  "multiplicacoes":    "Solicitações de Multiplicação",
  "ranking-celulas":   "Ranking de Células",
  "alertas":           "Painel de Alertas",
};

/* ╔══════════════════════════════╗
   ║   ✝ Cruz Quadrangular SVG    ║
   ╚══════════════════════════════╝ */
function QuadrangularCross({ size = 32 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="pgV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={IEQ.redLight} />
            <stop offset="100%" stopColor={IEQ.redDark}  />
          </linearGradient>
          <linearGradient id="pgH" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={IEQ.blueDark}  />
            <stop offset="50%"  stopColor={IEQ.blueLight} />
            <stop offset="100%" stopColor={IEQ.blueDark}  />
          </linearGradient>
          <filter id="pglow">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#pgV)" filter="url(#pglow)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#pgH)" filter="url(#pglow)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#pglow)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

/* ╔══════════════════════════════╗
   ║        COMPONENTE PRINCIPAL  ║
   ╚══════════════════════════════╝ */
export default function PastorPage() {
  const [celulas,       setCelulas]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [isDark,        setIsDark]        = useState(() => localStorage.getItem("theme") === "dark");
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Fecha sidebar ao trocar de rota no mobile
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token")?.replace(/"/g, "");
      try {
        const res = await api.get("/celulas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCelulas(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar células:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalAtivas = celulas.filter((c) => c.ativa === true).length;
  const porcentagem = celulas.length > 0 ? Math.round((totalAtivas / celulas.length) * 100) : 0;

  const getPageTitle = () => {
    const seg = location.pathname.split("/").pop();
    return PAGE_TITLES[seg] || PAGE_TITLES["pastor"];
  };

  const bg          = isDark ? IEQ.dark    : "#F0EAE8";
  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const sidebarBg   = isDark ? "#110A0D" : "#1A0608";

  /* ─── CSS Global ─── */
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes stripe {
      0%   { background-position: 0 0; }
      100% { background-position: 60px 60px; }
    }
    @keyframes pulse-ring {
      0%,100% { transform: scale(1);    opacity: .4; }
      50%      { transform: scale(1.12); opacity: .1; }
    }
    @keyframes spin  { to { transform: rotate(360deg); } }
    @keyframes glow-in {
      from { opacity:0; transform: translateX(-16px); }
      to   { opacity:1; transform: translateX(0);     }
    }

    /* Fundo animado IEQ */
    .ieq-bg {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background: repeating-linear-gradient(
        -55deg,
        ${isDark ? "rgba(200,16,46,.04)" : "rgba(200,16,46,.06)"} 0 10px,
        transparent 10px 20px,
        ${isDark ? "rgba(253,184,19,.03)" : "rgba(253,184,19,.05)"} 20px 30px,
        transparent 30px 40px
      );
      background-size: 60px 60px;
      animation: stripe 8s linear infinite;
    }

    /* Título gradiente IEQ */
    .ieq-title {
      font-family: 'Cinzel', serif;
      background: linear-gradient(90deg, ${IEQ.redDark}, ${IEQ.red}, ${IEQ.yellow}, ${IEQ.blue});
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Card padrão */
    .ieq-card {
      background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius: 14px;
      backdrop-filter: blur(24px);
    }

    /* Botões */
    .ieq-btn-primary {
      background: linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.red});
      color: #fff; border: none; border-radius: 8px;
      font-family: 'Cinzel', serif; font-size: 11px; font-weight: 700;
      letter-spacing: .18em; cursor: pointer; transition: all .25s;
      padding: 11px 20px; display: inline-flex; align-items: center; gap: 7px;
    }
    .ieq-btn-primary:hover { transform: translateY(-2px); filter: brightness(1.12); }

    .ieq-btn-ghost {
      background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};
      color: ${isDark ? IEQ.offWhite : IEQ.redDark};
      border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      border-radius: 8px; font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700;
      letter-spacing: .15em; cursor: pointer; transition: all .25s;
      padding: 10px 18px; display: inline-flex; align-items: center; gap: 7px;
    }
    .ieq-btn-ghost:hover { border-color: ${IEQ.red}; background: rgba(200,16,46,.1); }

    /* Badge */
    .ieq-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 14px; border-radius: 99px;
      font-family: 'Cinzel', serif; font-size: 9px; font-weight: 700;
      letter-spacing: .18em; border: 1px solid;
    }

    /* Divisor */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent,
        ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}, transparent);
      margin: 8px 0;
    }

    /* Progress track */
    .ieq-progress-track {
      height: 6px; border-radius: 99px; overflow: hidden;
      background: rgba(255,255,255,.12);
    }

    /* Pulse ring */
    .pulse-ring {
      position: absolute; border-radius: 50%;
      border: 1px solid rgba(200,16,46,.35);
      animation: pulse-ring 3s ease-in-out infinite;
    }

    /* ── SIDEBAR ── */
    .pastor-sidebar {
      position: fixed; inset-y: 0; left: 0; z-index: 50;
      width: 260px;
      background: ${sidebarBg};
      display: flex; flex-direction: column;
      transition: transform .3s ease;
      box-shadow: 4px 0 32px rgba(0,0,0,.45);
    }
    .pastor-sidebar.closed { transform: translateX(-100%); }
    .pastor-sidebar.open   { transform: translateX(0);     }
    @media (min-width: 1024px) {
      .pastor-sidebar { position: relative; transform: translateX(0) !important; }
    }

    /* Nav link */
    .ieq-nav-link {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 14px; border-radius: 10px; gap: 12px;
      font-family: 'Cinzel', serif; font-size: 10.5px; font-weight: 700;
      letter-spacing: .14em; cursor: pointer; transition: all .2s;
      color: rgba(245,240,232,.45);
      text-decoration: none; border: 1px solid transparent;
    }
    .ieq-nav-link:hover {
      color: ${IEQ.offWhite};
      background: rgba(200,16,46,.08);
      border-color: rgba(200,16,46,.12);
    }
    .ieq-nav-link.active {
      color: ${IEQ.offWhite};
      background: linear-gradient(135deg, rgba(200,16,46,.18), rgba(139,11,31,.25));
      border-color: rgba(200,16,46,.3);
    }
    .ieq-nav-link.active-alert {
      color: ${IEQ.redLight};
      background: rgba(200,16,46,.1);
      border-color: rgba(200,16,46,.25);
    }

    /* Layout principal */
    .pastor-layout {
      display: flex; height: 100vh; overflow: hidden;
      background: ${bg};
      color: ${textPrimary};
      font-family: 'EB Garamond', serif;
      position: relative;
    }

    /* Main content */
    .pastor-main {
      flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden;
    }

    /* Header */
    .pastor-header {
      height: 62px; flex-shrink: 0;
      background: ${isDark ? "rgba(17,10,13,.95)" : "rgba(255,255,255,.92)"};
      border-bottom: 1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"};
      backdrop-filter: blur(20px);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; gap: 16px;
      position: relative; z-index: 10;
    }

    /* Content area */
    .pastor-content {
      flex: 1; overflow-y: auto;
      padding: 28px 24px;
      background: ${bg};
      position: relative; z-index: 1;
    }
    @media (min-width: 768px) {
      .pastor-content { padding: 36px 40px; }
    }

    /* Overlay mobile */
    .sidebar-overlay {
      position: fixed; inset: 0; background: rgba(10,6,8,.82);
      backdrop-filter: blur(10px); z-index: 40;
    }

    /* Icon button */
    .ieq-icon-btn {
      width: 36px; height: 36px; border-radius: 8px; border: none;
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all .2s;
      background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};
      color: ${isDark ? "rgba(245,240,232,.5)" : "rgba(26,10,13,.5)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
    }
    .ieq-icon-btn:hover {
      color: ${IEQ.red}; background: rgba(200,16,46,.1);
      border-color: rgba(200,16,46,.3);
    }

    /* Stat mini */
    .ieq-stat-mini {
      display: flex; flex-direction: column; align-items: flex-end;
    }
  `;

  /* ─── Loading ─── */
  if (loading) return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background: isDark ? IEQ.dark : "#F0EAE8" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');`}</style>
        <div style={{ textAlign:"center" }}>
          <QuadrangularCross size={48} />
          <p style={{ fontFamily:"'Cinzel',serif", color: isDark ? IEQ.offWhite : IEQ.redDark, marginTop:16, letterSpacing:".2em", fontSize:11 }}>CARREGANDO...</p>
        </div>
      </div>
  );

  return (
      <div className="pastor-layout">
        <style>{globalStyles}</style>
        <div className="ieq-bg" />

        {/* ── OVERLAY MOBILE ── */}
        <AnimatePresence>
          {sidebarOpen && (
              <motion.div
                  key="overlay"
                  className="sidebar-overlay"
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  onClick={() => setSidebarOpen(false)}
              />
          )}
        </AnimatePresence>

        {/* ════════════════════════════════
          SIDEBAR
      ════════════════════════════════ */}
        <aside className={`pastor-sidebar ${sidebarOpen ? "open" : "closed"}`}>

          {/* Logo */}
          <div style={{ padding:"28px 20px 22px", borderBottom:`1px solid rgba(200,16,46,.12)` }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                  <div className="pulse-ring" style={{ width:52, height:52 }} />
                  <div style={{ width:38, height:38, borderRadius:"50%", background:"rgba(200,16,46,.08)", border:`1px solid rgba(200,16,46,.25)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <QuadrangularCross size={24} />
                  </div>
                </div>
                <div>
                  <h2 className="ieq-title" style={{ fontSize:15, fontWeight:700, letterSpacing:".18em" }}>IEQ PITUAÇU</h2>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".2em", color:"rgba(245,240,232,.35)", marginTop:2 }}>GESTÃO PASTORAL</p>
                </div>
              </div>
              {/* Fechar no mobile */}
              <button
                  onClick={() => setSidebarOpen(false)}
                  className="ieq-icon-btn"
                  style={{ display:"flex" }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Indicador rede de células */}
          <div style={{ margin:"16px 16px 8px", padding:"18px 16px", background:"rgba(200,16,46,.06)", border:`1px solid rgba(200,16,46,.12)`, borderRadius:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:"rgba(245,240,232,.4)" }}>REDE DE CÉLULAS</span>
              <Activity size={12} style={{ color:IEQ.yellow, animation:"pulse-ring 2s infinite" }} />
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:12 }}>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:28, fontWeight:700, color:IEQ.offWhite, lineHeight:1 }}>{totalAtivas}</span>
              <span style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:"rgba(245,240,232,.4)" }}>/ {celulas.length} ativas</span>
            </div>
            <div className="ieq-progress-track">
              <motion.div
                  initial={{ width:0 }}
                  animate={{ width:`${porcentagem}%` }}
                  transition={{ duration:1.2, ease:"easeOut" }}
                  style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${IEQ.red},${IEQ.yellow})` }}
              />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:7 }}>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".12em", color:"rgba(245,240,232,.3)" }}>PROGRESSO</span>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".12em", color:IEQ.yellow }}>{porcentagem}%</span>
            </div>
          </div>

          {/* Navegação principal */}
          <nav style={{ flex:1, overflowY:"auto", padding:"8px 12px" }}>
            <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".2em", color:"rgba(245,240,232,.25)", padding:"10px 4px 8px" }}>MENU PRINCIPAL</p>

            {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) => `ieq-nav-link${isActive ? " active" : ""}`}
                    style={{ marginBottom:4 }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                    <Icon size={16} />
                    <span>{label}</span>
                  </div>
                  <ChevronRight size={12} style={{ opacity:.35 }} />
                </NavLink>
            ))}

            <div className="divider" style={{ margin:"14px 0 10px" }} />
            <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".2em", color:"rgba(200,16,46,.5)", padding:"0 4px 8px" }}>URGENTE</p>

            <NavLink
                to="/pastor/alertas"
                className={({ isActive }) => `ieq-nav-link${isActive ? " active" : " active-alert"}`}
            >
              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                <AlertTriangle size={16} style={{ animation:"pulse-ring 2s infinite" }} />
                <span>Painel de Alertas</span>
              </div>
              <ChevronRight size={12} style={{ opacity:.6 }} />
            </NavLink>
          </nav>

          {/* Rodapé sidebar */}
          <div style={{ padding:"14px 16px", borderTop:`1px solid rgba(200,16,46,.1)` }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"rgba(200,16,46,.06)", border:`1px solid rgba(200,16,46,.1)`, borderRadius:10 }}>
              <div style={{ width:34, height:34, borderRadius:8, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:12, flexShrink:0 }}>PS</div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".12em", color:IEQ.offWhite, margin:0 }}>PASTOR</p>
                <p style={{ fontFamily:"'EB Garamond',serif", fontSize:12, color:"rgba(245,240,232,.4)", margin:0 }}>Administrador</p>
              </div>
              <button
                  onClick={() => { localStorage.clear(); window.location.href = "/"; }}
                  className="ieq-icon-btn"
                  title="Sair"
                  style={{ flexShrink:0 }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* ════════════════════════════════
          CONTEÚDO PRINCIPAL
      ════════════════════════════════ */}
        <main className="pastor-main">

          {/* HEADER */}
          <header className="pastor-header">
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              {/* Hambúrguer mobile */}
              <button
                  className="ieq-icon-btn"
                  onClick={() => setSidebarOpen(true)}
                  style={{ display:"flex" }}
              >
                <Menu size={17} />
              </button>

              {/* Breadcrumb / título da página */}
              <div>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:"rgba(200,16,46,.6)", margin:0 }}>
                  IEQ PITUAÇU
                </p>
                <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, letterSpacing:".14em", color:textPrimary, margin:0, lineHeight:1.2 }}>
                  {getPageTitle()}
                </h1>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {/* Stats resumo */}
              <div className="ieq-stat-mini" style={{ marginRight:6, display:"flex" }}>
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".15em", color:"rgba(200,16,46,.55)" }}>TOTAL</span>
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:700, color:textPrimary, lineHeight:1 }}>
                {celulas.length} <span style={{ fontSize:9, color:"rgba(26,10,13,.4)", fontWeight:400 }}>CÉL.</span>
              </span>
              </div>

              {/* Dark mode */}
              <button className="ieq-icon-btn" onClick={() => setIsDark(!isDark)}>
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              {/* Bell */}
              <button className="ieq-icon-btn">
                <Bell size={15} />
              </button>

              {/* Settings */}
              <button className="ieq-icon-btn">
                <Settings size={15} />
              </button>
            </div>
          </header>

          {/* ÁREA DE RENDERIZAÇÃO */}
          <section className="pastor-content">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                  key={location.pathname}
                  initial={{ opacity:0, y:8 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, y:-8 }}
                  transition={{ duration:.2, ease:"easeOut" }}
                  style={{ height:"100%" }}
              >
                <Routes location={location}>
                  <Route index                    element={<PainelPastor />} />
                  <Route path="relatorio-celulas" element={<RelatorioCelula />} />
                  {/* ✅ CORRIGIDO: path em minúsculo, rota duplicada removida */}
                  <Route path="discipulado"       element={<Discipulado />} />
                  <Route path="multiplicacoes"    element={<SolicitacoesMultiplicacao />} />
                  <Route path="ranking-celulas"   element={<RankingCelulas />} />
                  <Route path="alertas"           element={<PainelAlertas />} />
                </Routes>
              </motion.div>
            </AnimatePresence>

            {/* Rodapé */}
            <div className="divider" style={{ marginTop:40 }} />
            <p style={{ textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSec, padding:"8px 0 4px" }}>
              © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
            </p>
          </section>
        </main>
      </div>
  );
}
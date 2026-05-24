import React, { useEffect, useState, useMemo } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";

import PainelPastor               from "./PainelPastor";
import RelatorioCelula            from "./RelatorioCelula";
import SolicitacoesMultiplicacao  from "./SolicitacoesMultiplicacao";
import RankingCelulas             from "./RankingCelulas";
import PainelAlertas              from "./PainelAlertas";
import Discipulado                from "./Discipulado.jsx";
import TelaPendencias             from "./TelaPendencias.jsx";
import RelatorioCasasDePaz        from "./RelatorioCasasDePaz.jsx";
import RelatorioMissao70Pastor    from "./RelatorioMissao70Pastor.jsx";

import {
  LayoutDashboard, FileText, Users, Share2, Trophy,
  AlertTriangle, ChevronRight, Activity, Settings,
  Bell, Menu, X, LogOut, Sun, Moon, ClipboardList, Home, Flame,
} from "lucide-react";

/* ─── Paleta IEQ ─────────────────────────────────────────────────────────── */
const IEQ = {
  red:        "#C8102E",
  redDark:    "#8B0B1F",
  redLight:   "#E8294A",
  yellow:     "#FDB813",
  yellowDark: "#C48C00",
  blue:       "#003DA5",
  blueDark:   "#002470",
  blueLight:  "#1A56C4",
  offWhite:   "#F5F0E8",
  dark:       "#0A0608",
  darkCard:   "#110A0D",
};

const NAV_ITEMS = [
  { to: "/pastor",                   icon: LayoutDashboard, label: "Dashboard",      color: IEQ.blueLight, end: true },
  { to: "/pastor/relatorio-celulas", icon: FileText,        label: "Relatórios",     color: IEQ.red                 },
  { to: "/pastor/discipulado",       icon: Users,           label: "Secretaria",     color: "#8B5CF6"               },
  { to: "/pastor/multiplicacoes",    icon: Share2,          label: "Multiplicações", color: "#059669"               },
  { to: "/pastor/ranking-celulas",   icon: Trophy,          label: "Ranking",        color: IEQ.yellow              },
  { to: "/pastor/casas-de-paz",      icon: Home,            label: "Casas de Paz",   color: "#5DCAA5"               },
  { to: "/pastor/missao70",          icon: Flame,           label: "Missão 70",      color: IEQ.yellow              },
  { to: "/pastor/pendencias",        icon: ClipboardList,   label: "Pendências",     color: "#F97316"               },
];

const PAGE_TITLES = {
  "pastor":            "Dashboard Geral",
  "relatorio-celulas": "Relatórios de Células",
  "discipulado":       "Secretaria de Discipulado",
  "multiplicacoes":    "Solicitações de Multiplicação",
  "ranking-celulas":   "Ranking de Células",
  "alertas":           "Painel de Alertas",
  "pendencias":        "Pendências da Semana",
  "casas-de-paz":      "Relatórios · Casas de Paz",
  "missao70":          "Missão 70 · Evangelismo",
};

/* ─── CSS estático ───────────────────────────────────────────────────────── */
const STATIC_CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes stripe     { 0%{background-position:0 0} 100%{background-position:60px 60px} }
  @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.12);opacity:.1} }
  @keyframes spin       { to{transform:rotate(360deg)} }

  .pastor-root {
    --bg:          #F0EAE8;
    --text:        #1A0A0D;
    --text-sec:    rgba(26,10,13,.45);
    --card-bg:     rgba(255,255,255,.92);
    --card-bdr:    rgba(200,16,46,.12);
    --header-bg:   rgba(255,255,255,.92);
    --header-bdr:  rgba(200,16,46,.1);
    --sidebar-bg:  #1A0608;
    --icon-bg:     rgba(200,16,46,.06);
    --icon-color:  #8B0B1F;
    --icon-bdr:    rgba(200,16,46,.18);
    --stripe-a:    rgba(200,16,46,.06);
    --stripe-b:    rgba(253,184,19,.05);
    --divider-c:   rgba(200,16,46,.2);
  }
  .pastor-root.dark {
    --bg:          #0A0608;
    --text:        #F5F0E8;
    --text-sec:    rgba(245,240,232,.45);
    --card-bg:     rgba(17,10,13,.97);
    --card-bdr:    rgba(200,16,46,.15);
    --header-bg:   rgba(17,10,13,.95);
    --header-bdr:  rgba(200,16,46,.12);
    --sidebar-bg:  #110A0D;
    --icon-bg:     rgba(255,255,255,.04);
    --icon-color:  #F5F0E8;
    --icon-bdr:    rgba(200,16,46,.2);
    --stripe-a:    rgba(200,16,46,.04);
    --stripe-b:    rgba(253,184,19,.03);
    --divider-c:   rgba(200,16,46,.25);
  }

  .pastor-layout {
    display:flex; height:100vh; overflow:hidden;
    background:var(--bg); color:var(--text);
    font-family:'EB Garamond',serif; position:relative;
    transition:background .35s, color .35s;
  }

  .ieq-bg {
    position:fixed; inset:0; pointer-events:none; z-index:0;
    background:repeating-linear-gradient(
      -55deg,
      var(--stripe-a) 0 10px, transparent 10px 20px,
      var(--stripe-b) 20px 30px, transparent 30px 40px
    );
    background-size:60px 60px;
    animation:stripe 8s linear infinite;
    transition:background .35s;
  }

  .ieq-title {
    font-family:'Cinzel',serif;
    background:linear-gradient(90deg,#8B0B1F,#C8102E,#FDB813,#003DA5);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  .ieq-card {
    background:var(--card-bg);
    border:1px solid var(--card-bdr);
    border-radius:14px; backdrop-filter:blur(24px);
    transition:background .35s, border-color .35s;
  }

  .divider {
    height:1px;
    background:linear-gradient(90deg,transparent,var(--divider-c),transparent);
    margin:8px 0; transition:background .35s;
  }

  .ieq-progress-track {
    height:6px; border-radius:99px; overflow:hidden;
    background:rgba(255,255,255,.12);
  }

  .pulse-ring {
    position:absolute; border-radius:50%;
    border:1px solid rgba(200,16,46,.35);
    animation:pulse-ring 3s ease-in-out infinite;
  }

  /* SIDEBAR */
  .pastor-sidebar {
    position:fixed; inset-y:0; left:0; z-index:50; width:260px;
    background:var(--sidebar-bg);
    display:flex; flex-direction:column;
    transition:transform .3s ease, background .35s;
    box-shadow:4px 0 32px rgba(0,0,0,.45);
  }
  .pastor-sidebar.closed { transform:translateX(-100%); }
  .pastor-sidebar.open   { transform:translateX(0);     }
  @media(min-width:1024px){
    .pastor-sidebar { position:relative; transform:translateX(0) !important; }
  }

  /* NAV LINKS */
  .ieq-nav-link {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 14px; border-radius:10px; gap:12px; margin-bottom:4px;
    font-family:'Cinzel',serif; font-size:10.5px; font-weight:700;
    letter-spacing:.14em; text-decoration:none;
    color:rgba(245,240,232,.38);
    border:1px solid transparent;
    transition:all .2s;
  }
  .ieq-nav-link:hover,
  .ieq-nav-link.active {
    color:rgba(245,240,232,.92);
    background:rgba(255,255,255,.07);
    border-color:rgba(255,255,255,.1);
  }
  .ieq-nav-link:hover .nav-icon,
  .ieq-nav-link.active .nav-icon { color:var(--nav-color) !important; }
  .ieq-nav-link:hover .nav-label,
  .ieq-nav-link.active .nav-label { color:var(--nav-color) !important; }

  .ieq-nav-alert {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 14px; border-radius:10px; gap:12px; margin-bottom:4px;
    font-family:'Cinzel',serif; font-size:10.5px; font-weight:700;
    letter-spacing:.14em; text-decoration:none;
    color:#E8294A;
    background:rgba(200,16,46,.1);
    border:1px solid rgba(200,16,46,.25);
    transition:all .2s;
  }
  .ieq-nav-alert:hover,
  .ieq-nav-alert.active {
    background:rgba(200,16,46,.2);
    border-color:rgba(200,16,46,.4);
  }

  /* MAIN / HEADER / CONTENT */
  .pastor-main { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }

  .pastor-header {
    height:62px; flex-shrink:0;
    background:var(--header-bg);
    border-bottom:1px solid var(--header-bdr);
    backdrop-filter:blur(20px);
    display:flex; align-items:center; justify-content:space-between;
    padding:0 24px; gap:16px; position:relative; z-index:10;
    transition:background .35s, border-color .35s;
  }

  .pastor-content {
    flex:1; overflow-y:auto; padding:28px 24px;
    background:var(--bg); position:relative; z-index:1;
    transition:background .35s;
  }
  @media(min-width:768px){ .pastor-content { padding:36px 40px; } }

  .sidebar-overlay {
    position:fixed; inset:0; background:rgba(10,6,8,.82);
    backdrop-filter:blur(10px); z-index:40;
  }

  /* ICON BTN */
  .ieq-icon-btn {
    width:36px; height:36px; border-radius:8px;
    display:inline-flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all .2s;
    background:var(--icon-bg); color:var(--icon-color);
    border:1px solid var(--icon-bdr);
  }
  .ieq-icon-btn:hover {
    color:#C8102E; background:rgba(200,16,46,.1);
    border-color:rgba(200,16,46,.3);
  }

  .ieq-stat-mini { display:flex; flex-direction:column; align-items:flex-end; }

  /* Avatar do logo (topo sidebar) */
  .pastor-logo-avatar {
    width:38px; height:38px; border-radius:50%; overflow:hidden;
    border:2px solid rgba(200,16,46,.4);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .pastor-logo-avatar img {
    width:100%; height:100%; object-fit:cover; border-radius:50%;
  }
  .pastor-logo-avatar-fallback {
    width:100%; height:100%;
    display:flex; align-items:center; justify-content:center;
    background:rgba(200,16,46,.08);
    font-family:'Cinzel',serif; font-weight:700; font-size:14px; color:#F5F0E8;
  }
`;

export default function PastorPage() {
  const [celulas,       setCelulas]       = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [isDark,        setIsDark]        = useState(() => localStorage.getItem("theme") === "dark");
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token")?.replace(/"/g, "");
      try {
        const [resCelulas, resUsuario] = await Promise.all([
          api.get("/celulas", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/usuarios/me"),
        ]);
        setCelulas(resCelulas.data || []);
        setUsuarioLogado(resUsuario.data);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { totalAtivas, porcentagem } = useMemo(() => {
    const totalAtivas = celulas.filter(c => c.ativa === true).length;
    const porcentagem = celulas.length > 0 ? Math.round((totalAtivas / celulas.length) * 100) : 0;
    return { totalAtivas, porcentagem };
  }, [celulas]);

  const getPageTitle = () => {
    const seg = location.pathname.split("/").pop();
    return PAGE_TITLES[seg] || PAGE_TITLES["pastor"];
  };

  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  if (loading) return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background: isDark ? IEQ.dark : "#F0EAE8" }}>
        <style>{STATIC_CSS}</style>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:64, height:64, borderRadius:"50%", margin:"0 auto 16px", overflow:"hidden", border:"2px solid rgba(200,16,46,.4)", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(200,16,46,.08)" }}>
            {usuarioLogado?.fotoPerfil
                ? <img src={usuarioLogado.fotoPerfil} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : <span style={{ fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:22, color:IEQ.offWhite }}>
                  {usuarioLogado?.nome?.charAt(0).toUpperCase() || "P"}
                </span>
            }
          </div>
          <p style={{ fontFamily:"'Cinzel',serif", color: isDark ? IEQ.offWhite : IEQ.redDark, letterSpacing:".2em", fontSize:11 }}>CARREGANDO...</p>
        </div>
      </div>
  );

  return (
      <div className={`pastor-root pastor-layout${isDark ? " dark" : ""}`}>
        <style>{STATIC_CSS}</style>
        <div className="ieq-bg" />

        {/* Overlay mobile */}
        <AnimatePresence>
          {sidebarOpen && (
              <motion.div
                  key="overlay" className="sidebar-overlay"
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  onClick={() => setSidebarOpen(false)}
              />
          )}
        </AnimatePresence>

        {/* ─── SIDEBAR ─────────────────────────────────────────────────────────── */}
        <aside className={`pastor-sidebar ${sidebarOpen ? "open" : "closed"}`}>

          {/* ─── Logo com foto do pastor no lugar da cruz ─────────────────────── */}
          <div style={{ padding:"28px 20px 22px", borderBottom:"1px solid rgba(200,16,46,.12)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>

                {/* Círculo com foto */}
                <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                  <div className="pulse-ring" style={{ width:52, height:52 }} />
                  <div className="pastor-logo-avatar">
                    {usuarioLogado?.fotoPerfil ? (
                        <img src={usuarioLogado.fotoPerfil} alt={usuarioLogado.nome || "Pastor"} />
                    ) : (
                        <div className="pastor-logo-avatar-fallback">
                          {usuarioLogado?.nome?.charAt(0).toUpperCase() || "P"}
                        </div>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="ieq-title" style={{ fontSize:15, fontWeight:700, letterSpacing:".18em" }}>IEQ PITUAÇU</h2>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".2em", color:"rgba(245,240,232,.35)", marginTop:2 }}>GESTÃO PASTORAL</p>
                  {usuarioLogado?.nome && (
                      <p style={{ fontFamily:"'EB Garamond',serif", fontSize:12, color:"rgba(245,240,232,.45)", margin:"3px 0 0", fontStyle:"italic" }}>
                        {usuarioLogado.nome}
                      </p>
                  )}
                </div>
              </div>

              <button onClick={() => setSidebarOpen(false)} className="ieq-icon-btn">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Indicador rede */}
          <div style={{ margin:"16px 16px 8px", padding:"18px 16px", background:"rgba(200,16,46,.06)", border:"1px solid rgba(200,16,46,.12)", borderRadius:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:"rgba(245,240,232,.4)" }}>REDE DE CÉLULAS</span>
              <Activity size={12} style={{ color:IEQ.yellow }} />
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:12 }}>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:28, fontWeight:700, color:IEQ.offWhite, lineHeight:1 }}>{totalAtivas}</span>
              <span style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:"rgba(245,240,232,.4)" }}>/ {celulas.length} ativas</span>
            </div>
            <div className="ieq-progress-track">
              <motion.div
                  initial={{ width:0 }} animate={{ width:`${porcentagem}%` }}
                  transition={{ duration:1.2, ease:"easeOut" }}
                  style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${IEQ.red},${IEQ.yellow})` }}
              />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:7 }}>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".12em", color:"rgba(245,240,232,.3)" }}>PROGRESSO</span>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".12em", color:IEQ.yellow }}>{porcentagem}%</span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, overflowY:"auto", padding:"8px 12px" }}>
            <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".2em", color:"rgba(245,240,232,.25)", padding:"10px 4px 8px" }}>
              MENU PRINCIPAL
            </p>

            {NAV_ITEMS.map(({ to, icon: Icon, label, color, end }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) => `ieq-nav-link${isActive ? " active" : ""}`}
                    style={{ "--nav-color": color }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                    <Icon size={16} className="nav-icon" style={{ color, flexShrink:0, transition:"color .2s" }} />
                    <span className="nav-label" style={{ transition:"color .2s" }}>{label}</span>
                  </div>
                  <ChevronRight size={12} style={{ opacity:.3, flexShrink:0 }} />
                </NavLink>
            ))}

            <div className="divider" style={{ margin:"14px 0 10px" }} />
            <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".2em", color:"rgba(200,16,46,.5)", padding:"0 4px 8px" }}>URGENTE</p>

            <NavLink
                to="/pastor/alertas"
                className={({ isActive }) => `ieq-nav-alert${isActive ? " active" : ""}`}
            >
              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                <AlertTriangle size={16} />
                <span>Painel de Alertas</span>
              </div>
              <ChevronRight size={12} style={{ opacity:.6 }} />
            </NavLink>
          </nav>

          {/* ─── Rodapé — sem avatar, só texto + logout ──────────────────────── */}
          <div style={{ padding:"14px 16px", borderTop:"1px solid rgba(200,16,46,.1)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"rgba(200,16,46,.06)", border:"1px solid rgba(200,16,46,.1)", borderRadius:10 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".12em", color:IEQ.offWhite, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {usuarioLogado?.nome?.split(" ")[0].toUpperCase() || "PASTOR"}
                </p>
                <p style={{ fontFamily:"'EB Garamond',serif", fontSize:12, color:"rgba(245,240,232,.4)", margin:0 }}>
                  {usuarioLogado?.perfil?.replace("ROLE_", "") || "Administrador"}
                </p>
              </div>
              <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="ieq-icon-btn" title="Sair">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* ─── CONTEÚDO PRINCIPAL ──────────────────────────────────────────────── */}
        <main className="pastor-main">

          {/* Header */}
          <header className="pastor-header">
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <button className="ieq-icon-btn" onClick={() => setSidebarOpen(true)}>
                <Menu size={17} />
              </button>
              <div>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:"rgba(200,16,46,.6)", margin:0 }}>IEQ PITUAÇU</p>
                <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, letterSpacing:".14em", color:textPrimary, margin:0, lineHeight:1.2 }}>
                  {getPageTitle()}
                </h1>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div className="ieq-stat-mini" style={{ marginRight:6 }}>
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".15em", color:"rgba(200,16,46,.55)" }}>TOTAL</span>
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:700, color:textPrimary, lineHeight:1 }}>
                  {celulas.length}{" "}
                  <span style={{ fontSize:9, color:textSec, fontWeight:400 }}>CÉL.</span>
                </span>
              </div>

              <button className="ieq-icon-btn" onClick={() => setIsDark(d => !d)} title={isDark ? "Modo Claro" : "Modo Escuro"}
                      style={{ position:"relative", overflow:"hidden" }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                      key={isDark ? "sun" : "moon"}
                      initial={{ opacity:0, rotate:-90, scale:.5 }}
                      animate={{ opacity:1, rotate:0,   scale:1   }}
                      exit={{    opacity:0, rotate: 90, scale:.5  }}
                      transition={{ duration:.22 }}
                      style={{ display:"inline-flex", position:"absolute" }}
                  >
                    {isDark ? <Sun size={15} /> : <Moon size={15} />}
                  </motion.span>
                </AnimatePresence>
              </button>

              <button className="ieq-icon-btn"><Bell size={15} /></button>
              <button className="ieq-icon-btn"><Settings size={15} /></button>
            </div>
          </header>

          {/* Área de conteúdo */}
          <section className="pastor-content">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                  key={location.pathname}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                  transition={{ duration:.18, ease:"easeOut" }}
                  style={{ height:"100%" }}
              >
                <Routes location={location}>
                  <Route index                    element={<PainelPastor              isDark={isDark} />} />
                  <Route path="relatorio-celulas" element={<RelatorioCelula           isDark={isDark} />} />
                  <Route path="discipulado"       element={<Discipulado               isDark={isDark} />} />
                  <Route path="multiplicacoes"    element={<SolicitacoesMultiplicacao isDark={isDark} />} />
                  <Route path="ranking-celulas"   element={<RankingCelulas            isDark={isDark} />} />
                  <Route path="alertas"           element={<PainelAlertas             isDark={isDark} />} />
                  <Route path="pendencias"        element={<TelaPendencias            isDark={isDark} />} />
                  <Route path="casas-de-paz"      element={<RelatorioCasasDePaz       isDark={isDark} />} />
                  <Route path="missao70"          element={<RelatorioMissao70Pastor   isDark={isDark} />} />
                </Routes>
              </motion.div>
            </AnimatePresence>

            <div className="divider" style={{ marginTop:40 }} />
            <p style={{ textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSec, padding:"8px 0 4px" }}>
              © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
            </p>
          </section>
        </main>
      </div>
  );
}
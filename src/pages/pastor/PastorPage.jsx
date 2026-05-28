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
  AlertTriangle, Settings, Bell, LogOut, Sun, Moon,
  ClipboardList, Home, Flame,
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
};

const NAV_ITEMS = [
  { to: "/pastor",                   icon: LayoutDashboard, label: "Dashboard",    color: IEQ.blueLight, end: true },
  { to: "/pastor/relatorio-celulas", icon: FileText,        label: "Relatórios",   color: IEQ.red                 },
  { to: "/pastor/discipulado",       icon: Users,           label: "Secretaria",   color: "#8B5CF6"               },
  { to: "/pastor/multiplicacoes",    icon: Share2,          label: "Mult.",        color: "#059669"               },
  { to: "/pastor/ranking-celulas",   icon: Trophy,          label: "Ranking",      color: IEQ.yellow              },
  { to: "/pastor/casas-de-paz",      icon: Home,            label: "Casas de Paz", color: "#5DCAA5"               },
  { to: "/pastor/missao70",          icon: Flame,           label: "Missão 70",    color: IEQ.yellow              },
  { to: "/pastor/pendencias",        icon: ClipboardList,   label: "Pendências",   color: "#F97316"               },
  { to: "/pastor/alertas",           icon: AlertTriangle,   label: "Alertas",      color: IEQ.redLight, alert: true },
];

const PAGE_TITLES = {
  "pastor":            "Dashboard Geral",
  "relatorio-celulas": "Relatórios de Células",
  "discipulado":       "Secretaria de Discipulado",
  "multiplicacoes":    "Solicitações de Multiplicação",
  "ranking-celulas":   "Ranking de Células",
  "alertas":           "Painel de Alertas",
  "pendencias":        "Pendências da Semana",
  "casas-de-paz":      "Relatórios – Casas de Paz",
  "missao70":          "Missão 70 – Evangelismo",
};

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const STATIC_CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes stripe {
    0%   { background-position:0 0 }
    100% { background-position:60px 60px }
  }
  @keyframes pulse-ring {
    0%,100% { transform:scale(1);   opacity:.4  }
    50%      { transform:scale(1.15); opacity:.1 }
  }
  @keyframes spin { to { transform:rotate(360deg) } }

  /* ── Tokens ── */
  .pastor-root {
    --bg:         #F0EAE8;
    --text:       #1A0A0D;
    --text-sec:   rgba(26,10,13,.45);
    --card-bg:    rgba(255,255,255,.93);
    --card-bdr:   rgba(200,16,46,.13);
    --hdr-bg:     rgba(255,255,255,.94);
    --hdr-bdr:    rgba(200,16,46,.11);
    --nav-bg:     rgba(255,255,255,.97);
    --nav-bdr:    rgba(200,16,46,.13);
    --stripe-a:   rgba(200,16,46,.055);
    --stripe-b:   rgba(253,184,19,.045);
    --divider-c:  rgba(200,16,46,.2);
    --icon-bg:    rgba(200,16,46,.06);
    --icon-color: #8B0B1F;
    --icon-bdr:   rgba(200,16,46,.18);
  }
  .pastor-root.dark {
    --bg:         #0A0608;
    --text:       #F5F0E8;
    --text-sec:   rgba(245,240,232,.45);
    --card-bg:    rgba(17,10,13,.97);
    --card-bdr:   rgba(200,16,46,.16);
    --hdr-bg:     rgba(17,10,13,.96);
    --hdr-bdr:    rgba(200,16,46,.13);
    --nav-bg:     rgba(12,6,9,.98);
    --nav-bdr:    rgba(200,16,46,.18);
    --stripe-a:   rgba(200,16,46,.04);
    --stripe-b:   rgba(253,184,19,.03);
    --divider-c:  rgba(200,16,46,.25);
    --icon-bg:    rgba(255,255,255,.04);
    --icon-color: #F5F0E8;
    --icon-bdr:   rgba(200,16,46,.22);
  }

  /* ── Layout raiz ── */
  .pastor-root {
    display:flex; flex-direction:column;
    height:100dvh; /* suporte melhor a mobile */
    overflow:hidden;
    background:var(--bg); color:var(--text);
    font-family:'EB Garamond',serif;
    transition:background .35s, color .35s;
  }

  /* ── Fundo animado ── */
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

  /* ── Título gradiente ── */
  .ieq-title {
    font-family:'Cinzel',serif;
    background:linear-gradient(90deg,#8B0B1F,#C8102E,#FDB813,#003DA5);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  /* ── Divisor ── */
  .divider {
    height:1px;
    background:linear-gradient(90deg,transparent,var(--divider-c),transparent);
    margin:8px 0;
  }

  /* ── Anel pulsante ── */
  .pulse-ring {
    position:absolute; border-radius:50%;
    border:1px solid rgba(200,16,46,.35);
    animation:pulse-ring 3s ease-in-out infinite;
  }

  /* ════════════════════════════════
     HEADER
  ════════════════════════════════ */
  .pastor-header {
    flex-shrink:0; position:relative; z-index:20;
    background:var(--hdr-bg);
    border-bottom:1px solid var(--hdr-bdr);
    backdrop-filter:blur(20px);
    display:flex; align-items:center; justify-content:space-between;
    padding:0 12px; gap:8px;
    height:56px;
    transition:background .35s, border-color .35s;
  }
  @media(min-width:600px) {
    .pastor-header { height:62px; padding:0 20px; gap:12px; }
  }

  /* Lado esquerdo do header */
  .hdr-left  { display:flex; align-items:center; gap:10px; min-width:0; }
  .hdr-right { display:flex; align-items:center; gap:6px; flex-shrink:0; }

  /* Avatar */
  .pastor-avatar {
    width:32px; height:32px; border-radius:50%; overflow:hidden;
    border:2px solid rgba(200,16,46,.4); flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
  }
  @media(min-width:600px) { .pastor-avatar { width:36px; height:36px; } }
  .pastor-avatar img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
  .pastor-avatar-fb {
    width:100%; height:100%; display:flex; align-items:center; justify-content:center;
    background:rgba(200,16,46,.08);
    font-family:'Cinzel',serif; font-weight:700; font-size:13px; color:#F5F0E8;
  }

  /* Textos header */
  .hdr-church {
    font-family:'Cinzel',serif; font-size:11px; font-weight:700;
    letter-spacing:.18em; line-height:1.1; white-space:nowrap;
  }
  .hdr-page {
    font-family:'Cinzel',serif; font-size:9px; font-weight:700;
    letter-spacing:.12em; color:var(--text); line-height:1.3;
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:160px;
  }
  @media(min-width:480px) { .hdr-page { max-width:260px; font-size:10px; } }
  .hdr-user {
    font-family:'EB Garamond',serif; font-size:11px;
    color:var(--text-sec); font-style:italic; white-space:nowrap;
    overflow:hidden; text-overflow:ellipsis; max-width:140px;
  }
  @media(min-width:480px) { .hdr-user { max-width:220px; } }

  /* Mini stat badges */
  .hdr-stat {
    padding:4px 8px; border-radius:7px; text-align:center;
    background:var(--icon-bg);
    border:1px solid var(--icon-bdr);
  }
  .hdr-stat-label {
    font-family:'Cinzel',serif; font-size:6.5px; letter-spacing:.14em;
    color:rgba(200,16,46,.6); margin:0; line-height:1;
  }
  .hdr-stat-val {
    font-family:'Cinzel',serif; font-size:13px; font-weight:700;
    color:var(--text); margin:0; line-height:1.1;
  }
  /* Esconde stats no mobile menor */
  .hdr-stats { display:none; gap:6px; margin-right:2px; }
  @media(min-width:480px) { .hdr-stats { display:flex; } }

  /* Botão ícone */
  .ieq-icon-btn {
    width:32px; height:32px; border-radius:8px;
    display:inline-flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all .2s;
    background:var(--icon-bg); color:var(--icon-color);
    border:1px solid var(--icon-bdr);
    flex-shrink:0;
  }
  @media(min-width:600px) { .ieq-icon-btn { width:36px; height:36px; } }
  .ieq-icon-btn:hover {
    color:#C8102E; background:rgba(200,16,46,.1); border-color:rgba(200,16,46,.3);
  }

  /* ════════════════════════════════
     NAV GRID  (quadradinhos)
  ════════════════════════════════ */
  .pastor-nav {
    flex-shrink:0; position:relative; z-index:15;
    background:var(--nav-bg);
    border-bottom:1px solid var(--nav-bdr);
    backdrop-filter:blur(20px);
    padding:8px 10px;
    overflow-x:auto;
    scrollbar-width:none;
    transition:background .35s, border-color .35s;
    -webkit-overflow-scrolling:touch;
  }
  .pastor-nav::-webkit-scrollbar { display:none; }

  .nav-grid {
    display:flex; gap:5px;
    min-width:max-content;
    justify-content:flex-start;
  }
  /* Centraliza quando cabe na tela */
  @media(min-width:700px) {
    .nav-grid { min-width:0; justify-content:center; flex-wrap:wrap; }
  }

  /* Tile individual */
  .ieq-nav-tile {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    width:60px; height:58px; border-radius:10px; gap:5px;
    font-family:'Cinzel',serif; font-size:7.5px; font-weight:700;
    letter-spacing:.07em; text-decoration:none; text-align:center;
    color:var(--text-sec);
    border:1px solid transparent;
    background:transparent;
    transition:all .2s;
    flex-shrink:0;
    padding:5px 3px;
    -webkit-tap-highlight-color:transparent;
  }
  @media(min-width:400px) { .ieq-nav-tile { width:66px; height:62px; font-size:8px; } }
  @media(min-width:700px) { .ieq-nav-tile { width:72px; height:66px; } }

  .ieq-nav-tile:hover,
  .ieq-nav-tile:focus-visible {
    color:var(--text);
    background:var(--card-bg);
    border-color:var(--card-bdr);
    outline:none;
  }
  .ieq-nav-tile.active {
    color:var(--text);
    background:var(--card-bg);
    border-color:rgba(200,16,46,.35);
    box-shadow:0 2px 10px rgba(200,16,46,.12);
  }

  /* Caixinha do ícone */
  .tile-icon {
    display:flex; align-items:center; justify-content:center;
    width:30px; height:30px; border-radius:8px;
    background:rgba(128,128,128,.08);
    transition:background .2s;
    flex-shrink:0;
  }
  @media(min-width:400px) { .tile-icon { width:34px; height:34px; } }

  .ieq-nav-tile:hover .tile-icon,
  .ieq-nav-tile.active .tile-icon {
    background:color-mix(in srgb, var(--tile-color) 15%, transparent);
  }
  .ieq-nav-tile:hover .tile-icon svg,
  .ieq-nav-tile.active .tile-icon svg {
    color:var(--tile-color) !important;
  }

  /* Label */
  .tile-label {
    line-height:1.2; overflow:hidden;
    text-overflow:ellipsis; white-space:nowrap;
    max-width:100%; transition:color .2s;
  }
  .ieq-nav-tile:hover .tile-label,
  .ieq-nav-tile.active .tile-label {
    color:var(--tile-color);
  }

  /* Tile de alerta (vermelho permanente) */
  .ieq-nav-tile.alert-tile {
    color:#E8294A;
    border-color:rgba(200,16,46,.22);
    background:rgba(200,16,46,.07);
  }
  .ieq-nav-tile.alert-tile .tile-icon {
    background:rgba(200,16,46,.15);
  }
  .ieq-nav-tile.alert-tile .tile-icon svg { color:#E8294A !important; }
  .ieq-nav-tile.alert-tile .tile-label    { color:#E8294A; }
  .ieq-nav-tile.alert-tile.active,
  .ieq-nav-tile.alert-tile:hover {
    background:rgba(200,16,46,.16);
    border-color:rgba(200,16,46,.48);
  }

  /* ════════════════════════════════
     CONTEÚDO PRINCIPAL
  ════════════════════════════════ */
  .pastor-main {
    flex:1; display:flex; flex-direction:column;
    min-height:0; overflow:hidden; position:relative; z-index:1;
  }

  .pastor-content {
    flex:1; overflow-y:auto;
    padding:16px 14px 32px;
    background:var(--bg);
    transition:background .35s;
    -webkit-overflow-scrolling:touch;
  }
  @media(min-width:480px)  { .pastor-content { padding:20px 18px 32px; } }
  @media(min-width:768px)  { .pastor-content { padding:28px 32px 40px; } }
  @media(min-width:1024px) { .pastor-content { padding:36px 48px 48px; } }

  /* Footer */
  .ieq-footer {
    text-align:center;
    font-family:'Cinzel',serif; font-size:9px; letter-spacing:.18em;
    color:var(--text-sec); padding:8px 0 4px;
  }
`;

export default function PastorPage() {
  const [celulas,       setCelulas]       = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [isDark,        setIsDark]        = useState(() => localStorage.getItem("theme") === "dark");
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

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

  const { totalAtivas } = useMemo(() => {
    const totalAtivas = celulas.filter(c => c.ativa === true).length;
    return { totalAtivas };
  }, [celulas]);

  const getPageTitle = () => {
    const seg = location.pathname.split("/").pop();
    return PAGE_TITLES[seg] || PAGE_TITLES["pastor"];
  };

  const textSec = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  /* ── Loading ── */
  if (loading) return (
      <div style={{
        minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center",
        background: isDark ? IEQ.dark : "#F0EAE8",
      }}>
        <style>{STATIC_CSS}</style>
        <div style={{ textAlign:"center" }}>
          <div style={{
            width:60, height:60, borderRadius:"50%", margin:"0 auto 14px",
            overflow:"hidden", border:"2px solid rgba(200,16,46,.4)",
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"rgba(200,16,46,.08)",
          }}>
          <span style={{ fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:20, color:IEQ.offWhite }}>
            {usuarioLogado?.nome?.charAt(0).toUpperCase() || "P"}
          </span>
          </div>
          <p style={{ fontFamily:"'Cinzel',serif", color: isDark ? IEQ.offWhite : IEQ.redDark, letterSpacing:".2em", fontSize:11 }}>
            CARREGANDO...
          </p>
        </div>
      </div>
  );

  return (
      <div className={`pastor-root${isDark ? " dark" : ""}`}>
        <style>{STATIC_CSS}</style>
        <div className="ieq-bg" />

        {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
        <header className="pastor-header">

          {/* Esquerda: avatar + textos */}
          <div className="hdr-left">
            <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <div className="pulse-ring" style={{ width:44, height:44 }} />
              <div className="pastor-avatar">
                {usuarioLogado?.fotoPerfil
                    ? <img src={usuarioLogado.fotoPerfil} alt={usuarioLogado.nome || "Pastor"} />
                    : <div className="pastor-avatar-fb">{usuarioLogado?.nome?.charAt(0).toUpperCase() || "P"}</div>
                }
              </div>
            </div>

            <div style={{ minWidth:0 }}>
              <h2 className="ieq-title hdr-church">IEQ PITUAÇU</h2>
              <p className="hdr-page">{getPageTitle()}</p>
              {usuarioLogado?.nome && (
                  <p className="hdr-user">{usuarioLogado.nome}</p>
              )}
            </div>
          </div>

          {/* Direita: stats + botões */}
          <div className="hdr-right">
            {/* Stats (visível ≥480px) */}
            <div className="hdr-stats">
              <div className="hdr-stat">
                <p className="hdr-stat-label">ATIVAS</p>
                <p className="hdr-stat-val">{totalAtivas}</p>
              </div>
              <div className="hdr-stat">
                <p className="hdr-stat-label">TOTAL</p>
                <p className="hdr-stat-val">{celulas.length}</p>
              </div>
            </div>

            {/* Tema */}
            <button
                className="ieq-icon-btn"
                onClick={() => setIsDark(d => !d)}
                title={isDark ? "Modo Claro" : "Modo Escuro"}
                style={{ position:"relative", overflow:"hidden" }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={isDark ? "sun" : "moon"}
                    initial={{ opacity:0, rotate:-90, scale:.5 }}
                    animate={{ opacity:1, rotate:0,   scale:1   }}
                    exit={{    opacity:0, rotate: 90, scale:.5  }}
                    transition={{ duration:.22 }}
                    style={{ display:"inline-flex", position:"absolute" }}
                >
                  {isDark ? <Sun size={14} /> : <Moon size={14} />}
                </motion.span>
              </AnimatePresence>
            </button>

            <button className="ieq-icon-btn"><Bell size={14} /></button>
            {/* Settings: visível ≥480px */}
            <button className="ieq-icon-btn" style={{ display:"none" }}
                    ref={el => el && (el.style.display = window.innerWidth >= 480 ? "inline-flex" : "none")}
            >
              <Settings size={14} />
            </button>
            <button
                className="ieq-icon-btn"
                title="Sair"
                onClick={() => { localStorage.clear(); window.location.href = "/"; }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* ══════════════════════════════════════
          NAV  —  quadradinhos com scroll
      ══════════════════════════════════════ */}
        <nav className="pastor-nav" aria-label="Navegação principal">
          <div className="nav-grid">
            {NAV_ITEMS.map(({ to, icon: Icon, label, color, end, alert }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                        `ieq-nav-tile${isActive ? " active" : ""}${alert ? " alert-tile" : ""}`
                    }
                    style={{ "--tile-color": color }}
                    aria-label={label}
                >
                  <div className="tile-icon">
                    <Icon
                        size={16}
                        style={{ color: alert ? "#E8294A" : "currentColor", transition:"color .2s" }}
                    />
                  </div>
                  <span className="tile-label">{label}</span>
                </NavLink>
            ))}
          </div>
        </nav>

        {/* ══════════════════════════════════════
          CONTEÚDO
      ══════════════════════════════════════ */}
        <main className="pastor-main">
          <section className="pastor-content">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                  key={location.pathname}
                  initial={{ opacity:0, y:8 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{    opacity:0, y:-8 }}
                  transition={{ duration:.18, ease:"easeOut" }}
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

                <div className="divider" style={{ marginTop:40 }} />
                <p className="ieq-footer">
                  © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
                </p>
              </motion.div>
            </AnimatePresence>
          </section>
        </main>
      </div>
  );
}
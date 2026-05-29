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
  AlertTriangle, LogOut, Sun, Moon,
  ClipboardList, Home, Flame, ChevronRight,
  Cake, Bell, Send, Check, X,
} from "lucide-react";

/* ─── Paleta IEQ ─────────────────────────────────────────────────── */
const IEQ = {
  red:        "#C8102E",
  redDark:    "#9B0B1E",
  redLight:   "#E8294A",
  yellow:     "#FDB813",
  yellowDark: "#C48C00",
  blue:       "#003DA5",
  blueDark:   "#002470",
  blueLight:  "#1A56C4",
  light:      "#F5F0EB",
  dark:       "#0A0608",
  stone:      "#1A1416",
};

/* ─── Nav items ──────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: "/pastor",                   icon: LayoutDashboard, label: "Dashboard",    color: IEQ.blueLight,  end: true  },
  { to: "/pastor/relatorio-celulas", icon: FileText,        label: "Relatórios",   color: IEQ.red                   },
  { to: "/pastor/discipulado",       icon: Users,           label: "Secretaria",   color: "#8B5CF6"                 },
  { to: "/pastor/multiplicacoes",    icon: Share2,          label: "Mult.",        color: "#059669"                 },
  { to: "/pastor/ranking-celulas",   icon: Trophy,          label: "Ranking",      color: IEQ.yellow                },
  { to: "/pastor/casas-de-paz",      icon: Home,            label: "Casas de Paz", color: "#5DCAA5"                 },
  { to: "/pastor/missao70",          icon: Flame,           label: "Missão 70",    color: IEQ.yellow                },
  { to: "/pastor/pendencias",        icon: ClipboardList,   label: "Pendências",   color: "#F97316"                 },
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
  "casas-de-paz":      "Relatórios · Casas de Paz",
  "missao70":          "Missão 70 · Evangelismo",
};

/* ─── Logo IEQ ───────────────────────────────────────────────────── */
function IEQCross({ size = 300, src = "/quadrangular.png" }) {
  return (
      <img
          src={src}
          alt="Logo IEQ"
          style={{
            width: `${size}px`, height: `${size}px`,
            minWidth: `${size}px`, minHeight: `${size}px`,
            borderRadius: "50%", objectFit: "cover", display: "block",
          }}
      />
  );
}

/* ─── CSS global ─────────────────────────────────────────────────── */
const buildCSS = (dark) => {
  const bg     = dark ? IEQ.dark  : "#F0EAE8";
  const txt    = dark ? IEQ.light : IEQ.dark;
  const sub    = dark ? "rgba(245,240,235,.45)" : "rgba(10,6,8,.42)";
  const border = dark ? "rgba(200,16,46,.16)"   : "rgba(200,16,46,.13)";
  const hdrBg  = dark ? "rgba(17,10,13,.97)"    : "rgba(255,255,255,.94)";
  const navBg  = dark ? "rgba(12,6,9,.98)"       : "rgba(255,255,255,.97)";

  return `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Cinzel:wght@400;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes gridMove    { to { background-position: 60px 60px; } }
    @keyframes pulseRing   { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:.08;transform:scale(1.18)} }
    @keyframes spin        { to { transform: rotate(360deg); } }
    @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer     { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes tabSlide    { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }

    /* ── Sino de aniversários ── */
    @keyframes badgePulse {
      0%,100% { transform:scale(1); box-shadow:0 0 0 0 rgba(200,16,46,0); }
      50%     { transform:scale(1.18); box-shadow:0 0 0 5px rgba(200,16,46,.18); }
    }
    @keyframes sinoPulse {
      0%,100% { transform:rotate(0deg); }
      15%     { transform:rotate(14deg); }
      30%     { transform:rotate(-12deg); }
      45%     { transform:rotate(8deg); }
      60%     { transform:rotate(-6deg); }
      75%     { transform:rotate(3deg); }
    }
    @keyframes cardBlink {
      0%,100% { border-color:rgba(200,16,46,.35); background:rgba(200,16,46,.05); }
      50%     { border-color:rgba(200,16,46,.8);  background:rgba(200,16,46,.13); }
    }
    @keyframes avatarBlink {
      0%,100% { box-shadow:0 0 0 0 rgba(200,16,46,0); }
      50%     { box-shadow:0 0 0 6px rgba(200,16,46,.3); }
    }
    @keyframes slideDownPanel {
      from { opacity:0; transform:translateY(-10px) scale(.97); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }
    .sino-panel      { animation: slideDownPanel .22s ease both; }
    .sino-card-today { animation: cardBlink 1.6s ease-in-out infinite; }
    .sino-av-today   { animation: avatarBlink 1.6s ease-in-out infinite; }
    .sino-badge      { animation: badgePulse 2s ease-in-out infinite; }
    .sino-bell-anim  { animation: sinoPulse 1.2s ease-in-out infinite; }

    .pr-root {
      font-family: 'Manrope', sans-serif;
      background: ${bg};
      color: ${txt};
      min-height: 100dvh;
      display: flex; flex-direction: column;
      position: relative; overflow: hidden;
      transition: background .4s, color .4s;
    }

    .pr-grid-bg {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        linear-gradient(rgba(253,184,19,.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(253,184,19,.045) 1px, transparent 1px);
      background-size: 60px 60px;
      animation: gridMove 12s linear infinite;
    }
    .pr-glow-r {
      position: fixed; top: -120px; left: -80px;
      width: 560px; height: 560px; border-radius: 50%;
      background: radial-gradient(circle, rgba(200,16,46,.13) 0%, transparent 68%);
      pointer-events: none; z-index: 0;
    }
    .pr-glow-b {
      position: fixed; bottom: -100px; right: -60px;
      width: 480px; height: 480px; border-radius: 50%;
      background: radial-gradient(circle, rgba(0,61,165,.10) 0%, transparent 68%);
      pointer-events: none; z-index: 0;
    }
    .pr-glow-y {
      position: fixed; top: 40%; right: -60px;
      width: 340px; height: 340px; border-radius: 50%;
      background: radial-gradient(circle, rgba(253,184,19,.06) 0%, transparent 70%);
      pointer-events: none; z-index: 0;
    }
    .pr-stripes {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background: repeating-linear-gradient(
        -55deg,
        rgba(200,16,46,.025) 0 10px, transparent 10px 20px,
        rgba(253,184,19,.02) 20px 30px, transparent 30px 40px
      );
      background-size: 60px 60px;
    }

    /* ── HEADER ── */
    .pr-header {
      position: sticky; top: 0; z-index: 50;
      background: ${hdrBg};
      border-bottom: 1px solid ${border};
      backdrop-filter: blur(24px);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 20px; height: 64px;
      transition: background .4s, border-color .4s;
    }
    @media(max-width:600px) { .pr-header { height: 56px; padding: 0 14px; } }
    .pr-hdr-left  { display: flex; align-items: center; gap: 14px; min-width: 0; }
    .pr-hdr-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    .pr-avatar-wrap {
      position: relative; display: inline-flex;
      align-items: center; justify-content: center; flex-shrink: 0;
    }
    .pr-pulse-ring {
      position: absolute; border-radius: 50%;
      border: 1px solid rgba(200,16,46,.3);
      animation: pulseRing 3s ease-in-out infinite;
    }
    .pr-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      border: 2px solid rgba(200,16,46,.38);
      overflow: hidden; display: flex; align-items: center; justify-content: center;
      background: rgba(200,16,46,.08);
      font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px;
      color: ${IEQ.light}; flex-shrink: 0; z-index: 1;
    }
    @media(max-width:600px) { .pr-avatar { width: 32px; height: 32px; font-size: 12px; } }
    .pr-avatar img { width: 100%; height: 100%; object-fit: cover; }

    .pr-title-block { min-width: 0; }
    .pr-church-name {
      font-family: 'Cinzel', serif;
      font-size: 11px; font-weight: 700; letter-spacing: .2em;
      background: linear-gradient(90deg, ${IEQ.redDark}, ${IEQ.red}, ${IEQ.yellow}, ${IEQ.blue});
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; white-space: nowrap; line-height: 1;
    }
    .pr-breadcrumb { display: flex; align-items: center; gap: 4px; margin-top: 3px; }
    .pr-breadcrumb-seg {
      font-family: 'Cinzel', serif; font-size: 9px; font-weight: 700;
      letter-spacing: .12em; color: ${sub}; white-space: nowrap;
    }
    .pr-breadcrumb-seg.active { color: ${txt}; }
    .pr-username {
      font-family: 'Manrope', sans-serif; font-size: 11px;
      color: ${sub}; font-style: italic; margin-top: 1px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;
    }
    @media(max-width:480px) { .pr-username { display: none; } }

    .pr-stat-chips { display: flex; gap: 6px; }
    @media(max-width:500px) { .pr-stat-chips { display: none; } }
    .pr-stat-chip {
      padding: 5px 10px; border-radius: 7px;
      background: ${dark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.05)"};
      border: 1px solid ${border}; text-align: center;
    }
    .pr-stat-chip-label {
      font-family: 'Cinzel', serif; font-size: 6.5px; letter-spacing: .16em;
      color: rgba(200,16,46,.65); line-height: 1;
    }
    .pr-stat-chip-val {
      font-family: 'Cinzel', serif; font-size: 14px; font-weight: 700;
      color: ${txt}; line-height: 1.15;
    }

    .pr-icon-btn {
      width: 36px; height: 36px; border-radius: 8px;
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; outline: none;
      background: ${dark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.05)"};
      color: ${sub};
      border: 1px solid ${border};
      transition: all .22s; flex-shrink: 0; position: relative;
    }
    .pr-icon-btn:hover {
      background: rgba(200,16,46,.1); border-color: rgba(200,16,46,.35);
      color: ${IEQ.red}; transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(200,16,46,.18);
    }
    @media(max-width:600px) { .pr-icon-btn { width: 32px; height: 32px; } }

    .pr-header-line {
      height: 2px;
      background: linear-gradient(90deg, ${IEQ.redDark}, ${IEQ.red}, ${IEQ.yellow}, ${IEQ.blue}, transparent);
      position: sticky; top: 64px; z-index: 49;
    }
    @media(max-width:600px) { .pr-header-line { top: 56px; } }

    /* ── NAV ── */
    .pr-nav {
      position: sticky; top: 66px; z-index: 40;
      background: ${navBg};
      border-bottom: 1px solid ${border};
      backdrop-filter: blur(24px);
      padding: 10px 16px; overflow-x: auto; scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      transition: background .4s, border-color .4s;
    }
    @media(max-width:600px) { .pr-nav { top: 58px; padding: 8px 10px; } }
    .pr-nav::-webkit-scrollbar { display: none; }
    .pr-nav-inner { display: flex; gap: 4px; min-width: max-content; }
    @media(min-width:720px) {
      .pr-nav-inner { min-width: 0; flex-wrap: wrap; justify-content: center; }
    }

    .pr-nav-tile {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      width: 68px; min-height: 62px; border-radius: 10px; gap: 6px; flex-shrink: 0;
      text-decoration: none; text-align: center;
      border: 1px solid transparent; background: transparent; cursor: pointer;
      transition: all .22s; padding: 7px 4px;
      -webkit-tap-highlight-color: transparent;
      position: relative; overflow: hidden;
    }
    @media(min-width:420px) { .pr-nav-tile { width: 74px; min-height: 66px; } }
    .pr-nav-tile::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.08) 50%, transparent 60%);
      background-size: 200% 100%; opacity: 0; transition: opacity .3s;
    }
    .pr-nav-tile:hover::before { opacity: 1; animation: shimmer .6s ease; }
    .pr-nav-tile:hover, .pr-nav-tile:focus-visible {
      background: ${dark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.04)"};
      border-color: ${border}; transform: translateY(-2px); outline: none;
    }
    .pr-nav-tile.pr-active {
      background: ${dark ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.9)"};
      border-color: rgba(200,16,46,.3);
      box-shadow: 0 4px 18px rgba(200,16,46,.14), 0 1px 0 rgba(255,255,255,.1) inset;
      transform: translateY(-2px);
    }
    .pr-nav-tile.pr-alert { background: rgba(200,16,46,.07); border-color: rgba(200,16,46,.2); }
    .pr-nav-tile.pr-alert.pr-active { background: rgba(200,16,46,.14); border-color: rgba(200,16,46,.45); }

    .pr-tile-icon {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(128,128,128,.07); transition: all .22s; flex-shrink: 0;
    }
    @media(min-width:420px) { .pr-tile-icon { width: 36px; height: 36px; } }
    .pr-tile-label {
      font-family: 'Cinzel', serif; font-size: 7.5px; font-weight: 700;
      letter-spacing: .07em; color: ${sub};
      line-height: 1.2; overflow: hidden; text-overflow: ellipsis;
      white-space: nowrap; max-width: 100%; transition: color .22s;
    }
    @media(min-width:420px) { .pr-tile-label { font-size: 8px; } }
    .pr-active-dot {
      position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%);
      width: 4px; height: 4px; border-radius: 50%;
      background: ${IEQ.red}; box-shadow: 0 0 6px ${IEQ.red};
    }

    /* ── MAIN ── */
    .pr-main { flex: 1; display: flex; flex-direction: column; min-height: 0; position: relative; z-index: 1; }
    .pr-content {
      flex: 1; overflow-y: auto; padding: 24px 18px 40px;
      background: transparent; -webkit-overflow-scrolling: touch;
    }
    @media(min-width:540px)  { .pr-content { padding: 28px 24px 40px; } }
    @media(min-width:768px)  { .pr-content { padding: 36px 40px 48px; } }
    @media(min-width:1100px) { .pr-content { padding: 44px 64px 56px; } }

    .pr-footer {
      text-align: center; font-family: 'Cinzel', serif; font-size: 8.5px;
      letter-spacing: .2em; color: ${sub}; padding: 10px 0 4px;
      border-top: 1px solid ${border};
    }
    .pr-loading {
      position: fixed; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 20px;
      background: ${bg}; z-index: 200;
    }
    .pr-loading-ring {
      width: 64px; height: 64px; border-radius: 50%;
      border: 2px solid rgba(200,16,46,.12); border-top-color: ${IEQ.red};
      animation: spin .9s linear infinite;
    }
    .pr-loading-text {
      font-family: 'Cinzel', serif; font-size: 10px;
      letter-spacing: .22em; color: ${sub}; text-transform: uppercase;
    }
    .pr-ornament { display: flex; align-items: center; gap: 12px; margin: 40px 0 4px; }
    .pr-ornament::before, .pr-ornament::after {
      content: ''; flex: 1; height: 1px;
      background: linear-gradient(to right, transparent, rgba(200,16,46,.2), transparent);
    }
    .pr-ornament-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: ${IEQ.yellow}; box-shadow: 0 0 6px ${IEQ.yellow};
    }
    .tab-animate { animation: tabSlide .22s ease both; }
  `;
};

/* ═══════════════════════════════════════════════════════════════════
   SINO DE ANIVERSARIANTES
═══════════════════════════════════════════════════════════════════ */
const CORES_SINO = [
  { bg: "rgba(200,16,46,.12)",  text: "#9B0B1E" },
  { bg: "rgba(0,61,165,.10)",   text: "#002470" },
  { bg: "rgba(253,184,19,.15)", text: "#C48C00" },
  { bg: "rgba(93,202,165,.15)", text: "#0F6E56" },
  { bg: "rgba(139,92,246,.12)", text: "#5B21B6" },
];

function sinoInitials(nome = "") {
  return nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function SinoPastor({ isDark }) {
  const [open,     setOpen]     = useState(false);
  const [tab,      setTab]      = useState("hoje");
  const [hoje,     setHoje]     = useState([]);
  const [semana,   setSemana]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [enviados, setEnviados] = useState({});
  const ref = React.useRef(null);

  useEffect(() => {
    Promise.all([
      api.get("/api/aniversariantes/hoje"),
      api.get("/api/aniversariantes/semana"),
    ]).then(([rH, rS]) => {
      setHoje(rH.data   || []);
      setSemana(rS.data || []);
    }).catch(console.error)
        .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const lista   = tab === "hoje" ? hoje : semana;
  const temHoje = hoje.length > 0;
  const panelBg = isDark ? "rgba(17,10,13,.98)" : "#fff";
  const subClr  = isDark ? "rgba(245,240,235,.45)" : "rgba(10,6,8,.45)";
  const borderC = "rgba(200,16,46,.22)";

  // ✅ CORREÇÃO: monta o link do WhatsApp a partir do telefone cadastrado
  const abrirWhatsApp = (m, id) => {
    const numero   = (m.telefone || "").replace(/\D/g, ""); // remove tudo que não é dígito
    const mensagem = encodeURIComponent(
        `🎂 Feliz Aniversário, ${m.nome}! Que Deus te abençoe muito! 🙏`
    );
    // Se o número já vier com DDI 55 no banco (ex: "5571999999999"), use só numero.
    // Caso contrário, o prefixo 55 é adicionado automaticamente abaixo.
    const ddi = numero.startsWith("55") ? "" : "55";
    const link = `https://wa.me/${ddi}${numero}?text=${mensagem}`;
    window.open(link, "_blank");
    setEnviados(prev => ({ ...prev, [id]: true }));
  };

  return (
      <div ref={ref} style={{ position: "relative" }}>

        {/* ── Botão sino ── */}
        <button
            className="pr-icon-btn"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(o => !o); }}
            aria-label="Aniversariantes"
            style={open || temHoje ? {
              background:  open ? "rgba(200,16,46,.14)" : "rgba(200,16,46,.09)",
              borderColor: open ? "rgba(200,16,46,.55)" : "rgba(200,16,46,.4)",
              color: "#C8102E",
            } : {}}
        >
        <span className={temHoje && !open ? "sino-bell-anim" : ""} style={{ display: "inline-flex" }}>
          <Bell size={15} style={{ color: temHoje ? "#C8102E" : undefined }} />
        </span>

          {temHoje && (
              <span
                  className="sino-badge"
                  style={{
                    position: "absolute", top: -5, right: -5,
                    minWidth: 18, height: 18, borderRadius: 9,
                    background: "#C8102E", color: "#fff",
                    fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 4px",
                    border: `2px solid ${isDark ? "#0A0608" : "#F0EAE8"}`,
                    fontFamily: "'Manrope', sans-serif",
                  }}
              >
            {hoje.length}
          </span>
          )}
        </button>

        {/* ── Painel dropdown ── */}
        {open && (
            <div
                className="sino-panel"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute", top: 48, right: 0,
                  width: 344,
                  background: panelBg,
                  border: `1px solid ${borderC}`,
                  borderRadius: 16,
                  boxShadow: isDark
                      ? "0 16px 48px rgba(0,0,0,.6)"
                      : "0 8px 32px rgba(200,16,46,.14)",
                  zIndex: 300, overflow: "hidden",
                }}
            >
              {/* Cabeçalho */}
              <div style={{
                padding: "14px 16px 10px",
                borderBottom: `1px solid ${borderC}`,
                background: "rgba(200,16,46,.05)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: "rgba(200,16,46,.1)",
                    border: "1px solid rgba(200,16,46,.22)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Cake size={16} color="#C8102E" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#C8102E" }}>
                      ANIVERSARIANTES
                    </p>
                    <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: subClr, marginTop: 2 }}>
                      {temHoje ? `🎂 ${hoje.length} hoje!` : "Que Deus abençoe!"}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {["hoje", "semana"].map(t => (
                      <button
                          key={t}
                          onClick={(e) => { e.stopPropagation(); setTab(t); }}
                          style={{
                            padding: "4px 10px", borderRadius: 7, cursor: "pointer",
                            fontFamily: "'Manrope', sans-serif", fontSize: 11, fontWeight: 600,
                            border: `1px solid ${tab === t ? "rgba(200,16,46,.35)" : "transparent"}`,
                            background: tab === t ? "rgba(200,16,46,.1)" : "transparent",
                            color: tab === t ? "#C8102E" : subClr,
                            transition: "all .18s",
                          }}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                  ))}
                  <button
                      onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                      style={{
                        width: 26, height: 26, borderRadius: 7,
                        border: "1px solid transparent", background: "transparent",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        color: subClr,
                      }}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Lista */}
              <div style={{
                maxHeight: 320, overflowY: "auto",
                padding: "10px 10px",
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                {loading ? (
                    <p style={{
                      textAlign: "center", padding: "28px 0",
                      fontFamily: "'Cinzel', serif", fontSize: 10,
                      letterSpacing: ".18em", color: subClr,
                    }}>
                      CARREGANDO...
                    </p>
                ) : lista.length === 0 ? (
                    <p style={{
                      textAlign: "center", padding: "28px 0",
                      fontFamily: "'Manrope', sans-serif", fontSize: 13, color: subClr,
                    }}>
                      🙏 Nenhum aniversariante {tab === "hoje" ? "hoje" : "essa semana"}.
                    </p>
                ) : lista.map((m, i) => {
                  const cor     = CORES_SINO[i % CORES_SINO.length];
                  const isToday = tab === "hoje";
                  const enviado = enviados[m.id];

                  return (
                      <div
                          key={m.id}
                          className={isToday ? "sino-card-today" : ""}
                          style={{
                            display: "flex", alignItems: "center", gap: 11,
                            padding: "11px 12px", borderRadius: 12,
                            border: `1px solid ${isToday
                                ? "rgba(200,16,46,.35)"
                                : isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`,
                            background: isToday
                                ? "rgba(200,16,46,.05)"
                                : isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.018)",
                            borderLeft: isToday ? "3px solid #C8102E" : undefined,
                            transition: "background .3s, border-color .3s",
                          }}
                      >
                        {/* Avatar */}
                        <div
                            className={isToday ? "sino-av-today" : ""}
                            style={{
                              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: cor.bg, color: cor.text,
                              fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700,
                              border: `2px solid ${isToday ? "rgba(200,16,46,.45)" : "rgba(128,128,128,.18)"}`,
                            }}
                        >
                          {sinoInitials(m.nome)}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 600,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            color: isDark ? "#F5F0EB" : "#0A0608",
                          }}>
                            {m.nome}
                          </p>
                          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: subClr, marginTop: 1 }}>
                            📱 {m.telefone}
                          </p>
                          {isToday && (
                              <span style={{
                                fontFamily: "'Cinzel', serif", fontSize: 8, fontWeight: 700, letterSpacing: ".08em",
                                padding: "2px 7px", borderRadius: 5,
                                background: "rgba(200,16,46,.1)", color: "#C8102E",
                                border: "1px solid rgba(200,16,46,.22)",
                                marginTop: 4, display: "inline-block",
                              }}>
                        🎂 HOJE!
                      </span>
                          )}
                        </div>

                        {/* Botão WhatsApp */}
                        <button
                            onClick={(e) => { e.stopPropagation(); abrirWhatsApp(m, m.id); }}
                            title={enviado ? "Enviado!" : "Enviar parabéns no WhatsApp"}
                            style={{
                              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                              border: `1px solid ${enviado ? "rgba(5,150,105,.35)" : "rgba(37,211,102,.4)"}`,
                              background: enviado ? "rgba(5,150,105,.08)" : "rgba(37,211,102,.08)",
                              cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all .18s",
                            }}
                        >
                          {enviado ? <Check size={15} color="#059669" /> : <Send size={15} color="#25D366" />}
                        </button>
                      </div>
                  );
                })}
              </div>

              {/* Rodapé */}
              <div style={{
                padding: "9px 16px", borderTop: `1px solid ${borderC}`,
                textAlign: "center", fontFamily: "'Cinzel', serif", fontSize: 8,
                letterSpacing: ".16em", color: subClr,
                background: "rgba(200,16,46,.03)",
              }}>
                ✦ IEQ PITUAÇU · SISTEMA PASTORAL ✦
              </div>
            </div>
        )}
      </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — PastorPage
═══════════════════════════════════════════════════════════════════ */
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
      try {
        const [resCelulas, resUsuario] = await Promise.all([
          api.get("/celulas"),
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

  const { totalAtivas } = useMemo(() => ({
    totalAtivas: celulas.filter(c => c.ativa === true).length,
  }), [celulas]);

  const getPageSegment = () => location.pathname.split("/").pop();
  const getPageTitle   = () => PAGE_TITLES[getPageSegment()] || PAGE_TITLES["pastor"];
  const css = buildCSS(isDark);

  /* ── Tela de loading ── */
  if (loading) return (
      <div className="pr-loading" style={{ background: isDark ? IEQ.dark : "#F0EAE8" }}>
        <style>{css}</style>
        <div className="pr-grid-bg" />
        <div className="pr-glow-r" />
        <div className="pr-glow-b" />
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            position: "absolute", width: 84, height: 84, borderRadius: "50%",
            border: "1px solid rgba(200,16,46,.25)",
            animation: "pulseRing 2.4s ease-in-out infinite",
          }} />
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: isDark ? "rgba(26,20,22,.9)" : "#fff",
            border: "1px solid rgba(200,16,46,.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(200,16,46,.18)",
          }}>
            <IEQCross size={44} />
          </div>
        </div>
        <div className="pr-loading-ring" />
        <p className="pr-loading-text">Carregando Sistema</p>
      </div>
  );

  const pageTitle = getPageTitle();

  return (
      <div className="pr-root">
        <style key={isDark ? "dark" : "light"}>{css}</style>

        {/* ── Fundo ── */}
        <div className="pr-grid-bg" />
        <div className="pr-stripes" />
        <div className="pr-glow-r" />
        <div className="pr-glow-b" />
        <div className="pr-glow-y" />

        {/* ══════════════════ HEADER ══════════════════ */}
        <header className="pr-header">
          <div className="pr-hdr-left">

            {/* Avatar com anel pulsante */}
            <div className="pr-avatar-wrap">
              <div className="pr-pulse-ring" style={{ width: 52, height: 52 }} />
              <div className="pr-pulse-ring" style={{ width: 44, height: 44, animationDelay: "1.2s" }} />
              <div className="pr-avatar">
                {usuarioLogado?.fotoPerfil
                    ? <img src={usuarioLogado.fotoPerfil} alt={usuarioLogado.nome} />
                    : (usuarioLogado?.nome?.charAt(0).toUpperCase() || "P")
                }
              </div>
            </div>

            {/* Título + breadcrumb */}
            <div className="pr-title-block">
              <p className="pr-church-name">IEQ PITUAÇU</p>
              <div className="pr-breadcrumb">
                <span className="pr-breadcrumb-seg">Pastoral</span>
                <ChevronRight size={9} style={{ color: "rgba(200,16,46,.4)", flexShrink: 0 }} />
                <span className="pr-breadcrumb-seg active">{pageTitle}</span>
              </div>
              {usuarioLogado?.nome && (
                  <p className="pr-username">{usuarioLogado.nome}</p>
              )}
            </div>
          </div>

          <div className="pr-hdr-right">

            {/* Stat chips */}
            <div className="pr-stat-chips">
              <div className="pr-stat-chip">
                <p className="pr-stat-chip-label">ATIVAS</p>
                <p className="pr-stat-chip-val">{totalAtivas}</p>
              </div>
              <div className="pr-stat-chip">
                <p className="pr-stat-chip-label">TOTAL</p>
                <p className="pr-stat-chip-val">{celulas.length}</p>
              </div>
            </div>

            {/* Tema */}
            <button
                className="pr-icon-btn"
                onClick={() => setIsDark(d => !d)}
                aria-label={isDark ? "Modo Claro" : "Modo Escuro"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={isDark ? "sun" : "moon"}
                    initial={{ opacity: 0, rotate: -90, scale: .5 }}
                    animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                    exit={{    opacity: 0, rotate:  90, scale: .5  }}
                    transition={{ duration: .2 }}
                    style={{ display: "inline-flex", position: "absolute" }}
                >
                  {isDark ? <Sun size={15} /> : <Moon size={15} />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Sino de aniversariantes */}
            <SinoPastor isDark={isDark} />

            {/* Sair */}
            <button
                className="pr-icon-btn"
                aria-label="Sair"
                onClick={() => { localStorage.clear(); window.location.href = "/"; }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        {/* Linha gradiente decorativa */}
        <div className="pr-header-line" />

        {/* ══════════════════ NAV ══════════════════ */}
        <nav className="pr-nav" aria-label="Navegação pastoral">
          <div className="pr-nav-inner">
            {NAV_ITEMS.map(({ to, icon: Icon, label, color, end, alert }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                        `pr-nav-tile${isActive ? " pr-active" : ""}${alert ? " pr-alert" : ""}`
                    }
                    aria-label={label}
                >
                  {({ isActive }) => (
                      <>
                        <div
                            className="pr-tile-icon"
                            style={{
                              background: isActive
                                  ? `color-mix(in srgb, ${color} 18%, transparent)`
                                  : undefined,
                            }}
                        >
                          <Icon
                              size={16}
                              style={{ color: isActive || alert ? color : undefined, transition: "color .22s" }}
                          />
                        </div>
                        <span
                            className="pr-tile-label"
                            style={{ color: isActive ? color : undefined }}
                        >
                    {label}
                  </span>
                        {isActive && (
                            <div className="pr-active-dot" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                        )}
                      </>
                  )}
                </NavLink>
            ))}
          </div>
        </nav>

        {/* ══════════════════ CONTEÚDO ══════════════════ */}
        <main className="pr-main">
          <section className="pr-content">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{    opacity: 0, y: -8 }}
                  transition={{ duration: .2, ease: "easeOut" }}
                  style={{ willChange: "opacity, transform" }}
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

                <div className="pr-ornament">
                  <div className="pr-ornament-dot" />
                </div>
                <p className="pr-footer">
                  © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
                </p>
              </motion.div>
            </AnimatePresence>
          </section>
        </main>
      </div>
  );
}
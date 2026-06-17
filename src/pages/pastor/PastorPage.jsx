import React, { useEffect, useState, useMemo } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
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
  ClipboardList, Home, Flame,
  Cake, Bell, Send, Check, X, ChevronRight,
} from "lucide-react";

/* ─── Tokens AURA ────────────────────────────────────────────────── */
const AURA = {
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  dark:      "#0A0A0F",
  darkEl:    "#12121A",
  light:     "#F5F0E8",
  red:       "#C8102E",
  redDark:   "#9B0B1E",
  blue:      "#003DA5",
  blueDark:  "#002470",
  yellow:    "#FDB813",
};

function theme(isDark) {
  return {
    bg:          isDark ? "#0A0A0F"               : "#F5F0E8",
    bgEl:        isDark ? "rgba(18,18,26,.98)"     : "rgba(255,255,255,.98)",
    bgInput:     isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.1)"   : "rgba(201,169,110,.2)",
    borderInput: isDark ? "rgba(201,169,110,.15)"  : "rgba(201,169,110,.28)",
    text:        isDark ? "#F5F0E8"                : "#1A1008",
    textSec:     isDark ? "#9A9588"                : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"                : "#9A9080",
    glow1:       isDark ? "rgba(201,169,110,.05)"  : "rgba(201,169,110,.08)",
    glow2:       isDark ? "rgba(201,169,110,.04)"  : "rgba(201,169,110,.06)",
    headerBg:    isDark ? "rgba(10,10,15,.97)"     : "rgba(245,240,232,.97)",
    cardHover:   isDark ? "rgba(201,169,110,.2)"   : "rgba(201,169,110,.35)",
    placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
  };
}

/* ─── Nav items ──────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: "/pastor",                   icon: LayoutDashboard, label: "Dashboard",    color: AURA.blue,   end: true  },
  { to: "/pastor/relatorio-celulas", icon: FileText,        label: "Relatórios",   color: AURA.red                },
  { to: "/pastor/discipulado",       icon: Users,           label: "Secretaria",   color: "#8B5CF6"               },
  { to: "/pastor/multiplicacoes",    icon: Share2,          label: "Mult.",        color: "#059669"               },
  { to: "/pastor/ranking-celulas",   icon: Trophy,          label: "Ranking",      color: AURA.yellow             },
  { to: "/pastor/casas-de-paz",      icon: Home,            label: "Casas de Paz", color: "#5DCAA5"               },
  { to: "/pastor/missao70",          icon: Flame,           label: "Missão 70",    color: AURA.yellow             },
  { to: "/pastor/pendencias",        icon: ClipboardList,   label: "Pendências",   color: "#F97316"               },
  { to: "/pastor/alertas",           icon: AlertTriangle,   label: "Alertas",      color: AURA.red, alert: true   },
];

const PAGE_TITLES = {
  "pastor":            "Dashboard Geral",
  "relatorio-celulas": "Relatórios de Células",
  "discipulado":       "Secretaria",
  "multiplicacoes":    "Multiplicações",
  "ranking-celulas":   "Ranking",
  "alertas":           "Alertas",
  "pendencias":        "Pendências",
  "casas-de-paz":      "Casas de Paz",
  "missao70":          "Missão 70",
};

/* ─── Logo ──────────────────────────────────────────────────────── */
function IEQCross({ size = 36 }) {
  return (
      <img
          src="/quadrangular.png"
          alt="Logo IEQ"
          style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }}
      />
  );
}

/* ─── CSS Global ─────────────────────────────────────────────────── */
function GlobalStyles({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      *, *::before, *::after { box-sizing: border-box; }

      @keyframes pp-spin   { to { transform: rotate(360deg); } }
      @keyframes pp-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes pp-blink  { 0%,100%{opacity:1;} 50%{opacity:.3;} }
      @keyframes pp-badge  { 0%,100%{transform:scale(1);} 50%{transform:scale(1.15);} }
      @keyframes pp-bell   { 0%,100%{transform:rotate(0);} 15%{transform:rotate(14deg);} 30%{transform:rotate(-12deg);} 45%{transform:rotate(8deg);} 60%{transform:rotate(-5deg);} 75%{transform:rotate(3deg);} }
      @keyframes pp-panel  { from{opacity:0;transform:translateY(-6px);} to{opacity:1;transform:translateY(0);} }
      @keyframes pp-sheet  { from{opacity:0;transform:translateY(100%);} to{opacity:1;transform:translateY(0);} }

      .pp-spin   { animation: pp-spin   1s linear infinite; }
      .pp-pulse  { animation: pp-pulse  3s ease-in-out infinite; }
      .pp-blink  { animation: pp-blink  2s ease-in-out infinite; }
      .pp-bell   { animation: pp-bell   1.2s ease-in-out infinite; }
      .pp-badge  { animation: pp-badge  2s ease-in-out infinite; }
      .pp-panel  { animation: pp-panel  .22s ease both; }
      .pp-sheet  { animation: pp-sheet  .28s cubic-bezier(.32,1,.23,1) both; }

      .pp-root {
        font-family: 'Inter', sans-serif;
        background: ${t.bg};
        color: ${t.text};
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow-x: hidden;
        transition: background .3s, color .3s;
        isolation: isolate;
      }

      .pp-glow {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
          radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%);
        transition: background .3s;
      }

      /* ── HEADER ── */
      .pp-header {
        position: sticky; top: 0; z-index: 50;
        background: ${t.headerBg};
        border-bottom: 1px solid ${t.border};
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 16px; height: 60px; gap: 10px;
        transition: background .3s, border-color .3s;
      }
      @media(min-width:480px) { .pp-header { padding: 0 20px; height: 64px; } }

      .pp-header-line {
        height: 2px; position: sticky; top: 60px; z-index: 49;
        background: linear-gradient(90deg, ${AURA.redDark}, ${AURA.red}, ${AURA.yellow}, ${AURA.blue}, transparent);
        flex-shrink: 0;
      }
      @media(min-width:480px) { .pp-header-line { top: 64px; } }

      .pp-hdr-left  { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; overflow: hidden; }
      .pp-hdr-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
      @media(min-width:480px) { .pp-hdr-right { gap: 8px; } }

      .pp-avatar-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .pp-ring {
        position: absolute; border-radius: 50%;
        border: 1px solid rgba(201,169,110,.22);
        top: 50%; left: 50%; transform: translate(-50%,-50%);
      }
      .pp-avatar {
        width: 38px; height: 38px; border-radius: 50%;
        border: 1.5px solid rgba(201,169,110,.28);
        background: ${isDark ? "rgba(18,18,26,.99)" : "#fff"};
        display: flex; align-items: center; justify-content: center; overflow: hidden;
        position: relative; z-index: 1;
        font-family: 'Playfair Display', serif; font-weight: 600; font-size: 15px; color: ${AURA.gold};
        flex-shrink: 0;
      }
      .pp-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      @media(min-width:480px) { .pp-avatar { width: 44px; height: 44px; font-size: 16px; } }

      .pp-title-block { min-width: 0; overflow: hidden; }
      .pp-eyebrow {
        font-size: 8px; font-weight: 500; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(201,169,110,.55); margin: 0 0 1px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      @media(min-width:480px) { .pp-eyebrow { font-size: 9px; margin-bottom: 2px; } }
      .pp-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(14px, 3.5vw, 20px);
        font-weight: 500; color: ${t.text}; margin: 0; line-height: 1.2;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .pp-title span { color: ${AURA.gold}; }
      .pp-breadcrumb {
        display: flex; align-items: center; gap: 3px; margin-top: 2px;
        overflow: hidden;
      }
      .pp-breadcrumb-seg {
        font-size: 10px; font-weight: 400; color: ${t.textMuted};
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        flex-shrink: 1;
      }
      .pp-breadcrumb-seg.active { color: ${t.textSec}; font-weight: 500; flex-shrink: 0; }

      .pp-stat-chips { display: none; gap: 6px; }
      @media(min-width:540px) { .pp-stat-chips { display: flex; } }
      .pp-stat-chip {
        padding: 5px 10px; border-radius: 10px;
        background: ${isDark ? "rgba(201,169,110,.06)" : "rgba(201,169,110,.08)"};
        border: 1px solid ${t.border}; text-align: center; min-width: 48px;
      }
      .pp-stat-chip-label {
        font-size: 8px; font-weight: 500; letter-spacing: .15em;
        text-transform: uppercase; color: rgba(201,169,110,.6); line-height: 1;
      }
      .pp-stat-chip-val {
        font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600;
        color: ${t.text}; line-height: 1.2;
      }

      .pp-btn-ico {
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${t.border};
        border-radius: 10px; width: 34px; height: 34px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        color: ${t.textMuted}; transition: all .25s; flex-shrink: 0; position: relative;
      }
      .pp-btn-ico:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }
      @media(min-width:480px) { .pp-btn-ico { width: 38px; height: 38px; border-radius: 12px; } }

      .pp-btn-exit {
        display: flex; align-items: center; gap: 6px;
        padding: 0 12px; height: 34px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
        transition: all .3s; box-shadow: 0 4px 16px rgba(200,16,46,.22);
        white-space: nowrap; flex-shrink: 0;
      }
      .pp-btn-exit:hover { opacity: .88; transform: translateY(-1px); }
      @media(min-width:480px) { .pp-btn-exit { padding: 0 14px; height: 38px; } }
      .pp-btn-exit-label { display: none; }
      @media(min-width:400px) { .pp-btn-exit-label { display: inline; } }

      /* ── NAV ── */
      .pp-nav {
        position: sticky; top: 62px; z-index: 40;
        background: ${t.headerBg};
        border-bottom: 1px solid ${t.border};
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        padding: 8px 10px 10px;
        overflow-x: auto;
        overflow-y: visible;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        transition: background .3s, border-color .3s;
      }
      @media(min-width:480px) { .pp-nav { top: 66px; padding: 10px 14px 12px; } }
      .pp-nav::-webkit-scrollbar { display: none; }

      .pp-nav-inner {
        display: flex;
        gap: 3px;
        width: max-content;
        min-width: 100%;
      }
      @media(min-width:720px) {
        .pp-nav-inner {
          width: 100%;
          min-width: 0;
          flex-wrap: nowrap;
          justify-content: center;
        }
      }

      .pp-nav-tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 72px;
        width: 72px;
        min-height: 64px;
        border-radius: 14px;
        gap: 5px;
        flex-shrink: 0;
        text-decoration: none;
        text-align: center;
        border: 1px solid transparent;
        background: transparent;
        cursor: pointer;
        transition: background .25s, border-color .25s, box-shadow .25s;
        padding: 8px 4px 7px;
        -webkit-tap-highlight-color: transparent;
        position: relative;
        overflow: visible;
      }
      @media(min-width:480px) {
        .pp-nav-tile { min-width: 80px; width: 80px; min-height: 68px; gap: 6px; }
      }
      @media(min-width:720px) {
        .pp-nav-tile { flex: 1; min-width: 0; width: auto; max-width: 100px; }
      }
      .pp-nav-tile:hover {
        background: ${isDark ? "rgba(201,169,110,.05)" : "rgba(201,169,110,.07)"};
        border-color: ${t.border};
        transform: translateY(-1px);
      }
      .pp-nav-tile.pp-active {
        background: ${isDark ? "rgba(201,169,110,.09)" : "rgba(255,255,255,.9)"};
        border-color: rgba(201,169,110,.28);
        box-shadow: 0 4px 18px rgba(201,169,110,.1);
        transform: translateY(-2px);
      }

      .pp-tile-icon {
        width: 30px; height: 30px; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        background: rgba(201,169,110,.07); transition: all .25s; flex-shrink: 0;
      }
      @media(min-width:480px) { .pp-tile-icon { width: 32px; height: 32px; border-radius: 9px; } }

      .pp-tile-label {
        font-size: 8.5px; font-weight: 600; letter-spacing: .06em;
        text-transform: uppercase; color: ${t.textMuted}; line-height: 1.25;
        white-space: normal; word-break: break-word; overflow: visible;
        width: 100%; text-align: center; transition: color .25s; padding: 0 2px;
      }
      @media(min-width:480px) { .pp-tile-label { font-size: 9px; letter-spacing: .08em; } }

      .pp-active-dot {
        position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%);
        width: 4px; height: 4px; border-radius: 50%; background: ${AURA.gold};
        box-shadow: 0 0 6px ${AURA.gold};
      }

      /* ── MAIN ── */
      .pp-main { flex: 1; display: flex; flex-direction: column; position: relative; z-index: 1; }
      .pp-content {
        flex: 1; padding: 20px 14px 48px;
        max-width: 960px; margin: 0 auto; width: 100%;
      }
      @media(min-width:480px)  { .pp-content { padding: 24px 18px 48px; } }
      @media(min-width:540px)  { .pp-content { padding: 28px 24px 48px; } }
      @media(min-width:768px)  { .pp-content { padding: 36px 32px 56px; } }

      .pp-page-anim {
        will-change: opacity;
        transform: translateZ(0);
      }

      .pp-footer {
        text-align: center; font-size: 9px; font-weight: 500; letter-spacing: .18em;
        text-transform: uppercase;
        color: ${isDark ? "rgba(245,240,232,.12)" : "rgba(26,16,8,.15)"};
        padding: 16px 0 8px;
        border-top: 1px solid ${t.border};
      }
      .pp-loading {
        min-height: 100dvh; display: flex; align-items: center; justify-content: center;
        background: ${t.bg}; position: relative;
      }

      /* ── Sino ── */
      .pp-sino-panel { animation: pp-panel .22s ease both; }
      .pp-sino-sheet { animation: pp-sheet .28s cubic-bezier(.32,1,.23,1) both; }
      .pp-sino-scroll::-webkit-scrollbar { width: 4px; }
      .pp-sino-scroll::-webkit-scrollbar-track { background: transparent; }
      .pp-sino-scroll::-webkit-scrollbar-thumb { background: rgba(201,169,110,.25); border-radius: 4px; }
    `}</style>
  );
}

/* ─── Sino de Aniversariantes ─────────────────────────────────────── */
const CORES_SINO = [
  { bg: "rgba(200,16,46,.12)",   text: "#9B0B1E" },
  { bg: "rgba(0,61,165,.10)",    text: "#002470" },
  { bg: "rgba(253,184,19,.15)",  text: "#C48C00" },
  { bg: "rgba(201,169,110,.15)", text: "#8B6F3E" },
  { bg: "rgba(139,92,246,.12)",  text: "#5B21B6" },
];

function sinoInitials(nome = "") {
  return nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function useIsMobileSino() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 520);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 520);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

function SinoPastor({ isDark, t }) {
  const [open,     setOpen]     = useState(false);
  const [tab,      setTab]      = useState("hoje");
  const [hoje,     setHoje]     = useState([]);
  const [semana,   setSemana]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [enviados, setEnviados] = useState({});
  const btnRef   = React.useRef(null);
  const panelRef = React.useRef(null);
  const isMobile = useIsMobileSino();

  useEffect(() => {
    Promise.all([
      api.get("/api/aniversariantes/hoje"),
      api.get("/api/aniversariantes/semana"),
    ]).then(([rH, rS]) => {
      setHoje(rH.data || []);
      setSemana(rS.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Fecha ao clicar fora (desktop)
  useEffect(() => {
    if (!open || isMobile) return;
    const fn = (e) => {
      const noBtn   = btnRef.current   && !btnRef.current.contains(e.target);
      const noPanel = panelRef.current && !panelRef.current.contains(e.target);
      if (noBtn && noPanel) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open, isMobile]);

  // Trava scroll do body no mobile
  useEffect(() => {
    document.body.style.overflow = (isMobile && open) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, open]);

  const lista   = tab === "hoje" ? hoje : semana;
  const temHoje = hoje.length > 0;

  const abrirWhatsApp = (m, id) => {
    try {
      if (m.link) {
        window.open(m.link, "_blank");
        setEnviados(p => ({ ...p, [id]: true }));
        return;
      }
      let tel = (m.telefone || "").replace(/\D/g, "");
      if (!tel) { alert("Telefone não disponível para " + m.nome); return; }
      const ddi = tel.startsWith("55") ? "" : "55";
      const msg = encodeURIComponent(
          `🎂 Paz seja contigo minha ovelhinha 🙏! Feliz Aniversário ${m.nome}!\n\nQue Deus abençoe sua vida, lhe conceda saúde, paz e prosperidade.\n\nCom carinho,\nPastores Renato e Jaci Soares 🙏`
      );
      window.open(`https://wa.me/${ddi}${tel}?text=${msg}`, "_blank");
      setEnviados(p => ({ ...p, [id]: true }));
    } catch { alert("Erro ao abrir WhatsApp"); }
  };

  // Conteúdo interno compartilhado
  const conteudoInterno = (
      <>
        {/* Cabeçalho */}
        <div style={{
          padding: "14px 16px 10px",
          borderBottom: `1px solid ${t.border}`,
          background: "rgba(201,169,110,.04)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(201,169,110,.1)", border: `1px solid ${t.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Cake size={16} color={AURA.gold} />
            </div>
            <div>
              <p style={{
                fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700,
                letterSpacing: ".18em", textTransform: "uppercase", color: AURA.gold, margin: 0,
              }}>
                ANIVERSARIANTES
              </p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: t.textSec, marginTop: 2 }}>
                {temHoje ? `🎂 ${hoje.length} hoje!` : "Nenhum hoje"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {["hoje", "semana"].map(tb => (
                <button key={tb} onClick={() => setTab(tb)} style={{
                  padding: "4px 10px", borderRadius: 8, cursor: "pointer",
                  fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600,
                  border: `1px solid ${tab === tb ? "rgba(201,169,110,.4)" : "transparent"}`,
                  background: tab === tb ? "rgba(201,169,110,.1)" : "transparent",
                  color: tab === tb ? AURA.gold : t.textMuted, transition: "all .18s",
                }}>
                  {tb === "hoje" ? "Hoje" : "Semana"}
                </button>
            ))}
            <button onClick={() => setOpen(false)} style={{
              width: 26, height: 26, borderRadius: 7, border: "none",
              background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: t.textMuted,
            }}>
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Lista — única área com scroll */}
        <div
            className="pp-sino-scroll"
            style={{
              flex: 1,
              minHeight: 0,        /* ← essencial para o scroll funcionar no flex */
              overflowY: "auto",
              overflowX: "hidden",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              WebkitOverflowScrolling: "touch",
            }}
        >
          {loading ? (
              <p style={{ textAlign: "center", padding: "28px 0", fontFamily: "'Inter',sans-serif", fontSize: 11, color: t.textMuted }}>
                Carregando…
              </p>
          ) : lista.length === 0 ? (
              <p style={{ textAlign: "center", padding: "28px 0", fontFamily: "'Inter',sans-serif", fontSize: 13, color: t.textMuted }}>
                🎂 Nenhum aniversariante {tab === "hoje" ? "hoje" : "essa semana"}.
              </p>
          ) : lista.map((m, i) => {
            const cor     = CORES_SINO[i % CORES_SINO.length];
            const isToday = tab === "hoje";
            const enviado = enviados[m.id];
            return (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "11px 12px", borderRadius: 13,
                  border: `1px solid ${isToday ? "rgba(201,169,110,.35)" : t.border}`,
                  background: isToday
                      ? "rgba(201,169,110,.05)"
                      : isDark ? "rgba(255,255,255,.02)" : "rgba(201,169,110,.02)",
                  borderLeft: isToday ? `3px solid ${AURA.gold}` : undefined,
                  flexShrink: 0,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: cor.bg, color: cor.text,
                    fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 600,
                    border: `2px solid ${isToday ? "rgba(201,169,110,.4)" : "rgba(128,128,128,.18)"}`,
                  }}>
                    {sinoInitials(m.nome)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      color: t.text, margin: 0,
                    }}>
                      {m.nome}
                    </p>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: t.textSec, marginTop: 1 }}>
                      📱 {m.telefone}
                    </p>
                    {isToday && (
                        <span style={{
                          fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 700,
                          letterSpacing: ".1em", padding: "2px 7px", borderRadius: 5,
                          background: "rgba(201,169,110,.1)", color: AURA.gold,
                          border: "1px solid rgba(201,169,110,.22)",
                          marginTop: 4, display: "inline-block",
                        }}>
                    🎂 HOJE!
                  </span>
                    )}
                  </div>
                  <button onClick={() => abrirWhatsApp(m, m.id)} style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    border: `1px solid ${enviado ? "rgba(5,150,105,.35)" : "rgba(37,211,102,.35)"}`,
                    background: enviado ? "rgba(5,150,105,.08)" : "rgba(37,211,102,.08)",
                    cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", transition: "all .18s",
                  }}>
                    {enviado ? <Check size={15} color="#059669" /> : <Send size={15} color="#25D366" />}
                  </button>
                </div>
            );
          })}
        </div>

        {/* Rodapé */}
        <div style={{
          padding: "8px 16px", flexShrink: 0,
          borderTop: `1px solid ${t.border}`,
          textAlign: "center",
          fontFamily: "'Inter',sans-serif", fontSize: 8,
          letterSpacing: ".16em", textTransform: "uppercase",
          color: t.textMuted, background: "rgba(201,169,110,.02)",
        }}>
          🙏 IEQ Pituaçu – Sistema Pastoral
        </div>
      </>
  );

  // Estilos base do painel
  const estiloBase = {
    background: t.bgEl,
    border: `1px solid ${t.border}`,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  return (
      <>
        {/* Botão sino */}
        <div ref={btnRef} style={{ display: "inline-flex" }}>
          <button
              className="pp-btn-ico"
              onClick={() => setOpen(o => !o)}
              aria-label="Aniversariantes"
              style={temHoje ? { borderColor: "rgba(201,169,110,.4)", color: AURA.gold } : {}}
          >
          <span className={temHoje && !open ? "pp-bell" : ""} style={{ display: "inline-flex" }}>
            <Bell size={15} style={{ color: temHoje ? AURA.gold : undefined }} />
          </span>
            {temHoje && (
                <span className="pp-badge" style={{
                  position: "absolute", top: -5, right: -5,
                  minWidth: 17, height: 17, borderRadius: 9,
                  background: AURA.red, color: "#fff",
                  fontSize: 9, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 4px", border: `2px solid ${isDark ? AURA.dark : AURA.light}`,
                  fontFamily: "'Inter', sans-serif",
                }}>
              {hoje.length}
            </span>
            )}
          </button>
        </div>

        {/* Portal — renderiza direto no body, fora do header */}
        {open && createPortal(
            <>
              {/* Overlay */}
              <div
                  onMouseDown={() => setOpen(false)}
                  style={{
                    position: "fixed", inset: 0,
                    background: isMobile ? "rgba(0,0,0,.5)" : "transparent",
                    zIndex: 9998,
                  }}
              />

              {/* Painel */}
              <div
                  ref={panelRef}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={isMobile ? "pp-sino-sheet" : "pp-sino-panel"}
                  style={{
                    ...estiloBase,
                    position: "fixed",
                    zIndex: 9999,
                    boxShadow: isDark
                        ? "0 16px 48px rgba(0,0,0,.7)"
                        : "0 8px 32px rgba(201,169,110,.22)",
                    // Mobile: bottom sheet
                    ...(isMobile ? {
                      bottom: 0, left: 0, right: 0,
                      width: "100%",
                      height: "90dvh",           /* ← height explícito: flex filho sabe até onde crescer */
                      borderRadius: "20px 20px 0 0",
                      borderBottom: "none",
                      boxShadow: "0 -8px 48px rgba(0,0,0,.4)",
                    } : {
                      // Desktop: centralizado horizontalmente, abaixo do header
                      top: 72,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "min(360px, calc(100vw - 20px))",
                      height: "min(460px, calc(100dvh - 100px))", /* ← height explícito */
                      borderRadius: 18,
                    }),
                  }}
              >
                {/* Handle de arraste (mobile) */}
                {isMobile && (
                    <div style={{
                      width: 36, height: 4, borderRadius: 2,
                      background: "rgba(201,169,110,.3)",
                      margin: "10px auto 4px",
                      flexShrink: 0,
                    }} />
                )}

                {conteudoInterno}
              </div>
            </>,
            document.body
        )}
      </>
  );
}

/* ─── Variantes de animação ───────────────────────────────────────── */
const PAGE_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18, ease: "easeOut" } },
  exit:    { opacity: 0, transition: { duration: 0.12, ease: "easeIn"  } },
};

/* ─── COMPONENTE PRINCIPAL ───────────────────────────────────────── */
export default function PastorPage() {
  const [celulas,       setCelulas]       = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [isDark,        setIsDark]        = useState(() => localStorage.getItem("theme") === "dark");
  const location = useLocation();

  const t = theme(isDark);

  useEffect(() => { localStorage.setItem("theme", isDark ? "dark" : "light"); }, [isDark]);

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

  if (loading) {
    return (
        <div className="pp-loading" style={{ background: t.bg }}>
          <GlobalStyles t={t} isDark={isDark} />
          <div className="pp-glow" />
          <div style={{ textAlign: "center", position: "relative", zIndex: 10 }}>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <div className="pp-ring pp-pulse" style={{ width: 80, height: 80, position: "absolute", border: "1px solid rgba(201,169,110,.25)", borderRadius: "50%" }} />
              <div className="pp-ring pp-pulse" style={{ width: 62, height: 62, position: "absolute", border: "1px solid rgba(201,169,110,.2)", borderRadius: "50%", animationDelay: ".9s" }} />
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: isDark ? "rgba(18,18,26,.99)" : "#fff", border: "1.5px solid rgba(201,169,110,.28)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
                <IEQCross size={36} />
              </div>
            </div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".25em", textTransform: "uppercase", color: AURA.gold, opacity: .7 }}>
              Carregando…
            </p>
          </div>
        </div>
    );
  }

  const pageTitle = getPageTitle();

  return (
      <div className="pp-root">
        <GlobalStyles t={t} isDark={isDark} />
        <div className="pp-glow" />

        {/* ════ HEADER ════ */}
        <header className="pp-header">
          <div className="pp-hdr-left">
            <div className="pp-avatar-wrap">
              <div className="pp-ring pp-pulse" style={{ width: 52, height: 52 }} />
              <div className="pp-ring pp-pulse" style={{ width: 40, height: 40, animationDelay: ".9s" }} />
              <div className="pp-avatar">
                {usuarioLogado?.fotoPerfil
                    ? <img src={usuarioLogado.fotoPerfil} alt={usuarioLogado.nome} />
                    : (usuarioLogado?.nome?.charAt(0).toUpperCase() || "P")
                }
              </div>
            </div>
            <div className="pp-title-block">
              <p className="pp-eyebrow">Painel Pastoral</p>
              <h1 className="pp-title">IEQ <span>Pituaçu</span></h1>
              <div className="pp-breadcrumb">
                <span className="pp-breadcrumb-seg">Pastoral</span>
                <ChevronRight size={9} style={{ color: "rgba(201,169,110,.4)", flexShrink: 0 }} />
                <span className="pp-breadcrumb-seg active">{pageTitle}</span>
              </div>
            </div>
          </div>

          <div className="pp-hdr-right">
            <div className="pp-stat-chips">
              <div className="pp-stat-chip">
                <p className="pp-stat-chip-label">Ativas</p>
                <p className="pp-stat-chip-val">{totalAtivas}</p>
              </div>
              <div className="pp-stat-chip">
                <p className="pp-stat-chip-label">Total</p>
                <p className="pp-stat-chip-val">{celulas.length}</p>
              </div>
            </div>

            <button className="pp-btn-ico" onClick={() => setIsDark(d => !d)} aria-label="Tema">
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

            <SinoPastor isDark={isDark} t={t} />

            <button
                className="pp-btn-exit"
                onClick={() => { localStorage.clear(); window.location.href = "/"; }}
            >
              <LogOut size={13} />
              <span className="pp-btn-exit-label">Sair</span>
            </button>
          </div>
        </header>

        {/* Linha gradiente decorativa */}
        <div className="pp-header-line" />

        {/* ════ NAV ════ */}
        <nav className="pp-nav" aria-label="Navegação pastoral">
          <div className="pp-nav-inner">
            {NAV_ITEMS.map(({ to, icon: Icon, label, color, end }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) => `pp-nav-tile${isActive ? " pp-active" : ""}`}
                    aria-label={label}
                >
                  {({ isActive }) => (
                      <>
                        <div
                            className="pp-tile-icon"
                            style={{ background: isActive ? `color-mix(in srgb, ${color} 18%, transparent)` : undefined }}
                        >
                          <Icon size={15} style={{ color: isActive ? color : undefined, transition: "color .25s" }} />
                        </div>
                        <span className="pp-tile-label" style={{ color: isActive ? color : undefined }}>
                    {label}
                  </span>
                        {isActive && <div className="pp-active-dot" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />}
                      </>
                  )}
                </NavLink>
            ))}
          </div>
        </nav>

        {/* ════ CONTEÚDO ════ */}
        <main className="pp-main">
          <div className="pp-content">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                  key={location.pathname}
                  className="pp-page-anim"
                  variants={PAGE_VARIANTS}
                  initial="initial"
                  animate="animate"
                  exit="exit"
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

                <p className="pp-footer">
                  © {new Date().getFullYear()} IEQ Pituaçu — Sistema Eclesiástico
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
  );
}
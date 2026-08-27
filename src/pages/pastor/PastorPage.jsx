import React, { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import api from "../../services/api.js";
import { getFotoUrl } from "../../utils/foto.js";
import { motion, AnimatePresence } from "framer-motion";

import PainelPastor               from "./PainelPastor";
import RelatorioCelula            from "./RelatorioCelula";
import SolicitacoesMultiplicacao  from "./SolicitacoesMultiplicacao";
import RankingCelulas             from "./RankingCelulas";
import PainelAlertas              from "./PainelAlertas";
import Discipulado                from "./Discipulado.jsx";
import TelaPendencias             from "./TelaPendencias.jsx";
import RelatorioMissao70Pastor    from "./RelatorioMissao70Pastor.jsx";
import RelatoriosDiscipuladoCelulas from "./RelatoriosDiscipuladoCelulas.jsx";
import RelatorioCultos              from "./RelatorioCultos.jsx";

import {
  LayoutDashboard, FileText, Users, Share2, Trophy,
  AlertTriangle, LogOut, Sun, Moon,
  ClipboardList, Flame, Activity,
  Cake, Bell, Send, Check, X, ChevronRight, UserCheck,
  ArrowLeft, Church,
} from "lucide-react";
import TelaCarregando from "../../components/TelaCarregando.jsx";

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
    bg:          isDark ? "#07070C"               : "#FAF8F4",
    bgEl:        isDark ? "rgba(18,18,26,.97)"     : "#FFFFFF",
    bgInput:     isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.10)"  : "rgba(201,169,110,.35)",
    borderInput: isDark ? "rgba(201,169,110,.15)"  : "rgba(201,169,110,.28)",
    text:        isDark ? "#F5F0E8"                : "#1A1008",
    textSec:     isDark ? "#9A9588"                : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"                : "#9A9080",
    gold:        isDark ? "#C9A96E"                : "#3D3218",
    goldSoft:    isDark ? "rgba(201,169,110,.06)"  : "rgba(122,101,48,.08)",
    goldHover:   isDark ? "rgba(201,169,110,.12)"  : "rgba(122,101,48,.14)",
    glow1:       isDark ? "rgba(201,169,110,.07)"  : "rgba(201,169,110,.10)",
    glow2:       isDark ? "rgba(201,169,110,.05)"  : "rgba(201,169,110,.08)",
    glow3:       isDark ? "rgba(155,11,30,.03)"    : "rgba(0,61,165,.04)",
    headerBg:    isDark ? "rgba(7,7,12,.92)"       : "rgba(247,243,238,.92)",
    cardHover:   isDark ? "rgba(201,169,110,.20)"  : "rgba(122,101,48,.20)",
    placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
  };
}

/* ─── Menu items ─────────────────────────────────────────────────── */
const MENU_ITEMS = [
  { icon: LayoutDashboard,           name: "Dashboard",     desc: "Visão Geral",    aba: "dashboard",              color: AURA.blue },
  { icon: FileText,                  name: "Relatórios",    desc: "Células",         aba: "relatorio-celulas",      color: AURA.red },
  { icon: Users,                     name: "Secretaria",    desc: "Discipulado",     aba: "discipulado",            color: "#8B5CF6" },
  { icon: UserCheck,                 name: "Discipulado",   desc: "Relatórios Cel.",  aba: "acompanhamento-discipulado", color: AURA.blue },
  { icon: Share2,                    name: "Multiplicação", desc: "Novas Células",   aba: "multiplicacoes",         color: "#059669" },
  { icon: Trophy,                    name: "Ranking",       desc: "Desempenho",      aba: "ranking-celulas",        color: AURA.yellow },
  { icon: Flame,                     name: "Missão 70",     desc: "Evangelismo",     aba: "missao70",               color: AURA.gold },
  { icon: ClipboardList,             name: "Pendências",    desc: "Itens Abertos",   aba: "pendencias",             color: "#F97316" },
  { icon: AlertTriangle,             name: "Alertas",       desc: "Notificações",    aba: "alertas",                color: AURA.red },
  { icon: Church,                    name: "Cultos",        desc: "Relatórios",      aba: "cultos",                 color: AURA.gold },
  { icon: Activity,                  name: "Painel",        desc: "Pastoral",        aba: "painel-pastoral",        color: AURA.gold, modal: true },
];

const PAGE_TITLES = {
  "dashboard":       "Dashboard Geral",
  "relatorio-celulas": "Relatórios de Células",
  "discipulado":     "Secretaria",
  "acompanhamento-discipulado": "Relatórios de Discipulado das Células",
  "multiplicacoes":  "Multiplicações",
  "ranking-celulas": "Ranking",
  "alertas":         "Alertas",
  "cultos":          "Relatório de Cultos",
  "pendencias":      "Pendências",
  "missao70":        "Missão 70",
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
        transition: background .4s, color .3s;
        isolation: isolate;
      }

      /* ── Vignette: sutil escurecimento nas bordas para profundidade ── */
      .pp-root::before {
        content: "";
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background: radial-gradient(ellipse at center, transparent 40%, ${isDark ? "rgba(0,0,0,.35)" : "rgba(0,0,0,.06)"} 100%);
        transition: background .4s;
      }

      .pp-glow {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 10% -5%, ${t.glow1} 0%, transparent 45%),
          radial-gradient(ellipse at 90% 105%, ${t.glow2} 0%, transparent 45%),
          radial-gradient(ellipse at 50% 50%, ${t.glow3} 0%, transparent 60%);
        transition: background .4s;
      }

      /* ── HEADER ── */
      .pp-header {
        position: sticky; top: 0; z-index: 50;
        background: ${t.headerBg};
        border-bottom: 1px solid ${isDark ? "rgba(201,169,110,.12)" : "rgba(201,169,110,.18)"};
        backdrop-filter: blur(32px) saturate(1.4);
        -webkit-backdrop-filter: blur(32px) saturate(1.4);
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 16px; height: 60px; gap: 10px;
        transition: background .4s, border-color .3s;
        box-shadow: 0 1px 0 ${isDark ? "rgba(201,169,110,.06)" : "rgba(201,169,110,.08)"};
      }
      @media(min-width:480px) { .pp-header { padding: 0 20px; height: 64px; } }

      .pp-header-line {
        height: 2px; position: sticky; top: 60px; z-index: 49;
        background: linear-gradient(90deg, ${AURA.redDark}, ${AURA.red}, ${AURA.yellow}, ${AURA.blue}, transparent);
        flex-shrink: 0;
        opacity: .85;
      }
      @media(min-width:480px) { .pp-header-line { top: 64px; } }

      .pp-hdr-left  { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; overflow: hidden; }
      .pp-hdr-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
      @media(min-width:480px) { .pp-hdr-right { gap: 8px; } }

      .pp-avatar-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .pp-ring {
        position: absolute; border-radius: 50%;
        border: 1px solid rgba(201,169,110,.18);
        top: 50%; left: 50%; transform: translate(-50%,-50%);
      }
      .pp-avatar {
        width: 38px; height: 38px; border-radius: 50%;
        border: 1.5px solid rgba(201,169,110,.30);
        background: ${isDark ? "rgba(14,14,22,.98)" : "#fff"};
        display: flex; align-items: center; justify-content: center; overflow: hidden;
        position: relative; z-index: 1;
        font-family: 'Playfair Display', serif; font-weight: 600; font-size: 15px; color: ${t.gold};
        flex-shrink: 0;
        box-shadow: 0 2px 10px ${isDark ? "rgba(201,169,110,.12)" : "rgba(201,169,110,.15)"};
      }
      .pp-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      @media(min-width:480px) { .pp-avatar { width: 44px; height: 44px; font-size: 16px; } }

      .pp-title-block { min-width: 0; overflow: hidden; }
      .pp-eyebrow {
        font-size: 8px; font-weight: 500; letter-spacing: .2em;
        text-transform: uppercase; color: ${isDark ? "rgba(201,169,110,.55)" : "#8B7A50"}; margin: 0 0 1px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      @media(min-width:480px) { .pp-eyebrow { font-size: 9px; margin-bottom: 2px; } }
      .pp-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(14px, 3.5vw, 20px);
        font-weight: 500; color: ${t.text}; margin: 0; line-height: 1.2;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .pp-title span { color: ${t.gold}; }
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
        border: 1px solid ${isDark ? "rgba(201,169,110,.10)" : "rgba(201,169,110,.15)"};
        text-align: center; min-width: 48px;
        backdrop-filter: blur(8px);
      }
      .pp-stat-chip-label {
        font-size: 8px; font-weight: 500; letter-spacing: .15em;
        text-transform: uppercase; color: ${isDark ? "rgba(201,169,110,.6)" : "#8B7A50"}; line-height: 1;
      }
      .pp-stat-chip-val {
        font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600;
        color: ${t.text}; line-height: 1.2;
      }

      .pp-btn-ico {
        background: ${isDark ? "rgba(255,255,255,.03)" : "rgba(201,169,110,.05)"};
        border: 1px solid ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.14)"};
        border-radius: 10px; width: 34px; height: 34px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        color: ${t.textMuted}; transition: all .25s; flex-shrink: 0; position: relative;
        backdrop-filter: blur(8px);
      }
      .pp-btn-ico:hover { border-color: ${t.gold}; color: ${t.gold}; background: ${t.goldHover}; }
      @media(min-width:480px) { .pp-btn-ico { width: 38px; height: 38px; border-radius: 12px; } }

      .pp-btn-back {
        background: ${isDark ? "rgba(255,255,255,.03)" : "rgba(30,63,102,.05)"};
        border: 1px solid ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.14)"};
        border-radius: 10px; width: 34px; height: 34px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        color: ${t.textMuted}; transition: all .25s; flex-shrink: 0;
        backdrop-filter: blur(8px);
      }
      .pp-btn-back:hover { border-color: ${t.gold}; color: ${t.gold}; background: ${t.goldHover}; }
      @media(min-width:480px) { .pp-btn-back { width: 38px; height: 38px; border-radius: 12px; } }

      .pp-btn-exit {
        display: flex; align-items: center; gap: 6px;
        padding: 0 12px; height: 34px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
        transition: all .3s cubic-bezier(.4,0,.2,1);
        box-shadow: 0 4px 16px rgba(200,16,46,.22), 0 1px 3px rgba(200,16,46,.15);
        white-space: nowrap; flex-shrink: 0;
      }
      .pp-btn-exit:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,16,46,.30), 0 2px 4px rgba(200,16,46,.18); }
      @media(min-width:480px) { .pp-btn-exit { padding: 0 14px; height: 38px; } }
      .pp-btn-exit-label { display: none; }
      @media(min-width:400px) { .pp-btn-exit-label { display: inline; } }

      /* ── MENU GRID ── */
      .pp-menu-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 22px;
      }
      @media(min-width:480px) { .pp-menu-grid { grid-template-columns: repeat(4, 1fr); gap: 12px; } }
      @media(min-width:768px) { .pp-menu-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; } }

      .pp-menu-card {
        position: relative;
        background: ${t.bgEl};
        border: 1px solid ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.14)"};
        border-radius: 18px;
        padding: 16px 12px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 10px;
        overflow: hidden;
        transition: all .3s cubic-bezier(.4,0,.2,1);
        -webkit-tap-highlight-color: transparent;
        box-shadow: 0 1px 3px ${isDark ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.06)"}, 0 4px 12px ${isDark ? "rgba(0,0,0,.2)" : "rgba(0,0,0,.04)"};
      }
      .pp-menu-card::before {
        content: "";
        position: absolute; inset: 0;
        opacity: 0;
        transition: opacity .35s;
        border-radius: inherit;
      }
      .pp-menu-card::after {
        content: "";
        position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, ${isDark ? "rgba(201,169,110,.12)" : "rgba(201,169,110,.18)"}, transparent);
        opacity: 0; transition: opacity .35s;
      }
      .pp-menu-card:hover {
        transform: translateY(-4px);
        border-color: rgba(201,169,110,.28);
        box-shadow:
          0 8px 32px ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.12)"},
          0 2px 8px ${isDark ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.08)"};
      }
      .pp-menu-card:hover::before { opacity: .07; }
      .pp-menu-card:hover::after  { opacity: 1; }
      @media(min-width:480px) {
        .pp-menu-card { padding: 20px 14px; border-radius: 20px; }
      }

      .pp-menu-icon {
        width: 44px; height: 44px; border-radius: 14px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: transform .3s cubic-bezier(.4,0,.2,1);
      }
      .pp-menu-card:hover .pp-menu-icon { transform: scale(1.08); }

      .pp-menu-name {
        font-family: 'Inter', sans-serif;
        font-size: 12px; font-weight: 600; color: ${t.text}; margin: 0;
        line-height: 1.3;
      }
      .pp-menu-desc {
        font-family: 'Inter', sans-serif;
        font-size: 10px; color: ${t.textMuted}; margin: 0;
        line-height: 1.2;
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
        color: ${isDark ? "rgba(245,240,232,.10)" : "rgba(26,16,8,.12)"};
        padding: 16px 0 8px;
        border-top: 1px solid ${isDark ? "rgba(201,169,110,.06)" : "rgba(201,169,110,.10)"};
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

  const conteudoInterno = (
      <>
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
              <Cake size={16} color={t.gold} />
            </div>
            <div>
              <p style={{
                fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700,
                letterSpacing: ".18em", textTransform: "uppercase", color: t.gold, margin: 0,
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
                  color: tab === tb ? t.gold : t.textMuted, transition: "all .18s",
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

        <div
            className="pp-sino-scroll"
            style={{
              flex: 1, minHeight: 0,
              overflowY: "auto", overflowX: "hidden",
              padding: "10px",
              display: "flex", flexDirection: "column", gap: 6,
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
                  borderLeft: isToday ? `3px solid ${t.gold}` : undefined,
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
                          background: t.goldSoft, color: t.gold,
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

  const estiloBase = {
    background: t.bg,
    border: `1px solid ${t.border}`,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  return (
      <>
        <div ref={btnRef} style={{ display: "inline-flex" }}>
          <button
              className="pp-btn-ico"
              onClick={() => setOpen(o => !o)}
              aria-label="Aniversariantes"
              style={temHoje ? { borderColor: t.goldHover, color: t.gold } : {}}
          >
          <span className={temHoje && !open ? "pp-bell" : ""} style={{ display: "inline-flex" }}>
            <Bell size={15} style={{ color: temHoje ? t.gold : undefined }} />
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

        {open && createPortal(
            <>
              <div
                  onMouseDown={() => setOpen(false)}
                  style={{
                    position: "fixed", inset: 0,
                    background: isDark ? "rgba(10,10,15,.5)" : "rgba(245,240,232,.5)",
                    zIndex: 9998,
                  }}
              />

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
                    ...(isMobile ? {
                      bottom: 0, left: 0, right: 0,
                      width: "100%",
                      height: "90dvh",
                      borderRadius: "20px 20px 0 0",
                      borderBottom: "none",
                      boxShadow: "0 -8px 48px rgba(0,0,0,.4)",
                    } : {
                      top: 72,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "min(360px, calc(100vw - 20px))",
                      height: "min(460px, calc(100dvh - 100px))",
                      borderRadius: 18,
                    }),
                  }}
              >
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

/* ─── COMPONENTE PRINCIPAL ───────────────────────────────────────── */
export default function PastorPage() {
  const [abaAtiva,     setAbaAtiva]     = useState("dashboard");
  const [showPainel,    setShowPainel]    = useState(false);
  const [celulas,       setCelulas]       = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [isDark,        setIsDark]        = useState(() => localStorage.getItem("theme") === "dark");

  const t = theme(isDark);

  useEffect(() => { localStorage.setItem("theme", isDark ? "dark" : "light"); }, [isDark]);

  useEffect(() => {
    if (abaAtiva !== "dashboard") window.history.pushState({ aba: abaAtiva }, "");
    const handlePopState = () => setAbaAtiva("dashboard");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [abaAtiva]);

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

  if (loading) {
    return (
        <div className="pp-loading" style={{ background: t.bg }}>
          <GlobalStyles t={t} isDark={isDark} />
          <div className="pp-glow" />
          <TelaCarregando isDark={isDark} minHeight="100vh" background="transparent" />
        </div>
    );
  }

  const pageTitle = PAGE_TITLES[abaAtiva] || PAGE_TITLES["dashboard"];

  return (
      <div className="pp-root">
        <GlobalStyles t={t} isDark={isDark} />
        <div className="pp-glow" />

        {/* ════ HEADER ════ */}
        <header className="pp-header">
          <div className="pp-hdr-left">
            {abaAtiva !== "dashboard" && (
                <button className="pp-btn-back" onClick={() => setAbaAtiva("dashboard")} title="Voltar">
                  <ArrowLeft size={16} />
                </button>
            )}
            <div className="pp-avatar-wrap">
              <div className="pp-ring pp-pulse" style={{ width: 52, height: 52 }} />
              <div className="pp-ring pp-pulse" style={{ width: 40, height: 40, animationDelay: ".9s" }} />
              <div className="pp-avatar">
                {usuarioLogado?.fotoPerfil
                    ? <img src={getFotoUrl(usuarioLogado.fotoPerfil)} alt={usuarioLogado.nome} />
                    : (usuarioLogado?.nome?.charAt(0).toUpperCase() || "P")
                }
              </div>
            </div>
            <div className="pp-title-block">
              <p className="pp-eyebrow">Painel Pastoral</p>
              <h1 className="pp-title">IEQ <span>Pituaçu</span></h1>
              <div className="pp-breadcrumb">
                <span className="pp-breadcrumb-seg">Pastoral</span>
                <ChevronRight size={9} style={{ color: t.textMuted, flexShrink: 0 }} />
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

        {/* ════ CONTEÚDO ════ */}
        <main className="pp-main">
          <div className="pp-content">
            <AnimatePresence mode="sync">
              {abaAtiva === "dashboard" ? (

                  <motion.div
                      key="dashboard"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: .3 } }}
                      exit={{ opacity: 0, transition: { duration: .2 } }}
                      style={{ display: "flex", flexDirection: "column" }}
                  >
                    {/* ════ MENU GRID ════ */}
                    <div className="pp-menu-grid">
                      {MENU_ITEMS.map(({ icon: Icon, name, desc, aba, color, modal }) => (
                          <motion.div
                              key={aba}
                              className="pp-menu-card"
                              whileHover={{ y: -5 }}
                              whileTap={{ scale: .96 }}
                              onClick={() => modal ? setShowPainel(true) : setAbaAtiva(aba)}
                          >
                            <style>{`.pp-menu-card:hover::before{ background: linear-gradient(135deg,${color}66,${color}); }`}</style>
                            <div className="pp-menu-icon" style={{ background: `${color}18`, color }}>
                              <Icon size={20} />
                            </div>
                            <div>
                              <p className="pp-menu-name">{name}</p>
                              <p className="pp-menu-desc">{desc}</p>
                            </div>
                          </motion.div>
                      ))}
                    </div>
                  </motion.div>

              ) : (

                  <motion.div
                      key={abaAtiva}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: .3 } }}
                      exit={{ opacity: 0, transition: { duration: .2 } }}
                  >
                    {abaAtiva === "relatorio-celulas"       && <RelatorioCelula           isDark={isDark} />}
                    {abaAtiva === "discipulado"             && <Discipulado               isDark={isDark} />}
                    {abaAtiva === "acompanhamento-discipulado" && <RelatoriosDiscipuladoCelulas isDark={isDark} />}
                    {abaAtiva === "multiplicacoes"          && <SolicitacoesMultiplicacao isDark={isDark} />}
                    {abaAtiva === "ranking-celulas"         && <RankingCelulas            isDark={isDark} />}
                    {abaAtiva === "alertas"                 && <PainelAlertas             isDark={isDark} />}
                    {abaAtiva === "cultos"                  && <RelatorioCultos           isDark={isDark} />}
                    {abaAtiva === "pendencias"              && <TelaPendencias            isDark={isDark} />}
                    {abaAtiva === "missao70"                && <RelatorioMissao70Pastor   isDark={isDark} />}
                  </motion.div>

              )}
            </AnimatePresence>

            <p className="pp-footer">
              © {new Date().getFullYear()} IEQ Pituaçu — Sistema Eclesiástico
            </p>
          </div>
        </main>

        {/* ════ MODAL PASTOR ════ */}
        {showPainel && createPortal(
            <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ position: "fixed", inset: 0, background: isDark ? "rgba(10,10,15,.88)" : "rgba(245,240,232,.88)", backdropFilter: "blur(4px)" }}
                  onClick={() => setShowPainel(false)}
              />
              <motion.div
                  initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "tween", duration: .28 }}
                  style={{
                    position: "relative", zIndex: 10,
                    width: "100%", maxWidth: 800, maxHeight: "88vh",
                    display: "flex", flexDirection: "column",
                    background: t.bg, border: `1px solid ${t.border}`,
                    borderRadius: "22px 22px 0 0", overflow: "hidden",
                  }}
              >
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 20px", borderBottom: `1px solid ${t.border}`,
                  background: isDark ? "rgba(201,169,110,.04)" : "rgba(201,169,110,.06)",
                  flexShrink: 0,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: "rgba(201,169,110,.1)", border: `1px solid ${t.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Activity size={16} color={t.gold} />
                    </div>
                    <div>
                      <p style={{
                        fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700,
                        letterSpacing: ".18em", textTransform: "uppercase", color: t.gold, margin: 0,
                      }}>
                        PAINEL PASTORAL
                      </p>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: t.textSec, marginTop: 2 }}>
                        Métricas e alertas do mês
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => setShowPainel(false)} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                      background: t.goldSoft,
                      color: t.gold,
                      fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 500,
                      transition: "all .25s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = t.goldHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = t.goldSoft; }}
                    >
                      <ArrowLeft size={14} />
                      Voltar
                    </button>
                    <button onClick={() => setShowPainel(false)} style={{
                      width: 30, height: 30, borderRadius: 8, border: "none",
                      background: "transparent", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: t.textMuted, transition: "all .2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = t.gold; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = t.textMuted; }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 16px" }}>
                  <PainelPastor isDark={isDark} />
                </div>
              </motion.div>
            </div>,
            document.body
        )}
      </div>
  );
}

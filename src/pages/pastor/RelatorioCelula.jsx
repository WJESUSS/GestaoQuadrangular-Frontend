import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import api from "../../services/api.js";
import {
    Download, Users, Calendar, BookOpen, AlertCircle,
    Loader2, Filter, ChevronDown, ChevronRight, Sparkles, X,
    UserCheck, MessageSquare, TrendingUp, UserPlus, Ban, AlertTriangle,
    Bell, BellRing, CheckCheck, Clock, Briefcase, Plane, HeartPulse, HelpCircle, UserX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── Tokens AURA (mesma identidade do Dashboard) ──────────────────────── */
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
        bgEl:        isDark ? "rgba(18,18,26,.95)"     : "rgba(255,255,255,.95)",
        bgInput:     isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.04)",
        border:      isDark ? "rgba(201,169,110,.1)"   : "rgba(201,169,110,.2)",
        borderInput: isDark ? "rgba(201,169,110,.15)"  : "rgba(201,169,110,.28)",
        text:        isDark ? "#F5F0E8"                : "#1A1008",
        textSec:     isDark ? "#9A9588"                : "#6B5E4A",
        textMuted:   isDark ? "#6B6658"                : "#9A9080",
        glow1:       isDark ? "rgba(201,169,110,.05)"  : "rgba(201,169,110,.08)",
        glow2:       isDark ? "rgba(201,169,110,.04)"  : "rgba(201,169,110,.06)",
        cardHover:   isDark ? "rgba(201,169,110,.2)"   : "rgba(201,169,110,.35)",
        placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
    };
}

/* ─── Taxonomias ────────────────────────────────────────────────────────── */
const MOTIVO_LABELS = {
    AUSENCIA_LIDER:     { label: "Ausência do líder",     icone: "👤" },
    PROBLEMA_CLIMATICO: { label: "Problema climático",    icone: "🌧️" },
    EVENTO_IGREJA:      { label: "Evento da igreja",      icone: "⛪" },
    PROBLEMA_SAUDE:     { label: "Problema de saúde",     icone: "🏥" },
    LOCAL_INDISPONIVEL: { label: "Local indisponível",    icone: "🔒" },
    VIAGEM_MEMBROS:     { label: "Viagem dos membros",    icone: "✈️" },
    CANCELADA_PASTOR:   { label: "Cancelada pelo pastor", icone: "✋" },
    OUTRO:              { label: "Outro motivo",           icone: "📋" },
};

const JUSTIFICATIVAS = {
    TRABALHO: { label: "Trabalho", icon: <Briefcase size={11} />, cor: "#6366F1", bg: "rgba(99,102,241,.1)",  borda: "rgba(99,102,241,.28)" },
    VIAGEM:   { label: "Viagem",   icon: <Plane     size={11} />, cor: "#0891B2", bg: "rgba(8,145,178,.1)",   borda: "rgba(8,145,178,.28)" },
    DOENCA:   { label: "Doença",   icon: <HeartPulse size={11} />, cor: "#DC2626", bg: "rgba(220,38,38,.1)",  borda: "rgba(220,38,38,.28)" },
    OUTROS:   { label: "Outros",   icon: <HelpCircle size={11} />, cor: "#D97706", bg: "rgba(217,119,6,.1)",  borda: "rgba(217,119,6,.28)" },
};

function getMotivoLabel(motivo) {
    return MOTIVO_LABELS[motivo] || { label: motivo || "Não informado", icone: "📋" };
}

function getJustificativaInfo(valor) {
    return JUSTIFICATIVAS[valor] || { label: valor || "Outro", icon: <HelpCircle size={11} />, cor: "#9A9080", bg: "rgba(154,144,128,.1)", borda: "rgba(154,144,128,.28)" };
}

function BadgeJustificativa({ valor }) {
    const cfg = getJustificativaInfo(valor);
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 9px", borderRadius: 99,
            background: cfg.bg, color: cfg.cor,
            border: `1px solid ${cfg.borda}`,
            fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".06em",
            whiteSpace: "nowrap", textTransform: "uppercase",
        }}>
      {cfg.icon} {cfg.label}
    </span>
    );
}

/* ─── Notificações (localStorage) ───────────────────────────────────────── */
const NOTIF_STORAGE_KEY = "ieq_pastor_notif_lidas";

function getNotifLidas() {
    try { return JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || "[]"); }
    catch { return []; }
}
function salvarNotifLida(id) {
    const lidas = getNotifLidas();
    if (!lidas.includes(id)) {
        lidas.push(id);
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(lidas));
    }
}
function marcarTodasLidas(ids) {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(ids));
}

/* ─── Estilos globais (consistentes com o Dashboard) ───────────────────── */
function GlobalStylesRel({ t, isDark }) {
    return (
        <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes rl-spin  { to { transform: rotate(360deg); } }
      @keyframes rl-pulse { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes rl-bell  {
        0%,100% { transform: rotate(0deg); }
        20%     { transform: rotate(-12deg); }
        40%     { transform: rotate(12deg); }
        60%     { transform: rotate(-8deg); }
        80%     { transform: rotate(8deg); }
      }
      .rl-spin  { animation: rl-spin 1s linear infinite; }
      .rl-pulse { animation: rl-pulse 3s ease-in-out infinite; }
      .rl-bell  { animation: rl-bell .6s ease infinite; }

      .rl-root {
        font-family: 'Inter', sans-serif;
        background: ${t.bg};
        color: ${t.text};
        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
        padding-bottom: max(40px, env(safe-area-inset-bottom, 40px));
        transition: background .3s, color .3s;
        isolation: isolate;
      }
      .rl-glow {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
          radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%);
      }
      .rl-content {
        position: relative; z-index: 1;
        max-width: 1100px; margin: 0 auto;
        padding: 8px 18px 0;
      }
      @media(max-width: 420px) { .rl-content { padding: 4px 14px 0; } }

      /* Header */
      .rl-header {
        display: flex; align-items: flex-start; justify-content: space-between;
        gap: 14px; margin-bottom: 22px; flex-wrap: wrap;
      }
      .rl-header-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
      .rl-eyebrow {
        font-size: 9px; font-weight: 600; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(201,169,110,.55);
        margin: 0 0 4px; display: flex; align-items: center; gap: 6px;
      }
      .rl-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(19px, 4.5vw, 26px);
        font-weight: 500; letter-spacing: .04em; margin: 0; line-height: 1.2;
        color: ${t.text};
      }
      .rl-header-actions {
        display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
      }

      /* Botões */
      .rl-btn-gold {
        display: flex; align-items: center; gap: 7px;
        padding: 11px 20px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight});
        color: #0A0A0F; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; transition: all .3s;
        box-shadow: 0 6px 22px rgba(201,169,110,.22); flex-shrink: 0;
      }
      .rl-btn-gold:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(201,169,110,.32); }
      .rl-btn-gold:disabled { opacity: .5; cursor: default; }
      .rl-btn-ghost {
        display: flex; align-items: center; gap: 7px;
        padding: 11px 18px; border-radius: 100px;
        border: 1px solid ${t.border}; cursor: pointer;
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        color: ${t.textSec};
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
        letter-spacing: .14em; text-transform: uppercase; transition: all .3s; flex-shrink: 0;
      }
      .rl-btn-ghost:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

      /* Notificação - sino */
      .rl-bell-btn {
        position: relative; display: flex; align-items: center; gap: 8px;
        padding: 11px 16px; border-radius: 100px; cursor: pointer; transition: all .25s; flex-shrink: 0;
      }
      .rl-bell-btn.active {
        background: linear-gradient(135deg, ${AURA.yellow}, #c8a010);
        border: none; color: #1A1008;
        box-shadow: 0 6px 20px rgba(253,184,19,.25);
      }
      .rl-bell-btn.inactive {
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${t.border}; color: ${t.textSec};
      }
      .rl-bell-btn.inactive:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }
      .rl-bell-count {
        background: #fff; color: #c8a010; border-radius: 99px;
        font-family: 'Inter',sans-serif; font-size: 10px; font-weight: 700;
        padding: 1px 7px; min-width: 20px; text-align: center;
      }

      /* Divider */
      .rl-divider {
        display: flex; align-items: center; gap: 10px; margin: 0 0 20px;
      }
      .rl-divider::before, .rl-divider::after {
        content: ''; flex: 1; height: 1px;
        background: linear-gradient(to right, transparent, ${AURA.gold});
      }
      .rl-divider::after { background: linear-gradient(to left, transparent, ${AURA.gold}); }
      .rl-divider-dot { width: 5px; height: 5px; border-radius: 50%; background: ${AURA.gold}; flex-shrink: 0; }

      /* Filtros */
      .rl-filters {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 20px; padding: 16px 18px; margin-bottom: 22px;
        display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
        backdrop-filter: blur(24px);
      }
      .rl-filter-label {
        font-size: 9px; font-weight: 600; letter-spacing: .2em;
        text-transform: uppercase; color: ${t.textMuted};
      }
      .rl-input {
        background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 11px 14px; border-radius: 12px; outline: none;
        font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
        transition: all .25s; min-width: 140px; flex: 1;
        -webkit-appearance: none; appearance: none;
        color-scheme: ${isDark ? "dark" : "light"};
      }
      .rl-input:focus {
        border-color: rgba(201,169,110,.5);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      @media(max-width: 560px) {
        .rl-filters { flex-direction: column; align-items: stretch; }
        .rl-input { width: 100%; }
      }

      /* KPI grid */
      .rl-kpi-grid {
        display: grid; grid-template-columns: repeat(5, 1fr);
        gap: 14px; margin-bottom: 26px;
      }
      @media(max-width: 880px) { .rl-kpi-grid { grid-template-columns: repeat(3, 1fr); } }
      @media(max-width: 520px) { .rl-kpi-grid { grid-template-columns: repeat(2, 1fr); } }

      .rl-kpi-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 18px; padding: 18px; display: flex;
        flex-direction: column; gap: 12px; backdrop-filter: blur(24px);
        position: relative; overflow: hidden;
      }
      .rl-kpi-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }
      .rl-kpi-icon {
        width: 40px; height: 40px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .rl-kpi-label {
        font-size: 8.5px; font-weight: 600; letter-spacing: .16em;
        text-transform: uppercase; color: ${t.textMuted}; margin: 0 0 2px;
      }
      .rl-kpi-value {
        font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 600;
        color: ${t.text}; margin: 0; line-height: 1;
      }
      .rl-kpi-card.hero {
        background: linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark});
        border: 1px solid rgba(201,169,110,.12);
      }
      .rl-kpi-card.hero .rl-kpi-label { color: rgba(255,255,255,.6); }
      .rl-kpi-card.hero .rl-kpi-value { color: #fff; }
      .rl-kpi-card.alert {
        background: linear-gradient(135deg, ${AURA.yellow}, #c8a010);
        border: none;
      }
      .rl-kpi-card.alert .rl-kpi-label { color: rgba(26,16,8,.65); }
      .rl-kpi-card.alert .rl-kpi-value { color: #1A1008; }

      /* Section header */
      .rl-section-hd {
        display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;
      }
      .rl-section-badge {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 8px 16px; border-radius: 100px;
        font-size: 9px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
      }
      .rl-section-line {
        flex: 1; height: 1px; min-width: 30px;
      }

      /* Cards de relatório */
      .rl-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 14px; margin-bottom: 30px;
      }
      @media(max-width: 480px) { .rl-grid { grid-template-columns: 1fr; } }

      .rl-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 18px; overflow: hidden; cursor: pointer;
        transition: all .3s cubic-bezier(.4,0,.2,1); backdrop-filter: blur(24px);
        position: relative; display: flex; flex-direction: column;
      }
      .rl-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
        z-index: 1;
      }
      .rl-card:hover {
        transform: translateY(-4px);
        border-color: ${t.cardHover};
        box-shadow: 0 14px 36px rgba(0,0,0,${isDark ? ".45" : ".1"});
      }
      .rl-card-strip { height: 4px; flex-shrink: 0; }
      .rl-card-body { padding: 18px 20px; flex: 1; }
      .rl-card-icon {
        width: 38px; height: 38px; border-radius: 10px;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .rl-card-title {
        font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 500;
        letter-spacing: .02em; color: ${t.text}; margin: 0;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .rl-card-date {
        font-size: 12px; font-weight: 400; color: ${t.textSec}; margin: 0;
        font-family: 'Inter',sans-serif;
      }
      .rl-card-tag {
        display: flex; align-items: center; gap: 8px;
        padding: 8px 11px; border-radius: 10px; font-size: 9px;
        font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
      }
      .rl-card-stats {
        display: grid; grid-template-columns: 1fr 1fr 1fr;
        border-top: 1px solid ${t.border};
      }
      .rl-card-stat {
        padding: 12px 8px; text-align: center;
      }
      .rl-card-stat + .rl-card-stat { border-left: 1px solid ${t.border}; }
      .rl-card-stat-value {
        font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; margin: 0;
      }
      .rl-card-stat-label {
        font-size: 7.5px; letter-spacing: .14em; text-transform: uppercase;
        color: ${t.textMuted}; margin: 3px 0 0;
      }
      .rl-card-footer {
        padding: 10px 20px; display: flex; align-items: center; justify-content: space-between;
        font-size: 9px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
        border-top: 1px solid ${t.border};
      }

      /* Empty state */
      .rl-empty {
        text-align: center; padding: 56px 28px;
        background: ${t.bgEl}; border: 1.5px dashed ${t.border};
        border-radius: 20px; margin-top: 6px; backdrop-filter: blur(24px);
      }
      .rl-empty p {
        font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 500;
        letter-spacing: .04em; color: ${t.textSec}; margin: 14px 0 0;
      }

      /* Modal */
      .rl-modal-backdrop {
        position: fixed; inset: 0; z-index: 999;
        display: flex; align-items: flex-end; justify-content: center;
      }
      @media(min-width: 640px) {
        .rl-modal-backdrop { align-items: center; padding: 16px; }
      }
      .rl-modal-overlay {
        position: fixed; inset: 0;
        background: rgba(10,10,15,.88); z-index: 0; backdrop-filter: blur(4px);
      }
      .rl-modal-box {
        position: relative; z-index: 10;
        width: 100%; max-height: 90vh;
        display: flex; flex-direction: column;
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 22px 22px 0 0; overflow: hidden;
      }
      @media(min-width: 640px) {
        .rl-modal-box { border-radius: 22px; max-width: 720px; max-height: calc(100vh - 32px); }
      }
      .rl-modal-head {
        padding: 20px 22px; flex-shrink: 0;
        display: flex; justify-content: space-between; align-items: center; gap: 12px;
        border-bottom: 1px solid ${t.border};
      }
      .rl-modal-body {
        overflow-y: auto; flex: 1; padding: 22px;
        display: flex; flex-direction: column; gap: 22px;
      }
      .rl-modal-section-title {
        font-size: 9px; font-weight: 600; letter-spacing: .2em;
        text-transform: uppercase; color: ${t.textMuted}; margin: 0 0 14px;
      }
      .rl-modal-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;
      }
      .rl-modal-pill {
        padding: 10px 14px; border-radius: 12px;
        font-family: 'Inter',sans-serif; font-size: 14px; font-weight: 300;
        background: ${isDark ? "rgba(255,255,255,.025)" : "rgba(201,169,110,.04)"};
        border: 1px solid ${isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.12)"};
        color: ${t.text};
      }
      .rl-modal-pill.muted {
        background: ${isDark ? "rgba(255,255,255,.015)" : "rgba(0,0,0,.02)"};
        border: 1px dashed ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"};
        color: ${t.textMuted};
      }
      .rl-list-row {
        display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;
        gap: 8px; padding: 12px 14px;
        background: ${isDark ? "rgba(255,255,255,.025)" : "rgba(201,169,110,.04)"};
        border: 1px solid ${isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.12)"};
        border-radius: 13px;
      }
      .rl-list-avatar {
        width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Playfair Display', serif; font-weight: 600; font-size: 15px;
      }

      .rl-decisao-badge {
        display: inline-block; padding: 3px 10px; border-radius: 99px;
        font-family: 'Inter',sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .08em;
        border: 1px solid; text-transform: uppercase;
      }

      /* Loading */
      .rl-loading {
        min-height: 60vh; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 16px;
      }
      .rl-ring {
        position: absolute; border-radius: 50%;
        border: 1px solid rgba(201,169,110,.22);
        top: 50%; left: 50%; transform: translate(-50%,-50%);
      }
    `}</style>
    );
}

/* ─── Painel de Notificações ────────────────────────────────────────────── */
function NotificacaoPanel({ naoRealizadas, isDark, t, onVerDetalhes }) {
    const [aberto, setAberto] = useState(false);
    const [lidas, setLidas] = useState(getNotifLidas);
    const panelRef = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) setAberto(false);
        }
        if (aberto) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [aberto]);

    const naoLidas = naoRealizadas.filter(r => !lidas.includes(r.id));
    const count = naoLidas.length;

    const handleMarcarLida = (id, e) => {
        e.stopPropagation();
        salvarNotifLida(id);
        setLidas(getNotifLidas());
    };

    const handleMarcarTodas = () => {
        const ids = naoRealizadas.map(r => r.id);
        marcarTodasLidas(ids);
        setLidas(getNotifLidas());
    };

    const formatarDataLocal = (dataStr) => {
        if (!dataStr) return "?";
        const [ano, mes, dia] = dataStr.split("-").map(Number);
        return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    };

    return (
        <div ref={panelRef} style={{ position: "relative" }}>
            <button
                className={`rl-bell-btn ${count > 0 ? "active" : "inactive"}`}
                onClick={() => setAberto(!aberto)}
            >
                {count > 0
                    ? <BellRing size={15} className="rl-bell" />
                    : <Bell size={15} />}
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: ".14em" }}>
            ALERTAS
          </span>
                {count > 0 && <span className="rl-bell-count">{count}</span>}
            </button>

            <AnimatePresence>
                {aberto && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: .97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: .97 }}
                        transition={{ duration: .18 }}
                        style={{
                            position: "absolute", top: "calc(100% + 10px)", right: 0,
                            width: "min(360px, 92vw)", maxHeight: 480,
                            background: t.bgEl, border: `1px solid ${t.border}`,
                            borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,.3)",
                            zIndex: 999, overflow: "hidden", display: "flex", flexDirection: "column",
                            backdropFilter: "blur(24px)",
                        }}
                    >
                        <div style={{
                            padding: "16px 18px",
                            background: `linear-gradient(135deg, ${AURA.yellow}, #c8a010)`,
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <BellRing size={16} style={{ color: "#1A1008" }} />
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, letterSpacing: ".16em", fontWeight: 700, color: "#1A1008", textTransform: "uppercase" }}>
                      Células não realizadas
                    </span>
                                {count > 0 && (
                                    <span style={{ background: "rgba(26,16,8,.18)", color: "#1A1008", borderRadius: 99, fontSize: 9, fontFamily: "'Inter',sans-serif", fontWeight: 700, padding: "2px 8px" }}>
                          {count} NOVA{count > 1 ? "S" : ""}
                        </span>
                                )}
                            </div>
                            {count > 0 && (
                                <button
                                    onClick={handleMarcarTodas}
                                    style={{ background: "rgba(26,16,8,.15)", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                                >
                                    <CheckCheck size={12} style={{ color: "#1A1008" }} />
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, letterSpacing: ".1em", color: "#1A1008", fontWeight: 600 }}>LI TUDO</span>
                                </button>
                            )}
                        </div>

                        <div style={{ overflowY: "auto", flex: 1 }}>
                            {naoRealizadas.length === 0 ? (
                                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                                    <CheckCheck size={28} style={{ color: t.textMuted, margin: "0 auto 10px" }} />
                                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, letterSpacing: ".12em", color: t.textSec, margin: 0, textTransform: "uppercase" }}>
                                        Nenhum alerta pendente
                                    </p>
                                </div>
                            ) : (
                                naoRealizadas.map((rel) => {
                                    const motivo = getMotivoLabel(rel.motivoNaoRealizacao);
                                    const isLida = lidas.includes(rel.id);
                                    return (
                                        <div
                                            key={rel.id}
                                            onClick={() => { onVerDetalhes(rel); setAberto(false); }}
                                            style={{
                                                padding: "14px 18px",
                                                borderBottom: `1px solid ${t.border}`,
                                                cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                                                background: isLida ? "transparent" : (isDark ? "rgba(253,184,19,.05)" : "rgba(253,184,19,.07)"),
                                                transition: "background .2s", position: "relative",
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(253,184,19,.1)" : "rgba(253,184,19,.12)"}
                                            onMouseLeave={e => e.currentTarget.style.background = isLida ? "transparent" : (isDark ? "rgba(253,184,19,.05)" : "rgba(253,184,19,.07)")}
                                        >
                                            {!isLida && (
                                                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${AURA.yellow}, #c8a010)`, borderRadius: "0 2px 2px 0" }} />
                                            )}
                                            <div style={{
                                                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                                                background: isLida ? (isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)") : "rgba(253,184,19,.14)",
                                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                                            }}>
                                                {motivo.icone}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 500, color: t.text, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {rel.nomeCelula}
                                                </p>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <Ban size={10} style={{ color: "#c8a010", flexShrink: 0 }} />
                                                    <p style={{ fontFamily: "'Inter',serif", fontSize: 9, letterSpacing: ".08em", color: "#c8a010", margin: 0, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {motivo.label}
                                                    </p>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                                                    <Clock size={9} style={{ color: t.textMuted }} />
                                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: t.textMuted }}>
                                    {formatarDataLocal(rel.dataReuniao)}
                                  </span>
                                                </div>
                                            </div>
                                            {!isLida && (
                                                <button
                                                    onClick={(e) => handleMarcarLida(rel.id, e)}
                                                    title="Marcar como lida"
                                                    style={{ background: "rgba(253,184,19,.15)", border: "1px solid rgba(253,184,19,.3)", borderRadius: 6, padding: "5px 7px", cursor: "pointer", flexShrink: 0 }}
                                                >
                                                    <CheckCheck size={12} style={{ color: "#c8a010" }} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {naoRealizadas.length > 0 && (
                            <div style={{ padding: "10px 18px", borderTop: `1px solid ${t.border}`, background: isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, letterSpacing: ".14em", color: t.textMuted, textTransform: "uppercase" }}>
                        {naoRealizadas.length - count} de {naoRealizadas.length} visualizadas
                      </span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Componente Principal ─────────────────────────────────────────────── */
export default function RelatorioCelula({ isDark = false }) {
    const [relatorios,  setRelatorios]  = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [erro,        setErro]        = useState(null);
    const [baixandoPDF, setBaixandoPDF] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRel, setSelectedRel] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataInicio,  setDataInicio]  = useState(new Date().toISOString().split("T")[0]);
    const [dataFim,     setDataFim]     = useState(new Date().toISOString().split("T")[0]);

    const t = theme(isDark);

    const formatarDataLocal = (dataStr) => {
        if (!dataStr) return "?";
        const [ano, mes, dia] = dataStr.split("-").map(Number);
        return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
    };

    const getDecisaoTexto = (d) => ({
        ACEITOU_JESUS: "Novo Convertido",
        RECONCILIOU:   "Reconciliação",
        BATISMO_AGUAS: "Deseja Batismo",
        NENHUMA:       "Nenhuma",
    }[d] || d || "—");

    const getDecisaoCor = (d) => {
        if (d === "ACEITOU_JESUS") return { background: "rgba(22,163,74,.12)",  color: "#16a34a", borderColor: "rgba(22,163,74,.3)" };
        if (d === "RECONCILIOU")   return { background: "rgba(14,165,233,.12)", color: "#0ea5e9", borderColor: "rgba(14,165,233,.3)" };
        if (d === "BATISMO_AGUAS") return { background: "rgba(139,92,246,.12)", color: "#8b5cf6", borderColor: "rgba(139,92,246,.3)" };
        return { background: "rgba(201,169,110,.1)", color: AURA.gold, borderColor: "rgba(201,169,110,.3)" };
    };

    const carregarSemanaAtual = () => {
        const hoje = new Date(); const diaSem = hoje.getDay();
        const diff = diaSem === 0 ? 6 : diaSem - 1;
        const seg = new Date(hoje); seg.setDate(hoje.getDate() - diff);
        const dom = new Date(seg); dom.setDate(seg.getDate() + 6);
        setDataInicio(seg.toISOString().split("T")[0]);
        setDataFim(dom.toISOString().split("T")[0]);
    };

    const carregarRelatorios = useCallback(async () => {
        try {
            setLoading(true); setErro(null);
            const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
            if (!token) return;
            const res = await api.get(`/relatorios/semana?inicio=${dataInicio}&fim=${dataFim}`,
                { headers: { Authorization: `Bearer ${token}` } });
            setRelatorios(Array.isArray(res.data) ? res.data : res.data?.relatorios || []);
        } catch { setErro("Erro ao buscar dados."); }
        finally   { setLoading(false); }
    }, [dataInicio, dataFim]);

    const { realizadas, naoRealizadas } = useMemo(() => ({
        realizadas:    relatorios.filter(r => r.realizada !== false),
        naoRealizadas: relatorios.filter(r => r.realizada === false),
    }), [relatorios]);

    const totais = useMemo(() => realizadas.reduce((acc, rel) => {
        const m = rel.membrosPresentes?.length || 0;
        const v = (rel.visitantesPresentes?.length || 0) + (rel.quantidadeVisitantes || 0);
        const justificadas = (rel.membrosAusentes || []).filter(a => a.justificativaFalta).length;
        return { membros: acc.membros + m, visitantes: acc.visitantes + v, geral: acc.geral + m + v, justificadas: acc.justificadas + justificadas };
    }, { membros: 0, visitantes: 0, geral: 0, justificadas: 0 }), [realizadas]);

    useEffect(() => { carregarSemanaAtual(); }, []);
    useEffect(() => { carregarRelatorios();  }, [carregarRelatorios]);

    const handleVerDetalhes = (rel) => {
        setSelectedRel(rel);
        setIsModalOpen(true);
    };

    const baixarPDF = () => {
        setBaixandoPDF(true);
        const doc = new jsPDF();
        doc.setFontSize(16); doc.setTextColor(0, 36, 112);
        doc.text("Relatório Geral de Células", 14, 20);
        doc.setFontSize(9); doc.setTextColor(100);
        doc.text(
            `Período: ${formatarDataLocal(dataInicio)} a ${formatarDataLocal(dataFim)}  |  Membros: ${totais.membros}  |  Visitantes: ${totais.visitantes}  |  Total: ${totais.geral}  |  Faltas justificadas: ${totais.justificadas}`,
            14, 28
        );
        autoTable(doc, {
            startY: 34,
            head: [["Célula", "Data", "Membros", "Visitas", "Total", "Estudo", "Faltas Just."]],
            body: realizadas.map(rel => [
                rel.nomeCelula,
                new Date(rel.dataReuniao).toLocaleDateString("pt-BR"),
                rel.membrosPresentes?.length || 0,
                (rel.visitantesPresentes?.length || 0) + (rel.quantidadeVisitantes || 0),
                (rel.membrosPresentes?.length || 0) + (rel.visitantesPresentes?.length || 0) + (rel.quantidadeVisitantes || 0),
                rel.estudo || "N/A",
                (rel.membrosAusentes || []).filter(a => a.justificativaFalta).length,
            ]),
            theme: "grid",
            headStyles: { fillColor: [0, 36, 112] },
        });

        if (naoRealizadas.length > 0) {
            const finalY = doc.lastAutoTable?.finalY || 60;
            doc.setFontSize(13); doc.setTextColor(139, 11, 31);
            doc.text("Células Não Realizadas", 14, finalY + 16);
            autoTable(doc, {
                startY: finalY + 22,
                head: [["Célula", "Data", "Motivo"]],
                body: naoRealizadas.map(rel => [
                    rel.nomeCelula,
                    new Date(rel.dataReuniao).toLocaleDateString("pt-BR"),
                    getMotivoLabel(rel.motivoNaoRealizacao).label,
                ]),
                theme: "grid",
                headStyles: { fillColor: [196, 140, 0] },
            });
        }

        const faltasComJustificativa = realizadas.flatMap(rel =>
            (rel.membrosAusentes || [])
                .filter(a => a.justificativaFalta)
                .map(a => [
                    rel.nomeCelula,
                    new Date(rel.dataReuniao).toLocaleDateString("pt-BR"),
                    a.nome || a.membroNome || `Membro #${a.membroId || a.id}`,
                    getJustificativaInfo(a.justificativaFalta).label,
                ])
        );
        if (faltasComJustificativa.length > 0) {
            const finalY2 = doc.lastAutoTable?.finalY || 60;
            doc.setFontSize(13); doc.setTextColor(196, 140, 0);
            doc.text("Faltas Justificadas", 14, finalY2 + 16);
            autoTable(doc, {
                startY: finalY2 + 22,
                head: [["Célula", "Data", "Membro", "Justificativa"]],
                body: faltasComJustificativa,
                theme: "grid",
                headStyles: { fillColor: [196, 140, 0] },
            });
        }

        const todasDecisoes = realizadas.flatMap(rel =>
            (rel.visitantesPresentes || [])
                .filter(v => v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA")
                .map(v => [rel.nomeCelula, v.nome, getDecisaoTexto(v.decisaoEspiritual)])
        );
        if (todasDecisoes.length > 0) {
            doc.addPage();
            doc.setFontSize(13); doc.setTextColor(0, 36, 112);
            doc.text("Decisões Espirituais da Semana", 14, 20);
            autoTable(doc, {
                startY: 28,
                head: [["Célula", "Visitante", "Decisão"]],
                body: todasDecisoes,
                theme: "grid",
                headStyles: { fillColor: [139, 11, 31] },
            });
        }
        doc.save("relatorio-celulas.pdf");
        setBaixandoPDF(false);
    };

    if (loading) return (
        <div className="rl-root" style={{ minHeight: "60vh" }}>
            <GlobalStylesRel t={t} isDark={isDark} />
            <div className="rl-glow" />
            <div className="rl-loading">
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="rl-ring rl-pulse" style={{ width: 80, height: 80, position: "absolute", border: "1px solid rgba(201,169,110,.25)", borderRadius: "50%" }} />
                    <div className="rl-ring rl-pulse" style={{ width: 62, height: 62, position: "absolute", border: "1px solid rgba(201,169,110,.2)", borderRadius: "50%", animationDelay: ".9s" }} />
                    <Loader2 size={28} className="rl-spin" style={{ color: AURA.gold, position: "relative", zIndex: 1 }} />
                </div>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".25em", textTransform: "uppercase", color: AURA.gold, opacity: .7, margin: 0 }}>
                    Sincronizando relatórios…
                </p>
            </div>
        </div>
    );

    return (
        <div className="rl-root">
            <GlobalStylesRel t={t} isDark={isDark} />
            <div className="rl-glow" />

            <div className="rl-content">

                {/* Header */}
                <motion.div className="rl-header" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
                    <div className="rl-header-left">
                        <div>
                            <p className="rl-eyebrow"><Sparkles size={11} style={{ color: AURA.gold }} /> Gestão de Crescimento</p>
                            <h2 className="rl-title">Relatórios da Rede</h2>
                        </div>
                    </div>

                    <div className="rl-header-actions">
                        <NotificacaoPanel
                            naoRealizadas={naoRealizadas}
                            isDark={isDark}
                            t={t}
                            onVerDetalhes={handleVerDetalhes}
                        />
                        <button className="rl-btn-ghost" onClick={() => setShowFilters(!showFilters)}>
                            <Filter size={14} /> {showFilters ? "Ocultar" : "Filtrar"}
                        </button>
                        <button className="rl-btn-gold" onClick={baixarPDF} disabled={baixandoPDF || relatorios.length === 0}>
                            {baixandoPDF ? <Loader2 size={14} className="rl-spin" /> : <Download size={14} />}
                            Exportar PDF
                        </button>
                    </div>
                </motion.div>

                <div className="rl-divider"><div className="rl-divider-dot" /></div>

                {/* Filtros */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: "hidden" }}
                        >
                            <div className="rl-filters">
                                <span className="rl-filter-label">De</span>
                                <input className="rl-input" type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                                <span className="rl-filter-label">Até</span>
                                <input className="rl-input" type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                                <button className="rl-btn-ghost" onClick={carregarSemanaAtual} style={{ flex: "0 0 auto" }}>Esta Semana</button>
                                <button className="rl-btn-gold" onClick={carregarRelatorios} style={{ flex: "0 0 auto" }}>Aplicar</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {erro && (
                    <div className="rl-empty" style={{ marginBottom: 22, padding: "20px 24px" }}>
                        <AlertCircle size={28} style={{ color: AURA.red }} />
                        <p style={{ color: t.textSec }}>{erro}</p>
                    </div>
                )}

                {/* KPIs */}
                <div className="rl-kpi-grid">
                    <div className="rl-kpi-card">
                        <div className="rl-kpi-icon" style={{ background: "rgba(200,16,46,.1)" }}>
                            <Users size={20} style={{ color: AURA.red }} />
                        </div>
                        <div>
                            <p className="rl-kpi-label">Total Membros</p>
                            <p className="rl-kpi-value">{totais.membros}</p>
                        </div>
                    </div>

                    <div className="rl-kpi-card">
                        <div className="rl-kpi-icon" style={{ background: "rgba(201,169,110,.12)" }}>
                            <UserPlus size={20} style={{ color: AURA.gold }} />
                        </div>
                        <div>
                            <p className="rl-kpi-label">Total Visitantes</p>
                            <p className="rl-kpi-value">{totais.visitantes}</p>
                        </div>
                    </div>

                    <div className="rl-kpi-card hero">
                        <div className="rl-kpi-icon" style={{ background: "rgba(255,255,255,.15)" }}>
                            <TrendingUp size={20} style={{ color: "#fff" }} />
                        </div>
                        <div>
                            <p className="rl-kpi-label">Total Geral</p>
                            <p className="rl-kpi-value">{totais.geral}</p>
                        </div>
                    </div>

                    <div className="rl-kpi-card">
                        <div className="rl-kpi-icon" style={{ background: "rgba(99,102,241,.1)" }}>
                            <UserX size={20} style={{ color: "#6366F1" }} />
                        </div>
                        <div>
                            <p className="rl-kpi-label">Faltas Justif.</p>
                            <p className="rl-kpi-value">{totais.justificadas}</p>
                        </div>
                    </div>

                    <div className={`rl-kpi-card ${naoRealizadas.length > 0 ? "alert" : ""}`}>
                        <div className="rl-kpi-icon" style={{ background: naoRealizadas.length > 0 ? "rgba(26,16,8,.12)" : "rgba(201,169,110,.12)" }}>
                            <Ban size={20} style={{ color: naoRealizadas.length > 0 ? "#1A1008" : AURA.gold }} />
                        </div>
                        <div>
                            <p className="rl-kpi-label">Não Realizadas</p>
                            <p className="rl-kpi-value">{naoRealizadas.length}</p>
                        </div>
                    </div>
                </div>

                {/* CÉLULAS NÃO REALIZADAS */}
                {naoRealizadas.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="rl-section-hd">
                  <span className="rl-section-badge" style={{ background: "rgba(253,184,19,.12)", border: "1px solid rgba(253,184,19,.3)", color: "#c8a010" }}>
                    <AlertTriangle size={13} /> Não Realizadas — {naoRealizadas.length}
                  </span>
                            <div className="rl-section-line" style={{ background: "linear-gradient(90deg, rgba(253,184,19,.3), transparent)" }} />
                        </div>

                        <div className="rl-grid">
                            {naoRealizadas.map((rel, i) => {
                                const motivo = getMotivoLabel(rel.motivoNaoRealizacao);
                                return (
                                    <motion.div key={rel.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .05 }}
                                                className="rl-card" onClick={() => handleVerDetalhes(rel)}>
                                        <div className="rl-card-strip" style={{ background: `linear-gradient(90deg, #c8a010, ${AURA.yellow})` }} />
                                        <div className="rl-card-body">
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 8 }}>
                                                <div className="rl-card-icon" style={{ background: "rgba(253,184,19,.14)", fontSize: 18 }}>
                                                    {motivo.icone}
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <p style={{ fontSize: 8, letterSpacing: ".1em", color: t.textMuted, margin: "0 0 2px", textTransform: "uppercase", fontWeight: 600 }}>Data</p>
                                                    <p className="rl-card-date">{formatarDataLocal(rel.dataReuniao)}</p>
                                                </div>
                                            </div>
                                            <h3 className="rl-card-title" style={{ marginBottom: 10 }}>{rel.nomeCelula}</h3>
                                            <div className="rl-card-tag" style={{ background: "rgba(253,184,19,.1)", border: "1px solid rgba(253,184,19,.25)", color: "#c8a010" }}>
                                                <Ban size={12} /> {motivo.label}
                                            </div>
                                        </div>
                                        <div className="rl-card-footer" style={{ color: "#c8a010" }}>
                                            <span>Ver Detalhes</span>
                                            <ChevronRight size={13} />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* CÉLULAS REALIZADAS */}
                {realizadas.length > 0 && (
                    <>
                        <div className="rl-section-hd">
                  <span className="rl-section-badge" style={{ background: "rgba(201,169,110,.1)", border: "1px solid rgba(201,169,110,.25)", color: AURA.gold }}>
                    <Calendar size={13} /> Realizadas — {realizadas.length}
                  </span>
                            <div className="rl-section-line" style={{ background: "linear-gradient(90deg, rgba(201,169,110,.25), transparent)" }} />
                        </div>

                        <div className="rl-grid">
                            {realizadas.map((rel, i) => {
                                const m = rel.membrosPresentes?.length || 0;
                                const v = (rel.visitantesPresentes?.length || 0) + (rel.quantidadeVisitantes || 0);
                                const decisoes = (rel.visitantesPresentes || []).filter(vt => vt.decisaoEspiritual && vt.decisaoEspiritual !== "NENHUMA");
                                const ausentesJustificados = (rel.membrosAusentes || []).filter(a => a.justificativaFalta);
                                return (
                                    <motion.div key={rel.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .04 }}
                                                className="rl-card" onClick={() => handleVerDetalhes(rel)}>
                                        <div className="rl-card-body" style={{ paddingBottom: 14 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 8 }}>
                                                <div className="rl-card-icon" style={{ background: "rgba(201,169,110,.12)" }}>
                                                    <Calendar size={17} style={{ color: AURA.gold }} />
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <p style={{ fontSize: 8, letterSpacing: ".1em", color: t.textMuted, margin: "0 0 2px", textTransform: "uppercase", fontWeight: 600 }}>Data da Célula</p>
                                                    <p className="rl-card-date">{formatarDataLocal(rel.dataReuniao)}</p>
                                                </div>
                                            </div>
                                            <h3 className="rl-card-title" style={{ marginBottom: 10 }}>{rel.nomeCelula}</h3>
                                            <div className="rl-card-tag" style={{
                                                background: isDark ? "rgba(255,255,255,.03)" : "rgba(201,169,110,.06)",
                                                border: `1px solid ${t.border}`, color: t.textSec, marginBottom: (decisoes.length > 0 || ausentesJustificados.length > 0) ? 8 : 0,
                                            }}>
                                                <BookOpen size={12} style={{ flexShrink: 0 }} />
                                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {rel.estudo || "Sem estudo informado"}
                              </span>
                                            </div>
                                            {decisoes.length > 0 && (
                                                <div className="rl-card-tag" style={{ background: "rgba(253,184,19,.08)", border: "1px solid rgba(253,184,19,.2)", color: "#c8a010", marginBottom: ausentesJustificados.length > 0 ? 8 : 0 }}>
                                                    <Sparkles size={12} style={{ flexShrink: 0 }} />
                                                    {decisoes.length} decisão{decisoes.length > 1 ? "ões" : ""} espiritual{decisoes.length > 1 ? "is" : ""}
                                                </div>
                                            )}
                                            {ausentesJustificados.length > 0 && (
                                                <div className="rl-card-tag" style={{ background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.2)", color: "#6366F1" }}>
                                                    <UserX size={12} style={{ flexShrink: 0 }} />
                                                    {ausentesJustificados.length} falta{ausentesJustificados.length > 1 ? "s" : ""} justificada{ausentesJustificados.length > 1 ? "s" : ""}
                                                </div>
                                            )}
                                        </div>
                                        <div className="rl-card-stats">
                                            {[
                                                { label: "Membros", value: m,   color: t.text },
                                                { label: "Visitas", value: v,   color: AURA.gold },
                                                { label: "Total",   value: m+v, color: AURA.blue },
                                            ].map((kpi, ki) => (
                                                <div key={ki} className="rl-card-stat">
                                                    <p className="rl-card-stat-value" style={{ color: kpi.color }}>{kpi.value}</p>
                                                    <p className="rl-card-stat-label">{kpi.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="rl-card-footer" style={{ color: AURA.gold }}>
                                            <span>Ver Detalhes</span>
                                            <ChevronRight size={13} />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}

                {relatorios.length === 0 && !loading && !erro && (
                    <div className="rl-empty">
                        <AlertCircle size={36} style={{ color: t.textMuted }} />
                        <p>Nenhum relatório encontrado</p>
                    </div>
                )}
            </div>

            {/* MODAL DETALHES */}
            <AnimatePresence>
                {isModalOpen && selectedRel && createPortal((() => {
                    const naoRealizada = selectedRel.realizada === false;
                    const motivo = naoRealizada ? getMotivoLabel(selectedRel.motivoNaoRealizacao) : null;
                    const comDecisao = (selectedRel.visitantesPresentes || [])
                        .filter(v => v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA");
                    const ausentesJustificados = (selectedRel.membrosAusentes || []).filter(a => a.justificativaFalta);
                    const ausentesSemJustificativa = (selectedRel.membrosAusentes || []).filter(a => !a.justificativaFalta);

                    return (
                        <div className="rl-modal-backdrop">
                            <motion.div className="rl-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} />
                            <motion.div className="rl-modal-box" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "tween", duration: .28 }}>

                                <div className="rl-modal-head" style={{
                                    background: naoRealizada
                                        ? `linear-gradient(135deg, ${AURA.yellow}, #c8a010)`
                                        : `linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark})`,
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                                        <div style={{ width: 44, height: 44, background: "rgba(255,255,255,.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: naoRealizada ? 22 : undefined, flexShrink: 0 }}>
                                            {naoRealizada ? <span>{motivo.icone}</span> : <UserCheck size={22} style={{ color: "#fff" }} />}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 500, letterSpacing: ".02em", color: naoRealizada ? "#1A1008" : "#fff", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {selectedRel.nomeCelula}
                                            </h3>
                                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, letterSpacing: ".08em", color: naoRealizada ? "rgba(26,16,8,.7)" : "rgba(255,255,255,.7)", margin: 0, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                                {formatarDataLocal(selectedRel.dataReuniao)}
                                                {naoRealizada && (
                                                    <span style={{ background: "rgba(26,16,8,.15)", padding: "2px 8px", borderRadius: 99, fontSize: 9, textTransform: "uppercase", fontWeight: 600 }}>
                                  ✕ Não Realizada
                                </span>
                                                )}
                                                {!naoRealizada && comDecisao.length > 0 && (
                                                    <span style={{ background: "rgba(253,184,19,.25)", color: AURA.yellow, padding: "2px 8px", borderRadius: 99, fontSize: 9, textTransform: "uppercase", fontWeight: 600 }}>
                                  ✦ {comDecisao.length} Decisão{comDecisao.length > 1 ? "ões" : ""}
                                </span>
                                                )}
                                                {!naoRealizada && ausentesJustificados.length > 0 && (
                                                    <span style={{ background: "rgba(99,102,241,.25)", color: "#c7c9fb", padding: "2px 8px", borderRadius: 99, fontSize: 9, textTransform: "uppercase", fontWeight: 600 }}>
                                  ⊘ {ausentesJustificados.length} Falta{ausentesJustificados.length > 1 ? "s" : ""} Justif.
                                </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)}
                                            style={{ background: "rgba(255,255,255,.18)", border: "none", color: naoRealizada ? "#1A1008" : "#fff", padding: 10, borderRadius: 8, cursor: "pointer", flexShrink: 0, display: "flex" }}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="rl-modal-body">
                                    {naoRealizada && (
                                        <div style={{ padding: 24, background: isDark ? "rgba(253,184,19,.06)" : "rgba(253,184,19,.08)", border: "1px solid rgba(253,184,19,.25)", borderRadius: 16, textAlign: "center" }}>
                                            <div style={{ fontSize: 48, marginBottom: 12 }}>{motivo.icone}</div>
                                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, letterSpacing: ".2em", color: "#c8a010", fontWeight: 700, margin: "0 0 6px", textTransform: "uppercase" }}>
                                                Motivo da Ausência
                                            </p>
                                            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: t.text, margin: "0 0 20px", fontWeight: 500 }}>
                                                {motivo.label}
                                            </p>
                                            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "rgba(253,184,19,.12)", border: "1px solid rgba(253,184,19,.3)", borderRadius: 99, fontFamily: "'Inter',sans-serif", fontSize: 9, letterSpacing: ".14em", color: "#c8a010", textTransform: "uppercase", fontWeight: 600 }}>
                                                <Ban size={12} /> Célula não realizada nesta data
                                            </div>
                                        </div>
                                    )}

                                    {!naoRealizada && (
                                        <>
                                            {comDecisao.length > 0 && (
                                                <div style={{ padding: "18px 20px", background: isDark ? "rgba(253,184,19,.06)" : "rgba(253,184,19,.08)", border: "1px solid rgba(253,184,19,.25)", borderRadius: 16 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                                        <Sparkles size={15} style={{ color: "#c8a010" }} />
                                                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, letterSpacing: ".18em", color: "#c8a010", fontWeight: 700, textTransform: "uppercase" }}>
                                      Decisões Espirituais ({comDecisao.length})
                                    </span>
                                                    </div>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                                        {comDecisao.map((v, i) => (
                                                            <div key={i} className="rl-list-row" style={{ border: `1px solid ${getDecisaoCor(v.decisaoEspiritual).borderColor}` }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                                                    <div className="rl-list-avatar" style={{ background: `${getDecisaoCor(v.decisaoEspiritual).color}18`, color: getDecisaoCor(v.decisaoEspiritual).color }}>
                                                                        {v.nome.charAt(0)}
                                                                    </div>
                                                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 400, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.nome}</span>
                                                                </div>
                                                                <span className="rl-decisao-badge" style={getDecisaoCor(v.decisaoEspiritual)}>
                                            {getDecisaoTexto(v.decisaoEspiritual)}
                                          </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {ausentesJustificados.length > 0 && (
                                                <div style={{ padding: "18px 20px", background: isDark ? "rgba(99,102,241,.06)" : "rgba(99,102,241,.07)", border: "1px solid rgba(99,102,241,.25)", borderRadius: 16 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                                        <UserX size={15} style={{ color: "#6366F1" }} />
                                                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, letterSpacing: ".18em", color: "#6366F1", fontWeight: 700, textTransform: "uppercase" }}>
                                      Faltas Justificadas ({ausentesJustificados.length})
                                    </span>
                                                    </div>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                                        {ausentesJustificados.map((a, i) => (
                                                            <div key={i} className="rl-list-row" style={{ border: `1px solid ${getJustificativaInfo(a.justificativaFalta).borda}` }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                                                    <div className="rl-list-avatar" style={{ background: `${getJustificativaInfo(a.justificativaFalta).cor}18`, color: getJustificativaInfo(a.justificativaFalta).cor }}>
                                                                        {(a.nome || a.membroNome || "?").charAt(0)}
                                                                    </div>
                                                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 400, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                              {a.nome || a.membroNome || `Membro #${a.membroId || a.id}`}
                                            </span>
                                                                </div>
                                                                <BadgeJustificativa valor={a.justificativaFalta} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <p className="rl-modal-section-title">Membros Presentes ({selectedRel.membrosPresentes?.length || 0})</p>
                                                <div className="rl-modal-grid">
                                                    {selectedRel.membrosPresentes?.map((m, i) => (
                                                        <div key={i} className="rl-modal-pill">{m.nome || m}</div>
                                                    ))}
                                                </div>
                                            </div>

                                            {ausentesSemJustificativa.length > 0 && (
                                                <div>
                                                    <p className="rl-modal-section-title">Ausentes sem Justificativa ({ausentesSemJustificativa.length})</p>
                                                    <div className="rl-modal-grid">
                                                        {ausentesSemJustificativa.map((a, i) => (
                                                            <div key={i} className="rl-modal-pill muted">
                                                                {a.nome || a.membroNome || `Membro #${a.membroId || a.id}`}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedRel.visitantesPresentes?.length > 0 && (
                                                <div>
                                                    <p className="rl-modal-section-title" style={{ color: "#c8a010" }}>Visitantes ({selectedRel.visitantesPresentes.length})</p>
                                                    <div className="rl-modal-grid">
                                                        {selectedRel.visitantesPresentes.map((v, i) => (
                                                            <div key={i} style={{ padding: "12px 14px", background: isDark ? "rgba(253,184,19,.06)" : "rgba(253,184,19,.08)", border: "1px solid rgba(253,184,19,.2)", borderRadius: 12 }}>
                                                                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 500, letterSpacing: ".02em", color: t.text, margin: "0 0 6px" }}>{v.nome}</p>
                                                                <span className="rl-decisao-badge" style={getDecisaoCor(v.decisaoEspiritual)}>
                                            {getDecisaoTexto(v.decisaoEspiritual)}
                                          </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedRel.observacoes && (
                                                <div style={{ padding: "16px 18px", background: isDark ? "rgba(255,255,255,.03)" : "rgba(201,169,110,.05)", border: `1px solid ${t.border}`, borderRadius: 14 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                        <MessageSquare size={14} style={{ color: AURA.gold }} />
                                                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, letterSpacing: ".14em", color: AURA.gold, textTransform: "uppercase", fontWeight: 600 }}>Observações do Líder</span>
                                                    </div>
                                                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontStyle: "italic", fontWeight: 300, color: t.textSec, margin: 0 }}>
                                                        "{selectedRel.observacoes}"
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    );
                })(), document.body)}
            </AnimatePresence>
        </div>
    );
}
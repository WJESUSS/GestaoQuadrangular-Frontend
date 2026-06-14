import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import api from "../../services/api.js";
import {
    Download, Users, Calendar, BookOpen, AlertCircle,
    Loader2, Filter, ChevronRight, Sparkles, X,
    UserCheck, MessageSquare, TrendingUp, UserPlus, Ban, AlertTriangle,
    Bell, BellRing, CheckCheck, Clock, Briefcase, Plane, HeartPulse, HelpCircle, UserX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AURA = {
    gold: "#C9A96E", goldLight: "#E8D5A3", dark: "#0A0A0F", darkEl: "#12121A",
    light: "#F5F0E8", red: "#C8102E", redDark: "#9B0B1E", blue: "#003DA5",
    blueDark: "#002470", yellow: "#FDB813",
};

function theme(isDark) {
    return {
        bg:          isDark ? "#0A0A0F"              : "#F5F0E8",
        bgEl:        isDark ? "rgba(18,18,26,.97)"   : "rgba(255,255,255,.97)",
        bgInput:     isDark ? "rgba(255,255,255,.05)": "rgba(0,0,0,.04)",
        border:      isDark ? "rgba(201,169,110,.1)" : "rgba(201,169,110,.2)",
        borderInput: isDark ? "rgba(201,169,110,.18)": "rgba(201,169,110,.28)",
        text:        isDark ? "#F5F0E8"              : "#1A1008",
        textSec:     isDark ? "#9A9588"              : "#6B5E4A",
        textMuted:   isDark ? "#6B6658"              : "#9A9080",
        glow1:       isDark ? "rgba(201,169,110,.05)": "rgba(201,169,110,.08)",
        glow2:       isDark ? "rgba(201,169,110,.04)": "rgba(201,169,110,.06)",
        cardHover:   isDark ? "rgba(201,169,110,.2)" : "rgba(201,169,110,.35)",
    };
}

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
    TRABALHO: { label: "Trabalho",  icon: <Briefcase  size={11} />, cor: "#6366F1", bg: "rgba(99,102,241,.1)",  borda: "rgba(99,102,241,.28)" },
    VIAGEM:   { label: "Viagem",    icon: <Plane      size={11} />, cor: "#0891B2", bg: "rgba(8,145,178,.1)",   borda: "rgba(8,145,178,.28)" },
    DOENCA:   { label: "Doença",    icon: <HeartPulse size={11} />, cor: "#DC2626", bg: "rgba(220,38,38,.1)",   borda: "rgba(220,38,38,.28)" },
    OUTROS:   { label: "Outros",    icon: <HelpCircle size={11} />, cor: "#D97706", bg: "rgba(217,119,6,.1)",   borda: "rgba(217,119,6,.28)" },
};

function getMotivoLabel(m) { return MOTIVO_LABELS[m] || { label: m || "Não informado", icone: "📋" }; }
function getJustificativaInfo(v) { return JUSTIFICATIVAS[v] || { label: v || "Outro", icon: <HelpCircle size={11} />, cor: "#9A9080", bg: "rgba(154,144,128,.1)", borda: "rgba(154,144,128,.28)" }; }

function BadgeJustificativa({ valor }) {
    const cfg = getJustificativaInfo(valor);
    return (
        <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:99, background:cfg.bg, color:cfg.cor, border:`1px solid ${cfg.borda}`, fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:600, letterSpacing:".06em", whiteSpace:"nowrap", textTransform:"uppercase" }}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

const NOTIF_KEY = "ieq_pastor_notif_lidas";
function getNotifLidas() { try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]"); } catch { return []; } }
function salvarNotifLida(id) { const l = getNotifLidas(); if (!l.includes(id)) { l.push(id); localStorage.setItem(NOTIF_KEY, JSON.stringify(l)); } }
function marcarTodasLidas(ids) { localStorage.setItem(NOTIF_KEY, JSON.stringify(ids)); }

/* ─── CSS Global ─────────────────────────────────────────────────────────── */
function GlobalStylesRel({ t, isDark }) {
    return (
        <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      *, *::before, *::after { box-sizing: border-box; }

      @keyframes rl-spin  { to { transform: rotate(360deg); } }
      @keyframes rl-pulse { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes rl-bell  { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-12deg)} 40%{transform:rotate(12deg)} 60%{transform:rotate(-8deg)} 80%{transform:rotate(8deg)} }
      @keyframes rl-sheet { from{transform:translateY(100%)} to{transform:translateY(0)} }
      @keyframes rl-fadein { from{opacity:0} to{opacity:1} }

      .rl-spin  { animation: rl-spin 1s linear infinite; }
      .rl-pulse { animation: rl-pulse 3s ease-in-out infinite; }
      .rl-bell  { animation: rl-bell .6s ease infinite; }

      .rl-root {
        font-family: 'Inter', sans-serif;
        background: ${t.bg};
        color: ${t.text};
        min-height: 100vh;
        min-height: 100dvh;
        position: relative;
        overflow-x: hidden;
        padding-bottom: max(60px, env(safe-area-inset-bottom, 60px));
        transition: background .3s, color .3s;
        isolation: isolate;
        -webkit-tap-highlight-color: transparent;
        -webkit-text-size-adjust: 100%;
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
        padding: 12px 16px 0;
      }

      /* ── Header ── */
      .rl-header {
        display: flex; align-items: flex-start; justify-content: space-between;
        gap: 10px; margin-bottom: 16px;
      }
      .rl-eyebrow {
        font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
        color: rgba(201,169,110,.55); margin: 0 0 3px; display: flex; align-items: center; gap: 5px;
      }
      .rl-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(18px, 5vw, 26px);
        font-weight: 500; letter-spacing: .03em; margin: 0; line-height: 1.2; color: ${t.text};
      }
      .rl-header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }

      /* ── Botões ── */
      .rl-btn-gold {
        display: flex; align-items: center; gap: 6px;
        padding: 12px 18px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight});
        color: #0A0A0F; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .13em; text-transform: uppercase;
        transition: all .25s; box-shadow: 0 4px 18px rgba(201,169,110,.25);
        -webkit-user-select: none; user-select: none; touch-action: manipulation;
        min-height: 44px;
      }
      .rl-btn-gold:active { transform: scale(.96); }
      .rl-btn-gold:disabled { opacity: .45; cursor: default; }

      .rl-btn-ghost {
        display: flex; align-items: center; gap: 6px;
        padding: 12px 16px; border-radius: 100px;
        border: 1px solid ${t.border}; cursor: pointer;
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        color: ${t.textSec}; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .13em; text-transform: uppercase;
        transition: all .25s; -webkit-user-select: none; user-select: none;
        touch-action: manipulation; min-height: 44px;
      }
      .rl-btn-ghost:active { transform: scale(.96); border-color: ${AURA.gold}; color: ${AURA.gold}; }

      /* ── Sino ── */
      .rl-bell-btn {
        display: flex; align-items: center; gap: 7px; min-height: 44px;
        padding: 12px 14px; border-radius: 100px; cursor: pointer; transition: all .2s;
        -webkit-user-select: none; user-select: none; touch-action: manipulation;
      }
      .rl-bell-btn.active  { background: linear-gradient(135deg, ${AURA.yellow}, #c8a010); border: none; color: #1A1008; box-shadow: 0 4px 18px rgba(253,184,19,.28); }
      .rl-bell-btn.inactive { background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"}; border: 1px solid ${t.border}; color: ${t.textSec}; }
      .rl-bell-btn.active:active, .rl-bell-btn.inactive:active { transform: scale(.94); }
      .rl-bell-count { background: #fff; color: #c8a010; border-radius: 99px; font-family:'Inter',sans-serif; font-size:10px; font-weight:700; padding:1px 7px; min-width:20px; text-align:center; }

      /* ── Divider ── */
      .rl-divider { display:flex; align-items:center; gap:10px; margin:0 0 16px; }
      .rl-divider::before,.rl-divider::after { content:''; flex:1; height:1px; background:linear-gradient(to right,transparent,${AURA.gold}); }
      .rl-divider::after { background:linear-gradient(to left,transparent,${AURA.gold}); }
      .rl-divider-dot { width:5px; height:5px; border-radius:50%; background:${AURA.gold}; flex-shrink:0; }

      /* ── Filtros ── */
      .rl-filters {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 18px; padding: 14px 16px; margin-bottom: 18px;
        display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
        backdrop-filter: blur(24px);
      }
      .rl-filter-label { font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: ${t.textMuted}; }
      .rl-input {
        background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 13px 14px; border-radius: 12px; outline: none;
        font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 300;
        transition: all .2s; min-width: 130px; flex: 1;
        -webkit-appearance: none; appearance: none;
        color-scheme: ${isDark ? "dark" : "light"};
        min-height: 48px;
      }
      .rl-input:focus { border-color: rgba(201,169,110,.5); box-shadow: 0 0 0 3px rgba(201,169,110,.1); }
      @media(max-width: 520px) { .rl-filters { flex-direction:column; align-items:stretch; } .rl-input { width:100%; } }

      /* ── KPI Grid ── */
      .rl-kpi-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px; margin-bottom: 20px;
      }
      @media(min-width: 640px) { .rl-kpi-grid { grid-template-columns: repeat(5, 1fr); gap:14px; } }

      .rl-kpi-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 16px; padding: 14px 12px; display: flex;
        flex-direction: column; gap: 10px; backdrop-filter: blur(24px);
        position: relative; overflow: hidden;
      }
      .rl-kpi-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(201,169,110,.2),transparent); }
      .rl-kpi-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      .rl-kpi-label { font-size:8px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:${t.textMuted}; margin:0 0 1px; }
      .rl-kpi-value { font-family:'Playfair Display',serif; font-size:clamp(20px,4vw,26px); font-weight:600; color:${t.text}; margin:0; line-height:1; }
      .rl-kpi-card.hero { background:linear-gradient(135deg,${AURA.blue},${AURA.blueDark}); border:1px solid rgba(201,169,110,.12); }
      .rl-kpi-card.hero .rl-kpi-label { color:rgba(255,255,255,.6); }
      .rl-kpi-card.hero .rl-kpi-value { color:#fff; }
      .rl-kpi-card.alert { background:linear-gradient(135deg,${AURA.yellow},#c8a010); border:none; }
      .rl-kpi-card.alert .rl-kpi-label { color:rgba(26,16,8,.65); }
      .rl-kpi-card.alert .rl-kpi-value { color:#1A1008; }

      /* ── Section header ── */
      .rl-section-hd { display:flex; align-items:center; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
      .rl-section-badge { display:inline-flex; align-items:center; gap:7px; padding:8px 14px; border-radius:100px; font-size:9px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; }
      .rl-section-line { flex:1; height:1px; min-width:20px; }

      /* ── Cards grid ── */
      .rl-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px; margin-bottom: 24px;
      }
      @media(min-width: 560px) { .rl-grid { grid-template-columns: repeat(2, 1fr); } }
      @media(min-width: 900px) { .rl-grid { grid-template-columns: repeat(3, 1fr); } }

      .rl-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 18px; overflow: hidden; cursor: pointer;
        transition: border-color .25s; backdrop-filter: blur(24px);
        position: relative; display: flex; flex-direction: column;
        -webkit-user-select: none; user-select: none; touch-action: manipulation;
        /* sem transform no hover em mobile para evitar flicker */
      }
      .rl-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(201,169,110,.2),transparent); z-index:1; }
      @media(hover:hover) { .rl-card:hover { transform:translateY(-4px); border-color:${t.cardHover}; box-shadow:0 14px 36px rgba(0,0,0,${isDark?".45":".1"}); } }
      .rl-card:active { opacity:.88; }
      .rl-card-strip { height:4px; flex-shrink:0; }
      .rl-card-body { padding:16px 18px; flex:1; }
      .rl-card-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      .rl-card-title { font-family:'Playfair Display',serif; font-size:15px; font-weight:500; letter-spacing:.02em; color:${t.text}; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .rl-card-date { font-size:12px; color:${t.textSec}; margin:0; font-family:'Inter',sans-serif; }
      .rl-card-tag { display:flex; align-items:center; gap:7px; padding:8px 11px; border-radius:10px; font-size:9px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; }
      .rl-card-stats { display:grid; grid-template-columns:1fr 1fr 1fr; border-top:1px solid ${t.border}; }
      .rl-card-stat { padding:12px 8px; text-align:center; }
      .rl-card-stat+.rl-card-stat { border-left:1px solid ${t.border}; }
      .rl-card-stat-value { font-family:'Playfair Display',serif; font-size:18px; font-weight:600; margin:0; }
      .rl-card-stat-label { font-size:7.5px; letter-spacing:.13em; text-transform:uppercase; color:${t.textMuted}; margin:3px 0 0; }
      .rl-card-footer { padding:12px 18px; display:flex; align-items:center; justify-content:space-between; font-size:9px; font-weight:600; letter-spacing:.13em; text-transform:uppercase; border-top:1px solid ${t.border}; min-height:44px; }

      /* ── Empty ── */
      .rl-empty { text-align:center; padding:48px 24px; background:${t.bgEl}; border:1.5px dashed ${t.border}; border-radius:18px; margin-top:6px; backdrop-filter:blur(24px); }
      .rl-empty p { font-family:'Playfair Display',serif; font-size:14px; font-weight:500; letter-spacing:.04em; color:${t.textSec}; margin:12px 0 0; }

      /* ── Modal / Bottom Sheet ── */
      .rl-modal-backdrop {
        position: fixed; inset: 0; z-index: 1000;
        display: flex; align-items: flex-end; justify-content: center;
      }
      @media(min-width: 640px) { .rl-modal-backdrop { align-items: center; padding: 20px; } }

      .rl-modal-overlay {
        position: fixed; inset: 0; z-index: 0;
        background: rgba(10,10,15,.88);
        backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
        animation: rl-fadein .22s ease;
      }

      .rl-modal-box {
        position: relative; z-index: 10;
        width: 100%;
        max-height: 92vh; max-height: 92dvh;
        display: flex; flex-direction: column;
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 24px 24px 0 0; overflow: hidden;
        /* native bottom sheet feel */
        animation: rl-sheet .28s cubic-bezier(.32,1,.6,1);
        overscroll-behavior: contain;
      }
      @media(min-width: 640px) {
        .rl-modal-box {
          border-radius: 22px; max-width: 720px;
          max-height: calc(100dvh - 40px);
          animation: none;
        }
      }

      /* Handle do bottom sheet */
      .rl-sheet-handle {
        width: 40px; height: 4px; border-radius: 2px;
        background: rgba(201,169,110,.3);
        margin: 10px auto 0; flex-shrink: 0;
      }
      @media(min-width: 640px) { .rl-sheet-handle { display: none; } }

      .rl-modal-head {
        padding: 16px 18px 14px; flex-shrink: 0;
        display: flex; justify-content: space-between; align-items: center; gap: 10px;
        border-bottom: 1px solid ${t.border};
      }
      .rl-modal-body { overflow-y: auto; flex: 1; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }

      /* ── Abas ── */
      .rl-tabs {
        display: flex; gap: 0; border-bottom: 1px solid ${t.border};
        overflow-x: auto; flex-shrink: 0; scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        scroll-snap-type: x mandatory;
      }
      .rl-tabs::-webkit-scrollbar { display: none; }
      .rl-tab {
        display: flex; align-items: center; gap: 6px;
        padding: 14px 16px; cursor: pointer; font-family: 'Inter',sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .11em; text-transform: uppercase;
        border-bottom: 2px solid transparent; white-space: nowrap;
        transition: color .2s, border-color .2s;
        color: ${t.textMuted}; background: none;
        border-top: none; border-left: none; border-right: none;
        margin-bottom: -1px; min-height: 48px; flex-shrink: 0;
        -webkit-user-select: none; user-select: none;
        scroll-snap-align: start;
      }
      .rl-tab.active { color: ${AURA.gold}; border-bottom-color: ${AURA.gold}; }
      .rl-tab-badge { padding:2px 7px; border-radius:99px; font-size:9px; font-weight:700; }

      /* ── Stats bar ── */
      .rl-stats-bar { display:grid; grid-template-columns:repeat(4,1fr); border-bottom:1px solid ${t.border}; flex-shrink:0; }
      @media(max-width:400px) { .rl-stats-bar { grid-template-columns:repeat(2,1fr); } }
      .rl-stat-cell { padding:14px 8px; text-align:center; }
      .rl-stat-cell+.rl-stat-cell { border-left:1px solid ${t.border}; }
      @media(max-width:400px) {
        .rl-stat-cell:nth-child(odd) { border-left:none; }
        .rl-stat-cell:nth-child(n+3) { border-top:1px solid ${t.border}; }
      }
      .rl-stat-num { font-family:'Playfair Display',serif; font-size:clamp(18px,5vw,22px); font-weight:600; margin:0; }
      .rl-stat-lbl { font-size:8px; letter-spacing:.12em; text-transform:uppercase; color:${t.textMuted}; margin:3px 0 0; font-family:'Inter',sans-serif; }

      /* ── Tab Panel ── */
      .rl-tab-panel { padding:16px; display:flex; flex-direction:column; gap:12px; }
      @media(min-width:640px) { .rl-tab-panel { padding:22px; gap:16px; } }

      /* ── Person Row ── */
      .rl-person-row {
        display: flex; align-items: center; gap: 12px;
        padding: 13px 14px; border-radius: 14px;
        border: 1px solid ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.14)"};
        background: ${isDark ? "rgba(255,255,255,.02)" : "rgba(201,169,110,.03)"};
        min-height: 64px;
      }
      .rl-avatar { width:42px; height:42px; border-radius:12px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-weight:600; font-size:16px; }
      .rl-person-name { font-family:'Inter',sans-serif; font-size:14px; font-weight:400; color:${t.text}; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .rl-person-sub { font-size:11px; color:${t.textMuted}; margin-top:2px; font-family:'Inter',sans-serif; }

      .rl-decisao-badge { display:inline-block; padding:4px 10px; border-radius:99px; font-family:'Inter',sans-serif; font-size:9px; font-weight:600; letter-spacing:.08em; border:1px solid; text-transform:uppercase; }

      /* ── Info box ── */
      .rl-info-box { padding:16px 18px; border-radius:16px; display:flex; flex-direction:column; gap:0; }
      .rl-info-row { display:flex; align-items:flex-start; gap:10px; padding:13px 0; border-bottom:1px solid ${isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.05)"}; }
      .rl-info-row:first-child { padding-top:0; }
      .rl-info-row:last-child { border-bottom:none; padding-bottom:0; }
      .rl-info-label { font-size:9px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:${t.textMuted}; min-width:80px; flex-shrink:0; padding-top:2px; }
      .rl-info-value { font-family:'Inter',sans-serif; font-size:13px; font-weight:400; color:${t.text}; flex:1; }

      /* ── Mini empty ── */
      .rl-mini-empty { text-align:center; padding:36px 20px; color:${t.textMuted}; font-size:13px; font-family:'Inter',sans-serif; }

      /* ── Loading ── */
      .rl-loading { min-height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; }

      /* ── Notif Panel ── */
      .rl-notif-panel {
        position: fixed;
        /* bottom sheet em mobile, dropdown em desktop */
        bottom: 0; left: 0; right: 0;
        max-height: 75vh; max-height: 75dvh;
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 24px 24px 0 0;
        box-shadow: 0 -12px 48px rgba(0,0,0,.3);
        z-index: 1100; overflow: hidden; display: flex; flex-direction: column;
        backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
        animation: rl-sheet .24s cubic-bezier(.32,1,.6,1);
      }
      @media(min-width: 640px) {
        .rl-notif-panel {
          position: absolute; bottom: auto; left: auto; right: 0;
          top: calc(100% + 10px); width: min(360px, 92vw);
          border-radius: 18px; max-height: 480px;
          box-shadow: 0 20px 60px rgba(0,0,0,.3);
          animation: none;
        }
      }

      /* Backdrop do painel notif em mobile */
      .rl-notif-overlay {
        display: none;
      }
      @media(max-width:639px) {
        .rl-notif-overlay {
          display: block;
          position: fixed; inset: 0; z-index: 1099;
          background: rgba(10,10,15,.7);
          animation: rl-fadein .2s ease;
          backdrop-filter: blur(4px);
        }
      }

      /* Safe area bottom no modal */
      .rl-modal-safe-bottom {
        padding-bottom: max(16px, env(safe-area-inset-bottom, 16px));
      }

      /* Prevent iOS zoom on inputs */
      @media(max-width: 767px) {
        input, select, textarea { font-size: 16px !important; }
      }
    `}</style>
    );
}

/* ─── Painel de Notificações ─────────────────────────────────────────────── */
function NotificacaoPanel({ naoRealizadas, isDark, t, onVerDetalhes }) {
    const [aberto, setAberto] = useState(false);
    const [lidas,  setLidas]  = useState(getNotifLidas);
    const wrapRef = useRef(null);

    const naoLidas = naoRealizadas.filter(r => !lidas.includes(r.id));
    const count    = naoLidas.length;

    // Fecha ao clicar fora (desktop)
    useEffect(() => {
        if (!aberto) return;
        const fn = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setAberto(false); };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, [aberto]);

    // Bloqueia scroll do body no mobile quando aberto
    useEffect(() => {
        if (aberto && window.innerWidth < 640) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [aberto]);

    const handleMarcarLida = (id, e) => {
        e.stopPropagation();
        salvarNotifLida(id);
        setLidas(getNotifLidas());
    };
    const handleMarcarTodas = () => {
        marcarTodasLidas(naoRealizadas.map(r => r.id));
        setLidas(getNotifLidas());
    };
    const fmt = (s) => {
        if (!s) return "?";
        const [a,m,d] = s.split("-").map(Number);
        return new Date(a,m-1,d).toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});
    };

    return (
        <div ref={wrapRef} style={{ position: "relative" }}>
            <button className={`rl-bell-btn ${count > 0 ? "active" : "inactive"}`} onClick={() => setAberto(v => !v)}>
                {count > 0 ? <BellRing size={15} className="rl-bell" /> : <Bell size={15} />}
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600, letterSpacing:".13em" }}>ALERTAS</span>
                {count > 0 && <span className="rl-bell-count">{count}</span>}
            </button>

            <AnimatePresence>
                {aberto && (
                    <>
                        {/* Overlay mobile */}
                        <div className="rl-notif-overlay" onClick={() => setAberto(false)} />

                        <motion.div
                            className="rl-notif-panel"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: .2 }}
                        >
                            {/* Handle mobile */}
                            <div className="rl-sheet-handle" />

                            <div style={{ padding:"14px 18px 12px", background:`linear-gradient(135deg,${AURA.yellow},#c8a010)`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                    <BellRing size={16} style={{ color:"#1A1008" }} />
                                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, letterSpacing:".15em", fontWeight:700, color:"#1A1008", textTransform:"uppercase" }}>Células não realizadas</span>
                                    {count > 0 && <span style={{ background:"rgba(26,16,8,.18)", color:"#1A1008", borderRadius:99, fontSize:9, fontFamily:"'Inter',sans-serif", fontWeight:700, padding:"2px 8px" }}>{count} NOVA{count>1?"S":""}</span>}
                                </div>
                                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                                    {count > 0 && (
                                        <button onClick={handleMarcarTodas} style={{ background:"rgba(26,16,8,.15)", border:"none", borderRadius:8, padding:"7px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:5, minHeight:36 }}>
                                            <CheckCheck size={12} style={{ color:"#1A1008" }} />
                                            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, color:"#1A1008", fontWeight:600 }}>LI TUDO</span>
                                        </button>
                                    )}
                                    <button onClick={() => setAberto(false)} style={{ background:"rgba(26,16,8,.15)", border:"none", borderRadius:8, padding:"7px 10px", cursor:"pointer", display:"flex", minHeight:36 }}>
                                        <X size={14} style={{ color:"#1A1008" }} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ overflowY:"auto", flex:1, WebkitOverflowScrolling:"touch" }}>
                                {naoRealizadas.length === 0 ? (
                                    <div style={{ padding:"32px 20px", textAlign:"center" }}>
                                        <CheckCheck size={28} style={{ color:t.textMuted, margin:"0 auto 10px" }} />
                                        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:t.textSec, margin:0, textTransform:"uppercase", letterSpacing:".12em" }}>Nenhum alerta pendente</p>
                                    </div>
                                ) : naoRealizadas.map((rel) => {
                                    const mot   = getMotivoLabel(rel.motivoNaoRealizacao);
                                    const isLida = lidas.includes(rel.id);
                                    return (
                                        <div key={rel.id}
                                             onClick={() => { onVerDetalhes(rel); setAberto(false); }}
                                             style={{ padding:"14px 18px", borderBottom:`1px solid ${t.border}`, cursor:"pointer", display:"flex", alignItems:"center", gap:12, background: isLida ? "transparent" : (isDark?"rgba(253,184,19,.05)":"rgba(253,184,19,.07)"), position:"relative", minHeight:72 }}
                                        >
                                            {!isLida && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:`linear-gradient(180deg,${AURA.yellow},#c8a010)`, borderRadius:"0 2px 2px 0" }} />}
                                            <div style={{ width:44, height:44, borderRadius:12, flexShrink:0, background: isLida?(isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)"):"rgba(253,184,19,.14)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{mot.icone}</div>
                                            <div style={{ flex:1, minWidth:0 }}>
                                                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:500, color:t.text, margin:"0 0 3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{rel.nomeCelula}</p>
                                                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".08em", color:"#c8a010", margin:"0 0 4px", textTransform:"uppercase" }}>{mot.label}</p>
                                                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                                    <Clock size={10} style={{ color:t.textMuted }} />
                                                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:t.textMuted }}>{fmt(rel.dataReuniao)}</span>
                                                </div>
                                            </div>
                                            {!isLida && (
                                                <button onClick={(e)=>handleMarcarLida(rel.id,e)} style={{ background:"rgba(253,184,19,.15)", border:"1px solid rgba(253,184,19,.3)", borderRadius:8, padding:"8px 10px", cursor:"pointer", flexShrink:0, minHeight:40, minWidth:40, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                                    <CheckCheck size={14} style={{ color:"#c8a010" }} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {naoRealizadas.length > 0 && (
                                <div style={{ padding:"10px 18px", borderTop:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", paddingBottom:`max(14px, env(safe-area-inset-bottom, 14px))` }}>
                                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".13em", color:t.textMuted, textTransform:"uppercase" }}>{naoRealizadas.length - count} de {naoRealizadas.length} visualizadas</span>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Modal de Detalhes ──────────────────────────────────────────────────── */
function ModalDetalhes({ rel, isDark, t, onClose }) {
    const [aba, setAba]   = useState("info");
    const tabsRef         = useRef(null);
    const bodyRef         = useRef(null);

    // Bloqueia scroll do body enquanto modal aberto
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, []);

    // Reset aba ao trocar de relatório
    useEffect(() => { setAba("info"); }, [rel.id]);

    const fmtLong = (s) => {
        if (!s) return "?";
        const [a,m,d] = s.split("-").map(Number);
        return new Date(a,m-1,d).toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
    };

    const getDecisaoTexto = (d) => ({ACEITOU_JESUS:"Novo Convertido",RECONCILIOU:"Reconciliação",BATISMO_AGUAS:"Deseja Batismo",NENHUMA:"Nenhuma"}[d]||d||"—");
    const getDecisaoCor   = (d) => {
        if (d==="ACEITOU_JESUS") return {background:"rgba(22,163,74,.12)",  color:"#16a34a", borderColor:"rgba(22,163,74,.3)"};
        if (d==="RECONCILIOU")   return {background:"rgba(14,165,233,.12)", color:"#0ea5e9", borderColor:"rgba(14,165,233,.3)"};
        if (d==="BATISMO_AGUAS") return {background:"rgba(139,92,246,.12)", color:"#8b5cf6", borderColor:"rgba(139,92,246,.3)"};
        return {background:"rgba(201,169,110,.1)", color:AURA.gold, borderColor:"rgba(201,169,110,.3)"};
    };

    const naoRealizada         = rel.realizada === false;
    const motivo               = naoRealizada ? getMotivoLabel(rel.motivoNaoRealizacao) : null;
    const membrosPresentes     = rel.membrosPresentes    || [];
    const visitantesPresentes  = rel.visitantesPresentes || [];
    const simpatizantes        = rel.simpatizantes       || [];
    const membrosAusentes      = rel.membrosAusentes     || [];
    const ausentesJustif       = membrosAusentes.filter(a =>  a.justificativaFalta);
    const ausentesSemJust      = membrosAusentes.filter(a => !a.justificativaFalta);
    const comDecisao           = visitantesPresentes.filter(v => v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA");
    const totalGeral           = membrosPresentes.length + visitantesPresentes.length + simpatizantes.length + (rel.quantidadeVisitantes||0);

    const ABAS = [
        { id:"info",         label:"Info",          count:null },
        { id:"membros",      label:"Membros",       count:membrosPresentes.length },
        { id:"visitantes",   label:"Visitantes",    count:visitantesPresentes.length+(rel.quantidadeVisitantes||0) },
        ...(simpatizantes.length>0?[{id:"simpatizantes",label:"Simpatiz.",count:simpatizantes.length}]:[]),
        { id:"ausentes",     label:"Ausentes",      count:membrosAusentes.length },
        ...(comDecisao.length>0?[{id:"decisoes",label:"Decisões",count:comDecisao.length}]:[]),
    ];

    const TAB_COLORS = { info:AURA.gold, membros:"#16a34a", visitantes:"#0ea5e9", simpatizantes:"#8b5cf6", ausentes:"#6366F1", decisoes:"#c8a010" };
    const hGrad  = naoRealizada ? `linear-gradient(135deg,${AURA.yellow},#c8a010)` : `linear-gradient(135deg,${AURA.blue},${AURA.blueDark})`;
    const hText  = naoRealizada ? "#1A1008" : "#fff";
    const hSub   = naoRealizada ? "rgba(26,16,8,.7)" : "rgba(255,255,255,.7)";

    // Scroll aba ativa para centro
    const scrollTabIntoView = (id) => {
        if (!tabsRef.current) return;
        const btn = tabsRef.current.querySelector(`[data-tab="${id}"]`);
        if (btn) btn.scrollIntoView({ inline:"center", block:"nearest", behavior:"smooth" });
    };
    const handleTabClick = (id) => { setAba(id); scrollTabIntoView(id); if(bodyRef.current) bodyRef.current.scrollTop=0; };

    return createPortal((
        <div className="rl-modal-backdrop">
            <motion.div className="rl-modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} />
            <motion.div
                className="rl-modal-box"
                initial={{y:"100%",opacity:.5}}
                animate={{y:0,opacity:1}}
                exit={{y:"100%",opacity:0}}
                transition={{type:"spring",damping:30,stiffness:320}}
            >
                {/* Handle */}
                <div className="rl-sheet-handle" />

                {/* Header */}
                <div className="rl-modal-head" style={{ background:hGrad }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
                        <div style={{ width:46, height:46, background:"rgba(255,255,255,.18)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:naoRealizada?24:undefined, flexShrink:0 }}>
                            {naoRealizada ? <span>{motivo.icone}</span> : <UserCheck size={22} style={{color:"#fff"}} />}
                        </div>
                        <div style={{ minWidth:0 }}>
                            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:500, color:hText, margin:"0 0 3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                {rel.nomeCelula}
                            </h3>
                            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                                <Clock size={10} style={{color:hSub}} />
                                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:hSub, letterSpacing:".04em" }}>{fmtLong(rel.dataReuniao)}</span>
                                {naoRealizada && <span style={{ background:"rgba(26,16,8,.15)", padding:"2px 8px", borderRadius:99, fontSize:9, textTransform:"uppercase", fontWeight:600, color:"#1A1008" }}>✕ Não Realizada</span>}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background:"rgba(255,255,255,.2)", border:"none", color:hText, padding:11, borderRadius:10, cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", minWidth:44, minHeight:44 }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Stats bar */}
                {!naoRealizada && (
                    <div className="rl-stats-bar">
                        {[
                            {num:membrosPresentes.length,        lbl:"Membros",      cor:t.text},
                            {num:visitantesPresentes.length+(rel.quantidadeVisitantes||0), lbl:"Visitantes", cor:AURA.gold},
                            {num:simpatizantes.length,           lbl:"Simpatiz.",    cor:"#8b5cf6"},
                            {num:totalGeral,                     lbl:"Total",        cor:AURA.blue},
                        ].map((s,i) => (
                            <div key={i} className="rl-stat-cell">
                                <p className="rl-stat-num" style={{color:s.cor}}>{s.num}</p>
                                <p className="rl-stat-lbl">{s.lbl}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Abas */}
                {!naoRealizada && (
                    <div className="rl-tabs" ref={tabsRef}>
                        {ABAS.map(tab => (
                            <button key={tab.id} data-tab={tab.id}
                                    className={`rl-tab ${aba===tab.id?"active":""}`}
                                    onClick={() => handleTabClick(tab.id)}
                                    style={aba===tab.id ? {color:TAB_COLORS[tab.id], borderBottomColor:TAB_COLORS[tab.id]} : {}}
                            >
                                {tab.label}
                                {tab.count!==null && (
                                    <span className="rl-tab-badge" style={{
                                        background: aba===tab.id ? `${TAB_COLORS[tab.id]}22` : (isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.06)"),
                                        color: aba===tab.id ? TAB_COLORS[tab.id] : t.textMuted,
                                    }}>{tab.count}</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Body */}
                <div className="rl-modal-body rl-modal-safe-bottom" ref={bodyRef}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={naoRealizada?"nr":aba}
                            initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                            transition={{duration:.14}}
                        >
                            {/* NÃO REALIZADA */}
                            {naoRealizada && (
                                <div className="rl-tab-panel">
                                    <div style={{ padding:24, background:isDark?"rgba(253,184,19,.06)":"rgba(253,184,19,.08)", border:"1px solid rgba(253,184,19,.25)", borderRadius:18, textAlign:"center" }}>
                                        <div style={{fontSize:54,marginBottom:14}}>{motivo.icone}</div>
                                        <p style={{fontFamily:"'Inter',sans-serif",fontSize:10,letterSpacing:".2em",color:"#c8a010",fontWeight:700,margin:"0 0 6px",textTransform:"uppercase"}}>Motivo da Não Realização</p>
                                        <p style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:t.text,margin:"0 0 18px",fontWeight:500}}>{motivo.label}</p>
                                        <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 18px",background:"rgba(253,184,19,.12)",border:"1px solid rgba(253,184,19,.3)",borderRadius:99,fontFamily:"'Inter',sans-serif",fontSize:9,letterSpacing:".14em",color:"#c8a010",textTransform:"uppercase",fontWeight:600}}>
                                            <Ban size={12} /> Célula não realizada
                                        </div>
                                    </div>
                                    {rel.observacoes && (
                                        <div style={{padding:"16px 18px",background:isDark?"rgba(255,255,255,.03)":"rgba(201,169,110,.05)",border:`1px solid ${t.border}`,borderRadius:14}}>
                                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                                                <MessageSquare size={14} style={{color:AURA.gold}} />
                                                <span style={{fontFamily:"'Inter',sans-serif",fontSize:9,letterSpacing:".14em",color:AURA.gold,textTransform:"uppercase",fontWeight:600}}>Observações</span>
                                            </div>
                                            <p style={{fontFamily:"'Inter',sans-serif",fontSize:14,fontStyle:"italic",fontWeight:300,color:t.textSec,margin:0}}>"{rel.observacoes}"</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ABA: INFO */}
                            {!naoRealizada && aba==="info" && (
                                <div className="rl-tab-panel">
                                    <div className="rl-info-box" style={{background:isDark?"rgba(255,255,255,.02)":"rgba(201,169,110,.04)",border:`1px solid ${t.border}`}}>
                                        <div className="rl-info-row"><span className="rl-info-label">Data</span><span className="rl-info-value">{fmtLong(rel.dataReuniao)}</span></div>
                                        <div className="rl-info-row">
                                            <span className="rl-info-label">Estudo</span>
                                            <span className="rl-info-value" style={{fontStyle:rel.estudo?"normal":"italic",color:rel.estudo?t.text:t.textMuted}}>{rel.estudo||"Não informado"}</span>
                                        </div>
                                        {rel.local    && <div className="rl-info-row"><span className="rl-info-label">Local</span><span className="rl-info-value">{rel.local}</span></div>}
                                        {rel.lider    && <div className="rl-info-row"><span className="rl-info-label">Líder</span><span className="rl-info-value">{rel.lider}</span></div>}
                                        {rel.anfitriao&& <div className="rl-info-row"><span className="rl-info-label">Anfitrião</span><span className="rl-info-value">{rel.anfitriao}</span></div>}
                                        <div className="rl-info-row">
                                            <span className="rl-info-label">Situação</span>
                                            <span style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 13px",borderRadius:99,background:"rgba(22,163,74,.1)",border:"1px solid rgba(22,163,74,.3)",color:"#16a34a",fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase"}}>✓ Realizada</span>
                                        </div>
                                    </div>
                                    {rel.observacoes && (
                                        <div style={{padding:"16px 18px",background:isDark?"rgba(255,255,255,.03)":"rgba(201,169,110,.05)",border:`1px solid ${t.border}`,borderRadius:14}}>
                                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                                                <MessageSquare size={14} style={{color:AURA.gold}} />
                                                <span style={{fontFamily:"'Inter',sans-serif",fontSize:9,letterSpacing:".14em",color:AURA.gold,textTransform:"uppercase",fontWeight:600}}>Observações do Líder</span>
                                            </div>
                                            <p style={{fontFamily:"'Inter',sans-serif",fontSize:14,fontStyle:"italic",fontWeight:300,color:t.textSec,margin:0}}>"{rel.observacoes}"</p>
                                        </div>
                                    )}
                                    {comDecisao.length > 0 && (
                                        <div style={{padding:"14px 16px",background:isDark?"rgba(253,184,19,.06)":"rgba(253,184,19,.08)",border:"1px solid rgba(253,184,19,.25)",borderRadius:14,display:"flex",alignItems:"center",gap:10}}>
                                            <Sparkles size={16} style={{color:"#c8a010",flexShrink:0}} />
                                            <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:t.textSec,margin:0}}>
                                                <strong style={{color:"#c8a010"}}>{comDecisao.length} decisão{comDecisao.length>1?"ões":""} espiritual{comDecisao.length>1?"is":""}</strong> — veja a aba <strong style={{color:"#c8a010"}}>Decisões</strong>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ABA: MEMBROS */}
                            {!naoRealizada && aba==="membros" && (
                                <div className="rl-tab-panel">
                                    {membrosPresentes.length===0 ? (
                                        <div className="rl-mini-empty">Nenhum membro registrado como presente.</div>
                                    ) : membrosPresentes.map((m,i) => {
                                        const nome = m.nome||m;
                                        return (
                                            <div key={i} className="rl-person-row">
                                                <div className="rl-avatar" style={{background:"rgba(22,163,74,.1)",color:"#16a34a"}}>{nome.charAt(0).toUpperCase()}</div>
                                                <div style={{flex:1,minWidth:0}}>
                                                    <p className="rl-person-name">{nome}</p>
                                                    {m.cargo && <p className="rl-person-sub">{m.cargo}</p>}
                                                </div>
                                                <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,background:"rgba(22,163,74,.1)",color:"#16a34a",border:"1px solid rgba(22,163,74,.28)",fontSize:9,fontWeight:600,textTransform:"uppercase",whiteSpace:"nowrap"}}>✓ Presente</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ABA: VISITANTES */}
                            {!naoRealizada && aba==="visitantes" && (
                                <div className="rl-tab-panel">
                                    {visitantesPresentes.length===0 && !rel.quantidadeVisitantes ? (
                                        <div className="rl-mini-empty">Nenhum visitante registrado.</div>
                                    ) : (
                                        <>
                                            {rel.quantidadeVisitantes>0 && visitantesPresentes.length===0 && (
                                                <div style={{padding:"14px 16px",background:isDark?"rgba(255,255,255,.03)":"rgba(14,165,233,.05)",border:"1px solid rgba(14,165,233,.2)",borderRadius:14,display:"flex",alignItems:"center",gap:10}}>
                                                    <Users size={16} style={{color:"#0ea5e9",flexShrink:0}} />
                                                    <span style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:t.textSec}}>
                                                        <strong style={{color:"#0ea5e9"}}>{rel.quantidadeVisitantes}</strong> visitante{rel.quantidadeVisitantes>1?"s":""} sem cadastro individual
                                                    </span>
                                                </div>
                                            )}
                                            {visitantesPresentes.map((v,i) => (
                                                <div key={i} className="rl-person-row" style={{border:`1px solid ${getDecisaoCor(v.decisaoEspiritual).borderColor}`}}>
                                                    <div className="rl-avatar" style={{background:`${getDecisaoCor(v.decisaoEspiritual).color}18`,color:getDecisaoCor(v.decisaoEspiritual).color}}>{v.nome.charAt(0).toUpperCase()}</div>
                                                    <div style={{flex:1,minWidth:0}}>
                                                        <p className="rl-person-name">{v.nome}</p>
                                                        {v.telefone    && <p className="rl-person-sub">📞 {v.telefone}</p>}
                                                        {v.indicadoPor && <p className="rl-person-sub">Indicado por: {v.indicadoPor}</p>}
                                                    </div>
                                                    <span className="rl-decisao-badge" style={getDecisaoCor(v.decisaoEspiritual)}>
                                                        {v.decisaoEspiritual&&v.decisaoEspiritual!=="NENHUMA" ? ({ACEITOU_JESUS:"Convertido",RECONCILIOU:"Reconciliação",BATISMO_AGUAS:"Batismo"}[v.decisaoEspiritual]||v.decisaoEspiritual) : "Visitante"}
                                                    </span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ABA: SIMPATIZANTES */}
                            {!naoRealizada && aba==="simpatizantes" && (
                                <div className="rl-tab-panel">
                                    {simpatizantes.length===0 ? (
                                        <div className="rl-mini-empty">Nenhum simpatizante registrado.</div>
                                    ) : simpatizantes.map((s,i) => {
                                        const nome = s.nome||s;
                                        return (
                                            <div key={i} className="rl-person-row">
                                                <div className="rl-avatar" style={{background:"rgba(139,92,246,.1)",color:"#8b5cf6"}}>{nome.charAt(0).toUpperCase()}</div>
                                                <div style={{flex:1,minWidth:0}}>
                                                    <p className="rl-person-name">{nome}</p>
                                                    {s.telefone && <p className="rl-person-sub">📞 {s.telefone}</p>}
                                                </div>
                                                <span style={{display:"inline-flex",padding:"4px 10px",borderRadius:99,background:"rgba(139,92,246,.1)",color:"#8b5cf6",border:"1px solid rgba(139,92,246,.28)",fontSize:9,fontWeight:600,textTransform:"uppercase",whiteSpace:"nowrap"}}>Simpatizante</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ABA: AUSENTES */}
                            {!naoRealizada && aba==="ausentes" && (
                                <div className="rl-tab-panel">
                                    {membrosAusentes.length===0 ? (
                                        <div className="rl-mini-empty">Nenhuma ausência registrada 🎉</div>
                                    ) : (
                                        <>
                                            {ausentesJustif.length > 0 && (
                                                <>
                                                    <p style={{fontFamily:"'Inter',sans-serif",fontSize:9,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:"#6366F1",margin:"0 0 6px"}}>Justificados ({ausentesJustif.length})</p>
                                                    {ausentesJustif.map((a,i) => (
                                                        <div key={i} className="rl-person-row" style={{border:`1px solid ${getJustificativaInfo(a.justificativaFalta).borda}`}}>
                                                            <div className="rl-avatar" style={{background:`${getJustificativaInfo(a.justificativaFalta).cor}18`,color:getJustificativaInfo(a.justificativaFalta).cor}}>{(a.nome||a.membroNome||"?").charAt(0).toUpperCase()}</div>
                                                            <div style={{flex:1,minWidth:0}}>
                                                                <p className="rl-person-name">{a.nome||a.membroNome||`Membro #${a.membroId||a.id}`}</p>
                                                                {a.observacao && <p className="rl-person-sub">{a.observacao}</p>}
                                                            </div>
                                                            <BadgeJustificativa valor={a.justificativaFalta} />
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                            {ausentesSemJust.length > 0 && (
                                                <>
                                                    <p style={{fontFamily:"'Inter',sans-serif",fontSize:9,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:t.textMuted,margin:`${ausentesJustif.length>0?"8px":"0"} 0 6px`}}>Sem Justificativa ({ausentesSemJust.length})</p>
                                                    {ausentesSemJust.map((a,i) => (
                                                        <div key={i} className="rl-person-row">
                                                            <div className="rl-avatar" style={{background:isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",color:t.textMuted}}>{(a.nome||a.membroNome||"?").charAt(0).toUpperCase()}</div>
                                                            <div style={{flex:1,minWidth:0}}>
                                                                <p className="rl-person-name" style={{color:t.textSec}}>{a.nome||a.membroNome||`Membro #${a.membroId||a.id}`}</p>
                                                            </div>
                                                            <span style={{display:"inline-flex",padding:"4px 10px",borderRadius:99,background:isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)",color:t.textMuted,border:`1px dashed ${t.border}`,fontSize:9,fontWeight:600,textTransform:"uppercase",whiteSpace:"nowrap"}}>Sem justif.</span>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ABA: DECISÕES */}
                            {!naoRealizada && aba==="decisoes" && (
                                <div className="rl-tab-panel">
                                    {comDecisao.length===0 ? (
                                        <div className="rl-mini-empty">Nenhuma decisão espiritual nesta célula.</div>
                                    ) : comDecisao.map((v,i) => {
                                        const dt = {ACEITOU_JESUS:"Novo Convertido",RECONCILIOU:"Reconciliação",BATISMO_AGUAS:"Deseja Batismo"}[v.decisaoEspiritual]||v.decisaoEspiritual;
                                        return (
                                            <div key={i} className="rl-person-row" style={{border:`1px solid ${getDecisaoCor(v.decisaoEspiritual).borderColor}`}}>
                                                <div className="rl-avatar" style={{background:`${getDecisaoCor(v.decisaoEspiritual).color}18`,color:getDecisaoCor(v.decisaoEspiritual).color}}>{v.nome.charAt(0).toUpperCase()}</div>
                                                <div style={{flex:1,minWidth:0}}>
                                                    <p className="rl-person-name">{v.nome}</p>
                                                    {v.telefone    && <p className="rl-person-sub">📞 {v.telefone}</p>}
                                                    {v.indicadoPor && <p className="rl-person-sub">Indicado por: {v.indicadoPor}</p>}
                                                </div>
                                                <span className="rl-decisao-badge" style={getDecisaoCor(v.decisaoEspiritual)}>{dt}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    ), document.body);
}

/* ─── Componente Principal ───────────────────────────────────────────────── */
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

    const fmtShort = (s) => {
        if (!s) return "?";
        const [a,m,d] = s.split("-").map(Number);
        return new Date(a,m-1,d).toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"short"});
    };
    const getDecisaoTexto = (d) => ({ACEITOU_JESUS:"Novo Convertido",RECONCILIOU:"Reconciliação",BATISMO_AGUAS:"Deseja Batismo",NENHUMA:"Nenhuma"}[d]||d||"—");
    const getJustInfo     = (v) => getJustificativaInfo(v);

    const carregarSemanaAtual = () => {
        const hoje=new Date(), ds=hoje.getDay();
        const dom=new Date(hoje); dom.setDate(hoje.getDate()-ds);
        const sab=new Date(dom);  sab.setDate(dom.getDate()+6);
        setDataInicio(dom.toISOString().split("T")[0]);
        setDataFim(sab.toISOString().split("T")[0]);
    };

    const carregarRelatorios = useCallback(async () => {
        try {
            setLoading(true); setErro(null);
            const token = localStorage.getItem("token")?.replace(/"/g,"").trim();
            if (!token) return;
            const res = await api.get(`/relatorios/semana?inicio=${dataInicio}&fim=${dataFim}`,{headers:{Authorization:`Bearer ${token}`}});
            setRelatorios(Array.isArray(res.data)?res.data:res.data?.relatorios||[]);
        } catch { setErro("Erro ao buscar dados."); }
        finally   { setLoading(false); }
    }, [dataInicio, dataFim]);

    const { realizadas, naoRealizadas } = useMemo(() => ({
        realizadas:    relatorios.filter(r => r.realizada !== false),
        naoRealizadas: relatorios.filter(r => r.realizada === false),
    }), [relatorios]);

    const totais = useMemo(() => realizadas.reduce((acc,rel) => {
        const m  = rel.membrosPresentes?.length||0;
        const v  = (rel.visitantesPresentes?.length||0)+(rel.quantidadeVisitantes||0);
        const jf = (rel.membrosAusentes||[]).filter(a=>a.justificativaFalta).length;
        return {membros:acc.membros+m,visitantes:acc.visitantes+v,geral:acc.geral+m+v,justificadas:acc.justificadas+jf};
    },{membros:0,visitantes:0,geral:0,justificadas:0}), [realizadas]);

    useEffect(() => { carregarSemanaAtual(); }, []);
    useEffect(() => { carregarRelatorios(); },  [carregarRelatorios]);

    const handleVerDetalhes = (rel) => { setSelectedRel(rel); setIsModalOpen(true); };
    const handleCloseModal  = ()    => { setIsModalOpen(false); setSelectedRel(null); };

    const baixarPDF = () => {
        setBaixandoPDF(true);
        const doc = new jsPDF();
        doc.setFontSize(16); doc.setTextColor(0,36,112);
        doc.text("Relatório Geral de Células",14,20);
        doc.setFontSize(9); doc.setTextColor(100);
        doc.text(`Período: ${fmtShort(dataInicio)} a ${fmtShort(dataFim)}  |  Membros: ${totais.membros}  |  Visitantes: ${totais.visitantes}  |  Total: ${totais.geral}  |  Faltas: ${totais.justificadas}`,14,28);
        autoTable(doc,{
            startY:34,
            head:[["Célula","Data","Membros","Visitas","Total","Estudo","Faltas Just."]],
            body:realizadas.map(r=>[r.nomeCelula,new Date(r.dataReuniao).toLocaleDateString("pt-BR"),r.membrosPresentes?.length||0,(r.visitantesPresentes?.length||0)+(r.quantidadeVisitantes||0),(r.membrosPresentes?.length||0)+(r.visitantesPresentes?.length||0)+(r.quantidadeVisitantes||0),r.estudo||"N/A",(r.membrosAusentes||[]).filter(a=>a.justificativaFalta).length]),
            theme:"grid",headStyles:{fillColor:[0,36,112]},
        });
        if(naoRealizadas.length>0){
            const fy=doc.lastAutoTable?.finalY||60;
            doc.setFontSize(13);doc.setTextColor(139,11,31);
            doc.text("Células Não Realizadas",14,fy+16);
            autoTable(doc,{startY:fy+22,head:[["Célula","Data","Motivo"]],body:naoRealizadas.map(r=>[r.nomeCelula,new Date(r.dataReuniao).toLocaleDateString("pt-BR"),getMotivoLabel(r.motivoNaoRealizacao).label]),theme:"grid",headStyles:{fillColor:[196,140,0]}});
        }
        const fj=realizadas.flatMap(r=>(r.membrosAusentes||[]).filter(a=>a.justificativaFalta).map(a=>[r.nomeCelula,new Date(r.dataReuniao).toLocaleDateString("pt-BR"),a.nome||a.membroNome||`Membro #${a.membroId||a.id}`,getJustificativaInfo(a.justificativaFalta).label]));
        if(fj.length>0){
            const fy2=doc.lastAutoTable?.finalY||60;
            doc.setFontSize(13);doc.setTextColor(196,140,0);
            doc.text("Faltas Justificadas",14,fy2+16);
            autoTable(doc,{startY:fy2+22,head:[["Célula","Data","Membro","Justificativa"]],body:fj,theme:"grid",headStyles:{fillColor:[196,140,0]}});
        }
        const td=realizadas.flatMap(r=>(r.visitantesPresentes||[]).filter(v=>v.decisaoEspiritual&&v.decisaoEspiritual!=="NENHUMA").map(v=>[r.nomeCelula,v.nome,getDecisaoTexto(v.decisaoEspiritual)]));
        if(td.length>0){
            doc.addPage();
            doc.setFontSize(13);doc.setTextColor(0,36,112);
            doc.text("Decisões Espirituais da Semana",14,20);
            autoTable(doc,{startY:28,head:[["Célula","Visitante","Decisão"]],body:td,theme:"grid",headStyles:{fillColor:[139,11,31]}});
        }
        doc.save("relatorio-celulas.pdf");
        setBaixandoPDF(false);
    };

    if (loading) return (
        <div className="rl-root">
            <GlobalStylesRel t={t} isDark={isDark} />
            <div className="rl-glow" />
            <div className="rl-loading">
                <div style={{position:"relative",width:80,height:80,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{position:"absolute",width:80,height:80,borderRadius:"50%",border:"1px solid rgba(201,169,110,.25)",animation:"rl-pulse 3s ease-in-out infinite"}} />
                    <div style={{position:"absolute",width:60,height:60,borderRadius:"50%",border:"1px solid rgba(201,169,110,.18)",animation:"rl-pulse 3s ease-in-out infinite",animationDelay:".9s"}} />
                    <Loader2 size={28} className="rl-spin" style={{color:AURA.gold,position:"relative",zIndex:1}} />
                </div>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:9,fontWeight:600,letterSpacing:".25em",textTransform:"uppercase",color:AURA.gold,opacity:.7,margin:0}}>Sincronizando…</p>
            </div>
        </div>
    );

    return (
        <div className="rl-root">
            <GlobalStylesRel t={t} isDark={isDark} />
            <div className="rl-glow" />

            <div className="rl-content">
                {/* Header */}
                <motion.div className="rl-header" initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} transition={{duration:.35}}>
                    <div>
                        <p className="rl-eyebrow"><Sparkles size={10} style={{color:AURA.gold}} /> Gestão de Crescimento</p>
                        <h2 className="rl-title">Relatórios da Rede</h2>
                    </div>
                    <div className="rl-header-actions">
                        <NotificacaoPanel naoRealizadas={naoRealizadas} isDark={isDark} t={t} onVerDetalhes={handleVerDetalhes} />
                        <button className="rl-btn-ghost" onClick={() => setShowFilters(v=>!v)} aria-label="Filtrar">
                            <Filter size={14} />
                            <span style={{display:"none"}} className="rl-btn-label">Filtrar</span>
                        </button>
                        <button className="rl-btn-gold" onClick={baixarPDF} disabled={baixandoPDF||relatorios.length===0} aria-label="Exportar PDF">
                            {baixandoPDF ? <Loader2 size={14} className="rl-spin" /> : <Download size={14} />}
                            <span style={{display:"none"}} className="rl-btn-label">PDF</span>
                        </button>
                    </div>
                </motion.div>

                <style>{`@media(min-width:400px){.rl-btn-label{display:inline!important;}}`}</style>

                <div className="rl-divider"><div className="rl-divider-dot" /></div>

                {/* Filtros */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} style={{overflow:"hidden"}}>
                            <div className="rl-filters">
                                <span className="rl-filter-label">De</span>
                                <input className="rl-input" type="date" value={dataInicio} onChange={e=>setDataInicio(e.target.value)} />
                                <span className="rl-filter-label">Até</span>
                                <input className="rl-input" type="date" value={dataFim} onChange={e=>setDataFim(e.target.value)} />
                                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                                    <button className="rl-btn-ghost" onClick={carregarSemanaAtual} style={{flex:"0 0 auto"}}>Esta Semana</button>
                                    <button className="rl-btn-gold" onClick={carregarRelatorios} style={{flex:"0 0 auto"}}>Aplicar</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {erro && (
                    <div className="rl-empty" style={{marginBottom:18,padding:"18px 20px"}}>
                        <AlertCircle size={26} style={{color:AURA.red}} />
                        <p style={{color:t.textSec}}>{erro}</p>
                    </div>
                )}

                {/* KPIs */}
                <div className="rl-kpi-grid">
                    <div className="rl-kpi-card">
                        <div className="rl-kpi-icon" style={{background:"rgba(200,16,46,.1)"}}><Users size={18} style={{color:AURA.red}} /></div>
                        <div><p className="rl-kpi-label">Membros</p><p className="rl-kpi-value">{totais.membros}</p></div>
                    </div>
                    <div className="rl-kpi-card">
                        <div className="rl-kpi-icon" style={{background:"rgba(201,169,110,.12)"}}><UserPlus size={18} style={{color:AURA.gold}} /></div>
                        <div><p className="rl-kpi-label">Visitantes</p><p className="rl-kpi-value">{totais.visitantes}</p></div>
                    </div>
                    <div className="rl-kpi-card hero">
                        <div className="rl-kpi-icon" style={{background:"rgba(255,255,255,.15)"}}><TrendingUp size={18} style={{color:"#fff"}} /></div>
                        <div><p className="rl-kpi-label">Total</p><p className="rl-kpi-value">{totais.geral}</p></div>
                    </div>
                    <div className="rl-kpi-card">
                        <div className="rl-kpi-icon" style={{background:"rgba(99,102,241,.1)"}}><UserX size={18} style={{color:"#6366F1"}} /></div>
                        <div><p className="rl-kpi-label">Faltas Just.</p><p className="rl-kpi-value">{totais.justificadas}</p></div>
                    </div>
                    <div className={`rl-kpi-card ${naoRealizadas.length>0?"alert":""}`}>
                        <div className="rl-kpi-icon" style={{background:naoRealizadas.length>0?"rgba(26,16,8,.12)":"rgba(201,169,110,.12)"}}><Ban size={18} style={{color:naoRealizadas.length>0?"#1A1008":AURA.gold}} /></div>
                        <div><p className="rl-kpi-label">Não Real.</p><p className="rl-kpi-value">{naoRealizadas.length}</p></div>
                    </div>
                </div>

                {/* Não Realizadas */}
                {naoRealizadas.length > 0 && (
                    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
                        <div className="rl-section-hd">
                            <span className="rl-section-badge" style={{background:"rgba(253,184,19,.12)",border:"1px solid rgba(253,184,19,.3)",color:"#c8a010"}}>
                                <AlertTriangle size={12} /> Não Realizadas — {naoRealizadas.length}
                            </span>
                            <div className="rl-section-line" style={{background:"linear-gradient(90deg,rgba(253,184,19,.3),transparent)"}} />
                        </div>
                        <div className="rl-grid">
                            {naoRealizadas.map((rel,i) => {
                                const mot = getMotivoLabel(rel.motivoNaoRealizacao);
                                return (
                                    <motion.div key={rel.id} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:i*.04}} className="rl-card" onClick={() => handleVerDetalhes(rel)}>
                                        <div className="rl-card-strip" style={{background:`linear-gradient(90deg,#c8a010,${AURA.yellow})`}} />
                                        <div className="rl-card-body">
                                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:8}}>
                                                <div className="rl-card-icon" style={{background:"rgba(253,184,19,.14)",fontSize:18}}>{mot.icone}</div>
                                                <div style={{textAlign:"right"}}>
                                                    <p style={{fontSize:8,letterSpacing:".1em",color:t.textMuted,margin:"0 0 2px",textTransform:"uppercase",fontWeight:600}}>Data</p>
                                                    <p className="rl-card-date">{fmtShort(rel.dataReuniao)}</p>
                                                </div>
                                            </div>
                                            <h3 className="rl-card-title" style={{marginBottom:10}}>{rel.nomeCelula}</h3>
                                            <div className="rl-card-tag" style={{background:"rgba(253,184,19,.1)",border:"1px solid rgba(253,184,19,.25)",color:"#c8a010"}}>
                                                <Ban size={11} /> {mot.label}
                                            </div>
                                        </div>
                                        <div className="rl-card-footer" style={{color:"#c8a010"}}>
                                            <span>Ver Detalhes</span><ChevronRight size={13} />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Realizadas */}
                {realizadas.length > 0 && (
                    <>
                        <div className="rl-section-hd">
                            <span className="rl-section-badge" style={{background:"rgba(201,169,110,.1)",border:"1px solid rgba(201,169,110,.25)",color:AURA.gold}}>
                                <Calendar size={12} /> Realizadas — {realizadas.length}
                            </span>
                            <div className="rl-section-line" style={{background:"linear-gradient(90deg,rgba(201,169,110,.25),transparent)"}} />
                        </div>
                        <div className="rl-grid">
                            {realizadas.map((rel,i) => {
                                const m  = rel.membrosPresentes?.length||0;
                                const v  = (rel.visitantesPresentes?.length||0)+(rel.quantidadeVisitantes||0);
                                const decisoes       = (rel.visitantesPresentes||[]).filter(vt=>vt.decisaoEspiritual&&vt.decisaoEspiritual!=="NENHUMA");
                                const ausentesJ      = (rel.membrosAusentes||[]).filter(a=>a.justificativaFalta);
                                const simpCount      = (rel.simpatizantes||[]).length;
                                return (
                                    <motion.div key={rel.id} initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:i*.03}} className="rl-card" onClick={() => handleVerDetalhes(rel)}>
                                        <div className="rl-card-body" style={{paddingBottom:14}}>
                                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:8}}>
                                                <div className="rl-card-icon" style={{background:"rgba(201,169,110,.12)"}}><Calendar size={17} style={{color:AURA.gold}} /></div>
                                                <div style={{textAlign:"right"}}>
                                                    <p style={{fontSize:8,letterSpacing:".1em",color:t.textMuted,margin:"0 0 2px",textTransform:"uppercase",fontWeight:600}}>Data</p>
                                                    <p className="rl-card-date">{fmtShort(rel.dataReuniao)}</p>
                                                </div>
                                            </div>
                                            <h3 className="rl-card-title" style={{marginBottom:10}}>{rel.nomeCelula}</h3>
                                            <div className="rl-card-tag" style={{background:isDark?"rgba(255,255,255,.03)":"rgba(201,169,110,.06)",border:`1px solid ${t.border}`,color:t.textSec,marginBottom:(decisoes.length>0||ausentesJ.length>0||simpCount>0)?8:0}}>
                                                <BookOpen size={11} style={{flexShrink:0}} />
                                                <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{rel.estudo||"Sem estudo informado"}</span>
                                            </div>
                                            {simpCount>0&&<div className="rl-card-tag" style={{background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.2)",color:"#8b5cf6",marginBottom:(decisoes.length>0||ausentesJ.length>0)?8:0}}><Users size={11} style={{flexShrink:0}} />{simpCount} simpatizante{simpCount>1?"s":""}</div>}
                                            {decisoes.length>0&&<div className="rl-card-tag" style={{background:"rgba(253,184,19,.08)",border:"1px solid rgba(253,184,19,.2)",color:"#c8a010",marginBottom:ausentesJ.length>0?8:0}}><Sparkles size={11} style={{flexShrink:0}} />{decisoes.length} decisão{decisoes.length>1?"ões":""}</div>}
                                            {ausentesJ.length>0&&<div className="rl-card-tag" style={{background:"rgba(99,102,241,.08)",border:"1px solid rgba(99,102,241,.2)",color:"#6366F1"}}><UserX size={11} style={{flexShrink:0}} />{ausentesJ.length} falta{ausentesJ.length>1?"s":""} justificada{ausentesJ.length>1?"s":""}</div>}
                                        </div>
                                        <div className="rl-card-stats">
                                            {[{label:"Membros",value:m,color:t.text},{label:"Visitas",value:v,color:AURA.gold},{label:"Total",value:m+v,color:AURA.blue}].map((k,ki)=>(
                                                <div key={ki} className="rl-card-stat">
                                                    <p className="rl-card-stat-value" style={{color:k.color}}>{k.value}</p>
                                                    <p className="rl-card-stat-label">{k.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="rl-card-footer" style={{color:AURA.gold}}>
                                            <span>Ver Detalhes</span><ChevronRight size={13} />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}

                {relatorios.length===0&&!loading&&!erro&&(
                    <div className="rl-empty">
                        <AlertCircle size={34} style={{color:t.textMuted}} />
                        <p>Nenhum relatório encontrado</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && selectedRel && (
                    <ModalDetalhes rel={selectedRel} isDark={isDark} t={t} onClose={handleCloseModal} />
                )}
            </AnimatePresence>
        </div>
    );
}
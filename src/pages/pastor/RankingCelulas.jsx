import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Crown, Medal, Award, Search, Users, Flame, Star,
  ChevronLeft, ChevronRight, ChevronDown, Loader2, Sparkles,
  RefreshCw, Info, UserPlus, HeartHandshake, Droplet, Droplets,
  Handshake, GitBranch,
} from "lucide-react";

/* ─── Tokens AURA (mesmos do Dashboard) ────────────────────────────────── */
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

/* Cores por posição — alinhadas à identidade da igreja (ouro / azul / vermelho) */
const RANK_STYLE = {
  1: { main: AURA.gold, grad: `${AURA.gold}, ${AURA.goldLight}`, Icon: Crown, glow: "rgba(201,169,110,.28)" },
  2: { main: AURA.blue, grad: `${AURA.blueDark}, ${AURA.blue}`,  Icon: Medal, glow: "rgba(0,61,165,.22)" },
  3: { main: AURA.red,  grad: `${AURA.redDark}, ${AURA.red}`,    Icon: Award, glow: "rgba(200,16,46,.2)" },
};

/* Critérios que compõem a pontuação mensal */
const CRITERIOS = [
  { key: "presencaMedia", label: "Presença Média",   Icon: Users,         color: AURA.blue },
  { key: "visitantes",    label: "Visitantes",        Icon: UserPlus,      color: "#c8a010" },
  { key: "consolidados",  label: "Consolidados",      Icon: HeartHandshake,color: AURA.red },
  { key: "aceitouJesus",  label: "Aceitaram Jesus",    Icon: Sparkles,      color: AURA.gold },
  { key: "desejaBatismo", label: "Desejam Batismo",    Icon: Droplet,       color: AURA.blue },
  { key: "batismos",      label: "Batismos",           Icon: Droplets,      color: AURA.blue },
  { key: "reconciliou",   label: "Reconciliações",     Icon: Handshake,     color: AURA.red },
];

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatMesAno(date) {
  return `${MESES_PT[date.getMonth()]} de ${date.getFullYear()}`;
}
function toMesParam(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/* ─── Logo (mesmo asset do Dashboard) ──────────────────────────────────── */
function IEQCross({ size = 30 }) {
  return (
      <img
          src="/quadrangular.png"
          alt="Logo IEQ"
          style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }}
      />
  );
}

/* ─── CSS Global (segue exatamente os padrões dl- do Dashboard) ────────── */
function GlobalStyles({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes dl-spin   { to { transform: rotate(360deg); } }
      @keyframes dl-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes dl-blink  { 0%,100%{opacity:1;} 50%{opacity:.3;} }
      @keyframes rk-rise   { from { transform: translateY(18px); opacity:0; } to { transform: translateY(0); opacity:1; } }
      @keyframes rk-shine  {
        0%   { transform: translateX(-120%) rotate(8deg); }
        100% { transform: translateX(220%)  rotate(8deg); }
      }
      @keyframes rk-flicker { 0%,100%{opacity:1;} 50%{opacity:.55;} }

      .dl-spin  { animation: dl-spin  1s linear infinite; }
      .dl-pulse { animation: dl-pulse 3s ease-in-out infinite; }
      .dl-blink { animation: dl-blink 2s ease-in-out infinite; }

      .rk-root { font-family: 'Inter', sans-serif; color: ${t.text}; }

      /* ── Cabeçalho ── */
      .rk-hd {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; margin-bottom: 16px; flex-wrap: wrap;
      }
      .rk-hd-left { display: flex; align-items: center; gap: 13px; min-width: 0; }
      .rk-hd-icon {
        width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, rgba(201,169,110,.85), ${AURA.goldLight});
        color: ${AURA.dark};
        box-shadow: 0 8px 22px rgba(201,169,110,.28);
      }
      .rk-eyebrow {
        font-size: 9px; font-weight: 500; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(201,169,110,.55); margin: 0 0 3px;
      }
      .rk-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(18px, 4.4vw, 23px); font-weight: 500;
        color: ${t.text}; margin: 0; line-height: 1.2; letter-spacing: .02em;
      }
      .rk-subtitle {
        font-size: 11px; font-weight: 300; color: ${t.textSec}; margin: 3px 0 0;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }

      .rk-btn-refresh {
        width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${t.border}; color: ${t.textMuted};
        cursor: pointer; transition: all .25s;
      }
      .rk-btn-refresh:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }
      .rk-btn-refresh:disabled { opacity: .5; cursor: default; }

      /* ── Navegador de mês ── */
      .rk-month-nav {
        display: flex; align-items: center; justify-content: space-between;
        gap: 10px; padding: 6px;
        background: ${isDark ? "rgba(255,255,255,.03)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${t.border}; border-radius: 100px;
        margin-bottom: 14px;
      }
      .rk-month-btn {
        width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer;
        background: transparent; color: ${t.textMuted};
        display: flex; align-items: center; justify-content: center;
        transition: all .2s; flex-shrink: 0;
      }
      .rk-month-btn:hover:not(:disabled) { background: rgba(201,169,110,.12); color: ${AURA.gold}; }
      .rk-month-btn:disabled { opacity: .3; cursor: default; }
      .rk-month-label {
        flex: 1; text-align: center; min-width: 0;
        font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 500;
        color: ${t.text}; letter-spacing: .02em;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .rk-month-now {
        font-size: 8.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
        color: ${AURA.gold}; background: rgba(201,169,110,.1);
        border: 1px solid rgba(201,169,110,.25); border-radius: 100px;
        padding: 5px 10px; cursor: pointer; flex-shrink: 0; transition: all .2s;
      }
      .rk-month-now:hover { background: rgba(201,169,110,.18); }

      /* ── Busca ── */
      .rk-search-wrap { position: relative; margin-bottom: 20px; }
      .rk-search-icon {
        position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
        color: ${AURA.gold}; opacity: .5; pointer-events: none;
      }
      .rk-input {
        width: 100%; box-sizing: border-box;
        background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 13px 16px 13px 44px;
        border-radius: 13px; outline: none;
        font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
        transition: all .25s; -webkit-appearance: none; appearance: none;
      }
      .rk-input:focus {
        border-color: rgba(201,169,110,.5);
        background: rgba(201,169,110,.04);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .rk-input::placeholder { color: ${t.placeholder}; }

      /* ── Pódio ── */
      .rk-podium {
        display: grid; grid-template-columns: 1fr 1fr 1fr;
        align-items: end; gap: 8px; margin-bottom: 22px;
      }
      .rk-podium-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 18px; padding: 16px 8px 18px;
        text-align: center; position: relative; overflow: hidden;
        backdrop-filter: blur(20px);
        animation: rk-rise .5s cubic-bezier(.2,.8,.2,1) backwards;
        min-width: 0; cursor: pointer;
      }
      .rk-podium-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      }
      .rk-podium-1 { order: 2; padding-top: 22px; padding-bottom: 24px; transform: translateY(-10px); z-index: 2; animation-delay: .05s; }
      .rk-podium-2 { order: 1; animation-delay: .15s; }
      .rk-podium-3 { order: 3; animation-delay: .25s; }
      @media(min-width: 420px) {
        .rk-podium-1 { padding-top: 28px; padding-bottom: 30px; }
      }

      .rk-podium-shine {
        position: absolute; top: -40%; left: -10%; width: 60%; height: 220%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.16), transparent);
        animation: rk-shine 3.4s ease-in-out infinite;
        pointer-events: none;
      }

      .rk-podium-medal {
        width: 38px; height: 38px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 8px; position: relative; z-index: 1;
      }
      .rk-podium-1 .rk-podium-medal { width: 46px; height: 46px; }

      .rk-podium-avatar {
        width: 46px; height: 46px; border-radius: 13px; margin: 0 auto 10px;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Playfair Display', serif; font-weight: 600; font-size: 18px;
        background: linear-gradient(135deg, rgba(201,169,110,.2), rgba(201,169,110,.06));
        border: 1px solid rgba(201,169,110,.22); color: ${AURA.gold};
        position: relative; z-index: 1;
      }
      .rk-podium-1 .rk-podium-avatar { width: 56px; height: 56px; font-size: 22px; }

      .rk-podium-name {
        font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 500;
        color: ${t.text}; margin: 0 0 2px; line-height: 1.25;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        padding: 0 4px; position: relative; z-index: 1;
      }
      .rk-podium-1 .rk-podium-name { font-size: 15px; }
      .rk-podium-lider {
        font-size: 9px; font-weight: 400; color: ${t.textMuted};
        margin: 0 0 10px; overflow: hidden; text-overflow: ellipsis;
        white-space: nowrap; padding: 0 6px; position: relative; z-index: 1;
      }
      .rk-podium-score {
        display: inline-flex; align-items: baseline; gap: 4px;
        font-family: 'Playfair Display', serif; font-weight: 600;
        color: ${t.text}; position: relative; z-index: 1;
      }
      .rk-podium-score-num { font-size: 20px; line-height: 1; }
      .rk-podium-1 .rk-podium-score-num { font-size: 26px; }
      .rk-podium-score-unit {
        font-size: 8px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; color: ${t.textMuted};
      }
      .rk-podium-rankbg {
        position: absolute; bottom: -10px; right: -6px;
        font-family: 'Playfair Display', serif; font-weight: 600;
        font-size: 56px; line-height: 1; opacity: .06; pointer-events: none;
      }

      /* ── Lista geral ── */
      .rk-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 20px; overflow: hidden; margin-bottom: 18px;
        backdrop-filter: blur(24px); position: relative;
      }
      .rk-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }
      .rk-card-head {
        padding: 18px 20px; border-bottom: 1px solid ${t.border};
        display: flex; align-items: center; justify-content: space-between; gap: 10px;
      }
      .rk-card-head-title {
        font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 500;
        color: ${t.text}; margin: 0;
      }
      .rk-card-head-sub { font-size: 11px; font-weight: 300; color: ${t.textMuted}; margin: 3px 0 0; }

      .rk-list { padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }

      .rk-row {
        border-radius: 13px;
        background: ${isDark ? "rgba(255,255,255,.025)" : "rgba(201,169,110,.04)"};
        border: 1px solid ${isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.12)"};
        transition: border-color .2s; min-width: 0;
        animation: rk-rise .4s cubic-bezier(.2,.8,.2,1) backwards;
        cursor: pointer; overflow: hidden;
      }
      .rk-row:hover { border-color: rgba(201,169,110,.3); }
      .rk-row.is-self {
        border-color: rgba(201,169,110,.45);
        background: ${isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.09)"};
      }

      .rk-row-main {
        display: flex; align-items: center; gap: 12px; padding: 12px 14px; min-width: 0;
      }

      .rk-rank {
        width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Playfair Display', serif; font-weight: 600; font-size: 13px;
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.035)"};
        color: ${t.textSec}; border: 1px solid ${t.border};
      }

      .rk-row-avatar {
        width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
        background: linear-gradient(135deg, rgba(201,169,110,.2), rgba(201,169,110,.06));
        border: 1px solid rgba(201,169,110,.22);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Playfair Display', serif; font-weight: 600;
        font-size: 15px; color: ${AURA.gold};
      }

      .rk-row-info { flex: 1; min-width: 0; }
      .rk-row-name {
        display: flex; align-items: center; gap: 6px;
        font-size: 13px; font-weight: 400; color: ${t.text};
      }
      .rk-row-name-text {
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;
      }
      .rk-row-lider {
        font-size: 10.5px; font-weight: 300; color: ${t.textMuted}; margin-top: 1px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }

      .rk-self-tag {
        font-size: 7.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
        color: ${AURA.gold}; background: rgba(201,169,110,.12);
        border: 1px solid rgba(201,169,110,.3); border-radius: 100px;
        padding: 2px 7px; flex-shrink: 0; line-height: 1.5;
      }
      .rk-multi-tag {
        display: inline-flex; align-items: center; gap: 3px;
        font-size: 7.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
        color: #c8a010; background: rgba(253,184,19,.12);
        border: 1px solid rgba(253,184,19,.3); border-radius: 100px;
        padding: 2px 7px; flex-shrink: 0; line-height: 1.5;
      }

      .rk-row-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
      .rk-row-score {
        font-family: 'Playfair Display', serif; font-weight: 600; font-size: 16px;
        color: ${t.text}; line-height: 1; text-align: right;
      }
      .rk-row-score-unit {
        display: block; font-size: 7.5px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; color: ${t.textMuted}; margin-top: 2px;
      }
      .rk-row-chevron { color: ${t.textMuted}; transition: transform .25s; flex-shrink: 0; }

      /* ── Detalhe expandido ── */
      .rk-row-detail {
        padding: 0 14px 14px 14px;
        display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
      }
      @media(min-width: 460px) {
        .rk-row-detail { grid-template-columns: repeat(4, 1fr); }
      }
      .rk-stat {
        display: flex; align-items: center; gap: 8px; padding: 8px 10px;
        border-radius: 10px;
        background: ${isDark ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.5)"};
        border: 1px solid ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.12)"};
        min-width: 0;
      }
      .rk-stat-icon {
        width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }
      .rk-stat-text { min-width: 0; }
      .rk-stat-value {
        font-family: 'Playfair Display', serif; font-weight: 600; font-size: 13px;
        color: ${t.text}; line-height: 1.2;
      }
      .rk-stat-label {
        font-size: 8.5px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase;
        color: ${t.textMuted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .rk-row-detail-multi {
        grid-column: 1 / -1; display: flex; align-items: center; gap: 8px;
        padding: 9px 12px; border-radius: 10px;
        background: rgba(253,184,19,.08); border: 1px solid rgba(253,184,19,.25);
        color: #c8a010; font-size: 11px; font-weight: 500;
      }

      .rk-empty {
        text-align: center; padding: 34px 16px;
        font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 300;
        font-style: italic; color: ${t.textMuted};
      }

      /* ── Bloco "como funciona" ── */
      .rk-info-toggle {
        display: flex; align-items: center; justify-content: space-between;
        gap: 10px; width: 100%; cursor: pointer; background: none; border: none;
        color: inherit; padding: 0; text-align: left; font-family: 'Inter', sans-serif;
      }
      .rk-info-toggle-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .rk-info-icon {
        width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        background: rgba(201,169,110,.08); border: 1px solid rgba(201,169,110,.2);
        color: ${AURA.gold};
      }
      .rk-info-title { font-size: 12px; font-weight: 600; color: ${t.text}; margin: 0; letter-spacing: .02em; }
      .rk-info-sub { font-size: 10.5px; font-weight: 300; color: ${t.textMuted}; margin: 1px 0 0; }
      .rk-info-chevron { color: ${t.textMuted}; flex-shrink: 0; transition: transform .25s; }
      .rk-info-body {
        font-size: 12px; font-weight: 300; line-height: 1.7; color: ${t.textSec};
        padding-top: 14px; margin-top: 14px;
        border-top: 1px solid ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.14)"};
      }
      .rk-info-row {
        display: flex; align-items: center; gap: 10px; padding: 7px 0;
        border-bottom: 1px solid ${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)"};
        font-size: 12px; color: ${t.textSec};
      }
      .rk-info-row:last-child { border-bottom: none; }
      .rk-info-row-icon {
        width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }

      /* ── Loading ── */
      .rk-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 70px 0; }
      .rk-loading-rings { position: relative; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 18px; }

      .rk-footer {
        text-align: center; font-size: 9px; font-weight: 500; letter-spacing: .18em;
        text-transform: uppercase; color: ${isDark ? "rgba(245,240,232,.12)" : "rgba(26,16,8,.15)"};
        padding: 6px 0 16px;
      }

      @media(max-width: 360px) {
        .rk-podium-name  { font-size: 11.5px; }
        .rk-podium-1 .rk-podium-name { font-size: 13px; }
        .rk-podium-lider { display: none; }
        .rk-podium-score-num { font-size: 17px; }
        .rk-podium-1 .rk-podium-score-num { font-size: 22px; }
        .rk-row-lider { display: none; }
      }
    `}</style>
  );
}

/* ─── Componente Principal ─────────────────────────────────────────────── */
export default function RankingCelulas({ isDark = false, celulaId = null }) {
  const [ranking,   setRanking]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [erro,      setErro]      = useState(false);
  const [busca,     setBusca]     = useState("");
  const [mesRef,    setMesRef]    = useState(() => new Date());
  const [expandido, setExpandido] = useState(null);
  const [infoAberto,setInfoAberto]= useState(false);

  const t = theme(isDark);

  const hoje = new Date();
  const isMesAtual =
      mesRef.getFullYear() === hoje.getFullYear() && mesRef.getMonth() === hoje.getMonth();

  const carregarRanking = useCallback(async (isSilent = false) => {
    try {
      if (isSilent) setRefreshing(true); else setLoading(true);
      setErro(false);
      const res = await api.get("/api/ranking/celulas", { params: { mes: toMesParam(mesRef) } });
      const data = Array.isArray(res.data) ? res.data : [];
      setRanking(data);
    } catch (err) {
      console.error("Erro ao carregar ranking:", err);
      setErro(true);
      setRanking([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mesRef]);

  useEffect(() => { carregarRanking(); setExpandido(null); }, [carregarRanking]);

  useEffect(() => {
    const handler = () => carregarRanking(true);
    window.addEventListener("ieq:ranking:atualizado", handler);
    return () => window.removeEventListener("ieq:ranking:atualizado", handler);
  }, [carregarRanking]);

  const buscaLower = busca.trim().toLowerCase();

  /* Garante ordenação por pontuação e atribui posição quando o backend não fornece */
  const ordenado = useMemo(() => {
    return [...ranking]
        .sort((a, b) => (b.pontuacao ?? 0) - (a.pontuacao ?? 0))
        .map((c, i) => ({ ...c, _posicao: c.posicao && c.posicao > 0 ? c.posicao : i + 1 }));
  }, [ranking]);

  const filtrado = useMemo(
      () => ordenado.filter((c) => (c.nomeCelula || "").toLowerCase().includes(buscaLower)),
      [ordenado, buscaLower]
  );

  const mostrarPodio = buscaLower === "" && ordenado.length >= 3;
  const top3 = mostrarPodio ? ordenado.slice(0, 3) : [];
  const restantes = mostrarPodio ? filtrado.slice(3) : filtrado;

  const navegarMes = (delta) => {
    setMesRef((prev) => {
      const novo = new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
      const limite = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      return novo > limite ? prev : novo;
    });
  };

  const toggleExpandido = (id) => setExpandido((prev) => (prev === id ? null : id));

  if (loading) {
    return (
        <div className="rk-root">
          <GlobalStyles t={t} isDark={isDark} />
          <div className="rk-loading">
            <div className="rk-loading-rings">
              <div className="dl-pulse" style={{ position: "absolute", width: 80, height: 80, border: "1px solid rgba(201,169,110,.25)", borderRadius: "50%" }} />
              <div className="dl-pulse" style={{ position: "absolute", width: 62, height: 62, border: "1px solid rgba(201,169,110,.2)", borderRadius: "50%", animationDelay: ".9s" }} />
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: isDark ? "rgba(18,18,26,.99)" : "#fff", border: "1.5px solid rgba(201,169,110,.28)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
                <IEQCross size={36} />
              </div>
            </div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".25em", textTransform: "uppercase", color: AURA.gold, opacity: .7, margin: 0 }}>
              Carregando ranking…
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="rk-root">
        <GlobalStyles t={t} isDark={isDark} />

        {/* ── Cabeçalho ── */}
        <div className="rk-hd">
          <div className="rk-hd-left">
            <div className="rk-hd-icon">
              <Trophy size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="rk-eyebrow">Comunidade</p>
              <h2 className="rk-title">Ranking de Células</h2>
              <p className="rk-subtitle">{formatMesAno(mesRef)}</p>
            </div>
          </div>
          <button className="rk-btn-refresh" onClick={() => carregarRanking(true)} disabled={refreshing} title="Atualizar">
            <RefreshCw size={15} className={refreshing ? "dl-spin" : ""} />
          </button>
        </div>

        {/* ── Navegador de mês ── */}
        <div className="rk-month-nav">
          <button className="rk-month-btn" onClick={() => navegarMes(-1)} title="Mês anterior">
            <ChevronLeft size={17} />
          </button>
          <span className="rk-month-label">{formatMesAno(mesRef)}</span>
          {isMesAtual ? (
              <span style={{ width: 32 }} />
          ) : (
              <button className="rk-month-now" onClick={() => setMesRef(new Date())}>Atual</button>
          )}
          <button className="rk-month-btn" onClick={() => navegarMes(1)} disabled={isMesAtual} title="Próximo mês">
            <ChevronRight size={17} />
          </button>
        </div>

        {/* ── Busca ── */}
        <div className="rk-search-wrap">
          <Search size={15} className="rk-search-icon" />
          <input
              className="rk-input"
              placeholder="Buscar célula…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* ── Pódio (top 3) ── */}
        {mostrarPodio && (
            <div className="rk-podium">
              {top3.map((c) => {
                const posicao = c._posicao;
                const style = RANK_STYLE[posicao] || RANK_STYLE[3];
                const Icon = style.Icon;
                const isSelf = celulaId && c.celulaId === celulaId;
                return (
                    <div
                        key={c.celulaId}
                        className={`rk-podium-card rk-podium-${posicao}`}
                        onClick={() => toggleExpandido(c.celulaId)}
                        style={{
                          borderColor: isSelf ? "rgba(201,169,110,.5)" : t.border,
                          boxShadow: posicao === 1 ? `0 16px 40px ${style.glow}` : `0 10px 26px ${style.glow}`,
                        }}
                    >
                      <style>{`.rk-podium-${posicao}::before{ background: linear-gradient(90deg, transparent, ${style.main}, transparent); }`}</style>
                      <div className="rk-podium-shine" />
                      <span className="rk-podium-rankbg" style={{ color: style.main }}>{posicao}</span>

                      <div className="rk-podium-medal" style={{ background: `linear-gradient(135deg, ${style.grad})`, color: posicao === 1 ? AURA.dark : "#fff", boxShadow: `0 6px 18px ${style.glow}` }}>
                        <Icon size={posicao === 1 ? 22 : 18} />
                      </div>

                      <div className="rk-podium-avatar">{c.nomeCelula?.charAt(0).toUpperCase()}</div>
                      <p className="rk-podium-name">{c.nomeCelula}</p>
                      <p className="rk-podium-lider">{c.lider || "—"}</p>

                      <div className="rk-podium-score">
                        <span className="rk-podium-score-num">{c.pontuacao ?? 0}</span>
                        <span className="rk-podium-score-unit">pts</span>
                      </div>

                      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                        {isSelf && (
                            <span className="rk-self-tag"><Star size={9} style={{ marginRight: 3, verticalAlign: "-1px" }} />Sua célula</span>
                        )}
                        {c.multiplicou && (
                            <span className="rk-multi-tag"><GitBranch size={9} />Multiplicou</span>
                        )}
                      </div>
                    </div>
                );
              })}
            </div>
        )}

        {/* ── Lista geral ── */}
        <div className="rk-card">
          <div className="rk-card-head">
            <div>
              <h3 className="rk-card-head-title">Classificação</h3>
              <p className="rk-card-head-sub">
                {filtrado.length} célula{filtrado.length === 1 ? "" : "s"}{buscaLower ? " encontrada(s)" : " no mês"}
              </p>
            </div>
            <Sparkles size={16} style={{ color: AURA.gold, opacity: .6, flexShrink: 0 }} />
          </div>

          <div className="rk-list">
            {erro && (
                <p className="rk-empty">Não foi possível carregar o ranking. Toque em atualizar para tentar novamente.</p>
            )}

            {!erro && restantes.length > 0 ? (
                restantes.map((c, idx) => {
                  const isSelf = celulaId && c.celulaId === celulaId;
                  const aberto = expandido === c.celulaId;
                  return (
                      <div
                          key={c.celulaId}
                          className={`rk-row${isSelf ? " is-self" : ""}`}
                          style={{ animationDelay: `${Math.min(idx, 8) * 0.04}s` }}
                          onClick={() => toggleExpandido(c.celulaId)}
                      >
                        <div className="rk-row-main">
                          <div className="rk-rank">{c._posicao}</div>
                          <div className="rk-row-avatar">{c.nomeCelula?.charAt(0).toUpperCase()}</div>
                          <div className="rk-row-info">
                            <div className="rk-row-name">
                              <span className="rk-row-name-text">{c.nomeCelula}</span>
                              {isSelf && <span className="rk-self-tag">Você</span>}
                              {c.multiplicou && <span className="rk-multi-tag"><GitBranch size={9} />Multiplicou</span>}
                            </div>
                            <p className="rk-row-lider">{c.lider || "—"}</p>
                          </div>
                          <div className="rk-row-right">
                            <div>
                              <span className="rk-row-score">{c.pontuacao ?? 0}</span>
                              <span className="rk-row-score-unit">pts</span>
                            </div>
                            <ChevronDown size={16} className="rk-row-chevron" style={{ transform: aberto ? "rotate(180deg)" : "none" }} />
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {aberto && (
                              <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: .22, ease: "easeInOut" }}
                                  style={{ overflow: "hidden" }}
                              >
                                <div className="rk-row-detail">
                                  {CRITERIOS.map(({ key, label, Icon, color }) => (
                                      <div key={key} className="rk-stat">
                                        <div className="rk-stat-icon" style={{ background: `${color}18`, color }}>
                                          <Icon size={13} />
                                        </div>
                                        <div className="rk-stat-text">
                                          <p className="rk-stat-value">{c[key] ?? 0}</p>
                                          <p className="rk-stat-label">{label}</p>
                                        </div>
                                      </div>
                                  ))}
                                  {c.multiplicou && (
                                      <div className="rk-row-detail-multi">
                                        <GitBranch size={14} />
                                        Esta célula se multiplicou neste mês — pontuação bônus aplicada.
                                      </div>
                                  )}
                                </div>
                              </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                  );
                })
            ) : !erro && (
                <p className="rk-empty">
                  {ordenado.length === 0
                      ? "Ainda não há dados de ranking para este mês."
                      : "Nenhuma célula encontrada para essa busca."}
                </p>
            )}
          </div>
        </div>

        {/* ── Como funciona a pontuação ── */}
        <div className="rk-card" style={{ padding: "16px 20px" }}>
          <button className="rk-info-toggle" onClick={() => setInfoAberto((v) => !v)}>
            <div className="rk-info-toggle-left">
              <div className="rk-info-icon"><Info size={16} /></div>
              <div style={{ minWidth: 0 }}>
                <p className="rk-info-title">Como funciona a pontuação</p>
                <p className="rk-info-sub">Critérios considerados no mês</p>
              </div>
            </div>
            <ChevronDown size={18} className="rk-info-chevron" style={{ transform: infoAberto ? "rotate(180deg)" : "none" }} />
          </button>

          <AnimatePresence initial={false}>
            {infoAberto && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: .25, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                >
                  <div className="rk-info-body">
                    {CRITERIOS.map(({ key, label, Icon, color }) => (
                        <div key={key} className="rk-info-row">
                          <div className="rk-info-row-icon" style={{ background: `${color}18`, color }}>
                            <Icon size={13} />
                          </div>
                          <span>{label}</span>
                        </div>
                    ))}
                    <div className="rk-info-row">
                      <div className="rk-info-row-icon" style={{ background: "rgba(253,184,19,.12)", color: "#c8a010" }}>
                        <GitBranch size={13} />
                      </div>
                      <span>Multiplicação da célula no mês</span>
                    </div>
                    <p style={{ margin: "12px 0 0", fontSize: 11, fontWeight: 300, color: t.textMuted, lineHeight: 1.6 }}>
                      A pontuação é calculada automaticamente com base nos relatórios lançados pela célula durante o mês selecionado.
                    </p>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="rk-footer">© {new Date().getFullYear()} IEQ Pituaçu — Sistema Eclesiástico</p>
      </div>
  );
}
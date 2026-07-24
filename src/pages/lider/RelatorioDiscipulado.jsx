import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import api from "../../services/api.js";
import {
  Loader2, CheckCircle2, Calendar, UserCheck, Save,
  History, Edit3, AlertTriangle, ChevronLeft, Eye, Users2,
  ChevronRight,
} from "lucide-react";
import { AURA, theme } from "./liderTheme";

/* ─── Constantes ───────────────────────────────────────────────────────── */
const COLUNAS = [
  { campo: "escolaBiblica", label: "EBQ",       labelSm: "EBQ", emoji: "📚", justField: "justEscolaBiblica" },
  { campo: "quartaNoite",   label: "Quarta",     labelSm: "4ª",  emoji: "🌙", justField: "justQuartaNoite"   },
  { campo: "quintaNoite",   label: "Quinta",     labelSm: "5ª",  emoji: "⭐", justField: "justQuintaNoite"   },
  { campo: "domingoManha",  label: "Dom. Manhã", labelSm: "D.M", emoji: "🌅", justField: "justDomingoManha"  },
  { campo: "domingoNoite",  label: "Dom. Noite", labelSm: "D.N", emoji: "🌟", justField: "justDomingoNoite"  },
];

const JUSTIFICATIVAS  = ["Trabalho", "Doença", "Viagem", "Outro"];
const EMOJIS_JUST     = { Trabalho: "💼", Doença: "🤒", Viagem: "✈️", Outro: "📝" };
const HIST_PAGE_SIZE  = 5; // itens por página no histórico

const draftKey      = (celulaId, inicio) => `ieq_discipulado_draft_${celulaId}_${inicio}`;
const lsDraftSave   = (key, p, fim) => { try { localStorage.setItem(key, JSON.stringify({ presencas: p, fim, salvoEm: new Date().toISOString() })); } catch (_) {} };
const lsDraftLoad   = (key)         => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } };
const lsDraftRemove = (key)         => { try { localStorage.removeItem(key); } catch (_) {} };

function obterSemanaAtual() {
  const hoje = new Date();
  const dom  = new Date(hoje); dom.setDate(hoje.getDate() - hoje.getDay());
  const sab  = new Date(dom);  sab.setDate(dom.getDate() + 6);
  const fmt  = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  return { inicio: fmt(dom), fim: fmt(sab) };
}

/* ─── Logo IEQ ─────────────────────────────────────────────────────────── */
function IEQCross({ size = 28 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="rd-gV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={AURA.red} /><stop offset="100%" stopColor={AURA.redDark} />
          </linearGradient>
          <linearGradient id="rd-gH" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={AURA.blueDark} /><stop offset="50%" stopColor={AURA.blueLight} /><stop offset="100%" stopColor={AURA.blueDark} />
          </linearGradient>
          <filter id="rd-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#rd-gV)" filter="url(#rd-glow)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#rd-gH)" filter="url(#rd-glow)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={AURA.yellow} filter="url(#rd-glow)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

/* ─── CSS Global ────────────────────────────────────────────────────────── */
function RDStyles({ t, isDark }) {
  return (
      <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

    @keyframes rd-spin    { to { transform: rotate(360deg); } }
    @keyframes rd-pulse   { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
    @keyframes rd-blink   { 0%,100%{opacity:1;} 50%{opacity:.3;} }
    @keyframes rd-fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes rd-slideD  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes rd-toastIn { from{opacity:0;transform:scale(.9) translateY(24px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes rd-toastOut{ from{opacity:1;transform:scale(1)} to{opacity:0;transform:scale(.92) translateY(-14px)} }
    @keyframes rd-overlIn { from{opacity:0} to{opacity:1} }
    @keyframes rd-overlOut{ from{opacity:1} to{opacity:0} }
    @keyframes rd-ringP   { 0%{opacity:0;transform:scale(.85)} 40%{opacity:.7} 100%{opacity:0;transform:scale(1.5)} }
    @keyframes rd-confetti{ 0%{opacity:0;transform:translateY(-20px) rotate(0deg) scale(.5)} 35%{opacity:1;transform:translateY(4px) rotate(120deg) scale(1)} 100%{opacity:.15;transform:translateY(22px) rotate(260deg) scale(.8)} }

    .rd-spin  { animation: rd-spin 1s linear infinite; }
    .rd-blink { animation: rd-blink 2s ease-in-out infinite; }

    .rd-root {
      font-family: 'Inter', sans-serif;
      position: relative;
      padding-bottom: 56px;
      color: ${t.text};
    }
    .rd-glow {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background:
        radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
        radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%);
    }
    .rd-content {
      position: relative; z-index: 1;
      max-width: 800px; margin: 0 auto;
      padding: 0 16px;
      display: flex; flex-direction: column; gap: 16px;
    }

    /* ── Cards ── */
    .rd-card {
      background: ${t.bgEl};
      border: 1px solid ${t.border};
      border-radius: 20px;
      backdrop-filter: blur(24px);
      position: relative;
      overflow: hidden;
    }
    .rd-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
    }

    /* ── Header ── */
    .rd-header {
      padding: 26px 28px;
      display: flex; flex-wrap: wrap; align-items: center;
      justify-content: space-between; gap: 16px;
    }
    .rd-avatar-wrap { position: relative; flex-shrink: 0; }
    .rd-ring {
      position: absolute; border-radius: 50%;
      border: 1px solid rgba(201,169,110,.22);
      top: 50%; left: 50%; transform: translate(-50%,-50%);
      animation: rd-pulse 3s ease-in-out infinite;
    }
    .rd-logo-circle {
      width: 50px; height: 50px; border-radius: 50%;
      border: 1.5px solid rgba(201,169,110,.28);
      background: ${isDark ? "rgba(18,18,26,.99)" : "#fff"};
      display: flex; align-items: center; justify-content: center;
      position: relative; z-index: 1;
    }
    .rd-eyebrow {
      font-size: 9px; font-weight: 500; letter-spacing: .2em;
      text-transform: uppercase; color: rgba(201,169,110,.55); margin: 0 0 3px;
    }
    .rd-title {
      font-family: 'Playfair Display', serif;
      font-size: 18px; font-weight: 500; color: ${t.text};
      margin: 0; letter-spacing: .02em; line-height: 1.2;
    }
    .rd-sub { font-size: 11px; font-weight: 300; color: ${t.textSec}; margin: 3px 0 0; }
    .rd-saved-badge {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 8.5px; font-weight: 500; letter-spacing: .14em;
      text-transform: uppercase; color: ${AURA.gold};
      animation: rd-blink 1.2s ease 2;
    }

    /* ── Abas ── */
    .rd-tabs { display: flex; gap: 8px; }
    .rd-tab {
      display: flex; align-items: center; gap: 7px;
      padding: 10px 18px; border-radius: 100px; border: none; cursor: pointer;
      font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
      letter-spacing: .14em; text-transform: uppercase; transition: all .25s;
      white-space: nowrap;
    }
    .rd-tab-active {
      background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight});
      color: #0A0A0F; box-shadow: 0 6px 20px rgba(201,169,110,.25);
    }
    .rd-tab-inactive {
      background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
      border: 1px solid ${t.border}; color: ${t.textMuted};
    }
    .rd-tab-inactive:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

    /* ── Datas ── */
    .rd-date-bar {
      padding: 16px 22px;
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    }
    .rd-date-input {
      background: transparent; border: none; outline: none;
      font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600;
      letter-spacing: .08em; color: ${t.text}; cursor: pointer;
      color-scheme: ${isDark ? "dark" : "light"};
      max-width: 140px;
    }
    .rd-date-sep { font-size: 11px; font-weight: 300; color: ${t.textMuted}; }

    /* ── KPI ── */
    .rd-kpi-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    @media(max-width: 400px) { .rd-kpi-grid { grid-template-columns: 1fr; } }
    .rd-kpi {
      background: ${t.bgEl}; border: 1px solid ${t.border};
      border-radius: 18px; padding: 22px; text-align: center;
      backdrop-filter: blur(20px); animation: rd-fadeUp .4s ease both;
    }
    .rd-kpi-label {
      font-size: 9px; font-weight: 600; letter-spacing: .2em;
      text-transform: uppercase; color: ${t.textMuted}; margin: 0 0 8px;
    }
    .rd-kpi-val {
      font-family: 'Playfair Display', serif;
      font-size: 40px; font-weight: 600; line-height: 1; margin: 0;
    }

    /* ── Banners ── */
    .rd-banner {
      padding: 16px 20px; border-radius: 16px;
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      animation: rd-slideD .3s ease;
    }
    .rd-banner-warn {
      background: ${isDark ? "rgba(253,184,19,.08)" : "rgba(253,184,19,.1)"};
      border: 1px solid rgba(253,184,19,.35);
    }
    .rd-banner-edit {
      background: ${isDark ? "rgba(0,61,165,.1)" : "rgba(0,61,165,.07)"};
      border: 1px solid rgba(0,61,165,.28);
    }
    .rd-banner-title {
      font-size: 10px; font-weight: 600; letter-spacing: .16em;
      text-transform: uppercase; margin: 0 0 3px;
    }
    .rd-banner-sub { font-size: 11px; font-weight: 300; color: ${t.textSec}; margin: 0; }

    /* ── Tabela de membros ── */
    .rd-table-head {
      padding: 14px 22px;
      display: grid; grid-template-columns: 1fr repeat(5, 1fr); gap: 8px;
      align-items: center;
      border-bottom: 1px solid ${t.border};
      background: ${isDark ? "rgba(201,169,110,.04)" : "rgba(201,169,110,.05)"};
    }
    .rd-table-col-label {
      text-align: center;
      font-size: 7.5px; font-weight: 600; letter-spacing: .12em;
      text-transform: uppercase; color: ${t.textMuted};
    }
    .rd-member-row {
      padding: 20px 22px;
      border-bottom: 1px solid ${t.border};
      animation: rd-fadeUp .4s ease both;
    }
    .rd-member-row:last-child { border-bottom: none; }
    .rd-member-avatar {
      width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
      background: linear-gradient(135deg, rgba(201,169,110,.2), rgba(201,169,110,.06));
      border: 1px solid rgba(201,169,110,.22);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif; font-weight: 600;
      font-size: 17px; color: ${AURA.gold};
    }
    .rd-member-name {
      font-family: 'Playfair Display', serif;
      font-size: 15px; font-weight: 500; color: ${t.text}; margin: 0;
    }
    .rd-member-id {
      font-size: 9px; font-weight: 500; letter-spacing: .14em;
      text-transform: uppercase; color: ${t.textMuted}; margin: 2px 0 0;
    }
    .rd-progress-track {
      height: 4px; border-radius: 99px; overflow: hidden;
      background: ${isDark ? "rgba(255,255,255,.06)" : "rgba(201,169,110,.1)"};
      margin: 12px 0 14px;
    }
    .rd-progress-fill { height: 100%; border-radius: 99px; transition: width .4s ease; }

    /* ── Grid de presença (5 colunas responsivas) ── */
    .rd-presence-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    .rd-presence-btn {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 10px 6px; border-radius: 12px; border: 1px solid; cursor: pointer;
      transition: all .2s; background: none; width: 100%; min-width: 0;
    }
    .rd-pb-emoji {
      font-size: 18px; transition: all .2s;
    }
    .rd-pb-label {
      font-family: 'Inter', sans-serif;
      font-size: 7.5px; font-weight: 600; letter-spacing: .1em;
      text-transform: uppercase; white-space: nowrap;
    }
    .rd-pb-label-sm   { display: none; }
    .rd-pb-label-full { display: inline; }

    .rd-just-btn {
      margin-top: 5px; padding: 3px 7px; border-radius: 99px;
      border: 1px solid rgba(201,169,110,.25); background: transparent; cursor: pointer;
      font-family: 'Inter', sans-serif; font-size: 7px; font-weight: 500;
      letter-spacing: .1em; display: flex; align-items: center; gap: 3px;
      transition: all .15s; white-space: nowrap; color: ${t.textMuted};
      max-width: 100%; overflow: hidden; text-overflow: ellipsis;
    }
    .rd-just-btn:hover { border-color: rgba(201,169,110,.5); color: ${AURA.gold}; }
    .rd-just-btn-filled {
      border-color: rgba(201,169,110,.6) !important;
      background: ${isDark ? "rgba(201,169,110,.12)" : "rgba(201,169,110,.1)"} !important;
      color: ${AURA.gold} !important;
    }

    /* ── Botão submit ── */
    .rd-btn-submit {
      width: 100%; padding: 16px 0; border: none; border-radius: 100px;
      cursor: pointer; font-family: 'Inter', sans-serif; font-size: 11px;
      font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      transition: all .3s;
    }
    .rd-btn-submit:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.08); }
    .rd-btn-submit:disabled { opacity: .4; cursor: not-allowed; }
    .rd-btn-gold {
      background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight});
      color: #0A0A0F; box-shadow: 0 8px 28px rgba(201,169,110,.25);
    }
    .rd-btn-blue {
      background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue});
      color: #fff; box-shadow: 0 8px 28px rgba(0,61,165,.22);
    }

    /* ── Erro ── */
    .rd-erro {
      padding: 14px 18px; border-radius: 14px;
      background: rgba(200,16,46,.08); border: 1px solid rgba(200,16,46,.25);
      font-size: 10px; font-weight: 600; letter-spacing: .14em;
      text-transform: uppercase; color: ${AURA.red};
      animation: rd-slideD .3s ease; text-align: center;
    }

    /* ── Toast rascunho ── */
    .rd-toast-draft {
      padding: 12px 18px; border-radius: 14px;
      background: ${isDark ? "rgba(0,61,165,.15)" : "rgba(0,61,165,.08)"};
      border: 1px solid rgba(0,61,165,.25);
      display: flex; align-items: center; gap: 10px;
      font-family: 'Inter', sans-serif; font-size: 9.5px; font-weight: 500;
      letter-spacing: .12em; text-transform: uppercase; color: ${AURA.blueLight};
      animation: rd-slideD .35s ease;
    }

    /* ── Histórico ── */
    .rd-hist-row {
      padding: 18px 22px;
      border-bottom: 1px solid ${t.border};
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
      animation: rd-fadeUp .4s ease both;
    }
    .rd-hist-row:last-child { border-bottom: none; }
    .rd-hist-info { flex: 1 1 200px; min-width: 0; }
    .rd-hist-date {
      font-size: 10px; font-weight: 600; letter-spacing: .14em;
      text-transform: uppercase; color: ${t.text}; margin: 0 0 6px;
      white-space: normal; word-break: break-word;
    }
    .rd-hist-stats {
      display: flex; gap: 10px; align-items: center;
      flex-wrap: wrap; row-gap: 4px;
    }
    .rd-hist-stat {
      font-size: 9px; font-weight: 500; letter-spacing: .12em;
      text-transform: uppercase; color: ${t.textMuted};
      white-space: nowrap;
    }
    .rd-hist-bar {
      height: 3px; border-radius: 99px; margin-top: 10px;
      background: ${isDark ? "rgba(255,255,255,.06)" : "rgba(201,169,110,.1)"};
      overflow: hidden;
    }
    .rd-hist-head {
      padding: 20px 22px; border-bottom: 1px solid ${t.border};
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }

    /* ── Paginação histórico ── */
    .rd-pag {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 22px; border-top: 1px solid ${t.border};
      flex-wrap: wrap; gap: 8px;
    }
    .rd-pag-info {
      font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500;
      letter-spacing: .1em; color: ${t.textMuted};
      white-space: nowrap;
    }
    .rd-pag-btns { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; row-gap: 6px; }
    .rd-pag-btn {
      width: 32px; height: 32px; border-radius: 8px;
      border: 1px solid ${t.border}; background: transparent;
      color: ${t.textMuted}; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600;
      transition: all .2s; flex-shrink: 0;
    }
    .rd-pag-btn:hover:not(:disabled) { border-color: ${AURA.gold}; color: ${AURA.gold}; }
    .rd-pag-btn:disabled { opacity: .3; cursor: not-allowed; }
    .rd-pag-btn-active {
      background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue});
      color: #fff !important; border-color: transparent !important;
    }

    /* ── Botões gerais ── */
    .rd-btn-icon {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 16px; border-radius: 100px; border: 1px solid ${t.border};
      cursor: pointer; background: transparent; color: ${t.textMuted};
      font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600;
      letter-spacing: .14em; text-transform: uppercase; transition: all .25s;
      flex-shrink: 0; white-space: nowrap;
    }
    .rd-btn-icon:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }
    .rd-btn-edit-gold {
      display: flex; align-items: center; gap: 7px;
      padding: 10px 18px; border-radius: 100px; border: none; cursor: pointer;
      background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight});
      color: #0A0A0F; font-family: 'Inter', sans-serif;
      font-size: 9px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
      transition: all .25s; flex-shrink: 0; white-space: nowrap;
      box-shadow: 0 4px 14px rgba(201,169,110,.2);
    }
    .rd-btn-edit-gold:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(201,169,110,.3); }

    /* ── Detalhe histórico ── */
    .rd-detail-grid {
      display: grid; grid-template-columns: 1fr repeat(5, 54px);
      padding: 12px 22px; gap: 8px; align-items: center;
    }

    /* ── Scroll horizontal das tabelas (desktop apenas — ver override mobile abaixo) ── */
    .rd-table-scroll {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .rd-table-scroll::-webkit-scrollbar { height: 4px; }
    .rd-table-scroll::-webkit-scrollbar-thumb {
      background: rgba(201,169,110,.35);
      border-radius: 99px;
    }
    .rd-table-inner {
      min-width: 640px; /* desktop: garante espaço confortável para as 5 colunas */
    }
    .rd-table-inner-sm {
      min-width: 460px; /* versão compacta usada no detalhe do histórico (desktop) */
    }

    /* ══════════════════════════════════════════════════════════════════
       MOBILE (<= 480px)
       A tabela deixa de ter largura mínima fixa e de rolar horizontalmente.
       As colunas encolhem proporcionalmente (fr) para caber na tela toda,
       o cabeçalho de coluna é ocultado (cada botão já mostra seu próprio
       rótulo abreviado) e o texto do rótulo desaparece em telas muito
       estreitas, restando apenas o ícone.
    ══════════════════════════════════════════════════════════════════ */
    @media(max-width: 480px) {
      .rd-header     { padding: 20px 16px; gap: 12px; }
      .rd-tabs       { width: 100%; }
      .rd-tab        { flex: 1; justify-content: center; padding: 9px 8px; font-size: 9px; }

      .rd-date-bar   { padding: 14px 16px; }
      .rd-date-input { max-width: 118px; font-size: 11px; }

      .rd-hist-row   { padding: 14px 16px; gap: 8px; }
      .rd-hist-head  { padding: 14px 16px; }
      .rd-hist-stats { gap: 8px; }
      .rd-hist-date  { font-size: 9.5px; }

      .rd-pag        { padding: 12px 14px; }
      .rd-pag-info   { font-size: 9px; }

      /* tabela principal: sem scroll, sem largura mínima */
      .rd-table-scroll { overflow-x: visible; }
      .rd-table-inner,
      .rd-table-inner-sm { min-width: 0; width: 100%; }

      .rd-table-head { display: none; }

      .rd-member-row     { padding: 16px 12px; }
      .rd-member-avatar  { width: 34px; height: 34px; font-size: 14px; border-radius: 9px; }
      .rd-member-name    { font-size: 13.5px; }
      .rd-member-id      { font-size: 8px; }

      .rd-presence-grid  { gap: 5px; }
      .rd-presence-btn   { padding: 8px 2px 7px; border-radius: 10px; gap: 3px; }
      .rd-pb-emoji       { font-size: 15px; }
      .rd-pb-label       { font-size: 6.3px; letter-spacing: .04em; }
      .rd-pb-label-full  { display: none; }
      .rd-pb-label-sm    { display: inline; }

      .rd-just-btn { margin-top: 3px; padding: 2px 3px; font-size: 6px; }

      /* detalhe do histórico segue a mesma lógica de colunas fluidas */
      .rd-detail-grid {
        grid-template-columns: 1fr repeat(5, minmax(0,1fr));
        padding: 12px 10px; gap: 4px;
      }
    }

    @media(max-width: 360px) {
      .rd-pb-label { display: none; } /* telas muito estreitas: só o ícone */
    }

    /* ── Modal justificativa ── */
    .rd-modal-overlay {
      position: fixed; inset: 0; z-index: 500;
      display: flex; align-items: center; justify-content: center; padding: 0 20px;
      background: rgba(10,10,15,.88); backdrop-filter: blur(8px);
      animation: rd-overlIn .2s ease forwards;
    }
    .rd-modal-box {
      background: ${t.bgEl}; border: 1px solid ${t.border};
      border-radius: 22px; padding: 30px 26px;
      width: 100%; max-width: 360px;
      display: flex; flex-direction: column; gap: 20px;
      animation: rd-toastIn .3s cubic-bezier(.34,1.56,.64,1) forwards;
      box-shadow: 0 24px 80px rgba(0,0,0,${isDark ? ".75" : ".15"});
    }
    .rd-just-chip {
      padding: 14px 10px; border-radius: 14px; border: 1px solid; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      transition: all .18s; background: none;
    }

    /* ── Toast sucesso ── */
    .rd-toast-overlay {
      position: fixed; inset: 0; z-index: 300;
      display: flex; align-items: center; justify-content: center; padding: 0 20px;
      background: rgba(0,0,0,.55); backdrop-filter: blur(6px);
    }
    .rd-toast-box {
      border-radius: 22px; padding: 32px 36px 26px;
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      min-width: 300px; max-width: 380px; width: 100%;
      position: relative; overflow: hidden;
    }
    .rd-toast-ring {
      position: absolute; inset: -8px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,.25);
      animation: rd-ringP 2s ease-out forwards;
    }

    /* ── Divider ── */
    .rd-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, ${t.border}, transparent);
    }
    .rd-footer {
      text-align: center; font-size: 9px; font-weight: 500;
      letter-spacing: .18em; text-transform: uppercase;
      color: ${isDark ? "rgba(245,240,232,.12)" : "rgba(26,16,8,.15)"};
    }
    `}</style>
  );
}

/* ─── Modal de Justificativa ───────────────────────────────────────────── */
function ModalJustificativa({ isDark, nomeMembro, labelCulto, valorAtual, onSalvar, onFechar }) {
  const [selecionado, setSelecionado] = useState(valorAtual || "");
  const t = theme(isDark);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onFechar(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onFechar]);

  return (
      <div className="rd-modal-overlay" onClick={onFechar}>
        <div className="rd-modal-box" onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 50, height: 50, borderRadius: 14,
              background: `linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px", fontSize: 22,
            }}>📋</div>
            <p className="rd-eyebrow" style={{ marginBottom: 6 }}>Justificativa de Falta</p>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 500, color: t.text, margin: "0 0 3px" }}>
              {nomeMembro}
            </p>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: ".14em", textTransform: "uppercase", color: t.textMuted, margin: 0 }}>
              {labelCulto}
            </p>
          </div>
          <div className="rd-divider" />
          <div>
            <p style={{ fontSize: 8.5, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 12px", textAlign: "center" }}>
              Selecione o motivo
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {JUSTIFICATIVAS.map((opcao) => {
                const sel = selecionado === opcao;
                return (
                    <button key={opcao} onClick={() => setSelecionado(sel ? "" : opcao)}
                            className="rd-just-chip"
                            style={{
                              borderColor: sel ? AURA.gold : t.border,
                              background: sel ? (isDark ? "rgba(201,169,110,.15)" : "rgba(201,169,110,.1)") : "transparent",
                              transform: sel ? "scale(1.04)" : "scale(1)",
                              boxShadow: sel ? "0 4px 16px rgba(201,169,110,.2)" : "none",
                            }}
                    >
                      <span style={{ fontSize: 22 }}>{EMOJIS_JUST[opcao]}</span>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, letterSpacing: ".12em", fontWeight: sel ? 600 : 400, color: sel ? AURA.gold : t.textSec }}>
                    {opcao.toUpperCase()}
                  </span>
                    </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onFechar} style={{ flex: 1, padding: "12px 0", borderRadius: 100, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: t.textMuted }}>
              Cancelar
            </button>
            <button onClick={() => { onSalvar(selecionado); onFechar(); }} style={{ flex: 2, padding: "12px 0", borderRadius: 100, background: `linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight})`, border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "#0A0A0F", boxShadow: "0 4px 14px rgba(201,169,110,.25)" }}>
              Confirmar
            </button>
          </div>
        </div>
      </div>
  );
}

/* ─── Toast Sucesso ─────────────────────────────────────────────────────── */
function ToastSucessoDiscipulado({ totalPresencas, porcentagem, nomeCelula, modoEdicao, onClose }) {
  const [saindo, setSaindo] = useState(false);
  useEffect(() => {
    const tmr = setTimeout(() => {
      setSaindo(true);
      setTimeout(() => { if (onClose) onClose(); }, 450);
    }, 4800);
    return () => clearTimeout(tmr);
  }, [onClose]);

  const confettiCores = [AURA.gold, AURA.red, AURA.blue, AURA.gold, AURA.goldLight, AURA.blueLight, AURA.yellow, AURA.red];
  const c1 = modoEdicao ? AURA.blueDark : "#0d6e3a";
  const c2 = modoEdicao ? AURA.blue     : "#0a5530";
  const c3 = modoEdicao ? "#002470"     : "#073d22";

  return (
      <div className="rd-toast-overlay" style={{ animation: saindo ? "rd-overlOut .45s ease forwards" : "rd-overlIn .3s ease forwards" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, animation: saindo ? "rd-toastOut .45s cubic-bezier(.4,0,.6,1) forwards" : "rd-toastIn .55s cubic-bezier(.34,1.56,.64,1) forwards" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, height: 32, alignItems: "flex-end" }}>
            {confettiCores.map((cor, i) => (
                <div key={i} style={{ width: i % 3 === 0 ? 11 : 7, height: i % 3 === 0 ? 11 : 7, borderRadius: i % 2 === 0 ? "50%" : 2, background: cor, opacity: 0, animation: `rd-confetti 1.4s ease ${0.04 + i * 0.06}s forwards` }} />
            ))}
          </div>
          <div className="rd-toast-box" style={{ background: `linear-gradient(160deg, ${c1} 0%, ${c2} 60%, ${c3} 100%)`, boxShadow: modoEdicao ? "0 16px 60px rgba(0,61,165,.5)" : "0 16px 60px rgba(13,110,58,.5)" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <div className="rd-toast-ring" />
              <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.12)", animation: "rd-ringP 2s ease-out .3s forwards" }} />
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,.18)", border: "2px solid rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {modoEdicao ? <Edit3 size={28} style={{ color: "#fff" }} /> : <CheckCircle2 size={30} style={{ color: "#fff" }} />}
              </div>
            </div>
            <div style={{ margin: "-4px 0 -4px" }}><IEQCross size={20} /></div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 600, color: "#fff", margin: "0 0 8px", letterSpacing: ".04em" }}>
                {modoEdicao ? "Atualizado!" : "Glória a Deus!"}
              </p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300, color: "rgba(255,255,255,.75)", lineHeight: 1.55, margin: 0 }}>
                {modoEdicao ? <>Relatório de discipulado<br /><em>atualizado com sucesso!</em></> : <>Relatório de discipulado enviado.<br /><em>O Senhor viu cada presença!</em></>}
              </p>
            </div>
            <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)" }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 100, padding: "5px 14px", fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.9)", display: "flex", alignItems: "center", gap: 6 }}>
                <Users2 size={11} /> {totalPresencas} Presenças
              </div>
              <div style={{ background: porcentagem >= 60 ? "rgba(201,169,110,.2)" : "rgba(200,16,46,.15)", border: `1px solid ${porcentagem >= 60 ? "rgba(201,169,110,.35)" : "rgba(200,16,46,.3)"}`, borderRadius: 100, padding: "5px 14px", fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: porcentagem >= 60 ? AURA.gold : "rgba(255,255,255,.85)", display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={11} /> {porcentagem}% Freq.
              </div>
            </div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,.45)", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
              "Ide, portanto, e fazei discípulos de todas as nações."
            </p>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 8.5, fontWeight: 500, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.25)", margin: "-10px 0 0" }}>
              Mateus 28:19
            </p>
          </div>
        </div>
      </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   ABA HISTÓRICO — paginação server-side real
════════════════════════════════════════════════════════════════════════ */
function AbaHistorico({ isDark, onVerDetalhe }) {
  const [historico,     setHistorico]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [loadingPage,   setLoadingPage]   = useState(false);
  const [erro,          setErro]          = useState("");
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const t = theme(isDark);

  /* busca uma página do backend */
  const buscarPagina = useCallback(async (p) => {
    p === 0 ? setLoading(true) : setLoadingPage(true);
    setErro("");
    try {
      const res = await api.get("/discipulado/historico", {
        params: { page: p, size: HIST_PAGE_SIZE },
      });
      const data = res.data;
      /* backend retorna Page<DiscipuladoHistoricoItemDTO> */
      setHistorico(data.content || []);
      setTotalPages(data.totalPages  ?? 0);
      setTotalElements(data.totalElements ?? 0);
      setPage(p);
    } catch {
      setErro("Erro ao carregar histórico.");
    } finally {
      setLoading(false);
      setLoadingPage(false);
    }
  }, []);

  useEffect(() => { buscarPagina(0); }, [buscarPagina]);

  /* ── loading inicial ── */
  if (loading) return (
      <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
        <Loader2 size={24} className="rd-spin" style={{ color: AURA.gold }} />
      </div>
  );

  /* ── erro ── */
  if (erro) return (
      <div style={{ padding: "20px", textAlign: "center", color: AURA.red, fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase" }}>
        {erro}
        <button className="rd-btn-icon" style={{ margin: "12px auto 0" }} onClick={() => buscarPagina(0)}>
          Tentar novamente
        </button>
      </div>
  );

  /* ── vazio ── */
  if (historico.length === 0 && totalElements === 0) return (
      <div style={{ padding: "48px 0", textAlign: "center" }}>
        <History size={36} style={{ color: t.textMuted, marginBottom: 12 }} />
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: t.textMuted }}>
          Nenhum relatório enviado ainda
        </p>
      </div>
  );

  /* ── botões de página ── */
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const inicio = page * HIST_PAGE_SIZE + 1;
  const fim    = Math.min((page + 1) * HIST_PAGE_SIZE, totalElements);

  return (
      <div className="rd-card" style={{ overflow: "hidden" }}>
        {/* Cabeçalho do card */}
        <div className="rd-hist-head">
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(201,169,110,.08)", border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: AURA.gold, flexShrink: 0 }}>
            <History size={14} />
          </div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 500, color: t.text }}>
          Histórico de Discipulado
        </span>
          <span style={{ marginLeft: "auto", fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: t.textMuted, whiteSpace: "nowrap" }}>
          {totalElements} semana{totalElements !== 1 ? "s" : ""} registrada{totalElements !== 1 ? "s" : ""}
        </span>
        </div>

        {/* Linhas da página atual */}
        {loadingPage ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
              <Loader2 size={20} className="rd-spin" style={{ color: AURA.gold }} />
            </div>
        ) : (
            historico.map((item) => {
              /* DiscipuladoHistoricoItemDTO: id, inicio, fim, totalMembros,
                 totalPresencas, totalPossivel, frequencia                     */
              const pct = item.frequencia ?? (
                  item.totalPossivel > 0
                      ? Math.round((item.totalPresencas / item.totalPossivel) * 100)
                      : 0
              );
              return (
                  <div key={item.id} className="rd-hist-row">
                    <div className="rd-hist-info">
                      {/* Período */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <Calendar size={12} style={{ color: AURA.gold, flexShrink: 0 }} />
                        <span className="rd-hist-date">
                    {item.inicio} → {item.fim}
                  </span>
                      </div>
                      {/* Stats */}
                      <div className="rd-hist-stats">
                        <span className="rd-hist-stat">{item.totalMembros ?? "?"} membros</span>
                        <span className="rd-hist-stat">{item.totalPresencas ?? 0} presenças</span>
                        <span style={{
                          fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700,
                          letterSpacing: ".12em", textTransform: "uppercase",
                          color: pct > 60 ? AURA.gold : AURA.red,
                          whiteSpace: "nowrap",
                        }}>
                    {pct}% freq.
                  </span>
                      </div>
                      {/* Barra */}
                      <div className="rd-hist-bar">
                        <div style={{
                          height: "100%", width: `${pct}%`, borderRadius: 99,
                          background: pct > 60
                              ? `linear-gradient(90deg,${AURA.gold},${AURA.goldLight})`
                              : `linear-gradient(90deg,${AURA.red},${AURA.blue})`,
                          transition: "width .4s ease",
                        }} />
                      </div>
                    </div>
                    <button className="rd-btn-icon" onClick={() => onVerDetalhe(item)}>
                      <Eye size={13} /> Ver
                    </button>
                  </div>
              );
            })
        )}

        {/* Paginação */}
        {totalPages > 1 && (
            <div className="rd-pag">
          <span className="rd-pag-info">
            {inicio}–{fim} de {totalElements}
          </span>
              <div className="rd-pag-btns">
                <button
                    className="rd-pag-btn"
                    disabled={page === 0 || loadingPage}
                    onClick={() => buscarPagina(page - 1)}
                    aria-label="Página anterior"
                >
                  <ChevronLeft size={13} />
                </button>

                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`e${i}`} style={{ color: t.textMuted, fontSize: 11, padding: "0 3px" }}>…</span>
                    ) : (
                        <button
                            key={p}
                            className={`rd-pag-btn${p === page ? " rd-pag-btn-active" : ""}`}
                            onClick={() => buscarPagina(p)}
                            disabled={loadingPage}
                            aria-label={`Página ${p + 1}`}
                            aria-current={p === page ? "page" : undefined}
                        >
                          {p + 1}
                        </button>
                    )
                )}

                <button
                    className="rd-pag-btn"
                    disabled={page >= totalPages - 1 || loadingPage}
                    onClick={() => buscarPagina(page + 1)}
                    aria-label="Próxima página"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
        )}
      </div>
  );
}

/* ─── Detalhe Histórico ─────────────────────────────────────────────────── */
function DetalheHistorico({ item, isDark, onVoltar, onEditar }) {
  const [detalhe, setDetalhe] = useState(null);
  const [loading, setLoading] = useState(true);
  const t = theme(isDark);

  useEffect(() => {
    api.get(`/discipulado/relatorio-semanal/${item.id}`)
        .then((r) => setDetalhe(r.data))
        .catch(() => setDetalhe(null))
        .finally(() => setLoading(false));
  }, [item.id]);

  if (loading) return (
      <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
        <Loader2 size={24} className="rd-spin" style={{ color: AURA.gold }} />
      </div>
  );

  const presencas = detalhe?.presencas ?? detalhe?.membros ?? [];

  return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="rd-card" style={{ padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <button onClick={onVoltar} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: AURA.gold, display: "flex", alignItems: "center", flexShrink: 0 }}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ minWidth: 0 }}>
              <p className="rd-eyebrow">Relatório</p>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 500, color: t.text, margin: 0, wordBreak: "break-word" }}>
                {item.inicio} → {item.fim}
              </p>
            </div>
          </div>
          <button className="rd-btn-edit-gold" onClick={() => onEditar(item, detalhe)}>
            <Edit3 size={12} /> Editar
          </button>
        </div>

        {presencas.length === 0 ? (
            <p style={{ textAlign: "center", fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: ".14em", textTransform: "uppercase", color: t.textMuted }}>
              Sem dados de presenças
            </p>
        ) : (
            <div className="rd-card" style={{ overflow: "hidden" }}>
              <div className="rd-table-scroll">
                <div className="rd-table-inner-sm">
                  <div className="rd-table-head" style={{ gridTemplateColumns: "1fr repeat(5, 54px)" }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: t.textMuted }}>Membro</span>
                    {COLUNAS.map(({ label, emoji }) => (
                        <div key={label} className="rd-table-col-label">
                          <div style={{ fontSize: 14, marginBottom: 3 }}>{emoji}</div>
                          {label}
                        </div>
                    ))}
                  </div>
                  {presencas.map((p, i) => {
                    const nome  = p.nomeMembro ?? p.nome ?? "?";
                    const total = COLUNAS.filter((c) => p[c.campo]).length;
                    return (
                        <div key={p.membroId ?? i} style={{ borderBottom: i < presencas.length - 1 ? `1px solid ${t.border}` : "none" }}>
                          <div className="rd-detail-grid" style={{ gridTemplateColumns: "1fr repeat(5, 54px)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                              <div className="rd-member-avatar" style={{ width: 34, height: 34, fontSize: 14 }}>{nome.charAt(0)}</div>
                              <div style={{ minWidth: 0 }}>
                                <p className="rd-member-name" style={{ fontSize: 14 }}>{nome}</p>
                                <p className="rd-member-id">{total}/{COLUNAS.length} presenças</p>
                              </div>
                            </div>
                            {COLUNAS.map(({ campo, emoji, justField }) => (
                                <div key={campo} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 18, filter: p[campo] ? "none" : "grayscale(1)", opacity: p[campo] ? 1 : 0.25 }}>
                            {p[campo] ? "✅" : emoji}
                          </span>
                                  {!p[campo] && p[justField] && (
                                      <div style={{ fontSize: 8, color: AURA.gold, fontFamily: "'Inter',sans-serif", fontWeight: 600, textAlign: "center", lineHeight: 1.3, padding: "2px 5px", background: "rgba(201,169,110,.1)", borderRadius: 99, border: "1px solid rgba(201,169,110,.25)" }}>
                                        {p[justField]}
                                      </div>
                                  )}
                                </div>
                            ))}
                          </div>
                        </div>
                    );
                  })}
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════════════════ */
export default function RelatorioDiscipulado({ isDark = false }) {
  const t = theme(isDark);

  const [aba,                setAba]                = useState("relatorio");
  const [detalheItem,        setDetalheItem]        = useState(null);
  const [celula,             setCelula]             = useState(null);
  const [membros,            setMembros]            = useState([]);
  const [presencas,          setPresencas]          = useState([]);
  const [inicio,             setInicio]             = useState("");
  const [fim,                setFim]                = useState("");
  const [loading,            setLoading]            = useState(true);
  const [enviando,           setEnviando]           = useState(false);
  const [erro,               setErro]               = useState("");
  const [rascunhoCarregado,  setRascunhoCarregado]  = useState(false);
  const [salvouAgora,        setSalvouAgora]        = useState(false);
  const [verificandoExist,   setVerificandoExist]   = useState(false);
  const [relatorioExistente, setRelatorioExistente] = useState(null);
  const [modoEdicao,         setModoEdicao]         = useState(false);
  const [toastSucesso,       setToastSucesso]       = useState(null);
  const [modalJust,          setModalJust]          = useState(null);

  const celulaIdRef = useRef(null);
  const inicioRef   = useRef("");
  const fimRef      = useRef("");
  const carregouRef = useRef(false);
  const saveTimer   = useRef(null);

  /* ── helpers ── */
  const inicializarPresencas = useCallback((lista) =>
      lista.map((m) => ({
        membroId: m.id, nomeMembro: m.nome,
        escolaBiblica: false, quartaNoite: false,
        quintaNoite: false, domingoManha: false, domingoNoite: false,
        justEscolaBiblica: "", justQuartaNoite: "",
        justQuintaNoite: "", justDomingoManha: "", justDomingoNoite: "",
      })), []);

  const agendarSave = useCallback((novasPresencas, novoFim) => {
    if (!carregouRef.current) return;
    const key = draftKey(celulaIdRef.current, inicioRef.current);
    if (!key || !celulaIdRef.current || !inicioRef.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      lsDraftSave(key, novasPresencas, novoFim);
      setSalvouAgora(true);
      setTimeout(() => setSalvouAgora(false), 2000);
    }, 800);
  }, []);

  const verificarExistente = useCallback(async (ini, fi) => {
    if (!ini || !fi) return;
    setVerificandoExist(true);
    setRelatorioExistente(null);
    setModoEdicao(false);
    try {
      const res   = await api.get(`/discipulado/relatorio-semanal?inicio=${ini}&fim=${fi}`);
      const lista = Array.isArray(res.data) ? res.data : [];
      if (lista.length > 0) setRelatorioExistente(lista[0]);
    } catch (_) {}
    finally { setVerificandoExist(false); }
  }, []);

  const carregarDados = useCallback(async () => {
    carregouRef.current = false;
    setLoading(true);
    setErro("");
    try {
      const res     = await api.get("/celulas/minha-celula");
      if (!res.data) { setErro("Célula não vinculada."); return; }
      const celData = res.data;
      setCelula(celData);
      celulaIdRef.current = celData.id;
      const lista   = celData.membros || [];
      setMembros(lista);
      const semana  = obterSemanaAtual();
      inicioRef.current = semana.inicio;
      fimRef.current    = semana.fim;
      const draft = lsDraftLoad(draftKey(celData.id, semana.inicio));
      if (draft?.presencas) {
        const idsAtuais   = new Set(lista.map((m) => m.id));
        const idsRascunho = new Set(draft.presencas.map((p) => p.membroId));
        const filtradas   = draft.presencas.filter((p) => idsAtuais.has(p.membroId));
        const novos       = lista.filter((m) => !idsRascunho.has(m.id)).map((m) => ({
          membroId: m.id, nomeMembro: m.nome,
          escolaBiblica: false, quartaNoite: false,
          quintaNoite: false, domingoManha: false, domingoNoite: false,
          justEscolaBiblica: "", justQuartaNoite: "",
          justQuintaNoite: "", justDomingoManha: "", justDomingoNoite: "",
        }));
        setPresencas([...filtradas, ...novos]);
        const fimSalvo = draft.fim || semana.fim;
        setFim(fimSalvo);
        fimRef.current = fimSalvo;
        setRascunhoCarregado(true);
        setTimeout(() => setRascunhoCarregado(false), 5000);
      } else {
        setPresencas(inicializarPresencas(lista));
        setFim(semana.fim);
      }
      setInicio(semana.inicio);
      await verificarExistente(semana.inicio, semana.fim);
    } catch (_) {
      setErro("Erro ao carregar dados.");
    } finally {
      setLoading(false);
      carregouRef.current = true;
    }
  }, [inicializarPresencas, verificarExistente]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const handleInicioChange = useCallback(async (novoInicio) => {
    carregouRef.current = false;
    setInicio(novoInicio);
    inicioRef.current = novoInicio;
    const draft = lsDraftLoad(draftKey(celulaIdRef.current, novoInicio));
    if (draft?.presencas) {
      setPresencas(draft.presencas);
      const f = draft.fim || fimRef.current;
      setFim(f); fimRef.current = f;
      setRascunhoCarregado(true);
      setTimeout(() => setRascunhoCarregado(false), 5000);
    } else {
      setMembros((prev) => { setPresencas(inicializarPresencas(prev)); return prev; });
    }
    carregouRef.current = true;
    await verificarExistente(novoInicio, fimRef.current);
  }, [inicializarPresencas, verificarExistente]);

  const handleFimChange = useCallback((novoFim) => {
    setFim(novoFim);
    fimRef.current = novoFim;
    setPresencas((prev) => { agendarSave(prev, novoFim); return prev; });
  }, [agendarSave]);

  const alterarPresenca = useCallback((index, campo) => {
    setPresencas((prev) => {
      const novo = [...prev];
      if (!novo[index]) return prev;
      const marcando  = !novo[index][campo];
      const justField = COLUNAS.find((c) => c.campo === campo)?.justField;
      novo[index] = { ...novo[index], [campo]: marcando, ...(justField && marcando ? { [justField]: "" } : {}) };
      agendarSave(novo, fimRef.current);
      return novo;
    });
  }, [agendarSave]);

  const alterarJustificativa = useCallback((index, justField, valor) => {
    setPresencas((prev) => {
      const novo = [...prev];
      if (!novo[index]) return prev;
      novo[index] = { ...novo[index], [justField]: valor };
      agendarSave(novo, fimRef.current);
      return novo;
    });
  }, [agendarSave]);

  const abrirModalJust = useCallback((membroIndex, campo, justField, nomeMembro, labelCulto) => {
    const valorAtual = presencas[membroIndex]?.[justField] ?? "";
    setModalJust({ membroIndex, campo, justField, nomeMembro, labelCulto, valorAtual });
  }, [presencas]);

  const stats = useMemo(() => {
    const totalGeral    = presencas.reduce((acc, p) => acc + COLUNAS.filter((c) => p[c.campo]).length, 0);
    const totalPossivel = presencas.length * COLUNAS.length;
    const porcentagem   = totalPossivel > 0 ? Math.round((totalGeral / totalPossivel) * 100) : 0;
    return { totalGeral, porcentagem };
  }, [presencas]);

  const entrarModoEdicao = useCallback(async (item, detalhePreCarregado) => {
    setErro(""); setModoEdicao(true); setAba("relatorio"); setDetalheItem(null);
    if (item.inicio) { setInicio(item.inicio); inicioRef.current = item.inicio; }
    if (item.fim)    { setFim(item.fim);        fimRef.current    = item.fim;   }
    setRelatorioExistente(item);
    try {
      const detalhe = detalhePreCarregado || (await api.get(`/discipulado/relatorio-semanal/${item.id}`)).data;
      const pArr    = detalhe?.presencas ?? detalhe?.membros ?? [];
      const merged  = membros.map((m) => {
        const found = pArr.find((p) => (p.membroId ?? p.id) === m.id);
        return found
            ? { ...found, membroId: m.id, nomeMembro: m.nome }
            : { membroId: m.id, nomeMembro: m.nome, escolaBiblica: false, quartaNoite: false, quintaNoite: false, domingoManha: false, domingoNoite: false, justEscolaBiblica: "", justQuartaNoite: "", justQuintaNoite: "", justDomingoManha: "", justDomingoNoite: "" };
      });
      setPresencas(merged);
      carregouRef.current = true;
    } catch (_) {
      setErro("Erro ao carregar dados para edição.");
    }
  }, [membros]);

  const enviarRelatorio = async () => {
    setErro("");
    if (!inicio || !fim || !celula?.id || presencas.length === 0) return setErro("Verifique os dados.");
    setEnviando(true);
    const totalEnviado = stats.totalGeral;
    const pctEnviado   = stats.porcentagem;
    const nomeCell     = celula?.nome || "";
    const eraEdicao    = modoEdicao;
    try {
      const payload = presencas.map(({ nomeMembro, membroId, ...rest }) => ({
        membroId:          Number(membroId),
        celulaId:          celula?.id,
        escolaBiblica:     rest.escolaBiblica,
        quartaNoite:       rest.quartaNoite,
        quintaNoite:       rest.quintaNoite,
        domingoManha:      rest.domingoManha,
        domingoNoite:      rest.domingoNoite,
        justEscolaBiblica: rest.justEscolaBiblica || null,
        justQuartaNoite:   rest.justQuartaNoite   || null,
        justQuintaNoite:   rest.justQuintaNoite   || null,
        justDomingoManha:  rest.justDomingoManha  || null,
        justDomingoNoite:  rest.justDomingoNoite  || null,
      }));
      if (modoEdicao && relatorioExistente?.id) {
        await api.put(`/discipulado/relatorio-semanal/${relatorioExistente.id}?inicio=${inicio}&fim=${fim}`, payload);
      } else {
        await api.post(`/discipulado/relatorio-semanal?inicio=${inicio}&fim=${fim}`, payload);
      }
      lsDraftRemove(draftKey(celula.id, inicio));
      setModoEdicao(false);
      carregouRef.current = false;
      setMembros((prev) => { setPresencas(inicializarPresencas(prev)); return prev; });
      carregouRef.current = true;
      await verificarExistente(inicio, fim);
      setToastSucesso({ totalPresencas: totalEnviado, porcentagem: pctEnviado, nomeCelula: nomeCell, modoEdicao: eraEdicao });
    } catch (e) {
      setErro(e?.response?.data?.message || "Erro no envio.");
    } finally {
      setEnviando(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", gap: 14 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500&display=swap'); @keyframes rd-spin{to{transform:rotate(360deg)}} .rd-spin{animation:rd-spin 1s linear infinite}`}</style>
        <IEQCross size={40} />
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".22em", textTransform: "uppercase", color: AURA.gold }}>
          Carregando membros…
        </p>
      </div>
  );

  return (
      <div className="rd-root">
        <RDStyles t={t} isDark={isDark} />
        <div className="rd-glow" />

        {toastSucesso && (
            <ToastSucessoDiscipulado
                totalPresencas={toastSucesso.totalPresencas}
                porcentagem={toastSucesso.porcentagem}
                nomeCelula={toastSucesso.nomeCelula}
                modoEdicao={toastSucesso.modoEdicao}
                onClose={() => setToastSucesso(null)}
            />
        )}

        {modalJust && (
            <ModalJustificativa
                isDark={isDark}
                nomeMembro={modalJust.nomeMembro}
                labelCulto={modalJust.labelCulto}
                valorAtual={modalJust.valorAtual}
                onSalvar={(v) => alterarJustificativa(modalJust.membroIndex, modalJust.justField, v)}
                onFechar={() => setModalJust(null)}
            />
        )}

        <div className="rd-content">

          {rascunhoCarregado && (
              <div className="rd-toast-draft">
                <Save size={14} /> Rascunho restaurado — suas marcações anteriores foram recuperadas
              </div>
          )}

          {/* ── Header ── */}
          <div className="rd-card">
            <div className="rd-header">
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div className="rd-avatar-wrap">
                  <div className="rd-ring" style={{ width: 66, height: 66 }} />
                  <div className="rd-ring" style={{ width: 52, height: 52, animationDelay: ".9s" }} />
                  <div className="rd-logo-circle"><IEQCross size={28} /></div>
                </div>
                <div>
                  <p className="rd-eyebrow">Discipulado</p>
                  <h2 className="rd-title">{celula?.nome || "Célula"}</h2>
                  <div style={{ height: 16, marginTop: 3 }}>
                    {salvouAgora && <span className="rd-saved-badge"><Save size={10} /> Rascunho salvo</span>}
                  </div>
                </div>
              </div>
              <div className="rd-tabs">
                <button className={`rd-tab ${aba === "relatorio" ? "rd-tab-active" : "rd-tab-inactive"}`}
                        onClick={() => { setAba("relatorio"); setDetalheItem(null); }}>
                  <UserCheck size={13} /> Relatório
                </button>
                <button className={`rd-tab ${aba === "historico" ? "rd-tab-active" : "rd-tab-inactive"}`}
                        onClick={() => { setAba("historico"); setDetalheItem(null); }}>
                  <History size={13} /> Histórico
                </button>
              </div>
            </div>
          </div>

          {/* ── ABA HISTÓRICO ── */}
          {aba === "historico" && (
              detalheItem
                  ? <DetalheHistorico item={detalheItem} isDark={isDark} onVoltar={() => setDetalheItem(null)} onEditar={(item, detalhe) => entrarModoEdicao(item, detalhe)} />
                  : <AbaHistorico isDark={isDark} onVerDetalhe={setDetalheItem} />
          )}

          {/* ── ABA RELATÓRIO ── */}
          {aba === "relatorio" && (
              <>
                {/* Datas */}
                <div className="rd-card rd-date-bar">
                  <Calendar size={14} style={{ color: AURA.gold, flexShrink: 0 }} />
                  <input type="date" className="rd-date-input" value={inicio} onChange={(e) => handleInicioChange(e.target.value)} />
                  <span className="rd-date-sep">→</span>
                  <input type="date" className="rd-date-input" value={fim} onChange={(e) => handleFimChange(e.target.value)} />
                  {verificandoExist && <Loader2 size={13} className="rd-spin" style={{ color: AURA.gold, marginLeft: "auto" }} />}
                </div>

                {/* Banner existente */}
                {relatorioExistente && !modoEdicao && (
                    <div className="rd-banner rd-banner-warn">
                      <AlertTriangle size={18} style={{ color: AURA.yellow, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p className="rd-banner-title" style={{ color: AURA.yellowDark }}>Relatório já enviado para esta semana</p>
                        <p className="rd-banner-sub">Um relatório já foi registrado para o período selecionado.</p>
                      </div>
                      <button className="rd-btn-edit-gold" onClick={() => entrarModoEdicao(relatorioExistente, null)}>
                        <Edit3 size={12} /> Editar
                      </button>
                    </div>
                )}

                {/* Banner modo edição */}
                {modoEdicao && (
                    <div className="rd-banner rd-banner-edit">
                      <Edit3 size={16} style={{ color: AURA.blueLight, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p className="rd-banner-title" style={{ color: AURA.blueLight }}>Modo edição ativo</p>
                        <p className="rd-banner-sub">As alterações substituirão o envio anterior.</p>
                      </div>
                      <button className="rd-btn-icon" onClick={() => {
                        setModoEdicao(false);
                        setMembros((prev) => { setPresencas(inicializarPresencas(prev)); return prev; });
                      }}>Cancelar</button>
                    </div>
                )}

                {/* KPIs */}
                <div className="rd-kpi-grid">
                  {[
                    { label: "Membros",    val: membros.length,          color: AURA.gold  },
                    { label: "Presenças",  val: stats.totalGeral,        color: AURA.blue  },
                    { label: "Frequência", val: `${stats.porcentagem}%`, color: stats.porcentagem > 60 ? AURA.gold : AURA.red, highlight: stats.porcentagem > 60 },
                  ].map(({ label, val, color, highlight }) => (
                      <div key={label} className="rd-kpi" style={highlight ? { background: `linear-gradient(135deg,${AURA.blueDark},${AURA.blue})`, border: "none" } : {}}>
                        <p className="rd-kpi-label" style={highlight ? { color: "rgba(255,255,255,.55)" } : {}}>{label}</p>
                        <p className="rd-kpi-val" style={{ color: highlight ? "#fff" : color }}>{val}</p>
                      </div>
                  ))}
                </div>

                {erro && <div className="rd-erro">{erro}</div>}

                {/* Tabela */}
                <div className="rd-card" style={{ overflow: "hidden", opacity: relatorioExistente && !modoEdicao ? 0.4 : 1, pointerEvents: relatorioExistente && !modoEdicao ? "none" : "auto", transition: "opacity .3s" }}>
                  <div className="rd-table-scroll">
                    <div className="rd-table-inner">
                      <div className="rd-table-head" style={{ gridTemplateColumns: "1fr repeat(5, 1fr)" }}>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: t.textMuted }}>Membro</span>
                        {COLUNAS.map(({ label, emoji }) => (
                            <div key={label} className="rd-table-col-label">
                              <div style={{ fontSize: 15, marginBottom: 3 }}>{emoji}</div>
                              {label}
                            </div>
                        ))}
                      </div>

                      {membros.map((m, i) => {
                        const p     = presencas[i];
                        const total = p ? COLUNAS.filter((c) => p[c.campo]).length : 0;
                        const pct   = Math.round((total / COLUNAS.length) * 100);
                        return (
                            <div key={m.id} className="rd-member-row" style={{ animationDelay: `${i * 0.04}s` }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <div className="rd-member-avatar">{m.nome.charAt(0)}</div>
                                  <div>
                                    <p className="rd-member-name">{m.nome}</p>
                                    <p className="rd-member-id">ID #{m.id}</p>
                                  </div>
                                </div>
                                <div style={{ padding: "4px 14px", borderRadius: 100, background: total === COLUNAS.length ? `linear-gradient(135deg,${AURA.gold},${AURA.goldLight})` : (isDark ? "rgba(201,169,110,.06)" : "rgba(201,169,110,.08)"), border: `1px solid ${total === COLUNAS.length ? "transparent" : t.border}` }}>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: total === COLUNAS.length ? "#0A0A0F" : t.textMuted }}>
                              {total}/{COLUNAS.length}
                            </span>
                                </div>
                              </div>
                              <div className="rd-progress-track">
                                <div className="rd-progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? `linear-gradient(90deg,${AURA.gold},${AURA.goldLight})` : `linear-gradient(90deg,${AURA.red},${AURA.blue})` }} />
                              </div>

                              <div className="rd-presence-grid">
                                {COLUNAS.map(({ campo, label, labelSm, emoji, justField }) => {
                                  const marcado = p?.[campo];
                                  const justVal = p?.[justField] ?? "";
                                  const temJust = !marcado && !!justVal;
                                  return (
                                      <div key={campo} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
                                        <button
                                            className="rd-presence-btn"
                                            onClick={() => alterarPresenca(i, campo)}
                                            title={label}
                                            style={{
                                              borderColor: marcado ? "rgba(201,169,110,.5)" : t.border,
                                              background: marcado ? (isDark ? "rgba(201,169,110,.1)" : "rgba(201,169,110,.07)") : "transparent",
                                              transform: marcado ? "scale(1.04)" : "scale(1)",
                                            }}
                                        >
                                          <span className="rd-pb-emoji" style={{ opacity: marcado ? 1 : 0.4, filter: marcado ? "none" : "grayscale(1)" }}>
                                            {marcado ? "✅" : emoji}
                                          </span>
                                          <span className="rd-pb-label" style={{ color: marcado ? AURA.gold : t.textMuted }}>
                                            <span className="rd-pb-label-full">{label}</span>
                                            <span className="rd-pb-label-sm">{labelSm}</span>
                                          </span>
                                        </button>
                                        {!marcado && (
                                            <button className={`rd-just-btn${temJust ? " rd-just-btn-filled" : ""}`} onClick={() => abrirModalJust(i, campo, justField, m.nome, label)}>
                                              {temJust ? <>{EMOJIS_JUST[justVal] || "📝"} {justVal}</> : <>📋 Motivo</>}
                                            </button>
                                        )}
                                      </div>
                                  );
                                })}
                              </div>
                            </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Botão enviar */}
                <button className={`rd-btn-submit ${modoEdicao ? "rd-btn-blue" : "rd-btn-gold"}`} onClick={enviarRelatorio}
                        disabled={enviando || loading || membros.length === 0 || (relatorioExistente && !modoEdicao)}>
                  {enviando
                      ? <><Loader2 size={17} className="rd-spin" /> Processando…</>
                      : modoEdicao
                          ? <><Edit3 size={17} /> Salvar Alterações</>
                          : <><CheckCircle2 size={17} /> Finalizar Relatório da Semana</>
                  }
                </button>
              </>
          )}

          <div className="rd-divider" />
          <p className="rd-footer">© IEQ Pituaçu · Sistema Eclesiástico · {new Date().getFullYear()}</p>
        </div>
      </div>
  );
}
import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../services/api.js";
import { getFotoUrl } from "../../utils/foto.js";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import TelaRelatorio from "./TelaRelatorio";
import TelaVisitantes from "./TelaVisitantes";
import TelaFichas from "./TelaFichas";
import RelatorioDiscipulado from "./RelatorioDiscipulado";
import CasasDePazLider from "./CasasDePazLider";
import Missao70Lider from "./Missao70Lider";
import SolicitarFichaMembro from "./SolicitarFichaMembro";
import SinoAniversariantes from "./SinoAniversariantes";
import BoasVindasLider from "./BoasVindasLider";
import TelaMetasLider from "./TelaMetasLider";
import {
  Trash2, Loader2, Users, Plus, Search, X,
  TrendingUp, Target, Sparkles, LogOut,
  Sun, Moon, CheckCircle2, Home, Flame,
  CalendarDays, ChevronRight, ClipboardList,
} from "lucide-react";

/* ─── Tokens AURA ──────────────────────────────────────────────────────── */
const AURA = {
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  dark:      "#0A0A0F",
  darkEl:    "#12121A",
  light:     "#F5F0E8",
  red:       "#C8102E",
  redDark:   "#9B0B1E",
  blue:       "#003DA5",
  blueDark:  "#002470",
  yellow:    "#FDB813",
};

function theme(isDark) {
  return {
    bg:          isDark ? "#0A0A0F"               : "#E8F1FB",
    bgEl:        isDark ? "rgba(18,18,26,.95)"     : "rgba(232,241,251,.95)",
    bgInput:     isDark ? "rgba(255,255,255,.04)"  : "rgba(0,61,165,.04)",
    border:      isDark ? "rgba(201,169,110,.1)"   : "rgba(0,61,165,.15)",
    borderInput: isDark ? "rgba(201,169,110,.15)"  : "rgba(0,61,165,.2)",
    text:        isDark ? "#FFFFFF"               : "#0A1628",
    textSec:     isDark ? "#9A9588"                : "#1E3A5F",
    textMuted:   isDark ? "#6B6658"                : "#4A6585",
    glow1:       isDark ? "rgba(201,169,110,.05)"  : "rgba(0,61,165,.06)",
    glow2:       isDark ? "rgba(201,169,110,.04)"  : "rgba(201,169,110,.06)",
    headerBg:    isDark ? "rgba(10,10,15,.97)"     : "rgba(232,241,251,.97)",
    cardHover:   isDark ? "rgba(201,169,110,.2)"   : "rgba(0,61,165,.3)",
    placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(74,101,133,.45)",
    optionBg:    isDark ? "#12121A"                : "#DCEBFB",
  };
}

const BOAS_VINDAS_KEY = "ieq_boasvindas_visto";

/* ─── Logo ─────────────────────────────────────────────────────────────── */
function IEQCross({ size = 36 }) {
  return (
      <img
          src="/quadrangular.png"
          alt="Logo IEQ"
          style={{
            width: size, height: size,
            borderRadius: "50%", objectFit: "cover", display: "block",
          }}
      />
  );
}

/* ─── CSS Global ────────────────────────────────────────────────────────── */
function GlobalStyles({ t, isDark }) {
  return (
      <style>{`
      @keyframes dl-spin   { to { transform: rotate(360deg); } }
      @keyframes dl-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes dl-blink  { 0%,100%{opacity:1;} 50%{opacity:.3;} }

      .dl-spin   { animation: dl-spin  1s linear infinite; }
      .dl-pulse  { animation: dl-pulse 3s ease-in-out infinite; }
      .dl-blink  { animation: dl-blink 2s ease-in-out infinite; }

      .dl-root {
        font-family: 'Inter', sans-serif;
        background: ${isDark ? "-webkit-linear-gradient(90deg, #5c5c5c,#333333,#000000,#000000,#000000)" : "-webkit-linear-gradient(90deg, #ffffff,#ffffff,#928672)"};
        background: ${isDark ? "linear-gradient(90deg, #5c5c5c,#333333,#000000,#000000,#000000)" : "linear-gradient(90deg, #ffffff,#ffffff,#928672)"};
        color: ${t.text};
        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
        padding-bottom: max(40px, env(safe-area-inset-bottom, 40px));
        transition: background .3s, color .3s;
        isolation: isolate;
      }
      .dl-glow {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
          radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%);
        transition: background .3s;
      }
      .dl-content {
        position: relative; z-index: 1;
        max-width: 960px; margin: 0 auto;
        padding: 28px 18px 0;
      }
      @media(max-width: 420px) { .dl-content { padding: 18px 14px 0; } }

      .dl-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; margin-bottom: 26px; flex-wrap: wrap;
      }
      .dl-header-left {
        display: flex; align-items: center; gap: 14px;
        flex: 1; min-width: 0;
      }
      .dl-avatar-wrap { position: relative; flex-shrink: 0; }
      .dl-ring {
        position: absolute; border-radius: 50%;
        border: 1px solid rgba(201,169,110,.22);
        top: 50%; left: 50%; transform: translate(-50%,-50%);
      }
      .dl-avatar {
        width: 52px; height: 52px; border-radius: 50%;
        border: 1.5px solid rgba(201,169,110,.28);
        background: ${isDark ? "rgba(18,18,26,.99)" : "#fff"};
        display: flex; align-items: center; justify-content: center; overflow: hidden;
        position: relative; z-index: 1;
      }
      .dl-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      .dl-title-block { flex: 1; min-width: 0; }
      .dl-eyebrow {
        font-size: 9px; font-weight: 500; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(201,169,110,.55);
        margin: 0 0 3px;
      }
      .dl-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(17px, 4vw, 22px);
        font-weight: 500; color: ${t.text};
        margin: 0; line-height: 1.2; letter-spacing: .02em;
      }
      .dl-title span { color: ${AURA.gold}; }
      .dl-subtitle {
        font-size: 11px; font-weight: 300; color: ${t.textSec};
        margin: 3px 0 0; overflow: hidden;
        text-overflow: ellipsis; white-space: nowrap;
      }
      .dl-header-actions {
        display: flex; align-items: center; gap: 8px; flex-shrink: 0;
      }
      .dl-btn-ico {
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${t.border};
        border-radius: 12px; width: 38px; height: 38px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        color: ${t.textMuted}; transition: all .25s; flex-shrink: 0;
      }
      .dl-btn-ico:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }
      .dl-btn-exit {
        display: flex; align-items: center; gap: 7px;
        padding: 0 16px; height: 38px; border-radius: 100px; border: none;
        cursor: pointer;
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; transition: all .3s; flex-shrink: 0;
        box-shadow: 0 6px 20px rgba(200,16,46,.25);
      }
      .dl-btn-exit:hover { opacity: .88; transform: translateY(-1px); }

      /* Botão voltar pequeno */
      .dl-btn-back {
        display: flex; align-items: center; justify-content: center;
        width: 32px; height: 32px; border-radius: 10px;
        border: 1px solid ${t.border}; cursor: pointer;
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        color: ${t.textMuted}; font-size: 14px;
        transition: all .25s; flex-shrink: 0;
      }
      .dl-btn-back:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

      .dl-divider {
        display: flex; align-items: center; gap: 10px; margin: 0 0 22px;
      }
      .dl-divider::before {
        content: ''; flex: 1; height: 1px;
        background: linear-gradient(to right, transparent, ${AURA.gold});
      }
      .dl-divider::after {
        content: ''; flex: 1; height: 1px;
        background: linear-gradient(to left, transparent, ${AURA.gold});
      }
      .dl-divider-dot { width: 5px; height: 5px; border-radius: 50%; background: ${AURA.gold}; }

      .dl-badge {
        display: inline-flex; align-items: center; gap: 7px;
        background: rgba(201,169,110,.07);
        border: 1px solid rgba(201,169,110,.2);
        border-radius: 100px; padding: 8px 18px;
        font-size: 10px; font-weight: 500; letter-spacing: .1em;
        text-transform: uppercase; color: ${AURA.gold};
        white-space: nowrap;
      }
      .dl-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: ${AURA.gold}; }
      .dl-badge-center { display: flex; justify-content: center; margin-bottom: 24px; }

      .dl-alert-aprovado {
        margin-bottom: 24px; padding: 16px 22px; border-radius: 16px;
        background: linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark});
        color: #fff; display: flex; align-items: center; gap: 12px;
        font-family: 'Inter', sans-serif; font-size: 11px;
        font-weight: 500; letter-spacing: .1em;
        border: 1px solid rgba(201,169,110,.15);
      }

      .dl-kpi-grid {
        display: grid; grid-template-columns: 1.6fr 1fr;
        gap: 14px; margin-bottom: 22px;
      }
      @media(max-width: 480px) { .dl-kpi-grid { grid-template-columns: 1fr; } }

      .dl-kpi-hero {
        background: linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark});
        border: 1px solid rgba(201,169,110,.12);
        border-radius: 20px; padding: 26px 22px; position: relative; overflow: hidden;
      }
      .dl-kpi-stripes {
        position: absolute; inset: 0; pointer-events: none;
        background-image: repeating-linear-gradient(
          -55deg, rgba(255,255,255,.025) 0 8px, transparent 8px 16px
        );
      }
      .dl-kpi-inner { position: relative; z-index: 1; }
      .dl-big-num {
        font-family: 'Playfair Display', serif;
        font-size: clamp(44px, 10vw, 58px);
        font-weight: 600; color: #fff; line-height: 1; margin: 10px 0 6px;
      }
      .dl-kpi-label {
        font-size: 9px; font-weight: 600; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(255,255,255,.55);
      }
      .dl-kpi-desc {
        font-size: 11px; font-weight: 300; color: rgba(255,255,255,.45);
        margin-top: 8px; line-height: 1.55; max-width: 240px;
      }
      .dl-progress-wrap { margin-top: 16px; }
      .dl-progress-top {
        display: flex; justify-content: space-between;
        font-size: 9px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; color: rgba(255,255,255,.45); margin-bottom: 7px;
      }
      .dl-progress-track {
        height: 5px; border-radius: 99px;
        background: rgba(255,255,255,.1); overflow: hidden;
      }
      .dl-progress-fill {
        height: 100%; border-radius: 99px;
        background: linear-gradient(90deg, ${AURA.red}, ${AURA.yellow});
        transition: width 1.2s cubic-bezier(.4,0,.2,1);
      }
      .dl-progress-fill.done { background: ${AURA.yellow}; }

      .dl-kpi-action {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 20px; padding: 22px 18px;
        display: flex; flex-direction: column; justify-content: space-between;
        backdrop-filter: blur(20px);
      }
      .dl-kpi-action-icon {
        width: 44px; height: 44px; border-radius: 13px; margin-bottom: 14px;
        display: flex; align-items: center; justify-content: center;
      }
      .dl-kpi-action-title {
        font-size: 11px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; color: ${t.text}; margin: 0 0 4px;
      }
      .dl-kpi-action-sub {
        font-size: 12px; font-weight: 300; color: ${t.textSec}; margin: 0;
      }
      .dl-kpi-action-btn {
        margin-top: 18px; width: 100%; padding: 12px; border-radius: 100px;
        border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; transition: all .3s;
        box-shadow: 0 6px 20px rgba(0,61,165,.25);
      }
      .dl-kpi-action-btn:hover { opacity: .88; transform: translateY(-1px); }
      .dl-kpi-action-btn-ghost {
        margin-top: 18px; width: 100%; padding: 12px; border-radius: 100px;
        border: 1px solid ${t.border}; cursor: pointer;
        background: transparent; color: ${t.textSec};
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
        letter-spacing: .14em; text-transform: uppercase; transition: all .3s;
      }
      .dl-kpi-action-btn-ghost:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

      .dl-section-hd {
        display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
      }
      .dl-section-title {
        font-family: 'Playfair Display', serif;
        font-size: 15px; font-weight: 500; color: ${t.text};
      }

      .dl-menu-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px; margin-bottom: 22px;
      }
      @media(max-width: 360px) { .dl-menu-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }

      .dl-menu-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 16px; padding: 16px 8px;
        cursor: pointer; display: flex; flex-direction: column;
        align-items: center; gap: 9px;
        transition: all .35s cubic-bezier(.4,0,.2,1);
        text-align: center; position: relative; overflow: hidden;
        backdrop-filter: blur(20px);
      }
      .dl-menu-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
        border-radius: 16px 16px 0 0; opacity: 0; transition: opacity .35s;
      }
      .dl-menu-card:hover {
        transform: translateY(-5px);
        border-color: ${t.cardHover};
        box-shadow: 0 14px 36px rgba(0,0,0,${isDark ? ".45" : ".12"});
      }
      .dl-menu-card:hover::before { opacity: 1; }
      .dl-menu-icon {
        width: 40px; height: 40px; border-radius: 11px;
        display: flex; align-items: center; justify-content: center; margin: 0 auto;
      }
      .dl-menu-name {
        font-size: 9px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; color: ${t.text}; margin: 0;
      }
      .dl-menu-desc {
        font-size: 8px; letter-spacing: .1em;
        text-transform: uppercase; color: ${t.textMuted}; margin: 2px 0 0;
      }

      .dl-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 20px; overflow: hidden; margin-bottom: 20px;
        backdrop-filter: blur(24px); position: relative;
      }
      .dl-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }
      .dl-card-head {
        padding: 20px 22px;
        border-bottom: 1px solid ${t.border};
        display: flex; align-items: center; justify-content: space-between;
        flex-wrap: wrap; gap: 12px;
      }
      .dl-card-head-title {
        font-family: 'Playfair Display', serif;
        font-size: 17px; font-weight: 500; color: ${t.text}; margin: 0;
      }
      .dl-card-head-sub {
        font-size: 11px; font-weight: 300; color: ${t.textMuted}; margin: 3px 0 0;
      }

      .dl-btn-gold {
        display: flex; align-items: center; gap: 7px;
        padding: 11px 20px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight});
        color: #0A0A0F; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; transition: all .35s;
        box-shadow: 0 6px 22px rgba(201,169,110,.22); flex-shrink: 0;
      }
      .dl-btn-gold:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(201,169,110,.32); }
      .dl-btn-ghost {
        display: flex; align-items: center; gap: 7px;
        padding: 11px 18px; border-radius: 100px;
        border: 1px solid ${t.border}; cursor: pointer;
        background: transparent; color: ${t.textSec};
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
        letter-spacing: .14em; text-transform: uppercase; transition: all .3s;
      }
      .dl-btn-ghost:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

      .dl-members-list {
        padding: 16px 20px;
        display: flex; flex-direction: column; gap: 9px;
      }
      .dl-member-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 14px;
        background: ${isDark ? "rgba(255,255,255,.025)" : "rgba(201,169,110,.04)"};
        border: 1px solid ${isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.12)"};
        border-radius: 13px; transition: border-color .2s; gap: 10px;
        min-width: 0; width: 100%;
      }
      .dl-member-row:hover { border-color: rgba(201,169,110,.3); }
      .dl-member-avatar {
        width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
        background: linear-gradient(135deg, rgba(201,169,110,.2), rgba(201,169,110,.06));
        border: 1px solid rgba(201,169,110,.22);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Playfair Display', serif; font-weight: 600;
        font-size: 15px; color: ${AURA.gold};
      }
      .dl-member-name {
        font-size: 13px; font-weight: 300; color: ${t.text};
        flex: 1; min-width: 0; overflow: hidden;
        text-overflow: ellipsis; white-space: nowrap;
      }
      .dl-btn-del {
        background: none; border: none; cursor: pointer;
        color: ${t.textMuted}; padding: 5px; border-radius: 8px;
        display: flex; align-items: center; flex-shrink: 0; transition: color .2s;
      }
      .dl-btn-del:hover { color: #e07070; }
      .dl-divider-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.15), transparent);
        margin: 2px 0;
      }

      .dl-search-wrap { position: relative; margin-bottom: 14px; }
      .dl-search-icon {
        position: absolute; left: 14px; top: 50%;
        transform: translateY(-50%); color: ${AURA.gold}; opacity: .5;
        pointer-events: none;
      }
      .dl-input {
        width: 100%; box-sizing: border-box;
        background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 13px 16px 13px 44px;
        border-radius: 13px; outline: none;
        font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
        transition: all .25s; -webkit-appearance: none; appearance: none;
      }
      .dl-input:focus {
        border-color: rgba(201,169,110,.5);
        background: rgba(201,169,110,.04);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .dl-input::placeholder { color: ${t.placeholder}; }

      .dl-modal-backdrop {
        position: fixed; inset: 0; z-index: 999;
        display: flex; align-items: flex-end; justify-content: center;
      }
      @media(min-width: 520px) {
        .dl-modal-backdrop { align-items: center; padding: 16px; }
      }
      .dl-modal-overlay {
        position: fixed; inset: 0;
        background: rgba(10,10,15,.88); z-index: 0;
        backdrop-filter: blur(4px);
      }
      .dl-modal-box {
        position: relative; z-index: 10;
        width: 100%; max-height: 88vh;
        display: flex; flex-direction: column;
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 22px 22px 0 0; overflow: hidden;
      }
      @media(min-width: 520px) {
        .dl-modal-box {
          border-radius: 22px; max-width: 480px;
          max-height: calc(100vh - 32px);
        }
      }
      .dl-modal-multi-box {
        position: relative; z-index: 10;
        width: 100%; max-height: 88vh;
        display: flex; flex-direction: column;
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 22px 22px 0 0;
        padding: 32px 26px; overflow-y: auto;
      }
      @media(min-width: 520px) {
        .dl-modal-multi-box {
          border-radius: 22px; max-width: 440px;
          max-height: calc(100vh - 32px);
        }
      }

      .dl-textarea {
        width: 100%; box-sizing: border-box; resize: vertical;
        background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 14px 16px;
        border-radius: 13px; outline: none; min-height: 110px;
        font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
        transition: all .25s;
      }
      .dl-textarea:focus {
        border-color: rgba(201,169,110,.5);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .dl-textarea::placeholder { color: ${t.placeholder}; }

      .dl-footer {
        text-align: center;
        font-size: 9px; font-weight: 500; letter-spacing: .18em;
        text-transform: uppercase;
        color: ${isDark ? "rgba(245,240,232,.12)" : "rgba(10,22,40,.3)"};
        padding: 16px 0 0;
      }

      .dl-loading {
        min-height: 100vh; display: flex;
        align-items: center; justify-content: center;
        background: ${isDark ? "-webkit-linear-gradient(90deg, #5c5c5c,#333333,#000000,#000000,#000000)" : "-webkit-linear-gradient(90deg, #ffffff,#ffffff,#928672)"};
        background: ${isDark ? "linear-gradient(90deg, #5c5c5c,#333333,#000000,#000000,#000000)" : "linear-gradient(90deg, #ffffff,#ffffff,#928672)"};
        position: relative;
      }
      .dl-loading-inner { text-align: center; position: relative; z-index: 10; }
    `}</style>
  );
}

/* ─── Componente Principal ─────────────────────────────────────────────── */
export default function DashboardLider() {
  const [abaAtiva,               setAbaAtiva]               = useState("home");
  const [celula,                 setCelula]                  = useState(null);
  const [membros,                setMembros]                 = useState([]);
  const [usuarioLogado,          setUsuarioLogado]           = useState(null);
  const [loading,                setLoading]                 = useState(true);
  const [showModalAddMembro,     setShowModalAddMembro]      = useState(false);
  const [showModalMultiplicacao, setShowModalMultiplicacao]  = useState(false);
  const [motivoMultiplicacao,    setMotivoMultiplicacao]     = useState("");
  const [solicitandoMulti,       setSolicitandoMulti]        = useState(false);
  const [isDark,                 setIsDark]                  = useState(
      () => localStorage.getItem("theme") === "dark"
  );
  const [showBoasVindas,         setShowBoasVindas]          = useState(false);

  const t = theme(isDark);

  useEffect(() => {
    if (abaAtiva !== "home") window.history.pushState({ aba: abaAtiva }, "");
    const handlePopState = () => setAbaAtiva("home");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [abaAtiva]);

  useEffect(() => { localStorage.setItem("theme", isDark ? "dark" : "light"); }, [isDark]);

  const handleLogout = () => { localStorage.clear(); window.location.href = "/login"; };

  const fecharBoasVindas = () => {
    localStorage.setItem(BOAS_VINDAS_KEY, new Date().toISOString().substring(0, 10));
    setShowBoasVindas(false);
  };

  const carregarDados = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [resCelula, resUsuario] = await Promise.all([
        api.get("/celulas/minha-celula"),
        api.get("/usuarios/me"),
      ]);
      const celulaData = resCelula.data;
      setCelula(celulaData);
      setUsuarioLogado(resUsuario.data);
      if (celulaData?.id) {
        const resM = await api.get(`/celulas/${celulaData.id}/membros`);
        const unique = (arr) =>
            arr.filter((item, i, self) => i === self.findIndex((x) => x.id === item.id));
        setMembros(unique(resM.data || []));
      }
      if (!isSilent) {
        const hoje    = new Date().toISOString().substring(0, 10);
        const vistoEm = localStorage.getItem(BOAS_VINDAS_KEY);
        if (vistoEm !== hoje) setShowBoasVindas(true);
      }
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(() => carregarDados(true), 120_000);
    return () => clearInterval(interval);
  }, [carregarDados]);

  const removerMembro = async (membroId, nome) => {
    if (!window.confirm(`Remover ${nome} da célula?`)) return;
    try {
      await api.delete(`/celulas/${celula.id}/membros/${membroId}`);
      setMembros((prev) => prev.filter((m) => m.id !== membroId));
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao remover.");
    }
  };

  const solicitarMultiplicacao = async () => {
    if (!motivoMultiplicacao.trim()) return alert("O motivo é obrigatório.");
    setSolicitandoMulti(true);
    try {
      await api.post(`/celulas/${celula.id}/solicitar-multiplicacao`, {
        motivo: motivoMultiplicacao.trim(),
      });
      alert("Solicitação enviada com sucesso!");
      setShowModalMultiplicacao(false);
      setMotivoMultiplicacao("");
      carregarDados();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao enviar solicitação.");
    } finally {
      setSolicitandoMulti(false);
    }
  };

  const { qtdMembros, atingiuMeta, isAnalise, isAprovado, podeSolicitar, porcentagemMeta } =
      useMemo(() => {
        const qtdMembros      = membros.length;
        const atingiuMeta     = qtdMembros >= 8;
        const statusMulti     = celula?.statusMultiplicacao || "NORMAL";
        const isAnalise       = atingiuMeta && statusMulti === "EM_ANALISE";
        const isAprovado      = atingiuMeta && statusMulti === "APROVADO";
        const podeSolicitar   = atingiuMeta && !isAnalise;
        const porcentagemMeta = Math.min((qtdMembros / 8) * 100, 100);
        return { qtdMembros, atingiuMeta, isAnalise, isAprovado, podeSolicitar, porcentagemMeta };
      }, [membros, celula]);

  if (loading) {
    return (
        <div className="dl-loading">
          <GlobalStyles t={t} isDark={isDark} />
          <div className="dl-glow" />
          <div className="dl-loading-inner">
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <div className="dl-ring dl-pulse" style={{ width: 80, height: 80, position: "absolute", border: `1px solid rgba(201,169,110,.25)`, borderRadius: "50%" }} />
              <div className="dl-ring dl-pulse" style={{ width: 62, height: 62, position: "absolute", border: `1px solid rgba(201,169,110,.2)`, borderRadius: "50%", animationDelay: ".9s" }} />
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

  /* ── 7 módulos (Histórico removido) ── */
  const menuItems = [
    { icon: <Target size={18} />,       name: "Metas",        desc: "Objetivos",   aba: "metas",       color: AURA.red,  gradient: `${AURA.redDark},${AURA.red}` },
    { icon: <Users size={18} />,        name: "Discipulado",  desc: "Acompanhar",  aba: "discipulado", color: "#7090e8", gradient: `${AURA.blueDark},${AURA.blue}` },
    { icon: <TrendingUp size={18} />,   name: "Frequência",   desc: "Relatórios",  aba: "relatorio",   color: AURA.red,  gradient: `${AURA.redDark},${AURA.red}` },
    { icon: <CalendarDays size={18} />, name: "Fichas",       desc: "Secretaria",  aba: "fichas",      color: AURA.gold, gradient: `rgba(201,169,110,.8),${AURA.gold}` },
    { icon: <ChevronRight size={18} />, name: "Visitantes",   desc: "Novas Vidas", aba: "visitantes",  color: "#c8a010", gradient: `#a07800,#c8a010` },
    { icon: <Home size={18} />,         name: "Casas de Paz", desc: "Evangelismo", aba: "casas",       color: "#7090e8", gradient: `${AURA.blueDark},${AURA.blue}` },
    { icon: <Flame size={18} />,        name: "Missão 70",    desc: "Evangelismo", aba: "missao70",    color: "#c8a010", gradient: `#a07800,#c8a010` },
    { icon: <ClipboardList size={18} />, name: "Solic. Ficha", desc: "Novo Membro", aba: "solicitar-ficha", color: "#7090e8", gradient: `${AURA.blueDark},${AURA.blue}` },
  ];

  return (
      <div className="dl-root">
        <GlobalStyles t={t} isDark={isDark} />
        <div className="dl-glow" />

        <AnimatePresence>
          {showBoasVindas && !loading && (
              <BoasVindasLider
                  usuarioLogado={usuarioLogado}
                  celula={celula}
                  isDark={isDark}
                  onClose={fecharBoasVindas}
              />
          )}
        </AnimatePresence>

        <div className="dl-content">

          {/* ── Header ── */}
          <motion.header
              className="dl-header"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4 }}
          >
            <div className="dl-header-left">
              <div className="dl-avatar-wrap">
                <div className="dl-ring dl-pulse" style={{ width: 50, height: 70 }} />
                <div className="dl-ring dl-pulse" style={{ width: 56, height: 56, animationDelay: ".9s" }} />
                <div className="dl-avatar">
                  {usuarioLogado?.fotoPerfil
                      ? <img src={getFotoUrl(usuarioLogado.fotoPerfil)} alt={usuarioLogado.nome || "Líder"} />
                      : <IEQCross size={34} />
                  }
                </div>
              </div>
              <div className="dl-title-block">
                <p className="dl-eyebrow">Painel do Líder</p>

                <p className="dl-subtitle" style={{ fontSize: 13, fontWeight: 500, color: t.textSec }}>
                  {" "}

                </p>
                <p className="dl-subtitle" style={{ fontSize: 12, fontWeight: 400, color: t.textMuted }}>
                  👤 {usuarioLogado?.nome || ""}
                </p>
              </div>
            </div>

            <div className="dl-header-actions">
              <SinoAniversariantes isDark={isDark} celulaId={celula?.id} />
              <button className="dl-btn-ico" onClick={() => setIsDark(!isDark)} title="Tema">
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              {abaAtiva !== "home" && (
                  <button className="dl-btn-back" onClick={() => setAbaAtiva("home")} title="Voltar">
                    ←
                  </button>
              )}
              <button className="dl-btn-exit" onClick={handleLogout}>
                <LogOut size={14} /> Sair
              </button>
            </div>
          </motion.header>

          {/* ── Divider + Badge ── */}
          <div className="dl-divider"><div className="dl-divider-dot" /></div>
          <div className="dl-badge-center">
            <span className="dl-badge">
              <span className="dl-badge-dot dl-blink" />
              <strong style={{ color: t.text, fontWeight: 600 }}>
                {celula?.nome?.toUpperCase() || "—"}
              </strong>
            </span>
          </div>

          {/* ── Conteúdo animado ── */}
          <AnimatePresence mode="sync">
            {abaAtiva === "home" ? (

                <motion.div
                    key="home"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: .3 } }}
                    exit={{ opacity: 0, transition: { duration: .2 } }}
                    style={{ display: "flex", flexDirection: "column" }}
                >
                  <AnimatePresence>
                    {isAprovado && (
                        <motion.div
                            className="dl-alert-aprovado"
                            initial={{ opacity: 0, y: -14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                          <Sparkles size={16} style={{ color: AURA.yellow, flexShrink: 0 }} />
                          Multiplicação aprovada! Organize os membros para a nova célula.
                        </motion.div>
                    )}
                  </AnimatePresence>

                  {/* KPI Grid */}
                  <div className="dl-kpi-grid">
                    <div className="dl-kpi-hero">
                      <div className="dl-kpi-stripes" />
                      <div className="dl-kpi-inner">
                        <span className="dl-badge" style={{ fontSize: 9, padding: "4px 11px" }}>
                          <TrendingUp size={10} /> Crescimento
                        </span>
                        <p className="dl-big-num">{qtdMembros}</p>
                        <p className="dl-kpi-label">Membros Ativos</p>
                        <p className="dl-kpi-desc">
                          {!atingiuMeta
                              ? `Faltam ${8 - qtdMembros} membros para a meta de multiplicação.`
                              : isAnalise  ? "Aguardando parecer do seu pastor…"
                                  : isAprovado ? "Sua célula está autorizada a multiplicar."
                                      :              "Meta de 8 membros atingida! Solicite a multiplicação."
                          }
                        </p>
                        <div className="dl-progress-wrap">
                          <div className="dl-progress-top">
                            <span>{atingiuMeta ? "Meta concluída" : "Progresso"}</span>
                            <span>{Math.round(porcentagemMeta)}%</span>
                          </div>
                          <div className="dl-progress-track">
                            <motion.div
                                className={`dl-progress-fill${atingiuMeta ? " done" : ""}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${porcentagemMeta}%` }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="dl-kpi-action">
                      <div>
                        <div
                            className="dl-kpi-action-icon"
                            style={{
                              background: isAprovado ? "rgba(0,61,165,.1)" : isAnalise ? "rgba(253,184,19,.1)" : "rgba(201,169,110,.08)",
                              color: isAprovado ? AURA.blue : isAnalise ? "#c8a010" : AURA.gold,
                              border: `1px solid ${isAprovado ? "rgba(0,61,165,.25)" : isAnalise ? "rgba(253,184,19,.25)" : "rgba(201,169,110,.2)"}`,
                            }}
                        >
                          {isAprovado
                              ? <CheckCircle2 size={20} />
                              : isAnalise ? <Loader2 size={20} className="dl-spin" />
                                  : <Target size={20} />
                          }
                        </div>
                        <p className="dl-kpi-action-title">Ação Pastoral</p>
                        <p className="dl-kpi-action-sub">
                          {isAnalise ? "Em análise" : isAprovado ? "Liberado" : atingiuMeta ? "Pode solicitar" : "Aguardando meta"}
                        </p>
                      </div>
                      <div>
                        {isAnalise ? (
                            <div style={{ marginTop: 18, width: "100%", padding: "12px", textAlign: "center", borderRadius: 100, background: "rgba(253,184,19,.08)", border: "1px solid rgba(253,184,19,.25)", fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "#c8a010" }}>
                              Consultando Pastor…
                            </div>
                        ) : podeSolicitar ? (
                            <button className="dl-kpi-action-btn" onClick={() => setShowModalMultiplicacao(true)}>
                              {isAprovado ? "Nova Solicitação" : "Solicitar Mult."}
                            </button>
                        ) : (
                            <button className="dl-kpi-action-btn-ghost" onClick={() => setAbaAtiva("relatorio")}>
                              Lançar Relatório
                            </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Módulos — sem ícone de meta no cabeçalho */}
                  <div className="dl-section-hd">
                    <span className="dl-section-title">Módulos</span>
                  </div>
                  <div className="dl-menu-grid">
                    {menuItems.map(({ icon, name, desc, aba, color, gradient }) => (
                        <motion.div
                            key={aba}
                            className="dl-menu-card"
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: .96 }}
                            onClick={() => setAbaAtiva(aba)}
                        >
                          <style>{`.dl-menu-card:hover::before{ background: linear-gradient(135deg,${gradient}); }`}</style>
                          <div className="dl-menu-icon" style={{ background: `${color}18`, color }}>
                            {icon}
                          </div>
                          <div>
                            <p className="dl-menu-name">{name}</p>
                            <p className="dl-menu-desc">{desc}</p>
                          </div>
                        </motion.div>
                    ))}
                  </div>

                  {/* Membros */}
                  <div className="dl-card">
                    <div className="dl-card-head">
                      <div>
                        <h3 className="dl-card-head-title">Membros da Célula</h3>
                        <p className="dl-card-head-sub">{membros.length} ativos</p>
                      </div>
                      <button className="dl-btn-gold" onClick={() => setShowModalAddMembro(true)}>
                        <Plus size={13} /> Novo Membro
                      </button>
                    </div>
                    <div className="dl-members-list">
                      {membros.map((m, i) => (
                          <React.Fragment key={m.id}>
                            {i > 0 && i % 5 === 0 && <div className="dl-divider-line" />}
                            <div className="dl-member-row">
                              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                <div className="dl-member-avatar">{m.nome?.charAt(0).toUpperCase()}</div>
                                <span className="dl-member-name">{m.nome}</span>
                              </div>
                              <button className="dl-btn-del" onClick={() => removerMembro(m.id, m.nome)}>
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </React.Fragment>
                      ))}
                      {membros.length === 0 && (
                          <p style={{ textAlign: "center", padding: "16px 0", fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, fontStyle: "italic", color: t.textMuted }}>
                            Nenhum membro vinculado.
                          </p>
                      )}
                    </div>
                  </div>

                  <div className="dl-divider-line" style={{ margin: "8px 0 16px" }} />
                  <p className="dl-footer">© {new Date().getFullYear()} IEQ Pituaçu — Sistema Eclesiástico</p>
                </motion.div>

            ) : (

                <motion.div
                    key={abaAtiva}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: .3 } }}
                    exit={{ opacity: 0, transition: { duration: .2 } }}
                >
                  {abaAtiva === "metas"       && <TelaMetasLider      celula={celula}       isDark={isDark} />}
                  {abaAtiva === "relatorio"   && <TelaRelatorio        isDark={isDark} />}
                  {abaAtiva === "discipulado" && <RelatorioDiscipulado membros={membros}     isDark={isDark} />}
                  {abaAtiva === "visitantes"  && <TelaVisitantes       celulaId={celula?.id} isDark={isDark} />}
                  {abaAtiva === "fichas"      && <TelaFichas           celula={celula}       isDark={isDark} />}
                  {abaAtiva === "casas"       && <CasasDePazLider      celulaId={celula?.id} isDark={isDark} />}
                  {abaAtiva === "missao70"    && <Missao70Lider        celulaId={celula?.id} isDark={isDark} />}
                  {abaAtiva === "solicitar-ficha" && <SolicitarFichaMembro isDark={isDark} />}
                </motion.div>

            )}
          </AnimatePresence>
        </div>

        {/* ── Modal: Adicionar Membro ── */}
        <AnimatePresence>
          {showModalAddMembro && createPortal(
              <div className="dl-modal-backdrop">
                <motion.div className="dl-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModalAddMembro(false)} />
                <motion.div className="dl-modal-box" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "tween", duration: .28 }}>
                  <ModalBuscarMembro celulaId={celula?.id} isDark={isDark} t={t} onClose={() => { setShowModalAddMembro(false); carregarDados(); }} />
                </motion.div>
              </div>,
              document.body
          )}

          {/* ── Modal: Multiplicação ── */}
          {showModalMultiplicacao && createPortal(
              <div className="dl-modal-backdrop">
                <motion.div className="dl-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                <motion.div className="dl-modal-multi-box" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "tween", duration: .28 }}>
                  <div style={{ textAlign: "center", marginBottom: 26 }}>
                    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                      <div className="dl-ring dl-pulse" style={{ width: 68, height: 68, position: "absolute", border: "1px solid rgba(201,169,110,.22)", borderRadius: "50%" }} />
                      <div className="dl-ring dl-pulse" style={{ width: 54, height: 54, position: "absolute", border: "1px solid rgba(201,169,110,.18)", borderRadius: "50%", animationDelay: ".9s" }} />
                      <div style={{ width: 46, height: 46, borderRadius: "50%", background: isDark ? "rgba(18,18,26,.99)" : "#fff", border: "1.5px solid rgba(201,169,110,.28)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
                        <IEQCross size={32} />
                      </div>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 500, color: t.text, margin: "0 0 8px", letterSpacing: ".02em" }}>
                      Plano de Multiplicação
                    </h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, color: t.textSec }}>
                      Informe o novo líder e o local da nova célula.
                    </p>
                  </div>
                  <div className="dl-divider-line" style={{ margin: "0 0 20px" }} />
                  <textarea className="dl-textarea" placeholder="Ex: Novo líder será o João, anfitriã Maria Silva…" value={motivoMultiplicacao} onChange={(e) => setMotivoMultiplicacao(e.target.value)} />
                  <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                    <button className="dl-btn-ghost" style={{ flex: 1 }} onClick={() => setShowModalMultiplicacao(false)}>Cancelar</button>
                    <button
                        style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", border: "none", borderRadius: "100px", cursor: "pointer", background: `linear-gradient(135deg,${AURA.blueDark},${AURA.blue})`, color: "#fff", fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", transition: "all .3s", opacity: solicitandoMulti ? .6 : 1 }}
                        onClick={solicitarMultiplicacao}
                        disabled={solicitandoMulti}
                    >
                      {solicitandoMulti ? <><Loader2 size={15} className="dl-spin" /> Enviando…</> : "Enviar Plano"}
                    </button>
                  </div>
                </motion.div>
              </div>,
              document.body
          )}
        </AnimatePresence>
      </div>
  );
}

/* ─── Modal Buscar Membro ─────────────────────────────────────────────── */
function ModalBuscarMembro({ celulaId, onClose, isDark, t }) {
  const [busca,      setBusca]      = useState("");
  const [membrosSem, setMembrosSem] = useState([]);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/membros/sem-celula");
        setMembrosSem(Array.isArray(res.data) ? res.data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const vincular = async (id) => {
    try {
      await api.post(`/celulas/${celulaId}/membros/${id}`);
      onClose();
    } catch {
      alert("Erro ao vincular.");
    }
  };

  const filtrados = useMemo(
      () => membrosSem.filter((m) => m.nome?.toLowerCase().includes(busca.toLowerCase())),
      [membrosSem, busca]
  );

  return (
      <div style={{ padding: "22px 20px", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(201,169,110,.55)", margin: "0 0 4px" }}>Vincular</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 500, color: t.text, margin: 0 }}>Selecionar Membro</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 4, display: "flex" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ position: "relative", marginBottom: 14, flexShrink: 0 }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: AURA.gold, opacity: .5, pointerEvents: "none" }} />
          <input
              style={{ width: "100%", boxSizing: "border-box", background: t.bgInput, border: `1px solid ${t.borderInput}`, color: t.text, padding: "13px 16px 13px 44px", borderRadius: 13, outline: "none", fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300, transition: "all .25s" }}
              placeholder="Buscar por nome…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
          {loading ? (
              <div style={{ textAlign: "center", paddingTop: 32 }}>
                <Loader2 size={26} className="dl-spin" style={{ color: AURA.gold, display: "inline-block" }} />
              </div>
          ) : filtrados.length > 0 ? (
              filtrados.map((m) => (
                  <div
                      key={m.id}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", gap: 10, background: isDark ? "rgba(255,255,255,.03)" : "rgba(201,169,110,.04)", border: `1px solid ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.14)"}`, borderRadius: 13, flexShrink: 0, transition: "border-color .2s, background .2s", cursor: "default" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,110,.35)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.14)"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: "linear-gradient(135deg,rgba(201,169,110,.2),rgba(201,169,110,.06))", border: "1px solid rgba(201,169,110,.22)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 14, color: AURA.gold }}>
                        {m.nome?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.nome}
                      </span>
                    </div>
                    <button
                        onClick={() => vincular(m.id)}
                        style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 100, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${AURA.gold},${AURA.goldLight})`, color: "#0A0A0F", fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", transition: "all .25s" }}
                    >
                      <Plus size={11} /> Vincular
                    </button>
                  </div>
              ))
          ) : (
              <p style={{ textAlign: "center", paddingTop: 28, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, fontStyle: "italic", color: t.textMuted }}>
                Nenhum membro encontrado.
              </p>
          )}
        </div>
      </div>
  );
}
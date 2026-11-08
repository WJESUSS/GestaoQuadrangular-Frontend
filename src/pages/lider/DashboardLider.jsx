import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import api from "../../services/api.js";
import { getFotoUrl } from "../../utils/foto.js";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import SinoAniversariantes from "./SinoAniversariantes";
import BoasVindasLider from "./BoasVindasLider";

/* Telas e modais pesados carregados sob demanda (code-splitting) */
const TelaRelatorio          = React.lazy(() => import("./TelaRelatorio"));
const TelaVisitantes         = React.lazy(() => import("./TelaVisitantes"));
const TelaFichas             = React.lazy(() => import("./TelaFichas"));
const RelatorioDiscipulado   = React.lazy(() => import("./RelatorioDiscipulado"));
const AcompanhamentoDiscipulado = React.lazy(() => import("./AcompanhamentoDiscipulado"));
const Missao70Lider          = React.lazy(() => import("./Missao70Lider"));
const SolicitarFichaMembro   = React.lazy(() => import("./SolicitarFichaMembro"));
const TelaMetasLider         = React.lazy(() => import("./TelaMetasLider"));
import {
  Trash2, Loader2, Users, Plus, Search, X,
  TrendingUp, Target, Sparkles, LogOut,
  Sun, Moon, Flame,
  CalendarDays, ChevronRight, ClipboardList,
  UserCheck,
} from "lucide-react";
import { AURA } from "./liderTheme";
import "./dashboardLider.css";
import TelaCarregando from "../../components/TelaCarregando.jsx";
import CrossMark from "../../components/CrossMark.jsx";
import cartazImg from "../../assets/jesus_salva_cartaz.jpg";

const BOAS_VINDAS_KEY = "ieq_boasvindas_visto";

/* ─── CSS Global ────────────────────────────────────────────────────────── */
const GlobalStyles = React.memo(function GlobalStyles() {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:wght@600;700&display=swap');

      @keyframes dl-spin   { to { transform: rotate(360deg); } }
      @keyframes dl-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes dl-blink  { 0%,100%{opacity:1;} 50%{opacity:.3;} }

      .dl-spin   { animation: dl-spin  1s linear infinite; }
      .dl-pulse  { animation: dl-pulse 3s ease-in-out infinite; }
      .dl-blink  { animation: dl-blink 2s ease-in-out infinite; }

      .dl-root {
        font-family: 'Inter', sans-serif;
        background: var(--dl-bg);
        color: var(--dl-text);
        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
        padding-bottom: max(40px, env(safe-area-inset-bottom, 40px));
        transition: background .3s, color .3s;
        isolation: isolate;
      }
      .dl-root::before {
        content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none;
        background-image: var(--dl-bg-overlay);
        background-size: cover;
        background-position: center top;
        background-repeat: no-repeat;
      }
      .dl-content {
        position: relative; z-index: 3;
        max-width: 1000px; margin: 0 auto;
        padding: 34px 20px 0;
      }
      @media(max-width: 420px) { .dl-content { padding: 22px 14px 0; } }

      .dl-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; margin-bottom: 30px; flex-wrap: wrap;
      }
      .dl-header-left {
        display: flex; align-items: center; gap: 16px;
        flex: 1; min-width: 0;
      }
      .dl-avatar-wrap { position: relative; flex-shrink: 0; }
      .dl-ring {
        position: absolute; border-radius: 50%;
        border: 1px solid rgba(253,184,19,.22);
        top: 50%; left: 50%; transform: translate(-50%,-50%);
      }
      .dl-avatar {
        width: 54px; height: 54px; border-radius: 50%;
        border: 1.5px solid rgba(253,184,19,.32);
        background: var(--dl-avatar-bg);
        display: flex; align-items: center; justify-content: center; overflow: hidden;
        position: relative; z-index: 1;
        box-shadow: var(--dl-avatar-shadow);
      }
      .dl-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      .dl-title-block { flex: 1; min-width: 0; }
      .dl-eyebrow {
        font-size: 9.5px; font-weight: 500; letter-spacing: .24em;
        text-transform: uppercase; color: rgba(253,184,19,.72);
        margin: 0 0 5px;
      }
      .dl-title {
        font-family: 'Inter', sans-serif;
        font-size: clamp(18px, 4vw, 23px);
        font-weight: 700; color: var(--dl-text);
        margin: 0; line-height: 1.2; letter-spacing: -.02em;
      }
      .dl-title span { color: var(--dl-accent); }
      .dl-subtitle {
        font-size: 12px; font-weight: 400; color: var(--dl-text-sec);
        margin: 4px 0 0; overflow: hidden;
        text-overflow: ellipsis; white-space: nowrap;
      }
      .dl-header-actions {
        display: flex; align-items: center; gap: 8px; flex-shrink: 0;
      }
      .dl-btn-ico {
        background: var(--dl-surface-1);
        border: 1px solid var(--dl-border);
        border-radius: 12px; width: 38px; height: 38px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        color: var(--dl-text-muted);
        backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
        transition: all .25s; flex-shrink: 0;
      }
      .dl-btn-ico:hover { border-color: var(--dl-accent); color: var(--dl-accent); background: var(--dl-hover-gold-bg); }
      .dl-btn-exit {
        display: flex; align-items: center; gap: 7px;
        padding: 0 16px; height: 38px; border-radius: 100px;
        cursor: pointer;
        background: transparent; color: ${AURA.red};
        border: 1px solid rgba(255,211,77,.28);
        font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; transition: all .3s; flex-shrink: 0;
      }
      .dl-btn-exit:hover { background: rgba(255,211,77,.1); border-color: ${AURA.red}; }

      /* Botão voltar pequeno */
      .dl-btn-back {
        display: flex; align-items: center; justify-content: center;
        width: 32px; height: 32px; border-radius: 10px;
        border: 1px solid var(--dl-border); cursor: pointer;
        background: var(--dl-surface-1);
        color: var(--dl-text-muted); font-size: 14px;
        transition: all .25s; flex-shrink: 0;
      }
      .dl-btn-back:hover { border-color: var(--dl-accent); color: var(--dl-accent); }

      .dl-divider {
        display: flex; align-items: center; gap: 10px; margin: 0 auto 26px; max-width: 420px;
      }
      .dl-divider::before {
        content: ''; flex: 1; height: 1px;
        background: linear-gradient(to right, transparent, rgba(253,184,19,.3));
      }
      .dl-divider::after {
        content: ''; flex: 1; height: 1px;
        background: linear-gradient(to left, transparent, rgba(253,184,19,.3));
      }
      .dl-divider-dot { width: 4px; height: 4px; border-radius: 50%; background: ${AURA.gold}; box-shadow: 0 0 10px ${AURA.gold}; }

      .dl-badge {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--dl-soft-gold-bg);
        border: 1px solid var(--dl-soft-gold-border);
        border-radius: 100px; padding: 9px 20px;
        font-size: 10px; font-weight: 500; letter-spacing: .12em;
        text-transform: uppercase; color: var(--dl-accent);
        white-space: nowrap;
        backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
        box-shadow: var(--dl-inset-highlight);
      }
      .dl-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: ${AURA.gold}; }
      .dl-badge-center { display: flex; justify-content: center; margin-bottom: 26px; }

      .dl-alert-aprovado {
        margin-bottom: 24px; padding: 16px 22px; border-radius: 16px;
        background: var(--dl-alert-bg);
        color: var(--dl-alert-color); display: flex; align-items: center; gap: 12px;
        font-family: 'Inter', sans-serif; font-size: 11px;
        font-weight: 500; letter-spacing: .05em;
        border: var(--dl-alert-border);
        backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
      }

      .dl-kpi-grid {
        display: grid; grid-template-columns: 1.6fr 1fr;
        gap: 16px; margin-bottom: 30px;
      }
      @media(max-width: 480px) { .dl-kpi-grid { grid-template-columns: 1fr; } }

      .dl-kpi-hero {
        background: linear-gradient(160deg, #5A0B16 0%, #350309 55%, #1D0409 100%);
        border: 1px solid rgba(255,211,77,.3);
        border-radius: 24px; padding: 30px 28px; position: relative; overflow: hidden;
        box-shadow: none;
      }
      .dl-kpi-stripes {
        position: absolute; inset: 0; pointer-events: none;
        background-image: repeating-linear-gradient(
          -55deg, rgba(255,255,255,.03) 0 9px, transparent 9px 18px
        );
      }
      .dl-kpi-inner { position: relative; z-index: 1; }
      .dl-kpi-hero .dl-badge {
        background: rgba(255,211,77,.14);
        border: 1px solid rgba(255,211,77,.35);
        color: #FFE9A8;
      }
      .dl-kpi-hero .dl-progress-track {
        background: rgba(255,255,255,.16);
      }
      .dl-big-num {
        font-family: 'Fraunces', serif;
        font-size: clamp(48px, 10vw, 62px);
        font-weight: 600; line-height: 1; margin: 12px 0 4px;
        background: linear-gradient(180deg, #fff, rgba(255,255,255,.72));
        -webkit-background-clip: text; background-clip: text; color: transparent;
        letter-spacing: -.02em;
      }
      .dl-kpi-label {
        font-size: 10px; font-weight: 600; letter-spacing: .22em;
        text-transform: uppercase; color: rgba(255,255,255,.6);
      }
      .dl-kpi-desc {
        font-size: 11.5px; font-weight: 300; color: rgba(255,255,255,.62);
        margin-top: 10px; line-height: 1.6; max-width: 260px;
      }
      .dl-progress-wrap { margin-top: 18px; }
      .dl-progress-top {
        display: flex; justify-content: space-between;
        font-size: 9px; font-weight: 600; letter-spacing: .16em;
        text-transform: uppercase; color: rgba(255,255,255,.52); margin-bottom: 8px;
      }
      .dl-progress-track {
        height: 5px; border-radius: 99px;
        background: rgba(255,255,255,.14); overflow: hidden;
      }
      .dl-progress-fill {
        height: 100%; border-radius: 99px;
        background: linear-gradient(90deg, ${AURA.gold}, ${AURA.goldLight});
        transition: width 1.2s cubic-bezier(.4,0,.2,1);
      }
      .dl-progress-fill.done { background: linear-gradient(90deg, ${AURA.goldLight}, ${AURA.gold}); }

      .dl-kpi-action {
        background: var(--dl-card-bg); border: 1px solid var(--dl-card-border);
        border-radius: 24px; padding: 24px 20px;
        display: flex; flex-direction: column; justify-content: space-between;
        backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        box-shadow: var(--dl-card-shadow);
      }
      .dl-kpi-action-icon {
        width: 46px; height: 46px; border-radius: 50%; margin-bottom: 16px;
        display: flex; align-items: center; justify-content: center;
      }
      .dl-kpi-action-title {
        font-size: 10px; font-weight: 600; letter-spacing: .16em;
        text-transform: uppercase; color: var(--dl-text); margin: 0 0 5px;
      }
      .dl-kpi-action-sub {
        font-size: 13px; font-weight: 300; color: var(--dl-text-sec); margin: 0;
      }
      .dl-kpi-action-btn {
        margin-top: 20px; width: 100%; padding: 13px; border-radius: 100px;
        border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.moss}, ${AURA.mossDeep});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .16em;
        text-transform: uppercase; transition: all .3s;
      }
      .dl-kpi-action-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
      .dl-kpi-action-btn-ghost {
        margin-top: 20px; width: 100%; padding: 13px; border-radius: 100px;
        border: 1px solid var(--dl-border); cursor: pointer;
        background: transparent; color: var(--dl-text-sec);
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
        letter-spacing: .16em; text-transform: uppercase; transition: all .3s;
      }
      .dl-kpi-action-btn-ghost:hover { border-color: var(--dl-accent); color: var(--dl-accent); background: var(--dl-ghost-hover-bg); }

      .dl-section-hd {
        display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
      }
      .dl-section-title {
        font-family: 'Inter', sans-serif;
        font-size: 16px; font-weight: 700; color: var(--dl-text); letter-spacing: -.01em;
      }
      .dl-section-title::before {
        content: ''; width: 3px; height: 15px; border-radius: 99px;
        background: linear-gradient(180deg, ${AURA.gold}, ${AURA.goldLight});
        display: inline-block; margin-right: 10px; vertical-align: -2px;
      }

      .dl-menu-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px; margin-bottom: 30px;
      }
      @media(max-width: 480px) { .dl-menu-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

      .dl-menu-card {
        background: var(--dl-card-bg); border: 1px solid var(--dl-card-border);
        border-radius: 20px; padding: 20px 10px 16px;
        cursor: pointer; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 10px;
        transition: all .35s cubic-bezier(.4,0,.2,1);
        text-align: center; position: relative;
        backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        box-shadow: var(--dl-card-shadow-sm);
      }
      .dl-menu-card::before {
        content: ''; position: absolute; top: 0; left: 18%; right: 18%; height: 2px;
        border-radius: 0 0 99px 99px;
        background: linear-gradient(90deg, transparent, rgba(253,184,19,.4), transparent);
        opacity: 0; transition: all .35s;
      }
      .dl-menu-card:hover {
        transform: translateY(-5px);
        border-color: var(--dl-card-hover);
        box-shadow: var(--dl-modal-shadow);
      }
      .dl-menu-card:hover::before { opacity: 1; left: 12%; right: 12%; }
      .dl-menu-icon {
        width: 52px; height: 52px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center; margin: 0 auto;
        transition: transform .35s;
      }
      .dl-menu-card:hover .dl-menu-icon { transform: scale(1.06); }
      .dl-menu-name {
        font-size: 11px; font-weight: 600; letter-spacing: .04em;
        color: var(--dl-text); margin: 0;
        word-break: break-word;
      }
      .dl-menu-desc {
        font-size: 8.5px; letter-spacing: .1em;
        text-transform: uppercase; color: var(--dl-text-muted); margin: 3px 0 0;
      }

      .dl-card {
        background: var(--dl-card-bg); border: 1px solid var(--dl-card-border);
        border-radius: 24px; overflow: hidden; margin-bottom: 24px;
        backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); position: relative;
        box-shadow: var(--dl-card-shadow-lg);
      }
      .dl-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(253,184,19,.28), transparent);
      }
      .dl-card-head {
        padding: 22px 24px;
        border-bottom: 1px solid var(--dl-card-border);
        display: flex; align-items: center; justify-content: space-between;
        flex-wrap: wrap; gap: 12px;
      }
      .dl-card-head-title {
        font-family: 'Inter', sans-serif;
        font-size: 18px; font-weight: 700; color: var(--dl-text); margin: 0; letter-spacing: -.01em;
      }
      .dl-card-head-sub {
        font-size: 11.5px; font-weight: 400; color: var(--dl-text-muted); margin: 3px 0 0; letter-spacing: .04em;
      }

      .dl-btn-gold {
        display: flex; align-items: center; gap: 8px;
        padding: 11px 22px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight});
        color: #12131C; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; transition: all .35s;
        box-shadow: none; flex-shrink: 0;
      }
      .dl-btn-gold:hover { transform: translateY(-2px); filter: brightness(1.05); }
      .dl-btn-ghost {
        display: flex; align-items: center; gap: 7px;
        padding: 11px 18px; border-radius: 100px;
        border: 1px solid var(--dl-border); cursor: pointer;
        background: transparent; color: var(--dl-text-sec);
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
        letter-spacing: .14em; text-transform: uppercase; transition: all .3s;
      }
      .dl-btn-ghost:hover { border-color: var(--dl-accent); color: var(--dl-accent); background: var(--dl-ghost-hover-bg); }

      .dl-members-list {
        padding: 16px 24px 22px;
        display: flex; flex-direction: column; gap: 8px;
      }
      .dl-member-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 11px 14px;
        background: var(--dl-surface-2);
        border: 1px solid var(--dl-surface-2-border);
        border-radius: 14px; transition: all .2s; gap: 10px;
        min-width: 0; width: 100%;
      }
      .dl-member-row:hover { border-color: rgba(253,184,19,.4); background: var(--dl-row-hover-bg); }
      .dl-member-avatar {
        width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
        background: linear-gradient(135deg, rgba(253,184,19,.35), rgba(53,3,9,.12));
        border: 1px solid rgba(53,3,9,.28);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Inter', sans-serif; font-weight: 700;
        font-size: 15px; color: ${AURA.moss};
      }
      .dl-member-name {
        font-size: 13.5px; font-weight: 400; color: var(--dl-text);
        flex: 1; min-width: 0; overflow: hidden;
        text-overflow: ellipsis; white-space: nowrap;
      }
      .dl-btn-del {
        background: none; border: none; cursor: pointer;
        color: var(--dl-text-muted); padding: 6px; border-radius: 9px;
        display: flex; align-items: center; flex-shrink: 0; transition: all .2s;
      }
      .dl-btn-del:hover { color: ${AURA.clay}; background: rgba(255,211,77,.1); }
      .dl-divider-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(253,184,19,.16), transparent);
        margin: 2px 0;
      }

      .dl-search-wrap { position: relative; margin-bottom: 14px; }
      .dl-search-icon {
        position: absolute; left: 14px; top: 50%;
        transform: translateY(-50%); color: var(--dl-input-icon);
        opacity: .9;
        pointer-events: none;
      }
      .dl-input {
        width: 100%; box-sizing: border-box;
        background: var(--dl-bg-input); border: 1px solid var(--dl-border-input);
        color: var(--dl-text); padding: 13px 16px 13px 44px;
        border-radius: 14px; outline: none;
        font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 400;
        transition: all .25s; -webkit-appearance: none; appearance: none;
      }
      .dl-input:focus {
        border-color: rgba(53,3,9,.55);
        background: var(--dl-chip-bg);
        box-shadow: 0 0 0 4px rgba(53,3,9,.14);
      }
      .dl-input { font-family: 'Inter', sans-serif; }
      .dl-input::placeholder { color: var(--dl-placeholder); }

      .dl-modal-backdrop {
        position: fixed; inset: 0; z-index: 999;
        display: flex; align-items: flex-end; justify-content: center;
      }
      @media(min-width: 520px) {
        .dl-modal-backdrop { align-items: center; padding: 16px; }
      }
      .dl-modal-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,.72); z-index: 0;
        backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
      }
      .dl-modal-box {
        position: relative; z-index: 10;
        width: 100%; max-height: 88vh;
        display: flex; flex-direction: column;
        background: var(--dl-bg-el); border: 1px solid var(--dl-border);
        border-radius: 24px 24px 0 0; overflow: hidden;
        box-shadow: 0 30px 80px rgba(0,0,0,.4);
      }
      @media(min-width: 520px) {
        .dl-modal-box {
          border-radius: 24px; max-width: 480px;
          max-height: calc(100vh - 32px);
        }
      }
      .dl-modal-multi-box {
        position: relative; z-index: 10;
        width: 100%; max-height: 88vh;
        display: flex; flex-direction: column;
        background: var(--dl-bg-el); border: 1px solid var(--dl-border);
        border-radius: 24px 24px 0 0;
        padding: 32px 26px; overflow-y: auto;
      }
      @media(min-width: 520px) {
        .dl-modal-multi-box {
          border-radius: 24px; max-width: 440px;
          max-height: calc(100vh - 32px);
        }
      }

      .dl-textarea {
        width: 100%; box-sizing: border-box; resize: vertical;
        background: var(--dl-bg-input); border: 1px solid var(--dl-border-input);
        color: var(--dl-text); padding: 14px 16px;
        border-radius: 14px; outline: none; min-height: 110px;
        font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 400;
        transition: all .25s;
      }
      .dl-textarea:focus {
        border-color: rgba(53,3,9,.55);
        box-shadow: 0 0 0 4px rgba(53,3,9,.14);
      }
      .dl-textarea::placeholder { color: var(--dl-placeholder); }

      .dl-footer {
        text-align: center;
        font-size: 9px; font-weight: 500; letter-spacing: .22em;
        text-transform: uppercase;
        color: var(--dl-empty-color);
        padding: 18px 0 0;
      }

      .dl-loading {
        min-height: 100vh; display: flex;
        align-items: center; justify-content: center;
        background: var(--dl-bg);
        position: relative;
      }
      .dl-loading-inner { text-align: center; position: relative; z-index: 10; }
    `}</style>
  );
});

/* ─── Componente Principal ─────────────────────────────────────────────── */
export default function DashboardLider() {
  const [abaAtiva,               setAbaAtiva]               = useState("home");
  const [celula,                 setCelula]                  = useState(null);
  const [membros,                setMembros]                 = useState([]);
  const [usuarioLogado,          setUsuarioLogado]           = useState(null);
  const [loading,                setLoading]                 = useState(true);
  const [showModalAddMembro,     setShowModalAddMembro]      = useState(false);
  const [showModalMultiplicacao, setShowModalMultiplicacao]  = useState(false);
  const [showAcompanhamento,     setShowAcompanhamento]      = useState(false);
  const [motivoMultiplicacao,    setMotivoMultiplicacao]     = useState("");
  const [solicitandoMulti,       setSolicitandoMulti]        = useState(false);
  const [isDark,                 setIsDark]                  = useState(
      () => localStorage.getItem("theme") === "dark"
  );
  const [showBoasVindas,         setShowBoasVindas]          = useState(false);

  const themeVars = useMemo(() => {
    const dark = isDark;
    return {
      "--dl-bg": dark ? "#0A0A0F" : "#FFFFFF",
      "--dl-bg-el": dark ? "#17171C" : "#FFFFFF",
      "--dl-bg-input": dark ? "#101014" : "rgba(0,0,0,.04)",
      "--dl-border": dark ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.22)",
      "--dl-border-input": dark ? "rgba(255,255,255,.22)" : "rgba(0,0,0,.32)",
      "--dl-text": dark ? "#FFFFFF" : "#2A0306",
      "--dl-text-sec": dark ? "#E7E7EC" : "#4A2E2A",
      "--dl-text-muted": dark ? "#A1A1AA" : "#5F4A45",
      "--dl-card-bg": dark ? "#17171C" : "#FFFFFF",
      "--dl-card-border": dark ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.20)",
      "--dl-card-hover": dark ? "#FFD400" : "#E30613",
      "--dl-placeholder": dark ? "rgba(255,255,255,.45)" : "rgba(0,0,0,.45)",
      "--dl-header-bg": dark ? "rgba(10,10,15,.88)" : "rgba(255,255,255,.95)",
      "--dl-glow-1": dark ? "rgba(227,6,19,.14)" : "rgba(227,6,19,.08)",
      "--dl-glow-2": dark ? "rgba(255,212,0,.08)" : "rgba(0,0,0,.05)",
      "--dl-option-bg": dark ? "#17171C" : "#FFFFFF",
      "--dl-photo": "none",
      "--dl-photo-filter": "none",
      "--dl-shadow-color": dark ? "rgba(0,0,0,.55)" : "rgba(61,0,4,.12)",
      "--dl-avatar-bg": dark ? "#B5000F" : "#8F0009",
      "--dl-avatar-shadow": dark ? "0 0 0 6px rgba(227,6,19,.18)" : "0 0 0 6px rgba(227,6,19,.10)",
      "--dl-surface-1": dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
      "--dl-hover-gold-bg": dark ? "rgba(255,212,0,.16)" : "rgba(255,212,0,.20)",
      "--dl-soft-gold-bg": dark ? "rgba(255,212,0,.12)" : "rgba(255,212,0,.20)",
      "--dl-soft-gold-border": dark ? "rgba(255,212,0,.35)" : "rgba(227,6,19,.20)",
      "--dl-inset-highlight": "none",
      "--dl-alert-bg": dark ? "rgba(30,122,70,.22)" : "rgba(30,122,70,.10)",
      "--dl-alert-color": dark ? "#FFFFFF" : "#2A0306",
      "--dl-alert-border": dark ? "1px solid rgba(255,255,255,.20)" : "1px solid rgba(0,0,0,.12)",
      "--dl-card-shadow": `10px 10px 0 ${dark ? "rgba(0,0,0,.55)" : "rgba(61,0,4,.10)"}`,
      "--dl-card-shadow-lg": `10px 10px 0 ${dark ? "rgba(0,0,0,.55)" : "rgba(61,0,4,.10)"}`,
      "--dl-card-shadow-sm": `8px 8px 0 ${dark ? "rgba(0,0,0,.55)" : "rgba(61,0,4,.10)"}`,
      "--dl-modal-shadow": `12px 12px 0 ${dark ? "rgba(0,0,0,.55)" : "rgba(61,0,4,.10)"}`,
      "--dl-bg-overlay": dark
        ? "linear-gradient(180deg, rgba(10,10,15,.88) 0%, rgba(10,10,15,.94) 50%, rgba(10,10,15,.98) 100%)"
        : "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 100%)",
      "--dl-ghost-hover-bg": dark ? "rgba(255,212,0,.12)" : "rgba(255,212,0,.16)",
      "--dl-surface-2": dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.03)",
      "--dl-surface-2-border": dark ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.18)",
      "--dl-divider": dark ? "rgba(255,255,255,.24)" : "rgba(0,0,0,.32)",
      "--dl-row-hover-bg": dark ? "rgba(255,212,0,.08)" : "rgba(255,212,0,.14)",
      "--dl-input-icon": dark ? "#FFD400" : "#E30613",
      "--dl-chip-bg": dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.05)",
      "--dl-empty-color": dark ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.40)",
      "--dl-panel": dark ? "#17171C" : "#FFFFFF",
      "--dl-panel-2": dark ? "#101014" : "rgba(0,0,0,.035)",
      "--dl-accent": dark ? "#FFD400" : "#E30613",
      "--dl-accent-soft": dark ? "rgba(255,212,0,.14)" : "rgba(227,6,19,.07)",
      "--dl-title-shadow": dark ? "rgba(143,0,9,.55)" : "rgba(227,6,19,.15)",
      "--dl-tint-opacity": dark ? "0.02" : "0",
    };
  }, [isDark]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(themeVars)) root.style.setProperty(k, v);
  }, [themeVars]);

  useEffect(() => {
    const id = setTimeout(() => {
      import("./TelaMetasLider");
      import("./TelaRelatorio");
      import("./RelatorioDiscipulado");
      import("./TelaVisitantes");
      import("./TelaFichas");
      import("./Missao70Lider");
      import("./SolicitarFichaMembro");
      import("./AcompanhamentoDiscipulado");
    }, 1500);
    return () => clearTimeout(id);
  }, []);

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
          <GlobalStyles />
          <TelaCarregando isDark={isDark} minHeight="100vh" background="transparent" />
        </div>
    );
  }

  /* ── 7 módulos (Histórico removido) ── */
  const menuItems = [
    { icon: <Target size={18} />,       name: "Metas",        desc: "Objetivos",   aba: "metas",       color: "#FFD400" },
    { icon: <Users size={18} />,        name: "Discipulado",  desc: "Acompanhar",  aba: "discipulado", color: "#C2187A" },
    { icon: <TrendingUp size={18} />,   name: "Frequência",   desc: "Relatórios",  aba: "relatorio",   color: "#1E4FD8" },
    { icon: <CalendarDays size={18} />, name: "Fichas",       desc: "Secretaria",  aba: "fichas",      color: "#FF7A00" },
    { icon: <ChevronRight size={18} />, name: "Visitantes",   desc: "Novas Vidas", aba: "visitantes",  color: "#E30613" },
    { icon: <Flame size={18} />,        name: "Missão 70",    desc: "Evangelismo", aba: "missao70",    color: "#FF7A00" },
    { icon: <ClipboardList size={18} />, name: "Solic. Ficha", desc: "Novo Membro", aba: "solicitar-ficha", color: "#1E4FD8" },
    { icon: <UserCheck size={18} />,    name: "Acompanhamento", desc: "Membro",       aba: "acompanhamento-modal", color: "#C2187A" },
  ];

  return (
      <div className={`dl-root ieq-lider ieq-app${isDark ? " ieq-dark" : ""}`}>
        <GlobalStyles />

        <div className="dl-flag" aria-hidden="true">
          <i /><i /><i /><i />
        </div>
        <div className="dl-deco" aria-hidden="true">
          <span className="dl-deco-cross" />
          <span className="dl-deco-squares"><i /><i /><i /><i /></span>
        </div>

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
                      : <CrossMark size={30} />
                  }
                </div>
              </div>
              <div className="dl-title-block">
                <p className="dl-eyebrow">Painel do Líder</p>
                <p className="dl-title">{usuarioLogado?.nome || "Líder"}</p>
                <p className="dl-subtitle">{celula?.nome || "Célula"} · Acompanhamento semanal</p>
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

          {/* ── Badge da Célula ── */}
          <div className="dl-badge-center">
            <span className="dl-badge">
              <span className="dl-badge-dot dl-blink" />
              <strong style={{ color: "var(--dl-text)", fontWeight: 800 }}>
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
                          <Sparkles size={16} style={{ color: "var(--dl-accent)", opacity: .95, flexShrink: 0 }} />
                          Multiplicação aprovada! Organize os membros para a nova célula.
                        </motion.div>
                    )}
                  </AnimatePresence>

                  {/* KPI Grid */}
                  <div className="dl-kpi-grid">
                    <div className="dl-kpi-hero">
                      <div className="dl-kpi-stripes" />
                      <div className="dl-kpi-inner">
                        <span className="dl-badge" style={{ fontSize: 9, padding: "4px 12px" }}>
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
                      <div className="dl-kpi-cartaz">
                        <img
                            src={cartazImg}
                            alt="Jesus Salva — cartaz da Igreja do Evangelho Quadrangular"
                        />
                      </div>
                      <div>
                        {isAnalise ? (
                            <div style={{ marginTop: 18, width: "100%", padding: "12px", textAlign: "center", borderRadius: 0, background: "rgba(255,212,0,.12)", border: "2px solid rgba(255,212,0,.4)", fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--dl-accent)" }}>
                              Consultando Pastor…
                            </div>
                        ) : podeSolicitar ? (
                            <button
                                className="dl-kpi-action-btn"
                                onClick={() => setShowModalMultiplicacao(true)}
                            >
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
                    {menuItems.map(({ icon, name, desc, aba, color }) => (
                        <motion.div
                            key={aba}
                            className="dl-menu-card"
                            style={{ "--accent": color }}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: .96 }}
                            onClick={() => (aba === "acompanhamento-modal" ? setShowAcompanhamento(true) : setAbaAtiva(aba))}
                        >
                          <div className="dl-menu-icon" style={{ background: color, color: (color === "#FFD400" || color === "#FF7A00") ? "#2A0306" : "#fff", border: `2px solid ${color}` }}>
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
                          <p style={{ textAlign: "center", padding: "16px 0", fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, fontStyle: "italic", color: "var(--dl-text-muted)" }}>
                            Nenhum membro vinculado.
                          </p>
                      )}
                    </div>
                  </div>

                  <div className="dl-divider" style={{ margin: "6px auto 18px" }}><div className="dl-divider-dot" /></div>
                  <p className="dl-footer">© {new Date().getFullYear()} IEQ Pituaçu · Sistema Eclesiástico</p>
                </motion.div>

            ) : (

                <motion.div
                    key={abaAtiva}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: .3 } }}
                    exit={{ opacity: 0, transition: { duration: .2 } }}
                >
                  <React.Suspense fallback={<div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}><Loader2 size={22} className="dl-spin" style={{ color: "var(--dl-text-muted)" }} /></div>}>
                    {abaAtiva === "metas"       && <TelaMetasLider      celula={celula}       isDark={isDark} />}
                    {abaAtiva === "relatorio"   && <TelaRelatorio        isDark={isDark} />}
                    {abaAtiva === "discipulado" && <RelatorioDiscipulado membros={membros}     isDark={isDark} />}
                    {abaAtiva === "visitantes"  && <TelaVisitantes       celulaId={celula?.id} isDark={isDark} />}
                    {abaAtiva === "fichas"      && <TelaFichas           celula={celula}       isDark={isDark} />}
                    {abaAtiva === "missao70"    && <Missao70Lider        celulaId={celula?.id} isDark={isDark} />}
                    {abaAtiva === "solicitar-ficha" && <SolicitarFichaMembro isDark={isDark} />}
                  </React.Suspense>
                </motion.div>

            )}
          </AnimatePresence>
        </div>

        {/* ── Modal: Adicionar Membro ── */}
        <AnimatePresence>
          {showModalAddMembro && createPortal(
              <div className="dl-modal-backdrop ieq-lider-modal">
                <motion.div className="dl-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModalAddMembro(false)} />
                <motion.div className="dl-modal-box" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "tween", duration: .28 }}>
                  <ModalBuscarMembro celulaId={celula?.id} onClose={() => { setShowModalAddMembro(false); carregarDados(); }} />
                </motion.div>
              </div>,
              document.body
          )}

          {/* ── Modal: Multiplicação ── */}
          {showModalMultiplicacao && createPortal(
              <div className="dl-modal-backdrop ieq-lider-modal">
                <motion.div className="dl-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                <motion.div className="dl-modal-multi-box" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "tween", duration: .28 }}>
                  <div style={{ textAlign: "center", marginBottom: 26 }}>
                    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                      <div className="dl-ring dl-pulse" style={{ width: 68, height: 68, position: "absolute", border: "1px solid var(--dl-accent)", borderRadius: 0, opacity: .35 }} />
                      <div className="dl-ring dl-pulse" style={{ width: 54, height: 54, position: "absolute", border: "1px solid var(--dl-accent)", borderRadius: 0, animationDelay: ".9s", opacity: .28 }} />
                      <div style={{ width: 50, height: 50, borderRadius: 0, background: "#8F0009", border: "2px solid #FFD400", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, boxShadow: "4px 4px 0 var(--dl-shadow-color)" }}>
                        <CrossMark size={28} />
                      </div>
                    </div>
                    <h2 style={{ fontFamily: "'Anton','Inter',sans-serif", fontSize: 24, fontWeight: 400, color: "var(--dl-text)", margin: "0 0 8px", letterSpacing: ".04em", textTransform: "uppercase" }}>
                      Plano de Multiplicação
                    </h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, color: "var(--dl-text-sec)" }}>
                      Informe o novo líder e o local da nova célula.
                    </p>
                  </div>
                  <div className="dl-divider-line" style={{ margin: "0 0 20px" }} />
                  <textarea className="dl-textarea" placeholder="Ex: Novo líder será o João, anfitriã Maria Silva…" value={motivoMultiplicacao} onChange={(e) => setMotivoMultiplicacao(e.target.value)} />
                  <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                    <button className="dl-btn-ghost" style={{ flex: 1 }} onClick={() => setShowModalMultiplicacao(false)}>Cancelar</button>
                    <button
                        style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", border: "2px solid #FFD400", borderRadius: 0, cursor: "pointer", background: "#FFD400", color: "#2A0306", fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", transition: "all .25s", boxShadow: "5px 5px 0 var(--dl-shadow-color)", opacity: solicitandoMulti ? .6 : 1 }}
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

        {/* ── Modal único: Acompanhamento de Discipulado ── */}
        <React.Suspense fallback={null}>
          <AcompanhamentoDiscipulado
              isDark={isDark}
              open={showAcompanhamento}
              onClose={() => setShowAcompanhamento(false)}
          />
        </React.Suspense>
      </div>
  );
}

/* ─── Modal Buscar Membro ─────────────────────────────────────────────── */
function ModalBuscarMembro({ celulaId, onClose }) {
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
      <div style={{ padding: "26px 20px 22px", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--dl-accent)", margin: "0 0 5px" }}>Vincular</p>
            <h2 style={{ fontFamily: "'Anton','Inter',sans-serif", fontSize: 22, fontWeight: 400, color: "var(--dl-text)", margin: 0, letterSpacing: ".04em", textTransform: "uppercase" }}>Selecionar Membro</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "2px solid var(--dl-border)", borderRadius: 0, cursor: "pointer", color: "var(--dl-text)", padding: 6, display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ position: "relative", marginBottom: 14, flexShrink: 0 }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--dl-accent)", opacity: .9, pointerEvents: "none" }} />
          <input
              style={{ width: "100%", boxSizing: "border-box", background: "var(--dl-bg-input)", border: "2px solid var(--dl-border-input)", color: "var(--dl-text)", padding: "13px 16px 13px 44px", borderRadius: 0, outline: "none", fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 500, transition: "all .25s" }}
              placeholder="Buscar por nome…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
          {loading ? (
              <div style={{ textAlign: "center", paddingTop: 32 }}>
                <Loader2 size={26} className="dl-spin" style={{ color: "var(--dl-accent)", display: "inline-block" }} />
              </div>
          ) : filtrados.length > 0 ? (
              filtrados.map((m) => (
                  <div
                      key={m.id}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", gap: 10, background: "var(--dl-panel-2)", border: "2px solid var(--dl-card-border)", borderRadius: 0, flexShrink: 0, transition: "border-color .2s, background .2s", cursor: "default" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--dl-accent)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--dl-card-border)"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 0, flexShrink: 0, background: "#FFD400", border: "2px solid var(--dl-border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Anton','Inter',sans-serif", fontWeight: 400, fontSize: 15, color: "#2A0306", boxShadow: "3px 3px 0 var(--dl-shadow-color)" }}>
                        {m.nome?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 500, color: "var(--dl-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.nome}
                      </span>
                    </div>
                    <button
                        onClick={() => vincular(m.id)}
                        style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 0, border: "2px solid #FFD400", cursor: "pointer", background: "#FFD400", color: "#2A0306", fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", transition: "all .2s", boxShadow: "3px 3px 0 var(--dl-shadow-color)" }}
                    >
                      <Plus size={11} /> Vincular
                    </button>
                  </div>
              ))
          ) : (
              <p style={{ textAlign: "center", paddingTop: 28, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 400, fontStyle: "italic", color: "var(--dl-text-muted)" }}>
                Nenhum membro encontrado.
              </p>
          )}
        </div>
      </div>
  );
}
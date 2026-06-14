import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import api from "../../services/api.js";
import {
  Calendar, BookOpen, Loader2, ChevronDown,
  UserCheck, ClipboardCheck, Trophy, Users2, CheckCircle2,
  Edit3, ArrowLeft, AlertTriangle, History, Lock,
  XCircle, Briefcase, Plane, HeartPulse, HelpCircle,
} from "lucide-react";

/* ─── Tokens AURA ──────────────────────────────────────────────────── */
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
    placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
    optionBg:    isDark ? "#12121A"                : "#F0EAE0",
    cardHover:   isDark ? "rgba(201,169,110,.2)"   : "rgba(201,169,110,.35)",
  };
}

const JUSTIFICATIVAS = [
  { value: "TRABALHO", label: "Trabalho",  icon: <Briefcase  size={13} />, cor: "#6366F1", bg: "rgba(99,102,241,.08)",  borda: "rgba(99,102,241,.25)"  },
  { value: "VIAGEM",   label: "Viagem",    icon: <Plane      size={13} />, cor: "#0891B2", bg: "rgba(8,145,178,.08)",   borda: "rgba(8,145,178,.25)"   },
  { value: "DOENCA",   label: "Doença",    icon: <HeartPulse size={13} />, cor: "#DC2626", bg: "rgba(220,38,38,.08)",   borda: "rgba(220,38,38,.25)"   },
  { value: "OUTROS",   label: "Outros",    icon: <HelpCircle size={13} />, cor: "#D97706", bg: "rgba(217,119,6,.08)",   borda: "rgba(217,119,6,.25)"   },
];

const DECISAO_CONFIG = {
  ACEITOU_JESUS: { label: "Aceitou Jesus",  cor: AURA.blue,  bg: "rgba(0,61,165,.08)",  borda: "rgba(0,61,165,.25)",  icone: "✝️" },
  RECONCILIOU:   { label: "Reconciliou",    cor: "#854F0B",  bg: "rgba(253,184,19,.1)", borda: "rgba(253,184,19,.3)", icone: "🙏" },
  BATISMO_AGUAS: { label: "Deseja Batismo", cor: "#0F6E56",  bg: "rgba(29,158,117,.08)",borda: "rgba(29,158,117,.3)", icone: "💧" },
};

const draftKey = (celulaId) => `ieq_relatorio_draft_${celulaId}`;

const BIBLIA = [
  { nome: "Gênesis", cap: 50 }, { nome: "Êxodo", cap: 40 }, { nome: "Levítico", cap: 27 },
  { nome: "Números", cap: 36 }, { nome: "Deuteronômio", cap: 34 }, { nome: "Josué", cap: 24 },
  { nome: "Juízes", cap: 21 }, { nome: "Rute", cap: 4 }, { nome: "1 Samuel", cap: 31 },
  { nome: "2 Samuel", cap: 24 }, { nome: "1 Reis", cap: 22 }, { nome: "2 Reis", cap: 25 },
  { nome: "1 Crônicas", cap: 29 }, { nome: "2 Crônicas", cap: 36 }, { nome: "Esdras", cap: 10 },
  { nome: "Neemias", cap: 13 }, { nome: "Ester", cap: 10 }, { nome: "Jó", cap: 42 },
  { nome: "Salmos", cap: 150 }, { nome: "Provérbios", cap: 31 }, { nome: "Eclesiastes", cap: 12 },
  { nome: "Cânticos", cap: 8 }, { nome: "Isaías", cap: 66 }, { nome: "Jeremias", cap: 52 },
  { nome: "Lamentações", cap: 5 }, { nome: "Ezequiel", cap: 48 }, { nome: "Daniel", cap: 12 },
  { nome: "Oséias", cap: 14 }, { nome: "Joel", cap: 3 }, { nome: "Amós", cap: 9 },
  { nome: "Obadias", cap: 1 }, { nome: "Jonas", cap: 4 }, { nome: "Miqueias", cap: 7 },
  { nome: "Naum", cap: 3 }, { nome: "Habacuque", cap: 3 }, { nome: "Sofonias", cap: 3 },
  { nome: "Ageu", cap: 2 }, { nome: "Zacarias", cap: 14 }, { nome: "Malaquias", cap: 4 },
  { nome: "Mateus", cap: 28 }, { nome: "Marcos", cap: 16 }, { nome: "Lucas", cap: 24 },
  { nome: "João", cap: 21 }, { nome: "Atos", cap: 28 }, { nome: "Romanos", cap: 16 },
  { nome: "1 Coríntios", cap: 16 }, { nome: "2 Coríntios", cap: 13 }, { nome: "Gálatas", cap: 6 },
  { nome: "Efésios", cap: 6 }, { nome: "Filipenses", cap: 4 }, { nome: "Colossenses", cap: 4 },
  { nome: "1 Tessalonicenses", cap: 5 }, { nome: "2 Tessalonicenses", cap: 3 },
  { nome: "1 Timóteo", cap: 6 }, { nome: "2 Timóteo", cap: 4 }, { nome: "Tito", cap: 3 },
  { nome: "Filemom", cap: 1 }, { nome: "Hebreus", cap: 13 }, { nome: "Tiago", cap: 5 },
  { nome: "1 Pedro", cap: 5 }, { nome: "2 Pedro", cap: 3 }, { nome: "1 João", cap: 5 },
  { nome: "2 João", cap: 1 }, { nome: "3 João", cap: 1 }, { nome: "Judas", cap: 1 },
  { nome: "Apocalipse", cap: 22 },
];

const TEMAS_FIXOS = [
  "A adoração verdadeira","Alegria do Senhor","Amizade com Deus","Fé em meio às provas",
  "Esperança em tempos difíceis","Família segundo o coração de Deus","Deus é fiel",
  "Cristo, nossa esperança","O amor de Cristo","Paz que excede todo entendimento",
  "Vida guiada pelo Espírito Santo","Chamados para servir","O Deus do impossível",
  "Vitória pelo sangue do Cordeiro","Voltando ao primeiro amor",
];

const normalizarData = (d) => d ? String(d).substring(0, 10) : "";

function dispararAtualizacaoMetas(celulaId) {
  window.dispatchEvent(new CustomEvent("ieq:metas:recalculadas", { detail: { celulaId: Number(celulaId) } }));
}

function AuraStyles({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes aura-spin    { to { transform: rotate(360deg); } }
      @keyframes aura-pulse   { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes aura-blink   { 0%,100%{opacity:1;} 50%{opacity:.3;} }
      @keyframes aura-fadein  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      @keyframes aura-toast-in  { from{opacity:0;transform:scale(.88) translateY(28px)} to{opacity:1;transform:scale(1) translateY(0)} }
      @keyframes aura-toast-out { from{opacity:1;transform:scale(1)} to{opacity:0;transform:scale(.92) translateY(-18px)} }
      @keyframes aura-just-in  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

      .aura-spin   { animation: aura-spin  1s linear infinite; }
      .aura-pulse  { animation: aura-pulse 3s ease-in-out infinite; }
      .aura-blink  { animation: aura-blink 2s ease-in-out infinite; }

      .aura-root { font-family: 'Inter', sans-serif; color: ${t.text}; min-height: 100vh; position: relative; padding-bottom: 120px; }
      .aura-glow { position: fixed; inset: 0; pointer-events: none; z-index: 0; background: radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%), radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%); transition: background .3s; }
      .aura-content { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; padding: 0 18px; }
      @media(max-width:420px) { .aura-content { padding: 0 14px; } }

      .aura-divider { display: flex; align-items: center; gap: 10px; margin: 18px 0 22px; }
      .aura-divider::before { content:''; flex:1; height:1px; background: linear-gradient(to right, transparent, ${AURA.gold}); }
      .aura-divider::after  { content:''; flex:1; height:1px; background: linear-gradient(to left, transparent, ${AURA.gold}); }
      .aura-divider-dot { width:5px; height:5px; border-radius:50%; background:${AURA.gold}; }

      .aura-badge { display: inline-flex; align-items: center; gap: 7px; background: rgba(201,169,110,.07); border: 1px solid rgba(201,169,110,.2); border-radius: 100px; padding: 5px 14px; font-size: 10px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: ${AURA.gold}; }
      .aura-badge-dot { width:5px; height:5px; border-radius:50%; background:${AURA.gold}; }

      .aura-tabs { display: flex; border-radius: 16px; overflow: hidden; border: 1px solid ${t.border}; margin: 16px 0 24px; backdrop-filter: blur(20px); }
      .aura-tab { flex: 1; padding: 13px 16px; border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all .25s; }
      .aura-tab.active   { background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue}); color: #fff; }
      .aura-tab.inactive { background: ${t.bgEl}; color: ${t.textMuted}; }
      .aura-tab.inactive:hover { color: ${AURA.gold}; }

      .aura-card { background: ${t.bgEl}; border: 1px solid ${t.border}; border-radius: 20px; overflow: hidden; backdrop-filter: blur(24px); position: relative; margin-bottom: 16px; }
      .aura-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent); }
      .aura-card-head { padding: 20px 24px; border-bottom: 1px solid ${t.border}; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
      .aura-card-head-title { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 500; color: ${t.text}; margin: 0; }
      .aura-card-head-sub   { font-size: 11px; font-weight: 300; color: ${t.textMuted}; margin: 3px 0 0; }

      .aura-hero { border-radius: 20px; padding: 32px 32px 28px; margin-bottom: 20px; position: relative; overflow: hidden; }
      .aura-hero-stripes { position: absolute; inset: 0; pointer-events: none; background-image: repeating-linear-gradient(-55deg, rgba(255,255,255,.025) 0 8px, transparent 8px 16px); }
      .aura-hero-inner { position: relative; z-index: 1; }

      .aura-kpi-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
      @media(max-width:480px) { .aura-kpi-grid { grid-template-columns: 1fr; } }
      .aura-kpi { background: ${t.bgEl}; border: 1px solid ${t.border}; border-radius: 16px; padding: 20px 16px; text-align: center; backdrop-filter: blur(20px); }
      .aura-kpi-label { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: ${t.textMuted}; margin: 0 0 8px; }
      .aura-kpi-num   { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 600; line-height: 1; margin: 0; }

      .aura-label { display: block; margin-bottom: 7px; font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: ${AURA.gold}; }
      .aura-input { width: 100%; box-sizing: border-box; background: ${t.bgInput}; border: 1px solid ${t.borderInput}; color: ${t.text}; padding: 13px 16px; border-radius: 13px; outline: none; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300; transition: all .25s; -webkit-appearance: none; appearance: none; }
      .aura-input:focus { border-color: rgba(201,169,110,.5); background: rgba(201,169,110,.04); box-shadow: 0 0 0 3px rgba(201,169,110,.08); }
      .aura-input::placeholder { color: ${t.placeholder}; }

      .aura-person-row { border-bottom: 1px solid ${t.border}; transition: background .2s; }
      .aura-person-row:last-child { border-bottom: none; }

      .aura-just-panel { animation: aura-just-in .25s ease forwards; padding: 14px 22px 18px 22px; border-top: 1px solid ${t.border}; }
      .aura-just-label { font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: ${t.textMuted}; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
      .aura-just-options { display: flex; flex-wrap: wrap; gap: 8px; }
      .aura-just-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 100px; border: 1px solid; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; transition: all .2s; background: transparent; }

      .aura-alert-warn { display: flex; align-items: center; gap: 12px; background: rgba(253,184,19,.06); border: 1px solid rgba(253,184,19,.22); border-radius: 14px; padding: 14px 18px; margin-bottom: 16px; font-size: 11px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: #c8a010; }
      .aura-alert-success { display: flex; align-items: center; gap: 12px; background: rgba(13,110,58,.08); border: 1px solid rgba(13,110,58,.25); border-radius: 14px; padding: 14px 18px; margin-bottom: 16px; font-size: 11px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: #0d6e3a; animation: aura-fadein .4s ease; }
      .aura-alert-info { display: flex; align-items: center; gap: 12px; background: rgba(0,61,165,.06); border: 1px solid rgba(0,61,165,.2); border-radius: 14px; padding: 12px 18px; margin-bottom: 16px; font-size: 11px; font-weight: 500; letter-spacing: .08em; color: ${AURA.blue}; }

      .aura-toast-overlay { position: fixed; inset: 0; z-index: 400; display: flex; align-items: center; justify-content: center; padding: 0 20px; background: rgba(10,10,15,.75); backdrop-filter: blur(6px); animation: aura-fadein .3s ease forwards; }
      .aura-toast-box { background: linear-gradient(160deg, #0d6e3a 0%, #073d22 100%); border: 1px solid rgba(201,169,110,.15); border-radius: 24px; padding: 36px 44px 32px; display: flex; flex-direction: column; align-items: center; gap: 20px; min-width: 300px; max-width: 380px; width: 100%; box-shadow: 0 24px 80px rgba(13,110,58,.5); animation: aura-toast-in .55s cubic-bezier(.34,1.56,.64,1) forwards; }
      .aura-toast-icon { width: 72px; height: 72px; border-radius: 50%; background: rgba(255,255,255,.15); border: 1.5px solid rgba(255,255,255,.3); display: flex; align-items: center; justify-content: center; }

      .aura-modal-overlay { position: fixed; inset: 0; z-index: 300; background: rgba(10,10,15,.82); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; padding: 0 20px; }
      .aura-modal-box { background: ${t.bgEl}; border: 1px solid ${t.border}; border-radius: 22px; padding: 32px 28px 26px; max-width: 420px; width: 100%; animation: aura-fadein .3s cubic-bezier(.34,1.56,.64,1); box-shadow: 0 24px 80px rgba(0,0,0,.5); }

      .aura-btn-primary { display: flex; align-items: center; justify-content: center; gap: 9px; width: 100%; padding: 17px 0; border-radius: 100px; border: none; cursor: pointer; background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue}); color: #fff; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; transition: all .3s; box-shadow: 0 8px 28px rgba(0,61,165,.28); }
      .aura-btn-primary:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
      .aura-btn-primary:disabled { opacity: .4; cursor: not-allowed; }

      .aura-btn-red { display: flex; align-items: center; justify-content: center; gap: 9px; width: 100%; padding: 17px 0; border-radius: 100px; border: none; cursor: pointer; background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red}); color: #fff; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; transition: all .3s; box-shadow: 0 8px 28px rgba(200,16,46,.28); }
      .aura-btn-red:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
      .aura-btn-red:disabled { opacity: .4; cursor: not-allowed; }

      .aura-btn-ghost { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 20px; border-radius: 100px; border: 1px solid ${t.border}; cursor: pointer; background: transparent; color: ${t.textSec}; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; transition: all .3s; }
      .aura-btn-ghost:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

      .aura-btn-back { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 100px; border: 1px solid ${t.border}; cursor: pointer; background: transparent; color: ${t.textSec}; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; transition: all .3s; margin-bottom: 20px; }
      .aura-btn-back:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

      .aura-btn-edit { display: flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 100px; border: none; cursor: pointer; background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight}); color: #0A0A0F; font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; transition: all .25s; box-shadow: 0 4px 14px rgba(201,169,110,.2); flex-shrink: 0; }
      .aura-btn-edit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,169,110,.3); }

      .aura-hist-row { padding: 18px 22px; border-bottom: 1px solid ${t.border}; display: flex; align-items: center; justify-content: space-between; gap: 12px; transition: background .2s; }
      .aura-hist-row:last-child { border-bottom: none; }
      .aura-hist-row:hover { background: rgba(201,169,110,.03); }

      .aura-decisao-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 100px; font-size: 10px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
      .aura-loading { min-height: 60vh; display: flex; align-items: center; justify-content: center; }
      .aura-draft-toast { display: flex; align-items: center; gap: 10px; background: rgba(0,61,165,.08); border: 1px solid rgba(0,61,165,.2); border-radius: 14px; padding: 12px 18px; margin-bottom: 14px; font-size: 11px; font-weight: 500; letter-spacing: .08em; color: ${AURA.blue}; animation: aura-fadein .4s ease; }

      /* Botão X justificar falta — inline ao lado do nome */
      .aura-btn-justificar {
        width: 28px; height: 28px; border-radius: 8px; border: none;
        display: inline-flex; align-items: center; justify-content: center;
        flex-shrink: 0; cursor: pointer; transition: all .2s;
        margin-left: 6px; vertical-align: middle;
      }
      .aura-btn-justificar:hover { background: rgba(220,38,38,.14) !important; color: #DC2626 !important; }
    `}</style>
  );
}

function IEQCross({ size = 36 }) {
  return (
      <img src="/quadrangular.png" alt="Logo IEQ"
           style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }} />
  );
}

function BadgeDecisao({ decisao }) {
  const cfg = DECISAO_CONFIG[decisao];
  if (!cfg) return null;
  return (
      <span className="aura-decisao-badge" style={{ background: cfg.bg, color: cfg.cor, border: `1px solid ${cfg.borda}` }}>
      {cfg.icone} {cfg.label} <Lock size={8} style={{ opacity: .6 }} />
    </span>
  );
}

function BadgeJustificativa({ valor }) {
  const cfg = JUSTIFICATIVAS.find(j => j.value === valor);
  if (!cfg) return null;
  return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100, background: cfg.bg, color: cfg.cor, border: `1px solid ${cfg.borda}`, fontSize: 10, fontWeight: 600 }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function DecisaoReadOnly({ decisao, t }) {
  const cfg = decisao && decisao !== "NENHUMA" ? DECISAO_CONFIG[decisao] : null;
  return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 15px", borderRadius: 13, background: t.bgInput, border: `1px solid ${t.borderInput}` }}>
        <Lock size={13} style={{ color: t.textMuted, flexShrink: 0 }} />
        {cfg
            ? <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, color: cfg.cor }}>{cfg.icone} {cfg.label}</span>
            : <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, fontStyle: "italic", color: t.textMuted }}>Sem decisão registrada</span>
        }
        <span style={{ marginLeft: "auto", fontSize: 8, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: t.textMuted }}>Somente leitura</span>
      </div>
  );
}

function SeletorReferenciaBiblica({ value, onChange, t, isDark }) {
  const [inputVal, setInputVal] = useState(value || "");
  const [sugestoes, setSugestoes] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => { if (value !== inputVal) setInputVal(value || ""); }, [value]);

  const atualizarPosicao = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX, width: rect.width });
    }
  };

  const gerarSugestoes = (texto) => {
    if (!texto.trim()) { setSugestoes([]); return; }
    const lower = texto.toLowerCase();
    const livrosMatch = BIBLIA.filter(l => l.nome.toLowerCase().includes(lower)).slice(0, 4).map(l => l.nome);
    const temasMatch  = TEMAS_FIXOS.filter(t => t.toLowerCase().includes(lower)).slice(0, 10);
    const todas = [...new Set([...livrosMatch, ...temasMatch])];
    if (texto.trim() && !todas.some(s => s.toLowerCase() === lower)) todas.unshift(texto.trim());
    setSugestoes(todas.slice(0, 12));
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInputVal(val); onChange(val); gerarSugestoes(val); setAberto(true);
    setTimeout(atualizarPosicao, 10);
  };

  const selecionarSugestao = (s) => { setInputVal(s); onChange(s); setSugestoes([]); setAberto(false); };

  useEffect(() => {
    if (aberto) {
      atualizarPosicao();
      window.addEventListener("resize", atualizarPosicao);
      window.addEventListener("scroll", atualizarPosicao, true);
    }
    return () => { window.removeEventListener("resize", atualizarPosicao); window.removeEventListener("scroll", atualizarPosicao, true); };
  }, [aberto]);

  return (
      <div ref={wrapperRef} style={{ position: "relative" }}>
        <label className="aura-label">
          <BookOpen size={10} style={{ display: "inline", marginRight: 6, verticalAlign: "-1px" }} />
          Tema / Referência Bíblica
        </label>
        <input ref={inputRef} className="aura-input" type="text"
               placeholder="Ex: João 3:16 ou A fé que move…"
               value={inputVal} onChange={handleChange}
               onFocus={() => { if (inputVal.trim()) { gerarSugestoes(inputVal); setAberto(true); } }}
               onBlur={() => setTimeout(() => setAberto(false), 220)}
               autoComplete="off"
        />
        {aberto && sugestoes.length > 0 && createPortal(
            <div style={{ position: "absolute", top: position.top, left: position.left, width: position.width, zIndex: 99999, background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 14, maxHeight: 300, overflowY: "auto", boxShadow: `0 25px 70px rgba(0,0,0,${isDark ? "0.75" : "0.3"})`, backdropFilter: "blur(24px)" }}>
              {sugestoes.map((s, i) => (
                  <button key={i} onMouseDown={() => selecionarSugestao(s)}
                          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "13px 16px", textAlign: "left", fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300, color: t.text, borderBottom: i < sugestoes.length - 1 ? `1px solid ${t.border}` : "none" }}
                          onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(201,169,110,.10)" : "rgba(201,169,110,.15)"}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >{s}</button>
              ))}
            </div>,
            document.body
        )}
      </div>
  );
}

function ToastSucesso({ total, onClose }) {
  const [saindo, setSaindo] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => { setSaindo(true); setTimeout(() => { if (onClose) onClose(); }, 450); }, 4800);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
      <div className="aura-toast-overlay" style={{ animation: saindo ? "aura-toast-out .45s ease forwards" : undefined }}>
        <div className="aura-toast-box">
          <div className="aura-toast-icon"><CheckCircle2 size={34} style={{ color: "#fff" }} /></div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 600, color: "#fff", margin: "0 0 8px", letterSpacing: ".02em" }}>Glória a Deus!</p>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300, color: "rgba(255,255,255,.8)", lineHeight: 1.6, margin: 0 }}>
              Relatório enviado com sucesso.<br /><em>O Senhor viu cada presença.</em>
            </p>
          </div>
          <span className="aura-badge" style={{ background: "rgba(255,255,255,.12)", borderColor: "rgba(255,255,255,.2)", color: "rgba(255,255,255,.9)" }}>
          <span className="aura-badge-dot" style={{ background: "#fff" }} /> {total} presentes
        </span>
        </div>
      </div>
  );
}

function PainelJustificativa({ membroId, justificativas, onSelecionar, t }) {
  const atual = justificativas[membroId] || null;
  return (
      <div className="aura-just-panel">
        <p className="aura-just-label">
          <XCircle size={10} style={{ color: t.textMuted }} />
          Justificativa da falta (opcional)
        </p>
        <div className="aura-just-options">
          {JUSTIFICATIVAS.map(j => {
            const ativo = atual === j.value;
            return (
                <button key={j.value} className="aura-just-btn"
                        onClick={() => onSelecionar(membroId, ativo ? null : j.value)}
                        style={{ borderColor: ativo ? j.cor : j.borda, color: ativo ? "#fff" : j.cor, background: ativo ? j.cor : j.bg, boxShadow: ativo ? `0 4px 14px ${j.bg}` : "none" }}>
                  {j.icon} {j.label}
                </button>
            );
          })}
        </div>
      </div>
  );
}

/* ─── Lista de chamada ───────────────────────────────────────────────── */
function PessoasList({ pessoas, form, processingIds, alternarPresenca, decisoesVisitantes, justificativas, onJustificativa, justificandoIds, onToggleJustificando, t, isDark }) {
  return (
      <div className="aura-card" style={{ overflow: "hidden" }}>
        <div className="aura-card-head">
          <div>
            <h3 className="aura-card-head-title">Chamada</h3>
            <p className="aura-card-head-sub">{pessoas.length} pessoas</p>
          </div>
          <span className="aura-badge"><span className="aura-badge-dot aura-blink" />Ao vivo</span>
        </div>
        <div style={{ maxHeight: "58vh", overflowY: "auto" }}>
          {pessoas.map((pessoa) => {
            const marcado     = form.selecionadosKeys.includes(pessoa.uKey);
            const isVisitante = pessoa.tipo === "VISITANTE";
            const isMembro    = pessoa.tipo === "MEMBRO";
            const processing  = processingIds.has(pessoa.uKey);
            const decisao     = isVisitante ? (decisoesVisitantes[pessoa.id] ?? null) : null;
            const temDecisao  = decisao && decisao !== "NENHUMA";
            const ausente     = !marcado;
            const justAtual   = isMembro && ausente ? justificativas[pessoa.id] : null;
            const justAberto  = isMembro && ausente && justificandoIds.has(pessoa.id);

            return (
                <div key={pessoa.uKey} className="aura-person-row"
                     style={{ background: marcado ? (isDark ? "rgba(201,169,110,.04)" : "rgba(201,169,110,.06)") : "transparent" }}>

                  {/* ── Linha principal: botão de presença ocupa toda a largura ── */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <button
                        onClick={() => alternarPresenca(pessoa.uKey)}
                        disabled={processing}
                        style={{
                          flex: 1, background: "none", border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "15px 22px", transition: "all .2s",
                        }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                        {/* Avatar */}
                        <div style={{
                          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                          background: marcado
                              ? `linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue})`
                              : isDark ? "rgba(255,255,255,.05)" : "rgba(201,169,110,.08)",
                          border: marcado ? "none" : `1px solid ${t.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: marcado ? "#fff" : AURA.gold,
                          fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 16,
                          transition: "all .3s",
                        }}>
                          {processing ? <Loader2 size={17} className="aura-spin" /> : pessoa.nome.charAt(0)}
                        </div>

                        <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                          {/* ✅ AJUSTE 2: Nome + botão X inline, logo após o nome */}
                          <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: marcado ? 500 : 300, color: marcado ? t.text : t.textSec, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {pessoa.nome}
                            </p>
                            {isMembro && ausente && (
                                <button
                                    title="Justificar falta"
                                    className="aura-btn-justificar"
                                    onClick={(e) => { e.stopPropagation(); onToggleJustificando(pessoa.id); }}
                                    style={{
                                      background: justAberto ? "rgba(220,38,38,.18)" : "rgba(255,255,255,.04)",
                                      color: justAberto ? "#DC2626" : t.textMuted,
                                    }}
                                >
                                  <XCircle size={15} />
                                </button>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 3 }}>
                            <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: isVisitante ? AURA.yellow : AURA.gold }}>
                              {pessoa.tipo}
                            </span>
                            {isVisitante && temDecisao && <BadgeDecisao decisao={decisao} />}
                            {isMembro && ausente && justAtual && <BadgeJustificativa valor={justAtual} />}
                          </div>
                        </div>
                      </div>

                      {/* Checkbox — direita */}
                      <div style={{
                        width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                        border: `2px solid ${marcado ? AURA.gold : t.border}`,
                        background: marcado ? `linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight})` : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s",
                      }}>
                        {marcado && <CheckCircle2 size={14} style={{ color: "#0A0A0F" }} />}
                      </div>
                    </button>
                  </div>

                  {/* Painel de justificativa */}
                  {justAberto && (
                      <PainelJustificativa membroId={pessoa.id} justificativas={justificativas} onSelecionar={onJustificativa} t={t} />
                  )}

                  {/* Decisão espiritual — visitantes presentes */}
                  {marcado && isVisitante && (
                      <div style={{ padding: "0 22px 16px 76px" }}>
                        <div className="aura-card" style={{ padding: "12px 16px", marginBottom: 0 }}>
                          <label className="aura-label" style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                            <Lock size={9} /> Decisão Espiritual
                          </label>
                          <DecisaoReadOnly decisao={decisao} t={t} />
                          {temDecisao && (
                              <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 11, fontWeight: 300, color: t.textMuted, margin: "8px 0 0" }}>
                                Para alterar, acesse o cadastro do visitante.
                              </p>
                          )}
                        </div>
                      </div>
                  )}
                </div>
            );
          })}
        </div>
      </div>
  );
}

/* =============================================================
   TELA EDITAR RELATÓRIO
============================================================= */
function TelaEditarRelatorio({ relatorioId, onVoltar, onSalvo, isDark = false }) {
  const t = theme(isDark);
  const [loading, setLoading]   = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [pessoas, setPessoas]   = useState([]);
  const [nomeCelula, setNomeCelula] = useState("");
  const [nomeLider, setNomeLider]   = useState("");
  const [celulaId, setCelulaId]     = useState(null);
  const [sucesso, setSucesso]       = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [decisoesVisitantes, setDecisoesVisitantes] = useState({});
  const [justificativas, setJustificativas] = useState({});
  const [justificandoIds, setJustificandoIds] = useState(new Set());
  const [form, setForm] = useState({ dataReuniao: "", estudo: "", selecionadosKeys: [] });

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const headers = { Authorization: `Bearer ${token}` };
      const resRel = await api.get(`/relatorios/${relatorioId}`, { headers });
      const rel = resRel.data;
      setNomeCelula(rel.nomeCelula || ""); setNomeLider(rel.nomeLider || ""); setCelulaId(rel.celulaId);

      const [resMembros, resVisitantes] = await Promise.all([
        api.get(`/celulas/${rel.celulaId}/membros`, { headers }),
        api.get(`/visitantes/celula/${rel.celulaId}/ativos`, { headers }),
      ]);
      const membros    = (resMembros.data   || []).map(m => ({ id: m.id, nome: m.nome, tipo: "MEMBRO",    uKey: `MEMBRO-${m.id}`    }));
      const visitantes = (resVisitantes.data || []).map(v => ({ id: v.id, nome: v.nome, tipo: "VISITANTE", uKey: `VISITANTE-${v.id}` }));

      // ✅ AJUSTE 1: membros primeiro (A–Z), depois visitantes (A–Z)
      setPessoas([
        ...membros.sort((a, b) => a.nome.localeCompare(b.nome)),
        ...visitantes.sort((a, b) => a.nome.localeCompare(b.nome)),
      ]);

      const decisoesMap = {};
      await Promise.all((resVisitantes.data || []).map(async v => {
        try { const r = await api.get(`/visitantes/${v.id}`, { headers }); decisoesMap[v.id] = r.data?.decisaoEspiritual ?? null; }
        catch { decisoesMap[v.id] = null; }
      }));
      setDecisoesVisitantes(decisoesMap);

      const keysPresentes = [
        ...(rel.membrosPresentes    || []).map(m => `MEMBRO-${m.id}`),
        ...(rel.visitantesPresentes || []).map(v => `VISITANTE-${v.id}`),
      ];
      setForm({ dataReuniao: normalizarData(rel.dataReuniao), estudo: rel.estudo || "", selecionadosKeys: keysPresentes });

      const justMap = {};
      (rel.membrosAusentes || []).forEach(m => { if (m.justificativaFalta) justMap[m.id] = m.justificativaFalta; });
      setJustificativas(justMap);
      setJustificandoIds(new Set(Object.keys(justMap).map(Number)));
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
      alert("Não foi possível carregar o relatório.");
    } finally { setLoading(false); }
  }, [relatorioId]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const alternarPresenca = (uKey) => {
    const isMarcado = form.selecionadosKeys.includes(uKey);
    setProcessingIds(prev => new Set(prev).add(uKey));
    setForm(prev => ({ ...prev, selecionadosKeys: isMarcado ? prev.selecionadosKeys.filter(k => k !== uKey) : [...prev.selecionadosKeys, uKey] }));
    if (!isMarcado && uKey.startsWith("MEMBRO-")) {
      const id = Number(uKey.replace("MEMBRO-", ""));
      setJustificativas(prev => { const n = { ...prev }; delete n[id]; return n; });
      setJustificandoIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
    setTimeout(() => setProcessingIds(prev => { const n = new Set(prev); n.delete(uKey); return n; }), 200);
  };

  const handleJustificativa = (membroId, valor) => setJustificativas(prev => { if (!valor) { const n = { ...prev }; delete n[membroId]; return n; } return { ...prev, [membroId]: valor }; });
  const handleToggleJustificando = (membroId) => setJustificandoIds(prev => { const n = new Set(prev); n.has(membroId) ? n.delete(membroId) : n.add(membroId); return n; });

  const membrosPresentes    = form.selecionadosKeys.filter(k => k.startsWith("MEMBRO-")).length;
  const visitantesPresentes = form.selecionadosKeys.filter(k => k.startsWith("VISITANTE-")).length;
  const total = membrosPresentes + visitantesPresentes;

  const handleSalvar = async () => {
    if (!form.estudo.trim()) return alert("Informe o tema ou referência bíblica do estudo.");
    try {
      setSalvando(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const todosMembrosIds = pessoas.filter(p => p.tipo === "MEMBRO").map(p => p.id);
      const membrosPresentesIds = form.selecionadosKeys.filter(k => k.startsWith("MEMBRO-")).map(k => Number(k.replace("MEMBRO-", "")));
      const membrosAusentes = todosMembrosIds.filter(id => !membrosPresentesIds.includes(id) && justificativas[id]).map(id => ({ membroId: id, justificativa: justificativas[id] }));
      const payload = {
        celulaId: Number(celulaId), dataReuniao: normalizarData(form.dataReuniao), estudo: form.estudo.trim(),
        membrosPresentesIds,
        visitantesPresentes: form.selecionadosKeys.filter(k => k.startsWith("VISITANTE-")).map(k => { const id = Number(k.replace("VISITANTE-", "")); return { id, decisaoEspiritual: decisoesVisitantes[id] ?? "NENHUMA" }; }),
        membrosAusentes,
      };
      await api.put(`/relatorios/${relatorioId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setSucesso(true);
      setTimeout(() => { setSucesso(false); if (onSalvo) onSalvo(); }, 2200);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar alterações.");
    } finally { setSalvando(false); }
  };

  if (loading) return (
      <div className="aura-loading">
        <div style={{ textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <div className="aura-pulse" style={{ width: 72, height: 72, position: "absolute", border: "1px solid rgba(201,169,110,.25)", borderRadius: "50%" }} />
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: t.bgEl, border: `1.5px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
              <IEQCross size={36} />
            </div>
          </div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".25em", textTransform: "uppercase", color: AURA.gold, opacity: .7, margin: 0 }}>Carregando…</p>
        </div>
      </div>
  );

  return (
      <div style={{ position: "relative" }}>
        <AuraStyles t={t} isDark={isDark} />
        <div className="aura-glow" />
        <div className="aura-content" style={{ paddingTop: 20 }}>
          <button className="aura-btn-back" onClick={onVoltar}><ArrowLeft size={13} /> Voltar</button>
          {sucesso && <div className="aura-alert-success"><CheckCircle2 size={16} style={{ flexShrink: 0 }} />Relatório atualizado com sucesso!</div>}
          <div className="aura-alert-warn"><AlertTriangle size={15} style={{ flexShrink: 0, color: AURA.yellow }} />Modo edição — você está alterando um relatório já enviado.</div>

          <div className="aura-hero" style={{ background: `linear-gradient(135deg, ${AURA.redDark}, ${AURA.red})` }}>
            <div className="aura-hero-stripes" />
            <div className="aura-hero-inner">
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,.12)", border: "1.5px solid rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Edit3 size={22} style={{ color: "#fff" }} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", margin: "0 0 4px" }}>Editando Relatório #{relatorioId}</p>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 600, color: "#fff", margin: 0 }}>{nomeCelula}</h2>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UserCheck size={16} style={{ color: "#fff" }} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 8.5, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", margin: "0 0 2px" }}>Líder</p>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: "#fff", margin: 0 }}>{nomeLider}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="aura-card" style={{ padding: "22px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>
              <div>
                <label className="aura-label"><Calendar size={10} style={{ display: "inline", marginRight: 6, verticalAlign: "-1px" }} />Data da Reunião</label>
                <input className="aura-input" type="date" style={{ colorScheme: isDark ? "dark" : "light" }} value={form.dataReuniao} onChange={e => setForm({ ...form, dataReuniao: e.target.value })} />
              </div>
              <SeletorReferenciaBiblica value={form.estudo} onChange={val => setForm({ ...form, estudo: val })} t={t} isDark={isDark} />
            </div>
          </div>

          <div className="aura-kpi-grid">
            <div className="aura-kpi"><p className="aura-kpi-label">Membros</p><p className="aura-kpi-num" style={{ color: AURA.red }}>{membrosPresentes}</p></div>
            <div className="aura-kpi"><p className="aura-kpi-label">Visitantes</p><p className="aura-kpi-num" style={{ color: AURA.blue }}>{visitantesPresentes}</p></div>
            <div className="aura-kpi" style={{ background: `linear-gradient(135deg, ${AURA.redDark}, ${AURA.blue})`, border: "none" }}>
              <p className="aura-kpi-label" style={{ color: "rgba(255,255,255,.55)" }}>Total</p>
              <p className="aura-kpi-num" style={{ color: "#fff" }}>{total}</p>
            </div>
          </div>

          <PessoasList pessoas={pessoas} form={form} processingIds={processingIds} alternarPresenca={alternarPresenca} decisoesVisitantes={decisoesVisitantes} justificativas={justificativas} onJustificativa={handleJustificativa} justificandoIds={justificandoIds} onToggleJustificando={handleToggleJustificando} t={t} isDark={isDark} />
          <div style={{ height: 100 }} />
        </div>

        <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", padding: "16px 24px", zIndex: 50, background: isDark ? "linear-gradient(to top,rgba(10,10,15,1) 55%,transparent)" : "linear-gradient(to top,rgba(245,240,232,1) 55%,transparent)" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <button className="aura-btn-red" onClick={handleSalvar} disabled={salvando || !form.estudo.trim()}>
              {salvando ? <><Loader2 size={16} className="aura-spin" /> Salvando…</> : <><ClipboardCheck size={16} /> Salvar Alterações ({total} presentes)</>}
            </button>
          </div>
        </div>
      </div>
  );
}

/* =============================================================
   TELA PRINCIPAL
============================================================= */
export default function TelaRelatorio({ isDark = false }) {
  const t = theme(isDark);
  const [modo, setModo] = useState("novo");
  const [relatorioEditId, setRelatorioEditId] = useState(null);
  const [modalDuplicado, setModalDuplicado]   = useState(null);
  const [celula, setCelula]   = useState(null);
  const [pessoas, setPessoas] = useState([]);
  const [historico, setHistorico]   = useState([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [rascunhoCarregado, setRascunhoCarregado] = useState(false);
  const [toastSucesso, setToastSucesso] = useState(null);
  const [decisoesVisitantes, setDecisoesVisitantes] = useState({});
  const [justificativas, setJustificativas] = useState({});
  const [justificandoIds, setJustificandoIds] = useState(new Set());
  const prontoParaSalvar = useRef(false);

  const [form, setForm] = useState({
    celulaId: null,
    dataReuniao: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })(),
    estudo: "",
    selecionadosKeys: [],
  });

  useEffect(() => {
    if (!prontoParaSalvar.current || !form.celulaId) return;
    try { localStorage.setItem(draftKey(form.celulaId), JSON.stringify({ dataReuniao: form.dataReuniao, estudo: form.estudo, selecionadosKeys: form.selecionadosKeys, salvoEm: new Date().toISOString() })); }
    catch (err) { console.warn("Não foi possível salvar rascunho:", err); }
  }, [form]);

  const carregarDados = useCallback(async () => {
    try {
      prontoParaSalvar.current = false;
      setLoading(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const headers = { Authorization: `Bearer ${token}` };
      const resCelula = await api.get("/celulas/minha-celula", { headers });
      const dadosCelula = resCelula.data;
      setCelula(dadosCelula);

      const [resMembros, resVisitantes] = await Promise.all([
        api.get(`/celulas/${dadosCelula.id}/membros`, { headers }),
        api.get(`/visitantes/celula/${dadosCelula.id}/ativos`, { headers }),
      ]);
      const membros    = (resMembros.data   || []).map(m => ({ id: m.id, nome: m.nome, tipo: "MEMBRO",    uKey: `MEMBRO-${m.id}`    }));
      const visitantes = (resVisitantes.data || []).map(v => ({ id: v.id, nome: v.nome, tipo: "VISITANTE", uKey: `VISITANTE-${v.id}` }));

      // ✅ AJUSTE 1: membros primeiro (A–Z), depois visitantes (A–Z)
      setPessoas([
        ...membros.sort((a, b) => a.nome.localeCompare(b.nome)),
        ...visitantes.sort((a, b) => a.nome.localeCompare(b.nome)),
      ]);

      const decisoesMap = {};
      await Promise.all((resVisitantes.data || []).map(async v => {
        try { const r = await api.get(`/visitantes/${v.id}`, { headers }); decisoesMap[v.id] = r.data?.decisaoEspiritual ?? null; }
        catch { decisoesMap[v.id] = null; }
      }));
      setDecisoesVisitantes(decisoesMap);

      let restaurou = false;
      try {
        const raw = localStorage.getItem(draftKey(dadosCelula.id));
        if (raw) {
          const draft = JSON.parse(raw);
          const hoje = new Date();
          setForm({ celulaId: dadosCelula.id, dataReuniao: draft.dataReuniao || `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`, estudo: draft.estudo || "", selecionadosKeys: draft.selecionadosKeys || [] });
          restaurou = true; setRascunhoCarregado(true);
          setTimeout(() => setRascunhoCarregado(false), 4000);
        }
      } catch (err) { console.warn("Erro ao ler rascunho:", err); }
      if (!restaurou) setForm(prev => ({ ...prev, celulaId: dadosCelula.id }));
      setTimeout(() => { prontoParaSalvar.current = true; }, 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const carregarHistorico = useCallback(async () => {
    try {
      setLoadingHist(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const res = await api.get("/relatorios/historico", { headers: { Authorization: `Bearer ${token}` } });
      setHistorico(res.data || []);
    } catch (err) { console.error("Erro ao carregar histórico:", err); }
    finally { setLoadingHist(false); }
  }, []);

  useEffect(() => { if (modo === "historico") carregarHistorico(); }, [modo, carregarHistorico]);

  const alternarPresenca = (uKey) => {
    const isMarcado = form.selecionadosKeys.includes(uKey);
    setProcessingIds(prev => new Set(prev).add(uKey));
    setForm(prev => ({ ...prev, selecionadosKeys: isMarcado ? prev.selecionadosKeys.filter(k => k !== uKey) : [...prev.selecionadosKeys, uKey] }));
    if (!isMarcado && uKey.startsWith("MEMBRO-")) {
      const id = Number(uKey.replace("MEMBRO-", ""));
      setJustificativas(prev => { const n = { ...prev }; delete n[id]; return n; });
      setJustificandoIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
    setTimeout(() => setProcessingIds(prev => { const n = new Set(prev); n.delete(uKey); return n; }), 200);
  };

  const handleJustificativa = (membroId, valor) => setJustificativas(prev => { if (!valor) { const n = { ...prev }; delete n[membroId]; return n; } return { ...prev, [membroId]: valor }; });
  const handleToggleJustificando = (membroId) => setJustificandoIds(prev => { const n = new Set(prev); n.has(membroId) ? n.delete(membroId) : n.add(membroId); return n; });

  const membrosPresentes    = form.selecionadosKeys.filter(k => k.startsWith("MEMBRO-")).length;
  const visitantesPresentes = form.selecionadosKeys.filter(k => k.startsWith("VISITANTE-")).length;
  const total = membrosPresentes + visitantesPresentes;

  const handleSubmit = async () => {
    if (!form.estudo.trim()) return alert("Informe o tema ou referência bíblica do estudo.");
    try {
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const res = await api.get("/relatorios/historico", { headers: { Authorization: `Bearer ${token}` } });
      const existente = (res.data || []).find(r => normalizarData(r.dataReuniao) === normalizarData(form.dataReuniao));
      if (existente) { setModalDuplicado({ relatorioId: existente.id, dataReuniao: existente.dataReuniao, estudo: existente.estudo || "Sem tema" }); return; }
    } catch (err) { console.warn("Não foi possível verificar duplicata:", err); }

    try {
      setEnviando(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const totalEnviado = total;
      const todosMembrosIds = pessoas.filter(p => p.tipo === "MEMBRO").map(p => p.id);
      const membrosPresentesIds = form.selecionadosKeys.filter(k => k.startsWith("MEMBRO-")).map(k => Number(k.replace("MEMBRO-", "")));
      const membrosAusentes = todosMembrosIds.filter(id => !membrosPresentesIds.includes(id) && justificativas[id]).map(id => ({ membroId: id, justificativa: justificativas[id] }));
      const payload = {
        celulaId: Number(form.celulaId), dataReuniao: form.dataReuniao, estudo: form.estudo.trim(),
        membrosPresentesIds,
        visitantesPresentes: form.selecionadosKeys.filter(k => k.startsWith("VISITANTE-")).map(k => { const id = Number(k.replace("VISITANTE-", "")); return { id, decisaoEspiritual: decisoesVisitantes[id] ?? "NENHUMA" }; }),
        membrosAusentes,
      };
      await api.post("/relatorios", payload, { headers: { Authorization: `Bearer ${token}` } });
      try { await api.put(`/metas/celula/${form.celulaId}/recalcular`, {}, { headers: { Authorization: `Bearer ${token}` } }); dispararAtualizacaoMetas(form.celulaId); }
      catch (err) { console.warn("Não foi possível recalcular metas:", err); }
      try { localStorage.removeItem(draftKey(form.celulaId)); } catch (_) {}
      prontoParaSalvar.current = false;
      setForm(f => ({ ...f, estudo: "", selecionadosKeys: [] }));
      setJustificativas({}); setJustificandoIds(new Set());
      setTimeout(() => { prontoParaSalvar.current = true; }, 0);
      setToastSucesso({ total: totalEnviado });
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao enviar relatório.");
    } finally { setEnviando(false); }
  };

  const nomeCelula = celula?.nome || "Carregando…";
  const nomeLider  = celula?.nomeLider || celula?.lider?.nome || celula?.usuario?.nome || "Líder";

  if (modo === "editar" && relatorioEditId) {
    return (
        <TelaEditarRelatorio relatorioId={relatorioEditId} isDark={isDark}
                             onVoltar={() => { setModo("historico"); setRelatorioEditId(null); }}
                             onSalvo={() => { setModo("historico"); setRelatorioEditId(null); carregarHistorico(); }} />
    );
  }

  if (loading) return (
      <div className="aura-loading">
        <AuraStyles t={t} isDark={isDark} />
        <div className="aura-glow" />
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <div className="aura-pulse" style={{ width: 72, height: 72, position: "absolute", border: "1px solid rgba(201,169,110,.25)", borderRadius: "50%" }} />
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: t.bgEl, border: `1.5px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
              <IEQCross size={36} />
            </div>
          </div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".25em", textTransform: "uppercase", color: AURA.gold, opacity: .7, margin: 0 }}>Carregando…</p>
        </div>
      </div>
  );

  return (
      <div className="aura-root">
        <AuraStyles t={t} isDark={isDark} />
        <div className="aura-glow" />
        {toastSucesso && <ToastSucesso total={toastSucesso.total} onClose={() => setToastSucesso(null)} />}

        {modalDuplicado && (
            <div className="aura-modal-overlay" onClick={() => setModalDuplicado(null)}>
              <div className="aura-modal-box" onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 50, height: 50, borderRadius: "50%", flexShrink: 0, background: "rgba(253,184,19,.1)", border: "1px solid rgba(253,184,19,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertTriangle size={22} style={{ color: AURA.yellow }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 500, color: t.text, margin: "0 0 3px" }}>Relatório já enviado</p>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 300, color: t.textSec, margin: 0 }}>
                      {new Date(normalizarData(modalDuplicado.dataReuniao) + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${AURA.gold}, transparent)`, margin: "0 0 18px" }} />
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300, color: t.textSec, lineHeight: 1.65, margin: "0 0 20px" }}>
                  Já existe um relatório para esta data. Deseja <strong style={{ color: t.text, fontWeight: 500 }}>editar o existente</strong>?
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="aura-btn-ghost" style={{ flex: 1 }} onClick={() => setModalDuplicado(null)}>Cancelar</button>
                  <button className="aura-btn-primary" style={{ flex: 2 }}
                          onClick={() => { const id = modalDuplicado.relatorioId; setModalDuplicado(null); setRelatorioEditId(id); setModo("editar"); }}>
                    <Edit3 size={14} /> Editar Existente
                  </button>
                </div>
              </div>
            </div>
        )}

        <div className="aura-content" style={{ paddingTop: 20 }}>
          <div className="aura-tabs">
            {[
              { key: "novo",      label: "Novo Relatório", icon: <ClipboardCheck size={13} /> },
              { key: "historico", label: "Histórico",      icon: <History size={13} /> },
            ].map(tab => (
                <button key={tab.key} className={`aura-tab ${modo === tab.key ? "active" : "inactive"}`} onClick={() => setModo(tab.key)}>
                  {tab.icon} {tab.label}
                </button>
            ))}
          </div>

          {modo === "historico" && (
              <div className="aura-card" style={{ overflow: "hidden" }}>
                <div className="aura-card-head">
                  <div><h3 className="aura-card-head-title">Seus Relatórios</h3><p className="aura-card-head-sub">{historico.length} registros</p></div>
                  <span className="aura-badge"><Trophy size={10} /> Histórico</span>
                </div>
                {loadingHist ? (
                    <div style={{ padding: 48, textAlign: "center" }}><Loader2 size={28} className="aura-spin" style={{ color: AURA.gold, display: "inline-block" }} /></div>
                ) : historico.length === 0 ? (
                    <div style={{ padding: 48, textAlign: "center" }}>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, fontStyle: "italic", color: t.textMuted }}>Nenhum relatório encontrado.</p>
                    </div>
                ) : historico.map(rel => (
                    <div key={rel.id} className="aura-hist-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: AURA.gold, flexShrink: 0 }} />
                          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 500, color: t.text, margin: 0 }}>
                            {rel.dataReuniao ? new Date(normalizarData(rel.dataReuniao) + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                          </p>
                        </div>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 300, color: t.textSec, margin: "0 0 5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {rel.estudo || "Sem referência"}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span className="aura-badge" style={{ fontSize: 9, padding: "3px 10px" }}>
                      <Users2 size={9} /> {rel.totalPresentes || 0} presentes
                    </span>
                          {(rel.membrosAusentes || []).filter(m => m.justificativaFalta).slice(0, 3).map(m => (
                              <BadgeJustificativa key={m.id} valor={m.justificativaFalta} />
                          ))}
                          {(rel.membrosAusentes || []).filter(m => m.justificativaFalta).length > 3 && (
                              <span style={{ fontSize: 10, color: t.textMuted }}>+{(rel.membrosAusentes || []).filter(m => m.justificativaFalta).length - 3}</span>
                          )}
                        </div>
                      </div>
                      <button className="aura-btn-edit" onClick={() => { setRelatorioEditId(rel.id); setModo("editar"); }}>
                        <Edit3 size={12} /> Editar
                      </button>
                    </div>
                ))}
              </div>
          )}

          {modo === "novo" && (
              <>
                {rascunhoCarregado && (
                    <div className="aura-draft-toast">
                      <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                      Rascunho restaurado — suas marcações anteriores foram recuperadas.
                    </div>
                )}

                <div className="aura-hero" style={{ background: `linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue})` }}>
                  <div className="aura-hero-stripes" />
                  <div className="aura-hero-inner">
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <div className="aura-pulse" style={{ width: 66, height: 66, position: "absolute", border: "1px solid rgba(201,169,110,.35)", borderRadius: "50%" }} />
                        <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "1.5px solid rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
                          <IEQCross size={34} />
                        </div>
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", margin: "0 0 4px" }}>Relatório Semanal</p>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 600, color: "#fff", margin: 0 }}>{nomeCelula}</h2>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <UserCheck size={16} style={{ color: "#fff" }} />
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 8.5, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", margin: "0 0 2px" }}>Líder Responsável</p>
                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: "#fff", margin: 0 }}>{nomeLider}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="aura-card" style={{ padding: "22px 24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>
                    <div>
                      <label className="aura-label"><Calendar size={10} style={{ display: "inline", marginRight: 6, verticalAlign: "-1px" }} />Data da Reunião</label>
                      <input className="aura-input" type="date" style={{ colorScheme: isDark ? "dark" : "light" }} value={form.dataReuniao} onChange={e => setForm({ ...form, dataReuniao: e.target.value })} />
                    </div>
                    <SeletorReferenciaBiblica value={form.estudo} onChange={val => setForm({ ...form, estudo: val })} t={t} isDark={isDark} />
                  </div>
                </div>

                <div className="aura-divider"><div className="aura-divider-dot" /></div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
                  <span className="aura-badge"><span className="aura-badge-dot aura-blink" />Presença em Tempo Real</span>
                </div>

                <div className="aura-kpi-grid">
                  <div className="aura-kpi"><p className="aura-kpi-label">Membros</p><p className="aura-kpi-num" style={{ color: AURA.red }}>{membrosPresentes}</p></div>
                  <div className="aura-kpi"><p className="aura-kpi-label">Visitantes</p><p className="aura-kpi-num" style={{ color: AURA.blue }}>{visitantesPresentes}</p></div>
                  <div className="aura-kpi" style={{ background: `linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue})`, border: "none" }}>
                    <p className="aura-kpi-label" style={{ color: "rgba(255,255,255,.55)" }}>Total</p>
                    <p className="aura-kpi-num" style={{ color: "#fff" }}>{total}</p>
                  </div>
                </div>

                <PessoasList pessoas={pessoas} form={form} processingIds={processingIds} alternarPresenca={alternarPresenca} decisoesVisitantes={decisoesVisitantes} justificativas={justificativas} onJustificativa={handleJustificativa} justificandoIds={justificandoIds} onToggleJustificando={handleToggleJustificando} t={t} isDark={isDark} />
                <div style={{ height: 100 }} />
              </>
          )}
        </div>

        {modo === "novo" && (
            <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", padding: "16px 24px", zIndex: 50, background: isDark ? "linear-gradient(to top,rgba(10,10,15,1) 55%,transparent)" : "linear-gradient(to top,rgba(245,240,232,1) 55%,transparent)" }}>
              <div style={{ maxWidth: 760, margin: "0 auto" }}>
                <button className="aura-btn-primary" onClick={handleSubmit} disabled={enviando || !form.estudo.trim()}>
                  {enviando ? <><Loader2 size={16} className="aura-spin" /> Enviando…</> : <><ClipboardCheck size={16} /> Finalizar Relatório ({total} presentes)</>}
                </button>
              </div>
            </div>
        )}
      </div>
  );
}
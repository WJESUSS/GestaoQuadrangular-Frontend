import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
  Plus, X, User, Phone, Trash2, Loader2, Search,
  CreditCard, Heart, ChevronRight, Users, CalendarDays,
  MapPin, BookOpen, Briefcase, Cross, Star, FileText,
  ArrowLeft, Eye, EyeOff, AlertCircle,
} from "lucide-react";

/* ─── AURA Design Tokens (igual ao Dashboard) ─────────────────────── */
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

function themeMembers(isDark) {
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

const STATUS_COLORS = {
  ATIVO:       { bg: "rgba(5,150,105,.12)",  text: "#059669", border: "rgba(5,150,105,.3)"   },
  INATIVO:     { bg: "rgba(200,16,46,.1)",   text: AURA.red,   border: "rgba(200,16,46,.3)"   },
  AFASTADO:    { bg: "rgba(253,184,19,.12)", text: "#C48C00", border: "rgba(253,184,19,.35)" },
  TRANSFERIDO: { bg: "rgba(0,61,165,.1)",    text: AURA.blue,  border: "rgba(0,61,165,.3)"    },
  FALECIDO:    { bg: "rgba(100,100,100,.1)", text: "#666",    border: "rgba(100,100,100,.3)" },
};

const statusOptions = ["ATIVO", "INATIVO", "AFASTADO", "TRANSFERIDO", "FALECIDO"];

const estadoCivilOptions = [
  { value: "SOLTEIRO",      label: "Solteiro(a)"   },
  { value: "CASADO",        label: "Casado(a)"     },
  { value: "DIVORCIADO",    label: "Divorciado(a)" },
  { value: "VIUVO",         label: "Viúvo(a)"      },
  { value: "UNIAO_ESTAVEL", label: "União Estável" },
];

const grauEscolaridadeOptions = [
  { value: "",                        label: "Não informado"                },
  { value: "EDUCACAO_INFANTIL",       label: "Educação Infantil"            },
  { value: "ENSINO_FUNDAMENTAL_I",    label: "Ensino Fundamental I (1-5º)"  },
  { value: "ENSINO_FUNDAMENTAL_II",   label: "Ensino Fundamental II (6-9º)" },
  { value: "ENSINO_MEDIO",            label: "Ensino Médio"                 },
  { value: "ENSINO_MEDIO_INCOMPLETO", label: "Ensino Médio Incompleto"      },
  { value: "TECNICO",                 label: "Técnico"                      },
  { value: "SUPERIOR_INCOMPLETO",     label: "Superior Incompleto"          },
  { value: "SUPERIOR_COMPLETO",       label: "Superior Completo"            },
  { value: "POS_GRADUACAO",           label: "Pós-Graduação / MBA"          },
  { value: "MESTRADO",                label: "Mestrado"                     },
  { value: "DOUTORADO",               label: "Doutorado"                    },
];

const tipoArrolamentoOptions = [
  { value: "",                label: "Não informado"    },
  { value: "PROFISSAO_DE_FE", label: "Profissão de Fé" },
  { value: "TRANSFERENCIA",   label: "Transferência"   },
];

const formInicial = {
  nome: "", email: "", telefone: "", cpf: "", rg: "",
  estadoCivil: "SOLTEIRO", status: "ATIVO",
  dataNascimento: "", dataConversao: "", dataBatismo: "",
  celulaId: null,
  nomeMae: "", nomePai: "", nomeConjuge: "", naturalidade: "",
  grauEscolaridade: "", curso: "", profissao: "",
  endereco: "", numero: "", bairro: "", cidade: "", cep: "", uf: "",
  pertenceOutraReligiao: false, qualReligiao: "",
  batizadoNasAguas: false, dataBatizadoNasAguas: "", igrejaBatizadoNasAguas: "",
  batizadoEspiritoSanto: false,
  tipoArrolamento: "", jurisdicaoArrolamento: "", arroladoPor: "",
  observacoes: "",
};

/* ─── Helpers de Data ─────────────────────────────────────────────── */
function formatarDataInput(dataISO) {
  if (!dataISO) return "";
  try {
    if (typeof dataISO === "string" && dataISO.includes("T")) return dataISO.split("T")[0];
    if (typeof dataISO === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dataISO)) return dataISO;
    return "";
  } catch { return ""; }
}

function brParaIso(br) {
  const m = br.replace(/\D/g, "");
  if (m.length !== 8) return "";
  const d = m.slice(0, 2), mo = m.slice(2, 4), y = m.slice(4, 8);
  if (+d < 1 || +d > 31 || +mo < 1 || +mo > 12) return "";
  return `${y}-${mo}-${d}`;
}

function isoParaBr(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, mo, d] = iso.split("-");
  return `${d}/${mo}/${y}`;
}

function mascaraData(valor) {
  const nums = valor.replace(/\D/g, "").slice(0, 8);
  if (nums.length <= 2) return nums;
  if (nums.length <= 4) return `${nums.slice(0,2)}/${nums.slice(2)}`;
  return `${nums.slice(0,2)}/${nums.slice(2,4)}/${nums.slice(4)}`;
}

function prepararFormParaEnvio(form) {
  const dados = { ...form };
  if (!dados.celulaId)             delete dados.celulaId;
  if (!dados.dataNascimento)       dados.dataNascimento       = null;
  if (!dados.dataConversao)        dados.dataConversao        = null;
  if (!dados.dataBatismo)          dados.dataBatismo          = null;
  if (!dados.dataBatizadoNasAguas) dados.dataBatizadoNasAguas = null;
  if (!dados.tipoArrolamento)      dados.tipoArrolamento      = null;
  if (!dados.nome || dados.nome.trim() === "") throw new Error("Nome completo é obrigatório");
  return dados;
}

/* ─── DateInput ──────────────────────────────────────────────────── */
function DateInput({ value, onChange, className = "", isDark = false, ...rest }) {
  const [texto, setTexto] = useState(isoParaBr(value));
  const nativeRef = useRef(null);

  useEffect(() => { setTexto(isoParaBr(value)); }, [value]);

  const handleTexto = (e) => {
    const mascarado = mascaraData(e.target.value);
    setTexto(mascarado);
    const iso = brParaIso(mascarado);
    onChange(iso || (mascarado === "" ? "" : ""));
  };

  const handleNative = (e) => {
    const iso = e.target.value;
    onChange(iso);
    setTexto(isoParaBr(iso));
  };

  return (
      <div style={{ position: "relative" }}>
        <input
            {...rest}
            className={className}
            value={texto}
            onChange={handleTexto}
            placeholder="DD/MM/AAAA"
            inputMode="numeric"
            maxLength={10}
            style={{ paddingRight: 38, ...(rest.style || {}) }}
        />
        <button
            type="button"
            onClick={() => nativeRef.current?.showPicker?.()}
            title="Abrir calendário"
            style={{
              position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
              color: AURA.gold,
            }}
        >
          <CalendarDays size={16} />
        </button>
        <input
            ref={nativeRef}
            type="date"
            value={value || ""}
            onChange={handleNative}
            tabIndex={-1}
            style={{
              position: "absolute", opacity: 0, pointerEvents: "none",
              top: 0, left: 0, width: "100%", height: "100%",
            }}
        />
      </div>
  );
}

/* ─── GlobalStyles ────────────────────────────────────────────────── */
function GlobalStylesMembers({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes dl-spin   { to { transform: rotate(360deg); } }
      @keyframes dl-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes dl-blink  { 0%,100%{opacity:1;} 50%{opacity:.3;} }

      .dl-spin   { animation: dl-spin  1s linear infinite; }
      .dl-pulse  { animation: dl-pulse 3s ease-in-out infinite; }
      .dl-blink  { animation: dl-blink 2s ease-in-out infinite; }

      .mem-root {
        font-family: 'Inter', sans-serif;
        background: ${t.bg};
        color: ${t.text};
        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
        padding-bottom: max(40px, env(safe-area-inset-bottom, 40px));
        transition: background .3s, color .3s;
      }
      
      .mem-glow {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
          radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%);
        transition: background .3s;
      }
      
      .mem-content {
        position: relative; z-index: 1;
        max-width: 960px; margin: 0 auto;
        padding: 20px 16px 0;
      }
      @media(max-width: 420px) { .mem-content { padding: 16px 12px 0; } }

      .mem-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
      }
      
      .mem-header-left {
        display: flex; align-items: center; gap: 12px; flex: 1;
      }
      
      .mem-title-block {
        flex: 1; min-width: 0;
      }
      
      .mem-eyebrow {
        font-size: 9px; font-weight: 500; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(201,169,110,.55);
        margin: 0 0 3px;
      }
      
      .mem-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(17px, 4vw, 22px);
        font-weight: 500; color: ${t.text};
        margin: 0; line-height: 1.2;
      }
      
      .mem-btn-ico {
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${t.border};
        border-radius: 12px; width: 38px; height: 38px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        color: ${t.textMuted}; transition: all .25s; flex-shrink: 0;
      }
      .mem-btn-ico:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

      .mem-search-wrap {
        position: relative; margin-bottom: 18px;
      }
      
      .mem-search-icon {
        position: absolute; left: 14px; top: 50%;
        transform: translateY(-50%); color: ${AURA.gold}; opacity: .5;
        pointer-events: none;
      }
      
      .mem-input {
        width: 100%; box-sizing: border-box;
        background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 13px 16px 13px 44px;
        border-radius: 13px; outline: none;
        font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
        transition: all .25s; -webkit-appearance: none; appearance: none;
      }
      .mem-input:focus {
        border-color: rgba(201,169,110,.5);
        background: rgba(201,169,110,.04);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .mem-input::placeholder { color: ${t.placeholder}; }

      .mem-btn-gold {
        display: flex; align-items: center; gap: 7px;
        padding: 11px 20px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight});
        color: #0A0A0F; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; transition: all .35s;
        box-shadow: 0 6px 22px rgba(201,169,110,.22); flex-shrink: 0;
      }
      .mem-btn-gold:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(201,169,110,.32); }

      .mem-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 16px; overflow: hidden; margin-bottom: 12px;
        backdrop-filter: blur(24px); position: relative; cursor: pointer;
        transition: all .35s cubic-bezier(.4,0,.2,1);
      }
      .mem-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }
      .mem-card:active {
        transform: scale(.98);
        border-color: ${t.cardHover};
        box-shadow: 0 8px 24px rgba(0,0,0,${isDark ? ".3" : ".1"});
      }

      .mem-card-inner {
        padding: 16px 18px;
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px;
      }

      .mem-card-avatar {
        width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
        background: linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark});
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-family: 'Playfair Display', serif;
        font-weight: 600; font-size: 18px;
      }

      .mem-card-content {
        flex: 1; min-width: 0;
      }

      .mem-card-name {
        font-size: 13px; font-weight: 500; color: ${t.text};
        margin: 0 0 6px; overflow: hidden;
        text-overflow: ellipsis; white-space: nowrap;
      }

      .mem-card-meta {
        display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      }

      .mem-badge {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 10px; border-radius: 6px;
        font-size: 9px; font-weight: 600; letter-spacing: .1em;
        text-transform: uppercase;
      }

      .mem-card-arrow {
        color: ${t.textMuted}; flex-shrink: 0;
      }

      .mem-grid {
        display: flex; flex-direction: column; gap: 10px;
      }

      .mem-empty {
        text-align: center; padding: 48px 20px;
      }

      .mem-empty-icon {
        width: 64px; height: 64px; border-radius: 16px;
        background: rgba(201,169,110,.1);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 16px;
        color: ${AURA.gold};
      }

      .mem-empty-text {
        font-size: 13px; font-weight: 300; color: ${t.textMuted};
        margin: 0;
      }

      .mem-loading {
        min-height: 60vh; display: flex;
        align-items: center; justify-content: center;
      }

      .mem-modal-backdrop {
        position: fixed; inset: 0; z-index: 9999;
        display: flex; align-items: flex-end; justify-content: center;
      }
      @media(min-width: 520px) {
        .mem-modal-backdrop { align-items: center; padding: 16px; }
      }
      
      .mem-modal-overlay {
        position: fixed; inset: 0;
        background: rgba(10,10,15,.88); z-index: 0;
        backdrop-filter: blur(4px);
      }
      
      .mem-modal-box {
        position: relative; z-index: 10;
        width: 100%; max-height: 88vh;
        display: flex; flex-direction: column;
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 24px 24px 0 0; overflow: hidden;
      }
      @media(min-width: 520px) {
        .mem-modal-box {
          border-radius: 24px; max-width: 520px;
          max-height: calc(100vh - 32px);
        }
      }

      .mem-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 20px 22px; border-bottom: 1px solid ${t.border};
        flex-shrink: 0;
      }

      .mem-modal-title {
        font-family: 'Playfair Display', serif;
        font-size: 18px; font-weight: 500; color: ${t.text};
        margin: 0;
      }

      .mem-modal-body {
        flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        padding: 22px 20px;
        display: flex; flex-direction: column; gap: 16px;
      }

      .mem-form-section {
        padding: 16px; border-radius: 12px;
        background: ${isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)"};
        border: 1px solid ${t.border};
        display: flex; flex-direction: column; gap: 12px;
      }

      .mem-form-label {
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; color: ${t.textSec};
        display: block; margin-bottom: 6px;
      }

      .mem-form-field {
        width: 100%; box-sizing: border-box;
        background: ${t.bgInput};
        border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 11px 14px; border-radius: 10px;
        outline: none; font-family: 'Inter', sans-serif; font-size: 14px;
        transition: all .25s; -webkit-appearance: none; appearance: none;
      }
      .mem-form-field:focus {
        border-color: rgba(201,169,110,.5);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .mem-form-field::placeholder { color: ${t.placeholder}; }
      select.mem-form-field { color: ${t.text}; }
      select.mem-form-field option {
        background: ${isDark ? "#12121A" : "#F5F0E8"};
        color: ${t.text};
      }

      .mem-form-grid2 {
        display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      }
      @media(max-width: 480px) { .mem-form-grid2 { grid-template-columns: 1fr; } }

      .mem-form-textarea {
        width: 100%; box-sizing: border-box; resize: vertical;
        background: ${t.bgInput};
        border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 12px 14px;
        border-radius: 10px; outline: none; min-height: 100px;
        font-family: 'Inter', sans-serif; font-size: 14px;
        transition: all .25s;
      }
      .mem-form-textarea:focus {
        border-color: rgba(201,169,110,.5);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }

      .mem-form-actions {
        display: flex; gap: 10px; padding-top: 8px;
      }

      .mem-btn-save {
        flex: 1; padding: 13px; border-radius: 10px; border: none;
        background: linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; cursor: pointer; transition: all .3s;
        display: flex; align-items: center; justify-content: center; gap: 6px;
      }
      .mem-btn-save:hover { opacity: .9; transform: translateY(-1px); }

      .mem-btn-delete {
        flex: 1; padding: 13px; border-radius: 10px; border: none;
        background: rgba(200,16,46,.12);
        color: ${AURA.red}; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; cursor: pointer; transition: all .3s;
        display: flex; align-items: center; justify-content: center; gap: 6px;
      }
      .mem-btn-delete:hover { background: rgba(200,16,46,.2); }

      .mem-section-title {
        font-family: 'Playfair Display', serif;
        font-size: 13px; font-weight: 500; color: ${t.text};
        margin: 8px 0 0;
      }

      .mem-check-row {
        display: flex; align-items: center; gap: 10px; padding: 8px 0;
      }

      .mem-checkbox {
        width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0;
        border: 2px solid ${t.borderInput};
        background: transparent;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .2s;
      }
      .mem-checkbox.checked {
        background: ${AURA.blue};
        border-color: ${AURA.blue};
        color: #fff;
      }

      .mem-checkbox-label {
        font-family: 'Inter', sans-serif; font-size: 14px;
        color: ${t.text}; cursor: pointer;
      }
    `}</style>
  );
}

/* ─── Modal ───────────────────────────────────────────────────────── */
function MembroModalRefatorado({
                                 isDark, editandoId, form, setForm,
                                 onSalvar, onExcluir, onFechar,
                                 nomeCelula, nomeLider, loading
                               }) {
  const t = themeMembers(isDark);

  const f = v => setForm(p => ({ ...p, ...v }));

  const content = (
      <motion.div
          className="mem-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onFechar}
      >
        <motion.div
            className="mem-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onFechar}
        />
        <motion.div
            className="mem-modal-box"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "tween", duration: 0.28 }}
            onClick={e => e.stopPropagation()}
        >
          <div className="mem-modal-header">
            <h2 className="mem-modal-title">
              {editandoId ? "Editar Perfil" : "Novo Membro"}
            </h2>
            <button
                onClick={onFechar}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: t.textMuted, display: "flex", padding: 0,
                  transition: "color .2s"
                }}
            >
              <X size={20} />
            </button>
          </div>

          <form className="mem-modal-body" onSubmit={onSalvar}>

            {nomeCelula && editandoId && (
                <motion.div
                    className="mem-form-section"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: `linear-gradient(135deg, ${AURA.gold}12, ${AURA.gold}08)`,
                      border: `1px solid ${AURA.gold}40`,
                    }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Users size={16} style={{ color: AURA.gold, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: AURA.gold, margin: "0 0 2px" }}>
                        CÉLULA VINCULADA
                      </p>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 500, color: t.text, margin: 0 }}>
                        {nomeCelula}
                      </p>
                      {nomeLider && (
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: t.textMuted, margin: "2px 0 0" }}>
                            Líder: {nomeLider}
                          </p>
                      )}
                    </div>
                  </div>
                </motion.div>
            )}

            {/* ── Identificação ── */}
            <div>
              <p className="mem-section-title">Identificação</p>
              <div className="mem-form-section">
                <div>
                  <label className="mem-form-label">NOME COMPLETO *</label>
                  <input required className="mem-form-field"
                         value={form.nome} onChange={e => f({ nome: e.target.value })} />
                </div>
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">CPF</label>
                    <input className="mem-form-field"
                           value={form.cpf} onChange={e => f({ cpf: e.target.value })} />
                  </div>
                  <div>
                    <label className="mem-form-label">RG</label>
                    <input className="mem-form-field"
                           value={form.rg} onChange={e => f({ rg: e.target.value })} />
                  </div>
                </div>
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">NASCIMENTO</label>
                    <DateInput className="mem-form-field" isDark={isDark}
                               value={form.dataNascimento} onChange={v => f({ dataNascimento: v })} />
                  </div>
                  <div>
                    <label className="mem-form-label">ESTADO CIVIL</label>
                    <select className="mem-form-field"
                            value={form.estadoCivil} onChange={e => f({ estadoCivil: e.target.value })}>
                      {estadoCivilOptions.map(o =>
                          <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">WHATSAPP</label>
                    <input className="mem-form-field"
                           value={form.telefone} onChange={e => f({ telefone: e.target.value })} />
                  </div>
                  <div>
                    <label className="mem-form-label">E-MAIL</label>
                    <input type="email" className="mem-form-field"
                           value={form.email} onChange={e => f({ email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="mem-form-label">STATUS</label>
                  <select className="mem-form-field"
                          value={form.status} onChange={e => f({ status: e.target.value })}>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Filiação ── */}
            <div>
              <p className="mem-section-title">Filiação & Família</p>
              <div className="mem-form-section">
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">MÃE</label>
                    <input className="mem-form-field"
                           value={form.nomeMae} onChange={e => f({ nomeMae: e.target.value })} />
                  </div>
                  <div>
                    <label className="mem-form-label">PAI</label>
                    <input className="mem-form-field"
                           value={form.nomePai} onChange={e => f({ nomePai: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="mem-form-label">CÔNJUGE</label>
                  <input className="mem-form-field"
                         value={form.nomeConjuge} onChange={e => f({ nomeConjuge: e.target.value })} />
                </div>
                <div>
                  <label className="mem-form-label">NATURALIDADE</label>
                  <input className="mem-form-field"
                         value={form.naturalidade} onChange={e => f({ naturalidade: e.target.value })} />
                </div>
              </div>
            </div>

            {/* ── Endereço ── */}
            <div>
              <p className="mem-section-title">Endereço</p>
              <div className="mem-form-section">
                <div>
                  <label className="mem-form-label">CEP</label>
                  <input className="mem-form-field" placeholder="00000-000" inputMode="numeric"
                         value={form.cep} onChange={e => {
                    const nums = e.target.value.replace(/\D/g, "").slice(0, 8);
                    const masked = nums.length > 5 ? `${nums.slice(0,5)}-${nums.slice(5)}` : nums;
                    setForm(p => ({ ...p, cep: masked }));
                    if (nums.length === 8) {
                      fetch(`https://viacep.com.br/ws/${nums}/json/`)
                          .then(r => r.json())
                          .then(d => {
                            if (!d.erro) {
                              setForm(p => ({
                                ...p,
                                endereco: d.logradouro || p.endereco,
                                bairro: d.bairro || p.bairro,
                                cidade: d.localidade || p.cidade,
                                uf: d.uf || p.uf,
                              }));
                            }
                          })
                          .catch(() => {});
                    }
                  }} />
                </div>
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">LOGRADOURO</label>
                    <input className="mem-form-field"
                           value={form.endereco} onChange={e => f({ endereco: e.target.value })} />
                  </div>
                  <div>
                    <label className="mem-form-label">Nº</label>
                    <input className="mem-form-field"
                           value={form.numero} onChange={e => f({ numero: e.target.value })} />
                  </div>
                </div>
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">BAIRRO</label>
                    <input className="mem-form-field"
                           value={form.bairro} onChange={e => f({ bairro: e.target.value })} />
                  </div>
                  <div>
                    <label className="mem-form-label">UF</label>
                    <input className="mem-form-field" placeholder="BA"
                           value={form.uf ?? ""} onChange={e => f({ uf: e.target.value.toUpperCase() })} maxLength={2} />
                  </div>
                </div>
                <div>
                  <label className="mem-form-label">CIDADE</label>
                  <input className="mem-form-field"
                         value={form.cidade} onChange={e => f({ cidade: e.target.value })} />
                </div>
              </div>
            </div>

            {/* ── Escolaridade ── */}
            <div>
              <p className="mem-section-title">Escolaridade & Profissão</p>
              <div className="mem-form-section">
                <div>
                  <label className="mem-form-label">GRAU DE ESCOLARIDADE</label>
                  <select className="mem-form-field"
                          value={form.grauEscolaridade} onChange={e => f({ grauEscolaridade: e.target.value })}>
                    {grauEscolaridadeOptions.map(o =>
                        <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">CURSO</label>
                    <input className="mem-form-field"
                           value={form.curso} onChange={e => f({ curso: e.target.value })} />
                  </div>
                  <div>
                    <label className="mem-form-label">PROFISSÃO</label>
                    <input className="mem-form-field"
                           value={form.profissao} onChange={e => f({ profissao: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Espiritual ── */}
            <div>
              <p className="mem-section-title">Jornada Espiritual</p>
              <div className="mem-form-section">
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">CONVERSÃO</label>
                    <DateInput className="mem-form-field" isDark={isDark}
                               value={form.dataConversao} onChange={v => f({ dataConversao: v })} />
                  </div>
                  <div>
                    <label className="mem-form-label">BATISMO (E. Santo)</label>
                    <DateInput className="mem-form-field" isDark={isDark}
                               value={form.dataBatismo} onChange={v => f({ dataBatismo: v })} />
                  </div>
                </div>

                <div className="mem-check-row">
                  <div
                      className={`mem-checkbox ${form.pertenceOutraReligiao ? "checked" : ""}`}
                      onClick={() => f({ pertenceOutraReligiao: !form.pertenceOutraReligiao, qualReligiao: !form.pertenceOutraReligiao ? form.qualReligiao : "" })}
                  >
                    {form.pertenceOutraReligiao && "✓"}
                  </div>
                  <label className="mem-checkbox-label">
                    Pertence (ou pertenceu) a outra religião?
                  </label>
                </div>

                <AnimatePresence>
                  {form.pertenceOutraReligiao && (
                      <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ overflow: "hidden" }}
                      >
                        <label className="mem-form-label">QUAL RELIGIÃO?</label>
                        <input className="mem-form-field"
                               value={form.qualReligiao} onChange={e => f({ qualReligiao: e.target.value })} />
                      </motion.div>
                  )}
                </AnimatePresence>

                <div className="mem-check-row">
                  <div
                      className={`mem-checkbox ${form.batizadoNasAguas ? "checked" : ""}`}
                      onClick={() => f({ batizadoNasAguas: !form.batizadoNasAguas })}
                  >
                    {form.batizadoNasAguas && "✓"}
                  </div>
                  <label className="mem-checkbox-label">
                    Batizado(a) nas águas?
                  </label>
                </div>

                <AnimatePresence>
                  {form.batizadoNasAguas && (
                      <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: 10 }}
                      >
                        <div>
                          <label className="mem-form-label">DATA DO BATISMO NAS ÁGUAS</label>
                          <DateInput className="mem-form-field" isDark={isDark}
                                     value={form.dataBatizadoNasAguas} onChange={v => f({ dataBatizadoNasAguas: v })} />
                        </div>
                        <div>
                          <label className="mem-form-label">NA IGREJA</label>
                          <input className="mem-form-field"
                                 value={form.igrejaBatizadoNasAguas} onChange={e => f({ igrejaBatizadoNasAguas: e.target.value })} />
                        </div>
                      </motion.div>
                  )}
                </AnimatePresence>

                <div className="mem-check-row">
                  <div
                      className={`mem-checkbox ${form.batizadoEspiritoSanto ? "checked" : ""}`}
                      onClick={() => f({ batizadoEspiritoSanto: !form.batizadoEspiritoSanto })}
                  >
                    {form.batizadoEspiritoSanto && "✓"}
                  </div>
                  <label className="mem-checkbox-label">
                    Batizado(a) no Espírito Santo?
                  </label>
                </div>
              </div>
            </div>

            {/* ── Arrolamento ── */}
            <div>
              <p className="mem-section-title">Arrolamento</p>
              <div className="mem-form-section">
                <div>
                  <label className="mem-form-label">TIPO DE ARROLAMENTO</label>
                  <select className="mem-form-field"
                          value={form.tipoArrolamento} onChange={e => f({ tipoArrolamento: e.target.value })}>
                    {tipoArrolamentoOptions.map(o =>
                        <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">ARROLADO POR</label>
                    <input className="mem-form-field"
                           value={form.arroladoPor} onChange={e => f({ arroladoPor: e.target.value })} />
                  </div>
                  <div>
                    <label className="mem-form-label">JURISDIÇÃO</label>
                    <input className="mem-form-field"
                           value={form.jurisdicaoArrolamento} onChange={e => f({ jurisdicaoArrolamento: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Observações ── */}
            <div>
              <p className="mem-section-title">Observações</p>
              <div className="mem-form-section">
                <label className="mem-form-label">OBSERVAÇÕES GERAIS</label>
                <textarea className="mem-form-textarea"
                          value={form.observacoes} onChange={e => f({ observacoes: e.target.value })}
                          placeholder="Informações adicionais..." />
              </div>
            </div>

            {/* ── Botões ── */}
            <div className="mem-form-actions" style={{ paddingTop: 8 }}>
              <button type="submit" className="mem-btn-save" disabled={loading}>
                {loading ? (
                    <><Loader2 size={14} className="dl-spin" /> Salvando...</>
                ) : (
                    <>{editandoId ? "Salvar" : "Cadastrar"}</>
                )}
              </button>
              {editandoId && (
                  <button type="button" className="mem-btn-delete" onClick={onExcluir} disabled={loading}>
                    <Trash2 size={14} /> Excluir
                  </button>
              )}
            </div>

          </form>
        </motion.div>
      </motion.div>
  );

  return createPortal(content, document.body);
}

/* ─── Componente Principal ──────────────────────────────────────── */
export default function MembrosRefatorado({ isDark = false }) {
  const [membros,        setMembros]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [editandoId,     setEditandoId]     = useState(null);
  const [filtro,         setFiltro]         = useState("");
  const [form,           setForm]           = useState(formInicial);
  const [nomeCelula,     setNomeCelula]     = useState(null);
  const [nomeLider,      setNomeLider]      = useState(null);
  const [statusOriginal, setStatusOriginal] = useState(null);
  const [salvando,       setSalvando]       = useState(false);

  const t = themeMembers(isDark);

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await api.get("/membros");
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setMembros(data);
    } catch (err) {
      console.error("Erro ao listar membros:", err);
      setMembros([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { listar(); }, [listar]);

  const abrirNovo = () => {
    setEditandoId(null); setStatusOriginal(null);
    setNomeCelula(null); setNomeLider(null);
    setForm(formInicial); setIsModalOpen(true);
  };

  const abrirEdicao = (m) => {
    setEditandoId(m.id); setStatusOriginal(m.status);
    setNomeCelula(m.nomeCelula ?? null); setNomeLider(m.nomeLider ?? null);
    setForm({
      nome:                   m.nome            ?? "",
      email:                  m.email           ?? "",
      telefone:               m.telefone        ?? "",
      cpf:                    m.cpf             ?? "",
      rg:                     m.rg              ?? "",
      estadoCivil:            m.estadoCivil     ?? "SOLTEIRO",
      status:                 m.status          ?? "ATIVO",
      celulaId:               m.celulaId        ?? null,
      dataNascimento:         formatarDataInput(m.dataNascimento),
      dataConversao:          formatarDataInput(m.dataConversao),
      dataBatismo:            formatarDataInput(m.dataBatismo),
      nomeMae:                m.nomeMae         ?? "",
      nomePai:                m.nomePai         ?? "",
      nomeConjuge:            m.nomeConjuge     ?? "",
      naturalidade:           m.naturalidade    ?? "",
      grauEscolaridade:       m.grauEscolaridade        ?? "",
      curso:                  m.curso                   ?? "",
      profissao:              m.profissao               ?? "",
      endereco:               m.endereco        ?? "",
      numero:                 m.numero          ?? "",
      bairro:                 m.bairro          ?? "",
      cidade:                 m.cidade          ?? "",
      cep:                    m.cep             ?? "",
      uf:                     m.uf              ?? "",
      pertenceOutraReligiao:  m.pertenceOutraReligiao  ?? false,
      qualReligiao:           m.qualReligiao           ?? "",
      batizadoNasAguas:       m.batizadoNasAguas       ?? false,
      dataBatizadoNasAguas:   formatarDataInput(m.dataBatizadoNasAguas),
      igrejaBatizadoNasAguas: m.igrejaBatizadoNasAguas ?? "",
      batizadoEspiritoSanto:  m.batizadoEspiritoSanto  ?? false,
      tipoArrolamento:        m.tipoArrolamento        ?? "",
      jurisdicaoArrolamento:  m.jurisdicaoArrolamento  ?? "",
      arroladoPor:            m.arroladoPor            ?? "",
      observacoes:            m.observacoes            ?? "",
    });
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false); setEditandoId(null);
    setNomeCelula(null); setNomeLider(null);
  };

  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const dados = prepararFormParaEnvio(form);
      if (editandoId) {
        if (form.status !== statusOriginal) {
          if (!window.confirm("Alterar o status removerá o membro de células. Continuar?")) {
            setSalvando(false);
            return;
          }
          await api.put(`/membros/${editandoId}/status`, null, { params: { status: form.status } });
        }
        await api.put(`/membros/${editandoId}`, dados);
      } else {
        await api.post("/membros", dados);
      }
      fecharModal(); listar();
    } catch (err) {
      const mensagem = err.response?.data?.message || err.response?.data?.error || err.message || "Erro desconhecido";
      alert(`Erro ao salvar:\n\n${mensagem}`);
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async () => {
    if (!window.confirm("Excluir permanentemente?")) return;
    setSalvando(true);
    try {
      await api.delete(`/membros/${editandoId}`);
      fecharModal(); listar();
    } catch (err) {
      const mensagem = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Erro ao excluir:\n\n${mensagem}`);
    } finally {
      setSalvando(false);
    }
  };

  const membrosFiltrados = useMemo(() =>
          membros
              .filter(m =>
                  m.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
                  m.cpf?.includes(filtro) ||
                  m.nomeCelula?.toLowerCase().includes(filtro.toLowerCase())
              )
              .sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR", { sensitivity: "base" })),
      [membros, filtro]
  );

  return (
      <div className="mem-root">
        <GlobalStylesMembers t={t} isDark={isDark} />
        <div className="mem-glow" />

        <div className="mem-content">

          {/* ── Header ── */}
          <motion.header
              className="mem-header"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4 }}
          >
            <div className="mem-header-left">
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 16,
              }}>
                <User size={20} />
              </div>
              <div className="mem-title-block">
                <p className="mem-eyebrow">Gerenciamento</p>
                <h1 className="mem-title">Membros</h1>
              </div>
            </div>
            <button className="mem-btn-gold" onClick={abrirNovo}>
              <Plus size={13} /> Novo
            </button>
          </motion.header>

          {/* ── Busca ── */}
          <motion.div
              className="mem-search-wrap"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4, delay: .08 }}
          >
            <Search className="mem-search-icon" size={16} />
            <input
                className="mem-input"
                placeholder="Buscar por nome, CPF ou célula…"
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
            />
          </motion.div>

          {/* ── Cards/Loading ── */}
          {loading ? (
              <div className="mem-loading">
                <Loader2 size={28} className="dl-spin" style={{ color: AURA.gold }} />
              </div>
          ) : membrosFiltrados.length > 0 ? (
              <motion.div
                  className="mem-grid"
                  initial="hidden" animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: .04 } } }}
              >
                {membrosFiltrados.map(m => {
                  const sc = STATUS_COLORS[m.status] || STATUS_COLORS.INATIVO;
                  return (
                      <motion.div
                          key={m.id}
                          className="mem-card"
                          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                          onClick={() => abrirEdicao(m)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: .98 }}
                      >
                        <div className="mem-card-inner">
                          <div className="mem-card-avatar">
                            {m.nome?.charAt(0).toUpperCase()}
                          </div>
                          <div className="mem-card-content">
                            <p className="mem-card-name">{m.nome?.toUpperCase()}</p>
                            <div className="mem-card-meta">
                              <span className="mem-badge" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                                {m.status}
                              </span>
                              {m.profissao && (
                                  <span className="mem-badge" style={{ background: `${AURA.gold}12`, color: AURA.gold, border: `1px solid ${AURA.gold}30` }}>
                                    {m.profissao.slice(0, 12)}
                                  </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="mem-card-arrow" size={18} />
                        </div>
                      </motion.div>
                  );
                })}
              </motion.div>
          ) : (
              <motion.div
                  className="mem-empty"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
              >
                <div className="mem-empty-icon">
                  <Users size={32} />
                </div>
                <p className="mem-empty-text">
                  {filtro ? "Nenhum membro encontrado." : "Nenhum membro cadastrado."}
                </p>
                <button className="mem-btn-gold" style={{ marginTop: 16 }} onClick={abrirNovo}>
                  <Plus size={13} /> Adicionar Membro
                </button>
              </motion.div>
          )}

        </div>

        {/* ── Modal ── */}
        <AnimatePresence>
          {isModalOpen && (
              <MembroModalRefatorado
                  isDark={isDark}
                  editandoId={editandoId}
                  form={form}
                  setForm={setForm}
                  onSalvar={salvar}
                  onExcluir={excluir}
                  onFechar={fecharModal}
                  nomeCelula={nomeCelula}
                  nomeLider={nomeLider}
                  loading={salvando}
              />
          )}
        </AnimatePresence>

      </div>
  );
}
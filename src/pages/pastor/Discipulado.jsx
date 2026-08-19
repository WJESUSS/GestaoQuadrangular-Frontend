import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api.js";
import {
  Search, Calendar, Download, X, Users,
  Loader2, ChevronRight, RefreshCw, Filter,
  CheckCircle2, AlertCircle, BookOpen,
  ChevronLeft, ChevronDown, ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── Paleta ───────────────────────────────────────────────────────────── */
const AURA = {
  gold:       "#C9A96E",
  goldLight:  "#E8D5A3",
  red:        "#C8102E",
  redDark:    "#9B0B1E",
  blue:       "#003DA5",
  blueDark:   "#002470",
  yellow:     "#FDB813",
  yellowDark: "#C48C00",
  green:      "#16a34a",
};

function theme(isDark) {
  return {
    bg:          isDark ? "#0A0A0F"               : "#F5F0E8",
    bgEl:        isDark ? "rgba(18,18,26,.97)"    : "rgba(255,255,255,.97)",
    bgInput:     isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.1)"  : "rgba(201,169,110,.2)",
    borderInput: isDark ? "rgba(201,169,110,.18)" : "rgba(201,169,110,.3)",
    text:        isDark ? "#F5F0E8"               : "#1A1008",
    textSec:     isDark ? "#9A9588"               : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"               : "#9A9080",
    glow1:       isDark ? "rgba(201,169,110,.05)" : "rgba(201,169,110,.08)",
    glow2:       isDark ? "rgba(201,169,110,.04)" : "rgba(201,169,110,.06)",
    placeholder: isDark ? "rgba(154,149,136,.35)" : "rgba(107,94,74,.35)",
    rowHov:      isDark ? "rgba(201,169,110,.04)" : "rgba(201,169,110,.05)",
    warnBg:      isDark ? "rgba(253,184,19,.07)"  : "rgba(253,184,19,.06)",
  };
}

/* ─── Config ───────────────────────────────────────────────────────────── */
const COLUNAS = [
  { campo: "escolaBiblica", label: "EBD",        justField: "justEscolaBiblica" },
  { campo: "quartaNoite",   label: "4ª Noite",   justField: "justQuartaNoite"   },
  { campo: "quintaNoite",   label: "5ª Noite",   justField: "justQuintaNoite"   },
  { campo: "domingoManha",  label: "Dom. Manhã", justField: "justDomingoManha"  },
  { campo: "domingoNoite",  label: "Dom. Noite", justField: "justDomingoNoite"  },
];

const JUST_CONFIG = {
  Trabalho: { emoji: "💼", color: "#6366F1", bg: "rgba(99,102,241,.1)",  border: "rgba(99,102,241,.28)" },
  Doença:   { emoji: "🤒", color: "#DC2626", bg: "rgba(220,38,38,.1)",   border: "rgba(220,38,38,.28)"  },
  Viagem:   { emoji: "✈️", color: "#0891B2", bg: "rgba(8,145,178,.1)",   border: "rgba(8,145,178,.28)"  },
  Outro:    { emoji: "📝", color: AURA.yellowDark, bg: "rgba(217,119,6,.1)", border: "rgba(217,119,6,.28)" },
};

const PAGE_SIZES = [6, 12, 24];

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function formatarSemana(inicio, fim) {
  if (!inicio || !fim) return "Período indefinido";
  const f = d => { const [, m, dia] = d.split("-"); return `${dia}/${m}`; };
  return `${f(inicio)} → ${f(fim)}`;
}

function obterSemanaAtual() {
  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0=dom, 1=seg ... 6=sab

  const dom = new Date(hoje);
  dom.setDate(hoje.getDate() - diaSemana); // vai para o domingo da semana atual

  const sab = new Date(dom);
  sab.setDate(dom.getDate() + 6); // domingo + 6 = sábado

  return {
    inicio: dom.toISOString().split("T")[0],
    fim:    sab.toISOString().split("T")[0],
  };
}

function frequencia(presencas = []) {
  if (!presencas.length) return 0;
  const total    = presencas.length * COLUNAS.length;
  const presentes = presencas.reduce(
      (acc, p) => acc + COLUNAS.filter(c => p[c.campo]).length,
      0,
  );
  return Math.round((presentes / total) * 100);
}

/* ─── Sub-componentes ──────────────────────────────────────────────────── */
function CelulaPresenca({ membro, coluna, isDark, t }) {
  const marcado = membro[coluna.campo];
  const justval = membro[coluna.justField];
  const cfg     = JUST_CONFIG[justval] || {
    emoji: "📝", color: AURA.gold,
    bg:    `${AURA.gold}15`, border: `${AURA.gold}30`,
  };

  return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "5px 2px" }}>
        {marcado
            ? <CheckCircle2 size={17} style={{ color: AURA.green }} />
            : <X size={14} style={{ color: isDark ? "rgba(255,255,255,.15)" : "rgba(26,16,8,.15)" }} />
        }
        {!marcado && justval && (
            <span style={{
              fontSize: 8, color: cfg.color, fontWeight: 600,
              padding: "2px 5px", background: cfg.bg,
              borderRadius: 5, border: `1px solid ${cfg.border}`,
              maxWidth: 58, whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
            }}>
          {cfg.emoji} {justval}
        </span>
        )}
      </div>
  );
}

/* barra de frequência inline */
function FreqBar({ pct }) {
  const color = pct === 100 ? AURA.green : pct >= 60 ? AURA.gold : AURA.red;
  return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          height: 4, width: 52, borderRadius: 99,
          background: "rgba(128,128,128,.15)", overflow: "hidden",
        }}>
          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: color, transition: "width .4s" }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color, minWidth: 30 }}>{pct}%</span>
      </div>
  );
}

/* paginação */
function Paginacao({ page, totalPages, onChange, t, totalItems, pageSize }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 1; // vizinhos de cada lado
  for (let i = 0; i < totalPages; i++) {
    if (
        i === 0 ||
        i === totalPages - 1 ||
        (i >= page - delta && i <= page + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const inicio = page * pageSize + 1;
  const fim    = Math.min((page + 1) * pageSize, totalItems);

  return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 10, marginTop: 20,
      }}>
        {/* info */}
        <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 500 }}>
        Exibindo {inicio}–{fim} de {totalItems}
      </span>

        {/* botões */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button
              onClick={() => onChange(page - 1)}
              disabled={page === 0}
              style={pagBtnStyle(false, false, t)}
              aria-label="Página anterior"
          >
            <ChevronLeft size={14} />
          </button>

          {pages.map((p, i) =>
              p === "..." ? (
                  <span key={`e${i}`} style={{ color: t.textMuted, fontSize: 12, padding: "0 4px" }}>…</span>
              ) : (
                  <button
                      key={p}
                      onClick={() => onChange(p)}
                      style={pagBtnStyle(p === page, false, t)}
                      aria-label={`Página ${p + 1}`}
                      aria-current={p === page ? "page" : undefined}
                  >
                    {p + 1}
                  </button>
              )
          )}

          <button
              onClick={() => onChange(page + 1)}
              disabled={page >= totalPages - 1}
              style={pagBtnStyle(false, false, t)}
              aria-label="Próxima página"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
  );
}

function pagBtnStyle(active, disabled, t) {
  return {
    width: 34, height: 34, borderRadius: 8,
    border: active ? "none" : `1px solid ${t.border}`,
    background: active
        ? `linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue})`
        : "transparent",
    color:    active ? "#fff" : t.textMuted,
    cursor:   disabled ? "not-allowed" : "pointer",
    opacity:  disabled ? .35 : 1,
    display:  "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 600,
    transition: "all .2s",
  };
}

/* ─── estilos th ────────────────────────────────────────────────────────── */
function thStyle(t, align = "left") {
  return {
    padding: "11px 8px", textAlign: align,
    fontSize: 9, fontWeight: 700, letterSpacing: ".12em",
    color: t.textMuted, borderBottom: `1px solid ${t.border}`,
    whiteSpace: "nowrap",
  };
}

/* ─── Modal de detalhe (versão responsiva, rola como bloco único) ──────── */
function ModalRelatorio({ rel, isDark, t, onClose, onPDF }) {
  if (!rel) return null;
  const presencas = rel.presencas || [];
  const pct       = frequencia(presencas);
  const freqColor = pct >= 70 ? AURA.green : pct >= 50 ? AURA.gold : AURA.red;

  return (
      <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: .25 }}
          className="disc-modal-overlay"
          onClick={onClose}
      >
        <motion.div
            initial={{ y: 18, opacity: 0, scale: .96 }}
            animate={{ y: 0,  opacity: 1, scale: 1   }}
            exit={{    y: 12, opacity: 0, scale: .97 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, mass: .8 }}
            onClick={e => e.stopPropagation()}
            className="disc-modal"
            style={{
              boxShadow: isDark
                  ? "0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(201,169,110,.06)"
                  : "0 40px 100px rgba(26,16,8,.18), 0 0 0 1px rgba(201,169,110,.08)",
            }}
        >
          {/* fio dourado no topo, como nos cards */}
          <div style={{ height: 3, background: `linear-gradient(90deg, ${AURA.blue}, ${AURA.gold})`, flexShrink: 0 }} />

          {/* Header */}
          <div className="disc-modal-header">
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                background: `linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 8px 20px ${AURA.blue}35`,
              }}>
                <BookOpen size={20} style={{ color: "#fff" }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontSize: 9, letterSpacing: ".16em", fontWeight: 700,
                  color: `${AURA.gold}99`, margin: "0 0 4px", textTransform: "uppercase",
                }}>
                  {rel.nomeCelula}
                </p>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 500,
                  color: t.text, margin: "0 0 5px", lineHeight: 1.2,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {rel.nomeLider}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={12} style={{ color: t.textMuted, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, fontWeight: 300, color: t.textSec, margin: 0 }}>
                    {formatarSemana(rel.dataInicio, rel.dataFim)}
                  </p>
                </div>
              </div>
            </div>

            <button
                onClick={onClose}
                style={{
                  background: t.bgInput, border: `1px solid ${t.border}`,
                  color: t.textSec, padding: 9, borderRadius: 11, cursor: "pointer",
                  display: "flex", flexShrink: 0, transition: "all .2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${AURA.red}50`; e.currentTarget.style.color = AURA.red; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSec; }}
                aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          {/* KPIs — cartões soltos com respiro */}
          <div className="disc-kpis">
            {[
              { label: "Membros",   value: presencas.length, color: t.text, icon: Users },
              { label: "Presentes", value: presencas.filter(p => COLUNAS.some(c => p[c.campo])).length, color: AURA.green, icon: CheckCircle2 },
              { label: "Frequência",value: `${pct}%`, color: freqColor, icon: null },
            ].map((k, i) => (
                <div key={i} style={{
                  padding: "14px 12px", borderRadius: 14,
                  background: t.bgInput, border: `1px solid ${t.border}`,
                  display: "flex", flexDirection: "column", gap: 6, minWidth: 0,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 9, letterSpacing: ".1em", color: t.textMuted, fontWeight: 700, textTransform: "uppercase" }}>
                      {k.label}
                    </span>
                    {k.icon && <k.icon size={12} style={{ color: k.color, opacity: .6 }} />}
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 700, color: k.color, margin: 0, lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                    {k.value}
                  </p>
                </div>
            ))}
          </div>

          {/* Tabela — sem altura máxima fixa; rola junto com o modal inteiro */}
          <div className="disc-modal-table-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}>
              <thead>
              <tr style={{
                background: isDark ? "rgba(255,255,255,.025)" : "rgba(201,169,110,.045)",
                position: "sticky", top: 0, zIndex: 1,
              }}>
                <th style={thStyle(t, "left")}>Membro</th>
                {COLUNAS.map(c => (
                    <th key={c.campo} style={thStyle(t, "center")}>{c.label}</th>
                ))}
                <th style={thStyle(t, "center")}>Freq.</th>
              </tr>
              </thead>
              <tbody>
              {presencas.map((p, i) => {
                const tot = COLUNAS.filter(c => p[c.campo]).length;
                const pctM = Math.round((tot / COLUNAS.length) * 100);
                return (
                    <tr
                        key={i}
                        style={{ borderBottom: `1px solid ${t.border}`, transition: "background .15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = t.rowHov}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                            background: `linear-gradient(135deg,${AURA.blue}22,${AURA.gold}16)`,
                            border: `1px solid ${AURA.gold}22`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: AURA.gold,
                          }}>
                            {p.nomeMembro?.charAt(0) || "?"}
                          </div>
                          <span style={{ fontSize: 13.5, fontWeight: 500, color: t.text }}>{p.nomeMembro}</span>
                        </div>
                      </td>
                      {COLUNAS.map(col => (
                          <td key={col.campo} style={{ textAlign: "center", padding: "2px 4px" }}>
                            <CelulaPresenca membro={p} coluna={col} isDark={isDark} t={t} />
                          </td>
                      ))}
                      <td style={{ textAlign: "center", padding: "6px 12px" }}>
                        <FreqBar pct={pctM} />
                      </td>
                    </tr>
                );
              })}
              {presencas.length === 0 && (
                  <tr>
                    <td colSpan={COLUNAS.length + 2} style={{
                      padding: 40, textAlign: "center",
                      fontSize: 13, fontStyle: "italic", color: t.textMuted,
                    }}>
                      Nenhuma presença registrada.
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>

          {/* Rodapé — duas ações lado a lado (empilha em telas muito pequenas) */}
          <div className="disc-modal-footer">
            <button
                onClick={onClose}
                style={{
                  flex: 1, padding: "12px", borderRadius: 100,
                  border: `1px solid ${t.border}`, cursor: "pointer",
                  background: "transparent", color: t.textSec,
                  fontSize: 11, fontWeight: 600, letterSpacing: ".12em",
                  textTransform: "uppercase", transition: "all .2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = t.textMuted; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; }}
            >
              Fechar
            </button>
            <button
                onClick={() => onPDF(rel)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "12px", borderRadius: 100, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg, ${AURA.yellowDark}, ${AURA.gold})`,
                  color: "#241A00", fontSize: 11, fontWeight: 700, letterSpacing: ".12em",
                  textTransform: "uppercase", transition: "opacity .2s, transform .2s",
                  boxShadow: `0 8px 22px ${AURA.gold}35`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Download size={13} /> Exportar PDF
            </button>
          </div>
        </motion.div>
      </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════════════════ */
export default function Discipulado({ isDark = false }) {
  const [relatorios,  setRelatorios]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [erro,        setErro]        = useState(null);
  const [busca,       setBusca]       = useState("");
  const [dataInicio,  setDataInicio]  = useState("");
  const [dataFim,     setDataFim]     = useState("");
  const [selected,    setSelected]    = useState(null);
  const [showFilter,  setShowFilter]  = useState(false);

  /* paginação */
  const [page,     setPage]     = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]); // 6 por padrão

  const t = theme(isDark);

  /* ── CSS inline ─────────────────────────────────────────────────────── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
    @keyframes aura-spin  { to { transform: rotate(360deg); } }
    @keyframes aura-pulse { 0%,100%{opacity:.2} 50%{opacity:.05} }
    @keyframes blink      { 0%,100%{opacity:1}  50%{opacity:.3}  }
    *, *::before, *::after { box-sizing: border-box; }

    .disc-root {
      min-height: 100vh;
      background: ${t.bg};
      color: ${t.text};
      font-family: 'Inter', sans-serif;
      padding-bottom: max(48px, env(safe-area-inset-bottom, 48px));
      -webkit-overflow-scrolling: touch;
    }
    .disc-glow {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background:
        radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
        radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%);
    }
    .disc-wrap {
      position: relative; z-index: 1;
      max-width: 1100px; margin: 0 auto;
      padding: 20px 16px 0;
    }
    @media (min-width: 640px) { .disc-wrap { padding: 28px 24px 0; } }

    /* inputs */
    .disc-input {
      width: 100%;
      background: ${t.bgInput}; border: 1px solid ${t.borderInput};
      color: ${t.text}; padding: 11px 14px 11px 40px;
      border-radius: 11px; outline: none;
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
      transition: border-color .25s;
      -webkit-appearance: none;
    }
    .disc-input:focus { border-color: ${AURA.gold}80; }
    .disc-input::placeholder { color: ${t.placeholder}; }

    .disc-date {
      flex: 1; min-width: 130px;
      background: ${t.bgInput}; border: 1px solid ${t.borderInput};
      color: ${t.text}; padding: 10px 12px;
      border-radius: 11px; outline: none;
      font-family: 'Inter', sans-serif; font-size: 13px;
      transition: border-color .25s; -webkit-appearance: none;
    }
    .disc-date:focus { border-color: ${AURA.gold}80; }

    /* grid de cards */
    .disc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 12px;
    }
    @media (max-width: 480px) { .disc-grid { grid-template-columns: 1fr; } }

    /* card */
    .disc-card {
      background: ${t.bgEl}; border: 1px solid ${t.border};
      border-radius: 18px; overflow: hidden; cursor: pointer;
      transition: transform .25s, border-color .25s, box-shadow .25s;
      -webkit-tap-highlight-color: transparent;
      position: relative;
    }
    .disc-card:hover {
      transform: translateY(-4px);
      border-color: ${AURA.gold}55;
      box-shadow: 0 12px 32px rgba(0,0,0,${isDark ? .35 : .1});
    }
    .disc-card:active { transform: scale(.98); }

    /* botões */
    .disc-btn-ghost {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 0 14px; height: 36px; border-radius: 100px;
      border: 1px solid ${t.border}; cursor: pointer;
      background: transparent; color: ${t.textSec};
      font-family: 'Inter', sans-serif; font-size: 10px;
      font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
      transition: border-color .2s, color .2s; white-space: nowrap;
    }
    .disc-btn-ghost:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

    .disc-btn-blue {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 0 16px; height: 36px; border-radius: 100px; border: none;
      cursor: pointer;
      background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue});
      color: #fff; font-family: 'Inter', sans-serif;
      font-size: 10px; font-weight: 600; letter-spacing: .12em;
      text-transform: uppercase; transition: opacity .2s, transform .2s;
      box-shadow: 0 5px 18px ${AURA.blue}40; white-space: nowrap;
    }
    .disc-btn-blue:hover   { opacity: .9; transform: translateY(-1px); }
    .disc-btn-blue:disabled { opacity: .4; cursor: not-allowed; }

    /* select page size */
    .disc-select {
      background: ${t.bgInput}; border: 1px solid ${t.borderInput};
      color: ${t.text}; padding: 6px 10px; border-radius: 8px;
      font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500;
      cursor: pointer; outline: none; -webkit-appearance: none; appearance: none;
    }

    /* divider */
    .disc-div {
      height: 1px;
      background: linear-gradient(90deg, transparent, ${AURA.gold}50, transparent);
      margin: 18px 0;
    }

    /* ── Modal responsivo ──────────────────────────────────────────────
       O overlay é o ÚNICO elemento com scroll (overflow-y: auto).
       O modal em si não tem altura/scroll próprio, por isso nada fica
       "preso" dentro de uma área pequena no celular — o dedo sempre
       rola a página toda até o fim, incluindo os botões do rodapé.  */
    .disc-modal-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(8,8,12,.72);
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
      display: flex; align-items: flex-start; justify-content: center;
      padding: env(safe-area-inset-top, 16px) 0 0;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .disc-modal {
      width: 100%; max-width: 820px; margin: 0 auto;
      background: ${t.bgEl}; border: 1px solid ${t.border};
      overflow: hidden; display: flex; flex-direction: column;
      min-height: 100%;
    }
    @media (min-width: 640px) {
      .disc-modal-overlay { padding: env(safe-area-inset-top, 24px) 16px 24px; }
      .disc-modal { border-radius: 24px; min-height: auto; margin-top: 3vh; }
    }
    .disc-modal-header {
      padding: 18px 16px 16px;
      display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
      border-bottom: 1px solid ${t.border};
    }
    @media (min-width: 640px) { .disc-modal-header { padding: 22px 26px 20px; } }

    .disc-kpis {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
      padding: 14px 16px; border-bottom: 1px solid ${t.border};
    }
    @media (min-width: 640px) { .disc-kpis { gap: 10px; padding: 18px 26px; } }
    @media (max-width: 380px) {
      .disc-kpis { grid-template-columns: 1fr 1fr; }
      .disc-kpis > div:last-child { grid-column: 1 / -1; }
    }

    /* Tabela: só rola na horizontal (para caber as colunas em telas
       estreitas). A rolagem vertical é a do overlay inteiro. */
    .disc-modal-table-wrap {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .disc-modal-footer {
      display: flex; gap: 10px; padding: 16px;
      border-top: 1px solid ${t.border};
      margin-top: auto;
    }
    @media (min-width: 640px) { .disc-modal-footer { padding: 18px 26px; } }
    @media (max-width: 400px) { .disc-modal-footer { flex-direction: column; } }
  `;

  /* ── fetch ──────────────────────────────────────────────────────────── */
  const carregarRelatorios = useCallback(async () => {
    try {
      setLoading(true); setErro(null);
      const res = await api.get("/relatorios/todos-relatorios");
      setRelatorios(Array.isArray(res.data) ? res.data : []);
      setPage(0); // volta à 1ª página ao recarregar
    } catch (e) {
      setErro({ status: e.response?.status, msg: "Não foi possível carregar os relatórios." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sem = obterSemanaAtual();
    setDataInicio(sem.inicio);
    setDataFim(sem.fim);
    carregarRelatorios();
  }, [carregarRelatorios]);

  /* ── filtro (client-side) ───────────────────────────────────────────── */
  const filtrados = useMemo(() => {
    setPage(0); // reset ao mudar filtros
    return relatorios.filter(rel => {
      const b  = busca.toLowerCase();
      const ok = !b
          || rel.nomeLider?.toLowerCase().includes(b)
          || rel.nomeCelula?.toLowerCase().includes(b);
      let p = true;
      if (dataInicio) p = p && rel.dataFim   >= dataInicio;
      if (dataFim)    p = p && rel.dataInicio <= dataFim;
      return ok && p;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relatorios, busca, dataInicio, dataFim]);

  /* ── paginação ──────────────────────────────────────────────────────── */
  const totalPages  = Math.ceil(filtrados.length / pageSize);
  const safePage    = Math.min(page, Math.max(totalPages - 1, 0));
  const paginaAtual = filtrados.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const irPara = (p) => {
    setPage(p);
    // scroll suave ao topo do grid em mobile
    document.getElementById("disc-grid-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const mudarTamanho = (novoSize) => {
    setPageSize(novoSize);
    setPage(0);
  };

  /* ── PDF individual ─────────────────────────────────────────────────── */
  const gerarPDF = (rel) => {
    const doc = new jsPDF();
    doc.setFillColor(0, 36, 112); doc.rect(0, 0, 210, 36, "F");
    doc.setFontSize(15); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
    doc.text("IEQ PITUAÇU — DISCIPULADO", 14, 14);
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`Célula: ${rel.nomeCelula}  |  Líder: ${rel.nomeLider}`, 14, 22);
    doc.text(`Período: ${formatarSemana(rel.dataInicio, rel.dataFim)}`, 14, 29);
    doc.setTextColor(0);
    autoTable(doc, {
      startY: 42,
      head:   [["Membro", ...COLUNAS.map(c => c.label), "Total"]],
      body:   (rel.presencas || []).map(p => {
        const row = [p.nomeMembro];
        COLUNAS.forEach(col => {
          const m = !!p[col.campo]; const j = p[col.justField]?.trim();
          row.push(m ? "P" : j ? `F(${j})` : "F");
        });
        row.push(`${COLUNAS.filter(c => !!p[c.campo]).length}/${COLUNAS.length}`);
        return row;
      }),
      headStyles: { fillColor: [0, 36, 112], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 }, theme: "grid",
      didParseCell(d) {
        if (d.section === "body" && d.column.index > 0 && d.column.index < 6) {
          const v = d.cell.raw;
          if (v === "P")                          { d.cell.styles.textColor = [22, 163, 74];  d.cell.styles.fontStyle = "bold"; }
          else if (typeof v === "string" && v.startsWith("F(")) { d.cell.styles.textColor = [234, 179, 8]; }
          else if (v === "F")                     { d.cell.styles.textColor = [200, 16, 46]; }
        }
      },
    });
    doc.save(`Discipulado_${rel.nomeCelula}_${rel.dataInicio}.pdf`);
  };

  /* ── PDF geral ──────────────────────────────────────────────────────── */
  const gerarPDFGeral = () => {
    if (!filtrados.length) return;
    const doc = new jsPDF("l", "mm", "a4");
    doc.setFillColor(0, 36, 112); doc.rect(0, 0, 297, 40, "F");
    doc.setFontSize(17); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
    doc.text("IEQ PITUAÇU — DISCIPULADO GERAL", 14, 16);
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`Período: ${formatarSemana(dataInicio, dataFim)}  |  Células: ${filtrados.length}`, 14, 26);
    let y = 50;
    filtrados.forEach((rel, idx) => {
      if (y > 170) { doc.addPage(); y = 20; }
      doc.setFillColor(9, 11, 31); doc.roundedRect(14, y - 4, 269, 10, 2, 2, "F");
      doc.setFontSize(10); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${rel.nomeCelula}  |  ${rel.nomeLider}`, 17, y + 3);
      autoTable(doc, {
        startY: y + 8,
        head:   [["Membro", ...COLUNAS.map(c => c.label.substring(0, 6)), "Total"]],
        body:   (rel.presencas || []).map(p => {
          const row = [p.nomeMembro];
          COLUNAS.forEach(col => {
            const m = !!p[col.campo]; const j = p[col.justField]?.trim();
            row.push(m ? "P" : j ? `F(${j})` : "F");
          });
          row.push(`${COLUNAS.filter(c => !!p[c.campo]).length}/${COLUNAS.length}`);
          return row;
        }),
        headStyles: { fillColor: [9, 11, 31], textColor: 255, fontSize: 7 },
        bodyStyles: { fontSize: 7 }, theme: "grid",
        didParseCell(d) {
          if (d.section === "body" && d.column.index > 0 && d.column.index < 6) {
            const v = d.cell.raw;
            if (v === "P")                          { d.cell.styles.textColor = [22, 163, 74];  d.cell.styles.fontStyle = "bold"; }
            else if (typeof v === "string" && v.startsWith("F(")) { d.cell.styles.textColor = [234, 179, 8]; }
            else if (v === "F")                     { d.cell.styles.textColor = [200, 16, 46]; }
          }
        },
      });
      y = doc.lastAutoTable.finalY + 14;
    });
    doc.save("Discipulado_Geral.pdf");
  };

  /* ── Loading ────────────────────────────────────────────────────────── */
  if (loading) return (
      <div style={{
        minHeight: "60vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", background: t.bg,
      }}>
        <style>{css}</style>
        <div style={{ position: "relative", display: "inline-flex", marginBottom: 20 }}>
          <div style={{
            position: "absolute", width: 80, height: 80, top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            border: "1px solid rgba(201,169,110,.25)", borderRadius: "50%",
            animation: "aura-pulse 3s ease-in-out infinite",
          }} />
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: isDark ? "rgba(18,18,26,.99)" : "#fff",
            border: "1.5px solid rgba(201,169,110,.28)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BookOpen size={24} style={{ color: AURA.gold }} />
          </div>
        </div>
        <p style={{
          fontSize: 9, fontWeight: 600, letterSpacing: ".25em",
          textTransform: "uppercase", color: AURA.gold, opacity: .7,
        }}>
          Carregando discipulado…
        </p>
      </div>
  );

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
      <div className="disc-root">
        <style>{css}</style>
        <div className="disc-glow" />

        <div className="disc-wrap">

          {/* ── Header ── */}
          <motion.div
              initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .35 }}
              style={{
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20,
              }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 11,
                background: `${AURA.blue}18`, border: `1px solid ${AURA.blue}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <BookOpen size={20} style={{ color: AURA.blue }} />
              </div>
              <div>
                <p style={{
                  fontSize: 9, letterSpacing: ".2em", fontWeight: 600,
                  color: `${AURA.gold}88`, margin: "0 0 3px", textTransform: "uppercase",
                }}>
                  Controle & Auditoria
                </p>
                <h2 style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(17px,4vw,23px)",
                  fontWeight: 500, margin: 0, color: t.text,
                }}>
                  Discipulado
                </h2>
              </div>
            </div>

            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              <button className="disc-btn-ghost" onClick={() => setShowFilter(s => !s)}>
                <Filter size={13} /> {showFilter ? "Ocultar" : "Filtrar"}
              </button>
              <button className="disc-btn-ghost" onClick={carregarRelatorios}>
                <RefreshCw size={13} />
                <span className="disc-hide-xs">Atualizar</span>
              </button>
              <button className="disc-btn-blue" onClick={gerarPDFGeral} disabled={!filtrados.length}>
                <Download size={13} />
                <span className="disc-hide-xs">Exportar PDF</span>
              </button>
            </div>
          </motion.div>

          <div className="disc-div" />

          {/* ── Erro ── */}
          {erro && (
              <div style={{
                padding: "14px 16px", borderRadius: 13, marginBottom: 18,
                background: `${AURA.red}10`, border: `1px solid ${AURA.red}28`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <AlertCircle size={15} style={{ color: AURA.red, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: AURA.red, margin: 0 }}>
                  {erro.msg} {erro.status ? `(status ${erro.status})` : ""}
                </p>
              </div>
          )}

          {/* ── Painel de filtros ── */}
          <AnimatePresence>
            {showFilter && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: .22 }}
                    style={{ overflow: "hidden", marginBottom: 18 }}
                >
                  <div style={{
                    background: t.bgEl, border: `1px solid ${t.border}`,
                    borderRadius: 16, padding: "16px 16px",
                    display: "flex", flexDirection: "column", gap: 12,
                  }}>
                    {/* busca */}
                    <div style={{ position: "relative" }}>
                      <Search size={14} style={{
                        position: "absolute", left: 13, top: "50%",
                        transform: "translateY(-50%)", color: AURA.gold, opacity: .5, pointerEvents: "none",
                      }} />
                      <input
                          className="disc-input"
                          placeholder="Buscar por líder ou célula…"
                          value={busca}
                          onChange={e => setBusca(e.target.value)}
                      />
                    </div>

                    {/* datas */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 9, letterSpacing: ".14em", color: t.textMuted, whiteSpace: "nowrap" }}>DE</span>
                      <input className="disc-date" type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                      <span style={{ fontSize: 9, letterSpacing: ".14em", color: t.textMuted, whiteSpace: "nowrap" }}>ATÉ</span>
                      <input className="disc-date" type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                      <button
                          className="disc-btn-ghost"
                          onClick={() => {
                            const s = obterSemanaAtual();
                            setDataInicio(s.inicio); setDataFim(s.fim); setBusca("");
                          }}
                      >
                        Esta semana
                      </button>
                      {(busca || dataInicio || dataFim) && (
                          <button
                              className="disc-btn-ghost"
                              onClick={() => { setBusca(""); setDataInicio(""); setDataFim(""); }}
                              style={{ color: AURA.red, borderColor: `${AURA.red}40` }}
                          >
                            <X size={12} /> Limpar
                          </button>
                      )}
                    </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* ── Barra de estado: contador + controle de tamanho de página ── */}
          <div
              id="disc-grid-anchor"
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: 10, marginBottom: 14,
              }}
          >
            {/* badge contador */}
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "6px 13px",
              background: `${AURA.blue}14`, border: `1px solid ${AURA.blue}30`,
              borderRadius: 10,
            }}>
              <BookOpen size={12} style={{ color: AURA.blue }} />
              <span style={{ fontSize: 9, letterSpacing: ".14em", color: AURA.blue, fontWeight: 700 }}>
              {filtrados.length} RELATÓRIO{filtrados.length !== 1 ? "S" : ""}
            </span>
            </div>

            {/* itens por página */}
            {filtrados.length > PAGE_SIZES[0] && (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 11, color: t.textMuted, whiteSpace: "nowrap" }}>Por página:</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {PAGE_SIZES.map(s => (
                        <button
                            key={s}
                            onClick={() => mudarTamanho(s)}
                            style={{
                              width: 32, height: 28, borderRadius: 7,
                              border: `1px solid ${pageSize === s ? AURA.blue : t.border}`,
                              background: pageSize === s ? `${AURA.blue}18` : "transparent",
                              color: pageSize === s ? AURA.blue : t.textMuted,
                              fontSize: 11, fontWeight: 600, cursor: "pointer",
                              transition: "all .2s",
                            }}
                        >
                          {s}
                        </button>
                    ))}
                  </div>
                </div>
            )}
          </div>

          {/* ── Grid de cards ── */}
          <div className="disc-grid">
            <AnimatePresence mode="popLayout">
              {paginaAtual.map((rel, i) => {
                const pct = frequencia(rel.presencas);
                const freqColor = pct >= 70 ? AURA.green : pct >= 50 ? AURA.gold : AURA.red;

                return (
                    <motion.div
                        key={`${rel.id}-${safePage}`}
                        className="disc-card"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: .96 }}
                        transition={{ delay: i * .04 }}
                        onClick={() => setSelected(rel)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === "Enter" && setSelected(rel)}
                        aria-label={`Ver detalhes de ${rel.nomeCelula}`}
                    >
                      {/* faixa topo */}
                      <div style={{ height: 3, background: `linear-gradient(90deg, ${AURA.blue}, ${AURA.gold})` }} />

                      <div style={{ padding: "16px 16px 0" }}>
                        {/* badge célula + seta */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <span style={{
                        background: `${AURA.blue}16`, color: AURA.blue,
                        border: `1px solid ${AURA.blue}30`, borderRadius: 99,
                        padding: "3px 9px", fontSize: 8, fontWeight: 700, letterSpacing: ".1em",
                        maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {rel.nomeCelula}
                      </span>
                          <ChevronRight size={14} style={{ color: t.textMuted, flexShrink: 0 }} />
                        </div>

                        {/* líder */}
                        <h3 style={{
                          fontSize: 14, fontWeight: 700, color: t.text,
                          margin: "0 0 8px",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {rel.nomeLider}
                        </h3>

                        {/* semana */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                          <Calendar size={11} style={{ color: AURA.gold, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 300, color: t.textSec }}>
                        {formatarSemana(rel.dataInicio, rel.dataFim)}
                      </span>
                        </div>
                      </div>

                      {/* footer do card */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px solid ${t.border}` }}>
                        {/* membros */}
                        <div style={{ padding: "10px 12px", textAlign: "center", borderRight: `1px solid ${t.border}` }}>
                          <p style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: 0, lineHeight: 1 }}>
                            {rel.presencas?.length || 0}
                          </p>
                          <p style={{ fontSize: 8, letterSpacing: ".1em", color: t.textMuted, margin: "3px 0 0" }}>MEMBROS</p>
                        </div>
                        {/* frequência */}
                        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: freqColor, lineHeight: 1 }}>{pct}%</span>
                          <span style={{ fontSize: 8, letterSpacing: ".1em", color: t.textMuted }}>FREQUÊNCIA</span>
                        </div>
                      </div>
                    </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ── Vazio ── */}
          {!erro && filtrados.length === 0 && (
              <div style={{
                textAlign: "center", padding: "52px 24px",
                background: t.bgEl, borderRadius: 20,
                border: `2px dashed ${t.border}`, marginTop: 12,
              }}>
                <AlertCircle size={34} style={{ color: `${AURA.gold}40`, margin: "0 auto 12px" }} />
                <p style={{ fontSize: 13, fontWeight: 300, color: t.textMuted, margin: 0 }}>
                  Nenhum relatório encontrado.
                </p>
                {(busca || dataInicio || dataFim) && (
                    <button
                        className="disc-btn-ghost"
                        style={{ margin: "12px auto 0" }}
                        onClick={() => { setBusca(""); setDataInicio(""); setDataFim(""); }}
                    >
                      <X size={12} /> Limpar filtros
                    </button>
                )}
              </div>
          )}

          {/* ── Paginação ── */}
          <Paginacao
              page={safePage}
              totalPages={totalPages}
              onChange={irPara}
              t={t}
              totalItems={filtrados.length}
              pageSize={pageSize}
          />

          {/* footer */}
          <div className="disc-div" style={{ marginTop: 28 }} />
          <p style={{
            textAlign: "center", fontSize: 9, letterSpacing: ".18em",
            textTransform: "uppercase", paddingBottom: 16,
            color: isDark ? "rgba(245,240,232,.1)" : "rgba(26,16,8,.12)",
          }}>

          </p>
        </div>

        {/* ── Modal ── */}
        <AnimatePresence>
          {selected && (
              <ModalRelatorio
                  rel={selected} isDark={isDark} t={t}
                  onClose={() => setSelected(null)}
                  onPDF={gerarPDF}
              />
          )}
        </AnimatePresence>
      </div>
  );
}
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Filter, ChevronLeft, ChevronRight, X,
    Shield, RefreshCw, AlertTriangle,
    Edit3, Trash2, CheckCircle, XCircle, PlusCircle, Eye,
    ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import api from "../../services/api.js";

/* ─── Tokens AURA ─────────────────────────────────────────────────────── */
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

function GlobalStyles({ t, isDark }) {
    return (
        <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes dl-spin   { to { transform: rotate(360deg); } }
      @keyframes dl-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes fadeUp    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

      .dl-spin   { animation: dl-spin  1s linear infinite; }
      .dl-pulse  { animation: dl-pulse 3s ease-in-out infinite; }
      .fadeUp    { animation: fadeUp .5s ease; }

      * { box-sizing: border-box; }

      .aud-root {
        font-family: 'Inter', sans-serif;
        background: ${t.bg};
        color: ${t.text};
        padding-bottom: 40px;
        transition: background .3s, color .3s;
      }

      .aud-glow {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
          radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%);
        transition: background .3s;
      }

      .aud-content {
        position: relative; z-index: 1;
        max-width: 1200px; margin: 0 auto;
        padding: 0 18px;
      }
      @media(max-width: 420px) { .aud-content { padding: 0 14px; } }

      .aud-header {
        display: flex; flex-direction: column; gap: 18px;
        margin-bottom: 28px; padding-top: 28px;
        align-items: flex-start;
      }
      @media(min-width: 768px) {
        .aud-header { flex-direction: row; align-items: flex-end; justify-content: space-between; }
      }

      .aud-header-left {
        display: flex; align-items: flex-start; gap: 16px;
      }

      .aud-header-icon {
        width: 48px; height: 48px; border-radius: 14px;
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        display: flex; align-items: center; justify-content: center;
        color: #fff; flex-shrink: 0;
      }

      .aud-header-text h1 {
        font-family: 'Playfair Display', serif;
        font-size: clamp(24px, 5vw, 32px);
        font-weight: 500; color: ${t.text};
        margin: 0 0 4px; letter-spacing: .02em;
      }

      .aud-header-text p {
        font-size: 10px; font-weight: 500; letter-spacing: .16em;
        text-transform: uppercase; color: ${AURA.red}; margin: 0 0 8px;
        display: flex; align-items: center; gap: 6px;
      }

      .aud-header-sub {
        font-family: 'Inter', sans-serif; font-size: 13px;
        color: ${t.textSec}; margin: 0;
      }

      .aud-header-actions {
        display: flex; gap: 8px; flex-shrink: 0;
      }

      .aud-btn {
        border: none; border-radius: 10px; cursor: pointer;
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
        letter-spacing: .12em; padding: 10px 16px; transition: all .25s;
        display: inline-flex; align-items: center; gap: 7px;
      }

      .aud-btn-primary {
        background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue});
        color: #fff; box-shadow: 0 6px 20px rgba(0, 61, 165, .25);
      }
      .aud-btn-primary:hover { opacity: .88; transform: translateY(-1px); }

      .aud-btn-ghost {
        background: none; border: 1px solid ${t.border};
        color: ${t.textMuted}; transition: all .25s;
      }
      .aud-btn-ghost:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

      .aud-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 16px; overflow: hidden; backdrop-filter: blur(20px);
        position: relative;
      }
      .aud-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }

      .aud-filters-wrap {
        padding: 20px; background: ${t.bgEl};
        border: 1px solid ${t.border}; border-radius: 12px;
        margin-bottom: 20px;
      }

      .aud-filters-label {
        font-size: 10px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; color: ${t.textMuted}; margin: 0 0 14px;
      }

      .aud-filter-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 12px; margin-bottom: 16px;
      }

      .aud-input {
        width: 100%; background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 10px 12px; border-radius: 8px;
        outline: none; font-family: 'Inter', sans-serif; font-size: 13px;
        transition: all .25s;
      }
      .aud-input:focus { border-color: ${AURA.gold}; box-shadow: 0 0 0 3px rgba(201,169,110,.08); }
      .aud-input::placeholder { color: ${t.placeholder}; }

      .aud-select {
        width: 100%; background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 10px 12px; border-radius: 8px;
        outline: none; font-family: 'Inter', sans-serif; font-size: 13px;
        cursor: pointer; transition: all .25s; appearance: none; -webkit-appearance: none;
      }
      .aud-select:focus { border-color: ${AURA.gold}; box-shadow: 0 0 0 3px rgba(201,169,110,.08); }

      .aud-filter-actions {
        display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;
      }

      .aud-stats {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 14px; flex-wrap: wrap; gap: 8px;
        font-size: 10px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; color: ${t.textMuted};
      }

      .aud-table {
        width: 100%; border-collapse: collapse;
        min-width: 700px;
      }

      .aud-table thead tr { background: ${isDark ? "rgba(255,255,255,.02)" : "rgba(201,169,110,.03)"}; }

      .aud-table th {
        padding: 14px 14px; font-family: 'Inter', sans-serif;
        font-size: 9px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; color: ${t.textMuted}; text-align: left;
      }

      .aud-table td {
        padding: 12px 14px; border-top: 1px solid ${t.border};
        font-size: 13px; color: ${t.text};
      }

      .aud-table tbody tr { transition: background .15s; cursor: pointer; }
      .aud-table tbody tr:hover { background: ${isDark ? "rgba(255,255,255,.03)" : "rgba(201,169,110,.04)"}; }

      .aud-expand-icon {
        width: 32px; height: 32px; display: flex; align-items: center;
        justify-content: center; color: ${t.textMuted};
      }

      .aud-date {
        font-family: 'Inter', sans-serif; font-size: 11px;
        color: ${t.textMuted}; white-space: nowrap;
      }

      .aud-tag {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 6px 10px; border-radius: 6px; font-size: 8px;
        font-weight: 600; letter-spacing: .1em; border: 1px solid;
        white-space: nowrap;
      }

      .aud-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 6px 12px; border-radius: 99px; font-size: 8px;
        font-weight: 600; letter-spacing: .1em; border: 1px solid;
        white-space: nowrap;
      }

      .aud-avatar {
        width: 28px; height: 28px; border-radius: 8px;
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.blue});
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-family: 'Playfair Display', serif;
        font-weight: 600; font-size: 11px; flex-shrink: 0;
      }

      .aud-user-cell {
        display: flex; align-items: center; gap: 9px; min-width: 0;
      }

      .aud-user-name {
        font-family: 'Inter', sans-serif; font-size: 13px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }

      .aud-detail-panel {
        background: ${isDark ? "rgba(255,255,255,.02)" : "rgba(201,169,110,.02)"};
      }

      .aud-detail-content {
        padding: 20px;
      }

      .aud-detail-row {
        display: flex; align-items: flex-start; gap: 16px;
        margin-bottom: 16px;
      }
      .aud-detail-row:last-child { margin-bottom: 0; }

      .aud-detail-label {
        font-family: 'Inter', sans-serif; font-size: 9px;
        font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; color: ${t.textMuted};
        min-width: 100px;
      }

      .aud-detail-value {
        font-family: 'Inter', sans-serif; font-size: 13px;
        color: ${t.text};
      }

      .aud-diff-from {
        background: rgba(239, 68, 68, .1); color: #EF4444;
        border: 1px solid rgba(239, 68, 68, .2); padding: 4px 8px;
        border-radius: 6px; font-size: 12px; text-decoration: line-through;
      }

      .aud-diff-to {
        background: rgba(5, 150, 105, .1); color: #059669;
        border: 1px solid rgba(5, 150, 105, .2); padding: 4px 8px;
        border-radius: 6px; font-size: 12px;
      }

      .aud-divider {
        height: 1px; background: linear-gradient(90deg, transparent, ${t.border}, transparent);
        margin: 16px 0;
      }

      .aud-empty {
        display: flex; flex-direction: column; align-items: center;
        padding: 60px 20px; text-align: center;
      }

      .aud-empty-icon {
        color: ${isDark ? "rgba(201,169,110,.15)" : "rgba(201,169,110,.1)"};
        margin-bottom: 12px;
      }

      .aud-empty-text {
        font-family: 'Inter', sans-serif; font-size: 13px;
        color: ${t.textMuted}; font-weight: 300;
      }

      .aud-pagination {
        display: flex; align-items: center; justify-content: center;
        gap: 6px; margin-top: 20px; flex-wrap: wrap;
      }

      .aud-page-btn {
        width: 36px; height: 36px; border-radius: 8px;
        border: 1px solid ${t.border}; background: none;
        color: ${t.textMuted}; cursor: pointer; display: flex;
        align-items: center; justify-content: center; transition: all .25s;
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
      }
      .aud-page-btn:hover:not(:disabled) { border-color: ${AURA.gold}; color: ${AURA.gold}; }
      .aud-page-btn.active {
        background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue});
        color: #fff; border-color: transparent;
      }
      .aud-page-btn:disabled { opacity: .35; cursor: not-allowed; }

      .aud-footer {
        text-align: center; font-size: 9px; font-weight: 500;
        letter-spacing: .14em; text-transform: uppercase;
        color: ${isDark ? "rgba(245,240,232,.12)" : "rgba(26,16,8,.15)"};
        padding: 20px 0 0; margin-top: 32px;
      }
    `}</style>
    );
}

/* ─── Metadados de Ações ─────────────────────────────────────────────────── */
const ACOES = {
    CREATE:  { label: "Criação",   icon: PlusCircle,  color: "#059669", bg: "rgba(5,150,105,.12)",  border: "rgba(5,150,105,.25)"  },
    UPDATE:  { label: "Edição",    icon: Edit3,       color: "#F59E0B", bg: "rgba(245,158,11,.12)", border: "rgba(245,158,11,.25)" },
    DELETE:  { label: "Exclusão",  icon: Trash2,      color: "#EF4444", bg: "rgba(239,68,68,.12)",  border: "rgba(239,68,68,.25)"  },
    APPROVE: { label: "Aprovação", icon: CheckCircle, color: "#10B981", bg: "rgba(16,185,129,.12)", border: "rgba(16,185,129,.25)" },
    REJECT:  { label: "Rejeição",  icon: XCircle,     color: "#F97316", bg: "rgba(249,115,22,.12)", border: "rgba(249,115,22,.25)" },
    VIEW:    { label: "Consulta",  icon: Eye,         color: "#6366F1", bg: "rgba(99,102,241,.12)", border: "rgba(99,102,241,.25)" },
};

const ENTIDADES = ["MEMBRO", "VISITANTE", "CELULA", "FICHA", "USUARIO", "SECRETARIA"];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// ✅ Converte "2025-06-15T00:00" → "2025-06-15T00:00:00" sem toISOString (sem conversão UTC)
function toLocalISOParam(val, endOfMinute = false) {
    if (!val) return null;
    return val + (endOfMinute ? ":59" : ":00");
}

function AcaoBadge({ acao }) {
    const meta = ACOES[acao] || { label: acao, icon: Shield, color: "#888", bg: "rgba(128,128,128,.1)", border: "rgba(128,128,128,.2)" };
    const Icon = meta.icon;
    return (
        <span className="aud-badge" style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
            <Icon size={10} /> {meta.label}
        </span>
    );
}

function EntidadeTag({ entidade }) {
    const colors = {
        MEMBRO:     { c: AURA.blue,   b: "rgba(0,61,165,.12)"   },
        VISITANTE:  { c: AURA.red,    b: "rgba(200,16,46,.12)"  },
        CELULA:     { c: "#059669",   b: "rgba(5,150,105,.12)"  },
        FICHA:      { c: AURA.yellow, b: "rgba(253,184,19,.12)" },
        USUARIO:    { c: "#8B5CF6",   b: "rgba(139,92,246,.12)" },
        SECRETARIA: { c: "#003DA5",   b: "rgba(0,61,165,.12)"   },
    };
    const s = colors[entidade] || { c: "#888", b: "rgba(128,128,128,.1)" };
    return (
        <span className="aud-tag" style={{ color: s.c, background: s.b, borderColor: s.c + "44" }}>
            {entidade}
        </span>
    );
}

function DetalhesDiff({ detalhes }) {
    let parsed = null;
    try { parsed = JSON.parse(detalhes); } catch { return <p style={{ fontStyle: "italic", color: "var(--text-sec)" }}>Sem detalhes registrados.</p>; }
    if (!parsed || Object.keys(parsed).length === 0)
        return <p style={{ fontStyle: "italic", color: "var(--text-sec)" }}>Sem detalhes registrados.</p>;

    return (
        <div>
            {Object.entries(parsed).map(([campo, val]) => (
                <div key={campo} style={{ marginBottom: 12 }}>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-sec)", margin: "0 0 6px" }}>
                        {campo}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        {val?.de !== undefined && (
                            <>
                                <span className="aud-diff-from">{String(val.de || "—")}</span>
                                <span style={{ color: "var(--text-sec)", fontSize: 12 }}>→</span>
                                <span className="aud-diff-to">{String(val.para ?? "—")}</span>
                            </>
                        )}
                        {val?.para !== undefined && val?.de === undefined && (
                            <span className="aud-diff-to">{String(val.para ?? "—")}</span>
                        )}
                        {typeof val === "string" && (
                            <span style={{ fontSize: 13, color: "var(--text)" }}>{val}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Linha expansível ───────────────────────────────────────────────────── */
function AuditoriaRow({ reg, isDark, t }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <tr onClick={() => setOpen(o => !o)}>
                <td className="aud-expand-icon">
                    {open
                        ? <ChevronUp   size={16} style={{ color: AURA.red }} />
                        : <ChevronDown size={16} style={{ color: t.textMuted }} />}
                </td>
                <td className="aud-date">{formatDate(reg.dataHora)}</td>
                <td><EntidadeTag entidade={reg.entidade} /></td>
                <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {reg.entidadeNome || `#${reg.entidadeId}`}
                </td>
                <td><AcaoBadge acao={reg.acao} /></td>
                <td style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <div className="aud-user-cell">
                        <div className="aud-avatar">{reg.usuarioNome?.charAt(0).toUpperCase()}</div>
                        <span className="aud-user-name">{reg.usuarioNome}</span>
                    </div>
                </td>
                <td>
                    {reg.aprovadorNome ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <CheckCircle size={12} style={{ color: "#059669" }} />
                            <span style={{ fontSize: 12, color: "#059669" }}>{reg.aprovadorNome}</span>
                        </div>
                    ) : (
                        <span style={{ fontStyle: "italic", color: t.textMuted }}>—</span>
                    )}
                </td>
            </tr>

            <AnimatePresence>
                {open && (
                    <tr className="aud-detail-panel">
                        <td colSpan={7}>
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ overflow: "hidden" }}
                            >
                                <div className="aud-detail-content">
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 16 }}>
                                        <div>
                                            <p className="aud-detail-label">ID do Registro</p>
                                            <p className="aud-detail-value">#{reg.entidadeId}</p>
                                        </div>
                                        {reg.ipOrigem && (
                                            <div>
                                                <p className="aud-detail-label">IP de Origem</p>
                                                <p className="aud-detail-value">{reg.ipOrigem}</p>
                                            </div>
                                        )}
                                        {reg.usuarioEmail && (
                                            <div>
                                                <p className="aud-detail-label">E-mail do Operador</p>
                                                <p className="aud-detail-value">{reg.usuarioEmail}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="aud-divider" />
                                    <p className="aud-detail-label" style={{ marginBottom: 10 }}>Campos Alterados</p>
                                    <DetalhesDiff detalhes={reg.detalhes} />
                                </div>
                            </motion.div>
                        </td>
                    </tr>
                )}
            </AnimatePresence>
        </>
    );
}

/* ─── Filtros (extraído para evitar re-render do pai) ───────────────────── */
function FiltrosPanel({ filtros, setFiltro, aplicar, limpar, t }) {
    return (
        <div className="aud-filters-wrap">
            <p className="aud-filters-label">Filtros de Pesquisa</p>
            <div className="aud-filter-grid">
                <div>
                    <label style={{ display: "block", fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: t.textMuted, marginBottom: 6 }}>Entidade</label>
                    <select className="aud-select" value={filtros.entidade} onChange={e => setFiltro("entidade", e.target.value)}>
                        <option value="">Todas</option>
                        {ENTIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: "block", fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: t.textMuted, marginBottom: 6 }}>Ação</label>
                    <select className="aud-select" value={filtros.acao} onChange={e => setFiltro("acao", e.target.value)}>
                        <option value="">Todas</option>
                        {Object.entries(ACOES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: "block", fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: t.textMuted, marginBottom: 6 }}>Operador</label>
                    <input className="aud-input" placeholder="Nome do usuário..." value={filtros.usuario} onChange={e => setFiltro("usuario", e.target.value)} />
                </div>
                <div>
                    <label style={{ display: "block", fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: t.textMuted, marginBottom: 6 }}>ID do Registro</label>
                    <input className="aud-input" placeholder="Ex: 42" type="number" value={filtros.entidadeId} onChange={e => setFiltro("entidadeId", e.target.value)} />
                </div>
                <div>
                    <label style={{ display: "block", fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: t.textMuted, marginBottom: 6 }}>Data Início</label>
                    <input className="aud-input" type="datetime-local" value={filtros.de} onChange={e => setFiltro("de", e.target.value)} />
                </div>
                <div>
                    <label style={{ display: "block", fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: t.textMuted, marginBottom: 6 }}>Data Fim</label>
                    <input className="aud-input" type="datetime-local" value={filtros.ate} onChange={e => setFiltro("ate", e.target.value)} />
                </div>
            </div>
            <div className="aud-filter-actions">
                <button className="aud-btn aud-btn-ghost" onClick={limpar}>
                    <X size={14} /> Limpar
                </button>
                <button className="aud-btn aud-btn-primary" onClick={aplicar}>
                    <Search size={14} /> Buscar
                </button>
            </div>
        </div>
    );
}

/* ─── Tabela + loading/erro/vazio ───────────────────────────────────────── */
function TabelaAuditoria({ registros, loading, erro, isDark, t, onRetry }) {
    if (loading) return (
        <div className="aud-empty">
            <Loader2 size={32} className="dl-spin aud-empty-icon" style={{ color: AURA.gold }} />
            <p className="aud-empty-text">Carregando histórico…</p>
        </div>
    );
    if (erro) return (
        <div className="aud-empty">
            <AlertTriangle size={32} className="aud-empty-icon" style={{ color: AURA.red }} />
            <p className="aud-empty-text">{erro}</p>
            <button className="aud-btn aud-btn-primary" style={{ marginTop: 12 }} onClick={onRetry}>
                <RefreshCw size={13} /> Tentar Novamente
            </button>
        </div>
    );
    if (registros.length === 0) return (
        <div className="aud-empty">
            <Shield size={40} className="aud-empty-icon" />
            <p className="aud-empty-text">Nenhum registro encontrado</p>
        </div>
    );
    return (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table className="aud-table">
                <thead>
                <tr>
                    <th></th>
                    <th>Data / Hora</th>
                    <th>Entidade</th>
                    <th>Registro</th>
                    <th>Ação</th>
                    <th>Operador</th>
                    <th>Aprovador</th>
                </tr>
                </thead>
                <tbody>
                {registros.map((reg, i) => (
                    <AuditoriaRow key={reg.id ?? i} reg={reg} isDark={isDark} t={t} />
                ))}
                </tbody>
            </table>
        </div>
    );
}

/* ─── Paginação ─────────────────────────────────────────────────────────── */
function Paginacao({ page, totalPages, irPara }) {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        if (totalPages <= 7) return i;
        return Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
    });
    return (
        <motion.div className="aud-pagination" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <button className="aud-page-btn" disabled={page === 0} onClick={() => irPara(page - 1)}>
                <ChevronLeft size={14} />
            </button>
            {pages.map(p => (
                <button key={p} className={`aud-page-btn${page === p ? " active" : ""}`} onClick={() => irPara(p)}>
                    {p + 1}
                </button>
            ))}
            <button className="aud-page-btn" disabled={page >= totalPages - 1} onClick={() => irPara(page + 1)}>
                <ChevronRight size={14} />
            </button>
        </motion.div>
    );
}

/* ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────── */
export default function HistoricoAuditoria({ isDark = false, embedded = false }) {
    const [registros,   setRegistros]   = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [erro,        setErro]        = useState(null);
    const [totalPages,  setTotalPages]  = useState(0);
    const [totalItems,  setTotalItems]  = useState(0);
    const [showFiltros, setShowFiltros] = useState(false);

    const t = theme(isDark);

    const [filtros, setFiltros] = useState({
        entidade: "", acao: "", usuario: "", entidadeId: "",
        de: "", ate: "", page: 0, size: 20,
    });

    // ✅ useRef para sempre ter o filtro mais recente sem re-criar buscar
    const filtrosRef = useRef(filtros);
    useEffect(() => { filtrosRef.current = filtros; }, [filtros]);

    const buscar = useCallback(async (f) => {
        // ✅ Se não receber f explícito, usa o ref (sempre atualizado)
        const filtro = f ?? filtrosRef.current;
        setLoading(true);
        setErro(null);
        try {
            const params = new URLSearchParams();
            if (filtro.entidade)   params.set("entidade",   filtro.entidade);
            if (filtro.acao)       params.set("acao",       filtro.acao);
            if (filtro.usuario)    params.set("usuario",    filtro.usuario);
            if (filtro.entidadeId) params.set("entidadeId", filtro.entidadeId);

            // ✅ Envia sem conversão UTC — preserva o horário local (Brasília)
            const deParam  = toLocalISOParam(filtro.de,  false);
            const ateParam = toLocalISOParam(filtro.ate, true);
            if (deParam)  params.set("de",  deParam);
            if (ateParam) params.set("ate", ateParam);

            params.set("page", filtro.page);
            params.set("size", filtro.size);

            const res = await api.get(`/auditoria?${params}`);
            setRegistros(res.data.content      || []);
            setTotalPages(res.data.totalPages  || 0);
            setTotalItems(res.data.totalElements || 0);
        } catch (e) {
            setErro("Não foi possível carregar o histórico. Verifique a conexão.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []); // ✅ Sem deps — estável, nunca recriado

    useEffect(() => { buscar(); }, [buscar]);

    const setFiltro = (key, val) => setFiltros(f => ({ ...f, [key]: val, page: 0 }));

    const aplicar = () => {
        const f = { ...filtrosRef.current, page: 0 };
        setFiltros(f);
        buscar(f);
    };

    const limpar = () => {
        const z = { entidade: "", acao: "", usuario: "", entidadeId: "", de: "", ate: "", page: 0, size: 20 };
        setFiltros(z);
        buscar(z);
    };

    const irPara = (p) => {
        const f = { ...filtrosRef.current, page: p };
        setFiltros(f);
        buscar(f);
    };

    const statsEl = (
        <div className="aud-stats">
            <span>
                {totalItems > 0
                    ? `${totalItems.toLocaleString("pt-BR")} Registro${totalItems !== 1 ? "s" : ""}`
                    : "Nenhum registro"}
            </span>
            {totalItems > 0 && <span>Página {filtros.page + 1} de {totalPages}</span>}
        </div>
    );

    /* ── Modo embedded ───────────────────────────────────────────────────── */
    if (embedded) {
        return (
            <>
                <GlobalStyles t={t} isDark={isDark} />
                <div style={{ padding: "4px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 14 }}>
                        <button className="aud-btn aud-btn-ghost" onClick={() => setShowFiltros(s => !s)}>
                            <Filter size={14} /> {showFiltros ? "Ocultar" : "Filtros"}
                        </button>
                        <button className="aud-btn aud-btn-ghost" onClick={() => buscar()}>
                            <RefreshCw size={14} className={loading ? "dl-spin" : ""} />
                        </button>
                    </div>

                    <AnimatePresence>
                        {showFiltros && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden", marginBottom: 16 }}>
                                <FiltrosPanel filtros={filtros} setFiltro={setFiltro} aplicar={aplicar} limpar={limpar} t={t} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {statsEl}

                    <div className="aud-card" style={{ borderRadius: 14 }}>
                        <TabelaAuditoria registros={registros} loading={loading} erro={erro} isDark={isDark} t={t} onRetry={() => buscar()} />
                    </div>

                    <Paginacao page={filtros.page} totalPages={totalPages} irPara={irPara} />
                </div>
            </>
        );
    }

    /* ── Modo standalone ─────────────────────────────────────────────────── */
    return (
        <div className={`aud-root${isDark ? " dark" : ""}`} style={{ background: t.bg }}>
            <GlobalStyles t={t} isDark={isDark} />
            <div className="aud-glow" />

            <div className="aud-content">
                {/* Header */}
                <motion.div className="aud-header" initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="aud-header-left">
                        <div className="aud-header-icon"><Shield size={24} /></div>
                        <div className="aud-header-text">
                            <p>🔐 Administração</p>
                            <h1>Histórico de Alterações</h1>
                            <p className="aud-header-sub">Rastreabilidade completa de todas as operações no sistema</p>
                        </div>
                    </div>
                    <div className="aud-header-actions">
                        <button className="aud-btn aud-btn-ghost" onClick={() => setShowFiltros(s => !s)}>
                            <Filter size={14} /> {showFiltros ? "Ocultar" : "Filtros"}
                        </button>
                        <button className="aud-btn aud-btn-ghost" onClick={() => buscar()}>
                            <RefreshCw size={14} className={loading ? "dl-spin" : ""} />
                        </button>
                    </div>
                </motion.div>

                {/* Filtros */}
                <AnimatePresence>
                    {showFiltros && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden", marginBottom: 20 }}>
                            <FiltrosPanel filtros={filtros} setFiltro={setFiltro} aplicar={aplicar} limpar={limpar} t={t} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
                    {statsEl}
                </motion.div>

                {/* Table */}
                <motion.div className="aud-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                    <TabelaAuditoria registros={registros} loading={loading} erro={erro} isDark={isDark} t={t} onRetry={() => buscar()} />
                </motion.div>

                {/* Paginação */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }}>
                    <Paginacao page={filtros.page} totalPages={totalPages} irPara={irPara} />
                </motion.div>

                <div className="aud-footer">
                    © IEQ Pituaçu · Sistema de Auditoria · {new Date().getFullYear()}
                </div>
            </div>
        </div>
    );
}
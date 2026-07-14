import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home, Plus, X, Loader2, CheckCircle2, ChevronDown,
    Search, Calendar, Lock, Info,
} from "lucide-react";
import { AURA, theme } from "./liderTheme";

const TOTAL_ENCONTROS = 7;

const DECISAO_CONFIG = {
    ACEITOU_JESUS: {
        label: "Aceitou Jesus",
        cor: "#185FA5", bg: "#E6F1FB", borda: "#B5D4F4", icone: "✝️",
    },
    RECONCILIOU: {
        label: "Reconciliou",
        cor: "#854F0B", bg: "#FAEEDA", borda: "#FAC775", icone: "🤝",
    },
    BATISMO_AGUAS: {
        label: "Deseja Batismo",
        cor: "#0F6E56", bg: "#E1F5EE", borda: "#9FE1CB", icone: "💧",
    },
};

function extrairDecisaoAtual(historico) {
    if (!historico) return null;
    if (Array.isArray(historico)) {
        if (historico.length === 0) return null;
        const ultimo = historico[historico.length - 1];
        return ultimo?.decisaoEspiritual ?? null;
    }
    return historico?.decisaoEspiritual ?? null;
}

function formatarData(raw) {
    if (!raw) return "—";
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/* ─── Badge Decisão ───────────────────────────────────────────────────── */
function BadgeDecisao({ decisao }) {
    const cfg = decisao && decisao !== "NENHUMA" ? DECISAO_CONFIG[decisao] : null;
    if (!cfg) return null;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 9px", borderRadius: 99,
            fontSize: 10, fontWeight: 600, fontFamily: "'Inter', sans-serif",
            background: cfg.bg, color: cfg.cor, border: `1px solid ${cfg.borda}`,
            whiteSpace: "nowrap", flexShrink: 0,
        }}>
      {cfg.icone} {cfg.label}
    </span>
    );
}

/* ─── Badge Status ────────────────────────────────────────────────────── */
function BadgeStatus({ status }) {
    // Backend envia enum: EM_ANDAMENTO | CONCLUIDA | CANCELADA
    const s = (status || "").toLowerCase().trim();
    const base = {
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 12px", borderRadius: 99,
        fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600,
        letterSpacing: ".12em", textTransform: "uppercase", whiteSpace: "nowrap",
    };
    // EM_ANDAMENTO → Ativa
    if (s === "em_andamento" || s.includes("andamento") || s.includes("ativ"))
        return <span style={{ ...base, color: "#7A9E7E", border: "1px solid rgba(122,158,126,.35)", background: "rgba(122,158,126,.1)" }}>● Ativa</span>;
    if (s.includes("cancel"))
        return <span style={{ ...base, color: "#E8294A", border: "1px solid rgba(200,16,46,.35)", background: "rgba(200,16,46,.1)" }}>● Cancelada</span>;
    if (s.includes("conclu"))
        return <span style={{ ...base, color: AURA.yellow, border: "1px solid rgba(253,184,19,.35)", background: "rgba(253,184,19,.1)" }}>★ Concluída</span>;
    return <span style={{ ...base, color: AURA.gold, border: "1px solid rgba(201,169,110,.3)", background: "rgba(201,169,110,.08)" }}>○ Pendente</span>;
}

/* ─── Modal AURA ──────────────────────────────────────────────────────── */
function AuraModal({ open, onClose, title, children, t }) {
    if (!open) return null;
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ position: "fixed", inset: 0, background: "rgba(10,10,15,.88)", backdropFilter: "blur(4px)", zIndex: 0 }}
            />
            <motion.div
                initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                transition={{ type: "tween", duration: .28 }}
                style={{
                    position: "relative", zIndex: 10, width: "100%", maxWidth: 500,
                    background: t.bgEl, border: `1px solid ${t.border}`,
                    borderRadius: "22px 22px 0 0", overflow: "hidden",
                    maxHeight: "90vh", display: "flex", flexDirection: "column",
                }}
            >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${AURA.gold}, transparent)`, opacity: .3 }} />
                <div style={{ padding: "22px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexShrink: 0 }}>
                    <div>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(201,169,110,.55)", margin: "0 0 3px" }}>
                            Casas de Paz
                        </p>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 500, color: t.text, margin: 0 }}>{title}</h3>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 4, display: "flex" }}>
                        <X size={18} />
                    </button>
                </div>
                <div style={{ overflowY: "auto", flex: 1 }}>{children}</div>
            </motion.div>
        </div>
    );
}

/* ─── Hooks ───────────────────────────────────────────────────────────── */
function useMembros(celulaId) {
    const [membros, setMembros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);
    const buscar = useCallback(async () => {
        if (!celulaId) return;
        setLoading(true); setErro(null);
        try {
            const res = await api.get(`/celulas/${celulaId}/membros`);
            setMembros(Array.isArray(res.data) ? res.data : res.data?.content ?? res.data?.data ?? []);
        } catch { setErro("Não foi possível carregar membros."); setMembros([]); }
        finally { setLoading(false); }
    }, [celulaId]);
    return { membros, loading, erro, buscar };
}

function useVisitantes(celulaId) {
    const [visitantes, setVisitantes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);
    const buscar = useCallback(async () => {
        if (!celulaId) return;
        setLoading(true); setErro(null);
        try {
            const res = await api.get(`/visitantes/celula/${celulaId}/ativos`);
            setVisitantes(Array.isArray(res.data) ? res.data : res.data?.content ?? res.data?.data ?? []);
        } catch { setErro("Não foi possível carregar visitantes."); setVisitantes([]); }
        finally { setLoading(false); }
    }, [celulaId]);
    return { visitantes, loading, erro, buscar };
}

function useHistoricoDecisoes() {
    const [historico, setHistorico] = useState({});

    const buscarDecisao = useCallback(async (visitanteId) => {
        if (!visitanteId || historico[visitanteId] !== undefined) return;
        try {
            const res = await api.get(`/visitantes/${visitanteId}/historico-decisoes`);
            setHistorico(prev => ({ ...prev, [visitanteId]: extrairDecisaoAtual(res.data) }));
        } catch {
            try {
                const res2 = await api.get(`/visitantes/${visitanteId}`);
                setHistorico(prev => ({ ...prev, [visitanteId]: res2.data?.decisaoEspiritual ?? null }));
            } catch {
                setHistorico(prev => ({ ...prev, [visitanteId]: null }));
            }
        }
    }, [historico]);

    const buscarEmLote = useCallback(async (ids) => {
        const novos = ids.filter(id => historico[id] === undefined);
        if (novos.length === 0) return;
        await Promise.all(novos.map(id => buscarDecisao(id)));
    }, [buscarDecisao, historico]);

    return { historico, buscarEmLote };
}

/* ─── Seletor de membro (único) ───────────────────────────────────────── */
function MembroSelector({ items, loading, erro, onSelect, selectedId, placeholder, t, isDark }) {
    const [busca, setBusca] = useState("");
    const filtrados = items.filter(p => (p.nome ?? p.nomeCompleto ?? "").toLowerCase().includes(busca.toLowerCase()));

    const inputStyle = {
        width: "100%", boxSizing: "border-box",
        background: t.bgInput, border: `1px solid ${t.borderInput}`,
        color: t.text, padding: "11px 14px 11px 38px",
        borderRadius: 12, outline: "none",
        fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300, transition: "all .25s",
    };

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0", color: t.textSec, fontFamily: "'Inter',sans-serif", fontSize: 13 }}>
            <Loader2 size={16} style={{ animation: "dl-spin 1s linear infinite", color: AURA.gold }} /> Carregando...
        </div>
    );
    if (erro) return <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: AURA.red, padding: "12px 0" }}>{erro}</p>;

    return (
        <div>
            <div style={{ position: "relative", marginBottom: 10 }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: AURA.gold, opacity: .5, pointerEvents: "none" }} />
                <input style={inputStyle} placeholder={placeholder} value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
            <div style={{ maxHeight: 220, overflowY: "auto", border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden" }}>
                {filtrados.length === 0
                    ? <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: t.textSec, padding: "14px 16px", margin: 0, fontStyle: "italic" }}>
                        {busca ? `Nenhum resultado para "${busca}".` : "Nenhum resultado."}
                    </p>
                    : filtrados.map((p, i) => {
                        const nome = p.nome ?? p.nomeCompleto ?? `#${p.id}`;
                        const sel = selectedId === p.id;
                        return (
                            <div key={p.id} onClick={() => onSelect(p)}
                                 style={{
                                     display: "flex", alignItems: "center", justifyContent: "space-between",
                                     padding: "11px 14px", cursor: "pointer",
                                     background: sel ? (isDark ? "rgba(201,169,110,.12)" : "rgba(201,169,110,.08)") : "transparent",
                                     borderBottom: i < filtrados.length - 1 ? `1px solid ${t.border}` : "none",
                                     transition: "background .15s",
                                 }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: "linear-gradient(135deg,rgba(201,169,110,.2),rgba(201,169,110,.06))", border: "1px solid rgba(201,169,110,.22)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 13, color: AURA.gold }}>
                                        {nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: t.text, margin: 0, fontWeight: sel ? 500 : 300 }}>{nome}</p>
                                        {p.telefone && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: t.textMuted, margin: "1px 0 0" }}>{p.telefone}</p>}
                                    </div>
                                </div>
                                {sel && <CheckCircle2 size={16} color={AURA.gold} />}
                            </div>
                        );
                    })}
            </div>
            {selectedId && (() => {
                const p = items.find(x => x.id === selectedId);
                const nome = p ? (p.nome ?? p.nomeCompleto ?? `#${p.id}`) : "";
                return <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#7A9E7E", margin: "8px 0 0" }}>✓ Selecionado: <strong>{nome}</strong></p>;
            })()}
        </div>
    );
}

/* ─── Seletor de visitantes MÚLTIPLO ─────────────────────────────────── */
function VisitanteMultiSelector({ items, loading, erro, selecionados, onToggle, t, isDark }) {
    const [busca, setBusca] = useState("");
    const filtrados = items.filter(p =>
        (p.nome ?? p.nomeCompleto ?? "").toLowerCase().includes(busca.toLowerCase())
    );

    const inputStyle = {
        width: "100%", boxSizing: "border-box",
        background: t.bgInput, border: `1px solid ${t.borderInput}`,
        color: t.text, padding: "11px 14px 11px 38px",
        borderRadius: 12, outline: "none",
        fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300, transition: "all .25s",
    };

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0", color: t.textSec, fontFamily: "'Inter',sans-serif", fontSize: 13 }}>
            <Loader2 size={16} style={{ animation: "dl-spin 1s linear infinite", color: AURA.gold }} /> Carregando...
        </div>
    );
    if (erro) return <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: AURA.red, padding: "12px 0" }}>{erro}</p>;

    return (
        <div>
            {/* Chips dos selecionados */}
            {selecionados.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {selecionados.map(v => {
                        const nome = v.nome ?? v.nomeCompleto ?? `#${v.id}`;
                        return (
                            <span
                                key={v.id}
                                onClick={() => onToggle(v)}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    padding: "4px 10px 4px 12px", borderRadius: 99, cursor: "pointer",
                                    background: "linear-gradient(135deg,rgba(201,169,110,.18),rgba(201,169,110,.08))",
                                    border: "1px solid rgba(201,169,110,.35)",
                                    fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500, color: AURA.gold,
                                    transition: "all .15s",
                                }}
                            >
                {nome}
                                <X size={11} style={{ opacity: .7 }} />
              </span>
                        );
                    })}
                </div>
            )}

            <div style={{ position: "relative", marginBottom: 10 }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: AURA.gold, opacity: .5, pointerEvents: "none" }} />
                <input style={inputStyle} placeholder="Pesquisar visitante da célula..." value={busca} onChange={e => setBusca(e.target.value)} />
            </div>

            <div style={{ maxHeight: 240, overflowY: "auto", border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden" }}>
                {filtrados.length === 0
                    ? <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: t.textSec, padding: "14px 16px", margin: 0, fontStyle: "italic" }}>
                        {busca ? `Nenhum resultado para "${busca}".` : "Nenhum visitante ativo nesta célula."}
                    </p>
                    : filtrados.map((p, i) => {
                        const nome = p.nome ?? p.nomeCompleto ?? `#${p.id}`;
                        const sel = selecionados.some(v => v.id === p.id);
                        return (
                            <div
                                key={p.id}
                                onClick={() => onToggle(p)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: "11px 14px", cursor: "pointer",
                                    background: sel ? (isDark ? "rgba(201,169,110,.1)" : "rgba(201,169,110,.07)") : "transparent",
                                    borderBottom: i < filtrados.length - 1 ? `1px solid ${t.border}` : "none",
                                    transition: "background .15s",
                                }}
                            >
                                {/* Checkbox visual */}
                                <div style={{
                                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                                    border: `1.5px solid ${sel ? AURA.gold : (isDark ? "rgba(201,169,110,.3)" : "rgba(201,169,110,.4)")}`,
                                    background: sel ? AURA.gold : "transparent",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all .15s",
                                }}>
                                    {sel && <CheckCircle2 size={11} color="#0A0A0F" strokeWidth={3} />}
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: sel ? "linear-gradient(135deg,rgba(201,169,110,.3),rgba(201,169,110,.1))" : "linear-gradient(135deg,rgba(201,169,110,.15),rgba(201,169,110,.05))", border: `1px solid ${sel ? "rgba(201,169,110,.4)" : "rgba(201,169,110,.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 13, color: AURA.gold }}>
                                        {nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: sel ? AURA.gold : t.text, margin: 0, fontWeight: sel ? 500 : 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nome}</p>
                                        {p.telefone && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: t.textMuted, margin: "1px 0 0" }}>{p.telefone}</p>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>

            {selecionados.length > 0 && (
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#7A9E7E", margin: "8px 0 0" }}>
                    ✓ {selecionados.length} visitante{selecionados.length > 1 ? "s" : ""} selecionado{selecionados.length > 1 ? "s" : ""}
                </p>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function CasasDePazLider({ celulaId, isDark = true }) {
    const t = theme(isDark);

    const [casas, setCasas]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [busca, setBusca]           = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim]       = useState("");
    const [toast, setToast]           = useState(null);

    const [modalCriar, setModalCriar]         = useState(false);
    const [modalVisitante, setModalVisitante] = useState(false);
    const [modalEncontro, setModalEncontro]   = useState(false);
    const [modalCancelar, setModalCancelar]   = useState(false);
    const [targetCasaId, setTargetCasaId]     = useState(null);
    const [targetCasaNome, setTargetCasaNome] = useState("");

    /* Nova casa */
    const [fCriar, setFCriar] = useState({ nome: "", endereco: "", nomeAnfitriao: "", lider: null, auxiliar: null });

    /* Visitantes selecionados (múltiplo) */
    const [visitantesSelecionados, setVisitantesSelecionados] = useState([]);

    /* Encontro */
    const [fEnc, setFEnc] = useState({ data: new Date().toISOString().split("T")[0] });

    const [submitting, setSubmitting] = useState(false);

    const membrosHook    = useMembros(celulaId);
    const visitantesHook = useVisitantes(celulaId);
    const { historico: historicoDecisoes, buscarEmLote } = useHistoricoDecisoes();

    const inputStyle = {
        width: "100%", boxSizing: "border-box",
        background: t.bgInput, border: `1px solid ${t.borderInput}`,
        color: t.text, padding: "12px 14px", borderRadius: 12, outline: "none",
        fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300, transition: "all .25s",
    };
    const labelStyle = {
        fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600,
        letterSpacing: ".18em", textTransform: "uppercase",
        color: "rgba(201,169,110,.55)", margin: "0 0 6px", display: "block",
    };

    /* ── CSS global ────────────────────────────────────────────────────── */
    const globalCss = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
    @keyframes dl-spin { to { transform: rotate(360deg); } }
    @keyframes cpOverlayIn  { from{opacity:0} to{opacity:1} }
    @keyframes cpOverlayOut { from{opacity:1} to{opacity:0} }
    @keyframes toastIn { from{opacity:0;transform:translateY(20px) translateX(-50%)} to{opacity:1;transform:translateY(0) translateX(-50%)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    .cp-fade-up { animation: fadeUp .4s ease both; }
    .cp-casa-card { transition: border-color .25s, box-shadow .25s; }
    .cp-casa-card:hover { border-color: ${t.cardHover} !important; box-shadow: 0 8px 32px rgba(201,169,110,.08); }
    .cp-btn-primary {
      background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue});
      color: #fff; border: none; border-radius: 100px;
      font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
      letter-spacing: .14em; text-transform: uppercase; cursor: pointer;
      padding: 11px 22px; transition: all .3s;
      display: inline-flex; align-items: center; gap: 8px;
      box-shadow: 0 6px 20px rgba(0,61,165,.25);
    }
    .cp-btn-primary:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
    .cp-btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .cp-btn-ghost {
      background: transparent; color: ${t.textSec};
      border: 1px solid ${t.border}; border-radius: 100px;
      font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
      letter-spacing: .14em; text-transform: uppercase; cursor: pointer;
      padding: 11px 18px; transition: all .3s;
      display: inline-flex; align-items: center; gap: 7px;
    }
    .cp-btn-ghost:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }
    .cp-btn-gold {
      background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight});
      color: #0A0A0F; border: none; border-radius: 100px;
      font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
      letter-spacing: .14em; text-transform: uppercase; cursor: pointer;
      padding: 10px 18px; transition: all .3s;
      display: inline-flex; align-items: center; gap: 7px;
      box-shadow: 0 6px 20px rgba(201,169,110,.2);
    }
    .cp-btn-gold:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(201,169,110,.3); }
    .cp-btn-gold:disabled { opacity: .5; cursor: not-allowed; }
    .cp-btn-sage {
      background: rgba(122,158,126,.1); color: #7A9E7E;
      border: 1px solid rgba(122,158,126,.3); border-radius: 100px;
      font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600;
      letter-spacing: .12em; text-transform: uppercase; cursor: pointer;
      padding: 9px 16px; transition: all .2s;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .cp-btn-sage:hover { background: rgba(122,158,126,.2); }
    .cp-btn-danger {
      background: rgba(200,16,46,.08); color: #E8294A;
      border: 1px solid rgba(200,16,46,.3); border-radius: 100px;
      font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600;
      letter-spacing: .12em; text-transform: uppercase; cursor: pointer;
      padding: 9px 16px; transition: all .2s;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .cp-btn-danger:hover { background: rgba(200,16,46,.16); }
    .cp-input:focus { border-color: rgba(201,169,110,.5) !important; box-shadow: 0 0 0 3px rgba(201,169,110,.08) !important; }
    .cp-input::placeholder { color: ${t.placeholder}; }
    input[type="date"].cp-input::-webkit-calendar-picker-indicator { filter: ${isDark ? "invert(1) opacity(0.4)" : "opacity(0.5)"}; cursor: pointer; }
    .cp-toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      z-index: 9999; padding: 12px 22px; border-radius: 100px;
      font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600;
      letter-spacing: .12em; text-transform: uppercase;
      display: flex; align-items: center; gap: 10px; white-space: nowrap;
      animation: toastIn .3s ease forwards; box-shadow: 0 8px 32px rgba(0,0,0,.3);
    }
    .cp-toast.success { background: rgba(122,158,126,.95); color: #fff; border: 1px solid rgba(122,158,126,.5); }
    .cp-toast.error   { background: rgba(200,16,46,.9);  color: #fff; border: 1px solid rgba(200,16,46,.5); }
    @media(min-width:500px){ .cp-stats-grid { grid-template-columns: repeat(4,1fr) !important; } }
  `;

    const showToast = (msg, tipo = "success") => {
        setToast({ msg, tipo });
        setTimeout(() => setToast(null), 3500);
    };

    /* ── Carregar casas ────────────────────────────────────────────────── */
    const carregarCasas = useCallback(async () => {
        try {
            setLoading(true);
            const url = celulaId ? `/api/casas-de-paz?celulaId=${celulaId}` : "/api/casas-de-paz";
            const res = await api.get(url);
            const lista = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
            setCasas(lista);
            const todosIds = lista.flatMap(c => (c.visitantes || []).map(v => v.id).filter(Boolean));
            const unicos = [...new Set(todosIds)];
            if (unicos.length > 0) buscarEmLote(unicos);
        } catch (err) { console.error(err); setCasas([]); }
        finally { setLoading(false); }
    }, [celulaId, buscarEmLote]);

    useEffect(() => { carregarCasas(); }, [carregarCasas]);

    /* ── Filtros ──────────────────────────────────────────────────────── */
    const casasFiltradas = casas.filter(c => {
        const textoOk = (c.nome ?? "").toLowerCase().includes(busca.toLowerCase()) ||
            (c.endereco ?? "").toLowerCase().includes(busca.toLowerCase());
        const dataInicioStr  = c.dataInicio ?? c.dataInicioAtividade ?? c.dataCriacao ?? null;
        const dataInicioCasa = dataInicioStr ? new Date(dataInicioStr) : null;
        const inicioOk = !dataInicio || (dataInicioCasa && dataInicioCasa >= new Date(dataInicio));
        const fimOk    = !dataFim    || (dataInicioCasa && dataInicioCasa <= new Date(dataFim + "T23:59:59"));
        return textoOk && inicioOk && fimOk;
    });

    const temFiltro = busca || dataInicio || dataFim;
    const limparFiltros = () => { setBusca(""); setDataInicio(""); setDataFim(""); };

    /* ── Stats ────────────────────────────────────────────────────────── */
    const totalCasas      = casas.length;

    // O backend usa enum StatusCasaDePaz: EM_ANDAMENTO | CONCLUIDA | CANCELADA
    // "Ativa" = EM_ANDAMENTO
    const casasAtivas = casas.filter(c => {
        const s = (c.status || "").toLowerCase().trim();
        return s === "em_andamento" || s.includes("andamento");
    }).length;

    const totalVisitantes = casas.reduce((s, c) => s + (c.visitantes || []).length, 0);
    // encontrosRealizados = 7 - encontrosRestantes (campo que o backend sempre envia)
    const totalEncontros  = casas.reduce((s, c) => {
        const restantes = c.encontrosRestantes ?? TOTAL_ENCONTROS;
        return s + Math.max(0, TOTAL_ENCONTROS - restantes);
    }, 0);

    /* ── Modais ────────────────────────────────────────────────────────── */
    const abrirModalCriar = () => {
        setFCriar({ nome: "", endereco: "", nomeAnfitriao: "", lider: null, auxiliar: null });
        membrosHook.buscar();
        setModalCriar(true);
    };

    const abrirModalVisitante = (casaId) => {
        setTargetCasaId(casaId);
        // FIX 3: garante que a lista de selecionados começa zerada ao abrir o modal
        setVisitantesSelecionados([]);
        visitantesHook.buscar();
        setModalVisitante(true);
    };

    const toggleVisitante = (v) => {
        setVisitantesSelecionados(prev =>
            prev.some(x => x.id === v.id) ? prev.filter(x => x.id !== v.id) : [...prev, v]
        );
    };

    const abrirModalEncontro = (casaId) => {
        setTargetCasaId(casaId);
        setFEnc({ data: new Date().toISOString().split("T")[0] });
        setModalEncontro(true);
    };

    const abrirModalCancelar = (casaId, casaNome) => {
        setTargetCasaId(casaId);
        setTargetCasaNome(casaNome || "");
        setModalCancelar(true);
    };

    /* ── CRUD ─────────────────────────────────────────────────────────── */
    const criarCasa = async () => {
        if (!fCriar.nome.trim())          return alert("Informe o nome da casa.");
        if (!fCriar.nomeAnfitriao.trim()) return alert("Informe o nome do anfitrião.");
        if (!fCriar.lider)                return alert("Selecione o líder.");
        if (!fCriar.auxiliar)             return alert("Selecione o auxiliar.");
        if (fCriar.lider.id === fCriar.auxiliar.id) return alert("Líder e auxiliar devem ser pessoas diferentes.");
        setSubmitting(true);
        try {
            await api.post("/api/casas-de-paz", {
                nome: fCriar.nome.trim(), nomeAnfitriao: fCriar.nomeAnfitriao.trim(),
                endereco: fCriar.endereco.trim(), telefoneContato: "",
                dataInicio: new Date().toISOString().split("T")[0],
                celulaId, liderId: fCriar.lider.id, auxiliarId: fCriar.auxiliar.id,
            });
            setModalCriar(false);
            // FIX 3: reseta visitantes selecionados ao criar nova casa
            setVisitantesSelecionados([]);
            showToast("Casa de paz criada com sucesso!");
            carregarCasas();
        } catch (err) { alert(err.response?.data?.message || "Erro ao criar casa."); }
        finally { setSubmitting(false); }
    };

    /* Adiciona MÚLTIPLOS visitantes de uma vez */
    const adicionarVisitantes = async () => {
        if (visitantesSelecionados.length === 0) return alert("Selecione ao menos um visitante.");
        setSubmitting(true);
        try {
            await Promise.allSettled(
                visitantesSelecionados.map(v =>
                    api.post(`/api/casas-de-paz/${targetCasaId}/visitantes/${v.id}`)
                )
            );
            setModalVisitante(false);
            // FIX 3: zera seleção após confirmar
            setVisitantesSelecionados([]);
            showToast(`${visitantesSelecionados.length} visitante(s) adicionado(s)!`);
            carregarCasas();
        } catch (err) { alert(err.response?.data?.message || "Erro ao adicionar visitantes."); }
        finally { setSubmitting(false); }
    };

    /* Registra encontro — sem campos de decisão espiritual */
    const registrarEncontro = async () => {
        if (!fEnc.data) return showToast("Informe a data do encontro.", "error");

        const casaAlvo = casas.find(c => c.id === targetCasaId);
        if (casaAlvo) {
            const encontrosExistentes = Array.isArray(casaAlvo.encontros) ? casaAlvo.encontros : [];
            const dataJaUsada = encontrosExistentes.some(e => {
                const dataE = (e.dataEncontro ?? e.data ?? "").toString().slice(0, 10);
                return dataE === fEnc.data;
            });
            if (dataJaUsada) {
                showToast(`Já existe um encontro em ${formatarData(fEnc.data)}.`, "error");
                return;
            }
        }

        setSubmitting(true);

        try {
            await api.post(`/api/casas-de-paz/${targetCasaId}/encontros`, {
                dataEncontro: fEnc.data,
                observacoes: fEnc.observacoes || "",
                decisoes: [],
            });

            // Sucesso — fecha modal primeiro, depois efeitos colaterais
            setModalEncontro(false);
            setFEnc({ data: new Date().toISOString().split("T")[0] });

            if (celulaId) {
                try {
                    await api.put(`/metas/celula/${celulaId}/recalcular`);
                    window.dispatchEvent(new CustomEvent("ieq:metas:recalculadas", { detail: { celulaId } }));
                    showToast("Encontro registrado e metas atualizadas!");
                } catch {
                    showToast("Encontro salvo, mas falha ao atualizar metas.", "error");
                }
            } else {
                showToast("Encontro registrado com sucesso!");
            }

            carregarCasas();

        } catch (err) {
            const msg =
                err.response?.data?.message ??
                "Ocorreu um erro inesperado. Tente novamente.";
            showToast(msg, "error");
        } finally {
            setSubmitting(false); // ← garante que sempre destrava o botão
        }
    };
    const cancelarCasa = async () => {
        setSubmitting(true);
        try {
            await api.patch(`/api/casas-de-paz/${targetCasaId}/cancelar`);
            setModalCancelar(false);
            showToast("Casa cancelada.", "error");
            carregarCasas();
        } catch (err) { alert(err.response?.data?.message || "Erro ao cancelar."); }
        finally { setSubmitting(false); }
    };

    /* ── Loading ──────────────────────────────────────────────────────── */
    if (loading) return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
            <style>{globalCss}</style>
            <Loader2 size={28} style={{ animation: "dl-spin 1s linear infinite", color: AURA.gold }} />
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".22em", textTransform: "uppercase", color: t.textMuted, marginTop: 14 }}>
                Carregando casas de paz...
            </p>
        </div>
    );

    /* ══════════════════════════════════════════════════════════════════ */
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <style>{globalCss}</style>

            {toast && (
                <div className={`cp-toast ${toast.tipo}`}>
                    {toast.tipo === "success" ? "✓" : "✕"} {toast.msg}
                </div>
            )}

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(0,61,165,.1)", border: "1px solid rgba(0,61,165,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Home size={20} color={AURA.blue} />
                    </div>
                    <div>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(201,169,110,.55)", margin: "0 0 2px" }}>
                            Evangelismo
                        </p>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 500, color: t.text, margin: 0 }}>
                            Casas de Paz
                        </h2>
                    </div>
                </div>
                <button className="cp-btn-primary" onClick={abrirModalCriar}>
                    <Plus size={14} /> Nova Casa
                </button>
            </div>

            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${AURA.gold}, transparent)`, opacity: .2 }} />

            {/* ── Stats ──────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }} className="cp-stats-grid">
                {[
                    { label: "Total",      value: totalCasas,      color: t.text,      sub: "casas"       },
                    { label: "Ativas",     value: casasAtivas,     color: "#7A9E7E",   sub: "funcionando" },
                    { label: "Visitantes", value: totalVisitantes, color: AURA.yellow, sub: "cadastrados" },
                    { label: "Encontros",  value: totalEncontros,  color: AURA.gold,   sub: "realizados"  },
                ].map((s, i) => (
                    <div key={s.label} className="cp-fade-up" style={{
                        background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 16,
                        padding: "18px 20px", backdropFilter: "blur(24px)", animationDelay: `${i * 0.07}s`,
                        position: "relative", overflow: "hidden",
                    }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${AURA.gold}, transparent)`, opacity: .15 }} />
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: t.textMuted, margin: 0 }}>{s.label}</p>
                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 600, color: s.color, margin: "4px 0 2px" }}>{s.value}</p>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 300, color: t.textMuted, margin: 0 }}>{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Filtros ────────────────────────────────────────────────── */}
            <div style={{ background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 16, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: t.textMuted, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                        <Search size={11} /> Filtros de Busca
                    </p>
                    {temFiltro && (
                        <button className="cp-btn-ghost" style={{ padding: "6px 14px", fontSize: 9 }} onClick={limparFiltros}>
                            ✕ Limpar filtros
                        </button>
                    )}
                </div>
                <div style={{ position: "relative" }}>
                    <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: AURA.gold, opacity: .5, pointerEvents: "none" }} />
                    <input className="cp-input" style={{ ...inputStyle, paddingLeft: 42 }} placeholder="Buscar por nome ou endereço..." value={busca} onChange={e => setBusca(e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                        <p style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 5 }}><Calendar size={9} /> Data início — de</p>
                        <input type="date" className="cp-input" style={inputStyle} value={dataInicio} max={dataFim || undefined} onChange={e => setDataInicio(e.target.value)} />
                    </div>
                    <div>
                        <p style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 5 }}><Calendar size={9} /> Data início — até</p>
                        <input type="date" className="cp-input" style={inputStyle} value={dataFim} min={dataInicio || undefined} onChange={e => setDataFim(e.target.value)} />
                    </div>
                </div>
                {temFiltro && (
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 300, color: t.textSec, margin: 0, fontStyle: "italic" }}>
                        {casasFiltradas.length === 0 ? "Nenhuma casa encontrada." : `${casasFiltradas.length} casa(s) encontrada(s).`}
                    </p>
                )}
            </div>

            {/* ── Lista ──────────────────────────────────────────────────── */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 500, color: t.text, margin: 0 }}>Lista de Casas</p>
                    <button className="cp-btn-ghost" onClick={carregarCasas} style={{ padding: "8px 16px", fontSize: 9 }}>↺ Atualizar</button>
                </div>

                {casas.length === 0 ? (
                    <div style={{ background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 16, textAlign: "center", padding: "56px 24px" }}>
                        <Home size={36} style={{ color: t.textMuted, marginBottom: 14 }} />
                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: t.textSec, margin: "0 0 6px" }}>Nenhuma casa cadastrada</p>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, color: t.textMuted, fontStyle: "italic" }}>Clique em "Nova Casa" para começar.</p>
                    </div>
                ) : casasFiltradas.length === 0 ? (
                    <div style={{ background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 16, textAlign: "center", padding: "40px 24px" }}>
                        <Search size={28} style={{ color: t.textMuted, marginBottom: 12 }} />
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: t.textMuted }}>Ajuste os filtros para encontrar uma casa.</p>
                    </div>
                ) : casasFiltradas.map((c, i) => {
                    const isOpen     = expandedId === c.id;
                    const visitantes = c.visitantes || [];
                    const encontros  = Array.isArray(c.encontros) ? c.encontros : [];

                    // Backend sempre envia encontrosRestantes (começa em 7, decrementa a cada encontro).
                    // encontrosRealizados NÃO existe na entidade — só no RelatorioCasaDePazDTO.
                    // Portanto: realizados = 7 - restantes. Array c.encontros é o fallback.
                    let realizados, restantes;

                    if (c.encontrosRestantes !== undefined && c.encontrosRestantes !== null) {
                        restantes  = Math.max(0, Math.min(TOTAL_ENCONTROS, Number(c.encontrosRestantes) || 0));
                        realizados = TOTAL_ENCONTROS - restantes;
                    } else if (c.encontrosRealizados !== undefined && c.encontrosRealizados !== null) {
                        // Caso venha do endpoint de relatório
                        realizados = Math.max(0, Math.min(TOTAL_ENCONTROS, Number(c.encontrosRealizados) || 0));
                        restantes  = TOTAL_ENCONTROS - realizados;
                    } else {
                        // Fallback pelo array de encontros
                        realizados = Math.max(0, encontros.length);
                        restantes  = Math.max(0, TOTAL_ENCONTROS - realizados);
                    }

                    realizados = Math.min(realizados, TOTAL_ENCONTROS);
                    restantes  = Math.min(restantes,  TOTAL_ENCONTROS);

                    const cancelada = (c.status || "").toLowerCase().includes("cancel");
                    const concluida = (c.status || "").toLowerCase().includes("conclu") ||
                        (restantes === 0 && realizados >= TOTAL_ENCONTROS && !cancelada);

                    return (
                        <motion.div key={c.id} className="cp-casa-card"
                                    style={{
                                        background: t.bgEl,
                                        border: `1px solid ${concluida ? "rgba(122,158,126,.4)" : isOpen ? "rgba(201,169,110,.3)" : t.border}`,
                                        borderRadius: 16, marginBottom: 10, overflow: "hidden",
                                        backdropFilter: "blur(24px)", position: "relative",
                                    }}
                                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        >
                            {(isOpen || concluida) && (
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: concluida ? "linear-gradient(90deg,transparent,#7A9E7E,transparent)" : `linear-gradient(90deg,transparent,${AURA.gold},transparent)`, opacity: .5 }} />
                            )}

                            {/* Cabeçalho */}
                            <div onClick={() => setExpandedId(isOpen ? null : c.id)}
                                 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer", gap: 12, flexWrap: "wrap" }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: concluida ? "rgba(122,158,126,.12)" : "rgba(0,61,165,.1)", border: `1px solid ${concluida ? "rgba(122,158,126,.3)" : "rgba(0,61,165,.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                                        {concluida ? "🏆" : "🏠"}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 500, color: t.text, margin: 0 }}>{c.nome || `Casa ${c.id}`}</p>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 300, color: t.textSec, margin: "2px 0 0" }}>{c.endereco || "Endereço não informado"}</p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                    <div style={{ textAlign: "center", width: 44, height: 44, borderRadius: "50%", border: `2px solid ${concluida ? "#7A9E7E" : "rgba(201,169,110,.3)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: concluida ? "#7A9E7E" : t.text, lineHeight: 1 }}>{restantes}</span>
                                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, color: t.textMuted, lineHeight: 1, marginTop: 2, fontWeight: 500 }}>REST.</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 14 }}>
                                        <div style={{ textAlign: "center" }}>
                                            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: t.text, margin: 0 }}>{visitantes.length}</p>
                                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 300, color: t.textMuted, margin: 0 }}>visitas</p>
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: concluida ? "#7A9E7E" : t.text, margin: 0 }}>{realizados}/{TOTAL_ENCONTROS}</p>
                                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 300, color: t.textMuted, margin: 0 }}>encontros</p>
                                        </div>
                                    </div>
                                    <BadgeStatus status={concluida ? "concluida" : c.status} />
                                    <ChevronDown size={16} color={t.textMuted} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .25s" }} />
                                </div>
                            </div>

                            {/* Barra de progresso */}
                            <div style={{ padding: "0 20px 4px" }}>
                                <div style={{ display: "flex", gap: 4 }}>
                                    {Array.from({ length: TOTAL_ENCONTROS }, (_, idx) => (
                                        <div key={idx} style={{ flex: 1, height: 3, borderRadius: 99, background: idx < realizados ? (concluida ? "#7A9E7E" : AURA.gold) : (isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"), transition: "background .3s" }} />
                                    ))}
                                </div>
                            </div>

                            {/* Banner concluída */}
                            {concluida && (
                                <div style={{ margin: "12px 20px 4px", padding: "14px 18px", borderRadius: 12, background: isDark ? "rgba(122,158,126,.08)" : "rgba(122,158,126,.06)", border: "1px solid rgba(122,158,126,.3)", display: "flex", alignItems: "center", gap: 12 }}>
                                    <span style={{ fontSize: 24, flexShrink: 0 }}>🏆</span>
                                    <div>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: "#7A9E7E", margin: "0 0 3px" }}>Casa Concluída!</p>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 300, color: t.textSec, margin: 0 }}>Todos os {TOTAL_ENCONTROS} encontros foram realizados.</p>
                                    </div>
                                </div>
                            )}

                            {/* Ações */}
                            <div style={{ display: "flex", gap: 8, padding: "10px 20px 14px", flexWrap: "wrap" }}>
                                {!cancelada && !concluida && <button className="cp-btn-sage"  onClick={() => abrirModalVisitante(c.id)}>+ Visitantes</button>}
                                {!cancelada && !concluida && <button className="cp-btn-gold"  onClick={() => abrirModalEncontro(c.id)} style={{ fontSize: 9, padding: "9px 16px" }}>📋 Registrar Encontro</button>}
                                {!cancelada              && <button className="cp-btn-danger" onClick={() => abrirModalCancelar(c.id, c.nome)}>✕ Cancelar</button>}
                            </div>

                            {/* Painel expandido */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }} style={{ overflow: "hidden" }}>
                                        <div style={{ borderTop: `1px solid ${t.border}`, padding: "18px 20px 22px", display: "flex", flexDirection: "column", gap: 20 }}>

                                            {/* Líderes */}
                                            {(c.liderNome || c.auxiliarNome) && (
                                                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                                    {[{ label: "Líder", nome: c.liderNome }, { label: "Auxiliar", nome: c.auxiliarNome }].map(({ label, nome }) => nome ? (
                                                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,rgba(201,169,110,.2),rgba(201,169,110,.06))", border: "1px solid rgba(201,169,110,.22)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 13, color: AURA.gold }}>
                                                                {nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: t.textMuted, margin: 0 }}>{label}</p>
                                                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, color: t.text, margin: 0 }}>{nome}</p>
                                                            </div>
                                                        </div>
                                                    ) : null)}
                                                </div>
                                            )}

                                            {/* Visitantes */}
                                            <div>
                                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 10px" }}>
                                                    Visitantes ({visitantes.length})
                                                </p>
                                                {visitantes.length ? (
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                        {visitantes.map((v, vi) => {
                                                            const decisao = historicoDecisoes[v.id] !== undefined ? historicoDecisoes[v.id] : (v.decisaoEspiritual ?? null);
                                                            const temDecisao = decisao && decisao !== "NENHUMA";
                                                            const cfg  = temDecisao ? DECISAO_CONFIG[decisao] : null;
                                                            const nome = v.nome ?? v.nomeCompleto ?? v.name ?? `#${v.id}`;
                                                            return (
                                                                <div key={vi} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                                    <div style={{ background: cfg ? `${cfg.cor}12` : (isDark ? "rgba(201,169,110,.06)" : "rgba(201,169,110,.08)"), border: `1px solid ${cfg ? cfg.cor + "35" : "rgba(201,169,110,.18)"}`, borderRadius: 99, padding: "5px 14px", fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, color: cfg ? cfg.cor : t.text, display: "flex", alignItems: "center", gap: 6 }}>
                                                                        <span>{cfg ? cfg.icone : "👤"}</span>
                                                                        <span style={{ fontWeight: cfg ? 500 : 300 }}>{nome}</span>
                                                                    </div>
                                                                    {temDecisao && <div style={{ paddingLeft: 8 }}><BadgeDecisao decisao={decisao} /></div>}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, fontStyle: "italic", color: t.textMuted }}>Nenhum visitante cadastrado ainda.</p>
                                                )}
                                            </div>

                                            {/* Histórico de encontros */}
                                            <div>
                                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 12px" }}>
                                                    Histórico de Encontros ({realizados}/{TOTAL_ENCONTROS})
                                                </p>
                                                {encontros.length > 0 ? (
                                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                                        {[...encontros]
                                                            .sort((a, b) => new Date(b.dataEncontro ?? b.data ?? 0) - new Date(a.dataEncontro ?? a.data ?? 0))
                                                            .map((e, ei, arr) => {
                                                                const dataRaw = e.dataEncontro ?? e.data;
                                                                const num     = arr.length - ei;
                                                                const isLast  = ei === arr.length - 1;
                                                                return (
                                                                    <div key={ei} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "10px 0", borderBottom: !isLast ? `1px solid ${t.border}` : "none" }}>
                                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 4 }}>
                                                                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: ei === 0 ? AURA.gold : (isDark ? "rgba(201,169,110,.3)" : "rgba(201,169,110,.4)"), border: `1.5px solid ${AURA.gold}` }} />
                                                                            {!isLast && <div style={{ width: 1, minHeight: 24, background: isDark ? "rgba(201,169,110,.12)" : "rgba(201,169,110,.2)", marginTop: 4 }} />}
                                                                        </div>
                                                                        <div style={{ flex: 1 }}>
                                                                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                                                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, color: t.text, margin: 0 }}>Encontro {num}</p>
                                                                                {ei === 0 && (
                                                                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", background: "rgba(201,169,110,.12)", color: AURA.gold, border: "1px solid rgba(201,169,110,.25)", borderRadius: 99, padding: "2px 8px" }}>
                                            Mais recente
                                          </span>
                                                                                )}
                                                                            </div>
                                                                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 300, color: t.textSec, margin: "3px 0 0", display: "flex", alignItems: "center", gap: 5 }}>
                                                                                <Calendar size={11} style={{ flexShrink: 0 }} /> {formatarData(dataRaw)}
                                                                            </p>
                                                                            {e.observacoes && (
                                                                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 300, fontStyle: "italic", color: t.textMuted, margin: "4px 0 0", lineHeight: 1.5 }}>
                                                                                    {e.observacoes}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                ) : (
                                                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, fontStyle: "italic", color: t.textMuted }}>
                                                        Nenhum encontro registrado ainda.
                                                    </p>
                                                )}
                                                {restantes > 0 && !cancelada && (
                                                    <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: isDark ? "rgba(201,169,110,.04)" : "rgba(201,169,110,.06)", border: "1px dashed rgba(201,169,110,.2)" }}>
                                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 300, color: t.textMuted, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                                                            <Calendar size={12} />
                                                            {restantes === 1 ? "Falta 1 encontro para concluir esta casa." : `Faltam ${restantes} encontros para concluir esta casa.`}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* MODAIS                                                        */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>

                {/* ── Registrar Encontro — sem decisões espirituais ─────────── */}
                {modalEncontro && (
                    <AuraModal open={modalEncontro} onClose={() => setModalEncontro(false)} title="Registrar Encontro" t={t}>
                        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

                            <div>
                                <p style={labelStyle}>Data do encontro *</p>
                                <input className="cp-input" style={inputStyle} type="date" value={fEnc.data} onChange={e => setFEnc(f => ({ ...f, data: e.target.value }))} />
                            </div>

                            <div>
                                <p style={labelStyle}>Observações (opcional)</p>
                                <textarea
                                    className="cp-input"
                                    style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                                    placeholder="Anotações sobre o encontro..."
                                    value={fEnc.observacoes || ""}
                                    onChange={e => setFEnc(f => ({ ...f, observacoes: e.target.value }))}
                                />
                            </div>

                            {/* Aviso — decisões espirituais bloqueadas aqui */}
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 12, background: isDark ? "rgba(201,169,110,.05)" : "rgba(201,169,110,.06)", border: "1px solid rgba(201,169,110,.2)" }}>
                                <Lock size={16} style={{ color: AURA.gold, flexShrink: 0, marginTop: 1 }} />
                                <div>
                                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: AURA.gold, margin: "0 0 3px", letterSpacing: ".05em" }}>
                                        Decisões espirituais
                                    </p>
                                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 300, color: t.textSec, margin: 0, lineHeight: 1.55 }}>
                                        Para registrar uma decisão espiritual de um visitante, acesse a <strong style={{ color: t.text }}>Tela de Visitantes</strong> e edite diretamente o perfil dele.
                                    </p>
                                </div>
                            </div>

                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="cp-btn-ghost" style={{ flex: 1 }} onClick={() => setModalEncontro(false)}>Cancelar</button>
                            <button className="cp-btn-primary" style={{ flex: 2, justifyContent: "center" }} onClick={registrarEncontro} disabled={submitting}>
                                {submitting ? <Loader2 size={14} style={{ animation: "dl-spin 1s linear infinite" }} /> : "Registrar Encontro"}
                            </button>
                        </div>
                    </AuraModal>
                )}

                {/* ── Nova Casa ─────────────────────────────────────────────── */}
                {modalCriar && (
                    <AuraModal open={modalCriar} onClose={() => setModalCriar(false)} title="Nova Casa de Paz" t={t}>
                        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <p style={labelStyle}>Nome da Casa *</p>
                                    <input className="cp-input" style={inputStyle} placeholder="Casa da Esperança" value={fCriar.nome} onChange={e => setFCriar(f => ({ ...f, nome: e.target.value }))} />
                                </div>
                                <div>
                                    <p style={labelStyle}>Anfitrião *</p>
                                    <input className="cp-input" style={inputStyle} placeholder="João Silva" value={fCriar.nomeAnfitriao} onChange={e => setFCriar(f => ({ ...f, nomeAnfitriao: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <p style={labelStyle}>Endereço</p>
                                <input className="cp-input" style={inputStyle} placeholder="Rua, número, bairro" value={fCriar.endereco} onChange={e => setFCriar(f => ({ ...f, endereco: e.target.value }))} />
                            </div>
                            <div>
                                <p style={labelStyle}>Líder *</p>
                                <MembroSelector items={membrosHook.membros} loading={membrosHook.loading} erro={membrosHook.erro} selectedId={fCriar.lider?.id} onSelect={p => setFCriar(f => ({ ...f, lider: p }))} placeholder="Pesquisar líder..." t={t} isDark={isDark} />
                            </div>
                            <div>
                                <p style={labelStyle}>Auxiliar *</p>
                                <MembroSelector items={membrosHook.membros.filter(m => m.id !== fCriar.lider?.id)} loading={membrosHook.loading} erro={membrosHook.erro} selectedId={fCriar.auxiliar?.id} onSelect={p => setFCriar(f => ({ ...f, auxiliar: p }))} placeholder="Pesquisar auxiliar..." t={t} isDark={isDark} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="cp-btn-ghost" style={{ flex: 1 }} onClick={() => setModalCriar(false)}>Cancelar</button>
                            <button className="cp-btn-primary" style={{ flex: 2, justifyContent: "center" }} onClick={criarCasa} disabled={submitting}>
                                {submitting ? <Loader2 size={14} style={{ animation: "dl-spin 1s linear infinite" }} /> : "Criar Casa"}
                            </button>
                        </div>
                    </AuraModal>
                )}

                {/* ── Adicionar Visitantes (múltiplo) ───────────────────────── */}
                {modalVisitante && (
                    <AuraModal open={modalVisitante} onClose={() => { setModalVisitante(false); setVisitantesSelecionados([]); }} title="Adicionar Visitantes" t={t}>
                        <div style={{ padding: "16px 24px 8px" }}>
                            <VisitanteMultiSelector
                                items={visitantesHook.visitantes}
                                loading={visitantesHook.loading}
                                erro={visitantesHook.erro}
                                selecionados={visitantesSelecionados}
                                onToggle={toggleVisitante}
                                t={t}
                                isDark={isDark}
                            />
                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "12px 24px 24px" }}>
                            <button className="cp-btn-ghost" style={{ flex: 1 }} onClick={() => { setModalVisitante(false); setVisitantesSelecionados([]); }}>Cancelar</button>
                            <button
                                className="cp-btn-primary"
                                style={{ flex: 2, justifyContent: "center" }}
                                onClick={adicionarVisitantes}
                                disabled={submitting || visitantesSelecionados.length === 0}
                            >
                                {submitting
                                    ? <Loader2 size={14} style={{ animation: "dl-spin 1s linear infinite" }} />
                                    : visitantesSelecionados.length > 0
                                        ? `Adicionar ${visitantesSelecionados.length} visitante${visitantesSelecionados.length > 1 ? "s" : ""}`
                                        : "Selecione visitantes"
                                }
                            </button>
                        </div>
                    </AuraModal>
                )}

                {/* ── Cancelar Casa ─────────────────────────────────────────── */}
                {modalCancelar && (
                    <AuraModal open={modalCancelar} onClose={() => setModalCancelar(false)} title="Cancelar Casa" t={t}>
                        <div style={{ padding: "16px 24px 20px" }}>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300, color: t.text, lineHeight: 1.6 }}>
                                Tem certeza que deseja cancelar <strong>"{targetCasaNome}"</strong>? Esta ação não poderá ser desfeita facilmente.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="cp-btn-ghost" style={{ flex: 1 }} onClick={() => setModalCancelar(false)}>Voltar</button>
                            <button
                                className="cp-btn-danger"
                                style={{ flex: 2, justifyContent: "center", padding: "12px 20px", fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", cursor: "pointer", borderRadius: 100, display: "inline-flex", alignItems: "center" }}
                                onClick={cancelarCasa} disabled={submitting}
                            >
                                {submitting ? <Loader2 size={14} style={{ animation: "dl-spin 1s linear infinite" }} /> : "Sim, Cancelar"}
                            </button>
                        </div>
                    </AuraModal>
                )}

            </AnimatePresence>
        </div>
    );
}
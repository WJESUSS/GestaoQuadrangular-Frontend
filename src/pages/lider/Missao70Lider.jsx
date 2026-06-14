import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Plus, X, Loader2, CheckCircle2, ChevronDown, Search, Calendar } from "lucide-react";

/* ─── Tokens AURA ─── */
const AURA = {
    gold:      "#C9A96E",
    goldLight: "#E8D5A3",
    dark:      "#0A0A0F",
    red:       "#C8102E",
    redDark:   "#9B0B1E",
    blue:      "#003DA5",
    blueDark:  "#002470",
    yellow:    "#FDB813",
    sage:      "#7A9E7E",
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
        placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
        optionBg:    isDark ? "#12121A"                : "#F0EAE0",
    };
}

const TOTAL_SEMANAS = 4;

const DECISAO_CONFIG = {
    ACEITOU_JESUS: { label: "Aceitou Jesus", cor: "#185FA5", bg: "#E6F1FB", borda: "#B5D4F4", icone: "✝️" },
    RECONCILIOU:   { label: "Reconciliou",   cor: "#854F0B", bg: "#FAEEDA", borda: "#FAC775", icone: "🤝" },
    BATISMO_AGUAS: { label: "Deseja Batismo",cor: "#0F6E56", bg: "#E1F5EE", borda: "#9FE1CB", icone: "💧" },
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

function BadgeDecisao({ decisao }) {
    const cfg = decisao && decisao !== "NENHUMA" ? DECISAO_CONFIG[decisao] : null;
    if (!cfg) return null;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 9px", borderRadius: 99,
            fontSize: 11, fontWeight: 600, fontFamily: "'Inter',sans-serif",
            background: cfg.bg, color: cfg.cor, border: `1px solid ${cfg.borda}`,
            whiteSpace: "nowrap", flexShrink: 0,
        }}>
            {cfg.icone} {cfg.label}
        </span>
    );
}

function BadgeStatus({ status }) {
    const s = (status || "").toLowerCase();
    const badge = (color, label) => (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 12px", borderRadius: 99,
            fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600,
            letterSpacing: ".12em", textTransform: "uppercase",
            color, border: `1px solid ${color}55`, background: `${color}18`,
        }}>{label}</span>
    );
    if (s.includes("ativ"))   return badge(AURA.sage, "Ativa");
    if (s.includes("cancel")) return badge(AURA.red, "Cancelada");
    if (s.includes("conclu")) return badge(AURA.yellow, "Concluída");
    return badge(AURA.yellow, "Pendente");
}

function AuraModal({ open, onClose, title, children, t }) {
    if (!open) return null;
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: "fixed", inset: 0, background: "rgba(10,10,15,.88)", backdropFilter: "blur(4px)", zIndex: 0 }} />
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                        transition={{ type: "tween", duration: .28 }}
                        style={{
                            position: "relative", zIndex: 10, width: "100%", maxWidth: 480,
                            background: t.bgEl, border: `1px solid ${t.border}`,
                            borderRadius: "22px 22px 0 0", overflow: "hidden",
                            maxHeight: "90vh", display: "flex", flexDirection: "column",
                        }}>
                <div style={{ padding: "22px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexShrink: 0 }}>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 500, color: t.text, margin: 0 }}>{title}</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 4, display: "flex" }}><X size={20} /></button>
                </div>
                <div style={{ overflowY: "auto", flex: 1 }}>{children}</div>
            </motion.div>
        </div>
    );
}

/* ── Hooks ── */
function useMembros(celulaId) {
    const [membros, setMembros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro]       = useState(null);
    const buscar = useCallback(async () => {
        if (!celulaId) return;
        setLoading(true); setErro(null);
        try {
            const res = await api.get(`/celulas/${celulaId}/membros`);
            setMembros(Array.isArray(res.data) ? res.data : res.data?.content ?? res.data?.data ?? []);
        } catch {
            setErro("Não foi possível carregar membros da célula."); setMembros([]);
        } finally { setLoading(false); }
    }, [celulaId]);
    return { membros, loading, erro, buscar };
}

function useVisitantes(celulaId) {
    const [visitantes, setVisitantes] = useState([]);
    const [loading, setLoading]       = useState(false);
    const [erro, setErro]             = useState(null);
    const buscar = useCallback(async () => {
        if (!celulaId) return;
        setLoading(true); setErro(null);
        try {
            const res = await api.get(`/celulas/${celulaId}/visitantes`);
            setVisitantes(Array.isArray(res.data) ? res.data : res.data?.content ?? res.data?.data ?? []);
        } catch {
            setErro("Não foi possível carregar visitantes da célula."); setVisitantes([]);
        } finally { setLoading(false); }
    }, [celulaId]);
    return { visitantes, loading, erro, buscar };
}

function useHistoricoDecisoes() {
    const [historico, setHistorico] = useState({});

    const buscarDecisao = useCallback(async (visitanteId) => {
        if (!visitanteId || historico[visitanteId] !== undefined) return;
        try {
            const res = await api.get(`/visitantes/${visitanteId}/historico-decisoes`);
            const decisao = extrairDecisaoAtual(res.data);
            setHistorico(prev => ({ ...prev, [visitanteId]: decisao }));
        } catch {
            try {
                const res2 = await api.get(`/visitantes/${visitanteId}`);
                const decisao = res2.data?.decisaoEspiritual ?? null;
                setHistorico(prev => ({ ...prev, [visitanteId]: decisao }));
            } catch {
                setHistorico(prev => ({ ...prev, [visitanteId]: null }));
            }
        }
    }, [historico]);

    const buscarEmLote = useCallback(async (visitanteIds) => {
        const novos = visitanteIds.filter(id => historico[id] === undefined);
        if (novos.length === 0) return;
        await Promise.all(novos.map(id => buscarDecisao(id)));
    }, [buscarDecisao, historico]);

    return { historico, buscarDecisao, buscarEmLote };
}

/* ── Multi-Seleção de Visitantes (AURA) ── */
function VisitanteMultiSelector({ items, loading, erro, selectedIds, onToggle, onSelectAll, onClearAll, t, accentColor = AURA.gold }) {
    const [busca, setBusca] = useState("");
    const filtrados = items.filter(p => (p.nome ?? p.nomeCompleto ?? "").toLowerCase().includes(busca.toLowerCase()));
    const totalSelecionados = selectedIds.size;
    const todosFiltradosSelecionados = filtrados.length > 0 && filtrados.every(p => selectedIds.has(p.id));

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0", color: t.textSec, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300 }}>
            <Loader2 size={16} className="m70-spin" style={{ color: accentColor }} /> Carregando...
        </div>
    );
    if (erro) return <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 13, fontWeight: 300, color: AURA.red, padding: "12px 0" }}>{erro}</p>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Busca */}
            <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: accentColor, opacity: .5, pointerEvents: "none" }} />
                <input
                    className="m70-input"
                    placeholder="Buscar visitante..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    style={{ paddingLeft: 38 }}
                />
            </div>

            {/* Barra de ações em lote */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 10, background: totalSelecionados > 0 ? `${accentColor}12` : "transparent", border: `1px solid ${totalSelecionados > 0 ? `${accentColor}40` : t.border}`, transition: "all .2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                        type="checkbox"
                        checked={todosFiltradosSelecionados}
                        onChange={() => todosFiltradosSelecionados ? onClearAll(filtrados.map(p => p.id)) : onSelectAll(filtrados.map(p => p.id))}
                        style={{ width: 15, height: 15, accentColor, cursor: "pointer", flexShrink: 0 }}
                    />
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 300, color: t.textSec }}>
                        {todosFiltradosSelecionados ? "Desmarcar todos" : "Selecionar todos"}
                        {busca ? " (filtrados)" : ""}
                    </span>
                </div>
                {totalSelecionados > 0 && (
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: accentColor, letterSpacing: ".05em" }}>
                        {totalSelecionados} selecionado{totalSelecionados !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* Lista de visitantes */}
            <div style={{ maxHeight: 240, overflowY: "auto", border: `1px solid ${t.border}`, borderRadius: 12 }}>
                {filtrados.length === 0
                    ? <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 13, fontWeight: 300, color: t.textMuted, padding: "14px 16px", margin: 0 }}>
                        {busca ? `Nenhum resultado para "${busca}".` : "Nenhum visitante encontrado nesta célula."}
                    </p>
                    : filtrados.map((p, i) => {
                        const nome = p.nome ?? p.nomeCompleto ?? `#${p.id}`;
                        const sel  = selectedIds.has(p.id);
                        return (
                            <div
                                key={p.id}
                                onClick={() => onToggle(p)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: "11px 14px", cursor: "pointer",
                                    background: sel ? `${accentColor}10` : "transparent",
                                    borderBottom: i < filtrados.length - 1 ? `1px solid ${t.border}` : "none",
                                    transition: "background .15s",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={sel}
                                    onChange={() => onToggle(p)}
                                    onClick={e => e.stopPropagation()}
                                    style={{ width: 15, height: 15, accentColor, cursor: "pointer", flexShrink: 0 }}
                                />
                                <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: sel ? `${accentColor}20` : `linear-gradient(135deg,${accentColor}18,${accentColor}06)`, border: `1px solid ${sel ? accentColor + "50" : accentColor + "22"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 13, color: accentColor, transition: "all .15s" }}>
                                    {nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: sel ? 500 : 300, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nome}</p>
                                    {p.telefone && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 300, color: t.textMuted, margin: "1px 0 0" }}>{p.telefone}</p>}
                                </div>
                                {sel && <CheckCircle2 size={16} color={accentColor} style={{ flexShrink: 0 }} />}
                            </div>
                        );
                    })}
            </div>

            {/* Chips dos selecionados */}
            {totalSelecionados > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: accentColor, margin: 0 }}>
                        Serão adicionados ({totalSelecionados})
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {[...selectedIds].map(id => {
                            const p = items.find(x => x.id === id);
                            if (!p) return null;
                            const nome = p.nome ?? p.nomeCompleto ?? `#${p.id}`;
                            return (
                                <div key={id} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 8px", borderRadius: 99, background: `${accentColor}14`, border: `1px solid ${accentColor}35`, fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 400, color: t.text }}>
                                    <span style={{ color: accentColor, fontSize: 10 }}>✦</span>
                                    {nome}
                                    <button
                                        onClick={e => { e.stopPropagation(); onToggle(p); }}
                                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: t.textMuted, marginLeft: 2 }}
                                    >
                                        <X size={11} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Pessoa Selector — mantido para Líder/Auxiliar ── */
function PessoaSelector({ items, loading, erro, onSelect, selectedId, placeholder, t, labelKey = "nome" }) {
    const [busca, setBusca] = useState("");
    const filtrados = items.filter(p => (p[labelKey] ?? p.nomeCompleto ?? "").toLowerCase().includes(busca.toLowerCase()));

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0", color: t.textSec, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300 }}>
            <Loader2 size={16} className="m70-spin" style={{ color: AURA.gold }} /> Carregando...
        </div>
    );
    if (erro) return <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 13, fontWeight: 300, color: AURA.red, padding: "12px 0" }}>{erro}</p>;

    return (
        <div>
            <div style={{ position: "relative", marginBottom: 10 }}>
                <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: AURA.gold, opacity: .5, pointerEvents: "none" }} />
                <input className="m70-input" placeholder={placeholder} value={busca} onChange={e => setBusca(e.target.value)}
                       style={{ width: "100%", boxSizing: "border-box", background: t.bgInput, border: `1px solid ${t.borderInput}`, color: t.text, padding: "11px 14px 11px 38px", borderRadius: 12, outline: "none", fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300 }} />
            </div>
            <div style={{ maxHeight: 200, overflowY: "auto", border: `1px solid ${t.border}`, borderRadius: 12 }}>
                {filtrados.length === 0
                    ? <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 13, fontWeight: 300, color: t.textMuted, padding: "14px 16px", margin: 0 }}>
                        {busca ? `Nenhum resultado para "${busca}".` : "Nenhum visitante encontrado nesta célula."}
                    </p>
                    : filtrados.map((p, i) => {
                        const nome = p[labelKey] ?? p.nomeCompleto ?? `#${p.id}`;
                        const sel  = selectedId === p.id;
                        return (
                            <div key={p.id} onClick={() => onSelect(p)}
                                 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", cursor: "pointer", background: sel ? "rgba(201,169,110,.1)" : "transparent", borderBottom: i < filtrados.length - 1 ? `1px solid ${t.border}` : "none", transition: "background .15s" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: "linear-gradient(135deg,rgba(201,169,110,.2),rgba(201,169,110,.06))", border: "1px solid rgba(201,169,110,.22)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 13, color: AURA.gold }}>
                                        {nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: sel ? 500 : 300, color: t.text, margin: 0 }}>{nome}</p>
                                        {p.telefone && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 300, color: t.textMuted, margin: "1px 0 0" }}>{p.telefone}</p>}
                                    </div>
                                </div>
                                {sel && <CheckCircle2 size={16} color={AURA.gold} />}
                            </div>
                        );
                    })}
            </div>
            {selectedId && (() => {
                const p    = items.find(x => x.id === selectedId);
                const nome = p ? (p[labelKey] ?? p.nomeCompleto ?? `#${p.id}`) : "";
                return <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 13, fontWeight: 300, color: AURA.sage, margin: "8px 0 0" }}>✓ Selecionado: <strong>{nome}</strong></p>;
            })()}
        </div>
    );
}

function PessoaBloco({ label, nome, cor, t }) {
    if (!nome) return null;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${cor}18`, border: `1px solid ${cor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 14, color: cor }}>
                {nome.charAt(0).toUpperCase()}
            </div>
            <div>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: t.textMuted, margin: 0 }}>{label}</p>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300, color: t.text, margin: 0 }}>{nome}</p>
            </div>
        </div>
    );
}

function GlobalStyles({ t, isDark }) {
    return (
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

        @keyframes m70-spin  { to { transform: rotate(360deg); } }
        @keyframes m70-fade  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes m70-toast { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        .m70-spin { animation: m70-spin 1s linear infinite; }
        .m70-card-anim { animation: m70-fade .45s ease both; }
        .m70-root { font-family: 'Inter', sans-serif; display: flex; flex-direction: column; gap: 22px; }

        .m70-card {
            background: ${t.bgEl}; border: 1px solid ${t.border};
            border-radius: 18px; backdrop-filter: blur(24px);
            transition: border-color .25s, box-shadow .25s; position: relative; overflow: hidden;
        }
        .m70-card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
        }
        .m70-card:hover { border-color: rgba(201,169,110,.35); box-shadow: 0 8px 28px rgba(0,0,0,${isDark ? ".3" : ".08"}); }

        .m70-stat { padding: 18px 20px; }
        .m70-stat-label { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: ${t.textMuted}; margin: 0; }
        .m70-stat-value { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 600; margin: 6px 0 2px; }
        .m70-stat-sub { font-size: 12px; font-weight: 300; color: ${t.textSec}; margin: 0; }

        .m70-btn-primary {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 11px 22px; border-radius: 100px; border: none; cursor: pointer;
            background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red}); color: #fff;
            font-family: 'Inter',sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .14em;
            text-transform: uppercase; transition: all .3s; box-shadow: 0 6px 20px rgba(200,16,46,.25);
        }
        .m70-btn-primary:hover:not(:disabled) { transform: translateY(-2px); }
        .m70-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

        .m70-btn-blue {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 11px 22px; border-radius: 100px; border: none; cursor: pointer;
            background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue}); color: #fff;
            font-family: 'Inter',sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .14em;
            text-transform: uppercase; transition: all .3s; box-shadow: 0 6px 20px rgba(0,61,165,.25);
        }
        .m70-btn-blue:hover:not(:disabled) { transform: translateY(-2px); }
        .m70-btn-blue:disabled { opacity: .5; cursor: not-allowed; }

        .m70-btn-gold {
            display: inline-flex; align-items: center; gap: 7px;
            padding: 9px 18px; border-radius: 100px; border: none; cursor: pointer;
            background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight}); color: #0A0A0F;
            font-family: 'Inter',sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .12em;
            text-transform: uppercase; transition: all .35s; box-shadow: 0 6px 18px rgba(201,169,110,.2);
        }
        .m70-btn-gold:hover:not(:disabled) { transform: translateY(-2px); }

        .m70-btn-ghost {
            display: inline-flex; align-items: center; gap: 7px;
            padding: 9px 16px; border-radius: 100px; cursor: pointer;
            border: 1px solid ${t.border}; background: transparent; color: ${t.textSec};
            font-family: 'Inter',sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .12em;
            text-transform: uppercase; transition: all .3s;
        }
        .m70-btn-ghost:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

        .m70-btn-sage {
            display: inline-flex; align-items: center; gap: 7px;
            padding: 9px 16px; border-radius: 100px; cursor: pointer; border: none;
            background: rgba(122,158,126,.12); color: ${AURA.sage}; border: 1px solid rgba(122,158,126,.3);
            font-family: 'Inter',sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .12em;
            text-transform: uppercase; transition: all .2s;
        }
        .m70-btn-sage:hover { background: rgba(122,158,126,.2); }

        .m70-btn-danger {
            display: inline-flex; align-items: center; gap: 7px;
            padding: 9px 16px; border-radius: 100px; cursor: pointer; border: none;
            background: rgba(200,16,46,.1); color: #e8556d; border: 1px solid rgba(200,16,46,.3);
            font-family: 'Inter',sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .12em;
            text-transform: uppercase; transition: all .2s;
        }
        .m70-btn-danger:hover { background: rgba(200,16,46,.2); }

        .m70-btn-clear {
            background: transparent; color: ${t.textMuted};
            border: 1px solid ${t.border}; border-radius: 100px;
            font-family: 'Inter',sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .1em;
            text-transform: uppercase; cursor: pointer; padding: 8px 14px;
            transition: all .2s; white-space: nowrap;
        }
        .m70-btn-clear:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

        .m70-input {
            width: 100%; box-sizing: border-box;
            background: ${t.bgInput}; border: 1px solid ${t.borderInput};
            color: ${t.text}; padding: 12px 16px; border-radius: 12px; outline: none;
            font-family: 'Inter',sans-serif; font-size: 14px; font-weight: 300; transition: all .25s;
            -webkit-appearance: none; appearance: none;
        }
        .m70-input:focus { border-color: rgba(201,169,110,.5); background: rgba(201,169,110,.04); box-shadow: 0 0 0 3px rgba(201,169,110,.08); }
        .m70-input::placeholder { color: ${t.placeholder}; }
        .m70-input option { background: ${t.optionBg}; color: ${t.text}; }
        select.m70-input {
            cursor: pointer;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9A96E' stroke-width='3'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
            background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px;
        }
        input[type="date"].m70-input::-webkit-calendar-picker-indicator { filter: ${isDark ? "invert(1) opacity(.4)" : "opacity(.5)"}; cursor: pointer; }

        .m70-label { font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: ${AURA.gold}; margin: 0 0 6px; display: block; }

        .m70-progress-track { height: 5px; border-radius: 99px; background: ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}; overflow: hidden; flex: 1; }

        .m70-toast {
            position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 9999;
            padding: 12px 22px; border-radius: 100px;
            font-family: 'Inter',sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .12em;
            text-transform: uppercase;
            display: flex; align-items: center; gap: 8px; white-space: nowrap;
            animation: m70-toast .3s ease forwards; box-shadow: 0 8px 32px rgba(0,0,0,.3);
        }
        .m70-toast.success { background: rgba(122,158,126,.95); color: #fff; border: 1px solid rgba(122,158,126,.5); }
        .m70-toast.error   { background: rgba(200,16,46,.9);  color: #fff; border: 1px solid rgba(200,16,46,.5); }

        @media(min-width: 500px) { .m70-stats-grid { grid-template-columns: repeat(4,1fr) !important; } }
        @media(min-width: 600px) { .m70-filters-grid { grid-template-columns: 1fr 1fr !important; } }
        `}</style>
    );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function Missao70Lider({ celulaId, isDark = true }) {
    const t = theme(isDark);

    const [missoes, setMissoes]       = useState([]);
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
    const [targetId, setTargetId]             = useState(null);
    const [targetNome, setTargetNome]         = useState("");
    const [fCriar, setFCriar] = useState({ nome: "", endereco: "", nomeAnfitriao: "", telefoneContato: "", liderId: null, auxiliarId: null });

    // ── MUDANÇA: Set de IDs em vez de único objeto ──
    const [visitantesSelecionados, setVisitantesSelecionados] = useState(new Set());

    const [fEnc, setFEnc] = useState({
        data: new Date().toISOString().split("T")[0],
        numeroSemana: 1,
        observacoes: "",
        visitantesInfo: [],
    });
    const [submitting, setSubmitting] = useState(false);

    const membrosHook    = useMembros(celulaId);
    const visitantesHook = useVisitantes(celulaId);
    const { historico: historicoDecisoes, buscarEmLote } = useHistoricoDecisoes();

    const showToast = (msg, tipo = "success") => { setToast({ msg, tipo }); setTimeout(() => setToast(null), 3500); };

    const carregar = useCallback(async () => {
        try {
            setLoading(true);
            const url = celulaId ? `/api/missao70?celulaId=${celulaId}` : "/api/missao70";
            const res = await api.get(url);
            const lista = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
            setMissoes(lista);
            const todosIds = lista.flatMap(m => (m.visitantes || []).map(v => v.id).filter(Boolean));
            const idsUnicos = [...new Set(todosIds)];
            if (idsUnicos.length > 0) buscarEmLote(idsUnicos);
        } catch (err) { console.error(err); setMissoes([]); }
        finally { setLoading(false); }
    }, [celulaId, buscarEmLote]);

    useEffect(() => { carregar(); }, [carregar]);

    const missoesFiltradas = missoes.filter(m => {
        const textoOk = (m.nome ?? "").toLowerCase().includes(busca.toLowerCase()) || (m.endereco ?? "").toLowerCase().includes(busca.toLowerCase());
        const dataStr  = m.dataInicio ?? null;
        const dataCasa = dataStr ? new Date(dataStr) : null;
        const inicioOk = !dataInicio || (dataCasa && dataCasa >= new Date(dataInicio));
        const fimOk    = !dataFim    || (dataCasa && dataCasa <= new Date(dataFim + "T23:59:59"));
        return textoOk && inicioOk && fimOk;
    });

    const temFiltro       = busca || dataInicio || dataFim;
    const limpar          = () => { setBusca(""); setDataInicio(""); setDataFim(""); };
    const totalMissoes    = missoes.length;
    const ativas          = missoes.filter(m => (m.status || "").toLowerCase().includes("ativ")).length;
    const totalVisitantes = missoes.reduce((s, m) => s + (m.visitantes || []).length, 0);
    const totalEncontros  = missoes.reduce((s, m) => s + (m.encontrosRealizados ?? 0), 0);

    const abrirModalCriar = () => {
        setFCriar({ nome: "", endereco: "", nomeAnfitriao: "", telefoneContato: "", liderId: null, auxiliarId: null });
        membrosHook.buscar();
        setModalCriar(true);
    };

    const abrirModalVisitante = (id) => {
        setTargetId(id);
        setVisitantesSelecionados(new Set()); // limpa seleção
        visitantesHook.buscar();
        setModalVisitante(true);
    };

    const abrirModalEncontro = (missao) => {
        setTargetId(missao.id);
        const visitantesInfo = (missao.visitantes ?? []).map(v => {
            const decisao =
                historicoDecisoes[v.id] !== undefined
                    ? historicoDecisoes[v.id]
                    : (v.decisaoEspiritual ?? null);
            return { visitanteId: v.id, visitanteNome: v.nome ?? `#${v.id}`, decisao };
        });
        const realizados = missao.encontrosRealizados ?? 0;
        setFEnc({
            data: new Date().toISOString().split("T")[0],
            numeroSemana: Math.min(realizados + 1, TOTAL_SEMANAS),
            observacoes: "",
            visitantesInfo,
        });
        setModalEncontro(true);
    };

    const abrirModalCancelar = (id, nome) => { setTargetId(id); setTargetNome(nome || ""); setModalCancelar(true); };

    // ── Handlers de multi-seleção ──
    const toggleVisitante = (p) => {
        setVisitantesSelecionados(prev => {
            const next = new Set(prev);
            if (next.has(p.id)) next.delete(p.id);
            else next.add(p.id);
            return next;
        });
    };

    const selecionarTodos = (ids) => {
        setVisitantesSelecionados(prev => {
            const next = new Set(prev);
            ids.forEach(id => next.add(id));
            return next;
        });
    };

    const desmarcarTodos = (ids) => {
        setVisitantesSelecionados(prev => {
            const next = new Set(prev);
            ids.forEach(id => next.delete(id));
            return next;
        });
    };

    const criarMissao = async () => {
        if (!fCriar.nome.trim())          return alert("Informe o nome da Missão 70.");
        if (!fCriar.nomeAnfitriao.trim()) return alert("Informe o nome do anfitrião.");
        setSubmitting(true);
        try {
            await api.post("/api/missao70", {
                nome: fCriar.nome.trim(),
                nomeAnfitriao: fCriar.nomeAnfitriao.trim(),
                endereco: fCriar.endereco.trim(),
                telefoneContato: fCriar.telefoneContato.trim(),
                dataInicio: new Date().toISOString().split("T")[0],
                celulaId: celulaId ?? null,
                liderId: fCriar.liderId ?? null,
                auxiliarId: fCriar.auxiliarId ?? null,
            });
            setModalCriar(false); carregar();
        } catch (err) { alert(err.response?.data?.message || "Erro ao criar Missão 70."); }
        finally { setSubmitting(false); }
    };

    // ── MUDANÇA: adiciona múltiplos visitantes em paralelo ──
    const adicionarVisitantes = async () => {
        if (visitantesSelecionados.size === 0) return alert("Selecione ao menos um visitante.");
        setSubmitting(true);
        try {
            const ids = [...visitantesSelecionados];
            await Promise.allSettled(
                ids.map(id => api.post(`/api/missao70/${targetId}/visitantes/${id}`))
            );
            const qtd = ids.length;
            setModalVisitante(false);
            setVisitantesSelecionados(new Set());
            carregar();
            showToast(`${qtd} visitante${qtd !== 1 ? "s" : ""} adicionado${qtd !== 1 ? "s" : ""}!`, "success");
        } catch (err) { alert(err.response?.data?.message || "Erro ao adicionar visitantes."); }
        finally { setSubmitting(false); }
    };

    const registrarEncontro = async () => {
        if (!fEnc.data) return alert("Informe a data.");
        setSubmitting(true);
        try {
            await api.post(`/api/missao70/${targetId}/encontros`, {
                dataEncontro: fEnc.data,
                numeroSemana: fEnc.numeroSemana,
                observacoes:  fEnc.observacoes,
                decisoes:     [],
            });

            if (celulaId) {
                try {
                    await api.put(`/metas/celula/${celulaId}/recalcular`);
                    showToast("Semana registrada e metas atualizadas!", "success");
                } catch {
                    showToast("Semana salva, mas falha ao atualizar metas.", "error");
                }
            } else {
                showToast("Semana registrada com sucesso!", "success");
            }

            setModalEncontro(false);
            setFEnc({ data: new Date().toISOString().split("T")[0], numeroSemana: 1, observacoes: "", visitantesInfo: [] });
            carregar();
        } catch (err) { alert(err.response?.data?.message || "Erro ao registrar encontro."); }
        finally { setSubmitting(false); }
    };

    const cancelarMissao = async () => {
        setSubmitting(true);
        try { await api.patch(`/api/missao70/${targetId}/cancelar`); setModalCancelar(false); carregar(); }
        catch (err) { alert(err.response?.data?.message || "Erro ao cancelar."); }
        finally { setSubmitting(false); }
    };

    if (loading) return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
            <GlobalStyles t={t} isDark={isDark} />
            <Loader2 size={28} className="m70-spin" style={{ color: AURA.gold }} />
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: t.textMuted, marginTop: 14 }}>Carregando Missão 70...</p>
        </div>
    );

    return (
        <div className="m70-root">
            <GlobalStyles t={t} isDark={isDark} />

            {toast && <div className={`m70-toast ${toast.tipo}`}>{toast.tipo === "success" ? <CheckCircle2 size={13} /> : <X size={13} />} {toast.msg}</div>}

            {/* ── Cabeçalho ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(253,184,19,.12)", border: "1px solid rgba(253,184,19,.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Flame size={20} color={AURA.yellow} />
                    </div>
                    <div>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 500, color: t.text, margin: 0 }}>Missão 70</h2>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 300, color: t.textSec, margin: "3px 0 0" }}>Gerencie missões de evangelismo de 4 semanas</p>
                    </div>
                </div>
                <button className="m70-btn-primary" onClick={abrirModalCriar}><Plus size={14} /> Nova Missão</button>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }} className="m70-stats-grid">
                {[
                    { label: "Total",      value: totalMissoes,    color: t.text,    sub: "missões"      },
                    { label: "Ativas",     value: ativas,          color: AURA.sage, sub: "em andamento" },
                    { label: "Visitantes", value: totalVisitantes, color: AURA.yellow, sub: "alcançados"   },
                    { label: "Encontros",  value: totalEncontros,  color: "#7090e8", sub: "realizados"   },
                ].map((s, i) => (
                    <div key={s.label} className="m70-card-anim m70-card m70-stat" style={{ animationDelay: `${i * 0.07}s` }}>
                        <p className="m70-stat-label">{s.label}</p>
                        <p className="m70-stat-value" style={{ color: s.color }}>{s.value}</p>
                        <p className="m70-stat-sub">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Lista ── */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 500, color: t.text, margin: 0 }}>Lista de Missões</p>
                    <button className="m70-btn-ghost" onClick={carregar}>↺ Atualizar</button>
                </div>

                <div className="m70-card" style={{ padding: "16px 18px", marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: t.textMuted, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                            <Search size={11} /> Filtros de busca
                        </p>
                        {temFiltro && <button className="m70-btn-clear" onClick={limpar}>✕ Limpar filtros</button>}
                    </div>
                    <div style={{ position: "relative" }}>
                        <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: AURA.gold, opacity: .5, pointerEvents: "none" }} />
                        <input className="m70-input" style={{ paddingLeft: 38 }} placeholder="Buscar por nome ou endereço..." value={busca} onChange={e => setBusca(e.target.value)} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }} className="m70-filters-grid">
                        <div>
                            <p className="m70-label" style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={10} /> Data início — de</p>
                            <input type="date" className="m70-input" value={dataInicio} max={dataFim || undefined} onChange={e => setDataInicio(e.target.value)} style={{ colorScheme: isDark ? "dark" : "light" }} />
                        </div>
                        <div>
                            <p className="m70-label" style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={10} /> Data início — até</p>
                            <input type="date" className="m70-input" value={dataFim} min={dataInicio || undefined} onChange={e => setDataFim(e.target.value)} style={{ colorScheme: isDark ? "dark" : "light" }} />
                        </div>
                    </div>
                    {temFiltro && (
                        <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 12, fontWeight: 300, color: t.textSec, margin: 0 }}>
                            {missoesFiltradas.length === 0 ? "Nenhuma missão encontrada com os filtros aplicados." : `${missoesFiltradas.length} missão(ões) encontrada(s).`}
                        </p>
                    )}
                </div>

                {missoes.length === 0 ? (
                    <div className="m70-card" style={{ textAlign: "center", padding: "56px 24px" }}>
                        <Flame size={36} style={{ color: t.textMuted, marginBottom: 14 }} />
                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 500, color: t.text, margin: "0 0 6px" }}>Nenhuma missão cadastrada</p>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 13, fontWeight: 300, color: t.textSec }}>Clique em "Nova Missão" para começar.</p>
                    </div>
                ) : missoesFiltradas.length === 0 ? (
                    <div className="m70-card" style={{ textAlign: "center", padding: "40px 24px" }}>
                        <Search size={28} style={{ color: t.textMuted, marginBottom: 12 }} />
                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 500, color: t.text, margin: "0 0 6px" }}>Nenhum resultado</p>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 12, fontWeight: 300, color: t.textSec }}>Ajuste os filtros para encontrar uma missão.</p>
                    </div>
                ) : missoesFiltradas.map((m, i) => {
                    const isOpen     = expandedId === m.id;
                    const visitantes = m.visitantes || [];
                    const cancelada  = (m.status || "").toLowerCase().includes("cancel");
                    const realizados = Math.max(0, Math.min(m.encontrosRealizados ?? 0, TOTAL_SEMANAS));
                    const restantes  = Math.max(0, TOTAL_SEMANAS - realizados);
                    const concluida  = restantes === 0 && !cancelada;

                    return (
                        <motion.div key={m.id} className="m70-card-anim m70-card"
                                    style={{ marginBottom: 10, overflow: "hidden", animationDelay: `${i * 0.06}s`, borderColor: concluida ? "rgba(122,158,126,.4)" : isOpen ? "rgba(201,169,110,.4)" : t.border }}
                                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        >
                            <div onClick={() => setExpandedId(isOpen ? null : m.id)}
                                 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer", gap: 12, flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: concluida ? "rgba(122,158,126,.15)" : "linear-gradient(135deg,rgba(253,184,19,.18),rgba(200,16,46,.12))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                                        {concluida ? "✅" : "🔥"}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 500, color: t.text, margin: 0 }}>{m.nome || "Missão " + m.id}</p>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 300, color: t.textSec, margin: "2px 0 0" }}>{m.endereco || "Endereço não informado"}</p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                                    <div style={{ textAlign: "center", width: 46, height: 46, borderRadius: "50%", border: `2px solid ${concluida ? AURA.sage : "rgba(253,184,19,.5)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 600, color: concluida ? AURA.sage : AURA.yellow, lineHeight: 1 }}>{restantes}</span>
                                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 300, color: t.textMuted, lineHeight: 1, marginTop: 2 }}>sem.</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 16 }}>
                                        <div style={{ textAlign: "center" }}>
                                            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 600, color: t.text, margin: 0 }}>{visitantes.length}</p>
                                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 300, color: t.textMuted, margin: 0 }}>visitas</p>
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 600, color: concluida ? AURA.sage : AURA.yellow, margin: 0 }}>{realizados}/{TOTAL_SEMANAS}</p>
                                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 300, color: t.textMuted, margin: 0 }}>semanas</p>
                                        </div>
                                    </div>
                                    <BadgeStatus status={concluida ? "concluida" : m.status} />
                                    <ChevronDown size={16} color={t.textMuted} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .25s" }} />
                                </div>
                            </div>

                            <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${concluida ? "rgba(122,158,126,.3)" : "rgba(201,169,110,.2)"},transparent)`, margin: "0 20px" }} />

                            {concluida && (
                                <div style={{ margin: "12px 20px 4px", padding: "16px 20px", borderRadius: 14, background: isDark ? "rgba(122,158,126,.1)" : "rgba(122,158,126,.07)", border: "1px solid rgba(122,158,126,.35)", display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ fontSize: 28, flexShrink: 0 }}>🎉</div>
                                    <div>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: AURA.sage, margin: "0 0 4px" }}>Missão Concluída!</p>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 13, fontWeight: 300, color: t.textSec, margin: 0 }}>Todas as {TOTAL_SEMANAS} semanas foram realizadas com sucesso.</p>
                                    </div>
                                </div>
                            )}

                            <div style={{ padding: "10px 20px 4px" }}>
                                <div style={{ display: "flex", gap: 5 }}>
                                    {Array.from({ length: TOTAL_SEMANAS }, (_, idx) => (
                                        <div key={idx} className="m70-progress-track">
                                            <div style={{ height: "100%", borderRadius: 99, background: idx < realizados ? (concluida ? AURA.sage : idx < realizados - 1 ? "#C48C00" : AURA.yellow) : "transparent", width: "100%" }} />
                                        </div>
                                    ))}
                                </div>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 300, color: t.textSec, margin: "6px 0 0" }}>Semana {realizados} de {TOTAL_SEMANAS}</p>
                            </div>

                            <div style={{ display: "flex", gap: 8, padding: "10px 20px 18px", flexWrap: "wrap" }}>
                                {!cancelada && !concluida && <button className="m70-btn-sage"  onClick={() => abrirModalVisitante(m.id)}>+ Visitantes</button>}
                                {!cancelada && !concluida && <button className="m70-btn-ghost" onClick={() => abrirModalEncontro(m)}>✦ Semana</button>}
                                {!cancelada              && <button className="m70-btn-danger" onClick={() => abrirModalCancelar(m.id, m.nome)}>✕ Cancelar</button>}
                            </div>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }} style={{ overflow: "hidden" }}>
                                        <div style={{ padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 16, borderTop: `1px solid ${t.border}` }}>
                                            {m.nomeAnfitriao && (
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "rgba(253,184,19,.12)", border: "1px solid rgba(253,184,19,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 13, color: AURA.yellow }}>
                                                        {m.nomeAnfitriao.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: t.textMuted, margin: 0 }}>Anfitrião</p>
                                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300, color: t.text, margin: 0 }}>{m.nomeAnfitriao}</p>
                                                        {m.telefoneContato && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 300, color: t.textMuted, margin: 0 }}>{m.telefoneContato}</p>}
                                                    </div>
                                                </div>
                                            )}
                                            <PessoaBloco label="Líder"    nome={m.liderNome}    cor="#7090e8"   t={t} />
                                            <PessoaBloco label="Auxiliar" nome={m.auxiliarNome} cor={AURA.sage} t={t} />
                                            <div>
                                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 10px" }}>Visitantes ({visitantes.length})</p>
                                                {visitantes.length ? (
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                        {visitantes.map((v) => {
                                                            const decisao = historicoDecisoes[v.id] !== undefined
                                                                ? historicoDecisoes[v.id]
                                                                : (v.decisaoEspiritual ?? null);
                                                            const temDecisao = decisao && decisao !== "NENHUMA";
                                                            return (
                                                                <div key={v.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                                    <div style={{ background: "rgba(201,169,110,.08)", border: "1px solid rgba(201,169,110,.22)", borderRadius: 99, padding: "5px 14px", fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, color: t.text, display: "flex", alignItems: "center", gap: 6 }}>
                                                                        <span style={{ color: AURA.gold }}>✦</span><span>{v.nome ?? `#${v.id}`}</span>
                                                                    </div>
                                                                    {temDecisao && (
                                                                        <div style={{ paddingLeft: 8 }}>
                                                                            <BadgeDecisao decisao={decisao} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 13, fontWeight: 300, color: t.textSec }}>Nenhum visitante cadastrado ainda.</p>}
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 10px" }}>Semanas ({realizados}/{TOTAL_SEMANAS})</p>
                                                {realizados > 0
                                                    ? <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, color: t.textSec, margin: 0 }}>
                                                        {realizados} semana{realizados !== 1 ? "s" : ""} registrada{realizados !== 1 ? "s" : ""}. {restantes > 0 ? `Faltam ${restantes}.` : "Missão concluída!"}
                                                    </p>
                                                    : <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 13, fontWeight: 300, color: t.textSec }}>Nenhuma semana registrada.</p>
                                                }
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* ════════════ MODAIS ════════════ */}
            <AnimatePresence>

                {/* ── CRIAR MISSÃO ── */}
                {modalCriar && (
                    <AuraModal open={modalCriar} onClose={() => setModalCriar(false)} title="Nova Missão 70" t={t}>
                        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <p className="m70-label">Nome da missão *</p>
                                    <input className="m70-input" placeholder="Missão Rua das Flores" value={fCriar.nome} onChange={e => setFCriar(f => ({ ...f, nome: e.target.value }))} />
                                </div>
                                <div>
                                    <p className="m70-label">Nome do anfitrião *</p>
                                    <input className="m70-input" placeholder="João Silva" value={fCriar.nomeAnfitriao} onChange={e => setFCriar(f => ({ ...f, nomeAnfitriao: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <p className="m70-label">Endereço</p>
                                <input className="m70-input" placeholder="Rua, número, bairro" value={fCriar.endereco} onChange={e => setFCriar(f => ({ ...f, endereco: e.target.value }))} />
                            </div>
                            <div>
                                <p className="m70-label">Telefone de contato</p>
                                <input className="m70-input" placeholder="(71) 9 0000-0000" value={fCriar.telefoneContato} onChange={e => setFCriar(f => ({ ...f, telefoneContato: e.target.value }))} />
                            </div>
                            <div>
                                <p className="m70-label">Líder (membro da célula)</p>
                                <PessoaSelector items={membrosHook.membros} loading={membrosHook.loading} erro={membrosHook.erro} selectedId={fCriar.liderId} onSelect={p => setFCriar(f => ({ ...f, liderId: p.id }))} placeholder="Pesquisar líder..." t={t} />
                            </div>
                            <div>
                                <p className="m70-label">Auxiliar (membro da célula)</p>
                                <PessoaSelector items={membrosHook.membros} loading={membrosHook.loading} erro={membrosHook.erro} selectedId={fCriar.auxiliarId} onSelect={p => setFCriar(f => ({ ...f, auxiliarId: p.id }))} placeholder="Pesquisar auxiliar..." t={t} />
                            </div>
                            <div style={{ background: isDark ? "rgba(253,184,19,.08)" : "rgba(253,184,19,.07)", border: "1px solid rgba(253,184,19,.25)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                                <span style={{ fontSize: 20, flexShrink: 0 }}>✦</span>
                                <div>
                                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: AURA.yellow, margin: "0 0 4px" }}>O que é a Missão 70?</p>
                                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, color: t.textSec, margin: 0, lineHeight: 1.6 }}>
                                        São <strong style={{ color: t.text, fontWeight: 500 }}>4 encontros semanais</strong> de evangelismo realizados na casa do anfitrião. O objetivo é alcançar visitantes e registrar decisões de fé durante o ciclo.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="m70-btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setModalCriar(false)}>Cancelar</button>
                            <button className="m70-btn-primary" style={{ flex: 2, justifyContent: "center" }} onClick={criarMissao} disabled={submitting}>
                                {submitting ? <Loader2 size={14} className="m70-spin" /> : "Criar Missão"}
                            </button>
                        </div>
                    </AuraModal>
                )}

                {/* ── ADICIONAR VISITANTES (multi-seleção) ── */}
                {modalVisitante && (
                    <AuraModal open={modalVisitante} onClose={() => setModalVisitante(false)} title="Adicionar Visitantes" t={t}>
                        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ background: isDark ? "rgba(253,184,19,.06)" : "rgba(253,184,19,.06)", border: "1px solid rgba(253,184,19,.2)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                                <Flame size={14} color={AURA.yellow} style={{ flexShrink: 0 }} />
                                <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 12, fontWeight: 300, color: t.textSec, margin: 0 }}>Exibindo apenas visitantes cadastrados nesta célula.</p>
                            </div>
                            <VisitanteMultiSelector
                                items={visitantesHook.visitantes}
                                loading={visitantesHook.loading}
                                erro={visitantesHook.erro}
                                selectedIds={visitantesSelecionados}
                                onToggle={toggleVisitante}
                                onSelectAll={selecionarTodos}
                                onClearAll={desmarcarTodos}
                                t={t}
                                accentColor={AURA.yellow}
                            />
                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="m70-btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setModalVisitante(false)}>Cancelar</button>
                            <button
                                className="m70-btn-blue"
                                style={{ flex: 2, justifyContent: "center" }}
                                onClick={adicionarVisitantes}
                                disabled={submitting || visitantesSelecionados.size === 0}
                            >
                                {submitting
                                    ? <Loader2 size={14} className="m70-spin" />
                                    : visitantesSelecionados.size > 0
                                        ? `Adicionar ${visitantesSelecionados.size}`
                                        : "Adicionar"
                                }
                            </button>
                        </div>
                    </AuraModal>
                )}

                {/* ── REGISTRAR SEMANA ── */}
                {modalEncontro && (
                    <AuraModal open={modalEncontro} onClose={() => setModalEncontro(false)} title="Registrar Semana" t={t}>
                        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <p className="m70-label">Data *</p>
                                    <input className="m70-input" type="date" value={fEnc.data} onChange={e => setFEnc(f => ({ ...f, data: e.target.value }))} style={{ colorScheme: isDark ? "dark" : "light" }} />
                                </div>
                                <div>
                                    <p className="m70-label">Número da semana</p>
                                    <select className="m70-input" value={fEnc.numeroSemana} onChange={e => setFEnc(f => ({ ...f, numeroSemana: Number(e.target.value) }))}>
                                        {Array.from({ length: TOTAL_SEMANAS }, (_, i) => <option key={i + 1} value={i + 1}>Semana {i + 1}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <p className="m70-label">Observações</p>
                                <textarea className="m70-input" style={{ minHeight: 90, resize: "vertical" }} placeholder="Comentários sobre o encontro desta semana..." value={fEnc.observacoes} onChange={e => setFEnc(f => ({ ...f, observacoes: e.target.value }))} />
                            </div>
                            {fEnc.visitantesInfo.length > 0 && (
                                <div>
                                    <p className="m70-label">Visitantes presentes</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {fEnc.visitantesInfo.map(v => {
                                            const temDecisao = v.decisao && v.decisao !== "NENHUMA";
                                            return (
                                                <div key={v.visitanteId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 12, background: isDark ? "rgba(201,169,110,.03)" : "rgba(201,169,110,.03)", border: `1px solid ${t.border}`, gap: 10, flexWrap: "wrap" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: "rgba(253,184,19,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: 11, fontWeight: 600, color: AURA.yellow }}>
                                                            {v.visitanteNome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                                                        </div>
                                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300, color: t.text, margin: 0 }}>{v.visitanteNome}</p>
                                                    </div>
                                                    {temDecisao
                                                        ? <BadgeDecisao decisao={v.decisao} />
                                                        : <span style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 12, fontWeight: 300, color: t.textMuted }}>sem decisão registrada</span>
                                                    }
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.03)", border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 13, flexShrink: 0 }}>ℹ️</span>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 12, fontWeight: 300, color: t.textSec, margin: 0 }}>
                                            Para alterar a decisão espiritual de um visitante, acesse o <strong style={{ color: t.text, fontWeight: 500 }}>cadastro do visitante</strong>.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="m70-btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setModalEncontro(false)}>Cancelar</button>
                            <button className="m70-btn-blue" style={{ flex: 2, justifyContent: "center" }} onClick={registrarEncontro} disabled={submitting}>
                                {submitting ? <Loader2 size={14} className="m70-spin" /> : "Registrar"}
                            </button>
                        </div>
                    </AuraModal>
                )}

                {/* ── CANCELAR MISSÃO ── */}
                {modalCancelar && (
                    <AuraModal open={modalCancelar} onClose={() => setModalCancelar(false)} title="Cancelar Missão" t={t}>
                        <div style={{ padding: "16px 24px 20px" }}>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300, color: t.text, lineHeight: 1.6 }}>
                                Tem certeza que deseja cancelar <strong style={{ fontWeight: 500 }}>"{targetNome}"</strong>? Esta ação não poderá ser desfeita facilmente.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="m70-btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setModalCancelar(false)}>Voltar</button>
                            <button className="m70-btn-danger" style={{ flex: 2, justifyContent: "center", padding: "11px 22px" }} onClick={cancelarMissao} disabled={submitting}>
                                {submitting ? <Loader2 size={14} className="m70-spin" /> : "Sim, Cancelar"}
                            </button>
                        </div>
                    </AuraModal>
                )}
            </AnimatePresence>
        </div>
    );
}
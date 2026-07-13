import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Plus, X, Loader2, CheckCircle2, ChevronDown, Search, Calendar, History, Pencil, Trash2, Ban } from "lucide-react";

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
    teal:      "#2E8B8B",
    purple:    "#8B5CF6",
    purpleDark:"#6D28D9",
};

/* ─── Evento global de sincronização de decisão espiritual ───────────────
   O mesmo evento é usado pela tela de Visitantes. Quando qualquer uma
   das duas telas altera a decisão espiritual de um visitante, ela
   dispara este evento em `window`; a outra tela, se estiver montada,
   escuta e atualiza seu próprio estado local imediatamente. ────────── */
const EVENTO_DECISAO_ATUALIZADA = "aura:visitante-decisao-atualizada";

// Cor de cada semana: 1ª vermelho · 2ª amarelo · 3ª azul · 4ª roxo (finalizando)
const CORES_SEMANA = [AURA.red, AURA.yellow, AURA.blue, AURA.purple];
// Cor "atual" da missão de acordo com quantas semanas já foram realizadas
function corEstagio(realizados) {
    if (realizados >= 4) return AURA.purple;
    if (realizados === 3) return AURA.blue;
    if (realizados === 2) return AURA.yellow;
    if (realizados === 1) return AURA.red;
    return AURA.gold;
}

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
    if (s.includes("ativ") || s.includes("andamento")) return badge(AURA.sage, "Ativa");
    if (s.includes("cancel")) return badge(AURA.red, "Cancelada");
    if (s.includes("conclu")) return badge(AURA.yellow, "Concluída");
    return badge(AURA.yellow, "Pendente");
}

/* ── Modal quadrado, centralizado (mesmo estilo do modal de "Semanas") ── */
function AuraSquareModal({ open, onClose, title, subtitle, children, footer, t, maxWidth = 420, accentColor = null }) {
    if (!open) return null;
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 12, boxSizing: "border-box" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: "fixed", inset: 0, background: "rgba(10,10,15,.82)", backdropFilter: "blur(3px)" }} />
            <motion.div initial={{ scale: .96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .96, opacity: 0 }}
                        transition={{ type: "tween", duration: .18 }}
                        style={{
                            position: "relative", zIndex: 10,
                            width: "100%", maxWidth,
                            background: accentColor ? `linear-gradient(180deg, ${accentColor}22 0%, ${accentColor}0d 140px, ${t.bgEl} 280px, ${t.bgEl} 100%)` : t.bgEl,
                            border: `1px solid ${accentColor ? accentColor + "70" : t.border}`,
                            borderRadius: 18, overflow: "hidden",
                            maxHeight: "88vh", display: "flex", flexDirection: "column",
                            boxShadow: "0 20px 60px rgba(0,0,0,.5)",
                        }}>
                {accentColor && <div style={{ height: 5, flexShrink: 0, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)` }} />}
                <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 500, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h3>
                        {subtitle && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 300, color: t.textMuted, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</p>}
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 4, display: "flex", flexShrink: 0 }}><X size={18} /></button>
                </div>
                <div style={{ padding: "14px 20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 12, WebkitOverflowScrolling: "touch" }}>
                    {children}
                </div>
                {footer && (
                    <div style={{ padding: "12px 20px 16px", borderTop: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                        {footer}
                    </div>
                )}
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

    // Atualiza o cache local imediatamente (uso otimista após um PATCH bem-sucedido)
    const atualizarDecisaoLocal = useCallback((visitanteId, novaDecisao) => {
        setHistorico(prev => ({ ...prev, [visitanteId]: novaDecisao || null }));
    }, []);

    return { historico, buscarDecisao, buscarEmLote, atualizarDecisaoLocal };
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
                        {busca ? `Nenhum resultado para "${busca}".` : "Nenhum membro disponível."}
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
        .m70-root { font-family: 'Inter', sans-serif; display: flex; flex-direction: column; gap: 22px; box-sizing: border-box; max-width: 100%; }
        .m70-root * { box-sizing: border-box; }

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
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            padding: 11px 22px; border-radius: 100px; border: none; cursor: pointer;
            background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red}); color: #fff;
            font-family: 'Inter',sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .14em;
            text-transform: uppercase; transition: transform .2s, opacity .2s; box-shadow: 0 6px 20px rgba(200,16,46,.25);
            white-space: nowrap;
        }
        .m70-btn-primary:hover:not(:disabled) { transform: translateY(-2px); }
        .m70-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

        .m70-btn-blue {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            position: relative; min-width: 0; width: 100%;
            padding: 11px 16px; border-radius: 100px; border: none; cursor: pointer;
            background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue}); color: #fff;
            font-family: 'Inter',sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .1em;
            text-transform: uppercase; transition: transform .2s, opacity .2s; box-shadow: 0 6px 20px rgba(0,61,165,.25);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .m70-btn-blue:hover:not(:disabled) { transform: translateY(-2px); }
        .m70-btn-blue:disabled { opacity: .6; cursor: not-allowed; transform: none; }

        .m70-btn-gold {
            display: inline-flex; align-items: center; gap: 7px;
            padding: 9px 18px; border-radius: 100px; border: none; cursor: pointer;
            background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight}); color: #0A0A0F;
            font-family: 'Inter',sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .12em;
            text-transform: uppercase; transition: all .35s; box-shadow: 0 6px 18px rgba(201,169,110,.2);
        }
        .m70-btn-gold:hover:not(:disabled) { transform: translateY(-2px); }

        .m70-btn-ghost {
            display: inline-flex; align-items: center; justify-content: center; gap: 7px;
            padding: 9px 16px; border-radius: 100px; cursor: pointer;
            border: 1px solid ${t.border}; background: transparent; color: ${t.textSec};
            font-family: 'Inter',sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .12em;
            text-transform: uppercase; transition: border-color .2s, color .2s;
            white-space: nowrap; min-width: 0;
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
            display: inline-flex; align-items: center; justify-content: center; gap: 7px;
            padding: 9px 16px; border-radius: 100px; cursor: pointer; border: none;
            background: rgba(200,16,46,.1); color: #e8556d; border: 1px solid rgba(200,16,46,.3);
            font-family: 'Inter',sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .12em;
            text-transform: uppercase; transition: background .2s; white-space: nowrap;
        }
        .m70-btn-danger:hover { background: rgba(200,16,46,.2); }
        .m70-btn-danger:disabled { opacity: .6; cursor: not-allowed; }

        .m70-btn-clear {
            background: transparent; color: ${t.textMuted};
            border: 1px solid ${t.border}; border-radius: 100px;
            font-family: 'Inter',sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .1em;
            text-transform: uppercase; cursor: pointer; padding: 8px 14px;
            transition: border-color .2s, color .2s; white-space: nowrap;
        }
        .m70-btn-clear:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

        .m70-input {
            width: 100%; box-sizing: border-box;
            background: ${t.bgInput}; border: 1px solid ${t.borderInput};
            color: ${t.text}; padding: 12px 16px; border-radius: 12px; outline: none;
            font-family: 'Inter',sans-serif; font-size: 14px; font-weight: 300; transition: border-color .25s, background .25s, box-shadow .25s;
            -webkit-appearance: none; appearance: none;
        }
        .m70-input:focus { border-color: rgba(201,169,110,.5); background: rgba(201,169,110,.04); box-shadow: 0 0 0 3px rgba(201,169,110,.08); }
        .m70-input::placeholder { color: ${t.placeholder}; }
        .m70-input option { background: ${t.optionBg}; color: ${t.text}; }
        .m70-input:disabled { opacity: .45; cursor: not-allowed; }
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
            padding: 12px 22px; border-radius: 100px; max-width: calc(100vw - 32px);
            font-family: 'Inter',sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .12em;
            text-transform: uppercase;
            display: flex; align-items: center; gap: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            animation: m70-toast .3s ease forwards; box-shadow: 0 8px 32px rgba(0,0,0,.3);
        }
        .m70-toast.success { background: rgba(122,158,126,.95); color: #fff; border: 1px solid rgba(122,158,126,.5); }
        .m70-toast.error   { background: rgba(200,16,46,.9);  color: #fff; border: 1px solid rgba(200,16,46,.5); }

        .m70-tab {
            flex: 1; padding: 9px 0; border-radius: 10px; border: 1px solid transparent; cursor: pointer;
            background: transparent; font-family: 'Inter',sans-serif; font-size: 10px; font-weight: 600;
            letter-spacing: .1em; text-transform: uppercase; color: ${t.textMuted};
            display: flex; align-items: center; justify-content: center; gap: 6px; transition: all .2s;
        }
        .m70-tab.active { background: rgba(201,169,110,.12); border-color: rgba(201,169,110,.35); color: ${AURA.gold}; }

        /* ── Select de decisão espiritual ──
           OBS: não usar a propriedade shorthand "background" aqui nem inline.
           O shorthand reseta background-repeat/position/size para o padrão
           (repeat), o que fazia a setinha SVG repetir (tile) e "tremer"
           visualmente. Sempre usar as longhand props isoladas. */
        .m70-decisao-select {
            appearance: none; -webkit-appearance: none; cursor: pointer;
            font-family: 'Inter',sans-serif; font-size: 11px; font-weight: 600;
            padding: 6px 26px 6px 10px; border-radius: 99px; outline: none;
            transition: background-color .18s, border-color .18s, color .18s; flex-shrink: 0; min-width: 128px;
            max-width: 100%;
            background-repeat: no-repeat !important;
            background-position: right 8px center !important;
            background-size: 10px !important;
        }

        .m70-missoes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px,1fr)); gap: 12px; }

        .m70-mission-card {
            position: relative; cursor: pointer; padding: 14px; border-radius: 16px;
            background: ${t.bgEl}; border: 1px solid ${t.border}; backdrop-filter: blur(24px);
            display: flex; flex-direction: column; gap: 10px; min-height: 188px;
            transition: border-color .2s, box-shadow .2s, transform .2s;
        }
        .m70-mission-card:hover { border-color: rgba(201,169,110,.4); transform: translateY(-2px); box-shadow: 0 10px 26px rgba(0,0,0,${isDark ? ".3" : ".08"}); }
        .m70-mission-card.cancelada { cursor: default; opacity: .68; }
        .m70-mission-card.concluida:hover { border-color: rgba(122,158,126,.5); }

        .m70-mission-icon {
            width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center; font-size: 15px;
        }
        .m70-mission-card-actions { display: flex; gap: 4px; }
        .m70-mission-icon-btn {
            width: 24px; height: 24px; border-radius: 7px; flex-shrink: 0;
            border: 1px solid ${t.border}; background: transparent; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            color: ${t.textMuted}; transition: border-color .15s, color .15s;
        }
        .m70-mission-icon-btn:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }
        .m70-mission-icon-btn.danger:hover { border-color: ${AURA.red}; color: #e8556d; }

        .m70-mission-name {
            font-family: 'Playfair Display', serif; font-size: 13.5px; font-weight: 500; color: ${t.text};
            margin: 0; line-height: 1.28; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .m70-mission-addr {
            font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 300; color: ${t.textSec};
            margin: 3px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        /* ── Rodapé de ações (botões lado a lado) — largura fixa evita "pulo" ── */
        .m70-modal-actions { display: flex; gap: 8px; align-items: stretch; }
        .m70-modal-actions > * { flex: 1; min-width: 0; }

        @media(max-width: 400px) {
            .m70-btn-primary, .m70-btn-blue, .m70-btn-ghost, .m70-btn-danger { font-size: 9px; padding: 10px 12px; letter-spacing: .06em; }
            .m70-mission-icon-btn { width: 22px; height: 22px; }
            .m70-decisao-select { min-width: 108px; font-size: 10px; }
        }
        @media(min-width: 420px) { .m70-missoes-grid { grid-template-columns: repeat(auto-fill, minmax(178px,1fr)); } }
        @media(min-width: 500px) { .m70-stats-grid { grid-template-columns: repeat(4,1fr) !important; } }
        @media(min-width: 600px) { .m70-filters-grid { grid-template-columns: 1fr 1fr !important; } }
        `}</style>
    );
}

/* ── Select de decisão espiritual — estilizado por cor conforme a decisão ──
   FIX: removida a propriedade shorthand `background` do inline style.
   Antes, `background: "...cor..., url(...)"` (uma string inválida como
   shorthand, já que shorthand de background não aceita vírgula assim)
   resetava background-repeat/position/size para os valores padrão do
   navegador (repeat / 0 0 / auto), fazendo a setinha SVG se repetir
   (tile) por toda a largura do select — o efeito de "várias setinhas"
   tremendo que aparecia no card do visitante "NOVO". Agora usamos
   apenas as propriedades longhand (backgroundColor, backgroundImage,
   backgroundRepeat, backgroundPosition, backgroundSize), que não têm
   esse efeito colateral. */
function DecisaoSelect({ value, onChange, isDark, disabled = false }) {
    const cfg = value ? DECISAO_CONFIG[value] : null;
    const cor = cfg ? cfg.cor : (isDark ? "#9A9588" : "#6B5E4A");
    const arrow = encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='${cor}' stroke-width='3'><path d='M6 9l6 6 6-6'/></svg>`
    );
    return (
        <select
            className="m70-decisao-select"
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={{
                color: cor,
                backgroundColor: cfg ? `${cfg.cor}14` : (isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)"),
                backgroundImage: `url("data:image/svg+xml,${arrow}")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
                backgroundSize: "10px",
                border: `1px solid ${cfg ? cfg.cor + "55" : (isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.12)")}`,
                opacity: disabled ? .6 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
            }}
        >
            <option value="">Sem decisão</option>
            {Object.entries(DECISAO_CONFIG).map(([key, c]) => (
                <option key={key} value={key}>{c.icone} {c.label}</option>
            ))}
        </select>
    );
}

/* ── Botão com estado de carregamento sem "pulo" de largura ──
   O texto é mantido no DOM (apenas com visibility:hidden) enquanto o
   spinner ocupa o espaço centralizado por cima, então o botão nunca
   muda de tamanho ao alternar entre os dois estados — isso elimina o
   "tremor" visual que ocorria quando o conteúdo interno mudava de
   "Registrar Culto" para o ícone giratório.
   FIX 2: além disso, o clique tira o foco do botão (blur) ANTES de
   desabilitá-lo. Se o botão continua focado no instante em que vira
   `disabled`, alguns navegadores (principalmente mobile) recalculam o
   foco/scroll imediatamente, e isso é percebido como um "tremor" da
   janela/modal. Tirando o foco primeiro, a troca de estado fica suave. */
function BotaoCarregavel({ className, loading, disabled, onClick, children, style }) {
    const handleClick = (e) => {
        e.currentTarget.blur();
        onClick?.(e);
    };
    return (
        <button
            className={className}
            onClick={handleClick}
            disabled={disabled || loading}
            style={{ position: "relative", ...style }}
        >
            <span style={{ visibility: loading ? "hidden" : "visible", display: "inline-flex", alignItems: "center", gap: 8 }}>
                {children}
            </span>
            {loading && (
                <Loader2
                    size={14}
                    className="m70-spin"
                    style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
                />
            )}
        </button>
    );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function Missao70Lider({ celulaId, isDark = true }) {
    const t = theme(isDark);

    const [missoes, setMissoes]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [modalDetalhes, setModalDetalhes] = useState(false);
    const [missaoDetalhe, setMissaoDetalhe] = useState(null);
    const [busca, setBusca]           = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim]       = useState("");
    const [toast, setToast]           = useState(null);
    const [modalCriar, setModalCriar]         = useState(false);
    const [modalEncontro, setModalEncontro]   = useState(false);
    const [modalCancelar, setModalCancelar]   = useState(false);
    const [modalPickVisitantes, setModalPickVisitantes] = useState(false);
    const [pickIds, setPickIds]               = useState(new Set());
    const [pickBusca, setPickBusca]           = useState("");
    const [targetId, setTargetId]             = useState(null);
    const [targetNome, setTargetNome]         = useState("");
    const [fCriar, setFCriar] = useState({ nome: "", endereco: "", nomeAnfitriao: "", telefoneContato: "", horario: "19:30", liderId: null, auxiliarId: null, terceiroMembroId: null });

    const [fEnc, setFEnc] = useState({
        data: new Date().toISOString().split("T")[0],
        horaEncontro: "",
        observacoes: "",
        visitantesPresentesIds: new Set(),
        decisoes: {},
    });
    // Confirmação explícita (dentro do app) de que o líder quer registrar
    // a semana mesmo sem nenhum visitante marcado como presente. Substitui
    // o antigo `window.confirm`, que era um diálogo nativo do navegador e
    // causava um "tremor"/reflow visual no modal ao abrir/fechar.
    const [confirmoSemVisitantes, setConfirmoSemVisitantes] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fCancelar, setFCancelar] = useState({ motivo: "", observacao: "" });

    // ── Abas do modal de encontro + histórico ──
    const [encontroTab, setEncontroTab]           = useState("novo"); // 'novo' | 'historico'
    const [historicoEncontros, setHistoricoEncontros] = useState([]);
    const [historicoLoading, setHistoricoLoading]     = useState(false);
    const [historicoErro, setHistoricoErro]           = useState(null);
    const [editandoEncontroId, setEditandoEncontroId] = useState(null);
    const [fEditEnc, setFEditEnc] = useState({ data: "", horaEncontro: "", observacoes: "", visitantesPresentesIds: new Set(), decisoes: {} });
    const [editBuscaVisitante, setEditBuscaVisitante] = useState("");

    const MOTIVOS_CANCELAMENTO = [
        { value: "ANFITRIAO_DESISTIU",           label: "Anfitrião desistiu" },
        { value: "SEM_INTERESSE_MORADORES",       label: "Falta de interesse dos moradores" },
        { value: "MUDANCA_ENDERECO",              label: "Anfitrião mudou de endereço" },
        { value: "FALTA_DISPONIBILIDADE_LIDER",   label: "Falta de disponibilidade do líder/auxiliar" },
        { value: "BAIXA_FREQUENCIA_VISITANTES",   label: "Baixa frequência de visitantes" },
        { value: "CONFLITO_HORARIO",              label: "Conflito de horário" },
        { value: "PROBLEMA_SEGURANCA_LOCAL",      label: "Problema de segurança no local" },
        { value: "OUTRO",                         label: "Outro motivo" },
    ];

    const membrosHook    = useMembros(celulaId);
    const visitantesHook = useVisitantes(celulaId);
    const { historico: historicoDecisoes, buscarEmLote, atualizarDecisaoLocal } = useHistoricoDecisoes();
    const [decisaoSalvandoId, setDecisaoSalvandoId] = useState(null);

    const showToast = (msg, tipo = "success") => { setToast({ msg, tipo }); setTimeout(() => setToast(null), 3500); };

    const carregar = useCallback(async () => {
        try {
            setLoading(true);
            const url = celulaId ? `/api/missao70?celulaId=${celulaId}&page=0&size=100&sort=id,desc` : "/api/missao70?page=0&size=100&sort=id,desc";
            const res = await api.get(url);
            const lista = Array.isArray(res.data) ? res.data : res.data?.content ?? res.data?.data ?? [];
            setMissoes(lista);
            const todosIds = lista.flatMap(m => (m.visitantes || []).map(v => v.id).filter(Boolean));
            const idsUnicos = [...new Set(todosIds)];
            if (idsUnicos.length > 0) buscarEmLote(idsUnicos);
        } catch (err) { console.error(err); setMissoes([]); }
        finally { setLoading(false); }
    }, [celulaId, buscarEmLote]);

    useEffect(() => { carregar(); }, [carregar]);

    // ── Sincronização em tempo real com a tela de Visitantes ─────────────
    // Quando a decisão espiritual de um visitante é alterada em outra tela
    // (ex: cadastro/edição de Visitantes), atualizamos aqui na hora: o
    // cache do histórico de decisões e a lista de missões carregadas em
    // memória (inclusive o modal de detalhes, se estiver aberto).
    useEffect(() => {
        function aoAtualizarDecisaoExterna(e) {
            const { visitanteId, decisaoEspiritual } = e.detail || {};
            if (!visitanteId) return;
            atualizarDecisaoLocal(visitanteId, decisaoEspiritual || null);
            setMissoes(prev => prev.map(m => ({
                ...m,
                visitantes: (m.visitantes || []).map(v =>
                    v.id === visitanteId ? { ...v, decisaoEspiritual } : v
                ),
            })));
            setMissaoDetalhe(md => {
                if (!md) return md;
                return {
                    ...md,
                    visitantes: (md.visitantes || []).map(v =>
                        v.id === visitanteId ? { ...v, decisaoEspiritual } : v
                    ),
                };
            });
        }
        window.addEventListener(EVENTO_DECISAO_ATUALIZADA, aoAtualizarDecisaoExterna);
        return () => window.removeEventListener(EVENTO_DECISAO_ATUALIZADA, aoAtualizarDecisaoExterna);
    }, [atualizarDecisaoLocal]);

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
    // "Ativas" conta qualquer missão que NÃO esteja cancelada — inclui tanto
    // as que ainda estão em andamento quanto as que já concluíram as 4
    // semanas. Antes isso dependia só do campo bruto `status` vindo do
    // backend (que pode continuar "ATIVA" mesmo após concluir as semanas,
    // ou vice-versa), o que deixava o card mostrando 0 mesmo com missões
    // cadastradas.
    const ativas          = missoes.filter(m => !(m.status || "").toLowerCase().includes("cancel")).length;
    // "Visitantes alcançados" só conta quem tem alguma decisão espiritual
    // registrada (Aceitou Jesus, Reconciliou ou Deseja Batismo) e cuja
    // missão não está cancelada (ativa/em andamento ou já concluída).
    const totalVisitantes = missoes.reduce((s, m) => {
        const cancelada = (m.status || "").toLowerCase().includes("cancel");
        if (cancelada) return s;
        const comDecisao = (m.visitantes || []).filter(v => {
            const decisao = historicoDecisoes[v.id] !== undefined
                ? historicoDecisoes[v.id]
                : (v.decisaoEspiritual ?? null);
            return decisao && decisao !== "NENHUMA" && DECISAO_CONFIG[decisao];
        }).length;
        return s + comDecisao;
    }, 0);
    const totalEncontros  = missoes.reduce((s, m) => s + (m.encontrosRealizados ?? 0), 0);

    const abrirModalCriar = () => {
        setFCriar({ nome: "", endereco: "", nomeAnfitriao: "", telefoneContato: "", horario: "19:30", liderId: null, auxiliarId: null, terceiroMembroId: null });
        membrosHook.buscar();
        setModalCriar(true);
    };

    // ── Seleção de Líder/Auxiliar/Membro mutuamente exclusiva ──
    const selecionarLider = (p) => {
        setFCriar(f => ({
            ...f,
            liderId: p.id,
            auxiliarId: f.auxiliarId === p.id ? null : f.auxiliarId,
            terceiroMembroId: f.terceiroMembroId === p.id ? null : f.terceiroMembroId,
        }));
    };
    const selecionarAuxiliar = (p) => {
        setFCriar(f => ({
            ...f,
            auxiliarId: p.id,
            liderId: f.liderId === p.id ? null : f.liderId,
            terceiroMembroId: f.terceiroMembroId === p.id ? null : f.terceiroMembroId,
        }));
    };
    const selecionarTerceiro = (p) => {
        setFCriar(f => ({
            ...f,
            terceiroMembroId: p.id,
            liderId: f.liderId === p.id ? null : f.liderId,
            auxiliarId: f.auxiliarId === p.id ? null : f.auxiliarId,
        }));
    };

    // ── Histórico de semanas/encontros ──
    const carregarHistorico = useCallback(async (missaoId) => {
        if (!missaoId) return;
        setHistoricoLoading(true); setHistoricoErro(null);
        try {
            const res = await api.get(`/api/missao70/${missaoId}/encontros`);
            const lista = Array.isArray(res.data) ? res.data : res.data?.content ?? res.data?.data ?? [];
            setHistoricoEncontros(lista);
        } catch {
            setHistoricoErro("Não foi possível carregar o histórico de semanas.");
            setHistoricoEncontros([]);
        } finally { setHistoricoLoading(false); }
    }, []);

    const abrirModalEncontro = (missao) => {
        setTargetId(missao.id);
        setTargetNome(missao.nome || "");
        visitantesHook.buscar();
        const visitantes = missao.visitantes ?? [];
        const presentesIds = new Set(visitantes.map(v => v.id));
        // A decisão espiritual SEMPRE começa em branco ao abrir uma nova
        // semana. Antes, aqui era pré-carregada a última decisão já
        // registrada do visitante — o que fazia com que, se o líder não
        // limpasse o campo, a mesma decisão fosse enviada de novo a cada
        // semana, gerando registros duplicados. Agora a decisão só é
        // gravada nesta semana se o líder escolher ativamente no seletor;
        // o status já existente aparece apenas como informação (badge),
        // sem preencher o campo automaticamente.
        const decisoesInit = {};
        setFEnc({
            data: new Date().toISOString().split("T")[0],
            horaEncontro: missao.horario || "",
            observacoes: "",
            visitantesPresentesIds: presentesIds,
            decisoes: decisoesInit,
        });
        setEncontroTab("novo");
        setEditandoEncontroId(null);
        setConfirmoSemVisitantes(false);
        setModalEncontro(true);
        // Carrega o histórico já na abertura, para permitir validar duplicidade de data na aba "Registrar"
        carregarHistorico(missao.id);
    };

    // ── Busca um visitante (na missão ou na célula) para exibir nome/telefone ──
    const buscarVisitantePorId = (id) => {
        const missaoAtual = missoes.find(m => m.id === targetId);
        return (missaoAtual?.visitantes || []).find(x => x.id === id) || visitantesHook.visitantes.find(x => x.id === id);
    };

    const abrirModalCancelar = (id, nome) => { setTargetId(id); setTargetNome(nome || ""); setFCancelar({ motivo: "", observacao: "" }); setModalCancelar(true); };

    const abrirDetalhes = (missao) => { setMissaoDetalhe(missao); setModalDetalhes(true); };

    // ── Altera a decisão espiritual de um visitante diretamente (fora do fluxo de encontro) ──
    const alterarDecisaoVisitante = async (missaoId, visitanteId, novaDecisao) => {
        setDecisaoSalvandoId(visitanteId);
        try {
            await api.patch(`/api/missao70/${missaoId}/visitantes/${visitanteId}/decisao`, {
                tipoDecisao: novaDecisao || null,
            });
            atualizarDecisaoLocal(visitanteId, novaDecisao || null);
            // Avisa qualquer outra tela (ex: Visitantes) que essa decisão mudou
            window.dispatchEvent(new CustomEvent(EVENTO_DECISAO_ATUALIZADA, {
                detail: { visitanteId, decisaoEspiritual: novaDecisao || null },
            }));
            // Mantém o card de detalhes em memória sincronizado, se estiver aberto
            setMissaoDetalhe(md => {
                if (!md || md.id !== missaoId) return md;
                return {
                    ...md,
                    visitantes: (md.visitantes || []).map(v =>
                        v.id === visitanteId ? { ...v, decisaoEspiritual: novaDecisao || null } : v
                    ),
                };
            });
            showToast("Decisão atualizada!", "success");
        } catch (err) {
            showToast(err.response?.data?.message || "Erro ao atualizar decisão.", "error");
        } finally {
            setDecisaoSalvandoId(null);
        }
    };

    const abrirPickerVisitantes = () => {
        setPickIds(new Set(fEnc.visitantesPresentesIds));
        setPickBusca("");
        visitantesHook.buscar();
        setModalPickVisitantes(true);
    };

    const confirmarPickVisitantes = () => {
        // A decisão espiritual NUNCA é pré-preenchida automaticamente ao
        // marcar presença — mesmo para visitantes que já têm uma decisão
        // anterior registrada. O seletor deste encontro começa em branco;
        // o status já existente é mostrado apenas como informação (badge)
        // ao lado do nome, e só é gravado de novo se o líder escolher
        // ativamente no seletor.
        setFEnc(f => ({ ...f, visitantesPresentesIds: new Set(pickIds) }));
        setModalPickVisitantes(false);
    };

    const togglePick = (id) => {
        setPickIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const pickSelectAll = (ids) => {
        setPickIds(prev => {
            const next = new Set(prev);
            ids.forEach(id => next.add(id));
            return next;
        });
    };

    const pickClearAll = (ids) => {
        setPickIds(prev => {
            const next = new Set(prev);
            ids.forEach(id => next.delete(id));
            return next;
        });
    };

    // Datas já usadas em encontros registrados desta missão (para bloquear duplicidade)
    const datasJaRegistradas = new Set(
        historicoEncontros
            .filter(enc => enc.id !== editandoEncontroId)
            .map(enc => (enc.dataEncontro || enc.data || "").split("T")[0])
            .filter(Boolean)
    );
    const dataAtualJaRegistrada = fEnc.data && datasJaRegistradas.has(fEnc.data);

    const criarMissao = async () => {
        if (!fCriar.nome.trim())          { showToast("Informe o nome da Missão 70.", "error"); return; }
        if (!fCriar.nomeAnfitriao.trim()) { showToast("Informe o nome do anfitrião.", "error"); return; }
        setSubmitting(true);
        try {
            await api.post("/api/missao70", {
                nome: fCriar.nome.trim(),
                nomeAnfitriao: fCriar.nomeAnfitriao.trim(),
                horario: fCriar.horario || "19:30",
                endereco: fCriar.endereco.trim(),
                telefoneContato: fCriar.telefoneContato.trim(),
                dataInicio: new Date().toISOString().split("T")[0],
                celulaId: celulaId ?? null,
                liderId: fCriar.liderId ?? null,
                auxiliarId: fCriar.auxiliarId ?? null,
                terceiroMembroId: fCriar.terceiroMembroId ?? null,
            });
            setModalCriar(false); carregar();
            showToast("Missão criada com sucesso!", "success");
        } catch (err) { showToast(err.response?.data?.message || "Erro ao criar Missão 70.", "error"); }
        finally { setSubmitting(false); }
    };

    const registrarEncontro = async () => {
        if (!fEnc.data) { showToast("Informe a data.", "error"); return; }
        if (datasJaRegistradas.has(fEnc.data)) {
            showToast("Já existe uma semana registrada nessa data.", "error");
            return;
        }
        // Substitui o antigo `window.confirm` (diálogo nativo do navegador,
        // que causava reflow/"tremor" no modal ao abrir/fechar) por uma
        // confirmação simples via checkbox dentro do próprio modal.
        if (fEnc.visitantesPresentesIds.size === 0 && !confirmoSemVisitantes) {
            showToast("Marque a confirmação para registrar sem visitantes.", "error");
            return;
        }
        setSubmitting(true);
        try {
            const missaoAtual = missoes.find(m => m.id === targetId);
            const idsAtuais = new Set((missaoAtual?.visitantes || []).map(v => v.id));
            const visitantesPresentesIds = [...fEnc.visitantesPresentesIds];
            const novosParaAdicionar = visitantesPresentesIds.filter(id => !idsAtuais.has(id));

            // Adiciona à missão qualquer visitante selecionado que ainda não fazia parte dela
            if (novosParaAdicionar.length > 0) {
                await Promise.allSettled(
                    novosParaAdicionar.map(id => api.post(`/api/missao70/${targetId}/visitantes/${id}`))
                );
            }

            const decisoes = Object.entries(fEnc.decisoes)
                .filter(([, tipo]) => tipo && tipo !== "NENHUMA")
                .map(([visitanteId, tipoDecisao]) => ({
                    visitanteId: Number(visitanteId),
                    tipoDecisao: tipoDecisao,
                }));

            const res = await api.post(`/api/missao70/${targetId}/encontros`, {
                dataEncontro: fEnc.data,
                horaEncontro: fEnc.horaEncontro || undefined,
                observacoes: fEnc.observacoes,
                visitantesPresentesIds,
                decisoes,
            });

            const msg = res.data?.mensagem || "Semana registrada com sucesso!";

            // Propaga as decisões desta semana para o cache local e para
            // qualquer outra tela aberta (ex: Visitantes), na hora.
            decisoes.forEach(d => {
                atualizarDecisaoLocal(d.visitanteId, d.tipoDecisao);
                window.dispatchEvent(new CustomEvent(EVENTO_DECISAO_ATUALIZADA, {
                    detail: { visitanteId: d.visitanteId, decisaoEspiritual: d.tipoDecisao },
                }));
            });

            if (celulaId) {
                try {
                    await api.put(`/metas/celula/${celulaId}/recalcular`);
                    showToast(`${msg} Metas atualizadas.`, "success");
                } catch {
                    showToast(`${msg} Mas falha ao atualizar metas.`, "error");
                }
            } else {
                showToast(msg, "success");
            }

            setModalEncontro(false);
            setFEnc({ data: new Date().toISOString().split("T")[0], horaEncontro: "", observacoes: "", visitantesPresentesIds: new Set(), decisoes: {} });
            setConfirmoSemVisitantes(false);
            carregar();
        } catch (err) { showToast(err.response?.data?.message || "Erro ao registrar encontro.", "error"); }
        finally { setSubmitting(false); }
    };

    const abrirAbaHistorico = () => {
        setEncontroTab("historico");
        setEditandoEncontroId(null);
        carregarHistorico(targetId);
        // Garante que a lista completa de visitantes da célula esteja disponível
        // para permitir adicionar/remover presença em qualquer semana do histórico.
        visitantesHook.buscar();
    };

    // Extrai ids de visitantes presentes e decisões de um registro de encontro,
    // aceitando os formatos mais comuns que a API pode retornar.
    const extrairPresentesEDecisoes = (enc) => {
        const listaVisitantes = enc.visitantesPresentes ?? enc.visitantes ?? enc.presentes ?? enc.visitantesPresentesIds ?? [];
        const listaDecisoes = enc.decisoes ?? [];
        const ids = new Set(listaVisitantes.map(item => (typeof item === "object" ? (item.id ?? item.visitanteId) : item)));
        const decisoesMap = {};
        listaDecisoes.forEach(d => {
            const vid = d.visitanteId ?? d.id;
            const tipo = d.tipoDecisao ?? d.decisaoEspiritual;
            if (vid && tipo) decisoesMap[vid] = tipo;
        });
        return { ids, decisoesMap };
    };

    const iniciarEdicaoEncontro = (enc) => {
        setEditandoEncontroId(enc.id);
        const { ids, decisoesMap } = extrairPresentesEDecisoes(enc);
        setFEditEnc({
            data: (enc.dataEncontro || enc.data || "").split("T")[0],
            horaEncontro: enc.horaEncontro || "",
            observacoes: enc.observacoes || "",
            visitantesPresentesIds: ids,
            decisoes: decisoesMap,
        });
        setEditBuscaVisitante("");
        visitantesHook.buscar();
    };

    const toggleEditPresente = (visitanteId) => {
        setFEditEnc(f => {
            const next = new Set(f.visitantesPresentesIds);
            if (next.has(visitanteId)) next.delete(visitanteId); else next.add(visitanteId);
            return { ...f, visitantesPresentesIds: next };
        });
    };

    const salvarEdicaoEncontro = async () => {
        if (!fEditEnc.data) { showToast("Informe a data.", "error"); return; }
        const dataDuplicada = historicoEncontros.some(
            enc => enc.id !== editandoEncontroId && (enc.dataEncontro || enc.data || "").split("T")[0] === fEditEnc.data
        );
        if (dataDuplicada) { showToast("Já existe outra semana registrada nessa data.", "error"); return; }
        setSubmitting(true);
        try {
            // Visitantes marcados que ainda não fazem parte da missão são adicionados a ela
            const missaoAtual = missoes.find(m => m.id === targetId);
            const idsAtuais = new Set((missaoAtual?.visitantes || []).map(v => v.id));
            const visitantesPresentesIds = [...fEditEnc.visitantesPresentesIds];
            const novosParaAdicionar = visitantesPresentesIds.filter(id => !idsAtuais.has(id));
            if (novosParaAdicionar.length > 0) {
                await Promise.allSettled(
                    novosParaAdicionar.map(id => api.post(`/api/missao70/${targetId}/visitantes/${id}`))
                );
            }

            const decisoes = Object.entries(fEditEnc.decisoes)
                .filter(([vid, tipo]) => tipo && tipo !== "NENHUMA" && fEditEnc.visitantesPresentesIds.has(Number(vid)))
                .map(([visitanteId, tipoDecisao]) => ({
                    visitanteId: Number(visitanteId),
                    tipoDecisao,
                }));

            await api.put(`/api/missao70/${targetId}/encontros/${editandoEncontroId}`, {
                dataEncontro: fEditEnc.data,
                horaEncontro: fEditEnc.horaEncontro || undefined,
                observacoes: fEditEnc.observacoes,
                visitantesPresentesIds,
                decisoes,
            });

            // Propaga as decisões editadas nesta semana para o cache local e
            // para qualquer outra tela aberta (ex: Visitantes), na hora.
            decisoes.forEach(d => {
                atualizarDecisaoLocal(d.visitanteId, d.tipoDecisao);
                window.dispatchEvent(new CustomEvent(EVENTO_DECISAO_ATUALIZADA, {
                    detail: { visitanteId: d.visitanteId, decisaoEspiritual: d.tipoDecisao },
                }));
            });

            setEditandoEncontroId(null);
            await carregarHistorico(targetId);
            carregar();
            showToast("Semana atualizada!", "success");
        } catch (err) { showToast(err.response?.data?.message || "Erro ao atualizar semana.", "error"); }
        finally { setSubmitting(false); }
    };

    const excluirEncontro = async (encontroId) => {
        if (!window.confirm("Excluir este registro de semana? Essa ação não pode ser desfeita.")) return;
        setSubmitting(true);
        try {
            await api.delete(`/api/missao70/${targetId}/encontros/${encontroId}`);
            await carregarHistorico(targetId);
            carregar();
            showToast("Registro excluído.", "success");
        } catch (err) { showToast(err.response?.data?.message || "Erro ao excluir registro.", "error"); }
        finally { setSubmitting(false); }
    };

    const cancelarMissao = async () => {
        if (!fCancelar.motivo) { showToast("Selecione um motivo de cancelamento.", "error"); return; }
        if (fCancelar.motivo === "OUTRO" && !fCancelar.observacao.trim()) { showToast("Informe a observação do cancelamento.", "error"); return; }
        setSubmitting(true);
        try {
            await api.patch(`/api/missao70/${targetId}/cancelar`, {
                motivoCancelamento: fCancelar.motivo,
                observacaoCancelamento: fCancelar.observacao.trim() || undefined,
            });
            setModalCancelar(false);
            setModalEncontro(false);
            carregar();
            showToast("Missão cancelada.", "success");
        }
        catch (err) { showToast(err.response?.data?.message || "Erro ao cancelar.", "error"); }
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
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(253,184,19,.12)", border: "1px solid rgba(253,184,19,.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Flame size={20} color={AURA.yellow} />
                    </div>
                    <div style={{ minWidth: 0 }}>
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
                ) : (
                    <div className="m70-missoes-grid">
                        {missoesFiltradas.map((m, i) => {
                            const cancelada  = (m.status || "").toLowerCase().includes("cancel");
                            const realizados = Math.max(0, Math.min(m.encontrosRealizados ?? 0, TOTAL_SEMANAS));
                            const restantes  = Math.max(0, TOTAL_SEMANAS - realizados);
                            const concluida  = restantes === 0 && !cancelada;
                            const corAtual   = corEstagio(realizados);

                            return (
                                <motion.div key={m.id}
                                            className={`m70-card-anim m70-mission-card${cancelada ? " cancelada" : ""}${concluida ? " concluida" : ""}`}
                                            style={{
                                                animationDelay: `${i * 0.05}s`,
                                                borderColor: cancelada ? t.border : `${corAtual}66`,
                                                background: cancelada ? t.bgEl : `linear-gradient(160deg, ${corAtual}16 0%, transparent 65%), ${t.bgEl}`,
                                            }}
                                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                            onClick={() => { if (!cancelada) abrirModalEncontro(m); else abrirDetalhes(m); }}
                                >
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                        <div className="m70-mission-icon" style={{ background: cancelada ? "rgba(200,16,46,.12)" : `${corAtual}20` }}>
                                            {concluida ? "✅" : cancelada ? "🚫" : "🔥"}
                                        </div>
                                        <div className="m70-mission-card-actions">
                                            <button className="m70-mission-icon-btn" onClick={e => { e.stopPropagation(); abrirDetalhes(m); }} title="Detalhes">
                                                <ChevronDown size={13} />
                                            </button>
                                            {!cancelada && (
                                                <button className="m70-mission-icon-btn danger" onClick={e => { e.stopPropagation(); abrirModalCancelar(m.id, m.nome); }} title="Cancelar missão">
                                                    <Ban size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <p className="m70-mission-name">{m.nome || "Missão " + m.id}</p>
                                        <p className="m70-mission-addr">{m.endereco || "Endereço não informado"}</p>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, border: `2px solid ${cancelada ? "rgba(200,16,46,.5)" : corAtual}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 600, color: cancelada ? AURA.red : corAtual, lineHeight: 1 }}>{restantes}</span>
                                        </div>
                                        <BadgeStatus status={concluida ? "concluida" : m.status} />
                                    </div>

                                    <div>
                                        <div style={{ display: "flex", gap: 3 }}>
                                            {Array.from({ length: TOTAL_SEMANAS }, (_, idx) => (
                                                <div key={idx} className="m70-progress-track" style={{ height: 4 }}>
                                                    <div style={{ height: "100%", borderRadius: 99, background: idx < realizados ? CORES_SEMANA[idx] : "transparent", width: "100%" }} />
                                                </div>
                                            ))}
                                        </div>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9.5, fontWeight: 300, color: t.textMuted, margin: "5px 0 0" }}>Semana {realizados} de {TOTAL_SEMANAS}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ════════════ MODAIS ════════════ */}
            <AnimatePresence>

                {/* ── CRIAR MISSÃO — modal quadrado, centralizado ── */}
                {modalCriar && (
                    <AuraSquareModal
                        open={modalCriar}
                        onClose={() => setModalCriar(false)}
                        title="Nova Missão 70"
                        subtitle="Cadastro da casa de evangelismo"
                        t={t}
                        maxWidth={460}
                        footer={
                            <div className="m70-modal-actions">
                                <button className="m70-btn-ghost" onClick={() => setModalCriar(false)}>Cancelar</button>
                                <BotaoCarregavel className="m70-btn-blue" style={{ flex: 2 }} loading={submitting} onClick={criarMissao}>
                                    Criar Missão
                                </BotaoCarregavel>
                            </div>
                        }
                    >
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div>
                                <p className="m70-label">Nome da missão *</p>
                                <input className="m70-input" placeholder="Missão Rua das Flores" value={fCriar.nome} onChange={e => setFCriar(f => ({ ...f, nome: e.target.value }))} style={{ padding: "10px 12px", fontSize: 13 }} />
                            </div>
                            <div>
                                <p className="m70-label">Anfitrião *</p>
                                <input className="m70-input" placeholder="João Silva" value={fCriar.nomeAnfitriao} onChange={e => setFCriar(f => ({ ...f, nomeAnfitriao: e.target.value }))} style={{ padding: "10px 12px", fontSize: 13 }} />
                            </div>
                        </div>
                        <div>
                            <p className="m70-label">Endereço</p>
                            <input className="m70-input" placeholder="Rua, número, bairro" value={fCriar.endereco} onChange={e => setFCriar(f => ({ ...f, endereco: e.target.value }))} style={{ padding: "10px 12px", fontSize: 13 }} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div>
                                <p className="m70-label">Telefone</p>
                                <input className="m70-input" placeholder="(71) 9 0000-0000" value={fCriar.telefoneContato} onChange={e => setFCriar(f => ({ ...f, telefoneContato: e.target.value }))} style={{ padding: "10px 12px", fontSize: 13 }} />
                            </div>
                            <div>
                                <p className="m70-label">Horário</p>
                                <input className="m70-input" type="time" value={fCriar.horario} onChange={e => setFCriar(f => ({ ...f, horario: e.target.value }))} style={{ colorScheme: isDark ? "dark" : "light", padding: "10px 12px", fontSize: 13 }} />
                            </div>
                        </div>

                        <div style={{ background: "rgba(112,144,232,.06)", border: "1px solid rgba(112,144,232,.2)", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13 }}>ℹ️</span>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 11, fontWeight: 300, color: t.textSec, margin: 0, lineHeight: 1.4 }}>Cada membro só pode ocupar uma função — Líder, Auxiliar ou Membro adicional.</p>
                        </div>

                        <div>
                            <p className="m70-label">Líder</p>
                            <PessoaSelector
                                items={membrosHook.membros.filter(mb => mb.id !== fCriar.auxiliarId && mb.id !== fCriar.terceiroMembroId)}
                                loading={membrosHook.loading} erro={membrosHook.erro}
                                selectedId={fCriar.liderId} onSelect={selecionarLider} placeholder="Pesquisar líder..." t={t}
                            />
                            {fCriar.liderId && <button className="m70-btn-clear" style={{ marginTop: 6 }} onClick={() => setFCriar(f => ({ ...f, liderId: null }))}>✕ Limpar</button>}
                        </div>
                        <div>
                            <p className="m70-label">Auxiliar</p>
                            <PessoaSelector
                                items={membrosHook.membros.filter(mb => mb.id !== fCriar.liderId && mb.id !== fCriar.terceiroMembroId)}
                                loading={membrosHook.loading} erro={membrosHook.erro}
                                selectedId={fCriar.auxiliarId} onSelect={selecionarAuxiliar} placeholder="Pesquisar auxiliar..." t={t}
                            />
                            {fCriar.auxiliarId && <button className="m70-btn-clear" style={{ marginTop: 6 }} onClick={() => setFCriar(f => ({ ...f, auxiliarId: null }))}>✕ Limpar</button>}
                        </div>
                        <div>
                            <p className="m70-label">Membro adicional (opcional)</p>
                            <PessoaSelector
                                items={membrosHook.membros.filter(mb => mb.id !== fCriar.liderId && mb.id !== fCriar.auxiliarId)}
                                loading={membrosHook.loading} erro={membrosHook.erro}
                                selectedId={fCriar.terceiroMembroId} onSelect={selecionarTerceiro} placeholder="Pesquisar membro..." t={t}
                            />
                            {fCriar.terceiroMembroId && (
                                <button className="m70-btn-clear" style={{ marginTop: 6 }} onClick={() => setFCriar(f => ({ ...f, terceiroMembroId: null }))}>✕ Limpar</button>
                            )}
                        </div>
                        <div style={{ background: "rgba(253,184,19,.08)", border: "1px solid rgba(253,184,19,.25)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                            <span style={{ fontSize: 16, flexShrink: 0 }}>✦</span>
                            <div>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: AURA.yellow, margin: "0 0 4px" }}>O que é a Missão 70?</p>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 300, color: t.textSec, margin: 0, lineHeight: 1.5 }}>
                                    São <strong style={{ color: t.text, fontWeight: 500 }}>4 encontros semanais</strong> de evangelismo na casa do anfitrião, para alcançar visitantes e registrar decisões de fé.
                                </p>
                            </div>
                        </div>
                    </AuraSquareModal>
                )}

                {/* ── REGISTRAR / HISTÓRICO / CANCELAR — popup quadrado compacto ── */}
                {modalEncontro && (() => {
                    const missaoModalAtual = missoes.find(m => m.id === targetId);
                    const realizadosModal = Math.max(0, Math.min(missaoModalAtual?.encontrosRealizados ?? 0, TOTAL_SEMANAS));
                    const corModal = corEstagio(realizadosModal);
                    return (
                        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 12, boxSizing: "border-box" }}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        onClick={() => setModalEncontro(false)}
                                        style={{ position: "fixed", inset: 0, background: "rgba(10,10,15,.82)", backdropFilter: "blur(3px)" }} />
                            <motion.div initial={{ scale: .96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .96, opacity: 0 }}
                                        transition={{ type: "tween", duration: .18 }}
                                        style={{
                                            position: "relative", zIndex: 10,
                                            width: "100%", maxWidth: 420,
                                            background: `linear-gradient(180deg, ${corModal}22 0%, ${corModal}0d 160px, ${t.bgEl} 320px, ${t.bgEl} 100%)`,
                                            border: `1px solid ${corModal}70`,
                                            borderRadius: 18, overflow: "hidden",
                                            maxHeight: "88vh", display: "flex", flexDirection: "column",
                                            boxShadow: `0 20px 60px rgba(0,0,0,.5), inset 0 0 0 1px ${corModal}14`,
                                        }}>
                                {/* Barra de destaque: mostra a cor da semana atual (1ª vermelho, 2ª amarelo, 3ª azul, 4ª roxo) */}
                                <div style={{ height: 5, flexShrink: 0, background: `linear-gradient(90deg, ${corModal}, ${corModal}99)` }} />
                                {/* Header */}
                                <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: `${corModal}30`, border: `1.5px solid ${corModal}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 14, color: corModal }}>
                                            {realizadosModal}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 500, color: t.text, margin: 0 }}>Semanas da Missão</h3>
                                            {targetNome && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 300, color: t.textMuted, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{targetNome}</p>}
                                        </div>
                                    </div>
                                    <button onClick={() => setModalEncontro(false)} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 4, display: "flex", flexShrink: 0 }}><X size={18} /></button>
                                </div>

                                {/* Tabs */}
                                <div style={{ display: "flex", gap: 8, padding: "12px 20px 0", flexShrink: 0 }}>
                                    <button className={`m70-tab ${encontroTab === "novo" ? "active" : ""}`} onClick={() => { setEncontroTab("novo"); setEditandoEncontroId(null); }}>
                                        <Plus size={12} /> Registrar
                                    </button>
                                    <button className={`m70-tab ${encontroTab === "historico" ? "active" : ""}`} onClick={abrirAbaHistorico}>
                                        <History size={12} /> Histórico
                                    </button>
                                </div>

                                {/* Body */}
                                {encontroTab === "novo" ? (
                                    <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", flex: 1, WebkitOverflowScrolling: "touch" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                            <div>
                                                <label className="m70-label" style={{ marginBottom: 4, display: "block" }}>Data *</label>
                                                <input className="m70-input" type="date" value={fEnc.data} onChange={e => setFEnc(f => ({ ...f, data: e.target.value }))} style={{ colorScheme: isDark ? "dark" : "light", width: "100%", boxSizing: "border-box", borderColor: dataAtualJaRegistrada ? AURA.red : undefined }} />
                                            </div>
                                            <div>
                                                <label className="m70-label" style={{ marginBottom: 4, display: "block" }}>Horário</label>
                                                <input className="m70-input" type="time" value={fEnc.horaEncontro} onChange={e => setFEnc(f => ({ ...f, horaEncontro: e.target.value }))} style={{ colorScheme: isDark ? "dark" : "light", width: "100%", boxSizing: "border-box" }} />
                                            </div>
                                        </div>
                                        {dataAtualJaRegistrada && (
                                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 500, color: "#e8556d", margin: "-4px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
                                                <Ban size={12} /> Já existe uma semana registrada nesta data. Escolha outra data ou edite o registro existente no Histórico.
                                            </p>
                                        )}
                                        <div>
                                            <label className="m70-label" style={{ marginBottom: 4, display: "block" }}>Observações</label>
                                            <textarea className="m70-input" style={{ minHeight: 60, resize: "vertical", width: "100%", boxSizing: "border-box" }} placeholder="Comentários..." value={fEnc.observacoes} onChange={e => setFEnc(f => ({ ...f, observacoes: e.target.value }))} />
                                        </div>
                                        <button type="button" onClick={abrirPickerVisitantes}
                                                style={{
                                                    width: "100%", padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                                                    border: `1px dashed ${t.borderInput}`, background: t.bgInput,
                                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                                                    fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500,
                                                    color: AURA.gold,
                                                }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                                                <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                                            </svg>
                                            Selecionar visitantes presentes
                                            <span style={{ fontSize: 11, color: t.textMuted }}>({fEnc.visitantesPresentesIds.size})</span>
                                        </button>
                                        {fEnc.visitantesPresentesIds.size > 0 ? (() => {
                                            const missaoAtual = missoes.find(m => m.id === targetId);
                                            const idsAtuais = new Set((missaoAtual?.visitantes || []).map(v => v.id));
                                            return (
                                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: t.textMuted, margin: "2px 0 0" }}>Presentes &amp; decisões de fé</p>
                                                    {[...fEnc.visitantesPresentesIds].map(vid => {
                                                        const v = buscarVisitantePorId(vid);
                                                        if (!v) return null;
                                                        const nome = v.nome ?? `#${v.id}`;
                                                        const ehNovo = !idsAtuais.has(vid);
                                                        const decisaoAtual = fEnc.decisoes[vid] || "";
                                                        // Decisão já registrada anteriormente para este visitante —
                                                        // é só informativa (mostrada como badge abaixo do nome) e
                                                        // NÃO pré-preenche o seletor: o seletor sempre começa em
                                                        // branco nesta semana, então a decisão só é gravada de
                                                        // novo se o líder escolher ativamente.
                                                        const decisaoJaExistente = historicoDecisoes[vid] !== undefined
                                                            ? historicoDecisoes[vid]
                                                            : (v.decisaoEspiritual ?? null);
                                                        return (
                                                            <div key={vid} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px 10px", borderRadius: 10, background: isDark ? "rgba(201,169,110,.03)" : "rgba(201,169,110,.03)", border: `1px solid ${t.border}` }}>
                                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                                                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 400, color: t.text, flex: 1, minWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
                                                                        {nome}
                                                                        {ehNovo && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".06em", color: AURA.sage, border: `1px solid ${AURA.sage}55`, background: `${AURA.sage}14`, borderRadius: 99, padding: "1px 6px", flexShrink: 0 }}>NOVO</span>}
                                                                    </span>
                                                                    <DecisaoSelect
                                                                        value={decisaoAtual}
                                                                        isDark={isDark}
                                                                        onChange={e => setFEnc(f => ({ ...f, decisoes: { ...f.decisoes, [vid]: e.target.value } }))}
                                                                    />
                                                                </div>
                                                                {decisaoJaExistente && decisaoJaExistente !== "NENHUMA" && (
                                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 300, fontStyle: "italic", color: t.textMuted }}>Já decidiu antes:</span>
                                                                        <BadgeDecisao decisao={decisaoJaExistente} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 11, fontWeight: 300, color: t.textMuted, margin: "2px 0 0" }}>Visitantes marcados como <strong style={{ color: AURA.sage, fontWeight: 600 }}>NOVO</strong> serão adicionados à missão automaticamente ao registrar.</p>
                                                </div>
                                            );
                                        })() : (
                                            // ── Sem visitantes selecionados ──
                                            // Antes disso disparava um `window.confirm()` nativo ao clicar em
                                            // "Registrar Culto", o que causava um reflow visível (o "tremor")
                                            // no modal. Agora a confirmação é feita aqui, dentro do próprio
                                            // modal, sem nenhum diálogo do navegador.
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: 10,
                                                padding: "10px 12px", borderRadius: 10,
                                                background: "rgba(200,16,46,.06)", border: "1px solid rgba(200,16,46,.25)",
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    id="m70-confirma-sem-visitantes"
                                                    checked={confirmoSemVisitantes}
                                                    onChange={e => setConfirmoSemVisitantes(e.target.checked)}
                                                    style={{ width: 15, height: 15, accentColor: AURA.red, cursor: "pointer", flexShrink: 0 }}
                                                />
                                                <label
                                                    htmlFor="m70-confirma-sem-visitantes"
                                                    style={{ fontFamily: "'Inter',sans-serif", fontSize: 11.5, fontWeight: 400, color: t.text, cursor: "pointer", lineHeight: 1.4 }}
                                                >
                                                    Nenhum visitante selecionado. Confirmo registrar mesmo assim.
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1, WebkitOverflowScrolling: "touch" }}>
                                        {historicoLoading && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0", color: t.textSec, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300 }}>
                                                <Loader2 size={16} className="m70-spin" style={{ color: AURA.gold }} /> Carregando histórico...
                                            </div>
                                        )}
                                        {!historicoLoading && historicoErro && (
                                            <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 13, fontWeight: 300, color: AURA.red }}>{historicoErro}</p>
                                        )}
                                        {!historicoLoading && !historicoErro && historicoEncontros.length === 0 && (
                                            <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 13, fontWeight: 300, color: t.textSec, textAlign: "center", padding: "20px 0" }}>Nenhuma semana registrada ainda.</p>
                                        )}
                                        {!historicoLoading && historicoEncontros.map((enc, idx) => {
                                            const editando = editandoEncontroId === enc.id;
                                            const dataFmt = (enc.dataEncontro || enc.data || "").split("T")[0];

                                            // Extrai a lista de visitantes presentes desse encontro, tentando os
                                            // formatos mais comuns retornados pela API.
                                            const listaVisitantesEnc =
                                                enc.visitantesPresentes ?? enc.visitantes ?? enc.presentes ?? enc.visitantesPresentesIds ?? [];
                                            const listaDecisoesEnc = enc.decisoes ?? [];

                                            return (
                                                <div key={enc.id ?? idx} style={{ border: `1px solid ${editando ? "rgba(201,169,110,.4)" : t.border}`, borderRadius: 12, padding: "12px 14px", background: editando ? "rgba(201,169,110,.05)" : "transparent" }}>
                                                    {!editando ? (
                                                        <>
                                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                                                    <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: "rgba(201,169,110,.14)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 600, color: AURA.gold }}>{idx + 1}</div>
                                                                    <div style={{ minWidth: 0 }}>
                                                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, color: t.text, margin: 0 }}>{dataFmt ? new Date(dataFmt + "T00:00:00").toLocaleDateString("pt-BR") : "Data não informada"}</p>
                                                                        {enc.horaEncontro && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 300, color: t.textMuted, margin: 0 }}>{enc.horaEncontro}</p>}
                                                                    </div>
                                                                </div>
                                                                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                                                    <button onClick={() => iniciarEdicaoEncontro(enc)} title="Editar" style={{ background: "rgba(112,144,232,.12)", border: "1px solid rgba(112,144,232,.3)", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#7090e8" }}><Pencil size={13} /></button>
                                                                    <button onClick={() => excluirEncontro(enc.id)} title="Excluir" style={{ background: "rgba(200,16,46,.1)", border: "1px solid rgba(200,16,46,.3)", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e8556d" }}><Trash2 size={13} /></button>
                                                                </div>
                                                            </div>
                                                            {enc.observacoes && <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 12, fontWeight: 300, color: t.textSec, margin: "8px 0 0" }}>{enc.observacoes}</p>}

                                                            {listaVisitantesEnc.length > 0 && (
                                                                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.border}` }}>
                                                                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 8px" }}>
                                                                        Presentes ({listaVisitantesEnc.length})
                                                                    </p>
                                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                                                        {listaVisitantesEnc.map((item, vidx) => {
                                                                            const vid = typeof item === "object" ? (item.id ?? item.visitanteId) : item;
                                                                            const objeto = typeof item === "object" ? item : buscarVisitantePorId(vid);
                                                                            const nome = objeto?.nome ?? objeto?.nomeCompleto ?? `#${vid}`;
                                                                            const decisaoObj = listaDecisoesEnc.find(d => (d.visitanteId ?? d.id) === vid);
                                                                            const decisao = decisaoObj?.tipoDecisao ?? decisaoObj?.decisaoEspiritual ?? objeto?.decisaoEspiritual ?? null;
                                                                            return (
                                                                                <div key={vid ?? vidx} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                                                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(201,169,110,.08)", border: "1px solid rgba(201,169,110,.22)", borderRadius: 99, padding: "4px 10px", fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 400, color: t.text }}>
                                                                                    <span style={{ color: AURA.gold }}>✦</span>{nome}
                                                                                </span>
                                                                                    {decisao && decisao !== "NENHUMA" && (
                                                                                        <div style={{ paddingLeft: 4 }}>
                                                                                            <BadgeDecisao decisao={decisao} />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                                                <input className="m70-input" type="date" value={fEditEnc.data} onChange={e => setFEditEnc(f => ({ ...f, data: e.target.value }))} style={{ colorScheme: isDark ? "dark" : "light", fontSize: 12, padding: "8px 10px" }} />
                                                                <input className="m70-input" type="time" value={fEditEnc.horaEncontro} onChange={e => setFEditEnc(f => ({ ...f, horaEncontro: e.target.value }))} style={{ colorScheme: isDark ? "dark" : "light", fontSize: 12, padding: "8px 10px" }} />
                                                            </div>
                                                            <textarea className="m70-input" style={{ minHeight: 46, resize: "vertical", fontSize: 12, padding: "8px 10px" }} placeholder="Observações..." value={fEditEnc.observacoes} onChange={e => setFEditEnc(f => ({ ...f, observacoes: e.target.value }))} />

                                                            {/* Presença editável: mostra TODOS os visitantes da célula, marcados ou não */}
                                                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: t.textMuted, margin: 0 }}>
                                                                    Presença ({fEditEnc.visitantesPresentesIds.size} de {visitantesHook.visitantes.length})
                                                                </p>
                                                                <div style={{ position: "relative" }}>
                                                                    <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: AURA.gold, opacity: .5, pointerEvents: "none" }} />
                                                                    <input className="m70-input" placeholder="Buscar visitante..." value={editBuscaVisitante} onChange={e => setEditBuscaVisitante(e.target.value)} style={{ paddingLeft: 28, padding: "7px 10px 7px 28px", fontSize: 12 }} />
                                                                </div>

                                                                {visitantesHook.loading && (
                                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", color: t.textSec, fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 300 }}>
                                                                        <Loader2 size={14} className="m70-spin" style={{ color: AURA.gold }} /> Carregando visitantes...
                                                                    </div>
                                                                )}

                                                                {!visitantesHook.loading && (
                                                                    <div style={{ maxHeight: 170, overflowY: "auto", border: `1px solid ${t.border}`, borderRadius: 10 }}>
                                                                        {visitantesHook.visitantes
                                                                            .filter(v => (v.nome ?? v.nomeCompleto ?? "").toLowerCase().includes(editBuscaVisitante.toLowerCase()))
                                                                            .map((v, vi, arr) => {
                                                                                const sel = fEditEnc.visitantesPresentesIds.has(v.id);
                                                                                const nome = v.nome ?? v.nomeCompleto ?? `#${v.id}`;
                                                                                return (
                                                                                    <div key={v.id}
                                                                                         style={{
                                                                                             display: "flex", alignItems: "center", gap: 8,
                                                                                             padding: "8px 10px", flexWrap: "wrap",
                                                                                             background: sel ? "rgba(112,144,232,.08)" : "transparent",
                                                                                             borderBottom: vi < arr.length - 1 ? `1px solid ${t.border}` : "none",
                                                                                         }}>
                                                                                        <div onClick={() => toggleEditPresente(v.id)} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0, cursor: "pointer" }}>
                                                                                            <input type="checkbox" checked={sel} onChange={() => toggleEditPresente(v.id)} onClick={e => e.stopPropagation()} style={{ width: 14, height: 14, cursor: "pointer", flexShrink: 0 }} />
                                                                                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: sel ? 500 : 300, color: t.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nome}</span>
                                                                                        </div>
                                                                                        {sel && (
                                                                                            <div onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
                                                                                                <DecisaoSelect
                                                                                                    value={fEditEnc.decisoes[v.id] || ""}
                                                                                                    isDark={isDark}
                                                                                                    onChange={e => setFEditEnc(f => ({ ...f, decisoes: { ...f.decisoes, [v.id]: e.target.value } }))}
                                                                                                />
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        {visitantesHook.visitantes.filter(v => (v.nome ?? v.nomeCompleto ?? "").toLowerCase().includes(editBuscaVisitante.toLowerCase())).length === 0 && (
                                                                            <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 12, fontWeight: 300, color: t.textMuted, padding: "12px 10px", margin: 0 }}>
                                                                                {editBuscaVisitante ? `Nenhum resultado para "${editBuscaVisitante}".` : "Nenhum visitante cadastrado nesta célula."}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div style={{ display: "flex", gap: 8 }}>
                                                                <button onClick={() => setEditandoEncontroId(null)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: t.textSec, fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                                                                <BotaoCarregavel
                                                                    loading={submitting}
                                                                    onClick={salvarEdicaoEncontro}
                                                                    style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "none", background: "#7090e8", color: "#fff", fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                                                                >
                                                                    Salvar
                                                                </BotaoCarregavel>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Footer */}
                                <div style={{ padding: "10px 20px 16px", borderTop: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                                    {encontroTab === "novo" ? (
                                        <div className="m70-modal-actions">
                                            <button className="m70-btn-ghost" onClick={() => setModalEncontro(false)}>Fechar</button>
                                            <BotaoCarregavel
                                                className="m70-btn-blue"
                                                style={{ flex: 2 }}
                                                loading={submitting}
                                                disabled={dataAtualJaRegistrada}
                                                onClick={registrarEncontro}
                                            >
                                                Registrar Culto
                                            </BotaoCarregavel>
                                        </div>
                                    ) : (
                                        <button className="m70-btn-ghost" style={{ width: "100%" }} onClick={() => setModalEncontro(false)}>Fechar</button>
                                    )}
                                    <button
                                        onClick={() => { setModalEncontro(false); abrirModalCancelar(targetId, targetNome); }}
                                        style={{
                                            width: "100%", padding: "8px 0", borderRadius: 10, cursor: "pointer",
                                            border: "1px solid rgba(200,16,46,.3)", background: "rgba(200,16,46,.06)",
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                            fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: ".1em",
                                            textTransform: "uppercase", color: "#e8556d",
                                        }}>
                                        <Ban size={12} /> Cancelar Missão
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    );
                })()}

                {/* ── CANCELAR MISSÃO — modal quadrado, centralizado ── */}
                {modalCancelar && (
                    <AuraSquareModal
                        open={modalCancelar}
                        onClose={() => setModalCancelar(false)}
                        title="Cancelar Missão"
                        t={t}
                        maxWidth={400}
                        footer={
                            <div className="m70-modal-actions">
                                <button className="m70-btn-ghost" onClick={() => setModalCancelar(false)}>Voltar</button>
                                <BotaoCarregavel className="m70-btn-danger" style={{ flex: 2 }} loading={submitting} onClick={cancelarMissao}>
                                    Sim, Cancelar
                                </BotaoCarregavel>
                            </div>
                        }
                    >
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, color: t.text, lineHeight: 1.6, margin: 0 }}>
                            Tem certeza que deseja cancelar <strong style={{ fontWeight: 500 }}>"{targetNome}"</strong>?
                        </p>
                        <div>
                            <p className="m70-label">Motivo do cancelamento *</p>
                            <select className="m70-input" value={fCancelar.motivo} onChange={e => setFCancelar(f => ({ ...f, motivo: e.target.value }))} style={{ padding: "10px 12px", fontSize: 13 }}>
                                <option value="">Selecione um motivo...</option>
                                {MOTIVOS_CANCELAMENTO.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        {fCancelar.motivo === "OUTRO" && (
                            <div>
                                <p className="m70-label">Observação *</p>
                                <textarea className="m70-input" style={{ minHeight: 70, resize: "vertical", fontSize: 13 }} placeholder="Descreva o motivo do cancelamento..." value={fCancelar.observacao} onChange={e => setFCancelar(f => ({ ...f, observacao: e.target.value }))} />
                            </div>
                        )}
                    </AuraSquareModal>
                )}

                {/* ── DETALHES DA MISSÃO — modal quadrado, centralizado ── */}
                {modalDetalhes && missaoDetalhe && (() => {
                    const m = missaoDetalhe;
                    const visitantes = m.visitantes || [];
                    const cancelada  = (m.status || "").toLowerCase().includes("cancel");
                    const realizados = Math.max(0, Math.min(m.encontrosRealizados ?? 0, TOTAL_SEMANAS));
                    const restantes  = Math.max(0, TOTAL_SEMANAS - realizados);
                    const concluida  = restantes === 0 && !cancelada;
                    return (
                        <AuraSquareModal
                            open={modalDetalhes}
                            onClose={() => setModalDetalhes(false)}
                            title={m.nome || "Missão " + m.id}
                            subtitle={m.endereco || "Endereço não informado"}
                            t={t}
                            maxWidth={440}
                            accentColor={cancelada ? null : corEstagio(realizados)}
                            footer={
                                <div className="m70-modal-actions">
                                    <button className="m70-btn-ghost" onClick={() => setModalDetalhes(false)}>Fechar</button>
                                    {!cancelada && !concluida && (
                                        <button className="m70-btn-blue" style={{ flex: 2 }} onClick={() => { setModalDetalhes(false); abrirModalEncontro(m); }}>
                                            ✦ Registrar Semana
                                        </button>
                                    )}
                                </div>
                            }
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                <BadgeStatus status={concluida ? "concluida" : m.status} />
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 300, color: t.textSec }}>Semana {realizados} de {TOTAL_SEMANAS} · {visitantes.length} visitante{visitantes.length !== 1 ? "s" : ""}</span>
                            </div>

                            <div style={{ display: "flex", gap: 5 }}>
                                {Array.from({ length: TOTAL_SEMANAS }, (_, idx) => (
                                    <div key={idx} className="m70-progress-track">
                                        <div style={{ height: "100%", borderRadius: 99, background: idx < realizados ? CORES_SEMANA[idx] : "transparent", width: "100%" }} />
                                    </div>
                                ))}
                            </div>

                            {concluida && (
                                <div style={{ padding: "12px 14px", borderRadius: 12, background: isDark ? "rgba(122,158,126,.1)" : "rgba(122,158,126,.07)", border: "1px solid rgba(122,158,126,.35)", display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ fontSize: 22, flexShrink: 0 }}>🎉</div>
                                    <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 12, fontWeight: 300, color: t.textSec, margin: 0 }}>Todas as {TOTAL_SEMANAS} semanas foram realizadas com sucesso.</p>
                                </div>
                            )}

                            {m.nomeAnfitriao && (
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: "rgba(253,184,19,.12)", border: "1px solid rgba(253,184,19,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 12, color: AURA.yellow }}>
                                        {m.nomeAnfitriao.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: t.textMuted, margin: 0 }}>Anfitrião</p>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, color: t.text, margin: 0 }}>{m.nomeAnfitriao}</p>
                                        {m.telefoneContato && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 300, color: t.textMuted, margin: 0 }}>{m.telefoneContato}</p>}
                                    </div>
                                </div>
                            )}
                            <PessoaBloco label="Líder"    nome={m.liderNome}    cor="#7090e8"   t={t} />
                            <PessoaBloco label="Auxiliar" nome={m.auxiliarNome} cor={AURA.sage} t={t} />

                            <div>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 8px" }}>Visitantes ({visitantes.length})</p>
                                {visitantes.length ? (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {visitantes.map((v) => {
                                            const decisao = historicoDecisoes[v.id] !== undefined
                                                ? historicoDecisoes[v.id]
                                                : (v.decisaoEspiritual ?? null);
                                            const salvando = decisaoSalvandoId === v.id;
                                            return (
                                                <div key={v.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                    <div style={{ background: "rgba(201,169,110,.08)", border: "1px solid rgba(201,169,110,.22)", borderRadius: 99, padding: "5px 12px", fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 300, color: t.text, display: "flex", alignItems: "center", gap: 6 }}>
                                                        <span style={{ color: AURA.gold }}>✦</span><span>{v.nome ?? `#${v.id}`}</span>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        <DecisaoSelect
                                                            value={decisao && decisao !== "NENHUMA" ? decisao : ""}
                                                            isDark={isDark}
                                                            disabled={salvando}
                                                            onChange={e => alterarDecisaoVisitante(m.id, v.id, e.target.value)}
                                                        />
                                                        {salvando && <Loader2 size={12} className="m70-spin" style={{ color: AURA.gold }} />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 12, fontWeight: 300, color: t.textSec, margin: 0 }}>Nenhum visitante cadastrado ainda.</p>}
                            </div>
                        </AuraSquareModal>
                    );
                })()}

                {/* ── PICKER DE VISITANTES (popup quadrado pequeno) ── */}
                {modalPickVisitantes && (() => {
                    const missaoAtual = missoes.find(m => m.id === targetId);
                    const idsAtuais = new Set((missaoAtual?.visitantes || []).map(v => v.id));
                    const todos = visitantesHook.visitantes || [];
                    const filtrados = todos.filter(p => (p.nome ?? p.nomeCompleto ?? "").toLowerCase().includes(pickBusca.toLowerCase()));
                    const idsFiltrados = filtrados.map(v => v.id);
                    const todosSelecionados = idsFiltrados.length > 0 && idsFiltrados.every(id => pickIds.has(id));
                    return (
                        <div style={{ position: "fixed", inset: 0, zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center", padding: 12, boxSizing: "border-box" }}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        onClick={() => setModalPickVisitantes(false)}
                                        style={{ position: "fixed", inset: 0, background: "rgba(10,10,15,.82)", backdropFilter: "blur(3px)" }} />
                            <motion.div initial={{ scale: .96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .96, opacity: 0 }}
                                        transition={{ type: "tween", duration: .18 }}
                                        style={{
                                            position: "relative", zIndex: 10,
                                            width: "100%", maxWidth: 380, maxHeight: "80vh",
                                            background: t.bgEl, border: `1px solid ${t.border}`,
                                            borderRadius: 18, overflow: "hidden",
                                            display: "flex", flexDirection: "column",
                                            boxShadow: "0 20px 60px rgba(0,0,0,.5)",
                                        }}>
                                {/* Header */}
                                <div style={{ padding: "16px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 10 }}>
                                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 500, color: t.text, margin: 0 }}>
                                        Visitantes da célula
                                    </h3>
                                    <button onClick={() => setModalPickVisitantes(false)} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 4, display: "flex", flexShrink: 0 }}>
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Busca */}
                                <div style={{ padding: "10px 18px 0", flexShrink: 0 }}>
                                    <div style={{ position: "relative" }}>
                                        <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: AURA.teal, opacity: .6, pointerEvents: "none" }} />
                                        <input className="m70-input" placeholder="Buscar visitante..." value={pickBusca} onChange={e => setPickBusca(e.target.value)}
                                               style={{ paddingLeft: 32, padding: "8px 10px 8px 32px", fontSize: 12 }} />
                                    </div>
                                </div>

                                {/* Quick actions */}
                                <div style={{ padding: "10px 18px", display: "flex", gap: 8, flexShrink: 0 }}>
                                    <button onClick={() => pickSelectAll(idsFiltrados)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${t.border}`, background: todosSelecionados ? `${AURA.teal}18` : "transparent", color: AURA.teal, fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "background .15s" }}>
                                        Todos{pickBusca ? " (filtrados)" : ""}
                                    </button>
                                    <button onClick={() => pickClearAll(idsFiltrados)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: AURA.red, fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "background .15s" }}>
                                        Nenhum
                                    </button>
                                </div>

                                {/* Lista */}
                                <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 14px", WebkitOverflowScrolling: "touch" }}>
                                    {visitantesHook.loading && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0", color: t.textSec, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300 }}>
                                            <Loader2 size={16} className="m70-spin" style={{ color: AURA.teal }} /> Carregando...
                                        </div>
                                    )}
                                    {!visitantesHook.loading && visitantesHook.erro && (
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 13, color: AURA.red, textAlign: "center", padding: "24px 0" }}>{visitantesHook.erro}</p>
                                    )}
                                    {!visitantesHook.loading && !visitantesHook.erro && filtrados.length === 0 && (
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: t.textMuted, textAlign: "center", padding: "24px 0", margin: 0 }}>
                                            {pickBusca ? `Nenhum resultado para "${pickBusca}".` : "Nenhum visitante cadastrado nesta célula."}
                                        </p>
                                    )}
                                    {!visitantesHook.loading && filtrados.map(v => {
                                        const sel = pickIds.has(v.id);
                                        const nome = v.nome ?? v.nomeCompleto ?? `#${v.id}`;
                                        const jaNaMissao = idsAtuais.has(v.id);
                                        return (
                                            <button key={v.id} onClick={() => togglePick(v.id)}
                                                    style={{
                                                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                                                        padding: "10px 12px", borderRadius: 10, marginBottom: 4,
                                                        border: `1px solid ${sel ? AURA.teal : t.border}`,
                                                        background: sel ? `${AURA.teal}12` : "transparent",
                                                        cursor: "pointer", transition: "background .12s, border-color .12s",
                                                        textAlign: "left",
                                                    }}>
                                                {/* Checkbox */}
                                                <div style={{
                                                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                                    border: `1.5px solid ${sel ? AURA.teal : t.borderInput}`,
                                                    background: sel ? AURA.teal : "transparent",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    transition: "background .12s, border-color .12s",
                                                }}>
                                                    {sel && (
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                                {/* Avatar */}
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                                    background: sel ? `${AURA.teal}18` : isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontFamily: "'Playfair Display',serif", fontSize: 10, fontWeight: 600,
                                                    color: sel ? AURA.teal : t.textMuted,
                                                }}>
                                                    {nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                                                </div>
                                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: sel ? 500 : 300, color: t.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {nome}
                                                </span>
                                                {!jaNaMissao && (
                                                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".06em", color: AURA.sage, border: `1px solid ${AURA.sage}55`, background: `${AURA.sage}14`, borderRadius: 99, padding: "1px 6px", flexShrink: 0 }}>NOVO</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Footer */}
                                <div style={{ padding: "12px 18px", borderTop: `1px solid ${t.border}`, display: "flex", gap: 10, flexShrink: 0 }}>
                                    <button onClick={() => setModalPickVisitantes(false)}
                                            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, color: t.textSec, cursor: "pointer" }}>
                                        Cancelar
                                    </button>
                                    <button onClick={confirmarPickVisitantes}
                                            style={{ flex: 2, padding: "10px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${AURA.teal},${AURA.blue})`, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                                        Confirmar ({pickIds.size})
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
}
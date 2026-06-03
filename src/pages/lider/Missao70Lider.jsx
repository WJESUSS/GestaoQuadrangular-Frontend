import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Plus, X, Loader2, CheckCircle2, ChevronDown, Search, Calendar } from "lucide-react";

const IEQ = {
    red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
    yellow: "#FDB813", yellowDark: "#C48C00",
    blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
    offWhite: "#F5F0E8",
};

const TOTAL_SEMANAS = 4;

const DECISAO_CONFIG = {
    ACEITOU_JESUS: {
        label: "Aceitou Jesus",
        cor: "#185FA5", bg: "#E6F1FB", borda: "#B5D4F4",
        icone: "✝️",
    },
    RECONCILIOU: {
        label: "Reconciliou",
        cor: "#854F0B", bg: "#FAEEDA", borda: "#FAC775",
        icone: "🤝",
    },
    BATISMO_AGUAS: {
        label: "Deseja Batismo",
        cor: "#0F6E56", bg: "#E1F5EE", borda: "#9FE1CB",
        icone: "💧",
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

/* ── Badge Decisão ── */
function BadgeDecisao({ decisao }) {
    const cfg = decisao && decisao !== "NENHUMA" ? DECISAO_CONFIG[decisao] : null;
    if (!cfg) return null;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 9px", borderRadius: 99,
            fontSize: 11, fontWeight: 600,
            fontFamily: "'EB Garamond', serif",
            background: cfg.bg, color: cfg.cor,
            border: `1px solid ${cfg.borda}`,
            whiteSpace: "nowrap", flexShrink: 0,
        }}>
            {cfg.icone} {cfg.label}
        </span>
    );
}

/* ── Badge Status ── */
function BadgeStatus({ status }) {
    const s = (status || "").toLowerCase();
    if (s.includes("ativ"))   return <span style={badge("#7A9E7E")}>✦ ATIVA</span>;
    if (s.includes("cancel")) return <span style={badge(IEQ.redLight)}>✦ CANCELADA</span>;
    if (s.includes("conclu")) return <span style={badge(IEQ.yellow)}>✦ CONCLUÍDA</span>;
    return <span style={badge(IEQ.yellow)}>✦ PENDENTE</span>;
    function badge(color) {
        return {
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 12px", borderRadius: 99,
            fontFamily: "'Cinzel',serif", fontSize: "8.5px",
            fontWeight: 700, letterSpacing: ".15em",
            color, border: `1px solid ${color}55`, background: `${color}18`,
        };
    }
}

/* ── Modal base ── */
function IEQModal({ open, onClose, title, children, isDark, textPrimary, textSecondary }) {
    if (!open) return null;
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: "fixed", inset: 0, background: "rgba(10,6,8,.85)", backdropFilter: "blur(16px)", zIndex: 0 }} />
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                        style={{
                            position: "relative", zIndex: 10, width: "100%", maxWidth: 480,
                            background: isDark ? "rgba(17,10,13,.98)" : "rgba(255,255,255,.97)",
                            border: "1px solid rgba(200,16,46,.2)", borderRadius: "16px 16px 0 0",
                            overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column",
                        }}>
                <div style={{ padding: "24px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexShrink: 0 }}>
                    <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 700, letterSpacing: ".15em", color: textPrimary, margin: 0 }}>{title}</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: textSecondary, padding: 4 }}><X size={18} /></button>
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

/* ── Pessoa Selector ── */
function PessoaSelector({ items, loading, erro, onSelect, selectedId, placeholder, textPrimary, textSecondary, isDark, labelKey = "nome" }) {
    const [busca, setBusca] = useState("");
    const filtrados = items.filter(p => (p[labelKey] ?? p.nomeCompleto ?? "").toLowerCase().includes(busca.toLowerCase()));
    const inputStyle = {
        width: "100%", background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)",
        border: `1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"}`,
        color: textPrimary, padding: "10px 14px 10px 36px", borderRadius: 8, outline: "none",
        fontFamily: "'EB Garamond',serif", fontSize: 14, boxSizing: "border-box",
    };
    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0", color: textSecondary, fontFamily: "'EB Garamond',serif", fontSize: 13 }}>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: IEQ.red }} /> Carregando...
        </div>
    );
    if (erro) return <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: IEQ.redLight, padding: "12px 0" }}>{erro}</p>;
    return (
        <div>
            <div style={{ position: "relative", marginBottom: 10 }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: textSecondary, pointerEvents: "none" }} />
                <input className="m70-input" style={inputStyle} placeholder={placeholder} value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
            <div style={{ maxHeight: 180, overflowY: "auto", border: `1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.1)"}`, borderRadius: 8 }}>
                {filtrados.length === 0
                    ? <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: textSecondary, padding: "14px 16px", margin: 0 }}>
                        {busca ? `Nenhum resultado para "${busca}".` : "Nenhum visitante encontrado nesta célula."}
                    </p>
                    : filtrados.map((p, i) => {
                        const nome = p[labelKey] ?? p.nomeCompleto ?? `#${p.id}`;
                        const sel  = selectedId === p.id;
                        return (
                            <div key={p.id} onClick={() => onSelect(p)}
                                 style={{
                                     display: "flex", alignItems: "center", justifyContent: "space-between",
                                     padding: "11px 14px", cursor: "pointer",
                                     background: sel ? (isDark ? "rgba(200,16,46,.18)" : "rgba(200,16,46,.08)") : "transparent",
                                     borderBottom: i < filtrados.length - 1 ? `1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.06)"}` : "none",
                                     transition: "background .15s",
                                 }}
                                 onMouseEnter={e => { if (!sel) e.currentTarget.style.background = isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)"; }}
                                 onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, color: sel ? IEQ.red : textSecondary }}>
                                        {nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: textPrimary, margin: 0, fontWeight: sel ? 600 : 400 }}>{nome}</p>
                                        {p.telefone && <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 11, color: textSecondary, margin: "1px 0 0" }}>{p.telefone}</p>}
                                    </div>
                                </div>
                                {sel && <CheckCircle2 size={16} color={IEQ.red} />}
                            </div>
                        );
                    })}
            </div>
            {selectedId && (() => {
                const p    = items.find(x => x.id === selectedId);
                const nome = p ? (p[labelKey] ?? p.nomeCompleto ?? `#${p.id}`) : "";
                return <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: "#7A9E7E", margin: "8px 0 0" }}>✓ Selecionado: <strong>{nome}</strong></p>;
            })()}
        </div>
    );
}

function PessoaBloco({ label, nome, cor, textPrimary, textSecondary }) {
    if (!nome) return null;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: `${cor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700, color: cor }}>
                {nome.charAt(0).toUpperCase()}
            </div>
            <div>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: ".15em", color: textSecondary, margin: 0 }}>{label}</p>
                <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: textPrimary, margin: 0 }}>{nome}</p>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function Missao70Lider({ celulaId, isDark = true }) {
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
    const [visitanteSelecionado, setVisitanteSelecionado] = useState(null);
    const [fEnc, setFEnc] = useState({
        data: new Date().toISOString().split("T")[0],
        numeroSemana: 1,
        observacoes: "",
        /* lista apenas para exibir as decisões — sem edição */
        visitantesInfo: [],
    });
    const [submitting, setSubmitting] = useState(false);

    const membrosHook    = useMembros(celulaId);
    const visitantesHook = useVisitantes(celulaId);
    const { historico: historicoDecisoes, buscarEmLote } = useHistoricoDecisoes();

    const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
    const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
    const cardBg        = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
    const cardBorder    = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";
    const ieqCard       = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, backdropFilter: "blur(24px)" };
    const inputStyle    = { width: "100%", background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)", border: `1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"}`, color: textPrimary, padding: "12px 14px", borderRadius: 8, outline: "none", fontFamily: "'EB Garamond',serif", fontSize: 15, boxSizing: "border-box" };
    const labelStyle    = { fontFamily: "'Cinzel',serif", fontSize: "8.5px", letterSpacing: ".18em", color: textSecondary, margin: "0 0 6px", display: "block" };

    const globalCss = `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes m70fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)} }
        .m70-card-anim{animation:m70fadeUp .45s ease both}
        .m70-card{transition:border-color .25s,box-shadow .25s}
        .m70-card:hover{border-color:rgba(253,184,19,.4)!important;box-shadow:0 8px 28px rgba(253,184,19,.08)}
        .m70-btn-ghost{background:${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};color:${isDark ? IEQ.offWhite : "#8B0B1F"};border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};border-radius:8px;font-family:'Cinzel',serif;font-size:9.5px;font-weight:700;letter-spacing:.14em;cursor:pointer;transition:all .25s;padding:9px 14px}
        .m70-btn-ghost:hover{border-color:${IEQ.red};background:rgba(200,16,46,.1)}
        .m70-btn-primary{background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red});color:#fff;border:none;border-radius:8px;font-family:'Cinzel',serif;font-size:10px;font-weight:700;letter-spacing:.15em;cursor:pointer;padding:11px 20px;transition:all .25s;display:inline-flex;align-items:center;gap:8px}
        .m70-btn-primary:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.1)}
        .m70-btn-primary:disabled{opacity:.5;cursor:not-allowed}
        .m70-btn-blue{background:linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue});color:#fff;border:none;border-radius:8px;font-family:'Cinzel',serif;font-size:10px;font-weight:700;letter-spacing:.15em;cursor:pointer;padding:11px 20px;transition:all .25s;display:inline-flex;align-items:center;gap:8px}
        .m70-btn-blue:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.1)}
        .m70-btn-blue:disabled{opacity:.5;cursor:not-allowed}
        .m70-btn-sage{background:rgba(122,158,126,.12);color:#7A9E7E;border:1px solid rgba(122,158,126,.3);border-radius:8px;font-family:'Cinzel',serif;font-size:9px;font-weight:700;letter-spacing:.14em;cursor:pointer;padding:9px 14px;transition:all .2s}
        .m70-btn-sage:hover{background:rgba(122,158,126,.2)}
        .m70-btn-danger{background:rgba(200,16,46,.1);color:${IEQ.redLight};border:1px solid rgba(200,16,46,.3);border-radius:8px;font-family:'Cinzel',serif;font-size:9px;font-weight:700;letter-spacing:.14em;cursor:pointer;padding:9px 14px;transition:all .2s}
        .m70-btn-danger:hover{background:rgba(200,16,46,.2)}
        .m70-btn-clear{background:transparent;color:${textSecondary};border:1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"};border-radius:8px;font-family:'Cinzel',serif;font-size:8.5px;font-weight:700;letter-spacing:.12em;cursor:pointer;padding:8px 12px;transition:all .2s;white-space:nowrap}
        .m70-btn-clear:hover{border-color:${IEQ.red};color:${IEQ.redLight}}
        .m70-input:focus{border-color:${IEQ.red}!important;box-shadow:0 0 0 3px rgba(200,16,46,.12)}
        .m70-input::placeholder{color:${isDark ? "rgba(245,240,232,.22)" : "rgba(26,10,13,.3)"}}
        .m70-input option{background:${isDark ? "#110A0D" : "#fff"}}
        input[type="date"].m70-input::-webkit-calendar-picker-indicator{filter:${isDark ? "invert(1) opacity(0.4)" : "opacity(0.5)"};cursor:pointer}
        @media(min-width:500px){.m70-stats{grid-template-columns:repeat(4,1fr)!important}}
        @media(min-width:600px){.m70-filters-grid{grid-template-columns:1fr 1fr!important}}
        .m70-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;padding:12px 20px;border-radius:12px;font-family:'Cinzel',serif;font-size:10px;font-weight:700;letter-spacing:.14em;display:flex;align-items:center;gap:8px;white-space:nowrap;animation:toastIn .3s ease forwards;box-shadow:0 8px 32px rgba(0,0,0,.3)}
        .m70-toast.success{background:rgba(122,158,126,.95);color:#fff;border:1px solid rgba(122,158,126,.5)}
        .m70-toast.error{background:rgba(200,16,46,.9);color:#fff;border:1px solid rgba(200,16,46,.5)}
    `;

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
        setVisitanteSelecionado(null);
        visitantesHook.buscar();
        setModalVisitante(true);
    };

    /* ── Abre modal de encontro — só leitura de decisão ── */
    const abrirModalEncontro = (missao) => {
        setTargetId(missao.id);

        /* monta lista informativa dos visitantes com a decisão atual do banco */
        const visitantesInfo = (missao.visitantes ?? []).map(v => {
            const decisao =
                historicoDecisoes[v.id] !== undefined
                    ? historicoDecisoes[v.id]
                    : (v.decisaoEspiritual ?? null);
            return {
                visitanteId:   v.id,
                visitanteNome: v.nome ?? `#${v.id}`,
                decisao,
            };
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

    const adicionarVisitante = async () => {
        if (!visitanteSelecionado) return alert("Selecione um visitante.");
        setSubmitting(true);
        try {
            await api.post(`/api/missao70/${targetId}/visitantes/${visitanteSelecionado.id}`);
            setModalVisitante(false); setVisitanteSelecionado(null); carregar();
        } catch (err) { alert(err.response?.data?.message || "Erro ao adicionar visitante."); }
        finally { setSubmitting(false); }
    };

    /* ── Registra semana — sem decisões, só data/semana/observações ── */
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
                    showToast("✦ Semana registrada e metas atualizadas!", "success");
                } catch {
                    showToast("Semana salva, mas falha ao atualizar metas.", "error");
                }
            } else {
                showToast("✦ Semana registrada com sucesso!", "success");
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
            <style>{globalCss}</style>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: IEQ.red }} />
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".2em", color: textSecondary, marginTop: 14 }}>CARREGANDO MISSÃO 70...</p>
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <style>{globalCss}</style>

            {toast && <div className={`m70-toast ${toast.tipo}`}>{toast.tipo === "success" ? "✦" : "✕"} {toast.msg}</div>}

            {/* ── Cabeçalho ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(253,184,19,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Flame size={20} color={IEQ.yellow} />
                    </div>
                    <div>
                        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, letterSpacing: ".16em", color: textPrimary, margin: 0 }}>MISSÃO 70</h2>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textSecondary, margin: "2px 0 0" }}>Gerencie missões de evangelismo de 4 semanas</p>
                    </div>
                </div>
                <button className="m70-btn-primary" onClick={abrirModalCriar}><Plus size={14} /> NOVA MISSÃO</button>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }} className="m70-stats">
                {[
                    { label: "TOTAL",      value: totalMissoes,    color: textPrimary,   sub: "missões"      },
                    { label: "ATIVAS",     value: ativas,          color: "#7A9E7E",     sub: "em andamento" },
                    { label: "VISITANTES", value: totalVisitantes, color: IEQ.yellow,    sub: "alcançados"   },
                    { label: "ENCONTROS",  value: totalEncontros,  color: IEQ.blueLight, sub: "realizados"   },
                ].map((s, i) => (
                    <div key={s.label} className="m70-card-anim" style={{ ...ieqCard, padding: "18px 20px", animationDelay: `${i * 0.07}s` }}>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8.5px", letterSpacing: ".2em", color: textSecondary, margin: 0 }}>{s.label}</p>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 28, fontWeight: 700, color: s.color, margin: "4px 0 2px" }}>{s.value}</p>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: textSecondary, margin: 0 }}>{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Lista ── */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".18em", color: textPrimary, margin: 0 }}>LISTA DE MISSÕES</p>
                    <button className="m70-btn-ghost" onClick={carregar}>↺ ATUALIZAR</button>
                </div>

                <div style={{ ...ieqCard, padding: "16px 18px", marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8.5px", letterSpacing: ".18em", color: textSecondary, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                            <Search size={11} /> FILTROS DE BUSCA
                        </p>
                        {temFiltro && <button className="m70-btn-clear" onClick={limpar}>✕ LIMPAR FILTROS</button>}
                    </div>
                    <div style={{ position: "relative" }}>
                        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: textSecondary, pointerEvents: "none" }} />
                        <input className="m70-input" style={{ ...inputStyle, paddingLeft: 36, fontSize: 14 }} placeholder="Buscar por nome ou endereço..." value={busca} onChange={e => setBusca(e.target.value)} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }} className="m70-filters-grid">
                        <div>
                            <p style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 5 }}><Calendar size={9} /> DATA INÍCIO — DE</p>
                            <input type="date" className="m70-input" style={inputStyle} value={dataInicio} max={dataFim || undefined} onChange={e => setDataInicio(e.target.value)} />
                        </div>
                        <div>
                            <p style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 5 }}><Calendar size={9} /> DATA INÍCIO — ATÉ</p>
                            <input type="date" className="m70-input" style={inputStyle} value={dataFim} min={dataInicio || undefined} onChange={e => setDataFim(e.target.value)} />
                        </div>
                    </div>
                    {temFiltro && (
                        <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 12, color: textSecondary, margin: 0 }}>
                            {missoesFiltradas.length === 0 ? "Nenhuma missão encontrada com os filtros aplicados." : `${missoesFiltradas.length} missão(ões) encontrada(s).`}
                        </p>
                    )}
                </div>

                {missoes.length === 0 ? (
                    <div style={{ ...ieqCard, textAlign: "center", padding: "56px 24px" }}>
                        <Flame size={36} style={{ color: textSecondary, marginBottom: 14 }} />
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: ".18em", color: textSecondary, margin: "0 0 6px" }}>NENHUMA MISSÃO CADASTRADA</p>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 14, color: textSecondary }}>Clique em "Nova Missão" para começar.</p>
                    </div>
                ) : missoesFiltradas.length === 0 ? (
                    <div style={{ ...ieqCard, textAlign: "center", padding: "40px 24px" }}>
                        <Search size={28} style={{ color: textSecondary, marginBottom: 12 }} />
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: ".18em", color: textSecondary, margin: "0 0 6px" }}>NENHUM RESULTADO</p>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: textSecondary }}>Ajuste os filtros para encontrar uma missão.</p>
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
                                    style={{ ...ieqCard, marginBottom: 10, overflow: "hidden", animationDelay: `${i * 0.06}s`, borderColor: concluida ? "rgba(122,158,126,.4)" : isOpen ? "rgba(253,184,19,.45)" : cardBorder }}
                                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        >
                            <div onClick={() => setExpandedId(isOpen ? null : m.id)}
                                 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer", gap: 12, flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0, background: concluida ? "rgba(122,158,126,.15)" : "linear-gradient(135deg,rgba(253,184,19,.18),rgba(200,16,46,.12))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                                        {concluida ? "✅" : "🔥"}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700, letterSpacing: ".1em", color: textPrimary, margin: 0 }}>{m.nome || "Missão " + m.id}</p>
                                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: textSecondary, margin: "2px 0 0" }}>{m.endereco || "Endereço não informado"}</p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                                    <div style={{ textAlign: "center", width: 44, height: 44, borderRadius: "50%", border: `2px solid ${concluida ? "#7A9E7E" : "rgba(253,184,19,.5)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: concluida ? "#7A9E7E" : IEQ.yellow, lineHeight: 1 }}>{restantes}</span>
                                        <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 9, color: textSecondary, lineHeight: 1, marginTop: 2 }}>sem.</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 14 }}>
                                        <div style={{ textAlign: "center" }}>
                                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: textPrimary, margin: 0 }}>{visitantes.length}</p>
                                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 11, color: textSecondary, margin: 0 }}>visitas</p>
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: concluida ? "#7A9E7E" : IEQ.yellow, margin: 0 }}>{realizados}/{TOTAL_SEMANAS}</p>
                                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 11, color: textSecondary, margin: 0 }}>semanas</p>
                                        </div>
                                    </div>
                                    <BadgeStatus status={concluida ? "concluida" : m.status} />
                                    <ChevronDown size={16} color={textSecondary} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .25s" }} />
                                </div>
                            </div>

                            <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${concluida ? "rgba(122,158,126,.3)" : "rgba(253,184,19,.25)"},transparent)`, margin: "0 20px" }} />

                            {concluida && (
                                <div style={{ margin: "12px 20px 4px", padding: "16px 20px", borderRadius: 10, background: isDark ? "rgba(122,158,126,.1)" : "rgba(122,158,126,.07)", border: "1px solid rgba(122,158,126,.35)", display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ fontSize: 28, flexShrink: 0 }}>🎉</div>
                                    <div>
                                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".18em", color: "#7A9E7E", margin: "0 0 4px" }}>MISSÃO CONCLUÍDA!</p>
                                        <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: textSecondary, margin: 0 }}>Todas as {TOTAL_SEMANAS} semanas foram realizadas com sucesso.</p>
                                    </div>
                                </div>
                            )}

                            <div style={{ padding: "10px 20px 4px" }}>
                                <div style={{ display: "flex", gap: 5 }}>
                                    {Array.from({ length: TOTAL_SEMANAS }, (_, idx) => (
                                        <div key={idx} style={{ flex: 1, height: 5, borderRadius: 99, background: idx < realizados ? (concluida ? "#7A9E7E" : idx < realizados - 1 ? "#C48C00" : IEQ.yellow) : (isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"), transition: "background .3s" }} />
                                    ))}
                                </div>
                                <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 11, color: textSecondary, margin: "4px 0 0" }}>Semana {realizados} de {TOTAL_SEMANAS}</p>
                            </div>

                            <div style={{ display: "flex", gap: 8, padding: "10px 20px", flexWrap: "wrap" }}>
                                {!cancelada && !concluida && <button className="m70-btn-sage"  onClick={() => abrirModalVisitante(m.id)}>+ VISITANTE</button>}
                                {!cancelada && !concluida && <button className="m70-btn-ghost" onClick={() => abrirModalEncontro(m)}>✦ SEMANA</button>}
                                {!cancelada              && <button className="m70-btn-danger" onClick={() => abrirModalCancelar(m.id, m.nome)}>✕ CANCELAR</button>}
                            </div>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }} style={{ overflow: "hidden" }}>
                                        <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 14, borderTop: `1px solid ${isDark ? "rgba(253,184,19,.1)" : "rgba(253,184,19,.12)"}` }}>

                                            {m.nomeAnfitriao && (
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "rgba(253,184,19,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700, color: IEQ.yellow }}>
                                                        {m.nomeAnfitriao.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: ".15em", color: textSecondary, margin: 0 }}>ANFITRIÃO</p>
                                                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: textPrimary, margin: 0 }}>{m.nomeAnfitriao}</p>
                                                        {m.telefoneContato && <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: textSecondary, margin: 0 }}>{m.telefoneContato}</p>}
                                                    </div>
                                                </div>
                                            )}

                                            <PessoaBloco label="LÍDER"    nome={m.liderNome}    cor={IEQ.blueLight} textPrimary={textPrimary} textSecondary={textSecondary} />
                                            <PessoaBloco label="AUXILIAR" nome={m.auxiliarNome} cor="#7A9E7E"       textPrimary={textPrimary} textSecondary={textSecondary} />

                                            <div>
                                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8.5px", letterSpacing: ".2em", color: textSecondary, margin: "0 0 10px" }}>✦ VISITANTES ({visitantes.length})</p>
                                                {visitantes.length ? (
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                        {visitantes.map((v) => {
                                                            const decisao = historicoDecisoes[v.id] !== undefined
                                                                ? historicoDecisoes[v.id]
                                                                : (v.decisaoEspiritual ?? null);
                                                            const temDecisao = decisao && decisao !== "NENHUMA";
                                                            return (
                                                                <div key={v.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                                    <div style={{ background: isDark ? "rgba(253,184,19,.08)" : "rgba(253,184,19,.07)", border: `1px solid ${isDark ? "rgba(253,184,19,.2)" : "rgba(253,184,19,.18)"}`, borderRadius: 99, padding: "5px 14px", fontFamily: "'EB Garamond',serif", fontSize: 13, color: textPrimary, display: "flex", alignItems: "center", gap: 6 }}>
                                                                        <span>✦</span><span>{v.nome ?? `#${v.id}`}</span>
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
                                                ) : <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: textSecondary }}>Nenhum visitante cadastrado ainda.</p>}
                                            </div>

                                            <div>
                                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8.5px", letterSpacing: ".2em", color: textSecondary, margin: "0 0 10px" }}>✦ SEMANAS ({realizados}/{TOTAL_SEMANAS})</p>
                                                {realizados > 0
                                                    ? <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textSecondary, margin: 0 }}>
                                                        {realizados} semana{realizados !== 1 ? "s" : ""} registrada{realizados !== 1 ? "s" : ""}. {restantes > 0 ? `Faltam ${restantes}.` : "Missão concluída!"}
                                                    </p>
                                                    : <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: textSecondary }}>Nenhuma semana registrada.</p>
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
                    <IEQModal open={modalCriar} onClose={() => setModalCriar(false)} title="NOVA MISSÃO 70" isDark={isDark} textPrimary={textPrimary} textSecondary={textSecondary}>
                        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <p style={labelStyle}>NOME DA MISSÃO *</p>
                                    <input className="m70-input" style={inputStyle} placeholder="Missão Rua das Flores" value={fCriar.nome} onChange={e => setFCriar(f => ({ ...f, nome: e.target.value }))} />
                                </div>
                                <div>
                                    <p style={labelStyle}>NOME DO ANFITRIÃO *</p>
                                    <input className="m70-input" style={inputStyle} placeholder="João Silva" value={fCriar.nomeAnfitriao} onChange={e => setFCriar(f => ({ ...f, nomeAnfitriao: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <p style={labelStyle}>ENDEREÇO</p>
                                <input className="m70-input" style={inputStyle} placeholder="Rua, número, bairro" value={fCriar.endereco} onChange={e => setFCriar(f => ({ ...f, endereco: e.target.value }))} />
                            </div>
                            <div>
                                <p style={labelStyle}>TELEFONE DE CONTATO</p>
                                <input className="m70-input" style={inputStyle} placeholder="(71) 9 0000-0000" value={fCriar.telefoneContato} onChange={e => setFCriar(f => ({ ...f, telefoneContato: e.target.value }))} />
                            </div>
                            <div>
                                <p style={labelStyle}>LÍDER (MEMBRO DA CÉLULA)</p>
                                <PessoaSelector items={membrosHook.membros} loading={membrosHook.loading} erro={membrosHook.erro} selectedId={fCriar.liderId} onSelect={p => setFCriar(f => ({ ...f, liderId: p.id }))} placeholder="Pesquisar líder..." textPrimary={textPrimary} textSecondary={textSecondary} isDark={isDark} />
                            </div>
                            <div>
                                <p style={labelStyle}>AUXILIAR (MEMBRO DA CÉLULA)</p>
                                <PessoaSelector items={membrosHook.membros} loading={membrosHook.loading} erro={membrosHook.erro} selectedId={fCriar.auxiliarId} onSelect={p => setFCriar(f => ({ ...f, auxiliarId: p.id }))} placeholder="Pesquisar auxiliar..." textPrimary={textPrimary} textSecondary={textSecondary} isDark={isDark} />
                            </div>
                            <div style={{ background: isDark ? "rgba(253,184,19,.08)" : "rgba(253,184,19,.07)", border: "1px solid rgba(253,184,19,.25)", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                                <span style={{ fontSize: 20, flexShrink: 0 }}>✦</span>
                                <div>
                                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: ".15em", color: IEQ.yellow, margin: "0 0 4px" }}>O QUE É A MISSÃO 70?</p>
                                    <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textSecondary, margin: 0, lineHeight: 1.5 }}>
                                        São <strong style={{ color: textPrimary }}>4 encontros semanais</strong> de evangelismo realizados na casa do anfitrião. O objetivo é alcançar visitantes e registrar decisões de fé durante o ciclo.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="m70-btn-ghost" style={{ flex: 1 }} onClick={() => setModalCriar(false)}>CANCELAR</button>
                            <button className="m70-btn-primary" style={{ flex: 2, justifyContent: "center" }} onClick={criarMissao} disabled={submitting}>
                                {submitting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "CRIAR MISSÃO"}
                            </button>
                        </div>
                    </IEQModal>
                )}

                {/* ── ADICIONAR VISITANTE ── */}
                {modalVisitante && (
                    <IEQModal open={modalVisitante} onClose={() => setModalVisitante(false)} title="ADICIONAR VISITANTE" isDark={isDark} textPrimary={textPrimary} textSecondary={textSecondary}>
                        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ background: isDark ? "rgba(253,184,19,.06)" : "rgba(253,184,19,.06)", border: "1px solid rgba(253,184,19,.2)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                                <Flame size={14} color={IEQ.yellow} style={{ flexShrink: 0 }} />
                                <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 12, color: textSecondary, margin: 0 }}>Exibindo apenas visitantes cadastrados nesta célula.</p>
                            </div>
                            <PessoaSelector items={visitantesHook.visitantes} loading={visitantesHook.loading} erro={visitantesHook.erro} selectedId={visitanteSelecionado?.id} onSelect={setVisitanteSelecionado} placeholder="Pesquisar visitante da célula..." textPrimary={textPrimary} textSecondary={textSecondary} isDark={isDark} />
                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="m70-btn-ghost" style={{ flex: 1 }} onClick={() => setModalVisitante(false)}>CANCELAR</button>
                            <button className="m70-btn-blue" style={{ flex: 2, justifyContent: "center" }} onClick={adicionarVisitante} disabled={submitting || !visitanteSelecionado}>
                                {submitting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "ADICIONAR"}
                            </button>
                        </div>
                    </IEQModal>
                )}

                {/* ── REGISTRAR SEMANA — sem edição de decisão ── */}
                {modalEncontro && (
                    <IEQModal open={modalEncontro} onClose={() => setModalEncontro(false)} title="REGISTRAR SEMANA" isDark={isDark} textPrimary={textPrimary} textSecondary={textSecondary}>
                        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

                            {/* data + número semana */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <p style={labelStyle}>DATA *</p>
                                    <input className="m70-input" style={inputStyle} type="date" value={fEnc.data} onChange={e => setFEnc(f => ({ ...f, data: e.target.value }))} />
                                </div>
                                <div>
                                    <p style={labelStyle}>NÚMERO DA SEMANA</p>
                                    <select className="m70-input" style={inputStyle} value={fEnc.numeroSemana} onChange={e => setFEnc(f => ({ ...f, numeroSemana: Number(e.target.value) }))}>
                                        {Array.from({ length: TOTAL_SEMANAS }, (_, i) => <option key={i + 1} value={i + 1}>Semana {i + 1}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* observação geral */}
                            <div>
                                <p style={labelStyle}>OBSERVAÇÕES</p>
                                <textarea
                                    className="m70-input"
                                    style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontSize: 14 }}
                                    placeholder="Comentários sobre o encontro desta semana..."
                                    value={fEnc.observacoes}
                                    onChange={e => setFEnc(f => ({ ...f, observacoes: e.target.value }))}
                                />
                            </div>

                            {/* visitantes — somente exibição das decisões */}
                            {fEnc.visitantesInfo.length > 0 && (
                                <div>
                                    <p style={labelStyle}>VISITANTES PRESENTES</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {fEnc.visitantesInfo.map(v => {
                                            const temDecisao = v.decisao && v.decisao !== "NENHUMA";
                                            return (
                                                <div key={v.visitanteId} style={{
                                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                                    padding: "10px 14px", borderRadius: 8,
                                                    background: isDark ? "rgba(253,184,19,.03)" : "rgba(253,184,19,.02)",
                                                    border: `1px solid ${isDark ? "rgba(253,184,19,.12)" : "rgba(253,184,19,.1)"}`,
                                                    gap: 10, flexWrap: "wrap",
                                                }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: isDark ? "rgba(253,184,19,.12)" : "rgba(253,184,19,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700, color: IEQ.yellow }}>
                                                            {v.visitanteNome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                                                        </div>
                                                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: textPrimary, margin: 0 }}>{v.visitanteNome}</p>
                                                    </div>
                                                    {temDecisao
                                                        ? <BadgeDecisao decisao={v.decisao} />
                                                        : <span style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 12, color: textSecondary }}>sem decisão registrada</span>
                                                    }
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* aviso de edição */}
                                    <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.03)", border: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`, display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 13, flexShrink: 0 }}>ℹ️</span>
                                        <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 12, color: textSecondary, margin: 0 }}>
                                            Para alterar a decisão espiritual de um visitante, acesse o <strong style={{ color: textPrimary }}>cadastro do visitante</strong>.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="m70-btn-ghost" style={{ flex: 1 }} onClick={() => setModalEncontro(false)}>CANCELAR</button>
                            <button className="m70-btn-blue" style={{ flex: 2, justifyContent: "center" }} onClick={registrarEncontro} disabled={submitting}>
                                {submitting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "REGISTRAR"}
                            </button>
                        </div>
                    </IEQModal>
                )}

                {/* ── CANCELAR MISSÃO ── */}
                {modalCancelar && (
                    <IEQModal open={modalCancelar} onClose={() => setModalCancelar(false)} title="CANCELAR MISSÃO" isDark={isDark} textPrimary={textPrimary} textSecondary={textSecondary}>
                        <div style={{ padding: "16px 24px 20px" }}>
                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 15, color: textPrimary, lineHeight: 1.6 }}>
                                Tem certeza que deseja cancelar <strong>"{targetNome}"</strong>? Esta ação não poderá ser desfeita facilmente.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="m70-btn-ghost" style={{ flex: 1 }} onClick={() => setModalCancelar(false)}>VOLTAR</button>
                            <button className="m70-btn-danger" style={{ flex: 2, padding: "12px 20px", fontFamily: "'Cinzel',serif", fontSize: "10px", fontWeight: 700, letterSpacing: ".15em", cursor: "pointer", borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                    onClick={cancelarMissao} disabled={submitting}>
                                {submitting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "SIM, CANCELAR"}
                            </button>
                        </div>
                    </IEQModal>
                )}
            </AnimatePresence>
        </div>
    );
}
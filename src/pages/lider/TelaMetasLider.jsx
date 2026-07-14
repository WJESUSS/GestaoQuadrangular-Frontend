import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import { AURA, theme } from "./liderTheme";
import {
    Target, Plus, Trash2, Pencil, CheckCircle2,
    ChevronUp, ChevronDown, X, Loader2, Trophy,
    Clock, TrendingUp, AlertTriangle, RotateCcw, Calendar,
} from "lucide-react";

const TIPO_CONFIG = {
    BATISMO:       { emoji: "🕊️", label: "Batismo",       color: AURA.blue    },
    CONVERSAO:     { emoji: "🔥",  label: "Conversão",     color: AURA.red     },
    RECONCILIACAO: { emoji: "🕊",  label: "Reconciliação", color: AURA.yellow  },
    DISCIPULADO:   { emoji: "📖",  label: "Discipulado",   color: AURA.redDark },
};

// ── Formata "YYYY-MM-DD" → "02 de junho de 2026" (sem bug de fuso)
const fmtData = (mesAno) => {
    if (!mesAno) return "---";
    const [ano, mes, dia] = mesAno.substring(0, 10).split("-");
    return new Date(Number(ano), Number(mes) - 1, Number(dia))
        .toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
};

// ── Formata "YYYY-MM-DD" → "02/06/2026"
const fmtDataCurta = (mesAno) => {
    if (!mesAno) return "---";
    const [ano, mes, dia] = mesAno.substring(0, 10).split("-");
    return new Date(Number(ano), Number(mes) - 1, Number(dia))
        .toLocaleDateString("pt-BR");
};

// ── Dias restantes até a data da meta (sem bug de fuso)
const calcularDiasRestantes = (mesAno) => {
    if (!mesAno) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const [ano, mes, dia] = mesAno.substring(0, 10).split("-");
    const dataFim = new Date(Number(ano), Number(mes) - 1, Number(dia));
    dataFim.setHours(0, 0, 0, 0);
    return Math.ceil((dataFim - hoje) / (1000 * 60 * 60 * 24));
};

const getMensagemMotivacional = (diasRestantes, pct, metaConcluida, faltam) => {
    if (metaConcluida) return { texto: "🏆 Meta alcançada! Glória a Deus!", cor: "#22c55e" };
    if (diasRestantes === null) return null;
    if (diasRestantes < 0)   return { texto: `⚠️ Meta vencida há ${Math.abs(diasRestantes)} dia${Math.abs(diasRestantes) > 1 ? "s" : ""}. Revise seu planejamento.`, cor: AURA.red };
    if (diasRestantes === 0) return { texto: `🔔 Último dia! Ainda faltam ${faltam} pessoa${faltam > 1 ? "s" : ""}. Não desista!`, cor: AURA.red };
    if (diasRestantes <= 3)  return { texto: `🔥 Urgente! ${diasRestantes} dia${diasRestantes > 1 ? "s" : ""} restante${diasRestantes > 1 ? "s" : ""} e faltam ${faltam} pessoa${faltam > 1 ? "s" : ""}!`, cor: AURA.red };
    if (diasRestantes <= 7)  return { texto: `⏳ ${diasRestantes} dias para bater a meta. Mobilize sua célula!`, cor: AURA.yellowDark };
    if (diasRestantes <= 15) return { texto: `📅 ${diasRestantes} dias restantes. Continue firme!`, cor: AURA.blue };
    if (pct >= 80)           return { texto: `🎯 Quase lá! ${diasRestantes} dias e você já está em ${pct}%!`, cor: "#22c55e" };
    return { texto: `📅 ${diasRestantes} dias para bater sua meta. Você consegue!`, cor: AURA.blue };
};

const statusMeta = (meta) => {
    const pct = meta.progressoPercentual ?? 0;
    if (meta.metaConcluida) return { label: "CONCLUÍDA",    color: "#22c55e",  icon: <CheckCircle2 size={12} /> };
    if (pct >= 80)          return { label: "QUASE LÁ!",   color: AURA.yellow, icon: <TrendingUp   size={12} /> };
    if (pct < 50)           return { label: "EM ATRASO",   color: AURA.red,    icon: <AlertTriangle size={12} /> };
    return                         { label: "EM ANDAMENTO", color: AURA.blue,   icon: <Clock size={12} /> };
};

const CSS = `
  .metas-wrap * { box-sizing: border-box; }
  .metas-wrap { font-family: 'Fraunces', serif; }
  @keyframes metas-fadeup { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes metas-spin   { to { transform:rotate(360deg); } }
  @keyframes metas-pulse  { 0%,100%{opacity:1} 50%{opacity:.6} }
  .metas-spin { animation: metas-spin .9s linear infinite; }
  .metas-pulse { animation: metas-pulse 2s ease-in-out infinite; }

  .metas-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px; }
  @media (max-width:600px) { .metas-grid { grid-template-columns:1fr; } }

  .metas-card { border-radius:14px; overflow:hidden; transition:box-shadow .3s, transform .25s; position:relative; }
  .metas-card:hover { transform:translateY(-3px); }
  .metas-card.dark  { background:#1A2236; border:1px solid rgba(158,42,43,.15); box-shadow:0 4px 24px rgba(0,0,0,.35); }
  .metas-card.light { background:#fff;    border:1px solid rgba(158,42,43,.12); box-shadow:0 4px 24px rgba(158,42,43,.07); }
  .metas-card:hover.dark  { box-shadow:0 12px 40px rgba(158,42,43,.18); border-color:rgba(158,42,43,.3); }
  .metas-card:hover.light { box-shadow:0 12px 40px rgba(158,42,43,.14); border-color:rgba(158,42,43,.28); }

  .metas-btn { display:inline-flex; align-items:center; gap:7px; border:none; border-radius:8px; cursor:pointer; transition:all .22s; font-family:'Inter',sans-serif; font-weight:700; letter-spacing:.14em; }
  .metas-btn:hover:not(:disabled) { filter:brightness(1.12); transform:translateY(-1px); }
  .metas-btn:disabled { opacity:.55; cursor:not-allowed; }
  .metas-btn-red    { background:linear-gradient(135deg,#6E1D1E,#9E2A2B); color:#fff; font-size:10px; padding:11px 18px; }
  .metas-btn-blue   { background:linear-gradient(135deg,#12283F,#1E3F66); color:#fff; font-size:10px; padding:11px 18px; }
  .metas-btn-ghost  { font-size:9.5px; padding:10px 16px; }
  .metas-btn-ghost.dark  { background:rgba(255,255,255,.05); color:#F3F1EA; border:1px solid rgba(158,42,43,.2); }
  .metas-btn-ghost.light { background:rgba(158,42,43,.06); color:#6E1D1E;  border:1px solid rgba(158,42,43,.18); }
  .metas-btn-ghost:hover { border-color:#9E2A2B !important; background:rgba(158,42,43,.1) !important; }

  .metas-icon-btn { background:none; border:none; cursor:pointer; padding:6px; border-radius:6px; display:flex; align-items:center; justify-content:center; transition:all .2s; }
  .metas-icon-btn:hover { background:rgba(158,42,43,.12); }

  .metas-input { width:100%; padding:11px 14px; border-radius:8px; outline:none; font-family:'Inter',sans-serif; font-size:14px; transition:border-color .2s, box-shadow .2s; }
  .metas-input.dark  { background:rgba(255,255,255,.04); border:1px solid rgba(158,42,43,.2); color:#F3F1EA; }
  .metas-input.light { background:rgba(0,0,0,.03);       border:1px solid rgba(158,42,43,.18); color:#1A0A0D; }
  .metas-input:focus { border-color:#9E2A2B !important; box-shadow:0 0 0 3px rgba(158,42,43,.12); }
  .metas-input.dark::placeholder  { color:rgba(245,240,232,.25); }
  .metas-input.light::placeholder { color:rgba(26,10,13,.3); }

  .metas-label { font-family:'Inter',sans-serif; font-size:9.5px; font-weight:700; letter-spacing:.14em; display:block; margin-bottom:7px; }
  .metas-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:99px; font-family:'Inter',sans-serif; font-size:8.5px; font-weight:700; letter-spacing:.14em; border:1px solid; }
  .metas-progress-track { height:7px; border-radius:99px; overflow:hidden; }
  .metas-progress-track.dark  { background:rgba(255,255,255,.08); }
  .metas-progress-track.light { background:rgba(158,42,43,.1); }
  .metas-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(158,42,43,.2),transparent); }

  .metas-empty { border-radius:14px; padding:48px 24px; text-align:center; }
  .metas-empty.dark  { border:1.5px dashed rgba(158,42,43,.2);  background:rgba(255,255,255,.015); }
  .metas-empty.light { border:1.5px dashed rgba(158,42,43,.18); background:rgba(158,42,43,.03); }

  .metas-summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:28px; }
  @media(max-width:480px) { .metas-summary-grid { grid-template-columns:1fr 1fr; } }

  .metas-summary-card { border-radius:12px; padding:16px; text-align:center; }
  .metas-summary-card.dark  { background:rgba(255,255,255,.03); border:1px solid rgba(158,42,43,.12); }
  .metas-summary-card.light { background:rgba(158,42,43,.04);   border:1px solid rgba(158,42,43,.1); }

  .metas-hist-item { border-radius:10px; padding:14px 16px; }
  .metas-hist-item.dark  { background:rgba(34,197,94,.05); border:1px solid rgba(34,197,94,.2); }
  .metas-hist-item.light { background:rgba(34,197,94,.06); border:1px solid rgba(34,197,94,.22); }

  .metas-banner { border-radius:12px; padding:14px 18px; margin-bottom:24px; display:flex; align-items:flex-start; gap:12px; }
  .metas-banner.dark  { background:rgba(217,174,94,.07); border:1px solid rgba(217,174,94,.22); }
  .metas-banner.light { background:rgba(217,174,94,.1);  border:1px solid rgba(217,174,94,.28); }

  .metas-backdrop { position:fixed; inset:0; z-index:60; display:flex; align-items:center; justify-content:center; padding:16px; }
  .metas-modal { border-radius:16px; padding:32px 28px; width:100%; max-width:420px; max-height:90vh; overflow-y:auto; position:relative; z-index:1; }
  .metas-modal.dark  { background:linear-gradient(135deg,#1A2236,#12131C); border:1px solid rgba(158,42,43,.2); box-shadow:0 30px 60px rgba(158,42,43,.15); }
  .metas-modal.light { background:linear-gradient(135deg,#fff,#F3F1EA);    border:1px solid rgba(158,42,43,.15); box-shadow:0 30px 60px rgba(158,42,43,.12); }

  .tipo-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .tipo-opt { border-radius:8px; padding:10px 8px; text-align:center; cursor:pointer; transition:all .2s; border:2px solid transparent; }
  .tipo-opt.dark  { background:rgba(255,255,255,.03); }
  .tipo-opt.light { background:rgba(158,42,43,.04); }
  .tipo-opt.selected { border-color:var(--tc); background:color-mix(in srgb, var(--tc) 12%, transparent); }
  .tipo-opt:hover { border-color:var(--tc); }
`;

export default function TelaMetasLider({ celula, isDark }) {
    const t = isDark ? "dark" : "light";
    const textPrimary   = isDark ? AURA.offWhite : "#1A0A0D";
    const textSecondary = isDark ? "rgba(245,240,232,.42)" : "rgba(26,10,13,.42)";

    const [metas,        setMetas]        = useState([]);
    const [historico,    setHistorico]    = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [aba,          setAba]          = useState("ativas");
    const [modalAberto,  setModalAberto]  = useState(false);
    const [metaEditando, setMetaEditando] = useState(null);
    const [salvando,     setSalvando]     = useState(false);
    const [ajustando,    setAjustando]    = useState({});
    const [form,         setForm]         = useState({ tipoMeta: "BATISMO", metaTotal: 3 });

    const carregar = useCallback(async () => {
        if (!celula?.id) return;
        try {
            setLoading(true);
            const [resAtivas, resAll] = await Promise.all([
                api.get(`/metas/celula/${celula.id}/ativas`),
                api.get(`/metas/celula/${celula.id}`),
            ]);
            const ativas = Array.isArray(resAtivas.data) ? resAtivas.data : [];
            const todas  = Array.isArray(resAll.data)    ? resAll.data    : [];
            setMetas(ativas);
            setHistorico(todas.filter(m => m.metaConcluida));
        } catch (err) {
            console.error("Erro ao carregar metas:", err);
        } finally {
            setLoading(false);
        }
    }, [celula?.id]);

    useEffect(() => { carregar(); }, [carregar]);

    const dataAtual = new Date().toISOString().substring(0, 10);

    const abrirNova = () => {
        setForm({ tipoMeta: "BATISMO", metaTotal: 3, mesAno: dataAtual });
        setMetaEditando(null);
        setModalAberto("nova");
    };

    const abrirEditar = (meta) => {
        const data = meta.mesAno ? meta.mesAno.substring(0, 10) : dataAtual;
        setForm({ tipoMeta: meta.tipoMeta, metaTotal: meta.metaTotal, mesAno: data });
        setMetaEditando(meta);
        setModalAberto("editar");
    };

    const salvar = async () => {
        if (!form.metaTotal || form.metaTotal < 1) return alert("Informe uma quantidade válida.");
        if (!form.mesAno) return alert("Selecione a data da meta.");
        setSalvando(true);
        try {
            if (modalAberto === "nova") {
                await api.post("/metas", {
                    celulaId:  celula.id,
                    tipoMeta:  form.tipoMeta,
                    metaTotal: parseInt(form.metaTotal),
                    mesAno:    form.mesAno,
                    descricao: `Meta de ${form.tipoMeta.toLowerCase()} para ${celula.nome}`,
                });
            } else {
                await api.put(`/metas/${metaEditando.id}`, {
                    tipoMeta:  form.tipoMeta,
                    metaTotal: parseInt(form.metaTotal),
                    mesAno:    form.mesAno,
                });
            }
            setModalAberto(null);
            await carregar();
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao salvar meta.");
        } finally {
            setSalvando(false);
        }
    };

    const deletar = async (id) => {
        if (!window.confirm("Excluir esta meta?")) return;
        try {
            await api.delete(`/metas/${id}`);
            setMetas(prev => prev.filter(m => m.id !== id));
            setHistorico(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao excluir.");
        }
    };

    const ajustar = async (meta, direcao) => {
        setAjustando(prev => ({ ...prev, [meta.id]: true }));
        try {
            const endpoint = direcao === "+" ? "incrementar" : "decrementar";
            const res = await api.put(`/metas/${meta.id}/${endpoint}`);
            setMetas(prev => prev.map(m => m.id === meta.id ? res.data : m));
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao ajustar progresso.");
        } finally {
            setAjustando(prev => ({ ...prev, [meta.id]: false }));
        }
    };

    const sincronizar = async (id) => {
        setAjustando(prev => ({ ...prev, [id]: true }));
        try {
            const res = await api.put(`/metas/${id}/sincronizar`);
            setMetas(prev => prev.map(m => m.id === id ? res.data : m));
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao sincronizar.");
        } finally {
            setAjustando(prev => ({ ...prev, [id]: false }));
        }
    };

    const total      = metas.length;
    const concluidas = metas.filter(m => m.metaConcluida).length;
    const emAtraso   = metas.filter(m => !m.metaConcluida && (m.progressoPercentual ?? 0) < 50).length;

    const metaMaisUrgente = metas
        .filter(m => !m.metaConcluida)
        .sort((a, b) => calcularDiasRestantes(a.mesAno) - calcularDiasRestantes(b.mesAno))[0];

    const mensagemBanner = metaMaisUrgente
        ? getMensagemMotivacional(
            calcularDiasRestantes(metaMaisUrgente.mesAno),
            metaMaisUrgente.progressoPercentual ?? 0,
            metaMaisUrgente.metaConcluida,
            metaMaisUrgente.faltam
        ) : null;

    return (
        <div className="metas-wrap">
            <style>{CSS}</style>

            {/* Cabeçalho */}
            <motion.div
                initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:28 }}
            >
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:42, height:42, borderRadius:10, background:`${AURA.red}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Target size={22} style={{ color:AURA.red }} />
                    </div>
                    <div>
                        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:16, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>
                            METAS DA CÉLULA
                        </h2>
                        <p style={{ fontFamily:"'Fraunces',serif", fontSize:13, color:textSecondary, margin:0 }}>
                            {celula?.nome || "---"} — Gerencie seus objetivos
                        </p>
                    </div>
                </div>
                <button className="metas-btn metas-btn-red" onClick={abrirNova}>
                    <Plus size={14} /> NOVA META
                </button>
            </motion.div>

            {/* Banner motivacional */}
            {mensagemBanner && aba === "ativas" && !loading && (
                <motion.div
                    className={`metas-banner ${t}`}
                    initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:.15 }}
                >
                    <div style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>🎯</div>
                    <div>
                        <p style={{ fontFamily:"'Fraunces',serif", fontSize:9, letterSpacing:".16em", color:AURA.yellowDark, margin:"0 0 4px" }}>
                            FOCO DA CÉLULA — {TIPO_CONFIG[metaMaisUrgente.tipoMeta]?.label?.toUpperCase()}
                        </p>
                        <p style={{ fontFamily:"'Fraunces',serif", fontSize:15, color:mensagemBanner.cor, fontWeight:600, margin:0 }}>
                            {mensagemBanner.texto}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Resumo */}
            <motion.div className="metas-summary-grid" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.1 }}>
                {[
                    { label:"ATIVAS",     value:total,      color:AURA.blue,  icon:<Target size={16} /> },
                    { label:"CONCLUÍDAS", value:concluidas, color:"#22c55e", icon:<Trophy size={16} /> },
                    { label:"EM ATRASO",  value:emAtraso,   color:AURA.red,   icon:<AlertTriangle size={16} /> },
                ].map(({ label, value, color, icon }) => (
                    <div key={label} className={`metas-summary-card ${t}`}>
                        <div style={{ color, marginBottom:8 }}>{icon}</div>
                        <p style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color, margin:0, lineHeight:1 }}>{value}</p>
                        <p style={{ fontFamily:"'Fraunces',serif", fontSize:8, letterSpacing:".14em", color:textSecondary, margin:"6px 0 0" }}>{label}</p>
                    </div>
                ))}
            </motion.div>

            {/* Abas */}
            <div style={{ display:"flex", gap:8, marginBottom:24 }}>
                {[{ key:"ativas", label:"METAS ATIVAS" }, { key:"historico", label:"HISTÓRICO" }].map(({ key, label }) => (
                    <button key={key} onClick={() => setAba(key)}
                            className={`metas-btn ${aba === key ? "metas-btn-red" : `metas-btn-ghost ${t}`}`}
                            style={{ fontSize:9 }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Conteúdo */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div key="load" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                                style={{ textAlign:"center", padding:"48px 0" }}>
                        <Loader2 size={32} className="metas-spin" style={{ color:AURA.red }} />
                        <p style={{ fontFamily:"'Fraunces',serif", fontSize:10, letterSpacing:".2em", color:textSecondary, marginTop:14 }}>CARREGANDO...</p>
                    </motion.div>
                ) : aba === "ativas" ? (
                    <motion.div key="ativas" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }}>
                        {metas.length === 0 ? (
                            <div className={`metas-empty ${t}`}>
                                <Target size={36} style={{ color:textSecondary, opacity:.4, marginBottom:12 }} />
                                <p style={{ fontFamily:"'Fraunces',serif", fontSize:12, letterSpacing:".14em", color:textSecondary, margin:0 }}>NENHUMA META ATIVA</p>
                                <p style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:textSecondary, margin:"8px 0 20px", fontStyle:"italic" }}>Comece definindo o primeiro objetivo da sua célula.</p>
                                <button className="metas-btn metas-btn-red" onClick={abrirNova}><Plus size={13} /> CRIAR PRIMEIRA META</button>
                            </div>
                        ) : (
                            <div className="metas-grid">
                                {metas.map((meta, idx) => (
                                    <CardMeta
                                        key={meta.id} meta={meta} idx={idx}
                                        isDark={isDark} t={t}
                                        textPrimary={textPrimary} textSecondary={textSecondary}
                                        ajustando={ajustando[meta.id]}
                                        onEditar={() => abrirEditar(meta)}
                                        onDeletar={() => deletar(meta.id)}
                                        onIncrementar={() => ajustar(meta, "+")}
                                        onDecrementar={() => ajustar(meta, "-")}
                                        onSincronizar={() => sincronizar(meta.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="hist" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }}>
                        {historico.length === 0 ? (
                            <div className={`metas-empty ${t}`}>
                                <Trophy size={36} style={{ color:textSecondary, opacity:.4, marginBottom:12 }} />
                                <p style={{ fontFamily:"'Fraunces',serif", fontSize:12, letterSpacing:".14em", color:textSecondary, margin:0 }}>SEM HISTÓRICO AINDA</p>
                                <p style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:textSecondary, margin:"8px 0 0", fontStyle:"italic" }}>Metas concluídas aparecerão aqui.</p>
                            </div>
                        ) : (
                            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                                {historico.map((meta, idx) => (
                                    <motion.div key={meta.id} className={`metas-hist-item ${t}`}
                                                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                                                transition={{ delay: idx * 0.06 }}
                                                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                                            <span style={{ fontSize:22 }}>{TIPO_CONFIG[meta.tipoMeta]?.emoji}</span>
                                            <div>
                                                <p style={{ fontFamily:"'Fraunces',serif", fontSize:11, fontWeight:700, letterSpacing:".12em", color:TIPO_CONFIG[meta.tipoMeta]?.color, margin:0 }}>
                                                    {TIPO_CONFIG[meta.tipoMeta]?.label?.toUpperCase()}
                                                </p>
                                                <p style={{ fontFamily:"'Fraunces',serif", fontSize:13, color:textSecondary, margin:"2px 0 0" }}>
                                                    Limite: {fmtData(meta.mesAno)} — {meta.metaAlcancada}/{meta.metaTotal} pessoas
                                                </p>
                                                {meta.dataCriacao && (
                                                    <p style={{ fontFamily:"'Fraunces',serif", fontSize:8, letterSpacing:".09em", color:textSecondary, margin:"2px 0 0", opacity:.7 }}>
                                                        Criada em: {fmtDataCurta(meta.dataCriacao)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                            <span style={{ fontFamily:"'Fraunces',serif", fontSize:10, color:"#22c55e", letterSpacing:".1em" }}>✓ CONCLUÍDA</span>
                                            <button className="metas-icon-btn" onClick={() => deletar(meta.id)} style={{ color:textSecondary }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal criar / editar */}
            <AnimatePresence>
                {modalAberto && (
                    <div className="metas-backdrop">
                        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                                    onClick={() => setModalAberto(null)}
                                    style={{ position:"fixed", inset:0, background: isDark ? "rgba(18,19,28,.9)" : "rgba(0,0,0,.7)", backdropFilter:"blur(20px)", zIndex:0 }} />
                        <motion.div className={`metas-modal ${t}`}
                                    initial={{ opacity:0, scale:.88, y:32 }} animate={{ opacity:1, scale:1, y:0 }}
                                    exit={{ opacity:0, scale:.88, y:32 }}
                                    transition={{ type:"spring", damping:26, stiffness:320 }}>
                            <button className="metas-icon-btn" onClick={() => setModalAberto(null)}
                                    style={{ position:"absolute", top:16, right:16, color:textSecondary }}>
                                <X size={18} />
                            </button>

                            <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:14, fontWeight:700, letterSpacing:".15em", color:textPrimary, margin:"0 0 4px" }}>
                                {modalAberto === "nova" ? "NOVA META" : "EDITAR META"}
                            </h3>
                            <p style={{ fontFamily:"'Fraunces',serif", fontSize:13, color:textSecondary, margin:"0 0 22px" }}>
                                {modalAberto === "nova" ? "Defina o tipo e a quantidade de pessoas" : "Altere as informações da meta"}
                            </p>
                            <div className="metas-divider" style={{ marginBottom:20 }} />

                            <label className="metas-label" style={{ color:textSecondary }}>TIPO DE META</label>
                            <div className="tipo-grid" style={{ marginBottom:18 }}>
                                {Object.entries(TIPO_CONFIG).map(([key, cfg]) => (
                                    <div key={key} className={`tipo-opt ${t} ${form.tipoMeta === key ? "selected" : ""}`}
                                         style={{ "--tc": cfg.color }} onClick={() => setForm(f => ({ ...f, tipoMeta: key }))}>
                                        <span style={{ fontSize:20, display:"block", marginBottom:4 }}>{cfg.emoji}</span>
                                        <p style={{ fontFamily:"'Fraunces',serif", fontSize:9, fontWeight:700, letterSpacing:".12em", color: form.tipoMeta === key ? cfg.color : textSecondary, margin:0 }}>
                                            {cfg.label.toUpperCase()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <label className="metas-label" style={{ color:textSecondary }}>QUANTIDADE DE PESSOAS</label>
                            <input type="number" min="1" max="100" className={`metas-input ${t}`}
                                   value={form.metaTotal} onChange={e => setForm(f => ({ ...f, metaTotal: e.target.value }))}
                                   style={{ marginBottom:18 }} />

                            <label className="metas-label" style={{ color:textSecondary }}>
                                <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                                    <Calendar size={11} /> DATA LIMITE DA META
                                </span>
                            </label>
                            <input type="date" className={`metas-input ${t}`}
                                   value={form.mesAno || ""} onChange={e => setForm(f => ({ ...f, mesAno: e.target.value }))}
                                   style={{ marginBottom:8, colorScheme: isDark ? "dark" : "light" }} />

                            {/* Preview da data selecionada */}
                            {form.mesAno && (() => {
                                const dias = calcularDiasRestantes(form.mesAno);
                                if (dias === null) return null;
                                const cor = dias < 0 ? AURA.red : dias <= 7 ? AURA.yellowDark : "#22c55e";
                                const txt = dias < 0
                                    ? `⚠ Meta já vencida há ${Math.abs(dias)} dia${Math.abs(dias) > 1 ? "s" : ""}`
                                    : dias === 0 ? "⚡ Último dia da meta!"
                                        : `✓ ${dias} dia${dias > 1 ? "s" : ""} restante${dias > 1 ? "s" : ""} a partir de hoje`;
                                return (
                                    <div style={{ marginBottom:18, padding:"8px 12px", borderRadius:8, background:`${cor}10`, border:`1px solid ${cor}30` }}>
                                        <p style={{ fontFamily:"'Fraunces',serif", fontSize:9, letterSpacing:".12em", color:cor, margin:"0 0 3px" }}>
                                            {txt}
                                        </p>
                                        <p style={{ fontFamily:"'Fraunces',serif", fontSize:12, color:cor, margin:0, opacity:.85 }}>
                                            Limite: {fmtData(form.mesAno)}
                                        </p>
                                    </div>
                                );
                            })()}

                            <div style={{ display:"flex", gap:10, marginTop: form.mesAno ? 0 : 22 }}>
                                <button className={`metas-btn metas-btn-ghost ${t}`} style={{ flex:1 }} onClick={() => setModalAberto(null)}>
                                    CANCELAR
                                </button>
                                <button className="metas-btn metas-btn-red" style={{ flex:2 }} onClick={salvar} disabled={salvando}>
                                    {salvando ? <Loader2 size={14} className="metas-spin" /> : modalAberto === "nova" ? "CRIAR META" : "SALVAR ALTERAÇÕES"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function CardMeta({ meta, idx, isDark, t, textPrimary, textSecondary, ajustando, onEditar, onDeletar, onIncrementar, onDecrementar, onSincronizar }) {
    const cfg    = TIPO_CONFIG[meta.tipoMeta] || TIPO_CONFIG.BATISMO;
    const status = statusMeta(meta);
    const pct    = meta.progressoPercentual ?? 0;

    const diasRestantes = calcularDiasRestantes(meta.mesAno);
    const mensagem      = getMensagemMotivacional(diasRestantes, pct, meta.metaConcluida, meta.faltam);

    const corDias = diasRestantes === null ? textSecondary
        : diasRestantes < 0  ? AURA.red
            : diasRestantes <= 3 ? AURA.red
                : diasRestantes <= 7 ? AURA.yellowDark
                    : "#22c55e";

    return (
        <motion.div className={`metas-card ${t}`}
                    initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay: idx * 0.07 }}>

            {/* Topo colorido */}
            <div style={{ height:5, background: meta.metaConcluida ? "linear-gradient(90deg,#16a34a,#22c55e)" : `linear-gradient(90deg,${cfg.color},${cfg.color}bb)` }} />

            <div style={{ padding:"20px 20px 16px" }}>
                {/* Header */}
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:26 }}>{cfg.emoji}</span>
                        <div>
                            <p style={{ fontFamily:"'Fraunces',serif", fontSize:11, fontWeight:700, letterSpacing:".13em", color:cfg.color, margin:0 }}>
                                {cfg.label.toUpperCase()}
                            </p>
                            {/* Data limite + dias restantes */}
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3, flexWrap:"wrap" }}>
                                <Calendar size={10} style={{ color:corDias }} />
                                <p style={{ fontFamily:"'Fraunces',serif", fontSize:12, color:textSecondary, margin:0 }}>
                                    {fmtData(meta.mesAno)}
                                </p>
                                {diasRestantes !== null && !meta.metaConcluida && (
                                    <span style={{
                                        fontFamily:"'Fraunces',serif", fontSize:8, fontWeight:700,
                                        letterSpacing:".1em", color:corDias,
                                        background:`${corDias}18`, border:`1px solid ${corDias}44`,
                                        padding:"1px 7px", borderRadius:99,
                                    }}>
                                        {diasRestantes < 0  ? `${Math.abs(diasRestantes)}d atraso`
                                            : diasRestantes === 0 ? "HOJE"
                                                : `${diasRestantes}d`}
                                    </span>
                                )}
                            </div>
                            {/* Data de criação */}
                            {meta.dataCriacao && (
                                <p style={{ fontFamily:"'Fraunces',serif", fontSize:8, letterSpacing:".09em", color:textSecondary, margin:"3px 0 0", opacity:.65 }}>
                                    Criada em: {fmtDataCurta(meta.dataCriacao)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={{ display:"flex", gap:2 }}>
                        <button className="metas-icon-btn" onClick={onSincronizar} title="Sincronizar"
                                style={{ color:textSecondary, opacity: ajustando ? .4 : 1 }} disabled={ajustando}>
                            {ajustando ? <Loader2 size={14} className="metas-spin" style={{ color:AURA.blue }} /> : <RotateCcw size={14} />}
                        </button>
                        <button className="metas-icon-btn" onClick={onEditar}  style={{ color:textSecondary }}><Pencil size={14} /></button>
                        <button className="metas-icon-btn" onClick={onDeletar} style={{ color:textSecondary }}><Trash2 size={14} /></button>
                    </div>
                </div>

                {/* Número + controles */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                    <div>
                        <p style={{ fontFamily:"'Fraunces',serif", fontSize:10, letterSpacing:".1em", color:textSecondary, margin:0 }}>FALTAM</p>
                        <motion.p key={meta.faltam} initial={{ scale:.7, opacity:0 }} animate={{ scale:1, opacity:1 }}
                                  style={{ fontFamily:"'Fraunces',serif", fontSize:38, fontWeight:700, margin:"2px 0 0", lineHeight:1,
                                      color: meta.metaConcluida ? "#22c55e" : cfg.color,
                                      textShadow: meta.metaConcluida ? "0 0 16px rgba(34,197,94,.3)" : undefined }}>
                            {meta.metaConcluida ? "✓" : meta.faltam}
                        </motion.p>
                    </div>

                    <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"center" }}>
                        <button onClick={onIncrementar} disabled={ajustando || meta.metaConcluida}
                                style={{ width:36, height:36, borderRadius:8, border:`2px solid ${cfg.color}55`, background:`${cfg.color}18`,
                                    color:cfg.color, cursor: meta.metaConcluida ? "default" : "pointer",
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    transition:"all .18s", opacity: meta.metaConcluida ? .4 : 1 }}
                                onMouseEnter={e => { if (!meta.metaConcluida) e.currentTarget.style.background = `${cfg.color}30`; }}
                                onMouseLeave={e => { e.currentTarget.style.background = `${cfg.color}18`; }}>
                            {ajustando ? <Loader2 size={14} className="metas-spin" /> : <ChevronUp size={18} />}
                        </button>
                        <span style={{ fontFamily:"'Fraunces',serif", fontSize:10, color:textSecondary, letterSpacing:".08em" }}>
                            {meta.metaAlcancada}/{meta.metaTotal}
                        </span>
                        <button onClick={onDecrementar} disabled={ajustando || meta.metaAlcancada <= 0}
                                style={{ width:36, height:36, borderRadius:8, border:"2px solid rgba(158,42,43,.3)",
                                    background:"rgba(158,42,43,.08)", color:AURA.red,
                                    cursor: meta.metaAlcancada <= 0 ? "default" : "pointer",
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    transition:"all .18s", opacity: meta.metaAlcancada <= 0 ? .3 : 1 }}
                                onMouseEnter={e => { if (meta.metaAlcancada > 0) e.currentTarget.style.background = "rgba(158,42,43,.16)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(158,42,43,.08)"; }}>
                            <ChevronDown size={18} />
                        </button>
                    </div>
                </div>

                {/* Mensagem motivacional */}
                {mensagem && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                                style={{ padding:"8px 12px", borderRadius:8, marginBottom:12,
                                    background:`${mensagem.cor}10`, border:`1px solid ${mensagem.cor}30` }}>
                        <p style={{ fontFamily:"'Fraunces',serif", fontSize:13, color:mensagem.cor, margin:0, fontStyle:"italic" }}>
                            {mensagem.texto}
                        </p>
                    </motion.div>
                )}

                {/* Badge status */}
                <div style={{ marginBottom:12 }}>
                    <span className="metas-badge" style={{ color:status.color, borderColor:`${status.color}44`, background:`${status.color}12` }}>
                        {status.icon} {status.label}
                    </span>
                </div>

                {/* Barra de progresso */}
                <div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Fraunces',serif", fontSize:8.5, letterSpacing:".12em", color:textSecondary, marginBottom:6 }}>
                        <span>PROGRESSO</span><span>{pct}%</span>
                    </div>
                    <div className={`metas-progress-track ${t}`}>
                        <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }}
                                    transition={{ duration:.9, ease:"easeOut", delay: idx * .07 + .2 }}
                                    style={{ height:"100%", borderRadius:99,
                                        background: meta.metaConcluida ? "linear-gradient(90deg,#16a34a,#22c55e)" : `linear-gradient(90deg,${cfg.color},${cfg.color}cc)` }} />
                    </div>
                </div>

                <AnimatePresence>
                    {meta.metaConcluida && (
                        <motion.p initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                                  style={{ fontFamily:"'Fraunces',serif", fontSize:9.5, letterSpacing:".14em", color:"#22c55e", textAlign:"center", marginTop:10, marginBottom:0 }}>
                            ✦ META CONCLUÍDA COM SUCESSO!
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
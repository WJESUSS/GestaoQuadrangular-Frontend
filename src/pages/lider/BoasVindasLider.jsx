import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import { X, Target, Sparkles, Plus, Calendar, Clock } from "lucide-react";

const IEQ = {
    red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
    yellow: "#FDB813", yellowDark: "#C48C00",
    blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
    white: "#FFFFFF", offWhite: "#F5F0E8",
    dark: "#0A0608", darkCard: "#110A0D",
};

// ── Parse local sem bug de fuso
function parseDataLocal(mesAno) {
    if (!mesAno) return null;
    const [ano, mes, dia] = mesAno.substring(0, 10).split("-");
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
}

// ── Dias restantes até a data exata da meta
function calcularDiasRestantes(mesAno) {
    const dataLimite = parseDataLocal(mesAno);
    if (!dataLimite) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataLimite.setHours(0, 0, 0, 0);
    return Math.ceil((dataLimite - hoje) / (1000 * 60 * 60 * 24));
}

// ── Formata para exibição: "30 de jun. de 2026"
function formatarDataLimite(mesAno) {
    const data = parseDataLocal(mesAno);
    if (!data) return "---";
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit", month: "short", year: "numeric",
    }).format(data).replace(".", "");
}

// ── Badge de dias restantes
function getDiasBadge(dias, isDark) {
    if (dias === null) return null;
    if (dias < 0)  return { label: "EXPIRADA",   color: isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.12)", textColor: IEQ.red };
    if (dias === 0) return { label: "VENCE HOJE!", color: isDark ? "rgba(253,184,19,.2)" : "rgba(253,184,19,.15)", textColor: IEQ.yellowDark };
    if (dias <= 7)  return { label: `${dias} DIA${dias > 1 ? "S" : ""}`, color: isDark ? "rgba(253,184,19,.2)" : "rgba(253,184,19,.15)", textColor: IEQ.yellowDark };
    if (dias <= 15) return { label: `${dias} DIAS`, color: isDark ? "rgba(0,61,165,.2)" : "rgba(0,61,165,.1)", textColor: IEQ.blue };
    return { label: `${dias} DIAS`, color: isDark ? "rgba(34,197,94,.15)" : "rgba(34,197,94,.1)", textColor: "#15803d" };
}

export default function BoasVindasLider({ usuarioLogado, celula, isDark, onClose }) {
    const [metas,         setMetas]         = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [showModalMeta, setShowModalMeta] = useState(false);
    const [novaMetaTipo,  setNovaMetaTipo]  = useState("BATISMO");
    const [novaMetaTotal, setNovaMetaTotal] = useState(3);
    const [novaMetaData,  setNovaMetaData]  = useState(new Date().toISOString().substring(0, 10));
    const [criandoMeta,   setCriandoMeta]   = useState(false);

    const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
    const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

    useEffect(() => { carregarMetas(); }, [celula?.id]);

    const carregarMetas = async () => {
        if (!celula?.id) return;
        try {
            setLoading(true);
            const res = await api.get(`/metas/celula/${celula.id}/ativas`);
            setMetas(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Erro ao carregar metas:", err);
            setMetas([]);
        } finally {
            setLoading(false);
        }
    };

    const criarNovaMeta = async () => {
        if (!celula?.id || !novaMetaTotal || !novaMetaData) {
            alert("Preencha todos os campos!");
            return;
        }
        setCriandoMeta(true);
        try {
            await api.post("/metas", {
                celulaId:  celula.id,
                tipoMeta:  novaMetaTipo,
                metaTotal: parseInt(novaMetaTotal),
                mesAno:    novaMetaData,
                descricao: `Meta de ${novaMetaTipo.toLowerCase()} para ${celula.nome}`,
            });
            alert("Meta criada com sucesso!");
            setShowModalMeta(false);
            setNovaMetaTotal(3);
            setNovaMetaTipo("BATISMO");
            setNovaMetaData(new Date().toISOString().substring(0, 10));
            await carregarMetas();
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao criar meta.");
        } finally {
            setCriandoMeta(false);
        }
    };

    const tipoMetaLabel = {
        BATISMO:       "🕊️ BATISMO",
        CONVERSAO:     "✝️ CONVERSÃO",
        RECONCILIACAO: "🤝 RECONCILIAÇÃO",
        DISCIPULADO:   "📖 DISCIPULADO",
    };

    const getCoreMetaColor = (tipo) => {
        switch (tipo) {
            case "BATISMO":       return IEQ.blue;
            case "CONVERSAO":     return IEQ.red;
            case "RECONCILIACAO": return IEQ.yellow;
            case "DISCIPULADO":   return IEQ.redDark;
            default:              return IEQ.blue;
        }
    };

    // Preview de dias no modal
    const diasPreview = calcularDiasRestantes(novaMetaData);
    const corPreview  = diasPreview === null ? textSecondary
        : diasPreview < 0  ? IEQ.red
            : diasPreview <= 7 ? IEQ.yellowDark
                : "#22c55e";
    const txtPreview  = diasPreview === null ? ""
        : diasPreview < 0  ? `⚠ Meta já vencida há ${Math.abs(diasPreview)} dia${Math.abs(diasPreview) > 1 ? "s" : ""}`
            : diasPreview === 0 ? "⚡ Último dia da meta!"
                : `✓ ${diasPreview} dia${diasPreview > 1 ? "s" : ""} restante${diasPreview > 1 ? "s" : ""} a partir de hoje`;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ position:"fixed", inset:0, background: isDark ? "rgba(10,6,8,.92)" : "rgba(0,0,0,.78)",
                    backdropFilter:"blur(24px)", zIndex:50, display:"flex", alignItems:"center",
                    justifyContent:"center", padding:"20px" }}
            >
                <motion.div
                    initial={{ opacity:0, scale:0.85, y:40 }} animate={{ opacity:1, scale:1, y:0 }}
                    exit={{ opacity:0, scale:0.85, y:40 }}
                    transition={{ type:"spring", damping:25, stiffness:300 }}
                    onClick={e => e.stopPropagation()}
                    style={{ background: isDark ? "linear-gradient(135deg,#110A0D,#0A0608)" : "linear-gradient(135deg,#FFFFFF,#F5F0E8)",
                        borderRadius:20, border:`1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"}`,
                        padding:"48px 40px", maxWidth:540, width:"100%", maxHeight:"90vh", overflowY:"auto",
                        boxShadow:"0 25px 50px rgba(200,16,46,.15), 0 0 0 1px rgba(200,16,46,.1)", position:"relative" }}
                >
                    {/* Faixa topo */}
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:3, borderRadius:"20px 20px 0 0",
                        background:`linear-gradient(90deg,${IEQ.redDark},${IEQ.red},${IEQ.yellow},${IEQ.blue})` }} />

                    {/* Botão fechar */}
                    <button onClick={onClose}
                            style={{ position:"absolute", top:16, right:16, background:"none", border:"none", cursor:"pointer",
                                color:textSecondary, padding:8, borderRadius:8, transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center" }}
                            onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,.08)" : "rgba(200,16,46,.08)"; e.currentTarget.style.color = IEQ.red; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = textSecondary; }}>
                        <X size={20} />
                    </button>

                    {/* Cabeçalho */}
                    <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
                                style={{ textAlign:"center", marginBottom:36 }}>
                        <motion.div animate={{ rotate:360 }} transition={{ duration:3, repeat:Infinity, ease:"linear" }}
                                    style={{ display:"inline-block", marginBottom:14 }}>
                            <Sparkles size={36} style={{ color:IEQ.yellow, filter:"drop-shadow(0 0 12px rgba(253,184,19,.4))" }} />
                        </motion.div>
                        <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:28, fontWeight:700, letterSpacing:".15em",
                            background:`linear-gradient(90deg,${IEQ.redDark},${IEQ.red},${IEQ.yellow},${IEQ.blue})`,
                            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", margin:"0 0 8px" }}>
                            BEM-VINDO, LÍDER!
                        </h1>
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:600, letterSpacing:".1em", color:textPrimary, margin:0 }}>
                            {usuarioLogado?.nome?.toUpperCase() || "LÍDER"}
                        </p>
                        <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:textSecondary, margin:"8px 0 0" }}>
                            Célula {celula?.nome || "---"}
                        </p>
                    </motion.div>

                    <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(200,16,46,.2),transparent)", margin:"24px 0" }} />

                    {/* Seção Metas */}
                    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                <Target size={18} style={{ color:IEQ.red }} />
                                <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, letterSpacing:".14em", color:textPrimary, margin:0 }}>
                                    SUAS METAS
                                </h2>
                            </div>
                            <button onClick={() => setShowModalMeta(true)}
                                    style={{ fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".12em",
                                        background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, color:IEQ.white,
                                        border:"none", borderRadius:6, padding:"6px 12px", cursor:"pointer", transition:"all .25s",
                                        display:"flex", alignItems:"center", gap:6 }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.filter = "brightness(1.1)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "brightness(1)"; }}>
                                <Plus size={13} /> NOVA META
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign:"center", padding:"20px 0" }}>
                                <p style={{ fontFamily:"'EB Garamond',serif", color:textSecondary, fontStyle:"italic" }}>Carregando metas...</p>
                            </div>
                        ) : metas.length > 0 ? (
                            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                                {metas.map((meta, idx) => {
                                    const dias  = calcularDiasRestantes(meta.mesAno);
                                    const badge = getDiasBadge(dias, isDark);
                                    const cor   = getCoreMetaColor(meta.tipoMeta);

                                    return (
                                        <motion.div key={meta.id}
                                                    initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                                                    transition={{ delay: 0.3 + idx * 0.1 }}
                                                    style={{ padding:16, borderRadius:12, border:`2px solid ${cor}`,
                                                        background: isDark ? "rgba(255,255,255,.03)" : "rgba(200,16,46,.04)",
                                                        position:"relative", overflow:"hidden" }}>

                                            {/* Barra fundo */}
                                            <motion.div initial={{ width:0 }} animate={{ width:`${meta.progressoPercentual}%` }}
                                                        transition={{ duration:1, delay: 0.5 + idx * 0.1 }}
                                                        style={{ position:"absolute", inset:0, background:`${cor}15`, zIndex:0 }} />

                                            <div style={{ position:"relative", zIndex:1 }}>
                                                {/* Linha 1 — tipo + badge + % */}
                                                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, flexWrap:"wrap", gap:6 }}>
                                                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, letterSpacing:".12em", color:cor }}>
                                                        {tipoMetaLabel[meta.tipoMeta] || meta.tipoMeta}
                                                    </span>
                                                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                                        {badge && !meta.metaConcluida && (
                                                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".1em",
                                                                padding:"3px 8px", borderRadius:99, background:badge.color, color:badge.textColor,
                                                                display:"flex", alignItems:"center", gap:4 }}>
                                                                <Clock size={9} /> {badge.label}
                                                            </span>
                                                        )}
                                                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".1em", color:textSecondary }}>
                                                            {meta.progressoPercentual}%
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Linha 2 — faltam + data */}
                                                <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:12 }}>
                                                    <div>
                                                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:".1em", color:textSecondary, margin:0 }}>Faltam:</p>
                                                        <motion.p initial={{ scale:0.5, opacity:0 }} animate={{ scale:1, opacity:1 }}
                                                                  key={`faltam-${meta.id}-${meta.faltam}`}
                                                                  style={{ fontFamily:"'Cinzel',serif", fontSize:36, fontWeight:700,
                                                                      color: meta.metaConcluida ? "#22c55e" : cor, margin:"2px 0 0", lineHeight:1 }}>
                                                            {meta.metaConcluida ? "✓" : meta.faltam}
                                                        </motion.p>
                                                    </div>
                                                    <div style={{ textAlign:"right" }}>
                                                        <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:textPrimary, margin:0 }}>
                                                            {meta.metaAlcancada} de {meta.metaTotal}
                                                        </p>
                                                        {/* Data limite exata */}
                                                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".09em", color:textSecondary,
                                                            margin:"4px 0 0", display:"flex", alignItems:"center", justifyContent:"flex-end", gap:4 }}>
                                                            <Calendar size={9} /> até {formatarDataLimite(meta.mesAno)}
                                                        </p>
                                                        {/* Data de criação */}
                                                        {meta.dataCriacao && (
                                                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".08em",
                                                                color:textSecondary, margin:"2px 0 0", opacity:.65,
                                                                display:"flex", alignItems:"center", justifyContent:"flex-end", gap:4 }}>
                                                                Criada: {formatarDataLimite(meta.dataCriacao)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Barra progresso */}
                                                <div style={{ height:6, borderRadius:99, background: isDark ? "rgba(255,255,255,.08)" : "rgba(200,16,46,.1)", overflow:"hidden" }}>
                                                    <motion.div initial={{ width:0 }} animate={{ width:`${meta.progressoPercentual}%` }}
                                                                transition={{ duration:1, delay: 0.5 + idx * 0.1 }}
                                                                style={{ height:"100%", borderRadius:99,
                                                                    background: meta.metaConcluida ? "#22c55e" : `linear-gradient(90deg,${cor},${cor}dd)` }} />
                                                </div>

                                                {meta.metaConcluida && (
                                                    <motion.p initial={{ opacity:0, y:-5 }} animate={{ opacity:1, y:0 }}
                                                              style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".12em",
                                                                  color:"#22c55e", margin:"8px 0 0", textAlign:"center" }}>
                                                        🎉 META CONCLUÍDA!
                                                    </motion.p>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ padding:"24px 16px", textAlign:"center", borderRadius:12,
                                border:`1px dashed ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"}`,
                                background: isDark ? "rgba(255,255,255,.02)" : "rgba(200,16,46,.03)" }}>
                                <Target size={24} style={{ color:textSecondary, margin:"0 auto 8px", opacity:0.5 }} />
                                <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:textSecondary, margin:0, fontStyle:"italic" }}>
                                    Nenhuma meta definida ainda.
                                </p>
                                <p style={{ fontFamily:"'EB Garamond',serif", fontSize:12, color:textSecondary, margin:"4px 0 0", opacity:.7 }}>
                                    Clique em "NOVA META" para começar!
                                </p>
                            </div>
                        )}
                    </motion.div>

                    <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(200,16,46,.2),transparent)", margin:"24px 0" }} />

                    {/* Mensagem motivacional */}
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
                                style={{ padding:14, borderRadius:10, background: isDark ? "rgba(0,61,165,.08)" : "rgba(0,61,165,.06)",
                                    border:`1px solid ${isDark ? "rgba(0,61,165,.2)" : "rgba(0,61,165,.15)"}`, textAlign:"center" }}>
                        <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, fontStyle:"italic", color:textSecondary, margin:0 }}>
                            "Toda célula que cresce glorifica a Deus. Trabalhe com foco e dedicação!"
                        </p>
                    </motion.div>

                    {/* Botão fechar */}
                    <button onClick={onClose}
                            style={{ width:"100%", marginTop:24, fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".15em",
                                background:`linear-gradient(135deg,${IEQ.blue},${IEQ.blueDark})`, color:IEQ.white,
                                border:"none", borderRadius:8, padding:"14px 20px", cursor:"pointer", transition:"all .25s" }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.filter = "brightness(1.12)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "brightness(1)"; }}>
                        ENTENDIDO! VAMOS COMEÇAR
                    </button>
                </motion.div>

                {/* Modal Nova Meta */}
                <AnimatePresence>
                    {showModalMeta && (
                        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.2)", backdropFilter:"blur(4px)",
                            zIndex:60, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}
                             onClick={() => setShowModalMeta(false)}>
                            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
                                        onClick={e => e.stopPropagation()}
                                        style={{ background: isDark ? "linear-gradient(135deg,#110A0D,#0A0608)" : "linear-gradient(135deg,#FFFFFF,#F5F0E8)",
                                            borderRadius:16, border:`1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"}`,
                                            padding:"32px 28px", maxWidth:420, width:"100%" }}>

                                <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:700, letterSpacing:".14em", color:textPrimary, margin:"0 0 6px" }}>
                                    DEFINIR NOVA META
                                </h3>
                                <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:"0 0 18px" }}>
                                    Escolha o tipo, quantidade e prazo
                                </p>

                                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                                    {/* Tipo */}
                                    <div>
                                        <label style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".1em", color:textSecondary, display:"block", marginBottom:8 }}>
                                            TIPO DE META
                                        </label>
                                        <select value={novaMetaTipo} onChange={e => setNovaMetaTipo(e.target.value)}
                                                style={{ width:"100%", padding:"10px 12px", borderRadius:8,
                                                    border:`1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"}`,
                                                    background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.02)",
                                                    color:textPrimary, fontFamily:"'EB Garamond',serif", fontSize:13, cursor:"pointer" }}>
                                            <option value="BATISMO">🕊️ BATISMO</option>
                                            <option value="CONVERSAO">✝️ CONVERSÃO</option>
                                            <option value="RECONCILIACAO">🤝 RECONCILIAÇÃO</option>
                                            <option value="DISCIPULADO">📖 DISCIPULADO</option>
                                        </select>
                                    </div>

                                    {/* Quantidade */}
                                    <div>
                                        <label style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".1em", color:textSecondary, display:"block", marginBottom:8 }}>
                                            QUANTIDADE DE PESSOAS
                                        </label>
                                        <input type="number" min="1" max="100" value={novaMetaTotal}
                                               onChange={e => setNovaMetaTotal(e.target.value)}
                                               style={{ width:"100%", padding:"10px 12px", borderRadius:8,
                                                   border:`1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"}`,
                                                   background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.02)",
                                                   color:textPrimary, fontFamily:"'EB Garamond',serif", fontSize:13 }} />
                                    </div>

                                    {/* Data limite */}
                                    <div>
                                        <label style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".1em", color:textSecondary, display:"block", marginBottom:8 }}>
                                            <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                                                <Calendar size={11} /> DATA LIMITE DA META
                                            </span>
                                        </label>
                                        <input type="date" value={novaMetaData} onChange={e => setNovaMetaData(e.target.value)}
                                               style={{ width:"100%", padding:"10px 12px", borderRadius:8,
                                                   border:`1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"}`,
                                                   background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.02)",
                                                   color:textPrimary, fontFamily:"'EB Garamond',serif", fontSize:13,
                                                   colorScheme: isDark ? "dark" : "light" }} />
                                        {/* Preview */}
                                        {novaMetaData && (
                                            <div style={{ marginTop:8, padding:"7px 12px", borderRadius:8,
                                                background:`${corPreview}10`, border:`1px solid ${corPreview}30` }}>
                                                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".11em", color:corPreview, margin:"0 0 2px" }}>
                                                    {txtPreview}
                                                </p>
                                                <p style={{ fontFamily:"'EB Garamond',serif", fontSize:12, color:corPreview, margin:0, opacity:.85 }}>
                                                    Limite: {formatarDataLimite(novaMetaData)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Botões */}
                                    <div style={{ display:"flex", gap:10, marginTop:6 }}>
                                        <button onClick={() => setShowModalMeta(false)}
                                                style={{ flex:1, fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".12em",
                                                    background: isDark ? "rgba(255,255,255,.06)" : "rgba(200,16,46,.06)", color:textPrimary,
                                                    border:`1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"}`,
                                                    borderRadius:6, padding:"10px 14px", cursor:"pointer", transition:"all .25s" }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = IEQ.red; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"; }}>
                                            CANCELAR
                                        </button>
                                        <button onClick={criarNovaMeta} disabled={criandoMeta}
                                                style={{ flex:2, fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".12em",
                                                    background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, color:IEQ.white,
                                                    border:"none", borderRadius:6, padding:"10px 14px",
                                                    cursor: criandoMeta ? "not-allowed" : "pointer", transition:"all .25s", opacity: criandoMeta ? 0.6 : 1 }}
                                                onMouseEnter={e => { if (!criandoMeta) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.filter = "brightness(1.1)"; } }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "brightness(1)"; }}>
                                            {criandoMeta ? "CRIANDO..." : "CRIAR META"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
}
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import { X, Target, Sparkles, Plus, Calendar, Clock, Loader2 } from "lucide-react";
import { AURA, theme } from "./liderTheme";

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function parseDataLocal(mesAno) {
    if (!mesAno) return null;
    const [ano, mes, dia] = mesAno.substring(0,10).split("-");
    return new Date(Number(ano), Number(mes)-1, Number(dia));
}

function calcularDiasRestantes(mesAno) {
    const dataLimite = parseDataLocal(mesAno);
    if (!dataLimite) return null;
    const hoje = new Date();
    hoje.setHours(0,0,0,0); dataLimite.setHours(0,0,0,0);
    return Math.ceil((dataLimite - hoje) / (1000*60*60*24));
}

function formatarDataLimite(mesAno) {
    const data = parseDataLocal(mesAno);
    if (!data) return "---";
    return new Intl.DateTimeFormat("pt-BR",{ day:"2-digit", month:"short", year:"numeric" }).format(data).replace(".","");
}

function getDiasBadge(dias) {
    if (dias === null)  return null;
    if (dias < 0)       return { label:"Expirada",    color:"rgba(200,16,46,.15)",   text:AURA.red };
    if (dias === 0)     return { label:"Vence hoje!",  color:"rgba(253,184,19,.15)",  text:AURA.yellowDark };
    if (dias <= 7)      return { label:`${dias} dia${dias>1?"s":""}`, color:"rgba(253,184,19,.12)", text:AURA.yellowDark };
    if (dias <= 15)     return { label:`${dias} dias`, color:"rgba(0,61,165,.1)",    text:AURA.blue };
    return { label:`${dias} dias`, color:"rgba(34,197,94,.1)", text:"#15803d" };
}

function getCoreMetaColor(tipo) {
    switch(tipo) {
        case "BATISMO":       return AURA.blue;
        case "CONVERSAO":     return AURA.red;
        case "RECONCILIACAO": return AURA.yellow;
        case "DISCIPULADO":   return AURA.redDark;
        default:              return AURA.blue;
    }
}

const tipoMetaLabel = {
    BATISMO:       "🕊️ Batismo",
    CONVERSAO:     "✝️ Conversão",
    RECONCILIACAO: "🤝 Reconciliação",
    DISCIPULADO:   "📖 Discipulado",
};

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function BoasVindasLider({ usuarioLogado, celula, isDark, onClose }) {
    const t = theme(isDark);
    const [metas,         setMetas]         = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [showModalMeta, setShowModalMeta] = useState(false);
    const [novaMetaTipo,  setNovaMetaTipo]  = useState("BATISMO");
    const [novaMetaTotal, setNovaMetaTotal] = useState(3);
    const [novaMetaData,  setNovaMetaData]  = useState(new Date().toISOString().substring(0,10));
    const [criandoMeta,   setCriandoMeta]   = useState(false);

    useEffect(() => { carregarMetas(); }, [celula?.id]);

    const carregarMetas = async () => {
        if (!celula?.id) return;
        try {
            setLoading(true);
            const res = await api.get(`/metas/celula/${celula.id}/ativas`);
            setMetas(Array.isArray(res.data) ? res.data : []);
        } catch { setMetas([]); }
        finally { setLoading(false); }
    };

    const criarNovaMeta = async () => {
        if (!celula?.id || !novaMetaTotal || !novaMetaData) { alert("Preencha todos os campos!"); return; }
        setCriandoMeta(true);
        try {
            await api.post("/metas", {
                celulaId: celula.id, tipoMeta: novaMetaTipo,
                metaTotal: parseInt(novaMetaTotal), mesAno: novaMetaData,
                descricao: `Meta de ${novaMetaTipo.toLowerCase()} para ${celula.nome}`,
            });
            alert("Meta criada com sucesso!");
            setShowModalMeta(false);
            setNovaMetaTotal(3); setNovaMetaTipo("BATISMO");
            setNovaMetaData(new Date().toISOString().substring(0,10));
            await carregarMetas();
        } catch (err) { alert(err.response?.data?.message || "Erro ao criar meta."); }
        finally { setCriandoMeta(false); }
    };

    const diasPreview  = calcularDiasRestantes(novaMetaData);
    const corPreview   = diasPreview === null ? t.textSec : diasPreview < 0 ? AURA.red : diasPreview <= 7 ? AURA.yellowDark : "#22c55e";
    const txtPreview   = diasPreview === null ? ""
        : diasPreview < 0  ? `⚠️ Meta já vencida há ${Math.abs(diasPreview)} dia${Math.abs(diasPreview)>1?"s":""}`
            : diasPreview === 0 ? "⚠️ Último dia da meta!"
                : `✅ ${diasPreview} dia${diasPreview>1?"s":""} restante${diasPreview>1?"s":""} a partir de hoje`;

    const inputStyle = {
        width:"100%", padding:"11px 14px", borderRadius:12,
        border:`1px solid ${t.borderInput}`,
        background: t.bgInput, color:t.text,
        fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:300,
        outline:"none", transition:"all .25s", boxSizing:"border-box",
        colorScheme: isDark?"dark":"light",
    };
    const labelStyle = {
        display:"block", marginBottom:6,
        fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600,
        letterSpacing:".12em", textTransform:"uppercase", color:AURA.gold,
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                onClick={onClose}
                style={{
                    position:"fixed", inset:0,
                    background: isDark?"rgba(10,6,8,.92)":"rgba(0,0,0,.78)",
                    backdropFilter:"blur(24px)", zIndex:50, overflowY:"auto",
                }}
            >
                <div style={{ minHeight:"100%", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"40px 20px" }}>
                    {/* ── Card principal ── */}
                    <motion.div
                        initial={{ opacity:0, scale:.88, y:40 }}
                        animate={{ opacity:1, scale:1, y:0 }}
                        exit={{ opacity:0, scale:.88, y:40 }}
                        transition={{ type:"spring", damping:25, stiffness:300 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: t.bgEl, borderRadius:24,
                            border:`1px solid ${t.border}`,
                            padding:"40px 32px",
                            maxWidth:540, width:"100%",
                            boxShadow:`0 24px 64px rgba(0,0,0,${isDark?.4:.18})`,
                            position:"relative",
                        }}
                    >
                        {/* Faixa topo */}
                        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, borderRadius:"24px 24px 0 0",
                            background:`linear-gradient(90deg,${AURA.redDark},${AURA.red},${AURA.yellow},${AURA.blue})` }} />

                        {/* Botão fechar */}
                        <button onClick={onClose} style={{
                            position:"absolute", top:16, right:16,
                            background:"none", border:"none", cursor:"pointer",
                            color:t.textMuted, padding:8, borderRadius:8, display:"flex",
                            transition:"all .2s",
                        }}
                                onMouseEnter={e => { e.currentTarget.style.background=isDark?"rgba(255,255,255,.08)":"rgba(200,16,46,.08)"; e.currentTarget.style.color=AURA.red; }}
                                onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color=t.textMuted; }}>
                            <X size={20} />
                        </button>

                        {/* ── Cabeçalho ── */}
                        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
                                    style={{ textAlign:"center", marginBottom:32 }}>
                            <motion.div animate={{ rotate:360 }} transition={{ duration:3, repeat:Infinity, ease:"linear" }}
                                        style={{ display:"inline-block", marginBottom:14 }}>
                                <Sparkles size={36} style={{ color:AURA.yellow, filter:"drop-shadow(0 0 10px rgba(253,184,19,.35))" }} />
                            </motion.div>
                            <h1 style={{
                                fontFamily:"'Playfair Display',serif", fontSize:"clamp(22px,5vw,28px)",
                                fontWeight:600, letterSpacing:".05em",
                                background:`linear-gradient(90deg,${AURA.redDark},${AURA.red},${AURA.yellow},${AURA.blue})`,
                                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                                margin:"0 0 10px",
                            }}>Bem-vindo, líder!</h1>
                            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:500, color:t.text, margin:0 }}>
                                {usuarioLogado?.nome || "Líder"}
                            </p>
                            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:300, color:t.textSec, margin:"6px 0 0" }}>
                                Célula {celula?.nome || "---"}
                            </p>
                        </motion.div>

                        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${t.border},transparent)`, margin:"0 0 28px" }} />

                        {/* ── Seção Metas ── */}
                        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}>
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                    <div style={{ width:32, height:32, borderRadius:10, background:"rgba(201,169,110,.08)", border:`1px solid rgba(201,169,110,.2)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                        <Target size={16} style={{ color:AURA.gold }} />
                                    </div>
                                    <h2 style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:600, letterSpacing:".14em", textTransform:"uppercase", color:t.text, margin:0 }}>Suas metas</h2>
                                </div>
                                <button onClick={() => setShowModalMeta(true)} style={{
                                    display:"flex", alignItems:"center", gap:6,
                                    fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase",
                                    background:`linear-gradient(135deg,${AURA.redDark},${AURA.red})`, color:"#fff",
                                    border:"none", borderRadius:100, padding:"8px 16px", cursor:"pointer",
                                    transition:"all .25s", boxShadow:"0 4px 16px rgba(200,16,46,.2)",
                                }}
                                        onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; }}>
                                    <Plus size={13} /> Nova meta
                                </button>
                            </div>

                            {loading ? (
                                <div style={{ textAlign:"center", padding:"20px 0", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                                    <Loader2 size={18} style={{ color:AURA.gold, animation:"bvl-spin 1s linear infinite" }} />
                                    <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:300, color:t.textSec, fontStyle:"italic", margin:0 }}>Carregando metas...</p>
                                </div>
                            ) : metas.length > 0 ? (
                                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                                    {metas.map((meta, idx) => {
                                        const dias  = calcularDiasRestantes(meta.mesAno);
                                        const badge = getDiasBadge(dias);
                                        const cor   = getCoreMetaColor(meta.tipoMeta);
                                        return (
                                            <motion.div key={meta.id}
                                                        initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:.3+idx*.1 }}
                                                        style={{ padding:18, borderRadius:16, border:`1.5px solid ${cor}22`,
                                                            background: isDark?"rgba(255,255,255,.02)":"rgba(201,169,110,.03)",
                                                            position:"relative", overflow:"hidden" }}>
                                                <motion.div
                                                    initial={{ width:0 }} animate={{ width:`${meta.progressoPercentual}%` }}
                                                    transition={{ duration:1, delay:.5+idx*.1 }}
                                                    style={{ position:"absolute", inset:0, background:`${cor}10`, zIndex:0 }} />
                                                <div style={{ position:"relative", zIndex:1 }}>
                                                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:6 }}>
                            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:cor }}>
                              {tipoMetaLabel[meta.tipoMeta] || meta.tipoMeta}
                            </span>
                                                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                                            {badge && !meta.metaConcluida && (
                                                                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:600, letterSpacing:".08em", padding:"3px 9px", borderRadius:100, background:badge.color, color:badge.text, display:"flex", alignItems:"center", gap:4 }}>
                                  <Clock size={9} /> {badge.label}
                                </span>
                                                            )}
                                                            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:500, color:t.textMuted }}>{meta.progressoPercentual}%</span>
                                                        </div>
                                                    </div>

                                                    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:12 }}>
                                                        <div>
                                                            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:t.textMuted, margin:0 }}>Faltam:</p>
                                                            <motion.p initial={{ scale:.5, opacity:0 }} animate={{ scale:1, opacity:1 }} key={`faltam-${meta.id}-${meta.faltam}`}
                                                                      style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:600,
                                                                          color: meta.metaConcluida ? "#22c55e" : cor, margin:"2px 0 0", lineHeight:1 }}>
                                                                {meta.metaConcluida ? "✅" : meta.faltam}
                                                            </motion.p>
                                                        </div>
                                                        <div style={{ textAlign:"right" }}>
                                                            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:300, color:t.text, margin:0 }}>
                                                                {meta.metaAlcancada} de {meta.metaTotal}
                                                            </p>
                                                            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:500, color:t.textMuted, margin:"4px 0 0", display:"flex", alignItems:"center", justifyContent:"flex-end", gap:4 }}>
                                                                <Calendar size={9} /> até {formatarDataLimite(meta.mesAno)}
                                                            </p>
                                                            {meta.dataCriacao && (
                                                                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:300, color:t.textMuted, margin:"2px 0 0", opacity:.65 }}>
                                                                    Criada: {formatarDataLimite(meta.dataCriacao)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div style={{ height:5, borderRadius:99, background:isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)", overflow:"hidden" }}>
                                                        <motion.div initial={{ width:0 }} animate={{ width:`${meta.progressoPercentual}%` }} transition={{ duration:1, delay:.5+idx*.1 }}
                                                                    style={{ height:"100%", borderRadius:99, background: meta.metaConcluida ? "#22c55e" : `linear-gradient(90deg,${cor},${cor}bb)` }} />
                                                    </div>

                                                    {meta.metaConcluida && (
                                                        <motion.p initial={{ opacity:0, y:-5 }} animate={{ opacity:1, y:0 }}
                                                                  style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#22c55e", margin:"10px 0 0", textAlign:"center" }}>
                                                            🎉 Meta concluída!
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ padding:"24px 16px", textAlign:"center", borderRadius:16,
                                    border:`1px dashed ${t.border}`,
                                    background: isDark?"rgba(255,255,255,.01)":"rgba(201,169,110,.03)" }}>
                                    <Target size={24} style={{ color:t.textMuted, margin:"0 auto 10px", opacity:.5 }} />
                                    <p style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:400, color:t.textSec, margin:0, fontStyle:"italic" }}>
                                        Nenhuma meta definida ainda.
                                    </p>
                                    <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:300, color:t.textMuted, margin:"4px 0 0" }}>
                                        Clique em "Nova meta" para começar!
                                    </p>
                                </div>
                            )}
                        </motion.div>

                        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${t.border},transparent)`, margin:"28px 0" }} />

                        {/* ── Mensagem ── */}
                        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.4 }}
                                    style={{ padding:16, borderRadius:14,
                                        background: isDark?"rgba(0,61,165,.07)":"rgba(0,61,165,.05)",
                                        border:`1px solid ${isDark?"rgba(0,61,165,.18)":"rgba(0,61,165,.12)"}`,
                                        textAlign:"center" }}>
                            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontStyle:"italic", color:t.textSec, margin:0, lineHeight:1.65 }}>
                                "Toda célula que cresce glorifica a Deus. Trabalhe com foco e dedicação!"
                            </p>
                        </motion.div>

                        {/* ── Imagem pequena de destaque ── */}
                        {/* ── Imagem pequena de destaque ── */}
                        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.45 }}
                                    style={{ display:"flex", justifyContent:"center", marginTop:20 }}>
                            <img
                                src="/40dias-milagres.png"
                                alt="40 Dias de Milagres — Avante e Sem Parar"
                                style={{
                                    width:400, height:"auto", borderRadius:14,
                                    border:`1px solid ${t.border}`,
                                    boxShadow:`0 8px 24px rgba(0,0,0,${isDark?.35:.15})`,
                                }}
                            />
                        </motion.div>

                        {/* ── Botão fechar (rodapé) ── */}
                        <button onClick={onClose} style={{
                            width:"100%", marginTop:24,
                            fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600,
                            letterSpacing:".16em", textTransform:"uppercase",
                            background:`linear-gradient(135deg,${AURA.blue},${AURA.blueDark})`, color:"#fff",
                            border:"none", borderRadius:14, padding:"15px 20px",
                            cursor:"pointer", transition:"all .25s",
                            boxShadow:"0 6px 24px rgba(0,61,165,.25)",
                        }}
                                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.filter="brightness(1.12)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.filter="brightness(1)"; }}>
                            Entendido! Vamos começar
                        </button>

                        {/* ── keyframes inline ── */}
                        <style>{`@keyframes bvl-spin { to { transform: rotate(360deg); } }`}</style>
                    </motion.div>
                </div>

                {/* ── Modal Nova Meta ── */}
                <AnimatePresence>
                    {showModalMeta && (
                        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.3)", backdropFilter:"blur(4px)",
                            zIndex:60, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
                             onClick={() => setShowModalMeta(false)}>
                            <motion.div
                                initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.9 }}
                                onClick={e => e.stopPropagation()}
                                style={{ background:t.bgEl, border:`1px solid ${t.border}`,
                                    borderRadius:20, padding:"32px 28px", maxWidth:420, width:"100%",
                                    boxShadow:`0 24px 64px rgba(0,0,0,${isDark?.45:.2})`,
                                    maxHeight:"90vh", overflowY:"auto" }}>
                                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:500, color:t.text, margin:"0 0 6px" }}>Nova meta</h3>
                                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:300, color:t.textSec, margin:"0 0 22px" }}>Escolha o tipo, quantidade e prazo</p>

                                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                                    <div>
                                        <label style={labelStyle}>Tipo de meta</label>
                                        <select value={novaMetaTipo} onChange={e => setNovaMetaTipo(e.target.value)} style={{ ...inputStyle, cursor:"pointer", appearance:"none" }}>
                                            <option value="BATISMO">🕊️ Batismo</option>
                                            <option value="CONVERSAO">✝️ Conversão</option>
                                            <option value="RECONCILIACAO">🤝 Reconciliação</option>
                                            <option value="DISCIPULADO">📖 Discipulado</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Quantidade de pessoas</label>
                                        <input type="number" min="1" max="100" value={novaMetaTotal}
                                               onChange={e => setNovaMetaTotal(e.target.value)}
                                               style={inputStyle} />
                                    </div>

                                    <div>
                                        <label style={labelStyle}><Calendar size={11} style={{ display:"inline", marginRight:5 }} />Data limite</label>
                                        <input type="date" value={novaMetaData} onChange={e => setNovaMetaData(e.target.value)} style={inputStyle} />
                                        {novaMetaData && (
                                            <div style={{ marginTop:8, padding:"8px 12px", borderRadius:10, background:`${corPreview}10`, border:`1px solid ${corPreview}30` }}>
                                                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600, letterSpacing:".09em", color:corPreview, margin:"0 0 2px", textTransform:"uppercase" }}>{txtPreview}</p>
                                                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:300, color:corPreview, margin:0, opacity:.85 }}>
                                                    Limite: {formatarDataLimite(novaMetaData)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display:"flex", gap:10, marginTop:4 }}>
                                        <button onClick={() => setShowModalMeta(false)} style={{
                                            flex:1, fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600,
                                            letterSpacing:".1em", textTransform:"uppercase",
                                            background:isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",
                                            color:t.textSec, border:`1px solid ${t.border}`,
                                            borderRadius:100, padding:"12px 14px", cursor:"pointer", transition:"all .25s",
                                        }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor=AURA.gold; e.currentTarget.style.color=AURA.gold; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor=t.border; e.currentTarget.style.color=t.textSec; }}>
                                            Cancelar
                                        </button>
                                        <button onClick={criarNovaMeta} disabled={criandoMeta} style={{
                                            flex:2, fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600,
                                            letterSpacing:".1em", textTransform:"uppercase",
                                            background:`linear-gradient(135deg,${AURA.redDark},${AURA.red})`, color:"#fff",
                                            border:"none", borderRadius:100, padding:"12px 14px",
                                            cursor: criandoMeta?"not-allowed":"pointer",
                                            transition:"all .25s", opacity: criandoMeta?.6:1,
                                            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                                        }}>
                                            {criandoMeta ? <><Loader2 size={15} style={{ animation:"bvl-spin 1s linear infinite" }} /> Criando...</> : "Criar meta"}
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
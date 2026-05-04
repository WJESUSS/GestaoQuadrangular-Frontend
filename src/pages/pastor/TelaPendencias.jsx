/* ============================================================
   TelaPendencias.jsx
   src/pages/pastor/TelaPendencias.jsx
   ============================================================ */

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
    AlertTriangle, CheckCircle2, RefreshCw, Loader2,
    FileText, BookOpen, MapPin, User, ClipboardList,
} from "lucide-react";

const IEQ = {
    red:        "#C8102E",
    redDark:    "#8B0B1F",
    redLight:   "#E8294A",
    yellow:     "#FDB813",
    yellowDark: "#C48C00",
    blue:       "#003DA5",
    blueDark:   "#002470",
    blueLight:  "#1A56C4",
    offWhite:   "#F5F0E8",
    dark:       "#0A0608",
};

const formatarSemana = (inicio, fim) => {
    const fmt = (d) => { const [,m,dia] = d.split("-"); return `${dia}/${m}`; };
    return `${fmt(inicio)} – ${fmt(fim)}`;
};

export default function TelaPendencias({ isDark = false }) {
    const [pendencias, setPendencias] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [erro,       setErro]       = useState("");
    const [filtro,     setFiltro]     = useState("TODAS");

    const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
    const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

    const carregar = useCallback(async () => {
        setLoading(true);
        setErro("");
        try {
            const res = await api.get("/pastor/pendencias");
            setPendencias(res.data);
        } catch (err) {
            setErro("Não foi possível carregar as pendências.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    const pendenciasFiltradas = pendencias.filter((p) => {
        if (filtro === "RELATORIO")   return p.relatorioPendente && !p.discipuladoPendente;
        if (filtro === "DISCIPULADO") return p.discipuladoPendente && !p.relatorioPendente;
        if (filtro === "AMBAS")       return p.relatorioPendente && p.discipuladoPendente;
        return true;
    });

    const totalAmbas       = pendencias.filter(p => p.relatorioPendente && p.discipuladoPendente).length;
    const totalRelatorio   = pendencias.filter(p => p.relatorioPendente).length;
    const totalDiscipulado = pendencias.filter(p => p.discipuladoPendente).length;
    const semanaLabel      = pendencias[0] ? formatarSemana(pendencias[0].semanaInicio, pendencias[0].semanaFim) : "";

    const globalStyles = `
    @keyframes spin { to { transform:rotate(360deg); } }

    .pend-card {
      background:${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius:14px;
      backdrop-filter:blur(24px);
    }

    .pend-row {
      display:flex; flex-wrap:wrap; align-items:center;
      justify-content:space-between; gap:14px;
      padding:18px 22px;
      border-bottom:1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.07)"};
      transition:background .2s;
    }
    .pend-row:hover { background:${isDark ? "rgba(200,16,46,.05)" : "rgba(200,16,46,.04)"}; }
    .pend-row:last-child { border-bottom:none; }

    .pend-badge {
      display:inline-flex; align-items:center; gap:5px;
      padding:4px 11px; border-radius:99px;
      font-family:'Cinzel',serif; font-size:8.5px; font-weight:700;
      letter-spacing:.14em; border:1px solid; white-space:nowrap;
    }

    .pend-avatar {
      width:42px; height:42px; border-radius:9px; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      color:#fff; font-family:'Cinzel',serif; font-weight:700; font-size:15px;
    }

    .pend-filtro-btn {
      font-family:'Cinzel',serif; font-size:9px; font-weight:700;
      letter-spacing:.16em; border-radius:8px; cursor:pointer;
      padding:9px 16px; border:1px solid; transition:all .2s;
    }

    .pend-kpi {
      background:${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius:14px; backdrop-filter:blur(24px);
      padding:18px 20px; display:flex; align-items:center; gap:14px;
    }

    .pend-divider {
      height:1px;
      background:linear-gradient(90deg,transparent,
        ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"},transparent);
      margin:8px 0;
    }
  `;

    return (
        <div style={{ color:textPrimary, fontFamily:"'EB Garamond',serif" }}>
            <style>{globalStyles}</style>

            {/* ── HEADER ── */}
            <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
                        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:14 }}>
                <div>
                    <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:700, letterSpacing:".18em", margin:0,
                        background:`linear-gradient(90deg,${IEQ.redDark},${IEQ.red},${IEQ.yellow},${IEQ.blue})`,
                        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                        PENDÊNCIAS DA SEMANA
                    </h2>
                    <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSecondary, margin:"4px 0 0" }}>
                        RELATÓRIOS E DISCIPULADO{semanaLabel ? ` · ${semanaLabel}` : ""}
                    </p>
                </div>
                <button onClick={carregar}
                        style={{ background:"none", border:`1px solid ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}`,
                            borderRadius:8, padding:"9px 16px", cursor:"pointer", color:textSecondary,
                            display:"flex", alignItems:"center", gap:8, fontFamily:"'Cinzel',serif",
                            fontSize:9, letterSpacing:".15em", transition:"all .2s" }}>
                    <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                    ATUALIZAR
                </button>
            </motion.div>

            {/* ── KPIs ── */}
            <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:.08 }}
                        style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:20 }}>
                {[
                    { label:"AMBAS PENDENTES", value:totalAmbas,       color:IEQ.red,        icon:<AlertTriangle size={18}/> },
                    { label:"SEM RELATÓRIO",   value:totalRelatorio,   color:IEQ.yellowDark, icon:<FileText size={18}/>      },
                    { label:"SEM DISCIPULADO", value:totalDiscipulado, color:IEQ.blue,       icon:<BookOpen size={18}/>      },
                ].map(({ label, value, color, icon }) => (
                    <div key={label} className="pend-kpi">
                        <div style={{ width:42, height:42, borderRadius:10, background:`${color}18`,
                            display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>
                            {icon}
                        </div>
                        <div>
                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSecondary, margin:0 }}>{label}</p>
                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:26, fontWeight:700, color:textPrimary, margin:0, lineHeight:1.1 }}>
                                {loading ? "—" : value}
                            </p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* ── FILTROS ── */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.12 }}
                        style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 }}>
                {[
                    { key:"TODAS",       label:"TODAS"           },
                    { key:"AMBAS",       label:"AMBAS FALHAS"    },
                    { key:"RELATORIO",   label:"SEM RELATÓRIO"   },
                    { key:"DISCIPULADO", label:"SEM DISCIPULADO" },
                ].map(({ key, label }) => {
                    const ativo = filtro === key;
                    return (
                        <button key={key} className="pend-filtro-btn" onClick={() => setFiltro(key)}
                                style={{
                                    background:  ativo ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})` : "transparent",
                                    color:       ativo ? "#fff" : textSecondary,
                                    borderColor: ativo ? IEQ.red : (isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"),
                                }}>
                            {label}
                        </button>
                    );
                })}
            </motion.div>

            {/* ── LISTA ── */}
            <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:.16 }}>
                <div className="pend-card" style={{ overflow:"hidden" }}>

                    {/* cabeçalho */}
                    <div style={{ padding:"18px 22px",
                        borderBottom:`1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"}`,
                        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{ width:36, height:36, borderRadius:8,
                                background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`,
                                display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                                <ClipboardList size={16} />
                            </div>
                            <div>
                                <p style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".15em", margin:0, color:textPrimary }}>
                                    CÉLULAS PENDENTES
                                </p>
                                <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:0 }}>
                                    {loading ? "carregando..." : `${pendenciasFiltradas.length} célula(s) com pendência`}
                                </p>
                            </div>
                        </div>
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <span className="pend-badge" style={{ color:IEQ.red, borderColor:`${IEQ.red}30`, background:`${IEQ.red}10` }}>
                <FileText size={10}/> RELATÓRIO
              </span>
                            <span className="pend-badge" style={{ color:IEQ.blue, borderColor:`${IEQ.blue}30`, background:`${IEQ.blue}10` }}>
                <BookOpen size={10}/> DISCIPULADO
              </span>
                        </div>
                    </div>

                    {/* corpo */}
                    {loading ? (
                        <div style={{ padding:56, display:"flex", justifyContent:"center" }}>
                            <Loader2 size={30} style={{ animation:"spin 1s linear infinite", color:IEQ.red }} />
                        </div>
                    ) : erro ? (
                        <div style={{ padding:40, textAlign:"center" }}>
                            <AlertTriangle size={28} style={{ color:IEQ.red, margin:"0 auto 10px" }} />
                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".16em", color:IEQ.red }}>{erro}</p>
                        </div>
                    ) : pendenciasFiltradas.length === 0 ? (
                        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                                    style={{ padding:"52px 20px", textAlign:"center" }}>
                            <CheckCircle2 size={36} style={{ color:"#12A060", margin:"0 auto 12px" }} />
                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:".18em", color:"#12A060", margin:0 }}>
                                TUDO EM DIA!
                            </p>
                            <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:textSecondary, marginTop:6 }}>
                                Nenhuma célula com pendência para este filtro.
                            </p>
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {pendenciasFiltradas.map((p, i) => {
                                const ambas = p.relatorioPendente && p.discipuladoPendente;
                                const avatarBg = ambas
                                    ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`
                                    : p.relatorioPendente
                                        ? `linear-gradient(135deg,${IEQ.yellowDark},${IEQ.yellow})`
                                        : `linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})`;

                                return (
                                    <motion.div key={p.idCelula}
                                                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="pend-row"
                                    >
                                        {/* identidade */}
                                        <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0, flex:1 }}>
                                            <div className="pend-avatar"
                                                 style={{ background:avatarBg, color: p.relatorioPendente && !p.discipuladoPendente ? "#1A0A0D" : "#fff" }}>
                                                {p.nomeCelula?.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ minWidth:0 }}>
                                                <p style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700,
                                                    letterSpacing:".1em", color:textPrimary, margin:0,
                                                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                                    {p.nomeCelula}
                                                </p>
                                                <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginTop:3 }}>
                          <span style={{ display:"flex", alignItems:"center", gap:5,
                              fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary }}>
                            <User size={12}/> {p.nomeLider}
                          </span>
                                                    {p.bairro && (
                                                        <span style={{ display:"flex", alignItems:"center", gap:5,
                                                            fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary }}>
                              <MapPin size={12}/> {p.bairro}
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* badges */}
                                        <div style={{ display:"flex", gap:8, flexWrap:"wrap", flexShrink:0 }}>
                                            {p.relatorioPendente && (
                                                <span className="pend-badge" style={{ color:IEQ.red, borderColor:`${IEQ.red}35`, background:`${IEQ.red}12` }}>
                          <FileText size={10}/> SEM RELATÓRIO
                        </span>
                                            )}
                                            {p.discipuladoPendente && (
                                                <span className="pend-badge" style={{ color:IEQ.blue, borderColor:`${IEQ.blue}35`, background:`${IEQ.blue}12` }}>
                          <BookOpen size={10}/> SEM DISCIPULADO
                        </span>
                                            )}
                                            {!p.relatorioPendente && (
                                                <span className="pend-badge" style={{ color:"#12A060", borderColor:"rgba(18,160,96,.3)", background:"rgba(18,160,96,.1)" }}>
                          <CheckCircle2 size={10}/> RELATÓRIO OK
                        </span>
                                            )}
                                            {!p.discipuladoPendente && (
                                                <span className="pend-badge" style={{ color:"#12A060", borderColor:"rgba(18,160,96,.3)", background:"rgba(18,160,96,.1)" }}>
                          <CheckCircle2 size={10}/> DISCIPULADO OK
                        </span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
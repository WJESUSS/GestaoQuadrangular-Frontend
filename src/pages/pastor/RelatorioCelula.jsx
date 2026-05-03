import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api.js";
import {
  Download, Users, Calendar, BookOpen, AlertCircle,
  Loader2, Filter, ChevronDown, Sparkles, X,
  UserCheck, MessageSquare, TrendingUp, UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const IEQ = {
  red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
  yellow: "#FDB813", yellowDark: "#C48C00",
  blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
  white: "#FFFFFF", offWhite: "#F5F0E8",
  dark: "#0A0608", darkCard: "#110A0D",
};

function QuadrangularCross({ size = 28 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gVE" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={IEQ.redLight} />
            <stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHE" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={IEQ.blueDark} />
            <stop offset="50%" stopColor={IEQ.blueLight} />
            <stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowE">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gVE)" filter="url(#glowE)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gHE)" filter="url(#glowE)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowE)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

export default function RelatorioCelula({ isDark = false }) {
  const [relatorios,      setRelatorios]      = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [erro,            setErro]            = useState(null);
  const [baixandoPDF,     setBaixandoPDF]     = useState(false);
  const [showFilters,     setShowFilters]     = useState(false);
  const [selectedRel,     setSelectedRel]     = useState(null);
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [dataInicio,      setDataInicio]      = useState(new Date().toISOString().split("T")[0]);
  const [dataFim,         setDataFim]         = useState(new Date().toISOString().split("T")[0]);

  const bg            = isDark ? IEQ.dark    : "#F0EAE8";
  const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing: border-box; }
    @keyframes stripe {
      0%   { background-position: 0 0; }
      100% { background-position: 60px 60px; }
    }
    @keyframes spin  { to { transform: rotate(360deg); } }
    .ieq-bg-rel {
      position:fixed; inset:0; pointer-events:none; z-index:0;
      background: repeating-linear-gradient(
        -55deg,
        ${isDark ? "rgba(200,16,46,.04)" : "rgba(200,16,46,.06)"} 0 10px,
        transparent 10px 20px,
        ${isDark ? "rgba(0,61,165,.03)" : "rgba(0,61,165,.04)"} 20px 30px,
        transparent 30px 40px
      );
      background-size:60px 60px;
      animation: stripe 8s linear infinite;
    }
    .ieq-rel-card {
      background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"};
      border-radius:16px; overflow:hidden; cursor:pointer;
      transition: all .3s;
    }
    .ieq-rel-card:hover { transform:translateY(-4px); box-shadow:0 14px 36px rgba(200,16,46,.12); border-color:${IEQ.red}; }
    .ieq-kpi-card {
      background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"};
      border-radius:16px; padding:20px 22px;
      display:flex; align-items:center; gap:16px;
    }
    .ieq-btn-primary-rel {
      background: linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.red});
      color:#fff; border:none; border-radius:8px;
      font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.16em;
      cursor:pointer; transition:all .25s; padding:12px 20px;
      display:flex; align-items:center; gap:8px;
    }
    .ieq-btn-primary-rel:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-2px); }
    .ieq-btn-primary-rel:disabled { opacity:.5; }
    .ieq-btn-ghost-rel {
      background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};
      color: ${isDark ? IEQ.offWhite : IEQ.redDark};
      border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      border-radius:8px; font-family:'Cinzel',serif; font-size:10px; font-weight:700;
      letter-spacing:.15em; cursor:pointer; transition:all .25s; padding:12px 18px;
      display:flex; align-items:center; gap:8px;
    }
    .ieq-btn-ghost-rel:hover { border-color:${IEQ.red}; }
    .ieq-date-rel {
      background:${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"};
      color:${isDark ? IEQ.offWhite : "#1A0A0D"};
      padding:11px 12px; border-radius:8px; outline:none;
      font-family:'EB Garamond',serif; font-size:14px;
      transition: all .25s; flex:1;
    }
    .ieq-date-rel:focus { border-color:${IEQ.red}; }
    .divider-e { height:1px; background:linear-gradient(90deg,transparent,${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"},transparent); margin:8px 0; }
    .modal-ov-rel {
      position:fixed; inset:0; z-index:50;
      background:rgba(10,6,8,.85); backdrop-filter:blur(16px);
      display:flex; align-items:center; justify-content:center; padding:16px;
    }
    .modal-bx-rel {
      background: ${isDark ? "rgba(17,10,13,.99)" : "rgba(255,255,255,.98)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"};
      border-radius:20px; width:100%; max-width:700px;
      max-height:90vh; display:flex; flex-direction:column; overflow:hidden;
    }
    .decisao-badge {
      display:inline-block; padding:3px 10px; border-radius:99px;
      font-family:'Cinzel',serif; font-size:8px; font-weight:700; letter-spacing:.1em;
      border:1px solid;
    }
    @media (max-width:640px) {
      .rel-grid { grid-template-columns: 1fr !important; }
      .kpi-grid { grid-template-columns: 1fr !important; }
    }
  `;

  const formatarDataLocal = (dataStr) => {
    if (!dataStr) return "?";
    const [ano,mes,dia] = dataStr.split("-").map(Number);
    return new Date(ano, mes-1, dia).toLocaleDateString("pt-BR", { weekday:"short", day:"2-digit", month:"short" });
  };

  const getDecisaoTexto = (d) => ({
    ACEITOU_JESUS:"Novo Convertido", RECONCILIOU:"Reconciliação",
    BATISMO_AGUAS:"Deseja Batismo", NENHUMA:"Nenhuma"
  }[d] || d || "?");

  const getDecisaoCor = (d) => {
    if (d === "ACEITOU_JESUS") return { background:"rgba(22,163,74,.12)", color:"#16a34a", borderColor:"rgba(22,163,74,.3)" };
    if (d === "RECONCILIOU")   return { background:"rgba(14,165,233,.12)", color:"#0ea5e9", borderColor:"rgba(14,165,233,.3)" };
    if (d === "BATISMO_AGUAS") return { background:"rgba(139,92,246,.12)", color:"#8b5cf6", borderColor:"rgba(139,92,246,.3)" };
    return { background:`rgba(200,16,46,.08)`, color:IEQ.redDark, borderColor:"rgba(200,16,46,.2)" };
  };

  const carregarSemanaAtual = () => {
    const hoje = new Date(); const diaSem = hoje.getDay();
    const diff = diaSem === 0 ? 6 : diaSem - 1;
    const seg = new Date(hoje); seg.setDate(hoje.getDate() - diff);
    const dom = new Date(seg); dom.setDate(seg.getDate() + 6);
    setDataInicio(seg.toISOString().split("T")[0]);
    setDataFim(dom.toISOString().split("T")[0]);
  };

  const carregarRelatorios = useCallback(async () => {
    try {
      setLoading(true); setErro(null);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      if (!token) return;
      const res = await api.get(`/relatorios/semana?inicio=${dataInicio}&fim=${dataFim}`,
          { headers: { Authorization:`Bearer ${token}` } });
      setRelatorios(Array.isArray(res.data) ? res.data : res.data?.relatorios || []);
    } catch { setErro("Erro ao buscar dados."); }
    finally { setLoading(false); }
  }, [dataInicio, dataFim]);

  const totais = useMemo(() => relatorios.reduce((acc, rel) => {
    const m = rel.membrosPresentes?.length || 0;
    const v = (rel.visitantesPresentes?.length || 0) + (rel.quantidadeVisitantes || 0);
    return { membros: acc.membros+m, visitantes: acc.visitantes+v, geral: acc.geral+m+v };
  }, { membros:0, visitantes:0, geral:0 }), [relatorios]);

  useEffect(() => { carregarSemanaAtual(); }, []);
  useEffect(() => { carregarRelatorios(); }, [carregarRelatorios]);

  const baixarPDF = () => {
    setBaixandoPDF(true);
    const doc = new jsPDF();
    doc.setFontSize(16); doc.setTextColor(0,36,112);
    doc.text("Relatório Geral de Células", 14, 20);
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text(`Total Membros: ${totais.membros} | Total Visitantes: ${totais.visitantes} | Total Geral: ${totais.geral}`, 14, 28);
    autoTable(doc, {
      startY:34,
      head:[["Célula","Data","Membros","Visitas","Total","Estudo"]],
      body: relatorios.map(rel => [
        rel.nomeCelula,
        new Date(rel.dataReuniao).toLocaleDateString("pt-BR"),
        rel.membrosPresentes?.length || 0,
        (rel.visitantesPresentes?.length || 0)+(rel.quantidadeVisitantes || 0),
        (rel.membrosPresentes?.length || 0)+(rel.visitantesPresentes?.length || 0)+(rel.quantidadeVisitantes || 0),
        rel.estudo || "N/A"
      ]),
      theme:"grid", headStyles:{ fillColor:[0,36,112] }
    });
    doc.save("relatorio-celulas.pdf");
    setBaixandoPDF(false);
  };

  if (loading) return (
      <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:bg }}>
        <style>{globalStyles}</style>
        <QuadrangularCross size={42} />
        <p style={{ fontFamily:"'Cinzel',serif", color:isDark ? IEQ.offWhite : IEQ.redDark, marginTop:16, letterSpacing:".2em", fontSize:11 }}>
          SINCRONIZANDO RELATÓRIOS...
        </p>
        <Loader2 size={24} style={{ color:IEQ.red, marginTop:12, animation:"spin 1s linear infinite" }} />
      </div>
  );

  return (
      <div style={{ minHeight:"100vh", background:bg, color:textPrimary, fontFamily:"'EB Garamond',serif", position:"relative", paddingBottom:60 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg-rel" />

        <div style={{ position:"relative", zIndex:10, maxWidth:1200, margin:"0 auto", padding:"32px 16px 0" }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:32 }}>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <QuadrangularCross size={36} />
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                  <Sparkles size={12} style={{ color:IEQ.yellow }} />
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSecondary, margin:0 }}>
                    GESTÃO DE CRESCIMENTO
                  </p>
                </div>
                <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:700, letterSpacing:".16em", margin:0,
                  background:`linear-gradient(90deg, ${IEQ.redDark}, ${IEQ.red}, ${IEQ.yellow}, ${IEQ.blue})`,
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                  RELATÓRIOS DA REDE
                </h2>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <button className="ieq-btn-ghost-rel" onClick={() => setShowFilters(!showFilters)}>
                <Filter size={14} /> {showFilters ? "OCULTAR" : "FILTRAR"}
              </button>
              <button className="ieq-btn-primary-rel" onClick={baixarPDF} disabled={baixandoPDF || relatorios.length === 0}>
                {baixandoPDF ? <Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} /> : <Download size={14} />}
                EXPORTAR PDF
              </button>
            </div>
          </div>

          <div className="divider-e" style={{ marginBottom:24 }} />

          {/* Filtros */}
          <AnimatePresence>
            {showFilters && (
                <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
                            style={{ overflow:"hidden", marginBottom:24 }}>
                  <div style={{ background:isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)", border:`1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"}`, borderRadius:14, padding:"16px 20px", display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".14em", color:textSecondary }}>DE</span>
                    <input className="ieq-date-rel" type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} style={{ minWidth:140 }} />
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".14em", color:textSecondary }}>ATÉ</span>
                    <input className="ieq-date-rel" type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} style={{ minWidth:140 }} />
                    <button className="ieq-btn-ghost-rel" onClick={carregarSemanaAtual} style={{ whiteSpace:"nowrap" }}>ESTA SEMANA</button>
                    <button className="ieq-btn-primary-rel" onClick={carregarRelatorios}>APLICAR</button>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* KPIs */}
          <div className="kpi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16, marginBottom:28 }}>
            <div className="ieq-kpi-card">
              <div style={{ width:46, height:46, borderRadius:12, background:`rgba(200,16,46,.1)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Users size={22} style={{ color:IEQ.red }} />
              </div>
              <div>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".14em", color:textSecondary, margin:"0 0 2px" }}>TOTAL MEMBROS</p>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:26, fontWeight:700, color:textPrimary, margin:0 }}>{totais.membros}</p>
              </div>
            </div>
            <div className="ieq-kpi-card">
              <div style={{ width:46, height:46, borderRadius:12, background:`rgba(253,184,19,.1)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <UserPlus size={22} style={{ color:IEQ.yellowDark }} />
              </div>
              <div>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".14em", color:textSecondary, margin:"0 0 2px" }}>TOTAL VISITANTES</p>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:26, fontWeight:700, color:textPrimary, margin:0 }}>{totais.visitantes}</p>
              </div>
            </div>
            <div style={{ background:`linear-gradient(135deg, ${IEQ.blueDark}, ${IEQ.blue})`, border:"none", borderRadius:16, padding:"20px 22px", display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ width:46, height:46, borderRadius:12, background:"rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <TrendingUp size={22} style={{ color:"#fff" }} />
              </div>
              <div>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".14em", color:"rgba(255,255,255,.6)", margin:"0 0 2px" }}>TOTAL GERAL</p>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:26, fontWeight:700, color:"#fff", margin:0 }}>{totais.geral}</p>
              </div>
            </div>
          </div>

          {/* Grid relatórios */}
          <div className="rel-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:16 }}>
            {relatorios.map((rel, i) => {
              const m = rel.membrosPresentes?.length || 0;
              const v = (rel.visitantesPresentes?.length || 0) + (rel.quantidadeVisitantes || 0);
              return (
                  <motion.div key={rel.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.04 }}
                              className="ieq-rel-card" onClick={() => { setSelectedRel(rel); setIsModalOpen(true); }}>
                    <div style={{ padding:"20px 20px 0" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                        <div style={{ width:36, height:36, borderRadius:8, background:`rgba(200,16,46,.1)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Calendar size={18} style={{ color:IEQ.red }} />
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".1em", color:textSecondary, margin:"0 0 2px" }}>DATA DA CÉLULA</p>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, fontWeight:500, color:textPrimary, margin:0 }}>{formatarDataLocal(rel.dataReuniao)}</p>
                        </div>
                      </div>
                      <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, letterSpacing:".1em", color:textPrimary, margin:"0 0 8px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {rel.nomeCelula}
                      </h3>
                      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background:isDark ? "rgba(255,255,255,.03)" : "rgba(200,16,46,.05)", borderRadius:8, marginBottom:16 }}>
                        <BookOpen size={12} style={{ color:IEQ.red, flexShrink:0 }} />
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".1em", color:textSecondary, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {rel.estudo || "SEM ESTUDO INFORMADO"}
                        </p>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", borderTop:`1px solid ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.08)"}` }}>
                      {[
                        { label:"MEMBROS",  value:m,   color:textPrimary },
                        { label:"VISITAS",  value:v,   color:IEQ.yellow  },
                        { label:"TOTAL",    value:m+v, color:IEQ.blue    },
                      ].map((kpi, ki) => (
                          <div key={ki} style={{ padding:"12px 10px", textAlign:"center", borderRight: ki < 2 ? `1px solid ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.08)"}` : "none" }}>
                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:18, fontWeight:700, color:kpi.color, margin:0 }}>{kpi.value}</p>
                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:7.5, letterSpacing:".1em", color:textSecondary, margin:"3px 0 0" }}>{kpi.label}</p>
                          </div>
                      ))}
                    </div>
                    <div style={{ padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".12em", color:IEQ.red }}>VER DETALHES</span>
                      <ChevronDown size={13} style={{ color:IEQ.red }} />
                    </div>
                  </motion.div>
              );
            })}
          </div>

          {relatorios.length === 0 && !loading && (
              <div style={{ textAlign:"center", padding:"64px 32px", background:isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)", borderRadius:20, border:`2px dashed ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"}`, marginTop:16 }}>
                <AlertCircle size={40} style={{ color:isDark ? "rgba(200,16,46,.3)" : "rgba(200,16,46,.2)", margin:"0 auto 16px" }} />
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, letterSpacing:".12em", color:textSecondary, margin:0 }}>
                  NENHUM RELATÓRIO ENCONTRADO
                </p>
              </div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && selectedRel && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          className="modal-ov-rel" onClick={() => setIsModalOpen(false)}>
                <motion.div initial={{ scale:.9, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:.9, y:20 }}
                            className="modal-bx-rel" onClick={e => e.stopPropagation()}>
                  {/* Header */}
                  <div style={{ padding:"22px 24px", background:`linear-gradient(135deg, ${IEQ.blueDark}, ${IEQ.blue})`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ width:44, height:44, background:"rgba(255,255,255,.15)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <UserCheck size={22} style={{ color:"#fff" }} />
                      </div>
                      <div>
                        <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:700, letterSpacing:".12em", color:"#fff", margin:"0 0 3px" }}>{selectedRel.nomeCelula}</h3>
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".12em", color:"rgba(255,255,255,.6)", margin:0 }}>
                          {formatarDataLocal(selectedRel.dataReuniao)}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)}
                            style={{ background:"rgba(255,255,255,.15)", border:"none", color:"#fff", padding:10, borderRadius:8, cursor:"pointer" }}>
                      <X size={18} />
                    </button>
                  </div>

                  {/* Conteúdo */}
                  <div style={{ overflowY:"auto", flex:1, padding:"24px" }}>
                    {/* Membros */}
                    <div style={{ marginBottom:28 }}>
                      <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSecondary, margin:"0 0 14px" }}>
                        MEMBROS PRESENTES ({selectedRel.membrosPresentes?.length || 0})
                      </p>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:8 }}>
                        {selectedRel.membrosPresentes?.map((m, i) => (
                            <div key={i} style={{ padding:"10px 14px", background:isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.05)", border:`1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`, borderRadius:8, fontFamily:"'EB Garamond',serif", fontSize:14, fontWeight:500, color:textPrimary }}>
                              {m.nome || m}
                            </div>
                        ))}
                      </div>
                    </div>

                    {/* Visitantes */}
                    {selectedRel.visitantesPresentes?.length > 0 && (
                        <div style={{ marginBottom:28 }}>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:IEQ.yellowDark, margin:"0 0 14px" }}>
                            VISITANTES ({selectedRel.visitantesPresentes.length})
                          </p>
                          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:10 }}>
                            {selectedRel.visitantesPresentes.map((v, i) => (
                                <div key={i} style={{ padding:"12px 14px", background:isDark ? "rgba(253,184,19,.06)" : "rgba(253,184,19,.08)", border:`1px solid rgba(253,184,19,.2)`, borderRadius:10 }}>
                                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, letterSpacing:".08em", color:textPrimary, margin:"0 0 6px" }}>{v.nome}</p>
                                  {v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA" && (
                                      <span className="decisao-badge" style={getDecisaoCor(v.decisaoEspiritual)}>
                              {getDecisaoTexto(v.decisaoEspiritual)}
                            </span>
                                  )}
                                </div>
                            ))}
                          </div>
                        </div>
                    )}

                    {/* Observações */}
                    {selectedRel.observacoes && (
                        <div style={{ padding:"16px 18px", background:isDark ? "rgba(255,255,255,.03)" : "rgba(200,16,46,.05)", border:`1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"}`, borderRadius:12 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                            <MessageSquare size={14} style={{ color:IEQ.red }} />
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".14em", color:IEQ.red }}>OBSERVAÇÕES</span>
                          </div>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:15, fontStyle:"italic", color:textSecondary, margin:0 }}>
                            "{selectedRel.observacoes}"
                          </p>
                        </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
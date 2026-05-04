import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api.js";
import {
  Search, Calendar, Download, X, Users,
  Loader2, ChevronRight, RefreshCw, Filter,
  CheckCircle2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const IEQ = {
  red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
  yellow: "#FDB813", blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
  white: "#FFFFFF", offWhite: "#F5F0E8", dark: "#0A0608",
};

const COLUNAS = [
  { campo: "escolaBiblica", label: "EBD"        },
  { campo: "quartaNoite",   label: "4ª Noite"   },
  { campo: "quintaNoite",   label: "5ª Noite"   },
  { campo: "domingoManha",  label: "Dom. Manhã" },
  { campo: "domingoNoite",  label: "Dom. Noite" },
];

// ✅ Pega o token limpo sempre que precisar
function getToken() {
  return localStorage.getItem("token")?.replace(/"/g, "").trim() || "";
}

function QuadrangularCross({ size = 28 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gVD" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={IEQ.redLight} />
            <stop offset="100%" stopColor={IEQ.redDark}  />
          </linearGradient>
          <linearGradient id="gHD" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={IEQ.blueDark}  />
            <stop offset="50%"  stopColor={IEQ.blueLight} />
            <stop offset="100%" stopColor={IEQ.blueDark}  />
          </linearGradient>
          <filter id="glowD">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gVD)" filter="url(#glowD)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gHD)" filter="url(#glowD)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowD)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

export default function Discipulado({ isDark = false }) {
  const [relatorios,           setRelatorios]           = useState([]);
  const [loading,              setLoading]              = useState(true);
  const [erro,                 setErro]                 = useState(null);
  const [termoBusca,           setTermoBusca]           = useState("");
  const [dataInicioFiltro,     setDataInicioFiltro]     = useState("");
  const [dataFimFiltro,        setDataFimFiltro]        = useState("");
  const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
  const [showFilters,          setShowFilters]          = useState(false);

  const bg          = isDark ? IEQ.dark    : "#F0EAE8";
  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing: border-box; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes stripe {
      0%   { background-position: 0 0; }
      100% { background-position: 60px 60px; }
    }
    .sd-bg {
      position:fixed; inset:0; pointer-events:none; z-index:0;
      background: repeating-linear-gradient(-55deg,
        ${isDark ? "rgba(200,16,46,.04)" : "rgba(200,16,46,.06)"} 0 10px, transparent 10px 20px,
        ${isDark ? "rgba(253,184,19,.03)" : "rgba(253,184,19,.05)"} 20px 30px, transparent 30px 40px);
      background-size:60px 60px; animation: stripe 8s linear infinite;
    }
    .sd-card {
      background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"};
      border-radius:16px; backdrop-filter:blur(24px);
      transition:all .3s; cursor:pointer; overflow:hidden;
    }
    .sd-card:hover { transform:translateY(-4px); box-shadow:0 14px 36px rgba(200,16,46,.12); border-color:${IEQ.red}; }
    .sd-input {
      width:100%; background:${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"};
      color:${isDark ? IEQ.offWhite : "#1A0A0D"};
      padding:12px 14px 12px 44px; border-radius:10px; outline:none;
      font-family:'EB Garamond',serif; font-size:15px; transition:all .25s;
    }
    .sd-input:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.1); }
    .sd-input::placeholder { color:${isDark ? "rgba(245,240,232,.25)" : "rgba(26,10,13,.3)"}; }
    .sd-date {
      background:${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"};
      color:${isDark ? IEQ.offWhite : "#1A0A0D"};
      padding:12px; border-radius:10px; outline:none;
      font-family:'EB Garamond',serif; font-size:14px; transition:all .25s; flex:1;
    }
    .sd-date:focus { border-color:${IEQ.red}; }
    .sd-btn-primary {
      background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red});
      color:#fff; border:none; border-radius:8px;
      font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.16em;
      cursor:pointer; transition:all .25s; padding:12px 20px;
      display:flex; align-items:center; gap:8px;
    }
    .sd-btn-primary:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.1); }
    .sd-btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .sd-btn-ghost {
      background:${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};
      color:${isDark ? IEQ.offWhite : IEQ.redDark};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      border-radius:8px; font-family:'Cinzel',serif; font-size:10px; font-weight:700;
      letter-spacing:.15em; cursor:pointer; transition:all .25s; padding:12px 20px;
      display:flex; align-items:center; gap:8px;
    }
    .sd-btn-ghost:hover { border-color:${IEQ.red}; }
    .sd-divider { height:1px; background:linear-gradient(90deg,transparent,${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"},transparent); margin:8px 0; }
    .sd-modal-overlay {
      position:fixed; inset:0; z-index:50;
      background:rgba(10,6,8,.85); backdrop-filter:blur(16px);
      display:flex; align-items:center; justify-content:center; padding:16px;
    }
    .sd-modal-box {
      background:${isDark ? "rgba(17,10,13,.99)" : "rgba(255,255,255,.98)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"};
      border-radius:20px; width:100%; max-width:860px;
      max-height:90vh; display:flex; flex-direction:column; overflow:hidden;
    }
    .sd-table { width:100%; border-collapse:collapse; }
    .sd-table th {
      font-family:'Cinzel',serif; font-size:9px; font-weight:700; letter-spacing:.14em;
      text-transform:uppercase; padding:14px 16px;
      background:${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.05)"};
      color:${textSec}; text-align:left;
    }
    .sd-table td {
      padding:12px 16px; font-family:'EB Garamond',serif; font-size:14px; color:${textPrimary};
      border-bottom:1px solid ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};
    }
    .sd-table tr:hover td { background:${isDark ? "rgba(200,16,46,.05)" : "rgba(200,16,46,.04)"}; }
    .sd-erro {
      background:#1a0000; border:2px solid #C8102E; border-radius:12px;
      padding:24px; margin-bottom:24px; font-family:monospace; font-size:12px;
      color:#fff; word-break:break-all;
    }
    .sd-erro-row { margin: 6px 0; line-height:1.6; }
    @media (max-width:640px) {
      .sd-grid { grid-template-columns: 1fr !important; }
      .sd-filters-row { flex-direction: column !important; }
    }
  `;

  function obterSemanaAtual() {
    const hoje = new Date();
    const diff = hoje.getDay() === 0 ? -6 : 1 - hoje.getDay();
    const seg  = new Date(hoje); seg.setDate(hoje.getDate() + diff);
    const dom  = new Date(seg);  dom.setDate(seg.getDate() + 6);
    return { inicio: seg.toISOString().split("T")[0], fim: dom.toISOString().split("T")[0] };
  }

  const formatarSemana = (inicio, fim) => {
    if (!inicio || !fim) return "Período indefinido";
    const f = d => { const [,m,dia] = d.split("-"); return `${dia}/${m}`; };
    return `${f(inicio)} → ${f(fim)}`;
  };

  const carregarRelatorios = async () => {
    try {
      setLoading(true);
      setErro(null);

      const res = await api.get("/relatorios/todos-relatorios");

      setRelatorios(res.data || []);
    } catch (e) {
      setErro({
        status: e.response?.status,
        msg: JSON.stringify(e.response?.data),
        url: (e.config?.baseURL || "") + (e.config?.url || ""),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sem = obterSemanaAtual();
    setDataInicioFiltro(sem.inicio);
    setDataFimFiltro(sem.fim);
    carregarRelatorios();
  }, []);

  const filtrados = useMemo(() => relatorios.filter(rel => {
    const b = termoBusca.toLowerCase();
    const ok = !b || rel.nomeLider?.toLowerCase().includes(b) || rel.nomeCelula?.toLowerCase().includes(b);
    let periodo = true;
    if (dataInicioFiltro) periodo = periodo && rel.dataFim   >= dataInicioFiltro;
    if (dataFimFiltro)   periodo = periodo && rel.dataInicio <= dataFimFiltro;
    return ok && periodo;
  }), [relatorios, termoBusca, dataInicioFiltro, dataFimFiltro]);

  const gerarPDFIndividual = (rel) => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.setTextColor(0, 36, 112);
    doc.text(`Relatório: ${rel.nomeCelula}`, 14, 20);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Líder: ${rel.nomeLider}`, 14, 28);
    doc.text(`Período: ${formatarSemana(rel.dataInicio, rel.dataFim)}`, 14, 34);
    autoTable(doc, {
      startY: 40,
      head: [["Membro", "EBD", "4ª Noite", "5ª Noite", "Dom. Manhã", "Dom. Noite"]],
      body: rel.presencas?.map(p => [
        p.nomeMembro,
        p.escolaBiblica ? "Sim" : "Não",
        p.quartaNoite   ? "Sim" : "Não",
        p.quintaNoite   ? "Sim" : "Não",
        p.domingoManha  ? "Sim" : "Não",
        p.domingoNoite  ? "Sim" : "Não",
      ]) || [],
      headStyles: { fillColor: [0, 36, 112] }, theme: "grid", styles: { fontSize: 9 },
    });
    doc.save(`Relatorio_${rel.nomeCelula}_${rel.dataInicio}.pdf`);
  };

  const gerarPDFGeral = () => {
    if (!filtrados.length) return;
    const doc = new jsPDF("l", "mm", "a4");
    doc.setFontSize(16); doc.setTextColor(0, 36, 112);
    doc.text("Relatório Geral de Discipulado", 14, 15);
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text(`Período: ${dataInicioFiltro} até ${dataFimFiltro}`, 14, 22);
    let y = 30;
    filtrados.forEach(rel => {
      if (y > 170) { doc.addPage(); y = 20; }
      doc.setFontSize(11); doc.setTextColor(0, 36, 112);
      doc.text(`${rel.nomeCelula} | Líder: ${rel.nomeLider}`, 14, y);
      autoTable(doc, {
        startY: y + 5,
        head: [["Membro", "EBD", "4ª", "5ª", "Dom.M", "Dom.N"]],
        body: rel.presencas?.map(p => [
          p.nomeMembro,
          p.escolaBiblica ? "✓" : "✗",
          p.quartaNoite   ? "✓" : "✗",
          p.quintaNoite   ? "✓" : "✗",
          p.domingoManha  ? "✓" : "✗",
          p.domingoNoite  ? "✓" : "✗",
        ]) || [],
        headStyles: { fillColor: [0, 36, 112] }, styles: { fontSize: 8 }, margin: { left: 14 },
      });
      y = doc.lastAutoTable.finalY + 14;
    });
    doc.save("Relatorio_Geral_Discipulado.pdf");
  };

  if (loading) return (
      <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:bg }}>
        <style>{css}</style>
        <QuadrangularCross size={42} />
        <p style={{ fontFamily:"'Cinzel',serif", color: isDark ? IEQ.offWhite : IEQ.redDark, marginTop:16, letterSpacing:".2em", fontSize:11 }}>
          SINCRONIZANDO DADOS...
        </p>
        <Loader2 size={24} style={{ color:IEQ.red, marginTop:12, animation:"spin 1s linear infinite" }} />
      </div>
  );

  return (
      <div style={{ minHeight:"100vh", background:bg, color:textPrimary, fontFamily:"'EB Garamond',serif", position:"relative", paddingBottom:60 }}>
        <style>{css}</style>
        <div className="sd-bg" />

        <div style={{ position:"relative", zIndex:10, maxWidth:1200, margin:"0 auto", padding:"32px 16px 0" }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:32 }}>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <QuadrangularCross size={36} />
              <div>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSec, margin:0 }}>CONTROLE E AUDITORIA</p>
                <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:700, letterSpacing:".16em", margin:0,
                  background:`linear-gradient(90deg,${IEQ.redDark},${IEQ.red},${IEQ.yellow},${IEQ.blue})`,
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                  SECRETARIA
                </h1>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <button className="sd-btn-ghost" onClick={() => setShowFilters(!showFilters)}>
                <Filter size={14} /> {showFilters ? "OCULTAR" : "FILTRAR"}
              </button>
              <button className="sd-btn-ghost" onClick={carregarRelatorios}>
                <RefreshCw size={14} /> ATUALIZAR
              </button>
              <button className="sd-btn-primary" onClick={gerarPDFGeral} disabled={!filtrados.length}>
                <Download size={14} /> EXPORTAR PDF
              </button>
            </div>
          </div>

          <div className="sd-divider" style={{ marginBottom:24 }} />

          {/* Painel de erro — agora mostra se o token estava presente */}
          {erro && (
              <div className="sd-erro">
                <p style={{ color:"#ff6666", fontWeight:"bold", margin:"0 0 12px", fontSize:14 }}>
                  ❌ ERRO AO CARREGAR — MANDE ESSE PRINT PARA O SUPORTE
                </p>
                <p className="sd-erro-row">🔴 <b>Status HTTP:</b> {erro.status}</p>
                <p className="sd-erro-row">📋 <b>Resposta do servidor:</b> {erro.msg}</p>
                <p className="sd-erro-row">🌐 <b>URL chamada:</b> {erro.url}</p>
                <p className="sd-erro-row">🔑 <b>Header Authorization enviado:</b> {erro.header}</p>
                <p className="sd-erro-row">🗝️ <b>Token no localStorage:</b> {erro.temToken}</p>
              </div>
          )}

          {/* Filtros */}
          <AnimatePresence>
            {showFilters && (
                <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
                            style={{ overflow:"hidden", marginBottom:24 }}>
                  <div style={{ background: isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)",
                    border:`1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"}`, borderRadius:14, padding:20 }}>
                    <div className="sd-filters-row" style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                      <div style={{ position:"relative", flex:2, minWidth:200 }}>
                        <Search size={14} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.7 }} />
                        <input className="sd-input" placeholder="Pesquisar por líder ou célula..."
                               value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
                      </div>
                      <input className="sd-date" type="date" value={dataInicioFiltro}
                             onChange={e => setDataInicioFiltro(e.target.value)} style={{ minWidth:140 }} />
                      <span style={{ color:textSec, fontFamily:"'Cinzel',serif", fontSize:10 }}>ATÉ</span>
                      <input className="sd-date" type="date" value={dataFimFiltro}
                             onChange={e => setDataFimFiltro(e.target.value)} style={{ minWidth:140 }} />
                      <button className="sd-btn-ghost" onClick={() => {
                        const s = obterSemanaAtual();
                        setDataInicioFiltro(s.inicio);
                        setDataFimFiltro(s.fim);
                        setTermoBusca("");
                      }}>
                        SEMANA ATUAL
                      </button>
                    </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          <div className="sd-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:16 }}>
            {filtrados.map((rel, i) => (
                <motion.div key={rel.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * .04 }}
                            className="sd-card" onClick={() => setRelatorioSelecionado(rel)}>
                  <div style={{ padding:"20px 20px 0" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <span style={{ background:"rgba(200,16,46,.1)", color:IEQ.red, border:"1px solid rgba(200,16,46,.2)",
                    borderRadius:99, padding:"3px 10px", fontFamily:"'Cinzel',serif", fontSize:8, fontWeight:700, letterSpacing:".12em" }}>
                    {rel.nomeCelula}
                  </span>
                      <ChevronRight size={16} style={{ color:textSec }} />
                    </div>
                    <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, letterSpacing:".1em",
                      color:textPrimary, margin:"0 0 8px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {rel.nomeLider}
                    </h3>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                      <Calendar size={12} style={{ color:IEQ.red }} />
                      <span style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSec }}>
                    {formatarSemana(rel.dataInicio, rel.dataFim)}
                  </span>
                    </div>
                  </div>
                  <div style={{ display:"flex", borderTop:`1px solid ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.08)"}` }}>
                    <div style={{ flex:1, padding:14, textAlign:"center", borderRight:`1px solid ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.08)"}` }}>
                      <p style={{ fontFamily:"'Cinzel',serif", fontSize:18, fontWeight:700, color:textPrimary, margin:0 }}>
                        {rel.presencas?.length || 0}
                      </p>
                      <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".1em", color:textSec, margin:"4px 0 0" }}>MEMBROS</p>
                    </div>
                    <div style={{ flex:2, padding:14, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                      <Users size={14} style={{ color:IEQ.red }} />
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".12em", color:IEQ.red }}>VER DETALHES</span>
                    </div>
                  </div>
                </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {!erro && filtrados.length === 0 && (
              <div style={{ textAlign:"center", padding:"64px 32px",
                background: isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)",
                borderRadius:20, border:`1px dashed ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"}`, marginTop:16 }}>
                <AlertCircle size={40} style={{ color: isDark ? "rgba(200,16,46,.3)" : "rgba(200,16,46,.25)", margin:"0 auto 16px" }} />
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, letterSpacing:".12em", color:textSec, margin:0 }}>
                  NENHUM RELATÓRIO ENCONTRADO
                </p>
              </div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {relatorioSelecionado && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          className="sd-modal-overlay" onClick={() => setRelatorioSelecionado(null)}>
                <motion.div initial={{ scale:.9, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:.9, y:20 }}
                            className="sd-modal-box" onClick={e => e.stopPropagation()}>

                  <div style={{ padding:"24px 28px", background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`,
                    display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, letterSpacing:".14em", color:"#fff", margin:"0 0 4px" }}>
                        {relatorioSelecionado.nomeCelula}
                      </h2>
                      <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:"rgba(255,255,255,.7)", margin:0 }}>
                        {relatorioSelecionado.nomeLider} · {formatarSemana(relatorioSelecionado.dataInicio, relatorioSelecionado.dataFim)}
                      </p>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => gerarPDFIndividual(relatorioSelecionado)}
                              style={{ background:"rgba(255,255,255,.15)", border:"none", color:"#fff", padding:"10px 14px",
                                borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", gap:6,
                                fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".12em", fontWeight:700 }}>
                        <Download size={14} /> PDF
                      </button>
                      <button onClick={() => setRelatorioSelecionado(null)}
                              style={{ background:"rgba(255,255,255,.15)", border:"none", color:"#fff", padding:10, borderRadius:8, cursor:"pointer" }}>
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div style={{ overflowY:"auto", flex:1, padding:4 }}>
                    <div style={{ overflowX:"auto" }}>
                      <table className="sd-table">
                        <thead>
                        <tr>
                          <th>MEMBRO</th>
                          {COLUNAS.map(c => <th key={c.campo} style={{ textAlign:"center" }}>{c.label}</th>)}
                        </tr>
                        </thead>
                        <tbody>
                        {relatorioSelecionado.presencas?.map((p, i) => (
                            <tr key={i}>
                              <td>{p.nomeMembro}</td>
                              {COLUNAS.map(col => (
                                  <td key={col.campo} style={{ textAlign:"center" }}>
                                    {p[col.campo]
                                        ? <CheckCircle2 size={18} style={{ color:"#16a34a", margin:"0 auto" }} />
                                        : <X size={16} style={{ color: isDark ? "rgba(255,255,255,.15)" : "rgba(26,10,13,.15)", margin:"0 auto" }} />}
                                  </td>
                              ))}
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
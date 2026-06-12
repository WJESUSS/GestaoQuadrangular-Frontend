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
  { campo: "escolaBiblica", label: "EBD", justField: "justEscolaBiblica" },
  { campo: "quartaNoite",   label: "4ª Noite", justField: "justQuartaNoite" },
  { campo: "quintaNoite",   label: "5ª Noite", justField: "justQuintaNoite" },
  { campo: "domingoManha",  label: "Dom. Manhã", justField: "justDomingoManha" },
  { campo: "domingoNoite",  label: "Dom. Noite", justField: "justDomingoNoite" },
];

const EMOJIS_JUST = { "Trabalho": "💼", "Doença": "🤒", "Viagem": "✈️", "Outro": "📝" };

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

function CelulaPresenca({ membro, coluna, isDark }) {
  const marcado = membro[coluna.campo];
  const justval = membro[coluna.justField];
  const temJust = !marcado && justval;

  return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 2px" }}>
        {marcado ? (
            <CheckCircle2 size={18} style={{ color: "#16a34a" }} />
        ) : (
            <X size={16} style={{ color: isDark ? "rgba(255,255,255,.15)" : "rgba(26,10,13,.15)" }} />
        )}
        {temJust && (
            <div style={{
              fontSize: "9px",
              color: IEQ.yellow,
              fontFamily: "'Cinzel',serif",
              textAlign: "center",
              lineHeight: 1.2,
              padding: "3px 5px",
              background: isDark ? "rgba(253,184,19,.08)" : "rgba(253,184,19,.1)",
              borderRadius: "6px",
              border: "1px solid rgba(253,184,19,.3)",
              maxWidth: "64px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {EMOJIS_JUST[justval] || "📝"} {justval}
            </div>
        )}
      </div>
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

    /* ── MODAL ── */
    .sd-modal-overlay {
      position:fixed; inset:0; z-index:50;
      background:rgba(10,6,8,.85); backdrop-filter:blur(16px);
      display:flex; align-items:flex-end; justify-content:center;
      padding:0;
    }
    .sd-modal-box {
      background:${isDark ? "rgba(17,10,13,.99)" : "rgba(255,255,255,.98)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"};
      border-radius:20px 20px 0 0;
      width:100%; max-width:100%;
      height:92vh; display:flex; flex-direction:column; overflow:hidden;
    }
    .sd-modal-header {
      padding:16px 16px;
      background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red});
      display:flex; justify-content:space-between; align-items:flex-start;
      gap:10px; flex-shrink:0;
    }
    .sd-modal-header-info { flex:1; min-width:0; }
    .sd-modal-header-info h2 {
      font-family:'Cinzel',serif; font-size:14px; font-weight:700;
      letter-spacing:.1em; color:#fff; margin:0 0 4px;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .sd-modal-header-info p {
      font-family:'EB Garamond',serif; font-size:13px;
      color:rgba(255,255,255,.7); margin:0;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .sd-modal-header-actions { display:flex; gap:8px; flex-shrink:0; }
    .sd-modal-body {
      flex:1; overflow-y:auto; overflow-x:hidden;
      -webkit-overflow-scrolling:touch;
    }
    .sd-table-wrapper {
      overflow-x:auto;
      -webkit-overflow-scrolling:touch;
    }

    /* ── TABELA ── */
    .sd-table { width:100%; border-collapse:collapse; min-width:480px; }
    .sd-table th {
      font-family:'Cinzel',serif; font-size:9px; font-weight:700; letter-spacing:.14em;
      text-transform:uppercase; padding:12px 10px;
      background:${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.05)"};
      color:${textSec}; text-align:left; white-space:nowrap;
    }
    .sd-table th.center { text-align:center; }
    .sd-table td {
      padding:8px 10px; font-family:'EB Garamond',serif; font-size:14px; color:${textPrimary};
      border-bottom:1px solid ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};
    }
    .sd-table td.nome {
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
      max-width:120px;
    }
    .sd-table tr:hover td { background:${isDark ? "rgba(200,16,46,.05)" : "rgba(200,16,46,.04)"}; }

    .sd-erro {
      background:#1a0000; border:2px solid #C8102E; border-radius:12px;
      padding:24px; margin-bottom:24px; font-family:monospace; font-size:12px;
      color:#fff; word-break:break-all;
    }
    .sd-erro-row { margin: 6px 0; line-height:1.6; }

    /* ── DRAG INDICATOR ── */
    .sd-drag-bar {
      width:40px; height:4px; border-radius:2px;
      background:rgba(255,255,255,.35); margin:10px auto 6px; flex-shrink:0;
    }

    @media (min-width:640px) {
      .sd-modal-overlay {
        align-items:center;
        padding:16px;
      }
      .sd-modal-box {
        border-radius:20px;
        max-width:860px;
        height:auto;
        max-height:90vh;
      }
      .sd-drag-bar { display:none; }
      .sd-modal-header { padding:20px 24px; }
      .sd-modal-header-info h2 { font-size:16px; }
      .sd-table th { padding:14px 14px; }
      .sd-table td { padding:12px 14px; }
      .sd-table td.nome { max-width:none; }
    }

    @media (max-width:640px) {
      .sd-grid { grid-template-columns: 1fr !important; }
      .sd-filters-row { flex-direction: column !important; }
      .sd-btn-ghost, .sd-btn-primary { padding:10px 14px; font-size:9px; }
    }
  `;

  function obterSemanaAtual() {
    const hoje    = new Date();
    const domingo = new Date(hoje);
    domingo.setDate(hoje.getDate() - hoje.getDay());
    const sabado  = new Date(domingo);
    sabado.setDate(domingo.getDate() + 6);
    return {
      inicio: domingo.toISOString().split("T")[0],
      fim:    sabado.toISOString().split("T")[0],
    };
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
    const b  = termoBusca.toLowerCase();
    const ok = !b || rel.nomeLider?.toLowerCase().includes(b) || rel.nomeCelula?.toLowerCase().includes(b);
    let periodo = true;
    if (dataInicioFiltro) periodo = periodo && rel.dataFim   >= dataInicioFiltro;
    if (dataFimFiltro)   periodo = periodo && rel.dataInicio <= dataFimFiltro;
    return ok && periodo;
  }), [relatorios, termoBusca, dataInicioFiltro, dataFimFiltro]);

  // ── PDF INDIVIDUAL ──────────────────────────────────────────────────────────
  const gerarPDFIndividual = (rel) => {
    const doc = new jsPDF();
    doc.setFillColor(139, 11, 31);
    doc.rect(0, 0, 210, 36, "F");
    doc.setFontSize(16); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
    doc.text("IEQ PITUACU - RELATORIO DE DISCIPULADO", 14, 14);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Celula: ${rel.nomeCelula}  |  Lider: ${rel.nomeLider}`, 14, 22);
    doc.text(`Periodo: ${formatarSemana(rel.dataInicio, rel.dataFim)}`, 14, 29);
    doc.setTextColor(0); doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("LISTA DE PRESENCAS E JUSTIFICATIVAS:", 14, 44);

    const corposTabela = rel.presencas?.map(p => {
      const row = [p.nomeMembro];
      COLUNAS.forEach(col => {
        const marcado = !!p[col.campo];
        const just    = p[col.justField] && String(p[col.justField]).trim();
        if (marcado)        row.push("P");
        else if (just)      row.push(`F (${just})`);
        else                row.push("F");
      });
      row.push(`${COLUNAS.filter(c => !!p[c.campo]).length}/${COLUNAS.length}`);
      return row;
    }) || [];

    autoTable(doc, {
      startY: 48,
      head: [["Membro", ...COLUNAS.map(c => c.label), "Total"]],
      body: corposTabela,
      headStyles: { fillColor: [139, 11, 31], textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        1: { halign: "center" }, 2: { halign: "center" }, 3: { halign: "center" },
        4: { halign: "center" }, 5: { halign: "center" }, 6: { halign: "center", fontStyle: "bold" },
      },
      theme: "grid", margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index > 0 && data.column.index < 6) {
          const val = data.cell.raw;
          if (val === "P") {
            data.cell.styles.textColor = [22, 163, 74];   // verde
            data.cell.styles.fontStyle = "bold";
          } else if (typeof val === "string" && val.startsWith("F (")) {
            data.cell.styles.textColor = [234, 179, 8];   // amarelo
          } else if (val === "F") {
            data.cell.styles.textColor = [200, 16, 46];   // vermelho
          }
        }
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7); doc.setTextColor(150); doc.setFont("helvetica", "normal");
      doc.text(`IEQ Pituacu - Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 290);
      doc.text(`Pagina ${i} de ${pageCount}`, 185, 290, { align: "right" });
    }
    doc.save(`Relatorio_${rel.nomeCelula}_${rel.dataInicio}.pdf`);
  };

  // ── PDF GERAL ───────────────────────────────────────────────────────────────
  const gerarPDFGeral = () => {
    if (!filtrados.length) return;
    const doc = new jsPDF("l", "mm", "a4");
    doc.setFillColor(139, 11, 31);
    doc.rect(0, 0, 297, 40, "F");
    doc.setFontSize(18); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
    doc.text("IEQ PITUACU - RELATORIO GERAL DE DISCIPULADO", 14, 16);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Periodo: ${formatarSemana(dataInicioFiltro, dataFimFiltro)}  |  Total de celulas: ${filtrados.length}`, 14, 26);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} as ${new Date().toLocaleTimeString("pt-BR")}`, 14, 33);

    let y = 50;
    filtrados.forEach((rel, idx) => {
      if (y > 170) { doc.addPage(); y = 20; }
      doc.setFillColor(0, 36, 112);
      doc.roundedRect(14, y - 4, 269, 10, 2, 2, "F");
      doc.setFontSize(10); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${rel.nomeCelula}  |  Lider: ${rel.nomeLider}`, 17, y + 3);

      const corposTabela = rel.presencas?.map(p => {
        const row = [p.nomeMembro];
        COLUNAS.forEach(col => {
          const marcado = !!p[col.campo];
          const just    = p[col.justField] && String(p[col.justField]).trim();
          if (marcado)        row.push("P");
          else if (just)      row.push(`F (${just})`);
          else                row.push("F");
        });
        row.push(`${COLUNAS.filter(c => !!p[c.campo]).length}/${COLUNAS.length}`);
        return row;
      }) || [];

      autoTable(doc, {
        startY: y + 8,
        head: [["Membro", ...COLUNAS.map(c => c.label.substring(0, 6)), "Total"]],
        body: corposTabela,
        headStyles: { fillColor: [139, 11, 31], textColor: 255, fontSize: 7, fontStyle: "bold" },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          1: { halign: "center" }, 2: { halign: "center" }, 3: { halign: "center" },
          4: { halign: "center" }, 5: { halign: "center" }, 6: { halign: "center", fontStyle: "bold" },
        },
        theme: "grid", margin: { left: 14, right: 14 },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index > 0 && data.column.index < 6) {
            const val = data.cell.raw;
            if (val === "P") {
              data.cell.styles.textColor = [22, 163, 74];
              data.cell.styles.fontStyle = "bold";
            } else if (typeof val === "string" && val.startsWith("F (")) {
              data.cell.styles.textColor = [234, 179, 8];
            } else if (val === "F") {
              data.cell.styles.textColor = [200, 16, 46];
            }
          }
        },
      });
      y = doc.lastAutoTable.finalY + 14;
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7); doc.setTextColor(150); doc.setFont("helvetica", "normal");
      doc.text(`IEQ Pituacu - Relatorio Geral`, 14, 205);
      doc.text(`Pagina ${i} de ${pageCount}`, 283, 205, { align: "right" });
    }
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

          {erro && (
              <div className="sd-erro">
                <p style={{ color:"#ff6666", fontWeight:"bold", margin:"0 0 12px", fontSize:14 }}>
                  ERRO AO CARREGAR RELATÓRIOS
                </p>
                <p className="sd-erro-row"><strong>Status:</strong> {erro.status}</p>
                <p className="sd-erro-row"><strong>Resposta:</strong> {erro.msg}</p>
                <p className="sd-erro-row"><strong>URL:</strong> {erro.url}</p>
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

        {/* ── MODAL RESPONSIVO ── */}
        <AnimatePresence>
          {relatorioSelecionado && (
              <motion.div
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  className="sd-modal-overlay"
                  onClick={() => setRelatorioSelecionado(null)}
              >
                <motion.div
                    initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="sd-modal-box"
                    onClick={e => e.stopPropagation()}
                >
                  {/* Drag bar (só aparece no mobile) */}
                  <div className="sd-drag-bar" />

                  {/* Header */}
                  <div className="sd-modal-header">
                    <div className="sd-modal-header-info">
                      <h2>{relatorioSelecionado.nomeCelula}</h2>
                      <p>{relatorioSelecionado.nomeLider} · {formatarSemana(relatorioSelecionado.dataInicio, relatorioSelecionado.dataFim)}</p>
                    </div>
                    <div className="sd-modal-header-actions">
                      <button
                          onClick={() => gerarPDFIndividual(relatorioSelecionado)}
                          style={{ background:"rgba(255,255,255,.15)", border:"none", color:"#fff", padding:"10px 14px",
                            borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", gap:6,
                            fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".12em", fontWeight:700,
                            whiteSpace:"nowrap" }}>
                        <Download size={14} /> PDF
                      </button>
                      <button
                          onClick={() => setRelatorioSelecionado(null)}
                          style={{ background:"rgba(255,255,255,.15)", border:"none", color:"#fff", padding:10, borderRadius:8, cursor:"pointer", flexShrink:0 }}>
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Body com tabela scrollável */}
                  <div className="sd-modal-body">
                    <div className="sd-table-wrapper">
                      <table className="sd-table">
                        <thead>
                        <tr>
                          <th>MEMBRO</th>
                          {COLUNAS.map(c => (
                              <th key={c.campo} className="center">{c.label}</th>
                          ))}
                        </tr>
                        </thead>
                        <tbody>
                        {relatorioSelecionado.presencas?.map((p, i) => (
                            <tr key={i}>
                              <td className="nome">{p.nomeMembro}</td>
                              {COLUNAS.map(col => (
                                  <td key={col.campo} style={{ textAlign:"center", padding:"4px 6px" }}>
                                    <CelulaPresenca membro={p} coluna={col} isDark={isDark} />
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
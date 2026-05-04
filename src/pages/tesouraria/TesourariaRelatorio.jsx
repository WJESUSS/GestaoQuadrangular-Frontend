import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileDown, Filter, Calendar, Trophy, Medal,
  Award, Users, Loader2, TrendingUp, ChevronRight,
  PieChart, DownloadCloud
} from "lucide-react";

const C = {
  red:"#C8102E", redDark:"#8B0B1F", yellow:"#FDB813", yellowDark:"#C48C00",
  blue:"#003DA5", blueDark:"#002470", blueLight:"#1A56C4",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  * { box-sizing: border-box; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes shine  { from {transform:translateX(-100%)} to {transform:translateX(100%)} }

  .tr-root { animation: fadeUp .5s ease; }

  .tr-ieq-card {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(200,16,46,.12);
    border-radius: 14px; backdrop-filter: blur(24px);
    padding: 24px 20px; position:relative; overflow:hidden;
    transition: all .25s;
  }
  .tr-ieq-card:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(200,16,46,.1); }
  .tr-ieq-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background: var(--accent, #C8102E);
  }

  .tr-filter-bar {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(200,16,46,.12);
    border-radius: 14px; backdrop-filter: blur(24px);
    padding: 18px 20px; margin-bottom: 20px;
    display:flex; flex-direction:column; gap:12px;
  }

  .tr-ieq-select {
    background: rgba(200,16,46,.04); border: 1px solid rgba(200,16,46,.16);
    color: #1A0A0D; padding:11px 14px; border-radius:8px; outline:none;
    font-family:'EB Garamond',serif; font-size:14px; transition:all .25s;
    cursor:pointer; appearance:none; -webkit-appearance:none;
  }
  .tr-ieq-select:focus { border-color:#C8102E; box-shadow:0 0 0 3px rgba(200,16,46,.1); }

  .tr-ieq-number {
    background: rgba(200,16,46,.04); border: 1px solid rgba(200,16,46,.16);
    color: #1A0A0D; padding:11px 14px; border-radius:8px; outline:none;
    font-family:'Cinzel',serif; font-size:13px; font-weight:700;
    width:88px; text-align:center; -moz-appearance:textfield;
    transition:all .25s;
  }
  .tr-ieq-number::-webkit-inner-spin-button { -webkit-appearance:none; }
  .tr-ieq-number:focus { border-color:#C8102E; box-shadow:0 0 0 3px rgba(200,16,46,.1); }

  .tr-btn-filter {
    background: linear-gradient(135deg, #002470, #003DA5);
    color:#fff; border:none; border-radius:8px; padding:11px 14px;
    cursor:pointer; transition:all .25s; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
  }
  .tr-btn-filter:hover { filter:brightness(1.1); }
  .tr-btn-filter:disabled { opacity:.5; cursor:not-allowed; }

  .tr-btn-pdf {
    background: linear-gradient(135deg, #8B0B1F, #C8102E);
    color:#fff; border:none; border-radius:10px;
    font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.18em;
    cursor:pointer; transition:all .3s; padding:14px 22px;
    display:flex; align-items:center; gap:10px; position:relative; overflow:hidden;
  }
  .tr-btn-pdf:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.1); }
  .tr-btn-pdf:disabled { opacity:.3; cursor:not-allowed; }
  .tr-btn-pdf .shine2 {
    position:absolute; inset:0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent);
    animation: shine 2.5s ease infinite;
  }

  .tr-tab-bar {
    display:flex; background:rgba(200,16,46,.06); padding:5px; border-radius:10px;
    border:1px solid rgba(200,16,46,.12); overflow-x:auto; gap:4px;
    scrollbar-width:none;
  }
  .tr-tab-bar::-webkit-scrollbar { display:none; }
  .tr-tab-btn {
    padding:9px 18px; border-radius:8px; border:none;
    font-family:'Cinzel',serif; font-size:9px; font-weight:700; letter-spacing:.16em;
    text-transform:uppercase; cursor:pointer; transition:all .25s; white-space:nowrap; flex-shrink:0;
  }
  .tr-tab-btn.active  { background:linear-gradient(135deg,#8B0B1F,#C8102E); color:#fff; box-shadow:0 4px 12px rgba(200,16,46,.25); }
  .tr-tab-btn.inactive{ background:transparent; color:rgba(26,10,13,.4); }
  .tr-tab-btn.inactive:hover{ background:rgba(200,16,46,.1); color:#8B0B1F; }

  /* Stat cards */
  .tr-stats-grid { display:grid; grid-template-columns:1fr; gap:12px; margin-bottom:20px; }
  @media (min-width:480px) { .tr-stats-grid { grid-template-columns:repeat(3,1fr); } }

  /* Table */
  .tr-table-wrap {
    background: rgba(255,255,255,.92); border: 1px solid rgba(200,16,46,.12);
    border-radius: 14px; overflow:hidden; backdrop-filter:blur(24px);
  }
  .tr-table { width:100%; border-collapse:collapse; min-width:480px; }
  .tr-table thead tr { background: rgba(200,16,46,.04); }
  .tr-table th {
    padding:14px 16px; font-family:'Cinzel',serif;
    font-size:9px; font-weight:700; letter-spacing:.18em;
    text-transform:uppercase; color:rgba(26,10,13,.4); text-align:left; white-space:nowrap;
  }
  .tr-table th:last-child { text-align:right; }
  .tr-table td { padding:13px 16px; border-top:1px solid rgba(200,16,46,.07); }
  @media (min-width:640px) { .tr-table th, .tr-table td { padding:16px 22px; } }
  .tr-table tbody tr { transition:background .15s; }
  .tr-table tbody tr:hover { background:rgba(200,16,46,.04); }

  .tr-badge {
    padding:4px 12px; border-radius:99px; border:1px solid;
    font-family:'Cinzel',serif; font-size:8.5px; font-weight:700;
    letter-spacing:.18em; text-transform:uppercase; white-space:nowrap;
  }

  .spin-tr { animation: spin 1s linear infinite; }

  /* header row */
  .tr-header-row {
    display:flex; flex-direction:column; gap:16px; margin-bottom:24px;
  }
  @media (min-width:520px) {
    .tr-header-row { flex-direction:row; align-items:flex-end; justify-content:space-between; }
  }

  /* filter row */
  .tr-filter-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
`;

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function TesourariaRelatorio() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [mes, setMes]             = useState(new Date().getMonth() + 1);
  const [ano, setAno]             = useState(new Date().getFullYear());
  const [cat, setCat]             = useState("TODOS");

  const carregar = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tesouraria/relatorio-tesouraria", { params:{ mes, ano } });
      setRegistros((res.data || {}).registros || []);
    } catch { setRegistros([]); }
    finally { setTimeout(() => setLoading(false), 500); }
  };

  useEffect(() => { carregar(); }, []);

  const filtrados   = registros.filter(r => cat === "TODOS" || r.tipoOferta?.toUpperCase() === cat);
  const totalDizimo = filtrados.reduce((a, r) => a + (r.valorDizimo ?? 0), 0);
  const totalOferta = filtrados.reduce((a, r) => a + (r.valorOferta  ?? 0), 0);
  const total       = totalDizimo + totalOferta;

  const fmt = (v) => Number(v ?? 0).toLocaleString("pt-BR", { minimumFractionDigits:2 });

  const exportarPDF = () => {
    const doc = new jsPDF();
    const titulo = cat === "TODOS" ? "Geral" : `Categoria ${cat}`;
    doc.setFontSize(18); doc.setTextColor(26,10,13);
    doc.text("IEQ – RELATÓRIO FINANCEIRO", 14, 20);
    doc.setFontSize(9); doc.setTextColor(100,100,100);
    doc.text(`${titulo.toUpperCase()} | EMITIDO EM: ${new Date().toLocaleDateString("pt-BR")}`, 14, 28);
    autoTable(doc, {
      head:[["Membro","Nível","Dízimo (R$)","Oferta (R$)","Data"]],
      body: filtrados.map(r => [
        r.membroNome, r.tipoOferta || "Padrão",
        fmt(r.valorDizimo), fmt(r.valorOferta),
        r.dataLancamento ? new Date(r.dataLancamento).toLocaleDateString("pt-BR") : "-"
      ]),
      startY:36,
      styles:{ font:"helvetica", fontSize:9, cellPadding:5 },
      headStyles:{ fillColor:[139,11,31], fontStyle:"bold", fontSize:9 },
      alternateRowStyles:{ fillColor:[250,248,248] },
    });
    const fY = doc.lastAutoTable.finalY + 14;
    doc.setFontSize(11); doc.setTextColor(26,10,13);
    doc.text(`TOTAL DO PERÍODO: R$ ${fmt(total)}`, 14, fY);
    doc.save(`IEQ_Relatorio_${cat}_${MESES[mes-1]}.pdf`);
  };

  return (
      <>
        <style>{CSS}</style>
        <div className="tr-root" style={{ maxWidth:1100, margin:"0 auto", padding:"16px 4px" }}>

          {/* HEADER */}
          <div className="tr-header-row">
            <div>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".22em", textTransform:"uppercase", color:C.red, fontWeight:700, marginBottom:6 }}>
                INTELIGÊNCIA FINANCEIRA
              </p>
              <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:700, color:"#1A0A0D", margin:"0 0 4px", lineHeight:1.1 }}>
                Análise
              </h2>
              <p style={{ fontFamily:"'EB Garamond',serif", fontSize:15, color:"rgba(26,10,13,.5)", margin:0 }}>
                Detalhamento de dízimos e ofertas por categoria.
              </p>
            </div>
            <button className="tr-btn-pdf" onClick={exportarPDF} disabled={loading || filtrados.length === 0}>
              <span className="shine2" />
              <DownloadCloud size={16}/> EXPORTAR PDF EXECUTIVO
            </button>
          </div>

          {/* FILTER BAR */}
          <div className="tr-filter-bar">
            <div className="tr-filter-row">
              <select className="tr-ieq-select" style={{ flex:1, minWidth:120 }} value={mes} onChange={e => setMes(Number(e.target.value))}>
                {MESES.map((n,i) => <option key={i} value={i+1}>{n}</option>)}
              </select>
              <input type="number" className="tr-ieq-number" value={ano} onChange={e => setAno(Number(e.target.value))} style={{ MozAppearance:"textfield" }} />
              <button className="tr-btn-filter" onClick={carregar} disabled={loading}>
                {loading ? <Loader2 size={17} className="spin-tr"/> : <Filter size={17}/>}
              </button>
            </div>
            <div className="tr-tab-bar">
              {[["Geral","TODOS"],["Ouro","OURO"],["Prata","PRATA"],["Bronze","BRONZE"]].map(([label,val]) => (
                  <button key={val} className={`tr-tab-btn ${cat===val?"active":"inactive"}`} onClick={() => setCat(val)}>{label}</button>
              ))}
            </div>
          </div>

          {/* STATS */}
          <div className="tr-stats-grid">
            <StatCard title="Dízimos"      valor={totalDizimo} accent={C.blue}       icon={<Users size={16}/>}  trend="+12%" />
            <StatCard title="Ofertas"      valor={totalOferta} accent={C.yellowDark} icon={<Trophy size={16}/>} trend="+5%" />
            <StatCard title="Volume Total" valor={total}       accent={C.red}        icon={<Award size={16}/>}  trend="Consolidado" />
          </div>

          {/* TABLE */}
          <div className="tr-table-wrap">
            <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
              <table className="tr-table">
                <thead>
                <tr>
                  <th>Membro</th><th>Nível</th><th>Dízimo</th><th>Oferta</th><th>Data</th>
                </tr>
                </thead>
                <tbody>
                {loading ? (
                    <tr><td colSpan={5} style={{ padding:"60px 0", textAlign:"center" }}>
                      <Loader2 size={28} className="spin-tr" style={{ color:C.red, margin:"0 auto 12px", display:"block" }}/>
                      <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:"rgba(26,10,13,.35)" }}>SINCRONIZANDO DADOS...</p>
                    </td></tr>
                ) : filtrados.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding:"60px 0", textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:"rgba(26,10,13,.35)" }}>
                      Nenhum registro para {MESES[mes-1]}
                    </td></tr>
                ) : filtrados.map((r,i) => (
                    <tr key={i}>
                      <td style={{ fontFamily:"'EB Garamond',serif", fontSize:15, color:"#1A0A0D", fontWeight:500 }}>{r.membroNome}</td>
                      <td><TrBadge tipo={r.tipoOferta}/></td>
                      <td style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, color:C.blue, whiteSpace:"nowrap" }}>
                        R$ {fmt(r.valorDizimo)}
                      </td>
                      <td style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, color:C.yellowDark, whiteSpace:"nowrap" }}>
                        R$ {fmt(r.valorOferta)}
                      </td>
                      <td style={{ textAlign:"right" }}>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".1em", color:"rgba(26,10,13,.4)" }}>
                        {r.dataLancamento ? new Date(r.dataLancamento).toLocaleDateString("pt-BR") : "–"}
                      </span>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
  );
}

function StatCard({ title, valor, accent, icon, trend }) {
  const fmt = v => Number(v??0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  return (
      <div className="tr-ieq-card" style={{ "--accent":accent }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ width:34, height:34, borderRadius:8, background:`${accent}15`, display:"flex", alignItems:"center", justifyContent:"center", color:accent }}>
            {icon}
          </div>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".12em", fontWeight:700, padding:"4px 10px", background:"rgba(200,16,46,.07)", borderRadius:99, color:"rgba(26,10,13,.4)" }}>
          {trend}
        </span>
        </div>
        <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:"rgba(26,10,13,.4)", margin:"0 0 6px" }}>{title}</p>
        <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1rem,2.8vw,1.35rem)", fontWeight:700, color:"#1A0A0D", margin:0, wordBreak:"break-word" }}>
          {fmt(valor)}
        </h3>
      </div>
  );
}

function TrBadge({ tipo }) {
  const map = {
    OURO:   { color:C.yellowDark, bg:"rgba(196,140,0,.1)",  border:"rgba(196,140,0,.3)"  },
    PRATA:  { color:"#64748b",    bg:"rgba(100,116,139,.1)", border:"rgba(100,116,139,.3)" },
    BRONZE: { color:"#c2410c",    bg:"rgba(194,65,12,.1)",  border:"rgba(194,65,12,.3)"  },
  };
  const s = map[(tipo||"").toUpperCase()] || { color:"rgba(26,10,13,.4)", bg:"rgba(26,10,13,.05)", border:"rgba(26,10,13,.15)" };
  return (
      <span className="tr-badge" style={{ color:s.color, background:s.bg, borderColor:s.border }}>
      {(tipo || "PADRÃO").toUpperCase()}
    </span>
  );
}
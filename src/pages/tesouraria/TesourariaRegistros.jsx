import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import {
  CalendarDays, ChevronLeft, ChevronRight,
  RefreshCcw, Search, FileSpreadsheet, Coins, Database
} from "lucide-react";

const C = {
  red:"#C8102E", redDark:"#8B0B1F", yellow:"#FDB813", yellowDark:"#C48C00",
  blue:"#003DA5", blueDark:"#002470", blueLight:"#1A56C4",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  * { box-sizing: border-box; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.45} }
  @keyframes spin   { to { transform:rotate(360deg); } }

  .rm-root { animation: fadeUp .5s ease; }

  .rm-ieq-card {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(200,16,46,.12);
    border-radius: 14px; backdrop-filter: blur(24px);
    overflow: hidden;
  }

  .rm-controls {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(200,16,46,.12);
    border-radius: 14px; backdrop-filter: blur(24px);
    padding: 14px 18px; margin-bottom: 18px;
    display:flex; flex-wrap:wrap; align-items:center; gap:12px;
  }

  .rm-month-pill {
    display:flex; align-items:center; gap:4px;
    background:rgba(200,16,46,.06); border:1px solid rgba(200,16,46,.14);
    border-radius:8px; padding:6px 6px; flex-shrink:0;
  }
  .rm-month-btn {
    background:none; border:none; cursor:pointer; padding:6px;
    border-radius:6px; color:rgba(26,10,13,.45); transition:all .2s;
    display:flex; align-items:center;
  }
  .rm-month-btn:hover { background:rgba(200,16,46,.1); color:#C8102E; }
  .rm-month-label {
    font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.16em;
    text-transform:uppercase; color:#1A0A0D; min-width:110px; text-align:center;
  }

  .rm-year-select {
    background:rgba(200,16,46,.04); border:1px solid rgba(200,16,46,.14);
    color:#1A0A0D; padding:10px 14px; border-radius:8px; outline:none;
    font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.12em;
    cursor:pointer; appearance:none; -webkit-appearance:none; flex-shrink:0;
  }
  .rm-year-select:focus { border-color:#C8102E; box-shadow:0 0 0 3px rgba(200,16,46,.1); }

  .rm-search-wrap { position:relative; flex:1; min-width:200px; }
  .rm-search-icon {
    position:absolute; left:12px; top:50%; transform:translateY(-50%);
    color:rgba(200,16,46,.5); pointer-events:none;
  }
  .rm-search {
    width:100%;
    background:rgba(200,16,46,.03); border:1px solid rgba(200,16,46,.14);
    color:#1A0A0D; padding:10px 14px 10px 38px; border-radius:8px; outline:none;
    font-family:'EB Garamond',serif; font-size:15px; transition:all .25s;
  }
  .rm-search:focus { border-color:#C8102E; box-shadow:0 0 0 3px rgba(200,16,46,.1); }
  .rm-search::placeholder { color:rgba(26,10,13,.3); }

  .rm-refresh-btn {
    background:rgba(200,16,46,.06); border:1px solid rgba(200,16,46,.14);
    color:rgba(26,10,13,.5); border-radius:8px; padding:10px;
    cursor:pointer; transition:all .3s; display:flex; flex-shrink:0;
  }
  .rm-refresh-btn:hover { background:linear-gradient(135deg,#8B0B1F,#C8102E); color:#fff; border-color:transparent; }
  .rm-refresh-btn.spinning { animation: spin .5s linear infinite; }

  /* Table */
  .rm-table { width:100%; border-collapse:collapse; min-width:540px; }
  .rm-table thead tr { background: rgba(200,16,46,.04); }
  .rm-table th {
    padding:14px 16px; font-family:'Cinzel',serif;
    font-size:9px; font-weight:700; letter-spacing:.18em;
    text-transform:uppercase; color:rgba(26,10,13,.4); text-align:left; white-space:nowrap;
  }
  .rm-table th:last-child { text-align:right; }
  .rm-table td { padding:13px 16px; border-top:1px solid rgba(200,16,46,.07); }
  @media (min-width:640px) { .rm-table th, .rm-table td { padding:16px 22px; } }
  .rm-table tbody tr { transition:background .15s; }
  .rm-table tbody tr:hover { background:rgba(200,16,46,.04); }

  .rm-avatar {
    width:32px; height:32px; border-radius:7px; flex-shrink:0;
    background:linear-gradient(135deg,#8B0B1F,#003DA5);
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-family:'Cinzel',serif; font-weight:700; font-size:12px;
  }

  .rm-badge {
    padding:4px 12px; border-radius:99px; border:1px solid;
    font-family:'Cinzel',serif; font-size:8.5px; font-weight:700;
    letter-spacing:.16em; text-transform:uppercase; white-space:nowrap;
  }

  .rm-date-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:5px 10px; border-radius:7px;
    background:rgba(200,16,46,.06); border:1px solid rgba(200,16,46,.1);
    font-family:'Cinzel',serif; font-size:9px; letter-spacing:.1em; color:rgba(26,10,13,.5);
  }

  .rm-error {
    background:rgba(200,16,46,.06); border:1px solid rgba(200,16,46,.18);
    color:#8B0B1F; padding:14px 16px; border-radius:10px;
    font-family:'EB Garamond',serif; font-size:14px; margin-bottom:16px;
    display:flex; align-items:center; gap:10px;
  }

  /* header row */
  .rm-header-row {
    display:flex; flex-direction:column; gap:14px; margin-bottom:22px;
  }
  @media (min-width:520px) {
    .rm-header-row { flex-direction:row; align-items:flex-end; justify-content:space-between; }
  }

  .rm-skel { animation: pulse 1.5s ease infinite; }
  .rm-skel-block { background:rgba(200,16,46,.08); border-radius:10px; }
`;

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function TesourariaRegistrosMensal() {
  const hoje = new Date();
  const [mes,       setMes]       = useState(hoje.getMonth() + 1);
  const [ano,       setAno]       = useState(hoje.getFullYear());
  const [registros, setRegistros] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState(null);
  const [filtro,    setFiltro]    = useState("");
  const [spinning,  setSpinning]  = useState(false);

  const anos = Array.from({ length:5 }, (_, i) => hoje.getFullYear() - i);

  const carregar = useCallback(async () => {
    try {
      setLoading(true); setErro(null); setSpinning(true);
      const res = await api.get("/tesouraria/relatorio-tesouraria", { params:{ mes, ano } });
      setRegistros((res.data || {}).registros || []);
    } catch { setErro("Falha na sincronização com o servidor."); }
    finally { setTimeout(() => { setLoading(false); setSpinning(false); }, 600); }
  }, [mes, ano]);

  useEffect(() => { carregar(); }, [carregar]);

  const filtrados = registros.filter(r => r.membroNome?.toLowerCase().includes(filtro.toLowerCase()));
  const fmt = v => Number(v ?? 0).toLocaleString("pt-BR", { minimumFractionDigits:2 });

  if (loading) return (
      <>
        <style>{CSS}</style>
        <div className="rm-skel" style={{ padding:20 }}>
          <div className="rm-skel-block" style={{ height:48, width:"45%", marginBottom:22 }}/>
          <div className="rm-skel-block" style={{ height:64, borderRadius:14, marginBottom:16 }}/>
          <div className="rm-skel-block" style={{ height:400, borderRadius:14 }}/>
        </div>
      </>
  );

  return (
      <>
        <style>{CSS}</style>
        <div className="rm-root" style={{ maxWidth:1100, margin:"0 auto", padding:"16px 4px" }}>

          {/* HEADER */}
          <div className="rm-header-row">
            <div>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".22em", textTransform:"uppercase", color:C.red, fontWeight:700, marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
                <Database size={11}/> HISTÓRICO DE LANÇAMENTOS
              </p>
              <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:700, color:"#1A0A0D", margin:0, lineHeight:1.1 }}>
                Registros
              </h2>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <div className="rm-search-wrap">
                <Search size={15} className="rm-search-icon"/>
                <input type="text" className="rm-search" placeholder="Filtrar por nome..." value={filtro} onChange={e => setFiltro(e.target.value)}/>
              </div>
              <button className={`rm-refresh-btn ${spinning ? "spinning" : ""}`} onClick={carregar}>
                <RefreshCcw size={17}/>
              </button>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="rm-controls">
            <div className="rm-month-pill">
              <button className="rm-month-btn" onClick={() => setMes(p => p === 1 ? 12 : p-1)}><ChevronLeft size={16}/></button>
              <span className="rm-month-label">{MESES[mes-1]}</span>
              <button className="rm-month-btn" onClick={() => setMes(p => p === 12 ? 1 : p+1)}><ChevronRight size={16}/></button>
            </div>

            <select className="rm-year-select" value={ano} onChange={e => setAno(Number(e.target.value))}>
              {anos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".16em", textTransform:"uppercase", color:"rgba(26,10,13,.4)" }}>
              <FileSpreadsheet size={12}/> {filtrados.length} Registros
            </div>
          </div>

          {erro && <div className="rm-error"><RefreshCcw size={15}/> {erro}</div>}

          {/* TABLE */}
          <div className="rm-ieq-card">
            <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
              <table className="rm-table">
                <thead>
                <tr>
                  <th>Ref. ID</th>
                  <th>Membro Contribuinte</th>
                  <th>Dízimo</th>
                  <th>Oferta</th>
                  <th>Categoria</th>
                  <th>Data</th>
                </tr>
                </thead>
                <tbody>
                {filtrados.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding:"56px 0", textAlign:"center" }}>
                      <Coins size={40} style={{ color:"rgba(200,16,46,.15)", margin:"0 auto 12px", display:"block" }}/>
                      <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:"rgba(26,10,13,.3)", textTransform:"uppercase" }}>Nenhum registro no período</p>
                    </td></tr>
                ) : filtrados.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontFamily:"'Cinzel',serif", fontSize:10, color:"rgba(26,10,13,.4)", letterSpacing:".08em" }}>
                        #{r.id.toString().padStart(4,"0")}
                      </td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div className="rm-avatar">{r.membroNome?.charAt(0) || "?"}</div>
                          <span style={{ fontFamily:"'EB Garamond',serif", fontSize:15, color:"#1A0A0D", fontWeight:500 }}>
                          {r.membroNome || "Anônimo"}
                        </span>
                        </div>
                      </td>
                      <td style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, color:C.blue, whiteSpace:"nowrap" }}>
                        {r.valorDizimo ? `R$ ${fmt(r.valorDizimo)}` : <span style={{ color:"rgba(26,10,13,.2)" }}>—</span>}
                      </td>
                      <td style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, color:C.yellowDark, whiteSpace:"nowrap" }}>
                        {r.valorOferta ? `R$ ${fmt(r.valorOferta)}` : <span style={{ color:"rgba(26,10,13,.2)" }}>—</span>}
                      </td>
                      <td><RmBadge tipo={r.tipoOferta}/></td>
                      <td style={{ textAlign:"right" }}>
                      <span className="rm-date-pill">
                        <CalendarDays size={10}/>
                        {new Date(r.dataLancamento).toLocaleDateString("pt-BR")}
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

function RmBadge({ tipo }) {
  const map = {
    OURO:   { color:C.yellowDark, bg:"rgba(196,140,0,.1)",  border:"rgba(196,140,0,.3)"  },
    PRATA:  { color:"#64748b",    bg:"rgba(100,116,139,.1)", border:"rgba(100,116,139,.3)" },
    BRONZE: { color:"#c2410c",    bg:"rgba(194,65,12,.1)",  border:"rgba(194,65,12,.3)"  },
  };
  const s = map[(tipo||"").toUpperCase()] || { color:"rgba(26,10,13,.4)", bg:"rgba(26,10,13,.05)", border:"rgba(26,10,13,.1)" };
  return (
      <span className="rm-badge" style={{ color:s.color, background:s.bg, borderColor:s.border }}>
      {(tipo || "PADRÃO").toUpperCase()}
    </span>
  );
}
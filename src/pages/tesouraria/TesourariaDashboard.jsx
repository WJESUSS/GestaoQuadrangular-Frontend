import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid
} from "recharts";
import {
  Wallet, Award, TrendingUp, Zap,
  ChevronLeft, ChevronRight, RefreshCcw
} from "lucide-react";

const C = {
  red:"#C8102E", redDark:"#8B0B1F", redLight:"#E8294A",
  yellow:"#FDB813", yellowDark:"#C48C00",
  blue:"#003DA5", blueDark:"#002470", blueLight:"#1A56C4",
};

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  * { box-sizing: border-box; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.45} }
  @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes stripe  {
    0%   { background-position:0 0; }
    100% { background-position:60px 60px; }
  }

  .td-root { animation: fadeUp .5s ease; }

  /* Skeleton shimmer */
  .td-skel {
    background: linear-gradient(90deg, rgba(200,16,46,.07) 25%, rgba(200,16,46,.14) 50%, rgba(200,16,46,.07) 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 8px;
  }

  /* Panel base */
  .td-panel {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(200,16,46,.12);
    border-radius: 14px;
    backdrop-filter: blur(24px);
  }

  /* KPI Cards */
  .td-kpi {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(200,16,46,.12);
    border-radius: 14px;
    backdrop-filter: blur(24px);
    padding: 20px 18px;
    display: flex; flex-direction: column; justify-content: space-between;
    height: 140px;
    position: relative; overflow: hidden;
    transition: all .3s; cursor: pointer;
    border-bottom: 3px solid var(--kpi-accent, #C8102E);
  }
  .td-kpi:hover   { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(200,16,46,.12); }
  .td-kpi:active  { transform: scale(.97); }

  .td-kpi-icon {
    width: 36px; height: 36px; border-radius: 8px;
    background: var(--kpi-bg, rgba(200,16,46,.1));
    display: flex; align-items: center; justify-content: center;
    color: var(--kpi-accent, #C8102E);
  }

  /* Modo tabs */
  .td-mode-bar {
    display: flex;
    background: rgba(200,16,46,.06);
    border: 1px solid rgba(200,16,46,.12);
    padding: 5px; border-radius: 10px;
    gap: 4px; flex-shrink: 0;
  }
  .td-mode-btn {
    flex: 1; padding: 9px 16px; border-radius: 8px; border: none;
    font-family: 'Cinzel', serif; font-size: 9px; font-weight: 700;
    letter-spacing: .18em; text-transform: uppercase; cursor: pointer; transition: all .25s;
  }
  .td-mode-btn.active   { background: linear-gradient(135deg,#8B0B1F,#C8102E); color: #fff; box-shadow: 0 3px 10px rgba(200,16,46,.25); }
  .td-mode-btn.inactive { background: transparent; color: rgba(26,10,13,.4); }
  .td-mode-btn.inactive:hover { background: rgba(200,16,46,.1); color: #8B0B1F; }

  /* Nav pills (mês / ano) */
  .td-nav-pill {
    display: flex; align-items: center;
    background: rgba(200,16,46,.04);
    border: 1px solid rgba(200,16,46,.14);
    border-radius: 8px; padding: 4px;
  }
  .td-nav-btn {
    background: none; border: none; cursor: pointer; padding: 7px;
    border-radius: 6px; color: rgba(26,10,13,.45); transition: all .2s;
    display: flex; align-items: center;
  }
  .td-nav-btn:hover { background: rgba(200,16,46,.1); color: #C8102E; }
  .td-nav-label {
    font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700;
    letter-spacing: .14em; text-transform: uppercase; color: #1A0A0D;
    min-width: 100px; text-align: center;
  }
  .td-nav-label.ano { min-width: 58px; }

  /* Refresh btn */
  .td-refresh-btn {
    background: linear-gradient(135deg,#002470,#003DA5);
    color: #fff; border: none; border-radius: 8px; padding: 10px;
    cursor: pointer; transition: all .25s; display: flex; flex-shrink: 0;
  }
  .td-refresh-btn:hover { filter: brightness(1.12); }
  .td-spin { animation: spin 1s linear infinite; }

  /* Chart panel */
  .td-chart-panel {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(200,16,46,.12);
    border-radius: 14px; backdrop-filter: blur(24px);
    padding: 24px 20px;
  }
  .td-chart-header {
    display: flex; align-items: center; gap:12px; margin-bottom: 22px;
    padding-bottom: 14px; border-bottom: 1px solid rgba(200,16,46,.09);
  }
  .td-chart-icon {
    width: 34px; height: 34px; border-radius: 8px;
    background: rgba(200,16,46,.09); display: flex; align-items: center;
    justify-content: center; color: #C8102E;
  }

  /* Summary side panel */
  .td-summary {
    background: linear-gradient(135deg, #8B0B1F, #003DA5);
    border-radius: 14px; padding: 28px 22px;
    display: flex; flex-direction: column; justify-content: space-between;
    position: relative; overflow: hidden;
    color: #fff;
  }
  .td-summary::before {
    content:''; position:absolute; inset:0; pointer-events:none;
    background: repeating-linear-gradient(-55deg,rgba(255,255,255,.04) 0 10px,transparent 10px 20px);
    background-size:40px 40px;
    animation: stripe 8s linear infinite;
  }
  .td-summary-row {
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,.12); padding-bottom: 12px;
    margin-bottom: 12px;
  }
  .td-summary-row:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

  .td-btn-relatorio {
    background: rgba(255,255,255,.15);
    color: #fff; border: 1px solid rgba(255,255,255,.3);
    border-radius: 8px; padding: 13px 18px; width: 100%;
    font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700;
    letter-spacing: .18em; text-transform: uppercase; cursor: pointer;
    transition: all .25s; margin-top: 22px; position: relative; z-index:1;
  }
  .td-btn-relatorio:hover { background: rgba(255,255,255,.25); transform: translateY(-2px); }

  /* Live badge */
  .td-live-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 99px;
    background: rgba(200,16,46,.09); border: 1px solid rgba(200,16,46,.2);
    font-family: 'Cinzel', serif; font-size: 9px; font-weight: 700;
    letter-spacing: .18em; text-transform: uppercase; color: #C8102E;
    margin-bottom: 10px;
  }
  .td-live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #C8102E; animation: pulse 1.5s ease infinite;
  }

  /* Total hero */
  .td-total-box {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(200,16,46,.12);
    border-radius: 12px; padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between; gap:16px;
  }

  /* KPI grid */
  .td-kpi-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;
  }
  @media (min-width: 640px) {
    .td-kpi-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; }
  }

  /* Chart + summary layout */
  .td-bottom-grid {
    display: grid; grid-template-columns: 1fr; gap: 16px;
  }
  @media (min-width: 800px) {
    .td-bottom-grid { grid-template-columns: 2fr 1fr; }
  }

  /* Filter bar */
  .td-filter-bar {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(200,16,46,.12);
    border-radius: 14px; backdrop-filter: blur(24px);
    padding: 14px 18px; margin-bottom: 20px;
    display: flex; flex-direction: column; gap: 10px;
  }
  @media (min-width: 520px) {
    .td-filter-bar { flex-direction: row; align-items: center; flex-wrap: wrap; }
  }

  /* header row */
  .td-header-row {
    display: flex; flex-direction: column; gap: 14px; margin-bottom: 22px;
  }
  @media (min-width: 520px) {
    .td-header-row { flex-direction: row; align-items: flex-end; justify-content: space-between; }
  }
`;

export default function TesourariaDashboard() {
  const navigate = useNavigate();
  const hoje     = new Date();

  const [modo,    setModo]    = useState("mensal");
  const [mes,     setMes]     = useState(hoje.getMonth() + 1);
  const [ano,     setAno]     = useState(hoje.getFullYear());
  const [resumo,  setResumo]  = useState({ DIZIMO:0, BRONZE:0, PRATA:0, OURO:0 });
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const params   = modo === "mensal" ? { mes, ano } : { ano };
      const endpoint = modo === "mensal" ? "/tesouraria/relatorio-tesouraria" : "/tesouraria/listar";
      const res  = await api.get(endpoint, { params });
      const dados = modo === "mensal" ? (res.data.registros || []) : (res.data || []);
      const calc  = { DIZIMO:0, BRONZE:0, PRATA:0, OURO:0 };
      dados.forEach(r => {
        calc.DIZIMO += r.valorDizimo || 0;
        if (r.tipoOferta === "BRONZE") calc.BRONZE += r.valorOferta || 0;
        if (r.tipoOferta === "PRATA")  calc.PRATA  += r.valorOferta || 0;
        if (r.tipoOferta === "OURO")   calc.OURO   += r.valorOferta || 0;
      });
      setResumo(calc);
    } catch (err) {
      console.error("Erro ao carregar resumo:", err);
    } finally {
      setLoading(false);
    }
  }, [modo, mes, ano]);

  useEffect(() => { carregar(); }, [carregar]);

  const irParaFiltro = (cat) => navigate("/tesouraria/relatorio", { state:{ filtroInicial: cat } });

  const totalGeral   = resumo.DIZIMO + resumo.BRONZE + resumo.PRATA + resumo.OURO;
  const totalOfertas = resumo.BRONZE + resumo.PRATA + resumo.OURO;
  const periodoLabel = modo === "mensal" ? `${MESES[mes-1]} de ${ano}` : `Exercício ${ano}`;

  const dadosGrafico = [
    { tipo:"Dízimo", valor:resumo.DIZIMO, cor:C.blue       },
    { tipo:"Bronze", valor:resumo.BRONZE, cor:"#c2410c"    },
    { tipo:"Prata",  valor:resumo.PRATA,  cor:"#64748b"    },
    { tipo:"Ouro",   valor:resumo.OURO,   cor:C.yellowDark },
  ];

  const fmt = (v) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits:2 });

  return (
      <>
        <style>{CSS}</style>
        <div className="td-root" style={{ maxWidth:1100, margin:"0 auto", padding:"16px 4px", userSelect:"none" }}>

          {/* ── HEADER ── */}
          <div className="td-header-row">
            <div>
              <div className="td-live-badge">
                <div className="td-live-dot" /> LIVE DATA
              </div>
              <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:700, color:"#1A0A0D", margin:0, lineHeight:1.1 }}>
                Dashboard
              </h2>
            </div>

            <div className="td-total-box">
              <div style={{ textAlign:"right" }}>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:"rgba(26,10,13,.4)", margin:"0 0 4px" }}>
                  TOTAL · {periodoLabel}
                </p>
                {loading
                    ? <div className="td-skel" style={{ height:26, width:140, display:"inline-block" }} />
                    : <p style={{ fontFamily:"'Cinzel',serif", fontSize:18, fontWeight:700, color:C.blue, margin:0 }}>
                      R$ {fmt(totalGeral)}
                    </p>
                }
              </div>
              <div style={{ width:42, height:42, borderRadius:10, background:"rgba(0,61,165,.1)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}>
                <Zap size={20} />
              </div>
            </div>
          </div>

          {/* ── FILTER BAR ── */}
          <div className="td-filter-bar">
            <div className="td-mode-bar">
              {["mensal","anual"].map(m => (
                  <button key={m} className={`td-mode-btn ${modo===m?"active":"inactive"}`} onClick={() => setModo(m)}>
                    {m}
                  </button>
              ))}
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, flexWrap:"wrap" }}>
              {modo === "mensal" && (
                  <div className="td-nav-pill" style={{ flex:1 }}>
                    <button className="td-nav-btn" onClick={() => setMes(p => p===1?12:p-1)}><ChevronLeft size={16}/></button>
                    <span className="td-nav-label">{MESES[mes-1]}</span>
                    <button className="td-nav-btn" onClick={() => setMes(p => p===12?1:p+1)}><ChevronRight size={16}/></button>
                  </div>
              )}

              <div className="td-nav-pill">
                <button className="td-nav-btn" onClick={() => setAno(p => p-1)}><ChevronLeft size={16}/></button>
                <span className="td-nav-label ano">{ano}</span>
                <button className="td-nav-btn" onClick={() => setAno(p => p+1)}><ChevronRight size={16}/></button>
              </div>

              <button className="td-refresh-btn" onClick={carregar}>
                <RefreshCcw size={16} className={loading ? "td-spin" : ""} />
              </button>
            </div>
          </div>

          {/* ── KPI CARDS ── */}
          <div className="td-kpi-grid">
            <KpiCard titulo="Dízimos" valor={resumo.DIZIMO} icon={<Wallet size={18}/>} accent={C.blue}       bg="rgba(0,61,165,.1)"     loading={loading} onClick={() => irParaFiltro("TODOS")}  />
            <KpiCard titulo="Ouro"    valor={resumo.OURO}   icon={<Award  size={18}/>} accent={C.yellowDark} bg="rgba(196,140,0,.1)"    loading={loading} onClick={() => irParaFiltro("OURO")}   />
            <KpiCard titulo="Prata"   valor={resumo.PRATA}  icon={<Award  size={18}/>} accent="#64748b"       bg="rgba(100,116,139,.1)"  loading={loading} onClick={() => irParaFiltro("PRATA")}  />
            <KpiCard titulo="Bronze"  valor={resumo.BRONZE} icon={<Award  size={18}/>} accent="#c2410c"       bg="rgba(194,65,12,.1)"    loading={loading} onClick={() => irParaFiltro("BRONZE")} />
          </div>

          {/* ── CHART + SUMMARY ── */}
          <div className="td-bottom-grid">

            {/* Gráfico */}
            <div className="td-chart-panel">
              <div className="td-chart-header">
                <div className="td-chart-icon"><TrendingUp size={15}/></div>
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".14em", textTransform:"uppercase", color:"#1A0A0D" }}>
                Fluxo por Categoria
              </span>
              </div>
              <div style={{ height:"clamp(220px,48vw,300px)" }}>
                {loading ? (
                    <div className="td-skel" style={{ height:"100%", borderRadius:10 }} />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dadosGrafico} margin={{ top:8, right:4, left:-16, bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200,16,46,.08)" />
                        <XAxis dataKey="tipo" axisLine={false} tickLine={false}
                               tick={{ fill:"rgba(26,10,13,.4)", fontFamily:"Cinzel", fontWeight:700, fontSize:9, letterSpacing:".06em" }}
                        />
                        <YAxis hide />
                        <Tooltip
                            cursor={{ fill:"rgba(200,16,46,.04)", rx:8 }}
                            contentStyle={{ borderRadius:10, border:"1px solid rgba(200,16,46,.15)", background:"#fff", fontFamily:"EB Garamond", padding:"10px 16px" }}
                            formatter={v => [`R$ ${fmt(v)}`]}
                        />
                        <Bar dataKey="valor" radius={[8,8,3,3]} maxBarSize={44}>
                          {dadosGrafico.map((e,i) => <Cell key={i} fill={e.cor}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="td-summary">
              <div style={{ position:"relative", zIndex:1 }}>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:"rgba(255,255,255,.6)", margin:"0 0 4px" }}>
                  RESUMO DO PERÍODO
                </p>
                <h4 style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, color:"#fff", margin:"0 0 24px", lineHeight:1.2 }}>
                  {periodoLabel}
                </h4>

                {[
                  { label:"Dízimos", valor:resumo.DIZIMO  },
                  { label:"Ofertas", valor:totalOfertas   },
                  { label:"Total",   valor:totalGeral     },
                ].map(item => (
                    <div key={item.label} className="td-summary-row">
                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".14em", textTransform:"uppercase", color:"rgba(255,255,255,.7)" }}>
                    {item.label}
                  </span>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, color:"#fff" }}>
                    {loading ? "..." : `R$ ${Number(item.valor).toLocaleString("pt-BR")}`}
                  </span>
                    </div>
                ))}
              </div>

              <button className="td-btn-relatorio" onClick={() => navigate("/tesouraria/relatorio")}>
                VER RELATÓRIOS COMPLETOS
              </button>
            </div>

          </div>
        </div>
      </>
  );
}

/* ── KPI Card ── */
function KpiCard({ titulo, valor, icon, accent, bg, loading, onClick }) {
  return (
      <div className="td-kpi" style={{ "--kpi-accent":accent, "--kpi-bg":bg }} onClick={onClick}>
        <div className="td-kpi-icon">{icon}</div>
        <div>
          <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(26,10,13,.4)", margin:"0 0 5px" }}>
            {titulo}
          </p>
          {loading
              ? <div style={{ height:22, width:110, background:"rgba(200,16,46,.1)", borderRadius:6, animation:"pulse 1.4s ease infinite" }} />
              : <p style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(.88rem,2.5vw,1.15rem)", fontWeight:700, color:"#1A0A0D", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                R$ {Number(valor).toLocaleString("pt-BR", { minimumFractionDigits:2 })}
              </p>
          }
        </div>
      </div>
  );
}
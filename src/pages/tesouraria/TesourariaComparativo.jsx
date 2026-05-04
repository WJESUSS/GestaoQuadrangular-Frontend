import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api.js";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    Tooltip, Legend, CartesianGrid,
} from "recharts";
import { BarChart3, Calendar, TrendingUp, Wallet, ArrowUpRight, Table as TableIcon } from "lucide-react";

const C = {
    red:"#C8102E", redDark:"#8B0B1F", yellow:"#FDB813", yellowDark:"#C48C00",
    blue:"#003DA5", blueDark:"#002470", blueLight:"#1A56C4", offWhite:"#F5F0E8",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  * { box-sizing: border-box; }
  @keyframes tcFadeUp { to { opacity:1; transform:translateY(0); } }
  @keyframes tcPulse  { 0%,100%{opacity:1} 50%{opacity:.4} }

  .tc-fade  { opacity:0; transform:translateY(16px); animation: tcFadeUp .5s ease forwards; }
  .tc-fade-1{ animation-delay:0s;    }
  .tc-fade-2{ animation-delay:.08s;  }
  .tc-fade-3{ animation-delay:.16s;  }
  .tc-fade-4{ animation-delay:.24s;  }

  .tc-ieq-card {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(200,16,46,.12);
    border-radius: 14px;
    backdrop-filter: blur(24px);
    padding: 24px 22px;
    position: relative; overflow: hidden;
    transition: box-shadow .25s, transform .25s;
  }
  .tc-ieq-card:hover { box-shadow: 0 8px 32px rgba(200,16,46,.1); transform: translateY(-2px); }
  .tc-ieq-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background: var(--card-accent, #C8102E);
  }

  .tc-panel {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(200,16,46,.12);
    border-radius: 14px;
    backdrop-filter: blur(24px);
    padding: 28px 20px;
  }
  @media (min-width: 640px) { .tc-panel { padding: 32px 28px; } }

  .tc-panel-header {
    display:flex; align-items:center; gap:12px; margin-bottom:24px;
    padding-bottom:16px; border-bottom:1px solid rgba(200,16,46,.1);
    flex-wrap:wrap;
  }
  .tc-panel-icon {
    width:34px; height:34px; border-radius:10px;
    background:rgba(200,16,46,.08); display:flex; align-items:center; justify-content:center;
    color:#C8102E; flex-shrink:0;
  }
  .tc-panel-title {
    font-family:'Cinzel',serif; font-weight:700;
    font-size:.75rem; text-transform:uppercase; letter-spacing:.14em; color:#1A0A0D;
  }

  .tc-table-wrap {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(200,16,46,.12);
    border-radius: 14px; overflow: hidden;
    backdrop-filter: blur(24px);
  }
  .tc-table { width:100%; border-collapse:collapse; }
  .tc-table thead tr { background: rgba(200,16,46,.04); }
  .tc-table th {
    padding:14px 16px; font-family:'Cinzel',serif;
    font-size:9px; font-weight:700; text-transform:uppercase;
    letter-spacing:.18em; color:rgba(26,10,13,.45); text-align:left; white-space:nowrap;
  }
  .tc-table th:not(:first-child) { text-align:right; }
  .tc-table td { padding:14px 16px; border-top:1px solid rgba(200,16,46,.07); }
  @media (min-width: 640px) { .tc-table th, .tc-table td { padding:16px 22px; } }
  .tc-table tbody tr { transition: background .15s; }
  .tc-table tbody tr:hover { background: rgba(200,16,46,.04); }
  .td-month {
    font-family:'Cinzel',serif; font-weight:700;
    font-size:.78rem; color:#1A0A0D; letter-spacing:.04em; text-transform:capitalize;
  }
  .td-num {
    font-family:'EB Garamond',serif; font-weight:700;
    font-size:.85rem; text-align:right; white-space:nowrap;
  }
  .td-num.blue { color:#003DA5; }
  .td-num.amber{ color:#C48C00; }
  @media (max-width: 480px) { .tc-col-prop { display:none; } }

  .tc-bar-wrap { display:flex; align-items:center; justify-content:flex-end; gap:10px; }
  .tc-bar-track { width:80px; height:3px; background:rgba(200,16,46,.12); border-radius:99px; overflow:hidden; }
  .tc-bar-fill  { height:100%; background:#003DA5; border-radius:99px; transition:width .8s; }

  .tc-year-pill {
    display:flex; align-items:center; gap:10px;
    background:rgba(255,255,255,.92); border:1px solid rgba(200,16,46,.15);
    border-radius:10px; padding:10px 16px; flex-shrink:0;
  }
  .tc-year-input {
    background:transparent; border:none; outline:none;
    font-family:'Cinzel',serif; font-weight:700; font-size:1rem; color:#1A0A0D;
    width:64px; text-align:center;
    border-right:1px solid rgba(200,16,46,.18); padding-right:10px; margin-right:2px;
    -moz-appearance:textfield;
  }
  .tc-year-input::-webkit-inner-spin-button,
  .tc-year-input::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }

  .tc-skel { animation: tcPulse 1.5s ease-in-out infinite; }
  .tc-skel-block { background:rgba(200,16,46,.08); border-radius:12px; }

  /* Cards grid */
  .tc-cards {
    display:grid; grid-template-columns:repeat(3,1fr); gap:14px;
  }
  @media (max-width:640px) {
    .tc-cards { grid-template-columns:1fr; gap:10px; }
  }
  @media (min-width:400px) and (max-width:640px) {
    .tc-cards { grid-template-columns:repeat(2,1fr); }
    .tc-cards > *:last-child { grid-column:1/-1; }
  }

  /* header row */
  .tc-header-row {
    display:flex; flex-wrap:wrap; align-items:flex-end;
    justify-content:space-between; gap:16px; margin-bottom:28px;
  }
`;

export default function TesourariaComparativo() {
    const [comparativo, setComparativo] = useState([]);
    const [ano, setAno]     = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await api.get(`/tesouraria/comparativo-anual?ano=${ano}`);
                setComparativo(res.data.comparativo || []);
            } catch { setComparativo([]); }
            finally { setTimeout(() => setLoading(false), 500); }
        })();
    }, [ano]);

    const totais = useMemo(() => {
        const dizimo = comparativo.reduce((a, c) => a + Number(c.totalDizimo), 0);
        const oferta = comparativo.reduce((a, c) => a + Number(c.totalOferta), 0);
        return { dizimo, oferta, geral: dizimo + oferta };
    }, [comparativo]);

    const fmt = (v) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits:2 });

    if (loading) return (
        <>
            <style>{CSS}</style>
            <div className="tc-skel" style={{ padding:24 }}>
                <div className="tc-skel-block" style={{ height:52, width:"40%", marginBottom:28 }} />
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:18 }}>
                    {[1,2,3].map(i => <div key={i} className="tc-skel-block" style={{ height:110, borderRadius:14 }} />)}
                </div>
                <div className="tc-skel-block" style={{ height:320, borderRadius:14, marginBottom:18 }} />
                <div className="tc-skel-block" style={{ height:240, borderRadius:14 }} />
            </div>
        </>
    );

    return (
        <>
            <style>{CSS}</style>
            <div style={{ maxWidth:1100, margin:"0 auto", padding:"20px 4px" }}>

                {/* HEADER */}
                <div className="tc-fade tc-fade-1 tc-header-row">
                    <div>
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".22em", textTransform:"uppercase", color:C.red, fontWeight:700, marginBottom:6 }}>
                            PERFORMANCE ANUAL
                        </p>
                        <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:700, letterSpacing:".06em", color:"#1A0A0D", margin:0, lineHeight:1.1 }}>
                            Comparativo
                        </h2>
                    </div>
                    <div className="tc-year-pill">
                        <Calendar size={14} color="rgba(26,10,13,.4)" />
                        <input type="number" className="tc-year-input" value={ano} onChange={e => setAno(Number(e.target.value))} />
                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:"rgba(26,10,13,.4)" }}>Exercício</span>
                    </div>
                </div>

                {/* METRIC CARDS */}
                <div className="tc-cards tc-fade tc-fade-2" style={{ marginBottom:18 }}>
                    <MetricCard label="Total Dízimos"       valor={totais.dizimo} color={C.blue}       icon={<Wallet size={15}/>} />
                    <MetricCard label="Total Ofertas"       valor={totais.oferta} color={C.yellowDark} icon={<TrendingUp size={15}/>} />
                    <MetricCard label="Receita Consolidada" valor={totais.geral}  color={C.red}        icon={<ArrowUpRight size={15}/>} />
                </div>

                {/* CHART */}
                <div className="tc-panel tc-fade tc-fade-3" style={{ marginBottom:18 }}>
                    <div className="tc-panel-header">
                        <div className="tc-panel-icon"><BarChart3 size={15}/></div>
                        <span className="tc-panel-title">Fluxo Mensal de Entradas</span>
                    </div>
                    <div style={{ height:"clamp(220px,48vw,340px)" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparativo} margin={{ top:8, right:4, left:-14, bottom:0 }}>
                                <defs>
                                    <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={C.blue}       stopOpacity={1}/>
                                        <stop offset="100%" stopColor={C.blueDark} stopOpacity={.25}/>
                                    </linearGradient>
                                    <linearGradient id="gO" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={C.yellowDark} stopOpacity={1}/>
                                        <stop offset="100%" stopColor={C.yellowDark} stopOpacity={.2}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200,16,46,.1)" />
                                <XAxis dataKey="mes" axisLine={false} tickLine={false}
                                       tick={{ fill:"rgba(26,10,13,.4)", fontSize:9, fontFamily:"Cinzel", fontWeight:700 }}
                                       tickFormatter={m => new Date(ano, m-1).toLocaleString("pt-BR",{month:"short"}).toUpperCase()}
                                />
                                <YAxis axisLine={false} tickLine={false}
                                       tick={{ fill:"rgba(26,10,13,.4)", fontSize:9 }}
                                       tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                                       width={40}
                                />
                                <Tooltip
                                    cursor={{ fill:"rgba(200,16,46,.04)", rx:8 }}
                                    contentStyle={{ borderRadius:10, border:"1px solid rgba(200,16,46,.15)", background:"#fff", fontFamily:"EB Garamond", padding:"10px 16px" }}
                                    formatter={v => [`R$ ${fmt(v)}`]}
                                />
                                <Legend verticalAlign="top" align="right" iconType="circle"
                                        wrapperStyle={{ paddingBottom:14, fontSize:9, fontFamily:"Cinzel", fontWeight:700, textTransform:"uppercase", letterSpacing:".1em" }}
                                />
                                <Bar dataKey="totalDizimo" fill="url(#gD)" radius={[5,5,0,0]} name="Dízimo" maxBarSize={40}/>
                                <Bar dataKey="totalOferta"  fill="url(#gO)"  radius={[5,5,0,0]} name="Oferta"  maxBarSize={40}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* TABLE */}
                <div className="tc-table-wrap tc-fade tc-fade-4">
                    <div className="tc-panel-header" style={{ padding:"18px 20px", margin:0 }}>
                        <div className="tc-panel-icon"><TableIcon size={14}/></div>
                        <span className="tc-panel-title">Detalhamento Analítico</span>
                    </div>
                    <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
                        <table className="tc-table">
                            <thead>
                            <tr>
                                <th>Mês Referência</th>
                                <th>Dízimo</th>
                                <th>Oferta</th>
                                <th className="tc-col-prop">Proporção</th>
                            </tr>
                            </thead>
                            <tbody>
                            {comparativo.map(c => {
                                const perc = (Number(c.totalDizimo) / (totais.geral || 1)) * 100;
                                return (
                                    <tr key={c.mes}>
                                        <td className="td-month">{new Date(ano, c.mes-1).toLocaleString("pt-BR",{month:"long"})}</td>
                                        <td className="td-num blue">R$ {fmt(c.totalDizimo)}</td>
                                        <td className="td-num amber">R$ {fmt(c.totalOferta)}</td>
                                        <td className="tc-col-prop">
                                            <div className="tc-bar-wrap">
                                                <div className="tc-bar-track"><div className="tc-bar-fill" style={{ width:`${Math.min(perc*5,100)}%` }}/></div>
                                                <span style={{ fontFamily:"'EB Garamond',serif", fontSize:11, color:"rgba(26,10,13,.4)", fontWeight:700 }}>{perc.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    );
}

function MetricCard({ label, valor, color, icon }) {
    return (
        <div className="tc-ieq-card" style={{ "--card-accent": color }}>
            <div style={{ width:34, height:34, borderRadius:8, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", color, marginBottom:16 }}>{icon}</div>
            <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:"rgba(26,10,13,.45)", marginBottom:6 }}>{label}</p>
            <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(.95rem,2.8vw,1.4rem)", fontWeight:700, color:"#1A0A0D", margin:0, wordBreak:"break-word" }}>
                R$ {Number(valor).toLocaleString("pt-BR",{minimumFractionDigits:2})}
            </h3>
        </div>
    );
}
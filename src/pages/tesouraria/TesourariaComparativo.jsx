import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api.js";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Table as TableIcon,
} from "lucide-react";

/* ─── Tokens ─────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@400;600&display=swap');

  .tc-root {
    --ink:      #0e0f11;
    --ink-sub:  #6b7280;
    --ink-dim:  #9ca3af;
    --surface:  #ffffff;
    --surface2: #f8f8fb;
    --border:   #e8e8ef;
    --indigo:   #5b5fcf;
    --indigo-l: #eeeeff;
    --amber:    #d97706;
    --amber-l:  #fef3c7;
    --green:    #059669;
    --green-l:  #d1fae5;
    font-family: 'DM Sans', sans-serif;
  }

  @media (prefers-color-scheme: dark) {
    .tc-root {
      --ink:      #f0f0f5;
      --ink-sub:  #9ca3af;
      --ink-dim:  #4b5563;
      --surface:  #0f1117;
      --surface2: #171923;
      --border:   #1f2232;
      --indigo-l: #1a1c3a;
      --amber-l:  #2d1e00;
      --green-l:  #022c1e;
    }
  }

  .tc-root * { box-sizing: border-box; }

  /* Fade-in stagger */
  .tc-fade { opacity: 0; transform: translateY(16px); animation: tcFadeUp 0.55s cubic-bezier(.22,1,.36,1) forwards; }
  .tc-fade-1 { animation-delay: 0s; }
  .tc-fade-2 { animation-delay: 0.07s; }
  .tc-fade-3 { animation-delay: 0.14s; }
  .tc-fade-4 { animation-delay: 0.21s; }
  .tc-fade-5 { animation-delay: 0.28s; }
  @keyframes tcFadeUp { to { opacity:1; transform:translateY(0); } }

  /* Header */
  .tc-eyebrow {
    font-family: 'Syne', sans-serif;
    font-size: 10px; letter-spacing: .28em; text-transform: uppercase;
    color: var(--indigo); font-weight: 700; margin-bottom: 6px;
  }
  .tc-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 5vw, 3.6rem);
    font-weight: 800; line-height: 1;
    color: var(--ink); letter-spacing: -.03em; margin: 0;
  }
  .tc-title span { color: var(--indigo); }

  /* ── Header row: stack on very small screens ── */
  .tc-header-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 32px;
  }

  .tc-year-pill {
    display: flex; align-items: center; gap: 10px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 10px 18px;
    box-shadow: 0 1px 4px rgba(0,0,0,.04);
    flex-shrink: 0;
  }
  .tc-year-input {
    background: transparent; border: none; outline: none;
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 1.05rem; color: var(--ink); width: 64px; text-align: center;
    border-right: 1px solid var(--border); padding-right: 12px; margin-right: 2px;
    /* Remove number spinners for cleaner mobile look */
    -moz-appearance: textfield;
  }
  .tc-year-input::-webkit-inner-spin-button,
  .tc-year-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  .tc-year-label {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .22em; color: var(--ink-dim);
  }

  /* ── Metric Cards ── */
  .tc-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  /* Tablet: 3 cols until we're really tight */
  @media (max-width: 640px) {
    .tc-cards {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }
  /* Two-column sweet spot for medium-small phones */
  @media (min-width: 400px) and (max-width: 640px) {
    .tc-cards {
      grid-template-columns: repeat(2, 1fr);
    }
    /* Last card (Receita Consolidada) spans full width */
    .tc-cards > *:last-child {
      grid-column: 1 / -1;
    }
  }

  .tc-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 22px; padding: 24px 22px;
    position: relative; overflow: hidden;
    transition: box-shadow .25s, transform .25s;
  }
  .tc-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,.07); transform: translateY(-2px); }
  .tc-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background: var(--card-accent);
  }
  .tc-card-icon {
    width: 36px; height: 36px; border-radius: 12px;
    background: var(--card-icon-bg); display: flex; align-items: center; justify-content: center;
    color: var(--card-color); margin-bottom: 20px;
  }
  .tc-card-label {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .2em; color: var(--ink-sub); margin-bottom: 8px;
  }
  .tc-card-value {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.1rem, 3.5vw, 1.6rem);
    font-weight: 800;
    color: var(--ink); letter-spacing: -.02em; line-height: 1;
    word-break: break-word;
  }

  /* ── Chart Panel ── */
  .tc-panel {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 26px; padding: 28px 20px;
    box-shadow: 0 2px 16px rgba(0,0,0,.04);
  }
  @media (min-width: 640px) {
    .tc-panel { padding: 36px; }
  }
  .tc-panel-header {
    display: flex; align-items: center; gap: 12px; margin-bottom: 28px;
    padding-bottom: 18px; border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }
  .tc-panel-icon {
    width: 34px; height: 34px; border-radius: 10px;
    background: var(--indigo-l); display: flex; align-items: center; justify-content: center; color: var(--indigo);
    flex-shrink: 0;
  }
  .tc-panel-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: .8rem; text-transform: uppercase; letter-spacing: .12em; color: var(--ink);
  }

  /* ── Table ── */
  .tc-table-wrap {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 26px; overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,.03);
  }
  .tc-table { width: 100%; border-collapse: collapse; }
  .tc-table thead tr { background: var(--surface2); }
  .tc-table th {
    padding: 16px 16px;
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .18em; color: var(--ink-dim); text-align: left;
    white-space: nowrap;
  }
  .tc-table th:not(:first-child) { text-align: right; }
  .tc-table td { padding: 16px 16px; border-top: 1px solid var(--border); }
  @media (min-width: 640px) {
    .tc-table th, .tc-table td { padding: 18px 24px; }
  }
  .tc-table tbody tr { transition: background .15s; }
  .tc-table tbody tr:hover { background: var(--surface2); }
  .tc-table .td-month {
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: .78rem; color: var(--ink); letter-spacing: .04em; text-transform: capitalize;
  }
  .tc-table .td-num {
    font-family: 'JetBrains Mono', monospace; font-weight: 600;
    font-size: .78rem; text-align: right; white-space: nowrap;
  }
  .tc-table .td-num.indigo { color: var(--indigo); }
  .tc-table .td-num.amber  { color: var(--amber);  }

  /* Hide "Proporção" column on very small screens to avoid overflow */
  @media (max-width: 480px) {
    .tc-col-prop { display: none; }
  }

  .tc-bar-wrap { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
  .tc-bar-track {
    width: 80px; height: 3px; background: var(--border); border-radius: 99px; overflow: hidden;
  }
  @media (min-width: 640px) {
    .tc-bar-track { width: 100px; }
  }
  .tc-bar-fill {
    height: 100%; background: var(--indigo); border-radius: 99px;
    transition: width .8s cubic-bezier(.22,1,.36,1);
  }

  /* Skeleton */
  .tc-skeleton { animation: tcPulse 1.5s ease-in-out infinite; }
  @keyframes tcPulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .tc-skel-block { background: var(--border); border-radius: 16px; }
`;

export default function TesourariaComparativo() {
  const [comparativo, setComparativo] = useState([]);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarComparativo = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tesouraria/comparativo-anual?ano=${ano}`);
        setComparativo(res.data.comparativo || []);
      } catch (err) {
        console.error("Erro ao carregar comparativo:", err);
        setComparativo([]);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    carregarComparativo();
  }, [ano]);

  const totais = useMemo(() => {
    const dizimo = comparativo.reduce((acc, c) => acc + Number(c.totalDizimo), 0);
    const oferta = comparativo.reduce((acc, c) => acc + Number(c.totalOferta), 0);
    return { dizimo, oferta, geral: dizimo + oferta };
  }, [comparativo]);

  return (
      <>
        <style>{CSS}</style>
        <div className="tc-root" style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 16px" }}>
          {loading ? (
              <ComparativoSkeleton />
          ) : (
              <>
                {/* HEADER */}
                <div className="tc-fade tc-fade-1 tc-header-row">
                  <div>
                    <p className="tc-eyebrow">Performance Anual</p>
                    <h2 className="tc-title">Comparativo<span>.</span></h2>
                  </div>
                  <div className="tc-year-pill">
                    <Calendar size={15} color="var(--ink-dim)" />
                    <input
                        type="number"
                        className="tc-year-input"
                        value={ano}
                        onChange={(e) => setAno(Number(e.target.value))}
                    />
                    <span className="tc-year-label">Exercício</span>
                  </div>
                </div>

                {/* METRIC CARDS */}
                <div className="tc-cards tc-fade tc-fade-2" style={{ marginBottom: 20 }}>
                  <MetricCard label="Total Dízimos"       valor={totais.dizimo}  color="indigo" icon={<Wallet size={16} />} />
                  <MetricCard label="Total Ofertas"       valor={totais.oferta}  color="amber"  icon={<TrendingUp size={16} />} />
                  <MetricCard label="Receita Consolidada" valor={totais.geral}   color="green"  icon={<ArrowUpRight size={16} />} />
                </div>

                {/* CHART */}
                <div className="tc-panel tc-fade tc-fade-3" style={{ marginBottom: 20 }}>
                  <div className="tc-panel-header">
                    <div className="tc-panel-icon"><BarChart3 size={16} /></div>
                    <span className="tc-panel-title">Fluxo Mensal de Entradas</span>
                  </div>
                  {/* Chart height shrinks on mobile */}
                  <div style={{ height: "clamp(240px, 50vw, 380px)" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparativo} margin={{ top: 10, right: 4, left: -12, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gDizimo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#5b5fcf" stopOpacity={1} />
                            <stop offset="100%" stopColor="#5b5fcf" stopOpacity={0.25} />
                          </linearGradient>
                          <linearGradient id="gOferta" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#d97706" stopOpacity={1} />
                            <stop offset="100%" stopColor="#d97706" stopOpacity={0.25} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis
                            dataKey="mes"
                            axisLine={false} tickLine={false}
                            tick={{ fill: "var(--ink-dim)", fontSize: 9, fontFamily: "Syne", fontWeight: 700, letterSpacing: "0.04em" }}
                            tickFormatter={(m) => new Date(ano, m - 1).toLocaleString("pt-BR", { month: "short" }).toUpperCase()}
                        />
                        <YAxis
                            axisLine={false} tickLine={false}
                            tick={{ fill: "var(--ink-dim)", fontSize: 9 }}
                            tickFormatter={(v) =>
                                v >= 1000
                                    ? `${(v / 1000).toFixed(0)}k`
                                    : v
                            }
                            width={40}
                        />
                        <Tooltip
                            cursor={{ fill: "var(--surface2)", rx: 8 }}
                            contentStyle={{
                              borderRadius: 16, border: "1px solid var(--border)",
                              boxShadow: "0 12px 32px rgba(0,0,0,.1)",
                              padding: "12px 18px", background: "var(--surface)",
                              fontFamily: "DM Sans"
                            }}
                            formatter={(value) => [`R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`]}
                        />
                        <Legend
                            verticalAlign="top" align="right" iconType="circle"
                            wrapperStyle={{ paddingBottom: 16, fontSize: 9, fontFamily: "Syne", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}
                        />
                        <Bar dataKey="totalDizimo" fill="url(#gDizimo)" radius={[6, 6, 0, 0]} name="Dízimo" maxBarSize={42} />
                        <Bar dataKey="totalOferta"  fill="url(#gOferta)"  radius={[6, 6, 0, 0]} name="Oferta"  maxBarSize={42} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* TABLE */}
                <div className="tc-table-wrap tc-fade tc-fade-4">
                  <div className="tc-panel-header" style={{ padding: "20px 20px", margin: 0 }}>
                    <div className="tc-panel-icon" style={{ background: "var(--surface2)" }}>
                      <TableIcon size={15} color="var(--ink-sub)" />
                    </div>
                    <span className="tc-panel-title">Detalhamento Analítico</span>
                  </div>
                  {/* overflowX lets table scroll horizontally on very small screens as last resort */}
                  <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
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
                      {comparativo.map((c) => {
                        const percDizimo = (Number(c.totalDizimo) / (totais.geral || 1)) * 100;
                        return (
                            <tr key={c.mes}>
                              <td className="td-month">
                                {new Date(ano, c.mes - 1).toLocaleString("pt-BR", { month: "long" })}
                              </td>
                              <td className="td-num indigo">
                                R$ {Number(c.totalDizimo).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="td-num amber">
                                R$ {Number(c.totalOferta).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="tc-col-prop">
                                <div className="tc-bar-wrap">
                                  <div className="tc-bar-track">
                                    <div className="tc-bar-fill" style={{ width: `${Math.min(percDizimo * 5, 100)}%` }} />
                                  </div>
                                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--ink-dim)", fontWeight: 600 }}>
                                {percDizimo.toFixed(0)}%
                              </span>
                                </div>
                              </td>
                            </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
          )}
        </div>
      </>
  );
}

/* ─── MetricCard ─────────────────────────────────────────── */
const cardTheme = {
  indigo: { accent: "#5b5fcf", iconBg: "var(--indigo-l)", color: "var(--indigo)" },
  amber:  { accent: "#d97706", iconBg: "var(--amber-l)",  color: "var(--amber)"  },
  green:  { accent: "#059669", iconBg: "var(--green-l)",  color: "var(--green)"  },
};

function MetricCard({ label, valor, color, icon }) {
  const t = cardTheme[color];
  return (
      <div className="tc-card" style={{ "--card-accent": t.accent, "--card-icon-bg": t.iconBg, "--card-color": t.color }}>
        <div className="tc-card-icon">{icon}</div>
        <p className="tc-card-label">{label}</p>
        <h3 className="tc-card-value">
          R$ {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </h3>
      </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────── */
function ComparativoSkeleton() {
  return (
      <div className="tc-skeleton">
        <div className="tc-skel-block" style={{ height: 56, width: "40%", marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
          {[1, 2, 3].map(i => <div key={i} className="tc-skel-block" style={{ height: 120, borderRadius: 22 }} />)}
        </div>
        <div className="tc-skel-block" style={{ height: "clamp(240px, 50vw, 380px)", borderRadius: 26, marginBottom: 20 }} />
        <div className="tc-skel-block" style={{ height: 280, borderRadius: 26 }} />
      </div>
  );
}
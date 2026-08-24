import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api.js";
import { motion } from "framer-motion";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    Tooltip, Legend, CartesianGrid,
} from "recharts";
import { BarChart3, Calendar, TrendingUp, Wallet, ArrowUpRight, TableIcon } from "lucide-react";
import TelaCarregando from "../../components/TelaCarregando.jsx";

/* ─── Tokens AURA (Mesmo do Dashboard) ──────────────────────────────── */
const AURA = {
    gold:      "#C9A96E",
    goldLight: "#E8D5A3",
    dark:      "#0A0A0F",
    darkEl:    "#12121A",
    light:     "#F5F0E8",
    red:       "#C8102E",
    redDark:   "#9B0B1E",
    blue:      "#003DA5",
    blueDark:  "#002470",
    yellow:    "#FDB813",
};

function theme(isDark) {
    return {
        bg:          isDark ? "#0A0A0F"               : "#F5F0E8",
        bgEl:        isDark ? "rgba(18,18,26,.95)"     : "rgba(255,255,255,.95)",
        bgInput:     isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.04)",
        border:      isDark ? "rgba(201,169,110,.1)"   : "rgba(201,169,110,.2)",
        borderInput: isDark ? "rgba(201,169,110,.15)"  : "rgba(201,169,110,.28)",
        text:        isDark ? "#F5F0E8"                : "#1A1008",
        textSec:     isDark ? "#9A9588"                : "#6B5E4A",
        textMuted:   isDark ? "#6B6658"                : "#9A9080",
        glow1:       isDark ? "rgba(201,169,110,.05)"  : "rgba(201,169,110,.08)",
        glow2:       isDark ? "rgba(201,169,110,.04)"  : "rgba(201,169,110,.06)",
        cardHover:   isDark ? "rgba(201,169,110,.2)"   : "rgba(201,169,110,.35)",
        placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
    };
}

function GlobalStyles({ t, isDark }) {
    return (
        <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes dl-spin   { to { transform: rotate(360deg); } }
      @keyframes dl-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes fadeUp    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

      .dl-spin   { animation: dl-spin  1s linear infinite; }
      .dl-pulse  { animation: dl-pulse 3s ease-in-out infinite; }
      .fadeUp    { animation: fadeUp .5s ease; }

      * { box-sizing: border-box; }

      .tc-root {
        font-family: 'Inter', sans-serif;
        background: ${t.bg};
        color: ${t.text};
        padding-bottom: 40px;
        transition: background .3s, color .3s;
      }

      .tc-glow {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
          radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%);
        transition: background .3s;
      }

      .tc-content {
        position: relative; z-index: 1;
        max-width: 1140px; margin: 0 auto;
        padding: 0 18px;
      }
      @media(max-width: 420px) { .tc-content { padding: 0 14px; } }

      .tc-header {
        display: flex; flex-direction: column; gap: 18px;
        margin-bottom: 28px; padding-top: 28px;
        align-items: flex-start;
      }
      @media(min-width: 768px) {
        .tc-header { flex-direction: row; align-items: flex-end; justify-content: space-between; }
      }

      .tc-header-left h2 {
        font-family: 'Playfair Display', serif;
        font-size: clamp(24px, 5vw, 32px);
        font-weight: 500; color: ${t.text};
        margin: 0 0 4px; letter-spacing: .02em;
      }

      .tc-header-left p {
        font-size: 10px; font-weight: 500; letter-spacing: .16em;
        text-transform: uppercase; color: ${AURA.red}; margin: 0;
        display: flex; align-items: center; gap: 6px;
      }

      .tc-year-pill {
        display: flex; align-items: center; gap: 10px; flex-shrink: 0;
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 12px; padding: 10px 16px; backdrop-filter: blur(20px);
      }

      .tc-year-input {
        background: transparent; border: none; outline: none;
        font-family: 'Playfair Display', serif; font-weight: 500; font-size: 14px;
        color: ${t.text}; width: 64px; text-align: center;
        border-right: 1px solid ${t.border}; padding-right: 10px; margin-right: 6px;
        -moz-appearance: textfield;
      }
      .tc-year-input::-webkit-inner-spin-button,
      .tc-year-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      .tc-year-input:focus { color: ${AURA.gold}; }

      .tc-year-label {
        font-family: 'Inter', sans-serif; font-size: 10px;
        font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; color: ${t.textMuted};
      }

      .tc-cards {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
        margin-bottom: 20px;
      }
      @media(max-width: 640px) { .tc-cards { grid-template-columns: 1fr; } }
      @media(min-width: 640px) and (max-width: 900px) {
        .tc-cards { grid-template-columns: repeat(2, 1fr); }
        .tc-cards > *:last-child { grid-column: 1 / -1; }
      }

      .tc-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 16px; overflow: hidden; backdrop-filter: blur(20px);
        padding: 20px; position: relative;
        transition: all .3s;
      }
      .tc-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
        background: var(--card-accent, ${AURA.gold});
      }
      .tc-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.12); }

      .tc-card-icon {
        width: 44px; height: 44px; border-radius: 12px; display: flex;
        align-items: center; justify-content: center; margin-bottom: 12px;
        background: var(--icon-bg, rgba(201,169,110,.08));
        color: var(--icon-color, ${AURA.gold});
      }

      .tc-card-label {
        font-family: 'Inter', sans-serif; font-size: 9px;
        font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; color: ${t.textMuted}; margin: 0 0 6px;
      }

      .tc-card-value {
        font-family: 'Playfair Display', serif; font-size: 24px;
        font-weight: 600; color: var(--value-color, ${AURA.gold});
        margin: 0; word-break: break-word;
      }

      .tc-panel {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 16px; overflow: hidden; backdrop-filter: blur(20px);
        margin-bottom: 20px; position: relative;
      }
      .tc-panel::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }

      .tc-panel-header {
        display: flex; align-items: center; gap: 12px;
        padding: 18px 20px; border-bottom: 1px solid ${t.border};
      }

      .tc-panel-icon {
        width: 40px; height: 40px; border-radius: 11px;
        background: rgba(201,169,110,.08); display: flex;
        align-items: center; justify-content: center;
        color: ${AURA.gold}; flex-shrink: 0;
      }

      .tc-panel-title {
        font-family: 'Playfair Display', serif; font-weight: 500;
        font-size: 13px; letter-spacing: .02em; color: ${t.text}; margin: 0;
      }

      .tc-chart-wrap {
        padding: 18px; min-height: 260px;
      }

      .tc-table-wrap {
        overflow-x: auto; -webkit-overflow-scrolling: touch;
      }

      .tc-table {
        width: 100%; border-collapse: collapse; min-width: 500px;
      }

      .tc-table thead tr { background: ${isDark ? "rgba(255,255,255,.02)" : "rgba(201,169,110,.03)"}; }

      .tc-table th {
        padding: 16px 18px; font-family: 'Inter', sans-serif;
        font-size: 9px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; color: ${t.textMuted}; text-align: left;
      }
      .tc-table th:not(:first-child) { text-align: right; }

      .tc-table td {
        padding: 14px 18px; border-top: 1px solid ${t.border};
        font-size: 13px; color: ${t.text};
      }
      @media(min-width: 768px) { .tc-table th, .tc-table td { padding: 16px 22px; } }

      .tc-table tbody tr { transition: background .15s; }
      .tc-table tbody tr:hover { background: ${isDark ? "rgba(255,255,255,.03)" : "rgba(201,169,110,.04)"}; }

      .tc-month-cell {
        font-family: 'Playfair Display', serif; font-weight: 500;
        font-size: 13px; color: ${t.text}; text-transform: capitalize;
      }

      .tc-value-blue { color: ${AURA.blue}; font-weight: 600; }
      .tc-value-yellow { color: ${AURA.yellow}; font-weight: 600; }

      .tc-bar-wrap {
        display: flex; align-items: center; justify-content: flex-end;
        gap: 10px;
      }

      .tc-bar-track {
        width: 60px; height: 3px;
        background: ${isDark ? "rgba(201,169,110,.1)" : "rgba(201,169,110,.08)"};
        border-radius: 99px; overflow: hidden;
      }

      .tc-bar-fill {
        height: 100%; background: linear-gradient(90deg, ${AURA.blue}, ${AURA.blueDark});
        border-radius: 99px; transition: width .8s cubic-bezier(.4,0,.2,1);
      }

      .tc-bar-percent {
        font-family: 'Playfair Display', serif; font-size: 11px;
        font-weight: 600; color: ${t.textMuted}; min-width: 32px; text-align: right;
      }

      @media(max-width: 640px) { .tc-col-prop { display: none; } }

      .tc-loading {
        padding: 48px 20px; text-align: center;
      }

      .tc-skel { animation: dl-pulse 1.5s ease infinite; }
      .tc-skel-block { background: ${isDark ? "rgba(201,169,110,.1)" : "rgba(201,169,110,.08)"}; border-radius: 12px; }
    `}</style>
    );
}

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function TesourariaComparativo({ isDark = false }) {
    const [comparativo, setComparativo] = useState([]);
    const [ano, setAno] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    const t = theme(isDark);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await api.get(`/tesouraria/comparativo-anual?ano=${ano}`);
                setComparativo(res.data.comparativo || []);
            } catch (err) {
                console.error(err);
                setComparativo([]);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        })();
    }, [ano]);

    const totais = useMemo(() => {
        const dizimo = comparativo.reduce((a, c) => a + Number(c.totalDizimo), 0);
        const oferta = comparativo.reduce((a, c) => a + Number(c.totalOferta), 0);
        return { dizimo, oferta, geral: dizimo + oferta };
    }, [comparativo]);

    const fmt = (v) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

    if (loading) {
        return (
            <div className="tc-root" style={{ background: t.bg }}>
                <GlobalStyles t={t} isDark={isDark} />
                <div className="tc-glow" />
                <div className="tc-content">
                    <TelaCarregando isDark={isDark} minHeight="40vh" background="transparent" />
                </div>
            </div>
        );
    }

    return (
        <div className="tc-root" style={{ background: t.bg }}>
            <GlobalStyles t={t} isDark={isDark} />
            <div className="tc-glow" />

            <div className="tc-content">
                {/* Header */}
                <motion.div
                    className="tc-header"
                    initial={{ opacity: 0, y: -18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="tc-header-left">
                        <p>📊 Performance Anual</p>
                        <h2>Comparativo de Entradas</h2>
                    </div>
                    <div className="tc-year-pill">
                        <Calendar size={14} color={t.textMuted} />
                        <input
                            type="number"
                            className="tc-year-input"
                            value={ano}
                            onChange={(e) => setAno(Number(e.target.value))}
                            title="Altere o ano"
                        />
                        <span className="tc-year-label">Exercício</span>
                    </div>
                </motion.div>

                {/* Metric Cards */}
                <motion.div
                    className="tc-cards"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <MetricCard
                        isDark={isDark}
                        label="Total Dízimos"
                        valor={totais.dizimo}
                        color={AURA.blue}
                        icon={<Wallet size={18} />}
                    />
                    <MetricCard
                        isDark={isDark}
                        label="Total Ofertas"
                        valor={totais.oferta}
                        color={AURA.yellow}
                        icon={<TrendingUp size={18} />}
                    />
                    <MetricCard
                        isDark={isDark}
                        label="Receita Consolidada"
                        valor={totais.geral}
                        color={AURA.red}
                        icon={<ArrowUpRight size={18} />}
                    />
                </motion.div>

                {/* Chart */}
                <motion.div
                    className="tc-panel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <div className="tc-panel-header">
                        <div className="tc-panel-icon">
                            <BarChart3 size={16} />
                        </div>
                        <h3 className="tc-panel-title">Fluxo Mensal de Entradas</h3>
                    </div>
                    <div className="tc-chart-wrap">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={comparativo} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={AURA.blue} stopOpacity={1} />
                                        <stop offset="100%" stopColor={AURA.blueDark} stopOpacity={0.25} />
                                    </linearGradient>
                                    <linearGradient id="gO" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={AURA.yellow} stopOpacity={1} />
                                        <stop offset="100%" stopColor={AURA.yellow} stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke={isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.1)"}
                                />
                                <XAxis
                                    dataKey="mes"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: t.textMuted,
                                        fontSize: 10,
                                        fontFamily: "Inter",
                                        fontWeight: 500,
                                    }}
                                    tickFormatter={(m) =>
                                        new Date(ano, m - 1)
                                            .toLocaleString("pt-BR", { month: "short" })
                                            .toUpperCase()
                                    }
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: t.textMuted,
                                        fontSize: 10,
                                        fontFamily: "Inter",
                                    }}
                                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                                    width={40}
                                />
                                <Tooltip
                                    cursor={{
                                        fill: isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.04)",
                                        rx: 8,
                                    }}
                                    contentStyle={{
                                        borderRadius: 10,
                                        border: `1px solid ${t.border}`,
                                        background: t.bgEl,
                                        fontFamily: "Inter",
                                        padding: "10px 16px",
                                    }}
                                    labelStyle={{ color: t.text }}
                                    formatter={(v) => [`R$ ${fmt(v)}`]}
                                />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="circle"
                                    wrapperStyle={{
                                        paddingBottom: 14,
                                        fontSize: 10,
                                        fontFamily: "Inter",
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        letterSpacing: ".08em",
                                        color: t.textMuted,
                                    }}
                                />
                                <Bar
                                    dataKey="totalDizimo"
                                    fill="url(#gD)"
                                    radius={[5, 5, 0, 0]}
                                    name="Dízimo"
                                    maxBarSize={40}
                                />
                                <Bar
                                    dataKey="totalOferta"
                                    fill="url(#gO)"
                                    radius={[5, 5, 0, 0]}
                                    name="Oferta"
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Table */}
                <motion.div
                    className="tc-panel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <div className="tc-panel-header">
                        <div className="tc-panel-icon">
                            <TableIcon size={16} />
                        </div>
                        <h3 className="tc-panel-title">Detalhamento Analítico</h3>
                    </div>
                    <div className="tc-table-wrap">
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
                                const perc =
                                    ((Number(c.totalDizimo) + Number(c.totalOferta)) /
                                        (totais.geral || 1)) *
                                    100;
                                return (
                                    <tr key={c.mes}>
                                        <td className="tc-month-cell">
                                            {MESES[c.mes - 1]}
                                        </td>
                                        <td className="tc-value-blue">
                                            R$ {fmt(c.totalDizimo)}
                                        </td>
                                        <td className="tc-value-yellow">
                                            R$ {fmt(c.totalOferta)}
                                        </td>
                                        <td className="tc-col-prop">
                                            <div className="tc-bar-wrap">
                                                <div className="tc-bar-track">
                                                    <div
                                                        className="tc-bar-fill"
                                                        style={{
                                                            width: `${Math.min(perc * 5, 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="tc-bar-percent">
                            {perc.toFixed(0)}%
                          </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function MetricCard({ isDark, label, valor, color, icon }) {
    const t = theme(isDark);

    return (
        <motion.div
            className="tc-card"
            style={{ "--card-accent": color, "--icon-bg": `${color}18`, "--icon-color": color, "--value-color": color }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
            <div className="tc-card-icon">{icon}</div>
            <p className="tc-card-label">{label}</p>
            <h3 className="tc-card-value">
                R$ {Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h3>
        </motion.div>
    );
}
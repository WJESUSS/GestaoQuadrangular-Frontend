import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid,
} from "recharts";
import {
  Wallet, Award, TrendingUp, Zap,
  ChevronLeft, ChevronRight, RefreshCcw,
  Sun, Moon, Home,
} from "lucide-react";

/* ─── Tokens AURA (mesmo padrão do Painel do Líder) ───────────────────── */
const AURA = {
  gold:       "#C9A96E",
  goldLight:  "#E8D5A3",
  dark:       "#0A0A0F",
  darkEl:     "#12121A",
  light:      "#F5F0E8",
  red:        "#C8102E",
  redDark:    "#9B0B1E",
  blue:       "#003DA5",
  blueDark:   "#002470",
  blueLight:  "#1A56C4",
  yellow:     "#FDB813",
  yellowDark: "#C48C00",
  silver:     "#9CA3AF",
  bronze:     "#B5651D",
};

function theme(isDark) {
  return {
    bg:        isDark ? "#0A0A0F"              : "#F5F0E8",
    bgEl:      isDark ? "rgba(18,18,26,.95)"    : "rgba(255,255,255,.95)",
    border:    isDark ? "rgba(201,169,110,.1)"  : "rgba(201,169,110,.2)",
    text:      isDark ? "#F5F0E8"               : "#1A1008",
    textSec:   isDark ? "#9A9588"               : "#6B5E4A",
    textMuted: isDark ? "#6B6658"               : "#9A9080",
    glow1:     isDark ? "rgba(201,169,110,.05)" : "rgba(201,169,110,.08)",
    glow2:     isDark ? "rgba(201,169,110,.04)" : "rgba(201,169,110,.06)",
    cardHover: isDark ? "rgba(201,169,110,.2)"  : "rgba(201,169,110,.35)",
  };
}

const THEME_KEY = "theme";

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

/* ─── Logo ─────────────────────────────────────────────────────────────── */
function IEQCross({ size = 36 }) {
  return (
      <img
          src="/quadrangular.png"
          alt="Logo IEQ"
          style={{
            width: size, height: size,
            borderRadius: "50%", objectFit: "cover", display: "block",
          }}
      />
  );
}

/* ─── CSS Global ────────────────────────────────────────────────────────── */
function GlobalStyles({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes dl-spin    { to { transform: rotate(360deg); } }
      @keyframes dl-pulse   { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes dl-blink   { 0%,100%{opacity:1;} 50%{opacity:.3;} }
      @keyframes dl-shimmer { 0%{background-position:-400px 0;} 100%{background-position:400px 0;} }

      .dl-spin  { animation: dl-spin  1s linear infinite; }
      .dl-pulse { animation: dl-pulse 3s ease-in-out infinite; }
      .dl-blink { animation: dl-blink 1.6s ease-in-out infinite; }

      .dl-root {
        font-family: 'Inter', sans-serif;
        background: ${t.bg};
        color: ${t.text};
        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
        padding-bottom: max(40px, env(safe-area-inset-bottom, 40px));
        transition: background .3s, color .3s;
        isolation: isolate;
      }
      .dl-glow {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
          radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%);
        transition: background .3s;
      }
      .dl-content {
        position: relative; z-index: 1;
        max-width: 1040px; margin: 0 auto;
        padding: 28px 18px 0;
      }
      @media(max-width: 420px) { .dl-content { padding: 18px 14px 0; } }

      /* ── Header ── */
      .dl-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; margin-bottom: 26px; flex-wrap: wrap;
      }
      .dl-header-left {
        display: flex; align-items: center; gap: 14px;
        flex: 1; min-width: 0;
      }
      .dl-avatar-wrap { position: relative; flex-shrink: 0; }
      .dl-ring {
        position: absolute; border-radius: 50%;
        border: 1px solid rgba(201,169,110,.22);
        top: 50%; left: 50%; transform: translate(-50%,-50%);
      }
      .dl-avatar {
        width: 52px; height: 52px; border-radius: 50%;
        border: 1.5px solid rgba(201,169,110,.28);
        background: ${isDark ? "rgba(18,18,26,.99)" : "#fff"};
        display: flex; align-items: center; justify-content: center; overflow: hidden;
        position: relative; z-index: 1;
      }
      .dl-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      .dl-title-block { flex: 1; min-width: 0; }
      .dl-eyebrow {
        font-size: 9px; font-weight: 500; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(201,169,110,.55);
        margin: 0 0 3px;
      }
      .dl-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(17px, 4.5vw, 23px);
        font-weight: 500; color: ${t.text};
        margin: 0; line-height: 1.2; letter-spacing: .02em;
      }
      .dl-title span { color: ${AURA.gold}; }
      .dl-subtitle {
        font-size: 11px; font-weight: 300; color: ${t.textSec};
        margin: 3px 0 0; overflow: hidden;
        text-overflow: ellipsis; white-space: nowrap;
      }
      .dl-header-actions {
        display: flex; align-items: center; gap: 8px; flex-shrink: 0;
      }
      .dl-btn-ico {
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${t.border};
        border-radius: 12px; width: 38px; height: 38px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        color: ${t.textMuted}; transition: all .25s; flex-shrink: 0;
      }
      .dl-btn-ico:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

      .dl-btn-home {
        display: flex; align-items: center; gap: 7px;
        height: 38px; padding: 0 18px; border-radius: 100px; border: none;
        cursor: pointer;
        background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight});
        color: #0A0A0F; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; transition: all .3s; flex-shrink: 0;
        box-shadow: 0 6px 20px rgba(201,169,110,.25);
      }
      .dl-btn-home:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(201,169,110,.32); }
      @media(max-width: 380px) {
        .dl-btn-home { width: 38px; padding: 0; justify-content: center; }
        .dl-btn-home .dl-btn-label { display: none; }
      }

      /* ── Divider + Badge ── */
      .dl-divider {
        display: flex; align-items: center; gap: 10px; margin: 0 0 22px;
      }
      .dl-divider::before {
        content: ''; flex: 1; height: 1px;
        background: linear-gradient(to right, transparent, ${AURA.gold});
      }
      .dl-divider::after {
        content: ''; flex: 1; height: 1px;
        background: linear-gradient(to left, transparent, ${AURA.gold});
      }
      .dl-divider-dot { width: 5px; height: 5px; border-radius: 50%; background: ${AURA.gold}; }

      .dl-badge {
        display: inline-flex; align-items: center; gap: 7px;
        background: rgba(201,169,110,.07);
        border: 1px solid rgba(201,169,110,.2);
        border-radius: 100px; padding: 8px 18px;
        font-size: 10px; font-weight: 500; letter-spacing: .1em;
        text-transform: uppercase; color: ${AURA.gold};
        white-space: nowrap;
      }
      .dl-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: ${AURA.gold}; }
      .dl-badge-center { display: flex; justify-content: center; margin-bottom: 24px; }

      .dl-divider-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.15), transparent);
        margin: 2px 0;
      }
      .dl-footer {
        text-align: center;
        font-size: 9px; font-weight: 500; letter-spacing: .18em;
        text-transform: uppercase;
        color: ${isDark ? "rgba(245,240,232,.12)" : "rgba(26,16,8,.15)"};
        padding: 16px 0 24px;
      }

      /* ── Skeleton ── */
      .dl-skel {
        background: linear-gradient(90deg,
          ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.06)"} 25%,
          ${isDark ? "rgba(201,169,110,.18)" : "rgba(201,169,110,.13)"} 50%,
          ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.06)"} 75%
        );
        background-size: 400px 100%;
        animation: dl-shimmer 1.4s infinite;
        border-radius: 8px;
      }

      /* ── Hero (Total do período) ── */
      .dl-kpi-hero {
        background: linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark});
        border: 1px solid rgba(201,169,110,.12);
        border-radius: 20px; padding: 26px 22px; position: relative; overflow: hidden;
        margin-bottom: 20px;
      }
      .dl-kpi-stripes {
        position: absolute; inset: 0; pointer-events: none;
        background-image: repeating-linear-gradient(
          -55deg, rgba(255,255,255,.025) 0 8px, transparent 8px 16px
        );
      }
      .dl-kpi-inner { position: relative; z-index: 1; }
      .dl-big-num {
        font-family: 'Playfair Display', serif;
        font-size: clamp(30px, 8vw, 46px);
        font-weight: 600; color: #fff; line-height: 1; margin: 10px 0 6px;
      }
      .dl-kpi-label {
        font-size: 9px; font-weight: 600; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(255,255,255,.55);
      }
      .dl-kpi-desc {
        font-size: 11px; font-weight: 300; color: rgba(255,255,255,.45);
        margin-top: 8px; line-height: 1.6; max-width: 380px;
      }

      /* ── Filtro / período ── */
      .dl-filter-card {
        padding: 14px 16px; margin-bottom: 20px;
        display: flex; flex-direction: column; gap: 10px;
      }
      @media(min-width: 560px) {
        .dl-filter-card { flex-direction: row; align-items: center; flex-wrap: wrap; }
      }
      .dl-filter-nav {
        display: flex; align-items: center; gap: 8px; flex: 1; flex-wrap: wrap;
      }
      .dl-mode-bar {
        display: flex; gap: 4px; flex-shrink: 0; padding: 5px; border-radius: 12px;
        background: ${isDark ? "rgba(201,169,110,.05)" : "rgba(201,169,110,.05)"};
        border: 1px solid ${t.border};
      }
      .dl-mode-btn {
        flex: 1; padding: 9px 16px; border-radius: 9px; border: none; cursor: pointer;
        font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600;
        letter-spacing: .18em; text-transform: uppercase; transition: all .25s;
        background: transparent; color: ${t.textMuted};
      }
      .dl-mode-btn.active {
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        color: #fff; box-shadow: 0 3px 10px rgba(200,16,46,.25);
      }
      .dl-mode-btn:not(.active):hover { color: ${AURA.gold}; }

      .dl-nav-pill {
        display: flex; align-items: center; border-radius: 10px; padding: 4px;
        background: ${isDark ? "rgba(201,169,110,.05)" : "rgba(201,169,110,.04)"};
        border: 1px solid ${t.border};
      }
      .dl-nav-btn {
        background: none; border: none; cursor: pointer; padding: 7px; border-radius: 8px;
        color: ${t.textMuted}; transition: all .2s; display: flex; align-items: center;
      }
      .dl-nav-btn:hover { background: rgba(201,169,110,.12); color: ${AURA.gold}; }
      .dl-nav-label {
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
        letter-spacing: .14em; text-transform: uppercase; color: ${t.text};
        min-width: 92px; text-align: center;
      }
      .dl-nav-label.ano { min-width: 52px; }

      .dl-btn-refresh {
        background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue});
        color: #fff; border: none; border-radius: 10px; padding: 10px;
        cursor: pointer; transition: all .25s; display: flex; flex-shrink: 0;
      }
      .dl-btn-refresh:hover { filter: brightness(1.15); }

      /* ── KPIs ── */
      .dl-kpi-grid-2 {
        display: grid; grid-template-columns: repeat(2, 1fr);
        gap: 10px; margin-bottom: 20px;
      }
      @media(min-width: 640px) { .dl-kpi-grid-2 { grid-template-columns: repeat(4, 1fr); gap: 14px; } }

      .dl-kpi-mini {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-bottom: 3px solid var(--kpi-accent, ${AURA.gold});
        border-radius: 16px; padding: 16px 14px;
        display: flex; flex-direction: column; gap: 14px;
        cursor: pointer; position: relative; overflow: hidden;
        backdrop-filter: blur(20px); transition: all .3s;
      }
      .dl-kpi-mini:hover {
        transform: translateY(-3px); border-color: ${t.cardHover};
        box-shadow: 0 12px 32px rgba(0,0,0,${isDark ? ".4" : ".1"});
      }
      .dl-kpi-mini:active { transform: scale(.97); }
      .dl-kpi-mini-icon {
        width: 36px; height: 36px; border-radius: 10px;
        background: var(--kpi-bg, rgba(201,169,110,.1));
        color: var(--kpi-accent, ${AURA.gold});
        display: flex; align-items: center; justify-content: center;
      }
      .dl-kpi-mini-label {
        font-size: 9px; font-weight: 600; letter-spacing: .18em;
        text-transform: uppercase; color: ${t.textMuted}; margin: 0 0 5px;
      }
      .dl-kpi-mini-value {
        font-family: 'Playfair Display', serif;
        font-size: clamp(13px, 2.6vw, 17px); font-weight: 600; color: ${t.text};
        margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      /* ── Cards genéricos ── */
      .dl-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 18px; overflow: hidden; position: relative;
        backdrop-filter: blur(20px);
      }
      .dl-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }
      .dl-card-head {
        padding: 18px 20px; border-bottom: 1px solid ${t.border};
        display: flex; align-items: center; gap: 12px;
      }
      .dl-card-head-icon {
        width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
        background: rgba(201,169,110,.1); color: ${AURA.gold};
        display: flex; align-items: center; justify-content: center;
      }
      .dl-card-head-title {
        font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 500;
        color: ${t.text}; margin: 0; letter-spacing: .12em; text-transform: uppercase;
      }
      .dl-card-pad { padding: 20px; }

      /* ── Grid Gráfico + Resumo ── */
      .dl-bottom-grid {
        display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 20px;
      }
      @media(min-width: 860px) { .dl-bottom-grid { grid-template-columns: 2fr 1fr; } }

      /* ── Resumo do período (gradiente) ── */
      .dl-summary {
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.blueDark});
        border: 1px solid rgba(201,169,110,.12);
        border-radius: 18px; padding: 22px 20px;
        display: flex; flex-direction: column; justify-content: space-between;
        position: relative; overflow: hidden; color: #fff;
      }
      .dl-summary::before {
        content: ''; position: absolute; inset: 0; pointer-events: none;
        background-image: repeating-linear-gradient(
          -55deg, rgba(255,255,255,.04) 0 10px, transparent 10px 20px
        );
      }
      .dl-summary-eyebrow {
        font-size: 9px; font-weight: 600; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(255,255,255,.6); margin: 0 0 4px;
        position: relative; z-index: 1;
      }
      .dl-summary-title {
        font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 600;
        color: #fff; margin: 0 0 22px; line-height: 1.2;
        position: relative; z-index: 1;
      }
      .dl-summary-row {
        display: flex; align-items: center; justify-content: space-between;
        border-bottom: 1px solid rgba(255,255,255,.12);
        padding-bottom: 12px; margin-bottom: 12px;
        position: relative; z-index: 1;
      }
      .dl-summary-row:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
      .dl-summary-label {
        font-size: 9.5px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; color: rgba(255,255,255,.7);
      }
      .dl-summary-value {
        font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 600; color: #fff;
      }
      .dl-summary-btn {
        background: rgba(255,255,255,.15); color: #fff;
        border: 1px solid rgba(255,255,255,.3); border-radius: 100px;
        padding: 13px 18px; width: 100%; margin-top: 22px;
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
        letter-spacing: .18em; text-transform: uppercase; cursor: pointer;
        transition: all .25s; position: relative; z-index: 1;
      }
      .dl-summary-btn:hover { background: rgba(255,255,255,.25); transform: translateY(-2px); }
    `}</style>
  );
}

/* ─── Componente Principal ─────────────────────────────────────────────── */
export default function TesourariaDashboard() {
  const navigate = useNavigate();
  const hoje     = new Date();

  const [isDark, setIsDark] = useState(
      () => localStorage.getItem(THEME_KEY) === "dark"
  );
  const t = theme(isDark);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

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
      const res   = await api.get(endpoint, { params });
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
    { tipo:"Dízimo", valor:resumo.DIZIMO, cor:AURA.blue   },
    { tipo:"Bronze", valor:resumo.BRONZE, cor:AURA.bronze },
    { tipo:"Prata",  valor:resumo.PRATA,  cor:AURA.silver },
    { tipo:"Ouro",   valor:resumo.OURO,   cor:AURA.gold   },
  ];

  const fmt = (v) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits:2 });

  return (
      <div className="dl-root">
        <GlobalStyles t={t} isDark={isDark} />
        <div className="dl-glow" />

        <div className="dl-content">

          {/* ── Header ── */}
          <motion.header
              className="dl-header"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4 }}
          >
            <div className="dl-header-left">
              <div className="dl-avatar-wrap">
                <div className="dl-ring dl-pulse" style={{ width: 50, height: 70 }} />
                <div className="dl-ring dl-pulse" style={{ width: 56, height: 56, animationDelay: ".9s" }} />
                <div className="dl-avatar">
                  <IEQCross size={34} />
                </div>
              </div>
              <div className="dl-title-block">
                <p className="dl-eyebrow">Gestão Financeira</p>
                <h1 className="dl-title">IEQ <span>Pituaçu</span></h1>
                <p className="dl-subtitle">Tesouraria · Dashboard Financeiro</p>
              </div>
            </div>

            <div className="dl-header-actions">
              <button className="dl-btn-ico" onClick={() => setIsDark(!isDark)} title="Tema">
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button className="dl-btn-home" onClick={() => navigate("/tesouraria")}>
                <Home size={14} /> <span className="dl-btn-label">Módulos</span>
              </button>
            </div>
          </motion.header>

          {/* ── Divider + Badge ── */}
          <div className="dl-divider"><div className="dl-divider-dot" /></div>
          <div className="dl-badge-center">
            <span className="dl-badge">
              <span className="dl-badge-dot dl-blink" /> Dados em tempo real
            </span>
          </div>

          {/* ── Hero: Total do período ── */}
          <motion.div
              className="dl-kpi-hero"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4, delay: .1 }}
          >
            <div className="dl-kpi-stripes" />
            <div className="dl-kpi-inner">
              <span className="dl-badge" style={{ fontSize: 9, padding: "4px 11px" }}>
                <Zap size={10} /> {periodoLabel}
              </span>
              {loading
                  ? <div className="dl-skel" style={{ height: 46, width: 200, margin: "10px 0 6px" }} />
                  : <p className="dl-big-num">R$ {fmt(totalGeral)}</p>
              }
              <p className="dl-kpi-label">Total Geral do Período</p>
              <p className="dl-kpi-desc">
                Soma de dízimos e ofertas (bronze, prata e ouro) lançados no período selecionado.
              </p>
            </div>
          </motion.div>

          {/* ── Filtro de período ── */}
          <div className="dl-card dl-filter-card">
            <div className="dl-mode-bar">
              {["mensal","anual"].map(m => (
                  <button key={m} className={`dl-mode-btn ${modo===m ? "active" : ""}`} onClick={() => setModo(m)}>
                    {m}
                  </button>
              ))}
            </div>

            <div className="dl-filter-nav">
              {modo === "mensal" && (
                  <div className="dl-nav-pill" style={{ flex: 1 }}>
                    <button className="dl-nav-btn" onClick={() => setMes(p => p===1?12:p-1)}><ChevronLeft size={16}/></button>
                    <span className="dl-nav-label">{MESES[mes-1]}</span>
                    <button className="dl-nav-btn" onClick={() => setMes(p => p===12?1:p+1)}><ChevronRight size={16}/></button>
                  </div>
              )}
              <div className="dl-nav-pill">
                <button className="dl-nav-btn" onClick={() => setAno(p => p-1)}><ChevronLeft size={16}/></button>
                <span className="dl-nav-label ano">{ano}</span>
                <button className="dl-nav-btn" onClick={() => setAno(p => p+1)}><ChevronRight size={16}/></button>
              </div>
              <button className="dl-btn-refresh" onClick={carregar}>
                <RefreshCcw size={16} className={loading ? "dl-spin" : ""} />
              </button>
            </div>
          </div>

          {/* ── KPI Cards ── */}
          <div className="dl-kpi-grid-2">
            <KpiCard t={t} isDark={isDark} titulo="Dízimos" valor={resumo.DIZIMO} icon={<Wallet size={18}/>} accent={AURA.blue}   loading={loading} onClick={() => irParaFiltro("TODOS")}  />
            <KpiCard t={t} isDark={isDark} titulo="Ouro"    valor={resumo.OURO}   icon={<Award  size={18}/>} accent={AURA.gold}   loading={loading} onClick={() => irParaFiltro("OURO")}   />
            <KpiCard t={t} isDark={isDark} titulo="Prata"   valor={resumo.PRATA}  icon={<Award  size={18}/>} accent={AURA.silver} loading={loading} onClick={() => irParaFiltro("PRATA")}  />
            <KpiCard t={t} isDark={isDark} titulo="Bronze"  valor={resumo.BRONZE} icon={<Award  size={18}/>} accent={AURA.bronze} loading={loading} onClick={() => irParaFiltro("BRONZE")} />
          </div>

          {/* ── Gráfico + Resumo ── */}
          <div className="dl-bottom-grid">

            {/* Gráfico */}
            <div className="dl-card">
              <div className="dl-card-head">
                <div className="dl-card-head-icon"><TrendingUp size={15}/></div>
                <h3 className="dl-card-head-title">Fluxo por Categoria</h3>
              </div>
              <div className="dl-card-pad">
                <div style={{ height: "clamp(220px, 48vw, 300px)" }}>
                  {loading ? (
                      <div className="dl-skel" style={{ height: "100%" }} />
                  ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dadosGrafico} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.border} />
                          <XAxis dataKey="tipo" axisLine={false} tickLine={false}
                                 tick={{ fill: t.textMuted, fontFamily: "Inter", fontWeight: 600, fontSize: 9, letterSpacing: ".06em" }}
                          />
                          <YAxis hide />
                          <Tooltip
                              cursor={{ fill: isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.06)" }}
                              contentStyle={{ borderRadius: 10, border: `1px solid ${t.border}`, background: t.bgEl, fontFamily: "Inter", padding: "10px 16px" }}
                              labelStyle={{ color: t.text, fontWeight: 600 }}
                              itemStyle={{ color: t.textSec }}
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
            </div>

            {/* Resumo */}
            <div className="dl-summary">
              <div>
                <p className="dl-summary-eyebrow">Resumo do Período</p>
                <h4 className="dl-summary-title">{periodoLabel}</h4>

                {[
                  { label:"Dízimos", valor:resumo.DIZIMO },
                  { label:"Ofertas", valor:totalOfertas  },
                  { label:"Total",   valor:totalGeral    },
                ].map(item => (
                    <div key={item.label} className="dl-summary-row">
                      <span className="dl-summary-label">{item.label}</span>
                      <span className="dl-summary-value">
                        {loading ? "…" : `R$ ${fmt(item.valor)}`}
                      </span>
                    </div>
                ))}
              </div>

              <button className="dl-summary-btn" onClick={() => navigate("/tesouraria/relatorio")}>
                Ver Relatórios Completos
              </button>
            </div>

          </div>

          <div className="dl-divider-line" style={{ margin: "8px 0 16px" }} />
          <p className="dl-footer">© {new Date().getFullYear()} IEQ Pituaçu — Tesouraria</p>
        </div>
      </div>
  );
}

/* ─── KPI Card ─────────────────────────────────────────────────────────── */
function KpiCard({ t, titulo, valor, icon, accent, loading, onClick }) {
  return (
      <motion.div
          className="dl-kpi-mini"
          style={{ "--kpi-accent": accent, "--kpi-bg": `${accent}18` }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: .97 }}
          onClick={onClick}
      >
        <div className="dl-kpi-mini-icon">{icon}</div>
        <div>
          <p className="dl-kpi-mini-label">{titulo}</p>
          {loading
              ? <div className="dl-skel" style={{ height: 20, width: 100 }} />
              : <p className="dl-kpi-mini-value">R$ {Number(valor).toLocaleString("pt-BR", { minimumFractionDigits:2 })}</p>
          }
        </div>
      </motion.div>
  );
}
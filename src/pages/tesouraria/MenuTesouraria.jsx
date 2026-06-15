import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet, BarChart3, FileText, Users,
  TrendingUp, ShieldCheck, Sun, Moon, ChevronRight, Home,
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

      @keyframes dl-spin  { to { transform: rotate(360deg); } }
      @keyframes dl-pulse { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes dl-blink { 0%,100%{opacity:1;} 50%{opacity:.3;} }

      .dl-spin  { animation: dl-spin  1s linear infinite; }
      .dl-pulse { animation: dl-pulse 3s ease-in-out infinite; }
      .dl-blink { animation: dl-blink 2s ease-in-out infinite; }

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

      .dl-section-hd {
        display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
      }
      .dl-section-title {
        font-family: 'Playfair Display', serif;
        font-size: 15px; font-weight: 500; color: ${t.text};
      }

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

      /* ── Hero ── */
      .mt-hero {
        background: linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark});
        border: 1px solid rgba(201,169,110,.12);
        border-radius: 20px; padding: 26px 22px; margin-bottom: 22px;
        position: relative; overflow: hidden;
      }
      .mt-hero-stripes {
        position: absolute; inset: 0; pointer-events: none;
        background-image: repeating-linear-gradient(
          -55deg, rgba(255,255,255,.025) 0 8px, transparent 8px 16px
        );
      }
      .mt-hero-inner { position: relative; z-index: 1; }
      .mt-hero-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(22px, 5.5vw, 32px);
        font-weight: 600; color: #fff; margin: 12px 0 8px; line-height: 1.15;
      }
      .mt-hero-desc {
        font-size: 12px; font-weight: 300; color: rgba(255,255,255,.55);
        max-width: 460px; line-height: 1.65; margin: 0;
      }

      /* ── Grid de módulos ── */
      .mt-grid {
        display: grid; grid-template-columns: 1fr;
        gap: 12px; margin-bottom: 22px;
      }
      @media(min-width: 480px) { .mt-grid { grid-template-columns: repeat(2, 1fr); } }
      @media(min-width: 860px) { .mt-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }

      .mt-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 18px; padding: 20px 18px;
        display: flex; flex-direction: column; gap: 10px;
        cursor: pointer; position: relative; overflow: hidden;
        backdrop-filter: blur(20px);
        transition: border-color .35s, box-shadow .35s;
      }
      .mt-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
        background: var(--card-grad); opacity: 0; transition: opacity .35s;
      }
      .mt-card:hover {
        border-color: ${t.cardHover};
        box-shadow: 0 14px 36px rgba(0,0,0,${isDark ? ".45" : ".12"});
      }
      .mt-card:hover::before { opacity: 1; }
      .mt-card-icon {
        width: 46px; height: 46px; border-radius: 13px;
        display: flex; align-items: center; justify-content: center;
      }
      .mt-card-label {
        font-size: 9px; font-weight: 600; letter-spacing: .2em;
        text-transform: uppercase; color: ${t.textMuted}; margin: 0;
      }
      .mt-card-title {
        font-family: 'Playfair Display', serif;
        font-size: 17px; font-weight: 500; color: ${t.text}; margin: 0;
      }
      .mt-card-desc {
        font-size: 12px; font-weight: 300; color: ${t.textSec};
        line-height: 1.6; margin: 0; flex: 1;
      }
      .mt-card-foot {
        display: flex; align-items: center; justify-content: space-between;
        margin-top: 4px; padding-top: 12px;
        border-top: 1px solid ${isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.12)"};
      }
      .mt-card-tag {
        font-size: 9px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; color: ${t.textMuted};
      }
      .mt-card-arrow { color: ${t.textMuted}; transition: transform .3s, color .3s; flex-shrink: 0; }
      .mt-card:hover .mt-card-arrow { transform: translateX(4px); color: ${AURA.gold}; }
    `}</style>
  );
}

/* ─── Componente Principal ─────────────────────────────────────────────── */
export default function MenuTesouraria() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
      () => localStorage.getItem(THEME_KEY) === "dark"
  );

  const t = theme(isDark);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  const modulos = [
    {
      id: "lancamento",
      label: "Gestão de Entradas",
      title: "Lançamento",
      desc: "Registro de dízimos e ofertas em tempo real.",
      icon: <Wallet size={20} />,
      page: "/tesouraria/lancamento",
      color: AURA.red,
      gradient: `${AURA.redDark}, ${AURA.red}`,
    },
    {
      id: "dashboard",
      label: "Visão Geral",
      title: "Dashboard",
      desc: "Indicadores de desempenho e KPIs financeiros.",
      icon: <BarChart3 size={20} />,
      page: "/tesouraria/dashboard",
      color: AURA.blue,
      gradient: `${AURA.blueDark}, ${AURA.blue}`,
    },
    {
      id: "relatorio",
      label: "Documentação",
      title: "Relatório",
      desc: "Exportação executiva de dados em PDF.",
      icon: <FileText size={20} />,
      page: "/tesouraria/relatorio",
      color: AURA.gold,
      gradient: `${AURA.yellowDark}, ${AURA.gold}`,
    },
    {
      id: "dizimistas",
      label: "Fidelidade",
      title: "Dizimistas",
      desc: "Monitoramento de contribuintes ativos e pendentes.",
      icon: <Users size={20} />,
      page: "/tesouraria/dizimistas",
      color: AURA.redDark,
      gradient: `${AURA.redDark}, ${AURA.red}`,
    },
    {
      id: "comparativo",
      label: "Análise de Dados",
      title: "Comparativo",
      desc: "Evolução mensal e histórico anual consolidado.",
      icon: <TrendingUp size={20} />,
      page: "/tesouraria/comparativo",
      color: AURA.blueLight,
      gradient: `${AURA.blueDark}, ${AURA.blueLight}`,
    },
  ];

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
                <p className="dl-subtitle">Tesouraria · Painel de Módulos</p>
              </div>
            </div>

            <div className="dl-header-actions">
              <button className="dl-btn-ico" onClick={() => setIsDark(!isDark)} title="Tema">
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button className="dl-btn-home" onClick={() => navigate("/")}>
                <Home size={14} /> <span className="dl-btn-label">Início</span>
              </button>
            </div>
          </motion.header>

          {/* ── Divider + Badge ── */}
          <div className="dl-divider"><div className="dl-divider-dot" /></div>
          <div className="dl-badge-center">
            <span className="dl-badge">
              <ShieldCheck size={11} />
              <strong style={{ color: t.text, fontWeight: 600 }}>Sistema Seguro</strong>
            </span>
          </div>

          {/* ── Hero ── */}
          <motion.div
              className="mt-hero"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4, delay: .1 }}
          >
            <div className="mt-hero-stripes" />
            <div className="mt-hero-inner">
              <span className="dl-badge" style={{ fontSize: 9, padding: "4px 11px" }}>
                <TrendingUp size={10} /> Módulos disponíveis
              </span>
              <h2 className="mt-hero-title">Selecione uma área</h2>
              <p className="mt-hero-desc">
                Gerenciamento completo das finanças da célula e da congregação: lançamentos,
                relatórios, dizimistas e indicadores em um só lugar.
              </p>
            </div>
          </motion.div>

          {/* ── Módulos ── */}
          <div className="dl-section-hd">
            <span className="dl-section-title">Módulos da Tesouraria</span>
          </div>

          <div className="mt-grid">
            {modulos.map((m, i) => (
                <motion.div
                    key={m.id}
                    className="mt-card"
                    style={{ "--card-grad": `linear-gradient(135deg, ${m.gradient})` }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .35, delay: i * 0.06 }}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: .97 }}
                    onClick={() => navigate(m.page)}
                >
                  <div className="mt-card-icon" style={{ background: `${m.color}18`, color: m.color }}>
                    {m.icon}
                  </div>
                  <p className="mt-card-label">{m.label}</p>
                  <h3 className="mt-card-title">{m.title}</h3>
                  <p className="mt-card-desc">{m.desc}</p>
                  <div className="mt-card-foot">
                    <span className="mt-card-tag">Acessar</span>
                    <ChevronRight size={16} className="mt-card-arrow" />
                  </div>
                </motion.div>
            ))}
          </div>

          <div className="dl-divider-line" style={{ margin: "8px 0 16px" }} />
          <p className="dl-footer">© {new Date().getFullYear()} IEQ Pituaçu — Tesouraria</p>
        </div>
      </div>
  );
}
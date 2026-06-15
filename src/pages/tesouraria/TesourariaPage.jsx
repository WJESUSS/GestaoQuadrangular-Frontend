import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart2, DollarSign, FileText, Users,
  TrendingUp, ArrowLeft, LogOut, Sun, Moon,
} from "lucide-react";

import TesourariaDashboard   from "./TesourariaDashboard.jsx";
import TesourariaLancamento  from "./TesourariaLancamento.jsx";
import TesourariaRelatorio   from "./TesourariaRelatorio.jsx";
import TesourariaDizimistas  from "./TesourariaDizimistas.jsx";
import TesourariaComparativo from "./TesourariaComparativo.jsx";

/* ─── Tokens AURA ─────────────────────────────────────────────────── */
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

function t(isDark) {
  return {
    bg:          isDark ? "#0A0A0F"               : "#F5F0E8",
    bgEl:        isDark ? "rgba(18,18,26,.97)"     : "rgba(255,255,255,.95)",
    bgInput:     isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.1)"   : "rgba(201,169,110,.2)",
    text:        isDark ? "#F5F0E8"                : "#1A1008",
    textSec:     isDark ? "#9A9588"                : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"                : "#9A9080",
    glow1:       isDark ? "rgba(201,169,110,.05)"  : "rgba(201,169,110,.08)",
    glow2:       isDark ? "rgba(201,169,110,.04)"  : "rgba(201,169,110,.06)",
    headerBg:    isDark ? "rgba(10,10,15,.97)"     : "rgba(245,240,232,.97)",
    cardHover:   isDark ? "rgba(201,169,110,.18)"  : "rgba(201,169,110,.3)",
    shadow:      isDark ? "rgba(0,0,0,.5)"         : "rgba(0,0,0,.1)",
  };
}

function GlobalStyles({ tk, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      *, *::before, *::after { box-sizing: border-box; }

      @keyframes tp-pulse  { 0%,100%{opacity:.2} 50%{opacity:.06} }
      @keyframes tp-blink  { 0%,100%{opacity:1}  50%{opacity:.3}  }
      @keyframes tp-fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      @keyframes tp-spin   { to{transform:rotate(360deg)} }
      @keyframes tp-stripe {
        0%   { background-position: 0 0; }
        100% { background-position: 60px 60px; }
      }

      .tp-root {
        font-family: 'Inter', sans-serif;
        background: ${tk.bg};
        color: ${tk.text};
        min-height: 100vh;
        min-height: 100dvh;
        overflow-x: hidden;
        position: relative;
        transition: background .3s, color .3s;
        isolation: isolate;
        padding-bottom: max(60px, env(safe-area-inset-bottom, 60px));
      }

      .tp-glow {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 15% 0%,   ${tk.glow1} 0%, transparent 55%),
          radial-gradient(ellipse at 85% 100%,  ${tk.glow2} 0%, transparent 55%);
        transition: background .3s;
      }

      .tp-stripe-bg {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background: repeating-linear-gradient(
          -55deg,
          ${isDark ? "rgba(201,169,110,.02)" : "rgba(201,169,110,.04)"} 0 10px,
          transparent 10px 30px
        );
        background-size: 60px 60px;
        animation: tp-stripe 14s linear infinite;
        opacity: .5;
      }

      .tp-content {
        position: relative; z-index: 1;
        max-width: 960px; margin: 0 auto;
        padding: 24px 16px 0;
      }
      @media (min-width: 640px) { .tp-content { padding: 32px 24px 0; } }

      /* ── Navbar ── */
      .tp-nav {
        display: flex; align-items: center;
        justify-content: space-between;
        flex-wrap: wrap; gap: 10px;
        margin-bottom: 28px;
        background: ${tk.bgEl};
        border: 1px solid ${tk.border};
        border-radius: 20px;
        padding: 12px 16px;
        backdrop-filter: blur(24px);
        position: relative; overflow: hidden;
      }
      .tp-nav::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }
      .tp-nav-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
      .tp-nav-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

      /* ── Avatar / logo ── */
      .tp-logo-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .tp-logo-ring {
        position: absolute; border-radius: 50%;
        border: 1px solid rgba(201,169,110,.22);
        top: 50%; left: 50%; transform: translate(-50%,-50%);
        animation: tp-pulse 3s ease-in-out infinite;
      }
      .tp-logo-inner {
        width: 46px; height: 46px; border-radius: 50%;
        background: ${isDark ? "rgba(18,18,26,.99)" : "#fff"};
        border: 1.5px solid rgba(201,169,110,.28);
        display: flex; align-items: center; justify-content: center;
        position: relative; z-index: 1; overflow: hidden; flex-shrink: 0;
      }
      .tp-logo-inner img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

      .tp-eyebrow {
        font-size: 9px; font-weight: 500; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(201,169,110,.55); margin: 0 0 2px;
      }
      .tp-nav-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(14px, 3.5vw, 18px);
        font-weight: 500; color: ${tk.text};
        margin: 0; letter-spacing: .02em; line-height: 1.2;
      }
      .tp-nav-title span { color: ${AURA.gold}; }
      .tp-nav-sub {
        font-size: 10px; font-weight: 300; color: ${tk.textMuted};
        margin: 2px 0 0; letter-spacing: .08em;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      /* ── Botões navbar ── */
      .tp-btn-ico {
        width: 36px; height: 36px; border-radius: 11px; cursor: pointer;
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${tk.border};
        display: flex; align-items: center; justify-content: center;
        color: ${tk.textMuted}; transition: all .25s; flex-shrink: 0;
      }
      .tp-btn-ico:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

      .tp-btn-back {
        display: flex; align-items: center; gap: 6px;
        padding: 0 14px; height: 36px; border-radius: 100px;
        border: 1px solid ${tk.border}; cursor: pointer;
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        color: ${tk.textSec}; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; transition: all .25s; flex-shrink: 0;
      }
      .tp-btn-back:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

      .tp-btn-exit {
        display: flex; align-items: center; gap: 6px;
        padding: 0 16px; height: 36px; border-radius: 100px; border: none;
        cursor: pointer;
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; transition: all .3s; flex-shrink: 0;
        box-shadow: 0 4px 16px rgba(200,16,46,.28);
      }
      .tp-btn-exit:hover { opacity: .88; transform: translateY(-1px); }

      /* ── Divider ── */
      .tp-divider {
        display: flex; align-items: center; gap: 10px; margin: 0 0 24px;
      }
      .tp-divider::before {
        content: ''; flex: 1; height: 1px;
        background: linear-gradient(to right, transparent, ${AURA.gold});
      }
      .tp-divider::after {
        content: ''; flex: 1; height: 1px;
        background: linear-gradient(to left, transparent, ${AURA.gold});
      }
      .tp-divider-dot { width: 5px; height: 5px; border-radius: 50%; background: ${AURA.gold}; }

      /* ── Badge ── */
      .tp-badge {
        display: inline-flex; align-items: center; gap: 7px;
        background: rgba(201,169,110,.07);
        border: 1px solid rgba(201,169,110,.2);
        border-radius: 100px; padding: 7px 16px;
        font-size: 10px; font-weight: 500; letter-spacing: .1em;
        text-transform: uppercase; color: ${AURA.gold}; white-space: nowrap;
      }
      .tp-badge-dot {
        width: 5px; height: 5px; border-radius: 50%; background: ${AURA.gold};
        animation: tp-blink 2s ease-in-out infinite;
      }

      /* ── Intro ── */
      .tp-intro { margin-bottom: 24px; animation: tp-fadeUp .4s ease; }
      .tp-intro h2 {
        font-family: 'Playfair Display', serif;
        font-size: clamp(1.5rem, 5vw, 2.2rem);
        font-weight: 500; color: ${tk.text};
        margin: 0 0 4px; letter-spacing: .02em; line-height: 1.15;
      }
      .tp-intro p {
        font-size: 13px; font-weight: 300; color: ${tk.textSec}; margin: 0;
      }

      /* ── Grid de cards ── */
      .tp-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px; margin-bottom: 28px;
      }
      @media (min-width: 480px) { .tp-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
      @media (min-width: 768px) { .tp-grid { gap: 16px; } }

      /* ── Card de módulo ── */
      .tp-card {
        background: ${tk.bgEl};
        border: 1px solid ${tk.border};
        border-radius: 20px; cursor: pointer;
        display: flex; flex-direction: column;
        padding: 18px 16px; gap: 14px;
        transition: all .35s cubic-bezier(.4,0,.2,1);
        backdrop-filter: blur(20px);
        position: relative; overflow: hidden;
        animation: tp-fadeUp .4s ease both;
        -webkit-tap-highlight-color: transparent;
      }
      .tp-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
        border-radius: 20px 20px 0 0; opacity: 0; transition: opacity .35s;
      }
      .tp-card::after {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.15), transparent);
      }
      .tp-card:hover {
        transform: translateY(-5px);
        border-color: ${tk.cardHover};
        box-shadow: 0 16px 40px ${tk.shadow};
      }
      .tp-card:hover::before { opacity: 1; }
      .tp-card:active { transform: scale(.97); }

      .tp-card-icon {
        width: 42px; height: 42px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
      }
      .tp-card-name {
        font-family: 'Playfair Display', serif;
        font-size: 15px; font-weight: 500; color: ${tk.text};
        margin: 0 0 3px; line-height: 1.2;
      }
      .tp-card-desc {
        font-size: 10px; font-weight: 400; letter-spacing: .08em;
        text-transform: uppercase; color: ${tk.textMuted}; margin: 0;
      }
      .tp-card-arrow {
        margin-top: auto;
        display: flex; align-items: center; gap: 4px;
        font-size: 9px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; color: ${AURA.gold};
        opacity: 0; transition: opacity .3s;
      }
      .tp-card:hover .tp-card-arrow { opacity: 1; }

      /* Card sair (dashed) */
      .tp-card-exit {
        border-style: dashed;
        background: ${isDark ? "rgba(18,18,26,.5)" : "rgba(255,255,255,.5)"};
        align-items: center; justify-content: center; gap: 8px;
      }
      .tp-card-exit:hover { border-color: rgba(201,169,110,.4); }

      /* ── Wrapper do sub-módulo ── */
      .tp-module-wrap {
        background: ${tk.bgEl};
        border: 1px solid ${tk.border};
        border-radius: 20px; overflow: hidden;
        backdrop-filter: blur(24px); position: relative;
        animation: tp-fadeUp .35s ease;
      }
      .tp-module-wrap::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }
      .tp-module-inner { padding: 20px 16px; }
      @media (min-width: 640px) { .tp-module-inner { padding: 28px 24px; } }

      /* ── Footer ── */
      .tp-footer {
        text-align: center; margin-top: 32px;
        font-size: 9px; font-weight: 500; letter-spacing: .18em;
        text-transform: uppercase;
        color: ${isDark ? "rgba(245,240,232,.12)" : "rgba(26,16,8,.15)"};
      }
    `}</style>
  );
}

/* ─── Logo IEQ ──────────────────────────────────────────────────────── */
function IEQCross({ size = 28 }) {
  return (
      <img
          src="/quadrangular.png"
          alt="IEQ"
          style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }}
      />
  );
}

/* ─── Página principal ──────────────────────────────────────────────── */
export default function TesourariaPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  const tk     = t(isDark);
  const isHome = location.pathname === "/tesouraria" || location.pathname === "/tesouraria/";

  useEffect(() => { localStorage.setItem("theme", isDark ? "dark" : "light"); }, [isDark]);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const cards = [
    { nome: "Dashboard",   desc: "Análise geral",    icon: <BarChart2  size={20} />, cor: AURA.blue,    rota: "dashboard",   gradient: `${AURA.blueDark},${AURA.blue}` },
    { nome: "Lançamento",  desc: "Gestão de fluxo",  icon: <DollarSign size={20} />, cor: AURA.red,     rota: "lancamento",  gradient: `${AURA.redDark},${AURA.red}`   },
    { nome: "Relatório",   desc: "Exportar e docs",  icon: <FileText   size={20} />, cor: AURA.gold,    rota: "relatorio",   gradient: `rgba(201,169,110,.8),${AURA.gold}` },
    { nome: "Dizimistas",  desc: "Base de dados",    icon: <Users      size={20} />, cor: AURA.red,     rota: "dizimistas",  gradient: `${AURA.redDark},${AURA.red}`   },
    { nome: "Comparativo", desc: "Evolução anual",   icon: <TrendingUp size={20} />, cor: AURA.blue,    rota: "comparativo", gradient: `${AURA.blueDark},${AURA.blue}` },
  ];

  return (
      <div className="tp-root">
        <GlobalStyles tk={tk} isDark={isDark} />
        <div className="tp-glow" />
        <div className="tp-stripe-bg" />

        <div className="tp-content">

          {/* ── Navbar ── */}
          <nav className="tp-nav">
            <div className="tp-nav-left">
              <div className="tp-logo-wrap">
                <div className="tp-logo-ring" style={{ width: 58, height: 58 }} />
                <div className="tp-logo-ring" style={{ width: 46, height: 46, animationDelay: ".9s" }} />
                <div className="tp-logo-inner">
                  <IEQCross size={32} />
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="tp-eyebrow">Módulo Financeiro</p>
                <h1 className="tp-nav-title">IEQ <span>Pituaçu</span></h1>
                <p className="tp-nav-sub">Tesouraria · Gestão Financeira</p>
              </div>
            </div>

            <div className="tp-nav-right">
              <button className="tp-btn-ico" onClick={() => setIsDark(!isDark)} title="Alternar tema">
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              {!isHome && (
                  <button className="tp-btn-back" onClick={() => navigate("/tesouraria")}>
                    <ArrowLeft size={13} /> Voltar
                  </button>
              )}
              <button className="tp-btn-exit" onClick={handleLogout}>
                <LogOut size={13} /> Sair
              </button>
            </div>
          </nav>

          {/* ── Divider ── */}
          <div className="tp-divider"><div className="tp-divider-dot" /></div>

          {isHome ? (
              <>
                {/* Badge */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <span className="tp-badge">
                <span className="tp-badge-dot" />
                <strong style={{ color: tk.text, fontWeight: 600 }}>TESOURARIA</strong>
              </span>
                </div>

                {/* Intro */}
                <div className="tp-intro">
                  <h2>Módulos</h2>
                  <p>Selecione uma área para começar</p>
                </div>

                {/* Cards grid */}
                <div className="tp-grid">
                  {cards.map((card, i) => (
                      <div
                          key={card.rota}
                          className="tp-card"
                          style={{ animationDelay: `${i * 0.07}s` }}
                          onClick={() => navigate(card.rota)}
                      >
                        <style>{`.tp-card:nth-child(${i + 1})::before { background: linear-gradient(135deg, ${card.gradient}); }`}</style>

                        <div className="tp-card-icon" style={{ background: `${card.cor}18`, color: card.cor }}>
                          {card.icon}
                        </div>
                        <div>
                          <p className="tp-card-name">{card.nome}</p>
                          <p className="tp-card-desc">{card.desc}</p>
                        </div>
                        <div className="tp-card-arrow">
                          Acessar →
                        </div>
                      </div>
                  ))}

                  {/* Card: voltar ao início */}
                  <div
                      className="tp-card tp-card-exit"
                      style={{ animationDelay: `${cards.length * 0.07}s` }}
                      onClick={() => navigate("/")}
                  >
                    <p style={{
                      fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600,
                      letterSpacing: ".16em", textTransform: "uppercase",
                      color: tk.textMuted, margin: 0, textAlign: "center",
                    }}>
                      Sair do módulo
                    </p>
                    <p style={{
                      fontFamily: "'Inter',sans-serif", fontSize: 9, letterSpacing: ".12em",
                      textTransform: "uppercase", color: tk.textMuted, margin: 0,
                      opacity: .55, textAlign: "center",
                    }}>
                      Retornar ao início
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${AURA.gold}, transparent)`,
                  opacity: .15, margin: "8px 0 12px",
                }} />
                <p className="tp-footer">
                  © {new Date().getFullYear()} IEQ Pituaçu · Sistema Eclesiástico
                </p>
              </>
          ) : (
              <div className="tp-module-wrap">
                <div className="tp-module-inner">
                  <Routes>
                    <Route path="dashboard"   element={<TesourariaDashboard  isDark={isDark} />} />
                    <Route path="lancamento"  element={<TesourariaLancamento isDark={isDark} />} />
                    <Route path="relatorio"   element={<TesourariaRelatorio  isDark={isDark} />} />
                    <Route path="dizimistas"  element={<TesourariaDizimistas isDark={isDark} />} />
                    <Route path="comparativo" element={<TesourariaComparativo isDark={isDark} />} />
                  </Routes>
                </div>
              </div>
          )}

        </div>
      </div>
  );
}
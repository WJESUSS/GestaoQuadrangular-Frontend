import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart2, DollarSign, FileText, Users,
  TrendingUp, ArrowLeft, LogOut, Sun, Moon,
  LayoutDashboard, ChevronRight
} from "lucide-react";

import TesourariaDashboard  from "./TesourariaDashboard.jsx";
import TesourariaLancamento from "./TesourariaLancamento.jsx";
import TesourariaRelatorio  from "./TesourariaRelatorio.jsx";
import TesourariaDizimistas from "./TesourariaDizimistas.jsx";
import TesourariaComparativo from "./TesourariaComparativo.jsx";

/* ═══════════════════════════════════════════════════════
   CORES OFICIAIS IEQ
═══════════════════════════════════════════════════════ */
const IEQ = {
  red:        "#C8102E",
  redDark:    "#8B0B1F",
  redLight:   "#E8294A",
  yellow:     "#FDB813",
  yellowDark: "#C48C00",
  blue:       "#003DA5",
  blueDark:   "#002470",
  blueLight:  "#1A56C4",
  offWhite:   "#F5F0E8",
  dark:       "#0A0608",
  darkCard:   "#110A0D",
};

function QuadrangularCross({ size = 32 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gVP" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={IEQ.redLight} />
            <stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHP" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={IEQ.blueDark} />
            <stop offset="50%"  stopColor={IEQ.blueLight} />
            <stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowP">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gVP)" filter="url(#glowP)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gHP)" filter="url(#glowP)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowP)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

const getCSS = (isDark) => `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  * { box-sizing: border-box; }

  @keyframes stripe {
    0%   { background-position:0 0; }
    100% { background-position:60px 60px; }
  }
  @keyframes pulse { 0%,100% { transform:scale(1); opacity:.45; } 50% { transform:scale(1.12); opacity:.12; } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }

  .tp-bg {
    position:fixed; inset:0; pointer-events:none; z-index:0;
    background: repeating-linear-gradient(
      -55deg,
      ${isDark ? "rgba(200,16,46,.04)" : "rgba(200,16,46,.06)"} 0 10px,
      transparent 10px 20px,
      ${isDark ? "rgba(253,184,19,.03)" : "rgba(253,184,19,.05)"} 20px 30px,
      transparent 30px 40px
    );
    background-size:60px 60px;
    animation: stripe 8s linear infinite;
  }

  .tp-title {
    font-family:'Cinzel',serif;
    background: linear-gradient(90deg, ${IEQ.redDark}, ${IEQ.red}, ${IEQ.yellow}, ${IEQ.blue});
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
  }

  .tp-card {
    background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
    border: 1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
    border-radius: 14px;
    backdrop-filter: blur(24px);
    transition: all .3s;
    cursor: pointer;
    animation: fadeUp .45s ease both;
  }
  .tp-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 40px rgba(200,16,46,.14);
    border-color: ${IEQ.red};
  }

  .tp-nav {
    background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
    border: 1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
    border-radius: 14px;
    backdrop-filter: blur(24px);
  }

  .tp-content {
    background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
    border: 1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
    border-radius: 14px;
    backdrop-filter: blur(24px);
  }

  .tp-btn-primary {
    background: linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.red});
    color: #fff; border:none; border-radius:8px;
    font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.18em;
    cursor:pointer; transition: all .25s; padding:10px 18px;
    display:flex; align-items:center; gap:6px;
  }
  .tp-btn-primary:hover { transform:translateY(-2px); filter:brightness(1.12); }

  .tp-btn-ghost {
    background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};
    color: ${isDark ? IEQ.offWhite : IEQ.redDark};
    border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
    border-radius:8px; font-family:'Cinzel',serif; font-size:10px; font-weight:700;
    letter-spacing:.15em; cursor:pointer; transition: all .25s; padding:10px 18px;
    display:flex; align-items:center; gap:6px;
  }
  .tp-btn-ghost:hover { border-color:${IEQ.red}; background:rgba(200,16,46,.1); }

  .pulse-ring-tp {
    position:absolute; border-radius:50%;
    border:1px solid rgba(200,16,46,.35);
    animation: pulse 3s ease-in-out infinite;
  }

  .tp-divider {
    height:1px;
    background: linear-gradient(90deg, transparent, ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}, transparent);
    margin: 8px 0;
  }

  /* ── Menu cards grid ── */
  .tp-menu-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  @media (min-width: 540px) { .tp-menu-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
  @media (min-width: 900px) { .tp-menu-grid { grid-template-columns: repeat(3, 1fr); gap: 18px; } }
`;

export default function TesourariaPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  const isHome = location.pathname === "/tesouraria" || location.pathname === "/tesouraria/";

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const bg            = isDark ? IEQ.dark : "#F0EAE8";
  const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  const cards = [
    { titulo:"Dashboard",   desc:"Análise Geral",      icone:<BarChart2  size={20}/>, cor:IEQ.blue,       rota:"dashboard"   },
    { titulo:"Lançamento",  desc:"Gestão de Fluxo",    icone:<DollarSign size={20}/>, cor:IEQ.red,        rota:"lancamento"  },
    { titulo:"Relatório",   desc:"Exportação e Docs",  icone:<FileText   size={20}/>, cor:IEQ.yellowDark, rota:"relatorio"   },
    { titulo:"Dizimistas",  desc:"Base de Dados",      icone:<Users      size={20}/>, cor:IEQ.redDark,    rota:"dizimistas"  },
    { titulo:"Comparativo", desc:"Evolução Anual",     icone:<TrendingUp size={20}/>, cor:IEQ.blueLight,  rota:"comparativo" },
  ];

  return (
      <div style={{ minHeight:"100vh", background:bg, color:textPrimary, fontFamily:"'EB Garamond',serif", position:"relative", transition:"background .5s", paddingBottom:60 }}>
        <style>{getCSS(isDark)}</style>
        <div className="tp-bg" />

        <div style={{ position:"relative", zIndex:10, maxWidth:1200, margin:"0 auto", padding:"32px 20px 0" }}>

          {/* ── NAVBAR ── */}
          <nav className="tp-nav" style={{ padding:"14px 20px", marginBottom:36, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                <div className="pulse-ring-tp" style={{ width:60, height:60 }} />
                <div style={{ width:44, height:44, borderRadius:"50%", background: isDark ? "#1A0A0D" : "#fff", border:"1px solid rgba(200,16,46,.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <QuadrangularCross size={26} />
                </div>
              </div>
              <div>
                <h1 className="tp-title" style={{ fontSize:18, fontWeight:700, letterSpacing:".15em", margin:0 }}>IEQ PITUAÇU</h1>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSecondary, margin:0 }}>
                  TESOURARIA · GESTÃO FINANCEIRA
                </p>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button className="tp-btn-ghost" onClick={() => setIsDark(!isDark)} style={{ padding:"9px 12px" }}>
                {isDark ? <Sun size={16}/> : <Moon size={16}/>}
              </button>
              {!isHome && (
                  <button className="tp-btn-ghost" onClick={() => navigate("/tesouraria")}>
                    <ArrowLeft size={14}/> VOLTAR
                  </button>
              )}
              <button className="tp-btn-primary" onClick={handleLogout}>
                <LogOut size={14}/> SAIR
              </button>
            </div>
          </nav>

          {/* ── CONTEÚDO ── */}
          {isHome ? (
              <>
                {/* Intro */}
                <div style={{ marginBottom:28 }}>
                  <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.4rem,3.5vw,2.4rem)", fontWeight:700, letterSpacing:"-.01em", color:textPrimary, margin:"0 0 6px", lineHeight:1.1 }}>
                    Módulos
                  </h2>
                  <p style={{ fontFamily:"'EB Garamond',serif", fontSize:15, color:textSecondary, margin:0 }}>
                    Selecione uma área para começar
                  </p>
                </div>

                {/* Cards */}
                <div className="tp-menu-grid">
                  {cards.map((card, i) => (
                      <div
                          key={card.titulo}
                          className="tp-card"
                          style={{ padding:"22px 18px", animationDelay:`${i * 0.07}s` }}
                          onClick={() => navigate(card.rota)}
                      >
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                          <div style={{ width:44, height:44, borderRadius:10, background:`${card.cor}18`, display:"flex", alignItems:"center", justifyContent:"center", color:card.cor }}>
                            {card.icone}
                          </div>
                          <ChevronRight size={14} style={{ color:textSecondary, marginTop:4 }} />
                        </div>
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, letterSpacing:".12em", color:textPrimary, margin:"0 0 4px" }}>
                          {card.titulo}
                        </p>
                        <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:0 }}>
                          {card.desc}
                        </p>
                      </div>
                  ))}

                  {/* Card Sair */}
                  <div
                      className="tp-card"
                      style={{ padding:"22px 18px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, border:`1px dashed ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.22)"}`, background: isDark ? "rgba(17,10,13,.5)" : "rgba(255,255,255,.5)", animationDelay:`${cards.length * 0.07}s` }}
                      onClick={() => navigate("/")}
                  >
                    <p style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".18em", color:textSecondary, margin:0 }}>SAIR DO MÓDULO</p>
                    <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSecondary, margin:0, opacity:.6 }}>Retornar ao Início</p>
                  </div>
                </div>
              </>
          ) : (
              <div className="tp-content" style={{ padding:"24px 20px" }}>
                <Routes>
                  <Route path="dashboard"   element={<TesourariaDashboard />} />
                  <Route path="lancamento"  element={<TesourariaLancamento />} />
                  <Route path="relatorio"   element={<TesourariaRelatorio />} />
                  <Route path="dizimistas"  element={<TesourariaDizimistas />} />
                  <Route path="comparativo" element={<TesourariaComparativo />} />
                </Routes>
              </div>
          )}

          {/* ── FOOTER ── */}
          {isHome && (
              <div style={{ marginTop:48 }}>
                <div className="tp-divider" />
                <p style={{ textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSecondary, padding:"6px 0" }}>
                  © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
                </p>
              </div>
          )}
        </div>
      </div>
  );
}
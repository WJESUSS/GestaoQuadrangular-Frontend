import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, BarChart3, FileText, Users,
  TrendingUp, ShieldCheck
} from "lucide-react";

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
  white:      "#FFFFFF",
  offWhite:   "#F5F0E8",
  dark:       "#0A0608",
  darkCard:   "#110A0D",
};

/* ═══════════════════════════════════════════════════════
   CRUZ QUADRANGULAR
═══════════════════════════════════════════════════════ */
function QuadrangularCross({ size = 32 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gV3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={IEQ.redLight} />
            <stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gH3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={IEQ.blueDark} />
            <stop offset="50%"  stopColor={IEQ.blueLight} />
            <stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glow3">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gV3)" filter="url(#glow3)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gH3)" filter="url(#glow3)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glow3)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   ESTILOS GLOBAIS IEQ (light fixo nessa tela)
═══════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  * { box-sizing: border-box; }

  @keyframes stripe {
    0%   { background-position:0 0; }
    100% { background-position:60px 60px; }
  }
  @keyframes pulse { 0%,100% { transform:scale(1); opacity:.45; } 50% { transform:scale(1.12); opacity:.12; } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

  .mt-bg {
    position:fixed; inset:0; pointer-events:none; z-index:0;
    background: repeating-linear-gradient(
      -55deg,
      rgba(200,16,46,.06) 0 10px,
      transparent 10px 20px,
      rgba(253,184,19,.05) 20px 30px,
      transparent 30px 40px
    );
    background-size:60px 60px;
    animation: stripe 8s linear infinite;
  }

  .mt-title {
    font-family:'Cinzel',serif;
    background: linear-gradient(90deg, ${IEQ.redDark}, ${IEQ.red}, ${IEQ.yellow}, ${IEQ.blue});
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
  }

  .mt-card {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(200,16,46,.12);
    border-radius: 14px;
    backdrop-filter: blur(24px);
    transition: all .3s;
    cursor: pointer;
    animation: fadeUp .5s ease both;
  }
  .mt-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 40px rgba(200,16,46,.14);
    border-color: ${IEQ.red};
  }

  .mt-badge {
    display:inline-flex; align-items:center; gap:6px;
    padding:5px 14px; border-radius:99px;
    font-family:'Cinzel',serif; font-size:9px; font-weight:700; letter-spacing:.18em;
    border:1px solid; color:${IEQ.yellow}; border-color:rgba(253,184,19,.35);
    background:rgba(253,184,19,.1);
  }

  .pulse-ring {
    position:absolute; border-radius:50%;
    border:1px solid rgba(200,16,46,.35);
    animation: pulse 3s ease-in-out infinite;
  }

  /* ── Grid de cards ── */
  .mt-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  @media (min-width: 540px) { .mt-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
  @media (min-width: 860px) { .mt-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; } }

  .mt-footer-line {
    height:1px;
    background: linear-gradient(90deg, transparent, rgba(200,16,46,.2), transparent);
    margin: 8px 0;
  }
`;

export default function MenuTesouraria() {
  const navigate = useNavigate();

  const cards = [
    { id:"lancamento",  label:"Gestão de Entradas",   title:"Lançamento",  desc:"Registro de dízimos e ofertas em tempo real.",             icon:<Wallet    size={22}/>, page:"/tesouraria/lancamento",  color:IEQ.red     },
    { id:"dashboard",   label:"Visão Geral",           title:"Dashboard",   desc:"Indicadores de desempenho e KPIs financeiros.",            icon:<BarChart3  size={22}/>, page:"/tesouraria/dashboard",   color:IEQ.blue    },
    { id:"relatorio",   label:"Documentação",          title:"Relatório",   desc:"Exportação executiva de dados para PDF.",                  icon:<FileText   size={22}/>, page:"/tesouraria/relatorio",   color:IEQ.yellowDark },
    { id:"dizimistas",  label:"Fidelidade",            title:"Dizimistas",  desc:"Monitoramento de contribuintes ativos e pendentes.",       icon:<Users      size={22}/>, page:"/tesouraria/dizimistas",  color:IEQ.redDark },
    { id:"comparativo", label:"Análise de Dados",      title:"Comparativo", desc:"Evolução mensal e histórico anual consolidado.",           icon:<TrendingUp size={22}/>, page:"/tesouraria/comparativo", color:IEQ.blueLight },
  ];

  return (
      <div style={{ minHeight:"100vh", background:"#F0EAE8", color:"#1A0A0D", fontFamily:"'EB Garamond',serif", position:"relative", paddingBottom:60 }}>
        <style>{CSS}</style>
        <div className="mt-bg" />

        <div style={{ position:"relative", zIndex:10, maxWidth:1200, margin:"0 auto", padding:"32px 20px 0" }}>

          {/* ── HEADER ── */}
          <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:44, flexWrap:"wrap", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:18 }}>
              <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                <div className="pulse-ring" style={{ width:72, height:72 }} />
                <div style={{ width:52, height:52, borderRadius:"50%", background:"#fff", border:"1px solid rgba(200,16,46,.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <QuadrangularCross size={32} />
                </div>
              </div>
              <div>
                <h1 className="mt-title" style={{ fontSize:22, fontWeight:700, letterSpacing:".18em", margin:0 }}>IEQ PITUAÇU</h1>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".2em", color:"rgba(26,10,13,.45)", margin:0 }}>
                  TESOURARIA · GESTÃO FINANCEIRA
                </p>
              </div>
            </div>
            <div className="mt-badge" style={{ alignSelf:"flex-start" }}>
              <ShieldCheck size={10} /> SISTEMA SEGURO
            </div>
          </header>

          {/* ── INTRO ── */}
          <div style={{ marginBottom:32 }}>
          <span className="mt-badge" style={{ marginBottom:16, display:"inline-flex" }}>
            <TrendingUp size={10} /> MÓDULOS DISPONÍVEIS
          </span>
            <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.6rem,4vw,2.8rem)", fontWeight:700, letterSpacing:"-.01em", color:"#1A0A0D", margin:"10px 0 6px", lineHeight:1.1 }}>
              Selecione uma área
            </h2>
            <p style={{ fontFamily:"'EB Garamond',serif", fontSize:16, color:"rgba(26,10,13,.5)", margin:0 }}>
              Gerenciamento completo das finanças da célula e da congregação.
            </p>
          </div>

          {/* ── GRID DE CARDS ── */}
          <div className="mt-grid">
            {cards.map((card, i) => (
                <div
                    key={card.id}
                    className="mt-card"
                    style={{ padding:"24px 20px", animationDelay:`${i * 0.08}s` }}
                    onClick={() => navigate(card.page)}
                >
                  <div style={{ width:46, height:46, borderRadius:10, background:`${card.color}18`, display:"flex", alignItems:"center", justifyContent:"center", color:card.color, marginBottom:16 }}>
                    {card.icon}
                  </div>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:"rgba(26,10,13,.4)", margin:"0 0 4px", textTransform:"uppercase" }}>
                    {card.label}
                  </p>
                  <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:700, letterSpacing:".1em", color:"#1A0A0D", margin:"0 0 8px" }}>
                    {card.title}
                  </h3>
                  <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:"rgba(26,10,13,.5)", margin:0, lineHeight:1.5 }}>
                    {card.desc}
                  </p>
                </div>
            ))}

            {/* Card Sair */}
            <div
                className="mt-card"
                style={{ padding:"24px 20px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, border:"1px dashed rgba(200,16,46,.25)", background:"rgba(255,255,255,.5)", animationDelay:`${cards.length * 0.08}s` }}
                onClick={() => navigate("/")}
            >
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".18em", color:"rgba(26,10,13,.4)", margin:0 }}>SAIR DO MÓDULO</p>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:"rgba(26,10,13,.3)", margin:0 }}>Retornar ao Início</p>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div style={{ marginTop:60 }}>
            <div className="mt-footer-line" />
            <p style={{ textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:"rgba(26,10,13,.35)", padding:"8px 0" }}>
              © IEQ PITUAÇU · GESTÃO FINANCEIRA · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
  );
}
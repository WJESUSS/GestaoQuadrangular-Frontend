import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import HistoricoRelatorios from "./HistoricoRelatorios";
import TelaRelatorio from "./TelaRelatorio";
import TelaVisitantes from "./TelaVisitantes";
import TelaFichas from "./TelaFichas";
import RelatorioDiscipulado from "./RelatorioDiscipulado";
import {
  Trash2, Loader2, Users, Plus, Search, X, ArrowLeft,
  TrendingUp, Target, Sparkles, LayoutDashboard, LogOut,
  Sun, Moon, CheckCircle2
} from "lucide-react";

/* ─── Cores Oficiais Igreja do Evangelho Quadrangular ─── */
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

/* ─── Cruz Quadrangular SVG ─── */
function QuadrangularCross({ size = 32 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gV2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={IEQ.redLight} />
            <stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gH2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={IEQ.blueDark} />
            <stop offset="50%"  stopColor={IEQ.blueLight} />
            <stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gV2)" filter="url(#glow2)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gH2)" filter="url(#glow2)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glow2)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

const containerVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

export default function DashboardLider() {
  const [abaAtiva,              setAbaAtiva]              = useState("home");
  const [celula,                setCelula]                = useState(null);
  const [membros,               setMembros]               = useState([]);
  const [loading,               setLoading]               = useState(true);
  const [showModalAddMembro,    setShowModalAddMembro]    = useState(false);
  const [showModalMultiplicacao,setShowModalMultiplicacao]= useState(false);
  const [motivoMultiplicacao,   setMotivoMultiplicacao]   = useState("");
  const [solicitandoMulti,      setSolicitandoMulti]      = useState(false);
  const [isDark,                setIsDark]                = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const carregarDados = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const resCelula = await api.get("/celulas/minha-celula");
      const celulaData = resCelula.data;
      setCelula(celulaData);
      if (celulaData?.id) {
        const resM = await api.get(`/celulas/${celulaData.id}/membros`);
        const unique = (arr) => arr.filter((item, i, self) => i === self.findIndex(t => t.id === item.id));
        setMembros(unique(resM.data || []));
      }
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(() => carregarDados(true), 30000);
    return () => clearInterval(interval);
  }, [carregarDados]);

  const removerMembro = async (membroId, nome) => {
    if (!window.confirm(`Remover ${nome} da célula?`)) return;
    try {
      await api.delete(`/celulas/${celula.id}/membros/${membroId}`);
      await carregarDados();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao remover.");
    }
  };

  const solicitarMultiplicacao = async () => {
    if (!motivoMultiplicacao.trim()) return alert("O motivo é obrigatório.");
    setSolicitandoMulti(true);
    try {
      await api.post(`/celulas/${celula.id}/solicitar-multiplicacao`, { motivo: motivoMultiplicacao.trim() });
      alert("Solicitação enviada com sucesso!");
      setShowModalMultiplicacao(false);
      setMotivoMultiplicacao("");
      carregarDados();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao enviar solicitação.");
    } finally {
      setSolicitandoMulti(false);
    }
  };

  const qtdMembros   = membros.length;
  const atingiuMeta  = qtdMembros >= 8;
  const statusMulti  = celula?.statusMultiplicacao || "NORMAL";
  const isAnalise    = atingiuMeta && statusMulti === "EM_ANALISE";
  const isAprovado   = atingiuMeta && statusMulti === "APROVADO";
  const podeSolicitar= atingiuMeta && !isAnalise;
  const porcentagemMeta = Math.min((qtdMembros / 8) * 100, 100);

  /* ── Loading Screen ── */
  if (loading) return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background: isDark ? IEQ.dark : "#F0EAE8" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');`}</style>
        <div style={{ textAlign:"center" }}>
          <QuadrangularCross size={48} />
          <p style={{ fontFamily:"'Cinzel',serif", color: isDark ? IEQ.offWhite : IEQ.redDark, marginTop:16, letterSpacing:".2em", fontSize:11 }}>CARREGANDO...</p>
        </div>
      </div>
  );

  /* ── Estilos globais IEQ ── */
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing: border-box; }

    @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes stripe {
      0%   { background-position:0 0; }
      100% { background-position:60px 60px; }
    }
    @keyframes pulse { 0%,100% { transform:scale(1); opacity:.45; } 50% { transform:scale(1.12); opacity:.12; } }
    @keyframes spin { to { transform: rotate(360deg); } }

    .ieq-bg {
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

    .ieq-title {
      font-family:'Cinzel',serif;
      background: linear-gradient(90deg, ${IEQ.redDark}, ${IEQ.red}, ${IEQ.yellow}, ${IEQ.blue});
      -webkit-background-clip:text; -webkit-text-fill-color:transparent;
      background-clip:text;
    }

    .ieq-card {
      background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius: 14px;
      backdrop-filter: blur(24px);
    }

    .ieq-btn-primary {
      background: linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.red});
      color: #fff; border:none; border-radius:8px;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.18em;
      cursor:pointer; transition: all .25s; padding:13px 24px;
    }
    .ieq-btn-primary:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.12); }

    .ieq-btn-blue {
      background: linear-gradient(135deg, ${IEQ.blueDark}, ${IEQ.blue});
      color: #fff; border:none; border-radius:8px;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.18em;
      cursor:pointer; transition: all .25s; padding:13px 24px;
    }
    .ieq-btn-blue:hover { transform:translateY(-2px); filter:brightness(1.12); }

    .ieq-btn-ghost {
      background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};
      color: ${isDark ? IEQ.offWhite : IEQ.redDark};
      border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      border-radius:8px; font-family:'Cinzel',serif; font-size:10px; font-weight:700;
      letter-spacing:.15em; cursor:pointer; transition: all .25s; padding:11px 20px;
    }
    .ieq-btn-ghost:hover { border-color:${IEQ.red}; background:${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.1)"}; }

    .ieq-input-field {
      width:100%;
      background:${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      color:${isDark ? IEQ.offWhite : "#1A0A0D"};
      padding:13px 16px; border-radius:8px; outline:none;
      font-family:'EB Garamond',serif; font-size:15px;
      transition: all .25s;
    }
    .ieq-input-field:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-input-field::placeholder { color:${isDark ? "rgba(245,240,232,.25)" : "rgba(26,10,13,.3)"}; }

    .ieq-menu-card {
      background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.9)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius:12px; padding:28px 20px; cursor:pointer;
      display:flex; flex-direction:column; align-items:center; gap:14px;
      transition: all .3s; text-align:center;
    }
    .ieq-menu-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(200,16,46,.15); border-color:${IEQ.red}; }

    .ieq-member-row {
      display:flex; align-items:center; justify-content:space-between;
      padding:14px 16px;
      background:${isDark ? "rgba(255,255,255,.03)" : "rgba(200,16,46,.04)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"};
      border-radius:8px; transition:all .2s;
    }
    .ieq-member-row:hover { border-color:${IEQ.red}; background:${isDark ? "rgba(200,16,46,.07)" : "rgba(200,16,46,.08)"}; }

    .ieq-avatar {
      width:38px; height:38px; border-radius:6px;
      background: linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.blue});
      display:flex; align-items:center; justify-content:center;
      color:#fff; font-family:'Cinzel',serif; font-weight:700; font-size:14px;
    }

    .ieq-progress-track {
      height:8px; border-radius:99px; overflow:hidden;
      background:${isDark ? "rgba(255,255,255,.08)" : "rgba(200,16,46,.1)"};
    }

    .ieq-badge {
      display:inline-flex; align-items:center; gap:6px;
      padding:5px 14px; border-radius:99px;
      font-family:'Cinzel',serif; font-size:9px; font-weight:700; letter-spacing:.18em;
      border:1px solid;
    }

    .pulse-ring {
      position:absolute; border-radius:50%;
      border:1px solid rgba(200,16,46,.35);
      animation: pulse 3s ease-in-out infinite;
    }

    .spin-icon { animation: spin 1s linear infinite; }

    .divider {
      height:1px;
      background: linear-gradient(90deg, transparent, ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}, transparent);
      margin: 8px 0;
    }

    /* ── CORREÇÃO: modais nunca cortam em telas pequenas ── */
    .ieq-modal-wrapper {
      position: fixed; inset: 0; z-index: 50;
      display: flex; align-items: center; justify-content: center;
      padding: 12px;
      overflow-y: auto;
    }
    .ieq-modal-inner {
      position: relative; z-index: 10;
      width: 100%;
      max-height: calc(100vh - 24px);
      display: flex; flex-direction: column;
    }
  `;

  const bg = isDark ? IEQ.dark : "#F0EAE8";
  const textPrimary   = isDark ? IEQ.offWhite     : "#1A0A0D";
  const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  return (
      <div style={{ minHeight:"100vh", background:bg, color:textPrimary, fontFamily:"'EB Garamond',serif", position:"relative", transition:"background .5s", paddingBottom:60 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg" />

        {/* ── HEADER ── */}
        <div style={{ position:"relative", zIndex:10, maxWidth:1200, margin:"0 auto", padding:"32px 24px 0" }}>
          <motion.header initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
                         style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:40, flexWrap:"wrap", gap:16 }}>

            {/* Logo + título */}
            <div style={{ display:"flex", alignItems:"center", gap:18 }}>
              <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                <div className="pulse-ring" style={{ width:72, height:72 }} />
                <div style={{
                  width:52, height:52, borderRadius:"50%",
                  background: isDark ? "#1A0A0D" : "#fff",
                  border:`1px solid rgba(200,16,46,.3)`,
                  display:"flex", alignItems:"center", justifyContent:"center"
                }}>
                  <QuadrangularCross size={32} />
                </div>
              </div>
              <div>
                <h1 className="ieq-title" style={{ fontSize:22, fontWeight:700, letterSpacing:".18em", margin:0 }}>
                  IEQ PITUAÇU
                </h1>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".2em", color:textSecondary, margin:0 }}>
                  CÉLULA {celula?.nome?.toUpperCase() || "—"} · PAINEL DO LÍDER
                </p>
              </div>
            </div>

            {/* Ações */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button className="ieq-btn-ghost" onClick={() => setIsDark(!isDark)} style={{ padding:"10px 14px" }}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {abaAtiva !== "home" && (
                  <button className="ieq-btn-ghost" onClick={() => setAbaAtiva("home")}>
                    ← VOLTAR
                  </button>
              )}
              <button className="ieq-btn-primary" onClick={handleLogout} style={{ background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})` }}>
                SAIR
              </button>
            </div>
          </motion.header>

          {/* ── Banner aprovação ── */}
          <AnimatePresence>
            {isAprovado && (
                <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                            style={{ marginBottom:28, padding:"16px 24px", borderRadius:10, background:`linear-gradient(135deg,${IEQ.blue},${IEQ.blueDark})`, color:"#fff", display:"flex", alignItems:"center", gap:12, fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:".12em" }}>
                  <Sparkles size={18} style={{ color:IEQ.yellow }} />
                  MULTIPLICAÇÃO APROVADA! ORGANIZE OS MEMBROS PARA A NOVA CÉLULA.
                </motion.div>
            )}
          </AnimatePresence>

          {/* ── CONTEÚDO ── */}
          <AnimatePresence mode="wait">
            {abaAtiva === "home" ? (
                <motion.div key="home" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity:0, x:-20 }} style={{ display:"flex", flexDirection:"column", gap:24 }}>

                  {/* ── KPI Hero ── */}
                  <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>

                    {/* Card membros / progresso */}
                    <div className="ieq-card" style={{ padding:"36px 40px", background: isDark ? `linear-gradient(135deg,#1A0A0D,#0A0608)` : `linear-gradient(135deg,${IEQ.blue},${IEQ.blueDark})`, border:"none", position:"relative", overflow:"hidden" }}>
                      {/* Stripes internas */}
                      <div style={{ position:"absolute", inset:0, backgroundImage:`repeating-linear-gradient(-55deg,rgba(255,255,255,.03) 0 10px,transparent 10px 20px)`, backgroundSize:"40px 40px" }} />
                      <div style={{ position:"relative", zIndex:1 }}>
                    <span className="ieq-badge" style={{ color:IEQ.yellow, borderColor:"rgba(253,184,19,.35)", background:"rgba(253,184,19,.1)", marginBottom:20 }}>
                      <TrendingUp size={10} /> INDICADORES DE CRESCIMENTO
                    </span>
                        <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"flex-end", gap:24 }}>
                          <div>
                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:52, fontWeight:700, color:"#fff", margin:0, lineHeight:1 }}>{qtdMembros}</p>
                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:".2em", color:"rgba(255,255,255,.6)", marginTop:6 }}>MEMBROS ATIVOS</p>
                            <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:"rgba(255,255,255,.5)", marginTop:10, maxWidth:260 }}>
                              {!atingiuMeta
                                  ? `Faltam ${8-qtdMembros} membros para a meta de multiplicação.`
                                  : isAnalise ? "Aguardando parecer do seu pastor..."
                                      : isAprovado ? "Sua célula está autorizada a multiplicar."
                                          : "Meta de 8 membros atingida! Solicite a multiplicação."}
                            </p>
                          </div>
                          <div style={{ minWidth:200, flex:1 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".15em", color:"rgba(255,255,255,.6)", marginBottom:8 }}>
                              <span>{atingiuMeta ? "META CONCLUÍDA" : "PROGRESSO"}</span>
                              <span>{Math.round(porcentagemMeta)}%</span>
                            </div>
                            <div className="ieq-progress-track" style={{ background:"rgba(255,255,255,.12)" }}>
                              <motion.div initial={{ width:0 }} animate={{ width:`${porcentagemMeta}%` }} transition={{ duration:1.2, ease:"easeOut" }}
                                          style={{ height:"100%", borderRadius:99, background: atingiuMeta ? IEQ.yellow : `linear-gradient(90deg,${IEQ.red},${IEQ.yellow})` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card ação pastoral */}
                    <div className="ieq-card" style={{ padding:30, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                      <div>
                        <div style={{
                          width:50, height:50, borderRadius:10, marginBottom:18,
                          background: isAprovado ? "rgba(0,61,165,.12)" : isAnalise ? "rgba(253,184,19,.12)" : "rgba(200,16,46,.1)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          color: isAprovado ? IEQ.blue : isAnalise ? IEQ.yellowDark : IEQ.red,
                        }}>
                          {isAprovado ? <CheckCircle2 size={24} /> : isAnalise ? <Loader2 size={24} className="spin-icon" /> : <Target size={24} />}
                        </div>
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, letterSpacing:".12em", color:textPrimary, margin:0 }}>AÇÃO PASTORAL</p>
                        <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, marginTop:4 }}>
                          {isAnalise ? "Em análise" : isAprovado ? "Liberado" : atingiuMeta ? "Pode solicitar" : "Aguardando meta"}
                        </p>
                      </div>
                      <div style={{ marginTop:20 }}>
                        {isAnalise ? (
                            <div style={{ padding:"13px 0", textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".15em", color:IEQ.yellowDark, background:"rgba(253,184,19,.1)", border:`1px solid rgba(253,184,19,.3)`, borderRadius:8 }}>
                              CONSULTANDO PASTOR...
                            </div>
                        ) : podeSolicitar ? (
                            <button className="ieq-btn-blue" style={{ width:"100%" }} onClick={() => setShowModalMultiplicacao(true)}>
                              {isAprovado ? "NOVA SOLICITAÇÃO" : "SOLICITAR MULT."}
                            </button>
                        ) : (
                            <button className="ieq-btn-ghost" style={{ width:"100%" }} onClick={() => setAbaAtiva("relatorio")}>
                              LANÇAR RELATÓRIO
                            </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Menu de navegação ── */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16 }}>
                    {[
                      { icon:<TrendingUp size={22}/>, title:"FREQUÊNCIA",  desc:"Relatórios",    aba:"relatorio",    color:IEQ.red },
                      { icon:<Target size={22}/>,     title:"DISCIPULADO", desc:"Acompanhar",    aba:"discipulado",  color:IEQ.blue },
                      { icon:<Users size={22}/>,      title:"VISITANTES",  desc:"Novas Vidas",   aba:"visitantes",   color:IEQ.yellow },
                      { icon:<Plus size={22}/>,       title:"FICHAS",      desc:"Secretaria",    aba:"fichas",       color:IEQ.redDark },
                    ].map(({ icon, title, desc, aba, color }) => (
                        <motion.div key={aba} className="ieq-menu-card" whileHover={{ y:-5 }} whileTap={{ scale:.97 }} onClick={() => setAbaAtiva(aba)}>
                          <div style={{ width:50, height:50, borderRadius:10, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", color }}>
                            {icon}
                          </div>
                          <div>
                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>{title}</p>
                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".14em", color:textSecondary, margin:0 }}>{desc}</p>
                          </div>
                        </motion.div>
                    ))}
                  </div>

                  {/* ── Lista de membros ── */}
                  <div className="ieq-card" style={{ overflow:"hidden" }}>
                    <div style={{ padding:"28px 32px", borderBottom:`1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div>
                        <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>MEMBROS DA CÉLULA</h3>
                        <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:"4px 0 0" }}>{membros.length} ativos</p>
                      </div>
                      <button className="ieq-btn-primary" onClick={() => setShowModalAddMembro(true)} style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Plus size={15} /> NOVO MEMBRO
                      </button>
                    </div>
                    <div style={{ padding:24, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
                      {membros.map((m) => (
                          <div key={m.id} className="ieq-member-row">
                            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                              <div className="ieq-avatar">{m.nome?.charAt(0).toUpperCase()}</div>
                              <span style={{ fontFamily:"'EB Garamond',serif", fontSize:15, fontWeight:500, color:textPrimary }}>{m.nome}</span>
                            </div>
                            <button onClick={() => removerMembro(m.id, m.nome)} style={{ background:"none", border:"none", cursor:"pointer", color:textSecondary, padding:6, borderRadius:6, transition:"color .2s" }}
                                    onMouseEnter={e => e.currentTarget.style.color=IEQ.red}
                                    onMouseLeave={e => e.currentTarget.style.color=textSecondary}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Histórico ── */}
                  <HistoricoRelatorios celulaId={celula?.id} />

                  {/* Rodapé */}
                  <div className="divider" />
                  <p style={{ textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSecondary, padding:"0 0 8px" }}>
                    © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
                  </p>
                </motion.div>

            ) : (
                <motion.div key="content" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                  {abaAtiva === "relatorio"    && <TelaRelatorio celula={celula} />}
                  {abaAtiva === "discipulado" && <RelatorioDiscipulado membros={membros} />}
                  {abaAtiva === "visitantes"  && <TelaVisitantes celulaId={celula?.id} />}
                  {abaAtiva === "fichas"      && <TelaFichas celula={celula} />}
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── MODAL: Adicionar Membro ── */}
        <AnimatePresence>
          {showModalAddMembro && (
              /* ── CORREÇÃO: usa ieq-modal-wrapper para garantir scroll e sem corte ── */
              <div className="ieq-modal-wrapper">
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                            onClick={() => setShowModalAddMembro(false)}
                            style={{ position:"fixed", inset:0, background:"rgba(10,6,8,.85)", backdropFilter:"blur(16px)", zIndex:0 }} />
                <motion.div
                    initial={{ scale:.92, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:.92, opacity:0 }}
                    className="ieq-card ieq-modal-inner"
                    style={{ maxWidth:520, overflow:"hidden" }}
                >
                  <ModalBuscarMembro
                      celulaId={celula?.id}
                      isDark={isDark}
                      textPrimary={textPrimary}
                      textSecondary={textSecondary}
                      onClose={() => { setShowModalAddMembro(false); carregarDados(); }}
                  />
                </motion.div>
              </div>
          )}

          {/* ── MODAL: Solicitação Multiplicação ── */}
          {showModalMultiplicacao && (
              /* ── CORREÇÃO: usa ieq-modal-wrapper para garantir scroll e sem corte ── */
              <div className="ieq-modal-wrapper">
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                            style={{ position:"fixed", inset:0, background:"rgba(10,6,8,.85)", backdropFilter:"blur(16px)", zIndex:0 }} />
                <motion.div
                    initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:40, opacity:0 }}
                    className="ieq-card ieq-modal-inner"
                    style={{ maxWidth:460, padding:"44px 40px", overflowY:"auto" }}
                >
                  <div style={{ textAlign:"center", marginBottom:28 }}>
                    <QuadrangularCross size={36} />
                    <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, letterSpacing:".15em", color:textPrimary, margin:"16px 0 6px" }}>
                      PLANO DE MULTIPLICAÇÃO
                    </h2>
                    <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:textSecondary }}>
                      Informe o novo líder e o local da nova célula.
                    </p>
                  </div>

                  <div className="divider" style={{ marginBottom:24 }} />

                  <textarea className="ieq-input-field" style={{ minHeight:130, resize:"vertical" }}
                            placeholder="Ex: Novo líder será o João, anfitrião Maria..."
                            value={motivoMultiplicacao}
                            onChange={(e) => setMotivoMultiplicacao(e.target.value)}
                  />

                  <div style={{ display:"flex", gap:12, marginTop:24 }}>
                    <button className="ieq-btn-ghost" style={{ flex:1 }} onClick={() => setShowModalMultiplicacao(false)}>CANCELAR</button>
                    <button className="ieq-btn-blue" style={{ flex:2 }} onClick={solicitarMultiplicacao} disabled={solicitandoMulti}>
                      {solicitandoMulti ? <Loader2 size={16} className="spin-icon" /> : "ENVIAR PLANO"}
                    </button>
                  </div>
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </div>
  );
}

/* ── Modal Buscar Membro ── */
function ModalBuscarMembro({ celulaId, onClose, isDark, textPrimary, textSecondary }) {
  const [busca,      setBusca]      = useState("");
  const [membrosSem, setMembrosSem] = useState([]);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/membros/sem-celula");
        setMembrosSem(Array.isArray(res.data) ? res.data : []);
      } finally { setLoading(false); }
    })();
  }, []);

  const vincular = async (id) => {
    try {
      await api.post(`/celulas/${celulaId}/membros/${id}`);
      onClose();
    } catch { alert("Erro ao vincular."); }
  };

  const filtrados = membrosSem.filter(m => m.nome?.toLowerCase().includes(busca.toLowerCase()));

  return (
      /*
       * CORREÇÃO: removido height:520 fixo.
       * O modal agora cresce até max-height definido pelo ieq-modal-inner (100vh - 24px)
       * e a lista de membros rola internamente via flex:1 + overflowY:auto.
       */
      <div style={{ padding:36, display:"flex", flexDirection:"column", minHeight:0, flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexShrink:0 }}>
          <div>
            <QuadrangularCross size={28} />
            <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, letterSpacing:".15em", color:textPrimary, margin:"10px 0 2px" }}>
              VINCULAR MEMBRO
            </h2>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:textSecondary }}>
            <X size={22} />
          </button>
        </div>

        {/* Busca */}
        <div style={{ position:"relative", marginBottom:18, flexShrink:0 }}>
          <Search size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.6 }} />
          <input className="ieq-input-field" style={{ paddingLeft:42 }} placeholder="Buscar por nome..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>

        {/* Lista rolável */}
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, minHeight:0 }}>
          {loading ? (
              <div style={{ textAlign:"center", paddingTop:40 }}>
                <Loader2 size={28} style={{ animation:"spin 1s linear infinite", color:IEQ.red }} />
              </div>
          ) : filtrados.length > 0 ? filtrados.map((m) => (
              <div key={m.id} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"13px 16px",
                background: isDark ? "rgba(255,255,255,.03)" : "rgba(200,16,46,.04)",
                border:`1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`,
                borderRadius:8,
                flexShrink:0,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{
                    width:34, height:34, borderRadius:6,
                    background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color:"#fff", fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:13,
                  }}>{m.nome?.charAt(0).toUpperCase()}</div>
                  <span style={{ fontFamily:"'EB Garamond',serif", fontSize:15, color:textPrimary }}>{m.nome}</span>
                </div>
                <button className="ieq-btn-primary" style={{ fontSize:9, padding:"8px 16px", letterSpacing:".15em" }} onClick={() => vincular(m.id)}>
                  VINCULAR
                </button>
              </div>
          )) : (
              <p style={{ textAlign:"center", paddingTop:32, fontFamily:"'EB Garamond',serif", fontStyle:"italic", color:textSecondary }}>
                Nenhum membro encontrado.
              </p>
          )}
        </div>
      </div>
  );
}
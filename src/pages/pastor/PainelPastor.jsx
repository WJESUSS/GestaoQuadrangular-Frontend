import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Users, GitBranch, Calendar, AlertTriangle,
  MessageCircle, CheckCircle, Activity, Gift,
  ChevronRight, Sparkles, TrendingUp, Loader2, X
} from "lucide-react";
import api from "../../services/api.js";

/* ─── Cores Oficiais IEQ ─── */
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

const containerVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/* ─── isDark vem do pai (PastorPage), sem estado próprio aqui ─── */
export default function PainelPastor({ isDark = false }) {
  const [mes,             setMes]             = useState(new Date().toISOString().slice(0, 7));
  const [alertas,         setAlertas]         = useState([]);
  const [metricas,        setMetricas]        = useState({ celulasAtivas: 0, totalMembros: 0, multiplicacoesMes: 0 });
  const [aniversariantes, setAniversariantes] = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [modalAniver,     setModalAniver]     = useState(false);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const tokenRaw  = localStorage.getItem("token");
      const token     = tokenRaw ? tokenRaw.replace(/"/g, "").trim() : null;
      const mesValido = /^\d{4}-\d{2}$/.test(mes) ? mes : new Date().toISOString().slice(0, 7);

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params:  { mes: mesValido },
      };

      const [resMetricas, resAlertas] = await Promise.all([
        api.get("/api/pastor/metricas", config),
        api.get("/discipulado/alertas",  config),

      ]);

      setMetricas(resMetricas.data || { celulasAtivas: 0, totalMembros: 0, multiplicacoesMes: 0 });
      setAlertas(resAlertas.data  || []);
    } catch (err) {
      console.error("Erro dashboard pastor:", err);
    } finally {
      setLoading(false);
    }
  }, [mes]);

  const carregarAniversariantes = useCallback(async () => {
    try {
      const res = await api.get("/api/aniversariantes/hoje");
      setAniversariantes(res.data || []);
    } catch (err) {
      console.error("Erro aniversariantes:", err);
    }
  }, []);

  useEffect(() => { carregarDados(); },          [carregarDados]);
  useEffect(() => { carregarAniversariantes(); }, [carregarAniversariantes]);

  const enviarWhatsApp = (membro, tipo = "geral") => {
    const nome = membro.nome || "irmão(ã)";
    const saudacao = tipo === "niver"
        ? `FELIZ ANIVERSÁRIO!\n\nPaz seja contigo, querido(a) ${nome}!\n\nNesta data tão especial, celebramos a sua vida e o propósito de Deus em você. Desejamos que o Senhor derrame bênçãos sem medida.\n\nCom amor, Pastor Renato e Jaci Soares`
        : `Olá, *${nome}*! Paz seja contigo. Passando para saber como você está! Que sua semana seja abençoada.`;

    const fone = membro.telefone?.replace(/\D/g, "");
    if (!fone || fone.length < 10) { alert("Telefone inválido ou não cadastrado."); return; }
    window.open(`https://wa.me/55${fone}?text=${encodeURIComponent(saudacao)}`, "_blank");
  };

  const marcarComoAcompanhado = async (id) => {
    try {
      await api.post("/discipulado/acompanhamento", { membroId: id, mesReferencia: mes });
      setAlertas(prev => prev.filter(a => a.id !== id));
    } catch {
      alert("Erro ao atualizar acompanhamento.");
    }
  };

  const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  /* ─── CSS dinâmico — key={isDark} no <style> garante recriação ao trocar tema ─── */
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing: border-box; }

    @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes stripe { 0% { background-position:0 0; } 100% { background-position:60px 60px; } }
    @keyframes pulse  { 0%,100%{transform:scale(1);opacity:.45;} 50%{transform:scale(1.12);opacity:.12;} }
    @keyframes spin   { to { transform:rotate(360deg); } }
    @keyframes blink  { 0%,100%{opacity:1;} 50%{opacity:.4;} }

    .pp-card {
      background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius: 14px;
      backdrop-filter: blur(24px);
    }

    .pp-btn-ghost {
      background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};
      color: ${isDark ? IEQ.offWhite : IEQ.redDark};
      border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      border-radius: 8px; font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700;
      letter-spacing: .15em; cursor: pointer; transition: all .25s; padding: 11px 20px;
    }
    .pp-btn-ghost:hover { border-color: ${IEQ.red}; background: rgba(200,16,46,.1); }

    .pp-btn-emerald {
      background: linear-gradient(135deg,#065f46,#059669);
      color: #fff; border: none; border-radius: 8px;
      font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700; letter-spacing: .14em;
      cursor: pointer; transition: all .25s; padding: 10px 16px;
      display: flex; align-items: center; gap: 6px;
    }
    .pp-btn-emerald:hover { transform: translateY(-2px); filter: brightness(1.1); }

    .pp-stat-card {
      background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius: 14px; padding: 28px 24px;
      backdrop-filter: blur(24px);
      transition: transform .3s, box-shadow .3s;
    }
    .pp-stat-card:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(200,16,46,.12); }

    .pp-alerta-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 14px; gap: 12px;
      background: ${isDark ? "rgba(255,255,255,.025)" : "rgba(200,16,46,.035)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"};
      border-radius: 10px; transition: all .2s;
      flex-wrap: wrap;
    }
    .pp-alerta-row:hover { border-color: ${IEQ.red}; background: rgba(200,16,46,.07); }

    .pp-avatar {
      width: 38px; height: 38px; border-radius: 8px; flex-shrink: 0;
      background: linear-gradient(135deg,${IEQ.redDark},${IEQ.blue});
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px;
    }

    .pp-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 14px; border-radius: 99px;
      font-family: 'Cinzel', serif; font-size: 9px; font-weight: 700;
      letter-spacing: .18em; border: 1px solid;
    }

    .pp-month-input {
      background: transparent; border: none; outline: none;
      font-family: 'Cinzel', serif; font-size: 11px; font-weight: 700;
      letter-spacing: .12em; cursor: pointer;
      color: ${isDark ? IEQ.offWhite : "#1A0A0D"};
    }
    .pp-month-input::-webkit-calendar-picker-indicator {
      filter: ${isDark ? "invert(1)" : "none"}; opacity: .6; cursor: pointer;
    }

    .pp-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent,
        ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}, transparent);
      margin: 8px 0;
    }

    .pp-mini-stat {
      text-align: center; padding: 14px 10px; border-radius: 10px;
      background: ${isDark ? "rgba(255,255,255,.03)" : "rgba(200,16,46,.035)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"};
    }

    .pp-alerta-actions { display: flex; gap: 8px; width: 100%; }
    @media (min-width: 480px) { .pp-alerta-actions { width: auto; } }

    .pp-stats-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
    @media (min-width: 560px) { .pp-stats-grid { grid-template-columns: repeat(3,1fr); } }

    .pp-main-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
    @media (min-width: 860px) { .pp-main-grid { grid-template-columns: 2fr 1fr; } }

    .pp-modal-backdrop {
      position: fixed; inset: 0; z-index: 50;
      display: flex; align-items: flex-end; justify-content: center;
    }
    @media (min-width: 520px) { .pp-modal-backdrop { align-items: center; padding: 12px; } }

    .pp-modal-box {
      position: relative; z-index: 10; width: 100%;
      max-height: 90vh; display: flex; flex-direction: column;
      border-radius: 16px 16px 0 0; overflow: hidden;
    }
    @media (min-width: 520px) { .pp-modal-box { border-radius: 14px; max-height: calc(100vh - 24px); } }

    .spin-icon  { animation: spin  1s linear      infinite; display: inline-block; }
    .blink-icon { animation: blink 2s ease-in-out infinite; }
  `;

  if (loading && metricas.celulasAtivas === 0) {
    return (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 0" }}>
          <Loader2 size={32} className="spin-icon" style={{ color: IEQ.red }} />
        </div>
    );
  }

  return (
      <div style={{ color: textPrimary, fontFamily:"'EB Garamond',serif", position:"relative" }}>
        {/* key={isDark} força recriação do CSS ao trocar tema */}
        <style key={isDark ? "dark" : "light"}>{globalStyles}</style>

        <motion.div variants={containerVariants} initial="hidden" animate="visible"
                    style={{ display:"flex", flexDirection:"column", gap:24 }}>

          {/* ── Seletor de mês ── */}
          <motion.div variants={itemVariants} style={{ display:"flex", alignItems:"center", justifyContent:"flex-end" }}>
            <div style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"10px 16px", borderRadius:8,
              background: isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)",
              border:`1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"}`,
            }}>
              <Calendar size={14} style={{ color: IEQ.red }} />
              <input
                  type="month"
                  value={mes}
                  onChange={e => setMes(e.target.value)}
                  className="pp-month-input"
              />
            </div>
          </motion.div>

          {/* ── KPI Stats ── */}
          <motion.div variants={itemVariants} className="pp-stats-grid">
            {[
              { label:"CÉLULAS ATIVAS",  value: metricas.celulasAtivas,     icon:<Activity size={20}/>,  color: IEQ.blue,  grad:`linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})`  },
              { label:"MEMBROS TOTAIS",  value: metricas.totalMembros,      icon:<Users size={20}/>,     color: IEQ.red,   grad:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`    },
              { label:"MULTIPLICAÇÕES",  value: metricas.multiplicacoesMes, icon:<GitBranch size={20}/>, color:"#059669",  grad:"linear-gradient(135deg,#065f46,#059669)"               },
            ].map(({ label, value, icon, color, grad }) => (
                <motion.div key={label} className="pp-stat-card" variants={itemVariants}>
                  <div style={{ width:46, height:46, borderRadius:10, marginBottom:16, background:`${color}22`, display:"flex", alignItems:"center", justifyContent:"center", color }}>
                    {icon}
                  </div>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSecondary, margin:"0 0 6px" }}>{label}</p>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:42, fontWeight:700, margin:0, lineHeight:1,
                    background:grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                    {(value ?? 0).toLocaleString("pt-BR")}
                  </p>
                </motion.div>
            ))}
          </motion.div>

          {/* ── Grid principal ── */}
          <motion.div variants={itemVariants} className="pp-main-grid">

            {/* ── Alertas de Discipulado ── */}
            <div className="pp-card" style={{ overflow:"hidden" }}>
              <div style={{
                padding:"22px 24px",
                borderBottom:`1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"}`,
                display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <AlertTriangle size={18} style={{ color: IEQ.red }} />
                  <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>
                    ALERTAS DE DISCIPULADO
                  </h2>
                </div>
                <span className="pp-badge" style={{ color:IEQ.red, borderColor:"rgba(200,16,46,.35)", background:"rgba(200,16,46,.1)" }}>
                {alertas.length} CRÍTICOS
              </span>
              </div>

              <div style={{ padding:16, display:"flex", flexDirection:"column", gap:8 }}>
                {loading ? (
                    <div style={{ textAlign:"center", padding:"32px 0" }}>
                      <Loader2 size={28} className="spin-icon" style={{ color: IEQ.red }} />
                    </div>
                ) : alertas.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"40px 0" }}>
                      <CheckCircle size={36} style={{ color:"#059669", opacity:.35, display:"block", margin:"0 auto 10px" }} />
                      <p style={{ fontFamily:"'EB Garamond',serif", fontStyle:"italic", color:textSecondary }}>Tudo em dia! Nenhum alerta.</p>
                    </div>
                ) : alertas.map((m) => (
                    <div key={m.id} className="pp-alerta-row">
                      <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                        <div className="pp-avatar">{m.nome?.charAt(0).toUpperCase()}</div>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".1em", color:textPrimary, margin:0,
                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.nome}</p>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:IEQ.red, margin:0 }}>
                            {m.totalFaltas} falta{m.totalFaltas !== 1 ? "s" : ""} seguida{m.totalFaltas !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <div className="pp-alerta-actions">
                        <button
                            className="pp-btn-emerald"
                            style={{ flex:1, justifyContent:"center" }}
                            onClick={() => enviarWhatsApp(m)}
                        >
                          <MessageCircle size={15} /> WHATSAPP
                        </button>
                        <button
                            onClick={() => marcarComoAcompanhado(m.id)}
                            style={{
                              flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                              background: isDark ? "rgba(0,61,165,.15)" : "rgba(0,61,165,.1)",
                              border:"1px solid rgba(0,61,165,.3)", color:IEQ.blue,
                              borderRadius:8, padding:"10px 14px", cursor:"pointer",
                              fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".1em",
                              transition:"all .2s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,61,165,.25)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = isDark ? "rgba(0,61,165,.15)" : "rgba(0,61,165,.1)"; }}
                        >
                          <CheckCircle size={15} /> FEITO
                        </button>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            {/* ── Coluna direita ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Card Aniversariantes */}
              <div style={{
                background:`linear-gradient(135deg,${IEQ.redDark} 0%,${IEQ.red} 50%,${IEQ.redLight} 100%)`,
                borderRadius:14, padding:"28px 24px", position:"relative", overflow:"hidden",
              }}>
                <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(-55deg,rgba(255,255,255,.04) 0 10px,transparent 10px 20px)", backgroundSize:"30px 30px" }} />
                <div style={{ position:"relative", zIndex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                    <div style={{ width:44, height:44, borderRadius:10, background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Gift size={22} style={{ color:"#fff" }} />
                    </div>
                    <Sparkles size={18} className="blink-icon" style={{ color:"rgba(253,184,19,.9)" }} />
                  </div>

                  <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, letterSpacing:".14em", color:"#fff", margin:"0 0 4px" }}>
                    ANIVERSÁRIOS
                  </h2>
                  <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:"rgba(255,255,255,.65)", margin:"0 0 20px" }}>
                    Celebrando vidas hoje
                  </p>

                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {aniversariantes.length === 0 ? (
                        <p style={{ fontFamily:"'EB Garamond',serif", fontStyle:"italic", color:"rgba(255,255,255,.55)", textAlign:"center", padding:"18px 0" }}>
                          Nenhum aniversariante hoje.
                        </p>
                    ) : aniversariantes.slice(0, 4).map((p) => (
                        <div key={p.id} style={{
                          display:"flex", alignItems:"center", justifyContent:"space-between", gap:8,
                          background:"rgba(255,255,255,.12)", borderRadius:10, padding:"10px 14px",
                          backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,.1)",
                        }}>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, color:"#fff",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.nome}</span>
                          <button
                              onClick={() => enviarWhatsApp(p, "niver")}
                              style={{ background:"rgba(255,255,255,.9)", border:"none", borderRadius:8, padding:"7px 10px", cursor:"pointer", display:"flex", alignItems:"center", flexShrink:0, transition:"all .2s" }}
                              onMouseEnter={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.transform="scale(1.05)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.9)"; e.currentTarget.style.transform="scale(1)"; }}
                          >
                            <MessageCircle size={16} style={{ color:IEQ.redDark }} />
                          </button>
                        </div>
                    ))}
                    {aniversariantes.length > 4 && (
                        <button
                            onClick={() => setModalAniver(true)}
                            style={{ marginTop:4, background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.7)",
                              fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".14em",
                              display:"flex", alignItems:"center", justifyContent:"center", gap:4, transition:"color .2s" }}
                            onMouseEnter={e => { e.currentTarget.style.color="#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,.7)"; }}
                        >
                          VER TODOS ({aniversariantes.length}) <ChevronRight size={13} />
                        </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Mês Referência */}
              <div className="pp-card" style={{ padding:"24px 22px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                  <div style={{ width:38, height:38, borderRadius:8, background:`${IEQ.yellow}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <TrendingUp size={18} style={{ color: IEQ.yellowDark }} />
                  </div>
                  <div>
                    <p style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".12em", color:textPrimary, margin:0 }}>MÊS REFERÊNCIA</p>
                    <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:0 }}>
                      {mes ? new Date(mes + "-02").toLocaleDateString("pt-BR", { month:"long", year:"numeric" }) : "—"}
                    </p>
                  </div>
                </div>
                <div className="pp-divider" />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:12 }}>
                  {[
                    { label:"Multiplicações", value: metricas.multiplicacoesMes, color: IEQ.blue },
                    { label:"Células ativas",  value: metricas.celulasAtivas,     color: IEQ.red  },
                  ].map(({ label, value, color }) => (
                      <div key={label} className="pp-mini-stat">
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:26, fontWeight:700, color, margin:0, lineHeight:1 }}>{value ?? 0}</p>
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".12em", color:textSecondary, margin:"6px 0 0" }}>{label.toUpperCase()}</p>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Rodapé ── */}
          <div className="pp-divider" />
          <p style={{ textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSecondary, padding:"0 0 8px" }}>
            © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
          </p>
        </motion.div>

        {/* ── Modal todos os aniversariantes ── */}
        <AnimatePresence>
          {modalAniver && (
              <div className="pp-modal-backdrop">
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                            onClick={() => setModalAniver(false)}
                            style={{ position:"fixed", inset:0, background:"rgba(10,6,8,.85)", backdropFilter:"blur(16px)", zIndex:0 }} />
                <motion.div
                    initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }}
                    className="pp-card pp-modal-box"
                    style={{ maxWidth:420, padding:"24px 20px" }}
                >
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <QuadrangularCross size={22} />
                      <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, letterSpacing:".14em", color:textPrimary, margin:0 }}>
                        ANIVERSARIANTES DE HOJE
                      </h2>
                    </div>
                    <button onClick={() => setModalAniver(false)} style={{ background:"none", border:"none", cursor:"pointer", color:textSecondary, padding:4 }}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className="pp-divider" style={{ marginBottom:14 }} />
                  <div style={{ overflowY:"auto", display:"flex", flexDirection:"column", gap:8, maxHeight:"60vh" }}>
                    {aniversariantes.map((p) => (
                        <div key={p.id} style={{
                          display:"flex", alignItems:"center", justifyContent:"space-between", gap:8,
                          padding:"10px 12px", borderRadius:8,
                          background: isDark ? "rgba(255,255,255,.03)" : "rgba(200,16,46,.04)",
                          border:`1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`,
                        }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                            <div className="pp-avatar">{p.nome?.charAt(0).toUpperCase()}</div>
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, color:textPrimary,
                              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.nome}</span>
                          </div>
                          <button
                              className="pp-btn-emerald"
                              style={{ padding:"7px 12px", flexShrink:0, fontSize:9 }}
                              onClick={() => enviarWhatsApp(p, "niver")}
                          >
                            <MessageCircle size={13} /> PARABENIZAR
                          </button>
                        </div>
                    ))}
                  </div>
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </div>
  );
}
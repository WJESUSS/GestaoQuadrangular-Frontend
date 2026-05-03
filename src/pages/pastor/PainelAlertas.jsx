import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import {
  AlertTriangle, Loader2, RefreshCcw, CheckCircle2,
  TrendingDown, MessageCircle, Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

/* ─── Paleta IEQ ─── */
const IEQ = {
  red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
  yellow: "#FDB813", yellowDark: "#C48C00",
  blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
  white: "#FFFFFF", offWhite: "#F5F0E8",
  dark: "#0A0608", darkCard: "#110A0D",
};

function QuadrangularCross({ size = 28 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gVA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={IEQ.redLight} />
            <stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={IEQ.blueDark} />
            <stop offset="50%" stopColor={IEQ.blueLight} />
            <stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowA">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gVA)" filter="url(#glowA)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gHA)" filter="url(#glowA)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowA)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

export default function PainelAlertas({ isDark = false }) {
  const [alertas,   setAlertas]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const bg            = isDark ? IEQ.dark    : "#F0EAE8";
  const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing: border-box; }
    @keyframes stripe {
      0%   { background-position: 0 0; }
      100% { background-position: 60px 60px; }
    }
    @keyframes pulse { 0%,100% { transform:scale(1); opacity:.45; } 50% { transform:scale(1.12); opacity:.12; } }
    @keyframes spin  { to { transform: rotate(360deg); } }
    .ieq-bg-alerts {
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
    .ieq-card-alerts {
      background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius: 20px;
      backdrop-filter: blur(24px);
    }
    .ieq-btn-ghost-alerts {
      background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};
      color: ${isDark ? IEQ.offWhite : IEQ.redDark};
      border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      border-radius:8px; font-family:'Cinzel',serif; font-size:10px; font-weight:700;
      letter-spacing:.15em; cursor:pointer; transition: all .25s; padding:11px 20px;
      display:flex; align-items:center; gap:8px;
    }
    .ieq-btn-ghost-alerts:hover { border-color:${IEQ.red}; }
    .alert-card:hover { transform:translateY(-4px); box-shadow: 0 14px 36px rgba(200,16,46,.15); }
    .alert-card { transition: all .3s; }
    .pulse-ring-a { position:absolute; border-radius:50%; border:1px solid rgba(200,16,46,.35); animation: pulse 3s ease-in-out infinite; }
    .divider-a { height:1px; background: linear-gradient(90deg, transparent, ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}, transparent); margin: 8px 0; }
    .whatsapp-btn {
      width:100%; background: linear-gradient(135deg, #128C7E, #25D366);
      color:#fff; border:none; padding:16px; cursor:pointer;
      font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.16em;
      display:flex; align-items:center; justify-content:center; gap:10px;
      transition: all .25s;
    }
    .whatsapp-btn:hover { filter:brightness(1.1); }
    @media (max-width:640px) {
      .alerts-grid { grid-template-columns: 1fr !important; }
    }
  `;

  const carregarAlertas = async () => {
    setLoading(true);
    const token = localStorage.getItem("token")?.replace(/"/g, "");
    try {
      const res = await api.get("/api/alertas-celulas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlertas(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar alertas:", err);
    } finally {
      setLoading(false);
      setIsMounted(true);
    }
  };

  useEffect(() => { carregarAlertas(); }, []);

  const enviarWhatsApp = (alerta) => {
    const msg = `Olá líder ${alerta.lider}, notei uma queda na média da célula ${alerta.nomeCelula} (De ${alerta.mediaAnterior} para ${alerta.mediaAtual}). Tudo bem por aí? Como posso te ajudar?`;
    const fone = alerta.telefone?.replace(/\D/g, "") || "";
    window.open(`https://wa.me/55${fone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) return (
      <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background: bg }}>
        <style>{globalStyles}</style>
        <QuadrangularCross size={42} />
        <p style={{ fontFamily:"'Cinzel',serif", color: isDark ? IEQ.offWhite : IEQ.redDark, marginTop:16, letterSpacing:".2em", fontSize:11 }}>
          ANALISANDO SAÚDE DAS CÉLULAS...
        </p>
        <Loader2 size={24} style={{ color:IEQ.red, marginTop:12, animation:"spin 1s linear infinite" }} />
      </div>
  );

  return (
      <div style={{ minHeight:"100vh", background:bg, color:textPrimary, fontFamily:"'EB Garamond',serif", position:"relative", paddingBottom:60 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg-alerts" />

        <div style={{ position:"relative", zIndex:10, maxWidth:1200, margin:"0 auto", padding:"32px 16px 0" }}>

          {/* Header */}
          <motion.header initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
                         style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:36, flexWrap:"wrap", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                <div className="pulse-ring-a" style={{ width:68, height:68 }} />
                <div style={{ width:50, height:50, borderRadius:"50%", background: isDark ? "#1A0A0D" : "#fff", border:`1px solid rgba(200,16,46,.3)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <AlertTriangle size={24} style={{ color:IEQ.red }} />
                </div>
              </div>
              <div>
                <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:20, fontWeight:700, letterSpacing:".16em", margin:0,
                  background:`linear-gradient(90deg, ${IEQ.redDark}, ${IEQ.red}, ${IEQ.yellow})`,
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                  ALERTA DE CÉLULAS
                </h2>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSecondary, margin:0 }}>
                  QUEDA DE FREQUÊNCIA SUPERIOR A 20%
                </p>
              </div>
            </div>
            <button className="ieq-btn-ghost-alerts" onClick={carregarAlertas}>
              <RefreshCcw size={14} /> ATUALIZAR DADOS
            </button>
          </motion.header>

          <div className="divider-a" style={{ marginBottom:28 }} />

          {/* Empty State */}
          {alertas.length === 0 && (
              <motion.div initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }}
                          className="ieq-card-alerts"
                          style={{ padding:"64px 32px", textAlign:"center" }}>
                <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(0,61,165,.1)", border:`1px solid rgba(0,61,165,.2)`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                  <CheckCircle2 size={40} style={{ color:IEQ.blue }} />
                </div>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, letterSpacing:".14em", color:textPrimary, margin:"0 0 8px" }}>
                  REDE SAUDÁVEL
                </p>
                <p style={{ fontFamily:"'EB Garamond',serif", fontSize:15, color:textSecondary, margin:0 }}>
                  Todas as células estão mantendo ou superando suas médias de presença.
                </p>
              </motion.div>
          )}

          {/* Grid de Cards */}
          <div className="alerts-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:20 }}>
            <AnimatePresence>
              {alertas.map((alerta, index) => {
                const mediaAtual    = Number(alerta.mediaAtual    || 0);
                const mediaAnterior = Number(alerta.mediaAnterior || 0);
                const diffPercent   = mediaAnterior > 0 ? ((mediaAnterior - mediaAtual) / mediaAnterior * 100).toFixed(0) : 0;
                const chartData = [
                  { label: "Anterior", valor: mediaAnterior },
                  { label: "Atual",    valor: mediaAtual    },
                ];

                return (
                    <motion.div key={alerta.celulaId || index}
                                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:.95 }}
                                transition={{ delay: index * 0.08 }}
                                className="ieq-card-alerts alert-card"
                                style={{ overflow:"hidden" }}>

                      {/* Topo do card */}
                      <div style={{ padding:"24px 24px 0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                        <div>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, letterSpacing:".14em", color:textPrimary, margin:"0 0 4px" }}>
                            {alerta.nomeCelula}
                          </p>
                          <div style={{ display:"flex", alignItems:"center", gap:6, color:textSecondary }}>
                            <Phone size={10} />
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".12em" }}>
                          {alerta.lider || "SEM LÍDER"}
                        </span>
                          </div>
                        </div>
                        <span style={{ background:"rgba(200,16,46,.12)", color:IEQ.red, border:`1px solid rgba(200,16,46,.3)`, borderRadius:99, padding:"4px 12px", fontFamily:"'Cinzel',serif", fontSize:8.5, fontWeight:700, letterSpacing:".14em" }}>
                      CRÍTICO
                    </span>
                      </div>

                      {/* Métricas */}
                      <div style={{ padding:"20px 24px 0", display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                        <div>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".14em", color:textSecondary, margin:"0 0 4px" }}>
                            MÉDIA ATUAL
                          </p>
                          <div style={{ display:"flex", alignItems:"flex-end", gap:6 }}>
                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:36, fontWeight:700, color:textPrimary, lineHeight:1 }}>
                          {mediaAtual.toFixed(1)}
                        </span>
                            <TrendingDown size={18} style={{ color:IEQ.red, marginBottom:4 }} />
                          </div>
                        </div>
                        <div style={{ borderLeft:`1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.1)"}`, paddingLeft:16 }}>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".14em", color:textSecondary, margin:"0 0 4px" }}>
                            QUEDA DE
                          </p>
                          <span style={{ fontFamily:"'Cinzel',serif", fontSize:36, fontWeight:700, color:IEQ.red, lineHeight:1 }}>
                        {diffPercent}%
                      </span>
                        </div>
                      </div>

                      {/* Gráfico */}
                      <div style={{ height:140, padding:"8px 8px 0" }}>
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} margin={{ top:10, right:10, left:-25, bottom:0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.08} stroke={isDark ? "#fff" : "#000"} />
                                <XAxis dataKey="label" axisLine={false} tickLine={false}
                                       tick={{ fontSize:9, fontWeight:700, fill: isDark ? "rgba(245,240,232,.4)" : "rgba(26,10,13,.4)", fontFamily:"'Cinzel',serif", letterSpacing:".1em" }} />
                                <YAxis axisLine={false} tickLine={false}
                                       tick={{ fontSize:9, fill: isDark ? "rgba(245,240,232,.4)" : "rgba(26,10,13,.4)" }} />
                                <Tooltip cursor={{ fill:"transparent" }}
                                         contentStyle={{ borderRadius:10, border:`1px solid rgba(200,16,46,.2)`, fontFamily:"'Cinzel',serif", fontSize:10,
                                           background: isDark ? "#1A0A0D" : "#fff", color:textPrimary }} />
                                <Bar dataKey="valor" radius={[8,8,0,0]} barSize={38}>
                                  {chartData.map((_, i) => (
                                      <Cell key={i} fill={i === 1 ? IEQ.red : isDark ? "rgba(255,255,255,.12)" : "rgba(26,10,13,.1)"} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                        )}
                      </div>

                      {/* Botão WhatsApp */}
                      <button className="whatsapp-btn" onClick={() => enviarWhatsApp(alerta)}>
                        <MessageCircle size={16} /> APOIAR LÍDER NO WHATSAPP
                      </button>
                    </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
  );
}
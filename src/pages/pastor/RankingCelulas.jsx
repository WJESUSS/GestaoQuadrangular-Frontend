import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Trophy, Loader2, AlertCircle, RefreshCw,
  Calendar, TrendingUp, Star, Medal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";

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
          <linearGradient id="gVR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={IEQ.redLight} />
            <stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHR" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={IEQ.blueDark} />
            <stop offset="50%" stopColor={IEQ.blueLight} />
            <stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowR">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gVR)" filter="url(#glowR)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gHR)" filter="url(#glowR)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowR)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

export default function RankingCelulas({ isDark = false }) {
  const [ranking,        setRanking]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().toISOString().slice(0, 7));
  const dateInputRef = useRef(null);

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
    @keyframes pulse { 0%,100%{ transform:scale(1); opacity:.45; } 50%{ transform:scale(1.12); opacity:.12; } }
    @keyframes spin  { to { transform: rotate(360deg); } }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    .ieq-bg-rank {
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
    .ieq-card-rank {
      background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"};
      border-radius:18px;
      backdrop-filter: blur(24px);
      transition: all .3s;
    }
    .ieq-card-rank:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(200,16,46,.1); }
    .ieq-btn-ghost-rank {
      background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};
      color: ${isDark ? IEQ.offWhite : IEQ.redDark};
      border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      border-radius:8px; font-family:'Cinzel',serif; font-size:10px; font-weight:700;
      letter-spacing:.15em; cursor:pointer; transition:all .25s; padding:12px 20px;
      display:flex; align-items:center; gap:8px;
    }
    .ieq-btn-ghost-rank:hover { border-color:${IEQ.red}; }
    .ieq-btn-primary-rank {
      background: linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.red});
      color:#fff; border:none; border-radius:8px;
      font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.16em;
      cursor:pointer; transition:all .25s; padding:12px 24px;
      display:flex; align-items:center; gap:8px; white-space:nowrap;
    }
    .ieq-btn-primary-rank:hover { filter:brightness(1.1); transform:translateY(-2px); }
    .ieq-date-rank {
      background: transparent; border:none; outline:none;
      font-family:'Cinzel',serif; font-size:13px; font-weight:700;
      color:${isDark ? IEQ.offWhite : "#1A0A0D"}; cursor:pointer; width:100%;
    }
    .pulse-ring-r { position:absolute; border-radius:50%; border:1px solid rgba(253,184,19,.4); animation:pulse 3s ease-in-out infinite; }
    .divider-r { height:1px; background:linear-gradient(90deg,transparent,${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"},transparent); margin:8px 0; }
    .gold-title {
      background: linear-gradient(90deg, ${IEQ.yellowDark} 0%, ${IEQ.yellow} 40%, #fff8dc 60%, ${IEQ.yellow} 80%, ${IEQ.yellowDark} 100%);
      background-size: 200% auto;
      -webkit-background-clip:text; -webkit-text-fill-color:transparent;
      background-clip:text;
      animation: shimmer 3s linear infinite;
    }
    .podio-1st { background: linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.red}, ${IEQ.blueDark}); }
    .rank-row {
      display:flex; align-items:center; justify-content:space-between;
      padding:14px 16px;
      background:${isDark ? "rgba(255,255,255,.02)" : "rgba(200,16,46,.03)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.07)"};
      border-radius:10px; transition:all .2s; cursor:default;
    }
    .rank-row:hover { border-color:${IEQ.red}; background:${isDark ? "rgba(200,16,46,.06)" : "rgba(200,16,46,.07)"}; }
    @media (max-width:768px) {
      .podio-grid { flex-direction:column !important; align-items:stretch !important; }
      .podio-grid > * { width:100% !important; transform:none !important; }
    }
  `;

  const carregarRanking = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get(`/api/ranking/celulas?mes=${mesSelecionado}`);
      setRanking(res.data || []);
    } catch {
      setError("Não foi possível carregar o ranking.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarRanking(); }, [mesSelecionado]);

  const top3    = useMemo(() => ranking.slice(0, 3), [ranking]);
  const restante = useMemo(() => ranking.slice(3), [ranking]);

  if (loading && ranking.length === 0) return (
      <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:bg }}>
        <style>{globalStyles}</style>
        <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
          <div className="pulse-ring-r" style={{ width:72, height:72 }} />
          <QuadrangularCross size={42} />
        </div>
        <p style={{ fontFamily:"'Cinzel',serif", color:isDark ? IEQ.offWhite : IEQ.redDark, marginTop:16, letterSpacing:".2em", fontSize:11 }}>
          SINCRONIZANDO DADOS...
        </p>
        <Loader2 size={22} style={{ color:IEQ.yellow, marginTop:12, animation:"spin 1s linear infinite" }} />
      </div>
  );

  return (
      <div style={{ minHeight:"100vh", background:bg, color:textPrimary, fontFamily:"'EB Garamond',serif", position:"relative", paddingBottom:60 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg-rank" />

        <div style={{ position:"relative", zIndex:10, maxWidth:900, margin:"0 auto", padding:"32px 16px 0" }}>

          {/* Header */}
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
                      style={{ marginBottom:36 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                  <div className="pulse-ring-r" style={{ width:64, height:64 }} />
                  <div style={{ width:48, height:48, borderRadius:"50%", background:isDark ? "#1A0A0D" : "#fff", border:`1px solid rgba(253,184,19,.4)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Trophy size={22} style={{ color:IEQ.yellow }} />
                  </div>
                </div>
                <div>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSecondary, margin:0 }}>
                    PERFORMANCE MENSAL
                  </p>
                  <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:700, letterSpacing:".16em", margin:0,
                    background:`linear-gradient(90deg, ${IEQ.yellowDark}, ${IEQ.yellow}, ${IEQ.red})`,
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                    HALL DA FAMA
                  </h1>
                </div>
              </div>
            </div>

            {/* Seletor de mês + botão */}
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
              <div className="ieq-card-rank"
                   onClick={() => { if(dateInputRef.current?.showPicker) dateInputRef.current.showPicker(); else dateInputRef.current?.focus(); }}
                   style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", cursor:"pointer", flex:1, minWidth:200 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:`rgba(253,184,19,.12)`, border:`1px solid rgba(253,184,19,.25)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Calendar size={18} style={{ color:IEQ.yellowDark }} />
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".16em", color:textSecondary, margin:"0 0 2px" }}>MÊS DE REFERÊNCIA</p>
                  <input ref={dateInputRef} type="month" value={mesSelecionado}
                         onChange={e => setMesSelecionado(e.target.value)}
                         className="ieq-date-rank" />
                </div>
              </div>
              <button className="ieq-btn-primary-rank" onClick={carregarRanking}>
                {loading ? <Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} /> : <RefreshCw size={14} />}
                ATUALIZAR RANKING
              </button>
            </div>
          </motion.div>

          <div className="divider-r" style={{ marginBottom:32 }} />

          {/* Erro */}
          {error && (
              <div style={{ padding:"16px 20px", marginBottom:24, background:"rgba(200,16,46,.08)", border:`1px solid rgba(200,16,46,.25)`, borderRadius:12, display:"flex", alignItems:"center", gap:12, color:IEQ.red }}>
                <AlertCircle size={18} />
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:".12em" }}>{error}</span>
              </div>
          )}

          {ranking.length > 0 ? (
              <div style={{ display:"flex", flexDirection:"column", gap:40 }}>

                {/* Pódio */}
                <div className="podio-grid" style={{ display:"flex", alignItems:"flex-end", justifyContent:"center", gap:12 }}>

                  {/* 2º lugar */}
                  {top3[1] && (
                      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
                                  style={{ flex:"1 1 0", minWidth:0 }}>
                        <div className="ieq-card-rank" style={{ padding:"28px 20px 20px", textAlign:"center", position:"relative" }}>
                          <div style={{ position:"absolute", top:-20, left:"50%", transform:"translateX(-50%)", width:40, height:40, borderRadius:"50%", background:isDark ? "rgba(255,255,255,.1)" : "rgba(26,10,13,.07)", border:`3px solid ${isDark ? "#1A0A0D" : "#F0EAE8"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                            🥈
                          </div>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".14em", color:textSecondary, margin:"8px 0 6px" }}>2º LUGAR</p>
                          <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, letterSpacing:".1em", color:textPrimary, margin:"0 0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {top3[1].nomeCelula}
                          </h3>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, fontStyle:"italic", color:textSecondary, margin:"0 0 14px" }}>
                            {top3[1].lider}
                          </p>
                          <div style={{ padding:"10px", background:`rgba(200,16,46,.08)`, border:`1px solid rgba(200,16,46,.15)`, borderRadius:10 }}>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, color:IEQ.red }}>
                        {top3[1].pontuacao.toLocaleString()}
                      </span>
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".12em", color:textSecondary, marginLeft:4 }}>PTS</span>
                          </div>
                        </div>
                      </motion.div>
                  )}

                  {/* 1º lugar */}
                  {top3[0] && (
                      <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ delay:.05 }}
                                  style={{ flex:"1 1 0", minWidth:0, transform:"scale(1.04)", zIndex:2 }}>
                        <div className="podio-1st" style={{ borderRadius:20, padding:"44px 24px 24px", textAlign:"center", position:"relative", boxShadow:"0 20px 60px rgba(200,16,46,.3)" }}>
                          {/* Troféu */}
                          <div style={{ position:"absolute", top:-28, left:"50%", transform:"translateX(-50%)", width:56, height:56, borderRadius:"50%", background:`linear-gradient(135deg, ${IEQ.yellow}, ${IEQ.yellowDark})`, border:`4px solid ${isDark ? IEQ.dark : "#F0EAE8"}`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(253,184,19,.5)" }}>
                            <Trophy size={28} style={{ color:"#fff" }} />
                          </div>
                          {/* Estrelas */}
                          <div style={{ display:"flex", justifyContent:"center", gap:3, marginBottom:10 }}>
                            {[0,1,2].map(i => <Star key={i} size={12} style={{ color:IEQ.yellow }} fill={IEQ.yellow} />)}
                          </div>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".18em", color:"rgba(255,255,255,.5)", margin:"0 0 6px" }}>1º LUGAR</p>
                          <h3 className="gold-title" style={{ fontFamily:"'Cinzel',serif", fontSize:18, fontWeight:700, letterSpacing:".12em", margin:"0 0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {top3[0].nomeCelula}
                          </h3>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, fontStyle:"italic", color:"rgba(255,255,255,.55)", margin:"0 0 18px" }}>
                            {top3[0].lider}
                          </p>
                          <div style={{ padding:"14px", background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.2)", borderRadius:12, backdropFilter:"blur(8px)" }}>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:24, fontWeight:700, color:"#fff" }}>
                        {top3[0].pontuacao.toLocaleString()}
                      </span>
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".14em", color:"rgba(255,255,255,.5)", marginLeft:6 }}>PTS</span>
                          </div>
                        </div>
                      </motion.div>
                  )}

                  {/* 3º lugar */}
                  {top3[2] && (
                      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}
                                  style={{ flex:"1 1 0", minWidth:0 }}>
                        <div className="ieq-card-rank" style={{ padding:"28px 20px 20px", textAlign:"center", position:"relative" }}>
                          <div style={{ position:"absolute", top:-20, left:"50%", transform:"translateX(-50%)", width:40, height:40, borderRadius:"50%", background:"rgba(200,80,16,.12)", border:`3px solid ${isDark ? "#1A0A0D" : "#F0EAE8"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                            🥉
                          </div>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".14em", color:textSecondary, margin:"8px 0 6px" }}>3º LUGAR</p>
                          <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, letterSpacing:".1em", color:textPrimary, margin:"0 0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {top3[2].nomeCelula}
                          </h3>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, fontStyle:"italic", color:textSecondary, margin:"0 0 14px" }}>
                            {top3[2].lider}
                          </p>
                          <div style={{ padding:"10px", background:`rgba(200,16,46,.08)`, border:`1px solid rgba(200,16,46,.15)`, borderRadius:10 }}>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, color:IEQ.red }}>
                        {top3[2].pontuacao.toLocaleString()}
                      </span>
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".12em", color:textSecondary, marginLeft:4 }}>PTS</span>
                          </div>
                        </div>
                      </motion.div>
                  )}
                </div>

                {/* Lista restante */}
                {restante.length > 0 && (
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSecondary, margin:"0 0 4px 4px" }}>
                        CLASSIFICAÇÃO GERAL
                      </p>
                      {restante.map((cel, i) => (
                          <motion.div key={cel.celulaId} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.04 }}
                                      className="rank-row">
                            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                              <div style={{ width:40, height:40, borderRadius:10, background:isDark ? "rgba(255,255,255,.05)" : "rgba(200,16,46,.07)", border:`1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:12, color:textSecondary, flexShrink:0 }}>
                                {i + 4}º
                              </div>
                              <div>
                                <p style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, letterSpacing:".1em", color:textPrimary, margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }}>
                                  {cel.nomeCelula}
                                </p>
                                <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:0 }}>
                                  {cel.lider || "—"}
                                </p>
                              </div>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                              <span style={{ fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:700, color:IEQ.red }}>{cel.pontuacao.toLocaleString()}</span>
                              <span style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".1em", color:textSecondary }}>PTS</span>
                            </div>
                          </motion.div>
                      ))}
                    </div>
                )}
              </div>
          ) : (
              <div style={{ textAlign:"center", padding:"64px 32px", background:isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)", borderRadius:20, border:`2px dashed ${isDark ? "rgba(200,16,46,.18)" : "rgba(200,16,46,.14)"}` }}>
                <Medal size={52} style={{ color:isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)", margin:"0 auto 16px" }} />
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:".14em", color:textSecondary, margin:0 }}>
                  NENHUM RESULTADO PARA ESTE MÊS
                </p>
              </div>
          )}
        </div>
      </div>
  );
}
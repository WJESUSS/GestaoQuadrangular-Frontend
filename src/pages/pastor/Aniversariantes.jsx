import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, CheckCircle2, Search, MessageCircle, Sparkles, Gift
} from "lucide-react";

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
          <linearGradient id="gVB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={IEQ.redLight} />
            <stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={IEQ.blueDark} />
            <stop offset="50%" stopColor={IEQ.blueLight} />
            <stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowB">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gVB)" filter="url(#glowB)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gHB)" filter="url(#glowB)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowB)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

const itemVariants = {
  hidden:  { opacity:0, y:20, scale:.95 },
  visible: { opacity:1, y:0, scale:1, transition:{ type:"spring", stiffness:100 } },
};

export default function AniversariantesPremium({ isDark = false }) {
  const [lista,    setLista]    = useState([]);
  const [enviados, setEnviados] = useState(new Set());
  const [busca,    setBusca]    = useState("");
  const [loading,  setLoading]  = useState(true);

  const STORAGE_KEY = `aniversariantes_enviados_${new Date().toISOString().slice(0,10)}`;

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
    .ieq-bg-aniv {
      position:fixed; inset:0; pointer-events:none; z-index:0;
      background: repeating-linear-gradient(
        -55deg,
        ${isDark ? "rgba(200,16,46,.04)" : "rgba(253,184,19,.06)"} 0 10px,
        transparent 10px 20px,
        ${isDark ? "rgba(253,184,19,.03)" : "rgba(200,16,46,.04)"} 20px 30px,
        transparent 30px 40px
      );
      background-size:60px 60px;
      animation: stripe 8s linear infinite;
    }
    .ieq-input-aniv {
      width:100%;
      background:${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      color:${isDark ? IEQ.offWhite : "#1A0A0D"};
      padding:14px 14px 14px 44px; border-radius:12px; outline:none;
      font-family:'EB Garamond',serif; font-size:15px;
      transition: all .25s;
    }
    .ieq-input-aniv:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-input-aniv::placeholder { color:${isDark ? "rgba(245,240,232,.25)" : "rgba(26,10,13,.3)"}; }
    .aniv-member-card {
      background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"};
      border-radius:16px; padding:14px 16px;
      display:flex; align-items:center; gap:14px;
      transition: all .25s;
    }
    .aniv-member-card:hover { border-color:${IEQ.red}; transform:translateY(-2px); }
    .aniv-member-card.sent {
      opacity:.6;
      background: ${isDark ? "rgba(255,255,255,.02)" : "rgba(26,10,13,.03)"};
      border-color: ${isDark ? "rgba(255,255,255,.06)" : "rgba(26,10,13,.08)"};
    }
    .pulse-ring-b { position:absolute; border-radius:50%; border:1px solid rgba(253,184,19,.4); animation: pulse 3s ease-in-out infinite; }
    .divider-b { height:1px; background: linear-gradient(90deg, transparent, ${isDark ? "rgba(253,184,19,.25)" : "rgba(200,16,46,.2)"}, transparent); margin:8px 0; }
    .send-all-btn {
      position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
      background: linear-gradient(135deg, ${IEQ.yellowDark}, ${IEQ.yellow});
      color: ${IEQ.dark}; border:none; border-radius:99px;
      font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.16em;
      padding:18px 40px; cursor:pointer; display:flex; align-items:center; gap:10px;
      box-shadow: 0 12px 32px rgba(253,184,19,.4);
      transition: all .3s; white-space:nowrap; z-index:100;
    }
    .send-all-btn:hover { filter:brightness(1.08); transform:translateX(-50%) translateY(-3px); }
    @media (max-width:480px) {
      .send-all-btn { width:90%; justify-content:center; }
    }
  `;

  const obterLink = (membro) => {
    const saudacao = `A paz seja contigo, minha ovelhinha! 🕊️\n\nFeliz aniversário! Que Deus abençoe grandemente sua vida, trazendo saúde e paz. 🙏\n\nSão os votos do *Pastor Renato e Jaci Soares*. ❤`;
    let numero = membro.telefone.replace(/\D/g, "");
    if (!numero.startsWith("55")) numero = `55${numero}`;
    return `https://wa.me/${numero}?text=${encodeURIComponent(saudacao)}`;
  };

  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) setEnviados(new Set(JSON.parse(salvo)));
    api.get("/aniversariantes/hoje")
        .then(res => setLista(res.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...enviados]));
  }, [enviados]);

  const marcarEnviado = (id) => setEnviados(prev => new Set(prev).add(id));

  const filtrados   = lista.filter(m => m.nome?.toLowerCase().includes(busca.toLowerCase()));
  const progresso   = lista.length > 0 ? (enviados.size / lista.length) * 100 : 0;
  const pendentes   = lista.filter(m => !enviados.has(m.id));

  if (loading) return (
      <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:bg }}>
        <style>{globalStyles}</style>
        <QuadrangularCross size={42} />
        <p style={{ fontFamily:"'Cinzel',serif", color:isDark ? IEQ.offWhite : IEQ.redDark, marginTop:16, letterSpacing:".2em", fontSize:11 }}>
          CARREGANDO CELEBRAÇÕES...
        </p>
      </div>
  );

  return (
      <div style={{ minHeight:"100vh", background:bg, color:textPrimary, fontFamily:"'EB Garamond',serif", position:"relative", paddingBottom:100 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg-aniv" />

        <div style={{ position:"relative", zIndex:10, maxWidth:640, margin:"0 auto", padding:"32px 16px 0" }}>

          {/* Header */}
          <motion.header initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
                         style={{ display:"flex", alignItems:"center", gap:18, marginBottom:36 }}>
            <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
              <div className="pulse-ring-b" style={{ width:68, height:68 }} />
              <div style={{ width:50, height:50, borderRadius:"50%", background:isDark ? "#1A0A0D" : "#fff", border:`1px solid rgba(253,184,19,.4)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <QuadrangularCross size={28} />
              </div>
            </div>
            <div>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSecondary, margin:0 }}>
                IGREJA UNIÃO E PODER
              </p>
              <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:20, fontWeight:700, letterSpacing:".14em", margin:0,
                background:`linear-gradient(90deg, ${IEQ.yellowDark}, ${IEQ.yellow}, ${IEQ.red})`,
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                CELEBRAÇÕES
              </h1>
            </div>
            <Sparkles size={20} style={{ color:IEQ.yellow, marginLeft:"auto" }} />
          </motion.header>

          {/* Hero Card */}
          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
                      style={{ borderRadius:20, padding:"32px 28px", marginBottom:28, background:`linear-gradient(135deg, ${IEQ.dark}, #1A0A0D)`, border:`1px solid rgba(253,184,19,.2)`, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:`repeating-linear-gradient(-55deg,rgba(253,184,19,.04) 0 10px,transparent 10px 20px)`, backgroundSize:"40px 40px" }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <Gift size={16} style={{ color:IEQ.yellow }} />
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:"rgba(253,184,19,.6)" }}>
                ANIVERSARIANTES DE HOJE
              </span>
              </div>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:56, fontWeight:700, color:"#fff", margin:"0 0 20px", lineHeight:1 }}>
                {lista.length}
              </p>
              <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".15em", color:"rgba(255,255,255,.4)", marginBottom:8 }}>
                <span>PROGRESSO DE ENVIOS</span>
                <span>{Math.round(progresso)}%</span>
              </div>
              <div style={{ height:6, borderRadius:99, background:"rgba(255,255,255,.08)", overflow:"hidden" }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${progresso}%` }} transition={{ duration:1.2, ease:"easeOut" }}
                            style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg, ${IEQ.red}, ${IEQ.yellow})` }} />
              </div>
            </div>
          </motion.div>

          {/* Busca */}
          <div style={{ position:"relative", marginBottom:24 }}>
            <Search size={15} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.7 }} />
            <input className="ieq-input-aniv" placeholder="Procurar por nome..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>

          <div className="divider-b" style={{ marginBottom:20 }} />

          {/* Lista */}
          <motion.div initial="hidden" animate="visible" variants={{ visible:{ transition:{ staggerChildren:.06 } } }}
                      style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <AnimatePresence>
              {filtrados.map(m => {
                const jaEnviado = enviados.has(m.id);
                return (
                    <motion.div key={m.id} variants={itemVariants} layout
                                className={`aniv-member-card${jaEnviado ? " sent" : ""}`}>
                      <div style={{ width:42, height:42, borderRadius:10, flexShrink:0,
                        background: jaEnviado ? (isDark ? "rgba(255,255,255,.06)" : "rgba(26,10,13,.07)")
                            : `linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.yellow})`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        color: jaEnviado ? textSecondary : "#fff",
                        fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:16 }}>
                        {m.nome?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, letterSpacing:".1em", color:textPrimary, margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {m.nome}
                        </p>
                        <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:0 }}>
                          {m.telefone}
                        </p>
                      </div>
                      <button onClick={() => { window.open(obterLink(m), "_blank"); marcarEnviado(m.id); }}
                              style={{ width:42, height:42, borderRadius:10, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .2s",
                                background: jaEnviado ? "rgba(0,61,165,.1)" : `linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.red})`,
                                color: jaEnviado ? IEQ.blue : "#fff" }}>
                        {jaEnviado ? <CheckCircle2 size={18} /> : <MessageCircle size={18} />}
                      </button>
                    </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Botão flutuante */}
        {!loading && progresso < 100 && pendentes.length > 0 && (
            <motion.button initial={{ y:100 }} animate={{ y:0 }} className="send-all-btn"
                           onClick={() => {
                             pendentes.forEach(p => window.open(obterLink(p), "_blank"));
                             setEnviados(new Set(lista.map(l => l.id)));
                           }}>
              <Send size={16} /> ENVIAR PARA TODOS ({pendentes.length})
            </motion.button>
        )}
      </div>
  );
}
import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import {
  CheckCircle, XCircle, Loader2, GitFork,
  Users, Calendar, CheckCircle2, Sparkles
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
          <linearGradient id="gVC" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={IEQ.redLight} />
            <stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHC" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={IEQ.blueDark} />
            <stop offset="50%" stopColor={IEQ.blueLight} />
            <stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowC">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gVC)" filter="url(#glowC)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gHC)" filter="url(#glowC)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowC)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

export default function SolicitacoesMultiplicacao({ isDark = false }) {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading,      setLoading]      = useState(true);

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
    .ieq-bg-mult {
      position:fixed; inset:0; pointer-events:none; z-index:0;
      background: repeating-linear-gradient(
        -55deg,
        ${isDark ? "rgba(0,61,165,.04)" : "rgba(0,61,165,.05)"} 0 10px,
        transparent 10px 20px,
        ${isDark ? "rgba(253,184,19,.03)" : "rgba(253,184,19,.05)"} 20px 30px,
        transparent 30px 40px
      );
      background-size:60px 60px;
      animation: stripe 8s linear infinite;
    }
    .ieq-card-mult {
      background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border: 1px solid ${isDark ? "rgba(0,61,165,.18)" : "rgba(0,61,165,.14)"};
      border-radius: 20px;
      backdrop-filter: blur(24px);
      overflow:hidden;
      transition: all .3s;
    }
    .ieq-card-mult:hover { transform:translateY(-4px); box-shadow: 0 14px 36px rgba(0,61,165,.12); border-color:${IEQ.blue}; }
    .pulse-ring-c { position:absolute; border-radius:50%; border:1px solid rgba(0,61,165,.35); animation: pulse 3s ease-in-out infinite; }
    .divider-c { height:1px; background: linear-gradient(90deg, transparent, ${isDark ? "rgba(0,61,165,.25)" : "rgba(0,61,165,.2)"}, transparent); margin:8px 0; }
    .btn-approve {
      flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px;
      background: linear-gradient(135deg, #0d7c50, #16a269);
      color:#fff; border:none; padding:18px; border-radius:14px; cursor:pointer;
      font-family:'Cinzel',serif; font-size:9.5px; font-weight:700; letter-spacing:.14em;
      transition: all .25s; box-shadow: 0 6px 20px rgba(22,162,105,.25);
    }
    .btn-approve:hover { filter:brightness(1.1); transform:translateY(-2px); }
    .btn-reject {
      flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px;
      background: ${isDark ? "rgba(255,255,255,.06)" : "rgba(200,16,46,.06)"};
      color: ${isDark ? "rgba(245,240,232,.6)" : "rgba(200,16,46,.7)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      padding:18px; border-radius:14px; cursor:pointer;
      font-family:'Cinzel',serif; font-size:9.5px; font-weight:700; letter-spacing:.14em;
      transition: all .25s;
    }
    .btn-reject:hover { background:rgba(200,16,46,.12); border-color:${IEQ.red}; color:${IEQ.red}; transform:translateY(-2px); }
    @media (max-width:640px) {
      .mult-grid { grid-template-columns: 1fr !important; }
    }
  `;

  const fetchSolicitacoes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const res = await api.get("/celulas/solicitacoes-multiplicacao", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitacoes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erro ao carregar solicitações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSolicitacoes(); }, []);

  const decidir = async (id, aprovado) => {
    if (!window.confirm(`Deseja realmente ${aprovado ? "APROVAR" : "RECUSAR"}?`)) return;
    try {
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      await api.post(`/celulas/${id}/decidir-multiplicacao`, { aprovado },
          { headers: { Authorization: `Bearer ${token}` } });
      setSolicitacoes(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao processar.");
    }
  };

  if (loading) return (
      <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:bg }}>
        <style>{globalStyles}</style>
        <QuadrangularCross size={42} />
        <p style={{ fontFamily:"'Cinzel',serif", color:isDark ? IEQ.offWhite : IEQ.blueDark, marginTop:16, letterSpacing:".2em", fontSize:11 }}>
          SINCRONIZANDO EXPANSÃO...
        </p>
        <Loader2 size={24} style={{ color:IEQ.blue, marginTop:12, animation:"spin 1s linear infinite" }} />
      </div>
  );

  return (
      <div style={{ minHeight:"100vh", background:bg, color:textPrimary, fontFamily:"'EB Garamond',serif", position:"relative", paddingBottom:60 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg-mult" />

        <div style={{ position:"relative", zIndex:10, maxWidth:1100, margin:"0 auto", padding:"32px 16px 0" }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:32 }}>
            <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
              <div className="pulse-ring-c" style={{ width:68, height:68 }} />
              <div style={{ width:50, height:50, borderRadius:"50%", background:isDark ? "#1A0A0D" : "#fff", border:`1px solid rgba(0,61,165,.3)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <GitFork size={22} style={{ color:IEQ.blue }} />
              </div>
            </div>
            <div>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSecondary, margin:0 }}>
                PAINEL DE APROVAÇÃO
              </p>
              <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:20, fontWeight:700, letterSpacing:".16em", margin:0,
                background:`linear-gradient(90deg, ${IEQ.blueDark}, ${IEQ.blue}, ${IEQ.yellow})`,
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                MULTIPLICAÇÃO
              </h2>
            </div>
            <div style={{ marginLeft:"auto", background:`rgba(0,61,165,.1)`, border:`1px solid rgba(0,61,165,.2)`, borderRadius:99, padding:"6px 16px", fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".12em", color:IEQ.blue }}>
              {solicitacoes.length} PENDENTES
            </div>
          </div>

          <div className="divider-c" style={{ marginBottom:28 }} />

          {/* Empty */}
          {solicitacoes.length === 0 && (
              <div style={{ textAlign:"center", padding:"64px 32px", background:isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)", borderRadius:20, border:`1px solid ${isDark ? "rgba(0,61,165,.15)" : "rgba(0,61,165,.12)"}` }}>
                <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(0,61,165,.1)", border:`1px solid rgba(0,61,165,.2)`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                  <CheckCircle2 size={40} style={{ color:IEQ.blue }} />
                </div>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, letterSpacing:".14em", color:textPrimary, margin:"0 0 8px" }}>
                  TUDO EM ORDEM!
                </p>
                <p style={{ fontFamily:"'EB Garamond',serif", fontSize:15, color:textSecondary, margin:0 }}>
                  Nenhum pedido pendente. Suas células estão em dia!
                </p>
              </div>
          )}

          {/* Grid */}
          <div className="mult-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:20 }}>
            {solicitacoes.map((s, i) => (
                <div key={s.id} className="ieq-card-mult"
                     style={{ animation:`fadeUp .5s ease ${i * .08}s both` }}
                >
                  <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>

                  <div style={{ padding:"24px 24px 20px" }}>
                    {/* Topo */}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                      <span style={{ background:`rgba(0,61,165,.1)`, color:IEQ.blue, border:`1px solid rgba(0,61,165,.2)`, borderRadius:99, padding:"3px 10px", fontFamily:"'Cinzel',serif", fontSize:8, fontWeight:700, letterSpacing:".14em", display:"flex", alignItems:"center", gap:5 }}>
                        <Sparkles size={9} /> SOLICITAÇÃO
                      </span>
                        </div>
                        <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, letterSpacing:".12em", color:textPrimary, margin:"0 0 4px" }}>
                          {s.nome}
                        </h3>
                        <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:0 }}>
                          Líder: <span style={{ color:IEQ.blue }}>{s.liderNome || "N/A"}</span>
                        </p>
                      </div>
                      <div style={{ background:isDark ? "rgba(255,255,255,.06)" : "rgba(26,10,13,.06)", border:`1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(26,10,13,.1)"}`, borderRadius:12, padding:"10px 14px", textAlign:"center", minWidth:60 }}>
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:700, color:textPrimary, margin:0, lineHeight:1 }}>{s.qtdMembros || 0}</p>
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".1em", color:textSecondary, margin:"4px 0 0" }}>MEMBROS</p>
                      </div>
                    </div>

                    {/* Motivo */}
                    <div style={{ padding:"14px 16px", background:isDark ? "rgba(255,255,255,.03)" : "rgba(0,61,165,.04)", border:`1px dashed ${isDark ? "rgba(0,61,165,.2)" : "rgba(0,61,165,.16)"}`, borderRadius:12, marginBottom:20 }}>
                      <p style={{ fontFamily:"'EB Garamond',serif", fontSize:15, fontStyle:"italic", color:textSecondary, margin:0, lineHeight:1.6 }}>
                        "{s.motivoSolicitacao || "Sem justificativa formal anexada."}"
                      </p>
                    </div>

                    {/* Botões */}
                    <div style={{ display:"flex", gap:12 }}>
                      <button className="btn-approve" onClick={() => decidir(s.id, true)}>
                        <CheckCircle size={18} /> APROVAR
                      </button>
                      <button className="btn-reject" onClick={() => decidir(s.id, false)}>
                        <XCircle size={18} /> RECUSAR
                      </button>
                    </div>
                  </div>

                  {/* Rodapé */}
                  <div style={{ padding:"12px 24px", background:isDark ? "rgba(255,255,255,.02)" : "rgba(0,61,165,.03)", borderTop:`1px solid ${isDark ? "rgba(0,61,165,.12)" : "rgba(0,61,165,.08)"}`, display:"flex", gap:16 }}>
                <span style={{ display:"flex", alignItems:"center", gap:5, fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".12em", color:textSecondary }}>
                  <Users size={10} /> DISPONÍVEL
                </span>
                    <span style={{ display:"flex", alignItems:"center", gap:5, fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".12em", color:textSecondary }}>
                  <Calendar size={10} /> PENDENTE
                </span>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}
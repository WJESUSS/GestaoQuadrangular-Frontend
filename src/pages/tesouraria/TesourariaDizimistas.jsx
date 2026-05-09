import React, { useEffect, useState, useRef } from "react";
import api from "../../services/api.js";
import {
    Users, CheckCircle2, AlertCircle, Search,
    UserCheck, UserX, Fingerprint
} from "lucide-react";

const getCSS = (isDark) => `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  * { box-sizing: border-box; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.45} }
  @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

  .dz-root { animation: fadeUp .5s ease; }

  .dz-skel {
    background: linear-gradient(90deg,
      ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.07)"} 25%,
      ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.14)"} 50%,
      ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.07)"} 75%
    );
    background-size: 400px 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 8px;
  }

  /* Stats cards */
  .dz-stat-card {
    background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
    border: 1px solid ${isDark ? "rgba(200,16,46,.18)" : "rgba(200,16,46,.1)"};
    border-radius: 14px; backdrop-filter: blur(24px);
    padding: 20px; display:flex; align-items:center; gap:16px;
  }

  /* Coluna section */
  .dz-col-header {
    display:flex; align-items:center; gap:10px;
    padding-bottom:14px;
    border-bottom: 1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"};
    margin-bottom:14px;
  }
  .dz-col-title {
    font-family:'Cinzel',serif; font-size:11px; font-weight:700;
    letter-spacing:.14em; text-transform:uppercase;
    color:${isDark ? "#F5F0E8" : "#1A0A0D"};
  }

  /* Membro row */
  .dz-row {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 14px; border-radius:10px;
    background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
    border: 1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.08)"};
    transition: border-color .2s;
    margin-bottom:8px;
  }
  .dz-row:hover {
    border-color: ${isDark ? "rgba(200,16,46,.3)" : "rgba(200,16,46,.22)"};
  }

  /* Search */
  .dz-search-wrap { position:relative; width:100%; }
  @media (min-width:640px) { .dz-search-wrap { width:300px; } }
  .dz-search-icon {
    position:absolute; left:13px; top:50%; transform:translateY(-50%);
    color:${isDark ? "rgba(245,240,232,.3)" : "rgba(26,10,13,.3)"}; pointer-events:none;
  }
  .dz-search {
    width:100%;
    background: ${isDark ? "rgba(200,16,46,.06)" : "rgba(200,16,46,.03)"};
    border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.14)"};
    color: ${isDark ? "#F5F0E8" : "#1A0A0D"};
    padding: 11px 14px 11px 38px; border-radius:10px; outline:none;
    font-family:'EB Garamond',serif; font-size:15px; transition:all .25s;
  }
  .dz-search:focus { border-color:#C8102E; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
  .dz-search::placeholder { color:${isDark ? "rgba(245,240,232,.25)" : "rgba(26,10,13,.3)"}; }

  /* Live badge */
  .dz-badge {
    display:inline-flex; align-items:center; gap:6px;
    padding:5px 12px; border-radius:99px;
    background: ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.08)"};
    border: 1px solid rgba(200,16,46,.2);
    font-family:'Cinzel',serif; font-size:9px; font-weight:700;
    letter-spacing:.18em; text-transform:uppercase; color:#C8102E;
    margin-bottom:10px;
  }
  .dz-live-dot {
    width:6px; height:6px; border-radius:50%;
    background:#C8102E; animation: pulse 1.5s ease infinite;
  }

  /* Empty state */
  .dz-empty {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    padding:40px 0; border-radius:12px;
    border: 1px dashed ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"};
  }

  /* Header row */
  .dz-header-row {
    display:flex; flex-direction:column; gap:14px; margin-bottom:24px;
  }
  @media (min-width:640px) {
    .dz-header-row { flex-direction:row; align-items:flex-end; justify-content:space-between; }
  }

  /* Stats grid */
  .dz-stats-grid {
    display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-bottom:24px;
  }

  /* Colunas grid */
  .dz-cols-grid {
    display:grid; grid-template-columns:1fr; gap:20px;
  }
  @media (min-width:800px) {
    .dz-cols-grid { grid-template-columns:repeat(2,1fr); }
  }

  .dz-list {
    max-height:460px; overflow-y:auto; padding-right:2px;
    scrollbar-width:thin;
    scrollbar-color: ${isDark ? "rgba(200,16,46,.2) transparent" : "rgba(200,16,46,.15) transparent"};
  }
  .dz-list::-webkit-scrollbar { width:4px; }
  .dz-list::-webkit-scrollbar-track { background:transparent; }
  .dz-list::-webkit-scrollbar-thumb {
    background: ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"};
    border-radius:99px;
  }
`;

let _cacheDiz = null;

export default function TesourariaDizimistas({ isDark = false }) {
    const [fieis,   setFieis]   = useState(_cacheDiz?.fieis   || []);
    const [infieis, setInfieis] = useState(_cacheDiz?.infieis || []);
    const [loading, setLoading] = useState(!_cacheDiz);
    const [busca,   setBusca]   = useState("");
    const abortRef = useRef(null);

    const textPrimary   = isDark ? "#F5F0E8" : "#1A0A0D";
    const textSecondary = isDark ? "rgba(245,240,232,.4)" : "rgba(26,10,13,.4)";

    useEffect(() => {
        if (_cacheDiz) {
            setFieis(_cacheDiz.fieis); setInfieis(_cacheDiz.infieis); setLoading(false);
        }
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        api.get("/tesouraria/fieis-infieis-mes", { signal: abortRef.current.signal })
            .then(res => {
                const f = res.data.fieis   || [];
                const i = res.data.infieis || [];
                _cacheDiz = { fieis: f, infieis: i };
                setFieis(f); setInfieis(i);
            })
            .catch(err => { if (err.name !== "CanceledError" && err.name !== "AbortError") console.error(err); })
            .finally(() => setLoading(false));
        return () => abortRef.current?.abort();
    }, []);

    const filtrar = lista => lista.filter(m => m.nome.toLowerCase().includes(busca.toLowerCase()));

    if (loading) return (
        <>
            <style key={isDark ? "dark" : "light"}>{getCSS(isDark)}</style>
            <div style={{ padding:20 }}>
                <div className="dz-skel" style={{ height:40, width:"45%", marginBottom:24 }} />
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:20 }}>
                    <div className="dz-skel" style={{ height:80, borderRadius:14 }} />
                    <div className="dz-skel" style={{ height:80, borderRadius:14 }} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                    {[0,1].map(col => (
                        <div key={col} style={{ display:"flex", flexDirection:"column", gap:10 }}>
                            {[1,2,3,4].map(i => (
                                <div key={i} className="dz-skel" style={{ height:64, borderRadius:10 }} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );

    return (
        <>
            <style key={isDark ? "dark" : "light"}>{getCSS(isDark)}</style>
            <div className="dz-root" style={{ maxWidth:1100, margin:"0 auto", padding:"16px 4px" }}>

                {/* HEADER */}
                <div className="dz-header-row">
                    <div>
                        <div className="dz-badge">
                            <div className="dz-live-dot" /> MONITORAMENTO MENSAL
                        </div>
                        <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:700, color:textPrimary, margin:0, lineHeight:1.1 }}>
                            Dizimistas
                        </h2>
                    </div>
                    <div className="dz-search-wrap">
                        <Search size={15} className="dz-search-icon" />
                        <input
                            type="text"
                            className="dz-search"
                            placeholder="Buscar por nome..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                    </div>
                </div>

                {/* STATS */}
                <div className="dz-stats-grid">
                    <div className="dz-stat-card">
                        <div style={{ width:44, height:44, borderRadius:10, background:"rgba(16,185,129,.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <UserCheck size={20} style={{ color:"#059669" }} />
                        </div>
                        <div>
                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:textSecondary, margin:"0 0 4px" }}>
                                Contribuintes
                            </p>
                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:24, fontWeight:700, color:textPrimary, margin:0 }}>
                                {fieis.length}
                            </p>
                        </div>
                    </div>

                    <div className="dz-stat-card">
                        <div style={{ width:44, height:44, borderRadius:10, background:"rgba(200,16,46,.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <UserX size={20} style={{ color:"#C8102E" }} />
                        </div>
                        <div>
                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:textSecondary, margin:"0 0 4px" }}>
                                Pendentes
                            </p>
                            <p style={{ fontFamily:"'Cinzel',serif", fontSize:24, fontWeight:700, color:textPrimary, margin:0 }}>
                                {infieis.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* COLUNAS */}
                <div className="dz-cols-grid">
                    <Coluna
                        isDark={isDark}
                        titulo="Contribuintes"
                        lista={filtrar(fieis)}
                        tipo="fiel"
                        icon={<UserCheck size={15} style={{ color:"#059669" }} />}
                        iconBg="rgba(16,185,129,.12)"
                        countColor="#059669"
                        countBg={isDark ? "rgba(16,185,129,.12)" : "rgba(16,185,129,.1)"}
                    />
                    <Coluna
                        isDark={isDark}
                        titulo="Pendentes"
                        lista={filtrar(infieis)}
                        tipo="pendente"
                        icon={<UserX size={15} style={{ color:"#C8102E" }} />}
                        iconBg="rgba(200,16,46,.1)"
                        countColor="#C8102E"
                        countBg={isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.08)"}
                    />
                </div>
            </div>
        </>
    );
}

function Coluna({ isDark, titulo, lista, tipo, icon, iconBg, countColor, countBg }) {
    const textPrimary   = isDark ? "#F5F0E8" : "#1A0A0D";
    const textSecondary = isDark ? "rgba(245,240,232,.4)" : "rgba(26,10,13,.4)";
    const isFiel = tipo === "fiel";

    return (
        <section>
            <div className="dz-col-header">
                <div style={{ width:32, height:32, borderRadius:8, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {icon}
                </div>
                <span className="dz-col-title">{titulo}</span>
                <span style={{
                    marginLeft:"auto", padding:"3px 12px", borderRadius:99,
                    fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700,
                    color:countColor, background:countBg
                }}>
          {lista.length}
        </span>
            </div>

            <div className="dz-list">
                {lista.length === 0 ? (
                    <div className="dz-empty">
                        <Users size={22} style={{ color: isDark ? "rgba(245,240,232,.15)" : "rgba(26,10,13,.15)", marginBottom:10 }} />
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", textTransform:"uppercase", color:textSecondary }}>
                            Nenhum registro encontrado
                        </p>
                    </div>
                ) : lista.map(m => (
                    <div key={m.id} className="dz-row">
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{
                                width:36, height:36, borderRadius:9, flexShrink:0,
                                background: isFiel
                                    ? (isDark ? "rgba(16,185,129,.15)" : "rgba(16,185,129,.1)")
                                    : (isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.08)"),
                                display:"flex", alignItems:"center", justifyContent:"center",
                                fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:14,
                                color: isFiel ? "#059669" : "#C8102E"
                            }}>
                                {m.nome.charAt(0)}
                            </div>
                            <div>
                                <p style={{ fontFamily:"'EB Garamond',serif", fontSize:15, fontWeight:600, color:textPrimary, margin:"0 0 2px" }}>
                                    {m.nome}
                                </p>
                                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".1em", color: isFiel ? "#059669" : "#C8102E", margin:0, display:"flex", alignItems:"center", gap:4 }}>
                                    {isFiel
                                        ? <><CheckCircle2 size={10}/> DÍZIMO EM DIA</>
                                        : <><AlertCircle  size={10}/> AGUARDANDO CONTRIBUIÇÃO</>
                                    }
                                </p>
                            </div>
                        </div>
                        <Fingerprint size={15} style={{ color: isDark ? "rgba(245,240,232,.12)" : "rgba(26,10,13,.12)", flexShrink:0 }} />
                    </div>
                ))}
            </div>
        </section>
    );
}
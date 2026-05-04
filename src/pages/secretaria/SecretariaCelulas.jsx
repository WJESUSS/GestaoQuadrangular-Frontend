import { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2, UserPlus, Star, Users, Search,
  ChevronDown, Loader2, MapPin
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
          <linearGradient id="gVS" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={IEQ.redLight} />
            <stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHS" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={IEQ.blueDark} />
            <stop offset="50%"  stopColor={IEQ.blueLight} />
            <stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowS">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gVS)" filter="url(#glowS)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gHS)" filter="url(#glowS)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowS)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

export default function SecretariaCelulas() {
  const [celulas,           setCelulas]           = useState([]);
  const [celulaSelecionada, setCelulaSelecionada] = useState(null);
  const [membros,           setMembros]           = useState([]);
  const [membrosSemCelula,  setMembrosSemCelula]  = useState([]);
  const [novoMembroId,      setNovoMembroId]      = useState("");
  const [loading,           setLoading]           = useState(false);
  const [loadingAcao,       setLoadingAcao]       = useState(false);
  const [isDark,            setIsDark]            = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => { localStorage.setItem("theme", isDark ? "dark" : "light"); }, [isDark]);

  const getToken = () => localStorage.getItem("token");

  const carregarCelulas = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await api.get("/celulas", { headers: { Authorization: `Bearer ${token}` } });
      setCelulas(res.data);
    } catch (err) { console.error(err); }
  }, []);

  const carregarMembrosSemCelula = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await api.get("/membros/sem-celula", { headers: { Authorization: `Bearer ${token}` } });
      setMembrosSemCelula(res.data);
    } catch (err) { console.error(err); }
  }, []);

  const carregarMembrosDaCelula = useCallback(async (celulaId) => {
    if (!celulaId) return;
    const token = getToken();
    setLoading(true);
    try {
      const res = await api.get(`/celulas/${celulaId}/membros`, { headers: { Authorization: `Bearer ${token}` } });
      setMembros(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    carregarCelulas();
    carregarMembrosSemCelula();
  }, [carregarCelulas, carregarMembrosSemCelula]);

  useEffect(() => {
    if (celulaSelecionada?.id) carregarMembrosDaCelula(celulaSelecionada.id);
    else setMembros([]);
  }, [celulaSelecionada, carregarMembrosDaCelula]);

  const handleAdicionarMembro = async () => {
    if (!novoMembroId || !celulaSelecionada) return;
    setLoadingAcao(true);
    const token = getToken();
    try {
      await api.post(`/celulas/adicionar/${celulaSelecionada.id}/membros/${novoMembroId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNovoMembroId("");
      await Promise.all([carregarMembrosDaCelula(celulaSelecionada.id), carregarMembrosSemCelula()]);
    } catch (err) { alert(err.response?.data?.message || "Erro ao vincular membro."); }
    finally { setLoadingAcao(false); }
  };

  const handleRemoverMembro = async (membroId) => {
    if (!window.confirm("Remover este integrante da célula?")) return;
    setLoadingAcao(true);
    const token = getToken();
    try {
      await api.delete(`/celulas/${celulaSelecionada.id}/membros/${membroId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await Promise.all([carregarMembrosDaCelula(celulaSelecionada.id), carregarMembrosSemCelula()]);
    } catch (err) { alert("Erro ao remover membro."); }
    finally { setLoadingAcao(false); }
  };

  /* ── cores contextuais ── */
  const bg            = isDark ? IEQ.dark     : "#F0EAE8";
  const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing: border-box; }

    @keyframes stripe {
      0%   { background-position:0 0; }
      100% { background-position:60px 60px; }
    }
    @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:.45}50%{transform:scale(1.12);opacity:.12} }
    @keyframes spin  { to { transform:rotate(360deg); } }

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
      color:#fff; border:none; border-radius:8px;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.18em;
      cursor:pointer; transition:all .25s; padding:13px 24px;
      display:flex; align-items:center; justify-content:center; gap:8px;
    }
    .ieq-btn-primary:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.12);}
    .ieq-btn-primary:disabled{opacity:.45;cursor:not-allowed;}

    .ieq-btn-blue {
      background: linear-gradient(135deg, ${IEQ.blueDark}, ${IEQ.blue});
      color:#fff; border:none; border-radius:8px;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.18em;
      cursor:pointer; transition:all .25s; padding:13px 24px;
      display:flex; align-items:center; justify-content:center; gap:8px;
      width:100%;
    }
    .ieq-btn-blue:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.12);}
    .ieq-btn-blue:disabled{opacity:.45;cursor:not-allowed;}

    .ieq-select-field {
      width:100%;
      background:${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      color:${isDark ? IEQ.offWhite : "#1A0A0D"};
      padding:13px 40px 13px 44px; border-radius:8px; outline:none;
      font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.12em;
      transition:all .25s; appearance:none; cursor:pointer; width:100%;
    }
    .ieq-select-field:focus{border-color:${IEQ.red};box-shadow:0 0 0 3px rgba(200,16,46,.12);}
    .ieq-select-field option{background:${isDark ? "#110A0D" : "#fff"};color:${isDark ? IEQ.offWhite : "#1A0A0D"};}

    .ieq-member-row {
      display:flex; align-items:center; justify-content:space-between;
      padding:14px 20px;
      border-bottom:1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.07)"};
      transition:background .2s; gap:12px;
    }
    .ieq-member-row:hover{background:${isDark ? "rgba(200,16,46,.05)" : "rgba(200,16,46,.05)"};}
    .ieq-member-row:last-child{border-bottom:none;}

    .ieq-avatar {
      width:38px; height:38px; border-radius:8px; flex-shrink:0;
      background:linear-gradient(135deg,${IEQ.redDark},${IEQ.blue});
      display:flex; align-items:center; justify-content:center;
      color:#fff; font-family:'Cinzel',serif; font-weight:700; font-size:13px;
    }

    .pulse-ring {
      position:absolute; border-radius:50%;
      border:1px solid rgba(200,16,46,.35);
      animation:pulse-dot 3s ease-in-out infinite;
    }

    .divider {
      height:1px;
      background:linear-gradient(90deg,transparent,${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"},transparent);
      margin:8px 0;
    }

    .spin-icon{animation:spin 1s linear infinite;}

    /* grid lateral */
    .ieq-sec-grid {
      display:grid;
      grid-template-columns:1fr;
      gap:20px;
    }
    @media(min-width:860px){
      .ieq-sec-grid{grid-template-columns:320px 1fr;}
    }

    .ieq-th {
      font-family:'Cinzel',serif; font-size:9px; font-weight:700;
      letter-spacing:.2em; color:${textSecondary};
      padding:12px 20px; text-align:left;
      background:${isDark ? "rgba(255,255,255,.02)" : "rgba(200,16,46,.03)"};
      border-bottom:1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.06)"};
      text-transform:uppercase;
    }
  `;

  return (
      <div style={{ minHeight:"100vh", background:bg, color:textPrimary, fontFamily:"'EB Garamond',serif", position:"relative", transition:"background .5s", paddingBottom:80 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg" />

        <div style={{ position:"relative", zIndex:10, maxWidth:1200, margin:"0 auto", padding:"32px 24px 0" }}>

          {/* ── HEADER ── */}
          <motion.header
              initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:36, flexWrap:"wrap", gap:16 }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:18 }}>
              <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                <div className="pulse-ring" style={{ width:72, height:72 }} />
                <div style={{ width:52, height:52, borderRadius:"50%", background:isDark ? "#1A0A0D" : "#fff", border:"1px solid rgba(200,16,46,.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <QuadrangularCross size={32} />
                </div>
              </div>
              <div>
                <h1 className="ieq-title" style={{ fontSize:22, fontWeight:700, letterSpacing:".18em", margin:0 }}>IEQ PITUAÇU</h1>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".2em", color:textSecondary, margin:0 }}>
                  SECRETARIA · GESTÃO DE CÉLULAS
                </p>
              </div>
            </div>
          </motion.header>

          {/* ── SELEÇÃO DE CÉLULA ── */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}>
            <div className="ieq-card" style={{ padding:"24px 28px", marginBottom:24 }}>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".22em", color:IEQ.red, margin:"0 0 12px", fontWeight:700 }}>
                UNIDADE DE CUIDADO
              </p>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.7, pointerEvents:"none" }}>
                  <Search size={15} />
                </div>
                <select
                    className="ieq-select-field"
                    value={celulaSelecionada?.id || ""}
                    onChange={(e) => {
                      const id = parseInt(e.target.value);
                      setCelulaSelecionada(celulas.find(c => c.id === id) || null);
                    }}
                >
                  <option value="">SELECIONE UMA CÉLULA...</option>
                  {celulas.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome}{c.bairro ? ` · ${c.bairro}` : ""}
                      </option>
                  ))}
                </select>
                <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:textSecondary, pointerEvents:"none" }}>
                  <ChevronDown size={15} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── CONTEÚDO DA CÉLULA ── */}
          <AnimatePresence mode="wait">
            {celulaSelecionada && (
                <motion.div
                    key={celulaSelecionada.id}
                    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                    transition={{ duration:.35 }}
                    className="ieq-sec-grid"
                >
                  {/* ── COLUNA ESQUERDA ── */}
                  <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                    {/* Card hero da célula */}
                    <div style={{
                      borderRadius:14, overflow:"hidden", position:"relative",
                      background:`linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})`,
                      padding:"28px 24px", color:"#fff",
                    }}>
                      {/* Watermark */}
                      <div style={{ position:"absolute", right:-20, bottom:-20, opacity:.08 }}>
                        <Users size={130} />
                      </div>
                      <div style={{ position:"relative", zIndex:1 }}>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".22em", opacity:.7, display:"block", marginBottom:6 }}>
                      GRUPO SELECIONADO
                    </span>
                        <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:20, fontWeight:700, letterSpacing:".1em", margin:"0 0 16px", lineHeight:1.2 }}>
                          {celulaSelecionada.nome}
                        </h2>
                        {celulaSelecionada.nomeLider && (
                            <div style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"6px 14px", borderRadius:99, background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".14em" }}>
                              <Star size={11} style={{ fill:IEQ.yellow, color:IEQ.yellow }} />
                              {celulaSelecionada.nomeLider}
                            </div>
                        )}
                        {celulaSelecionada.bairro && (
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10, fontFamily:"'EB Garamond',serif", fontSize:13, opacity:.7 }}>
                              <MapPin size={13} /> {celulaSelecionada.bairro}
                            </div>
                        )}
                      </div>
                    </div>

                    {/* Card vincular membro */}
                    <div className="ieq-card" style={{ padding:"22px 20px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
                        <div style={{ width:34, height:34, borderRadius:8, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                          <UserPlus size={16} />
                        </div>
                        <div>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".15em", margin:0, color:textPrimary }}>NOVO INTEGRANTE</p>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:12, color:textSecondary, margin:0 }}>Vincular à célula</p>
                        </div>
                      </div>

                      <div className="divider" style={{ marginBottom:16 }} />

                      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                        <div style={{ position:"relative" }}>
                          <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.7, pointerEvents:"none" }}>
                            <Users size={15} />
                          </div>
                          <select
                              className="ieq-select-field"
                              value={novoMembroId}
                              onChange={e => setNovoMembroId(e.target.value)}
                          >
                            <option value="">BUSCAR MEMBRO...</option>
                            {membrosSemCelula.map(m => (
                                <option key={m.id} value={m.id}>{m.nome}</option>
                            ))}
                          </select>
                          <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:textSecondary, pointerEvents:"none" }}>
                            <ChevronDown size={14} />
                          </div>
                        </div>

                        <button
                            className="ieq-btn-blue"
                            onClick={handleAdicionarMembro}
                            disabled={!novoMembroId || loadingAcao}
                        >
                          {loadingAcao
                              ? <Loader2 size={15} className="spin-icon" />
                              : <><UserPlus size={14}/> VINCULAR AGORA</>
                          }
                        </button>
                      </div>
                    </div>

                    {/* Stat membros */}
                    <div className="ieq-card" style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ width:42, height:42, borderRadius:10, background:`${IEQ.blue}18`, display:"flex", alignItems:"center", justifyContent:"center", color:IEQ.blue, flexShrink:0 }}>
                        <Users size={20} />
                      </div>
                      <div>
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSecondary, margin:0 }}>CORPO DE MEMBROS</p>
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:30, fontWeight:700, color:textPrimary, margin:0, lineHeight:1.1 }}>
                          {loading ? "—" : membros.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── COLUNA DIREITA: tabela de membros ── */}
                  <div className="ieq-card" style={{ overflow:"hidden" }}>

                    {/* cabeçalho da tabela */}
                    <div style={{ padding:"20px 24px", borderBottom:`1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:36, height:36, borderRadius:8, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                          <Users size={16} />
                        </div>
                        <div>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".15em", margin:0, color:textPrimary }}>MEMBROS DA CÉLULA</p>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:0 }}>{membros.length} integrantes</p>
                        </div>
                      </div>
                    </div>

                    {/* tabela */}
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:400 }}>
                        <thead>
                        <tr>
                          <th className="ieq-th">NOME</th>
                          <th className="ieq-th">STATUS</th>
                          <th className="ieq-th" style={{ textAlign:"center", width:80 }}>AÇÃO</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                              <td colSpan={3} style={{ padding:48, textAlign:"center" }}>
                                <Loader2 size={28} style={{ animation:"spin 1s linear infinite", color:IEQ.red, margin:"0 auto" }} />
                              </td>
                            </tr>
                        ) : membros.length === 0 ? (
                            <tr>
                              <td colSpan={3} style={{ padding:40, textAlign:"center", fontFamily:"'EB Garamond',serif", fontStyle:"italic", color:textSecondary }}>
                                Nenhum membro nesta célula.
                              </td>
                            </tr>
                        ) : membros.map((m, i) => {
                          const isLider = Number(m.id) === Number(celulaSelecionada.liderId);
                          return (
                              <motion.tr
                                  key={m.id}
                                  initial={{ opacity:0, y:6 }}
                                  animate={{ opacity:1, y:0 }}
                                  transition={{ delay: i * 0.04 }}
                                  className="ieq-member-row"
                                  style={{ display:"table-row" }}
                              >
                                {/* nome */}
                                <td style={{ padding:"14px 20px" }}>
                                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                    <div className="ieq-avatar"
                                         style={{ background: isLider ? `linear-gradient(135deg,${IEQ.yellowDark},${IEQ.yellow})` : `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, color: isLider ? "#1A0A0D" : "#fff" }}>
                                      {m.nome?.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".1em", color:textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:180 }}>
                                  {m.nome}
                                </span>
                                  </div>
                                </td>

                                {/* status */}
                                <td style={{ padding:"14px 20px" }}>
                                  {isLider ? (
                                      <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:99, fontFamily:"'Cinzel',serif", fontSize:8.5, fontWeight:700, letterSpacing:".14em", color:IEQ.yellowDark, background:"rgba(253,184,19,.12)", border:`1px solid rgba(253,184,19,.3)` }}>
                                  <Star size={10} style={{ fill:IEQ.yellowDark }} /> LÍDER
                                </span>
                                  ) : (
                                      <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:99, fontFamily:"'Cinzel',serif", fontSize:8.5, fontWeight:700, letterSpacing:".14em", color:textSecondary, background:isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)", border:`1px solid ${isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"}` }}>
                                  MEMBRO
                                </span>
                                  )}
                                </td>

                                {/* ação */}
                                <td style={{ padding:"14px 20px", textAlign:"center" }}>
                                  <button
                                      onClick={() => handleRemoverMembro(m.id)}
                                      disabled={loadingAcao}
                                      style={{
                                        width:36, height:36, borderRadius:8, border:"none",
                                        background:isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)",
                                        color:IEQ.red, cursor:"pointer", display:"inline-flex",
                                        alignItems:"center", justifyContent:"center", transition:"all .2s",
                                        margin:"0 auto",
                                      }}
                                      onMouseEnter={e => { e.currentTarget.style.background=IEQ.red; e.currentTarget.style.color="#fff"; }}
                                      onMouseLeave={e => { e.currentTarget.style.background=isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"; e.currentTarget.style.color=IEQ.red; }}
                                  >
                                    {loadingAcao ? <Loader2 size={14} className="spin-icon" /> : <Trash2 size={15} />}
                                  </button>
                                </td>
                              </motion.tr>
                          );
                        })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {!celulaSelecionada && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.2 }}
                          style={{ textAlign:"center", padding:"60px 0" }}>
                <QuadrangularCross size={48} />
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:".2em", color:textSecondary, marginTop:16 }}>
                  SELECIONE UMA CÉLULA PARA COMEÇAR
                </p>
              </motion.div>
          )}

          <p style={{ textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSecondary, paddingTop:40 }}>
            © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
          </p>
        </div>
      </div>
  );
}
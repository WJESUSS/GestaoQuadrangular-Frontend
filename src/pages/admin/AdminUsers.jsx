import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Users, ShieldCheck, Power, Trash2, LogOut,
  Mail, Key, User, Shield, Loader2, RefreshCcw, Pencil, X,
  Sun, Moon
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

const perfis = ["ADMIN", "PASTOR", "LIDER_CELULA", "SECRETARIO", "TESOUREIRO"];

/* ─── Cruz Quadrangular SVG ─── */
function QuadrangularCross({ size = 32 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gVA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={IEQ.redLight} />
            <stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={IEQ.blueDark} />
            <stop offset="50%"  stopColor={IEQ.blueLight} />
            <stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowA">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gVA)" filter="url(#glowA)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gHA)" filter="url(#glowA)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowA)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

function handleLogout() {
  localStorage.clear();
  window.location.href = "/";
}

const containerVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminUsers() {
  const [usuarios,        setUsuarios]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [sending,         setSending]         = useState(false);
  const [erro,            setErro]            = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editandoId,      setEditandoId]      = useState(null);
  const [form,            setForm]            = useState({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });
  const [isDark,          setIsDark]          = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => { localStorage.setItem("theme", isDark ? "dark" : "light"); }, [isDark]);

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const res = await api.get("usuarios");
      setUsuarios(res.data);
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Não foi possível sincronizar os usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarUsuarios(); }, [carregarUsuarios]);

  const adicionarUsuario = async (e) => {
    e.preventDefault();
    setSending(true);
    setErro("");
    try {
      await api.post("usuarios", form);
      setForm({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Falha ao criar novo acesso.");
    } finally {
      setSending(false);
    }
  };

  const abrirEdicao = (u) => {
    setEditandoId(u.id);
    setForm({ nome: u.nome, email: u.email, senha: "", perfil: u.perfil });
    setIsEditModalOpen(true);
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.put(`usuarios/${editandoId}`, form);
      setIsEditModalOpen(false);
      setEditandoId(null);
      setForm({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Erro ao atualizar dados.");
    } finally {
      setSending(false);
    }
  };

  const deletarUsuario = async (id) => {
    if (!window.confirm("Esta ação removerá permanentemente o acesso. Confirmar?")) return;
    try {
      await api.delete(`usuarios/${id}`);
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Erro ao deletar.");
    }
  };

  const alternarStatus = async (id) => {
    try {
      await api.patch(`usuarios/${id}/status`);
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Erro ao alterar status.");
    }
  };

  /* ── cores contextuais ── */
  const bg            = isDark ? IEQ.dark       : "#F0EAE8";
  const textPrimary   = isDark ? IEQ.offWhite   : "#1A0A0D";
  const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing: border-box; }

    @keyframes stripe {
      0%   { background-position:0 0; }
      100% { background-position:60px 60px; }
    }
    @keyframes pulse { 0%,100% { transform:scale(1); opacity:.45; } 50% { transform:scale(1.12); opacity:.12; } }
    @keyframes spin  { to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

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
    .ieq-btn-primary:disabled { opacity:.5; cursor:not-allowed; }

    .ieq-btn-blue {
      background: linear-gradient(135deg, ${IEQ.blueDark}, ${IEQ.blue});
      color: #fff; border:none; border-radius:8px;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.18em;
      cursor:pointer; transition: all .25s; padding:13px 24px;
    }
    .ieq-btn-blue:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.12); }
    .ieq-btn-blue:disabled { opacity:.5; cursor:not-allowed; }

    .ieq-btn-ghost {
      background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};
      color: ${isDark ? IEQ.offWhite : IEQ.redDark};
      border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      border-radius:8px; font-family:'Cinzel',serif; font-size:10px; font-weight:700;
      letter-spacing:.15em; cursor:pointer; transition: all .25s; padding:11px 20px;
    }
    .ieq-btn-ghost:hover { border-color:${IEQ.red}; background:rgba(200,16,46,.1); }

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

    .ieq-select-field {
      width:100%;
      background:${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      color:${isDark ? IEQ.offWhite : "#1A0A0D"};
      padding:13px 16px 13px 44px; border-radius:8px; outline:none;
      font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.12em;
      transition: all .25s; appearance:none; cursor:pointer;
    }
    .ieq-select-field:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-select-field option { background:${isDark ? "#110A0D" : "#fff"}; color:${isDark ? IEQ.offWhite : "#1A0A0D"}; }

    .ieq-badge {
      display:inline-flex; align-items:center; gap:6px;
      padding:5px 14px; border-radius:99px;
      font-family:'Cinzel',serif; font-size:9px; font-weight:700; letter-spacing:.18em;
      border:1px solid;
    }

    .ieq-member-row {
      display:flex; align-items:center; justify-content:space-between;
      padding:14px 18px;
      background:${isDark ? "rgba(255,255,255,.02)" : "rgba(200,16,46,.03)"};
      border-bottom:1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.07)"};
      transition:all .2s; gap:12px;
    }
    .ieq-member-row:hover { background:${isDark ? "rgba(200,16,46,.06)" : "rgba(200,16,46,.06)"}; }
    .ieq-member-row:last-child { border-bottom:none; }

    .ieq-avatar {
      width:40px; height:40px; border-radius:8px; flex-shrink:0;
      background: linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.blue});
      display:flex; align-items:center; justify-content:center;
      color:#fff; font-family:'Cinzel',serif; font-weight:700; font-size:14px;
    }

    .ieq-avatar-inactive {
      background: ${isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"} !important;
    }

    .pulse-ring {
      position:absolute; border-radius:50%;
      border:1px solid rgba(200,16,46,.35);
      animation: pulse 3s ease-in-out infinite;
    }

    .divider {
      height:1px;
      background: linear-gradient(90deg, transparent, ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}, transparent);
      margin: 8px 0;
    }

    .spin-icon { animation: spin 1s linear infinite; }

    /* Modal */
    .ieq-modal-backdrop {
      position:fixed; inset:0; z-index:50;
      display:flex; align-items:flex-end; justify-content:center;
    }
    @media (min-width:520px) {
      .ieq-modal-backdrop { align-items:center; padding:12px; }
    }

    .ieq-modal-box {
      position:relative; z-index:10;
      width:100%; max-height:90vh;
      display:flex; flex-direction:column;
      border-radius:16px 16px 0 0;
      overflow:hidden;
    }
    @media (min-width:520px) {
      .ieq-modal-box { border-radius:14px; max-height:calc(100vh - 24px); }
    }

    /* grid 1col mobile, 2col desktop */
    .ieq-admin-grid {
      display:grid;
      grid-template-columns:1fr;
      gap:24px;
    }
    @media (min-width:900px) {
      .ieq-admin-grid { grid-template-columns:380px 1fr; }
    }

    /* Action icon btn */
    .ieq-icon-btn {
      background:none; border:none; cursor:pointer;
      width:32px; height:32px; border-radius:6px;
      display:flex; align-items:center; justify-content:center;
      transition:all .2s; flex-shrink:0;
    }

    /* perfil badge */
    .ieq-perfil-badge {
      display:inline-flex; align-items:center;
      padding:4px 10px; border-radius:99px;
      font-family:'Cinzel',serif; font-size:8.5px; font-weight:700; letter-spacing:.14em;
      border:1px solid;
    }

    /* stat kpi */
    .ieq-stat-box {
      background:${isDark ? "rgba(255,255,255,.03)" : "rgba(200,16,46,.04)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"};
      border-radius:10px; padding:18px 20px;
      display:flex; align-items:center; gap:14px;
    }
  `;

  const ativos    = usuarios.filter(u => u.ativo).length;
  const suspensos = usuarios.filter(u => !u.ativo).length;

  /* ── Loading Screen ── */
  if (loading && usuarios.length === 0) return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background: isDark ? IEQ.dark : "#F0EAE8" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');`}</style>
        <div style={{ textAlign:"center" }}>
          <QuadrangularCross size={48} />
          <p style={{ fontFamily:"'Cinzel',serif", color: isDark ? IEQ.offWhite : IEQ.redDark, marginTop:16, letterSpacing:".2em", fontSize:11 }}>CARREGANDO...</p>
        </div>
      </div>
  );

  return (
      <div style={{ minHeight:"100vh", background:bg, color:textPrimary, fontFamily:"'EB Garamond',serif", position:"relative", transition:"background .5s", paddingBottom:80 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg" />

        <div style={{ position:"relative", zIndex:10, maxWidth:1200, margin:"0 auto", padding:"32px 24px 0" }}>

          {/* ── HEADER ── */}
          <motion.header
              initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:40, flexWrap:"wrap", gap:16 }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:18 }}>
              <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                <div className="pulse-ring" style={{ width:72, height:72 }} />
                <div style={{ width:52, height:52, borderRadius:"50%", background: isDark ? "#1A0A0D" : "#fff", border:`1px solid rgba(200,16,46,.3)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <QuadrangularCross size={32} />
                </div>
              </div>
              <div>
                <h1 className="ieq-title" style={{ fontSize:22, fontWeight:700, letterSpacing:".18em", margin:0 }}>IEQ PITUAÇU</h1>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".2em", color:textSecondary, margin:0 }}>
                  ADMINISTRAÇÃO · CONTROLE DE ACESSOS
                </p>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button className="ieq-btn-ghost" onClick={() => setIsDark(!isDark)} style={{ padding:"10px 14px" }}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="ieq-btn-primary" onClick={handleLogout} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <LogOut size={14} /> SAIR
              </button>
            </div>
          </motion.header>

          {/* ── KPI strip ── */}
          <motion.div
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
              style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:28 }}
          >
            {[
              { icon:<Users size={20}/>,   label:"TOTAL",     value: usuarios.length, color: IEQ.blue   },
              { icon:<Power size={20}/>,   label:"ATIVOS",    value: ativos,          color: "#12A060"   },
              { icon:<Shield size={20}/>,  label:"SUSPENSOS", value: suspensos,       color: IEQ.redDark },
            ].map(({ icon, label, value, color }) => (
                <div key={label} className="ieq-stat-box">
                  <div style={{ width:42, height:42, borderRadius:10, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>
                    {icon}
                  </div>
                  <div>
                    <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSecondary, margin:0 }}>{label}</p>
                    <p style={{ fontFamily:"'Cinzel',serif", fontSize:28, fontWeight:700, color:textPrimary, margin:0, lineHeight:1.1 }}>{loading ? "—" : value}</p>
                  </div>
                </div>
            ))}
          </motion.div>

          {/* ── GRID PRINCIPAL ── */}
          <div className="ieq-admin-grid">

            {/* ── FORMULÁRIO ── */}
            <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:.15 }}>
              <div className="ieq-card" style={{ padding:"28px 24px", position:"sticky", top:24 }}>

                {/* título */}
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:22 }}>
                  <div style={{ width:40, height:40, borderRadius:8, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>NOVO ACESSO</h3>
                    <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:0 }}>Liberar usuário no sistema</p>
                  </div>
                </div>

                <div className="divider" style={{ marginBottom:20 }} />

                <form onSubmit={adicionarUsuario} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <InputIEQ icon={<User size={15} />}   type="text"     placeholder="Nome do usuário"      value={form.nome}   onChange={v => setForm({...form, nome: v})}   isDark={isDark} />
                  <InputIEQ icon={<Mail size={15} />}   type="email"    placeholder="E-mail institucional" value={form.email}  onChange={v => setForm({...form, email: v})}  isDark={isDark} />
                  <InputIEQ icon={<Key size={15} />}    type="password" placeholder="Senha de acesso"      value={form.senha}  onChange={v => setForm({...form, senha: v})}  isDark={isDark} />

                  <div style={{ position:"relative" }}>
                    <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.7, pointerEvents:"none" }}>
                      <Shield size={15} />
                    </div>
                    <select className="ieq-select-field" value={form.perfil} onChange={e => setForm({...form, perfil: e.target.value})}>
                      {perfis.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
                    </select>
                  </div>

                  <button type="submit" disabled={sending} className="ieq-btn-primary" style={{ marginTop:6, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    {sending ? <Loader2 size={15} className="spin-icon" /> : <><UserPlus size={14}/> LIBERAR ACESSO</>}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* ── LISTAGEM ── */}
            <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:.2 }}>
              <div className="ieq-card" style={{ overflow:"hidden" }}>

                {/* cabeçalho */}
                <div style={{ padding:"22px 24px", borderBottom:`1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:38, height:38, borderRadius:8, background:`linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                      <Users size={16} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>BASE DE USUÁRIOS</h3>
                      <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:0 }}>{usuarios.length} registros</p>
                    </div>
                  </div>
                  <button
                      className="ieq-btn-ghost"
                      style={{ padding:"9px 14px", display:"flex", alignItems:"center", gap:8 }}
                      onClick={carregarUsuarios}
                  >
                    <RefreshCcw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                    ATUALIZAR
                  </button>
                </div>

                {/* lista */}
                <div style={{ minHeight:120 }}>
                  {loading && usuarios.length === 0 ? (
                      <div style={{ padding:48, display:"flex", justifyContent:"center" }}>
                        <Loader2 size={30} style={{ animation:"spin 1s linear infinite", color:IEQ.red }} />
                      </div>
                  ) : (
                      <AnimatePresence>
                        {usuarios.map((u, i) => (
                            <motion.div
                                key={u.id}
                                initial={{ opacity:0, y:8 }}
                                animate={{ opacity:1, y:0 }}
                                exit={{ opacity:0, x:-20 }}
                                transition={{ delay: i * 0.04 }}
                                className="ieq-member-row"
                            >
                              {/* identidade */}
                              <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0, flex:1 }}>
                                <div className={`ieq-avatar${u.ativo ? "" : " ieq-avatar-inactive"}`}
                                     style={u.ativo ? {} : { background:`${isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"}` }}>
                                  {u.nome?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ minWidth:0 }}>
                                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, letterSpacing:".1em", color:textPrimary, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.nome}</p>
                                  <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</p>
                                </div>
                              </div>

                              {/* badges + ações */}
                              <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0, flexWrap:"wrap" }}>
                                {/* perfil */}
                                <span className="ieq-perfil-badge" style={{
                                  color: IEQ.blue,
                                  borderColor: `${IEQ.blue}30`,
                                  background: `${IEQ.blue}10`,
                                }}>
                            {u.perfil?.replace(/_/g," ")}
                          </span>

                                {/* status */}
                                <span className="ieq-perfil-badge" style={{
                                  color:        u.ativo ? "#12A060" : textSecondary,
                                  borderColor:  u.ativo ? "#12A06030" : `${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
                                  background:   u.ativo ? "#12A06010" : `${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)"}`,
                                  display:"flex", alignItems:"center", gap:5,
                                }}>
                            <span style={{ width:6, height:6, borderRadius:"50%", background: u.ativo ? "#12A060" : (isDark ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.2)"), display:"inline-block", animation: u.ativo ? "pulse 2s ease-in-out infinite" : "none" }} />
                                  {u.ativo ? "ATIVO" : "SUSPENSO"}
                          </span>

                                {/* editar */}
                                <button
                                    className="ieq-icon-btn"
                                    title="Editar"
                                    onClick={() => abrirEdicao(u)}
                                    style={{ color:textSecondary }}
                                    onMouseEnter={e => { e.currentTarget.style.color=IEQ.blue; e.currentTarget.style.background=`${IEQ.blue}12`; }}
                                    onMouseLeave={e => { e.currentTarget.style.color=textSecondary; e.currentTarget.style.background="none"; }}
                                >
                                  <Pencil size={15} />
                                </button>

                                {/* alternar status */}
                                <button
                                    className="ieq-icon-btn"
                                    title="Alternar status"
                                    onClick={() => alternarStatus(u.id)}
                                    style={{ color: u.ativo ? IEQ.yellowDark : "#12A060" }}
                                    onMouseEnter={e => { e.currentTarget.style.background= u.ativo ? "rgba(253,184,19,.12)" : "rgba(18,160,96,.12)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background="none"; }}
                                >
                                  <Power size={15} />
                                </button>

                                {/* deletar */}
                                <button
                                    className="ieq-icon-btn"
                                    title="Excluir"
                                    onClick={() => deletarUsuario(u.id)}
                                    style={{ color:textSecondary }}
                                    onMouseEnter={e => { e.currentTarget.style.color=IEQ.red; e.currentTarget.style.background="rgba(200,16,46,.1)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.color=textSecondary; e.currentTarget.style.background="none"; }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </motion.div>
                        ))}
                      </AnimatePresence>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* rodapé */}
          <p style={{ textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSecondary, padding:"32px 0 0" }}>
            © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
          </p>
        </div>

        {/* ── MODAL DE EDIÇÃO ── */}
        <AnimatePresence>
          {isEditModalOpen && (
              <div className="ieq-modal-backdrop">
                <motion.div
                    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    onClick={() => setIsEditModalOpen(false)}
                    style={{ position:"fixed", inset:0, background:"rgba(10,6,8,.85)", backdropFilter:"blur(16px)", zIndex:0 }}
                />
                <motion.div
                    initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }}
                    className="ieq-card ieq-modal-box"
                    style={{ maxWidth:440 }}
                >
                  <div style={{ padding:"28px 24px", overflowY:"auto", flex:1 }}>

                    {/* topo do modal */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <QuadrangularCross size={28} />
                        <div>
                          <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, letterSpacing:".15em", color:textPrimary, margin:0 }}>EDITAR USUÁRIO</h2>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:12, color:textSecondary, margin:0 }}>ID: {editandoId}</p>
                        </div>
                      </div>
                      <button
                          onClick={() => setIsEditModalOpen(false)}
                          style={{ background:"none", border:"none", cursor:"pointer", color:textSecondary, padding:6, borderRadius:6 }}
                          onMouseEnter={e => e.currentTarget.style.color=IEQ.red}
                          onMouseLeave={e => e.currentTarget.style.color=textSecondary}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="divider" style={{ marginBottom:18 }} />

                    <form onSubmit={salvarEdicao} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      <InputIEQ icon={<User size={15} />}   type="text"     placeholder="Nome"                          value={form.nome}   onChange={v => setForm({...form, nome: v})}   isDark={isDark} />
                      <InputIEQ icon={<Mail size={15} />}   type="email"    placeholder="E-mail"                        value={form.email}  onChange={v => setForm({...form, email: v})}  isDark={isDark} />
                      <InputIEQ icon={<Key size={15} />}    type="password" placeholder="Nova senha (vazio = manter)"   value={form.senha}  onChange={v => setForm({...form, senha: v})}  isDark={isDark} />

                      <div style={{ position:"relative" }}>
                        <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.7, pointerEvents:"none" }}>
                          <Shield size={15} />
                        </div>
                        <select className="ieq-select-field" value={form.perfil} onChange={e => setForm({...form, perfil: e.target.value})}>
                          {perfis.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
                        </select>
                      </div>

                      <div style={{ display:"flex", gap:10, marginTop:8 }}>
                        <button type="button" className="ieq-btn-ghost" style={{ flex:1 }} onClick={() => setIsEditModalOpen(false)}>CANCELAR</button>
                        <button type="submit"  className="ieq-btn-blue"  style={{ flex:2, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }} disabled={sending}>
                          {sending ? <Loader2 size={15} className="spin-icon" /> : "SALVAR ALTERAÇÕES"}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
          )}
        </AnimatePresence>

        {/* ── TOAST ERRO ── */}
        <AnimatePresence>
          {erro && (
              <motion.div
                  initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
                  style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background:IEQ.red, color:"#fff", padding:"14px 22px", borderRadius:10, fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".15em", display:"flex", alignItems:"center", gap:12, zIndex:200, maxWidth:"90vw", boxShadow:"0 8px 32px rgba(200,16,46,.35)" }}
              >
                <Power size={14} />
                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{erro}</span>
                <button onClick={() => setErro("")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.7)", padding:0, marginLeft:4, display:"flex" }}>
                  <X size={15} />
                </button>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}

/* ── Input reutilizável IEQ ── */
function InputIEQ({ icon, isDark, onChange, ...props }) {
  return (
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.7, pointerEvents:"none" }}>
          {icon}
        </div>
        <input
            {...props}
            onChange={e => onChange(e.target.value)}
            className="ieq-input-field"
            style={{ paddingLeft:44 }}
        />
      </div>
  );
}
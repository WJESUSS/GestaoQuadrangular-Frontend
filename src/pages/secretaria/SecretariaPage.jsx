import React, { useState, useEffect, useMemo } from "react";
import { Users, UserPlus, Home, FileText, Building2, Sun, Moon, LogOut, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";

import Membros           from "./Membros";
import Celulas           from "./Celulas";
import Visitantes        from "./Visitante";
import FichasEncontro    from "./FichasEncontro";
import SecretariaCelulas from "./SecretariaCelulas";

/* ─── Paleta IEQ ─────────────────────────────────────────────────────────── */
const IEQ = {
  red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
  yellow: "#FDB813", yellowDark: "#C48C00",
  blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
  offWhite: "#F5F0E8", dark: "#0A0608", darkCard: "#110A0D",
};

const modulos = [
  { id: "MEMBROS",           label: "Membros",    icon: <Users size={18}/>,     color: IEQ.blue      },
  { id: "VISITANTES",        label: "Visitantes", icon: <UserPlus size={18}/>,  color: IEQ.red       },
  { id: "CELULAS",           label: "Células",    icon: <Home size={18}/>,      color: "#059669"     },
  { id: "FICHAS",            label: "Fichas",     icon: <FileText size={18}/>,  color: IEQ.yellow    },
  { id: "SECRETARIACELULAS", label: "Secretaria", icon: <Building2 size={18}/>, color: IEQ.blueLight },
];

/* ─── CSS estático ───────────────────────────────────────────────────────── */
const STATIC_CSS = `
  * { box-sizing: border-box; }
  @keyframes stripe { 0%{background-position:0 0} 100%{background-position:60px 60px} }
  @keyframes pulse  { 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.12);opacity:.12} }
  @keyframes spin   { to{transform:rotate(360deg)} }

  .sec-root {
    --bg:       #F0EAE8;
    --text:     #1A0A0D;
    --text-sec: rgba(26,10,13,.45);
    --card-bg:  rgba(255,255,255,.92);
    --border:   rgba(200,16,46,.12);
    --stripe-a: rgba(200,16,46,.06);
    --stripe-b: rgba(253,184,19,.05);
    --nav-idle: rgba(26,10,13,.45);
    --nav-hover-bg: rgba(200,16,46,.06);
  }
  .sec-root.dark {
    --bg:       #0A0608;
    --text:     #F5F0E8;
    --text-sec: rgba(245,240,232,.45);
    --card-bg:  rgba(17,10,13,.97);
    --border:   rgba(200,16,46,.15);
    --stripe-a: rgba(200,16,46,.04);
    --stripe-b: rgba(253,184,19,.03);
    --nav-idle: rgba(245,240,232,.45);
    --nav-hover-bg: rgba(200,16,46,.08);
  }

  .ieq-bg {
    position:fixed; inset:0; pointer-events:none; z-index:0;
    background: repeating-linear-gradient(-55deg,
      var(--stripe-a) 0 10px, transparent 10px 20px,
      var(--stripe-b) 20px 30px, transparent 30px 40px);
    background-size:60px 60px; animation:stripe 8s linear infinite;
    transition: background .35s;
  }

  .ieq-title {
    font-family:'Cinzel',serif;
    background:linear-gradient(90deg,#8B0B1F,#C8102E,#FDB813,#003DA5);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  .pulse-ring { position:absolute; border-radius:50%; border:1px solid rgba(200,16,46,.35); animation:pulse 3s ease-in-out infinite; }
  .divider    { height:1px; background:linear-gradient(90deg,transparent,rgba(200,16,46,.2),transparent); margin:8px 0; }

  .ieq-sidebar {
    position:fixed; inset:0; z-index:40;
    transform:translateX(-100%); transition:transform .3s ease, background .35s;
    background:var(--card-bg); border-right:1px solid var(--border);
    backdrop-filter:blur(24px);
    display:flex; flex-direction:column;
    width:280px; padding:28px 20px;
  }
  .ieq-sidebar.open { transform:translateX(0); }
  @media(min-width:768px) {
    .ieq-sidebar { position:relative; transform:translateX(0) !important; width:260px; flex-shrink:0; }
  }

  .ieq-nav-btn {
    width:100%; display:flex; align-items:center; gap:12px;
    padding:13px 16px; border-radius:10px; border:none; cursor:pointer;
    font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.14em;
    transition:all .25s; text-align:left;
    background:transparent; color:var(--nav-idle);
  }
  .ieq-nav-btn:hover { background:var(--nav-hover-bg); color:var(--text); }
  .ieq-nav-btn.active { background:linear-gradient(135deg,#8B0B1F,#C8102E); color:#fff; box-shadow:0 6px 18px rgba(200,16,46,.35); }

  .ieq-btn-ghost {
    background:rgba(200,16,46,.06); color:var(--text);
    border:1px solid rgba(200,16,46,.18);
    border-radius:8px; font-family:'Cinzel',serif; font-size:10px; font-weight:700;
    letter-spacing:.15em; cursor:pointer; transition:all .25s; padding:10px 14px;
  }
  .sec-root.dark .ieq-btn-ghost { background:rgba(255,255,255,.04); border-color:rgba(200,16,46,.2); }
  .ieq-btn-ghost:hover { border-color:#C8102E; background:rgba(200,16,46,.1); }

  .ieq-badge {
    display:inline-flex; align-items:center; gap:4px;
    padding:3px 10px; border-radius:99px;
    font-family:'Cinzel',serif; font-size:9px; font-weight:700; letter-spacing:.16em; border:1px solid;
  }

  .ieq-overlay { position:fixed; inset:0; z-index:39; background:rgba(10,6,8,.7); backdrop-filter:blur(4px); }
  @media(min-width:768px) { .ieq-overlay { display:none !important; } }
  @media(min-width:768px) { .desk-subheader { display:block !important; } header.mobile-header { display:none !important; } }

  /* Avatar logo topo sidebar */
  .sec-logo-avatar {
    width:38px; height:38px; border-radius:50%; overflow:hidden;
    border:2px solid rgba(200,16,46,.4);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .sec-logo-avatar img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
  .sec-logo-avatar-fallback {
    width:100%; height:100%; display:flex; align-items:center; justify-content:center;
    background:rgba(200,16,46,.08);
    font-family:'Cinzel',serif; font-weight:700; font-size:14px; color:var(--text);
  }
`;

export default function SecretariaPage() {
  const [moduloAtivo,   setModuloAtivo]   = useState("MEMBROS");

  // Intercepta o botão voltar do celular (Android/PWA)
  useEffect(() => {
    if (moduloAtivo !== "MEMBROS") {
      window.history.pushState({ modulo: moduloAtivo }, "");
    }

    const handlePopState = () => {
      setModuloAtivo("MEMBROS");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [moduloAtivo]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [isDark,        setIsDark]        = useState(() => localStorage.getItem("theme") === "dark");
  const [menuOpen,      setMenuOpen]      = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    api.get("/usuarios/me")
        .then(res => setUsuarioLogado(res.data))
        .catch(() => {});
  }, []);

  const handleLogout = () => {
    if (window.confirm("Deseja realmente sair do sistema?")) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  const moduloInfo = useMemo(() => modulos.find(m => m.id === moduloAtivo), [moduloAtivo]);

  return (
      <div className={`sec-root${isDark ? " dark" : ""}`} style={{ minHeight:"100vh", display:"flex", background:"var(--bg)", color:"var(--text)", fontFamily:"'EB Garamond',serif", position:"relative", transition:"background .5s" }}>
        <style>{STATIC_CSS}</style>
        <div className="ieq-bg" />

        {/* Overlay mobile */}
        {menuOpen && <div className="ieq-overlay" onClick={() => setMenuOpen(false)} />}

        {/* ─── SIDEBAR ─────────────────────────────────────────────────────────── */}
        <aside className={`ieq-sidebar${menuOpen ? " open" : ""}`}>

          {/* ─── Logo com foto no lugar da cruz ──────────────────────────────── */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:36 }}>
            <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
              <div className="pulse-ring" style={{ width:52, height:52 }} />
              <div className="sec-logo-avatar">
                {usuarioLogado?.fotoPerfil ? (
                    <img src={usuarioLogado.fotoPerfil} alt={usuarioLogado.nome || "Secretaria"} />
                ) : (
                    <div className="sec-logo-avatar-fallback">
                      {usuarioLogado?.nome?.charAt(0).toUpperCase() || "S"}
                    </div>
                )}
              </div>
            </div>
            <div>
              <h1 className="ieq-title" style={{ fontSize:14, fontWeight:700, letterSpacing:".18em", margin:0 }}>IEQ PITUAÇU</h1>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".2em", color:"var(--text-sec)", margin:0 }}>SECRETARIA</p>
              {usuarioLogado?.nome && (
                  <p style={{ fontFamily:"'EB Garamond',serif", fontSize:12, color:"var(--text-sec)", margin:"3px 0 0", fontStyle:"italic" }}>
                    {usuarioLogado.nome}
                  </p>
              )}
            </div>
          </div>

          <div className="divider" style={{ marginBottom:16 }} />

          {/* Nav */}
          <nav style={{ display:"flex", flexDirection:"column", gap:4, flex:1 }}>
            <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".22em", color:"var(--text-sec)", margin:"0 0 10px 6px" }}>MÓDULOS</p>
            {modulos.map(m => (
                <button
                    key={m.id}
                    className={`ieq-nav-btn${moduloAtivo === m.id ? " active" : ""}`}
                    onClick={() => { setModuloAtivo(m.id); setMenuOpen(false); }}
                >
                  <span style={{ color: moduloAtivo === m.id ? "#fff" : m.color }}>{m.icon}</span>
                  {m.label}
                </button>
            ))}
          </nav>

          <div className="divider" style={{ margin:"16px 0" }} />

          {/* Rodapé: só texto + logout, sem avatar */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:isDark?"rgba(200,16,46,.06)":"rgba(200,16,46,.05)", border:"1px solid rgba(200,16,46,.1)" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".1em", color:"var(--text)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {usuarioLogado?.nome || "SECRETARIA"}
                </p>
                <p style={{ fontFamily:"'EB Garamond',serif", fontSize:12, color:"var(--text-sec)", margin:0 }}>
                  {usuarioLogado?.perfil?.replace("ROLE_", "") || "Secretário(a)"}
                </p>
              </div>
            </div>

            <button
                onClick={handleLogout}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:10, border:"none", cursor:"pointer", background:"rgba(200,16,46,.08)", color:IEQ.red, fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".14em", width:"100%", transition:"all .2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(200,16,46,.18)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(200,16,46,.08)"}
            >
              <LogOut size={16} /> SAIR DO SISTEMA
            </button>
          </div>

          <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".14em", color:"var(--text-sec)", textAlign:"center", marginTop:12 }}>
            © IEQ PITUAÇU · {new Date().getFullYear()}
          </p>
        </aside>

        {/* ─── MAIN ────────────────────────────────────────────────────────────── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1, minWidth:0 }}>

          {/* Mobile header */}
          <header className="mobile-header" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid var(--border)", background:"var(--card-bg)", backdropFilter:"blur(24px)", position:"sticky", top:0, zIndex:30 }}>
            <button className="ieq-btn-ghost" style={{ padding:"9px 12px" }} onClick={() => setMenuOpen(true)}>
              <Menu size={18} />
            </button>
            <span className="ieq-badge" style={{ color:moduloInfo?.color||IEQ.red, borderColor:`${moduloInfo?.color||IEQ.red}44`, background:`${moduloInfo?.color||IEQ.red}11` }}>
              {moduloInfo?.icon} {moduloInfo?.label?.toUpperCase()}
            </span>
            <button className="ieq-btn-ghost" style={{ padding:"9px 12px" }} onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={16}/> : <Moon size={16}/>}
            </button>
          </header>

          {/* Desktop subheader */}
          <div style={{ padding:"28px 32px 0", display:"none" }} className="desk-subheader">
            <motion.div
                initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}
            >
              <div>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".22em", color:"var(--text-sec)", margin:"0 0 4px" }}>MÓDULO ATIVO</p>
                <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:26, fontWeight:700, letterSpacing:".14em", color:"var(--text)", margin:0 }}>
                  {moduloInfo?.label?.toUpperCase()}
                </h2>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {usuarioLogado && (
                    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 12px", borderRadius:99, background:isDark?"rgba(255,255,255,.04)":"rgba(200,16,46,.05)", border:"1px solid rgba(200,16,46,.12)" }}>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".12em", color:"var(--text)" }}>
                        {usuarioLogado.nome?.split(" ")[0].toUpperCase()}
                      </span>
                    </div>
                )}
                <span style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:99, background:"rgba(5,150,105,.12)", color:"#059669", border:"1px solid rgba(5,150,105,.2)", fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".14em" }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#059669", display:"inline-block" }} />
                  ONLINE
                </span>
                <button className="ieq-btn-ghost" onClick={() => setIsDark(!isDark)}>
                  {isDark ? <Sun size={16}/> : <Moon size={16}/>}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <main style={{ flex:1, padding:"24px 20px", overflowY:"auto" }}>
            <AnimatePresence mode="wait">
              <motion.div
                  key={moduloAtivo}
                  initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}
                  transition={{ duration:.2 }}
                  style={{ background:"var(--card-bg)", border:"1px solid var(--border)", borderRadius:16, backdropFilter:"blur(24px)", minHeight:500, overflow:"hidden" }}
              >
                {moduloAtivo === "MEMBROS"           && <Membros isDark={isDark} />}
                {moduloAtivo === "VISITANTES"         && <Visitantes isDark={isDark} />}
                {moduloAtivo === "CELULAS"            && <Celulas isDark={isDark} />}
                {moduloAtivo === "FICHAS"             && <FichasEncontro isDark={isDark} />}
                {moduloAtivo === "SECRETARIACELULAS"  && <SecretariaCelulas isDark={isDark} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
  );
}
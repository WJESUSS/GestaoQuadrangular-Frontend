import { useState, useEffect } from "react";
import { Users, UserPlus, Home, FileText, Building2, Sun, Moon, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Membros          from "./Membros";
import Celulas          from "./Celulas";
import Visitantes       from "./Visitante";
import FichasEncontro   from "./FichasEncontro";
import SecretariaCelulas from "./SecretariaCelulas";

/* ─── Cores Oficiais IEQ ─── */
const IEQ = {
  red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
  yellow: "#FDB813", yellowDark: "#C48C00",
  blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
  offWhite: "#F5F0E8", dark: "#0A0608", darkCard: "#110A0D",
};

function QuadrangularCross({ size = 28 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gVS" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={IEQ.redLight} /><stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHS" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={IEQ.blueDark} /><stop offset="50%" stopColor={IEQ.blueLight} /><stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowS"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gVS)" filter="url(#glowS)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gHS)" filter="url(#glowS)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowS)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

const modulos = [
  { id: "MEMBROS",           label: "Membros",    icon: <Users size={18}/>,     color: IEQ.blue    },
  { id: "VISITANTES",        label: "Visitantes", icon: <UserPlus size={18}/>,  color: IEQ.red     },
  { id: "CELULAS",           label: "Células",    icon: <Home size={18}/>,      color: "#059669"   },
  { id: "FICHAS",            label: "Fichas",     icon: <FileText size={18}/>,  color: IEQ.yellow  },
  { id: "SECRETARIACELULAS", label: "Secretaria", icon: <Building2 size={18}/>, color: IEQ.blueLight },
];

export default function SecretariaPage() {
  const [moduloAtivo, setModuloAtivo] = useState("MEMBROS");
  const [isDark,      setIsDark]      = useState(() => localStorage.getItem("theme") === "dark");
  const [menuOpen,    setMenuOpen]    = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const handleLogout = () => {
    if (window.confirm("Deseja realmente sair do sistema?")) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  const bg          = isDark ? IEQ.dark    : "#F0EAE8";
  const cardBg      = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const border      = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing: border-box; }
    @keyframes stripe { 0%{background-position:0 0} 100%{background-position:60px 60px} }
    @keyframes pulse  { 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.12);opacity:.12} }
    @keyframes spin   { to{transform:rotate(360deg)} }

    .ieq-bg {
      position:fixed; inset:0; pointer-events:none; z-index:0;
      background: repeating-linear-gradient(-55deg,
        ${isDark?"rgba(200,16,46,.04)":"rgba(200,16,46,.06)"} 0 10px, transparent 10px 20px,
        ${isDark?"rgba(253,184,19,.03)":"rgba(253,184,19,.05)"} 20px 30px, transparent 30px 40px);
      background-size:60px 60px; animation:stripe 8s linear infinite;
    }
    .ieq-title {
      font-family:'Cinzel',serif;
      background:linear-gradient(90deg,${IEQ.redDark},${IEQ.red},${IEQ.yellow},${IEQ.blue});
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }
    .pulse-ring { position:absolute; border-radius:50%; border:1px solid rgba(200,16,46,.35); animation:pulse 3s ease-in-out infinite; }
    .spin-icon  { animation:spin 1s linear infinite; }
    .divider    { height:1px; background:linear-gradient(90deg,transparent,${isDark?"rgba(200,16,46,.25)":"rgba(200,16,46,.2)"},transparent); margin:8px 0; }

    /* ── Sidebar ── */
    .ieq-sidebar {
      position:fixed; inset:0; z-index:40;
      transform:translateX(-100%); transition:transform .3s ease;
      background:${cardBg}; border-right:1px solid ${border};
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
      background:transparent; color:${textSec};
    }
    .ieq-nav-btn:hover { background:${isDark?"rgba(200,16,46,.08)":"rgba(200,16,46,.06)"}; color:${textPrimary}; }
    .ieq-nav-btn.active { background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red}); color:#fff; box-shadow:0 6px 18px rgba(200,16,46,.35); }

    .ieq-btn-ghost {
      background:${isDark?"rgba(255,255,255,.04)":"rgba(200,16,46,.06)"};
      color:${isDark?IEQ.offWhite:IEQ.redDark};
      border:1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)"};
      border-radius:8px; font-family:'Cinzel',serif; font-size:10px; font-weight:700;
      letter-spacing:.15em; cursor:pointer; transition:all .25s; padding:10px 14px;
    }
    .ieq-btn-ghost:hover { border-color:${IEQ.red}; background:rgba(200,16,46,.1); }

    .ieq-badge {
      display:inline-flex; align-items:center; gap:4px;
      padding:3px 10px; border-radius:99px;
      font-family:'Cinzel',serif; font-size:9px; font-weight:700; letter-spacing:.16em; border:1px solid;
    }

    .ieq-overlay { position:fixed; inset:0; z-index:39; background:rgba(10,6,8,.7); backdrop-filter:blur(4px); }
    @media(min-width:768px) { .ieq-overlay { display:none; } }
  `;

  const moduloInfo = modulos.find(m => m.id === moduloAtivo);

  return (
      <div style={{ minHeight:"100vh", display:"flex", background:bg, color:textPrimary, fontFamily:"'EB Garamond',serif", position:"relative", transition:"background .5s" }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg" />

        {/* ── Overlay mobile ── */}
        {menuOpen && <div className="ieq-overlay" onClick={() => setMenuOpen(false)} />}

        {/* ── SIDEBAR ── */}
        <aside className={`ieq-sidebar${menuOpen ? " open" : ""}`}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:36 }}>
            <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
              <div className="pulse-ring" style={{ width:52, height:52 }} />
              <div style={{ width:38, height:38, borderRadius:"50%", background:isDark?"#1A0A0D":"#fff", border:"1px solid rgba(200,16,46,.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <QuadrangularCross size={22} />
              </div>
            </div>
            <div>
              <h1 className="ieq-title" style={{ fontSize:14, fontWeight:700, letterSpacing:".18em", margin:0 }}>IEQ PITUAÇU</h1>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".2em", color:textSec, margin:0 }}>SECRETARIA</p>
            </div>
          </div>

          <div className="divider" style={{ marginBottom:16 }} />

          {/* Nav */}
          <nav style={{ display:"flex", flexDirection:"column", gap:4, flex:1 }}>
            <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".22em", color:textSec, margin:"0 0 10px 6px" }}>MÓDULOS</p>
            {modulos.map(m => (
                <button key={m.id} className={`ieq-nav-btn${moduloAtivo===m.id?" active":""}`}
                        onClick={() => { setModuloAtivo(m.id); setMenuOpen(false); }}>
                  <span style={{ color: moduloAtivo===m.id ? "#fff" : m.color }}>{m.icon}</span>
                  {m.label}
                </button>
            ))}
          </nav>

          <div className="divider" style={{ margin:"16px 0" }} />

          <button onClick={handleLogout} style={{
            display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:10,
            border:"none", cursor:"pointer", background:"rgba(200,16,46,.08)", color:IEQ.red,
            fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".14em", width:"100%",
            transition:"all .2s",
          }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(200,16,46,.18)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(200,16,46,.08)"}
          >
            <LogOut size={16} /> SAIR DO SISTEMA
          </button>

          <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".14em", color:textSec, textAlign:"center", marginTop:16 }}>
            © IEQ PITUAÇU · {new Date().getFullYear()}
          </p>
        </aside>

        {/* ── MAIN ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1, minWidth:0 }}>

          {/* Mobile header */}
          <header style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"14px 20px", borderBottom:`1px solid ${border}`,
            background:cardBg, backdropFilter:"blur(24px)",
            position:"sticky", top:0, zIndex:30,
          }}>
            <button className="ieq-btn-ghost" style={{ padding:"9px 12px" }} onClick={() => setMenuOpen(true)}>
              <Menu size={18} />
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span className="ieq-badge" style={{ color:moduloInfo?.color||IEQ.red, borderColor:`${moduloInfo?.color||IEQ.red}44`, background:`${moduloInfo?.color||IEQ.red}11` }}>
              {moduloInfo?.icon} {moduloInfo?.label?.toUpperCase()}
            </span>
            </div>
            <button className="ieq-btn-ghost" style={{ padding:"9px 12px" }} onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={16}/> : <Moon size={16}/>}
            </button>
          </header>

          {/* Desktop subheader */}
          <div style={{ padding:"28px 32px 0", display:"none" }} className="desk-subheader">
            <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
                        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
              <div>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".22em", color:textSec, margin:"0 0 4px" }}>MÓDULO ATIVO</p>
                <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:26, fontWeight:700, letterSpacing:".14em", color:textPrimary, margin:0 }}>
                  {moduloInfo?.label?.toUpperCase()}
                </h2>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:99,
                background:"rgba(5,150,105,.12)", color:"#059669", border:"1px solid rgba(5,150,105,.2)",
                fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".14em" }}>
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
            <style>{`@media(min-width:768px){.desk-subheader{display:block!important} header{display:none!important}}`}</style>
            <AnimatePresence mode="wait">
              <motion.div key={moduloAtivo}
                          initial={{opacity:0, y:16}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-16}}
                          transition={{duration:.3}}
                          style={{
                            background:cardBg, border:`1px solid ${border}`,
                            borderRadius:16, backdropFilter:"blur(24px)",
                            minHeight:500, overflow:"hidden",
                          }}>
                {moduloAtivo === "MEMBROS"           && <Membros />}
                {moduloAtivo === "VISITANTES"         && <Visitantes />}
                {moduloAtivo === "CELULAS"            && <Celulas />}
                {moduloAtivo === "FICHAS"             && <FichasEncontro />}
                {moduloAtivo === "SECRETARIACELULAS"  && <SecretariaCelulas />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
  );
}
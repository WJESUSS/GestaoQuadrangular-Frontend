import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Loader2, Lock, Mail, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/* Cores Oficiais Igreja do Evangelho Quadrangular */
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

/* Cruz Quadrangular SVG */
function QuadrangularCross({ size = 42 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={IEQ.redLight} />
            <stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gH" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={IEQ.blueDark} />
            <stop offset="50%"  stopColor={IEQ.blueLight} />
            <stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gV)" filter="url(#glow)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gH)" filter="url(#glow)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glow)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

/* Ícone olho */
function EyeIcon({ open }) {
  return open ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
  ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
  );
}

export default function Login() {
  const { login }              = useAuth();
  const navigate                = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [mounted,    setMounted]    = useState(false);
  const [focusField, setFocusField] = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await login(email, password);
      if (!token) throw new Error("Token não recebido");

      const decoded = jwtDecode(token);
      localStorage.setItem("user", JSON.stringify({
        id:       decoded.id,
        username: decoded.sub,
        perfil:   decoded.perfil,
      }));

      const perfil = decoded.perfil?.replace("ROLE_", "").toUpperCase();
      switch (perfil) {
        case "ADMIN":        navigate("/admin");      break;
        case "PASTOR":       navigate("/pastor");     break;
        case "LIDER_CELULA": navigate("/lider");      break;
        case "TESOUREIRO":   navigate("/tesouraria"); break;
        case "SECRETARIO":   navigate("/secretaria"); break;
        default: setError("Perfil não reconhecido: " + perfil);
      }
    } catch {
      setError("Credenciais inválidas ou erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark ? IEQ.dark : "#F0EAE8",
        fontFamily: "'Georgia', serif",
        position: "relative",
        overflow: "hidden",
        transition: "background 0.5s",
      }}>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        * { box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes stripe {
          0%   { background-position:0 0; }
          100% { background-position:60px 60px; }
        }
        .ieq-card { animation: fadeUp .85s cubic-bezier(.16,1,.3,1) both; }

        .ieq-stripes {
          position:absolute; inset:0; pointer-events:none;
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

        .ieq-input {
          width:100%;
          background:${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};
          border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.2)"};
          color:${isDark ? IEQ.offWhite : "#1A0A0D"};
          padding:14px 14px 14px 46px;
          border-radius:6px;
          outline:none;
          transition: all .25s;
        }
        .ieq-input:focus {
          border-color:${IEQ.red};
          box-shadow:0 0 0 3px rgba(200,16,46,.15);
        }

        .ieq-btn {
          width:100%; padding:15px; border:none; border-radius:6px;
          font-family:'Cinzel',serif; font-size:12px; font-weight:700;
          letter-spacing:.22em; cursor:pointer;
          background:linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.red});
          color:#fff;
          transition: all .25s;
        }
        .ieq-btn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.1); }
        
        .pulse-ring {
          position:absolute; border-radius:50%;
          border:1px solid rgba(200,16,46,.35);
          animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100% { transform:scale(1); opacity:.5; } 50% { transform:scale(1.1); opacity:.15; } }
        `}</style>

        <div className="ieq-stripes" />

        <button className="theme-btn"
                style={{position:"absolute", top:22, right:22, background:"none", border:"none", cursor:"pointer", color: isDark ? IEQ.yellow : IEQ.red}}
                onClick={toggleTheme}>
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <div className="ieq-card" style={{
          position:"relative", zIndex:10, width:"100%", maxWidth:480, margin:24,
          background: isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)",
          borderRadius:10, padding:"52px 48px 44px", backdropFilter:"blur(24px)",
          opacity: mounted ? 1 : 0, transition: "opacity 0.5s"
        }}>

          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:22 }}>
              <div className="pulse-ring" style={{ width:96, height:96 }} />
              <div style={{
                width:64, height:64, borderRadius:"50%", background: isDark ? "#1A0A0D" : "#fff",
                border:"1px solid rgba(200,16,46,.3)", display:"flex", alignItems:"center", justifyContent:"center"
              }}>
                <QuadrangularCross size={42} />
              </div>
            </div>

            <h1 className="ieq-title" style={{ fontSize:30, fontWeight:700, letterSpacing:".2em", margin:0 }}>
              IEQ PITUAÇU
            </h1>

            <p style={{ color: isDark ? "rgba(245,240,232,.35)" : "rgba(26,10,13,.4)", fontSize:10.5, letterSpacing:".18em", fontFamily:"'Cinzel',serif", marginTop:10 }}>
              PORTAL ADMINISTRATIVO PITUAÇU
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div>
              <label style={{display:"block", marginBottom:7, fontFamily:"'Cinzel',serif", fontSize:10, color:IEQ.red}}>E-MAIL</label>
              <div style={{ position:"relative" }}>
                <Mail size={17} style={{position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:0.6}} />
                <input className="ieq-input" type="email" placeholder="usuario@ieq.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div>
              <label style={{display:"block", marginBottom:7, fontFamily:"'Cinzel',serif", fontSize:10, color:IEQ.red}}>SENHA</label>
              <div style={{ position:"relative" }}>
                <Lock size={17} style={{position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:0.6}} />
                <input className="ieq-input" type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:IEQ.red}}>
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            <button type="submit" className="ieq-btn" disabled={loading} style={{marginTop:10}}>
              {loading ? <Loader2 size={17} className="spin" /> : "ACESSAR SISTEMA"}
            </button>
          </form>

          <div style={{ marginTop:32, textAlign:"center" }}>
            <p style={{ color: isDark ? "rgba(245,240,232,.2)" : "rgba(26,10,13,.25)", fontSize:10, letterSpacing:".15em", fontFamily:"'Cinzel',serif" }}>
              © IEQ PITUAÇU • SISTEMA SEGURO • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
  );
}
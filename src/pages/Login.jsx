import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Loader2, Lock, Mail, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/* ─── Cores Oficiais Igreja do Evangelho Quadrangular ─── */
const IEQ = {
  red:       "#C8102E",
  redDark:   "#8B0B1F",
  redLight:  "#E8294A",
  yellow:    "#FDB813",
  yellowDark:"#C48C00",
  blue:      "#003DA5",
  blueDark:  "#002470",
  blueLight: "#1A56C4",
  white:     "#FFFFFF",
  offWhite:  "#F5F0E8",
  dark:      "#0A0608",
  darkCard:  "#110A0D",
};

/* ─── Cruz Quadrangular SVG ─── */
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

/* ─── Ícone olho ─── */
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
  const navigate               = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [mounted,    setMounted]    = useState(false);
  const [focusField, setFocusField] = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  /* ── lógica original mantida ── */
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
        @keyframes floatA {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-18px); }
        }
        @keyframes floatB {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(14px); }
        }
        @keyframes pulse {
          0%,100% { transform:scale(1); opacity:.5; }
          50%     { transform:scale(1.1); opacity:.15; }
        }
        @keyframes shimmer {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin {
          to { transform:rotate(360deg); }
        }
        @keyframes stripe {
          0%   { background-position:0 0; }
          100% { background-position:60px 60px; }
        }

        .ieq-card {
          animation: fadeUp .85s cubic-bezier(.16,1,.3,1) both;
        }

        /* Fundo listrado tricolor */
        .ieq-stripes {
          position:absolute; inset:0; pointer-events:none;
          background: repeating-linear-gradient(
            -55deg,
            ${isDark ? "rgba(200,16,46,.04)" : "rgba(200,16,46,.06)"} 0 10px,
            transparent 10px 20px,
            ${isDark ? "rgba(253,184,19,.03)" : "rgba(253,184,19,.05)"} 20px 30px,
            transparent 30px 40px,
            ${isDark ? "rgba(0,61,165,.04)" : "rgba(0,61,165,.06)"} 40px 50px,
            transparent 50px 60px
          );
          background-size:60px 60px;
          animation: stripe 8s linear infinite;
        }

        /* Blobs */
        .blob {
          position:absolute; border-radius:50%;
          pointer-events:none; filter:blur(70px);
        }

        /* Título */
        .ieq-title {
          font-family:'Cinzel',serif;
          background: linear-gradient(90deg,
            ${IEQ.redDark}, ${IEQ.red}, ${IEQ.yellow},
            ${IEQ.blue}, ${IEQ.red}, ${IEQ.redDark});
          background-size:250% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
          animation: shimmer 5s linear infinite;
        }

        /* Divisor */
        .ieq-divider {
          height:2px;
          background: linear-gradient(90deg,
            transparent, ${IEQ.red} 20%,
            ${IEQ.yellow} 50%,
            ${IEQ.blue} 80%, transparent);
        }

        /* Input */
        .ieq-input {
          width:100%;
          background:${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};
          border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.2)"};
          color:${isDark ? IEQ.offWhite : "#1A0A0D"};
          padding:14px 14px 14px 46px;
          border-radius:6px;
          font-size:14.5px;
          font-family:'EB Garamond',Georgia,serif;
          letter-spacing:.03em;
          outline:none;
          transition:border-color .25s, box-shadow .25s, background .25s;
        }
        .ieq-input::placeholder {
          color:${isDark ? "rgba(245,240,232,.25)" : "rgba(26,10,13,.35)"};
          font-style:italic;
        }
        .ieq-input:focus {
          border-color:${IEQ.red};
          background:${isDark ? "rgba(200,16,46,.07)" : "rgba(200,16,46,.04)"};
          box-shadow:0 0 0 3px rgba(200,16,46,.15);
        }
        .ieq-input-pass { padding-right:46px; }

        /* Botão submit */
        .ieq-btn {
          width:100%; padding:15px; border:none; border-radius:6px;
          font-family:'Cinzel',serif; font-size:12px; font-weight:700;
          letter-spacing:.22em; cursor:pointer;
          background:linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.red} 50%, ${IEQ.redLight});
          color:#fff;
          box-shadow:0 4px 20px rgba(200,16,46,.4), inset 0 1px 0 rgba(255,255,255,.15);
          position:relative; overflow:hidden;
          transition:transform .25s, box-shadow .25s, filter .25s;
        }
        .ieq-btn::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(253,184,19,.2),transparent 60%);
          opacity:0; transition:opacity .3s;
        }
        .ieq-btn:hover:not(:disabled) {
          transform:translateY(-2px);
          filter:brightness(1.08);
          box-shadow:0 8px 32px rgba(200,16,46,.5);
        }
        .ieq-btn:hover:not(:disabled)::after { opacity:1; }
        .ieq-btn:active:not(:disabled) { transform:translateY(0); }
        .ieq-btn:disabled { opacity:.65; cursor:not-allowed; }

        /* Botão tema */
        .theme-btn {
          position:absolute; top:22px; right:22px; z-index:50;
          padding:10px; border-radius:50%;
          border:1px solid ${isDark ? "rgba(200,16,46,.3)" : "rgba(200,16,46,.25)"};
          background:${isDark ? "rgba(17,10,13,.75)" : "rgba(255,255,255,.75)"};
          backdrop-filter:blur(12px);
          color:${isDark ? IEQ.yellow : IEQ.red};
          cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:transform .25s, box-shadow .25s;
        }
        .theme-btn:hover { transform:scale(1.1); box-shadow:0 4px 16px rgba(200,16,46,.3); }

        /* Eye button */
        .eye-btn {
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; padding:4px;
          color:${isDark ? "rgba(200,16,46,.5)" : "rgba(200,16,46,.45)"};
          display:flex; align-items:center;
          transition:color .2s;
        }
        .eye-btn:hover { color:${IEQ.red}; }

        /* Label */
        .ieq-label {
          display:block; margin-bottom:7px;
          font-family:'Cinzel',serif; font-size:10px;
          letter-spacing:.2em;
          color:${IEQ.red}; opacity:.75;
        }

        /* Anel pulsante */
        .pulse-ring {
          position:absolute; border-radius:50%;
          border:1px solid rgba(200,16,46,.35);
          animation:pulse 3s ease-in-out infinite;
        }

        /* Cantos decorativos */
        .corner { position:absolute; width:18px; height:18px; }
        .c-tl { top:0; left:0;  border-top:2px solid ${IEQ.red};    border-left:2px solid ${IEQ.red};   border-radius:2px 0 0 0; }
        .c-tr { top:0; right:0; border-top:2px solid ${IEQ.yellow}; border-right:2px solid ${IEQ.yellow}; border-radius:0 2px 0 0; }
        .c-bl { bottom:0; left:0;  border-bottom:2px solid ${IEQ.blue}; border-left:2px solid ${IEQ.blue};  border-radius:0 0 0 2px; }
        .c-br { bottom:0; right:0; border-bottom:2px solid ${IEQ.red};  border-right:2px solid ${IEQ.red};  border-radius:0 0 2px 0; }

        /* Erro */
        .ieq-error {
          padding:13px 16px; border-radius:6px; text-align:center; margin-bottom:18px;
          background:rgba(200,16,46,.12); border:1px solid rgba(200,16,46,.35);
          color:${isDark ? "#FF8080" : IEQ.red};
          font-family:'EB Garamond',Georgia,serif; font-size:14px; letter-spacing:.04em;
        }

        /* Icon campo */
        .field-icon {
          position:absolute; left:14px; top:50%; transform:translateY(-50%);
          pointer-events:none; transition:color .3s;
        }

        /* Link esqueci */
        .ieq-link {
          background:none; border:none; cursor:pointer; padding:0;
          font-family:'Cinzel',serif; font-size:10px; letter-spacing:.15em;
          color:${isDark ? "rgba(245,240,232,.3)" : "rgba(26,10,13,.3)"};
          transition:color .2s;
        }
        .ieq-link:hover { color:${IEQ.red}; }

        .flex-center { display:flex; align-items:center; justify-content:center; gap:10px; }
        .spin { animation:spin .7s linear infinite; }
      `}</style>

        {/* Fundo tricolor listrado */}
        <div className="ieq-stripes" />

        {/* Glow radial */}
        <div style={{
          position:"absolute", width:700, height:700, borderRadius:"50%",
          pointerEvents:"none",
          background:`radial-gradient(ellipse, ${isDark ? "rgba(200,16,46,.14)" : "rgba(200,16,46,.09)"} 0%, transparent 70%)`,
          animation:"pulse 5s ease-in-out infinite",
        }} />

        {/* Blobs */}
        <div className="blob" style={{
          width:350, height:350, bottom:-80, right:-80,
          background:`${isDark ? "rgba(0,61,165,.12)" : "rgba(0,61,165,.08)"}`,
          animation:"floatB 12s ease-in-out infinite",
        }} />
        <div className="blob" style={{
          width:250, height:250, top:-60, left:-60,
          background:`${isDark ? "rgba(253,184,19,.06)" : "rgba(253,184,19,.08)"}`,
          animation:"floatA 10s ease-in-out infinite",
        }} />

        {/* Botão tema */}
        <button className="theme-btn" onClick={toggleTheme} aria-label="Alternar tema">
          {isDark ? <Sun size={22} /> : <Moon size={22} />}
        </button>

        {/* ── CARD ── */}
        <div className="ieq-card" style={{
          position:"relative", zIndex:10,
          width:"100%", maxWidth:480,
          margin:24,
          background: isDark
              ? "rgba(17,10,13,.97)"
              : "rgba(255,255,255,.92)",
          borderRadius:10,
          border:`1px solid ${isDark ? "rgba(200,16,46,.22)" : "rgba(200,16,46,.15)"}`,
          boxShadow: isDark
              ? "0 40px 100px rgba(0,0,0,.85), 0 0 60px rgba(200,16,46,.07)"
              : "0 20px 80px rgba(0,0,0,.15), 0 0 0 1px rgba(200,16,46,.08)",
          padding:"52px 48px 44px",
          backdropFilter:"blur(24px)",
          transition:"background .5s, border .5s",
          opacity: mounted ? 1 : 0,
        }}>
          {/* Cantos tricolor */}
          <div className="corner c-tl" />
          <div className="corner c-tr" />
          <div className="corner c-bl" />
          <div className="corner c-br" />

          {/* ── HEADER ── */}
          <div style={{ textAlign:"center", marginBottom:36 }}>
            {/* Cruz com anéis */}
            <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:22 }}>
              <div className="pulse-ring" style={{ width:96, height:96 }} />
              <div className="pulse-ring" style={{
                width:76, height:76,
                animationDelay:"1s",
                borderColor:"rgba(253,184,19,.2)",
              }} />
              <div style={{
                width:64, height:64, borderRadius:"50%",
                background: isDark
                    ? "linear-gradient(135deg,#1A0A0D,#0D0608)"
                    : "linear-gradient(135deg,#fff,#f5ecea)",
                border:"1px solid rgba(200,16,46,.3)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 4px 24px rgba(200,16,46,.25), inset 0 1px 0 rgba(255,255,255,.12)",
              }}>
                <QuadrangularCross size={42} />
              </div>
            </div>

            <h1 className="ieq-title" style={{
              fontSize:30, fontWeight:700,
              letterSpacing:".2em", margin:"0 0 6px", lineHeight:1,
            }}>
              IEQ GESTÃO
            </h1>

            {/* Faixa tricolor */}
            <div style={{ display:"flex", justifyContent:"center", gap:4, margin:"12px 0 10px" }}>
              {[IEQ.red, IEQ.yellow, IEQ.blue].map((c, i) => (
                  <div key={i} style={{ width:30, height:3, borderRadius:2, background:c, opacity:.85 }} />
              ))}
            </div>

            <p style={{
              color: isDark ? "rgba(245,240,232,.35)" : "rgba(26,10,13,.4)",
              fontSize:10.5, letterSpacing:".18em",
              fontFamily:"'Cinzel',serif", margin:0,
            }}>
              PLATAFORMA ADMINISTRATIVA ECLESIÁSTICA
            </p>
          </div>

          {/* Divisor tricolor */}
          <div className="ieq-divider" style={{ marginBottom:28 }} />

          {/* Erro */}
          {error && <div className="ieq-error">{error}</div>}

          {/* ── FORM ── */}
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>

            {/* E-mail */}
            <div>
              <label className="ieq-label">E-MAIL</label>
              <div style={{ position:"relative" }}>
              <span className="field-icon" style={{
                color: focusField === "email" ? IEQ.red
                    : (isDark ? "rgba(200,16,46,.4)" : "rgba(200,16,46,.4)"),
              }}>
                <Mail size={17} />
              </span>
                <input
                    className="ieq-input"
                    type="email"
                    placeholder="usuario@ieq.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusField("email")}
                    onBlur={() => setFocusField(null)}
                    disabled={loading}
                    required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="ieq-label">SENHA</label>
              <div style={{ position:"relative" }}>
              <span className="field-icon" style={{
                color: focusField === "password" ? IEQ.red
                    : (isDark ? "rgba(200,16,46,.4)" : "rgba(200,16,46,.4)"),
              }}>
                <Lock size={17} />
              </span>
                <input
                    className="ieq-input ieq-input-pass"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusField("password")}
                    onBlur={() => setFocusField(null)}
                    disabled={loading}
                    required
                />
                <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPass((p) => !p)}
                    tabIndex={-1}
                    aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            {/* Esqueci senha */}
            <div style={{ textAlign:"right", marginTop:-6 }}>
              <button type="button" className="ieq-link">
                ESQUECI MINHA SENHA
              </button>
            </div>

            {/* Botão */}
            <button
                type="submit"
                className="ieq-btn"
                disabled={loading}
                style={{ marginTop:4 }}
            >
              {loading ? (
                  <span className="flex-center">
                <Loader2 size={17} className="spin" />
                AUTENTICANDO...
              </span>
              ) : (
                  "ACESSAR SISTEMA"
              )}
            </button>
          </form>

          {/* ── FOOTER ── */}
          <div style={{ marginTop:32 }}>
            <div className="ieq-divider" style={{ marginBottom:16 }} />
            <div style={{ display:"flex", justifyContent:"center", gap:4, marginBottom:12 }}>
              {[IEQ.red, IEQ.yellow, IEQ.blue].map((c, i) => (
                  <div key={i} style={{ width:20, height:2, borderRadius:2, background:c, opacity:.45 }} />
              ))}
            </div>
            <p style={{
              textAlign:"center", margin:0,
              color: isDark ? "rgba(245,240,232,.2)" : "rgba(26,10,13,.25)",
              fontSize:10, letterSpacing:".15em",
              fontFamily:"'Cinzel',serif",
            }}>
              © IEQ GESTÃO · SISTEMA SEGURO · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
  );
}
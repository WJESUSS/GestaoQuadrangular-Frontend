import { Helmet }        from "react-helmet-async";
import { useNavigate }   from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { jwtDecode }     from "jwt-decode";
import { Loader2, Lock, Mail, Sun, Moon, User, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth }       from "../auth/AuthContext";
import { useTheme }      from "../context/ThemeContext";
import api               from "../services/api.js";

/* ─── Paleta idêntica à Home ─── */
const BRAND = {
    red:"#C8102E", redDark:"#9B0B1E", redLight:"#E8294A",
    yellow:"#FDB813", yellowDark:"#C48C00",
    blue:"#003DA5", blueLight:"#1A56C4", blueDark:"#002470",
    dark:"#0A0608", stone:"#1A1416",
    light:"#F5F0EB", muted:"#8A7F7A",
};

/* ─── Mini-hook fade-in (igual ao da Home) ─── */
function useFadeIn(threshold = 0.15) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { el.style.opacity="1"; el.style.transform="translateY(0)"; obs.disconnect(); }
        }, { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

/* ─── Cruz quadrangular (mesmo SVG da Home) ─── */
/* ??? Cruz quadrangular ??? */
function IEQCross({ size = 300, src = "/quadrangular.png" }) {
    return (
        <img
            src={src}
            alt="Logo IEQ"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                minWidth: `${size}px`,
                minHeight: `${size}px`,
                borderRadius: "50%",
                objectFit: "cover",
                display: "block",
            }}
        />
    );
}
/* ─── Ícone olho ─── */
function EyeIcon({ open }) {
    return open
        ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}

/* ─── Ícone erro ─── */
function ErrIcon({ t }) {
    if (t === "senha")  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/><line x1="12" y1="15" x2="12" y2="17"/></svg>;
    if (t === "rede")   return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>;
    if (t === "limite") return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    if (t === "ok")     return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}

/* ─── Cálculo de força de senha ─── */
const calcForca   = s => s.length < 6 ? 1 : s.length < 8 ? 2 : /[A-Z]/.test(s) && /[0-9]/.test(s) ? 4 : 3;
const forcaLabel  = ["","Muito curta","Fraca","Média","Forte"];
const forcaColor  = ["",BRAND.red,BRAND.yellow,"#22c55e",BRAND.blue];

/* ══════════════════════════════════════════════════════════════ */
export default function Login() {
    const { login }              = useAuth();
    const navigate               = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const dark = theme === "dark";

    /* ── estado das abas ── */
    const [aba, setAba]         = useState("login");

    /* ── login ── */
    const [email,    setEmail]    = useState("");
    const [pass,     setPass]     = useState("");
    const [showPass, setShowPass] = useState(false);
    const [errLogin, setErrLogin] = useState(null);
    const [loadLogin,setLoadLogin]= useState(false);

    /* ── cadastro ── */
    const [cNome,    setCNome]    = useState("");
    const [cEmail,   setCEmail]   = useState("");
    const [cSenha,   setCSenha]   = useState("");
    const [cConf,    setCConf]    = useState("");
    const [showCP,   setShowCP]   = useState(false);
    const [errCad,   setErrCad]   = useState(null);
    const [loadCad,  setLoadCad]  = useState(false);
    const [okCad,    setOkCad]    = useState(false);

    /* ── alterar ── */
    const [aEmail,   setAEmail]   = useState("");
    const [aAtual,   setAAtual]   = useState("");
    const [aEmailN,  setAEmailN]  = useState("");
    const [aNova,    setANova]    = useState("");
    const [aConf,    setAConf]    = useState("");
    const [altEmail, setAltEmail] = useState(false);
    const [altSenha, setAltSenha] = useState(false);
    const [showAA,   setShowAA]   = useState(false);
    const [showAN,   setShowAN]   = useState(false);
    const [showAC,   setShowAC]   = useState(false);
    const [errAlt,   setErrAlt]   = useState(null);
    const [loadAlt,  setLoadAlt]  = useState(false);
    const [okAlt,    setOkAlt]    = useState(false);

    /* ── parallax hero ── */
    const heroRef = useRef(null);
    useEffect(() => {
        const h = e => { if (heroRef.current) heroRef.current.style.transform=`translateY(${window.scrollY*.25}px)`; };
        window.addEventListener("scroll", h, { passive:true });
        return () => window.removeEventListener("scroll", h);
    }, []);

    const cardRef = useFadeIn();

    /* helpers */
    const trocarAba = a => { setAba(a); setErrLogin(null); setErrCad(null); setErrAlt(null); setOkCad(false); setOkAlt(false); };

    const errBg     = e => e?.tipo==="limite" ? "rgba(253,184,19,.1)" : "rgba(200,16,46,.1)";
    const errBorder = e => e?.tipo==="limite" ? "rgba(253,184,19,.35)" : "rgba(200,16,46,.3)";
    const errColor  = e => e?.tipo==="limite" ? BRAND.yellow : BRAND.red;

    /* ── handlers ── */
    const handleLogin = async e => {
        e.preventDefault(); setErrLogin(null); setLoadLogin(true);
        try {
            const token = await login(email, pass);
            if (!token) throw new Error("sem_token");
            localStorage.setItem("token", token);
            const d = jwtDecode(token);
            localStorage.setItem("user", JSON.stringify({ id:d.id, username:d.sub, perfil:d.perfil }));
            const p = d.perfil?.replace("ROLE_","").toUpperCase();
            const map = { ADMIN:"/admin", PASTOR:"/pastor", LIDER_CELULA:"/lider", TESOUREIRO:"/tesouraria", SECRETARIO:"/secretaria" };
            if (map[p]) navigate(map[p]);
            else setErrLogin({ tipo:"geral", titulo:"Perfil não autorizado", msg:`Perfil "${p}" sem acesso. Contate o administrador.` });
        } catch(err) {
            const st = err?.response?.status;
            const bd = err?.response?.data;
            if (st===429) { setErrLogin({ tipo:"limite", titulo:"Acesso bloqueado temporariamente", msg:bd?.mensagem??"Aguarde alguns minutos antes de tentar novamente." }); }
            else if (st===401||st===403) {
                const rest = bd?.tentativasRestantes??0;
                const msg  = bd?.mensagem??"";
                if (!rest||msg.toLowerCase().includes("bloqueada")) setErrLogin({ tipo:"limite", titulo:"Conta bloqueada", msg:`Muitas tentativas. ${msg||"Tente em 5 minutos."}` });
                else setErrLogin({ tipo:"senha", titulo:"Credenciais inválidas", msg:`E-mail ou senha incorretos. ${msg}` });
            } else if (!navigator.onLine||err.code==="ERR_NETWORK") {
                setErrLogin({ tipo:"rede", titulo:"Sem conexão", msg:"Verifique sua internet e tente novamente." });
            } else {
                const m = bd?.mensagem||bd?.message;
                setErrLogin({ tipo:"geral", titulo:"Erro inesperado", msg:typeof m==="string"?m:"Tente novamente em instantes." });
            }
        } finally { setLoadLogin(false); }
    };

    const handleCad = async e => {
        e.preventDefault(); setErrCad(null);
        if (cNome.trim().length < 3) { setErrCad({ tipo:"geral", titulo:"Nome inválido", msg:"Informe seu nome completo (mínimo 3 caracteres)." }); return; }
        if (cSenha.length < 6)       { setErrCad({ tipo:"senha", titulo:"Senha fraca", msg:"A senha deve ter no mínimo 6 caracteres." }); return; }
        if (cSenha !== cConf)         { setErrCad({ tipo:"senha", titulo:"Senhas diferentes", msg:"A confirmação não confere. Verifique e tente novamente." }); return; }
        setLoadCad(true);
        try {
            await api.post("/auth/solicitar-cadastro-lider", { nome:cNome.trim(), email:cEmail.trim().toLowerCase(), senha:cSenha });
            setCNome(""); setCEmail(""); setCSenha(""); setCConf("");
            setOkCad(true);
        } catch(err) {
            const st=err?.response?.status, m=err?.response?.data?.message||err?.response?.data;
            if (st===409||(typeof m==="string"&&m.toLowerCase().includes("e-mail"))) setErrCad({ tipo:"geral", titulo:"E-mail já cadastrado", msg:"Aguarde a aprovação ou contate o administrador." });
            else if (!navigator.onLine||err.code==="ERR_NETWORK") setErrCad({ tipo:"rede", titulo:"Sem conexão", msg:"Verifique sua internet e tente novamente." });
            else setErrCad({ tipo:"geral", titulo:"Erro ao enviar", msg:typeof m==="string"?m:"Tente novamente em instantes." });
        } finally { setLoadCad(false); }
    };

    const handleAlt = async e => {
        e.preventDefault(); setErrAlt(null);
        if (!aEmail.trim())         { setErrAlt({ tipo:"geral", titulo:"E-mail obrigatório", msg:"Informe seu e-mail cadastrado." }); return; }
        if (!aAtual.trim())         { setErrAlt({ tipo:"senha", titulo:"Senha atual obrigatória", msg:"Confirme sua identidade com a senha atual." }); return; }
        if (!altEmail && !altSenha) { setErrAlt({ tipo:"geral", titulo:"Nada selecionado", msg:"Selecione ao menos uma opção de alteração." }); return; }
        if (altEmail && !aEmailN.trim()) { setErrAlt({ tipo:"geral", titulo:"E-mail inválido", msg:"Informe o novo e-mail desejado." }); return; }
        if (altSenha) {
            if (aNova.length < 6)  { setErrAlt({ tipo:"senha", titulo:"Senha fraca", msg:"A nova senha deve ter no mínimo 6 caracteres." }); return; }
            if (aNova !== aConf)   { setErrAlt({ tipo:"senha", titulo:"Senhas não conferem", msg:"A confirmação não confere." }); return; }
        }
        setLoadAlt(true);
        try {
            await api.post("/usuarios/solicitar-alteracao", {
                email:aEmail.trim().toLowerCase(), senhaAtual:aAtual,
                emailNovo:altEmail?aEmailN.trim().toLowerCase():null,
                novaSenha:altSenha?aNova:null, confirmarNovaSenha:altSenha?aConf:null,
            });
            setAEmail(""); setAAtual(""); setAEmailN(""); setANova(""); setAConf("");
            setAltEmail(false); setAltSenha(false);
            setOkAlt(true);
        } catch(err) {
            const st=err?.response?.status, m=err?.response?.data?.message||err?.response?.data;
            if (st===401||(typeof m==="string"&&m.toLowerCase().includes("senha atual"))) setErrAlt({ tipo:"senha", titulo:"Senha atual incorreta", msg:"A senha informada não confere." });
            else if (st===404||(typeof m==="string"&&m.toLowerCase().includes("não encontrado"))) setErrAlt({ tipo:"geral", titulo:"E-mail não encontrado", msg:"Nenhum usuário encontrado com este e-mail." });
            else if (st===409||(typeof m==="string"&&m.toLowerCase().includes("e-mail"))) setErrAlt({ tipo:"geral", titulo:"E-mail já em uso", msg:"Este e-mail já pertence a outro usuário." });
            else if (!navigator.onLine||err.code==="ERR_NETWORK") setErrAlt({ tipo:"rede", titulo:"Sem conexão", msg:"Verifique sua internet e tente novamente." });
            else setErrAlt({ tipo:"geral", titulo:"Erro ao enviar", msg:typeof m==="string"?m:"Tente novamente em instantes." });
        } finally { setLoadAlt(false); }
    };

    /* ── Cores base (mesmas da Home) ── */
    const bg    = dark ? BRAND.dark  : BRAND.light;
    const cardBg= dark ? "rgba(26,20,22,.96)" : "rgba(255,255,255,.96)";
    const txt   = dark ? BRAND.light : BRAND.dark;
    const sub   = dark ? "rgba(245,240,235,.5)" : "rgba(10,6,8,.45)";
    const border= dark ? "rgba(253,184,19,.13)" : "rgba(200,16,46,.15)";

    /* ── Força senha ── */
    const fc = calcForca(cSenha);
    const fa = calcForca(aNova);

    return (
        <>
            <Helmet>
                <title>IEQ Gestão — Acesso ao Sistema</title>
                <meta name="description" content="Portal administrativo da Igreja do Evangelho Quadrangular de Pituaçu."/>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/>
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet"/>
            </Helmet>

            <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        /* ── font base ── */
        .ieq-login-root {
          font-family:'Manrope',sans-serif;
          background:${bg};
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          overflow:hidden;
          position:relative;
          transition:background .4s;
        }

        /* ── grade decorativa (igual à Home) ── */
        .grid-bg {
          position:fixed; inset:0; pointer-events:none; z-index:0;
          background-image:
            linear-gradient(rgba(253,184,19,.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(253,184,19,.04) 1px,transparent 1px);
          background-size:60px 60px;
          transition:transform .3s linear;
        }

        /* ── glow vermelho central ── */
        .glow-red {
          position:fixed; top:50%; left:50%;
          transform:translate(-50%,-50%);
          width:700px; height:700px; border-radius:50%;
          background:radial-gradient(circle,rgba(200,16,46,.16) 0%,transparent 68%);
          pointer-events:none; z-index:0;
        }
        .glow-blue {
          position:fixed; top:30%; right:10%;
          width:400px; height:400px; border-radius:50%;
          background:radial-gradient(circle,rgba(0,61,165,.12) 0%,transparent 70%);
          pointer-events:none; z-index:0;
        }

        /* ── card principal ── */
        .login-card {
          position:relative; z-index:10;
          width:100%; max-width:480px;
          margin:24px;
          background:${cardBg};
          backdrop-filter:blur(24px);
          border:1px solid ${border};
          border-radius:12px;
          padding:44px 44px 36px;
          opacity:0; transform:translateY(28px);
          transition:opacity .7s ease, transform .7s ease,
                      background .4s, border-color .4s;
          box-shadow:
            0 2px 1px rgba(0,0,0,.04),
            0 8px 32px rgba(0,0,0,.12),
            0 0 0 1px rgba(253,184,19,.07);
        }

        /* ── tabs ── */
        .tabs-row {
          display:flex;
          background:${dark?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)"};
          border-radius:8px;
          padding:3px;
          gap:3px;
          margin-bottom:28px;
        }
        .tab-btn {
          flex:1; padding:10px 6px; border:none; cursor:pointer;
          border-radius:6px;
          font-family:'Manrope',sans-serif; font-size:9.5px;
          font-weight:700; letter-spacing:.13em; text-transform:uppercase;
          transition:all .25s;
        }
        .tab-btn.active {
          background:${BRAND.red};
          color:#fff;
          box-shadow:0 3px 12px rgba(200,16,46,.35);
        }
        .tab-btn.inactive {
          background:transparent;
          color:${sub};
        }
        .tab-btn.inactive:hover {
          background:${dark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)"};
          color:${BRAND.red};
        }

        /* ── label ── */
        .fld-label {
          display:block; margin-bottom:6px;
          font-size:10px; font-weight:700;
          letter-spacing:.12em; text-transform:uppercase;
          color:${BRAND.red}; font-family:'Manrope',sans-serif;
        }
        .fld-label.blue { color:${BRAND.blue}; }

        /* ── inputs ── */
        .ieq-input {
          width:100%;
          background:${dark?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)"};
          border:1px solid ${dark?"rgba(253,184,19,.12)":"rgba(200,16,46,.14)"};
          color:${txt};
          padding:13px 13px 13px 43px;
          border-radius:6px; outline:none;
          font-size:14px; font-family:'Manrope',sans-serif;
          transition:border-color .2s, box-shadow .2s, background .2s;
        }
        .ieq-input:focus {
          border-color:${BRAND.red};
          box-shadow:0 0 0 3px rgba(200,16,46,.14);
          background:${dark?"rgba(255,255,255,.06)":"rgba(200,16,46,.02)"};
        }
        .ieq-input.blue:focus {
          border-color:${BRAND.blue};
          box-shadow:0 0 0 3px rgba(0,61,165,.14);
        }
        .ieq-input.error { border-color:${BRAND.red}; }
        .ieq-input::placeholder { color:${dark?"rgba(245,240,235,.22)":"rgba(10,6,8,.22)"}; }

        /* ── botão principal ── */
        .btn-primary {
          width:100%; padding:14px; border:none; border-radius:6px;
          font-family:'Manrope',sans-serif; font-size:11px; font-weight:700;
          letter-spacing:.2em; text-transform:uppercase; cursor:pointer; color:#fff;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:opacity .2s, transform .2s, box-shadow .2s;
        }
        .btn-primary:hover:not(:disabled) {
          opacity:.88; transform:translateY(-2px);
          box-shadow:0 8px 28px rgba(200,16,46,.35);
        }
        .btn-primary:disabled { opacity:.45; cursor:not-allowed; transform:none !important; }
        .btn-primary.blue:hover:not(:disabled) { box-shadow:0 8px 28px rgba(0,61,165,.35); }

        /* ── caixa de erro ── */
        .err-box {
          display:flex; gap:10px; align-items:flex-start;
          padding:12px 14px; border-radius:7px;
          animation:slideDown .28s ease both;
        }
        @keyframes slideDown { from{opacity:0;transform:translateY(-7px)} to{opacity:1;transform:translateY(0)} }

        /* ── toggle checkbox visual ── */
        .check-row {
          display:flex; align-items:center; gap:10px;
          padding:11px 13px; border-radius:6px; cursor:pointer;
          transition:background .2s, border-color .2s;
          user-select:none;
        }
        .check-box {
          width:18px; height:18px; border-radius:4px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          transition:all .2s;
        }

        /* ── divisor ── */
        .divider {
          display:flex; align-items:center; gap:12px;
          margin:6px 0;
        }
        .divider::before,.divider::after {
          content:""; flex:1; height:1px;
          background:${dark?"rgba(253,184,19,.1)":"rgba(10,6,8,.09)"};
        }

        /* ── força senha ── */
        .forca-bar {
          flex:1; height:3px; border-radius:2px;
          transition:background .25s;
        }

        /* ── animações ── */
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn   { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
        @keyframes shakeX  { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes tabIn   { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse   { 0%,100%{opacity:.18} 50%{opacity:.06} }
        @keyframes spin    { to{transform:rotate(360deg)} }

        .tab-content { animation:tabIn .28s ease both; }
        .pop-in      { animation:popIn .42s cubic-bezier(.16,1,.3,1) both; }
        .shake       { animation:shakeX .4s ease both; }
        .spin        { animation:spin 1s linear infinite; }

        /* ── pulse ring da cruz ── */
        .pulse-ring {
          position:absolute; border-radius:50%;
          border:1px solid rgba(200,16,46,.3);
          animation:pulse 3s ease-in-out infinite;
        }

        /* ── tag badge ── */
        .badge {
          display:inline-flex; align-items:center; gap:7px;
          background:rgba(253,184,19,.07);
          border:1px solid rgba(253,184,19,.22);
          border-radius:100px; padding:5px 14px;
          font-size:11px; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase;
          color:${BRAND.yellow};
        }
        .badge-dot {
          width:6px; height:6px; border-radius:50%;
          background:${BRAND.yellow};
          animation:pulse 2s ease-in-out infinite;
        }

        /* ── responsive ── */
        @media(max-width:520px){
          .login-card{ padding:32px 22px 28px; }
          .tab-btn   { font-size:8.5px; letter-spacing:.07em; }
        }
      `}</style>

            <div className="ieq-login-root">
                {/* ── fundo grade + glows ── */}
                <div className="grid-bg" ref={heroRef}/>
                <div className="glow-red"/>
                <div className="glow-blue"/>

                {/* ── botão tema ── */}
                <button
                    onClick={toggleTheme}
                    aria-label="Alternar tema"
                    style={{
                        position:"fixed", top:22, right:22, zIndex:50,
                        background:"none", border:"none", cursor:"pointer",
                        color:dark?BRAND.yellow:BRAND.red, transition:"color .3s",
                    }}
                >
                    {dark ? <Sun size={22}/> : <Moon size={22}/>}
                </button>

                {/* ════════ CARD ════════ */}
                <div
                    className="login-card"
                    ref={cardRef}
                    style={{ ...(errLogin||errCad||errAlt?{ animation:"shakeX .4s ease" }:{}) }}
                >
                    {/* ── topo: cruz + título ── */}
                    <div style={{ textAlign:"center", marginBottom:28 }}>
                        {/* cruz com anel pulsante */}
                        <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                            <div className="pulse-ring" style={{ width:88, height:88 }}/>
                            <div className="pulse-ring" style={{ width:72, height:72, animationDelay:"1s" }}/>
                            <div style={{
                                width:62, height:62, borderRadius:"50%",
                                background:dark?"rgba(26,20,22,.9)":"#fff",
                                border:`1px solid rgba(200,16,46,.25)`,
                                display:"flex", alignItems:"center", justifyContent:"center",
                            }}>
                                <IEQCross size={44}/>
                            </div>
                        </div>

                        {/* badge "sistema exclusivo" */}
                        <div style={{ marginBottom:14 }}>
              <span className="badge">
                <span className="badge-dot"/>
                Sistema Exclusivo IEQ
              </span>
                        </div>

                        {/* título igual à Home */}
                        <h1 style={{
                            fontFamily:"'Playfair Display',serif",
                            fontSize:"clamp(26px,5vw,32px)",
                            fontWeight:700, lineHeight:1.1,
                            letterSpacing:"-.02em",
                            color:txt, margin:0,
                        }}>
                            Sua Igreja,{" "}
                            <span style={{ color:BRAND.yellow }}>Bem Administrada.</span>
                        </h1>
                        <p style={{
                            marginTop:8, fontSize:12,
                            color:sub, letterSpacing:".06em",
                            fontFamily:"'Manrope',sans-serif",
                        }}>
                            Portal Administrativo · IEQ Pituaçu
                        </p>
                    </div>

                    {/* ── separador decorativo ── */}
                    <div style={{
                        display:"flex", alignItems:"center", gap:12, marginBottom:24,
                    }}>
                        <div style={{ flex:1, height:1, background:`linear-gradient(to right,transparent,${BRAND.yellow})` }}/>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:BRAND.yellow }}/>
                        <div style={{ flex:1, height:1, background:`linear-gradient(to left,transparent,${BRAND.yellow})` }}/>
                    </div>

                    {/* ── tabs ── */}
                    <div className="tabs-row">
                        {[
                            { key:"login",    label:"Entrar" },
                            { key:"cadastro", label:"Solicitar Acesso" },
                            { key:"alterar",  label:"Alterar Dados" },
                        ].map(t => (
                            <button
                                key={t.key}
                                className={`tab-btn ${aba===t.key?"active":"inactive"}`}
                                onClick={() => trocarAba(t.key)}
                            >{t.label}</button>
                        ))}
                    </div>

                    {/* ════ ABA: LOGIN ════ */}
                    {aba === "login" && (
                        <div className="tab-content">
                            <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>
                                {/* campo e-mail */}
                                <div>
                                    <label className="fld-label">E-mail</label>
                                    <div style={{ position:"relative" }}>
                                        <Mail size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:BRAND.red, opacity:.55 }}/>
                                        <input
                                            className={`ieq-input${errLogin?.tipo==="senha"?" error":""}`}
                                            type="email" placeholder="usuario@ieq.com"
                                            value={email} onChange={e=>{setEmail(e.target.value);if(errLogin)setErrLogin(null);}}
                                            required autoComplete="email"
                                        />
                                    </div>
                                </div>

                                {/* campo senha */}
                                <div>
                                    <label className="fld-label">Senha</label>
                                    <div style={{ position:"relative" }}>
                                        <Lock size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:BRAND.red, opacity:.55 }}/>
                                        <input
                                            className={`ieq-input${errLogin?.tipo==="senha"?" error":""}`}
                                            type={showPass?"text":"password"} placeholder="••••••••"
                                            value={pass} onChange={e=>{setPass(e.target.value);if(errLogin)setErrLogin(null);}}
                                            required autoComplete="current-password"
                                        />
                                        <button type="button" onClick={()=>setShowPass(!showPass)}
                                                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:BRAND.red }}>
                                            <EyeIcon open={showPass}/>
                                        </button>
                                    </div>
                                </div>

                                {/* caixa de erro login */}
                                {errLogin && (
                                    <div className="err-box" role="alert"
                                         style={{ background:errBg(errLogin), border:`1px solid ${errBorder(errLogin)}` }}>
                                        <span style={{ color:errColor(errLogin), flexShrink:0, marginTop:1 }}><ErrIcon t={errLogin.tipo}/></span>
                                        <div>
                                            <p style={{ fontSize:11.5, fontWeight:700, color:errColor(errLogin), letterSpacing:".05em", fontFamily:"'Manrope',sans-serif", marginBottom:3 }}>{errLogin.titulo}</p>
                                            <p style={{ fontSize:12.5, color:sub, lineHeight:1.55, fontFamily:"'Manrope',sans-serif" }}>{errLogin.msg}</p>
                                        </div>
                                    </div>
                                )}

                                {/* botão */}
                                <button type="submit" className="btn-primary" disabled={loadLogin}
                                        style={{ marginTop:4, background:`linear-gradient(135deg,${BRAND.redDark},${BRAND.red})` }}>
                                    {loadLogin
                                        ? <><Loader2 size={16} className="spin"/> Verificando...</>
                                        : "Acessar Sistema"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ════ ABA: CADASTRO ════ */}
                    {aba === "cadastro" && (
                        <div className="tab-content">
                            {/* aviso azul */}
                            <div style={{
                                marginBottom:18, padding:"11px 13px", borderRadius:7,
                                background:dark?"rgba(0,61,165,.1)":"rgba(0,61,165,.06)",
                                border:`1px solid ${dark?"rgba(0,61,165,.28)":"rgba(0,61,165,.18)"}`,
                                display:"flex", gap:9, alignItems:"flex-start",
                            }}>
                <span style={{ color:BRAND.blue, flexShrink:0, marginTop:2 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </span>
                                <p style={{ fontSize:12.5, color:sub, lineHeight:1.55, fontFamily:"'Manrope',sans-serif" }}>
                                    Exclusivo para <strong style={{ color:txt }}>líderes de célula</strong>. Após o envio, aguarde a aprovação do administrador para acessar o sistema.
                                </p>
                            </div>

                            {/* sucesso cadastro */}
                            {okCad ? (
                                <div className="pop-in" style={{
                                    textAlign:"center", padding:"28px 20px", borderRadius:8,
                                    background:dark?"rgba(0,61,165,.1)":"rgba(0,61,165,.06)",
                                    border:`1px solid ${dark?"rgba(0,61,165,.32)":"rgba(0,61,165,.18)"}`,
                                }}>
                                    <CheckCircle2 size={42} color="#22c55e" strokeWidth={1.5} style={{ marginBottom:12 }}/>
                                    <p style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:BRAND.blue, marginBottom:8 }}>Solicitação Enviada!</p>
                                    <p style={{ fontSize:13, color:sub, lineHeight:1.6, fontFamily:"'Manrope',sans-serif", marginBottom:18 }}>
                                        Sua solicitação foi recebida. O administrador irá analisar e liberar seu acesso em breve.
                                    </p>
                                    <button onClick={()=>trocarAba("login")} style={{
                                        background:"none", border:`1px solid ${BRAND.blue}`, color:BRAND.blue,
                                        borderRadius:6, padding:"9px 22px", cursor:"pointer",
                                        fontFamily:"'Manrope',sans-serif", fontSize:11, fontWeight:700, letterSpacing:".12em",
                                    }}>IR PARA LOGIN</button>
                                </div>
                            ) : (
                                <form onSubmit={handleCad} style={{ display:"flex", flexDirection:"column", gap:13 }}>
                                    {/* nome */}
                                    <div>
                                        <label className="fld-label">Nome Completo</label>
                                        <div style={{ position:"relative" }}>
                                            <User size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:BRAND.red, opacity:.55 }}/>
                                            <input className="ieq-input" type="text" placeholder="Seu nome completo"
                                                   value={cNome} onChange={e=>{setCNome(e.target.value);if(errCad)setErrCad(null);}} required autoComplete="name"/>
                                        </div>
                                    </div>
                                    {/* email */}
                                    <div>
                                        <label className="fld-label">E-mail</label>
                                        <div style={{ position:"relative" }}>
                                            <Mail size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:BRAND.red, opacity:.55 }}/>
                                            <input className="ieq-input" type="email" placeholder="seu@email.com"
                                                   value={cEmail} onChange={e=>{setCEmail(e.target.value);if(errCad)setErrCad(null);}} required autoComplete="email"/>
                                        </div>
                                    </div>
                                    {/* senha */}
                                    <div>
                                        <label className="fld-label">Senha</label>
                                        <div style={{ position:"relative" }}>
                                            <Lock size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:BRAND.red, opacity:.55 }}/>
                                            <input className={`ieq-input${errCad?.tipo==="senha"?" error":""}`}
                                                   type={showCP?"text":"password"} placeholder="Mínimo 6 caracteres"
                                                   value={cSenha} onChange={e=>{setCSenha(e.target.value);if(errCad)setErrCad(null);}} required/>
                                            <button type="button" onClick={()=>setShowCP(!showCP)}
                                                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:BRAND.red }}>
                                                <EyeIcon open={showCP}/>
                                            </button>
                                        </div>
                                        {cSenha.length > 0 && (
                                            <div style={{ marginTop:7 }}>
                                                <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                                                    {[1,2,3,4].map(i => (
                                                        <div key={i} className="forca-bar"
                                                             style={{ background:i<=fc?forcaColor[fc]:(dark?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)") }}/>
                                                    ))}
                                                </div>
                                                <p style={{ fontSize:10, color:forcaColor[fc], fontFamily:"'Manrope',sans-serif", fontWeight:700, letterSpacing:".07em" }}>{forcaLabel[fc]}</p>
                                            </div>
                                        )}
                                    </div>
                                    {/* confirmar */}
                                    <div>
                                        <label className="fld-label">Confirmar Senha</label>
                                        <div style={{ position:"relative" }}>
                                            <Lock size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:BRAND.red, opacity:.55 }}/>
                                            <input className={`ieq-input${cConf.length>0&&cSenha!==cConf?" error":""}`}
                                                   type={showCP?"text":"password"} placeholder="Repita a senha"
                                                   value={cConf} onChange={e=>{setCConf(e.target.value);if(errCad)setErrCad(null);}} required/>
                                        </div>
                                        {cConf.length > 0 && (
                                            <p style={{ fontSize:10.5, marginTop:4, fontWeight:700, fontFamily:"'Manrope',sans-serif", color:cSenha===cConf?"#22c55e":BRAND.red }}>
                                                {cSenha===cConf?"✓ Senhas conferem":"✗ Senhas não conferem"}
                                            </p>
                                        )}
                                    </div>
                                    {/* erro */}
                                    {errCad && (
                                        <div className="err-box" role="alert"
                                             style={{ background:errBg(errCad), border:`1px solid ${errBorder(errCad)}` }}>
                                            <span style={{ color:errColor(errCad), flexShrink:0, marginTop:1 }}><ErrIcon t={errCad.tipo}/></span>
                                            <div>
                                                <p style={{ fontSize:11.5, fontWeight:700, color:errColor(errCad), letterSpacing:".05em", fontFamily:"'Manrope',sans-serif", marginBottom:3 }}>{errCad.titulo}</p>
                                                <p style={{ fontSize:12.5, color:sub, lineHeight:1.55, fontFamily:"'Manrope',sans-serif" }}>{errCad.msg}</p>
                                            </div>
                                        </div>
                                    )}
                                    {/* botão */}
                                    <button type="submit" className="btn-primary blue" disabled={loadCad}
                                            style={{ marginTop:4, background:`linear-gradient(135deg,${BRAND.blueDark},${BRAND.blue})` }}>
                                        {loadCad ? <><Loader2 size={16} className="spin"/> Enviando...</> : "Solicitar Acesso"}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ════ ABA: ALTERAR DADOS ════ */}
                    {aba === "alterar" && (
                        <div className="tab-content">
                            {/* aviso amarelo */}
                            <div style={{
                                marginBottom:18, padding:"11px 13px", borderRadius:7,
                                background:dark?"rgba(253,184,19,.07)":"rgba(253,184,19,.09)",
                                border:`1px solid ${dark?"rgba(253,184,19,.22)":"rgba(196,140,0,.28)"}`,
                                display:"flex", gap:9, alignItems:"flex-start",
                            }}>
                <span style={{ color:BRAND.yellow, flexShrink:0, marginTop:2 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </span>
                                <p style={{ fontSize:12.5, color:sub, lineHeight:1.55, fontFamily:"'Manrope',sans-serif" }}>
                                    As alterações ficam <strong style={{ color:txt }}>pendentes de aprovação</strong> do administrador antes de serem aplicadas.
                                </p>
                            </div>

                            {/* sucesso alterar */}
                            {okAlt ? (
                                <div className="pop-in" style={{
                                    textAlign:"center", padding:"28px 20px", borderRadius:8,
                                    background:dark?"rgba(0,61,165,.1)":"rgba(0,61,165,.06)",
                                    border:`1px solid ${dark?"rgba(0,61,165,.32)":"rgba(0,61,165,.18)"}`,
                                }}>
                                    <ShieldCheck size={42} color="#22c55e" strokeWidth={1.5} style={{ marginBottom:12 }}/>
                                    <p style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:BRAND.blue, marginBottom:8 }}>Solicitação Enviada!</p>
                                    <p style={{ fontSize:13, color:sub, lineHeight:1.6, fontFamily:"'Manrope',sans-serif", marginBottom:18 }}>
                                        O administrador irá analisar e aplicar as mudanças em breve.
                                    </p>
                                    <button onClick={()=>trocarAba("login")} style={{
                                        background:"none", border:`1px solid ${BRAND.blue}`, color:BRAND.blue,
                                        borderRadius:6, padding:"9px 22px", cursor:"pointer",
                                        fontFamily:"'Manrope',sans-serif", fontSize:11, fontWeight:700, letterSpacing:".12em",
                                    }}>IR PARA LOGIN</button>
                                </div>
                            ) : (
                                <form onSubmit={handleAlt} style={{ display:"flex", flexDirection:"column", gap:0 }}>
                                    {/* e-mail atual */}
                                    <div style={{ marginBottom:14 }}>
                                        <label className="fld-label">Seu E-mail <span style={{ color:BRAND.red }}>*</span></label>
                                        <div style={{ position:"relative" }}>
                                            <Mail size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:BRAND.red, opacity:.55 }}/>
                                            <input className={`ieq-input${errAlt&&(errAlt.titulo==="E-mail obrigatório"||errAlt.titulo==="E-mail não encontrado")?" error":""}`}
                                                   type="email" placeholder="seu@email.com"
                                                   value={aEmail} onChange={e=>{setAEmail(e.target.value);if(errAlt)setErrAlt(null);}} required autoComplete="email"/>
                                        </div>
                                    </div>
                                    {/* senha atual */}
                                    <div style={{ marginBottom:18 }}>
                                        <label className="fld-label">Senha Atual <span style={{ color:BRAND.red }}>*</span></label>
                                        <div style={{ position:"relative" }}>
                                            <Lock size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:BRAND.red, opacity:.55 }}/>
                                            <input className={`ieq-input${errAlt?.tipo==="senha"?" error":""}`}
                                                   type={showAA?"text":"password"} placeholder="Confirme sua identidade"
                                                   value={aAtual} onChange={e=>{setAAtual(e.target.value);if(errAlt)setErrAlt(null);}} required autoComplete="current-password"/>
                                            <button type="button" onClick={()=>setShowAA(!showAA)}
                                                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:BRAND.red }}>
                                                <EyeIcon open={showAA}/>
                                            </button>
                                        </div>
                                    </div>

                                    {/* divisor */}
                                    <div className="divider" style={{ marginBottom:14 }}>
                    <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:".13em", color:sub, whiteSpace:"nowrap", fontFamily:"'Manrope',sans-serif" }}>
                      O QUE DESEJA ALTERAR?
                    </span>
                                    </div>

                                    {/* toggles */}
                                    <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:18 }}>
                                        {[
                                            { key:"email", label:"Alterar E-mail", state:altEmail, set:setAltEmail },
                                            { key:"senha", label:"Alterar Senha",  state:altSenha, set:setAltSenha },
                                        ].map(({ key, label, state, set }) => (
                                            <div key={key} className="check-row"
                                                 onClick={()=>{set(!state);setErrAlt(null);}}
                                                 style={{
                                                     background: state
                                                         ? (dark?"rgba(200,16,46,.1)":"rgba(200,16,46,.06)")
                                                         : (dark?"rgba(255,255,255,.02)":"rgba(0,0,0,.02)"),
                                                     border:`1px solid ${state?"rgba(200,16,46,.35)":(dark?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)")}`,
                                                 }}
                                            >
                                                <div className="check-box"
                                                     style={{
                                                         background:state?BRAND.red:"transparent",
                                                         border:`2px solid ${state?BRAND.red:(dark?"rgba(255,255,255,.2)":"rgba(0,0,0,.18)")}`,
                                                     }}>
                                                    {state && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                                                </div>
                                                {key==="email"
                                                    ? <Mail size={14} color={state?BRAND.red:sub} style={{ flexShrink:0 }}/>
                                                    : <Lock size={14} color={state?BRAND.red:sub} style={{ flexShrink:0 }}/>}
                                                <span style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", fontFamily:"'Manrope',sans-serif", color:state?txt:sub }}>{label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* novo e-mail */}
                                    {altEmail && (
                                        <div style={{ marginBottom:14, animation:"slideDown .25s ease both" }}>
                                            <label className="fld-label blue">Novo E-mail</label>
                                            <div style={{ position:"relative" }}>
                                                <Mail size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:BRAND.blue, opacity:.55 }}/>
                                                <input className="ieq-input blue" type="email" placeholder="novo@email.com"
                                                       value={aEmailN} onChange={e=>{setAEmailN(e.target.value);if(errAlt)setErrAlt(null);}} autoComplete="email"/>
                                            </div>
                                        </div>
                                    )}

                                    {/* nova senha */}
                                    {altSenha && (
                                        <div style={{ display:"flex", flexDirection:"column", gap:13, marginBottom:14, animation:"slideDown .25s ease both" }}>
                                            <div>
                                                <label className="fld-label blue">Nova Senha</label>
                                                <div style={{ position:"relative" }}>
                                                    <Lock size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:BRAND.blue, opacity:.55 }}/>
                                                    <input className="ieq-input blue" type={showAN?"text":"password"} placeholder="Mínimo 6 caracteres"
                                                           value={aNova} onChange={e=>{setANova(e.target.value);if(errAlt)setErrAlt(null);}} autoComplete="new-password"/>
                                                    <button type="button" onClick={()=>setShowAN(!showAN)}
                                                            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:BRAND.blue }}>
                                                        <EyeIcon open={showAN}/>
                                                    </button>
                                                </div>
                                                {aNova.length > 0 && (
                                                    <div style={{ marginTop:7 }}>
                                                        <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                                                            {[1,2,3,4].map(i => (
                                                                <div key={i} className="forca-bar"
                                                                     style={{ background:i<=fa?forcaColor[fa]:(dark?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)") }}/>
                                                            ))}
                                                        </div>
                                                        <p style={{ fontSize:10, color:forcaColor[fa], fontFamily:"'Manrope',sans-serif", fontWeight:700, letterSpacing:".07em" }}>{forcaLabel[fa]}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="fld-label blue">Confirmar Nova Senha</label>
                                                <div style={{ position:"relative" }}>
                                                    <Lock size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:BRAND.blue, opacity:.55 }}/>
                                                    <input className={`ieq-input blue${aConf.length>0&&aNova!==aConf?" error":""}`}
                                                           type={showAC?"text":"password"} placeholder="Repita a nova senha"
                                                           value={aConf} onChange={e=>{setAConf(e.target.value);if(errAlt)setErrAlt(null);}} autoComplete="new-password"/>
                                                    <button type="button" onClick={()=>setShowAC(!showAC)}
                                                            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:BRAND.blue }}>
                                                        <EyeIcon open={showAC}/>
                                                    </button>
                                                </div>
                                                {aConf.length > 0 && (
                                                    <p style={{ fontSize:10.5, marginTop:4, fontWeight:700, fontFamily:"'Manrope',sans-serif", color:aNova===aConf?"#22c55e":BRAND.red }}>
                                                        {aNova===aConf?"✓ Senhas conferem":"✗ Senhas não conferem"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* erro alterar */}
                                    {errAlt && (
                                        <div className="err-box" role="alert" style={{ background:errBg(errAlt), border:`1px solid ${errBorder(errAlt)}`, marginBottom:12 }}>
                                            <span style={{ color:errColor(errAlt), flexShrink:0, marginTop:1 }}><ErrIcon t={errAlt.tipo}/></span>
                                            <div>
                                                <p style={{ fontSize:11.5, fontWeight:700, color:errColor(errAlt), letterSpacing:".05em", fontFamily:"'Manrope',sans-serif", marginBottom:3 }}>{errAlt.titulo}</p>
                                                <p style={{ fontSize:12.5, color:sub, lineHeight:1.55, fontFamily:"'Manrope',sans-serif" }}>{errAlt.msg}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* botão */}
                                    <button type="submit" className="btn-primary" disabled={loadAlt||(!altEmail&&!altSenha)}
                                            style={{ marginTop:4, background:`linear-gradient(135deg,${BRAND.redDark},${BRAND.red})` }}>
                                        {loadAlt
                                            ? <><Loader2 size={16} className="spin"/> Enviando...</>
                                            : <><CheckCircle2 size={15}/> Enviar Solicitação</>}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ── rodapé ── */}
                    <p style={{
                        marginTop:28, textAlign:"center",
                        fontSize:10, letterSpacing:".15em", fontFamily:"'Manrope',sans-serif",
                        color:dark?"rgba(245,240,235,.15)":"rgba(10,6,8,.18)",
                        textTransform:"uppercase",
                    }}>
                        © {new Date().getFullYear()} IEQ Pituaçu · Sistema Eclesiástico
                    </p>
                </div>
            </div>
        </>
    );
}
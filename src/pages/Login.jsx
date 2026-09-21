import { Helmet }        from "react-helmet-async";
import { useNavigate }   from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { jwtDecode }     from "jwt-decode";
import { Loader2, Lock, Mail, Sun, Moon, User, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth }       from "../auth/AuthContext";
import { useTheme }      from "../context/ThemeContext";
import api               from "../services/api.js";

/* ─── Paleta "Dunas" (template space-login) ─── */
const P = {
    plum:"#834D87", plumDark:"#6B3A70", plumDeep:"#583575",
    pink:"#F598AD", ink:"#200A3F",
    red:"#9E2A2B", gold:"#B8892E",
};

/* ─── Fade-in do cartão ─── */
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

/* ─── Logo IEQ ─── */
function IEQCross({ size = 40, src = "/quadrangular.png" }) {
    return (
        <img
            src={src}
            alt="Logo IEQ"
            style={{
                width: `${size}px`, height: `${size}px`,
                minWidth: `${size}px`, minHeight: `${size}px`,
                borderRadius: "50%", objectFit: "cover", display: "block",
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
    if (t === "suspensa") return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>;
    if (t === "ok")     return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}

/* ─── Força de senha ─── */
const calcForca  = s => s.length < 6 ? 1 : s.length < 8 ? 2 : /[A-Z]/.test(s) && /[0-9]/.test(s) ? 4 : 3;
const forcaLabel = ["","Muito curta","Fraca","Média","Forte"];
const forcaColor = ["",P.red,P.gold,"#3E9B5F",P.plum];

function Forca({ senha }) {
    if (!senha) return null;
    const f = calcForca(senha);
    return (
        <div style={{ marginTop:8 }}>
            <div style={{ display:"flex", gap:4, marginBottom:5 }}>
                {[1,2,3,4].map(i => (
                    <div key={i} className="forca-bar" style={{ background: i<=f ? forcaColor[f] : "var(--track)" }}/>
                ))}
            </div>
            <p style={{ fontSize:11, fontWeight:700, color:forcaColor[f] }}>{forcaLabel[f]}</p>
        </div>
    );
}

function Confere({ a, b }) {
    if (!b) return null;
    const ok = a === b;
    return (
        <p style={{ fontSize:11.5, marginTop:6, fontWeight:700, color: ok ? "#3E9B5F" : "var(--err)" }}>
            {ok ? "✓ Senhas conferem" : "✗ Senhas não conferem"}
        </p>
    );
}

/* ─── Campo com ícone (definido fora para não perder o foco a cada render) ─── */
function Field({ id, label, icon:Icon, required, children }) {
    return (
        <div>
            <label className="fld-label" htmlFor={id}>
                {label}{required && <span style={{ color:"var(--err)" }}> *</span>}
            </label>
            <div className="fld-wrap">
                <Icon size={16} className="fld-icon" aria-hidden="true"/>
                {children}
            </div>
        </div>
    );
}

function EyeBtn({ show, onClick }) {
    return (
        <button type="button" className="eye" onClick={onClick}
                aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
            <EyeIcon open={show}/>
        </button>
    );
}

function ErrBox({ e }) {
    if (!e) return null;
    return (
        <div className={`err-box ${e.tipo==="limite" ? "err-warn" : "err-bad"}`} role="alert">
            <span className="err-ico"><ErrIcon t={e.tipo}/></span>
            <div>
                <p className="err-title">{e.titulo}</p>
                <p className="err-msg">{e.msg}</p>
            </div>
        </div>
    );
}

/* ══════════ ARTE: fundo em tela cheia (céu + dunas) ══════════ */
const BG_STARS = [
    [96,95,1.5],[126,204,1.8],[306,204,1.5],[365,84,1.3],[196,293,1.5],[378,277,1.3],[58,358,2.4],[94,388,1.2],
    [119,463,1.5],[315,483,2.8],[620,90,3],[809,50,1.6],[943,131,1.6],[963,270,1.7],[1079,199,2.6],[1191,86,1.8],
    [1258,185,1.6],[1253,328,2.4],[1180,388,2.4],[1262,448,1.4],[1187,561,2.8],[996,466,1.3],[450,150,1.2],[700,40,1.2],
    [540,340,1.2],[880,330,1.3],[230,120,1.1],[1120,120,1.2],
];
const BG_STREAKS = [
    [1012,361,1110,262,2.4],[195,458,282,373,2.2],[1043,554,1094,501,1.8],
    [630,212,662,185,1.4],[830,270,862,244,1.4],[515,266,541,246,1.2],
];

function SceneBackground({ dark }) {
    return (
        <svg className="scene" viewBox="0 0 1344 896" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <defs>
                <linearGradient id="bg-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0"   stopColor="#442B6C"/>
                    <stop offset=".30" stopColor="#6D3F77"/>
                    <stop offset=".50" stopColor="#9A5385"/>
                    <stop offset=".68" stopColor="#C56B93"/>
                    <stop offset=".85" stopColor="#E08AA1"/>
                    <stop offset="1"   stopColor="#EA94A5"/>
                </linearGradient>
                <linearGradient id="bg-dark" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#6A4381"/>
                    <stop offset="1" stopColor="#4B2A68"/>
                </linearGradient>
                <linearGradient id="bg-darkR" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#4F2D6B"/>
                    <stop offset="1" stopColor="#5E3877"/>
                </linearGradient>
                <linearGradient id="bg-lit" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#F7A5A6"/>
                    <stop offset=".55" stopColor="#DD87A2"/>
                    <stop offset="1" stopColor="#A96C95"/>
                </linearGradient>
                <linearGradient id="bg-litBottom" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#B9709A"/>
                    <stop offset=".5" stopColor="#E88EA5"/>
                    <stop offset="1" stopColor="#BD7396"/>
                </linearGradient>
                <linearGradient id="bg-streak" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity=".95"/>
                    <stop offset="1" stopColor="#FFFFFF" stopOpacity="0"/>
                </linearGradient>
                <radialGradient id="bg-glow">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity=".95"/>
                    <stop offset=".35" stopColor="#E9B6FF" stopOpacity=".55"/>
                    <stop offset="1" stopColor="#C68BFF" stopOpacity="0"/>
                </radialGradient>
            </defs>

            <rect width="1344" height="896" fill="url(#bg-sky)"/>

            {/* estrelas */}
            <g className="twinkle">
                {BG_STARS.map(([x,y,r],i) => (
                    <g key={i}>
                        {r >= 2.4 && <circle cx={x} cy={y} r={r*3.2} fill="url(#bg-glow)"/>}
                        <circle cx={x} cy={y} r={r} fill="#fff" opacity={r>=2.4?1:.8}/>
                    </g>
                ))}
            </g>
            {BG_STREAKS.map(([x1,y1,x2,y2,w],i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#bg-streak)" strokeWidth={w} strokeLinecap="round"/>
            ))}

            {/* massa base entre as dunas */}
            <path d="M0,640 C300,650 600,690 900,640 C1100,600 1250,650 1344,640 L1344,896 L0,896 Z" fill="#6A4381"/>

            {/* duna esquerda */}
            <path d="M0,610 C50,608 110,618 152,626 C205,590 245,562 262,563 C276,572 274,610 266,650 C258,700 205,745 232,800 C245,830 270,860 300,896 L0,896 Z" fill="url(#bg-dark)"/>
            <path d="M264,566 C300,600 360,655 405,702 C350,740 280,790 240,822 C215,780 235,730 262,690 C275,640 274,600 264,566 Z" fill="url(#bg-lit)"/>
            <path d="M0,896 L0,800 C60,780 130,770 165,780 C178,830 172,870 160,896 Z" fill="#4B2A68"/>
            <path d="M165,782 C200,820 250,860 282,896 L160,896 C172,860 178,820 165,782 Z" fill="url(#bg-lit)"/>

            {/* base central rosada (aparece abaixo do cartão) */}
            <path d="M500,896 C560,810 690,770 800,780 C910,790 990,835 1030,896 Z" fill="url(#bg-litBottom)"/>

            {/* duna direita */}
            <path d="M900,620 C940,590 975,558 992,556 C1020,562 1035,590 1010,612 C985,628 960,640 968,655 C1000,690 1055,705 1058,745 C1058,790 1075,815 1150,840 L1344,880 L1344,896 L800,896 Z" fill="url(#bg-darkR)"/>
            <path d="M1005,563 C1100,640 1230,720 1298,762 C1250,810 1200,840 1165,850 C1100,830 1060,800 1058,745 C1055,705 1000,690 968,655 C960,640 985,628 1010,612 C1035,590 1025,565 1005,563 Z" fill="url(#bg-lit)"/>
            <path d="M1180,676 C1250,660 1310,650 1344,640 L1344,770 L1298,762 Z" fill="#5B3673"/>
            <path d="M1085,896 C1180,860 1290,800 1344,730 L1344,896 Z" fill="#5B3673"/>

            {dark && <rect width="1344" height="896" fill="#0E0620" opacity=".45"/>}
        </svg>
    );
}

/* ══════════ ARTE: ilustração do topo do cartão ══════════ */
const HD_STARS = [[60,40,1.2],[130,25,1],[200,60,1.3],[300,30,1],[455,110,1.2],[35,120,1],[250,18,1.1],[350,85,1],[170,95,1.4],[430,160,1]];

function CardArt() {
    return (
        <svg viewBox="0 0 495 341" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <defs>
                <linearGradient id="hd-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0"   stopColor="#42296B"/>
                    <stop offset=".45" stopColor="#6F4179"/>
                    <stop offset=".75" stopColor="#A85B88"/>
                    <stop offset="1"   stopColor="#CF7599"/>
                </linearGradient>
                <linearGradient id="hd-moon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#F7AAA6"/>
                    <stop offset="1" stopColor="#B06F95" stopOpacity=".65"/>
                </linearGradient>
                <linearGradient id="hd-dark" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#5C3775"/>
                    <stop offset="1" stopColor="#6F4784"/>
                </linearGradient>
                <linearGradient id="hd-darkR" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#5A3674"/>
                    <stop offset="1" stopColor="#7A4E89"/>
                </linearGradient>
                <linearGradient id="hd-lit" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#F7A5A6"/>
                    <stop offset=".5" stopColor="#DE88A2"/>
                    <stop offset="1" stopColor="#B0709A"/>
                </linearGradient>
                <linearGradient id="hd-streak" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#fff" stopOpacity=".9"/>
                    <stop offset="1" stopColor="#fff" stopOpacity="0"/>
                </linearGradient>
                <radialGradient id="hd-glow">
                    <stop offset="0" stopColor="#fff" stopOpacity=".9"/>
                    <stop offset="1" stopColor="#D9A3FF" stopOpacity="0"/>
                </radialGradient>
            </defs>

            <rect width="495" height="341" fill="url(#hd-sky)"/>

            <circle cx="405" cy="58" r="22" fill="url(#hd-moon)"/>

            <g className="twinkle">
                {HD_STARS.map(([x,y,r],i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity=".85"/>)}
                <circle cx="42" cy="92" r="9" fill="url(#hd-glow)"/>
                <circle cx="42" cy="92" r="1.8" fill="#fff"/>
            </g>
            <line x1="418" y1="152" x2="452" y2="124" stroke="url(#hd-streak)" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="70" y1="160" x2="98" y2="136" stroke="url(#hd-streak)" strokeWidth="1.4" strokeLinecap="round"/>

            {/* massa de fundo */}
            <path d="M0,255 C120,245 260,262 495,240 L495,341 L0,341 Z" fill="#6A4381"/>

            {/* dunas pequenas à esquerda */}
            <path d="M0,246 C27,223 67,198 89,196 C95,213 89,233 75,253 C69,273 57,298 55,341 L0,341 Z" fill="url(#hd-dark)"/>
            <path d="M89,196 C110,215 135,236 150,250 C130,270 100,300 90,341 L55,341 C57,298 69,273 75,253 C89,233 95,213 89,196 Z" fill="url(#hd-lit)"/>

            {/* duna principal */}
            <path d="M39,341 C47,323 72,298 117,253 C167,213 207,181 225,179 C242,185 249,203 237,223 C217,238 195,248 197,268 C207,293 247,323 292,341 Z" fill="url(#hd-dark)"/>
            <path d="M237,186 C297,233 377,288 422,313 C407,328 392,335 372,341 L292,341 C247,323 207,293 197,268 C195,248 217,238 237,223 C249,203 242,186 237,186 Z" fill="url(#hd-lit)"/>

            {/* duna à direita */}
            <path d="M300,341 C312,290 345,225 372,193 C390,194 391,214 372,224 C358,236 378,250 388,262 C395,290 420,320 495,341 Z" fill="url(#hd-darkR)"/>
            <path d="M374,197 C420,220 470,255 495,270 L495,341 C450,325 405,300 390,268 C380,248 360,235 372,224 C391,214 392,197 374,197 Z" fill="url(#hd-lit)"/>

            <path d="M0,326 C150,336 350,336 495,320 L495,341 L0,341 Z" fill="#5B3673" opacity=".85"/>
        </svg>
    );
}

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

    const cardRef = useFadeIn();

    /* helpers */
    const trocarAba = a => { setAba(a); setErrLogin(null); setErrCad(null); setErrAlt(null); setOkCad(false); setOkAlt(false); };

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
            const map = { ADMIN:"/admin", PASTOR:"/pastor", LIDER_CELULA:"/lider", TESOUREIRO:"/tesouraria", SECRETARIO:"/secretaria", DIACONO:"/diacono" };
            if (map[p]) {
                sessionStorage.setItem("boas_vindas_pendente", "1");
                navigate(map[p]);
            }
            else setErrLogin({ tipo:"geral", titulo:"Perfil não autorizado", msg:`Perfil "${p}" sem acesso. Contate o administrador.` });
        } catch(err) {
            const st = err?.response?.status;
            const bd = err?.response?.data;
            if (st===429) { setErrLogin({ tipo:"limite", titulo:"Acesso bloqueado temporariamente", msg:bd?.mensagem??"Aguarde alguns minutos antes de tentar novamente." }); }
            else if (st===403 && bd?.erro) {
                /* Conta suspensa/desativada — backend retorna { erro, mensagem } */
                setErrLogin({ tipo:"suspensa", titulo:bd.erro, msg:bd?.mensagem??"Sua conta foi suspensa por ficar 2 semanas sem acesso. Entre em contato com o administrador para reativá-la." });
            }
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

    /* ── tokens de tema (claro = template original; escuro = painel roxo-noite) ── */
    const vars = dark ? {
        "--panel":"#1F1435", "--title":"#FFFFFF", "--text":"rgba(255,255,255,.80)", "--sub":"rgba(255,255,255,.62)",
        "--link":P.pink, "--notice":"rgba(255,255,255,.07)", "--notice-b":"rgba(255,255,255,.16)",
        "--track":"rgba(255,255,255,.16)", "--switch-off":"rgba(255,255,255,.28)", "--switch-on":P.plum,
        "--err":"#FF8F90", "--warn":"#E3B865", "--chip":"rgba(245,152,173,.16)", "--chip-b":"rgba(245,152,173,.45)",
    } : {
        "--panel":"#F1F1F3", "--title":P.ink, "--text":"#4A3568", "--sub":"rgba(32,10,63,.62)",
        "--link":P.plum, "--notice":"rgba(131,77,135,.08)", "--notice-b":"rgba(131,77,135,.24)",
        "--track":"rgba(32,10,63,.12)", "--switch-off":"rgba(88,53,117,.30)", "--switch-on":P.plumDeep,
        "--err":P.red, "--warn":"#8A6516", "--chip":"rgba(245,152,173,.22)", "--chip-b":"rgba(131,77,135,.4)",
    };

    const titulos = { login:"Entrar", cadastro:"Solicitar acesso", alterar:"Alterar dados" };
    const temErro = errLogin || errCad || errAlt;

    return (
        <>
            <Helmet>
                <title>IEQ Gestão — Acesso ao Sistema</title>
                <meta name="description" content="Portal administrativo da Igreja do Evangelho Quadrangular de Pituaçu."/>
            </Helmet>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

        .ieq-login-root, .ieq-login-root *, .ieq-login-root *::before, .ieq-login-root *::after { box-sizing:border-box; }
        :where(.ieq-login-root, .ieq-login-root *) { margin:0; padding:0; }
        .ieq-login-root {
          font-family:'Montserrat',system-ui,sans-serif;
          min-height:100vh; position:relative; overflow-x:hidden;
          color:var(--text); background:#442B6C;
        }
        .ieq-login-root button, .ieq-login-root input { font-family:inherit; }

        /* ── cenário de fundo ── */
        .scene { position:fixed; inset:0; width:100%; height:100%; z-index:0; display:block; }
        .twinkle { animation:twinkle 5s ease-in-out infinite alternate; }
        @keyframes twinkle { from{opacity:.65} to{opacity:1} }

        .login-stage {
          position:relative; z-index:2; min-height:100vh;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:18px; padding:32px 16px 24px;
        }

        /* ── botão de tema ── */
        .theme-btn {
          position:fixed; top:18px; right:18px; z-index:50;
          width:42px; height:42px; border-radius:50%; cursor:pointer;
          display:grid; place-items:center; color:#fff;
          background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.35);
          backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
          transition:background .2s;
        }
        .theme-btn:hover { background:rgba(255,255,255,.28); }
        .theme-btn:focus-visible { outline:2px solid #fff; outline-offset:2px; }

        /* ── cartão vertical ── */
        .login-card {
          width:100%; max-width:420px; overflow:hidden;
          background:var(--panel); border-radius:4px;
          box-shadow:0 34px 80px rgba(22,8,48,.55), 0 10px 26px rgba(22,8,48,.30);
          opacity:0; transform:translateY(24px);
          transition:opacity .7s ease, transform .7s ease, background .3s;
        }
        .card-hero { position:relative; height:300px; }
        .card-hero > svg { position:absolute; inset:0; width:100%; height:100%; display:block; }
        .hero-content {
          position:absolute; top:0; left:0; right:0; padding:18px 20px 0;
          display:flex; flex-direction:column; align-items:center; text-align:center; color:#fff;
        }
        .logo-ring {
          width:56px; height:56px; border-radius:50%; display:grid; place-items:center;
          background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.45);
          backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
        }
        .hero-content h1 {
          margin-top:12px; font-size:21px; font-weight:700; line-height:1.18; letter-spacing:-.01em;
          text-shadow:0 2px 14px rgba(20,8,45,.55);
        }
        .hero-content p {
          margin-top:8px; font-size:11.5px; font-weight:500; letter-spacing:.04em; opacity:.88;
          text-shadow:0 1px 8px rgba(20,8,45,.5);
        }

        .card-body { padding:26px 34px 22px; }
        .card-title { font-size:27px; font-weight:800; letter-spacing:-.015em; color:var(--title); margin-bottom:18px; }
        .form-col { display:flex; flex-direction:column; gap:15px; }

        /* ── campos em pílula rosa ── */
        .fld-label { display:block; margin-bottom:6px; padding-left:4px; font-size:12px; font-weight:600; letter-spacing:.02em; color:var(--text); }
        .fld-wrap { position:relative; }
        .fld-icon { position:absolute; left:17px; top:50%; transform:translateY(-50%); color:#fff; pointer-events:none; }
        .ieq-input {
          width:100%; height:46px; padding:0 48px 0 46px;
          background:${P.pink}; color:#3A1160;
          border:2px solid transparent; border-radius:999px; outline:none;
          font-size:13.5px; font-weight:600; letter-spacing:.02em;
          transition:box-shadow .2s, background .2s, border-color .2s;
        }
        .ieq-input::placeholder { color:rgba(255,255,255,.96); font-weight:500; letter-spacing:.04em; }
        .ieq-input:focus { background:#F7A3B6; box-shadow:0 0 0 3px rgba(131,77,135,.42); }
        .ieq-input.error { border-color:${P.red}; }
        .ieq-input:-webkit-autofill,
        .ieq-input:-webkit-autofill:focus {
          -webkit-box-shadow:0 0 0 100px ${P.pink} inset; -webkit-text-fill-color:#3A1160;
        }
        .eye {
          position:absolute; right:8px; top:50%; transform:translateY(-50%);
          width:34px; height:34px; border-radius:50%; border:none; background:transparent;
          color:${P.plumDark}; cursor:pointer; display:grid; place-items:center; transition:background .2s;
        }
        .eye:hover { background:rgba(255,255,255,.38); }
        .eye:focus-visible { outline:2px solid ${P.plum}; }

        /* ── botão principal (roxo, reto como no template) ── */
        .btn-primary {
          width:100%; height:46px; border:none; border-radius:6px;
          background:${P.plum}; color:#fff; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          font-size:13px; font-weight:700; letter-spacing:.08em;
          transition:background .2s, transform .2s, box-shadow .2s;
        }
        .btn-primary:hover:not(:disabled) { background:${P.plumDark}; transform:translateY(-1px); box-shadow:0 8px 20px rgba(131,77,135,.42); }
        .btn-primary:focus-visible { outline:3px solid ${P.pink}; outline-offset:2px; }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; }

        .btn-ghost {
          background:none; border:1.5px solid ${P.plum}; color:var(--link); border-radius:6px;
          padding:10px 24px; cursor:pointer; font-size:12.5px; font-weight:700; letter-spacing:.05em;
          transition:background .2s;
        }
        .btn-ghost:hover { background:var(--chip); }
        .btn-ghost:focus-visible { outline:2px solid ${P.plum}; outline-offset:2px; }

        /* ── links e interruptor ── */
        .row-between { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-top:2px; }
        .link {
          background:none; border:none; cursor:pointer; padding:4px 2px;
          font-size:12px; font-weight:600; letter-spacing:.02em; color:var(--link);
          display:inline-flex; align-items:center; gap:6px;
        }
        .link:hover { text-decoration:underline; }
        .link:focus-visible { outline:2px solid ${P.plum}; outline-offset:2px; border-radius:3px; }
        .link-strong { font-size:13.5px; font-weight:800; color:var(--title); }
        .card-links { margin-top:14px; display:flex; justify-content:center; }

        .switch {
          display:inline-flex; align-items:center; gap:9px; background:none; border:none; cursor:pointer;
          padding:4px 0; font-size:12px; font-weight:600; color:var(--text);
        }
        .switch-track { width:36px; height:20px; border-radius:999px; background:var(--switch-off); position:relative; transition:background .2s; }
        .switch-thumb { position:absolute; top:3px; left:3px; width:14px; height:14px; border-radius:50%; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.3); transition:transform .2s; }
        .switch[aria-checked="true"] .switch-track { background:var(--switch-on); }
        .switch[aria-checked="true"] .switch-thumb { transform:translateX(16px); }
        .switch:focus-visible { outline:2px solid ${P.plum}; outline-offset:2px; border-radius:6px; }

        /* ── avisos, erros e sucesso ── */
        .notice {
          display:flex; gap:9px; align-items:flex-start; margin-bottom:18px; padding:11px 13px; border-radius:8px;
          background:var(--notice); border:1px solid var(--notice-b);
          font-size:12.5px; line-height:1.55; color:var(--text);
        }
        .notice svg { flex-shrink:0; margin-top:2px; color:var(--link); }
        .notice strong { color:var(--title); }

        .err-box { display:flex; gap:10px; align-items:flex-start; padding:12px 14px; border-radius:8px; animation:slideDown .28s ease both; }
        .err-bad  { background:rgba(158,42,43,.09);  border:1px solid rgba(158,42,43,.38); --tone:var(--err); }
        .err-warn { background:rgba(184,137,46,.14); border:1px solid rgba(184,137,46,.45); --tone:var(--warn); }
        .err-ico { color:var(--tone); flex-shrink:0; margin-top:1px; }
        .err-title { font-size:12px; font-weight:700; color:var(--tone); letter-spacing:.02em; margin-bottom:3px; }
        .err-msg { font-size:12.5px; line-height:1.55; color:var(--text); }
        @keyframes slideDown { from{opacity:0;transform:translateY(-7px)} to{opacity:1;transform:translateY(0)} }

        .success {
          text-align:center; padding:26px 20px; border-radius:10px;
          background:var(--chip); border:1px solid var(--chip-b);
        }
        .success h3 { font-size:18px; font-weight:800; color:var(--title); margin:12px 0 8px; }
        .success p  { font-size:13px; line-height:1.6; color:var(--text); margin-bottom:18px; }

        /* ── escolha do que alterar ── */
        .check-row {
          display:flex; align-items:center; gap:10px; width:100%; text-align:left;
          padding:11px 14px; border-radius:999px; cursor:pointer;
          background:transparent; border:1.5px solid var(--chip-b); color:var(--text);
          font-size:12.5px; font-weight:600; transition:background .2s, border-color .2s;
        }
        .check-row[aria-checked="true"] { background:var(--chip); border-color:${P.plum}; color:var(--title); }
        .check-row:focus-visible { outline:2px solid ${P.plum}; outline-offset:2px; }
        .check-box {
          width:18px; height:18px; border-radius:50%; flex-shrink:0; display:grid; place-items:center;
          border:2px solid var(--chip-b); transition:all .2s;
        }
        .check-row[aria-checked="true"] .check-box { background:${P.plum}; border-color:${P.plum}; }
        .divider { display:flex; align-items:center; gap:12px; margin:4px 0 14px; font-size:11.5px; font-weight:700; color:var(--sub); white-space:nowrap; }
        .divider::before, .divider::after { content:""; flex:1; height:1px; background:var(--track); }

        .forca-bar { flex:1; height:4px; border-radius:2px; transition:background .25s; }

        .tab-content { animation:tabIn .28s ease both; }
        .pop-in { animation:popIn .42s cubic-bezier(.16,1,.3,1) both; }
        .shake  { animation:shakeX .4s ease both; }
        .spin   { animation:spin 1s linear infinite; }
        @keyframes tabIn  { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes popIn  { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes spin   { to{transform:rotate(360deg)} }

        /* ── rodapé (inclui o crédito exigido pela licença gratuita do template) ── */
        .login-foot {
          text-align:center; font-size:11px; line-height:1.7; color:rgba(255,255,255,.92);
          padding:7px 18px; border-radius:16px;
          background:rgba(32,10,63,.5); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
        }
        .login-foot a { color:#fff; font-weight:600; text-decoration:underline; text-underline-offset:2px; }

        @media (max-width:520px) {
          .login-stage { padding-top:70px; }
          .card-body { padding:24px 22px 20px; }
          .card-hero { height:280px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ieq-login-root *, .ieq-login-root *::before, .ieq-login-root *::after { animation:none !important; transition:none !important; }
        }
      `}</style>

            <div className="ieq-login-root" style={vars}>
                <SceneBackground dark={dark}/>

                <button className="theme-btn" onClick={toggleTheme} aria-label="Alternar tema">
                    {dark ? <Sun size={19}/> : <Moon size={19}/>}
                </button>

                <main className="login-stage">
                    {/* ════════ CARTÃO ════════ */}
                    <div className={`login-card${temErro ? " shake" : ""}`} ref={cardRef}>

                        {/* ── topo ilustrado ── */}
                        <header className="card-hero">
                            <CardArt/>
                            <div className="hero-content">
                                <div className="logo-ring"><IEQCross size={40}/></div>
                                <h1>Sua Igreja,<br/>Bem Administrada.</h1>
                                <p>Portal Administrativo · IEQ Pituaçu</p>
                            </div>
                        </header>

                        <section className="card-body">
                            <h2 className="card-title">{titulos[aba]}</h2>

                            {/* ════ LOGIN ════ */}
                            {aba === "login" && (
                                <div className="tab-content">
                                    <form onSubmit={handleLogin} className="form-col">
                                        <Field id="l-email" label="E-mail" icon={Mail}>
                                            <input id="l-email" className={`ieq-input${errLogin?.tipo==="senha"?" error":""}`}
                                                   type="email" placeholder="usuario@ieq.com"
                                                   value={email} onChange={e=>{setEmail(e.target.value);if(errLogin)setErrLogin(null);}}
                                                   required autoComplete="email"/>
                                        </Field>

                                        <Field id="l-senha" label="Senha" icon={Lock}>
                                            <input id="l-senha" className={`ieq-input${errLogin?.tipo==="senha"?" error":""}`}
                                                   type={showPass?"text":"password"} placeholder="••••••••"
                                                   value={pass} onChange={e=>{setPass(e.target.value);if(errLogin)setErrLogin(null);}}
                                                   required autoComplete="current-password"/>
                                        </Field>

                                        <div className="row-between">
                                            <button type="button" className="switch" role="switch"
                                                    aria-checked={showPass} onClick={()=>setShowPass(!showPass)}>
                                                <span className="switch-track"><span className="switch-thumb"/></span>
                                                Mostrar senha
                                            </button>
                                            <button type="button" className="link" onClick={()=>trocarAba("alterar")}>
                                                Alterar e-mail ou senha
                                            </button>
                                        </div>

                                        <ErrBox e={errLogin}/>

                                        <button type="submit" className="btn-primary" disabled={loadLogin}>
                                            {loadLogin ? <><Loader2 size={16} className="spin"/> Verificando...</> : "Acessar sistema"}
                                        </button>
                                    </form>

                                    <div className="card-links">
                                        <button type="button" className="link link-strong" onClick={()=>trocarAba("cadastro")}>
                                            Solicitar acesso
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ════ SOLICITAR ACESSO ════ */}
                            {aba === "cadastro" && (
                                <div className="tab-content">
                                    <div className="notice">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                        <p>Exclusivo para <strong>líderes de célula</strong>. Após o envio, aguarde a aprovação do administrador para acessar o sistema.</p>
                                    </div>

                                    {okCad ? (
                                        <div className="pop-in success">
                                            <CheckCircle2 size={42} color="#3E9B5F" strokeWidth={1.6}/>
                                            <h3>Solicitação enviada!</h3>
                                            <p>Sua solicitação foi recebida. O administrador irá analisar e liberar seu acesso em breve.</p>
                                            <button type="button" className="btn-ghost" onClick={()=>trocarAba("login")}>Ir para o login</button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleCad} className="form-col">
                                            <Field id="c-nome" label="Nome completo" icon={User}>
                                                <input id="c-nome" className="ieq-input" type="text" placeholder="Seu nome completo"
                                                       value={cNome} onChange={e=>{setCNome(e.target.value);if(errCad)setErrCad(null);}}
                                                       required autoComplete="name"/>
                                            </Field>

                                            <Field id="c-email" label="E-mail" icon={Mail}>
                                                <input id="c-email" className="ieq-input" type="email" placeholder="seu@email.com"
                                                       value={cEmail} onChange={e=>{setCEmail(e.target.value);if(errCad)setErrCad(null);}}
                                                       required autoComplete="email"/>
                                            </Field>

                                            <div>
                                                <Field id="c-senha" label="Senha" icon={Lock}>
                                                    <input id="c-senha" className={`ieq-input${errCad?.tipo==="senha"?" error":""}`}
                                                           type={showCP?"text":"password"} placeholder="Mínimo 6 caracteres"
                                                           value={cSenha} onChange={e=>{setCSenha(e.target.value);if(errCad)setErrCad(null);}}
                                                           required autoComplete="new-password"/>
                                                    <EyeBtn show={showCP} onClick={()=>setShowCP(!showCP)}/>
                                                </Field>
                                                <Forca senha={cSenha}/>
                                            </div>

                                            <div>
                                                <Field id="c-conf" label="Confirmar senha" icon={Lock}>
                                                    <input id="c-conf" className={`ieq-input${cConf.length>0&&cSenha!==cConf?" error":""}`}
                                                           type={showCP?"text":"password"} placeholder="Repita a senha"
                                                           value={cConf} onChange={e=>{setCConf(e.target.value);if(errCad)setErrCad(null);}}
                                                           required autoComplete="new-password"/>
                                                </Field>
                                                <Confere a={cSenha} b={cConf}/>
                                            </div>

                                            <ErrBox e={errCad}/>

                                            <button type="submit" className="btn-primary" disabled={loadCad}>
                                                {loadCad ? <><Loader2 size={16} className="spin"/> Enviando...</> : "Enviar solicitação"}
                                            </button>
                                        </form>
                                    )}

                                    <div className="card-links">
                                        <button type="button" className="link" onClick={()=>trocarAba("login")}>
                                            <ArrowLeft size={14}/> Voltar ao login
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ════ ALTERAR DADOS ════ */}
                            {aba === "alterar" && (
                                <div className="tab-content">
                                    <div className="notice">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                        <p>As alterações ficam <strong>pendentes de aprovação</strong> do administrador antes de serem aplicadas.</p>
                                    </div>

                                    {okAlt ? (
                                        <div className="pop-in success">
                                            <ShieldCheck size={42} color="#3E9B5F" strokeWidth={1.6}/>
                                            <h3>Solicitação enviada!</h3>
                                            <p>O administrador irá analisar e aplicar as mudanças em breve.</p>
                                            <button type="button" className="btn-ghost" onClick={()=>trocarAba("login")}>Ir para o login</button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleAlt} className="form-col">
                                            <Field id="a-email" label="Seu e-mail" icon={Mail} required>
                                                <input id="a-email"
                                                       className={`ieq-input${errAlt&&(errAlt.titulo==="E-mail obrigatório"||errAlt.titulo==="E-mail não encontrado")?" error":""}`}
                                                       type="email" placeholder="seu@email.com"
                                                       value={aEmail} onChange={e=>{setAEmail(e.target.value);if(errAlt)setErrAlt(null);}}
                                                       required autoComplete="email"/>
                                            </Field>

                                            <Field id="a-atual" label="Senha atual" icon={Lock} required>
                                                <input id="a-atual" className={`ieq-input${errAlt?.tipo==="senha"?" error":""}`}
                                                       type={showAA?"text":"password"} placeholder="Confirme sua identidade"
                                                       value={aAtual} onChange={e=>{setAAtual(e.target.value);if(errAlt)setErrAlt(null);}}
                                                       required autoComplete="current-password"/>
                                                <EyeBtn show={showAA} onClick={()=>setShowAA(!showAA)}/>
                                            </Field>

                                            <div className="divider">O que deseja alterar?</div>

                                            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                                                {[
                                                    { key:"email", label:"Alterar e-mail", state:altEmail, set:setAltEmail, Icon:Mail },
                                                    { key:"senha", label:"Alterar senha",  state:altSenha, set:setAltSenha, Icon:Lock },
                                                ].map(({ key, label, state, set, Icon }) => (
                                                    <button key={key} type="button" role="checkbox" aria-checked={state}
                                                            className="check-row"
                                                            onClick={()=>{set(!state);setErrAlt(null);}}>
                                                        <span className="check-box">
                                                            {state && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                                                        </span>
                                                        <Icon size={14} style={{ flexShrink:0 }}/>
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>

                                            {altEmail && (
                                                <div style={{ animation:"slideDown .25s ease both" }}>
                                                    <Field id="a-novo-email" label="Novo e-mail" icon={Mail}>
                                                        <input id="a-novo-email" className="ieq-input" type="email" placeholder="novo@email.com"
                                                               value={aEmailN} onChange={e=>{setAEmailN(e.target.value);if(errAlt)setErrAlt(null);}}
                                                               autoComplete="email"/>
                                                    </Field>
                                                </div>
                                            )}

                                            {altSenha && (
                                                <div style={{ display:"flex", flexDirection:"column", gap:15, animation:"slideDown .25s ease both" }}>
                                                    <div>
                                                        <Field id="a-nova" label="Nova senha" icon={Lock}>
                                                            <input id="a-nova" className="ieq-input" type={showAN?"text":"password"} placeholder="Mínimo 6 caracteres"
                                                                   value={aNova} onChange={e=>{setANova(e.target.value);if(errAlt)setErrAlt(null);}}
                                                                   autoComplete="new-password"/>
                                                            <EyeBtn show={showAN} onClick={()=>setShowAN(!showAN)}/>
                                                        </Field>
                                                        <Forca senha={aNova}/>
                                                    </div>
                                                    <div>
                                                        <Field id="a-conf" label="Confirmar nova senha" icon={Lock}>
                                                            <input id="a-conf" className={`ieq-input${aConf.length>0&&aNova!==aConf?" error":""}`}
                                                                   type={showAC?"text":"password"} placeholder="Repita a nova senha"
                                                                   value={aConf} onChange={e=>{setAConf(e.target.value);if(errAlt)setErrAlt(null);}}
                                                                   autoComplete="new-password"/>
                                                            <EyeBtn show={showAC} onClick={()=>setShowAC(!showAC)}/>
                                                        </Field>
                                                        <Confere a={aNova} b={aConf}/>
                                                    </div>
                                                </div>
                                            )}

                                            <ErrBox e={errAlt}/>

                                            <button type="submit" className="btn-primary" disabled={loadAlt||(!altEmail&&!altSenha)}>
                                                {loadAlt
                                                    ? <><Loader2 size={16} className="spin"/> Enviando...</>
                                                    : <><CheckCircle2 size={15}/> Enviar solicitação</>}
                                            </button>
                                        </form>
                                    )}

                                    <div className="card-links">
                                        <button type="button" className="link" onClick={()=>trocarAba("login")}>
                                            <ArrowLeft size={14}/> Voltar ao login
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* ── rodapé ── */}
                    <p className="login-foot">
                        © {new Date().getFullYear()} IEQ Pituaçu · Sistema Eclesiástico
                        {" · "}
                        <a href="http://www.freepik.com" target="_blank" rel="noopener noreferrer">Designed by Freepik</a>
                    </p>
                </main>
            </div>
        </>
    );
}
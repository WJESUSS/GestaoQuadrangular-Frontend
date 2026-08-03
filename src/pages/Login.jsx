import { Helmet }        from "react-helmet-async";
import { useNavigate }   from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { jwtDecode }     from "jwt-decode";
import { Loader2, Lock, Mail, Sun, Moon, User, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth }       from "../auth/AuthContext";
import { useTheme }      from "../context/ThemeContext";
import api               from "../services/api.js";

/* ─── Paleta AURA (DashboardLider) ─── */
const BRAND = {
    moss:"#1E3F66", mossDeep:"#12283F", mossLight:"#4C7EB0",
    dark:"#12131C", stone:"#1A2236",
    light:"#F3F1EA", muted:"#8B93A0",
    gold:"#B8892E", goldLight:"#D9AE5E",
    red:"#9E2A2B", redDark:"#6E1D1E",
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

/* ─── Cena animada de fundo (céu, nuvens, pássaros, vaga-lumes, folhas, igreja com sino) ───
   Cores calculadas a partir da paleta CÉLULA, ajustadas para tema claro/escuro. */
function AnimatedScene({ dark }) {
    const layerRef = useRef(null);
    const spawnedRef = useRef(false);

    const c = dark ? {
        skyTop:"#080A14", skyBot:"#0D1220", skyGround:"#0A0E1A",
        hillBack:"#0e1f2a", hillFront:"#0c1a24", trunk:"#3d2c1e",
        foliage1:"#1a3a4a", foliage2:"#122a3a",
        churchWall:"#e0d9c8", churchRoof:"#3d2e20", churchTrim:"#221a10",
        churchDoor:"#221a10", churchOpen:"#151008",
        sunMoon:"radial-gradient(circle at 35% 30%, #e8ecff, #b8c8e8 50%, #7d9a86)",
        sunMoonGlow:"0 0 60px 20px rgba(76,126,176,0.25)",
        birdColor: BRAND.light,
        fireflyOn:true,
    } : {
        skyTop:"#a8ccee", skyBot:"#d8e8f6", skyGround:"#c8dcec",
        hillBack:"#9CC4A0", hillFront:"#6FA377", trunk:"#6e4628",
        foliage1:"#2E6B44", foliage2:"#1F4A2E",
        churchWall:"#f5efe0", churchRoof:"#5e4028", churchTrim:"#3e2a1a",
        churchDoor:"#3e2a1a", churchOpen:"#221810",
        sunMoon:`radial-gradient(circle at 35% 30%, #fff8e0, ${BRAND.goldLight} 55%, ${BRAND.gold})`,
        sunMoonGlow:"0 0 70px 25px rgba(184,137,46,0.4)",
        birdColor: BRAND.dark,
        fireflyOn:false,
    };
    const bellColor = BRAND.gold;
    const glassWarm = BRAND.goldLight;
    const glassCool = BRAND.mossLight;

    useEffect(() => {
        const layer = layerRef.current;
        if (!layer || spawnedRef.current) return;
        spawnedRef.current = true;
        const rand = (min, max) => Math.random() * (max - min) + min;

        const cloudSVG = (w) => `
            <svg viewBox="0 0 200 90" width="${w}" height="${w * 0.45}">
              <ellipse cx="60" cy="55" rx="55" ry="30" fill="rgba(255,255,255,0.85)"></ellipse>
              <ellipse cx="115" cy="40" rx="45" ry="34" fill="rgba(255,255,255,0.85)"></ellipse>
              <ellipse cx="150" cy="58" rx="40" ry="24" fill="rgba(255,255,255,0.85)"></ellipse>
            </svg>`;
        for (let i = 0; i < 5; i++) {
            const el = document.createElement("div");
            el.className = "scn-cloud";
            const w = rand(120, 260);
            el.style.width = w + "px";
            el.style.top = rand(4, 34) + "%";
            el.style.left = rand(-25, -5) + "%";
            el.style.animationDuration = rand(45, 90) + "s";
            el.style.animationDelay = "-" + rand(0, 70) + "s";
            el.innerHTML = cloudSVG(w);
            layer.appendChild(el);
        }

        const birdSVG = `<svg viewBox="0 0 40 20" width="26" height="13">
            <path d="M0,10 Q10,-4 20,10 Q30,-4 40,10 Q30,4 20,10 Q10,4 0,10 Z" fill="${c.birdColor}" opacity="0.55"></path>
          </svg>`;
        for (let i = 0; i < 4; i++) {
            const el = document.createElement("div");
            el.className = "scn-bird";
            el.style.top = rand(10, 30) + "%";
            el.style.left = "0";
            el.style.animationDuration = rand(14, 24) + "s";
            el.style.animationDelay = "-" + rand(0, 18) + "s";
            el.innerHTML = birdSVG;
            layer.appendChild(el);
        }

        const leafGlyphs = ["✦", "✧"];
        for (let i = 0; i < 10; i++) {
            const el = document.createElement("div");
            el.className = "scn-leaf";
            el.textContent = leafGlyphs[i % 2];
            el.style.color = BRAND.mossLight;
            el.style.left = rand(0, 100) + "%";
            el.style.fontSize = rand(11, 18) + "px";
            el.style.animationDuration = rand(13, 24) + "s";
            el.style.animationDelay = "-" + rand(0, 20) + "s";
            layer.appendChild(el);
        }

        if (c.fireflyOn) {
            for (let i = 0; i < 20; i++) {
                const el = document.createElement("div");
                const size = rand(2, 4);
                el.className = "scn-firefly";
                el.style.width = size + "px";
                el.style.height = size + "px";
                el.style.background = BRAND.gold;
                el.style.boxShadow = `0 0 10px 3px ${BRAND.gold}`;
                el.style.left = rand(5, 95) + "%";
                el.style.bottom = rand(2, 30) + "%";
                el.style.animationDuration = rand(4, 8) + "s";
                el.style.animationDelay = "-" + rand(0, 8) + "s";
                layer.appendChild(el);
            }
        }

        let targetX = 0, targetY = 0, curX = 0, curY = 0, raf;
        const onMove = (e) => {
            targetX = (e.clientX / window.innerWidth - 0.5) * 22;
            targetY = (e.clientY / window.innerHeight - 0.5) * 22;
        };
        window.addEventListener("mousemove", onMove);
        const tick = () => {
            curX += (targetX - curX) * 0.06;
            curY += (targetY - curY) * 0.06;
            layer.style.transform = `translate(${curX}px, ${curY}px)`;
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(raf);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="scene" style={{ background:"transparent" }}>
            <div className="sun-moon" style={{ background:c.sunMoon, boxShadow:c.sunMoonGlow }} />
            <div className="parallax-layer" ref={layerRef} />

            <svg className="hills-back" viewBox="0 0 1440 260" preserveAspectRatio="none">
                <path d="M0,120 C240,40 420,180 720,90 C1020,10 1200,150 1440,80 L1440,260 L0,260 Z" fill={c.hillBack}/>
            </svg>
            <svg className="hills-front" viewBox="0 0 1440 220" preserveAspectRatio="none">
                <path d="M0,140 C260,80 480,190 760,110 C1040,30 1260,170 1440,110 L1440,220 L0,220 Z" fill={c.hillFront}/>
            </svg>

            <div className="scn-church">
                <svg viewBox="0 0 340 320" width="100%">
                    <rect x="140" y="30" width="60" height="110" fill={c.churchWall}/>
                    <polygon points="140,30 170,0 200,30" fill={c.churchRoof}/>
                    <line x1="170" y1="0" x2="170" y2="-26" stroke={c.churchRoof} strokeWidth="5"/>
                    <line x1="160" y1="-16" x2="180" y2="-16" stroke={c.churchRoof} strokeWidth="5"/>
                    <path d="M158,55 Q158,38 170,38 Q182,38 182,55 L182,80 L158,80 Z" fill={c.churchOpen}/>
                    <g className="scn-bell">
                        <path d="M164,52 Q164,44 170,44 Q176,44 176,52 L178,66 L162,66 Z" fill={bellColor}/>
                        <circle cx="170" cy="68" r="2.5" fill={bellColor}/>
                    </g>
                    <rect x="60" y="140" width="220" height="150" fill={c.churchWall}/>
                    <polygon points="60,140 170,90 280,140" fill={c.churchRoof}/>
                    <circle className="scn-glow-window" cx="170" cy="175" r="26" fill={glassWarm}/>
                    <circle cx="170" cy="175" r="26" fill="none" stroke={c.churchTrim} strokeWidth="3"/>
                    <path className="scn-glow-window" d="M95,225 Q95,205 105,205 Q115,205 115,225 L115,260 L95,260 Z" fill={glassCool}/>
                    <path d="M95,225 Q95,205 105,205 Q115,205 115,225 L115,260 L95,260 Z" fill="none" stroke={c.churchTrim} strokeWidth="2.5"/>
                    <path className="scn-glow-window" d="M225,225 Q225,205 235,205 Q245,205 245,225 L245,260 L225,260 Z" fill={glassCool}/>
                    <path d="M225,225 Q225,205 235,205 Q245,205 245,225 L245,260 L225,260 Z" fill="none" stroke={c.churchTrim} strokeWidth="2.5"/>
                    <path d="M148,290 Q148,255 170,255 Q192,255 192,290 Z" fill={c.churchDoor}/>
                    <line x1="170" y1="255" x2="170" y2="290" stroke={c.churchTrim} strokeWidth="2"/>
                    <rect x="130" y="290" width="80" height="8" fill={c.churchTrim}/>
                    <rect x="120" y="298" width="100" height="8" fill={c.churchTrim}/>
                </svg>
            </div>

            <div className="scn-tree scn-tree-left">
                <svg viewBox="0 0 70 160" width="100%" height="100%">
                    <rect x="30" y="90" width="10" height="70" fill={c.trunk}/>
                    <g className="scn-foliage">
                        <circle cx="35" cy="55" r="38" fill={c.foliage1}/>
                        <circle cx="14" cy="75" r="24" fill={c.foliage2}/>
                        <circle cx="56" cy="75" r="24" fill={c.foliage2}/>
                    </g>
                </svg>
            </div>
            <div className="scn-tree scn-tree-right">
                <svg viewBox="0 0 70 160" width="100%" height="100%">
                    <rect x="30" y="95" width="10" height="65" fill={c.trunk}/>
                    <g className="scn-foliage">
                        <circle cx="35" cy="60" r="32" fill={c.foliage1}/>
                        <circle cx="16" cy="78" r="20" fill={c.foliage2}/>
                        <circle cx="54" cy="78" r="20" fill={c.foliage2}/>
                    </g>
                </svg>
            </div>
        </div>
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

/* ─── Cálculo de força de senha ─── */
const calcForca   = s => s.length < 6 ? 1 : s.length < 8 ? 2 : /[A-Z]/.test(s) && /[0-9]/.test(s) ? 4 : 3;
const forcaLabel  = ["","Muito curta","Fraca","Média","Forte"];
const forcaColor  = ["",BRAND.red,BRAND.gold,"#22c55e",BRAND.moss];

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

    const errBg     = e => e?.tipo==="limite" ? "rgba(184,137,46,.12)" : "rgba(158,42,43,.12)";
    const errBorder = e => e?.tipo==="limite" ? "rgba(184,137,46,.4)" : "rgba(158,42,43,.4)";
    const errColor  = e => e?.tipo==="limite" ? BRAND.gold : BRAND.red;

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

    /* ── Cores base (mesmas da Home) ── */
    const bg    = dark ? BRAND.dark  : BRAND.light;
    /* ── card mais transparente ── */
    const cardBg= dark ? "rgba(26,34,54,.35)" : "rgba(255,255,255,.22)";
    const txt   = dark ? BRAND.light : BRAND.dark;
    const sub   = dark ? "rgba(243,241,234,.5)" : "rgba(27,35,51,.45)";
    const border= dark ? "rgba(30,63,102,.12)" : "rgba(30,63,102,.10)";

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
                <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
            </Helmet>

            <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        /* ── font base ── */
        .ieq-login-root {
          font-family:'Inter',sans-serif;
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          overflow:hidden;
          position:relative;
          transition:background .4s;
        }

        /* ── cena animada de fundo (céu, igreja, natureza) ── */
        .scene{ position:fixed; inset:0; z-index:0; overflow:hidden; transition:background .4s; }
        .parallax-layer{ position:absolute; inset:0; transition:transform .25s ease-out; }

        .sun-moon{
          position:absolute; top:6%; left:50%; width:120px; height:120px; border-radius:50%;
          animation:scnFloaty 7s ease-in-out infinite;
          transition:opacity .5s, background .5s, box-shadow .5s;
          filter:blur(1px);
        }
        @keyframes scnFloaty{ 0%,100%{ transform:translateY(0) rotate(0deg);} 50%{ transform:translateY(-6px) rotate(3deg);} }

        .scn-cloud{ position:absolute; opacity:.9; animation:scnDrift linear infinite; }
        @keyframes scnDrift{ from{ transform:translateX(-15vw);} to{ transform:translateX(115vw);} }

        .scn-bird{ position:absolute; animation:scnFly linear infinite; opacity:.7; }
        @keyframes scnFly{ from{ transform:translate(-10vw,0);} to{ transform:translate(115vw,-40px);} }
        .scn-bird svg{ animation:scnFlap .5s ease-in-out infinite; transform-origin:center; }
        @keyframes scnFlap{ 0%,100%{ transform:scaleY(1);} 50%{ transform:scaleY(0.55);} }

        .hills-back, .hills-front{ position:absolute; bottom:0; left:0; width:100%; }
        .hills-back{ height:26vh; }
        .hills-front{ height:19vh; }

        .scn-tree{ position:absolute; bottom:0; transform-origin:bottom center; animation:scnSway ease-in-out infinite; }
        @keyframes scnSway{ 0%,100%{ transform:rotate(-2deg);} 50%{ transform:rotate(2deg);} }
        .scn-foliage{ animation:scnRustle 3s ease-in-out infinite; transform-origin:center; }
        @keyframes scnRustle{ 0%,100%{ transform:scale(1);} 50%{ transform:scale(1.03);} }
        .scn-tree-left{ left:4%; height:13vh; width:60px; animation-duration:5s; }
        .scn-tree-right{ right:5%; height:10vh; width:48px; animation-duration:4.3s; animation-delay:-1.2s; }

        .scn-firefly{ position:absolute; border-radius:50%; opacity:0; animation:scnSpark linear infinite; }
        @keyframes scnSpark{
          0%{ transform:translateY(0) translateX(0); opacity:0; }
          15%{ opacity:.9; } 50%{ transform:translateY(-40px) translateX(10px); }
          85%{ opacity:.4; } 100%{ transform:translateY(-90px) translateX(-8px); opacity:0; }
        }

        .scn-leaf{ position:absolute; top:-40px; opacity:.55; animation:scnFall linear infinite; will-change:transform; }
        @keyframes scnFall{
          0%{ transform:translate(0,0) rotate(0deg); opacity:0; }
          8%{ opacity:.6; }
          100%{ transform:translate(60px,115vh) rotate(340deg); opacity:0; }
        }

        .scn-church{ position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:min(46vw, 340px); z-index:1; }
        .scn-church svg{ filter:drop-shadow(0 8px 18px rgba(0,0,0,0.3)); }
        .scn-bell{ transform-origin:170px 50px; animation:scnBellSwing 2.6s ease-in-out infinite; }
        @keyframes scnBellSwing{ 0%,100%{ transform:rotate(-6deg);} 50%{ transform:rotate(6deg);} }
        .scn-glow-window{ animation:scnWindowGlow 3.4s ease-in-out infinite; }
        @keyframes scnWindowGlow{ 0%,100%{ opacity:0.75;} 50%{ opacity:1; filter:drop-shadow(0 0 8px currentColor);} }

        /* ── glow azul central ── */
        /* ── noise grain ── */
        .noise-overlay {
          position:fixed; inset:0; z-index:1; pointer-events:none; opacity:.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-repeat:repeat; background-size:256px 256px;
        }

        /* ── glows ── */
        .glow-primary {
          position:fixed; top:50%; left:50%;
          transform:translate(-50%,-50%);
          width:800px; height:800px; border-radius:50%;
          background:radial-gradient(circle,rgba(30,63,102,.15) 0%,rgba(76,126,176,.08) 40%,transparent 70%);
          pointer-events:none; z-index:0;
          animation:glowPulse 6s ease-in-out infinite;
        }
        .glow-secondary {
          position:fixed; top:20%; right:5%;
          width:500px; height:500px; border-radius:50%;
          background:radial-gradient(circle,rgba(184,137,46,.1) 0%,rgba(184,137,46,.05) 30%,transparent 65%);
          pointer-events:none; z-index:0;
          animation:glowPulse 8s ease-in-out infinite reverse;
        }
        .glow-tertiary {
          position:fixed; bottom:-10%; left:-5%;
          width:600px; height:600px; border-radius:50%;
          background:radial-gradient(circle,rgba(76,126,176,.08) 0%,transparent 60%);
          pointer-events:none; z-index:0;
          animation:glowPulse 10s ease-in-out infinite;
        }
        @keyframes glowPulse {
          0%,100%{ opacity:.6; transform:translate(-50%,-50%) scale(1); }
          50%{ opacity:1; transform:translate(-50%,-50%) scale(1.08); }
        }
        .glow-secondary { animation-name:glowPulseAlt; }
        @keyframes glowPulseAlt {
          0%,100%{ opacity:.4; transform:scale(1); }
          50%{ opacity:.8; transform:scale(1.12); }
        }
        .glow-tertiary { animation-name:glowPulseT; }
        @keyframes glowPulseT {
          0%,100%{ opacity:.3; transform:scale(1); }
          50%{ opacity:.6; transform:scale(1.15); }
        }

        /* ── card principal ── */
        .login-card {
          position:relative; z-index:10;
          width:100%; max-width:480px;
          margin:24px;
          background:${cardBg};
          backdrop-filter:blur(16px) saturate(1.2);
          -webkit-backdrop-filter:blur(16px) saturate(1.2);
          border:1px solid rgba(255,255,255,.2);
          border-radius:16px;
          padding:44px 44px 36px;
          opacity:0; transform:translateY(28px);
          transition:opacity .7s ease, transform .7s ease,
                      background .4s, border-color .4s, box-shadow .4s;
          box-shadow:
            0 1px 2px rgba(0,0,0,.05),
            0 4px 8px rgba(0,0,0,.06),
            0 16px 32px rgba(0,0,0,.08),
            0 32px 64px rgba(0,0,0,.10),
            inset 0 1px 0 rgba(255,255,255,.15);
        }
        .login-card::before {
          content:""; position:absolute; inset:0; border-radius:16px; z-index:-1;
          background:linear-gradient(135deg, rgba(255,255,255,.12) 0%, transparent 50%, rgba(30,63,102,.06) 100%);
          pointer-events:none;
        }
        .login-card::after {
          content:""; position:absolute; inset:0; border-radius:16px; z-index:-1;
          padding:1px;
          background:linear-gradient(135deg, rgba(255,255,255,.25) 0%, transparent 40%, rgba(30,63,102,.10) 100%);
          -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;
          mask-composite:exclude;
          pointer-events:none;
        }

        /* ── tabs ── */
        .tabs-row {
          display:flex;
          background:rgba(255,255,255,.08);
          border-radius:8px;
          padding:3px;
          gap:3px;
          margin-bottom:28px;
        }
        .tab-btn {
          flex:1; padding:10px 6px; border:none; cursor:pointer;
          border-radius:6px;
          font-family:'Inter',sans-serif; font-size:9.5px;
          font-weight:700; letter-spacing:.13em; text-transform:uppercase;
          transition:all .25s;
        }
        .tab-btn.active {
          background:linear-gradient(135deg, ${BRAND.moss}, ${BRAND.mossDeep});
          color:#fff;
          box-shadow:0 3px 12px rgba(30,63,102,.35);
        }
        .tab-btn.inactive {
          background:transparent;
          color:rgba(255,255,255,.55);
        }
        .tab-btn.inactive:hover {
          background:${dark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)"};
          color:${BRAND.moss};
        }

        /* ── label ── */
        .fld-label {
          display:block; margin-bottom:6px;
          font-size:10px; font-weight:700;
          letter-spacing:.12em; text-transform:uppercase;
          color:rgba(255,255,255,.7); font-family:'Inter',sans-serif;
        }
        .fld-label.blue { color: rgba(255,255,255,.8); }

        /* ── inputs (e-mail e senha mais transparentes, efeito vidro) ── */
        .ieq-input {
          width:100%;
          background:rgba(255,255,255,.08);
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);
          border:1px solid rgba(255,255,255,.2);
          color:#fff;
          padding:13px 13px 13px 43px;
          border-radius:6px; outline:none;
          font-size:14px; font-family:'Inter',sans-serif;
          transition:border-color .2s, box-shadow .2s, background .2s;
        }
        .ieq-input:focus {
          border-color:${BRAND.goldLight};
          box-shadow:0 0 0 3px rgba(201,169,110,.15);
          background:rgba(255,255,255,.12);
        }
        .ieq-input.blue:focus {
          border-color:${BRAND.goldLight};
          box-shadow:0 0 0 3px rgba(201,169,110,.15);
        }
        .ieq-input.error { border-color:${BRAND.red}; }
        .ieq-input::placeholder { color:rgba(255,255,255,.4); }

        /* ── botão principal ── */
        .btn-primary {
          width:100%; padding:14px; border:none; border-radius:6px;
          font-family:'Inter',sans-serif; font-size:11px; font-weight:700;
          letter-spacing:.2em; text-transform:uppercase; cursor:pointer; color:#fff;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:opacity .2s, transform .2s, box-shadow .2s;
        }
        .btn-primary:hover:not(:disabled) {
          opacity:.88; transform:translateY(-2px);
          box-shadow:0 8px 28px rgba(30,63,102,.35);
        }
        .btn-primary:disabled { opacity:.45; cursor:not-allowed; transform:none !important; }
        .btn-primary.blue:hover:not(:disabled) { box-shadow:0 8px 28px rgba(18,40,63,.35); }

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
          background:${dark?"rgba(30,63,102,.12)":"rgba(27,35,51,.09)"};
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
          border:1px solid rgba(255,255,255,.25);
          animation:pulse 3s ease-in-out infinite;
        }

        /* ── tag badge ── */
        .badge {
          display:inline-flex; align-items:center; gap:7px;
          background:rgba(255,255,255,.12);
          border:1px solid rgba(255,255,255,.25);
          border-radius:100px; padding:5px 14px;
          font-size:11px; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase;
          color:${BRAND.goldLight};
          backdrop-filter:blur(8px);
        }
        .badge-dot {
          width:6px; height:6px; border-radius:50%;
          background:${BRAND.goldLight};
          animation:pulse 2s ease-in-out infinite;
        }

        /* ── responsive ── */
        @media(max-width:520px){
          .login-card{ padding:32px 22px 28px; }
          .tab-btn   { font-size:8.5px; letter-spacing:.07em; }
        }
      `}</style>

            <div className="ieq-login-root">
                {/* ── vídeo de fundo ── */}
                <video
                    autoPlay muted loop playsInline
                    src="/videos/santaceia.mp4"
                    style={{
                        position:"fixed", inset:0, width:"100%", height:"100%",
                        objectFit:"cover", zIndex:0,
                    }}
                />
                <div style={{
                    position:"fixed", inset:0, zIndex:0,
                    background: dark
                        ? "linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,.15) 50%, rgba(0,0,0,.30) 100%)"
                        : "linear-gradient(180deg, rgba(0,0,0,.20) 0%, rgba(0,0,0,.10) 50%, rgba(0,0,0,.25) 100%)",
                }} />

                {/* ── fundo animado + grade + glows ── */}
                <AnimatedScene dark={dark}/>
                <div className="noise-overlay"/>
                <div className="glow-primary"/>
                <div className="glow-secondary"/>
                <div className="glow-tertiary"/>

                {/* ── botão tema ── */}
                <button
                    onClick={toggleTheme}
                    aria-label="Alternar tema"
                    style={{
                        position:"fixed", top:22, right:22, zIndex:50,
                        background:"none", border:"none", cursor:"pointer",
                        color:dark?BRAND.moss:BRAND.gold, transition:"color .3s",
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
                                background:"rgba(255,255,255,.15)",
                                border:`1px solid rgba(255,255,255,.3)`,
                                backdropFilter:"blur(8px)",
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
                            fontFamily:"'Fraunces',serif",
                            fontSize:"clamp(26px,5vw,32px)",
                            fontWeight:700, lineHeight:1.1,
                            letterSpacing:"-.02em",
                            color:"#fff", margin:0,
                            textShadow:"0 2px 16px rgba(0,0,0,.6)",
                        }}>
                            Sua Igreja,{" "}
                            <span style={{ color:BRAND.goldLight, fontStyle:"italic" }}>Bem Administrada.</span>
                        </h1>
                        <p style={{
                            marginTop:8, fontSize:12,
                            color:"rgba(255,255,255,.7)", letterSpacing:".06em",
                            fontFamily:"'Inter',sans-serif",
                            textShadow:"0 1px 8px rgba(0,0,0,.4)",
                        }}>
                            Portal Administrativo · IEQ Pituaçu
                        </p>
                    </div>

                    {/* ── separador decorativo ── */}
                    <div style={{
                        display:"flex", alignItems:"center", gap:12, marginBottom:24,
                    }}>
                        <div style={{ flex:1, height:1, background:`linear-gradient(to right,transparent,rgba(217,174,94,.5))` }}/>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:BRAND.goldLight }}/>
                        <div style={{ flex:1, height:1, background:`linear-gradient(to left,transparent,rgba(217,174,94,.5))` }}/>
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
                                        <Mail size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.5)", opacity:.7 }}/>
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
                                        <Lock size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.5)", opacity:.7 }}/>
                                        <input
                                            className={`ieq-input${errLogin?.tipo==="senha"?" error":""}`}
                                            type={showPass?"text":"password"} placeholder="••••••••"
                                            value={pass} onChange={e=>{setPass(e.target.value);if(errLogin)setErrLogin(null);}}
                                            required autoComplete="current-password"
                                        />
                                        <button type="button" onClick={()=>setShowPass(!showPass)}
                                                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:BRAND.moss }}>
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
                                            <p style={{ fontSize:11.5, fontWeight:700, color:errColor(errLogin), letterSpacing:".05em", fontFamily:"'Inter',sans-serif", marginBottom:3 }}>{errLogin.titulo}</p>
                                            <p style={{ fontSize:12.5, color:"rgba(255,255,255,.65)", lineHeight:1.55, fontFamily:"'Inter',sans-serif" }}>{errLogin.msg}</p>
                                        </div>
                                    </div>
                                )}

                                {/* botão */}
                                <button type="submit" className="btn-primary" disabled={loadLogin}
                                        style={{ marginTop:4, background:`linear-gradient(135deg,${BRAND.mossDeep},${BRAND.moss})` }}>
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
                            {/* aviso roxo */}
                            <div style={{
                                marginBottom:18, padding:"11px 13px", borderRadius:7,
                                background:"rgba(255,255,255,.08)",
                                border:"1px solid rgba(255,255,255,.15)",
                                backdropFilter:"blur(6px)",
                                display:"flex", gap:9, alignItems:"flex-start",
                            }}>
                <span style={{ color:BRAND.goldLight, flexShrink:0, marginTop:2 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </span>
                                <p style={{ fontSize:12.5, color:"rgba(255,255,255,.6)", lineHeight:1.55, fontFamily:"'Inter',sans-serif" }}>
                                    Exclusivo para <strong style={{ color:"#fff" }}>líderes de célula</strong>. Após o envio, aguarde a aprovação do administrador para acessar o sistema.
                                </p>
                            </div>

                            {/* sucesso cadastro */}
                            {okCad ? (
                                <div className="pop-in" style={{
                                    textAlign:"center", padding:"28px 20px", borderRadius:8,
                                    background:"rgba(255,255,255,.08)",
                                    border:"1px solid rgba(255,255,255,.15)",
                                    backdropFilter:"blur(6px)",
                                }}>
                                    <CheckCircle2 size={42} color="#22c55e" strokeWidth={1.5} style={{ marginBottom:12 }}/>
                                    <p style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, color:BRAND.goldLight, marginBottom:8 }}>Solicitação Enviada!</p>
                                    <p style={{ fontSize:13, color:"rgba(255,255,255,.6)", lineHeight:1.6, fontFamily:"'Inter',sans-serif", marginBottom:18 }}>
                                        Sua solicitação foi recebida. O administrador irá analisar e liberar seu acesso em breve.
                                    </p>
                                    <button onClick={()=>trocarAba("login")} style={{
                                        background:"none", border:`1px solid rgba(255,255,255,.3)`, color:"#fff",
                                        borderRadius:6, padding:"9px 22px", cursor:"pointer",
                                        fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700, letterSpacing:".12em",
                                    }}>IR PARA LOGIN</button>
                                </div>
                            ) : (
                                <form onSubmit={handleCad} style={{ display:"flex", flexDirection:"column", gap:13 }}>
                                    {/* nome */}
                                    <div>
                                        <label className="fld-label">Nome Completo</label>
                                        <div style={{ position:"relative" }}>
                                            <User size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.5)", opacity:.7 }}/>
                                            <input className="ieq-input" type="text" placeholder="Seu nome completo"
                                                   value={cNome} onChange={e=>{setCNome(e.target.value);if(errCad)setErrCad(null);}} required autoComplete="name"/>
                                        </div>
                                    </div>
                                    {/* email */}
                                    <div>
                                        <label className="fld-label">E-mail</label>
                                        <div style={{ position:"relative" }}>
                                            <Mail size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.5)", opacity:.7 }}/>
                                            <input className="ieq-input" type="email" placeholder="seu@email.com"
                                                   value={cEmail} onChange={e=>{setCEmail(e.target.value);if(errCad)setErrCad(null);}} required autoComplete="email"/>
                                        </div>
                                    </div>
                                    {/* senha */}
                                    <div>
                                        <label className="fld-label">Senha</label>
                                        <div style={{ position:"relative" }}>
                                            <Lock size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.5)", opacity:.7 }}/>
                                            <input className={`ieq-input${errCad?.tipo==="senha"?" error":""}`}
                                                   type={showCP?"text":"password"} placeholder="Mínimo 6 caracteres"
                                                   value={cSenha} onChange={e=>{setCSenha(e.target.value);if(errCad)setErrCad(null);}} required/>
                                            <button type="button" onClick={()=>setShowCP(!showCP)}
                                                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:BRAND.moss }}>
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
                                                <p style={{ fontSize:10, color:forcaColor[fc], fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:".07em" }}>{forcaLabel[fc]}</p>
                                            </div>
                                        )}
                                    </div>
                                    {/* confirmar */}
                                    <div>
                                        <label className="fld-label">Confirmar Senha</label>
                                        <div style={{ position:"relative" }}>
                                            <Lock size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.5)", opacity:.7 }}/>
                                            <input className={`ieq-input${cConf.length>0&&cSenha!==cConf?" error":""}`}
                                                   type={showCP?"text":"password"} placeholder="Repita a senha"
                                                   value={cConf} onChange={e=>{setCConf(e.target.value);if(errCad)setErrCad(null);}} required/>
                                        </div>
                                        {cConf.length > 0 && (
                                            <p style={{ fontSize:10.5, marginTop:4, fontWeight:700, fontFamily:"'Inter',sans-serif", color:cSenha===cConf?"#22c55e":BRAND.red }}>
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
                                                <p style={{ fontSize:11.5, fontWeight:700, color:errColor(errCad), letterSpacing:".05em", fontFamily:"'Inter',sans-serif", marginBottom:3 }}>{errCad.titulo}</p>
                                                <p style={{ fontSize:12.5, color:"rgba(255,255,255,.6)", lineHeight:1.55, fontFamily:"'Inter',sans-serif" }}>{errCad.msg}</p>
                                            </div>
                                        </div>
                                    )}
                                    {/* botão */}
                                    <button type="submit" className="btn-primary blue" disabled={loadCad}
                                            style={{ marginTop:4, background:`linear-gradient(135deg,${BRAND.mossDeep},${BRAND.moss})` }}>
                                        {loadCad ? <><Loader2 size={16} className="spin"/> Enviando...</> : "Solicitar Acesso"}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ════ ABA: ALTERAR DADOS ════ */}
                    {aba === "alterar" && (
                        <div className="tab-content">
                            {/* aviso */}
                            <div style={{
                                marginBottom:18, padding:"11px 13px", borderRadius:7,
                                background:dark?"rgba(30,63,102,.08)":"rgba(30,63,102,.09)",
                                border:`1px solid ${dark?"rgba(30,63,102,.25)":"rgba(30,63,102,.28)"}`,
                                display:"flex", gap:9, alignItems:"flex-start",
                            }}>
                <span style={{ color:BRAND.moss, flexShrink:0, marginTop:2 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </span>
                                <p style={{ fontSize:12.5, color:"rgba(255,255,255,.6)", lineHeight:1.55, fontFamily:"'Inter',sans-serif" }}>
                                    As alterações ficam <strong style={{ color:txt }}>pendentes de aprovação</strong> do administrador antes de serem aplicadas.
                                </p>
                            </div>

                            {/* sucesso alterar */}
                            {okAlt ? (
                                <div className="pop-in" style={{
                                    textAlign:"center", padding:"28px 20px", borderRadius:8,
                                    background:dark?"rgba(30,63,102,.1)":"rgba(30,63,102,.06)",
                                    border:`1px solid ${dark?"rgba(30,63,102,.32)":"rgba(30,63,102,.18)"}`,
                                }}>
                                    <ShieldCheck size={42} color="#22c55e" strokeWidth={1.5} style={{ marginBottom:12 }}/>
                                    <p style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, color:BRAND.moss, marginBottom:8 }}>Solicitação Enviada!</p>
                                    <p style={{ fontSize:13, color:sub, lineHeight:1.6, fontFamily:"'Inter',sans-serif", marginBottom:18 }}>
                                        O administrador irá analisar e aplicar as mudanças em breve.
                                    </p>
                                    <button onClick={()=>trocarAba("login")} style={{
                                        background:"none", border:`1px solid ${BRAND.moss}`, color:BRAND.moss,
                                        borderRadius:6, padding:"9px 22px", cursor:"pointer",
                                        fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700, letterSpacing:".12em",
                                    }}>IR PARA LOGIN</button>
                                </div>
                            ) : (
                                <form onSubmit={handleAlt} style={{ display:"flex", flexDirection:"column", gap:0 }}>
                                    {/* e-mail atual */}
                                    <div style={{ marginBottom:14 }}>
                                        <label className="fld-label">Seu E-mail <span style={{ color:BRAND.red }}>*</span></label>
                                        <div style={{ position:"relative" }}>
                                            <Mail size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.5)", opacity:.7 }}/>
                                            <input className={`ieq-input${errAlt&&(errAlt.titulo==="E-mail obrigatório"||errAlt.titulo==="E-mail não encontrado")?" error":""}`}
                                                   type="email" placeholder="seu@email.com"
                                                   value={aEmail} onChange={e=>{setAEmail(e.target.value);if(errAlt)setErrAlt(null);}} required autoComplete="email"/>
                                        </div>
                                    </div>
                                    {/* senha atual */}
                                    <div style={{ marginBottom:18 }}>
                                        <label className="fld-label">Senha Atual <span style={{ color:BRAND.red }}>*</span></label>
                                        <div style={{ position:"relative" }}>
                                            <Lock size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.5)", opacity:.7 }}/>
                                            <input className={`ieq-input${errAlt?.tipo==="senha"?" error":""}`}
                                                   type={showAA?"text":"password"} placeholder="Confirme sua identidade"
                                                   value={aAtual} onChange={e=>{setAAtual(e.target.value);if(errAlt)setErrAlt(null);}} required autoComplete="current-password"/>
                                            <button type="button" onClick={()=>setShowAA(!showAA)}
                                                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:BRAND.moss }}>
                                                <EyeIcon open={showAA}/>
                                            </button>
                                        </div>
                                    </div>

                                    {/* divisor */}
                                    <div className="divider" style={{ marginBottom:14 }}>
                    <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:".13em", color:sub, whiteSpace:"nowrap", fontFamily:"'Inter',sans-serif" }}>
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
                                                         ? "rgba(255,255,255,.1)"
                                                         : "rgba(255,255,255,.04)",
                                                     border:`1px solid ${state?"rgba(255,255,255,.3)":"rgba(255,255,255,.1)"}`,
                                                 }}
                                            >
                                                <div className="check-box"
                                                     style={{
                                                         background:state?BRAND.moss:"transparent",
                                                         border:`2px solid ${state?BRAND.moss:"rgba(255,255,255,.25)"}`,
                                                     }}>
                                                    {state && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                                                </div>
                                                {key==="email"
                                                    ? <Mail size={14} color={state?"#fff":"rgba(255,255,255,.4)"} style={{ flexShrink:0 }}/>
                                                    : <Lock size={14} color={state?"#fff":"rgba(255,255,255,.4)"} style={{ flexShrink:0 }}/>}
                                                <span style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", fontFamily:"'Inter',sans-serif", color:state?"#fff":"rgba(255,255,255,.5)" }}>{label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* novo e-mail */}
                                    {altEmail && (
                                        <div style={{ marginBottom:14, animation:"slideDown .25s ease both" }}>
                                            <label className="fld-label blue">Novo E-mail</label>
                                            <div style={{ position:"relative" }}>
                                                <Mail size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.5)", opacity:.7 }}/>
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
                                                    <Lock size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.5)", opacity:.7 }}/>
                                                    <input className="ieq-input blue" type={showAN?"text":"password"} placeholder="Mínimo 6 caracteres"
                                                           value={aNova} onChange={e=>{setANova(e.target.value);if(errAlt)setErrAlt(null);}} autoComplete="new-password"/>
                                                    <button type="button" onClick={()=>setShowAN(!showAN)}
                                                            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:BRAND.moss }}>
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
                                                        <p style={{ fontSize:10, color:forcaColor[fa], fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:".07em" }}>{forcaLabel[fa]}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="fld-label blue">Confirmar Nova Senha</label>
                                                <div style={{ position:"relative" }}>
                                                    <Lock size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.5)", opacity:.7 }}/>
                                                    <input className={`ieq-input blue${aConf.length>0&&aNova!==aConf?" error":""}`}
                                                           type={showAC?"text":"password"} placeholder="Repita a nova senha"
                                                           value={aConf} onChange={e=>{setAConf(e.target.value);if(errAlt)setErrAlt(null);}} autoComplete="new-password"/>
                                                    <button type="button" onClick={()=>setShowAC(!showAC)}
                                                            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:BRAND.moss }}>
                                                        <EyeIcon open={showAC}/>
                                                    </button>
                                                </div>
                                                {aConf.length > 0 && (
                                                    <p style={{ fontSize:10.5, marginTop:4, fontWeight:700, fontFamily:"'Inter',sans-serif", color:aNova===aConf?"#22c55e":BRAND.red }}>
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
                                                <p style={{ fontSize:11.5, fontWeight:700, color:errColor(errAlt), letterSpacing:".05em", fontFamily:"'Inter',sans-serif", marginBottom:3 }}>{errAlt.titulo}</p>
                                                <p style={{ fontSize:12.5, color:"rgba(255,255,255,.6)", lineHeight:1.55, fontFamily:"'Inter',sans-serif" }}>{errAlt.msg}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* botão */}
                                    <button type="submit" className="btn-primary" disabled={loadAlt||(!altEmail&&!altSenha)}
                                            style={{ marginTop:4, background:`linear-gradient(135deg,${BRAND.mossDeep},${BRAND.moss})` }}>
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
                        fontSize:10, letterSpacing:".15em", fontFamily:"'Inter',sans-serif",
                        color:dark?"rgba(243,241,234,.15)":"rgba(27,35,51,.18)",
                        textTransform:"uppercase",
                    }}>
                        © {new Date().getFullYear()} IEQ Pituaçu · Sistema Eclesiástico
                    </p>
                </div>
            </div>
        </>
    );
}
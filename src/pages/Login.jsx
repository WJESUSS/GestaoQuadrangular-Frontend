import { Helmet }        from "react-helmet-async";
import { useNavigate }   from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { jwtDecode }     from "jwt-decode";
import { Loader2, Lock, Mail, Sun, Moon, User, ShieldCheck, CheckCircle2, ArrowLeft, } from "lucide-react";
import { useAuth }       from "../auth/AuthContext";
import { useTheme }      from "../context/ThemeContext";
import api               from "../services/api.js";

const LEAO_LOGIN = "/images/leao-login.jpg";

/* ─── Paleta da marca: âmbar + amarelo (mesmo tema da Home) ─── */
const P = {
    wine:"#FFE000", wineDeep:"#2E1200", wineLight:"#A55300",
    scarlet:"#C26A00", gold:"#FFE000", goldLight:"#FFE000",
    red:"#FF7A83", green:"#4CFF9B", amber:"#FFE000",
    ink:"#2A1200", paper:"#7A3A00", cream:"#C26A00",
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
    }, [threshold]);
    return ref;
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
const forcaColor = ["",P.red,P.amber,P.green,P.wine];

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
            <p style={{ fontSize:11, fontWeight:600, color:forcaColor[f] }}>{forcaLabel[f]}</p>
        </div>
    );
}

function Confere({ a, b }) {
    if (!b) return null;
    const ok = a === b;
    return (
        <p style={{ fontSize:11.5, marginTop:6, fontWeight:600, color: ok ? P.green : "var(--err)" }}>
            {ok ? "✓ Senhas conferem" : "✗ Senhas não conferem"}
        </p>
    );
}

/* ─── Campo (definido fora para não perder o foco a cada render) ─── */
function Field({ id, label, icon, required, children }) {
    const Icon = icon;
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

    const titulos = { login:"Entrar", cadastro:"Solicitar acesso", alterar:"Alterar dados" };
    const temErro = errLogin || errCad || errAlt;

    return (
        <>
            <Helmet>
                <title>IEQ Gestão — Acesso ao Sistema</title>
                <meta name="description" content="Portal administrativo da Igreja do Evangelho Quadrangular de Pituaçu."/>
            </Helmet>

            <style>{`
        .ieq-login-root, .ieq-login-root *, .ieq-login-root *::before, .ieq-login-root *::after { box-sizing:border-box; }
        :where(.ieq-login-root, .ieq-login-root *) { margin:0; padding:0; }
        .ieq-login-root {
          --red:#C26A00; --red-mid:#A55300; --red-dark:#7A3A00; --red-deep:#2E1200;
          --glow:#FFE45C; --orange:#FF7A00; --yellow:#FFE000; --blue:#1E4FD8; --magenta:#C2187A;
          --white:#FFFFFF; --ink:#2A1200;
          --white-78:rgba(255,255,255,.78); --white-60:rgba(255,255,255,.6); --white-35:rgba(255,255,255,.35);
          --err:#FF7A83; --warn:#FFE000; --track:rgba(255,255,255,.18);
          font-family:'Inter',system-ui,sans-serif;
          min-height:100vh; min-height:100dvh; position:relative; overflow-x:hidden;
          color:#fff; background:var(--red);
        }
        .ieq-login-root.is-dark { background:var(--red-deep); }
        .ieq-login-root button, .ieq-login-root input { font-family:inherit; }
        .ieq-login-root button { cursor:pointer; }
        .ieq-login-root ::selection { background:var(--yellow); color:var(--ink); }
        .ieq-login-root :is(a,button,input):focus-visible { outline:3px solid var(--yellow); outline-offset:3px; }

        .login-bg { position:fixed; inset:0; z-index:0; overflow:hidden; pointer-events:none; }
        .login-bg-img {
          position:absolute; inset:-4%;
          background-size:cover; background-position:50% 32%; background-repeat:no-repeat;
          filter:saturate(1.12) contrast(1.04) brightness(.84);
        }
        .login-bg::after { content:""; position:absolute; inset:0;
          background:linear-gradient(180deg, rgba(46,18,0,.42), rgba(46,18,0,.72)); }
        .login-bg::before { content:""; position:absolute; inset:0;
          background:
            radial-gradient(closest-side at 50% 46%, rgba(255,228,92,.28), rgba(255,228,92,0) 62%),
            linear-gradient(90deg, rgba(122,58,0,.9) 0%, rgba(194,106,0,.3) 50%, rgba(122,58,0,.9) 100%);
          box-shadow:inset 0 0 220px 70px rgba(46,18,0,.72);
        }
        .login-cross { position:absolute; z-index:1; right:4%; top:50%; width:min(34vw,340px); height:min(50vh,460px);
          transform:translateY(-50%); opacity:.1; pointer-events:none; }
        .login-cross::before { content:""; position:absolute; left:50%; top:0; width:30%; height:100%; background:#fff; transform:translateX(-50%); }
        .login-cross::after { content:""; position:absolute; top:50%; left:0; width:100%; height:30%; background:#fff; transform:translateY(-50%); }
        .login-squares { position:absolute; z-index:2; left:clamp(18px,4vw,54px); bottom:clamp(18px,5vh,54px);
          display:grid; grid-template-columns:repeat(2,20px); gap:6px; pointer-events:none; }
        .login-squares span { display:block; width:20px; height:20px; }
        .login-squares span:nth-child(1) { background:var(--orange); }
        .login-squares span:nth-child(2) { background:var(--yellow); }
        .login-squares span:nth-child(3) { background:var(--blue); }
        .login-squares span:nth-child(4) { background:var(--magenta); }

        .login-stage { position:relative; z-index:3; height:100vh; height:100dvh; min-height:0;
          display:flex; align-items:center; align-items:safe center; justify-content:center;
          padding:clamp(16px,3.5vh,34px) 20px; padding:clamp(16px,3.5dvh,34px) 20px;
          overflow:hidden; }

        .theme-btn {
          position:fixed; top:18px; right:18px; z-index:50;
          width:44px; height:44px; border-radius:0; cursor:pointer;
          display:grid; place-items:center;
          background:var(--yellow); border:2px solid var(--yellow); color:var(--ink);
          box-shadow:5px 5px 0 var(--red-dark);
          transition:transform .2s, box-shadow .2s;
        }
        .theme-btn:hover { transform:translate(-2px,-2px); box-shadow:7px 7px 0 var(--red-dark); }

        .login-card {
          position:relative; z-index:1; display:grid; grid-template-columns:1.08fr .92fr;
          width:100%;
          max-width:min(1060px, calc((100vh - 76px) * 1.7376));
          max-width:min(1060px, calc((100dvh - 76px) * 1.7376));
          max-height:calc(100vh - 76px);
          max-height:calc(100dvh - 76px);
          overflow:hidden;
          background:var(--red-mid); border:3px solid #fff;
          box-shadow:16px 16px 0 var(--red-dark);
          opacity:0; transform:translateY(20px);
          transition:opacity .6s ease, transform .6s ease;
        }

        /* ── lado da marca: leão de Judá ── */
        .brand-pane {
          position:relative; overflow:hidden; isolation:isolate;
          aspect-ratio:1215 / 1295;      /* mesma proporção da imagem */
          min-height:0; padding:0;
          display:block;
          background:#2E1200;            /* tom profundo do tema */
          color:#fff;
        }
        .brand-media {
          position:absolute; inset:0; z-index:0;
          width:100%; height:100%;
          object-fit:contain;            /* cartaz inteiro, sem cortes */
          object-position:50% 50%;
          display:block;
          user-select:none; -webkit-user-drag:none;
        }
        .brand-flag { position:absolute; top:0; left:0; right:0; z-index:3; display:flex; height:8px; }
        .brand-flag i { flex:1; }
        .brand-flag .c-orange { background:var(--orange); }
        .brand-flag .c-yellow { background:var(--yellow); }
        .brand-flag .c-blue { background:var(--blue); }
        .brand-flag .c-magenta { background:var(--magenta); }

        .form-pane { min-width:300px; min-height:0; padding:46px 44px; display:flex; flex-direction:column;
          justify-content:center; justify-content:safe center;
          overflow-y:auto; overscroll-behavior:contain;
          background:var(--red-dark); color:#fff; }
        .card-title { font-family:'Anton','Inter',sans-serif; font-size:clamp(2rem,3vw,2.6rem); font-weight:400;
          letter-spacing:.005em; text-transform:uppercase; color:#fff; margin-bottom:8px; line-height:1; }
        .card-subtitle { font-size:13.5px; color:var(--white-78); margin-bottom:24px; line-height:1.55; }
        .form-col { display:flex; flex-direction:column; gap:16px; }

        .fld-label { display:block; margin-bottom:7px; font-size:12px; font-weight:800;
          letter-spacing:.08em; text-transform:uppercase; color:#fff; }
        .fld-wrap { position:relative; }
        .fld-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--white-60); pointer-events:none; }
        .ieq-input {
          width:100%; height:48px; padding:0 44px 0 42px;
          background:var(--red-mid); color:#fff;
          border:2px solid rgba(255,255,255,.22); border-radius:0; outline:none;
          font-size:14px; font-weight:500;
          transition:border-color .2s, box-shadow .2s, background .2s;
        }
        .ieq-input::placeholder { color:var(--white-60); font-weight:400; }
        .ieq-input:focus { border-color:var(--yellow); box-shadow:4px 4px 0 var(--red-deep); background:var(--red-mid); }
        .ieq-input.error { border-color:var(--err); }
        .ieq-input:-webkit-autofill, .ieq-input:-webkit-autofill:focus {
          -webkit-text-fill-color:#fff; transition:background-color 9999s ease-in-out 0s;
        }
        .eye {
          position:absolute; right:6px; top:50%; transform:translateY(-50%);
          width:34px; height:34px; border-radius:0; border:none; background:transparent;
          color:var(--white-60); cursor:pointer; display:grid; place-items:center; transition:background .2s, color .2s;
        }
        .eye:hover { background:rgba(255,255,255,.12); color:var(--yellow); }

        .btn-primary {
          width:100%; height:52px; border:2px solid var(--yellow); border-radius:0;
          background:var(--yellow); color:var(--ink); cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          font-size:13px; font-weight:800; letter-spacing:.1em; text-transform:uppercase;
          box-shadow:7px 7px 0 var(--red-deep);
          transition:transform .2s, box-shadow .2s;
        }
        .btn-primary:hover:not(:disabled) { transform:translate(-2px,-2px); box-shadow:10px 10px 0 var(--red-deep); }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; }

        .btn-ghost {
          background:transparent; border:2px solid #fff; color:#fff; border-radius:0;
          padding:11px 22px; cursor:pointer; font-size:12px; font-weight:800;
          letter-spacing:.08em; text-transform:uppercase;
          box-shadow:5px 5px 0 var(--red-deep); transition:transform .2s, box-shadow .2s, background .2s, color .2s;
        }
        .btn-ghost:hover { background:#fff; color:var(--red-dark); transform:translate(-2px,-2px); box-shadow:7px 7px 0 var(--red-deep); }

        .row-between { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-top:-2px; }
        .link {
          background:none; border:none; cursor:pointer; padding:4px 2px;
          font-size:12.5px; font-weight:800; color:var(--yellow);
          display:inline-flex; align-items:center; gap:6px;
        }
        .link:hover { text-decoration:underline; text-underline-offset:3px; }
        .card-links { margin-top:20px; display:flex; justify-content:center; border-top:2px solid rgba(255,255,255,.16); padding-top:18px; }
        .card-links .link { font-weight:800; }

        .switch {
          display:inline-flex; align-items:center; gap:8px; background:none; border:none; cursor:pointer;
          padding:4px 0; font-size:12.5px; font-weight:600; color:var(--white-78);
        }
        .switch-track { width:38px; height:21px; border-radius:0; background:rgba(255,255,255,.2); position:relative; transition:background .2s; }
        .switch-thumb { position:absolute; top:3px; left:3px; width:15px; height:15px; border-radius:0; background:#fff; transition:transform .2s; }
        .switch[aria-checked="true"] .switch-track { background:var(--yellow); }
        .switch[aria-checked="true"] .switch-thumb { transform:translateX(17px); background:var(--ink); }

        .notice {
          display:flex; gap:10px; align-items:flex-start; margin-bottom:18px; padding:12px 14px;
          background:var(--red-mid); border:2px solid rgba(255,255,255,.18); border-left:6px solid var(--yellow);
          font-size:12.5px; line-height:1.55; color:var(--white-78);
        }
        .notice svg { flex-shrink:0; margin-top:2px; color:var(--yellow); }
        .notice strong { color:#fff; }

        .err-box { display:flex; gap:10px; align-items:flex-start; padding:12px 14px;
          background:var(--red-mid); border:2px solid rgba(255,255,255,.18); animation:slideDown .25s ease both; }
        .err-bad  { border-left:6px solid var(--err); --tone:var(--err); }
        .err-warn { border-left:6px solid var(--yellow); --tone:var(--yellow); }
        .err-ico { color:var(--tone); flex-shrink:0; margin-top:1px; }
        .err-title { font-size:12px; font-weight:800; color:var(--tone); margin-bottom:3px; text-transform:uppercase; letter-spacing:.04em; }
        .err-msg { font-size:12.5px; line-height:1.5; color:var(--white-78); }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

        .success { text-align:center; padding:28px 18px; background:var(--red-mid); border:2px solid var(--yellow); }
        .success h3 { font-family:'Anton','Inter',sans-serif; font-size:1.4rem; font-weight:400; text-transform:uppercase; color:#fff; margin:12px 0 8px; }
        .success p  { font-size:13px; line-height:1.6; color:var(--white-78); margin-bottom:18px; }

        .check-row {
          display:flex; align-items:center; gap:10px; width:100%; text-align:left;
          padding:11px 13px; border-radius:0; cursor:pointer; color:var(--white-78);
          background:var(--red-mid); border:2px solid rgba(255,255,255,.18); font-size:12.5px; font-weight:700;
          transition:background .2s, border-color .2s, color .2s;
        }
        .check-row[aria-checked="true"] { background:var(--red-mid); border-color:var(--yellow); color:#fff; }
        .check-box { width:17px; height:17px; border-radius:0; flex-shrink:0; display:grid; place-items:center; border:2px solid var(--white-35); transition:all .2s; }
        .check-row[aria-checked="true"] .check-box { background:var(--yellow); border-color:var(--yellow); }
        .divider-t { display:flex; align-items:center; gap:12px; font-size:11px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:var(--white-60); white-space:nowrap; }
        .divider-t::before, .divider-t::after { content:""; flex:1; height:2px; background:rgba(255,255,255,.16); }

        .forca-bar { flex:1; height:5px; border-radius:0; transition:background .25s; }

        .tab-content { animation:tabIn .25s ease both; }
        .pop-in { animation:popIn .38s cubic-bezier(.16,1,.3,1) both; }
        .shake  { animation:shakeX .4s ease both; }
        .spin   { animation:spin 1s linear infinite; }
        @keyframes tabIn  { from{opacity:0;transform:translateX(6px)} to{opacity:1;transform:translateX(0)} }
        @keyframes popIn  { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
        @keyframes spin   { to{transform:rotate(360deg)} }

        @media (max-width:900px) {
          .login-stage { height:auto; min-height:100vh; min-height:100dvh; overflow:visible; }
          .login-card { grid-template-columns:1fr; max-width:560px; max-height:none; }
          .brand-pane { width:100%; aspect-ratio:auto; height:clamp(120px,20dvh,200px); }
          .brand-media { object-fit:cover; object-position:50% 32%; }
          .form-pane { padding:36px 30px 40px; overflow-y:visible; }
          .login-cross { width:60vw; right:-14%; opacity:.07; }
        }
        @media (max-width:600px) {
          .login-stage { padding:20px 14px; }
          .login-card { box-shadow:10px 10px 0 var(--red-dark); }
          .form-pane { padding:30px 22px 34px; }
          .login-squares { display:none; }
          .theme-btn { top:auto; bottom:14px; right:14px; width:40px; height:40px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ieq-login-root *, .ieq-login-root *::before, .ieq-login-root *::after { animation:none !important; transition:none !important; }
        }
      `}</style>

            <div className={`ieq-login-root${dark ? " is-dark" : ""}`}>
                <div className="login-bg" aria-hidden="true">
                    <div className="login-bg-img" style={{ backgroundImage: `url(${LEAO_LOGIN})` }} />
                </div>
                <div className="login-cross" aria-hidden="true" />
                <div className="login-squares" aria-hidden="true"><span /><span /><span /><span /></div>

                <button className="theme-btn" onClick={toggleTheme} aria-label="Alternar tema">
                    {dark ? <Sun size={17}/> : <Moon size={17}/>}
                </button>

                <main className="login-stage">
                    {/* ════════ CARTÃO ════════ */}
                    <div className={`login-card${temErro ? " shake" : ""}`} ref={cardRef}>

                        {/* ── lado da marca (cartaz) ── */}
                        <aside className="brand-pane">
                            <span className="brand-flag" aria-hidden="true">
                                <i className="c-orange" /><i className="c-yellow" /><i className="c-blue" /><i className="c-magenta" />
                            </span>
                            <img
                                className="brand-media"
                                src={LEAO_LOGIN}
                                alt="Jesus Cristo, o Leão da Tribo de Judá"
                                loading="eager"
                                decoding="async"
                                fetchPriority="high"
                                draggable={false}
                            />
                        </aside>

                        {/* ── lado do formulário ── */}
                        <section className="form-pane">
                            <h2 className="card-title">{titulos[aba]}</h2>
                            {aba === "login" && <p className="card-subtitle">Entre com suas credenciais para acessar o sistema.</p>}
                            {aba === "cadastro" && <p className="card-subtitle">Solicite acesso como líder de célula.</p>}
                            {aba === "alterar" && <p className="card-subtitle">Atualize seu e-mail ou senha de acesso.</p>}

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
                                            <EyeBtn show={showPass} onClick={()=>setShowPass(!showPass)}/>
                                        </Field>

                                        <div className="row-between">
                                            <button type="button" className="switch" role="switch"
                                                    aria-checked={showPass} onClick={()=>setShowPass(!showPass)}>
                                                <span className="switch-track"><span className="switch-thumb"/></span>
                                                Mostrar senha
                                            </button>
                                            <button type="button" className="link" onClick={()=>trocarAba("alterar")}>
                                                Esqueci a senha
                                            </button>
                                        </div>

                                        <ErrBox e={errLogin}/>

                                        <button type="submit" className="btn-primary" disabled={loadLogin}>
                                            {loadLogin ? <><Loader2 size={16} className="spin"/> Verificando...</> : "Acessar sistema"}
                                        </button>
                                    </form>

                                    <div className="card-links">
                                        <button type="button" className="link" onClick={()=>trocarAba("cadastro")}>
                                            Sou líder de célula e quero solicitar acesso
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
                                            <CheckCircle2 size={40} color={P.green} strokeWidth={1.6}/>
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
                                            <ShieldCheck size={40} color={P.green} strokeWidth={1.6}/>
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

                                            <div className="divider-t">O que deseja alterar?</div>

                                            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                                                {[
                                                    { key:"email", label:"Alterar e-mail", state:altEmail, set:setAltEmail, icon:Mail },
                                                    { key:"senha", label:"Alterar senha",  state:altSenha, set:setAltSenha, icon:Lock },
                                                ].map(({ key, label, state, set, icon }) => {
                                                    const Icon = icon;
                                                    return (
                                                        <button key={key} type="button" role="checkbox" aria-checked={state}
                                                                className="check-row"
                                                                onClick={()=>{set(!state);setErrAlt(null);}}>
                                                            <span className="check-box">
                                                                {state && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2A1200" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                                                            </span>
                                                            <Icon size={14} style={{ flexShrink:0 }}/>
                                                            {label}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {altEmail && (
                                                <div style={{ animation:"slideDown .22s ease both" }}>
                                                    <Field id="a-novo-email" label="Novo e-mail" icon={Mail}>
                                                        <input id="a-novo-email" className="ieq-input" type="email" placeholder="novo@email.com"
                                                               value={aEmailN} onChange={e=>{setAEmailN(e.target.value);if(errAlt)setErrAlt(null);}}
                                                               autoComplete="email"/>
                                                    </Field>
                                                </div>
                                            )}

                                            {altSenha && (
                                                <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"slideDown .22s ease both" }}>
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
                </main>
            </div>
        </>
    );
}
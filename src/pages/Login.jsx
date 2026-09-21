import { Helmet }        from "react-helmet-async";
import { useNavigate }   from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { jwtDecode }     from "jwt-decode";
import { Loader2, Lock, Mail, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth }       from "../auth/AuthContext";
import api               from "../services/api.js";

/* ─── Cores de estado (sobre vidro escuro) ─── */
const C = {
    red:"#FF9AA5", gold:"#FFC24D", green:"#5BD68C", violet:"#B98CFF",
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
function IEQCross({ size = 52, src = "/quadrangular.png" }) {
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
const forcaColor = ["",C.red,C.gold,C.green,C.violet];

function Forca({ senha }) {
    if (!senha) return null;
    const f = calcForca(senha);
    return (
        <div style={{ marginTop:8, padding:"0 6px" }}>
            <div style={{ display:"flex", gap:4, marginBottom:5 }}>
                {[1,2,3,4].map(i => (
                    <div key={i} className="forca-bar" style={{ background: i<=f ? forcaColor[f] : "rgba(255,255,255,.18)" }}/>
                ))}
            </div>
            <p style={{ fontSize:11, fontWeight:500, color:forcaColor[f] }}>{forcaLabel[f]}</p>
        </div>
    );
}

function Confere({ a, b }) {
    if (!b) return null;
    const ok = a === b;
    return (
        <p style={{ fontSize:11.5, marginTop:6, padding:"0 6px", fontWeight:500, color: ok ? C.green : C.red }}>
            {ok ? "✓ Senhas conferem" : "✗ Senhas não conferem"}
        </p>
    );
}

/* ─── Campo (rótulo só para leitores de tela, como no design; definido fora para não perder o foco) ─── */
function Field({ id, label, children }) {
    return (
        <div>
            <label className="sr-only" htmlFor={id}>{label}</label>
            <div className="fld-wrap">{children}</div>
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

/* ══════════ ARTE: faixas de linhas finas (azul → violeta → magenta) ══════════ */
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const BLUE = [64,72,255], VIOLET = [150,44,255], MAG = [255,44,176];
const f1 = n => n.toFixed(1);

function ribbon(n, path) {
    return Array.from({ length:n }, (_, i) => {
        const t = i / (n - 1);
        const c = t < .5 ? mix(BLUE, VIOLET, t * 2) : mix(VIOLET, MAG, (t - .5) * 2);
        return { d:path(t), stroke:`rgb(${c.join(",")})` };
    });
}

/* canto superior direito */
const LINES_TR = ribbon(60, t =>
    `M${f1(30+t*120)},-6 C${f1(-30+t*110)},${f1(90+t*30)} ${f1(40+t*150)},${f1(170+t*30)} ${f1(70+t*190)},346`);
/* canto inferior esquerdo */
const LINES_BL = ribbon(60, t =>
    `M-6,${f1(20+t*120)} C${f1(60+t*30)},${f1(10+t*90)} ${f1(120+t*90)},${f1(120+t*70)} ${f1(50+t*230)},306`);

function LineArt({ className, viewBox, lines }) {
    return (
        <svg className={className} viewBox={viewBox} fill="none" strokeWidth=".6" aria-hidden="true">
            {lines.map((l, i) => <path key={i} d={l.d} stroke={l.stroke}/>)}
        </svg>
    );
}

/* ══════════════════════════════════════════════════════════════ */
export default function Login() {
    const { login }              = useAuth();
    const navigate               = useNavigate();

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
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');

        .ieq-login-root, .ieq-login-root *, .ieq-login-root *::before, .ieq-login-root *::after { box-sizing:border-box; }
        :where(.ieq-login-root, .ieq-login-root *) { margin:0; padding:0; }
        .ieq-login-root {
          font-family:'Roboto',system-ui,sans-serif; color:#fff; background:#000;
          min-height:100vh; position:relative; overflow-x:hidden;
        }
        .ieq-login-root button, .ieq-login-root input { font-family:inherit; }
        .sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }

        /* ── faixas de linhas nos cantos ── */
        .art { position:fixed; pointer-events:none; z-index:0; height:auto; }
        .art-tr { top:0; right:0; width:min(31vw,430px);
          -webkit-mask-image:linear-gradient(to bottom,#000 62%,transparent);
                  mask-image:linear-gradient(to bottom,#000 62%,transparent); }
        .art-bl { bottom:0; left:0; width:min(29vw,400px);
          -webkit-mask-image:linear-gradient(to top,#000 60%,transparent);
                  mask-image:linear-gradient(to top,#000 60%,transparent); }

        .login-stage {
          position:relative; z-index:2; min-height:100vh;
          display:flex; align-items:center; justify-content:center; padding:32px 20px;
        }
        .stage-wrap { position:relative; width:100%; max-width:900px; }

        /* ── brilhos atrás do vidro ── */
        .glow-streak {
          position:absolute; left:-14%; right:-14%; top:36%; height:180px; z-index:0; pointer-events:none;
          transform:rotate(-9deg); filter:blur(46px);
          background:linear-gradient(90deg,transparent 0%,rgba(110,40,200,.60) 22%,rgba(196,38,170,.80) 55%,rgba(80,70,255,.65) 82%,transparent 100%);
        }
        .glow-blue {
          position:absolute; right:-3%; top:-10%; width:36%; height:62%; z-index:0; pointer-events:none;
          background:radial-gradient(closest-side,rgba(70,60,255,.55),transparent); filter:blur(30px);
        }

        /* ── cartão de vidro ── */
        .glass {
          position:relative; z-index:1; display:flex; width:100%; min-height:430px;
          padding:46px 50px; border-radius:44px;
          background:rgba(40,40,44,.56);
          border:1px solid rgba(255,255,255,.14);
          -webkit-backdrop-filter:blur(30px) saturate(1.3); backdrop-filter:blur(30px) saturate(1.3);
          box-shadow:0 30px 80px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.10);
          opacity:0; transform:translateY(24px);
          transition:opacity .7s ease, transform .7s ease;
        }

        /* lado esquerdo */
        .pane-left { flex:1.12; display:flex; flex-direction:column; justify-content:space-between; gap:24px; padding-right:38px; }
        .brand { display:flex; align-items:center; gap:14px; }
        .brand-name { font-size:44px; font-weight:900; letter-spacing:-.01em; line-height:1; }
        .headline { font-size:clamp(28px,3.5vw,36px); line-height:1.08; }
        .headline .thin  { display:block; font-weight:300; }
        .headline .heavy { display:block; font-weight:900; text-shadow:0 2px 3px rgba(0,0,0,.55); }
        .left-para { margin-top:24px; max-width:310px; font-size:14px; line-height:1.5; font-weight:400; }
        .left-foot { font-size:14px; font-weight:400; }

        .divider-v { flex:none; width:4px; align-self:stretch; margin:8px 0 6px; border-radius:4px; background:#fff; }

        /* lado direito */
        .pane-right { flex:1; display:flex; flex-direction:column; justify-content:center; padding-left:38px; }
        .pane-inner { width:100%; max-width:300px; margin:0 auto; }
        .card-title { text-align:center; font-size:26px; font-weight:400; margin-bottom:22px; }
        .form-col { display:flex; flex-direction:column; gap:14px; }

        /* campos em pílula de vidro */
        .fld-wrap { position:relative; }
        .ieq-input {
          width:100%; height:44px; padding:0 46px 0 27px; color:#fff;
          background:linear-gradient(90deg,rgba(255,255,255,.20),rgba(255,255,255,.28));
          border:1px solid transparent; border-radius:999px; outline:none;
          font-size:14px; font-weight:400; letter-spacing:.01em;
          transition:background .2s, box-shadow .2s, border-color .2s;
        }
        .ieq-input::placeholder { color:rgba(255,255,255,.92); }
        .ieq-input:focus { background:linear-gradient(90deg,rgba(255,255,255,.28),rgba(255,255,255,.36)); box-shadow:0 0 0 2px rgba(255,255,255,.55); }
        .ieq-input.error { border-color:#FF7B8A; }
        .ieq-input:-webkit-autofill, .ieq-input:-webkit-autofill:focus {
          -webkit-text-fill-color:#fff; -webkit-box-shadow:0 0 0 100px #55505f inset; caret-color:#fff;
        }
        .eye {
          position:absolute; right:8px; top:50%; transform:translateY(-50%);
          width:32px; height:32px; border-radius:50%; border:none; background:transparent;
          color:rgba(255,255,255,.85); cursor:pointer; display:grid; place-items:center; transition:background .2s;
        }
        .eye:hover { background:rgba(255,255,255,.2); }
        .eye:focus-visible { outline:2px solid #fff; }

        /* botão em pílula */
        .btn-row { display:flex; justify-content:center; margin-top:6px; }
        .btn-primary {
          min-width:112px; height:38px; padding:0 28px; border:none; border-radius:999px;
          background:rgba(255,255,255,.30); color:#fff; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          font-size:14px; font-weight:500; letter-spacing:.01em;
          transition:background .2s, transform .2s;
        }
        .btn-primary:hover:not(:disabled) { background:rgba(255,255,255,.42); transform:translateY(-1px); }
        .btn-primary:focus-visible { outline:2px solid #fff; outline-offset:3px; }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; }

        .btn-ghost {
          background:none; border:1px solid rgba(255,255,255,.55); color:#fff; border-radius:999px;
          padding:9px 24px; cursor:pointer; font-size:13px; font-weight:500; transition:background .2s;
        }
        .btn-ghost:hover { background:rgba(255,255,255,.16); }
        .btn-ghost:focus-visible { outline:2px solid #fff; outline-offset:3px; }

        /* links e interruptor */
        .link {
          background:none; border:none; cursor:pointer; padding:4px 2px; color:rgba(255,255,255,.82);
          font-size:12.5px; font-weight:400; display:inline-flex; align-items:center; gap:6px;
        }
        .link:hover { color:#fff; text-decoration:underline; text-underline-offset:3px; }
        .link:focus-visible { outline:2px solid #fff; outline-offset:2px; border-radius:4px; }
        .card-links { margin-top:16px; display:flex; flex-direction:column; align-items:center; gap:2px; }

        .switch {
          display:inline-flex; align-items:center; gap:9px; background:none; border:none; cursor:pointer;
          padding:2px 6px; font-size:12.5px; color:rgba(255,255,255,.85);
        }
        .switch-track { width:36px; height:20px; border-radius:999px; background:rgba(255,255,255,.28); position:relative; transition:background .2s; }
        .switch-thumb { position:absolute; top:3px; left:3px; width:14px; height:14px; border-radius:50%; background:#fff; transition:transform .2s; }
        .switch[aria-checked="true"] .switch-track { background:#9B5CFF; }
        .switch[aria-checked="true"] .switch-thumb { transform:translateX(16px); }
        .switch:focus-visible { outline:2px solid #fff; outline-offset:2px; border-radius:8px; }

        /* avisos, erros e sucesso */
        .notice {
          display:flex; gap:9px; align-items:flex-start; margin-bottom:16px; padding:10px 14px; border-radius:18px;
          background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.16);
          font-size:12px; line-height:1.5; color:rgba(255,255,255,.85);
        }
        .notice svg { flex-shrink:0; margin-top:2px; }
        .notice strong { color:#fff; font-weight:700; }

        .err-box { display:flex; gap:10px; align-items:flex-start; padding:11px 14px; border-radius:18px; animation:slideDown .28s ease both; }
        .err-bad  { background:rgba(255,70,90,.14);  border:1px solid rgba(255,110,125,.45); --tone:#FF9AA5; }
        .err-warn { background:rgba(255,190,70,.14); border:1px solid rgba(255,200,90,.45);  --tone:#FFD37A; }
        .err-ico { color:var(--tone); flex-shrink:0; margin-top:1px; }
        .err-title { font-size:12.5px; font-weight:700; color:var(--tone); margin-bottom:3px; }
        .err-msg { font-size:12px; line-height:1.5; color:rgba(255,255,255,.85); }
        @keyframes slideDown { from{opacity:0;transform:translateY(-7px)} to{opacity:1;transform:translateY(0)} }

        .success { text-align:center; padding:24px 18px; border-radius:24px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.2); }
        .success h3 { font-size:18px; font-weight:700; margin:12px 0 8px; }
        .success p  { font-size:13px; line-height:1.55; color:rgba(255,255,255,.85); margin-bottom:18px; }

        /* escolha do que alterar */
        .check-row {
          display:flex; align-items:center; gap:10px; width:100%; text-align:left;
          padding:10px 16px; border-radius:999px; cursor:pointer; color:rgba(255,255,255,.9);
          background:transparent; border:1px solid rgba(255,255,255,.28); font-size:13px; transition:background .2s, border-color .2s;
        }
        .check-row[aria-checked="true"] { background:rgba(255,255,255,.16); border-color:rgba(255,255,255,.7); color:#fff; }
        .check-row:focus-visible { outline:2px solid #fff; outline-offset:2px; }
        .check-box { width:18px; height:18px; border-radius:50%; flex-shrink:0; display:grid; place-items:center; border:2px solid rgba(255,255,255,.5); transition:all .2s; }
        .check-row[aria-checked="true"] .check-box { background:#9B5CFF; border-color:#9B5CFF; }
        .divider-t { display:flex; align-items:center; gap:12px; font-size:12px; color:rgba(255,255,255,.7); white-space:nowrap; }
        .divider-t::before, .divider-t::after { content:""; flex:1; height:1px; background:rgba(255,255,255,.2); }

        .forca-bar { flex:1; height:4px; border-radius:2px; transition:background .25s; }

        .tab-content { animation:tabIn .28s ease both; }
        .pop-in { animation:popIn .42s cubic-bezier(.16,1,.3,1) both; }
        .shake  { animation:shakeX .4s ease both; }
        .spin   { animation:spin 1s linear infinite; }
        @keyframes tabIn  { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes popIn  { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes spin   { to{transform:rotate(360deg)} }

        /* ── celular / tablet: empilha os dois lados ── */
        @media (max-width:820px) {
          .login-stage { padding:24px 14px; }
          .glass { flex-direction:column; padding:32px 26px; border-radius:34px; min-height:0; }
          .pane-left { padding-right:0; gap:14px; }
          .brand-name { font-size:34px; }
          .left-para, .left-foot { display:none; }
          .divider-v { width:100%; height:3px; align-self:auto; margin:22px 0 4px; }
          .pane-right { padding-left:0; padding-top:20px; }
          .art-tr { width:46vw; } .art-bl { width:44vw; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ieq-login-root *, .ieq-login-root *::before, .ieq-login-root *::after { animation:none !important; transition:none !important; }
        }
      `}</style>

            <div className="ieq-login-root">
                <LineArt className="art art-tr" viewBox="0 0 260 350" lines={LINES_TR}/>
                <LineArt className="art art-bl" viewBox="0 0 300 310" lines={LINES_BL}/>

                <main className="login-stage">
                    <div className="stage-wrap">
                        <div className="glow-streak"/>
                        <div className="glow-blue"/>

                        {/* ════════ CARTÃO DE VIDRO ════════ */}
                        <div className={`glass${temErro ? " shake" : ""}`} ref={cardRef}>

                            {/* ── lado esquerdo ── */}
                            <section className="pane-left">
                                <div className="brand">
                                    <IEQCross size={52}/>
                                    <span className="brand-name">IEQ</span>
                                </div>

                                <div>
                                    <h1 className="headline">
                                        <span className="thin">Sua Igreja,</span>
                                        <span className="heavy">Bem Administrada.</span>
                                    </h1>
                                    <p className="left-para">
                                        Acompanhe células, membros e a tesouraria da IEQ Pituaçu em um só lugar, com acesso seguro para cada perfil.
                                    </p>
                                </div>

                                <p className="left-foot">© {new Date().getFullYear()} IEQ Pituaçu · Sistema Eclesiástico</p>
                            </section>

                            <div className="divider-v" role="presentation"/>

                            {/* ── lado direito ── */}
                            <section className="pane-right">
                                <div className="pane-inner">
                                    <h2 className="card-title">{titulos[aba]}</h2>

                                    {/* ════ LOGIN ════ */}
                                    {aba === "login" && (
                                        <div className="tab-content">
                                            <form onSubmit={handleLogin} className="form-col">
                                                <Field id="l-email" label="E-mail">
                                                    <input id="l-email" className={`ieq-input${errLogin?.tipo==="senha"?" error":""}`}
                                                           type="email" placeholder="E-mail"
                                                           value={email} onChange={e=>{setEmail(e.target.value);if(errLogin)setErrLogin(null);}}
                                                           required autoComplete="email"/>
                                                </Field>

                                                <Field id="l-senha" label="Senha">
                                                    <input id="l-senha" className={`ieq-input${errLogin?.tipo==="senha"?" error":""}`}
                                                           type={showPass?"text":"password"} placeholder="Senha"
                                                           value={pass} onChange={e=>{setPass(e.target.value);if(errLogin)setErrLogin(null);}}
                                                           required autoComplete="current-password"/>
                                                </Field>

                                                <button type="button" className="switch" role="switch" style={{ alignSelf:"flex-start" }}
                                                        aria-checked={showPass} onClick={()=>setShowPass(!showPass)}>
                                                    <span className="switch-track"><span className="switch-thumb"/></span>
                                                    Mostrar senha
                                                </button>

                                                <ErrBox e={errLogin}/>

                                                <div className="btn-row">
                                                    <button type="submit" className="btn-primary" disabled={loadLogin}>
                                                        {loadLogin ? <><Loader2 size={16} className="spin"/> Verificando...</> : "Entrar"}
                                                    </button>
                                                </div>
                                            </form>

                                            <div className="card-links">
                                                <button type="button" className="link" onClick={()=>trocarAba("alterar")}>Alterar e-mail ou senha</button>
                                                <button type="button" className="link" onClick={()=>trocarAba("cadastro")}>Solicitar acesso</button>
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
                                                    <CheckCircle2 size={42} color={C.green} strokeWidth={1.6}/>
                                                    <h3>Solicitação enviada!</h3>
                                                    <p>Sua solicitação foi recebida. O administrador irá analisar e liberar seu acesso em breve.</p>
                                                    <button type="button" className="btn-ghost" onClick={()=>trocarAba("login")}>Ir para o login</button>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleCad} className="form-col">
                                                    <Field id="c-nome" label="Nome completo">
                                                        <input id="c-nome" className="ieq-input" type="text" placeholder="Nome completo"
                                                               value={cNome} onChange={e=>{setCNome(e.target.value);if(errCad)setErrCad(null);}}
                                                               required autoComplete="name"/>
                                                    </Field>

                                                    <Field id="c-email" label="E-mail">
                                                        <input id="c-email" className="ieq-input" type="email" placeholder="E-mail"
                                                               value={cEmail} onChange={e=>{setCEmail(e.target.value);if(errCad)setErrCad(null);}}
                                                               required autoComplete="email"/>
                                                    </Field>

                                                    <div>
                                                        <Field id="c-senha" label="Senha">
                                                            <input id="c-senha" className={`ieq-input${errCad?.tipo==="senha"?" error":""}`}
                                                                   type={showCP?"text":"password"} placeholder="Senha (mínimo 6 caracteres)"
                                                                   value={cSenha} onChange={e=>{setCSenha(e.target.value);if(errCad)setErrCad(null);}}
                                                                   required autoComplete="new-password"/>
                                                            <EyeBtn show={showCP} onClick={()=>setShowCP(!showCP)}/>
                                                        </Field>
                                                        <Forca senha={cSenha}/>
                                                    </div>

                                                    <div>
                                                        <Field id="c-conf" label="Confirmar senha">
                                                            <input id="c-conf" className={`ieq-input${cConf.length>0&&cSenha!==cConf?" error":""}`}
                                                                   type={showCP?"text":"password"} placeholder="Confirmar senha"
                                                                   value={cConf} onChange={e=>{setCConf(e.target.value);if(errCad)setErrCad(null);}}
                                                                   required autoComplete="new-password"/>
                                                        </Field>
                                                        <Confere a={cSenha} b={cConf}/>
                                                    </div>

                                                    <ErrBox e={errCad}/>

                                                    <div className="btn-row">
                                                        <button type="submit" className="btn-primary" disabled={loadCad}>
                                                            {loadCad ? <><Loader2 size={16} className="spin"/> Enviando...</> : "Enviar solicitação"}
                                                        </button>
                                                    </div>
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
                                                    <ShieldCheck size={42} color={C.green} strokeWidth={1.6}/>
                                                    <h3>Solicitação enviada!</h3>
                                                    <p>O administrador irá analisar e aplicar as mudanças em breve.</p>
                                                    <button type="button" className="btn-ghost" onClick={()=>trocarAba("login")}>Ir para o login</button>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleAlt} className="form-col">
                                                    <Field id="a-email" label="Seu e-mail (obrigatório)">
                                                        <input id="a-email"
                                                               className={`ieq-input${errAlt&&(errAlt.titulo==="E-mail obrigatório"||errAlt.titulo==="E-mail não encontrado")?" error":""}`}
                                                               type="email" placeholder="Seu e-mail"
                                                               value={aEmail} onChange={e=>{setAEmail(e.target.value);if(errAlt)setErrAlt(null);}}
                                                               required autoComplete="email"/>
                                                    </Field>

                                                    <Field id="a-atual" label="Senha atual (obrigatório)">
                                                        <input id="a-atual" className={`ieq-input${errAlt?.tipo==="senha"?" error":""}`}
                                                               type={showAA?"text":"password"} placeholder="Senha atual"
                                                               value={aAtual} onChange={e=>{setAAtual(e.target.value);if(errAlt)setErrAlt(null);}}
                                                               required autoComplete="current-password"/>
                                                        <EyeBtn show={showAA} onClick={()=>setShowAA(!showAA)}/>
                                                    </Field>

                                                    <div className="divider-t">O que deseja alterar?</div>

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
                                                            <Field id="a-novo-email" label="Novo e-mail">
                                                                <input id="a-novo-email" className="ieq-input" type="email" placeholder="Novo e-mail"
                                                                       value={aEmailN} onChange={e=>{setAEmailN(e.target.value);if(errAlt)setErrAlt(null);}}
                                                                       autoComplete="email"/>
                                                            </Field>
                                                        </div>
                                                    )}

                                                    {altSenha && (
                                                        <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"slideDown .25s ease both" }}>
                                                            <div>
                                                                <Field id="a-nova" label="Nova senha">
                                                                    <input id="a-nova" className="ieq-input" type={showAN?"text":"password"} placeholder="Nova senha (mínimo 6 caracteres)"
                                                                           value={aNova} onChange={e=>{setANova(e.target.value);if(errAlt)setErrAlt(null);}}
                                                                           autoComplete="new-password"/>
                                                                    <EyeBtn show={showAN} onClick={()=>setShowAN(!showAN)}/>
                                                                </Field>
                                                                <Forca senha={aNova}/>
                                                            </div>
                                                            <div>
                                                                <Field id="a-conf" label="Confirmar nova senha">
                                                                    <input id="a-conf" className={`ieq-input${aConf.length>0&&aNova!==aConf?" error":""}`}
                                                                           type={showAC?"text":"password"} placeholder="Confirmar nova senha"
                                                                           value={aConf} onChange={e=>{setAConf(e.target.value);if(errAlt)setErrAlt(null);}}
                                                                           autoComplete="new-password"/>
                                                                    <EyeBtn show={showAC} onClick={()=>setShowAC(!showAC)}/>
                                                                </Field>
                                                                <Confere a={aNova} b={aConf}/>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <ErrBox e={errAlt}/>

                                                    <div className="btn-row">
                                                        <button type="submit" className="btn-primary" disabled={loadAlt||(!altEmail&&!altSenha)}>
                                                            {loadAlt
                                                                ? <><Loader2 size={16} className="spin"/> Enviando...</>
                                                                : <><CheckCircle2 size={15}/> Enviar solicitação</>}
                                                        </button>
                                                    </div>
                                                </form>
                                            )}

                                            <div className="card-links">
                                                <button type="button" className="link" onClick={()=>trocarAba("login")}>
                                                    <ArrowLeft size={14}/> Voltar ao login
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
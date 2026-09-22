import { Helmet }        from "react-helmet-async";
import { useNavigate }   from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { jwtDecode }     from "jwt-decode";
import { Loader2, Lock, Mail, Sun, Moon, User, ShieldCheck, CheckCircle2, ArrowLeft, Users, Wallet, ClipboardList } from "lucide-react";
import { useAuth }       from "../auth/AuthContext";
import { useTheme }      from "../context/ThemeContext";
import api               from "../services/api.js";

/* ─── Paleta profissional: azul-marinho + dourado ─── */
const P = {
    navy:"#0F2A4A", navyDeep:"#0A1D33", navyLight:"#1E4571",
    gold:"#B8892E", goldLight:"#D9AE5E",
    red:"#B3261E", green:"#1E7A46", amber:"#8A5A00",
    ink:"#12233B", paper:"#FFFFFF", canvas:"#F4F6F9",
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
function IEQCross({ size = 44, src = "/quadrangular.png" }) {
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
const forcaColor = ["",P.red,P.amber,P.green,P.navy];

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

    /* ── tokens de tema ── */
    const vars = dark ? {
        "--panel":"#0F1B2D", "--title":"#FFFFFF", "--text":"rgba(255,255,255,.78)", "--sub":"rgba(255,255,255,.55)",
        "--link":P.goldLight, "--notice":"rgba(255,255,255,.05)", "--notice-b":"rgba(255,255,255,.14)",
        "--track":"rgba(255,255,255,.14)", "--input-bg":"rgba(255,255,255,.06)", "--input-b":"rgba(255,255,255,.16)",
        "--switch-off":"rgba(255,255,255,.24)", "--switch-on":P.gold,
        "--err":"#F2837C", "--warn":"#E3B865", "--chip":"rgba(184,137,46,.14)", "--chip-b":"rgba(184,137,46,.4)",
    } : {
        "--panel":"#FFFFFF", "--title":P.ink, "--text":"#3C4A5E", "--sub":"rgba(18,35,59,.58)",
        "--link":P.navy, "--notice":"rgba(15,42,74,.05)", "--notice-b":"rgba(15,42,74,.14)",
        "--track":"rgba(15,42,74,.10)", "--input-bg":"#F4F6F9", "--input-b":"rgba(15,42,74,.14)",
        "--switch-off":"rgba(15,42,74,.20)", "--switch-on":P.navy,
        "--err":P.red, "--warn":P.amber, "--chip":"rgba(184,137,46,.10)", "--chip-b":"rgba(184,137,46,.35)",
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fraunces:wght@600;700&display=swap');

        .ieq-login-root, .ieq-login-root *, .ieq-login-root *::before, .ieq-login-root *::after { box-sizing:border-box; }
        :where(.ieq-login-root, .ieq-login-root *) { margin:0; padding:0; }
        .ieq-login-root {
          font-family:'Inter',system-ui,sans-serif;
          min-height:100vh; position:relative;
          color:var(--text); background:${P.canvas};
          transition:background .3s;
        }
        .ieq-login-root.dark-bg { background:#080E18; }
        .ieq-login-root button, .ieq-login-root input { font-family:inherit; }

        .login-stage {
          position:relative; z-index:1; min-height:100vh;
          display:flex; align-items:center; justify-content:center; padding:32px 20px;
        }

        /* ── botão de tema ── */
        .theme-btn {
          position:fixed; top:18px; right:18px; z-index:50;
          width:40px; height:40px; border-radius:10px; cursor:pointer;
          display:grid; place-items:center;
          background:var(--panel); border:1px solid var(--input-b); color:var(--link);
          box-shadow:0 2px 8px rgba(15,42,74,.10);
          transition:background .2s, transform .15s;
        }
        .theme-btn:hover { transform:translateY(-1px); }
        .theme-btn:focus-visible { outline:2px solid ${P.navy}; outline-offset:2px; }

        /* ── cartão dividido ── */
        .login-card {
          position:relative; z-index:1; display:flex; width:100%; max-width:860px; overflow:hidden;
          background:var(--panel); border-radius:16px; border:1px solid var(--input-b);
          box-shadow:0 1px 2px rgba(15,23,42,.04), 0 24px 48px -12px rgba(15,23,42,.18);
          opacity:0; transform:translateY(20px);
          transition:opacity .6s ease, transform .6s ease, background .3s;
        }

        /* lado da marca (azul-marinho) */
        .brand-pane {
          flex:1; min-width:280px; padding:44px 40px;
          background:linear-gradient(160deg, ${P.navyLight} 0%, ${P.navy} 55%, ${P.navyDeep} 100%);
          color:#fff; display:flex; flex-direction:column; justify-content:space-between;
          position:relative; overflow:hidden;
        }
        .brand-pane::before {
          content:""; position:absolute; inset:0;
          background-image:
            radial-gradient(560px 320px at 100% 0%, rgba(217,174,94,.16), transparent 60%),
            radial-gradient(420px 300px at 0% 100%, rgba(255,255,255,.06), transparent 60%);
          pointer-events:none;
        }
        .brand-top { position:relative; display:flex; align-items:center; gap:12px; }
        .brand-name { font-size:15px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:${P.goldLight}; }
        .brand-mid { position:relative; margin-top:30px; }
        .brand-mid h1 {
          font-family:'Fraunces',serif; font-weight:700; font-size:clamp(24px,2.6vw,30px);
          line-height:1.18; letter-spacing:-.01em; color:#fff;
        }
        .brand-mid h1 em { font-style:italic; color:${P.goldLight}; }
        .brand-mid p { margin-top:12px; font-size:13px; line-height:1.65; color:rgba(255,255,255,.72); max-width:280px; }
        .brand-feats { position:relative; margin-top:26px; display:flex; flex-direction:column; gap:12px; }
        .brand-feat { display:flex; align-items:center; gap:10px; font-size:12.5px; color:rgba(255,255,255,.85); }
        .brand-feat-ico {
          width:26px; height:26px; border-radius:7px; flex-shrink:0;
          background:rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.16);
          display:grid; place-items:center; color:${P.goldLight};
        }
        .brand-foot { position:relative; font-size:11px; letter-spacing:.04em; color:rgba(255,255,255,.5); }

        /* lado do formulário */
        .form-pane { flex:1.05; min-width:300px; padding:44px 42px; display:flex; flex-direction:column; justify-content:center; }
        .card-title { font-size:24px; font-weight:700; letter-spacing:-.01em; color:var(--title); margin-bottom:6px; }
        .card-subtitle { font-size:13px; color:var(--sub); margin-bottom:22px; }
        .form-col { display:flex; flex-direction:column; gap:15px; }

        /* ── campos ── */
        .fld-label { display:block; margin-bottom:6px; font-size:12.5px; font-weight:600; color:var(--text); }
        .fld-wrap { position:relative; }
        .fld-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--sub); pointer-events:none; }
        .ieq-input {
          width:100%; height:44px; padding:0 42px 0 40px;
          background:var(--input-bg); color:var(--title);
          border:1.5px solid var(--input-b); border-radius:8px; outline:none;
          font-size:14px; font-weight:500;
          transition:border-color .2s, box-shadow .2s, background .2s;
        }
        .ieq-input::placeholder { color:var(--sub); font-weight:400; }
        .ieq-input:focus { border-color:${P.navy}; box-shadow:0 0 0 3px rgba(15,42,74,.12); background:var(--panel); }
        .ieq-login-root.dark-bg .ieq-input:focus { border-color:${P.goldLight}; box-shadow:0 0 0 3px rgba(217,174,94,.16); }
        .ieq-input.error { border-color:var(--err); }
        .ieq-input:-webkit-autofill, .ieq-input:-webkit-autofill:focus {
          -webkit-text-fill-color:var(--title); transition:background-color 9999s ease-in-out 0s;
        }
        .eye {
          position:absolute; right:6px; top:50%; transform:translateY(-50%);
          width:32px; height:32px; border-radius:6px; border:none; background:transparent;
          color:var(--sub); cursor:pointer; display:grid; place-items:center; transition:background .2s, color .2s;
        }
        .eye:hover { background:var(--notice); color:var(--link); }
        .eye:focus-visible { outline:2px solid ${P.navy}; }

        /* ── botão principal ── */
        .btn-primary {
          width:100%; height:44px; border:none; border-radius:8px;
          background:${P.navy}; color:#fff; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          font-size:13.5px; font-weight:700; letter-spacing:.02em;
          transition:background .2s, transform .15s, box-shadow .2s;
        }
        .btn-primary:hover:not(:disabled) { background:${P.navyLight}; box-shadow:0 6px 16px rgba(15,42,74,.28); }
        .btn-primary:focus-visible { outline:2px solid ${P.gold}; outline-offset:2px; }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; }

        .btn-ghost {
          background:none; border:1.5px solid ${P.navy}; color:var(--link); border-radius:8px;
          padding:10px 22px; cursor:pointer; font-size:12.5px; font-weight:700;
          transition:background .2s;
        }
        .btn-ghost:hover { background:var(--notice); }
        .btn-ghost:focus-visible { outline:2px solid ${P.navy}; outline-offset:2px; }

        /* ── links e interruptor ── */
        .row-between { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-top:-2px; }
        .link {
          background:none; border:none; cursor:pointer; padding:4px 2px;
          font-size:12.5px; font-weight:600; color:var(--link);
          display:inline-flex; align-items:center; gap:6px;
        }
        .link:hover { text-decoration:underline; text-underline-offset:2px; }
        .link:focus-visible { outline:2px solid ${P.navy}; outline-offset:2px; border-radius:3px; }
        .card-links { margin-top:18px; display:flex; justify-content:center; border-top:1px solid var(--input-b); padding-top:16px; }
        .card-links .link { font-weight:700; }

        .switch {
          display:inline-flex; align-items:center; gap:8px; background:none; border:none; cursor:pointer;
          padding:4px 0; font-size:12.5px; font-weight:500; color:var(--text);
        }
        .switch-track { width:34px; height:19px; border-radius:999px; background:var(--switch-off); position:relative; transition:background .2s; }
        .switch-thumb { position:absolute; top:2.5px; left:2.5px; width:14px; height:14px; border-radius:50%; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,.25); transition:transform .2s; }
        .switch[aria-checked="true"] .switch-track { background:var(--switch-on); }
        .switch[aria-checked="true"] .switch-thumb { transform:translateX(15px); }
        .switch:focus-visible { outline:2px solid ${P.navy}; outline-offset:2px; border-radius:6px; }

        /* ── avisos, erros, sucesso ── */
        .notice {
          display:flex; gap:9px; align-items:flex-start; margin-bottom:18px; padding:11px 13px; border-radius:8px;
          background:var(--notice); border:1px solid var(--notice-b);
          font-size:12.5px; line-height:1.55; color:var(--text);
        }
        .notice svg { flex-shrink:0; margin-top:2px; color:var(--link); }
        .notice strong { color:var(--title); }

        .err-box { display:flex; gap:10px; align-items:flex-start; padding:12px 14px; border-radius:8px; animation:slideDown .25s ease both; }
        .err-bad  { background:rgba(179,38,30,.07);  border:1px solid rgba(179,38,30,.28); --tone:var(--err); }
        .err-warn { background:rgba(184,137,46,.10); border:1px solid rgba(184,137,46,.35); --tone:var(--warn); }
        .err-ico { color:var(--tone); flex-shrink:0; margin-top:1px; }
        .err-title { font-size:12px; font-weight:700; color:var(--tone); margin-bottom:3px; }
        .err-msg { font-size:12.5px; line-height:1.5; color:var(--text); }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

        .success { text-align:center; padding:26px 18px; border-radius:10px; background:var(--chip); border:1px solid var(--chip-b); }
        .success h3 { font-family:'Fraunces',serif; font-size:18px; font-weight:700; color:var(--title); margin:12px 0 8px; }
        .success p  { font-size:13px; line-height:1.6; color:var(--text); margin-bottom:18px; }

        /* ── seleção do que alterar ── */
        .check-row {
          display:flex; align-items:center; gap:10px; width:100%; text-align:left;
          padding:10px 13px; border-radius:8px; cursor:pointer; color:var(--text);
          background:var(--input-bg); border:1.5px solid var(--input-b); font-size:12.5px; font-weight:600;
          transition:background .2s, border-color .2s;
        }
        .check-row[aria-checked="true"] { background:var(--chip); border-color:${P.navy}; color:var(--title); }
        .check-row:focus-visible { outline:2px solid ${P.navy}; outline-offset:2px; }
        .check-box { width:17px; height:17px; border-radius:4px; flex-shrink:0; display:grid; place-items:center; border:1.5px solid var(--sub); transition:all .2s; }
        .check-row[aria-checked="true"] .check-box { background:${P.navy}; border-color:${P.navy}; }
        .divider-t { display:flex; align-items:center; gap:12px; font-size:11.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--sub); white-space:nowrap; }
        .divider-t::before, .divider-t::after { content:""; flex:1; height:1px; background:var(--input-b); }

        .forca-bar { flex:1; height:4px; border-radius:2px; transition:background .25s; }

        .tab-content { animation:tabIn .25s ease both; }
        .pop-in { animation:popIn .38s cubic-bezier(.16,1,.3,1) both; }
        .shake  { animation:shakeX .4s ease both; }
        .spin   { animation:spin 1s linear infinite; }
        @keyframes tabIn  { from{opacity:0;transform:translateX(6px)} to{opacity:1;transform:translateX(0)} }
        @keyframes popIn  { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
        @keyframes spin   { to{transform:rotate(360deg)} }

        @media (max-width:760px) {
          .login-card { flex-direction:column; max-width:440px; border-radius:14px; }
          .brand-pane { padding:32px 28px; }
          .brand-mid p, .brand-feats { display:none; }
          .form-pane { padding:32px 28px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ieq-login-root *, .ieq-login-root *::before, .ieq-login-root *::after { animation:none !important; transition:none !important; }
        }
      `}</style>

            <div className={`ieq-login-root${dark ? " dark-bg" : ""}`} style={vars}>
                <button className="theme-btn" onClick={toggleTheme} aria-label="Alternar tema">
                    {dark ? <Sun size={17}/> : <Moon size={17}/>}
                </button>

                <main className="login-stage">
                    {/* ════════ CARTÃO ════════ */}
                    <div className={`login-card${temErro ? " shake" : ""}`} ref={cardRef}>

                        {/* ── lado da marca ── */}
                        <aside className="brand-pane">
                            <div className="brand-top">
                                <IEQCross size={40}/>
                                <span className="brand-name">IEQ Pituaçu</span>
                            </div>

                            <div className="brand-mid">
                                <h1>Sua Igreja,<br/><em>Bem Administrada.</em></h1>
                                <p>Portal administrativo para líderes, tesouraria e secretaria acompanharem células e membros com segurança.</p>

                                <div className="brand-feats">
                                    <div className="brand-feat">
                                        <span className="brand-feat-ico"><Users size={13}/></span>
                                        Gestão de células e membros
                                    </div>
                                    <div className="brand-feat">
                                        <span className="brand-feat-ico"><Wallet size={13}/></span>
                                        Tesouraria e prestação de contas
                                    </div>
                                    <div className="brand-feat">
                                        <span className="brand-feat-ico"><ClipboardList size={13}/></span>
                                        Relatórios e acompanhamento pastoral
                                    </div>
                                </div>
                            </div>

                            <p className="brand-foot">© {new Date().getFullYear()} IEQ Pituaçu · Sistema Eclesiástico</p>
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
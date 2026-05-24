import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Loader2, Lock, Mail, Sun, Moon, User, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api.js";

const IEQ = {
    red:"#C8102E", redDark:"#8B0B1F", redLight:"#E8294A",
    yellow:"#FDB813", yellowDark:"#C48C00",
    blue:"#003DA5", blueDark:"#002470", blueLight:"#1A56C4",
    white:"#FFFFFF", offWhite:"#F5F0E8", dark:"#0A0608", darkCard:"#110A0D",
};

function QuadrangularCross({ size = 42 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <defs>
                <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={IEQ.redLight}/><stop offset="100%" stopColor={IEQ.redDark}/>
                </linearGradient>
                <linearGradient id="gH" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={IEQ.blueDark}/><stop offset="50%" stopColor={IEQ.blueLight}/><stop offset="100%" stopColor={IEQ.blueDark}/>
                </linearGradient>
                <filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gV)" filter="url(#glow)"/>
            <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gH)" filter="url(#glow)"/>
            <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glow)"/>
            <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55"/>
        </svg>
    );
}

function EyeIcon({ open }) {
    return open ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
    );
}

function ErroIcon({ tipo }) {
    if (tipo === "senha") return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/><line x1="12" y1="15" x2="12" y2="17"/>
        </svg>
    );
    if (tipo === "rede") return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
        </svg>
    );
    if (tipo === "limite") return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
    );
    if (tipo === "sucesso") return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
    );
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    );
}

export default function Login() {
    const { login }              = useAuth();
    const navigate               = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const [aba, setAba] = useState("login");

    // ── Login state ───────────────────────────────────────────
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError]       = useState(null);
    const [loading, setLoading]   = useState(false);
    const [attempts, setAttempts] = useState(0);

    // ── Cadastro state ────────────────────────────────────────
    const [cadNome, setCadNome]           = useState("");
    const [cadEmail, setCadEmail]         = useState("");
    const [cadSenha, setCadSenha]         = useState("");
    const [cadConfSenha, setCadConfSenha] = useState("");
    const [showCadPass, setShowCadPass]   = useState(false);
    const [cadError, setCadError]         = useState(null);
    const [cadLoading, setCadLoading]     = useState(false);
    const [cadSucesso, setCadSucesso]     = useState(false);

    // ── Alterar state ─────────────────────────────────────────
    const [altEmail,          setAltEmail]          = useState("");
    const [altSenhaAtual,     setAltSenhaAtual]     = useState("");
    const [altEmailNovo,      setAltEmailNovo]      = useState("");
    const [altNovaSenha,      setAltNovaSenha]      = useState("");
    const [altConfirmarSenha, setAltConfirmarSenha] = useState("");
    const [altAlterarEmail,   setAltAlterarEmail]   = useState(false);
    const [altAlterarSenha,   setAltAlterarSenha]   = useState(false);
    const [showAltAtual,      setShowAltAtual]      = useState(false);
    const [showAltNova,       setShowAltNova]       = useState(false);
    const [showAltConf,       setShowAltConf]       = useState(false);
    const [altError,          setAltError]          = useState(null);
    const [altLoading,        setAltLoading]        = useState(false);
    const [altSucesso,        setAltSucesso]        = useState(false);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    const trocarAba = (novaAba) => {
        setAba(novaAba);
        setError(null);
        setCadError(null);
        setCadSucesso(false);
        setAltError(null);
        setAltSucesso(false);
        setAltEmail("");
    };

    const isDark = theme === "dark";
    const ts = isDark ? "rgba(245,240,232,.35)" : "rgba(26,10,13,.4)";

    const erroBg     = (e) => e?.tipo === "limite"
        ? (isDark ? "rgba(253,184,19,.12)" : "rgba(253,184,19,.15)")
        : (isDark ? "rgba(200,16,46,.12)"  : "rgba(200,16,46,.08)");
    const erroBorder = (e) => e?.tipo === "limite"
        ? (isDark ? "rgba(253,184,19,.4)" : "rgba(200,140,0,.4)")
        : "rgba(200,16,46,.35)";
    const erroColor  = (e) => e?.tipo === "limite" ? IEQ.yellow : IEQ.red;

    // ── Força da senha ────────────────────────────────────────
    const calcForca   = (s) => s.length < 6 ? 1 : s.length < 8 ? 2 : /[A-Z]/.test(s) && /[0-9]/.test(s) ? 4 : 3;
    const forcaLabels = ["","Senha muito curta","Senha fraca","Senha média","Senha forte"];
    const forcaCores  = ["","#C8102E","#FDB813","#22c55e","#003DA5"];
    const forcaCad    = calcForca(cadSenha);
    const forcaAlt    = calcForca(altNovaSenha);

    // ── Toggle style ──────────────────────────────────────────
    const toggleStyle = (ativo) => ({
        display:"flex", alignItems:"center", gap:10, padding:"11px 14px",
        borderRadius:6, cursor:"pointer", transition:"all .2s",
        background: ativo
            ? (isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.07)")
            : (isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)"),
        border:`1px solid ${ativo ? "rgba(200,16,46,.4)" : (isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)")}`,
        userSelect:"none",
    });

    // ── Handler login ─────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const token = await login(email, password);
            if (!token) throw new Error("sem_token");
            localStorage.setItem("token", token);
            const decoded = jwtDecode(token);
            localStorage.setItem("user", JSON.stringify({ id:decoded.id, username:decoded.sub, perfil:decoded.perfil }));
            const perfil = decoded.perfil?.replace("ROLE_","").toUpperCase();
            switch (perfil) {
                case "ADMIN":        navigate("/admin");      break;
                case "PASTOR":       navigate("/pastor");     break;
                case "LIDER_CELULA": navigate("/lider");      break;
                case "TESOUREIRO":   navigate("/tesouraria"); break;
                case "SECRETARIO":   navigate("/secretaria"); break;
                default: setError({ tipo:"perfil", titulo:"Perfil não autorizado", msg:`Seu perfil "${perfil}" não tem acesso ao sistema. Contate o administrador.` });
            }
            setAttempts(0);
        } catch (err) {
            const status = err?.response?.status;
            const body   = err?.response?.data;

            // Incrementa contador apenas para feedback visual
            setAttempts(prev => prev + 1);

            if (status === 429) {
                // Backend: { erro: "Muitas tentativas de login.", mensagem: "Tente novamente em X minuto(s).", tentativas: 0 }
                setError({
                    tipo:   "limite",
                    titulo: "Acesso temporariamente bloqueado",
                    msg:    `⏳ ${body?.mensagem ?? "Aguarde alguns minutos antes de tentar novamente."}`,
                });
            } else if (status === 401 || status === 403) {
                // Backend: { erro: "Credenciais inválidas.", mensagem: "Você tem X tentativa(s) restante(s)." ou "Conta bloqueada por 5 minutos.", tentativasRestantes: N }
                const tentativas = body?.tentativasRestantes ?? 0;
                const msgBack    = body?.mensagem ?? "";
                const bloqueado  = tentativas === 0 || msgBack.toLowerCase().includes("bloqueada");

                if (bloqueado) {
                    // Última tentativa esgotada — conta bloqueada
                    setError({
                        tipo:   "limite",
                        titulo: "Conta bloqueada",
                        msg:    `🔒 Muitas tentativas incorretas. ${msgBack || "Conta bloqueada por 5 minutos."}`,
                    });
                } else {
                    // Ainda tem tentativas restantes
                    setError({
                        tipo:   "senha",
                        titulo: "Credenciais inválidas",
                        msg:    `❌ E-mail ou senha incorretos. ${msgBack}`,
                    });
                }
            } else if (!navigator.onLine || err.code === "ERR_NETWORK" || err.message === "Network Error") {
                setError({
                    tipo:   "rede",
                    titulo: "Sem conexão",
                    msg:    "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
                });
            } else if (err.message === "sem_token") {
                setError({
                    tipo:   "geral",
                    titulo: "Erro no servidor",
                    msg:    "O servidor não retornou uma resposta válida. Tente novamente em instantes.",
                });
            } else {
                const msgBack = body?.mensagem || body?.message || body?.erro;
                setError({
                    tipo:   "geral",
                    titulo: "Erro inesperado",
                    msg:    typeof msgBack === "string"
                        ? msgBack
                        : "Ocorreu um erro inesperado. Tente novamente.",
                });
            }
        } finally { setLoading(false); }
    };

    // ── Handler cadastro ──────────────────────────────────────
    const handleCadastro = async (e) => {
        e.preventDefault();
        setCadError(null);
        setCadSucesso(false);
        if (!cadNome.trim() || cadNome.trim().length < 3) {
            setCadError({ tipo:"geral", titulo:"Nome inválido", msg:"Informe seu nome completo (mínimo 3 caracteres)." }); return;
        }
        if (cadSenha.length < 6) {
            setCadError({ tipo:"senha", titulo:"Senha fraca", msg:"A senha deve ter no mínimo 6 caracteres." }); return;
        }
        if (cadSenha !== cadConfSenha) {
            setCadError({ tipo:"senha", titulo:"Senhas diferentes", msg:"A confirmação de senha não confere. Verifique e tente novamente." }); return;
        }
        setCadLoading(true);
        try {
            await api.post("/auth/solicitar-cadastro-lider", {
                nome:  cadNome.trim(),
                email: cadEmail.trim().toLowerCase(),
                senha: cadSenha,
            });
            setCadNome(""); setCadEmail(""); setCadSenha(""); setCadConfSenha("");
            setCadSucesso(true);
        } catch (err) {
            const status  = err?.response?.status;
            const msgBack = err?.response?.data?.message || err?.response?.data;
            if (status === 409 || (typeof msgBack === "string" && msgBack.toLowerCase().includes("e-mail"))) {
                setCadError({ tipo:"geral", titulo:"E-mail já cadastrado", msg:"Já existe uma solicitação com este e-mail. Aguarde a aprovação ou entre em contato com o administrador." });
            } else if (!navigator.onLine || err.code === "ERR_NETWORK") {
                setCadError({ tipo:"rede", titulo:"Sem conexão", msg:"Não foi possível conectar ao servidor. Verifique sua internet e tente novamente." });
            } else {
                setCadError({ tipo:"geral", titulo:"Erro ao enviar", msg: typeof msgBack === "string" ? msgBack : "Não foi possível enviar sua solicitação. Tente novamente em instantes." });
            }
        } finally { setCadLoading(false); }
    };

    // ── Handler alterar ───────────────────────────────────────
    const handleAlteracao = async (e) => {
        e.preventDefault();
        setAltError(null);

        if (!altEmail.trim()) {
            setAltError({ tipo:"geral", titulo:"E-mail obrigatório", msg:"Informe o seu e-mail cadastrado para identificação." }); return;
        }
        if (!altSenhaAtual.trim()) {
            setAltError({ tipo:"senha", titulo:"Senha atual obrigatória", msg:"Informe sua senha atual para confirmar sua identidade." }); return;
        }
        if (!altAlterarEmail && !altAlterarSenha) {
            setAltError({ tipo:"geral", titulo:"Nada selecionado", msg:"Marque ao menos uma opção: alterar e-mail ou alterar senha." }); return;
        }
        if (altAlterarEmail && !altEmailNovo.trim()) {
            setAltError({ tipo:"geral", titulo:"E-mail inválido", msg:"Informe o novo e-mail desejado." }); return;
        }
        if (altAlterarSenha) {
            if (altNovaSenha.length < 6) {
                setAltError({ tipo:"senha", titulo:"Senha fraca", msg:"A nova senha deve ter no mínimo 6 caracteres." }); return;
            }
            if (altNovaSenha !== altConfirmarSenha) {
                setAltError({ tipo:"senha", titulo:"Senhas não conferem", msg:"A confirmação da nova senha não confere. Verifique e tente novamente." }); return;
            }
        }

        setAltLoading(true);
        try {
            await api.post("/usuarios/solicitar-alteracao", {
                email:              altEmail.trim().toLowerCase(),
                senhaAtual:         altSenhaAtual,
                emailNovo:          altAlterarEmail ? altEmailNovo.trim().toLowerCase() : null,
                novaSenha:          altAlterarSenha ? altNovaSenha        : null,
                confirmarNovaSenha: altAlterarSenha ? altConfirmarSenha   : null,
            });
            setAltEmail(""); setAltSenhaAtual(""); setAltEmailNovo("");
            setAltNovaSenha(""); setAltConfirmarSenha("");
            setAltAlterarEmail(false); setAltAlterarSenha(false);
            setAltSucesso(true);
        } catch (err) {
            const status  = err?.response?.status;
            const msgBack = err?.response?.data?.message || err?.response?.data;
            if (status === 401 || (typeof msgBack === "string" && msgBack.toLowerCase().includes("senha atual"))) {
                setAltError({ tipo:"senha", titulo:"Senha atual incorreta", msg:"A senha atual informada não confere. Verifique e tente novamente." });
            } else if (status === 404 || (typeof msgBack === "string" && msgBack.toLowerCase().includes("não encontrado"))) {
                setAltError({ tipo:"geral", titulo:"E-mail não encontrado", msg:"Nenhum usuário encontrado com este e-mail. Verifique e tente novamente." });
            } else if (status === 409 || (typeof msgBack === "string" && msgBack.toLowerCase().includes("e-mail"))) {
                setAltError({ tipo:"geral", titulo:"E-mail já em uso", msg:"Este e-mail já está cadastrado por outro usuário. Escolha um diferente." });
            } else if (!navigator.onLine || err.code === "ERR_NETWORK") {
                setAltError({ tipo:"rede", titulo:"Sem conexão", msg:"Não foi possível conectar ao servidor. Verifique sua internet e tente novamente." });
            } else {
                setAltError({ tipo:"geral", titulo:"Erro ao enviar", msg: typeof msgBack === "string" ? msgBack : "Não foi possível enviar sua solicitação. Tente novamente em instantes." });
            }
        } finally { setAltLoading(false); }
    };

    const shakeAba = (aba === "login" && error) || (aba === "cadastro" && cadError) || (aba === "alterar" && altError);

    return (
        <div style={{
            minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
            background:isDark?IEQ.dark:"#F0EAE8",
            fontFamily:"'Georgia',serif", position:"relative", overflow:"hidden", transition:"background 0.5s",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stripe    { 0%{background-position:0 0} 100%{background-position:60px 60px} }
        @keyframes shakeX    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tabSlide  { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes pulse     { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.1);opacity:.15} }
        @keyframes popIn     { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
        .ieq-card  { animation: fadeUp .85s cubic-bezier(.16,1,.3,1) both; }
        .ieq-card.shake { animation: shakeX .45s ease both; }
        .tab-content { animation: tabSlide .28s ease both; }
        .secao-alt   { animation: slideDown .25s ease both; }
        .ieq-stripes {
          position:absolute; inset:0; pointer-events:none;
          background:repeating-linear-gradient(-55deg,
            ${isDark?"rgba(200,16,46,.04)":"rgba(200,16,46,.06)"} 0 10px, transparent 10px 20px,
            ${isDark?"rgba(253,184,19,.03)":"rgba(253,184,19,.05)"} 20px 30px, transparent 30px 40px);
          background-size:60px 60px; animation:stripe 8s linear infinite;
        }
        .ieq-title {
          font-family:'Cinzel',serif;
          background:linear-gradient(90deg,${IEQ.redDark},${IEQ.red},${IEQ.yellow},${IEQ.blue});
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .ieq-input {
          width:100%;
          background:${isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)"};
          border:1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.2)"};
          color:${isDark?IEQ.offWhite:"#1A0A0D"};
          padding:13px 13px 13px 44px; border-radius:6px; outline:none;
          transition:all .25s; font-size:14px; font-family:'EB Garamond',serif;
        }
        .ieq-input:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.15); }
        .ieq-input.input-erro { border-color:${IEQ.red}; background:${isDark?"rgba(200,16,46,.07)":"rgba(200,16,46,.04)"}; }
        .ieq-input.input-blue { border-color:${isDark?"rgba(0,61,165,.3)":"rgba(0,61,165,.25)"}; }
        .ieq-input.input-blue:focus { border-color:${IEQ.blue}; box-shadow:0 0 0 3px rgba(0,61,165,.15); }
        .ieq-input::placeholder { color:${isDark?"rgba(245,240,232,.28)":"rgba(26,10,13,.28)"}; }
        .ieq-btn {
          width:100%; padding:14px; border:none; border-radius:6px;
          font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.22em; cursor:pointer;
          transition:all .25s; display:flex; align-items:center; justify-content:center; gap:8px; color:#fff;
        }
        .ieq-btn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.1); }
        .ieq-btn:disabled { opacity:.5; cursor:not-allowed; transform:none !important; }
        .spin { animation:spin 1s linear infinite; }
        .pulse-ring { position:absolute; border-radius:50%; border:1px solid rgba(200,16,46,.35); animation:pulse 3s ease-in-out infinite; }
        .ieq-erro-box { animation:slideDown .3s ease both; border-radius:6px; padding:12px 14px; display:flex; gap:10px; align-items:flex-start; }
        .ieq-tabs { display:flex; border-radius:8px; overflow:hidden; background:${isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.05)"}; padding:3px; gap:3px; }
        .ieq-tab {
          flex:1; padding:10px 0; border:none; cursor:pointer; border-radius:6px;
          font-family:'Cinzel',serif; font-size:9.5px; font-weight:700; letter-spacing:.14em;
          transition:all .25s;
        }
        .ieq-tab.active { background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red}); color:#fff; box-shadow:0 2px 8px rgba(200,16,46,.35); }
        .ieq-tab.inactive { background:transparent; color:${isDark?"rgba(245,240,232,.45)":"rgba(26,10,13,.4)"}; }
        .ieq-tab.inactive:hover { background:${isDark?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)"}; color:${IEQ.red}; }
        .ieq-divider { display:flex; align-items:center; gap:10px; margin:4px 0; }
        .ieq-divider::before,.ieq-divider::after { content:""; flex:1; height:1px; background:${isDark?"rgba(245,240,232,.1)":"rgba(26,10,13,.1)"}; }
        .sucesso-pop { animation: popIn .45s cubic-bezier(.16,1,.3,1) both; }
      `}</style>

            <div className="ieq-stripes" />

            <button style={{ position:"absolute", top:22, right:22, background:"none", border:"none", cursor:"pointer", color:isDark?IEQ.yellow:IEQ.red }}
                    onClick={toggleTheme} aria-label="Alternar tema">
                {isDark ? <Sun size={24}/> : <Moon size={24}/>}
            </button>

            <div
                className={`ieq-card${shakeAba?" shake":""}`}
                style={{
                    position:"relative", zIndex:10, width:"100%", maxWidth:490, margin:24,
                    background:isDark?"rgba(17,10,13,.97)":"rgba(255,255,255,.92)",
                    borderRadius:10, padding:"46px 46px 38px", backdropFilter:"blur(24px)",
                    opacity:mounted?1:0, transition:"opacity 0.5s",
                }}
            >
                {/* ── Cabeçalho ── */}
                <div style={{ textAlign:"center", marginBottom:26 }}>
                    <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
                        <div className="pulse-ring" style={{ width:96, height:96 }}/>
                        <div style={{ width:64, height:64, borderRadius:"50%", background:isDark?"#1A0A0D":"#fff", border:"1px solid rgba(200,16,46,.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <QuadrangularCross size={42}/>
                        </div>
                    </div>
                    <h1 className="ieq-title" style={{ fontSize:28, fontWeight:700, letterSpacing:".2em", margin:0 }}>IEQ PITUAÇU</h1>
                    <p style={{ color:ts, fontSize:10.5, letterSpacing:".18em", fontFamily:"'Cinzel',serif", marginTop:8 }}>PORTAL ADMINISTRATIVO</p>
                </div>

                {/* ── Tabs ── */}
                <div className="ieq-tabs" style={{ marginBottom:26 }}>
                    <button className={`ieq-tab ${aba==="login"?"active":"inactive"}`}    onClick={() => trocarAba("login")}>ENTRAR</button>
                    <button className={`ieq-tab ${aba==="cadastro"?"active":"inactive"}`} onClick={() => trocarAba("cadastro")}>SOLICITAR ACESSO</button>
                    <button className={`ieq-tab ${aba==="alterar"?"active":"inactive"}`}  onClick={() => trocarAba("alterar")}>ALTERAR DADOS</button>
                </div>

                {/* ════════════════ ABA LOGIN ════════════════ */}
                {aba === "login" && (
                    <div className="tab-content">
                        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>

                            <div>
                                <label style={{ display:"block", marginBottom:6, fontFamily:"'Cinzel',serif", fontSize:10, color:IEQ.red, letterSpacing:".1em" }}>E-MAIL</label>
                                <div style={{ position:"relative" }}>
                                    <Mail size={16} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:0.6 }}/>
                                    <input className={`ieq-input${error?.tipo==="senha"?" input-erro":""}`}
                                           type="email" placeholder="usuario@ieq.com"
                                           value={email} onChange={e => { setEmail(e.target.value); if(error) setError(null); }}
                                           required autoComplete="email"/>
                                </div>
                            </div>

                            <div>
                                <label style={{ display:"block", marginBottom:6, fontFamily:"'Cinzel',serif", fontSize:10, color:IEQ.red, letterSpacing:".1em" }}>SENHA</label>
                                <div style={{ position:"relative" }}>
                                    <Lock size={16} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:0.6 }}/>
                                    <input className={`ieq-input${error?.tipo==="senha"?" input-erro":""}`}
                                           type={showPass?"text":"password"} placeholder="••••••••"
                                           value={password} onChange={e => { setPassword(e.target.value); if(error) setError(null); }}
                                           required autoComplete="current-password"/>
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:IEQ.red }}
                                            aria-label={showPass?"Ocultar":"Mostrar"}>
                                        <EyeIcon open={showPass}/>
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="ieq-erro-box" role="alert" style={{ background:erroBg(error), border:`1px solid ${erroBorder(error)}` }}>
                                    <span style={{ color:erroColor(error), flexShrink:0, marginTop:1 }}><ErroIcon tipo={error.tipo}/></span>
                                    <div>
                                        <p style={{ margin:0, fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, color:erroColor(error), letterSpacing:".06em" }}>{error.titulo}</p>
                                        <p style={{ margin:"4px 0 0", fontSize:12.5, color:isDark?"rgba(245,240,232,.75)":"rgba(26,10,13,.7)", lineHeight:1.5 }}>{error.msg}</p>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="ieq-btn" disabled={loading}
                                    style={{ marginTop:error?2:6, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})` }}>
                                {loading ? <><Loader2 size={16} className="spin"/> Verificando...</> : "ACESSAR SISTEMA"}
                            </button>
                        </form>
                    </div>
                )}

                {/* ════════════════ ABA CADASTRO ════════════════ */}
                {aba === "cadastro" && (
                    <div className="tab-content">
                        <div style={{
                            marginBottom:18, padding:"10px 13px", borderRadius:6,
                            background:isDark?"rgba(0,61,165,.1)":"rgba(0,61,165,.06)",
                            border:`1px solid ${isDark?"rgba(0,61,165,.3)":"rgba(0,61,165,.2)"}`,
                            display:"flex", gap:9, alignItems:"flex-start",
                        }}>
                            <span style={{ color:IEQ.blue, flexShrink:0, marginTop:2 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                            </span>
                            <p style={{ margin:0, fontSize:12, color:isDark?"rgba(245,240,232,.6)":"rgba(26,10,13,.55)", lineHeight:1.55, fontFamily:"'EB Garamond',serif" }}>
                                Somente para <strong style={{ color:isDark?IEQ.offWhite:"#1A0A0D" }}>líderes de célula</strong>. Após o envio, aguarde a aprovação do administrador para acessar o sistema.
                            </p>
                        </div>

                        {cadSucesso && (
                            <div className="sucesso-pop" style={{
                                borderRadius:8, padding:"22px 18px",
                                background:isDark?"rgba(0,61,165,.13)":"rgba(0,61,165,.07)",
                                border:`1px solid ${isDark?"rgba(0,61,165,.38)":"rgba(0,61,165,.22)"}`,
                                textAlign:"center",
                            }}>
                                <div style={{ color:"#22c55e", marginBottom:10, display:"flex", justifyContent:"center" }}>
                                    <ErroIcon tipo="sucesso"/>
                                </div>
                                <p style={{ margin:0, fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, color:IEQ.blue, letterSpacing:".08em" }}>SOLICITAÇÃO ENVIADA!</p>
                                <p style={{ margin:"8px 0 0", fontSize:13, color:isDark?"rgba(245,240,232,.7)":"rgba(26,10,13,.6)", lineHeight:1.55, fontFamily:"'EB Garamond',serif" }}>
                                    Sua solicitação foi recebida. O administrador irá analisar e liberar seu acesso em breve.
                                </p>
                                <button onClick={() => trocarAba("login")} style={{
                                    marginTop:14, background:"none", border:`1px solid ${IEQ.blue}`, color:IEQ.blue,
                                    borderRadius:5, padding:"8px 20px", cursor:"pointer",
                                    fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".14em",
                                }}>
                                    IR PARA LOGIN
                                </button>
                            </div>
                        )}

                        {!cadSucesso && (
                            <form onSubmit={handleCadastro} style={{ display:"flex", flexDirection:"column", gap:13 }}>
                                <div>
                                    <label style={{ display:"block", marginBottom:6, fontFamily:"'Cinzel',serif", fontSize:10, color:IEQ.red, letterSpacing:".1em" }}>NOME COMPLETO</label>
                                    <div style={{ position:"relative" }}>
                                        <User size={16} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:0.6 }}/>
                                        <input className="ieq-input" type="text" placeholder="Seu nome completo"
                                               value={cadNome} onChange={e => { setCadNome(e.target.value); if(cadError) setCadError(null); }}
                                               required autoComplete="name"/>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display:"block", marginBottom:6, fontFamily:"'Cinzel',serif", fontSize:10, color:IEQ.red, letterSpacing:".1em" }}>E-MAIL</label>
                                    <div style={{ position:"relative" }}>
                                        <Mail size={16} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:0.6 }}/>
                                        <input className="ieq-input" type="email" placeholder="seu@email.com"
                                               value={cadEmail} onChange={e => { setCadEmail(e.target.value); if(cadError) setCadError(null); }}
                                               required autoComplete="email"/>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display:"block", marginBottom:6, fontFamily:"'Cinzel',serif", fontSize:10, color:IEQ.red, letterSpacing:".1em" }}>SENHA</label>
                                    <div style={{ position:"relative" }}>
                                        <Lock size={16} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:0.6 }}/>
                                        <input className={`ieq-input${cadError?.tipo==="senha"?" input-erro":""}`}
                                               type={showCadPass?"text":"password"} placeholder="Mínimo 6 caracteres"
                                               value={cadSenha} onChange={e => { setCadSenha(e.target.value); if(cadError) setCadError(null); }}
                                               required/>
                                        <button type="button" onClick={() => setShowCadPass(!showCadPass)}
                                                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:IEQ.red }}>
                                            <EyeIcon open={showCadPass}/>
                                        </button>
                                    </div>
                                    {cadSenha.length > 0 && (
                                        <div style={{ marginTop:6 }}>
                                            <div style={{ display:"flex", gap:3, marginBottom:3 }}>
                                                {[1,2,3,4].map(i => (
                                                    <div key={i} style={{
                                                        flex:1, height:3, borderRadius:2, transition:"background .25s",
                                                        background: i<=forcaCad ? forcaCores[forcaCad] : (isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"),
                                                    }}/>
                                                ))}
                                            </div>
                                            <p style={{ margin:0, fontSize:10, color:forcaCores[forcaCad], fontFamily:"'Cinzel',serif", letterSpacing:".08em" }}>
                                                {forcaLabels[forcaCad]}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label style={{ display:"block", marginBottom:6, fontFamily:"'Cinzel',serif", fontSize:10, color:IEQ.red, letterSpacing:".1em" }}>CONFIRMAR SENHA</label>
                                    <div style={{ position:"relative" }}>
                                        <Lock size={16} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:0.6 }}/>
                                        <input className={`ieq-input${cadError?.titulo==="Senhas diferentes"?" input-erro":""}`}
                                               type={showCadPass?"text":"password"} placeholder="Repita a senha"
                                               value={cadConfSenha} onChange={e => { setCadConfSenha(e.target.value); if(cadError) setCadError(null); }}
                                               required/>
                                    </div>
                                    {cadConfSenha.length > 0 && (
                                        <p style={{ margin:"4px 0 0", fontSize:10, letterSpacing:".06em", fontFamily:"'Cinzel',serif",
                                            color: cadSenha===cadConfSenha ? "#22c55e" : IEQ.red }}>
                                            {cadSenha===cadConfSenha ? "✓ Senhas conferem" : "✗ Senhas não conferem"}
                                        </p>
                                    )}
                                </div>

                                {cadError && (
                                    <div className="ieq-erro-box" role="alert" style={{ background:erroBg(cadError), border:`1px solid ${erroBorder(cadError)}` }}>
                                        <span style={{ color:erroColor(cadError), flexShrink:0, marginTop:1 }}><ErroIcon tipo={cadError.tipo}/></span>
                                        <div>
                                            <p style={{ margin:0, fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, color:erroColor(cadError), letterSpacing:".06em" }}>{cadError.titulo}</p>
                                            <p style={{ margin:"4px 0 0", fontSize:12.5, color:isDark?"rgba(245,240,232,.75)":"rgba(26,10,13,.7)", lineHeight:1.5 }}>{cadError.msg}</p>
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="ieq-btn" disabled={cadLoading}
                                        style={{ marginTop:cadError?2:4, background:`linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})` }}>
                                    {cadLoading ? <><Loader2 size={16} className="spin"/> Enviando...</> : "SOLICITAR ACESSO"}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* ════════════════ ABA ALTERAR DADOS ════════════════ */}
                {aba === "alterar" && (
                    <div className="tab-content">

                        {altSucesso ? (
                            <div className="sucesso-pop" style={{
                                borderRadius:8, padding:"28px 20px", textAlign:"center",
                                background:isDark?"rgba(0,61,165,.1)":"rgba(0,61,165,.06)",
                                border:`1px solid ${isDark?"rgba(0,61,165,.35)":"rgba(0,61,165,.2)"}`,
                            }}>
                                <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
                                    <ShieldCheck size={40} color="#22c55e" strokeWidth={1.5}/>
                                </div>
                                <p style={{ margin:0, fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, color:IEQ.blue, letterSpacing:".1em" }}>
                                    SOLICITAÇÃO ENVIADA!
                                </p>
                                <p style={{ margin:"10px 0 0", fontSize:13, color:isDark?"rgba(245,240,232,.65)":"rgba(26,10,13,.6)", lineHeight:1.6, fontFamily:"'EB Garamond',serif" }}>
                                    Sua solicitação de alteração foi recebida. O administrador irá analisar e aplicar as mudanças em breve.
                                </p>
                                <button onClick={() => trocarAba("login")} style={{
                                    marginTop:18, background:"none", border:`1px solid ${IEQ.blue}`, color:IEQ.blue,
                                    borderRadius:5, padding:"9px 24px", cursor:"pointer",
                                    fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".14em",
                                }}>
                                    IR PARA LOGIN
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleAlteracao} style={{ display:"flex", flexDirection:"column", gap:0 }}>

                                {/* Banner aviso */}
                                <div style={{
                                    marginBottom:18, padding:"10px 13px", borderRadius:6,
                                    background:isDark?"rgba(253,184,19,.08)":"rgba(253,184,19,.1)",
                                    border:`1px solid ${isDark?"rgba(253,184,19,.25)":"rgba(196,140,0,.3)"}`,
                                    display:"flex", gap:9, alignItems:"flex-start",
                                }}>
                                    <span style={{ color:IEQ.yellow, flexShrink:0, marginTop:2 }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                                        </svg>
                                    </span>
                                    <p style={{ margin:0, fontSize:12, color:isDark?"rgba(245,240,232,.6)":"rgba(26,10,13,.55)", lineHeight:1.55, fontFamily:"'EB Garamond',serif" }}>
                                        As alterações ficam <strong style={{ color:isDark?IEQ.offWhite:"#1A0A0D" }}>pendentes de aprovação</strong> do administrador antes de serem aplicadas.
                                    </p>
                                </div>

                                {/* E-mail de identificação */}
                                <div style={{ marginBottom:16 }}>
                                    <label style={{ display:"block", marginBottom:6, fontFamily:"'Cinzel',serif", fontSize:10, color:IEQ.red, letterSpacing:".1em" }}>
                                        SEU E-MAIL <span style={{ color:IEQ.red }}>*</span>
                                    </label>
                                    <div style={{ position:"relative" }}>
                                        <Mail size={16} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:0.6 }}/>
                                        <input className={`ieq-input${altError?.titulo==="E-mail obrigatório"||altError?.titulo==="E-mail não encontrado"?" input-erro":""}`}
                                               type="email" placeholder="seu@email.com"
                                               value={altEmail}
                                               onChange={e => { setAltEmail(e.target.value); if(altError) setAltError(null); }}
                                               required autoComplete="email"/>
                                    </div>
                                </div>

                                {/* Senha atual */}
                                <div style={{ marginBottom:18 }}>
                                    <label style={{ display:"block", marginBottom:6, fontFamily:"'Cinzel',serif", fontSize:10, color:IEQ.red, letterSpacing:".1em" }}>
                                        SENHA ATUAL <span style={{ color:IEQ.red }}>*</span>
                                    </label>
                                    <div style={{ position:"relative" }}>
                                        <Lock size={16} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:0.6 }}/>
                                        <input className={`ieq-input${altError?.tipo==="senha"?" input-erro":""}`}
                                               type={showAltAtual?"text":"password"}
                                               placeholder="Confirme sua identidade"
                                               value={altSenhaAtual}
                                               onChange={e => { setAltSenhaAtual(e.target.value); if(altError) setAltError(null); }}
                                               required autoComplete="current-password"/>
                                        <button type="button" onClick={() => setShowAltAtual(!showAltAtual)}
                                                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:IEQ.red }}>
                                            <EyeIcon open={showAltAtual}/>
                                        </button>
                                    </div>
                                </div>

                                {/* Divisor */}
                                <div className="ieq-divider" style={{ marginBottom:16 }}>
                                    <span style={{ color:isDark?"rgba(245,240,232,.2)":"rgba(26,10,13,.2)", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".14em", whiteSpace:"nowrap" }}>
                                        O QUE DESEJA ALTERAR?
                                    </span>
                                </div>

                                {/* Toggles */}
                                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:18 }}>
                                    <div style={toggleStyle(altAlterarEmail)} onClick={() => { setAltAlterarEmail(!altAlterarEmail); setAltError(null); }}>
                                        <div style={{
                                            width:18, height:18, borderRadius:4, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                                            background: altAlterarEmail ? IEQ.red : "transparent",
                                            border:`2px solid ${altAlterarEmail ? IEQ.red : (isDark?"rgba(255,255,255,.2)":"rgba(0,0,0,.2)")}`,
                                            transition:"all .2s",
                                        }}>
                                            {altAlterarEmail && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                                        </div>
                                        <Mail size={14} color={altAlterarEmail ? IEQ.red : (isDark?"rgba(245,240,232,.4)":"rgba(26,10,13,.4)")} style={{ flexShrink:0 }}/>
                                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:10.5, letterSpacing:".1em", color: altAlterarEmail ? (isDark?IEQ.offWhite:"#1A0A0D") : (isDark?"rgba(245,240,232,.45)":"rgba(26,10,13,.45)") }}>
                                            ALTERAR E-MAIL
                                        </span>
                                    </div>

                                    <div style={toggleStyle(altAlterarSenha)} onClick={() => { setAltAlterarSenha(!altAlterarSenha); setAltError(null); }}>
                                        <div style={{
                                            width:18, height:18, borderRadius:4, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                                            background: altAlterarSenha ? IEQ.red : "transparent",
                                            border:`2px solid ${altAlterarSenha ? IEQ.red : (isDark?"rgba(255,255,255,.2)":"rgba(0,0,0,.2)")}`,
                                            transition:"all .2s",
                                        }}>
                                            {altAlterarSenha && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                                        </div>
                                        <Lock size={14} color={altAlterarSenha ? IEQ.red : (isDark?"rgba(245,240,232,.4)":"rgba(26,10,13,.4)")} style={{ flexShrink:0 }}/>
                                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:10.5, letterSpacing:".1em", color: altAlterarSenha ? (isDark?IEQ.offWhite:"#1A0A0D") : (isDark?"rgba(245,240,232,.45)":"rgba(26,10,13,.45)") }}>
                                            ALTERAR SENHA
                                        </span>
                                    </div>
                                </div>

                                {/* Seção novo e-mail */}
                                {altAlterarEmail && (
                                    <div className="secao-alt" style={{ marginBottom:16 }}>
                                        <label style={{ display:"block", marginBottom:6, fontFamily:"'Cinzel',serif", fontSize:10, color:IEQ.blue, letterSpacing:".1em" }}>NOVO E-MAIL</label>
                                        <div style={{ position:"relative" }}>
                                            <Mail size={16} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:IEQ.blue, opacity:0.6 }}/>
                                            <input className="ieq-input input-blue"
                                                   type="email" placeholder="novo@email.com"
                                                   value={altEmailNovo}
                                                   onChange={e => { setAltEmailNovo(e.target.value); if(altError) setAltError(null); }}
                                                   autoComplete="email"/>
                                        </div>
                                    </div>
                                )}

                                {/* Seção nova senha */}
                                {altAlterarSenha && (
                                    <div className="secao-alt" style={{ display:"flex", flexDirection:"column", gap:13, marginBottom:16 }}>
                                        <div>
                                            <label style={{ display:"block", marginBottom:6, fontFamily:"'Cinzel',serif", fontSize:10, color:IEQ.blue, letterSpacing:".1em" }}>NOVA SENHA</label>
                                            <div style={{ position:"relative" }}>
                                                <Lock size={16} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:IEQ.blue, opacity:0.6 }}/>
                                                <input className="ieq-input input-blue"
                                                       type={showAltNova?"text":"password"} placeholder="Mínimo 6 caracteres"
                                                       value={altNovaSenha}
                                                       onChange={e => { setAltNovaSenha(e.target.value); if(altError) setAltError(null); }}
                                                       autoComplete="new-password"/>
                                                <button type="button" onClick={() => setShowAltNova(!showAltNova)}
                                                        style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:IEQ.blue }}>
                                                    <EyeIcon open={showAltNova}/>
                                                </button>
                                            </div>
                                            {altNovaSenha.length > 0 && (
                                                <div style={{ marginTop:6 }}>
                                                    <div style={{ display:"flex", gap:3, marginBottom:3 }}>
                                                        {[1,2,3,4].map(i => (
                                                            <div key={i} style={{
                                                                flex:1, height:3, borderRadius:2, transition:"background .25s",
                                                                background: i<=forcaAlt ? forcaCores[forcaAlt] : (isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"),
                                                            }}/>
                                                        ))}
                                                    </div>
                                                    <p style={{ margin:0, fontSize:10, color:forcaCores[forcaAlt], fontFamily:"'Cinzel',serif", letterSpacing:".08em" }}>
                                                        {forcaLabels[forcaAlt]}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label style={{ display:"block", marginBottom:6, fontFamily:"'Cinzel',serif", fontSize:10, color:IEQ.blue, letterSpacing:".1em" }}>CONFIRMAR NOVA SENHA</label>
                                            <div style={{ position:"relative" }}>
                                                <Lock size={16} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:IEQ.blue, opacity:0.6 }}/>
                                                <input className={`ieq-input input-blue${altConfirmarSenha.length>0 && altNovaSenha!==altConfirmarSenha?" input-erro":""}`}
                                                       type={showAltConf?"text":"password"} placeholder="Repita a nova senha"
                                                       value={altConfirmarSenha}
                                                       onChange={e => { setAltConfirmarSenha(e.target.value); if(altError) setAltError(null); }}
                                                       autoComplete="new-password"/>
                                                <button type="button" onClick={() => setShowAltConf(!showAltConf)}
                                                        style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:IEQ.blue }}>
                                                    <EyeIcon open={showAltConf}/>
                                                </button>
                                            </div>
                                            {altConfirmarSenha.length > 0 && (
                                                <p style={{ margin:"4px 0 0", fontSize:10, letterSpacing:".06em", fontFamily:"'Cinzel',serif",
                                                    color: altNovaSenha===altConfirmarSenha ? "#22c55e" : IEQ.red }}>
                                                    {altNovaSenha===altConfirmarSenha ? "✓ Senhas conferem" : "✗ Senhas não conferem"}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Erro */}
                                {altError && (
                                    <div className="ieq-erro-box" role="alert" style={{ background:erroBg(altError), border:`1px solid ${erroBorder(altError)}`, marginBottom:14 }}>
                                        <span style={{ color:erroColor(altError), flexShrink:0, marginTop:1 }}><ErroIcon tipo={altError.tipo}/></span>
                                        <div>
                                            <p style={{ margin:0, fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, color:erroColor(altError), letterSpacing:".06em" }}>{altError.titulo}</p>
                                            <p style={{ margin:"4px 0 0", fontSize:12.5, color:isDark?"rgba(245,240,232,.75)":"rgba(26,10,13,.7)", lineHeight:1.5 }}>{altError.msg}</p>
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="ieq-btn"
                                        disabled={altLoading || (!altAlterarEmail && !altAlterarSenha)}
                                        style={{ marginTop:4, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})` }}>
                                    {altLoading
                                        ? <><Loader2 size={16} className="spin"/> Enviando...</>
                                        : <><CheckCircle2 size={15}/> ENVIAR SOLICITAÇÃO</>
                                    }
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* ── Rodapé ── */}
                <div style={{ marginTop:26, textAlign:"center" }}>
                    <p style={{ color:isDark?"rgba(245,240,232,.2)":"rgba(26,10,13,.25)", fontSize:10, letterSpacing:".15em", fontFamily:"'Cinzel',serif" }}>
                        © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}
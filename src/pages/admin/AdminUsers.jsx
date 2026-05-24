import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Users, Power, Trash2, LogOut,
  Mail, Key, User, Shield, Loader2, RefreshCcw, Pencil, X,
  Sun, Moon, Eye, EyeOff, CheckCircle, XCircle, Clock, Camera
} from "lucide-react";

const IEQ = {
  red:        "#C8102E",
  redDark:    "#8B0B1F",
  redLight:   "#E8294A",
  yellow:     "#FDB813",
  yellowDark: "#C48C00",
  blue:       "#003DA5",
  blueDark:   "#002470",
  blueLight:  "#1A56C4",
  offWhite:   "#F5F0E8",
  dark:       "#0A0608",
};

const perfis = ["ADMIN", "PASTOR", "LIDER_CELULA", "SECRETARIO", "TESOUREIRO"];

function QuadrangularCross({ size = 32 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gVA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={IEQ.redLight} />
            <stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={IEQ.blueDark} />
            <stop offset="50%"  stopColor={IEQ.blueLight} />
            <stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowA">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gVA)" filter="url(#glowA)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gHA)" filter="url(#glowA)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowA)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

function handleLogout() {
  localStorage.clear();
  window.location.href = "/";
}

function InputIEQ({ icon, isDark, onChange, type, ...props }) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";
  const inputType  = isPassword && showPwd ? "text" : type;
  const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  return (
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          color: IEQ.red, opacity: .7, pointerEvents: "none", zIndex: 1,
        }}>
          {icon}
        </div>
        <input
            {...props}
            type={inputType}
            onChange={e => onChange(e.target.value)}
            className="ieq-input-field"
            style={{ paddingLeft: 44, paddingRight: isPassword ? 44 : 16 }}
        />
        {isPassword && (
            <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: textSecondary, padding: 4, display: "flex", alignItems: "center",
                  transition: "color .2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = IEQ.red}
                onMouseLeave={e => e.currentTarget.style.color = textSecondary}
                tabIndex={-1}
                title={showPwd ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        )}
      </div>
  );
}

export default function AdminUsers() {
  const [usuarios,        setUsuarios]        = useState([]);
  const [pendentes,       setPendentes]       = useState(new Set());
  const [loading,         setLoading]         = useState(true);
  const [sending,         setSending]         = useState(false);
  const [aprovando,       setAprovando]       = useState(null);
  const [uploadandoFoto,  setUploadandoFoto]  = useState(null);
  const [erro,            setErro]            = useState("");
  const [sucesso,         setSucesso]         = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editandoId,      setEditandoId]      = useState(null);
  const [form,            setForm]            = useState({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });
  const [isDark,          setIsDark]          = useState(() => localStorage.getItem("theme") === "dark");

  const fotoInputRef     = useRef(null);
  const fotoUsuarioIdRef = useRef(null);

  const bg            = isDark ? IEQ.dark     : "#F0EAE8";
  const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  useEffect(() => { localStorage.setItem("theme", isDark ? "dark" : "light"); }, [isDark]);

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const [resUsuarios, resPendentes] = await Promise.all([
        api.get("usuarios"),
        api.get("usuarios/com-alteracao-pendente"),
      ]);
      setUsuarios(resUsuarios.data);
      setPendentes(new Set(resPendentes.data.map(u => u.id)));
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Não foi possível sincronizar os usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarUsuarios(); }, [carregarUsuarios]);

  const mostrarSucesso = (msg) => {
    setSucesso(msg);
    setTimeout(() => setSucesso(""), 3500);
  };

  const adicionarUsuario = async (e) => {
    e.preventDefault();
    setSending(true);
    setErro("");
    try {
      await api.post("usuarios", form);
      setForm({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });
      carregarUsuarios();
      mostrarSucesso("Acesso liberado com sucesso.");
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Falha ao criar novo acesso.");
    } finally {
      setSending(false);
    }
  };

  const abrirEdicao = (u) => {
    setEditandoId(u.id);
    setForm({ nome: u.nome, email: u.email, senha: "", perfil: u.perfil });
    setIsEditModalOpen(true);
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.put(`usuarios/${editandoId}`, form);
      setIsEditModalOpen(false);
      setEditandoId(null);
      setForm({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Erro ao atualizar dados.");
    } finally {
      setSending(false);
    }
  };

  const deletarUsuario = async (id) => {
    if (!window.confirm("Esta ação removerá permanentemente o acesso. Confirmar?")) return;
    try {
      await api.delete(`usuarios/${id}`);
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Erro ao deletar.");
    }
  };

  const alternarStatus = async (id) => {
    try {
      await api.patch(`usuarios/${id}/status`);
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Erro ao alterar status.");
    }
  };

  const aprovarAlteracao = async (id, nome) => {
    if (!window.confirm(`Aprovar a solicitação de alteração de "${nome}"?`)) return;
    setAprovando(id);
    try {
      await api.patch(`usuarios/${id}/aprovar-alteracao`);
      mostrarSucesso(`Alteração de ${nome} aprovada com sucesso.`);
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Erro ao aprovar alteração.");
    } finally {
      setAprovando(null);
    }
  };

  const rejeitarAlteracao = async (id, nome) => {
    if (!window.confirm(`Rejeitar a solicitação de alteração de "${nome}"? Esta ação descartará os dados pendentes.`)) return;
    setAprovando(id);
    try {
      await api.patch(`usuarios/${id}/rejeitar-alteracao`);
      mostrarSucesso(`Alteração de ${nome} rejeitada.`);
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Erro ao rejeitar alteração.");
    } finally {
      setAprovando(null);
    }
  };

  // ── Foto de Perfil ──────────────────────────────────────────────────────────
  const abrirSeletorFoto = (id) => {
    fotoUsuarioIdRef.current = id;
    fotoInputRef.current.click();
  };

  const handleFotoSelecionada = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErro("Selecione um arquivo de imagem válido."); return; }
    if (file.size > 2 * 1024 * 1024)    { setErro("A imagem deve ter no máximo 2 MB.");       return; }

    const id = fotoUsuarioIdRef.current;
    setUploadandoFoto(id);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await api.patch(`usuarios/${id}/foto`, { fotoBase64: base64 });
      mostrarSucesso("Foto atualizada com sucesso.");
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Erro ao enviar a foto.");
    } finally {
      setUploadandoFoto(null);
      e.target.value = "";
    }
  };

  const removerFoto = async (id, nome) => {
    if (!window.confirm(`Remover a foto de perfil de "${nome}"?`)) return;
    setUploadandoFoto(id);
    try {
      await api.patch(`usuarios/${id}/foto`, { fotoBase64: null });
      mostrarSucesso("Foto removida.");
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Erro ao remover a foto.");
    } finally {
      setUploadandoFoto(null);
    }
  };

  const ativos       = usuarios.filter(u => u.ativo).length;
  const suspensos    = usuarios.filter(u => !u.ativo).length;
  const qtdPendentes = pendentes.size;

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing: border-box; }

    @keyframes stripe        { 0%   { background-position:0 0; } 100% { background-position:60px 60px; } }
    @keyframes pulse         { 0%,100% { transform:scale(1); opacity:.45; } 50% { transform:scale(1.12); opacity:.12; } }
    @keyframes spin          { to { transform: rotate(360deg); } }
    @keyframes pendentePulse { 0%,100% { box-shadow:0 0 0 0 rgba(253,184,19,.45); } 50% { box-shadow:0 0 0 5px rgba(253,184,19,0); } }

    .ieq-bg {
      position:fixed; inset:0; pointer-events:none; z-index:0;
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
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }

    .ieq-card {
      background: ${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border: 1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius: 14px;
      backdrop-filter: blur(24px);
    }

    .ieq-btn-primary {
      background: linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.red});
      color:#fff; border:none; border-radius:8px;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.18em;
      cursor:pointer; transition:all .25s; padding:13px 24px;
    }
    .ieq-btn-primary:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.12); }
    .ieq-btn-primary:disabled { opacity:.5; cursor:not-allowed; }

    .ieq-btn-blue {
      background: linear-gradient(135deg, ${IEQ.blueDark}, ${IEQ.blue});
      color:#fff; border:none; border-radius:8px;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.18em;
      cursor:pointer; transition:all .25s; padding:13px 24px;
    }
    .ieq-btn-blue:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.12); }
    .ieq-btn-blue:disabled { opacity:.5; cursor:not-allowed; }

    .ieq-btn-ghost {
      background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};
      color: ${isDark ? IEQ.offWhite : IEQ.redDark};
      border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      border-radius:8px; font-family:'Cinzel',serif; font-size:10px; font-weight:700;
      letter-spacing:.15em; cursor:pointer; transition:all .25s; padding:11px 20px;
    }
    .ieq-btn-ghost:hover { border-color:${IEQ.red}; background:rgba(200,16,46,.1); }

    .ieq-input-field {
      width:100%;
      background:${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      color:${isDark ? IEQ.offWhite : "#1A0A0D"};
      padding:13px 16px; border-radius:8px; outline:none;
      font-family:'EB Garamond',serif; font-size:15px; transition:all .25s;
    }
    .ieq-input-field:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-input-field::placeholder { color:${isDark ? "rgba(245,240,232,.25)" : "rgba(26,10,13,.3)"}; }

    .ieq-select-field {
      width:100%;
      background:${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      color:${isDark ? IEQ.offWhite : "#1A0A0D"};
      padding:13px 16px 13px 44px; border-radius:8px; outline:none;
      font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.12em;
      transition:all .25s; appearance:none; cursor:pointer;
    }
    .ieq-select-field:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-select-field option { background:${isDark ? "#110A0D" : "#fff"}; color:${isDark ? IEQ.offWhite : "#1A0A0D"}; }

    .ieq-member-row {
      display:flex; flex-direction:column;
      padding:14px 16px;
      background:${isDark ? "rgba(255,255,255,.02)" : "rgba(200,16,46,.03)"};
      border-bottom:1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.07)"};
      transition:all .2s; gap:10px;
    }
    .ieq-member-row:hover { background:${isDark ? "rgba(200,16,46,.06)" : "rgba(200,16,46,.06)"}; }
    .ieq-member-row:last-child { border-bottom:none; }
    .ieq-member-row.tem-pendencia {
      background:${isDark ? "rgba(253,184,19,.04)" : "rgba(253,184,19,.06)"};
      border-left:3px solid ${IEQ.yellow};
    }
    .ieq-member-row.tem-pendencia:hover { background:${isDark ? "rgba(253,184,19,.08)" : "rgba(253,184,19,.1)"}; }
    @media (min-width:600px) {
      .ieq-member-row { flex-direction:row; align-items:center; justify-content:space-between; padding:14px 18px; gap:12px; }
    }

    .ieq-member-identity { display:flex; align-items:center; gap:12px; min-width:0; flex:1; }

    .ieq-member-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding-left:0; }
    @media (min-width:600px) { .ieq-member-actions { flex-wrap:nowrap; flex-shrink:0; } }

    /* Avatar */
    .ieq-avatar {
      width:44px; height:44px; border-radius:8px; flex-shrink:0;
      background:linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.blue});
      display:flex; align-items:center; justify-content:center;
      color:#fff; font-family:'Cinzel',serif; font-weight:700; font-size:16px;
    }
    .ieq-avatar-inactive { background:${isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"} !important; }
    .ieq-avatar-pendente  { animation:pendentePulse 2s ease-in-out infinite; border:2px solid ${IEQ.yellow}; }

    /* Coluna do avatar + botão foto */
    .ieq-avatar-col {
      display:flex; flex-direction:column; align-items:center; gap:4px; flex-shrink:0;
    }

    .ieq-avatar-wrap {
      position:relative; width:44px; height:44px; flex-shrink:0; cursor:pointer;
    }
    .ieq-avatar-wrap:hover .ieq-avatar-overlay { opacity:1; }
    .ieq-avatar-overlay {
      position:absolute; inset:0; border-radius:8px;
      background:rgba(10,6,8,.55);
      display:flex; align-items:center; justify-content:center;
      opacity:0; transition:opacity .2s;
    }
    .ieq-avatar-img { width:100%; height:100%; object-fit:cover; border-radius:8px; display:block; }

    /* Botão "FOTO" sempre visível */
    .ieq-foto-btn {
      display:flex; align-items:center; gap:3px;
      background:none;
      border:1px solid ${IEQ.red};
      border-radius:4px;
      color:${IEQ.red};
      font-family:'Cinzel',serif; font-size:7px; font-weight:700; letter-spacing:.1em;
      cursor:pointer; padding:2px 6px; transition:all .2s; white-space:nowrap;
    }
    .ieq-foto-btn:hover:not(:disabled) { background:rgba(200,16,46,.12); }
    .ieq-foto-btn:disabled { opacity:.4; cursor:not-allowed; }

    .ieq-member-name {
      font-family:'Cinzel',serif; font-size:12px; font-weight:700;
      letter-spacing:.1em; margin:0;
      overflow-wrap:break-word; word-break:break-word; white-space:normal; line-height:1.35;
    }
    .ieq-member-email {
      font-family:'EB Garamond',serif; font-size:13px; margin:0;
      overflow-wrap:break-word; word-break:break-all; white-space:normal; line-height:1.3;
    }

    .pulse-ring {
      position:absolute; border-radius:50%;
      border:1px solid rgba(200,16,46,.35);
      animation:pulse 3s ease-in-out infinite;
    }
    .divider {
      height:1px;
      background:linear-gradient(90deg, transparent, ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}, transparent);
      margin:8px 0;
    }
    .spin-icon { animation:spin 1s linear infinite; }

    .ieq-modal-backdrop { position:fixed; inset:0; z-index:50; display:flex; align-items:flex-end; justify-content:center; }
    @media (min-width:520px) { .ieq-modal-backdrop { align-items:center; padding:12px; } }
    .ieq-modal-box {
      position:relative; z-index:10; width:100%; max-height:90vh;
      display:flex; flex-direction:column; border-radius:16px 16px 0 0; overflow:hidden;
    }
    @media (min-width:520px) { .ieq-modal-box { border-radius:14px; max-height:calc(100vh - 24px); } }

    .ieq-admin-grid { display:grid; grid-template-columns:1fr; gap:24px; }
    @media (min-width:900px) { .ieq-admin-grid { grid-template-columns:380px 1fr; } }

    .ieq-icon-btn {
      background:none; border:none; cursor:pointer;
      width:32px; height:32px; border-radius:6px;
      display:flex; align-items:center; justify-content:center;
      transition:all .2s; flex-shrink:0;
    }
    .ieq-icon-btn:disabled { opacity:.4; cursor:not-allowed; }

    .ieq-btn-aprovar {
      background:none; border:1px solid rgba(18,160,96,.35); border-radius:6px;
      color:#12A060; font-family:'Cinzel',serif; font-size:8px; font-weight:700; letter-spacing:.12em;
      cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:5px;
      padding:5px 10px; white-space:nowrap; flex-shrink:0;
    }
    .ieq-btn-aprovar:hover:not(:disabled) { background:rgba(18,160,96,.12); border-color:#12A060; }
    .ieq-btn-aprovar:disabled { opacity:.4; cursor:not-allowed; }

    .ieq-btn-rejeitar {
      background:none; border:1px solid rgba(200,16,46,.35); border-radius:6px;
      color:${IEQ.red}; font-family:'Cinzel',serif; font-size:8px; font-weight:700; letter-spacing:.12em;
      cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:5px;
      padding:5px 10px; white-space:nowrap; flex-shrink:0;
    }
    .ieq-btn-rejeitar:hover:not(:disabled) { background:rgba(200,16,46,.1); border-color:${IEQ.red}; }
    .ieq-btn-rejeitar:disabled { opacity:.4; cursor:not-allowed; }

    .ieq-perfil-badge {
      display:inline-flex; align-items:center;
      padding:4px 10px; border-radius:99px;
      font-family:'Cinzel',serif; font-size:8px; font-weight:700; letter-spacing:.12em;
      border:1px solid; white-space:nowrap;
    }

    .ieq-stat-box {
      background:${isDark ? "rgba(255,255,255,.03)" : "rgba(200,16,46,.04)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"};
      border-radius:10px; padding:14px 16px;
      display:flex; align-items:center; gap:12px;
    }

    .ieq-pendentes-banner {
      display:flex; align-items:center; gap:10px; padding:10px 18px;
      background:${isDark ? "rgba(253,184,19,.08)" : "rgba(253,184,19,.12)"};
      border-bottom:1px solid rgba(253,184,19,.25);
    }
  `;

  if (loading && usuarios.length === 0) return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background: bg }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');`}</style>
        <div style={{ textAlign:"center" }}>
          <QuadrangularCross size={48} />
          <p style={{ fontFamily:"'Cinzel',serif", color: isDark ? IEQ.offWhite : IEQ.redDark, marginTop:16, letterSpacing:".2em", fontSize:11 }}>CARREGANDO...</p>
        </div>
      </div>
  );

  return (
      <div style={{ minHeight:"100vh", background:bg, color:textPrimary, fontFamily:"'EB Garamond',serif", position:"relative", transition:"background .5s", paddingBottom:80 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg" />

        <div style={{ position:"relative", zIndex:10, maxWidth:1200, margin:"0 auto", padding:"24px 16px 0" }}>

          {/* HEADER */}
          <motion.header
              initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:14 }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                <div className="pulse-ring" style={{ width:68, height:68 }} />
                <div style={{ width:48, height:48, borderRadius:"50%", background: isDark ? "#1A0A0D" : "#fff", border:`1px solid rgba(200,16,46,.3)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <QuadrangularCross size={28} />
                </div>
              </div>
              <div>
                <h1 className="ieq-title" style={{ fontSize:"clamp(16px,4vw,22px)", fontWeight:700, letterSpacing:".18em", margin:0 }}>IEQ PITUAÇU</h1>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSecondary, margin:0 }}>
                  ADMINISTRAÇÃO · CONTROLE DE ACESSOS
                </p>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button className="ieq-btn-ghost" onClick={() => setIsDark(!isDark)} style={{ padding:"10px 12px" }}>
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button className="ieq-btn-primary" onClick={handleLogout} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px" }}>
                <LogOut size={14} /> SAIR
              </button>
            </div>
          </motion.header>

          {/* KPI */}
          <motion.div
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
              style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:24 }}
          >
            {[
              { icon:<Users size={18}/>,  label:"TOTAL",     value:usuarios.length, color:IEQ.blue       },
              { icon:<Power size={18}/>,  label:"ATIVOS",    value:ativos,          color:"#12A060"      },
              { icon:<Shield size={18}/>, label:"SUSPENSOS", value:suspensos,       color:IEQ.redDark    },
              { icon:<Clock size={18}/>,  label:"PENDENTES", value:qtdPendentes,    color:IEQ.yellowDark },
            ].map(({ icon, label, value, color }) => (
                <div key={label} className="ieq-stat-box">
                  <div style={{ width:36, height:36, borderRadius:8, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>
                    {icon}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".2em", color:textSecondary, margin:0 }}>{label}</p>
                    <p style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(20px,5vw,28px)", fontWeight:700, color: label === "PENDENTES" && value > 0 ? IEQ.yellowDark : textPrimary, margin:0, lineHeight:1.1 }}>
                      {loading ? "…" : value}
                    </p>
                  </div>
                </div>
            ))}
          </motion.div>

          {/* GRID */}
          <div className="ieq-admin-grid">

            {/* FORMULÁRIO */}
            <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:.15 }}>
              <div className="ieq-card" style={{ padding:"24px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
                  <div style={{ width:38, height:38, borderRadius:8, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", flexShrink:0 }}>
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>NOVO ACESSO</h3>
                    <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:0 }}>Liberar usuário no sistema</p>
                  </div>
                </div>
                <div className="divider" style={{ marginBottom:18 }} />
                <form onSubmit={adicionarUsuario} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <InputIEQ icon={<User size={15}/>}  type="text"     placeholder="Nome do usuário"      value={form.nome}  onChange={v => setForm({...form, nome:v})}  isDark={isDark} />
                  <InputIEQ icon={<Mail size={15}/>}  type="email"    placeholder="E-mail institucional" value={form.email} onChange={v => setForm({...form, email:v})} isDark={isDark} />
                  <InputIEQ icon={<Key size={15}/>}   type="password" placeholder="Senha de acesso"      value={form.senha} onChange={v => setForm({...form, senha:v})} isDark={isDark} />
                  <div style={{ position:"relative" }}>
                    <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.7, pointerEvents:"none" }}>
                      <Shield size={15} />
                    </div>
                    <select className="ieq-select-field" value={form.perfil} onChange={e => setForm({...form, perfil:e.target.value})}>
                      {perfis.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={sending} className="ieq-btn-primary" style={{ marginTop:4, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    {sending ? <Loader2 size={15} className="spin-icon" /> : <><UserPlus size={14}/> LIBERAR ACESSO</>}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* LISTAGEM */}
            <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:.2 }}>
              <div className="ieq-card" style={{ overflow:"hidden" }}>

                {/* cabeçalho */}
                <div style={{ padding:"18px 20px", borderBottom:`1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:8, background:`linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                      <Users size={15} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>BASE DE USUÁRIOS</h3>
                      <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:0 }}>{usuarios.length} registros</p>
                    </div>
                  </div>
                  <button className="ieq-btn-ghost" style={{ padding:"8px 12px", display:"flex", alignItems:"center", gap:6 }} onClick={carregarUsuarios}>
                    <RefreshCcw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                    ATUALIZAR
                  </button>
                </div>

                {/* banner pendências */}
                <AnimatePresence>
                  {qtdPendentes > 0 && (
                      <motion.div
                          initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
                          className="ieq-pendentes-banner"
                      >
                        <Clock size={14} style={{ color:IEQ.yellowDark, flexShrink:0 }} />
                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".14em", color:IEQ.yellowDark }}>
                      {qtdPendentes} SOLICITAÇÃO{qtdPendentes > 1 ? "ÕES" : ""} DE ALTERAÇÃO AGUARDANDO APROVAÇÃO
                    </span>
                      </motion.div>
                  )}
                </AnimatePresence>

                {/* lista */}
                <div style={{ minHeight:120 }}>
                  {loading && usuarios.length === 0 ? (
                      <div style={{ padding:48, display:"flex", justifyContent:"center" }}>
                        <Loader2 size={30} style={{ animation:"spin 1s linear infinite", color:IEQ.red }} />
                      </div>
                  ) : (
                      <AnimatePresence>
                        {usuarios.map((u, i) => {
                          const temPendencia  = pendentes.has(u.id);
                          const estaAprovando = aprovando === u.id;
                          const enviandoFoto  = uploadandoFoto === u.id;

                          return (
                              <motion.div
                                  key={u.id}
                                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-20 }}
                                  transition={{ delay: i * 0.04 }}
                                  className={`ieq-member-row${temPendencia ? " tem-pendencia" : ""}`}
                              >
                                {/* ── IDENTIDADE ── */}
                                <div className="ieq-member-identity">

                                  {/* coluna: avatar + botão FOTO sempre visível */}
                                  <div className="ieq-avatar-col">
                                    <div
                                        className="ieq-avatar-wrap"
                                        onClick={() => abrirSeletorFoto(u.id)}
                                        title="Clique para alterar a foto"
                                    >
                                      {u.fotoPerfil ? (
                                          <img
                                              src={u.fotoPerfil}
                                              alt={u.nome}
                                              className="ieq-avatar-img"
                                              style={{
                                                border:    temPendencia ? `2px solid ${IEQ.yellow}` : "none",
                                                animation: temPendencia ? "pendentePulse 2s ease-in-out infinite" : "none",
                                                opacity:   u.ativo ? 1 : 0.45,
                                              }}
                                          />
                                      ) : (
                                          <div
                                              className={["ieq-avatar", u.ativo ? "" : "ieq-avatar-inactive", temPendencia ? "ieq-avatar-pendente" : ""].join(" ").trim()}
                                              style={u.ativo ? {} : { background: isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)" }}
                                          >
                                            {u.nome?.charAt(0).toUpperCase()}
                                          </div>
                                      )}
                                      <div className="ieq-avatar-overlay">
                                        {enviandoFoto
                                            ? <Loader2 size={14} color="#fff" style={{ animation:"spin 1s linear infinite" }} />
                                            : <Camera size={14} color="#fff" />
                                        }
                                      </div>
                                    </div>

                                    {/* ── BOTÃO FOTO SEMPRE VISÍVEL ── */}
                                    <button
                                        className="ieq-foto-btn"
                                        onClick={() => u.fotoPerfil ? removerFoto(u.id, u.nome) : abrirSeletorFoto(u.id)}
                                        disabled={enviandoFoto}
                                        title={u.fotoPerfil ? "Remover foto" : "Adicionar foto"}
                                    >
                                      {enviandoFoto
                                          ? <Loader2 size={9} style={{ animation:"spin 1s linear infinite" }} />
                                          : <Camera size={9} />
                                      }
                                      {enviandoFoto ? "..." : u.fotoPerfil ? "REMOVER" : "FOTO"}
                                    </button>
                                  </div>

                                  <div style={{ minWidth:0, flex:1 }}>
                                    <p className="ieq-member-name" style={{ color:textPrimary }}>{u.nome}</p>
                                    <p className="ieq-member-email" style={{ color:textSecondary }}>{u.email}</p>
                                  </div>
                                </div>

                                {/* ── AÇÕES ── */}
                                <div className="ieq-member-actions">

                            <span className="ieq-perfil-badge" style={{ color:IEQ.blue, borderColor:`${IEQ.blue}30`, background:`${IEQ.blue}10` }}>
                              {u.perfil?.replace(/_/g," ")}
                            </span>

                                  <span className="ieq-perfil-badge" style={{
                                    color:       u.ativo ? "#12A060" : textSecondary,
                                    borderColor: u.ativo ? "#12A06030" : (isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"),
                                    background:  u.ativo ? "#12A06010" : (isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)"),
                                    display:"flex", alignItems:"center", gap:5,
                                  }}>
                              <span style={{
                                width:6, height:6, borderRadius:"50%", display:"inline-block", flexShrink:0,
                                background: u.ativo ? "#12A060" : (isDark ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.2)"),
                                animation:  u.ativo ? "pulse 2s ease-in-out infinite" : "none",
                              }} />
                                    {u.ativo ? "ATIVO" : "SUSPENSO"}
                            </span>

                                  {/* aprovar / rejeitar */}
                                  <AnimatePresence>
                                    {temPendencia && (
                                        <motion.div
                                            initial={{ opacity:0, scale:.85 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.85 }}
                                            style={{ display:"flex", gap:6, alignItems:"center" }}
                                        >
                                          <button className="ieq-btn-aprovar" onClick={() => aprovarAlteracao(u.id, u.nome)} disabled={estaAprovando}>
                                            {estaAprovando ? <Loader2 size={12} className="spin-icon" /> : <CheckCircle size={12} />}
                                            APROVAR
                                          </button>
                                          <button className="ieq-btn-rejeitar" onClick={() => rejeitarAlteracao(u.id, u.nome)} disabled={estaAprovando}>
                                            {estaAprovando ? <Loader2 size={12} className="spin-icon" /> : <XCircle size={12} />}
                                            REJEITAR
                                          </button>
                                        </motion.div>
                                    )}
                                  </AnimatePresence>

                                  {/* editar */}
                                  <button
                                      className="ieq-icon-btn" title="Editar" onClick={() => abrirEdicao(u)}
                                      style={{ color:textSecondary }}
                                      onMouseEnter={e => { e.currentTarget.style.color=IEQ.blue; e.currentTarget.style.background=`${IEQ.blue}12`; }}
                                      onMouseLeave={e => { e.currentTarget.style.color=textSecondary; e.currentTarget.style.background="none"; }}
                                  >
                                    <Pencil size={15} />
                                  </button>

                                  {/* alternar status */}
                                  <button
                                      className="ieq-icon-btn" title="Alternar status" onClick={() => alternarStatus(u.id)}
                                      style={{ color: u.ativo ? IEQ.yellowDark : "#12A060" }}
                                      onMouseEnter={e => { e.currentTarget.style.background = u.ativo ? "rgba(253,184,19,.12)" : "rgba(18,160,96,.12)"; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                                  >
                                    <Power size={15} />
                                  </button>

                                  {/* deletar */}
                                  <button
                                      className="ieq-icon-btn" title="Excluir" onClick={() => deletarUsuario(u.id)}
                                      style={{ color:textSecondary }}
                                      onMouseEnter={e => { e.currentTarget.style.color=IEQ.red; e.currentTarget.style.background="rgba(200,16,46,.1)"; }}
                                      onMouseLeave={e => { e.currentTarget.style.color=textSecondary; e.currentTarget.style.background="none"; }}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </motion.div>
                          );
                        })}
                      </AnimatePresence>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <p style={{ textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSecondary, padding:"28px 0 0" }}>
            © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
          </p>
        </div>

        {/* input foto oculto */}
        <input ref={fotoInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFotoSelecionada} />

        {/* MODAL DE EDIÇÃO */}
        <AnimatePresence>
          {isEditModalOpen && (
              <div className="ieq-modal-backdrop">
                <motion.div
                    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    onClick={() => setIsEditModalOpen(false)}
                    style={{ position:"fixed", inset:0, background:"rgba(10,6,8,.85)", backdropFilter:"blur(16px)", zIndex:0 }}
                />
                <motion.div
                    initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }}
                    className="ieq-card ieq-modal-box" style={{ maxWidth:440 }}
                >
                  <div style={{ padding:"24px 20px", overflowY:"auto", flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <QuadrangularCross size={26} />
                        <div>
                          <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, letterSpacing:".15em", color:textPrimary, margin:0 }}>EDITAR USUÁRIO</h2>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:12, color:textSecondary, margin:0 }}>ID: {editandoId}</p>
                        </div>
                      </div>
                      <button
                          onClick={() => setIsEditModalOpen(false)}
                          style={{ background:"none", border:"none", cursor:"pointer", color:textSecondary, padding:6, borderRadius:6 }}
                          onMouseEnter={e => e.currentTarget.style.color=IEQ.red}
                          onMouseLeave={e => e.currentTarget.style.color=textSecondary}
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="divider" style={{ marginBottom:16 }} />
                    <form onSubmit={salvarEdicao} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      <InputIEQ icon={<User size={15}/>}  type="text"     placeholder="Nome"                        value={form.nome}  onChange={v => setForm({...form, nome:v})}  isDark={isDark} />
                      <InputIEQ icon={<Mail size={15}/>}  type="email"    placeholder="E-mail"                      value={form.email} onChange={v => setForm({...form, email:v})} isDark={isDark} />
                      <InputIEQ icon={<Key size={15}/>}   type="password" placeholder="Nova senha (vazio = manter)" value={form.senha} onChange={v => setForm({...form, senha:v})} isDark={isDark} />
                      <div style={{ position:"relative" }}>
                        <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.7, pointerEvents:"none" }}>
                          <Shield size={15} />
                        </div>
                        <select className="ieq-select-field" value={form.perfil} onChange={e => setForm({...form, perfil:e.target.value})}>
                          {perfis.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
                        </select>
                      </div>
                      <div style={{ display:"flex", gap:10, marginTop:6 }}>
                        <button type="button" className="ieq-btn-ghost" style={{ flex:1 }} onClick={() => setIsEditModalOpen(false)}>CANCELAR</button>
                        <button type="submit" className="ieq-btn-blue" style={{ flex:2, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }} disabled={sending}>
                          {sending ? <Loader2 size={15} className="spin-icon" /> : "SALVAR ALTERAÇÕES"}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
          )}
        </AnimatePresence>

        {/* TOAST SUCESSO */}
        <AnimatePresence>
          {sucesso && (
              <motion.div
                  initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
                  style={{ position:"fixed", bottom:72, left:"50%", transform:"translateX(-50%)", background:"#12A060", color:"#fff", padding:"14px 20px", borderRadius:10, fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".15em", display:"flex", alignItems:"center", gap:12, zIndex:200, maxWidth:"90vw", boxShadow:"0 8px 32px rgba(18,160,96,.35)" }}
              >
                <CheckCircle size={14} />
                <span>{sucesso}</span>
              </motion.div>
          )}
        </AnimatePresence>

        {/* TOAST ERRO */}
        <AnimatePresence>
          {erro && (
              <motion.div
                  initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
                  style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background:IEQ.red, color:"#fff", padding:"14px 20px", borderRadius:10, fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".15em", display:"flex", alignItems:"center", gap:12, zIndex:200, maxWidth:"90vw", boxShadow:"0 8px 32px rgba(200,16,46,.35)" }}
              >
                <Power size={14} />
                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{erro}</span>
                <button onClick={() => setErro("")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.7)", padding:0, marginLeft:4, display:"flex" }}>
                  <X size={15} />
                </button>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import { AURA, theme } from "./liderTheme";
import TelaCarregando from "../../components/TelaCarregando.jsx";
import {
  Plus, Phone, X, Search,
  Loader2, UserCheck, Mail, ExternalLink, Trash2, AlertTriangle,
  Flame, Calendar, Users, BookOpen, MapPin,
} from "lucide-react";

const listaOrigens = [
  { id:"CONVITE",       label:"Convite",     emoji:"🤝" },
  { id:"CASA_DE_PAZ",   label:"Casa de Paz", emoji:"🏠" },
  { id:"EVENTO",        label:"Evento",      emoji:"⛺" },
  { id:"MISSAO_70",     label:"Missão 70",   emoji:"👥" },
  { id:"REDES_SOCIAIS", label:"Social",      emoji:"📱" },
  { id:"CELULA",        label:"Célula",      emoji:"✝️" },
];

const textoDecisao = {
  NENHUMA:       "Nenhuma decisão",
  ACEITOU_JESUS: "Aceitou a Jesus 🙌",
  RECONCILIOU:   "Reconciliou 🤝",
  BATISMO_AGUAS: "Decidiu pelo Batismo 💧",
};

function makeStyles(t, isDark) {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; }

    @keyframes tv-spin   { to { transform: rotate(360deg); } }
    @keyframes tv-fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes tv-pulse  { 0%,100%{opacity:.35} 50%{opacity:.08} }
    @keyframes tv-slideUp{ from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }

    /* ── Root: NÃO tem mais fundo/gradiente/min-height/isolation próprios.
       Este componente é renderizado DENTRO do DashboardLider (.dl-root),
       que já fornece o fundo em gradiente e o brilho (.dl-glow) da página.
       Duplicar isso aqui criava o efeito de "tela dentro de tela". ── */
    .tv-root {
      font-family: 'Inter', sans-serif;
      color: ${t.text};
      position: relative;
      overflow-x: hidden;
      padding-bottom: 48px;
      transition: color .3s;
    }

    .tv-content {
      position: relative; z-index: 1;
      max-width: 900px; margin: 0 auto; padding: 0 16px;
    }

    /* ── Hero ── */
    .tv-hero {
      position:relative; overflow:hidden; border-radius:20px; padding:26px 24px;
      background:linear-gradient(135deg, ${AURA.redDark} 0%, ${AURA.blueDark} 50%, ${AURA.mossDeep} 100%);
      margin-bottom:22px; text-align:center;
    }
    .tv-hero::before {
      content:''; position:absolute; top:-30px; right:-30px; width:100px; height:100px;
      border-radius:50%; background:rgba(255,255,255,.05); pointer-events:none;
    }
    .tv-hero::after {
      content:''; position:absolute; bottom:-20px; left:20%; width:80px; height:80px;
      border-radius:50%; background:rgba(184,137,46,.06); pointer-events:none;
    }
    .tv-hero-icon {
      width:52px; height:52px; border-radius:16px; background:rgba(255,255,255,.12);
      display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;
      backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,.15); position:relative; z-index:1;
    }
    .tv-hero-title {
      font-family:'Playfair Display',serif; font-size:22px; font-weight:600; color:#fff;
      margin:0 0 4px; position:relative; z-index:1;
    }
    .tv-hero-sub { font-size:12px; color:rgba(255,255,255,.55); margin:0; position:relative; z-index:1; }

    /* ── Summary ── */
    .tv-summary { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px; }
    .tv-summary-card {
      padding:16px 10px; border-radius:14px; background:${t.bgEl}; border:1px solid ${t.border};
      text-align:center; display:flex; flex-direction:column; align-items:center; gap:6px;
    }
    .tv-summary-icon {
      width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center;
    }
    .tv-summary-value { font-family:'Playfair Display',serif; font-size:24px; font-weight:700; color:${AURA.gold}; margin:0 0 2px; }
    .tv-summary-label { font-size:10px; color:${t.textMuted}; margin:0; text-transform:uppercase; letter-spacing:.05em; font-weight:600; }

    /* ── Search ── */
    .tv-search-wrap {
      position:relative; margin-bottom:18px;
    }
    .tv-search-icon {
      position:absolute; left:16px; top:50%; transform:translateY(-50%);
      color:${AURA.gold}; opacity:.6; pointer-events:none;
    }
    .tv-search-input {
      width:100%; padding:13px 16px 13px 48px; border-radius:14px;
      background:${t.bgEl}; border:1px solid ${t.border};
      color:${t.text}; font-family:'Inter',sans-serif; font-size:13px;
      outline:none; transition:border-color .2s;
    }
    .tv-search-input:focus { border-color:${AURA.gold}; }
    .tv-search-input::placeholder { color:${t.placeholder}; }
    .tv-search-clear {
      position:absolute; right:12px; top:50%; transform:translateY(-50%);
      width:24px; height:24px; border-radius:50%; border:none; cursor:pointer;
      background:${isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.06)"}; color:${t.textMuted};
      display:flex; align-items:center; justify-content:center; transition:all .2s;
    }
    .tv-search-clear:hover { background:${AURA.red}; color:#fff; }

    /* ── Botão Novo Visitante (destaque) ── */
    .tv-btn-novo {
      display:flex; align-items:center; gap:14px; width:100%; padding:16px 20px;
      border-radius:16px; border:none; cursor:pointer;
      background:linear-gradient(135deg, ${AURA.mossDeep}, ${AURA.moss});
      margin-bottom:20px; transition:all .3s cubic-bezier(.4,0,.2,1);
      box-shadow:0 6px 20px rgba(30,63,102,.25);
    }
    .tv-btn-novo:hover {
      transform:translateY(-2px); box-shadow:0 10px 30px rgba(30,63,102,.35);
      filter:brightness(1.1);
    }
    .tv-btn-novo:active { transform:translateY(0); }
    .tv-btn-novo-icon {
      width:48px; height:48px; border-radius:14px; flex-shrink:0;
      background:linear-gradient(135deg, ${AURA.mossDeep}, ${AURA.moss});
      display:flex; align-items:center; justify-content:center; color:#fff;
      box-shadow:0 4px 14px rgba(30,63,102,.3);
    }
    .tv-btn-novo-title {
      display:block; font-family:'Playfair Display',serif; font-size:15px; font-weight:600;
      color:#fff; margin:0 0 2px;
    }
    .tv-btn-novo-sub {
      display:block; font-size:11px; color:rgba(255,255,255,.6); margin:0;
    }

    /* ── List ── */
    .tv-list-section {
      font-size:9.5px; font-weight:700; letter-spacing:.07em; text-transform:uppercase;
      color:${t.textMuted}; margin:0 0 10px; display:flex; align-items:center; gap:6px;
    }
    .tv-list-section::after { content:''; flex:1; height:1px; background:${t.border}; }

    .tv-list-card {
      border-radius:16px; background:${t.bgEl}; border:1px solid ${t.border};
      overflow:hidden; backdrop-filter:blur(10px);
    }

    .tv-list-item {
      display:flex; align-items:center; gap:12px; padding:14px 16px;
      border-bottom:1px solid ${t.border}; transition:all .25s;
      animation:tv-fadeIn .4s ease both;
      position:relative;
    }
    .tv-list-item:last-child { border-bottom:none; }
    .tv-list-item:hover { background:${isDark ? "rgba(255,255,255,.03)" : "rgba(30,63,102,.03)"}; }
    .tv-list-item.has-decision::before {
      content:''; position:absolute; left:0; top:8px; bottom:8px; width:3px; border-radius:0 3px 3px 0;
      background:linear-gradient(180deg, ${AURA.green}, ${AURA.moss});
    }

    .tv-list-avatar {
      width:40px; height:40px; border-radius:12px; flex-shrink:0;
      background:linear-gradient(135deg, ${AURA.redDark}, ${AURA.blueDark});
      display:flex; align-items:center; justify-content:center; color:#fff;
      font-family:'Playfair Display',serif; font-weight:600; font-size:16px;
    }
    .tv-list-avatar.decided {
      background:linear-gradient(135deg, ${AURA.greenDark}, ${AURA.green});
    }

    .tv-list-body { flex:1; min-width:0; }
    .tv-list-name {
      font-family:'Playfair Display',serif; font-size:14px; font-weight:600; color:${t.text};
      margin:0 0 3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .tv-list-meta {
      display:flex; flex-wrap:wrap; gap:8px; font-size:11px; color:${t.textMuted}; margin:0;
    }
    .tv-list-meta span { display:inline-flex; align-items:center; gap:3px; }

    .tv-list-right { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
    .tv-list-origin {
      font-size:9px; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
      padding:3px 8px; border-radius:100px;
      background:rgba(184,137,46,.08); color:${AURA.gold}; border:1px solid rgba(184,137,46,.15);
    }
    .tv-list-decision {
      font-size:10px; font-weight:600; padding:3px 8px; border-radius:100px;
    }
    .tv-list-decision.aceitou { background:rgba(74,124,92,.12); color:${AURA.green}; }
    .tv-list-decision.reconciliou { background:rgba(76,126,176,.12); color:${AURA.mossLight}; }
    .tv-list-decision.batismo { background:rgba(184,137,46,.12); color:${AURA.goldLight}; }

    .tv-list-edit {
      width:32px; height:32px; border-radius:9px; flex-shrink:0;
      background:rgba(184,137,46,.08); border:1px solid rgba(184,137,46,.2);
      color:${AURA.gold}; cursor:pointer; display:flex; align-items:center; justify-content:center;
      transition:all .2s;
    }
    .tv-list-edit:hover { background:${AURA.gold}; color:#0A0A0F; }

    /* ── Modal ── */
    .tv-modal-overlay {
      position:fixed; inset:0; z-index:1000;
      display:flex; align-items:center; justify-content:center; padding:16px;
      background:rgba(10,10,15,.88); backdrop-filter:blur(8px);
    }
    .tv-modal-box {
      width:100%; max-width:520px; max-height:90vh;
      overflow-y:auto; position:relative;
      background:${t.bgEl}; border:1px solid ${t.border};
      border-radius:24px; padding:0;
      box-shadow:0 24px 64px rgba(0,0,0,.4);
    }

    .tv-modal-hero {
      position:relative; overflow:hidden; padding:24px 28px 18px;
      background:linear-gradient(135deg, ${AURA.mossDeep} 0%, ${AURA.blueDark} 100%);
      border-radius:24px 24px 0 0;
    }
    .tv-modal-hero::before {
      content:''; position:absolute; top:-20px; right:-20px; width:70px; height:70px;
      border-radius:50%; background:rgba(255,255,255,.05); pointer-events:none;
    }
    .tv-modal-hero-top { display:flex; align-items:center; justify-content:space-between; position:relative; z-index:1; }
    .tv-modal-hero-left { display:flex; align-items:center; gap:12px; }
    .tv-modal-hero-icon {
      width:42px; height:42px; border-radius:13px; background:rgba(255,255,255,.12);
      display:flex; align-items:center; justify-content:center;
      backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,.15);
    }
    .tv-modal-hero-title {
      font-family:'Playfair Display',serif; font-size:18px; font-weight:600; color:#fff; margin:0;
    }
    .tv-modal-hero-sub { font-size:11px; color:rgba(255,255,255,.5); margin:2px 0 0; }
    .tv-modal-close {
      width:32px; height:32px; border-radius:50%; border:1px solid rgba(255,255,255,.15);
      background:rgba(255,255,255,.08); color:#fff; cursor:pointer;
      display:flex; align-items:center; justify-content:center; transition:all .2s;
    }
    .tv-modal-close:hover { background:rgba(255,255,255,.18); }

    .tv-modal-body { padding:20px 28px 28px; }

    .tv-modal-section { margin-bottom:18px; }
    .tv-modal-section-label {
      font-size:9.5px; font-weight:700; letter-spacing:.07em; text-transform:uppercase;
      color:${t.textMuted}; margin:0 0 10px; display:flex; align-items:center; gap:6px;
    }
    .tv-modal-section-label::after { content:''; flex:1; height:1px; background:${t.border}; }

    .tv-modal-card {
      padding:16px; border-radius:14px; background:${isDark?"rgba(255,255,255,.02)":"rgba(30,63,102,.02)"};
      border:1px solid ${t.border};
    }

    .tv-field { margin-bottom:14px; }
    .tv-field:last-child { margin-bottom:0; }
    .tv-field label {
      display:flex; align-items:center; gap:5px; font-size:10.5px; font-weight:600;
      letter-spacing:.04em; text-transform:uppercase; color:${t.textMuted}; margin-bottom:7px;
    }
    .tv-field input, .tv-field select {
      width:100%; padding:11px 14px; border-radius:12px; background:${t.bgInput};
      border:1px solid ${t.borderInput}; color:${t.text}; font-size:13px;
      font-family:'Inter',sans-serif; outline:none; transition:border-color .2s;
    }
    .tv-field select option { background:${isDark?"#0A0A0F":"#fff"}; color:${t.text}; }
    .tv-field input:focus, .tv-field select:focus { border-color:${AURA.gold}; }
    .tv-field input::placeholder { color:${t.placeholder}; }

    .tv-origin-grid { display:flex; flex-wrap:wrap; gap:8px; }
    .tv-origin-pill {
      padding:8px 14px; border-radius:100px; cursor:pointer;
      font-family:'Inter',sans-serif; font-size:11px; font-weight:600; letter-spacing:.04em;
      border:1px solid ${t.border}; background:transparent; color:${t.textSec};
      transition:all .2s; display:inline-flex; align-items:center; gap:5px;
    }
    .tv-origin-pill:hover { border-color:${AURA.gold}; color:${AURA.gold}; }
    .tv-origin-pill.selected {
      background:linear-gradient(135deg, ${AURA.mossDeep}, ${AURA.moss});
      border-color:${AURA.moss}; color:#fff;
    }

    .tv-modal-footer {
      position:sticky; bottom:0; background:${t.bgEl};
      padding:16px 28px 0; margin:0 -28px;
    }

    .tv-btn-save {
      width:100%; display:flex; align-items:center; justify-content:center; gap:7px;
      padding:14px; border-radius:100px; border:none; cursor:pointer;
      background:linear-gradient(135deg, ${AURA.mossDeep}, ${AURA.moss});
      color:#fff; font-family:'Inter',sans-serif;
      font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
      transition:all .3s; box-shadow:0 6px 22px rgba(30,63,102,.3);
    }
    .tv-btn-save:hover:not(:disabled) { transform:translateY(-2px); opacity:.9; }
    .tv-btn-save:disabled { opacity:.5; cursor:not-allowed; }

    .tv-btn-danger {
      display:flex; align-items:center; justify-content:center; gap:7px;
      width:100%; padding:13px; border-radius:100px; cursor:pointer;
      background:transparent; border:1px solid rgba(200,16,46,.3);
      color:${AURA.red}; font-family:'Inter',sans-serif;
      font-size:10px; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
      transition:all .25s;
    }
    .tv-btn-danger:hover { background:rgba(200,16,46,.08); border-color:${AURA.red}; }

    .tv-btn-danger-confirm {
      flex:1; display:flex; align-items:center; justify-content:center; gap:7px;
      padding:13px; border-radius:100px; border:none; cursor:pointer;
      background:linear-gradient(135deg, #7A0B1A, ${AURA.redDark});
      color:#fff; font-family:'Inter',sans-serif;
      font-size:10px; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
      transition:all .25s;
    }
    .tv-btn-danger-confirm:hover:not(:disabled) { filter:brightness(1.15); }
    .tv-btn-danger-confirm:disabled { opacity:.5; cursor:not-allowed; }

    .tv-btn-cancel {
      flex:1; display:flex; align-items:center; justify-content:center; gap:7px;
      padding:13px; border-radius:100px; cursor:pointer;
      background:${isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)"};
      border:1px solid ${t.border};
      color:${t.textSec}; font-family:'Inter',sans-serif;
      font-size:10px; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
      transition:all .25s;
    }
    .tv-btn-cancel:hover { border-color:${AURA.gold}; color:${AURA.gold}; }

    .tv-confirm-box {
      background:${isDark?"rgba(155,11,30,.1)":"rgba(200,16,46,.05)"};
      border:1px solid rgba(200,16,46,.25);
      border-radius:16px; padding:18px;
    }

    .tv-divider { height:1px; background:linear-gradient(90deg,transparent,${t.border},transparent); margin:8px 0; }

    /* ── Empty ── */
    .tv-empty {
      text-align:center; padding:60px 16px; color:${t.textMuted};
      display:flex; flex-direction:column; align-items:center; gap:10px;
    }

    /* ── Responsive ── */
    @media (max-width:600px) {
      .tv-modal-overlay { align-items:flex-end; padding:0; }
      .tv-modal-box { max-width:100%; width:100%; height:95vh; max-height:95vh; border-radius:24px 24px 0 0; animation:tv-slideUp .3s cubic-bezier(.1,.76,.55,.94); }
      .tv-modal-body { overflow-y:auto; flex:1; }
      .tv-summary { grid-template-columns:repeat(3,1fr); }
      .tv-hero-title { font-size:18px; }
    }
    @media (max-width:480px) {
      .tv-summary { grid-template-columns:1fr 1fr; }
      .tv-list-meta { flex-direction:column; gap:2px; }
    }
  `;
}

export default function TelaVisitantes({ celulaId, isDark = false }) {
  const t = theme(isDark);
  const [loading,              setLoading]              = useState(false);
  const [visitantes,           setVisitantes]           = useState([]);
  const [busca,                setBusca]                = useState("");
  const [modalAberto,          setModalAberto]          = useState(false);
  const [editando,             setEditando]             = useState(false);
  const [visitanteSelecionado, setVisitanteSelecionado] = useState(null);
  const [confirmandoDeletar,   setConfirmandoDeletar]   = useState(false);
  const [deletando,            setDeletando]            = useState(false);

  const estadoInicial = {
    nome:"", telefone:"", email:"",
    dataPrimeiraVisita: new Date().toISOString().split("T")[0],
    origem:"CONVITE", responsavelAcompanhamento:"", decisaoEspiritual:"NENHUMA", ativo:true,
  };
  const [formVisitante, setFormVisitante] = useState(estadoInicial);

  const getHeaders = () => {
    const token = localStorage.getItem("token")?.replace(/"/g,"").trim();
    return { Authorization: `Bearer ${token}` };
  };

  const carregarVisitantes = useCallback(async () => {
    if (!celulaId) return;
    try {
      setLoading(true);
      const res = await api.get(`/visitantes/celula/${celulaId}/ativos`, { headers: getHeaders() });
      setVisitantes(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [celulaId]);

  useEffect(() => { carregarVisitantes(); }, [carregarVisitantes]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...formVisitante, celulaId: Number(celulaId) };
      if (editando && visitanteSelecionado) {
        await api.put(`/visitantes/${visitanteSelecionado.id}`, payload, { headers: getHeaders() });
      } else {
        await api.post("/visitantes", payload, { headers: getHeaders() });
      }
      fecharModal(); carregarVisitantes();
    } catch { alert("Erro ao salvar dados."); }
    finally { setLoading(false); }
  };

  const handleDeletar = async () => {
    if (!visitanteSelecionado) return;
    try {
      setDeletando(true);
      await api.delete(`/visitantes/${visitanteSelecionado.id}`, { headers: getHeaders() });
      fecharModal(); carregarVisitantes();
    } catch { alert("Erro ao remover visitante."); }
    finally { setDeletando(false); }
  };

  const abrirModal = (v = null) => {
    setConfirmandoDeletar(false);
    if (v) { setEditando(true); setVisitanteSelecionado(v); setFormVisitante({ ...v, decisaoEspiritual: v.decisaoEspiritual || "NENHUMA" }); }
    else   { setEditando(false); setFormVisitante(estadoInicial); }
    setModalAberto(true);
  };

  const fecharModal = () => { setModalAberto(false); setConfirmandoDeletar(false); setFormVisitante(estadoInicial); };

  const filtrados = visitantes.filter(v => v.nome.toLowerCase().includes(busca.toLowerCase()));

  const totalComDecisao = visitantes.filter(v => v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA").length;
  const totalConsolidador = visitantes.filter(v => v.responsavelAcompanhamento && v.responsavelAcompanhamento.trim()).length;

  return (
      <div className="tv-root">
        <style>{makeStyles(t, isDark)}</style>

        <div className="tv-content" style={{ paddingTop:20 }}>

          {/* ── Hero ── */}
          <div className="tv-hero">
            <div className="tv-hero-icon">
              <Users size={24} color="#fff" />
            </div>
            <p className="tv-hero-title">Visitantes</p>
            <p className="tv-hero-sub">Gestão e acompanhamento de novos visitantes</p>
          </div>

          {/* ── Summary ── */}
          {!loading && visitantes.length > 0 && (
              <div className="tv-summary">
                <div className="tv-summary-card">
                  <div className="tv-summary-icon" style={{ background:"rgba(184,137,46,.1)" }}><Users size={16} color={AURA.gold} /></div>
                  <p className="tv-summary-value">{visitantes.length}</p>
                  <p className="tv-summary-label">Visitantes</p>
                </div>
                <div className="tv-summary-card">
                  <div className="tv-summary-icon" style={{ background:"rgba(74,124,92,.12)" }}><Flame size={16} color={AURA.green} /></div>
                  <p className="tv-summary-value">{totalComDecisao}</p>
                  <p className="tv-summary-label">Decisões</p>
                </div>
                <div className="tv-summary-card">
                  <div className="tv-summary-icon" style={{ background:"rgba(76,126,176,.12)" }}><UserCheck size={16} color={AURA.mossLight} /></div>
                  <p className="tv-summary-value">{totalConsolidador}</p>
                  <p className="tv-summary-label">Consolidados</p>
                </div>
              </div>
          )}

          {/* ── Botão Novo Visitante ── */}
          <button className="tv-btn-novo" onClick={() => abrirModal()}>
            <div className="tv-btn-novo-icon"><Plus size={22} strokeWidth={2.5} /></div>
            <div style={{ textAlign:"left" }}>
              <span className="tv-btn-novo-title">Novo Visitante</span>
              <span className="tv-btn-novo-sub">Cadastrar visitante na célula</span>
            </div>
          </button>

          {/* ── Search ── */}
          <div className="tv-search-wrap">
            <Search size={16} className="tv-search-icon" />
            <input className="tv-search-input"
                   placeholder="Buscar visitante..."
                   value={busca} onChange={e => setBusca(e.target.value)} />
            {busca && (
                <button className="tv-search-clear" onClick={() => setBusca("")}>
                  <X size={14} />
                </button>
            )}
          </div>

          {/* ── List ── */}
          {loading && visitantes.length === 0 ? (
              <TelaCarregando isDark={isDark} texto="Carregando visitantes..." minHeight="40vh" background="transparent" />
          ) : filtrados.length === 0 ? (
              <div className="tv-empty">
                <div style={{ width:64, height:64, borderRadius:20, background:"rgba(184,137,46,.08)", border:"1px solid rgba(184,137,46,.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Users size={28} color={AURA.gold} />
                </div>
                <p style={{ fontSize:14, fontWeight:500, color:t.text, margin:"8px 0 2px" }}>Nenhum visitante encontrado</p>
                <p style={{ fontSize:12, fontWeight:300, color:t.textMuted, margin:0 }}>{busca ? "Tente outro termo na busca" : "Comece cadastrando o primeiro visitante"}</p>
                {!busca && (
                    <button className="tv-btn-primary" onClick={() => abrirModal()} style={{ marginTop:12, padding:"10px 20px" }}>
                      <Plus size={14} strokeWidth={3} /> Cadastrar visitante
                    </button>
                )}
              </div>
          ) : (
              <div className="tv-list-card">
                {filtrados.map((v, idx) => {
                  const temDecisao = v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA";
                  const decisaoClass = v.decisaoEspiritual === "ACEITOU_JESUS" ? "aceitou"
                      : v.decisaoEspiritual === "RECONCILIOU" ? "reconciliou"
                          : v.decisaoEspiritual === "BATISMO_AGUAS" ? "batismo" : "";
                  return (
                      <div key={v.id} className={`tv-list-item ${temDecisao ? "has-decision" : ""}`} style={{ animationDelay:`${idx * 0.04}s` }}>
                        <div className={`tv-list-avatar ${temDecisao ? "decided" : ""}`}>
                          {v.nome.charAt(0)}
                        </div>
                        <div className="tv-list-body">
                          <p className="tv-list-name">{v.nome}</p>
                          <div className="tv-list-meta">
                            {v.telefone && <span><Phone size={10} /> {v.telefone}</span>}
                            {v.email && <span><Mail size={10} /> {v.email}</span>}
                            <span><Calendar size={10} /> {new Date(v.dataPrimeiraVisita).toLocaleDateString("pt-BR")}</span>
                            {v.responsavelAcompanhamento && <span><UserCheck size={10} /> {v.responsavelAcompanhamento}</span>}
                          </div>
                        </div>
                        <div className="tv-list-right">
                          <span className="tv-list-origin">{v.origem?.replace("_"," ")}</span>
                          {temDecisao && (
                              <span className={`tv-list-decision ${decisaoClass}`}>
                            {v.decisaoEspiritual === "ACEITOU_JESUS" ? "Salvo" :
                                v.decisaoEspiritual === "RECONCILIOU" ? "Reconciliado" : "Batismo"}
                          </span>
                          )}
                        </div>
                        <button className="tv-list-edit" onClick={() => abrirModal(v)}>
                          <ExternalLink size={14} />
                        </button>
                      </div>
                  );
                })}
              </div>
          )}
        </div>

        {/* ── Modal ── */}
        {modalAberto && (
            <div className="tv-modal-overlay" onClick={e => { if (e.target===e.currentTarget) fecharModal(); }}>
              <div className="tv-modal-box">

                {/* Hero do modal */}
                <div className="tv-modal-hero">
                  <div className="tv-modal-hero-top">
                    <div className="tv-modal-hero-left">
                      <div className="tv-modal-hero-icon">
                        <UserCheck size={20} color="#fff" />
                      </div>
                      <div>
                        <p className="tv-modal-hero-title">{editando ? "Editar Visitante" : "Novo Visitante"}</p>
                        <p className="tv-modal-hero-sub">{editando ? "Atualize os dados" : "Cadastre um novo visitante"}</p>
                      </div>
                    </div>
                    <button className="tv-modal-close" onClick={fecharModal}><X size={16} /></button>
                  </div>
                </div>

                <div className="tv-modal-body">
                  <form onSubmit={handleSalvar} style={{ display:"flex", flexDirection:"column", gap:0 }}>

                    {/* Dados pessoais */}
                    <div className="tv-modal-section">
                      <p className="tv-modal-section-label">Dados Pessoais</p>
                      <div className="tv-modal-card">
                        <div className="tv-field">
                          <label><UserCheck size={10} /> Nome completo</label>
                          <input required value={formVisitante.nome}
                                 onChange={e => setFormVisitante({...formVisitante, nome:e.target.value})}
                                 placeholder="Nome completo do visitante" />
                        </div>
                        <div className="tv-field">
                          <label><Phone size={10} /> WhatsApp</label>
                          <input value={formVisitante.telefone}
                                 onChange={e => setFormVisitante({...formVisitante, telefone:e.target.value})}
                                 placeholder="(00) 00000-0000" />
                        </div>
                        <div className="tv-field">
                          <label><Mail size={10} /> E-mail</label>
                          <input type="email" value={formVisitante.email}
                                 onChange={e => setFormVisitante({...formVisitante, email:e.target.value})}
                                 placeholder="email@exemplo.com" />
                        </div>
                      </div>
                    </div>

                    {/* Detalhes da visita */}
                    <div className="tv-modal-section">
                      <p className="tv-modal-section-label">Detalhes da Visita</p>
                      <div className="tv-modal-card">
                        <div className="tv-field">
                          <label><Calendar size={10} /> Data da visita</label>
                          <input type="date" value={formVisitante.dataPrimeiraVisita}
                                 onChange={e => setFormVisitante({...formVisitante, dataPrimeiraVisita:e.target.value})} />
                        </div>
                        <div className="tv-field">
                          <label><UserCheck size={10} /> Quem convidou?</label>
                          <input value={formVisitante.responsavelAcompanhamento}
                                 onChange={e => setFormVisitante({...formVisitante, responsavelAcompanhamento:e.target.value})}
                                 placeholder="Nome do líder ou membro" />
                        </div>
                        <div className="tv-field">
                          <label><Flame size={10} /> Decisão espiritual</label>
                          <select value={formVisitante.decisaoEspiritual}
                                  onChange={e => setFormVisitante({...formVisitante, decisaoEspiritual:e.target.value})}>
                            <option value="NENHUMA">Nenhuma decisão permanente</option>
                            <option value="ACEITOU_JESUS">Aceitou a Jesus</option>
                            <option value="RECONCILIOU">Reconciliou</option>
                            <option value="BATISMO_AGUAS">Decidiu pelo Batismo</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Origem */}
                    <div className="tv-modal-section">
                      <p className="tv-modal-section-label">Origem da Visita</p>
                      <div className="tv-origin-grid">
                        {listaOrigens.map(item => {
                          const sel = formVisitante.origem === item.id;
                          return (
                              <button key={item.id} type="button"
                                      className={`tv-origin-pill ${sel ? "selected" : ""}`}
                                      onClick={() => setFormVisitante({...formVisitante, origem:item.id})}>
                                {item.emoji} {item.label}
                              </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Deletar (apenas ao editar) */}
                    {editando && (
                        <div className="tv-modal-section">
                          {!confirmandoDeletar ? (
                              <button type="button" className="tv-btn-danger" onClick={() => setConfirmandoDeletar(true)}>
                                <Trash2 size={15} /> Remover visitante
                              </button>
                          ) : (
                              <div className="tv-confirm-box">
                                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                                  <AlertTriangle size={18} style={{ color:AURA.red, flexShrink:0 }} />
                                  <div>
                                    <p style={{ fontSize:10, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:AURA.red, margin:"0 0 3px" }}>Confirmar remoção</p>
                                    <p style={{ fontSize:13, fontWeight:300, color:t.textSec, margin:0 }}>
                                      Remover <strong style={{ color:t.text, fontWeight:500 }}>{visitanteSelecionado?.nome}</strong>? Esta ação não pode ser desfeita.
                                    </p>
                                  </div>
                                </div>
                                <div style={{ display:"flex", gap:10 }}>
                                  <button type="button" className="tv-btn-cancel" onClick={() => setConfirmandoDeletar(false)} disabled={deletando}>Cancelar</button>
                                  <button type="button" className="tv-btn-danger-confirm" onClick={handleDeletar} disabled={deletando}>
                                    {deletando ? <><Loader2 size={15} style={{ animation:"tv-spin 1s linear infinite" }} /> Removendo...</> : <><Trash2 size={15} /> Confirmar</>}
                                  </button>
                                </div>
                              </div>
                          )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="tv-modal-footer">
                      <button type="submit" className="tv-btn-save" disabled={loading}>
                        {loading ? <><Loader2 size={16} style={{ animation:"tv-spin 1s linear infinite" }} /> Salvando...</>
                            : editando ? "Atualizar dados" : "Finalizar cadastro"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}
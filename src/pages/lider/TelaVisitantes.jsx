import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import { AURA, theme } from "./liderTheme";
import TelaCarregando from "../../components/TelaCarregando.jsx";
import {
  Plus, Phone, X, Search,
  Loader2, UserCheck, Mail, ExternalLink, Trash2, AlertTriangle,
  Flame
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
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; }

    @keyframes tv-spin   { to { transform: rotate(360deg); } }
    @keyframes tv-fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes tv-stripe { 0%{background-position:0 0} 100%{background-position:60px 60px} }
    @keyframes tv-pulse  { 0%,100%{opacity:.35} 50%{opacity:.08} }
    @keyframes tv-slideUp{ from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }

    .tv-root {
      font-family: 'Inter', sans-serif;
      background: ${t.bg};
      color: ${t.text};
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
      padding-bottom: 48px;
    }
    .tv-glow {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background: radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%);
    }
    .tv-stripe {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background: repeating-linear-gradient(-55deg,
        ${isDark?"rgba(201,169,110,.03)":"rgba(201,169,110,.04)"} 0 10px, transparent 10px 20px);
      background-size: 60px 60px;
    }
    .tv-content {
      position: relative; z-index: 1;
      max-width: 1100px; margin: 0 auto; padding: 0 16px;
    }

    /* ── Card ── */
    .tv-card {
      background: ${t.bgEl};
      border: 1px solid ${t.border};
      border-radius: 20px;
      backdrop-filter: blur(24px);
      position: relative;
    }
    .tv-card::before {
      content: '';
      position: absolute; top:0; left:0; right:0; height:1px;
      background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      border-radius: 20px 20px 0 0;
    }

    /* ── Visitor card ── */
    .tv-visitor-card {
      background: ${t.bgEl};
      border: 1px solid ${t.border};
      border-radius: 20px; padding: 22px;
      transition: all .35s cubic-bezier(.4,0,.2,1);
      animation: tv-fadeIn .5s ease both;
      position: relative;
    }
    .tv-visitor-card::before {
      content: '';
      position: absolute; top:0; left:0; right:0; height:1px;
      background: linear-gradient(90deg, transparent, rgba(201,169,110,.15), transparent);
      border-radius: 20px 20px 0 0;
    }
    .tv-visitor-card:hover {
      transform: translateY(-5px);
      border-color: rgba(201,169,110,.45);
      box-shadow: 0 16px 40px rgba(0,0,0,${isDark?".4":".1"});
    }

    /* ── Inputs ── */
    .tv-input {
      width: 100%;
      background: ${t.bgInput};
      border: 1px solid ${t.borderInput};
      color: ${t.text};
      padding: 12px 16px;
      border-radius: 12px; outline: none;
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
      transition: all .25s;
      color-scheme: ${isDark?"dark":"light"};
    }
    .tv-input:focus { border-color: ${AURA.gold}; box-shadow: 0 0 0 3px rgba(201,169,110,.1); }
    .tv-input::placeholder { color: ${t.placeholder}; }
    .tv-input option { background: ${isDark?"#0A0A0F":"#fff"}; color: ${t.text}; }

    .tv-label {
      display: block; margin-bottom: 6px;
      font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
      letter-spacing: .12em; text-transform: uppercase; color: ${AURA.gold};
    }

    /* ── Botões ── */
    .tv-btn-primary {
      display: flex; align-items: center; gap: 7px;
      padding: 11px 20px; border-radius: 100px; border: none; cursor: pointer;
      background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
      color: #fff; font-family: 'Inter', sans-serif;
      font-size: 10px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
      transition: all .3s; box-shadow: 0 6px 22px rgba(200,16,46,.22);
    }
    .tv-btn-primary:hover:not(:disabled) { transform: translateY(-2px); opacity: .9; }
    .tv-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

    .tv-btn-danger {
      display: flex; align-items: center; justify-content: center; gap: 7px;
      width: 100%; padding: 13px; border-radius: 100px; cursor: pointer;
      background: transparent; border: 1px solid rgba(200,16,46,.3);
      color: ${AURA.red}; font-family: 'Inter', sans-serif;
      font-size: 10px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
      transition: all .25s;
    }
    .tv-btn-danger:hover:not(:disabled) { background: rgba(200,16,46,.08); border-color: ${AURA.red}; }
    .tv-btn-danger:disabled { opacity: .5; cursor: not-allowed; }

    .tv-btn-danger-confirm {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 13px; border-radius: 100px; border: none; cursor: pointer;
      background: linear-gradient(135deg, #7A0B1A, ${AURA.redDark});
      color: #fff; font-family: 'Inter', sans-serif;
      font-size: 10px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
      transition: all .25s;
    }
    .tv-btn-danger-confirm:hover:not(:disabled) { filter: brightness(1.15); }
    .tv-btn-danger-confirm:disabled { opacity: .5; cursor: not-allowed; }

    .tv-btn-cancel {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 13px; border-radius: 100px; cursor: pointer;
      background: ${isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)"};
      border: 1px solid ${t.border};
      color: ${t.textSec}; font-family: 'Inter', sans-serif;
      font-size: 10px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
      transition: all .25s;
    }
    .tv-btn-cancel:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

    /* ── Modal ── */
    .tv-modal-overlay {
      position: fixed; inset: 0; z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 16px;
      background: rgba(10,10,15,.88); backdrop-filter: blur(8px);
    }
    .tv-modal-box {
      width: 100%; max-width: 520px; max-height: 90vh;
      overflow-y: auto; position: relative;
      background: ${t.bgEl}; border: 1px solid ${t.border};
      border-radius: 24px; padding: 32px 28px;
      box-shadow: 0 24px 64px rgba(0,0,0,.4);
    }
    .tv-modal-box::before {
      content: '';
      position: absolute; top:0; left:0; right:0; height:1px;
      background: linear-gradient(90deg, transparent, rgba(201,169,110,.25), transparent);
      border-radius: 24px 24px 0 0;
    }

    /* ── Confirm box ── */
    .tv-confirm-box {
      background: ${isDark?"rgba(155,11,30,.1)":"rgba(200,16,46,.05)"};
      border: 1px solid rgba(200,16,46,.25);
      border-radius: 16px; padding: 18px;
    }

    /* ── Origin buttons ── */
    .tv-origin-btn {
      padding: 8px 14px; border-radius: 100px; cursor: pointer;
      font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .1em;
      border: 1px solid; transition: all .2s; text-transform: uppercase;
    }

    /* ── Modal actions (sticky on mobile) ── */
    .tv-modal-actions {
      position: sticky; bottom: 0;
      background: ${t.bgEl};
      padding: 14px 0 0; margin-top: 4px;
    }

    /* ── Divider ── */
    .tv-divider { height:1px; background: linear-gradient(90deg,transparent,${t.border},transparent); margin: 8px 0; }

    /* ── Pulse ring ── */
    .tv-pulse-ring { position:absolute; border-radius:50%; border:1px solid rgba(201,169,110,.25); animation: tv-pulse 3s ease-in-out infinite; }

    /* ── Grid cards ── */
    .tv-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .tv-modal-overlay { align-items: flex-end; padding: 0; }
      .tv-modal-box {
        max-width: 100%; width: 100%; height: 95vh; max-height: 95vh;
        border-radius: 24px 24px 0 0; padding: 28px 20px;
        display: flex; flex-direction: column;
        animation: tv-slideUp .3s cubic-bezier(.1,.76,.55,.94);
      }
      .tv-modal-box form { overflow-y: auto; flex: 1; padding-right: 4px; }
      .tv-two-col { grid-template-columns: 1fr !important; }
      .tv-page-header { flex-direction: column !important; align-items: flex-start !important; }
      .tv-page-header .tv-btn-primary { width: 100% !important; justify-content: center !important; }
      .tv-cards-grid { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 480px) {
      .tv-modal-actions { position: sticky; bottom: 0; padding: 12px 0 0; }
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

  return (
      <div className="tv-root">
        <style>{makeStyles(t, isDark)}</style>
        <div className="tv-glow" /><div className="tv-stripe" />

        <div className="tv-content" style={{ paddingTop:20 }}>

          {/* ── Header ── */}
          <div className="tv-card tv-page-header" style={{ padding:"24px 28px", marginBottom:24, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:18, minWidth:0 }}>
              <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <div className="tv-pulse-ring" style={{ width:64, height:64 }} />
                <div style={{ width:48, height:48, borderRadius:"50%",
                  background: isDark?"rgba(18,18,26,.99)":"#fff",
                  border:"1.5px solid rgba(201,169,110,.3)",
                  display:"flex", alignItems:"center", justifyContent:"center", position:"relative", zIndex:1 }}>
                  <img src="/quadrangular.png" alt="IEQ" style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover" }} />
                </div>
              </div>
              <div style={{ minWidth:0 }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:6,
                padding:"4px 12px", borderRadius:100, marginBottom:8,
                background:"rgba(201,169,110,.08)", border:"1px solid rgba(201,169,110,.2)",
                fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:600, letterSpacing:".14em", color:AURA.gold, textTransform:"uppercase" }}>
                Gestão de novos
              </span>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(18px,5vw,24px)", fontWeight:600, color:t.text, margin:0 }}>Visitantes</h1>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:300, color:t.textSec, margin:"2px 0 0" }}>Acompanhamento e consolidação</p>
              </div>
            </div>
            <button className="tv-btn-primary" onClick={() => abrirModal()}>
              <Plus size={16} strokeWidth={3} /> Novo visitante
            </button>
          </div>

          {/* ── Busca ── */}
          <div style={{ position:"relative", marginBottom:24 }}>
            <Search size={18} style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:AURA.gold, opacity:.6, pointerEvents:"none" }} />
            <input className="tv-input" style={{ paddingLeft:48, borderRadius:14 }}
                   placeholder="Pesquisar por nome..."
                   value={busca} onChange={e => setBusca(e.target.value)} />
          </div>

          {/* ── Grid ── */}
          {loading && visitantes.length === 0 ? (
              <TelaCarregando isDark={isDark} texto="Carregando visitantes…" minHeight="40vh" background="transparent" />
          ) : filtrados.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 0" }}>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:300, fontStyle:"italic", color:t.textMuted }}>Nenhum visitante encontrado.</p>
              </div>
          ) : (
              <div className="tv-cards-grid">
                {filtrados.map((v) => (
                    <div key={v.id} className="tv-visitor-card">
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                        <div style={{ width:46, height:46, borderRadius:14,
                          background:`linear-gradient(135deg,${AURA.redDark},${AURA.blue})`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          color:"#fff", fontFamily:"'Playfair Display',serif", fontWeight:600, fontSize:20 }}>
                          {v.nome.charAt(0)}
                        </div>
                        <div style={{ textAlign:"right" }}>
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase",
                      color:AURA.gold, background:"rgba(201,169,110,.1)", border:"1px solid rgba(201,169,110,.2)",
                      padding:"3px 10px", borderRadius:100 }}>
                      {v.origem?.replace("_"," ")}
                    </span>
                          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:500, color:t.textMuted, marginTop:6 }}>
                            {new Date(v.dataPrimeiraVisita).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:500, color:t.text, margin:"0 0 14px" }}>{v.nome}</h3>

                      <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:16 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:32, height:32, borderRadius:9, background:"rgba(201,169,110,.08)", border:"1px solid rgba(201,169,110,.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <Phone size={13} style={{ color:AURA.gold }} />
                          </div>
                          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:300, color:t.textSec }}>{v.telefone}</span>
                        </div>
                        {v.email && (
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <div style={{ width:32, height:32, borderRadius:9, background:"rgba(201,169,110,.08)", border:"1px solid rgba(201,169,110,.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                <Mail size={13} style={{ color:AURA.gold }} />
                              </div>
                              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:300, color:t.textSec, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.email}</span>
                            </div>
                        )}
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:32, height:32, borderRadius:9, background:"rgba(253,184,19,.08)", border:"1px solid rgba(253,184,19,.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <Flame size={13} style={{ color:AURA.yellowDark }} />
                          </div>
                          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight: v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA" ? 500 : 300, color:t.text }}>
                      {textoDecisao[v.decisaoEspiritual] || textoDecisao["NENHUMA"]}
                    </span>
                        </div>
                      </div>

                      <div className="tv-divider" />

                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:12 }}>
                        <div style={{ minWidth:0, flex:1 }}>
                          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:t.textMuted, margin:"0 0 2px" }}>Consolidador</p>
                          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:500, color:AURA.gold, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {v.responsavelAcompanhamento || "Pendente"}
                          </p>
                        </div>
                        <button onClick={() => abrirModal(v)} style={{
                          flexShrink:0, width:36, height:36, borderRadius:10, marginLeft:12,
                          background:"rgba(201,169,110,.08)", border:"1px solid rgba(201,169,110,.2)",
                          color:AURA.gold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                          transition:"all .2s",
                        }}
                                onMouseEnter={e => { e.currentTarget.style.background=AURA.gold; e.currentTarget.style.color="#0A0A0F"; }}
                                onMouseLeave={e => { e.currentTarget.style.background="rgba(201,169,110,.08)"; e.currentTarget.style.color=AURA.gold; }}>
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>

        {/* ── Modal ── */}
        {modalAberto && (
            <div className="tv-modal-overlay" onClick={e => { if (e.target===e.currentTarget) fecharModal(); }}>
              <div className="tv-modal-box">

                {/* Header do modal */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:"rgba(201,169,110,.1)", border:"1px solid rgba(201,169,110,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <UserCheck size={18} style={{ color:AURA.gold }} />
                      </div>
                      <div>
                        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:500, color:t.text, margin:0 }}>
                          {editando ? "Editar visitante" : "Novo visitante"}
                        </h2>
                        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:300, color:t.textSec, margin:0 }}>Insira os dados para discipulado.</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={fecharModal} style={{ background:"none", border:"none", cursor:"pointer", color:t.textMuted, padding:6, borderRadius:8, display:"flex" }}>
                    <X size={22} />
                  </button>
                </div>

                <div className="tv-divider" style={{ marginBottom:20 }} />

                <form onSubmit={handleSalvar} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div>
                    <label className="tv-label">Nome completo</label>
                    <input className="tv-input" required value={formVisitante.nome}
                           onChange={e => setFormVisitante({...formVisitante, nome:e.target.value})}
                           placeholder="Nome completo" />
                  </div>

                  <div className="tv-two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <div>
                      <label className="tv-label">WhatsApp</label>
                      <input className="tv-input" value={formVisitante.telefone}
                             onChange={e => setFormVisitante({...formVisitante, telefone:e.target.value})}
                             placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <label className="tv-label">Data da visita</label>
                      <input className="tv-input" type="date"
                             value={formVisitante.dataPrimeiraVisita}
                             onChange={e => setFormVisitante({...formVisitante, dataPrimeiraVisita:e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="tv-label">Quem convidou?</label>
                    <div style={{ position:"relative" }}>
                      <UserCheck size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:AURA.gold, pointerEvents:"none" }} />
                      <input className="tv-input" style={{ paddingLeft:42 }}
                             value={formVisitante.responsavelAcompanhamento}
                             onChange={e => setFormVisitante({...formVisitante, responsavelAcompanhamento:e.target.value})}
                             placeholder="Nome do líder ou membro" />
                    </div>
                  </div>

                  <div>
                    <label className="tv-label">Decisão espiritual</label>
                    <div style={{ position:"relative" }}>
                      <Flame size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:AURA.yellowDark, pointerEvents:"none", zIndex:1 }} />
                      <select className="tv-input" style={{ paddingLeft:42, appearance:"none", cursor:"pointer",
                        background: isDark?"#0A0A0F":"#fff", color:t.text }}
                              value={formVisitante.decisaoEspiritual}
                              onChange={e => setFormVisitante({...formVisitante, decisaoEspiritual:e.target.value})}>
                        <option value="NENHUMA">Nenhuma decisão permanente</option>
                        <option value="ACEITOU_JESUS">Aceitou a Jesus 🙌</option>
                        <option value="RECONCILIOU">Reconciliou 🤝</option>
                        <option value="BATISMO_AGUAS">Decidiu pelo Batismo 💧</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="tv-label">Origem da visita</label>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:4 }}>
                      {listaOrigens.map(item => {
                        const sel = formVisitante.origem === item.id;
                        return (
                            <button key={item.id} type="button" className="tv-origin-btn"
                                    onClick={() => setFormVisitante({...formVisitante, origem:item.id})}
                                    style={{
                                      background: sel ? `linear-gradient(135deg,${AURA.redDark},${AURA.red})` : "transparent",
                                      borderColor: sel ? AURA.red : t.border,
                                      color: sel ? "#fff" : t.textSec,
                                    }}>
                              {item.emoji} {item.label}
                            </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="tv-divider" />

                  {editando && (
                      <div style={{ marginBottom:8 }}>
                        {!confirmandoDeletar ? (
                            <button type="button" className="tv-btn-danger" onClick={() => setConfirmandoDeletar(true)}>
                              <Trash2 size={15} /> Remover visitante
                            </button>
                        ) : (
                            <div className="tv-confirm-box">
                              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                                <AlertTriangle size={18} style={{ color:AURA.red, flexShrink:0 }} />
                                <div>
                                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:AURA.red, margin:"0 0 3px" }}>Confirmar remoção</p>
                                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:300, color:t.textSec, margin:0 }}>
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

                  <div className="tv-modal-actions">
                    <button type="submit" className="tv-btn-primary" disabled={loading}
                            style={{ width:"100%", justifyContent:"center", padding:"14px" }}>
                      {loading ? <><Loader2 size={16} style={{ animation:"tv-spin 1s linear infinite" }} /> Salvando...</>
                          : editando ? "Atualizar dados" : "Finalizar cadastro"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}
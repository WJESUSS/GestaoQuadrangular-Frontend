import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import {
  Plus, Phone, X, Search,
  Loader2, UserCheck, Mail, ExternalLink, Trash2, AlertTriangle,
  Flame
} from "lucide-react";

/* Cores Oficiais IEQ */
const IEQ = {
  red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
  yellow: "#FDB813", yellowDark: "#C48C00",
  blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
  white: "#FFFFFF", offWhite: "#F5F0E8",
  dark: "#0A0608", darkCard: "#110A0D",
};

function QuadrangularCross({ size = 28 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gVV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={IEQ.redLight} /><stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHV" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={IEQ.blueDark} /><stop offset="50%" stopColor={IEQ.blueLight} /><stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowV"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gVV)" filter="url(#glowV)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gHV)" filter="url(#glowV)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowV)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

const listaOrigens = [
  { id: "CONVITE",       label: "Convite",      emoji: "🤝" },
  { id: "CASA_DE_PAZ",   label: "Casa de Paz",  emoji: "🏠" },
  { id: "EVENTO",        label: "Evento",       emoji: "🎉" },
  { id: "MISSAO_70",     label: "Missão 70",    emoji: "✌️" },
  { id: "REDES_SOCIAIS", label: "Social",       emoji: "📱" },
  { id: "CELULA",        label: "Célula",       emoji: "🔥" },
];

const textoDecisao = {
  NENHUMA: "Nenhuma decisão",
  ACEITOU_JESUS: "Aceitou a Jesus ✝️",
  RECONCILIOU: "Reconciliou 🙏",
  BATISMO_AGUAS: "Decidiu pelo Batismo 💧"
};

export default function TelaVisitantes({ celulaId, isDark = false }) {
  const [loading,              setLoading]              = useState(false);
  const [visitantes,           setVisitantes]           = useState([]);
  const [busca,                setBusca]                = useState("");
  const [modalAberto,          setModalAberto]          = useState(false);
  const [editando,             setEditando]             = useState(false);
  const [visitanteSelecionado, setVisitanteSelecionado] = useState(null);
  const [confirmandoDeletar,   setConfirmandoDeletar]   = useState(false);
  const [deletando,            setDeletando]            = useState(false);

  const estadoInicial = {
    nome: "", telefone: "", email: "",
    dataPrimeiraVisita: new Date().toISOString().split("T")[0],
    origem: "CONVITE", responsavelAcompanhamento: "", decisaoEspiritual: "NENHUMA", ativo: true,
  };
  const [formVisitante, setFormVisitante] = useState(estadoInicial);

  const getHeaders = () => {
    const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
    return { Authorization: `Bearer ${token}` };
  };

  const carregarVisitantes = useCallback(async () => {
    if (!celulaId) return;
    try {
      setLoading(true);
      const res = await api.get(`/visitantes/celula/${celulaId}/ativos`, { headers: getHeaders() });
      setVisitantes(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [celulaId]);

  useEffect(() => {
    carregarVisitantes();
  }, [carregarVisitantes]);

  const handleMudarOrigem = (origemId) => {
    let novaDecisao = formVisitante.decisaoEspiritual;

    if (origemId === "CASA_DE_PAZ" || origemId === "MISSAO_70") {
      novaDecisao = "ACEITOU_JESUS";
    } else if (
        formVisitante.decisaoEspiritual === "ACEITOU_JESUS" &&
        (formVisitante.origem === "CASA_DE_PAZ" || formVisitante.origem === "MISSAO_70")
    ) {
      novaDecisao = "NENHUMA";
    }

    setFormVisitante({
      ...formVisitante,
      origem: origemId,
      decisaoEspiritual: novaDecisao
    });
  };

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
      fecharModal();
      carregarVisitantes();
    } catch {
      alert("Erro ao salvar dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async () => {
    if (!visitanteSelecionado) return;
    try {
      setDeletando(true);
      await api.delete(`/visitantes/${visitanteSelecionado.id}`, { headers: getHeaders() });
      fecharModal();
      carregarVisitantes();
    } catch {
      alert("Erro ao remover visitante.");
    } finally {
      setDeletando(false);
    }
  };

  const abrirModal = (v = null) => {
    setConfirmandoDeletar(false);
    if (v) {
      setEditando(true);
      setVisitanteSelecionado(v);
      setFormVisitante({ ...v, decisaoEspiritual: v.decisaoEspiritual || "NENHUMA" });
    } else {
      setEditando(false);
      setFormVisitante(estadoInicial);
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setConfirmandoDeletar(false);
    setFormVisitante(estadoInicial);
  };

  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  // Cores para os <option> no select — garante legibilidade em dark/light
  const selectOptionBg    = isDark ? "#1A0A0D" : "#ffffff";
  const selectOptionColor = isDark ? IEQ.offWhite : "#1A0A0D";

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing:border-box; }
    @keyframes stripe  { 0%{background-position:0 0} 100%{background-position:60px 60px} }
    @keyframes pulse   { 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.12);opacity:.12} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes fadeIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shakeIn { 0%{opacity:0;transform:scale(.95)} 60%{transform:scale(1.02)} 100%{opacity:1;transform:scale(1)} }
    
    .ieq-bg-stripe {
      position:fixed; inset:0; pointer-events:none; z-index:0;
      background:repeating-linear-gradient(-55deg,
        ${isDark ? "rgba(200,16,46,.04)" : "rgba(200,16,46,.05)"} 0 10px,transparent 10px 20px,
        ${isDark ? "rgba(253,184,19,.03)" : "rgba(253,184,19,.04)"} 20px 30px,transparent 30px 40px);
      background-size:60px 60px; animation:stripe 8s linear infinite;
    }
    .ieq-card {
      background:${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius:14px; backdrop-filter:blur(24px);
    }
    .ieq-visitor-card {
      background:${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"};
      border-radius:12px; padding:22px; transition:all .3s; animation:fadeIn .5s ease both;
    }
    .ieq-visitor-card:hover { transform:translateY(-5px); border-color:${IEQ.red}; box-shadow:0 16px 40px rgba(200,16,46,.12); }
    .ieq-input {
      width:100%;
      background:${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      color:${tp}; padding:12px 16px; border-radius:8px; outline:none;
      font-family:'EB Garamond',serif; font-size:15px; transition:all .25s;
      color-scheme:${isDark ? "dark" : "light"};
    }
    .ieq-input:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-input::placeholder { color:${ts}; }
    .ieq-input option {
      background:${selectOptionBg};
      color:${selectOptionColor};
    }
    .ieq-label {
      display:block; margin-bottom:6px;
      font-family:'Cinzel',serif; font-size:9.5px; letter-spacing:.18em; color:${IEQ.red};
    }
    .ieq-btn-primary {
      background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red}); color:#fff;
      border:none; border-radius:8px; padding:13px 24px; cursor:pointer;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.18em;
      display:flex; align-items:center; gap:8px; transition:all .25s;
    }
    .ieq-btn-primary:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.1); }
    .ieq-btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .ieq-btn-primary.full { width:100%; justify-content:center; }
    
    .ieq-btn-danger {
      background:transparent; border:1px solid rgba(200,16,46,.35); color:${IEQ.red};
      border-radius:8px; padding:13px 24px; cursor:pointer;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.18em;
      display:flex; align-items:center; gap:8px; transition:all .25s; width:100%; justify-content:center;
    }
    .ieq-btn-danger:hover:not(:disabled) { background:rgba(200,16,46,.08); border-color:${IEQ.red}; transform:translateY(-1px); }
    .ieq-btn-danger:disabled { opacity:.5; cursor:not-allowed; }
    
    .ieq-btn-danger-confirm {
      background:linear-gradient(135deg,#7A0B1A,${IEQ.redDark}); color:#fff;
      border:none; border-radius:8px; padding:13px 24px; cursor:pointer;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.18em;
      display:flex; align-items:center; gap:8px; transition:all .25s; flex:1; justify-content:center;
    }
    .ieq-btn-danger-confirm:hover:not(:disabled) { filter:brightness(1.15); }
    .ieq-btn-danger-confirm:disabled { opacity:.5; cursor:not-allowed; }
    
    .ieq-btn-cancel {
      background:${isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)"};
      border:1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}; color:${ts};
      border-radius:8px; padding:13px 24px; cursor:pointer;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.18em;
      display:flex; align-items:center; gap:8px; transition:all .25s; flex:1; justify-content:center;
    }
    .ieq-btn-cancel:hover { background:${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)"}; }
    
    .ieq-confirm-box {
      background:${isDark ? "rgba(139,11,31,.12)" : "rgba(200,16,46,.06)"};
      border:1px solid rgba(200,16,46,.3); border-radius:10px;
      padding:20px; animation:shakeIn .3s ease both;
    }
    .ieq-origin-btn {
      padding:8px 14px; border-radius:8px; cursor:pointer;
      font-family:'Cinzel',serif; font-size:9px; font-weight:700; letter-spacing:.12em;
      border:1px solid; transition:all .2s;
    }
    .pulse-ring { position:absolute; border-radius:50%; border:1px solid rgba(200,16,46,.35); animation:pulse 3s ease-in-out infinite; }
    .spin-icon  { animation:spin 1s linear infinite; }
    .divider    { height:1px; background:linear-gradient(90deg,transparent,${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"},transparent); margin:6px 0; }
  `;

  const filtrados = visitantes.filter(v => v.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
      <div style={{ minHeight: "100vh", position: "relative", paddingBottom: 48 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg-stripe" />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>

          {/* Header */}
          <div className="ieq-card" style={{ padding: "28px 36px", marginBottom: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <div className="pulse-ring" style={{ width: 64, height: 64 }} />
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: isDark ? "#1A0A0D" : "#fff", border: "1px solid rgba(200,16,46,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <QuadrangularCross size={28} />
                </div>
              </div>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: "rgba(200,16,46,.1)", border: "1px solid rgba(200,16,46,.2)", marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: IEQ.red }}>GESTÃO DE NOVOS</span>
                </div>
                <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, letterSpacing: ".14em", color: tp, margin: 0 }}>VISITANTES</h1>
                <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: ts, margin: "2px 0 0" }}>Acompanhamento e Consolidação</p>
              </div>
            </div>
            <button className="ieq-btn-primary" onClick={() => abrirModal()}>
              <Plus size={16} strokeWidth={3} /> NOVO VISITANTE
            </button>
          </div>

          {/* Busca */}
          <div style={{ position: "relative", marginBottom: 24 }}>
            <Search size={18} style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: IEQ.red, opacity: .6 }} />
            <input className="ieq-input" style={{ paddingLeft: 48, borderRadius: 10, fontSize: 15 }}
                   placeholder="Pesquisar por nome do visitante..."
                   value={busca} onChange={e => setBusca(e.target.value)} />
          </div>

          {/* Grid de Conteúdo */}
          {loading && visitantes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: ts }}>
                <Loader2 size={40} style={{ color: IEQ.red, animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: ".2em" }}>CARREGANDO VISITANTES...</p>
              </div>
          ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
                {filtrados.map((v) => (
                    <div key={v.id} className="ieq-visitor-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 10,
                          background: `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20,
                        }}>{v.nome.charAt(0)}</div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".12em", color: IEQ.red, background: "rgba(200,16,46,.1)", padding: "3px 10px", borderRadius: 4 }}>
                            {v.origem?.replace("_", " ")}
                          </span>
                          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".1em", color: ts, marginTop: 6 }}>
                            {new Date(v.dataPrimeiraVisita).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      <h3 style={{ fontFamily: "'EB Garamond',serif", fontSize: 18, fontWeight: 600, color: tp, margin: "0 0 12px" }}>{v.nome}</h3>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(200,16,46,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Phone size={13} style={{ color: IEQ.red }} />
                          </div>
                          <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: ts }}>{v.telefone}</span>
                        </div>
                        {v.email && (
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(200,16,46,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Mail size={13} style={{ color: IEQ.red }} />
                              </div>
                              <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: ts, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.email}</span>
                            </div>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(253,184,19,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Flame size={13} style={{ color: IEQ.yellowDark }} />
                          </div>
                          <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: tp, fontWeight: v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA" ? "600" : "normal" }}>
                            {textoDecisao[v.decisaoEspiritual] || textoDecisao["NENHUMA"]}
                          </span>
                        </div>
                      </div>

                      <div className="divider" />

                      {/* Card Footer */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10 }}>
                        <div>
                          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".12em", color: ts, margin: "0 0 2px" }}>QUEM VAI CONSOLIDAR</p>
                          <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: IEQ.red, fontWeight: 600, margin: 0 }}>
                            {v.responsavelAcompanhamento || "Pendente"}
                          </p>
                        </div>
                        <button onClick={() => abrirModal(v)} style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: "rgba(200,16,46,.08)", border: `1px solid rgba(200,16,46,.2)`,
                          color: IEQ.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all .2s",
                        }}
                                onMouseEnter={e => { e.currentTarget.style.background = IEQ.red; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(200,16,46,.08)"; e.currentTarget.style.color = IEQ.red; }}>
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>

        {/* Modal de Cadastro / Edição */}
        {modalAberto && (
            <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(10,6,8,.85)", backdropFilter: "blur(16px)" }}>
              <div className="ieq-card" style={{ width: "100%", maxWidth: 520, padding: "40px 36px", maxHeight: "90vh", overflowY: "auto", position: "relative", animation: "fadeIn .3s ease" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                  <div>
                    <QuadrangularCross size={28} />
                    <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 700, letterSpacing: ".15em", color: tp, margin: "12px 0 4px" }}>
                      {editando ? "EDITAR PERFIL" : "CADASTRAR VISITA"}
                    </h2>
                    <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: ts, margin: 0 }}>Insira os dados para o discipulado.</p>
                  </div>
                  <button onClick={fecharModal} style={{ background: "none", border: "none", cursor: "pointer", color: ts, padding: 6, borderRadius: 6 }}>
                    <X size={22} />
                  </button>
                </div>

                <div className="divider" style={{ marginBottom: 24 }} />

                <form onSubmit={handleSalvar} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label className="ieq-label">NOME COMPLETO</label>
                    <input className="ieq-input" required
                           value={formVisitante.nome}
                           onChange={e => setFormVisitante({ ...formVisitante, nome: e.target.value })}
                           placeholder="Nome completo" />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label className="ieq-label">WHATSAPP</label>
                      <input className="ieq-input"
                             value={formVisitante.telefone}
                             onChange={e => setFormVisitante({ ...formVisitante, telefone: e.target.value })}
                             placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <label className="ieq-label">DATA DA VISITA</label>
                      <input className="ieq-input" type="date"
                             style={{ colorScheme: isDark ? "dark" : "light" }}
                             value={formVisitante.dataPrimeiraVisita}
                             onChange={e => setFormVisitante({ ...formVisitante, dataPrimeiraVisita: e.target.value })} />
                    </div>
                  </div>

                  {/* Campo: QUEM CONVIDOU */}
                  <div>
                    <label className="ieq-label">QUEM CONVIDOU?</label>
                    <div style={{ position: "relative" }}>
                      <UserCheck size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: IEQ.red }} />
                      <input
                          className="ieq-input"
                          style={{ paddingLeft: 42 }}
                          value={formVisitante.responsavelAcompanhamento}
                          onChange={e => setFormVisitante({ ...formVisitante, responsavelAcompanhamento: e.target.value })}
                          placeholder="Nome do líder ou membro"
                      />
                    </div>
                  </div>

                  {/* Campo: DECISÃO ESPIRITUAL */}
                  <div>
                    <label className="ieq-label">DECISÃO ESPIRITUAL</label>
                    <div style={{ position: "relative" }}>
                      <Flame size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: IEQ.yellowDark, pointerEvents: "none", zIndex: 1 }} />
                      <select
                          className="ieq-input"
                          style={{
                            paddingLeft: 42,
                            appearance: "none",
                            cursor: "pointer",
                            colorScheme: isDark ? "dark" : "light",
                            background: isDark ? "#1A0A0D" : "#ffffff",
                            color: tp,
                          }}
                          value={formVisitante.decisaoEspiritual}
                          onChange={e => setFormVisitante({ ...formVisitante, decisaoEspiritual: e.target.value })}
                      >
                        <option value="NENHUMA">Nenhuma decisão pendente</option>
                        <option value="ACEITOU_JESUS">Aceitou a Jesus ✝️</option>
                        <option value="RECONCILIOU">Reconciliou 🙏</option>
                        <option value="BATISMO_AGUAS">Decidiu pelo Batismo 💧</option>
                      </select>
                    </div>
                  </div>

                  {/* Campo: ORIGEM DA VISITA */}
                  <div>
                    <label className="ieq-label">ORIGEM DA VISITA</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                      {listaOrigens.map(item => (
                          <button key={item.id} type="button" className="ieq-origin-btn"
                                  onClick={() => handleMudarOrigem(item.id)}
                                  style={{
                                    background: formVisitante.origem === item.id ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})` : "rgba(200,16,46,.06)",
                                    borderColor: formVisitante.origem === item.id ? IEQ.red : "rgba(200,16,46,.2)",
                                    color: formVisitante.origem === item.id ? "#fff" : ts,
                                  }}>
                            {item.emoji} {item.label.toUpperCase()}
                          </button>
                      ))}
                    </div>
                  </div>

                  <div className="divider" />

                  <button type="submit" className="ieq-btn-primary full" disabled={loading}>
                    {loading
                        ? <><Loader2 size={16} className="spin-icon" /> SALVANDO...</>
                        : (editando ? "ATUALIZAR DADOS" : "FINALIZAR CADASTRO")
                    }
                  </button>
                </form>

                {/* Bloco de Remoção (Modo Edição) */}
                {editando && (
                    <div style={{ marginTop: 16 }}>
                      {!confirmandoDeletar ? (
                          <button type="button" className="ieq-btn-danger" onClick={() => setConfirmandoDeletar(true)}>
                            <Trash2 size={15} /> REMOVER VISITANTE
                          </button>
                      ) : (
                          <div className="ieq-confirm-box">
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                              <AlertTriangle size={18} style={{ color: IEQ.red, flexShrink: 0 }} />
                              <div>
                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".14em", color: IEQ.red, margin: "0 0 3px" }}>CONFIRMAR REMOÇÃO</p>
                                <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: ts, margin: 0 }}>
                                  Deseja remover <strong style={{ color: tp }}>{visitanteSelecionado?.nome}</strong>? Esta ação não pode ser desfeita.
                                </p>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                              <button type="button" className="ieq-btn-cancel"
                                      onClick={() => setConfirmandoDeletar(false)} disabled={deletando}>
                                CANCELAR
                              </button>
                              <button type="button" className="ieq-btn-danger-confirm"
                                      onClick={handleDeletar} disabled={deletando}>
                                {deletando
                                    ? <><Loader2 size={15} className="spin-icon" /> REMOVENDO...</>
                                    : <><Trash2 size={15} /> SIM, REMOVER</>
                                }
                              </button>
                            </div>
                          </div>
                      )}
                    </div>
                )}

              </div>
            </div>
        )}
      </div>
  );
}
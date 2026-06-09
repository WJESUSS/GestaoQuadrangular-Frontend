import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
  UserPlus, Search, Phone, Calendar, ShieldCheck, Plus, X,
  ChevronRight, Loader2, Heart, Users, Droplets, RefreshCw
} from "lucide-react";

const IEQ = {
  red:"#C8102E", redDark:"#8B0B1F", redLight:"#E8294A",
  yellow:"#FDB813", blue:"#003DA5", blueDark:"#002470", blueLight:"#1A56C4",
  offWhite:"#F5F0E8", dark:"#0A0608",
};
const purple = "#7C3AED";
const purpleDark = "#5B21B6";

const ORIGENS = {
  CONVITE:"Convite", REDES_SOCIAIS:"Redes Sociais",
  ESPONTANEO:"Espontâneo", OUTRO:"Outro",
};

const DECISOES = {
  ACEITOU_JESUS: {
    label: "Aceitou a Jesus",
    mensagem: (nome) => `${nome} aceitou a Jesus! 🙌`,
    emoji: "🙌",
    color: "#059669",
    colorDark: "#047857",
    colorBg: "rgba(5,150,105,.13)",
    colorBgCard: "rgba(5,150,105,.06)",
    colorBorder: "rgba(5,150,105,.5)",
    colorBorderCard: "rgba(5,150,105,.35)",
    Icon: Heart,
  },
  BATISMO_AGUAS: {
    label: "Decidiu pelo Batismo",
    mensagem: (nome) => `${nome} decidiu pelo batismo! 💧`,
    emoji: "💧",
    color: IEQ.blue,
    colorDark: IEQ.blueDark,
    colorBg: "rgba(0,61,165,.13)",
    colorBgCard: "rgba(0,61,165,.06)",
    colorBorder: "rgba(0,61,165,.5)",
    colorBorderCard: "rgba(0,61,165,.35)",
    Icon: Droplets,
  },
  RECONCILIOU: {
    label: "Reconciliou com Deus",
    mensagem: (nome) => `${nome} se reconciliou! 🤝`,
    emoji: "🤝",
    color: "#D97706",
    colorDark: "#B45309",
    colorBg: "rgba(217,119,6,.13)",
    colorBgCard: "rgba(217,119,6,.06)",
    colorBorder: "rgba(217,119,6,.5)",
    colorBorderCard: "rgba(217,119,6,.35)",
    Icon: RefreshCw,
  },
};

const formInicial = {
  nome:"", email:"", telefone:"",
  dataPrimeiraVisita: new Date().toISOString().split("T")[0],
  origem:"CONVITE", responsavelAcompanhamento:"", convertido:false,
  decisaoEspiritual: "NENHUMA",
};

/* ─── Hook de Notificações ─── */
function useNotificacoes() {
  const [toasts, setToasts] = useState([]);

  const disparar = useCallback((decisao, nomeVisitante) => {
    const cfg = DECISOES[decisao];
    if (!cfg) return;
    const id = Date.now();
    setToasts(prev => [...prev, { id, decisao, nomeVisitante, cfg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const fechar = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, disparar, fechar };
}

/* ─── Componente Toast ─── */
function ToastNotificacao({ toast, fechar, isDark }) {
  const { cfg, nomeVisitante } = toast;
  const { Icon } = cfg;

  return (
      <motion.div layout
                  initial={{ opacity: 0, x: 80, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 80, scale: 0.92 }}
                  transition={{ type: "spring", damping: 26, stiffness: 300 }}
                  style={{
                    background: isDark ? "rgba(17,10,13,.98)" : "rgba(255,255,255,.98)",
                    border: `1px solid ${cfg.colorBorder}`,
                    borderRadius: 14, padding: "14px 16px",
                    minWidth: 280, maxWidth: 340,
                    boxShadow: `0 8px 32px rgba(0,0,0,.18), 0 0 0 1px ${cfg.colorBorder}`,
                    backdropFilter: "blur(24px)", overflow: "hidden",
                    position: "relative", display: "flex", flexDirection: "column", gap: 8,
                  }}>
        <motion.div
            initial={{ scaleX: 1 }} animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: "linear" }}
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
              background: cfg.color, transformOrigin: "left", borderRadius: "0 0 14px 14px",
            }} />
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: cfg.colorBg, border: `1px solid ${cfg.colorBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color,
          }}>
            <Icon size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700,
              letterSpacing: ".18em", color: cfg.color, margin: "0 0 3px", textTransform: "uppercase" }}>
              NOVA DECISÃO ESPIRITUAL
            </p>
            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 15,
              color: isDark ? IEQ.offWhite : "#1A0A0D", margin: "0 0 2px", fontWeight: 600,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {nomeVisitante}
            </p>
            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14,
              color: isDark ? "rgba(245,240,232,.6)" : "rgba(26,10,13,.55)",
              margin: 0, fontStyle: "italic" }}>
              {cfg.emoji} {cfg.label}
            </p>
          </div>
          <button onClick={() => fechar(toast.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            color: isDark ? "rgba(245,240,232,.35)" : "rgba(26,10,13,.3)",
            padding: 2, borderRadius: 6, display: "flex", flexShrink: 0,
          }}>
            <X size={15} />
          </button>
        </div>
      </motion.div>
  );
}

export default function Visitantes({ isDark = false }) {
  const [visitantes,  setVisitantes]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId,  setEditandoId]  = useState(null);
  const [filtro,      setFiltro]      = useState("");
  const [form,        setForm]        = useState(formInicial);
  const decisaoAnteriorRef            = useRef(null);

  const { toasts, disparar, fechar } = useNotificacoes();

  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const cardBg      = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
  const border      = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";
  const inputBg     = isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)";
  const pageBg      = isDark ? IEQ.dark : IEQ.offWhite;

  const styles = `
    @keyframes spin{to{transform:rotate(360deg)}} .spin-icon{animation:spin 1s linear infinite;}
    @keyframes shimmer {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }

    .v-wrap { min-height:100vh; width:100%; background:${pageBg}; box-sizing:border-box; padding:0; margin:0; }
    .v-inner { width:100%; max-width:960px; margin:0 auto; padding:20px 16px 32px; box-sizing:border-box; }

    .ieq-field {
      width:100%; box-sizing:border-box;
      background:${inputBg};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      color:${textPrimary}; padding:12px 14px; border-radius:8px; outline:none;
      font-family:'EB Garamond',serif; font-size:16px; transition:all .25s; -webkit-appearance:none;
    }
    .ieq-field:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-field::placeholder { color:${isDark ? "rgba(245,240,232,.25)" : "rgba(26,10,13,.3)"}; }

    .ieq-label {
      font-family:'Cinzel',serif; font-size:8.5px; letter-spacing:.2em;
      color:${textSec}; text-transform:uppercase; display:block; margin-bottom:6px;
    }

    /* Card base */
    .ieq-visit-card {
      background:${cardBg}; border:1px solid ${border}; border-radius:12px;
      padding:0; cursor:pointer; transition:all .3s;
      backdrop-filter:blur(24px); position:relative; overflow:hidden; box-sizing:border-box;
    }
    .ieq-visit-card:active { transform:scale(.98); opacity:.9; }
    @media(hover:hover) {
      .ieq-visit-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(124,58,237,.12); }
    }

    /* Card com decisão — cor dinâmica via CSS var */
    .ieq-visit-card.tem-decisao {
      border-color: var(--d-border);
      background: var(--d-bg-card);
      box-shadow: 0 4px 24px var(--d-shadow);
    }
    @media(hover:hover) {
      .ieq-visit-card.tem-decisao:hover {
        transform:translateY(-3px);
        box-shadow: 0 12px 36px var(--d-shadow);
        border-color: var(--d-color);
      }
    }

    /* Faixa celebratória */
    .card-faixa {
      width: 100%; padding: 9px 14px;
      display: flex; align-items: center; gap: 8px;
      background: var(--d-bg);
      border-bottom: 1px solid var(--d-border);
      position: relative; overflow: hidden;
    }
    .card-faixa::after {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.18) 50%, transparent 100%);
      animation: shimmer 2.8s ease-in-out infinite;
      pointer-events: none;
    }

    .card-body { padding: 14px 16px 16px; }

    .ieq-grid-v { display:grid; grid-template-columns:1fr; gap:12px; width:100%; }
    @media(min-width:540px)  { .ieq-grid-v { grid-template-columns:repeat(2,1fr); } }
    @media(min-width:860px)  { .ieq-grid-v { grid-template-columns:repeat(3,1fr); } }

    .ieq-form-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    @media(max-width:420px) { .ieq-form-grid2 { grid-template-columns:1fr; } }

    .ieq-modal-backdrop {
      position:fixed; inset:0; z-index:50;
      display:flex; align-items:flex-start; justify-content:center;
      padding-top:env(safe-area-inset-top,0px);
    }
    @media(min-width:520px) { .ieq-modal-backdrop { align-items:center; padding:16px; } }

    .ieq-modal-box {
      position:relative; z-index:10; width:100%;
      max-height:100dvh; display:flex; flex-direction:column;
      border-radius:0 0 20px 20px; overflow:hidden;
    }
    @media(min-width:520px) {
      .ieq-modal-box { border-radius:16px; max-width:520px; max-height:calc(100dvh - 32px); }
    }

    .btn-novo {
      display:flex; align-items:center; gap:8px; padding:12px 18px;
      border-radius:10px; border:none; cursor:pointer;
      background:linear-gradient(135deg,${purpleDark},${purple}); color:#fff;
      font-family:'Cinzel',serif; font-size:10px; font-weight:700;
      letter-spacing:.16em; white-space:nowrap; flex-shrink:0; transition:opacity .2s;
    }
    .btn-novo:active { opacity:.85; }

    .search-wrap { position:relative; width:100%; }

    .v-header {
      position:sticky; top:0; z-index:10; background:${pageBg};
      padding:16px 16px 12px; border-bottom:1px solid ${border};
      display:flex; flex-direction:column; gap:12px;
    }
    .v-header-top { display:flex; align-items:center; justify-content:space-between; gap:10px; }
    .v-empty {
      text-align:center; padding:64px 24px;
      display:flex; flex-direction:column; align-items:center; gap:12px;
    }

    .toast-container {
      position:fixed; top:20px; right:20px; z-index:9999;
      display:flex; flex-direction:column; gap:10px; pointer-events:none;
    }
    .toast-container > * { pointer-events:all; }
    @media(max-width:420px) { .toast-container { top:12px; right:12px; left:12px; } }
  `;

  const listar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/visitantes");
      setVisitantes(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Erro ao listar visitantes:", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { listar(); }, [listar]);

  const abrirModalNovo = () => {
    setEditandoId(null); setForm(formInicial);
    decisaoAnteriorRef.current = null; setIsModalOpen(true);
  };

  const abrirModalEdicao = (v) => {
    setEditandoId(v.id);
    setForm({
      nome: v.nome || "", email: v.email || "", telefone: v.telefone || "",
      dataPrimeiraVisita: v.dataPrimeiraVisita ? v.dataPrimeiraVisita.split("T")[0] : "",
      origem: v.origem || "CONVITE",
      responsavelAcompanhamento: v.responsavelAcompanhamento || "",
      convertido: !!v.convertido,
      decisaoEspiritual: v.decisaoEspiritual || "NENHUMA",
    });
    decisaoAnteriorRef.current = v.decisaoEspiritual || "NENHUMA";
    setIsModalOpen(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      const novaDecisao = form.decisaoEspiritual || "NENHUMA";
      if (editandoId) {
        await api.put(`/visitantes/${editandoId}`, form);
        const anterior = decisaoAnteriorRef.current || "NENHUMA";
        if (novaDecisao !== anterior && DECISOES[novaDecisao]) disparar(novaDecisao, form.nome);
      } else {
        await api.post("/visitantes", form);
        if (DECISOES[novaDecisao]) disparar(novaDecisao, form.nome);
      }
      fecharModal(); listar();
    } catch { alert("Erro ao salvar visitante."); }
  };

  const fecharModal = () => {
    setIsModalOpen(false); setForm(formInicial);
    setEditandoId(null); decisaoAnteriorRef.current = null;
  };
  const f = v => setForm(p => ({ ...p, ...v }));

  const visitantesFiltrados = visitantes.filter(v =>
      v.nome?.toLowerCase().includes(filtro.toLowerCase())
  );

  /* ─── Card de Visitante ─── */
  const VisitanteCard = ({ v }) => {
    const decisaoCfg = DECISOES[v.decisaoEspiritual];
    const temDecisao = !!decisaoCfg;
    const { Icon: DIcon } = decisaoCfg || {};

    const cardVars = temDecisao ? {
      "--d-color":    decisaoCfg.color,
      "--d-bg":       decisaoCfg.colorBg,
      "--d-bg-card":  isDark
          ? `color-mix(in srgb, ${decisaoCfg.colorBgCard}, rgba(17,10,13,.97) 85%)`
          : `color-mix(in srgb, ${decisaoCfg.colorBgCard}, rgba(255,255,255,.92) 80%)`,
      "--d-border":   decisaoCfg.colorBorderCard,
      "--d-shadow":   isDark
          ? `${decisaoCfg.colorBg}`
          : `${decisaoCfg.colorBg}`,
    } : {};

    /* fallback para browsers sem color-mix */
    const cardBgFinal = temDecisao
        ? (isDark ? `rgba(17,10,13,.97)` : `rgba(255,255,255,.95)`)
        : cardBg;

    return (
        <motion.div
            className={`ieq-visit-card${temDecisao ? " tem-decisao" : ""}`}
            style={{
              ...cardVars,
              ...(temDecisao ? {
                background: cardBgFinal,
                borderColor: decisaoCfg.colorBorderCard,
                boxShadow: `0 4px 20px ${decisaoCfg.colorBg}`,
              } : {}),
            }}
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            onClick={() => abrirModalEdicao(v)}
        >
          {/* Faixa celebratória */}
          {temDecisao && (
              <div className="card-faixa" style={{ "--d-bg": decisaoCfg.colorBg, "--d-border": decisaoCfg.colorBorderCard }}>
                <DIcon size={13} style={{ color: decisaoCfg.color, flexShrink: 0 }} />
                <span style={{
                  fontFamily: "'EB Garamond',serif", fontSize: 13.5, fontStyle: "italic",
                  color: decisaoCfg.color, fontWeight: 600,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
              {decisaoCfg.mensagem(v.nome.split(" ")[0])}
            </span>
              </div>
          )}

          {/* Corpo do card */}
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: temDecisao
                    ? decisaoCfg.colorBg
                    : `linear-gradient(135deg,${purpleDark}33,${purple}22)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: temDecisao ? decisaoCfg.color : purple,
                fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 17,
                border: `1px solid ${temDecisao ? decisaoCfg.colorBorder : `${purple}33`}`,
                transition: "all .3s",
              }}>
                {v.nome?.charAt(0).toUpperCase()}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <h4 style={{
                  fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700,
                  letterSpacing: ".1em", color: textPrimary, margin: "0 0 5px",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {v.nome}
                </h4>
                <span style={{
                  display: "inline-block", padding: "2px 9px", borderRadius: 99,
                  background: isDark ? "rgba(124,58,237,.15)" : "rgba(124,58,237,.08)",
                  color: purple, border: `1px solid ${purple}33`,
                  fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 700, letterSpacing: ".1em",
                }}>
                {ORIGENS[v.origem] || v.origem}
              </span>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${temDecisao ? decisaoCfg.colorBorderCard : border}`, paddingTop: 10,
              display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={12} style={{ color: textSec, flexShrink: 0 }} />
                <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textSec }}>
                {v.telefone || "Sem telefone"}
              </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={12} style={{ color: textSec, flexShrink: 0 }} />
                <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textSec }}>
                {v.dataPrimeiraVisita
                    ? new Date(v.dataPrimeiraVisita + "T12:00:00").toLocaleDateString("pt-BR")
                    : "Data não registrada"}
              </span>
              </div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: temDecisao
                    ? decisaoCfg.colorBg
                    : (isDark ? "rgba(255,255,255,.03)" : "rgba(124,58,237,.04)"),
                padding: "8px 11px", borderRadius: 8,
                border: `1px solid ${temDecisao ? decisaoCfg.colorBorderCard : `${purple}22`}`,
                marginTop: 2,
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".14em",
                    color: textSec, margin: "0 0 2px" }}>ACOMPANHAMENTO</p>
                  <p style={{
                    fontFamily: "'EB Garamond',serif", fontSize: 13,
                    color: temDecisao ? decisaoCfg.color : purple,
                    margin: 0, fontStyle: "italic",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {v.responsavelAcompanhamento || "A definir"}
                  </p>
                </div>
                <ChevronRight size={14} style={{ color: temDecisao ? decisaoCfg.color : textSec, flexShrink: 0, marginLeft: 6 }} />
              </div>
            </div>
          </div>
        </motion.div>
    );
  };

  return (
      <div className="v-wrap" style={{ fontFamily: "'EB Garamond',serif", color: textPrimary }}>
        <style>{styles}</style>

        {/* Toast Container */}
        <div className="toast-container">
          <AnimatePresence>
            {toasts.map(toast => (
                <ToastNotificacao key={toast.id} toast={toast} fechar={fechar} isDark={isDark} />
            ))}
          </AnimatePresence>
        </div>

        {/* Header sticky */}
        <div className="v-header">
          <div className="v-header-top">
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:`${purple}22`,
                display:"flex", alignItems:"center", justifyContent:"center",
                color:purple, flexShrink:0 }}>
                <UserPlus size={19} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:700,
                  letterSpacing:".16em", color:textPrimary, margin:0,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  VISITANTES
                </h3>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".16em",
                  color:textSec, margin:0 }}>
                  {visitantes.length} PESSOAS ALCANÇADAS
                </p>
              </div>
            </div>
            <button className="btn-novo" onClick={abrirModalNovo}>
              <Plus size={14} /> NOVO
            </button>
          </div>
          <div className="search-wrap">
            <Search size={14} style={{ position:"absolute", left:13, top:"50%",
              transform:"translateY(-50%)", color:IEQ.red, opacity:.6, pointerEvents:"none" }} />
            <input className="ieq-field" style={{ paddingLeft:40 }}
                   placeholder="Buscar visitante..."
                   value={filtro} onChange={e => setFiltro(e.target.value)} />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="v-inner">
          {loading ? (
              <div style={{ textAlign:"center", padding:"64px 0" }}>
                <Loader2 size={32} className="spin-icon" style={{ color:purple, display:"inline-block" }} />
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em",
                  color:textSec, marginTop:12 }}>CARREGANDO...</p>
              </div>
          ) : visitantesFiltrados.length === 0 ? (
              <div className="v-empty">
                <div style={{ width:56, height:56, borderRadius:14, background:`${purple}18`,
                  display:"flex", alignItems:"center", justifyContent:"center", color:purple }}>
                  <Users size={26} />
                </div>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".18em",
                  color:textSec, margin:0 }}>
                  {filtro ? "NENHUM RESULTADO" : "NENHUM VISITANTE AINDA"}
                </p>
                {!filtro && (
                    <button className="btn-novo" onClick={abrirModalNovo} style={{ marginTop:4 }}>
                      <Plus size={14} /> CADASTRAR PRIMEIRO
                    </button>
                )}
              </div>
          ) : (
              <motion.div className="ieq-grid-v" initial="hidden" animate="visible"
                          variants={{ hidden:{}, visible:{ transition:{ staggerChildren:.05 } } }}>
                {visitantesFiltrados.map(v => <VisitanteCard key={v.id} v={v} />)}
              </motion.div>
          )}
        </div>

        {/* MODAL */}
        <AnimatePresence>
          {isModalOpen && (
              <div className="ieq-modal-backdrop">
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                            onClick={fecharModal}
                            style={{ position:"fixed", inset:0, background:"rgba(10,6,8,.85)",
                              backdropFilter:"blur(16px)", zIndex:0 }} />

                <motion.div
                    initial={{ y:"-100%" }} animate={{ y:0 }} exit={{ y:"-100%" }}
                    transition={{ type:"spring", damping:32, stiffness:280 }}
                    className="ieq-modal-box"
                    style={{ background:cardBg, border:`1px solid ${border}`, backdropFilter:"blur(24px)" }}>

                  <div style={{ padding:"16px 20px 12px", borderBottom:`1px solid ${border}`,
                    flexShrink:0, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700,
                        letterSpacing:".16em", color:textPrimary, margin:0 }}>
                        {editandoId ? "ATUALIZAR PERFIL" : "NOVO VISITANTE"}
                      </h2>
                      <div style={{ height:2, width:32, background:`linear-gradient(90deg,${purple},${IEQ.red})`,
                        borderRadius:99, marginTop:5 }} />
                    </div>
                    <button onClick={fecharModal}
                            style={{ background:"none", border:"none", cursor:"pointer",
                              color:textSec, padding:6, borderRadius:8 }}>
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={salvar}
                        style={{ overflowY:"auto", flex:1, padding:"18px 20px 32px",
                          display:"flex", flexDirection:"column", gap:14,
                          WebkitOverflowScrolling:"touch" }}>

                    <div>
                      <label className="ieq-label">NOME DO VISITANTE *</label>
                      <input required className="ieq-field" placeholder="Nome completo"
                             value={form.nome} onChange={e => f({ nome:e.target.value })} />
                    </div>

                    <div className="ieq-form-grid2">
                      <div>
                        <label className="ieq-label">WHATSAPP</label>
                        <input className="ieq-field" placeholder="(00) 00000-0000" inputMode="tel"
                               value={form.telefone} onChange={e => f({ telefone:e.target.value })} />
                      </div>
                      <div>
                        <label className="ieq-label">E-MAIL</label>
                        <input type="email" className="ieq-field" placeholder="Opcional" inputMode="email"
                               value={form.email} onChange={e => f({ email:e.target.value })} />
                      </div>
                    </div>

                    <div className="ieq-form-grid2">
                      <div>
                        <label className="ieq-label">DATA DA VISITA</label>
                        <input type="date" className="ieq-field"
                               value={form.dataPrimeiraVisita}
                               onChange={e => f({ dataPrimeiraVisita:e.target.value })} />
                      </div>
                      <div>
                        <label className="ieq-label">COMO CHEGOU?</label>
                        <select className="ieq-field" value={form.origem}
                                onChange={e => f({ origem:e.target.value })}>
                          {Object.entries(ORIGENS).map(([v,l]) =>
                              <option key={v} value={v}>{l}</option>
                          )}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="ieq-label">RESPONSÁVEL PELO CONVITE</label>
                      <div style={{ position:"relative" }}>
                        <Users size={14} style={{ position:"absolute", left:13, top:"50%",
                          transform:"translateY(-50%)", color:textSec, pointerEvents:"none" }} />
                        <input className="ieq-field" style={{ paddingLeft:40 }}
                               placeholder="Nome do líder responsável"
                               value={form.responsavelAcompanhamento}
                               onChange={e => f({ responsavelAcompanhamento:e.target.value })} />
                      </div>
                    </div>

                    {/* Decisão Espiritual */}
                    <div>
                      <label className="ieq-label">DECISÃO ESPIRITUAL</label>
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>

                        <label style={{
                          display:"flex", alignItems:"center", gap:12,
                          padding:"12px 14px", borderRadius:10, cursor:"pointer",
                          background: form.decisaoEspiritual === "NENHUMA"
                              ? isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)" : "transparent",
                          border:`1px solid ${form.decisaoEspiritual === "NENHUMA" ? border : "transparent"}`,
                          transition:"all .2s",
                        }}>
                          <input type="radio" name="decisao" value="NENHUMA" style={{ display:"none" }}
                                 checked={form.decisaoEspiritual === "NENHUMA"}
                                 onChange={() => f({ decisaoEspiritual:"NENHUMA" })} />
                          <div style={{ width:18, height:18, borderRadius:"50%", flexShrink:0,
                            border:`2px solid ${form.decisaoEspiritual === "NENHUMA" ? purple : textSec}`,
                            background: form.decisaoEspiritual === "NENHUMA" ? purple : "transparent",
                            display:"flex", alignItems:"center", justifyContent:"center" }}>
                            {form.decisaoEspiritual === "NENHUMA" &&
                                <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }} />}
                          </div>
                          <span style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:textSec }}>
                        Nenhuma decisão
                      </span>
                        </label>

                        {Object.entries(DECISOES).map(([key, cfg]) => {
                          const { Icon } = cfg;
                          const ativo = form.decisaoEspiritual === key;
                          return (
                              <label key={key} style={{
                                display:"flex", alignItems:"center", gap:12,
                                padding:"12px 14px", borderRadius:10, cursor:"pointer",
                                background: ativo ? cfg.colorBg : "transparent",
                                border:`1px solid ${ativo ? cfg.colorBorder : border}`,
                                transition:"all .2s",
                              }}>
                                <input type="radio" name="decisao" value={key} style={{ display:"none" }}
                                       checked={ativo} onChange={() => f({ decisaoEspiritual:key })} />
                                <div style={{ width:18, height:18, borderRadius:"50%", flexShrink:0,
                                  border:`2px solid ${ativo ? cfg.color : textSec}`,
                                  background: ativo ? cfg.color : "transparent",
                                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                                  {ativo && <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }} />}
                                </div>
                                <Icon size={16} style={{ color: ativo ? cfg.color : textSec, flexShrink:0 }} />
                                <span style={{ fontFamily:"'EB Garamond',serif", fontSize:14,
                                  color: ativo ? cfg.color : textPrimary, fontWeight: ativo ? 600 : 400 }}>
                            {cfg.emoji} {cfg.label}
                          </span>
                              </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Toggle Convertido */}
                    <label style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"14px 16px", borderRadius:10, cursor:"pointer", transition:"all .3s",
                      background: form.convertido
                          ? "rgba(5,150,105,.15)"
                          : isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)",
                      border:`1px solid ${form.convertido ? "rgba(5,150,105,.4)" : border}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <ShieldCheck size={20} style={{ color: form.convertido ? "#059669" : textSec }} />
                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700,
                          letterSpacing:".12em", color: form.convertido ? "#059669" : textPrimary }}>
                      JÁ ACEITOU JESUS?
                    </span>
                      </div>
                      <input type="checkbox" style={{ display:"none" }}
                             checked={form.convertido} onChange={e => f({ convertido:e.target.checked })} />
                      <div style={{ width:44, height:24, borderRadius:99, position:"relative",
                        transition:"all .3s", flexShrink:0,
                        background: form.convertido ? "#059669" : isDark ? "rgba(255,255,255,.15)" : "rgba(0,0,0,.15)" }}>
                        <div style={{ position:"absolute", top:3, width:18, height:18,
                          borderRadius:"50%", background:"#fff", transition:"all .3s",
                          left: form.convertido ? 23 : 3, boxShadow:"0 1px 4px rgba(0,0,0,.2)" }} />
                      </div>
                    </label>

                    <button type="submit"
                            style={{ padding:"15px 0", borderRadius:10, border:"none", cursor:"pointer",
                              background:`linear-gradient(135deg,${purpleDark},${purple})`, color:"#fff",
                              fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700,
                              letterSpacing:".16em", marginTop:4 }}>
                      {editandoId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR CADASTRO"}
                    </button>
                  </form>
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </div>
  );
}
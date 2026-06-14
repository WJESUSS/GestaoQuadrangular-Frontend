import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
  Search, Phone, Calendar, Users, Droplets, RefreshCw,
  Archive, ArchiveRestore, ArchiveX,
  Heart, Home, X, Loader2,
} from "lucide-react";

/* ─── Paleta IEQ ─── */
const IEQ = {
  red:"#C8102E", redDark:"#8B0B1F",
  yellow:"#FDB813", blue:"#003DA5", blueDark:"#002470",
  offWhite:"#F5F0E8", dark:"#0A0608",
};
const purple = "#7C3AED";

const ORIGENS = {
  CONVITE:"Convite", REDES_SOCIAIS:"Redes Sociais",
  ESPONTANEO:"Espontâneo", OUTRO:"Outro",
  CASA_DE_PAZ:"Casa de Paz", EVENTO:"Evento",
  MISSAO_70:"Missão 70", CELULA:"Célula",
};

const DECISOES = {
  ACEITOU_JESUS: {
    label:"Aceitou a Jesus", emoji:"🙌",
    color:"#059669",
    colorBg:"rgba(5,150,105,.13)", colorBgCard:"rgba(5,150,105,.06)",
    colorBorder:"rgba(5,150,105,.5)", colorBorderCard:"rgba(5,150,105,.35)",
    Icon:Heart,
  },
  BATISMO_AGUAS: {
    label:"Decidiu pelo Batismo", emoji:"💧",
    color:IEQ.blue,
    colorBg:"rgba(0,61,165,.13)", colorBgCard:"rgba(0,61,165,.06)",
    colorBorder:"rgba(0,61,165,.5)", colorBorderCard:"rgba(0,61,165,.35)",
    Icon:Droplets,
  },
  RECONCILIOU: {
    label:"Reconciliou com Deus", emoji:"🤝",
    color:"#D97706",
    colorBg:"rgba(217,119,6,.13)", colorBgCard:"rgba(217,119,6,.06)",
    colorBorder:"rgba(217,119,6,.5)", colorBorderCard:"rgba(217,119,6,.35)",
    Icon:RefreshCw,
  },
};

const TOAST_TYPES = { DECISAO:"decisao", ARQUIVADO:"arquivado", DESARQUIVADO:"desarquivado" };

const TAMANHO_PAGINA = 50;

const getHeaders = () => {
  const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
  return { Authorization: `Bearer ${token}` };
};

/* ─── Badge Célula ─── */
function BadgeCelula({ nomeCelula, cor, corBg, corBorder }) {
  return (
      <div style={{
        display:"inline-flex", alignItems:"center", gap:5,
        padding:"4px 10px", borderRadius:99, marginTop:2,
        background: corBg, border:`1px solid ${corBorder}`,
      }}>
        <Home size={10} style={{ color:cor, flexShrink:0 }} />
        <span style={{
          fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700,
          letterSpacing:".12em", textTransform:"uppercase", color:cor,
        }}>
        {nomeCelula}
      </span>
      </div>
  );
}

/* ─── Hook de Notificações ─── */
function useNotificacoes() {
  const [toasts, setToasts] = useState([]);
  const disparar = useCallback((tipo, payload) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, tipo, ...payload }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);
  const fechar = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, disparar, fechar };
}

/* ─── Toast ─── */
function ToastNotificacao({ toast, fechar, isDark }) {
  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const toastBg     = isDark ? "rgba(17,10,13,.98)" : "rgba(255,255,255,.98)";
  let borderColor, iconColor, iconBg, IconComp, title, subtitle;

  if (toast.tipo === TOAST_TYPES.DECISAO) {
    const cfg = DECISOES[toast.decisao];
    borderColor = cfg.colorBorder; iconColor = cfg.color;
    iconBg = cfg.colorBg; IconComp = cfg.Icon;
    title = "NOVA DECISÃO ESPIRITUAL";
    subtitle = `${cfg.emoji} ${toast.nome} ${cfg.label.toLowerCase()}!`;
  } else if (toast.tipo === TOAST_TYPES.ARQUIVADO) {
    borderColor = "rgba(217,119,6,.45)"; iconColor = "#D97706";
    iconBg = "rgba(217,119,6,.12)"; IconComp = Archive;
    title = "VISITANTE ARQUIVADO";
    subtitle = `${toast.nome} foi arquivado com sucesso.`;
  } else {
    borderColor = `${purple}55`; iconColor = purple;
    iconBg = `${purple}18`; IconComp = ArchiveRestore;
    title = "VISITANTE RESTAURADO";
    subtitle = `${toast.nome} voltou para a lista da célula.`;
  }

  return (
      <motion.div layout
                  initial={{ opacity:0, x:80, scale:.92 }} animate={{ opacity:1, x:0, scale:1 }}
                  exit={{ opacity:0, x:80, scale:.92 }}
                  transition={{ type:"spring", damping:26, stiffness:300 }}
                  style={{
                    background:toastBg, border:`1px solid ${borderColor}`, borderRadius:14,
                    padding:"14px 16px", minWidth:280, maxWidth:340,
                    boxShadow:`0 8px 32px rgba(0,0,0,.18), 0 0 0 1px ${borderColor}`,
                    backdropFilter:"blur(24px)", overflow:"hidden",
                    position:"relative", display:"flex", flexDirection:"column", gap:8,
                  }}>
        <motion.div initial={{ scaleX:1 }} animate={{ scaleX:0 }}
                    transition={{ duration:5, ease:"linear" }}
                    style={{ position:"absolute", bottom:0, left:0, right:0, height:3,
                      background:iconColor, transformOrigin:"left", borderRadius:"0 0 14px 14px" }} />
        <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, flexShrink:0,
            background:iconBg, border:`1px solid ${borderColor}`,
            display:"flex", alignItems:"center", justifyContent:"center", color:iconColor }}>
            <IconComp size={18} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700,
              letterSpacing:".18em", color:iconColor, margin:"0 0 3px", textTransform:"uppercase" }}>
              {title}
            </p>
            <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:textPrimary,
              margin:0, fontStyle:"italic", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {subtitle}
            </p>
          </div>
          <button onClick={() => fechar(toast.id)} style={{
            background:"none", border:"none", cursor:"pointer",
            color:isDark ? "rgba(245,240,232,.6)" : "rgba(26,10,13,.55)",
            padding:2, borderRadius:6, display:"flex", flexShrink:0 }}>
            <X size={15} />
          </button>
        </div>
      </motion.div>
  );
}

/* ─── Botão Carregar Mais ─── */
function BotaoCarregarMais({ onClick, carregando, isDark }) {
  const textSec = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const border  = isDark ? "rgba(124,58,237,.3)" : "rgba(124,58,237,.25)";
  return (
      <button onClick={onClick} disabled={carregando} style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"center",
        gap:8, padding:"13px 0", marginTop:14, borderRadius:10,
        border:`1px solid ${border}`, background: isDark ? `${purple}10` : `${purple}08`,
        cursor: carregando ? "not-allowed" : "pointer", opacity: carregando ? .6 : 1,
        fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".16em",
        color: purple,
      }}>
        {carregando ? (
            <><Loader2 size={13} className="spin-icon" /> CARREGANDO...</>
        ) : (
            <>CARREGAR MAIS</>
        )}
      </button>
  );
}

/* ─── Info de contagem ─── */
function InfoContagem({ carregados, total, isDark }) {
  const textSec = isDark ? "rgba(245,240,232,.4)" : "rgba(26,10,13,.4)";
  return (
      <p style={{
        textAlign:"center", marginTop:10, marginBottom:0,
        fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".14em",
        color:textSec,
      }}>
        {carregados} DE {total}
      </p>
  );
}

/* ─── Aba Arquivados ─── */
function ArquivadosLista({ isDark, celulaId, onDesarquivar }) {
  const [arquivados, setArquivados]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [pagina, setPagina]           = useState(0);
  const [temMais, setTemMais]         = useState(false);
  const [total, setTotal]             = useState(0);

  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const cardBg      = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
  const border      = isDark ? "rgba(217,119,6,.18)" : "rgba(217,119,6,.15)";

  const carregarPagina = useCallback(async (numeroPagina, reset) => {
    if (reset) setLoading(true);
    else setCarregandoMais(true);

    try {
      if (celulaId) {
        // Endpoint por célula retorna lista simples (geralmente pequena) — sem paginação
        const res = await api.get(`/visitantes/celula/${celulaId}/arquivados`, { headers: getHeaders() });
        const lista = Array.isArray(res.data) ? res.data : [];
        setArquivados(lista);
        setTemMais(false);
        setTotal(lista.length);
      } else {
        const res = await api.get("/visitantes/arquivados", {
          headers: getHeaders(),
          params: { page: numeroPagina, size: TAMANHO_PAGINA },
        });
        const conteudo = Array.isArray(res.data) ? res.data : (res.data.content || []);
        const ultimaPagina = Array.isArray(res.data) ? true : (res.data.last ?? (conteudo.length < TAMANHO_PAGINA));
        const totalElems = Array.isArray(res.data) ? conteudo.length : (res.data.totalElements ?? conteudo.length);

        setArquivados(prev => reset ? conteudo : [...prev, ...conteudo]);
        setTemMais(!ultimaPagina);
        setTotal(totalElems);
        setPagina(numeroPagina);
      }
    } catch {
      if (reset) setArquivados([]);
    } finally {
      setLoading(false);
      setCarregandoMais(false);
    }
  }, [celulaId]);

  useEffect(() => { carregarPagina(0, true); }, [carregarPagina]);

  const carregarMais = () => {
    if (!temMais || carregandoMais) return;
    carregarPagina(pagina + 1, false);
  };

  const recarregar = () => carregarPagina(0, true);

  if (loading) return (
      <div style={{ textAlign:"center", padding:"48px 0" }}>
        <Loader2 size={28} style={{ color:purple, animation:"spin 1s linear infinite", display:"inline-block" }} />
      </div>
  );

  if (arquivados.length === 0) return (
      <div style={{ textAlign:"center", padding:"56px 24px",
        display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
        <div style={{ width:52, height:52, borderRadius:14, background:"rgba(217,119,6,.1)",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <ArchiveX size={24} style={{ color:"#D97706" }} />
        </div>
        <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em",
          color:textSec, margin:0 }}>NENHUM VISITANTE ARQUIVADO</p>
      </div>
  );

  return (
      <div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {arquivados.map(v => {
            const decisaoCfg = DECISOES[v.decisaoEspiritual];
            const nomeCelula = typeof v.celula === "object" ? v.celula?.nome : v.celula;
            return (
                <div key={v.id} style={{
                  background:cardBg,
                  border:`1px solid ${decisaoCfg ? decisaoCfg.colorBorderCard : border}`,
                  borderRadius:12, overflow:"hidden",
                }}>
                  {decisaoCfg && (
                      <div style={{
                        padding:"7px 14px", display:"flex", alignItems:"center", gap:8,
                        background:decisaoCfg.colorBg, borderBottom:`1px solid ${decisaoCfg.colorBorderCard}`,
                      }}>
                        <span style={{ fontSize:14 }}>{decisaoCfg.emoji}</span>
                        <span style={{ fontFamily:"'EB Garamond',serif", fontSize:13,
                          color:decisaoCfg.color, fontStyle:"italic", fontWeight:600, flex:1 }}>
                  {decisaoCfg.label}
                </span>
                        {v.dataArquivamento && (
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:8,
                              color:decisaoCfg.color, opacity:.7, letterSpacing:".1em" }}>
                    {new Date(v.dataArquivamento + "T12:00:00").toLocaleDateString("pt-BR")}
                  </span>
                        )}
                      </div>
                  )}
                  <div style={{ padding:"12px 14px", display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{
                      width:40, height:40, borderRadius:10, flexShrink:0,
                      background: decisaoCfg ? decisaoCfg.colorBg : "rgba(217,119,6,.1)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      color: decisaoCfg ? decisaoCfg.color : "#D97706",
                      fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:16,
                      border:`1px solid ${decisaoCfg ? decisaoCfg.colorBorder : "rgba(217,119,6,.3)"}`,
                    }}>
                      {v.nome?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700,
                        letterSpacing:".1em", color:textPrimary, margin:"0 0 5px",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {v.nome}
                      </p>
                      {nomeCelula && (
                          <BadgeCelula
                              nomeCelula={nomeCelula}
                              cor={decisaoCfg ? decisaoCfg.color : "#D97706"}
                              corBg={decisaoCfg ? decisaoCfg.colorBg : "rgba(217,119,6,.1)"}
                              corBorder={decisaoCfg ? decisaoCfg.colorBorder : "rgba(217,119,6,.3)"}
                          />
                      )}
                    </div>
                    <button onClick={() => onDesarquivar(v, recarregar)} style={{
                      display:"flex", alignItems:"center", gap:6, padding:"9px 13px",
                      borderRadius:8, border:`1px solid ${purple}44`,
                      background:`${purple}12`, cursor:"pointer", flexShrink:0,
                      fontFamily:"'Cinzel',serif", fontSize:8, fontWeight:700,
                      letterSpacing:".12em", color:purple,
                    }}>
                      <ArchiveRestore size={13} />
                      RESTAURAR
                    </button>
                  </div>
                </div>
            );
          })}
        </div>

        {!celulaId && temMais && (
            <BotaoCarregarMais onClick={carregarMais} carregando={carregandoMais} isDark={isDark} />
        )}
        {!celulaId && (
            <InfoContagem carregados={arquivados.length} total={total} isDark={isDark} />
        )}
      </div>
  );
}

/* ─── Card do Visitante ─── */
function VisitanteCard({ v, isDark, onArquivar, destacarId }) {
  const decisaoCfg  = DECISOES[v.decisaoEspiritual];
  const temDecisao  = !!decisaoCfg;
  const isDestacado = destacarId === v.id;
  const nomeCelula  = typeof v.celula === "object" ? v.celula?.nome : v.celula;

  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const cardBg      = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
  const border      = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";

  return (
      <motion.div layout
                  initial={{ opacity:0, y:12 }}
                  animate={{
                    opacity:1, y:0,
                    boxShadow: isDestacado && temDecisao
                        ? [`0 0 0 0px ${decisaoCfg.colorBg}`, `0 0 0 6px ${decisaoCfg.colorBg}`, `0 0 0 0px ${decisaoCfg.colorBg}`]
                        : "none",
                  }}
                  transition={{
                    opacity:{ duration:.3 }, y:{ duration:.3 },
                    boxShadow:{ duration:1.2, repeat:2, repeatType:"loop" },
                  }}
                  style={{
                    background: temDecisao ? (isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.95)") : cardBg,
                    border:`1px solid ${temDecisao ? decisaoCfg.colorBorderCard : border}`,
                    borderRadius:12, overflow:"hidden", cursor:"default",
                  }}>

        {/* Faixa de decisão */}
        {temDecisao && (
            <div style={{
              padding:"9px 14px", display:"flex", alignItems:"center", gap:8,
              background:decisaoCfg.colorBg, borderBottom:`1px solid ${decisaoCfg.colorBorderCard}`,
              position:"relative", overflow:"hidden",
            }}>
              <motion.div
                  animate={{ x:["-100%","200%"] }}
                  transition={{ duration:2.5, repeat:Infinity, ease:"linear" }}
                  style={{ position:"absolute", inset:0,
                    background:"linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)",
                    pointerEvents:"none" }} />
              <span style={{ fontSize:15 }}>{decisaoCfg.emoji}</span>
              <span style={{ fontFamily:"'EB Garamond',serif", fontSize:13.5,
                fontStyle:"italic", color:decisaoCfg.color, fontWeight:600, flex:1 }}>
            {decisaoCfg.label}
          </span>
              <decisaoCfg.Icon size={13} style={{ color:decisaoCfg.color, flexShrink:0 }} />
            </div>
        )}

        <div style={{ padding:"14px 16px 16px", display:"flex", flexDirection:"column", gap:10 }}>

          {/* Avatar + Nome */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{
              width:44, height:44, borderRadius:10, flexShrink:0,
              background: temDecisao ? decisaoCfg.colorBg : `${purple}22`,
              display:"flex", alignItems:"center", justifyContent:"center",
              color: temDecisao ? decisaoCfg.color : purple,
              fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:17,
              border:`1px solid ${temDecisao ? decisaoCfg.colorBorder : `${purple}33`}`,
            }}>
              {v.nome?.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <h4 style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700,
                letterSpacing:".1em", color:textPrimary, margin:"0 0 5px",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {v.nome}
              </h4>
              {temDecisao ? (
                  <span style={{
                    display:"inline-flex", alignItems:"center", gap:5,
                    padding:"3px 10px", borderRadius:99,
                    background:decisaoCfg.colorBg, border:`1px solid ${decisaoCfg.colorBorderCard}`,
                    color:decisaoCfg.color,
                    fontFamily:"'Cinzel',serif", fontSize:8, fontWeight:700, letterSpacing:".1em",
                  }}>
                <decisaoCfg.Icon size={8} />{decisaoCfg.label}
              </span>
              ) : (
                  <span style={{
                    display:"inline-block", padding:"2px 9px", borderRadius:99,
                    background: isDark ? `${purple}22` : `${purple}12`,
                    color:purple, border:`1px solid ${purple}33`,
                    fontFamily:"'Cinzel',serif", fontSize:8, fontWeight:700, letterSpacing:".1em",
                  }}>
                {ORIGENS[v.origem] || v.origem}
              </span>
              )}
            </div>
          </div>

          {/* Infos básicas */}
          <div style={{ borderTop:`1px solid ${temDecisao ? decisaoCfg.colorBorderCard : border}`,
            paddingTop:10, display:"flex", flexDirection:"column", gap:7 }}>

            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Phone size={12} style={{ color:textSec, flexShrink:0 }} />
              <span style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSec }}>
              {v.telefone || "Sem telefone"}
            </span>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Calendar size={12} style={{ color:textSec, flexShrink:0 }} />
              <span style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSec }}>
              {v.dataPrimeiraVisita
                  ? new Date(v.dataPrimeiraVisita + "T12:00:00").toLocaleDateString("pt-BR")
                  : "Data não registrada"}
            </span>
            </div>

            {/* Badge célula em destaque */}
            {nomeCelula && (
                <BadgeCelula
                    nomeCelula={nomeCelula}
                    cor={temDecisao ? decisaoCfg.color : purple}
                    corBg={temDecisao ? decisaoCfg.colorBg : `${purple}18`}
                    corBorder={temDecisao ? decisaoCfg.colorBorder : `${purple}44`}
                />
            )}

            {/* Botão Arquivar — só quando tem decisão espiritual */}
            {temDecisao && (
                <button onClick={() => onArquivar(v.id)} style={{
                  width:"100%", display:"flex", alignItems:"center", justifyContent:"center",
                  gap:6, padding:"10px 0", borderRadius:8, marginTop:4,
                  border:"1px solid rgba(217,119,6,.4)", background:"rgba(217,119,6,.1)",
                  cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700,
                  letterSpacing:".14em", color:"#D97706",
                }}>
                  <Archive size={13} />
                  ARQUIVAR VISITANTE
                </button>
            )}
          </div>
        </div>
      </motion.div>
  );
}

/* ─── Componente Principal ─── */
export default function Visitantes({ celulaId, isDark = false }) {
  const [visitantes, setVisitantes] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [pagina,     setPagina]     = useState(0);
  const [temMais,    setTemMais]    = useState(false);
  const [totalAtivos, setTotalAtivos] = useState(0);
  const [filtro,     setFiltro]     = useState("");
  const [abaAtiva,   setAbaAtiva]   = useState("ativos");
  const [destacarId, setDestacarId] = useState(null);

  const { toasts, disparar, fechar } = useNotificacoes();

  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const border      = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";
  const pageBg      = isDark ? IEQ.dark : IEQ.offWhite;
  const inputBg     = isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)";

  const styles = `
    @keyframes spin{to{transform:rotate(360deg)}}
    .spin-icon{animation:spin 1s linear infinite;}
    .v-wrap{min-height:100vh;width:100%;background:${pageBg};box-sizing:border-box;}
    .v-inner{width:100%;max-width:960px;margin:0 auto;padding:20px 16px 32px;box-sizing:border-box;}
    .ieq-field{width:100%;box-sizing:border-box;background:${inputBg};border:1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)"};color:${textPrimary};padding:12px 14px;border-radius:8px;outline:none;font-family:'EB Garamond',serif;font-size:16px;transition:all .25s;-webkit-appearance:none;}
    .ieq-field:focus{border-color:${IEQ.red};box-shadow:0 0 0 3px rgba(200,16,46,.12);}
    .ieq-field::placeholder{color:${isDark?"rgba(245,240,232,.25)":"rgba(26,10,13,.3)"};}
    .ieq-grid-v{display:grid;grid-template-columns:1fr;gap:12px;width:100%;}
    @media(min-width:540px){.ieq-grid-v{grid-template-columns:repeat(2,1fr);}}
    @media(min-width:860px){.ieq-grid-v{grid-template-columns:repeat(3,1fr);}}
    .v-header{position:sticky;top:0;z-index:10;background:${pageBg};padding:16px 16px 0;border-bottom:1px solid ${border};display:flex;flex-direction:column;gap:12px;}
    .v-header-top{display:flex;align-items:center;gap:10px;}
    .v-empty{text-align:center;padding:64px 24px;display:flex;flex-direction:column;align-items:center;gap:12px;}
    .toast-container{position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;}
    .toast-container>*{pointer-events:all;}
    @media(max-width:420px){.toast-container{top:12px;right:12px;left:12px;}}
    .aba-btn{flex:1;padding:11px 0;border:none;background:transparent;cursor:pointer;font-family:'Cinzel',serif;font-size:9px;font-weight:700;letter-spacing:.16em;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:7px;border-bottom:2px solid transparent;}
    .search-wrap{position:relative;width:100%;}
  `;

  const carregarPagina = useCallback(async (numeroPagina, reset) => {
    if (reset) setLoading(true);
    else setCarregandoMais(true);

    try {
      if (celulaId) {
        // Lista por célula — geralmente pequena, sem paginação
        const res = await api.get(`/visitantes/celula/${celulaId}/ativos`, { headers: getHeaders() });
        const lista = Array.isArray(res.data) ? res.data : [];
        setVisitantes(lista);
        setTemMais(false);
        setTotalAtivos(lista.length);
      } else {
        const res = await api.get("/visitantes", {
          headers: getHeaders(),
          params: { page: numeroPagina, size: TAMANHO_PAGINA },
        });
        const conteudo = Array.isArray(res.data) ? res.data : (res.data.content || []);
        const ultimaPagina = Array.isArray(res.data) ? true : (res.data.last ?? (conteudo.length < TAMANHO_PAGINA));
        const totalElems = Array.isArray(res.data) ? conteudo.length : (res.data.totalElements ?? conteudo.length);

        setVisitantes(prev => reset ? conteudo : [...prev, ...conteudo]);
        setTemMais(!ultimaPagina);
        setTotalAtivos(totalElems);
        setPagina(numeroPagina);
      }
    } catch (err) {
      console.error(err);
      if (reset) setVisitantes([]);
    } finally {
      setLoading(false);
      setCarregandoMais(false);
    }
  }, [celulaId]);

  useEffect(() => { carregarPagina(0, true); }, [carregarPagina]);

  const carregarMais = () => {
    if (!temMais || carregandoMais) return;
    carregarPagina(pagina + 1, false);
  };

  const recarregar = () => carregarPagina(0, true);

  const arquivar = async (id) => {
    const v = visitantes.find(x => x.id === id);
    try {
      await api.patch(`/visitantes/${id}/arquivar`, {}, { headers: getHeaders() });
      disparar(TOAST_TYPES.ARQUIVADO, { nome: v?.nome || "Visitante" });
      recarregar();
    } catch { alert("Erro ao arquivar visitante."); }
  };

  const desarquivar = async (v, recarregarArquivados) => {
    try {
      await api.patch(`/visitantes/${v.id}/desarquivar`, {}, { headers: getHeaders() });
      disparar(TOAST_TYPES.DESARQUIVADO, { nome: v.nome });
      recarregar();
      if (recarregarArquivados) recarregarArquivados();
    } catch { alert("Erro ao restaurar visitante."); }
  };

  const visitantesFiltrados = visitantes
      .filter(v => v.nome?.toLowerCase().includes(filtro.toLowerCase()))
      .sort((a, b) => {
        const aD = !!DECISOES[a.decisaoEspiritual];
        const bD = !!DECISOES[b.decisaoEspiritual];
        if (aD && !bD) return -1;
        if (!aD && bD) return 1;
        return 0;
      });

  const buscaPodeEstarIncompleta = filtro.trim() !== "" && temMais;

  return (
      <div className="v-wrap" style={{ fontFamily:"'EB Garamond',serif", color:textPrimary }}>
        <style>{styles}</style>

        <div className="toast-container">
          <AnimatePresence>
            {toasts.map(toast => (
                <ToastNotificacao key={toast.id} toast={toast} fechar={fechar} isDark={isDark} />
            ))}
          </AnimatePresence>
        </div>

        {/* Header */}
        <div className="v-header">
          <div className="v-header-top">
            <div style={{ width:40, height:40, borderRadius:10, background:`${purple}22`,
              display:"flex", alignItems:"center", justifyContent:"center", color:purple, flexShrink:0 }}>
              <Users size={19} />
            </div>
            <div style={{ minWidth:0 }}>
              <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:700,
                letterSpacing:".16em", color:textPrimary, margin:0 }}>VISITANTES</h3>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".16em",
                color:textSec, margin:0 }}>{totalAtivos} PESSOAS ALCANÇADAS</p>
            </div>
          </div>

          <div style={{ display:"flex", borderTop:`1px solid ${border}`, marginTop:4 }}>
            <button className="aba-btn" onClick={() => setAbaAtiva("ativos")}
                    style={{ color: abaAtiva==="ativos" ? purple : textSec,
                      borderBottomColor: abaAtiva==="ativos" ? purple : "transparent" }}>
              <Users size={13} /> ATIVOS
            </button>
            <button className="aba-btn" onClick={() => setAbaAtiva("arquivados")}
                    style={{ color: abaAtiva==="arquivados" ? "#D97706" : textSec,
                      borderBottomColor: abaAtiva==="arquivados" ? "#D97706" : "transparent" }}>
              <Archive size={13} /> ARQUIVADOS
            </button>
          </div>

          {abaAtiva === "ativos" && (
              <div className="search-wrap" style={{ paddingBottom:12 }}>
                <Search size={14} style={{ position:"absolute", left:13, top:"50%",
                  transform:"translateY(-50%)", color:IEQ.red, opacity:.6, pointerEvents:"none" }} />
                <input className="ieq-field" style={{ paddingLeft:40 }}
                       placeholder="Buscar visitante..."
                       value={filtro} onChange={e => setFiltro(e.target.value)} />
              </div>
          )}
        </div>

        <div className="v-inner">
          {abaAtiva === "arquivados" ? (
              <ArquivadosLista isDark={isDark} celulaId={celulaId} onDesarquivar={desarquivar} />
          ) : loading ? (
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
                  {filtro ? "NENHUM RESULTADO" : "NENHUM VISITANTE ATIVO"}
                </p>
                {filtro && temMais && (
                    <BotaoCarregarMais onClick={carregarMais} carregando={carregandoMais} isDark={isDark} />
                )}
              </div>
          ) : (
              <>
                <motion.div className="ieq-grid-v" initial="hidden" animate="visible"
                            variants={{ hidden:{}, visible:{ transition:{ staggerChildren:.05 } } }}>
                  {visitantesFiltrados.map(v => (
                      <VisitanteCard
                          key={v.id} v={v} isDark={isDark}
                          destacarId={destacarId}
                          onArquivar={arquivar}
                      />
                  ))}
                </motion.div>

                {!celulaId && temMais && (
                    <BotaoCarregarMais onClick={carregarMais} carregando={carregandoMais} isDark={isDark} />
                )}
                {!celulaId && (
                    <InfoContagem carregados={visitantes.length} total={totalAtivos} isDark={isDark} />
                )}
                {buscaPodeEstarIncompleta && !celulaId && (
                    <p style={{ textAlign:"center", marginTop:6,
                      fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".12em",
                      color:textSec }}>
                      CARREGUE MAIS PARA AMPLIAR A BUSCA
                    </p>
                )}
              </>
          )}
        </div>
      </div>
  );
}
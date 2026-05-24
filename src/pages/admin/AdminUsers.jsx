import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../services/api.js";

import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Users, Power, Trash2, LogOut,
  Mail, Key, User, Shield, Loader2, RefreshCcw, Pencil, X,
  Sun, Moon, Eye, EyeOff, CheckCircle, XCircle, Clock, Camera,
  History, ChevronLeft, ChevronRight, Search, Filter,
  Edit3, PlusCircle, AlertTriangle, RefreshCw,
  ChevronDown, ChevronUp,
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

const ENTIDADES = ["MEMBRO", "VISITANTE", "CELULA", "FICHA", "USUARIO", "SECRETARIA"];

const ACOES = {
  CREATE:  { label: "Criação",   icon: PlusCircle,  color: "#059669", bg: "rgba(5,150,105,.12)",  border: "rgba(5,150,105,.25)"  },
  UPDATE:  { label: "Edição",    icon: Edit3,        color: "#F59E0B", bg: "rgba(245,158,11,.12)", border: "rgba(245,158,11,.25)" },
  DELETE:  { label: "Exclusão",  icon: Trash2,       color: "#EF4444", bg: "rgba(239,68,68,.12)",  border: "rgba(239,68,68,.25)"  },
  APPROVE: { label: "Aprovação", icon: CheckCircle,  color: "#10B981", bg: "rgba(16,185,129,.12)", border: "rgba(16,185,129,.25)" },
  REJECT:  { label: "Rejeição",  icon: XCircle,      color: "#F97316", bg: "rgba(249,115,22,.12)", border: "rgba(249,115,22,.25)" },
  VIEW:    { label: "Consulta",  icon: Eye,          color: "#6366F1", bg: "rgba(99,102,241,.12)", border: "rgba(99,102,241,.25)" },
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function AcaoBadge({ acao }) {
  const meta = ACOES[acao] || { label: acao, icon: Shield, color: "#888", bg: "rgba(128,128,128,.1)", border: "rgba(128,128,128,.2)" };
  const Icon = meta.icon;
  return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:99, fontFamily:"'Cinzel',serif", fontSize:8, fontWeight:700, letterSpacing:".14em", border:`1px solid ${meta.border}`, background:meta.bg, color:meta.color, whiteSpace:"nowrap" }}>
      <Icon size={10} /> {meta.label}
    </span>
  );
}

function EntidadeTag({ entidade }) {
  const colors = {
    MEMBRO:     { c: IEQ.blue,      b: "rgba(0,61,165,.15)"   },
    VISITANTE:  { c: IEQ.red,       b: "rgba(200,16,46,.12)"  },
    CELULA:     { c: "#059669",     b: "rgba(5,150,105,.12)"  },
    FICHA:      { c: IEQ.yellow,    b: "rgba(253,184,19,.15)" },
    USUARIO:    { c: "#8B5CF6",     b: "rgba(139,92,246,.12)" },
    SECRETARIA: { c: IEQ.blueLight, b: "rgba(26,86,196,.12)"  },
  };
  const s = colors[entidade] || { c: "#888", b: "rgba(128,128,128,.1)" };
  return (
      <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:4, fontFamily:"'Cinzel',serif", fontSize:8, fontWeight:700, letterSpacing:".12em", border:`1px solid ${s.c}44`, color:s.c, background:s.b }}>
      {entidade}
    </span>
  );
}

function DetalhesDiff({ detalhes }) {
  let parsed = null;
  try { parsed = JSON.parse(detalhes); } catch {
    return <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, fontStyle:"italic", color:"var(--text-sec)" }}>Sem detalhes registrados.</p>;
  }
  if (!parsed || Object.keys(parsed).length === 0)
    return <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, fontStyle:"italic", color:"var(--text-sec)" }}>Sem detalhes registrados.</p>;

  return (
      <div>
        {Object.entries(parsed).map(([campo, val]) => (
            <div key={campo} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"8px 0", borderBottom:"1px solid var(--aud-border)" }}>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".12em", color:"var(--text-sec)", minWidth:110, paddingTop:3 }}>
            {campo.toUpperCase()}
          </span>
              <div style={{ flex:1, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                {val?.de !== undefined && (
                    <>
                <span style={{ background:"rgba(239,68,68,.1)", color:"#EF4444", border:"1px solid rgba(239,68,68,.2)", borderRadius:4, padding:"2px 8px", fontSize:13, textDecoration:"line-through" }}>
                  {String(val.de || "—")}
                </span>
                      <span style={{ color:"var(--text-sec)", fontSize:12 }}>→</span>
                      <span style={{ background:"rgba(5,150,105,.1)", color:"#059669", border:"1px solid rgba(5,150,105,.2)", borderRadius:4, padding:"2px 8px", fontSize:13 }}>
                  {String(val.para ?? "—")}
                </span>
                    </>
                )}
                {val?.para !== undefined && val?.de === undefined && (
                    <span style={{ background:"rgba(5,150,105,.1)", color:"#059669", border:"1px solid rgba(5,150,105,.2)", borderRadius:4, padding:"2px 8px", fontSize:13 }}>
                {String(val.para ?? "—")}
              </span>
                )}
                {typeof val === "string" && (
                    <span style={{ fontSize:13, color:"var(--text)" }}>{val}</span>
                )}
              </div>
            </div>
        ))}
      </div>
  );
}

function AuditoriaRow({ reg, isDark }) {
  const [open, setOpen] = useState(false);
  return (
      <>
        <tr onClick={() => setOpen(o => !o)} style={{ borderBottom:"1px solid var(--aud-border)", cursor:"pointer", transition:"background .15s", background: open ? (isDark ? "rgba(200,16,46,.06)" : "rgba(200,16,46,.03)") : "transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(200,16,46,.06)" : "rgba(200,16,46,.03)"}
            onMouseLeave={e => e.currentTarget.style.background = open ? (isDark ? "rgba(200,16,46,.06)" : "rgba(200,16,46,.03)") : "transparent"}
        >
          <td style={{ padding:"12px 14px", width:28 }}>
            {open ? <ChevronUp size={13} style={{ color:IEQ.red }} /> : <ChevronDown size={13} style={{ color:"var(--text-sec)" }} />}
          </td>
          <td style={{ padding:"12px 8px", whiteSpace:"nowrap" }}>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".1em", color:"var(--text-sec)" }}>
            {formatDate(reg.dataHora)}
          </span>
          </td>
          <td style={{ padding:"12px 8px" }}><EntidadeTag entidade={reg.entidade} /></td>
          <td style={{ padding:"12px 8px", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            <span style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:"var(--text)" }}>{reg.entidadeNome || `#${reg.entidadeId}`}</span>
          </td>
          <td style={{ padding:"12px 8px" }}><AcaoBadge acao={reg.acao} /></td>
          <td style={{ padding:"12px 8px", maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:22, height:22, borderRadius:5, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:9, color:"#fff" }}>{reg.usuarioNome?.charAt(0).toUpperCase()}</span>
              </div>
              <span style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:"var(--text)" }}>{reg.usuarioNome}</span>
            </div>
          </td>
          <td style={{ padding:"12px 8px" }}>
            {reg.aprovadorNome
                ? <div style={{ display:"flex", alignItems:"center", gap:5 }}><CheckCircle size={11} style={{ color:"#059669" }} /><span style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:"#059669" }}>{reg.aprovadorNome}</span></div>
                : <span style={{ fontFamily:"'EB Garamond',serif", fontSize:12, color:"var(--text-sec)", fontStyle:"italic" }}>—</span>
            }
          </td>
        </tr>

        <AnimatePresence>
          {open && (
              <tr>
                <td colSpan={7} style={{ padding:0, background: isDark ? "rgba(200,16,46,.03)" : "rgba(200,16,46,.02)" }}>
                  <motion.div
                      initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
                      transition={{ duration:.18 }} style={{ overflow:"hidden" }}
                  >
                    <div style={{ padding:"14px 22px 18px 46px" }}>
                      <div style={{ display:"flex", gap:28, flexWrap:"wrap", marginBottom:12 }}>
                        <div>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".18em", color:"var(--text-sec)", margin:"0 0 3px" }}>ID DO REGISTRO</p>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:"var(--text)", margin:0 }}>#{reg.entidadeId}</p>
                        </div>
                        {reg.ipOrigem && (
                            <div>
                              <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".18em", color:"var(--text-sec)", margin:"0 0 3px" }}>IP DE ORIGEM</p>
                              <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:"var(--text)", margin:0 }}>{reg.ipOrigem}</p>
                            </div>
                        )}
                        {reg.usuarioEmail && (
                            <div>
                              <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".18em", color:"var(--text-sec)", margin:"0 0 3px" }}>E-MAIL DO OPERADOR</p>
                              <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:"var(--text)", margin:0 }}>{reg.usuarioEmail}</p>
                            </div>
                        )}
                      </div>
                      <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(200,16,46,.2),transparent)", margin:"0 0 10px" }} />
                      <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".2em", color:"var(--text-sec)", margin:"0 0 8px" }}>CAMPOS ALTERADOS</p>
                      <DetalhesDiff detalhes={reg.detalhes} />
                    </div>
                  </motion.div>
                </td>
              </tr>
          )}
        </AnimatePresence>
      </>
  );
}

/* ─── Seção de Auditoria ─────────────────────────────────────────────────── */
function HistoricoAuditoria({ isDark }) {
  const [registros,    setRegistros]    = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [erro,         setErro]         = useState(null);
  const [totalPages,   setTotalPages]   = useState(0);
  const [totalItems,   setTotalItems]   = useState(0);
  const [showFiltros,  setShowFiltros]  = useState(false);
  const [filtros, setFiltros] = useState({ entidade:"", acao:"", usuario:"", entidadeId:"", de:"", ate:"", page:0, size:20 });

  const textSec  = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const cardBg   = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
  const border   = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";
  const inputBg  = isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)";

  const buscar = useCallback(async (f = filtros) => {
    setLoading(true); setErro(null);
    try {
      const params = new URLSearchParams();
      if (f.entidade)   params.set("entidade",   f.entidade);
      if (f.acao)       params.set("acao",        f.acao);
      if (f.usuario)    params.set("usuario",     f.usuario);
      if (f.entidadeId) params.set("entidadeId",  f.entidadeId);
      if (f.de)         params.set("de",          new Date(f.de).toISOString());
      if (f.ate)        params.set("ate",         new Date(f.ate).toISOString());
      params.set("page", f.page); params.set("size", f.size);
      const res = await api.get(`/auditoria?${params}`);
      setRegistros(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalItems(res.data.totalElements || 0);
    } catch { setErro("Não foi possível carregar o histórico."); }
    finally { setLoading(false); }
  }, [filtros]);

  useEffect(() => { buscar(); }, []); // eslint-disable-line

  const setF   = (k, v) => setFiltros(f => ({ ...f, [k]: v, page: 0 }));
  const aplicar = () => buscar({ ...filtros, page: 0 });
  const limpar  = () => { const z = { entidade:"", acao:"", usuario:"", entidadeId:"", de:"", ate:"", page:0, size:20 }; setFiltros(z); buscar(z); };
  const irPara  = (p) => { const f = { ...filtros, page:p }; setFiltros(f); buscar(f); };

  const inputSt = {
    background: inputBg,
    border: `1px solid ${border}`,
    borderRadius: 8, color: isDark ? IEQ.offWhite : "#1A0A0D",
    fontFamily: "'EB Garamond',serif", fontSize: 14,
    padding: "9px 12px", outline: "none", width: "100%",
    transition: "border-color .2s",
  };
  const selectSt = {
    ...inputSt,
    fontFamily: "'Cinzel',serif", fontSize: 9,
    fontWeight: 700, letterSpacing: ".14em",
    cursor: "pointer", appearance: "none",
  };
  const labelSt = {
    fontFamily: "'Cinzel',serif", fontSize: 8,
    letterSpacing: ".18em", color: textSec,
    margin: "0 0 5px", display: "block",
  };

  return (
      <div style={{ "--text": isDark ? IEQ.offWhite : "#1A0A0D", "--text-sec": textSec, "--aud-border": border }}>

        {/* Cabeçalho da seção */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <History size={16} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".16em", color: isDark ? IEQ.offWhite : "#1A0A0D", margin:0 }}>HISTÓRICO DE ALTERAÇÕES</h3>
              <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSec, margin:0 }}>
                {totalItems > 0 ? `${totalItems.toLocaleString("pt-BR")} registro${totalItems !== 1 ? "s" : ""}` : "Rastreabilidade do sistema"}
              </p>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button
                onClick={() => setShowFiltros(s => !s)}
                style={{ display:"flex", alignItems:"center", gap:6, background: isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)", color: isDark ? IEQ.offWhite : IEQ.redDark, border:`1px solid ${border}`, borderRadius:8, fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".15em", cursor:"pointer", padding:"9px 14px", transition:"all .2s" }}
            >
              <Filter size={13} /> {showFiltros ? "OCULTAR" : "FILTROS"}
            </button>
            <button
                onClick={() => buscar()}
                style={{ display:"flex", alignItems:"center", gap:6, background: isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)", color: isDark ? IEQ.offWhite : IEQ.redDark, border:`1px solid ${border}`, borderRadius:8, fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".15em", cursor:"pointer", padding:"9px 14px", transition:"all .2s" }}
            >
              <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> ATUALIZAR
            </button>
          </div>
        </div>

        {/* Filtros */}
        <AnimatePresence>
          {showFiltros && (
              <motion.div
                  initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
                  transition={{ duration:.2 }} style={{ overflow:"hidden", marginBottom:16 }}
              >
                <div style={{ background: isDark ? "rgba(255,255,255,.02)" : "rgba(200,16,46,.03)", border:`1px solid ${border}`, borderRadius:12, padding:"18px 20px" }}>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".22em", color:textSec, margin:"0 0 14px" }}>FILTROS DE PESQUISA</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
                    <div>
                      <label style={labelSt}>ENTIDADE</label>
                      <select style={selectSt} value={filtros.entidade} onChange={e => setF("entidade", e.target.value)}>
                        <option value="">Todas</option>
                        {ENTIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelSt}>AÇÃO</label>
                      <select style={selectSt} value={filtros.acao} onChange={e => setF("acao", e.target.value)}>
                        <option value="">Todas</option>
                        {Object.entries(ACOES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelSt}>OPERADOR</label>
                      <input style={inputSt} placeholder="Nome do usuário..." value={filtros.usuario} onChange={e => setF("usuario", e.target.value)} />
                    </div>
                    <div>
                      <label style={labelSt}>ID DO REGISTRO</label>
                      <input style={inputSt} placeholder="Ex: 42" type="number" value={filtros.entidadeId} onChange={e => setF("entidadeId", e.target.value)} />
                    </div>
                    <div>
                      <label style={labelSt}>DATA INÍCIO</label>
                      <input style={inputSt} type="datetime-local" value={filtros.de} onChange={e => setF("de", e.target.value)} />
                    </div>
                    <div>
                      <label style={labelSt}>DATA FIM</label>
                      <input style={inputSt} type="datetime-local" value={filtros.ate} onChange={e => setF("ate", e.target.value)} />
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10, marginTop:14, justifyContent:"flex-end" }}>
                    <button onClick={limpar} style={{ display:"flex", alignItems:"center", gap:6, background:"none", color:textSec, border:`1px solid ${border}`, borderRadius:8, fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".14em", cursor:"pointer", padding:"9px 14px" }}>
                      <X size={12} /> LIMPAR
                    </button>
                    <button onClick={aplicar} style={{ display:"flex", alignItems:"center", gap:6, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, color:"#fff", border:"none", borderRadius:8, fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".15em", cursor:"pointer", padding:"9px 18px", boxShadow:"0 4px 14px rgba(200,16,46,.3)" }}>
                      <Search size={12} /> BUSCAR
                    </button>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Paginação info */}
        {totalPages > 1 && (
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".14em", color:textSec }}>
            {totalItems.toLocaleString("pt-BR")} REGISTROS
          </span>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".14em", color:textSec }}>
            PÁGINA {filtros.page + 1} DE {totalPages}
          </span>
            </div>
        )}

        {/* Tabela */}
        <div style={{ border:`1px solid ${border}`, borderRadius:12, overflow:"hidden" }}>
          {loading ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 0", gap:10 }}>
                <Loader2 size={20} style={{ animation:"spin 1s linear infinite", color:IEQ.red }} />
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSec }}>CARREGANDO...</span>
              </div>
          ) : erro ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"48px 0", gap:12 }}>
                <AlertTriangle size={26} style={{ color:IEQ.red }} />
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".14em", color:textSec, textAlign:"center" }}>{erro}</p>
                <button onClick={() => buscar()} style={{ display:"flex", alignItems:"center", gap:6, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, color:"#fff", border:"none", borderRadius:8, fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".14em", cursor:"pointer", padding:"9px 16px" }}>
                  <RefreshCw size={12} /> TENTAR NOVAMENTE
                </button>
              </div>
          ) : registros.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"48px 0", gap:10 }}>
                <History size={30} style={{ color:textSec, opacity:.4 }} />
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSec }}>NENHUM REGISTRO ENCONTRADO</p>
              </div>
          ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                  <tr style={{ borderBottom:`2px solid ${border}`, background: isDark ? "rgba(255,255,255,.02)" : "rgba(200,16,46,.03)" }}>
                    {["", "DATA / HORA", "ENTIDADE", "REGISTRO", "AÇÃO", "OPERADOR", "APROVADOR"].map(h => (
                        <th key={h} style={{ padding:"11px 8px", textAlign:"left", fontFamily:"'Cinzel',serif", fontSize:8, fontWeight:700, letterSpacing:".18em", color:textSec, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                  </thead>
                  <tbody>
                  {registros.map((reg, i) => (
                      <AuditoriaRow key={reg.id ?? i} reg={reg} isDark={isDark} />
                  ))}
                  </tbody>
                </table>
              </div>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:16 }}>
              <button disabled={filtros.page === 0} onClick={() => irPara(filtros.page - 1)}
                      style={{ width:30, height:30, borderRadius:6, border:`1px solid ${border}`, background: isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.05)", color: isDark ? IEQ.offWhite : "#1A0A0D", display:"flex", alignItems:"center", justifyContent:"center", cursor: filtros.page === 0 ? "not-allowed" : "pointer", opacity: filtros.page === 0 ? .35 : 1, transition:"all .2s" }}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p = i;
                if (totalPages > 7) { const s = Math.max(0, Math.min(filtros.page - 3, totalPages - 7)); p = s + i; }
                const isActive = filtros.page === p;
                return (
                    <button key={p} onClick={() => irPara(p)}
                            style={{ width:30, height:30, borderRadius:6, border: isActive ? "none" : `1px solid ${border}`, background: isActive ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})` : (isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.05)"), color: isActive ? "#fff" : (isDark ? IEQ.offWhite : "#1A0A0D"), fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, cursor:"pointer", transition:"all .2s" }}
                    >
                      {p + 1}
                    </button>
                );
              })}
              <button disabled={filtros.page >= totalPages - 1} onClick={() => irPara(filtros.page + 1)}
                      style={{ width:30, height:30, borderRadius:6, border:`1px solid ${border}`, background: isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.05)", color: isDark ? IEQ.offWhite : "#1A0A0D", display:"flex", alignItems:"center", justifyContent:"center", cursor: filtros.page >= totalPages - 1 ? "not-allowed" : "pointer", opacity: filtros.page >= totalPages - 1 ? .35 : 1, transition:"all .2s" }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
        )}
      </div>
  );
}

/* ─── Componentes auxiliares ─────────────────────────────────────────────── */
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
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.7, pointerEvents:"none", zIndex:1 }}>
          {icon}
        </div>
        <input {...props} type={inputType} onChange={e => onChange(e.target.value)} className="ieq-input-field" style={{ paddingLeft:44, paddingRight: isPassword ? 44 : 16 }} />
        {isPassword && (
            <button type="button" onClick={() => setShowPwd(v => !v)}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:textSecondary, padding:4, display:"flex", alignItems:"center", transition:"color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = IEQ.red}
                    onMouseLeave={e => e.currentTarget.style.color = textSecondary}
                    tabIndex={-1}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        )}
      </div>
  );
}

/* ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────── */
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
  const [form,            setForm]            = useState({ nome:"", email:"", senha:"", perfil:"LIDER_CELULA" });
  const [isDark,          setIsDark]          = useState(() => localStorage.getItem("theme") === "dark");

  // ── nova aba ativa: "usuarios" | "auditoria"
  const [abaAtiva, setAbaAtiva] = useState("usuarios");

  const fotoInputRef     = useRef(null);
  const fotoUsuarioIdRef = useRef(null);

  const bg            = isDark ? IEQ.dark     : "#F0EAE8";
  const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  useEffect(() => { localStorage.setItem("theme", isDark ? "dark" : "light"); }, [isDark]);

  const carregarUsuarios = useCallback(async () => {
    setLoading(true); setErro("");
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
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { carregarUsuarios(); }, [carregarUsuarios]);

  const mostrarSucesso = (msg) => { setSucesso(msg); setTimeout(() => setSucesso(""), 3500); };

  const adicionarUsuario = async (e) => {
    e.preventDefault(); setSending(true); setErro("");
    try {
      await api.post("usuarios", form);
      setForm({ nome:"", email:"", senha:"", perfil:"LIDER_CELULA" });
      carregarUsuarios(); mostrarSucesso("Acesso liberado com sucesso.");
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Falha ao criar novo acesso.");
    } finally { setSending(false); }
  };

  const abrirEdicao = (u) => { setEditandoId(u.id); setForm({ nome:u.nome, email:u.email, senha:"", perfil:u.perfil }); setIsEditModalOpen(true); };

  const salvarEdicao = async (e) => {
    e.preventDefault(); setSending(true);
    try {
      await api.put(`usuarios/${editandoId}`, form);
      setIsEditModalOpen(false); setEditandoId(null);
      setForm({ nome:"", email:"", senha:"", perfil:"LIDER_CELULA" });
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Erro ao atualizar dados.");
    } finally { setSending(false); }
  };

  const deletarUsuario = async (id) => {
    if (!window.confirm("Esta ação removerá permanentemente o acesso. Confirmar?")) return;
    try { await api.delete(`usuarios/${id}`); carregarUsuarios(); }
    catch (err) { if (err.response?.status === 401) { handleLogout(); return; } setErro("Erro ao deletar."); }
  };

  const alternarStatus = async (id) => {
    try { await api.patch(`usuarios/${id}/status`); carregarUsuarios(); }
    catch (err) { if (err.response?.status === 401) { handleLogout(); return; } setErro("Erro ao alterar status."); }
  };

  const aprovarAlteracao = async (id, nome) => {
    if (!window.confirm(`Aprovar a solicitação de alteração de "${nome}"?`)) return;
    setAprovando(id);
    try { await api.patch(`usuarios/${id}/aprovar-alteracao`); mostrarSucesso(`Alteração de ${nome} aprovada.`); carregarUsuarios(); }
    catch (err) { if (err.response?.status === 401) { handleLogout(); return; } setErro("Erro ao aprovar alteração."); }
    finally { setAprovando(null); }
  };

  const rejeitarAlteracao = async (id, nome) => {
    if (!window.confirm(`Rejeitar a solicitação de alteração de "${nome}"?`)) return;
    setAprovando(id);
    try { await api.patch(`usuarios/${id}/rejeitar-alteracao`); mostrarSucesso(`Alteração de ${nome} rejeitada.`); carregarUsuarios(); }
    catch (err) { if (err.response?.status === 401) { handleLogout(); return; } setErro("Erro ao rejeitar alteração."); }
    finally { setAprovando(null); }
  };

  const abrirSeletorFoto = (id) => { fotoUsuarioIdRef.current = id; fotoInputRef.current.click(); };

  const handleFotoSelecionada = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErro("Selecione um arquivo de imagem válido."); return; }
    if (file.size > 2 * 1024 * 1024)    { setErro("A imagem deve ter no máximo 2 MB."); return; }
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
      mostrarSucesso("Foto atualizada com sucesso."); carregarUsuarios();
    } catch (err) { if (err.response?.status === 401) { handleLogout(); return; } setErro("Erro ao enviar a foto."); }
    finally { setUploadandoFoto(null); e.target.value = ""; }
  };

  const removerFoto = async (id, nome) => {
    if (!window.confirm(`Remover a foto de perfil de "${nome}"?`)) return;
    setUploadandoFoto(id);
    try { await api.patch(`usuarios/${id}/foto`, { fotoBase64: null }); mostrarSucesso("Foto removida."); carregarUsuarios(); }
    catch (err) { if (err.response?.status === 401) { handleLogout(); return; } setErro("Erro ao remover a foto."); }
    finally { setUploadandoFoto(null); }
  };

  const ativos       = usuarios.filter(u => u.ativo).length;
  const suspensos    = usuarios.filter(u => !u.ativo).length;
  const qtdPendentes = pendentes.size;

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing: border-box; }

    @keyframes stripe        { 0%{background-position:0 0} 100%{background-position:60px 60px} }
    @keyframes pulse         { 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.12);opacity:.12} }
    @keyframes spin          { to{transform:rotate(360deg)} }
    @keyframes pendentePulse { 0%,100%{box-shadow:0 0 0 0 rgba(253,184,19,.45)} 50%{box-shadow:0 0 0 5px rgba(253,184,19,0)} }

    .ieq-bg {
      position:fixed; inset:0; pointer-events:none; z-index:0;
      background: repeating-linear-gradient(-55deg,
        ${isDark?"rgba(200,16,46,.04)":"rgba(200,16,46,.06)"} 0 10px,transparent 10px 20px,
        ${isDark?"rgba(253,184,19,.03)":"rgba(253,184,19,.05)"} 20px 30px,transparent 30px 40px);
      background-size:60px 60px; animation:stripe 8s linear infinite;
    }
    .ieq-title {
      font-family:'Cinzel',serif;
      background:linear-gradient(90deg,${IEQ.redDark},${IEQ.red},${IEQ.yellow},${IEQ.blue});
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }
    .ieq-card {
      background:${isDark?"rgba(17,10,13,.97)":"rgba(255,255,255,.92)"};
      border:1px solid ${isDark?"rgba(200,16,46,.15)":"rgba(200,16,46,.12)"};
      border-radius:14px; backdrop-filter:blur(24px);
    }
    .ieq-btn-primary {
      background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red});
      color:#fff; border:none; border-radius:8px;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.18em;
      cursor:pointer; transition:all .25s; padding:13px 24px;
    }
    .ieq-btn-primary:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.12); }
    .ieq-btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .ieq-btn-blue {
      background:linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue});
      color:#fff; border:none; border-radius:8px;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.18em;
      cursor:pointer; transition:all .25s; padding:13px 24px;
    }
    .ieq-btn-blue:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.12); }
    .ieq-btn-blue:disabled { opacity:.5; cursor:not-allowed; }
    .ieq-btn-ghost {
      background:${isDark?"rgba(255,255,255,.04)":"rgba(200,16,46,.06)"};
      color:${isDark?IEQ.offWhite:IEQ.redDark};
      border:1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)"};
      border-radius:8px; font-family:'Cinzel',serif; font-size:10px; font-weight:700;
      letter-spacing:.15em; cursor:pointer; transition:all .25s; padding:11px 20px;
    }
    .ieq-btn-ghost:hover { border-color:${IEQ.red}; background:rgba(200,16,46,.1); }
    .ieq-input-field {
      width:100%;
      background:${isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)"};
      border:1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)"};
      color:${isDark?IEQ.offWhite:"#1A0A0D"};
      padding:13px 16px; border-radius:8px; outline:none;
      font-family:'EB Garamond',serif; font-size:15px; transition:all .25s;
    }
    .ieq-input-field:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-input-field::placeholder { color:${isDark?"rgba(245,240,232,.25)":"rgba(26,10,13,.3)"}; }
    .ieq-select-field {
      width:100%;
      background:${isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)"};
      border:1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)"};
      color:${isDark?IEQ.offWhite:"#1A0A0D"};
      padding:13px 16px 13px 44px; border-radius:8px; outline:none;
      font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.12em;
      transition:all .25s; appearance:none; cursor:pointer;
    }
    .ieq-select-field:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-select-field option { background:${isDark?"#110A0D":"#fff"}; color:${isDark?IEQ.offWhite:"#1A0A0D"}; }
    .ieq-member-row {
      display:flex; flex-direction:column;
      padding:14px 16px;
      background:${isDark?"rgba(255,255,255,.02)":"rgba(200,16,46,.03)"};
      border-bottom:1px solid ${isDark?"rgba(200,16,46,.08)":"rgba(200,16,46,.07)"};
      transition:all .2s; gap:10px;
    }
    .ieq-member-row:hover { background:${isDark?"rgba(200,16,46,.06)":"rgba(200,16,46,.06)"}; }
    .ieq-member-row:last-child { border-bottom:none; }
    .ieq-member-row.tem-pendencia {
      background:${isDark?"rgba(253,184,19,.04)":"rgba(253,184,19,.06)"};
      border-left:3px solid ${IEQ.yellow};
    }
    .ieq-member-row.tem-pendencia:hover { background:${isDark?"rgba(253,184,19,.08)":"rgba(253,184,19,.1)"}; }
    @media(min-width:600px) { .ieq-member-row { flex-direction:row; align-items:center; justify-content:space-between; padding:14px 18px; gap:12px; } }
    .ieq-member-identity { display:flex; align-items:center; gap:12px; min-width:0; flex:1; }
    .ieq-member-actions  { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    @media(min-width:600px) { .ieq-member-actions { flex-wrap:nowrap; flex-shrink:0; } }
    .ieq-avatar { width:44px; height:44px; border-radius:8px; flex-shrink:0; background:linear-gradient(135deg,${IEQ.redDark},${IEQ.blue}); display:flex; align-items:center; justify-content:center; color:#fff; font-family:'Cinzel',serif; font-weight:700; font-size:16px; }
    .ieq-avatar-col { display:flex; flex-direction:column; align-items:center; gap:4px; flex-shrink:0; }
    .ieq-avatar-wrap { position:relative; width:44px; height:44px; flex-shrink:0; cursor:pointer; }
    .ieq-avatar-wrap:hover .ieq-avatar-overlay { opacity:1; }
    .ieq-avatar-overlay { position:absolute; inset:0; border-radius:8px; background:rgba(10,6,8,.55); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s; }
    .ieq-avatar-img { width:100%; height:100%; object-fit:cover; border-radius:8px; display:block; }
    .ieq-foto-btn { display:flex; align-items:center; gap:3px; background:none; border:1px solid ${IEQ.red}; border-radius:4px; color:${IEQ.red}; font-family:'Cinzel',serif; font-size:7px; font-weight:700; letter-spacing:.1em; cursor:pointer; padding:2px 6px; transition:all .2s; white-space:nowrap; }
    .ieq-foto-btn:hover:not(:disabled) { background:rgba(200,16,46,.12); }
    .ieq-foto-btn:disabled { opacity:.4; cursor:not-allowed; }
    .ieq-member-name  { font-family:'Cinzel',serif; font-size:12px; font-weight:700; letter-spacing:.1em; margin:0; overflow-wrap:break-word; word-break:break-word; white-space:normal; line-height:1.35; }
    .ieq-member-email { font-family:'EB Garamond',serif; font-size:13px; margin:0; overflow-wrap:break-word; word-break:break-all; white-space:normal; line-height:1.3; }
    .pulse-ring { position:absolute; border-radius:50%; border:1px solid rgba(200,16,46,.35); animation:pulse 3s ease-in-out infinite; }
    .divider { height:1px; background:linear-gradient(90deg,transparent,${isDark?"rgba(200,16,46,.25)":"rgba(200,16,46,.2)"},transparent); margin:8px 0; }
    .spin-icon { animation:spin 1s linear infinite; }
    .ieq-modal-backdrop { position:fixed; inset:0; z-index:50; display:flex; align-items:flex-end; justify-content:center; }
    @media(min-width:520px) { .ieq-modal-backdrop { align-items:center; padding:12px; } }
    .ieq-modal-box { position:relative; z-index:10; width:100%; max-height:90vh; display:flex; flex-direction:column; border-radius:16px 16px 0 0; overflow:hidden; }
    @media(min-width:520px) { .ieq-modal-box { border-radius:14px; max-height:calc(100vh - 24px); } }
    .ieq-admin-grid { display:grid; grid-template-columns:1fr; gap:24px; }
    @media(min-width:900px) { .ieq-admin-grid { grid-template-columns:380px 1fr; } }
    .ieq-icon-btn { background:none; border:none; cursor:pointer; width:32px; height:32px; border-radius:6px; display:flex; align-items:center; justify-content:center; transition:all .2s; flex-shrink:0; }
    .ieq-icon-btn:disabled { opacity:.4; cursor:not-allowed; }
    .ieq-btn-aprovar { background:none; border:1px solid rgba(18,160,96,.35); border-radius:6px; color:#12A060; font-family:'Cinzel',serif; font-size:8px; font-weight:700; letter-spacing:.12em; cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:5px; padding:5px 10px; white-space:nowrap; flex-shrink:0; }
    .ieq-btn-aprovar:hover:not(:disabled) { background:rgba(18,160,96,.12); border-color:#12A060; }
    .ieq-btn-aprovar:disabled { opacity:.4; cursor:not-allowed; }
    .ieq-btn-rejeitar { background:none; border:1px solid rgba(200,16,46,.35); border-radius:6px; color:${IEQ.red}; font-family:'Cinzel',serif; font-size:8px; font-weight:700; letter-spacing:.12em; cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:5px; padding:5px 10px; white-space:nowrap; flex-shrink:0; }
    .ieq-btn-rejeitar:hover:not(:disabled) { background:rgba(200,16,46,.1); border-color:${IEQ.red}; }
    .ieq-btn-rejeitar:disabled { opacity:.4; cursor:not-allowed; }
    .ieq-perfil-badge { display:inline-flex; align-items:center; padding:4px 10px; border-radius:99px; font-family:'Cinzel',serif; font-size:8px; font-weight:700; letter-spacing:.12em; border:1px solid; white-space:nowrap; }
    .ieq-stat-box { background:${isDark?"rgba(255,255,255,.03)":"rgba(200,16,46,.04)"}; border:1px solid ${isDark?"rgba(200,16,46,.1)":"rgba(200,16,46,.08)"}; border-radius:10px; padding:14px 16px; display:flex; align-items:center; gap:12px; }
    .ieq-pendentes-banner { display:flex; align-items:center; gap:10px; padding:10px 18px; background:${isDark?"rgba(253,184,19,.08)":"rgba(253,184,19,.12)"}; border-bottom:1px solid rgba(253,184,19,.25); }

    /* Abas */
    .ieq-tab { display:flex; align-items:center; gap:8px; padding:12px 20px; border:none; background:transparent; cursor:pointer; font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.16em; border-bottom:2px solid transparent; transition:all .2s; color:var(--tab-idle); }
    .ieq-tab:hover { color:${IEQ.red}; }
    .ieq-tab.active { color:${IEQ.red}; border-bottom-color:${IEQ.red}; }
  `;

  if (loading && usuarios.length === 0) return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:bg }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');`}</style>
        <div style={{ textAlign:"center" }}>
          <QuadrangularCross size={48} />
          <p style={{ fontFamily:"'Cinzel',serif", color: isDark ? IEQ.offWhite : IEQ.redDark, marginTop:16, letterSpacing:".2em", fontSize:11 }}>CARREGANDO...</p>
        </div>
      </div>
  );

  const tabIdleColor = isDark ? "rgba(245,240,232,.35)" : "rgba(26,10,13,.35)";

  return (
      <div style={{ minHeight:"100vh", background:bg, color:textPrimary, fontFamily:"'EB Garamond',serif", position:"relative", transition:"background .5s", paddingBottom:80, "--tab-idle": tabIdleColor }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg" />

        <div style={{ position:"relative", zIndex:10, maxWidth:1200, margin:"0 auto", padding:"24px 16px 0" }}>

          {/* HEADER */}
          <motion.header initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
                         style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:14 }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                <div className="pulse-ring" style={{ width:68, height:68 }} />
                <div style={{ width:48, height:48, borderRadius:"50%", background: isDark ? "#1A0A0D" : "#fff", border:"1px solid rgba(200,16,46,.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
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
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
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
                    <p style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(20px,5vw,28px)", fontWeight:700, color: label==="PENDENTES" && value > 0 ? IEQ.yellowDark : textPrimary, margin:0, lineHeight:1.1 }}>
                      {loading ? "…" : value}
                    </p>
                  </div>
                </div>
            ))}
          </motion.div>

          {/* ── ABAS ─────────────────────────────────────────────────────── */}
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.18 }}>
            <div className="ieq-card" style={{ overflow:"hidden", marginBottom:24 }}>

              {/* Tab bar */}
              <div style={{ display:"flex", borderBottom:`1px solid ${isDark?"rgba(200,16,46,.12)":"rgba(200,16,46,.1)"}` }}>
                <button className={`ieq-tab${abaAtiva==="usuarios" ? " active" : ""}`} onClick={() => setAbaAtiva("usuarios")}>
                  <Users size={14} /> USUÁRIOS
                </button>
                <button className={`ieq-tab${abaAtiva==="auditoria" ? " active" : ""}`} onClick={() => setAbaAtiva("auditoria")}>
                  <History size={14} /> HISTÓRICO DE ALTERAÇÕES
                </button>
              </div>

              {/* ── ABA USUÁRIOS ── */}
              <AnimatePresence mode="wait">
                {abaAtiva === "usuarios" && (
                    <motion.div key="usuarios" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:.15 }}>
                      <div className="ieq-admin-grid" style={{ padding:20 }}>

                        {/* FORMULÁRIO */}
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
                            <InputIEQ icon={<User size={15}/>}  type="text"     placeholder="Nome do usuário"      value={form.nome}  onChange={v => setForm({...form,nome:v})}  isDark={isDark} />
                            <InputIEQ icon={<Mail size={15}/>}  type="email"    placeholder="E-mail institucional" value={form.email} onChange={v => setForm({...form,email:v})} isDark={isDark} />
                            <InputIEQ icon={<Key size={15}/>}   type="password" placeholder="Senha de acesso"      value={form.senha} onChange={v => setForm({...form,senha:v})} isDark={isDark} />
                            <div style={{ position:"relative" }}>
                              <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.7, pointerEvents:"none" }}><Shield size={15}/></div>
                              <select className="ieq-select-field" value={form.perfil} onChange={e => setForm({...form,perfil:e.target.value})}>
                                {perfis.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
                              </select>
                            </div>
                            <button type="submit" disabled={sending} className="ieq-btn-primary" style={{ marginTop:4, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                              {sending ? <Loader2 size={15} className="spin-icon"/> : <><UserPlus size={14}/> LIBERAR ACESSO</>}
                            </button>
                          </form>
                        </div>

                        {/* LISTAGEM */}
                        <div className="ieq-card" style={{ overflow:"hidden" }}>
                          <div style={{ padding:"18px 20px", borderBottom:`1px solid ${isDark?"rgba(200,16,46,.12)":"rgba(200,16,46,.1)"}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                              <div style={{ width:36, height:36, borderRadius:8, background:`linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                                <Users size={15}/>
                              </div>
                              <div>
                                <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>BASE DE USUÁRIOS</h3>
                                <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSecondary, margin:0 }}>{usuarios.length} registros</p>
                              </div>
                            </div>
                            <button className="ieq-btn-ghost" style={{ padding:"8px 12px", display:"flex", alignItems:"center", gap:6 }} onClick={carregarUsuarios}>
                              <RefreshCcw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }}/> ATUALIZAR
                            </button>
                          </div>

                          <AnimatePresence>
                            {qtdPendentes > 0 && (
                                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} className="ieq-pendentes-banner">
                                  <Clock size={14} style={{ color:IEQ.yellowDark, flexShrink:0 }}/>
                                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".14em", color:IEQ.yellowDark }}>
                              {qtdPendentes} SOLICITAÇÃO{qtdPendentes > 1 ? "ÕES" : ""} DE ALTERAÇÃO AGUARDANDO APROVAÇÃO
                            </span>
                                </motion.div>
                            )}
                          </AnimatePresence>

                          <div style={{ minHeight:120 }}>
                            <AnimatePresence>
                              {usuarios.map((u, i) => {
                                const temPendencia  = pendentes.has(u.id);
                                const estaAprovando = aprovando === u.id;
                                const enviandoFoto  = uploadandoFoto === u.id;
                                return (
                                    <motion.div key={u.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-20 }} transition={{ delay: i * 0.04 }}
                                                className={`ieq-member-row${temPendencia ? " tem-pendencia" : ""}`}
                                    >
                                      <div className="ieq-member-identity">
                                        <div className="ieq-avatar-col">
                                          <div className="ieq-avatar-wrap" onClick={() => abrirSeletorFoto(u.id)} title="Clique para alterar a foto">
                                            {u.fotoPerfil ? (
                                                <img src={u.fotoPerfil} alt={u.nome} className="ieq-avatar-img" style={{ border: temPendencia ? `2px solid ${IEQ.yellow}` : "none", animation: temPendencia ? "pendentePulse 2s ease-in-out infinite" : "none", opacity: u.ativo ? 1 : 0.45 }} />
                                            ) : (
                                                <div className={["ieq-avatar", u.ativo ? "" : "ieq-avatar-inactive", temPendencia ? "ieq-avatar-pendente" : ""].join(" ").trim()} style={u.ativo ? {} : { background: isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)" }}>
                                                  {u.nome?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="ieq-avatar-overlay">
                                              {enviandoFoto ? <Loader2 size={14} color="#fff" style={{ animation:"spin 1s linear infinite" }}/> : <Camera size={14} color="#fff"/>}
                                            </div>
                                          </div>
                                          <button className="ieq-foto-btn" onClick={() => u.fotoPerfil ? removerFoto(u.id, u.nome) : abrirSeletorFoto(u.id)} disabled={enviandoFoto} title={u.fotoPerfil ? "Remover foto" : "Adicionar foto"}>
                                            {enviandoFoto ? <Loader2 size={9} style={{ animation:"spin 1s linear infinite" }}/> : <Camera size={9}/>}
                                            {enviandoFoto ? "..." : u.fotoPerfil ? "REMOVER" : "FOTO"}
                                          </button>
                                        </div>
                                        <div style={{ minWidth:0, flex:1 }}>
                                          <p className="ieq-member-name" style={{ color:textPrimary }}>{u.nome}</p>
                                          <p className="ieq-member-email" style={{ color:textSecondary }}>{u.email}</p>
                                        </div>
                                      </div>

                                      <div className="ieq-member-actions">
                                        <span className="ieq-perfil-badge" style={{ color:IEQ.blue, borderColor:`${IEQ.blue}30`, background:`${IEQ.blue}10` }}>{u.perfil?.replace(/_/g," ")}</span>
                                        <span className="ieq-perfil-badge" style={{ color: u.ativo ? "#12A060" : textSecondary, borderColor: u.ativo ? "#12A06030" : (isDark?"rgba(255,255,255,.1)":"rgba(0,0,0,.1)"), background: u.ativo ? "#12A06010" : (isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)"), display:"flex", alignItems:"center", gap:5 }}>
                                    <span style={{ width:6, height:6, borderRadius:"50%", display:"inline-block", flexShrink:0, background: u.ativo ? "#12A060" : (isDark?"rgba(255,255,255,.2)":"rgba(0,0,0,.2)"), animation: u.ativo ? "pulse 2s ease-in-out infinite" : "none" }}/>
                                          {u.ativo ? "ATIVO" : "SUSPENSO"}
                                  </span>

                                        <AnimatePresence>
                                          {temPendencia && (
                                              <motion.div initial={{ opacity:0, scale:.85 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.85 }} style={{ display:"flex", gap:6, alignItems:"center" }}>
                                                <button className="ieq-btn-aprovar" onClick={() => aprovarAlteracao(u.id, u.nome)} disabled={estaAprovando}>
                                                  {estaAprovando ? <Loader2 size={12} className="spin-icon"/> : <CheckCircle size={12}/>} APROVAR
                                                </button>
                                                <button className="ieq-btn-rejeitar" onClick={() => rejeitarAlteracao(u.id, u.nome)} disabled={estaAprovando}>
                                                  {estaAprovando ? <Loader2 size={12} className="spin-icon"/> : <XCircle size={12}/>} REJEITAR
                                                </button>
                                              </motion.div>
                                          )}
                                        </AnimatePresence>

                                        <button className="ieq-icon-btn" title="Editar" onClick={() => abrirEdicao(u)} style={{ color:textSecondary }}
                                                onMouseEnter={e => { e.currentTarget.style.color=IEQ.blue; e.currentTarget.style.background=`${IEQ.blue}12`; }}
                                                onMouseLeave={e => { e.currentTarget.style.color=textSecondary; e.currentTarget.style.background="none"; }}>
                                          <Pencil size={15}/>
                                        </button>
                                        <button className="ieq-icon-btn" title="Alternar status" onClick={() => alternarStatus(u.id)} style={{ color: u.ativo ? IEQ.yellowDark : "#12A060" }}
                                                onMouseEnter={e => e.currentTarget.style.background = u.ativo ? "rgba(253,184,19,.12)" : "rgba(18,160,96,.12)"}
                                                onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                          <Power size={15}/>
                                        </button>
                                        <button className="ieq-icon-btn" title="Excluir" onClick={() => deletarUsuario(u.id)} style={{ color:textSecondary }}
                                                onMouseEnter={e => { e.currentTarget.style.color=IEQ.red; e.currentTarget.style.background="rgba(200,16,46,.1)"; }}
                                                onMouseLeave={e => { e.currentTarget.style.color=textSecondary; e.currentTarget.style.background="none"; }}>
                                          <Trash2 size={15}/>
                                        </button>
                                      </div>
                                    </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                )}

                {/* ── ABA AUDITORIA ── */}
                {abaAtiva === "auditoria" && (
                    <motion.div key="auditoria" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:.15 }}>
                      <div style={{ padding:20 }}>
                        <HistoricoAuditoria isDark={isDark} />
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <p style={{ textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSecondary, padding:"8px 0 0" }}>
            © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
          </p>
        </div>

        {/* input foto oculto */}
        <input ref={fotoInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFotoSelecionada} />

        {/* MODAL DE EDIÇÃO */}
        <AnimatePresence>
          {isEditModalOpen && (
              <div className="ieq-modal-backdrop">
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            style={{ position:"fixed", inset:0, background:"rgba(10,6,8,.85)", backdropFilter:"blur(16px)", zIndex:0 }}
                />
                <motion.div initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }}
                            className="ieq-card ieq-modal-box" style={{ maxWidth:440 }}
                >
                  <div style={{ padding:"24px 20px", overflowY:"auto", flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <QuadrangularCross size={26}/>
                        <div>
                          <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, letterSpacing:".15em", color:textPrimary, margin:0 }}>EDITAR USUÁRIO</h2>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:12, color:textSecondary, margin:0 }}>ID: {editandoId}</p>
                        </div>
                      </div>
                      <button onClick={() => setIsEditModalOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", color:textSecondary, padding:6, borderRadius:6 }}
                              onMouseEnter={e => e.currentTarget.style.color=IEQ.red}
                              onMouseLeave={e => e.currentTarget.style.color=textSecondary}>
                        <X size={20}/>
                      </button>
                    </div>
                    <div className="divider" style={{ marginBottom:16 }}/>
                    <form onSubmit={salvarEdicao} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      <InputIEQ icon={<User size={15}/>}  type="text"     placeholder="Nome"                        value={form.nome}  onChange={v => setForm({...form,nome:v})}  isDark={isDark}/>
                      <InputIEQ icon={<Mail size={15}/>}  type="email"    placeholder="E-mail"                      value={form.email} onChange={v => setForm({...form,email:v})} isDark={isDark}/>
                      <InputIEQ icon={<Key size={15}/>}   type="password" placeholder="Nova senha (vazio = manter)" value={form.senha} onChange={v => setForm({...form,senha:v})} isDark={isDark}/>
                      <div style={{ position:"relative" }}>
                        <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.7, pointerEvents:"none" }}><Shield size={15}/></div>
                        <select className="ieq-select-field" value={form.perfil} onChange={e => setForm({...form,perfil:e.target.value})}>
                          {perfis.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
                        </select>
                      </div>
                      <div style={{ display:"flex", gap:10, marginTop:6 }}>
                        <button type="button" className="ieq-btn-ghost" style={{ flex:1 }} onClick={() => setIsEditModalOpen(false)}>CANCELAR</button>
                        <button type="submit" className="ieq-btn-blue" style={{ flex:2, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }} disabled={sending}>
                          {sending ? <Loader2 size={15} className="spin-icon"/> : "SALVAR ALTERAÇÕES"}
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
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
                          style={{ position:"fixed", bottom:72, left:"50%", transform:"translateX(-50%)", background:"#12A060", color:"#fff", padding:"14px 20px", borderRadius:10, fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".15em", display:"flex", alignItems:"center", gap:12, zIndex:200, maxWidth:"90vw", boxShadow:"0 8px 32px rgba(18,160,96,.35)" }}
              >
                <CheckCircle size={14}/> <span>{sucesso}</span>
              </motion.div>
          )}
        </AnimatePresence>

        {/* TOAST ERRO */}
        <AnimatePresence>
          {erro && (
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
                          style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background:IEQ.red, color:"#fff", padding:"14px 20px", borderRadius:10, fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".15em", display:"flex", alignItems:"center", gap:12, zIndex:200, maxWidth:"90vw", boxShadow:"0 8px 32px rgba(200,16,46,.35)" }}
              >
                <Power size={14}/>
                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{erro}</span>
                <button onClick={() => setErro("")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.7)", padding:0, marginLeft:4, display:"flex" }}><X size={15}/></button>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
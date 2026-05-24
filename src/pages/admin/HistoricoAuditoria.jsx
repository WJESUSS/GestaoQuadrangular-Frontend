import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Filter, ChevronLeft, ChevronRight, X,
    Shield, Clock, User, Edit3, Trash2, CheckCircle,
    XCircle, PlusCircle, Eye, ChevronDown, ChevronUp,
    AlertTriangle, RefreshCw,
} from "lucide-react";
import api from "../../services/api.js";

/* ─── Paleta IEQ ─────────────────────────────────────────────────────────── */
const IEQ = {
    red: "#C8102E", redDark: "#8B0B1F",
    yellow: "#FDB813", blue: "#003DA5", blueLight: "#1A56C4",
    offWhite: "#F5F0E8", dark: "#0A0608",
};

/* ─── Metadados das ações ─────────────────────────────────────────────────── */
const ACOES = {
    CREATE:  { label: "Criação",    icon: PlusCircle,   color: "#059669", bg: "rgba(5,150,105,.12)",  border: "rgba(5,150,105,.25)"  },
    UPDATE:  { label: "Edição",     icon: Edit3,        color: "#F59E0B", bg: "rgba(245,158,11,.12)", border: "rgba(245,158,11,.25)" },
    DELETE:  { label: "Exclusão",   icon: Trash2,       color: "#EF4444", bg: "rgba(239,68,68,.12)",  border: "rgba(239,68,68,.25)"  },
    APPROVE: { label: "Aprovação",  icon: CheckCircle,  color: "#10B981", bg: "rgba(16,185,129,.12)", border: "rgba(16,185,129,.25)" },
    REJECT:  { label: "Rejeição",   icon: XCircle,      color: "#F97316", bg: "rgba(249,115,22,.12)", border: "rgba(249,115,22,.25)" },
    VIEW:    { label: "Consulta",   icon: Eye,          color: "#6366F1", bg: "rgba(99,102,241,.12)", border: "rgba(99,102,241,.25)" },
};

const ENTIDADES = ["MEMBRO", "VISITANTE", "CELULA", "FICHA", "USUARIO", "SECRETARIA"];

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const CSS = `
  .aud-root {
    --bg:      #F0EAE8; --text: #1A0A0D; --text-sec: rgba(26,10,13,.45);
    --card:    rgba(255,255,255,.92); --border: rgba(200,16,46,.12);
    --input:   rgba(255,255,255,.8);  --input-border: rgba(200,16,46,.2);
    --stripe-a: rgba(200,16,46,.05); --stripe-b: rgba(253,184,19,.04);
  }
  .aud-root.dark {
    --bg:      #0A0608; --text: #F5F0E8; --text-sec: rgba(245,240,232,.45);
    --card:    rgba(17,10,13,.97);    --border: rgba(200,16,46,.15);
    --input:   rgba(255,255,255,.04); --input-border: rgba(200,16,46,.2);
    --stripe-a: rgba(200,16,46,.04); --stripe-b: rgba(253,184,19,.03);
  }

  @keyframes stripe { 0%{background-position:0 0} 100%{background-position:60px 60px} }
  @keyframes spin   { to { transform: rotate(360deg); } }

  .aud-bg {
    position:fixed; inset:0; pointer-events:none; z-index:0;
    background: repeating-linear-gradient(-55deg,
      var(--stripe-a) 0 10px, transparent 10px 20px,
      var(--stripe-b) 20px 30px, transparent 30px 40px);
    background-size:60px 60px; animation:stripe 8s linear infinite;
  }

  .aud-card {
    background:var(--card); border:1px solid var(--border);
    border-radius:14px; backdrop-filter:blur(24px);
    transition: background .3s, border-color .3s;
  }

  .aud-input {
    background:var(--input); border:1px solid var(--input-border);
    border-radius:8px; color:var(--text); font-family:'EB Garamond',serif;
    font-size:14px; padding:9px 12px; outline:none; width:100%;
    transition:border-color .2s;
  }
  .aud-input:focus { border-color:#C8102E; }
  .aud-input::placeholder { color:var(--text-sec); font-style:italic; }

  .aud-select {
    background:var(--input); border:1px solid var(--input-border);
    border-radius:8px; color:var(--text); font-family:'Cinzel',serif;
    font-size:9px; font-weight:700; letter-spacing:.14em;
    padding:9px 12px; outline:none; cursor:pointer;
    transition:border-color .2s; appearance:none;
  }
  .aud-select:focus { border-color:#C8102E; }

  .aud-btn {
    border:none; border-radius:8px; cursor:pointer; font-family:'Cinzel',serif;
    font-size:9px; font-weight:700; letter-spacing:.15em;
    padding:10px 18px; transition:all .2s; display:inline-flex;
    align-items:center; gap:7px;
  }
  .aud-btn-primary {
    background:linear-gradient(135deg,#8B0B1F,#C8102E);
    color:#fff; box-shadow:0 4px 14px rgba(200,16,46,.3);
  }
  .aud-btn-primary:hover { box-shadow:0 6px 20px rgba(200,16,46,.45); transform:translateY(-1px); }
  .aud-btn-ghost {
    background:rgba(200,16,46,.06); color:var(--text);
    border:1px solid rgba(200,16,46,.18);
  }
  .aud-btn-ghost:hover { border-color:#C8102E; background:rgba(200,16,46,.1); }

  .aud-row {
    border-bottom:1px solid var(--border); transition:background .15s;
    cursor:pointer;
  }
  .aud-row:hover { background:rgba(200,16,46,.03); }
  .aud-root.dark .aud-row:hover { background:rgba(200,16,46,.06); }

  .aud-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:4px 10px; border-radius:99px;
    font-family:'Cinzel',serif; font-size:8px; font-weight:700;
    letter-spacing:.14em; border:1px solid; white-space:nowrap;
  }

  .aud-tag {
    display:inline-flex; align-items:center;
    padding:2px 8px; border-radius:4px;
    font-family:'Cinzel',serif; font-size:8px; font-weight:700;
    letter-spacing:.12em; border:1px solid;
  }

  .aud-detail-row {
    display:flex; align-items:flex-start; gap:8px;
    padding:8px 0; border-bottom:1px solid var(--border);
    font-family:'EB Garamond',serif; font-size:14px;
  }
  .aud-detail-row:last-child { border-bottom:none; }

  .divider { height:1px; background:linear-gradient(90deg,transparent,rgba(200,16,46,.2),transparent); }

  .spin { animation:spin .8s linear infinite; }

  .page-btn {
    width:32px; height:32px; border-radius:6px; border:1px solid var(--border);
    background:var(--card); color:var(--text); display:flex; align-items:center;
    justify-content:center; cursor:pointer; font-family:'Cinzel',serif;
    font-size:10px; font-weight:700; transition:all .2s;
  }
  .page-btn:hover { border-color:#C8102E; color:#C8102E; }
  .page-btn.active { background:linear-gradient(135deg,#8B0B1F,#C8102E); color:#fff; border-color:transparent; }
  .page-btn:disabled { opacity:.35; cursor:not-allowed; }
`;

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
        <span className="aud-badge" style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
      <Icon size={10} /> {meta.label}
    </span>
    );
}

function EntidadeTag({ entidade }) {
    const colors = {
        MEMBRO:     { c: IEQ.blue,     b: "rgba(0,61,165,.15)"   },
        VISITANTE:  { c: IEQ.red,      b: "rgba(200,16,46,.12)"  },
        CELULA:     { c: "#059669",    b: "rgba(5,150,105,.12)"  },
        FICHA:      { c: IEQ.yellow,   b: "rgba(253,184,19,.15)" },
        USUARIO:    { c: "#8B5CF6",    b: "rgba(139,92,246,.12)" },
        SECRETARIA: { c: IEQ.blueLight,b: "rgba(26,86,196,.12)"  },
    };
    const s = colors[entidade] || { c: "#888", b: "rgba(128,128,128,.1)" };
    return (
        <span className="aud-tag" style={{ color: s.c, background: s.b, borderColor: s.c + "44" }}>
      {entidade}
    </span>
    );
}

/* ─── Painel de detalhes (diff de campos) ───────────────────────────────── */
function DetalhesDiff({ detalhes }) {
    let parsed = null;
    try { parsed = JSON.parse(detalhes); } catch { return <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, fontStyle: "italic", color: "var(--text-sec)" }}>Sem detalhes registrados.</p>; }
    if (!parsed || Object.keys(parsed).length === 0)
        return <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, fontStyle: "italic", color: "var(--text-sec)" }}>Sem detalhes registrados.</p>;

    return (
        <div>
            {Object.entries(parsed).map(([campo, val]) => (
                <div key={campo} className="aud-detail-row">
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "var(--text-sec)", minWidth: 110, paddingTop: 3 }}>
            {campo.toUpperCase()}
          </span>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        {val?.de !== undefined && (
                            <>
                <span style={{ background: "rgba(239,68,68,.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,.2)", borderRadius: 4, padding: "2px 8px", fontSize: 13, textDecoration: "line-through" }}>
                  {String(val.de || "—")}
                </span>
                                <span style={{ color: "var(--text-sec)", fontSize: 12 }}>→</span>
                                <span style={{ background: "rgba(5,150,105,.1)", color: "#059669", border: "1px solid rgba(5,150,105,.2)", borderRadius: 4, padding: "2px 8px", fontSize: 13 }}>
                  {String(val.para ?? "—")}
                </span>
                            </>
                        )}
                        {val?.para !== undefined && val?.de === undefined && (
                            <span style={{ background: "rgba(5,150,105,.1)", color: "#059669", border: "1px solid rgba(5,150,105,.2)", borderRadius: 4, padding: "2px 8px", fontSize: 13 }}>
                {String(val.para ?? "—")}
              </span>
                        )}
                        {typeof val === "string" && (
                            <span style={{ fontSize: 13, color: "var(--text)" }}>{val}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Linha expansível ───────────────────────────────────────────────────── */
function AuditoriaRow({ reg, isDark }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <tr className="aud-row" onClick={() => setOpen(o => !o)}>
                <td style={{ padding: "13px 16px", width: 32 }}>
                    {open ? <ChevronUp size={14} style={{ color: IEQ.red }} /> : <ChevronDown size={14} style={{ color: "var(--text-sec)" }} />}
                </td>
                <td style={{ padding: "13px 8px", whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".1em", color: "var(--text-sec)" }}>
            {formatDate(reg.dataHora)}
          </span>
                </td>
                <td style={{ padding: "13px 8px" }}>
                    <EntidadeTag entidade={reg.entidade} />
                </td>
                <td style={{ padding: "13px 8px", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: "var(--text)" }}>
            {reg.entidadeNome || `#${reg.entidadeId}`}
          </span>
                </td>
                <td style={{ padding: "13px 8px" }}>
                    <AcaoBadge acao={reg.acao} />
                </td>
                <td style={{ padding: "13px 8px", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#8B0B1F,#003DA5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 9, color: "#fff" }}>
                {reg.usuarioNome?.charAt(0).toUpperCase()}
              </span>
                        </div>
                        <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: "var(--text)" }}>
              {reg.usuarioNome}
            </span>
                    </div>
                </td>
                <td style={{ padding: "13px 8px" }}>
                    {reg.aprovadorNome ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <CheckCircle size={12} style={{ color: "#059669" }} />
                            <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: "#059669" }}>{reg.aprovadorNome}</span>
                        </div>
                    ) : (
                        <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: "var(--text-sec)", fontStyle: "italic" }}>—</span>
                    )}
                </td>
            </tr>

            <AnimatePresence>
                {open && (
                    <tr>
                        <td colSpan={7} style={{ padding: 0, background: isDark ? "rgba(200,16,46,.03)" : "rgba(200,16,46,.02)" }}>
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: .2 }}
                                style={{ overflow: "hidden" }}
                            >
                                <div style={{ padding: "16px 24px 20px 52px" }}>
                                    <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 14 }}>
                                        <div>
                                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".18em", color: "var(--text-sec)", margin: "0 0 3px" }}>ID DO REGISTRO</p>
                                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: "var(--text)", margin: 0 }}>#{reg.entidadeId}</p>
                                        </div>
                                        {reg.ipOrigem && (
                                            <div>
                                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".18em", color: "var(--text-sec)", margin: "0 0 3px" }}>IP DE ORIGEM</p>
                                                <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: "var(--text)", margin: 0 }}>{reg.ipOrigem}</p>
                                            </div>
                                        )}
                                        {reg.usuarioEmail && (
                                            <div>
                                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".18em", color: "var(--text-sec)", margin: "0 0 3px" }}>E-MAIL DO OPERADOR</p>
                                                <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: "var(--text)", margin: 0 }}>{reg.usuarioEmail}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="divider" style={{ marginBottom: 12 }} />
                                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".2em", color: "var(--text-sec)", margin: "0 0 10px" }}>CAMPOS ALTERADOS</p>
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

/* ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────── */
export default function HistoricoAuditoria({ isDark }) {
    const [registros,   setRegistros]   = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [erro,        setErro]        = useState(null);
    const [totalPages,  setTotalPages]  = useState(0);
    const [totalItems,  setTotalItems]  = useState(0);
    const [showFiltros, setShowFiltros] = useState(false);

    const [filtros, setFiltros] = useState({
        entidade:   "",
        acao:       "",
        usuario:    "",
        entidadeId: "",
        de:         "",
        ate:        "",
        page:       0,
        size:       20,
    });

    const buscar = useCallback(async (f = filtros) => {
        setLoading(true);
        setErro(null);
        try {
            const params = new URLSearchParams();
            if (f.entidade)   params.set("entidade",   f.entidade);
            if (f.acao)       params.set("acao",        f.acao);
            if (f.usuario)    params.set("usuario",     f.usuario);
            if (f.entidadeId) params.set("entidadeId",  f.entidadeId);
            if (f.de)         params.set("de",          new Date(f.de).toISOString());
            if (f.ate)        params.set("ate",          new Date(f.ate).toISOString());
            params.set("page", f.page);
            params.set("size", f.size);

            const res = await api.get(`/auditoria?${params}`);
            setRegistros(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setTotalItems(res.data.totalElements || 0);
        } catch (e) {
            setErro("Não foi possível carregar o histórico. Verifique a conexão.");
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    useEffect(() => { buscar(); }, []); // eslint-disable-line

    const setFiltro = (key, val) => setFiltros(f => ({ ...f, [key]: val, page: 0 }));

    const aplicar = () => buscar({ ...filtros, page: 0 });
    const limpar  = () => {
        const z = { entidade:"", acao:"", usuario:"", entidadeId:"", de:"", ate:"", page:0, size:20 };
        setFiltros(z);
        buscar(z);
    };
    const irPara  = (p) => { const f = { ...filtros, page: p }; setFiltros(f); buscar(f); };

    const inputStyle = { fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".14em", color: "var(--text-sec)", margin: "0 0 5px", display: "block" };

    return (
        <div className={`aud-root${isDark ? " dark" : ""}`} style={{ minHeight: "100%", padding: "28px 24px", fontFamily: "'EB Garamond',serif", color: "var(--text)", position: "relative" }}>
            <style>{CSS}</style>
            <div className="aud-bg" />

            <div style={{ position: "relative", zIndex: 1 }}>

                {/* ─── Cabeçalho ─────────────────────────────────────────────────── */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#8B0B1F,#C8102E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Shield size={18} color="#fff" />
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".22em", color: "rgba(200,16,46,.7)", margin: 0 }}>ADMINISTRAÇÃO</p>
                                <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, letterSpacing: ".14em", color: "var(--text)", margin: 0 }}>
                                    Histórico de Alterações
                                </h1>
                            </div>
                        </div>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 15, color: "var(--text-sec)", margin: 0 }}>
                            Rastreabilidade completa de todas as operações no sistema
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="aud-btn aud-btn-ghost" onClick={() => setShowFiltros(s => !s)}>
                            <Filter size={13} /> {showFiltros ? "Ocultar" : "Filtros"}
                        </button>
                        <button className="aud-btn aud-btn-ghost" onClick={() => buscar()}>
                            <RefreshCw size={13} className={loading ? "spin" : ""} /> Atualizar
                        </button>
                    </div>
                </div>

                {/* ─── Filtros ────────────────────────────────────────────────────── */}
                <AnimatePresence>
                    {showFiltros && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: .22 }}
                            style={{ overflow: "hidden", marginBottom: 20 }}
                        >
                            <div className="aud-card" style={{ padding: "22px 24px" }}>
                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".22em", color: "var(--text-sec)", margin: "0 0 18px" }}>FILTROS DE PESQUISA</p>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>

                                    <div>
                                        <label style={inputStyle}>ENTIDADE</label>
                                        <select className="aud-select" style={{ width: "100%" }} value={filtros.entidade} onChange={e => setFiltro("entidade", e.target.value)}>
                                            <option value="">Todas</option>
                                            {ENTIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={inputStyle}>AÇÃO</label>
                                        <select className="aud-select" style={{ width: "100%" }} value={filtros.acao} onChange={e => setFiltro("acao", e.target.value)}>
                                            <option value="">Todas</option>
                                            {Object.entries(ACOES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={inputStyle}>OPERADOR</label>
                                        <input className="aud-input" placeholder="Nome do usuário..." value={filtros.usuario} onChange={e => setFiltro("usuario", e.target.value)} />
                                    </div>

                                    <div>
                                        <label style={inputStyle}>ID DO REGISTRO</label>
                                        <input className="aud-input" placeholder="Ex: 42" type="number" value={filtros.entidadeId} onChange={e => setFiltro("entidadeId", e.target.value)} />
                                    </div>

                                    <div>
                                        <label style={inputStyle}>DATA INÍCIO</label>
                                        <input className="aud-input" type="datetime-local" value={filtros.de} onChange={e => setFiltro("de", e.target.value)} />
                                    </div>

                                    <div>
                                        <label style={inputStyle}>DATA FIM</label>
                                        <input className="aud-input" type="datetime-local" value={filtros.ate} onChange={e => setFiltro("ate", e.target.value)} />
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
                                    <button className="aud-btn aud-btn-ghost" onClick={limpar}><X size={13} /> Limpar</button>
                                    <button className="aud-btn aud-btn-primary" onClick={aplicar}><Search size={13} /> Buscar</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── Resumo ─────────────────────────────────────────────────────── */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".16em", color: "var(--text-sec)" }}>
            {totalItems > 0 ? `${totalItems.toLocaleString("pt-BR")} REGISTRO${totalItems !== 1 ? "S" : ""} ENCONTRADO${totalItems !== 1 ? "S" : ""}` : "NENHUM REGISTRO"}
          </span>
                    {totalItems > 0 && (
                        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".14em", color: "var(--text-sec)" }}>
              PÁGINA {filtros.page + 1} DE {totalPages}
            </span>
                    )}
                </div>

                {/* ─── Tabela ─────────────────────────────────────────────────────── */}
                <div className="aud-card" style={{ overflow: "hidden" }}>
                    {loading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 12 }}>
                            <RefreshCw size={20} className="spin" style={{ color: IEQ.red }} />
                            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".2em", color: "var(--text-sec)" }}>CARREGANDO...</span>
                        </div>
                    ) : erro ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: 12 }}>
                            <AlertTriangle size={28} style={{ color: IEQ.red }} />
                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".16em", color: "var(--text-sec)", textAlign: "center" }}>{erro}</p>
                            <button className="aud-btn aud-btn-primary" onClick={() => buscar()}><RefreshCw size={13} /> Tentar novamente</button>
                        </div>
                    ) : registros.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: 10 }}>
                            <Shield size={32} style={{ color: "var(--text-sec)", opacity: .4 }} />
                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".18em", color: "var(--text-sec)" }}>NENHUM REGISTRO ENCONTRADO</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                                    {["", "DATA / HORA", "ENTIDADE", "REGISTRO", "AÇÃO", "OPERADOR", "APROVADOR"].map(h => (
                                        <th key={h} style={{ padding: "12px 8px", textAlign: "left", fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 700, letterSpacing: ".18em", color: "var(--text-sec)", whiteSpace: "nowrap" }}>
                                            {h}
                                        </th>
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

                {/* ─── Paginação ──────────────────────────────────────────────────── */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20 }}>
                        <button className="page-btn" disabled={filtros.page === 0} onClick={() => irPara(filtros.page - 1)}>
                            <ChevronLeft size={14} />
                        </button>

                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            let p = i;
                            if (totalPages > 7) {
                                const start = Math.max(0, Math.min(filtros.page - 3, totalPages - 7));
                                p = start + i;
                            }
                            return (
                                <button key={p} className={`page-btn${filtros.page === p ? " active" : ""}`} onClick={() => irPara(p)}>
                                    {p + 1}
                                </button>
                            );
                        })}

                        <button className="page-btn" disabled={filtros.page >= totalPages - 1} onClick={() => irPara(filtros.page + 1)}>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}

                {/* ─── Rodapé ─────────────────────────────────────────────────────── */}
                <div className="divider" style={{ marginTop: 32 }} />
                <p style={{ textAlign: "center", fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".16em", color: "var(--text-sec)", padding: "10px 0 0" }}>
                    © IEQ PITUAÇU · AUDITORIA DO SISTEMA · {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
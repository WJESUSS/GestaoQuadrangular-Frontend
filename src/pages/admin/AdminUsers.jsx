import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Users, Power, Trash2, LogOut,
  Mail, Key, User, Shield, Loader2, RefreshCcw, Pencil, X,
  Sun, Moon, Eye, EyeOff, CheckCircle, XCircle, Clock, Camera,
  History, ChevronLeft, ChevronRight, Search, Filter,
  Edit3, PlusCircle, AlertTriangle, RefreshCw,
  ChevronDown, ChevronUp, Menu, FileText,
  Building2, Settings, DollarSign, Home, Flame,
  LayoutDashboard, Share2, Trophy, Bell, ClipboardList,
  BarChart2, TrendingUp, Target, Sparkles,
} from "lucide-react";

// ── Importações dos módulos reais ───────────────────────────────────────────
// SECRETARIA
import Membros           from "../secretaria/Membros";
import Celulas           from "../secretaria/Celulas";
import Visitantes        from "../secretaria/Visitante";
import FichasEncontro    from "../secretaria/FichasEncontro";
import SecretariaCelulas from "../secretaria/SecretariaCelulas";

// PASTOR
import PainelPastor              from "../pastor/PainelPastor";
import RelatorioCelula           from "../pastor/RelatorioCelula";
import SolicitacoesMultiplicacao from "../pastor/SolicitacoesMultiplicacao";
import RankingCelulas            from "../pastor/RankingCelulas";
import PainelAlertas             from "../pastor/PainelAlertas";
import Discipulado               from "../pastor/Discipulado";
import TelaPendencias            from "../pastor/TelaPendencias";
import RelatorioCasasDePaz       from "../pastor/RelatorioCasasDePaz";
import RelatorioMissao70Pastor   from "../pastor/RelatorioMissao70Pastor";

// LIDER
import TelaRelatorio      from "../lider/TelaRelatorio";
import RelatorioDiscipulado from "../lider/RelatorioDiscipulado";
import TelaVisitantes     from "../lider/TelaVisitantes";
import TelaFichas         from "../lider/TelaFichas";
import CasasDePazLider    from "../lider/CasasDePazLider";
import Missao70Lider      from "../lider/Missao70Lider";

// TESOURARIA
import TesourariaDashboard  from "../tesouraria/TesourariaDashboard";
import TesourariaLancamento from "../tesouraria/TesourariaLancamento";
import TesourariaRelatorio  from "../tesouraria/TesourariaRelatorio";
import TesourariaDizimistas from "../tesouraria/TesourariaDizimistas";
import TesourariaComparativo from "../tesouraria/TesourariaComparativo";

/* ─── Paleta IEQ ────────────────────────────────────────────────────────── */
const IEQ = {
  red:        "#C8102E",
  redDark:    "#9B0B1E",
  redLight:   "#E8294A",
  yellow:     "#FDB813",
  yellowDark: "#C48C00",
  blue:       "#003DA5",
  blueDark:   "#002470",
  blueLight:  "#1A56C4",
  light:      "#F5F0EB",
  dark:       "#0A0608",
  stone:      "#1A1416",
};

const perfis = ["ADMIN","PASTOR","LIDER_CELULA","SECRETARIO","TESOUREIRO"];
const ENTIDADES = ["MEMBRO","VISITANTE","CELULA","FICHA","USUARIO","SECRETARIA"];
const ACOES = {
  CREATE:  { label:"Criação",   icon:PlusCircle,  color:"#059669", bg:"rgba(5,150,105,.12)",  border:"rgba(5,150,105,.25)"  },
  UPDATE:  { label:"Edição",    icon:Edit3,        color:"#F59E0B", bg:"rgba(245,158,11,.12)", border:"rgba(245,158,11,.25)" },
  DELETE:  { label:"Exclusão",  icon:Trash2,       color:"#EF4444", bg:"rgba(239,68,68,.12)",  border:"rgba(239,68,68,.25)"  },
  APPROVE: { label:"Aprovação", icon:CheckCircle,  color:"#10B981", bg:"rgba(16,185,129,.12)", border:"rgba(16,185,129,.25)" },
  REJECT:  { label:"Rejeição",  icon:XCircle,      color:"#F97316", bg:"rgba(249,115,22,.12)", border:"rgba(249,115,22,.25)" },
  VIEW:    { label:"Consulta",  icon:Eye,          color:"#6366F1", bg:"rgba(99,102,241,.12)", border:"rgba(99,102,241,.25)" },
};

// ── Definição dos módulos por seção ─────────────────────────────────────────
const SECOES = [
  {
    id: "admin",
    label: "Administração",
    icon: Shield,
    color: IEQ.red,
    itens: [
      { key: "usuarios",  label: "Usuários",    icon: Users,    desc: "Controle de acessos" },
      { key: "historico", label: "Histórico",   icon: History,  desc: "Auditoria do sistema" },
    ],
  },
  {
    id: "secretaria",
    label: "Secretaria",
    icon: FileText,
    color: IEQ.blue,
    itens: [
      { key: "membros",           label: "Membros",    icon: Users,    desc: "Base de membros" },
      { key: "visitantes",        label: "Visitantes", icon: UserPlus, desc: "Novas vidas" },
      { key: "celulas",           label: "Células",    icon: Home,     desc: "Grupos" },
      { key: "fichas",            label: "Fichas",     icon: FileText, desc: "Encontro" },
      { key: "secretariacelulas", label: "Sec. Células",icon: Building2,desc: "Secretaria" },
    ],
  },
  {
    id: "pastor",
    label: "Pastoral",
    icon: LayoutDashboard,
    color: IEQ.redLight,
    itens: [
      { key: "painel-pastor",  label: "Dashboard",   icon: LayoutDashboard, desc: "Visão geral" },
      { key: "relatorios",     label: "Relatórios",  icon: FileText,        desc: "Células" },
      { key: "discipulado",    label: "Discipulado", icon: Users,           desc: "Secretaria" },
      { key: "multiplicacoes", label: "Multip.",     icon: Share2,          desc: "Solicitações" },
      { key: "ranking",        label: "Ranking",     icon: Trophy,          desc: "Células" },
      { key: "casas-de-paz",   label: "Casas de Paz",icon: Home,           desc: "Evangelismo" },
      { key: "missao70",       label: "Missão 70",   icon: Flame,          desc: "Evangelismo" },
      { key: "pendencias",     label: "Pendências",  icon: ClipboardList,  desc: "Semana" },
      { key: "alertas",        label: "Alertas",     icon: AlertTriangle,  desc: "Sistema", alert: true },
    ],
  },
  {
    id: "lider",
    label: "Líder",
    icon: Target,
    color: "#059669",
    itens: [
      { key: "lider-relatorio",    label: "Relatório",   icon: FileText, desc: "Semanal" },
      { key: "lider-discipulado",  label: "Discipulado", icon: Users,    desc: "Membros" },
      { key: "lider-visitantes",   label: "Visitantes",  icon: UserPlus, desc: "Novas vidas" },
      { key: "lider-fichas",       label: "Fichas",      icon: FileText, desc: "Encontro" },
      { key: "lider-casas",        label: "Casas de Paz",icon: Home,     desc: "Evangelismo" },
      { key: "lider-missao70",     label: "Missão 70",   icon: Flame,    desc: "Evangelismo" },
    ],
  },
  {
    id: "tesouraria",
    label: "Tesouraria",
    icon: DollarSign,
    color: IEQ.yellowDark,
    itens: [
      { key: "teso-dashboard",   label: "Dashboard",   icon: BarChart2,  desc: "Análise geral" },
      { key: "teso-lancamento",  label: "Lançamento",  icon: DollarSign, desc: "Fluxo" },
      { key: "teso-relatorio",   label: "Relatório",   icon: FileText,   desc: "Exportação" },
      { key: "teso-dizimistas",  label: "Dizimistas",  icon: Users,      desc: "Base de dados" },
      { key: "teso-comparativo", label: "Comparativo", icon: TrendingUp, desc: "Evolução anual" },
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR",{ hour:"2-digit", minute:"2-digit" });
}

function AcaoBadge({ acao }) {
  const m = ACOES[acao] || { label:acao, icon:Shield, color:"#888", bg:"rgba(128,128,128,.1)", border:"rgba(128,128,128,.2)" };
  const Icon = m.icon;
  return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:99,
        fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:700, letterSpacing:".1em",
        border:`1px solid ${m.border}`, background:m.bg, color:m.color, whiteSpace:"nowrap" }}>
      <Icon size={9}/> {m.label}
    </span>
  );
}

function EntidadeTag({ entidade }) {
  const c = {
    MEMBRO:     { c:IEQ.blue,      b:"rgba(0,61,165,.12)"   },
    VISITANTE:  { c:IEQ.red,       b:"rgba(200,16,46,.1)"   },
    CELULA:     { c:"#059669",     b:"rgba(5,150,105,.1)"   },
    FICHA:      { c:IEQ.yellow,    b:"rgba(253,184,19,.12)" },
    USUARIO:    { c:"#8B5CF6",     b:"rgba(139,92,246,.1)"  },
    SECRETARIA: { c:IEQ.blueLight, b:"rgba(26,86,196,.1)"   },
  }[entidade] || { c:"#888", b:"rgba(128,128,128,.1)" };
  return (
      <span style={{ display:"inline-flex", padding:"2px 8px", borderRadius:4,
        fontFamily:"'Manrope',sans-serif", fontSize:8.5, fontWeight:700, letterSpacing:".1em",
        border:`1px solid ${c.c}44`, color:c.c, background:c.b }}>
      {entidade}
    </span>
  );
}

function DetalhesDiff({ detalhes }) {
  let parsed = null;
  try { parsed = JSON.parse(detalhes); } catch {
    return <p style={{ fontSize:13, fontStyle:"italic", color:"var(--sub)" }}>Sem detalhes registrados.</p>;
  }
  if (!parsed || Object.keys(parsed).length === 0)
    return <p style={{ fontSize:13, fontStyle:"italic", color:"var(--sub)" }}>Sem detalhes registrados.</p>;
  return (
      <div>
        {Object.entries(parsed).map(([campo, val]) => (
            <div key={campo} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"7px 0", borderBottom:"1px solid var(--border)" }}>
          <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:700, letterSpacing:".1em",
            color:"var(--sub)", minWidth:100, paddingTop:3, textTransform:"uppercase" }}>{campo}</span>
              <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                {val?.de !== undefined && (
                    <>
                <span style={{ background:"rgba(239,68,68,.1)", color:"#EF4444", border:"1px solid rgba(239,68,68,.2)",
                  borderRadius:4, padding:"2px 7px", fontSize:12, textDecoration:"line-through" }}>
                  {String(val.de || "—")}
                </span>
                      <span style={{ color:"var(--sub)", fontSize:12 }}>→</span>
                      <span style={{ background:"rgba(5,150,105,.1)", color:"#059669", border:"1px solid rgba(5,150,105,.2)",
                        borderRadius:4, padding:"2px 7px", fontSize:12 }}>
                  {String(val.para ?? "—")}
                </span>
                    </>
                )}
                {val?.para !== undefined && val?.de === undefined && (
                    <span style={{ background:"rgba(5,150,105,.1)", color:"#059669", border:"1px solid rgba(5,150,105,.2)",
                      borderRadius:4, padding:"2px 7px", fontSize:12 }}>
                {String(val.para ?? "—")}
              </span>
                )}
                {typeof val === "string" && <span style={{ fontSize:12, color:"var(--text)" }}>{val}</span>}
              </div>
            </div>
        ))}
      </div>
  );
}

function AuditoriaRow({ reg, isDark }) {
  const [open, setOpen] = useState(false);
  const sub = isDark ? "rgba(245,240,235,.4)" : "rgba(10,6,8,.42)";
  const border = isDark ? "rgba(200,16,46,.13)" : "rgba(200,16,46,.1)";
  return (
      <>
        <tr onClick={() => setOpen(o => !o)}
            style={{ borderBottom:`1px solid ${border}`, cursor:"pointer", transition:"background .15s",
              background: open ? (isDark ? "rgba(200,16,46,.06)" : "rgba(200,16,46,.03)") : "transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(200,16,46,.06)" : "rgba(200,16,46,.03)"}
            onMouseLeave={e => e.currentTarget.style.background = open ? (isDark ? "rgba(200,16,46,.06)" : "rgba(200,16,46,.03)") : "transparent"}>
          <td style={{ padding:"11px 12px", width:24 }}>
            {open ? <ChevronUp size={12} style={{ color:IEQ.red }}/> : <ChevronDown size={12} style={{ color:sub }}/>}
          </td>
          <td style={{ padding:"11px 8px", whiteSpace:"nowrap" }}>
            <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:10, color:sub }}>{formatDate(reg.dataHora)}</span>
          </td>
          <td style={{ padding:"11px 8px" }}><EntidadeTag entidade={reg.entidade}/></td>
          <td style={{ padding:"11px 8px", maxWidth:150, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            <span style={{ fontSize:13, color:"var(--text)" }}>{reg.entidadeNome || `#${reg.entidadeId}`}</span>
          </td>
          <td style={{ padding:"11px 8px" }}><AcaoBadge acao={reg.acao}/></td>
          <td style={{ padding:"11px 8px", maxWidth:130, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:20, height:20, borderRadius:5, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`,
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontFamily:"'Manrope',sans-serif", fontWeight:700, fontSize:8, color:"#fff" }}>
                {reg.usuarioNome?.charAt(0).toUpperCase()}
              </span>
              </div>
              <span style={{ fontSize:12, color:"var(--text)" }}>{reg.usuarioNome}</span>
            </div>
          </td>
          <td style={{ padding:"11px 8px" }}>
            {reg.aprovadorNome
                ? <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <CheckCircle size={10} style={{ color:"#059669" }}/>
                  <span style={{ fontSize:12, color:"#059669" }}>{reg.aprovadorNome}</span>
                </div>
                : <span style={{ fontSize:12, color:sub, fontStyle:"italic" }}>—</span>}
          </td>
        </tr>
        <AnimatePresence>
          {open && (
              <tr>
                <td colSpan={7} style={{ padding:0, background: isDark ? "rgba(200,16,46,.02)" : "rgba(200,16,46,.015)" }}>
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
                              exit={{ height:0, opacity:0 }} transition={{ duration:.18 }} style={{ overflow:"hidden" }}>
                    <div style={{ padding:"12px 20px 16px 40px",
                      "--text": isDark ? IEQ.light : IEQ.dark,
                      "--sub": isDark ? "rgba(245,240,235,.4)" : "rgba(10,6,8,.42)",
                      "--border": isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.09)" }}>
                      <div style={{ display:"flex", gap:24, flexWrap:"wrap", marginBottom:10 }}>
                        <div>
                          <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:8.5, letterSpacing:".15em", color:"var(--sub)", margin:"0 0 3px", textTransform:"uppercase" }}>ID</p>
                          <p style={{ fontSize:13, color:"var(--text)", margin:0 }}>#{reg.entidadeId}</p>
                        </div>
                        {reg.ipOrigem && <div>
                          <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:8.5, letterSpacing:".15em", color:"var(--sub)", margin:"0 0 3px", textTransform:"uppercase" }}>IP</p>
                          <p style={{ fontSize:13, color:"var(--text)", margin:0 }}>{reg.ipOrigem}</p>
                        </div>}
                        {reg.usuarioEmail && <div>
                          <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:8.5, letterSpacing:".15em", color:"var(--sub)", margin:"0 0 3px", textTransform:"uppercase" }}>E-mail</p>
                          <p style={{ fontSize:13, color:"var(--text)", margin:0 }}>{reg.usuarioEmail}</p>
                        </div>}
                      </div>
                      <div style={{ height:1, background:`linear-gradient(90deg,transparent,rgba(200,16,46,.18),transparent)`, margin:"0 0 8px" }}/>
                      <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:8.5, letterSpacing:".16em", color:"var(--sub)", textTransform:"uppercase", margin:"0 0 7px" }}>Campos Alterados</p>
                      <DetalhesDiff detalhes={reg.detalhes}/>
                    </div>
                  </motion.div>
                </td>
              </tr>
          )}
        </AnimatePresence>
      </>
  );
}

function HistoricoAuditoria({ isDark }) {
  const [registros,   setRegistros]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [erro,        setErro]        = useState(null);
  const [totalPages,  setTotalPages]  = useState(0);
  const [totalItems,  setTotalItems]  = useState(0);
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtros, setFiltros] = useState({ entidade:"", acao:"", usuario:"", entidadeId:"", de:"", ate:"", page:0, size:20 });

  const sub    = isDark ? "rgba(245,240,235,.4)"  : "rgba(10,6,8,.42)";
  const border = isDark ? "rgba(200,16,46,.13)"    : "rgba(200,16,46,.1)";
  const inputBg = isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)";
  const txt = isDark ? IEQ.light : IEQ.dark;

  const buscar = useCallback(async (f = filtros) => {
    setLoading(true); setErro(null);
    try {
      const p = new URLSearchParams();
      if (f.entidade)   p.set("entidade", f.entidade);
      if (f.acao)       p.set("acao", f.acao);
      if (f.usuario)    p.set("usuario", f.usuario);
      if (f.entidadeId) p.set("entidadeId", f.entidadeId);
      if (f.de)         p.set("de", new Date(f.de).toISOString());
      if (f.ate)        p.set("ate", new Date(f.ate).toISOString());
      p.set("page", f.page); p.set("size", f.size);
      const res = await api.get(`/auditoria?${p}`);
      setRegistros(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalItems(res.data.totalElements || 0);
    } catch { setErro("Não foi possível carregar o histórico."); }
    finally  { setLoading(false); }
  }, [filtros]);

  useEffect(() => { buscar(); }, []);

  const setF    = (k, v) => setFiltros(f => ({ ...f, [k]:v, page:0 }));
  const aplicar = () => buscar({ ...filtros, page:0 });
  const limpar  = () => { const z={ entidade:"", acao:"", usuario:"", entidadeId:"", de:"", ate:"", page:0, size:20 }; setFiltros(z); buscar(z); };
  const irPara  = p  => { const f={ ...filtros, page:p }; setFiltros(f); buscar(f); };

  const inputSt = { background:inputBg, border:`1px solid ${border}`, borderRadius:7, color: isDark ? IEQ.light : IEQ.dark, fontFamily:"'Manrope',sans-serif", fontSize:13, padding:"9px 12px", outline:"none", width:"100%", transition:"border-color .2s" };
  const selectSt = { ...inputSt, fontSize:10, fontWeight:700, letterSpacing:".1em", cursor:"pointer", appearance:"none" };
  const labelSt  = { fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:700, letterSpacing:".15em", color:sub, textTransform:"uppercase", margin:"0 0 5px", display:"block" };

  return (
      <div style={{ "--text":txt, "--sub":sub, "--border":border }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10, padding:"18px 20px", borderBottom:`1px solid ${border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:34, height:34, borderRadius:8, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <History size={15} color="#fff"/>
            </div>
            <div>
              <h3 style={{ fontFamily:"'Manrope',sans-serif", fontSize:11, fontWeight:800, letterSpacing:".14em", color:txt, margin:0, textTransform:"uppercase" }}>Histórico de Alterações</h3>
              <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:12, color:sub, margin:0 }}>{totalItems > 0 ? `${totalItems.toLocaleString("pt-BR")} registros` : "Rastreabilidade do sistema"}</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {[
              { icon:<Filter size={13}/>, label: showFiltros ? "Ocultar" : "Filtros", action:() => setShowFiltros(s => !s) },
              { icon:<RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }}/>, label:"Atualizar", action:() => buscar() },
            ].map(b => (
                <button key={b.label} onClick={b.action} style={{ display:"flex", alignItems:"center", gap:6, background: isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.05)", color: isDark ? IEQ.light : IEQ.redDark, border:`1px solid ${border}`, borderRadius:8, fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:700, letterSpacing:".12em", cursor:"pointer", padding:"9px 14px", transition:"all .2s" }}>{b.icon} {b.label}</button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showFiltros && (
              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:.2 }} style={{ overflow:"hidden" }}>
                <div style={{ margin:"0 20px 16px", background: isDark ? "rgba(255,255,255,.02)" : "rgba(200,16,46,.03)", border:`1px solid ${border}`, borderRadius:10, padding:"16px 18px" }}>
                  <p style={{ ...labelSt, marginBottom:12 }}>Filtros de Pesquisa</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10 }}>
                    <div><label style={labelSt}>Entidade</label>
                      <select style={selectSt} value={filtros.entidade} onChange={e => setF("entidade",e.target.value)}>
                        <option value="">Todas</option>{ENTIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div><label style={labelSt}>Ação</label>
                      <select style={selectSt} value={filtros.acao} onChange={e => setF("acao",e.target.value)}>
                        <option value="">Todas</option>{Object.entries(ACOES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    <div><label style={labelSt}>Operador</label><input style={inputSt} placeholder="Nome..." value={filtros.usuario} onChange={e => setF("usuario",e.target.value)}/></div>
                    <div><label style={labelSt}>ID Registro</label><input style={inputSt} placeholder="Ex: 42" type="number" value={filtros.entidadeId} onChange={e => setF("entidadeId",e.target.value)}/></div>
                    <div><label style={labelSt}>Data Início</label><input style={inputSt} type="datetime-local" value={filtros.de} onChange={e => setF("de",e.target.value)}/></div>
                    <div><label style={labelSt}>Data Fim</label><input style={inputSt} type="datetime-local" value={filtros.ate} onChange={e => setF("ate",e.target.value)}/></div>
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:12, justifyContent:"flex-end" }}>
                    <button onClick={limpar} style={{ display:"flex", alignItems:"center", gap:5, background:"none", color:sub, border:`1px solid ${border}`, borderRadius:7, fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:700, letterSpacing:".1em", cursor:"pointer", padding:"8px 14px" }}><X size={11}/> Limpar</button>
                    <button onClick={aplicar} style={{ display:"flex", alignItems:"center", gap:5, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, color:"#fff", border:"none", borderRadius:7, fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:700, letterSpacing:".12em", cursor:"pointer", padding:"8px 16px", boxShadow:"0 4px 14px rgba(200,16,46,.28)" }}><Search size={11}/> Buscar</button>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        <div style={{ overflowX:"auto" }}>
          {loading ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 0", gap:10 }}>
                <Loader2 size={18} style={{ animation:"spin 1s linear infinite", color:IEQ.red }}/>
                <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:10, letterSpacing:".15em", color:sub, textTransform:"uppercase" }}>Carregando...</span>
              </div>
          ) : erro ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"48px 0", gap:12 }}>
                <AlertTriangle size={24} style={{ color:IEQ.red }}/>
                <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:10, color:sub, textAlign:"center" }}>{erro}</p>
                <button onClick={() => buscar()} style={{ display:"flex", alignItems:"center", gap:5, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, color:"#fff", border:"none", borderRadius:7, fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:700, letterSpacing:".12em", cursor:"pointer", padding:"9px 16px" }}><RefreshCw size={11}/> Tentar Novamente</button>
              </div>
          ) : registros.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"48px 0", gap:10 }}>
                <History size={28} style={{ color:sub, opacity:.4 }}/>
                <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:10, letterSpacing:".14em", color:sub, textTransform:"uppercase" }}>Nenhum registro encontrado</p>
              </div>
          ) : (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                <tr style={{ borderBottom:`2px solid ${border}`, background: isDark ? "rgba(255,255,255,.02)" : "rgba(200,16,46,.03)" }}>
                  {["","Data / Hora","Entidade","Registro","Ação","Operador","Aprovador"].map(h => (
                      <th key={h} style={{ padding:"10px 8px", textAlign:"left", fontFamily:"'Manrope',sans-serif", fontSize:8.5, fontWeight:700, letterSpacing:".14em", color:sub, whiteSpace:"nowrap", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr>
                </thead>
                <tbody>{registros.map((reg, i) => <AuditoriaRow key={reg.id ?? i} reg={reg} isDark={isDark}/>)}</tbody>
              </table>
          )}
        </div>

        {totalPages > 1 && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"14px 0 4px" }}>
              <button disabled={filtros.page === 0} onClick={() => irPara(filtros.page - 1)} style={{ width:28, height:28, borderRadius:6, border:`1px solid ${border}`, background: isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.04)", color:txt, display:"flex", alignItems:"center", justifyContent:"center", cursor: filtros.page === 0 ? "not-allowed" : "pointer", opacity: filtros.page === 0 ? .35 : 1 }}>
                <ChevronLeft size={13}/>
              </button>
              {Array.from({ length:Math.min(totalPages,7) }, (_,i) => {
                let p = i;
                if (totalPages > 7) { const s = Math.max(0,Math.min(filtros.page-3,totalPages-7)); p = s+i; }
                const active = filtros.page === p;
                return (
                    <button key={p} onClick={() => irPara(p)} style={{ width:28, height:28, borderRadius:6, border: active ? "none" : `1px solid ${border}`, background: active ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})` : (isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.04)"), color: active ? "#fff" : txt, fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:700, cursor:"pointer" }}>{p+1}</button>
                );
              })}
              <button disabled={filtros.page >= totalPages-1} onClick={() => irPara(filtros.page+1)} style={{ width:28, height:28, borderRadius:6, border:`1px solid ${border}`, background: isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.04)", color:txt, display:"flex", alignItems:"center", justifyContent:"center", cursor: filtros.page >= totalPages-1 ? "not-allowed" : "pointer", opacity: filtros.page >= totalPages-1 ? .35 : 1 }}>
                <ChevronRight size={13}/>
              </button>
            </div>
        )}
      </div>
  );
}

// ── Input com ícone ──────────────────────────────────────────────────────────
function InputIEQ({ icon, isDark, onChange, type, ...props }) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";
  const inputType  = isPassword && showPwd ? "text" : type;
  const sub = isDark ? "rgba(245,240,235,.35)" : "rgba(10,6,8,.35)";
  const border = isDark ? "rgba(200,16,46,.18)" : "rgba(200,16,46,.16)";
  return (
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.55, pointerEvents:"none", zIndex:1 }}>{icon}</div>
        <input {...props} type={inputType} onChange={e => onChange(e.target.value)}
               style={{ width:"100%", background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)", border:`1px solid ${border}`, color: isDark ? IEQ.light : IEQ.dark, padding:`12px 16px 12px 42px`, paddingRight: isPassword ? 42 : 16, borderRadius:8, outline:"none", fontFamily:"'Manrope',sans-serif", fontSize:14, transition:"all .2s" }}
               onFocus={e => { e.target.style.borderColor = IEQ.red; e.target.style.boxShadow = "0 0 0 3px rgba(200,16,46,.1)"; }}
               onBlur={e  => { e.target.style.borderColor = border;  e.target.style.boxShadow = "none"; }}
        />
        {isPassword && (
            <button type="button" onClick={() => setShowPwd(v => !v)}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:sub, padding:4, display:"flex", alignItems:"center" }}
                    onMouseEnter={e => e.currentTarget.style.color = IEQ.red}
                    onMouseLeave={e => e.currentTarget.style.color = sub}
                    tabIndex={-1}>
              {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
        )}
      </div>
  );
}

function handleLogout() {
  localStorage.clear();
  window.location.href = "/";
}

// ── Painel de Usuários ───────────────────────────────────────────────────────
function PainelUsuarios({ isDark, usuarios: usuariosProp, pendentes, loading, aprovando, uploadandoFoto, carregarUsuarios, abrirEdicao, deletarUsuario, alternarStatus, aprovarAlteracao, rejeitarAlteracao, abrirSeletorFoto, removerFoto, adicionarUsuario, form, setForm, sending }) {
  // ✅ CORREÇÃO: garante que usuarios sempre é um array, independente do que a API retornar
  const usuarios = Array.isArray(usuariosProp) ? usuariosProp : [];

  const bg      = isDark ? IEQ.dark      : "#F0EAE8";
  const cardBg  = isDark ? "rgba(26,20,22,.97)" : "rgba(255,255,255,.95)";
  const txt     = isDark ? IEQ.light     : IEQ.dark;
  const sub     = isDark ? "rgba(245,240,235,.4)"  : "rgba(10,6,8,.42)";
  const border  = isDark ? "rgba(200,16,46,.14)"   : "rgba(200,16,46,.11)";
  const inputBg = isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)";

  const ativos    = usuarios.filter(u =>  u.ativo).length;
  const suspensos = usuarios.filter(u => !u.ativo).length;
  const qtdPend   = pendentes.size;

  return (
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {/* KPI row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
          {[
            { icon:<Users size={17}/>,  label:"Total",     value:usuarios.length, color:IEQ.blue,      bg:"rgba(0,61,165,.1)" },
            { icon:<Power size={17}/>,  label:"Ativos",    value:ativos,          color:"#12A060",     bg:"rgba(18,160,96,.1)" },
            { icon:<Shield size={17}/>, label:"Suspensos", value:suspensos,       color:IEQ.redDark,   bg:"rgba(200,16,46,.1)" },
            { icon:<Clock size={17}/>,  label:"Pendentes", value:qtdPend,         color:IEQ.yellowDark,bg:"rgba(196,140,0,.1)" },
          ].map(({ icon, label, value, color, bg: ibg }, i) => (
              <div key={label} style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:12, padding:"15px 14px", display:"flex", alignItems:"center", gap:12, animationDelay:`${i*.07}s` }}>
                <div style={{ width:38, height:38, borderRadius:9, background:ibg, color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</div>
                <div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, lineHeight:1, color: label==="Pendentes" && value > 0 ? IEQ.yellowDark : txt }}>
                    {loading ? "…" : value}
                  </div>
                  <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:700, letterSpacing:".14em", textTransform:"uppercase", color:sub, marginTop:3 }}>{label}</div>
                </div>
              </div>
          ))}
        </div>

        {/* Form novo usuário */}
        <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:13, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:`1px solid ${border}`, display:"flex", alignItems:"center", gap:11 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"rgba(200,16,46,.1)", color:IEQ.red, display:"flex", alignItems:"center", justifyContent:"center" }}><UserPlus size={15}/></div>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:700, color:txt }}>Novo Acesso</div>
              <div style={{ fontSize:10, color:sub }}>Liberar usuário no sistema</div>
            </div>
          </div>
          <div style={{ padding:18 }}>
            <form onSubmit={adicionarUsuario}>
              <div style={{ marginBottom:12 }}>
                <label style={{ display:"block", fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:IEQ.red, marginBottom:6 }}>Nome Completo</label>
                <InputIEQ icon={<User size={14}/>} type="text" placeholder="Nome do usuário" value={form.nome} onChange={v => setForm({...form,nome:v})} isDark={isDark} required/>
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ display:"block", fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:IEQ.red, marginBottom:6 }}>E-mail</label>
                <InputIEQ icon={<Mail size={14}/>} type="email" placeholder="E-mail institucional" value={form.email} onChange={v => setForm({...form,email:v})} isDark={isDark} required/>
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ display:"block", fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:IEQ.red, marginBottom:6 }}>Senha</label>
                <InputIEQ icon={<Key size={14}/>} type="password" placeholder="Senha de acesso" value={form.senha} onChange={v => setForm({...form,senha:v})} isDark={isDark} required/>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:IEQ.red, marginBottom:6 }}>Perfil</label>
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.55, pointerEvents:"none" }}><Shield size={14}/></div>
                  <select value={form.perfil} onChange={e => setForm({...form,perfil:e.target.value})}
                          style={{ width:"100%", background:inputBg, border:`1px solid rgba(200,16,46,.16)`, color:txt, padding:"12px 14px 12px 42px", borderRadius:8, outline:"none", fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:700, letterSpacing:".1em", appearance:"none", cursor:"pointer" }}>
                    {perfis.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={sending}
                      style={{ width:"100%", padding:13, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, color:"#fff", border:"none", borderRadius:8, fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:700, letterSpacing:".16em", textTransform:"uppercase", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 18px rgba(200,16,46,.25)", opacity:sending?.45:1 }}>
                {sending ? <><Loader2 size={15} style={{ animation:"spin 1s linear infinite" }}/> Criando...</> : <><UserPlus size={14}/> Liberar Acesso</>}
              </button>
            </form>
          </div>
        </div>

        {/* Lista usuários */}
        <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:13, overflow:"hidden" }}>
          {qtdPend > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background: isDark ? "rgba(253,184,19,.07)" : "rgba(253,184,19,.1)", borderBottom:"1px solid rgba(253,184,19,.2)" }}>
                <Clock size={13} style={{ color:IEQ.yellowDark, flexShrink:0 }}/>
                <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:800, letterSpacing:".12em", color:IEQ.yellowDark, textTransform:"uppercase" }}>
              {qtdPend} solicitaç{qtdPend > 1 ? "ões" : "ão"} aguardando aprovação
            </span>
              </div>
          )}
          <div style={{ padding:"14px 18px", borderBottom:`1px solid ${border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:7, background:`linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}><Users size={14}/></div>
              <div>
                <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:11, fontWeight:800, letterSpacing:".1em", color:txt, margin:0, textTransform:"uppercase" }}>Base de Usuários</p>
                <p style={{ fontSize:11.5, color:sub, margin:0 }}>{usuarios.length} registros</p>
              </div>
            </div>
            <button onClick={carregarUsuarios} style={{ display:"flex", alignItems:"center", gap:5, background: isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.05)", color: isDark ? IEQ.light : IEQ.redDark, border:`1px solid ${border}`, borderRadius:7, fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:700, letterSpacing:".1em", cursor:"pointer", padding:"8px 12px", textTransform:"uppercase" }}>
              <RefreshCcw size={12} style={{ animation:loading?"spin 1s linear infinite":"none" }}/> Atualizar
            </button>
          </div>
          <div>
            {usuarios.map((u, i) => {
              const temP = pendentes.has(u.id);
              const eApr = aprovando === u.id;
              const eFoto= uploadandoFoto === u.id;
              return (
                  <motion.div key={u.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-20 }} transition={{ delay:i*.04 }}
                              style={{ display:"flex", flexDirection:"column", padding:"12px 18px", gap:10, borderBottom:`1px solid ${isDark?"rgba(200,16,46,.07)":"rgba(200,16,46,.06)"}`, transition:"background .15s", background: temP ? (isDark?"rgba(253,184,19,.04)":"rgba(253,184,19,.05)") : "transparent", borderLeft: temP ? `3px solid ${IEQ.yellow}` : "3px solid transparent" }}
                              onMouseEnter={e => e.currentTarget.style.background = isDark?"rgba(200,16,46,.05)":"rgba(200,16,46,.03)"}
                              onMouseLeave={e => e.currentTarget.style.background = temP?(isDark?"rgba(253,184,19,.04)":"rgba(253,184,19,.05)"):"transparent"}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0, flex:1 }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
                          <div style={{ position:"relative", width:38, height:38, cursor:"pointer" }} onClick={() => abrirSeletorFoto(u.id)}>
                            {u.fotoPerfil
                                ? <div style={{ width:38, height:38, borderRadius:8, overflow:"hidden", border: temP?`2px solid ${IEQ.yellow}`:"none", opacity:u.ativo?1:.45 }}><img src={u.fotoPerfil} alt={u.nome} style={{ width:"100%", height:"100%", objectFit:"cover" }}/></div>
                                : <div style={{ width:38, height:38, borderRadius:8, background: u.ativo?`linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`:(isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"), display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:"#fff", opacity:u.ativo?1:.6 }}>{u.nome?.charAt(0).toUpperCase()}</div>
                            }
                            <div style={{ position:"absolute", inset:0, borderRadius:8, background:"rgba(10,6,8,.52)", display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity .2s" }}
                                 onMouseEnter={e => e.currentTarget.style.opacity=1} onMouseLeave={e => e.currentTarget.style.opacity=0}>
                              {eFoto ? <Loader2 size={13} color="#fff" style={{ animation:"spin 1s linear infinite" }}/> : <Camera size={13} color="#fff"/>}
                            </div>
                          </div>
                          <button style={{ display:"flex", alignItems:"center", gap:3, background:"none", border:`1px solid ${IEQ.red}`, borderRadius:4, color:IEQ.red, fontFamily:"'Manrope',sans-serif", fontSize:7, fontWeight:700, letterSpacing:".1em", cursor:"pointer", padding:"2px 6px" }}
                                  disabled={eFoto} onClick={() => u.fotoPerfil ? removerFoto(u.id,u.nome) : abrirSeletorFoto(u.id)}>
                            {eFoto ? <Loader2 size={8} style={{ animation:"spin 1s linear infinite" }}/> : <Camera size={8}/>}
                            {eFoto ? "..." : u.fotoPerfil ? "Remover" : "Foto"}
                          </button>
                        </div>
                        <div style={{ minWidth:0, flex:1 }}>
                          <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:11, fontWeight:700, color:txt, letterSpacing:".04em" }}>{u.nome}</div>
                          <div style={{ fontSize:11.5, color:sub, wordBreak:"break-all" }}>{u.email}</div>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:99, fontFamily:"'Manrope',sans-serif", fontSize:8.5, fontWeight:700, letterSpacing:".1em", border:"1px solid rgba(0,61,165,.22)", background:"rgba(0,61,165,.07)", color:IEQ.blue, whiteSpace:"nowrap" }}>{u.perfil?.replace(/_/g," ")}</span>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:99, fontFamily:"'Manrope',sans-serif", fontSize:8.5, fontWeight:700, letterSpacing:".1em", border:`1px solid ${u.ativo?"rgba(18,160,96,.22)":"rgba(10,6,8,.12)"}`, background:u.ativo?"rgba(18,160,96,.07)":"rgba(10,6,8,.04)", color:u.ativo?"#12A060":sub, whiteSpace:"nowrap" }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background:u.ativo?"#12A060":"rgba(10,6,8,.2)", flexShrink:0 }}/>{u.ativo ? "Ativo" : "Suspenso"}
                    </span>
                        {temP && (
                            <div style={{ display:"flex", gap:5 }}>
                              <button disabled={eApr} onClick={() => aprovarAlteracao(u.id, u.nome)} style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"1px solid rgba(18,160,96,.3)", borderRadius:6, color:"#12A060", fontFamily:"'Manrope',sans-serif", fontSize:8, fontWeight:700, letterSpacing:".1em", cursor:"pointer", padding:"5px 10px" }}>
                                {eApr ? <Loader2 size={11} style={{ animation:"spin 1s linear infinite" }}/> : <CheckCircle size={11}/>} Aprovar
                              </button>
                              <button disabled={eApr} onClick={() => rejeitarAlteracao(u.id, u.nome)} style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"1px solid rgba(200,16,46,.3)", borderRadius:6, color:IEQ.red, fontFamily:"'Manrope',sans-serif", fontSize:8, fontWeight:700, letterSpacing:".1em", cursor:"pointer", padding:"5px 10px" }}>
                                {eApr ? <Loader2 size={11} style={{ animation:"spin 1s linear infinite" }}/> : <XCircle size={11}/>} Rejeitar
                              </button>
                            </div>
                        )}
                        <button onClick={() => abrirEdicao(u)} title="Editar" style={{ width:28, height:28, borderRadius:6, border:"none", background:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:sub, transition:"all .2s" }} onMouseEnter={e => { e.currentTarget.style.color=IEQ.blue; e.currentTarget.style.background="rgba(0,61,165,.08)"; }} onMouseLeave={e => { e.currentTarget.style.color=sub; e.currentTarget.style.background="none"; }}><Pencil size={14}/></button>
                        <button onClick={() => alternarStatus(u.id)} title="Alternar status" style={{ width:28, height:28, borderRadius:6, border:"none", background:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:sub, transition:"all .2s" }} onMouseEnter={e => { e.currentTarget.style.color=IEQ.yellowDark; e.currentTarget.style.background="rgba(253,184,19,.1)"; }} onMouseLeave={e => { e.currentTarget.style.color=sub; e.currentTarget.style.background="none"; }}><Power size={14}/></button>
                        <button onClick={() => deletarUsuario(u.id)} title="Excluir" style={{ width:28, height:28, borderRadius:6, border:"none", background:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:sub, transition:"all .2s" }} onMouseEnter={e => { e.currentTarget.style.color=IEQ.red; e.currentTarget.style.background="rgba(200,16,46,.08)"; }} onMouseLeave={e => { e.currentTarget.style.color=sub; e.currentTarget.style.background="none"; }}><Trash2 size={14}/></button>
                      </div>
                    </div>
                  </motion.div>
              );
            })}
          </div>
        </div>
      </div>
  );
}

// ── Componente renderizador de módulo ────────────────────────────────────────
function ModuloRenderer({ moduloKey, isDark, celulaAdmin }) {
  const props = { isDark };
  switch(moduloKey) {
      // SECRETARIA
    case "membros":           return <Membros {...props}/>;
    case "visitantes":        return <Visitantes {...props}/>;
    case "celulas":           return <Celulas {...props}/>;
    case "fichas":            return <FichasEncontro {...props}/>;
    case "secretariacelulas": return <SecretariaCelulas {...props}/>;
      // PASTOR
    case "painel-pastor":  return <PainelPastor {...props}/>;
    case "relatorios":     return <RelatorioCelula {...props}/>;
    case "discipulado":    return <Discipulado {...props}/>;
    case "multiplicacoes": return <SolicitacoesMultiplicacao {...props}/>;
    case "ranking":        return <RankingCelulas {...props}/>;
    case "casas-de-paz":   return <RelatorioCasasDePaz {...props}/>;
    case "missao70":       return <RelatorioMissao70Pastor {...props}/>;
    case "pendencias":     return <TelaPendencias {...props}/>;
    case "alertas":        return <PainelAlertas {...props}/>;
      // LIDER (admin escolhe célula)
    case "lider-relatorio":   return <TelaRelatorio celula={celulaAdmin} {...props}/>;
    case "lider-discipulado": return <RelatorioDiscipulado membros={[]} {...props}/>;
    case "lider-visitantes":  return <TelaVisitantes celulaId={celulaAdmin?.id} {...props}/>;
    case "lider-fichas":      return <TelaFichas celula={celulaAdmin} {...props}/>;
    case "lider-casas":       return <CasasDePazLider celulaId={celulaAdmin?.id} {...props}/>;
    case "lider-missao70":    return <Missao70Lider celulaId={celulaAdmin?.id} {...props}/>;
      // TESOURARIA
    case "teso-dashboard":   return <TesourariaDashboard {...props}/>;
    case "teso-lancamento":  return <TesourariaLancamento {...props}/>;
    case "teso-relatorio":   return <TesourariaRelatorio {...props}/>;
    case "teso-dizimistas":  return <TesourariaDizimistas {...props}/>;
    case "teso-comparativo": return <TesourariaComparativo {...props}/>;
    default: return null;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
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
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [moduloAtivo,     setModuloAtivo]     = useState("usuarios");
  const [secaoExpandida,  setSecaoExpandida]  = useState("admin");
  const [celulas,         setCelulas]         = useState([]);
  const [celulaAdmin,     setCelulaAdmin]     = useState(null);

  const fotoInputRef     = useRef(null);
  const fotoUsuarioIdRef = useRef(null);

  const bg        = isDark ? IEQ.dark      : "#F0EAE8";
  const cardBg    = isDark ? "rgba(26,20,22,.97)" : "rgba(255,255,255,.95)";
  const txt       = isDark ? IEQ.light     : IEQ.dark;
  const sub       = isDark ? "rgba(245,240,235,.4)"  : "rgba(10,6,8,.42)";
  const border    = isDark ? "rgba(200,16,46,.14)"   : "rgba(200,16,46,.11)";
  const sidebarBg = isDark ? "rgba(10,6,8,.98)"      : "rgba(10,6,8,.97)";

  useEffect(() => { localStorage.setItem("theme", isDark ? "dark" : "light"); }, [isDark]);

  const carregarUsuarios = useCallback(async () => {
    setLoading(true); setErro("");
    try {
      const [ru, rp, rc] = await Promise.all([
        api.get("usuarios"),
        api.get("usuarios/com-alteracao-pendente"),
        api.get("celulas"),
      ]);

      // ✅ CORREÇÃO PRINCIPAL: normaliza a resposta da API para sempre ser um array
      // Suporta: array direto [], objeto paginado { content: [] }, ou { usuarios: [] }
      const dadosUsuarios = ru.data;
      const listaUsuarios = Array.isArray(dadosUsuarios)
          ? dadosUsuarios
          : dadosUsuarios?.content ?? dadosUsuarios?.usuarios ?? dadosUsuarios?.data ?? [];
      setUsuarios(listaUsuarios);

      // Normaliza pendentes também
      const dadosPendentes = rp.data;
      const listaPendentes = Array.isArray(dadosPendentes)
          ? dadosPendentes
          : dadosPendentes?.content ?? dadosPendentes?.usuarios ?? [];
      setPendentes(new Set(listaPendentes.map(u => u.id)));

      setCelulas(rc.data || []);
      if (rc.data?.length > 0 && !celulaAdmin) setCelulaAdmin(rc.data[0]);
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Não foi possível sincronizar os dados.");
    } finally { setLoading(false); }
  }, [celulaAdmin]);

  useEffect(() => { carregarUsuarios(); }, [carregarUsuarios]);

  const mostrarSucesso = msg => { setSucesso(msg); setTimeout(() => setSucesso(""), 3500); };

  const adicionarUsuario = async e => {
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

  const abrirEdicao = u => {
    setEditandoId(u.id);
    setForm({ nome:u.nome, email:u.email, senha:"", perfil:u.perfil });
    setIsEditModalOpen(true);
  };

  const salvarEdicao = async e => {
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

  const deletarUsuario = async id => {
    if (!window.confirm("Esta ação removerá permanentemente o acesso. Confirmar?")) return;
    try { await api.delete(`usuarios/${id}`); carregarUsuarios(); }
    catch (err) { if (err.response?.status === 401) { handleLogout(); return; } setErro("Erro ao deletar."); }
  };

  const alternarStatus = async id => {
    try { await api.patch(`usuarios/${id}/status`); carregarUsuarios(); }
    catch (err) { if (err.response?.status === 401) { handleLogout(); return; } setErro("Erro ao alterar status."); }
  };

  const aprovarAlteracao = async (id, nome) => {
    if (!window.confirm(`Aprovar a solicitação de "${nome}"?`)) return;
    setAprovando(id);
    try { await api.patch(`usuarios/${id}/aprovar-alteracao`); mostrarSucesso(`Alteração de ${nome} aprovada.`); carregarUsuarios(); }
    catch (err) { if (err.response?.status === 401) { handleLogout(); return; } setErro("Erro ao aprovar."); }
    finally { setAprovando(null); }
  };

  const rejeitarAlteracao = async (id, nome) => {
    if (!window.confirm(`Rejeitar a solicitação de "${nome}"?`)) return;
    setAprovando(id);
    try { await api.patch(`usuarios/${id}/rejeitar-alteracao`); mostrarSucesso(`Alteração de ${nome} rejeitada.`); carregarUsuarios(); }
    catch (err) { if (err.response?.status === 401) { handleLogout(); return; } setErro("Erro ao rejeitar."); }
    finally { setAprovando(null); }
  };

  const abrirSeletorFoto = id => { fotoUsuarioIdRef.current = id; fotoInputRef.current.click(); };
  const handleFotoSelecionada = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErro("Selecione um arquivo de imagem válido."); return; }
    if (file.size > 2*1024*1024) { setErro("A imagem deve ter no máximo 2 MB."); return; }
    const id = fotoUsuarioIdRef.current;
    setUploadandoFoto(id);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file);
      });
      await api.patch(`usuarios/${id}/foto`, { fotoBase64:base64 });
      mostrarSucesso("Foto atualizada."); carregarUsuarios();
    } catch (err) { if (err.response?.status === 401) { handleLogout(); return; } setErro("Erro ao enviar foto."); }
    finally { setUploadandoFoto(null); e.target.value = ""; }
  };
  const removerFoto = async (id, nome) => {
    if (!window.confirm(`Remover foto de "${nome}"?`)) return;
    setUploadandoFoto(id);
    try { await api.patch(`usuarios/${id}/foto`, { fotoBase64:null }); mostrarSucesso("Foto removida."); carregarUsuarios(); }
    catch (err) { if (err.response?.status === 401) { handleLogout(); return; } setErro("Erro ao remover foto."); }
    finally { setUploadandoFoto(null); }
  };

  const qtdPend = pendentes.size;
  const isLiderModulo = moduloAtivo?.startsWith("lider-");
  const secaoAtiva = SECOES.find(s => s.itens.some(i => i.key === moduloAtivo));

  const G = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Manrope:wght@300;400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @keyframes spin     { to { transform: rotate(360deg); } }
    @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes stripe   { 0%{ background-position:0 0; } 100%{ background-position:60px 60px; } }
    @keyframes pendPulse{ 0%,100%{ box-shadow:0 0 0 0 rgba(253,184,19,.45); } 50%{ box-shadow:0 0 0 5px rgba(253,184,19,0); } }

    .admin-root { font-family:'Manrope',sans-serif; background:${bg}; min-height:100vh; position:relative; transition:background .4s; }
    .grid-bg { position:fixed; inset:0; pointer-events:none; z-index:0; background-image:linear-gradient(rgba(253,184,19,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(253,184,19,.045) 1px,transparent 1px); background-size:56px 56px; }
    .glow-r { position:fixed; top:0; left:0; width:560px; height:560px; border-radius:50%; background:radial-gradient(circle,rgba(200,16,46,.11) 0%,transparent 65%); pointer-events:none; z-index:0; }
    .glow-b { position:fixed; bottom:-80px; right:-80px; width:480px; height:480px; border-radius:50%; background:radial-gradient(circle,rgba(0,61,165,.09) 0%,transparent 65%); pointer-events:none; z-index:0; }
    .sidebar-stripe { height:3px; background:linear-gradient(90deg,${IEQ.redDark},${IEQ.red},${IEQ.yellow},${IEQ.blue}); }
    .admin-layout { position:relative; z-index:10; display:flex; min-height:100vh; }

    /* SIDEBAR */
    .sidebar { width:260px; flex-shrink:0; background:${sidebarBg}; border-right:1px solid rgba(200,16,46,.16); display:flex; flex-direction:column; transition:transform .3s ease; position:fixed; top:0; left:0; height:100vh; z-index:100; overflow-y:auto; }
    .sidebar-overlay { position:fixed; inset:0; background:rgba(10,6,8,.6); z-index:99; backdrop-filter:blur(4px); }
    @media(min-width:900px){ .sidebar{ position:sticky; transform:none !important; } .sidebar-overlay{ display:none !important; } }
    @media(max-width:899px){ .sidebar.closed{ transform:translateX(-100%); } .sidebar.open{ transform:translateX(0); } }

    /* NAV seções */
    .section-label { font-size:8px; font-weight:800; letter-spacing:.22em; color:rgba(245,240,235,.2); text-transform:uppercase; padding:14px 18px 5px; }
    .section-header { display:flex; align-items:center; justify-content:space-between; padding:8px 18px; cursor:pointer; transition:background .2s; }
    .section-header:hover { background:rgba(200,16,46,.05); }

    .nav-item { display:flex; align-items:center; gap:9px; padding:8px 18px 8px 32px; cursor:pointer; transition:all .18s; position:relative; border:none; background:none; width:100%; text-align:left; }
    .nav-item:hover { background:rgba(200,16,46,.07); }
    .nav-item.active { background:rgba(200,16,46,.13); }
    .nav-item.active::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:18px; background:${IEQ.red}; border-radius:0 2px 2px 0; }
    .nav-icon { width:26px; height:26px; border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .nav-item.active .nav-icon { background:rgba(200,16,46,.18); }
    .nav-item:not(.active) .nav-icon { background:rgba(255,255,255,.05); }
    .nav-label { font-size:10px; font-weight:700; letter-spacing:.06em; color:rgba(245,240,235,.55); }
    .nav-item.active .nav-label { color:#F5F0EB; }
    .nav-desc { font-size:8.5px; color:rgba(245,240,235,.25); letter-spacing:.04em; }
    .nav-badge { margin-left:auto; background:${IEQ.yellow}; color:${IEQ.dark}; font-size:9px; font-weight:800; padding:2px 7px; border-radius:99px; letter-spacing:.04em; flex-shrink:0; }

    /* MAIN */
    .main-area { flex:1; min-width:0; display:flex; flex-direction:column; }
    @media(min-width:900px){ .main-area{ margin-left:260px; } }

    /* TOPBAR */
    .topbar { background:${isDark?"rgba(26,20,22,.95)":"rgba(255,255,255,.9)"}; border-bottom:1px solid ${border}; backdrop-filter:blur(18px); padding:0 20px; display:flex; align-items:center; justify-content:space-between; height:58px; position:sticky; top:0; z-index:50; }
    .topbar-left { display:flex; align-items:center; gap:12px; }
    .hamburger { background:none; border:1px solid ${border}; border-radius:7px; padding:7px 8px; cursor:pointer; color:${sub}; display:flex; align-items:center; transition:all .2s; }
    .hamburger:hover { border-color:${IEQ.red}; color:${IEQ.red}; }
    @media(min-width:900px){ .hamburger{ display:none; } }
    .page-title { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; color:${txt}; letter-spacing:.01em; line-height:1; }
    .page-sub { font-size:9.5px; font-weight:700; letter-spacing:.14em; color:${sub}; text-transform:uppercase; margin-top:3px; }
    .topbar-right { display:flex; align-items:center; gap:8px; }
    .tb-btn { display:flex; align-items:center; gap:6px; background:none; border:1px solid ${border}; border-radius:7px; padding:7px 11px; cursor:pointer; color:${sub}; font-family:'Manrope',sans-serif; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; transition:all .2s; }
    .tb-btn:hover { border-color:${IEQ.red}; color:${IEQ.red}; }
    .tb-btn.accent { background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red}); border:none; color:#fff; box-shadow:0 4px 16px rgba(200,16,46,.28); }
    .tb-btn.accent:hover { opacity:.88; transform:translateY(-1px); }

    /* CONTENT */
    .content { padding:18px 16px 32px; }
    @media(min-width:640px){ .content{ padding:22px 24px 40px; } }

    /* LIDER selector */
    .celula-selector { background:${cardBg}; border:1px solid ${border}; border-radius:12px; padding:14px 18px; margin-bottom:16px; display:flex; align-items:center; gap:12px; flex-wrap:wrap; }

    .admin-footer { text-align:center; font-size:9px; font-weight:700; letter-spacing:.16em; color:${sub}; text-transform:uppercase; padding:8px 0 4px; }
    .spin { animation:spin 1s linear infinite; }
  `;

  if (loading && usuarios.length === 0) return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background: isDark ? IEQ.dark : "#F0EAE8" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700&display=swap');`}</style>
        <div style={{ textAlign:"center" }}>
          <img src="/quadrangular.png" alt="IEQ" style={{ width:52, height:52, borderRadius:"50%", objectFit:"cover", border:`2px solid ${IEQ.red}44` }} onError={e => { e.target.style.display="none"; }}/>
          <p style={{ fontFamily:"'Manrope',sans-serif", fontWeight:800, letterSpacing:".2em", fontSize:10, color: isDark ? IEQ.light : IEQ.redDark, marginTop:16, textTransform:"uppercase" }}>Carregando...</p>
        </div>
      </div>
  );

  return (
      <div className="admin-root">
        <style>{G}</style>
        <div className="grid-bg"/>
        <div className="glow-r"/>
        <div className="glow-b"/>
        <div className="admin-layout">

          {/* SIDEBAR OVERLAY */}
          {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}/>}

          {/* SIDEBAR */}
          <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
            <div className="sidebar-stripe"/>

            {/* Logo */}
            <div style={{ padding:"20px 18px 16px", borderBottom:"1px solid rgba(200,16,46,.1)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <img src="/quadrangular.png" alt="IEQ" style={{ width:38, height:38, borderRadius:"50%", objectFit:"cover", border:"2px solid rgba(200,16,46,.3)", flexShrink:0 }}
                     onError={e => { e.target.style.display="none"; e.target.nextElementSibling.style.display="flex"; }}/>
                <div style={{ width:38, height:38, borderRadius:"50%", background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, display:"none", alignItems:"center", justifyContent:"center", border:"2px solid rgba(200,16,46,.3)", fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:700, color:"#fff", flexShrink:0 }}>IEQ</div>
                <div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:13, fontWeight:700, color:"#F5F0EB", letterSpacing:".02em" }}>IEQ Pituaçu</div>
                  <div style={{ fontSize:8.5, fontWeight:700, letterSpacing:".16em", color:"rgba(245,240,235,.3)", textTransform:"uppercase", marginTop:2 }}>Painel Admin</div>
                </div>
              </div>
            </div>

            {/* Nav por seções */}
            <div style={{ flex:1, overflowY:"auto" }}>
              {SECOES.map(sec => {
                const SecIcon = sec.icon;
                const expandida = secaoExpandida === sec.id;
                return (
                    <div key={sec.id}>
                      {/* Header da seção */}
                      <div className="section-header" onClick={() => setSecaoExpandida(expandida ? null : sec.id)}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <SecIcon size={13} style={{ color:sec.color }}/>
                          <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:800, letterSpacing:".18em", color:"rgba(245,240,235,.35)", textTransform:"uppercase" }}>{sec.label}</span>
                        </div>
                        <ChevronDown size={11} style={{ color:"rgba(245,240,235,.2)", transform:expandida?"rotate(180deg)":"rotate(0deg)", transition:"transform .2s" }}/>
                      </div>

                      {/* Itens da seção */}
                      <AnimatePresence>
                        {expandida && (
                            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:.18 }} style={{ overflow:"hidden" }}>
                              {sec.itens.map(item => {
                                const ItemIcon = item.icon;
                                const ativo = moduloAtivo === item.key;
                                return (
                                    <button key={item.key} className={`nav-item ${ativo?"active":""}`}
                                            onClick={() => { setModuloAtivo(item.key); setSidebarOpen(false); }}>
                                      <div className="nav-icon">
                                        <ItemIcon size={13} style={{ color:ativo ? IEQ.redLight : sec.color, opacity:ativo?1:.7 }}/>
                                      </div>
                                      <div style={{ minWidth:0 }}>
                                        <div className="nav-label">{item.label}</div>
                                        <div className="nav-desc">{item.desc}</div>
                                      </div>
                                      {item.key === "usuarios" && qtdPend > 0 && <span className="nav-badge">{qtdPend}</span>}
                                    </button>
                                );
                              })}
                            </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                );
              })}
            </div>

            {/* Footer sidebar */}
            <div style={{ padding:"16px 18px", borderTop:"1px solid rgba(200,16,46,.1)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:"rgba(200,16,46,.06)", border:"1px solid rgba(200,16,46,.1)", marginBottom:10 }}>
                <div style={{ width:30, height:30, borderRadius:7, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>A</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:11, fontWeight:700, color:"#F5F0EB", letterSpacing:".04em" }}>Administrador</div>
                  <div style={{ fontSize:9, color:"rgba(245,240,235,.3)", letterSpacing:".1em", textTransform:"uppercase" }}>Admin · IEQ</div>
                </div>
                <button onClick={handleLogout} title="Sair" style={{ background:"rgba(200,16,46,.1)", border:"1px solid rgba(200,16,46,.22)", borderRadius:6, padding:"6px 8px", cursor:"pointer", color:IEQ.redLight, display:"flex", alignItems:"center", transition:"all .2s" }}
                        onMouseEnter={e => e.currentTarget.style.background="rgba(200,16,46,.2)"}
                        onMouseLeave={e => e.currentTarget.style.background="rgba(200,16,46,.1)"}>
                  <LogOut size={14}/>
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <main className="main-area">
            {/* TOPBAR */}
            <header className="topbar">
              <div className="topbar-left">
                <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu"><Menu size={16}/></button>
                <div>
                  <div className="page-title">
                    {secaoAtiva?.label || "Admin"} — {SECOES.flatMap(s=>s.itens).find(i=>i.key===moduloAtivo)?.label || "Painel"}
                  </div>
                  <div className="page-sub">IEQ Pituaçu · Administração Total</div>
                </div>
              </div>
              <div className="topbar-right">
                <button className="tb-btn" onClick={() => setIsDark(!isDark)} aria-label="Tema">
                  {isDark ? <Sun size={15}/> : <Moon size={15}/>}
                </button>
                <button className="tb-btn" onClick={carregarUsuarios}>
                  <RefreshCcw size={13} className={loading?"spin":""}/>
                  <span style={{ display:"none" }}>Atualizar</span>
                </button>
                <button className="tb-btn accent" onClick={() => { setEditandoId(null); setForm({ nome:"", email:"", senha:"", perfil:"LIDER_CELULA" }); setIsEditModalOpen(true); }}>
                  <UserPlus size={14}/>
                </button>
              </div>
            </header>

            {/* CONTENT */}
            <div className="content">
              {/* Seletor de célula para módulos de Líder */}
              {isLiderModulo && celulas.length > 0 && (
                  <div className="celula-selector">
                    <Building2 size={16} style={{ color:IEQ.blue, flexShrink:0 }}/>
                    <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:800, letterSpacing:".14em", color:sub, textTransform:"uppercase", flexShrink:0 }}>Célula:</span>
                    <select value={celulaAdmin?.id || ""} onChange={e => setCelulaAdmin(celulas.find(c=>c.id===Number(e.target.value)))}
                            style={{ flex:1, background:isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)", border:`1px solid ${border}`, color:txt, padding:"8px 12px", borderRadius:8, fontFamily:"'Manrope',sans-serif", fontSize:13, outline:"none", appearance:"none", cursor:"pointer" }}>
                      {celulas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div key={moduloAtivo} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:.15 }}>
                  {/* Módulos Admin */}
                  {moduloAtivo === "usuarios" && (
                      <PainelUsuarios
                          isDark={isDark} usuarios={usuarios} pendentes={pendentes}
                          loading={loading} aprovando={aprovando} uploadandoFoto={uploadandoFoto}
                          carregarUsuarios={carregarUsuarios} abrirEdicao={abrirEdicao}
                          deletarUsuario={deletarUsuario} alternarStatus={alternarStatus}
                          aprovarAlteracao={aprovarAlteracao} rejeitarAlteracao={rejeitarAlteracao}
                          abrirSeletorFoto={abrirSeletorFoto} removerFoto={removerFoto}
                          adicionarUsuario={adicionarUsuario} form={form} setForm={setForm} sending={sending}
                      />
                  )}
                  {moduloAtivo === "historico" && (
                      <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:13, overflow:"hidden" }}>
                        <HistoricoAuditoria isDark={isDark}/>
                      </div>
                  )}
                  {/* Todos os outros módulos */}
                  {moduloAtivo !== "usuarios" && moduloAtivo !== "historico" && (
                      <ModuloRenderer moduloKey={moduloAtivo} isDark={isDark} celulaAdmin={celulaAdmin}/>
                  )}
                </motion.div>
              </AnimatePresence>

              <p className="admin-footer">© {new Date().getFullYear()} IEQ Pituaçu · Sistema Eclesiástico · Admin Total</p>
            </div>
          </main>
        </div>

        {/* Input foto oculto */}
        <input ref={fotoInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFotoSelecionada}/>

        {/* MODAL EDIÇÃO / CRIAÇÃO */}
        <AnimatePresence>
          {isEditModalOpen && (
              <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setIsEditModalOpen(false)}
                            style={{ position:"fixed", inset:0, background:"rgba(10,6,8,.78)", backdropFilter:"blur(14px)", zIndex:0 }}/>
                <motion.div initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }} transition={{ type:"spring", damping:26, stiffness:280 }}
                            style={{ position:"relative", zIndex:10, width:"100%", maxWidth:440, maxHeight:"90vh", display:"flex", flexDirection:"column", borderRadius:"16px 16px 0 0", overflow:"hidden", background:cardBg, border:`1px solid ${border}` }}>
                  <div style={{ padding:"24px 20px", overflowY:"auto", flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:38, height:38, borderRadius:9, background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", flexShrink:0 }}>
                          {editandoId ? <Pencil size={16}/> : <UserPlus size={16}/>}
                        </div>
                        <div>
                          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:txt, margin:0 }}>{editandoId ? "Editar Usuário" : "Novo Acesso"}</h2>
                          {editandoId && <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:11, color:sub, margin:0 }}>ID: {editandoId}</p>}
                        </div>
                      </div>
                      <button onClick={() => setIsEditModalOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", color:sub, padding:6, borderRadius:6, display:"flex", alignItems:"center", transition:"color .2s" }}
                              onMouseEnter={e => e.currentTarget.style.color=IEQ.red} onMouseLeave={e => e.currentTarget.style.color=sub}>
                        <X size={19}/>
                      </button>
                    </div>
                    <div style={{ height:1, background:`linear-gradient(90deg,transparent,rgba(200,16,46,.18),transparent)`, marginBottom:18 }}/>
                    <form onSubmit={editandoId ? salvarEdicao : adicionarUsuario} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      <div>
                        <label style={{ display:"block", fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:IEQ.red, marginBottom:6 }}>Nome Completo</label>
                        <InputIEQ icon={<User size={14}/>} type="text" placeholder="Nome" value={form.nome} onChange={v => setForm({...form,nome:v})} isDark={isDark} required/>
                      </div>
                      <div>
                        <label style={{ display:"block", fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:IEQ.red, marginBottom:6 }}>E-mail</label>
                        <InputIEQ icon={<Mail size={14}/>} type="email" placeholder="E-mail" value={form.email} onChange={v => setForm({...form,email:v})} isDark={isDark} required/>
                      </div>
                      <div>
                        <label style={{ display:"block", fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:IEQ.red, marginBottom:6 }}>{editandoId ? "Nova Senha (vazio = manter)" : "Senha"}</label>
                        <InputIEQ icon={<Key size={14}/>} type="password" placeholder={editandoId ? "Deixe vazio para não alterar" : "Senha de acesso"} value={form.senha} onChange={v => setForm({...form,senha:v})} isDark={isDark} required={!editandoId}/>
                      </div>
                      <div>
                        <label style={{ display:"block", fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:800, letterSpacing:".16em", textTransform:"uppercase", color:IEQ.red, marginBottom:6 }}>Perfil</label>
                        <div style={{ position:"relative" }}>
                          <div style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.55, pointerEvents:"none" }}><Shield size={14}/></div>
                          <select value={form.perfil} onChange={e => setForm({...form,perfil:e.target.value})}
                                  style={{ width:"100%", background:isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)", border:`1px solid rgba(200,16,46,.16)`, color:txt, padding:"12px 14px 12px 42px", borderRadius:8, outline:"none", fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:700, letterSpacing:".1em", appearance:"none", cursor:"pointer" }}>
                            {perfis.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:10, marginTop:6 }}>
                        <button type="button" onClick={() => setIsEditModalOpen(false)}
                                style={{ flex:1, padding:"12px", background:"none", border:`1px solid ${border}`, color:sub, borderRadius:8, fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:700, letterSpacing:".12em", cursor:"pointer", transition:"all .2s", textTransform:"uppercase" }}
                                onMouseEnter={e => { e.target.style.borderColor=IEQ.red; e.target.style.color=IEQ.red; }}
                                onMouseLeave={e => { e.target.style.borderColor=border; e.target.style.color=sub; }}>
                          Cancelar
                        </button>
                        <button type="submit" disabled={sending}
                                style={{ flex:2, padding:13, background: editandoId ? `linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})` : `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, color:"#fff", border:"none", borderRadius:8, fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:700, letterSpacing:".16em", textTransform:"uppercase", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, opacity:sending?.45:1 }}>
                          {sending ? <><Loader2 size={15} style={{ animation:"spin 1s linear infinite" }}/> Salvando...</> : editandoId ? <><Pencil size={14}/> Salvar Alterações</> : <><UserPlus size={14}/> Liberar Acesso</>}
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
                          style={{ position:"fixed", bottom:72, left:"50%", transform:"translateX(-50%)", background:"#12A060", color:"#fff", padding:"13px 18px", borderRadius:10, fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:700, letterSpacing:".12em", display:"flex", alignItems:"center", gap:10, zIndex:300, maxWidth:"90vw", boxShadow:"0 8px 28px rgba(18,160,96,.32)" }}>
                <CheckCircle size={14}/> {sucesso}
              </motion.div>
          )}
        </AnimatePresence>

        {/* TOAST ERRO */}
        <AnimatePresence>
          {erro && (
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
                          style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background:IEQ.red, color:"#fff", padding:"13px 18px", borderRadius:10, fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:700, letterSpacing:".12em", display:"flex", alignItems:"center", gap:10, zIndex:300, maxWidth:"90vw", boxShadow:"0 8px 28px rgba(200,16,46,.32)" }}>
                <Power size={14}/>
                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{erro}</span>
                <button onClick={() => setErro("")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.7)", display:"flex", padding:0, marginLeft:4 }}><X size={14}/></button>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
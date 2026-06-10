import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
  Plus, X, User, Phone, Trash2, Loader2, Search,
  CreditCard, Heart, ChevronRight, Users, CalendarDays,
} from "lucide-react";

/* ─── Tokens AURA ─────────────────────────────────────────────────────── */
const AURA = {
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  dark:      "#0A0A0F",
  darkEl:    "#12121A",
  light:     "#F5F0E8",
  lightEl:   "#EDE8DF",
};

// Retorna tokens contextuais baseado no tema
function theme(isDark) {
  return {
    bg:          isDark ? "#0A0A0F"              : "#F5F0E8",
    bgEl:        isDark ? "rgba(18,18,26,.9)"    : "rgba(255,255,255,.92)",
    bgInput:     isDark ? "rgba(255,255,255,.03)": "rgba(0,0,0,.03)",
    border:      isDark ? "rgba(201,169,110,.1)" : "rgba(201,169,110,.2)",
    borderInput: isDark ? "rgba(201,169,110,.14)": "rgba(201,169,110,.25)",
    text:        isDark ? "#F5F0E8"              : "#1A1008",
    textSec:     isDark ? "#9A9588"              : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"              : "#9A9080",
    glow1:       isDark ? "rgba(201,169,110,.05)": "rgba(201,169,110,.08)",
    glow2:       isDark ? "rgba(201,169,110,.04)": "rgba(201,169,110,.06)",
    headerBg:    isDark ? "rgba(10,10,15,.95)"   : "rgba(245,240,232,.95)",
    cardHover:   isDark ? "rgba(201,169,110,.2)" : "rgba(201,169,110,.35)",
    placeholder: isDark ? "rgba(154,149,136,.35)": "rgba(107,94,74,.35)",
    optionBg:    isDark ? "#12121A"              : "#F0EAE0",
  };
}

const STATUS_COLORS = {
  ATIVO:       { bg: "rgba(201,169,110,.1)",  text: AURA.gold,  border: "rgba(201,169,110,.3)"  },
  INATIVO:     { bg: "rgba(255,80,80,.08)",   text: "#e07070",  border: "rgba(255,80,80,.25)"   },
  AFASTADO:    { bg: "rgba(155,155,255,.08)", text: "#9090dd",  border: "rgba(155,155,255,.25)" },
  TRANSFERIDO: { bg: "rgba(100,180,255,.08)", text: "#70b8e8",  border: "rgba(100,180,255,.25)" },
  FALECIDO:    { bg: "rgba(100,100,100,.08)", text: "#888",     border: "rgba(100,100,100,.2)"  },
};

const estadoCivilOptions = [
  { value: "SOLTEIRO",      label: "Solteiro(a)"   },
  { value: "CASADO",        label: "Casado(a)"     },
  { value: "DIVORCIADO",    label: "Divorciado(a)" },
  { value: "VIUVO",         label: "Viúvo(a)"      },
  { value: "UNIAO_ESTAVEL", label: "União Estável" },
];
const statusOptions = ["ATIVO", "INATIVO", "AFASTADO", "TRANSFERIDO", "FALECIDO"];

const formInicial = {
  nome: "", email: "", telefone: "", endereco: "", cpf: "",
  estadoCivil: "SOLTEIRO", dataNascimento: "", dataConversao: "",
  dataBatismo: "", status: "ATIVO", celulaId: null,
};

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function formatarDataInput(dataISO) {
  if (!dataISO) return "";
  try {
    if (typeof dataISO === "string" && dataISO.includes("T")) return dataISO.split("T")[0];
    if (typeof dataISO === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dataISO)) return dataISO;
    return "";
  } catch { return ""; }
}
function brParaIso(br) {
  const m = br.replace(/\D/g, "");
  if (m.length !== 8) return "";
  const d = m.slice(0,2), mo = m.slice(2,4), y = m.slice(4,8);
  if (+d<1||+d>31||+mo<1||+mo>12) return "";
  return `${y}-${mo}-${d}`;
}
function isoParaBr(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y,mo,d] = iso.split("-");
  return `${d}/${mo}/${y}`;
}
function mascaraData(valor) {
  const nums = valor.replace(/\D/g,"").slice(0,8);
  if (nums.length<=2) return nums;
  if (nums.length<=4) return `${nums.slice(0,2)}/${nums.slice(2)}`;
  return `${nums.slice(0,2)}/${nums.slice(2,4)}/${nums.slice(4)}`;
}
function prepararFormParaEnvio(form) {
  const dados = { ...form };
  if (!dados.celulaId) delete dados.celulaId;
  if (!dados.dataNascimento) dados.dataNascimento = null;
  if (!dados.dataConversao)  dados.dataConversao  = null;
  if (!dados.dataBatismo)    dados.dataBatismo    = null;
  if (!dados.nome || dados.nome.trim() === "") throw new Error("Nome completo é obrigatório");
  return dados;
}

/* ─── DateInput ──────────────────────────────────────────────────────── */
function DateInput({ value, onChange, className = "", ...rest }) {
  const [texto, setTexto] = useState(isoParaBr(value));
  const nativeRef = useRef(null);
  useEffect(() => { setTexto(isoParaBr(value)); }, [value]);
  const handleTexto = (e) => {
    const mascarado = mascaraData(e.target.value);
    setTexto(mascarado);
    onChange(brParaIso(mascarado) || (mascarado === "" ? "" : ""));
  };
  const handleNative = (e) => { onChange(e.target.value); setTexto(isoParaBr(e.target.value)); };
  const abrirCalendario = () => { nativeRef.current?.showPicker?.(); nativeRef.current?.click(); };
  return (
      <div style={{ position: "relative" }}>
        <input {...rest} className={className} value={texto} onChange={handleTexto}
               placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10}
               style={{ paddingRight: 38, ...(rest.style || {}) }} />
        <button type="button" onClick={abrirCalendario} title="Abrir calendário"
                style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer", padding:2,
                  display:"flex", alignItems:"center", color:"rgba(201,169,110,.5)" }}>
          <CalendarDays size={15} />
        </button>
        <input ref={nativeRef} type="date" value={value || ""} onChange={handleNative}
               tabIndex={-1} style={{ position:"absolute", opacity:0, pointerEvents:"none", inset:0 }} />
      </div>
  );
}

/* ─── Modal ───────────────────────────────────────────────────────────── */
function MembroModal({ isDark, editandoId, form, setForm, onSalvar, onExcluir, onFechar, nomeCelula, nomeLider }) {
  const t = theme(isDark);
  const f = v => setForm(p => ({ ...p, ...v }));

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
    .mf-wrap {
      position:fixed; inset:0; z-index:9999; display:flex; flex-direction:column;
      background:${t.bg}; font-family:'Inter',sans-serif; color:${t.text};
    }
    .mf-wrap::before {
      content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
      background:
        radial-gradient(ellipse at 20% 0%, ${t.glow1} 0%, transparent 55%),
        radial-gradient(ellipse at 80% 100%, ${t.glow2} 0%, transparent 55%);
    }
    .mf-header {
      position:relative; z-index:2; display:flex; align-items:center; justify-content:space-between;
      padding:18px 22px; border-bottom:1px solid ${t.border}; flex-shrink:0;
      background:${t.headerBg}; backdrop-filter:blur(20px);
    }
    .mf-body {
      flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain;
      padding:24px 22px max(24px, env(safe-area-inset-bottom,24px));
      display:flex; flex-direction:column; gap:16px; position:relative; z-index:1;
    }
    .mf-field {
      width:100%; box-sizing:border-box; background:${t.bgInput};
      border:1px solid ${t.borderInput}; color:${t.text}; padding:12px 16px;
      border-radius:12px; outline:none; font-family:'Inter',sans-serif; font-size:14px; font-weight:300;
      transition:border-color .25s, box-shadow .25s, background .25s; -webkit-appearance:none; appearance:none;
    }
    .mf-field:focus { border-color:rgba(201,169,110,.5); background:rgba(201,169,110,.04); box-shadow:0 0 0 3px rgba(201,169,110,.08); }
    .mf-field::placeholder { color:${t.placeholder}; }
    .mf-field option { background:${t.optionBg}; color:${t.text}; }
    .mf-label {
      font-family:'Inter',sans-serif; font-size:10px; font-weight:500; letter-spacing:.18em;
      text-transform:uppercase; color:rgba(201,169,110,.6); display:block; margin-bottom:6px;
    }
    .mf-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    @media(max-width:380px) { .mf-grid2 { grid-template-columns:1fr; } }
    .mf-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(201,169,110,.15),transparent); margin:4px 0; }
    .mf-btn-save {
      width:100%; padding:15px; border-radius:100px; border:none; cursor:pointer;
      background:linear-gradient(135deg,#C9A96E,#E8D5A3); color:#0A0A0F;
      font-family:'Inter',sans-serif; font-size:12px; font-weight:600; letter-spacing:.18em; text-transform:uppercase;
      transition:all .35s cubic-bezier(.4,0,.2,1); box-shadow:0 8px 32px rgba(201,169,110,.25);
    }
    .mf-btn-save:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(201,169,110,.35); }
    .mf-btn-del {
      width:100%; padding:11px; border:1px solid rgba(255,80,80,.2); cursor:pointer;
      background:rgba(255,80,80,.04); color:rgba(255,120,120,.7); border-radius:100px;
      font-family:'Inter',sans-serif; font-size:11px; font-weight:500; letter-spacing:.14em; text-transform:uppercase;
      display:flex; align-items:center; justify-content:center; gap:7px; transition:all .3s;
    }
    .mf-btn-del:hover { background:rgba(255,80,80,.08); border-color:rgba(255,80,80,.4); color:#e07070; }
    .mf-spiritual {
      padding:18px; border-radius:16px;
      background:${isDark ? "rgba(201,169,110,.04)" : "rgba(201,169,110,.06)"};
      border:1px solid ${isDark ? "rgba(201,169,110,.1)" : "rgba(201,169,110,.18)"};
      position:relative; overflow:hidden;
    }
    .mf-spiritual::before {
      content:''; position:absolute; top:0; left:0; right:0; height:1px;
      background:linear-gradient(90deg,transparent,rgba(201,169,110,.3),transparent);
    }
    .mf-celula-badge {
      display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:16px;
      background:rgba(201,169,110,.05); border:1px solid rgba(201,169,110,.18); position:relative; overflow:hidden;
    }
    .mf-celula-badge::before {
      content:''; position:absolute; top:0; left:0; right:0; height:1px;
      background:linear-gradient(90deg,transparent,rgba(201,169,110,.35),transparent);
    }
    .mf-celula-badge-empty {
      display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:16px;
      background:${isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.03)"};
      border:1px solid ${isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.08)"};
    }
    .mf-section-title {
      display:flex; align-items:center; gap:8px; font-family:'Inter',sans-serif;
      font-size:10px; font-weight:500; letter-spacing:.18em; text-transform:uppercase;
      color:${AURA.gold}; margin:0 0 14px;
    }
  `;

  const renderCelulaBadge = () => {
    if (!editandoId) return null;
    if (nomeCelula) return (
        <div className="mf-celula-badge">
          <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,background:"rgba(201,169,110,.1)",border:"1px solid rgba(201,169,110,.25)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Users size={16} style={{ color:AURA.gold }} />
          </div>
          <div>
            <p style={{ fontFamily:"'Inter',sans-serif",fontSize:9,fontWeight:600,letterSpacing:".18em",color:"rgba(201,169,110,.6)",margin:"0 0 3px",textTransform:"uppercase" }}>CÉLULA VINCULADA</p>
            <p style={{ fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:500,color:t.text,margin:"0 0 2px" }}>{nomeCelula}</p>
            {nomeLider && <p style={{ fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:300,color:t.textSec,margin:0 }}>Líder: {nomeLider}</p>}
          </div>
        </div>
    );
    return (
        <div className="mf-celula-badge-empty">
          <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,background:isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)",border:`1px solid ${isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Users size={16} style={{ color:t.textMuted }} />
          </div>
          <div>
            <p style={{ fontFamily:"'Inter',sans-serif",fontSize:9,fontWeight:500,letterSpacing:".18em",color:t.textMuted,margin:"0 0 3px",textTransform:"uppercase" }}>CÉLULA VINCULADA</p>
            <p style={{ fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:300,fontStyle:"italic",color:t.textMuted,margin:0 }}>Nenhuma célula cadastrada</p>
          </div>
        </div>
    );
  };

  const content = (
      <>
        <style>{css}</style>
        <motion.div className="mf-wrap" initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }} transition={{ type:"tween",duration:0.28 }}>
          <div className="mf-header">
            <button onClick={onFechar} style={{ background:"none",border:"none",cursor:"pointer",color:t.textMuted,display:"flex",alignItems:"center",gap:8,fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:500,letterSpacing:".14em",textTransform:"uppercase" }}>
              <X size={17} /> Voltar
            </button>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontFamily:"'Inter',sans-serif",fontSize:9,fontWeight:500,letterSpacing:".2em",color:"rgba(201,169,110,.55)",margin:"0 0 3px",textTransform:"uppercase" }}>
                {editandoId ? "Editar" : "Novo"}
              </p>
              <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:500,color:t.text,margin:0,letterSpacing:".04em" }}>
                {editandoId ? "Perfil do Membro" : "Cadastro"}
              </h2>
            </div>
          </div>

          <form className="mf-body" onSubmit={onSalvar}>
            {renderCelulaBadge()}
            <div><label className="mf-label">Nome Completo *</label><input required className="mf-field" value={form.nome} onChange={e=>f({nome:e.target.value})} /></div>
            <div className="mf-grid2">
              <div><label className="mf-label">CPF</label><input className="mf-field" placeholder="000.000.000-00" value={form.cpf} onChange={e=>f({cpf:e.target.value})} /></div>
              <div><label className="mf-label">WhatsApp</label><input className="mf-field" value={form.telefone} onChange={e=>f({telefone:e.target.value})} /></div>
            </div>
            <div><label className="mf-label">E-mail</label><input type="email" className="mf-field" value={form.email} onChange={e=>f({email:e.target.value})} /></div>
            <div><label className="mf-label">Endereço</label><input className="mf-field" value={form.endereco} onChange={e=>f({endereco:e.target.value})} /></div>
            <div className="mf-grid2">
              <div><label className="mf-label">Nascimento</label><DateInput className="mf-field" value={form.dataNascimento} onChange={v=>f({dataNascimento:v})} /></div>
              <div>
                <label className="mf-label">Estado Civil</label>
                <select className="mf-field" value={form.estadoCivil} onChange={e=>f({estadoCivil:e.target.value})}>
                  {estadoCivilOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mf-label">Status</label>
              <select className="mf-field" value={form.status} onChange={e=>f({status:e.target.value})}>
                {statusOptions.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mf-divider" />
            <div className="mf-spiritual">
              <p className="mf-section-title"><Heart size={13} /> Jornada Espiritual</p>
              <div className="mf-grid2">
                <div><label className="mf-label">Data Conversão</label><DateInput className="mf-field" value={form.dataConversao} onChange={v=>f({dataConversao:v})} /></div>
                <div><label className="mf-label">Data Batismo</label><DateInput className="mf-field" value={form.dataBatismo} onChange={v=>f({dataBatismo:v})} /></div>
              </div>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:10,paddingTop:6 }}>
              <button type="submit" className="mf-btn-save">{editandoId ? "Salvar Alterações" : "Confirmar Cadastro"}</button>
              {editandoId && <button type="button" className="mf-btn-del" onClick={onExcluir}><Trash2 size={13} /> Excluir Registro</button>}
            </div>
          </form>
        </motion.div>
      </>
  );
  return createPortal(content, document.body);
}

/* ─── Componente Principal ───────────────────────────────────────────── */
export default function Membros({ isDark = false }) {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [statusOriginal, setStatusOriginal] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [form, setForm] = useState(formInicial);
  const [nomeCelula, setNomeCelula] = useState(null);
  const [nomeLider, setNomeLider] = useState(null);

  const t = theme(isDark);

  const baseStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
    @keyframes spin { to { transform:rotate(360deg) } }
    .spin-icon { animation:spin 1s linear infinite; }
    .ieq-field {
      width:100%; box-sizing:border-box; background:${t.bgInput};
      border:1px solid ${t.borderInput}; color:${t.text}; padding:12px 16px;
      border-radius:12px; outline:none; font-family:'Inter',sans-serif; font-size:14px; font-weight:300; transition:all .25s;
    }
    .ieq-field:focus { border-color:rgba(201,169,110,.5); background:rgba(201,169,110,.04); box-shadow:0 0 0 3px rgba(201,169,110,.08); }
    .ieq-field::placeholder { color:${t.placeholder}; }
    .ieq-member-card {
      background:${t.bgEl}; border:1px solid ${t.border}; border-radius:20px;
      padding:20px; cursor:pointer; transition:all .4s cubic-bezier(.4,0,.2,1);
      backdrop-filter:blur(24px); position:relative; overflow:hidden;
    }
    .ieq-member-card::before {
      content:''; position:absolute; top:0; left:0; right:0; height:2px;
      background:linear-gradient(90deg,#C9A96E,transparent); opacity:0; transition:opacity .4s;
    }
    .ieq-member-card:hover { transform:translateY(-6px); border-color:${t.cardHover}; box-shadow:0 20px 60px rgba(0,0,0,.${isDark?"4":"15"}); }
    .ieq-member-card:hover::before { opacity:1; }
    .ieq-grid-m { display:grid; grid-template-columns:1fr; gap:14px; }
    @media(min-width:560px) { .ieq-grid-m { grid-template-columns:repeat(2,1fr); } }
    @media(min-width:900px) { .ieq-grid-m { grid-template-columns:repeat(3,1fr); } }
  `;

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/membros");
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setMembros(data);
    } catch (err) { console.error("Erro ao listar membros:", err); setMembros([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { listar(); }, [listar]);

  const abrirNovo = () => { setEditandoId(null); setStatusOriginal(null); setNomeCelula(null); setNomeLider(null); setForm(formInicial); setIsModalOpen(true); };
  const abrirEdicao = (m) => {
    setEditandoId(m.id); setStatusOriginal(m.status); setNomeCelula(m.nomeCelula??null); setNomeLider(m.nomeLider??null);
    setForm({ nome:m.nome??"", email:m.email??"", telefone:m.telefone??"", endereco:m.endereco??"", cpf:m.cpf??"",
      estadoCivil:m.estadoCivil??"SOLTEIRO", status:m.status??"ATIVO", celulaId:m.celulaId??null,
      dataNascimento:formatarDataInput(m.dataNascimento), dataConversao:formatarDataInput(m.dataConversao), dataBatismo:formatarDataInput(m.dataBatismo) });
    setIsModalOpen(true);
  };
  const fecharModal = () => { setIsModalOpen(false); setEditandoId(null); setNomeCelula(null); setNomeLider(null); };
  const salvar = async (e) => {
    e.preventDefault();
    try {
      const dados = prepararFormParaEnvio(form);
      if (editandoId) {
        if (form.status !== statusOriginal) {
          if (!window.confirm("Alterar o status removerá o membro de células. Continuar?")) return;
          await api.put(`/membros/${editandoId}/status`, null, { params:{ status:form.status } });
        }
        await api.put(`/membros/${editandoId}`, dados);
      } else { await api.post("/membros", dados); }
      fecharModal(); listar();
    } catch (err) { alert(`Erro ao salvar:\n\n${err.response?.data?.message||err.message||"Erro desconhecido"}`); }
  };
  const excluir = async () => {
    if (!window.confirm("Excluir permanentemente?")) return;
    try { await api.delete(`/membros/${editandoId}`); fecharModal(); listar(); }
    catch (err) { alert(`Erro ao excluir:\n\n${err.response?.data?.message||err.message}`); }
  };

  const membrosFiltrados = membros.filter(m =>
      m.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      m.cpf?.includes(filtro) ||
      m.nomeCelula?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
      <div style={{ padding:"28px 22px", fontFamily:"'Inter',sans-serif", color:t.text, minHeight:"100%", background:t.bg, position:"relative", transition:"background .3s, color .3s" }}>
        <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
          background:`radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%), radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%)`,
          transition:"background .3s" }} />
        <style>{baseStyles}</style>
        <div style={{ position:"relative",zIndex:1 }}>
          {/* Header */}
          <div style={{ display:"flex",flexDirection:"column",gap:16,marginBottom:28 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
              <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                <div style={{ width:46,height:46,borderRadius:14,background:"rgba(201,169,110,.1)",border:"1px solid rgba(201,169,110,.2)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <User size={20} style={{ color:AURA.gold }} />
                </div>
                <div>
                  <p style={{ fontFamily:"'Inter',sans-serif",fontSize:10,fontWeight:500,letterSpacing:".2em",color:"rgba(201,169,110,.55)",margin:"0 0 3px",textTransform:"uppercase" }}>Gestão</p>
                  <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:500,color:t.text,margin:0 }}>Membresia</h3>
                </div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ padding:"6px 14px",borderRadius:100,background:"rgba(201,169,110,.07)",border:"1px solid rgba(201,169,110,.18)" }}>
                  <span style={{ fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:500,color:AURA.gold,letterSpacing:".1em" }}>{membros.length} registros</span>
                </div>
                <button onClick={abrirNovo} style={{ display:"flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:100,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#C9A96E,#E8D5A3)",color:"#0A0A0F",fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",boxShadow:"0 8px 28px rgba(201,169,110,.25)",transition:"all .35s" }}>
                  <Plus size={14} /> Novo Membro
                </button>
              </div>
            </div>
            <div style={{ position:"relative" }}>
              <Search size={15} style={{ position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:AURA.gold,opacity:.5 }} />
              <input className="ieq-field" style={{ paddingLeft:46 }} placeholder="Buscar por nome, CPF ou célula…" value={filtro} onChange={e=>setFiltro(e.target.value)} />
            </div>
          </div>

          {loading ? (
              <div style={{ textAlign:"center",padding:"64px 0" }}>
                <Loader2 size={28} className="spin-icon" style={{ color:AURA.gold,display:"inline-block",opacity:.7 }} />
                <p style={{ fontFamily:"'Inter',sans-serif",fontSize:10,fontWeight:500,letterSpacing:".22em",textTransform:"uppercase",color:t.textMuted,marginTop:14 }}>Carregando…</p>
              </div>
          ) : (
              <motion.div className="ieq-grid-m" initial="hidden" animate="visible" variants={{ hidden:{},visible:{ transition:{ staggerChildren:.05 } } }}>
                {membrosFiltrados.map(m => {
                  const sc = STATUS_COLORS[m.status] || STATUS_COLORS.INATIVO;
                  return (
                      <motion.div key={m.id} className="ieq-member-card"
                                  variants={{ hidden:{opacity:0,y:16},visible:{opacity:1,y:0} }}
                                  onClick={() => abrirEdicao(m)}>
                        <div style={{ display:"flex",alignItems:"center",gap:13,marginBottom:16 }}>
                          <div style={{ width:46,height:46,borderRadius:14,flexShrink:0,background:"linear-gradient(135deg,rgba(201,169,110,.15),rgba(201,169,110,.05))",border:"1px solid rgba(201,169,110,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontWeight:600,fontSize:18,color:AURA.gold }}>
                            {m.nome?.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth:0,flex:1 }}>
                            <h4 style={{ fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:500,color:t.text,margin:"0 0 6px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.nome}</h4>
                            <span style={{ display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:100,background:sc.bg,color:sc.text,border:`1px solid ${sc.border}`,fontFamily:"'Inter',sans-serif",fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase" }}>{m.status}</span>
                          </div>
                          <ChevronRight size={14} style={{ color:"rgba(201,169,110,.3)",flexShrink:0 }} />
                        </div>
                        <div style={{ height:1,background:`linear-gradient(90deg,rgba(201,169,110,.15),transparent)`,marginBottom:14 }} />
                        <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
                          {m.nomeCelula && (
                              <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                                <Users size={12} style={{ color:"rgba(201,169,110,.55)",flexShrink:0 }} />
                                <span style={{ fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:300,color:"rgba(201,169,110,.8)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.nomeCelula}</span>
                              </div>
                          )}
                          <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                            <CreditCard size={12} style={{ color:t.textMuted,flexShrink:0 }} />
                            <span style={{ fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:300,color:t.textSec,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.cpf||"CPF não informado"}</span>
                          </div>
                          <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                            <Phone size={12} style={{ color:t.textMuted,flexShrink:0 }} />
                            <span style={{ fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:300,color:t.textSec }}>{m.telefone||"Sem telefone"}</span>
                          </div>
                        </div>
                      </motion.div>
                  );
                })}
              </motion.div>
          )}
        </div>
        <AnimatePresence>
          {isModalOpen && (
              <MembroModal isDark={isDark} editandoId={editandoId} form={form} setForm={setForm}
                           onSalvar={salvar} onExcluir={excluir} onFechar={fecharModal}
                           nomeCelula={nomeCelula} nomeLider={nomeLider} />
          )}
        </AnimatePresence>
      </div>
  );
}
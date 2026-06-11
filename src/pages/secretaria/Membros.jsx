import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
  Plus, X, User, Phone, Trash2, Loader2, Search,
  CreditCard, Heart, ChevronRight, Users, CalendarDays,
  MapPin, BookOpen, Briefcase, Cross, Star, FileText,
} from "lucide-react";

/* ─── Tokens ─────────────────────────────────────────────────────────── */
const IEQ = {
  red: "#C8102E", redDark: "#8B0B1F",
  yellow: "#FDB813", blue: "#003DA5", blueDark: "#002470",
  offWhite: "#F5F0E8",
};

const STATUS_COLORS = {
  ATIVO:       { bg: "rgba(5,150,105,.12)",  text: "#059669", border: "rgba(5,150,105,.3)"   },
  INATIVO:     { bg: "rgba(200,16,46,.1)",   text: IEQ.red,   border: "rgba(200,16,46,.3)"   },
  AFASTADO:    { bg: "rgba(253,184,19,.12)", text: "#C48C00", border: "rgba(253,184,19,.35)" },
  TRANSFERIDO: { bg: "rgba(0,61,165,.1)",    text: IEQ.blue,  border: "rgba(0,61,165,.3)"    },
  FALECIDO:    { bg: "rgba(100,100,100,.1)", text: "#666",    border: "rgba(100,100,100,.3)" },
};

const estadoCivilOptions = [
  { value: "SOLTEIRO",      label: "Solteiro(a)"   },
  { value: "CASADO",        label: "Casado(a)"     },
  { value: "DIVORCIADO",    label: "Divorciado(a)" },
  { value: "VIUVO",         label: "Viúvo(a)"      },
  { value: "UNIAO_ESTAVEL", label: "União Estável" },
];

const statusOptions = ["ATIVO", "INATIVO", "AFASTADO", "TRANSFERIDO", "FALECIDO"];

const grauEscolaridadeOptions = [
  { value: "",                        label: "Não informado"                },
  { value: "EDUCACAO_INFANTIL",       label: "Educação Infantil"            },
  { value: "ENSINO_FUNDAMENTAL_I",    label: "Ensino Fundamental I (1-5º)"  },
  { value: "ENSINO_FUNDAMENTAL_II",   label: "Ensino Fundamental II (6-9º)" },
  { value: "ENSINO_MEDIO",            label: "Ensino Médio"                 },
  { value: "ENSINO_MEDIO_INCOMPLETO", label: "Ensino Médio Incompleto"      },
  { value: "TECNICO",                 label: "Técnico"                      },
  { value: "SUPERIOR_INCOMPLETO",     label: "Superior Incompleto"          },
  { value: "SUPERIOR_COMPLETO",       label: "Superior Completo"            },
  { value: "POS_GRADUACAO",           label: "Pós-Graduação / MBA"          },
  { value: "MESTRADO",                label: "Mestrado"                     },
  { value: "DOUTORADO",               label: "Doutorado"                    },
];

const tipoArrolamentoOptions = [
  { value: "",                label: "Não informado"    },
  { value: "PROFISSAO_DE_FE", label: "Profissão de Fé" },
  { value: "TRANSFERENCIA",   label: "Transferência"   },
];

// ✅ nomeConjuge sem acento, uf adicionado
const formInicial = {
  nome: "", email: "", telefone: "", cpf: "", rg: "",
  estadoCivil: "SOLTEIRO", status: "ATIVO",
  dataNascimento: "", dataConversao: "", dataBatismo: "",
  celulaId: null,
  /* Filiação */
  nomeMae: "", nomePai: "", nomeConjuge: "", naturalidade: "",
  /* Escolaridade / profissão */
  grauEscolaridade: "", curso: "", profissao: "",
  /* Endereço detalhado */
  endereco: "", numero: "", bairro: "", cidade: "", cep: "", uf: "",
  /* Espiritual */
  pertenceOutraReligiao: false, qualReligiao: "",
  batizadoNasAguas: false, dataBatizadoNasAguas: "", igrejaBatizadoNasAguas: "",
  batizadoEspiritoSanto: false,
  /* Arrolamento */
  tipoArrolamento: "", jurisdicaoArrolamento: "", arroladoPor: "",
  /* Outros */
  observacoes: "",
};

/* ─── Helpers de Data ─────────────────────────────────────────────────── */
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
  const d = m.slice(0, 2), mo = m.slice(2, 4), y = m.slice(4, 8);
  if (+d < 1 || +d > 31 || +mo < 1 || +mo > 12) return "";
  return `${y}-${mo}-${d}`;
}

function isoParaBr(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, mo, d] = iso.split("-");
  return `${d}/${mo}/${y}`;
}

function mascaraData(valor) {
  const nums = valor.replace(/\D/g, "").slice(0, 8);
  if (nums.length <= 2) return nums;
  if (nums.length <= 4) return `${nums.slice(0,2)}/${nums.slice(2)}`;
  return `${nums.slice(0,2)}/${nums.slice(2,4)}/${nums.slice(4)}`;
}

function prepararFormParaEnvio(form) {
  const dados = { ...form };
  if (!dados.celulaId)             delete dados.celulaId;
  if (!dados.dataNascimento)       dados.dataNascimento       = null;
  if (!dados.dataConversao)        dados.dataConversao        = null;
  if (!dados.dataBatismo)          dados.dataBatismo          = null;
  if (!dados.dataBatizadoNasAguas) dados.dataBatizadoNasAguas = null;
  if (!dados.tipoArrolamento)      dados.tipoArrolamento      = null;
  if (!dados.nome || dados.nome.trim() === "") throw new Error("Nome completo é obrigatório");
  return dados;
}

/* ─── DateInput ──────────────────────────────────────────────────────── */
function DateInput({ value, onChange, className = "", isDark = false, ...rest }) {
  const [texto, setTexto] = useState(isoParaBr(value));
  const nativeRef = useRef(null);

  useEffect(() => { setTexto(isoParaBr(value)); }, [value]);

  const handleTexto = (e) => {
    const mascarado = mascaraData(e.target.value);
    setTexto(mascarado);
    const iso = brParaIso(mascarado);
    onChange(iso || (mascarado === "" ? "" : ""));
  };

  const handleNative = (e) => {
    const iso = e.target.value;
    onChange(iso);
    setTexto(isoParaBr(iso));
  };

  const abrirCalendario = () => {
    if (nativeRef.current) {
      nativeRef.current.showPicker?.();
      nativeRef.current.click();
    }
  };

  return (
      <div style={{ position: "relative" }}>
        <input
            {...rest}
            className={className}
            value={texto}
            onChange={handleTexto}
            placeholder="DD/MM/AAAA"
            inputMode="numeric"
            maxLength={10}
            style={{ paddingRight: 38, ...(rest.style || {}) }}
        />
        <button
            type="button"
            onClick={abrirCalendario}
            title="Abrir calendário"
            style={{
              position: "absolute", right: 10, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              padding: 2, display: "flex", alignItems: "center", justifyContent: "center",
              color: isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.4)",
            }}
        >
          <CalendarDays size={16} />
        </button>
        <input
            ref={nativeRef}
            type="date"
            value={value || ""}
            onChange={handleNative}
            tabIndex={-1}
            style={{
              position: "absolute", opacity: 0, pointerEvents: "none",
              top: 0, left: 0, width: "100%", height: "100%",
            }}
        />
      </div>
  );
}

/* ─── SectionTitle ──────────────────────────────────────────────────── */
function SectionTitle({ icon: Icon, label, color, isDark }) {
  return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px", borderRadius: 8,
        background: isDark ? `${color}12` : `${color}0D`,
        border: `1px solid ${color}30`,
        marginBottom: 2,
      }}>
        <Icon size={13} style={{ color, flexShrink: 0 }} />
        <span style={{
          fontFamily: "'Cinzel',serif", fontSize: 8.5, fontWeight: 700,
          letterSpacing: ".2em", color, textTransform: "uppercase",
        }}>
        {label}
      </span>
      </div>
  );
}

/* ─── CheckRow ──────────────────────────────────────────────────────── */
function CheckRow({ label, checked, onChange, isDark, textSec }) {
  return (
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 2px" }}>
        <div
            onClick={onChange}
            style={{
              width: 20, height: 20, borderRadius: 5, flexShrink: 0,
              border: `2px solid ${checked ? IEQ.blue : (isDark ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.2)")}`,
              background: checked ? IEQ.blue : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .18s",
            }}
        >
          {checked && <span style={{ color: "#fff", fontSize: 12, lineHeight: 1 }}>✓</span>}
        </div>
        <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: textSec }}>
        {label}
      </span>
      </label>
  );
}

/* ─── Modal ───────────────────────────────────────────────────────────── */
function MembroModal({
                       isDark, editandoId, form, setForm,
                       onSalvar, onExcluir, onFechar,
                       nomeCelula, nomeLider,
                     }) {
  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const bg          = isDark ? "#0f0a0c" : "#ffffff";
  const border      = isDark ? "rgba(200,16,46,.18)" : "rgba(200,16,46,.14)";
  const inputBg     = isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.03)";
  const sectionBg   = isDark ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.018)";

  const f = v => setForm(p => ({ ...p, ...v }));

  const css = `
    .mf-wrap {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; flex-direction: column;
      background: ${bg}; font-family: 'EB Garamond', serif; color: ${textPrimary};
    }
    .mf-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; border-bottom: 1px solid ${border};
      flex-shrink: 0; background: ${bg};
    }
    .mf-body {
      flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      padding: 20px 20px max(20px, env(safe-area-inset-bottom, 20px));
      display: flex; flex-direction: column; gap: 10px;
    }
    .mf-field {
      width: 100%; box-sizing: border-box;
      background: ${inputBg};
      border: 1px solid ${isDark ? "rgba(200,16,46,.22)" : "rgba(200,16,46,.18)"};
      color: ${textPrimary}; padding: 11px 14px; border-radius: 8px;
      outline: none; font-family: 'EB Garamond', serif; font-size: 15px;
      transition: border-color .2s, box-shadow .2s;
      -webkit-appearance: none; appearance: none;
    }
    .mf-field:focus { border-color: ${IEQ.red}; box-shadow: 0 0 0 3px rgba(200,16,46,.1); }
    .mf-field::placeholder { color: ${isDark ? "rgba(245,240,232,.25)" : "rgba(26,10,13,.28)"}; }
    textarea.mf-field { resize: vertical; min-height: 80px; }
    select.mf-field { color: ${textPrimary}; }
    select.mf-field option {
      background: ${isDark ? "#1a0e11" : "#ffffff"};
      color: ${isDark ? IEQ.offWhite : "#1A0A0D"};
    }
    .mf-label {
      font-family: 'Cinzel', serif; font-size: 8px; letter-spacing: .2em;
      text-transform: uppercase; color: ${textSec}; display: block; margin-bottom: 5px;
    }
    .mf-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .mf-grid3 { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px; }
    @media(max-width:400px) {
      .mf-grid2 { grid-template-columns: 1fr; }
      .mf-grid3 { grid-template-columns: 1fr; }
    }
    .mf-section {
      padding: 14px; border-radius: 10px;
      background: ${sectionBg};
      border: 1px solid ${isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"};
      display: flex; flex-direction: column; gap: 12px;
    }
    .mf-btn-save {
      width: 100%; padding: 14px; border-radius: 8px; border: none; cursor: pointer;
      background: linear-gradient(135deg, ${IEQ.blueDark}, ${IEQ.blue});
      color: #fff; font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700; letter-spacing: .16em;
    }
    .mf-btn-del {
      width: 100%; padding: 10px; border: none; cursor: pointer; background: none;
      color: ${IEQ.red}; font-family: 'Cinzel', serif;
      font-size: 9px; font-weight: 700; letter-spacing: .14em;
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    .mf-celula-badge {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; border-radius: 10px;
      background: ${isDark ? "rgba(253,184,19,.07)" : "rgba(253,184,19,.08)"};
      border: 1px solid ${isDark ? "rgba(253,184,19,.25)" : "rgba(253,184,19,.3)"};
    }
    .mf-celula-badge-empty {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; border-radius: 10px;
      background: ${isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.03)"};
      border: 1px solid ${isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"};
    }
  `;

  const renderCelulaBadge = () => {
    if (!editandoId) return null;
    if (nomeCelula) {
      return (
          <div className="mf-celula-badge">
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: `linear-gradient(135deg, ${IEQ.yellow}55, ${IEQ.yellow}22)`,
              border: `1px solid ${IEQ.yellow}88`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Users size={15} style={{ color: "#C48C00" }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".2em", color: "#C48C00", margin: "0 0 2px", textTransform: "uppercase" }}>
                CÉLULA VINCULADA
              </p>
              <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 15, fontWeight: 600, color: textPrimary, margin: "0 0 2px" }}>
                {nomeCelula}
              </p>
              {nomeLider && (
                  <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: textSec, margin: 0 }}>
                    Líder: {nomeLider}
                  </p>
              )}
            </div>
          </div>
      );
    }
    return (
        <div className="mf-celula-badge-empty">
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)",
            border: `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Users size={15} style={{ color: textSec }} />
          </div>
          <div>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".2em", color: textSec, margin: "0 0 2px", textTransform: "uppercase" }}>
              CÉLULA VINCULADA
            </p>
            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, fontStyle: "italic", color: textSec, margin: 0 }}>
              Nenhuma célula cadastrada
            </p>
          </div>
        </div>
    );
  };

  const content = (
      <>
        <style>{css}</style>
        <motion.div
            className="mf-wrap"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28 }}
        >
          {/* Header */}
          <div className="mf-header">
            <button
                onClick={onFechar}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: textSec, display: "flex", alignItems: "center", gap: 6,
                  fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".14em",
                }}
            >
              <X size={18} /> VOLTAR
            </button>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700, letterSpacing: ".14em", color: textPrimary, margin: 0 }}>
                {editandoId ? "EDITAR PERFIL" : "NOVO CADASTRO"}
              </h2>
              <div style={{
                height: 2, width: 32,
                background: `linear-gradient(90deg,${IEQ.blue},${IEQ.yellow})`,
                borderRadius: 99, marginTop: 5, marginLeft: "auto",
              }} />
            </div>
          </div>

          <form className="mf-body" onSubmit={onSalvar}>

            {renderCelulaBadge()}

            {/* ── 1. IDENTIFICAÇÃO ── */}
            <SectionTitle icon={User} label="Identificação" color={IEQ.blue} isDark={isDark} />
            <div className="mf-section">
              <div>
                <label className="mf-label">NOME COMPLETO *</label>
                <input required className="mf-field"
                       value={form.nome} onChange={e => f({ nome: e.target.value })} />
              </div>
              <div className="mf-grid2">
                <div>
                  <label className="mf-label">CPF</label>
                  <input className="mf-field" placeholder="000.000.000-00"
                         value={form.cpf} onChange={e => f({ cpf: e.target.value })} />
                </div>
                <div>
                  <label className="mf-label">RG</label>
                  <input className="mf-field" placeholder="0000000"
                         value={form.rg} onChange={e => f({ rg: e.target.value })} />
                </div>
              </div>
              <div className="mf-grid2">
                <div>
                  <label className="mf-label">NASCIMENTO</label>
                  <DateInput className="mf-field" isDark={isDark}
                             value={form.dataNascimento} onChange={v => f({ dataNascimento: v })} />
                </div>
                <div>
                  <label className="mf-label">NATURALIDADE</label>
                  <input className="mf-field" placeholder="Cidade/UF"
                         value={form.naturalidade} onChange={e => f({ naturalidade: e.target.value })} />
                </div>
              </div>
              <div className="mf-grid2">
                <div>
                  <label className="mf-label">ESTADO CIVIL</label>
                  <select className="mf-field"
                          value={form.estadoCivil} onChange={e => f({ estadoCivil: e.target.value })}>
                    {estadoCivilOptions.map(o =>
                        <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mf-label">STATUS</label>
                  <select className="mf-field"
                          value={form.status} onChange={e => f({ status: e.target.value })}>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="mf-grid2">
                <div>
                  <label className="mf-label">WHATSAPP</label>
                  <input className="mf-field"
                         value={form.telefone} onChange={e => f({ telefone: e.target.value })} />
                </div>
                <div>
                  <label className="mf-label">E-MAIL</label>
                  <input type="email" className="mf-field"
                         value={form.email} onChange={e => f({ email: e.target.value })} />
                </div>
              </div>
            </div>

            {/* ── 2. FILIAÇÃO ── */}
            <SectionTitle icon={Users} label="Filiação & Família" color="#7C3AED" isDark={isDark} />
            <div className="mf-section">
              <div className="mf-grid2">
                <div>
                  <label className="mf-label">NOME DA MÃE</label>
                  <input className="mf-field"
                         value={form.nomeMae} onChange={e => f({ nomeMae: e.target.value })} />
                </div>
                <div>
                  <label className="mf-label">NOME DO PAI</label>
                  <input className="mf-field"
                         value={form.nomePai} onChange={e => f({ nomePai: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="mf-label">NOME DO CÔNJUGE</label>
                {/* ✅ nomeConjuge sem acento */}
                <input className="mf-field"
                       value={form.nomeConjuge} onChange={e => f({ nomeConjuge: e.target.value })} />
              </div>
            </div>

            {/* ── 3. ENDEREÇO ── */}
            <SectionTitle icon={MapPin} label="Endereço" color="#059669" isDark={isDark} />
            <div className="mf-section">
              <div>
                <label className="mf-label">CEP</label>
                <div style={{ position: "relative" }}>
                  <input
                      className="mf-field"
                      placeholder="00000-000"
                      inputMode="numeric"
                      maxLength={9}
                      value={form.cep}
                      onChange={e => {
                        const nums = e.target.value.replace(/\D/g, "").slice(0, 8);
                        const masked = nums.length > 5 ? `${nums.slice(0,5)}-${nums.slice(5)}` : nums;
                        setForm(p => ({ ...p, cep: masked, _cepStatus: nums.length === 8 ? "buscando" : "" }));
                        if (nums.length === 8) {
                          fetch(`https://viacep.com.br/ws/${nums}/json/`)
                              .then(r => r.json())
                              .then(d => {
                                if (!d.erro) {
                                  setForm(p => ({
                                    ...p,
                                    endereco:   d.logradouro || p.endereco,
                                    bairro:     d.bairro     || p.bairro,
                                    cidade:     d.localidade || p.cidade,
                                    uf:         d.uf         || p.uf,   // ✅ preenche UF automaticamente
                                    _cepStatus: "ok",
                                  }));
                                } else {
                                  setForm(p => ({ ...p, _cepStatus: "erro" }));
                                }
                              })
                              .catch(() => setForm(p => ({ ...p, _cepStatus: "erro" })));
                        }
                      }}
                      style={{ paddingRight: 38 }}
                  />
                  {form._cepStatus === "buscando" ? (
                      <Loader2 size={15} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#059669", animation: "spin 1s linear infinite" }} />
                  ) : form._cepStatus === "ok" ? (
                      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#059669", fontSize: 16, pointerEvents: "none" }}>✓</span>
                  ) : form._cepStatus === "erro" ? (
                      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: IEQ.red, fontSize: 13, pointerEvents: "none" }}>CEP não encontrado</span>
                  ) : (
                      <MapPin size={15} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#059669", opacity: 0.4, pointerEvents: "none" }} />
                  )}
                </div>
                <p style={{
                  fontFamily: "'EB Garamond',serif", fontSize: 12,
                  color: form._cepStatus === "ok" ? "#059669" : isDark ? "rgba(245,240,232,.3)" : "rgba(26,10,13,.3)",
                  margin: "4px 0 0 2px",
                }}>
                  {form._cepStatus === "ok"
                      ? "✓ Endereço preenchido automaticamente"
                      : "Digite o CEP para preencher o endereço automaticamente"}
                </p>
              </div>

              <div className="mf-grid3">
                <div>
                  <label className="mf-label">LOGRADOURO</label>
                  <input className="mf-field" placeholder="Rua, Av..."
                         value={form.endereco} onChange={e => f({ endereco: e.target.value })} />
                </div>
                <div>
                  <label className="mf-label">Nº</label>
                  <input className="mf-field"
                         value={form.numero} onChange={e => f({ numero: e.target.value })} />
                </div>
                <div>
                  <label className="mf-label">UF / ESTADO</label>
                  {/* ✅ uf sem acento */}
                  <input className="mf-field" placeholder="Ex: BA"
                         value={form.uf ?? ""} onChange={e => f({ uf: e.target.value.toUpperCase() })} maxLength={2} />
                </div>
              </div>

              <div className="mf-grid2">
                <div>
                  <label className="mf-label">BAIRRO</label>
                  <input className="mf-field"
                         value={form.bairro} onChange={e => f({ bairro: e.target.value })} />
                </div>
                <div>
                  <label className="mf-label">CIDADE</label>
                  <input className="mf-field"
                         value={form.cidade} onChange={e => f({ cidade: e.target.value })} />
                </div>
              </div>
            </div>

            {/* ── 4. ESCOLARIDADE & PROFISSÃO ── */}
            <SectionTitle icon={BookOpen} label="Escolaridade & Profissão" color="#D97706" isDark={isDark} />
            <div className="mf-section">
              <div className="mf-grid2">
                <div>
                  <label className="mf-label">GRAU DE ESCOLARIDADE</label>
                  <select className="mf-field"
                          value={form.grauEscolaridade} onChange={e => f({ grauEscolaridade: e.target.value })}>
                    {grauEscolaridadeOptions.map(o =>
                        <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mf-label">CURSO</label>
                  <input className="mf-field" placeholder="Ex: Administração"
                         value={form.curso} onChange={e => f({ curso: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="mf-label">PROFISSÃO</label>
                <input className="mf-field"
                       value={form.profissao} onChange={e => f({ profissao: e.target.value })} />
              </div>
            </div>

            {/* ── 5. JORNADA ESPIRITUAL ── */}
            <SectionTitle icon={Heart} label="Jornada Espiritual" color={IEQ.blue} isDark={isDark} />
            <div className="mf-section">
              <div className="mf-grid2">
                <div>
                  <label className="mf-label">DATA CONVERSÃO</label>
                  <DateInput className="mf-field" isDark={isDark}
                             value={form.dataConversao} onChange={v => f({ dataConversao: v })} />
                </div>
                <div>
                  <label className="mf-label">DATA BATISMO (E. Santo)</label>
                  <DateInput className="mf-field" isDark={isDark}
                             value={form.dataBatismo} onChange={v => f({ dataBatismo: v })} />
                </div>
              </div>

              <CheckRow
                  label="Pertence (ou pertenceu) a outra religião?"
                  checked={!!form.pertenceOutraReligiao}
                  onChange={() => f({ pertenceOutraReligiao: !form.pertenceOutraReligiao, qualReligiao: !form.pertenceOutraReligiao ? form.qualReligiao : "" })}
                  isDark={isDark} textSec={textSec}
              />
              <AnimatePresence>
                {form.pertenceOutraReligiao && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}
                    >
                      <label className="mf-label">QUAL RELIGIÃO?</label>
                      <input className="mf-field"
                             value={form.qualReligiao} onChange={e => f({ qualReligiao: e.target.value })} />
                    </motion.div>
                )}
              </AnimatePresence>

              <CheckRow
                  label="Batizado(a) nas águas?"
                  checked={!!form.batizadoNasAguas}
                  onChange={() => f({ batizadoNasAguas: !form.batizadoNasAguas })}
                  isDark={isDark} textSec={textSec}
              />
              <AnimatePresence>
                {form.batizadoNasAguas && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: 10 }}
                    >
                      <div className="mf-grid2">
                        <div>
                          <label className="mf-label">DATA DO BATISMO NAS ÁGUAS</label>
                          <DateInput className="mf-field" isDark={isDark}
                                     value={form.dataBatizadoNasAguas} onChange={v => f({ dataBatizadoNasAguas: v })} />
                        </div>
                        <div>
                          <label className="mf-label">NA IGREJA</label>
                          <input className="mf-field"
                                 value={form.igrejaBatizadoNasAguas} onChange={e => f({ igrejaBatizadoNasAguas: e.target.value })} />
                        </div>
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>

              <CheckRow
                  label="Batizado(a) no Espírito Santo?"
                  checked={!!form.batizadoEspiritoSanto}
                  onChange={() => f({ batizadoEspiritoSanto: !form.batizadoEspiritoSanto })}
                  isDark={isDark} textSec={textSec}
              />
            </div>

            {/* ── 6. ARROLAMENTO ── */}
            <SectionTitle icon={Star} label="Arrolamento" color={IEQ.red} isDark={isDark} />
            <div className="mf-section">
              <div>
                <label className="mf-label">ARROLADO POR</label>
                <select className="mf-field"
                        value={form.tipoArrolamento} onChange={e => f({ tipoArrolamento: e.target.value })}>
                  {tipoArrolamentoOptions.map(o =>
                      <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="mf-grid2">
                <div>
                  <label className="mf-label">NOME DE QUEM ARROLOU</label>
                  <input className="mf-field"
                         value={form.arroladoPor} onChange={e => f({ arroladoPor: e.target.value })} />
                </div>
                <div>
                  <label className="mf-label">JURISDIÇÃO</label>
                  <input className="mf-field" placeholder="Ex: Sede, Região Norte..."
                         value={form.jurisdicaoArrolamento} onChange={e => f({ jurisdicaoArrolamento: e.target.value })} />
                </div>
              </div>
            </div>

            {/* ── 7. OBSERVAÇÕES ── */}
            <SectionTitle icon={FileText} label="Observações" color={textSec} isDark={isDark} />
            <div className="mf-section">
              <div>
                <label className="mf-label">OBSERVAÇÕES GERAIS</label>
                <textarea className="mf-field"
                          value={form.observacoes} onChange={e => f({ observacoes: e.target.value })}
                          placeholder="Informações adicionais..." />
              </div>
            </div>

            {/* ── Botões ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
              <button type="submit" className="mf-btn-save">
                {editandoId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR CADASTRO"}
              </button>
              {editandoId && (
                  <button type="button" className="mf-btn-del" onClick={onExcluir}>
                    <Trash2 size={13} /> EXCLUIR REGISTRO
                  </button>
              )}
            </div>

          </form>
        </motion.div>
      </>
  );

  return createPortal(content, document.body);
}

/* ─── Componente Principal ───────────────────────────────────────────── */
export default function Membros({ isDark = false }) {
  const [membros,        setMembros]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [editandoId,     setEditandoId]     = useState(null);
  const [statusOriginal, setStatusOriginal] = useState(null);
  const [filtro,         setFiltro]         = useState("");
  const [form,           setForm]           = useState(formInicial);
  const [nomeCelula,     setNomeCelula]     = useState(null);
  const [nomeLider,      setNomeLider]      = useState(null);

  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const cardBg      = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
  const border      = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";
  const inputBg     = isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)";

  const baseStyles = `
    @keyframes spin { to { transform: rotate(360deg) } }
    .spin-icon { animation: spin 1s linear infinite; }
    .ieq-field {
      width: 100%; box-sizing: border-box;
      background: ${inputBg};
      border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      color: ${textPrimary}; padding: 11px 14px; border-radius: 8px;
      outline: none; font-family: 'EB Garamond', serif; font-size: 15px; transition: all .25s;
    }
    .ieq-field:focus { border-color: ${IEQ.red}; box-shadow: 0 0 0 3px rgba(200,16,46,.12); }
    .ieq-field::placeholder { color: ${isDark ? "rgba(245,240,232,.25)" : "rgba(26,10,13,.3)"}; }
    .ieq-member-card {
      background: ${cardBg}; border: 1px solid ${border}; border-radius: 12px;
      padding: 18px; cursor: pointer; transition: all .3s; backdrop-filter: blur(24px);
    }
    .ieq-member-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px rgba(200,16,46,.12); border-color: ${IEQ.red};
    }
    .ieq-grid-m { display: grid; grid-template-columns: 1fr; gap: 12px; }
    @media(min-width:560px) { .ieq-grid-m { grid-template-columns: repeat(2,1fr); } }
    @media(min-width:900px) { .ieq-grid-m { grid-template-columns: repeat(3,1fr); } }
  `;

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await api.get("/membros");
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setMembros(data);
    } catch (err) {
      console.error("Erro ao listar membros:", err);
      setMembros([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { listar(); }, [listar]);

  const abrirNovo = () => {
    setEditandoId(null); setStatusOriginal(null);
    setNomeCelula(null); setNomeLider(null);
    setForm(formInicial); setIsModalOpen(true);
  };

  const abrirEdicao = (m) => {
    setEditandoId(m.id); setStatusOriginal(m.status);
    setNomeCelula(m.nomeCelula ?? null); setNomeLider(m.nomeLider ?? null);
    setForm({
      nome:                   m.nome            ?? "",
      email:                  m.email           ?? "",
      telefone:               m.telefone        ?? "",
      cpf:                    m.cpf             ?? "",
      rg:                     m.rg              ?? "",
      estadoCivil:            m.estadoCivil     ?? "SOLTEIRO",
      status:                 m.status          ?? "ATIVO",
      celulaId:               m.celulaId        ?? null,
      dataNascimento:         formatarDataInput(m.dataNascimento),
      dataConversao:          formatarDataInput(m.dataConversao),
      dataBatismo:            formatarDataInput(m.dataBatismo),
      /* Filiação */
      nomeMae:                m.nomeMae         ?? "",
      nomePai:                m.nomePai         ?? "",
      nomeConjuge:            m.nomeConjuge     ?? "",  // ✅ sem acento
      naturalidade:           m.naturalidade    ?? "",
      /* Escolaridade */
      grauEscolaridade:       m.grauEscolaridade        ?? "",
      curso:                  m.curso                   ?? "",
      profissao:              m.profissao               ?? "",
      /* Endereço */
      endereco:               m.endereco        ?? "",
      numero:                 m.numero          ?? "",
      bairro:                 m.bairro          ?? "",
      cidade:                 m.cidade          ?? "",
      cep:                    m.cep             ?? "",
      uf:                     m.uf              ?? "",  // ✅ adicionado
      /* Espiritual */
      pertenceOutraReligiao:  m.pertenceOutraReligiao  ?? false,
      qualReligiao:           m.qualReligiao           ?? "",
      batizadoNasAguas:       m.batizadoNasAguas       ?? false,
      dataBatizadoNasAguas:   formatarDataInput(m.dataBatizadoNasAguas),
      igrejaBatizadoNasAguas: m.igrejaBatizadoNasAguas ?? "",
      batizadoEspiritoSanto:  m.batizadoEspiritoSanto  ?? false,
      /* Arrolamento */
      tipoArrolamento:        m.tipoArrolamento        ?? "",
      jurisdicaoArrolamento:  m.jurisdicaoArrolamento  ?? "",
      arroladoPor:            m.arroladoPor            ?? "",
      /* Outros */
      observacoes:            m.observacoes            ?? "",
    });
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false); setEditandoId(null);
    setNomeCelula(null); setNomeLider(null);
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      const dados = prepararFormParaEnvio(form);
      if (editandoId) {
        if (form.status !== statusOriginal) {
          if (!window.confirm("Alterar o status removerá o membro de células. Continuar?")) return;
          await api.put(`/membros/${editandoId}/status`, null, { params: { status: form.status } });
        }
        await api.put(`/membros/${editandoId}`, dados);
      } else {
        await api.post("/membros", dados);
      }
      fecharModal(); listar();
    } catch (err) {
      const mensagem = err.response?.data?.message || err.response?.data?.error || err.message || "Erro desconhecido";
      console.error("❌ Erro ao salvar:", err);
      alert(`Erro ao salvar:\n\n${mensagem}`);
    }
  };

  const excluir = async () => {
    if (!window.confirm("Excluir permanentemente?")) return;
    try {
      await api.delete(`/membros/${editandoId}`);
      fecharModal(); listar();
    } catch (err) {
      const mensagem = err.response?.data?.message || err.response?.data?.error || err.message;
      console.error("❌ Erro ao excluir:", err);
      alert(`Erro ao excluir:\n\n${mensagem}`);
    }
  };

  const membrosFiltrados = membros
      .filter(m =>
          m.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
          m.cpf?.includes(filtro) ||
          m.nomeCelula?.toLowerCase().includes(filtro.toLowerCase())
      )
      .sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR", { sensitivity: "base" }));

  return (
      <div style={{ padding: "24px 20px", fontFamily: "'EB Garamond',serif", color: textPrimary }}>
        <style>{baseStyles}</style>

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, background: `${IEQ.blue}22`,
                display: "flex", alignItems: "center", justifyContent: "center", color: IEQ.blue,
              }}>
                <User size={20} />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700, letterSpacing: ".16em", color: textPrimary, margin: 0 }}>MEMBRESIA</h3>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".18em", color: textSec, margin: 0 }}>{membros.length} REGISTROS</p>
              </div>
            </div>
            <button onClick={abrirNovo} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "11px 20px",
              borderRadius: 8, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})`,
              color: "#fff", fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, letterSpacing: ".16em",
            }}>
              <Plus size={15} /> NOVO MEMBRO
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: IEQ.red, opacity: .6 }} />
            <input
                className="ieq-field"
                style={{ paddingLeft: 42 }}
                placeholder="Buscar por nome, CPF ou célula..."
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
            />
          </div>
        </div>

        {/* Cards */}
        {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <Loader2 size={30} className="spin-icon" style={{ color: IEQ.blue, display: "inline-block" }} />
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".2em", color: textSec, marginTop: 12 }}>CARREGANDO...</p>
            </div>
        ) : (
            <motion.div
                className="ieq-grid-m"
                initial="hidden" animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: .05 } } }}
            >
              {membrosFiltrados.map(m => {
                const sc = STATUS_COLORS[m.status] || STATUS_COLORS.INATIVO;
                return (
                    <motion.div
                        key={m.id}
                        className="ieq-member-card"
                        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
                        onClick={() => abrirEdicao(m)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                          background: `linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16,
                        }}>
                          {m.nome?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h4 style={{
                            fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700,
                            letterSpacing: ".1em", color: textPrimary, margin: "0 0 5px",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {m.nome?.toUpperCase()}
                          </h4>
                          <span style={{
                            display: "inline-flex", alignItems: "center",
                            padding: "2px 10px", borderRadius: 99,
                            background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                            fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 700, letterSpacing: ".14em",
                          }}>
                      {m.status}
                    </span>
                        </div>
                        <ChevronRight size={15} style={{ color: textSec, flexShrink: 0 }} />
                      </div>

                      <div style={{ borderTop: `1px solid ${border}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                        {m.nomeCelula && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Users size={13} style={{ color: "#C48C00", flexShrink: 0 }} />
                              <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: "#C48C00", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.nomeCelula}
                      </span>
                            </div>
                        )}
                        {m.profissao && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Briefcase size={13} style={{ color: textSec, flexShrink: 0 }} />
                              <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.profissao}
                      </span>
                            </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <CreditCard size={13} style={{ color: textSec, flexShrink: 0 }} />
                          <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textSec }}>
                      {m.cpf || "CPF não informado"}
                    </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Phone size={13} style={{ color: textSec, flexShrink: 0 }} />
                          <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textSec }}>
                      {m.telefone || "Sem telefone"}
                    </span>
                        </div>
                      </div>
                    </motion.div>
                );
              })}
            </motion.div>
        )}

        <AnimatePresence>
          {isModalOpen && (
              <MembroModal
                  isDark={isDark}
                  editandoId={editandoId}
                  form={form}
                  setForm={setForm}
                  onSalvar={salvar}
                  onExcluir={excluir}
                  onFechar={fecharModal}
                  nomeCelula={nomeCelula}
                  nomeLider={nomeLider}
              />
          )}
        </AnimatePresence>
      </div>
  );
}
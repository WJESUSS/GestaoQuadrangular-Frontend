import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Plus, X, User, Phone, Trash2, Loader2, Search,
  CreditCard, Heart, ChevronRight, Users, CalendarDays,
  MapPin, BookOpen, Briefcase, Cross, Star, FileText,
  ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, Filter, ChevronDown,
  Download,
} from "lucide-react";

/* ─── AURA Design Tokens (igual ao Dashboard) ─────────────────────── */
const AURA = {
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  dark:      "#0A0A0F",
  darkEl:    "#12121A",
  light:     "#F5F0E8",
  red:       "#C8102E",
  redDark:   "#9B0B1E",
  blue:      "#003DA5",
  blueDark:  "#002470",
  yellow:    "#FDB813",
};

function themeMembers(isDark) {
  return {
    bg:          isDark ? "#0A0A0F"               : "#F5F0E8",
    bgEl:        isDark ? "rgba(18,18,26,.95)"     : "rgba(255,255,255,.95)",
    bgInput:     isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.1)"   : "rgba(201,169,110,.2)",
    borderInput: isDark ? "rgba(201,169,110,.15)"  : "rgba(201,169,110,.28)",
    text:        isDark ? "#F5F0E8"                : "#1A1008",
    textSec:     isDark ? "#9A9588"                : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"                : "#9A9080",
    glow1:       isDark ? "rgba(201,169,110,.05)"  : "rgba(201,169,110,.08)",
    glow2:       isDark ? "rgba(201,169,110,.04)"  : "rgba(201,169,110,.06)",
    cardHover:   isDark ? "rgba(201,169,110,.2)"   : "rgba(201,169,110,.35)",
    placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
  };
}

const STATUS_COLORS = {
  ATIVO:       { bg: "rgba(5,150,105,.12)",  text: "#059669", border: "rgba(5,150,105,.3)"   },
  INATIVO:     { bg: "rgba(200,16,46,.1)",   text: AURA.red,   border: "rgba(200,16,46,.3)"   },
  AFASTADO:    { bg: "rgba(253,184,19,.12)", text: "#C48C00", border: "rgba(253,184,19,.35)" },
  TRANSFERIDO: { bg: "rgba(0,61,165,.1)",    text: AURA.blue,  border: "rgba(0,61,165,.3)"    },
  FALECIDO:    { bg: "rgba(100,100,100,.1)", text: "#666",    border: "rgba(100,100,100,.3)" },
};

const statusOptions = ["ATIVO", "INATIVO", "AFASTADO", "TRANSFERIDO", "FALECIDO"];

const STATUS_LABELS = {
  ATIVO:       "Ativos",
  INATIVO:     "Inativos",
  AFASTADO:    "Afastados",
  TRANSFERIDO: "Transferidos",
  FALECIDO:    "Falecidos",
};

const estadoCivilOptions = [
  { value: "SOLTEIRO",      label: "Solteiro(a)"   },
  { value: "CASADO",        label: "Casado(a)"     },
  { value: "DIVORCIADO",    label: "Divorciado(a)" },
  { value: "VIUVO",         label: "Viúvo(a)"      },
  { value: "UNIAO_ESTAVEL", label: "União Estável" },
];

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
  { value: "",             label: "Não informado"    },
  { value: "PROFISSAO_DE_FE", label: "Profissão de Fé" },
  { value: "TRANSFERENCIA",   label: "Transferência"   },
  { value: "ACLAMACAO",       label: "Aclamação"       },
];

/* ─── Cargos (NOVO) ────────────────────────────────────────────────
   Enum de cargos que um membro pode assumir na igreja. Um membro pode
   ter zero, um ou vários cargos simultaneamente — por isso é um
   multi-select que grava um array de strings (`cargos: string[]`). */
const cargoOptions = [
  { value: "DIACONO",                          label: "Diácono"                    },
  { value: "DIREITO_DIACONATO",                label: "Direito ao Diaconato"       },
  { value: "LIDER_GRUPO_MISSIONARIO_HOMEM",    label: "Líder GM — Homens"          },
  { value: "LIDER_GRUPO_MISSIONARIO_MULHER",   label: "Líder GM — Mulheres"        },
  { value: "LIDER_GRUPO_MISSIONARIO_CRIANCA",  label: "Líder GM — Crianças"        },
  { value: "LIDER_GRUPO_MISSIONARIO_JOVEM",    label: "Líder GM — Jovens"          },
  { value: "LIDER",                            label: "Líder"                      },
  { value: "SECRETARIA",                       label: "Secretaria"                 },
  { value: "TESOURARIA_FINANCEIRO",            label: "Tesouraria / Financeiro"    },
  { value: "LIDER_GRUPO_CASAIS",               label: "Líder Grupo de Casais"      },
];

const CARGO_LABELS = cargoOptions.reduce((acc, o) => {
  acc[o.value] = o.label;
  return acc;
}, {});

const formInicial = {
  nome: "", email: "", telefone: "", cpf: "", rg: "",
  estadoCivil: "SOLTEIRO", status: "ATIVO",
  dataNascimento: "", dataConversao: "", dataBatismo: "",
  celulaId: null,
  nomeMae: "", nomePai: "", nomeConjuge: "", naturalidade: "",
  grauEscolaridade: "", curso: "", profissao: "",
  endereco: "", numero: "", bairro: "", cidade: "", cep: "", uf: "",
  pertenceOutraReligiao: false, qualReligiao: "",
  batizadoNasAguas: false, dataBatizadoNasAguas: "", igrejaBatizadoNasAguas: "",
  batizadoEspiritoSanto: false,
  tipoArrolamento: "", jurisdicaoArrolamento: "", arroladoPor: "",
  cargos: [],
  observacoes: "",
  // ✅ NOVO: motivo da última mudança de status (somente leitura na ficha,
  // preenchido a partir do que vem do backend em `abrirEdicao`)
  observacaoStatus: "",
  dataAtualizacaoStatus: null,
};

/* ─── Mensagens personalizadas por mudança de status ──────────────── */
function primeiroNomeDe(nomeCompleto) {
  return (nomeCompleto || "").trim().split(" ")[0] || "Membro";
}

function mensagemStatus(status, nomeCompleto) {
  const nome = primeiroNomeDe(nomeCompleto);
  switch (status) {
    case "ATIVO":
      return `${nome} está ativo novamente! 🎉`;
    case "INATIVO":
      return `${nome} foi marcado como inativo.`;
    case "AFASTADO":
      return `${nome} está afastado no momento.`;
    case "TRANSFERIDO":
      return `${nome} foi transferido de igreja.`;
    case "FALECIDO":
      return `Que a memória de ${nome} seja em bênção. 🕊️`;
    default:
      return `Status de ${nome} atualizado.`;
  }
}

function confirmacaoStatus(status, nomeCompleto) {
  const nome = nomeCompleto?.trim() || "este membro";
  switch (status) {
    case "ATIVO":
      return `Reativar ${nome}? Ele voltará a constar como membro ativo.`;
    case "INATIVO":
      return `Inativar ${nome}? Ele será removido de células ativas.`;
    case "AFASTADO":
      return `Marcar ${nome} como afastado? Ele será removido de células ativas até retornar.`;
    case "TRANSFERIDO":
      return `Marcar ${nome} como transferido? Ele será removido das células atuais.`;
    case "FALECIDO":
      return `Registrar o falecimento de ${nome}? Ele será removido de todas as vinculações ativas.`;
    default:
      return `Alterar o status de ${nome}? Isso pode removê-lo de células ativas.`;
  }
}

function tituloConfirmacaoStatus(status) {
  switch (status) {
    case "ATIVO":       return "Reativar membro?";
    case "INATIVO":     return "Inativar membro?";
    case "AFASTADO":     return "Marcar como afastado?";
    case "TRANSFERIDO": return "Marcar como transferido?";
    case "FALECIDO":    return "Registrar falecimento?";
    default:            return "Alterar status?";
  }
}

/* ─── Helpers de Data ─────────────────────────────────────────────── */
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
  dados.cargos = Array.isArray(dados.cargos) ? dados.cargos : [];
  if (!dados.nome || dados.nome.trim() === "") throw new Error("Nome completo é obrigatório");

  // ✅ CRÍTICO: observacaoStatus e dataAtualizacaoStatus são campos
  // somente-leitura no front — quem grava neles de verdade é o endpoint
  // dedicado PUT /membros/{id}/status (MembroService.alterarStatus).
  // Se mandássemos esses campos também no PUT /membros/{id} normal, o
  // backend (copiarDtoParaEntidade -> membro.setObservacaoStatus(...))
  // sobrescreveria com o valor ANTIGO (carregado quando a ficha abriu),
  // apagando a observação que acabou de ser salva pela troca de status.
  delete dados.observacaoStatus;
  delete dados.dataAtualizacaoStatus;

  return dados;
}

/* ─── Helper: deduplica array pelo campo id ───────────────────────── */
function deduplicarPorId(lista) {
  const seen = new Set();
  return lista.filter(m => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

/* ─── Helper: gera e baixa o PDF da lista de membros ──────────────── */
function cargosParaTexto(m) {
  return (m.cargos || []).map(c => CARGO_LABELS[c] || c).join(", ");
}

function nascimentoParaTexto(m) {
  const br = isoParaBr(formatarDataInput(m.dataNascimento));
  return br || "-";
}

function gerarPdfMembros(lista, tipo) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const dataGeracao = new Date().toLocaleDateString("pt-BR");

  doc.setFontSize(15);
  doc.setTextColor(26, 16, 8);
  doc.text("Lista de Membros", 40, 36);

  doc.setFontSize(9);
  doc.setTextColor(107, 94, 74);
  doc.text(
      `Gerado em ${dataGeracao} — ${lista.length} membro${lista.length === 1 ? "" : "s"} — Relatório ${tipo === "completo" ? "completo" : "simples"}`,
      40, 52
  );

  // ✅ Lista simples: só Nome, Telefone e uma coluna "Assinatura" com uma
  // linha desenhada dentro da célula (não é mais só espaço em branco).
  const colunasSimples = ["Nome", "Telefone", "Assinatura"];
  const colunasCompletas = [
    "Nome", "CPF", "RG", "Status", "Estado Civil", "Nascimento",
    "Telefone", "E-mail", "Célula", "Endereço", "Cidade/UF", "Profissão", "Cargos",
  ];

  const linhas = lista.map(m => {
    if (tipo === "simples") {
      return [
        m.nome || "-",
        m.telefone || "-",
        "", // ✅ coluna de assinatura: conteúdo vazio, a linha é desenhada abaixo
      ];
    }
    return [
      m.nome || "-",
      m.cpf || "-",
      m.rg || "-",
      m.status || "-",
      m.estadoCivil || "-",
      nascimentoParaTexto(m),
      m.telefone || "-",
      m.email || "-",
      m.nomeCelula || "-",
      [m.endereco, m.numero].filter(Boolean).join(", ") || "-",
      [m.cidade, m.uf].filter(Boolean).join("/") || "-",
      m.profissao || "-",
      cargosParaTexto(m) || "-",
    ];
  });

  autoTable(doc, {
    startY: 64,
    head: [tipo === "simples" ? colunasSimples : colunasCompletas],
    body: linhas,
    styles: { fontSize: 7.5, cellPadding: 4, textColor: [26, 16, 8], minCellHeight: tipo === "simples" ? 28 : undefined },
    headStyles: { fillColor: [0, 61, 165], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 240, 232] },
    margin: { left: 40, right: 40 },
    // ✅ Reserva bastante largura para a coluna de assinatura (índice 2 no
    // relatório simples) e a deixa sempre em branco/sem preenchimento de fundo.
    columnStyles: tipo === "simples"
        ? { 2: { cellWidth: 200, fillColor: [255, 255, 255] } }
        : undefined,
    // ✅ Desenha uma linha física dentro da célula de assinatura, para o
    // membro assinar em cima dela (em vez de deixar só um espaço vazio).
    didDrawCell: (data) => {
      if (tipo === "simples" && data.column.index === 2 && data.row.section === "body") {
        const margemLateral = 10;
        const yLinha = data.cell.y + data.cell.height - 7;
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.5);
        doc.line(
            data.cell.x + margemLateral,
            yLinha,
            data.cell.x + data.cell.width - margemLateral,
            yLinha
        );
      }
    },
  });

  const nomeArquivo = `membros_${tipo}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(nomeArquivo);
}

/* ─── DateInput ──────────────────────────────────────────────────── */
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
            onClick={() => nativeRef.current?.showPicker?.()}
            title="Abrir calendário"
            style={{
              position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
              color: AURA.gold,
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

/* ─── GlobalStyles ────────────────────────────────────────────────── */
function GlobalStylesMembers({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes dl-spin   { to { transform: rotate(360deg); } }
      @keyframes dl-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes dl-blink  { 0%,100%{opacity:1;} 50%{opacity:.3;} }

      .dl-spin   { animation: dl-spin  1s linear infinite; }
      .dl-pulse  { animation: dl-pulse 3s ease-in-out infinite; }
      .dl-blink  { animation: dl-blink 2s ease-in-out infinite; }

      .mem-root {
        font-family: 'Inter', sans-serif;
        background: ${t.bg};
        color: ${t.text};
        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
        padding-bottom: max(40px, env(safe-area-inset-bottom, 40px));
        transition: background .3s, color .3s;
      }
      
      .mem-glow {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
          radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%);
        transition: background .3s;
      }
      
      .mem-content {
        position: relative; z-index: 1;
        max-width: 960px; margin: 0 auto;
        padding: 20px 16px 0;
      }
      @media(max-width: 420px) { .mem-content { padding: 16px 12px 0; } }

      .mem-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
      }
      
      .mem-header-left {
        display: flex; align-items: center; gap: 12px; flex: 1;
      }
      
      .mem-title-block {
        flex: 1; min-width: 0;
      }
      
      .mem-eyebrow {
        font-size: 9px; font-weight: 500; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(201,169,110,.55);
        margin: 0 0 3px;
      }
      
      .mem-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(17px, 4vw, 22px);
        font-weight: 500; color: ${t.text};
        margin: 0; line-height: 1.2;
      }
      
      .mem-btn-ico {
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${t.border};
        border-radius: 12px; width: 38px; height: 38px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        color: ${t.textMuted}; transition: all .25s; flex-shrink: 0;
      }
      .mem-btn-ico:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

      .mem-search-row {
        display: flex; align-items: flex-start; gap: 8px;
        margin-bottom: 12px;
      }

      .mem-search-wrap {
        position: relative; flex: 1; min-width: 0;
      }

      .mem-filter-btn {
        position: relative; flex-shrink: 0;
        width: 48px; height: 48px; border-radius: 13px;
        background: ${t.bgInput};
        border: 1px solid ${t.borderInput};
        color: ${t.textMuted}; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all .25s;
      }
      .mem-filter-btn:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }
      .mem-filter-btn.active { border-color: ${AURA.gold}; color: ${AURA.gold}; background: rgba(201,169,110,.08); }

      .mem-filter-dot {
        position: absolute; top: 7px; right: 7px;
        width: 8px; height: 8px; border-radius: 50%;
        border: 2px solid ${t.bgEl};
      }

      .mem-filter-chip {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 7px 8px 7px 14px; border-radius: 100px;
        font-family: 'Inter', sans-serif; font-size: 11.5px; font-weight: 500;
        margin-bottom: 16px;
      }

      .mem-filter-chip button {
        background: rgba(0,0,0,.12);
        border: none; border-radius: 50%;
        width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: inherit;
      }

      .mem-filter-pills {
        display: flex; flex-direction: column; gap: 8px;
        width: 100%; margin: 6px 0 18px;
      }

      .mem-filter-pill {
        display: flex; align-items: center; justify-content: space-between;
        padding: 13px 16px; border-radius: 13px;
        border: 1px solid ${t.borderInput};
        background: ${t.bgInput};
        cursor: pointer; transition: all .2s;
      }
      .mem-filter-pill:hover { border-color: rgba(201,169,110,.4); }

      .mem-filter-pill-label {
        display: flex; align-items: center; gap: 10px;
        font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 500;
        color: ${t.text};
      }

      .mem-filter-dot-lg {
        width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
      }

      .mem-search-icon {
        position: absolute; left: 14px; top: 50%;
        transform: translateY(-50%); color: ${AURA.gold}; opacity: .5;
        pointer-events: none;
      }
      
      .mem-input {
        width: 100%; box-sizing: border-box;
        background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 13px 16px 13px 44px;
        border-radius: 13px; outline: none;
        font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
        transition: all .25s; -webkit-appearance: none; appearance: none;
      }
      .mem-input:focus {
        border-color: rgba(201,169,110,.5);
        background: rgba(201,169,110,.04);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .mem-input::placeholder { color: ${t.placeholder}; }

      .mem-btn-gold {
        display: flex; align-items: center; gap: 7px;
        padding: 11px 20px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight});
        color: #0A0A0F; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; transition: all .35s;
        box-shadow: 0 6px 22px rgba(201,169,110,.22); flex-shrink: 0;
      }
      .mem-btn-gold:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(201,169,110,.32); }

      .mem-btn-gold:disabled {
        opacity: .5; cursor: not-allowed; transform: none;
      }

      .mem-btn-outline {
        display: flex; align-items: center; justify-content: center; gap: 7px;
        width: 100%; padding: 13px 20px; border-radius: 13px;
        border: 1px solid ${t.borderInput};
        background: ${t.bgInput};
        color: ${t.text}; font-family: 'Inter', sans-serif;
        font-size: 11px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; cursor: pointer; transition: all .25s;
        margin-top: 12px;
      }
      .mem-btn-outline:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }
      .mem-btn-outline:disabled { opacity: .5; cursor: not-allowed; }

      /* ── Sentinela do scroll infinito ── */
      .mem-scroll-sentinel {
        display: flex; align-items: center; justify-content: center;
        gap: 8px;
        padding: 18px 0 6px;
        min-height: 40px;
        font-size: 11px; font-weight: 300; color: ${t.textMuted};
      }

      .mem-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-left: 3px solid transparent;
        border-radius: 16px; overflow: hidden; margin-bottom: 12px;
        backdrop-filter: blur(24px); position: relative; cursor: pointer;
        transition: all .35s cubic-bezier(.4,0,.2,1);
      }
      .mem-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }
      .mem-card:active {
        transform: scale(.98);
        box-shadow: 0 8px 24px rgba(0,0,0,${isDark ? ".3" : ".1"});
      }

      .mem-card-inner {
        padding: 16px 18px;
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px;
      }

      .mem-card-avatar {
        width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
        background: linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark});
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-family: 'Playfair Display', serif;
        font-weight: 600; font-size: 18px;
        transition: background .35s;
      }

      .mem-card-content {
        flex: 1; min-width: 0;
      }

      .mem-card-name {
        font-size: 13px; font-weight: 500; color: ${t.text};
        margin: 0 0 6px; overflow: hidden;
        text-overflow: ellipsis; white-space: nowrap;
      }

      .mem-card-meta {
        display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      }

      .mem-badge {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 10px; border-radius: 6px;
        font-size: 9px; font-weight: 600; letter-spacing: .1em;
        text-transform: uppercase;
      }

      .mem-badge-cargo {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 10px; border-radius: 6px;
        font-size: 9px; font-weight: 600; letter-spacing: .06em;
        text-transform: uppercase;
        background: rgba(0,61,165,.1);
        color: ${AURA.blue};
        border: 1px solid rgba(0,61,165,.28);
      }

      .mem-card-obs {
        margin-top: 6px;
        font-size: 10px; font-weight: 300; color: ${t.textMuted};
        overflow: hidden; text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
      }

      .mem-card-arrow {
        color: ${t.textMuted}; flex-shrink: 0;
      }

      .mem-grid {
        display: flex; flex-direction: column; gap: 10px;
      }

      .mem-empty {
        text-align: center; padding: 48px 20px;
      }

      .mem-empty-icon {
        width: 64px; height: 64px; border-radius: 16px;
        background: rgba(201,169,110,.1);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 16px;
        color: ${AURA.gold};
      }

      .mem-empty-text {
        font-size: 13px; font-weight: 300; color: ${t.textMuted};
        margin: 0;
      }

      .mem-loading {
        min-height: 60vh; display: flex;
        align-items: center; justify-content: center;
      }

      .mem-info-bar {
        text-align: center; padding: 10px 0 4px;
        font-size: 11px; font-weight: 300; color: ${t.textMuted};
      }

      /* ── Toast de mudança de status ── */
      .mem-toast {
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        z-index: 10100; max-width: min(92vw, 380px);
        display: flex; align-items: center; gap: 10px;
        padding: 13px 18px; border-radius: 14px;
        background: ${t.bgEl};
        box-shadow: 0 14px 34px rgba(0,0,0,${isDark ? ".45" : ".18"});
        font-family: 'Inter', sans-serif; font-size: 12.5px; font-weight: 500;
        color: ${t.text};
        backdrop-filter: blur(18px);
      }

      .mem-toast-dot {
        width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
      }

      .mem-modal-backdrop {
        position: fixed; inset: 0; z-index: 9999;
        display: flex; align-items: flex-end; justify-content: center;
      }
      @media(min-width: 520px) {
        .mem-modal-backdrop { align-items: center; padding: 16px; }
      }
      
      .mem-modal-overlay {
        position: fixed; inset: 0;
        background: rgba(10,10,15,.88); z-index: 0;
        backdrop-filter: blur(4px);
      }
      
      .mem-modal-box {
        position: relative; z-index: 10;
        width: 100%; max-height: 88vh;
        display: flex; flex-direction: column;
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 24px 24px 0 0; overflow: hidden;
      }
      @media(min-width: 520px) {
        .mem-modal-box {
          border-radius: 24px; max-width: 520px;
          max-height: calc(100vh - 32px);
        }
      }

      .mem-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 20px 22px; border-bottom: 1px solid ${t.border};
        flex-shrink: 0;
      }

      .mem-modal-title {
        font-family: 'Playfair Display', serif;
        font-size: 18px; font-weight: 500; color: ${t.text};
        margin: 0;
      }

      .mem-modal-eyebrow {
        font-size: 9px; font-weight: 600; letter-spacing: .18em;
        text-transform: uppercase; color: rgba(0,61,165,.6);
        margin: 0 0 3px;
      }

      .mem-modal-title-row {
        display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      }

      .mem-modal-body {
        flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        padding: 22px 20px;
        display: flex; flex-direction: column; gap: 16px;
      }

      .mem-form-section {
        padding: 16px; border-radius: 12px;
        background: ${isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)"};
        border: 1px solid ${t.border};
        display: flex; flex-direction: column; gap: 12px;
      }

      .mem-form-label {
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; color: ${t.textSec};
        display: block; margin-bottom: 6px;
      }

      .mem-form-field {
        width: 100%; box-sizing: border-box;
        background: ${t.bgInput};
        border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 11px 14px; border-radius: 10px;
        outline: none; font-family: 'Inter', sans-serif; font-size: 14px;
        transition: all .25s; -webkit-appearance: none; appearance: none;
      }
      .mem-form-field:focus {
        border-color: rgba(201,169,110,.5);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .mem-form-field::placeholder { color: ${t.placeholder}; }
      select.mem-form-field { color: ${t.text}; }
      select.mem-form-field option {
        background: ${isDark ? "#12121A" : "#F5F0E8"};
        color: ${t.text};
      }

      .mem-form-grid2 {
        display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      }
      @media(max-width: 480px) { .mem-form-grid2 { grid-template-columns: 1fr; } }

      .mem-form-textarea {
        width: 100%; box-sizing: border-box; resize: vertical;
        background: ${t.bgInput};
        border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 12px 14px;
        border-radius: 10px; outline: none; min-height: 100px;
        font-family: 'Inter', sans-serif; font-size: 14px;
        transition: all .25s;
      }
      .mem-form-textarea:focus {
        border-color: rgba(201,169,110,.5);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .mem-form-textarea::placeholder { color: ${t.placeholder}; }
      .mem-form-textarea:disabled { opacity: .6; cursor: not-allowed; }

      .mem-form-actions {
        display: flex; gap: 10px; padding-top: 8px;
      }

      .mem-btn-save {
        flex: 1; padding: 13px; border-radius: 10px; border: none;
        background: linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; cursor: pointer; transition: all .3s;
        display: flex; align-items: center; justify-content: center; gap: 6px;
      }
      .mem-btn-save:hover { opacity: .9; transform: translateY(-1px); }
      .mem-btn-save:disabled { opacity: .6; cursor: not-allowed; transform: none; }

      .mem-btn-delete {
        flex: 1; padding: 13px; border-radius: 10px; border: none;
        background: rgba(200,16,46,.12);
        color: ${AURA.red}; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; cursor: pointer; transition: all .3s;
        display: flex; align-items: center; justify-content: center; gap: 6px;
      }
      .mem-btn-delete:hover { background: rgba(200,16,46,.2); }
      .mem-btn-delete:disabled { opacity: .6; cursor: not-allowed; }

      .mem-section-title {
        font-family: 'Playfair Display', serif;
        font-size: 13px; font-weight: 500; color: ${t.text};
        margin: 8px 0 0;
      }

      .mem-check-row {
        display: flex; align-items: center; gap: 10px; padding: 8px 0;
      }

      .mem-checkbox {
        width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0;
        border: 2px solid ${t.borderInput};
        background: transparent;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .2s;
      }
      .mem-checkbox.checked {
        background: ${AURA.blue};
        border-color: ${AURA.blue};
        color: #fff;
      }

      .mem-checkbox-label {
        font-family: 'Inter', sans-serif; font-size: 14px;
        color: ${t.text}; cursor: pointer;
      }

      /* ── Multi-select de cargos (dropdown) ── */
      .mem-cargo-select {
        position: relative;
      }

      .mem-cargo-selected-chips {
        display: flex; flex-wrap: wrap; gap: 6px;
        margin-bottom: 8px;
      }

      .mem-cargo-chip {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 8px 6px 12px; border-radius: 100px;
        background: rgba(0,61,165,.1);
        border: 1px solid rgba(0,61,165,.3);
        color: ${AURA.blue};
        font-family: 'Inter', sans-serif; font-size: 11.5px; font-weight: 500;
      }

      .mem-cargo-chip button {
        background: rgba(0,61,165,.14);
        border: none; border-radius: 50%;
        width: 17px; height: 17px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: inherit; padding: 0;
      }
      .mem-cargo-chip button:hover { background: rgba(0,61,165,.25); }

      .mem-cargo-select-trigger {
        width: 100%; box-sizing: border-box;
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
        background: ${t.bgInput};
        border: 1px solid ${t.borderInput};
        color: ${t.textMuted};
        padding: 11px 14px; border-radius: 10px;
        font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 400;
        cursor: pointer; transition: all .2s; text-align: left;
      }
      .mem-cargo-select-trigger:hover,
      .mem-cargo-select-trigger.open {
        border-color: rgba(0,61,165,.45);
      }
      .mem-cargo-select-trigger .chevron {
        flex-shrink: 0; transition: transform .2s; color: ${AURA.blue};
      }
      .mem-cargo-select-trigger.open .chevron { transform: rotate(180deg); }

      .mem-cargo-select-panel {
        position: absolute; z-index: 20;
        top: calc(100% + 6px); left: 0; right: 0;
        max-height: 240px; overflow-y: auto;
        background: ${t.bgEl};
        border: 1px solid rgba(0,61,165,.3);
        border-radius: 12px;
        box-shadow: 0 14px 34px rgba(0,0,0,${isDark ? ".45" : ".18"});
        padding: 6px;
        display: flex; flex-direction: column; gap: 2px;
      }

      .mem-cargo-option {
        display: flex; align-items: center; gap: 10px;
        padding: 10px 10px; border-radius: 8px;
        cursor: pointer; transition: background .15s;
        font-family: 'Inter', sans-serif; font-size: 13px;
        color: ${t.text};
      }
      .mem-cargo-option:hover { background: ${isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)"}; }
      .mem-cargo-option.selected { color: ${AURA.blue}; font-weight: 500; }

      .mem-cargo-option-check {
        width: 18px; height: 18px; border-radius: 5px; flex-shrink: 0;
        border: 2px solid ${t.borderInput};
        display: flex; align-items: center; justify-content: center;
        color: #fff; transition: all .15s;
      }
      .mem-cargo-option.selected .mem-cargo-option-check {
        background: ${AURA.blue}; border-color: ${AURA.blue};
      }

      /* ── Modal de Confirmação de Exclusão ── */
      .mem-confirm-backdrop {
        position: fixed; inset: 0; z-index: 10050;
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
      }

      .mem-confirm-overlay {
        position: fixed; inset: 0;
        background: rgba(10,10,15,.92); z-index: 0;
        backdrop-filter: blur(4px);
      }

      .mem-confirm-box {
        position: relative; z-index: 10;
        width: 100%; max-width: 380px;
        background: ${t.bgEl}; border: 1px solid rgba(200,16,46,.25);
        border-radius: 20px; padding: 28px 24px 24px;
        display: flex; flex-direction: column; align-items: center;
        text-align: center;
      }

      .mem-confirm-icon {
        width: 56px; height: 56px; border-radius: 14px;
        background: rgba(200,16,46,.12);
        display: flex; align-items: center; justify-content: center;
        color: ${AURA.red}; margin-bottom: 16px;
      }

      .mem-confirm-title {
        font-family: 'Playfair Display', serif;
        font-size: 17px; font-weight: 500; color: ${t.text};
        margin: 0 0 8px;
      }

      .mem-confirm-text {
        font-family: 'Inter', sans-serif;
        font-size: 13px; font-weight: 300; line-height: 1.6;
        color: ${t.textSec}; margin: 0 0 4px;
      }

      .mem-confirm-name {
        font-weight: 600; color: ${t.text};
      }

      .mem-confirm-warning {
        font-family: 'Inter', sans-serif;
        font-size: 11px; font-weight: 500; letter-spacing: .04em;
        color: ${AURA.red}; margin: 10px 0 20px;
        display: flex; align-items: center; gap: 6px;
      }

      /* ── Bloco de erro (vínculo impedindo exclusão) ── */
      .mem-confirm-error-box {
        width: 100%; box-sizing: border-box;
        background: rgba(200,16,46,.08);
        border: 1px solid rgba(200,16,46,.25);
        border-radius: 12px;
        padding: 12px 14px;
        margin: 6px 0 20px;
        display: flex; gap: 10px; text-align: left;
      }

      .mem-confirm-error-text {
        font-family: 'Inter', sans-serif;
        font-size: 12.5px; font-weight: 400; line-height: 1.5;
        color: ${AURA.red}; margin: 0;
      }

      .mem-confirm-actions {
        display: flex; gap: 10px; width: 100%;
      }

      .mem-confirm-btn-cancel {
        flex: 1; padding: 13px; border-radius: 10px;
        border: 1px solid ${t.borderInput};
        background: ${t.bgInput};
        color: ${t.text}; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; cursor: pointer; transition: all .25s;
      }
      .mem-confirm-btn-cancel:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }
      .mem-confirm-btn-cancel:disabled { opacity: .5; cursor: not-allowed; }

      .mem-confirm-btn-delete {
        flex: 1; padding: 13px; border-radius: 10px; border: none;
        background: linear-gradient(135deg, ${AURA.red}, ${AURA.redDark});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; cursor: pointer; transition: all .25s;
        display: flex; align-items: center; justify-content: center; gap: 6px;
      }
      .mem-confirm-btn-delete:hover { opacity: .9; transform: translateY(-1px); }
      .mem-confirm-btn-delete:disabled { opacity: .6; cursor: not-allowed; transform: none; }

      /* ── Modal de Confirmação de Status (novo) ── */
      .mem-status-icon {
        width: 56px; height: 56px; border-radius: 14px;
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 16px;
      }

      /* ── Ações do header (Novo + Baixar PDF) ── */
      .mem-header-actions {
        display: flex; align-items: center; gap: 8px; flex-shrink: 0;
      }

      .mem-btn-pdf {
        display: flex; align-items: center; gap: 7px;
        padding: 11px 18px; border-radius: 100px; cursor: pointer;
        background: ${t.bgInput};
        border: 1px solid ${t.borderInput};
        color: ${t.text}; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .1em;
        text-transform: uppercase; transition: all .25s; flex-shrink: 0;
      }
      .mem-btn-pdf:hover { border-color: ${AURA.blue}; color: ${AURA.blue}; }
      .mem-btn-pdf:disabled { opacity: .55; cursor: not-allowed; }

      /* ── Opções do modal "Baixar PDF" ── */
      .mem-export-option {
        width: 100%; box-sizing: border-box;
        display: flex; align-items: center; gap: 12px;
        padding: 14px 16px; border-radius: 13px;
        border: 1px solid ${t.borderInput};
        background: ${t.bgInput};
        cursor: pointer; transition: all .2s; text-align: left;
      }
      .mem-export-option:hover { border-color: ${AURA.blue}; background: rgba(0,61,165,.06); }
      .mem-export-option:disabled { opacity: .55; cursor: not-allowed; }

      .mem-export-option-icon {
        width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
        background: rgba(0,61,165,.12); color: ${AURA.blue};
        display: flex; align-items: center; justify-content: center;
      }

      .mem-export-option-title {
        font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
        color: ${t.text}; margin: 0 0 2px;
      }

      .mem-export-option-desc {
        font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 300;
        color: ${t.textMuted}; margin: 0;
      }

      /* ── Bloco de observação do status atual (NOVO) ── */
      .mem-status-obs-box {
        display: flex; gap: 10px; align-items: flex-start;
        padding: 14px 16px; border-radius: 12px;
        border: 1px solid; margin: 0;
      }

      .mem-status-obs-icon {
        width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }

      .mem-status-obs-title {
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700;
        letter-spacing: .1em; text-transform: uppercase;
        margin: 0 0 4px;
      }

      .mem-status-obs-text {
        font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 400;
        line-height: 1.5; margin: 0;
      }

      .mem-status-obs-date {
        font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 400;
        margin: 6px 0 0; opacity: .75;
      }
    `}</style>
  );
}

/* ─── Modal ───────────────────────────────────────────────────────── */
function MembroModalRefatorado({
                                 isDark, editandoId, form, setForm,
                                 onSalvar, onExcluir, onFechar,
                                 nomeCelula, nomeLider, loading
                               }) {
  const t = themeMembers(isDark);

  const f = v => setForm(p => ({ ...p, ...v }));

  const toggleCargo = (valor) => {
    setForm(p => {
      const atual = Array.isArray(p.cargos) ? p.cargos : [];
      const jaSelecionado = atual.includes(valor);
      return {
        ...p,
        cargos: jaSelecionado
            ? atual.filter(c => c !== valor)
            : [...atual, valor],
      };
    });
  };

  const removerCargo = (valor) => {
    setForm(p => ({ ...p, cargos: (p.cargos || []).filter(c => c !== valor) }));
  };

  // ✅ Dropdown de cargos: abre a lista só quando o usuário clica no
  // campo, em vez de mostrar todas as opções soltas na tela o tempo todo.
  const [cargoDropdownAberto, setCargoDropdownAberto] = useState(false);
  const cargoSelectRef = useRef(null);

  useEffect(() => {
    if (!cargoDropdownAberto) return;
    const aoClicarFora = (e) => {
      if (cargoSelectRef.current && !cargoSelectRef.current.contains(e.target)) {
        setCargoDropdownAberto(false);
      }
    };
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [cargoDropdownAberto]);

  // ✅ NOVO: formata a data/hora da última mudança de status, se existir,
  // para mostrar junto da observação (ex: "Atualizado em 17/08/2026 às 14:32").
  const dataStatusFormatada = (() => {
    if (!form.dataAtualizacaoStatus) return "";
    try {
      const d = new Date(form.dataAtualizacaoStatus);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  })();

  // ✅ NOVO: só faz sentido mostrar o card de observação quando o membro
  // está editando (já existe) e há uma observação de status registrada.
  const scStatusAtual = STATUS_COLORS[form.status] || STATUS_COLORS.INATIVO;
  const temObservacaoStatus = Boolean(editandoId) && Boolean((form.observacaoStatus || "").trim());

  const content = (
      <motion.div
          className="mem-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onFechar}
      >
        <motion.div
            className="mem-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onFechar}
        />
        <motion.div
            className="mem-modal-box"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "tween", duration: 0.28 }}
            onClick={e => e.stopPropagation()}
        >
          <div className="mem-modal-header">
            <div style={{ flex: 1, minWidth: 0 }}>
              {editandoId && <p className="mem-modal-eyebrow">Editar Perfil</p>}
              <div className="mem-modal-title-row">
                <h2 className="mem-modal-title">
                  {editandoId ? (form.nome || "Sem nome") : "Novo Membro"}
                </h2>
                {editandoId && (form.cargos || []).map(c => (
                    <span key={c} className="mem-badge-cargo">
                      {CARGO_LABELS[c] || c}
                    </span>
                ))}
              </div>
            </div>
            <button
                onClick={onFechar}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: t.textMuted, display: "flex", padding: 0,
                  transition: "color .2s", flexShrink: 0,
                }}
            >
              <X size={20} />
            </button>
          </div>

          <form className="mem-modal-body" onSubmit={onSalvar}>

            {/* ── NOVO: Observação do status atual (motivo do afastamento,
                transferência, etc.) — sempre visível ao abrir a ficha ── */}
            {temObservacaoStatus && (
                <motion.div
                    className="mem-status-obs-box"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: scStatusAtual.bg,
                      borderColor: scStatusAtual.border,
                    }}
                >
                  <div className="mem-status-obs-icon" style={{ background: `${scStatusAtual.text}1F`, color: scStatusAtual.text }}>
                    <AlertCircle size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="mem-status-obs-title" style={{ color: scStatusAtual.text }}>
                      Motivo — {STATUS_LABELS[form.status] || form.status}
                    </p>
                    <p className="mem-status-obs-text" style={{ color: t.text }}>
                      {form.observacaoStatus}
                    </p>
                    {dataStatusFormatada && (
                        <p className="mem-status-obs-date" style={{ color: scStatusAtual.text }}>
                          Atualizado em {dataStatusFormatada}
                        </p>
                    )}
                  </div>
                </motion.div>
            )}

            {nomeCelula && editandoId && (
                <motion.div
                    className="mem-form-section"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: `linear-gradient(135deg, ${AURA.gold}12, ${AURA.gold}08)`,
                      border: `1px solid ${AURA.gold}40`,
                    }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Users size={16} style={{ color: AURA.gold, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: AURA.gold, margin: "0 0 2px" }}>
                        CÉLULA VINCULADA
                      </p>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 500, color: t.text, margin: 0 }}>
                        {nomeCelula}
                      </p>
                      {nomeLider && (
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: t.textMuted, margin: "2px 0 0" }}>
                            Líder: {nomeLider}
                          </p>
                      )}
                    </div>
                  </div>
                </motion.div>
            )}

            {/* ── Identificação ── */}
            <div>
              <p className="mem-section-title">Identificação</p>
              <div className="mem-form-section">
                <div>
                  <label className="mem-form-label">NOME COMPLETO *</label>
                  <input required className="mem-form-field"
                         value={form.nome} onChange={e => f({ nome: e.target.value })} />
                </div>
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">CPF</label>
                    <input className="mem-form-field"
                           value={form.cpf} onChange={e => f({ cpf: e.target.value })} />
                  </div>
                  <div>
                    <label className="mem-form-label">RG</label>
                    <input className="mem-form-field"
                           value={form.rg} onChange={e => f({ rg: e.target.value })} />
                  </div>
                </div>
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">NASCIMENTO</label>
                    <DateInput className="mem-form-field" isDark={isDark}
                               value={form.dataNascimento} onChange={v => f({ dataNascimento: v })} />
                  </div>
                  <div>
                    <label className="mem-form-label">ESTADO CIVIL</label>
                    <select className="mem-form-field"
                            value={form.estadoCivil} onChange={e => f({ estadoCivil: e.target.value })}>
                      {estadoCivilOptions.map(o =>
                          <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">WHATSAPP</label>
                    <input className="mem-form-field"
                           value={form.telefone} onChange={e => f({ telefone: e.target.value })} />
                  </div>
                  <div>
                    <label className="mem-form-label">E-MAIL</label>
                    <input type="email" className="mem-form-field"
                           value={form.email} onChange={e => f({ email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="mem-form-label">STATUS</label>
                  <select className="mem-form-field"
                          value={form.status} onChange={e => f({ status: e.target.value })}>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Filiação ── */}
            <div>
              <p className="mem-section-title">Filiação & Família</p>
              <div className="mem-form-section">
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">MÃE</label>
                    <input className="mem-form-field"
                           value={form.nomeMae} onChange={e => f({ nomeMae: e.target.value })} />
                  </div>
                  <div>
                    <label className="mem-form-label">PAI</label>
                    <input className="mem-form-field"
                           value={form.nomePai} onChange={e => f({ nomePai: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="mem-form-label">CÔNJUGE</label>
                  <input className="mem-form-field"
                         value={form.nomeConjuge} onChange={e => f({ nomeConjuge: e.target.value })} />
                </div>
                <div>
                  <label className="mem-form-label">NATURALIDADE</label>
                  <input className="mem-form-field"
                         value={form.naturalidade} onChange={e => f({ naturalidade: e.target.value })} />
                </div>
              </div>
            </div>

            {/* ── Endereço ── */}
            <div>
              <p className="mem-section-title">Endereço</p>
              <div className="mem-form-section">
                <div>
                  <label className="mem-form-label">CEP</label>
                  <input className="mem-form-field" placeholder="00000-000" inputMode="numeric"
                         value={form.cep} onChange={e => {
                    const nums = e.target.value.replace(/\D/g, "").slice(0, 8);
                    const masked = nums.length > 5 ? `${nums.slice(0,5)}-${nums.slice(5)}` : nums;
                    setForm(p => ({ ...p, cep: masked }));
                    if (nums.length === 8) {
                      fetch(`https://viacep.com.br/ws/${nums}/json/`)
                          .then(r => r.json())
                          .then(d => {
                            if (!d.erro) {
                              setForm(p => ({
                                ...p,
                                endereco: d.logradouro || p.endereco,
                                bairro: d.bairro || p.bairro,
                                cidade: d.localidade || p.cidade,
                                uf: d.uf || p.uf,
                              }));
                            }
                          })
                          .catch(() => {});
                    }
                  }} />
                </div>
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">LOGRADOURO</label>
                    <input className="mem-form-field"
                           value={form.endereco} onChange={e => f({ endereco: e.target.value })} />
                  </div>
                  <div>
                    <label className="mem-form-label">Nº</label>
                    <input className="mem-form-field"
                           value={form.numero} onChange={e => f({ numero: e.target.value })} />
                  </div>
                </div>
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">BAIRRO</label>
                    <input className="mem-form-field"
                           value={form.bairro} onChange={e => f({ bairro: e.target.value })} />
                  </div>
                  <div>
                    <label className="mem-form-label">UF</label>
                    <input className="mem-form-field" placeholder="BA"
                           value={form.uf ?? ""} onChange={e => f({ uf: e.target.value.toUpperCase() })} maxLength={2} />
                  </div>
                </div>
                <div>
                  <label className="mem-form-label">CIDADE</label>
                  <input className="mem-form-field"
                         value={form.cidade} onChange={e => f({ cidade: e.target.value })} />
                </div>
              </div>
            </div>

            {/* ── Escolaridade ── */}
            <div>
              <p className="mem-section-title">Escolaridade & Profissão</p>
              <div className="mem-form-section">
                <div>
                  <label className="mem-form-label">GRAU DE ESCOLARIDADE</label>
                  <select className="mem-form-field"
                          value={form.grauEscolaridade} onChange={e => f({ grauEscolaridade: e.target.value })}>
                    {grauEscolaridadeOptions.map(o =>
                        <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">CURSO</label>
                    <input className="mem-form-field"
                           value={form.curso} onChange={e => f({ curso: e.target.value })} />
                  </div>
                  <div>
                    <label className="mem-form-label">PROFISSÃO</label>
                    <input className="mem-form-field"
                           value={form.profissao} onChange={e => f({ profissao: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Espiritual ── */}
            <div>
              <p className="mem-section-title">Jornada Espiritual</p>
              <div className="mem-form-section">
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">CONVERSÃO</label>
                    <DateInput className="mem-form-field" isDark={isDark}
                               value={form.dataConversao} onChange={v => f({ dataConversao: v })} />
                  </div>
                  <div>
                    <label className="mem-form-label">BATISMO (E. Santo)</label>
                    <DateInput className="mem-form-field" isDark={isDark}
                               value={form.dataBatismo} onChange={v => f({ dataBatismo: v })} />
                  </div>
                </div>

                <div className="mem-check-row">
                  <div
                      className={`mem-checkbox ${form.pertenceOutraReligiao ? "checked" : ""}`}
                      onClick={() => f({ pertenceOutraReligiao: !form.pertenceOutraReligiao, qualReligiao: !form.pertenceOutraReligiao ? form.qualReligiao : "" })}
                  >
                    {form.pertenceOutraReligiao && "✓"}
                  </div>
                  <label className="mem-checkbox-label">
                    Pertence (ou pertenceu) a outra religião?
                  </label>
                </div>

                <AnimatePresence>
                  {form.pertenceOutraReligiao && (
                      <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ overflow: "hidden" }}
                      >
                        <label className="mem-form-label">QUAL RELIGIÃO?</label>
                        <input className="mem-form-field"
                               value={form.qualReligiao} onChange={e => f({ qualReligiao: e.target.value })} />
                      </motion.div>
                  )}
                </AnimatePresence>

                <div className="mem-check-row">
                  <div
                      className={`mem-checkbox ${form.batizadoNasAguas ? "checked" : ""}`}
                      onClick={() => f({ batizadoNasAguas: !form.batizadoNasAguas })}
                  >
                    {form.batizadoNasAguas && "✓"}
                  </div>
                  <label className="mem-checkbox-label">
                    Batizado(a) nas águas?
                  </label>
                </div>

                <AnimatePresence>
                  {form.batizadoNasAguas && (
                      <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: 10 }}
                      >
                        <div>
                          <label className="mem-form-label">DATA DO BATISMO NAS ÁGUAS</label>
                          <DateInput className="mem-form-field" isDark={isDark}
                                     value={form.dataBatizadoNasAguas} onChange={v => f({ dataBatizadoNasAguas: v })} />
                        </div>
                        <div>
                          <label className="mem-form-label">NA IGREJA</label>
                          <input className="mem-form-field"
                                 value={form.igrejaBatizadoNasAguas} onChange={e => f({ igrejaBatizadoNasAguas: e.target.value })} />
                        </div>
                      </motion.div>
                  )}
                </AnimatePresence>

                <div className="mem-check-row">
                  <div
                      className={`mem-checkbox ${form.batizadoEspiritoSanto ? "checked" : ""}`}
                      onClick={() => f({ batizadoEspiritoSanto: !form.batizadoEspiritoSanto })}
                  >
                    {form.batizadoEspiritoSanto && "✓"}
                  </div>
                  <label className="mem-checkbox-label">
                    Batizado(a) no Espírito Santo?
                  </label>
                </div>
              </div>
            </div>

            {/* ── Arrolamento ── */}
            <div>
              <p className="mem-section-title">Arrolamento</p>
              <div className="mem-form-section">
                <div>
                  <label className="mem-form-label">TIPO DE ARROLAMENTO</label>
                  <select className="mem-form-field"
                          value={form.tipoArrolamento} onChange={e => f({ tipoArrolamento: e.target.value })}>
                    {tipoArrolamentoOptions.map(o =>
                        <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="mem-form-grid2">
                  <div>
                    <label className="mem-form-label">ARROLADO POR</label>
                    <input className="mem-form-field"
                           value={form.arroladoPor} onChange={e => f({ arroladoPor: e.target.value })} />
                  </div>
                  <div>
                    <label className="mem-form-label">JURISDIÇÃO</label>
                    <input className="mem-form-field"
                           value={form.jurisdicaoArrolamento} onChange={e => f({ jurisdicaoArrolamento: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Cargos (dropdown) ── */}
            <div>
              <p className="mem-section-title">Cargos</p>
              <div className="mem-form-section">
                <label className="mem-form-label">CARGOS OCUPADOS (opcional, múltipla escolha)</label>

                {(form.cargos || []).length > 0 && (
                    <div className="mem-cargo-selected-chips">
                      {form.cargos.map(c => (
                          <span key={c} className="mem-cargo-chip">
                            {CARGO_LABELS[c] || c}
                            <button type="button" onClick={() => removerCargo(c)} title="Remover">
                              <X size={11} />
                            </button>
                          </span>
                      ))}
                    </div>
                )}

                <div className="mem-cargo-select" ref={cargoSelectRef}>
                  <button
                      type="button"
                      className={`mem-cargo-select-trigger ${cargoDropdownAberto ? "open" : ""}`}
                      onClick={() => setCargoDropdownAberto(v => !v)}
                  >
                    {(form.cargos || []).length > 0
                        ? `${form.cargos.length} cargo${form.cargos.length > 1 ? "s" : ""} selecionado${form.cargos.length > 1 ? "s" : ""}`
                        : "Selecione os cargos..."}
                    <ChevronDown size={16} className="chevron" />
                  </button>

                  <AnimatePresence>
                    {cargoDropdownAberto && (
                        <motion.div
                            className="mem-cargo-select-panel"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                        >
                          {cargoOptions.map(o => {
                            const selecionado = (form.cargos || []).includes(o.value);
                            return (
                                <div
                                    key={o.value}
                                    className={`mem-cargo-option ${selecionado ? "selected" : ""}`}
                                    onClick={() => toggleCargo(o.value)}
                                >
                                  <span className="mem-cargo-option-check">
                                    {selecionado && <CheckCircle2 size={13} />}
                                  </span>
                                  {o.label}
                                </div>
                            );
                          })}
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* ── Observações ── */}
            <div>
              <p className="mem-section-title">Observações</p>
              <div className="mem-form-section">
                <label className="mem-form-label">OBSERVAÇÕES GERAIS</label>
                <textarea className="mem-form-textarea"
                          value={form.observacoes} onChange={e => f({ observacoes: e.target.value })}
                          placeholder="Informações adicionais..." />
              </div>
            </div>

            {/* ── Botões ── */}
            <div className="mem-form-actions" style={{ paddingTop: 8 }}>
              <button type="submit" className="mem-btn-save" disabled={loading}>
                {loading ? (
                    <><Loader2 size={14} className="dl-spin" /> Salvando...</>
                ) : (
                    <>{editandoId ? "Salvar" : "Cadastrar"}</>
                )}
              </button>
              {editandoId && (
                  <button type="button" className="mem-btn-delete" onClick={onExcluir} disabled={loading}>
                    <Trash2 size={14} /> Excluir
                  </button>
              )}
            </div>

          </form>
        </motion.div>
      </motion.div>
  );

  return createPortal(content, document.body);
}

/* ─── Modal de Confirmação de Exclusão ──────────────────────────── */
function ConfirmarExclusaoModal({ nomeMembro, onConfirmar, onCancelar, loading, erro }) {
  const content = (
      <motion.div
          className="mem-confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancelar}
      >
        <motion.div
            className="mem-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        />
        <motion.div
            className="mem-confirm-box"
            initial={{ scale: .92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: .92, opacity: 0, y: 10 }}
            transition={{ type: "tween", duration: 0.22 }}
            onClick={e => e.stopPropagation()}
        >
          <div className="mem-confirm-icon">
            <Trash2 size={24} />
          </div>

          <h3 className="mem-confirm-title">Excluir membro?</h3>

          <p className="mem-confirm-text">
            Você está prestes a excluir permanentemente{" "}
            <span className="mem-confirm-name">
              {nomeMembro || "este membro"}
            </span>{" "}
            do cadastro.
          </p>

          {erro ? (
              // ── Bloco de erro: vínculo impede a exclusão ──
              <div className="mem-confirm-error-box">
                <AlertCircle size={16} style={{ color: "#C8102E", flexShrink: 0, marginTop: 1 }} />
                <p className="mem-confirm-error-text">{erro}</p>
              </div>
          ) : (
              <p className="mem-confirm-warning">
                <AlertCircle size={13} />
                Essa ação não pode ser desfeita
              </p>
          )}

          <div className="mem-confirm-actions">
            <button
                type="button"
                className="mem-confirm-btn-cancel"
                onClick={onCancelar}
                disabled={loading}
            >
              {erro ? "Fechar" : "Cancelar"}
            </button>
            {!erro && (
                <button
                    type="button"
                    className="mem-confirm-btn-delete"
                    onClick={onConfirmar}
                    disabled={loading}
                >
                  {loading ? (
                      <><Loader2 size={13} className="dl-spin" /> Excluindo...</>
                  ) : (
                      <><Trash2 size={13} /> Excluir</>
                  )}
                </button>
            )}
          </div>
        </motion.div>
      </motion.div>
  );

  return createPortal(content, document.body);
}

/* ─── Modal de Confirmação de Mudança de Status (com observação opcional) ─── */
function ConfirmarStatusModal({ status, nome, onConfirmar, onCancelar, loading }) {
  const sc = STATUS_COLORS[status] || STATUS_COLORS.INATIVO;

  // ✅ observação opcional digitada no momento da confirmação de status.
  // Fica guardada localmente no modal e só é repassada pra cima quando o
  // usuário confirma a mudança (onConfirmar recebe o texto como argumento).
  const [observacao, setObservacao] = useState("");

  const content = (
      <motion.div
          className="mem-confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancelar}
      >
        <motion.div
            className="mem-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        />
        <motion.div
            className="mem-confirm-box"
            initial={{ scale: .92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: .92, opacity: 0, y: 10 }}
            transition={{ type: "tween", duration: 0.22 }}
            onClick={e => e.stopPropagation()}
            style={{ borderColor: `${sc.text}40` }}
        >
          <div className="mem-status-icon" style={{ background: sc.bg, color: sc.text }}>
            <Users size={24} />
          </div>

          <h3 className="mem-confirm-title">{tituloConfirmacaoStatus(status)}</h3>

          <p className="mem-confirm-text">
            {confirmacaoStatus(status, nome)}
          </p>

          {/* ── campo de observação opcional ── */}
          <div style={{ width: "100%", textAlign: "left", margin: "14px 0 4px" }}>
            <label className="mem-form-label">OBSERVAÇÃO (opcional)</label>
            <textarea
                className="mem-form-textarea"
                style={{ minHeight: 72 }}
                placeholder="Ex: Ausente por motivo de saúde, mudou de cidade, pedido de afastamento..."
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                disabled={loading}
            />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontWeight: 300, color: sc.text, margin: "6px 0 0" }}>
              Essa observação ficará visível na ficha do membro, explicando o motivo do status.
            </p>
          </div>

          <div className="mem-confirm-actions" style={{ marginTop: 6 }}>
            <button
                type="button"
                className="mem-confirm-btn-cancel"
                onClick={onCancelar}
                disabled={loading}
            >
              Cancelar
            </button>
            <button
                type="button"
                className="mem-confirm-btn-delete"
                onClick={() => onConfirmar(observacao)}
                disabled={loading}
                style={{ background: `linear-gradient(135deg, ${sc.text}, ${sc.text}CC)` }}
            >
              {loading ? (
                  <><Loader2 size={13} className="dl-spin" /> Salvando...</>
              ) : (
                  <><CheckCircle2 size={13} /> Confirmar</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
  );

  return createPortal(content, document.body);
}

/* ─── Modal de Filtro por Status ─────────────────────────── */
function FiltroStatusModal({ t, filtroAtual, onSelecionar, onFechar }) {
  const opcoes = [
    { value: null, label: "Todos os membros" },
    ...statusOptions.map(s => ({ value: s, label: STATUS_LABELS[s] })),
  ];

  const content = (
      <motion.div
          className="mem-confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onFechar}
      >
        <motion.div
            className="mem-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        />
        <motion.div
            className="mem-confirm-box"
            initial={{ scale: .92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: .92, opacity: 0, y: 10 }}
            transition={{ type: "tween", duration: 0.22 }}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 380, borderColor: `${AURA.gold}30` }}
        >
          <div className="mem-status-icon" style={{ background: "rgba(201,169,110,.12)", color: AURA.gold }}>
            <Filter size={22} />
          </div>

          <h3 className="mem-confirm-title">Filtrar por status</h3>
          <p className="mem-confirm-text" style={{ marginBottom: 4 }}>
            Escolha quais membros deseja visualizar na lista.
          </p>

          <div className="mem-filter-pills">
            {opcoes.map(o => {
              const sc = o.value ? (STATUS_COLORS[o.value] || STATUS_COLORS.INATIVO) : null;
              const ativo = filtroAtual === o.value;
              return (
                  <div
                      key={o.label}
                      className="mem-filter-pill"
                      onClick={() => { onSelecionar(o.value); onFechar(); }}
                      style={ativo ? {
                        borderColor: sc ? sc.border : `${AURA.gold}60`,
                        background: sc ? sc.bg : "rgba(201,169,110,.1)",
                      } : {}}
                  >
                    <span className="mem-filter-pill-label">
                      {sc
                          ? <span className="mem-filter-dot-lg" style={{ background: sc.text }} />
                          : <Users size={14} style={{ color: AURA.gold }} />
                      }
                      {o.label}
                    </span>
                    {ativo && (
                        <CheckCircle2 size={17} style={{ color: sc ? sc.text : AURA.gold }} />
                    )}
                  </div>
              );
            })}
          </div>

          <button type="button" className="mem-confirm-btn-cancel" style={{ width: "100%" }} onClick={onFechar}>
            Fechar
          </button>
        </motion.div>
      </motion.div>
  );

  return createPortal(content, document.body);
}

/* ─── Modal de Filtro por Cargo ────────────────────────────── */
function FiltroCargoModal({ selecionados, onAplicar, onFechar }) {
  const [locais, setLocais] = useState(selecionados);

  const toggle = (valor) => {
    setLocais(prev => prev.includes(valor) ? prev.filter(c => c !== valor) : [...prev, valor]);
  };

  const content = (
      <motion.div
          className="mem-confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onFechar}
      >
        <motion.div
            className="mem-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        />
        <motion.div
            className="mem-confirm-box"
            initial={{ scale: .92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: .92, opacity: 0, y: 10 }}
            transition={{ type: "tween", duration: 0.22 }}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 400, borderColor: "rgba(0,61,165,.3)" }}
        >
          <div className="mem-status-icon" style={{ background: "rgba(0,61,165,.12)", color: AURA.blue }}>
            <Briefcase size={22} />
          </div>

          <h3 className="mem-confirm-title">Filtrar por cargo</h3>
          <p className="mem-confirm-text" style={{ marginBottom: 4 }}>
            Selecione um ou mais cargos para filtrar a lista.
          </p>

          <div
              style={{
                width: "100%", maxHeight: 260, overflowY: "auto",
                display: "flex", flexDirection: "column", gap: 2,
                margin: "12px 0 18px", textAlign: "left",
              }}
          >
            {cargoOptions.map(o => {
              const ativo = locais.includes(o.value);
              return (
                  <div
                      key={o.value}
                      className={`mem-cargo-option ${ativo ? "selected" : ""}`}
                      onClick={() => toggle(o.value)}
                  >
                    <span className="mem-cargo-option-check">
                      {ativo && <CheckCircle2 size={13} />}
                    </span>
                    {o.label}
                  </div>
              );
            })}
          </div>

          <div className="mem-confirm-actions">
            <button
                type="button"
                className="mem-confirm-btn-cancel"
                onClick={() => { setLocais([]); onAplicar([]); onFechar(); }}
            >
              Limpar
            </button>
            <button
                type="button"
                className="mem-confirm-btn-delete"
                style={{ background: `linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark})` }}
                onClick={() => { onAplicar(locais); onFechar(); }}
            >
              <CheckCircle2 size={13} /> Aplicar
            </button>
          </div>
        </motion.div>
      </motion.div>
  );

  return createPortal(content, document.body);
}

/* ─── Modal de Exportação em PDF ───────────────────────────── */
function ExportarPdfModal({ onExportar, onFechar, exportando, quantidadeAtual }) {
  const content = (
      <motion.div
          className="mem-confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={exportando ? undefined : onFechar}
      >
        <motion.div
            className="mem-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        />
        <motion.div
            className="mem-confirm-box"
            initial={{ scale: .92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: .92, opacity: 0, y: 10 }}
            transition={{ type: "tween", duration: 0.22 }}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 400, borderColor: "rgba(0,61,165,.3)" }}
        >
          <div className="mem-status-icon" style={{ background: "rgba(0,61,165,.12)", color: AURA.blue }}>
            <Download size={22} />
          </div>

          <h3 className="mem-confirm-title">Baixar lista em PDF</h3>
          <p className="mem-confirm-text" style={{ marginBottom: 16 }}>
            Serão exportados os {quantidadeAtual} membro{quantidadeAtual === 1 ? "" : "s"} que correspondem
            à busca e aos filtros aplicados atualmente.
          </p>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            <button
                type="button"
                className="mem-export-option"
                disabled={exportando}
                onClick={() => onExportar("simples")}
            >
              <div className="mem-export-option-icon"><FileText size={17} /></div>
              <div>
                <p className="mem-export-option-title">Lista simples</p>
                <p className="mem-export-option-desc">Nome, telefone e linha para assinatura</p>
              </div>
            </button>

            <button
                type="button"
                className="mem-export-option"
                disabled={exportando}
                onClick={() => onExportar("completo")}
            >
              <div className="mem-export-option-icon"><FileText size={17} /></div>
              <div>
                <p className="mem-export-option-title">Lista completa</p>
                <p className="mem-export-option-desc">Todos os dados cadastrais de cada membro</p>
              </div>
            </button>
          </div>

          {exportando && (
              <p className="mem-confirm-text" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 12 }}>
                <Loader2 size={14} className="dl-spin" style={{ color: AURA.blue }} />
                Preparando o PDF...
              </p>
          )}

          <button
              type="button"
              className="mem-confirm-btn-cancel"
              style={{ width: "100%" }}
              onClick={onFechar}
              disabled={exportando}
          >
            Cancelar
          </button>
        </motion.div>
      </motion.div>
  );

  return createPortal(content, document.body);
}

/* ─── Toast de status ────────────────────────────────────────────── */
function ToastStatus({ toast }) {
  if (!toast) return null;
  const sc = STATUS_COLORS[toast.status] || STATUS_COLORS.INATIVO;
  const content = (
      <motion.div
          className="mem-toast"
          initial={{ opacity: 0, y: 30, scale: .95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: .95 }}
          transition={{ type: "tween", duration: 0.25 }}
          style={{ border: `1px solid ${sc.border}` }}
      >
        <span className="mem-toast-dot" style={{ background: sc.text }} />
        {toast.message}
      </motion.div>
  );
  return createPortal(content, document.body);
}

/* ─── Componente Principal ──────────────────────────────────────── */
const TAMANHO_PAGINA = 50;

export default function MembrosRefatorado({ isDark = false }) {
  const [membros,        setMembros]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [pagina,         setPagina]         = useState(0);
  const [temMais,        setTemMais]        = useState(false);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [editandoId,     setEditandoId]     = useState(null);
  const [filtro,         setFiltro]         = useState("");
  const [filtroBusca,    setFiltroBusca]    = useState(""); // valor debounced usado no filtro/carregamento
  const [form,           setForm]           = useState(formInicial);
  const [nomeCelula,     setNomeCelula]     = useState(null);
  const [nomeLider,      setNomeLider]      = useState(null);
  const [statusOriginal, setStatusOriginal] = useState(null);
  const [salvando,       setSalvando]       = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo,      setExcluindo]      = useState(false);
  const [erroExclusao,   setErroExclusao]   = useState(null);
  const [toast,          setToast]          = useState(null); // { message, status }

  // ✅ estado para o modal de confirmação de mudança de status
  const [confirmandoStatus, setConfirmandoStatus] = useState(false);
  const [dadosPendentes,    setDadosPendentes]    = useState(null); // { dados, novoStatus }

  // ✅ filtro por status (Ativo, Inativo, Afastado, Transferido, Falecido)
  const [filtroStatus,      setFiltroStatus]      = useState(null); // null = todos
  const [filtroModalAberto, setFiltroModalAberto] = useState(false);

  // ✅ filtro por cargo (multi-seleção — mostra membro se tiver QUALQUER um dos cargos marcados)
  const [filtroCargos,       setFiltroCargos]       = useState([]); // [] = todos
  const [filtroCargoAberto,  setFiltroCargoAberto]  = useState(false);

  // ✅ exportação em PDF (lista completa ou simples)
  const [exportModalAberto, setExportModalAberto] = useState(false);
  const [exportando,        setExportando]        = useState(false);

  // ✅ indica que estamos varrendo o restante das páginas por causa de uma busca
  const [buscandoTudo, setBuscandoTudo] = useState(false);

  const t = themeMembers(isDark);

  const sentinelRef = useRef(null);
  const paginacaoRef = useRef({ pagina: 0, temMais: false });
  const membrosRef = useRef([]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  const carregarPagina = useCallback(async (numeroPagina, reset) => {
    if (reset) setLoading(true);
    else setCarregandoMais(true);

    try {
      const res = await api.get("/membros", {
        params: { page: numeroPagina, size: TAMANHO_PAGINA },
      });

      const conteudo = Array.isArray(res.data) ? res.data : (res.data.content || []);
      const ultimaPagina = Array.isArray(res.data)
          ? true
          : (res.data.last ?? (conteudo.length < TAMANHO_PAGINA));
      const total = Array.isArray(res.data) ? conteudo.length : (res.data.totalElements ?? conteudo.length);

      const merged = reset ? conteudo : [...membrosRef.current, ...conteudo];
      const dedup = deduplicarPorId(merged);
      membrosRef.current = dedup;
      setMembros(dedup);

      setTemMais(!ultimaPagina);
      setTotalRegistros(total);
      setPagina(numeroPagina);

      paginacaoRef.current = { pagina: numeroPagina, temMais: !ultimaPagina };

      return { ultimaPagina, numeroPagina };
    } catch (err) {
      console.error("Erro ao listar membros:", err);
      if (reset) {
        membrosRef.current = [];
        setMembros([]);
      }
      return { ultimaPagina: true, numeroPagina };
    } finally {
      setLoading(false);
      setCarregandoMais(false);
    }
  }, []);

  useEffect(() => {
    carregarPagina(0, true);
  }, [carregarPagina]);

  const carregarMais = useCallback(() => {
    if (!temMais || carregandoMais) return;
    carregarPagina(pagina + 1, false);
  }, [temMais, carregandoMais, pagina, carregarPagina]);

  const carregarTodasAsPaginas = useCallback(async () => {
    setBuscandoTudo(true);
    try {
      while (paginacaoRef.current.temMais) {
        const proximaPagina = paginacaoRef.current.pagina + 1;
        const { ultimaPagina } = await carregarPagina(proximaPagina, false);
        if (ultimaPagina) break;
      }
    } finally {
      setBuscandoTudo(false);
    }
  }, [carregarPagina]);

  useEffect(() => {
    const timer = setTimeout(() => setFiltroBusca(filtro.trim()), 350);
    return () => clearTimeout(timer);
  }, [filtro]);

  useEffect(() => {
    const temBuscaAtiva = filtroBusca !== "" || Boolean(filtroStatus) || filtroCargos.length > 0;
    if (temBuscaAtiva && paginacaoRef.current.temMais) {
      carregarTodasAsPaginas();
    }
  }, [filtroBusca, filtroStatus, filtroCargos, carregarTodasAsPaginas]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !temMais) return;

    const encontrarContainerComScroll = (node) => {
      let parent = node.parentElement;
      while (parent) {
        const estilo = window.getComputedStyle(parent);
        const rolavel = /(auto|scroll)/.test(estilo.overflowY);
        if (rolavel && parent.scrollHeight > parent.clientHeight + 4) {
          return parent;
        }
        parent = parent.parentElement;
      }
      return window;
    };

    const containerScroll = encontrarContainerComScroll(el);

    const verificarEcarregar = () => {
      const rect = el.getBoundingClientRect();
      const alturaVisivel = containerScroll === window
          ? window.innerHeight
          : containerScroll.getBoundingClientRect().bottom;
      if (rect.top - alturaVisivel < 300) {
        carregarMais();
      }
    };

    verificarEcarregar();

    containerScroll.addEventListener("scroll", verificarEcarregar, { passive: true });
    window.addEventListener("resize", verificarEcarregar);

    return () => {
      containerScroll.removeEventListener("scroll", verificarEcarregar);
      window.removeEventListener("resize", verificarEcarregar);
    };
  }, [temMais, carregarMais]);

  const recarregar = () => carregarPagina(0, true);

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
      nomeMae:                m.nomeMae         ?? "",
      nomePai:                m.nomePai         ?? "",
      nomeConjuge:            m.nomeConjuge     ?? "",
      naturalidade:           m.naturalidade    ?? "",
      grauEscolaridade:       m.grauEscolaridade        ?? "",
      curso:                  m.curso                   ?? "",
      profissao:              m.profissao               ?? "",
      endereco:               m.endereco        ?? "",
      numero:                 m.numero          ?? "",
      bairro:                 m.bairro          ?? "",
      cidade:                 m.cidade          ?? "",
      cep:                    m.cep             ?? "",
      uf:                     m.uf              ?? "",
      pertenceOutraReligiao:  m.pertenceOutraReligiao  ?? false,
      qualReligiao:           m.qualReligiao           ?? "",
      batizadoNasAguas:       m.batizadoNasAguas       ?? false,
      dataBatizadoNasAguas:   formatarDataInput(m.dataBatizadoNasAguas),
      igrejaBatizadoNasAguas: m.igrejaBatizadoNasAguas ?? "",
      batizadoEspiritoSanto:  m.batizadoEspiritoSanto  ?? false,
      tipoArrolamento:        m.tipoArrolamento        ?? "",
      jurisdicaoArrolamento:  m.jurisdicaoArrolamento  ?? "",
      arroladoPor:            m.arroladoPor            ?? "",
      cargos:                 Array.isArray(m.cargos) ? m.cargos : [],
      observacoes:            m.observacoes            ?? "",
      // ✅ NOVO: motivo/observação da última mudança de status, e quando
      // ela aconteceu — vêm prontos do backend junto com o membro, e são
      // exibidos (somente leitura) no topo da ficha ao abrir para edição.
      observacaoStatus:       m.observacaoStatus       ?? "",
      dataAtualizacaoStatus:  m.dataAtualizacaoStatus  ?? m.dataStatus ?? null,
    });
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false); setEditandoId(null);
    setNomeCelula(null); setNomeLider(null);
  };

  const executarSalvamento = async (dados, statusMudou, novoStatus, observacaoStatus) => {
    setSalvando(true);
    try {
      if (editandoId) {
        if (statusMudou) {
          const temObservacao = observacaoStatus && observacaoStatus.trim() !== "";
          await api.put(`/membros/${editandoId}/status`, null, {
            params: {
              status: novoStatus,
              ...(temObservacao ? { observacao: observacaoStatus.trim() } : {}),
            },
          });
        }
        await api.put(`/membros/${editandoId}`, dados);
      } else {
        await api.post("/membros", dados);
      }

      if (statusMudou) {
        setToast({ message: mensagemStatus(novoStatus, form.nome), status: novoStatus });
      }

      fecharModal();
      recarregar();
    } catch (err) {
      const mensagem = err.response?.data?.message || err.response?.data?.error || err.message || "Erro desconhecido";
      alert(`Erro ao salvar:\n\n${mensagem}`);
    } finally {
      setSalvando(false);
      setConfirmandoStatus(false);
      setDadosPendentes(null);
    }
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      const dados = prepararFormParaEnvio(form);
      const statusMudou = Boolean(editandoId) && form.status !== statusOriginal;

      if (statusMudou) {
        setDadosPendentes({ dados, novoStatus: form.status });
        setConfirmandoStatus(true);
        return;
      }

      await executarSalvamento(dados, false, null);
    } catch (err) {
      alert(`Erro ao salvar:\n\n${err.message}`);
    }
  };

  const confirmarMudancaStatus = (observacao) => {
    if (!dadosPendentes) return;
    executarSalvamento(dadosPendentes.dados, true, dadosPendentes.novoStatus, observacao);
  };

  const cancelarMudancaStatus = () => {
    setConfirmandoStatus(false);
    setDadosPendentes(null);
  };

  const pedirConfirmacaoExclusao = () => {
    setErroExclusao(null);
    setConfirmandoExclusao(true);
  };

  const cancelarExclusao = () => {
    if (excluindo) return;
    setConfirmandoExclusao(false);
    setErroExclusao(null);
  };

  const confirmarExclusao = async () => {
    setExcluindo(true);
    setErroExclusao(null);
    try {
      await api.delete(`/membros/${editandoId}`);
      setConfirmandoExclusao(false);
      fecharModal(); recarregar();
    } catch (err) {
      const backendMsg = err.response?.data?.message || err.response?.data?.error || err.message || "";
      const status = err.response?.status;

      const ehConflitoDeVinculo =
          status === 409 ||
          status === 500 ||
          /constraint|foreign key|violates|referenced from table/i.test(backendMsg);

      if (ehConflitoDeVinculo) {
        let motivo = "Este membro ainda possui vínculos ativos no sistema.";
        if (/discipulado/i.test(backendMsg)) {
          motivo = "Este membro possui registros de discipulado vinculados.";
        } else if (/celula|c[eé]lula/i.test(backendMsg)) {
          motivo = "Este membro ainda está vinculado a uma célula.";
        }
        setErroExclusao(`${motivo} Desvincule-o (remova da célula e/ou do discipulado) antes de tentar excluir novamente.`);
      } else {
        setErroExclusao(backendMsg || "Erro desconhecido ao excluir.");
      }
    } finally {
      setExcluindo(false);
    }
  };

  const membrosFiltrados = useMemo(() =>
          membros
              .filter(m =>
                  (!filtroStatus || m.status === filtroStatus) &&
                  (filtroCargos.length === 0 || (m.cargos || []).some(c => filtroCargos.includes(c))) &&
                  (
                      m.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
                      m.cpf?.includes(filtroBusca) ||
                      m.nomeCelula?.toLowerCase().includes(filtroBusca.toLowerCase())
                  )
              )
              .sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR", { sensitivity: "base" })),
      [membros, filtroBusca, filtroStatus, filtroCargos]
  );

  const buscaPodeEstarIncompleta = (filtroBusca !== "" || filtroStatus || filtroCargos.length > 0) && temMais && buscandoTudo;

  const exportarPdf = async (tipo) => {
    setExportando(true);
    try {
      if (paginacaoRef.current.temMais) {
        await carregarTodasAsPaginas();
      }
      const listaCompleta = membrosRef.current;
      const listaParaExportar = listaCompleta
          .filter(m =>
              (!filtroStatus || m.status === filtroStatus) &&
              (filtroCargos.length === 0 || (m.cargos || []).some(c => filtroCargos.includes(c))) &&
              (
                  m.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
                  m.cpf?.includes(filtroBusca) ||
                  m.nomeCelula?.toLowerCase().includes(filtroBusca.toLowerCase())
              )
          )
          .sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR", { sensitivity: "base" }));

      if (listaParaExportar.length === 0) {
        alert("Nenhum membro encontrado para exportar com os filtros atuais.");
        return;
      }

      gerarPdfMembros(listaParaExportar, tipo);
      setExportModalAberto(false);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setExportando(false);
    }
  };

  return (
      <div className="mem-root">
        <GlobalStylesMembers t={t} isDark={isDark} />
        <div className="mem-glow" />

        <div className="mem-content">

          {/* ── Header ── */}
          <motion.header
              className="mem-header"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4 }}
          >
            <div className="mem-header-left">
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 16,
              }}>
                <User size={20} />
              </div>
              <div className="mem-title-block">
                <p className="mem-eyebrow">Gerenciamento</p>
                <h1 className="mem-title">Membros</h1>
              </div>
            </div>
            <div className="mem-header-actions">
              <button
                  className="mem-btn-pdf"
                  onClick={() => setExportModalAberto(true)}
                  title="Baixar lista em PDF"
              >
                <Download size={13} /> PDF
              </button>
              <button className="mem-btn-gold" onClick={abrirNovo}>
                <Plus size={13} /> Novo
              </button>
            </div>
          </motion.header>

          {/* ── Busca + Filtro por Status + Filtro por Cargo ── */}
          <motion.div
              className="mem-search-row"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4, delay: .08 }}
          >
            <div className="mem-search-wrap">
              <Search className="mem-search-icon" size={16} />
              <input
                  className="mem-input"
                  placeholder="Buscar por nome, CPF ou célula…"
                  value={filtro}
                  onChange={e => setFiltro(e.target.value)}
              />
              {buscandoTudo && (
                  <Loader2
                      size={15}
                      className="dl-spin"
                      style={{
                        position: "absolute", right: 14, top: "50%",
                        transform: "translateY(-50%)", color: AURA.gold,
                      }}
                  />
              )}
            </div>
            <button
                type="button"
                className={`mem-filter-btn ${filtroStatus ? "active" : ""}`}
                onClick={() => setFiltroModalAberto(true)}
                title="Filtrar por status"
            >
              <Filter size={16} />
              {filtroStatus && (
                  <span
                      className="mem-filter-dot"
                      style={{ background: (STATUS_COLORS[filtroStatus] || STATUS_COLORS.INATIVO).text }}
                  />
              )}
            </button>
            <button
                type="button"
                className={`mem-filter-btn ${filtroCargos.length > 0 ? "active" : ""}`}
                onClick={() => setFiltroCargoAberto(true)}
                title="Filtrar por cargo"
            >
              <Briefcase size={16} />
              {filtroCargos.length > 0 && (
                  <span className="mem-filter-dot" style={{ background: AURA.blue }} />
              )}
            </button>
          </motion.div>

          {/* ── Chip do filtro ativo (status) ── */}
          {filtroStatus && (
              (() => {
                const sc = STATUS_COLORS[filtroStatus] || STATUS_COLORS.INATIVO;
                return (
                    <div className="mem-filter-chip" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                      Mostrando: {STATUS_LABELS[filtroStatus]}
                      <button onClick={() => setFiltroStatus(null)} title="Remover filtro">
                        <X size={12} />
                      </button>
                    </div>
                );
              })()
          )}

          {/* ── Chip do filtro ativo (cargo) ── */}
          {filtroCargos.length > 0 && (
              <div className="mem-filter-chip" style={{ background: "rgba(0,61,165,.1)", color: AURA.blue, border: "1px solid rgba(0,61,165,.3)" }}>
                Cargos: {filtroCargos.map(c => CARGO_LABELS[c] || c).join(", ")}
                <button onClick={() => setFiltroCargos([])} title="Remover filtro">
                  <X size={12} />
                </button>
              </div>
          )}

          {/* ── Cards/Loading ── */}
          {loading ? (
              <div className="mem-loading">
                <Loader2 size={28} className="dl-spin" style={{ color: AURA.gold }} />
              </div>
          ) : membrosFiltrados.length > 0 ? (
              <>
                <motion.div
                    className="mem-grid"
                    initial="hidden" animate="visible"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: .04 } } }}
                >
                  {membrosFiltrados.map(m => {
                    const sc = STATUS_COLORS[m.status] || STATUS_COLORS.INATIVO;
                    const cargosDoMembro = Array.isArray(m.cargos) ? m.cargos : [];
                    const CARGOS_VISIVEIS = 2;
                    // ✅ NOVO: prévia da observação exibida no card da lista —
                    // prioriza o motivo do status (mais relevante quando o
                    // membro não está ATIVO); cai para observações gerais.
                    const observacaoPreview = m.status !== "ATIVO" && m.observacaoStatus
                        ? m.observacaoStatus
                        : (m.observacoes || "");
                    return (
                        <motion.div
                            key={m.id}
                            className="mem-card"
                            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                            onClick={() => abrirEdicao(m)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: .98 }}
                            style={{
                              borderColor: sc.border,
                              borderLeftColor: sc.text,
                              background: isDark
                                  ? `linear-gradient(135deg, ${sc.bg}, rgba(18,18,26,.95) 65%)`
                                  : `linear-gradient(135deg, ${sc.bg}, rgba(255,255,255,.95) 65%)`,
                            }}
                        >
                          <div className="mem-card-inner">
                            <div
                                className="mem-card-avatar"
                                style={{ background: `linear-gradient(135deg, ${sc.text}, ${sc.text}CC)` }}
                            >
                              {m.nome?.charAt(0).toUpperCase()}
                            </div>
                            <div className="mem-card-content">
                              <p className="mem-card-name">{m.nome?.toUpperCase()}</p>
                              <div className="mem-card-meta">
                                <span className="mem-badge" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                                  {m.status}
                                </span>
                                {m.profissao && (
                                    <span className="mem-badge" style={{ background: `${AURA.gold}12`, color: AURA.gold, border: `1px solid ${AURA.gold}30` }}>
                                      {m.profissao.slice(0, 12)}
                                    </span>
                                )}
                                {cargosDoMembro.slice(0, CARGOS_VISIVEIS).map(c => (
                                    <span key={c} className="mem-badge-cargo">
                                      {CARGO_LABELS[c] || c}
                                    </span>
                                ))}
                                {cargosDoMembro.length > CARGOS_VISIVEIS && (
                                    <span className="mem-badge-cargo">
                                      +{cargosDoMembro.length - CARGOS_VISIVEIS}
                                    </span>
                                )}
                              </div>
                              {/* ✅ NOVO: prévia da observação diretamente no card */}
                              {observacaoPreview && (
                                  <p className="mem-card-obs" title={observacaoPreview}>
                                    {observacaoPreview}
                                  </p>
                              )}
                            </div>
                            <ChevronRight className="mem-card-arrow" size={18} />
                          </div>
                        </motion.div>
                    );
                  })}
                </motion.div>

                {/* ── Scroll infinito ── */}
                {temMais && (
                    <div ref={sentinelRef} className="mem-scroll-sentinel">
                      {(carregandoMais || buscandoTudo) && (
                          <>
                            <Loader2 size={14} className="dl-spin" style={{ color: AURA.gold }} />
                            Carregando mais membros...
                          </>
                      )}
                    </div>
                )}

                {/* ── Info de contagem ── */}
                <p className="mem-info-bar">
                  {membros.length} de {totalRegistros} membro{totalRegistros === 1 ? "" : "s"} carregado{membros.length === 1 ? "" : "s"}
                  {buscaPodeEstarIncompleta && " — buscando em todas as páginas…"}
                </p>
              </>
          ) : (
              <motion.div
                  className="mem-empty"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
              >
                <div className="mem-empty-icon">
                  <Users size={32} />
                </div>
                <p className="mem-empty-text">
                  {buscandoTudo
                      ? "Buscando em todos os registros..."
                      : filtro
                          ? "Nenhum membro encontrado."
                          : filtroStatus
                              ? `Nenhum membro com status "${STATUS_LABELS[filtroStatus]}".`
                              : "Nenhum membro cadastrado."}
                </p>
                {buscandoTudo && (
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
                      <Loader2 size={18} className="dl-spin" style={{ color: AURA.gold }} />
                    </div>
                )}
                <button className="mem-btn-gold" style={{ marginTop: 16 }} onClick={abrirNovo}>
                  <Plus size={13} /> Adicionar Membro
                </button>
              </motion.div>
          )}

        </div>

        {/* ── Modal ── */}
        <AnimatePresence>
          {isModalOpen && (
              <MembroModalRefatorado
                  isDark={isDark}
                  editandoId={editandoId}
                  form={form}
                  setForm={setForm}
                  onSalvar={salvar}
                  onExcluir={pedirConfirmacaoExclusao}
                  onFechar={fecharModal}
                  nomeCelula={nomeCelula}
                  nomeLider={nomeLider}
                  loading={salvando}
              />
          )}
        </AnimatePresence>

        {/* ── Modal de Filtro por Status ── */}
        <AnimatePresence>
          {filtroModalAberto && (
              <FiltroStatusModal
                  t={t}
                  filtroAtual={filtroStatus}
                  onSelecionar={setFiltroStatus}
                  onFechar={() => setFiltroModalAberto(false)}
              />
          )}
        </AnimatePresence>

        {/* ── Modal de Filtro por Cargo ── */}
        <AnimatePresence>
          {filtroCargoAberto && (
              <FiltroCargoModal
                  selecionados={filtroCargos}
                  onAplicar={setFiltroCargos}
                  onFechar={() => setFiltroCargoAberto(false)}
              />
          )}
        </AnimatePresence>

        {/* ── Modal de Exportação em PDF ── */}
        <AnimatePresence>
          {exportModalAberto && (
              <ExportarPdfModal
                  onExportar={exportarPdf}
                  onFechar={() => !exportando && setExportModalAberto(false)}
                  exportando={exportando}
                  quantidadeAtual={membrosFiltrados.length}
              />
          )}
        </AnimatePresence>

        {/* ── Confirmação de Mudança de Status ── */}
        <AnimatePresence>
          {confirmandoStatus && dadosPendentes && (
              <ConfirmarStatusModal
                  status={dadosPendentes.novoStatus}
                  nome={form.nome}
                  onConfirmar={confirmarMudancaStatus}
                  onCancelar={cancelarMudancaStatus}
                  loading={salvando}
              />
          )}
        </AnimatePresence>

        {/* ── Confirmação de Exclusão ── */}
        <AnimatePresence>
          {confirmandoExclusao && (
              <ConfirmarExclusaoModal
                  nomeMembro={form.nome}
                  onConfirmar={confirmarExclusao}
                  onCancelar={cancelarExclusao}
                  loading={excluindo}
                  erro={erroExclusao}
              />
          )}
        </AnimatePresence>

        {/* ── Toast de mudança de status ── */}
        <AnimatePresence>
          {toast && <ToastStatus toast={toast} />}
        </AnimatePresence>

      </div>
  );
}
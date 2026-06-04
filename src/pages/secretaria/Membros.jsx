import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
  Plus, X, User, Phone, Trash2, Loader2, Search,
  CreditCard, Heart, ChevronRight, Users,
} from "lucide-react";

/* ??? Tokens ??? */
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

const formInicial = {
  nome: "", email: "", telefone: "", endereco: "", cpf: "",
  estadoCivil: "SOLTEIRO", dataNascimento: "", dataConversao: "",
  dataBatismo: "", status: "ATIVO", celulaId: null,
};

// ✅ HELPER: Converter data ISO para YYYY-MM-DD
function formatarDataInput(dataISO) {
  if (!dataISO) return "";
  try {
    // Se vier em formato ISO (2000-05-15T00:00:00), pega só a data
    if (typeof dataISO === "string" && dataISO.includes("T")) {
      return dataISO.split("T")[0];
    }
    // Se vier em formato YYYY-MM-DD, retorna igual
    if (typeof dataISO === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dataISO)) {
      return dataISO;
    }
    return "";
  } catch {
    return "";
  }
}

// ✅ HELPER: Validar e preparar dados antes de enviar
function prepararFormParaEnvio(form) {
  const dados = { ...form };

  // Se celulaId for null/undefined/0, remove do payload
  if (!dados.celulaId) {
    delete dados.celulaId;
  }

  // Não enviar campos vazios de data (deixa como null ou remove)
  if (!dados.dataNascimento) dados.dataNascimento = null;
  if (!dados.dataConversao) dados.dataConversao = null;
  if (!dados.dataBatismo) dados.dataBatismo = null;

  // Nome é obrigatório
  if (!dados.nome || dados.nome.trim() === "") {
    throw new Error("Nome completo é obrigatório");
  }

  return dados;
}

/* ??????????????????????????????????????????
   MODAL
?????????????????????????????????????????? */
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

  const f = v => setForm(p => ({ ...p, ...v }));

  const css = `
    @keyframes spin { to { transform: rotate(360deg) } }
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
      display: flex; flex-direction: column; gap: 14px;
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
    .mf-label {
      font-family: 'Cinzel', serif; font-size: 8px; letter-spacing: .2em;
      text-transform: uppercase; color: ${textSec}; display: block; margin-bottom: 5px;
    }
    .mf-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media(max-width:380px) { .mf-grid2 { grid-template-columns: 1fr; } }
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
    .mf-spiritual {
      padding: 14px; border-radius: 10px;
      background: ${isDark ? "rgba(0,61,165,.08)" : "rgba(0,61,165,.05)"};
      border: 1px solid ${isDark ? "rgba(0,61,165,.2)" : "rgba(0,61,165,.12)"};
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
    .mf-error {
      padding: 12px 14px; border-radius: 8px;
      background: rgba(200,16,46,.1); border: 1px solid rgba(200,16,46,.3);
      color: ${IEQ.red}; font-family: 'EB Garamond', serif; font-size: 13px;
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
              <p style={{
                fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".2em",
                color: "#C48C00", margin: "0 0 2px", textTransform: "uppercase",
              }}>
                CÉLULA VINCULADA
              </p>
              <p style={{
                fontFamily: "'EB Garamond',serif", fontSize: 15, fontWeight: 600,
                color: textPrimary, margin: "0 0 2px",
              }}>
                {nomeCelula}
              </p>
              {nomeLider && (
                  <p style={{
                    fontFamily: "'EB Garamond',serif", fontSize: 12,
                    color: textSec, margin: 0,
                  }}>
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
            <p style={{
              fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".2em",
              color: textSec, margin: "0 0 2px", textTransform: "uppercase",
            }}>
              CÉLULA VINCULADA
            </p>
            <p style={{
              fontFamily: "'EB Garamond',serif", fontSize: 14, fontStyle: "italic",
              color: textSec, margin: 0,
            }}>
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
              <h2 style={{
                fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700,
                letterSpacing: ".14em", color: textPrimary, margin: 0,
              }}>
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
                <label className="mf-label">WHATSAPP</label>
                <input className="mf-field"
                       value={form.telefone} onChange={e => f({ telefone: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="mf-label">E-MAIL</label>
              <input type="email" className="mf-field"
                     value={form.email} onChange={e => f({ email: e.target.value })} />
            </div>

            <div>
              <label className="mf-label">ENDEREÇO</label>
              <input className="mf-field"
                     value={form.endereco} onChange={e => f({ endereco: e.target.value })} />
            </div>

            <div className="mf-grid2">
              <div>
                <label className="mf-label">NASCIMENTO</label>
                <input type="date" className="mf-field"
                       value={form.dataNascimento} onChange={e => f({ dataNascimento: e.target.value })} />
              </div>
              <div>
                <label className="mf-label">ESTADO CIVIL</label>
                <select className="mf-field"
                        value={form.estadoCivil} onChange={e => f({ estadoCivil: e.target.value })}>
                  {estadoCivilOptions.map(o =>
                      <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="mf-label">STATUS</label>
              <select className="mf-field"
                      value={form.status} onChange={e => f({ status: e.target.value })}>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="mf-spiritual">
              <p style={{
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".16em",
                color: IEQ.blue, margin: "0 0 12px",
              }}>
                <Heart size={12} /> JORNADA ESPIRITUAL
              </p>
              <div className="mf-grid2">
                <div>
                  <label className="mf-label">DATA CONVERSÃO</label>
                  <input type="date" className="mf-field"
                         value={form.dataConversao} onChange={e => f({ dataConversao: e.target.value })} />
                </div>
                <div>
                  <label className="mf-label">DATA BATISMO</label>
                  <input type="date" className="mf-field"
                         value={form.dataBatismo} onChange={e => f({ dataBatismo: e.target.value })} />
                </div>
              </div>
            </div>

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

/* ??????????????????????????????????????????
   COMPONENTE PRINCIPAL
?????????????????????????????????????????? */
export default function Membros({ isDark = false }) {
  const [membros,        setMembros]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [editandoId,     setEditandoId]     = useState(null);
  const [statusOriginal, setStatusOriginal] = useState(null);
  const [filtro,         setFiltro]         = useState("");
  const [form,           setForm]           = useState(formInicial);

  const [nomeCelula, setNomeCelula] = useState(null);
  const [nomeLider,  setNomeLider]  = useState(null);

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
    setEditandoId(null);
    setStatusOriginal(null);
    setNomeCelula(null);
    setNomeLider(null);
    setForm(formInicial);
    setIsModalOpen(true);
  };

  const abrirEdicao = (m) => {
    setEditandoId(m.id);
    setStatusOriginal(m.status);
    setNomeCelula(m.nomeCelula ?? null);
    setNomeLider(m.nomeLider ?? null);

    // ✅ CORRIGIDO: Usar formatarDataInput para garantir formato correto
    setForm({
      nome:           m.nome ?? "",
      email:          m.email ?? "",
      telefone:       m.telefone ?? "",
      endereco:       m.endereco ?? "",
      cpf:            m.cpf ?? "",
      estadoCivil:    m.estadoCivil ?? "SOLTEIRO",
      status:         m.status ?? "ATIVO",
      celulaId:       m.celulaId ?? null,
      dataNascimento: formatarDataInput(m.dataNascimento),
      dataConversao:  formatarDataInput(m.dataConversao),
      dataBatismo:    formatarDataInput(m.dataBatismo),
    });
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setEditandoId(null);
    setNomeCelula(null);
    setNomeLider(null);
  };

  const salvar = async (e) => {
    e.preventDefault();

    try {
      // ✅ CORRIGIDO: Preparar dados antes de enviar
      const dados = prepararFormParaEnvio(form);

      if (editandoId) {
        // Se status mudou, avisar antes
        if (form.status !== statusOriginal) {
          if (!window.confirm("Alterar o status removerá o membro de células. Continuar?")) {
            return;
          }
          // Chamar endpoint específico de status
          await api.put(`/membros/${editandoId}/status`, null, {
            params: { status: form.status }
          });
        }

        // ✅ CORRIGIDO: Enviar dados preparados
        const response = await api.put(`/membros/${editandoId}`, dados);
        console.log("✅ Membro atualizado:", response.data);

      } else {
        const response = await api.post("/membros", dados);
        console.log("✅ Membro criado:", response.data);
      }

      fecharModal();
      listar();

    } catch (err) {
      // ✅ CORRIGIDO: Mostrar erro real ao usuário
      const mensagem = err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Erro desconhecido ao salvar";

      console.error("❌ Erro ao salvar:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      alert(`Erro ao salvar:\n\n${mensagem}`);
    }
  };

  const excluir = async () => {
    if (!window.confirm("Excluir permanentemente?")) return;

    try {
      await api.delete(`/membros/${editandoId}`);
      console.log("✅ Membro excluído");
      fecharModal();
      listar();
    } catch (err) {
      const mensagem = err.response?.data?.message ||
          err.response?.data?.error ||
          err.message;

      console.error("❌ Erro ao excluir:", err);
      alert(`Erro ao excluir:\n\n${mensagem}`);
    }
  };

  const membrosFiltrados = membros.filter(m =>
      m.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      m.cpf?.includes(filtro) ||
      m.nomeCelula?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
      <div style={{ padding: "24px 20px", fontFamily: "'EB Garamond',serif", color: textPrimary }}>
        <style>{baseStyles}</style>

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
                <h3 style={{
                  fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700,
                  letterSpacing: ".16em", color: textPrimary, margin: 0,
                }}>MEMBRESIA</h3>
                <p style={{
                  fontFamily: "'Cinzel',serif", fontSize: 9,
                  letterSpacing: ".18em", color: textSec, margin: 0,
                }}>{membros.length} REGISTROS</p>
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
            <Search size={15} style={{
              position: "absolute", left: 14, top: "50%",
              transform: "translateY(-50%)", color: IEQ.red, opacity: .6,
            }} />
            <input
                className="ieq-field"
                style={{ paddingLeft: 42 }}
                placeholder="Buscar por nome, CPF ou célula..."
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <Loader2 size={30} className="spin-icon" style={{ color: IEQ.blue, display: "inline-block" }} />
              <p style={{
                fontFamily: "'Cinzel',serif", fontSize: 9,
                letterSpacing: ".2em", color: textSec, marginTop: 12,
              }}>CARREGANDO...</p>
            </div>
        ) : (
            <motion.div
                className="ieq-grid-m"
                initial="hidden"
                animate="visible"
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

                      <div style={{
                        borderTop: `1px solid ${border}`, paddingTop: 12,
                        display: "flex", flexDirection: "column", gap: 6,
                      }}>
                        {m.nomeCelula && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Users size={13} style={{ color: "#C48C00", flexShrink: 0 }} />
                              <span style={{
                                fontFamily: "'EB Garamond',serif", fontSize: 13, color: "#C48C00",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}>
                        {m.nomeCelula}
                      </span>
                            </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <CreditCard size={13} style={{ color: textSec, flexShrink: 0 }} />
                          <span style={{
                            fontFamily: "'EB Garamond',serif", fontSize: 13, color: textSec,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
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
                  estadoCivilOptions={estadoCivilOptions}
                  statusOptions={statusOptions}
                  nomeCelula={nomeCelula}
                  nomeLider={nomeLider}
              />
          )}
        </AnimatePresence>
      </div>
  );
}
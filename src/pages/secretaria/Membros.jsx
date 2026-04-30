import { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import {
  Plus, X, User, Mail, Phone, Trash2,
  Loader2, Search, CreditCard, Heart, ChevronRight
} from "lucide-react";

export default function Membros() {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [statusOriginal, setStatusOriginal] = useState(null);
  const [filtro, setFiltro] = useState("");

  const statusOptions = ["ATIVO", "INATIVO", "AFASTADO", "TRANSFERIDO", "FALECIDO"];
  const estadoCivilOptions = [
    { value: "SOLTEIRO", label: "Solteiro(a)" },
    { value: "CASADO", label: "Casado(a)" },
    { value: "DIVORCIADO", label: "Divorciado(a)" },
    { value: "VIUVO", label: "Viúvo(a)" },
    { value: "UNIAO_ESTAVEL", label: "União Estável" }
  ];

  const formInicial = {
    nome: "", email: "", telefone: "", endereco: "", cpf: "",
    estadoCivil: "SOLTEIRO", dataNascimento: "", dataConversao: "",
    dataBatismo: "", status: "ATIVO"
  };

  const [form, setForm] = useState(formInicial);

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/membros");
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

  const abrirModalNovo = () => {
    setEditandoId(null);
    setStatusOriginal(null);
    setForm(formInicial);
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (m) => {
    setEditandoId(m.id);
    setStatusOriginal(m.status);
    setForm({
      ...m,
      dataNascimento: m.dataNascimento?.split("T")[0] || "",
      dataConversao: m.dataConversao?.split("T")[0] || "",
      dataBatismo: m.dataBatismo?.split("T")[0] || ""
    });
    setIsModalOpen(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        if (form.status !== statusOriginal) {
          if (!window.confirm("Alterar o status removerá o membro de células. Continuar?")) return;
          await api.put(`/membros/${editandoId}/status`, null, { params: { status: form.status } });
        }
        await api.put(`/membros/${editandoId}`, form);
      } else {
        await api.post("/membros", form);
      }
      fecharModal();
      listar();
    } catch (err) { alert("Erro ao salvar dados."); }
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setEditandoId(null);
  };

  const corStatus = (status) => {
    const cores = {
      ATIVO: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      INATIVO: "bg-rose-500/10 text-rose-600 border-rose-500/20",
      AFASTADO: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      TRANSFERIDO: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      FALECIDO: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    };
    return cores[status] || "bg-gray-500/10 text-gray-600";
  };

  const membrosFiltrados = membros.filter(m =>
      m.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      m.cpf?.includes(filtro)
  );

  return (
      <div className="space-y-4 md:space-y-6 animate-in fade-in duration-700 pb-20 md:pb-5">

        {/* HEADER SUPERIOR - Ajustado para empilhar no mobile */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg">
              <User size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <h3 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white italic uppercase">
                MEMBRESIA
              </h3>
              <p className="text-slate-500 text-[10px] md:text-sm font-medium">
                {membros.length} registros ativos
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                  type="text"
                  placeholder="Buscar..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
                onClick={abrirModalNovo}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all"
            >
              <Plus size={18} /> NOVO
            </button>
          </div>
        </div>

        {/* LISTA DE CARDS - Grid Responsivo */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Carregando...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {membrosFiltrados.map((m) => (
                  <div
                      key={m.id}
                      onClick={() => abrirModalEdicao(m)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl hover:border-blue-500 transition-all active:scale-[0.98] cursor-pointer shadow-sm relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center font-black text-xl">
                        {m.nome?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm uppercase truncate">
                          {m.nome}
                        </h4>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase ${corStatus(m.status)}`}>
                    {m.status}
                  </span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                        <CreditCard size={14} className="shrink-0" />
                        <span className="truncate">{m.cpf || "CPF não informado"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                        <Phone size={14} className="shrink-0" />
                        <span>{m.telefone || "Sem telefone"}</span>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* MODAL - Ajustado para ser "Fullscreen" ou Bottom Sheet no mobile */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-end md:items-center justify-center z-[100]">
              <div className="bg-white dark:bg-slate-900 w-full h-[90vh] md:h-auto md:max-w-2xl md:rounded-[2.5rem] rounded-t-[2.5rem] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">

                {/* Header Modal - Sticky */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                      <User size={20} />
                    </div>
                    <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm">
                      {editandoId ? "Editar Perfil" : "Novo Cadastro"}
                    </h3>
                  </div>
                  <button onClick={fecharModal} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                    <X size={20} />
                  </button>
                </div>

                {/* Form - Scrollable */}
                <form onSubmit={salvar} className="p-6 overflow-y-auto flex-1 space-y-6 pb-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Nome Completo" value={form.nome} onChange={v => setForm({...form, nome: v})} required />
                    <InputGroup label="CPF" value={form.cpf} onChange={v => setForm({...form, cpf: v})} placeholder="000.000.000-00" />
                    <InputGroup label="E-mail" type="email" value={form.email} onChange={v => setForm({...form, email: v})} />
                    <InputGroup label="WhatsApp" value={form.telefone} onChange={v => setForm({...form, telefone: v})} />
                  </div>

                  <InputGroup label="Endereço" value={form.endereco} onChange={v => setForm({...form, endereco: v})} />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputGroup label="Nascimento" type="date" value={form.dataNascimento} onChange={v => setForm({...form, dataNascimento: v})} />
                    <SelectGroup label="Estado Civil" value={form.estadoCivil} options={estadoCivilOptions} onChange={v => setForm({...form, estadoCivil: v})} />
                    <SelectGroup label="Status" value={form.status} options={statusOptions.map(s => ({value: s, label: s}))} onChange={v => setForm({...form, status: v})} customStyle={corStatus(form.status)} />
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 space-y-4">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <Heart size={14} /> JORNADA ESPIRITUAL
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputGroup label="Data Conversão" type="date" value={form.dataConversao} onChange={v => setForm({...form, dataConversao: v})} />
                      <InputGroup label="Data Batismo" type="date" value={form.dataBatismo} onChange={v => setForm({...form, dataBatismo: v})} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all">
                      {editandoId ? "Salvar Alterações" : "Confirmar Cadastro"}
                    </button>

                    {editandoId && (
                        <button
                            type="button"
                            onClick={async () => {
                              if(window.confirm("Excluir permanentemente?")) {
                                await api.delete(`/membros/${editandoId}`);
                                fecharModal();
                                listar();
                              }
                            }}
                            className="flex items-center justify-center gap-2 text-rose-500 text-[10px] font-black uppercase py-2"
                        >
                          <Trash2 size={14} /> Excluir Registro
                        </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}

// Sub-componentes Refatorados para Mobile
function InputGroup({ label, type = "text", value, onChange, placeholder, required = false }) {
  return (
      <div className="space-y-1.5 min-w-0">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 italic">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <input
            type={type}
            required={required}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
        />
      </div>
  );
}

function SelectGroup({ label, value, options, onChange, customStyle = "" }) {
  return (
      <div className="space-y-1.5 min-w-0">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 italic">{label}</label>
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all ${customStyle}`}
        >
          {options.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
        </select>
      </div>
  );
}
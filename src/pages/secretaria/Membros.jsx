import { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import {
  Plus, X, User, Mail, Phone, MapPin, Trash2,
  Loader2, Search, Calendar, CreditCard, Heart, ChevronRight
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
      <div className="space-y-6 animate-in fade-in duration-700 p-2">

        {/* HEADER SUPERIOR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 italic">
              <div className="p-2 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                <User size={28} />
              </div>
              MEMBRESIA
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
              {membros.length} servos registrados na base
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                  type="text"
                  placeholder="Buscar por nome ou CPF..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white shadow-sm"
              />
            </div>
            <button
                onClick={abrirModalNovo}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 uppercase tracking-wider"
            >
              <Plus size={20} /> Novo
            </button>
          </div>
        </div>

        {/* ÁREA DE CONTEÚDO */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Sincronizando registros...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {membrosFiltrados.map((m) => (
                  <div
                      key={m.id}
                      onClick={() => abrirModalEdicao(m)}
                      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] hover:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="h-16 w-16 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-600/20 text-blue-600 flex items-center justify-center font-black text-2xl group-hover:scale-110 transition-transform">
                        {m.nome?.charAt(0).toUpperCase()}
                      </div>
                      <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${corStatus(m.status)}`}>
                  {m.status}
                </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-black text-slate-800 dark:text-white text-lg uppercase leading-tight truncate">
                          {m.nome}
                        </h4>
                        <p className="text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 mt-1">
                          <CreditCard size={12} /> {m.cpf || "CPF NÃO INFORMADO"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-2">
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs">
                          <Mail size={14} className="text-slate-400" />
                          <span className="truncate">{m.email || "Sem e-mail"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs">
                          <Phone size={14} className="text-slate-400" />
                          <span>{m.telefone || "Sem telefone"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-blue-600">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ver Perfil</span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* MODAL DE CADASTRO/EDIÇÃO */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white dark:border-slate-800 animate-in zoom-in-95 duration-300">

                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tight">
                        {editandoId ? "Editar Perfil" : "Novo Membro"}
                      </h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Informações Cadastrais</p>
                    </div>
                  </div>
                  <button onClick={fecharModal} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
                    <X size={28} />
                  </button>
                </div>

                <form onSubmit={salvar} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="Nome Completo" value={form.nome} onChange={v => setForm({...form, nome: v})} required />
                    <InputGroup label="CPF" value={form.cpf} onChange={v => setForm({...form, cpf: v})} placeholder="000.000.000-00" />
                    <InputGroup label="E-mail" type="email" value={form.email} onChange={v => setForm({...form, email: v})} />
                    <InputGroup label="WhatsApp / Telefone" value={form.telefone} onChange={v => setForm({...form, telefone: v})} />
                  </div>

                  <InputGroup label="Endereço Residencial" value={form.endereco} onChange={v => setForm({...form, endereco: v})} />

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InputGroup label="Nascimento" type="date" value={form.dataNascimento} onChange={v => setForm({...form, dataNascimento: v})} />

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Estado Civil</label>
                      <select
                          className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl p-3.5 text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                          value={form.estadoCivil}
                          onChange={e => setForm({ ...form, estadoCivil: e.target.value })}
                      >
                        {estadoCivilOptions.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Status</label>
                      <select
                          className={`w-full border-none rounded-2xl p-3.5 text-sm font-black focus:ring-2 focus:ring-blue-500 transition-all ${corStatus(form.status)}`}
                          value={form.status}
                          onChange={e => setForm({ ...form, status: e.target.value })}
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* SEÇÃO ECLESIÁSTICA */}
                  <div className="p-6 bg-blue-50/50 dark:bg-blue-500/5 rounded-3xl border border-blue-100 dark:border-blue-500/10 space-y-4">
                    <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Heart size={14} /> Jornada Espiritual
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup label="Data Conversão" type="date" value={form.dataConversao} onChange={v => setForm({...form, dataConversao: v})} />
                      <InputGroup label="Data Batismo" type="date" value={form.dataBatismo} onChange={v => setForm({...form, dataBatismo: v})} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 transition-all active:scale-95">
                      {editandoId ? "Atualizar Registro" : "Finalizar Cadastro"}
                    </button>

                    {editandoId && (
                        <button
                            type="button"
                            onClick={async () => {
                              if(window.confirm("Esta ação é irreversível. Deseja excluir?")) {
                                await api.delete(`/membros/${editandoId}`);
                                fecharModal();
                                listar();
                              }
                            }}
                            className="flex items-center justify-center gap-2 text-rose-500 hover:text-rose-700 text-[10px] font-black tracking-widest uppercase transition-colors py-2"
                        >
                          <Trash2 size={14} /> Excluir permanentemente
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

// Sub-componente Inner paraInputs (Premium Style)
function InputGroup({ label, type = "text", value, onChange, placeholder, required = false }) {
  return (
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <input
            type={type}
            required={required}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl p-3.5 text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
        />
      </div>
  );
}
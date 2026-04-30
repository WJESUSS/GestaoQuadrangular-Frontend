import { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import {
  Home, Plus, User, Clock, Search, X, ChevronRight, Loader2, Building2, Calendar, MapPin
} from "lucide-react";

export default function Celulas() {
  const [celulas, setCelulas] = useState([]);
  const [lideresDisponiveis, setLideresDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [filtro, setFiltro] = useState("");

  const formInicial = {
    nome: "",
    liderId: "",
    anfitriao: "",
    endereco: "",
    bairro: "",
    diaSemana: "MONDAY",
    horario: "19:30"
  };

  const [form, setForm] = useState(formInicial);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const [resCelulas, resUsuarios] = await Promise.all([
        api.get("/celulas"),
        api.get("/usuarios")
      ]);
      setCelulas(Array.isArray(resCelulas.data) ? resCelulas.data : []);
      setLideresDisponiveis(Array.isArray(resUsuarios.data) ? resUsuarios.data : []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const abrirModalNovo = () => {
    setEditandoId(null);
    setForm(formInicial);
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (c) => {
    setEditandoId(c.id);
    setForm({
      nome: c.nome || "",
      liderId: c.liderId || "",
      anfitriao: c.anfitriao || "",
      endereco: c.endereco || "",
      bairro: c.bairro || "",
      diaSemana: c.diaSemana || "MONDAY",
      horario: c.horario || "19:30"
    });
    setIsModalOpen(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    const dadosParaEnviar = {
      ...form,
      liderId: Number(form.liderId),
      bairro: form.bairro.trim(),
      nome: form.nome.trim()
    };

    try {
      if (editandoId) {
        await api.put(`/celulas/${editandoId}`, dadosParaEnviar);
      } else {
        await api.post("/celulas", dadosParaEnviar);
      }
      fecharModal();
      carregarDados();
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao salvar.";
      alert(msg);
    }
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setForm(formInicial);
    setEditandoId(null);
  };

  const celulasFiltradas = celulas.filter(c =>
      c.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.nomeLider?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.bairro?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 md:pb-6 transition-colors duration-300">
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">

          {/* HEADER PREMIUM */}
          <header className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
                  <Home size={22} />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">Células</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">
                    {celulas.length} Comunidades
                  </p>
                </div>
              </div>
            </div>

            {/* BUSCA E FILTRO */}
            <div className="flex flex-col gap-3">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Buscar célula, líder ou bairro..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border-none rounded-2xl shadow-sm text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-slate-200 transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>
          </header>

          {/* LISTA */}
          {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
                <span className="text-slate-400 dark:text-slate-600 text-xs font-bold mt-4 uppercase tracking-widest">Sincronizando...</span>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {celulasFiltradas.map((c) => (
                    <div
                        key={c.id}
                        onClick={() => abrirModalEdicao(c)}
                        className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-transparent dark:border-slate-800/50 hover:border-emerald-100 dark:hover:border-emerald-500/30 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all active:scale-[0.98] cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                    <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-wider">
                      {c.diaSemana === 'MONDAY' ? 'Segunda' : 'Ativa'}
                    </span>
                          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 block uppercase tracking-tight leading-tight">
                            {c.nome}
                          </h4>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-full group-hover:bg-emerald-500 group-hover:text-white dark:text-slate-400 transition-colors">
                          <ChevronRight size={18} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 border-t border-slate-50 dark:border-slate-800/50 pt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-none">Líder</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{c.nomeLider || "Pendente"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                            <MapPin size={14} />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-none">Bairro</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{c.bairro || "Não informado"}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl mt-2">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-black text-slate-700 dark:text-slate-200">{c.horario}h</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Semanal</span>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
          )}

          {/* BOTÃO FLUTUANTE */}
          <button
              onClick={abrirModalNovo}
              className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-emerald-600 text-white w-14 h-14 md:w-auto md:h-auto md:px-6 md:py-4 rounded-full md:rounded-2xl shadow-2xl shadow-emerald-500/40 flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all active:scale-90 z-40"
          >
            <Plus size={24} />
            <span className="hidden md:block font-bold text-sm uppercase tracking-widest">Nova Célula</span>
          </button>

          {/* MODAL DARK MODE READY */}
          {isModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center z-50 p-0 md:p-4">
                <div className="bg-white dark:bg-slate-900 w-full max-w-xl md:rounded-[32px] rounded-t-[32px] p-6 md:p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[95vh] overflow-y-auto border border-transparent dark:border-slate-800">

                  <div className="flex justify-between items-center mb-8 sticky top-0 bg-white dark:bg-slate-900 pb-2 z-10 transition-colors">
                    <div>
                      <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                        {editandoId ? "Editar Célula" : "Nova Célula"}
                      </h2>
                      <div className="h-1 w-12 bg-emerald-500 rounded-full mt-1"></div>
                    </div>
                    <button onClick={fecharModal} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={salvar} className="space-y-5">
                    <div className="space-y-4">
                      <div className="group">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest">Identificação</label>
                        <input
                            required
                            placeholder="Nome da Célula"
                            value={form.nome}
                            onChange={e => setForm({ ...form, nome: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest">Liderança</label>
                        <select
                            required
                            value={form.liderId}
                            onChange={e => setForm({ ...form, liderId: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 dark:text-slate-200 appearance-none"
                        >
                          <option value="">Selecionar Líder</option>
                          {lideresDisponiveis.map(u => (
                              <option key={u.id} value={u.id}>{u.nome}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest">Bairro</label>
                          <input
                              required
                              value={form.bairro}
                              onChange={e => setForm({ ...form, bairro: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 dark:text-slate-200"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest">Horário</label>
                          <input
                              type="time"
                              value={form.horario}
                              onChange={e => setForm({ ...form, horario: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 dark:text-slate-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest">Anfitrião</label>
                          <input
                              value={form.anfitriao}
                              onChange={e => setForm({ ...form, anfitriao: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 dark:text-slate-200"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest">Dia</label>
                          <select
                              value={form.diaSemana}
                              onChange={e => setForm({ ...form, diaSemana: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 dark:text-slate-200 appearance-none"
                          >
                            <option value="MONDAY">Segunda</option>
                            <option value="TUESDAY">Terça</option>
                            <option value="WEDNESDAY">Quarta</option>
                            <option value="THURSDAY">Quinta</option>
                            <option value="FRIDAY">Sexta</option>
                            <option value="SATURDAY">Sábado</option>
                            <option value="SUNDAY">Domingo</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest">Localização</label>
                        <input
                            placeholder="Rua, número, etc..."
                            value={form.endereco}
                            onChange={e => setForm({ ...form, endereco: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 pt-4 pb-4 md:pb-0">
                      <button
                          type="submit"
                          className="w-full bg-emerald-600 text-white font-black p-5 rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20 transition-all active:scale-95 uppercase text-xs tracking-[0.2em]"
                      >
                        {editandoId ? "Salvar Alterações" : "Confirmar Cadastro"}
                      </button>
                      <button
                          type="button"
                          onClick={fecharModal}
                          className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold p-5 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase text-xs tracking-widest"
                      >
                        Voltar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}
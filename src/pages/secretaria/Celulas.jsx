import { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import {
  Home,
  Plus,
  MapPin,
  User,
  Clock,
  Calendar,
  Search,
  X,
  Edit3,
  ChevronRight,
  Loader2
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
      horario: c.horario || ""
    });
    setIsModalOpen(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put(`/celulas/${editandoId}`, form);
      } else {
        await api.post("/celulas", form);
      }
      fecharModal();
      carregarDados();
    } catch (err) {
      alert("Erro ao salvar. Verifique os campos obrigatórios.");
    }
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setForm(formInicial);
    setEditandoId(null);
  };

  const traduzirDia = (dia) => {
    const dias = {
      MONDAY: "Segunda", TUESDAY: "Terça", WEDNESDAY: "Quarta",
      THURSDAY: "Quinta", FRIDAY: "Sexta", SATURDAY: "Sábado", SUNDAY: "Domingo"
    };
    return dias[dia] || dia;
  };

  const celulasFiltradas = celulas.filter(c =>
      c.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.nomeLider?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
      <div className="p-6 space-y-6 animate-in fade-in duration-500">

        {/* HEADER PREMIUM */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                <Home size={24} />
              </div>
              Gestão de Células
            </h3>
            <p className="text-slate-500 text-sm mt-1">{celulas.length} comunidades ativas no sistema</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                  type="text"
                  placeholder="Buscar célula..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
              />
            </div>
            <button
                onClick={abrirModalNovo}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Plus size={18} /> Nova Célula
            </button>
          </div>
        </div>

        {/* LISTAGEM EM GRID */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="animate-spin text-emerald-500" size={40} />
              <p className="text-slate-500 font-medium">Sincronizando células...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {celulasFiltradas.map((c) => (
                  <div
                      key={c.id}
                      onClick={() => abrirModalEdicao(c)}
                      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-[2rem] hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-emerald-500/5"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-xl">
                        {c.nome?.charAt(0)}
                      </div>
                      <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {traduzirDia(c.diaSemana)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800 dark:text-white text-lg group-hover:text-emerald-600 transition-colors">
                        {c.nome}
                      </h4>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                          <User size={14} className="text-emerald-500" />
                          <span className="font-medium">Líder: {c.nomeLider || "Não definido"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                          <MapPin size={14} className="text-emerald-500" />
                          <span className="truncate">{c.bairro || "Endereço não informado"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                          <Clock size={14} className="text-emerald-500" />
                          <span>{c.horario}h</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-emerald-600">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Detalhes</span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* MODAL PREMIUM */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-white dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">
                      {editandoId ? "Editar Célula" : "Nova Célula"}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">Preencha as informações da comunidade</p>
                  </div>
                  <button
                      onClick={fecharModal}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={salvar} className="p-8 grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Nome da Célula</label>
                    <input
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white"
                        value={form.nome}
                        onChange={e => setForm({ ...form, nome: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Líder Responsável</label>
                    <select
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white"
                        value={form.liderId}
                        onChange={e => setForm({ ...form, liderId: Number(e.target.value) })}
                    >
                      <option value="">Selecione...</option>
                      {lideresDisponiveis.map(u => (
                          <option key={u.id} value={u.id}>{u.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Anfitrião</label>
                    <input
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white"
                        value={form.anfitriao}
                        onChange={e => setForm({ ...form, anfitriao: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Endereço Completo</label>
                    <input
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white"
                        value={form.endereco}
                        onChange={e => setForm({ ...form, endereco: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Dia da Semana</label>
                    <select
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white"
                        value={form.diaSemana}
                        onChange={e => setForm({ ...form, diaSemana: e.target.value })}
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

                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Horário</label>
                    <input
                        type="time"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white"
                        value={form.horario}
                        onChange={e => setForm({ ...form, horario: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={fecharModal}
                        className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                    >
                      {editandoId ? "Atualizar Célula" : "Criar Célula"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}
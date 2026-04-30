import { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
// Correto
import {
  Home, Plus, MapPin, User, Clock, Search, X, ChevronRight, Loader2, Calendar, Moon, Sun
} from "lucide-react";

export default function Celulas() {
  const [celulas, setCelulas] = useState([]);
  const [lideresDisponiveis, setLideresDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [filtro, setFiltro] = useState("");

  // --- LÓGICA DE TEMA ---
  const [tema, setTema] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (tema === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", tema);
  }, [tema]);

  const toggleTema = () => setTema(tema === "light" ? "dark" : "light");
  // ----------------------

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

  const traduzirDia = (dia) => {
    const dias = {
      MONDAY: "Segunda-feira",
      TUESDAY: "Terça-feira",
      WEDNESDAY: "Quarta-feira",
      THURSDAY: "Quinta-feira",
      FRIDAY: "Sexta-feira",
      SATURDAY: "Sábado",
      SUNDAY: "Domingo"
    };
    return dias[dia] || dia;
  };

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
      alert(err.response?.data?.message || "Erro ao salvar célula.");
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
      <div className="p-6 min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 space-y-8 font-sans">
        {/* HEADER DASHBOARD STYLE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
                <Home size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Gestão de Células
              </h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium ml-1">
              Visualize e administre as comunidades registradas
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* BOTÃO DE TEMA */}
            <button
                onClick={toggleTema}
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              {tema === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200"
              />
            </div>

            <button
                onClick={abrirModalNovo}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
            >
              <Plus size={18} /> Cadastrar Célula
            </button>
          </div>
        </div>

        {/* GRID DE CÉLULAS */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-indigo-600">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Carregando informações...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {celulasFiltradas.map((c) => (
                  <div
                      key={c.id}
                      onClick={() => abrirModalEdicao(c)}
                      className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer relative"
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                          Ativa
                        </div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                          {c.nome}
                        </h4>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-400">
                        <ChevronRight size={18} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Líder Responsável</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{c.nomeLider || "Pendente"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Localização</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{c.bairro} • {c.anfitriao}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span className="text-xs font-semibold">{traduzirDia(c.diaSemana)}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white px-3 py-1 rounded-lg">
                        <Clock size={12} />
                        <span className="text-xs font-bold">{c.horario}h</span>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* MODAL DASHBOARD STYLE */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {editandoId ? "Editar Informações" : "Nova Célula"}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Configure os detalhes da sua comunidade</p>
                  </div>
                  <button onClick={fecharModal} className="text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-all">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={salvar} className="p-8">
                  <div className="grid grid-cols-2 gap-5">
                    {/* Exemplo de campo adaptado ao Dark Mode */}
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 block">Nome da Célula</label>
                      <input
                          required
                          placeholder="Ex: Vida Nova"
                          value={form.nome}
                          onChange={e => setForm({ ...form, nome: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3 rounded-xl outline-none transition-all text-sm"
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 block">Líder</label>
                      <select
                          required
                          value={form.liderId}
                          onChange={e => setForm({ ...form, liderId: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-3 rounded-xl outline-none transition-all text-sm appearance-none"
                      >
                        <option value="">Selecione...</option>
                        {lideresDisponiveis.map(u => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 block">Bairro</label>
                      <input
                          required
                          value={form.bairro}
                          onChange={e => setForm({ ...form, bairro: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-3 rounded-xl outline-none transition-all text-sm"
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 block">Anfitrião</label>
                      <input
                          value={form.anfitriao}
                          onChange={e => setForm({ ...form, anfitriao: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-3 rounded-xl outline-none transition-all text-sm"
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 block">Dia</label>
                      <select
                          value={form.diaSemana}
                          onChange={e => setForm({ ...form, diaSemana: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-3 rounded-xl outline-none transition-all text-sm"
                      >
                        <option value="MONDAY">Segunda-feira</option>
                        <option value="TUESDAY">Terça-feira</option>
                        <option value="WEDNESDAY">Quarta-feira</option>
                        <option value="THURSDAY">Quinta-feira</option>
                        <option value="FRIDAY">Sexta-feira</option>
                        <option value="SATURDAY">Sábado</option>
                        <option value="SUNDAY">Domingo</option>
                      </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 block">Horário</label>
                      <input
                          type="time"
                          value={form.horario}
                          onChange={e => setForm({ ...form, horario: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-3 rounded-xl outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                    <button
                        type="button"
                        onClick={fecharModal}
                        className="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm border border-slate-200 dark:border-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-sm"
                    >
                      {editandoId ? "Salvar Alterações" : "Finalizar Cadastro"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}
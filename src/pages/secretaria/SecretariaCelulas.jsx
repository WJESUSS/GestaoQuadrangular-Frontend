import { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import {
  Trash2,
  UserPlus,
  Star,
  Users,
  Search,
  ChevronRight,
  Loader2,
  MapPin
} from "lucide-react";

export default function SecretariaCelulas() {
  const [celulas, setCelulas] = useState([]);
  const [celulaSelecionada, setCelulaSelecionada] = useState(null);
  const [membros, setMembros] = useState([]);
  const [membrosSemCelula, setMembrosSemCelula] = useState([]);
  const [novoMembroId, setNovoMembroId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAcao, setLoadingAcao] = useState(false);

  const getToken = () => localStorage.getItem("token");

  const carregarCelulas = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await api.get("/celulas", { headers: { Authorization: `Bearer ${token}` } });
      setCelulas(res.data);
    } catch (err) {
      console.error("Erro ao carregar células:", err);
    }
  }, []);

  const carregarMembrosSemCelula = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await api.get("/membros/sem-celula", { headers: { Authorization: `Bearer ${token}` } });
      setMembrosSemCelula(res.data);
    } catch (err) {
      console.error("Erro ao carregar membros sem célula:", err);
    }
  }, []);

  const carregarMembrosDaCelula = useCallback(async (celulaId) => {
    if (!celulaId) return;
    const token = getToken();
    setLoading(true);
    try {
      const res = await api.get(`/celulas/${celulaId}/membros`, { headers: { Authorization: `Bearer ${token}` } });
      setMembros(res.data);
    } catch (err) {
      console.error("Erro ao carregar membros da célula:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarCelulas();
    carregarMembrosSemCelula();
  }, [carregarCelulas, carregarMembrosSemCelula]);

  useEffect(() => {
    if (celulaSelecionada?.id) {
      carregarMembrosDaCelula(celulaSelecionada.id);
    } else {
      setMembros([]);
    }
  }, [celulaSelecionada, carregarMembrosDaCelula]);

  const handleAdicionarMembro = async () => {
    if (!novoMembroId || !celulaSelecionada) return;
    setLoadingAcao(true);
    const token = getToken();
    try {
      await api.post(`/celulas/adicionar/${celulaSelecionada.id}/membros/${novoMembroId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNovoMembroId("");
      await Promise.all([carregarMembrosDaCelula(celulaSelecionada.id), carregarMembrosSemCelula()]);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao vincular membro.");
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleRemoverMembro = async (membroId) => {
    if (!window.confirm("Remover este integrante da célula?")) return;
    setLoadingAcao(true);
    const token = getToken();
    try {
      await api.delete(`/celulas/${celulaSelecionada.id}/membros/${membroId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await Promise.all([carregarMembrosDaCelula(celulaSelecionada.id), carregarMembrosSemCelula()]);
    } catch (err) {
      alert("Erro ao remover membro.");
    } finally {
      setLoadingAcao(false);
    }
  };

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-3 md:p-8 space-y-6 animate-in fade-in duration-700 font-sans transition-colors">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto w-full">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 italic tracking-tighter">
              <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                <Users size={24} />
              </div>
              GESTÃO DE CÉLULAS
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium italic">
              Controle de membresia e liderança estratégica.
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto w-full space-y-6">
          {/* SELEÇÃO DE CÉLULA */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-8 rounded-[2rem] shadow-sm transition-all">
            <label className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-3 block ml-1">
              Unidade de Cuidado Selecionada
            </label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <select
                  className="w-full pl-11 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-base md:text-lg font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                  value={celulaSelecionada?.id || ""}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    const celula = celulas.find((c) => c.id === id);
                    setCelulaSelecionada(celula || null);
                  }}
              >
                <option value="">Selecione uma Célula...</option>
                {celulas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} {c.bairro ? `(${c.bairro})` : ""}
                    </option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={18} />
            </div>
          </section>

          {celulaSelecionada && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500">

                {/* ESQUERDA */}
                <aside className="lg:col-span-4 space-y-6">
                  <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                    <Users className="absolute -right-4 -bottom-4 text-white/10" size={120} />
                    <div className="relative z-10">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Grupo Selecionado</h4>
                      <h2 className="text-2xl font-black italic tracking-tighter truncate">{celulaSelecionada.nome}</h2>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span>{celulaSelecionada.nomeLider || "Sem Líder"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VINCULAR */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-[2rem] shadow-sm">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <UserPlus size={16} className="text-indigo-600" />
                      Novo Integrante
                    </h3>
                    <div className="space-y-3">
                      <select
                          className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-700 dark:text-white outline-none"
                          value={novoMembroId}
                          onChange={(e) => setNovoMembroId(e.target.value)}
                      >
                        <option value="">Buscar membro...</option>
                        {membrosSemCelula.map((m) => (
                            <option key={m.id} value={m.id}>{m.nome}</option>
                        ))}
                      </select>
                      <button
                          onClick={handleAdicionarMembro}
                          disabled={!novoMembroId || loadingAcao}
                          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95"
                      >
                        {loadingAcao ? <Loader2 className="animate-spin" size={16} /> : "Vincular Agora"}
                      </button>
                    </div>
                  </div>
                </aside>

                {/* DIREITA: LISTA DE MEMBROS */}
                <main className="lg:col-span-8">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[10px]">
                        Corpo de Membros ({membros.length})
                      </h3>
                    </div>

                    {/* Tabela Responsiva com scroll lateral suave se necessário */}
                    <div className="overflow-x-auto w-full scrollbar-hide">
                      <table className="w-full min-w-[500px]">
                        <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50">
                          <th className="px-6 py-4 text-left">Nome</th>
                          <th className="px-4 py-4 text-left">Status</th>
                          <th className="px-6 py-4 text-center w-20">Ação</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr><td colSpan="3" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></td></tr>
                        ) : membros.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-bold text-sm text-slate-700 dark:text-slate-200">
                                <div className="truncate max-w-[150px] md:max-w-none">
                                  {m.nome}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                {Number(m.id) === Number(celulaSelecionada.liderId) ? (
                                    <span className="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase">Líder</span>
                                ) : (
                                    <span className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase">Membro</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex justify-center items-center">
                                  {/* BOTÃO SEMPRE VISÍVEL COM ÁREA DE CLIQUE AUMENTADA PARA CELULAR */}
                                  <button
                                      onClick={() => handleRemoverMembro(m.id)}
                                      disabled={loadingAcao}
                                      className="flex items-center justify-center w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-75 shadow-sm border border-rose-100 dark:border-rose-500/20"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </main>
              </div>
          )}
        </div>
      </div>
  );
}
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
  Building2
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
      <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 font-sans">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 italic tracking-tighter">
              <div className="p-2 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                <Users size={28} />
              </div>
              GESTÃO DE CÉLULAS
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium italic">
              Controle de membresia e liderança estratégica.
            </p>
          </div>
        </header>

        {/* SELEÇÃO DE CÉLULA */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm transition-all hover:shadow-md">
          <label className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-4 block ml-1">
            Unidade de Cuidado Selecionada
          </label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <select
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-lg font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
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
                    {c.nome} {c.bairro ? `(${c.bairro})` : ""} — Líder: {c.nomeLider || "Pendente"}
                  </option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={20} />
          </div>
        </section>

        {celulaSelecionada && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">

              {/* LADO ESQUERDO: INFOS */}
              <aside className="lg:col-span-4 space-y-6">
                <div className="bg-indigo-600 dark:bg-indigo-500 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                  <Users className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-125 transition-transform duration-700" size={140} />
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Informações do Grupo</h4>
                    <h2 className="text-3xl font-black italic tracking-tighter truncate">{celulaSelecionada.nome}</h2>
                    <div className="mt-4 space-y-2">
                      <p className="flex items-center gap-2 text-sm font-bold bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        Líder: {celulaSelecionada.nomeLider || "A definir"}
                      </p>
                      {celulaSelecionada.bairro && (
                          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-100">
                            <Building2 size={12} /> Bairro: {celulaSelecionada.bairro}
                          </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* VINCULAR INTEGRANTE */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UserPlus size={18} className="text-indigo-500" /> Vincular Integrante
                  </h3>
                  <div className="space-y-4">
                    <select
                        className="w-full p-3.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        value={novoMembroId}
                        onChange={(e) => setNovoMembroId(e.target.value)}
                    >
                      <option value="">Membros disponíveis...</option>
                      {membrosSemCelula.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nome} {m.bairro ? `(${m.bairro})` : ""}
                          </option>
                      ))}
                    </select>
                    <button
                        onClick={handleAdicionarMembro}
                        disabled={!novoMembroId || loadingAcao}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95"
                    >
                      {loadingAcao ? <Loader2 className="animate-spin" size={18} /> : "Efetivar Vínculo"}
                    </button>
                  </div>
                </div>
              </aside>

              {/* LADO DIREITO: LISTA */}
              <main className="lg:col-span-8">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[10px] flex items-center gap-2">
                      Corpo de Membros
                      <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md text-[12px]">
                    {membros.length}
                  </span>
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 dark:bg-slate-800/50">
                        <th className="px-8 py-4 text-left">Integrante</th>
                        <th className="px-6 py-4 text-left">Papel</th>
                        <th className="px-8 py-4 text-right">Gestão</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {loading ? (
                          <tr>
                            <td colSpan="3" className="py-20 text-center">
                              <Loader2 className="animate-spin mx-auto text-indigo-600 mb-2" size={32} />
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sincronizando...</p>
                            </td>
                          </tr>
                      ) : membros.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                              Nenhum integrante vinculado
                            </td>
                          </tr>
                      ) : (
                          membros.map((m) => (
                              <tr key={m.id} className="group hover:bg-slate-50 dark:hover:bg-indigo-500/[0.02] transition-all duration-300">
                                <td className="px-8 py-5 font-bold text-slate-700 dark:text-slate-200">
                                  {m.nome}
                                </td>
                                <td className="px-6 py-5">
                                  {Number(m.id) === Number(celulaSelecionada.liderId) ? (
                                      <span className="bg-yellow-400/10 text-yellow-600 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-yellow-400/20 shadow-sm">Líder</span>
                                  ) : (
                                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">Integrante</span>
                                  )}
                                </td>
                                <td className="px-8 py-5 text-right">
                                  {/* BOTÃO REMOVER PREMIUM */}
                                  <button
                                      onClick={() => handleRemoverMembro(m.id)}
                                      disabled={loadingAcao}
                                      className="relative group/btn inline-flex items-center justify-center p-2.5 rounded-xl transition-all duration-300
                                         bg-transparent hover:bg-rose-50 dark:hover:bg-rose-500/10
                                         active:scale-90 disabled:opacity-30
                                         opacity-0 group-hover:opacity-100 sm:opacity-100"
                                  >
                                    <Trash2
                                        size={18}
                                        className="text-slate-300 dark:text-slate-600
                                           group-hover/btn:text-rose-500
                                           group-hover/btn:rotate-12
                                           transition-all duration-300"
                                    />
                                    <span className="absolute -top-10 right-0 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all duration-300 uppercase tracking-tighter shadow-xl pointer-events-none border border-white/10">
                                Desvincular
                              </span>
                                  </button>
                                </td>
                              </tr>
                          ))
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </main>
            </div>
        )}
      </div>
  );
}
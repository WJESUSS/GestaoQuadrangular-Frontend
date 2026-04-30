import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import {
  Plus, Phone, Calendar, X, Search,
  Loader2, UserCheck, Mail, ExternalLink, Sparkles
} from "lucide-react";

export default function TelaVisitantes({ celulaId }) {
  const [loading, setLoading] = useState(false);
  const [visitantes, setVisitantes] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [visitanteSelecionado, setVisitanteSelecionado] = useState(null);

  const estadoInicial = {
    nome: "",
    telefone: "",
    email: "",
    dataPrimeiraVisita: new Date().toISOString().split("T")[0],
    origem: "CONVITE",
    responsavelAcompanhamento: "",
    ativo: true,
  };

  const [formVisitante, setFormVisitante] = useState(estadoInicial);

  const listaOrigens = [
    { id: 'CONVITE', label: 'Convite', emoji: '✉️' },
    { id: 'CASA_DE_PAZ', label: 'Casa de Paz', emoji: '🏠' },
    { id: 'EVENTO', label: 'Evento', emoji: '🎟️' },
    { id: 'MISSSAO_70', label: 'Missão 70', emoji: '👣' },
    { id: 'REDES_SOCIAIS', label: 'Social', emoji: '📱' },
    { id: 'CELULA', label: 'Célula', emoji: '👥' },
  ];

  const getHeaders = () => {
    const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
    return { Authorization: `Bearer ${token}` };
  };

  const carregarVisitantes = useCallback(async () => {
    if (!celulaId) return;
    try {
      setLoading(true);
      const res = await api.get(`/visitantes/celula/${celulaId}/ativos`, { headers: getHeaders() });
      setVisitantes(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar visitantes:", err);
    } finally {
      setLoading(false);
    }
  }, [celulaId]);

  useEffect(() => {
    carregarVisitantes();
  }, [carregarVisitantes]);

  const handleSalvarVisitante = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...formVisitante, celulaId: Number(celulaId) };
      if (editando && visitanteSelecionado) {
        await api.put(`/visitantes/${visitanteSelecionado.id}`, payload, { headers: getHeaders() });
      } else {
        await api.post("/visitantes", payload, { headers: getHeaders() });
      }
      fecharModal();
      carregarVisitantes();
    } catch (err) {
      alert("Erro ao salvar dados.");
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (v = null) => {
    if (v) {
      setEditando(true);
      setVisitanteSelecionado(v);
      setFormVisitante({ ...v });
    } else {
      setEditando(false);
      setFormVisitante(estadoInicial);
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setFormVisitante(estadoInicial);
  };

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-50 font-sans p-5 transition-colors duration-400">
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap');
        .card-blur { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 10px; }
      `}</style>

        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <header className="bg-white dark:bg-[#171721]/70 card-blur border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                <Sparkles size={14} /> GESTÃO DE NOVOS
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Visitantes</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Acompanhamento e Consolidação</p>
            </div>
            <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-indigo-500/25"
                onClick={() => abrirModal()}
            >
              <Plus size={20} strokeWidth={3} />
              NOVO VISITANTE
            </button>
          </header>

          {/* SEARCH */}
          <div className="relative mb-10">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
            <input
                type="text"
                placeholder="Pesquisar por nome do visitante..."
                className="w-full bg-white dark:bg-[#171721]/70 border border-slate-200 dark:border-white/10 rounded-3xl py-5 pl-16 pr-6 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* GRID */}
          {loading && visitantes.length === 0 ? (
              <div className="flex flex-col items-center py-24 opacity-50">
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                <p className="font-bold tracking-widest text-xs uppercase">Sincronizando base de dados...</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visitantes.filter(v => v.nome.toLowerCase().includes(busca.toLowerCase())).map((v) => (
                    <div key={v.id} className="bg-white dark:bg-[#171721]/70 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 hover:translate-y-[-8px] hover:border-indigo-500/50 transition-all duration-300 shadow-lg group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                          {v.nome.charAt(0)}
                        </div>
                        <div className="text-right">
                    <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg uppercase">
                      {v.origem?.replace('_', ' ')}
                    </span>
                          <p className="text-[11px] text-slate-400 mt-2 font-bold">
                            {new Date(v.dataPrimeiraVisita).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-extrabold tracking-tight group-hover:text-indigo-500 transition-colors">{v.nome}</h3>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                              <Phone size={14} />
                            </div>
                            {v.telefone}
                          </div>
                          {v.email && (
                              <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                  <Mail size={14} />
                                </div>
                                <span className="truncate">{v.email}</span>
                              </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Acompanhamento</p>
                            <p className="text-sm font-bold text-indigo-500">
                              {v.responsavelAcompanhamento || "Pendente"}
                            </p>
                          </div>
                          <button
                              onClick={() => abrirModal(v)}
                              className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center"
                          >
                            <ExternalLink size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>

        {/* MODAL */}
        {modalAberto && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/10 w-full max-w-[550px] rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{editando ? 'Editar Perfil' : 'Cadastrar Visita'}</h2>
                    <p className="text-sm text-slate-500 font-medium">Insira os dados para o discipulado.</p>
                  </div>
                  <button onClick={fecharModal} className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSalvarVisitante} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Nome Completo</label>
                    <input
                        required
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all font-bold"
                        value={formVisitante.nome}
                        onChange={(e) => setFormVisitante({ ...formVisitante, nome: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase ml-1">WhatsApp</label>
                      <input
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all font-bold"
                          placeholder="(00) 00000-0000"
                          value={formVisitante.telefone}
                          onChange={(e) => setFormVisitante({ ...formVisitante, telefone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Data da Visita</label>
                      <input
                          type="date"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all font-bold"
                          value={formVisitante.dataPrimeiraVisita}
                          onChange={(e) => setFormVisitante({ ...formVisitante, dataPrimeiraVisita: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Quem irá consolidar?</label>
                    <div className="relative">
                      <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                      <input
                          placeholder="Nome do líder ou obreiro"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 pl-12 outline-none focus:border-indigo-500 transition-all font-bold"
                          value={formVisitante.responsavelAcompanhamento}
                          onChange={(e) => setFormVisitante({ ...formVisitante, responsavelAcompanhamento: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Origem da Visita</label>
                    <div className="flex flex-wrap gap-2">
                      {listaOrigens.map((item) => (
                          <button
                              key={item.id}
                              type="button"
                              onClick={() => setFormVisitante({ ...formVisitante, origem: item.id })}
                              className={`py-2.5 px-4 rounded-xl text-[10px] font-black uppercase transition-all border ${
                                  formVisitante.origem === item.id
                                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                      : "bg-slate-100 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:border-indigo-500"
                              }`}
                          >
                            {item.emoji} {item.label}
                          </button>
                      ))}
                    </div>
                  </div>

                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black text-xs tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (editando ? 'ATUALIZAR DADOS' : 'FINALIZAR CADASTRO')}
                  </button>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}
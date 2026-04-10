import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import {
  Plus,
  User,
  Phone,
  Mail,
  Calendar,
  X,
  Search,
  UserPlus,
  Loader2,
  ChevronRight,
  Filter,
  Check,
  UserCheck
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
    responsavelAcompanhamento: "", // Campo solicitado
    ativo: true,
  };

  const [formVisitante, setFormVisitante] = useState(estadoInicial);

  const listaOrigens = [
    { id: 'CONVITE', label: 'Convite' },
    { id: 'CASA_DE_PAZ', label: 'Casa de Paz' },
    { id: 'EVENTO', label: 'Evento' },
    { id: 'MISSSAO_70', label: 'Missão 70' },
    { id: 'REDES_SOCIAIS', label: 'Redes Sociais' },
    { id: 'CELULA', label: 'Célula' },
    { id: 'OUTROS', label: 'Outros' },
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
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Visitantes</h2>
            <p className="text-slate-500 font-medium text-sm">Gestão de novos membros e consolidação.</p>
          </div>
          <button onClick={() => abrirModal()} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all">
            <Plus size={20} strokeWidth={3} /> NOVO VISITANTE
          </button>
        </div>

        {/* BUSCA */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text" placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
        </div>

        {/* LISTA DE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visitantes.filter(v => v.nome.toLowerCase().includes(busca.toLowerCase())).map((v) => (
            <div key={v.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {v.nome.charAt(0)}
                </div>
                <span className="text-[9px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full text-slate-500">{v.origem}</span>
              </div>
              <h3 className="font-bold text-slate-800 truncate">{v.nome}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Phone size={12}/> {v.telefone}</p>
              <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsável:</p>
                <p className="text-xs font-semibold text-indigo-600">{v.responsavelAcompanhamento || "Não designado"}</p>
              </div>
              <button onClick={() => abrirModal(v)} className="mt-4 w-full py-2 bg-slate-50 hover:bg-indigo-50 rounded-xl text-[10px] font-black text-slate-500 hover:text-indigo-600 transition-colors">
                VER DETALHES
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={fecharModal} />
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative p-8 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editando ? 'Editar' : 'Cadastrar'} Visitante</h3>
              <button onClick={fecharModal} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>

            <form onSubmit={handleSalvarVisitante} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input required className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={formVisitante.nome} onChange={(e) => setFormVisitante({ ...formVisitante, nome: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone</label>
                  <input className="w-full px-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formVisitante.telefone} onChange={(e) => setFormVisitante({ ...formVisitante, telefone: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data da Visita</label>
                  <input type="date" className="w-full px-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formVisitante.dataPrimeiraVisita} onChange={(e) => setFormVisitante({ ...formVisitante, dataPrimeiraVisita: e.target.value })} />
                </div>
              </div>

              {/* RESPONSÁVEL ACOMPANHAMENTO */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsável pelo Acompanhamento</label>
                <div className="relative">
                  <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input placeholder="Quem vai cuidar deste visitante?" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formVisitante.responsavelAcompanhamento} onChange={(e) => setFormVisitante({ ...formVisitante, responsavelAcompanhamento: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Origem</label>
                <div className="flex flex-wrap gap-2">
                  {listaOrigens.map((item) => (
                    <button key={item.id} type="button" onClick={() => setFormVisitante({ ...formVisitante, origem: item.id })}
                      className={`py-2 px-3 rounded-xl text-[9px] font-black uppercase transition-all border ${formVisitante.origem === item.id ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-400"}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                <input type="email" className="w-full px-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formVisitante.email} onChange={(e) => setFormVisitante({ ...formVisitante, email: e.target.value })} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[1.5rem] font-black tracking-widest shadow-xl transition-all disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin mx-auto"/> : (editando ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
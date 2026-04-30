import { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import {
  UserPlus,
  Search,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Plus,
  X,
  ChevronRight,
  Loader2,
  Heart,
  Users
} from "lucide-react";

export default function Visitantes() {
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [filtro, setFiltro] = useState("");

  const formInicial = {
    nome: "", email: "", telefone: "",
    dataPrimeiraVisita: new Date().toISOString().split('T')[0], // Já inicia com a data de hoje
    origem: "CONVITE",
    responsavelAcompanhamento: "", convertido: false
  };
  const [form, setForm] = useState(formInicial);

  const listar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/visitantes");
      setVisitantes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erro ao listar visitantes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { listar(); }, [listar]);

  const abrirModalNovo = () => {
    setEditandoId(null);
    setForm(formInicial);
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (v) => {
    setEditandoId(v.id);
    setForm({
      nome: v.nome || "",
      email: v.email || "",
      telefone: v.telefone || "",
      dataPrimeiraVisita: v.dataPrimeiraVisita ? v.dataPrimeiraVisita.split("T")[0] : "",
      origem: v.origem || "CONVITE",
      responsavelAcompanhamento: v.responsavelAcompanhamento || "",
      convertido: !!v.convertido
    });
    setIsModalOpen(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put(`/visitantes/${editandoId}`, form);
      } else {
        await api.post("/visitantes", form);
      }
      fecharModal();
      listar();
    } catch (err) {
      alert("Erro ao salvar visitante.");
    }
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setForm(formInicial);
    setEditandoId(null);
  };

  const visitantesFiltrados = visitantes.filter(v =>
      v.nome?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
      <div className="min-h-screen pb-20 md:pb-10 bg-slate-50 dark:bg-slate-950 p-4 md:p-8 animate-in fade-in duration-700">

        {/* HEADER DINÂMICO */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-xl shadow-purple-500/30">
                <UserPlus size={28} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white leading-tight">
                  Visitantes
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                  {visitantes.length} Pessoas alcançadas
                </p>
              </div>
            </div>
          </div>

          {/* BUSCA E AÇÃO */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input
                  type="text"
                  placeholder="Quem você está procurando?"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-none rounded-3xl text-sm font-medium shadow-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
              />
            </div>
            <button
                onClick={abrirModalNovo}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-purple-600/20 active:scale-95"
            >
              <Plus size={20} /> Novo Cadastro
            </button>
          </div>
        </div>

        {/* GRID DE CARDS */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="animate-spin text-purple-500" size={48} />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Carregando lista...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {visitantesFiltrados.map((v) => (
                  <div
                      key={v.id}
                      onClick={() => abrirModalEdicao(v)}
                      className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[2.5rem] hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer shadow-sm relative overflow-hidden active:scale-[0.98]"
                  >
                    {v.convertido && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white px-5 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1 shadow-sm">
                          <Heart size={10} fill="white" /> Decidido
                        </div>
                    )}

                    <div className="flex items-center gap-4 mb-5">
                      <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-slate-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-2xl group-hover:rotate-3 transition-transform">
                        {v.nome?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 dark:text-white text-lg leading-tight truncate">
                          {v.nome}
                        </h4>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 rounded-lg uppercase tracking-tighter">
                    {v.origem?.replace("_", " ")}
                  </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-medium">
                        <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Phone size={14} className="text-purple-500" />
                        </div>
                        {v.telefone || "Sem telefone"}
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-medium">
                        <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Calendar size={14} className="text-purple-500" />
                        </div>
                        {v.dataPrimeiraVisita ? new Date(v.dataPrimeiraVisita).toLocaleDateString() : "Data não registrada"}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Acompanhamento</span>
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400 italic">
                    {v.responsavelAcompanhamento || "A definir"}
                  </span>
                      </div>
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* MODAL - DESIGN MOBILE-FIRST (BOTTOM SHEET NO MOBILE) */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4 transition-all">
              <div className="bg-white dark:bg-slate-900 rounded-t-[3rem] md:rounded-[3rem] w-full max-w-xl max-h-[95vh] overflow-y-auto shadow-2xl border-t md:border border-white/10 animate-in slide-in-from-bottom md:zoom-in-95 duration-300">

                <div className="sticky top-0 z-10 p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter leading-none">
                      {editandoId ? "Atualizar Perfil" : "Novo Amigo"}
                    </h3>
                    <p className="text-[10px] font-bold text-purple-600 uppercase mt-1 tracking-[0.2em]">Ficha de Integração</p>
                  </div>
                  <button onClick={fecharModal} className="h-12 w-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full transition-colors text-slate-500 hover:bg-rose-100 hover:text-rose-600">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={salvar} className="p-6 md:p-8 space-y-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest">Nome do Visitante</label>
                    <input
                        required
                        placeholder="Nome completo"
                        className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 outline-none dark:text-white transition-all shadow-inner"
                        value={form.nome}
                        onChange={e => setForm({...form, nome: e.target.value})}
                    />
                  </div>

                  {/* Contatos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest">WhatsApp</label>
                      <input
                          placeholder="(00) 00000-0000"
                          className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:border-purple-500 dark:text-white outline-none shadow-inner"
                          value={form.telefone}
                          onChange={e => setForm({...form, telefone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest">E-mail</label>
                      <input
                          type="email"
                          placeholder="E-mail opcional"
                          className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:border-purple-500 dark:text-white outline-none shadow-inner"
                          value={form.email}
                          onChange={e => setForm({...form, email: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Data e Origem */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest">Data da Visita</label>
                      <input
                          type="date"
                          className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:border-purple-500 dark:text-white outline-none shadow-inner"
                          value={form.dataPrimeiraVisita}
                          onChange={e => setForm({...form, dataPrimeiraVisita: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest">Como chegou?</label>
                      <select
                          className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:border-purple-500 dark:text-white outline-none shadow-inner appearance-none"
                          value={form.origem}
                          onChange={e => setForm({...form, origem: e.target.value})}
                      >
                        <option value="CONVITE">Pelo Convite</option>
                        <option value="REDES_SOCIAIS">Redes Sociais</option>
                        <option value="ESPONTANEO">Foi por conta própria</option>
                        <option value="OUTRO">Outro motivo</option>
                      </select>
                    </div>
                  </div>

                  {/* Acompanhamento */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest text-center block">Quem vai cuidar dele(a)?</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                          placeholder="Nome do líder responsável"
                          className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl p-4 pl-12 text-sm font-bold focus:border-purple-500 dark:text-white outline-none shadow-inner"
                          value={form.responsavelAcompanhamento}
                          onChange={e => setForm({...form, responsavelAcompanhamento: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Checkbox Convertido Estilizado */}
                  <label
                      className={`flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all border-2 shadow-sm ${
                          form.convertido
                              ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={24} className={form.convertido ? 'text-white' : 'text-slate-400'} />
                      <span className="text-sm font-black uppercase tracking-tight">Já aceitou Jesus?</span>
                    </div>
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={form.convertido}
                        onChange={e => setForm({...form, convertido: e.target.checked})}
                    />
                    <div className={`h-6 w-11 rounded-full relative transition-colors ${form.convertido ? 'bg-white/30' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${form.convertido ? 'right-1' : 'left-1'}`} />
                    </div>
                  </label>

                  <button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-500/40 transition-all active:scale-95 text-sm"
                  >
                    {editandoId ? "Salvar Alterações" : "Confirmar Cadastro"}
                  </button>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}
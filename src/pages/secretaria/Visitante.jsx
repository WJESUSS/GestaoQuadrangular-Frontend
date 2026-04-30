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
  Heart
} from "lucide-react";

export default function Visitantes() {
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [filtro, setFiltro] = useState("");

  const formInicial = {
    nome: "", email: "", telefone: "",
    dataPrimeiraVisita: "", origem: "CONVITE",
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
      dataPrimeiraVisita: v.dataPrimeiraVisita || "",
      origem: v.origem || "CONVITE",
      responsavelAcompanhamento: v.responsavelAcompanhamento || "",
      convertido: v.convertido || false
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
    } catch (err) { alert("Erro ao salvar visitante."); }
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
      <div className="p-6 space-y-8 animate-in fade-in duration-700">

        {/* HEADER PREMIUM */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-2xl text-white shadow-lg shadow-purple-500/20">
                <UserPlus size={24} />
              </div>
              Gestão de Visitantes
            </h3>
            <p className="text-slate-500 text-sm mt-1">Acompanhe as pessoas que estão chegando na igreja.</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
              />
            </div>
            <button
                onClick={abrirModalNovo}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-purple-600/20 active:scale-95"
            >
              <Plus size={18} /> Novo Visitante
            </button>
          </div>
        </div>

        {/* CONTEÚDO */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="animate-spin text-purple-500" size={40} />
              <p className="text-slate-500 font-medium">Buscando novos rostos...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visitantesFiltrados.map((v) => (
                  <div
                      key={v.id}
                      onClick={() => abrirModalEdicao(v)}
                      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-[2.5rem] hover:border-purple-500 dark:hover:border-purple-500 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-purple-500/5 relative overflow-hidden"
                  >
                    {/* Badge Convertido */}
                    {v.convertido && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Heart size={10} fill="white" /> Convertido
                        </div>
                    )}

                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-14 w-14 rounded-3xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 flex items-center justify-center font-black text-2xl group-hover:scale-110 transition-transform">
                        {v.nome?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white uppercase truncate max-w-[150px]">
                          {v.nome}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {v.origem?.replace("_", " ")}
                  </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                        <Phone size={14} className="text-purple-500" />
                        {v.telefone || "Sem telefone"}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                        <Mail size={14} className="text-purple-500" />
                        <span className="truncate">{v.email || "Sem e-mail"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                        <Calendar size={14} className="text-purple-500" />
                        Visitou em {v.dataPrimeiraVisita ? new Date(v.dataPrimeiraVisita).toLocaleDateString() : "N/D"}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Resp: <span className="text-purple-600 dark:text-purple-400">{v.responsavelAcompanhamento || "Pendente"}</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* MODAL PREMIUM */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl border border-white dark:border-slate-800 animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">
                      {editandoId ? "Atualizar Ficha" : "Nova Visita"}
                    </h3>
                  </div>
                  <button onClick={fecharModal} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={salvar} className="p-8 space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome Completo</label>
                    <input required placeholder="Ex: João Silva" className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl p-3.5 text-sm focus:ring-2 focus:ring-purple-500 dark:text-white transition-all" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">E-mail</label>
                      <input type="email" placeholder="email@exemplo.com" className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl p-3.5 text-sm focus:ring-2 focus:ring-purple-500 dark:text-white" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">WhatsApp</label>
                      <input placeholder="(00) 00000-0000" className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl p-3.5 text-sm focus:ring-2 focus:ring-purple-500 dark:text-white" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Data da Visita</label>
                      <input type="date" className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl p-3.5 text-sm focus:ring-2 focus:ring-purple-500 dark:text-white" value={form.dataPrimeiraVisita} onChange={e => setForm({...form, dataPrimeiraVisita: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Origem</label>
                      <select className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl p-3.5 text-sm focus:ring-2 focus:ring-purple-500 dark:text-white" value={form.origem} onChange={e => setForm({...form, origem: e.target.value})}>
                        <option value="CONVITE">Convite</option>
                        <option value="REDES_SOCIAIS">Redes Sociais</option>
                        <option value="ESPONTANEO">Espontâneo</option>
                        <option value="OUTRO">Outro</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Quem vai acompanhar?</label>
                    <input placeholder="Nome do obreiro/líder" className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl p-3.5 text-sm focus:ring-2 focus:ring-purple-500 dark:text-white" value={form.responsavelAcompanhamento} onChange={e => setForm({...form, responsavelAcompanhamento: e.target.value})} />
                  </div>

                  <label className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all border-2 ${form.convertido ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-500/10' : 'bg-slate-50 border-transparent dark:bg-slate-800'}`}>
                    <input type="checkbox" className="w-5 h-5 accent-emerald-500" checked={form.convertido} onChange={e => setForm({...form, convertido: e.target.checked})} />
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className={form.convertido ? 'text-emerald-500' : 'text-slate-400'} />
                      <span className={`text-sm font-bold ${form.convertido ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>Já aceitou a Jesus (Convertido)?</span>
                    </div>
                  </label>

                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-purple-500/30 transition-all active:scale-95">
                    {editandoId ? "Salvar Alterações" : "Efetivar Cadastro"}
                  </button>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}
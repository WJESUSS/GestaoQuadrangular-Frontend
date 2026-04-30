import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import HistoricoRelatorios from "./HistoricoRelatorios";
import TelaRelatorio from "./TelaRelatorio";
import TelaVisitantes from "./TelaVisitantes";
import TelaFichas from "./TelaFichas";
import RelatorioDiscipulado from "./RelatorioDiscipulado";
import {
  Trash2, Loader2, Users, Plus, Search, X, ArrowLeft,
  TrendingUp, Target, Sparkles, LayoutDashboard, LogOut,
  Sun, Moon
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
};

export default function DashboardLider() {
  const [abaAtiva, setAbaAtiva] = useState("home");
  const [celula, setCelula] = useState(null);
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalAddMembro, setShowModalAddMembro] = useState(false);
  const [showModalMultiplicacao, setShowModalMultiplicacao] = useState(false);
  const [motivoMultiplicacao, setMotivoMultiplicacao] = useState("");
  const [solicitandoMulti, setSolicitandoMulti] = useState(false);

  // ESTADO DO TEMA
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // APLICAR TEMA
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const resCelula = await api.get("/celulas/minha-celula");
      const celulaData = resCelula.data;
      setCelula(celulaData);

      if (celulaData?.id) {
        const resM = await api.get(`/celulas/${celulaData.id}/membros`);
        const unique = (arr) => arr.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));
        setMembros(unique(resM.data || []));
      }
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const removerMembro = async (membroId, nome) => {
    if (!window.confirm(`Remover ${nome} da célula?`)) return;
    try {
      await api.delete(`/celulas/${celula.id}/membros/${membroId}`);
      carregarDados();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao remover.");
    }
  };

  const solicitarMultiplicacao = async () => {
    if (!motivoMultiplicacao.trim()) return alert("O motivo é obrigatório.");
    setSolicitandoMulti(true);
    try {
      await api.post(`/celulas/${celula.id}/solicitar-multiplicacao`, { motivo: motivoMultiplicacao.trim() });
      alert("Solicitação enviada!");
      setShowModalMultiplicacao(false);
      setMotivoMultiplicacao("");
      carregarDados();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao enviar.");
    } finally {
      setSolicitandoMulti(false);
    }
  };

  const qtdMembros = celula?.quantidadeMembrosAtivos || membros.length;
  const statusMulti = celula?.statusMultiplicacao || "NORMAL";
  const podeSolicitar = qtdMembros >= 8 && ["NORMAL", "SOLICITADO", "REJEITADO"].includes(statusMulti);
  const porcentagemMeta = Math.min((qtdMembros / 12) * 100, 100);

  if (loading) return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-500">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
  );

  return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

          {/* Header Ultra Premium */}
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-600 dark:bg-indigo-500 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 text-white transition-all">
                <LayoutDashboard size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Célula {celula?.nome || "—"}</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Anfitrião: {celula?.anfitriao || "Não definido"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* BOTÃO TEMA */}
              <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-amber-400 shadow-sm hover:scale-105 transition-all"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {abaAtiva !== "home" && (
                  <button onClick={() => setAbaAtiva("home")} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all">
                    <ArrowLeft size={18} /> Painel
                  </button>
              )}

              <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-2xl shadow-sm text-sm font-bold hover:bg-red-600 hover:text-white transition-all"
              >
                <LogOut size={18} /> Sair
              </button>
            </div>
          </motion.header>

          <AnimatePresence mode="wait">
            {abaAtiva === "home" ? (
                <motion.div key="home" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }} className="space-y-8">

                  {/* Card de Multiplicação Premium */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-indigo-900 dark:bg-indigo-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                      <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase mb-8 border border-white/10">
                          <Sparkles size={14} className="text-amber-400" /> Visão de Crescimento
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                          <div>
                            <h2 className="text-5xl font-black mb-3">{qtdMembros} Membros</h2>
                            <p className="text-indigo-200 text-sm max-w-sm">
                              {qtdMembros >= 8 ? "Sua célula atingiu a maturidade para multiplicação!" : `Faltam ${12 - qtdMembros} membros para a meta ideal de 12.`}
                            </p>
                          </div>
                          <div className="flex-1 max-w-xs w-full space-y-3">
                            <div className="flex justify-between text-xs font-black uppercase text-indigo-100">
                              <span>Meta Progressiva</span>
                              <span>{Math.round(porcentagemMeta)}%</span>
                            </div>
                            <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${porcentagemMeta}%` }} className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                      <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl" />
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all">
                      <div>
                        <div className={`inline-flex p-4 rounded-3xl mb-6 shadow-inner ${statusMulti === 'EM_ANALISE' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'}`}>
                          <TrendingUp size={28} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">Liderança</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gerencie o futuro da célula</p>
                      </div>
                      <div className="mt-8">
                        {podeSolicitar ? (
                            <button onClick={() => setShowModalMultiplicacao(true)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all">
                              Solicitar Multiplicação
                            </button>
                        ) : statusMulti === "EM_ANALISE" ? (
                            <div className="w-full py-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-2xl font-bold text-center border border-amber-100 dark:border-amber-900/30 text-sm">
                              Solicitação em Análise
                            </div>
                        ) : (
                            <button onClick={() => setAbaAtiva("relatorio")} className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-bold hover:opacity-90 transition-all">
                              Lançar Relatório
                            </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Grid de Menus */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <MenuCardPremium icon={<TrendingUp />} title="Relatório" desc="Frequência" color="blue" onClick={() => setAbaAtiva("relatorio")} />
                    <MenuCardPremium icon={<Target />} title="Discipulado" desc="Crescimento" color="indigo" onClick={() => setAbaAtiva("discipulado")} />
                    <MenuCardPremium icon={<Users />} title="Visitantes" desc="Cadastro" color="emerald" onClick={() => setAbaAtiva("visitantes")} />
                    <MenuCardPremium icon={<Plus />} title="Fichas" desc="Secretaria" color="violet" onClick={() => setAbaAtiva("fichas")} />
                  </div>

                  {/* Lista de Membros */}
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">Membros Ativos</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{membros.length} pessoas vinculadas</p>
                      </div>
                      <button onClick={() => setShowModalAddMembro(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold hover:scale-105 transition-all">
                        <Plus size={20} /> Adicionar
                      </button>
                    </div>
                    <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {membros.map((m) => (
                          <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-black text-lg">
                                {m.nome?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{m.nome}</span>
                            </div>
                            <button onClick={() => removerMembro(m.id, m.nome)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
                              <Trash2 size={18} />
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>

                  <HistoricoRelatorios celulaId={celula?.id} />
                </motion.div>
            ) : (
                <motion.div key="content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {abaAtiva === "relatorio" && <TelaRelatorio celula={celula} />}
                  {abaAtiva === "discipulado" && <RelatorioDiscipulado membros={membros} />}
                  {abaAtiva === "visitantes" && <TelaVisitantes celulaId={celula?.id} />}
                  {abaAtiva === "fichas" && <TelaFichas celula={celula} />}
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modais Adaptados ao Dark Mode */}
        <AnimatePresence>
          {showModalAddMembro && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModalAddMembro(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-10 border dark:border-slate-800">
                  <ModalBuscarMembro celulaId={celula?.id} onClose={() => { setShowModalAddMembro(false); carregarDados(); }} />
                </motion.div>
              </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showModalMultiplicacao && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md p-10 relative z-10 border dark:border-slate-800">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Solicitar Multiplicação</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm font-medium">Descreva o planejamento para o nascimento da nova célula.</p>
                  <textarea
                      className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none mb-8 min-h-[140px] transition-all"
                      placeholder="Ex: Já temos um novo líder em treinamento..."
                      value={motivoMultiplicacao}
                      onChange={(e) => setMotivoMultiplicacao(e.target.value)}
                  />
                  <div className="flex gap-4">
                    <button onClick={() => setShowModalMultiplicacao(false)} className="flex-1 py-4 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">Cancelar</button>
                    <button onClick={solicitarMultiplicacao} disabled={solicitandoMulti} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none">
                      {solicitandoMulti ? <Loader2 className="animate-spin mx-auto" /> : "Confirmar"}
                    </button>
                  </div>
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </div>
  );
}

// Componentes Auxiliares com Design Premium
function MenuCardPremium({ icon, title, desc, color, onClick }) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600",
    indigo: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600",
    emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600",
    violet: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:bg-violet-600"
  };

  return (
      <motion.button
          whileHover={{ y: -8 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="p-8 rounded-[2.5rem] transition-all flex flex-col items-center gap-4 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 group bg-white dark:bg-slate-900"
      >
        <div className={`p-5 rounded-[1.8rem] transition-all duration-300 ${colors[color]} group-hover:text-white group-hover:shadow-lg group-hover:shadow-current/20`}>
          {React.cloneElement(icon, { size: 30, strokeWidth: 2.5 })}
        </div>
        <div className="text-center">
          <p className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-widest">{title}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-tighter">{desc}</p>
        </div>
      </motion.button>
  );
}

function ModalBuscarMembro({ celulaId, onClose }) {
  const [busca, setBusca] = useState("");
  const [membrosSem, setMembrosSem] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/membros/sem-celula");
        setMembrosSem(Array.isArray(res.data) ? res.data : []);
      } finally { setLoading(false); }
    })();
  }, []);

  const vincular = async (id) => {
    try {
      await api.post(`/celulas/${celulaId}/membros/${id}`);
      onClose();
    } catch (err) { alert("Erro ao vincular."); }
  };

  const filtrados = membrosSem.filter(m => m.nome?.toLowerCase().includes(busca.toLowerCase()));

  return (
      <div className="p-8 flex flex-col h-[550px]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Vincular Membro</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
        </div>
        <div className="relative mb-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none transition-all" placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600" /></div> :
              filtrados.length > 0 ? filtrados.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{m.nome}</span>
                    <button onClick={() => vincular(m.id)} className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:shadow-lg transition-all active:scale-95">VINCULAR</button>
                  </div>
              )) : (
                  <div className="text-center py-10 text-slate-400 text-sm font-medium italic">Nenhum membro encontrado sem célula.</div>
              )}
        </div>
      </div>
  );
}
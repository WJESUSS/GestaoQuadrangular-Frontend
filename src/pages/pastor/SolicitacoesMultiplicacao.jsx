import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import {
  CheckCircle,
  XCircle,
  Loader2,
  GitFork,
  Users,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function SolicitacoesMultiplicacao() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Busca de Dados ---
  const fetchSolicitacoes = async () => {
    try {
      setLoading(true);
      const tokenRaw = localStorage.getItem("token");
      const token = tokenRaw ? tokenRaw.replace(/"/g, "").trim() : null;

      const res = await api.get("/celulas/solicitacoes-multiplicacao", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSolicitacoes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erro ao carregar solicitações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const decidirMultiplicacao = async (id, aprovado) => {
    if (!window.confirm(`Deseja realmente ${aprovado ? 'APROVAR' : 'RECUSAR'}?`)) return;

    try {
      const tokenRaw = localStorage.getItem("token");
      const token = tokenRaw ? tokenRaw.replace(/"/g, "").trim() : null;

      await api.post(
          `/celulas/${id}/decidir-multiplicacao`,
          { aprovado },
          { headers: { Authorization: `Bearer ${token}` } }
      );

      setSolicitacoes(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao processar.");
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#020617]">
          <div className="relative p-8">
            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse" />
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin relative z-10" />
          </div>
          <p className="mt-4 text-xs font-black tracking-[0.2em] uppercase text-slate-400 animate-pulse">
            Sincronizando Expansão
          </p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-500 pb-24">

        {/* Header Flutuante Premium - Sem ícone de tema */}
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-5 mb-6">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40">
              <GitFork size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight leading-none uppercase">Multiplicação</h2>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-[0.15em]">Painel de Aprovação</span>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">

          {solicitacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-xl mb-6">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-black">Tudo em Ordem!</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-[250px]">
                  Nenhum pedido pendente. Suas células estão em dia!
                </p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {solicitacoes.map((s) => (
                    <div
                        key={s.id}
                        className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-500 overflow-hidden"
                    >
                      <div className="p-6 md:p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                                <Sparkles size={12} /> Solicitação
                              </span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors">
                              {s.nome}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                              Líder Atual: <span className="text-indigo-500">{s.liderNome || "N/A"}</span>
                            </p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl text-center min-w-[70px] border border-slate-100 dark:border-slate-700">
                            <span className="block text-xl font-black leading-none">{s.qtdMembros || 0}</span>
                            <span className="text-[8px] uppercase font-black text-slate-400 tracking-tighter">Membros</span>
                          </div>
                        </div>

                        <div className="relative mb-8 p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                            "{s.motivoSolicitacao || "Sem justificativa formal anexada."}"
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <button
                              onClick={() => decidirMultiplicacao(s.id, true)}
                              className="flex flex-col items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-[1.8rem] font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                          >
                            <CheckCircle size={20} />
                            <span className="text-[10px] uppercase tracking-widest font-black">Aprovar</span>
                          </button>

                          <button
                              onClick={() => decidirMultiplicacao(s.id, false)}
                              className="flex flex-col items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 p-4 rounded-[1.8rem] font-bold hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 active:scale-95 transition-all"
                          >
                            <XCircle size={20} />
                            <span className="text-[10px] uppercase tracking-widest font-black">Recusar</span>
                          </button>
                        </div>
                      </div>

                      <div className="px-8 py-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          <span className="flex items-center gap-1"><Users size={12}/> Disponível</span>
                          <span className="flex items-center gap-1"><Calendar size={12}/> Pendente</span>
                        </div>
                        <ChevronRight size={16} className="text-slate-300" />
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>

        {/* Tab Bar - Mantendo o estilo visual de App Mobile */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl flex items-center justify-around px-6 md:hidden">
          <div className="p-2 text-amber-500 bg-amber-500/10 rounded-xl shadow-inner">
            <GitFork size={24} />
          </div>
          <div className="p-2 text-slate-400 opacity-50">
            <Users size={24} />
          </div>
          <div className="p-2 text-slate-400 opacity-50">
            <Calendar size={24} />
          </div>
        </div>
      </div>
  );
}
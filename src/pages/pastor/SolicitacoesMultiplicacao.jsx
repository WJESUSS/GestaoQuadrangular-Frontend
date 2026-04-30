import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api.js";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Loader2,
  GitFork,
  Sun,
  Moon,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

export default function SolicitacoesMultiplicacao() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tema, setTema] = useState(localStorage.getItem("theme") || "light");

  // --- Gestão de Tema ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (tema === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", tema);
  }, [tema]);

  const toggleTema = () => setTema(prev => (prev === "light" ? "dark" : "light"));

  // --- Busca de Dados ---
  const fetchSolicitacoes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();

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
    try {
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      await api.post(
          `/celulas/${id}/decidir-multiplicacao`,
          { aprovado },
          { headers: { Authorization: `Bearer ${token}` } }
      );

      // Feedback visual antes do refresh
      fetchSolicitacoes();
    } catch (err) {
      console.error("Erro na decisão:", err);
      alert("Erro ao processar decisão. Verifique suas permissões.");
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
            <GitFork className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500 w-6 h-6" />
          </div>
          <p className="mt-4 font-bold text-slate-500 dark:text-slate-400 animate-pulse">
            Validando processos de expansão...
          </p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-8">

          {/* Header Seção */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20">
                  <GitFork size={28} className="text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">Multiplicação</h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Pedidos de expansão e abertura de novas células
              </p>
            </div>

            <button
                onClick={toggleTema}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-105 transition-all"
            >
              {tema === "light" ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-yellow-400" />}
            </button>
          </header>

          {/* Listagem */}
          {solicitacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-full mb-6">
                  <CheckCircle2 size={64} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Sem pendências</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs text-center">
                  Todas as células estão operando dentro da capacidade ou não enviaram pedidos.
                </p>
              </div>
          ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {solicitacoes.map((s) => (
                    <div
                        key={s.id}
                        className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500"
                    >
                      {/* Banner de Status Lateral */}
                      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-b from-amber-400 to-orange-500" />

                      <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-200/50">
                          Aguardando Pastor
                        </span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                              {s.nome}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400 font-bold">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 text-xs">
                                {s.liderNome?.charAt(0) || "L"}
                              </div>
                              Líder: <span className="text-indigo-600 dark:text-indigo-400">{s.liderNome || "Indefinido"}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl min-w-[100px]">
                            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{s.qtdMembros || 0}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Membros</span>
                          </div>
                        </div>

                        {/* Justificativa */}
                        <div className="relative bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 mb-8 italic text-slate-600 dark:text-slate-300 text-sm leading-relaxed group-hover:bg-amber-50/50 dark:group-hover:bg-amber-900/10 transition-colors">
                          <MessageSquare size={20} className="absolute -top-3 -left-2 text-amber-500 fill-amber-500/20" />
                          "{s.motivoSolicitacao || "O líder não anexou uma justificativa formal para este pedido."}"
                        </div>

                        {/* Ações */}
                        <div className="grid grid-cols-2 gap-4">
                          <button
                              onClick={() => decidirMultiplicacao(s.id, true)}
                              className="group/btn flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                          >
                            <CheckCircle size={22} className="group-hover/btn:scale-110 transition-transform" />
                            APROVAR
                          </button>

                          <button
                              onClick={() => decidirMultiplicacao(s.id, false)}
                              className="group/btn flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-500 py-4 rounded-2xl font-black transition-all active:scale-95"
                          >
                            <XCircle size={22} className="group-hover/btn:scale-110 transition-transform" />
                            RECUSAR
                          </button>
                        </div>
                      </div>

                      {/* Footer do Card */}
                      <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                          <div className="flex items-center gap-1">
                            <Users size={14} /> Ativa
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} /> Solicitado recentemente
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}
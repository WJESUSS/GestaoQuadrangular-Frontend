import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Trophy,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  TrendingUp,
  ChevronRight,
  Star,
  Medal
} from "lucide-react";
import api from "../../services/api.js";

export default function RankingCelulas() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().toISOString().slice(0, 7));

  // Referência para o input de data
  const dateInputRef = useRef(null);

  // Função para abrir o calendário ao clicar no container
  const handleContainerClick = () => {
    if (dateInputRef.current) {
      if (dateInputRef.current.showPicker) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const carregarRanking = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/ranking/celulas?mes=${mesSelecionado}`);
      setRanking(response.data || []);
    } catch (err) {
      setError("Não foi possível carregar o ranking.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRanking();
  }, [mesSelecionado]);

  const top3 = useMemo(() => ranking.slice(0, 3), [ranking]);
  const restante = useMemo(() => ranking.slice(3), [ranking]);

  if (loading && ranking.length === 0) {
    return (
        <div className="min-h-[400px] flex flex-col items-center justify-center bg-transparent">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
            <Trophy className="absolute text-indigo-600" size={24} />
          </div>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-black animate-pulse tracking-widest uppercase text-[10px]">
            Sincronizando Dados...
          </p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-500 pb-10">
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">

          <header className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30">
                  <Trophy size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight">Hall da Fama</h1>
                  <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <TrendingUp size={12} className="text-emerald-500" />
                    Performance Mensal
                  </p>
                </div>
              </div>
              {/* Ícone de tema removido para seguir o dashboard */}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <div
                  onClick={handleContainerClick}
                  className="group flex items-center gap-3 bg-white dark:bg-slate-900 w-full p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-all"
              >
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Calendar size={20} />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">Mês de Referência</span>
                  <input
                      ref={dateInputRef}
                      type="month"
                      value={mesSelecionado}
                      onChange={(e) => setMesSelecionado(e.target.value)}
                      className="bg-transparent border-none outline-none font-black text-sm w-full dark:text-white cursor-pointer"
                  />
                </div>
              </div>

              <button
                  onClick={carregarRanking}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 active:scale-95 transition-all h-full"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                <span className="whitespace-nowrap">Atualizar Ranking</span>
              </button>
            </div>
          </header>

          {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle size={20} /> {error}
              </div>
          )}

          {ranking.length > 0 ? (
              <div className="space-y-12">
                {/* Pódio */}
                <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-4 md:gap-2">
                  {/* 2º Lugar */}
                  {top3[1] && (
                      <div className="w-full md:w-1/3 order-2 md:order-1">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center relative shadow-sm">
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xl border-4 border-[#f8fafc] dark:border-[#020617]">🥈</div>
                          <div className="pt-4">
                            <h3 className="font-black text-lg truncate">{top3[1].nomeCelula}</h3>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-3 italic">Líder: {top3[1].lider}</p>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-black">
                              {top3[1].pontuacao.toLocaleString()} pts
                            </div>
                          </div>
                        </div>
                      </div>
                  )}

                  {/* 1º Lugar */}
                  {top3[0] && (
                      <div className="w-full md:w-1/3 order-1 md:order-2">
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[3rem] text-center relative shadow-2xl shadow-indigo-500/40 transform md:scale-110 z-10">
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-xl border-[8px] border-[#f8fafc] dark:border-[#020617]">
                            <Trophy size={40} className="text-white drop-shadow-md" />
                          </div>
                          <div className="mt-8 text-white">
                            <div className="flex justify-center mb-1 text-yellow-400">
                              <Star size={16} fill="currentColor" />
                              <Star size={16} fill="currentColor" />
                              <Star size={16} fill="currentColor" />
                            </div>
                            <h3 className="font-black text-2xl truncate mb-1">{top3[0].nomeCelula}</h3>
                            <p className="text-xs text-indigo-100 font-medium mb-5 tracking-wide">Líder: {top3[0].lider}</p>
                            <div className="bg-white/20 backdrop-blur-md py-3 rounded-2xl text-white font-black text-2xl border border-white/20">
                              {top3[0].pontuacao.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                  )}

                  {/* 3º Lugar */}
                  {top3[2] && (
                      <div className="w-full md:w-1/3 order-3 md:order-3">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center relative shadow-sm">
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-orange-200 dark:bg-orange-900/40 rounded-full flex items-center justify-center text-xl border-4 border-[#f8fafc] dark:border-[#020617]">🥉</div>
                          <div className="pt-4">
                            <h3 className="font-black text-lg truncate">{top3[2].nomeCelula}</h3>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-3 italic">Líder: {top3[2].lider}</p>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-black">
                              {top3[2].pontuacao.toLocaleString()} pts
                            </div>
                          </div>
                        </div>
                      </div>
                  )}
                </div>

                {/* Lista Geral */}
                <div className="grid grid-cols-1 gap-3">
                  {restante.map((celula, index) => (
                      <div key={celula.celulaId} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            {index + 4}º
                          </div>
                          <div>
                            <h5 className="font-bold text-sm md:text-base">{celula.nomeCelula}</h5>
                            <p className="text-[10px] md:text-xs text-slate-400 font-medium tracking-wide">Líder: {celula.lider || "—"}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <p className="text-sm md:text-base font-black text-indigo-600 dark:text-indigo-400">{celula.pontuacao.toLocaleString()}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Pontos</p>
                          </div>
                          <ChevronRight size={16} className="text-slate-300" />
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Medal size={60} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-500 font-bold">Nenhum resultado para este mês.</p>
              </div>
          )}
        </div>
      </div>
  );
}
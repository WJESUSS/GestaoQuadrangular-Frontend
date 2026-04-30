import React, { useEffect, useState, useMemo } from "react";
import {
  Trophy,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Sun,
  Moon,
  Medal,
  TrendingUp,
  Award
} from "lucide-react";
import api from "../../services/api.js";

export default function RankingCelulas() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [tema, setTema] = useState(localStorage.getItem("theme") || "light");

  // Mês atual padrão
  const mesAtual = new Date().toISOString().slice(0, 7);
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);

  // --- Gestão de Tema ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (tema === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", tema);
  }, [tema]);

  const toggleTema = () => setTema(prev => (prev === "light" ? "dark" : "light"));

  const carregarRanking = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/ranking/celulas?mes=${mesSelecionado}`);
      setRanking(response.data || []);
      setUltimaAtualizacao(new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      setError("Não foi possível carregar o ranking. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRanking();
  }, [mesSelecionado]);

  // Separação dos Top 3 para o Pódio
  const top3 = useMemo(() => ranking.slice(0, 3), [ranking]);
  const restante = useMemo(() => ranking.slice(3), [ranking]);

  if (loading && ranking.length === 0) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">Calculando pontuações...</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-8">

          {/* Header Premium */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-[1.5rem] shadow-lg shadow-orange-500/20">
                <Trophy size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-2">
                  Hall da Fama
                  <TrendingUp className="text-emerald-500 hidden sm:block" size={24} />
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium italic">
                  {ultimaAtualizacao ? `Sincronizado às ${ultimaAtualizacao}` : "Acompanhe o desempenho das células"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Calendar size={18} className="text-blue-500 ml-2" />
                <input
                    type="month"
                    value={mesSelecionado}
                    onChange={(e) => setMesSelecionado(e.target.value)}
                    className="bg-transparent border-none outline-none font-bold text-sm dark:text-white"
                />
              </div>
              <button onClick={toggleTema} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-105 transition-all">
                {tema === "light" ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-yellow-400" />}
              </button>
              <button onClick={carregarRanking} className="p-4 rounded-2xl bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </header>

          {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle size={20} /> {error}
              </div>
          )}

          {ranking.length > 0 ? (
              <>
                {/* Seção de Destaque (Pódio) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {top3.map((celula, index) => (
                      <div
                          key={celula.celulaId}
                          className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden group ${
                              index === 0
                                  ? "bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/10 dark:to-slate-900 border-yellow-200 dark:border-yellow-700/50 md:scale-110 z-10 shadow-2xl shadow-yellow-500/10"
                                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                          }`}
                      >
                        {/* Badge de Posição */}
                        <div className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner ${
                            index === 0 ? "bg-yellow-400 text-white" : index === 1 ? "bg-slate-300 text-slate-600" : "bg-orange-400 text-white"
                        }`}>
                          {index === 0 ? <Award size={24} /> : index + 1}
                        </div>

                        <div className="flex flex-col items-center text-center">
                          <div className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center text-4xl shadow-lg border-4 ${
                              index === 0 ? "border-yellow-200 bg-yellow-100" : "border-slate-100 bg-slate-50 dark:bg-slate-800"
                          }`}>
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                          </div>
                          <h3 className="text-2xl font-black text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                            {celula.nomeCelula}
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">Líder: {celula.lider || "Não informado"}</p>
                          <div className={`px-6 py-2 rounded-full font-black text-lg ${
                              index === 0 ? "bg-yellow-400 text-white shadow-lg shadow-yellow-500/40" : "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
                          }`}>
                            {celula.pontuacao.toLocaleString()} pts
                          </div>
                        </div>
                      </div>
                  ))}
                </div>

                {/* Tabela dos demais rankings */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-8 py-6 text-center">Pos</th>
                        <th className="px-8 py-6">Célula</th>
                        <th className="px-8 py-6">Líder</th>
                        <th className="px-8 py-6 text-right">Pontuação Total</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {restante.map((celula, index) => (
                          <tr key={celula.celulaId} className="hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all group">
                            <td className="px-8 py-5 text-center">
                          <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            {index + 4}
                          </span>
                            </td>
                            <td className="px-8 py-5">
                              <div className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                                {celula.nomeCelula}
                              </div>
                            </td>
                            <td className="px-8 py-5 text-slate-500 dark:text-slate-400 font-medium">
                              {celula.lider || "—"}
                            </td>
                            <td className="px-8 py-5 text-right">
                          <span className="px-4 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-black text-sm border border-emerald-100 dark:border-emerald-500/20">
                            {celula.pontuacao.toLocaleString()}
                          </span>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
          ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all">
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-full mb-6">
                  <Medal size={64} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Nenhum recorde ainda</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs text-center font-medium">
                  Não há dados processados para este mês. Selecione outro período no calendário acima.
                </p>
              </div>
          )}
        </div>
      </div>
  );
}
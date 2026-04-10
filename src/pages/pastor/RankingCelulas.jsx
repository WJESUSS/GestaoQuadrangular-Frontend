import { useEffect, useState } from "react";
import {
  Trophy,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
} from "lucide-react";
import api from "../../services/api.js";

export default function RankingCelulas() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  // Mês atual como padrão
  const mesAtual = new Date().toISOString().slice(0, 7);
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);

  const carregarRanking = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/ranking/celulas?mes=${mesSelecionado}`);
      const dados = response.data || [];
      setRanking(dados);
      setUltimaAtualizacao(new Date().toLocaleString("pt-BR"));
    } catch (err) {
      console.error("Erro ao carregar ranking:", err);
      setError(
        err.response?.data?.message ||
        "Não foi possível carregar o ranking. Verifique o mês ou tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRanking();
  }, [mesSelecionado]);

  const voltarMesAtual = () => {
    setMesSelecionado(mesAtual);
  };

  const getMedalha = (posicao) => {
    if (posicao === 1) return "🥇";
    if (posicao === 2) return "🥈";
    if (posicao === 3) return "🥉";
    return `${posicao}º`;
  };

  const getLinhaClasse = (posicao) => {
    if (posicao === 1) return "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-500 font-semibold";
    if (posicao === 2) return "bg-gray-50 hover:bg-gray-100 border-l-4 border-gray-400 font-semibold";
    if (posicao === 3) return "bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-400 font-semibold";
    return "hover:bg-gray-50";
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl max-w-6xl mx-auto border border-gray-200">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div className="flex items-center gap-4">
          <Trophy className="text-yellow-500 w-12 h-12" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 flex items-center gap-3">
            Ranking de Células
            <button
              onClick={carregarRanking}
              disabled={loading}
              className="text-gray-500 hover:text-blue-600 transition"
              title="Atualizar agora"
            >
              <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
            </button>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600" size={20} />
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Mês/Ano:
            </label>
            <input
              type="month"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <button
            onClick={voltarMesAtual}
            disabled={mesSelecionado === mesAtual}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} />
            Mês atual
          </button>
        </div>
      </div>

      {ultimaAtualizacao && !loading && !error && (
        <p className="text-sm text-gray-500 mb-4 text-right">
          Última atualização: {ultimaAtualizacao}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 className="w-20 h-20 animate-spin text-blue-600 mb-6" />
          <p className="text-xl font-medium">Carregando ranking das células...</p>
        </div>
      )}

      {/* Erro */}
      {error && !loading && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl mb-8 flex flex-col md:flex-row items-start gap-4">
          <AlertCircle className="text-red-500 w-10 h-10 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-red-700 font-medium text-lg mb-3">{error}</p>
            <button
              onClick={carregarRanking}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
            >
              <RefreshCw size={18} />
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      {!loading && !error && (
        <>
          {ranking.length === 0 ? (
            <div className="text-center py-24 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Trophy className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <p className="text-2xl font-medium mb-2">Nenhum dado neste mês</p>
              <p className="text-gray-600">
                Ainda não há relatórios de células para {mesSelecionado}.
              </p>
              <p className="text-sm mt-2 text-gray-500">
                Verifique se as células enviaram os dados ou tente outro mês.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-800 to-blue-900 text-white text-left">
                    <th className="p-5 font-semibold text-center">Posição</th>
                    <th className="p-5 font-semibold">Célula</th>
                    <th className="p-5 font-semibold">Líder</th>
                    <th className="p-5 font-semibold text-center">Pontuação</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((c, index) => {
                    const posicao = index + 1;
                    return (
                      <tr
                        key={c.celulaId}
                        className={`border-b last:border-b-0 ${getLinhaClasse(posicao)} transition-colors duration-200`}
                      >
                        <td className="p-5 font-bold text-xl text-center">
                          {getMedalha(posicao)}
                        </td>
                        <td className="p-5 font-medium text-gray-800">{c.nomeCelula}</td>
                        <td className="p-5 text-gray-700">{c.lider || "—"}</td>
                        <td className="p-5 text-center font-bold text-green-700 text-2xl">
                          {c.pontuacao.toLocaleString("pt-BR")} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
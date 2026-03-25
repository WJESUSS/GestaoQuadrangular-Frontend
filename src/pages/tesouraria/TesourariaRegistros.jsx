import { useEffect, useState } from "react";
import api from "../../api/api";

export default function TesourariaRegistrosMensal() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Função para carregar registros do mês/ano selecionado
  const carregarRegistros = async () => {
    try {
      setLoading(true);
      setErro(null);
      const res = await api.get("/tesouraria/relatorio-tesouraria", {
        params: { mes, ano },
      });
      setRegistros(res.data.registros);
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar registros.");
    } finally {
      setLoading(false);
    }
  };

  // Atualiza registros quando mes ou ano mudam
  useEffect(() => {
    carregarRegistros();
  }, [mes, ano]);

  // Gera opções de meses e anos para o seletor
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const anos = Array.from({ length: 5 }, (_, i) => hoje.getFullYear() - i);

  if (loading) return <p className="p-8">Carregando...</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Registros Mensais de Tesouraria</h2>

      {/* Seletores de mês e ano */}
      <div className="flex gap-4 mb-6">
        <select
          className="p-2 border rounded"
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
        >
          {meses.map((nome, i) => (
            <option key={i} value={i + 1}>{nome}</option>
          ))}
        </select>

        <select
          className="p-2 border rounded"
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
        >
          {anos.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={carregarRegistros}
        >
          Atualizar
        </button>
      </div>

      {erro && <p className="text-red-600 mb-4">{erro}</p>}

      <table className="w-full border-collapse border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Membro</th>
            <th className="border p-2">Dízimo (R$)</th>
            <th className="border p-2">Oferta (R$)</th>
            <th className="border p-2">Tipo Oferta</th>
            <th className="border p-2">Data</th>
          </tr>
        </thead>
        <tbody>
          {registros.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center p-4">Nenhum registro encontrado.</td>
            </tr>
          ) : (
            registros.map((r) => (
              <tr key={r.id} className="text-center">
                <td className="border p-2">{r.id}</td>
                <td className="border p-2">{r.membroNome || "-"}</td>
                <td className="border p-2">{r.valorDizimo?.toFixed(2) || "-"}</td>
                <td className="border p-2">{r.valorOferta?.toFixed(2) || "-"}</td>
                <td className="border p-2">{r.tipoOferta || "-"}</td>
                <td className="border p-2">{r.dataLancamento}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

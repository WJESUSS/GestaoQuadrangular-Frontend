import { useEffect, useState } from "react";
import api from "../../services/api.js";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";


export default function TesourariaComparativo() {
  const [comparativo, setComparativo] = useState([]);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarComparativo = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tesouraria/comparativo-anual?ano=${ano}`);
        // Garante que sempre seja array
        setComparativo(res.data.comparativo || []);
      } catch (err) {
        console.error("Erro ao carregar comparativo:", err);
        setComparativo([]);
      } finally {
        setLoading(false);
      }
    };

    carregarComparativo();
  }, [ano]);

  if (loading) return <p className="p-8 text-center">Carregando comparativo...</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        Comparativo Mensal – {ano}
      </h2>

      {/* Selecionar ano */}
      <div className="mb-6 flex gap-4 items-center">
        <label className="font-medium">Ano:</label>
        <input
          type="number"
          className="p-2 border rounded-lg w-24"
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="font-semibold mb-4">Gráfico Mensal</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparativo}>
            <XAxis
              dataKey="mes"
              tickFormatter={(m) =>
                new Date(ano, m - 1).toLocaleString("pt-BR", { month: "short" })
              }
            />
            <YAxis />
            <Tooltip
              formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
            />
            <Legend />
            <Bar dataKey="totalDizimo" fill="#4f46e5" name="Dízimo" />
            <Bar dataKey="totalOferta" fill="#f59e0b" name="Oferta" />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-4 mt-6 text-center">
          <div className="bg-indigo-100 p-4 rounded-lg">
            <h4 className="font-semibold">Total Dízimo</h4>
            <p className="text-xl">
              R$ {comparativo.reduce((acc, c) => acc + Number(c.totalDizimo), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-amber-100 p-4 rounded-lg">
            <h4 className="font-semibold">Total Oferta</h4>
            <p className="text-xl">
              R$ {comparativo.reduce((acc, c) => acc + Number(c.totalOferta), 0).toFixed(2)}
            </p>
          </div>
        </div>

        <table className="w-full border-collapse border mt-6">
          <thead className="bg-gray-100">
            <tr className="text-center">
              <th className="border p-2">Mês</th>
              <th className="border p-2">Total Dízimo (R$)</th>
              <th className="border p-2">Total Oferta (R$)</th>
            </tr>
          </thead>
          <tbody>
            {comparativo.map((c) => (
              <tr key={c.mes} className="text-center">
                <td className="border p-2">
                  {new Date(ano, c.mes - 1).toLocaleString("pt-BR", { month: "long" })}
                </td>
                <td className="border p-2">{Number(c.totalDizimo).toFixed(2)}</td>
                <td className="border p-2">{Number(c.totalOferta).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

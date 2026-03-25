import { useEffect, useState } from "react";
import api from "../../api/api";
import { AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ────────────────────────────────────────────────
// Suprime o aviso conhecido do Recharts (inofensivo na maioria dos casos)
// Coloque isso no topo do arquivo ou em um arquivo de utilitários global
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("The width") &&
      args[0].includes("height") &&
      args[0].includes("should be greater than 0")
    ) {
      return; // ignora esse aviso específico
    }
    originalWarn(...args);
  };
}

export default function PainelAlertas() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // evita render inicial com dimensões -1
  }, []);

  const carregarAlertas = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/api/alertas-celulas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlertas(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar alertas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAlertas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin w-12 h-12 text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <div className="p-4 rounded-2xl bg-red-50 ring-1 ring-red-100">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Alertas de Células
        </h2>
      </div>

      {/* Estado vazio */}
      {alertas.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 p-6 rounded-2xl shadow-sm border border-green-100 text-center font-medium"
        >
          Nenhuma célula com alerta no momento 🎉
        </motion.div>
      )}

      {/* Grid de cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {alertas.map((alerta, index) => {
          const chartData = [
            { nome: "Anterior", valor: Number(alerta.mediaAnterior || 0) },
            { nome: "Atual", valor: Number(alerta.mediaAtual || 0) },
          ];

          const isHigh = alerta.nivel === "ALTO";
          const isMedium = alerta.nivel === "MEDIO";

          return (
            <motion.div
              key={alerta.celulaId || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07, duration: 0.5 }}
              className="group"
            >
              <div
                className={`
                  bg-white rounded-2xl shadow-md border border-gray-200/70
                  overflow-hidden transition-all duration-300
                  group-hover:shadow-xl group-hover:border-gray-300
                  flex flex-col h-full
                `}
              >
                <div className="p-5 pb-4 flex-1 flex flex-col gap-5">
                  {/* Nome + Líder */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {alerta.nomeCelula}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Líder: {alerta.lider || "—"}
                    </p>
                  </div>

                  {/* Médias */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50/80 rounded-xl p-4 text-center border border-gray-100">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                        Média Atual
                      </p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">
                        {Number(alerta.mediaAtual || 0).toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-gray-50/80 rounded-xl p-4 text-center border border-gray-100">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                        Média Anterior
                      </p>
                      <p className="text-3xl font-bold text-gray-700 mt-1 opacity-90">
                        {Number(alerta.mediaAnterior || 0).toFixed(1)}
                      </p>
                    </div>
                  </div>

                  {/* Badge Nível */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Nível</span>
                    <span
                      className={`
                        px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider
                        ${isHigh ? "bg-red-100 text-red-700 border border-red-200" : ""}
                        ${isMedium ? "bg-amber-100 text-amber-700 border border-amber-200" : ""}
                        ${!isHigh && !isMedium ? "bg-blue-100 text-blue-700 border border-blue-200" : ""}
                      `}
                    >
                      {alerta.nivel || "—"}
                    </span>
                  </div>
                </div>

                {/* Área do gráfico – usando aspect-ratio para maior estabilidade */}
                <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-5">
                  <div className="w-full" style={{ aspectRatio: "4 / 3" }}>
                    {isMounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 12, right: 12, bottom: 24, left: -4 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="nome"
                            axisLine={false}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                            tickLine={false}
                          />
                          <YAxis
                            axisLine={false}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                            width={30}
                            tickLine={false}
                          />
                          <Tooltip
                            cursor={{ fill: "rgba(0,0,0,0.03)" }}
                            contentStyle={{
                              borderRadius: "10px",
                              border: "1px solid #e5e7eb",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}
                          />
                          <Bar
                            dataKey="valor"
                            fill={isHigh ? "#ef4444" : isMedium ? "#f59e0b" : "#3b82f6"}
                            radius={[8, 8, 0, 0]}
                            barSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full bg-gray-100/50 animate-pulse rounded-lg" />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
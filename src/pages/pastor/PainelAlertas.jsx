import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api.js";
import {
  AlertTriangle,
  Loader2,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Sun,
  Moon,
  RefreshCcw,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

export default function PainelAlertas() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [tema, setTema] = useState(localStorage.getItem("theme") || "light");

  // --- Gestão de Tema ---
  useEffect(() => {
    const root = window.document.documentElement;
    tema === "dark" ? root.classList.add("dark") : root.classList.remove("dark");
    localStorage.setItem("theme", tema);
  }, [tema]);

  const toggleTema = () => setTema(p => p === "light" ? "dark" : "light");

  // --- Carregamento de Dados ---
  const carregarAlertas = async () => {
    setLoading(true);
    const token = localStorage.getItem("token")?.replace(/"/g, "");
    try {
      const res = await api.get("/api/alertas-celulas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlertas(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar alertas:", err);
    } finally {
      setLoading(false);
      setIsMounted(true);
    }
  };

  useEffect(() => { carregarAlertas(); }, []);

  // --- Ações ---
  const enviarWhatsApp = (alerta) => {
    const msg = `Olá ${alerta.lider}, notei uma queda na média da célula ${alerta.nomeCelula} (${alerta.mediaAtual}). Tudo bem por aí? Precisa de apoio?`;
    const fone = alerta.telefone?.replace(/\D/g, "") || "";
    window.open(`https://wa.me/55${fone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="animate-spin w-12 h-12 text-indigo-600" />
          <p className="text-slate-500 font-medium animate-pulse uppercase tracking-widest text-xs">Analisando métricas de saúde...</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* HEADER PREMIUM */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-[1.5rem] bg-red-100 dark:bg-red-900/20 shadow-lg shadow-red-500/10">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight dark:text-white">Diagnóstico de Saúde</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium italic">Monitoramento de engajamento e presença</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button onClick={carregarAlertas} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <RefreshCcw size={20} className="text-slate-500" />
              </button>
              <button onClick={toggleTema} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                {tema === "light" ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-amber-400" />}
              </button>
            </div>
          </header>

          {/* ESTADO VAZIO */}
          {alertas.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-bold dark:text-white">Tudo em ordem!</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">Nenhuma célula apresenta quedas significativas de média no momento.</p>
              </motion.div>
          )}

          {/* GRID DE ALERTA */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            <AnimatePresence>
              {alertas.map((alerta, index) => (
                  <AlertaCard
                      key={alerta.celulaId || index}
                      alerta={alerta}
                      index={index}
                      onContact={() => enviarWhatsApp(alerta)}
                      isMounted={isMounted}
                  />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
  );
}

// --- SUBCOMPONENTE CARD ---
function AlertaCard({ alerta, index, onContact, isMounted }) {
  const isHigh = alerta.nivel === "ALTO";
  const isMedium = alerta.nivel === "MEDIO";

  const chartData = [
    { nome: "Anterior", valor: Number(alerta.mediaAnterior || 0) },
    { nome: "Atual", valor: Number(alerta.mediaAtual || 0) },
  ];

  const diff = ((alerta.mediaAtual - alerta.mediaAnterior) / (alerta.mediaAnterior || 1) * 100).toFixed(0);

  return (
      <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: index * 0.05 }}
          className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col"
      >
        {/* Indicador de Nível Lateral */}
        <div className={`absolute top-0 left-0 w-2 h-full ${isHigh ? 'bg-red-500' : isMedium ? 'bg-amber-500' : 'bg-blue-500'}`} />

        <div className="p-6 space-y-6 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {alerta.nomeCelula}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Líder: {alerta.lider || "—"}</p>
            </div>
            <div className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-tighter uppercase border ${
                isHigh ? 'bg-red-50 border-red-200 text-red-600' : 'bg-amber-50 border-amber-200 text-amber-600'
            }`}>
              {alerta.nivel}
            </div>
          </div>

          {/* MÉTRICAS COMPARATIVAS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Média Atual</span>
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-black dark:text-white">{Number(alerta.mediaAtual).toFixed(1)}</span>
                <TrendingDown size={16} className="text-red-500" />
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Queda de</span>
              <div className="text-2xl font-black text-red-500 leading-none">{Math.abs(diff)}%</div>
            </div>
          </div>

          {/* GRÁFICO */}
          <div className="h-32 w-full">
            {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -35 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                    <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="valor" radius={[6, 6, 0, 0]} barSize={35}>
                      {chartData.map((entry, i) => (
                          <Cell key={i} fill={i === 1 ? (isHigh ? '#ef4444' : '#f59e0b') : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* FOOTER ACTION */}
        <button
            onClick={onContact}
            className="w-full p-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          <MessageCircle size={18} />
          NOTIFICAR LÍDER
        </button>
      </motion.div>
  );
}
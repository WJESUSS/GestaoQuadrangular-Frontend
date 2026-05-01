import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import {
  AlertTriangle,
  Loader2,
  MessageCircle,
  TrendingDown,
  RefreshCcw,
  CheckCircle2,
  Phone
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

  useEffect(() => {
    carregarAlertas();
  }, []);

  const enviarWhatsApp = (alerta) => {
    const msg = `Olá líder ${alerta.lider}, notei uma queda na média da célula ${alerta.nomeCelula} (De ${alerta.mediaAnterior} para ${alerta.mediaAtual}). Tudo bem por aí? Como posso te ajudar?`;
    const fone = alerta.telefone?.replace(/\D/g, "") || "";
    window.open(`https://wa.me/55${fone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-transparent">
          <Loader2 className="animate-spin w-12 h-12 text-indigo-600 mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">
            Analisando Saúde das Células...
          </p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-300 p-4 md:p-8 pb-20">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* HEADER SEM BOTÃO DE TEMA */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-[1.5rem] bg-red-100 dark:bg-red-900/20 shadow-lg shadow-red-500/10">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight dark:text-white">Alerta de Células</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Células com queda de frequência superior a 20%</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                  onClick={carregarAlertas}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 p-3 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-xs uppercase"
              >
                <RefreshCcw size={16} />
                <span>Atualizar Dados</span>
              </button>
            </div>
          </header>

          {/* EMPTY STATE */}
          {alertas.length === 0 && (
              <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-900 p-16 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4"
              >
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-black dark:text-white">Rede Saudável!</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium text-lg">
                  Todas as células estão mantendo ou superando suas médias de presença.
                </p>
              </motion.div>
          )}

          {/* GRID DE CARDS */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

function AlertaCard({ alerta, index, onContact, isMounted }) {
  const mediaAtual = Number(alerta.mediaAtual || 0);
  const mediaAnterior = Number(alerta.mediaAnterior || 0);
  const diffPercent = mediaAnterior > 0
      ? ((mediaAnterior - mediaAtual) / mediaAnterior * 100).toFixed(0)
      : 0;

  const chartData = [
    { label: "Anterior", valor: mediaAnterior },
    { label: "Atual", valor: mediaAtual },
  ];

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ delay: index * 0.1 }}
          className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all overflow-hidden flex flex-col"
      >
        <div className="p-6 pb-0 flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-red-500 transition-colors uppercase">
              {alerta.nomeCelula}
            </h3>
            <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
              <Phone size={10} /> {alerta.lider || "Sem Líder"}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            Crítico
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase">Média Atual</p>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black dark:text-white">{mediaAtual.toFixed(1)}</span>
              <TrendingDown size={20} className="text-red-500 mb-1" />
            </div>
          </div>
          <div className="space-y-1 border-l border-slate-100 dark:border-slate-800 pl-4">
            <p className="text-[10px] font-black text-slate-400 uppercase">Queda de</p>
            <div className="text-3xl font-black text-red-500 leading-none">{diffPercent}%</div>
          </div>
        </div>

        <div className="h-40 w-full px-4">
          {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                      cursor={{fill: 'transparent'}}
                      contentStyle={{
                        borderRadius: '15px',
                        border: 'none',
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      }}
                  />
                  <Bar dataKey="valor" radius={[10, 10, 0, 0]} barSize={40}>
                    {chartData.map((entry, i) => (
                        <Cell key={i} fill={i === 1 ? '#ef4444' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          )}
        </div>

        <button
            onClick={onContact}
            className="mt-auto w-full bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-700 text-white p-5 font-black text-xs uppercase flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          <MessageCircle size={18} />
          Apoiar Líder no WhatsApp
        </button>
      </motion.div>
  );
}
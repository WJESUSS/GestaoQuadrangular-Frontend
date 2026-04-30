import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api.js";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Table as TableIcon,
  ChevronRight
} from "lucide-react";

export default function TesourariaComparativo() {
  const [comparativo, setComparativo] = useState([]);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarComparativo = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tesouraria/comparativo-anual?ano=${ano}`);
        setComparativo(res.data.comparativo || []);
      } catch (err) {
        console.error("Erro ao carregar comparativo:", err);
        setComparativo([]);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    carregarComparativo();
  }, [ano]);

  const totais = useMemo(() => {
    const dizimo = comparativo.reduce((acc, c) => acc + Number(c.totalDizimo), 0);
    const oferta = comparativo.reduce((acc, c) => acc + Number(c.totalOferta), 0);
    return { dizimo, oferta, geral: dizimo + oferta };
  }, [comparativo]);

  if (loading) return <ComparativoSkeleton />;

  return (
      <div className="max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
          <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2 block italic">
            Performance Anual
          </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
              Comparativo<span className="text-indigo-600">.</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Calendar className="text-slate-400 ml-2" size={18} />
            <input
                type="number"
                className="bg-transparent font-black text-slate-700 dark:text-white outline-none w-20 text-center border-r border-slate-100 dark:border-slate-800 mr-2"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
            />
            <span className="text-[10px] font-black uppercase text-slate-400 pr-4 tracking-widest">Exercício Atual</span>
          </div>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <MetricCard
              label="Total Dízimos"
              valor={totais.dizimo}
              color="indigo"
              icon={<Wallet size={20} />}
          />
          <MetricCard
              label="Total Ofertas"
              valor={totais.oferta}
              color="amber"
              icon={<TrendingUp size={20} />}
          />
          <MetricCard
              label="Receita Consolidada"
              valor={totais.geral}
              color="emerald"
              icon={<ArrowUpRight size={20} />}
          />
        </div>

        {/* CHART SECTION */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl mb-10">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="text-indigo-500" size={20} />
            <h3 className="font-black uppercase italic tracking-tighter text-slate-800 dark:text-white">Fluxo Mensal de Entradas</h3>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativo} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorDizimo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorOferta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.1} />
                <XAxis
                    dataKey="mes"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}}
                    tickFormatter={(m) => new Date(ano, m - 1).toLocaleString("pt-BR", { month: "short" }).toUpperCase()}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip
                    cursor={{fill: '#f1f5f9', opacity: 0.4}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase'}} />
                <Bar dataKey="totalDizimo" fill="url(#colorDizimo)" radius={[6, 6, 0, 0]} name="Dízimo" />
                <Bar dataKey="totalOferta" fill="url(#colorOferta)" radius={[6, 6, 0, 0]} name="Oferta" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DATA TABLE LUXURY */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <TableIcon className="text-slate-400" size={18} />
            <h3 className="font-black uppercase italic tracking-tighter text-slate-800 dark:text-white">Detalhamento Analítico</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest">Mês Referência</th>
                <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Dízimo</th>
                <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Oferta</th>
                <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Proporção</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {comparativo.map((c) => {
                const percDizimo = (Number(c.totalDizimo) / (totais.geral || 1)) * 100;
                return (
                    <tr key={c.mes} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="p-6 font-bold text-slate-700 dark:text-slate-200 uppercase text-xs tracking-tight">
                        {new Date(ano, c.mes - 1).toLocaleString("pt-BR", { month: "long" })}
                      </td>
                      <td className="p-6 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        R$ {Number(c.totalDizimo).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </td>
                      <td className="p-6 text-right font-mono font-bold text-amber-600 dark:text-amber-500">
                        R$ {Number(c.totalOferta).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${Math.min(percDizimo * 5, 100)}%` }}
                            />
                          </div>
                          <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      </td>
                    </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}

// Subcomponente de Cartão de Métrica
function MetricCard({ label, valor, color, icon }) {
  const styles = {
    indigo: "border-indigo-500 text-indigo-600 bg-indigo-50/30 dark:bg-indigo-500/5",
    amber: "border-amber-500 text-amber-600 bg-amber-50/30 dark:bg-amber-500/5",
    emerald: "border-emerald-500 text-emerald-600 bg-emerald-50/30 dark:bg-emerald-500/5",
  };

  return (
      <div className={`p-8 rounded-[2rem] border-l-4 shadow-sm bg-white dark:bg-slate-900 ${styles[color]}`}>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : color === 'amber' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'} dark:bg-opacity-10`}>
            {icon}
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
          R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </h3>
      </div>
  );
}

// Loading Visual
function ComparativoSkeleton() {
  return (
      <div className="max-w-7xl mx-auto p-10 animate-pulse">
        <div className="h-16 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-12" />
        <div className="grid grid-cols-3 gap-6 mb-10">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-[2rem]" />)}
        </div>
        <div className="h-[400px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]" />
      </div>
  );
}
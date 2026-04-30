import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid
} from "recharts";
import { ArrowRight, Wallet, Award, TrendingUp, Zap, Info } from "lucide-react";

export default function TesourariaDashboard() {
  const navigate = useNavigate();
  const [resumo, setResumo] = useState({ DIZIMO: 0, BRONZE: 0, PRATA: 0, OURO: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        const res = await api.get("/tesouraria/listar");
        const resumoCalc = { DIZIMO: 0, BRONZE: 0, PRATA: 0, OURO: 0 };

        res.data.forEach((r) => {
          resumoCalc.DIZIMO += r.valorDizimo || 0;
          if (r.tipoOferta === "BRONZE") resumoCalc.BRONZE += r.valorOferta || 0;
          if (r.tipoOferta === "PRATA") resumoCalc.PRATA += r.valorOferta || 0;
          if (r.tipoOferta === "OURO") resumoCalc.OURO += r.valorOferta || 0;
        });
        setResumo(resumoCalc);
      } catch (err) {
        console.error("Erro:", err);
      } finally {
        setTimeout(() => setLoading(false), 800); // Suaviza a transição
      }
    };
    carregarResumo();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const dadosGrafico = [
    { tipo: "Dízimo", valor: resumo.DIZIMO, cor: "#6366f1", darkCor: "#818cf8" },
    { tipo: "Bronze", valor: resumo.BRONZE, cor: "#d97706", darkCor: "#fbbf24" },
    { tipo: "Prata", valor: resumo.PRATA, cor: "#64748b", darkCor: "#94a3b8" },
    { tipo: "Ouro", valor: resumo.OURO, cor: "#eab308", darkCor: "#facc15" },
  ];

  const navegarParaFiltro = (categoria) => {
    navigate("/tesouraria/relatorio", { state: { filtroInicial: categoria } });
  };

  return (
      <div className="animate-in fade-in duration-700">
        {/* Header Interno */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-widest">
              Live Data
            </span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">
              Dashboard<span className="text-indigo-600">.</span>
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400">Total Acumulado</p>
              <p className="text-xl font-black text-emerald-500">
                R$ {(resumo.DIZIMO + resumo.BRONZE + resumo.PRATA + resumo.OURO).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
              <Zap size={20} fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <CardInterativo titulo="Dízimos" valor={resumo.DIZIMO} cor="indigo" icon={<Wallet size={24}/>} onClick={() => navegarParaFiltro("TODOS")} />
          <CardInterativo titulo="Ouro" valor={resumo.OURO} cor="yellow" icon={<Award size={24}/>} onClick={() => navegarParaFiltro("OURO")} />
          <CardInterativo titulo="Prata" valor={resumo.PRATA} cor="slate" icon={<Award size={24}/>} onClick={() => navegarParaFiltro("PRATA")} />
          <CardInterativo titulo="Bronze" valor={resumo.BRONZE} cor="orange" icon={<Award size={24}/>} onClick={() => navegarParaFiltro("BRONZE")} />
        </div>

        {/* Seção do Gráfico Premium */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30">
                  <TrendingUp size={20} />
                </div>
                <h3 className="font-black text-xl uppercase italic dark:text-white">Fluxo por Categoria</h3>
              </div>
              <Info size={18} className="text-slate-400 cursor-help" />
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGrafico} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis
                      dataKey="tipo"
                      axisLine={false}
                      tickLine={false}
                      tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 12}}
                      dy={15}
                  />
                  <YAxis hide />
                  <Tooltip
                      cursor={{fill: 'rgba(99, 102, 241, 0.05)'}}
                      contentStyle={{
                        borderRadius: '24px',
                        border: 'none',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                        background: '#1e293b',
                        color: '#fff',
                        padding: '12px 20px'
                      }}
                      itemStyle={{color: '#fff', fontWeight: '800'}}
                      labelStyle={{display: 'none'}}
                      formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`]}
                  />
                  <Bar dataKey="valor" radius={[12, 12, 12, 12]} barSize={45}>
                    {dadosGrafico.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} className="transition-all duration-500" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Info Lateral (Apenas no Dashboard Premium) */}
          <div className="bg-indigo-600 dark:bg-indigo-500 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-2xl shadow-indigo-500/40 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">Dica do Sistema</p>
              <h4 className="text-2xl font-black leading-tight italic uppercase tracking-tighter">
                Otimize seus <br/> relatórios.
              </h4>
              <p className="mt-4 text-sm font-medium text-indigo-100">
                Você pode exportar os dados consolidados do mês atual diretamente na aba de relatórios em formato PDF profissional.
              </p>
            </div>
            <button
                onClick={() => navigate("/tesouraria/relatorio")}
                className="relative z-10 w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
            >
              Ir para Relatórios
            </button>
            <TrendingUp size={180} className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
  );
}

// Subcomponente de Card
function CardInterativo({ titulo, valor, cor, icon, onClick }) {
  const styles = {
    indigo: "border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 shadow-indigo-500/10",
    yellow: "border-amber-500 dark:border-amber-400 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 shadow-amber-500/10",
    slate: "border-slate-500 dark:border-slate-400 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 shadow-slate-500/10",
    orange: "border-orange-500 dark:border-orange-400 text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-900 shadow-orange-500/10",
  };

  return (
      <button
          onClick={onClick}
          className={`group relative p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 border-b-4 shadow-xl transition-all duration-500 text-left flex flex-col justify-between h-48 overflow-hidden hover:-translate-y-2 ${styles[cor]}`}
      >
        <div className="flex justify-between items-start relative z-10">
          <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl group-hover:bg-current group-hover:text-white transition-all duration-500 shadow-inner">
            {icon}
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
            <ArrowRight size={20} />
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">{titulo}</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Glow Effect */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-current opacity-[0.03] group-hover:opacity-[0.08] rounded-full blur-2xl transition-opacity" />
      </button>
  );
}

// Skeleton para o Loading Premium
function DashboardSkeleton() {
  return (
      <div className="animate-pulse">
        <div className="h-12 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl mb-10" />
        <div className="grid grid-cols-4 gap-6 mb-10">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem]" />)}
        </div>
        <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-[2.5rem]" />
      </div>
  );
}
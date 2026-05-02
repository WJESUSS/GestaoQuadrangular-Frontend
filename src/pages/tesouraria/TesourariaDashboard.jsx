import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../../services/api.js";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid
} from "recharts";
import {
  ArrowRight, Wallet, Award, TrendingUp, Zap, Info,
  ChevronLeft, ChevronRight, Calendar, RefreshCcw
} from "lucide-react";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function TesourariaDashboard() {
  const navigate = useNavigate();
  const hoje = new Date();

  const [modo, setModo] = useState("mensal");
  const [mes, setMes]   = useState(hoje.getMonth() + 1);
  const [ano, setAno]   = useState(hoje.getFullYear());
  const [resumo, setResumo] = useState({ DIZIMO: 0, BRONZE: 0, PRATA: 0, OURO: 0 });
  const [loading, setLoading] = useState(true);

  // Usamos useCallback para evitar recriações desnecessárias da função
  const carregarResumo = useCallback(async () => {
    try {
      setLoading(true);

      const params = modo === "mensal"
          ? { mes, ano }
          : { ano };

      const endpoint = modo === "mensal"
          ? "/tesouraria/relatorio-tesouraria"
          : "/tesouraria/listar";

      const res = await api.get(endpoint, { params });
      const dados = modo === "mensal" ? (res.data.registros || []) : (res.data || []);

      const calc = { DIZIMO: 0, BRONZE: 0, PRATA: 0, OURO: 0 };
      dados.forEach((r) => {
        calc.DIZIMO += r.valorDizimo || 0;
        if (r.tipoOferta === "BRONZE") calc.BRONZE += r.valorOferta || 0;
        if (r.tipoOferta === "PRATA")  calc.PRATA  += r.valorOferta || 0;
        if (r.tipoOferta === "OURO")   calc.OURO   += r.valorOferta || 0;
      });

      setResumo(calc);
    } catch (err) {
      console.error("Erro ao carregar resumo:", err);
    } finally {
      // Finalização imediata sem timers artificiais para não travar o mobile
      setLoading(false);
    }
  }, [modo, mes, ano]);

  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  const navegarParaFiltro = (categoria) => {
    navigate("/tesouraria/relatorio", { state: { filtroInicial: categoria } });
  };

  const totalGeral   = resumo.DIZIMO + resumo.BRONZE + resumo.PRATA + resumo.OURO;
  const totalOfertas = resumo.BRONZE + resumo.PRATA + resumo.OURO;

  const dadosGrafico = [
    { tipo: "Dízimo", valor: resumo.DIZIMO, cor: "#6366f1" },
    { tipo: "Bronze", valor: resumo.BRONZE, cor: "#d97706" },
    { tipo: "Prata",  valor: resumo.PRATA,  cor: "#64748b" },
    { tipo: "Ouro",   valor: resumo.OURO,   cor: "#eab308" },
  ];

  const periodoLabel = modo === "mensal"
      ? `${MESES[mes - 1]} de ${ano}`
      : `Exercício ${ano}`;

  return (
      <div className="select-none touch-manipulation pb-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2">
              <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-pulse" />
              Live Data
            </span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
              Dashboard<span className="text-indigo-500">.</span>
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total • {periodoLabel}</p>
              <p className="text-xl font-black text-emerald-500 tracking-tighter">
                {loading
                    ? <span className="inline-block w-32 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse align-middle" />
                    : `R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                }
              </p>
            </div>
            <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
              <Zap size={20} fill="currentColor" />
            </div>
          </div>
        </div>

        {/* FILTRO BAR - Otimizado para Mobile */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-3 mb-8 flex flex-col sm:flex-row items-center gap-3 shadow-sm">

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
            {["mensal", "anual"].map((m) => (
                <button
                    key={m}
                    onClick={() => setModo(m)}
                    className={`flex-1 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        modo === m
                            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                            : "text-slate-400"
                    }`}
                >
                  {m}
                </button>
            ))}
          </div>

          <div className="flex items-center w-full sm:w-auto gap-2">
            {modo === "mensal" && (
                <div className="flex-1 flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button onClick={() => setMes(p => p === 1 ? 12 : p - 1)} className="p-2 active:bg-slate-200 dark:active:bg-slate-700 rounded-lg">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="font-black text-[11px] uppercase tracking-widest dark:text-slate-200">
                  {MESES[mes - 1]}
                </span>
                  <button onClick={() => setMes(p => p === 12 ? 1 : p + 1)} className="p-2 active:bg-slate-200 dark:active:bg-slate-700 rounded-lg">
                    <ChevronRight size={18} />
                  </button>
                </div>
            )}

            <div className="flex-1 flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button onClick={() => setAno(p => p - 1)} className="p-2 active:bg-slate-200 dark:active:bg-slate-700 rounded-lg">
                <ChevronLeft size={18} />
              </button>
              <span className="font-black text-[11px] tracking-widest dark:text-slate-200">
                {ano}
              </span>
              <button onClick={() => setAno(p => p + 1)} className="p-2 active:bg-slate-200 dark:active:bg-slate-700 rounded-lg">
                <ChevronRight size={18} />
              </button>
            </div>

            <button
                onClick={carregarResumo}
                className="p-3 bg-indigo-600 text-white rounded-xl active:scale-95 transition-transform"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <CardInterativo titulo="Dízimos" valor={resumo.DIZIMO} cor="indigo" icon={<Wallet size={20} />} loading={loading} onClick={() => navegarParaFiltro("TODOS")} />
          <CardInterativo titulo="Ouro"    valor={resumo.OURO}   cor="yellow" icon={<Award  size={20} />} loading={loading} onClick={() => navegarParaFiltro("OURO")} />
          <CardInterativo titulo="Prata"   valor={resumo.PRATA}  cor="slate"  icon={<Award  size={20} />} loading={loading} onClick={() => navegarParaFiltro("PRATA")} />
          <CardInterativo titulo="Bronze"  valor={resumo.BRONZE} cor="orange" icon={<Award  size={20} />} loading={loading} onClick={() => navegarParaFiltro("BRONZE")} />
        </div>

        {/* GRÁFICO + LATERAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-2xl">
                  <TrendingUp size={16} />
                </div>
                <h3 className="font-black text-sm uppercase italic dark:text-white tracking-tighter">Fluxo por Categoria</h3>
              </div>
            </div>

            <div className="h-[240px] md:h-[300px] w-full">
              {loading ? (
                  <div className="h-full w-full bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGrafico}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="tipo" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: '800', fontSize: 10 }} />
                      <YAxis hide />
                      <Tooltip
                          cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                          contentStyle={{ borderRadius: '15px', border: 'none', background: '#0f172a', color: '#fff' }}
                          formatter={(v) => [`R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]}
                      />
                      <Bar dataKey="valor" radius={[10, 10, 5, 5]} barSize={35}>
                        {dadosGrafico.map((entry, i) => <Cell key={i} fill={entry.cor} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden group shadow-xl">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Resumo do Período</p>
              <h4 className="text-2xl font-black italic uppercase">{periodoLabel}</h4>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Dízimos", valor: resumo.DIZIMO },
                  { label: "Ofertas", valor: totalOfertas },
                  { label: "Total",   valor: totalGeral },
                ].map((item, i) => (
                    <div key={item.label} className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] font-black uppercase text-indigo-100">{item.label}</span>
                      <span className="font-black text-sm">
                      {loading ? "..." : `R$ ${item.valor.toLocaleString('pt-BR')}`}
                    </span>
                    </div>
                ))}
              </div>
            </div>
            <button
                onClick={() => navigate("/tesouraria/relatorio")}
                className="relative z-10 mt-8 w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-[11px] active:scale-95 transition-all"
            >
              Ver Relatórios Completos
            </button>
          </div>
        </div>
      </div>
  );
}

function CardInterativo({ titulo, valor, cor, icon, onClick, loading }) {
  const styles = {
    indigo: "border-indigo-500 text-indigo-600",
    yellow: "border-amber-500 text-amber-600",
    slate:  "border-slate-500 text-slate-600",
    orange: "border-orange-500 text-orange-600",
  };

  return (
      <button
          onClick={onClick}
          className={`group relative p-4 rounded-[1.5rem] border-b-4 bg-white dark:bg-slate-900 shadow-md flex flex-col justify-between h-36 active:scale-95 transition-all ${styles[cor]}`}
      >
        <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl w-fit">
          {icon}
        </div>
        <div>
          <p className="text-[9px] font-black uppercase opacity-60 mb-1">{titulo}</p>
          {loading ? (
              <div className="h-5 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          ) : (
              <p className="text-base md:text-xl font-black text-slate-800 dark:text-white truncate">
                R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
          )}
        </div>
      </button>
  );
}
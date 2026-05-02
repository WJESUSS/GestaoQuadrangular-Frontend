import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  ChevronRight,
  LayoutGrid,
  ShieldCheck
} from "lucide-react";

export default function MenuTesouraria() {
  const navigate = useNavigate();

  const cards = [
    {
      id: "lancamento",
      label: "Gestão de Entradas",
      title: "Lançamento",
      desc: "Registro de dízimos e ofertas em tempo real.",
      icon: <Wallet size={26} />,
      page: "/tesouraria/lancamento",
      color: "indigo"
    },
    {
      id: "dashboard",
      label: "Visão Geral",
      title: "Dashboard",
      desc: "Indicadores de desempenho e KPIs financeiros.",
      icon: <BarChart3 size={26} />,
      page: "/tesouraria/dashboard",
      color: "emerald"
    },
    {
      id: "relatorio",
      label: "Documentação",
      title: "Relatório",
      desc: "Exportação executiva de dados para PDF.",
      icon: <FileText size={26} />,
      page: "/tesouraria/relatorio",
      color: "amber"
    },
    {
      id: "dizimistas",
      label: "Fidelidade",
      title: "Dizimistas",
      desc: "Monitoramento de contribuintes ativos e pendentes.",
      icon: <Users size={26} />,
      page: "/tesouraria/dizimistas",
      color: "rose"
    },
    {
      id: "comparativo",
      label: "Análise de Dados",
      title: "Comparativo",
      desc: "Evolução mensal e histórico anual consolidado.",
      icon: <TrendingUp size={26} />,
      page: "/tesouraria/comparativo",
      color: "purple"
    },
  ];

  const cardColors = {
    indigo: "from-indigo-500/8 to-transparent text-indigo-600 border-indigo-500/20 hover:border-indigo-400 dark:hover:border-indigo-500",
    emerald:"from-emerald-500/8 to-transparent text-emerald-600 border-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-500",
    amber:  "from-amber-500/8  to-transparent text-amber-600  border-amber-500/20  hover:border-amber-400  dark:hover:border-amber-500",
    rose:   "from-rose-500/8   to-transparent text-rose-600   border-rose-500/20   hover:border-rose-400   dark:hover:border-rose-500",
    purple: "from-purple-500/8 to-transparent text-purple-600 border-purple-500/20 hover:border-purple-400 dark:hover:border-purple-500",
  };

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080810] p-6 md:p-12 animate-in fade-in duration-700">

        {/* HEADER */}
        <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4">
              <ShieldCheck size={13} /> Sistema de Gestão Eclesiástica
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">
              Tesouraria<span className="text-indigo-500">.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-3 text-sm">
              Selecione um módulo para gerenciar as finanças.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="h-9 w-9 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600">
              <LayoutGrid size={17} />
            </div>
            <div className="pr-4">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status do Sistema</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Online & Sincronizado</p>
              </div>
            </div>
          </div>
        </div>

        {/* GRID DE CARDS */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {cards.map((card) => (
              <button
                  key={card.id}
                  onClick={() => navigate(card.page)}
                  className={`group relative overflow-hidden p-8 rounded-[2.5rem] border bg-gradient-to-br bg-white dark:bg-slate-900/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_24px_40px_-12px_rgba(99,102,241,0.12)] flex flex-col justify-between h-72 text-left ${cardColors[card.color]}`}
              >
                {/* Ícone decorativo de fundo */}
                <div className="absolute -right-6 -top-6 opacity-[0.06] dark:opacity-[0.04] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                  {React.cloneElement(card.icon, { size: 170 })}
                </div>

                <div className="relative z-10">
                  <div className="h-14 w-14 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20 flex items-center justify-center mb-6 group-hover:rotate-3 group-hover:scale-105 transition-transform duration-300">
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-50">{card.label}</span>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter mt-1 leading-none">
                    {card.title}
                  </h3>
                </div>

                <div className="relative z-10 flex items-end justify-between">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-[180px] leading-relaxed">
                    {card.desc}
                  </p>
                  <div className="h-10 w-10 rounded-full bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 shadow-lg">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </button>
          ))}

          {/* Card Sair */}
          <button
              onClick={() => navigate("/")}
              className="group p-8 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-all h-72 gap-3"
          >
            <div className="group-hover:scale-105 transition-transform italic font-black uppercase tracking-widest text-xs">
              Sair do Módulo
            </div>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] opacity-60">Retornar ao Início</p>
          </button>
        </div>

        {/* FOOTER */}
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-200 dark:border-slate-800/60 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          <span>© 2026 IEQ — Gestão Financeira</span>
          <span className="flex items-center gap-2 italic">
          <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
          Servidor Ativo
        </span>
        </div>
      </div>
  );
}
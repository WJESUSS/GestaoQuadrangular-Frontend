import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Search,
  FileSpreadsheet,
  Coins,
  ArrowUpRight,
  Database
} from "lucide-react";

export default function TesourariaRegistrosMensal() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroNome, setFiltroNome] = useState("");

  const carregarRegistros = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const res = await api.get("/tesouraria/relatorio-tesouraria", {
        params: { mes, ano },
      });
      setRegistros(res.data.registros || []);
    } catch (err) {
      setErro("Falha na sincronização com o servidor.");
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  }, [mes, ano]);

  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const anos = Array.from({ length: 5 }, (_, i) => hoje.getFullYear() - i);

  const registrosFiltrados = registros.filter(r =>
      r.membroNome?.toLowerCase().includes(filtroNome.toLowerCase())
  );

  if (loading) return <SkeletonTable />;

  return (
      <div className="max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in slide-in-from-top-4 duration-700">

        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-3">
              <Database size={14} /> Histórico de Lançamentos
            </div>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
              Registros<span className="text-indigo-600">.</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                  type="text"
                  placeholder="Filtrar por nome..."
                  className="pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white text-sm min-w-[280px]"
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
              />
            </div>

            <button
                onClick={carregarRegistros}
                className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all active:rotate-180 duration-500"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
        </div>

        {/* CONTROLS & SELECTORS */}
        <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 mb-8 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700 w-full sm:w-auto">
            <button
                onClick={() => setMes(prev => prev === 1 ? 12 : prev - 1)}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200 min-w-[120px] text-center">
            {meses[mes - 1]}
          </span>
            <button
                onClick={() => setMes(prev => prev === 12 ? 1 : prev + 1)}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <select
              className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200 outline-none w-full sm:w-auto cursor-pointer"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
          >
            {anos.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>

          <div className="hidden sm:block h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />

          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-auto">
            <FileSpreadsheet size={14} /> {registrosFiltrados.length} Registros Encontrados
          </div>
        </div>

        {erro && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-3 font-bold text-sm">
              <RefreshCcw size={18} /> {erro}
            </div>
        )}

        {/* LUXURY DATA TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Ref. ID</th>
                <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Membro Contribuinte</th>
                <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Dízimo</th>
                <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Oferta</th>
                <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Categoria</th>
                <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] text-right">Data</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {registrosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-32 text-center">
                      <Coins size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum registro no período</p>
                    </td>
                  </tr>
              ) : (
                  registrosFiltrados.map((r) => (
                      <tr key={r.id} className="group hover:bg-slate-50/80 dark:hover:bg-indigo-500/5 transition-all">
                        <td className="p-6">
                          <span className="font-mono text-xs text-slate-400 font-bold">#{r.id.toString().padStart(4, '0')}</span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-[10px]">
                              {r.membroNome?.charAt(0) || "?"}
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors uppercase text-xs">
                          {r.membroNome || "Anônimo"}
                        </span>
                          </div>
                        </td>
                        <td className="p-6">
                      <span className="text-emerald-600 dark:text-emerald-400 font-black font-mono text-sm">
                        {r.valorDizimo ? `R$ ${r.valorDizimo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : "-"}
                      </span>
                        </td>
                        <td className="p-6">
                      <span className="text-indigo-600 dark:text-indigo-400 font-black font-mono text-sm">
                        {r.valorOferta ? `R$ ${r.valorOferta.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : "-"}
                      </span>
                        </td>
                        <td className="p-6">
                          <Badge tipo={r.tipoOferta} />
                        </td>
                        <td className="p-6 text-right">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase">
                            <CalendarDays size={12} />
                            {new Date(r.dataLancamento).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}

// Subcomponente de Badge
function Badge({ tipo }) {
  const styles = {
    OURO: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20",
    PRATA: "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20",
    BRONZE: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20",
  };
  const current = tipo?.toUpperCase() || "PADRÃO";
  return (
      <span className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest ${styles[current] || "bg-gray-50 text-gray-400 border-gray-100"}`}>
      {current}
    </span>
  );
}

// Skeleton para Loading
function SkeletonTable() {
  return (
      <div className="max-w-7xl mx-auto p-10 animate-pulse">
        <div className="h-12 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-xl mb-12" />
        <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] mb-8" />
        <div className="h-[500px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]" />
      </div>
  );
}
import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileDown, Filter, Calendar, Trophy, Medal,
  Award, Users, Loader2, TrendingUp, ChevronRight,
  PieChart, DownloadCloud
} from "lucide-react";

export default function TesourariaRelatorio() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [categoriaAtiva, setCategoriaAtiva] = useState("TODOS");

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const carregarRelatorio = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tesouraria/relatorio-tesouraria", {
        params: { mes, ano },
      });
      const data = res.data || {};
      setRegistros(data.registros || []);
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
      setRegistros([]);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => { carregarRelatorio(); }, []);

  const registrosFiltrados = registros.filter(r => {
    if (categoriaAtiva === "TODOS") return true;
    return r.tipoOferta?.toUpperCase() === categoriaAtiva;
  });

  const totalDizimo = registrosFiltrados.reduce((acc, r) => acc + (r.valorDizimo ?? 0), 0);
  const totalOferta = registrosFiltrados.reduce((acc, r) => acc + (r.valorOferta ?? 0), 0);
  const totalPeriodo = totalDizimo + totalOferta;

  const exportarPDF = () => {
    const doc = new jsPDF();
    const tituloRelatorio = categoriaAtiva === "TODOS" ? "Geral" : `Categoria ${categoriaAtiva}`;

    // Design do PDF mais limpo
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("IEQ - RELATÓRIO FINANCEIRO", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`${tituloRelatorio.toUpperCase()} | EMITIDO EM: ${new Date().toLocaleDateString()}`, 14, 28);

    autoTable(doc, {
      head: [["Membro", "Nível", "Dízimo (R$)", "Oferta (R$)", "Data"]],
      body: registrosFiltrados.map(r => [
        r.membroNome,
        r.tipoOferta || "Padrão",
        (r.valorDizimo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        (r.valorOferta ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        r.dataLancamento ? new Date(r.dataLancamento).toLocaleDateString('pt-BR') : "-"
      ]),
      startY: 40,
      styles: { font: "helvetica", fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text(`TOTAL DO PERÍODO: R$ ${totalPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, finalY);

    doc.save(`IEQ_Relatorio_${categoriaAtiva}_${meses[mes-1]}.pdf`);
  };

  return (
      <div className="max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in duration-700">

        {/* Header Premium */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-3">
              <PieChart size={14} /> Inteligência Financeira
            </div>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
              Análise<span className="text-indigo-600">.</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Detalhamento de dízimos e ofertas por categoria.</p>
          </div>

          <button
              onClick={exportarPDF}
              disabled={loading || registrosFiltrados.length === 0}
              className="group relative flex items-center justify-center gap-3 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-indigo-500/20 disabled:opacity-30 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <DownloadCloud size={20} className="group-hover:-translate-y-1 transition-transform" />
            <span className="font-black uppercase tracking-widest text-xs">Exportar Executive PDF</span>
          </button>
        </div>

        {/* Glass Filter Bar */}
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 mb-10 flex flex-col lg:flex-row gap-6 items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex-1 lg:flex-none">
              <Calendar size={18} className="text-indigo-500" />
              <select
                  className="bg-transparent outline-none font-bold text-slate-700 dark:text-slate-200 cursor-pointer text-sm uppercase"
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
              >
                {meses.map((nome, idx) => (
                    <option key={idx} value={idx + 1} className="dark:bg-slate-900">{nome}</option>
                ))}
              </select>
            </div>

            <input
                type="number"
                className="bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-2xl outline-none w-28 font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
            />

            <button
                onClick={carregarRelatorio}
                disabled={loading}
                className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-90"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Filter size={20} />}
            </button>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
            <TabBtn label="Geral" active={categoriaAtiva === "TODOS"} onClick={() => setCategoriaAtiva("TODOS")} />
            <TabBtn label="Ouro" active={categoriaAtiva === "OURO"} color="text-amber-500" onClick={() => setCategoriaAtiva("OURO")} />
            <TabBtn label="Prata" active={categoriaAtiva === "PRATA"} color="text-slate-400" onClick={() => setCategoriaAtiva("PRATA")} />
            <TabBtn label="Bronze" active={categoriaAtiva === "BRONZE"} color="text-orange-500" onClick={() => setCategoriaAtiva("BRONZE")} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <CardStatus title="Dízimos" valor={totalDizimo} color="indigo" icon={<Users />} trend="+12%" />
          <CardStatus title="Ofertas" valor={totalOferta} color="emerald" icon={<Trophy />} trend="+5%" />
          <CardStatus title="Volume Total" valor={totalPeriodo} color="slate" icon={<Award />} trend="Consolidado" />
        </div>

        {/* Tabela de Luxo */}
        <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="p-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Membro</th>
                <th className="p-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Nível</th>
                <th className="p-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Dízimo</th>
                <th className="p-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Oferta</th>
                <th className="p-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] text-right">Data</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                  <tr><td colSpan={5} className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" size={40} /><p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sincronizando Banco de Dados...</p></td></tr>
              ) : registrosFiltrados.length === 0 ? (
                  <tr><td colSpan={5} className="p-32 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum registro para {meses[mes-1]}</td></tr>
              ) : (
                  registrosFiltrados.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-indigo-500/5 transition-all group">
                        <td className="p-8">
                          <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{r.membroNome}</div>
                        </td>
                        <td className="p-8"><Badge tipo={r.tipoOferta} /></td>
                        <td className="p-8">
                      <span className="text-emerald-600 dark:text-emerald-400 font-black font-mono">
                        R$ {(r.valorDizimo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                        </td>
                        <td className="p-8">
                      <span className="text-indigo-600 dark:text-indigo-400 font-black font-mono">
                        R$ {(r.valorOferta ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                        </td>
                        <td className="p-8 text-right">
                          <div className="flex items-center justify-end gap-2 text-slate-400 dark:text-slate-500 font-bold text-xs">
                            {r.dataLancamento ? new Date(r.dataLancamento).toLocaleDateString('pt-BR') : "-"}
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
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

// --- Subcomponentes Ultra Premium ---

function CardStatus({ title, valor, color, icon, trend }) {
  const themes = {
    indigo: "border-indigo-500 text-indigo-600 dark:bg-indigo-500/5",
    emerald: "border-emerald-500 text-emerald-600 dark:bg-emerald-500/5",
    slate: "border-slate-900 dark:border-white text-slate-900 dark:text-white dark:bg-white/5",
  };

  return (
      <div className={`bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-l-[6px] ${themes[color]} shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500`}>
        <div className="z-10 relative">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${themes[color]} bg-opacity-10`}>{icon}</div>
            <span className="text-[10px] font-black px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 uppercase tracking-tighter">{trend}</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
            {Number(valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h3>
        </div>
        <TrendingUp size={120} className="absolute -right-4 -bottom-8 text-slate-50 dark:text-slate-800/30 group-hover:scale-110 transition-transform duration-700" />
      </div>
  );
}

function Badge({ tipo }) {
  const styles = {
    OURO: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20",
    PRATA: "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20",
    BRONZE: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20",
  };
  const current = tipo?.toUpperCase() || "PADRÃO";
  return (
      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-widest ${styles[current] || "bg-gray-50 text-gray-400"}`}>
      {current}
    </span>
  );
}

function TabBtn({ label, active, onClick, color = "text-indigo-600" }) {
  return (
      <button
          onClick={onClick}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              active
                  ? `bg-white dark:bg-slate-700 shadow-md ${color} scale-105`
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
      >
        {label}
      </button>
  );
}
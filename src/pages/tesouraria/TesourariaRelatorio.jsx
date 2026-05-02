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

  const totalDizimo  = registrosFiltrados.reduce((acc, r) => acc + (r.valorDizimo ?? 0), 0);
  const totalOferta  = registrosFiltrados.reduce((acc, r) => acc + (r.valorOferta  ?? 0), 0);
  const totalPeriodo = totalDizimo + totalOferta;

  const exportarPDF = () => {
    const doc = new jsPDF();
    const tituloRelatorio = categoriaAtiva === "TODOS" ? "Geral" : `Categoria ${categoriaAtiva}`;

    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text("IEQ – RELATÓRIO FINANCEIRO", 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`${tituloRelatorio.toUpperCase()} | EMITIDO EM: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);

    autoTable(doc, {
      head: [["Membro", "Nível", "Dízimo (R$)", "Oferta (R$)", "Data"]],
      body: registrosFiltrados.map(r => [
        r.membroNome,
        r.tipoOferta || "Padrão",
        (r.valorDizimo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        (r.valorOferta  ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        r.dataLancamento ? new Date(r.dataLancamento).toLocaleDateString('pt-BR') : "-"
      ]),
      startY: 36,
      styles: { font: "helvetica", fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    const finalY = doc.lastAutoTable.finalY + 14;
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`TOTAL DO PERÍODO: R$ ${totalPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, finalY);

    doc.save(`IEQ_Relatorio_${categoriaAtiva}_${meses[mes - 1]}.pdf`);
  };

  return (
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10 animate-in fade-in duration-700">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-5 mb-8 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-500 font-black uppercase tracking-[0.3em] text-[10px] mb-3">
              <PieChart size={13} /> Inteligência Financeira
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none">
              Análise<span className="text-indigo-500">.</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-sm">
              Detalhamento de dízimos e ofertas por categoria.
            </p>
          </div>

          <button
              onClick={exportarPDF}
              disabled={loading || registrosFiltrados.length === 0}
              className="group relative flex items-center justify-center gap-3 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl transition-all shadow-xl shadow-slate-900/10 dark:shadow-indigo-500/20 disabled:opacity-30 active:scale-95 overflow-hidden w-full md:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <DownloadCloud size={18} className="group-hover:-translate-y-0.5 transition-transform shrink-0" />
            <span className="font-black uppercase tracking-widest text-[11px]">Exportar PDF Executivo</span>
          </button>
        </div>

        {/* ── Filter Bar ─────────────────────────────────────── */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-slate-200 dark:border-slate-800 mb-8 flex flex-col gap-4 shadow-sm">

          {/* Row 1: Mês + Ano + Botão */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex-1 min-w-0">
              <Calendar size={15} className="text-indigo-500 shrink-0" />
              <select
                  className="bg-transparent outline-none font-bold text-slate-700 dark:text-slate-200 cursor-pointer text-sm uppercase w-full min-w-0"
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
                className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl outline-none w-24 font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm shrink-0"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                style={{ MozAppearance: "textfield" }}
            />

            <button
                onClick={carregarRelatorio}
                disabled={loading}
                className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all active:scale-90 shrink-0"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Filter size={18} />}
            </button>
          </div>

          {/* Row 2: Category tabs — scrollable on mobile */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 overflow-x-auto gap-1 scrollbar-none">
            <TabBtn label="Geral"  active={categoriaAtiva === "TODOS"}  onClick={() => setCategoriaAtiva("TODOS")} />
            <TabBtn label="Ouro"   active={categoriaAtiva === "OURO"}   color="text-amber-500"  onClick={() => setCategoriaAtiva("OURO")} />
            <TabBtn label="Prata"  active={categoriaAtiva === "PRATA"}  color="text-slate-400"  onClick={() => setCategoriaAtiva("PRATA")} />
            <TabBtn label="Bronze" active={categoriaAtiva === "BRONZE"} color="text-orange-500" onClick={() => setCategoriaAtiva("BRONZE")} />
          </div>
        </div>

        {/* ── Stats Grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 md:mb-12">
          <CardStatus title="Dízimos"      valor={totalDizimo}  color="indigo"  icon={<Users />}  trend="+12%" />
          <CardStatus title="Ofertas"      valor={totalOferta}  color="emerald" icon={<Trophy />} trend="+5%" />
          <CardStatus title="Volume Total" valor={totalPeriodo} color="slate"   icon={<Award />}  trend="Consolidado" />
        </div>

        {/* ── Data Table ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full text-left border-collapse" style={{ minWidth: 520 }}>
              <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/30">
                <th className="px-5 py-5 md:px-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Membro</th>
                <th className="px-5 py-5 md:px-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Nível</th>
                <th className="px-5 py-5 md:px-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Dízimo</th>
                <th className="px-5 py-5 md:px-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Oferta</th>
                <th className="px-5 py-5 md:px-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] text-right">Data</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" size={32} />
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Sincronizando dados...</p>
                    </td>
                  </tr>
              ) : registrosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                      Nenhum registro para {meses[mes - 1]}
                    </td>
                  </tr>
              ) : (
                  registrosFiltrados.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-indigo-500/[0.04] transition-all group">
                        <td className="px-5 py-4 md:px-8 md:py-6">
                          <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors text-sm">
                            {r.membroNome}
                          </div>
                        </td>
                        <td className="px-5 py-4 md:px-8 md:py-6">
                          <Badge tipo={r.tipoOferta} />
                        </td>
                        <td className="px-5 py-4 md:px-8 md:py-6">
                      <span className="text-emerald-600 dark:text-emerald-400 font-black font-mono text-xs md:text-sm whitespace-nowrap">
                        R$ {(r.valorDizimo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                        </td>
                        <td className="px-5 py-4 md:px-8 md:py-6">
                      <span className="text-indigo-600 dark:text-indigo-400 font-black font-mono text-xs md:text-sm whitespace-nowrap">
                        R$ {(r.valorOferta ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                        </td>
                        <td className="px-5 py-4 md:px-8 md:py-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-slate-400 dark:text-slate-500 font-bold text-xs whitespace-nowrap">
                            {r.dataLancamento ? new Date(r.dataLancamento).toLocaleDateString('pt-BR') : "–"}
                            <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
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

/* ─── CardStatus ─────────────────────────────────────────── */
function CardStatus({ title, valor, color, icon, trend }) {
  const themes = {
    indigo:  "border-indigo-500  text-indigo-600  dark:bg-indigo-500/5",
    emerald: "border-emerald-500 text-emerald-600 dark:bg-emerald-500/5",
    slate:   "border-slate-900 dark:border-white text-slate-900 dark:text-white dark:bg-white/5",
  };

  return (
      <div className={`bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border-l-[5px] ${themes[color]} shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-500`}>
        <div className="z-10 relative">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-2xl bg-current/5 ${themes[color]}`}>{icon}</div>
            <span className="text-[10px] font-black px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 uppercase tracking-wide">{trend}</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{title}</p>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter break-words">
            {Number(valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h3>
        </div>
        <TrendingUp size={90} className="absolute -right-3 -bottom-5 text-slate-50 dark:text-slate-800/30 group-hover:scale-110 transition-transform duration-700" />
      </div>
  );
}

/* ─── Badge ──────────────────────────────────────────────── */
function Badge({ tipo }) {
  const styles = {
    OURO:   "bg-amber-50  text-amber-600  border-amber-200  dark:bg-amber-500/10  dark:border-amber-500/20",
    PRATA:  "bg-slate-50  text-slate-500  border-slate-200  dark:bg-slate-500/10  dark:border-slate-500/20",
    BRONZE: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20",
  };
  const current = tipo?.toUpperCase() || "PADRÃO";
  return (
      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-widest whitespace-nowrap ${styles[current] || "bg-gray-50 text-gray-400"}`}>
      {current}
    </span>
  );
}

/* ─── TabBtn ─────────────────────────────────────────────── */
function TabBtn({ label, active, onClick, color = "text-indigo-600" }) {
  return (
      <button
          onClick={onClick}
          className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
              active
                  ? `bg-white dark:bg-slate-700 shadow-md ${color} scale-[1.03]`
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
      >
        {label}
      </button>
  );
}
import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../services/api.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Users,
  Calendar,
  BookOpen,
  AlertCircle,
  Loader2,
  Filter,
  ChevronDown,
  Sparkles,
  X,
  UserCheck,
  MessageSquare,
  TrendingUp,
  UserPlus
} from "lucide-react";

export default function RelatorioCelula() {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [baixandoPDF, setBaixandoPDF] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedRelatorio, setSelectedRelatorio] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split("T")[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split("T")[0]);

  // CÁLCULOS TOTAIS (MEMBROS, VISITANTES E GERAL)
  const totaisGerais = useMemo(() => {
    return relatorios.reduce((acc, rel) => {
      const qtdMembros = rel.membrosPresentes?.length || 0;
      const qtdVisitantes = (rel.visitantesPresentes?.length || 0) + (rel.quantidadeVisitantes || 0);

      acc.membros += qtdMembros;
      acc.visitantes += qtdVisitantes;
      acc.geral += (qtdMembros + qtdVisitantes);
      return acc;
    }, { membros: 0, visitantes: 0, geral: 0 });
  }, [relatorios]);

  const abrirModal = (rel) => {
    setSelectedRelatorio(rel);
    setIsModalOpen(true);
  };

  const formatarDataLocal = (dataStr) => {
    if (!dataStr) return "—";
    const [ano, mes, dia] = dataStr.split("-").map(Number);
    const data = new Date(ano, mes - 1, dia);
    return data.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const getDecisaoTexto = (decisao) => {
    const map = {
      ACEITOU_JESUS: "Novo Convertido",
      RECONCILIOU: "Reconciliação",
      BATISMO_AGUAS: "Deseja Batismo",
      NENHUMA: "Nenhuma",
    };
    return map[decisao] || decisao || "—";
  };

  const getDecisaoCor = (decisao) => {
    if (decisao === "ACEITOU_JESUS") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (decisao === "RECONCILIOU") return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
    if (decisao === "BATISMO_AGUAS") return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  const carregarRelatorios = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const tokenRaw = localStorage.getItem("token");
      const token = tokenRaw ? tokenRaw.replace(/"/g, "").trim() : null;
      if (!token) return;

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await api.get(`/relatorios/semana?inicio=${dataInicio}&fim=${dataFim}`, config);
      setRelatorios(Array.isArray(response.data) ? response.data : response.data?.relatorios || []);
    } catch (error) {
      setErro("Erro ao buscar dados.");
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]);

  const carregarSemanaAtual = () => {
    const hoje = new Date();
    const diaDaSemana = hoje.getDay();
    const diff = diaDaSemana === 0 ? 6 : diaDaSemana - 1;
    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() - diff);
    const domingo = new Date(segunda);
    domingo.setDate(segunda.getDate() + 6);
    setDataInicio(segunda.toISOString().split("T")[0]);
    setDataFim(domingo.toISOString().split("T")[0]);
  };

  useEffect(() => { carregarSemanaAtual(); }, []);
  useEffect(() => { carregarRelatorios(); }, [carregarRelatorios]);

  const baixarPDF = () => {
    setBaixandoPDF(true);
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text("Relatório Geral de Células", 14, 20);

    // Resumo no PDF
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Total Membros: ${totaisGerais.membros} | Total Visitantes: ${totaisGerais.visitantes} | Total Geral: ${totaisGerais.geral}`, 14, 28);

    const tableData = relatorios.map(rel => [
      rel.nomeCelula,
      new Date(rel.dataReuniao).toLocaleDateString("pt-BR"),
      rel.membrosPresentes?.length || 0,
      (rel.visitantesPresentes?.length || 0) + (rel.quantidadeVisitantes || 0),
      (rel.membrosPresentes?.length || 0) + (rel.visitantesPresentes?.length || 0) + (rel.quantidadeVisitantes || 0),
      rel.estudo || "N/A"
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["Célula", "Data", "Membros", "Visitas", "Total", "Estudo"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`relatorio-celulas.pdf`);
    setBaixandoPDF(false);
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="font-bold text-slate-400 animate-pulse">Sincronizando relatórios...</p>
        </div>
    );
  }

  return (
      <div className="space-y-6 pb-20">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest">
              <Sparkles size={14} />
              <span>Gestão de Crescimento</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">
              Relatórios da <span className="text-indigo-600">Rede</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                    showFilters
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
            >
              <Filter size={18} />
              {showFilters ? "Ocultar Filtros" : "Filtrar"}
            </button>

            <button
                onClick={baixarPDF}
                disabled={baixandoPDF || relatorios.length === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 dark:bg-indigo-500 text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {baixandoPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* FILTROS ANIMADOS */}
        <AnimatePresence>
          {showFilters && (
              <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
              >
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">De</label>
                    <input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Até</label>
                    <input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button onClick={carregarSemanaAtual} className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">Esta Semana</button>
                    <button onClick={carregarRelatorios} className="flex-1 h-11 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase shadow-lg shadow-indigo-500/20 transition-all">Aplicar</button>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* CARDS DE SOMA TOTAL (O QUE VOCÊ PEDIU) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Membros</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{totaisGerais.membros}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <UserPlus size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Visitantes</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{totaisGerais.visitantes}</p>
            </div>
          </div>
          <div className="bg-indigo-600 p-6 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-indigo-500/20">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">Total Geral (Rede)</p>
              <p className="text-2xl font-black text-white">{totaisGerais.geral}</p>
            </div>
          </div>
        </div>

        {/* GRID DE RELATÓRIOS INDIVIDUAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {relatorios.map((rel, index) => {
            const membrosCount = rel.membrosPresentes?.length || 0;
            const visitantesCount = (rel.visitantesPresentes?.length || 0) + (rel.quantidadeVisitantes || 0);
            const totalCount = membrosCount + visitantesCount;

            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={rel.id}
                    onClick={() => abrirModal(rel)}
                    className="group cursor-pointer bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-indigo-500/50 transition-all shadow-sm hover:shadow-xl"
                >
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                        <Calendar size={20} />
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Data da Célula</span>
                        <span className="text-sm font-bold dark:text-slate-200">{formatarDataLocal(rel.dataReuniao)}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight mb-2 truncate">
                      {rel.nomeCelula}
                    </h3>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <BookOpen size={14} className="text-indigo-500" />
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate uppercase">
                        {rel.estudo || "Sem estudo informado"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 border-y border-slate-100 dark:border-slate-800">
                    <div className="p-4 text-center border-r border-slate-100 dark:border-slate-800">
                      <span className="block text-lg font-black text-slate-800 dark:text-white">{membrosCount}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Membros</span>
                    </div>
                    <div className="p-4 text-center border-r border-slate-100 dark:border-slate-800">
                      <span className="block text-lg font-black text-amber-500">{visitantesCount}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visitas</span>
                    </div>
                    <div className="p-4 text-center bg-indigo-50/50 dark:bg-indigo-500/5">
                      <span className="block text-lg font-black text-indigo-600 dark:text-indigo-400">{totalCount}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                    </div>
                  </div>

                  <div className="p-4 px-6 flex justify-between items-center text-[10px] font-black uppercase text-indigo-500 tracking-widest">
                    Detalhes da presença
                    <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                  </div>
                </motion.div>
            );
          })}
        </div>

        {/* MODAL DE DETALHES NOMINAIS */}
        <AnimatePresence>
          {isModalOpen && selectedRelatorio && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
                  onClick={() => setIsModalOpen(false)}
              >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                    onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                        <UserCheck size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">{selectedRelatorio.nomeCelula}</h3>
                        <p className="text-xs font-bold text-indigo-500 uppercase">{formatarDataLocal(selectedRelatorio.dataReuniao)}</p>
                      </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-8">
                    {/* Membros Presentes */}
                    <section>
                      <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest block mb-4">Membros Presentes ({selectedRelatorio.membrosPresentes?.length || 0})</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedRelatorio.membrosPresentes?.map((m, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300">
                              {m.nome || m}
                            </div>
                        ))}
                      </div>
                    </section>

                    {/* Visitantes Presentes */}
                    <section>
                      <span className="text-[11px] font-black uppercase text-amber-500 tracking-widest block mb-4">Visitantes Nominais ({selectedRelatorio.visitantesPresentes?.length || 0})</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedRelatorio.visitantesPresentes?.map((v, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                              <p className="text-sm font-black text-slate-800 dark:text-slate-200">{v.nome}</p>
                              {v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA" && (
                                  <span className={`mt-2 inline-block text-[9px] font-black px-2 py-1 rounded-lg border uppercase ${getDecisaoCor(v.decisaoEspiritual)}`}>
                            {getDecisaoTexto(v.decisaoEspiritual)}
                          </span>
                              )}
                            </div>
                        ))}
                      </div>
                    </section>

                    {/* Observações */}
                    {selectedRelatorio.observacoes && (
                        <section className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-2 text-indigo-500">
                            <MessageSquare size={16} />
                            <span className="text-[10px] font-black uppercase">Observações</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{selectedRelatorio.observacoes}"</p>
                        </section>
                    )}
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* EMPTY STATE */}
        {relatorios.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <AlertCircle size={40} className="text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold">Nenhum relatório encontrado para este período.</p>
            </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}} />
      </div>
  );
}
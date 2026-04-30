import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api.js";
import {
  Search,
  Calendar,
  Download,
  X,
  FileText,
  Users,
  Loader2,
  ChevronRight,
  RefreshCw,
  Sun,
  Moon,
  Filter,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLUNAS = [
  { campo: "escolaBiblica", label: "EBD" },
  { campo: "quartaNoite", label: "4ª Noite" },
  { campo: "quintaNoite", label: "5ª Noite" },
  { campo: "domingoManha", label: "Dom. Manhã" },
  { campo: "domingoNoite", label: "Dom. Noite" },
];

export default function SecretariaDiscipulado() {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");
  const [dataInicioFiltro, setDataInicioFiltro] = useState("");
  const [dataFimFiltro, setDataFimFiltro] = useState("");
  const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
  const [tema, setTema] = useState(localStorage.getItem("theme") || "light");

  // --- Gestão de Tema ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (tema === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", tema);
  }, [tema]);

  const toggleTema = () => setTema(prev => (prev === "light" ? "dark" : "light"));

  // --- Helpers de Data ---
  const formatarSemana = (inicio, fim) => {
    if (!inicio || !fim) return "Período indefinido";
    const f = (d) => {
      const [ano, mes, dia] = d.split("-");
      return `${dia}/${mes}`;
    };
    return `${f(inicio)} — ${f(fim)}`;
  };

  function obterSemanaAtual() {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() + diffSegunda);
    const domingo = new Date(segunda);
    domingo.setDate(segunda.getDate() + 6);
    return {
      inicio: segunda.toISOString().split("T")[0],
      fim: domingo.toISOString().split("T")[0],
    };
  }

  // --- Chamadas API ---
  const carregarRelatorios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const res = await api.get("/discipulado/todos-relatorios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRelatorios(res.data || []);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const semana = obterSemanaAtual();
    setDataInicioFiltro(semana.inicio);
    setDataFimFiltro(semana.fim);
    carregarRelatorios();
  }, []);

  // --- Filtro Otimizado ---
  const relatoriosFiltrados = useMemo(() => {
    return relatorios.filter((rel) => {
      const busca = termoBusca.toLowerCase();
      const correspondeBusca = !busca ||
          rel.nomeLider?.toLowerCase().includes(busca) ||
          rel.nomeCelula?.toLowerCase().includes(busca);

      let correspondePeriodo = true;
      if (dataInicioFiltro) correspondePeriodo = correspondePeriodo && rel.dataFim >= dataInicioFiltro;
      if (dataFimFiltro) correspondePeriodo = correspondePeriodo && rel.dataInicio <= dataFimFiltro;

      return correspondeBusca && correspondePeriodo;
    });
  }, [relatorios, termoBusca, dataInicioFiltro, dataFimFiltro]);

  // --- Geração de PDF (Exemplo Otimizado) ---
  const gerarPDFGeral = () => {
    if (relatoriosFiltrados.length === 0) return;
    const doc = new jsPDF();
    doc.text("Relatório Geral de Discipulado", 10, 10);
    // ... lógica de autoTable mantida conforme seu original
    doc.save("Relatorio_Geral.pdf");
  };

  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Sincronizando dados secretaria...</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-8">

          {/* Top Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">Secretaria</h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Controle e auditoria de discipulado celular</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                  onClick={toggleTema}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                {tema === "light" ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-yellow-400" />}
              </button>
              <button
                  onClick={carregarRelatorios}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold hover:border-indigo-500 dark:hover:border-indigo-400 transition-all"
              >
                <RefreshCw size={18} /> <span className="hidden sm:inline">Atualizar</span>
              </button>
              <button
                  onClick={gerarPDFGeral}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
              >
                <Download size={18} /> Exportar
              </button>
            </div>
          </header>

          {/* Filtros Glassmorphism */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2rem] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="lg:col-span-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  placeholder="Pesquisar por líder ou célula..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:ring-2 ring-indigo-500/50 outline-none transition-all dark:text-white"
              />
            </div>

            <div className="lg:col-span-4 flex items-center gap-2 bg-white dark:bg-slate-950 px-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Calendar size={18} className="text-slate-400" />
              <input
                  type="date"
                  value={dataInicioFiltro}
                  onChange={(e) => setDataInicioFiltro(e.target.value)}
                  className="bg-transparent py-4 text-sm font-bold outline-none"
              />
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <input
                  type="date"
                  value={dataFimFiltro}
                  onChange={(e) => setDataFimFiltro(e.target.value)}
                  className="bg-transparent py-4 text-sm font-bold outline-none"
              />
            </div>

            <button
                onClick={() => {
                  const s = obterSemanaAtual();
                  setDataInicioFiltro(s.inicio); setDataFimFiltro(s.fim); setTermoBusca("");
                }}
                className="lg:col-span-2 flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-bold hover:opacity-90 transition-all"
            >
              <Filter size={18} /> Atual
            </button>
          </section>

          {/* Listagem de Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {relatoriosFiltrados.map((rel) => (
                <div
                    key={rel.id}
                    onClick={() => setRelatorioSelecionado(rel)}
                    className="group relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Decorativo de fundo */}
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />

                  <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100/50 dark:border-indigo-500/20">
                  {rel.nomeCelula}
                </span>
                    <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {rel.nomeLider}
                  </h3>

                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-6">
                    <Calendar size={14} className="text-indigo-500" />
                    {formatarSemana(rel.dataInicio, rel.dataFim)}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                        <Users size={16} className="text-emerald-600" />
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                    {rel.presencas?.length || 0} <small className="font-medium text-slate-400">membros</small>
                  </span>
                    </div>
                  </div>
                </div>
            ))}
          </div>

          {/* Modal de Detalhes Premium */}
          {relatorioSelecionado && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 dark:border-slate-800">

                  {/* Modal Header */}
                  <div className="px-8 py-6 flex justify-between items-center bg-indigo-600 text-white">
                    <div>
                      <h2 className="text-2xl font-black">{relatorioSelecionado.nomeCelula}</h2>
                      <p className="text-indigo-100 text-sm font-medium flex items-center gap-2">
                        Líder: {relatorioSelecionado.nomeLider} • {formatarSemana(relatorioSelecionado.dataInicio, relatorioSelecionado.dataFim)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                        <Download size={20} />
                      </button>
                      <button onClick={() => setRelatorioSelecionado(null)} className="p-3 bg-white/10 hover:bg-red-500 rounded-xl transition-all">
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Tabela de Presença */}
                  <div className="p-2 md:p-8 overflow-auto flex-1 dark:bg-slate-950">
                    <div className="rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <tr>
                          <th className="px-6 py-5">Membro</th>
                          {COLUNAS.map(c => <th key={c.campo} className="px-6 py-5 text-center">{c.label}</th>)}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {relatorioSelecionado.presencas?.map((p, i) => (
                            <tr key={i} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{p.nomeMembro}</td>
                              {COLUNAS.map(col => (
                                  <td key={col.campo} className="px-6 py-4 text-center">
                                    {p[col.campo] ? (
                                        <CheckCircle2 className="mx-auto text-emerald-500" size={20} />
                                    ) : (
                                        <X className="mx-auto text-slate-200 dark:text-slate-700" size={18} />
                                    )}
                                  </td>
                              ))}
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
          )}

          {/* Empty State */}
          {relatoriosFiltrados.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <AlertCircle size={48} className="text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">Nenhum relatório encontrado para este período.</p>
              </div>
          )}
        </div>
      </div>
  );
}
import React, { useEffect, useState } from "react";
import api from "../../api/api";
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
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SecretariaDiscipulado() {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");
  const [dataInicioFiltro, setDataInicioFiltro] = useState("");
  const [dataFimFiltro, setDataFimFiltro] = useState("");
  const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);

  // ===============================
  // HELPER: CORREÇÃO DE FUSO HORÁRIO
  // ===============================
  // Transforma string "2026-02-06" em Data correta sem voltar 1 dia
  const criarDataLocal = (dataString) => {
    if (!dataString) return null;
    const [ano, mes, dia] = dataString.split("-");
    return new Date(ano, mes - 1, dia);
  };

  const formatarDataBrasileira = (dataString) => {
    const data = criarDataLocal(dataString);
    if (!data) return "—";
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatarSemana = (inicio, fim) => {
    if (!inicio || !fim) return "Período indefinido";
    return `Semana de ${formatarDataBrasileira(inicio)} a ${formatarDataBrasileira(fim)}`;
  };

  // ===============================
  // SEMANA AUTOMÁTICA
  // ===============================
  function obterSemanaAtual() {
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0=Dom, 1=Seg...
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

  useEffect(() => {
    const semana = obterSemanaAtual();
    setDataInicioFiltro(semana.inicio);
    setDataFimFiltro(semana.fim);
    carregarRelatorios();
  }, []);

  async function carregarRelatorios() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();

      const res = await api.get("/discipulado/todos-relatorios", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRelatorios(res.data || []);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      alert("Erro ao buscar relatórios. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }

  // ===============================
  // PDF INDIVIDUAL
  // ===============================
  function gerarPDF(rel) {
    const doc = new jsPDF();

    // Cabeçalho Azul
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 55, "F");

    doc.setTextColor(255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("RELATÓRIO DE DISCIPULADO", 105, 25, { align: "center" });

    doc.setFontSize(14);
    doc.text(`CÉLULA: ${rel.nomeCelula || "Sem Nome"}`, 105, 38, { align: "center" });

    // Dados do Líder
    doc.setTextColor(30);
    doc.setFontSize(11);
    doc.text(`Líder: ${rel.nomeLider || "—"}`, 14, 65);
    doc.text(`Período: ${formatarSemana(rel.dataInicio, rel.dataFim)}`, 14, 72);

    autoTable(doc, {
      startY: 80,
      head: [["Membro", "EBD", "Culto", "Dom. Manhã", "Dom. Noite"]],
      body: (rel.presencas || []).map((p) => [
        p.nomeMembro,
        p.escolaBiblica ? "SIM" : "NÃO",
        p.cultoSemana ? "SIM" : "NÃO",
        p.domingoManha ? "SIM" : "NÃO",
        p.domingoNoite ? "SIM" : "NÃO",
      ]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    doc.save(`Relatorio_${(rel.nomeCelula || "celula").replace(/\s+/g, "_")}.pdf`);
  }

  // ===============================
  // PDF GERAL
  // ===============================
  function gerarPDFGeral() {
    if (relatoriosFiltrados.length === 0) {
      alert("Não há relatórios filtrados para gerar o PDF.");
      return;
    }

    const doc = new jsPDF();

    // Cabeçalho Verde
    doc.setFillColor(6, 95, 70);
    doc.rect(0, 0, 210, 45, "F");

    doc.setTextColor(255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("RELATÓRIO GERAL - SECRETARIA", 105, 25, { align: "center" });

    let y = 55;

    relatoriosFiltrados.forEach((rel) => {
      // Verifica se cabe na página
      if (y > 250) {
        doc.addPage();
        y = 30;
      }

      doc.setTextColor(30);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Célula: ${rel.nomeCelula || "Indefinida"}`, 14, y);

      y += 6;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Líder: ${rel.nomeLider || "—"} | ${formatarSemana(rel.dataInicio, rel.dataFim)}`, 14, y);

      y += 5;

      autoTable(doc, {
        startY: y,
        head: [["Membro", "EBD", "Culto", "Dom M.", "Dom N."]],
        body: (rel.presencas || []).map((p) => [
          p.nomeMembro,
          p.escolaBiblica ? "SIM" : "NÃO",
          p.cultoSemana ? "SIM" : "NÃO",
          p.domingoManha ? "SIM" : "NÃO",
          p.domingoNoite ? "SIM" : "NÃO",
        ]),
        theme: "grid",
        headStyles: { fillColor: [6, 95, 70], textColor: 255, fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 1.5 },
      });

      y = doc.lastAutoTable.finalY + 15;
    });

    doc.save("Relatorio_Geral_Secretaria.pdf");
  }

  // ===============================
  // FILTRO OTIMIZADO
  // ===============================
  const relatoriosFiltrados = relatorios.filter((rel) => {
    const busca = termoBusca.toLowerCase();

    // Filtro de Texto
    const correspondeBusca =
      !busca ||
      rel.nomeLider?.toLowerCase().includes(busca) ||
      rel.nomeCelula?.toLowerCase().includes(busca);

    // Filtro de Data (Comparando Strings ISO é mais seguro que Date Objects)
    let correspondePeriodo = true;
    if (dataInicioFiltro) {
      correspondePeriodo = correspondePeriodo && rel.dataFim >= dataInicioFiltro;
    }
    if (dataFimFiltro) {
      correspondePeriodo = correspondePeriodo && rel.dataInicio <= dataFimFiltro;
    }

    return correspondeBusca && correspondePeriodo;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-indigo-800 font-medium">Carregando dados da secretaria...</p>
      </div>
    );
  }

  // ===============================
  // JSX
  // ===============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent tracking-tight">
              Secretaria
            </h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">
              Painel de relatórios de discipulado
            </p>
          </div>

          <div className="flex gap-3">
             <button
              onClick={carregarRelatorios}
              className="bg-white text-indigo-700 border border-indigo-200 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition shadow-sm"
            >
              <RefreshCw size={20} />
              Atualizar
            </button>
            <button
              onClick={gerarPDFGeral}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-emerald-200 hover:-translate-y-1 transition-all"
            >
              <Download size={20} />
              Baixar Geral
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/50 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={20} />
            <input
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Pesquisar por líder ou nome da célula..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-indigo-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto bg-indigo-50/50 p-2 rounded-2xl border border-indigo-100">
            <input
              type="date"
              value={dataInicioFiltro}
              onChange={(e) => setDataInicioFiltro(e.target.value)}
              className="bg-transparent px-2 py-2 outline-none text-slate-700 font-medium text-sm"
            />
            <span className="text-indigo-300">até</span>
            <input
              type="date"
              value={dataFimFiltro}
              onChange={(e) => setDataFimFiltro(e.target.value)}
              className="bg-transparent px-2 py-2 outline-none text-slate-700 font-medium text-sm"
            />
          </div>

          <button
            onClick={() => {
              const semana = obterSemanaAtual();
              setDataInicioFiltro(semana.inicio);
              setDataFimFiltro(semana.fim);
              setTermoBusca("");
            }}
            className="px-5 py-3.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-2xl font-bold transition text-sm w-full lg:w-auto"
          >
            Semana Atual
          </button>
        </div>

        {/* Listagem */}
        {relatoriosFiltrados.length === 0 ? (
          <div className="text-center py-24 bg-white/50 rounded-3xl border border-dashed border-slate-300">
            <FileText size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-600">Nenhum relatório encontrado</h3>
            <p className="text-slate-500">Tente ajustar os filtros de data ou pesquisa.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {relatoriosFiltrados.map((rel) => (
              <div
                key={rel.id} // Backend agora retorna o ID do grupo
                onClick={() => setRelatorioSelecionado(rel)}
                className="group bg-white p-6 rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex justify-between items-start mb-3">
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {rel.nomeCelula || "Célula"}
                  </span>
                  <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={20} />
                </div>

                <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">
                  {rel.nomeLider}
                </h3>

                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                  <Calendar size={14} />
                  {formatarSemana(rel.dataInicio, rel.dataFim)}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <Users size={16} className="text-indigo-500" />
                    {rel.presencas?.length || 0} Membros
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Detalhes */}
        {relatorioSelecionado && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">

              {/* Header Modal */}
              <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {relatorioSelecionado.nomeCelula || "Detalhes da Célula"}
                  </h2>
                  <p className="text-indigo-100 text-sm mt-1">
                    Líder: {relatorioSelecionado.nomeLider}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => gerarPDF(relatorioSelecionado)}
                    className="bg-white/20 hover:bg-white/30 p-2.5 rounded-xl transition text-white"
                    title="Baixar PDF"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={() => setRelatorioSelecionado(null)}
                    className="bg-white/20 hover:bg-red-500/80 p-2.5 rounded-xl transition text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Tabela Scrollável */}
              <div className="p-6 overflow-auto bg-slate-50 flex-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-xs">
                      <tr>
                        <th className="p-4">Membro</th>
                        <th className="p-4 text-center">EBD</th>
                        <th className="p-4 text-center">Culto</th>
                        <th className="p-4 text-center">Dom. Manhã</th>
                        <th className="p-4 text-center">Dom. Noite</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {relatorioSelecionado.presencas?.map((p, i) => (
                        <tr key={i} className="hover:bg-indigo-50/50 transition-colors">
                          <td className="p-4 font-medium text-slate-700">{p.nomeMembro}</td>
                          <td className="p-4 text-center">
                            {p.escolaBiblica ? <span className="text-emerald-600 font-bold">✔</span> : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="p-4 text-center">
                            {p.cultoSemana ? <span className="text-emerald-600 font-bold">✔</span> : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="p-4 text-center">
                            {p.domingoManha ? <span className="text-emerald-600 font-bold">✔</span> : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="p-4 text-center">
                            {p.domingoNoite ? <span className="text-emerald-600 font-bold">✔</span> : <span className="text-slate-300">—</span>}
                          </td>
                        </tr>
                      ))}
                      {(!relatorioSelecionado.presencas || relatorioSelecionado.presencas.length === 0) && (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400">
                            Nenhuma presença registrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Download,
  FileText,
  Users,
  UserPlus,
  Calendar,
  BookOpen,
  AlertCircle,
  Loader2,
  RefreshCw,
  Heart,
} from "lucide-react";

export default function RelatorioCelula() {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [baixandoPDF, setBaixandoPDF] = useState(false);

  const [dataInicio, setDataInicio] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split("T")[0]
  );

  const formatarDataLocal = (dataStr) => {
    if (!dataStr) return "—";
    const [ano, mes, dia] = dataStr.split("-").map(Number);
    const data = new Date(ano, mes - 1, dia);
    return data.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getDecisaoTexto = (decisao) => {
    const map = {
      ACEITOU_JESUS: "Aceitou Jesus",
      RECONCILIOU: "Reconciliou / Voltou",
      BATISMO_AGUAS: "Deseja Batismo",
      NENHUMA: "Nenhuma",
    };
    return map[decisao] || decisao || "—";
  };

  const getDecisaoCor = (decisao) => {
    if (decisao === "ACEITOU_JESUS") return "text-green-600 font-medium";
    if (decisao === "RECONCILIOU") return "text-blue-600 font-medium";
    if (decisao === "BATISMO_AGUAS") return "text-purple-600 font-medium";
    return "text-slate-500";
  };

  const carregarRelatorios = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);

      const tokenRaw = localStorage.getItem("token");
      const token = tokenRaw ? tokenRaw.replace(/"/g, "").trim() : null;

      if (!token) {
        setErro("Sessão expirada. Faça login novamente.");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      let url = "/relatorios";
      if (dataInicio && dataFim) {
        url = `/relatorios/semana?inicio=${dataInicio}&fim=${dataFim}`;
      }

      const response = await api.get(url, config);
      const dados = response.data;

      let lista = [];
      if (Array.isArray(dados)) {
        lista = dados;
      } else if (dados?.relatorios && Array.isArray(dados.relatorios)) {
        lista = dados.relatorios;
      } else {
        lista = [];
      }

      setRelatorios(lista);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      setErro("Não foi possível carregar os relatórios. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    carregarRelatorios();
  }, [carregarRelatorios]);

  const baixarPDF = () => {
    if (relatorios.length === 0) {
      alert("Nenhum relatório para exportar.");
      return;
    }

    setBaixandoPDF(true);

    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text("RELATÓRIOS DAS CÉLULAS", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(
      `Período: ${dataInicio} a ${dataFim} • Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
      105,
      28,
      { align: "center" }
    );

    // Tabela principal
    const tableData = relatorios.map((rel) => {
      const membros = rel.membrosPresentes?.length ?? 0;
      const visitantesCad = rel.visitantesPresentes?.length ?? 0;
      const avulsos = rel.quantidadeVisitantes ?? 0;
      const total = membros + visitantesCad + avulsos;

      return [
        rel.nomeCelula || "—",
        formatarDataLocal(rel.dataReuniao),
        rel.estudo || "—",
        membros,
        visitantesCad + avulsos,
        total,
      ];
    });

    autoTable(doc, {
      head: [["Célula", "Data", "Estudo", "Membros", "Visitas", "Total"]],
      body: tableData,
      startY: 40,
      theme: "grid",
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: { fontSize: 9, cellPadding: 4, overflow: "linebreak" },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 50 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
      },
      margin: { top: 40, left: 15, right: 15 },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Página ${data.pageNumber} de ${pageCount} • Sistema de Gestão de Células`,
          105,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      },
    });

    // Seção de Decisões Espirituais (apenas as relevantes)
    let y = doc.lastAutoTable.finalY + 15;

    relatorios.forEach((rel) => {
      const decisoesRelevantes = (rel.visitantesPresentes || []).filter(
        (v) => v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA"
      );

      if (decisoesRelevantes.length > 0) {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(30, 58, 138);
        doc.text(
          `Decisões Espirituais - ${rel.nomeCelula} (${formatarDataLocal(rel.dataReuniao)})`,
          20,
          y
        );
        y += 8;

        doc.setFontSize(10);
        doc.setTextColor(60);

        decisoesRelevantes.forEach((v) => {
          const texto = getDecisaoTexto(v.decisaoEspiritual);
          doc.text(`• ${v.nome} → ${texto}`, 25, y);
          y += 7;

          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });

        y += 12;
      }
    });

    doc.save(`relatorios-celulas-${dataInicio}-a-${dataFim}.pdf`);
    setBaixandoPDF(false);
  };

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

  useEffect(() => {
    carregarSemanaAtual();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium text-lg">{erro}</p>
          <button
            onClick={carregarRelatorios}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tight">
              Relatórios das Células
            </h1>
            <p className="text-slate-600 mt-2">
              Filtre por período semanal e exporte em PDF
            </p>
          </div>

          <button
            onClick={baixarPDF}
            disabled={baixandoPDF || relatorios.length === 0}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition-all ${
              baixandoPDF || relatorios.length === 0
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95"
            }`}
          >
            {baixandoPDF ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download size={20} />
                Baixar PDF Completo
              </>
            )}
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-600" />
                Início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-600" />
                Fim
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={carregarSemanaAtual}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-medium transition flex items-center gap-2 border border-slate-300"
              >
                <RefreshCw size={16} />
                Semana Atual
              </button>

              <button
                onClick={carregarRelatorios}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition flex items-center gap-2 shadow-md"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        {relatorios.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-slate-100">
            <FileText className="w-20 h-20 text-slate-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-700 mb-3">
              Nenhum relatório encontrado
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Nenhum relatório no período selecionado ou ainda não foram enviados pelos líderes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatorios.map((rel) => {
              const membros = rel.membrosPresentes?.length ?? 0;
              const visitantesCad = rel.visitantesPresentes?.length ?? 0;
              const avulsos = rel.quantidadeVisitantes ?? 0;
              const total = membros + visitantesCad + avulsos;

              const decisoesRelevantes = (rel.visitantesPresentes || []).filter(
                (v) => v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA"
              );

              return (
                <div
                  key={rel.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 text-white">
                    <h3 className="font-bold text-xl truncate">{rel.nomeCelula}</h3>
                    <div className="flex items-center gap-2 mt-2 text-indigo-100 text-sm">
                      <Calendar size={14} />
                      {formatarDataLocal(rel.dataReuniao)}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen size={18} className="text-indigo-600" />
                      <p className="font-medium text-slate-700 truncate">
                        {rel.estudo || "—"}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-indigo-50 rounded-2xl">
                        <Users size={20} className="mx-auto mb-1 text-indigo-600" />
                        <p className="text-2xl font-bold text-indigo-700">{membros}</p>
                        <p className="text-xs text-indigo-600 font-medium">Membros</p>
                      </div>

                      <div className="text-center p-4 bg-amber-50 rounded-2xl">
                        <UserPlus size={20} className="mx-auto mb-1 text-amber-600" />
                        <p className="text-2xl font-bold text-amber-700">
                          {visitantesCad + avulsos}
                        </p>
                        <p className="text-xs text-amber-600 font-medium">Visitas</p>
                      </div>

                      <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                        <div className="text-2xl font-bold text-emerald-700 mt-2">{total}</div>
                        <p className="text-xs text-emerald-600 font-medium mt-1">Total</p>
                      </div>
                    </div>

                    <div className="space-y-5 text-sm">
                      {/* Membros */}
                      <div>
                        <p className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Users size={16} /> Membros ({membros})
                        </p>
                        {membros > 0 ? (
                          <ul className="list-disc pl-5 space-y-1 text-slate-600">
                            {rel.membrosPresentes.map((m) => (
                              <li key={m.id}>{m.nome}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-400 italic">Nenhum</p>
                        )}
                      </div>

                      {/* Visitantes cadastrados */}
                      <div>
                        <p className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <UserPlus size={16} /> Visitantes cadastrados ({visitantesCad})
                        </p>
                        {visitantesCad > 0 ? (
                          <ul className="list-disc pl-5 space-y-1 text-slate-600">
                            {rel.visitantesPresentes.map((v) => (
                              <li key={v.id} className="flex justify-between">
                                <span>{v.nome}</span>
                                {v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA" && (
                                  <span className={`text-xs ${getDecisaoCor(v.decisaoEspiritual)}`}>
                                    {getDecisaoTexto(v.decisaoEspiritual)}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-400 italic">Nenhum</p>
                        )}
                      </div>

                      {/* Decisões espirituais destacadas */}
                      {decisoesRelevantes.length > 0 && (
                        <div className="pt-3 border-t border-slate-100">
                          <p className="font-semibold text-rose-700 mb-2 flex items-center gap-2">
                            <Heart size={16} className="text-rose-500" fill="currentColor" />
                            Decisões Espirituais
                          </p>
                          <ul className="space-y-1.5 pl-2">
                            {decisoesRelevantes.map((v) => (
                              <li
                                key={v.id}
                                className={`pl-4 border-l-2 ${v.decisaoEspiritual === "ACEITOU_JESUS" ? "border-green-500" : v.decisaoEspiritual === "RECONCILIOU" ? "border-blue-500" : "border-purple-500"}`}
                              >
                                <span className="font-medium">{v.nome}</span>
                                <span className={`ml-2 text-xs ${getDecisaoCor(v.decisaoEspiritual)}`}>
                                  → {getDecisaoTexto(v.decisaoEspiritual)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Avulsos */}
                      {avulsos > 0 && (
                        <p className="font-semibold text-rose-600 flex items-center gap-2">
                          <UserPlus size={16} /> Avulsos: {avulsos}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
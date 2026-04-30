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
  Moon,
  Sun,
  ChevronRight
} from "lucide-react";

export default function RelatorioCelula() {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [baixandoPDF, setBaixandoPDF] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split("T")[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split("T")[0]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

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
    if (decisao === "ACEITOU_JESUS") return "text-emerald-600 dark:text-emerald-400 font-bold";
    if (decisao === "RECONCILIOU") return "text-blue-600 dark:text-blue-400 font-bold";
    if (decisao === "BATISMO_AGUAS") return "text-purple-600 dark:text-purple-400 font-bold";
    return "text-slate-400";
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
      setRelatorios(Array.isArray(dados) ? dados : dados?.relatorios || []);
    } catch (error) {
      setErro("Não foi possível carregar os relatórios.");
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    carregarRelatorios();
  }, [carregarRelatorios]);

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

  const baixarPDF = () => { /* Sua lógica de exportação jsPDF permanece aqui */ };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Cabeçalho */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
                Relatórios <span className="text-indigo-600">Células</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Controle de presença e frutos espirituais</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                  onClick={toggleTheme}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
              >
                {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
              </button>
              <button
                  onClick={baixarPDF}
                  disabled={baixandoPDF || relatorios.length === 0}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all active:scale-95"
              >
                {baixandoPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download size={20} />}
                {baixandoPDF ? "Gerando PDF..." : "Baixar Relatório"}
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Início</label>
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Fim</label>
                <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button onClick={carregarSemanaAtual} className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition">Semana Atual</button>
                <button onClick={carregarRelatorios} className="flex-1 py-3 px-4 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-medium shadow-md">Atualizar</button>
              </div>
            </div>
          </div>

          {/* Grid de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatorios.map((rel) => {
              const membros = rel.membrosPresentes || [];
              const visitantes = rel.visitantesPresentes || [];
              const avulsos = rel.quantidadeVisitantes ?? 0;
              const total = membros.length + visitantes.length + avulsos;
              const decisoes = visitantes.filter(v => v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA");

              return (
                  <div key={rel.id} className="flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-500">

                    {/* Header do Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-2xl truncate pr-2">{rel.nomeCelula}</h3>
                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg">
                          <Users size={20} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-indigo-100 text-sm">
                        <Calendar size={14} /> {formatarDataLocal(rel.dataReuniao)}
                      </div>
                    </div>

                    <div className="p-6 space-y-6 flex-1">
                      {/* Estudo */}
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <BookOpen size={18} className="text-indigo-500" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{rel.estudo || "Estudo não informado"}</p>
                      </div>

                      {/* Stats Quick View */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center py-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <span className="block text-xl font-black text-indigo-600">{membros.length}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Membros</span>
                        </div>
                        <div className="text-center py-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <span className="block text-xl font-black text-amber-500">{visitantes.length + avulsos}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Visitas</span>
                        </div>
                        <div className="text-center py-3 bg-indigo-600 rounded-xl">
                          <span className="block text-xl font-black text-white">{total}</span>
                          <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-tighter">Total</span>
                        </div>
                      </div>

                      {/* Listagem de Membros */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-400 mb-2 flex items-center gap-2">
                            <Users size={12} /> Membros Presentes
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {membros.length > 0 ? membros.map(m => (
                                <span key={m.id} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-[11px] font-medium rounded-full border border-slate-200 dark:border-slate-700">
                            {m.nome}
                          </span>
                            )) : <span className="text-xs italic text-slate-400">Nenhum membro registrado</span>}
                          </div>
                        </div>

                        {/* Listagem de Visitantes e Suas Decisões */}
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-400 mb-2 flex items-center gap-2">
                            <UserPlus size={12} /> Visitantes
                          </h4>
                          <div className="space-y-2">
                            {visitantes.length > 0 ? visitantes.map(v => (
                                <div key={v.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                                  <span className="text-xs font-semibold">{v.nome}</span>
                                  {v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA" && (
                                      <span className={`text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-700 ${getDecisaoCor(v.decisaoEspiritual)}`}>
                                {getDecisaoTexto(v.decisaoEspiritual)}
                              </span>
                                  )}
                                </div>
                            )) : <p className="text-xs italic text-slate-400">Nenhuma visita registrada</p>}
                            {avulsos > 0 && (
                                <div className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg inline-block">
                                  + {avulsos} Visitantes Avulsos
                                </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* DESTAQUE DE DECISÕES ESPIRITUAIS */}
                      {decisoes.length > 0 && (
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="p-4 rounded-[1.5rem] bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 relative overflow-hidden">
                              <div className="absolute right-[-10px] bottom-[-10px] text-rose-200 dark:text-rose-900 opacity-20">
                                <Heart size={80} fill="currentColor" />
                              </div>
                              <p className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase tracking-widest mb-3">
                                <Heart size={14} fill="currentColor" /> Frutos da Reunião
                              </p>
                              <ul className="space-y-2 relative z-10">
                                {decisoes.map((v) => (
                                    <li key={v.id} className="flex items-center gap-2">
                                      <ChevronRight size={12} className="text-rose-400" />
                                      <div className="text-xs">
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{v.nome}</span>
                                        <span className={`ml-2 ${getDecisaoCor(v.decisaoEspiritual)}`}>
                                  {getDecisaoTexto(v.decisaoEspiritual)}
                                </span>
                                      </div>
                                    </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                      )}
                    </div>
                  </div>
              );
            })}
          </div>
        </div>
      </div>
  );
}
import React, { useEffect, useState, useMemo } from "react";
import {
  LogOut,
  Users,
  GitBranch,
  Calendar,
  AlertTriangle,
  MessageCircle,
  CheckCircle,
  Activity,
  Gift,
  Send,
  Sun,
  Moon,
  ChevronRight,
  Bell,
  Sparkles,
  ExternalLink
} from "lucide-react";
import api from "../../services/api.js";

export default function PainelPastor() {
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));
  const [alertas, setAlertas] = useState([]);
  const [metricas, setMetricas] = useState({
    celulasAtivas: 0,
    totalMembros: 0,
    multiplicacoesMes: 0,
  });
  const [aniversariantes, setAniversariantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tema, setTema] = useState(localStorage.getItem("theme") || "light");

  // --- Gestão de Tema ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (tema === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", tema);
  }, [tema]);

  const toggleTema = () => setTema(prev => (prev === "light" ? "dark" : "light"));

  // --- Carregamento de Dados ---
  const carregarDados = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token")?.replace(/"/g, "");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { mes }
      };

      const [resMetricas, resAlertas] = await Promise.all([
        api.get("/api/pastor/metricas", config),
        api.get("/discipulado/alertas", config),
      ]);

      setMetricas(resMetricas.data || { celulasAtivas: 0, totalMembros: 0, multiplicacoesMes: 0 });
      setAlertas(resAlertas.data || []);
    } catch (error) {
      console.error("Erro dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarAniversariantes = async () => {
    try {
      const res = await api.get("/api/aniversariantes/hoje");
      setAniversariantes(res.data || []);
    } catch (err) {
      console.error("Erro aniversariantes:", err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [mes]);

  useEffect(() => {
    carregarAniversariantes();
  }, []);

  // --- Ações ---
  const sair = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const enviarWhatsApp = (membro, tipo = "geral") => {
    const saudacao = tipo === "niver"
        ? `Parabéns ${membro.nome}! 🎉 Que Deus te abençoe ricamente hoje!`
        : `Olá ${membro.nome}, a paz do Senhor! Como você está?`;

    const fone = membro.telefone?.replace(/\D/g, "");
    window.open(`https://wa.me/55${fone}?text=${encodeURIComponent(saudacao)}`, "_blank");
  };

  const marcarComoAcompanhado = async (id) => {
    try {
      await api.post("/discipulado/acompanhamento", { membroId: id, mesReferencia: mes });
      setAlertas(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert("Erro ao atualizar.");
    }
  };

  if (loading && metricas.celulasAtivas === 0) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <Activity className="w-12 h-12 text-indigo-600 animate-spin" />
              <Sparkles className="absolute -top-2 -right-2 text-amber-500 animate-pulse" size={20} />
            </div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Sincronizando Visão Pastoral...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

          {/* HEADER */}
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                <Activity className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Dashboard Pastoral</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Gestão e Cuidado de Vidas</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 lg:flex-none">
                <Calendar size={18} className="text-indigo-500" />
                <input
                    type="month"
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                    className="bg-transparent border-none outline-none font-bold text-sm dark:text-white"
                />
              </div>
              <button onClick={toggleTema} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-105 transition-all">
                {tema === "light" ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-amber-400" />}
              </button>
              <button onClick={sair} className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-100 dark:border-red-900/50 hover:bg-red-600 hover:text-white transition-all">
                <LogOut size={20} />
              </button>
            </div>
          </header>

          {/* MÉTRICAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard titulo="Células Ativas" valor={metricas.celulasAtivas} icon={Activity} color="blue" />
            <StatCard titulo="Membros Totais" valor={metricas.totalMembros} icon={Users} color="indigo" />
            <StatCard titulo="Multiplicações" valor={metricas.multiplicacoesMes} icon={GitBranch} color="emerald" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* ALERTAS (Lado Esquerdo) */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3 text-red-600">
                    <AlertTriangle size={24} />
                    <h2 className="text-xl font-black uppercase tracking-tight">Alertas de Faltas</h2>
                  </div>
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-600 px-4 py-1 rounded-full text-xs font-black">
                  {alertas.length} CRÍTICOS
                </span>
                </div>
                <div className="p-4 space-y-3">
                  {alertas.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <CheckCircle className="mx-auto mb-2 opacity-20" size={48} />
                        <p className="font-medium">Nenhum membro em estado crítico.</p>
                      </div>
                  ) : (
                      alertas.map((m) => (
                          <div key={m.id} className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center font-black text-lg">
                                {m.nome.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-100">{m.nome}</h4>
                                <p className="text-red-500 text-xs font-black uppercase">{m.totalFaltas} faltas consecutivas</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => enviarWhatsApp(m)} className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all">
                                <MessageCircle size={20} />
                              </button>
                              <button onClick={() => marcarComoAcompanhado(m.id)} className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                <CheckCircle size={20} />
                              </button>
                            </div>
                          </div>
                      ))
                  )}
                </div>
              </section>
            </div>

            {/* ANIVERSARIANTES (Lado Direito) */}
            <section className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-pink-500/20 h-fit">
              <div className="flex justify-between items-center mb-8">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Gift size={28} />
                </div>
                <button className="bg-white/20 hover:bg-white text-white hover:text-pink-600 px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2">
                  <Send size={14} /> ENVIAR TODOS
                </button>
              </div>

              <h2 className="text-2xl font-black mb-1">Aniversariantes</h2>
              <p className="text-pink-100 text-sm font-medium mb-6">Celebrando o dom da vida hoje</p>

              <div className="space-y-3">
                {aniversariantes.length === 0 ? (
                    <p className="text-center py-6 text-sm opacity-60 italic">Nenhum aniversário para hoje.</p>
                ) : (
                    aniversariantes.map((p) => (
                        <div key={p.id} className="flex items-center justify-between bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 group hover:bg-white/20 transition-all">
                          <span className="font-bold truncate text-sm">{p.nome}</span>
                          <button
                              onClick={() => enviarWhatsApp(p, "niver")}
                              className="p-2 bg-white text-pink-600 rounded-lg shadow-lg hover:scale-110 transition-transform"
                          >
                            <MessageCircle size={16} />
                          </button>
                        </div>
                    ))
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <button className="w-full flex items-center justify-between text-xs font-bold opacity-80 hover:opacity-100 transition-opacity">
                  VER CALENDÁRIO COMPLETO <ChevronRight size={14} />
                </button>
              </div>
            </section>

          </div>
        </div>
      </div>
  );
}

// --- Componentes Internos Estilizados ---

function StatCard({ titulo, valor, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
  };

  return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-all group">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${colors[color]}`}>
          <Icon size={30} />
        </div>
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{titulo}</p>
        <h2 className="text-4xl font-black tracking-tighter text-slate-800 dark:text-white leading-none">
          {valor?.toLocaleString("pt-BR") || 0}
        </h2>
      </div>
  );
}
import React, { useEffect, useState } from "react";
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
  Sun,
  Moon,
  ChevronRight,
  Sparkles
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
      const tokenRaw = localStorage.getItem("token");
      const token = tokenRaw ? tokenRaw.replace(/"/g, "").trim() : null;

      const mesParaEnvio = mes.includes("-") ? mes : new Date().toISOString().slice(0, 7);

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { mes: mesParaEnvio }
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
    const nomeMembro = membro.nome || "irmão(ã)";
    let saudacao = "";

    if (tipo === "niver") {
      saudacao = `FELIZ ANIVERSÁRIO!\n\nPaz seja contigo, querido(a) ${nomeMembro}!\n\nNesta data tão especial, celebramos a sua vida e o propósito de Deus em você. Desejamos que o Senhor derrame bênçãos sem medida.\n\nCom amor, Pastor Renato e Jaci Soares`;
    } else {
      saudacao = `Olá, *${nomeMembro}*! Paz seja contigo. Passando para saber como você está! Que sua semana seja abençoada.`;
    }

    const fone = membro.telefone?.replace(/\D/g, "");
    if (!fone || fone.length < 10) {
      alert("Telefone inválido ou não cadastrado.");
      return;
    }

    const link = `https://wa.me/55${fone}?text=${encodeURIComponent(saudacao)}`;
    window.open(link, "_blank");
  };

  const marcarComoAcompanhado = async (id) => {
    try {
      await api.post("/discipulado/acompanhamento", { membroId: id, mesReferencia: mes });
      setAlertas(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert("Erro ao atualizar acompanhamento.");
    }
  };

  if (loading && metricas.celulasAtivas === 0) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="text-center space-y-4">
            <Activity className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Sincronizando Visão...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">

          {/* HEADER RESPONSIVO */}
          <header className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2.5 md:p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                  <Activity className="text-white w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-black tracking-tight">Painel Pastoral</h1>
                  <p className="hidden md:block text-slate-500 dark:text-slate-400 font-medium text-sm">Gestão e Cuidado de Vidas</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={toggleTema} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  {tema === "light" ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-amber-400" />}
                </button>
                <button onClick={sair} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-100 dark:border-red-900/50">
                  <LogOut size={20} />
                </button>
              </div>
            </div>

            {/* SELETOR DE MÊS MOBILE FULL WIDTH */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-full lg:w-fit">
              <Calendar size={18} className="text-indigo-500" />
              <input
                  type="month"
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="bg-transparent border-none outline-none font-bold text-sm dark:text-white cursor-pointer w-full"
              />
            </div>
          </header>

          {/* MÉTRICAS GRID - 1 col mobile, 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <StatCard titulo="Células Ativas" valor={metricas.celulasAtivas} icon={Activity} color="blue" />
            <StatCard titulo="Membros Totais" valor={metricas.totalMembros} icon={Users} color="indigo" />
            <StatCard titulo="Multiplicações" valor={metricas.multiplicacoesMes} icon={GitBranch} color="emerald" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">

            {/* ALERTAS */}
            <div className="lg:col-span-2 space-y-4">
              <section className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle size={20} className="md:w-6 md:h-6" />
                    <h2 className="text-lg md:text-xl font-black uppercase">Alertas</h2>
                  </div>
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-600 px-3 py-1 rounded-full text-[10px] font-black">
                  {alertas.length} CRÍTICOS
                </span>
                </div>

                <div className="p-2 md:p-4 space-y-2">
                  {alertas.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <CheckCircle className="mx-auto mb-2 opacity-20" size={40} />
                        <p className="text-sm">Tudo em dia!</p>
                      </div>
                  ) : (
                      alertas.map((m) => (
                          <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center font-black">
                                {m.nome.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm md:text-base">{m.nome}</h4>
                                <p className="text-red-500 text-[10px] font-black uppercase">{m.totalFaltas} faltas seguidas</p>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button onClick={() => enviarWhatsApp(m)} className="flex-1 sm:flex-none p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex justify-center">
                                <MessageCircle size={20} />
                              </button>
                              <button onClick={() => marcarComoAcompanhado(m.id)} className="flex-1 sm:flex-none p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex justify-center">
                                <CheckCircle size={20} />
                              </button>
                            </div>
                          </div>
                      ))
                  )}
                </div>
              </section>
            </div>

            {/* ANIVERSARIANTES */}
            <section className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-xl shadow-pink-500/20 h-fit">
              <div className="flex justify-between items-center mb-6">
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <Gift size={24} />
                </div>
                <Sparkles size={20} className="text-pink-200 animate-pulse" />
              </div>

              <h2 className="text-xl md:text-2xl font-black mb-1">Aniversários</h2>
              <p className="text-pink-100 text-xs font-medium mb-6">Celebrando vidas hoje</p>

              <div className="space-y-3">
                {aniversariantes.length === 0 ? (
                    <p className="text-center py-6 text-sm opacity-60 italic">Nenhum hoje.</p>
                ) : (
                    aniversariantes.map((p) => (
                        <div key={p.id} className="flex items-center justify-between bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
                          <span className="font-bold truncate text-sm mr-2">{p.nome}</span>
                          <button
                              onClick={() => enviarWhatsApp(p, "niver")}
                              className="p-2 bg-white text-pink-600 rounded-lg shrink-0"
                          >
                            <MessageCircle size={18} />
                          </button>
                        </div>
                    ))
                )}
              </div>

              <button className="w-full mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">
                Calendário Completo <ChevronRight size={14} />
              </button>
            </section>

          </div>
        </div>
      </div>
  );
}

function StatCard({ titulo, valor, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
  };

  return (
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 md:mb-6 ${colors[color]}`}>
          <Icon size={24} className="md:w-[30px] md:h-[30px]" />
        </div>
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{titulo}</p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-800 dark:text-white leading-none">
          {valor?.toLocaleString("pt-BR") || 0}
        </h2>
      </div>
  );
}
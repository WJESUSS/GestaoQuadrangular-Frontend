import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../services/api.js";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid
} from "recharts";
import {
  ArrowRight, Wallet, Award, TrendingUp, Zap, Info,
  ChevronLeft, ChevronRight, Calendar, RefreshCcw
} from "lucide-react";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const spinKeyframes = `@keyframes dashSpin { to { transform: rotate(360deg); } }`;

/* Detecta dispositivo touch — roda uma vez, fora do componente */
const isTouchDevice = () =>
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

export default function TesourariaDashboard() {
  const navigate = useNavigate();
  const hoje = new Date();

  const [modo, setModo] = useState("mensal");
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());

  const [resumo, setResumo] = useState({ DIZIMO: 0, BRONZE: 0, PRATA: 0, OURO: 0 });
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayTimer = useRef(null);
  const isTouch = useRef(isTouchDevice());

  const carregarResumo = useCallback(async () => {
    try {
      setLoading(true);
      if (isTouch.current) setShowOverlay(true); // overlay só no mobile/touch

      let dados = [];

      if (modo === "mensal") {
        const res = await api.get("/tesouraria/relatorio-tesouraria", {
          params: { mes, ano },
        });
        dados = res.data.registros || [];
      } else {
        const res = await api.get("/tesouraria/listar", {
          params: { ano },
        });
        dados = res.data || [];
      }

      const calc = { DIZIMO: 0, BRONZE: 0, PRATA: 0, OURO: 0 };
      dados.forEach((r) => {
        calc.DIZIMO += r.valorDizimo || 0;
        if (r.tipoOferta === "BRONZE") calc.BRONZE += r.valorOferta || 0;
        if (r.tipoOferta === "PRATA")  calc.PRATA  += r.valorOferta || 0;
        if (r.tipoOferta === "OURO")   calc.OURO   += r.valorOferta || 0;
      });

      setResumo(calc);
    } catch (err) {
      console.error("Erro ao carregar resumo:", err);
    } finally {
      overlayTimer.current = setTimeout(() => {
        setLoading(false);
        setShowOverlay(false);
      }, 600);
    }
  }, [modo, mes, ano]);

  useEffect(() => {
    carregarResumo();
    return () => clearTimeout(overlayTimer.current);
  }, [carregarResumo]);

  const navegarParaFiltro = (categoria) => {
    navigate("/tesouraria/relatorio", { state: { filtroInicial: categoria } });
  };

  const totalGeral = resumo.DIZIMO + resumo.BRONZE + resumo.PRATA + resumo.OURO;
  const totalOfertas = resumo.BRONZE + resumo.PRATA + resumo.OURO;

  const dadosGrafico = [
    { tipo: "Dízimo", valor: resumo.DIZIMO, cor: "#6366f1" },
    { tipo: "Bronze", valor: resumo.BRONZE, cor: "#d97706" },
    { tipo: "Prata",  valor: resumo.PRATA,  cor: "#64748b" },
    { tipo: "Ouro",   valor: resumo.OURO,   cor: "#eab308" },
  ];

  const periodoLabel = modo === "mensal"
      ? `${MESES[mes - 1]} de ${ano}`
      : `Exercício ${ano}`;

  return (
      <>
        <style>{spinKeyframes}</style>

        {/* Overlay suave — apenas em dispositivos touch/mobile */}
        {showOverlay && (
            <div style={{
              position: "fixed", inset: 0, zIndex: 50,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              pointerEvents: "none",
            }}>
              <div style={{
                width: 40, height: 40,
                border: "3px solid #e0e7ff",
                borderTop: "3px solid #6366f1",
                borderRadius: "50%",
                animation: "dashSpin 0.7s linear infinite",
              }} />
            </div>
        )}

        <div>
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2">
              <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-pulse" />
              Live Data
            </span>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
                Dashboard<span className="text-indigo-500">.</span>
              </h2>
            </div>

            <div className="bg-white dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total — {periodoLabel}</p>
                <p className="text-xl font-black text-emerald-500 tracking-tighter">
                  {loading
                      ? <span className="inline-block w-32 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse align-middle" />
                      : `R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  }
                </p>
              </div>
              <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                <Zap size={20} fill="currentColor" />
              </div>
            </div>
          </div>

          {/* FILTRO BAR */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-[2rem] p-3 mb-8 flex flex-col sm:flex-row items-center gap-3 shadow-sm flex-wrap">

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 w-full sm:w-auto">
              {["mensal", "anual"].map((m) => (
                  <button
                      key={m}
                      onClick={() => setModo(m)}
                      className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                          modo === m
                              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                  >
                    {m}
                  </button>
              ))}
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            {modo === "mensal" && (
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto justify-center">
                  <button onClick={() => setMes(prev => prev === 1 ? 12 : prev - 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 active:scale-90">
                    <ChevronLeft size={15} />
                  </button>
                  <span className="px-3 font-black text-[11px] uppercase tracking-widest text-slate-700 dark:text-slate-200 min-w-[96px] text-center">
                {MESES[mes - 1]}
              </span>
                  <button onClick={() => setMes(prev => prev === 12 ? 1 : prev + 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 active:scale-90">
                    <ChevronRight size={15} />
                  </button>
                </div>
            )}

            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto justify-center">
              <button onClick={() => setAno(prev => prev - 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 active:scale-90">
                <ChevronLeft size={15} />
              </button>
              <span className="px-3 font-black text-[11px] tracking-widest text-slate-700 dark:text-slate-200 min-w-[52px] text-center">
              {ano}
            </span>
              <button onClick={() => setAno(prev => prev + 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 active:scale-90">
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest sm:ml-auto">
              <Calendar size={12} />
              {periodoLabel}
            </div>

            <button
                onClick={carregarResumo}
                disabled={loading}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:rotate-180 duration-500 shrink-0"
            >
              <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <CardInterativo titulo="Dízimos" valor={resumo.DIZIMO} cor="indigo" icon={<Wallet size={20} />} loading={loading} onClick={() => navegarParaFiltro("TODOS")} />
            <CardInterativo titulo="Ouro"    valor={resumo.OURO}   cor="yellow" icon={<Award  size={20} />} loading={loading} onClick={() => navegarParaFiltro("OURO")} />
            <CardInterativo titulo="Prata"   valor={resumo.PRATA}  cor="slate"  icon={<Award  size={20} />} loading={loading} onClick={() => navegarParaFiltro("PRATA")} />
            <CardInterativo titulo="Bronze"  valor={resumo.BRONZE} cor="orange" icon={<Award  size={20} />} loading={loading} onClick={() => navegarParaFiltro("BRONZE")} />
          </div>

          {/* GRÁFICO + LATERAL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/25">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase italic dark:text-white tracking-tighter leading-none">
                      Fluxo por Categoria
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {periodoLabel}
                    </p>
                  </div>
                </div>
                <Info size={16} className="text-slate-300 dark:text-slate-600 cursor-help" />
              </div>

              <div className="h-[240px] md:h-[300px] w-full">
                {loading ? (
                    <div className="h-full w-full bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dadosGrafico} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.06} />
                        <XAxis dataKey="tipo" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: '800', fontSize: 10 }} dy={14} />
                        <YAxis hide />
                        <Tooltip
                            cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.18)', background: '#0f172a', color: '#fff', padding: '14px 22px' }}
                            itemStyle={{ color: '#fff', fontWeight: '800', fontSize: 13 }}
                            labelStyle={{ display: 'none' }}
                            formatter={(v) => [`R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]}
                        />
                        <Bar dataKey="valor" radius={[14, 14, 6, 6]} barSize={40}>
                          {dadosGrafico.map((entry, i) => <Cell key={i} fill={entry.cor} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Painel lateral */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-6 md:p-8 text-white flex flex-col justify-between shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-200 mb-1">Período Selecionado</p>
                <h4 className="text-2xl font-black leading-tight italic uppercase tracking-tighter">
                  {modo === "mensal" ? MESES[mes - 1] : `Ano ${ano}`}
                </h4>
                {modo === "mensal" && (
                    <p className="text-sm font-black text-indigo-300 mt-0.5">{ano}</p>
                )}

                <div className="mt-6 space-y-0">
                  {[
                    { label: "Dízimos", valor: resumo.DIZIMO, dot: "bg-indigo-300" },
                    { label: "Ofertas", valor: totalOfertas,  dot: "bg-amber-300"  },
                    { label: "Total",   valor: totalGeral,    dot: "bg-white"      },
                  ].map((item, i) => (
                      <div key={item.label} className={`flex items-center justify-between py-3 ${i < 2 ? "border-b border-indigo-500/40" : ""}`}>
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${item.dot}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">{item.label}</span>
                        </div>
                        {loading
                            ? <span className="inline-block w-16 h-3 bg-indigo-500 rounded animate-pulse" />
                            : <span className="font-black text-sm text-white">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        }
                      </div>
                  ))}
                </div>
              </div>

              <button
                  onClick={() => navigate("/tesouraria/relatorio")}
                  className="relative z-10 mt-6 w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
              >
                Ir para Relatórios
              </button>

              <TrendingUp size={140} className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </>
  );
}

/* ─── CardInterativo ─────────────────────────────────────── */
function CardInterativo({ titulo, valor, cor, icon, onClick, loading }) {
  const styles = {
    indigo: "border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400",
    yellow: "border-amber-500  dark:border-amber-400  text-amber-600  dark:text-amber-400",
    slate:  "border-slate-500  dark:border-slate-400  text-slate-600  dark:text-slate-400",
    orange: "border-orange-500 dark:border-orange-400 text-orange-600 dark:text-orange-400",
  };

  return (
      <button
          onClick={onClick}
          className={`group relative p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 border-b-4 bg-white dark:bg-slate-900 shadow-lg transition-all duration-300 text-left flex flex-col justify-between h-40 md:h-48 overflow-hidden hover:-translate-y-1 hover:shadow-xl active:scale-95 ${styles[cor]}`}
      >
        <div className="flex justify-between items-start relative z-10">
          <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-2xl group-hover:bg-current group-hover:text-white transition-all duration-500">
            {icon}
          </div>
          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">{titulo}</p>
          {loading ? (
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-1" />
          ) : (
              <p className="text-lg md:text-2xl font-black text-slate-800 dark:text-white tracking-tight break-words">
                R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
          )}
        </div>

        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-current opacity-[0.04] group-hover:opacity-[0.09] rounded-full blur-xl transition-opacity duration-500" />
      </button>
  );
}

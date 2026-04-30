import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import {
  CheckCircle2,
  BookOpen,
  Calendar,
  Loader2,
  ChevronDown,
  UserCheck,
  ClipboardCheck,
  Trophy,
  Users2,
  Sparkles
} from "lucide-react";

export default function TelaRelatorio() {
  const [celula, setCelula] = useState(null);
  const [pessoas, setPessoas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());

  const [form, setForm] = useState({
    celulaId: null,
    dataReuniao: new Date().toISOString().split("T")[0],
    estudo: "",
    selecionadosKeys: [],
    decisoes: {},
  });

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const headers = { Authorization: `Bearer ${token}` };

      const resCelula = await api.get("/celulas/minha-celula", { headers });
      const dadosCelula = resCelula.data;

      setCelula(dadosCelula);
      setForm((prev) => ({ ...prev, celulaId: dadosCelula.id }));

      const [resMembros, resVisitantes] = await Promise.all([
        api.get(`/celulas/${dadosCelula.id}/membros`, { headers }),
        api.get(`/visitantes/celula/${dadosCelula.id}/ativos`, { headers }),
      ]);

      const membros = (resMembros.data || []).map((m) => ({
        id: m.id, nome: m.nome, tipo: "MEMBRO", uKey: `MEMBRO-${m.id}`,
      }));

      const visitantes = (resVisitantes.data || []).map((v) => ({
        id: v.id, nome: v.nome, tipo: "VISITANTE", uKey: `VISITANTE-${v.id}`,
      }));

      setPessoas([...membros, ...visitantes].sort((a, b) => a.nome.localeCompare(b.nome)));
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const alternarPresenca = (uKey) => {
    const isMarcado = form.selecionadosKeys.includes(uKey);
    setProcessingIds((prev) => new Set(prev).add(uKey));

    setForm((prev) => {
      const novasKeys = isMarcado
          ? prev.selecionadosKeys.filter((k) => k !== uKey)
          : [...prev.selecionadosKeys, uKey];

      const novasDecisoes = { ...prev.decisoes };
      if (isMarcado) delete novasDecisoes[uKey];

      return { ...prev, selecionadosKeys: novasKeys, decisoes: novasDecisoes };
    });

    setTimeout(() => {
      setProcessingIds((prev) => {
        const novo = new Set(prev);
        novo.delete(uKey);
        return novo;
      });
    }, 200);
  };

  const membrosPresentes = form.selecionadosKeys.filter((k) => k.startsWith("MEMBRO-")).length;
  const visitantesPresentes = form.selecionadosKeys.filter((k) => k.startsWith("VISITANTE-")).length;
  const total = membrosPresentes + visitantesPresentes;

  const handleSubmit = async () => {
    if (!form.estudo.trim()) return alert("Por favor, informe o tema do estudo.");

    try {
      setEnviando(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();

      const payload = {
        celulaId: Number(form.celulaId),
        dataReuniao: form.dataReuniao,
        estudo: form.estudo.trim(),
        membrosPresentesIds: form.selecionadosKeys
            .filter(k => k.startsWith("MEMBRO-"))
            .map(k => Number(k.replace("MEMBRO-", ""))),
        visitantesPresentes: form.selecionadosKeys
            .filter(k => k.startsWith("VISITANTE-"))
            .map(k => ({
              id: Number(k.replace("VISITANTE-", "")),
              decisaoEspiritual: form.decisoes[k] || "NENHUMA"
            }))
      };

      await api.post("/relatorios", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Relatório enviado com sucesso! 🛡️");
      setForm(f => ({ ...f, estudo: "", selecionadosKeys: [], decisoes: {} }));
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao enviar relatório.";
      alert(msg);
    } finally {
      setEnviando(false);
    }
  };

  const nomeUsuarioLider = celula?.lider?.nome || celula?.usuario?.nome || "Líder";
  const nomeCelula = celula?.nome || "Carregando...";

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0f]">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
    );
  }

  return (
      <div className="min-h-screen transition-colors duration-500 bg-slate-50 dark:bg-[#0a0a0f] font-sans">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 10px; }
          .card-blur { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        `}</style>

        {/* Hero Header */}
        <div className="relative bg-indigo-600 pt-24 pb-44 px-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px] opacity-50"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-indigo-400 rounded-full blur-[100px] opacity-30"></div>
          </div>

          <div className="max-w-2xl mx-auto relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6">
              <Sparkles size={14} className="text-indigo-200" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">Relatório Semanal</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              {nomeCelula}
            </h1>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md shadow-lg">
                <UserCheck size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">Líder Responsável</p>
                <p className="text-white font-bold text-xl tracking-tight">{nomeUsuarioLider}</p>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-2xl mx-auto px-4 -mt-28 pb-40 relative z-20 space-y-6">

          {/* Card de Informações */}
          <section className="card-blur rounded-[2.5rem] p-8 shadow-2xl border transition-all bg-white border-slate-200 dark:bg-[#16161f]/80 dark:border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-1 text-indigo-600 dark:text-indigo-400">
                  <Calendar size={14} /> Data da Reunião
                </label>
                <input
                    type="date"
                    value={form.dataReuniao}
                    onChange={(e) => setForm({ ...form, dataReuniao: e.target.value })}
                    className="w-full rounded-2xl p-4 outline-none border transition-all font-bold bg-slate-100 border-slate-200 text-slate-800 focus:border-indigo-500 dark:bg-white/5 dark:border-white/10 dark:text-white dark:focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-1 text-indigo-600 dark:text-indigo-400">
                  <BookOpen size={14} /> Tema do Estudo
                </label>
                <input
                    placeholder="Qual foi o estudo de hoje?"
                    value={form.estudo}
                    onChange={(e) => setForm({ ...form, estudo: e.target.value })}
                    className="w-full rounded-2xl p-4 outline-none border transition-all font-bold bg-slate-100 border-slate-200 text-slate-800 focus:border-indigo-500 dark:bg-white/5 dark:border-white/10 dark:text-white dark:focus:border-indigo-500"
                />
              </div>
            </div>
          </section>

          {/* Dashboard de Presença */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Membros', val: membrosPresentes, color: 'text-indigo-500', bg: 'bg-white dark:bg-[#16161f]' },
              { label: 'Visitantes', val: visitantesPresentes, color: 'text-amber-500', bg: 'bg-white dark:bg-[#16161f]' },
              { label: 'Total', val: total, color: 'text-white', bg: 'bg-indigo-600' }
            ].map((item, i) => (
                <div key={i} className={`rounded-[2rem] p-5 text-center shadow-xl border border-slate-200 dark:border-white/5 ${item.bg}`}>
                  <p className={`text-[10px] font-black uppercase tracking-tighter mb-1 ${item.color === 'text-white' ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>{item.label}</p>
                  <p className={`text-4xl font-black ${item.color}`}>{item.val}</p>
                </div>
            ))}
          </div>

          {/* Lista de Chamada */}
          <section className="card-blur rounded-[2.5rem] overflow-hidden shadow-2xl border transition-all bg-white border-slate-200 dark:bg-[#16161f]/80 dark:border-white/10">
            <div className="px-8 py-6 border-b flex justify-between items-center border-slate-100 bg-slate-50 dark:border-white/5 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                  <Users2 size={22} />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Chamada</h2>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {pessoas.map((pessoa) => {
                const marcado = form.selecionadosKeys.includes(pessoa.uKey);
                const isVisitante = pessoa.tipo === "VISITANTE";
                const processing = processingIds.has(pessoa.uKey);

                return (
                    <div key={pessoa.uKey} className={`group transition-all ${marcado ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''}`}>
                      <button
                          onClick={() => alternarPresenca(pessoa.uKey)}
                          disabled={processing}
                          className="w-full flex items-center justify-between px-8 py-5 text-left active:scale-[0.98] transition-transform"
                      >
                        <div className="flex items-center gap-5">
                          <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-500 shadow-sm
                        ${marcado ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-slate-600'}`}>
                            {processing ? <Loader2 size={20} className="animate-spin" /> : pessoa.nome.charAt(0)}
                          </div>
                          <div>
                            <p className={`text-base font-bold transition-colors ${marcado ? 'text-indigo-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                              {pessoa.nome}
                            </p>
                            <span className={`text-[10px] font-black tracking-[0.15em] uppercase ${isVisitante ? 'text-amber-500' : 'text-indigo-500'}`}>
                              {pessoa.tipo}
                            </span>
                          </div>
                        </div>

                        <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300
                      ${marcado ? 'bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/40' : 'border-slate-300 dark:border-white/10'}`}>
                          {marcado && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                      </button>

                      {marcado && isVisitante && (
                          <div className="px-8 pb-6 pl-[5.5rem] animate-in slide-in-from-top-2 duration-300">
                            <div className="rounded-3xl p-5 border bg-white border-slate-200 shadow-sm dark:bg-black/40 dark:border-white/5">
                              <label className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">
                                <Trophy size={14} /> Decisão Espiritual
                              </label>
                              <div className="relative">
                                <select
                                    value={form.decisoes[pessoa.uKey] || "NENHUMA"}
                                    onChange={(e) => setForm(prev => ({
                                      ...prev, decisoes: { ...prev.decisoes, [pessoa.uKey]: e.target.value }
                                    }))}
                                    className="w-full appearance-none outline-none border rounded-2xl py-4 px-5 text-xs font-black transition-all bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500 dark:bg-[#1a1a24] dark:border-white/10 dark:text-white dark:focus:border-indigo-500"
                                >
                                  <option value="NENHUMA">Só visita</option>
                                  <option value="ACEITOU_JESUS">Aceitou Jesus</option>
                                  <option value="RECONCILIOU">Reconciliou</option>
                                  <option value="BATISMO_AGUAS">Deseja Batismo</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                              </div>
                            </div>
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
          </section>
        </main>

        <div className="fixed bottom-0 left-0 w-full p-8 z-50 pointer-events-none">
          <div className="absolute inset-0 h-40 bottom-0 pointer-events-none bg-gradient-to-t from-slate-50 to-transparent dark:from-[#0a0a0f]"></div>
          <div className="max-w-2xl mx-auto relative pointer-events-auto">
            <button
                onClick={handleSubmit}
                disabled={enviando || !form.estudo.trim()}
                className={`w-full py-6 rounded-[2.5rem] font-black text-sm tracking-[0.3em] uppercase shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95
              ${enviando || !form.estudo.trim()
                    ? "bg-slate-400 text-slate-100 cursor-not-allowed"
                    : "bg-indigo-600 text-white dark:bg-white dark:text-indigo-900"}`}
            >
              {enviando ? <Loader2 className="animate-spin" size={24} /> : <ClipboardCheck size={24} />}
              {enviando ? "Enviando..." : `Finalizar (${total})`}
            </button>
          </div>
        </div>
      </div>
  );
}
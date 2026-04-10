import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import {
  CheckCircle2,
  Users,
  UserPlus,
  BookOpen,
  Calendar,
  Send,
  AlertCircle,
  UserCheck,
  Loader2,
  ChevronDown,
} from "lucide-react";

export default function TelaRelatorio() {
  const [celula, setCelula] = useState(null);
  const [pessoas, setPessoas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

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
      setErro("");

      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const headers = { Authorization: `Bearer ${token}` };

      const resCelula = await api.get("/celulas/minha-celula", { headers });
      const minhaCelula = resCelula.data;

      setCelula(minhaCelula);
      setForm((prev) => ({ ...prev, celulaId: minhaCelula.id }));

      const [resMembros, resVisitantes] = await Promise.all([
        api.get(`/celulas/${minhaCelula.id}/membros`, { headers }),
        api.get(`/visitantes/celula/${minhaCelula.id}/ativos`, { headers }),
      ]);

      const membros = (resMembros.data || []).map((m) => ({
        id: m.id,
        nome: m.nome,
        tipo: "MEMBRO",
        uKey: `MEMBRO-${m.id}`,
      }));

      const visitantes = (resVisitantes.data || []).map((v) => ({
        id: v.id,
        nome: v.nome,
        tipo: "VISITANTE",
        uKey: `VISITANTE-${v.id}`,
      }));

      setPessoas(
        [...membros, ...visitantes].sort((a, b) => a.nome.localeCompare(b.nome))
      );
    } catch (err) {
      console.error(err);
      setErro("Não foi possível carregar os dados da célula.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const alternarPresenca = (uKey) => {
    setForm((prev) => {
      const isMarcado = prev.selecionadosKeys.includes(uKey);
      const novasKeys = isMarcado
        ? prev.selecionadosKeys.filter((k) => k !== uKey)
        : [...prev.selecionadosKeys, uKey];

      const novasDecisoes = { ...prev.decisoes };
      if (isMarcado) delete novasDecisoes[uKey];

      return { ...prev, selecionadosKeys: novasKeys, decisoes: novasDecisoes };
    });
  };

  const definirDecisao = (uKey, valor) => {
    setForm((prev) => ({
      ...prev,
      decisoes: { ...prev.decisoes, [uKey]: valor },
    }));
  };

  const membrosPresentes = form.selecionadosKeys.filter((k) =>
    k.startsWith("MEMBRO-")
  ).length;

  const visitantesPresentes = form.selecionadosKeys.filter((k) =>
    k.startsWith("VISITANTE-")
  ).length;

  const total = membrosPresentes + visitantesPresentes;

  const handleSubmit = async () => {
    if (!form.celulaId) return alert("Célula não identificada.");
    if (!form.estudo.trim()) return alert("Informe o estudo ministrado.");
    if (total === 0 && !window.confirm("Nenhuma presença marcada. Continuar?")) return;

    try {
      setEnviando(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();

      const payload = {
        celulaId: Number(form.celulaId),
        dataReuniao: form.dataReuniao,
        estudo: form.estudo.trim(),
        membrosPresentesIds: form.selecionadosKeys
          .filter((k) => k.startsWith("MEMBRO-"))
          .map((k) => Number(k.replace("MEMBRO-", ""))),

        visitantesPresentes: form.selecionadosKeys
          .filter((k) => k.startsWith("VISITANTE-"))
          .map((k) => ({
            id: Number(k.replace("VISITANTE-", "")),
            decisaoEspiritual: form.decisoes[k] || "NENHUMA",
          })),
      };

      console.log("Enviando relatório:", JSON.stringify(payload, null, 2));

      await api.post("/relatorios", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Relatório enviado com sucesso! 🎉");

      setForm((prev) => ({
        ...prev,
        estudo: "",
        selecionadosKeys: [],
        decisoes: {},
      }));
    } catch (err) {
      console.error("Erro ao enviar:", err);
      const mensagem =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.defaultMessage ||
        "Erro ao enviar relatório. Verifique os dados e tente novamente.";
      alert(mensagem);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-indigo-700 font-medium">Carregando sua célula...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-32">
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white pt-12 pb-20 px-6 rounded-b-3xl shadow-2xl">
        <div className="max-w-3xl mx-auto text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {celula?.nome || "Minha Célula"}
          </h1>
          <div className="mt-3 flex items-center justify-center md:justify-start gap-3 text-indigo-100">
            <Users size={18} />
            <span className="font-medium">Líder: {celula?.lider?.nome || "—"}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 space-y-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-600" /> Data
              </label>
              <input
                type="date"
                value={form.dataReuniao}
                onChange={(e) => setForm({ ...form, dataReuniao: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-600" /> Estudo
              </label>
              <input
                placeholder="Tema da ministração"
                value={form.estudo}
                onChange={(e) => setForm({ ...form, estudo: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-slate-100">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Membros</p>
            <p className="text-2xl font-black text-indigo-600">{membrosPresentes}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-slate-100">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Visitas</p>
            <p className="text-2xl font-black text-amber-500">{visitantesPresentes}</p>
          </div>
          <div className="bg-indigo-600 rounded-2xl p-4 text-center shadow-lg">
            <p className="text-xs text-indigo-100 font-bold uppercase tracking-wider">Total</p>
            <p className="text-2xl font-black text-white">{total}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-slate-50 px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <UserCheck size={20} className="text-indigo-600" /> Chamada
            </h2>
          </div>

          <div className="max-h-[50vh] overflow-y-auto divide-y divide-slate-100">
            {pessoas.map((p) => {
              const marcado = form.selecionadosKeys.includes(p.uKey);
              const isVisitante = p.tipo === "VISITANTE";

              return (
                <div key={p.uKey} className={`transition-colors ${marcado ? "bg-indigo-50/40" : ""}`}>
                  <button
                    type="button"
                    onClick={() => alternarPresenca(p.uKey)}
                    className="w-full flex items-center px-6 py-4 text-left"
                  >
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                        marcado ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                      }`}
                    >
                      {marcado && <CheckCircle2 size={18} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${marcado ? "text-indigo-900" : "text-slate-700"}`}>{p.nome}</p>
                      <p
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          isVisitante ? "text-amber-500" : "text-indigo-400"
                        }`}
                      >
                        {p.tipo}
                      </p>
                    </div>
                  </button>

                  {marcado && isVisitante && (
                    <div className="px-6 pb-5 ml-11 animate-in fade-in slide-in-from-top-2">
                      <div className="relative inline-block w-full max-w-xs">
                        <label className="text-[10px] font-bold text-indigo-400 mb-1 block tracking-tighter">
                          DECISÃO ESPIRITUAL
                        </label>
                        <select
                          value={form.decisoes[p.uKey] || "NENHUMA"}
                          onChange={(e) => definirDecisao(p.uKey, e.target.value)}
                          className="w-full appearance-none bg-white border border-indigo-100 text-indigo-700 text-sm py-2 px-3 pr-8 rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none font-medium shadow-sm cursor-pointer"
                        >
                          <option value="NENHUMA">Nenhuma / Só visita</option>
                          <option value="ACEITOU_JESUS">Aceitou Jesus</option>
                          <option value="RECONCILIOU">Reconciliou / Voltou</option>
                          <option value="BATISMO_AGUAS">Deseja Batismo nas águas</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-4 text-indigo-400">
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
        <button
          onClick={handleSubmit}
          disabled={enviando}
          className={`w-full py-5 rounded-2xl font-bold text-lg shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
            enviando ? "bg-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {enviando ? <Loader2 className="animate-spin" /> : <Send size={20} />}
          {enviando ? "Enviando..." : `Enviar Relatório (${total})`}
        </button>
      </div>
    </div>
  );
}
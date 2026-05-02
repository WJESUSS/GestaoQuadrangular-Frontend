import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import {
  Save, User, Calendar,
  Wallet, Trophy, AlertCircle, CheckCircle2
} from "lucide-react";

const SPIN_CSS = `@keyframes tlSpin { to { transform: rotate(360deg); } }`;

export default function TesourariaLancamento() {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  const [form, setForm] = useState({
    membroNome: "",
    valorDizimo: "",
    valorOferta: "",
    tipoOferta: "BRONZE",
    dataLancamento: new Date().toISOString().split("T")[0],
  });

  const limparValor = (str) => {
    if (!str) return 0;
    const limpo = str.toString().replace(",", ".").trim();
    const numero = Number(limpo);
    return isNaN(numero) ? 0 : numero;
  };

  useEffect(() => {
    let isMounted = true;
    const carregarMembros = async () => {
      try {
        setLoading(true);
        const res = await api.get("/tesouraria/select-nome");
        if (isMounted) setMembros(res.data || []);
      } catch (err) {
        if (isMounted) setErro("Erro ao carregar lista de membros.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    carregarMembros();
    return () => { isMounted = false; };
  }, []);

  const handleSalvar = async () => {
    if (loading) return; // Evita cliques duplos que travam o mobile

    setErro(null);
    setSucesso(false);

    if (!form.membroNome) {
      setErro("Selecione um membro para continuar.");
      return;
    }

    const vDizimo = limparValor(form.valorDizimo);
    const vOferta = limparValor(form.valorOferta);

    if (vDizimo <= 0 && vOferta <= 0) {
      setErro("Informe pelo menos um valor.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        membroNome: form.membroNome,
        valorDizimo: vDizimo > 0 ? vDizimo : null,
        valorOferta: vOferta > 0 ? vOferta : null,
        tipoOferta: vOferta > 0 ? form.tipoOferta : null,
        dataLancamento: form.dataLancamento,
      };

      await api.post("/tesouraria/lancar", payload);

      setSucesso(true);

      // Resetar o formulário usando o estado funcional para garantir limpeza
      setForm({
        membroNome: "",
        valorDizimo: "",
        valorOferta: "",
        tipoOferta: "BRONZE",
        dataLancamento: new Date().toISOString().split("T")[0],
      });

      // Feedback visual
      setTimeout(() => setSucesso(false), 4000);
    } catch (err) {
      setErro("Erro ao registrar lançamento no servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="select-none touch-manipulation min-h-screen">
        <style>{SPIN_CSS}</style>

        <div className="max-w-4xl mx-auto p-4 sm:p-10">
          {/* Header */}
          <div className="text-center mb-10">
          <span className="text-indigo-500 font-black uppercase tracking-[0.35em] text-[10px] mb-2 block">
            Registro de Entrada
          </span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none">
              Lançamento<span className="text-indigo-500">.</span>
            </h2>
          </div>

          {/* Card Principal - Otimizado para não travar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl space-y-8">

            {/* Mensagens de Feedback */}
            {erro && (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-red-700 dark:text-red-400 rounded-2xl">
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="text-sm font-bold">{erro}</p>
                </div>
            )}

            {sucesso && (
                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 text-emerald-700 dark:text-emerald-400 rounded-2xl">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <p className="text-sm font-bold">Lançamento realizado!</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {/* Membro */}
              <div className="md:col-span-2 group">
                <label className="flex items-center gap-2 mb-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <User size={13} /> Membro Responsável
                </label>
                <select
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-indigo-500 outline-none dark:text-white text-sm font-medium"
                    value={form.membroNome}
                    disabled={loading}
                    onChange={(e) => setForm(prev => ({ ...prev, membroNome: e.target.value }))}
                >
                  <option value="">Selecione na lista...</option>
                  {membros.map((m, index) => (
                      <option key={index} value={m.nome}>{m.nome}</option>
                  ))}
                </select>
              </div>

              {/* Data */}
              <div>
                <label className="flex items-center gap-2 mb-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <Calendar size={13} /> Data do Evento
                </label>
                <input
                    type="date"
                    disabled={loading}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none dark:text-white text-sm"
                    value={form.dataLancamento}
                    onChange={(e) => setForm(prev => ({ ...prev, dataLancamento: e.target.value }))}
                />
              </div>

              {/* Dízimo */}
              <div>
                <label className="flex items-center gap-2 mb-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <Wallet size={13} /> Valor Dízimo
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                  <input
                      type="text"
                      inputMode="decimal"
                      disabled={loading}
                      className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none dark:text-white text-sm"
                      value={form.valorDizimo}
                      placeholder="0,00"
                      onChange={(e) => setForm(prev => ({ ...prev, valorDizimo: e.target.value }))}
                  />
                </div>
              </div>

              {/* Oferta */}
              <div>
                <label className="flex items-center gap-2 mb-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <Trophy size={13} /> Valor Oferta
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                  <input
                      type="text"
                      inputMode="decimal"
                      disabled={loading}
                      className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none dark:text-white text-sm"
                      value={form.valorOferta}
                      placeholder="0,00"
                      onChange={(e) => setForm(prev => ({ ...prev, valorOferta: e.target.value }))}
                  />
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label className="flex items-center gap-2 mb-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Categoria Especial
                </label>
                <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.2rem] border border-slate-200 dark:border-slate-700">
                  {["BRONZE", "PRATA", "OURO"].map((tipo) => (
                      <button
                          key={tipo}
                          type="button"
                          disabled={loading}
                          onClick={() => setForm(prev => ({ ...prev, tipoOferta: tipo }))}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-200 ${
                              form.tipoOferta === tipo
                                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                                  : "text-slate-400"
                          }`}
                      >
                        {tipo}
                      </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botão Salvar */}
            <button
                onClick={handleSalvar}
                disabled={loading}
                className={`w-full py-5 px-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all ${
                    loading
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white shadow-xl active:scale-95"
                }`}
            >
              {loading ? (
                  <div style={{
                    width: 18, height: 18,
                    border: "2px solid #c7d2fe",
                    borderTop: "2px solid #6366f1",
                    borderRadius: "50%",
                    animation: "tlSpin 0.7s linear infinite",
                  }} />
              ) : (
                  <>
                    <Save size={17} />
                    Confirmar Lançamento
                  </>
              )}
            </button>
          </div>

          <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Todos os dados são criptografados e auditáveis
          </p>
        </div>
      </div>
  );
}
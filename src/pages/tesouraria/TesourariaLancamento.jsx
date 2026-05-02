import React, { useEffect, useState } from "react";
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
        const res = await api.get("/tesouraria/select-nome");
        if (isMounted) setMembros(res.data || []);
      } catch (err) {
        if (isMounted) setErro("Erro ao carregar lista de membros.");
      }
    };
    carregarMembros();
    return () => { isMounted = false; };
  }, []);

  const handleSalvar = async () => {
    if (loading) return; // Proteção contra múltiplos cliques

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

      // SUCESSO: Limpar formulário antes de mudar o estado visual
      setForm({
        membroNome: "",
        valorDizimo: "",
        valorOferta: "",
        tipoOferta: "BRONZE",
        dataLancamento: new Date().toISOString().split("T")[0],
      });

      setSucesso(true);

      // Força o navegador a redesenhar a tela subindo o scroll
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      setErro("Erro ao registrar no servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-10">
        <style>{SPIN_CSS}</style>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
          <span className="text-indigo-500 font-black uppercase tracking-widest text-[10px] mb-2 block">
            Gestão Financeira
          </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Lançamento<span className="text-indigo-500">.</span>
            </h2>
          </div>

          {/* Removido backdrop-blur e simplificado o fundo para evitar lag gráfico */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">

            {erro && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 p-4 text-red-700 rounded-xl">
                  <AlertCircle size={18} />
                  <p className="text-sm font-bold">{erro}</p>
                </div>
            )}

            {sucesso && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 rounded-xl">
                  <CheckCircle2 size={18} />
                  <p className="text-sm font-bold">Lançado com sucesso!</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase mb-2 text-slate-500">Membro</label>
                <select
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                    value={form.membroNome}
                    disabled={loading}
                    onChange={(e) => setForm({ ...form, membroNome: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {membros.map((m, i) => (
                      <option key={i} value={m.nome}>{m.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-2 text-slate-500">Data</label>
                <input
                    type="date"
                    disabled={loading}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                    value={form.dataLancamento}
                    onChange={(e) => setForm({ ...form, dataLancamento: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-2 text-slate-500">Dízimo (R$)</label>
                <input
                    type="text"
                    inputMode="decimal"
                    disabled={loading}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                    value={form.valorDizimo}
                    onChange={(e) => setForm({ ...form, valorDizimo: e.target.value })}
                    placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-2 text-slate-500">Oferta (R$)</label>
                <input
                    type="text"
                    inputMode="decimal"
                    disabled={loading}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                    value={form.valorOferta}
                    onChange={(e) => setForm({ ...form, valorOferta: e.target.value })}
                    placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-2 text-slate-500">Categoria</label>
                <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {["BRONZE", "PRATA", "OURO"].map((t) => (
                      <button
                          key={t}
                          type="button"
                          disabled={loading}
                          onClick={() => setForm({ ...form, tipoOferta: t })}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                              form.tipoOferta === t ? "bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-white" : "text-slate-400"
                          }`}
                      >
                        {t}
                      </button>
                  ))}
                </div>
              </div>
            </div>

            <button
                onClick={handleSalvar}
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all ${
                    loading ? "bg-slate-200 text-slate-400" : "bg-indigo-600 text-white shadow-lg active:scale-95"
                }`}
            >
              {loading ? (
                  <div style={{ width: 20, height: 20, border: "3px solid #c7d2fe", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "tlSpin 0.8s linear infinite" }} />
              ) : (
                  <>
                    <Save size={18} />
                    Confirmar Lançamento
                  </>
              )}
            </button>
          </div>
        </div>
      </div>
  );
}
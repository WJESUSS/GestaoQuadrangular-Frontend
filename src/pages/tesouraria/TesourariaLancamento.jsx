import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import {
  Loader2, Save, User, Calendar,
  Wallet, Trophy, AlertCircle, CheckCircle2
} from "lucide-react";

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
    const carregarMembros = async () => {
      try {
        setLoading(true);
        const res = await api.get("/tesouraria/select-nome");
        setMembros(res.data || []);
      } catch (err) {
        setErro("Erro ao carregar lista de membros.");
      } finally {
        setLoading(false);
      }
    };
    carregarMembros();
  }, []);

  const handleSalvar = async () => {
    setErro(null);
    setSucesso(false);

    if (!form.membroNome) {
      setErro("Selecione um membro para continuar.");
      return;
    }

    const vDizimo = limparValor(form.valorDizimo);
    const vOferta = limparValor(form.valorOferta);

    if (vDizimo <= 0 && vOferta <= 0) {
      setErro("Informe pelo menos um valor de Dízimo ou Oferta.");
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

      setForm({
        membroNome: "",
        valorDizimo: "",
        valorOferta: "",
        tipoOferta: "BRONZE",
        dataLancamento: new Date().toISOString().split("T")[0],
      });

      setTimeout(() => setSucesso(false), 4000);
    } catch (err) {
      setErro("Erro ao registrar lançamento no servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="max-w-4xl mx-auto p-4 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header */}
        <div className="text-center mb-10">
        <span className="text-indigo-500 font-black uppercase tracking-[0.35em] text-[10px] mb-2 block">
          Registro de Entrada
        </span>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none">
            Lançamento<span className="text-indigo-500">.</span>
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-8">

          {/* Feedback */}
          {erro && (
              <div className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-red-700 dark:text-red-400 rounded-2xl animate-in zoom-in duration-300">
                <AlertCircle size={18} className="shrink-0" />
                <p className="text-sm font-bold">{erro}</p>
              </div>
          )}

          {sucesso && (
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 text-emerald-700 dark:text-emerald-400 rounded-2xl animate-in zoom-in duration-300">
                <CheckCircle2 size={18} className="shrink-0" />
                <p className="text-sm font-bold">Lançamento registrado com sucesso!</p>
              </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

            {/* Seleção de Membro */}
            <div className="md:col-span-2 group">
              <label className="flex items-center gap-2 mb-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <User size={13} /> Membro Responsável
              </label>
              <select
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all appearance-none dark:text-white text-sm font-medium cursor-pointer"
                  value={form.membroNome}
                  onChange={(e) => setForm({ ...form, membroNome: e.target.value })}
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
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white text-sm"
                  value={form.dataLancamento}
                  onChange={(e) => setForm({ ...form, dataLancamento: e.target.value })}
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
                    className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder:text-slate-300 text-sm"
                    value={form.valorDizimo}
                    onChange={(e) => setForm({ ...form, valorDizimo: e.target.value })}
                    placeholder="0,00"
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
                    className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder:text-slate-300 text-sm"
                    value={form.valorOferta}
                    onChange={(e) => setForm({ ...form, valorOferta: e.target.value })}
                    placeholder="0,00"
                />
              </div>
            </div>

            {/* Tipo de Oferta */}
            <div>
              <label className="flex items-center gap-2 mb-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Categoria Especial
              </label>
              <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.2rem] border border-slate-200 dark:border-slate-700">
                {["BRONZE", "PRATA", "OURO"].map((tipo) => (
                    <button
                        key={tipo}
                        type="button"
                        onClick={() => setForm({ ...form, tipoOferta: tipo })}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-200 ${
                            form.tipoOferta === tipo
                                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
              className={`group w-full relative overflow-hidden py-5 px-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all duration-300 ${
                  loading
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:scale-[0.98]"
              }`}
          >
            {loading ? (
                <Loader2 className="animate-spin" size={18} />
            ) : (
                <>
                  <Save size={17} className="group-hover:rotate-12 transition-transform duration-300" />
                  Confirmar Lançamento
                </>
            )}
            {!loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}
          </button>
        </div>

        <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Todos os dados são criptografados e auditáveis
        </p>
      </div>
  );
}
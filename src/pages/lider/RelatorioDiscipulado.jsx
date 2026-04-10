import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import { Check, Calendar, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

function obterSemanaAtual() {
  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0 = domingo
  const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;

  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() + diffSegunda);

  const domingo = new Date(segunda);
  domingo.setDate(segunda.getDate() + 6);

  const formatar = (data) => data.toISOString().split("T")[0];

  return {
    inicio: formatar(segunda),
    fim: formatar(domingo),
  };
}

export default function RelatorioDiscipulado() {
  const [celula, setCelula] = useState(null);
  const [membros, setMembros] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  /* ===============================
     INICIALIZAR PRESENÇAS
  ================================ */
  const inicializarPresencas = useCallback((lista) => {
    setPresencas(
      lista.map((m) => ({
        membroId: m.id,
        nomeMembro: m.nome,
        escolaBiblica: false,
        cultoSemana: false,
        domingoManha: false,
        domingoNoite: false,
      }))
    );
  }, []);

  /* ===============================
     CARREGAR CÉLULA E MEMBROS
  ================================ */
  const carregarCelula = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      if (!token) throw new Error("Token ausente");

      const headers = { Authorization: `Bearer ${token}` };

      const res = await api.get("/celulas/minha-celula", { headers });
      const celulaData = res.data;

      // DEBUG: Verifica se o ID está vindo do backend
      console.log("Dados da Célula recebidos:", celulaData);

      if (!celulaData) {
        setErro("Você não possui uma célula vinculada.");
        setCelula(null);
        setMembros([]);
        setPresencas([]);
        return;
      }

      setCelula(celulaData);
      setMembros(celulaData.membros || []);
      inicializarPresencas(celulaData.membros || []);

    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar a célula.");
    } finally {
      setLoading(false);
    }
  }, [inicializarPresencas]);

  /* ===============================
     AUTO SETAR SEMANA ATUAL
  ================================ */
  useEffect(() => {
    const { inicio, fim } = obterSemanaAtual();
    setInicio(inicio);
    setFim(fim);
  }, []);

  useEffect(() => {
    carregarCelula();
  }, [carregarCelula]);

  /* ===============================
     ALTERAR PRESENÇA
  ================================ */
  const alterarPresenca = (index, campo) => {
    setPresencas(prev => {
      const novo = [...prev];
      novo[index] = { ...novo[index], [campo]: !novo[index][campo] };
      return novo;
    });
  };

  /* ===============================
     ENVIAR RELATÓRIO
  ================================ */
  const enviarRelatorio = async () => {
    if (!inicio || !fim) {
      setErro("Selecione o período do relatório.");
      return;
    }

    if (!presencas.length) {
      setErro("Não há membros para enviar relatório.");
      return;
    }

    // VERIFICAÇÃO DE SEGURANÇA
    if (!celula || !celula.id) {
      setErro("Erro: ID da célula não identificado. Recarregue a página.");
      console.error("Tentativa de envio sem Celula ID", celula);
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();

      // CORREÇÃO AQUI: Incluindo celulaId no payload
      const payload = presencas.map(({ nomeMembro, ...rest }) => ({
        ...rest,
        membroId: Number(rest.membroId),
        celulaId: Number(celula.id) // Garante que o ID da célula vai junto
      }));

      console.log("Payload enviado:", payload); // Para depuração

      await api.post(
        `/discipulado/relatorio-semanal?inicio=${inicio}&fim=${fim}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSucesso("Relatório enviado com sucesso!");
      setTimeout(() => setSucesso(""), 5000);

    } catch (error) {
      console.error(error);
      setErro("Erro ao enviar relatório. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     RENDER
  ================================ */
  if (loading && !celula) return (
    <div className="flex justify-center items-center h-screen text-indigo-600">
      <Loader2 className="animate-spin w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                <Calendar className="text-indigo-600" />
                Relatório de Discipulado
              </h1>
              {celula && (
                <p className="text-sm text-slate-500 mt-1 ml-9">
                  Célula: <span className="font-bold text-slate-700">{celula.nome}</span> (ID: {celula.id})
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border">
              <input
                type="date"
                value={inicio}
                onChange={e => setInicio(e.target.value)}
                className="bg-transparent font-semibold text-sm outline-none"
              />
              <span className="text-slate-400 font-bold">—</span>
              <input
                type="date"
                value={fim}
                onChange={e => setFim(e.target.value)}
                className="bg-transparent font-semibold text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {erro && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl font-semibold animate-pulse">
            <AlertCircle />
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl font-semibold">
            <CheckCircle2 />
            {sucesso}
          </div>
        )}

        {!celula ? (
          <div className="bg-white p-10 rounded-2xl text-center shadow-sm">
            <p className="text-gray-500 font-medium">Nenhuma célula encontrada ou carregando...</p>
          </div>
        ) : membros.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center shadow-sm">
             <p className="text-gray-500 font-medium">Nenhum membro cadastrado nesta célula.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Membro</th>
                  {["EBD", "Culto", "Manhã", "Noite"].map(col => (
                    <th key={col} className="px-6 py-4 text-center font-bold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {membros.map((m, i) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-700">{m.nome}</td>
                    {["escolaBiblica", "cultoSemana", "domingoManha", "domingoNoite"].map(campo => (
                      <td key={campo} className="px-6 py-4 text-center">
                        <button
                          onClick={() => alterarPresenca(i, campo)}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                            presencas[i]?.[campo]
                              ? "bg-emerald-500 text-white shadow-md scale-105"
                              : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          <Check strokeWidth={3} />
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={enviarRelatorio}
          disabled={loading || membros.length === 0 || !celula?.id}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-extrabold tracking-wide shadow-lg transition flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : "ENVIAR RELATÓRIO"}
        </button>

      </div>
    </div>
  );
}
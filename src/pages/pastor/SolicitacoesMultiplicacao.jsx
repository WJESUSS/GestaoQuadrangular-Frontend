import React, { useEffect, useState } from "react";
import api from "../../api/api";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Loader2,
  GitFork
} from "lucide-react";

export default function SolicitacoesMultiplicacao() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const fetchSolicitacoes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // LOG DE DEBUG: Abra o console do navegador (F12) para ver isso
      console.log("Buscando solicitações...");

      const res = await api.get("/celulas/solicitacoes-multiplicacao", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Dados recebidos do Backend:", res.data);

      // Garante que é um array antes de setar
      setSolicitacoes(Array.isArray(res.data) ? res.data : []);

    } catch (err) {
      console.error("Erro ao carregar solicitações:", err);
    } finally {
      setLoading(false);
    }
  };

  const decidirMultiplicacao = async (id, aprovado) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/celulas/${id}/decidir-multiplicacao`,
        { aprovado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(aprovado ? "Multiplicação Aprovada com Sucesso!" : "Solicitação Recusada/Arquivada.");
      fetchSolicitacoes();
    } catch (err) {
      console.error("Erro na decisão:", err);
      alert("Erro ao processar decisão. Verifique se você tem permissão de PASTOR ou ADMIN.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-indigo-600">
        <Loader2 className="animate-spin w-10 h-10 mb-2" />
        <p className="font-medium">Verificando solicitações...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
          <GitFork className="text-amber-500" size={32} />
          Solicitações de Multiplicação
        </h1>
        <p className="text-slate-500 mt-2">
          Gerencie os pedidos de abertura de novas células
        </p>
      </header>

      {solicitacoes.length === 0 ? (
        <div className="bg-slate-50 rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
          <CheckCircle className="mx-auto mb-4 text-slate-300" size={64} />
          <h3 className="text-xl font-bold text-slate-600">Tudo limpo por aqui!</h3>
          <p className="text-slate-500 mt-2">Nenhuma solicitação de multiplicação pendente.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {solicitacoes.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              {/* Indicador Lateral */}
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-amber-400"></div>

              <div className="flex justify-between items-start pl-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                      Em Análise
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {s.nome}
                  </h3>
                  <p className="text-slate-500 font-medium flex items-center gap-2">
                    Líder Atual: <span className="text-indigo-600 font-bold">{s.liderNome || "Não informado"}</span>
                  </p>
                </div>

                <div className="bg-indigo-50 px-4 py-3 rounded-2xl text-center min-w-[90px]">
                  <span className="block text-2xl font-black text-indigo-600">{s.qtdMembros || 0}</span>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Membros</span>
                </div>
              </div>

              {s.motivoSolicitacao && (
                <div className="ml-4 mt-5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-600 text-sm italic flex gap-3 items-start">
                  <MessageSquare size={18} className="shrink-0 text-slate-400 mt-1" />
                  "{s.motivoSolicitacao}"
                </div>
              )}

              <div className="mt-8 flex gap-3 pl-4">
                <button
                  onClick={() => decidirMultiplicacao(s.id, true)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-200"
                >
                  <CheckCircle size={20} /> Aprovar
                </button>
                <button
                  onClick={() => decidirMultiplicacao(s.id, false)}
                  className="px-6 bg-white border-2 border-slate-100 hover:bg-red-50 hover:border-red-100 hover:text-red-600 text-slate-400 py-3.5 rounded-xl font-bold transition flex items-center gap-2"
                >
                  <XCircle size={20} /> Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
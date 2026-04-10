import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import HistoricoRelatorios from "./HistoricoRelatorios";
import TelaRelatorio from "./TelaRelatorio";
import TelaVisitantes from "./TelaVisitantes";
import TelaFichas from "./TelaFichas";
import RelatorioDiscipulado from "./RelatorioDiscipulado";
import { Trash2, AlertCircle, Loader2, Users, Plus, Search, X } from "lucide-react";

export default function DashboardLider() {
  const [abaAtiva, setAbaAtiva] = useState("home");
  const [celula, setCelula] = useState(null);
  const [membros, setMembros] = useState([]);
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalAddMembro, setShowModalAddMembro] = useState(false);
  const [showModalMultiplicacao, setShowModalMultiplicacao] = useState(false);
  const [motivoMultiplicacao, setMotivoMultiplicacao] = useState("");
  const [solicitandoMulti, setSolicitandoMulti] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const resCelula = await api.get("/celulas/minha-celula");
      const celulaData = resCelula.data;
      setCelula(celulaData);

      if (celulaData?.id) {
        const [resM, resV] = await Promise.all([
          api.get(`/celulas/${celulaData.id}/membros`),
          api.get(`/celulas/${celulaData.id}/visitantes`)
        ]);

        const unique = (arr) =>
          arr.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));

        setMembros(unique(resM.data || []));
        setVisitantes(unique((resV.data || []).filter(v => v.ativo && !v.convertido)));
      }
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const removerMembro = async (membroId, nome) => {
    if (!celula?.id) return;
    if (!window.confirm(`Tem certeza que deseja remover ${nome} da célula?`)) return;

    try {
      const token = localStorage.getItem("token")?.replace(/["']/g, "").trim();
      await api.delete(`/celulas/${celula.id}/membros/${membroId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      carregarDados();
      alert(`${nome} foi removido da célula com sucesso!`);
    } catch (err) {
      console.error("Erro ao remover membro:", err);
      alert(err.response?.data?.message || "Não foi possível remover o membro.");
    }
  };

  const solicitarMultiplicacao = async () => {
    if (!motivoMultiplicacao.trim()) {
      alert("O motivo da solicitação é obrigatório.");
      return;
    }

    setSolicitandoMulti(true);
    try {
      await api.post(`/celulas/${celula.id}/solicitar-multiplicacao`, {
        motivo: motivoMultiplicacao.trim()
      });

      alert("Solicitação enviada com sucesso! O pastor e/ou secretário serão notificados.");
      setShowModalMultiplicacao(false);
      setMotivoMultiplicacao("");
      carregarDados();
    } catch (err) {
      console.error("Erro ao solicitar multiplicação:", err);
      alert(err.response?.data?.message || "Erro ao enviar solicitação.");
    } finally {
      setSolicitandoMulti(false);
    }
  };

  const qtdMembros = celula?.quantidadeMembrosAtivos || membros.length;
  const statusMulti = celula?.statusMultiplicacao || "NORMAL";
  const podeSolicitar = qtdMembros >= 8 && ["NORMAL", "SOLICITADO", "REJEITADO"].includes(statusMulti);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600 font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Célula {celula?.nome || "—"}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Anfitrião: <span className="font-medium text-slate-900">{celula?.anfitriao || "Não definido"}</span>
              </p>
            </div>

            {abaAtiva !== "home" && (
              <button
                onClick={() => setAbaAtiva("home")}
                className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                ← Voltar ao Dashboard
              </button>
            )}
          </div>
        </header>

        {/* Alerta de Multiplicação */}
        {qtdMembros >= 8 && (
          <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-emerald-900 mb-1">
                  Parabéns! Sua célula está pronta para crescer
                </h3>
                <p className="text-sm text-emerald-700 mb-3">
                  Com <strong>{qtdMembros} membros ativos</strong>, chegou o momento ideal para planejar a multiplicação.
                </p>
                <div className="text-xs text-emerald-600">
                  {statusMulti === "EM_ANALISE" ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      Sua solicitação está sendo analisada
                    </span>
                  ) : podeSolicitar ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      Pronto para solicitar multiplicação
                    </span>
                  ) : statusMulti === "APROVADO" ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Multiplicação aprovada
                    </span>
                  ) : (
                    "Aguarde o crescimento da célula"
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Home */}
        <main className={`transition-all duration-300 ${abaAtiva !== "home" ? "hidden" : "block"}`}>
          {/* Menu Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MenuCard
              icon="📊"
              title="Relatório Semanal"
              desc="Presença e estudo"
              color="blue"
              onClick={() => setAbaAtiva("relatorio")}
            />
            <MenuCard
              icon="🛡️"
              title="Discipulado"
              desc="EBD e cultos"
              color="indigo"
              onClick={() => setAbaAtiva("discipulado")}
            />
            <MenuCard
              icon="👥"
              title="Visitantes"
              desc="Cadastro"
              color="emerald"
              onClick={() => setAbaAtiva("visitantes")}
            />
            <MenuCard
              icon="📝"
              title="Fichas"
              desc="Encaminhamentos"
              color="violet"
              onClick={() => setAbaAtiva("fichas")}
            />
          </div>

          {/* Conteúdo Principal */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Lista de Membros */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Membros da Célula</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{membros.length} membros ativos</p>
                  </div>
                  <button
                    onClick={() => setShowModalAddMembro(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {membros.map((m) => (
                    <div
                      key={m.id}
                      className="group bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {m.nome?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 truncate">{m.nome}</p>
                            <p className="text-xs text-slate-500">{m.cargo || "Membro"}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removerMembro(m.id, m.nome)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Remover membro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card de Multiplicação */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-blue-300 font-medium uppercase tracking-wide">Visão 2026</p>
                  <h3 className="text-2xl font-bold mt-2">
                    Multiplicar<br />
                    Célula Mãe
                  </h3>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-300">Progresso</span>
                    <span className="font-semibold">65%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                {podeSolicitar && (
                  <button
                    onClick={() => setShowModalMultiplicacao(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    Solicitar Multiplicação
                  </button>
                )}

                {!podeSolicitar && statusMulti === "EM_ANALISE" && (
                  <div className="text-center p-4 border border-blue-500/30 rounded-lg bg-blue-500/10">
                    <p className="text-blue-200 text-sm font-medium">Solicitação em Análise</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Histórico */}
          <div className="mt-8">
            <HistoricoRelatorios celulaId={celula?.id} />
          </div>
        </main>

        {/* Outras Telas */}
        <div className={`transition-all duration-300 ${abaAtiva === "home" ? "hidden" : "block"}`}>
          {abaAtiva === "relatorio" && <TelaRelatorio celula={celula} />}
          {abaAtiva === "discipulado" && <RelatorioDiscipulado membros={membros} />}
          {abaAtiva === "visitantes" && <TelaVisitantes celulaId={celula?.id} />}
          {abaAtiva === "fichas" && <TelaFichas celula={celula} />}
        </div>
      </div>

      {/* Modal Adicionar Membro */}
      {showModalAddMembro && (
        <ModalBuscarMembro
          celulaId={celula?.id}
          onClose={() => {
            setShowModalAddMembro(false);
            carregarDados();
          }}
        />
      )}

      {/* Modal Multiplicação */}
      {showModalMultiplicacao && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Solicitar Multiplicação</h2>
                <button
                  onClick={() => setShowModalMultiplicacao(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Motivo da Solicitação
                </label>
                <textarea
                  value={motivoMultiplicacao}
                  onChange={(e) => setMotivoMultiplicacao(e.target.value)}
                  placeholder="Descreva o motivo da solicitação de multiplicação..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModalMultiplicacao(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={solicitarMultiplicacao}
                  disabled={solicitandoMulti || !motivoMultiplicacao.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  {solicitandoMulti ? "Enviando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuCard({ icon, title, desc, color, onClick }) {
  const colors = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    indigo: "from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
    emerald: "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
    violet: "from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700"
  };

  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-xl bg-gradient-to-br ${colors[color]} text-white text-left shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm opacity-90">{desc}</p>
    </button>
  );
}

function ModalBuscarMembro({ celulaId, onClose }) {
  const [busca, setBusca] = useState("");
  const [membrosSemCelula, setMembrosSemCelula] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const res = await api.get("/membros/sem-celula");
        setMembrosSemCelula(res.data || []);
      } catch (err) {
        console.error("Erro ao buscar membros sem célula:", err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const vincular = async (membroId) => {
    try {
      const token = localStorage.getItem("token")?.replace(/["']/g, "").trim();
      await api.post(`/celulas/${celulaId}/membros/${membroId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onClose();
      alert("Membro vinculado com sucesso!");
    } catch (err) {
      console.error("Erro ao vincular:", err);
      alert(err.response?.data?.message || "Erro ao vincular membro.");
    }
  };

  const filtrados = membrosSemCelula.filter(m =>
    m.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Vincular Membro</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Buscar membro..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filtrados.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">Nenhum membro encontrado</p>
              </div>
            ) : (
              filtrados.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {m.nome?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">{m.nome}</p>
                      <p className="text-xs text-slate-500">{m.cargo || "Membro"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => vincular(m.id)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                  >
                    Vincular
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
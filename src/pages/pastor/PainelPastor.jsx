import { useEffect, useState } from "react";
import {
  LogOut,
  Users,
  GitBranch,
  Layers,
  Calendar,
  AlertTriangle,
  MessageCircle,
  CheckCircle,
  Activity,
  Gift,
  Send,
  Phone,
} from "lucide-react";
import api from "../../api/api";

// Configurações do Pastor
const NOME_PASTOR = "Pastor Renato e jaci Soares";
const NUMERO_PASTOR = "71982343937";

export default function PainelPastor() {
  const [mes, setMes] = useState("2026-02");
  const [alertas, setAlertas] = useState([]);
  const [metricas, setMetricas] = useState({
    celulasAtivas: 0,
    totalMembros: 0,
    multiplicacoesMes: 0,
  });
  const [aniversariantes, setAniversariantes] = useState([]);
  const [enviados, setEnviados] = useState(new Set()); // IDs dos que já foram enviados
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [mes]);

  useEffect(() => {
    carregarAniversariantes();
  }, []);

  async function carregarDados() {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const [resMetricas, resAlertas] = await Promise.all([
        api.get("/api/pastor/metricas", {
          params: { mes },
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/discipulado/alertas", {
          params: { mes },
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setMetricas(resMetricas.data || metricas);
      setAlertas(resAlertas.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarAniversariantes() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:8080/api/api/aniversariantes/hoje", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      console.log("Aniversariantes:", data);
      setAniversariantes(data || []);
    } catch (err) {
      console.error("Erro aniversariantes:", err);
    }
  }

  function sair() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  function enviarWhatsApp(membro) {
    const url = `https://wa.me/55${membro.telefone}?text=${encodeURIComponent(
      `Olá ${membro.nome}, Paz seja contigo Minha ovelhinha!\nPercebemos sua ausência nos últimos cultos. Deus te abençoe!\nVocê é muito especial`
    )}`;
    window.open(url, "_blank");

    // Marca como enviado
    setEnviados((prev) => new Set([...prev, membro.id]));
  }

  async function marcarComoAcompanhado(id) {
    const token = localStorage.getItem("token");
    try {
      await api.post(
        "/discipulado/acompanhamento",
        { membroId: id, mesReferencia: mes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlertas((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      alert("Erro ao registrar acompanhamento");
    }
  }

  const enviarParabensTodos = () => {
    if (aniversariantes.length === 0) {
      alert("Nenhum aniversariante para enviar hoje.");
      return;
    }

    alert(
      `Abrindo ${aniversariantes.length} conversas no WhatsApp.\n` +
      `Aguarde alguns segundos entre cada abertura.\n` +
      `Permita pop-ups se solicitado.`
    );

    aniversariantes.forEach((pessoa, index) => {
      setTimeout(() => {
        window.open(pessoa.linkWhatsApp, "_blank", "noopener,noreferrer");
        setEnviados((prev) => new Set([...prev, pessoa.id]));
      }, index * 1800); // 1,8 segundos de intervalo
    });
  };

  // Formatação do telefone: 71 98234-3937
  const telefoneFormatado = NUMERO_PASTOR.replace(/(\d{2})(\d{5})(\d{4})/, "$1 $2-$3");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <p className="text-indigo-600 text-xl font-semibold animate-pulse">
          Carregando indicadores...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard Pastoral
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Acompanhamento em tempo real das células e vidas
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
              <input
                type="month"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full sm:w-auto"
              />
            </div>
            <button
              onClick={sair}
              className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <LogOut size={18} /> Sair
            </button>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card titulo="Células Ativas" valor={metricas.celulasAtivas || 0} icon={Activity} cor="from-blue-600 to-blue-800" />
          <Card titulo="Membros Totais" valor={metricas.totalMembros || 0} icon={Users} cor="from-emerald-500 to-emerald-700" />
          <Card titulo="Multiplicações" valor={metricas.multiplicacoesMes || 0} icon={GitBranch} cor="from-purple-500 to-purple-700" />
        </div>

        {/* ANIVERSARIANTES HOJE */}
        <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 rounded-3xl shadow-xl p-6 border border-pink-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-100 rounded-xl">
                <Gift className="text-pink-600" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-pink-800">Aniversariantes Hoje 🎉</h2>
                <p className="text-pink-700 font-medium flex items-center gap-2 mt-1">
                  <Phone size={18} />
                  Envie usando o WhatsApp do {NOME_PASTOR}:
                  <strong className="text-pink-900">{telefoneFormatado}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Botão "Testar meu WhatsApp" foi removido conforme pedido */}
              {aniversariantes.length > 0 && (
                <button
                  onClick={enviarParabensTodos}
                  className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-md"
                  title="Abre uma conversa por vez com intervalo"
                >
                  <Send size={18} /> Enviar para todos ({aniversariantes.length})
                </button>
              )}
            </div>
          </div>

          {aniversariantes.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-lg font-medium">
              Nenhum aniversariante hoje. Que o Senhor continue abençoando a todos! 🙏
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {aniversariantes.map((p) => {
                const jaEnviado = enviados.has(p.id);
                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-2xl p-5 shadow-md border ${
                      jaEnviado ? "border-green-300 bg-green-50/30" : "border-pink-100"
                    } hover:border-pink-300 hover:shadow-lg transition-all`}
                  >
                    <p
                      className={`font-bold text-lg ${
                        jaEnviado
                          ? "text-green-800 line-through opacity-80"
                          : "text-slate-800"
                      }`}
                    >
                      {p.nome}
                    </p>
                    <p className="text-slate-600 mt-1">
                      {p.telefone.replace(/(\d{2})(\d{5})(\d{4})/, "$1 $2-$3")}
                    </p>
                    <a
                      href={p.linkWhatsApp}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setEnviados((prev) => new Set([...prev, p.id]))}
                      className={`mt-4 inline-flex items-center gap-2 font-medium transition-colors ${
                        jaEnviado ? "text-green-600 hover:text-green-800" : "text-pink-600 hover:text-pink-800"
                      }`}
                    >
                      <Send size={18} /> {jaEnviado ? "Enviado ✓" : "Enviar parabéns"}
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SEÇÃO DE ALERTAS */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Alertas de Discipulado</h2>
            </div>
            <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold">
              {alertas.length} pendências
            </span>
          </div>

          {alertas.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-400 text-lg">
                Nenhum alerta crítico para o mês selecionado. 🙌
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alertas.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-slate-100 rounded-2xl p-5 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{m.nome}</p>
                    <p className="text-slate-500 flex items-center gap-1 mt-1">
                      <Layers size={14} /> {m.nomeCelula}
                    </p>
                    <p className="text-rose-600 font-bold mt-2 inline-flex items-center gap-1">
                      <CircleDot size={14} /> {m.totalFaltas} faltas registradas
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => enviarWhatsApp(m)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all"
                    >
                      <MessageCircle size={18} /> WhatsApp
                    </button>
                    <button
                      onClick={() => marcarComoAcompanhado(m.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all"
                    >
                      <CheckCircle size={18} /> Concluído
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ titulo, valor, icon: Icon, cor }) {
  return (
    <div className="relative bg-white rounded-3xl p-6 shadow-lg border border-slate-50 overflow-hidden group hover:shadow-xl transition-shadow">
      <div
        className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${cor} opacity-10 rounded-full group-hover:scale-125 transition-transform duration-500`}
      />
      <div className="relative z-10 flex items-center gap-5">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${cor} text-white shadow-md`}>
          <Icon size={32} />
        </div>
        <div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{titulo}</p>
          <p className="text-4xl font-black text-slate-900 leading-none mt-1">{valor}</p>
        </div>
      </div>
    </div>
  );
}

function CircleDot({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
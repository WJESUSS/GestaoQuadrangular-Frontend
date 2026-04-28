import { useEffect, useState } from "react";
import {
  LogOut,
  Users,
  GitBranch,
  Calendar,
  AlertTriangle,
  MessageCircle,
  CheckCircle,
  Activity,
  Gift,
  Send,
} from "lucide-react";
import api from "../../services/api.js";

export default function PainelPastor() {
  const [mes, setMes] = useState("2026-02");
  const [alertas, setAlertas] = useState([]);
  const [metricas, setMetricas] = useState({
    celulasAtivas: 0,
    totalMembros: 0,
    multiplicacoesMes: 0,
  });
  const [aniversariantes, setAniversariantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [mes]);

  useEffect(() => {
    carregarAniversariantes();
  }, []);

  async function carregarDados() {
    setLoading(true);
    try {
      const [resMetricas, resAlertas] = await Promise.all([
        api.get("/api/pastor/metricas", { params: { mes } }),
        api.get("/discipulado/alertas", { params: { mes } }),
      ]);

      setMetricas(resMetricas.data || {});
      setAlertas(resAlertas.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarAniversariantes() {
    try {
      const res = await api.get("/api/aniversariantes/hoje");
      setAniversariantes(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  function sair() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  function enviarWhatsApp(membro) {
    const url = `https://wa.me/55${membro.telefone}`;
    window.open(url, "_blank");
  }

  async function marcarComoAcompanhado(id) {
    await api.post("/discipulado/acompanhamento", {
      membroId: id,
      mesReferencia: mes,
    });

    setAlertas((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) {
    return (
        <div className="h-screen flex items-center justify-center">
          <p className="text-xl animate-pulse">Carregando...</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 p-6 space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-600">
            Dashboard Pastoral
          </h1>

          <div className="flex items-center gap-4">
            <Calendar className="text-indigo-500" />
            <input
                type="month"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="border p-2 rounded"
            />

            <button
                onClick={sair}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              <LogOut size={18} /> Sair
            </button>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card titulo="Células Ativas" valor={metricas.celulasAtivas} icon={Activity} />
          <Card titulo="Membros" valor={metricas.totalMembros} icon={Users} />
          <Card titulo="Multiplicações" valor={metricas.multiplicacoesMes} icon={GitBranch} />
        </div>

        {/* ANIVERSARIANTES */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Gift /> Aniversariantes Hoje
          </h2>

          <button className="mb-4 bg-pink-500 text-white px-4 py-2 rounded flex items-center gap-2">
            <Send size={16} /> Enviar todos
          </button>

          <div className="space-y-3">
            {aniversariantes.map((p) => (
                <div
                    key={p.id}
                    className="flex justify-between items-center border p-3 rounded-lg"
                >
                  <span>{p.nome}</span>

                  <button
                      onClick={() => enviarWhatsApp(p)}
                      className="flex items-center gap-2 text-green-600 hover:underline"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                </div>
            ))}
          </div>
        </div>

        {/* ALERTAS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle /> Alertas
          </h2>

          <div className="space-y-3">
            {alertas.map((m) => (
                <div
                    key={m.id}
                    className="flex justify-between items-center border p-3 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{m.nome}</p>
                    <p className="text-sm text-red-500">
                      {m.totalFaltas} faltas
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                        onClick={() => enviarWhatsApp(m)}
                        className="text-green-600"
                    >
                      <MessageCircle />
                    </button>

                    <button
                        onClick={() => marcarComoAcompanhado(m.id)}
                        className="text-blue-600"
                    >
                      <CheckCircle />
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}

// ✅ CARD PROFISSIONAL
function Card({ titulo, valor, icon: Icon }) {
  return (
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4">
        <div className="bg-indigo-100 p-3 rounded-full">
          <Icon className="text-indigo-600" size={26} />
        </div>

        <div>
          <p className="text-gray-500 text-sm">{titulo}</p>
          <h2 className="text-2xl font-bold">{valor}</h2>
        </div>
      </div>
  );
}
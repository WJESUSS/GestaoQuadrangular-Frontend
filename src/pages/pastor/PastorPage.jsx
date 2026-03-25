import { useEffect, useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import api from "../../api/api";

// Páginas
import PainelPastor from "./PainelPastor";
import RelatorioCelula from "./RelatorioCelula";
import SecretariaDiscipulado from "./SecretariaDiscipulado";
import SolicitacoesMultiplicacao from "./SolicitacoesMultiplicacao";
import RankingCelulas from "./RankingCelulas";
import PainelAlertas from "./PainelAlertas"; // ✅ NOVO

// Ícones
import {
  LayoutDashboard,
  FileText,
  Users,
  Share2,
  Circle,
  AlertTriangle, // ✅ NOVO
} from "lucide-react";

export default function PastorPage() {
  const [celulas, setCelulas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca as células
  const carregarDadosGerais = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.get("/celulas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCelulas(res.data);
    } catch (err) {
      console.error("Erro ao carregar resumo de células:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosGerais();
  }, []);

  // Total de células ativas
  const totalAtivas = celulas.filter((c) => c.ativa === true).length;

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* MENU LATERAL */}
      <aside className="w-64 bg-blue-900 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-2">Painel do Pastor</h2>

        {/* STATUS */}
        <div className="mb-6 p-3 bg-blue-800 rounded-lg border border-blue-700">
          <p className="text-xs text-blue-300 uppercase font-bold tracking-wider">
            Status Real
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold">
              {loading ? "..." : `${totalAtivas} Células Ativas`}
            </span>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex flex-col gap-2 flex-1">

          <NavLink
            to="/pastor"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded ${
                isActive ? "bg-blue-600 shadow-inner" : "hover:bg-blue-800"
              }`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/pastor/relatorio-celulas"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded ${
                isActive ? "bg-blue-600 shadow-inner" : "hover:bg-blue-800"
              }`
            }
          >
            <FileText size={18} />
            Relatório de Células
          </NavLink>

          <NavLink
            to="/pastor/discipulado"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded ${
                isActive ? "bg-blue-600 shadow-inner" : "hover:bg-blue-800"
              }`
            }
          >
            <Users size={18} />
            Secretaria de Discipulado
          </NavLink>

          <NavLink
            to="/pastor/multiplicacoes"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded ${
                isActive ? "bg-blue-600 shadow-inner" : "hover:bg-blue-800"
              }`
            }
          >
            <Share2 size={18} />
            Solicitações de Multiplicação
          </NavLink>

          <NavLink
            to="/pastor/ranking-celulas"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded ${
                isActive ? "bg-blue-600 shadow-inner" : "hover:bg-blue-800"
              }`
            }
          >
            <Circle size={18} />
            Ranking de Células
          </NavLink>

          {/* ✅ ALERTAS */}
          <NavLink
            to="/pastor/alertas"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded ${
                isActive ? "bg-red-600 shadow-inner" : "hover:bg-red-800"
              }`
            }
          >
            <AlertTriangle size={18} />
            Painel de Alertas
          </NavLink>

        </nav>

        <div className="mt-auto pt-4 border-t border-blue-800 text-xs text-blue-400 text-center">
          Sistema de Gestão v1.0
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-6 overflow-y-auto">

        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Visão Geral
          </h1>

          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-sm text-gray-600">
            Total de registros: <strong>{celulas.length}</strong>
          </div>
        </div>

        {/* ROTAS */}
        <Routes>
          <Route index element={<PainelPastor />} />
          <Route path="relatorio-celulas" element={<RelatorioCelula />} />
          <Route path="discipulado" element={<SecretariaDiscipulado />} />
          <Route path="multiplicacoes" element={<SolicitacoesMultiplicacao />} />
          <Route path="ranking-celulas" element={<RankingCelulas />} />
          <Route path="alertas" element={<PainelAlertas />} /> {/* ✅ */}
        </Routes>

      </main>
    </div>
  );
}

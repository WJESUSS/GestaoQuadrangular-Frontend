import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart2, DollarSign, FileText, Users,
  TrendingUp, ArrowLeft, LogOut
} from "lucide-react";

// Imports das sub-páginas
import TesourariaDashboard from "./TesourariaDashboard.jsx";
import TesourariaLancamento from "./TesourariaLancamento.jsx";
import TesourariaRelatorio from "./TesourariaRelatorio.jsx";
import TesourariaDizimistas from "./TesourariaDizimistas.jsx";
import TesourariaComparativo from "./TesourariaComparativo.jsx";

export default function TesourariaPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/tesouraria" || location.pathname === "/tesouraria/";

  // Função de Logout
  const handleLogout = () => {
    localStorage.removeItem("user"); // Limpa os dados do usuário
    localStorage.removeItem("token"); // Se você salvar o token separadamente
    navigate("/login"); // Volta para a tela de login
  };

  const cards = [
    { titulo: "Dashboard", descricao: "Visão geral", icone: <BarChart2 />, cor: "indigo", rota: "dashboard" },
    { titulo: "Lançamento", descricao: "Dízimos/Ofertas", icone: <DollarSign />, cor: "emerald", rota: "lancamento" },
    { titulo: "Relatório", descricao: "Exportar PDF", icone: <FileText />, cor: "amber", rota: "relatorio" },
    { titulo: "Dizimistas", descricao: "Contribuições", icone: <Users />, cor: "green", rota: "dizimistas" },
    { titulo: "Comparativo", descricao: "Evolução Anual", icone: <TrendingUp />, cor: "purple", rota: "comparativo" },
  ];

  const cores = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-400",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-400",
    amber: "bg-amber-50 text-amber-600 border-amber-400",
    green: "bg-green-50 text-green-600 border-green-400",
    purple: "bg-purple-50 text-purple-600 border-purple-400",
  };

  return (
    <div className="min-h-screen p-6 md:p-12 bg-slate-50 font-sans">

      {/* Cabeçalho com Título e Botão Sair */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {!isHome && (
            <button
              onClick={() => navigate("/tesouraria")}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-600" />
            </button>
          )}
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter italic">
            TESOURARIA <span className="text-indigo-600 font-light">IEQ</span>
          </h1>
        </div>

        {/* Botão de Sair Estilizado */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
        >
          <LogOut size={18} />
          <span className="hidden md:inline">Sair do Sistema</span>
        </button>
      </div>

      {isHome ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <button
              key={card.titulo}
              onClick={() => navigate(card.rota)}
              className={`p-6 rounded-[2rem] border-t-8 shadow-xl flex flex-col justify-between transition-all hover:-translate-y-2 active:scale-95 text-left h-44 ${cores[card.cor]}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black italic uppercase tracking-tighter">{card.titulo}</div>
                <div className="p-3 rounded-2xl bg-white shadow-sm">{card.icone}</div>
              </div>
              <p className="text-sm font-medium opacity-60 uppercase tracking-widest">{card.descricao}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-4 md:p-8 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Routes>
            <Route path="dashboard" element={<TesourariaDashboard />} />
            <Route path="lancamento" element={<TesourariaLancamento />} />
            <Route path="relatorio" element={<TesourariaRelatorio />} />
            <Route path="dizimistas" element={<TesourariaDizimistas />} />
            <Route path="comparativo" element={<TesourariaComparativo />} />
          </Routes>
        </div>
      )}
    </div>
  );
}
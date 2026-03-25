import { useNavigate } from "react-router-dom";
import { Wallet, BarChart3, FileText, Users, TrendingUp } from "lucide-react";

export default function MenuTesouraria() {
  const navigate = useNavigate();

  const cards = [
    { id: "lancamento", label: "Lançamento", icon: <Wallet size={32} />, page: "/tesouraria/lancamento", color: "indigo" },
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={32} />, page: "/tesouraria/dashboard", color: "emerald" },
    { id: "relatorio", label: "Relatório", icon: <FileText size={32} />, page: "/tesouraria/relatorio", color: "yellow" },
    { id: "dizimistas", label: "Dízimistas", icon: <Users size={32} />, page: "/tesouraria/dizimistas", color: "red" },
    { id: "comparativo", label: "Comparativo", icon: <TrendingUp size={32} />, page: "/tesouraria/comparativo", color: "purple" },
  ];

  const cardColors = {
    indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-500",
    emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-500",
    yellow: "bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-500",
    red: "bg-red-50 text-red-600 hover:bg-red-100 border-red-500",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-500",
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-black text-slate-900 mb-10 text-center">
        Menu Tesouraria
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => navigate(card.page)}
            className={`group relative p-6 rounded-[2rem] border-b-4 shadow-sm flex flex-col justify-between h-40 transition-all duration-300 ${cardColors[card.color]}`}
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">{card.label}</p>
              <p className="text-2xl font-black text-slate-800">Clique para entrar</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom"; // Importar para navegação
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";
import { ArrowRight, Wallet, Award, TrendingUp } from "lucide-react";

export default function TesourariaDashboard() {
  const navigate = useNavigate();
  const [resumo, setResumo] = useState({
    DIZIMO: 0,
    BRONZE: 0,
    PRATA: 0,
    OURO: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        const res = await api.get("/tesouraria/listar");
        const resumoCalc = { DIZIMO: 0, BRONZE: 0, PRATA: 0, OURO: 0 };

        res.data.forEach((r) => {
          resumoCalc.DIZIMO += r.valorDizimo || 0;
          if (r.tipoOferta === "BRONZE") resumoCalc.BRONZE += r.valorOferta || 0;
          if (r.tipoOferta === "PRATA") resumoCalc.PRATA += r.valorOferta || 0;
          if (r.tipoOferta === "OURO") resumoCalc.OURO += r.valorOferta || 0;
        });
        setResumo(resumoCalc);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    carregarResumo();
  }, []);

  if (loading)
    return <div className="p-20 text-center animate-pulse font-bold text-slate-400">Carregando dados...</div>;

  const dadosGrafico = [
    { tipo: "Dízimo", valor: resumo.DIZIMO, cor: "#4f46e5" },
    { tipo: "Bronze", valor: resumo.BRONZE, cor: "#d97706" },
    { tipo: "Prata", valor: resumo.PRATA, cor: "#64748b" },
    { tipo: "Ouro", valor: resumo.OURO, cor: "#eab308" },
  ];

  // Função para navegar e opcionalmente passar o filtro via State
  const navegarParaFiltro = (categoria) => {
    // Redireciona para a sua página de relatório/listagem
    // Você pode tratar esse estado lá para já abrir filtrado
    navigate("/tesouraria/relatorio", { state: { filtroInicial: categoria } });
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">DASHBOARD</h2>
        <p className="text-slate-500">Clique nos cards para ver detalhes de cada categoria</p>
      </div>

      {/* Grid de Cards Interativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <CardInterativo
          titulo="Dízimos"
          valor={resumo.DIZIMO}
          cor="indigo"
          icon={<Wallet />}
          onClick={() => navegarParaFiltro("TODOS")}
        />
        <CardInterativo
          titulo="Ouro"
          valor={resumo.OURO}
          cor="yellow"
          icon={<Award />}
          onClick={() => navegarParaFiltro("OURO")}
        />
        <CardInterativo
          titulo="Prata"
          valor={resumo.PRATA}
          cor="slate"
          icon={<Award />}
          onClick={() => navegarParaFiltro("PRATA")}
        />
        <CardInterativo
          titulo="Bronze"
          valor={resumo.BRONZE}
          cor="orange"
          icon={<Award />}
          onClick={() => navegarParaFiltro("BRONZE")}
        />
      </div>

      {/* Seção do Gráfico */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold text-xl">
          <TrendingUp className="text-indigo-600" />
          <h3>Análise Comparativa</h3>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGrafico}>
              <XAxis dataKey="tipo" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} dy={10} />
              <YAxis hide />
              <Tooltip
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Total']}
              />
              <Bar dataKey="valor" radius={[10, 10, 0, 0]} barSize={60}>
                {dadosGrafico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Subcomponente de Card com Efeito de Clique
function CardInterativo({ titulo, valor, cor, icon, onClick }) {
  const styles = {
    indigo: "border-indigo-500 text-indigo-600 bg-indigo-50/30 hover:bg-indigo-50",
    yellow: "border-yellow-500 text-yellow-600 bg-yellow-50/30 hover:bg-yellow-50",
    slate: "border-slate-500 text-slate-600 bg-slate-50/30 hover:bg-slate-50",
    orange: "border-orange-500 text-orange-600 bg-orange-50/30 hover:bg-orange-50",
  };

  return (
    <button
      onClick={onClick}
      className={`group relative p-6 rounded-[2rem] border-b-4 shadow-sm transition-all duration-300 text-left flex flex-col justify-between h-40 ${styles[cor]}`}
    >
      <div className="flex justify-between items-start">
        <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <ArrowRight className="opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">{titulo}</p>
        <p className="text-2xl font-black text-slate-800">
          R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </button>
  );
}
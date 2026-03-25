import { useEffect, useState } from "react";
import api from "../../api/api";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileDown, Filter, Calendar, Trophy, Medal, Award, Users, Loader2 } from "lucide-react";

export default function TesourariaRelatorio() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [categoriaAtiva, setCategoriaAtiva] = useState("TODOS");

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const carregarRelatorio = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tesouraria/relatorio-tesouraria", {
        params: { mes, ano },
      });

      const data = res.data || {};
      setRegistros(data.registros || []);
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRelatorio();
  }, []); // Carrega ao montar

  // Filtra registros pela categoria
  const registrosFiltrados = registros.filter(r => {
    if (categoriaAtiva === "TODOS") return true;
    return r.tipoOferta?.toUpperCase() === categoriaAtiva;
  });

  // Calcula valores reais para os cards
  const totalDizimo = registrosFiltrados.reduce((acc, r) => acc + (r.valorDizimo ?? 0), 0);
  const totalOferta = registrosFiltrados.reduce((acc, r) => acc + (r.valorOferta ?? 0), 0);
  const totalPeriodo = totalDizimo + totalOferta;

  const exportarPDF = () => {
    const doc = new jsPDF();
    const tituloRelatorio = categoriaAtiva === "TODOS" ? "Geral" : `Categoria ${categoriaAtiva}`;

    doc.setFontSize(18);
    doc.text(`Relatório de Tesouraria - ${tituloRelatorio}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Período: ${meses[mes - 1]} / ${ano}`, 14, 28);

    const tableColumn = ["Membro", "Categoria", "Dízimo (R$)", "Oferta (R$)", "Data"];
    const tableRows = registrosFiltrados.map(r => [
      r.membroNome,
      r.tipoOferta || "Padrão",
      (r.valorDizimo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      (r.valorOferta ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      r.dataLancamento ? new Date(r.dataLancamento).toLocaleDateString('pt-BR') : "-"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      headStyles: { fillColor: [31, 41, 55] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Acumulado na Categoria: R$ ${totalPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, finalY);

    doc.save(`Relatorio_${categoriaAtiva}_${meses[mes-1]}.pdf`);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-slate-50 min-h-screen font-sans">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">RELATÓRIO</h2>
          <p className="text-slate-500 font-medium">Gestão financeira por categoria de oferta</p>
        </div>

        <button
          onClick={exportarPDF}
          disabled={loading || registrosFiltrados.length === 0}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-6 py-3 rounded-2xl transition-all shadow-xl active:scale-95"
        >
          <FileDown size={22} />
          <span className="font-bold uppercase tracking-wider text-sm">Baixar PDF</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-8 flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200">
            <Calendar size={18} className="text-slate-500" />
            <select
              className="bg-transparent outline-none font-bold text-slate-700 cursor-pointer"
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
            >
              {meses.map((nome, idx) => (
                <option key={idx} value={idx + 1}>{nome}</option>
              ))}
            </select>
          </div>
          <input
            type="number"
            className="border bg-slate-100 px-4 py-2 rounded-2xl outline-none w-24 font-bold text-slate-700 border-slate-200"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
          />
          <button
            onClick={carregarRelatorio}
            disabled={loading}
            className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Filter size={20} />}
          </button>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto w-full md:w-auto">
          <TabBtn label="Todos" active={categoriaAtiva === "TODOS"} onClick={() => setCategoriaAtiva("TODOS")} />
          <TabBtn label="Ouro" active={categoriaAtiva === "OURO"} color="text-yellow-600" onClick={() => setCategoriaAtiva("OURO")} />
          <TabBtn label="Prata" active={categoriaAtiva === "PRATA"} color="text-slate-500" onClick={() => setCategoriaAtiva("PRATA")} />
          <TabBtn label="Bronze" active={categoriaAtiva === "BRONZE"} color="text-orange-600" onClick={() => setCategoriaAtiva("BRONZE")} />
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CardStatus title="Dízimos" valor={totalDizimo} color="indigo" icon={<Users className="opacity-40" />} />
        <CardStatus title="Ofertas" valor={totalOferta} color="emerald" icon={<Trophy className="opacity-40" />} />
        <CardStatus title="Total Período" valor={totalPeriodo} color="slate" icon={<Award className="opacity-40" />} />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 font-bold text-slate-400 uppercase text-xs tracking-widest">Membro</th>
                <th className="p-6 font-bold text-slate-400 uppercase text-xs tracking-widest">Nível</th>
                <th className="p-6 font-bold text-slate-400 uppercase text-xs tracking-widest">Dízimo</th>
                <th className="p-6 font-bold text-slate-400 uppercase text-xs tracking-widest">Oferta</th>
                <th className="p-6 font-bold text-slate-400 uppercase text-xs tracking-widest text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-400 animate-pulse font-medium">Buscando dados no servidor...</td></tr>
              ) : registrosFiltrados.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-medium">Nenhum registro encontrado para este período.</td></tr>
              ) : (
                registrosFiltrados.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6 font-bold text-slate-700">{r.membroNome}</td>
                    <td className="p-6"><Badge tipo={r.tipoOferta} /></td>
                    <td className="p-6 text-emerald-600 font-black">
                      R$ {(r.valorDizimo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-6 text-indigo-600 font-black">
                      R$ {(r.valorOferta ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-6 text-slate-400 text-sm font-medium text-right">
                      {r.dataLancamento ? new Date(r.dataLancamento).toLocaleDateString('pt-BR') : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Subcomponentes
function CardStatus({ title, valor, color, icon }) {
  const themes = {
    indigo: "border-indigo-500 text-indigo-600",
    emerald: "border-emerald-500 text-emerald-600",
    slate: "border-slate-800 text-slate-800",
  };

  const numeroValido = Number(valor ?? 0);

  return (
    <div className={`bg-white p-8 rounded-[2rem] shadow-sm border-t-4 ${themes[color]} flex justify-between items-center relative overflow-hidden`}>
       <div className="z-10">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-900">
          {numeroValido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </h3>
      </div>
      <div className="absolute -right-2 -bottom-2 scale-[2.5]">{icon}</div>
    </div>
  );
}

function Badge({ tipo }) {
  const styles = {
    OURO: "bg-yellow-50 text-yellow-700 border-yellow-200",
    PRATA: "bg-slate-50 text-slate-600 border-slate-200",
    BRONZE: "bg-orange-50 text-orange-700 border-orange-200",
  };
  const current = tipo?.toUpperCase() || "PADRÃO";
  return (
    <span className={`px-4 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter ${styles[current] || "bg-gray-50 text-gray-400"}`}>
      {current}
    </span>
  );
}

function TabBtn({ label, active, onClick, color = "text-slate-700" }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
        active ? `bg-white shadow-sm ${color}` : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {label}
    </button>
  );
}

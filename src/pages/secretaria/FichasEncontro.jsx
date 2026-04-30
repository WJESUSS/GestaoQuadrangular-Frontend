import { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileText,
  Download,
  Calendar,
  Search,
  Filter,
  User,
  Phone,
  ShieldAlert,
  ChevronRight,
  Loader2
} from "lucide-react";

export default function FichasEncontro() {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  });
  const [dataFim, setDataFim] = useState(new Date().toISOString().split("T")[0]);

  const carregarFichas = useCallback(async () => {
    try {
      setLoading(true);
      if (dataInicio && dataFim && dataFim < dataInicio) {
        alert("A data fim não pode ser menor que a data início");
        return;
      }
      const params = { inicio: dataInicio, fim: dataFim };
      const res = await api.get("/relatorios/encontro/periodo", { params });
      setFichas(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar fichas", err);
      setFichas([]);
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    carregarFichas();
  }, [carregarFichas]);

  // --- Lógica de PDF mantida (mas você pode estilizar mais se desejar) ---
  const gerarPDFCompleto = () => {
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("RELATÓRIO DE ENCONTRISTAS", 14, 18);
    // ... restante da sua lógica de jsPDF ...
    doc.save(`Relatorio_Encontristas.pdf`);
  };

  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return "?";
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  };

  return (
      <div className="p-6 space-y-8 animate-in fade-in duration-700">

        {/* HEADER DO MÓDULO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg text-white">
                <FileText size={24} />
              </div>
              Gestão de Encontristas
            </h3>
            <p className="text-slate-500 text-sm mt-1">Gerencie e exporte dados dos participantes de encontros.</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
                onClick={gerarPDFCompleto}
                disabled={fichas.length === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            >
              <Download size={18} /> Relatório
            </button>
            <button
                onClick={() => {/* Lógica para fichas individuais */}}
                disabled={fichas.length === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              <FileText size={18} /> Imprimir Fichas
            </button>
          </div>
        </div>

        {/* ÁREA DE FILTROS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Data Início</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Data Fim</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>
          </div>

          <button
              onClick={carregarFichas}
              className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all"
          >
            Filtrar Dados
          </button>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="animate-spin text-emerald-500" size={40} />
              <p className="text-slate-500 font-medium animate-pulse">Buscando encontristas...</p>
            </div>
        ) : fichas.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] py-20 text-center">
              <ShieldAlert className="mx-auto text-slate-300 mb-4" size={48} />
              <h4 className="text-slate-800 dark:text-slate-200 font-bold text-xl">Nenhum registro encontrado</h4>
              <p className="text-slate-500 max-w-xs mx-auto text-sm">Tente ajustar o período das datas para encontrar o que procura.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {fichas.map((f) => (
                  <div
                      key={f.id}
                      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-emerald-500/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
                        {(f.nomeConvidado || f.nome || "?")[0]}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Idade</span>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                    {calcularIdade(f.dataNascimento)} anos
                  </span>
                      </div>
                    </div>

                    <div className="space-y-1 mb-4">
                      <h4 className="font-bold text-slate-800 dark:text-white truncate uppercase tracking-tight">
                        {f.nomeConvidado || f.nome}
                      </h4>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                        <Phone size={12} /> {f.telefone || "Não informado"}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Líder Resp.</p>
                        <p className="text-xs font-bold text-emerald-600 truncate max-w-[120px]">
                          {f.liderResponsavel || f.nomeLiderCelula || "Pendente"}
                        </p>
                      </div>
                      <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* BADGE DE CONTAGEM FLUTUANTE */}
        <div className="fixed bottom-8 right-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 dark:border-slate-200 z-50">
          <Users size={18} />
          <span className="font-black text-sm">{fichas.length} Participantes</span>
        </div>
      </div>
  );
}

// Sub-componente para os ícones
function Users({ size }) {
  return <User size={size} />;
}
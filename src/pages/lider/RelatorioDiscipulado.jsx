import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../services/api.js";
import { Loader2, CheckCircle2, Calendar, UserCheck } from "lucide-react";

function obterSemanaAtual() {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() + diffSegunda);
  const domingo = new Date(segunda);
  domingo.setDate(segunda.getDate() + 6);
  const formatarLocal = (data) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };
  return { inicio: formatarLocal(segunda), fim: formatarLocal(domingo) };
}

const COLUNAS = [
  { campo: "escolaBiblica", label: "EBD", emoji: "📖" },
  { campo: "quartaNoite", label: "4ª Noite", emoji: "🌙" },
  { campo: "quintaNoite", label: "5ª Noite", emoji: "⭐" },
  { campo: "domingoManha", label: "Dom. Manhã", emoji: "☀️" },
  { campo: "domingoNoite", label: "Dom. Noite", emoji: "🌟" },
];

export default function RelatorioDiscipulado() {
  const [celula, setCelula] = useState(null);
  const [membros, setMembros] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const inicializarPresencas = useCallback((lista) => {
    return lista.map((m) => ({
      membroId: m.id,
      nomeMembro: m.nome,
      escolaBiblica: false, quartaNoite: false, quintaNoite: false, domingoManha: false, domingoNoite: false,
    }));
  }, []);

  const carregarDados = useCallback(async () => {
    setLoading(true); setErro("");
    try {
      const res = await api.get("/celulas/minha-celula");
      if (!res.data) { setErro("Célula não vinculada."); return; }
      setCelula(res.data);
      const lista = res.data.membros || [];
      setMembros(lista);
      setPresencas(inicializarPresencas(lista));
    } catch { setErro("Erro ao carregar dados."); }
    finally { setLoading(false); }
  }, [inicializarPresencas]);

  useEffect(() => {
    const period = obterSemanaAtual();
    setInicio(period.inicio); setFim(period.fim);
    carregarDados();
  }, [carregarDados]);

  const alterarPresenca = (index, campo) => {
    setPresencas((prev) => {
      const novo = [...prev];
      if (novo[index]) novo[index] = { ...novo[index], [campo]: !novo[index][campo] };
      return novo;
    });
  };

  const totalPresencasMembro = (index) => {
    const p = presencas[index];
    return p ? COLUNAS.filter((c) => p[c.campo]).length : 0;
  };

  const stats = useMemo(() => {
    const totalGeral = presencas.reduce((acc, _, i) => acc + totalPresencasMembro(i), 0);
    const totalPossivel = presencas.length * COLUNAS.length;
    const porcentagem = totalPossivel > 0 ? Math.round((totalGeral / totalPossivel) * 100) : 0;
    return { totalGeral, porcentagem };
  }, [presencas]);

  const enviarRelatorio = async () => {
    setErro(""); setSucesso("");
    if (!inicio || !fim || !celula?.id || presencas.length === 0) return setErro("Verifique os dados.");
    setEnviando(true);
    try {
      const payload = presencas.map(({ nomeMembro, membroId, ...rest }) => ({ membroId: Number(membroId), ...rest }));
      await api.post(`/discipulado/relatorio-semanal?inicio=${inicio}&fim=${fim}`, payload);
      setSucesso("Relatório enviado com sucesso! 🎉");
      setTimeout(() => setSucesso(""), 4000);
    } catch (e) { setErro(e?.response?.data?.message || "Erro no envio."); }
    finally { setEnviando(false); }
  };

  if (loading) return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium animate-pulse">Carregando membros...</p>
      </div>
  );

  return (
      <div className="max-w-4xl mx-auto space-y-6 pb-10">

        {/* Header do Relatório */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm transition-colors">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <UserCheck className="text-indigo-600" /> Relatório de Discipulado
              </h2>
              <p className="text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider mt-1">
                GESTÃO • {celula?.nome || "Célula"}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border dark:border-slate-800">
              <Calendar size={18} className="text-slate-400 ml-2" />
              <input type="date" className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-200 outline-none" value={inicio} onChange={(e) => setInicio(e.target.value)} />
              <span className="text-slate-300 dark:text-slate-600">—</span>
              <input type="date" className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-200 outline-none" value={fim} onChange={(e) => setFim(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Membros" value={membros.length} />
          <StatCard label="Presenças Totais" value={stats.totalGeral} />
          <StatCard
              label="Frequência"
              value={`${stats.porcentagem}%`}
              color={stats.porcentagem > 60 ? "text-emerald-500" : "text-amber-500"}
          />
        </div>

        {/* Mensagens de Feedback */}
        {erro && <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-center font-bold text-sm">{erro}</div>}
        {sucesso && <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl text-center font-bold text-sm">{sucesso}</div>}

        {/* Lista de Membros */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm transition-colors">
          {membros.map((m, i) => (
              <div key={m.id} className="p-6 border-b border-slate-50 dark:border-slate-800 last:border-0">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black">
                      {m.nome.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{m.nome}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">ID #{m.id}</p>
                    </div>
                  </div>
                  <div className="text-xs font-black px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
                    {totalPresencasMembro(i)} / {COLUNAS.length}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {COLUNAS.map(({ campo, label, emoji }) => (
                      <button
                          key={campo}
                          onClick={() => alterarPresenca(i, campo)}
                          className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
                              presencas[i]?.[campo]
                                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                  : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 grayscale opacity-70"
                          }`}
                      >
                        <span className="text-xl mb-1">{presencas[i]?.[campo] ? "✅" : emoji}</span>
                        <span className={`text-[10px] font-black uppercase ${presencas[i]?.[campo] ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>
                    {label}
                  </span>
                      </button>
                  ))}
                </div>
              </div>
          ))}
        </div>

        {/* Botão de Ação */}
        <button
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={enviarRelatorio}
            disabled={enviando || loading || membros.length === 0}
        >
          {enviando ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={22} />}
          {enviando ? "Processando..." : "Finalizar Relatório da Semana"}
        </button>
      </div>
  );
}

// Componente Interno de Card de Status
function StatCard({ label, value, color = "text-indigo-600 dark:text-indigo-400" }) {
  return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm transition-colors text-center">
        <span className={`block text-3xl font-black mb-1 ${color}`}>{value}</span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{label}</span>
      </div>
  );
}
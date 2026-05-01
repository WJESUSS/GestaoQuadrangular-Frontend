import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cake,
  Send,
  CheckCircle2,
  ArrowLeft,
  Users,
  Search,
  MessageCircle,
  Sparkles,
  Gift,
  ChevronRight
} from "lucide-react";

// Variantes de animação premium
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function AniversariantesPremium() {
  const [lista, setLista] = useState([]);
  const [enviados, setEnviados] = useState(new Set());
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = `aniversariantes_enviados_${new Date().toISOString().slice(0, 10)}`;

  const obterLinkPersonalizado = (membro) => {
    const saudacao = `A paz seja contigo, minha ovelhinha! 🐑✨\n\nFeliz aniversário! Que Deus abençoe grandemente sua vida, trazendo saúde e paz. 🎂🙌\n\nSão os votos do *Pastor Renato e Jaci Soares*. 🎈`;
    let numeroLimpo = membro.telefone.replace(/\D/g, "");
    const telefoneFinal = numeroLimpo.startsWith("55") ? numeroLimpo : `55${numeroLimpo}`;
    return `https://wa.me/${telefoneFinal}?text=${encodeURIComponent(saudacao)}`;
  };

  useEffect(() => {
    const enviadosSalvos = localStorage.getItem(STORAGE_KEY);
    if (enviadosSalvos) setEnviados(new Set(JSON.parse(enviadosSalvos)));

    api.get("/aniversariantes/hoje")
        .then((res) => setLista(res.data || []))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...enviados]));
  }, [enviados]);

  const marcarComoEnviado = (id) => setEnviados((prev) => new Set(prev).add(id));

  const filtrados = lista.filter(m => m.nome?.toLowerCase().includes(busca.toLowerCase()));
  const progresso = lista.length > 0 ? (enviados.size / lista.length) * 100 : 0;

  return (
      <div className="min-h-screen bg-[#FDFCFD] text-slate-900 pb-24 font-sans selection:bg-pink-100">
        {/* Background Decorativo - Premium Touch */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-pink-100/50 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-lg mx-auto px-5 pt-8">
          {/* Header Mobile Premium */}
          <header className="flex items-center justify-between mb-8">
            <button
                onClick={() => window.history.back()}
                className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-600 active:scale-90 transition-transform"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">Igreja Unção e Poder</span>
              <h1 className="text-xl font-black text-slate-800">Celebrações</h1>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
              <Sparkles size={20} className="text-amber-400" />
            </div>
          </header>

          {/* Card de Destaque - Hero Section */}
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 mb-8"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={18} className="text-pink-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aniversariantes de Hoje</span>
              </div>
              <h2 className="text-5xl font-black mb-6 italic">{lista.length}</h2>

              {/* Barra de Progresso Customizada */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Progresso de envios</span>
                  <span>{Math.round(progresso)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progresso}%` }}
                      className="h-full bg-gradient-to-r from-pink-500 to-indigo-500"
                  />
                </div>
              </div>
            </div>
            {/* Círculos decorativos no card */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
          </motion.div>

          {/* Busca Reestilizada */}
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
                type="text"
                placeholder="Procurar por nome..."
                className="w-full pl-14 pr-6 py-5 bg-white border-none rounded-[2rem] shadow-xl shadow-slate-100/50 outline-none focus:ring-2 focus:ring-pink-200 transition-all text-slate-700 font-medium"
                onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* Lista de Membros - Scroll suave */}
          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
          >
            <AnimatePresence>
              {filtrados.map((m) => {
                const jaEnviado = enviados.has(m.id);
                return (
                    <motion.div
                        key={m.id}
                        variants={itemVariants}
                        layout
                        className={`relative group p-4 rounded-[2rem] border transition-all flex items-center gap-4 ${
                            jaEnviado
                                ? "bg-slate-50/50 border-slate-100 opacity-70"
                                : "bg-white border-white shadow-lg shadow-slate-100/50"
                        }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-colors ${
                          jaEnviado ? "bg-slate-200 text-slate-500" : "bg-gradient-to-br from-pink-50 to-indigo-50 text-indigo-600"
                      }`}>
                        {m.nome?.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-800 truncate">{m.nome}</h4>
                        <p className="text-xs font-bold text-slate-400">{m.telefone}</p>
                      </div>

                      <button
                          onClick={() => {
                            window.open(obterLinkPersonalizado(m), "_blank");
                            marcarComoEnviado(m.id);
                          }}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
                              jaEnviado
                                  ? "bg-emerald-50 text-emerald-500"
                                  : "bg-slate-900 text-white shadow-lg shadow-slate-200"
                          }`}
                      >
                        {jaEnviado ? <CheckCircle2 size={20} /> : <MessageCircle size={20} />}
                      </button>
                    </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Botão Flutuante "Enviar Todos" (Somente se houver pendentes) */}
        {!loading && progresso < 100 && (
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xs px-5"
            >
              <button
                  onClick={() => {
                    const pendentes = lista.filter((item) => !enviados.has(item.id));
                    pendentes.forEach(p => window.open(obterLinkPersonalizado(p), "_blank"));
                    setEnviados(new Set(lista.map(l => l.id)));
                  }}
                  className="w-full py-5 bg-pink-500 text-white rounded-[2rem] font-black shadow-2xl shadow-pink-300 flex items-center justify-center gap-3 hover:bg-pink-600 transition-colors"
              >
                <Send size={20} />
                ENVIAR PARA TODOS
              </button>
            </motion.div>
        )}
      </div>
  );
}
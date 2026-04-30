import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cake,
  Send,
  CheckCircle2,
  ExternalLink,
  LogOut,
  ArrowLeft,
  Users,
  Search,
  MessageCircle
} from "lucide-react";

// Variantes de animação idênticas ao seu Dashboard
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export default function Aniversariantes() {
  const [lista, setLista] = useState([]);
  const [enviados, setEnviados] = useState(new Set());
  const [busca, setBusca] = useState("");

  const STORAGE_KEY = `aniversariantes_enviados_${new Date().toISOString().slice(0, 10)}`;

  useEffect(() => {
    const enviadosSalvos = localStorage.getItem(STORAGE_KEY);
    if (enviadosSalvos) {
      setEnviados(new Set(JSON.parse(enviadosSalvos)));
    }

    api.get("/aniversariantes/hoje")
        .then((res) => {
          setLista(res.data || []);
        })
        .catch((err) => console.error("Erro aniversariantes:", err));
  }, []);

  useEffect(() => {
    if (enviados.size > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...enviados]));
    }
  }, [enviados]);

  const marcarComoEnviado = (id) => {
    setEnviados((prev) => {
      const novo = new Set(prev);
      novo.add(id);
      return novo;
    });
  };

  const enviarTodos = () => {
    const pendentes = lista.filter((item) => !enviados.has(item.id));
    if (pendentes.length === 0) return alert("Nenhum pendente!");

    alert(`Abrindo ${pendentes.length} janelas do WhatsApp...`);
    pendentes.forEach((item) => {
      window.open(item.linkWhatsApp, "_blank", "noopener,noreferrer");
      marcarComoEnviado(item.id);
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const filtrados = lista.filter(m => m.nome?.toLowerCase().includes(busca.toLowerCase()));
  const todosEnviados = lista.length > 0 && lista.every((item) => enviados.has(item.id));

  return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

          {/* Header Estilizado - Padronizado com seu Dashboard */}
          <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200 text-white">
                <Cake size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800">Aniversariantes</h1>
                <p className="text-slate-500 font-medium">Celebre a vida dos membros hoje</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                <ArrowLeft size={18} /> Voltar
              </button>
              <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl shadow-sm text-sm font-bold hover:bg-red-600 hover:text-white transition-all"
              >
                <LogOut size={18} /> Sair
              </button>
            </div>
          </motion.header>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

            {/* Card Principal de Ação */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase mb-6">
                    ✨ Atenção Especial
                  </div>
                  <h2 className="text-4xl font-black mb-2">{lista.length} Pessoas hoje</h2>
                  <p className="text-indigo-100 text-sm max-w-sm mb-6">
                    {todosEnviados
                        ? "Incrível! Você já parabenizou todos os aniversariantes do dia."
                        : "Não deixe passar em branco. Envie uma mensagem de carinho para cada um."}
                  </p>
                  {!todosEnviados && lista.length > 0 && (
                      <button
                          onClick={enviarTodos}
                          className="flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform"
                      >
                        <Send size={20} /> ENVIAR PARA TODOS PENDENTES
                      </button>
                  )}
                </div>
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              </div>

              {/* Card de Status */}
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${todosEnviados ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800">{enviados.size} / {lista.length}</h3>
                <p className="text-slate-500 text-sm font-medium">Mensagens enviadas</p>
              </div>
            </div>

            {/* Lista de Aniversariantes */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Users className="text-indigo-500" /> Lista do Dia
                  </h3>
                </div>

                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                      type="text"
                      placeholder="Buscar nome..."
                      className="pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 transition-all"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtrados.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400 font-medium italic">
                      Nenhum aniversariante encontrado.
                    </div>
                ) : (
                    filtrados.map((m) => {
                      const jaEnviado = enviados.has(m.id);
                      return (
                          <motion.div
                              key={m.id}
                              variants={itemVariants}
                              className={`flex flex-col p-5 rounded-3xl border transition-all ${
                                  jaEnviado
                                      ? "bg-emerald-50/50 border-emerald-100 opacity-75"
                                      : "bg-slate-50/50 border-transparent hover:bg-white hover:border-pink-200 hover:shadow-lg"
                              }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                                  jaEnviado ? "bg-emerald-200 text-emerald-700" : "bg-pink-100 text-pink-600"
                              }`}>
                                {m.nome?.charAt(0).toUpperCase()}
                              </div>
                              {jaEnviado && (
                                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
                            <CheckCircle2 size={12} /> Enviado
                          </span>
                              )}
                            </div>

                            <div className="mb-6">
                              <h4 className={`font-bold text-slate-800 ${jaEnviado ? 'line-through opacity-50' : ''}`}>
                                {m.nome}
                              </h4>
                              <p className="text-slate-500 text-xs font-medium">{m.telefone}</p>
                            </div>

                            <a
                                href={m.linkWhatsApp}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => marcarComoEnviado(m.id)}
                                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all ${
                                    jaEnviado
                                        ? "bg-white text-slate-400 border border-slate-200"
                                        : "bg-emerald-500 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600"
                                }`}
                            >
                              <MessageCircle size={18} />
                              {jaEnviado ? "Enviar Novamente" : "Enviar Parabéns"}
                              <ExternalLink size={14} className="ml-auto opacity-50" />
                            </a>
                          </motion.div>
                      );
                    })
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
  );
}
import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { motion } from "framer-motion";
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

  // --- FUNÇÃO DE GERAÇÃO DE LINK REVISADA ---
  const obterLinkPersonalizado = (membro) => {
    const saudacao = `A paz seja contigo, minha ovelhinha! 🐑✨\n\nFeliz aniversário! Que Deus abençoe grandemente sua vida, trazendo saúde e paz. 🎂🙌\n\nSão os votos do *Pastor Renato e Jaci Soares*. 🎈`;

    // Remove tudo que não for número
    let numeroLimpo = membro.telefone.replace(/\D/g, "");

    // Se o número já começar com 55, não adicionamos de novo para não duplicar
    const telefoneFinal = numeroLimpo.startsWith("55") ? numeroLimpo : `55${numeroLimpo}`;

    return `https://wa.me/${telefoneFinal}?text=${encodeURIComponent(saudacao)}`;
  };

  useEffect(() => {
    const enviadosSalvos = localStorage.getItem(STORAGE_KEY);
    if (enviadosSalvos) {
      setEnviados(new Set(JSON.parse(enviadosSalvos)));
    }

    api.get("/aniversariantes/hoje")
        .then((res) => {
          // Garantimos que estamos pegando a lista do backend
          setLista(res.data || []);
        })
        .catch((err) => console.error("Erro ao buscar aniversariantes:", err));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...enviados]));
  }, [enviados]);

  const marcarComoEnviado = (id) => {
    setEnviados((prev) => new Set(prev).add(id));
  };

  const enviarTodos = () => {
    const pendentes = lista.filter((item) => !enviados.has(item.id));
    if (pendentes.length === 0) return alert("Nenhum pendente!");

    pendentes.forEach((item) => {
      const link = obterLinkPersonalizado(item);
      window.open(link, "_blank", "noopener,noreferrer");
      marcarComoEnviado(item.id);
    });
  };

  const filtrados = lista.filter(m => m.nome?.toLowerCase().includes(busca.toLowerCase()));
  const todosEnviados = lista.length > 0 && lista.every((item) => enviados.has(item.id));

  return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
        <div className="max-w-7xl mx-auto px-4 pt-8">

          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
                <Cake size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-800">Aniversariantes</h1>
                <p className="text-slate-500 font-medium">Igreja Unção e Poder</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.history.back()} className="px-5 py-2.5 bg-white border rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-slate-50">
                <ArrowLeft size={18} /> Voltar
              </button>
            </div>
          </header>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

            {/* Banner Principal */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <h2 className="text-4xl font-black mb-4">{lista.length} Aniversariantes hoje</h2>
                {!todosEnviados && lista.length > 0 && (
                    <button
                        onClick={enviarTodos}
                        className="flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform"
                    >
                      <Send size={20} /> ENVIAR TODAS AS MENSAGENS
                    </button>
                )}
              </div>

              <div className="bg-white rounded-[2rem] p-8 border flex flex-col items-center justify-center text-center shadow-sm">
                <CheckCircle2 size={40} className={todosEnviados ? "text-emerald-500" : "text-slate-300"} />
                <h3 className="text-2xl font-black mt-2">{enviados.size} / {lista.length}</h3>
                <p className="text-slate-500">Concluídos</p>
              </div>
            </div>

            {/* Lista de Membros */}
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
              <div className="p-8 border-b flex flex-col md:flex-row justify-between gap-4">
                <h3 className="text-xl font-black flex items-center gap-2"><Users size={20} /> Lista de Ovelhas</h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                      type="text"
                      placeholder="Buscar irmão(ã)..."
                      className="pl-12 pr-4 py-2 bg-slate-50 rounded-xl outline-none w-64 focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtrados.map((m) => {
                  const jaEnviado = enviados.has(m.id);
                  return (
                      <motion.div
                          key={m.id}
                          variants={itemVariants}
                          className={`p-5 rounded-3xl border transition-all ${jaEnviado ? "bg-emerald-50 opacity-60" : "bg-slate-50 hover:bg-white hover:shadow-md"}`}
                      >
                        <div className="flex justify-between mb-4">
                          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                            {m.nome?.charAt(0)}
                          </div>
                          {jaEnviado && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-bold">ENVIADO</span>}
                        </div>

                        <div className="mb-4">
                          <h4 className="font-bold text-slate-800">{m.nome}</h4>
                          <p className="text-slate-500 text-xs">{m.telefone}</p>
                        </div>

                        <button
                            onClick={() => {
                              window.open(obterLinkPersonalizado(m), "_blank");
                              marcarComoEnviado(m.id);
                            }}
                            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${jaEnviado ? "bg-white border text-slate-400" : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md"}`}
                        >
                          <MessageCircle size={18} />
                          {jaEnviado ? "Enviar de novo" : "Enviar Parabéns"}
                        </button>
                      </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
  );
}
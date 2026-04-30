import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import {
  Users, CheckCircle2, AlertCircle, Search,
  UserCheck, UserX, Fingerprint, Hash
} from "lucide-react";

export default function TesourariaDizimistas() {
  const [fieis, setFieis] = useState([]);
  const [infieis, setInfieis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await api.get("/tesouraria/fieis-infieis-mes");
        setFieis(res.data.fieis || []);
        setInfieis(res.data.infieis || []);
      } catch (err) {
        console.error("Erro ao carregar dizimistas:", err);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    carregar();
  }, []);

  const filtrar = (lista) =>
      lista.filter(m => m.nome.toLowerCase().includes(busca.toLowerCase()));

  if (loading) return <DizimistasSkeleton />;

  return (
      <div className="animate-in fade-in duration-700">

        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
          <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">
            Monitoramento Mensal
          </span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
              Dizimistas<span className="text-indigo-600">.</span>
            </h2>
          </div>

          <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
                type="text"
                placeholder="Buscar por nome..."
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* COLUNA: FIÉIS (CONTRIBUINTES) */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <UserCheck size={20} />
              </div>
              <h3 className="font-black uppercase italic tracking-tighter text-xl dark:text-white">Contribuintes</h3>
              <span className="ml-auto px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full">
              {fieis.length}
            </span>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filtrar(fieis).length === 0 ? (
                  <EmptyState type="success" />
              ) : (
                  filtrar(fieis).map((m) => (
                      <MemberCard key={m.id} nome={m.nome} status="fiel" />
                  ))
              )}
            </div>
          </section>

          {/* COLUNA: INFIEIS (PENDENTES) */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                <UserX size={20} />
              </div>
              <h3 className="font-black uppercase italic tracking-tighter text-xl dark:text-white">Pendentes</h3>
              <span className="ml-auto px-3 py-1 bg-rose-500 text-white text-[10px] font-black rounded-full">
              {infieis.length}
            </span>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filtrar(infieis).length === 0 ? (
                  <EmptyState type="pending" />
              ) : (
                  filtrar(infieis).map((m) => (
                      <MemberCard key={m.id} nome={m.nome} status="pendente" />
                  ))
              )}
            </div>
          </section>

        </div>
      </div>
  );
}

// Subcomponente de Card de Membro
function MemberCard({ nome, status }) {
  const isFiel = status === "fiel";

  return (
      <div className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 hover:-translate-x-1">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${
              isFiel
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600"
                  : "bg-rose-50 dark:bg-rose-500/10 text-rose-600"
          }`}>
            {nome.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight">{nome}</h4>
            <div className="flex items-center gap-1 mt-1">
              {isFiel ? <CheckCircle2 size={12} className="text-emerald-500" /> : <AlertCircle size={12} className="text-rose-500" />}
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
               {isFiel ? "Dízimo em dia" : "Aguardando contribuição"}
             </span>
            </div>
          </div>
        </div>

        <Fingerprint size={20} className="text-slate-100 dark:text-slate-800 group-hover:text-slate-200 dark:group-hover:text-slate-700 transition-colors" />
      </div>
  );
}

// Estados vazios decorativos
function EmptyState({ type }) {
  return (
      <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] text-center">
        <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Users size={24} className="text-slate-300" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          {type === "success" ? "Nenhum registro encontrado" : "Tudo em ordem por aqui"}
        </p>
      </div>
  );
}

// Loading Animado
function DizimistasSkeleton() {
  return (
      <div className="animate-pulse space-y-10">
        <div className="h-12 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
          </div>
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
          </div>
        </div>
      </div>
  );
}
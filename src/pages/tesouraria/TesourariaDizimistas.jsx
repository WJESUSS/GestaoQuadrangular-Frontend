import React, { useEffect, useState, useRef } from "react";
import api from "../../services/api.js";
import {
    Users, CheckCircle2, AlertCircle, Search,
    UserCheck, UserX, Fingerprint
} from "lucide-react";

// ─── ABA DIZIMISTAS ────────────────────────────────────────────────────────────
let _cacheDiz = null;

function Dizimistas() {
    const [fieis,   setFieis]   = useState(_cacheDiz?.fieis   || []);
    const [infieis, setInfieis] = useState(_cacheDiz?.infieis || []);
    const [loading, setLoading] = useState(!_cacheDiz);
    const [busca,   setBusca]   = useState("");
    const abortRef = useRef(null);

    useEffect(() => {
        if (_cacheDiz) { setFieis(_cacheDiz.fieis); setInfieis(_cacheDiz.infieis); setLoading(false); }
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        api.get("/tesouraria/fieis-infieis-mes", { signal: abortRef.current.signal })
            .then(res => {
                const f = res.data.fieis   || [];
                const i = res.data.infieis || [];
                _cacheDiz = { fieis: f, infieis: i };
                setFieis(f); setInfieis(i);
            })
            .catch(err => { if (err.name !== "CanceledError" && err.name !== "AbortError") console.error(err); })
            .finally(() => setLoading(false));
        return () => abortRef.current?.abort();
    }, []);

    const filtrar = lista => lista.filter(m => m.nome.toLowerCase().includes(busca.toLowerCase()));

    if (loading) return (
        <div className="flex flex-col gap-6">
            <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"/>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[0,1].map(col => (
                    <div key={col} className="flex flex-col gap-3">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="h-16 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 animate-pulse"/>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-5">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2">
                        <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-pulse"/>
                        Monitoramento Mensal
                    </span>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
                        Dizimistas<span className="text-indigo-500">.</span>
                    </h2>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input type="text" placeholder="Buscar por nome..."
                           className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                           value={busca} onChange={e => setBusca(e.target.value)}/>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] p-5 flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <UserCheck size={22} className="text-emerald-600"/>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contribuintes</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{fieis.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] p-5 flex items-center gap-4">
                    <div className="h-12 w-12 bg-red-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <UserX size={22} className="text-red-500"/>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pendentes</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{infieis.length}</p>
                    </div>
                </div>
            </div>

            {/* LISTAS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ColunaDizimistas titulo="Contribuintes" lista={filtrar(fieis)} tipo="fiel"
                                  icon={<UserCheck size={16} className="text-emerald-600"/>} bgIcon="bg-emerald-500/10"
                                  countBg="bg-emerald-100 dark:bg-emerald-900/30" countColor="text-emerald-700 dark:text-emerald-400"/>

                <ColunaDizimistas titulo="Pendentes" lista={filtrar(infieis)} tipo="pendente"
                                  icon={<UserX size={16} className="text-red-500"/>} bgIcon="bg-red-500/10"
                                  countBg="bg-red-100 dark:bg-red-900/30" countColor="text-red-700 dark:text-red-400"/>
            </div>
        </div>
    );
}

function ColunaDizimistas({ titulo, lista, tipo, icon, bgIcon, countBg, countColor }) {
    return (
        <section>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${bgIcon}`}>{icon}</div>
                <span className="font-black text-sm text-slate-800 dark:text-slate-100 tracking-tight">{titulo}</span>
                <span className={`ml-auto px-3 py-0.5 rounded-full text-[11px] font-black ${countBg} ${countColor}`}>{lista.length}</span>
            </div>
            <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
                {lista.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        <Users size={20} className="text-slate-300 dark:text-slate-700 mb-2"/>
                        <p className="text-xs font-medium text-slate-400">Nenhum registro encontrado</p>
                    </div>
                ) : lista.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                                tipo === "fiel" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-red-50 dark:bg-red-900/20 text-red-500"
                            }`}>{m.nome.charAt(0)}</div>
                            <div>
                                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{m.nome}</p>
                                <p className={`text-[11px] font-medium flex items-center gap-1 mt-0.5 ${tipo === "fiel" ? "text-emerald-600" : "text-red-500"}`}>
                                    {tipo === "fiel"
                                        ? <><CheckCircle2 size={10}/> Dízimo em dia</>
                                        : <><AlertCircle  size={10}/> Aguardando contribuição</>}
                                </p>
                            </div>
                        </div>
                        <Fingerprint size={15} className="text-slate-200 dark:text-slate-700 flex-shrink-0"/>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─── LAYOUT PRINCIPAL ──────────────────────────────────────────────────────────
export default function TesourariaLayout() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <Dizimistas/>
        </div>
    );
}
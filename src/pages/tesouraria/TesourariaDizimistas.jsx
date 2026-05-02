import React, { useEffect, useState, useRef } from "react";
import api from "../../services/api.js";
import {
    Users, CheckCircle2, AlertCircle, Search,
    UserCheck, UserX, Fingerprint
} from "lucide-react";

// Cache em memória — persiste enquanto o módulo estiver carregado
let _cache = null;

export default function TesourariaDizimistas() {
    const [fieis,   setFieis]   = useState(_cache?.fieis   || []);
    const [infieis, setInfieis] = useState(_cache?.infieis || []);
    const [loading, setLoading] = useState(!_cache); // se já tem cache, não mostra skeleton
    const [busca,   setBusca]   = useState("");
    const abortRef = useRef(null);

    useEffect(() => {
        // Se já tem cache, exibe imediatamente e atualiza em background silenciosamente
        if (_cache) {
            setFieis(_cache.fieis);
            setInfieis(_cache.infieis);
            setLoading(false);
        }

        const carregar = async () => {
            // Cancela request anterior se componente re-montar
            abortRef.current?.abort();
            abortRef.current = new AbortController();

            try {
                const res = await api.get("/tesouraria/fieis-infieis-mes", {
                    signal: abortRef.current.signal,
                });
                const novosFieis   = res.data.fieis   || [];
                const novosInfieis = res.data.infieis || [];

                // Atualiza cache
                _cache = { fieis: novosFieis, infieis: novosInfieis };

                setFieis(novosFieis);
                setInfieis(novosInfieis);
            } catch (err) {
                if (err.name !== "CanceledError" && err.name !== "AbortError") {
                    console.error("Erro ao carregar dizimistas:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        carregar();

        return () => abortRef.current?.abort();
    }, []);

    const filtrar = (lista) =>
        lista.filter(m => m.nome.toLowerCase().includes(busca.toLowerCase()));

    if (loading) return <DizimistasSkeleton />;

    return (
        <div className="animate-in fade-in duration-300">
            <style>{`
        .diz-search {
          background: #f9fafb;
          border: 1px solid #eaecf0;
          border-radius: 10px;
          transition: border-color .15s, box-shadow .15s;
        }
        .dark .diz-search { background: #0f1117; border-color: #1e2535; }
        .diz-search:focus-within { border-color: #5046e5; box-shadow: 0 0 0 3px rgba(80,70,229,0.1); }

        .diz-col-head {
          display: flex; align-items: center; gap: 10px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 14px;
        }
        .dark .diz-col-head { border-color: #1e2535; }
        .diz-col-icon {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .diz-col-title {
          font-size: 14px; font-weight: 600;
          color: #101828; letter-spacing: -0.01em;
        }
        .dark .diz-col-title { color: #f1f5f9; }
        .diz-count {
          margin-left: auto;
          padding: 2px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 600;
        }

        .diz-list { max-height: 560px; overflow-y: auto; padding-right: 2px; scrollbar-width: thin; scrollbar-color: #e5e7eb transparent; }
        .diz-list::-webkit-scrollbar { width: 4px; }
        .diz-list::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }
        .dark .diz-list::-webkit-scrollbar-thumb { background: #1e2535; }

        .diz-card {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; border-radius: 10px;
          background: #fff; border: 1px solid #eaecf0;
          margin-bottom: 6px; transition: all .15s; cursor: default;
        }
        .dark .diz-card { background: #111318; border-color: #1e2330; }
        .diz-card:hover { border-color: #d0d5dd; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .dark .diz-card:hover { border-color: #2a2f40; }

        .diz-avatar {
          width: 36px; height: 36px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 600; flex-shrink: 0;
        }
        .diz-name {
          font-size: 13px; font-weight: 500; color: #101828; line-height: 1.2;
        }
        .dark .diz-name { color: #e2e8f0; }
        .diz-status { font-size: 11px; font-weight: 500; margin-top: 2px; display: flex; align-items: center; gap: 4px; }

        .diz-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 40px 20px; text-align: center;
          border: 1.5px dashed #e5e7eb; border-radius: 12px;
        }
        .dark .diz-empty { border-color: #1e2535; }
        .diz-empty-icon {
          width: 44px; height: 44px; border-radius: 50%;
          background: #f9fafb; display: flex; align-items: center; justify-content: center;
          margin-bottom: 10px;
        }
        .dark .diz-empty-icon { background: #1a1d27; }
        .diz-empty-text { font-size: 12px; font-weight: 500; color: #98a2b3; }
      `}</style>

            {/* HEADER & SEARCH */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-5">
                <div>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
                        Monitoramento Mensal
                    </p>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Dizimistas
                    </h2>
                </div>

                <div className="relative diz-search w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        className="w-full pl-10 pr-4 py-3 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* COLUNA: CONTRIBUINTES */}
                <section>
                    <div className="diz-col-head">
                        <div className="diz-col-icon" style={{ background: "#f0fdf4" }}>
                            <UserCheck size={16} color="#16a34a" />
                        </div>
                        <span className="diz-col-title">Contribuintes</span>
                        <span className="diz-count" style={{ background: "#dcfce7", color: "#166534" }}>
              {fieis.length}
            </span>
                    </div>
                    <div className="diz-list">
                        {filtrar(fieis).length === 0 ? (
                            <EmptyState type="success" />
                        ) : (
                            filtrar(fieis).map((m) => (
                                <MemberCard key={m.id} nome={m.nome} status="fiel" />
                            ))
                        )}
                    </div>
                </section>

                {/* COLUNA: PENDENTES */}
                <section>
                    <div className="diz-col-head">
                        <div className="diz-col-icon" style={{ background: "#fff1f2" }}>
                            <UserX size={16} color="#dc2626" />
                        </div>
                        <span className="diz-col-title">Pendentes</span>
                        <span className="diz-count" style={{ background: "#fee2e2", color: "#991b1b" }}>
              {infieis.length}
            </span>
                    </div>
                    <div className="diz-list">
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

function MemberCard({ nome, status }) {
    const isFiel = status === "fiel";
    return (
        <div className="diz-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                    className="diz-avatar"
                    style={{
                        background: isFiel ? "#f0fdf4" : "#fff1f2",
                        color:      isFiel ? "#16a34a" : "#dc2626",
                    }}
                >
                    {nome.charAt(0)}
                </div>
                <div>
                    <div className="diz-name">{nome}</div>
                    <div className="diz-status" style={{ color: isFiel ? "#16a34a" : "#dc2626" }}>
                        {isFiel
                            ? <><CheckCircle2 size={11} /> Dízimo em dia</>
                            : <><AlertCircle  size={11} /> Aguardando contribuição</>
                        }
                    </div>
                </div>
            </div>
            <Fingerprint size={16} style={{ color: "#e5e7eb", flexShrink: 0 }} />
        </div>
    );
}

function EmptyState({ type }) {
    return (
        <div className="diz-empty">
            <div className="diz-empty-icon">
                <Users size={20} color="#d1d5db" />
            </div>
            <p className="diz-empty-text">
                {type === "success" ? "Nenhum registro encontrado" : "Tudo em ordem por aqui"}
            </p>
        </div>
    );
}

function DizimistasSkeleton() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ height: 32, width: "40%", background: "#f1f5f9", borderRadius: 8 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {[0, 1].map(col => (
                    <div key={col} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ height: 60, background: "#f9fafb", borderRadius: 10, border: "1px solid #eaecf0" }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
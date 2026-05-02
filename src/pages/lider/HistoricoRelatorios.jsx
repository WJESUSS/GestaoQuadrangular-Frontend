import React, { useEffect, useState } from 'react';
import api from "../../services/api.js";

const HistoricoRelatorios = () => {
    const [relatorios, setRelatorios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistorico = async () => {
            try {
                const token = localStorage.getItem('token');

                // CORREÇÃO: Sintaxe corrigida e usando a instância 'api'
                const res = await api.get("/relatorios/historico", {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // CORREÇÃO: Usando 'res.data' (que é onde o Axios guarda os dados)
                setRelatorios(res.data || []);
            } catch (error) {
                console.error("Erro ao buscar histórico:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistorico();
    }, []);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 mt-8 text-center">
                <p className="text-slate-600">Carregando histórico da célula...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 mt-8">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">
                Histórico de Reuniões
            </h3>

            <div className="space-y-4">
                {relatorios && relatorios.length > 0 ? (
                    relatorios.map((rel) => (
                        <div key={rel.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-mono text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
                                        {rel.dataReuniao}
                                    </span>
                                    <h4 className="font-bold text-slate-700 mt-2 uppercase">
                                        Estudo: {rel.estudo}
                                    </h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-bold text-slate-800">
                                        {rel.totalPresentes || 0}
                                    </span>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Presentes</p>
                                </div>
                            </div>

                            <div className="mt-2 text-xs text-slate-500">
                                Líder: <span className="font-medium text-slate-600">{rel.nomeLider}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 text-sm italic text-center py-4">
                        Nenhum relatório encontrado para esta célula.
                    </p>
                )}
            </div>
        </div>
    );
};

export default HistoricoRelatorios;
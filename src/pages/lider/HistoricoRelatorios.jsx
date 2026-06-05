import React, { useEffect, useState } from 'react';
import api from "../../services/api.js";

const EVENTOS = [
    { campo: 'escolaBiblica', label: 'EBQ',        abrev: 'EB' },
    { campo: 'quartaNoite',   label: '4ª Noite',   abrev: '4ª' },
    { campo: 'quintaNoite',   label: '5ª Noite',   abrev: '5ª' },
    { campo: 'domingoManha',  label: 'Dom. Manhã', abrev: 'DM' },
    { campo: 'domingoNoite',  label: 'Dom. Noite', abrev: 'DN' },
];

const HistoricoRelatorios = () => {
    const [ultimoDetalhe, setUltimoDetalhe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        api.get("/discipulado/historico", { headers })
            .then(res => {
                const historico = res.data || [];
                const ultimo = historico[0];
                if (!ultimo) return null;
                return api.get(`/discipulado/relatorio-semanal/${ultimo.id}`, { headers });
            })
            .then(res => {
                if (res) {
                    // 👇 LOG AQUI — cole o resultado no chat
                    console.log("DETALHE COMPLETO:", JSON.stringify(res.data, null, 2));
                    setUltimoDetalhe(res.data);
                }
            })
            .catch(error => {
                console.error("Erro:", error);
                setErro(error.message);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 mt-8 text-center">
            <p className="text-slate-600 text-sm">Carregando...</p>
        </div>
    );

    if (erro) return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 mt-8 text-center">
            <p className="text-red-400 text-sm">Erro: {erro}</p>
        </div>
    );

    if (!ultimoDetalhe) return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 mt-8 text-center">
            <p className="text-slate-400 text-sm italic py-4">Nenhum relatório encontrado.</p>
        </div>
    );

    // 👇 LOG AQUI TAMBÉM para ver no render
    console.log("membros:", ultimoDetalhe.membros);
    console.log("presencas:", ultimoDetalhe.presencas);

    const { inicio, fim, membros = [], presencas = [] } = ultimoDetalhe;

    const presencaMap = {};
    presencas.forEach(p => { presencaMap[p.membroId] = p; });

    const fmtData = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit'
    });

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 mt-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                    Última Reunião
                </h3>
                <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    {fmtData(inicio)} → {fmtData(fim)}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr>
                        <th className="text-left text-xs text-slate-400 font-semibold pb-2 pr-4">Membro</th>
                        {EVENTOS.map(e => (
                            <th key={e.campo} className="text-center text-xs text-slate-400 font-semibold pb-2 px-1">
                                {e.abrev}
                            </th>
                        ))}
                        <th className="text-center text-xs text-slate-400 font-semibold pb-2 pl-2">Total</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {membros.map(membro => {
                        const p = presencaMap[membro.id] ?? {};
                        const total = EVENTOS.filter(e => p[e.campo]).length;

                        return (
                            <tr key={membro.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-2 pr-4">
                                    <div className="flex items-center gap-2">
                                            <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600
                                                             flex items-center justify-center text-xs font-bold shrink-0">
                                                {membro.nome?.[0]?.toUpperCase() ?? '?'}
                                            </span>
                                        <span className="text-slate-700 font-medium whitespace-nowrap">
                                                {membro.nome}
                                            </span>
                                    </div>
                                </td>
                                {EVENTOS.map(e => (
                                    <td key={e.campo} className="text-center px-1 py-2">
                                        {p[e.campo]
                                            ? <span className="text-green-500 text-base">✓</span>
                                            : <span className="text-slate-200 text-base">–</span>
                                        }
                                    </td>
                                ))}
                                <td className="text-center pl-2 py-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                            total === 5 ? 'bg-green-100 text-green-600' :
                                                total >= 3  ? 'bg-blue-100 text-blue-500'  :
                                                    total >= 1  ? 'bg-amber-100 text-amber-500':
                                                        'bg-red-100 text-red-400'
                                        }`}>
                                            {total}/5
                                        </span>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoricoRelatorios;
import React, { useEffect, useState } from 'react';
import api from "../../services/api.js";

const HistoricoRelatorios = ({ isDark }) => {
    const [ultimo, setUltimo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        api.get("/relatorios/historico", { headers })
            .then(res => {
                const historico = res.data || [];
                const primeiroId = historico[0]?.id;
                if (!primeiroId) return null;
                return api.get(`/relatorios/${primeiroId}`, { headers });
            })
            .then(res => { if (res) setUltimo(res.data); })
            .catch(err => setErro(err.message))
            .finally(() => setLoading(false));
    }, []);

    const fmtData = (d) => d
        ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—';

    const card   = isDark ? 'rgba(26,20,22,.99)' : 'rgba(255,255,255,.99)';
    const border = isDark ? 'rgba(253,184,19,.13)' : 'rgba(200,16,46,.13)';
    const txt    = isDark ? '#F5F0EB' : '#0A0608';
    const sub    = isDark ? 'rgba(245,240,235,.45)' : 'rgba(10,6,8,.45)';
    const row    = isDark ? 'rgba(255,255,255,.03)' : 'rgba(200,16,46,.03)';
    const rowBorder = isDark ? 'rgba(253,184,19,.07)' : 'rgba(200,16,46,.07)';

    if (loading) return (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: '28px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 11, letterSpacing: '.16em', color: sub, textTransform: 'uppercase' }}>Carregando relatório...</p>
        </div>
    );

    if (erro || !ultimo) return (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: '28px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 11, fontStyle: 'italic', color: sub }}>
                {erro ? `Erro: ${erro}` : 'Nenhum relatório encontrado.'}
            </p>
        </div>
    );

    const {
        dataReuniao, nomeCelula, nomeLider, estudo,
        membrosPresentes = [], visitantesPresentes = [],
        totalMembros, totalVisitantes, totalPresentes, quantidadeVisitantes,
    } = ultimo;

    const todos = [
        ...membrosPresentes.map(p => ({ ...p, tipo: 'membro' })),
        ...visitantesPresentes.map(p => ({ ...p, tipo: 'visitante' })),
    ];

    return (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>

            {/* Header */}
            <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${border}`,
                background: isDark
                    ? 'linear-gradient(135deg, rgba(155,11,30,.18), rgba(0,36,112,.12))'
                    : 'linear-gradient(135deg, rgba(200,16,46,.06), rgba(0,61,165,.04))',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            }}>
                <div>
                    <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: '.22em', color: '#C8102E', textTransform: 'uppercase', margin: '0 0 4px' }}>
                        Último Relatório
                    </p>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: txt, margin: 0 }}>
                        Célula {nomeCelula || '—'}
                    </h3>
                    {nomeLider && (
                        <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 11, color: sub, margin: '3px 0 0', fontStyle: 'italic' }}>
                            Líder: {nomeLider}
                        </p>
                    )}
                </div>
                <div style={{
                    background: isDark ? 'rgba(200,16,46,.12)' : 'rgba(200,16,46,.07)',
                    border: '1px solid rgba(200,16,46,.2)',
                    borderRadius: 8, padding: '8px 14px', textAlign: 'center',
                }}>
                    <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: '.16em', color: '#C8102E', textTransform: 'uppercase', margin: '0 0 2px' }}>Data</p>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: txt, margin: 0 }}>{fmtData(dataReuniao)}</p>
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: `1px solid ${border}` }}>
                {[
                    { label: 'Membros',    value: totalMembros   ?? membrosPresentes.length,   color: '#003DA5' },
                    { label: 'Visitantes', value: totalVisitantes ?? (visitantesPresentes.length + (quantidadeVisitantes || 0)), color: '#C8102E' },
                    { label: 'Total',      value: totalPresentes  ?? todos.length,              color: '#C48C00' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ padding: '16px 12px', textAlign: 'center', borderRight: `1px solid ${border}` }}>
                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{value ?? '—'}</p>
                        <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 8.5, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: sub, margin: '4px 0 0' }}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Estudo */}
            {estudo && (
                <div style={{ padding: '12px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 3, height: 32, borderRadius: 99, background: 'linear-gradient(180deg, #C8102E, #003DA5)', flexShrink: 0 }}/>
                    <div>
                        <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 8.5, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: sub, margin: '0 0 2px' }}>Estudo</p>
                        <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 13, color: txt, margin: 0 }}>{estudo}</p>
                    </div>
                </div>
            )}

            {/* Lista de presentes */}
            {todos.length > 0 && (
                <div style={{ padding: '16px 24px 20px' }}>
                    <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: sub, margin: '0 0 12px' }}>Presentes</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {todos.map((p, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: row, border: `1px solid ${rowBorder}`,
                                borderRadius: 8, padding: '9px 12px', gap: 10,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: 6, flexShrink: 0,
                                        background: p.tipo === 'membro'
                                            ? 'linear-gradient(135deg, #9B0B1E, #003DA5)'
                                            : 'linear-gradient(135deg, #C48C00, #C8102E)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 12,
                                    }}>
                                        {p.nome?.charAt(0).toUpperCase() ?? '?'}
                                    </div>
                                    <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 13, color: txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {p.nome}
                                    </span>
                                </div>
                                <span style={{
                                    fontFamily: "'Manrope',sans-serif", fontSize: 8, fontWeight: 800,
                                    letterSpacing: '.12em', textTransform: 'uppercase',
                                    padding: '3px 8px', borderRadius: 99,
                                    background: p.tipo === 'membro' ? 'rgba(0,61,165,.1)' : 'rgba(200,16,46,.1)',
                                    color: p.tipo === 'membro' ? '#003DA5' : '#C8102E',
                                    border: `1px solid ${p.tipo === 'membro' ? 'rgba(0,61,165,.2)' : 'rgba(200,16,46,.2)'}`,
                                    flexShrink: 0,
                                }}>
                                    {p.tipo === 'membro' ? 'Membro' : 'Visitante'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoricoRelatorios;
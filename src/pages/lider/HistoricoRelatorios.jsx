import React, { useEffect, useState } from 'react';
import api from "../../services/api.js";
import { AURA, theme } from "./liderTheme";

const HistoricoRelatorios = ({ isDark }) => {
    const [ultimo, setUltimo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    const t = theme(isDark);

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

    if (loading) return (
        <div style={{ background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 14, padding: '28px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, letterSpacing: '.16em', color: t.textMuted, textTransform: 'uppercase' }}>Carregando relatório...</p>
        </div>
    );

    if (erro || !ultimo) return (
        <div style={{ background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 14, padding: '28px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontStyle: 'italic', color: t.textMuted }}>
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
        <div style={{ background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 14, overflow: 'hidden' }}>

            {/* Header */}
            <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${t.border}`,
                background: isDark
                    ? 'linear-gradient(135deg, rgba(110,29,30,.18), rgba(18,40,63,.12))'
                    : 'linear-gradient(135deg, rgba(158,42,43,.06), rgba(30,63,102,.04))',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            }}>
                <div>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: '.22em', color: '#9E2A2B', textTransform: 'uppercase', margin: '0 0 4px' }}>
                        Último Relatório
                    </p>
                    <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: t.text, margin: 0 }}>
                        Célula {nomeCelula || '—'}
                    </h3>
                    {nomeLider && (
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: t.textMuted, margin: '3px 0 0', fontStyle: 'italic' }}>
                            Líder: {nomeLider}
                        </p>
                    )}
                </div>
                <div style={{
                    background: isDark ? 'rgba(158,42,43,.12)' : 'rgba(158,42,43,.07)',
                    border: '1px solid rgba(158,42,43,.2)',
                    borderRadius: 8, padding: '8px 14px', textAlign: 'center',
                }}>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: '.16em', color: '#9E2A2B', textTransform: 'uppercase', margin: '0 0 2px' }}>Data</p>
                    <p style={{ fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 700, color: t.text, margin: 0 }}>{fmtData(dataReuniao)}</p>
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: `1px solid ${t.border}` }}>
                {[
                    { label: 'Membros',    value: totalMembros   ?? membrosPresentes.length,   color: '#1E3F66' },
                    { label: 'Visitantes', value: totalVisitantes ?? (visitantesPresentes.length + (quantidadeVisitantes || 0)), color: '#9E2A2B' },
                    { label: 'Total',      value: totalPresentes  ?? todos.length,              color: '#B8892E' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ padding: '16px 12px', textAlign: 'center', borderRight: `1px solid ${t.border}` }}>
                        <p style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{value ?? '—'}</p>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 8.5, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: t.textMuted, margin: '4px 0 0' }}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Estudo */}
            {estudo && (
                <div style={{ padding: '12px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 3, height: 32, borderRadius: 99, background: 'linear-gradient(180deg, #9E2A2B, #1E3F66)', flexShrink: 0 }}/>
                    <div>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 8.5, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 2px' }}>Estudo</p>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: t.text, margin: 0 }}>{estudo}</p>
                    </div>
                </div>
            )}

            {/* Lista de presentes */}
            {todos.length > 0 && (
                <div style={{ padding: '16px 24px 20px' }}>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 12px' }}>Presentes</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {todos.map((p, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: t.bgInput, border: `1px solid ${t.border}`,
                                borderRadius: 8, padding: '9px 12px', gap: 10,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: 6, flexShrink: 0,
                                        background: p.tipo === 'membro'
                                            ? 'linear-gradient(135deg, #6E1D1E, #1E3F66)'
                                            : 'linear-gradient(135deg, #B8892E, #9E2A2B)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 12,
                                    }}>
                                        {p.nome?.charAt(0).toUpperCase() ?? '?'}
                                    </div>
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {p.nome}
                                    </span>
                                </div>
                                <span style={{
                                    fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 800,
                                    letterSpacing: '.12em', textTransform: 'uppercase',
                                    padding: '3px 8px', borderRadius: 99,
                                    background: p.tipo === 'membro' ? 'rgba(30,63,102,.1)' : 'rgba(158,42,43,.1)',
                                    color: p.tipo === 'membro' ? '#1E3F66' : '#9E2A2B',
                                    border: `1px solid ${p.tipo === 'membro' ? 'rgba(30,63,102,.2)' : 'rgba(158,42,43,.2)'}`,
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

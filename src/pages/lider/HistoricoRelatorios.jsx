import React from 'react';

const HistoricoRelatorios = ({ celulaId }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 mt-8">
      <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest">Histórico de Reuniões</h3>
      <p className="text-slate-600 mt-2">Carregando histórico da célula...</p>
    </div>
  );
};

export default HistoricoRelatorios; // ESSA LINHA É A MAIS IMPORTANTE
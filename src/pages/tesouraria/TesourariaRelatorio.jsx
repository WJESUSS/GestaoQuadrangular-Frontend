import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import { motion } from "framer-motion";
import {
  CalendarDays, ChevronLeft, ChevronRight,
  RefreshCcw, Search, FileSpreadsheet, Loader2, Database, Coins
} from "lucide-react";
import TelaCarregando from "../../components/TelaCarregando.jsx";

/* ─── Tokens AURA (Mesmo do Dashboard) ──────────────────────────────── */
const AURA = {
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  dark:      "#0A0A0F",
  darkEl:    "#12121A",
  light:     "#F5F0E8",
  red:       "#C8102E",
  redDark:   "#9B0B1E",
  blue:      "#003DA5",
  blueDark:  "#002470",
  yellow:    "#FDB813",
};

function theme(isDark) {
  return {
    bg:          isDark ? "#0A0A0F"               : "#F5F0E8",
    bgEl:        isDark ? "rgba(18,18,26,.95)"     : "rgba(255,255,255,.95)",
    bgInput:     isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.1)"   : "rgba(201,169,110,.2)",
    borderInput: isDark ? "rgba(201,169,110,.15)"  : "rgba(201,169,110,.28)",
    text:        isDark ? "#F5F0E8"                : "#1A1008",
    textSec:     isDark ? "#9A9588"                : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"                : "#9A9080",
    glow1:       isDark ? "rgba(201,169,110,.05)"  : "rgba(201,169,110,.08)",
    glow2:       isDark ? "rgba(201,169,110,.04)"  : "rgba(201,169,110,.06)",
    cardHover:   isDark ? "rgba(201,169,110,.2)"   : "rgba(201,169,110,.35)",
    placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
  };
}

function GlobalStyles({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes dl-spin   { to { transform: rotate(360deg); } }
      @keyframes dl-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes fadeUp    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

      .dl-spin   { animation: dl-spin  1s linear infinite; }
      .dl-pulse  { animation: dl-pulse 3s ease-in-out infinite; }
      .fadeUp    { animation: fadeUp .5s ease; }

      * { box-sizing: border-box; }

      .tr-root {
        font-family: 'Inter', sans-serif;
        background: ${t.bg};
        color: ${t.text};
        padding-bottom: 40px;
        transition: background .3s, color .3s;
      }

      .tr-glow {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
          radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%);
        transition: background .3s;
      }

      .tr-content {
        position: relative; z-index: 1;
        max-width: 1140px; margin: 0 auto;
        padding: 0 18px;
      }
      @media(max-width: 420px) { .tr-content { padding: 0 14px; } }

      .tr-header {
        display: flex; flex-direction: column; gap: 18px;
        margin-bottom: 28px; padding-top: 28px;
      }
      @media(min-width: 768px) {
        .tr-header { flex-direction: row; align-items: flex-end; justify-content: space-between; }
      }

      .tr-header-left h2 {
        font-family: 'Playfair Display', serif;
        font-size: clamp(24px, 5vw, 32px);
        font-weight: 500; color: ${t.text};
        margin: 0 0 4px; letter-spacing: .02em;
      }

      .tr-header-left p {
        font-size: 10px; font-weight: 500; letter-spacing: .16em;
        text-transform: uppercase; color: ${AURA.gold}; margin: 0;
        display: flex; align-items: center; gap: 6px;
      }

      .tr-controls {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 16px; backdrop-filter: blur(20px);
        padding: 14px 18px; margin-bottom: 20px;
        display: flex; flex-wrap: wrap; align-items: center; gap: 12px;
      }
      @media(max-width: 480px) { .tr-controls { flex-direction: column; } }

      .tr-month-nav {
        display: flex; align-items: center; gap: 8px; flex-shrink: 0;
        background: ${isDark ? "rgba(255,255,255,.03)" : "rgba(201,169,110,.04)"};
        border: 1px solid ${t.border};
        border-radius: 10px; padding: 4px;
      }

      .tr-month-btn {
        background: none; border: none; cursor: pointer;
        width: 32px; height: 32px; border-radius: 8px;
        color: ${t.textMuted}; transition: all .25s;
        display: flex; align-items: center; justify-content: center;
      }
      .tr-month-btn:hover { color: ${AURA.gold}; background: ${t.cardHover}; }

      .tr-month-label {
        font-family: 'Playfair Display', serif;
        font-size: 11px; font-weight: 500; letter-spacing: .1em;
        text-transform: uppercase; color: ${t.text};
        min-width: 100px; text-align: center; padding: 0 8px;
      }

      .tr-year-select {
        background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 10px 12px; border-radius: 8px;
        outline: none; font-family: 'Inter', sans-serif; font-size: 13px;
        font-weight: 500; cursor: pointer; transition: all .25s;
        appearance: none; -webkit-appearance: none;
      }
      .tr-year-select:hover { border-color: ${AURA.gold}; }
      .tr-year-select:focus { border-color: ${AURA.gold}; box-shadow: 0 0 0 3px rgba(201,169,110,.1); }

      .tr-search-wrap {
        position: relative; flex: 1; min-width: 200px;
      }
      .tr-search-icon {
        position: absolute; left: 12px; top: 50%;
        transform: translateY(-50%); color: ${AURA.gold};
        opacity: .5; pointer-events: none;
      }

      .tr-search {
        width: 100%; background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 10px 14px 10px 38px; border-radius: 8px;
        outline: none; font-family: 'Inter', sans-serif; font-size: 14px;
        transition: all .25s;
      }
      .tr-search:focus { border-color: ${AURA.gold}; box-shadow: 0 0 0 3px rgba(201,169,110,.08); }
      .tr-search::placeholder { color: ${t.placeholder}; }

      .tr-refresh-btn {
        background: none; border: 1px solid ${t.border};
        color: ${t.textMuted}; padding: 10px; border-radius: 8px;
        cursor: pointer; transition: all .3s; display: flex;
        align-items: center; justify-content: center; flex-shrink: 0;
      }
      .tr-refresh-btn:hover {
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        color: #fff; border-color: transparent;
      }
      .tr-refresh-btn.spinning { animation: dl-spin .5s linear infinite; }

      .tr-stats {
        display: flex; align-items: center; gap: 8px;
        margin-left: auto; flex-shrink: 0;
        font-family: 'Inter', sans-serif; font-size: 10px;
        font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; color: ${t.textMuted};
      }
      @media(max-width: 480px) { .tr-stats { margin-left: 0; } }

      .tr-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 16px; overflow: hidden; backdrop-filter: blur(20px);
        position: relative;
      }
      .tr-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }

      .tr-table {
        width: 100%; border-collapse: collapse;
        min-width: 600px;
      }

      .tr-table thead tr { background: ${isDark ? "rgba(255,255,255,.02)" : "rgba(201,169,110,.03)"}; }

      .tr-table th {
        padding: 16px 18px; font-family: 'Inter', sans-serif;
        font-size: 9px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; color: ${t.textMuted}; text-align: left;
      }
      .tr-table th:last-child { text-align: right; }
      @media(min-width: 768px) { .tr-table th, .tr-table td { padding: 18px 22px; } }

      .tr-table td {
        padding: 14px 18px; border-top: 1px solid ${t.border};
        font-size: 13px; color: ${t.text};
      }

      .tr-table tbody tr { transition: background .15s; }
      .tr-table tbody tr:hover { background: ${isDark ? "rgba(255,255,255,.03)" : "rgba(201,169,110,.04)"}; }

      .tr-avatar {
        width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
        background: linear-gradient(135deg, rgba(201,169,110,.2), rgba(201,169,110,.06));
        border: 1px solid rgba(201,169,110,.22);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Playfair Display', serif; font-weight: 600;
        font-size: 13px; color: ${AURA.gold};
      }

      .tr-member-cell {
        display: flex; align-items: center; gap: 11px; min-width: 0;
      }
      .tr-member-name {
        font-family: 'Inter', sans-serif; font-size: 14px;
        color: ${t.text}; font-weight: 400;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }

      .tr-value {
        font-family: 'Playfair Display', serif; font-weight: 600;
        font-size: 13px; white-space: nowrap;
      }
      .tr-value-dizimo { color: ${AURA.blue}; }
      .tr-value-oferta { color: ${AURA.yellow}; }

      .tr-date-pill {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 12px; border-radius: 8px;
        background: ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${t.border};
        font-family: 'Inter', sans-serif; font-size: 10px;
        letter-spacing: .08em; color: ${t.textSec};
        white-space: nowrap;
      }

      .tr-badge {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 14px; border-radius: 8px;
        font-family: 'Inter', sans-serif; font-size: 8px;
        font-weight: 600; letter-spacing: .1em;
        text-transform: uppercase; white-space: nowrap;
      }

      .tr-badge-ouro {
        background: rgba(253, 184, 19, .1);
        border: 1px solid rgba(253, 184, 19, .25);
        color: ${AURA.yellow};
      }

      .tr-badge-prata {
        background: rgba(100, 116, 139, .1);
        border: 1px solid rgba(100, 116, 139, .25);
        color: #64748b;
      }

      .tr-badge-bronze {
        background: rgba(194, 65, 12, .1);
        border: 1px solid rgba(194, 65, 12, .25);
        color: #c2410c;
      }

      .tr-badge-default {
        background: ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${t.border};
        color: ${t.textSec};
      }

      .tr-empty {
        text-align: center; padding: 48px 20px;
        display: flex; flex-direction: column; align-items: center;
      }
      .tr-empty-icon { color: ${isDark ? "rgba(201,169,110,.15)" : "rgba(201,169,110,.1)"}; margin-bottom: 12px; }
      .tr-empty-text {
        font-family: 'Inter', sans-serif; font-size: 13px;
        color: ${t.textMuted}; font-weight: 300;
      }

      .tr-error {
        background: rgba(200, 16, 46, .08); border: 1px solid rgba(200, 16, 46, .2);
        color: ${AURA.red}; padding: 14px 18px; border-radius: 12px;
        margin-bottom: 18px; display: flex; align-items: center; gap: 10px;
        font-size: 13px;
      }

      .tr-table-wrap {
        overflow-x: auto; -webkit-overflow-scrolling: touch;
      }

      .tr-loading {
        padding: 48px 20px; text-align: center;
      }
      .tr-loading-spinner { display: inline-block; }
    `}</style>
  );
}

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function TesourariaRegistrosMensal({ isDark = false }) {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [spinning, setSpinning] = useState(false);

  const t = theme(isDark);
  const anos = Array.from({ length: 5 }, (_, i) => hoje.getFullYear() - i);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      setSpinning(true);
      const res = await api.get("/tesouraria/relatorio-tesouraria", { params: { mes, ano } });
      setRegistros((res.data || {}).registros || []);
    } catch (err) {
      setErro("Falha ao sincronizar com o servidor.");
      console.error(err);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setSpinning(false);
      }, 600);
    }
  }, [mes, ano]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtrados = registros.filter(r =>
      r.membroNome?.toLowerCase().includes(filtro.toLowerCase())
  );

  const fmt = (v) => Number(v ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  const totalDizimo = filtrados.reduce((s, r) => s + (r.valorDizimo || 0), 0);
  const totalOferta = filtrados.reduce((s, r) => s + (r.valorOferta || 0), 0);
  const totalGeral = totalDizimo + totalOferta;

  return (
      <div className="tr-root" style={{ background: t.bg }}>
        <GlobalStyles t={t} isDark={isDark} />
        <div className="tr-glow" />

        <div className="tr-content">
          {/* Header */}
          <motion.div
              className="tr-header"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
          >
            <div className="tr-header-left">
              <p>
                <Database size={11} /> Histórico de Lançamentos
              </p>
              <h2>Registros Mensais</h2>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
              className="tr-controls"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="tr-month-nav">
              <button
                  className="tr-month-btn"
                  onClick={() => setMes(p => p === 1 ? 12 : p - 1)}
                  title="Mês anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="tr-month-label">{MESES[mes - 1]}</span>
              <button
                  className="tr-month-btn"
                  onClick={() => setMes(p => p === 12 ? 1 : p + 1)}
                  title="Próximo mês"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <select
                className="tr-year-select"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
            >
              {anos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <div className="tr-search-wrap">
              <Search size={15} className="tr-search-icon" />
              <input
                  type="text"
                  className="tr-search"
                  placeholder="Filtrar por nome…"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
              />
            </div>

            <button
                className={`tr-refresh-btn ${spinning ? "spinning" : ""}`}
                onClick={carregar}
                title="Recarregar"
            >
              <RefreshCcw size={17} />
            </button>

            <div className="tr-stats">
              <FileSpreadsheet size={13} />
              {filtrados.length} Registros
            </div>
          </motion.div>

          {/* Error */}
          {erro && (
              <motion.div
                  className="tr-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
              >
                <RefreshCcw size={15} />
                {erro}
              </motion.div>
          )}

          {/* Table */}
          <motion.div
              className="tr-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
          >
            {loading ? (
                <TelaCarregando isDark={isDark} minHeight="30vh" background="transparent" />
            ) : (
                <div className="tr-table-wrap">
                  <table className="tr-table">
                    <thead>
                    <tr>
                      <th>Ref. ID</th>
                      <th>Contribuinte</th>
                      <th>Dízimo</th>
                      <th>Oferta</th>
                      <th>Categoria</th>
                      <th>Data</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtrados.length === 0 ? (
                        <tr>
                          <td colSpan={6}>
                            <div className="tr-empty">
                              <Coins size={40} className="tr-empty-icon" />
                              <p className="tr-empty-text">
                                Nenhum registro no período
                              </p>
                            </div>
                          </td>
                        </tr>
                    ) : (
                        filtrados.map(r => (
                            <tr key={r.id}>
                              <td style={{ fontWeight: 500, fontSize: 11, color: t.textMuted }}>
                                #{String(r.id || "?").padStart(4, "0")}
                              </td>
                              <td>
                                <div className="tr-member-cell">
                                  <div className="tr-avatar">
                                    {r.membroNome?.charAt(0).toUpperCase() || "?"}
                                  </div>
                                  <span className="tr-member-name">
                              {r.membroNome || "Anônimo"}
                            </span>
                                </div>
                              </td>
                              <td>
                          <span className="tr-value tr-value-dizimo">
                            {r.valorDizimo
                                ? `R$ ${fmt(r.valorDizimo)}`
                                : <span style={{ color: t.textMuted }}>–</span>
                            }
                          </span>
                              </td>
                              <td>
                          <span className="tr-value tr-value-oferta">
                            {r.valorOferta
                                ? `R$ ${fmt(r.valorOferta)}`
                                : <span style={{ color: t.textMuted }}>–</span>
                            }
                          </span>
                              </td>
                              <td>
                                <TrBadge tipo={r.tipoOferta} />
                              </td>
                              <td style={{ textAlign: "right" }}>
                          <span className="tr-date-pill">
                            <CalendarDays size={11} />
                            {new Date(r.dataLancamento).toLocaleDateString("pt-BR")}
                          </span>
                              </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                  </table>
                </div>
            )}
          </motion.div>

          {/* Resumo */}
          {filtrados.length > 0 && !loading && (
              <motion.div
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 20 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="tr-card" style={{ padding: 18 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 8px" }}>
                    Total de Dízimos
                  </p>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 600, color: AURA.blue, margin: 0 }}>
                    R$ {fmt(totalDizimo)}
                  </p>
                </div>
                <div className="tr-card" style={{ padding: 18 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 8px" }}>
                    Total de Ofertas
                  </p>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 600, color: AURA.yellow, margin: 0 }}>
                    R$ {fmt(totalOferta)}
                  </p>
                </div>
                <div className="tr-card" style={{ padding: 18, background: `linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue})`, border: "none" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", margin: "0 0 8px" }}>
                    Total Geral
                  </p>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 600, color: "#fff", margin: 0 }}>
                    R$ {fmt(totalGeral)}
                  </p>
                </div>
              </motion.div>
          )}
        </div>
      </div>
  );
}

function TrBadge({ tipo }) {
  const map = {
    OURO: "tr-badge-ouro",
    PRATA: "tr-badge-prata",
    BRONZE: "tr-badge-bronze",
  };
  const className = map[(tipo || "").toUpperCase()] || "tr-badge-default";

  return (
      <span className={`tr-badge ${className}`}>
      {(tipo || "PADRÃO").toUpperCase()}
    </span>
  );
}
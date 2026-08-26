import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users, GitBranch, Calendar, AlertTriangle,
  MessageCircle, CheckCircle, Activity, TrendingUp, Loader2,
} from "lucide-react";
import api from "../../services/api.js";

const AURA = {
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  dark:      "#0A0A0F",
  light:     "#F5F0E8",
  red:       "#C8102E",
  redDark:   "#9B0B1E",
  blue:      "#003DA5",
  yellow:    "#FDB813",
};

function theme(isDark) {
  return {
    bgEl:    isDark ? "rgba(18,18,26,.95)"   : "rgba(255,255,255,.95)",
    border:  isDark ? "rgba(201,169,110,.1)"  : "rgba(201,169,110,.2)",
    text:    isDark ? "#F5F0E8"               : "#1A1008",
    textSec: isDark ? "#9A9588"               : "#6B5E4A",
    textMuted: isDark ? "#6B6658"             : "#9A9080",
    gold:      isDark ? "#C9A96E"            : "#3D3218",
  };
}

function ScopedStyles({ t, isDark }) {
  return (
      <style>{`
      .pnp-wrap { font-family: 'Inter', sans-serif; color: ${t.text}; }
      .pnp-spin { animation: pnp-spin 1s linear infinite; }
      @keyframes pnp-spin { to { transform: rotate(360deg); } }

      .pnp-section-hd { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
      .pnp-section-title {
        font-family: 'Playfair Display', serif;
        font-size: 15px; font-weight: 500; color: ${t.text};
      }
      .pnp-month-wrap {
        display: flex; align-items: center; gap: 10px;
        padding: 11px 18px; border-radius: 100px;
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${t.border}; flex-shrink: 0;
      }
      .pnp-month-input {
        background: transparent; border: none; outline: none;
        font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600;
        letter-spacing: .12em; text-transform: uppercase; cursor: pointer;
        color: ${t.text};
      }
      .pnp-month-input::-webkit-calendar-picker-indicator {
        filter: ${isDark ? "invert(.6) sepia(1) saturate(3) hue-rotate(15deg)" : "sepia(.5) saturate(2)"};
        opacity: .7; cursor: pointer;
      }

      .pnp-main-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px; align-items: start; }
      @media(max-width: 860px) { .pnp-main-grid { grid-template-columns: 1fr; } }

      .pnp-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 20px; overflow: hidden; position: relative;
      }
      .pnp-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }
      .pnp-card-head {
        padding: 20px 22px; border-bottom: 1px solid ${t.border};
        display: flex; align-items: center; justify-content: space-between;
        flex-wrap: wrap; gap: 12px;
      }
      .pnp-card-head-left { display: flex; align-items: center; gap: 10px; }
      .pnp-card-head-title {
        font-family: 'Playfair Display', serif;
        font-size: 16px; font-weight: 500; color: ${t.text}; margin: 0;
      }

      .pnp-badge {
        display: inline-flex; align-items: center; gap: 7px;
        background: rgba(201,169,110,.07); border: 1px solid rgba(201,169,110,.2);
        border-radius: 100px; padding: 6px 16px;
        font-size: 9px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; color: ${t.gold}; white-space: nowrap;
      }

      .pnp-alerta-list { padding: 16px 18px; display: flex; flex-direction: column; gap: 9px; max-height: 480px; overflow-y: auto; }
      .pnp-alerta-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 14px; gap: 10px; flex-wrap: wrap;
        background: ${isDark ? "rgba(255,255,255,.025)" : "rgba(201,169,110,.04)"};
        border: 1px solid ${isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.12)"};
        border-radius: 13px; transition: border-color .2s; width: 100%;
      }
      .pnp-alerta-row:hover { border-color: rgba(201,169,110,.3); }
      .pnp-alerta-info { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
      .pnp-avatar {
        width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
        background: linear-gradient(135deg, rgba(201,169,110,.2), rgba(201,169,110,.06));
        border: 1px solid rgba(201,169,110,.22);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Playfair Display', serif; font-weight: 600;
        font-size: 14px; color: ${t.gold};
      }
      .pnp-alerta-name { font-size: 13px; font-weight: 500; color: ${t.text}; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .pnp-alerta-sub { font-size: 12px; font-weight: 300; color: ${AURA.red}; margin: 2px 0 0; }
      .pnp-alerta-actions { display: flex; gap: 8px; width: 100%; }
      @media(min-width: 480px) { .pnp-alerta-actions { width: auto; } }

      .pnp-btn-emerald {
        flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
        padding: 10px 16px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, #065f46, #059669);
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; transition: all .3s;
      }
      .pnp-btn-emerald:hover { transform: translateY(-1px); filter: brightness(1.1); }

      .pnp-btn-blue {
        flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
        padding: 10px 16px; border-radius: 100px; cursor: pointer;
        background: ${isDark ? "rgba(0,61,165,.15)" : "rgba(0,61,165,.08)"};
        border: 1px solid rgba(0,61,165,.3); color: ${AURA.blue};
        font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; transition: all .25s;
      }
      .pnp-btn-blue:hover { background: rgba(0,61,165,.25); }

      .pnp-empty {
        text-align: center; padding: 40px 12px;
        font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 300;
        font-style: italic; color: ${t.textMuted};
      }

      .pnp-ref-icon {
        width: 40px; height: 40px; border-radius: 11px;
        background: rgba(253,184,19,.12); border: 1px solid rgba(253,184,19,.22);
        display: flex; align-items: center; justify-content: center;
      }
      .pnp-ref-mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
      .pnp-ref-mini {
        text-align: center; padding: 16px 8px; border-radius: 13px;
        background: ${isDark ? "rgba(255,255,255,.025)" : "rgba(201,169,110,.04)"};
        border: 1px solid ${isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.12)"};
      }
      .pnp-ref-mini-value { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 600; margin: 0; line-height: 1; }
      .pnp-ref-mini-label { font-size: 8.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: ${t.textMuted}; margin: 6px 0 0; }

      .pnp-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(201,169,110,.15), transparent); margin: 16px 0; }
      `}</style>
  );
}

const containerVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function PainelPastor({ isDark = false }) {
  const [mes,     setMes]     = useState(new Date().toISOString().slice(0, 7));
  const [alertas, setAlertas] = useState([]);
  const [metricas, setMetricas] = useState({ celulasAtivas: 0, totalMembros: 0, multiplicacoesMes: 0 });
  const [loading, setLoading] = useState(true);

  const t = theme(isDark);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const mesValido = /^\d{4}-\d{2}$/.test(mes) ? mes : new Date().toISOString().slice(0, 7);
      const [resM, resA] = await Promise.allSettled([
        api.get("/api/pastor/metricas", { params: { mes: mesValido }, timeout: 10000 }),
        api.get("/discipulado/alertas",  { params: { mes: mesValido }, timeout: 10000 }),
      ]);
      if (resM.status === "fulfilled") setMetricas(resM.value.data || { celulasAtivas: 0, totalMembros: 0, multiplicacoesMes: 0 });
      if (resA.status === "fulfilled") setAlertas(resA.value.data || []);
    } catch (err) {
      console.error("Erro dashboard pastor:", err);
    } finally {
      setLoading(false);
    }
  }, [mes]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const enviarWhatsApp = (membro) => {
    const nome = membro.nome || "irmão(ã)";
    const fone = membro.telefone?.replace(/\D/g, "");
    if (!fone || fone.length < 10) { alert("Telefone inválido ou não cadastrado."); return; }
    const msg = encodeURIComponent(`Olá, *${nome}*! Paz seja contigo. Que sua semana seja abençoada.`);
    window.open(`https://wa.me/55${fone}?text=${msg}`, "_blank");
  };

  const marcarComoAcompanhado = async (id) => {
    try {
      await api.post("/discipulado/acompanhamento", { membroId: id, mesReferencia: mes });
      setAlertas(prev => prev.filter(a => a.id !== id));
    } catch {
      alert("Erro ao atualizar acompanhamento.");
    }
  };

  return (
      <>
        <ScopedStyles t={t} isDark={isDark} />

        <motion.div variants={containerVariants} initial="hidden" animate="visible"
                    style={{ display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif", color: t.text }}>

          <motion.div variants={itemVariants} className="pnp-section-hd"
                      style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <span className="pnp-section-title">Painel Pastoral</span>
            <div className="pnp-month-wrap">
              <Calendar size={14} style={{ color: t.gold }} />
              <input type="month" value={mes} onChange={e => setMes(e.target.value)} className="pnp-month-input" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pnp-main-grid" style={{ marginBottom: 22 }}>

            <div className="pnp-card">
              <div className="pnp-card-head">
                <div className="pnp-card-head-left">
                  <AlertTriangle size={18} style={{ color: AURA.red }} />
                  <h3 className="pnp-card-head-title">Alertas de Discipulado</h3>
                </div>
                <span className="pnp-badge" style={{ color: AURA.red, borderColor: "rgba(200,16,46,.3)", background: "rgba(200,16,46,.08)" }}>
                  {alertas.length} críticos
                </span>
              </div>

              <div className="pnp-alerta-list">
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                      <Loader2 size={26} className="pnp-spin" style={{ color: t.gold }} />
                    </div>
                ) : alertas.length === 0 ? (
                    <div className="pnp-empty">
                      <CheckCircle size={34} style={{ color: "#059669", opacity: .4, display: "block", margin: "0 auto 10px" }} />
                      Tudo em dia! Nenhum alerta.
                    </div>
                ) : alertas.map((m) => (
                    <div key={m.id} className="pnp-alerta-row">
                      <div className="pnp-alerta-info">
                        <div className="pnp-avatar">{m.nome?.charAt(0).toUpperCase()}</div>
                        <div style={{ minWidth: 0 }}>
                          <p className="pnp-alerta-name">{m.nome}</p>
                          <p className="pnp-alerta-sub">
                            {m.totalFaltas} falta{m.totalFaltas !== 1 ? "s" : ""} seguida{m.totalFaltas !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="pnp-alerta-actions">
                        <button className="pnp-btn-emerald" onClick={() => enviarWhatsApp(m)}>
                          <MessageCircle size={14} /> WhatsApp
                        </button>
                        <button className="pnp-btn-blue" onClick={() => marcarComoAcompanhado(m.id)}>
                          <CheckCircle size={14} /> Feito
                        </button>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="pnp-card" style={{ padding: "20px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="pnp-ref-icon">
                    <TrendingUp size={18} style={{ color: AURA.yellow }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: t.text, margin: 0 }}>
                      Mês Referência
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 300, color: t.textSec, margin: "2px 0 0" }}>
                      {mes ? new Date(mes + "-02").toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) : "—"}
                    </p>
                  </div>
                </div>
                <div className="pnp-ref-mini-grid">
                  <div className="pnp-ref-mini">
                    <p className="pnp-ref-mini-value" style={{ color: AURA.blue }}>{metricas.multiplicacoesMes ?? 0}</p>
                    <p className="pnp-ref-mini-label">Multiplicações</p>
                  </div>
                  <div className="pnp-ref-mini">
                    <p className="pnp-ref-mini-value" style={{ color: AURA.red }}>{metricas.celulasAtivas ?? 0}</p>
                    <p className="pnp-ref-mini-label">Células ativas</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="pnp-divider" />

        </motion.div>
      </>
  );
}

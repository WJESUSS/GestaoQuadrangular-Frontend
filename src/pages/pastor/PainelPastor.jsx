import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users, Calendar, AlertTriangle, MessageCircle,
  CheckCircle, TrendingUp, Loader2, GitBranch, Activity,
} from "lucide-react";
import api from "../../services/api.js";
import { AURA, theme } from "../heroTheme";

function ScopedStyles({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      .pnp-wrap { font-family:'Inter',sans-serif; color:${t.text}; display:flex; flex-direction:column; gap:16px; }
      .pnp-spin { animation: pnp-spin 1s linear infinite; }
      @keyframes pnp-spin { to { transform: rotate(360deg); } }

      .pnp-eyebrow {
        font-family:'Inter',sans-serif; font-size:9px; font-weight:600;
        letter-spacing:.2em; text-transform:uppercase; color:${t.gold}; margin:0 0 5px;
      }
      .pnp-title {
        font-family:'Playfair Display',serif; font-size:clamp(19px,3vw,25px);
        font-weight:500; color:${t.text}; margin:0; line-height:1.15;
      }
      .pnp-sub {
        font-family:'Inter',sans-serif; font-size:12.5px; font-weight:300;
        color:${t.textMuted}; margin:6px 0 0;
      }

      .pnp-month-wrap {
        display:flex; align-items:center; gap:9px; padding:10px 16px;
        border-radius:100px; background:${t.bgEl}; border:1px solid ${t.border};
        transition:border-color .2s;
      }
      .pnp-month-wrap:hover { border-color:${t.borderHov}; }
      .pnp-month-input {
        background:transparent; border:none; outline:none; cursor:pointer;
        font-family:'Inter',sans-serif; font-size:10.5px; font-weight:600;
        letter-spacing:.1em; text-transform:uppercase; color:${t.text};
      }
      .pnp-month-input::-webkit-calendar-picker-indicator {
        filter:${isDark ? "invert(.6) sepia(1) saturate(3) hue-rotate(15deg)" : "sepia(.5) saturate(2)"};
        opacity:.7; cursor:pointer;
      }

      .pnp-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; }
      .pnp-kpi {
        position:relative; overflow:hidden; display:flex; align-items:center; gap:13px;
        padding:16px 17px; border-radius:18px; background:${t.bgEl};
        border:1px solid ${t.border}; transition:transform .25s, border-color .25s, box-shadow .25s;
      }
      .pnp-kpi:hover { transform:translateY(-2px); border-color:${t.borderHov}; box-shadow:${t.shadow}; }
      .pnp-kpi::after {
        content:''; position:absolute; inset:0 auto 0 0; width:3px;
        background:var(--kpi-color, ${t.gold}); opacity:.75;
      }
      .pnp-kpi-icon {
        width:42px; height:42px; border-radius:12px; flex-shrink:0;
        display:flex; align-items:center; justify-content:center;
      }
      .pnp-kpi-value {
        font-family:'Playfair Display',serif; font-size:26px; font-weight:600;
        line-height:1; margin:0; color:${t.text};
      }
      .pnp-kpi-label {
        font-family:'Inter',sans-serif; font-size:8.5px; font-weight:600;
        letter-spacing:.13em; text-transform:uppercase; color:${t.textMuted};
        margin:6px 0 0;
      }

      .pnp-main-grid { display:grid; grid-template-columns:1.5fr 1fr; gap:14px; align-items:start; }
      @media(max-width:860px) { .pnp-main-grid { grid-template-columns:1fr; } }

      .pnp-card {
        background:${t.bgEl}; border:1px solid ${t.border};
        border-radius:20px; overflow:hidden; position:relative;
      }
      .pnp-card::before {
        content:''; position:absolute; top:0; left:0; right:0; height:1px;
        background:linear-gradient(90deg, transparent, ${isDark ? "rgba(217,174,94,.28)" : "rgba(184,137,46,.28)"}, transparent);
      }
      .pnp-card-head {
        padding:18px 20px; border-bottom:1px solid ${t.border};
        display:flex; align-items:center; justify-content:space-between;
        flex-wrap:wrap; gap:12px;
      }
      .pnp-card-head-left { display:flex; align-items:center; gap:11px; }
      .pnp-card-head-icon {
        width:38px; height:38px; border-radius:11px; flex-shrink:0;
        display:flex; align-items:center; justify-content:center;
      }
      .pnp-card-head-title {
        font-family:'Playfair Display',serif; font-size:16px; font-weight:500;
        color:${t.text}; margin:0;
      }
      .pnp-card-head-sub {
        font-family:'Inter',sans-serif; font-size:11px; font-weight:300;
        color:${t.textMuted}; margin:2px 0 0;
      }

      .pnp-badge {
        display:inline-flex; align-items:center; gap:6px;
        border-radius:100px; padding:5px 13px;
        font-family:'Inter',sans-serif; font-size:9px; font-weight:600;
        letter-spacing:.08em; text-transform:uppercase; white-space:nowrap; border:1px solid;
      }

      .pnp-alerta-list { padding:14px 16px; display:flex; flex-direction:column; gap:9px; max-height:460px; overflow-y:auto; }
      .pnp-alerta-row {
        display:flex; align-items:center; justify-content:space-between;
        padding:12px 14px; gap:12px; flex-wrap:wrap; width:100%;
        background:${isDark ? "rgba(255,255,255,.025)" : "rgba(15,42,74,.03)"};
        border:1px solid ${t.border}; border-radius:14px;
        transition:border-color .2s, background .2s;
      }
      .pnp-alerta-row:hover { border-color:${t.borderHov}; background:${t.hoverBg}; }
      .pnp-alerta-info { display:flex; align-items:center; gap:11px; min-width:0; flex:1; }
      .pnp-avatar {
        width:36px; height:36px; border-radius:11px; flex-shrink:0;
        background:${isDark ? "rgba(179,38,30,.16)" : "rgba(179,38,30,.09)"};
        border:1px solid ${isDark ? "rgba(179,38,30,.3)" : "rgba(179,38,30,.2)"};
        display:flex; align-items:center; justify-content:center;
        font-family:'Playfair Display',serif; font-weight:600;
        font-size:15px; color:${AURA.red};
      }
      .pnp-alerta-name {
        font-family:'Playfair Display',serif; font-size:14px; font-weight:500;
        color:${t.text}; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
      }
      .pnp-alerta-sub {
        font-family:'Inter',sans-serif; font-size:11.5px; font-weight:300;
        color:${AURA.red}; margin:2px 0 0;
      }
      .pnp-alerta-actions { display:flex; gap:8px; width:100%; }
      @media(min-width:520px) { .pnp-alerta-actions { width:auto; } }

      .pnp-btn-gold, .pnp-btn-ghost {
        flex:1; display:flex; align-items:center; justify-content:center; gap:6px;
        padding:9px 15px; border-radius:100px; cursor:pointer;
        font-family:'Inter',sans-serif; font-size:9.5px; font-weight:600;
        letter-spacing:.1em; text-transform:uppercase; transition:all .25s;
      }
      .pnp-btn-gold {
        border:none; color:#fff;
        background:linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight});
        box-shadow:0 3px 12px rgba(184,137,46,.22);
      }
      .pnp-btn-gold:hover { transform:translateY(-1px); filter:brightness(1.08); }
      .pnp-btn-ghost {
        background:transparent; border:1px solid ${t.border};
        color:${t.textSec};
      }
      .pnp-btn-ghost:hover { border-color:${t.borderHov}; color:${t.gold}; background:${t.hoverBg}; }
      .pnp-btn-gold:focus-visible, .pnp-btn-ghost:focus-visible { outline:2px solid ${t.gold}; outline-offset:2px; }

      .pnp-empty {
        text-align:center; padding:44px 16px;
        font-family:'Inter',sans-serif; font-size:12.5px; font-weight:300;
        color:${t.textMuted};
      }
      .pnp-empty-title {
        font-family:'Playfair Display',serif; font-size:15px; font-weight:500;
        color:${t.text}; margin:0 0 4px;
      }

      .pnp-ref-month {
        font-family:'Playfair Display',serif; font-size:22px; font-weight:500;
        color:${t.text}; margin:0; line-height:1.15;
      }
      .pnp-ref-year {
        font-family:'Inter',sans-serif; font-size:9px; font-weight:600;
        letter-spacing:.18em; text-transform:uppercase; color:${t.gold};
        margin:4px 0 0;
      }
      .pnp-ref-mini-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px; }
      .pnp-ref-mini {
        text-align:center; padding:16px 8px; border-radius:14px;
        background:${isDark ? "rgba(255,255,255,.025)" : "rgba(15,42,74,.03)"};
        border:1px solid ${t.border};
      }
      .pnp-ref-mini-value { font-family:'Playfair Display',serif; font-size:24px; font-weight:600; margin:0; line-height:1; }
      .pnp-ref-mini-label { font-family:'Inter',sans-serif; font-size:8px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:${t.textMuted}; margin:6px 0 0; }

      .pnp-divider { height:1px; background:linear-gradient(90deg, transparent, ${isDark ? "rgba(217,174,94,.18)" : "rgba(184,137,46,.18)"}, transparent); }
      .pnp-status-line {
        display:flex; align-items:center; gap:8px; margin-top:16px;
        padding:11px 13px; border-radius:12px;
        background:${isDark ? "rgba(30,122,70,.1)" : "rgba(30,122,70,.06)"};
        border:1px solid ${isDark ? "rgba(30,122,70,.25)" : "rgba(30,122,70,.18)"};
        font-family:'Inter',sans-serif; font-size:11px; font-weight:500; color:${AURA.green};
      }
      `}</style>
  );
}

const containerVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function PainelPastor({ isDark = false }) {
  const [mes, setMes]         = useState(new Date().toISOString().slice(0, 7));
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

  const mesLabel = mes ? new Date(mes + "-02").toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) : "—";
  const [mesNome, mesAno] = mesLabel.split(" de ");

  const KPIS = [
    { label: "Células ativas",  value: metricas.celulasAtivas ?? 0,   color: AURA.blue,   icon: <GitBranch size={18} /> },
    { label: "Membros",         value: metricas.totalMembros ?? 0,    color: AURA.gold,   icon: <Users size={18} /> },
    { label: "Multiplicações",  value: metricas.multiplicacoesMes ?? 0, color: AURA.green, icon: <TrendingUp size={18} /> },
    { label: "Alertas críticos", value: alertas.length,               color: AURA.red,    icon: <AlertTriangle size={18} /> },
  ];

  return (
      <>
        <ScopedStyles t={t} isDark={isDark} />

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="pnp-wrap">

          <motion.div variants={itemVariants}
                      style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <div>
              <p className="pnp-eyebrow">Painel Pastoral</p>
              <h2 className="pnp-title">Visão do mês</h2>
              <p className="pnp-sub">Métricas das células e acompanhamento do discipulado</p>
            </div>
            <div className="pnp-month-wrap">
              <Calendar size={14} style={{ color: t.gold }} />
              <input type="month" value={mes} onChange={e => setMes(e.target.value)} className="pnp-month-input" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pnp-kpis">
            {KPIS.map(({ label, value, color, icon }) => (
                <div key={label} className="pnp-kpi" style={{ "--kpi-color": color }}>
                  <div className="pnp-kpi-icon" style={{ background: `${color}14`, color }}>{icon}</div>
                  <div>
                    <p className="pnp-kpi-value">{loading ? "–" : value}</p>
                    <p className="pnp-kpi-label">{label}</p>
                  </div>
                </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="pnp-main-grid">

            <div className="pnp-card">
              <div className="pnp-card-head">
                <div className="pnp-card-head-left">
                  <div className="pnp-card-head-icon" style={{ background: `${AURA.red}12`, color: AURA.red }}>
                    <AlertTriangle size={17} />
                  </div>
                  <div>
                    <h3 className="pnp-card-head-title">Alertas de Discipulado</h3>
                    <p className="pnp-card-head-sub">Membros com faltas consecutivas</p>
                  </div>
                </div>
                <span className="pnp-badge" style={{ color: AURA.red, borderColor: `${AURA.red}35`, background: `${AURA.red}0f` }}>
                  {alertas.length} crítico{alertas.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="pnp-alerta-list">
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "36px 0" }}>
                      <Loader2 size={26} className="pnp-spin" style={{ color: t.gold }} />
                    </div>
                ) : alertas.length === 0 ? (
                    <div className="pnp-empty">
                      <CheckCircle size={36} style={{ color: AURA.green, opacity: .5, display: "block", margin: "0 auto 12px" }} />
                      <p className="pnp-empty-title">Tudo em dia</p>
                      Nenhum alerta de discipulado neste mês.
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
                        <button className="pnp-btn-gold" onClick={() => enviarWhatsApp(m)}>
                          <MessageCircle size={14} /> WhatsApp
                        </button>
                        <button className="pnp-btn-ghost" onClick={() => marcarComoAcompanhado(m.id)}>
                          <CheckCircle size={14} /> Feito
                        </button>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            <div className="pnp-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="pnp-card-head-icon" style={{ background: `${AURA.gold}14`, color: t.gold }}>
                  <Activity size={17} />
                </div>
                <div>
                  <p className="pnp-eyebrow" style={{ margin: 0 }}>Mês de referência</p>
                  <p className="pnp-ref-year">Acompanhamento</p>
                </div>
              </div>

              <div className="pnp-divider" style={{ margin: "16px 0" }} />

              <p className="pnp-ref-month">{mesNome || "—"}</p>
              <p className="pnp-ref-year">{mesAno || ""}</p>

              <div className="pnp-ref-mini-grid">
                <div className="pnp-ref-mini">
                  <p className="pnp-ref-mini-value" style={{ color: AURA.green }}>{metricas.multiplicacoesMes ?? 0}</p>
                  <p className="pnp-ref-mini-label">Multiplicações</p>
                </div>
                <div className="pnp-ref-mini">
                  <p className="pnp-ref-mini-value" style={{ color: AURA.blue }}>{metricas.celulasAtivas ?? 0}</p>
                  <p className="pnp-ref-mini-label">Células ativas</p>
                </div>
              </div>

              <div className="pnp-status-line">
                <CheckCircle size={15} />
                {alertas.length === 0
                    ? "Nenhum membro em alerta"
                    : `${alertas.length} membro${alertas.length !== 1 ? "s" : ""} em acompanhamento`}
              </div>
            </div>

          </motion.div>

        </motion.div>
      </>
  );
}

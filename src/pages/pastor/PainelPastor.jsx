import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  Users, GitBranch, Calendar, AlertTriangle,
  MessageCircle, CheckCircle, Activity, Gift,
  ChevronRight, Sparkles, TrendingUp, Loader2, X,
} from "lucide-react";
import api from "../../services/api.js";

/* ─── Tokens AURA (mesmo do DashboardLider) ───────────────────────────── */
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
  };
}

/* ─── CSS Global (segue padrão dl-* do DashboardLider, prefixo pp- mantido) ── */
function GlobalStyles({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes pp-spin   { to { transform: rotate(360deg); } }
      @keyframes pp-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes pp-blink  { 0%,100%{opacity:1;} 50%{opacity:.3;} }

      .pp-spin   { animation: pp-spin  1s linear infinite; }
      .pp-pulse  { animation: pp-pulse 3s ease-in-out infinite; }
      .pp-blink  { animation: pp-blink 2s ease-in-out infinite; }

      .pp-wrap {
        font-family: 'Inter', sans-serif;
        color: ${t.text};
        position: relative;
        transition: color .3s;
      }

      .pp-section-hd {
        display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
      }
      .pp-section-title {
        font-family: 'Playfair Display', serif;
        font-size: 15px; font-weight: 500; color: ${t.text};
      }

      .pp-badge {
        display: inline-flex; align-items: center; gap: 7px;
        background: rgba(201,169,110,.07);
        border: 1px solid rgba(201,169,110,.2);
        border-radius: 100px; padding: 6px 16px;
        font-size: 9px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; color: ${AURA.gold};
        white-space: nowrap;
      }

      .pp-month-wrap {
        display: flex; align-items: center; gap: 10px;
        padding: 11px 18px; border-radius: 100px;
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${t.border};
        flex-shrink: 0;
      }
      .pp-month-input {
        background: transparent; border: none; outline: none;
        font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600;
        letter-spacing: .12em; text-transform: uppercase; cursor: pointer;
        color: ${t.text};
      }
      .pp-month-input::-webkit-calendar-picker-indicator {
        filter: ${isDark ? "invert(.6) sepia(1) saturate(3) hue-rotate(15deg)" : "sepia(.5) saturate(2)"};
        opacity: .7; cursor: pointer;
      }

      .pp-stats-grid {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 12px; margin-bottom: 22px;
      }
      @media(max-width: 560px) { .pp-stats-grid { grid-template-columns: 1fr; gap: 10px; } }

      .pp-stat-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 18px; padding: 22px 20px; position: relative;
        backdrop-filter: blur(20px); overflow: hidden;
        transition: transform .3s, box-shadow .3s, border-color .3s;
      }
      .pp-stat-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }
      .pp-stat-card:hover {
        transform: translateY(-4px);
        border-color: ${t.cardHover};
        box-shadow: 0 14px 36px rgba(0,0,0,${isDark ? ".4" : ".1"});
      }
      .pp-stat-icon {
        width: 44px; height: 44px; border-radius: 13px; margin-bottom: 14px;
        display: flex; align-items: center; justify-content: center;
      }
      .pp-stat-label {
        font-size: 9px; font-weight: 600; letter-spacing: .2em;
        text-transform: uppercase; color: ${t.textMuted}; margin: 0 0 6px;
      }
      .pp-stat-value {
        font-family: 'Playfair Display', serif;
        font-size: clamp(32px, 7vw, 42px);
        font-weight: 600; line-height: 1; margin: 0;
      }

      .pp-main-grid {
        display: grid; grid-template-columns: 1.4fr 1fr;
        gap: 14px; align-items: start;
      }
      @media(max-width: 860px) { .pp-main-grid { grid-template-columns: 1fr; } }

      .pp-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 20px; overflow: hidden;
        backdrop-filter: blur(24px); position: relative;
      }
      .pp-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }
      .pp-card-head {
        padding: 20px 22px;
        border-bottom: 1px solid ${t.border};
        display: flex; align-items: center; justify-content: space-between;
        flex-wrap: wrap; gap: 12px;
      }
      .pp-card-head-left { display: flex; align-items: center; gap: 10px; }
      .pp-card-head-title {
        font-family: 'Playfair Display', serif;
        font-size: 16px; font-weight: 500; color: ${t.text}; margin: 0;
      }

      .pp-alerta-list {
        padding: 16px 18px;
        display: flex; flex-direction: column; gap: 9px;
        max-height: 480px; overflow-y: auto;
      }
      .pp-alerta-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 14px; gap: 10px; flex-wrap: wrap;
        background: ${isDark ? "rgba(255,255,255,.025)" : "rgba(201,169,110,.04)"};
        border: 1px solid ${isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.12)"};
        border-radius: 13px; transition: border-color .2s; width: 100%;
      }
      .pp-alerta-row:hover { border-color: rgba(201,169,110,.3); }
      .pp-alerta-info { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
      .pp-avatar {
        width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
        background: linear-gradient(135deg, rgba(201,169,110,.2), rgba(201,169,110,.06));
        border: 1px solid rgba(201,169,110,.22);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Playfair Display', serif; font-weight: 600;
        font-size: 14px; color: ${AURA.gold};
      }
      .pp-alerta-name {
        font-size: 13px; font-weight: 500; color: ${t.text}; margin: 0;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .pp-alerta-sub {
        font-size: 12px; font-weight: 300; color: ${AURA.red}; margin: 2px 0 0;
      }
      .pp-alerta-actions { display: flex; gap: 8px; width: 100%; }
      @media(min-width: 480px) { .pp-alerta-actions { width: auto; } }

      .pp-btn-emerald {
        flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
        padding: 10px 16px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, #065f46, #059669);
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; transition: all .3s;
      }
      .pp-btn-emerald:hover { transform: translateY(-1px); filter: brightness(1.1); }

      .pp-btn-blue {
        flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
        padding: 10px 16px; border-radius: 100px; cursor: pointer;
        background: ${isDark ? "rgba(0,61,165,.15)" : "rgba(0,61,165,.08)"};
        border: 1px solid rgba(0,61,165,.3); color: ${AURA.blue};
        font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; transition: all .25s;
      }
      .pp-btn-blue:hover { background: rgba(0,61,165,.25); }

      .pp-btn-ghost-link {
        margin-top: 4px; background: none; border: none; cursor: pointer;
        color: ${t.textMuted};
        font-family: 'Inter', sans-serif; font-size: 9.5px; font-weight: 600;
        letter-spacing: .14em; text-transform: uppercase;
        display: flex; align-items: center; justify-content: center; gap: 4px;
        transition: color .2s; width: 100%; padding: 6px 0;
      }
      .pp-btn-ghost-link:hover { color: ${AURA.gold}; }

      .pp-empty {
        text-align: center; padding: 40px 12px;
        font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 300;
        font-style: italic; color: ${t.textMuted};
      }

      /* Card aniversariantes (hero) */
      .pp-niver-hero {
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        border: 1px solid rgba(201,169,110,.12);
        border-radius: 20px; padding: 24px 22px; position: relative; overflow: hidden;
      }
      .pp-niver-stripes {
        position: absolute; inset: 0; pointer-events: none;
        background-image: repeating-linear-gradient(
          -55deg, rgba(255,255,255,.025) 0 8px, transparent 8px 16px
        );
      }
      .pp-niver-inner { position: relative; z-index: 1; }
      .pp-niver-icon {
        width: 44px; height: 44px; border-radius: 13px;
        background: rgba(255,255,255,.16);
        display: flex; align-items: center; justify-content: center;
        border: 1px solid rgba(255,255,255,.18);
      }
      .pp-niver-title {
        font-family: 'Playfair Display', serif;
        font-size: 17px; font-weight: 500; color: #fff; margin: 14px 0 2px;
      }
      .pp-niver-sub {
        font-size: 11px; font-weight: 300; color: rgba(255,255,255,.55); margin: 0 0 18px;
      }
      .pp-niver-row {
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
        background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.12);
        border-radius: 12px; padding: 10px 14px; backdrop-filter: blur(8px);
      }
      .pp-niver-name {
        font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; color: #fff;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .pp-niver-btn {
        background: rgba(255,255,255,.92); border: none; border-radius: 10px;
        padding: 8px 11px; cursor: pointer; display: flex; align-items: center;
        flex-shrink: 0; transition: all .2s;
      }
      .pp-niver-btn:hover { background: #fff; transform: scale(1.05); }

      /* Card mês referência */
      .pp-ref-icon {
        width: 40px; height: 40px; border-radius: 11px;
        background: rgba(253,184,19,.12); border: 1px solid rgba(253,184,19,.22);
        display: flex; align-items: center; justify-content: center;
      }
      .pp-ref-mini-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px;
      }
      .pp-ref-mini {
        text-align: center; padding: 16px 8px; border-radius: 13px;
        background: ${isDark ? "rgba(255,255,255,.025)" : "rgba(201,169,110,.04)"};
        border: 1px solid ${isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.12)"};
      }
      .pp-ref-mini-value {
        font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 600; margin: 0; line-height: 1;
      }
      .pp-ref-mini-label {
        font-size: 8.5px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; color: ${t.textMuted}; margin: 6px 0 0;
      }

      .pp-divider-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.15), transparent);
        margin: 16px 0;
      }
      .pp-footer {
        text-align: center;
        font-size: 9px; font-weight: 500; letter-spacing: .18em;
        text-transform: uppercase;
        color: ${isDark ? "rgba(245,240,232,.12)" : "rgba(26,16,8,.15)"};
        padding: 4px 0 0;
      }

      .pp-loading {
        display: flex; align-items: center; justify-content: center;
        padding: 80px 0; min-height: 240px;
      }

      /* Modal */
      .pp-modal-backdrop {
        position: fixed; inset: 0; z-index: 999;
        display: flex; align-items: flex-end; justify-content: center;
      }
      @media(min-width: 520px) {
        .pp-modal-backdrop { align-items: center; padding: 16px; }
      }
      .pp-modal-overlay {
        position: fixed; inset: 0;
        background: rgba(10,10,15,.88); z-index: 0;
        backdrop-filter: blur(4px);
      }
      .pp-modal-box {
        position: relative; z-index: 10;
        width: 100%; max-height: 88vh;
        display: flex; flex-direction: column;
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 22px 22px 0 0; overflow: hidden;
        padding: 24px 20px;
      }
      @media(min-width: 520px) {
        .pp-modal-box {
          border-radius: 22px; max-width: 440px;
          max-height: calc(100vh - 32px);
        }
      }
      .pp-modal-list {
        overflow-y: auto; display: flex; flex-direction: column; gap: 8px;
        max-height: 60vh;
      }
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

/* ─── Componente Principal ─────────────────────────────────────────────── */
export default function PainelPastor({ isDark = false }) {
  const [mes,             setMes]             = useState(new Date().toISOString().slice(0, 7));
  const [alertas,         setAlertas]         = useState([]);
  const [metricas,        setMetricas]        = useState({ celulasAtivas: 0, totalMembros: 0, multiplicacoesMes: 0 });
  const [aniversariantes, setAniversariantes] = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [modalAniver,     setModalAniver]     = useState(false);

  const t = theme(isDark);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const tokenRaw  = localStorage.getItem("token");
      const token     = tokenRaw ? tokenRaw.replace(/"/g, "").trim() : null;
      const mesValido = /^\d{4}-\d{2}$/.test(mes) ? mes : new Date().toISOString().slice(0, 7);

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params:  { mes: mesValido },
      };

      const [resMetricas, resAlertas] = await Promise.all([
        api.get("/api/pastor/metricas", config),
        api.get("/discipulado/alertas",  config),
      ]);

      setMetricas(resMetricas.data || { celulasAtivas: 0, totalMembros: 0, multiplicacoesMes: 0 });
      setAlertas(resAlertas.data  || []);
    } catch (err) {
      console.error("Erro dashboard pastor:", err);
    } finally {
      setLoading(false);
    }
  }, [mes]);

  const carregarAniversariantes = useCallback(async () => {
    try {
      const res = await api.get("/api/aniversariantes/hoje");
      setAniversariantes(res.data || []);
    } catch (err) {
      console.error("Erro aniversariantes:", err);
    }
  }, []);

  useEffect(() => { carregarDados(); },          [carregarDados]);
  useEffect(() => { carregarAniversariantes(); }, [carregarAniversariantes]);

  const enviarWhatsApp = (membro, tipo = "geral") => {
    const nome = membro.nome || "irmão(ã)";
    const saudacao = tipo === "niver"
        ? `FELIZ ANIVERSÁRIO!\n\nPaz seja contigo, querido(a) ${nome}!\n\nNesta data tão especial, celebramos a sua vida e o propósito de Deus em você. Desejamos que o Senhor derrame bênçãos sem medida.\n\nCom amor, Pastor Renato e Jaci Soares`
        : `Olá, *${nome}*! Paz seja contigo. Passando para saber como você está! Que sua semana seja abençoada.`;

    const fone = membro.telefone?.replace(/\D/g, "");
    if (!fone || fone.length < 10) { alert("Telefone inválido ou não cadastrado."); return; }
    window.open(`https://wa.me/55${fone}?text=${encodeURIComponent(saudacao)}`, "_blank");
  };

  const marcarComoAcompanhado = async (id) => {
    try {
      await api.post("/discipulado/acompanhamento", { membroId: id, mesReferencia: mes });
      setAlertas(prev => prev.filter(a => a.id !== id));
    } catch {
      alert("Erro ao atualizar acompanhamento.");
    }
  };

  if (loading && metricas.celulasAtivas === 0) {
    return (
        <div className="pp-wrap">
          <GlobalStyles t={t} isDark={isDark} />
          <div className="pp-loading">
            <Loader2 size={32} className="pp-spin" style={{ color: AURA.gold }} />
          </div>
        </div>
    );
  }

  return (
      <div className="pp-wrap">
        <GlobalStyles t={t} isDark={isDark} />

        <motion.div variants={containerVariants} initial="hidden" animate="visible"
                    style={{ display: "flex", flexDirection: "column" }}>

          {/* ── Header de seção + seletor de mês ── */}
          <motion.div variants={itemVariants} className="pp-section-hd"
                      style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="pp-section-title">Painel Pastoral</span>
            </div>
            <div className="pp-month-wrap">
              <Calendar size={14} style={{ color: AURA.gold }} />
              <input
                  type="month"
                  value={mes}
                  onChange={e => setMes(e.target.value)}
                  className="pp-month-input"
              />
            </div>
          </motion.div>

          {/* ── KPI Stats ── */}
          <motion.div variants={itemVariants} className="pp-stats-grid">
            {[
              { label: "CÉLULAS ATIVAS", value: metricas.celulasAtivas,     icon: <Activity size={20} />,  color: AURA.blue },
              { label: "MEMBROS TOTAIS", value: metricas.totalMembros,      icon: <Users size={20} />,     color: AURA.red  },
              { label: "MULTIPLICAÇÕES", value: metricas.multiplicacoesMes, icon: <GitBranch size={20} />, color: "#059669" },
            ].map(({ label, value, icon, color }) => (
                <motion.div key={label} className="pp-stat-card" variants={itemVariants}>
                  <div className="pp-stat-icon" style={{ background: `${color}18`, color }}>
                    {icon}
                  </div>
                  <p className="pp-stat-label">{label}</p>
                  <p className="pp-stat-value" style={{ color: t.text }}>
                    {(value ?? 0).toLocaleString("pt-BR")}
                  </p>
                </motion.div>
            ))}
          </motion.div>

          {/* ── Grid principal ── */}
          <motion.div variants={itemVariants} className="pp-main-grid" style={{ marginBottom: 22 }}>

            {/* ── Alertas de Discipulado ── */}
            <div className="pp-card">
              <div className="pp-card-head">
                <div className="pp-card-head-left">
                  <AlertTriangle size={18} style={{ color: AURA.red }} />
                  <h3 className="pp-card-head-title">Alertas de Discipulado</h3>
                </div>
                <span className="pp-badge" style={{ color: AURA.red, borderColor: "rgba(200,16,46,.3)", background: "rgba(200,16,46,.08)" }}>
                {alertas.length} críticos
              </span>
              </div>

              <div className="pp-alerta-list">
                {loading ? (
                    <div className="pp-loading" style={{ padding: "32px 0" }}>
                      <Loader2 size={26} className="pp-spin" style={{ color: AURA.gold }} />
                    </div>
                ) : alertas.length === 0 ? (
                    <div className="pp-empty">
                      <CheckCircle size={34} style={{ color: "#059669", opacity: .4, display: "block", margin: "0 auto 10px" }} />
                      Tudo em dia! Nenhum alerta.
                    </div>
                ) : alertas.map((m) => (
                    <div key={m.id} className="pp-alerta-row">
                      <div className="pp-alerta-info">
                        <div className="pp-avatar">{m.nome?.charAt(0).toUpperCase()}</div>
                        <div style={{ minWidth: 0 }}>
                          <p className="pp-alerta-name">{m.nome}</p>
                          <p className="pp-alerta-sub">
                            {m.totalFaltas} falta{m.totalFaltas !== 1 ? "s" : ""} seguida{m.totalFaltas !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="pp-alerta-actions">
                        <button className="pp-btn-emerald" onClick={() => enviarWhatsApp(m)}>
                          <MessageCircle size={14} /> WhatsApp
                        </button>
                        <button className="pp-btn-blue" onClick={() => marcarComoAcompanhado(m.id)}>
                          <CheckCircle size={14} /> Feito
                        </button>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            {/* ── Coluna direita ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Card Aniversariantes */}
              <div className="pp-niver-hero">
                <div className="pp-niver-stripes" />
                <div className="pp-niver-inner">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div className="pp-niver-icon">
                      <Gift size={20} style={{ color: "#fff" }} />
                    </div>
                    <Sparkles size={16} className="pp-blink" style={{ color: AURA.yellow }} />
                  </div>
                  <h3 className="pp-niver-title">Aniversários</h3>
                  <p className="pp-niver-sub">Celebrando vidas hoje</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {aniversariantes.length === 0 ? (
                        <p style={{ textAlign: "center", padding: "18px 0", fontSize: 12, fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,.6)" }}>
                          Nenhum aniversariante hoje.
                        </p>
                    ) : aniversariantes.slice(0, 4).map((p) => (
                        <div key={p.id} className="pp-niver-row">
                          <span className="pp-niver-name">{p.nome}</span>
                          <button className="pp-niver-btn" onClick={() => enviarWhatsApp(p, "niver")}>
                            <MessageCircle size={15} style={{ color: AURA.redDark }} />
                          </button>
                        </div>
                    ))}
                    {aniversariantes.length > 4 && (
                        <button className="pp-btn-ghost-link" style={{ color: "rgba(255,255,255,.7)" }}
                                onClick={() => setModalAniver(true)}>
                          Ver todos ({aniversariantes.length}) <ChevronRight size={13} />
                        </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Mês Referência */}
              <div className="pp-card" style={{ padding: "20px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="pp-ref-icon">
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
                <div className="pp-ref-mini-grid">
                  <div className="pp-ref-mini">
                    <p className="pp-ref-mini-value" style={{ color: AURA.blue }}>{metricas.multiplicacoesMes ?? 0}</p>
                    <p className="pp-ref-mini-label">Multiplicações</p>
                  </div>
                  <div className="pp-ref-mini">
                    <p className="pp-ref-mini-value" style={{ color: AURA.red }}>{metricas.celulasAtivas ?? 0}</p>
                    <p className="pp-ref-mini-label">Células ativas</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="pp-divider-line" />

        </motion.div>

        {/* ── Modal: todos os aniversariantes ── */}
        <AnimatePresence>
          {modalAniver && createPortal(
              <div className="pp-modal-backdrop">
                <motion.div className="pp-modal-overlay"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setModalAniver(false)} />
                <motion.div className="pp-modal-box"
                            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                            transition={{ type: "tween", duration: .28 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(201,169,110,.55)", margin: "0 0 4px" }}>
                        Hoje
                      </p>
                      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 500, color: t.text, margin: 0 }}>
                        Aniversariantes
                      </h2>
                    </div>
                    <button onClick={() => setModalAniver(false)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 4, display: "flex" }}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className="pp-divider-line" style={{ margin: "0 0 14px" }} />
                  <div className="pp-modal-list">
                    {aniversariantes.map((p) => (
                        <div key={p.id} className="pp-alerta-row">
                          <div className="pp-alerta-info">
                            <div className="pp-avatar">{p.nome?.charAt(0).toUpperCase()}</div>
                            <span className="pp-alerta-name">{p.nome}</span>
                          </div>
                          <button className="pp-btn-emerald" style={{ flex: "0 0 auto" }}
                                  onClick={() => enviarWhatsApp(p, "niver")}>
                            <MessageCircle size={13} /> Parabenizar
                          </button>
                        </div>
                    ))}
                  </div>
                </motion.div>
              </div>,
              document.body
          )}
        </AnimatePresence>
      </div>
  );
}
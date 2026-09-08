import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
  Plus, X, Building2, Clock, Search, Users, MapPin, Calendar,
  Home, User, Loader2, ChevronRight,
} from "lucide-react";
import TelaCarregando from "../../components/TelaCarregando.jsx";

/* ─── AURA Design Tokens (igual ao Dashboard) ─────────────────────── */
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
  green:     "#059669",
  greenDark: "#047857",
};

function themeCelulas(isDark) {
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

const DIAS = {
  MONDAY:    "Segunda-feira",
  TUESDAY:   "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY:  "Quinta-feira",
  FRIDAY:    "Sexta-feira",
  SATURDAY:  "Sábado",
  SUNDAY:    "Domingo",
};

const DIAS_CURTO = {
  MONDAY:    "Seg",
  TUESDAY:   "Ter",
  WEDNESDAY: "Qua",
  THURSDAY:  "Qui",
  FRIDAY:    "Sex",
  SATURDAY:  "Sáb",
  SUNDAY:    "Dom",
};

/* ─── GlobalStyles ────────────────────────────────────────────────── */
function GlobalStylesCelulas({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes cp-spin   { to { transform: rotate(360deg); } }
      @keyframes cp-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }

      .cp-spin   { animation: cp-spin  1s linear infinite; }
      .cp-pulse  { animation: cp-pulse 3s ease-in-out infinite; }

      .cp-root {
        font-family: 'Inter', sans-serif;
        color: ${t.text};
        position: relative;
        overflow-x: hidden;
        padding-bottom: max(40px, env(safe-area-inset-bottom, 40px));
        transition: color .3s;
      }

      .cp-content {
        position: relative; z-index: 1;
        max-width: 1000px; margin: 0 auto;
        padding: 12px 16px 0;
      }
      @media(max-width: 420px) { .cp-content { padding: 8px 10px 0; } }

      .cp-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
      }

      .cp-header-left {
        display: flex; align-items: center; gap: 12px; flex: 1;
      }

      .cp-title-block { flex: 1; min-width: 0; }

      .cp-eyebrow {
        font-size: 9px; font-weight: 500; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(201,169,110,.55);
        margin: 0 0 3px;
      }

      .cp-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(17px, 4vw, 22px);
        font-weight: 500; color: ${t.text};
        margin: 0; line-height: 1.2;
      }

      .cp-subtitle {
        font-size: 12px; font-weight: 300; color: ${t.textMuted};
        margin: 4px 0 0;
      }

      .cp-search-wrap {
        position: relative; margin-bottom: 18px;
      }

      .cp-search-icon {
        position: absolute; left: 14px; top: 50%;
        transform: translateY(-50%); color: ${AURA.gold}; opacity: .5;
        pointer-events: none;
      }

      .cp-input {
        width: 100%; box-sizing: border-box;
        background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 13px 16px 13px 44px;
        border-radius: 13px; outline: none;
        font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
        transition: all .25s; -webkit-appearance: none; appearance: none;
      }
      .cp-input:focus {
        border-color: rgba(201,169,110,.5);
        background: rgba(201,169,110,.04);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .cp-input::placeholder { color: ${t.placeholder}; }

      .cp-grid {
        display: grid; grid-template-columns: 1fr; gap: 12px;
      }
      @media(min-width: 600px) { .cp-grid { grid-template-columns: repeat(2, 1fr); } }
      @media(min-width: 900px) { .cp-grid { grid-template-columns: repeat(3, 1fr); } }

      .cp-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 18px; overflow: hidden; cursor: pointer;
        backdrop-filter: blur(24px); position: relative;
        transition: all .35s cubic-bezier(.4,0,.2,1);
        display: flex; flex-direction: column;
      }
      .cp-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.25), transparent);
      }
      .cp-card:hover { transform: translateY(-3px); border-color: ${t.cardHover}; }
      .cp-card:active { transform: scale(.98); }

      .cp-card-strip { height: 4px; flex-shrink: 0; }

      .cp-card-body { padding: 14px 16px; }

      .cp-card-title-row {
        display: flex; align-items: flex-start; justify-content: space-between;
        gap: 8px; margin-bottom: 6px;
      }
      .cp-card-title {
        font-family: 'Playfair Display', serif;
        font-size: 15px; font-weight: 600; color: ${t.text};
        margin: 0; line-height: 1.25;
      }

      .cp-card-lider {
        display: flex; align-items: center; gap: 6px;
        font-size: 12px; color: ${t.textSec}; margin: 0 0 10px;
      }
      .cp-card-lider svg { flex-shrink: 0; }

      .cp-card-dia-hora {
        display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
      }
      .cp-chip {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 6px 10px; border-radius: 9px;
        font-size: 11px; font-weight: 600;
        background: rgba(201,169,110,.1);
        color: ${AURA.gold};
        border: 1px solid rgba(201,169,110,.28);
      }

      .cp-card-meta {
        display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        padding-top: 12px;
        border-top: 1px solid ${t.border};
      }
      .cp-meta-item {
        display: flex; align-items: center; gap: 6px;
        font-size: 11.5px; color: ${t.textMuted};
      }

      .cp-card-footer {
        padding: 11px 16px; display: flex; align-items: center;
        justify-content: space-between;
        font-size: 9px; font-weight: 600; letter-spacing: .13em;
        text-transform: uppercase; border-top: 1px solid ${t.border};
        color: ${AURA.gold}; margin-top: auto; min-height: 40px;
      }

      .cp-empty {
        text-align: center; padding: 48px 20px;
      }
      .cp-empty-icon {
        width: 64px; height: 64px; border-radius: 16px;
        background: rgba(201,169,110,.1);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 16px; color: ${AURA.gold};
      }
      .cp-empty-text {
        font-size: 13px; font-weight: 300; color: ${t.textMuted};
        margin: 0;
      }

      .cp-loading {
        min-height: 60vh; display: flex;
        align-items: center; justify-content: center;
      }

      /* ── Modal ── */
      .cp-modal-backdrop {
        position: fixed; inset: 0; z-index: 9999;
        display: flex; align-items: flex-end; justify-content: center;
      }
      @media(min-width: 520px) {
        .cp-modal-backdrop { align-items: center; padding: 16px; }
      }

      .cp-modal-overlay {
        position: fixed; inset: 0;
        background: rgba(10,10,15,.88); z-index: 0;
        backdrop-filter: blur(4px);
      }

      .cp-modal-box {
        position: relative; z-index: 10;
        width: 100%; max-height: 88vh; max-height: 88dvh;
        display: flex; flex-direction: column;
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 24px 24px 0 0; overflow: hidden;
      }
      @media(min-width: 520px) {
        .cp-modal-box {
          border-radius: 24px; max-width: 460px;
          max-height: calc(100dvh - 32px);
        }
      }

      .cp-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 20px 22px; border-bottom: 1px solid ${t.border};
        flex-shrink: 0;
      }

      .cp-modal-title {
        font-family: 'Playfair Display', serif;
        font-size: 18px; font-weight: 500; color: ${t.text};
        margin: 0;
      }

      .cp-modal-body {
        flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        padding: 22px 20px;
        display: flex; flex-direction: column; gap: 16px;
      }

      .cp-visita-box {
        display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      }
      @media(max-width: 360px) { .cp-visita-box { grid-template-columns: 1fr; } }

      .cp-visita-cell {
        padding: 16px 14px; border-radius: 16px;
        text-align: center; position: relative; overflow: hidden;
      }
      .cp-visita-cell.dia {
        background: linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark});
        border: 1px solid rgba(201,169,110,.2);
      }
      .cp-visita-cell.horario {
        background: linear-gradient(135deg, ${AURA.green}, ${AURA.greenDark});
        border: 1px solid rgba(201,169,110,.2);
      }
      .cp-visita-label {
        font-size: 8px; font-weight: 700; letter-spacing: .18em;
        text-transform: uppercase; color: rgba(255,255,255,.65);
        margin: 0 0 6px;
      }
      .cp-visita-value {
        font-family: 'Playfair Display', serif;
        font-size: 19px; font-weight: 600; color: #fff; margin: 0;
        line-height: 1.2;
      }

      .cp-dados-section {
        padding: 14px 16px; border-radius: 14px;
        background: ${isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)"};
        border: 1px solid ${t.border};
        display: flex; flex-direction: column; gap: 0;
      }
      .cp-dados-section-title {
        font-family: 'Playfair Display', serif;
        font-size: 13px; font-weight: 500; color: ${t.text};
        margin: 0 0 4px;
      }
      .cp-data-row {
        display: flex; align-items: flex-start; gap: 10px;
        padding: 12px 0; border-bottom: 1px solid ${isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)"};
      }
      .cp-data-row:last-of-type { border-bottom: none; padding-bottom: 0; }
      .cp-data-icon {
        width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }
      .cp-data-label {
        font-size: 9px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; color: ${t.textMuted}; margin: 0 0 2px;
      }
      .cp-data-value {
        font-size: 13.5px; font-weight: 400; color: ${t.text}; margin: 0;
        line-height: 1.35; word-break: break-word;
      }

      .cp-badge-ativa {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 10px; border-radius: 6px;
        font-size: 9px; font-weight: 600; letter-spacing: .1em;
        text-transform: uppercase;
        background: rgba(5,150,105,.12);
        color: ${AURA.green};
        border: 1px solid rgba(5,150,105,.3);
      }
      .cp-badge-inativa {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 10px; border-radius: 6px;
        font-size: 9px; font-weight: 600; letter-spacing: .1em;
        text-transform: uppercase;
        background: rgba(200,16,46,.12);
        color: ${AURA.red};
        border: 1px solid rgba(200,16,46,.3);
      }
    `}</style>
  );
}

/* ─── Modal de Detalhes da Célula (foco: visita pastoral) ─────────── */
function ModalCelulaDetalhe({ celula, isDark, onClose }) {
  const t = themeCelulas(isDark);
  const [membrosContagem, setMembrosContagem] = useState(null);

  useEffect(() => {
    let ativo = true;
    setMembrosContagem(null);
    api.get(`/celulas/${celula.id}/membros`)
        .then(res => {
          const data = res.data;
          const count = Array.isArray(data)
              ? data.length
              : (Array.isArray(data?.content) ? data.content.length : (data?.totalElements ?? null));
          if (ativo) setMembrosContagem(count);
        })
        .catch(() => { if (ativo) setMembrosContagem(null); });
    return () => { ativo = false; };
  }, [celula.id]);

  const hora = celula.horario
      ? `${celula.horario}${String(celula.horario).includes(":") ? "" : ":00"}`
      : "—";

  const content = (
      <motion.div
          className="cp-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
      >
        <motion.div className="cp-modal-overlay" onClick={onClose} />
        <motion.div
            className="cp-modal-box"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "tween", duration: 0.28 }}
            onClick={e => e.stopPropagation()}
        >
          <div className="cp-modal-header">
            <div style={{ minWidth: 0 }}>
              <p className="cp-eyebrow" style={{ marginBottom: 2 }}>Dados da Célula</p>
              <h2 className="cp-modal-title">{celula.nome || "—"}</h2>
            </div>
            <button
                onClick={onClose}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: t.textMuted, display: "flex", padding: 0,
                }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="cp-modal-body">
            {/* Dia e Horário — prioridade para a visita pastoral */}
            <div className="cp-visita-box">
              <div className="cp-visita-cell dia">
                <p className="cp-visita-label">Dia da Célula</p>
                <p className="cp-visita-value">{DIAS[celula.diaSemana] || celula.diaSemana || "—"}</p>
              </div>
              <div className="cp-visita-cell horario">
                <p className="cp-visita-label">Horário</p>
                <p className="cp-visita-value">{hora}h</p>
              </div>
            </div>

            {/* Identificação */}
            <div className="cp-dados-section">
              <p className="cp-dados-section-title">Identificação</p>
              <div className="cp-data-row">
                <div className="cp-data-icon" style={{ background: "rgba(0,61,165,.1)", color: AURA.blue }}>
                  <Users size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="cp-data-label">Quantidade de Membros</p>
                  <p className="cp-data-value">{membrosContagem === null ? "…" : `${membrosContagem}`}</p>
                </div>
              </div>
              <div className="cp-data-row">
                <div className="cp-data-icon" style={{ background: "rgba(201,169,110,.12)", color: AURA.gold }}>
                  <User size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="cp-data-label">Líder</p>
                  <p className="cp-data-value">{celula.nomeLider || "Sem líder"}</p>
                </div>
              </div>
              <div className="cp-data-row">
                <div className="cp-data-icon" style={{ background: "rgba(0,61,165,.1)", color: AURA.blue }}>
                  <Home size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="cp-data-label">Anfitrião</p>
                  <p className="cp-data-value">{celula.anfitriao || "Não informado"}</p>
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="cp-dados-section">
              <p className="cp-dados-section-title">Localização</p>
              <div className="cp-data-row">
                <div className="cp-data-icon" style={{ background: "rgba(201,169,110,.12)", color: AURA.gold }}>
                  <MapPin size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="cp-data-label">Bairro</p>
                  <p className="cp-data-value">{celula.bairro || "Não informado"}</p>
                </div>
              </div>
              <div className="cp-data-row">
                <div className="cp-data-icon" style={{ background: "rgba(200,16,46,.1)", color: AURA.red }}>
                  <MapPin size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="cp-data-label">Endereço</p>
                  <p className="cp-data-value">{celula.endereco || "Não informado"}</p>
                </div>
              </div>
            </div>

            {/* Situação */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {celula.ativa === true || celula.ativa === undefined ? (
                  <span className="cp-badge-ativa"><span style={{ width: 7, height: 7, borderRadius: 99, background: AURA.green }} /> Ativa</span>
              ) : (
                  <span className="cp-badge-inativa"><span style={{ width: 7, height: 7, borderRadius: 99, background: AURA.red }} /> Inativa</span>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
  );

  return createPortal(content, document.body);
}

/* ─── Componente Principal ──────────────────────────────────────── */
export default function CelulasPastor({ isDark = false }) {
  const [celulas, setCelulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState("");
  const [filtro,  setFiltro]  = useState("");
  const [selecionada, setSelecionada] = useState(null);

  const t = themeCelulas(isDark);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/celulas");
      setCelulas(Array.isArray(res.data) ? res.data : []);
      setErro("");
    } catch (err) {
      console.error("Erro ao carregar células:", err);
      setErro("Não foi possível carregar as células.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const celulasFiltradas = celulas.filter(c =>
      c.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.nomeLider?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.bairro?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
      <div className="cp-root">
        <GlobalStylesCelulas t={t} isDark={isDark} />

        <div className="cp-content">

          <motion.header
              className="cp-header"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4 }}
          >
            <div className="cp-header-left">
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff",
              }}>
                <Building2 size={20} />
              </div>
              <div className="cp-title-block">
                <p className="cp-eyebrow">Visitação Pastoral</p>
                <h1 className="cp-title">Células</h1>
                <p className="cp-subtitle">Dia, horário e local de cada célula para planejar as visitas</p>
              </div>
            </div>
          </motion.header>

          <motion.div
              className="cp-search-wrap"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4, delay: .08 }}
          >
            <Search className="cp-search-icon" size={16} />
            <input
                className="cp-input"
                placeholder="Buscar célula, líder ou bairro…"
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
            />
          </motion.div>

          {erro && (
              <div className="cp-empty" style={{ border: "1.5px dashed rgba(200,16,46,.3)", borderRadius: 18, background: "rgba(200,16,46,.04)" }}>
                <p className="cp-empty-text">{erro}</p>
              </div>
          )}

          {loading ? (
              <div className="cp-loading">
                <TelaCarregando isDark={isDark} minHeight="40vh" background="transparent" />
              </div>
          ) : celulasFiltradas.length > 0 ? (
              <motion.div
                  className="cp-grid"
                  initial="hidden" animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: .04 } } }}
              >
                {celulasFiltradas.map((c) => (
                    <motion.div
                        key={c.id}
                        className="cp-card"
                        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                        onClick={() => setSelecionada(c)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: .98 }}
                    >
                      <div className="cp-card-strip" style={{ background: `linear-gradient(90deg, ${AURA.blue}, ${AURA.gold})` }} />
                      <div className="cp-card-body">
                        <div className="cp-card-title-row">
                          <h3 className="cp-card-title">{c.nome?.toUpperCase()}</h3>
                          {c.ativa === false && <span className="cp-badge-inativa">Inativa</span>}
                        </div>
                        {c.nomeLider && (
                            <p className="cp-card-lider">
                              <Users size={13} style={{ color: AURA.green }} />
                              {c.nomeLider}
                            </p>
                        )}
                        <div className="cp-card-dia-hora">
                          <span className="cp-chip">
                            <Calendar size={12} />
                            {DIAS_CURTO[c.diaSemana] || c.diaSemana || "—"}
                          </span>
                          <span className="cp-chip">
                            <Clock size={12} />
                            {c.horario ? `${c.horario}h` : "—"}
                          </span>
                        </div>
                        <div className="cp-card-meta">
                          {c.bairro && (
                              <div className="cp-meta-item">
                                <MapPin size={13} style={{ color: AURA.gold }} />
                                {c.bairro}
                              </div>
                          )}
                          {c.anfitriao && (
                              <div className="cp-meta-item">
                                <Home size={13} style={{ color: AURA.red }} />
                                {c.anfitriao}
                              </div>
                          )}
                        </div>
                      </div>
                      <div className="cp-card-footer">
                        <span>Ver detalhes</span>
                        <ChevronRight size={13} />
                      </div>
                    </motion.div>
                ))}
              </motion.div>
          ) : (
              <motion.div
                  className="cp-empty"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
              >
                <div className="cp-empty-icon">
                  <Building2 size={32} />
                </div>
                <p className="cp-empty-text">
                  {filtro ? "Nenhuma célula encontrada." : "Nenhuma célula cadastrada."}
                </p>
              </motion.div>
          )}

        </div>

        <AnimatePresence>
          {selecionada && (
              <ModalCelulaDetalhe
                  celula={selecionada}
                  isDark={isDark}
                  onClose={() => setSelecionada(null)}
              />
          )}
        </AnimatePresence>
      </div>
  );
}
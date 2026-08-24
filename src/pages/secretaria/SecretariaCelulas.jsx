import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
  Users, Loader2, Search, ChevronDown, Trash2, Plus,
  MapPin, Clock, Star, X, Building2,
} from "lucide-react";
import TelaCarregando from "../../components/TelaCarregando.jsx";

/* ─── AURA Design Tokens ─────────────────────────────────────────── */
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

function themeSecretaria(isDark) {
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

/* ─── GlobalStyles ────────────────────────────────────────────────── */
function GlobalStylesSecretaria({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes dl-spin   { to { transform: rotate(360deg); } }
      @keyframes dl-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }

      .dl-spin   { animation: dl-spin  1s linear infinite; }
      .dl-pulse  { animation: dl-pulse 3s ease-in-out infinite; }

      .sec-root {
        font-family: 'Inter', sans-serif;
        background: ${t.bg};
        color: ${t.text};
        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
        padding-bottom: max(40px, env(safe-area-inset-bottom, 40px));
        transition: background .3s, color .3s;
      }
      
      .sec-glow {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
          radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%);
      }
      
      .sec-content {
        position: relative; z-index: 1;
        max-width: 1200px; margin: 0 auto;
        padding: 20px 16px 0;
      }
      @media(max-width: 420px) { .sec-content { padding: 16px 12px 0; } }

      .sec-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
      }
      
      .sec-header-left {
        display: flex; align-items: center; gap: 12px;
      }
      
      .sec-title-block {
        flex: 1; min-width: 0;
      }
      
      .sec-eyebrow {
        font-size: 9px; font-weight: 500; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(201,169,110,.55);
        margin: 0 0 3px;
      }
      
      .sec-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(17px, 4vw, 22px);
        font-weight: 500; color: ${t.text};
        margin: 0; line-height: 1.2;
      }

      .sec-search-wrap {
        position: relative; margin-bottom: 18px;
      }
      
      .sec-search-icon {
        position: absolute; left: 14px; top: 50%;
        transform: translateY(-50%); color: ${AURA.gold}; opacity: .5;
        pointer-events: none;
      }
      
      .sec-input {
        width: 100%; box-sizing: border-box;
        background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 13px 16px 13px 44px;
        border-radius: 13px; outline: none;
        font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
        transition: all .25s; -webkit-appearance: none; appearance: none;
      }
      .sec-input:focus {
        border-color: rgba(201,169,110,.5);
        background: rgba(201,169,110,.04);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .sec-input::placeholder { color: ${t.placeholder}; }

      .sec-select-wrap {
        position: relative; margin-bottom: 18px;
      }
      
      .sec-select-icon {
        position: absolute; right: 14px; top: 50%;
        transform: translateY(-50%); color: ${t.textMuted};
        pointer-events: none;
      }
      
      .sec-select {
        width: 100%; box-sizing: border-box;
        background: ${t.bgEl}; border: 1px solid ${t.border};
        color: ${t.text}; padding: 13px 40px 13px 16px;
        border-radius: 13px; outline: none;
        font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
        transition: all .25s; -webkit-appearance: none; appearance: none;
        cursor: pointer;
      }
      .sec-select:focus {
        border-color: rgba(201,169,110,.5);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      select.sec-select option {
        background: ${isDark ? "#12121A" : "#F5F0E8"};
        color: ${t.text};
      }

      .sec-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 16px; overflow: hidden; margin-bottom: 20px;
        backdrop-filter: blur(24px); position: relative;
      }
      .sec-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }

      .sec-card-header {
        padding: 18px 20px;
        border-bottom: 1px solid ${t.border};
        display: flex; align-items: center; justify-content: space-between;
        flex-wrap: wrap; gap: 12px;
      }

      .sec-card-title {
        font-size: 15px; font-weight: 600; color: ${t.text}; margin: 0;
      }

      .sec-card-sub {
        font-size: 11px; font-weight: 300; color: ${t.textMuted}; margin: 3px 0 0;
      }

      .sec-hero {
        border-radius: 14px; overflow: hidden; position: relative;
        background: linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark});
        padding: 24px 22px; color: "#fff"; margin-bottom: 20px;
      }

      .sec-hero-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(18px, 5vw, 24px);
        font-weight: 600; margin: 0 0 12px;
        line-height: 1.2;
      }

      .sec-hero-badge {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 14px; border-radius: 8px;
        background: rgba(253,184,19,.15);
        color: ${AURA.yellow};
        border: 1px solid rgba(253,184,19,.3);
        font-size: 10px; font-weight: 600;
        letter-spacing: .1em; text-transform: uppercase;
      }

      .sec-grid-main {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
      }
      @media(min-width: 860px) {
        .sec-grid-main {
          grid-template-columns: 300px 1fr;
        }
      }

      .sec-btn-add {
        width: 100%; padding: 13px; border-radius: 10px; border: none;
        background: linear-gradient(135deg, ${AURA.green}, ${AURA.greenDark});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; cursor: pointer; transition: all .3s;
        display: flex; align-items: center; justify-content: center; gap: 6px;
      }
      .sec-btn-add:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(5,150,105,.25); }
      .sec-btn-add:disabled {
        opacity: 0.6; cursor: not-allowed; transform: none;
      }

      .sec-btn-remove {
        width: 36px; height: 36px; border-radius: 8px; border: none;
        background: ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"};
        color: ${AURA.red}; cursor: pointer; display: inline-flex;
        align-items: center; justify-content: center; transition: all .2s;
      }
      .sec-btn-remove:hover {
        background: ${AURA.red};
        color: #fff;
      }
      .sec-btn-remove:disabled {
        opacity: 0.6; cursor: not-allowed;
      }

      .sec-table {
        width: 100%; border-collapse: collapse;
      }

      .sec-th {
        padding: 12px 16px; text-align: left;
        background: ${isDark ? "rgba(255,255,255,.02)" : "rgba(200,16,46,.03)"};
        border-bottom: 1px solid ${t.border};
        font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600;
        letter-spacing: .14em; text-transform: uppercase;
        color: ${t.textSec};
      }

      .sec-td {
        padding: 14px 16px;
        border-bottom: 1px solid ${isDark ? "rgba(200,16,46,.05)" : "rgba(200,16,46,.08)"};
      }

      .sec-tr:hover {
        background: ${isDark ? "rgba(255,255,255,.02)" : "rgba(200,16,46,.03)"};
      }

      .sec-badge {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 10px; border-radius: 6px;
        font-size: 9px; font-weight: 600; letter-spacing: .1em;
        text-transform: uppercase;
      }

      .sec-member-avatar {
        width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
        background: linear-gradient(135deg, ${AURA.red}, ${AURA.blue});
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-family: 'Inter', sans-serif;
        font-weight: 600; font-size: 12px;
      }

      .sec-loading {
        min-height: 40vh; display: flex;
        align-items: center; justify-content: center;
      }

      .sec-empty {
        text-align: center; padding: 40px 20px;
      }

      .sec-empty-text {
        font-size: 13px; font-weight: 300;
        color: ${t.textMuted}; margin: 0;
      }

      .sec-stat-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px; margin-bottom: 16px;
      }
      @media(max-width: 480px) {
        .sec-stat-grid { grid-template-columns: 1fr; }
      }

      .sec-stat-card {
        padding: 16px; border-radius: 12px;
        background: ${isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)"};
        border: 1px solid ${t.border};
      }

      .sec-stat-label {
        font-size: 10px; font-weight: 600;
        letter-spacing: .14em; text-transform: uppercase;
        color: ${t.textSec}; margin: 0 0 6px;
      }

      .sec-stat-value {
        font-family: 'Playfair Display', serif;
        font-size: 28px; font-weight: 600;
        color: ${t.text}; margin: 0;
        line-height: 1;
      }
    `}</style>
  );
}

/* ─── Componente Principal ──────────────────────────────────────── */
export default function SecretariaCelulasRefatorada({ isDark = false }) {
  const [celulas,           setCelulas]           = useState([]);
  const [celulaSelecionada, setCelulaSelecionada] = useState(null);
  const [membros,           setMembros]           = useState([]);
  const [membrosSemCelula,  setMembrosSemCelula]  = useState([]);
  const [novoMembroId,      setNovoMembroId]      = useState("");
  const [loading,           setLoading]           = useState(false);
  const [loadingAcao,       setLoadingAcao]       = useState(false);
  const [modalAberto,       setModalAberto]       = useState(false);
  const [buscaCelula,       setBuscaCelula]       = useState("");

  const t = themeSecretaria(isDark);

  const carregarCelulas = useCallback(async () => {
    try {
      const res = await api.get("/celulas");
      // ✅ Garantir que é sempre um array
      const dados = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setCelulas(dados);
    } catch (err) {
      console.error(err);
      setCelulas([]);
    }
  }, []);

  const carregarMembrosSemCelula = useCallback(async () => {
    try {
      let todos = [];
      let pagina = 0;
      let temMais = true;
      const TAMANHO_PAGINA = 100; // pode subir esse valor se quiser menos requisições

      while (temMais) {
        const res = await api.get("/membros/sem-celula", {
          params: { page: pagina, size: TAMANHO_PAGINA },
        });

        const conteudo = Array.isArray(res.data)
            ? res.data
            : (res.data?.content || res.data?.data || []);

        todos = [...todos, ...conteudo];

        // Se a resposta não for paginada (array puro) ou já veio a última página, para
        const ultimaPagina = Array.isArray(res.data)
            ? true
            : (res.data?.last ?? conteudo.length < TAMANHO_PAGINA);

        temMais = !ultimaPagina && conteudo.length > 0;
        pagina++;
      }

      // ✅ Ordena por nome, ignorando acentos e maiúsculas/minúsculas
      todos.sort((a, b) =>
          (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR", { sensitivity: "base" })
      );

      setMembrosSemCelula(todos);
    } catch (err) {
      console.error(err);
      setMembrosSemCelula([]);
    }
  }, []);

  const carregarMembrosDaCelula = useCallback(async (celulaId) => {
    if (!celulaId) return;
    setLoading(true);
    try {
      const res = await api.get(`/celulas/${celulaId}/membros`);
      // ✅ Garantir que é sempre um array
      const dados = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setMembros(dados);
    } catch (err) {
      console.error(err);
      setMembros([]); // ✅ Fallback para array vazio
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    carregarCelulas();
    carregarMembrosSemCelula();
  }, [carregarCelulas, carregarMembrosSemCelula]);

  useEffect(() => {
    if (celulaSelecionada?.id) carregarMembrosDaCelula(celulaSelecionada.id);
    else setMembros([]);
  }, [celulaSelecionada, carregarMembrosDaCelula]);

  const handleAdicionarMembro = async () => {
    if (!novoMembroId || !celulaSelecionada) return;
    setLoadingAcao(true);
    try {
      await api.post(`/celulas/${celulaSelecionada.id}/membros/${novoMembroId}`);
      setNovoMembroId("");
      await Promise.all([carregarMembrosDaCelula(celulaSelecionada.id), carregarMembrosSemCelula()]);
    } catch (err) { alert(err.response?.data?.message || "Erro ao vincular membro."); }
    finally { setLoadingAcao(false); }
  };

  const handleRemoverMembro = async (membroId) => {
    if (!window.confirm("Remover membro da célula?")) return;
    setLoadingAcao(true);
    try {
      await api.delete(`/celulas/${celulaSelecionada.id}/membros/${membroId}`);
      await Promise.all([carregarMembrosDaCelula(celulaSelecionada.id), carregarMembrosSemCelula()]);
    } catch (err) { alert("Erro ao remover membro."); }
    finally { setLoadingAcao(false); }
  };

  const stats = useMemo(() => ({
    totalCelulas: celulas.length,
    membrosAtivos: membros.length,
    membrosSemCelula: membrosSemCelula.length,
  }), [celulas, membros, membrosSemCelula]);

  return (
      <div className="sec-root">
        <GlobalStylesSecretaria t={t} isDark={isDark} />
        <div className="sec-glow" />

        <div className="sec-content">

          {/* ── Header ── */}
          <motion.header
              className="sec-header"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4 }}
          >
            <div className="sec-header-left">
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 16,
              }}>
                <Users size={20} />
              </div>
              <div className="sec-title-block">
                <p className="sec-eyebrow">Secretaria</p>
                <h1 className="sec-title">Células</h1>
              </div>
            </div>
          </motion.header>

          {/* ── Stats ── */}
          <motion.div
              className="sec-stat-grid"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4, delay: .08 }}
          >
            <div className="sec-stat-card">
              <p className="sec-stat-label">💚 Células Cadastradas</p>
              <p className="sec-stat-value">{stats.totalCelulas}</p>
            </div>
            <div className="sec-stat-card">
              <p className="sec-stat-label">👥 Membros sem Célula</p>
              <p className="sec-stat-value">{stats.membrosSemCelula}</p>
            </div>
          </motion.div>

          {/* ── Seleção de Célula ── */}
          <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4, delay: .12 }}
          >
            <div className="sec-card" style={{ marginBottom: 20 }}>
              <div className="sec-card-header">
                <div>
                  <h3 className="sec-card-title">Célula Selecionada</h3>
                  <p className="sec-card-sub">{celulas.length} células disponíveis</p>
                </div>
              </div>
              <div style={{ padding: "16px 20px" }}>
                {celulaSelecionada ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: `linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff",
                      }}>
                        <Building2 size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: t.text }}>{celulaSelecionada.nome}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: t.textSec }}>
                          {celulaSelecionada.bairro && `${celulaSelecionada.bairro} • `}
                          {celulaSelecionada.nomeLider || "Sem líder"}
                        </p>
                      </div>
                      <button
                          onClick={() => setModalAberto(true)}
                          style={{
                            padding: "10px 18px", borderRadius: 10, border: `1px solid ${t.border}`,
                            background: t.bgInput, color: t.text, cursor: "pointer",
                            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
                            whiteSpace: "nowrap", transition: "all .2s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = AURA.gold}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = t.border}
                      >
                        Trocar
                      </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setModalAberto(true)}
                        style={{
                          width: "100%", padding: "16px 20px", borderRadius: 12,
                          border: `2px dashed ${t.borderInput}`,
                          background: "transparent", color: t.textSec, cursor: "pointer",
                          fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          transition: "all .25s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = AURA.gold;
                          e.currentTarget.style.color = AURA.gold;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = t.borderInput;
                          e.currentTarget.style.color = t.textSec;
                        }}
                    >
                      <Search size={18} />
                      Buscar Célula…
                    </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Modal de Busca ── */}
          <AnimatePresence>
            {modalAberto && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: .2 }}
                    style={{
                      position: "fixed", inset: 0, zIndex: 9999,
                      background: "rgba(0,0,0,.6)",
                      backdropFilter: "blur(6px)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: 16, boxSizing: "border-box",
                    }}
                    onClick={() => { setModalAberto(false); setBuscaCelula(""); }}
                >
                  <motion.div
                      initial={{ opacity: 0, scale: .92, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: .95, y: 10 }}
                      transition={{ duration: .25 }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: "100%",
                        maxWidth: 520,
                        maxHeight: "min(80vh, 600px)",
                        background: isDark ? "#12121A" : "#FFFFFF",
                        borderRadius: 20,
                        border: isDark ? "1px solid rgba(201,169,110,.12)" : "1px solid rgba(0,0,0,.06)",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 24px 80px rgba(0,0,0,.35)",
                      }}
                  >
                    {/* Header */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: 12, padding: "18px 20px 14px", flexShrink: 0,
                      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"}`,
                    }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{
                          margin: 0, fontSize: 9, fontWeight: 600,
                          letterSpacing: ".2em", textTransform: "uppercase",
                          color: "rgba(201,169,110,.55)",
                        }}>Selecionar</p>
                        <h2 style={{
                          margin: "2px 0 0", fontSize: 17, fontWeight: 600,
                          color: t.text, fontFamily: "'Inter', sans-serif",
                        }}>
                          Célula
                        </h2>
                      </div>
                      <button
                          onClick={() => { setModalAberto(false); setBuscaCelula(""); }}
                          style={{
                            width: 36, height: 36, borderRadius: 10, border: "none",
                            background: isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)",
                            color: t.textSec, cursor: "pointer", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Search */}
                    <div style={{ padding: "12px 20px", flexShrink: 0 }}>
                      <div style={{ position: "relative" }}>
                        <Search size={15} style={{
                          position: "absolute", left: 14, top: "50%",
                          transform: "translateY(-50%)", color: AURA.gold, opacity: .5,
                          pointerEvents: "none",
                        }} />
                        <input
                            autoFocus
                            placeholder="Buscar por nome ou bairro…"
                            value={buscaCelula}
                            onChange={(e) => setBuscaCelula(e.target.value)}
                            style={{
                              width: "100%", boxSizing: "border-box", padding: "13px 16px 13px 44px",
                              borderRadius: 12, border: `1px solid ${isDark ? "rgba(201,169,110,.15)" : "rgba(0,0,0,.1)"}`,
                              background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)",
                              color: t.text, outline: "none",
                              fontFamily: "'Inter', sans-serif", fontSize: 14,
                            }}
                        />
                      </div>
                    </div>

                    {/* List */}
                    <div style={{
                      flex: 1, overflowY: "auto",
                      padding: "4px 20px 20px",
                      display: "flex", flexDirection: "column", gap: 8,
                    }}>
                      {celulas
                          .filter((c) => {
                            const q = buscaCelula.toLowerCase();
                            return !q || c.nome?.toLowerCase().includes(q) || c.bairro?.toLowerCase().includes(q);
                          })
                          .map((c) => {
                            const selecionada = celulaSelecionada?.id === c.id;
                            return (
                                <motion.button
                                    key={c.id}
                                    onClick={() => {
                                      setCelulaSelecionada(c);
                                      setModalAberto(false);
                                      setBuscaCelula("");
                                    }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: .98 }}
                                    style={{
                                      width: "100%", textAlign: "left", cursor: "pointer",
                                      padding: "14px 16px", borderRadius: 14,
                                      border: selecionada
                                          ? `1.5px solid ${AURA.gold}`
                                          : `1px solid ${isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"}`,
                                      background: selecionada
                                          ? isDark ? "rgba(201,169,110,.1)" : "rgba(201,169,110,.08)"
                                          : isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)",
                                      display: "flex", alignItems: "center", gap: 12,
                                      fontFamily: "'Inter', sans-serif",
                                      transition: "border-color .2s, background .2s",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!selecionada) e.currentTarget.style.borderColor = "rgba(201,169,110,.3)";
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!selecionada) e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)";
                                    }}
                                >
                                  <div style={{
                                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                    background: selecionada
                                        ? `linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight})`
                                        : `linear-gradient(135deg, ${AURA.blue}, ${AURA.blueDark})`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: selecionada ? "#1A0A0D" : "#fff",
                                    fontSize: 14, fontWeight: 600,
                                  }}>
                                    <Building2 size={18} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: t.text }}>
                                      {c.nome}
                                      {selecionada && (
                                          <span style={{ color: AURA.gold, fontSize: 11, marginLeft: 8, fontWeight: 500 }}>
                                            ✓ Atual
                                          </span>
                                      )}
                                    </p>
                                    <p style={{ margin: "3px 0 0", fontSize: 12, color: t.textSec }}>
                                      {c.bairro ? `${c.bairro} • ` : ""}
                                      {c.nomeLider ? `Líder: ${c.nomeLider}` : "Sem líder"}
                                    </p>
                                  </div>
                                </motion.button>
                            );
                          })}

                      {buscaCelula && celulas.filter(c =>
                          c.nome?.toLowerCase().includes(buscaCelula.toLowerCase()) ||
                          c.bairro?.toLowerCase().includes(buscaCelula.toLowerCase())
                      ).length === 0 && (
                          <div style={{ textAlign: "center", padding: "32px 16px" }}>
                            <p style={{ margin: 0, fontSize: 13, color: t.textMuted, fontStyle: "italic" }}>
                              Nenhuma célula encontrada para "{buscaCelula}"
                            </p>
                          </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* ── Conteúdo ── */}
          <AnimatePresence mode="wait">
            {celulaSelecionada && (
                <motion.div
                    key={celulaSelecionada.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: .35 }}
                    className="sec-grid-main"
                >
                  {/* COLUNA ESQUERDA */}
                  <div>
                    {/* Hero Card */}
                    <div className="sec-hero">
                      <h2 className="sec-hero-title">{celulaSelecionada.nome}</h2>
                      {celulaSelecionada.nomeLider && (
                          <div className="sec-hero-badge">
                            <Star size={12} style={{ fill: AURA.yellow }} />
                            {celulaSelecionada.nomeLider}
                          </div>
                      )}
                      <div style={{ marginTop: 16, fontSize: 12, opacity: .8, lineHeight: 1.6 }}>
                        {celulaSelecionada.bairro && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                              <MapPin size={13} /> {celulaSelecionada.bairro}
                            </div>
                        )}
                        {celulaSelecionada.horario && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <Clock size={13} /> {celulaSelecionada.horario}
                            </div>
                        )}
                      </div>
                    </div>

                    {/* Stat Membros */}
                    <div className="sec-card">
                      <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 10,
                          background: `${AURA.green}18`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: AURA.green, flexShrink: 0,
                        }}>
                          <Users size={20} />
                        </div>
                        <div>
                          <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 10, fontWeight: 600,
                            letterSpacing: ".14em", color: t.textSec,
                            margin: 0, textTransform: "uppercase",
                          }}>
                            Corpo de Membros
                          </p>
                          <p style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 28, fontWeight: 700,
                            color: t.text, margin: 0, lineHeight: 1,
                          }}>
                            {loading ? "…" : membros.length}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Adicionar Membro */}
                    <div className="sec-card">
                      <div className="sec-card-header">
                        <div>
                          <h3 className="sec-card-title">Novo Integrante</h3>
                          <p className="sec-card-sub">Vincular à célula</p>
                        </div>
                      </div>
                      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                        <div className="sec-select-wrap">
                          <select
                              className="sec-select"
                              value={novoMembroId}
                              onChange={e => setNovoMembroId(e.target.value)}
                          >
                            <option value="">BUSCAR MEMBRO…</option>
                            {Array.isArray(membrosSemCelula) && membrosSemCelula.map(m => (
                                <option key={m.id} value={m.id}>{m.nome}</option>
                            ))}
                          </select>
                          <ChevronDown className="sec-select-icon" size={16} />
                        </div>
                        <button
                            className="sec-btn-add"
                            onClick={handleAdicionarMembro}
                            disabled={!novoMembroId || loadingAcao}
                        >
                          {loadingAcao
                              ? <><Loader2 size={14} className="dl-spin" /> Vinculando…</>
                              : <><Plus size={14} /> Vincular Agora</>
                          }
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COLUNA DIREITA */}
                  <div className="sec-card">
                    <div className="sec-card-header">
                      <div>
                        <h3 className="sec-card-title">Membros da Célula</h3>
                        <p className="sec-card-sub">{loading ? "Carregando…" : `${membros.length} integrantes`}</p>
                      </div>
                    </div>

                    {/* Tabela */}
                    {loading ? (
                        <TelaCarregando isDark={isDark} minHeight="30vh" background="transparent" />
                    ) : membros.length === 0 ? (
                        <div className="sec-empty">
                          <Users size={32} style={{ color: t.textMuted, marginBottom: 12 }} />
                          <p className="sec-empty-text">Nenhum membro nesta célula.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table className="sec-table">
                            <thead>
                            <tr>
                              <th className="sec-th">NOME</th>
                              <th className="sec-th">STATUS</th>
                              <th className="sec-th" style={{ textAlign: "center", width: 80 }}>AÇÃO</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Array.isArray(membros) && membros.map((m, i) => {
                              const isLider = Number(m.id) === Number(celulaSelecionada.liderId);
                              return (
                                  <motion.tr
                                      key={m.id}
                                      className="sec-tr"
                                      initial={{ opacity: 0, y: 6 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: i * 0.04 }}
                                  >
                                    <td className="sec-td">
                                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div className="sec-member-avatar"
                                             style={{
                                               background: isLider
                                                   ? `linear-gradient(135deg, ${AURA.yellow}, ${AURA.gold})`
                                                   : `linear-gradient(135deg, ${AURA.red}, ${AURA.blue})`,
                                               color: isLider ? "#1A0A0D" : "#fff",
                                             }}>
                                          {m.nome?.charAt(0).toUpperCase()}
                                        </div>
                                        <span style={{
                                          fontFamily: "'Inter', sans-serif",
                                          fontSize: 13, fontWeight: 500,
                                          color: t.text, overflow: "hidden",
                                          textOverflow: "ellipsis", whiteSpace: "nowrap",
                                          maxWidth: 200,
                                        }}>
                                          {m.nome}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="sec-td">
                                      {isLider ? (
                                          <span className="sec-badge" style={{
                                            background: "rgba(253,184,19,.12)",
                                            color: AURA.yellow,
                                            border: "1px solid rgba(253,184,19,.3)",
                                          }}>
                                            ⭐ Líder
                                          </span>
                                      ) : (
                                          <span className="sec-badge" style={{
                                            background: isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)",
                                            color: t.textMuted,
                                            border: `1px solid ${isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"}`,
                                          }}>
                                            Membro
                                          </span>
                                      )}
                                    </td>
                                    <td className="sec-td" style={{ textAlign: "center" }}>
                                      <button
                                          className="sec-btn-remove"
                                          onClick={() => handleRemoverMembro(m.id)}
                                          disabled={loadingAcao}
                                      >
                                        {loadingAcao ? (
                                            <Loader2 size={14} className="dl-spin" />
                                        ) : (
                                            <Trash2 size={15} />
                                        )}
                                      </button>
                                    </td>
                                  </motion.tr>
                              );
                            })}
                            </tbody>
                          </table>
                        </div>
                    )}
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {!celulaSelecionada && (
              <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .4 }}
              >
                <div className="sec-card">
                  <div className="sec-card-header">
                    <div>
                      <h3 className="sec-card-title">Membros sem Célula</h3>
                      <p className="sec-card-sub">{membrosSemCelula.length} membros disponíveis</p>
                    </div>
                  </div>

                  {membrosSemCelula.length === 0 ? (
                      <div className="sec-empty">
                        <Users size={32} style={{ color: t.textMuted, marginBottom: 12 }} />
                        <p className="sec-empty-text">Nenhum membro sem célula.</p>
                      </div>
                  ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="sec-table">
                          <thead>
                          <tr>
                            <th className="sec-th">NOME</th>
                            <th className="sec-th">CONTATO</th>
                          </tr>
                          </thead>
                          <tbody>
                          {membrosSemCelula.map((m, i) => (
                              <motion.tr
                                  key={m.id}
                                  className="sec-tr"
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.04 }}
                              >
                                <td className="sec-td">
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div className="sec-member-avatar"
                                         style={{
                                           background: `linear-gradient(135deg, ${AURA.red}, ${AURA.blue})`,
                                           color: "#fff",
                                         }}>
                                      {m.nome?.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{
                                      fontFamily: "'Inter', sans-serif",
                                      fontSize: 13, fontWeight: 500,
                                      color: t.text, overflow: "hidden",
                                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                                      maxWidth: 200,
                                    }}>
                                      {m.nome}
                                    </span>
                                  </div>
                                </td>
                                <td className="sec-td">
                                  <span style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: 12, fontWeight: 300,
                                    color: t.textSec,
                                  }}>
                                    {m.telefone || m.email || "—"}
                                  </span>
                                </td>
                              </motion.tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                  )}
                </div>
              </motion.div>
          )}

        </div>

      </div>
  );
}
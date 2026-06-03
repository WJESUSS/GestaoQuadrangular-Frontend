import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import HistoricoRelatorios from "./HistoricoRelatorios";
import TelaRelatorio from "./TelaRelatorio";
import TelaVisitantes from "./TelaVisitantes";
import TelaFichas from "./TelaFichas";
import RelatorioDiscipulado from "./RelatorioDiscipulado";
import CasasDePazLider from "./CasasDePazLider";
import Missao70Lider from "./Missao70Lider";
import SinoAniversariantes from "./SinoAniversariantes";
import BoasVindasLider from "./BoasVindasLider";
import TelaMetasLider from "./TelaMetasLider";
import {
  Trash2, Loader2, Users, Plus, Search, X,
  TrendingUp, Target, Sparkles, LogOut,
  Sun, Moon, CheckCircle2, Home, Flame,
} from "lucide-react";

/* ─── Paleta idêntica ao Login ─────────────────────────────────────── */
const BRAND = {
  red:       "#C8102E",
  redDark:   "#9B0B1E",
  redLight:  "#E8294A",
  yellow:    "#FDB813",
  yellowDark:"#C48C00",
  blue:      "#003DA5",
  blueLight: "#1A56C4",
  blueDark:  "#002470",
  dark:      "#0A0608",
  stone:     "#1A1416",
  light:     "#F5F0EB",
  muted:     "#8A7F7A",
};

/* ─── Logo (igual ao Login) ─────────────────────────────────────────── */
function IEQCross({ size = 36, src = "/quadrangular.png" }) {
  return (
      <img
          src={src}
          alt="Logo IEQ"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            minWidth: `${size}px`,
            minHeight: `${size}px`,
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
          }}
      />
  );
}

/* ─── Chave boas-vindas ─────────────────────────────────────────────── */
const BOAS_VINDAS_KEY = "ieq_boasvindas_visto";

/* ─── CSS estático ──────────────────────────────────────────────────── */
const STATIC_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* Tipografia (idêntica ao Login) */
  .ieq-root {
    font-family: 'Manrope', sans-serif;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
    padding-bottom: 80px;
    transition: background .4s;
  }

  /* Grade decorativa */
  .grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(253,184,19,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(253,184,19,.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .glow-red {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 900px; height: 900px; border-radius: 50%;
    background: radial-gradient(circle, rgba(200,16,46,.10) 0%, transparent 68%);
    pointer-events: none; z-index: 0;
  }
  .glow-blue {
    position: fixed; top: 20%; right: 5%;
    width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,61,165,.08) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  /* Conteúdo */
  .ieq-content {
    position: relative; z-index: 10;
    max-width: 1200px; margin: 0 auto;
    padding: 32px 24px 0;
  }

  /* ── Header ── */
  .ieq-header {
    display: flex; align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
    flex-wrap: wrap; gap: 16px;
  }

  /* Badge (idêntico ao Login) */
  .badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(253,184,19,.07);
    border: 1px solid rgba(253,184,19,.22);
    border-radius: 100px; padding: 5px 14px;
    font-size: 11px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    color: #FDB813; font-family: 'Manrope', sans-serif;
  }
  .badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #FDB813;
    animation: pulse 2s ease-in-out infinite;
  }

  /* Avatar líder */
  .lider-avatar-wrap {
    position: relative;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .pulse-ring {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(200,16,46,.3);
    animation: pulse 3s ease-in-out infinite;
  }
  .lider-avatar {
    width: 56px; height: 56px; border-radius: 50%;
    border: 1px solid rgba(200,16,46,.25);
    overflow: hidden; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .lider-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

  /* ── Botões (idênticos ao Login) ── */
  .btn-primary {
    border: none; border-radius: 6px; cursor: pointer;
    font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: .2em; text-transform: uppercase; color: #fff;
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 20px;
    transition: opacity .2s, transform .2s, box-shadow .2s;
    background: linear-gradient(135deg, #9B0B1E, #C8102E);
  }
  .btn-primary:hover:not(:disabled) {
    opacity: .88; transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(200,16,46,.35);
  }
  .btn-primary:disabled { opacity: .45; cursor: not-allowed; }
  .btn-blue {
    border: none; border-radius: 6px; cursor: pointer;
    font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: .2em; text-transform: uppercase; color: #fff;
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 20px;
    transition: opacity .2s, transform .2s, box-shadow .2s;
    background: linear-gradient(135deg, #002470, #003DA5);
  }
  .btn-blue:hover:not(:disabled) {
    opacity: .88; transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(0,61,165,.35);
  }
  .btn-ghost-dark {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(200,16,46,.2);
    color: #F5F0EB;
    border-radius: 6px; cursor: pointer;
    font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 700;
    letter-spacing: .15em; text-transform: uppercase;
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 11px 16px; transition: all .25s;
  }
  .btn-ghost-dark:hover { border-color: #C8102E; background: rgba(200,16,46,.1); }
  .btn-ghost-light {
    background: rgba(200,16,46,.06);
    border: 1px solid rgba(200,16,46,.18);
    color: #9B0B1E;
    border-radius: 6px; cursor: pointer;
    font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 700;
    letter-spacing: .15em; text-transform: uppercase;
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 11px 16px; transition: all .25s;
  }
  .btn-ghost-light:hover { border-color: #C8102E; background: rgba(200,16,46,.12); }

  /* ── Cards ── */
  .card-dark {
    background: rgba(26,20,22,.96);
    border: 1px solid rgba(253,184,19,.13);
    border-radius: 12px;
    backdrop-filter: blur(24px);
    box-shadow: 0 2px 1px rgba(0,0,0,.04), 0 8px 32px rgba(0,0,0,.18),
                0 0 0 1px rgba(253,184,19,.07);
  }
  .card-light {
    background: rgba(255,255,255,.96);
    border: 1px solid rgba(200,16,46,.15);
    border-radius: 12px;
    backdrop-filter: blur(24px);
    box-shadow: 0 2px 1px rgba(0,0,0,.02), 0 8px 32px rgba(0,0,0,.08),
                0 0 0 1px rgba(200,16,46,.06);
  }

  /* ── KPI hero ── */
  .kpi-hero-dark {
    background: linear-gradient(135deg, #1A1416, #0A0608);
    border: 1px solid rgba(253,184,19,.13);
    border-radius: 12px; position: relative; overflow: hidden;
    padding: 36px 40px;
  }
  .kpi-hero-light {
    background: linear-gradient(135deg, #003DA5, #002470);
    border: none;
    border-radius: 12px; position: relative; overflow: hidden;
    padding: 36px 40px;
  }
  .kpi-hero-stripes {
    position: absolute; inset: 0; pointer-events: none;
    background-image: repeating-linear-gradient(
      -55deg, rgba(255,255,255,.03) 0 10px,
      transparent 10px 20px
    );
    background-size: 40px 40px;
  }

  /* ── Separador decorativo (idêntico ao Login) ── */
  .section-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 8px 0 28px;
  }
  .section-divider::before, .section-divider::after {
    content: ""; flex: 1; height: 1px;
  }
  .section-divider-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #FDB813;
  }

  /* ── Menu grid ── */
  .menu-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  @media (min-width: 640px) { .menu-grid { grid-template-columns: repeat(4, 1fr); } }
  @media (min-width: 900px) { .menu-grid { grid-template-columns: repeat(7, 1fr); } }

  .menu-card-dark {
    background: rgba(26,20,22,.96);
    border: 1px solid rgba(253,184,19,.10);
    border-radius: 10px; padding: 20px 12px;
    cursor: pointer;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    transition: all .3s; text-align: center;
  }
  .menu-card-light {
    background: rgba(255,255,255,.95);
    border: 1px solid rgba(200,16,46,.10);
    border-radius: 10px; padding: 20px 12px;
    cursor: pointer;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    transition: all .3s; text-align: center;
  }
  .menu-card-dark:hover, .menu-card-light:hover {
    transform: translateY(-5px);
    box-shadow: 0 14px 36px rgba(200,16,46,.15);
    border-color: #C8102E;
  }
  .menu-icon-wrap {
    width: 44px; height: 44px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .menu-title {
    font-family: 'Manrope', sans-serif;
    font-size: 10px; font-weight: 800;
    letter-spacing: .16em; text-transform: uppercase;
    margin: 0;
  }
  .menu-desc {
    font-family: 'Manrope', sans-serif;
    font-size: 8.5px; letter-spacing: .12em;
    text-transform: uppercase; margin: 0;
  }

  /* ── KPI grid ── */
  .kpi-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
  @media (max-width: 640px) { .kpi-grid { grid-template-columns: 1fr; } }

  /* ── Membros ── */
  .members-grid {
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }
  @media (max-width: 599px) { .members-grid { grid-template-columns: 1fr; } }

  .member-row-dark {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 14px;
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(253,184,19,.08);
    border-radius: 8px; transition: all .2s; gap: 8px;
  }
  .member-row-light {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 14px;
    background: rgba(200,16,46,.03);
    border: 1px solid rgba(200,16,46,.08);
    border-radius: 8px; transition: all .2s; gap: 8px;
  }
  .member-row-dark:hover, .member-row-light:hover { border-color: #C8102E; }

  .member-avatar {
    width: 34px; height: 34px; border-radius: 6px; flex-shrink: 0;
    background: linear-gradient(135deg, #9B0B1E, #003DA5);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-family: 'Manrope', sans-serif;
    font-weight: 800; font-size: 13px;
  }
  .member-name {
    font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 500;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  /* ── Inputs (idênticos ao Login) ── */
  .ieq-input {
    width: 100%;
    border-radius: 6px; outline: none;
    font-size: 14px; font-family: 'Manrope', sans-serif;
    padding: 13px 13px 13px 43px;
    transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .ieq-input-dark {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(253,184,19,.12);
    color: #F5F0EB;
  }
  .ieq-input-light {
    background: rgba(0,0,0,.03);
    border: 1px solid rgba(200,16,46,.14);
    color: #0A0608;
  }
  .ieq-input:focus {
    border-color: #C8102E;
    box-shadow: 0 0 0 3px rgba(200,16,46,.14);
  }
  .ieq-input-dark::placeholder { color: rgba(245,240,235,.22); }
  .ieq-input-light::placeholder { color: rgba(10,6,8,.22); }

  /* ── Progresso ── */
  .progress-track {
    height: 6px; border-radius: 99px; overflow: hidden;
  }
  .progress-track-dark  { background: rgba(255,255,255,.08); }
  .progress-track-light { background: rgba(255,255,255,.15); }

  /* ── Label de seção ── */
  .section-label {
    font-family: 'Manrope', sans-serif;
    font-size: 10px; font-weight: 800;
    letter-spacing: .2em; text-transform: uppercase;
  }

  /* ── Rodapé ── */
  .ieq-footer {
    text-align: center;
    font-family: 'Manrope', sans-serif;
    font-size: 10px; letter-spacing: .15em; text-transform: uppercase;
    padding: 8px 0;
  }

  /* ── Modal ── */
  .modal-backdrop {
    position: fixed; inset: 0; z-index: 50;
    display: flex; align-items: flex-end; justify-content: center;
  }
  @media (min-width: 520px) {
    .modal-backdrop { align-items: center; padding: 12px; }
  }
  .modal-box {
    position: relative; z-index: 10;
    width: 100%; max-height: 90vh;
    display: flex; flex-direction: column;
    border-radius: 16px 16px 0 0; overflow: hidden;
  }
  @media (min-width: 520px) {
    .modal-box { border-radius: 12px; max-height: calc(100vh - 24px); }
  }

  /* ── Alerta aprovação ── */
  .alert-aprovado {
    margin-bottom: 28px; padding: 16px 24px; border-radius: 10px;
    background: linear-gradient(135deg, #003DA5, #002470);
    color: #fff; display: flex; align-items: center; gap: 12px;
    font-family: 'Manrope', sans-serif; font-size: 11px;
    font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
  }

  /* ── Animações ── */
  @keyframes pulse  { 0%,100%{opacity:.18;} 50%{opacity:.06;} }
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes tabIn  { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-7px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  .spin-icon { animation: spin 1s linear infinite; }
  .tab-in    { animation: tabIn .28s ease both; }
  .fade-up   { animation: fadeUp .5s ease both; }

  /* ── Divider ── */
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(200,16,46,.2), transparent);
    margin: 8px 0;
  }

  /* ── Mobile ── */
  @media (max-width: 599px) {
    .ieq-content { padding: 20px 14px 0 !important; }
    .kpi-hero-dark, .kpi-hero-light { padding: 24px 20px !important; }
    .big-number { font-size: 38px !important; }
    .header-actions { gap: 6px !important; }
    .header-actions button { padding: 9px 10px !important; }
  }
`;

/* ══════════════════════════════════════════════════════════════════════ */
export default function DashboardLider() {
  const [abaAtiva,               setAbaAtiva]               = useState("home");

  // Intercepta o botão voltar do celular (Android/PWA)
  useEffect(() => {
    if (abaAtiva !== "home") {
      window.history.pushState({ aba: abaAtiva }, "");
    }

    const handlePopState = () => {
      setAbaAtiva("home");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [abaAtiva]);
  const [celula,                 setCelula]                 = useState(null);
  const [membros,                setMembros]                = useState([]);
  const [usuarioLogado,          setUsuarioLogado]          = useState(null);
  const [loading,                setLoading]                = useState(true);
  const [showModalAddMembro,     setShowModalAddMembro]     = useState(false);
  const [showModalMultiplicacao, setShowModalMultiplicacao] = useState(false);
  const [motivoMultiplicacao,    setMotivoMultiplicacao]    = useState("");
  const [solicitandoMulti,       setSolicitandoMulti]       = useState(false);
  const [isDark,                 setIsDark]                 = useState(
      () => localStorage.getItem("theme") === "dark"
  );
  const [showBoasVindas,         setShowBoasVindas]         = useState(false);

  const dark = isDark;

  /* cores contextuais */
  const bg          = dark ? BRAND.dark  : BRAND.light;
  const cardClass   = dark ? "card-dark" : "card-light";
  const txtPrimary  = dark ? BRAND.light : BRAND.dark;
  const txtSub      = dark ? "rgba(245,240,235,.5)" : "rgba(10,6,8,.45)";
  const btnGhost    = dark ? "btn-ghost-dark" : "btn-ghost-light";
  const inputClass  = dark ? "ieq-input ieq-input-dark" : "ieq-input ieq-input-light";
  const memberRow   = dark ? "member-row-dark" : "member-row-light";
  const menuCard    = dark ? "menu-card-dark" : "menu-card-light";

  useEffect(() => { localStorage.setItem("theme", dark ? "dark" : "light"); }, [dark]);

  const handleLogout = () => { localStorage.clear(); window.location.href = "/login"; };

  const fecharBoasVindas = () => {
    const hoje = new Date().toISOString().substring(0, 10);
    localStorage.setItem(BOAS_VINDAS_KEY, hoje);
    setShowBoasVindas(false);
  };

  const carregarDados = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [resCelula, resUsuario] = await Promise.all([
        api.get("/celulas/minha-celula"),
        api.get("/usuarios/me"),
      ]);
      const celulaData = resCelula.data;
      setCelula(celulaData);
      setUsuarioLogado(resUsuario.data);
      if (celulaData?.id) {
        const resM = await api.get(`/celulas/${celulaData.id}/membros`);
        const unique = arr => arr.filter((item, i, self) => i === self.findIndex(t => t.id === item.id));
        setMembros(unique(resM.data || []));
      }
      if (!isSilent) {
        const hoje    = new Date().toISOString().substring(0, 10);
        const vistoEm = localStorage.getItem(BOAS_VINDAS_KEY);
        if (vistoEm !== hoje) setShowBoasVindas(true);
      }
    } catch (err) { console.error("Erro ao carregar dashboard:", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(() => carregarDados(true), 120_000);
    return () => clearInterval(interval);
  }, [carregarDados]);

  const removerMembro = async (membroId, nome) => {
    if (!window.confirm(`Remover ${nome} da célula?`)) return;
    try {
      await api.delete(`/celulas/${celula.id}/membros/${membroId}`);
      setMembros(prev => prev.filter(m => m.id !== membroId));
    } catch (err) { alert(err.response?.data?.message || "Erro ao remover."); }
  };

  const solicitarMultiplicacao = async () => {
    if (!motivoMultiplicacao.trim()) return alert("O motivo é obrigatório.");
    setSolicitandoMulti(true);
    try {
      await api.post(`/celulas/${celula.id}/solicitar-multiplicacao`, { motivo: motivoMultiplicacao.trim() });
      alert("Solicitação enviada com sucesso!");
      setShowModalMultiplicacao(false);
      setMotivoMultiplicacao("");
      carregarDados();
    } catch (err) { alert(err.response?.data?.message || "Erro ao enviar solicitação."); }
    finally { setSolicitandoMulti(false); }
  };

  const { qtdMembros, atingiuMeta, isAnalise, isAprovado, podeSolicitar, porcentagemMeta } = useMemo(() => {
    const qtdMembros      = membros.length;
    const atingiuMeta     = qtdMembros >= 8;
    const statusMulti     = celula?.statusMultiplicacao || "NORMAL";
    const isAnalise       = atingiuMeta && statusMulti === "EM_ANALISE";
    const isAprovado      = atingiuMeta && statusMulti === "APROVADO";
    const podeSolicitar   = atingiuMeta && !isAnalise;
    const porcentagemMeta = Math.min((qtdMembros / 8) * 100, 100);
    return { qtdMembros, atingiuMeta, isAnalise, isAprovado, podeSolicitar, porcentagemMeta };
  }, [membros, celula]);

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (loading) return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
        <style>{STATIC_CSS}</style>
        <div className="grid-bg" />
        <div className="glow-red" />
        <div style={{ textAlign: "center", position: "relative", zIndex: 10 }}>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <div className="pulse-ring" style={{ width: 80, height: 80 }} />
            <div className="pulse-ring" style={{ width: 64, height: 64, animationDelay: "1s" }} />
            <div style={{
              width: 54, height: 54, borderRadius: "50%",
              background: dark ? "rgba(26,20,22,.9)" : "#fff",
              border: "1px solid rgba(200,16,46,.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <IEQCross size={38} />
            </div>
          </div>
          <p style={{
            fontFamily: "'Manrope', sans-serif", fontSize: 10, fontWeight: 800,
            letterSpacing: ".25em", textTransform: "uppercase",
            color: dark ? BRAND.light : BRAND.redDark,
          }}>CARREGANDO...</p>
        </div>
      </div>
  );

  /* ── RENDER PRINCIPAL ─────────────────────────────────────────────── */
  return (
      <div className="ieq-root" style={{ background: bg, color: txtPrimary }}>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
        ${STATIC_CSS}
      `}</style>

        {/* Fundo */}
        <div className="grid-bg" />
        <div className="glow-red" />
        <div className="glow-blue" />

        {/* Boas-vindas */}
        <AnimatePresence>
          {showBoasVindas && !loading && (
              <BoasVindasLider
                  usuarioLogado={usuarioLogado}
                  celula={celula}
                  isDark={isDark}
                  onClose={fecharBoasVindas}
              />
          )}
        </AnimatePresence>

        <div className="ieq-content">

          {/* ── HEADER ─────────────────────────────────────────────── */}
          <motion.header
              className="ieq-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .45 }}
          >
            {/* Identidade */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 0, flex: 1 }}>
              {/* Avatar com anel pulsante (idêntico ao Login) */}
              <div className="lider-avatar-wrap" style={{ flexShrink: 0 }}>
                <div className="pulse-ring" style={{ width: 76, height: 76 }} />
                <div className="pulse-ring" style={{ width: 62, height: 62, animationDelay: "1s" }} />
                <div className="lider-avatar" style={{ background: dark ? "rgba(26,20,22,.9)" : "#fff" }}>
                  {usuarioLogado?.fotoPerfil
                      ? <img src={usuarioLogado.fotoPerfil} alt={usuarioLogado.nome || "Líder"} />
                      : <IEQCross size={38} />
                  }
                </div>
              </div>

              <div style={{ minWidth: 0 }}>
                {/* Título Playfair (idêntico ao Login) */}
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(22px, 4vw, 28px)",
                  fontWeight: 700, lineHeight: 1.1,
                  letterSpacing: "-.02em",
                  color: txtPrimary, margin: 0,
                }}>
                  Sua Igreja,{" "}
                  <span style={{ color: BRAND.yellow }}>Bem Administrada.</span>
                </h1>
                <p style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: ".18em", textTransform: "uppercase",
                  color: txtSub, margin: "4px 0 0",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  Célula {celula?.nome?.toUpperCase() || "?"} — Painel do Líder
                </p>
                {usuarioLogado?.nome && (
                    <p style={{
                      fontFamily: "'Manrope', sans-serif", fontSize: 13,
                      color: dark ? "rgba(245,240,235,.55)" : "rgba(10,6,8,.5)",
                      margin: "3px 0 0", fontStyle: "italic",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {usuarioLogado.nome}
                    </p>
                )}
              </div>
            </div>

            {/* Ações do header */}
            <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <SinoAniversariantes isDark={isDark} celulaId={celula?.id} />
              <button className={btnGhost} onClick={() => setIsDark(!isDark)} style={{ padding: "10px 12px" }}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className={btnGhost} onClick={() => setShowBoasVindas(true)} style={{ padding: "10px 12px" }} title="Ver boas-vindas">
                <Sparkles size={18} />
              </button>
              {abaAtiva !== "home" && (
                  <button className={btnGhost} onClick={() => setAbaAtiva("home")}>← Voltar</button>
              )}
              <button className="btn-primary" onClick={handleLogout} style={{ gap: 7 }}>
                <LogOut size={14} /> Sair
              </button>
            </div>
          </motion.header>

          {/* Separador decorativo (idêntico ao Login) */}
          <div className="section-divider">
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${BRAND.yellow})` }} />
            <div className="section-divider-dot" />
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${BRAND.yellow})` }} />
          </div>

          {/* Badge sistema */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <span className="badge">
            <span className="badge-dot" />
            Sistema Exclusivo IEQ Pituaçu
          </span>
          </div>

          {/* ── ALERTA APROVAÇÃO ────────────────────────────────────── */}
          <AnimatePresence>
            {isAprovado && (
                <motion.div
                    className="alert-aprovado"
                    initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                >
                  <Sparkles size={18} style={{ color: BRAND.yellow, flexShrink: 0 }} />
                  Multiplicação aprovada! Organize os membros para a nova célula.
                </motion.div>
            )}
          </AnimatePresence>

          {/* ── CONTEÚDO POR ABA ────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {abaAtiva === "home" ? (

                <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: .15 } }}
                    transition={{ duration: .4, staggerChildren: .07 }}
                    style={{ display: "flex", flexDirection: "column", gap: 24 }}
                >

                  {/* ── KPI GRID ─────────────────────────────────────── */}
                  <div className="kpi-grid">

                    {/* Card hero membros */}
                    <div className={dark ? "kpi-hero-dark" : "kpi-hero-light"}>
                      <div className="kpi-hero-stripes" />
                      <div style={{ position: "relative", zIndex: 1 }}>
                    <span className="badge" style={{ marginBottom: 20, display: "inline-flex" }}>
                      <TrendingUp size={10} /> Indicadores de Crescimento
                    </span>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
                          <div>
                            <p className="big-number" style={{
                              fontFamily: "'Playfair Display', serif",
                              fontSize: 58, fontWeight: 700, color: "#fff",
                              margin: 0, lineHeight: 1,
                            }}>
                              {qtdMembros}
                            </p>
                            <p style={{
                              fontFamily: "'Manrope', sans-serif", fontSize: 10,
                              fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase",
                              color: "rgba(255,255,255,.6)", marginTop: 6,
                            }}>
                              Membros Ativos
                            </p>
                            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 10, maxWidth: 260, lineHeight: 1.55 }}>
                              {!atingiuMeta
                                  ? `Faltam ${8 - qtdMembros} membros para a meta de multiplicação.`
                                  : isAnalise  ? "Aguardando parecer do seu pastor..."
                                      : isAprovado ? "Sua célula está autorizada a multiplicar."
                                          :              "Meta de 8 membros atingida! Solicite a multiplicação."}
                            </p>
                          </div>
                          <div style={{ minWidth: 160, flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Manrope', sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", marginBottom: 8 }}>
                              <span>{atingiuMeta ? "Meta Concluída" : "Progresso"}</span>
                              <span>{Math.round(porcentagemMeta)}%</span>
                            </div>
                            <div className={`progress-track ${dark ? "progress-track-dark" : "progress-track-light"}`}>
                              <motion.div
                                  initial={{ width: 0 }} animate={{ width: `${porcentagemMeta}%` }}
                                  transition={{ duration: 1.2, ease: "easeOut" }}
                                  style={{ height: "100%", borderRadius: 99, background: atingiuMeta ? BRAND.yellow : `linear-gradient(90deg, ${BRAND.red}, ${BRAND.yellow})` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card ação pastoral */}
                    <div className={cardClass} style={{ padding: 30, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{
                          width: 48, height: 48, borderRadius: 10, marginBottom: 18,
                          background: isAprovado ? "rgba(0,61,165,.12)" : isAnalise ? "rgba(253,184,19,.12)" : "rgba(200,16,46,.1)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: isAprovado ? BRAND.blue : isAnalise ? BRAND.yellowDark : BRAND.red,
                        }}>
                          {isAprovado ? <CheckCircle2 size={22} /> : isAnalise ? <Loader2 size={22} className="spin-icon" /> : <Target size={22} />}
                        </div>
                        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: txtPrimary, margin: 0 }}>
                          Ação Pastoral
                        </p>
                        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: txtSub, marginTop: 4 }}>
                          {isAnalise ? "Em análise" : isAprovado ? "Liberado" : atingiuMeta ? "Pode solicitar" : "Aguardando meta"}
                        </p>
                      </div>
                      <div style={{ marginTop: 20 }}>
                        {isAnalise ? (
                            <div style={{
                              padding: "13px 0", textAlign: "center",
                              fontFamily: "'Manrope', sans-serif", fontSize: 9.5, fontWeight: 800,
                              letterSpacing: ".15em", textTransform: "uppercase",
                              color: BRAND.yellowDark,
                              background: "rgba(253,184,19,.1)",
                              border: "1px solid rgba(253,184,19,.3)",
                              borderRadius: 6,
                            }}>
                              Consultando Pastor...
                            </div>
                        ) : podeSolicitar ? (
                            <button className="btn-blue" style={{ width: "100%" }} onClick={() => setShowModalMultiplicacao(true)}>
                              {isAprovado ? "Nova Solicitação" : "Solicitar Mult."}
                            </button>
                        ) : (
                            <button className={btnGhost} style={{ width: "100%" }} onClick={() => setAbaAtiva("relatorio")}>
                              Lançar Relatório
                            </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── MENU ─────────────────────────────────────────── */}
                  <div className="menu-grid">
                    {[
                      { icon: <Target    size={20} />, title: "Metas",       desc: "Objetivos",   aba: "metas",       color: BRAND.red      },
                      { icon: <Target    size={20} />, title: "Discipulado", desc: "Acompanhar",  aba: "discipulado", color: BRAND.blue     },
                      { icon: <TrendingUp size={20} />, title: "Frequência",  desc: "Relatórios",  aba: "relatorio",   color: BRAND.red      },
                      { icon: <Plus      size={20} />, title: "Fichas",      desc: "Secretaria",  aba: "fichas",      color: BRAND.redDark  },
                      { icon: <Users     size={20} />, title: "Visitantes",  desc: "Novas Vidas", aba: "visitantes",  color: BRAND.yellow   },
                      { icon: <Home      size={20} />, title: "Casas de Paz",desc: "Evangelismo", aba: "casas",       color: BRAND.blue     },
                      { icon: <Flame     size={20} />, title: "Missão 70",   desc: "Evangelismo", aba: "missao70",    color: BRAND.yellow   },
                    ].map(({ icon, title, desc, aba, color }) => (
                        <motion.div
                            key={aba}
                            className={menuCard}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: .96 }}
                            onClick={() => setAbaAtiva(aba)}
                        >
                          <div className="menu-icon-wrap" style={{ background: `${color}18`, color }}>
                            {icon}
                          </div>
                          <div>
                            <p className="menu-title" style={{ color: txtPrimary }}>{title}</p>
                            <p className="menu-desc" style={{ color: txtSub }}>{desc}</p>
                          </div>
                        </motion.div>
                    ))}
                  </div>

                  {/* ── MEMBROS ──────────────────────────────────────── */}
                  <div className={cardClass} style={{ overflow: "hidden" }}>
                    {/* Cabeçalho */}
                    <div style={{
                      padding: "24px 28px",
                      borderBottom: `1px solid ${dark ? "rgba(253,184,19,.1)" : "rgba(200,16,46,.1)"}`,
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between", flexWrap: "wrap", gap: 12,
                    }}>
                      <div>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: txtPrimary, margin: 0 }}>
                          Membros da Célula
                        </h3>
                        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: txtSub, margin: "4px 0 0" }}>
                          {membros.length} ativos
                        </p>
                      </div>
                      <button className="btn-primary" onClick={() => setShowModalAddMembro(true)} style={{ gap: 7 }}>
                        <Plus size={14} /> Novo Membro
                      </button>
                    </div>

                    {/* Lista */}
                    <div className="members-grid">
                      {membros.map(m => (
                          <div key={m.id} className={memberRow}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                              <div className="member-avatar">{m.nome?.charAt(0).toUpperCase()}</div>
                              <span className="member-name" style={{ color: txtPrimary }}>{m.nome}</span>
                            </div>
                            <button
                                onClick={() => removerMembro(m.id, m.nome)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: txtSub, padding: 6, borderRadius: 6, transition: "color .2s", flexShrink: 0 }}
                                onMouseEnter={e => e.currentTarget.style.color = BRAND.red}
                                onMouseLeave={e => e.currentTarget.style.color = txtSub}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>

                  <HistoricoRelatorios celulaId={celula?.id} />

                  <div className="divider" />
                  <p className="ieq-footer" style={{ color: dark ? "rgba(245,240,235,.15)" : "rgba(10,6,8,.18)" }}>
                    © {new Date().getFullYear()} IEQ Pituaçu — Sistema Eclesiástico
                  </p>
                </motion.div>

            ) : (
                <motion.div
                    key="content"
                    className="tab-in"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: .15 } }}
                >
                  {abaAtiva === "metas"       && <TelaMetasLider        celula={celula}       isDark={isDark} />}
                  {abaAtiva === "relatorio"   && <TelaRelatorio          celula={celula}       isDark={isDark} />}
                  {abaAtiva === "discipulado" && <RelatorioDiscipulado   membros={membros}     isDark={isDark} />}
                  {abaAtiva === "visitantes"  && <TelaVisitantes         celulaId={celula?.id} isDark={isDark} />}
                  {abaAtiva === "fichas"      && <TelaFichas             celula={celula}       isDark={isDark} />}
                  {abaAtiva === "casas"       && <CasasDePazLider        celulaId={celula?.id} isDark={isDark} />}
                  {abaAtiva === "missao70"    && <Missao70Lider          celulaId={celula?.id} isDark={isDark} />}
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── MODAIS ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showModalAddMembro && (
              <div className="modal-backdrop">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowModalAddMembro(false)}
                    style={{ position: "fixed", inset: 0, background: "rgba(10,6,8,.85)", backdropFilter: "blur(16px)", zIndex: 0 }}
                />
                <motion.div
                    initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
                    className={`${cardClass} modal-box`} style={{ maxWidth: 480 }}
                >
                  <ModalBuscarMembro
                      celulaId={celula?.id}
                      isDark={isDark}
                      txtPrimary={txtPrimary}
                      txtSub={txtSub}
                      onClose={() => { setShowModalAddMembro(false); carregarDados(); }}
                  />
                </motion.div>
              </div>
          )}

          {showModalMultiplicacao && (
              <div className="modal-backdrop">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: "fixed", inset: 0, background: "rgba(10,6,8,.85)", backdropFilter: "blur(16px)", zIndex: 0 }}
                />
                <motion.div
                    initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
                    className={`${cardClass} modal-box`}
                    style={{ maxWidth: 440, padding: "36px 28px", overflowY: "auto" }}
                >
                  {/* Topo modal */}
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                      <div className="pulse-ring" style={{ width: 72, height: 72 }} />
                      <div className="pulse-ring" style={{ width: 58, height: 58, animationDelay: "1s" }} />
                      <div style={{
                        width: 50, height: 50, borderRadius: "50%",
                        background: dark ? "rgba(26,20,22,.9)" : "#fff",
                        border: "1px solid rgba(200,16,46,.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <IEQCross size={34} />
                      </div>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: txtPrimary, margin: "0 0 8px" }}>
                      Plano de Multiplicação
                    </h2>
                    <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: txtSub }}>
                      Informe o novo líder e o local da nova célula.
                    </p>
                  </div>

                  <div className="divider" style={{ marginBottom: 20 }} />

                  <textarea
                      className={`${dark ? "ieq-input ieq-input-dark" : "ieq-input ieq-input-light"}`}
                      style={{ minHeight: 110, resize: "vertical", paddingLeft: 16 }}
                      placeholder="Ex: Novo líder será o João, anfitriã Maria..."
                      value={motivoMultiplicacao}
                      onChange={e => setMotivoMultiplicacao(e.target.value)}
                  />

                  <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                    <button className={dark ? "btn-ghost-dark" : "btn-ghost-light"} style={{ flex: 1 }} onClick={() => setShowModalMultiplicacao(false)}>
                      Cancelar
                    </button>
                    <button className="btn-blue" style={{ flex: 2 }} onClick={solicitarMultiplicacao} disabled={solicitandoMulti}>
                      {solicitandoMulti ? <Loader2 size={16} className="spin-icon" /> : "Enviar Plano"}
                    </button>
                  </div>
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </div>
  );
}

/* ── Modal Buscar Membro ──────────────────────────────────────────────── */
function ModalBuscarMembro({ celulaId, onClose, isDark, txtPrimary, txtSub }) {
  const [busca,      setBusca]      = useState("");
  const [membrosSem, setMembrosSem] = useState([]);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/membros/sem-celula");
        setMembrosSem(Array.isArray(res.data) ? res.data : []);
      } finally { setLoading(false); }
    })();
  }, []);

  const vincular = async id => {
    try { await api.post(`/celulas/${celulaId}/membros/${id}`); onClose(); }
    catch { alert("Erro ao vincular."); }
  };

  const filtrados = useMemo(() =>
          membrosSem.filter(m => m.nome?.toLowerCase().includes(busca.toLowerCase())),
      [membrosSem, busca]
  );

  return (
      <div style={{ padding: "22px 20px", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        {/* Cabeçalho */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexShrink: 0 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: txtPrimary, margin: 0 }}>
            Vincular Membro
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: txtSub, padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Campo busca */}
        <div style={{ position: "relative", marginBottom: 14, flexShrink: 0 }}>
          <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: BRAND.red, opacity: .6 }} />
          <input
              className={`ieq-input ${isDark ? "ieq-input-dark" : "ieq-input-light"}`}
              placeholder="Buscar por nome..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
          />
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
          {loading ? (
              <div style={{ textAlign: "center", paddingTop: 28 }}>
                <Loader2 size={26} style={{ animation: "spin 1s linear infinite", color: BRAND.red }} />
              </div>
          ) : filtrados.length > 0 ? filtrados.map(m => (
              <div
                  key={m.id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 12px", gap: 8,
                    background: isDark ? "rgba(255,255,255,.03)" : "rgba(200,16,46,.04)",
                    border: `1px solid ${isDark ? "rgba(253,184,19,.08)" : "rgba(200,16,46,.08)"}`,
                    borderRadius: 8, flexShrink: 0, transition: "border-color .2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = BRAND.red}
                  onMouseLeave={e => e.currentTarget.style.borderColor = isDark ? "rgba(253,184,19,.08)" : "rgba(200,16,46,.08)"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 6, flexShrink: 0,
                    background: `linear-gradient(135deg, ${BRAND.redDark}, ${BRAND.blue})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 12,
                  }}>
                    {m.nome?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: txtPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {m.nome}
              </span>
                </div>
                <button className="btn-primary" style={{ fontSize: 9, padding: "7px 13px", letterSpacing: ".1em", flexShrink: 0 }} onClick={() => vincular(m.id)}>
                  Vincular
                </button>
              </div>
          )) : (
              <p style={{ textAlign: "center", paddingTop: 28, fontFamily: "'Manrope', sans-serif", fontStyle: "italic", color: txtSub }}>
                Nenhum membro encontrado.
              </p>
          )}
        </div>
      </div>
  );
}
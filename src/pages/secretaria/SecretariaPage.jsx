import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users, UserPlus, Home, FileText, Building2,
  Sun, Moon, LogOut, ChevronRight, ClipboardList, Droplets,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import { getFotoUrl } from "../../utils/foto.js";

import Membros           from "./Membros";
import Celulas           from "./Celulas";
import Visitantes        from "./Visitante";
import FichasEncontro    from "./FichasEncontro";
import SecretariaCelulas from "./SecretariaCelulas";
import AprovacaoFichasMembro from "./AprovacaoFichasMembro";
import FichasConvertido from "./FichasConvertido";
import BoasVindas            from "../../components/BoasVindas.jsx";

/* ─── Tokens ──────────────────────────────────────────────────────── */
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
    bg:          isDark ? "#07070C"               : "#FAF8F4",
    bgEl:        isDark ? "rgba(18,18,26,.97)"     : "#D8D4CC",
    bgInput:     isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.10)"  : "rgba(201,169,110,.35)",
    borderInput: isDark ? "rgba(201,169,110,.15)"  : "rgba(201,169,110,.28)",
    text:        isDark ? "#F5F0E8"                : "#1A1008",
    textSec:     isDark ? "#9A9588"                : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"                : "#9A9080",
    gold:        isDark ? "#C9A96E"                : "#3D3218",
    goldSoft:    isDark ? "rgba(201,169,110,.06)"  : "rgba(61,50,24,.08)",
    goldHover:   isDark ? "rgba(201,169,110,.12)"  : "rgba(61,50,24,.14)",
    glow1:       isDark ? "rgba(201,169,110,.07)"  : "rgba(201,169,110,.10)",
    glow2:       isDark ? "rgba(201,169,110,.05)"  : "rgba(201,169,110,.08)",
    glow3:       isDark ? "rgba(155,11,30,.03)"    : "rgba(0,61,165,.04)",
    headerBg:    isDark ? "rgba(7,7,12,.92)"       : "rgba(247,243,238,.92)",
    placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
  };
}

/* ─── Menu items ─────────────────────────────────────────────────── */
const MENU_ITEMS = [
  { icon: Users,           name: "Membros",      desc: "Gestão",        aba: "MEMBROS",            color: AURA.blue },
  { icon: UserPlus,        name: "Visitantes",   desc: "Novas Vidas",   aba: "VISITANTES",         color: AURA.red },
  { icon: Home,            name: "Células",      desc: "Grupos",        aba: "CELULAS",            color: "#059669" },
  { icon: FileText,        name: "Fichas",       desc: "Encontro",      aba: "FICHAS",             color: AURA.yellow },
  { icon: Building2,       name: "Secretaria",   desc: "Controle",      aba: "SECRETARIACELULAS",  color: "#7090e8" },
  { icon: ClipboardList,   name: "Aprov. Fichas",desc: "Membros",       aba: "APROVACAO_FICHAS",   color: AURA.red, badgeKey: "APROVACAO_FICHAS" },
  { icon: Droplets,        name: "Convertidos",  desc: "Novas Vidas",   aba: "FICHAS_CONVERTIDO",  color: "#059669", badgeKey: "FICHAS_CONVERTIDO" },
];

const PAGE_TITLES = {
  "MEMBROS":            "Membros",
  "VISITANTES":         "Visitantes",
  "CELULAS":            "Células",
  "FICHAS":             "Fichas de Encontro",
  "SECRETARIACELULAS":  "Secretaria de Células",
  "APROVACAO_FICHAS":   "Aprovação de Fichas",
  "FICHAS_CONVERTIDO":  "Convertidos",
};

/* ─── CSS Global ─────────────────────────────────────────────────── */
function GlobalStyles({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      *, *::before, *::after { box-sizing: border-box; }

      @keyframes sec-spin   { to { transform: rotate(360deg); } }
      @keyframes sec-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      @keyframes sec-badge  { 0%,100%{transform:scale(1);} 50%{transform:scale(1.15);} }

      .sec-root {
        font-family: 'Inter', sans-serif;
        background: ${t.bg};
        color: ${t.text};
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow-x: hidden;
        transition: background .4s, color .3s;
        isolation: isolate;
      }

      .sec-root::before {
        content: "";
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background: radial-gradient(ellipse at center, transparent 40%, ${isDark ? "rgba(0,0,0,.35)" : "rgba(0,0,0,.06)"} 100%);
        transition: background .4s;
      }

      .sec-glow {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 10% -5%, ${t.glow1} 0%, transparent 45%),
          radial-gradient(ellipse at 90% 105%, ${t.glow2} 0%, transparent 45%),
          radial-gradient(ellipse at 50% 50%, ${t.glow3} 0%, transparent 60%);
        transition: background .4s;
      }

      /* ── HEADER ── */
      .sec-header {
        position: sticky; top: 0; z-index: 50;
        background: ${t.headerBg};
        border-bottom: 1px solid ${isDark ? "rgba(201,169,110,.12)" : "rgba(201,169,110,.18)"};
        backdrop-filter: blur(32px) saturate(1.4);
        -webkit-backdrop-filter: blur(32px) saturate(1.4);
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 16px; height: 60px; gap: 10px;
        transition: background .4s, border-color .3s;
        box-shadow: 0 1px 0 ${isDark ? "rgba(201,169,110,.06)" : "rgba(201,169,110,.08)"};
      }
      @media(min-width:480px) { .sec-header { padding: 0 20px; height: 64px; } }

      .sec-header-line {
        height: 2px; position: sticky; top: 60px; z-index: 49;
        background: linear-gradient(90deg, ${AURA.redDark}, ${AURA.red}, ${AURA.yellow}, ${AURA.blue}, transparent);
        flex-shrink: 0; opacity: .85;
      }
      @media(min-width:480px) { .sec-header-line { top: 64px; } }

      .sec-hdr-left  { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; overflow: hidden; }
      .sec-hdr-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
      @media(min-width:480px) { .sec-hdr-right { gap: 8px; } }

      .sec-avatar-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .sec-ring {
        position: absolute; border-radius: 50%;
        border: 1px solid rgba(201,169,110,.18);
        top: 50%; left: 50%; transform: translate(-50%,-50%);
      }
      .sec-avatar {
        width: 38px; height: 38px; border-radius: 50%;
        border: 1.5px solid rgba(201,169,110,.30);
        background: ${isDark ? "rgba(14,14,22,.98)" : "#fff"};
        display: flex; align-items: center; justify-content: center; overflow: hidden;
        position: relative; z-index: 1;
        font-family: 'Playfair Display', serif; font-weight: 600; font-size: 15px; color: ${t.gold};
        flex-shrink: 0;
        box-shadow: 0 2px 10px ${isDark ? "rgba(201,169,110,.12)" : "rgba(201,169,110,.15)"};
      }
      .sec-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      @media(min-width:480px) { .sec-avatar { width: 44px; height: 44px; font-size: 16px; } }

      .sec-title-block { min-width: 0; overflow: hidden; }
      .sec-eyebrow {
        font-size: 8px; font-weight: 500; letter-spacing: .2em;
        text-transform: uppercase; color: ${isDark ? "rgba(201,169,110,.55)" : "#8B7A50"};
        margin: 0 0 1px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      @media(min-width:480px) { .sec-eyebrow { font-size: 9px; margin-bottom: 2px; } }
      .sec-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(14px, 3.5vw, 20px);
        font-weight: 500; color: ${t.text}; margin: 0; line-height: 1.2;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .sec-title span { color: ${t.gold}; }
      .sec-breadcrumb {
        display: flex; align-items: center; gap: 3px; margin-top: 2px;
        overflow: hidden;
      }
      .sec-breadcrumb-seg {
        font-size: 10px; font-weight: 400; color: ${t.textMuted};
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        flex-shrink: 1;
      }
      .sec-breadcrumb-seg.active { color: ${t.textSec}; font-weight: 500; flex-shrink: 0; }

      .sec-btn-ico {
        background: ${isDark ? "rgba(255,255,255,.03)" : "rgba(201,169,110,.05)"};
        border: 1px solid ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.14)"};
        border-radius: 10px; width: 34px; height: 34px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        color: ${t.textMuted}; transition: all .25s; flex-shrink: 0; position: relative;
        backdrop-filter: blur(8px);
      }
      .sec-btn-ico:hover { border-color: ${t.gold}; color: ${t.gold}; background: ${t.goldHover}; }
      @media(min-width:480px) { .sec-btn-ico { width: 38px; height: 38px; border-radius: 12px; } }

      .sec-btn-back {
        background: ${isDark ? "rgba(255,255,255,.03)" : "rgba(30,63,102,.05)"};
        border: 1px solid ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.14)"};
        border-radius: 10px; width: 34px; height: 34px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        color: ${t.textMuted}; transition: all .25s; flex-shrink: 0;
        backdrop-filter: blur(8px);
      }
      .sec-btn-back:hover { border-color: ${t.gold}; color: ${t.gold}; background: ${t.goldHover}; }
      @media(min-width:480px) { .sec-btn-back { width: 38px; height: 38px; border-radius: 12px; } }

      .sec-btn-exit {
        display: flex; align-items: center; gap: 6px;
        padding: 0 12px; height: 34px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
        transition: all .3s cubic-bezier(.4,0,.2,1);
        box-shadow: 0 4px 16px rgba(200,16,46,.22), 0 1px 3px rgba(200,16,46,.15);
        white-space: nowrap; flex-shrink: 0;
      }
      .sec-btn-exit:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,16,46,.30), 0 2px 4px rgba(200,16,46,.18); }
      @media(min-width:480px) { .sec-btn-exit { padding: 0 14px; height: 38px; } }
      .sec-btn-exit-label { display: none; }
      @media(min-width:400px) { .sec-btn-exit-label { display: inline; } }

      /* ── MENU GRID ── */
      .sec-menu-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 22px;
      }
      @media(min-width:480px) { .sec-menu-grid { grid-template-columns: repeat(4, 1fr); gap: 12px; } }
      @media(min-width:768px) { .sec-menu-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; } }

      .sec-menu-card {
        position: relative;
        background: ${t.bgEl};
        border: 1px solid ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.14)"};
        border-radius: 18px;
        padding: 16px 12px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 10px;
        overflow: hidden;
        transition: all .3s cubic-bezier(.4,0,.2,1);
        -webkit-tap-highlight-color: transparent;
        box-shadow: 0 1px 3px ${isDark ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.06)"}, 0 4px 12px ${isDark ? "rgba(0,0,0,.2)" : "rgba(0,0,0,.04)"};
      }
      .sec-menu-card::before {
        content: "";
        position: absolute; inset: 0;
        opacity: 0;
        transition: opacity .35s;
        border-radius: inherit;
      }
      .sec-menu-card::after {
        content: "";
        position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, ${isDark ? "rgba(201,169,110,.12)" : "rgba(201,169,110,.18)"}, transparent);
        opacity: 0; transition: opacity .35s;
      }
      .sec-menu-card:hover {
        transform: translateY(-4px);
        border-color: rgba(201,169,110,.28);
        box-shadow:
          0 8px 32px ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.12)"},
          0 2px 8px ${isDark ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.08)"};
      }
      .sec-menu-card:hover::before { opacity: .07; }
      .sec-menu-card:hover::after  { opacity: 1; }
      @media(min-width:480px) {
        .sec-menu-card { padding: 20px 14px; border-radius: 20px; }
      }

      .sec-menu-icon {
        width: 44px; height: 44px; border-radius: 14px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: transform .3s cubic-bezier(.4,0,.2,1);
      }
      .sec-menu-card:hover .sec-menu-icon { transform: scale(1.08); }

      .sec-menu-name {
        font-family: 'Inter', sans-serif;
        font-size: 12px; font-weight: 600; color: ${t.text}; margin: 0;
        line-height: 1.3;
      }
      .sec-menu-desc {
        font-family: 'Inter', sans-serif;
        font-size: 10px; color: ${t.textMuted}; margin: 0;
        line-height: 1.2;
      }

      .sec-menu-badge {
        position: absolute; top: 8px; right: 8px;
        background: ${AURA.red};
        color: #fff;
        font-size: 9px; font-weight: 700;
        padding: 2px 6px; border-radius: 99px;
        min-width: 18px; text-align: center;
        line-height: 1.3;
        animation: sec-badge 2s ease-in-out infinite;
      }

      /* ── MAIN ── */
      .sec-main { flex: 1; display: flex; flex-direction: column; position: relative; z-index: 1; }
      .sec-content {
        flex: 1; padding: 20px 14px 48px;
        max-width: 960px; margin: 0 auto; width: 100%;
      }
      @media(min-width:480px)  { .sec-content { padding: 24px 18px 48px; } }
      @media(min-width:540px)  { .sec-content { padding: 28px 24px 48px; } }
      @media(min-width:768px)  { .sec-content { padding: 36px 32px 56px; } }

      .sec-footer {
        text-align: center; font-size: 9px; font-weight: 500; letter-spacing: .18em;
        text-transform: uppercase;
        color: ${isDark ? "rgba(245,240,232,.10)" : "rgba(26,16,8,.12)"};
        padding: 16px 0 8px;
        border-top: 1px solid ${isDark ? "rgba(201,169,110,.06)" : "rgba(201,169,110,.10)"};
      }
    `}</style>
  );
}

/* ─── Avatar ─────────────────────────────────────────────────────── */
function UserAvatar({ usuario, size = 44 }) {
  return (
      <div className="sec-avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
        {usuario?.fotoPerfil
            ? <img src={getFotoUrl(usuario.fotoPerfil)} alt={usuario.nome || "S"} />
            : (usuario?.nome?.charAt(0).toUpperCase() || "S")
        }
      </div>
  );
}

/* ─── Componente Principal ───────────────────────────────────────── */
export default function SecretariaPage() {
  const [moduloAtivo,   setModuloAtivo]   = useState("home");
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [isDark,        setIsDark]        = useState(() => localStorage.getItem("theme") === "dark");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendentesCount, setPendentesCount] = useState(0);
  const [pendentesConvertidosCount, setPendentesConvertidosCount] = useState(0);
  const [showBoasVindas, setShowBoasVindas] = useState(false);

  const t = theme(isDark);

  const carregarPendentes = useCallback(async () => {
    try {
      const res = await api.get("/solicitacoes-ficha/pendentes", { params: { page: 0, size: 1 } });
      const data = res.data;
      setPendentesCount(Number(data?.totalElements ?? data?.content?.length ?? 0));
    } catch { setPendentesCount(0); }
  }, []);

  const carregarPendentesConvertidos = useCallback(async () => {
    try {
      const res = await api.get("/convertidos", { params: { status: "AGUARDANDO_BATISMO", page: 0, size: 1 } });
      const data = res.data;
      setPendentesConvertidosCount(Number(data?.totalElements ?? data?.content?.length ?? 0));
    } catch { setPendentesConvertidosCount(0); }
  }, []);

  useEffect(() => { carregarPendentes(); carregarPendentesConvertidos(); }, [carregarPendentes, carregarPendentesConvertidos]);
  useEffect(() => {
    const onSol = () => carregarPendentes();
    const onConv = () => carregarPendentesConvertidos();
    window.addEventListener("solicitacoes:updated", onSol);
    window.addEventListener("convertidos:updated", onConv);
    return () => {
      window.removeEventListener("solicitacoes:updated", onSol);
      window.removeEventListener("convertidos:updated", onConv);
    };
  }, [carregarPendentes, carregarPendentesConvertidos]);

  useEffect(() => {
    if (moduloAtivo !== "home") window.history.pushState({ modulo: moduloAtivo }, "");
    const handlePop = () => setModuloAtivo("home");
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [moduloAtivo]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    api.get("/usuarios/me").then(r => setUsuarioLogado(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("boas_vindas_pendente") !== "1") return;
    const id = setTimeout(() => {
      sessionStorage.removeItem("boas_vindas_pendente");
      setShowBoasVindas(true);
    }, 600);
    return () => clearTimeout(id);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const pageTitle = moduloAtivo === "home" ? "Secretaria" : (PAGE_TITLES[moduloAtivo] || "Secretaria");

  const badges = useMemo(() => ({
    "APROVACAO_FICHAS": pendentesCount,
    "FICHAS_CONVERTIDO": pendentesConvertidosCount,
  }), [pendentesCount, pendentesConvertidosCount]);

  return (
      <div className="sec-root">
        <GlobalStyles t={t} isDark={isDark} />
        <div className="sec-glow" />

        <AnimatePresence>
          {showBoasVindas && (
              <BoasVindas
                  usuarioLogado={usuarioLogado}
                  cargo="Secretaria"
                  mensagem="Um bom registro hoje é uma bênção amanhã. Tenha um dia produtivo e abençoado!"
                  isDark={isDark}
                  onClose={() => setShowBoasVindas(false)}
              />
          )}
        </AnimatePresence>

        {/* ════ HEADER ════ */}
        <header className="sec-header">
          <div className="sec-hdr-left">
            {moduloAtivo !== "home" && (
                <button className="sec-btn-back" onClick={() => setModuloAtivo("home")} title="Voltar">
                  <ArrowLeft size={16} />
                </button>
            )}
            <div className="sec-avatar-wrap">
              <div className="sec-ring sec-pulse" style={{ width: 52, height: 52 }} />
              <div className="sec-ring sec-pulse" style={{ width: 40, height: 40, animationDelay: ".9s" }} />
              <UserAvatar usuario={usuarioLogado} />
            </div>
            <div className="sec-title-block">
              <p className="sec-eyebrow">Secretaria</p>
              <h1 className="sec-title">IEQ <span>Pituaçu</span></h1>
              <div className="sec-breadcrumb">
                <span className="sec-breadcrumb-seg">Sistema</span>
                <ChevronRight size={9} style={{ color: t.textMuted, flexShrink: 0 }} />
                <span className="sec-breadcrumb-seg active">{pageTitle}</span>
              </div>
            </div>
          </div>

          <div className="sec-hdr-right">
            <button className="sec-btn-ico" onClick={() => setIsDark(d => !d)} aria-label="Tema">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={isDark ? "sun" : "moon"}
                    initial={{ opacity: 0, rotate: -90, scale: .5 }}
                    animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                    exit={{    opacity: 0, rotate:  90, scale: .5  }}
                    transition={{ duration: .2 }}
                    style={{ display: "inline-flex", position: "absolute" }}
                >
                  {isDark ? <Sun size={15} /> : <Moon size={15} />}
                </motion.span>
              </AnimatePresence>
            </button>

            <button
                className="sec-btn-exit"
                onClick={() => setShowExitConfirm(true)}
            >
              <LogOut size={13} />
              <span className="sec-btn-exit-label">Sair</span>
            </button>
          </div>
        </header>

        <div className="sec-header-line" />

        {/* ════ CONTEÚDO ════ */}
        <main className="sec-main">
          <div className="sec-content">
            <AnimatePresence mode="sync">
              {moduloAtivo === "home" ? (

                  <motion.div
                      key="home"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: .3 } }}
                      exit={{ opacity: 0, transition: { duration: .2 } }}
                      style={{ display: "flex", flexDirection: "column" }}
                  >
                    <div className="sec-menu-grid">
                      {MENU_ITEMS.map(({ icon: Icon, name, desc, aba, color, badgeKey }) => (
                          <motion.div
                              key={aba}
                              className="sec-menu-card"
                              whileHover={{ y: -5 }}
                              whileTap={{ scale: .96 }}
                              onClick={() => setModuloAtivo(aba)}
                          >
                            <style>{`.sec-menu-card:hover::before{ background: linear-gradient(135deg,${color}66,${color}); }`}</style>
                            <div className="sec-menu-icon" style={{ background: `${color}18`, color }}>
                              <Icon size={20} />
                            </div>
                            <div>
                              <p className="sec-menu-name">{name}</p>
                              <p className="sec-menu-desc">{desc}</p>
                            </div>
                            {badgeKey && badges[badgeKey] > 0 && (
                                <span className="sec-menu-badge">{badges[badgeKey]}</span>
                            )}
                          </motion.div>
                      ))}
                    </div>
                  </motion.div>

              ) : (

                  <motion.div
                      key={moduloAtivo}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: .3 } }}
                      exit={{ opacity: 0, transition: { duration: .2 } }}
                  >
                    {moduloAtivo === "MEMBROS"           && <Membros isDark={isDark} />}
                    {moduloAtivo === "VISITANTES"         && <Visitantes isDark={isDark} />}
                    {moduloAtivo === "CELULAS"            && <Celulas isDark={isDark} />}
                    {moduloAtivo === "FICHAS"             && <FichasEncontro isDark={isDark} />}
                    {moduloAtivo === "SECRETARIACELULAS"  && <SecretariaCelulas isDark={isDark} />}
                    {moduloAtivo === "APROVACAO_FICHAS"   && <AprovacaoFichasMembro isDark={isDark} />}
                    {moduloAtivo === "FICHAS_CONVERTIDO"  && <FichasConvertido isDark={isDark} />}
                  </motion.div>

              )}
            </AnimatePresence>
          </div>

          <div className="sec-footer">
            © IEQ Pituaçu · {new Date().getFullYear()}
          </div>
        </main>

        {/* ─── Modal Confirmação de Saída ──────────────────────────────── */}
        <AnimatePresence>
          {showExitConfirm && (
              <motion.div
                  style={{
                    position: "fixed", inset: 0, zIndex: 999,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 20,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                <motion.div
                    style={{
                      position: "absolute", inset: 0,
                      background: isDark ? "rgba(10,10,15,.88)" : "rgba(247,243,238,.88)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                    onClick={() => setShowExitConfirm(false)}
                />
                <motion.div
                    initial={{ scale: .88, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: .92, opacity: 0, y: 10 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    style={{
                      position: "relative", zIndex: 10,
                      width: "100%", maxWidth: 380,
                      background: t.bgEl,
                      border: `1px solid ${t.border}`,
                      borderRadius: 22,
                      padding: "36px 28px 28px",
                      textAlign: "center",
                      boxShadow: `0 40px 80px rgba(0,0,0,${isDark ? ".7" : ".2"})`,
                    }}
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px",
                    background: "linear-gradient(135deg, rgba(155,11,30,.15), rgba(200,16,46,.08))",
                    border: "1.5px solid rgba(200,16,46,.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: AURA.red,
                  }}>
                    <LogOut size={26} />
                  </div>
                  <h3 style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 20, fontWeight: 500, color: t.text,
                    margin: "0 0 10px", letterSpacing: ".02em",
                  }}>
                    Encerrar Sessão
                  </h3>
                  <p style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: 13, fontWeight: 300, color: t.textSec,
                    margin: "0 0 28px", lineHeight: 1.6,
                  }}>
                    Tem certeza que deseja sair do sistema?
                  </p>
                  <div style={{
                    height: 1, marginBottom: 24,
                    background: `linear-gradient(90deg, transparent, ${t.border}, transparent)`,
                  }} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={() => setShowExitConfirm(false)}
                        style={{
                          flex: 1, padding: "13px", borderRadius: 100,
                          border: `1px solid ${t.border}`, cursor: "pointer",
                          background: "transparent", color: t.textSec,
                          fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600,
                          letterSpacing: ".14em", textTransform: "uppercase",
                          transition: "all .25s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = t.gold; e.currentTarget.style.color = t.gold; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSec; }}
                    >
                      Cancelar
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                          flex: 1, padding: "13px", borderRadius: 100,
                          border: "none", cursor: "pointer",
                          background: `linear-gradient(135deg, ${AURA.redDark}, ${AURA.red})`,
                          color: "#fff",
                          fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600,
                          letterSpacing: ".14em", textTransform: "uppercase",
                          boxShadow: "0 8px 24px rgba(200,16,46,.3)",
                          transition: "all .25s",
                        }}
                    >
                      Sair
                    </button>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}

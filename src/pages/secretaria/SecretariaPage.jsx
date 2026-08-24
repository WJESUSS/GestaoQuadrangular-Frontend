import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users, UserPlus, Home, FileText, Building2,
  Sun, Moon, LogOut, Menu, X, ChevronRight, ClipboardList, Droplets,
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

/* ─── Tokens (espelhados do DashboardLider) ──────────────────────────── */
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
    bg:          isDark ? "#0A0A0F"               : "#E8F1FB",
    bgEl:        isDark ? "rgba(18,18,26,.97)"     : "rgba(232,241,251,.97)",
    bgInput:     isDark ? "rgba(255,255,255,.04)"  : "rgba(0,61,165,.04)",
    border:      isDark ? "rgba(201,169,110,.1)"   : "rgba(0,61,165,.15)",
    borderInput: isDark ? "rgba(201,169,110,.15)"  : "rgba(0,61,165,.2)",
    text:        isDark ? "#FFFFFF"               : "#0A1628",
    textSec:     isDark ? "#9A9588"                : "#1E3A5F",
    textMuted:   isDark ? "#6B6658"                : "#4A6585",
    glow1:       isDark ? "rgba(201,169,110,.05)"  : "rgba(0,61,165,.06)",
    glow2:       isDark ? "rgba(201,169,110,.04)"  : "rgba(201,169,110,.06)",
    headerBg:    isDark ? "rgba(10,10,15,.97)"     : "rgba(232,241,251,.97)",
    sidebarBg:   isDark ? "rgba(12,10,14,.98)"     : "rgba(232,241,251,.98)",
    placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(74,101,133,.45)",
  };
}

const modulos = [
  { id: "MEMBROS",           label: "Membros",    sub: "Gestão",      icon: <Users size={17}/>,     color: AURA.blue      },
  { id: "VISITANTES",        label: "Visitantes", sub: "Novas Vidas", icon: <UserPlus size={17}/>,  color: AURA.red       },
  { id: "CELULAS",           label: "Células",    sub: "Grupos",      icon: <Home size={17}/>,      color: "#059669"      },
  { id: "FICHAS",            label: "Fichas",     sub: "Encontro",    icon: <FileText size={17}/>,  color: AURA.yellow    },
  { id: "SECRETARIACELULAS", label: "Secretaria", sub: "Controle",    icon: <Building2 size={17}/>, color: "#7090e8"      },
  { id: "APROVACAO_FICHAS",  label: "Aprov. Fichas", sub: "Membros",  icon: <ClipboardList size={17}/>, color: AURA.red    },
  { id: "FICHAS_CONVERTIDO", label: "Convertidos", sub: "Novas Vidas", icon: <Droplets size={17}/>,  color: "#059669"      },
];

/* ─── CSS Global ─────────────────────────────────────────────────────── */
function GlobalStyles({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes sec-spin  { to { transform: rotate(360deg); } }
      @keyframes sec-pulse { 0%,100%{opacity:.25;transform:scale(1);} 50%{opacity:.06;transform:scale(1.1);} }
      @keyframes sec-blink { 0%,100%{opacity:1;} 50%{opacity:.3;} }
      @keyframes sec-stripe{ 0%{background-position:0 0} 100%{background-position:80px 80px} }

      *, *::before, *::after { box-sizing: border-box; }

      .sec2-root {
        font-family: 'Inter', sans-serif;
        background: ${isDark ? "-webkit-linear-gradient(90deg, #5c5c5c,#333333,#000000,#000000,#000000)" : "-webkit-linear-gradient(90deg, #ffffff,#ffffff,#928672)"};
        background: ${isDark ? "linear-gradient(90deg, #5c5c5c,#333333,#000000,#000000,#000000)" : "linear-gradient(90deg, #ffffff,#ffffff,#928672)"};
        color: ${t.text};
        min-height: 100vh;
        min-height: 100dvh;
        display: flex;
        position: relative;
        overflow-x: hidden;
        transition: background .4s, color .4s;
        isolation: isolate;
      }

      /* Fundo animado */
      .sec2-bg {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 10% 0%, ${t.glow1} 0%, transparent 55%),
          radial-gradient(ellipse at 90% 100%, ${t.glow2} 0%, transparent 55%);
        transition: background .4s;
      }
      .sec2-stripes {
        position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: .5;
        background-image: repeating-linear-gradient(
          -55deg,
          ${isDark ? "rgba(201,169,110,.025)" : "rgba(0,61,165,.035)"} 0 8px,
          transparent 8px 16px,
          ${isDark ? "rgba(200,16,46,.015)"   : "rgba(0,61,165,.02)"}   16px 24px,
          transparent 24px 40px
        );
        background-size: 80px 80px;
      }

      /* ── SIDEBAR ── */
      .sec2-sidebar {
        position: fixed; left: 0; top: 0; bottom: 0; z-index: 50;
        width: 270px;
        background: ${t.sidebarBg};
        border-right: 1px solid ${t.border};
        backdrop-filter: blur(32px) saturate(1.6);
        -webkit-backdrop-filter: blur(32px) saturate(1.6);
        display: flex; flex-direction: column;
        padding: 0;
        transform: translateX(-100%);
        transition: transform .32s cubic-bezier(.4,0,.2,1), box-shadow .32s;
        will-change: transform;
      }
      .sec2-sidebar.open {
        transform: translateX(0);
        box-shadow: 24px 0 80px rgba(0,0,0,${isDark ? ".6" : ".18"});
      }
      @media (min-width: 768px) {
        .sec2-sidebar {
          position: sticky;
          top: 0; height: 100vh; height: 100dvh;
          transform: translateX(0) !important;
          box-shadow: none !important;
          flex-shrink: 0;
        }
      }

      .sec2-sidebar-inner {
        display: flex; flex-direction: column; flex: 1; overflow-y: auto;
        padding: 28px 18px 24px;
        /* Esconde scrollbar mas mantém scroll */
        scrollbar-width: none;
      }
      .sec2-sidebar-inner::-webkit-scrollbar { display: none; }

      /* ── BRAND no topo ── */
      .sec2-brand {
        display: flex; align-items: center; gap: 13px; margin-bottom: 28px;
      }
      .sec2-avatar-wrap {
        position: relative; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }
      .sec2-pulse-ring {
        position: absolute; border-radius: 50%;
        border: 1px solid rgba(201,169,110,.22);
        animation: sec-pulse 3.2s ease-in-out infinite;
      }
      .sec2-avatar {
        width: 48px; height: 48px; border-radius: 50%;
        border: 1.5px solid rgba(201,169,110,.3);
        background: ${isDark ? "rgba(18,18,26,.99)" : "#fff"};
        display: flex; align-items: center; justify-content: center;
        overflow: hidden; position: relative; z-index: 1;
      }
      .sec2-avatar img { width: 100%; height: 100%; object-fit: cover; }
      .sec2-avatar-fallback {
        font-family: 'Playfair Display', serif;
        font-size: 18px; font-weight: 600; color: ${AURA.gold};
      }
      .sec2-brand-text { flex: 1; min-width: 0; }
      .sec2-brand-title {
        font-family: 'Playfair Display', serif;
        font-size: 15px; font-weight: 600; color: ${t.text};
        margin: 0; line-height: 1.2; letter-spacing: .04em;
        background: linear-gradient(90deg, ${AURA.redDark}, ${AURA.red}, ${AURA.yellow}, ${AURA.blue});
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .sec2-brand-sub {
        font-size: 9px; font-weight: 600; letter-spacing: .22em;
        text-transform: uppercase; color: ${t.textMuted}; margin: 3px 0 0;
      }
      .sec2-brand-user {
        font-size: 11px; font-weight: 300; font-style: italic;
        color: ${t.textSec}; margin: 4px 0 0;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }

      /* Divider */
      .sec2-divider {
        display: flex; align-items: center; gap: 8px; margin: 0 0 18px;
      }
      .sec2-divider::before,
      .sec2-divider::after {
        content: ''; flex: 1; height: 1px;
      }
      .sec2-divider::before { background: linear-gradient(to right, transparent, rgba(201,169,110,.25)); }
      .sec2-divider::after  { background: linear-gradient(to left,  transparent, rgba(201,169,110,.25)); }
      .sec2-divider-dot { width: 4px; height: 4px; border-radius: 50%; background: ${AURA.gold}; }

      /* ── NAV ── */
      .sec2-nav-label {
        font-size: 8px; font-weight: 600; letter-spacing: .24em;
        text-transform: uppercase; color: ${t.textMuted}; margin: 0 0 10px 6px;
      }
      .sec2-nav { display: flex; flex-direction: column; gap: 3px; flex: 1; }
      .sec2-nav-btn {
        width: 100%; display: flex; align-items: center; gap: 12px;
        padding: 12px 14px; border-radius: 12px; border: none; cursor: pointer;
        font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500;
        letter-spacing: .02em; text-align: left; position: relative;
        transition: all .26s cubic-bezier(.4,0,.2,1);
        background: transparent; color: ${t.textMuted};
      }
      .sec2-nav-btn::before {
        content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
        width: 3px; height: 0; border-radius: 0 3px 3px 0;
        background: var(--nav-accent, ${AURA.gold});
        transition: height .26s cubic-bezier(.4,0,.2,1);
      }
      .sec2-nav-btn:hover {
        background: ${isDark ? "rgba(201,169,110,.06)" : "rgba(201,169,110,.07)"};
        color: ${t.text};
      }
      .sec2-nav-btn:hover::before { height: 22px; }
      .sec2-nav-btn.active {
        background: linear-gradient(135deg, ${AURA.redDark} 0%, ${AURA.red} 100%);
        color: #fff;
        box-shadow: 0 8px 24px rgba(200,16,46,.3);
      }
      .sec2-nav-btn.active::before { display: none; }
      .sec2-nav-icon-wrap {
        width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        transition: background .26s;
      }
      .sec2-nav-btn.active .sec2-nav-icon-wrap {
        background: rgba(255,255,255,.15);
      }
      .sec2-nav-text { flex: 1; min-width: 0; }
      .sec2-nav-text-main { display: block; line-height: 1; }
      .sec2-nav-text-sub  {
        display: block; font-size: 9px; font-weight: 400; letter-spacing: .1em;
        text-transform: uppercase; opacity: .55; margin-top: 2px;
        transition: opacity .26s;
      }
      .sec2-nav-btn.active .sec2-nav-text-sub { opacity: .7; }
      .sec2-nav-chevron { opacity: 0; transition: opacity .26s; }
      .sec2-nav-btn.active .sec2-nav-chevron { opacity: .5; }
      .sec2-nav-badge {
        margin-left: auto;
        background: ${AURA.red};
        color: #fff;
        font-size: 9px; font-weight: 700;
        padding: 2px 6px; border-radius: 99px;
        min-width: 18px; text-align: center;
        line-height: 1.3;
        animation: sec-blink 2.5s ease-in-out infinite;
        flex-shrink: 0;
      }

      /* ── RODAPÉ SIDEBAR ── */
      .sec2-sidebar-footer { margin-top: 18px; display: flex; flex-direction: column; gap: 10px; }
      .sec2-user-chip {
        display: flex; align-items: center; gap: 10px;
        padding: 11px 13px; border-radius: 12px;
        background: ${isDark ? "rgba(201,169,110,.05)" : "rgba(201,169,110,.07)"};
        border: 1px solid rgba(201,169,110,.12);
      }
      .sec2-user-chip-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: #059669; flex-shrink: 0;
        animation: sec-blink 2.5s ease-in-out infinite;
      }
      .sec2-user-chip-name {
        font-size: 11px; font-weight: 600; color: ${t.text};
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
      }
      .sec2-user-chip-role {
        font-size: 9px; color: ${t.textMuted}; letter-spacing: .1em;
        text-transform: uppercase;
      }

      /* Botão sair elegante */
      .sec2-btn-exit {
        display: flex; align-items: center; justify-content: center; gap: 9px;
        width: 100%; padding: 13px 18px; border-radius: 12px; border: none;
        cursor: pointer; position: relative; overflow: hidden;
        background: ${isDark
          ? "linear-gradient(135deg, rgba(155,11,30,.22), rgba(200,16,46,.14))"
          : "linear-gradient(135deg, rgba(155,11,30,.08), rgba(200,16,46,.06))"};
        border: 1px solid ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"};
        color: ${AURA.red};
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
        letter-spacing: .18em; text-transform: uppercase;
        transition: all .3s cubic-bezier(.4,0,.2,1);
      }
      .sec2-btn-exit::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        opacity: 0; transition: opacity .3s;
      }
      .sec2-btn-exit:hover { color: #fff; border-color: transparent; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(200,16,46,.3); }
      .sec2-btn-exit:hover::after { opacity: 1; }
      .sec2-btn-exit > * { position: relative; z-index: 1; }
      .sec2-btn-exit:active { transform: translateY(0); }

      .sec2-copyright {
        text-align: center; font-size: 8px; font-weight: 500;
        letter-spacing: .16em; text-transform: uppercase;
        color: ${isDark ? "rgba(245,240,232,.1)" : "rgba(26,16,8,.12)"};
        margin-top: 10px;
      }

      /* ── OVERLAY MOBILE ── */
      .sec2-overlay {
        position: fixed; inset: 0; z-index: 49;
        background: rgba(10,10,15,.75);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      }
      @media (min-width: 768px) { .sec2-overlay { display: none !important; } }

      /* ── MAIN ── */
      .sec2-main {
        flex: 1; display: flex; flex-direction: column;
        position: relative; z-index: 1; min-width: 0;
        min-height: 100vh; min-height: 100dvh;
      }

      /* Mobile topbar */
      .sec2-topbar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid ${t.border};
        background: ${t.headerBg};
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        position: sticky; top: 0; z-index: 30;
      }
      @media (min-width: 768px) { .sec2-topbar { display: none !important; } }

      /* Desktop header */
      .sec2-deskhead {
        display: none;
        padding: 28px 32px 0;
      }
      @media (min-width: 768px) { .sec2-deskhead { display: block !important; } }

      .sec2-deskhead-inner {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 28px; gap: 16px; flex-wrap: wrap;
      }

      /* Badge módulo */
      .sec2-mod-badge {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 7px 16px; border-radius: 100px;
        font-family: 'Inter', sans-serif;
        font-size: 9px; font-weight: 600; letter-spacing: .16em;
        text-transform: uppercase; border: 1px solid; white-space: nowrap;
      }
      .sec2-mod-badge-dot {
        width: 5px; height: 5px; border-radius: 50%;
        animation: sec-blink 2.5s ease-in-out infinite;
      }

      /* Botões utilitários */
      .sec2-btn-icon {
        width: 38px; height: 38px; border-radius: 11px; border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${t.border}; color: ${t.textMuted};
        transition: all .25s;
      }
      .sec2-btn-icon:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

      /* CONTENT */
      .sec2-content {
        flex: 1; padding: 24px 20px;
        overflow-y: auto;
        /* Safe area para iOS */
        padding-bottom: max(24px, env(safe-area-inset-bottom, 24px));
      }
      @media (min-width: 768px) { .sec2-content { padding: 24px 32px; } }

      /* Card principal */
      .sec2-card {
        background: ${t.bgEl};
        border: 1px solid ${t.border};
        border-radius: 20px;
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        min-height: 480px;
        overflow: hidden;
        position: relative;
      }
      .sec2-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
        pointer-events: none;
      }

      /* Título desktop */
      .sec2-module-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(22px, 3vw, 28px);
        font-weight: 500; color: ${t.text}; margin: 0;
        letter-spacing: .02em;
      }
      .sec2-module-eyebrow {
        font-size: 9px; font-weight: 600; letter-spacing: .22em;
        text-transform: uppercase; color: rgba(201,169,110,.55); margin: 0 0 5px;
      }

      /* Status online badge */
      .sec2-online {
        display: flex; align-items: center; gap: 6px;
        padding: 7px 14px; border-radius: 100px;
        background: rgba(5,150,105,.1); border: 1px solid rgba(5,150,105,.25);
        color: #059669; font-size: 9px; font-weight: 600; letter-spacing: .16em;
        text-transform: uppercase;
      }
      .sec2-online-dot {
        width: 6px; height: 6px; border-radius: 50%; background: #059669;
        animation: sec-blink 2.5s ease-in-out infinite;
      }

      /* Menu hamburger animado */
      @media (min-width: 768px) { .sec2-hamburger { display: none !important; } }
    `}</style>
  );
}

/* ─── Logo / Avatar ───────────────────────────────────────────────────── */
function IEQAvatar({ usuario, size = 48 }) {
  return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden",
        border: "1.5px solid rgba(201,169,110,.3)",
        background: "rgba(18,18,26,.8)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {usuario?.fotoPerfil ? (
            <img src={getFotoUrl(usuario.fotoPerfil)} alt={usuario.nome || "S"}
                 style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600,
              fontSize: size * 0.36, color: AURA.gold }}>
          {usuario?.nome?.charAt(0).toUpperCase() || "S"}
        </span>
        )}
      </div>
  );
}

/* ─── Componente Principal ────────────────────────────────────────────── */
export default function SecretariaPage() {
  const [moduloAtivo,   setModuloAtivo]   = useState("MEMBROS");
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [isDark,        setIsDark]        = useState(() => localStorage.getItem("theme") === "dark");
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendentesCount, setPendentesCount] = useState(0);
  const [pendentesConvertidosCount, setPendentesConvertidosCount] = useState(0); // NOVO
  const [showBoasVindas, setShowBoasVindas] = useState(false);

  const carregarPendentes = useCallback(async () => {
    try {
      const res = await api.get("/solicitacoes-ficha/pendentes", { params: { page: 0, size: 1 } });
      const data = res.data;
      const count = Number(data?.totalElements ?? data?.content?.length ?? 0);
      setPendentesCount(count);
    } catch (err) {
      console.warn("Erro ao carregar pendentes:", err?.response?.status, err?.message);
      setPendentesCount(0);
    }
  }, []);

  // Carrega quantidade de convertidos aguardando batismo
  const carregarPendentesConvertidos = useCallback(async () => {
    try {
      const res = await api.get("/convertidos", { params: { status: "AGUARDANDO_BATISMO", page: 0, size: 1 } });
      const data = res.data;
      const count = Number(data?.totalElements ?? data?.content?.length ?? 0);
      setPendentesConvertidosCount(count);
    } catch (err) {
      console.warn("Erro ao carregar convertidos pendentes:", err?.response?.status, err?.message);
      setPendentesConvertidosCount(0);
    }
  }, []);

  useEffect(() => { carregarPendentes(); }, [carregarPendentes]);
  useEffect(() => { if (moduloAtivo === "APROVACAO_FICHAS") carregarPendentes(); }, [moduloAtivo, carregarPendentes]);

  // NOVO: dispara ao montar e sempre que o módulo de convertidos for aberto
  useEffect(() => { carregarPendentesConvertidos(); }, [carregarPendentesConvertidos]);
  useEffect(() => {
    if (moduloAtivo === "FICHAS_CONVERTIDO") carregarPendentesConvertidos();
  }, [moduloAtivo, carregarPendentesConvertidos]);

  // Atualiza os badges em tempo real quando as telas alteram as fichas
  useEffect(() => {
    const onSolicitacoes = () => carregarPendentes();
    const onConvertidos = () => carregarPendentesConvertidos();
    window.addEventListener("solicitacoes:updated", onSolicitacoes);
    window.addEventListener("convertidos:updated", onConvertidos);
    return () => {
      window.removeEventListener("solicitacoes:updated", onSolicitacoes);
      window.removeEventListener("convertidos:updated", onConvertidos);
    };
  }, [carregarPendentes, carregarPendentesConvertidos]);

  /* Botão voltar Android/PWA */
  useEffect(() => {
    if (moduloAtivo !== "MEMBROS") window.history.pushState({ modulo: moduloAtivo }, "");
    const handlePop = () => setModuloAtivo("MEMBROS");
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

  /* Aguarda a página assentar antes de abrir as boas-vindas (evita travadas) */
  useEffect(() => {
    if (sessionStorage.getItem("boas_vindas_pendente") !== "1") return;
    const id = setTimeout(() => {
      sessionStorage.removeItem("boas_vindas_pendente");
      setShowBoasVindas(true);
    }, 600);
    return () => clearTimeout(id);
  }, []);

  const fecharBoasVindas = () => setShowBoasVindas(false);

  /* Fechar sidebar ao mudar módulo no mobile */
  const trocarModulo = (id) => { setModuloAtivo(id); setMenuOpen(false); };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const t = theme(isDark);
  const moduloInfo = useMemo(() => modulos.find(m => m.id === moduloAtivo), [moduloAtivo]);

  return (
      <div className="sec2-root">
        <GlobalStyles t={t} isDark={isDark} />
        <div className="sec2-bg" />
        <div className="sec2-stripes" />

        <AnimatePresence>
          {showBoasVindas && (
              <BoasVindas
                  usuarioLogado={usuarioLogado}
                  cargo="Secretaria"
                  mensagem="Um bom registro hoje é uma bênção amanhã. Tenha um dia produtivo e abençoado!"
                  isDark={isDark}
                  onClose={fecharBoasVindas}
              />
          )}
        </AnimatePresence>

        {/* Overlay mobile */}
        <AnimatePresence>
          {menuOpen && (
              <motion.div
                  className="sec2-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: .22 }}
                  onClick={() => setMenuOpen(false)}
              />
          )}
        </AnimatePresence>

        {/* ─── SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className={`sec2-sidebar${menuOpen ? " open" : ""}`}>
          <div className="sec2-sidebar-inner">

            {/* Brand */}
            <div className="sec2-brand">
              <div className="sec2-avatar-wrap">
                <div className="sec2-pulse-ring" style={{ width: 58, height: 58 }} />
                <div className="sec2-pulse-ring" style={{ width: 46, height: 46, animationDelay: ".9s" }} />
                <div className="sec2-avatar">
                  <IEQAvatar usuario={usuarioLogado} size={46} />
                </div>
              </div>
              <div className="sec2-brand-text">
                <h1 className="sec2-brand-title">IEQ Pituaçu</h1>
                <p className="sec2-brand-sub">Secretaria</p>
                {usuarioLogado?.nome && (
                    <p className="sec2-brand-user">{usuarioLogado.nome}</p>
                )}
              </div>
            </div>

            <div className="sec2-divider"><div className="sec2-divider-dot" /></div>

            {/* Nav */}
            <p className="sec2-nav-label">Módulos</p>
            <nav className="sec2-nav">
              {modulos.map(m => (
                  <button
                      key={m.id}
                      className={`sec2-nav-btn${moduloAtivo === m.id ? " active" : ""}`}
                      style={{ "--nav-accent": m.color }}
                      onClick={() => trocarModulo(m.id)}
                  >
                    <div
                        className="sec2-nav-icon-wrap"
                        style={{
                          background: moduloAtivo === m.id
                              ? "rgba(255,255,255,.15)"
                              : isDark ? `${m.color}18` : `${m.color}14`,
                          color: moduloAtivo === m.id ? "#fff" : m.color,
                        }}
                    >
                      {m.icon}
                    </div>
                    <span className="sec2-nav-text">
                  <span className="sec2-nav-text-main">{m.label}</span>
                  <span className="sec2-nav-text-sub">{m.sub}</span>
                </span>
                    {m.id === "APROVACAO_FICHAS" && pendentesCount > 0 && (
                        <span className="sec2-nav-badge">{pendentesCount}</span>
                    )}
                    {m.id === "FICHAS_CONVERTIDO" && pendentesConvertidosCount > 0 && (
                        <span className="sec2-nav-badge">{pendentesConvertidosCount}</span>
                    )}
                    <ChevronRight size={13} className="sec2-nav-chevron" />
                  </button>
              ))}
            </nav>

            {/* Footer */}
            <div className="sec2-sidebar-footer">
              <div className="sec2-divider" style={{ margin: "6px 0 14px" }}>
                <div className="sec2-divider-dot" />
              </div>

              {/* Botão Sair elegante */}
              <button
                  className="sec2-btn-exit"
                  onClick={() => setShowExitConfirm(true)}
              >
                <LogOut size={15} />
                <span>Sair do Sistema</span>
              </button>

              <p className="sec2-copyright">
                © IEQ Pituaçu · {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </aside>

        {/* ─── MAIN ────────────────────────────────────────────────────── */}
        <div className="sec2-main" style={{ position: "relative", zIndex: 1 }}>

          {/* Mobile topbar */}
          <header className="sec2-topbar">
            <button
                className="sec2-btn-icon sec2-hamburger"
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menu"
            >
              <Menu size={18} />
            </button>

            <span
                className="sec2-mod-badge"
                style={{
                  color: moduloInfo?.color || AURA.red,
                  borderColor: `${moduloInfo?.color || AURA.red}40`,
                  background: `${moduloInfo?.color || AURA.red}10`,
                }}
            >
            <span
                className="sec2-mod-badge-dot"
                style={{ background: moduloInfo?.color || AURA.red }}
            />
              {moduloInfo?.label}
          </span>

            <button
                className="sec2-btn-icon"
                onClick={() => setIsDark(!isDark)}
                aria-label="Alternar tema"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </header>

          {/* Desktop header */}
          <div className="sec2-deskhead">
            <div className="sec2-deskhead-inner">
              <div>
                <p className="sec2-module-eyebrow">Módulo Ativo</p>
                <motion.h2
                    className="sec2-module-title"
                    key={moduloAtivo}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: .25 }}
                >
                  {moduloInfo?.label}
                </motion.h2>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="sec2-online">
                  <div className="sec2-online-dot" />
                  Online
                </div>

                <button
                    className="sec2-btn-icon"
                    onClick={() => setIsDark(!isDark)}
                    title="Alternar tema"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <main className="sec2-content">
            <AnimatePresence mode="wait">
              <motion.div
                  key={moduloAtivo}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: .22, ease: "easeOut" }}
                  className="sec2-card"
              >
                {moduloAtivo === "MEMBROS"           && <Membros isDark={isDark} />}
                {moduloAtivo === "VISITANTES"         && <Visitantes isDark={isDark} />}
                {moduloAtivo === "CELULAS"            && <Celulas isDark={isDark} />}
                {moduloAtivo === "FICHAS"             && <FichasEncontro isDark={isDark} />}
                {moduloAtivo === "SECRETARIACELULAS"  && <SecretariaCelulas isDark={isDark} />}
                {moduloAtivo === "APROVACAO_FICHAS"  && <AprovacaoFichasMembro isDark={isDark} />}
                {moduloAtivo === "FICHAS_CONVERTIDO"  && <FichasConvertido isDark={isDark} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

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
                {/* Backdrop */}
                <motion.div
                    style={{
                      position: "absolute", inset: 0,
                      background: "rgba(10,10,15,.88)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                    onClick={() => setShowExitConfirm(false)}
                />

                {/* Card */}
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
                  {/* Ícone */}
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

                  {/* Linha decorativa */}
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
                        onMouseEnter={e => { e.currentTarget.style.borderColor = AURA.gold; e.currentTarget.style.color = AURA.gold; }}
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
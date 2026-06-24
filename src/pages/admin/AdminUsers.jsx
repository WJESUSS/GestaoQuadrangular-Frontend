// ══════════════════════════════════════════════════════════════════════════════
// AdminUsers — Versão Refinada (Menu Superior)
// Melhorias: Topbar com mega-menu, overlay mobile, KPIs, modal drawer, rows
// ══════════════════════════════════════════════════════════════════════════════
import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../services/api.js";
import { getFotoUrl } from "../../utils/foto.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Users, Power, Trash2, LogOut,
  Mail, Key, User, Shield, Loader2, RefreshCcw, Pencil, X,
  Sun, Moon, Eye, EyeOff, CheckCircle, XCircle, Clock, Camera,
  History, Search, Phone, ChevronDown, Menu, FileText,
  Building2, DollarSign, Home, Flame,
  LayoutDashboard, Share2, Trophy, ClipboardList,
  BarChart2, TrendingUp, Target, Sparkles, ChevronRight,
} from "lucide-react";

import Membros             from "../secretaria/Membros";
import Celulas             from "../secretaria/Celulas";
import Visitantes          from "../secretaria/Visitante";
import FichasEncontro      from "../secretaria/FichasEncontro";
import SecretariaCelulas   from "../secretaria/SecretariaCelulas";
import PainelPastor        from "../pastor/PainelPastor";
import RelatorioCelula     from "../pastor/RelatorioCelula";
import SolicitacoesMultiplicacao from "../pastor/SolicitacoesMultiplicacao";
import RankingCelulas      from "../pastor/RankingCelulas";
import PainelAlertas       from "../pastor/PainelAlertas";
import Discipulado         from "../pastor/Discipulado";
import TelaPendencias      from "../pastor/TelaPendencias";
import RelatorioCasasDePaz from "../pastor/RelatorioCasasDePaz";
import RelatorioMissao70Pastor from "../pastor/RelatorioMissao70Pastor";
import TelaRelatorio       from "../lider/TelaRelatorio";
import RelatorioDiscipulado from "../lider/RelatorioDiscipulado";
import TelaVisitantes      from "../lider/TelaVisitantes";
import TelaFichas          from "../lider/TelaFichas";
import CasasDePazLider     from "../lider/CasasDePazLider";
import Missao70Lider       from "../lider/Missao70Lider";
import TesourariaDashboard  from "../tesouraria/TesourariaDashboard";
import TesourariaLancamento from "../tesouraria/TesourariaLancamento";
import TesourariaRelatorio  from "../tesouraria/TesourariaRelatorio";
import TesourariaDizimistas from "../tesouraria/TesourariaDizimistas";
import TesourariaComparativo from "../tesouraria/TesourariaComparativo";
import HistoricoAuditoria  from "./HistoricoAuditoria";

/* ─── Design Tokens ──────────────────────────────────────────────────────── */
const AURA = {
  gold:       "#C9A96E",
  goldLight:  "#E8D5A3",
  goldDim:    "#7A6240",
  red:        "#C8102E",
  redDark:    "#9B0B1E",
  blue:       "#003DA5",
  blueDark:   "#002470",
  yellow:     "#FDB813",
  yellowDark: "#C48C00",
  green:      "#059669",
  greenDark:  "#047857",
};

function theme(isDark) {
  return {
    bg:         isDark ? "#080810"              : "#F2EDE4",
    bgEl:       isDark ? "rgba(14,14,22,.98)"   : "rgba(255,255,255,.98)",
    bgElHover:  isDark ? "rgba(20,20,32,.98)"   : "rgba(248,244,238,.98)",
    bgInput:    isDark ? "rgba(255,255,255,.05)": "rgba(0,0,0,.04)",
    border:     isDark ? "rgba(201,169,110,.09)": "rgba(201,169,110,.18)",
    borderIn:   isDark ? "rgba(201,169,110,.13)": "rgba(201,169,110,.25)",
    borderHov:  isDark ? "rgba(201,169,110,.28)": "rgba(201,169,110,.45)",
    text:       isDark ? "#EDE8DF"              : "#180E04",
    textSec:    isDark ? "#8A8378"              : "#6B5E4A",
    textMuted:  isDark ? "#585248"              : "#9A8E80",
    glow1:      isDark ? "rgba(200,16,46,.06)"  : "rgba(200,16,46,.04)",
    glow2:      isDark ? "rgba(0,61,165,.05)"   : "rgba(0,61,165,.035)",
    glow3:      isDark ? "rgba(201,169,110,.04)": "rgba(201,169,110,.06)",
    headerBg:   isDark ? "rgba(8,8,14,.97)"     : "rgba(242,237,228,.97)",
    megaBg:     isDark ? "rgba(10,10,18,.99)"   : "rgba(252,249,244,.99)",
    overlayBg:  isDark ? "rgba(5,5,10,.99)"     : "rgba(8,6,4,.985)",
    placeholder:isDark ? "rgba(138,131,120,.3)" : "rgba(107,94,74,.3)",
    shadow:     isDark ? "rgba(0,0,0,.7)"       : "rgba(0,0,0,.12)",
    drawerBg:   isDark ? "rgba(10,10,18,.99)"   : "rgba(252,249,244,.99)",
  };
}

const perfis = ["ADMIN","PASTOR","LIDER_CELULA","SECRETARIO","TESOUREIRO"];

const SECOES = [
  {
    id:"admin", label:"Administração", icon:Shield, color:AURA.red,
    itens:[
      { key:"usuarios",  label:"Usuários",  sub:"Controle de acesso", icon:Users   },
      { key:"historico", label:"Histórico", sub:"Log de auditoria",   icon:History },
    ],
  },
  {
    id:"secretaria", label:"Secretaria", icon:FileText, color:AURA.blue,
    itens:[
      { key:"membros",           label:"Membros",      sub:"Base de dados",    icon:Users    },
      { key:"visitantes",        label:"Visitantes",   sub:"Novas vidas",      icon:UserPlus },
      { key:"celulas",           label:"Células",      sub:"Grupos de oração", icon:Home     },
      { key:"fichas",            label:"Fichas",       sub:"Encontro",         icon:FileText },
      { key:"secretariacelulas", label:"Sec. Células", sub:"Secretaria",       icon:Building2},
    ],
  },
  {
    id:"pastor", label:"Pastoral", icon:LayoutDashboard, color:"#e05050",
    itens:[
      { key:"painel-pastor",  label:"Dashboard",    sub:"Visão geral",     icon:LayoutDashboard },
      { key:"relatorios",     label:"Relatórios",   sub:"Células",         icon:FileText        },
      { key:"discipulado",    label:"Discipulado",  sub:"Secretaria",      icon:Users           },
      { key:"multiplicacoes", label:"Multiplicação",sub:"Solicitações",    icon:Share2          },
      { key:"ranking",        label:"Ranking",      sub:"Células",         icon:Trophy          },
      { key:"casas-de-paz",   label:"Casas de Paz", sub:"Evangelismo",     icon:Home            },
      { key:"missao70",       label:"Missão 70",    sub:"Evangelismo",     icon:Flame           },
      { key:"pendencias",     label:"Pendências",   sub:"Semana atual",    icon:ClipboardList   },
      { key:"alertas",        label:"Alertas",      sub:"Sistema",         icon:Shield          },
    ],
  },
  {
    id:"lider", label:"Líder", icon:Target, color:AURA.green,
    itens:[
      { key:"lider-relatorio",   label:"Relatório",   sub:"Semanal",      icon:FileText },
      { key:"lider-discipulado", label:"Discipulado", sub:"Membros",      icon:Users    },
      { key:"lider-visitantes",  label:"Visitantes",  sub:"Novas vidas",  icon:UserPlus },
      { key:"lider-fichas",      label:"Fichas",      sub:"Encontro",     icon:FileText },
      { key:"lider-casas",       label:"Casas de Paz",sub:"Evangelismo",  icon:Home     },
      { key:"lider-missao70",    label:"Missão 70",   sub:"Evangelismo",  icon:Flame    },
    ],
  },
  {
    id:"tesouraria", label:"Tesouraria", icon:DollarSign, color:AURA.yellowDark,
    itens:[
      { key:"teso-dashboard",   label:"Dashboard",   sub:"Análise",      icon:BarChart2  },
      { key:"teso-lancamento",  label:"Lançamento",  sub:"Fluxo",        icon:DollarSign },
      { key:"teso-relatorio",   label:"Relatório",   sub:"Exportação",   icon:FileText   },
      { key:"teso-dizimistas",  label:"Dizimistas",  sub:"Base",         icon:Users      },
      { key:"teso-comparativo", label:"Comparativo", sub:"Evolução",     icon:TrendingUp },
    ],
  },
];

/* ─── Global CSS ─────────────────────────────────────────────────────────── */
function GlobalStyles({ t, isDark }) {
  return (
      <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600;700&display=swap');

    @keyframes adm-spin    { to { transform: rotate(360deg); } }
    @keyframes adm-blink   { 0%,100%{opacity:1} 50%{opacity:.25} }
    @keyframes adm-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes adm-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

    *, *::before, *::after { box-sizing: border-box; }

    html, body { overflow-x: hidden; }

    button, [role="button"] { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
    input, select, textarea { -webkit-tap-highlight-color: transparent; }

    .adm-root {
      font-family: 'Inter', sans-serif;
      background: ${t.bg};
      color: ${t.text};
      min-height: 100vh; min-height: 100dvh;
      display: flex; flex-direction: column; position: relative; overflow-x: hidden;
      transition: background .35s, color .35s;
      isolation: isolate;
      width: 100%;
    }

    /* ── Background atmosphere ── */
    .adm-bg-layer {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background:
        radial-gradient(ellipse 80% 60% at 5% -5%,  ${t.glow1} 0%, transparent 60%),
        radial-gradient(ellipse 60% 50% at 95% 105%, ${t.glow2} 0%, transparent 60%),
        radial-gradient(ellipse 50% 40% at 50% 50%,  ${t.glow3} 0%, transparent 70%);
    }
    .adm-noise {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      opacity: ${isDark ? ".028" : ".022"};
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 200px 200px;
    }

    /* ══ HEADER WRAPPER (sticky) ══════════════════════════════════════ */
    .adm-header-wrap {
      position: sticky; top: 0; z-index: 100;
      background: ${t.headerBg};
      backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
      border-bottom: 1px solid ${t.border};
    }
    .adm-header-top-line {
      height: 2px;
      background: linear-gradient(90deg, ${AURA.redDark} 0%, ${AURA.red} 25%, ${AURA.gold} 55%, ${AURA.blue} 100%);
    }

    /* ── Row 1: Brand + actions ── */
    .adm-topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; height: 60px; gap: 14px; position: relative;
    }
    .adm-topbar-l { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
    .adm-topbar-r { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    .adm-brand { display: flex; align-items: center; gap: 11px; min-width: 0; flex-shrink: 0; }
    .adm-brand-logo {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      overflow: hidden; position: relative;
      border: 1px solid rgba(200,16,46,.25);
      background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.blue});
    }
    .adm-brand-logo img { width: 100%; height: 100%; object-fit: cover; }
    .adm-brand-text { display: none; }
    @media (min-width: 480px) {
      .adm-brand-text { display: block; }
    }
    .adm-brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 14px; font-weight: 600;
      background: linear-gradient(90deg, ${isDark ? "#E8D5A3" : AURA.goldDim}, ${AURA.gold}, ${isDark ? "#C8906A" : AURA.redDark});
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      margin: 0; letter-spacing: .01em; line-height: 1.15; white-space: nowrap;
    }
    .adm-brand-sub {
      font-size: 7px; font-weight: 600; letter-spacing: .2em;
      text-transform: uppercase; color: ${t.textMuted}; margin: 2px 0 0;
      display: block; white-space: nowrap;
    }

    .adm-topbar-sep {
      width: 1px; height: 22px; flex-shrink: 0;
      background: ${t.border};
    }

    .adm-ico-btn {
      width: 36px; height: 36px; border-radius: 10px; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)"};
      border: 1px solid ${t.border}; color: ${t.textMuted};
      transition: all .22s; flex-shrink: 0;
    }
    .adm-ico-btn:hover { border-color: ${AURA.gold}44; color: ${AURA.gold}; background: ${isDark ? "rgba(201,169,110,.06)" : "rgba(201,169,110,.07)"}; }

    .adm-live-pill {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 12px; border-radius: 100px;
      background: rgba(5,150,105,.08);
      border: 1px solid rgba(5,150,105,.2);
      color: ${AURA.green};
      font-size: 8px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
      flex-shrink: 0;
    }
    .adm-live-dot { width: 6px; height: 6px; border-radius: 50%; background: ${AURA.green}; animation: adm-blink 2.5s ease-in-out infinite; box-shadow: 0 0 6px ${AURA.green}88; }

    .adm-cta-btn {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 8px 16px; border-radius: 9px; border: none; cursor: pointer;
      font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600;
      letter-spacing: .15em; text-transform: uppercase; transition: all .25s;
      flex-shrink: 0; white-space: nowrap;
    }
    .adm-cta-red {
      background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
      color: #fff; box-shadow: 0 4px 16px rgba(200,16,46,.25);
    }
    .adm-cta-red:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(200,16,46,.35); }
    .adm-cta-btn-label { display: none; }
    @media (min-width: 560px) { .adm-cta-btn-label { display: inline; } }

    .adm-user-chip {
      display: none;
      align-items: center; gap: 8px;
      padding: 6px 12px 6px 8px; border-radius: 100px;
      background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)"};
      border: 1px solid ${t.border};
      flex-shrink: 0;
    }
    @media (min-width: 900px) { .adm-user-chip { display: flex; } }
    .adm-user-chip-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: ${AURA.green}; flex-shrink: 0;
      box-shadow: 0 0 8px ${AURA.green}88;
      animation: adm-blink 2.8s ease-in-out infinite;
    }
    .adm-user-chip-name { font-size: 11px; font-weight: 600; color: ${t.text}; line-height: 1.1; white-space: nowrap; }
    .adm-user-chip-role { font-size: 7.5px; color: ${t.textMuted}; letter-spacing: .1em; text-transform: uppercase; line-height: 1.1; }

    /* ── Row 2: Desktop nav (sections) ── */
    .adm-nav-row {
      display: none;
      align-items: stretch;
      padding: 0 24px;
      gap: 2px;
      border-top: 1px solid ${t.border};
    }
    @media (min-width: 900px) { .adm-nav-row { display: flex; } }

    .adm-nav-sec-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 11px 16px; border: none; background: transparent; cursor: pointer;
      font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 600;
      letter-spacing: .06em; color: ${t.textSec};
      position: relative; transition: color .2s, background .2s;
      white-space: nowrap;
    }
    .adm-nav-sec-btn::after {
      content: ''; position: absolute; left: 16px; right: 16px; bottom: 0; height: 2px;
      border-radius: 2px 2px 0 0;
      background: var(--sc, ${AURA.gold});
      transform: scaleX(0); transition: transform .2s;
    }
    .adm-nav-sec-btn:hover { color: ${t.text}; background: ${isDark ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.025)"}; }
    .adm-nav-sec-btn.open { color: ${t.text}; }
    .adm-nav-sec-btn.open::after { transform: scaleX(1); }
    .adm-nav-sec-btn.has-active { color: var(--sc, ${AURA.gold}); }

    .adm-nav-sec-badge {
      background: ${AURA.yellow}; color: #080810;
      font-size: 8px; font-weight: 700; padding: 1px 6px; border-radius: 99px;
      animation: adm-blink 2.8s ease-in-out infinite; margin-left: 2px;
    }

    /* ── Mega menu panel (desktop) ── */
    .adm-megamenu-backdrop {
      position: fixed; inset: 0; z-index: 95; background: transparent;
    }
    .adm-megamenu {
      position: absolute; left: 0; right: 0; top: 100%; z-index: 96;
      background: ${t.megaBg};
      border-bottom: 1px solid ${t.border};
      box-shadow: 0 24px 60px rgba(0,0,0,.35);
      overflow: hidden;
    }
    .adm-megamenu-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 4px; padding: 18px 24px 22px;
      max-width: 1100px; margin: 0 auto;
    }
    @media (min-width: 1100px) { .adm-megamenu-grid { grid-template-columns: repeat(4, 1fr); } }

    .adm-mega-item {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 12px; border-radius: 13px;
      border: none; cursor: pointer; background: transparent; text-align: left;
      transition: background .16s;
    }
    .adm-mega-item:hover { background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.035)"}; }
    .adm-mega-item.act { background: ${isDark ? "rgba(255,255,255,.055)" : "rgba(0,0,0,.05)"}; }

    .adm-mega-ico {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .adm-mega-main { font-size: 12px; font-weight: 600; color: ${t.text}; display: block; line-height: 1.2; }
    .adm-mega-sub  { font-size: 9.5px; color: ${t.textMuted}; letter-spacing: .03em; display: block; margin-top: 1px; }
    .adm-mega-rel  { position: relative; flex: 1; min-width: 0; }
    .adm-mega-badge {
      position: absolute; right: 0; top: -2px;
      background: ${AURA.yellow}; color: #080810;
      font-size: 8px; font-weight: 700; padding: 1px 6px; border-radius: 99px;
    }

    /* ══ MOBILE OVERLAY (full screen) ══════════════════════════════════ */
    .adm-mobile-overlay {
      position: fixed; inset: 0; z-index: 250;
      background: ${t.overlayBg};
      display: flex; flex-direction: column;
    }
    .adm-mobile-overlay-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 18px; flex-shrink: 0;
      border-bottom: 1px solid rgba(201,169,110,.08);
    }
    .adm-mobile-overlay-body {
      flex: 1; overflow-y: auto; padding: 8px 0 24px;
    }
    .adm-mobile-sec-toggle {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; cursor: pointer; user-select: none; min-height: 48px;
    }
    .adm-mobile-sec-left { display: flex; align-items: center; gap: 9px; }
    .adm-mobile-sec-label {
      font-size: 12.5px; font-weight: 700; letter-spacing: .04em;
      color: rgba(245,240,232,.85);
    }
    .adm-mobile-nav-item {
      width: 100%; display: flex; align-items: center; gap: 12px;
      padding: 12px 20px 12px 32px; min-height: 48px;
      border: none; cursor: pointer; background: transparent; text-align: left;
      position: relative;
    }
    .adm-mobile-nav-item.act { background: rgba(255,255,255,.045); }
    .adm-mobile-nav-item::before {
      content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
      width: 2px; height: 0; border-radius: 0 2px 2px 0;
      background: var(--nc, ${AURA.gold}); transition: height .15s;
    }
    .adm-mobile-nav-item.act::before { height: 24px; }
    .adm-mobile-nav-ico {
      width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,.04);
    }
    .adm-mobile-nav-main { font-size: 12.5px; font-weight: 500; color: rgba(245,240,232,.55); display: block; line-height: 1.2; }
    .adm-mobile-nav-item.act .adm-mobile-nav-main { color: rgba(245,240,232,.95); font-weight: 600; }
    .adm-mobile-nav-sub { font-size: 9px; color: rgba(245,240,232,.2); margin-top: 2px; display: block; text-transform: uppercase; letter-spacing: .06em; }
    .adm-mobile-nav-badge {
      margin-left: auto; background: ${AURA.yellow}; color: #080810;
      font-size: 8.5px; font-weight: 700; padding: 2px 8px; border-radius: 99px;
      flex-shrink: 0;
    }
    .adm-mobile-overlay-foot {
      padding: 14px 18px 22px; flex-shrink: 0;
      border-top: 1px solid rgba(201,169,110,.08);
    }

    /* ══ MAIN ══ */
    .adm-main { flex: 1; display: flex; flex-direction: column; position: relative; z-index: 1; min-width: 0; }

    .adm-page-eyebrow {
      font-size: 7.5px; font-weight: 700; letter-spacing: .22em;
      text-transform: uppercase; color: ${t.textMuted}; margin: 0 0 2px;
    }
    .adm-page-title {
      font-family: 'Playfair Display', serif;
      font-size: 17px; font-weight: 500; color: ${t.text}; margin: 0; line-height: 1.1;
    }
    .adm-page-head { padding: 18px 22px 0; }
    @media (min-width: 640px) { .adm-page-head { padding: 22px 32px 0; } }

    /* ══ CONTENT ══ */
    .adm-content {
      flex: 1; padding: 16px 22px 24px;
      padding-bottom: max(36px, env(safe-area-inset-bottom, 36px));
    }
    @media (min-width: 640px) { .adm-content { padding: 18px 32px 28px; } }

    /* Card */
    .adm-card {
      background: ${t.bgEl}; border: 1px solid ${t.border};
      border-radius: 20px; overflow: hidden; position: relative;
      backdrop-filter: blur(24px);
    }
    .adm-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent 5%, rgba(201,169,110,.18) 40%, rgba(201,169,110,.18) 60%, transparent 95%);
      pointer-events: none;
    }

    /* KPI grid */
    .adm-kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 18px; }
    @media (min-width: 640px) { .adm-kpi-grid { grid-template-columns: repeat(4, 1fr); } }
    .adm-kpi {
      background: ${t.bgEl}; border: 1px solid ${t.border};
      border-radius: 18px; padding: 20px 18px; position: relative; overflow: hidden;
      backdrop-filter: blur(20px); transition: border-color .25s, transform .22s;
    }
    .adm-kpi:hover { border-color: ${t.borderHov}; transform: translateY(-2px); }
    .adm-kpi::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(201,169,110,.18), transparent);
    }
    .adm-kpi-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
    .adm-kpi-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .adm-kpi-num { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 600; line-height: 1; margin: 0 0 3px; }
    .adm-kpi-lbl { font-size: 8.5px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: ${t.textMuted}; }
    .adm-kpi-trend { font-size: 8px; font-weight: 500; color: ${t.textMuted}; margin-top: 2px; }

    /* Label */
    .adm-label {
      display: block; font-size: 8.5px; font-weight: 700; letter-spacing: .22em;
      text-transform: uppercase; color: rgba(201,169,110,.65); margin: 0 0 7px;
    }

    /* Input / Select */
    .adm-input {
      width: 100%; background: ${t.bgInput}; border: 1px solid ${t.borderIn};
      color: ${t.text}; padding: 12px 16px 12px 44px; border-radius: 12px;
      outline: none; font-family: 'Inter', sans-serif; font-size: 14px;
      font-weight: 300; transition: all .22s;
      -webkit-appearance: none; appearance: none;
    }
    .adm-input:focus {
      border-color: rgba(201,169,110,.45);
      box-shadow: 0 0 0 3px rgba(201,169,110,.07), 0 2px 12px rgba(0,0,0,.08);
    }
    .adm-input::placeholder { color: ${t.placeholder}; }

    .adm-select {
      width: 100%; background: ${t.bgInput}; border: 1px solid ${t.borderIn};
      color: ${t.text}; padding: 12px 14px 12px 44px; border-radius: 12px;
      outline: none; font-family: 'Inter', sans-serif; font-size: 12px;
      font-weight: 500; cursor: pointer; appearance: none; -webkit-appearance: none;
      transition: all .22s;
    }
    .adm-select:focus { border-color: rgba(201,169,110,.45); box-shadow: 0 0 0 3px rgba(201,169,110,.07); }

    /* Divider */
    .adm-divider {
      height: 1px; margin: 18px 0;
      background: linear-gradient(90deg, transparent 0%, ${t.border} 30%, ${t.border} 70%, transparent 100%);
    }

    /* User rows */
    .adm-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 22px; gap: 14px;
      border-bottom: 1px solid ${t.border};
      transition: background .15s; flex-wrap: wrap;
    }
    .adm-row:last-child { border-bottom: none; }
    .adm-row:hover { background: ${isDark ? "rgba(201,169,110,.025)" : "rgba(201,169,110,.03)"}; }
    .adm-row-l { display: flex; align-items: center; gap: 13px; flex: 1; min-width: 0; }
    .adm-row-r { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
    @media (max-width: 639px) {
      .adm-row-r { width: 100%; }
      .adm-row-r .adm-pending-action { flex: 1; justify-content: center; }
      .adm-row-r .adm-action-btn { flex-shrink: 0; }
    }

    .adm-avatar {
      width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
      overflow: hidden; position: relative; cursor: pointer;
      transition: transform .2s;
    }
    .adm-avatar:hover { transform: scale(1.06); }
    .adm-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .adm-avatar-placeholder {
      width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 600; color: #fff;
    }
    .adm-avatar-overlay {
      position: absolute; inset: 0; border-radius: 12px;
      background: rgba(0,0,0,.52); display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity .18s;
    }
    .adm-avatar:hover .adm-avatar-overlay { opacity: 1; }

    .adm-row-name { font-size: 12.5px; font-weight: 600; color: ${t.text}; margin: 0; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .adm-row-email { font-size: 11px; font-weight: 300; color: ${t.textMuted}; margin: 1px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Badges */
    .adm-badge {
      padding: 3px 10px; border-radius: 99px;
      font-size: 8px; font-weight: 600; letter-spacing: .1em;
      white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;
    }

    /* Row action btns */
    .adm-action-btn {
      width: 32px; height: 32px; border-radius: 9px;
      border: 1px solid ${t.border}; background: transparent; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: ${t.textMuted}; transition: all .18s;
    }
    .adm-action-btn:hover { transform: translateY(-1px); }

    .adm-pending-action {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 11px; border-radius: 8px; border: none; cursor: pointer;
      font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 600;
      letter-spacing: .1em; text-transform: uppercase; transition: all .2s;
    }

    /* Toast */
    .adm-toast {
      position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%);
      padding: 12px 20px; border-radius: 14px;
      font-family: 'Inter', sans-serif; font-size: 9.5px; font-weight: 600;
      letter-spacing: .12em; text-transform: uppercase;
      display: flex; align-items: center; gap: 10px; z-index: 600;
      max-width: 88vw; white-space: nowrap;
      backdrop-filter: blur(20px);
    }
    @media (max-width: 480px) {
      .adm-toast { max-width: 92vw; white-space: normal; bottom: 16px; padding: 11px 16px; }
      .adm-toast span { white-space: normal !important; max-width: none !important; }
    }

    /* Célula selector */
    .adm-celula-bar {
      background: ${t.bgEl}; border: 1px solid ${t.border};
      border-radius: 14px; padding: 13px 18px; margin-bottom: 16px;
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    }

    /* ══ MODAL ════════════════════════════════════════════════════════════ */
    .adm-drawer-accent {
      height: 2px; flex-shrink: 0;
      background: linear-gradient(90deg, ${AURA.blue} 0%, ${AURA.red} 40%, ${AURA.gold} 70%, ${AURA.goldLight} 100%);
    }

    .adm-modal-backdrop {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(0,0,0,.78);
      backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
      display: flex; align-items: flex-start; justify-content: center;
      padding: 60px 16px 40px;
      overflow-y: auto;
    }
    .adm-modal-box {
      width: 100%; max-width: 520px;
      background: ${t.drawerBg};
      border: 1px solid ${t.border};
      border-radius: 22px;
      overflow: hidden;
      box-shadow: 0 32px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(201,169,110,.06);
      position: relative;
    }
    .adm-modal-header { padding: 26px 28px 22px; border-bottom: 1px solid ${t.border}; position: relative; }
    .adm-modal-close { position: absolute; right: 20px; top: 20px; }
    .adm-modal-body { padding: 24px 28px; }
    .adm-modal-footer { padding: 18px 28px 24px; border-top: 1px solid ${t.border}; display: flex; gap: 10px; }
    .adm-modal-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }

    @media (max-width: 560px) {
      .adm-modal-backdrop { padding: 16px 10px 28px; align-items: center; }
      .adm-modal-box { border-radius: 18px; max-height: calc(100dvh - 32px); display: flex; flex-direction: column; }
      .adm-modal-header { padding: 22px 18px 18px; }
      .adm-modal-close { right: 14px; top: 14px; width: 32px !important; height: 32px !important; }
      .adm-modal-body { padding: 18px 18px; overflow-y: auto; flex: 1; }
      .adm-modal-footer { padding: 14px 18px 18px; flex-shrink: 0; }
      .adm-modal-form-grid { grid-template-columns: 1fr; gap: 0; }
      .adm-modal-form-grid > div { grid-column: 1 / -1 !important; }
    }

    .adm-btn-primary {
      flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 14px 20px; border-radius: 12px; border: none; cursor: pointer;
      font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
      letter-spacing: .15em; text-transform: uppercase; transition: all .25s;
    }
    .adm-btn-primary.blue {
      background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue});
      color: #fff; box-shadow: 0 6px 20px rgba(0,61,165,.22);
    }
    .adm-btn-primary.blue:hover { transform: translateY(-1px); box-shadow: 0 10px 26px rgba(0,61,165,.32); }
    .adm-btn-primary.red {
      background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
      color: #fff; box-shadow: 0 6px 20px rgba(200,16,46,.22);
    }
    .adm-btn-primary.red:hover { transform: translateY(-1px); box-shadow: 0 10px 26px rgba(200,16,46,.32); }

    .adm-btn-ghost {
      display: inline-flex; align-items: center; justify-content: center; gap: 7px;
      padding: 14px 18px; border-radius: 12px;
      border: 1px solid ${t.border}; cursor: pointer;
      background: transparent; color: ${t.textSec};
      font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500;
      letter-spacing: .1em; text-transform: uppercase; transition: all .22s;
    }
    .adm-btn-ghost:hover { border-color: ${t.borderHov}; color: ${t.text}; }

    /* Mobile */
    @media (max-width: 899px) {
      .adm-topbar { padding: 0 10px; height: 54px; gap: 8px; }
      .adm-topbar-l { gap: 8px; }
      .adm-topbar-r { gap: 5px; }
      .adm-cta-btn { padding: 9px 12px; }
      .adm-ico-btn { width: 38px; height: 38px; }
    }
    @media (max-width: 639px) {
      .adm-live-pill { display: none !important; }
      .adm-topbar-sep { display: none !important; }
      .adm-content { padding: 12px 12px 20px; }
      .adm-page-head { padding: 14px 12px 0; }
      .adm-kpi-grid { gap: 9px; }
      .adm-kpi { padding: 13px 12px; border-radius: 15px; }
      .adm-kpi-num { font-size: 21px; }
      .adm-kpi-icon { width: 32px; height: 32px; }
      .adm-kpi-trend { font-size: 7.5px; }
      .adm-row { flex-direction: column; align-items: stretch; gap: 10px; padding: 13px 14px; }
      .adm-row-r { justify-content: flex-stretch; }
      .adm-row-name { white-space: normal; }
      .adm-row-email { white-space: normal; word-break: break-all; }
      .adm-action-btn { width: 36px; height: 36px; }
      .adm-celula-bar { padding: 11px 14px; }
      .adm-card-header { padding: 15px 14px !important; }
    }
    @media (max-width: 380px) {
      .adm-brand-sub { display: none; }
      .adm-cta-btn-label { display: none !important; }
      .adm-cta-btn { padding: 9px 10px; }
      .adm-exit-modal { padding: 28px 18px 20px !important; }
    }

    /* Footer */
    .adm-footer-txt {
      text-align: center; font-size: 7.5px; font-weight: 500;
      letter-spacing: .2em; text-transform: uppercase; padding: 16px 0 0;
      color: ${isDark ? "rgba(245,240,232,.07)" : "rgba(26,16,8,.1)"};
    }
    `}</style>
  );
}

/* ─── InputField ─────────────────────────────────────────────────────────── */
function InputField({ icon, type = "text", value, onChange, placeholder, required, isDark, t }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: AURA.gold, opacity: .5, pointerEvents: "none", zIndex: 1 }}>
          {icon}
        </div>
        <input
            className="adm-input"
            type={isPass && show ? "text" : type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            style={{ paddingRight: isPass ? 46 : 16 }}
        />
        {isPass && (
            <button type="button" onClick={() => setShow(v => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 4, display: "flex" }}>
              {show ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
        )}
      </div>
  );
}

/* ─── ModuloRenderer ─────────────────────────────────────────────────────── */
function ModuloRenderer({ moduloKey, isDark, celulaAdmin }) {
  const p = { isDark };
  switch (moduloKey) {
    case "membros":           return <Membros {...p}/>;
    case "visitantes":        return <Visitantes {...p}/>;
    case "celulas":           return <Celulas {...p}/>;
    case "fichas":            return <FichasEncontro {...p}/>;
    case "secretariacelulas": return <SecretariaCelulas {...p}/>;
    case "painel-pastor":     return <PainelPastor {...p}/>;
    case "relatorios":        return <RelatorioCelula {...p}/>;
    case "discipulado":       return <Discipulado {...p}/>;
    case "multiplicacoes":    return <SolicitacoesMultiplicacao {...p}/>;
    case "ranking":           return <RankingCelulas {...p}/>;
    case "casas-de-paz":      return <RelatorioCasasDePaz {...p}/>;
    case "missao70":          return <RelatorioMissao70Pastor {...p}/>;
    case "pendencias":        return <TelaPendencias {...p}/>;
    case "alertas":           return <PainelAlertas {...p}/>;
    case "lider-relatorio":   return <TelaRelatorio celula={celulaAdmin} {...p}/>;
    case "lider-discipulado": return <RelatorioDiscipulado membros={[]} {...p}/>;
    case "lider-visitantes":  return <TelaVisitantes celulaId={celulaAdmin?.id} {...p}/>;
    case "lider-fichas":      return <TelaFichas celula={celulaAdmin} {...p}/>;
    case "lider-casas":       return <CasasDePazLider celulaId={celulaAdmin?.id} {...p}/>;
    case "lider-missao70":    return <Missao70Lider celulaId={celulaAdmin?.id} {...p}/>;
    case "teso-dashboard":    return <TesourariaDashboard {...p}/>;
    case "teso-lancamento":   return <TesourariaLancamento {...p}/>;
    case "teso-relatorio":    return <TesourariaRelatorio {...p}/>;
    case "teso-dizimistas":   return <TesourariaDizimistas {...p}/>;
    case "teso-comparativo":  return <TesourariaComparativo {...p}/>;
    default: return null;
  }
}

/* ════════════════════════════════════════════════════════════════════════════ */
export default function AdminUsers() {
  const [usuarios,       setUsuarios]       = useState([]);
  const [pendentes,      setPendentes]      = useState(new Set());
  const [loading,        setLoading]        = useState(true);
  const [sending,        setSending]        = useState(false);
  const [aprovando,      setAprovando]      = useState(null);
  const [uploadandoFoto, setUploadandoFoto] = useState(null);
  const [erro,           setErro]           = useState("");
  const [sucesso,        setSucesso]        = useState("");
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [editandoId,     setEditandoId]     = useState(null);
  const [exitConfirm,    setExitConfirm]    = useState(false);
  const [form,           setForm]           = useState({ nome:"", email:"", senha:"", perfil:"LIDER_CELULA", telefoneWhatsapp:"55" });
  const [isDark,         setIsDark]         = useState(() => localStorage.getItem("theme") === "dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaOpenId,     setMegaOpenId]     = useState(null); // desktop mega-menu (id da seção aberta)
  const [moduloAtivo,    setModuloAtivo]    = useState("usuarios");
  const [secaoExpMobile, setSecaoExpMobile] = useState("admin");
  const [celulas,        setCelulas]        = useState([]);
  const [celulaAdmin,    setCelulaAdmin]    = useState(null);

  const fotoRef   = useRef(null);
  const fotoIdRef = useRef(null);
  const navRowRef = useRef(null);
  const t = theme(isDark);

  useEffect(() => { localStorage.setItem("theme", isDark ? "dark" : "light"); }, [isDark]);

  // Trava o scroll do body quando o overlay mobile está aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileMenuOpen]);

  // Fecha o mega-menu com ESC
  useEffect(() => {
    if (!megaOpenId) return;
    const onKey = e => { if (e.key === "Escape") setMegaOpenId(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [megaOpenId]);

  const carregarUsuarios = useCallback(async () => {
    setLoading(true); setErro("");
    try {
      const [ru, rp, rc] = await Promise.all([
        api.get("usuarios"),
        api.get("usuarios/com-alteracao-pendente"),
        api.get("celulas"),
      ]);
      const data = ru.data;
      setUsuarios(Array.isArray(data) ? data : data?.content ?? data?.usuarios ?? []);
      const pd = rp.data;
      const pl = Array.isArray(pd) ? pd : pd?.content ?? pd?.usuarios ?? [];
      setPendentes(new Set(pl.map(u => u.id)));
      setCelulas(rc.data || []);
      if (rc.data?.length > 0 && !celulaAdmin) setCelulaAdmin(rc.data[0]);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); window.location.href = "/"; return; }
      setErro("Não foi possível sincronizar os dados.");
    } finally { setLoading(false); }
  }, [celulaAdmin]);

  useEffect(() => { carregarUsuarios(); }, [carregarUsuarios]);

  const ok = msg => { setSucesso(msg); setTimeout(() => setSucesso(""), 3500); };

  const adicionarUsuario = async e => {
    e.preventDefault(); setSending(true); setErro("");
    const tel = form.telefoneWhatsapp?.replace(/\D/g, "") || "";
    try {
      await api.post("usuarios", { ...form, telefoneWhatsapp: tel });
      setForm({ nome:"", email:"", senha:"", perfil:"LIDER_CELULA", telefoneWhatsapp:"55" });
      carregarUsuarios(); ok("Acesso liberado com sucesso."); setDrawerOpen(false);
    } catch { setErro("Falha ao criar novo acesso."); }
    finally { setSending(false); }
  };

  const salvarEdicao = async e => {
    e.preventDefault(); setSending(true);
    const tel = form.telefoneWhatsapp?.replace(/\D/g, "") || "";
    try {
      await api.put(`usuarios/${editandoId}`, { ...form, telefoneWhatsapp: tel });
      setDrawerOpen(false); setEditandoId(null);
      setForm({ nome:"", email:"", senha:"", perfil:"LIDER_CELULA", telefoneWhatsapp:"55" });
      carregarUsuarios(); ok("Dados atualizados.");
    } catch { setErro("Erro ao atualizar dados."); }
    finally { setSending(false); }
  };

  const deletarUsuario = async id => {
    if (!window.confirm("Remover permanentemente este acesso?")) return;
    try { await api.delete(`usuarios/${id}`); carregarUsuarios(); }
    catch { setErro("Erro ao deletar."); }
  };

  const alternarStatus = async id => {
    try { await api.patch(`usuarios/${id}/status`); carregarUsuarios(); }
    catch { setErro("Erro ao alterar status."); }
  };

  const aprovarAlteracao = async (id, nome) => {
    if (!window.confirm(`Aprovar a solicitação de "${nome}"?`)) return;
    setAprovando(id);
    try { await api.patch(`usuarios/${id}/aprovar-alteracao`); ok(`Alteração de ${nome} aprovada.`); carregarUsuarios(); }
    catch { setErro("Erro ao aprovar."); }
    finally { setAprovando(null); }
  };

  const rejeitarAlteracao = async (id, nome) => {
    if (!window.confirm(`Rejeitar a solicitação de "${nome}"?`)) return;
    setAprovando(id);
    try { await api.patch(`usuarios/${id}/rejeitar-alteracao`); ok(`Alteração de ${nome} rejeitada.`); carregarUsuarios(); }
    catch { setErro("Erro ao rejeitar."); }
    finally { setAprovando(null); }
  };

  const abrirSeletorFoto = id => { fotoIdRef.current = id; fotoRef.current.click(); };
  const handleFoto = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErro("Selecione uma imagem válida."); return; }
    if (file.size > 2 * 1024 * 1024) { setErro("Imagem deve ter no máximo 2 MB."); return; }
    const id = fotoIdRef.current;
    setUploadandoFoto(id);
    try {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
      await api.patch(`usuarios/${id}/foto`, { fotoBase64: base64 });
      ok("Foto atualizada."); carregarUsuarios();
    } catch { setErro("Erro ao enviar foto."); }
    finally { setUploadandoFoto(null); e.target.value = ""; }
  };

  const abrirEdicao = u => {
    setEditandoId(u.id);
    setForm({ nome:u.nome, email:u.email, senha:"", perfil:u.perfil, telefoneWhatsapp:u.telefoneWhatsapp || "55" });
    setDrawerOpen(true);
  };

  const abrirNovo = () => {
    setEditandoId(null);
    setForm({ nome:"", email:"", senha:"", perfil:"LIDER_CELULA", telefoneWhatsapp:"55" });
    setDrawerOpen(true);
  };

  const selecionarModulo = key => {
    setModuloAtivo(key);
    setMegaOpenId(null);
    setMobileMenuOpen(false);
  };

  const qtdPend   = pendentes.size;
  const isLider   = moduloAtivo?.startsWith("lider-");
  const secaoAtiva = SECOES.find(s => s.itens.some(i => i.key === moduloAtivo));
  const itemAtivo  = SECOES.flatMap(s => s.itens).find(i => i.key === moduloAtivo);
  const ativos     = usuarios.filter(u =>  u.ativo).length;
  const suspensos  = usuarios.filter(u => !u.ativo).length;

  /* Loading screen */
  if (loading && usuarios.length === 0) return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background: isDark ? "#080810" : "#F2EDE4" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:56, height:56, borderRadius:16, background:`linear-gradient(135deg,${AURA.redDark},${AURA.blue})`, margin:"0 auto 18px", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 16px 40px rgba(200,16,46,.3)` }}>
            <Shield size={24} color="#fff"/>
          </div>
          <p style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, letterSpacing:".22em", fontSize:9, color: isDark ? AURA.gold : AURA.redDark, textTransform:"uppercase", margin:0 }}>Carregando…</p>
        </div>
      </div>
  );

  return (
      <div className="adm-root">
        <GlobalStyles t={t} isDark={isDark} />
        <div className="adm-bg-layer" />
        <div className="adm-noise" />

        {/* ════════════════════════════════════════════════════════════════
            HEADER (sticky) — Topbar + nav row (desktop) + mega-menu
        ════════════════════════════════════════════════════════════════ */}
        <div className="adm-header-wrap">
          <div className="adm-header-top-line" />

          {/* Row 1: brand + actions */}
          <div className="adm-topbar">
            <div className="adm-topbar-l">
              <button className="adm-ico-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Menu" style={{ display: "flex" }}>
                <Menu size={18} />
              </button>
              <div className="adm-topbar-sep" style={{ display: "block" }} />
              <div className="adm-brand">
                <div className="adm-brand-logo">
                  <img src="/quadrangular.png" alt="IEQ" onError={e => { e.target.style.display="none"; }} />
                </div>
                <div className="adm-brand-text">
                  <p className="adm-brand-name">IEQ Pituaçu</p>
                  <span className="adm-brand-sub">Painel Admin</span>
                </div>
              </div>
            </div>

            <div className="adm-topbar-r">
              <div className="adm-user-chip">
                <div className="adm-user-chip-dot" />
                <div>
                  <p className="adm-user-chip-name">Administrador</p>
                  <p className="adm-user-chip-role">Admin · IEQ</p>
                </div>
              </div>
              <div className="adm-live-pill">
                <div className="adm-live-dot" />
                Online
              </div>
              <div className="adm-topbar-sep" />
              <button className="adm-ico-btn" onClick={() => setIsDark(!isDark)} aria-label="Tema">
                {isDark ? <Sun size={15}/> : <Moon size={15}/>}
              </button>
              <button className="adm-ico-btn" onClick={carregarUsuarios} aria-label="Atualizar">
                <RefreshCcw size={15} style={{ animation: loading ? "adm-spin 1s linear infinite" : "none" }} />
              </button>
              <div className="adm-topbar-sep" />
              <button className="adm-ico-btn" onClick={() => setExitConfirm(true)} aria-label="Sair" title="Sair do sistema">
                <LogOut size={15} />
              </button>
              {moduloAtivo === "usuarios" && (
                  <>
                    <div className="adm-topbar-sep" />
                    <button className="adm-cta-btn adm-cta-red" onClick={abrirNovo}>
                      <UserPlus size={13}/> <span className="adm-cta-btn-label">Novo usuário</span>
                    </button>
                  </>
              )}
            </div>
          </div>

          {/* Row 2: desktop section nav */}
          <nav className="adm-nav-row" ref={navRowRef}>
            {SECOES.map(sec => {
              const SIcon = sec.icon;
              const open = megaOpenId === sec.id;
              const hasActive = sec.itens.some(i => i.key === moduloAtivo);
              return (
                  <button key={sec.id}
                          className={`adm-nav-sec-btn${open ? " open" : ""}${hasActive ? " has-active" : ""}`}
                          style={{ "--sc": sec.color }}
                          onClick={() => setMegaOpenId(open ? null : sec.id)}>
                    <SIcon size={13} />
                    {sec.label}
                    {sec.id === "admin" && qtdPend > 0 && <span className="adm-nav-sec-badge">{qtdPend}</span>}
                    <ChevronDown size={11} style={{ opacity:.5, transform: open ? "rotate(180deg)" : "none", transition:"transform .2s" }} />
                  </button>
              );
            })}
          </nav>

          {/* Mega menu (desktop) */}
          <AnimatePresence>
            {megaOpenId && (
                <>
                  <div className="adm-megamenu-backdrop" onClick={() => setMegaOpenId(null)} />
                  <motion.div className="adm-megamenu"
                              initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                              transition={{ duration:.16 }}>
                    <div className="adm-megamenu-grid">
                      {SECOES.find(s => s.id === megaOpenId)?.itens.map(item => {
                        const IIcon = item.icon;
                        const ativo = moduloAtivo === item.key;
                        const sec = SECOES.find(s => s.id === megaOpenId);
                        return (
                            <button key={item.key} className={`adm-mega-item${ativo ? " act" : ""}`} onClick={() => selecionarModulo(item.key)}>
                              <div className="adm-mega-ico" style={{ background: ativo ? sec.color : (isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.045)") }}>
                                <IIcon size={16} style={{ color: ativo ? "#fff" : sec.color, opacity: ativo ? 1 : .75 }} />
                              </div>
                              <div className="adm-mega-rel">
                                <span className="adm-mega-main">{item.label}</span>
                                <span className="adm-mega-sub">{item.sub}</span>
                                {item.key === "usuarios" && qtdPend > 0 && <span className="adm-mega-badge">{qtdPend}</span>}
                              </div>
                            </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
            )}
          </AnimatePresence>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            MOBILE OVERLAY (tela cheia)
        ════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {mobileMenuOpen && (
              <motion.div className="adm-mobile-overlay"
                          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          transition={{ duration:.2 }}>
                <div className="adm-mobile-overlay-head">
                  <div className="adm-brand">
                    <div className="adm-brand-logo">
                      <img src="/quadrangular.png" alt="IEQ" onError={e => { e.target.style.display="none"; }} />
                    </div>
                    <div>
                      <p className="adm-brand-name">IEQ Pituaçu</p>
                      <span className="adm-brand-sub">Painel Administrativo</span>
                    </div>
                  </div>
                  <button className="adm-ico-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Fechar menu">
                    <X size={18} />
                  </button>
                </div>

                <div className="adm-mobile-overlay-body">
                  {SECOES.map(sec => {
                    const SIcon = sec.icon;
                    const exp = secaoExpMobile === sec.id;
                    return (
                        <div key={sec.id}>
                          <div className="adm-mobile-sec-toggle" onClick={() => setSecaoExpMobile(exp ? null : sec.id)}>
                            <div className="adm-mobile-sec-left">
                              <SIcon size={14} style={{ color: sec.color }} />
                              <span className="adm-mobile-sec-label">{sec.label}</span>
                              {sec.id === "admin" && qtdPend > 0 && <span className="adm-mobile-nav-badge" style={{ marginLeft: 4 }}>{qtdPend}</span>}
                            </div>
                            <ChevronDown size={14} style={{ color:"rgba(245,240,232,.3)", transform: exp ? "rotate(180deg)" : "none", transition:"transform .2s" }} />
                          </div>
                          <AnimatePresence>
                            {exp && (
                                <motion.div
                                    initial={{ height:0, opacity:0 }}
                                    animate={{ height:"auto", opacity:1 }}
                                    exit={{ height:0, opacity:0 }}
                                    transition={{ duration:.16 }}
                                    style={{ overflow:"hidden" }}
                                >
                                  {sec.itens.map(item => {
                                    const IIcon = item.icon;
                                    const ativo = moduloAtivo === item.key;
                                    return (
                                        <button key={item.key}
                                                className={`adm-mobile-nav-item${ativo ? " act" : ""}`}
                                                style={{ "--nc": sec.color }}
                                                onClick={() => selecionarModulo(item.key)}>
                                          <div className="adm-mobile-nav-ico">
                                            <IIcon size={14} style={{ color: ativo ? "#fff" : sec.color, opacity: ativo ? 1 : .65 }} />
                                          </div>
                                          <div style={{ flex:1, minWidth:0 }}>
                                            <span className="adm-mobile-nav-main">{item.label}</span>
                                            <span className="adm-mobile-nav-sub">{item.sub}</span>
                                          </div>
                                          {item.key === "usuarios" && qtdPend > 0 && (
                                              <span className="adm-mobile-nav-badge">{qtdPend}</span>
                                          )}
                                        </button>
                                    );
                                  })}
                                </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                    );
                  })}
                </div>

                <div className="adm-mobile-overlay-foot">
                  <button className="adm-btn-primary red" style={{ width:"100%" }} onClick={() => { setMobileMenuOpen(false); setExitConfirm(true); }}>
                    <LogOut size={14} /> Sair do sistema
                  </button>
                  <p style={{ textAlign:"center", fontSize:7.5, letterSpacing:".16em", color:"rgba(245,240,232,.12)", marginTop:14, textTransform:"uppercase", fontFamily:"'Inter',sans-serif" }}>
                    © IEQ Pituaçu · {new Date().getFullYear()}
                  </p>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* ─── MAIN ─────────────────────────────────────────────────────── */}
        <main className="adm-main">

          <div className="adm-page-head">
            <p className="adm-page-eyebrow">{secaoAtiva?.label || "Admin"}</p>
            <motion.h2 className="adm-page-title" key={moduloAtivo}
                       initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ duration:.2 }}>
              {itemAtivo?.label || "Painel"}
            </motion.h2>
          </div>

          {/* Content */}
          <div className="adm-content">

            {/* Seletor célula */}
            {isLider && celulas.length > 0 && (
                <div className="adm-celula-bar" style={{ marginTop: 14 }}>
                  <Building2 size={15} style={{ color:AURA.blue, flexShrink:0 }} />
                  <span style={{ fontSize:9, fontWeight:600, letterSpacing:".14em", textTransform:"uppercase", color:t.textMuted, flexShrink:0 }}>Célula:</span>
                  <div style={{ position:"relative", flex:1 }}>
                    <select className="adm-select" style={{ paddingLeft:16 }}
                            value={celulaAdmin?.id || ""}
                            onChange={e => setCelulaAdmin(celulas.find(c => c.id === Number(e.target.value)))}>
                      {celulas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div key={moduloAtivo}
                          initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
                          transition={{ duration:.18 }}
                          style={{ marginTop: isLider && celulas.length > 0 ? 0 : 14 }}>

                {/* ══ PAINEL USUÁRIOS ══ */}
                {moduloAtivo === "usuarios" && (
                    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                      {/* KPIs */}
                      <div className="adm-kpi-grid">
                        {[
                          { label:"Total",     value:usuarios.length, color:AURA.blue,       bg:"rgba(0,61,165,.08)",    icon:<Users size={16}/>,  trend:"usuários cadastrados" },
                          { label:"Ativos",    value:ativos,          color:AURA.green,      bg:"rgba(5,150,105,.08)",   icon:<Power size={16}/>,  trend:"com acesso liberado"  },
                          { label:"Suspensos", value:suspensos,       color:AURA.red,        bg:"rgba(200,16,46,.08)",   icon:<Shield size={16}/>, trend:"acesso bloqueado"     },
                          { label:"Pendentes", value:qtdPend,         color:AURA.yellowDark, bg:"rgba(196,140,0,.08)",   icon:<Clock size={16}/>,  trend:"aguardando aprovação" },
                        ].map(k => (
                            <div key={k.label} className="adm-kpi">
                              <div className="adm-kpi-top">
                                <div>
                                  <p className="adm-kpi-num" style={{ color: k.label === "Pendentes" && k.value > 0 ? AURA.yellowDark : t.text }}>{k.value}</p>
                                  <p className="adm-kpi-lbl">{k.label}</p>
                                </div>
                                <div className="adm-kpi-icon" style={{ background:k.bg, color:k.color }}>
                                  {k.icon}
                                </div>
                              </div>
                              <p className="adm-kpi-trend">{k.trend}</p>
                            </div>
                        ))}
                      </div>

                      {/* Lista de usuários */}
                      <div className="adm-card">
                        {/* Alerta pendentes */}
                        {qtdPend > 0 && (
                            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 22px", background:"rgba(253,184,19,.06)", borderBottom:`1px solid rgba(253,184,19,.15)` }}>
                              <Clock size={12} style={{ color:AURA.yellowDark }} />
                              <span style={{ fontSize:8.5, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:AURA.yellowDark }}>
                          {qtdPend} solicitaç{qtdPend > 1 ? "ões" : "ão"} aguardando aprovação
                        </span>
                            </div>
                        )}

                        {/* Header card */}
                        <div className="adm-card-header" style={{ padding:"18px 22px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
                          <div>
                            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:500, color:t.text, margin:0, lineHeight:1.1 }}>Base de Usuários</h3>
                            <p style={{ fontSize:11, fontWeight:300, color:t.textMuted, margin:"2px 0 0" }}>{usuarios.length} registros</p>
                          </div>
                          <button className="adm-btn-ghost" style={{ padding:"8px 14px", fontSize:8, letterSpacing:".14em" }} onClick={carregarUsuarios}>
                            <RefreshCcw size={12} style={{ animation:loading?"adm-spin 1s linear infinite":"none" }} /> Atualizar
                          </button>
                        </div>

                        <AnimatePresence>
                          {usuarios.map((u, i) => {
                            const temP = pendentes.has(u.id);
                            const eApr = aprovando === u.id;
                            const eFoto = uploadandoFoto === u.id;
                            return (
                                <motion.div key={u.id} className="adm-row"
                                            initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-16 }}
                                            transition={{ delay: i * .025 }}
                                            style={{ borderLeft:`3px solid ${temP ? AURA.yellow : "transparent"}` }}>

                                  {/* Left */}
                                  <div className="adm-row-l">
                                    <div className="adm-avatar"
                                         style={{ border:`1.5px solid ${temP ? AURA.yellow+"55" : t.border}`, opacity: u.ativo ? 1 : .5 }}
                                         onClick={() => abrirSeletorFoto(u.id)}>
                                      {u.fotoPerfil
                                          ? <img src={getFotoUrl(u.fotoPerfil)} alt={u.nome} />
                                          : <div className="adm-avatar-placeholder"
                                                 style={{ background: u.ativo ? `linear-gradient(135deg,${AURA.redDark},${AURA.blue})` : (isDark?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)") }}>
                                            {u.nome?.charAt(0).toUpperCase()}
                                          </div>
                                      }
                                      <div className="adm-avatar-overlay">
                                        {eFoto ? <Loader2 size={13} color="#fff" style={{ animation:"adm-spin 1s linear infinite" }}/> : <Camera size={13} color="#fff"/>}
                                      </div>
                                    </div>
                                    <div style={{ flex:1, minWidth:0 }}>
                                      <p className="adm-row-name">{u.nome}</p>
                                      <p className="adm-row-email">{u.email}</p>
                                    </div>
                                  </div>

                                  {/* Right */}
                                  <div className="adm-row-r">
                              <span className="adm-badge" style={{ background:"rgba(0,61,165,.07)", border:"1px solid rgba(0,61,165,.18)", color:AURA.blue }}>
                                {u.perfil?.replace(/_/g," ")}
                              </span>
                                    <span className="adm-badge" style={{ background:u.ativo?"rgba(5,150,105,.07)":"rgba(0,0,0,.04)", border:`1px solid ${u.ativo?"rgba(5,150,105,.2)":"rgba(0,0,0,.07)"}`, color:u.ativo?AURA.green:t.textMuted }}>
                                <span style={{ width:5, height:5, borderRadius:"50%", background:u.ativo?AURA.green:t.textMuted, flexShrink:0, display:"block" }}/>
                                      {u.ativo ? "Ativo" : "Suspenso"}
                              </span>

                                    {/* Aprovação */}
                                    {temP && (
                                        <>
                                          <button disabled={eApr} onClick={() => aprovarAlteracao(u.id, u.nome)}
                                                  className="adm-pending-action"
                                                  style={{ background:"rgba(5,150,105,.07)", border:"1px solid rgba(5,150,105,.22)", color:AURA.green }}>
                                            {eApr ? <Loader2 size={11} style={{ animation:"adm-spin 1s linear infinite" }}/> : <CheckCircle size={11}/>} Aprovar
                                          </button>
                                          <button disabled={eApr} onClick={() => rejeitarAlteracao(u.id, u.nome)}
                                                  className="adm-pending-action"
                                                  style={{ background:"rgba(200,16,46,.07)", border:"1px solid rgba(200,16,46,.22)", color:AURA.red }}>
                                            {eApr ? <Loader2 size={11} style={{ animation:"adm-spin 1s linear infinite" }}/> : <XCircle size={11}/>} Rejeitar
                                          </button>
                                        </>
                                    )}

                                    {/* Ações */}
                                    {[
                                      { icon:<Pencil size={14}/>,  title:"Editar",    fn:() => abrirEdicao(u),      hc:AURA.blue,       hb:"rgba(0,61,165,.08)"   },
                                      { icon:<Power size={14}/>,   title:"Suspender", fn:() => alternarStatus(u.id),hc:AURA.yellowDark, hb:"rgba(196,140,0,.08)"  },
                                      { icon:<Trash2 size={14}/>,  title:"Excluir",   fn:() => deletarUsuario(u.id),hc:AURA.red,        hb:"rgba(200,16,46,.08)"  },
                                    ].map(btn => (
                                        <button key={btn.title} className="adm-action-btn" onClick={btn.fn} title={btn.title}
                                                onMouseEnter={e => { e.currentTarget.style.color=btn.hc; e.currentTarget.style.background=btn.hb; e.currentTarget.style.borderColor=btn.hc+"44"; }}
                                                onMouseLeave={e => { e.currentTarget.style.color=t.textMuted; e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor=t.border; }}>
                                          {btn.icon}
                                        </button>
                                    ))}
                                  </div>
                                </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                )}

                {/* ══ HISTÓRICO ══ */}
                {moduloAtivo === "historico" && (
                    <div className="adm-card">
                      <HistoricoAuditoria isDark={isDark} />
                    </div>
                )}

                {/* ══ OUTROS ══ */}
                {moduloAtivo !== "usuarios" && moduloAtivo !== "historico" && (
                    <ModuloRenderer moduloKey={moduloAtivo} isDark={isDark} celulaAdmin={celulaAdmin} />
                )}
              </motion.div>
            </AnimatePresence>

            <p className="adm-footer-txt">© {new Date().getFullYear()} IEQ Pituaçu · Sistema Eclesiástico · Admin Total</p>
          </div>
        </main>

        {/* Input foto oculto */}
        <input ref={fotoRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFoto} />

        {/* ════ MODAL CENTRADO — vindo do topo ═══════════════════════════ */}
        <AnimatePresence>
          {drawerOpen && (
              <motion.div
                  className="adm-modal-backdrop"
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  transition={{ duration:.2 }}
                  onClick={e => { if (e.target === e.currentTarget) setDrawerOpen(false); }}
              >
                <motion.div
                    className="adm-modal-box"
                    initial={{ opacity:0, y:-32, scale:.96 }}
                    animate={{ opacity:1, y:0,   scale:1   }}
                    exit={{    opacity:0, y:-20,  scale:.97 }}
                    transition={{ type:"spring", damping:28, stiffness:280 }}
                >
                  {/* Linha topo colorida */}
                  <div style={{ height:2, background:`linear-gradient(90deg, ${AURA.blue}, ${AURA.red} 40%, ${AURA.gold} 70%, ${AURA.goldLight})`, flexShrink:0 }} />

                  {/* Header */}
                  <div className="adm-modal-header">
                    {/* Botão fechar */}
                    <button className="adm-modal-close" onClick={() => setDrawerOpen(false)} style={{
                      position:"absolute",
                      width:34, height:34, borderRadius:10, border:`1px solid ${t.border}`,
                      background: isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",
                      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                      color:t.textMuted, transition:"all .2s",
                    }}
                            onMouseEnter={e => { e.currentTarget.style.color=AURA.red; e.currentTarget.style.borderColor="rgba(200,16,46,.3)"; e.currentTarget.style.background="rgba(200,16,46,.06)"; }}
                            onMouseLeave={e => { e.currentTarget.style.color=t.textMuted; e.currentTarget.style.borderColor=t.border; e.currentTarget.style.background=isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)"; }}>
                      <X size={16}/>
                    </button>

                    {/* Ícone + título lado a lado */}
                    <div style={{ display:"flex", alignItems:"center", gap:16, paddingRight:36 }}>
                      <div style={{
                        width:52, height:52, borderRadius:15, flexShrink:0,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        background: editandoId
                            ? `linear-gradient(135deg,${AURA.blueDark},${AURA.blue})`
                            : `linear-gradient(135deg,${AURA.redDark},${AURA.red})`,
                        boxShadow: editandoId
                            ? "0 8px 24px rgba(0,61,165,.28)"
                            : "0 8px 24px rgba(200,16,46,.28)",
                      }}>
                        {editandoId ? <Pencil size={20} color="#fff"/> : <UserPlus size={20} color="#fff"/>}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:8, fontWeight:700, letterSpacing:".26em", textTransform:"uppercase", color:t.textMuted, margin:"0 0 4px" }}>
                          {editandoId ? "Editar registro" : "Novo registro"}
                        </p>
                        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:500, color:t.text, margin:"0 0 2px", lineHeight:1.1 }}>
                          {editandoId ? "Editar Usuário" : "Liberar Acesso"}
                        </h2>
                        <p style={{ fontSize:12, fontWeight:300, color:t.textMuted, margin:0 }}>
                          {editandoId ? `Atualizando dados · ID ${editandoId}` : "Preencha os dados para criar novo acesso"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Corpo */}
                  <div className="adm-modal-body">
                    <form id="modal-form" onSubmit={editandoId ? salvarEdicao : adicionarUsuario}>
                      <div className="adm-modal-form-grid">
                        {[
                          { icon:<User size={14}/>,  type:"text",     placeholder:"Nome completo",    key:"nome",             label:"Nome",     req:true,  col:"1/-1" },
                          { icon:<Mail size={14}/>,  type:"email",    placeholder:"E-mail",            key:"email",            label:"E-mail",   req:true,  col:"1/-1" },
                          { icon:<Key size={14}/>,   type:"password", placeholder:editandoId?"Manter senha atual":"Senha de acesso", key:"senha", label:"Senha", req:!editandoId, col:"1/2" },
                          { icon:<Phone size={14}/>, type:"tel",      placeholder:"WhatsApp com DDD",  key:"telefoneWhatsapp", label:"WhatsApp", req:false, col:"2/3" },
                        ].map(f => (
                            <div key={f.key} style={{ gridColumn:f.col, marginBottom:16 }}>
                              <label className="adm-label">{f.label}</label>
                              <InputField icon={f.icon} type={f.type} placeholder={f.placeholder}
                                          value={form[f.key]} onChange={v => setForm({...form,[f.key]:v})}
                                          required={f.req} isDark={isDark} t={t} />
                            </div>
                        ))}
                      </div>

                      <div style={{ marginBottom:16 }}>
                        <label className="adm-label">Perfil de Acesso</label>
                        <div style={{ position:"relative" }}>
                          <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:AURA.gold, opacity:.5, pointerEvents:"none" }}>
                            <Shield size={14}/>
                          </div>
                          <select className="adm-select" value={form.perfil} onChange={e => setForm({...form, perfil:e.target.value})}>
                            {perfis.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
                          </select>
                        </div>
                      </div>

                      <div style={{ padding:"12px 16px", borderRadius:12, background:isDark?"rgba(201,169,110,.04)":"rgba(201,169,110,.05)", border:`1px solid ${t.border}` }}>
                        <p style={{ fontSize:10, fontWeight:400, color:t.textSec, margin:0, lineHeight:1.65 }}>
                          {editandoId
                              ? "Alterações ficam pendentes de aprovação pelo administrador."
                              : "O usuário receberá as instruções de primeiro acesso ao sistema."}
                        </p>
                      </div>
                    </form>
                  </div>

                  {/* Rodapé */}
                  <div className="adm-modal-footer">
                    <button type="button" className="adm-btn-ghost" style={{ minWidth:100 }} onClick={() => setDrawerOpen(false)}>
                      Cancelar
                    </button>
                    <button type="submit" form="modal-form" disabled={sending}
                            className={`adm-btn-primary ${editandoId ? "blue" : "red"}`}
                            style={{ opacity: sending ? .65 : 1 }}>
                      {sending
                          ? <><Loader2 size={14} style={{ animation:"adm-spin 1s linear infinite" }}/> Salvando…</>
                          : editandoId
                              ? <><Pencil size={14}/> Salvar Alterações</>
                              : <><UserPlus size={14}/> Liberar Acesso</>}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* ════ MODAL SAIR ════════════════════════════════════════════════ */}
        <AnimatePresence>
          {exitConfirm && (
              <motion.div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
                          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <motion.div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.85)", backdropFilter:"blur(14px)" }} onClick={() => setExitConfirm(false)} />
                <motion.div className="adm-exit-modal" initial={{ scale:.88, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:.92, opacity:0 }}
                            transition={{ type:"spring", stiffness:380, damping:28 }}
                            style={{ position:"relative", zIndex:10, width:"100%", maxWidth:360, background:t.bgEl, border:`1px solid ${t.border}`, borderRadius:22, padding:"36px 28px 28px", textAlign:"center", boxShadow:"0 40px 80px rgba(0,0,0,.7)" }}>
                  <div style={{ width:60, height:60, borderRadius:18, margin:"0 auto 20px", background:"rgba(200,16,46,.08)", border:"1px solid rgba(200,16,46,.2)", display:"flex", alignItems:"center", justifyContent:"center", color:AURA.red }}>
                    <LogOut size={24}/>
                  </div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:500, color:t.text, margin:"0 0 10px" }}>Encerrar Sessão</h3>
                  <p style={{ fontSize:13, fontWeight:300, color:t.textSec, margin:"0 0 24px", lineHeight:1.65 }}>Tem certeza que deseja sair do sistema?</p>
                  <div className="adm-divider" style={{ margin:"0 0 20px" }} />
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={() => setExitConfirm(false)} className="adm-btn-ghost" style={{ flex:1, padding:"13px" }}>Cancelar</button>
                    <button onClick={() => { localStorage.clear(); window.location.href = "/"; }}
                            className="adm-btn-primary red" style={{ flex:1.5, padding:"13px" }}>
                      <LogOut size={13}/> Sair Agora
                    </button>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* ════ TOASTS ════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {sucesso && (
              <motion.div className="adm-toast"
                          initial={{ opacity:0, y:20, scale:.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:16, scale:.95 }}
                          style={{ background:AURA.green, color:"#fff", boxShadow:"0 10px 32px rgba(5,150,105,.4)" }}>
                <CheckCircle size={14}/> {sucesso}
              </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {erro && (
              <motion.div className="adm-toast"
                          initial={{ opacity:0, y:20, scale:.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:16, scale:.95 }}
                          style={{ background:AURA.red, color:"#fff", boxShadow:"0 10px 32px rgba(200,16,46,.4)", bottom:sucesso?76:26 }}>
                <Power size={14}/>
                <span style={{ overflow:"hidden", textOverflow:"ellipsis", maxWidth:"60vw" }}>{erro}</span>
                <button onClick={() => setErro("")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.65)", display:"flex", marginLeft:4, padding:2 }}>
                  <X size={13}/>
                </button>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import api from "../../services/api.js";
import { getFotoUrl } from "../../utils/foto.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Users, Power, Trash2, LogOut,
  Mail, Key, User, Shield, Loader2, RefreshCcw, Pencil, X,
  Sun, Moon, Eye, EyeOff, CheckCircle, XCircle, Clock, Camera,
  History, ChevronLeft, ChevronRight, Search, Filter,
  Edit3, PlusCircle, AlertTriangle, RefreshCw, Phone,
  ChevronDown, ChevronUp, Menu, FileText,
  Building2, DollarSign, Home, Flame,
  LayoutDashboard, Share2, Trophy, ClipboardList,
  BarChart2, TrendingUp, Target,
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

/* ─── Tokens AURA ────────────────────────────────────────────────────────── */
const AURA = {
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  red:       "#C8102E",
  redDark:   "#9B0B1E",
  blue:      "#003DA5",
  blueDark:  "#002470",
  yellow:    "#FDB813",
  yellowDark:"#C48C00",
  green:     "#059669",
};

function theme(isDark) {
  return {
    bg:        isDark ? "#0A0A0F"              : "#F5F0E8",
    bgEl:      isDark ? "rgba(18,18,26,.97)"   : "rgba(255,255,255,.97)",
    bgInput:   isDark ? "rgba(255,255,255,.04)": "rgba(0,0,0,.04)",
    border:    isDark ? "rgba(201,169,110,.1)" : "rgba(201,169,110,.2)",
    borderIn:  isDark ? "rgba(201,169,110,.15)": "rgba(201,169,110,.28)",
    text:      isDark ? "#F5F0E8"              : "#1A1008",
    textSec:   isDark ? "#9A9588"              : "#6B5E4A",
    textMuted: isDark ? "#6B6658"              : "#9A9080",
    glow1:     isDark ? "rgba(201,169,110,.05)": "rgba(201,169,110,.08)",
    glow2:     isDark ? "rgba(201,169,110,.04)": "rgba(201,169,110,.06)",
    sidebarBg: isDark ? "rgba(8,8,14,.99)"     : "rgba(10,8,6,.98)",
    headerBg:  isDark ? "rgba(10,10,15,.97)"   : "rgba(245,240,232,.97)",
    placeholder: isDark ? "rgba(154,149,136,.35)": "rgba(107,94,74,.35)",
  };
}

const perfis = ["ADMIN","PASTOR","LIDER_CELULA","SECRETARIO","TESOUREIRO"];

const SECOES = [
  {
    id:"admin", label:"Administração", icon:Shield, color:AURA.red,
    itens:[
      { key:"usuarios",  label:"Usuários",  sub:"Controle",  icon:Users   },
      { key:"historico", label:"Histórico", sub:"Auditoria", icon:History },
    ],
  },
  {
    id:"secretaria", label:"Secretaria", icon:FileText, color:AURA.blue,
    itens:[
      { key:"membros",           label:"Membros",     sub:"Base",      icon:Users    },
      { key:"visitantes",        label:"Visitantes",  sub:"Novas Vidas",icon:UserPlus},
      { key:"celulas",           label:"Células",     sub:"Grupos",    icon:Home     },
      { key:"fichas",            label:"Fichas",      sub:"Encontro",  icon:FileText },
      { key:"secretariacelulas", label:"Sec. Células",sub:"Secretaria",icon:Building2},
    ],
  },
  {
    id:"pastor", label:"Pastoral", icon:LayoutDashboard, color:"#e05050",
    itens:[
      { key:"painel-pastor",  label:"Dashboard",   sub:"Visão geral",icon:LayoutDashboard },
      { key:"relatorios",     label:"Relatórios",  sub:"Células",    icon:FileText        },
      { key:"discipulado",    label:"Discipulado", sub:"Secretaria", icon:Users           },
      { key:"multiplicacoes", label:"Multip.",     sub:"Solicitações",icon:Share2         },
      { key:"ranking",        label:"Ranking",     sub:"Células",    icon:Trophy          },
      { key:"casas-de-paz",   label:"Casas de Paz",sub:"Evangelismo",icon:Home           },
      { key:"missao70",       label:"Missão 70",   sub:"Evangelismo",icon:Flame          },
      { key:"pendencias",     label:"Pendências",  sub:"Semana",     icon:ClipboardList   },
      { key:"alertas",        label:"Alertas",     sub:"Sistema",    icon:AlertTriangle, alert:true },
    ],
  },
  {
    id:"lider", label:"Líder", icon:Target, color:AURA.green,
    itens:[
      { key:"lider-relatorio",   label:"Relatório",   sub:"Semanal",   icon:FileText },
      { key:"lider-discipulado", label:"Discipulado", sub:"Membros",   icon:Users    },
      { key:"lider-visitantes",  label:"Visitantes",  sub:"Novas vidas",icon:UserPlus},
      { key:"lider-fichas",      label:"Fichas",      sub:"Encontro",  icon:FileText },
      { key:"lider-casas",       label:"Casas de Paz",sub:"Evangelismo",icon:Home   },
      { key:"lider-missao70",    label:"Missão 70",   sub:"Evangelismo",icon:Flame  },
    ],
  },
  {
    id:"tesouraria", label:"Tesouraria", icon:DollarSign, color:AURA.yellowDark,
    itens:[
      { key:"teso-dashboard",   label:"Dashboard",  sub:"Análise",   icon:BarChart2  },
      { key:"teso-lancamento",  label:"Lançamento", sub:"Fluxo",     icon:DollarSign },
      { key:"teso-relatorio",   label:"Relatório",  sub:"Exportação",icon:FileText   },
      { key:"teso-dizimistas",  label:"Dizimistas", sub:"Base",      icon:Users      },
      { key:"teso-comparativo", label:"Comparativo",sub:"Evolução",  icon:TrendingUp },
    ],
  },
];

/* ─── CSS Global ─────────────────────────────────────────────────────────── */
function GlobalStyles({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes adm-spin  { to { transform: rotate(360deg); } }
      @keyframes adm-pulse { 0%,100%{opacity:.2;transform:scale(1)} 50%{opacity:.05;transform:scale(1.1)} }
      @keyframes adm-blink { 0%,100%{opacity:1} 50%{opacity:.3} }
      @keyframes adm-stripe{
        0%  { background-position: 0 0; }
        100%{ background-position: 80px 80px; }
      }

      *, *::before, *::after { box-sizing: border-box; }

      .adm-root {
        font-family: 'Inter', sans-serif;
        background: ${t.bg};
        color: ${t.text};
        min-height: 100vh; min-height: 100dvh;
        display: flex; position: relative; overflow-x: hidden;
        transition: background .4s, color .4s;
        isolation: isolate;
      }

      .adm-bg {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 10% 0%, ${t.glow1} 0%, transparent 55%),
          radial-gradient(ellipse at 90% 100%, ${t.glow2} 0%, transparent 55%);
        transition: background .4s;
      }
      .adm-stripes {
        position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: .4;
        background-image: repeating-linear-gradient(
          -55deg,
          ${isDark ? "rgba(201,169,110,.02)" : "rgba(201,169,110,.035)"} 0 8px,
          transparent 8px 16px,
          ${isDark ? "rgba(200,16,46,.015)"  : "rgba(200,16,46,.02)"}   16px 24px,
          transparent 24px 40px
        );
        background-size: 80px 80px;
        animation: adm-stripe 14s linear infinite;
      }

      /* ── SIDEBAR ── */
      .adm-sidebar {
        position: fixed; left: 0; top: 0; bottom: 0; z-index: 50;
        width: 256px;
        background: ${t.sidebarBg};
        border-right: 1px solid rgba(200,16,46,.18);
        display: flex; flex-direction: column;
        transform: translateX(-100%);
        transition: transform .3s cubic-bezier(.4,0,.2,1), box-shadow .3s;
        will-change: transform;
      }
      .adm-sidebar.open {
        transform: translateX(0);
        box-shadow: 24px 0 60px rgba(0,0,0,.6);
      }
      @media (min-width: 900px) {
        .adm-sidebar {
          position: sticky; top: 0; height: 100vh; height: 100dvh;
          transform: translateX(0) !important;
          box-shadow: none !important;
          flex-shrink: 0;
        }
      }

      .adm-sidebar-inner {
        flex: 1; overflow-y: auto; display: flex; flex-direction: column;
        scrollbar-width: none;
      }
      .adm-sidebar-inner::-webkit-scrollbar { display: none; }

      /* Faixa topo sidebar */
      .adm-sidebar-stripe {
        height: 3px; flex-shrink: 0;
        background: linear-gradient(90deg, ${AURA.redDark}, ${AURA.red}, ${AURA.yellow}, ${AURA.blue});
      }

      /* Brand */
      .adm-brand {
        display: flex; align-items: center; gap: 11px;
        padding: 20px 18px 16px;
        border-bottom: 1px solid rgba(200,16,46,.12);
        flex-shrink: 0;
      }
      .adm-brand-avatar {
        width: 40px; height: 40px; border-radius: 50%; overflow: hidden;
        border: 1.5px solid rgba(200,16,46,.35); flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.blue});
      }
      .adm-brand-avatar img { width: 100%; height: 100%; object-fit: cover; }
      .adm-brand-name {
        font-family: 'Playfair Display', serif;
        font-size: 14px; font-weight: 600; color: #F5F0E8;
        margin: 0; letter-spacing: .03em;
        background: linear-gradient(90deg, ${AURA.redDark}, ${AURA.red}, ${AURA.yellow});
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .adm-brand-sub {
        font-size: 8px; font-weight: 600; letter-spacing: .22em;
        text-transform: uppercase; color: rgba(245,240,232,.25); margin: 3px 0 0;
      }

      /* Seções nav */
      .adm-sec-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 18px 7px; cursor: pointer;
        transition: background .2s;
      }
      .adm-sec-header:hover { background: rgba(200,16,46,.05); }
      .adm-sec-label {
        font-size: 8px; font-weight: 700; letter-spacing: .22em;
        text-transform: uppercase; color: rgba(245,240,232,.28);
      }
      .adm-nav-item {
        width: 100%; display: flex; align-items: center; gap: 9px;
        padding: 9px 18px 9px 28px; border: none; cursor: pointer;
        background: transparent; text-align: left; position: relative;
        transition: all .2s;
      }
      .adm-nav-item::before {
        content: ''; position: absolute; left: 0; top: 50%;
        transform: translateY(-50%);
        width: 3px; height: 0; border-radius: 0 3px 3px 0;
        background: var(--nav-color, ${AURA.gold});
        transition: height .2s;
      }
      .adm-nav-item:hover { background: rgba(200,16,46,.07); }
      .adm-nav-item:hover::before { height: 18px; }
      .adm-nav-item.active { background: rgba(200,16,46,.15); }
      .adm-nav-item.active::before { height: 22px; }
      .adm-nav-icon {
        width: 26px; height: 26px; border-radius: 6px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        transition: background .2s;
      }
      .adm-nav-item.active .adm-nav-icon { background: rgba(200,16,46,.2); }
      .adm-nav-item:not(.active) .adm-nav-icon { background: rgba(255,255,255,.04); }
      .adm-nav-main { font-size: 10.5px; font-weight: 600; color: rgba(245,240,232,.55); display: block; line-height: 1; }
      .adm-nav-item.active .adm-nav-main { color: #F5F0E8; }
      .adm-nav-sub  { font-size: 8px; color: rgba(245,240,232,.2); letter-spacing: .08em; text-transform: uppercase; display: block; margin-top: 2px; }
      .adm-nav-badge {
        margin-left: auto; background: ${AURA.yellow}; color: ${AURA.blue};
        font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 99px;
        animation: adm-blink 2.5s ease-in-out infinite;
      }

      /* Sidebar footer */
      .adm-sidebar-footer {
        padding: 14px 16px 18px; border-top: 1px solid rgba(200,16,46,.12);
        flex-shrink: 0;
      }
      .adm-user-chip {
        display: flex; align-items: center; gap: 10px;
        padding: 11px 13px; border-radius: 12px;
        background: rgba(200,16,46,.07); border: 1px solid rgba(200,16,46,.14);
        margin-bottom: 10px;
      }
      .adm-user-chip-dot {
        width: 7px; height: 7px; border-radius: 50%; background: ${AURA.green};
        flex-shrink: 0; animation: adm-blink 2.5s ease-in-out infinite;
      }
      .adm-user-chip-name { font-size: 11px; font-weight: 600; color: #F5F0E8; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .adm-user-chip-role { font-size: 8px; color: rgba(245,240,232,.28); letter-spacing: .12em; text-transform: uppercase; }

      /* Botão sair */
      .adm-btn-exit {
        display: flex; align-items: center; justify-content: center; gap: 9px;
        width: 100%; padding: 12px 18px; border-radius: 11px; border: none;
        cursor: pointer; position: relative; overflow: hidden;
        background: linear-gradient(135deg, rgba(155,11,30,.18), rgba(200,16,46,.12));
        border: 1px solid rgba(200,16,46,.25);
        color: ${AURA.red};
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
        letter-spacing: .18em; text-transform: uppercase;
        transition: all .3s;
      }
      .adm-btn-exit::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        opacity: 0; transition: opacity .3s;
      }
      .adm-btn-exit:hover { color: #fff; border-color: transparent; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(200,16,46,.3); }
      .adm-btn-exit:hover::after { opacity: 1; }
      .adm-btn-exit > * { position: relative; z-index: 1; }

      /* ── OVERLAY ── */
      .adm-overlay {
        position: fixed; inset: 0; z-index: 49;
        background: rgba(0,0,0,.72); backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      }
      @media (min-width: 900px) { .adm-overlay { display: none !important; } }

      /* ── MAIN ── */
      .adm-main {
        flex: 1; display: flex; flex-direction: column;
        position: relative; z-index: 1; min-width: 0;
        min-height: 100vh; min-height: 100dvh;
      }

      /* Topbar */
      .adm-topbar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 20px; height: 58px;
        background: ${t.headerBg};
        border-bottom: 1px solid ${t.border};
        backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
        position: sticky; top: 0; z-index: 30;
        gap: 12px;
      }
      .adm-topbar-left { display: flex; align-items: center; gap: 12px; }

      .adm-btn-ico {
        width: 36px; height: 36px; border-radius: 10px; border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"};
        border: 1px solid ${t.border}; color: ${t.textMuted};
        transition: all .25s; flex-shrink: 0;
      }
      .adm-btn-ico:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }
      @media (min-width: 900px) { .adm-hamburger { display: none !important; } }

      .adm-page-title {
        font-family: 'Playfair Display', serif;
        font-size: 17px; font-weight: 500; color: ${t.text}; margin: 0;
      }
      .adm-page-eyebrow {
        font-size: 8px; font-weight: 600; letter-spacing: .2em;
        text-transform: uppercase; color: ${t.textMuted}; margin: 0 0 2px;
      }

      /* Module badge */
      .adm-mod-badge {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 14px; border-radius: 100px;
        font-size: 9px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; border: 1px solid; white-space: nowrap;
      }
      .adm-mod-dot { width: 5px; height: 5px; border-radius: 50%; animation: adm-blink 2.5s ease-in-out infinite; }

      /* Online */
      .adm-online {
        display: flex; align-items: center; gap: 5px;
        padding: 5px 12px; border-radius: 100px;
        background: rgba(5,150,105,.1); border: 1px solid rgba(5,150,105,.25);
        color: ${AURA.green}; font-size: 8.5px; font-weight: 600; letter-spacing: .15em;
        text-transform: uppercase;
      }
      .adm-online-dot { width: 6px; height: 6px; border-radius: 50%; background: ${AURA.green}; animation: adm-blink 2.5s ease-in-out infinite; }

      /* Content */
      .adm-content {
        flex: 1; padding: 22px 18px;
        padding-bottom: max(32px, env(safe-area-inset-bottom, 32px));
        overflow-y: auto;
      }
      @media (min-width: 640px) { .adm-content { padding: 26px 28px; } }

      /* Card */
      .adm-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 18px; overflow: hidden; position: relative;
        backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
      }
      .adm-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
        pointer-events: none;
      }

      /* Inputs */
      .adm-input {
        width: 100%; background: ${t.bgInput}; border: 1px solid ${t.borderIn};
        color: ${t.text}; padding: 12px 16px 12px 44px; border-radius: 11px;
        outline: none; font-family: 'Inter', sans-serif; font-size: 14px;
        font-weight: 300; transition: all .25s;
        -webkit-appearance: none; appearance: none;
      }
      .adm-input:focus {
        border-color: rgba(201,169,110,.5);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .adm-input::placeholder { color: ${t.placeholder}; }

      .adm-select {
        width: 100%; background: ${t.bgInput}; border: 1px solid ${t.borderIn};
        color: ${t.text}; padding: 12px 14px 12px 44px; border-radius: 11px;
        outline: none; font-family: 'Inter', sans-serif; font-size: 12px;
        font-weight: 500; letter-spacing: .06em; cursor: pointer;
        appearance: none; -webkit-appearance: none;
        transition: all .25s;
      }
      .adm-select:focus { border-color: rgba(201,169,110,.5); box-shadow: 0 0 0 3px rgba(201,169,110,.08); }

      .adm-label {
        display: block; font-size: 9px; font-weight: 600; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(201,169,110,.7); margin: 0 0 7px;
      }

      /* Buttons */
      .adm-btn-gold {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 12px 20px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight});
        color: #0A0A0F; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
        transition: all .3s; box-shadow: 0 6px 22px rgba(201,169,110,.22);
      }
      .adm-btn-gold:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(201,169,110,.32); }

      .adm-btn-red {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 12px 20px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
        transition: all .3s; box-shadow: 0 6px 22px rgba(200,16,46,.25);
      }
      .adm-btn-red:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(200,16,46,.35); }

      .adm-btn-blue {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 12px 20px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
        transition: all .3s; box-shadow: 0 6px 22px rgba(0,61,165,.25);
      }
      .adm-btn-blue:hover { transform: translateY(-2px); }

      .adm-btn-ghost {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 10px 16px; border-radius: 100px;
        border: 1px solid ${t.border}; cursor: pointer;
        background: transparent; color: ${t.textSec};
        font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600;
        letter-spacing: .14em; text-transform: uppercase; transition: all .25s;
      }
      .adm-btn-ghost:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

      /* KPI cards */
      .adm-kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
      @media (min-width: 640px) { .adm-kpi-grid { grid-template-columns: repeat(4, 1fr); } }
      .adm-kpi {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 16px; padding: 18px 16px;
        display: flex; align-items: center; gap: 12px;
        backdrop-filter: blur(20px); position: relative; overflow: hidden;
      }
      .adm-kpi::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }
      .adm-kpi-icon { width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
      .adm-kpi-num { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 600; line-height: 1; margin: 0; }
      .adm-kpi-lbl { font-size: 9px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: ${t.textMuted}; margin: 3px 0 0; }

      /* Divider */
      .adm-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
        margin: 16px 0;
      }

      /* Member row */
      .adm-user-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 13px 18px; gap: 12px;
        border-bottom: 1px solid ${t.border};
        transition: background .15s; flex-wrap: wrap;
      }
      .adm-user-row:hover { background: ${isDark ? "rgba(201,169,110,.03)" : "rgba(201,169,110,.04)"}; }

      /* Toast */
      .adm-toast {
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        padding: 13px 20px; border-radius: 12px;
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
        letter-spacing: .12em; text-transform: uppercase;
        display: flex; align-items: center; gap: 10px; z-index: 500;
        max-width: 90vw; white-space: nowrap;
      }

      /* Selector célula lider */
      .adm-celula-sel {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 14px; padding: 14px 18px; margin-bottom: 16px;
        display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        backdrop-filter: blur(20px);
      }

      /* Footer */
      .adm-footer {
        text-align: center; font-size: 8px; font-weight: 500;
        letter-spacing: .18em; text-transform: uppercase;
        color: ${isDark ? "rgba(245,240,232,.08)" : "rgba(26,16,8,.12)"};
        padding: 14px 0 0;
      }
    `}</style>
  );
}

/* ─── Input com ícone ─────────────────────────────────────────────────────── */
function InputField({ icon, type = "text", value, onChange, placeholder, required, isDark, t }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: AURA.gold, opacity: .55, pointerEvents: "none", zIndex: 1 }}>
          {icon}
        </div>
        <input
            className="adm-input"
            type={isPass && show ? "text" : type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            style={{ paddingRight: isPass ? 44 : 16 }}
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

/* ─── Renderer de módulos ─────────────────────────────────────────────────── */
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
  const [editModalOpen,  setEditModalOpen]  = useState(false);
  const [editandoId,     setEditandoId]     = useState(null);
  const [exitConfirm,    setExitConfirm]    = useState(false);
  const [form,           setForm]           = useState({ nome:"", email:"", senha:"", perfil:"LIDER_CELULA", telefoneWhatsapp:"55" });
  const [isDark,         setIsDark]         = useState(() => localStorage.getItem("theme") === "dark");
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [moduloAtivo,    setModuloAtivo]    = useState("usuarios");
  const [secaoExp,       setSecaoExp]       = useState("admin");
  const [celulas,        setCelulas]        = useState([]);
  const [celulaAdmin,    setCelulaAdmin]    = useState(null);

  const fotoRef   = useRef(null);
  const fotoIdRef = useRef(null);

  const t = theme(isDark);

  useEffect(() => { localStorage.setItem("theme", isDark ? "dark" : "light"); }, [isDark]);

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
    const tel = form.telefoneWhatsapp ? form.telefoneWhatsapp.replace(/\D/g, "") : "";
    try {
      await api.post("usuarios", { ...form, telefoneWhatsapp: tel });
      setForm({ nome:"", email:"", senha:"", perfil:"LIDER_CELULA", telefoneWhatsapp:"55" });
      carregarUsuarios(); ok("Acesso liberado com sucesso.");
    } catch { setErro("Falha ao criar novo acesso."); }
    finally { setSending(false); }
  };

  const salvarEdicao = async e => {
    e.preventDefault(); setSending(true);
    const tel = form.telefoneWhatsapp ? form.telefoneWhatsapp.replace(/\D/g, "") : "";
    try {
      await api.put(`usuarios/${editandoId}`, { ...form, telefoneWhatsapp: tel });
      setEditModalOpen(false); setEditandoId(null);
      setForm({ nome:"", email:"", senha:"", perfil:"LIDER_CELULA", telefoneWhatsapp:"55" });
      carregarUsuarios();
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
  const removerFoto = async (id, nome) => {
    if (!window.confirm(`Remover foto de "${nome}"?`)) return;
    setUploadandoFoto(id);
    try { await api.patch(`usuarios/${id}/foto`, { fotoBase64: null }); ok("Foto removida."); carregarUsuarios(); }
    catch { setErro("Erro ao remover foto."); }
    finally { setUploadandoFoto(null); }
  };

  const abrirEdicao = u => { setEditandoId(u.id); setForm({ nome:u.nome, email:u.email, senha:"", perfil:u.perfil, telefoneWhatsapp:u.telefoneWhatsapp || "55" }); setEditModalOpen(true); };

  const qtdPend = pendentes.size;
  const isLider = moduloAtivo?.startsWith("lider-");
  const secaoAtiva = SECOES.find(s => s.itens.some(i => i.key === moduloAtivo));
  const itemAtivo  = SECOES.flatMap(s => s.itens).find(i => i.key === moduloAtivo);

  const ativos    = usuarios.filter(u =>  u.ativo).length;
  const suspensos = usuarios.filter(u => !u.ativo).length;

  if (loading && usuarios.length === 0) return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background: isDark ? "#0A0A0F" : "#F5F0E8" }}>
        <style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap');</style>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:`linear-gradient(135deg,${AURA.redDark},${AURA.blue})`, border:`2px solid ${AURA.red}44`, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Shield size={22} color="#fff"/>
          </div>
          <p style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, letterSpacing:".2em", fontSize:9, color: isDark ? AURA.gold : AURA.redDark, textTransform:"uppercase" }}>Carregando…</p>
        </div>
      </div>
  );

  return (
      <div className="adm-root">
        <GlobalStyles t={t} isDark={isDark} />
        <div className="adm-bg" />
        <div className="adm-stripes" />

        {/* Overlay mobile */}
        <AnimatePresence>
          {sidebarOpen && (
              <motion.div className="adm-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:.22 }} onClick={() => setSidebarOpen(false)} />
          )}
        </AnimatePresence>

        {/* ─── SIDEBAR ──────────────────────────────────────────────────── */}
        <aside className={`adm-sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="adm-sidebar-stripe" />

          {/* Brand */}
          <div className="adm-brand">
            <div className="adm-brand-avatar">
              <img src="/quadrangular.png" alt="IEQ"
                   onError={e => { e.target.style.display="none"; }}
                   style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
            <div>
              <h1 className="adm-brand-name">IEQ Pituaçu</h1>
              <p className="adm-brand-sub">Painel Admin</p>
            </div>
          </div>

          {/* Nav */}
          <div className="adm-sidebar-inner">
            {SECOES.map(sec => {
              const SIcon = sec.icon;
              const exp = secaoExp === sec.id;
              return (
                  <div key={sec.id}>
                    <div className="adm-sec-header" onClick={() => setSecaoExp(exp ? null : sec.id)}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <SIcon size={11} style={{ color:sec.color }} />
                        <span className="adm-sec-label">{sec.label}</span>
                      </div>
                      <ChevronDown size={10} style={{ color:"rgba(245,240,232,.18)", transform:exp?"rotate(180deg)":"rotate(0deg)", transition:"transform .2s" }} />
                    </div>
                    <AnimatePresence>
                      {exp && (
                          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:.18 }} style={{ overflow:"hidden" }}>
                            {sec.itens.map(item => {
                              const IIcon = item.icon;
                              const ativo = moduloAtivo === item.key;
                              return (
                                  <button key={item.key} className={`adm-nav-item${ativo?" active":""}`}
                                          style={{ "--nav-color": sec.color }}
                                          onClick={() => { setModuloAtivo(item.key); setSidebarOpen(false); }}>
                                    <div className="adm-nav-icon">
                                      <IIcon size={13} style={{ color: ativo ? "#fff" : sec.color, opacity: ativo ? 1 : .7 }} />
                                    </div>
                                    <div style={{ flex:1, minWidth:0 }}>
                                      <span className="adm-nav-main">{item.label}</span>
                                      <span className="adm-nav-sub">{item.sub}</span>
                                    </div>
                                    {item.key === "usuarios" && qtdPend > 0 && <span className="adm-nav-badge">{qtdPend}</span>}
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

          {/* Footer */}
          <div className="adm-sidebar-footer">
            <div className="adm-user-chip">
              <div className="adm-user-chip-dot" />
              <div style={{ flex:1, minWidth:0 }}>
                <p className="adm-user-chip-name">Administrador</p>
                <p className="adm-user-chip-role">Admin · IEQ</p>
              </div>
            </div>
            <button className="adm-btn-exit" onClick={() => setExitConfirm(true)}>
              <LogOut size={14} />
              <span>Sair do Sistema</span>
            </button>
            <p style={{ textAlign:"center", fontFamily:"'Inter',sans-serif", fontSize:8, letterSpacing:".14em", color:"rgba(245,240,232,.1)", marginTop:10, textTransform:"uppercase" }}>
              © IEQ Pituaçu · {new Date().getFullYear()}
            </p>
          </div>
        </aside>

        {/* ─── MAIN ─────────────────────────────────────────────────────── */}
        <main className="adm-main">

          {/* Topbar */}
          <header className="adm-topbar">
            <div className="adm-topbar-left">
              <button className="adm-btn-ico adm-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Menu">
                <Menu size={18} />
              </button>
              <div>
                <p className="adm-page-eyebrow">{secaoAtiva?.label || "Admin"}</p>
                <motion.h2 className="adm-page-title" key={moduloAtivo} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ duration:.22 }}>
                  {itemAtivo?.label || "Painel"}
                </motion.h2>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div className="adm-online">
                <div className="adm-online-dot" />
                Online
              </div>
              <button className="adm-btn-ico" onClick={() => setIsDark(!isDark)} aria-label="Tema">
                {isDark ? <Sun size={15}/> : <Moon size={15}/>}
              </button>
              <button className="adm-btn-ico" onClick={carregarUsuarios} aria-label="Atualizar">
                <RefreshCcw size={15} style={{ animation: loading ? "adm-spin 1s linear infinite" : "none" }} />
              </button>
              {moduloAtivo === "usuarios" && (
                  <button className="adm-btn-red" style={{ padding:"8px 16px", fontSize:9 }}
                          onClick={() => { setEditandoId(null); setForm({ nome:"", email:"", senha:"", perfil:"LIDER_CELULA", telefoneWhatsapp:"55" }); setEditModalOpen(true); }}>
                    <UserPlus size={13}/> Novo
                  </button>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="adm-content">
            {/* Seletor célula para módulos de Líder */}
            {isLider && celulas.length > 0 && (
                <div className="adm-celula-sel">
                  <Building2 size={15} style={{ color:AURA.blue, flexShrink:0 }} />
                  <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:600, letterSpacing:".14em", textTransform:"uppercase", color:t.textMuted, flexShrink:0 }}>Célula:</span>
                  <div style={{ position:"relative", flex:1 }}>
                    <select className="adm-select" style={{ paddingLeft:16 }} value={celulaAdmin?.id || ""} onChange={e => setCelulaAdmin(celulas.find(c => c.id === Number(e.target.value)))}>
                      {celulas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div key={moduloAtivo} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:.18 }}>

                {/* ── PAINEL USUÁRIOS ── */}
                {moduloAtivo === "usuarios" && (
                    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                      {/* KPIs */}
                      <div className="adm-kpi-grid">
                        {[
                          { icon:<Users size={17}/>,  label:"Total",     value:usuarios.length, color:AURA.blue,       bg:"rgba(0,61,165,.1)"    },
                          { icon:<Power size={17}/>,  label:"Ativos",    value:ativos,          color:AURA.green,      bg:"rgba(5,150,105,.1)"   },
                          { icon:<Shield size={17}/>, label:"Suspensos", value:suspensos,       color:AURA.redDark,    bg:"rgba(200,16,46,.1)"   },
                          { icon:<Clock size={17}/>,  label:"Pendentes", value:qtdPend,         color:AURA.yellowDark, bg:"rgba(196,140,0,.1)"   },
                        ].map(({ icon, label, value, color, bg: ibg }) => (
                            <div key={label} className="adm-kpi">
                              <div className="adm-kpi-icon" style={{ background:ibg, color }}>
                                {icon}
                              </div>
                              <div>
                                <p className="adm-kpi-num" style={{ color: label==="Pendentes" && value > 0 ? AURA.yellowDark : t.text }}>{value}</p>
                                <p className="adm-kpi-lbl">{label}</p>
                              </div>
                            </div>
                        ))}
                      </div>

                      {/* Form novo usuário */}
                      <div className="adm-card">
                        <div style={{ padding:"18px 22px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12 }}>
                          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(200,16,46,.1)", color:AURA.red, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <UserPlus size={16} />
                          </div>
                          <div>
                            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:500, color:t.text, margin:0 }}>Novo Acesso</h3>
                            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:300, color:t.textMuted, margin:0 }}>Liberar usuário no sistema</p>
                          </div>
                        </div>
                        <form onSubmit={adicionarUsuario} style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:14 }}>
                          {[
                            { icon:<User size={14}/>,   type:"text",     placeholder:"Nome completo",         key:"nome",  label:"Nome" },
                            { icon:<Mail size={14}/>,   type:"email",    placeholder:"E-mail institucional",   key:"email", label:"E-mail" },
                            { icon:<Key size={14}/>,    type:"password", placeholder:"Senha de acesso",        key:"senha", label:"Senha" },
                            { icon:<Phone size={14}/>,  type:"tel",      placeholder:"WhatsApp (com DDD)",     key:"telefoneWhatsapp", label:"WhatsApp" },
                          ].map(f => (
                              <div key={f.key}>
                                <label className="adm-label">{f.label}</label>
                                <InputField icon={f.icon} type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={v => setForm({...form,[f.key]:v})} required isDark={isDark} t={t} />
                              </div>
                          ))}
                          <div>
                            <label className="adm-label">Perfil</label>
                            <div style={{ position:"relative" }}>
                              <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:AURA.gold, opacity:.55, pointerEvents:"none" }}><Shield size={14}/></div>
                              <select className="adm-select" value={form.perfil} onChange={e => setForm({...form,perfil:e.target.value})}>
                                {perfis.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
                              </select>
                            </div>
                          </div>
                          <button type="submit" disabled={sending} className="adm-btn-red" style={{ width:"100%", justifyContent:"center", opacity:sending?.6:1 }}>
                            {sending ? <><Loader2 size={14} style={{ animation:"adm-spin 1s linear infinite" }}/> Criando…</> : <><UserPlus size={14}/> Liberar Acesso</>}
                          </button>
                        </form>
                      </div>

                      {/* Lista */}
                      <div className="adm-card">
                        {qtdPend > 0 && (
                            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 20px", background:"rgba(253,184,19,.07)", borderBottom:"1px solid rgba(253,184,19,.18)" }}>
                              <Clock size={13} style={{ color:AURA.yellowDark }} />
                              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:AURA.yellowDark }}>
                          {qtdPend} solicitaç{qtdPend > 1 ? "ões" : "ão"} aguardando aprovação
                        </span>
                            </div>
                        )}
                        <div style={{ padding:"16px 22px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
                          <div>
                            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:500, color:t.text, margin:0 }}>Base de Usuários</h3>
                            <p style={{ fontSize:11, fontWeight:300, color:t.textMuted, margin:0 }}>{usuarios.length} registros</p>
                          </div>
                          <button className="adm-btn-ghost" onClick={carregarUsuarios}>
                            <RefreshCcw size={12} style={{ animation:loading?"adm-spin 1s linear infinite":"none" }} /> Atualizar
                          </button>
                        </div>

                        <AnimatePresence>
                          {usuarios.map((u, i) => {
                            const temP = pendentes.has(u.id);
                            const eApr = aprovando === u.id;
                            const eFoto = uploadandoFoto === u.id;
                            return (
                                <motion.div key={u.id} className="adm-user-row" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-20 }} transition={{ delay:i*.03 }}
                                            style={{ borderLeft:`3px solid ${temP ? AURA.yellow : "transparent"}` }}>
                                  <div style={{ display:"flex", alignItems:"center", gap:12, flex:1, minWidth:0 }}>
                                    {/* Avatar foto */}
                                    <div style={{ position:"relative", flexShrink:0, cursor:"pointer" }} onClick={() => abrirSeletorFoto(u.id)}>
                                      {u.fotoPerfil ? (
                                          <div style={{ width:40, height:40, borderRadius:11, overflow:"hidden", border:`1.5px solid ${temP ? AURA.yellow : t.border}`, opacity:u.ativo?1:.45 }}>
                                            <img src={getFotoUrl(u.fotoPerfil)} alt={u.nome} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                                          </div>
                                      ) : (
                                          <div style={{ width:40, height:40, borderRadius:11, background:u.ativo?`linear-gradient(135deg,${AURA.redDark},${AURA.blue})`:(isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"), display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:600, color:"#fff", opacity:u.ativo?1:.6 }}>
                                            {u.nome?.charAt(0).toUpperCase()}
                                          </div>
                                      )}
                                      <div style={{ position:"absolute", inset:0, borderRadius:11, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity .2s" }}
                                           onMouseEnter={e => e.currentTarget.style.opacity=1}
                                           onMouseLeave={e => e.currentTarget.style.opacity=0}>
                                        {eFoto ? <Loader2 size={13} color="#fff" style={{ animation:"adm-spin 1s linear infinite" }}/> : <Camera size={13} color="#fff"/>}
                                      </div>
                                    </div>

                                    <div style={{ flex:1, minWidth:0 }}>
                                      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:600, color:t.text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.nome}</p>
                                      <p style={{ fontSize:11, fontWeight:300, color:t.textMuted, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</p>
                                    </div>
                                  </div>

                                  <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap", flexShrink:0 }}>
                                    {/* Badges */}
                                    <span style={{ padding:"3px 10px", borderRadius:99, border:"1px solid rgba(0,61,165,.22)", background:"rgba(0,61,165,.07)", color:AURA.blue, fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:600, letterSpacing:".1em", whiteSpace:"nowrap" }}>
                                {u.perfil?.replace(/_/g," ")}
                              </span>
                                    <span style={{ padding:"3px 10px", borderRadius:99, border:`1px solid ${u.ativo?"rgba(5,150,105,.22)":"rgba(0,0,0,.08)"}`, background:u.ativo?"rgba(5,150,105,.07)":"rgba(0,0,0,.04)", color:u.ativo?AURA.green:t.textMuted, fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:600, letterSpacing:".1em", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:4 }}>
                                <span style={{ width:5, height:5, borderRadius:"50%", background:u.ativo?AURA.green:t.textMuted, flexShrink:0 }}/>
                                      {u.ativo ? "Ativo" : "Suspenso"}
                              </span>

                                    {/* Pendente: Aprovar/Rejeitar */}
                                    {temP && (
                                        <>
                                          <button disabled={eApr} onClick={() => aprovarAlteracao(u.id, u.nome)} style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"1px solid rgba(5,150,105,.3)", borderRadius:8, color:AURA.green, fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:600, letterSpacing:".1em", cursor:"pointer", padding:"5px 10px", textTransform:"uppercase" }}>
                                            {eApr ? <Loader2 size={11} style={{ animation:"adm-spin 1s linear infinite" }}/> : <CheckCircle size={11}/>} Aprovar
                                          </button>
                                          <button disabled={eApr} onClick={() => rejeitarAlteracao(u.id, u.nome)} style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"1px solid rgba(200,16,46,.3)", borderRadius:8, color:AURA.red, fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:600, letterSpacing:".1em", cursor:"pointer", padding:"5px 10px", textTransform:"uppercase" }}>
                                            {eApr ? <Loader2 size={11} style={{ animation:"adm-spin 1s linear infinite" }}/> : <XCircle size={11}/>} Rejeitar
                                          </button>
                                        </>
                                    )}

                                    {/* Ações */}
                                    {[
                                      { icon:<Pencil size={14}/>,  title:"Editar",   action:() => abrirEdicao(u),     hc:AURA.blue,       hb:"rgba(0,61,165,.1)"     },
                                      { icon:<Power size={14}/>,   title:"Suspender",action:() => alternarStatus(u.id),hc:AURA.yellowDark, hb:"rgba(196,140,0,.1)"    },
                                      { icon:<Trash2 size={14}/>,  title:"Excluir",  action:() => deletarUsuario(u.id),hc:AURA.red,        hb:"rgba(200,16,46,.1)"    },
                                    ].map(btn => (
                                        <button key={btn.title} onClick={btn.action} title={btn.title}
                                                style={{ width:30, height:30, borderRadius:8, border:`1px solid ${t.border}`, background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:t.textMuted, transition:"all .2s" }}
                                                onMouseEnter={e => { e.currentTarget.style.color=btn.hc; e.currentTarget.style.background=btn.hb; e.currentTarget.style.borderColor=btn.hc; }}
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

                {/* ── HISTÓRICO ── */}
                {moduloAtivo === "historico" && (
                    <div className="adm-card">
                      <HistoricoAuditoria isDark={isDark} />
                    </div>
                )}

                {/* ── OUTROS MÓDULOS ── */}
                {moduloAtivo !== "usuarios" && moduloAtivo !== "historico" && (
                    <ModuloRenderer moduloKey={moduloAtivo} isDark={isDark} celulaAdmin={celulaAdmin} />
                )}

              </motion.div>
            </AnimatePresence>

            <p className="adm-footer">© {new Date().getFullYear()} IEQ Pituaçu · Sistema Eclesiástico · Admin Total</p>
          </div>
        </main>

        {/* Input foto oculto */}
        <input ref={fotoRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFoto} />

        {/* ─── Modal Edição / Criação ──────────────────────────────────── */}
        <AnimatePresence>
          {editModalOpen && (
              <motion.div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <motion.div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.82)", backdropFilter:"blur(10px)", zIndex:0 }} onClick={() => setEditModalOpen(false)} />
                <motion.div initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }} transition={{ type:"spring", damping:28, stiffness:300 }}
                            style={{ position:"relative", zIndex:10, width:"100%", maxWidth:440, maxHeight:"90vh", display:"flex", flexDirection:"column", borderRadius:"20px 20px 0 0", overflow:"hidden", background:t.bgEl, border:`1px solid ${t.border}`, boxShadow:`0 -24px 60px rgba(0,0,0,.5)` }}>
                  <div style={{ padding:"26px 22px", overflowY:"auto", flex:1 }}>
                    {/* Header */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:40, height:40, borderRadius:11, background:`linear-gradient(135deg,${editandoId ? AURA.blueDark : AURA.redDark},${editandoId ? AURA.blue : AURA.red})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                          {editandoId ? <Pencil size={16}/> : <UserPlus size={16}/>}
                        </div>
                        <div>
                          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:500, color:t.text, margin:0 }}>{editandoId ? "Editar Usuário" : "Novo Acesso"}</h2>
                          {editandoId && <p style={{ fontSize:11, fontWeight:300, color:t.textMuted, margin:0 }}>ID: {editandoId}</p>}
                        </div>
                      </div>
                      <button onClick={() => setEditModalOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", color:t.textMuted, padding:6, borderRadius:8, display:"flex", transition:"color .2s" }}
                              onMouseEnter={e => e.currentTarget.style.color = AURA.red}
                              onMouseLeave={e => e.currentTarget.style.color = t.textMuted}>
                        <X size={20}/>
                      </button>
                    </div>
                    <div className="adm-divider" />
                    <form onSubmit={editandoId ? salvarEdicao : adicionarUsuario} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                      {[
                        { icon:<User size={14}/>,  type:"text",     placeholder:"Nome completo",                     key:"nome",  label:"Nome",   req:true     },
                        { icon:<Mail size={14}/>,  type:"email",    placeholder:"E-mail institucional",               key:"email", label:"E-mail",  req:true     },
                        { icon:<Key size={14}/>,   type:"password", placeholder:editandoId?"Deixe vazio para manter":"Senha de acesso", key:"senha", label:"Senha", req:!editandoId },
                        { icon:<Phone size={14}/>, type:"tel",      placeholder:"WhatsApp (com DDD)",                key:"telefoneWhatsapp", label:"WhatsApp", req:false },
                      ].map(f => (
                          <div key={f.key}>
                            <label className="adm-label">{f.label}</label>
                            <InputField icon={f.icon} type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={v => setForm({...form,[f.key]:v})} required={f.req} isDark={isDark} t={t} />
                          </div>
                      ))}
                      <div>
                        <label className="adm-label">Perfil</label>
                        <div style={{ position:"relative" }}>
                          <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:AURA.gold, opacity:.55, pointerEvents:"none" }}><Shield size={14}/></div>
                          <select className="adm-select" value={form.perfil} onChange={e => setForm({...form,perfil:e.target.value})}>
                            {perfis.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:10, marginTop:4 }}>
                        <button type="button" onClick={() => setEditModalOpen(false)} className="adm-btn-ghost" style={{ flex:1, justifyContent:"center", padding:"12px" }}>Cancelar</button>
                        <button type="submit" disabled={sending} className={editandoId ? "adm-btn-blue" : "adm-btn-red"} style={{ flex:2, justifyContent:"center", padding:"12px", opacity:sending?.6:1 }}>
                          {sending ? <><Loader2 size={14} style={{ animation:"adm-spin 1s linear infinite" }}/> Salvando…</> : editandoId ? <><Pencil size={14}/> Salvar Alterações</> : <><UserPlus size={14}/> Liberar Acesso</>}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Modal Sair ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {exitConfirm && (
              <motion.div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <motion.div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.88)", backdropFilter:"blur(10px)" }} onClick={() => setExitConfirm(false)} />
                <motion.div initial={{ scale:.88, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:.92, opacity:0 }} transition={{ type:"spring", stiffness:420, damping:30 }}
                            style={{ position:"relative", zIndex:10, width:"100%", maxWidth:360, background:t.bgEl, border:`1px solid ${t.border}`, borderRadius:22, padding:"36px 28px 28px", textAlign:"center", boxShadow:`0 40px 80px rgba(0,0,0,.7)` }}>
                  <div style={{ width:60, height:60, borderRadius:"50%", margin:"0 auto 20px", background:"linear-gradient(135deg,rgba(155,11,30,.15),rgba(200,16,46,.08))", border:"1.5px solid rgba(200,16,46,.25)", display:"flex", alignItems:"center", justifyContent:"center", color:AURA.red }}>
                    <LogOut size={24}/>
                  </div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:500, color:t.text, margin:"0 0 10px" }}>Encerrar Sessão</h3>
                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:300, color:t.textSec, margin:"0 0 24px", lineHeight:1.6 }}>Tem certeza que deseja sair do sistema?</p>
                  <div className="adm-divider" style={{ margin:"0 0 20px" }} />
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={() => setExitConfirm(false)} className="adm-btn-ghost" style={{ flex:1, justifyContent:"center", padding:"13px" }}>Cancelar</button>
                    <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="adm-btn-red" style={{ flex:1.5, justifyContent:"center", padding:"13px" }}>
                      <LogOut size={13}/> Sair Agora
                    </button>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Toasts ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {sucesso && (
              <motion.div className="adm-toast" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
                          style={{ background:AURA.green, color:"#fff", boxShadow:"0 8px 28px rgba(5,150,105,.35)" }}>
                <CheckCircle size={14}/> {sucesso}
              </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {erro && (
              <motion.div className="adm-toast" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
                          style={{ background:AURA.red, color:"#fff", boxShadow:"0 8px 28px rgba(200,16,46,.35)", bottom:sucesso?72:24 }}>
                <Power size={14}/>
                <span style={{ overflow:"hidden", textOverflow:"ellipsis", maxWidth:"60vw" }}>{erro}</span>
                <button onClick={() => setErro("")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.7)", display:"flex", marginLeft:4 }}><X size={14}/></button>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../services/api.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  UserPlus, Users, Power, Trash2, LogOut,
  Mail, Key, User, Shield, Loader2, RefreshCcw, Pencil, X,
  Sun, Moon, Eye, EyeOff, CheckCircle, XCircle, Clock, Camera,
  History, Menu, FileText, Building2, DollarSign, Home, Flame,
  LayoutDashboard, Share2, Trophy, ClipboardList,
  BarChart2, TrendingUp, Target, ChevronDown,
} from "lucide-react";

import Membros                   from "../secretaria/Membros";
import Celulas                   from "../secretaria/Celulas";
import Visitantes                from "../secretaria/Visitante";
import FichasEncontro            from "../secretaria/FichasEncontro";
import SecretariaCelulas         from "../secretaria/SecretariaCelulas";
import PainelPastor              from "../pastor/PainelPastor";
import RelatorioCelula           from "../pastor/RelatorioCelula";
import SolicitacoesMultiplicacao from "../pastor/SolicitacoesMultiplicacao";
import RankingCelulas            from "../pastor/RankingCelulas";
import PainelAlertas             from "../pastor/PainelAlertas";
import Discipulado               from "../pastor/Discipulado";
import TelaPendencias            from "../pastor/TelaPendencias";
import RelatorioCasasDePaz       from "../pastor/RelatorioCasasDePaz";
import RelatorioMissao70Pastor   from "../pastor/RelatorioMissao70Pastor";
import TelaRelatorio             from "../lider/TelaRelatorio";
import RelatorioDiscipulado      from "../lider/RelatorioDiscipulado";
import TelaVisitantes            from "../lider/TelaVisitantes";
import TelaFichas                from "../lider/TelaFichas";
import CasasDePazLider           from "../lider/CasasDePazLider";
import Missao70Lider             from "../lider/Missao70Lider";
import TesourariaDashboard       from "../tesouraria/TesourariaDashboard";
import TesourariaLancamento      from "../tesouraria/TesourariaLancamento";
import TesourariaRelatorio       from "../tesouraria/TesourariaRelatorio";
import TesourariaDizimistas      from "../tesouraria/TesourariaDizimistas";
import TesourariaComparativo     from "../tesouraria/TesourariaComparativo";
import HistoricoAuditoria        from "./HistoricoAuditoria";

/* ─── Paleta ──────────────────────────────────────────────────────────────── */
const C = {
  red:        "#C8102E",
  redDark:    "#9B0B1E",
  blue:       "#003DA5",
  blueDark:   "#002470",
  yellow:     "#FDB813",
  yellowDark: "#C48C00",
  green:      "#059669",
};

/* ─── Tema dinâmico ───────────────────────────────────────────────────────── */
function useTheme(dark) {
  return {
    bg:          dark ? "#0A0A0F"              : "#F5F0E8",
    surface:     dark ? "rgba(18,18,26,.97)"   : "#FFFFFF",
    surfaceHov:  dark ? "rgba(255,255,255,.03)": "rgba(201,169,110,.03)",
    border:      dark ? "rgba(255,255,255,.07)": "rgba(0,0,0,.08)",
    borderSoft:  dark ? "rgba(255,255,255,.04)": "rgba(0,0,0,.05)",
    text:        dark ? "#F0EDE8"              : "#1A1008",
    textSec:     dark ? "#9A9588"              : "#5A4E3C",
    textMuted:   dark ? "#5A5650"              : "#9A9080",
    input:       dark ? "rgba(255,255,255,.05)": "rgba(0,0,0,.03)",
    inputBorder: dark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)",
    navActive:   dark ? "rgba(200,16,46,.12)"  : "rgba(200,16,46,.07)",
    navHov:      dark ? "rgba(255,255,255,.04)": "rgba(0,0,0,.03)",
    topbar:      dark ? "rgba(10,10,15,.98)"   : "rgba(252,250,247,.98)",
    subnav:      dark ? "rgba(12,12,18,.98)"   : "rgba(249,247,244,.98)",
    warnBg:      dark ? "rgba(253,184,19,.07)" : "rgba(253,184,19,.06)",
    warnBorder:  dark ? "rgba(253,184,19,.18)" : "rgba(253,184,19,.15)",
  };
}

/* ─── Seções de navegação ─────────────────────────────────────────────────── */
const PERFIS = ["ADMIN", "PASTOR", "LIDER_CELULA", "SECRETARIO", "TESOUREIRO"];

const SECOES = [
  {
    id: "admin", label: "Administração", icon: Shield, color: C.red,
    itens: [
      { key: "usuarios",  label: "Usuários",  sub: "Controle",  icon: Users   },
      { key: "historico", label: "Histórico", sub: "Auditoria", icon: History },
    ],
  },
  {
    id: "secretaria", label: "Secretaria", icon: FileText, color: C.blue,
    itens: [
      { key: "membros",           label: "Membros",      sub: "Base",       icon: Users      },
      { key: "visitantes",        label: "Visitantes",   sub: "Novas Vidas",icon: UserPlus   },
      { key: "celulas",           label: "Células",      sub: "Grupos",     icon: Home       },
      { key: "fichas",            label: "Fichas",       sub: "Encontro",   icon: FileText   },
      { key: "secretariacelulas", label: "Sec. Células", sub: "Secretaria", icon: Building2  },
    ],
  },
  {
    id: "pastor", label: "Pastoral", icon: LayoutDashboard, color: "#D04040",
    itens: [
      { key: "painel-pastor",  label: "Dashboard",    sub: "Visão geral",  icon: LayoutDashboard },
      { key: "relatorios",     label: "Relatórios",   sub: "Células",      icon: FileText        },
      { key: "discipulado",    label: "Discipulado",  sub: "Secretaria",   icon: Users           },
      { key: "multiplicacoes", label: "Multip.",      sub: "Solicitações", icon: Share2          },
      { key: "ranking",        label: "Ranking",      sub: "Células",      icon: Trophy          },
      { key: "casas-de-paz",   label: "Casas de Paz", sub: "Evangelismo",  icon: Home            },
      { key: "missao70",       label: "Missão 70",    sub: "Evangelismo",  icon: Flame           },
      { key: "pendencias",     label: "Pendências",   sub: "Semana",       icon: ClipboardList   },
      { key: "alertas",        label: "Alertas",      sub: "Sistema",      icon: Shield, alert: true },
    ],
  },
  {
    id: "lider", label: "Líder", icon: Target, color: C.green,
    itens: [
      { key: "lider-relatorio",   label: "Relatório",    sub: "Semanal",    icon: FileText  },
      { key: "lider-discipulado", label: "Discipulado",  sub: "Membros",    icon: Users     },
      { key: "lider-visitantes",  label: "Visitantes",   sub: "Novas vidas",icon: UserPlus  },
      { key: "lider-fichas",      label: "Fichas",       sub: "Encontro",   icon: FileText  },
      { key: "lider-casas",       label: "Casas de Paz", sub: "Evangelismo",icon: Home      },
      { key: "lider-missao70",    label: "Missão 70",    sub: "Evangelismo",icon: Flame     },
    ],
  },
  {
    id: "tesouraria", label: "Tesouraria", icon: DollarSign, color: C.yellowDark,
    itens: [
      { key: "teso-dashboard",  label: "Dashboard",  sub: "Análise",    icon: BarChart2  },
      { key: "teso-lancamento", label: "Lançamento", sub: "Fluxo",      icon: DollarSign },
      { key: "teso-relatorio",  label: "Relatório",  sub: "Exportação", icon: FileText   },
      { key: "teso-dizimistas", label: "Dizimistas", sub: "Base",       icon: Users      },
      { key: "teso-comparativo",label: "Comparativo",sub: "Evolução",   icon: TrendingUp },
    ],
  },
];

/* ─── CSS global ──────────────────────────────────────────────────────────── */
function GlobalStyles({ t, dark }) {
  return (
      <style>{`
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      @keyframes spin  { to { transform: rotate(360deg); } }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

      .adm-root {
        font-family: 'Inter', system-ui, sans-serif;
        background: ${t.bg};
        color: ${t.text};
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        transition: background .3s, color .3s;
      }

      /* ── topbar ── */
      .adm-topbar {
        position: sticky; top: 0; z-index: 40;
        background: ${t.topbar};
        border-bottom: 1px solid ${t.border};
        backdrop-filter: blur(20px);
        flex-shrink: 0;
      }
      .adm-brand-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 20px;
        border-bottom: 1px solid ${t.borderSoft};
      }
      .adm-brand {
        display: flex; align-items: center; gap: 10px;
      }
      .adm-brand-icon {
        width: 32px; height: 32px; border-radius: 8px;
        background: ${C.red};
        display: flex; align-items: center; justify-content: center;
        color: #fff; flex-shrink: 0;
      }
      .adm-brand-name  { font-size: 14px; font-weight: 600; color: ${t.text}; }
      .adm-brand-sub   { font-size: 11px; color: ${t.textMuted}; }

      .adm-top-actions { display: flex; align-items: center; gap: 8px; }
      .adm-user-pill {
        display: flex; align-items: center; gap: 7px;
        padding: 6px 12px; border-radius: 8px;
        border: 1px solid ${t.border};
        background: ${t.navHov}; cursor: pointer;
      }
      .adm-user-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: ${C.green};
        animation: blink 2.5s ease-in-out infinite;
      }
      .adm-user-name { font-size: 12px; font-weight: 600; color: ${t.text}; }
      .adm-user-role { font-size: 10px; color: ${t.textMuted}; }

      .adm-ico-btn {
        width: 34px; height: 34px; border-radius: 8px;
        border: 1px solid ${t.border}; background: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: ${t.textMuted}; transition: all .2s; flex-shrink: 0;
      }
      .adm-ico-btn:hover { border-color: ${C.red}; color: ${C.red}; }

      .adm-exit-btn {
        display: flex; align-items: center; gap: 6px;
        padding: 7px 14px; border-radius: 8px;
        border: 1px solid rgba(200,16,46,.3);
        background: none; cursor: pointer;
        font-size: 12px; font-weight: 600; color: ${C.red};
        letter-spacing: .06em; transition: all .2s;
      }
      .adm-exit-btn:hover { background: rgba(200,16,46,.08); }

      /* ── seções nav (barra de abas) ── */
      .adm-secnav {
        display: flex; align-items: center; gap: 2px;
        padding: 0 20px; overflow-x: auto;
        scrollbar-width: none;
      }
      .adm-secnav::-webkit-scrollbar { display: none; }
      .adm-sec-btn {
        display: flex; align-items: center; gap: 6px;
        padding: 9px 14px;
        border: none; border-bottom: 2px solid transparent;
        background: none; cursor: pointer;
        font-size: 12px; font-weight: 600; white-space: nowrap;
        color: ${t.textMuted}; transition: all .2s;
      }
      .adm-sec-btn:hover  { color: ${t.textSec}; }
      .adm-sec-btn.active { border-bottom-color: var(--sec-color); color: var(--sec-color); }
      .adm-sec-sep {
        width: 1px; height: 14px; background: ${t.border};
        flex-shrink: 0; align-self: center; margin: 0 2px;
      }

      /* ── body ── */
      .adm-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }

      /* ── subnav ── */
      .adm-subnav {
        width: 196px; flex-shrink: 0;
        background: ${t.subnav};
        border-right: 1px solid ${t.border};
        padding: 10px 0; overflow-y: auto;
        scrollbar-width: none;
      }
      .adm-subnav::-webkit-scrollbar { display: none; }
      .adm-subnav-label {
        font-size: 10px; font-weight: 700; letter-spacing: .18em;
        text-transform: uppercase; color: ${t.textMuted};
        padding: 8px 16px 6px;
      }
      .adm-subnav-item {
        display: flex; align-items: center; gap: 9px;
        width: 100%; padding: 9px 16px;
        border: none; border-left: 2px solid transparent;
        background: none; cursor: pointer; text-align: left;
        transition: all .15s;
      }
      .adm-subnav-item:hover  { background: ${t.navHov}; }
      .adm-subnav-item.active {
        background: ${t.navActive};
        border-left-color: var(--sec-color);
      }
      .adm-subnav-icon {
        width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        background: ${dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)"};
        transition: background .15s;
      }
      .adm-subnav-item.active .adm-subnav-icon {
        background: var(--sec-color-soft);
      }
      .adm-subnav-main {
        font-size: 12px; font-weight: 600; color: ${t.textSec};
        display: block; line-height: 1.2;
      }
      .adm-subnav-item.active .adm-subnav-main { color: ${t.text}; }
      .adm-subnav-sub {
        font-size: 10px; color: ${t.textMuted};
        display: block; margin-top: 1px;
        text-transform: uppercase; letter-spacing: .07em;
      }
      .adm-subnav-badge {
        margin-left: auto; background: ${C.yellow}; color: ${C.blueDark || "#002470"};
        font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 99px;
        animation: blink 2.5s ease-in-out infinite;
      }

      /* ── conteúdo ── */
      .adm-content {
        flex: 1; overflow-y: auto; padding: 22px 24px 40px;
        background: ${t.bg};
        scrollbar-width: thin;
        scrollbar-color: ${t.border} transparent;
      }

      /* ── page header ── */
      .adm-page-head {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 20px; gap: 12px; flex-wrap: wrap;
      }
      .adm-page-eyebrow {
        font-size: 10px; font-weight: 700; letter-spacing: .18em;
        text-transform: uppercase; color: ${t.textMuted}; margin-bottom: 3px;
      }
      .adm-page-title {
        font-size: 18px; font-weight: 700; color: ${t.text};
      }
      .adm-page-actions { display: flex; gap: 8px; align-items: center; }

      /* ── KPI grid ── */
      .adm-kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px; margin-bottom: 18px;
      }
      .adm-kpi {
        background: ${t.surface}; border: 1px solid ${t.border};
        border-radius: 14px; padding: 16px 14px;
        display: flex; align-items: center; gap: 11px;
      }
      .adm-kpi-icon {
        width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }
      .adm-kpi-num {
        font-size: 24px; font-weight: 700; color: ${t.text}; line-height: 1;
      }
      .adm-kpi-lbl {
        font-size: 10px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; color: ${t.textMuted}; margin-top: 2px;
      }

      /* ── card ── */
      .adm-card {
        background: ${t.surface}; border: 1px solid ${t.border};
        border-radius: 16px; overflow: hidden; margin-bottom: 14px;
      }
      .adm-card-head {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 18px; border-bottom: 1px solid ${t.border};
      }
      .adm-card-head-left { display: flex; align-items: center; gap: 10px; }
      .adm-card-head-icon {
        width: 32px; height: 32px; border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        font-size: 15px; flex-shrink: 0;
      }
      .adm-card-title { font-size: 14px; font-weight: 700; color: ${t.text}; }
      .adm-card-sub   { font-size: 11px; color: ${t.textMuted}; margin-top: 1px; }

      /* ── aviso pendente ── */
      .adm-warn-bar {
        display: flex; align-items: center; gap: 7px;
        padding: 7px 18px;
        background: ${t.warnBg};
        border-bottom: 1px solid ${t.warnBorder};
      }
      .adm-warn-text {
        font-size: 11px; font-weight: 600; color: ${C.yellowDark};
        letter-spacing: .07em; text-transform: uppercase;
      }

      /* ── user row ── */
      .adm-user-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 11px 18px; gap: 10px;
        border-bottom: 1px solid ${t.border};
        transition: background .15s; flex-wrap: wrap;
      }
      .adm-user-row:last-child { border-bottom: none; }
      .adm-user-row:hover { background: ${t.surfaceHov}; }
      .adm-user-row.pend { border-left: 2.5px solid ${C.yellow}; }

      .adm-avatar {
        width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        font-size: 14px; font-weight: 700; color: #fff;
        cursor: pointer; position: relative; overflow: hidden;
      }
      .adm-avatar-overlay {
        position: absolute; inset: 0; border-radius: 10px;
        background: rgba(0,0,0,.5); display: flex; align-items: center;
        justify-content: center; opacity: 0; transition: opacity .2s;
      }
      .adm-avatar:hover .adm-avatar-overlay { opacity: 1; }

      .adm-pill {
        display: inline-flex; align-items: center; gap: 3px;
        padding: 3px 9px; border-radius: 99px; font-size: 10px;
        font-weight: 600; border: 1px solid; white-space: nowrap;
        letter-spacing: .06em;
      }
      .adm-pill-dot {
        width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
      }

      .adm-act-btn {
        width: 28px; height: 28px; border-radius: 7px;
        border: 1px solid ${t.border}; background: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: ${t.textMuted}; transition: all .15s;
      }

      /* ── form ── */
      .adm-form-label {
        display: block; font-size: 10px; font-weight: 700;
        letter-spacing: .16em; text-transform: uppercase;
        color: ${t.textMuted}; margin-bottom: 6px;
      }
      .adm-input-wrap { position: relative; }
      .adm-input-ico {
        position: absolute; left: 12px; top: 50%;
        transform: translateY(-50%); color: ${t.textMuted};
        pointer-events: none;
      }
      .adm-input {
        width: 100%; background: ${t.input};
        border: 1px solid ${t.inputBorder};
        color: ${t.text}; padding: 11px 14px 11px 38px;
        border-radius: 10px; outline: none;
        font-family: inherit; font-size: 14px; transition: all .2s;
        -webkit-appearance: none;
      }
      .adm-input:focus {
        border-color: ${C.red};
        box-shadow: 0 0 0 3px rgba(200,16,46,.08);
      }
      .adm-input::placeholder { color: ${t.textMuted}; }
      .adm-select {
        width: 100%; background: ${t.input};
        border: 1px solid ${t.inputBorder};
        color: ${t.text}; padding: 11px 14px 11px 38px;
        border-radius: 10px; outline: none; cursor: pointer;
        font-family: inherit; font-size: 13px; font-weight: 600;
        appearance: none; -webkit-appearance: none; transition: all .2s;
      }
      .adm-select:focus { border-color: ${C.red}; box-shadow: 0 0 0 3px rgba(200,16,46,.08); }

      /* ── botões ── */
      .adm-btn-red {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 10px 18px; border-radius: 99px; border: none; cursor: pointer;
        background: ${C.red}; color: #fff;
        font-family: inherit; font-size: 11px; font-weight: 700;
        letter-spacing: .12em; text-transform: uppercase; transition: all .2s;
      }
      .adm-btn-red:hover { background: ${C.redDark}; }

      .adm-btn-blue {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 10px 18px; border-radius: 99px; border: none; cursor: pointer;
        background: ${C.blue}; color: #fff;
        font-family: inherit; font-size: 11px; font-weight: 700;
        letter-spacing: .12em; text-transform: uppercase; transition: all .2s;
      }
      .adm-btn-blue:hover { background: ${C.blueDark}; }

      .adm-btn-ghost {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 10px 16px; border-radius: 99px;
        border: 1px solid ${t.border}; cursor: pointer;
        background: none; color: ${t.textSec};
        font-family: inherit; font-size: 11px; font-weight: 600;
        letter-spacing: .1em; text-transform: uppercase; transition: all .2s;
      }
      .adm-btn-ghost:hover { border-color: ${C.red}; color: ${C.red}; }

      /* ── online badge ── */
      .adm-online {
        display: flex; align-items: center; gap: 5px;
        padding: 5px 11px; border-radius: 99px;
        background: rgba(5,150,105,.1); border: 1px solid rgba(5,150,105,.2);
        color: ${C.green}; font-size: 10px; font-weight: 700;
        letter-spacing: .14em; text-transform: uppercase;
      }
      .adm-online-dot {
        width: 6px; height: 6px; border-radius: 50%; background: ${C.green};
        animation: blink 2.5s ease-in-out infinite;
      }

      /* ── toast ── */
      .adm-toast {
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        padding: 12px 18px; border-radius: 11px;
        font-family: inherit; font-size: 11px; font-weight: 700;
        letter-spacing: .1em; text-transform: uppercase;
        display: flex; align-items: center; gap: 8px; z-index: 600;
        white-space: nowrap;
      }

      /* ── modal overlay ── */
      .adm-modal-bg {
        position: fixed; inset: 0; z-index: 200;
        background: rgba(0,0,0,.75); backdrop-filter: blur(8px);
        display: flex; align-items: flex-end; justify-content: center;
      }
      .adm-modal-sheet {
        width: 100%; max-width: 460px; max-height: 90vh;
        display: flex; flex-direction: column;
        border-radius: 20px 20px 0 0;
        background: ${t.surface}; border: 1px solid ${t.border};
        overflow: hidden;
      }
      .adm-modal-inner { padding: 26px 22px; overflow-y: auto; flex: 1; }
      .adm-divider {
        height: 1px; background: ${t.border}; margin: 16px 0;
      }

      /* ── seletor célula ── */
      .adm-celula-sel {
        display: flex; align-items: center; gap: 10px;
        padding: 12px 16px; border-radius: 12px;
        background: ${t.surface}; border: 1px solid ${t.border};
        margin-bottom: 16px; flex-wrap: wrap;
      }
      .adm-celula-label {
        font-size: 10px; font-weight: 700; letter-spacing: .14em;
        text-transform: uppercase; color: ${t.textMuted}; flex-shrink: 0;
      }

      /* ── mobile ── */
      .adm-mob-toggle {
        display: none; width: 34px; height: 34px; border-radius: 8px;
        border: 1px solid ${t.border}; background: none; cursor: pointer;
        align-items: center; justify-content: center;
        color: ${t.textMuted}; flex-shrink: 0;
      }
      .adm-mob-overlay {
        position: fixed; inset: 0; z-index: 49;
        background: rgba(0,0,0,.6); backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
      }

      @media (max-width: 900px) {
        .adm-subnav {
          position: fixed; top: 0; left: -260px; z-index: 50;
          height: 100dvh; width: 240px;
          transition: left .25s cubic-bezier(.4,0,.2,1);
          display: flex; flex-direction: column;
          box-shadow: 4px 0 24px rgba(0,0,0,.25);
        }
        .adm-subnav.open { left: 0; }
        .adm-mob-toggle { display: flex; }

        .adm-content { padding: 16px 14px 32px; }

        .adm-brand-row {
          padding: 8px 12px;
          gap: 6px;
        }
        .adm-brand-icon { width: 28px; height: 28px; }
        .adm-brand-name { font-size: 12px; }
        .adm-brand-sub  { font-size: 10px; }

        .adm-top-actions { gap: 4px; }
        .adm-user-pill { display: none; }
        .adm-online  { display: none; }
        .adm-exit-btn { padding: 6px 10px; font-size: 10px; }
        .adm-exit-btn span { display: none; }

        .adm-secnav { padding: 0 12px; }

        .adm-page-head { flex-direction: column; align-items: flex-start; gap: 10px; }
        .adm-page-title { font-size: 16px; }
        .adm-page-actions { width: 100%; justify-content: flex-start; }

        .adm-kpi-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .adm-kpi { padding: 12px 10px; gap: 8px; }
        .adm-kpi-icon { width: 30px; height: 30px; }
        .adm-kpi-num  { font-size: 20px; }

        .adm-card-head { flex-direction: column; align-items: flex-start; gap: 8px; }

        .adm-user-row  { padding: 10px 12px; }
        .adm-user-row > div:last-child { width: 100%; justify-content: flex-start; }

        .adm-pill { font-size: 9px; padding: 2px 7px; }

        .adm-modal-sheet { max-width: 100%; border-radius: 16px 16px 0 0; }
        .adm-modal-inner { padding: 20px 16px; }

        .adm-celula-sel { padding: 10px 14px; }
        .adm-celula-sel select { font-size: 12px; }

        .adm-subnav.open { box-shadow: 4px 0 40px rgba(0,0,0,.4); }

        .adm-card form { padding: 14px 14px !important; }
      }

      @media (max-width: 480px) {
        .adm-content { padding: 12px 10px 28px; }

        .adm-kpi-grid { gap: 6px; }
        .adm-kpi { padding: 10px 8px; gap: 6px; flex-direction: column; text-align: center; }
        .adm-kpi-icon { width: 26px; height: 26px; }
        .adm-kpi-num  { font-size: 18px; }

        .adm-page-head { margin-bottom: 12px; }
        .adm-page-title { font-size: 15px; }
        .adm-page-eyebrow { font-size: 9px; }

        .adm-card-head { padding: 10px 12px; }
        .adm-card-head-icon { width: 28px; height: 28px; }
        .adm-card-title { font-size: 13px; }

        .adm-user-row { padding: 8px 10px; gap: 6px; }
        .adm-user-row > div:first-child { gap: 8px; }
        .adm-user-row p:first-child { font-size: 12px !important; }
        .adm-user-row p:last-child  { font-size: 10px !important; }

        .adm-avatar { width: 30px; height: 30px; font-size: 12px; }
        .adm-act-btn { width: 26px; height: 26px; }

        .adm-btn-red,
        .adm-btn-blue,
        .adm-btn-ghost { font-size: 10px; padding: 8px 14px; }

        .adm-input { font-size: 13px; padding: 10px 12px 10px 34px; }
        .adm-select { font-size: 12px; padding: 10px 12px 10px 34px; }

        .adm-top-actions .adm-ico-btn { width: 30px; height: 30px; }

        .adm-toast {
          font-size: 10px; padding: 10px 14px;
          bottom: 14px !important; left: 10px; right: 10px;
          transform: none; width: auto; white-space: normal;
          justify-content: center;
        }

        .adm-subnav { width: 220px; left: -240px; }
      }

      .adm-empty {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; padding: 60px 20px; text-align: center;
      }
    `}</style>
  );
}

/* ─── Campo de input com ícone ────────────────────────────────────────────── */
function InputField({ icon, type = "text", value, onChange, placeholder, required, t }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
      <div className="adm-input-wrap">
        <span className="adm-input-ico">{icon}</span>
        <input
            className="adm-input"
            type={isPass && show ? "text" : type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            style={{ paddingRight: isPass ? 40 : 14 }}
        />
        {isPass && (
            <button
                type="button"
                onClick={() => setShow(v => !v)}
                style={{
                  position: "absolute", right: 10, top: "50%",
                  transform: "translateY(-50%)", background: "none", border: "none",
                  cursor: "pointer", color: t.textMuted, display: "flex",
                }}
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        )}
      </div>
  );
}

/* ─── Renderer de módulos ─────────────────────────────────────────────────── */
function ModuloRenderer({ moduloKey, dark, celulaAdmin }) {
  const p = { isDark: dark };
  switch (moduloKey) {
    case "membros":           return <Membros {...p} />;
    case "visitantes":        return <Visitantes {...p} />;
    case "celulas":           return <Celulas {...p} />;
    case "fichas":            return <FichasEncontro {...p} />;
    case "secretariacelulas": return <SecretariaCelulas {...p} />;
    case "painel-pastor":     return <PainelPastor {...p} />;
    case "relatorios":        return <RelatorioCelula {...p} />;
    case "discipulado":       return <Discipulado {...p} />;
    case "multiplicacoes":    return <SolicitacoesMultiplicacao {...p} />;
    case "ranking":           return <RankingCelulas {...p} />;
    case "casas-de-paz":      return <RelatorioCasasDePaz {...p} />;
    case "missao70":          return <RelatorioMissao70Pastor {...p} />;
    case "pendencias":        return <TelaPendencias {...p} />;
    case "alertas":           return <PainelAlertas {...p} />;
    case "lider-relatorio":   return <TelaRelatorio celula={celulaAdmin} {...p} />;
    case "lider-discipulado": return <RelatorioDiscipulado membros={[]} {...p} />;
    case "lider-visitantes":  return <TelaVisitantes celulaId={celulaAdmin?.id} {...p} />;
    case "lider-fichas":      return <TelaFichas celula={celulaAdmin} {...p} />;
    case "lider-casas":       return <CasasDePazLider celulaId={celulaAdmin?.id} {...p} />;
    case "lider-missao70":    return <Missao70Lider celulaId={celulaAdmin?.id} {...p} />;
    case "teso-dashboard":    return <TesourariaDashboard {...p} />;
    case "teso-lancamento":   return <TesourariaLancamento {...p} />;
    case "teso-relatorio":    return <TesourariaRelatorio {...p} />;
    case "teso-dizimistas":   return <TesourariaDizimistas {...p} />;
    case "teso-comparativo":  return <TesourariaComparativo {...p} />;
    default: return null;
  }
}

/* ════════════════════════════════════════════════════════════════════════════ */
export default function AdminUsers() {
  /* state */
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
  const [form,           setForm]           = useState({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });
  const [dark,           setDark]           = useState(() => localStorage.getItem("theme") === "dark");
  const [subnavOpen,     setSubnavOpen]     = useState(false);
  const [moduloAtivo,    setModuloAtivo]    = useState("usuarios");
  const [secaoAtiva,     setSecaoAtiva]     = useState("admin");
  const [celulas,        setCelulas]        = useState([]);
  const [celulaAdmin,    setCelulaAdmin]    = useState(null);

  const fotoRef   = useRef(null);
  const fotoIdRef = useRef(null);
  const t = useTheme(dark);

  useEffect(() => { localStorage.setItem("theme", dark ? "dark" : "light"); }, [dark]);

  /* ── carregamento ── */
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

  /* ── CRUD ── */
  const adicionarUsuario = async e => {
    e.preventDefault(); setSending(true); setErro("");
    try {
      await api.post("usuarios", form);
      setForm({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });
      carregarUsuarios(); ok("Acesso liberado com sucesso.");
    } catch { setErro("Falha ao criar novo acesso."); }
    finally { setSending(false); }
  };

  const salvarEdicao = async e => {
    e.preventDefault(); setSending(true);
    try {
      await api.put(`usuarios/${editandoId}`, form);
      setEditModalOpen(false); setEditandoId(null);
      setForm({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });
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
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file);
      });
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
  const abrirEdicao = u => {
    setEditandoId(u.id);
    setForm({ nome: u.nome, email: u.email, senha: "", perfil: u.perfil });
    setEditModalOpen(true);
  };

  /* ── derivados ── */
  const qtdPend   = pendentes.size;
  const ativos    = usuarios.filter(u =>  u.ativo).length;
  const suspensos = usuarios.filter(u => !u.ativo).length;
  const isLider   = moduloAtivo?.startsWith("lider-");
  const secObj    = SECOES.find(s => s.id === secaoAtiva);
  const itemObj   = secObj?.itens.find(i => i.key === moduloAtivo);

  /* ── navegação ── */
  const irParaSecao = (secId) => {
    const sec = SECOES.find(s => s.id === secId);
    setSecaoAtiva(secId);
    setModuloAtivo(sec.itens[0].key);
  };
  const irParaModulo = (key) => {
    setModuloAtivo(key);
    setSubnavOpen(false);
  };

  /* ── helpers de estilo ── */
  const avatarBg = (u) => {
    if (!u.ativo) return dark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)";
    const cores = ["#C8102E", "#003DA5", "#059669", "#7F77DD", "#C48C00"];
    return cores[(u.nome?.charCodeAt(0) || 0) % cores.length];
  };

  /* ── loading splash ── */
  if (loading && usuarios.length === 0) return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: t.bg }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: C.red, display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 14px",
          }}>
            <Shield size={22} color="#fff" />
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", color: t.textMuted, textTransform: "uppercase" }}>
            Carregando…
          </p>
        </div>
      </div>
  );

  return (
      <div className="adm-root">
        <GlobalStyles t={t} dark={dark} />

        {/* ══ TOPBAR ══════════════════════════════════════════════════════════ */}
        <div className="adm-topbar">
          {/* Linha 1: brand + ações */}
          <div className="adm-brand-row">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="adm-mob-toggle" onClick={() => setSubnavOpen(true)} aria-label="Menu">
                <Menu size={16} />
              </button>
              <div className="adm-brand">
                <div className="adm-brand-icon"><Shield size={16} color="#fff" /></div>
                <div>
                  <div className="adm-brand-name">IEQ Pituaçu</div>
                  <div className="adm-brand-sub">Sistema Eclesiástico</div>
                </div>
              </div>
            </div>
            <div className="adm-top-actions">
              <div className="adm-online">
                <div className="adm-online-dot" /> Online
              </div>
              <div className="adm-user-pill">
                <div className="adm-user-dot" />
                <div>
                  <div className="adm-user-name">Administrador</div>
                  <div className="adm-user-role">Admin · IEQ</div>
                </div>
              </div>
              <button className="adm-ico-btn" onClick={() => setDark(d => !d)} aria-label="Tema">
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button className="adm-ico-btn" onClick={carregarUsuarios} aria-label="Atualizar">
                <RefreshCcw size={15} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
              </button>
              <button className="adm-exit-btn" onClick={() => setExitConfirm(true)}>
                <LogOut size={13} /> Sair
              </button>
            </div>
          </div>

          {/* Linha 2: abas de seção */}
          <div className="adm-secnav">
            {SECOES.map((sec, i) => {
              const Icon = sec.icon;
              const ativa = secaoAtiva === sec.id;
              return (
                  <React.Fragment key={sec.id}>
                    {i > 0 && <div className="adm-sec-sep" />}
                    <button
                        className={`adm-sec-btn${ativa ? " active" : ""}`}
                        style={{ "--sec-color": sec.color }}
                        onClick={() => irParaSecao(sec.id)}
                    >
                      <Icon size={13} />
                      {sec.label}
                    </button>
                  </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ══ BODY ════════════════════════════════════════════════════════════ */}
        <div className="adm-body" style={{ flex: 1, minHeight: 0 }}>

          {/* Overlay mobile */}
          <AnimatePresence>
            {subnavOpen && (
                <motion.div className="adm-mob-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}
                            onClick={() => setSubnavOpen(false)} />
            )}
          </AnimatePresence>

          {/* Subnav lateral */}
          <nav
              className={`adm-subnav${subnavOpen ? " open" : ""}`}
              style={{ "--sec-color": secObj?.color, "--sec-color-soft": secObj?.color + "18" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px 4px" }}>
              <div className="adm-subnav-label" style={{ padding: 0 }}>{secObj?.label}</div>
              <button className="adm-mob-toggle" onClick={() => setSubnavOpen(false)} aria-label="Fechar" style={{ width: 30, height: 30 }}>
                <X size={14} />
              </button>
            </div>
            {secObj?.itens.map(item => {
              const Icon = item.icon;
              const ativo = moduloAtivo === item.key;
              return (
                  <button
                      key={item.key}
                      className={`adm-subnav-item${ativo ? " active" : ""}`}
                      onClick={() => irParaModulo(item.key)}
                  >
                    <div className="adm-subnav-icon">
                      <Icon size={14} style={{ color: ativo ? secObj.color : t.textMuted }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="adm-subnav-main">{item.label}</span>
                      <span className="adm-subnav-sub">{item.sub}</span>
                    </div>
                    {item.key === "usuarios" && qtdPend > 0 && (
                        <span className="adm-subnav-badge">{qtdPend}</span>
                    )}
                  </button>
              );
            })}
          </nav>

          {/* Conteúdo principal */}
          <div className="adm-content">

            {/* Seletor de célula (módulos líder) */}
            {isLider && celulas.length > 0 && (
                <div className="adm-celula-sel">
                  <Building2 size={15} style={{ color: C.blue, flexShrink: 0 }} />
                  <span className="adm-celula-label">Célula:</span>
                  <div style={{ position: "relative", flex: 1, minWidth: 120 }}>
                    <select
                        className="adm-select"
                        style={{ paddingLeft: 14 }}
                        value={celulaAdmin?.id || ""}
                        onChange={e => setCelulaAdmin(celulas.find(c => c.id === Number(e.target.value)))}
                    >
                      {celulas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                  key={moduloAtivo}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: .16 }}
              >

                {/* ── PAINEL USUÁRIOS ─────────────────────────────────────── */}
                {moduloAtivo === "usuarios" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                      {/* Page header */}
                      <div className="adm-page-head">
                        <div>
                          <div className="adm-page-eyebrow">Administração</div>
                          <div className="adm-page-title">Usuários</div>
                        </div>
                        <div className="adm-page-actions">
                          <button className="adm-ico-btn" onClick={carregarUsuarios} aria-label="Atualizar">
                            <RefreshCcw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                          </button>
                          <button
                              className="adm-btn-red"
                              onClick={() => { setEditandoId(null); setForm({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" }); setEditModalOpen(true); }}
                          >
                            <UserPlus size={13} /> Novo acesso
                          </button>
                        </div>
                      </div>

                      {/* KPIs */}
                      <div className="adm-kpi-grid">
                        {[
                          { icon: <Users size={16} />,  label: "Total",     value: usuarios.length, color: C.blue,       bg: "rgba(0,61,165,.1)"   },
                          { icon: <Power size={16} />,  label: "Ativos",    value: ativos,          color: C.green,      bg: "rgba(5,150,105,.1)"  },
                          { icon: <Shield size={16} />, label: "Suspensos", value: suspensos,       color: C.redDark,    bg: "rgba(200,16,46,.1)"  },
                          { icon: <Clock size={16} />,  label: "Pendentes", value: qtdPend,         color: C.yellowDark, bg: "rgba(196,140,0,.1)"  },
                        ].map(({ icon, label, value, color, bg }) => (
                            <div key={label} className="adm-kpi">
                              <div className="adm-kpi-icon" style={{ background: bg, color }}>
                                {icon}
                              </div>
                              <div>
                                <div className="adm-kpi-num" style={{ color: label === "Pendentes" && value > 0 ? C.yellowDark : t.text }}>
                                  {value}
                                </div>
                                <div className="adm-kpi-lbl">{label}</div>
                              </div>
                            </div>
                        ))}
                      </div>

                      {/* Formulário */}
                      <div className="adm-card">
                        <div className="adm-card-head">
                          <div className="adm-card-head-left">
                            <div className="adm-card-head-icon" style={{ background: "rgba(200,16,46,.1)", color: C.red }}>
                              <UserPlus size={15} />
                            </div>
                            <div>
                              <div className="adm-card-title">Novo acesso</div>
                              <div className="adm-card-sub">Liberar usuário no sistema</div>
                            </div>
                          </div>
                        </div>
                        <form onSubmit={adicionarUsuario} style={{ padding: "18px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                          {[
                            { icon: <User size={13} />,  type: "text",     placeholder: "Nome completo",       key: "nome",  label: "Nome"  },
                            { icon: <Mail size={13} />,  type: "email",    placeholder: "E-mail institucional", key: "email", label: "E-mail" },
                            { icon: <Key size={13} />,   type: "password", placeholder: "Senha de acesso",      key: "senha", label: "Senha" },
                          ].map(f => (
                              <div key={f.key}>
                                <label className="adm-form-label">{f.label}</label>
                                <InputField
                                    icon={f.icon} type={f.type} placeholder={f.placeholder}
                                    value={form[f.key]} onChange={v => setForm({ ...form, [f.key]: v })}
                                    required t={t}
                                />
                              </div>
                          ))}
                          <div>
                            <label className="adm-form-label">Perfil</label>
                            <div className="adm-input-wrap">
                              <span className="adm-input-ico"><Shield size={13} /></span>
                              <select className="adm-select" value={form.perfil} onChange={e => setForm({ ...form, perfil: e.target.value })}>
                                {PERFIS.map(p => <option key={p} value={p}>{p.replace(/_/g, " ")}</option>)}
                              </select>
                            </div>
                          </div>
                          <button type="submit" disabled={sending} className="adm-btn-red" style={{ width: "100%", justifyContent: "center", opacity: sending ? .6 : 1 }}>
                            {sending
                                ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Criando…</>
                                : <><UserPlus size={13} /> Liberar Acesso</>
                            }
                          </button>
                        </form>
                      </div>

                      {/* Lista de usuários */}
                      <div className="adm-card">
                        {qtdPend > 0 && (
                            <div className="adm-warn-bar">
                              <Clock size={13} style={{ color: C.yellowDark, flexShrink: 0 }} />
                              <span className="adm-warn-text">
                          {qtdPend} solicitaç{qtdPend > 1 ? "ões" : "ão"} aguardando aprovação
                        </span>
                            </div>
                        )}
                        <div className="adm-card-head">
                          <div className="adm-card-head-left">
                            <div className="adm-card-head-icon" style={{ background: "rgba(0,61,165,.08)", color: C.blue }}>
                              <Users size={15} />
                            </div>
                            <div>
                              <div className="adm-card-title">Base de usuários</div>
                              <div className="adm-card-sub">{usuarios.length} registros</div>
                            </div>
                          </div>
                          <button className="adm-btn-ghost" onClick={carregarUsuarios}>
                            <RefreshCcw size={12} /> Atualizar
                          </button>
                        </div>

                        <AnimatePresence>
                          {usuarios.map((u, i) => {
                            const temP = pendentes.has(u.id);
                            const eApr = aprovando === u.id;
                            const eFoto = uploadandoFoto === u.id;
                            return (
                                <motion.div
                                    key={u.id}
                                    className={`adm-user-row${temP ? " pend" : ""}`}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ delay: i * .025 }}
                                >
                                  {/* Avatar */}
                                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                                    <div
                                        className="adm-avatar"
                                        style={{ background: avatarBg(u), opacity: u.ativo ? 1 : .5 }}
                                        onClick={() => abrirSeletorFoto(u.id)}
                                    >
                                      {u.fotoPerfil
                                          ? <img src={u.fotoPerfil} alt={u.nome} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                                          : u.nome?.charAt(0).toUpperCase()
                                      }
                                      <div className="adm-avatar-overlay">
                                        {eFoto
                                            ? <Loader2 size={12} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
                                            : <Camera size={12} color="#fff" />
                                        }
                                      </div>
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                      <p style={{ fontSize: 13, fontWeight: 700, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.nome}</p>
                                      <p style={{ fontSize: 11, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
                                    </div>
                                  </div>

                                  {/* Badges + ações */}
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
                              <span className="adm-pill" style={{ color: C.blue, background: "rgba(0,61,165,.07)", borderColor: "rgba(0,61,165,.2)" }}>
                                {u.perfil?.replace(/_/g, " ")}
                              </span>
                                    <span className="adm-pill" style={{
                                      color: u.ativo ? C.green : t.textMuted,
                                      background: u.ativo ? "rgba(5,150,105,.07)" : "rgba(0,0,0,.04)",
                                      borderColor: u.ativo ? "rgba(5,150,105,.2)" : t.border,
                                    }}>
                                <span className="adm-pill-dot" style={{ background: u.ativo ? C.green : t.textMuted }} />
                                      {u.ativo ? "Ativo" : "Suspenso"}
                              </span>

                                    {temP && (
                                        <>
                                          <button
                                              disabled={eApr}
                                              onClick={() => aprovarAlteracao(u.id, u.nome)}
                                              style={{
                                                display: "flex", alignItems: "center", gap: 4,
                                                background: "none", border: "1px solid rgba(5,150,105,.3)",
                                                borderRadius: 7, color: C.green, fontSize: 10, fontWeight: 700,
                                                cursor: "pointer", padding: "4px 9px", letterSpacing: ".07em",
                                              }}
                                          >
                                            {eApr ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={11} />} Aprovar
                                          </button>
                                          <button
                                              disabled={eApr}
                                              onClick={() => rejeitarAlteracao(u.id, u.nome)}
                                              style={{
                                                display: "flex", alignItems: "center", gap: 4,
                                                background: "none", border: "1px solid rgba(200,16,46,.3)",
                                                borderRadius: 7, color: C.red, fontSize: 10, fontWeight: 700,
                                                cursor: "pointer", padding: "4px 9px", letterSpacing: ".07em",
                                              }}
                                          >
                                            {eApr ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : <XCircle size={11} />} Rejeitar
                                          </button>
                                        </>
                                    )}

                                    {[
                                      { icon: <Pencil size={13} />,  title: "Editar",    action: () => abrirEdicao(u),      hc: C.blue,       hb: "rgba(0,61,165,.08)"    },
                                      { icon: <Power size={13} />,   title: "Suspender", action: () => alternarStatus(u.id),hc: C.yellowDark, hb: "rgba(196,140,0,.08)"   },
                                      { icon: <Trash2 size={13} />,  title: "Excluir",   action: () => deletarUsuario(u.id),hc: C.red,        hb: "rgba(200,16,46,.08)"   },
                                    ].map(btn => (
                                        <button
                                            key={btn.title} title={btn.title}
                                            className="adm-act-btn"
                                            onClick={btn.action}
                                            onMouseEnter={e => { e.currentTarget.style.color = btn.hc; e.currentTarget.style.background = btn.hb; e.currentTarget.style.borderColor = btn.hc; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = t.border; }}
                                        >
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

                {/* ── HISTÓRICO ──────────────────────────────────────────── */}
                {moduloAtivo === "historico" && (
                    <>
                      <div className="adm-page-head">
                        <div>
                          <div className="adm-page-eyebrow">Administração</div>
                          <div className="adm-page-title">Histórico de alterações</div>
                        </div>
                      </div>
                      <HistoricoAuditoria isDark={dark} embedded />
                    </>
                )}

                {/* ── OUTROS MÓDULOS ─────────────────────────────────────── */}
                {moduloAtivo !== "usuarios" && moduloAtivo !== "historico" && (
                    <>
                      <div className="adm-page-head">
                        <div>
                          <div className="adm-page-eyebrow">{secObj?.label}</div>
                          <div className="adm-page-title">{itemObj?.label}</div>
                        </div>
                      </div>
                      <ModuloRenderer moduloKey={moduloAtivo} dark={dark} celulaAdmin={celulaAdmin} />
                    </>
                )}

              </motion.div>
            </AnimatePresence>

            <p style={{ textAlign: "center", fontSize: 10, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: t.textMuted, opacity: .4, paddingTop: 24 }}>
              © {new Date().getFullYear()} IEQ Pituaçu · Sistema Eclesiástico
            </p>
          </div>
        </div>

        {/* Input foto oculto */}
        <input ref={fotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFoto} />

        {/* ══ MODAL: Edição / Criação ═════════════════════════════════════════ */}
        <AnimatePresence>
          {editModalOpen && (
              <motion.div className="adm-modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          onClick={e => e.target === e.currentTarget && setEditModalOpen(false)}
              >
                <motion.div
                    className="adm-modal-sheet"
                    initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 300 }}
                >
                  <div className="adm-modal-inner">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center",
                          justifyContent: "center", color: "#fff",
                          background: editandoId ? C.blue : C.red,
                        }}>
                          {editandoId ? <Pencil size={16} /> : <UserPlus size={16} />}
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>
                            {editandoId ? "Editar usuário" : "Novo acesso"}
                          </div>
                          {editandoId && <div style={{ fontSize: 11, color: t.textMuted }}>ID: {editandoId}</div>}
                        </div>
                      </div>
                      <button
                          onClick={() => setEditModalOpen(false)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, display: "flex" }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="adm-divider" />
                    <form onSubmit={editandoId ? salvarEdicao : adicionarUsuario} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { icon: <User size={13} />,  type: "text",     placeholder: "Nome completo",                                  key: "nome",  label: "Nome",   req: true          },
                        { icon: <Mail size={13} />,  type: "email",    placeholder: "E-mail institucional",                            key: "email", label: "E-mail", req: true          },
                        { icon: <Key size={13} />,   type: "password", placeholder: editandoId ? "Deixe vazio para manter" : "Senha", key: "senha", label: "Senha",  req: !editandoId   },
                      ].map(f => (
                          <div key={f.key}>
                            <label className="adm-form-label">{f.label}</label>
                            <InputField
                                icon={f.icon} type={f.type} placeholder={f.placeholder}
                                value={form[f.key]} onChange={v => setForm({ ...form, [f.key]: v })}
                                required={f.req} t={t}
                            />
                          </div>
                      ))}
                      <div>
                        <label className="adm-form-label">Perfil</label>
                        <div className="adm-input-wrap">
                          <span className="adm-input-ico"><Shield size={13} /></span>
                          <select className="adm-select" value={form.perfil} onChange={e => setForm({ ...form, perfil: e.target.value })}>
                            {PERFIS.map(p => <option key={p} value={p}>{p.replace(/_/g, " ")}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <button type="button" onClick={() => setEditModalOpen(false)} className="adm-btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                          Cancelar
                        </button>
                        <button type="submit" disabled={sending} className={editandoId ? "adm-btn-blue" : "adm-btn-red"} style={{ flex: 2, justifyContent: "center", opacity: sending ? .6 : 1 }}>
                          {sending
                              ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Salvando…</>
                              : editandoId ? <><Pencil size={13} /> Salvar alterações</> : <><UserPlus size={13} /> Liberar acesso</>
                          }
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* ══ MODAL: Sair ════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {exitConfirm && (
              <motion.div
                  style={{
                    position: "fixed", inset: 0, zIndex: 300,
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
                    background: "rgba(0,0,0,.8)", backdropFilter: "blur(10px)",
                  }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={e => e.target === e.currentTarget && setExitConfirm(false)}
              >
                <motion.div
                    initial={{ scale: .9, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: .92, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    style={{
                      width: "100%", maxWidth: 340,
                      background: t.surface, border: `1px solid ${t.border}`,
                      borderRadius: 20, padding: "32px 24px 24px", textAlign: "center",
                    }}
                >
                  <div style={{
                    width: 54, height: 54, borderRadius: "50%",
                    background: "rgba(200,16,46,.08)", border: "1px solid rgba(200,16,46,.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: C.red, margin: "0 auto 18px",
                  }}>
                    <LogOut size={22} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 8 }}>Encerrar sessão</h3>
                  <p style={{ fontSize: 13, color: t.textSec, marginBottom: 22, lineHeight: 1.6 }}>
                    Tem certeza que deseja sair do sistema?
                  </p>
                  <div className="adm-divider" style={{ marginBottom: 18 }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setExitConfirm(false)} className="adm-btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                      Cancelar
                    </button>
                    <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="adm-btn-red" style={{ flex: 1.5, justifyContent: "center" }}>
                      <LogOut size={13} /> Sair agora
                    </button>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* ══ TOASTS ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {sucesso && (
              <motion.div className="adm-toast" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                          style={{ background: C.green, color: "#fff" }}>
                <CheckCircle size={14} /> {sucesso}
              </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {erro && (
              <motion.div className="adm-toast" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                          style={{ background: C.red, color: "#fff", bottom: sucesso ? 68 : 24 }}>
                <Power size={14} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60vw" }}>{erro}</span>
                <button onClick={() => setErro("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.7)", display: "flex", marginLeft: 4 }}>
                  <X size={14} />
                </button>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
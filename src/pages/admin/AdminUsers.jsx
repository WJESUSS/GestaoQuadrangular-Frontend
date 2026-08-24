import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
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
  BarChart2, TrendingUp, Target, ChevronRight,
  MessageCircle, Filter, AlertCircle, WifiOff, RefreshCw,
  ChevronLeft, Inbox,
  ShieldOff, Ban, Unlock, ShieldCheck, AlertTriangle, Info, UserCheck,
  Droplets,
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
import RelatorioMissao70Pastor   from "../pastor/RelatorioMissao70Pastor";
import RelatoriosDiscipuladoCelulas from "../pastor/RelatoriosDiscipuladoCelulas";
import TelaRelatorio             from "../lider/TelaRelatorio";
import RelatorioDiscipulado      from "../lider/RelatorioDiscipulado";
import TelaVisitantes            from "../lider/TelaVisitantes";
import TelaFichas                from "../lider/TelaFichas";
import Missao70Lider             from "../lider/Missao70Lider";
import AcompanhamentoDiscipulado from "../lider/AcompanhamentoDiscipulado";
import TesourariaDashboard       from "../tesouraria/TesourariaDashboard";
import TesourariaLancamento      from "../tesouraria/TesourariaLancamento";
import TesourariaRelatorio       from "../tesouraria/TesourariaRelatorio";
import TesourariaDizimistas      from "../tesouraria/TesourariaDizimistas";
import TesourariaComparativo     from "../tesouraria/TesourariaComparativo";
import HistoricoAuditoria        from "./HistoricoAuditoria";
import FichasConvertido          from "../secretaria/FichasConvertido";


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
  wa:         "#25D366",
  waDark:     "#1a9e4a",
};

function theme(isDark) {
  return {
    bg:          isDark ? "#080810"              : "#F2EDE4",
    bgEl:        isDark ? "rgba(14,14,22,.98)"   : "rgba(255,255,255,.98)",
    bgElHover:   isDark ? "rgba(20,20,32,.98)"   : "rgba(248,244,238,.98)",
    bgInput:     isDark ? "rgba(255,255,255,.05)": "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.09)": "rgba(201,169,110,.18)",
    borderIn:    isDark ? "rgba(201,169,110,.13)": "rgba(201,169,110,.25)",
    borderHov:   isDark ? "rgba(201,169,110,.28)": "rgba(201,169,110,.45)",
    text:        isDark ? "#EDE8DF"              : "#180E04",
    textSec:     isDark ? "#8A8378"              : "#6B5E4A",
    textMuted:   isDark ? "#585248"              : "#9A8E80",
    glow1:       isDark ? "rgba(200,16,46,.06)"  : "rgba(200,16,46,.04)",
    glow2:       isDark ? "rgba(0,61,165,.05)"   : "rgba(0,61,165,.035)",
    glow3:       isDark ? "rgba(201,169,110,.04)": "rgba(201,169,110,.06)",
    headerBg:    isDark ? "rgba(8,8,14,.97)"     : "rgba(242,237,228,.97)",
    megaBg:      isDark ? "rgba(10,10,18,.99)"   : "rgba(252,249,244,.99)",
    overlayBg:   isDark ? "rgba(5,5,10,.99)"     : "rgba(8,6,4,.985)",
    placeholder: isDark ? "rgba(138,131,120,.3)" : "rgba(107,94,74,.3)",
    shadow:      isDark ? "rgba(0,0,0,.7)"       : "rgba(0,0,0,.12)",
    drawerBg:    isDark ? "rgba(10,10,18,.99)"   : "rgba(252,249,244,.99)",
  };
}

const perfis = ["ADMIN","PASTOR","LIDER_CELULA","SECRETARIO","TESOUREIRO"];

const SECOES = [
  {
    id:"admin", label:"Administração", icon:Shield, color:AURA.red,
    itens:[
      { key:"usuarios",    label:"Usuários",    sub:"Controle de acesso", icon:Users         },
      { key:"historico",   label:"Histórico",   sub:"Log de auditoria",   icon:History       },
      { key:"wa-registros",label:"WhatsApp",    sub:"Mensagens webhook",  icon:MessageCircle },
      { key:"bloqueios",   label:"Bloqueios",   sub:"Números bloqueados", icon:ShieldOff     },
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
      { key:"fichas-convertido", label:"Convertidos",  sub:"Novas vidas",     icon:Droplets },
    ],
  },
  {
    id:"pastor", label:"Pastoral", icon:LayoutDashboard, color:"#e05050",
    itens:[
      { key:"painel-pastor",  label:"Dashboard",    sub:"Visão geral",     icon:LayoutDashboard },
      { key:"relatorios",     label:"Relatórios",   sub:"Células",         icon:FileText        },
      { key:"discipulado",    label:"Discipulado",  sub:"Secretaria",      icon:Users           },
      { key:"acompanhamento", label:"Acompanhamento", sub:"Discipulado",   icon:UserCheck       },
      { key:"multiplicacoes", label:"Multiplicação",sub:"Solicitações",    icon:Share2          },
      { key:"ranking",        label:"Ranking",      sub:"Células",         icon:Trophy          },
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
      { key:"lider-acompanhamento", label:"Acompanhamento", sub:"Membro", icon:UserCheck },
      { key:"lider-visitantes",  label:"Visitantes",  sub:"Novas vidas",  icon:UserPlus },
      { key:"lider-fichas",      label:"Fichas",      sub:"Encontro",     icon:FileText },
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

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function normalizarNumero(n) {
  return (n || "").replace(/\D/g, "");
}

function normalizarTelBR(n) {
  const d = (n || "").replace(/\D/g, "");
  if (d.length === 13 && d.startsWith("55")) {
    return d.slice(0, 4) + d.slice(5);
  }
  return d;
}

function extrairTexto(r) {
  if (r.textoMensagem) return r.textoMensagem;
  try {
    const p = JSON.parse(r.payload);
    if (p?.text?.body)           return p.text.body;
    if (p?.image?.caption)       return `[Imagem] ${p.image.caption}`;
    if (p?.image)                return "[Imagem]";
    if (p?.document?.filename)   return `[Documento] ${p.document.filename}`;
    if (p?.audio)                return "[Áudio]";
    if (p?.video?.caption)       return `[Vídeo] ${p.video.caption}`;
    if (p?.video)                return "[Vídeo]";
    if (p?.sticker)              return "[Sticker]";
    if (p?.location)             return "[Localização]";
    if (p?.contacts)             return "[Contato]";
  } catch { }
  return null;
}

function extrairTipoMsg(r) {
  if (r.tipoMensagem) return r.tipoMensagem;
  try {
    const p = JSON.parse(r.payload);
    return p?.type || null;
  } catch { return null; }
}

function fmtData(d) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " +
        dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch { return d; }
}

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
      height: 100vh; height: 100dvh;
      display: flex; flex-direction: column; position: relative;
      overflow-x: hidden;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-y: contain;
      transition: background .35s, color .35s;
      isolation: isolate; width: 100%;
    }
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
    @media (min-width: 480px) { .adm-brand-text { display: block; } }
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
    .adm-topbar-sep { width: 1px; height: 22px; flex-shrink: 0; background: ${t.border}; }
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
      background: rgba(5,150,105,.08); border: 1px solid rgba(5,150,105,.2);
      color: ${AURA.green};
      font-size: 8px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; flex-shrink: 0;
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
      display: none; align-items: center; gap: 8px;
      padding: 6px 12px 6px 8px; border-radius: 100px;
      background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)"};
      border: 1px solid ${t.border}; flex-shrink: 0;
    }
    @media (min-width: 900px) { .adm-user-chip { display: flex; } }
    .adm-user-chip-dot { width: 7px; height: 7px; border-radius: 50%; background: ${AURA.green}; flex-shrink: 0; box-shadow: 0 0 8px ${AURA.green}88; animation: adm-blink 2.8s ease-in-out infinite; }
    .adm-user-chip-name { font-size: 11px; font-weight: 600; color: ${t.text}; line-height: 1.1; white-space: nowrap; }
    .adm-user-chip-role { font-size: 7.5px; color: ${t.textMuted}; letter-spacing: .1em; text-transform: uppercase; line-height: 1.1; }

    .adm-nav-row {
      display: none; align-items: stretch;
      padding: 0 24px; gap: 2px; border-top: 1px solid ${t.border};
    }
    @media (min-width: 900px) { .adm-nav-row { display: flex; } }
    .adm-nav-sec-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 11px 16px; border: none; background: transparent; cursor: pointer;
      font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 600;
      letter-spacing: .06em; color: ${t.textSec};
      position: relative; transition: color .2s, background .2s; white-space: nowrap;
    }
    .adm-nav-sec-btn::after {
      content: ''; position: absolute; left: 16px; right: 16px; bottom: 0; height: 2px;
      border-radius: 2px 2px 0 0; background: var(--sc, ${AURA.gold});
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

    .adm-megamenu-backdrop { position: fixed; inset: 0; z-index: 95; background: transparent; }
    .adm-megamenu {
      position: absolute; left: 0; right: 0; top: 100%; z-index: 96;
      background: ${t.megaBg}; border-bottom: 1px solid ${t.border};
      box-shadow: 0 24px 60px rgba(0,0,0,.35); overflow: hidden;
    }
    .adm-megamenu-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 4px; padding: 18px 24px 22px; max-width: 1100px; margin: 0 auto;
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
    .adm-mega-ico { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .adm-mega-main { font-size: 12px; font-weight: 600; color: ${t.text}; display: block; line-height: 1.2; }
    .adm-mega-sub  { font-size: 9.5px; color: ${t.textMuted}; letter-spacing: .03em; display: block; margin-top: 1px; }
    .adm-mega-rel  { position: relative; flex: 1; min-width: 0; }
    .adm-mega-badge { position: absolute; right: 0; top: -2px; background: ${AURA.yellow}; color: #080810; font-size: 8px; font-weight: 700; padding: 1px 6px; border-radius: 99px; }

    .adm-mobile-overlay { position: fixed; inset: 0; z-index: 250; background: ${t.overlayBg}; display: flex; flex-direction: column; }
    .adm-mobile-overlay-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; flex-shrink: 0; border-bottom: 1px solid rgba(201,169,110,.08); }
    .adm-mobile-overlay-body { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 8px 0 24px; }
    .adm-mobile-sec-toggle { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; cursor: pointer; user-select: none; min-height: 48px; }
    .adm-mobile-sec-left { display: flex; align-items: center; gap: 9px; }
    .adm-mobile-sec-label { font-size: 12.5px; font-weight: 700; letter-spacing: .04em; color: rgba(245,240,232,.85); }
    .adm-mobile-nav-item {
      width: 100%; display: flex; align-items: center; gap: 12px;
      padding: 12px 20px 12px 32px; min-height: 48px;
      border: none; cursor: pointer; background: transparent; text-align: left; position: relative;
    }
    .adm-mobile-nav-item.act { background: rgba(255,255,255,.045); }
    .adm-mobile-nav-item::before {
      content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
      width: 2px; height: 0; border-radius: 0 2px 2px 0;
      background: var(--nc, ${AURA.gold}); transition: height .15s;
    }
    .adm-mobile-nav-item.act::before { height: 24px; }
    .adm-mobile-nav-ico { width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.04); }
    .adm-mobile-nav-main { font-size: 12.5px; font-weight: 500; color: rgba(245,240,232,.55); display: block; line-height: 1.2; }
    .adm-mobile-nav-item.act .adm-mobile-nav-main { color: rgba(245,240,232,.95); font-weight: 600; }
    .adm-mobile-nav-sub { font-size: 9px; color: rgba(245,240,232,.2); margin-top: 2px; display: block; text-transform: uppercase; letter-spacing: .06em; }
    .adm-mobile-nav-badge { margin-left: auto; background: ${AURA.yellow}; color: #080810; font-size: 8.5px; font-weight: 700; padding: 2px 8px; border-radius: 99px; flex-shrink: 0; }
    .adm-mobile-overlay-foot { padding: 14px 18px 22px; flex-shrink: 0; border-top: 1px solid rgba(201,169,110,.08); }

    .adm-main { flex: 1; min-height: 0; display: flex; flex-direction: column; position: relative; z-index: 1; min-width: 0; }
    .adm-page-eyebrow { font-size: 7.5px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: ${t.textMuted}; margin: 0 0 2px; }
    .adm-page-title { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 500; color: ${t.text}; margin: 0; line-height: 1.1; }
    .adm-page-head { padding: 18px 22px 0; }
    @media (min-width: 640px) { .adm-page-head { padding: 22px 32px 0; } }
    .adm-content { flex: 1; padding: 16px 22px 24px; padding-bottom: max(36px, env(safe-area-inset-bottom, 36px)); -webkit-overflow-scrolling: touch; }
    @media (min-width: 640px) { .adm-content { padding: 18px 32px 28px; } }
    .adm-card {
      background: ${t.bgEl}; border: 1px solid ${t.border};
      border-radius: 20px; overflow: hidden; position: relative; backdrop-filter: blur(24px);
    }
    .adm-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent 5%, rgba(201,169,110,.18) 40%, rgba(201,169,110,.18) 60%, transparent 95%);
      pointer-events: none;
    }

    .adm-kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 18px; }
    @media (min-width: 640px) { .adm-kpi-grid { grid-template-columns: repeat(4, 1fr); } }
    .adm-kpi {
      background: ${t.bgEl}; border: 1px solid ${t.border};
      border-radius: 18px; padding: 20px 18px; position: relative; overflow: hidden;
      backdrop-filter: blur(20px); transition: border-color .25s, transform .22s;
    }
    .adm-kpi:hover { border-color: ${t.borderHov}; transform: translateY(-2px); }
    .adm-kpi::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,169,110,.18), transparent); }
    .adm-kpi-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
    .adm-kpi-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .adm-kpi-num { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 600; line-height: 1; margin: 0 0 3px; }
    .adm-kpi-lbl { font-size: 8.5px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: ${t.textMuted}; }
    .adm-kpi-trend { font-size: 8px; font-weight: 500; color: ${t.textMuted}; margin-top: 2px; }
    .adm-label { display: block; font-size: 8.5px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: rgba(201,169,110,.65); margin: 0 0 7px; }
    .adm-input {
      width: 100%; background: ${t.bgInput}; border: 1px solid ${t.borderIn};
      color: ${t.text}; padding: 12px 16px 12px 44px; border-radius: 12px;
      outline: none; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300; transition: all .22s;
      -webkit-appearance: none; appearance: none;
    }
    .adm-input:focus { border-color: rgba(201,169,110,.45); box-shadow: 0 0 0 3px rgba(201,169,110,.07), 0 2px 12px rgba(0,0,0,.08); }
    .adm-input::placeholder { color: ${t.placeholder}; }
    .adm-select {
      width: 100%; background: ${t.bgInput}; border: 1px solid ${t.borderIn};
      color: ${t.text}; padding: 12px 14px 12px 44px; border-radius: 12px;
      outline: none; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500;
      cursor: pointer; appearance: none; -webkit-appearance: none; transition: all .22s;
    }
    .adm-select:focus { border-color: rgba(201,169,110,.45); box-shadow: 0 0 0 3px rgba(201,169,110,.07); }
    .adm-select option { background: ${t.bgEl}; color: ${t.text}; }
    .adm-select option:checked, .adm-select option:hover { background: ${isDark ? "#1c1c2c" : "#EFE7D6"}; color: ${t.text}; }
    .adm-divider { height: 1px; margin: 18px 0; background: linear-gradient(90deg, transparent 0%, ${t.border} 30%, ${t.border} 70%, transparent 100%); }

    .adm-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; gap: 14px; border-bottom: 1px solid ${t.border}; transition: all .25s ease; flex-wrap: wrap; border-radius: 12px; margin-bottom: 4px; }
    .adm-row:last-child { border-bottom: none; margin-bottom: 0; }
    .adm-row-l { display: flex; align-items: center; gap: 13px; flex: 1; min-width: 0; }
    .adm-row-r { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
    @media (max-width: 639px) {
      .adm-row-r { width: 100%; }
      .adm-row-r .adm-pending-action { flex: 1; justify-content: center; }
      .adm-row-r .adm-action-btn { flex-shrink: 0; }
    }
    .adm-avatar { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; overflow: hidden; position: relative; cursor: pointer; transition: transform .2s; }
    .adm-avatar:hover { transform: scale(1.06); }
    .adm-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .adm-avatar-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 600; color: #fff; }
    .adm-avatar-overlay { position: absolute; inset: 0; border-radius: 12px; background: rgba(0,0,0,.52); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .18s; }
    .adm-avatar:hover .adm-avatar-overlay { opacity: 1; }
    .adm-row-name { font-size: 13px; font-weight: 600; color: ${t.text}; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: default; letter-spacing: .01em; }
    .adm-row-email { font-size: 11.5px; font-weight: 400; color: ${t.textMuted}; margin: 2px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .adm-badge { padding: 3px 10px; border-radius: 99px; font-size: 8px; font-weight: 600; letter-spacing: .1em; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px; }
    .adm-action-btn { width: 32px; height: 32px; border-radius: 9px; border: 1px solid ${t.border}; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: ${t.textMuted}; transition: all .2s ease; }
    .adm-action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.12); }
    .adm-pending-action { display: flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 8px; border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; transition: all .2s; }

    .adm-toast {
      position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%);
      padding: 12px 20px; border-radius: 14px;
      font-family: 'Inter', sans-serif; font-size: 9.5px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
      display: flex; align-items: center; gap: 10px; z-index: 600;
      max-width: 88vw; white-space: nowrap; backdrop-filter: blur(20px);
    }
    @media (max-width: 480px) { .adm-toast { max-width: 92vw; white-space: normal; bottom: 16px; padding: 11px 16px; } }
    .adm-celula-bar { background: ${t.bgEl}; border: 1px solid ${t.border}; border-radius: 14px; padding: 13px 18px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

    .adm-modal-backdrop { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.78); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); display: flex; align-items: flex-start; justify-content: center; padding: 60px 16px 40px; overflow-y: auto; }
    .adm-modal-box { width: 100%; max-width: 520px; background: ${t.drawerBg}; border: 1px solid ${t.border}; border-radius: 22px; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(201,169,110,.06); position: relative; }
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
    .adm-btn-primary { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 20px; border-radius: 12px; border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .15em; text-transform: uppercase; transition: all .25s; }
    .adm-btn-primary.blue { background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue}); color: #fff; box-shadow: 0 6px 20px rgba(0,61,165,.22); }
    .adm-btn-primary.blue:hover { transform: translateY(-1px); box-shadow: 0 10px 26px rgba(0,61,165,.32); }
    .adm-btn-primary.red { background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red}); color: #fff; box-shadow: 0 6px 20px rgba(200,16,46,.22); }
    .adm-btn-primary.red:hover { transform: translateY(-1px); box-shadow: 0 10px 26px rgba(200,16,46,.32); }
    .adm-btn-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 14px 18px; border-radius: 12px; border: 1px solid ${t.border}; cursor: pointer; background: transparent; color: ${t.textSec}; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; transition: all .22s; }
    .adm-btn-ghost:hover { border-color: ${t.borderHov}; color: ${t.text}; }

    .wa-pill { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 20px; }
    .wa-p-recebida  { background: rgba(37,211,102,.1);  color: ${AURA.wa}; }
    .wa-p-sent      { background: rgba(0,61,165,.08);   color: ${AURA.blue}; }
    .wa-p-delivered { background: rgba(5,150,105,.08);  color: ${AURA.green}; }
    .wa-p-read      { background: rgba(201,169,110,.1); color: ${AURA.goldDim}; }
    .wa-p-failed    { background: rgba(200,16,46,.08);  color: ${AURA.red}; }
    .wa-p-status    { background: rgba(196,140,0,.08);  color: ${AURA.yellowDark}; }
    .wa-tipo-badge  { display:inline-flex; align-items:center; gap:4px; font-size:11px; padding:2px 8px; border-radius:20px; border: 0.5px solid ${t.border}; color: ${t.textMuted}; }
    .wa-mono { font-family: monospace; font-size: 11px; color: ${t.textSec}; }
    .wa-row { display: flex; align-items: center; padding: 11px 20px; gap: 12px; border-bottom: 1px solid ${t.border}; cursor: pointer; transition: background .18s ease; }
    .wa-row:last-child { border-bottom: none; }
    .wa-row:hover { background: ${isDark ? "rgba(37,211,102,.12)" : "rgba(37,211,102,.13)"}; }
    .wa-col-num  { width: 32px; flex-shrink: 0; font-size: 11px; color: ${t.textMuted}; text-align: right; }
    .wa-col-tipo { width: 90px; flex-shrink: 0; }
    .wa-col-fone { width: 140px; flex-shrink: 0; }
    .wa-col-id   { flex: 1; min-width: 0; overflow: hidden; }
    .wa-col-st   { width: 120px; flex-shrink: 0; }
    .wa-col-dt   { width: 80px; flex-shrink: 0; font-size: 11px; color: ${t.textSec}; text-align: right; }
    .wa-col-arr  { width: 22px; flex-shrink: 0; color: ${t.textMuted}; }
    .wa-th { font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${t.textMuted}; overflow: hidden; }
    .wa-thead { display: flex; align-items: center; padding: 8px 20px; border-bottom: 1px solid ${t.border}; background: ${isDark ? "rgba(255,255,255,.018)" : "rgba(0,0,0,.018)"}; }
    .wa-filtros-row { padding: 12px 20px; border-bottom: 1px solid ${t.border}; display: flex; gap: 8px; flex-wrap: wrap; }
    .wa-filtro-busca { position: relative; flex: 1 1 180px; min-width: 160px; }
    .wa-filtro-select { position: relative; flex: 0 1 130px; min-width: 110px; }
    .wa-filtro-select .adm-select { width: 100%; }
    @media (max-width: 480px) {
      .wa-filtros-row { padding: 10px 14px; gap: 6px; }
      .wa-filtro-busca { flex: 1 1 100%; min-width: 100%; }
      .wa-filtro-select { flex: 1 1 calc(50% - 3px); min-width: 0; }
    }
    @media (max-width: 380px) {
      .wa-row { padding: 10px 12px; gap: 8px; }
      .wa-col-num  { width: 18px; font-size: 10px; }
      .wa-col-tipo { width: 58px; }
      .wa-col-fone { width: 76px; font-size: 10px; }
      .wa-tipo-badge { padding: 2px 6px; font-size: 10px; }
      .wa-tipo-badge span { display: none; }
    }
    @media (max-width: 700px) { .wa-col-id  { display: none; } .wa-col-fone{ width: 110px; } }
    @media (max-width: 500px) { .wa-col-dt  { display: none; } .wa-col-fone{ width: 90px; } }

    .wa-drawer { position: fixed; right: -440px; top: 0; width: 420px; height: 100vh; height: 100dvh; background: ${t.drawerBg}; border-left: 1px solid ${t.border}; z-index: 201; transition: right .25s ease; overflow-y: auto; padding: 0; box-sizing: border-box; }
    .wa-drawer.open { right: 0; }
    .wa-drawer-head { display: flex; justify-content: space-between; align-items: center; padding: 20px 22px 18px; border-bottom: 1px solid ${t.border}; position: sticky; top: 0; background: ${t.drawerBg}; z-index: 5; }
    .wa-drawer-body { padding: 20px 22px 32px; }
    .wa-ds { margin-bottom: 20px; }
    .wa-ds-title { font-size: 10px; font-weight: 700; color: ${t.textMuted}; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 10px; }
    .wa-dr { display: flex; gap: 8px; margin-bottom: 9px; align-items: flex-start; }
    .wa-dl { font-size: 11px; color: ${t.textSec}; min-width: 110px; padding-top: 1px; }
    .wa-dv { font-size: 12px; color: ${t.text}; word-break: break-word; flex: 1; }
    .wa-json { background: ${t.bgInput}; border: 1px solid ${t.borderIn}; border-radius: 10px; padding: 12px; font-size: 10.5px; font-family: monospace; color: ${t.textSec}; line-height: 1.65; white-space: pre-wrap; word-break: break-word; max-height: 200px; overflow-y: auto; }

    @media (max-width: 899px) { .adm-topbar { padding: 0 10px; height: 54px; gap: 8px; } .adm-topbar-l { gap: 8px; } .adm-topbar-r { gap: 5px; } .adm-cta-btn { padding: 9px 12px; } .adm-ico-btn { width: 38px; height: 38px; } }
    @media (max-width: 639px) { .adm-live-pill { display: none !important; } .adm-topbar-sep { display: none !important; } .adm-content { padding: 12px 12px 20px; } .adm-page-head { padding: 14px 12px 0; } .adm-kpi-grid { gap: 9px; } .adm-kpi { padding: 13px 12px; border-radius: 15px; } .adm-kpi-num { font-size: 21px; } .adm-kpi-icon { width: 32px; height: 32px; } .adm-kpi-trend { font-size: 7.5px; } .adm-row { flex-direction: column; align-items: stretch; gap: 10px; padding: 13px 14px; } .adm-row-r { justify-content: flex-stretch; } .adm-row-name { white-space: normal; } .adm-row-email { white-space: normal; word-break: break-all; } .adm-action-btn { width: 36px; height: 36px; } .adm-celula-bar { padding: 11px 14px; } .adm-card-header { padding: 15px 14px !important; } }
    @media (max-width: 380px) { .adm-brand-sub { display: none; } .adm-cta-btn-label { display: none !important; } .adm-cta-btn { padding: 9px 10px; } .adm-exit-modal { padding: 28px 18px 20px !important; } }
    @media (max-width: 420px) { .wa-drawer { width: 100vw; right: -100vw; } .wa-drawer.open { right: 0; } }
    @media (max-width: 639px) { .adm-input, .adm-select { font-size: 16px !important; } }
    .adm-footer-txt { text-align: center; font-size: 7.5px; font-weight: 500; letter-spacing: .2em; text-transform: uppercase; padding: 16px 0 0; color: ${isDark ? "rgba(245,240,232,.07)" : "rgba(26,16,8,.1)"}; }
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
/* ─── Wrapper: Acompanhamento (modal) dentro do painel Admin ─────────────── */
function AdminAcompanhamentoDiscipulado({ isDark }) {
  const [open, setOpen] = useState(true);
  return (
      <>
        <AcompanhamentoDiscipulado isDark={isDark} open={open} onClose={() => setOpen(false)} />
        {!open && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <button className="adm-btn-primary blue" style={{ display: "inline-flex", width: "auto" }} onClick={() => setOpen(true)}>
                <UserCheck size={14} /> Abrir Acompanhamento
              </button>
            </div>
        )}
      </>
  );
}

function ModuloRenderer({ moduloKey, isDark, celulaAdmin }) {
  const p = { isDark };
  switch (moduloKey) {
    case "membros":           return <Membros {...p}/>;
    case "visitantes":        return <Visitantes {...p}/>;
    case "celulas":           return <Celulas {...p}/>;
    case "fichas":            return <FichasEncontro {...p}/>;
    case "secretariacelulas": return <SecretariaCelulas {...p}/>;
    case "fichas-convertido": return <FichasConvertido {...p}/>;
    case "painel-pastor":     return <PainelPastor {...p}/>;
    case "relatorios":        return <RelatorioCelula {...p}/>;
    case "discipulado":       return <Discipulado {...p}/>;
    case "acompanhamento":    return <RelatoriosDiscipuladoCelulas {...p}/>;
    case "multiplicacoes":    return <SolicitacoesMultiplicacao {...p}/>;
    case "ranking":           return <RankingCelulas {...p}/>;
    case "missao70":          return <RelatorioMissao70Pastor {...p}/>;
    case "pendencias":        return <TelaPendencias {...p}/>;
    case "alertas":           return <PainelAlertas {...p}/>;
    case "lider-relatorio":   return <TelaRelatorio celula={celulaAdmin} {...p}/>;
    case "lider-discipulado": return <RelatorioDiscipulado membros={[]} {...p}/>;
    case "lider-acompanhamento": return <AdminAcompanhamentoDiscipulado {...p}/>;
    case "lider-visitantes":  return <TelaVisitantes celulaId={celulaAdmin?.id} {...p}/>;
    case "lider-fichas":      return <TelaFichas celula={celulaAdmin} {...p}/>;
    case "lider-missao70":    return <Missao70Lider celulaId={celulaAdmin?.id} {...p}/>;
    case "teso-dashboard":    return <TesourariaDashboard {...p}/>;
    case "teso-lancamento":   return <TesourariaLancamento {...p}/>;
    case "teso-relatorio":    return <TesourariaRelatorio {...p}/>;
    case "teso-dizimistas":   return <TesourariaDizimistas {...p}/>;
    case "teso-comparativo":  return <TesourariaComparativo {...p}/>;
    default: return null;
  }
}

/* ─── WA helpers ─────────────────────────────────────────────────────────── */
function statusPill(s) {
  const m = {
    recebida:  ["wa-p-recebida",  "Recebida" ],
    sent:      ["wa-p-sent",      "Sent"     ],
    delivered: ["wa-p-delivered", "Delivered"],
    read:      ["wa-p-read",      "Read"     ],
    failed:    ["wa-p-failed",    "Failed"   ],
  };
  const v = (s || "").toLowerCase();
  const [cls, label] = m[v] || ["wa-p-status", s || "—"];
  return <span className={`wa-pill ${cls}`}>{label}</span>;
}

function tipoBadge(tipo) {
  const icon = tipo === "mensagem"
      ? <MessageCircle size={11} style={{ color: AURA.wa }}/>
      : <RefreshCw size={11} style={{ color: AURA.yellowDark }}/>;
  return (
      <span className="wa-tipo-badge">
        {icon}
        <span style={{ fontSize: 10 }}>{tipo || "—"}</span>
      </span>
  );
}

/* ─── BotaoBloqueioInline ────────────────────────────────────────────────── */
function BotaoBloqueioInline({ numero, bloqueados, onBloquear, onDesbloquear }) {
  const numLimpo = normalizarTelBR(numero);
  const estaBloq = bloqueados.some(b => normalizarTelBR(b.numero) === numLimpo);
  return estaBloq ? (
      <button
          title="Clique para desbloquear este número"
          onClick={e => { e.stopPropagation(); onDesbloquear({ numero: numLimpo }); }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 9px", borderRadius: 20,
            border: "1px solid rgba(5,150,105,.25)", background: "rgba(5,150,105,.08)",
            cursor: "pointer", color: AURA.green,
            fontSize: 10, fontWeight: 600, letterSpacing: ".05em",
            transition: "all .18s", whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(5,150,105,.16)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(5,150,105,.08)"; }}
      >
        <Unlock size={10}/> Desbloquear
      </button>
  ) : (
      <button
          title="Bloquear este número"
          onClick={e => { e.stopPropagation(); onBloquear(numero); }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 9px", borderRadius: 20,
            border: "1px solid rgba(200,16,46,.2)", background: "rgba(200,16,46,.06)",
            cursor: "pointer", color: AURA.red,
            fontSize: 10, fontWeight: 600, letterSpacing: ".05em",
            transition: "all .18s", whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,16,46,.14)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(200,16,46,.06)"; }}
      >
        <Ban size={10}/> Bloquear
      </button>
  );
}

/* ─── ModalBloquear ──────────────────────────────────────────────────────── */
function ModalBloquear({ aberto, numeroInicial, onFechar, onConfirmar, salvando, t, isDark }) {
  const [numero, setNumero] = useState(numeroInicial || "");
  const [motivo, setMotivo] = useState("");
  const [errLocal, setErrLocal] = useState("");

  useEffect(() => {
    if (aberto) { setNumero(numeroInicial || ""); setMotivo(""); setErrLocal(""); }
  }, [aberto, numeroInicial]);

  const submeter = e => {
    e.preventDefault();
    const n = normalizarNumero(numero);
    if (n.length < 10) { setErrLocal("Informe um número válido com DDD (ex: 5571999990000)."); return; }
    setErrLocal("");
    onConfirmar(n, motivo.trim());
  };

  if (!aberto) return null;

  const inputStyle = {
    width: "100%", background: t.bgInput, border: `1px solid ${t.borderIn}`,
    color: t.text, borderRadius: 12, outline: "none",
    fontFamily: "'Inter',sans-serif", fontWeight: 300, transition: "all .22s",
    boxSizing: "border-box",
  };

  return createPortal(
      <AnimatePresence>
        <motion.div key="mb-backdrop"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: "fixed", inset: 0, zIndex: 310, background: "rgba(0,0,0,.82)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}
                    onClick={e => { if (e.target === e.currentTarget) onFechar(); }}>
          <motion.div key="mb-box"
                      initial={{ opacity: 0, y: -28, scale: .95 }}
                      animate={{ opacity: 1, y: 0,   scale: 1   }}
                      exit={{    opacity: 0, y: -16,  scale: .97 }}
                      transition={{ type: "spring", damping: 28, stiffness: 300 }}
                      style={{ width: "100%", maxWidth: 440, background: t.drawerBg, border: `1px solid ${t.border}`, borderRadius: 22, overflow: "hidden", boxShadow: "0 36px 80px rgba(0,0,0,.6)" }}>
            <div style={{ height: 2, background: `linear-gradient(90deg,${AURA.redDark},${AURA.red} 50%,${AURA.gold})` }}/>
            <div style={{ padding: "24px 26px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "flex-start", gap: 16, position: "relative" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: "rgba(200,16,46,.08)", border: "1px solid rgba(200,16,46,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ban size={22} style={{ color: AURA.red }}/>
              </div>
              <div>
                <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 3px" }}>Controle de acesso</p>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 500, color: t.text, margin: "0 0 2px", lineHeight: 1.1 }}>Bloquear número</h2>
                <p style={{ fontSize: 11.5, fontWeight: 300, color: t.textMuted, margin: 0 }}>Mensagens deste número serão ignoradas</p>
              </div>
              <button onClick={onFechar} style={{ position: "absolute", right: 18, top: 18, width: 32, height: 32, borderRadius: 9, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: t.textMuted, transition: "all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.color = AURA.red; e.currentTarget.style.borderColor = "rgba(200,16,46,.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.borderColor = t.border; }}>
                <X size={14}/>
              </button>
            </div>
            <form id="form-bloqueio" onSubmit={submeter} style={{ padding: "22px 26px" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 8.5, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(201,169,110,.65)", marginBottom: 7 }}>Número WhatsApp *</label>
                <div style={{ position: "relative" }}>
                  <Phone size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: AURA.gold, opacity: .5, pointerEvents: "none" }}/>
                  <input type="tel" placeholder="5571999990000 (com código do país)" value={numero} onChange={e => setNumero(e.target.value)} required
                         style={{ ...inputStyle, padding: "12px 16px 12px 44px", fontSize: 14, borderColor: errLocal ? "rgba(200,16,46,.45)" : t.borderIn }}
                         onFocus={e => { e.target.style.borderColor = "rgba(200,16,46,.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(200,16,46,.07)"; }}
                         onBlur={e  => { e.target.style.borderColor = errLocal ? "rgba(200,16,46,.45)" : t.borderIn; e.target.style.boxShadow = ""; }}/>
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 8.5, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(201,169,110,.65)", marginBottom: 7 }}>
                  Motivo <span style={{ fontWeight: 400, opacity: .5 }}>(opcional)</span>
                </label>
                <div style={{ position: "relative" }}>
                  <AlertTriangle size={14} style={{ position: "absolute", left: 14, top: 14, color: AURA.gold, opacity: .5, pointerEvents: "none" }}/>
                  <textarea placeholder="Ex: Spam, número desconhecido, abuso..." value={motivo} onChange={e => setMotivo(e.target.value)} rows={3}
                            style={{ ...inputStyle, padding: "12px 16px 12px 44px", fontSize: 13, lineHeight: 1.6, resize: "vertical" }}
                            onFocus={e => { e.target.style.borderColor = "rgba(201,169,110,.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(201,169,110,.07)"; }}
                            onBlur={e  => { e.target.style.borderColor = t.borderIn; e.target.style.boxShadow = ""; }}/>
                </div>
              </div>
              <AnimatePresence>
                {errLocal && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", background: "rgba(200,16,46,.06)", border: "1px solid rgba(200,16,46,.18)", borderRadius: 10, marginBottom: 14 }}>
                      <XCircle size={13} style={{ color: AURA.red, flexShrink: 0 }}/> <span style={{ fontSize: 11.5, color: AURA.red }}>{errLocal}</span>
                    </motion.div>
                )}
              </AnimatePresence>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "10px 14px", background: isDark ? "rgba(201,169,110,.04)" : "rgba(201,169,110,.06)", border: `1px solid ${t.border}`, borderRadius: 10 }}>
                <Info size={13} style={{ color: AURA.gold, flexShrink: 0, marginTop: 1 }}/>
                <p style={{ fontSize: 10.5, color: t.textSec, margin: 0, lineHeight: 1.6 }}>O bloqueio pode ser desfeito a qualquer momento na aba Bloqueios.</p>
              </div>
            </form>
            <div style={{ padding: "16px 26px 24px", borderTop: `1px solid ${t.border}`, display: "flex", gap: 10 }}>
              <button type="button" onClick={onFechar} className="adm-btn-ghost" style={{ flex: 1, padding: "13px" }}>Cancelar</button>
              <button type="submit" form="form-bloqueio" disabled={salvando}
                      className="adm-btn-primary red" style={{ flex: 1.5, opacity: salvando ? .65 : 1, cursor: salvando ? "not-allowed" : "pointer" }}>
                {salvando ? <><Loader2 size={14} style={{ animation: "adm-spin 1s linear infinite" }}/> Bloqueando…</> : <><Ban size={14}/> Bloquear número</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
  );
}

/* ─── ModalDesbloquear ───────────────────────────────────────────────────── */
function ModalDesbloquear({ item, onFechar, onConfirmar, salvando, isDark, t }) {
  if (!item) return null;
  return createPortal(
      <AnimatePresence>
        <motion.div key="md-backdrop"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: "fixed", inset: 0, zIndex: 310, background: "rgba(0,0,0,.82)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}
                    onClick={e => { if (e.target === e.currentTarget) onFechar(); }}>
          <motion.div key="md-box"
                      initial={{ scale: .88, opacity: 0, y: 20 }}
                      animate={{ scale: 1,   opacity: 1, y: 0  }}
                      exit={{    scale: .92,  opacity: 0        }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      style={{ width: "100%", maxWidth: 360, background: t.drawerBg, border: `1px solid ${t.border}`, borderRadius: 22, padding: "36px 28px 28px", textAlign: "center", boxShadow: "0 40px 80px rgba(0,0,0,.7)" }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, margin: "0 auto 18px", background: "rgba(5,150,105,.08)", border: "1px solid rgba(5,150,105,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Unlock size={26} style={{ color: AURA.green }}/>
            </div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 500, color: t.text, margin: "0 0 8px" }}>Desbloquear número</h3>
            <p style={{ fontSize: 13, fontWeight: 300, color: t.textSec, margin: "0 0 6px", lineHeight: 1.65 }}>
              O número <strong style={{ fontFamily: "monospace", fontSize: 12, color: t.text }}>{item.numero}</strong> voltará a receber mensagens.
            </p>
            {item.motivo && <p style={{ fontSize: 11, color: t.textMuted, margin: "0 0 20px", fontStyle: "italic" }}>Bloqueado por: "{item.motivo}"</p>}
            {!item.motivo && <div style={{ marginBottom: 20 }}/>}
            <div className="adm-divider" style={{ margin: "0 0 20px" }}/>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onFechar} className="adm-btn-ghost" style={{ flex: 1, padding: "13px" }}>Cancelar</button>
              <button onClick={() => onConfirmar(item.numero)} disabled={salvando}
                      style={{ flex: 1.5, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 12, border: "none", cursor: salvando ? "not-allowed" : "pointer", background: `linear-gradient(135deg,${AURA.greenDark},${AURA.green})`, color: "#fff", boxShadow: "0 6px 20px rgba(5,150,105,.22)", fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", opacity: salvando ? .65 : 1, transition: "all .25s" }}>
                {salvando ? <><Loader2 size={14} style={{ animation: "adm-spin 1s linear infinite" }}/> Liberando…</> : <><ShieldCheck size={14}/> Desbloquear</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
  );
}

/* ─── PainelWhatsApp ─────────────────────────────────────────────────────── */
function PainelWhatsApp({ isDark, t, usuarios = [], bloqueados = [], onBloquear, onDesbloquear }) {
  const [registros,  setRegistros]  = useState([]);
  const [filtrados,  setFiltrados]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [offline,    setOffline]    = useState(false);
  const [metricas,   setMetricas]   = useState({ total: 0, mensagens: 0, statusEvt: 0, failed: 0, ultimas24h: 0 });
  const [busca,      setBusca]      = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroSt,   setFiltroSt]   = useState("");
  const [pag,        setPag]        = useState(1);
  const [detalhes,   setDetalhes]   = useState(null);
  const POR_PAG = 15;

  const buscarUsuarioPorTelefone = numero => {
    if (!numero || !usuarios.length) return null;
    const numLimpo = normalizarTelBR(numero);
    return usuarios.find(u => {
      const telLimpo = normalizarTelBR(u.telefoneWhatsapp || "");
      return telLimpo === numLimpo;
    });
  };

  const carregar = useCallback(async () => {
    setLoading(true); setOffline(false);
    try {
      const [resReg, resMet] = await Promise.allSettled([
        api.get(`webhook/whatsapp/registros/filtrar`, { params: { tipoEvento: filtroTipo, status: filtroSt, busca, size: 200, page: 0 } }),
        api.get(`webhook/whatsapp/registros/metricas`),
      ]);
      if (resReg.status === "fulfilled") {
        const data = resReg.value.data;
        const arr = Array.isArray(data) ? data : data?.content ?? data?.registros ?? [];
        setRegistros(arr); setFiltrados(arr);
      } else { throw new Error("offline"); }
      if (resMet.status === "fulfilled") setMetricas(resMet.value.data);
    } catch {
      setOffline(true);
      const fake = Array.from({ length: 18 }, (_, i) => ({
        id: i + 1, tipoEvento: i % 3 === 0 ? "status" : "mensagem",
        status: ["recebida","sent","delivered","read","failed"][i % 5],
        idMensagem: `wamid.${Math.random().toString(36).slice(2,18)}`,
        numeroDestino: `5571 9${String(90000000 + i * 1234567).slice(0, 8)}`,
        tipoMensagem: "text",
        textoMensagem: i % 3 !== 0 ? `Olá! Mensagem de exemplo número ${i + 1}` : null,
        payload: JSON.stringify({ from: "557191234567", type: "text", text: { body: `Olá! Mensagem de exemplo número ${i + 1}` } }, null, 2),
        recebidoEm: new Date(Date.now() - i * 3600000).toISOString(),
      }));
      setRegistros(fake); setFiltrados(fake);
      setMetricas({ total: 18, mensagens: 12, statusEvt: 6, failed: 2, ultimas24h: 8 });
    } finally { setLoading(false); }
  }, [filtroTipo, filtroSt, busca]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    const q = busca.toLowerCase();
    setFiltrados(registros.filter(r =>
        (!q || (r.numeroDestino||"").toLowerCase().includes(q) || (r.idMensagem||"").toLowerCase().includes(q) || (extrairTexto(r)||"").toLowerCase().includes(q)) &&
        (!filtroTipo || (r.tipoEvento||"").toLowerCase() === filtroTipo) &&
        (!filtroSt   || (r.status||"").toLowerCase() === filtroSt)
    ));
    setPag(1);
  }, [busca, filtroTipo, filtroSt, registros]);

  const totalPags = Math.ceil(filtrados.length / POR_PAG);
  const slice     = filtrados.slice((pag - 1) * POR_PAG, pag * POR_PAG);

  const kpis = [
    { label: "Total",     value: metricas.total,      color: AURA.wa,        bg: "rgba(37,211,102,.08)",  icon: <MessageCircle size={16}/> },
    { label: "Mensagens", value: metricas.mensagens,  color: AURA.blue,      bg: "rgba(0,61,165,.08)",    icon: <Users size={16}/> },
    { label: "Últ. 24h",  value: metricas.ultimas24h, color: AURA.gold,      bg: "rgba(201,169,110,.08)", icon: <Clock size={16}/> },
    { label: "Falhas",    value: metricas.failed,     color: AURA.red,       bg: "rgba(200,16,46,.08)",   icon: <AlertCircle size={16}/> },
  ];

  return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {offline && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: "rgba(200,16,46,.06)", border: "1px solid rgba(200,16,46,.18)", borderRadius: 12 }}>
              <WifiOff size={13} style={{ color: AURA.red, flexShrink: 0 }}/>
              <span style={{ fontSize: 11, color: AURA.red, fontWeight: 500 }}>Servidor offline ou sem dados ainda. Verifique o backend no Render.</span>
            </div>
        )}
        <div className="adm-kpi-grid">
          {kpis.map(k => (
              <div key={k.label} className="adm-kpi">
                <div className="adm-kpi-top">
                  <div>
                    <p className="adm-kpi-num" style={{ color: t.text }}>{loading ? "…" : k.value}</p>
                    <p className="adm-kpi-lbl">{k.label}</p>
                  </div>
                  <div className="adm-kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
                </div>
              </div>
          ))}
        </div>

        <div className="adm-card">
          <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(37,211,102,.1)", border: "1px solid rgba(37,211,102,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={16} style={{ color: AURA.wa }}/>
              </div>
              <div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 500, color: t.text, margin: 0, lineHeight: 1.1 }}>Mensagens recebidas</p>
                <p style={{ fontSize: 11, fontWeight: 300, color: t.textMuted, margin: "1px 0 0" }}>{filtrados.length} registro{filtrados.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: offline ? AURA.red : AURA.wa, animation: "adm-blink 2.5s ease-in-out infinite" }}/>
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".12em", color: offline ? AURA.red : AURA.wa, textTransform: "uppercase" }}>{offline ? "Offline" : "Online"}</span>
              </div>
              <button className="adm-btn-ghost" style={{ padding: "7px 13px", fontSize: 8, letterSpacing: ".12em", height: 32 }} onClick={carregar}>
                <RefreshCcw size={12} style={{ animation: loading ? "adm-spin 1s linear infinite" : "none" }}/> Atualizar
              </button>
            </div>
          </div>

          <div className="wa-filtros-row">
            <div className="wa-filtro-busca">
              <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: AURA.gold, opacity: .5, pointerEvents: "none" }}/>
              <input className="adm-input" style={{ padding: "8px 12px 8px 34px", fontSize: 13, borderRadius: 9 }} placeholder="Número, ID ou texto da mensagem..." value={busca} onChange={e => setBusca(e.target.value)}/>
            </div>
            <div className="wa-filtro-select">
              <Filter size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: AURA.gold, opacity: .5, pointerEvents: "none", zIndex: 1 }}/>
              <select className="adm-select" style={{ padding: "8px 12px 8px 28px", fontSize: 12, borderRadius: 9 }} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                <option value="">Todos tipos</option>
                <option value="mensagem">Mensagem</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div className="wa-filtro-select">
              <Filter size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: AURA.gold, opacity: .5, pointerEvents: "none", zIndex: 1 }}/>
              <select className="adm-select" style={{ padding: "8px 12px 8px 28px", fontSize: 12, borderRadius: 9 }} value={filtroSt} onChange={e => setFiltroSt(e.target.value)}>
                <option value="">Todos status</option>
                <option value="recebida">Recebida</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="read">Read</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="wa-thead">
            <span className="wa-col-num wa-th" style={{ textAlign: "right" }}>#</span>
            <span className="wa-col-tipo wa-th">Tipo</span>
            <span className="wa-col-fone wa-th">Número</span>
            <span className="wa-col-id wa-th">Mensagem</span>
            <span className="wa-col-st wa-th">Status / Acesso</span>
            <span className="wa-col-dt wa-th" style={{ textAlign: "right" }}>Recebido</span>
            <span className="wa-col-arr wa-th"></span>
          </div>

          {loading ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: t.textMuted }}>
                <Loader2 size={22} style={{ animation: "adm-spin 1s linear infinite", marginBottom: 8 }}/>
                <p style={{ fontSize: 11, margin: 0 }}>Carregando registros…</p>
              </div>
          ) : filtrados.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center", color: t.textMuted }}>
                <Inbox size={28} style={{ marginBottom: 10, opacity: .4 }}/>
                <p style={{ fontSize: 12, margin: 0 }}>Nenhum registro encontrado</p>
              </div>
          ) : (
              <AnimatePresence>
                {slice.map((r, i) => {
                  const textoPreview = extrairTexto(r);
                  const usuario      = buscarUsuarioPorTelefone(r.numeroDestino);
                  const estaBloqueado = bloqueados.some(b => normalizarTelBR(b.numero) === normalizarTelBR(r.numeroDestino));
                  return (
                      <motion.div key={r.id} className="wa-row"
                                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * .025 }}
                                  style={{ borderLeft: estaBloqueado ? `3px solid ${AURA.red}44` : "3px solid transparent" }}
                                  onClick={() => setDetalhes(r)}>
                        <span className="wa-col-num">{(pag - 1) * POR_PAG + i + 1}</span>
                        <span className="wa-col-tipo">{tipoBadge(r.tipoEvento)}</span>
                        <span className="wa-col-fone" style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          {usuario && <span style={{ fontWeight: 600, color: AURA.blue, fontSize: 11 }}>👤 {usuario.nome}</span>}
                          <span className="wa-mono">{r.numeroDestino || "—"}</span>
                        </span>
                        <span className="wa-col-id" style={{ display: "flex", flexDirection: "column", gap: 2, overflow: "hidden" }}>
                          <span style={{ fontSize: 10, fontFamily: "monospace", color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.idMensagem || "—"}</span>
                          {textoPreview && <span style={{ fontSize: 11.5, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 400 }}>{textoPreview}</span>}
                        </span>
                        <span className="wa-col-st" style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
                          {statusPill(r.status)}
                          {r.numeroDestino && (
                              <BotaoBloqueioInline
                                  numero={r.numeroDestino}
                                  bloqueados={bloqueados}
                                  onBloquear={onBloquear}
                                  onDesbloquear={onDesbloquear}
                              />
                          )}
                        </span>
                        <span className="wa-col-dt">{fmtData(r.recebidoEm)}</span>
                        <span className="wa-col-arr"><ChevronRight size={13}/></span>
                      </motion.div>
                  );
                })}
              </AnimatePresence>
          )}

          {totalPags > 1 && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderTop:`1px solid ${t.border}`, flexWrap:"wrap", gap:8 }}>
                <span style={{ fontSize:11, color:t.textMuted, whiteSpace:"nowrap" }}>
                  {(pag-1)*POR_PAG+1}–{Math.min(pag*POR_PAG, filtrados.length)} de {filtrados.length} registros
                </span>

                <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                  <button className="adm-ico-btn" style={{ width:30, height:30 }}
                          disabled={pag===1} onClick={() => setPag(p => p-1)}>
                    <ChevronLeft size={13}/>
                  </button>

                  {(() => {
                    const range = [];
                    for (let i = 1; i <= totalPags; i++) {
                      if (i===1 || i===totalPags || (i>=pag-1 && i<=pag+1)) range.push(i);
                    }
                    const pages = [];
                    let prev = null;
                    for (const p of range) {
                      if (prev !== null && p - prev > 1) {
                        pages.push(
                            <span key={`e${p}`} style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:t.textMuted }}>…</span>
                        );
                      }
                      pages.push(
                          <button key={p} onClick={() => setPag(p)} style={{
                            width:30, height:30, borderRadius:8,
                            border:`1px solid ${pag===p ? AURA.wa : t.border}`,
                            background: pag===p ? AURA.wa : "transparent",
                            color: pag===p ? "#fff" : t.textSec,
                            fontSize:11, cursor:"pointer",
                            fontFamily:"'Inter',sans-serif",
                            fontWeight: pag===p ? 600 : 400,
                            transition:"all .18s",
                          }}>{p}</button>
                      );
                      prev = p;
                    }
                    return pages;
                  })()}

                  <button className="adm-ico-btn" style={{ width:30, height:30 }}
                          disabled={pag===totalPags} onClick={() => setPag(p => p+1)}>
                    <ChevronRight size={13}/>
                  </button>
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:11, color:t.textMuted, whiteSpace:"nowrap" }}>Ir para</span>
                  <input
                      type="number" min={1} max={totalPags}
                      placeholder={String(pag)}
                      onKeyDown={e => {
                        if (e.key==="Enter") {
                          const v = Number(e.target.value);
                          if (v>=1 && v<=totalPags) setPag(v);
                          e.target.value = "";
                        }
                      }}
                      style={{
                        width:48, height:28, borderRadius:7,
                        border:`1px solid ${t.borderIn}`,
                        background:t.bgInput, color:t.text,
                        fontSize:12, textAlign:"center",
                        outline:"none", fontFamily:"'Inter',sans-serif",
                      }}
                  />
                </div>
              </div>
          )}
        </div>

        {createPortal(
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 200, display: detalhes ? "block" : "none", background: "rgba(0,0,0,.5)", backdropFilter: "blur(6px)" }} onClick={() => setDetalhes(null)}/>
              <div className={`wa-drawer${detalhes ? " open" : ""}`}>
                {detalhes && (() => {
                  const texto   = extrairTexto(detalhes);
                  const tipoMsg = extrairTipoMsg(detalhes);
                  const usuDet  = buscarUsuarioPorTelefone(detalhes.numeroDestino);
                  return (
                      <>
                        <div style={{ height: 2, background: `linear-gradient(90deg,${AURA.wa},${AURA.blue})` }}/>
                        <div className="wa-drawer-head">
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(37,211,102,.1)", border: "1px solid rgba(37,211,102,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <MessageCircle size={14} style={{ color: AURA.wa }}/>
                            </div>
                            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 500, color: t.text, margin: 0 }}>Detalhe do registro</p>
                          </div>
                          <button className="adm-ico-btn" onClick={() => setDetalhes(null)} aria-label="Fechar"><X size={15}/></button>
                        </div>
                        <div className="wa-drawer-body">
                          <div className="wa-ds">
                            <p className="wa-ds-title">Identificação</p>
                            <div className="wa-dr"><span className="wa-dl">ID interno</span><span className="wa-dv" style={{ fontFamily: "monospace", fontSize: 11 }}>{detalhes.id}</span></div>
                            <div className="wa-dr"><span className="wa-dl">Tipo evento</span><span className="wa-dv">{tipoBadge(detalhes.tipoEvento)}</span></div>
                            <div className="wa-dr"><span className="wa-dl">Recebido em</span><span className="wa-dv">{fmtData(detalhes.recebidoEm)}</span></div>
                          </div>
                          <div className="wa-ds">
                            <p className="wa-ds-title">Dados da mensagem</p>
                            <div className="wa-dr"><span className="wa-dl">ID mensagem</span><span className="wa-dv" style={{ fontFamily: "monospace", fontSize: 10, wordBreak: "break-all" }}>{detalhes.idMensagem || "—"}</span></div>
                            <div className="wa-dr">
                              <span className="wa-dl">Número</span>
                              <span className="wa-dv">
                                {usuDet
                                    ? <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={{ fontWeight: 600, color: AURA.blue, fontSize: 12 }}>👤 {usuDet.nome}</span><span style={{ fontFamily: "monospace" }}>{detalhes.numeroDestino || "—"}</span></div>
                                    : <span style={{ fontFamily: "monospace" }}>{detalhes.numeroDestino || "—"}</span>
                                }
                              </span>
                            </div>
                            <div className="wa-dr"><span className="wa-dl">Status</span><span className="wa-dv">{statusPill(detalhes.status)}</span></div>
                            {detalhes.numeroDestino && (
                                <div className="wa-dr">
                                  <span className="wa-dl">Acesso</span>
                                  <span className="wa-dv">
                                    <BotaoBloqueioInline
                                        numero={detalhes.numeroDestino}
                                        bloqueados={bloqueados}
                                        onBloquear={num => { setDetalhes(null); onBloquear(num); }}
                                        onDesbloquear={item => { setDetalhes(null); onDesbloquear(item); }}
                                    />
                                  </span>
                                </div>
                            )}
                          </div>
                          {detalhes.tipoEvento === "mensagem" && (
                              <div className="wa-ds">
                                <p className="wa-ds-title">Conteúdo da mensagem</p>
                                {tipoMsg && <div className="wa-dr"><span className="wa-dl">Tipo</span><span className="wa-dv"><span className="wa-tipo-badge" style={{ textTransform: "capitalize" }}>{tipoMsg}</span></span></div>}
                                <div className="wa-dr" style={{ alignItems: "flex-start" }}>
                                  <span className="wa-dl" style={{ paddingTop: 10 }}>Texto</span>
                                  <div style={{ flex: 1, background: texto ? "rgba(37,211,102,.06)" : "transparent", border: `1px solid ${texto ? "rgba(37,211,102,.18)" : t.borderIn}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: texto ? t.text : t.textMuted, lineHeight: 1.65, wordBreak: "break-word", fontStyle: texto ? "normal" : "italic", minHeight: 42 }}>
                                    {texto || "Sem texto (áudio, imagem ou tipo sem corpo)"}
                                  </div>
                                </div>
                              </div>
                          )}
                          <div className="wa-ds">
                            <p className="wa-ds-title">Payload original</p>
                            <div className="wa-json">{(() => { try { return JSON.stringify(JSON.parse(detalhes.payload), null, 2); } catch { return detalhes.payload || "—"; } })()}</div>
                          </div>
                        </div>
                      </>
                  );
                })()}
              </div>
            </>,
            document.body
        )}
      </div>
  );
}

/* ─── PainelBloqueios ────────────────────────────────────────────────────── */
function PainelBloqueios({ isDark, t, bloqueados, carregandoBloq, onRecarregar, onBloquear, onDesbloquear }) {
  const [busca,     setBusca]     = useState("");
  const [filtrados, setFiltrados] = useState(bloqueados);

  useEffect(() => {
    const q = busca.toLowerCase();
    setFiltrados(bloqueados.filter(b =>
        !q || (b.numero||"").includes(q) || (b.motivo||"").toLowerCase().includes(q)
    ));
  }, [busca, bloqueados]);

  return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="adm-kpi-grid" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
          {[
            { label: "Total bloqueados", value: bloqueados.length,                        color: AURA.red,        bg: "rgba(200,16,46,.08)",  icon: <Ban size={16}/> },
            { label: "Com motivo",       value: bloqueados.filter(b => b.motivo).length,  color: AURA.yellowDark, bg: "rgba(196,140,0,.08)",  icon: <AlertTriangle size={16}/> },
          ].map(k => (
              <div key={k.label} className="adm-kpi">
                <div className="adm-kpi-top">
                  <div>
                    <p className="adm-kpi-num" style={{ color: t.text }}>{carregandoBloq ? "…" : k.value}</p>
                    <p className="adm-kpi-lbl">{k.label}</p>
                  </div>
                  <div className="adm-kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
                </div>
              </div>
          ))}
        </div>

        <div className="adm-card">
          <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(200,16,46,.08)", border: "1px solid rgba(200,16,46,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldOff size={16} style={{ color: AURA.red }}/>
              </div>
              <div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 500, color: t.text, margin: 0, lineHeight: 1.1 }}>Números bloqueados</p>
                <p style={{ fontSize: 11, fontWeight: 300, color: t.textMuted, margin: "1px 0 0" }}>{filtrados.length} registro{filtrados.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="adm-btn-ghost" style={{ padding: "7px 13px", fontSize: 8, letterSpacing: ".12em", height: 32 }} onClick={onRecarregar}>
                <RefreshCcw size={12} style={{ animation: carregandoBloq ? "adm-spin 1s linear infinite" : "none" }}/> Atualizar
              </button>
              <button onClick={() => onBloquear("")}
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${AURA.redDark},${AURA.red})`, color: "#fff", boxShadow: "0 4px 16px rgba(200,16,46,.25)", fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", transition: "all .25s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 22px rgba(200,16,46,.35)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(200,16,46,.25)"; }}>
                <Ban size={13}/> <span className="adm-cta-btn-label">Bloquear número</span>
              </button>
            </div>
          </div>

          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${t.border}` }}>
            <div style={{ position: "relative", maxWidth: 400 }}>
              <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: AURA.gold, opacity: .5, pointerEvents: "none" }}/>
              <input className="adm-input" style={{ padding: "8px 12px 8px 34px", fontSize: 13, borderRadius: 9 }} placeholder="Buscar por número ou motivo..." value={busca} onChange={e => setBusca(e.target.value)}/>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", padding: "8px 20px", borderBottom: `1px solid ${t.border}`, background: isDark ? "rgba(255,255,255,.018)" : "rgba(0,0,0,.018)", gap: 12 }}>
            {[
              { label: "#",            w: 28,   align: "right" },
              { label: "Número",       w: 170,  align: "left"  },
              { label: "Motivo",       flex: 1, align: "left"  },
              { label: "Bloqueado em", w: 110,  align: "right" },
              { label: "Ação",         w: 90,   align: "right" },
            ].map(c => (
                <span key={c.label} style={{ width: c.w, flex: c.flex, fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: t.textMuted, textAlign: c.align, flexShrink: c.flex ? undefined : 0, overflow: "hidden" }}>
                  {c.label}
                </span>
            ))}
          </div>

          {carregandoBloq ? (
              <div style={{ padding: "42px 20px", textAlign: "center", color: t.textMuted }}>
                <Loader2 size={22} style={{ animation: "adm-spin 1s linear infinite", marginBottom: 8 }}/>
                <p style={{ fontSize: 11, margin: 0 }}>Carregando bloqueios…</p>
              </div>
          ) : filtrados.length === 0 ? (
              <div style={{ padding: "52px 20px", textAlign: "center", color: t.textMuted }}>
                <ShieldCheck size={30} style={{ marginBottom: 12, opacity: .35 }}/>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 4px", color: t.textSec }}>{busca ? "Nenhum resultado" : "Nenhum número bloqueado"}</p>
                <p style={{ fontSize: 11, margin: 0 }}>{busca ? "Tente outra busca." : "Todos os números têm acesso liberado."}</p>
              </div>
          ) : (
              <AnimatePresence>
                {filtrados.map((item, i) => (
                    <motion.div key={item.id ?? item.numero}
                                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16 }}
                                transition={{ delay: i * .03 }}
                                style={{ display: "flex", alignItems: "center", padding: "13px 20px", gap: 12, borderBottom: `1px solid ${t.border}`, transition: "background .18s ease" }}
                                onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(200,16,46,.10)" : "rgba(200,16,46,.09)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = ""; }}>
                      <span style={{ width: 28, flexShrink: 0, fontSize: 11, color: t.textMuted, textAlign: "right" }}>{i + 1}</span>
                      <span style={{ width: 170, flexShrink: 0, display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: AURA.red, flexShrink: 0, boxShadow: `0 0 6px ${AURA.red}88` }}/>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: t.text }}>{item.numero}</span>
                      </span>
                      <span style={{ flex: 1, overflow: "hidden" }}>
                        {item.motivo
                            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: t.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                <AlertTriangle size={11} style={{ color: AURA.yellowDark, flexShrink: 0 }}/> {item.motivo}
                              </span>
                            : <span style={{ fontSize: 11, color: t.textMuted, fontStyle: "italic" }}>Sem motivo informado</span>
                        }
                      </span>
                      <span style={{ width: 110, flexShrink: 0, fontSize: 11, color: t.textSec, textAlign: "right" }}>
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                          <Clock size={10} style={{ opacity: .5 }}/> {fmtData(item.criadoEm || item.bloqueadoEm)}
                        </span>
                      </span>
                      <span style={{ width: 90, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
                        <button title="Desbloquear número" onClick={() => onDesbloquear(item)}
                                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(5,150,105,.22)", background: "rgba(5,150,105,.06)", cursor: "pointer", color: AURA.green, fontSize: 9, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", transition: "all .18s", whiteSpace: "nowrap" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(5,150,105,.14)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(5,150,105,.06)"; e.currentTarget.style.transform = ""; }}>
                          <Unlock size={11}/> Liberar
                        </button>
                      </span>
                    </motion.div>
                ))}
              </AnimatePresence>
          )}
        </div>
      </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════════════════════════════════════════ */
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
  const [buscaUsu,       setBuscaUsu]       = useState("");
  const [filtroStatusUsu,setFiltroStatusUsu]= useState(""); // "", "ativo", "suspenso"
  const [isDark,         setIsDark]         = useState(() => localStorage.getItem("theme") === "dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaOpenId,     setMegaOpenId]     = useState(null);
  const [moduloAtivo,    setModuloAtivo]    = useState("usuarios");
  const [secaoExpMobile, setSecaoExpMobile] = useState("admin");
  const [celulas,        setCelulas]        = useState([]);
  const [celulaAdmin,    setCelulaAdmin]    = useState(null);

  const [bloqueados,      setBloqueados]      = useState([]);
  const [carregandoBloq,  setCarregandoBloq]  = useState(false);
  const [modalBloquear,   setModalBloquear]   = useState(false);
  const [numBloqueioIni,  setNumBloqueioIni]  = useState("");
  const [salvandoBloq,    setSalvandoBloq]    = useState(false);
  const [itemDesbloquear, setItemDesbloquear] = useState(null);

  const fotoRef   = useRef(null);
  const fotoIdRef = useRef(null);
  const navRowRef = useRef(null);
  const t = theme(isDark);

  useEffect(() => { localStorage.setItem("theme", isDark ? "dark" : "light"); }, [isDark]);
  // Segurança: garante que a rolagem nunca fique travada ao entrar/sair da página
  useEffect(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    document.body.style.position = "";
    document.body.style.touchAction = "";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mobileMenuOpen]);
  useEffect(() => {
    if (!megaOpenId) return;
    const onKey = e => { if (e.key === "Escape") setMegaOpenId(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [megaOpenId]);

  const carregarBloqueios = useCallback(async () => {
    setCarregandoBloq(true);
    try {
      const { data } = await api.get("webhook/whatsapp/registros/bloqueios", {
        params: { size: 1000 },
      });
      const lista = Array.isArray(data) ? data : data?.content ?? [];
      setBloqueados(lista);
    } catch { }
    finally { setCarregandoBloq(false); }
  }, []);

  useEffect(() => { carregarBloqueios(); }, [carregarBloqueios]);

  const confirmarBloqueio = async (numero, motivo) => {
    setSalvandoBloq(true);
    try {
      await api.post("webhook/whatsapp/registros/bloqueios", { numero, motivo });
      ok(`Número ${numero} bloqueado.`);
      setModalBloquear(false);
      carregarBloqueios();
    } catch (e) {
      setErro(e.response?.data?.message || "Erro ao bloquear número.");
    } finally { setSalvandoBloq(false); }
  };

  const confirmarDesbloqueio = async numero => {
    const numNormalizado = normalizarTelBR(numero);
    setSalvandoBloq(true);
    try {
      const { data } = await api.delete(`webhook/whatsapp/registros/bloqueios/${numNormalizado}`);
      if (!data.metaOk) {
        setErro("⚠️ Número desbloqueado localmente, mas a Meta pode levar até 24h para liberar. Isso ocorre quando o número não enviou mensagem recentemente.");
      } else {
        ok(`Número ${numNormalizado} desbloqueado com sucesso.`);
      }
      setItemDesbloquear(null);
      carregarBloqueios();
    } catch {
      setErro("Erro ao desbloquear número.");
    } finally {
      setSalvandoBloq(false);
    }
  };

  const handleAbrirBloquear = numero => {
    setNumBloqueioIni(numero || "");
    setModalBloquear(true);
  };

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

  const qtdPend    = pendentes.size;
  const isLider    = moduloAtivo?.startsWith("lider-");
  const secaoAtiva = SECOES.find(s => s.itens.some(i => i.key === moduloAtivo));
  const itemAtivo  = SECOES.flatMap(s => s.itens).find(i => i.key === moduloAtivo);
  const ativos     = usuarios.filter(u =>  u.ativo).length;
  const suspensos  = usuarios.filter(u => !u.ativo).length;

  // ── Ordenação alfabética + busca + filtro de status ──
  const usuariosExibidos = usuarios
      .filter(u => {
        const q = buscaUsu.trim().toLowerCase();
        const bateBusca = !q || (u.nome||"").toLowerCase().includes(q) || (u.email||"").toLowerCase().includes(q);
        const bateStatus = !filtroStatusUsu
            || (filtroStatusUsu === "ativo"    && u.ativo)
            || (filtroStatusUsu === "suspenso" && !u.ativo);
        return bateBusca && bateStatus;
      })
      .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR", { sensitivity: "base" }));

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

        <div className="adm-header-wrap">
          <div className="adm-header-top-line" />
          <div className="adm-topbar">
            <div className="adm-topbar-l">
              <button className="adm-ico-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Menu"><Menu size={18}/></button>
              <div className="adm-topbar-sep"/>
              <div className="adm-brand">
                <div className="adm-brand-logo">
                  <img src="/quadrangular.png" alt="IEQ" onError={e => { e.target.style.display="none"; }}/>
                </div>
                <div className="adm-brand-text">
                  <p className="adm-brand-name">IEQ Pituaçu</p>
                  <span className="adm-brand-sub">Painel Admin</span>
                </div>
              </div>
            </div>
            <div className="adm-topbar-r">
              <div className="adm-user-chip">
                <div className="adm-user-chip-dot"/>
                <div>
                  <p className="adm-user-chip-name">Administrador</p>
                  <p className="adm-user-chip-role">Admin · IEQ</p>
                </div>
              </div>
              <div className="adm-live-pill"><div className="adm-live-dot"/> Online</div>
              <div className="adm-topbar-sep"/>
              <button className="adm-ico-btn" onClick={() => setIsDark(!isDark)} aria-label="Tema">
                {isDark ? <Sun size={15}/> : <Moon size={15}/>}
              </button>
              <button className="adm-ico-btn" onClick={carregarUsuarios} aria-label="Atualizar">
                <RefreshCcw size={15} style={{ animation: loading ? "adm-spin 1s linear infinite" : "none" }}/>
              </button>
              <div className="adm-topbar-sep"/>
              <button className="adm-ico-btn" onClick={() => setExitConfirm(true)} aria-label="Sair"><LogOut size={15}/></button>
              {moduloAtivo === "usuarios" && (
                  <>
                    <div className="adm-topbar-sep"/>
                    <button className="adm-cta-btn adm-cta-red" onClick={abrirNovo}>
                      <UserPlus size={13}/> <span className="adm-cta-btn-label">Novo usuário</span>
                    </button>
                  </>
              )}
              {moduloAtivo === "bloqueios" && (
                  <>
                    <div className="adm-topbar-sep"/>
                    <button className="adm-cta-btn adm-cta-red" onClick={() => handleAbrirBloquear("")}>
                      <Ban size={13}/> <span className="adm-cta-btn-label">Bloquear número</span>
                    </button>
                  </>
              )}
            </div>
          </div>

          <nav className="adm-nav-row" ref={navRowRef}>
            {SECOES.map(sec => {
              const SIcon = sec.icon;
              const open = megaOpenId === sec.id;
              const hasActive = sec.itens.some(i => i.key === moduloAtivo);
              return (
                  <button key={sec.id}
                          className={`adm-nav-sec-btn${open?" open":""}${hasActive?" has-active":""}`}
                          style={{ "--sc": sec.color }}
                          onClick={() => setMegaOpenId(open ? null : sec.id)}>
                    <SIcon size={13}/>
                    {sec.label}
                    {sec.id === "admin" && qtdPend > 0 && <span className="adm-nav-sec-badge">{qtdPend}</span>}
                    <ChevronDown size={11} style={{ opacity:.5, transform: open?"rotate(180deg)":"none", transition:"transform .2s" }}/>
                  </button>
              );
            })}
          </nav>

          <AnimatePresence>
            {megaOpenId && (
                <>
                  <div className="adm-megamenu-backdrop" onClick={() => setMegaOpenId(null)}/>
                  <motion.div className="adm-megamenu"
                              initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                              transition={{ duration:.16 }}>
                    <div className="adm-megamenu-grid">
                      {SECOES.find(s => s.id === megaOpenId)?.itens.map(item => {
                        const IIcon = item.icon;
                        const ativo = moduloAtivo === item.key;
                        const sec = SECOES.find(s => s.id === megaOpenId);
                        return (
                            <button key={item.key} className={`adm-mega-item${ativo?" act":""}`} onClick={() => selecionarModulo(item.key)}>
                              <div className="adm-mega-ico" style={{ background: ativo ? sec.color : (isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.045)") }}>
                                <IIcon size={16} style={{ color: ativo?"#fff":sec.color, opacity: ativo?1:.75 }}/>
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

        <AnimatePresence>
          {mobileMenuOpen && (
              <motion.div className="adm-mobile-overlay"
                          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          transition={{ duration:.2 }}>
                <div className="adm-mobile-overlay-head">
                  <div className="adm-brand">
                    <div className="adm-brand-logo">
                      <img src="/quadrangular.png" alt="IEQ" onError={e => { e.target.style.display="none"; }}/>
                    </div>
                    <div>
                      <p className="adm-brand-name">IEQ Pituaçu</p>
                      <span className="adm-brand-sub">Painel Administrativo</span>
                    </div>
                  </div>
                  <button className="adm-ico-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Fechar menu"><X size={18}/></button>
                </div>
                <div className="adm-mobile-overlay-body">
                  {SECOES.map(sec => {
                    const SIcon = sec.icon;
                    const exp = secaoExpMobile === sec.id;
                    return (
                        <div key={sec.id}>
                          <div className="adm-mobile-sec-toggle" onClick={() => setSecaoExpMobile(exp ? null : sec.id)}>
                            <div className="adm-mobile-sec-left">
                              <SIcon size={14} style={{ color: sec.color }}/>
                              <span className="adm-mobile-sec-label">{sec.label}</span>
                              {sec.id === "admin" && qtdPend > 0 && <span className="adm-mobile-nav-badge" style={{ marginLeft:4 }}>{qtdPend}</span>}
                            </div>
                            <ChevronDown size={14} style={{ color:"rgba(245,240,232,.3)", transform: exp?"rotate(180deg)":"none", transition:"transform .2s" }}/>
                          </div>
                          <AnimatePresence>
                            {exp && (
                                <motion.div initial={{ height:0,opacity:0 }} animate={{ height:"auto",opacity:1 }} exit={{ height:0,opacity:0 }} transition={{ duration:.16 }} style={{ overflow:"hidden" }}>
                                  {sec.itens.map(item => {
                                    const IIcon = item.icon;
                                    const ativo = moduloAtivo === item.key;
                                    return (
                                        <button key={item.key}
                                                className={`adm-mobile-nav-item${ativo?" act":""}`}
                                                style={{ "--nc": sec.color }}
                                                onClick={() => selecionarModulo(item.key)}>
                                          <div className="adm-mobile-nav-ico">
                                            <IIcon size={14} style={{ color: ativo?"#fff":sec.color, opacity: ativo?1:.65 }}/>
                                          </div>
                                          <div style={{ flex:1, minWidth:0 }}>
                                            <span className="adm-mobile-nav-main">{item.label}</span>
                                            <span className="adm-mobile-nav-sub">{item.sub}</span>
                                          </div>
                                          {item.key === "usuarios" && qtdPend > 0 && <span className="adm-mobile-nav-badge">{qtdPend}</span>}
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
                    <LogOut size={14}/> Sair do sistema
                  </button>
                  <p style={{ textAlign:"center", fontSize:7.5, letterSpacing:".16em", color:"rgba(245,240,232,.12)", marginTop:14, textTransform:"uppercase", fontFamily:"'Inter',sans-serif" }}>
                    © IEQ Pituaçu · {new Date().getFullYear()}
                  </p>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        <main className="adm-main">
          <div className="adm-page-head">
            <p className="adm-page-eyebrow">{secaoAtiva?.label || "Admin"}</p>
            <motion.h2 className="adm-page-title" key={moduloAtivo}
                       initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ duration:.2 }}>
              {itemAtivo?.label || "Painel"}
            </motion.h2>
          </div>

          <div className="adm-content">
            {isLider && celulas.length > 0 && (
                <div className="adm-celula-bar" style={{ marginTop:14 }}>
                  <Building2 size={15} style={{ color:AURA.blue, flexShrink:0 }}/>
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

                {moduloAtivo === "usuarios" && (
                    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                      <div className="adm-kpi-grid">
                        {[
                          { label:"Total",     value:usuarios.length, color:AURA.blue,       bg:"rgba(0,61,165,.08)",  icon:<Users size={16}/>,  trend:"usuários cadastrados" },
                          { label:"Ativos",    value:ativos,          color:AURA.green,      bg:"rgba(5,150,105,.08)", icon:<Power size={16}/>,  trend:"com acesso liberado"  },
                          { label:"Suspensos", value:suspensos,       color:AURA.red,        bg:"rgba(200,16,46,.08)", icon:<Shield size={16}/>, trend:"acesso bloqueado"     },
                          { label:"Pendentes", value:qtdPend,         color:AURA.yellowDark, bg:"rgba(196,140,0,.08)", icon:<Clock size={16}/>,  trend:"aguardando aprovação" },
                        ].map(k => (
                            <div key={k.label} className="adm-kpi">
                              <div className="adm-kpi-top">
                                <div>
                                  <p className="adm-kpi-num" style={{ color: k.label==="Pendentes"&&k.value>0 ? AURA.yellowDark : t.text }}>{k.value}</p>
                                  <p className="adm-kpi-lbl">{k.label}</p>
                                </div>
                                <div className="adm-kpi-icon" style={{ background:k.bg, color:k.color }}>{k.icon}</div>
                              </div>
                              <p className="adm-kpi-trend">{k.trend}</p>
                            </div>
                        ))}
                      </div>
                      <div className="adm-card">
                        {qtdPend > 0 && (
                            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 22px", background:"rgba(253,184,19,.06)", borderBottom:`1px solid rgba(253,184,19,.15)` }}>
                              <Clock size={12} style={{ color:AURA.yellowDark }}/>
                              <span style={{ fontSize:8.5, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:AURA.yellowDark }}>
                                {qtdPend} solicitaç{qtdPend > 1 ? "ões" : "ão"} aguardando aprovação
                              </span>
                            </div>
                        )}
                        <div className="adm-card-header" style={{ padding:"18px 22px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
                          <div>
                            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:500, color:t.text, margin:0, lineHeight:1.1 }}>Base de Usuários</h3>
                            <p style={{ fontSize:11, fontWeight:300, color:t.textMuted, margin:"2px 0 0" }}>
                              {usuariosExibidos.length} de {usuarios.length} registro{usuarios.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <button className="adm-btn-ghost" style={{ padding:"8px 14px", fontSize:8, letterSpacing:".14em" }} onClick={carregarUsuarios}>
                            <RefreshCcw size={12} style={{ animation:loading?"adm-spin 1s linear infinite":"none" }}/> Atualizar
                          </button>
                        </div>

                        <div style={{ padding:"12px 22px", borderBottom:`1px solid ${t.border}`, display:"flex", gap:8, flexWrap:"wrap" }}>
                          <div style={{ position:"relative", flex:"1 1 220px", minWidth:180 }}>
                            <Search size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:AURA.gold, opacity:.5, pointerEvents:"none" }}/>
                            <input
                                className="adm-input"
                                style={{ padding:"9px 12px 9px 34px", fontSize:13, borderRadius:9 }}
                                placeholder="Buscar por nome ou e-mail..."
                                value={buscaUsu}
                                onChange={e => setBuscaUsu(e.target.value)}
                            />
                          </div>
                          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                            {[
                              { key:"",         label:"Todos",     count:usuarios.length },
                              { key:"ativo",    label:"Ativos",    count:ativos          },
                              { key:"suspenso", label:"Suspensos", count:suspensos       },
                            ].map(f => {
                              const on = filtroStatusUsu === f.key;
                              const cor = f.key === "ativo" ? AURA.green : f.key === "suspenso" ? AURA.red : AURA.blue;
                              return (
                                  <button key={f.key} onClick={() => setFiltroStatusUsu(f.key)}
                                          style={{
                                            display:"flex", alignItems:"center", gap:6,
                                            padding:"8px 13px", borderRadius:9, cursor:"pointer",
                                            fontFamily:"'Inter',sans-serif", fontSize:10.5, fontWeight:600, letterSpacing:".04em",
                                            whiteSpace:"nowrap", transition:"all .18s",
                                            border:`1px solid ${on ? cor+"55" : t.border}`,
                                            background: on ? cor+"14" : "transparent",
                                            color: on ? cor : t.textSec,
                                          }}>
                                    {f.label}
                                    <span style={{
                                      fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:99,
                                      background: on ? cor+"22" : (isDark?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"),
                                      color: on ? cor : t.textMuted,
                                    }}>{f.count}</span>
                                  </button>
                              );
                            })}
                          </div>
                        </div>

                        <AnimatePresence>
                          {usuariosExibidos.length === 0 ? (
                              <div style={{ padding:"52px 20px", textAlign:"center", color:t.textMuted }}>
                                <Users size={28} style={{ marginBottom:10, opacity:.35 }}/>
                                <p style={{ fontSize:13, fontWeight:500, margin:"0 0 4px", color:t.textSec }}>Nenhum usuário encontrado</p>
                                <p style={{ fontSize:11, margin:0 }}>Ajuste a busca ou o filtro de status.</p>
                              </div>
                          ) : usuariosExibidos.map((u, i) => {
                            const temP  = pendentes.has(u.id);
                            const eApr  = aprovando === u.id;
                            const eFoto = uploadandoFoto === u.id;
                            return (
                                <motion.div key={u.id} className="adm-row"
                                            initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-16 }}
                                            transition={{ delay: i*.025 }}
                                            onMouseEnter={e => { e.currentTarget.style.background = temP ? (isDark?"rgba(196,140,0,.15)":"rgba(196,140,0,.18)") : (u.ativo ? (isDark?"rgba(5,150,105,.18)":"rgba(5,150,105,.20)") : (isDark?"rgba(200,16,46,.18)":"rgba(200,16,46,.20)")); e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = `4px 0 16px ${temP ? "rgba(196,140,0,.12)" : u.ativo ? "rgba(5,150,105,.15)" : "rgba(200,16,46,.15)"}`; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = temP ? undefined : (u.ativo ? (isDark?"rgba(5,150,105,.025)":"rgba(5,150,105,.02)") : (isDark?"rgba(200,16,46,.025)":"rgba(200,16,46,.02)")); e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}
                                            style={{
                                              borderLeft:`3px solid ${temP ? AURA.yellow : u.ativo ? AURA.green+"55" : AURA.red+"55"}`,
                                              background: temP ? undefined : (u.ativo ? (isDark?"rgba(5,150,105,.025)":"rgba(5,150,105,.02)") : (isDark?"rgba(200,16,46,.025)":"rgba(200,16,46,.02)")),
                                            }}>
                                  <div className="adm-row-l">
                                    <div className="adm-avatar"
                                         style={{ border:`1.5px solid ${temP?AURA.yellow+"55":t.border}`, opacity:u.ativo?1:.5 }}
                                         onClick={() => abrirSeletorFoto(u.id)}>
                                      {u.fotoPerfil
                                          ? <img src={getFotoUrl(u.fotoPerfil)} alt={u.nome}/>
                                          : <div className="adm-avatar-placeholder"
                                                 style={{ background:u.ativo?`linear-gradient(135deg,${AURA.redDark},${AURA.blue})`:(isDark?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)") }}>
                                            {u.nome?.charAt(0).toUpperCase()}
                                          </div>
                                      }
                                      <div className="adm-avatar-overlay">
                                        {eFoto ? <Loader2 size={13} color="#fff" style={{ animation:"adm-spin 1s linear infinite" }}/> : <Camera size={13} color="#fff"/>}
                                      </div>
                                    </div>
                                    <div style={{ flex:1, minWidth:0 }}>
                                      <p className="adm-row-name">
                                        {u.nome}
                                      </p>
                                      <p className="adm-row-email">{u.email}</p>
                                    </div>
                                  </div>
                                  <div className="adm-row-r">
                                    <span className="adm-badge" style={{ background:"rgba(0,61,165,.07)", border:"1px solid rgba(0,61,165,.18)", color:AURA.blue }}>
                                      {u.perfil?.replace(/_/g," ")}
                                    </span>
                                    <span className="adm-badge" style={{ background:u.ativo?"rgba(5,150,105,.07)":"rgba(0,0,0,.04)", border:`1px solid ${u.ativo?"rgba(5,150,105,.2)":"rgba(0,0,0,.07)"}`, color:u.ativo?AURA.green:t.textMuted }}>
                                      <span style={{ width:5, height:5, borderRadius:"50%", background:u.ativo?AURA.green:t.textMuted, flexShrink:0, display:"block" }}/>
                                      {u.ativo ? "Ativo" : "Suspenso"}
                                    </span>
                                    {temP && (
                                        <>
                                          <button disabled={eApr} onClick={() => aprovarAlteracao(u.id, u.nome)}
                                                  className="adm-pending-action"
                                                  style={{ background:"rgba(5,150,105,.07)", border:"1px solid rgba(5,150,105,.22)", color:AURA.green }}>
                                            {eApr?<Loader2 size={11} style={{ animation:"adm-spin 1s linear infinite" }}/>:<CheckCircle size={11}/>} Aprovar
                                          </button>
                                          <button disabled={eApr} onClick={() => rejeitarAlteracao(u.id, u.nome)}
                                                  className="adm-pending-action"
                                                  style={{ background:"rgba(200,16,46,.07)", border:"1px solid rgba(200,16,46,.22)", color:AURA.red }}>
                                            {eApr?<Loader2 size={11} style={{ animation:"adm-spin 1s linear infinite" }}/>:<XCircle size={11}/>} Rejeitar
                                          </button>
                                        </>
                                    )}
                                    {[
                                      { icon:<Pencil size={14}/>, title:"Editar",    fn:() => abrirEdicao(u),       hc:AURA.blue,       hb:"rgba(0,61,165,.14)"  },
                                      { icon:<Power size={14}/>,  title:"Suspender", fn:() => alternarStatus(u.id), hc:AURA.yellowDark, hb:"rgba(196,140,0,.14)" },
                                      { icon:<Trash2 size={14}/>, title:"Excluir",   fn:() => deletarUsuario(u.id), hc:AURA.red,        hb:"rgba(200,16,46,.14)" },
                                    ].map(btn => (
                                        <button key={btn.title} className="adm-action-btn" onClick={btn.fn} title={btn.title}
                                                onMouseEnter={e => { e.currentTarget.style.color=btn.hc; e.currentTarget.style.background=btn.hb; e.currentTarget.style.borderColor=btn.hc+"44"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 4px 12px ${btn.hc}22`; }}
                                                onMouseLeave={e => { e.currentTarget.style.color=t.textMuted; e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor=t.border; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
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

                {moduloAtivo === "historico" && (
                    <div className="adm-card"><HistoricoAuditoria isDark={isDark}/></div>
                )}

                {moduloAtivo === "wa-registros" && (
                    <PainelWhatsApp
                        isDark={isDark} t={t} usuarios={usuarios}
                        bloqueados={bloqueados}
                        onBloquear={handleAbrirBloquear}
                        onDesbloquear={setItemDesbloquear}
                    />
                )}

                {moduloAtivo === "bloqueios" && (
                    <PainelBloqueios
                        isDark={isDark} t={t}
                        bloqueados={bloqueados}
                        carregandoBloq={carregandoBloq}
                        onRecarregar={carregarBloqueios}
                        onBloquear={handleAbrirBloquear}
                        onDesbloquear={setItemDesbloquear}
                    />
                )}

                {moduloAtivo !== "usuarios" && moduloAtivo !== "historico" && moduloAtivo !== "wa-registros" && moduloAtivo !== "bloqueios" && (
                    <ModuloRenderer moduloKey={moduloAtivo} isDark={isDark} celulaAdmin={celulaAdmin}/>
                )}
              </motion.div>
            </AnimatePresence>

            <p className="adm-footer-txt">© {new Date().getFullYear()} IEQ Pituaçu · Sistema Eclesiástico · Admin Total</p>
          </div>
        </main>

        <input ref={fotoRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFoto}/>

        <AnimatePresence>
          {drawerOpen && (
              <motion.div className="adm-modal-backdrop"
                          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          transition={{ duration:.2 }}
                          onClick={e => { if (e.target === e.currentTarget) setDrawerOpen(false); }}>
                <motion.div className="adm-modal-box"
                            initial={{ opacity:0, y:-32, scale:.96 }}
                            animate={{ opacity:1, y:0,   scale:1   }}
                            exit={{    opacity:0, y:-20,  scale:.97 }}
                            transition={{ type:"spring", damping:28, stiffness:280 }}>
                  <div style={{ height:2, background:`linear-gradient(90deg,${AURA.blue},${AURA.red} 40%,${AURA.gold} 70%,${AURA.goldLight})`, flexShrink:0 }}/>
                  <div className="adm-modal-header">
                    <button className="adm-modal-close" onClick={() => setDrawerOpen(false)} style={{
                      position:"absolute", width:34, height:34, borderRadius:10, border:`1px solid ${t.border}`,
                      background:isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",
                      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                      color:t.textMuted, transition:"all .2s",
                    }}
                            onMouseEnter={e => { e.currentTarget.style.color=AURA.red; e.currentTarget.style.borderColor="rgba(200,16,46,.3)"; e.currentTarget.style.background="rgba(200,16,46,.06)"; }}
                            onMouseLeave={e => { e.currentTarget.style.color=t.textMuted; e.currentTarget.style.borderColor=t.border; e.currentTarget.style.background=isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)"; }}>
                      <X size={16}/>
                    </button>
                    <div style={{ display:"flex", alignItems:"center", gap:16, paddingRight:36 }}>
                      <div style={{ width:52, height:52, borderRadius:15, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:editandoId?`linear-gradient(135deg,${AURA.blueDark},${AURA.blue})`:`linear-gradient(135deg,${AURA.redDark},${AURA.red})`, boxShadow:editandoId?"0 8px 24px rgba(0,61,165,.28)":"0 8px 24px rgba(200,16,46,.28)" }}>
                        {editandoId ? <Pencil size={20} color="#fff"/> : <UserPlus size={20} color="#fff"/>}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:8, fontWeight:700, letterSpacing:".26em", textTransform:"uppercase", color:t.textMuted, margin:"0 0 4px" }}>{editandoId ? "Editar registro" : "Novo registro"}</p>
                        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:500, color:t.text, margin:"0 0 2px", lineHeight:1.1 }}>{editandoId ? "Editar Usuário" : "Liberar Acesso"}</h2>
                        <p style={{ fontSize:12, fontWeight:300, color:t.textMuted, margin:0 }}>{editandoId ? `Atualizando dados · ID ${editandoId}` : "Preencha os dados para criar novo acesso"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="adm-modal-body">
                    <form id="modal-form" onSubmit={editandoId ? salvarEdicao : adicionarUsuario}>
                      <div className="adm-modal-form-grid">
                        {[
                          { icon:<User size={14}/>,  type:"text",     placeholder:"Nome completo",                                   key:"nome",             label:"Nome",     req:true,        col:"1/-1" },
                          { icon:<Mail size={14}/>,  type:"email",    placeholder:"E-mail",                                         key:"email",            label:"E-mail",   req:true,        col:"1/-1" },
                          { icon:<Key size={14}/>,   type:"password", placeholder:editandoId?"Manter senha atual":"Senha de acesso", key:"senha",            label:"Senha",    req:!editandoId, col:"1/2"  },
                          { icon:<Phone size={14}/>, type:"tel",      placeholder:"WhatsApp com DDD",                               key:"telefoneWhatsapp", label:"WhatsApp", req:false,       col:"2/3"  },
                        ].map(f => (
                            <div key={f.key} style={{ gridColumn:f.col, marginBottom:16 }}>
                              <label className="adm-label">{f.label}</label>
                              <InputField icon={f.icon} type={f.type} placeholder={f.placeholder}
                                          value={form[f.key]} onChange={v => setForm({...form,[f.key]:v})}
                                          required={f.req} isDark={isDark} t={t}/>
                            </div>
                        ))}
                      </div>
                      <div style={{ marginBottom:16 }}>
                        <label className="adm-label">Perfil de Acesso</label>
                        <div style={{ position:"relative" }}>
                          <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:AURA.gold, opacity:.5, pointerEvents:"none" }}><Shield size={14}/></div>
                          <select className="adm-select" value={form.perfil} onChange={e => setForm({...form,perfil:e.target.value})}>
                            {perfis.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ padding:"12px 16px", borderRadius:12, background:isDark?"rgba(201,169,110,.04)":"rgba(201,169,110,.05)", border:`1px solid ${t.border}` }}>
                        <p style={{ fontSize:10, fontWeight:400, color:t.textSec, margin:0, lineHeight:1.65 }}>
                          {editandoId ? "Alterações ficam pendentes de aprovação pelo administrador." : "O usuário receberá as instruções de primeiro acesso ao sistema."}
                        </p>
                      </div>
                    </form>
                  </div>
                  <div className="adm-modal-footer">
                    <button type="button" className="adm-btn-ghost" style={{ minWidth:100 }} onClick={() => setDrawerOpen(false)}>Cancelar</button>
                    <button type="submit" form="modal-form" disabled={sending}
                            className={`adm-btn-primary ${editandoId?"blue":"red"}`}
                            style={{ opacity:sending?.65:1 }}>
                      {sending
                          ? <><Loader2 size={14} style={{ animation:"adm-spin 1s linear infinite" }}/> Salvando…</>
                          : editandoId ? <><Pencil size={14}/> Salvar Alterações</> : <><UserPlus size={14}/> Liberar Acesso</>}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {exitConfirm && (
              <motion.div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
                          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <motion.div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.85)", backdropFilter:"blur(14px)" }} onClick={() => setExitConfirm(false)}/>
                <motion.div className="adm-exit-modal"
                            initial={{ scale:.88,opacity:0,y:20 }} animate={{ scale:1,opacity:1,y:0 }} exit={{ scale:.92,opacity:0 }}
                            transition={{ type:"spring", stiffness:380, damping:28 }}
                            style={{ position:"relative", zIndex:10, width:"100%", maxWidth:360, background:t.bgEl, border:`1px solid ${t.border}`, borderRadius:22, padding:"36px 28px 28px", textAlign:"center", boxShadow:"0 40px 80px rgba(0,0,0,.7)" }}>
                  <div style={{ width:60, height:60, borderRadius:18, margin:"0 auto 20px", background:"rgba(200,16,46,.08)", border:"1px solid rgba(200,16,46,.2)", display:"flex", alignItems:"center", justifyContent:"center", color:AURA.red }}>
                    <LogOut size={24}/>
                  </div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:500, color:t.text, margin:"0 0 10px" }}>Encerrar Sessão</h3>
                  <p style={{ fontSize:13, fontWeight:300, color:t.textSec, margin:"0 0 24px", lineHeight:1.65 }}>Tem certeza que deseja sair do sistema?</p>
                  <div className="adm-divider" style={{ margin:"0 0 20px" }}/>
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={() => setExitConfirm(false)} className="adm-btn-ghost" style={{ flex:1, padding:"13px" }}>Cancelar</button>
                    <button onClick={() => { localStorage.clear(); window.location.href="/"; }} className="adm-btn-primary red" style={{ flex:1.5, padding:"13px" }}>
                      <LogOut size={13}/> Sair Agora
                    </button>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        <ModalBloquear
            aberto={modalBloquear}
            numeroInicial={numBloqueioIni}
            onFechar={() => setModalBloquear(false)}
            onConfirmar={confirmarBloqueio}
            salvando={salvandoBloq}
            t={t} isDark={isDark}
        />
        <ModalDesbloquear
            item={itemDesbloquear}
            onFechar={() => setItemDesbloquear(null)}
            onConfirmar={confirmarDesbloqueio}
            salvando={salvandoBloq}
            t={t} isDark={isDark}
        />

        <AnimatePresence>
          {sucesso && (
              <motion.div className="adm-toast"
                          initial={{ opacity:0,y:20,scale:.95 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:16,scale:.95 }}
                          style={{ background:AURA.green, color:"#fff", boxShadow:"0 10px 32px rgba(5,150,105,.4)" }}>
                <CheckCircle size={14}/> {sucesso}
              </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {erro && (
              <motion.div className="adm-toast"
                          initial={{ opacity:0,y:20,scale:.95 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:16,scale:.95 }}
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
/* ============================================================
   TelaPendencias.jsx — Design AURA (idêntico ao DashboardLider)
   Polling automático a cada 60s + responsivo Android/iOS
   ============================================================ */

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
    AlertTriangle, CheckCircle2, RefreshCw, Loader2,
    FileText, BookOpen, MapPin, User, ClipboardList,
    CalendarDays, ChevronLeft, ChevronRight, Radio,
} from "lucide-react";

/* ─── Tokens AURA (idênticos ao DashboardLider) ────────────────────────── */
const AURA = {
    gold:      "#C9A96E",
    goldLight: "#E8D5A3",
    dark:      "#0A0A0F",
    darkEl:    "#12121A",
    light:     "#F5F0E8",
    red:       "#C8102E",
    redDark:   "#9B0B1E",
    redLight:  "#E8294A",
    blue:      "#003DA5",
    blueDark:  "#002470",
    blueFade:  "#7AABF4",
    yellow:    "#FDB813",
    teal:      "#5DCAA5",
    green:     "#12A060",
    gray:      "#B4B2A9",
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
        placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
        optionBg:    isDark ? "#12121A"                : "#F0EAE0",
        hoverBg:     isDark ? "rgba(201,169,110,.06)"  : "rgba(201,169,110,.07)",
        rowBg:       isDark ? "rgba(255,255,255,.025)" : "rgba(201,169,110,.04)",
        rowBorder:   isDark ? "rgba(201,169,110,.07)"  : "rgba(201,169,110,.12)",
    };
}

/* ─── Helpers de data ────────────────────────────────────────────────────── */
const POLLING_INTERVAL = 60;

const inicioSemana = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
};
const toISO  = (d) => d.toISOString().split("T")[0];
const fmtDia = (iso) => { const [, m, d] = iso.split("-"); return `${d}/${m}`; };
const labelSemana = (inicio) => {
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 6);
    return `${fmtDia(toISO(inicio))} – ${fmtDia(toISO(fim))}`;
};

/* ─── Componente Principal ───────────────────────────────────────────────── */
export default function TelaPendencias({ isDark = false }) {
    const hoje        = new Date();
    const semanaAtual = inicioSemana(hoje);

    const t = theme(isDark);

    const [semanaRef,   setSemanaRef]   = useState(semanaAtual);
    const [celulas,     setCelulas]     = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [erro,        setErro]        = useState("");
    const [filtro,      setFiltro]      = useState("TODAS");
    const [showPicker,  setShowPicker]  = useState(false);
    const [countdown,   setCountdown]   = useState(POLLING_INTERVAL);
    const [ultimaAtt,   setUltimaAtt]   = useState(null);
    const [pollingAtivo,setPollingAtivo]= useState(true);

    const semanaRefRef  = useRef(semanaRef);
    const pickerRef     = useRef(null);
    const countdownRef  = useRef(null);

    useEffect(() => { semanaRefRef.current = semanaRef; }, [semanaRef]);

    /* ── Fechar picker ao clicar fora ── */
    useEffect(() => {
        const h = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    /* ── Carga de dados ── */
    const carregar = useCallback(async (semana, silencioso = false) => {
        if (!silencioso) setLoading(true);
        setErro("");
        try {
            const res = await api.get("/pastor/pendencias", {
                params: { semanaInicio: toISO(semana), todas: true },
            });
            setCelulas(res.data);
            setUltimaAtt(new Date());
        } catch (err) {
            setErro("Não foi possível carregar as células.");
            console.error(err);
        } finally {
            if (!silencioso) setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregar(semanaRef);
        setCountdown(POLLING_INTERVAL);
    }, [carregar, semanaRef]);

    /* ── Polling ── */
    useEffect(() => {
        clearInterval(countdownRef.current);
        if (!pollingAtivo) return;
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { carregar(semanaRefRef.current, true); return POLLING_INTERVAL; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(countdownRef.current);
    }, [pollingAtivo, carregar]);

    /* ── Page Visibility API ── */
    useEffect(() => {
        const onVis = () => {
            if (document.hidden) { setPollingAtivo(false); }
            else { carregar(semanaRefRef.current, true); setCountdown(POLLING_INTERVAL); setPollingAtivo(true); }
        };
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, [carregar]);

    const handleAtualizar = () => { carregar(semanaRef); setCountdown(POLLING_INTERVAL); };
    const navSemana = (delta) => setSemanaRef(prev => {
        const d = new Date(prev); d.setDate(d.getDate() + delta * 7); return d;
    });
    const ehSemanaAtual = toISO(semanaRef) === toISO(semanaAtual);

    /* ── Filtros ── */
    const celulasFiltradas = celulas.filter(p => {
        if (filtro === "PENDENTES")   return p.relatorioPendente || p.discipuladoPendente;
        if (filtro === "AMBAS")       return p.relatorioPendente && p.discipuladoPendente;
        if (filtro === "RELATORIO")   return p.relatorioPendente && !p.discipuladoPendente;
        if (filtro === "DISCIPULADO") return p.discipuladoPendente && !p.relatorioPendente;
        if (filtro === "EM_DIA")      return !p.relatorioPendente && !p.discipuladoPendente;
        return true;
    });

    const totalAmbas       = celulas.filter(p => p.relatorioPendente && p.discipuladoPendente).length;
    const totalRelatorio   = celulas.filter(p => p.relatorioPendente).length;
    const totalDiscipulado = celulas.filter(p => p.discipuladoPendente).length;
    const totalEmDia       = celulas.filter(p => !p.relatorioPendente && !p.discipuladoPendente).length;

    const ultimaAttLabel = ultimaAtt
        ? ultimaAtt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : null;

    const ringOffset = ((POLLING_INTERVAL - countdown) / POLLING_INTERVAL) * 57;

    /* ── CSS Global (estilo AURA idêntico ao Dashboard) ── */
    const globalStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

        @keyframes tp-spin  { to { transform: rotate(360deg); } }
        @keyframes tp-pulse { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
        @keyframes tp-live  { 0%,100%{opacity:1; transform:scale(1);} 50%{opacity:.35; transform:scale(.72);} }
        @keyframes tp-blink { 0%,100%{opacity:1;} 50%{opacity:.3;} }

        .tp-spin  { animation: tp-spin  1s linear infinite; }
        .tp-pulse { animation: tp-pulse 3s ease-in-out infinite; }
        .tp-live  { animation: tp-live  1.6s ease-in-out infinite; }

        .tp-root {
            font-family: 'Inter', sans-serif;
            color: ${t.text};
            position: relative;
        }

        /* ── Eyebrow ── */
        .tp-eyebrow {
            font-family: 'Inter', sans-serif;
            font-size: 9px; font-weight: 600; letter-spacing: .2em;
            text-transform: uppercase; color: rgba(201,169,110,.55);
            margin: 0 0 3px;
        }

        /* ── KPI cards (mesmos do Dashboard) ── */
        .tp-kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px; margin-bottom: 20px;
        }
        @media (max-width: 700px) { .tp-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 360px) { .tp-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }

        .tp-kpi-card {
            background: ${t.bgEl}; border: 1px solid ${t.border};
            border-radius: 18px; padding: 16px;
            position: relative; overflow: hidden;
            backdrop-filter: blur(20px);
        }
        .tp-kpi-stripe {
            position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
            border-radius: 18px 0 0 18px;
        }
        .tp-kpi-icon {
            width: 36px; height: 36px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 10px; flex-shrink: 0;
        }
        .tp-kpi-label {
            font-size: 8.5px; font-weight: 600; letter-spacing: .18em;
            text-transform: uppercase; color: ${t.textMuted}; margin-bottom: 6px;
        }
        .tp-kpi-value {
            font-family: 'Playfair Display', serif;
            font-size: clamp(26px, 6vw, 34px); font-weight: 700;
            line-height: 1; color: ${t.text};
        }
        .tp-kpi-sub {
            font-size: 11px; font-weight: 300; color: ${t.textSec}; margin-top: 4px;
        }

        /* ── Card container (mesmos do Dashboard) ── */
        .tp-card {
            background: ${t.bgEl}; border: 1px solid ${t.border};
            border-radius: 20px; overflow: hidden; margin-bottom: 16px;
            backdrop-filter: blur(24px); position: relative;
        }
        .tp-card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
        }
        .tp-card-head {
            padding: 18px 20px;
            border-bottom: 1px solid ${t.border};
            display: flex; align-items: center; justify-content: space-between;
            flex-wrap: wrap; gap: 12px;
        }
        .tp-card-title {
            font-family: 'Playfair Display', serif;
            font-size: 16px; font-weight: 500; color: ${t.text}; margin: 0;
        }
        .tp-card-sub {
            font-size: 11px; font-weight: 300; color: ${t.textMuted}; margin: 3px 0 0;
        }

        /* ── Barra de polling ── */
        .tp-polling-bar {
            background: ${isDark ? "rgba(18,160,96,.07)" : "rgba(18,160,96,.06)"};
            border: 1px solid rgba(18,160,96,.2);
            border-radius: 14px; padding: 12px 16px;
            display: flex; align-items: center; gap: 12px;
            margin-bottom: 18px; flex-wrap: wrap;
        }
        .tp-live-dot {
            width: 7px; height: 7px; border-radius: 50%;
            background: ${AURA.green}; flex-shrink: 0;
        }
        .tp-countdown-ring { position: relative; width: 24px; height: 24px; flex-shrink: 0; }
        .tp-countdown-ring svg { transform: rotate(-90deg); }
        .tp-countdown-num {
            position: absolute; inset: 0;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Inter', sans-serif; font-size: 7px; font-weight: 700;
            color: ${AURA.green};
        }
        .tp-polling-text { flex: 1; min-width: 0; }
        .tp-polling-title {
            font-size: 9px; font-weight: 700; letter-spacing: .16em;
            text-transform: uppercase; color: ${AURA.green}; margin: 0;
        }
        .tp-polling-sub {
            font-size: 11px; font-weight: 300; color: ${t.textSec}; margin: 2px 0 0;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tp-polling-toggle {
            flex-shrink: 0; border-radius: 100px; cursor: pointer;
            font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600;
            letter-spacing: .14em; text-transform: uppercase; transition: all .25s;
            padding: 8px 14px; white-space: nowrap;
        }

        /* ── Navegador de semana ── */
        .tp-week-nav {
            display: flex; align-items: center; gap: 10px;
            margin-bottom: 18px; flex-wrap: wrap;
        }
        .tp-week-box {
            display: flex; align-items: center; gap: 2px;
            background: ${t.bgEl}; border: 1px solid ${t.border};
            border-radius: 12px; padding: 4px 6px;
            backdrop-filter: blur(20px);
        }
        .tp-week-btn {
            background: none; border: none; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            width: 30px; height: 30px; border-radius: 8px;
            color: ${t.textMuted}; transition: all .2s;
        }
        .tp-week-btn:hover:not(:disabled) { background: ${t.hoverBg}; color: ${AURA.gold}; }
        .tp-week-btn:disabled { opacity: .3; cursor: default; }
        .tp-week-label {
            display: flex; align-items: center; gap: 7px;
            font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500;
            letter-spacing: .04em; color: ${t.text};
            min-width: 130px; justify-content: center;
            cursor: pointer; padding: 6px 10px; border-radius: 8px;
            background: none; border: none; transition: background .2s;
        }
        .tp-week-label:hover { background: ${t.hoverBg}; }
        .tp-week-hoje {
            font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600;
            letter-spacing: .14em; text-transform: uppercase;
            border-radius: 100px; cursor: pointer; transition: all .25s;
            padding: 8px 16px; white-space: nowrap;
            background: rgba(201,169,110,.08); border: 1px solid rgba(201,169,110,.25);
            color: ${AURA.gold};
        }
        .tp-week-hoje:hover { background: rgba(201,169,110,.16); }
        .tp-week-ant-tag {
            font-family: 'Inter', sans-serif; font-size: 8.5px; font-weight: 600;
            letter-spacing: .14em; text-transform: uppercase;
            background: rgba(253,184,19,.1); border: 1px solid rgba(253,184,19,.28);
            border-radius: 100px; padding: 6px 12px; color: ${AURA.yellow};
        }

        /* ── Date picker popup ── */
        .tp-picker-wrap { position: relative; }
        .tp-picker-popup {
            position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%);
            z-index: 999;
            background: ${t.bgEl}; border: 1px solid ${t.border};
            border-radius: 16px; padding: 16px 18px; min-width: 220px;
            box-shadow: 0 14px 44px rgba(0,0,0,${isDark ? ".5" : ".18"});
            backdrop-filter: blur(24px);
        }
        .tp-picker-label {
            font-size: 9px; font-weight: 600; letter-spacing: .18em;
            text-transform: uppercase; color: ${t.textMuted}; margin-bottom: 9px;
        }
        .tp-picker-input {
            width: 100%; font-family: 'Inter', sans-serif; font-size: 13px;
            border: 1px solid ${t.borderInput};
            border-radius: 10px; padding: 10px 12px; box-sizing: border-box;
            background: ${t.bgInput}; color: ${t.text}; outline: none;
            transition: border-color .25s;
        }
        .tp-picker-input:focus { border-color: rgba(201,169,110,.5); }
        .tp-picker-hint {
            font-size: 11px; font-weight: 300; color: ${t.textMuted};
            margin-top: 7px; text-align: center;
        }
        input[type="date"].tp-picker-input::-webkit-calendar-picker-indicator {
            filter: ${isDark ? "invert(1) opacity(.4)" : "opacity(.5)"}; cursor: pointer;
        }

        /* ── Filtros (mesmos botões-ghost do Dashboard) ── */
        .tp-filters {
            display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px;
        }
        .tp-filter-btn {
            display: inline-flex; align-items: center; gap: 6px;
            font-family: 'Inter', sans-serif; font-size: 9.5px; font-weight: 600;
            letter-spacing: .12em; text-transform: uppercase;
            border-radius: 100px; cursor: pointer; padding: 9px 16px;
            border: 1px solid; transition: all .25s; white-space: nowrap;
        }

        /* ── Linha de célula (igual ao member-row do Dashboard) ── */
        .tp-row {
            display: flex; align-items: center; justify-content: space-between;
            padding: 14px 20px; gap: 12px; flex-wrap: wrap;
            border-bottom: 1px solid ${t.border};
            transition: background .2s;
        }
        .tp-row:last-child { border-bottom: none; }
        .tp-row:hover { background: ${t.hoverBg}; }

        .tp-avatar {
            width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Playfair Display', serif; font-weight: 700; font-size: 16px;
        }
        .tp-row-info { flex: 1; min-width: 0; }
        .tp-row-name {
            font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 500;
            color: ${t.text}; margin: 0;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .tp-row-sub {
            display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 3px;
        }
        .tp-row-sub-item {
            display: flex; align-items: center; gap: 5px;
            font-size: 12px; font-weight: 300; color: ${t.textSec};
        }

        .tp-badges {
            display: flex; flex-direction: column; gap: 6px;
            align-items: flex-end; flex-shrink: 0;
        }
        @media (max-width: 560px) {
            .tp-badges { align-items: flex-start; flex-direction: row; flex-wrap: wrap; width: 100%; }
        }

        .tp-badge {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 5px 12px; border-radius: 99px;
            font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600;
            letter-spacing: .1em; text-transform: uppercase; white-space: nowrap;
            border: 1px solid;
        }

        /* ── Botão de atualizar (mesmo dl-btn-ghost do Dashboard) ── */
        .tp-btn-ghost {
            display: flex; align-items: center; gap: 8px;
            padding: 10px 18px; border-radius: 100px;
            border: 1px solid ${t.border}; cursor: pointer;
            background: transparent; color: ${t.textSec};
            font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
            letter-spacing: .14em; text-transform: uppercase; transition: all .3s;
        }
        .tp-btn-ghost:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

        /* ── Estado vazio / loading ── */
        .tp-empty {
            padding: 52px 20px; text-align: center;
        }
        .tp-loading {
            padding: 60px 20px; display: flex;
            flex-direction: column; align-items: center; gap: 16px;
        }

        /* ── Responsivo geral ── */
        @media (max-width: 480px) {
            .tp-card-head { padding: 14px 16px; }
            .tp-row { padding: 12px 16px; }
            .tp-kpi-card { padding: 12px; }
        }
    `;

    return (
        <div className="tp-root">
            <style>{globalStyles}</style>

            {/* ── Título ── */}
            <motion.div
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}
            >
                <div>
                    <p className="tp-eyebrow">IEQ Pituaçu · Painel Pastoral</p>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(18px,4.4vw,24px)", fontWeight: 500, color: t.text, margin: 0, lineHeight: 1.2, letterSpacing: ".02em" }}>
                        Pendências <span style={{ color: AURA.gold }}>· da Semana</span>
                    </h2>
                </div>
                <button className="tp-btn-ghost" onClick={handleAtualizar}>
                    <RefreshCw size={13} className={loading ? "tp-spin" : ""} />
                    Atualizar
                </button>
            </motion.div>

            {/* ── Barra de polling AO VIVO ── */}
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .05 }}>
                <div className="tp-polling-bar">
                    {/* Ponto verde pulsando */}
                    <div className="tp-live-dot tp-live" />

                    {/* Anel de countdown */}
                    <div className="tp-countdown-ring">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(18,160,96,.15)" strokeWidth="2.5" />
                            <circle
                                cx="12" cy="12" r="9" fill="none"
                                stroke={AURA.green} strokeWidth="2.5"
                                strokeDasharray="57"
                                strokeDashoffset={ringOffset}
                                style={{ transition: "stroke-dashoffset .9s linear" }}
                            />
                        </svg>
                        <div className="tp-countdown-num">{countdown}</div>
                    </div>

                    {/* Texto */}
                    <div className="tp-polling-text">
                        <p className="tp-polling-title">Ao Vivo — Atualização Automática</p>
                        {ultimaAttLabel && (
                            <p className="tp-polling-sub">
                                Última atualização às {ultimaAttLabel} · próxima em {countdown}s
                            </p>
                        )}
                    </div>

                    {/* Toggle pausar/retomar */}
                    <button
                        className="tp-polling-toggle"
                        onClick={() => { setPollingAtivo(v => !v); if (!pollingAtivo) setCountdown(POLLING_INTERVAL); }}
                        style={{
                            background: pollingAtivo ? "rgba(18,160,96,.12)" : `rgba(200,16,46,.1)`,
                            border:     `1px solid ${pollingAtivo ? "rgba(18,160,96,.3)" : "rgba(200,16,46,.3)"}`,
                            color:      pollingAtivo ? AURA.green : AURA.redLight,
                        }}
                    >
                        {pollingAtivo ? "Pausar" : "Retomar"}
                    </button>
                </div>
            </motion.div>

            {/* ── KPIs ── */}
            <motion.div
                className="tp-kpi-grid"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .08 }}
            >
                {[
                    { label: "AMBAS PENDENTES",  val: totalAmbas,       color: AURA.redLight, sub: "rel. + discip.",    Icon: AlertTriangle  },
                    { label: "SEM RELATÓRIO",     val: totalRelatorio,   color: AURA.yellow,   sub: "sem lançamento",   Icon: FileText       },
                    { label: "SEM DISCIPULADO",   val: totalDiscipulado, color: AURA.blueFade, sub: "sem registro",     Icon: BookOpen       },
                    { label: "EM DIA",            val: totalEmDia,       color: AURA.teal,     sub: "tudo lançado",     Icon: CheckCircle2   },
                ].map(({ label, val, color, sub, Icon }) => (
                    <div key={label} className="tp-kpi-card">
                        <div className="tp-kpi-stripe" style={{ background: color }} />
                        <div className="tp-kpi-icon" style={{ background: `${color}18`, color }}>
                            <Icon size={17} />
                        </div>
                        <div className="tp-kpi-label">{label}</div>
                        <div className="tp-kpi-value" style={{ color }}>
                            {loading ? "—" : val}
                        </div>
                        <div className="tp-kpi-sub">{sub}</div>
                    </div>
                ))}
            </motion.div>

            {/* ── Navegador de semana ── */}
            <motion.div
                className="tp-week-nav"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .1 }}
            >
                <div className="tp-week-box">
                    <button className="tp-week-btn" onClick={() => navSemana(-1)} title="Semana anterior">
                        <ChevronLeft size={16} />
                    </button>

                    <div className="tp-picker-wrap" ref={pickerRef}>
                        <button className="tp-week-label" onClick={() => setShowPicker(v => !v)}>
                            <CalendarDays size={13} style={{ color: AURA.gold, flexShrink: 0 }} />
                            {labelSemana(semanaRef)}
                        </button>
                        <AnimatePresence>
                            {showPicker && (
                                <motion.div
                                    className="tp-picker-popup"
                                    initial={{ opacity: 0, y: -6, scale: .97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: .97 }}
                                    transition={{ duration: .16 }}
                                >
                                    <p className="tp-picker-label">Escolha qualquer dia da semana</p>
                                    <input
                                        type="date"
                                        className="tp-picker-input"
                                        max={toISO(hoje)}
                                        defaultValue={toISO(semanaRef)}
                                        onChange={(e) => {
                                            if (!e.target.value) return;
                                            setSemanaRef(inicioSemana(new Date(e.target.value + "T12:00:00")));
                                            setShowPicker(false);
                                        }}
                                    />
                                    <p className="tp-picker-hint">A semana vai de domingo a sábado.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button className="tp-week-btn" onClick={() => navSemana(1)} disabled={ehSemanaAtual} title="Próxima semana">
                        <ChevronRight size={16} />
                    </button>
                </div>

                <AnimatePresence>
                    {!ehSemanaAtual && (
                        <motion.button
                            className="tp-week-hoje"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            onClick={() => setSemanaRef(semanaAtual)}
                        >
                            Semana Atual
                        </motion.button>
                    )}
                </AnimatePresence>

                {!ehSemanaAtual && (
                    <span className="tp-week-ant-tag">Semana anterior</span>
                )}
            </motion.div>

            {/* ── Filtros ── */}
            <motion.div
                className="tp-filters"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: .12 }}
            >
                {[
                    { key: "TODAS",       label: "Todas",            color: AURA.gold      },
                    { key: "PENDENTES",   label: "Com Pendência",    color: AURA.redLight  },
                    { key: "AMBAS",       label: "Ambas Falhas",     color: AURA.redLight  },
                    { key: "RELATORIO",   label: "Sem Relatório",    color: AURA.yellow    },
                    { key: "DISCIPULADO", label: "Sem Discipulado",  color: AURA.blueFade  },
                    { key: "EM_DIA",      label: "Em Dia",           color: AURA.teal      },
                ].map(({ key, label, color }) => {
                    const ativo = filtro === key;
                    return (
                        <button
                            key={key}
                            className="tp-filter-btn"
                            onClick={() => setFiltro(key)}
                            style={{
                                background:  ativo ? color : "transparent",
                                color:       ativo ? (key === "RELATORIO" ? AURA.dark : "#fff") : t.textSec,
                                borderColor: ativo ? color : t.border,
                                boxShadow:   ativo ? `0 4px 14px ${color}30` : "none",
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </motion.div>

            {/* ── Lista de células ── */}
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .14 }}
            >
                <div className="tp-card">
                    {/* Cabeçalho do card */}
                    <div className="tp-card-head">
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                                background: `linear-gradient(135deg,${AURA.redDark},${AURA.red})`,
                                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                            }}>
                                <ClipboardList size={18} />
                            </div>
                            <div>
                                <h3 className="tp-card-title">Células — Visão Geral</h3>
                                <p className="tp-card-sub">
                                    {loading ? "carregando…" : `${celulasFiltradas.length} célula(s) · ${labelSemana(semanaRef)}`}
                                </p>
                            </div>
                        </div>

                        {/* Legenda de badges */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span className="tp-badge" style={{ color: AURA.redLight, borderColor: `${AURA.redLight}35`, background: `${AURA.redLight}10` }}>
                                <FileText size={10} /> Relatório Semanal
                            </span>
                            <span className="tp-badge" style={{ color: AURA.blueFade, borderColor: `${AURA.blueFade}35`, background: `${AURA.blueFade}10` }}>
                                <BookOpen size={10} /> Discipulado
                            </span>
                        </div>
                    </div>

                    {/* Corpo */}
                    {loading ? (
                        <div className="tp-loading">
                            <Loader2 size={28} className="tp-spin" style={{ color: AURA.red }} />
                            <p className="tp-eyebrow" style={{ color: t.textMuted, margin: 0 }}>
                                CARREGANDO PENDÊNCIAS…
                            </p>
                        </div>
                    ) : erro ? (
                        <div className="tp-empty">
                            <AlertTriangle size={30} style={{ color: AURA.red, marginBottom: 12 }} />
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: AURA.red, margin: 0 }}>
                                {erro}
                            </p>
                        </div>
                    ) : celulasFiltradas.length === 0 ? (
                        <div className="tp-empty">
                            <CheckCircle2 size={32} style={{ color: AURA.teal, marginBottom: 12 }} />
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: AURA.teal, margin: "0 0 6px" }}>
                                NENHUM RESULTADO
                            </p>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 13, color: t.textSec, margin: 0, fontStyle: "italic" }}>
                                Nenhuma célula encontrada para este filtro.
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {celulasFiltradas.map((p, i) => {
                                const emDia  = !p.relatorioPendente && !p.discipuladoPendente;
                                const ambas  = p.relatorioPendente && p.discipuladoPendente;

                                /* cor / avatar baseados no status */
                                const avatarColor = emDia ? AURA.teal
                                    : ambas           ? AURA.redLight
                                        : p.relatorioPendente ? AURA.yellow
                                            : AURA.blueFade;

                                const avatarBg = emDia
                                    ? "linear-gradient(135deg,rgba(93,202,165,.18),rgba(93,202,165,.08))"
                                    : ambas
                                        ? `linear-gradient(135deg,${AURA.redDark},${AURA.red})`
                                        : p.relatorioPendente
                                            ? "linear-gradient(135deg,rgba(253,184,19,.18),rgba(253,184,19,.08))"
                                            : "linear-gradient(135deg,rgba(0,61,165,.18),rgba(0,61,165,.08))";

                                const avatarTextColor = ambas ? "#fff" : avatarColor;

                                return (
                                    <motion.div
                                        key={p.idCelula}
                                        className="tp-row"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(i, 10) * 0.04 }}
                                    >
                                        {/* Avatar + info */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                                            <div className="tp-avatar" style={{ background: avatarBg, color: avatarTextColor, border: `1px solid ${avatarColor}30` }}>
                                                {p.nomeCelula?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="tp-row-info">
                                                <p className="tp-row-name">{p.nomeCelula}</p>
                                                <div className="tp-row-sub">
                                                    <span className="tp-row-sub-item">
                                                        <User size={12} style={{ color: AURA.gold, flexShrink: 0 }} />
                                                        {p.nomeLider}
                                                    </span>
                                                    {p.bairro && (
                                                        <span className="tp-row-sub-item">
                                                            <MapPin size={12} style={{ color: AURA.gold, flexShrink: 0 }} />
                                                            {p.bairro}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Badges de status */}
                                        <div className="tp-badges">
                                            {p.relatorioPendente ? (
                                                <span className="tp-badge" style={{ color: AURA.redLight, borderColor: `${AURA.redLight}35`, background: `${AURA.redLight}10` }}>
                                                    <FileText size={10} /> Relatório: pendente
                                                </span>
                                            ) : (
                                                <span className="tp-badge" style={{ color: AURA.teal, borderColor: "rgba(93,202,165,.3)", background: "rgba(93,202,165,.1)" }}>
                                                    <CheckCircle2 size={10} /> Relatório: ok
                                                </span>
                                            )}
                                            {p.discipuladoPendente ? (
                                                <span className="tp-badge" style={{ color: AURA.blueFade, borderColor: `${AURA.blueFade}35`, background: `${AURA.blueFade}10` }}>
                                                    <BookOpen size={10} /> Discipulado: pendente
                                                </span>
                                            ) : (
                                                <span className="tp-badge" style={{ color: AURA.teal, borderColor: "rgba(93,202,165,.3)", background: "rgba(93,202,165,.1)" }}>
                                                    <CheckCircle2 size={10} /> Discipulado: ok
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>

            {/* ── Rodapé ── */}
            <div style={{ height: 1, background: `linear-gradient(90deg,transparent,rgba(201,169,110,.2),transparent)`, margin: "4px 0 0" }} />
            <p style={{ textAlign: "center", fontSize: 9, fontWeight: 500, letterSpacing: ".18em", textTransform: "uppercase", color: isDark ? "rgba(245,240,232,.12)" : "rgba(26,16,8,.15)", padding: "14px 0 0" }}>
                © IEQ Pituaçu — Sistema Eclesiástico {new Date().getFullYear()}
            </p>
        </div>
    );
}
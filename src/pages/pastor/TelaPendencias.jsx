/* ============================================================
   TelaPendencias.jsx  —  COM POLLING AUTOMÁTICO

   MUDANÇAS vs versão original:
   1. Polling a cada 60s — atualiza automaticamente
   2. Indicador visual "AO VIVO" pulsando
   3. Contador regressivo mostrando próxima atualização
   4. Polling pausa quando a aba está oculta (Page Visibility API)
   5. Polling reseta ao trocar de semana ou filtro
   ============================================================ */

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
    AlertTriangle, CheckCircle2, RefreshCw, Loader2,
    FileText, BookOpen, MapPin, User, ClipboardList,
    CalendarDays, ChevronLeft, ChevronRight, Radio,
} from "lucide-react";
import TelaCarregando from "../../components/TelaCarregando.jsx";

const IEQ = {
    red:        "#C8102E",
    redDark:    "#8B0B1F",
    redLight:   "#E8294A",
    yellow:     "#FDB813",
    yellowDark: "#C48C00",
    blue:       "#003DA5",
    blueDark:   "#002470",
    blueLight:  "#1A56C4",
    offWhite:   "#F5F0E8",
    dark:       "#0A0608",
};

const POLLING_INTERVAL = 60; // segundos

const inicioSemana = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
};

const toISO = (d) => d.toISOString().split("T")[0];

const formatarSemana = (inicio, fim) => {
    const fmt = (d) => { const [, m, dia] = d.split("-"); return `${dia}/${m}`; };
    return `${fmt(inicio)} – ${fmt(fim)}`;
};

const labelSemana = (inicioDate) => {
    const fimDate = new Date(inicioDate);
    fimDate.setDate(fimDate.getDate() + 6);
    return formatarSemana(toISO(inicioDate), toISO(fimDate));
};

export default function TelaPendencias({ isDark = false }) {
    const hoje        = new Date();
    const semanaAtual = inicioSemana(hoje);

    const [semanaRef,   setSemanaRef]   = useState(semanaAtual);
    const [celulas,     setCelulas]     = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [erro,        setErro]        = useState("");
    const [filtro,      setFiltro]      = useState("TODAS");
    const [showPicker,  setShowPicker]  = useState(false);
    const [pickerPos,   setPickerPos]   = useState({ top: 0, left: 0 });

    // ── POLLING ──────────────────────────────────────────────
    const [countdown,      setCountdown]      = useState(POLLING_INTERVAL);
    const [ultimaAtt,      setUltimaAtt]      = useState(null);   // horário da última atualização
    const [pollingAtivo,   setPollingAtivo]   = useState(true);
    const pollingTimerRef  = useRef(null);
    const countdownRef     = useRef(null);
    const semanaRefRef     = useRef(semanaRef); // ref para usar dentro do setInterval sem stale closure

    // mantém ref sincronizado com state
    useEffect(() => { semanaRefRef.current = semanaRef; }, [semanaRef]);

    const pickerRef = useRef(null);
    const labelRef  = useRef(null);

    const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
    const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

    useEffect(() => {
        const handler = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target))
                setShowPicker(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Função de carga (usada pelo polling e pelo manual) ──
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

    // ── Carga inicial ao montar / trocar semana ──
    useEffect(() => {
        carregar(semanaRef);
        // Reinicia o countdown ao trocar de semana
        setCountdown(POLLING_INTERVAL);
    }, [carregar, semanaRef]);

    // ── POLLING: tick a cada segundo, dispara carga a cada 60s ──
    useEffect(() => {
        // Para qualquer timer anterior
        clearInterval(pollingTimerRef.current);
        clearInterval(countdownRef.current);

        if (!pollingAtivo) return;

        // Countdown visual (decrementa 1 por segundo)
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    // Dispara a atualização silenciosa (sem spinner de loading)
                    carregar(semanaRefRef.current, true);
                    return POLLING_INTERVAL; // reinicia
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(pollingTimerRef.current);
            clearInterval(countdownRef.current);
        };
    }, [pollingAtivo, carregar]);

    // ── Pausa o polling quando a aba fica oculta ──
    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.hidden) {
                setPollingAtivo(false);
            } else {
                // Volta para a aba: atualiza imediatamente e retoma polling
                carregar(semanaRefRef.current, true);
                setCountdown(POLLING_INTERVAL);
                setPollingAtivo(true);
            }
        };
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    }, [carregar]);

    // ── Atualização manual (botão ATUALIZAR) ──
    const handleAtualizar = () => {
        carregar(semanaRef);
        setCountdown(POLLING_INTERVAL); // reinicia contador
    };

    const navSemana = (delta) => {
        setSemanaRef(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() + delta * 7);
            return d;
        });
    };

    const ehSemanaAtual = toISO(semanaRef) === toISO(semanaAtual);

    const onPickDate = (e) => {
        if (!e.target.value) return;
        const picked = new Date(e.target.value + "T12:00:00");
        setSemanaRef(inicioSemana(picked));
        setShowPicker(false);
    };

    const abrirPicker = () => {
        if (labelRef.current) {
            const rect = labelRef.current.getBoundingClientRect();
            setPickerPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
        }
        setShowPicker(v => !v);
    };

    // ── FILTROS ──
    const celulasFiltradas = celulas.filter((p) => {
        const temRelatorio   = p.relatorioPendente;
        const temDiscipulado = p.discipuladoPendente;
        const emDia          = !temRelatorio && !temDiscipulado;

        if (filtro === "PENDENTES")   return temRelatorio || temDiscipulado;
        if (filtro === "AMBAS")       return temRelatorio && temDiscipulado;
        if (filtro === "RELATORIO")   return temRelatorio && !temDiscipulado;
        if (filtro === "DISCIPULADO") return temDiscipulado && !temRelatorio;
        if (filtro === "EM_DIA")      return emDia;
        return true;
    });

    const totalAmbas       = celulas.filter(p => p.relatorioPendente && p.discipuladoPendente).length;
    const totalRelatorio   = celulas.filter(p => p.relatorioPendente).length;
    const totalDiscipulado = celulas.filter(p => p.discipuladoPendente).length;
    const totalEmDia       = celulas.filter(p => !p.relatorioPendente && !p.discipuladoPendente).length;
    const semanaLabel      = labelSemana(semanaRef);

    // Formata horário da última atualização
    const ultimaAttLabel = ultimaAtt
        ? ultimaAtt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : null;

    const globalStyles = `
    @keyframes spin        { to { transform:rotate(360deg); } }
    @keyframes livePulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.75)} }
    @keyframes countRing   { from{stroke-dashoffset:0} to{stroke-dashoffset:100} }

    .pend-card {
      background:${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius:14px; backdrop-filter:blur(24px);
    }
    .pend-row {
      display:flex; flex-wrap:wrap; align-items:center;
      justify-content:space-between; gap:14px; padding:18px 22px;
      border-bottom:1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.07)"};
      transition:background .2s;
    }
    .pend-row:hover { background:${isDark ? "rgba(200,16,46,.05)" : "rgba(200,16,46,.04)"}; }
    .pend-row:last-child { border-bottom:none; }

    .pend-badge {
      display:inline-flex; align-items:center; gap:5px;
      padding:5px 13px; border-radius:99px;
      font-family:'Cinzel',serif; font-size:8.5px; font-weight:700;
      letter-spacing:.12em; border:1px solid; white-space:nowrap;
    }
    .pend-avatar {
      width:42px; height:42px; border-radius:9px; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      font-family:'Cinzel',serif; font-weight:700; font-size:15px;
    }
    .pend-filtro-btn {
      font-family:'Cinzel',serif; font-size:9px; font-weight:700;
      letter-spacing:.16em; border-radius:8px; cursor:pointer;
      padding:9px 16px; border:1px solid; transition:all .2s;
    }
    .pend-kpi {
      background:${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius:14px; backdrop-filter:blur(24px);
      padding:18px 20px; display:flex; align-items:center; gap:14px;
    }
    .pend-status-group {
      display:flex; flex-direction:column; gap:6px;
      flex-shrink:0; align-items:flex-end;
    }
    .semana-nav {
      display:flex; align-items:center; gap:4px;
      background:${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.18)" : "rgba(200,16,46,.15)"};
      border-radius:10px; padding:5px 8px; backdrop-filter:blur(24px);
    }
    .semana-nav-btn {
      background:none; border:none; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      width:28px; height:28px; border-radius:6px;
      color:${textSecondary}; transition:all .2s;
    }
    .semana-nav-btn:hover {
      background:${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.08)"};
      color:${IEQ.red};
    }
    .semana-nav-btn:disabled { opacity:.3; cursor:default; }
    .semana-nav-btn:disabled:hover { background:none; color:${textSecondary}; }
    .semana-label-btn {
      display:flex; align-items:center; gap:6px;
      font-family:'Cinzel',serif; font-size:10px; font-weight:700;
      letter-spacing:.13em; color:${textPrimary};
      min-width:120px; justify-content:center;
      cursor:pointer; padding:5px 10px; border-radius:6px;
      background:none; border:none; transition:background .2s;
    }
    .semana-label-btn:hover {
      background:${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.07)"};
    }
    .semana-hoje-btn {
      font-family:'Cinzel',serif; font-size:8px; font-weight:700;
      letter-spacing:.14em; border-radius:6px; cursor:pointer;
      padding:5px 11px; border:1px solid ${IEQ.red}40;
      background:${IEQ.red}12; color:${IEQ.red}; transition:all .2s; white-space:nowrap;
    }
    .semana-hoje-btn:hover { background:${IEQ.red}22; }
    .date-picker-popup {
      position:fixed; z-index:9999;
      background:${isDark ? "rgba(12,6,9,.99)" : "#fff"};
      border:1px solid ${isDark ? "rgba(200,16,46,.22)" : "rgba(200,16,46,.18)"};
      border-radius:12px; padding:16px 18px; min-width:240px;
      box-shadow:0 14px 44px rgba(0,0,0,.28);
    }
    .date-picker-popup label {
      display:block; font-family:'Cinzel',serif; font-size:8px;
      font-weight:700; letter-spacing:.18em; color:${textSecondary}; margin-bottom:8px;
    }
    .date-picker-popup input[type=date] {
      width:100%; font-family:'Cinzel',serif; font-size:12px;
      border:1px solid ${isDark ? "rgba(200,16,46,.22)" : "rgba(200,16,46,.18)"};
      border-radius:8px; padding:9px 12px; box-sizing:border-box;
      background:${isDark ? "rgba(200,16,46,.06)" : "rgba(200,16,46,.04)"};
      color:${textPrimary}; outline:none;
    }
    .date-picker-popup input[type=date]:focus { border-color:${IEQ.red}80; }
    .date-picker-hint {
      font-family:'EB Garamond',serif; font-size:12px;
      color:${textSecondary}; margin-top:8px; text-align:center;
    }

    /* ── POLLING UI ── */
    .live-dot {
      width:7px; height:7px; border-radius:50%;
      background:#12A060; animation:livePulse 1.6s ease-in-out infinite;
      flex-shrink:0;
    }
    .polling-bar {
      display:flex; align-items:center; gap:10px;
      background:${isDark ? "rgba(18,160,96,.07)" : "rgba(18,160,96,.06)"};
      border:1px solid rgba(18,160,96,.2);
      border-radius:9px; padding:8px 14px;
    }
    .countdown-ring {
      position:relative; width:22px; height:22px; flex-shrink:0;
    }
    .countdown-ring svg {
      transform: rotate(-90deg);
    }
    .countdown-ring circle {
      fill:none; stroke-width:2.5;
    }
    .countdown-ring .track { stroke:rgba(18,160,96,.15); }
    .countdown-ring .fill  {
      stroke:#12A060;
      stroke-dasharray:57;
      transition:stroke-dashoffset .9s linear;
    }
    .countdown-num {
      position:absolute; inset:0;
      display:flex; align-items:center; justify-content:center;
      font-family:'Cinzel',serif; font-size:7px; font-weight:700;
      color:#12A060;
    }
  `;

    // Calcula o dashoffset do anel SVG (0 = cheio, 57 = vazio)
    const ringOffset = ((POLLING_INTERVAL - countdown) / POLLING_INTERVAL) * 57;

    return (
        <div style={{ color: textPrimary, fontFamily: "'EB Garamond',serif" }}>
            <style>{globalStyles}</style>

            {/* ── HEADER ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 14 }}>
                <div>
                    <h2 style={{
                        fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, letterSpacing: ".18em", margin: 0,
                        background: `linear-gradient(90deg,${IEQ.redDark},${IEQ.red},${IEQ.yellow},${IEQ.blue})`,
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>
                        PENDÊNCIAS DA SEMANA
                    </h2>
                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".2em", color: textSecondary, margin: "4px 0 0" }}>
                        RELATÓRIOS E DISCIPULADO
                    </p>
                </div>
                <button onClick={handleAtualizar} style={{
                    background: "none", border: `1px solid ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}`,
                    borderRadius: 8, padding: "9px 16px", cursor: "pointer", color: textSecondary,
                    display: "flex", alignItems: "center", gap: 8, fontFamily: "'Cinzel',serif",
                    fontSize: 9, letterSpacing: ".15em", transition: "all .2s",
                }}>
                    <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                    ATUALIZAR
                </button>
            </motion.div>

            {/* ── BARRA DE POLLING AO VIVO ── */}
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .02 }}
                        style={{ marginBottom: 16 }}>
                <div className="polling-bar">
                    {/* Ponto verde pulsando */}
                    <div className="live-dot" />

                    {/* Anel de countdown */}
                    <div className="countdown-ring">
                        <svg width="22" height="22" viewBox="0 0 22 22">
                            <circle className="track" cx="11" cy="11" r="9" />
                            <circle
                                className="fill"
                                cx="11" cy="11" r="9"
                                strokeDashoffset={ringOffset}
                            />
                        </svg>
                        <div className="countdown-num">{countdown}</div>
                    </div>

                    {/* Texto */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, fontWeight: 700, letterSpacing: ".14em", color: "#12A060", margin: 0 }}>
                            AO VIVO — ATUALIZAÇÃO AUTOMÁTICA
                        </p>
                        {ultimaAttLabel && (
                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: textSecondary, margin: "2px 0 0" }}>
                                Última atualização às {ultimaAttLabel} · próxima em {countdown}s
                            </p>
                        )}
                    </div>

                    {/* Toggle pausar/retomar */}
                    <button
                        onClick={() => {
                            setPollingAtivo(v => !v);
                            if (!pollingAtivo) setCountdown(POLLING_INTERVAL);
                        }}
                        style={{
                            background: pollingAtivo ? "rgba(18,160,96,.12)" : `${IEQ.red}12`,
                            border: `1px solid ${pollingAtivo ? "rgba(18,160,96,.3)" : `${IEQ.red}30`}`,
                            borderRadius: 6, padding: "5px 12px", cursor: "pointer",
                            fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 700,
                            letterSpacing: ".14em", color: pollingAtivo ? "#12A060" : IEQ.red,
                            transition: "all .2s", whiteSpace: "nowrap", flexShrink: 0,
                        }}
                    >
                        {pollingAtivo ? "PAUSAR" : "RETOMAR"}
                    </button>
                </div>
            </motion.div>

            {/* ── NAVEGADOR DE SEMANA ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .04 }}
                        style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap", position: "relative", zIndex: 10 }}>
                <div className="semana-nav">
                    <button className="semana-nav-btn" onClick={() => navSemana(-1)} title="Semana anterior">
                        <ChevronLeft size={15} />
                    </button>
                    <div style={{ position: "relative" }} ref={pickerRef}>
                        <button className="semana-label-btn" ref={labelRef} onClick={abrirPicker}>
                            <CalendarDays size={12} style={{ color: IEQ.red, flexShrink: 0 }} />
                            {semanaLabel}
                        </button>
                        <AnimatePresence>
                            {showPicker && (
                                <motion.div className="date-picker-popup"
                                            style={{ top: pickerPos.top, left: pickerPos.left, transform: "translateX(-50%)" }}
                                            initial={{ opacity: 0, y: -6, scale: .97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -6, scale: .97 }}
                                            transition={{ duration: .16 }}>
                                    <label>ESCOLHA QUALQUER DIA DA SEMANA</label>
                                    <input type="date" max={toISO(hoje)} defaultValue={toISO(semanaRef)} onChange={onPickDate} />
                                    <p className="date-picker-hint">A semana vai de domingo a sábado.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button className="semana-nav-btn" onClick={() => navSemana(1)} disabled={ehSemanaAtual} title="Próxima semana">
                        <ChevronRight size={15} />
                    </button>
                </div>
                <AnimatePresence>
                    {!ehSemanaAtual && (
                        <motion.button className="semana-hoje-btn"
                                       initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                                       onClick={() => setSemanaRef(semanaAtual)}>
                            SEMANA ATUAL
                        </motion.button>
                    )}
                </AnimatePresence>
                {!ehSemanaAtual && (
                    <span style={{
                        fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".14em",
                        color: IEQ.yellowDark, background: `${IEQ.yellow}18`,
                        border: `1px solid ${IEQ.yellow}40`, borderRadius: 6, padding: "4px 10px",
                    }}>SEMANA ANTERIOR</span>
                )}
            </motion.div>

            {/* ── KPIs ── */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}
                        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 20 }}>
                {[
                    { label: "AMBAS PENDENTES", value: totalAmbas,       color: IEQ.red,        icon: <AlertTriangle size={18} /> },
                    { label: "SEM RELATÓRIO",   value: totalRelatorio,   color: IEQ.yellowDark, icon: <FileText size={18} />      },
                    { label: "SEM DISCIPULADO", value: totalDiscipulado, color: IEQ.blue,       icon: <BookOpen size={18} />      },
                    { label: "EM DIA",          value: totalEmDia,       color: "#12A060",      icon: <CheckCircle2 size={18} />  },
                ].map(({ label, value, color, icon }) => (
                    <div key={label} className="pend-kpi">
                        <div style={{
                            width: 42, height: 42, borderRadius: 10, background: `${color}18`,
                            display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0,
                        }}>{icon}</div>
                        <div>
                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".18em", color: textSecondary, margin: 0 }}>{label}</p>
                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 26, fontWeight: 700, color: textPrimary, margin: 0, lineHeight: 1.1 }}>
                                {loading ? "—" : value}
                            </p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* ── FILTROS ── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .12 }}
                        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                {[
                    { key: "TODAS",       label: "TODAS"           },
                    { key: "PENDENTES",   label: "COM PENDÊNCIA"   },
                    { key: "AMBAS",       label: "AMBAS FALHAS"    },
                    { key: "RELATORIO",   label: "SEM RELATÓRIO"   },
                    { key: "DISCIPULADO", label: "SEM DISCIPULADO" },
                    { key: "EM_DIA",      label: "EM DIA"          },
                ].map(({ key, label }) => {
                    const ativo   = filtro === key;
                    const isEmDia = key === "EM_DIA";
                    return (
                        <button key={key} className="pend-filtro-btn" onClick={() => setFiltro(key)}
                                style={{
                                    background:  ativo ? (isEmDia ? "linear-gradient(135deg,#0e7a4a,#12A060)" : `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`) : "transparent",
                                    color:       ativo ? "#fff" : textSecondary,
                                    borderColor: ativo ? (isEmDia ? "#12A060" : IEQ.red) : (isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"),
                                }}>
                            {label}
                        </button>
                    );
                })}
            </motion.div>

            {/* ── LISTA ── */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }}>
                <div className="pend-card" style={{ overflow: "hidden" }}>

                    {/* cabeçalho */}
                    <div style={{
                        padding: "18px 22px",
                        borderBottom: `1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"}`,
                        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 8,
                                background: `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`,
                                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                            }}>
                                <ClipboardList size={16} />
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".15em", margin: 0, color: textPrimary }}>
                                    CÉLULAS — VISÃO GERAL
                                </p>
                                <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textSecondary, margin: 0 }}>
                                    {loading ? "carregando..." : `${celulasFiltradas.length} célula(s) · ${semanaLabel}`}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span className="pend-badge" style={{ color: IEQ.red, borderColor: `${IEQ.red}30`, background: `${IEQ.red}10` }}>
                                <FileText size={10} /> RELATÓRIO SEMANAL
                            </span>
                            <span className="pend-badge" style={{ color: IEQ.blue, borderColor: `${IEQ.blue}30`, background: `${IEQ.blue}10` }}>
                                <BookOpen size={10} /> DISCIPULADO
                            </span>
                        </div>
                    </div>

                    {/* corpo */}
                    {loading ? (
                        <TelaCarregando isDark={isDark} minHeight="40vh" background="transparent" />
                    ) : erro ? (
                        <div style={{ padding: 40, textAlign: "center" }}>
                            <AlertTriangle size={28} style={{ color: IEQ.red, margin: "0 auto 10px" }} />
                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".16em", color: IEQ.red }}>{erro}</p>
                        </div>
                    ) : celulasFiltradas.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ padding: "52px 20px", textAlign: "center" }}>
                            <CheckCircle2 size={36} style={{ color: "#12A060", margin: "0 auto 12px" }} />
                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: ".18em", color: "#12A060", margin: 0 }}>
                                NENHUM RESULTADO
                            </p>
                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: textSecondary, marginTop: 6 }}>
                                Nenhuma célula encontrada para este filtro.
                            </p>
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {celulasFiltradas.map((p, i) => {
                                const ambas  = p.relatorioPendente && p.discipuladoPendente;
                                const emDia  = !p.relatorioPendente && !p.discipuladoPendente;

                                const avatarBg = emDia
                                    ? "linear-gradient(135deg,#0e7a4a,#12A060)"
                                    : ambas
                                        ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`
                                        : p.relatorioPendente
                                            ? `linear-gradient(135deg,${IEQ.yellowDark},${IEQ.yellow})`
                                            : `linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})`;

                                const avatarColor = p.relatorioPendente && !p.discipuladoPendente ? "#1A0A0D" : "#fff";

                                return (
                                    <motion.div key={p.idCelula}
                                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className="pend-row">

                                        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                                            <div className="pend-avatar" style={{ background: avatarBg, color: avatarColor }}>
                                                {p.nomeCelula?.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{
                                                    fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700,
                                                    letterSpacing: ".1em", color: textPrimary, margin: 0,
                                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                }}>
                                                    {p.nomeCelula}
                                                </p>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 3 }}>
                                                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'EB Garamond',serif", fontSize: 13, color: textSecondary }}>
                                                        <User size={12} /> {p.nomeLider}
                                                    </span>
                                                    {p.bairro && (
                                                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'EB Garamond',serif", fontSize: 13, color: textSecondary }}>
                                                            <MapPin size={12} /> {p.bairro}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pend-status-group">
                                            {p.relatorioPendente ? (
                                                <span className="pend-badge" style={{ color: IEQ.red, borderColor: `${IEQ.red}35`, background: `${IEQ.red}12` }}>
                                                    <FileText size={10} /> RELATÓRIO SEMANAL: PENDENTE
                                                </span>
                                            ) : (
                                                <span className="pend-badge" style={{ color: "#12A060", borderColor: "rgba(18,160,96,.3)", background: "rgba(18,160,96,.1)" }}>
                                                    <CheckCircle2 size={10} /> RELATÓRIO SEMANAL: OK
                                                </span>
                                            )}
                                            {p.discipuladoPendente ? (
                                                <span className="pend-badge" style={{ color: IEQ.blue, borderColor: `${IEQ.blue}35`, background: `${IEQ.blue}12` }}>
                                                    <BookOpen size={10} /> DISCIPULADO: PENDENTE
                                                </span>
                                            ) : (
                                                <span className="pend-badge" style={{ color: "#12A060", borderColor: "rgba(18,160,96,.3)", background: "rgba(18,160,96,.1)" }}>
                                                    <CheckCircle2 size={10} /> DISCIPULADO: OK
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
        </div>
    );
}
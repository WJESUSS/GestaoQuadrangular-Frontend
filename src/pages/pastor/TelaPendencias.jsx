import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
    AlertTriangle, CheckCircle2, RefreshCw,
    FileText, BookOpen, MapPin, User, ClipboardList,
    CalendarDays, ChevronLeft, ChevronRight,
} from "lucide-react";
import TelaCarregando from "../../components/TelaCarregando.jsx";
import { AURA, theme } from "../heroTheme";

const POLLING_INTERVAL = 60;

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
    const t           = theme(isDark);

    const [semanaRef,   setSemanaRef]   = useState(semanaAtual);
    const [celulas,     setCelulas]     = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [erro,        setErro]        = useState("");
    const [filtro,      setFiltro]      = useState("TODAS");
    const [showPicker,  setShowPicker]  = useState(false);
    const [pickerPos,   setPickerPos]   = useState({ top: 0, left: 0 });

    const [countdown,      setCountdown]      = useState(POLLING_INTERVAL);
    const [ultimaAtt,      setUltimaAtt]      = useState(null);
    const [pollingAtivo,   setPollingAtivo]   = useState(true);
    const pollingTimerRef  = useRef(null);
    const countdownRef     = useRef(null);
    const semanaRefRef     = useRef(semanaRef);

    useEffect(() => { semanaRefRef.current = semanaRef; }, [semanaRef]);

    const pickerRef = useRef(null);
    const labelRef  = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target))
                setShowPicker(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

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

    useEffect(() => {
        clearInterval(pollingTimerRef.current);
        clearInterval(countdownRef.current);

        if (!pollingAtivo) return;

        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    carregar(semanaRefRef.current, true);
                    return POLLING_INTERVAL;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(pollingTimerRef.current);
            clearInterval(countdownRef.current);
        };
    }, [pollingAtivo, carregar]);

    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.hidden) {
                setPollingAtivo(false);
            } else {
                carregar(semanaRefRef.current, true);
                setCountdown(POLLING_INTERVAL);
                setPollingAtivo(true);
            }
        };
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    }, [carregar]);

    const handleAtualizar = () => {
        carregar(semanaRef);
        setCountdown(POLLING_INTERVAL);
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
    const totalPendentes   = celulas.filter(p => p.relatorioPendente || p.discipuladoPendente).length;
    const semanaLabel      = labelSemana(semanaRef);

    const ultimaAttLabel = ultimaAtt
        ? ultimaAtt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : null;

    const ringOffset = ((POLLING_INTERVAL - countdown) / POLLING_INTERVAL) * 57;

    const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

    @keyframes pend-spin { to { transform: rotate(360deg); } }
    @keyframes pend-live { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.35;transform:scale(.7);} }

    .pend-shell { display:flex; flex-direction:column; gap:16px; font-family:'Inter',sans-serif; color:${t.text}; }

    .pend-eyebrow {
      font-family:'Inter',sans-serif; font-size:9px; font-weight:600;
      letter-spacing:.2em; text-transform:uppercase; color:${t.gold}; margin:0 0 5px;
    }
    .pend-title {
      font-family:'Playfair Display',serif; font-size:clamp(19px,3vw,25px);
      font-weight:500; color:${t.text}; margin:0; line-height:1.15; letter-spacing:.01em;
    }
    .pend-sub {
      font-family:'Inter',sans-serif; font-size:12.5px; font-weight:300;
      color:${t.textMuted}; margin:6px 0 0;
    }

    .pend-btn {
      display:inline-flex; align-items:center; gap:7px;
      padding:9px 16px; border-radius:100px; cursor:pointer;
      background:${t.bgEl}; border:1px solid ${t.border};
      color:${t.textSec}; font-family:'Inter',sans-serif; font-size:10.5px;
      font-weight:600; letter-spacing:.1em; text-transform:uppercase;
      transition:all .22s;
    }
    .pend-btn:hover { border-color:${t.borderHov}; color:${t.gold}; background:${t.hoverBg}; }
    .pend-btn:focus-visible { outline:2px solid ${t.gold}; outline-offset:2px; }

    .pend-card {
      background:${t.bgEl}; border:1px solid ${t.border};
      border-radius:20px; overflow:hidden; position:relative;
    }
    .pend-card::before {
      content:''; position:absolute; top:0; left:0; right:0; height:1px;
      background:linear-gradient(90deg, transparent, ${isDark ? "rgba(217,174,94,.28)" : "rgba(184,137,46,.28)"}, transparent);
    }

    .pend-kpi {
      position:relative; overflow:hidden;
      display:flex; align-items:center; gap:14px;
      padding:17px 18px; border-radius:18px;
      background:${t.bgEl}; border:1px solid ${t.border};
      transition:transform .25s cubic-bezier(.4,0,.2,1), border-color .25s, box-shadow .25s;
    }
    .pend-kpi:hover { transform:translateY(-2px); border-color:${t.borderHov}; box-shadow:${t.shadow}; }
    .pend-kpi::after {
      content:''; position:absolute; inset:0 auto 0 0; width:3px;
      background:var(--kpi-color, ${t.gold}); opacity:.75;
    }
    .pend-kpi-icon {
      width:44px; height:44px; border-radius:13px; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
    }
    .pend-kpi-value {
      font-family:'Playfair Display',serif; font-size:28px; font-weight:600;
      color:${t.text}; line-height:1; margin:0;
    }
    .pend-kpi-label {
      font-family:'Inter',sans-serif; font-size:8.5px; font-weight:600;
      letter-spacing:.15em; text-transform:uppercase; color:${t.textMuted};
      margin:6px 0 0;
    }

    .pend-week {
      display:inline-flex; align-items:center; gap:2px;
      background:${t.bgEl}; border:1px solid ${t.border};
      border-radius:100px; padding:4px;
    }
    .pend-week-btn {
      width:32px; height:32px; border-radius:50%; border:none;
      background:transparent; color:${t.textMuted};
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; transition:all .2s;
    }
    .pend-week-btn:hover { background:${t.hoverBg}; color:${t.gold}; }
    .pend-week-btn:disabled { opacity:.28; cursor:default; }
    .pend-week-btn:disabled:hover { background:transparent; color:${t.textMuted}; }
    .pend-week-label {
      display:flex; align-items:center; gap:7px;
      font-family:'Playfair Display',serif; font-size:12.5px; font-weight:500;
      letter-spacing:.02em; color:${t.text}; background:none; border:none;
      cursor:pointer; padding:6px 12px; border-radius:100px; transition:background .2s;
      min-width:130px; justify-content:center;
    }
    .pend-week-label:hover { background:${t.hoverBg}; }
    .pend-today-btn {
      font-family:'Inter',sans-serif; font-size:9px; font-weight:600;
      letter-spacing:.12em; text-transform:uppercase; border-radius:100px;
      cursor:pointer; padding:8px 14px; color:${t.gold};
      border:1px solid ${t.borderHov}; background:${t.hoverBg}; transition:all .2s;
    }
    .pend-today-btn:hover { background:${isDark ? "rgba(217,174,94,.22)" : "rgba(184,137,46,.2)"}; }

    .pend-date-popup {
      position:fixed; z-index:9999; min-width:250px;
      background:${t.bgEl}; border:1px solid ${t.borderHov};
      border-radius:16px; padding:16px 18px;
      box-shadow:${t.shadow};
    }
    .pend-date-popup label {
      display:block; font-family:'Inter',sans-serif; font-size:8.5px;
      font-weight:600; letter-spacing:.16em; text-transform:uppercase;
      color:${t.textMuted}; margin-bottom:9px;
    }
    .pend-date-popup input[type=date] {
      width:100%; box-sizing:border-box; padding:10px 12px;
      font-family:'Inter',sans-serif; font-size:12.5px;
      border:1px solid ${t.borderInput}; border-radius:10px;
      background:${t.bgInput}; color:${t.text}; outline:none;
    }
    .pend-date-popup input[type=date]:focus { border-color:${t.gold}; }
    .pend-date-hint { font-family:'Inter',sans-serif; font-size:11px; color:${t.textMuted}; margin:9px 0 0; text-align:center; }

    .pend-filters { display:flex; flex-wrap:wrap; gap:8px; }
    .pend-chip {
      font-family:'Inter',sans-serif; font-size:9.5px; font-weight:600;
      letter-spacing:.08em; text-transform:uppercase;
      padding:9px 16px; border-radius:100px; cursor:pointer;
      background:transparent; border:1px solid ${t.border}; color:${t.textMuted};
      transition:all .22s; white-space:nowrap;
    }
    .pend-chip:hover { color:${t.text}; border-color:${t.borderHov}; background:${t.hoverBg}; }
    .pend-chip:focus-visible { outline:2px solid ${t.gold}; outline-offset:2px; }
    .pend-chip.active {
      color:#fff; border-color:transparent;
      background:linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue});
      box-shadow:0 4px 14px rgba(15,42,74,.25);
    }
    .pend-chip.active.green {
      background:linear-gradient(135deg, ${AURA.greenDark}, ${AURA.green});
      box-shadow:0 4px 14px rgba(30,122,70,.25);
    }

    .pend-live {
      display:flex; align-items:center; gap:10px;
      background:${t.bgEl}; border:1px solid ${t.border};
      border-radius:100px; padding:6px 8px 6px 15px;
    }
    .pend-live-dot {
      width:7px; height:7px; border-radius:50%; flex-shrink:0;
      background:${AURA.green}; animation:pend-live 1.8s ease-in-out infinite;
    }
    .pend-live-text {
      font-family:'Inter',sans-serif; font-size:9px; font-weight:600;
      letter-spacing:.12em; text-transform:uppercase; color:${t.textSec};
      white-space:nowrap;
    }
    .pend-live-toggle {
      border:none; cursor:pointer; border-radius:100px;
      padding:6px 12px; font-family:'Inter',sans-serif; font-size:8.5px;
      font-weight:600; letter-spacing:.1em; text-transform:uppercase;
      transition:all .2s; white-space:nowrap;
    }

    .pend-ring { position:relative; width:24px; height:24px; flex-shrink:0; }
    .pend-ring svg { transform:rotate(-90deg); }
    .pend-ring circle { fill:none; stroke-width:2.5; }
    .pend-ring .track { stroke:${isDark ? "rgba(255,255,255,.12)" : "rgba(15,42,74,.1)"}; }
    .pend-ring .fill  { stroke:${t.gold}; stroke-dasharray:57; transition:stroke-dashoffset .9s linear; }
    .pend-ring-num {
      position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
      font-family:'Inter',sans-serif; font-size:8px; font-weight:700; color:${t.gold};
    }

    .pend-list-head {
      display:flex; align-items:center; justify-content:space-between;
      flex-wrap:wrap; gap:12px; padding:18px 22px;
      border-bottom:1px solid ${t.border};
    }
    .pend-list-title { font-family:'Playfair Display',serif; font-size:16px; font-weight:500; color:${t.text}; margin:0; }
    .pend-list-sub { font-family:'Inter',sans-serif; font-size:11.5px; font-weight:300; color:${t.textMuted}; margin:3px 0 0; }

    .pend-row {
      display:grid; grid-template-columns:1fr auto; align-items:center;
      gap:16px; padding:15px 22px; border-bottom:1px solid ${t.border};
      transition:background .2s;
    }
    .pend-row:hover { background:${t.rowHov}; }
    .pend-row:last-child { border-bottom:none; }

    .pend-avatar {
      width:44px; height:44px; border-radius:13px; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      font-family:'Playfair Display',serif; font-weight:600; font-size:16px; color:#fff;
    }
    .pend-name {
      font-family:'Playfair Display',serif; font-size:14px; font-weight:500;
      color:${t.text}; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
    }
    .pend-meta {
      display:flex; align-items:center; gap:13px; flex-wrap:wrap;
      margin-top:4px; font-family:'Inter',sans-serif; font-size:11.5px;
      font-weight:300; color:${t.textMuted};
    }
    .pend-meta span { display:flex; align-items:center; gap:5px; }

    .pend-status { display:flex; flex-direction:column; gap:6px; align-items:flex-end; flex-shrink:0; }
    .pend-badge {
      display:inline-flex; align-items:center; gap:6px;
      padding:5px 11px; border-radius:100px; white-space:nowrap;
      font-family:'Inter',sans-serif; font-size:8.5px; font-weight:600;
      letter-spacing:.08em; text-transform:uppercase; border:1px solid;
    }

    .pend-empty { padding:56px 24px; text-align:center; }
    .pend-empty-title {
      font-family:'Playfair Display',serif; font-size:16px; font-weight:500;
      color:${t.text}; margin:0 0 4px;
    }
    .pend-empty-sub { font-family:'Inter',sans-serif; font-size:12.5px; font-weight:300; color:${t.textMuted}; margin:0; }

    @media (max-width:700px) {
      .pend-row { grid-template-columns:1fr; align-items:flex-start; gap:12px; }
      .pend-status { flex-direction:row; flex-wrap:wrap; align-items:flex-start; }
    }
    @media (max-width:520px) {
      .pend-head-top { flex-direction:column; align-items:flex-start; }
      .pend-kpi-value { font-size:24px; }
    }
    `;

    const KPIS = [
        { label: "Ambas pendentes", value: totalAmbas,       color: AURA.red,   icon: <AlertTriangle size={19} /> },
        { label: "Sem relatório",   value: totalRelatorio,   color: AURA.gold,  icon: <FileText size={19} />      },
        { label: "Sem discipulado", value: totalDiscipulado, color: AURA.blue,  icon: <BookOpen size={19} />      },
        { label: "Em dia",          value: totalEmDia,       color: AURA.green, icon: <CheckCircle2 size={19} />  },
    ];

    const FILTROS = [
        { key: "TODAS",       label: "Todas"          },
        { key: "PENDENTES",   label: "Com pendência"  },
        { key: "AMBAS",       label: "Ambas"          },
        { key: "RELATORIO",   label: "Sem relatório"  },
        { key: "DISCIPULADO", label: "Sem discipulado"},
        { key: "EM_DIA",      label: "Em dia"         },
    ];

    return (
        <div className="pend-shell">
            <style>{globalStyles}</style>

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="pend-head-top"
                        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                    <p className="pend-eyebrow">Pendências da semana</p>
                    <h2 className="pend-title">Relatórios &amp; Discipulado</h2>
                    <p className="pend-sub">
                        {loading ? "Carregando células…" : `${totalPendentes} de ${celulas.length} célula(s) com pendência · ${semanaLabel}`}
                    </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div className="pend-live">
                        <div className="pend-live-dot" />
                        <div className="pend-ring">
                            <svg width="24" height="24" viewBox="0 0 24 24">
                                <circle className="track" cx="12" cy="12" r="9" />
                                <circle className="fill" cx="12" cy="12" r="9" strokeDashoffset={ringOffset} />
                            </svg>
                            <div className="pend-ring-num">{countdown}</div>
                        </div>
                        <span className="pend-live-text">Ao vivo</span>
                        <button
                            className="pend-live-toggle"
                            onClick={() => {
                                setPollingAtivo(v => !v);
                                if (!pollingAtivo) setCountdown(POLLING_INTERVAL);
                            }}
                            style={{
                                background: pollingAtivo ? `${AURA.green}18` : `${AURA.red}14`,
                                border: `1px solid ${pollingAtivo ? `${AURA.green}40` : `${AURA.red}40`}`,
                                color: pollingAtivo ? AURA.green : AURA.red,
                            }}
                        >
                            {pollingAtivo ? "Pausar" : "Retomar"}
                        </button>
                    </div>

                    <button className="pend-btn" onClick={handleAtualizar} aria-label="Atualizar agora">
                        <RefreshCw size={13} style={{ animation: loading ? "pend-spin 1s linear infinite" : "none" }} />
                        Atualizar
                    </button>
                </div>
            </motion.div>

            {ultimaAttLabel && !loading && (
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 300, color: t.textMuted, margin: "-8px 0 0" }}>
                    Última atualização às {ultimaAttLabel}{pollingAtivo ? ` · próxima em ${countdown}s` : " · atualização automática pausada"}
                </p>
            )}

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .04 }}
                        style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", position: "relative", zIndex: 10 }}>
                <div className="pend-week">
                    <button className="pend-week-btn" onClick={() => navSemana(-1)} title="Semana anterior">
                        <ChevronLeft size={16} />
                    </button>
                    <div style={{ position: "relative" }} ref={pickerRef}>
                        <button className="pend-week-label" ref={labelRef} onClick={abrirPicker}>
                            <CalendarDays size={13} style={{ color: t.gold, flexShrink: 0 }} />
                            {semanaLabel}
                        </button>
                        <AnimatePresence>
                            {showPicker && (
                                <motion.div className="pend-date-popup"
                                            style={{ top: pickerPos.top, left: pickerPos.left, transform: "translateX(-50%)" }}
                                            initial={{ opacity: 0, y: -6, scale: .97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -6, scale: .97 }}
                                            transition={{ duration: .16 }}>
                                    <label>Escolha qualquer dia da semana</label>
                                    <input type="date" max={toISO(hoje)} defaultValue={toISO(semanaRef)} onChange={onPickDate} />
                                    <p className="pend-date-hint">A semana vai de domingo a sábado.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button className="pend-week-btn" onClick={() => navSemana(1)} disabled={ehSemanaAtual} title="Próxima semana">
                        <ChevronRight size={16} />
                    </button>
                </div>

                <AnimatePresence>
                    {!ehSemanaAtual && (
                        <motion.button className="pend-today-btn"
                                       initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                                       onClick={() => setSemanaRef(semanaAtual)}>
                            Semana atual
                        </motion.button>
                    )}
                </AnimatePresence>
                {!ehSemanaAtual && (
                    <span style={{
                        fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600,
                        letterSpacing: ".1em", textTransform: "uppercase",
                        color: AURA.gold, background: t.hoverBg,
                        border: `1px solid ${t.borderHov}`, borderRadius: 100, padding: "6px 12px",
                    }}>Semana anterior</span>
                )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}
                        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
                {KPIS.map(({ label, value, color, icon }) => (
                    <div key={label} className="pend-kpi" style={{ "--kpi-color": color }}>
                        <div className="pend-kpi-icon" style={{ background: `${color}14`, color }}>
                            {icon}
                        </div>
                        <div>
                            <p className="pend-kpi-value">{loading ? "–" : value}</p>
                            <p className="pend-kpi-label">{label}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .12 }}
                        className="pend-filters">
                {FILTROS.map(({ key, label }) => {
                    const ativo   = filtro === key;
                    const isEmDia = key === "EM_DIA";
                    return (
                        <button key={key}
                                className={`pend-chip${ativo ? " active" : ""}${ativo && isEmDia ? " green" : ""}`}
                                onClick={() => setFiltro(key)}>
                            {label}
                        </button>
                    );
                })}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }}>
                <div className="pend-card">
                    <div className="pend-list-head">
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                                background: `linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue})`,
                                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                            }}>
                                <ClipboardList size={17} />
                            </div>
                            <div>
                                <h3 className="pend-list-title">Células</h3>
                                <p className="pend-list-sub">
                                    {loading ? "carregando…" : `${celulasFiltradas.length} célula(s) · ${semanaLabel}`}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                            <span className="pend-badge" style={{ color: AURA.red, borderColor: `${AURA.red}35`, background: `${AURA.red}0f` }}>
                                <FileText size={10} /> Relatório
                            </span>
                            <span className="pend-badge" style={{ color: AURA.blue, borderColor: `${AURA.blue}35`, background: `${AURA.blue}0f` }}>
                                <BookOpen size={10} /> Discipulado
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <TelaCarregando isDark={isDark} minHeight="40vh" background="transparent" />
                    ) : erro ? (
                        <div style={{ padding: 44, textAlign: "center" }}>
                            <AlertTriangle size={30} style={{ color: AURA.red, margin: "0 auto 12px" }} />
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: ".06em", color: AURA.red, margin: 0 }}>{erro}</p>
                        </div>
                    ) : celulasFiltradas.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pend-empty">
                            <CheckCircle2 size={38} style={{ color: AURA.green, margin: "0 auto 14px" }} />
                            <p className="pend-empty-title">Nenhuma célula encontrada</p>
                            <p className="pend-empty-sub">Não há resultados para o filtro selecionado nesta semana.</p>
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {celulasFiltradas.map((p, i) => {
                                const ambas = p.relatorioPendente && p.discipuladoPendente;
                                const emDia = !p.relatorioPendente && !p.discipuladoPendente;

                                const avatarBg = emDia
                                    ? `linear-gradient(135deg, ${AURA.greenDark}, ${AURA.green})`
                                    : ambas
                                        ? `linear-gradient(135deg, ${AURA.redDark}, ${AURA.red})`
                                        : p.relatorioPendente
                                            ? `linear-gradient(135deg, ${AURA.goldDim}, ${AURA.gold})`
                                            : `linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue})`;

                                return (
                                    <motion.div key={p.idCelula}
                                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.035 }}
                                                className="pend-row">
                                        <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
                                            <div className="pend-avatar" style={{ background: avatarBg }}>
                                                {p.nomeCelula?.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p className="pend-name">{p.nomeCelula}</p>
                                                <div className="pend-meta">
                                                    <span><User size={12} /> {p.nomeLider}</span>
                                                    {p.bairro && <span><MapPin size={12} /> {p.bairro}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pend-status">
                                            {p.relatorioPendente ? (
                                                <span className="pend-badge" style={{ color: AURA.red, borderColor: `${AURA.red}35`, background: `${AURA.red}0f` }}>
                                                    <FileText size={10} /> Relatório pendente
                                                </span>
                                            ) : (
                                                <span className="pend-badge" style={{ color: AURA.green, borderColor: `${AURA.green}35`, background: `${AURA.green}0f` }}>
                                                    <CheckCircle2 size={10} /> Relatório ok
                                                </span>
                                            )}
                                            {p.discipuladoPendente ? (
                                                <span className="pend-badge" style={{ color: AURA.blue, borderColor: `${AURA.blue}35`, background: `${AURA.blue}0f` }}>
                                                    <BookOpen size={10} /> Discipulado pendente
                                                </span>
                                            ) : (
                                                <span className="pend-badge" style={{ color: AURA.green, borderColor: `${AURA.green}35`, background: `${AURA.green}0f` }}>
                                                    <CheckCircle2 size={10} /> Discipulado ok
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

/* ============================================================
   TelaPendencias.jsx
   src/pages/pastor/TelaPendencias.jsx
   ============================================================ */

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
    AlertTriangle, CheckCircle2, RefreshCw, Loader2,
    FileText, BookOpen, MapPin, User, ClipboardList,
    CalendarDays, ChevronLeft, ChevronRight,
} from "lucide-react";

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

// ── Retorna o domingo da semana de qualquer data ──────────────
// Exemplo: quarta dia 28 → domingo dia 24
const inicioSemana = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0=dom, 1=seg, ..., 6=sab
    d.setDate(d.getDate() - day); // recua até domingo
    d.setHours(0, 0, 0, 0);
    return d;
};

const toISO = (d) => d.toISOString().split("T")[0];

const formatarSemana = (inicio, fim) => {
    const fmt = (d) => { const [, m, dia] = d.split("-"); return `${dia}/${m}`; };
    return `${fmt(inicio)} – ${fmt(fim)}`;
};

// domingo + 6 dias = sábado
const labelSemana = (inicioDate) => {
    const fimDate = new Date(inicioDate);
    fimDate.setDate(fimDate.getDate() + 6);
    return formatarSemana(toISO(inicioDate), toISO(fimDate));
};

export default function TelaPendencias({ isDark = false }) {
    const hoje        = new Date();
    const semanaAtual = inicioSemana(hoje);

    const [semanaRef,  setSemanaRef]  = useState(semanaAtual);
    const [celulas,    setCelulas]    = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [erro,       setErro]       = useState("");
    const [filtro,     setFiltro]     = useState("TODAS");
    const [showPicker, setShowPicker] = useState(false);
    const [pickerPos,  setPickerPos]  = useState({ top: 0, left: 0 });
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

    const carregar = useCallback(async (semana) => {
        setLoading(true);
        setErro("");
        try {
            const res = await api.get("/pastor/pendencias", {
                params: { semanaInicio: toISO(semana), todas: true },
            });
            setCelulas(res.data);
        } catch (err) {
            setErro("Não foi possível carregar as células.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { carregar(semanaRef); }, [carregar, semanaRef]);

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

    // ── FILTROS ──────────────────────────────────────────────
    const celulasFiltradas = celulas.filter((p) => {
        const temRelatorio   = p.relatorioPendente;
        const temDiscipulado = p.discipuladoPendente;
        const emDia          = !temRelatorio && !temDiscipulado;

        if (filtro === "PENDENTES")   return temRelatorio || temDiscipulado;
        if (filtro === "AMBAS")       return temRelatorio && temDiscipulado;
        if (filtro === "RELATORIO")   return temRelatorio && !temDiscipulado;
        if (filtro === "DISCIPULADO") return temDiscipulado && !temRelatorio;
        if (filtro === "EM_DIA")      return emDia;
        return true; // TODAS
    });

    const totalAmbas       = celulas.filter(p => p.relatorioPendente && p.discipuladoPendente).length;
    const totalRelatorio   = celulas.filter(p => p.relatorioPendente).length;
    const totalDiscipulado = celulas.filter(p => p.discipuladoPendente).length;
    const totalEmDia       = celulas.filter(p => !p.relatorioPendente && !p.discipuladoPendente).length;
    const semanaLabel      = labelSemana(semanaRef);

    const globalStyles = `
    @keyframes spin { to { transform:rotate(360deg); } }

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
  `;

    return (
        <div style={{ color: textPrimary, fontFamily: "'EB Garamond',serif" }}>
            <style>{globalStyles}</style>

            {/* ── HEADER ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
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
                <button onClick={() => carregar(semanaRef)} style={{
                    background: "none", border: `1px solid ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}`,
                    borderRadius: 8, padding: "9px 16px", cursor: "pointer", color: textSecondary,
                    display: "flex", alignItems: "center", gap: 8, fontFamily: "'Cinzel',serif",
                    fontSize: 9, letterSpacing: ".15em", transition: "all .2s",
                }}>
                    <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                    ATUALIZAR
                </button>
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
                    const ativo = filtro === key;
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
                        <div style={{ padding: 56, display: "flex", justifyContent: "center" }}>
                            <Loader2 size={30} style={{ animation: "spin 1s linear infinite", color: IEQ.red }} />
                        </div>
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

                                        {/* identidade */}
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

                                        {/* ── STATUS BADGES ── */}
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
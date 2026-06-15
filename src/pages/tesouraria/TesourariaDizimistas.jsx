import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../../services/api.js";
import {
    UserCheck, UserX, Search, ChevronLeft, ChevronRight,
    CheckCircle2, AlertCircle, Fingerprint, Users
} from "lucide-react";

/* ─── Tokens AURA (espelhados do DashboardLider) ───────────────────── */
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
        placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
        rowBg:       isDark ? "rgba(255,255,255,.025)" : "rgba(201,169,110,.04)",
        rowBorder:   isDark ? "rgba(201,169,110,.07)"  : "rgba(201,169,110,.12)",
    };
}

const PAGE_SIZE = 8;

/* ─── Paginação ─────────────────────────────────────────────────────── */
function Paginacao({ page, total, onPrev, onNext, isDark, t }) {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (totalPages <= 1) return null;
    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px",
            borderTop: `1px solid ${t.border}`,
            marginTop: 4,
        }}>
            <span style={{
                fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 500,
                letterSpacing: ".12em", textTransform: "uppercase", color: t.textMuted,
            }}>
                Pág. {page + 1} de {totalPages}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
                <button
                    onClick={onPrev} disabled={page === 0}
                    style={{
                        width: 30, height: 30, borderRadius: 8, border: `1px solid ${t.border}`,
                        background: page === 0
                            ? "transparent"
                            : isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.06)",
                        color: page === 0 ? t.textMuted : AURA.gold,
                        cursor: page === 0 ? "default" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: page === 0 ? .35 : 1, transition: "all .2s",
                    }}
                >
                    <ChevronLeft size={14} />
                </button>
                <button
                    onClick={onNext} disabled={page >= totalPages - 1}
                    style={{
                        width: 30, height: 30, borderRadius: 8, border: `1px solid ${t.border}`,
                        background: page >= totalPages - 1
                            ? "transparent"
                            : isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.06)",
                        color: page >= totalPages - 1 ? t.textMuted : AURA.gold,
                        cursor: page >= totalPages - 1 ? "default" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: page >= totalPages - 1 ? .35 : 1, transition: "all .2s",
                    }}
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

/* ─── Skeleton ──────────────────────────────────────────────────────── */
function Skeleton({ isDark }) {
    const bg = isDark
        ? "linear-gradient(90deg,rgba(201,169,110,.05) 25%,rgba(201,169,110,.12) 50%,rgba(201,169,110,.05) 75%)"
        : "linear-gradient(90deg,rgba(201,169,110,.06) 25%,rgba(201,169,110,.14) 50%,rgba(201,169,110,.06) 75%)";
    const s = (h, w = "100%", mb = 0, br = 10) => ({
        height: h, width: w, borderRadius: br, marginBottom: mb,
        background: bg, backgroundSize: "400px 100%",
        animation: "dz-shimmer 1.4s infinite",
    });
    return (
        <>
            <style>{`@keyframes dz-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
            {/* stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
                <div style={s(84, "100%", 0, 20)} />
                <div style={s(84, "100%", 0, 20)} />
            </div>
            {/* search */}
            <div style={s(44, "100%", 16, 13)} />
            {/* cols */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[0, 1].map(c => (
                    <div key={c} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={s(20, "55%", 10, 6)} />
                        {[1, 2, 3, 4].map(i => <div key={i} style={s(58, "100%", 0, 13)} />)}
                    </div>
                ))}
            </div>
        </>
    );
}

/* ─── Coluna (fiéis ou pendentes) ───────────────────────────────────── */
function Coluna({ isDark, t, titulo, lista, tipo, icon, iconBg, accentColor, accentBg }) {
    const [page, setPage] = useState(0);
    const isFiel = tipo === "fiel";

    useEffect(() => { setPage(0); }, [lista]);

    const pagina = lista.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <section style={{
            background: t.bgEl, border: `1px solid ${t.border}`,
            borderRadius: 20, overflow: "hidden",
            backdropFilter: "blur(24px)", position: "relative",
        }}>
            {/* linha dourada topo */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 1,
                background: "linear-gradient(90deg,transparent,rgba(201,169,110,.2),transparent)",
            }} />

            {/* cabeçalho */}
            <div style={{
                padding: "16px 18px",
                borderBottom: `1px solid ${t.border}`,
                display: "flex", alignItems: "center", gap: 10,
            }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: iconBg, border: `1px solid ${accentColor}28`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                    {icon}
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{
                        fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600,
                        letterSpacing: ".2em", textTransform: "uppercase",
                        color: t.textMuted, margin: "0 0 2px",
                    }}>
                        {isFiel ? "Contribuintes" : "Pendentes"}
                    </p>
                    <p style={{
                        fontFamily: "'Playfair Display',serif", fontSize: 15,
                        fontWeight: 500, color: t.text, margin: 0,
                    }}>
                        {titulo}
                    </p>
                </div>
                <span style={{
                    padding: "4px 13px", borderRadius: 99,
                    fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600,
                    letterSpacing: ".1em", color: accentColor, background: accentBg,
                    border: `1px solid ${accentColor}28`, flexShrink: 0,
                }}>
                    {lista.length}
                </span>
            </div>

            {/* lista */}
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 7, minHeight: 56 }}>
                {pagina.length === 0 ? (
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", padding: "28px 0",
                        border: `1px dashed ${t.border}`, borderRadius: 13,
                    }}>
                        <Users size={20} style={{ color: t.textMuted, marginBottom: 8 }} />
                        <p style={{
                            fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 500,
                            letterSpacing: ".18em", textTransform: "uppercase", color: t.textMuted,
                        }}>
                            Nenhum registro
                        </p>
                    </div>
                ) : pagina.map(m => (
                    <div key={m.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "11px 13px", borderRadius: 13,
                        background: t.rowBg, border: `1px solid ${t.rowBorder}`,
                        transition: "border-color .2s", gap: 10,
                    }}
                         onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(201,169,110,.3)"}
                         onMouseLeave={e => e.currentTarget.style.borderColor = t.rowBorder}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                background: isFiel
                                    ? (isDark ? "rgba(16,185,129,.15)" : "rgba(16,185,129,.1)")
                                    : (isDark ? "rgba(200,16,46,.12)"  : "rgba(200,16,46,.08)"),
                                border: `1px solid ${isFiel ? "rgba(16,185,129,.22)" : "rgba(200,16,46,.2)"}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "'Playfair Display',serif", fontWeight: 600,
                                fontSize: 15, color: isFiel ? "#059669" : AURA.red,
                            }}>
                                {m.nome?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p style={{
                                    fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300,
                                    color: t.text, margin: "0 0 2px",
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>
                                    {m.nome}
                                </p>
                                <p style={{
                                    fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 500,
                                    letterSpacing: ".1em", textTransform: "uppercase",
                                    color: isFiel ? "#059669" : AURA.red,
                                    margin: 0, display: "flex", alignItems: "center", gap: 4,
                                }}>
                                    {isFiel
                                        ? <><CheckCircle2 size={9} /> Dízimo em dia</>
                                        : <><AlertCircle  size={9} /> Aguardando</>
                                    }
                                </p>
                            </div>
                        </div>
                        <Fingerprint size={14} style={{ color: t.textMuted, flexShrink: 0, opacity: .4 }} />
                    </div>
                ))}
            </div>

            <Paginacao
                page={page}
                total={lista.length}
                onPrev={() => setPage(p => Math.max(0, p - 1))}
                onNext={() => setPage(p => p + 1)}
                isDark={isDark}
                t={t}
            />
        </section>
    );
}

/* ─── Componente Principal ──────────────────────────────────────────── */
let _cache = null;

export default function TesourariaDizimistas({ isDark = false }) {
    const t = theme(isDark);
    const [fieis,   setFieis]   = useState(_cache?.fieis   || []);
    const [infieis, setInfieis] = useState(_cache?.infieis || []);
    const [loading, setLoading] = useState(!_cache);
    const [busca,   setBusca]   = useState("");
    const abortRef = useRef(null);

    useEffect(() => {
        if (_cache) { setFieis(_cache.fieis); setInfieis(_cache.infieis); setLoading(false); }
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        api.get("/tesouraria/fieis-infieis-mes", { signal: abortRef.current.signal })
            .then(res => {
                const f = res.data.fieis   || [];
                const i = res.data.infieis || [];
                _cache = { fieis: f, infieis: i };
                setFieis(f); setInfieis(i);
            })
            .catch(err => { if (err.name !== "CanceledError" && err.name !== "AbortError") console.error(err); })
            .finally(() => setLoading(false));
        return () => abortRef.current?.abort();
    }, []);

    const filtrar = useCallback(
        lista => lista.filter(m => m.nome?.toLowerCase().includes(busca.toLowerCase())),
        [busca]
    );

    const fFieis   = filtrar(fieis);
    const fInfieis = filtrar(infieis);
    const total    = fieis.length + infieis.length;
    const pct      = total > 0 ? Math.round((fieis.length / total) * 100) : 0;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');
                @keyframes dz-fade  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes dz-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
                @keyframes dz-blink { 0%,100%{opacity:1} 50%{opacity:.3} }
                @keyframes dz-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
                .dz-aura { animation: dz-fade .45s ease; }
            `}</style>

            <div className="dz-aura" style={{ maxWidth: 960, margin: "0 auto", padding: "4px 0 32px" }}>

                {/* ── Badge + Título ── */}
                <div style={{ marginBottom: 22 }}>
                    <span style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        background: "rgba(201,169,110,.07)", border: "1px solid rgba(201,169,110,.2)",
                        borderRadius: 100, padding: "8px 18px",
                        fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600,
                        letterSpacing: ".14em", textTransform: "uppercase", color: AURA.gold,
                        marginBottom: 12,
                    }}>
                        <span style={{
                            width: 5, height: 5, borderRadius: "50%", background: AURA.gold,
                            animation: "dz-blink 2s ease-in-out infinite",
                            display: "inline-block",
                        }} />
                        Monitoramento Mensal
                    </span>
                    <h2 style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: "clamp(1.5rem,4vw,2rem)",
                        fontWeight: 500, color: t.text, margin: 0, letterSpacing: ".02em",
                    }}>
                        Dizimistas
                    </h2>
                </div>

                {/* ── Divider ── */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 10, marginBottom: 22,
                }}>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(to right,transparent,${AURA.gold})` }} />
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: AURA.gold }} />
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(to left,transparent,${AURA.gold})` }} />
                </div>

                {loading ? (
                    <Skeleton isDark={isDark} />
                ) : (
                    <>
                        {/* ── Stat Cards ── */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                            {/* Fiéis */}
                            <div style={{
                                background: t.bgEl, border: `1px solid ${t.border}`,
                                borderRadius: 20, padding: "20px 18px",
                                backdropFilter: "blur(24px)", position: "relative", overflow: "hidden",
                            }}>
                                <div style={{
                                    position: "absolute", top: 0, left: 0, right: 0, height: 1,
                                    background: "linear-gradient(90deg,transparent,rgba(201,169,110,.2),transparent)",
                                }} />
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                                        background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.22)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <UserCheck size={20} style={{ color: "#059669" }} />
                                    </div>
                                    <div>
                                        <p style={{
                                            fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600,
                                            letterSpacing: ".2em", textTransform: "uppercase",
                                            color: t.textMuted, margin: "0 0 4px",
                                        }}>
                                            Contribuintes
                                        </p>
                                        <p style={{
                                            fontFamily: "'Playfair Display',serif", fontSize: 28,
                                            fontWeight: 600, color: t.text, margin: 0, lineHeight: 1,
                                        }}>
                                            {fieis.length}
                                        </p>
                                    </div>
                                </div>
                                {/* barra de progresso */}
                                <div style={{ marginTop: 14 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 500, letterSpacing: ".12em", textTransform: "uppercase", color: t.textMuted }}>Adesão</span>
                                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, color: "#059669" }}>{pct}%</span>
                                    </div>
                                    <div style={{ height: 4, borderRadius: 99, background: isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)", overflow: "hidden" }}>
                                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#059669,#34d399)", transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }} />
                                    </div>
                                </div>
                            </div>

                            {/* Pendentes */}
                            <div style={{
                                background: t.bgEl, border: `1px solid ${t.border}`,
                                borderRadius: 20, padding: "20px 18px",
                                backdropFilter: "blur(24px)", position: "relative", overflow: "hidden",
                            }}>
                                <div style={{
                                    position: "absolute", top: 0, left: 0, right: 0, height: 1,
                                    background: "linear-gradient(90deg,transparent,rgba(201,169,110,.2),transparent)",
                                }} />
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                                        background: `rgba(200,16,46,.1)`, border: `1px solid rgba(200,16,46,.22)`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <UserX size={20} style={{ color: AURA.red }} />
                                    </div>
                                    <div>
                                        <p style={{
                                            fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600,
                                            letterSpacing: ".2em", textTransform: "uppercase",
                                            color: t.textMuted, margin: "0 0 4px",
                                        }}>
                                            Pendentes
                                        </p>
                                        <p style={{
                                            fontFamily: "'Playfair Display',serif", fontSize: 28,
                                            fontWeight: 600, color: t.text, margin: 0, lineHeight: 1,
                                        }}>
                                            {infieis.length}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ marginTop: 14 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 500, letterSpacing: ".12em", textTransform: "uppercase", color: t.textMuted }}>Pendência</span>
                                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, color: AURA.red }}>{100 - pct}%</span>
                                    </div>
                                    <div style={{ height: 4, borderRadius: 99, background: isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)", overflow: "hidden" }}>
                                        <div style={{ width: `${100 - pct}%`, height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${AURA.redDark},${AURA.red})`, transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Search ── */}
                        <div style={{ position: "relative", marginBottom: 16 }}>
                            <Search size={15} style={{
                                position: "absolute", left: 14, top: "50%",
                                transform: "translateY(-50%)", color: AURA.gold,
                                opacity: .5, pointerEvents: "none",
                            }} />
                            <input
                                style={{
                                    width: "100%", boxSizing: "border-box",
                                    background: t.bgInput, border: `1px solid ${t.borderInput}`,
                                    color: t.text, padding: "13px 16px 13px 44px",
                                    borderRadius: 13, outline: "none",
                                    fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 300,
                                    transition: "all .25s",
                                }}
                                placeholder="Buscar por nome…"
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                                onFocus={e => {
                                    e.target.style.borderColor = "rgba(201,169,110,.5)";
                                    e.target.style.boxShadow   = "0 0 0 3px rgba(201,169,110,.08)";
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = t.borderInput;
                                    e.target.style.boxShadow   = "none";
                                }}
                            />
                        </div>

                        {/* ── Colunas ── */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: 16,
                        }}>
                            <Coluna
                                isDark={isDark} t={t}
                                titulo="Contribuintes" lista={fFieis} tipo="fiel"
                                icon={<UserCheck size={16} style={{ color: "#059669" }} />}
                                iconBg="rgba(16,185,129,.1)" accentColor="#059669"
                                accentBg={isDark ? "rgba(16,185,129,.12)" : "rgba(16,185,129,.1)"}
                            />
                            <Coluna
                                isDark={isDark} t={t}
                                titulo="Pendentes" lista={fInfieis} tipo="pendente"
                                icon={<UserX size={16} style={{ color: AURA.red }} />}
                                iconBg="rgba(200,16,46,.1)" accentColor={AURA.red}
                                accentBg={isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.08)"}
                            />
                        </div>

                        {/* ── Footer ── */}
                        <p style={{
                            textAlign: "center", marginTop: 28,
                            fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 500,
                            letterSpacing: ".18em", textTransform: "uppercase",
                            color: isDark ? "rgba(245,240,232,.12)" : "rgba(26,16,8,.15)",
                        }}>
                            © {new Date().getFullYear()} IEQ Pituaçu — Sistema Eclesiástico
                        </p>
                    </>
                )}
            </div>
        </>
    );
}
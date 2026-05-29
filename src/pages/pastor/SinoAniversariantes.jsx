import React, { useEffect, useState, useRef } from "react";
import api from "../../services/api.js";
import { Bell, Cake, CheckCircle2, X, Send } from "lucide-react";

const IEQ = {
    red: "#C8102E",
    redDark: "#8B0B1F",
    yellow: "#FDB813",
    blue: "#003DA5",
    dark: "#0A0608",
    offWhite: "#F5F0E8",
};

const CORES = [
    { bg: "rgba(200,16,46,.12)", text: "#9B0B1E" },
    { bg: "rgba(0,61,165,.10)",  text: "#002470"  },
    { bg: "rgba(253,184,19,.15)",text: "#C48C00"  },
];

function initials(nome = "") {
    return nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 520);
    useEffect(() => {
        const fn = () => setIsMobile(window.innerWidth < 520);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);
    return isMobile;
}

export default function SinoAniversariantes({ isDark = false }) {
    const [open,     setOpen]     = useState(false);
    const [tab,      setTab]      = useState("hoje");
    const [hoje,     setHoje]     = useState([]);
    const [semana,   setSemana]   = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [marcados, setMarcados] = useState(new Set());

    const btnRef   = useRef(null);
    const panelRef = useRef(null);
    const isMobile = useIsMobile();

    const dataHojeFormatada = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date());

    const periodoSemana = (() => {
        const h   = new Date();
        const dia = h.getDay();
        const seg = new Date(h);
        seg.setDate(h.getDate() - (dia === 0 ? 6 : dia - 1));
        const dom = new Date(seg);
        dom.setDate(seg.getDate() + 6);
        const fmt = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        return `${fmt(seg)} a ${fmt(dom)}`;
    })();

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [rH, rS] = await Promise.all([
                    api.get("/api/aniversariantes/hoje"),
                    api.get("/api/aniversariantes/semana"),
                ]);
                setHoje(Array.isArray(rH.data) ? rH.data : []);
                setSemana(Array.isArray(rS.data) ? rS.data : []);
            } catch (err) {
                console.error("Erro ao carregar aniversariantes:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!open || isMobile) return;
        const fn = (e) => {
            const noBtn   = btnRef.current   && !btnRef.current.contains(e.target);
            const noPanel = panelRef.current && !panelRef.current.contains(e.target);
            if (noBtn && noPanel) setOpen(false);
        };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, [open, isMobile]);

    useEffect(() => {
        document.body.style.overflow = (isMobile && open) ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isMobile, open]);

    // ✅ Abre WhatsApp com o link que vem PRONTO do backend (m.link)
    // e marca como felicitado ao mesmo tempo
    const enviarParabens = (m) => {
        window.open(m.link, "_blank");
        setMarcados(prev => new Set([...prev, m.id]));
    };

    const lista   = tab === "hoje" ? hoje : semana;
    const temHoje = hoje.length > 0;

    const conteudo = (
        <PainelConteudo
            isDark={isDark}
            tab={tab} setTab={setTab}
            lista={lista} loading={loading}
            marcados={marcados}
            enviarParabens={enviarParabens}
            dataHojeFormatada={dataHojeFormatada}
            periodoSemana={periodoSemana}
            onClose={() => setOpen(false)}
        />
    );

    return (
        <>
            {isMobile && open && (
                <div
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => setOpen(false)}
                    style={{
                        position: "fixed", inset: 0,
                        background: "rgba(10,6,8,.55)",
                        backdropFilter: "blur(4px)",
                        zIndex: 998,
                    }}
                />
            )}

            <div ref={btnRef} style={{ position: "relative", display: "inline-flex" }}>
                <button
                    onClick={() => setOpen(o => !o)}
                    style={{
                        padding: "10px 14px",
                        background: open || temHoje ? "rgba(200,16,46,.14)" : "transparent",
                        border: `1px solid ${open || temHoje ? "rgba(200,16,46,.55)" : "rgba(200,16,46,.3)"}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    <Bell size={18} style={{ color: temHoje ? IEQ.red : (isDark ? IEQ.offWhite : IEQ.dark) }} />
                    {temHoje && (
                        <span style={{
                            position: "absolute", top: -6, right: -6,
                            background: IEQ.red, color: "#fff",
                            fontSize: 10, fontWeight: 700,
                            minWidth: 17, height: 17, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: `2px solid ${isDark ? "#0A0608" : "#F0EAE8"}`,
                        }}>
                            {hoje.length}
                        </span>
                    )}
                </button>

                {!isMobile && open && (
                    <div
                        ref={panelRef}
                        style={{
                            position: "absolute",
                            top: 52, right: 0,
                            width: "min(380px, calc(100vw - 32px))",
                            background: isDark ? "rgba(17,10,13,.98)" : "#fff",
                            border: "1px solid rgba(200,16,46,.35)",
                            borderRadius: 16,
                            boxShadow: isDark
                                ? "0 20px 50px rgba(0,0,0,.8)"
                                : "0 15px 40px rgba(200,16,46,.2)",
                            zIndex: 500,
                            overflow: "hidden",
                        }}
                    >
                        {conteudo}
                    </div>
                )}
            </div>

            {isMobile && open && (
                <div
                    ref={panelRef}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                        position: "fixed",
                        bottom: 0, left: 0, right: 0,
                        width: "100%",
                        maxHeight: "85dvh",
                        borderRadius: "20px 20px 0 0",
                        background: isDark ? "rgba(17,10,13,.99)" : "#fff",
                        border: "1px solid rgba(200,16,46,.35)",
                        borderBottom: "none",
                        boxShadow: "0 -8px 40px rgba(0,0,0,.3)",
                        zIndex: 999,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div style={{
                        width: 36, height: 4, borderRadius: 2,
                        background: "rgba(200,16,46,.3)",
                        margin: "10px auto 0", flexShrink: 0,
                    }} />
                    {conteudo}
                </div>
            )}
        </>
    );
}

function PainelConteudo({
                            isDark, tab, setTab, lista, loading,
                            marcados, enviarParabens,
                            dataHojeFormatada, periodoSemana, onClose,
                        }) {
    const sub = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

    return (
        <>
            {/* Cabeçalho */}
            <div style={{
                padding: "14px 18px",
                background: "rgba(200,16,46,.06)",
                borderBottom: "1px solid rgba(200,16,46,.25)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Cake size={22} color={IEQ.red} />
                    <div>
                        <p style={{
                            fontFamily: "'Cinzel', serif", fontSize: 13,
                            fontWeight: 700, margin: 0, color: IEQ.red,
                        }}>
                            ANIVERSARIANTES
                        </p>
                        <p style={{ fontSize: 11.5, margin: "2px 0 0", color: isDark ? "#ccc" : "#666" }}>
                            {tab === "hoje" ? dataHojeFormatada : `Período: ${periodoSemana}`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: sub, padding: 4,
                        display: "flex", alignItems: "center",
                    }}
                >
                    <X size={18} />
                </button>
            </div>

            {/* Abas */}
            <div style={{ display: "flex", flexShrink: 0 }}>
                {["hoje", "semana"].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            flex: 1, padding: "11px",
                            background: tab === t ? IEQ.red : "transparent",
                            color: tab === t ? "#fff" : (isDark ? "#aaa" : "#666"),
                            fontWeight: 600, fontSize: 12.5,
                            border: "none", cursor: "pointer",
                            transition: "background .18s",
                        }}
                    >
                        {t === "hoje" ? "HOJE" : "ESTA SEMANA"}
                    </button>
                ))}
            </div>

            {/* Lista */}
            <div style={{
                flex: 1, overflowY: "auto", padding: "10px",
                WebkitOverflowScrolling: "touch",
            }}>
                {loading ? (
                    <p style={{ textAlign: "center", padding: "40px 0", color: "#888", fontSize: 13 }}>
                        Carregando...
                    </p>
                ) : lista.length === 0 ? (
                    <p style={{
                        textAlign: "center", padding: "40px 0",
                        color: "#888", fontStyle: "italic", fontSize: 13,
                    }}>
                        {tab === "hoje"
                            ? "Nenhum aniversariante hoje."
                            : "Nenhum aniversariante esta semana."}
                    </p>
                ) : lista.map((m, i) => {
                    const cor     = CORES[i % CORES.length];
                    const marcado = marcados.has(m.id);
                    return (
                        <div
                            key={m.id}
                            style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "11px 10px", marginBottom: 8, borderRadius: 12,
                                background: marcado
                                    ? (isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.03)")
                                    : (tab === "hoje"
                                        ? "rgba(200,16,46,.07)"
                                        : (isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)")),
                                opacity: marcado ? 0.6 : 1,
                                border: tab === "hoje" && !marcado
                                    ? "1px solid rgba(200,16,46,.32)"
                                    : "1px solid transparent",
                                transition: "opacity .25s",
                            }}
                        >
                            {/* Avatar */}
                            <div style={{
                                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                                background: cor.bg, color: cor.text,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 14, fontWeight: 700,
                            }}>
                                {initials(m.nome)}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    margin: 0, fontWeight: 600, fontSize: 14,
                                    color: isDark ? IEQ.offWhite : IEQ.dark,
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>
                                    {m.nome}
                                </p>
                                <p style={{ margin: "2px 0 0", color: "#888", fontSize: 12 }}>
                                    {m.telefone}
                                </p>
                            </div>

                            {/* ✅ Botão WhatsApp — usa m.link do backend */}
                            <button
                                onClick={() => enviarParabens(m)}
                                disabled={marcado}
                                title={marcado ? "Parabéns já enviado!" : "Enviar parabéns no WhatsApp"}
                                style={{
                                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                    // verde WhatsApp quando pendente, verde escuro quando enviado
                                    background: marcado ? "#10B981" : "#25D366",
                                    color: "#fff", border: "none",
                                    cursor: marcado ? "default" : "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "background .2s",
                                }}
                            >
                                {marcado ? <CheckCircle2 size={20} /> : <Send size={20} />}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Rodapé */}
            <div style={{
                padding: "9px", textAlign: "center",
                fontSize: 10, color: "#888",
                borderTop: "1px solid rgba(200,16,46,.1)",
                flexShrink: 0,
            }}>
                Lembrete de Aniversários · IEQ Pituaçu
            </div>
        </>
    );
}
import React, { useEffect, useState, useRef } from "react";
import api from "../../services/api.js";
import { Bell, Cake, CheckCircle2, X } from "lucide-react";

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
    { bg: "rgba(0,61,165,.10)", text: "#002470" },
    { bg: "rgba(253,184,19,.15)", text: "#C48C00" },
];

function initials(nome = "") {
    return nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

// ✅ Hook para detectar mobile
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
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState("hoje");
    const [hoje, setHoje] = useState([]);
    const [semana, setSemana] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marcados, setMarcados] = useState(new Set());

    const ref = useRef(null);
    const isMobile = useIsMobile();

    const dataHojeFormatada = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date());

    const periodoSemana = (() => {
        const h = new Date();
        const dia = h.getDay();
        const segunda = new Date(h);
        segunda.setDate(h.getDate() - (dia === 0 ? 6 : dia - 1));
        const domingo = new Date(segunda);
        domingo.setDate(segunda.getDate() + 6);
        return `${segunda.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${domingo.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
    })();

    useEffect(() => {
        const carregar = async () => {
            setLoading(true);
            try {
                const [resHoje, resSemana] = await Promise.all([
                    api.get("/api/aniversariantes/hoje"),
                    api.get("/api/aniversariantes/semana")
                ]);
                setHoje(Array.isArray(resHoje.data) ? resHoje.data : []);
                setSemana(Array.isArray(resSemana.data) ? resSemana.data : []);
            } catch (err) {
                console.error("Erro ao carregar aniversariantes:", err);
            } finally {
                setLoading(false);
            }
        };
        carregar();
    }, []);

    // ✅ Fecha ao clicar fora
    useEffect(() => {
        if (!open) return;
        const fn = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, [open]);

    // ✅ Trava o scroll do body quando modal mobile estiver aberto
    useEffect(() => {
        if (isMobile && open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isMobile, open]);

    const marcarComoFeito = (id) => {
        setMarcados(prev => new Set([...prev, id]));
    };

    const lista = tab === "hoje" ? hoje : semana;
    const temHoje = hoje.length > 0;

    // ✅ No mobile: bottom sheet com backdrop
    // ✅ No desktop: dropdown alinhado à direita
    const panelStyle = isMobile ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        maxHeight: "85dvh",
        borderRadius: "20px 20px 0 0",
        background: isDark ? "rgba(17,10,13,.99)" : "#fff",
        border: "1px solid rgba(200,16,46,.35)",
        borderBottom: "none",
        boxShadow: "0 -8px 40px rgba(0,0,0,.3)",
        zIndex: 1000,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
    } : {
        position: "absolute",
        top: 55,
        right: 0,                                     // ✅ era -10, agora 0
        width: "min(380px, calc(100vw - 32px))",      // ✅ nunca estoura a tela
        background: isDark ? "rgba(17,10,13,.98)" : "#fff",
        border: "1px solid rgba(200,16,46,.35)",
        borderRadius: 16,
        boxShadow: isDark ? "0 20px 50px rgba(0,0,0,0.8)" : "0 15px 40px rgba(200,16,46,.2)",
        zIndex: 500,
        overflow: "hidden",
    };

    return (
        <>
            {/* ✅ Backdrop mobile */}
            {isMobile && open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{
                        position: "fixed", inset: 0,
                        background: "rgba(10,6,8,.6)",
                        backdropFilter: "blur(4px)",
                        zIndex: 999,
                    }}
                />
            )}

            <div ref={ref} style={{ position: "relative" }}>
                {/* Botão sino */}
                <button
                    onClick={() => setOpen(o => !o)}
                    style={{
                        padding: "10px 14px",
                        position: "relative",           // ✅ necessário pro badge absolute
                        background: open || temHoje ? "rgba(200,16,46,.14)" : "transparent",
                        border: `1px solid ${open || temHoje ? "rgba(200,16,46,.55)" : "rgba(200,16,46,.3)"}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Bell size={18} style={{ color: temHoje ? IEQ.red : (isDark ? IEQ.offWhite : IEQ.dark) }} />
                    {temHoje && (
                        <span style={{
                            position: "absolute", top: -6, right: -6,
                            background: IEQ.red, color: "#fff", fontSize: 10,
                            fontWeight: 700, minWidth: 17, height: 17,
                            borderRadius: "50%", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            border: `2px solid ${isDark ? "#0A0608" : "#F0EAE8"}`
                        }}>
                            {hoje.length}
                        </span>
                    )}
                </button>

                {/* Painel dropdown (desktop) */}
                {!isMobile && open && (
                    <div style={panelStyle}>
                        <PainelConteudo
                            isDark={isDark}
                            tab={tab} setTab={setTab}
                            lista={lista} loading={loading}
                            marcados={marcados} marcarComoFeito={marcarComoFeito}
                            dataHojeFormatada={dataHojeFormatada}
                            periodoSemana={periodoSemana}
                            onClose={() => setOpen(false)}
                        />
                    </div>
                )}
            </div>

            {/* Painel bottom sheet (mobile) */}
            {isMobile && open && (
                <div style={panelStyle}>
                    {/* Handle visual */}
                    <div style={{
                        width: 36, height: 4, borderRadius: 2,
                        background: "rgba(200,16,46,.3)",
                        margin: "10px auto 0",
                        flexShrink: 0,
                    }} />
                    <PainelConteudo
                        isDark={isDark}
                        tab={tab} setTab={setTab}
                        lista={lista} loading={loading}
                        marcados={marcados} marcarComoFeito={marcarComoFeito}
                        dataHojeFormatada={dataHojeFormatada}
                        periodoSemana={periodoSemana}
                        onClose={() => setOpen(false)}
                        isMobile
                    />
                </div>
            )}
        </>
    );
}

// ✅ Conteúdo extraído para reutilizar em desktop e mobile
function PainelConteudo({
                            isDark, tab, setTab, lista, loading,
                            marcados, marcarComoFeito,
                            dataHojeFormatada, periodoSemana,
                            onClose, isMobile = false,
                        }) {
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
                    <Cake size={24} color={IEQ.red} />
                    <div>
                        <p style={{
                            fontFamily: "'Cinzel', serif", fontSize: 14,
                            fontWeight: 700, margin: 0, color: IEQ.red
                        }}>
                            ANIVERSARIANTES
                        </p>
                        <p style={{ fontSize: 12, marginTop: 3, color: isDark ? "#ccc" : "#555", margin: 0 }}>
                            {tab === "hoje" ? dataHojeFormatada : `Período: ${periodoSemana}`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: isDark ? "rgba(245,240,232,.5)" : "rgba(26,10,13,.4)",
                        padding: 4, display: "flex", alignItems: "center",
                    }}
                >
                    <X size={18} />
                </button>
            </div>

            {/* Abas */}
            <div style={{ display: "flex", flexShrink: 0 }}>
                {["hoje", "semana"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            flex: 1,
                            padding: "12px",
                            background: tab === t ? IEQ.red : "transparent",
                            color: tab === t ? "#fff" : (isDark ? "#aaa" : "#666"),
                            fontWeight: 600,
                            fontSize: 13,
                            border: "none",
                            cursor: "pointer",
                            transition: "background .2s",
                        }}
                    >
                        {t === "hoje" ? "HOJE" : "ESTA SEMANA"}
                    </button>
                ))}
            </div>

            {/* Lista */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px",
                WebkitOverflowScrolling: "touch",
            }}>
                {loading ? (
                    <p style={{ textAlign: "center", padding: "50px 20px", color: "#888" }}>
                        Carregando...
                    </p>
                ) : lista.length === 0 ? (
                    <p style={{
                        textAlign: "center", padding: "50px 20px",
                        color: "#888", fontStyle: "italic"
                    }}>
                        {tab === "hoje" ? "Nenhum aniversariante hoje." : "Nenhum aniversariante esta semana."}
                    </p>
                ) : lista.map((m, i) => {
                    const cor = CORES[i % CORES.length];
                    const jaMarcado = marcados.has(m.id);
                    return (
                        <div key={m.id} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px",
                            marginBottom: 8,
                            borderRadius: 12,
                            background: jaMarcado
                                ? (isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.03)")
                                : (tab === "hoje" ? "rgba(200,16,46,.07)" : (isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)")),
                            opacity: jaMarcado ? 0.65 : 1,
                            border: tab === "hoje" && !jaMarcado
                                ? "1px solid rgba(200,16,46,.35)"
                                : "1px solid transparent",
                            transition: "opacity .25s",
                        }}>
                            <div style={{
                                width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                                background: cor.bg, color: cor.text,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 14, fontWeight: 700,
                            }}>
                                {initials(m.nome)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    margin: 0, fontWeight: 600, fontSize: 14,
                                    color: isDark ? IEQ.offWhite : IEQ.dark,
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>
                                    {m.nome}
                                </p>
                                <p style={{ margin: "3px 0 0", color: "#888", fontSize: 12 }}>
                                    {m.telefone}
                                </p>
                            </div>
                            <button
                                onClick={() => marcarComoFeito(m.id)}
                                disabled={jaMarcado}
                                title={jaMarcado ? "Parabéns enviados!" : "Marcar como felicitado"}
                                style={{
                                    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                                    background: jaMarcado ? "#10B981" : IEQ.red,
                                    color: "#fff", border: "none",
                                    cursor: jaMarcado ? "default" : "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "background .2s",
                                }}
                            >
                                <CheckCircle2 size={20} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <div style={{
                padding: "10px", textAlign: "center",
                fontSize: 10, color: "#777",
                borderTop: "1px solid rgba(200,16,46,.12)",
                flexShrink: 0,
            }}>
                Lembrete de Aniversários · IEQ Pituaçu
            </div>
        </>
    );
}
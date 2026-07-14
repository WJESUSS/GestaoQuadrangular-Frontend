import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import api from "../../services/api.js";
import { Bell, Cake, CheckCircle2, X, Send } from "lucide-react";
import { AURA, theme } from "./liderTheme";

const CORES = [
    { bg: "rgba(158,42,43,.12)", text: "#6E1D1E" },
    { bg: "rgba(30,63,102,.10)",  text: "#12283F"  },
    { bg: "rgba(217,174,94,.15)",text: "#B8892E"  },
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

export default function SinoAniversariantes({ isDark = false, celulaId = null }) {
    const [open,     setOpen]     = useState(false);
    const [tab,      setTab]      = useState("hoje");
    const [hoje,     setHoje]     = useState([]);
    const [semana,   setSemana]   = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [marcados, setMarcados] = useState(new Set());
    const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

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

    // Calcula posição do botão para ancorar o painel logo abaixo e centralizado
    const calcPos = () => {
        if (!btnRef.current) return;
        const r = btnRef.current.getBoundingClientRect();
        setPanelPos({
            top:  r.bottom + 8,
            left: r.left + r.width / 2,
        });
    };

    const handleOpen = () => {
        calcPos();
        setOpen(o => !o);
    };

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

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const endpoint = celulaId
                    ? `/api/aniversariantes/celula/${celulaId}`
                    : "/api/aniversariantes";
                const [rH, rS] = await Promise.all([
                    api.get(`${endpoint}/hoje`),
                    api.get(`${endpoint}/semana`),
                ]);
                setHoje(Array.isArray(rH.data) ? rH.data : []);
                setSemana(Array.isArray(rS.data) ? rS.data : []);
            } catch (err) {
                console.error("Erro ao carregar aniversariantes:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [celulaId]);

    const marcarComoFeito = (id) =>
        setMarcados(prev => new Set([...prev, id]));

    const lista   = tab === "hoje" ? hoje : semana;
    const temHoje = hoje.length > 0;

    const conteudo = (
        <PainelConteudo
            isDark={isDark}
            tab={tab} setTab={setTab}
            lista={lista} loading={loading}
            marcados={marcados}
            marcarComoFeito={marcarComoFeito}
            dataHojeFormatada={dataHojeFormatada}
            periodoSemana={periodoSemana}
            onClose={() => setOpen(false)}
        />
    );

    return (
        <>
            {/* Botão sino */}
            <div ref={btnRef} style={{ position: "relative", display: "inline-flex" }}>
                <button
                    onClick={handleOpen}
                    style={{
                        padding: "10px 14px",
                        background: open || temHoje ? "rgba(158,42,43,.14)" : "transparent",
                        border: `1px solid ${open || temHoje ? "rgba(158,42,43,.55)" : "rgba(158,42,43,.3)"}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    <Bell size={18} style={{ color: temHoje ? AURA.red : (isDark ? AURA.offWhite : AURA.dark) }} />
                    {temHoje && (
                        <span style={{
                            position: "absolute", top: -6, right: -6,
                            background: AURA.red, color: "#fff",
                            fontSize: 10, fontWeight: 700,
                            minWidth: 17, height: 17, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: `2px solid ${isDark ? "#12131C" : "#F0EAE8"}`,
                        }}>
                            {hoje.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Portal — renderiza direto no body, fora de qualquer contexto de empilhamento */}
            {open && createPortal(
                <>
                    {/* Overlay (mobile e desktop) */}
                    <div
                        onClick={() => setOpen(false)}
                        style={{
                            position: "fixed", inset: 0,
                            background: isMobile ? "rgba(18,19,28,.55)" : "transparent",
                            backdropFilter: isMobile ? "blur(4px)" : "none",
                            zIndex: 99998,
                        }}
                    />

                    {/* Painel */}
                    <div
                        ref={panelRef}
                        onClick={(e) => e.stopPropagation()}
                        style={isMobile ? {
                            // Bottom sheet no mobile
                            position: "fixed",
                            bottom: 0, left: 0, right: 0,
                            width: "100%",
                            maxHeight: "85dvh",
                            borderRadius: "20px 20px 0 0",
                            background: isDark ? "rgba(18,19,28,.99)" : "#fff",
                            border: "1px solid rgba(158,42,43,.35)",
                            borderBottom: "none",
                            boxShadow: "0 -8px 40px rgba(0,0,0,.3)",
                            zIndex: 99999,
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                        } : {
                            // Dropdown desktop — centralizado no botão
                            position: "fixed",
                            top:  panelPos.top,
                            left: panelPos.left,
                            transform: "translateX(-50%)",
                            width: "min(380px, calc(100vw - 32px))",
                            background: isDark ? "rgba(18,19,28,.98)" : "#fff",
                            border: "1px solid rgba(158,42,43,.35)",
                            borderRadius: 16,
                            boxShadow: isDark
                                ? "0 20px 50px rgba(0,0,0,.8)"
                                : "0 15px 40px rgba(158,42,43,.2)",
                            zIndex: 99999,
                            overflow: "hidden",
                            maxHeight: "calc(100vh - 90px)",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {isMobile && (
                            <div style={{
                                width: 36, height: 4, borderRadius: 2,
                                background: "rgba(158,42,43,.3)",
                                margin: "10px auto 0", flexShrink: 0,
                            }} />
                        )}
                        {conteudo}
                    </div>
                </>,
                document.body
            )}
        </>
    );
}

function PainelConteudo({
                            isDark, tab, setTab, lista, loading,
                            marcados, marcarComoFeito,
                            dataHojeFormatada, periodoSemana, onClose,
                        }) {
    const sub = isDark ? "rgba(243,241,234,.45)" : "rgba(26,10,13,.45)";

    return (
        <>
            {/* Cabeçalho */}
            <div style={{
                padding: "14px 18px",
                background: "rgba(158,42,43,.06)",
                borderBottom: "1px solid rgba(158,42,43,.25)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Cake size={22} color={AURA.red} />
                    <div>
                        <p style={{
                            fontFamily: "'Cinzel', serif", fontSize: 13,
                            fontWeight: 700, margin: 0, color: AURA.red,
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
                            background: tab === t ? AURA.red : "transparent",
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
                                        ? "rgba(158,42,43,.07)"
                                        : (isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)")),
                                opacity: marcado ? 0.6 : 1,
                                border: tab === "hoje" && !marcado
                                    ? "1px solid rgba(158,42,43,.32)"
                                    : "1px solid transparent",
                                transition: "opacity .25s",
                            }}
                        >
                            <div style={{
                                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                                background: cor.bg, color: cor.text,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 14, fontWeight: 700,
                            }}>
                                {initials(m.nome)}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    margin: 0, fontWeight: 600, fontSize: 14,
                                    color: isDark ? AURA.offWhite : AURA.dark,
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>
                                    {m.nome}
                                </p>
                                <p style={{ margin: "2px 0 0", color: "#888", fontSize: 12 }}>
                                    {m.telefone}
                                </p>
                            </div>

                            {marcado ? (
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                    background: "#10B981",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <CheckCircle2 size={20} color="#fff" />
                                </div>
                            ) : (
                                <a
                                    href={m.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => marcarComoFeito(m.id)}
                                    title="Enviar parabéns no WhatsApp"
                                    style={{
                                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                        background: "#25D366",
                                        color: "#fff", textDecoration: "none",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        transition: "background .2s",
                                    }}
                                >
                                    <Send size={20} />
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Rodapé */}
            <div style={{
                padding: "9px", textAlign: "center",
                fontSize: 10, color: "#888",
                borderTop: "1px solid rgba(158,42,43,.1)",
                flexShrink: 0,
            }}>
                Lembrete de Aniversários – IEQ Pituaçu
            </div>
        </>
    );
}
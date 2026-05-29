import React, { useEffect, useState, useRef } from "react";
import api from "../../services/api.js";
import { Bell, Cake, X, MessageCircle, CheckCircle2 } from "lucide-react";

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

export default function SinoAniversariantes({ isDark = false }) {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState("hoje");
    const [hoje, setHoje] = useState([]);
    const [semana, setSemana] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enviados, setEnviados] = useState(new Set());

    const ref = useRef(null);

    // Formatação de datas
    const dataHojeFormatada = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date());

    const periodoSemana = (() => {
        const hoje = new Date();
        const dia = hoje.getDay();
        const segunda = new Date(hoje);
        segunda.setDate(hoje.getDate() - (dia === 0 ? 6 : dia - 1));
        const domingo = new Date(segunda);
        domingo.setDate(segunda.getDate() + 6);
        return `${segunda.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})} a ${domingo.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}`;
    })();

    useEffect(() => {
        const carregarAniversariantes = async () => {
            setLoading(true);
            try {
                const [resHoje, resSemana] = await Promise.all([
                    api.get("/api/aniversariantes/hoje"),
                    api.get("/api/aniversariantes/semana")
                ]);

                console.log("📅 Aniversariantes HOJE:", resHoje.data);
                console.log("📅 Aniversariantes SEMANA:", resSemana.data);

                setHoje(Array.isArray(resHoje.data) ? resHoje.data : []);
                setSemana(Array.isArray(resSemana.data) ? resSemana.data : []);
            } catch (err) {
                console.error("Erro ao carregar aniversariantes:", err);
                setHoje([]);
                setSemana([]);
            } finally {
                setLoading(false);
            }
        };

        carregarAniversariantes();
    }, []);

    const lista = tab === "hoje" ? hoje : semana;
    const temHoje = hoje.length > 0;

    const gerarLinkWhats = (m) => {
        const saudacao = `A paz seja contigo! 🙌\n\nFeliz aniversário! Que Deus te abençoe grandemente neste novo ano de vida.\n\nCom carinho, Pastores Renato e Jaci Soares`;
        let numero = (m.telefone || "").replace(/\D/g, "");
        if (!numero.startsWith("55")) numero = `55${numero}`;
        return `https://wa.me/${numero}?text=${encodeURIComponent(saudacao)}`;
    };

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    padding: "10px 14px",
                    background: open || temHoje ? "rgba(200,16,46,.14)" : "transparent",
                    border: `1px solid ${open || temHoje ? "rgba(200,16,46,.55)" : "rgba(200,16,46,.3)"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                }}
            >
                <Bell size={18} style={{ color: temHoje ? IEQ.red : undefined }} />
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

            {open && (
                <div style={{
                    position: "absolute",
                    top: 55,
                    right: -10,
                    width: 380,
                    background: isDark ? "rgba(17,10,13,.98)" : "#fff",
                    border: "1px solid rgba(200,16,46,.35)",
                    borderRadius: 16,
                    boxShadow: isDark ? "0 20px 50px rgba(0,0,0,0.8)" : "0 15px 40px rgba(200,16,46,.2)",
                    zIndex: 500,
                    overflow: "hidden",
                }}>
                    {/* Cabeçalho */}
                    <div style={{ padding: "18px", background: "rgba(200,16,46,.06)", borderBottom: "1px solid rgba(200,16,46,.25)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Cake size={26} color={IEQ.red} />
                            <div>
                                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, margin: 0, color: IEQ.red }}>
                                    ANIVERSARIANTES
                                </p>
                                <p style={{ fontSize: 13.5, marginTop: 4, color: isDark ? "#ccc" : "#555" }}>
                                    {tab === "hoje" ? dataHojeFormatada : `Período: ${periodoSemana}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Abas */}
                    <div style={{ display: "flex" }}>
                        {["hoje", "semana"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                style={{
                                    flex: 1,
                                    padding: "14px",
                                    background: tab === t ? IEQ.red : "transparent",
                                    color: tab === t ? "#fff" : (isDark ? "#aaa" : "#666"),
                                    fontWeight: 600,
                                    fontSize: 13.5,
                                    border: "none",
                                    cursor: "pointer"
                                }}
                            >
                                {t === "hoje" ? "HOJE" : "ESTA SEMANA"}
                            </button>
                        ))}
                    </div>

                    {/* Lista */}
                    <div style={{ maxHeight: 400, overflowY: "auto", padding: "12px" }}>
                        {loading ? (
                            <p style={{ textAlign: "center", padding: "50px 20px", color: "#888" }}>Carregando aniversariantes...</p>
                        ) : lista.length === 0 ? (
                            <p style={{ textAlign: "center", padding: "50px 20px", color: "#888", fontStyle: "italic" }}>
                                {tab === "hoje"
                                    ? "Nenhum aniversariante hoje."
                                    : "Nenhum aniversariante encontrado nesta semana."}
                            </p>
                        ) : (
                            lista.map((m, i) => {
                                const cor = CORES[i % CORES.length];
                                const enviado = enviados.has(m.id);

                                return (
                                    <div key={m.id} style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 14,
                                        padding: "14px",
                                        marginBottom: 10,
                                        borderRadius: 12,
                                        background: tab === "hoje" ? "rgba(200,16,46,.08)" : (isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"),
                                        border: tab === "hoje" ? "1px solid rgba(200,16,46,.4)" : "none"
                                    }}>
                                        <div style={{
                                            width: 52, height: 52, borderRadius: "50%",
                                            background: cor.bg, color: cor.text,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 16, fontWeight: 700
                                        }}>
                                            {initials(m.nome)}
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: 600, fontSize: 15.5 }}>{m.nome}</p>
                                            <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13.5 }}>{m.telefone}</p>
                                        </div>

                                        <a
                                            href={gerarLinkWhats(m)}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={() => setEnviados(prev => new Set([...prev, m.id]))}
                                            style={{
                                                width: 48, height: 48, borderRadius: 12,
                                                background: enviado ? "#003DA5" : `linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.red})`,
                                                color: "#fff", display: "flex", alignItems: "center",
                                                justifyContent: "center", textDecoration: "none"
                                            }}
                                        >
                                            {enviado ? <CheckCircle2 size={22} /> : <MessageCircle size={22} />}
                                        </a>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
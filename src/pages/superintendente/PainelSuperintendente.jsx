import { useEffect, useState } from "react";
import api from "../../services/api";

/**
 * Painel do superintendente — /superintendente
 * Lista igrejas pendentes da região e permite aprovar ou rejeitar.
 * Rota protegida: allowedRoles="SUPERINTENDENTE"
 */
export default function PainelSuperintendente() {
    const [pendentes, setPendentes] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [acao,      setAcao]      = useState({}); // { [igrejaId]: "aprovando"|"rejeitando" }
    const [motivos,   setMotivos]   = useState({}); // { [igrejaId]: string }

    useEffect(() => { carregar(); }, []);

    async function carregar() {
        setLoading(true);
        try {
            const { data } = await api.get("/superintendente/pendentes");
            setPendentes(data);
        } catch {
            setPendentes([]);
        } finally {
            setLoading(false);
        }
    }

    async function aprovar(igrejaId) {
        setAcao(a => ({ ...a, [igrejaId]: "aprovando" }));
        try {
            await api.post(`/superintendente/${igrejaId}/aprovar`);
            setPendentes(p => p.filter(i => i.igrejaId !== igrejaId));
        } finally {
            setAcao(a => ({ ...a, [igrejaId]: null }));
        }
    }

    async function rejeitar(igrejaId) {
        setAcao(a => ({ ...a, [igrejaId]: "rejeitando" }));
        try {
            await api.post(`/superintendente/${igrejaId}/rejeitar`, {
                motivo: motivos[igrejaId] || "",
            });
            setPendentes(p => p.filter(i => i.igrejaId !== igrejaId));
        } finally {
            setAcao(a => ({ ...a, [igrejaId]: null }));
        }
    }

    if (loading) {
        return <div style={s.centro}>Carregando...</div>;
    }

    return (
        <div style={s.pagina}>
            <h1 style={s.titulo}>Igrejas aguardando aprovação</h1>
            <p style={s.subtitulo}>
                {pendentes.length === 0
                    ? "Nenhuma pendência no momento."
                    : `${pendentes.length} igleja(s) aguardando sua aprovação`}
            </p>

            {pendentes.map(ig => (
                <div key={ig.igrejaId} style={s.card}>

                    <div style={s.cardHeader}>
                        <div>
                            <p style={s.nomeIgreja}>{ig.nomeIgreja}</p>
                            <p style={s.regiaoTag}>
                                Região {ig.numeroRegiao} — {ig.nomeRegiao}
                            </p>
                        </div>
                        <span style={s.badgePendente}>Pendente</span>
                    </div>

                    <div style={s.infoGrid}>
                        <div>
                            <p style={s.infoLabel}>Pastor</p>
                            <p style={s.infoValor}>{ig.pastorNome}</p>
                        </div>
                        <div>
                            <p style={s.infoLabel}>E-mail</p>
                            <p style={s.infoValor}>{ig.pastorEmail}</p>
                        </div>
                        <div>
                            <p style={s.infoLabel}>Solicitado em</p>
                            <p style={s.infoValor}>
                                {new Date(ig.criadaEm).toLocaleDateString("pt-BR")}
                            </p>
                        </div>
                    </div>

                    {/* Campo de motivo (visível só se clicar em rejeitar) */}
                    {acao[ig.igrejaId] === "rejeitando_input" && (
                        <textarea
                            placeholder="Motivo da rejeição (opcional)"
                            value={motivos[ig.igrejaId] || ""}
                            onChange={e => setMotivos(m => ({ ...m, [ig.igrejaId]: e.target.value }))}
                            style={s.textarea}
                        />
                    )}

                    <div style={s.acoes}>
                        <button
                            style={s.botaoAprovar}
                            disabled={!!acao[ig.igrejaId]}
                            onClick={() => aprovar(ig.igrejaId)}
                        >
                            {acao[ig.igrejaId] === "aprovando" ? "Aprovando..." : "Aprovar"}
                        </button>

                        {acao[ig.igrejaId] === "rejeitando_input" ? (
                            <button
                                style={s.botaoConfirmar}
                                onClick={() => rejeitar(ig.igrejaId)}
                            >
                                Confirmar rejeição
                            </button>
                        ) : (
                            <button
                                style={s.botaoRejeitar}
                                disabled={!!acao[ig.igrejaId]}
                                onClick={() =>
                                    setAcao(a => ({ ...a, [ig.igrejaId]: "rejeitando_input" }))
                                }
                            >
                                Rejeitar
                            </button>
                        )}
                    </div>

                </div>
            ))}
        </div>
    );
}

const s = {
    pagina:    { maxWidth: 680, margin: "0 auto", padding: "2rem 1rem" },
    centro:    { textAlign: "center", padding: "4rem", color: "var(--color-text-secondary)" },
    titulo:    { fontSize: 22, fontWeight: 500, margin: "0 0 4px" },
    subtitulo: { color: "var(--color-text-secondary)", fontSize: 14, margin: "0 0 2rem" },
    card: {
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 12,
        padding: "1.25rem",
        marginBottom: "1rem",
    },
    cardHeader:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
    nomeIgreja:  { fontWeight: 500, fontSize: 16, margin: "0 0 4px" },
    regiaoTag:   { fontSize: 12, color: "var(--color-text-secondary)", margin: 0 },
    badgePendente: {
        background: "var(--color-background-warning)",
        color: "var(--color-text-warning)",
        fontSize: 11,
        fontWeight: 500,
        padding: "3px 10px",
        borderRadius: 20,
    },
    infoGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 },
    infoLabel: { fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 2px" },
    infoValor: { fontSize: 13, fontWeight: 500, margin: 0 },
    textarea: {
        width: "100%",
        minHeight: 72,
        background: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-secondary)",
        borderRadius: 8,
        color: "var(--color-text-primary)",
        fontSize: 13,
        padding: "10px 12px",
        marginBottom: 12,
        resize: "vertical",
        boxSizing: "border-box",
    },
    acoes:       { display: "flex", gap: 8 },
    botaoAprovar: {
        flex: 1,
        background: "var(--color-background-success)",
        color: "var(--color-text-success)",
        border: "0.5px solid var(--color-border-success)",
        borderRadius: 8,
        padding: "10px",
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
    },
    botaoRejeitar: {
        flex: 1,
        background: "transparent",
        color: "var(--color-text-danger)",
        border: "0.5px solid var(--color-border-danger)",
        borderRadius: 8,
        padding: "10px",
        fontSize: 14,
        cursor: "pointer",
    },
    botaoConfirmar: {
        flex: 1,
        background: "var(--color-background-danger)",
        color: "var(--color-text-danger)",
        border: "0.5px solid var(--color-border-danger)",
        borderRadius: 8,
        padding: "10px",
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
    },
};
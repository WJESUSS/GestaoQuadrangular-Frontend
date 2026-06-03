// Componente reutilizável — cole em src/components/VisitanteBadge.jsx
// e importe nos três módulos (TelaRelatorio, CasasDePazLider, Missao70Lider)

import React from "react";

const DECISAO_CONFIG = {
    ACEITOU_JESUS: {
        label: "Aceitou Jesus",
        short: "SALVO",
        color: "#22c55e",
        bg:    "rgba(34,197,94,.13)",
        border:"rgba(34,197,94,.35)",
        emoji: "🙏",
    },
    RECONCILIOU: {
        label: "Reconciliado",
        short: "RECONCILIADO",
        color: "#3b82f6",
        bg:    "rgba(59,130,246,.13)",
        border:"rgba(59,130,246,.35)",
        emoji: "🕊️",
    },
    BATISMO_AGUAS: {
        label: "Deseja Batismo",
        short: "BATISMO",
        color: "#FDB813",
        bg:    "rgba(253,184,19,.13)",
        border:"rgba(253,184,19,.35)",
        emoji: "💧",
    },
};

/**
 * Exibe um badge colorido abaixo do nome do visitante
 * quando ele tem uma decisão espiritual registrada.
 *
 * Props:
 *   decisao  — string: "ACEITOU_JESUS" | "RECONCILIOU" | "BATISMO_AGUAS" | "NENHUMA" | null
 *   size     — "sm" | "md" (default "sm")
 */
export function DecisaoBadge({ decisao, size = "sm" }) {
    if (!decisao || decisao === "NENHUMA") return null;
    const cfg = DECISAO_CONFIG[decisao];
    if (!cfg) return null;

    const isSm = size === "sm";
    return (
        <span style={{
            display:        "inline-flex",
            alignItems:     "center",
            gap:            4,
            padding:        isSm ? "2px 8px" : "4px 12px",
            borderRadius:   99,
            fontSize:       isSm ? 10 : 12,
            fontFamily:     "'Cinzel', serif",
            fontWeight:     700,
            letterSpacing:  ".12em",
            color:          cfg.color,
            background:     cfg.bg,
            border:         `1px solid ${cfg.border}`,
            whiteSpace:     "nowrap",
            lineHeight:     1.4,
        }}>
            <span style={{ fontSize: isSm ? 11 : 13 }}>{cfg.emoji}</span>
            {cfg.short}
        </span>
    );
}

export { DECISAO_CONFIG };
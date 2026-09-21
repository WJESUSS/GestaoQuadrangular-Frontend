import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { VERSICULOS } from "../utils/versiculos.js";

/* ─── Texto bíblico aleatório (substitui a imagem "40 Dias de Milagres") ── */
export default function VersiculoAleatorio({ isDark = false, accent = "#C9A96E" }) {
    const [idx, setIdx] = useState(() => Math.floor(Math.random() * VERSICULOS.length));

    const sorteia = () => {
        let novo = Math.floor(Math.random() * VERSICULOS.length);
        while (novo === idx) novo = Math.floor(Math.random() * VERSICULOS.length);
        setIdx(novo);
    };

    const v = VERSICULOS[idx];

    return (
        <div style={{
            width: "100%", borderRadius: 14, position: "relative",
            border: `1px solid ${isDark ? "rgba(201,169,110,.18)" : "rgba(0,61,165,.14)"}`,
            background: isDark ? "rgba(255,255,255,.03)" : "rgba(0,61,165,.05)",
            boxShadow: `0 8px 24px rgba(0,0,0,${isDark ? ".35" : ".08"})`,
            padding: "26px 26px 22px",
            display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        }}>
            {/* trocar versículo */}
            <button
                onClick={sorteia}
                aria-label="Sortear outro versículo"
                title="Sortear outro versículo"
                style={{
                    position: "absolute", top: 10, right: 10,
                    background: "none", border: "none", cursor: "pointer",
                    color: isDark ? "#9A9588" : "#4A6585", padding: 6,
                    borderRadius: 8, display: "flex", transition: "all .2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,.08)" : "rgba(200,16,46,.08)"; e.currentTarget.style.color = accent; e.currentTarget.style.transform = "rotate(90deg)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = isDark ? "#9A9588" : "#4A6585"; e.currentTarget.style.transform = "rotate(0deg)"; }}
            >
                <RefreshCw size={15} />
            </button>

            <SpreadIcon accent={accent} />
            <AnimatePresence mode="wait">
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: .25 }}
                    style={{ width: "100%" }}
                >
                    <p style={{
                        fontFamily: "'Playfair Display',serif", fontStyle: "italic",
                        fontSize: 17, lineHeight: 1.65, fontWeight: 500,
                        color: isDark ? "#F2EDE4" : "#0A1628", margin: 0,
                    }}>
                        "{v.texto}"
                    </p>
                    <p style={{
                        margin: "14px 0 0", fontSize: 11, fontWeight: 600,
                        letterSpacing: ".18em", textTransform: "uppercase",
                        color: isDark ? "#9A9588" : "#1E3A5F",
                    }}>
                        {v.referencia}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

/* ─── aspas ornamentais ─── */
function SpreadIcon({ accent }) {
    return (
        <svg width="26" height="20" viewBox="0 0 26 20" fill="none" style={{ marginBottom: 10, opacity: .9 }} aria-hidden="true">
            <path d="M10 0C4 3 1 7 1 11.5C1 16 4 19 8 19C11 19 13 16.8 13 14C13 11.4 11.2 9.6 8.8 9.6C8 9.6 7.3 9.8 7 10.1C7.5 7.4 9.8 4.6 10 4.5V0Z" fill={accent} />
            <path d="M26 0C20 3 17 7 17 11.5C17 16 20 19 24 19C27 19 29 16.8 29 14C29 11.4 27.2 9.6 24.8 9.6C24 9.6 23.3 9.8 23 10.1C23.5 7.4 25.8 4.6 26 4.5V0Z" fill={accent} opacity=".45" />
        </svg>
    );
}
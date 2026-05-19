import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
    Flame, Search, Calendar, ChevronDown,
    Loader2, RefreshCw, Users, CheckCircle2,
    TrendingUp, Filter, Download, X, FileText,
} from "lucide-react";

const IEQ = {
    red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
    yellow: "#FDB813", blue: "#003DA5", blueDark: "#002470",
    blueLight: "#1A56C4", offWhite: "#F5F0E8",
};

const STATUS_MAP = {
    EM_ANDAMENTO: { label: "EM ANDAMENTO", color: "#7A9E7E" },
    CONCLUIDA:    { label: "CONCLUÍDA",    color: IEQ.yellow },
    CANCELADA:    { label: "CANCELADA",    color: IEQ.redLight },
};

/* ─── utilitários PDF ─────────────────────────────────────────── */

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement("script");
        s.src = src; s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
    });
}

async function ensureLibs() {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
}

/* ─── Gerador de PDF ─────────────────────────────────────────── */

async function gerarPDF({ missoes, modo, celulaFiltro, nomeArquivo }) {
    await ensureLibs();
    const { jsPDF } = window.jspdf;

    const lista = modo === "celula" && celulaFiltro
        ? missoes.filter(m => (m.nomeCelula ?? "") === celulaFiltro)
        : missoes;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const PW = 210, ML = 14, MR = 14, CW = PW - ML - MR;
    let y = 0;

    const paleta = {
        vermelho:    [200, 16, 46],
        amarelo:     [253, 184, 19],
        azul:        [26, 86, 196],
        verde:       [122, 158, 126],
        fundoEscuro: [17, 10, 13],
        fundoCard:   [245, 240, 232],
        cinzaClaro:  [240, 234, 232],
        cinzaMedio:  [180, 170, 165],
        branco:      [255, 255, 255],
        pretinho:    [30, 15, 18],
    };

    function novaPage() {
        doc.addPage();
        y = 0;
        rodape();
    }

    function verificaEspaco(necessario) {
        if (y + necessario > 277) novaPage();
    }

    function rodape() {
        const pg = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(7);
        doc.setTextColor(...paleta.cinzaMedio);
        doc.text(`IEQ PITUAÇU · RELATÓRIO MISSÃO 70 · Página ${pg}`, PW / 2, 290, { align: "center" });
        doc.setDrawColor(...paleta.vermelho);
        doc.setLineWidth(0.3);
        doc.line(ML, 286, PW - MR, 286);
    }

    // ── Cabeçalho capa ──────────────────────────────────────────
    doc.setFillColor(...paleta.fundoEscuro);
    doc.rect(0, 0, PW, 58, "F");

    // faixa amarela decorativa
    doc.setFillColor(...paleta.amarelo);
    doc.rect(0, 54, PW, 4, "F");

    // Cruz decorativa (simplificada em retângulos)
    doc.setFillColor(...paleta.vermelho);
    doc.rect(12, 8, 6, 22, "F");  // vertical
    doc.setFillColor(...paleta.azul);
    doc.rect(7, 14, 16, 6, "F"); // horizontal
    doc.setFillColor(...paleta.amarelo);
    doc.rect(12, 14, 6, 6, "F"); // centro

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...paleta.branco);
    doc.text("MISSÃO 70", 32, 20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...paleta.amarelo);
    doc.text("RELATÓRIO PASTORAL DE EVANGELISMO", 32, 27);

    doc.setTextColor(...paleta.cinzaMedio);
    doc.setFontSize(7.5);
    const subtitulo = modo === "celula" && celulaFiltro
        ? `Célula: ${celulaFiltro}`
        : "Visão geral — todas as missões";
    doc.text(subtitulo, 32, 33);

    // Data
    const agora = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    doc.setTextColor(...paleta.cinzaMedio);
    doc.setFontSize(7);
    doc.text(`Gerado em ${agora}`, PW - MR, 50, { align: "right" });

    y = 66;
    rodape();

    // ── Resumo geral ──────────────────────────────────────────
    const total       = lista.length;
    const emAndamento = lista.filter(m => m.status === "EM_ANDAMENTO").length;
    const concluidas  = lista.filter(m => m.status === "CONCLUIDA").length;
    const canceladas  = lista.filter(m => m.status === "CANCELADA").length;
    const totalVisit  = lista.reduce((s, m) => s + (m.totalVisitantes ?? 0), 0);
    const totalJesus  = lista.reduce((s, m) => s + (m.totalAceitouJesus ?? 0), 0);
    const totalReconc = lista.reduce((s, m) => s + (m.totalReconciliacao ?? 0), 0);
    const totalBat    = lista.reduce((s, m) => s + (m.totalDesejoBatismo ?? 0), 0);

    // título da seção
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...paleta.vermelho);
    doc.text("RESUMO GERAL", ML, y);
    doc.setDrawColor(...paleta.vermelho);
    doc.setLineWidth(0.3);
    doc.line(ML, y + 1.5, ML + 28, y + 1.5);
    y += 6;

    // Cards de estatísticas (2 linhas × 4 colunas)
    const cards = [
        { label: "TOTAL",       valor: total,       cor: paleta.pretinho },
        { label: "EM ANDAMENTO",valor: emAndamento,  cor: paleta.verde    },
        { label: "CONCLUÍDAS",  valor: concluidas,   cor: paleta.amarelo  },
        { label: "CANCELADAS",  valor: canceladas,   cor: paleta.vermelho },
        { label: "VISITANTES",  valor: totalVisit,   cor: paleta.azul     },
        { label: "ACEIT. JESUS",valor: totalJesus,   cor: paleta.verde    },
        { label: "RECONCILIAÇÃO",valor: totalReconc, cor: paleta.azul     },
        { label: "BATISMO",     valor: totalBat,     cor: paleta.amarelo  },
    ];

    const cardW = (CW - 9) / 4;
    cards.forEach((c, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const cx = ML + col * (cardW + 3);
        const cy = y + row * 18;

        doc.setFillColor(...paleta.cinzaClaro);
        doc.roundedRect(cx, cy, cardW, 14, 1.5, 1.5, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...c.cor);
        doc.text(String(c.valor), cx + cardW / 2, cy + 7, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.5);
        doc.setTextColor(...paleta.cinzaMedio);
        doc.text(c.label, cx + cardW / 2, cy + 11.5, { align: "center" });
    });

    y += 40;

    // ── Linha separadora ──────────────────────────────────────
    doc.setDrawColor(...paleta.amarelo);
    doc.setLineWidth(0.5);
    doc.line(ML, y, PW - MR, y);
    y += 8;

    // ── Decisões de fé — barras ───────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...paleta.vermelho);
    doc.text("DECISÕES DE FÉ — TOTAL GERAL", ML, y);
    doc.setLineWidth(0.3);
    doc.line(ML, y + 1.5, ML + 52, y + 1.5);
    y += 7;

    const maxDecisao = Math.max(totalJesus, totalReconc, totalBat, 1);
    const barras = [
        { label: "Aceitaram Jesus",  valor: totalJesus,  cor: paleta.verde   },
        { label: "Reconciliação",    valor: totalReconc, cor: paleta.azul    },
        { label: "Desejo de Batismo",valor: totalBat,    cor: paleta.amarelo },
    ];

    barras.forEach(b => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...paleta.pretinho);
        doc.text(b.label, ML, y + 3.5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...b.cor);
        doc.text(String(b.valor), PW - MR, y + 3.5, { align: "right" });

        // trilho
        doc.setFillColor(...paleta.cinzaClaro);
        doc.roundedRect(ML + 50, y, CW - 58, 4, 1, 1, "F");

        // barra preenchida
        const pct = b.valor / maxDecisao;
        if (pct > 0) {
            doc.setFillColor(...b.cor);
            doc.roundedRect(ML + 50, y, (CW - 58) * pct, 4, 1, 1, "F");
        }
        y += 9;
    });

    y += 4;

    // ── Tabela de missões ─────────────────────────────────────
    verificaEspaco(30);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...paleta.vermelho);
    doc.text(`MISSÕES (${lista.length})`, ML, y);
    doc.setLineWidth(0.3);
    doc.line(ML, y + 1.5, ML + 24, y + 1.5);
    y += 7;

    // cabeçalho tabela
    const cols = {
        nome:     { x: ML,      w: 46 },
        celula:   { x: ML + 47, w: 34 },
        lider:    { x: ML + 82, w: 30 },
        semanas:  { x: ML + 113,w: 16 },
        visit:    { x: ML + 130,w: 16 },
        decisoes: { x: ML + 147,w: 16 },
        status:   { x: ML + 164,w: 18 },
    };

    doc.setFillColor(...paleta.fundoEscuro);
    doc.rect(ML, y, CW, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(...paleta.amarelo);
    const cabLabels = {
        nome: "MISSÃO", celula: "CÉLULA", lider: "LÍDER",
        semanas: "SEM.", visit: "VISIT.", decisoes: "DECIS.", status: "STATUS",
    };
    Object.entries(cols).forEach(([key, c]) => {
        doc.text(cabLabels[key], c.x + 1, y + 4.5);
    });

    y += 7;

    // linhas de dados
    lista.forEach((m, idx) => {
        verificaEspaco(12);

        const par = idx % 2 === 0;
        doc.setFillColor(par ? 255 : 248, par ? 255 : 244, par ? 255 : 242);
        doc.rect(ML, y, CW, 9, "F");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...paleta.pretinho);

        const truncar = (str, max) => str && str.length > max ? str.slice(0, max - 1) + "…" : (str ?? "—");
        const decisoes = (m.totalAceitouJesus ?? 0) + (m.totalReconciliacao ?? 0) + (m.totalDesejoBatismo ?? 0);
        const statusInfo = STATUS_MAP[m.status] ?? { label: m.status, color: "#999" };

        doc.text(truncar(m.nome || `Missão #${m.id}`, 28), cols.nome.x + 1,   y + 5.5);
        doc.text(truncar(m.nomeCelula, 20),               cols.celula.x + 1,  y + 5.5);
        doc.text(truncar(m.nomeLider, 18),                cols.lider.x + 1,   y + 5.5);
        doc.text(`${m.semanasRealizadas ?? 0}/4`,          cols.semanas.x + 1, y + 5.5);
        doc.text(String(m.totalVisitantes ?? 0),           cols.visit.x + 1,   y + 5.5);
        doc.text(String(decisoes),                         cols.decisoes.x + 1,y + 5.5);

        // badge de status
        const corHex = statusInfo.color;
        const rgb = hexToRgb(corHex) ?? paleta.cinzaMedio;
        doc.setFontSize(5.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...rgb);
        doc.text(statusInfo.label, cols.status.x + 1, y + 5.5);

        // linha divisória
        doc.setDrawColor(...paleta.cinzaClaro);
        doc.setLineWidth(0.1);
        doc.line(ML, y + 9, PW - MR, y + 9);

        y += 9;
    });

    y += 6;

    // ── Detalhe por missão (uma por página) ───────────────────
    lista.forEach((m) => {
        doc.addPage();
        y = 0;
        rodape();

        // ── Header do card de missão ──
        const concluida = m.status === "CONCLUIDA";
        const corStatus = concluida ? paleta.verde : (m.status === "CANCELADA" ? paleta.vermelho : paleta.amarelo);

        doc.setFillColor(...paleta.fundoEscuro);
        doc.rect(0, 0, PW, 30, "F");

        doc.setFillColor(...corStatus);
        doc.rect(0, 27, PW, 3, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...paleta.branco);
        doc.text(m.nome || `Missão #${m.id}`, ML, 14);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...paleta.cinzaMedio);
        const sub = [m.nomeCelula ? `Célula: ${m.nomeCelula}` : null, m.endereco].filter(Boolean).join(" · ");
        doc.text(sub || " ", ML, 21);

        // badge status
        const sInfo = STATUS_MAP[m.status] ?? { label: m.status };
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...corStatus);
        doc.text(`● ${sInfo.label}`, PW - MR, 14, { align: "right" });

        y = 38;

        // ── 4 mini-cards de métricas ──
        const metricas = [
            { label: "SEMANAS",   valor: `${m.semanasRealizadas ?? 0}/4`,            cor: paleta.amarelo },
            { label: "VISITANTES",valor: String(m.totalVisitantes ?? 0),             cor: paleta.azul    },
            { label: "ACEIT. JESUS",valor: String(m.totalAceitouJesus ?? 0),         cor: paleta.verde   },
            { label: "DECISÕES",  valor: String((m.totalAceitouJesus ?? 0) + (m.totalReconciliacao ?? 0) + (m.totalDesejoBatismo ?? 0)), cor: paleta.vermelho },
        ];
        const mW = (CW - 9) / 4;
        metricas.forEach((mt, i) => {
            const cx = ML + i * (mW + 3);
            doc.setFillColor(...paleta.cinzaClaro);
            doc.roundedRect(cx, y, mW, 16, 1.5, 1.5, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.setTextColor(...mt.cor);
            doc.text(mt.valor, cx + mW / 2, y + 9, { align: "center" });

            doc.setFont("helvetica", "normal");
            doc.setFontSize(5.5);
            doc.setTextColor(...paleta.cinzaMedio);
            doc.text(mt.label, cx + mW / 2, y + 13.5, { align: "center" });
        });
        y += 22;

        // ── Progresso semanal (4 boxes) ──
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...paleta.vermelho);
        doc.text("PROGRESSO SEMANAL", ML, y);
        y += 5;

        const bxW = (CW - 9) / 4;
        for (let idx = 0; idx < 4; idx++) {
            const feita = idx < (m.semanasRealizadas ?? 0);
            const bx = ML + idx * (bxW + 3);
            doc.setFillColor(feita ? (concluida ? 122 : 253) : 230,
                feita ? (concluida ? 158 : 184) : 226,
                feita ? (concluida ? 126 : 19)  : 222);
            doc.roundedRect(bx, y, bxW, 10, 1.5, 1.5, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(feita ? 255 : 170, feita ? 255 : 160, feita ? 255 : 155);
            doc.text(`${idx + 1}`, bx + bxW / 2, y + 6.5, { align: "center" });
        }
        y += 16;

        // ── Informações em 2 colunas ──
        doc.setDrawColor(...paleta.amarelo);
        doc.setLineWidth(0.4);
        doc.line(ML, y, PW - MR, y);
        y += 6;

        const colEsq = ML;
        const colDir = ML + CW / 2 + 3;
        const colW2  = CW / 2 - 3;

        // coluna esquerda — informações
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...paleta.vermelho);
        doc.text("INFORMAÇÕES", colEsq, y);
        y += 5;

        const infos = [
            { label: "Anfitrião",   valor: m.nomeAnfitriao },
            { label: "Líder",       valor: m.nomeLider      },
            { label: "Auxiliar",    valor: m.nomeAuxiliar   },
            { label: "Endereço",    valor: m.endereco        },
            { label: "Data Início", valor: m.dataInicio      },
        ].filter(r => r.valor);

        const yInfoStart = y;
        infos.forEach(info => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6);
            doc.setTextColor(...paleta.cinzaMedio);
            doc.text(info.label.toUpperCase(), colEsq, y);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(...paleta.pretinho);
            const linhas = doc.splitTextToSize(info.valor, colW2);
            doc.text(linhas, colEsq, y + 4);
            y += 4 + linhas.length * 4 + 3;
        });

        // coluna direita — decisões de fé
        let yD = yInfoStart;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...paleta.vermelho);
        doc.text("DECISÕES DE FÉ", colDir, yD);
        yD += 5;

        const decisoesDet = [
            { label: "Aceitaram Jesus",  valor: m.totalAceitouJesus ?? 0,  cor: paleta.verde   },
            { label: "Reconciliação",    valor: m.totalReconciliacao ?? 0,  cor: paleta.azul    },
            { label: "Desejo de Batismo",valor: m.totalDesejoBatismo ?? 0,  cor: paleta.amarelo },
            { label: "Total Visitantes", valor: m.totalVisitantes ?? 0,     cor: paleta.azul    },
        ];

        decisoesDet.forEach(d => {
            doc.setFillColor(...paleta.cinzaClaro);
            doc.roundedRect(colDir, yD, colW2, 11, 1.5, 1.5, "F");

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(...paleta.pretinho);
            doc.text(d.label, colDir + 3, yD + 6.5);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(...d.cor);
            doc.text(String(d.valor), colDir + colW2 - 3, yD + 7, { align: "right" });

            yD += 13;
        });

        // linha final separando registros
        y = Math.max(y, yD) + 4;
    });

    doc.save(`${nomeArquivo}.pdf`);
}

function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : null;
}

/* ─── Componentes UI ─────────────────────────────────────────── */

function BadgeStatus({ status }) {
    const s = STATUS_MAP[status] || { label: status, color: IEQ.offWhite };
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 12px", borderRadius: 99,
            fontFamily: "'Cinzel',serif", fontSize: "8px", fontWeight: 700, letterSpacing: ".15em",
            color: s.color, border: `1px solid ${s.color}55`, background: `${s.color}18`,
        }}>
            ✦ {s.label}
        </span>
    );
}

function StatCard({ label, value, color, icon: Icon, sub, isDark, delay = 0 }) {
    const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
    const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
    const cardBg        = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
    const cardBorder    = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, backdropFilter: "blur(24px)", padding: "20px 22px", position: "relative", overflow: "hidden" }}
        >
            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${color}10` }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8.5px", letterSpacing: ".2em", color: textSecondary, margin: 0 }}>{label}</p>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={15} color={color} />
                </div>
            </div>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 32, fontWeight: 700, color, margin: "0 0 4px", lineHeight: 1 }}>{value}</p>
            {sub && <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: textSecondary, margin: 0 }}>{sub}</p>}
        </motion.div>
    );
}

function ProgressBar({ value, max, color }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ height: "100%", borderRadius: 99, background: color }} />
        </div>
    );
}

/* ─── Modal de Exportação PDF ────────────────────────────────── */

function ModalExportPDF({ missoes, onClose, isDark }) {
    const [modo, setModo]             = useState("geral");
    const [celulaFiltro, setCelula]   = useState("");
    const [gerando, setGerando]       = useState(false);
    const [feito, setFeito]           = useState(false);

    const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
    const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
    const cardBg        = isDark ? "rgba(17,10,13,.99)" : "rgba(255,255,255,.98)";
    const cardBorder    = isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)";
    const inputStyle    = {
        width: "100%", background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)",
        border: `1px solid ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}`,
        color: textPrimary, padding: "10px 14px", borderRadius: 8, outline: "none",
        fontFamily: "'EB Garamond',serif", fontSize: 14, boxSizing: "border-box",
    };

    const celulas = [...new Set(missoes.map(m => m.nomeCelula).filter(Boolean))].sort();

    const qtd = modo === "celula" && celulaFiltro
        ? missoes.filter(m => m.nomeCelula === celulaFiltro).length
        : missoes.length;

    async function handleGerar() {
        if (modo === "celula" && !celulaFiltro) return;
        setGerando(true);
        try {
            const nomeArquivo = modo === "celula"
                ? `Missao70_Celula_${celulaFiltro.replace(/\s+/g, "_")}`
                : "Missao70_Relatorio_Geral";
            await gerarPDF({ missoes, modo, celulaFiltro, nomeArquivo });
            setFeito(true);
            setTimeout(() => setFeito(false), 3000);
        } catch (e) {
            console.error(e);
            alert("Erro ao gerar PDF. Tente novamente.");
        } finally {
            setGerando(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(10,6,8,.8)", backdropFilter: "blur(12px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: .94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .94, y: 16 }}
                transition={{ duration: .25 }}
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 18, backdropFilter: "blur(32px)", width: "100%", maxWidth: 460, overflow: "hidden" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header do modal */}
                <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(200,16,46,.1)", border: "1px solid rgba(200,16,46,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FileText size={18} color={IEQ.red} />
                        </div>
                        <div>
                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700, letterSpacing: ".14em", color: textPrimary, margin: 0 }}>EXPORTAR PDF</p>
                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: textSecondary, margin: 0 }}>Relatório Missão 70</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: textSecondary, display: "flex", padding: 4 }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Corpo */}
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>

                    {/* Escolha do modo */}
                    <div>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: ".18em", color: textSecondary, margin: "0 0 10px" }}>TIPO DE RELATÓRIO</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            {[
                                { val: "geral",  label: "Geral",     desc: "Todas as missões" },
                                { val: "celula", label: "Por Célula", desc: "Filtrar por célula" },
                            ].map(op => (
                                <button key={op.val} onClick={() => setModo(op.val)} style={{
                                    padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                                    background: modo === op.val ? "rgba(200,16,46,.1)" : (isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)"),
                                    border: `1.5px solid ${modo === op.val ? IEQ.red : cardBorder}`,
                                    transition: "all .18s",
                                }}>
                                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: modo === op.val ? IEQ.red : textPrimary, margin: "0 0 2px" }}>{op.label}</p>
                                    <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 11, color: textSecondary, margin: 0 }}>{op.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Seletor de célula */}
                    <AnimatePresence>
                        {modo === "celula" && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: ".18em", color: textSecondary, margin: "0 0 6px" }}>SELECIONE A CÉLULA</p>
                                <select style={inputStyle} value={celulaFiltro} onChange={e => setCelula(e.target.value)}>
                                    <option value="">— Escolha uma célula —</option>
                                    {celulas.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {celulas.length === 0 && (
                                    <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 12, color: textSecondary, margin: "6px 0 0" }}>
                                        Nenhuma célula cadastrada nas missões.
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Preview info */}
                    <div style={{ padding: "12px 16px", borderRadius: 10, background: isDark ? "rgba(253,184,19,.05)" : "rgba(253,184,19,.08)", border: "1px solid rgba(253,184,19,.2)", display: "flex", alignItems: "center", gap: 10 }}>
                        <Flame size={16} color={IEQ.yellow} style={{ flexShrink: 0 }} />
                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textPrimary, margin: 0 }}>
                            {modo === "celula" && !celulaFiltro
                                ? "Selecione uma célula para continuar."
                                : <>Serão exportadas <strong style={{ color: IEQ.yellow }}>{qtd} missão(ões)</strong> com resumo geral e detalhe individual por missão.</>
                            }
                        </p>
                    </div>

                    {/* Botão gerar */}
                    <button
                        onClick={handleGerar}
                        disabled={gerando || (modo === "celula" && !celulaFiltro)}
                        style={{
                            width: "100%", padding: "13px 20px", borderRadius: 10, cursor: gerando || (modo === "celula" && !celulaFiltro) ? "not-allowed" : "pointer",
                            background: feito ? "rgba(122,158,126,.15)" : gerando ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.12)",
                            border: `1.5px solid ${feito ? "#7A9E7E" : IEQ.red}`,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                            fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, letterSpacing: ".14em",
                            color: feito ? "#7A9E7E" : textPrimary,
                            opacity: (modo === "celula" && !celulaFiltro) ? 0.45 : 1,
                            transition: "all .2s",
                        }}
                    >
                        {gerando ? (
                            <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> GERANDO PDF...</>
                        ) : feito ? (
                            <>✓ PDF BAIXADO COM SUCESSO!</>
                        ) : (
                            <><Download size={15} /> BAIXAR PDF</>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─── Componente principal ───────────────────────────────────── */

export default function RelatorioMissao70Pastor({ isDark = true }) {
    const [missoes, setMissoes]         = useState([]);
    const [loading, setLoading]         = useState(true);
    const [expandedId, setExpandedId]   = useState(null);
    const [showModalPDF, setShowModal]  = useState(false);

    const [busca, setBusca]             = useState("");
    const [statusFiltro, setStatus]     = useState("");
    const [dataInicio, setDataInicio]   = useState("");
    const [dataFim, setDataFim]         = useState("");
    const [showFiltros, setShowFiltros] = useState(false);

    const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
    const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
    const cardBg        = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
    const cardBorder    = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";
    const ieqCard       = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, backdropFilter: "blur(24px)" };
    const inputStyle    = { width: "100%", background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)", border: `1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"}`, color: textPrimary, padding: "11px 14px", borderRadius: 8, outline: "none", fontFamily: "'EB Garamond',serif", fontSize: 14, boxSizing: "border-box" };
    const labelStyle    = { fontFamily: "'Cinzel',serif", fontSize: "8.5px", letterSpacing: ".18em", color: textSecondary, margin: "0 0 6px", display: "block" };

    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        .m70p-input:focus { border-color: ${IEQ.red} !important; box-shadow: 0 0 0 3px rgba(200,16,46,.12); }
        .m70p-input::placeholder { color: ${isDark ? "rgba(245,240,232,.22)" : "rgba(26,10,13,.3)"}; }
        .m70p-input option { background: ${isDark ? "#110A0D" : "#fff"}; }
        input[type="date"].m70p-input::-webkit-calendar-picker-indicator { filter: ${isDark ? "invert(1) opacity(0.4)" : "opacity(0.5)"}; cursor: pointer; }
        .m70p-card { transition: border-color .25s, box-shadow .25s; }
        .m70p-card:hover { border-color: rgba(253,184,19,.35) !important; box-shadow: 0 6px 24px rgba(253,184,19,.07); }
        .m70p-row { cursor: pointer; }
        .m70p-row:hover { background: ${isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.01)"}; }
        .m70p-btn { background: ${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"}; color: ${isDark ? IEQ.offWhite : "#8B0B1F"}; border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"}; border-radius: 8px; font-family: 'Cinzel',serif; font-size: 9.5px; font-weight: 700; letter-spacing: .14em; cursor: pointer; transition: all .2s; padding: 9px 16px; display: inline-flex; align-items: center; gap: 7px; }
        .m70p-btn:hover { border-color: ${IEQ.red}; background: rgba(200,16,46,.1); color: ${IEQ.redLight}; }
        .m70p-btn-pdf { background: rgba(200,16,46,.1); color: ${IEQ.red}; border: 1px solid rgba(200,16,46,.3); border-radius: 8px; font-family: 'Cinzel',serif; font-size: 9.5px; font-weight: 700; letter-spacing: .14em; cursor: pointer; transition: all .2s; padding: 9px 16px; display: inline-flex; align-items: center; gap: 7px; }
        .m70p-btn-pdf:hover { background: rgba(200,16,46,.18); border-color: ${IEQ.red}; }
        .m70p-btn-clear { background: transparent; color: ${textSecondary}; border: 1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}; border-radius: 8px; font-family: 'Cinzel',serif; font-size: 8.5px; font-weight: 700; letter-spacing: .12em; cursor: pointer; padding: 8px 12px; transition: all .2s; }
        .m70p-btn-clear:hover { border-color: ${IEQ.red}; color: ${IEQ.redLight}; }
        @media(min-width:640px) { .m70p-stats { grid-template-columns: repeat(4,1fr) !important; } .m70p-filtros-grid { grid-template-columns: 1fr 1fr !important; } }
    `;

    const carregar = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFiltro) params.append("status", statusFiltro);
            if (dataInicio)   params.append("dataInicio", dataInicio);
            if (dataFim)      params.append("dataFim", dataFim);
            const url = `/api/pastor/missao70/relatorio${params.toString() ? "?" + params : ""}`;
            const res = await api.get(url);
            setMissoes(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); setMissoes([]); }
        finally { setLoading(false); }
    }, [statusFiltro, dataInicio, dataFim]);

    useEffect(() => { carregar(); }, [carregar]);

    const missoesFiltradas = missoes.filter(m =>
        (m.nome ?? "").toLowerCase().includes(busca.toLowerCase()) ||
        (m.nomeCelula ?? "").toLowerCase().includes(busca.toLowerCase()) ||
        (m.nomeLider ?? "").toLowerCase().includes(busca.toLowerCase()) ||
        (m.endereco ?? "").toLowerCase().includes(busca.toLowerCase())
    );

    const total        = missoes.length;
    const emAndamento  = missoes.filter(m => m.status === "EM_ANDAMENTO").length;
    const concluidas   = missoes.filter(m => m.status === "CONCLUIDA").length;
    const totalVisit   = missoes.reduce((s, m) => s + (m.totalVisitantes ?? 0), 0);
    const totalJesus   = missoes.reduce((s, m) => s + (m.totalAceitouJesus ?? 0), 0);
    const totalReconc  = missoes.reduce((s, m) => s + (m.totalReconciliacao ?? 0), 0);
    const totalBatismo = missoes.reduce((s, m) => s + (m.totalDesejoBatismo ?? 0), 0);

    const temFiltro = busca || statusFiltro || dataInicio || dataFim;
    const limpar    = () => { setBusca(""); setStatus(""); setDataInicio(""); setDataFim(""); };

    if (loading) return (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
            <style>{css}</style>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: IEQ.red }} />
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".2em", color: textSecondary, marginTop: 14 }}>CARREGANDO MISSÃO 70...</p>
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <style>{css}</style>

            {/* Modal PDF */}
            <AnimatePresence>
                {showModalPDF && (
                    <ModalExportPDF
                        missoes={missoes}
                        onClose={() => setShowModal(false)}
                        isDark={isDark}
                    />
                )}
            </AnimatePresence>

            {/* Cabeçalho */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(253,184,19,.12)", border: "1px solid rgba(253,184,19,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Flame size={22} color={IEQ.yellow} />
                    </div>
                    <div>
                        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, letterSpacing: ".16em", color: textPrimary, margin: 0 }}>RELATÓRIO — MISSÃO 70</h2>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textSecondary, margin: "2px 0 0" }}>
                            Visão pastoral de todas as missões de evangelismo
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="m70p-btn-pdf" onClick={() => setShowModal(true)}>
                        <Download size={13} /> BAIXAR PDF
                    </button>
                    <button className="m70p-btn" onClick={carregar}>
                        <RefreshCw size={13} /> ATUALIZAR
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }} className="m70p-stats">
                <StatCard label="TOTAL DE MISSÕES"  value={total}       color={textPrimary}   icon={Flame}        sub="cadastradas"  isDark={isDark} delay={0}    />
                <StatCard label="EM ANDAMENTO"       value={emAndamento} color="#7A9E7E"       icon={TrendingUp}   sub="ativas"       isDark={isDark} delay={0.07} />
                <StatCard label="CONCLUÍDAS"         value={concluidas}  color={IEQ.yellow}    icon={CheckCircle2} sub="finalizadas"  isDark={isDark} delay={0.14} />
                <StatCard label="VISITANTES"         value={totalVisit}  color={IEQ.blueLight} icon={Users}        sub="alcançados"   isDark={isDark} delay={0.21} />
            </div>

            {/* Decisões resumidas */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                        style={{ ...ieqCard, padding: "20px 24px" }}>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: ".2em", color: textSecondary, margin: "0 0 16px" }}>DECISÕES DE FÉ — TOTAL GERAL</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                        { label: "Aceitaram Jesus",  value: totalJesus,   color: "#7A9E7E",     icon: "✝️" },
                        { label: "Reconciliação",    value: totalReconc,  color: IEQ.blueLight, icon: "🕊️" },
                        { label: "Desejo de Batismo",value: totalBatismo, color: IEQ.yellow,    icon: "💧" },
                    ].map(({ label, value, color, icon }) => (
                        <div key={label}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 14 }}>{icon}</span>
                                    <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: textPrimary }}>{label}</span>
                                </div>
                                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color }}>{value}</span>
                            </div>
                            <ProgressBar value={value} max={Math.max(totalJesus, totalReconc, totalBatismo, 1)} color={color} />
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Filtros */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
                        style={{ ...ieqCard, padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: showFiltros ? 16 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                        <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
                            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: textSecondary, pointerEvents: "none" }} />
                            <input className="m70p-input" style={{ ...inputStyle, paddingLeft: 36 }}
                                   placeholder="Buscar por nome, célula, líder..."
                                   value={busca} onChange={e => setBusca(e.target.value)} />
                        </div>
                        <button className="m70p-btn" onClick={() => setShowFiltros(f => !f)}>
                            <Filter size={13} /> FILTROS {showFiltros ? "▲" : "▼"}
                        </button>
                    </div>
                    {temFiltro && <button className="m70p-btn-clear" onClick={limpar}>✕ LIMPAR</button>}
                </div>

                <AnimatePresence>
                    {showFiltros && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }} className="m70p-filtros-grid">
                                <div>
                                    <p style={labelStyle}>STATUS</p>
                                    <select className="m70p-input" style={inputStyle} value={statusFiltro} onChange={e => setStatus(e.target.value)}>
                                        <option value="">Todos</option>
                                        <option value="EM_ANDAMENTO">Em Andamento</option>
                                        <option value="CONCLUIDA">Concluída</option>
                                        <option value="CANCELADA">Cancelada</option>
                                    </select>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                    <div>
                                        <p style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 5 }}><Calendar size={9} /> DATA INÍCIO — DE</p>
                                        <input type="date" className="m70p-input" style={inputStyle} value={dataInicio} max={dataFim || undefined} onChange={e => setDataInicio(e.target.value)} />
                                    </div>
                                    <div>
                                        <p style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 5 }}><Calendar size={9} /> DATA INÍCIO — ATÉ</p>
                                        <input type="date" className="m70p-input" style={inputStyle} value={dataFim} min={dataInicio || undefined} onChange={e => setDataFim(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            {temFiltro && (
                                <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 12, color: textSecondary, margin: "12px 0 0" }}>
                                    {missoesFiltradas.length === 0 ? "Nenhuma missão encontrada." : `${missoesFiltradas.length} missão(ões) encontrada(s).`}
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Lista de missões */}
            <div>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, letterSpacing: ".18em", color: textPrimary, margin: "0 0 14px" }}>
                    MISSÕES ({missoesFiltradas.length})
                </p>

                {missoesFiltradas.length === 0 ? (
                    <div style={{ ...ieqCard, textAlign: "center", padding: "56px 24px" }}>
                        <Flame size={36} style={{ color: textSecondary, marginBottom: 14 }} />
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: ".18em", color: textSecondary, margin: "0 0 6px" }}>NENHUMA MISSÃO ENCONTRADA</p>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: textSecondary }}>Ajuste os filtros ou aguarde o cadastro de novas missões.</p>
                    </div>
                ) : missoesFiltradas.map((m, i) => {
                    const isOpen    = expandedId === m.id;
                    const concluida = m.status === "CONCLUIDA";
                    const cancelada = m.status === "CANCELADA";

                    return (
                        <motion.div key={m.id} className="m70p-card"
                                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{ ...ieqCard, marginBottom: 10, overflow: "hidden", borderColor: concluida ? "rgba(122,158,126,.4)" : isOpen ? "rgba(253,184,19,.4)" : cardBorder }}
                        >
                            <div className="m70p-row" onClick={() => setExpandedId(isOpen ? null : m.id)}
                                 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", gap: 12, flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 11, flexShrink: 0, background: concluida ? "rgba(122,158,126,.15)" : cancelada ? "rgba(200,16,46,.08)" : "linear-gradient(135deg,rgba(253,184,19,.18),rgba(200,16,46,.1))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                                        {concluida ? "🏆" : cancelada ? "✕" : "🔥"}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700, letterSpacing: ".1em", color: textPrimary, margin: 0 }}>
                                            {m.nome || `Missão #${m.id}`}
                                        </p>
                                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: textSecondary, margin: "2px 0 0" }}>
                                            {m.nomeCelula ? `Célula: ${m.nomeCelula}` : "Sem célula"} · {m.endereco || ""}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                                    <div style={{ textAlign: "center" }}>
                                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: concluida ? "#7A9E7E" : IEQ.yellow, margin: 0 }}>{m.semanasRealizadas}/4</p>
                                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 11, color: textSecondary, margin: 0 }}>semanas</p>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: IEQ.blueLight, margin: 0 }}>{m.totalVisitantes}</p>
                                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 11, color: textSecondary, margin: 0 }}>visitantes</p>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: "#7A9E7E", margin: 0 }}>
                                            {(m.totalAceitouJesus ?? 0) + (m.totalReconciliacao ?? 0) + (m.totalDesejoBatismo ?? 0)}
                                        </p>
                                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 11, color: textSecondary, margin: 0 }}>decisões</p>
                                    </div>
                                    <BadgeStatus status={m.status} />
                                    <ChevronDown size={16} color={textSecondary} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .25s" }} />
                                </div>
                            </div>

                            <div style={{ padding: "0 20px 10px" }}>
                                <div style={{ display: "flex", gap: 4 }}>
                                    {Array.from({ length: 4 }, (_, idx) => (
                                        <div key={idx} style={{ flex: 1, height: 4, borderRadius: 99, background: idx < m.semanasRealizadas ? (concluida ? "#7A9E7E" : IEQ.yellow) : (isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"), transition: "background .3s" }} />
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: "hidden" }}>
                                        <div style={{ borderTop: `1px solid ${isDark ? "rgba(253,184,19,.1)" : "rgba(253,184,19,.12)"}`, padding: "20px" }}>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8.5px", letterSpacing: ".2em", color: textSecondary, margin: 0 }}>INFORMAÇÕES</p>
                                                    {[
                                                        { label: "Anfitrião",   value: m.nomeAnfitriao, emoji: "🏠" },
                                                        { label: "Líder",       value: m.nomeLider,     emoji: "👤" },
                                                        { label: "Auxiliar",    value: m.nomeAuxiliar,  emoji: "🤝" },
                                                        { label: "Endereço",    value: m.endereco,      emoji: "📍" },
                                                        { label: "Data Início", value: m.dataInicio,    emoji: "📅" },
                                                    ].filter(r => r.value).map(({ label, value, emoji }) => (
                                                        <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                                            <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{emoji}</span>
                                                            <div>
                                                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: "7.5px", letterSpacing: ".15em", color: textSecondary, margin: "0 0 1px" }}>{label.toUpperCase()}</p>
                                                                <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: textPrimary, margin: 0 }}>{value}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8.5px", letterSpacing: ".2em", color: textSecondary, margin: 0 }}>DECISÕES DE FÉ</p>
                                                    {[
                                                        { label: "Aceitaram Jesus",  value: m.totalAceitouJesus,   color: "#7A9E7E",     icon: "✝️" },
                                                        { label: "Reconciliação",    value: m.totalReconciliacao,  color: IEQ.blueLight, icon: "🕊️" },
                                                        { label: "Desejo de Batismo",value: m.totalDesejoBatismo,  color: IEQ.yellow,    icon: "💧" },
                                                    ].map(({ label, value, color, icon }) => (
                                                        <div key={label} style={{ padding: "12px 14px", borderRadius: 10, background: `${color}10`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                <span style={{ fontSize: 14 }}>{icon}</span>
                                                                <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textPrimary }}>{label}</span>
                                                            </div>
                                                            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 700, color }}>{value ?? 0}</span>
                                                        </div>
                                                    ))}
                                                    <div style={{ padding: "12px 14px", borderRadius: 10, background: `${IEQ.blueLight}10`, border: `1px solid ${IEQ.blueLight}30`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            <span style={{ fontSize: 14 }}>👥</span>
                                                            <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textPrimary }}>Total Visitantes</span>
                                                        </div>
                                                        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 700, color: IEQ.blueLight }}>{m.totalVisitantes ?? 0}</span>
                                                    </div>
                                                    <div style={{ marginTop: 4 }}>
                                                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: ".15em", color: textSecondary, margin: "0 0 8px" }}>PROGRESSO SEMANAL</p>
                                                        <div style={{ display: "flex", gap: 6 }}>
                                                            {Array.from({ length: 4 }, (_, idx) => {
                                                                const feita = idx < m.semanasRealizadas;
                                                                return (
                                                                    <div key={idx} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, textAlign: "center", background: feita ? (concluida ? "rgba(122,158,126,.15)" : "rgba(253,184,19,.12)") : (isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)"), border: `1px solid ${feita ? (concluida ? "rgba(122,158,126,.3)" : "rgba(253,184,19,.3)") : "transparent"}` }}>
                                                                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, color: feita ? (concluida ? "#7A9E7E" : IEQ.yellow) : textSecondary, margin: 0 }}>{idx + 1}</p>
                                                                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 9, color: textSecondary, margin: "2px 0 0" }}>{feita ? "✓" : "—"}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
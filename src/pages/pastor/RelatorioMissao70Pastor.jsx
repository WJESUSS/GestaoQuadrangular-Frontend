import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
    Flame, Search, ChevronDown, ChevronUp, Loader2, RefreshCw, Users,
    CheckCircle, TrendingUp, Filter, FileDown, X, FileText,
    Sparkles, Handshake, Droplets, Home, User, MapPin, CalendarDays,
    Activity, RotateCcw, Heart, Star, Clock, XCircle,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── Tokens AURA (idênticos ao CasasDePaz) ───────────────────────────── */
const AURA = {
    gold:      "#C9A96E",
    goldLight: "#E8D5A3",
    dark:      "#0A0A0F",
    darkEl:    "#12121A",
    light:     "#F5F0E8",
    red:       "#C8102E",
    redDark:   "#9B0B1E",
    redLight:  "#E8294A",
    blue:      "#003DA5",
    blueDark:  "#002470",
    blueFade:  "#7AABF4",
    yellow:    "#FDB813",
    teal:      "#5DCAA5",
    gray:      "#B4B2A9",
};

function theme(isDark) {
    return {
        bg:            isDark ? "#0A0A0F"                : "#F5F0E8",
        bgEl:          isDark ? "rgba(18,18,26,.95)"     : "rgba(255,255,255,.95)",
        bgInput:       isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.04)",
        border:        isDark ? "rgba(201,169,110,.1)"   : "rgba(201,169,110,.2)",
        borderInput:   isDark ? "rgba(201,169,110,.15)"  : "rgba(201,169,110,.28)",
        text:          isDark ? "#F5F0E8"                : "#1A1008",
        textSec:       isDark ? "#9A9588"                : "#6B5E4A",
        textMuted:     isDark ? "#6B6658"                : "#9A9080",
        cardHover:     isDark ? "rgba(201,169,110,.2)"   : "rgba(201,169,110,.35)",
        placeholder:   isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
        optionBg:      isDark ? "#12121A"                : "#F0EAE0",
        innerCardBg:   isDark ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.02)",
        miniStatBg:    isDark ? "rgba(0,0,0,.18)"        : "rgba(0,0,0,.03)",
        progressTrack: isDark ? "rgba(255,255,255,.08)"  : "rgba(0,0,0,.06)",
        tagBg:         isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.035)",
        hoverBg:       isDark ? "rgba(201,169,110,.06)"  : "rgba(201,169,110,.07)",
    };
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function initials(name) {
    return (name || "?").split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}
function pct(real, total) {
    if (!total) return 0;
    return Math.round((real / total) * 100);
}
function fmtDate(str) {
    if (!str) return "—";
    try { return new Date(str).toLocaleDateString("pt-BR"); }
    catch { return str; }
}

/* ─── Status config (mesmo padrão do CasasDePaz) ──────────────────────── */
const STATUS_CFG = {
    EM_ANDAMENTO: { label: "Em Andamento", color: AURA.teal,     bg: "rgba(93,202,165,.12)",  border: "rgba(93,202,165,.3)",  Icon: Clock       },
    CONCLUIDA:    { label: "Concluída",    color: AURA.blueFade, bg: "rgba(0,61,165,.12)",    border: "rgba(0,61,165,.3)",    Icon: CheckCircle  },
    CANCELADA:    { label: "Cancelada",    color: AURA.redLight, bg: "rgba(200,16,46,.1)",    border: "rgba(200,16,46,.25)",  Icon: XCircle      },
};

/* ─── PDF Generator ────────────────────────────────────────────────────── */
function gerarPDFMissao70(grupo) {
    const doc  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W    = doc.internal.pageSize.getWidth();
    const H    = doc.internal.pageSize.getHeight();
    const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(155, 11, 30);
    doc.text("IEQ PITUACU - PAINEL PASTORAL", W / 2, 12, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text("RELATÓRIO MISSÃO 70", W / 2, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text((grupo.celulaName || "").toUpperCase(), W / 2, 27, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em ${hoje}`, W / 2, 33, { align: "center" });

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(10, 37, W - 10, 37);

    const missoes     = grupo.missoes || [];
    const concluidas  = missoes.filter(m => m.status === "CONCLUIDA").length;
    const andamento   = missoes.filter(m => m.status === "EM_ANDAMENTO").length;
    const canceladas  = missoes.filter(m => m.status === "CANCELADA").length;
    const totalVis    = missoes.reduce((s, m) => s + (m.totalVisitantes ?? 0), 0);
    const totalJesus  = missoes.reduce((s, m) => s + (m.totalAceitouJesus ?? 0), 0);
    const totalReconc = missoes.reduce((s, m) => s + (m.totalReconciliacao ?? 0), 0);
    const totalBat    = missoes.reduce((s, m) => s + (m.totalDesejoBatismo ?? 0), 0);
    const totalDec    = totalJesus + totalReconc + totalBat;

    const kpis = [
        { label: "TOTAL MISSÕES",  val: missoes.length, sub: "registradas" },
        { label: "CONCLUÍDAS",     val: concluidas,     sub: "encerradas"  },
        { label: "ANDAMENTO",      val: andamento,      sub: "ativas"      },
        { label: "CANCELADAS",     val: canceladas,     sub: "interromp."  },
        { label: "VISITANTES",     val: totalVis,       sub: "totais"      },
        { label: "DECISÕES",       val: totalDec,       sub: "total vidas" },
    ];

    const kpiW = (W - 20) / kpis.length;
    kpis.forEach((k, i) => {
        const x = 10 + i * kpiW;
        const y = 42;
        doc.setDrawColor(210, 210, 210);
        doc.setFillColor(255, 255, 255);
        doc.rect(x, y, kpiW - 1, 18, "DF");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(100, 100, 100);
        doc.text(k.label, x + 2, y + 4);
        doc.setFontSize(12);
        doc.setTextColor(30, 30, 30);
        doc.text(String(k.val), x + 2, y + 11);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);
        doc.setTextColor(130, 130, 130);
        doc.text(k.sub, x + 2, y + 15);
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(155, 11, 30);
    doc.text(`LISTA DE MISSÕES (${missoes.length})`, 10, 67);

    autoTable(doc, {
        startY: 70,
        head:  [["#", "Nome da Missão", "Líder", "Status", "Semanas", "Visitantes", "Decisões", "Início"]],
        body: missoes.map((m, i) => {
            const sem  = m.semanasRealizadas ?? 0;
            const vis  = m.totalVisitantes ?? 0;
            const dec  = (m.totalAceitouJesus ?? 0) + (m.totalReconciliacao ?? 0) + (m.totalDesejoBatismo ?? 0);
            const st   = m.status === "CONCLUIDA" ? "Concluída" : m.status === "CANCELADA" ? "Cancelada" : "Em Andamento";
            const ini  = m.dataInicio ? new Date(m.dataInicio).toLocaleDateString("pt-BR") : "—";
            return [i + 1, m.nome || `Missão ${m.id}`, m.nomeLider || "—", st, `${sem}/4`, vis, dec, ini];
        }),
        styles:             { fillColor: [255, 255, 255], textColor: [40, 40, 40], fontSize: 8, lineColor: [220, 220, 220], lineWidth: 0.1 },
        headStyles:         { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold", lineColor: [200, 200, 200], lineWidth: 0.2 },
        alternateRowStyles: { fillColor: [249, 249, 249] },
        columnStyles:       { 0: { halign: "center" }, 4: { halign: "center" }, 5: { halign: "center" }, 6: { halign: "center" }, 7: { halign: "center" } },
        margin:             { left: 10, right: 10 },
    });

    let y = doc.lastAutoTable.finalY + 10;

    if (y + 10 > H - 15) { doc.addPage(); y = 15; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(155, 11, 30);
    doc.text("DETALHES POR MISSÃO", 10, y);
    y += 5;

    missoes.forEach((m, i) => {
        const lider    = m.nomeLider    || "";
        const auxiliar = m.nomeAuxiliar || "";
        const anf      = m.nomeAnfitriao|| "";
        const sem      = m.semanasRealizadas ?? 0;
        const vis      = m.totalVisitantes ?? 0;
        const jesus    = m.totalAceitouJesus   ?? 0;
        const reconcil = m.totalReconciliacao  ?? 0;
        const batis    = m.totalDesejoBatismo  ?? 0;
        const totalDecCard = jesus + reconcil + batis;
        const hasEquipe = !!(lider || auxiliar || anf);

        const cardH = 32 + (hasEquipe ? 12 : 0) + (totalDecCard > 0 ? 10 : 0) + 8;

        if (y + cardH > H - 15) { doc.addPage(); y = 15; }

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.rect(10, y, W - 20, cardH);

        let cy = y + 6;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${i + 1}. ${m.nome || `Missão ${m.id}`}`, 14, cy);

        const stLabel = m.status === "CONCLUIDA" ? "Concluída" : m.status === "CANCELADA" ? "Cancelada" : "Em Andamento";
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        doc.text(`Status: ${stLabel}`, W - 14, cy, { align: "right" });
        cy += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(80, 80, 80);
        let infoSub = "";
        if (m.endereco)   infoSub += m.endereco;
        if (m.dataInicio) infoSub += `  |  Início: ${new Date(m.dataInicio).toLocaleDateString("pt-BR")}`;
        if (infoSub) { doc.text(infoSub, 14, cy); cy += 5; }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 100, 100);
        doc.text(`Semanas: ${sem}/4  •  Visitantes: ${vis}  •  Decisões: ${totalDecCard}`, 14, cy);
        cy += 5;

        if (hasEquipe) {
            doc.setDrawColor(230, 230, 230);
            doc.line(14, cy, W - 14, cy);
            cy += 4;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(120, 120, 120);
            doc.text("EQUIPE:", 14, cy);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(30, 30, 30);
            let eq = [];
            if (anf)      eq.push(`Anfitrião: ${anf}`);
            if (lider)    eq.push(`Líder: ${lider}`);
            if (auxiliar) eq.push(`Auxiliar: ${auxiliar}`);
            doc.text(eq.join("   |   "), 30, cy);
            cy += 5;
        }

        if (totalDecCard > 0) {
            doc.setDrawColor(230, 230, 230);
            doc.line(14, cy, W - 14, cy);
            cy += 4;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(120, 120, 120);
            doc.text("DECISÕES:", 14, cy);
            const partes = [
                jesus    > 0 ? `${jesus} Aceitação(ões)`    : "",
                reconcil > 0 ? `${reconcil} Reconciliação(ões)` : "",
                batis    > 0 ? `${batis} Batismo(s)`        : "",
            ].filter(Boolean).join("   |   ");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(155, 11, 30);
            doc.text(partes, 30, cy);
        }

        y += cardH + 4;
    });

    if (y + 15 > H) { doc.addPage(); y = H - 15; }
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(10, y + 2, W - 10, y + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`© IEQ PITUACU - SISTEMA SEGURO - ${new Date().getFullYear()}`, W / 2, y + 7, { align: "center" });

    const nomeArq = `Relatorio_Missao70_${(grupo.celulaName || "geral").replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(nomeArq);
}

/* ─── Subcomponentes (mesmos do CasasDePaz) ───────────────────────────── */
function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] || {
        label: status, color: "#888",
        bg: "rgba(136,136,136,.1)", border: "rgba(136,136,136,.25)", Icon: Activity,
    };
    const { label, color, bg, border } = cfg;
    return (
        <span className="m70-badge" style={{ background: bg, border: `1px solid ${border}`, color }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
            {label.toUpperCase()}
        </span>
    );
}

function SemanasBar({ realizadas = 0, total = 4, t }) {
    const p = pct(realizadas, total);
    const restantes = Math.max(0, total - realizadas);
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, flexWrap: "wrap", gap: 4 }}>
                <span className="m70-eyebrow" style={{ color: t.textMuted }}>SEMANAS</span>
                <span className="m70-eyebrow" style={{ color: t.textMuted }}>
                    {realizadas} / {total} · {restantes} RESTANTE{restantes !== 1 ? "S" : ""}
                </span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: t.progressTrack, overflow: "hidden" }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${AURA.redDark},${AURA.red})` }}
                />
            </div>
        </div>
    );
}

function MiniStat({ label, value, sub, color, t }) {
    return (
        <div style={{ background: t.miniStatBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 12px" }}>
            <div className="m70-eyebrow" style={{ color: t.textMuted, marginBottom: 5 }}>{label}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, lineHeight: 1, color: color || t.text }}>{value}</div>
            {sub && <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 11, color: t.textSec, marginTop: 3 }}>{sub}</div>}
        </div>
    );
}

function Avatar({ name, blue = false, green = false }) {
    const bg    = green ? "rgba(93,202,165,.12)" : blue ? "rgba(0,61,165,.12)" : "rgba(201,169,110,.14)";
    const brd   = green ? "rgba(93,202,165,.25)" : blue ? "rgba(0,61,165,.25)" : "rgba(201,169,110,.28)";
    const color = green ? AURA.teal : blue ? AURA.blueFade : AURA.gold;
    return (
        <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: bg, border: `1px solid ${brd}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, color,
        }}>
            {initials(name)}
        </div>
    );
}

function Div({ t }) {
    return <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${t.border},transparent)`, margin: "12px 0" }} />;
}

/* ─── Card de Missão (espelho do CasaCard) ──────────────────────────────── */
function MissaoCard({ missao, t }) {
    const lider      = missao.nomeLider     || missao.lider      || "";
    const auxiliar   = missao.nomeAuxiliar  || missao.auxiliar   || "";
    const anfitriao  = missao.nomeAnfitriao || missao.anfitriao  || "";
    const semanas    = missao.semanasRealizadas ?? 0;
    const totalSem   = 4;
    const restantes  = Math.max(0, totalSem - semanas);
    const jesus      = missao.totalAceitouJesus   ?? 0;
    const reconcil   = missao.totalReconciliacao  ?? 0;
    const batismos   = missao.totalDesejoBatismo  ?? 0;
    const totalDec   = jesus + reconcil + batismos;
    const totalVis   = missao.totalVisitantes ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
                background: t.innerCardBg,
                border: `1px solid ${t.border}`,
                borderRadius: 14, padding: "16px", marginBottom: 12,
            }}
        >
            {/* Cabeçalho */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: t.text, letterSpacing: ".01em", wordBreak: "break-word" }}>
                        {missao.nome || "?"}
                    </div>
                    {missao.endereco && (
                        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 12, color: t.textSec, marginTop: 3, wordBreak: "break-word" }}>
                            {missao.endereco}
                        </div>
                    )}
                    {missao.dataInicio && (
                        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                            Início: {fmtDate(missao.dataInicio)}
                        </div>
                    )}
                </div>
                <StatusBadge status={missao.status} />
            </div>

            {/* Barra de semanas */}
            <SemanasBar realizadas={semanas} total={totalSem} t={t} />

            {/* Mini-stats */}
            <div className="m70-minigrid">
                <MiniStat label="REALIZADAS" value={semanas}    sub="semanas"   t={t} />
                <MiniStat label="RESTANTES"  value={restantes}  sub="semanas"   t={t} />
                <MiniStat label="VISITANTES" value={totalVis}   sub="total"     t={t} />
                <MiniStat label="DECISÕES"   value={totalDec}   sub="total" color={AURA.yellow} t={t} />
            </div>

            {/* Equipe */}
            {(anfitriao || lider || auxiliar) && (
                <>
                    <Div t={t} />
                    <div style={{ marginBottom: 4 }}>
                        <div className="m70-eyebrow" style={{ color: t.textMuted, marginBottom: 9 }}>EQUIPE RESPONSÁVEL</div>
                        {anfitriao && (
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                <Avatar name={anfitriao} green />
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: t.text, fontWeight: 400, wordBreak: "break-word" }}>{anfitriao}</div>
                                    <div className="m70-eyebrow" style={{ color: t.textMuted }}>ANFITRIÃO</div>
                                </div>
                            </div>
                        )}
                        {lider && (
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                <Avatar name={lider} />
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: t.text, fontWeight: 400, wordBreak: "break-word" }}>{lider}</div>
                                    <div className="m70-eyebrow" style={{ color: t.textMuted }}>LÍDER</div>
                                </div>
                            </div>
                        )}
                        {auxiliar && (
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <Avatar name={auxiliar} blue />
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: t.text, fontWeight: 400, wordBreak: "break-word" }}>{auxiliar}</div>
                                    <div className="m70-eyebrow" style={{ color: t.textMuted }}>AUXILIAR</div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Decisões */}
            {totalDec > 0 && (
                <>
                    <Div t={t} />
                    <div>
                        <div className="m70-eyebrow" style={{ color: t.textMuted, marginBottom: 9 }}>DECISÕES REGISTRADAS</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {jesus > 0 && (
                                <span className="m70-decisao" style={{ background: "rgba(93,202,165,.1)", color: AURA.teal }}>
                                    <Heart size={11} /> {jesus} ACEITAÇÃO{jesus !== 1 ? "ES" : ""}
                                </span>
                            )}
                            {reconcil > 0 && (
                                <span className="m70-decisao" style={{ background: "rgba(253,184,19,.1)", color: AURA.yellow }}>
                                    <Star size={11} /> {reconcil} RECONCILIAÇÃO{reconcil !== 1 ? "ÕES" : ""}
                                </span>
                            )}
                            {batismos > 0 && (
                                <span className="m70-decisao" style={{ background: "rgba(0,61,165,.12)", color: AURA.blueFade }}>
                                    <Droplets size={11} /> {batismos} BATISMO{batismos !== 1 ? "S" : ""}
                                </span>
                            )}
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
}

/* ─── Seção de Célula (espelho do CelulaSection) ───────────────────────── */
function CelulaSection({ grupo, t, isDark }) {
    const [aberta,     setAberta]     = useState(true);
    const [pdfLoading, setPdfLoading] = useState(false);

    const totalDec  = grupo.missoes.reduce((acc, m) =>
        acc + (m.totalAceitouJesus ?? 0) + (m.totalReconciliacao ?? 0) + (m.totalDesejoBatismo ?? 0), 0);
    const concl     = grupo.missoes.filter(m => m.status === "CONCLUIDA").length;
    const andamento = grupo.missoes.filter(m => m.status === "EM_ANDAMENTO").length;
    const totalVis  = grupo.missoes.reduce((s, m) => s + (m.totalVisitantes ?? 0), 0);

    const handlePDF = (e) => {
        e.stopPropagation();
        setPdfLoading(true);
        try { gerarPDFMissao70(grupo); }
        catch (err) { console.error("Erro ao gerar PDF:", err); }
        finally { setPdfLoading(false); }
    };

    return (
        <div className="m70-card" style={{ background: t.bgEl, border: `1px solid ${t.border}` }}>
            <div
                className="m70-card-head"
                onClick={() => setAberta(!aberta)}
                style={{ borderBottom: aberta ? `1px solid ${t.border}` : "none" }}
            >
                {/* Ícone + nome da célula */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: "rgba(201,169,110,.1)", border: "1px solid rgba(201,169,110,.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: AURA.gold,
                    }}>
                        {initials(grupo.celulaName)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: t.text, letterSpacing: ".01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {grupo.celulaName}
                        </div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 12, color: t.textSec, marginTop: 2 }}>
                            {grupo.missoes.length} missão{grupo.missoes.length !== 1 ? "ões" : ""}
                        </div>
                    </div>
                </div>

                {/* Stats + PDF + chevron */}
                <div className="m70-card-actions">
                    <div className="m70-stats-row">
                        {[
                            { val: grupo.missoes.length, lbl: "MISSÕES",    color: t.text        },
                            { val: concl,                lbl: "CONCLUÍDAS", color: AURA.teal     },
                            { val: andamento,            lbl: "ANDAMENTO",  color: AURA.yellow   },
                            { val: totalDec,             lbl: "DECISÕES",   color: AURA.blueFade },
                        ].map(({ val, lbl, color }) => (
                            <div key={lbl} style={{ textAlign: "center" }}>
                                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color }}>{val}</div>
                                <div className="m70-eyebrow" style={{ color: t.textMuted }}>{lbl}</div>
                            </div>
                        ))}
                    </div>

                    <button
                        className="m70-pdf-btn"
                        onClick={handlePDF}
                        disabled={pdfLoading}
                        style={{ opacity: pdfLoading ? .6 : 1 }}
                    >
                        {pdfLoading
                            ? <><Loader2 size={13} className="m70-spin" /> <span className="m70-pdf-label">GERANDO...</span></>
                            : <><FileDown size={13} /> <span className="m70-pdf-label">BAIXAR PDF</span></>}
                    </button>

                    {aberta ? <ChevronUp size={15} color={t.textMuted} /> : <ChevronDown size={15} color={t.textMuted} />}
                </div>
            </div>

            <AnimatePresence initial={false}>
                {aberta && (
                    <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                    >
                        <div style={{ padding: "16px" }}>
                            {grupo.missoes.length === 0 ? (
                                <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 14, color: t.textMuted, textAlign: "center", padding: "20px 0", margin: 0, fontStyle: "italic" }}>
                                    Nenhuma missão encontrada.
                                </p>
                            ) : (
                                grupo.missoes.map(m => <MissaoCard key={m.id} missao={m} t={t} />)
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Componente Principal ──────────────────────────────────────────────── */
export default function RelatorioMissao70Pastor({ isDark = true }) {
    const [dados,   setDados]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [fStatus, setFStatus] = useState("");
    const [fDini,   setFDini]   = useState("");
    const [fDfim,   setFDfim]   = useState("");
    const [fBusca,  setFBusca]  = useState("");

    const t = theme(isDark);

    /* ── KPIs globais ── */
    const kpiTotal = dados.reduce((a, g) => a + g.missoes.length, 0);
    const kpiCon   = dados.reduce((a, g) => a + g.missoes.filter(m => m.status === "CONCLUIDA").length, 0);
    const kpiAnd   = dados.reduce((a, g) => a + g.missoes.filter(m => m.status === "EM_ANDAMENTO").length, 0);
    const kpiDec   = dados.reduce((a, g) => g.missoes.reduce((b, m) =>
        b + (m.totalAceitouJesus ?? 0) + (m.totalReconciliacao ?? 0) + (m.totalDesejoBatismo ?? 0), a), 0);
    const kpiVis   = dados.reduce((a, g) => g.missoes.reduce((b, m) => b + (m.totalVisitantes ?? 0), a), 0);

    function agrupar(flat) {
        const map = new Map();
        flat.forEach(m => {
            const cid  = m.celulaId || 0;
            const nome = m.nomeCelula || m.celulaName || `Célula ${cid}`;
            if (!map.has(cid)) map.set(cid, { celulaId: cid, celulaName: nome, missoes: [] });
            map.get(cid).missoes.push(m);
        });
        return Array.from(map.values()).sort((a, b) => a.celulaName.localeCompare(b.celulaName));
    }

    const buscar = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (fStatus) params.append("status",     fStatus);
        if (fDini)   params.append("dataInicio", fDini);
        if (fDfim)   params.append("dataFim",    fDfim);
        try {
            const url = `/api/pastor/missao70/relatorio${params.toString() ? "?" + params : ""}`;
            const res = await api.get(url);
            const lista = Array.isArray(res.data)
                ? res.data
                : res.data?.content ?? res.data?.missoes ?? [];
            setDados(agrupar(lista));
        } catch (e) {
            console.error("Erro ao carregar relatório Missão 70:", e);
            setDados([]);
        } finally {
            setLoading(false);
        }
    }, [fStatus, fDini, fDfim]);

    useEffect(() => { buscar(); }, []);

    function limpar() {
        setFStatus(""); setFDini(""); setFDfim(""); setFBusca("");
        setTimeout(buscar, 0);
    }

    /* ── Filtragem local por busca ── */
    const dadosFiltrados = fBusca.trim()
        ? dados.map(g => ({
            ...g,
            missoes: g.missoes.filter(m =>
                (m.nome ?? "").toLowerCase().includes(fBusca.toLowerCase()) ||
                (m.nomeLider ?? "").toLowerCase().includes(fBusca.toLowerCase()) ||
                (m.nomeAnfitriao ?? "").toLowerCase().includes(fBusca.toLowerCase()) ||
                (m.endereco ?? "").toLowerCase().includes(fBusca.toLowerCase())
            ),
        })).filter(g => g.missoes.length > 0)
        : dados;

    const kpis = [
        { lbl: "TOTAL MISSÕES",  val: kpiTotal, color: AURA.red,      sub: "no período"               },
        { lbl: "CONCLUÍDAS",     val: kpiCon,   color: AURA.teal,     sub: "encerradas"               },
        { lbl: "EM ANDAMENTO",   val: kpiAnd,   color: AURA.yellow,   sub: "ativas"                   },
        { lbl: "TOTAL DECISÕES", val: kpiDec,   color: AURA.blueFade, sub: "aceit. + reconc. + batis."},
        { lbl: "VISITANTES",     val: kpiVis,   color: AURA.gray,     sub: "totais registrados"       },
    ];

    /* ── Estilos globais (mesmos do CasasDePaz, prefixo m70-) ── */
    const globalStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

        @keyframes m70-spin { to { transform: rotate(360deg); } }
        .m70-spin { animation: m70-spin 1s linear infinite; }

        .m70-root {
            font-family: 'Inter', sans-serif;
            color: ${t.text};
            position: relative;
            isolation: isolate;
        }

        .m70-eyebrow {
            font-family: 'Inter', sans-serif;
            font-size: 9px; font-weight: 600; letter-spacing: .18em;
            text-transform: uppercase;
        }

        .m70-title-eyebrow {
            font-size: 9px; font-weight: 500; letter-spacing: .2em;
            text-transform: uppercase; color: rgba(201,169,110,.6);
            margin: 0 0 4px;
        }
        .m70-title {
            font-family: 'Playfair Display', serif;
            font-size: clamp(18px, 4.4vw, 24px);
            font-weight: 500; color: ${t.text};
            margin: 0; line-height: 1.2; letter-spacing: .02em;
        }

        /* ── KPI grid ── */
        .m70-kpi-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px; margin-bottom: 22px;
        }
        @media (max-width: 900px) { .m70-kpi-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 520px) { .m70-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

        .m70-kpi-card {
            background: ${t.bgEl}; border: 1px solid ${t.border};
            border-radius: 16px; padding: 16px;
            position: relative; overflow: hidden;
            backdrop-filter: blur(20px);
        }
        .m70-kpi-stripe {
            position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
            border-radius: 16px 0 0 16px;
        }
        .m70-kpi-label {
            font-size: 8.5px; font-weight: 600; letter-spacing: .18em;
            text-transform: uppercase; color: ${t.textMuted}; margin-bottom: 8px;
        }
        .m70-kpi-value {
            font-family: 'Playfair Display', serif;
            font-size: clamp(22px, 5vw, 28px); font-weight: 700;
            line-height: 1; color: ${t.text};
        }
        .m70-kpi-sub {
            font-size: 11px; font-weight: 300; color: ${t.textSec}; margin-top: 4px;
        }

        /* ── Filtros ── */
        .m70-filters {
            background: ${t.bgEl}; border: 1px solid ${t.border};
            border-radius: 18px; padding: 18px;
            margin-bottom: 22px;
            display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end;
            backdrop-filter: blur(20px);
        }
        .m70-field {
            display: flex; flex-direction: column; gap: 6px;
            flex: 1; min-width: 140px;
        }
        @media (max-width: 640px) { .m70-field { min-width: 100%; } }

        .m70-field-label {
            font-size: 9px; font-weight: 600; letter-spacing: .18em;
            text-transform: uppercase; color: ${t.textMuted};
        }
        .m70-select, .m70-input-date {
            background: ${t.bgInput}; border: 1px solid ${t.borderInput};
            border-radius: 12px; color: ${t.text};
            font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
            padding: 12px 14px; outline: none; width: 100%;
            -webkit-appearance: none; appearance: none;
            transition: all .25s; box-sizing: border-box;
        }
        .m70-select:focus, .m70-input-date:focus {
            border-color: rgba(201,169,110,.5);
            box-shadow: 0 0 0 3px rgba(201,169,110,.08);
        }
        .m70-select option { background: ${t.optionBg}; color: ${t.text}; }
        input[type="date"].m70-input-date::-webkit-calendar-picker-indicator {
            filter: ${isDark ? "invert(1) opacity(0.4)" : "opacity(0.5)"}; cursor: pointer;
        }

        /* Campo de busca */
        .m70-search-wrap { position: relative; flex: 1; min-width: 180px; }
        @media (max-width: 640px) { .m70-search-wrap { min-width: 100%; } }
        .m70-search-icon {
            position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
            color: ${AURA.gold}; opacity: .5; pointer-events: none;
        }
        .m70-search-input {
            background: ${t.bgInput}; border: 1px solid ${t.borderInput};
            border-radius: 12px; color: ${t.text};
            font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
            padding: 12px 14px 12px 42px; outline: none; width: 100%;
            -webkit-appearance: none; appearance: none;
            transition: all .25s; box-sizing: border-box;
        }
        .m70-search-input:focus {
            border-color: rgba(201,169,110,.5);
            box-shadow: 0 0 0 3px rgba(201,169,110,.08);
        }
        .m70-search-input::placeholder { color: ${t.placeholder}; }

        .m70-btn-row { display: flex; gap: 10px; width: 100%; }
        @media (min-width: 641px) { .m70-btn-row { width: auto; } }

        .m70-btn-filter {
            flex: 1;
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
            color: #fff; border: none; border-radius: 100px;
            font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .14em;
            text-transform: uppercase; cursor: pointer; transition: all .3s;
            padding: 12px 20px; white-space: nowrap;
            box-shadow: 0 6px 20px rgba(200,16,46,.25);
        }
        .m70-btn-filter:hover { opacity: .9; transform: translateY(-1px); }

        .m70-btn-clear {
            flex: 1;
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            background: transparent; color: ${t.textSec};
            border: 1px solid ${t.border}; border-radius: 100px;
            font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .14em;
            text-transform: uppercase; cursor: pointer; transition: all .3s;
            padding: 12px 18px; white-space: nowrap;
        }
        .m70-btn-clear:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }

        /* ── Cards / Células ── */
        .m70-card {
            border-radius: 18px; margin-bottom: 16px; overflow: hidden;
            backdrop-filter: blur(20px); position: relative;
        }
        .m70-card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(201,169,110,.25), transparent);
        }
        .m70-card-head {
            display: flex; align-items: center; justify-content: space-between;
            gap: 14px; padding: 16px 18px; cursor: pointer;
            transition: background .2s; flex-wrap: wrap;
        }
        .m70-card-head:hover { background: ${t.hoverBg}; }
        .m70-card-actions {
            display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
            justify-content: flex-end;
        }
        .m70-stats-row { display: flex; gap: 14px; }

        @media (max-width: 560px) {
            .m70-card-head { flex-direction: column; align-items: stretch; }
            .m70-card-actions { justify-content: space-between; width: 100%; }
            .m70-stats-row { gap: 10px; flex: 1; justify-content: space-between; }
        }
        @media (max-width: 380px) {
            .m70-stats-row > div:nth-child(4) { display: none; }
        }

        .m70-pdf-btn {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(200,16,46,.12); color: ${AURA.redLight};
            border: 1px solid rgba(200,16,46,.3); border-radius: 100px;
            font-family: 'Inter', sans-serif; font-size: 9.5px; font-weight: 600; letter-spacing: .14em;
            text-transform: uppercase; cursor: pointer; transition: all .25s;
            padding: 9px 14px; flex-shrink: 0;
        }
        .m70-pdf-btn:hover { background: rgba(200,16,46,.22); }
        @media (max-width: 380px) {
            .m70-pdf-label { display: none; }
            .m70-pdf-btn { padding: 9px 10px; }
        }

        /* ── Mini grid dentro do card de missão ── */
        .m70-minigrid {
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px;
        }
        @media (max-width: 460px) { .m70-minigrid { grid-template-columns: repeat(2, 1fr); } }

        /* ── Badge de status ── */
        .m70-badge {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 5px 12px; border-radius: 99px;
            font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .12em;
            white-space: nowrap;
        }

        /* ── Chip de decisão ── */
        .m70-decisao {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 5px 12px; border-radius: 99px;
            font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .12em;
            white-space: nowrap;
        }

        /* ── Vazio ── */
        .m70-empty {
            background: ${t.bgEl}; border: 1px solid ${t.border};
            border-radius: 18px; padding: 50px 20px; text-align: center;
            backdrop-filter: blur(20px);
        }

        /* ── Rodapé ── */
        .m70-footer-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
            margin-top: 28px;
        }
        .m70-footer-text {
            text-align: center;
            font-size: 9px; font-weight: 500; letter-spacing: .18em;
            text-transform: uppercase;
            color: ${isDark ? "rgba(245,240,232,.12)" : "rgba(26,16,8,.15)"};
            padding: 16px 0 0;
        }
    `;

    return (
        <div className="m70-root">
            <style>{globalStyles}</style>

            {/* ── Título ── */}
            <div style={{ marginBottom: 22 }}>
                <p className="m70-title-eyebrow">IEQ PITUAÇU · PAINEL PASTORAL</p>
                <h2 className="m70-title">
                    Relatórios <span style={{ color: AURA.gold }}>· Missão 70</span>
                </h2>
            </div>

            {/* ── KPIs ── */}
            <div className="m70-kpi-grid">
                {kpis.map(({ lbl, val, color, sub }) => (
                    <div key={lbl} className="m70-kpi-card">
                        <div className="m70-kpi-stripe" style={{ background: color }} />
                        <div className="m70-kpi-label">{lbl}</div>
                        <div className="m70-kpi-value">{val}</div>
                        <div className="m70-kpi-sub">{sub}</div>
                    </div>
                ))}
            </div>

            {/* ── Filtros ── */}
            <div className="m70-filters">
                {/* Busca */}
                <div className="m70-search-wrap">
                    <Search size={15} className="m70-search-icon" />
                    <input
                        className="m70-search-input"
                        placeholder="Buscar por nome, líder, anfitrião…"
                        value={fBusca}
                        onChange={e => setFBusca(e.target.value)}
                    />
                </div>

                {/* Status */}
                <div className="m70-field">
                    <label className="m70-field-label">STATUS</label>
                    <select className="m70-select" value={fStatus} onChange={e => setFStatus(e.target.value)}>
                        <option value="">Todos</option>
                        <option value="EM_ANDAMENTO">Em Andamento</option>
                        <option value="CONCLUIDA">Concluída</option>
                        <option value="CANCELADA">Cancelada</option>
                    </select>
                </div>

                {/* Data início */}
                <div className="m70-field">
                    <label className="m70-field-label">DATA INÍCIO</label>
                    <input className="m70-input-date" type="date" value={fDini} onChange={e => setFDini(e.target.value)} />
                </div>

                {/* Data fim */}
                <div className="m70-field">
                    <label className="m70-field-label">DATA FIM</label>
                    <input className="m70-input-date" type="date" value={fDfim} onChange={e => setFDfim(e.target.value)} />
                </div>

                {/* Botões */}
                <div className="m70-btn-row">
                    <button className="m70-btn-filter" onClick={buscar}>
                        <Filter size={13} /> Filtrar
                    </button>
                    <button className="m70-btn-clear" onClick={limpar}>
                        <RotateCcw size={13} /> Limpar
                    </button>
                </div>
            </div>

            {/* ── Conteúdo ── */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <Loader2 size={28} className="m70-spin" style={{ color: AURA.red }} />
                    <p className="m70-eyebrow" style={{ color: t.textMuted, marginTop: 14 }}>
                        CARREGANDO RELATÓRIO…
                    </p>
                </div>
            ) : dadosFiltrados.length === 0 ? (
                <div className="m70-empty">
                    <Flame size={32} color={t.textMuted} style={{ marginBottom: 14, opacity: .5 }} />
                    <p className="m70-eyebrow" style={{ color: t.textMuted }}>
                        NENHUM RESULTADO ENCONTRADO
                    </p>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 14, color: t.textSec, marginTop: 8 }}>
                        Tente ajustar os filtros ou limpar a busca.
                    </p>
                </div>
            ) : (
                <AnimatePresence>
                    {dadosFiltrados.map(grupo => (
                        <CelulaSection key={grupo.celulaId} grupo={grupo} t={t} isDark={isDark} />
                    ))}
                </AnimatePresence>
            )}

            {/* ── Rodapé ── */}
            <div className="m70-footer-divider" />
            <p className="m70-footer-text">
                © IEQ Pituaçu — Sistema Eclesiástico {new Date().getFullYear()}
            </p>
        </div>
    );
}
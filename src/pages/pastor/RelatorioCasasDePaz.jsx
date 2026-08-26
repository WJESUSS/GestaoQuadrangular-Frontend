import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    Home, ChevronDown, ChevronUp, CheckCircle,
    Clock, XCircle, Activity, Filter, RotateCcw,
    Star, Droplets, Heart, FileDown, Loader2,
} from "lucide-react";
import TelaCarregando from "../../components/TelaCarregando.jsx";

/* ─── Tokens AURA (mesma paleta do Dashboard) ─────────────────────────── */
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
        bg:          isDark ? "#0A0A0F"               : "#F5F0E8",
        bgEl:        isDark ? "rgba(18,18,26,.95)"     : "rgba(255,255,255,.95)",
        bgInput:     isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.04)",
        border:      isDark ? "rgba(201,169,110,.1)"   : "rgba(201,169,110,.2)",
        borderInput: isDark ? "rgba(201,169,110,.15)"  : "rgba(201,169,110,.28)",
        text:        isDark ? "#F5F0E8"                : "#1A1008",
        textSec:     isDark ? "#9A9588"                : "#6B5E4A",
        textMuted:   isDark ? "#6B6658"                : "#9A9080",
        glow1:       isDark ? "rgba(201,169,110,.05)"  : "rgba(201,169,110,.08)",
        glow2:       isDark ? "rgba(201,169,110,.04)"  : "rgba(201,169,110,.06)",
        cardHover:   isDark ? "rgba(201,169,110,.2)"   : "rgba(201,169,110,.35)",
        placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
        optionBg:    isDark ? "#12121A"                : "#F0EAE0",
        innerCardBg: isDark ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.02)",
        miniStatBg:  isDark ? "rgba(0,0,0,.18)"        : "rgba(0,0,0,.03)",
        progressTrack: isDark ? "rgba(255,255,255,.08)": "rgba(0,0,0,.06)",
        tagBg:       isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.035)",
        hoverBg:     isDark ? "rgba(201,169,110,.06)"  : "rgba(201,169,110,.07)",
        gold:        isDark ? "#C9A96E"                : "#3D3218",
    };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
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

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_CFG = {
    EM_ANDAMENTO: { label: "Em Andamento", color: AURA.teal,     bg: "rgba(93,202,165,.12)",  border: "rgba(93,202,165,.3)",  Icon: Clock       },
    CONCLUIDA:    { label: "Concluída",    color: AURA.blueFade, bg: "rgba(0,61,165,.12)",    border: "rgba(0,61,165,.3)",    Icon: CheckCircle  },
    CANCELADA:    { label: "Cancelada",    color: AURA.redLight, bg: "rgba(200,16,46,.1)",    border: "rgba(200,16,46,.25)",  Icon: XCircle      },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] || {
        label: status, color: "#888",
        bg: "rgba(136,136,136,.1)", border: "rgba(136,136,136,.25)", Icon: Activity,
    };
    const { label, color, bg, border } = cfg;
    return (
        <span className="rdcp-badge" style={{ background: bg, border: `1px solid ${border}`, color }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
            {label.toUpperCase()}
        </span>
    );
}

function ProgressBar({ realizados = 0, total = 0, t }) {
    const p = pct(realizados, total);
    const restantes = Math.max(0, total - realizados);
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, flexWrap: "wrap", gap: 4 }}>
                <span className="rdcp-eyebrow" style={{ color: t.textMuted }}>ENCONTROS</span>
                <span className="rdcp-eyebrow" style={{ color: t.textMuted }}>
                    {realizados} / {total} · {restantes} RESTANTE{restantes !== 1 ? "S" : ""}
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
            <div className="rdcp-eyebrow" style={{ color: t.textMuted, marginBottom: 5 }}>{label}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, lineHeight: 1, color: color || t.text }}>{value}</div>
            {sub && <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 11, color: t.textSec, marginTop: 3 }}>{sub}</div>}
        </div>
    );
}

function Avatar({ name, blue = false }) {
    return (
        <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: blue ? "rgba(0,61,165,.12)" : "rgba(201,169,110,.14)",
            border: `1px solid ${blue ? "rgba(0,61,165,.25)" : "rgba(201,169,110,.28)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700,
            color: blue ? AURA.blueFade : t.gold,
        }}>
            {initials(name)}
        </div>
    );
}

function Div({ t }) {
    return <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${t.border},transparent)`, margin: "12px 0" }} />;
}

// ─── GERADOR DE PDF (FRONTEND) ────────────────────────────────────────────────
function gerarPDFReal(grupo) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W   = doc.internal.pageSize.getWidth();
    const H   = doc.internal.pageSize.getHeight();
    const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(155, 11, 30);
    doc.text("IEQ PITUACU - PAINEL PASTORAL", W / 2, 12, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text("RELATÓRIO DE CASAS DE PAZ", W / 2, 20, { align: "center" });

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

    const casas      = grupo.casas || [];
    const totalVis   = casas.reduce((s, c) => s + ((c.visitantes || []).length || c.totalVisitantes || 0), 0);
    const concluidas = casas.filter(c => c.status === "CONCLUIDA").length;
    const andamento  = casas.filter(c => c.status === "EM_ANDAMENTO").length;
    const canceladas = casas.filter(c => c.status === "CANCELADA").length;
    const totalDec   = casas.reduce((s, c) =>
        s + (c.totalAceitouJesus ?? 0) + (c.totalReconciliacao ?? 0) + (c.totalDesejoBatismo ?? 0), 0);

    const kpis = [
        { label: "TOTAL CASAS", val: casas.length, sub: "registradas" },
        { label: "CONCLUÍDAS",  val: concluidas,  sub: "encerradas" },
        { label: "ANDAMENTO",   val: andamento,   sub: "ativas" },
        { label: "CANCELADAS",  val: canceladas,  sub: "interromp." },
        { label: "VISITANTES",  val: totalVis,    sub: "totais" },
        { label: "DECISÕES",    val: totalDec,    sub: "total vidas" },
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
    doc.text(`LISTA DE CASAS (${casas.length})`, 10, 67);

    autoTable(doc, {
        startY: 70,
        head: [["#", "Nome da Casa", "Líder", "Status", "Encontros", "Visitantes", "Início"]],
        body: casas.map((c, i) => {
            const real = c.encontrosRealizados ?? 0;
            const rest = c.encontrosRestantes  ?? 0;
            const tot  = real + rest;
            const st   = c.status === "CONCLUIDA"    ? "Concluída"
                : c.status === "CANCELADA"    ? "Cancelada"
                    : "Em Andamento";
            const vis  = (c.visitantes || []).length || c.totalVisitantes || 0;
            const ini  = c.dataInicio ? new Date(c.dataInicio).toLocaleDateString("pt-BR") : "—";
            return [i + 1, c.nome || `Casa ${c.id}`, c.nomeLider || c.lider || "—", st, `${real}/${tot}`, vis, ini];
        }),
        styles:             { fillColor: [255, 255, 255], textColor: [40, 40, 40], fontSize: 8, lineColor: [220, 220, 220], lineWidth: 0.1 },
        headStyles:         { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold", lineColor: [200, 200, 200], lineWidth: 0.2 },
        alternateRowStyles: { fillColor: [249, 249, 249] },
        columnStyles:       { 0: { halign: "center" }, 4: { halign: "center" }, 5: { halign: "center" }, 6: { halign: "center" } },
        margin:             { left: 10, right: 10 },
    });

    let y = doc.lastAutoTable.finalY + 10;

    if (y + 10 > H - 15) { doc.addPage(); y = 15; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(155, 11, 30);
    doc.text("DETALHES POR CASA", 10, y);
    y += 5;

    casas.forEach((c, i) => {
        const lider      = c.nomeLider    || c.lider    || "";
        const auxiliar  = c.nomeAuxiliar || c.auxiliar || "";
        const real      = c.encontrosRealizados ?? 0;
        const rest      = c.encontrosRestantes  ?? 0;
        const tot       = real + rest;
        const pctVal    = tot > 0 ? Math.round((real / tot) * 100) : 0;
        const visitantes = c.visitantes || [];
        const vis       = visitantes.length || c.totalVisitantes || 0;
        const aceit     = c.totalAceitouJesus  ?? 0;
        const reconcil  = c.totalReconciliacao ?? 0;
        const batis     = c.totalDesejoBatismo ?? 0;
        const totalDecCard = aceit + reconcil + batis;

        const linhasVis = visitantes.length > 0 ? Math.ceil(visitantes.length / 4) : 0;
        const hasEquipe = !!(lider || auxiliar);

        const cardH = 34
            + (hasEquipe ? 10 : 0)
            + (visitantes.length > 0 ? 8 + linhasVis * 5 : 6)
            + (totalDecCard > 0 ? 10 : 0);

        if (y + cardH > H - 15) { doc.addPage(); y = 15; }

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.rect(10, y, W - 20, cardH);

        let cy = y + 6;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${i + 1}. ${c.nome || `Casa ${c.id}`}`, 14, cy);

        const stLabel = c.status === "CONCLUIDA" ? "Concluída" : c.status === "CANCELADA" ? "Cancelada" : "Em Andamento";
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        doc.text(`Status: ${stLabel}`, W - 14, cy, { align: "right" });
        cy += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(80, 80, 80);
        let infoSub = "";
        if (c.endereco) infoSub += `${c.endereco}`;
        if (c.dataInicio) infoSub += `  |  Início: ${new Date(c.dataInicio).toLocaleDateString("pt-BR")}`;
        if (infoSub) {
            doc.text(infoSub, 14, cy);
            cy += 5;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 100, 100);
        doc.text(`Progresso: ${real}/${tot} realizados (${rest} restante(s) - ${pctVal}%)`, 14, cy);
        cy += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(40, 40, 40);
        doc.text(`Encontros Realizados: ${real}   •   Restantes: ${rest}   •   Visitantes Únicos: ${vis}   •   Decisões: ${totalDecCard}`, 14, cy);
        cy += 4;

        if (hasEquipe) {
            cy += 2;
            doc.setDrawColor(230, 230, 230);
            doc.line(14, cy, W - 14, cy);
            cy += 4;

            const eqCount = (lider ? 1 : 0) + (auxiliar ? 1 : 0);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(120, 120, 120);
            doc.text("EQUIPE:", 14, cy);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(30, 30, 30);
            doc.text(`${eqCount} pessoa${eqCount !== 1 ? "s" : ""}`, 27, cy);
            cy += 3;
        }

        cy += 2;
        doc.setDrawColor(230, 230, 230);
        doc.line(14, cy, W - 14, cy);
        cy += 4;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(`VISITANTES (${vis}):`, 14, cy);

        if (visitantes.length > 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(40, 40, 40);

            visitantes.forEach((v, vi) => {
                const vx   = 14 + (vi % 4) * 44;
                const vy   = (cy + 4) + Math.floor(vi / 4) * 5;
                const nome = (v.nome ?? v.nomeCompleto ?? `#${v.id}`).slice(0, 18);
                doc.text(v.decisao ? `${nome} (+)` : nome, vx, vy);
            });
            cy += Math.floor((visitantes.length - 1) / 4) * 5 + 6;
        } else {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(7.5);
            doc.setTextColor(140, 140, 140);
            doc.text(vis > 0 ? `${vis} visitante(s) listado(s)` : "Nenhum visitante registrado.", 38, cy);
            cy += 4;
        }

        if (totalDecCard > 0) {
            cy += 1;
            doc.setDrawColor(230, 230, 230);
            doc.line(14, cy, W - 14, cy);
            cy += 4;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(120, 120, 120);
            doc.text("DECISÕES:", 14, cy);

            const partes = [
                aceit    > 0 ? `${aceit} Aceitação(ões)`   : "",
                reconcil > 0 ? `${reconcil} Reconciliação(ões)` : "",
                batis    > 0 ? `${batis} Batismo(s)`            : "",
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
    doc.text(
        `© IEQ PITUACU - SISTEMA SEGURO - ${new Date().getFullYear()}`,
        W / 2, y + 7, { align: "center" }
    );

    const nomeArq = `Relatorio_CasasDePaz_${(grupo.celulaName || "geral").replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(nomeArq);
}

// ─── CARD DE CASA DE PAZ ──────────────────────────────────────────────────────
function CasaCard({ casa, t }) {
    const lider      = casa.nomeLider       || casa.lider      || "";
    const auxiliar   = casa.nomeAuxiliar    || casa.auxiliar   || "";
    const realizados = casa.encontrosRealizados ?? casa.realizados ?? 0;
    const restantes  = casa.encontrosRestantes  ?? 0;
    const total      = realizados + restantes;
    const aceitacoes = casa.totalAceitouJesus   ?? casa.aceitacoes     ?? 0;
    const reconcil   = casa.totalReconciliacao  ?? casa.reconciliacoes ?? 0;
    const batismos   = casa.totalDesejoBatismo  ?? casa.batismos       ?? 0;
    const totalDec   = aceitacoes + reconcil + batismos;

    const visitantes = casa.visitantes || [];
    const uniq = [...new Map(visitantes.map((v) => [v.nome, v])).values()];
    const numVis = uniq.length || casa.totalVisitantes || 0;

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
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: t.text, letterSpacing: ".01em", wordBreak: "break-word" }}>
                        {casa.nome || "?"}
                    </div>
                    {casa.endereco && <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 12, color: t.textSec, marginTop: 3, wordBreak: "break-word" }}>{casa.endereco}</div>}
                    {casa.dataInicio && <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 11, color: t.textMuted, marginTop: 2 }}>Início: {fmtDate(casa.dataInicio)}</div>}
                </div>
                <StatusBadge status={casa.status} />
            </div>

            <ProgressBar realizados={realizados} total={total} t={t} />

            <div className="rdcp-minigrid">
                <MiniStat label="REALIZADOS" value={realizados} sub="encontros" t={t} />
                <MiniStat label="RESTANTES"  value={restantes}  sub="encontros" t={t} />
                <MiniStat label="VISITANTES" value={numVis}     sub="únicos" t={t} />
                <MiniStat label="DECISÕES"   value={totalDec}   sub="total" color={AURA.yellow} t={t} />
            </div>

            {(lider || auxiliar) && (
                <>
                    <Div t={t} />
                    <div style={{ marginBottom: 4 }}>
                        <div className="rdcp-eyebrow" style={{ color: t.textMuted, marginBottom: 9 }}>EQUIPE RESPONSÁVEL</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 600, color: t.text, lineHeight: 1 }}>
                                {(lider ? 1 : 0) + (auxiliar ? 1 : 0)}
                            </div>
                            <div>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: t.text, fontWeight: 400 }}>
                                    pessoa{((lider ? 1 : 0) + (auxiliar ? 1 : 0)) !== 1 ? "s" : ""}
                                </div>
                                <div className="rdcp-eyebrow" style={{ color: t.textMuted }}>NA EQUIPE</div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <Div t={t} />
            <div>
                <div className="rdcp-eyebrow" style={{ color: t.textMuted, marginBottom: 9 }}>
                    VISITANTES ({numVis})
                </div>
                {uniq.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {uniq.map((v, i) => (
                            <span key={i} title={v.decisao || ""} style={{
                                background: v.decisao ? "rgba(253,184,19,.1)" : t.tagBg,
                                border: `1px solid ${v.decisao ? "rgba(253,184,19,.28)" : t.border}`,
                                borderRadius: 99, padding: "4px 11px",
                                fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 400,
                                color: v.decisao ? AURA.yellow : t.textSec,
                            }}>
                                {v.nome}{v.decisao ? " ★" : ""}
                            </span>
                        ))}
                    </div>
                ) : numVis > 0 ? (
                    <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 13, color: t.textMuted, fontStyle: "italic", margin: 0 }}>
                        {numVis} visitante{numVis !== 1 ? "s" : ""} registrado{numVis !== 1 ? "s" : ""}
                    </p>
                ) : (
                    <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 13, color: t.textMuted, fontStyle: "italic", margin: 0, opacity: .7 }}>Nenhum visitante registrado</p>
                )}
            </div>

            {totalDec > 0 && (
                <>
                    <Div t={t} />
                    <div>
                        <div className="rdcp-eyebrow" style={{ color: t.textMuted, marginBottom: 9 }}>DECISÕES REGISTRADAS</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {aceitacoes > 0 && (
                                <span className="rdcp-decisao" style={{ background: "rgba(93,202,165,.1)", color: AURA.teal }}>
                                    <Heart size={11} /> {aceitacoes} ACEITAÇÃO{aceitacoes !== 1 ? "ES" : ""}
                                </span>
                            )}
                            {reconcil > 0 && (
                                <span className="rdcp-decisao" style={{ background: "rgba(253,184,19,.1)", color: AURA.yellow }}>
                                    <Star size={11} /> {reconcil} RECONCILIAÇÃO{reconcil !== 1 ? "ÕES" : ""}
                                </span>
                            )}
                            {batismos > 0 && (
                                <span className="rdcp-decisao" style={{ background: "rgba(0,61,165,.12)", color: AURA.blueFade }}>
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

// ─── SEÇÃO DE CÉLULA ──────────────────────────────────────────────────────────
function CelulaSection({ grupo, t, isDark }) {
    const [aberta, setAberta]         = useState(true);
    const [pdfLoading, setPdfLoading] = useState(false);

    const totalDec  = grupo.casas.reduce((acc, c) => acc
        + (c.totalAceitouJesus  ?? c.aceitacoes     ?? 0)
        + (c.totalReconciliacao ?? c.reconciliacoes ?? 0)
        + (c.totalDesejoBatismo ?? c.batismos       ?? 0), 0);
    const concl     = grupo.casas.filter((c) => c.status === "CONCLUIDA").length;
    const andamento = grupo.casas.filter((c) => c.status === "EM_ANDAMENTO").length;

    const handlePDF = (e) => {
        e.stopPropagation();
        setPdfLoading(true);
        try {
            gerarPDFReal(grupo);
        } catch (err) {
            console.error("Erro ao gerar PDF:", err);
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <div className="rdcp-card" style={{ background: t.bgEl, border: `1px solid ${t.border}` }}>
            <div
                className="rdcp-card-head"
                onClick={() => setAberta(!aberta)}
                style={{ borderBottom: aberta ? `1px solid ${t.border}` : "none" }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: "rgba(201,169,110,.1)", border: "1px solid rgba(201,169,110,.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: t.gold,
                    }}>
                        {initials(grupo.celulaName)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: t.text, letterSpacing: ".01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {grupo.celulaName}
                        </div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 12, color: t.textSec, marginTop: 2 }}>
                            {grupo.casas.length} casa{grupo.casas.length !== 1 ? "s" : ""} de paz
                        </div>
                    </div>
                </div>

                <div className="rdcp-card-actions">
                    <div className="rdcp-stats-row">
                        {[
                            { val: grupo.casas.length, lbl: "CASAS",      color: t.text },
                            { val: concl,              lbl: "CONCLUÍDAS", color: AURA.teal     },
                            { val: andamento,          lbl: "ANDAMENTO",  color: AURA.yellow   },
                            { val: totalDec,           lbl: "DECISÕES",   color: AURA.blueFade },
                        ].map(({ val, lbl, color }) => (
                            <div key={lbl} style={{ textAlign: "center" }}>
                                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color }}>{val}</div>
                                <div className="rdcp-eyebrow" style={{ color: t.textMuted }}>{lbl}</div>
                            </div>
                        ))}
                    </div>

                    <button
                        className="rdcp-pdf-btn"
                        onClick={handlePDF}
                        disabled={pdfLoading}
                        style={{ opacity: pdfLoading ? .6 : 1 }}
                    >
                        {pdfLoading
                            ? <><Loader2 size={13} className="rdcp-spin" /> <span className="rdcp-pdf-label">GERANDO...</span></>
                            : <><FileDown size={13} /> <span className="rdcp-pdf-label">BAIXAR PDF</span></>}
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
                            {grupo.casas.length === 0 ? (
                                <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 14, color: t.textMuted, textAlign: "center", padding: "20px 0", margin: 0, fontStyle: "italic" }}>
                                    Nenhuma casa encontrada.
                                </p>
                            ) : (
                                grupo.casas.map((c) => <CasaCard key={c.id} casa={c} t={t} />)
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function RelatorioCasasDePaz({ isDark = true }) {
    const [dados,   setDados]   = useState([]);
    const [celulas, setCelulas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fCelula, setFCelula] = useState("");
    const [fStatus, setFStatus] = useState("");
    const [fDini,   setFDini]   = useState("");
    const [fDfim,   setFDfim]   = useState("");

    const t = theme(isDark);

    const kpiTotal = dados.reduce((a, g) => a + g.casas.length, 0);
    const kpiCon   = dados.reduce((a, g) => a + g.casas.filter((c) => c.status === "CONCLUIDA").length, 0);
    const kpiAnd   = dados.reduce((a, g) => a + g.casas.filter((c) => c.status === "EM_ANDAMENTO").length, 0);
    const kpiDec   = dados.reduce((a, g) => g.casas.reduce((b, c) => b
        + (c.totalAceitouJesus  ?? c.aceitacoes     ?? 0)
        + (c.totalReconciliacao ?? c.reconciliacoes ?? 0)
        + (c.totalDesejoBatismo ?? c.batismos       ?? 0), a), 0);
    const kpiVis = (() => {
        const s = new Set();
        dados.forEach((g) => g.casas.forEach((c) => (c.visitantes || []).forEach((v) => s.add(v.nome))));
        return s.size || dados.reduce((a, g) => g.casas.reduce((b, c) => b + (c.totalVisitantes || 0), a), 0);
    })();

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/celulas");
                setCelulas(res.data || []);
            } catch (e) { console.warn("Erro ao carregar células:", e); }
        })();
    }, []);

    function agrupar(flat) {
        const map = new Map();
        flat.forEach((c) => {
            const cid  = c.celulaId || 0;
            const nome = c.nomeCelula || c.celulaName || `Célula ${cid}`;
            if (!map.has(cid)) map.set(cid, { celulaId: cid, celulaName: nome, casas: [] });
            map.get(cid).casas.push(c);
        });
        return Array.from(map.values()).sort((a, b) => a.celulaName.localeCompare(b.celulaName));
    }

    const buscar = useCallback(async () => {
        setLoading(true);
        const params = {};
        if (fCelula) params.celulaId   = fCelula;
        if (fStatus) params.status     = fStatus;
        if (fDini)   params.dataInicio = fDini;
        if (fDfim)   params.dataFim    = fDfim;
        try {
            const res = await api.get("/api/casas-de-paz/relatorio", { params });
            const lista = Array.isArray(res.data)
                ? res.data
                : res.data?.content ?? res.data?.casas ?? [];
            setDados(agrupar(lista));
        } catch (e) {
            console.error("Erro ao carregar relatório:", e);
            setDados([]);
        } finally {
            setLoading(false);
        }
    }, [fCelula, fStatus, fDini, fDfim]);

    useEffect(() => { buscar(); }, []);

    function limpar() {
        setFCelula(""); setFStatus(""); setFDini(""); setFDfim("");
        setTimeout(buscar, 0);
    }

    const globalStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

        @keyframes rdcp-spin { to { transform: rotate(360deg); } }
        .rdcp-spin { animation: rdcp-spin 1s linear infinite; }

        .rdcp-root {
            font-family: 'Inter', sans-serif;
            color: ${t.text};
            position: relative;
            isolation: isolate;
        }

        .rdcp-eyebrow {
            font-family: 'Inter', sans-serif;
            font-size: 9px; font-weight: 600; letter-spacing: .18em;
            text-transform: uppercase;
        }

        .rdcp-title-eyebrow {
            font-size: 9px; font-weight: 500; letter-spacing: .2em;
            text-transform: uppercase; color: rgba(201,169,110,.6);
            margin: 0 0 4px;
        }
        .rdcp-title {
            font-family: 'Playfair Display', serif;
            font-size: clamp(18px, 4.4vw, 24px);
            font-weight: 500; color: ${t.text};
            margin: 0; line-height: 1.2; letter-spacing: .02em;
        }

        .rdcp-kpi-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px; margin-bottom: 22px;
        }
        @media (max-width: 900px) {
            .rdcp-kpi-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 520px) {
            .rdcp-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }

        .rdcp-kpi-card {
            background: ${t.bgEl}; border: 1px solid ${t.border};
            border-radius: 16px; padding: 16px 16px;
            position: relative; overflow: hidden;
            backdrop-filter: blur(20px);
        }
        .rdcp-kpi-stripe {
            position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
            border-radius: 16px 0 0 16px;
        }
        .rdcp-kpi-label {
            font-size: 8.5px; font-weight: 600; letter-spacing: .18em;
            text-transform: uppercase; color: ${t.textMuted}; margin-bottom: 8px;
        }
        .rdcp-kpi-value {
            font-family: 'Playfair Display', serif;
            font-size: clamp(22px, 5vw, 28px); font-weight: 700;
            line-height: 1; color: ${t.text};
        }
        .rdcp-kpi-sub {
            font-size: 11px; font-weight: 300; color: ${t.textSec}; margin-top: 4px;
        }

        /* ── Filtros ── */
        .rdcp-filters {
            background: ${t.bgEl}; border: 1px solid ${t.border};
            border-radius: 18px; padding: 18px;
            margin-bottom: 22px;
            display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end;
            backdrop-filter: blur(20px);
        }
        .rdcp-field {
            display: flex; flex-direction: column; gap: 6px;
            flex: 1; min-width: 140px;
        }
        @media (max-width: 640px) {
            .rdcp-field { min-width: 100%; }
        }
        .rdcp-field-label {
            font-size: 9px; font-weight: 600; letter-spacing: .18em;
            text-transform: uppercase; color: ${t.textMuted};
        }
        .rdcp-select, .rdcp-input {
            background: ${t.bgInput}; border: 1px solid ${t.borderInput};
            border-radius: 12px; color: ${t.text};
            font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
            padding: 12px 14px; outline: none; width: 100%;
            -webkit-appearance: none; appearance: none;
            transition: all .25s; box-sizing: border-box;
        }
        .rdcp-select:focus, .rdcp-input:focus {
            border-color: rgba(201,169,110,.5);
            box-shadow: 0 0 0 3px rgba(201,169,110,.08);
        }
        .rdcp-select option { background: ${t.optionBg}; color: ${t.text}; }
        input[type="date"].rdcp-input::-webkit-calendar-picker-indicator {
            filter: ${isDark ? "invert(1) opacity(0.4)" : "opacity(0.5)"}; cursor: pointer;
        }

        .rdcp-btn-row {
            display: flex; gap: 10px; width: 100%;
        }
        @media (min-width: 641px) {
            .rdcp-btn-row { width: auto; }
        }
        .rdcp-btn-filter {
            flex: 1;
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
            color: #fff; border: none; border-radius: 100px;
            font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .14em;
            text-transform: uppercase; cursor: pointer; transition: all .3s;
            padding: 12px 20px; white-space: nowrap;
            box-shadow: 0 6px 20px rgba(200,16,46,.25);
        }
        .rdcp-btn-filter:hover { opacity: .9; transform: translateY(-1px); }
        .rdcp-btn-clear {
            flex: 1;
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            background: transparent; color: ${t.textSec};
            border: 1px solid ${t.border}; border-radius: 100px;
            font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .14em;
            text-transform: uppercase; cursor: pointer; transition: all .3s;
            padding: 12px 18px; white-space: nowrap;
        }
        .rdcp-btn-clear:hover { border-color: ${t.gold}; color: ${t.gold}; }

        /* ── Cards / Células ── */
        .rdcp-card {
            border-radius: 18px; margin-bottom: 16px; overflow: hidden;
            backdrop-filter: blur(20px); position: relative;
        }
        .rdcp-card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(201,169,110,.25), transparent);
        }
        .rdcp-card-head {
            display: flex; align-items: center; justify-content: space-between;
            gap: 14px; padding: 16px 18px; cursor: pointer;
            transition: background .2s; flex-wrap: wrap;
        }
        .rdcp-card-head:hover { background: ${t.hoverBg}; }
        .rdcp-card-actions {
            display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
            justify-content: flex-end;
        }
        .rdcp-stats-row {
            display: flex; gap: 14px;
        }
        @media (max-width: 560px) {
            .rdcp-card-head { flex-direction: column; align-items: stretch; }
            .rdcp-card-actions { justify-content: space-between; width: 100%; }
            .rdcp-stats-row { gap: 10px; flex: 1; justify-content: space-between; }
        }
        @media (max-width: 380px) {
            .rdcp-stats-row > div:nth-child(4) { display: none; }
        }

        .rdcp-pdf-btn {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(200,16,46,.12); color: ${AURA.redLight};
            border: 1px solid rgba(200,16,46,.3); border-radius: 100px;
            font-family: 'Inter', sans-serif; font-size: 9.5px; font-weight: 600; letter-spacing: .14em;
            text-transform: uppercase; cursor: pointer; transition: all .25s;
            padding: 9px 14px; flex-shrink: 0;
        }
        .rdcp-pdf-btn:hover { background: rgba(200,16,46,.22); }
        @media (max-width: 380px) {
            .rdcp-pdf-label { display: none; }
            .rdcp-pdf-btn { padding: 9px 10px; }
        }

        /* ── Casa Card internals ── */
        .rdcp-minigrid {
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px;
        }
        @media (max-width: 460px) {
            .rdcp-minigrid { grid-template-columns: repeat(2, 1fr); }
        }

        .rdcp-badge {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 5px 12px; border-radius: 99px;
            font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .12em;
            white-space: nowrap;
        }

        .rdcp-decisao {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 5px 12px; border-radius: 99px;
            font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: .12em;
            white-space: nowrap;
        }

        /* ── Estado vazio / loading ── */
        .rdcp-empty {
            background: ${t.bgEl}; border: 1px solid ${t.border};
            border-radius: 18px; padding: 50px 20px; text-align: center;
            backdrop-filter: blur(20px);
        }

        .rdcp-footer-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
            margin-top: 28px;
        }
        .rdcp-footer-text {
            text-align: center;
            font-size: 9px; font-weight: 500; letter-spacing: .18em;
            text-transform: uppercase;
            color: ${isDark ? "rgba(245,240,232,.12)" : "rgba(26,16,8,.15)"};
            padding: 16px 0 0;
        }
    `;

    const kpis = [
        { lbl: "TOTAL CASAS",    val: kpiTotal, color: AURA.red,      sub: "no período"                },
        { lbl: "CONCLUÍDAS",     val: kpiCon,   color: AURA.teal,     sub: "encerradas"                },
        { lbl: "EM ANDAMENTO",   val: kpiAnd,   color: AURA.yellow,   sub: "ativas"                    },
        { lbl: "TOTAL DECISÕES", val: kpiDec,   color: AURA.blueFade, sub: "aceit. + reconc. + batis." },
        { lbl: "VISITANTES",     val: kpiVis,   color: AURA.gray,     sub: "únicos registrados"        },
    ];

    return (
        <div className="rdcp-root">
            <style>{globalStyles}</style>

            {/* Título */}
            <div style={{ marginBottom: 22 }}>
                <p className="rdcp-title-eyebrow">IEQ PITUAÇU · PAINEL PASTORAL</p>
                <h2 className="rdcp-title">
                    Relatórios <span style={{ color: t.gold }}>· Casas de Paz</span>
                </h2>
            </div>

            {/* KPIs */}
            <div className="rdcp-kpi-grid">
                {kpis.map(({ lbl, val, color, sub }) => (
                    <div key={lbl} className="rdcp-kpi-card">
                        <div className="rdcp-kpi-stripe" style={{ background: color }} />
                        <div className="rdcp-kpi-label">{lbl}</div>
                        <div className="rdcp-kpi-value">{val}</div>
                        <div className="rdcp-kpi-sub">{sub}</div>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div className="rdcp-filters">
                <div className="rdcp-field">
                    <label className="rdcp-field-label">CÉLULA</label>
                    <select className="rdcp-select" value={fCelula} onChange={(e) => setFCelula(e.target.value)}>
                        <option value="">Todas as células</option>
                        {celulas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>
                <div className="rdcp-field">
                    <label className="rdcp-field-label">STATUS</label>
                    <select className="rdcp-select" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                        <option value="">Todos</option>
                        <option value="EM_ANDAMENTO">Em Andamento</option>
                        <option value="CONCLUIDA">Concluída</option>
                        <option value="CANCELADA">Cancelada</option>
                    </select>
                </div>
                <div className="rdcp-field">
                    <label className="rdcp-field-label">DATA INÍCIO</label>
                    <input className="rdcp-input" type="date" value={fDini} onChange={(e) => setFDini(e.target.value)} />
                </div>
                <div className="rdcp-field">
                    <label className="rdcp-field-label">DATA FIM</label>
                    <input className="rdcp-input" type="date" value={fDfim} onChange={(e) => setFDfim(e.target.value)} />
                </div>
                <div className="rdcp-btn-row">
                    <button className="rdcp-btn-filter" onClick={buscar}>
                        <Filter size={13} /> Filtrar
                    </button>
                    <button className="rdcp-btn-clear" onClick={limpar}>
                        <RotateCcw size={13} /> Limpar
                    </button>
                </div>
            </div>

            {/* Conteúdo */}
            {loading ? (
                <TelaCarregando isDark={isDark} texto="Carregando relatório…" minHeight="40vh" background="transparent" />
            ) : dados.length === 0 ? (
                <div className="rdcp-empty">
                    <Home size={32} color={t.textMuted} style={{ marginBottom: 14, opacity: .5 }} />
                    <p className="rdcp-eyebrow" style={{ color: t.textMuted }}>
                        NENHUM RESULTADO ENCONTRADO
                    </p>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 14, color: t.textSec, marginTop: 8 }}>
                        Tente ajustar os filtros ou limpar a busca.
                    </p>
                </div>
            ) : (
                <AnimatePresence>
                    {dados.map((grupo) => <CelulaSection key={grupo.celulaId} grupo={grupo} t={t} isDark={isDark} />)}
                </AnimatePresence>
            )}

            {/* Rodapé */}
            <div className="rdcp-footer-divider" />
            <p className="rdcp-footer-text">
                © IEQ Pituaçu — Sistema Eclesiástico {new Date().getFullYear()}
            </p>
        </div>
    );
}
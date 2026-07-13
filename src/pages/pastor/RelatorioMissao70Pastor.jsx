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
    const totalVisCulto = missoes.reduce((s, m) => s + (m.totalVisitantesPorCulto ?? 0), 0);
    const totalJesus  = missoes.reduce((s, m) => s + (m.totalAceitouJesus ?? 0), 0);
    const totalReconc = missoes.reduce((s, m) => s + (m.totalReconciliacao ?? 0), 0);
    const totalBat    = missoes.reduce((s, m) => s + (m.totalDesejoBatismo ?? 0), 0);
    const totalDec    = totalJesus + totalReconc + totalBat;

    const kpis = [
        { label: "TOTAL MISSÕES",  val: missoes.length, sub: "registradas" },
        { label: "CONCLUÍDAS",     val: concluidas,     sub: "encerradas"  },
        { label: "ANDAMENTO",      val: andamento,      sub: "ativas"      },
        { label: "CANCELADAS",     val: canceladas,     sub: "interromp."  },
        { label: "VISITANTES",     val: totalVis,       sub: "únicos"      },
        { label: "VIS/CULTO",      val: totalVisCulto,  sub: "presenças"   },
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
        head:  [["#", "Nome da Missão", "Líder", "Status", "Semanas", "Visitantes", "Vis/Culto", "Decisões", "Início"]],
        body: missoes.map((m, i) => {
            const sem  = m.semanasRealizadas ?? 0;
            const vis  = m.totalVisitantes ?? 0;
            const visC = m.totalVisitantesPorCulto ?? 0;
            const dec  = (m.totalAceitouJesus ?? 0) + (m.totalReconciliacao ?? 0) + (m.totalDesejoBatismo ?? 0);
            const st   = m.status === "CONCLUIDA" ? "Concluída" : m.status === "CANCELADA" ? "Cancelada" : "Em Andamento";
            const ini  = m.dataInicio ? new Date(m.dataInicio).toLocaleDateString("pt-BR") : "—";
            return [i + 1, m.nome || `Missão ${m.id}`, m.nomeLider || "—", st, `${sem}/4`, vis, visC, dec, ini];
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
        const lider      = m.nomeLider      || "";
        const auxiliar   = m.nomeAuxiliar   || "";
        const terceiro   = m.nomeTerceiroMembro || m.terceiroMembroNome || "";
        const sem        = m.semanasRealizadas ?? 0;
        const vis        = m.totalVisitantes ?? 0;
        const visCulto   = m.totalVisitantesPorCulto ?? 0;
        const jesus      = m.totalAceitouJesus   ?? 0;
        const reconcil   = m.totalReconciliacao  ?? 0;
        const batis      = m.totalDesejoBatismo  ?? 0;
        const totalDecCard = jesus + reconcil + batis;
        const cancelada  = (m.status || "").toLowerCase().includes("cancel");
        const motivoDesc = m.motivoCancelamentoDescricao || "";
        const obsCancel  = m.observacaoCancelamento || "";
        const eqCount    = (lider ? 1 : 0) + (auxiliar ? 1 : 0) + (terceiro ? 1 : 0);
        const hasEquipe  = eqCount > 0;

        const cardH = 32 + (hasEquipe ? 12 : 0) + (totalDecCard > 0 ? 10 : 0)
            + (cancelada ? 10 : 0) + 8;

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
        const visLabel = `Semanas: ${sem}/4  •  Visitantes: ${vis} (únicos)  •  Vis/Culto: ${visCulto} (presenças)  •  Decisões: ${totalDecCard}`;
        doc.text(visLabel, 14, cy);
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
            doc.text(`${eqCount} pessoa${eqCount !== 1 ? "s" : ""}`, 30, cy);
            cy += 5;
            const membros = [];
            if (lider) membros.push(`Líder: ${lider}`);
            if (auxiliar) membros.push(`Auxiliar: ${auxiliar}`);
            if (terceiro) membros.push(`3º Membro: ${terceiro}`);
            if (membros.length) {
                doc.setFontSize(7);
                doc.setTextColor(80, 80, 80);
                doc.text(membros.join("  |  "), 30, cy);
                cy += 4;
            }
        }

        if (cancelada) {
            doc.setDrawColor(230, 230, 230);
            doc.line(14, cy, W - 14, cy);
            cy += 4;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(180, 50, 50);
            doc.text("CANCELADA:", 14, cy);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.setTextColor(80, 80, 80);
            const motivo = motivoDesc || "Sem motivo informado";
            doc.text(motivo + (obsCancel ? ` — "${obsCancel}"` : ""), 36, cy);
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

/**
 * Relatório GERAL — junta TODAS as células num único PDF.
 * modo "simples"    → só os KPIs gerais + uma tabela resumo de todas as missões.
 * modo "detalhado"  → KPIs + tabela resumo + os cards completos de cada missão,
 *                     agrupados por célula (igual ao PDF por célula, só que de todas).
 */
function gerarPDFGeral(grupos, modo = "simples") {
    const doc  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W    = doc.internal.pageSize.getWidth();
    const H    = doc.internal.pageSize.getHeight();
    const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    const todasMissoes = grupos.flatMap(g => g.missoes.map(m => ({ ...m, __celula: g.celulaName })));

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(155, 11, 30);
    doc.text("IEQ PITUACU - PAINEL PASTORAL", W / 2, 12, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text("RELATÓRIO GERAL - MISSÃO 70", W / 2, 20, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(modo === "detalhado" ? "VERSÃO DETALHADA · TODAS AS CÉLULAS" : "VERSÃO SIMPLES · TODAS AS CÉLULAS", W / 2, 27, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em ${hoje}`, W / 2, 33, { align: "center" });

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(10, 37, W - 10, 37);

    const concluidas    = todasMissoes.filter(m => m.status === "CONCLUIDA").length;
    const andamento     = todasMissoes.filter(m => m.status === "EM_ANDAMENTO").length;
    const canceladas    = todasMissoes.filter(m => m.status === "CANCELADA").length;
    const totalVis      = todasMissoes.reduce((s, m) => s + (m.totalVisitantes ?? 0), 0);
    const totalVisCulto = todasMissoes.reduce((s, m) => s + (m.totalVisitantesPorCulto ?? 0), 0);
    const totalJesus    = todasMissoes.reduce((s, m) => s + (m.totalAceitouJesus ?? 0), 0);
    const totalReconc   = todasMissoes.reduce((s, m) => s + (m.totalReconciliacao ?? 0), 0);
    const totalBat      = todasMissoes.reduce((s, m) => s + (m.totalDesejoBatismo ?? 0), 0);
    const totalDec      = totalJesus + totalReconc + totalBat;

    const kpis = [
        { label: "CÉLULAS",      val: grupos.length,      sub: "no relatório" },
        { label: "MISSÕES",      val: todasMissoes.length, sub: "registradas"  },
        { label: "CONCLUÍDAS",   val: concluidas,          sub: "encerradas"   },
        { label: "ANDAMENTO",    val: andamento,           sub: "ativas"       },
        { label: "CANCELADAS",   val: canceladas,          sub: "interromp."   },
        { label: "VISITANTES",   val: totalVis,            sub: "únicos"       },
        { label: "VIS/CULTO",    val: totalVisCulto,       sub: "presenças"    },
        { label: "DECISÕES",     val: totalDec,            sub: "total vidas"  },
    ];

    const kpiPerRow = 4;
    const kpiW = (W - 20) / kpiPerRow;
    kpis.forEach((k, i) => {
        const col = i % kpiPerRow;
        const row = Math.floor(i / kpiPerRow);
        const x = 10 + col * kpiW;
        const y = 42 + row * 19;
        doc.setDrawColor(210, 210, 210);
        doc.setFillColor(255, 255, 255);
        doc.rect(x, y, kpiW - 1, 17, "DF");
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

    const linhasKpi = Math.ceil(kpis.length / kpiPerRow);
    let y = 42 + linhasKpi * 19 + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(155, 11, 30);
    doc.text(`TODAS AS MISSÕES (${todasMissoes.length})`, 10, y);

    autoTable(doc, {
        startY: y + 3,
        head: [["#", "Célula", "Nome da Missão", "Líder", "Status", "Semanas", "Visitantes", "Vis/Culto", "Decisões"]],
        body: todasMissoes.map((m, i) => {
            const sem  = m.semanasRealizadas ?? 0;
            const vis  = m.totalVisitantes ?? 0;
            const visC = m.totalVisitantesPorCulto ?? 0;
            const dec  = (m.totalAceitouJesus ?? 0) + (m.totalReconciliacao ?? 0) + (m.totalDesejoBatismo ?? 0);
            const st   = m.status === "CONCLUIDA" ? "Concluída" : m.status === "CANCELADA" ? "Cancelada" : "Em Andamento";
            return [i + 1, m.__celula || "—", m.nome || `Missão ${m.id}`, m.nomeLider || "—", st, `${sem}/4`, vis, visC, dec];
        }),
        styles:             { fillColor: [255, 255, 255], textColor: [40, 40, 40], fontSize: 7.5, lineColor: [220, 220, 220], lineWidth: 0.1 },
        headStyles:         { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold", lineColor: [200, 200, 200], lineWidth: 0.2 },
        alternateRowStyles: { fillColor: [249, 249, 249] },
        columnStyles:       { 0: { halign: "center" }, 5: { halign: "center" }, 6: { halign: "center" }, 7: { halign: "center" }, 8: { halign: "center" } },
        margin:             { left: 10, right: 10 },
    });

    y = doc.lastAutoTable.finalY + 10;

    // ── Versão SIMPLES para por aqui: só KPIs + tabela resumo ──
    if (modo === "simples") {
        if (y + 15 > H) { doc.addPage(); y = H - 15; }
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(10, y + 2, W - 10, y + 2);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(`© IEQ PITUACU - SISTEMA SEGURO - ${new Date().getFullYear()}`, W / 2, y + 7, { align: "center" });

        const nomeArqSimples = `Relatorio_Geral_Missao70_Simples_${new Date().toISOString().split("T")[0]}.pdf`;
        doc.save(nomeArqSimples);
        return;
    }

    // ── Versão DETALHADA: cards completos de cada missão, agrupados por célula ──
    grupos.forEach(grupo => {
        if (grupo.missoes.length === 0) return;

        if (y + 12 > H - 15) { doc.addPage(); y = 15; }
        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(245, 240, 232);
        doc.rect(10, y, W - 20, 9, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(155, 11, 30);
        doc.text(grupo.celulaName.toUpperCase(), 13, y + 6);
        y += 13;

        grupo.missoes.forEach((m, i) => {
            const lider      = m.nomeLider      || "";
            const auxiliar   = m.nomeAuxiliar   || "";
            const terceiro   = m.nomeTerceiroMembro || m.terceiroMembroNome || "";
            const sem        = m.semanasRealizadas ?? 0;
            const vis        = m.totalVisitantes ?? 0;
            const visCulto   = m.totalVisitantesPorCulto ?? 0;
            const jesus      = m.totalAceitouJesus   ?? 0;
            const reconcil   = m.totalReconciliacao  ?? 0;
            const batis      = m.totalDesejoBatismo  ?? 0;
            const totalDecCard = jesus + reconcil + batis;
            const cancelada  = (m.status || "").toLowerCase().includes("cancel");
            const motivoDesc = m.motivoCancelamentoDescricao || "";
            const obsCancel  = m.observacaoCancelamento || "";
            const eqCount    = (lider ? 1 : 0) + (auxiliar ? 1 : 0) + (terceiro ? 1 : 0);
            const hasEquipe  = eqCount > 0;

            const cardH = 32 + (hasEquipe ? 12 : 0) + (totalDecCard > 0 ? 10 : 0)
                + (cancelada ? 10 : 0) + 8;

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
            doc.text(`Semanas: ${sem}/4  •  Visitantes: ${vis} (únicos)  •  Vis/Culto: ${visCulto} (presenças)  •  Decisões: ${totalDecCard}`, 14, cy);
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
                doc.text(`${eqCount} pessoa${eqCount !== 1 ? "s" : ""}`, 30, cy);
                cy += 5;
                const membros = [];
                if (lider) membros.push(`Líder: ${lider}`);
                if (auxiliar) membros.push(`Auxiliar: ${auxiliar}`);
                if (terceiro) membros.push(`3º Membro: ${terceiro}`);
                if (membros.length) {
                    doc.setFontSize(7);
                    doc.setTextColor(80, 80, 80);
                    doc.text(membros.join("  |  "), 30, cy);
                    cy += 4;
                }
            }

            if (cancelada) {
                doc.setDrawColor(230, 230, 230);
                doc.line(14, cy, W - 14, cy);
                cy += 4;
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.setTextColor(180, 50, 50);
                doc.text("CANCELADA:", 14, cy);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7);
                doc.setTextColor(80, 80, 80);
                const motivo = motivoDesc || "Sem motivo informado";
                doc.text(motivo + (obsCancel ? ` — "${obsCancel}"` : ""), 36, cy);
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

        y += 4;
    });

    if (y + 15 > H) { doc.addPage(); y = H - 15; }
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(10, y + 2, W - 10, y + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`© IEQ PITUACU - SISTEMA SEGURO - ${new Date().getFullYear()}`, W / 2, y + 7, { align: "center" });

    const nomeArqDet = `Relatorio_Geral_Missao70_Detalhado_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(nomeArqDet);
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
    const lider        = missao.nomeLider        || missao.lider        || "";
    const auxiliar     = missao.nomeAuxiliar     || missao.auxiliar     || "";
    const terceiro     = missao.nomeTerceiroMembro || missao.terceiroMembroNome || "";
    const anfitriao    = missao.nomeAnfitriao    || missao.anfitriao    || "";
    const semanas      = missao.semanasRealizadas ?? 0;
    const restantes    = missao.semanasRestantes  ?? Math.max(0, 4 - semanas);
    const jesus        = missao.totalAceitouJesus   ?? 0;
    const reconcil     = missao.totalReconciliacao  ?? 0;
    const batismos     = missao.totalDesejoBatismo  ?? 0;
    const totalDec     = jesus + reconcil + batismos;
    const totalVis     = missao.totalVisitantes ?? 0;
    const totalVisCulto = missao.totalVisitantesPorCulto ?? 0;
    const cancelada    = (missao.status || "").toLowerCase().includes("cancel");
    const motivocDesc  = missao.motivoCancelamentoDescricao || "";
    const obsCancel    = missao.observacaoCancelamento || "";

    const eqCount = (lider ? 1 : 0) + (auxiliar ? 1 : 0) + (terceiro ? 1 : 0);

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
            <SemanasBar realizadas={semanas} total={4} t={t} />

            {/* Mini-stats */}
            <div className="m70-minigrid">
                <MiniStat label="REALIZADAS"  value={semanas}      sub="semanas"    t={t} />
                <MiniStat label="RESTANTES"   value={restantes}    sub="semanas"    t={t} />
                <MiniStat label="VISITANTES"  value={totalVis}     sub="únicos"     t={t} />
                <MiniStat label="VIS/CULTO"   value={totalVisCulto} sub="presenças" t={t} />
                <MiniStat label="DECISÕES"    value={totalDec}     sub="total" color={AURA.yellow} t={t} />
            </div>

            {/* Equipe */}
            {eqCount > 0 && (
                <>
                    <Div t={t} />
                    <div style={{ marginBottom: 4 }}>
                        <div className="m70-eyebrow" style={{ color: t.textMuted, marginBottom: 9 }}>EQUIPE RESPONSÁVEL</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 600, color: t.text, lineHeight: 1 }}>
                                {eqCount}
                            </div>
                            <div>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: t.text, fontWeight: 400 }}>
                                    pessoa{eqCount !== 1 ? "s" : ""}
                                </div>
                                <div className="m70-eyebrow" style={{ color: t.textMuted }}>NA EQUIPE</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                            {lider && <span style={{ fontSize: 11, color: t.textSec }}>Líder: <b style={{ color: t.text }}>{lider}</b></span>}
                            {auxiliar && <span style={{ fontSize: 11, color: t.textSec }}>Auxiliar: <b style={{ color: t.text }}>{auxiliar}</b></span>}
                            {terceiro && <span style={{ fontSize: 11, color: t.textSec }}>3º Membro: <b style={{ color: t.text }}>{terceiro}</b></span>}
                        </div>
                    </div>
                </>
            )}

            {/* Cancelamento */}
            {cancelada && (
                <>
                    <Div t={t} />
                    <div style={{ marginBottom: 4 }}>
                        <div className="m70-eyebrow" style={{ color: t.red, marginBottom: 6 }}>CANCELAMENTO</div>
                        {motivocDesc && <div style={{ fontSize: 12, color: t.text }}>{motivocDesc}</div>}
                        {obsCancel && <div style={{ fontSize: 12, color: t.textSec, marginTop: 3, fontStyle: "italic" }}>"{obsCancel}"</div>}
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

/* ─── Agrupamento: quando o mesmo líder tem mais de uma casa na célula,
   elas são condensadas num único card (LiderCasasCard) em vez de aparecer
   como cards separados. Missões sem líder informado nunca são agrupadas
   entre si (cada uma some sozinha como grupo de 1), pra não misturar
   casas de líderes diferentes só porque nenhuma tem líder cadastrado. ── */
function agruparPorLider(missoes) {
    const semLider = [];
    const porLider = new Map();
    missoes.forEach(m => {
        const nome = (m.nomeLider || "").trim();
        if (!nome) { semLider.push(m); return; }
        if (!porLider.has(nome)) porLider.set(nome, []);
        porLider.get(nome).push(m);
    });
    const grupos = Array.from(porLider.entries()).map(([liderNome, casas]) => ({ liderNome, casas }));
    semLider.forEach(m => grupos.push({ liderNome: null, casas: [m] }));
    return grupos;
}

/* ─── Card condensado: líder com 2+ casas na mesma célula ──────────────── */
function LiderCasasCard({ liderNome, casas, t, onAbrir }) {
    const totalVis      = casas.reduce((s, c) => s + (c.totalVisitantes ?? 0), 0);
    const totalVisCulto = casas.reduce((s, c) => s + (c.totalVisitantesPorCulto ?? 0), 0);
    const totalDec      = casas.reduce((s, c) =>
        s + (c.totalAceitouJesus ?? 0) + (c.totalReconciliacao ?? 0) + (c.totalDesejoBatismo ?? 0), 0);
    const concluidas    = casas.filter(c => c.status === "CONCLUIDA").length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onAbrir}
            className="m70-lider-card"
            style={{
                background: t.innerCardBg,
                border: `1px solid ${t.border}`,
                borderRadius: 14, padding: "16px", marginBottom: 12,
                cursor: "pointer",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <Avatar name={liderNome} blue />
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: t.text, wordBreak: "break-word" }}>
                            {liderNome}
                        </div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 12, color: t.textSec, marginTop: 2 }}>
                            {casas.length} casas · {concluidas} concluída{concluidas !== 1 ? "s" : ""}
                        </div>
                    </div>
                </div>
                <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
                    padding: "5px 12px", borderRadius: 99,
                    fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".1em",
                    textTransform: "uppercase", color: AURA.gold,
                    background: "rgba(201,169,110,.1)", border: "1px solid rgba(201,169,110,.28)",
                }}>
                    Ver casas <ChevronDown size={12} />
                </span>
            </div>

            <div className="m70-minigrid" style={{ marginTop: 12 }}>
                <MiniStat label="CASAS"      value={casas.length}  sub="deste líder" t={t} />
                <MiniStat label="VISITANTES" value={totalVis}      sub="únicos"      t={t} />
                <MiniStat label="VIS/CULTO"  value={totalVisCulto} sub="presenças"   t={t} />
                <MiniStat label="DECISÕES"   value={totalDec}      sub="total" color={AURA.yellow} t={t} />
            </div>
        </motion.div>
    );
}

/* ─── Modal compacto: lista as casas de um líder dentro da célula ───────
   Cada casa vira uma LINHA (não um card grande), então mesmo com 50-100
   casas o modal fica pequeno, com uma lista rolável em vez de uma
   parede de cards. Cabeçalho e resumo ficam fixos no topo. ──────────── */
function ModalCasasDoLider({ open, onClose, dados, t }) {
    if (!open || !dados) return null;
    const { liderNome, celulaName, casas } = dados;

    const totalVis = casas.reduce((s, c) => s + (c.totalVisitantes ?? 0), 0);
    const totalDec = casas.reduce((s, c) =>
        s + (c.totalAceitouJesus ?? 0) + (c.totalReconciliacao ?? 0) + (c.totalDesejoBatismo ?? 0), 0);

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box" }}>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ position: "fixed", inset: 0, background: "rgba(10,10,15,.82)", backdropFilter: "blur(6px)" }}
            />
            <motion.div
                initial={{ scale: .96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .96, opacity: 0 }}
                transition={{ duration: .18 }}
                style={{
                    position: "relative", zIndex: 10, width: "100%", maxWidth: 340,
                    background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 18,
                    boxShadow: "0 24px 64px rgba(0,0,0,.45)",
                    maxHeight: "78vh", display: "flex", flexDirection: "column",
                    boxSizing: "border-box", overflow: "hidden",
                }}
            >
                {/* Cabeçalho fixo, enxuto */}
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    gap: 10, padding: "16px 16px 12px", borderBottom: `1px solid ${t.border}`, flexShrink: 0,
                }}>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 8.5, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: AURA.gold, margin: "0 0 3px" }}>
                            {celulaName}
                        </p>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: t.text, margin: 0, wordBreak: "break-word", lineHeight: 1.2 }}>
                            {liderNome}
                        </h3>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 2, flexShrink: 0 }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Resumo em uma linha só */}
                <div style={{
                    display: "flex", gap: 14, padding: "10px 16px", flexShrink: 0,
                    borderBottom: `1px solid ${t.border}`, background: t.miniStatBg,
                }}>
                    <span style={{ fontSize: 10.5, color: t.textSec }}>
                        <b style={{ color: t.text }}>{casas.length}</b> casas
                    </span>
                    <span style={{ fontSize: 10.5, color: t.textSec }}>
                        <b style={{ color: t.text }}>{totalVis}</b> visitantes
                    </span>
                    <span style={{ fontSize: 10.5, color: t.textSec }}>
                        <b style={{ color: AURA.yellow }}>{totalDec}</b> decisões
                    </span>
                </div>

                {/* Lista compacta, rolável */}
                <div style={{ overflowY: "auto", flex: 1 }}>
                    {casas.map((c, i) => {
                        const sem = c.semanasRealizadas ?? 0;
                        const vis = c.totalVisitantes ?? 0;
                        const dec = (c.totalAceitouJesus ?? 0) + (c.totalReconciliacao ?? 0) + (c.totalDesejoBatismo ?? 0);
                        const cfg = STATUS_CFG[c.status] || { color: "#888" };
                        return (
                            <div
                                key={c.id ?? i}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "9px 16px",
                                    borderBottom: i < casas.length - 1 ? `1px solid ${t.border}` : "none",
                                }}
                            >
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                                <span style={{
                                    fontFamily: "'Inter',sans-serif", fontSize: 12.5, color: t.text, fontWeight: 400,
                                    flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>
                                    {c.nome || `Casa ${i + 1}`}
                                </span>
                                <span style={{ fontSize: 10.5, color: t.textMuted, flexShrink: 0, width: 30, textAlign: "right" }}>
                                    {sem}/4
                                </span>
                                <span style={{ fontSize: 10.5, color: t.textMuted, flexShrink: 0, width: 26, textAlign: "right" }}>
                                    {vis}v
                                </span>
                                <span style={{ fontSize: 10.5, color: dec > 0 ? AURA.yellow : t.textMuted, flexShrink: 0, width: 22, textAlign: "right", fontWeight: dec > 0 ? 600 : 400 }}>
                                    {dec}d
                                </span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Quadrado pequeno representando UMA casa/missão dentro do modal
   da célula. Clicar nele mostra os dados completos daquele culto
   (semanas, visitantes, decisões, equipe, cancelamento) na sequência. ── */
function SquareTile({ missao, t, onClick }) {
    const cfg      = STATUS_CFG[missao.status] || { color: "#888" };
    const semanas  = missao.semanasRealizadas ?? 0;
    const dec      = (missao.totalAceitouJesus ?? 0) + (missao.totalReconciliacao ?? 0) + (missao.totalDesejoBatismo ?? 0);
    const nome     = missao.nome || `Casa ${missao.id ?? ""}`;

    return (
        <button
            onClick={onClick}
            className="m70-square-tile"
            style={{ borderColor: `${cfg.color}55`, background: `${cfg.color}0d` }}
            title={nome}
        >
            <span className="m70-square-dot" style={{ background: cfg.color }} />
            <span className="m70-square-nome" style={{ color: t.text }}>{nome}</span>
            <span className="m70-square-foot">
                <span style={{ color: t.textMuted }}>{semanas}/4</span>
                {dec > 0 && <span style={{ color: AURA.yellow, fontWeight: 700 }}>{dec}✦</span>}
            </span>
        </button>
    );
}

/* ─── Modal da célula: primeiro mostra os "quadradinhos" de cada casa;
   ao clicar em um deles, o próprio modal troca de vista e mostra os
   dados completos daquele culto (reaproveitando o MissaoCard), com um
   botão de voltar para a grade de casas. ─────────────────────────────── */
function ModalCelulaDetalhe({ open, onClose, grupo, t }) {
    const [missaoSelecionada, setMissaoSelecionada] = useState(null);

    // Sempre que o modal fecha ou troca de célula, volta para a grade
    useEffect(() => {
        if (!open) setMissaoSelecionada(null);
    }, [open, grupo]);

    if (!open || !grupo) return null;

    const missoes  = grupo.missoes || [];
    const totalVis = missoes.reduce((s, m) => s + (m.totalVisitantes ?? 0), 0);
    const totalDec = missoes.reduce((s, m) =>
        s + (m.totalAceitouJesus ?? 0) + (m.totalReconciliacao ?? 0) + (m.totalDesejoBatismo ?? 0), 0);

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box" }}>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ position: "fixed", inset: 0, background: "rgba(10,10,15,.82)", backdropFilter: "blur(6px)" }}
            />
            <motion.div
                initial={{ scale: .96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .96, opacity: 0 }}
                transition={{ duration: .18 }}
                style={{
                    position: "relative", zIndex: 10, width: "100%", maxWidth: 560,
                    background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 18,
                    boxShadow: "0 24px 64px rgba(0,0,0,.45)",
                    maxHeight: "86vh", display: "flex", flexDirection: "column",
                    boxSizing: "border-box", overflow: "hidden", overflowX: "hidden",
                }}
            >
                {/* Cabeçalho fixo */}
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    gap: 10, padding: "16px 18px 12px", borderBottom: `1px solid ${t.border}`, flexShrink: 0,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        {missaoSelecionada && (
                            <button
                                onClick={() => setMissaoSelecionada(null)}
                                style={{
                                    background: "rgba(201,169,110,.1)", border: "1px solid rgba(201,169,110,.28)",
                                    borderRadius: 8, width: 28, height: 28, flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", color: AURA.gold,
                                }}
                                title="Voltar para as casas"
                            >
                                <ChevronDown size={14} style={{ transform: "rotate(90deg)" }} />
                            </button>
                        )}
                        <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 8.5, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: AURA.gold, margin: "0 0 3px" }}>
                                {grupo.celulaName}
                            </p>
                            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: t.text, margin: 0, wordBreak: "break-word", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {missaoSelecionada ? (missaoSelecionada.nome || "Missão") : `${missoes.length} casa${missoes.length !== 1 ? "s" : ""}`}
                            </h3>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 2, flexShrink: 0 }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Resumo em uma linha só — só aparece na grade */}
                {!missaoSelecionada && (
                    <div style={{
                        display: "flex", gap: 14, padding: "10px 18px", flexShrink: 0,
                        borderBottom: `1px solid ${t.border}`, background: t.miniStatBg,
                    }}>
                        <span style={{ fontSize: 10.5, color: t.textSec }}>
                            <b style={{ color: t.text }}>{missoes.length}</b> casas
                        </span>
                        <span style={{ fontSize: 10.5, color: t.textSec }}>
                            <b style={{ color: t.text }}>{totalVis}</b> visitantes
                        </span>
                        <span style={{ fontSize: 10.5, color: t.textSec }}>
                            <b style={{ color: AURA.yellow }}>{totalDec}</b> decisões
                        </span>
                    </div>
                )}

                {/* Corpo: grade de quadradinhos OU detalhes do culto selecionado */}
                <div style={{ overflowY: "auto", overflowX: "hidden", flex: 1, padding: missaoSelecionada ? "16px" : "16px 18px", boxSizing: "border-box" }}>
                    {!missaoSelecionada ? (
                        missoes.length === 0 ? (
                            <p style={{ fontFamily: "'Inter',sans-serif", fontStyle: "italic", fontSize: 13, fontWeight: 300, color: t.textMuted, textAlign: "center", padding: "20px 0" }}>
                                Nenhuma casa encontrada nesta célula.
                            </p>
                        ) : (
                            <div className="m70-square-grid">
                                {missoes.map((m, i) => (
                                    <SquareTile key={m.id ?? i} missao={m} t={t} onClick={() => setMissaoSelecionada(m)} />
                                ))}
                            </div>
                        )
                    ) : (
                        <MissaoCard missao={missaoSelecionada} t={t} />
                    )}
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Seção de Célula (espelho do CelulaSection) ───────────────────────── */
function CelulaSection({ grupo, t, isDark, onAbrirCelula }) {
    const [pdfLoading, setPdfLoading] = useState(false);

    const totalDec  = grupo.missoes.reduce((acc, m) =>
        acc + (m.totalAceitouJesus ?? 0) + (m.totalReconciliacao ?? 0) + (m.totalDesejoBatismo ?? 0), 0);
    const concl     = grupo.missoes.filter(m => m.status === "CONCLUIDA").length;
    const andamento = grupo.missoes.filter(m => m.status === "EM_ANDAMENTO").length;
    // Visitantes únicos desta célula (mesma pessoa não é contada 2x, mesmo em missões diferentes)
    const totalVis  = grupo.missoes.reduce((s, m) => s + (m.totalVisitantes ?? 0), 0);
    // Soma de presenças por culto desta célula (conta 1x por semana em que a pessoa participou)
    const totalVisCulto = grupo.missoes.reduce((s, m) => s + (m.totalVisitantesPorCulto ?? 0), 0);

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
                onClick={() => onAbrirCelula(grupo)}
                style={{ borderBottom: "none" }}
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
                            { val: totalVis,             lbl: "VISITANTES", color: AURA.gray     },
                            { val: totalVisCulto,        lbl: "VIS/CULTO",  color: AURA.blueFade },
                            { val: totalDec,             lbl: "DECISÕES",   color: AURA.redLight },
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

                    <ChevronDown size={15} color={t.textMuted} />
                </div>
            </div>
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
    const [fCelula, setFCelula] = useState("");
    const [resumo,  setResumo]  = useState(null);
    // Controla qual versão do relatório geral está sendo gerada agora
    // ("simples" | "detalhado" | null), para mostrar o spinner no botão certo
    const [gerandoGeral, setGerandoGeral] = useState(null);
    // Modal da célula: mostra os quadradinhos de cada casa e, ao clicar,
    // os dados completos do culto daquela casa
    const [modalCelulaAberto, setModalCelulaAberto] = useState(false);
    const [celulaSelecionada, setCelulaSelecionada] = useState(null);

    const t = theme(isDark);

    /* ── KPIs via endpoint /resumo ── */
    useEffect(() => {
        api.get("/api/pastor/missao70/resumo")
            .then(r => setResumo(r.data))
            .catch(() => {});
    }, []);

    const kpiTotal = resumo?.total ?? dados.reduce((a, g) => a + g.missoes.length, 0);
    const kpiCon   = resumo?.concluidas ?? dados.reduce((a, g) => a + g.missoes.filter(m => m.status === "CONCLUIDA").length, 0);
    const kpiAnd   = resumo?.emAndamento ?? dados.reduce((a, g) => a + g.missoes.filter(m => m.status === "EM_ANDAMENTO").length, 0);
    const kpiCan   = resumo?.canceladas ?? dados.reduce((a, g) => a + g.missoes.filter(m => m.status === "CANCELADA").length, 0);
    const kpiDec   = (resumo?.totalAceitouJesus ?? 0) + (resumo?.totalReconciliacao ?? 0) + (resumo?.totalBatismo ?? 0)
        || dados.reduce((a, g) => g.missoes.reduce((b, m) =>
            b + (m.totalAceitouJesus ?? 0) + (m.totalReconciliacao ?? 0) + (m.totalDesejoBatismo ?? 0), a), 0);
    // Visitantes únicos (mesma pessoa conta 1x, mesmo que tenha ido a vários cultos)
    const kpiVis   = resumo?.totalVisitantes ?? dados.reduce((a, g) => g.missoes.reduce((b, m) => b + (m.totalVisitantes ?? 0), a), 0);
    // Soma de presenças por culto (conta 1x por semana em que a pessoa esteve presente) — soma completa de todas as células
    const kpiVisCulto = resumo?.totalVisitantesPorCulto ?? dados.reduce((a, g) => g.missoes.reduce((b, m) => b + (m.totalVisitantesPorCulto ?? 0), a), 0);

    function agrupar(flat) {
        // O DTO do backend (RelatorioMissao70DTO) não expõe um "celulaId",
        // apenas "nomeCelula". Antes o agrupamento usava `m.celulaId || 0`,
        // que era SEMPRE 0 (campo inexistente) — por isso, quando duas
        // células enviavam relatório, as duas caíam no mesmo grupo e
        // pareciam ser uma célula só. Agora agrupamos pelo próprio nome
        // da célula, que é o único identificador que a API realmente envia.
        const map = new Map();
        flat.forEach(m => {
            const nome = m.nomeCelula || "Sem célula";
            if (!map.has(nome)) map.set(nome, { celulaId: nome, celulaName: nome, missoes: [] });
            map.get(nome).missoes.push(m);
        });
        return Array.from(map.values()).sort((a, b) => a.celulaName.localeCompare(b.celulaName));
    }

    const buscar = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (fCelula) params.append("celulaId", fCelula);
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
    }, [fCelula, fStatus, fDini, fDfim]);

    useEffect(() => { buscar(); }, []);

    function limpar() {
        setFStatus(""); setFDini(""); setFDfim(""); setFBusca(""); setFCelula("");
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
        { lbl: "TOTAL MISSÕES",   val: kpiTotal,   color: AURA.red,      sub: "no período"                },
        { lbl: "CONCLUÍDAS",      val: kpiCon,     color: AURA.teal,     sub: "encerradas"                },
        { lbl: "EM ANDAMENTO",    val: kpiAnd,     color: AURA.yellow,   sub: "ativas"                    },
        { lbl: "CANCELADAS",      val: kpiCan,     color: AURA.redLight, sub: "interrompidas"             },
        { lbl: "VISITANTES",      val: kpiVis,     color: AURA.gray,     sub: "únicos (todas as células)" },
        { lbl: "VISITANTES/CULTO",val: kpiVisCulto,color: AURA.blueFade, sub: "soma de presenças"         },
        { lbl: "TOTAL DECISÕES",  val: kpiDec,     color: AURA.blueFade, sub: "aceit. + reconc. + batis." },
    ];

    /* ── Estilos globais (mesmos do CasasDePaz, prefixo m70-) ── */
    const globalStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

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
            grid-template-columns: repeat(7, 1fr);
            gap: 12px; margin-bottom: 22px;
        }
        @media (max-width: 1100px) { .m70-kpi-grid { grid-template-columns: repeat(4, 1fr); } }
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
        .m70-stats-row { display: flex; gap: 12px; flex-wrap: wrap; }

        @media (max-width: 560px) {
            .m70-card-head { flex-direction: column; align-items: stretch; }
            .m70-card-actions { justify-content: space-between; width: 100%; }
            .m70-stats-row { gap: 10px; flex: 1; justify-content: space-between; }
        }
        @media (max-width: 380px) {
            .m70-stats-row > div:nth-child(4),
            .m70-stats-row > div:nth-child(5) { display: none; }
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

        /* ── Mini grid dentro do card de missão ──
           OBS: antes era "repeat(5, 1fr)" com breakpoints baseados na
           largura da JANELA. Dentro de um modal estreito (ex: no celular),
           a largura real disponível é bem menor que a da janela, então os
           breakpoints nunca disparavam e os rótulos ("REALIZADAS",
           "VIS/CULTO" etc.) forçavam cada coluna a ficar mais larga que o
           espaço reservado — o grid transbordava e cortava a última
           coluna, aparecendo a barra de rolagem horizontal. Agora usamos
           auto-fit/minmax, que se adapta à largura REAL do contêiner (não
           da janela), e min-width:0 nos itens, para eles poderem encolher
           e quebrar linha em vez de empurrar o grid para fora. */
        .m70-minigrid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(88px, 1fr)); gap: 8px; margin-bottom: 12px;
        }
        .m70-minigrid > div { min-width: 0; }

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

        /* ── Grade de quadradinhos (casas dentro do modal da célula) ── */
        .m70-square-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
            gap: 10px;
        }
        .m70-square-tile {
            display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
            padding: 10px 10px 8px;
            border: 1px solid ${t.border}; border-radius: 12px;
            cursor: pointer; text-align: left;
            font-family: 'Inter', sans-serif;
            transition: transform .15s, border-color .15s;
            min-height: 74px;
        }
        .m70-square-tile:hover { transform: translateY(-2px); }
        .m70-square-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .m70-square-nome {
            font-size: 11.5px; font-weight: 500; line-height: 1.25;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
            overflow: hidden; word-break: break-word; flex: 1;
        }
        .m70-square-foot {
            display: flex; align-items: center; justify-content: space-between;
            width: 100%; font-size: 9.5px; font-weight: 600; letter-spacing: .02em;
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

    const handleGerarGeral = (modo) => {
        if (dadosFiltrados.length === 0) return;
        setGerandoGeral(modo);
        try { gerarPDFGeral(dadosFiltrados, modo); }
        catch (err) { console.error("Erro ao gerar relatório geral:", err); }
        finally { setGerandoGeral(null); }
    };

    // Abre o modal de uma célula específica (quadradinhos das casas)
    const abrirCelula = (grupo) => {
        setCelulaSelecionada(grupo);
        setModalCelulaAberto(true);
    };
    const fecharModalCelula = () => setModalCelulaAberto(false);

    return (
        <div className="m70-root">
            <style>{globalStyles}</style>

            {/* ── Título + Relatório Geral ── */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
                <div>
                    <p className="m70-title-eyebrow">IEQ PITUAÇU · PAINEL PASTORAL</p>
                    <h2 className="m70-title">
                        Relatórios <span style={{ color: AURA.gold }}>· Missão 70</span>
                    </h2>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                        className="m70-btn-clear"
                        onClick={() => handleGerarGeral("simples")}
                        disabled={gerandoGeral !== null || dadosFiltrados.length === 0}
                        style={{ opacity: gerandoGeral === "simples" ? .6 : 1 }}
                    >
                        {gerandoGeral === "simples"
                            ? <><Loader2 size={13} className="m70-spin" /> Gerando...</>
                            : <><FileText size={13} /> Relatório Geral · Simples</>}
                    </button>
                    <button
                        className="m70-btn-filter"
                        onClick={() => handleGerarGeral("detalhado")}
                        disabled={gerandoGeral !== null || dadosFiltrados.length === 0}
                        style={{ opacity: gerandoGeral === "detalhado" ? .6 : 1 }}
                    >
                        {gerandoGeral === "detalhado"
                            ? <><Loader2 size={13} className="m70-spin" /> Gerando...</>
                            : <><FileDown size={13} /> Relatório Geral · Detalhado</>}
                    </button>
                </div>
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

                {/* Célula */}
                <div className="m70-field">
                    <label className="m70-field-label">CÉLULA ID</label>
                    <input className="m70-input-date" type="number" placeholder="ID" value={fCelula} onChange={e => setFCelula(e.target.value)} min="1" />
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
                        <CelulaSection
                            key={grupo.celulaId}
                            grupo={grupo}
                            t={t}
                            isDark={isDark}
                            onAbrirCelula={abrirCelula}
                        />
                    ))}
                </AnimatePresence>
            )}

            {/* ── Rodapé ── */}
            <div className="m70-footer-divider" />
            <p className="m70-footer-text">
                © IEQ Pituaçu — Sistema Eclesiástico {new Date().getFullYear()}
            </p>

            {/* ── Modal da célula: quadradinhos das casas + detalhes do culto ── */}
            <AnimatePresence>
                {modalCelulaAberto && (
                    <ModalCelulaDetalhe
                        open={modalCelulaAberto}
                        onClose={fecharModalCelula}
                        grupo={celulaSelecionada}
                        t={t}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
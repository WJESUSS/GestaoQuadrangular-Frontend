import React from "react";
import { motion } from "framer-motion";
import {
  X, Calendar, Clock, Mic2, Users, Baby, UserCheck,
  Download, Church, Megaphone, FileText, ClipboardList,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── Paleta (mesma dos outros módulos) ─────────────────────────────────── */
const AURA = {
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  red:       "#C8102E",
  redDark:   "#9B0B1E",
  blue:      "#003DA5",
  blueDark:  "#002470",
  yellow:    "#FDB813",
  green:     "#16a34a",
};

const TIPO_CORES = {
  "Vitória":    { color: "#16a34a", bg: "rgba(22,163,74,.12)",  border: "rgba(22,163,74,.30)" },
  "Santa Ceia": { color: AURA.gold, bg: "rgba(201,169,110,.12)", border: "rgba(201,169,110,.30)" },
  "Celebração": { color: AURA.blue, bg: "rgba(0,61,165,.12)",   border: "rgba(0,61,165,.30)"   },
  "Missões":    { color: AURA.red,  bg: "rgba(200,16,46,.12)",  border: "rgba(200,16,46,.30)"  },
  "Outro":      { color: AURA.yellow, bg: "rgba(253,184,19,.12)", border: "rgba(253,184,19,.30)" },
};

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function fmtData(d) {
  if (!d) return "—";
  const [y, m, dia] = d.split("-");
  return `${dia}/${m}/${y}`;
}

function totalGeral(c) {
  return (c.quantidadeMembros || 0) + (c.visitantesSimpatizantes || 0) + (c.totalCriancas || 0) + (c.quantidadeDiaconos || 0);
}

/* ─── PDF ───────────────────────────────────────────────────────────────── */
function gerarPDF(culto) {
  const doc = new jsPDF();
  const tot = totalGeral(culto);

  doc.setFillColor(0, 36, 112);
  doc.rect(0, 0, 210, 38, "F");

  doc.setFontSize(15); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
  doc.text("IEQ PITUAÇU — REGISTRO DE CULTO", 14, 14);

  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text(`Tipo: ${culto.tipoCulto || "—"}  |  Data: ${fmtData(culto.data)}  |  Horário: ${culto.horario || "—"}  |  Pregador: ${culto.pregador || "—"}`, 14, 22);

  if (culto.textoPregado) {
    doc.text(`Texto: ${culto.textoPregado}`, 14, 29);
  }

  doc.setTextColor(0);

  autoTable(doc, {
    startY: 44,
    head: [["Categoria", "Quantidade"]],
    body: [
      ["Membros",              String(culto.quantidadeMembros || 0)],
      ["Visitantes/Simpatizantes", String(culto.visitantesSimpatizantes || 0)],
      ["Crianças",             String(culto.totalCriancas || 0)],
      ["Diáconos Presentes",   String(culto.quantidadeDiaconos || 0)],
      ["TOTAL GERAL",          String(tot)],
    ],
    headStyles: { fillColor: [0, 36, 112], textColor: 255, fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 9 },
    theme: "grid",
    didParseCell(d) {
      if (d.section === "body" && d.row.index === 4) {
        d.cell.styles.fontStyle = "bold";
        d.cell.styles.textColor = [0, 36, 112];
      }
    },
  });

  let y = doc.lastAutoTable.finalY + 10;

  if (culto.campanha && culto.nomeCampanha) {
    doc.setFillColor(253, 184, 19);
    doc.roundedRect(14, y, 182, 8, 2, 2, "F");
    doc.setFontSize(9); doc.setTextColor(30, 25, 0); doc.setFont("helvetica", "bold");
    doc.text(`Campanha: ${culto.nomeCampanha}`, 18, y + 5.5);
    y += 16;
  }

  if (culto.observacoes) {
    doc.setFontSize(9); doc.setTextColor(100); doc.setFont("helvetica", "italic");
    doc.text("Observações:", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(culto.observacoes, 182);
    doc.text(lines, 14, y);
  }

  doc.save(`Culto_${culto.tipoCulto || "registro"}_${culto.data || "data"}.pdf`);
}

/* ══════════════════════════════════════════════════════════════════════════
   MODAL DE DETALHE
══════════════════════════════════════════════════════════════════════════ */
export default function ModalCulto({ culto, isDark, t, onClose }) {
  if (!culto) return null;

  const tc  = TIPO_CORES[culto.tipoCulto] || TIPO_CORES["Outro"];
  const tot = totalGeral(culto);

  return (
      <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: .25 }}
          className="disc-modal-overlay"
          onClick={onClose}
      >
        <motion.div
            initial={{ y: 18, opacity: 0, scale: .96 }}
            animate={{ y: 0,  opacity: 1, scale: 1   }}
            exit={{    y: 12, opacity: 0, scale: .97 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, mass: .8 }}
            onClick={e => e.stopPropagation()}
            className="disc-modal"
            style={{
              boxShadow: isDark
                  ? "0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(201,169,110,.06)"
                  : "0 40px 100px rgba(26,16,8,.18), 0 0 0 1px rgba(201,169,110,.08)",
            }}
        >
          {/* faixa dourada topo */}
          <div style={{ height: 3, background: `linear-gradient(90deg, ${tc.color}, ${t.gold})`, flexShrink: 0 }} />

          {/* Header */}
          <div className="disc-modal-header">
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                background: `linear-gradient(135deg, ${tc.bg}, ${tc.color})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 8px 20px ${tc.color}35`,
              }}>
                <Church size={20} style={{ color: "#fff" }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontSize: 9, letterSpacing: ".16em", fontWeight: 700,
                  color: `${t.gold}99`, margin: "0 0 4px", textTransform: "uppercase",
                }}>
                  {culto.tipoCulto || "Culto"}
                </p>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 500,
                  color: t.text, margin: "0 0 5px", lineHeight: 1.2,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {culto.pregador || "Sem pregador"}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={12} style={{ color: t.textMuted, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, fontWeight: 300, color: t.textSec, margin: 0 }}>
                    {fmtData(culto.data)}
                  </p>
                  {culto.horario && (
                      <>
                        <span style={{ fontSize: 12, color: t.textMuted }}>·</span>
                        <Clock size={12} style={{ color: t.textMuted, flexShrink: 0 }} />
                        <p style={{ fontSize: 12, fontWeight: 300, color: t.textSec, margin: 0 }}>
                          {culto.horario}
                        </p>
                      </>
                  )}
                </div>
              </div>
            </div>

            <button
                onClick={onClose}
                style={{
                  background: t.bgInput, border: `1px solid ${t.border}`,
                  color: t.textSec, padding: 9, borderRadius: 11, cursor: "pointer",
                  display: "flex", flexShrink: 0, transition: "all .2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${AURA.red}50`; e.currentTarget.style.color = AURA.red; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSec; }}
                aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          {/* KPIs */}
          <div className="disc-kpis">
            {[
              { label: "Membros",     value: culto.quantidadeMembros || 0,         color: t.text,    icon: Users      },
              { label: "Visitantes",  value: culto.visitantesSimpatizantes || 0,   color: AURA.gold, icon: Users      },
              { label: "Crianças",    value: culto.totalCriancas || 0,             color: "#8B5CF6", icon: Baby       },
              { label: "Diáconos",    value: culto.quantidadeDiaconos || 0,        color: AURA.green, icon: UserCheck },
              { label: "Total Geral", value: tot,                                  color: AURA.blue, icon: null       },
            ].map((k, i) => (
                <div key={i} style={{
                  padding: "14px 12px", borderRadius: 14,
                  background: t.bgInput, border: `1px solid ${t.border}`,
                  display: "flex", flexDirection: "column", gap: 6, minWidth: 0,
                  ...(k.label === "Total Geral" ? {
                    background: `linear-gradient(135deg, ${AURA.blueDark}15, ${AURA.blue}08)`,
                    borderColor: `${AURA.blue}28`,
                  } : {}),
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 9, letterSpacing: ".1em", color: t.textMuted, fontWeight: 700, textTransform: "uppercase" }}>
                      {k.label}
                    </span>
                    {k.icon && <k.icon size={12} style={{ color: k.color, opacity: .6 }} />}
                  </div>
                  <p style={{
                    fontSize: k.label === "Total Geral" ? 26 : 22, fontWeight: 700,
                    color: k.color, margin: 0, lineHeight: 1,
                    fontFamily: "'Playfair Display', serif",
                  }}>
                    {k.value}
                  </p>
                </div>
            ))}
          </div>

          {/* Conteúdo detalhado */}
          <div style={{ padding: "16px 16px", flex: 1 }}>
            {culto.textoPregado && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <FileText size={12} style={{ color: t.gold }} />
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: t.textMuted }}>
                      Texto Pregado
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: t.text, margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
                    "{culto.textoPregado}"
                  </p>
                </div>
            )}

            {culto.campanha && culto.nomeCampanha && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 14px", borderRadius: 12,
                  background: `${AURA.yellow}10`, border: `1px solid ${AURA.yellow}28`,
                  marginBottom: 14,
                }}>
                  <Megaphone size={14} style={{ color: AURA.yellow }} />
                  <div>
                    <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: AURA.yellow, margin: "0 0 2px" }}>
                      Campanha
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: t.text, margin: 0 }}>
                      {culto.nomeCampanha}
                    </p>
                  </div>
                </div>
            )}

            {culto.observacoes && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <ClipboardList size={12} style={{ color: t.gold }} />
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: t.textMuted }}>
                      Observações
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: t.textSec, margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {culto.observacoes}
                  </p>
                </div>
            )}

            {!culto.textoPregado && !culto.observacoes && !(culto.campanha && culto.nomeCampanha) && (
                <p style={{ fontSize: 13, color: t.textMuted, fontStyle: "italic", textAlign: "center", margin: "8px 0" }}>
                  Nenhum detalhe adicional registrado.
                </p>
            )}
          </div>

          {/* Footer */}
          <div className="disc-modal-footer">
            <button
                onClick={onClose}
                style={{
                  flex: 1, padding: "12px", borderRadius: 100,
                  border: `1px solid ${t.border}`, cursor: "pointer",
                  background: "transparent", color: t.textSec,
                  fontSize: 11, fontWeight: 600, letterSpacing: ".12em",
                  textTransform: "uppercase", transition: "all .2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = t.textMuted; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; }}
            >
              Fechar
            </button>
            <button
                onClick={() => gerarPDF(culto)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "12px", borderRadius: 100, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue})`,
                  color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: ".12em",
                  textTransform: "uppercase", transition: "opacity .2s, transform .2s",
                  boxShadow: `0 8px 22px ${AURA.blue}35`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Download size={13} /> Exportar PDF
            </button>
          </div>
        </motion.div>
      </motion.div>
  );
}

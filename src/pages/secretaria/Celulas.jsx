import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Plus, X, Building2, Clock, Search, ChevronRight, Loader2,
  Calendar, MapPin, Users, ArrowLeft, Trash2, Edit2, FileDown,
} from "lucide-react";

/* ─── AURA Design Tokens (igual ao Dashboard) ─────────────────────── */
const AURA = {
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  dark:      "#0A0A0F",
  darkEl:    "#12121A",
  light:     "#F5F0E8",
  red:       "#C8102E",
  redDark:   "#9B0B1E",
  blue:      "#003DA5",
  blueDark:  "#002470",
  yellow:    "#FDB813",
  green:     "#059669",
  greenDark: "#047857",
};

function themeCelulas(isDark) {
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
  };
}

const DIAS = {
  MONDAY:    "Segunda",
  TUESDAY:   "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY:  "Quinta",
  FRIDAY:    "Sexta",
  SATURDAY:  "Sábado",
  SUNDAY:    "Domingo",
};

const formInicial = {
  nome: "", liderId: "", anfitriao: "", endereco: "",
  bairro: "", diaSemana: "MONDAY", horario: "19:30",
};

/* ─── GlobalStyles ────────────────────────────────────────────────── */
function GlobalStylesCelulas({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes dl-spin   { to { transform: rotate(360deg); } }
      @keyframes dl-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }

      .dl-spin   { animation: dl-spin  1s linear infinite; }
      .dl-pulse  { animation: dl-pulse 3s ease-in-out infinite; }

      .cel-root {
        font-family: 'Inter', sans-serif;
        background: ${t.bg};
        color: ${t.text};
        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
        padding-bottom: max(40px, env(safe-area-inset-bottom, 40px));
        transition: background .3s, color .3s;
      }
      
      .cel-glow {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
          radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%);
      }
      
      .cel-content {
        position: relative; z-index: 1;
        max-width: 960px; margin: 0 auto;
        padding: 20px 16px 0;
      }
      @media(max-width: 420px) { .cel-content { padding: 16px 12px 0; } }

      .cel-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
      }
      
      .cel-header-left {
        display: flex; align-items: center; gap: 12px; flex: 1;
      }

      .cel-header-actions {
        display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      }
      
      .cel-title-block {
        flex: 1; min-width: 0;
      }
      
      .cel-eyebrow {
        font-size: 9px; font-weight: 500; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(201,169,110,.55);
        margin: 0 0 3px;
      }
      
      .cel-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(17px, 4vw, 22px);
        font-weight: 500; color: ${t.text};
        margin: 0; line-height: 1.2;
      }
      
      .cel-btn-gold {
        display: flex; align-items: center; gap: 7px;
        padding: 11px 20px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.green}, ${AURA.greenDark});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; transition: all .35s;
        box-shadow: 0 6px 22px rgba(5,150,105,.22); flex-shrink: 0;
      }
      .cel-btn-gold:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(5,150,105,.32); }
      .cel-btn-gold:disabled {
        opacity: .6; cursor: not-allowed; transform: none;
        box-shadow: none;
      }

      .cel-btn-outline {
        display: flex; align-items: center; gap: 7px;
        padding: 11px 18px; border-radius: 100px; cursor: pointer;
        background: ${t.bgInput}; border: 1px solid ${t.border};
        color: ${t.text}; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; transition: all .3s; flex-shrink: 0;
      }
      .cel-btn-outline:hover { border-color: ${AURA.gold}; }
      .cel-btn-outline:disabled {
        opacity: .5; cursor: not-allowed;
      }

      .cel-search-wrap {
        position: relative; margin-bottom: 18px;
      }
      
      .cel-search-icon {
        position: absolute; left: 14px; top: 50%;
        transform: translateY(-50%); color: ${AURA.gold}; opacity: .5;
        pointer-events: none;
      }
      
      .cel-input {
        width: 100%; box-sizing: border-box;
        background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 13px 16px 13px 44px;
        border-radius: 13px; outline: none;
        font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
        transition: all .25s; -webkit-appearance: none; appearance: none;
      }
      .cel-input:focus {
        border-color: rgba(201,169,110,.5);
        background: rgba(201,169,110,.04);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .cel-input::placeholder { color: ${t.placeholder}; }

      .cel-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 16px; overflow: hidden; margin-bottom: 12px;
        backdrop-filter: blur(24px); position: relative; cursor: pointer;
        transition: all .35s cubic-bezier(.4,0,.2,1);
      }
      .cel-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }
      .cel-card:active {
        transform: scale(.98);
        border-color: ${t.cardHover};
      }

      .cel-card-inner {
        padding: 16px 18px;
      }

      .cel-card-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; margin-bottom: 12px;
      }

      .cel-card-title {
        font-size: 13px; font-weight: 600; color: ${t.text};
        margin: 0;
      }

      .cel-card-badge {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 10px; border-radius: 6px;
        font-size: 9px; font-weight: 600; letter-spacing: .1em;
        text-transform: uppercase;
        background: rgba(5,150,105,.12);
        color: ${AURA.green};
        border: 1px solid rgba(5,150,105,.3);
      }

      .cel-card-meta {
        display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        padding-top: 12px;
        border-top: 1px solid ${t.border};
      }

      .cel-meta-item {
        display: flex; align-items: center; gap: 6px;
        font-size: 12px; color: ${t.textMuted};
      }

      .cel-grid {
        display: flex; flex-direction: column; gap: 10px;
      }

      .cel-empty {
        text-align: center; padding: 48px 20px;
      }

      .cel-empty-icon {
        width: 64px; height: 64px; border-radius: 16px;
        background: rgba(201,169,110,.1);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 16px;
        color: ${AURA.gold};
      }

      .cel-empty-text {
        font-size: 13px; font-weight: 300; color: ${t.textMuted};
        margin: 0;
      }

      .cel-loading {
        min-height: 60vh; display: flex;
        align-items: center; justify-content: center;
      }

      .cel-modal-backdrop {
        position: fixed; inset: 0; z-index: 9999;
        display: flex; align-items: flex-end; justify-content: center;
      }
      @media(min-width: 520px) {
        .cel-modal-backdrop { align-items: center; padding: 16px; }
      }
      
      .cel-modal-overlay {
        position: fixed; inset: 0;
        background: rgba(10,10,15,.88); z-index: 0;
        backdrop-filter: blur(4px);
      }
      
      .cel-modal-box {
        position: relative; z-index: 10;
        width: 100%; max-height: 88vh;
        display: flex; flex-direction: column;
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 24px 24px 0 0; overflow: hidden;
      }
      @media(min-width: 520px) {
        .cel-modal-box {
          border-radius: 24px; max-width: 520px;
          max-height: calc(100vh - 32px);
        }
      }

      .cel-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 20px 22px; border-bottom: 1px solid ${t.border};
        flex-shrink: 0;
      }

      .cel-modal-title {
        font-family: 'Playfair Display', serif;
        font-size: 18px; font-weight: 500; color: ${t.text};
        margin: 0;
      }

      .cel-modal-body {
        flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        padding: 22px 20px;
        display: flex; flex-direction: column; gap: 16px;
      }

      .cel-form-section {
        padding: 16px; border-radius: 12px;
        background: ${isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)"};
        border: 1px solid ${t.border};
        display: flex; flex-direction: column; gap: 12px;
      }

      .cel-form-label {
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; color: ${t.textSec};
        display: block; margin-bottom: 6px;
      }

      .cel-form-field {
        width: 100%; box-sizing: border-box;
        background: ${t.bgInput};
        border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 11px 14px; border-radius: 10px;
        outline: none; font-family: 'Inter', sans-serif; font-size: 14px;
        transition: all .25s; -webkit-appearance: none; appearance: none;
      }
      .cel-form-field:focus {
        border-color: rgba(201,169,110,.5);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .cel-form-field::placeholder { color: ${t.placeholder}; }
      select.cel-form-field { color: ${t.text}; }
      select.cel-form-field option {
        background: ${isDark ? "#12121A" : "#F5F0E8"};
        color: ${t.text};
      }

      .cel-form-grid2 {
        display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      }
      @media(max-width: 480px) { .cel-form-grid2 { grid-template-columns: 1fr; } }

      .cel-form-actions {
        display: flex; gap: 10px; padding-top: 8px;
      }

      .cel-btn-save {
        flex: 1; padding: 13px; border-radius: 10px; border: none;
        background: linear-gradient(135deg, ${AURA.green}, ${AURA.greenDark});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; cursor: pointer; transition: all .3s;
        display: flex; align-items: center; justify-content: center; gap: 6px;
      }
      .cel-btn-save:hover { opacity: .9; transform: translateY(-1px); }

      .cel-btn-delete {
        flex: 1; padding: 13px; border-radius: 10px; border: none;
        background: rgba(200,16,46,.12);
        color: ${AURA.red}; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; cursor: pointer; transition: all .3s;
        display: flex; align-items: center; justify-content: center; gap: 6px;
      }
      .cel-btn-delete:hover { background: rgba(200,16,46,.2); }

      .cel-section-title {
        font-family: 'Playfair Display', serif;
        font-size: 13px; font-weight: 500; color: ${t.text};
        margin: 8px 0 0;
      }
    `}</style>
  );
}

/* ─── Modal ───────────────────────────────────────────────────────── */
function CelulaModalRefatorado({
                                 isDark, editandoId, form, setForm,
                                 lideresDisponiveis, onSalvar, onExcluir, onFechar,
                                 loading
                               }) {
  const t = themeCelulas(isDark);

  const f = v => setForm(p => ({ ...p, ...v }));

  const content = (
      <motion.div
          className="cel-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onFechar}
      >
        <motion.div
            className="cel-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onFechar}
        />
        <motion.div
            className="cel-modal-box"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "tween", duration: 0.28 }}
            onClick={e => e.stopPropagation()}
        >
          <div className="cel-modal-header">
            <h2 className="cel-modal-title">
              {editandoId ? "Editar Célula" : "Nova Célula"}
            </h2>
            <button
                onClick={onFechar}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: t.textMuted, display: "flex", padding: 0,
                  transition: "color .2s"
                }}
            >
              <X size={20} />
            </button>
          </div>

          <form className="cel-modal-body" onSubmit={onSalvar}>

            {/* Identificação */}
            <div>
              <p className="cel-section-title">Identificação</p>
              <div className="cel-form-section">
                <div>
                  <label className="cel-form-label">NOME DA CÉLULA *</label>
                  <input required className="cel-form-field"
                         value={form.nome} onChange={e => f({ nome: e.target.value })} />
                </div>
                <div>
                  <label className="cel-form-label">LIDERANÇA *</label>
                  <select required className="cel-form-field"
                          value={form.liderId} onChange={e => f({ liderId: e.target.value })}>
                    <option value="">Selecionar líder</option>
                    {lideresDisponiveis.map(u =>
                        <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Localização */}
            <div>
              <p className="cel-section-title">Localização</p>
              <div className="cel-form-section">
                <div>
                  <label className="cel-form-label">BAIRRO *</label>
                  <input required className="cel-form-field"
                         value={form.bairro} onChange={e => f({ bairro: e.target.value })} />
                </div>
                <div>
                  <label className="cel-form-label">ENDEREÇO COMPLETO</label>
                  <input className="cel-form-field" placeholder="Rua, número, etc..."
                         value={form.endereco} onChange={e => f({ endereco: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Reunião */}
            <div>
              <p className="cel-section-title">Reunião</p>
              <div className="cel-form-section">
                <div className="cel-form-grid2">
                  <div>
                    <label className="cel-form-label">DIA DA SEMANA *</label>
                    <select required className="cel-form-field"
                            value={form.diaSemana} onChange={e => f({ diaSemana: e.target.value })}>
                      {Object.entries(DIAS).map(([v, l]) =>
                          <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="cel-form-label">HORÁRIO *</label>
                    <input type="time" required className="cel-form-field"
                           value={form.horario} onChange={e => f({ horario: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            {/* Anfitrião */}
            <div>
              <p className="cel-section-title">Hospedagem</p>
              <div className="cel-form-section">
                <div>
                  <label className="cel-form-label">ANFITRIÃO</label>
                  <input className="cel-form-field" placeholder="Nome de quem abre a casa"
                         value={form.anfitriao} onChange={e => f({ anfitriao: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="cel-form-actions" style={{ paddingTop: 8 }}>
              <button type="submit" className="cel-btn-save" disabled={loading}>
                {loading ? (
                    <><Loader2 size={14} className="dl-spin" /> Salvando...</>
                ) : (
                    <>{editandoId ? "Salvar" : "Criar"}</>
                )}
              </button>
              {editandoId && (
                  <button type="button" className="cel-btn-delete" onClick={onExcluir} disabled={loading}>
                    <Trash2 size={14} /> Excluir
                  </button>
              )}
            </div>

          </form>
        </motion.div>
      </motion.div>
  );

  return createPortal(content, document.body);
}

/* ─── Componente Principal ──────────────────────────────────────── */
export default function CelulasRefatorado({ isDark = false }) {
  const [celulas,            setCelulas]            = useState([]);
  const [lideresDisponiveis, setLideresDisponiveis] = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [isModalOpen,        setIsModalOpen]        = useState(false);
  const [editandoId,         setEditandoId]         = useState(null);
  const [filtro,             setFiltro]             = useState("");
  const [form,               setForm]               = useState(formInicial);
  const [salvando,           setSalvando]           = useState(false);
  const [exportandoPdf,      setExportandoPdf]      = useState(false);

  const t = themeCelulas(isDark);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const [resCelulas, resUsuarios] = await Promise.all([
        api.get("/celulas"),
        api.get("/usuarios"),
      ]);
      setCelulas(Array.isArray(resCelulas.data) ? resCelulas.data : []);
      setLideresDisponiveis(Array.isArray(resUsuarios.data) ? resUsuarios.data : []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const abrirNovo = () => {
    setEditandoId(null);
    setForm(formInicial);
    setIsModalOpen(true);
  };

  const abrirEdicao = (c) => {
    setEditandoId(c.id);
    setForm({
      nome:      c.nome      ?? "",
      liderId:   c.liderId   ?? "",
      anfitriao: c.anfitriao ?? "",
      endereco:  c.endereco  ?? "",
      bairro:    c.bairro    ?? "",
      diaSemana: c.diaSemana ?? "MONDAY",
      horario:   c.horario   ?? "19:30",
    });
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setForm(formInicial);
    setEditandoId(null);
  };

  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    const payload = {
      ...form,
      liderId: Number(form.liderId),
      bairro:  form.bairro.trim(),
      nome:    form.nome.trim(),
    };
    try {
      if (editandoId) await api.put(`/celulas/${editandoId}`, payload);
      else            await api.post("/celulas", payload);
      fecharModal();
      carregarDados();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async () => {
    if (!window.confirm("Excluir célula permanentemente?")) return;
    setSalvando(true);
    try {
      await api.delete(`/celulas/${editandoId}`);
      fecharModal();
      carregarDados();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao excluir.");
    } finally {
      setSalvando(false);
    }
  };

  const celulasFiltradas = celulas.filter(c =>
      c.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.nomeLider?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.bairro?.toLowerCase().includes(filtro.toLowerCase())
  );

  // ✅ Exportar PDF com a lista de células (respeita o filtro atual)
  const handleExportarPDF = useCallback(() => {
    if (celulasFiltradas.length === 0) return;
    setExportandoPdf(true);
    try {
      const doc = new jsPDF();
      const corVerde = [5, 150, 105]; // AURA.green em RGB

      // Cabeçalho
      doc.setFillColor(...corVerde);
      doc.rect(0, 0, 210, 30, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text("Relatório de Células", 14, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const dataGeracao = new Date().toLocaleString("pt-BR");
      const subtitulo = filtro
          ? `Filtro: "${filtro}"   •   Gerado em ${dataGeracao}`
          : `Gerado em ${dataGeracao}`;
      doc.text(subtitulo, 14, 22);

      // Total
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Total de células: ${celulasFiltradas.length}`, 14, 40);

      // Tabela
      autoTable(doc, {
        startY: 46,
        head: [["#", "Nome", "Líder", "Bairro", "Dia", "Horário"]],
        body: celulasFiltradas.map((c, i) => [
          String(i + 1),
          c.nome || "-",
          c.nomeLider || "-",
          c.bairro || "-",
          DIAS[c.diaSemana] || c.diaSemana || "-",
          c.horario ? `${c.horario}h` : "-",
        ]),
        headStyles: { fillColor: corVerde, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 248] },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
        },
      });

      const nomeArquivo = `celulas-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(nomeArquivo);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar o PDF.");
    } finally {
      setExportandoPdf(false);
    }
  }, [celulasFiltradas, filtro]);

  return (
      <div className="cel-root">
        <GlobalStylesCelulas t={t} isDark={isDark} />
        <div className="cel-glow" />

        <div className="cel-content">

          {/* ── Header ── */}
          <motion.header
              className="cel-header"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4 }}
          >
            <div className="cel-header-left">
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `linear-gradient(135deg, ${AURA.green}, ${AURA.greenDark})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 16,
              }}>
                <Building2 size={20} />
              </div>
              <div className="cel-title-block">
                <p className="cel-eyebrow">Gerenciamento</p>
                <h1 className="cel-title">Células</h1>
              </div>
            </div>

            <div className="cel-header-actions">
              <button
                  className="cel-btn-outline"
                  onClick={handleExportarPDF}
                  disabled={exportandoPdf || loading || celulasFiltradas.length === 0}
              >
                {exportandoPdf
                    ? <><Loader2 size={13} className="dl-spin" /> Gerando…</>
                    : <><FileDown size={13} /> PDF</>
                }
              </button>
              <button className="cel-btn-gold" onClick={abrirNovo}>
                <Plus size={13} /> Novo
              </button>
            </div>
          </motion.header>

          {/* ── Busca ── */}
          <motion.div
              className="cel-search-wrap"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4, delay: .08 }}
          >
            <Search className="cel-search-icon" size={16} />
            <input
                className="cel-input"
                placeholder="Buscar célula, líder ou bairro…"
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
            />
          </motion.div>

          {/* ── Cards/Loading ── */}
          {loading ? (
              <div className="cel-loading">
                <Loader2 size={28} className="dl-spin" style={{ color: AURA.gold }} />
              </div>
          ) : celulasFiltradas.length > 0 ? (
              <motion.div
                  className="cel-grid"
                  initial="hidden" animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: .04 } } }}
              >
                {celulasFiltradas.map((c, idx) => (
                    <motion.div
                        key={c.id}
                        className="cel-card"
                        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                        onClick={() => abrirEdicao(c)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: .98 }}
                    >
                      <div className="cel-card-inner">
                        <div className="cel-card-header">
                          <h3 className="cel-card-title">{c.nome?.toUpperCase()}</h3>
                          <span className="cel-card-badge">{DIAS[c.diaSemana]}</span>
                        </div>

                        <div className="cel-card-meta">
                          {c.nomeLider && (
                              <div className="cel-meta-item">
                                <Users size={14} style={{ color: AURA.green }} />
                                {c.nomeLider}
                              </div>
                          )}
                          {c.bairro && (
                              <div className="cel-meta-item">
                                <MapPin size={14} style={{ color: AURA.gold }} />
                                {c.bairro}
                              </div>
                          )}
                          {c.horario && (
                              <div className="cel-meta-item">
                                <Clock size={14} style={{ color: AURA.red }} />
                                {c.horario}h
                              </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                ))}
              </motion.div>
          ) : (
              <motion.div
                  className="cel-empty"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
              >
                <div className="cel-empty-icon">
                  <Building2 size={32} />
                </div>
                <p className="cel-empty-text">
                  {filtro ? "Nenhuma célula encontrada." : "Nenhuma célula cadastrada."}
                </p>
                <button className="cel-btn-gold" style={{ marginTop: 16 }} onClick={abrirNovo}>
                  <Plus size={13} /> Adicionar Célula
                </button>
              </motion.div>
          )}

        </div>

        {/* ── Modal ── */}
        <AnimatePresence>
          {isModalOpen && (
              <CelulaModalRefatorado
                  isDark={isDark}
                  editandoId={editandoId}
                  form={form}
                  setForm={setForm}
                  lideresDisponiveis={lideresDisponiveis}
                  onSalvar={salvar}
                  onExcluir={excluir}
                  onFechar={fecharModal}
                  loading={salvando}
              />
          )}
        </AnimatePresence>

      </div>
  );
}
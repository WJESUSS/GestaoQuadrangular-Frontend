import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Plus, X, Building2, Clock, Search, ChevronRight, Loader2,
  Calendar, MapPin, Users, ArrowLeft, Trash2, Edit2, FileDown,
  Check, Square, CheckSquare, ListFilter,
} from "lucide-react";
import TelaCarregando from "../../components/TelaCarregando.jsx";

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

/* ─── Opções de colunas exportáveis no PDF (Nome é sempre fixo) ──── */
const COLUNAS_PDF_OPCOES = [
  { key: "lider",   label: "Líder"   },
  { key: "bairro",  label: "Bairro"  },
  { key: "dia",     label: "Dia"     },
  { key: "horario", label: "Horário" },
];

const colunasPdfInicial = { lider: true, bairro: true, dia: true, horario: true };

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

      /* ── Export Modal ── */
      .exp-filters {
        display: flex; gap: 8px; padding: 14px 20px 10px; flex-shrink: 0;
        border-bottom: 1px solid ${t.border};
      }

      .exp-select-wrap {
        position: relative; flex-shrink: 0; width: 42%;
      }

      .exp-select {
        width: 100%; box-sizing: border-box;
        background: ${t.bgEl}; border: 1px solid ${t.border};
        color: ${t.text}; padding: 11px 30px 11px 12px;
        border-radius: 10px; outline: none;
        font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500;
        appearance: none; cursor: pointer;
      }
      select.exp-select option {
        background: ${isDark ? "#12121A" : "#F5F0E8"};
        color: ${t.text};
      }

      /* ── Colunas do PDF (toggle pills) ── */
      .exp-col-toggles {
        display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
        padding: 10px 20px; border-bottom: 1px solid ${t.border};
      }

      .exp-col-toggles-label {
        font-size: 9.5px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; color: ${t.textSec}; margin-right: 1px;
      }

      .exp-col-pill {
        display: flex; align-items: center; gap: 4px;
        padding: 5px 9px; border-radius: 100px; cursor: pointer;
        border: 1px solid ${t.border}; background: ${t.bgInput};
        color: ${t.textSec}; font-family: 'Inter', sans-serif;
        font-size: 10.5px; font-weight: 600; transition: all .2s;
      }
      .exp-col-pill:hover { border-color: rgba(201,169,110,.4); }
      .exp-col-pill.active {
        border-color: ${AURA.gold}; color: ${AURA.gold};
        background: rgba(201,169,110,.1);
      }

      .exp-toolbar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 20px; flex-shrink: 0;
      }

      .exp-toolbar-count {
        font-size: 11px; font-weight: 600; color: ${t.textSec};
        letter-spacing: .04em;
      }

      .exp-toolbar-count strong { color: ${AURA.gold}; }

      .exp-toolbar-btn {
        background: none; border: none; cursor: pointer;
        font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 600;
        letter-spacing: .06em; color: ${AURA.gold}; padding: 4px 0;
      }
      .exp-toolbar-btn:hover { text-decoration: underline; }

      .exp-list {
        flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
        padding: 0 14px 14px;
        display: flex; flex-direction: column; gap: 6px;
      }

      .exp-item {
        display: flex; align-items: center; gap: 11px;
        padding: 11px 12px; border-radius: 12px; cursor: pointer;
        border: 1px solid transparent; transition: all .18s;
      }
      .exp-item:hover { background: ${isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)"}; }
      .exp-item.checked {
        background: ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.07)"};
        border-color: rgba(201,169,110,.3);
      }

      .exp-checkbox {
        width: 19px; height: 19px; border-radius: 6px; flex-shrink: 0;
        border: 1.6px solid ${t.borderInput};
        display: flex; align-items: center; justify-content: center;
        transition: all .18s;
      }
      .exp-item.checked .exp-checkbox {
        background: ${AURA.gold}; border-color: ${AURA.gold};
      }

      .exp-item-info { flex: 1; min-width: 0; }

      .exp-item-name {
        font-size: 13px; font-weight: 600; color: ${t.text};
        margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      .exp-item-meta {
        font-size: 11px; color: ${t.textMuted}; margin: 2px 0 0;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      .exp-footer {
        padding: 14px 20px; border-top: 1px solid ${t.border}; flex-shrink: 0;
      }

      .exp-btn-generate {
        width: 100%; padding: 14px; border-radius: 12px; border: none;
        background: linear-gradient(135deg, ${AURA.gold}, #B8935A);
        color: #1A0A0D; font-family: 'Inter', sans-serif;
        font-size: 11px; font-weight: 700; letter-spacing: .12em;
        text-transform: uppercase; cursor: pointer; transition: all .3s;
        display: flex; align-items: center; justify-content: center; gap: 8px;
      }
      .exp-btn-generate:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(201,169,110,.3); }
      .exp-btn-generate:disabled { opacity: .45; cursor: not-allowed; transform: none; }

      .exp-empty {
        text-align: center; padding: 40px 20px;
        font-size: 12.5px; color: ${t.textMuted}; font-style: italic;
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

/* ─── Modal de Exportação (seleção de líder / células / colunas) ──── */
function ExportPdfModal({
                          isDark, celulas, selecionadas, setSelecionadas,
                          colunasPdf, setColunasPdf,
                          onFechar, onGerar, gerando,
                        }) {
  const t = themeCelulas(isDark);
  const [filtroLider, setFiltroLider] = useState("");
  const [busca, setBusca] = useState("");

  const lideresUnicos = [...new Set(celulas.map(c => c.nomeLider).filter(Boolean))].sort();

  const visiveis = celulas.filter(c => {
    const okLider = !filtroLider || c.nomeLider === filtroLider;
    const q = busca.toLowerCase();
    const okBusca = !q || c.nome?.toLowerCase().includes(q) || c.bairro?.toLowerCase().includes(q);
    return okLider && okBusca;
  });

  const toggle = (id) => {
    setSelecionadas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selecionarTodosVisiveis = () => {
    setSelecionadas(prev => {
      const next = new Set(prev);
      visiveis.forEach(c => next.add(c.id));
      return next;
    });
  };

  const limparVisiveis = () => {
    setSelecionadas(prev => {
      const next = new Set(prev);
      visiveis.forEach(c => next.delete(c.id));
      return next;
    });
  };

  const toggleColuna = (key) => {
    setColunasPdf(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
            <div>
              <p className="cel-eyebrow" style={{ marginBottom: 2 }}>Exportar</p>
              <h2 className="cel-modal-title">Selecionar Células</h2>
            </div>
            <button
                onClick={onFechar}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: t.textMuted, display: "flex", padding: 0,
                }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Filtros */}
          <div className="exp-filters">
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={14} style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)", color: AURA.gold, opacity: .5,
              }} />
              <input
                  className="cel-input"
                  style={{ padding: "11px 12px 11px 34px", fontSize: 12.5, marginBottom: 0 }}
                  placeholder="Buscar por nome ou bairro…"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
              />
            </div>
            <div className="exp-select-wrap">
              <select
                  className="exp-select"
                  value={filtroLider}
                  onChange={e => setFiltroLider(e.target.value)}
              >
                <option value="">Todos os líderes</option>
                {lideresUnicos.map(nome => (
                    <option key={nome} value={nome}>{nome}</option>
                ))}
              </select>
              <ChevronRight size={13} style={{
                position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%) rotate(90deg)", color: t.textMuted, pointerEvents: "none",
              }} />
            </div>
          </div>

          {/* Colunas do PDF */}
          <div className="exp-col-toggles">
            <span className="exp-col-toggles-label">Incluir no PDF:</span>
            {COLUNAS_PDF_OPCOES.map(col => {
              const ativo = colunasPdf[col.key];
              return (
                  <button
                      key={col.key}
                      type="button"
                      className={`exp-col-pill${ativo ? " active" : ""}`}
                      onClick={() => toggleColuna(col.key)}
                  >
                    {ativo ? <CheckSquare size={12} /> : <Square size={12} />}
                    {col.label}
                  </button>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="exp-toolbar">
            <span className="exp-toolbar-count">
              <strong>{selecionadas.size}</strong> de {celulas.length} selecionadas
            </span>
            <div style={{ display: "flex", gap: 14 }}>
              <button className="exp-toolbar-btn" onClick={selecionarTodosVisiveis}>Marcar tudo</button>
              <button className="exp-toolbar-btn" onClick={limparVisiveis}>Limpar</button>
            </div>
          </div>

          {/* Lista */}
          <div className="exp-list">
            {visiveis.length === 0 ? (
                <div className="exp-empty">Nenhuma célula encontrada.</div>
            ) : visiveis.map(c => {
              const checked = selecionadas.has(c.id);
              return (
                  <div
                      key={c.id}
                      className={`exp-item${checked ? " checked" : ""}`}
                      onClick={() => toggle(c.id)}
                  >
                    <div className="exp-checkbox">
                      {checked && <Check size={13} color="#1A0A0D" strokeWidth={3} />}
                    </div>
                    <div className="exp-item-info">
                      <p className="exp-item-name">{c.nome}</p>
                      <p className="exp-item-meta">
                        {c.nomeLider || "Sem líder"}
                        {c.bairro ? ` • ${c.bairro}` : ""}
                        {DIAS[c.diaSemana] ? ` • ${DIAS[c.diaSemana]}` : ""}
                      </p>
                    </div>
                  </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="exp-footer">
            <button
                className="exp-btn-generate"
                onClick={onGerar}
                disabled={selecionadas.size === 0 || gerando}
            >
              {gerando ? (
                  <><Loader2 size={15} className="dl-spin" /> Gerando PDF…</>
              ) : (
                  <><FileDown size={15} /> Gerar PDF ({selecionadas.size})</>
              )}
            </button>
          </div>
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
  const [exportModalOpen,    setExportModalOpen]    = useState(false);
  const [selecionadasPdf,    setSelecionadasPdf]    = useState(new Set());
  const [colunasPdf,         setColunasPdf]         = useState(colunasPdfInicial);

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

  // ✅ Abre o modal de exportação, pré-selecionando o que está visível na busca atual
  const abrirExportacao = () => {
    setSelecionadasPdf(new Set(celulasFiltradas.map(c => c.id)));
    setExportModalOpen(true);
  };

  // ✅ Exportar PDF elegante apenas com as células e colunas selecionadas no modal
  const handleExportarPDF = useCallback(() => {
    const celulasParaExportar = celulas.filter(c => selecionadasPdf.has(c.id));
    if (celulasParaExportar.length === 0) return;
    setExportandoPdf(true);
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const marginX = 12;

      // Paleta (AURA)
      const dark      = [10, 10, 15];
      const gold      = [201, 169, 110];
      const goldLight = [232, 213, 163];
      const green     = [5, 150, 105];
      const greenDark = [4, 120, 87];
      const textMain  = [26, 16, 8];
      const textSoft  = [110, 100, 84];
      const rowAlt    = [250, 248, 244];
      const rowLine   = [228, 220, 204];

      /* ── Cabeçalho compacto (faixa fina, sem selo) ── */
      const headerH = 20;
      doc.setFillColor(...dark);
      doc.rect(0, 0, pageW, headerH, "F");
      doc.setFillColor(...gold);
      doc.rect(0, headerH, pageW, 0.6, "F");

      // Título
      doc.setTextColor(245, 240, 232);
      doc.setFont("times", "bold");
      doc.setFontSize(13.5);
      doc.text("Relatório de Células", marginX, 9);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...goldLight);
      const dataGeracao = new Date().toLocaleString("pt-BR", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
      const subtitulo = celulasParaExportar.length === celulas.length
          ? `Todas as células  •  Gerado em ${dataGeracao}`
          : `${celulasParaExportar.length} de ${celulas.length} células  •  Gerado em ${dataGeracao}`;
      doc.text(subtitulo, marginX, 15);

      // Contagem no canto direito
      doc.setFont("times", "bold");
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text(String(celulasParaExportar.length), pageW - marginX, 10.5, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(...goldLight);
      doc.text("CÉLULAS", pageW - marginX, 14.5, { align: "right" });

      /* ── Faixa de resumo (uma linha só, sem cards grandes) ── */
      const diasCount = celulasParaExportar.reduce((acc, c) => {
        const d = DIAS[c.diaSemana] || c.diaSemana || "—";
        acc[d] = (acc[d] || 0) + 1;
        return acc;
      }, {});
      const diaMaisComum = Object.entries(diasCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
      const bairrosUnicos = new Set(celulasParaExportar.map(c => c.bairro).filter(Boolean)).size;
      const comLider = celulasParaExportar.filter(c => c.nomeLider).length;

      const resumoY = headerH + 8;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      const resumoItens = [
        `BAIRROS: ${bairrosUnicos}`,
        `COM LÍDER: ${comLider}/${celulasParaExportar.length}`,
        `DIA MAIS COMUM: ${diaMaisComum}`,
      ];
      let rx = marginX;
      resumoItens.forEach((item, i) => {
        doc.setTextColor(...textSoft);
        doc.text(item, rx, resumoY);
        rx += doc.getTextWidth(item) + 6;
        if (i < resumoItens.length - 1) {
          doc.setDrawColor(...rowLine);
          doc.setLineWidth(0.2);
          doc.line(rx - 3, resumoY - 2.6, rx - 3, resumoY + 0.6);
        }
      });
      doc.setDrawColor(...rowLine);
      doc.setLineWidth(0.2);
      doc.line(marginX, resumoY + 3, pageW - marginX, resumoY + 3);

      /* ── Colunas dinâmicas (Nome é sempre fixo; o resto depende da seleção) ── */
      const colunasAtivas = [
        { key: "nome", label: "Nome da Célula" },
        ...COLUNAS_PDF_OPCOES.filter(c => colunasPdf[c.key]),
      ];

      const getValorColuna = (c, key) => {
        switch (key) {
          case "nome":    return c.nome || "—";
          case "lider":   return c.nomeLider || "—";
          case "bairro":  return c.bairro || "—";
          case "dia":     return DIAS[c.diaSemana] || c.diaSemana || "—";
          case "horario": return c.horario ? `${c.horario}` : "—";
          default:        return "—";
        }
      };

      const liderColIndex = colunasAtivas.findIndex(c => c.key === "lider");
      const diaColIndex     = colunasAtivas.findIndex(c => c.key === "dia");
      const horarioColIndex = colunasAtivas.findIndex(c => c.key === "horario");

      // +1 em todos os índices de coluna porque a coluna 0 é sempre "#"
      const columnStyles = {
        0: { cellWidth: 10, halign: "center", textColor: gold, fontStyle: "bold" },
        1: { fontStyle: "bold" }, // Nome
      };
      if (diaColIndex     !== -1) columnStyles[diaColIndex + 1]     = { cellWidth: 24 };
      if (horarioColIndex !== -1) columnStyles[horarioColIndex + 1] = { cellWidth: 20, halign: "center" };

      /* ── Tabela (compacta, para economizar papel) ── */
      autoTable(doc, {
        startY: resumoY + 7,
        margin: { left: marginX, right: marginX, bottom: 12 },
        head: [["#", ...colunasAtivas.map(c => c.label)]],
        body: celulasParaExportar.map((c, i) => [
          String(i + 1).padStart(2, "0"),
          ...colunasAtivas.map(col => getValorColuna(c, col.key)),
        ]),
        theme: "plain",
        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: { top: 2, bottom: 2, left: 4, right: 4 },
          textColor: textMain,
          lineColor: rowLine,
          lineWidth: { bottom: 0.1 },
        },
        headStyles: {
          fillColor: dark,
          textColor: [245, 240, 232],
          fontStyle: "bold",
          fontSize: 7.3,
          halign: "left",
          cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        },
        alternateRowStyles: { fillColor: rowAlt },
        columnStyles,
        didParseCell: (data) => {
          // Realça o nome do líder ausente (se a coluna estiver ativa)
          if (
              liderColIndex !== -1 &&
              data.section === "body" &&
              data.column.index === liderColIndex + 1 &&
              data.cell.raw === "—"
          ) {
            data.cell.styles.textColor = [190, 160, 130];
            data.cell.styles.fontStyle = "italic";
          }
        },
        didDrawPage: () => {
          /* ── Rodapé fino em cada página ── */
          const pageCount = doc.internal.getNumberOfPages();
          const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;

          doc.setDrawColor(...rowLine);
          doc.setLineWidth(0.15);
          doc.line(marginX, pageH - 8, pageW - marginX, pageH - 8);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.3);
          doc.setTextColor(...textSoft);
          doc.text("Relatório de Células", marginX, pageH - 4.5);
          doc.text(`Página ${pageCurrent} de ${pageCount}`, pageW - marginX, pageH - 4.5, { align: "right" });
        },
      });

      const nomeArquivo = `celulas-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(nomeArquivo);
      setExportModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar o PDF.");
    } finally {
      setExportandoPdf(false);
    }
  }, [celulas, selecionadasPdf, colunasPdf]);

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
                  onClick={abrirExportacao}
                  disabled={loading || celulas.length === 0}
              >
                <FileDown size={13} /> PDF
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
              <TelaCarregando isDark={isDark} minHeight="40vh" background="transparent" />
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

        {/* ── Modal Célula ── */}
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

        {/* ── Modal Exportação PDF ── */}
        <AnimatePresence>
          {exportModalOpen && (
              <ExportPdfModal
                  isDark={isDark}
                  celulas={celulas}
                  selecionadas={selecionadasPdf}
                  setSelecionadas={setSelecionadasPdf}
                  colunasPdf={colunasPdf}
                  setColunasPdf={setColunasPdf}
                  onFechar={() => setExportModalOpen(false)}
                  onGerar={handleExportarPDF}
                  gerando={exportandoPdf}
              />
          )}
        </AnimatePresence>

      </div>
  );
}
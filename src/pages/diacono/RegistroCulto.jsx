import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import api from "../../services/api.js";
import {
  Church, Calendar, Clock, Mic2, Users, Baby, UserCheck,
  Save, Loader2, X, AlertCircle, CheckCircle2, Edit3,
  Megaphone, FileText, RefreshCw, ChevronRight, AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TelaCarregando from "../../components/TelaCarregando.jsx";

/* ─── Paleta ───────────────────────────────────────────────────────────── */
const AURA = {
  gold:       "#C9A96E",
  goldLight:  "#E8D5A3",
  red:        "#C8102E",
  redDark:    "#9B0B1E",
  blue:       "#003DA5",
  blueDark:   "#002470",
  yellow:     "#FDB813",
  yellowDark: "#C48C00",
  green:      "#16a34a",
};

function theme(isDark) {
  return {
    bg:          isDark ? "#0A0A0F"               : "#F5F0E8",
    bgEl:        isDark ? "rgba(18,18,26,.97)"    : "#D8D4CC",
    bgInput:     isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.1)"  : "rgba(201,169,110,.2)",
    borderInput: isDark ? "rgba(201,169,110,.18)" : "rgba(201,169,110,.3)",
    text:        isDark ? "#F5F0E8"               : "#1A1008",
    textSec:     isDark ? "#9A9588"               : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"               : "#9A9080",
    glow1:       isDark ? "rgba(201,169,110,.05)" : "rgba(201,169,110,.08)",
    glow2:       isDark ? "rgba(201,169,110,.04)" : "rgba(201,169,110,.06)",
    placeholder: isDark ? "rgba(154,149,136,.35)" : "rgba(107,94,74,.35)",
    rowHov:      isDark ? "rgba(201,169,110,.04)" : "rgba(201,169,110,.05)",
    warnBg:      isDark ? "rgba(253,184,19,.07)"  : "rgba(253,184,19,.06)",
    gold:        isDark ? "#C9A96E" : "#3D3218",
    goldSoft:    isDark ? "rgba(201,169,110,.06)" : "rgba(61,50,24,.08)",
    goldHover:   isDark ? "rgba(201,169,110,.12)" : "rgba(61,50,24,.14)",
  };
}

/* ─── Config ───────────────────────────────────────────────────────────── */
const TIPOS_CULTO = ["Vitória", "Santa Ceia", "Celebração", "Missões", "Outro"];

const TIPO_CORES = {
  "Vitória":    { color: "#16a34a", bg: "rgba(22,163,74,.12)",  border: "rgba(22,163,74,.30)" },
  "Santa Ceia": { color: AURA.gold, bg: "rgba(201,169,110,.12)", border: "rgba(201,169,110,.30)" },
  "Celebração": { color: AURA.blue, bg: "rgba(0,61,165,.12)",   border: "rgba(0,61,165,.30)"   },
  "Missões":    { color: AURA.red,  bg: "rgba(200,16,46,.12)",  border: "rgba(200,16,46,.30)"  },
  "Outro":      { color: AURA.yellow, bg: "rgba(253,184,19,.12)", border: "rgba(253,184,19,.30)" },
};

const HORARIOS_POR_TIPO = {
  "Vitória":    ["19:30"],
  "Santa Ceia": ["08:30", "18:30"],
  "Celebração": ["08:30", "18:30"],
  "Missões":    ["08:30", "18:30"],
  "Outro":      [],
};

const today = new Date().toISOString().slice(0, 10);

const FORM_EMPTY = {
  data: today,
  horario: "",
  tipoCulto: "Vitória",
  textoPregado: "",
  pregador: "",
  quantidadeMembros: "",
  visitantesSimpatizantes: "",
  totalCriancas: "",
  quantidadeDiaconos: "",
  campanha: false,
  nomeCampanha: "",
  observacoes: "",
};

/* ─── CSS ──────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
  @keyframes cult-spin  { to { transform: rotate(360deg); } }
  @keyframes cult-pulse { 0%,100%{opacity:.2} 50%{opacity:.05} }
  *, *::before, *::after { box-sizing: border-box; }

  .cult-root {
    color: var(--cult-text);
    font-family: 'Inter', sans-serif;
    padding-bottom: max(48px, env(safe-area-inset-bottom, 48px));
    -webkit-overflow-scrolling: touch;
  }
  .cult-wrap {
    position: relative; z-index: 1;
    max-width: 1100px; margin: 0 auto;
    padding: 20px 16px 0;
  }
  @media (min-width: 640px) { .cult-wrap { padding: 28px 24px 0; } }

  .cult-input {
    width: 100%;
    background: var(--cult-bgInput); border: 1px solid var(--cult-borderInput);
    color: var(--cult-text); padding: 11px 14px 11px 40px;
    border-radius: 11px; outline: none;
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
    transition: border-color .25s;
    -webkit-appearance: none;
  }
  .cult-input:focus { border-color: var(--cult-gold)80; }
  .cult-input::placeholder { color: var(--cult-placeholder); }

  .cult-input-num {
    width: 100%;
    background: var(--cult-bgInput); border: 1px solid var(--cult-borderInput);
    color: var(--cult-text); padding: 11px 14px 11px 40px;
    border-radius: 11px; outline: none;
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
    transition: border-color .25s;
    -webkit-appearance: none;
    -moz-appearance: textfield;
  }
  .cult-input-num::-webkit-inner-spin-button,
  .cult-input-num::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  .cult-input-num:focus { border-color: var(--cult-gold)80; }
  .cult-input-num::placeholder { color: var(--cult-placeholder); }

  .cult-date {
    width: 100%;
    background: var(--cult-bgInput); border: 1px solid var(--cult-borderInput);
    color: var(--cult-text); padding: 11px 14px 11px 40px;
    border-radius: 11px; outline: none;
    font-family: 'Inter', sans-serif; font-size: 14px;
    transition: border-color .25s; -webkit-appearance: none;
  }
  .cult-date:focus { border-color: var(--cult-gold)80; }

  .cult-select {
    width: 100%;
    background: var(--cult-bgInput); border: 1px solid var(--cult-borderInput);
    color: var(--cult-text); padding: 11px 14px 11px 40px;
    border-radius: 11px; outline: none;
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 400;
    transition: border-color .25s;
    -webkit-appearance: none; appearance: none;
  }
  .cult-select option {
    background: var(--cult-bgEl); color: var(--cult-text);
  }
  .cult-select:focus { border-color: var(--cult-gold)80; }

  .cult-textarea {
    width: 100%;
    background: var(--cult-bgInput); border: 1px solid var(--cult-borderInput);
    color: var(--cult-text); padding: 11px 14px;
    border-radius: 11px; outline: none;
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
    transition: border-color .25s; resize: vertical; min-height: 70px;
  }
  .cult-textarea:focus { border-color: var(--cult-gold)80; }
  .cult-textarea::placeholder { color: var(--cult-placeholder); }

  .cult-label {
    display: block; font-size: 9px; font-weight: 700; letter-spacing: .14em;
    text-transform: uppercase; color: var(--cult-textMuted); margin: 0 0 6px;
  }

  .cult-btn-save {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 0 20px; height: 40px; border-radius: 100px; border: none;
    cursor: pointer;
    background: linear-gradient(135deg, var(--cult-blueDark), var(--cult-blue));
    color: #fff; font-family: 'Inter', sans-serif;
    font-size: 10px; font-weight: 600; letter-spacing: .12em;
    text-transform: uppercase; transition: opacity .2s, transform .2s;
    box-shadow: 0 5px 18px var(--cult-blue)40; white-space: nowrap;
  }
  .cult-btn-save:hover { opacity: .9; transform: translateY(-1px); }
  .cult-btn-save:disabled { opacity: .4; cursor: not-allowed; }

  .cult-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 0 14px; height: 36px; border-radius: 100px;
    border: 1px solid var(--cult-border); cursor: pointer;
    background: transparent; color: var(--cult-textSec);
    font-family: 'Inter', sans-serif; font-size: 10px;
    font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
    transition: border-color .2s, color .2s; white-space: nowrap;
  }
  .cult-btn-ghost:hover { border-color: var(--cult-gold); color: var(--cult-gold); }

  .cult-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
  }
  @media (max-width: 480px) { .cult-grid { grid-template-columns: 1fr; } }

  .cult-card {
    background: var(--cult-bgEl); border: 1px solid var(--cult-border);
    border-radius: 18px; overflow: hidden;
    transition: transform .25s, border-color .25s, box-shadow .25s;
    position: relative;
  }
  .cult-card:hover {
    transform: translateY(-3px);
    border-color: var(--cult-gold)55;
    box-shadow: 0 12px 32px rgba(0,0,0,var(--cult-isDark, .35));
  }

  .cult-total-box {
    padding: 16px 18px; border-radius: 14px;
    background: linear-gradient(135deg, rgba(0,61,165,.08), rgba(0,61,165,.03));
    border: 1px solid rgba(0,61,165,.18);
    text-align: center;
  }
  .cult-total-label {
    font-size: 9px; font-weight: 700; letter-spacing: .14em;
    text-transform: uppercase; color: var(--cult-blue, #003DA5); margin: 0 0 4px;
  }
  .cult-total-value {
    font-family: 'Playfair Display', serif;
    font-size: 32px; font-weight: 700; color: var(--cult-blue, #003DA5);
    margin: 0; line-height: 1;
  }

  .cult-alert {
    padding: 14px 16px; border-radius: 13;
    display: flex; align-items: center; gap: 10;
  }

  .cult-div {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--cult-gold)50, transparent);
    margin: 18px 0;
  }

  .cult-icon-field {
    position: relative;
  }
  .cult-icon-field > svg, .cult-icon-field > .cult-field-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: var(--cult-gold); opacity: .5; pointer-events: none; z-index: 1;
  }

  .cult-toggle {
    display: flex; align-items: center; gap: 10px; cursor: pointer;
    padding: 10px 14px; border-radius: 11px;
    background: var(--cult-bgInput); border: 1px solid var(--cult-borderInput);
    transition: border-color .25s;
  }
  .cult-toggle:hover { border-color: var(--cult-gold)60; }
  .cult-toggle-track {
    width: 36px; height: 20px; border-radius: 10px;
    background: var(--cult-border); position: relative;
    transition: background .25s; flex-shrink: 0;
  }
  .cult-toggle-track.on { background: var(--cult-blue); }
  .cult-toggle-thumb {
    width: 16px; height: 16px; border-radius: 50%;
    background: #fff; position: absolute; top: 2px; left: 2px;
    transition: transform .25s; box-shadow: 0 1px 3px rgba(0,0,0,.2);
  }
  .cult-toggle-track.on .cult-toggle-thumb { transform: translateX(16px); }

  .cult-empty {
    text-align: center; padding: 40px 24px;
    background: var(--cult-bgEl); border-radius: 20px;
    border: 2px dashed var(--cult-border);
  }
`;

/* ─── Componente Principal ──────────────────────────────────────────────── */
export default function RegistroCulto({ isDark = false }) {
  const [form, setForm]             = useState({ ...FORM_EMPTY });
  const [cultos, setCultos]         = useState([]);
  const [pregadores, setPregadores] = useState([]);
  const [pregadorManual, setPregadorManual] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [erro, setErro]             = useState(null);
  const [sucesso, setSucesso]       = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [editExpirado, setEditExpirado] = useState(false);
  const formRef = useRef(null);

  const t = theme(isDark);

  /* ── CSS vars ────────────────────────────────────────────────────── */
  const cssVars = {
    "--cult-text":      t.text,
    "--cult-textSec":   t.textSec,
    "--cult-textMuted": t.textMuted,
    "--cult-bgInput":   t.bgInput,
    "--cult-bgEl":      t.bgEl,
    "--cult-border":    t.border,
    "--cult-borderInput": t.borderInput,
    "--cult-placeholder": t.placeholder,
    "--cult-gold":      t.gold,
    "--cult-blue":      AURA.blue,
    "--cult-blueDark":  AURA.blueDark,
    "--cult-isDark":    isDark ? ".35" : ".1",
  };

  /* ── fetch cultos ────────────────────────────────────────────────── */
  const carregarCultos = useCallback(async () => {
    try {
      setLoading(true); setErro(null);
      const res = await api.get("/cultos", { params: { page: 0, size: 50 } });
      const data = res.data;
      setCultos(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      setErro({ status: e.response?.status, msg: "Não foi possível carregar os cultos." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarCultos(); }, [carregarCultos]);

  /* ── fetch pregadores (pastores e líderes) ─────────────────────── */
  useEffect(() => {
    api.get("/usuarios")
        .then(res => {
          const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
          const pastors = data.filter(u =>
              (u.perfil === "PASTOR" || u.perfil === "LIDER_CELULA") && u.ativo !== false
          ).map(u => u.nome || u.email).filter(Boolean).sort();
          setPregadores(pastors);
        })
        .catch(() => {});
  }, []);

  /* ── auto-sugerir tipo ao mudar data ─────────────────────────────── */
  useEffect(() => {
    if (!form.data || editandoId) return;
    const ctrl = new AbortController();
    api.get("/cultos/tipo-sugerido", { params: { data: form.data }, signal: ctrl.signal })
        .then(res => {
          if (res.data?.tipoCulto) {
            setForm(f => ({ ...f, tipoCulto: res.data.tipoCulto }));
          }
        })
        .catch(() => {});
    return () => ctrl.abort();
  }, [form.data, editandoId]);

  /* ── auto-preencher horário ao mudar tipo de culto ──────────────── */
  useEffect(() => {
    if (editandoId) return;
    const horarios = HORARIOS_POR_TIPO[form.tipoCulto];
    if (horarios && horarios.length === 1) {
      setForm(f => ({ ...f, horario: horarios[0] }));
    } else if (horarios && horarios.length > 1) {
      setForm(f => ({ ...f, horario: horarios[0] }));
    } else {
      setForm(f => ({ ...f, horario: "" }));
    }
  }, [form.tipoCulto, editandoId]);

  /* ── totalGeral ──────────────────────────────────────────────────── */
  const totalGeral = useMemo(() => {
    const m = parseInt(form.quantidadeMembros, 10) || 0;
    const v = parseInt(form.visitantesSimpatizantes, 10) || 0;
    const c = parseInt(form.totalCriancas, 10) || 0;
    const d = parseInt(form.quantidadeDiaconos, 10) || 0;
    return m + v + c + d;
  }, [form.quantidadeMembros, form.visitantesSimpatizantes, form.totalCriancas, form.quantidadeDiaconos]);

  /* ── submit ──────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null); setSucesso(null); setEditExpirado(false);

    if (!form.data) { setErro({ msg: "Informe a data do culto." }); return; }

    const [y, m, d] = form.data.split("-").map(Number);
    const diaSemana = new Date(y, m - 1, d).getDay();
    const nomesDias = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
    const diaNome = nomesDias[diaSemana];
    const isDomingo = diaSemana === 0;
    const isQuaQui = diaSemana === 3 || diaSemana === 4;

    if (isDomingo && form.tipoCulto === "Vitória") {
      setErro({ msg: "Culto da Vitória não pode ser registrado em domingo. É permitido apenas quarta e quinta-feira." });
      return;
    }
    if (isQuaQui && ["Santa Ceia", "Celebração", "Missões"].includes(form.tipoCulto)) {
      setErro({ msg: `Culto de ${form.tipoCulto} não pode ser registrado em ${diaNome}. É permitido apenas aos domingos.` });
      return;
    }

    const payload = {
      data:                       form.data,
      horario:                    form.horario || null,
      tipoCulto:                  form.tipoCulto,
      textoPregado:               form.textoPregado,
      pregador:                   form.pregador,
      quantidadeMembros:          parseInt(form.quantidadeMembros, 10) || 0,
      visitantesSimpatizantes:    parseInt(form.visitantesSimpatizantes, 10) || 0,
      totalCriancas:              parseInt(form.totalCriancas, 10) || 0,
      quantidadeDiaconos:         parseInt(form.quantidadeDiaconos, 10) || 0,
      campanha:                   form.campanha,
      nomeCampanha:               form.campanha ? form.nomeCampanha : null,
      observacoes:                form.observacoes,
    };

    try {
      setSaving(true);
      const ctrl = new AbortController();

      if (editandoId) {
        await api.put(`/cultos/${editandoId}`, payload, { signal: ctrl.signal });
        setSucesso("Culto atualizado com sucesso!");
      } else {
        await api.post("/cultos", payload, { signal: ctrl.signal });
        setSucesso("Culto registrado com sucesso!");
      }

      setForm({ ...FORM_EMPTY });
      setEditandoId(null);
      setPregadorManual(false);
      carregarCultos();
      setTimeout(() => setSucesso(null), 4000);
    } catch (e) {
      if (e.name === "CanceledError" || e.name === "AbortError") return;
      if (e.response?.status === 403) {
        setEditExpirado(true);
      } else if (e.response?.status === 409 || /já existe/i.test(e.response?.data?.message)) {
        const dataFmt = form.data ? fmtData(form.data) : "";
        const partes = [dataFmt, form.tipoCulto, form.horario].filter(Boolean).join(", ");
        setErro({ duplicata: true, detalhes: partes || "data, tipo e horário informados" });
      } else {
        setErro({ msg: e.response?.data?.message || "Erro ao salvar culto." });
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── editar ──────────────────────────────────────────────────────── */
  const handleEditar = (culto) => {
    setForm({
      data:                      culto.data || "",
      horario:                   culto.horario || "",
      tipoCulto:                 culto.tipoCulto || "Vitória",
      textoPregado:              culto.textoPregado || "",
      pregador:                  culto.pregador || "",
      quantidadeMembros:         String(culto.quantidadeMembros || 0),
      visitantesSimpatizantes:   String(culto.visitantesSimpatizantes || 0),
      totalCriancas:             String(culto.totalCriancas || 0),
      quantidadeDiaconos:        String(culto.quantidadeDiaconos || 0),
      campanha:                  !!culto.campanha,
      nomeCampanha:              culto.nomeCampanha || "",
      observacoes:               culto.observacoes || "",
    });
    const pNome = culto.pregador || "";
    setPregadorManual(pNome ? !pregadores.includes(pNome) : false);
    setEditandoId(culto.id);
    setEditExpirado(false);
    setSucesso(null); setErro(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ── cancelar edição ─────────────────────────────────────────────── */
  const cancelarEdicao = () => {
    setForm({ ...FORM_EMPTY });
    setEditandoId(null);
    setEditExpirado(false);
    setPregadorManual(false);
  };

  /* ── formatar data ───────────────────────────────────────────────── */
  const fmtData = (d) => {
    if (!d) return "—";
    const [y, m, dia] = d.split("-");
    return `${dia}/${m}/${y}`;
  };

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (loading) return (
      <TelaCarregando isDark={isDark} texto="Carregando cultos…" minHeight="60vh" background="transparent" />
  );

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
      <div className="cult-root" style={cssVars}>
        <style>{css}</style>

        <div className="cult-wrap">

          {/* ── Header ── */}
          <motion.div
              initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .35 }}
              style={{
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20,
              }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 11,
                background: `${AURA.gold}18`, border: `1px solid ${AURA.gold}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Church size={20} style={{ color: AURA.gold }} />
              </div>
              <div>
                <p style={{
                  fontSize: 9, letterSpacing: ".2em", fontWeight: 600,
                  color: `${t.gold}88`, margin: "0 0 3px", textTransform: "uppercase",
                }}>
                  Diácono · Registro
                </p>
                <h2 style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(17px,4vw,23px)",
                  fontWeight: 500, margin: 0, color: t.text,
                }}>
                  Culto
                </h2>
              </div>
            </div>

            <button className="cult-btn-ghost" onClick={carregarCultos}>
              <RefreshCw size={13} />
              <span style={{ display: "none" }}>Recarregar</span>
            </button>
          </motion.div>

          <div className="cult-div" />

          {/* ── Erro / Sucesso ── */}
          <AnimatePresence>
            {erro && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden", marginBottom: 14 }}
                >
                  {erro.duplicata ? (
                      <div style={{
                        background: `linear-gradient(135deg, ${AURA.gold}0a, ${AURA.yellow}08)`,
                        border: `1px solid ${AURA.gold}30`,
                        borderRadius: 14, padding: "14px 16px",
                        display: "flex", alignItems: "flex-start", gap: 12,
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                          background: `linear-gradient(135deg, ${AURA.gold}20, ${AURA.yellow}15)`,
                          border: `1px solid ${AURA.gold}28`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <AlertCircle size={15} style={{ color: AURA.gold }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: t.text, margin: "0 0 4px" }}>
                            Culto já registrado
                          </p>
                          <p style={{ fontSize: 13, color: t.textSec, margin: 0, lineHeight: 1.5 }}>
                            Já existe um culto para <strong>{erro.detalhes}</strong>.
                            Edite o registro existente na lista abaixo.
                          </p>
                        </div>
                        <button onClick={() => setErro(null)} style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: t.textMuted, padding: 4, flexShrink: 0,
                        }}>
                          <X size={14} />
                        </button>
                      </div>
                  ) : (
                      <div style={{
                        background: `linear-gradient(135deg, ${AURA.red}0c, rgba(200,16,46,.04))`,
                        border: `1px solid ${AURA.red}28`,
                        borderRadius: 14, padding: "14px 16px",
                        display: "flex", alignItems: "flex-start", gap: 12,
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                          background: `linear-gradient(135deg, ${AURA.red}18, ${AURA.redDark}10)`,
                          border: `1px solid ${AURA.red}25`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <AlertCircle size={15} style={{ color: AURA.red }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: AURA.red, margin: "0 0 4px" }}>
                            Ops! Algo deu errado
                          </p>
                          <p style={{ fontSize: 13, color: t.textSec, margin: 0, lineHeight: 1.5 }}>
                            {erro.msg}
                          </p>
                        </div>
                        <button onClick={() => setErro(null)} style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: t.textMuted, padding: 4, flexShrink: 0,
                        }}>
                          <X size={14} />
                        </button>
                      </div>
                  )}
                </motion.div>
            )}
            {sucesso && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden", marginBottom: 14 }}
                >
                  <div className="cult-alert" style={{ background: `${AURA.green}10`, border: `1px solid ${AURA.green}28` }}>
                    <CheckCircle2 size={15} style={{ color: AURA.green, flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: AURA.green, margin: 0 }}>{sucesso}</p>
                  </div>
                </motion.div>
            )}
            {editExpirado && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden", marginBottom: 14 }}
                >
                  <div className="cult-alert" style={{ background: t.warnBg, border: `1px solid ${AURA.yellow}30` }}>
                    <AlertTriangle size={15} style={{ color: AURA.yellow, flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: t.text, margin: 0 }}>
                      Prazo de edição expirado. Solicite ao pastor.
                    </p>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* ── Formulário ── */}
          <motion.div
              ref={formRef}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .3, delay: .1 }}
              style={{
                background: t.bgEl, border: `1px solid ${t.border}`,
                borderRadius: 20, overflow: "hidden", marginBottom: 24,
              }}
          >
            {/* faixa dourada topo */}
            <div style={{ height: 3, background: `linear-gradient(90deg, ${AURA.blue}, ${t.gold})` }} />

            <div style={{ padding: "18px 16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                {editandoId ? <Edit3 size={16} style={{ color: t.gold }} /> : <Church size={16} style={{ color: t.gold }} />}
                <h3 style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 16, fontWeight: 500, color: t.text, margin: 0,
                }}>
                  {editandoId ? "Editar Culto" : "Novo Culto"}
                </h3>
                {editandoId && (
                    <button
                        className="cult-btn-ghost"
                        onClick={cancelarEdicao}
                        style={{ marginLeft: "auto", height: 30, fontSize: 9, padding: "0 10px" }}
                    >
                      <X size={11} /> Cancelar
                    </button>
                )}
              </div>

              <form id="culto-form" onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                  {/* Data */}
                  <div>
                    <label className="cult-label">Data <span style={{ color: AURA.red }}>*</span></label>
                    <div className="cult-icon-field">
                      <Calendar size={14} />
                      <input
                          className="cult-date"
                          type="date"
                          value={form.data}
                          onChange={e => setForm({ ...form, data: e.target.value })}
                          required
                      />
                    </div>
                  </div>

                  {/* Horário */}
                  <div>
                    <label className="cult-label">Horário</label>
                    <div className="cult-icon-field">
                      <Clock size={14} />
                      {HORARIOS_POR_TIPO[form.tipoCulto]?.length > 0 ? (
                          <select
                              className="cult-select"
                              value={form.horario}
                              onChange={e => setForm({ ...form, horario: e.target.value })}
                          >
                            <option value="">Selecione…</option>
                            {HORARIOS_POR_TIPO[form.tipoCulto].map(h => (
                                <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                      ) : (
                          <input
                              className="cult-input"
                              type="time"
                              value={form.horario}
                              onChange={e => setForm({ ...form, horario: e.target.value })}
                              placeholder="HH:MM"
                          />
                      )}
                    </div>
                  </div>

                  {/* Tipo de Culto */}
                  <div>
                    <label className="cult-label">Tipo de Culto</label>
                    <div className="cult-icon-field">
                      <Church size={14} />
                      <select
                          className="cult-select"
                          value={form.tipoCulto}
                          onChange={e => setForm({ ...form, tipoCulto: e.target.value })}
                      >
                        {TIPOS_CULTO.map(tc => <option key={tc} value={tc}>{tc}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Pregador */}
                  <div>
                    <label className="cult-label">Pregador</label>
                    {pregadores.length > 0 && !pregadorManual ? (
                        <div className="cult-icon-field">
                          <Mic2 size={14} />
                          <select
                              className="cult-select"
                              value={form.pregador}
                              onChange={e => {
                                if (e.target.value === "__outro__") {
                                  setPregadorManual(true);
                                  setForm({ ...form, pregador: "" });
                                } else {
                                  setForm({ ...form, pregador: e.target.value });
                                }
                              }}
                          >
                            <option value="">Selecione…</option>
                            {pregadores.map(p => <option key={p} value={p}>{p}</option>)}
                            <option value="__outro__">Outro (digitar)</option>
                          </select>
                        </div>
                    ) : (
                        <div className="cult-icon-field">
                          <Mic2 size={14} />
                          <input
                              className="cult-input"
                              type="text"
                              value={form.pregador}
                              onChange={e => setForm({ ...form, pregador: e.target.value })}
                              placeholder="Nome do pregador"
                          />
                          {pregadores.length > 0 && (
                              <button
                                  type="button"
                                  onClick={() => { setPregadorManual(false); setForm({ ...form, pregador: "" }); }}
                                  style={{
                                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: `1px solid ${t.borderInput}`, borderRadius: 6,
                                    padding: "2px 8px", cursor: "pointer", color: t.textMuted,
                                    fontSize: 9, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase",
                                  }}
                              >
                                Lista
                              </button>
                          )}
                        </div>
                    )}
                  </div>

                  {/* Texto Pregado */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="cult-label">Texto Pregado</label>
                    <div className="cult-icon-field">
                      <FileText size={14} />
                      <input
                          className="cult-input"
                          type="text"
                          value={form.textoPregado}
                          onChange={e => setForm({ ...form, textoPregado: e.target.value })}
                          placeholder="Ex: João 3:16 — Deus amou o mundo"
                      />
                    </div>
                  </div>

                  {/* Qtd Membros */}
                  <div>
                    <label className="cult-label">Quantidade de Membros</label>
                    <div className="cult-icon-field">
                      <Users size={14} />
                      <input
                          className="cult-input-num"
                          type="number"
                          min="0"
                          value={form.quantidadeMembros}
                          onChange={e => setForm({ ...form, quantidadeMembros: e.target.value })}
                          placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Visitantes */}
                  <div>
                    <label className="cult-label">Visitantes / Simpatizantes</label>
                    <div className="cult-icon-field">
                      <Users size={14} />
                      <input
                          className="cult-input-num"
                          type="number"
                          min="0"
                          value={form.visitantesSimpatizantes}
                          onChange={e => setForm({ ...form, visitantesSimpatizantes: e.target.value })}
                          placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Crianças */}
                  <div>
                    <label className="cult-label">Total de Crianças</label>
                    <div className="cult-icon-field">
                      <Baby size={14} />
                      <input
                          className="cult-input-num"
                          type="number"
                          min="0"
                          value={form.totalCriancas}
                          onChange={e => setForm({ ...form, totalCriancas: e.target.value })}
                          placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Diáconos */}
                  <div>
                    <label className="cult-label">Diáconos Presentes</label>
                    <div className="cult-icon-field">
                      <UserCheck size={14} />
                      <input
                          className="cult-input-num"
                          type="number"
                          min="0"
                          value={form.quantidadeDiaconos}
                          onChange={e => setForm({ ...form, quantidadeDiaconos: e.target.value })}
                          placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Total Geral */}
                <div className="cult-total-box" style={{ marginTop: 16 }}>
                  <p className="cult-total-label">Total Geral</p>
                  <p className="cult-total-value">{totalGeral}</p>
                </div>

                {/* Campanha toggle */}
                <div style={{ marginTop: 16 }}>
                  <div
                      className="cult-toggle"
                      onClick={() => setForm({ ...form, campanha: !form.campanha, nomeCampanha: form.campanha ? "" : form.nomeCampanha })}
                  >
                    <div className={`cult-toggle-track ${form.campanha ? "on" : ""}`}>
                      <div className="cult-toggle-thumb" />
                    </div>
                    <Megaphone size={14} style={{ color: form.campanha ? AURA.blue : t.textMuted }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: form.campanha ? t.text : t.textSec }}>
                      Campanha
                    </span>
                  </div>

                  <AnimatePresence>
                    {form.campanha && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: "hidden", marginTop: 10 }}
                        >
                          <div className="cult-icon-field">
                            <Megaphone size={14} />
                            <input
                                className="cult-input"
                                type="text"
                                value={form.nomeCampanha}
                                onChange={e => setForm({ ...form, nomeCampanha: e.target.value })}
                                placeholder="Nome da campanha"
                            />
                          </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Observações */}
                <div style={{ marginTop: 14 }}>
                  <label className="cult-label">Observações</label>
                  <textarea
                      className="cult-textarea"
                      value={form.observacoes}
                      onChange={e => setForm({ ...form, observacoes: e.target.value })}
                      placeholder="Observações opcionais..."
                  />
                </div>

                {/* Botão Salvar */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
                  <button type="submit" className="cult-btn-save" disabled={saving}>
                    {saving
                        ? <><Loader2 size={14} className="cult-spin" /> Salvando…</>
                        : <><Save size={14} /> {editandoId ? "Atualizar" : "Registrar Culto"}</>
                    }
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* ── Últimos Cultos ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <h3 style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 16, fontWeight: 500, color: t.text, margin: 0,
            }}>
              Últimos Cultos
            </h3>
            <span style={{
              padding: "3px 10px", borderRadius: 99,
              background: `${AURA.gold}14`, border: `1px solid ${AURA.gold}28`,
              fontSize: 9, fontWeight: 700, color: t.gold, letterSpacing: ".1em",
            }}>
              {cultos.length}
            </span>
          </div>

          {cultos.length === 0 ? (
              <div className="cult-empty">
                <Church size={34} style={{ color: `${t.gold}40`, margin: "0 auto 12px" }} />
                <p style={{ fontSize: 13, fontWeight: 300, color: t.textMuted, margin: 0 }}>
                  Nenhum culto registrado ainda.
                </p>
              </div>
          ) : (
              <div className="cult-grid">
                <AnimatePresence mode="popLayout">
                  {cultos.map((culto, i) => {
                    const tc = TIPO_CORES[culto.tipoCulto] || TIPO_CORES["Outro"];
                    const tot = (culto.quantidadeMembros || 0) + (culto.visitantesSimpatizantes || 0) + (culto.totalCriancas || 0) + (culto.quantidadeDiaconos || 0);
                    return (
                        <motion.div
                            key={culto.id}
                            className="cult-card"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: .96 }}
                            transition={{ delay: i * .04 }}
                        >
                          {/* faixa topo */}
                          <div style={{ height: 3, background: `linear-gradient(90deg, ${tc.color}, ${t.gold})` }} />

                          <div style={{ padding: "16px 16px 0" }}>
                            {/* badge tipo + botão editar */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                              <span style={{
                                background: tc.bg, color: tc.color,
                                border: `1px solid ${tc.border}`, borderRadius: 99,
                                padding: "3px 10px", fontSize: 8, fontWeight: 700,
                                letterSpacing: ".1em", textTransform: "uppercase",
                              }}>
                                {culto.tipoCulto || "Culto"}
                              </span>
                              <button
                                  onClick={() => handleEditar(culto)}
                                  style={{
                                    background: t.bgInput, border: `1px solid ${t.border}`,
                                    borderRadius: 8, padding: 6, cursor: "pointer",
                                    color: t.textMuted, transition: "all .2s",
                                    display: "flex",
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.gold; e.currentTarget.style.color = t.gold; }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; }}
                                  title="Editar"
                              >
                                <Edit3 size={13} />
                              </button>
                            </div>

                            {/* data + horário */}
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                              <Calendar size={11} style={{ color: t.gold, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, fontWeight: 400, color: t.textSec }}>{fmtData(culto.data)}</span>
                              {culto.horario && (
                                  <>
                                    <span style={{ fontSize: 12, color: t.textMuted }}>·</span>
                                    <Clock size={11} style={{ color: t.gold, flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, fontWeight: 400, color: t.textSec }}>{culto.horario}</span>
                                  </>
                              )}
                            </div>
                            {culto.pregador && (
                                <p style={{
                                  fontSize: 13, fontWeight: 600, color: t.text, margin: "0 0 4px",
                                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>
                                  {culto.pregador}
                                </p>
                            )}
                            {culto.textoPregado && (
                                <p style={{
                                  fontSize: 11, fontWeight: 300, color: t.textSec, margin: "0 0 8px",
                                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                  fontStyle: "italic",
                                }}>
                                  "{culto.textoPregado}"
                                </p>
                            )}

                            {culto.campanha && culto.nomeCampanha && (
                                <div style={{
                                  display: "inline-flex", alignItems: "center", gap: 5,
                                  padding: "3px 8px", borderRadius: 6,
                                  background: `${AURA.yellow}12`, border: `1px solid ${AURA.yellow}28`,
                                  marginBottom: 8,
                                }}>
                                  <Megaphone size={10} style={{ color: AURA.yellow }} />
                                  <span style={{ fontSize: 9, fontWeight: 600, color: AURA.yellow }}>{culto.nomeCampanha}</span>
                                </div>
                            )}
                          </div>

                          {/* footer do card */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: `1px solid ${t.border}` }}>
                            <div style={{ padding: "10px 8px", textAlign: "center", borderRight: `1px solid ${t.border}` }}>
                              <p style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: 0, lineHeight: 1 }}>
                                {culto.quantidadeMembros || 0}
                              </p>
                              <p style={{ fontSize: 7, letterSpacing: ".1em", color: t.textMuted, margin: "3px 0 0" }}>MEMBROS</p>
                            </div>
                            <div style={{ padding: "10px 8px", textAlign: "center", borderRight: `1px solid ${t.border}` }}>
                              <p style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: 0, lineHeight: 1 }}>
                                {culto.visitantesSimpatizantes || 0}
                              </p>
                              <p style={{ fontSize: 7, letterSpacing: ".1em", color: t.textMuted, margin: "3px 0 0" }}>VISITANTES</p>
                            </div>
                            <div style={{ padding: "10px 8px", textAlign: "center" }}>
                              <p style={{ fontSize: 18, fontWeight: 700, color: AURA.blue, margin: 0, lineHeight: 1 }}>
                                {tot}
                              </p>
                              <p style={{ fontSize: 7, letterSpacing: ".1em", color: t.textMuted, margin: "3px 0 0" }}>TOTAL</p>
                            </div>
                          </div>
                        </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
          )}

          {/* footer */}
          <div className="cult-div" style={{ marginTop: 28 }} />
          <p style={{
            textAlign: "center", fontSize: 9, letterSpacing: ".18em",
            textTransform: "uppercase", paddingBottom: 16,
            color: isDark ? "rgba(245,240,232,.1)" : "rgba(26,16,8,.12)",
          }}>
          </p>
        </div>
      </div>
  );
}

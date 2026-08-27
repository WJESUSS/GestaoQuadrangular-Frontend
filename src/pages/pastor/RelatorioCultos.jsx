import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import api from "../../services/api.js";
import {
  Search, Calendar, Clock, Download, X, Users, Church,
  Loader2, ChevronRight, RefreshCw, Filter,
  AlertCircle, ChevronLeft, Baby, UserCheck,
  Mic2, Megaphone, Trophy, TrendingUp, BarChart2,
  ArrowUpRight, ArrowDownRight, Minus, GitCompareArrows,
  Target, Flame, AlertTriangle, FileText, Printer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, Legend,
  PieChart, Pie, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import TelaCarregando from "../../components/TelaCarregando.jsx";
import ModalCulto from "./ModalCulto.jsx";

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
  greenDark:  "#15803d",
  purple:     "#8B5CF6",
  orange:     "#F97316",
};

function theme(isDark) {
  return {
    bg:          isDark ? "#0A0A0F"               : "#F5F0E8",
    bgEl:        isDark ? "rgba(18,18,26,.97)"    : "#FFFFFF",
    bgInput:     isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.1)"  : "rgba(201,169,110,.2)",
    borderInput: isDark ? "rgba(201,169,110,.18)" : "rgba(201,169,110,.3)",
    text:        isDark ? "#F5F0E8"               : "#1A1008",
    textSec:     isDark ? "#9A9588"               : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"               : "#9A9080",
    placeholder: isDark ? "rgba(154,149,136,.35)" : "rgba(107,94,74,.35)",
    gold:        isDark ? "#C9A96E" : "#3D3218",
    goldSoft:    isDark ? "rgba(201,169,110,.06)" : "rgba(61,50,24,.08)",
    goldHover:   isDark ? "rgba(201,169,110,.12)" : "rgba(61,50,24,.14)",
  };
}

/* ─── Config ───────────────────────────────────────────────────────────── */
const TIPOS_CULTO = ["Todos", "Vitória", "Santa Ceia", "Celebração", "Missões", "Outro"];

const TIPO_CORES = {
  "Vitória":    "#16a34a",
  "Santa Ceia": AURA.gold,
  "Celebração": AURA.blue,
  "Missões":    AURA.red,
  "Outro":      AURA.yellow,
};

const TIPO_BGS = {
  "Vitória":    "rgba(22,163,74,.12)",
  "Santa Ceia": "rgba(201,169,110,.12)",
  "Celebração": "rgba(0,61,165,.12)",
  "Missões":    "rgba(200,16,46,.12)",
  "Outro":      "rgba(253,184,19,.12)",
};

const TIPO_BORDERS = {
  "Vitória":    "rgba(22,163,74,.30)",
  "Santa Ceia": "rgba(201,169,110,.30)",
  "Celebração": "rgba(0,61,165,.30)",
  "Missões":    "rgba(200,16,46,.30)",
  "Outro":      "rgba(253,184,19,.30)",
};

const PAGE_SIZES = [6, 12, 24];
const MESES_PT = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const META_STORAGE_KEY = "ieq_cultos_metas";

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function fmtData(d) {
  if (!d) return "—";
  const [y, m, dia] = d.split("-");
  return `${dia}/${m}/${y}`;
}
function somaTotais(c) {
  return (c.quantidadeMembros || 0) + (c.visitantesSimpatizantes || 0) + (c.totalCriancas || 0) + (c.quantidadeDiaconos || 0);
}
function extractAnoMes(d) {
  if (!d) return null;
  const [y, m] = d.split("-");
  return `${y}-${m}`;
}
function fmtMes(ym) {
  if (!ym) return "—";
  const [y, m] = ym.split("-");
  return `${MESES_PT[parseInt(m)]} ${y}`;
}
function getMesAnterior(ym) {
  if (!ym) return null;
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function getDiaSemana(dataStr) {
  if (!dataStr) return -1;
  const [y, m, d] = dataStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}
function getSemanaDoMes(dataStr) {
  if (!dataStr) return 0;
  const [y, m, d] = dataStr.split("-").map(Number);
  return Math.ceil(d / 7);
}

/* ─── Paginação ─────────────────────────────────────────────────────────── */
function Paginacao({ page, totalPages, onChange, t, totalItems, pageSize }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const delta = 1;
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || (i >= page - delta && i <= page + delta)) pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }
  const inicio = page * pageSize + 1;
  const fim = Math.min((page + 1) * pageSize, totalItems);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
      <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 500 }}>Exibindo {inicio}–{fim} de {totalItems}</span>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <button onClick={() => onChange(page - 1)} disabled={page === 0} style={pagBtn(false, page === 0, t)}><ChevronLeft size={14} /></button>
        {pages.map((p, i) => p === "..." ? <span key={`e${i}`} style={{ color: t.textMuted, fontSize: 12, padding: "0 4px" }}>…</span> : <button key={p} onClick={() => onChange(p)} style={pagBtn(p === page, false, t)}>{p + 1}</button>)}
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} style={pagBtn(false, page >= totalPages - 1, t)}><ChevronRight size={14} /></button>
      </div>
    </div>
  );
}
function pagBtn(active, disabled, t) {
  return { width: 34, height: 34, borderRadius: 8, border: active ? "none" : `1px solid ${t.border}`, background: active ? `linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue})` : "transparent", color: active ? "#fff" : t.textMuted, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .35 : 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, transition: "all .2s" };
}

/* ─── Sub-components ────────────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,.2)" }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, margin: "0 0 6px", letterSpacing: ".08em" }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ fontSize: 12, fontWeight: 600, color: p.color || p.fill, margin: "2px 0" }}>{p.name}: {p.value}</p>)}
    </div>
  );
}

function Medalha({ posicao, size = 32 }) {
  const cfg = { 0: { bg: "linear-gradient(135deg, #FFD700, #FFA500)", shadow: "rgba(255,215,0,.35)", l: "1º" }, 1: { bg: "linear-gradient(135deg, #C0C0C0, #A0A0A0)", shadow: "rgba(192,192,192,.30)", l: "2º" }, 2: { bg: "linear-gradient(135deg, #CD7F32, #A0522D)", shadow: "rgba(205,127,50,.30)", l: "3º" } }[posicao];
  if (!cfg) return null;
  return <div style={{ width: size, height: size, borderRadius: "50%", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: `0 4px 12px ${cfg.shadow}`, fontFamily: "'Inter',sans-serif" }}>{cfg.l}</div>;
}

function VarBadge({ v, t }) {
  if (v === 0) return <Minus size={11} style={{ color: t?.textMuted || "#9A9080" }} />;
  const pos = v > 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 10, fontWeight: 700, color: pos ? AURA.green : AURA.red, background: pos ? "rgba(22,163,74,.10)" : "rgba(200,16,46,.10)", padding: "2px 6px", borderRadius: 6 }}>
      {pos ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{Math.abs(v)}%
    </span>
  );
}

function SectionHeader({ icon: Icon, iconColor, title, subtitle, bgTint, t }) {
  return (
    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, background: bgTint, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${iconColor}20, ${iconColor}08)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} style={{ color: iconColor }} />
      </div>
      <div>
        <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 500, color: t.text, margin: 0 }}>{title}</h4>
        {subtitle && <p style={{ fontSize: 10, color: t.textMuted, margin: 0 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function PanelCard({ children, t, isDark, style = {} }) {
  return <div style={{ background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 18, overflow: "hidden", boxShadow: `0 4px 20px rgba(0,0,0,${isDark ? ".25" : ".06"})`, ...style }}>{children}</div>;
}

/* ── Progress bar animada ── */
function ProgressBar({ value, max, color, height = 6 }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ width: "100%", height, borderRadius: height / 2, background: "rgba(128,128,128,.15)", overflow: "hidden" }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: .7, ease: "easeOut" }}
        style={{ height: "100%", borderRadius: height / 2, background: `linear-gradient(90deg, ${color}90, ${color})` }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════════════════ */
export default function RelatorioCultos({ isDark = false }) {
  const [cultos, setCultos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroPreg, setFiltroPreg] = useState("");
  const [filtroCamp, setFiltroCamp] = useState("");
  const [filtroDiacon, setFiltroDiacon] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showRanking, setShowRanking] = useState(false);
  const [showCampanha, setShowCampanha] = useState(false);
  const [showComparativo, setShowComparativo] = useState(false);
  const [showTipoComp, setShowTipoComp] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showMetas, setShowMetas] = useState(false);
  const [mes1, setMes1] = useState("");
  const [mes2, setMes2] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [metas, setMetas] = useState(() => {
    try { return JSON.parse(localStorage.getItem(META_STORAGE_KEY)) || {}; } catch { return {}; }
  });
  const [metaEditTipo, setMetaEditTipo] = useState("");
  const [metaEditValor, setMetaEditValor] = useState("");
  const chartRef = useRef(null);
  const tipoChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const heatmapRef = useRef(null);
  const t = theme(isDark);

  /* ── fetch ────────────────────────────────────────────────────────── */
  const carregarCultos = useCallback(async () => {
    try {
      setLoading(true); setErro(null);
      let all = []; let pg = 0; const size = 500; let hasMore = true;
      while (hasMore) {
        const res = await api.get("/cultos", { params: { page: pg, size } });
        const data = res.data;
        const batch = Array.isArray(data) ? data : data?.content || [];
        all = all.concat(batch);
        if (Array.isArray(data) || batch.length < size || (data?.totalPages && pg + 1 >= data.totalPages)) hasMore = false;
        else pg++;
      }
      setCultos(all);
      setPage(0);
    } catch (e) {
      setErro({ status: e.response?.status, msg: "Não foi possível carregar os cultos." });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { carregarCultos(); }, [carregarCultos]);

  /* ── filtros ──────────────────────────────────────────────────────── */
  const pregadores = useMemo(() => [...new Set(cultos.map(c => c.pregador).filter(Boolean))].sort(), [cultos]);
  const campanhas = useMemo(() => [...new Set(cultos.filter(c => c.campanha && c.nomeCampanha).map(c => c.nomeCampanha))].sort(), [cultos]);
  const diaconos = useMemo(() => [...new Set(cultos.map(c => c.registradoPorNome || c.registradoPor).filter(Boolean))].sort(), [cultos]);
  const mesesDisponiveis = useMemo(() => { const s = new Set(); cultos.forEach(c => { const ym = extractAnoMes(c.data); if (ym) s.add(ym); }); return [...s].sort().reverse(); }, [cultos]);

  const filtrados = useMemo(() => {
    return cultos.filter(c => {
      const b = busca.toLowerCase();
      const okBusca = !b || c.pregador?.toLowerCase().includes(b) || c.textoPregado?.toLowerCase().includes(b) || c.nomeCampanha?.toLowerCase().includes(b);
      let okData = true;
      if (dataInicio) okData = okData && c.data >= dataInicio;
      if (dataFim) okData = okData && c.data <= dataFim;
      return okBusca && okData && (filtroTipo === "Todos" || c.tipoCulto === filtroTipo) && (!filtroPreg || c.pregador === filtroPreg) && (!filtroCamp || c.nomeCampanha === filtroCamp) && (!filtroDiacon || (c.registradoPorNome || c.registradoPor) === filtroDiacon);
    });
  }, [cultos, busca, dataInicio, dataFim, filtroTipo, filtroPreg, filtroCamp, filtroDiacon]);

  useEffect(() => { setPage(0); }, [busca, dataInicio, dataFim, filtroTipo, filtroPreg, filtroCamp, filtroDiacon]);

  const totalPages = Math.ceil(filtrados.length / pageSize);
  const safePage = Math.min(page, Math.max(totalPages - 1, 0));
  const paginaAtual = filtrados.slice(safePage * pageSize, (safePage + 1) * pageSize);

  /* ── KPIs atuais ──────────────────────────────────────────────────── */
  const kpis = useMemo(() => {
    let membros = 0, visitantes = 0, criancas = 0, diaconos = 0;
    filtrados.forEach(c => { membros += c.quantidadeMembros || 0; visitantes += c.visitantesSimpatizantes || 0; criancas += c.totalCriancas || 0; diaconos += c.quantidadeDiaconos || 0; });
    return { membros, visitantes, criancas, diaconos, total: membros + visitantes + criancas + diaconos, qtd: filtrados.length };
  }, [filtrados]);

  /* ── stats de mês ─────────────────────────────────────────────────── */
  const statsMes = useCallback((ym) => {
    if (!ym) return null;
    const lista = cultos.filter(c => extractAnoMes(c.data) === ym);
    let membros = 0, visitantes = 0, criancas = 0, diaconos = 0;
    lista.forEach(c => { membros += c.quantidadeMembros || 0; visitantes += c.visitantesSimpatizantes || 0; criancas += c.totalCriancas || 0; diaconos += c.quantidadeDiaconos || 0; });
    return { membros, visitantes, criancas, diaconos, total: membros + visitantes + criancas + diaconos, qtd: lista.length };
  }, [cultos]);

  /* ── MoM: mês atual vs anterior ───────────────────────────────────── */
  const mesAtual = useMemo(() => mesesDisponiveis[0] || null, [mesesDisponiveis]);
  const mesAnterior = useMemo(() => getMesAnterior(mesAtual), [mesAtual]);
  const kpisAtual = useMemo(() => statsMes(mesAtual), [mesAtual, statsMes]);
  const kpisAnterior = useMemo(() => statsMes(mesAnterior), [mesAnterior, statsMes]);

  const momData = useMemo(() => {
    if (!kpisAtual || !kpisAnterior) return null;
    const keys = [
      { key: "qtd", label: "Cultos", color: t.text },
      { key: "membros", label: "Membros", color: t.text },
      { key: "visitantes", label: "Visitantes", color: AURA.gold },
      { key: "criancas", label: "Crianças", color: AURA.purple },
      { key: "diaconos", label: "Diáconos", color: AURA.green },
      { key: "total", label: "Total Geral", color: AURA.blue },
    ];
    return keys.map(k => ({
      ...k,
      atual: kpisAtual[k.key],
      anterior: kpisAnterior[k.key],
      variacao: kpisAnterior[k.key] ? Math.round(((kpisAtual[k.key] - kpisAnterior[k.key]) / kpisAnterior[k.key]) * 100) : (kpisAtual[k.key] > 0 ? 100 : 0),
    }));
  }, [kpisAtual, kpisAnterior, t]);

  /* ── Destaques: recorde e queda ───────────────────────────────────── */
  const destaques = useMemo(() => {
    if (filtrados.length < 2) return null;
    const sorted = [...filtrados].sort((a, b) => somaTotais(b) - somaTotais(a));
    const recorde = sorted[0];
    const menor = sorted[sorted.length - 1];
    const mediana = sorted.length > 2 ? Math.round(sorted.reduce((s, c) => s + somaTotais(c), 0) / sorted.length) : 0;
    const quedas = [];
    const porTipo = {};
    filtrados.forEach(c => {
      const tipo = c.tipoCulto || "Outro";
      if (!porTipo[tipo]) porTipo[tipo] = [];
      porTipo[tipo].push(c);
    });
    Object.entries(porTipo).forEach(([tipo, lista]) => {
      const s = [...lista].sort((a, b) => (a.data || "").localeCompare(b.data || ""));
      if (s.length >= 3) {
        const ultimos3 = s.slice(-3);
        const mediaGeral = s.reduce((sum, c) => sum + somaTotais(c), 0) / s.length;
        const abaixoDaMedia = ultimos3.filter(c => somaTotais(c) < mediaGeral * 0.8);
        if (abaixoDaMedia.length >= 2) {
          quedas.push({ tipo, culto: ultimos3[ultimos3.length - 1], media: Math.round(mediaGeral) });
        }
      }
    });
    return { recorde, menor, mediana, quedas };
  }, [filtrados]);

  /* ── Dados gráfico evolução ───────────────────────────────────────── */
  const chartData = useMemo(() => {
    const sorted = [...filtrados].sort((a, b) => (a.data || "").localeCompare(b.data || ""));
    return sorted.slice(-20).map(c => ({ name: fmtData(c.data), total: somaTotais(c), membros: c.quantidadeMembros || 0, visitantes: c.visitantesSimpatizantes || 0, criancas: c.totalCriancas || 0 }));
  }, [filtrados]);

  /* ── Comparativo por tipo ─────────────────────────────────────────── */
  const tipoCompData = useMemo(() => {
    const tipos = ["Vitória", "Santa Ceia", "Celebração", "Missões", "Outro"];
    return tipos.map(tipo => {
      const lista = filtrados.filter(c => c.tipoCulto === tipo);
      if (!lista.length) return { tipo, membros: 0, visitantes: 0, criancas: 0, total: 0, qtd: 0, media: 0 };
      let m = 0, v = 0, cr = 0;
      lista.forEach(c => { m += c.quantidadeMembros || 0; v += c.visitantesSimpatizantes || 0; cr += c.totalCriancas || 0; });
      const tot = m + v + cr;
      return { tipo, membros: m, visitantes: v, criancas: cr, total: tot, qtd: lista.length, media: Math.round(tot / lista.length) };
    }).filter(d => d.qtd > 0);
  }, [filtrados]);

  /* ── Proporção membros x visitantes (pie) ─────────────────────────── */
  const pieData = useMemo(() => {
    const tipoMap = {};
    filtrados.forEach(c => {
      const tipo = c.tipoCulto || "Outro";
      if (!tipoMap[tipo]) tipoMap[tipo] = { membros: 0, visitantes: 0 };
      tipoMap[tipo].membros += c.quantidadeMembros || 0;
      tipoMap[tipo].visitantes += c.visitantesSimpatizantes || 0;
    });
    return Object.entries(tipoMap).map(([name, d]) => ({
      name,
      membros: d.membros,
      visitantes: d.visitantes,
      total: d.membros + d.visitantes,
      color: TIPO_CORES[name] || AURA.yellow,
    }));
  }, [filtrados]);

  /* ── Heatmap ──────────────────────────────────────────────────────── */
  const heatmapData = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array(5).fill(0));
    const counts = Array.from({ length: 7 }, () => Array(5).fill(0));
    filtrados.forEach(c => {
      const dia = getDiaSemana(c.data);
      const sem = getSemanaDoMes(c.data) - 1;
      if (dia >= 0 && dia < 7 && sem >= 0 && sem < 5) {
        grid[dia][sem] += somaTotais(c);
        counts[dia][sem]++;
      }
    });
    const avgs = grid.map((row, i) => row.map((v, j) => counts[i][j] > 0 ? Math.round(v / counts[i][j]) : 0));
    let maxVal = 0;
    avgs.forEach(r => r.forEach(v => { if (v > maxVal) maxVal = v; }));
    return { avgs, maxVal };
  }, [filtrados]);

  /* ── Alerta queda consecutiva ─────────────────────────────────────── */
  const alertas = useMemo(() => {
    const result = [];
    const porTipo = {};
    filtrados.forEach(c => {
      const tipo = c.tipoCulto || "Outro";
      if (!porTipo[tipo]) porTipo[tipo] = [];
      porTipo[tipo].push(c);
    });
    Object.entries(porTipo).forEach(([tipo, lista]) => {
      const s = [...lista].sort((a, b) => (a.data || "").localeCompare(b.data || ""));
      if (s.length < 4) return;
      const media = s.reduce((sum, c) => sum + somaTotais(c), 0) / s.length;
      const ultimos = s.slice(-3);
      const consecutivas = ultimos.filter(c => somaTotais(c) < media * 0.75);
      if (consecutivas.length >= 2) {
        const maior = Math.max(...ultimos.map(c => somaTotais(c)));
        const menor = Math.min(...ultimos.map(c => somaTotais(c)));
        const quedaPct = maior > 0 ? Math.round(((maior - menor) / maior) * 100) : 0;
        result.push({ tipo, quedaPct, media: Math.round(media), menor, ultimaData: ultimos[ultimos.length - 1].data });
      }
    });
    return result;
  }, [filtrados]);

  /* ── Campanhas ────────────────────────────────────────────────────── */
  const campanhaStats = useMemo(() => {
    const cc = cultos.filter(c => c.campanha && c.nomeCampanha);
    if (!cc.length) return null;
    const g = {};
    cc.forEach(c => { if (!g[c.nomeCampanha]) g[c.nomeCampanha] = []; g[c.nomeCampanha].push(somaTotais(c)); });
    return Object.entries(g).map(([nome, totais]) => ({ nome, media: Math.round(totais.reduce((a, b) => a + b, 0) / totais.length), cultos: totais.length, total: totais.reduce((a, b) => a + b, 0) }));
  }, [cultos]);

  /* ── Ranking ──────────────────────────────────────────────────────── */
  const rankingPregadores = useMemo(() => {
    const map = {};
    filtrados.forEach(c => { if (!c.pregador) return; if (!map[c.pregador]) map[c.pregador] = { nome: c.pregador, qtd: 0, soma: 0 }; map[c.pregador].qtd++; map[c.pregador].soma += somaTotais(c); });
    const arr = Object.values(map).map(p => ({ ...p, media: Math.round(p.soma / p.qtd) })).sort((a, b) => b.media - a.media || b.qtd - a.qtd);
    const max = arr.length > 0 ? arr[0].soma : 1;
    return arr.map(p => ({ ...p, pct: Math.round((p.soma / max) * 100) }));
  }, [filtrados]);

  /* ── Comparativo meses (manual) ───────────────────────────────────── */
  const statsM1 = useMemo(() => statsMes(mes1), [mes1, statsMes]);
  const statsM2 = useMemo(() => statsMes(mes2), [mes2, statsMes]);
  const comparativoData = useMemo(() => {
    if (!statsM1 || !statsM2) return null;
    return [
      { label: "Membros", v1: statsM1.membros, v2: statsM2.membros },
      { label: "Visitantes", v1: statsM1.visitantes, v2: statsM2.visitantes },
      { label: "Crianças", v1: statsM1.criancas, v2: statsM2.criancas },
      { label: "Diáconos", v1: statsM1.diaconos, v2: statsM2.diaconos },
      { label: "Total", v1: statsM1.total, v2: statsM2.total },
      { label: "Qtd Cultos", v1: statsM1.qtd, v2: statsM2.qtd },
    ];
  }, [statsM1, statsM2]);

  /* ── Metas ────────────────────────────────────────────────────────── */
  function salvarMeta() {
    if (!metaEditTipo || !metaEditValor) return;
    const novas = { ...metas, [metaEditTipo]: Number(metaEditValor) };
    setMetas(novas);
    localStorage.setItem(META_STORAGE_KEY, JSON.stringify(novas));
    setMetaEditTipo(""); setMetaEditValor("");
  }
  const metaStats = useMemo(() => {
    if (!mesAtual) return [];
    const lista = cultos.filter(c => extractAnoMes(c.data) === mesAtual);
    const tipos = ["Vitória", "Santa Ceia", "Celebração", "Missões", "Outro"];
    return tipos.filter(tipo => metas[tipo] > 0).map(tipo => {
      const tot = lista.filter(c => c.tipoCulto === tipo).reduce((s, c) => s + somaTotais(c), 0);
      return { tipo, atual: tot, meta: metas[tipo], pct: Math.min(Math.round((tot / metas[tipo]) * 100), 100) };
    });
  }, [cultos, mesAtual, metas]);

  /* ── PDF geral com gráficos ───────────────────────────────────────── */
  async function gerarPDFComGraficos() {
    if (!filtrados.length) return;
    const doc = new jsPDF("l", "mm", "a4");
    doc.setFillColor(0, 36, 112); doc.rect(0, 0, 297, 36, "F");
    doc.setFontSize(17); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
    doc.text("IEQ PITUAÇU — RELATÓRIO DE CULTOS", 14, 14);
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`Total: ${kpis.qtd} cultos  |  Participantes: ${kpis.total}  |  ${mesAtual ? fmtMes(mesAtual) : "Período filtrado"}`, 14, 24);
    doc.setTextColor(0);

    let startY = 42;

    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: isDark ? "#0A0A0F" : "#F5F0E8", useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const imgW = 260;
        const imgH = (canvas.height / canvas.width) * imgW;
        doc.addImage(imgData, "PNG", 14, startY, imgW, Math.min(imgH, 80));
        startY += Math.min(imgH, 80) + 8;
      } catch {}
    }

    autoTable(doc, {
      startY,
      head: [["Data", "Horário", "Tipo", "Pregador", "Texto", "Membros", "Visit.", "Crianças", "Diáconos", "Total"]],
      body: filtrados.map(c => [fmtData(c.data), c.horario || "—", c.tipoCulto || "—", c.pregador || "—", (c.textoPregado || "—").substring(0, 25), String(c.quantidadeMembros || 0), String(c.visitantesSimpatizantes || 0), String(c.totalCriancas || 0), String(c.quantidadeDiaconos || 0), String(somaTotais(c))]),
      headStyles: { fillColor: [0, 36, 112], textColor: 255, fontSize: 7 },
      bodyStyles: { fontSize: 7 }, theme: "grid",
    });
    doc.save("Relatorio_Cultos_Geral.pdf");
  }

  /* ── PDF resumido 1 página ────────────────────────────────────────── */
  async function gerarPDFResumo() {
    if (!filtrados.length) return;
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFillColor(0, 36, 112); doc.rect(0, 0, 210, 32, "F");
    doc.setFontSize(14); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
    doc.text("IEQ PITUAÇU — RESUMO DE CULTOS", 14, 13);
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text(fmtMes(mesAtual) || "Período filtrado", 14, 21);
    doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 27);

    let y = 38;
    doc.setTextColor(0);
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("KPIs DO MÊS", 14, y); y += 7;

    const kpiRows = [
      ["Cultos", String(kpis.qtd), "Membros", String(kpis.membros)],
      ["Visitantes", String(kpis.visitantes), "Crianças", String(kpis.criancas)],
      ["Diáconos", String(kpis.diaconos), "TOTAL GERAL", String(kpis.total)],
    ];
    autoTable(doc, {
      startY: y, head: [], body: kpiRows,
      theme: "grid", styles: { fontSize: 8, cellPadding: 3, halign: "center" },
      columnStyles: { 0: { fontStyle: "bold" }, 2: { fontStyle: "bold" } },
    });
    y = doc.lastAutoTable.finalY + 8;

    if (momData) {
      doc.setFontSize(9); doc.setFont("helvetica", "bold");
      doc.text(`COMPARATIVO: ${fmtMes(mesAtual)} vs ${fmtMes(mesAnterior)}`, 14, y); y += 5;
      autoTable(doc, {
        startY: y, head: [["Indicador", "Atual", "Anterior", "Variação"]],
        body: momData.map(d => [d.label, String(d.atual), String(d.anterior), `${d.variacao > 0 ? "+" : ""}${d.variacao}%`]),
        headStyles: { fillColor: [0, 36, 112], textColor: 255, fontSize: 7 },
        bodyStyles: { fontSize: 7 }, theme: "grid",
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (chartRef.current && y < 200) {
      try {
        const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: isDark ? "#0A0A0F" : "#F5F0E8", useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const remaining = 280 - y;
        const imgW = 182;
        const imgH = Math.min((canvas.height / canvas.width) * imgW, remaining);
        doc.addImage(imgData, "PNG", 14, y, imgW, imgH);
      } catch {}
    }

    doc.save("Resumo_Cultos.pdf");
  }

  /* ── Helpers ──────────────────────────────────────────────────────── */
  function variacao(v1, v2) { if (!v2) return v1 > 0 ? 100 : 0; return Math.round(((v1 - v2) / v2) * 100); }
  function aplicarPreset(preset) {
    const now = new Date(); const y = now.getFullYear(); const m = String(now.getMonth() + 1).padStart(2, "0"); const ym = `${y}-${m}`;
    const ultimoDia = new Date(y, now.getMonth() + 1, 0).getDate();
    const pma = new Date(y, now.getMonth() - 1, 1); const ymA = `${pma.getFullYear()}-${String(pma.getMonth() + 1).padStart(2, "0")}`;
    const udm = new Date(y, now.getMonth(), 0).getDate();
    switch (preset) {
      case "este_mes": setDataInicio(`${ym}-01`); setDataFim(`${ym}-${ultimoDia}`); break;
      case "mes_anterior": setDataInicio(`${ymA}-01`); setDataFim(`${ymA}-${udm}`); break;
      case "este_ano": setDataInicio(`${y}-01-01`); setDataFim(`${y}-12-31`); break;
      case "ultimo_ano": setDataInicio(`${y - 1}-01-01`); setDataFim(`${y - 1}-12-31`); break;
      case "ultimos_90": { const d = new Date(); d.setDate(d.getDate() - 90); setDataInicio(d.toISOString().slice(0, 10)); setDataFim(`${y}-${m}-${String(now.getDate()).padStart(2, "0")}`); break; }
      default: setDataInicio(""); setDataFim("");
    }
  }
  const limparFiltros = () => { setBusca(""); setDataInicio(""); setDataFim(""); setFiltroTipo("Todos"); setFiltroPreg(""); setFiltroCamp(""); setFiltroDiacon(""); };
  const temFiltro = busca || dataInicio || dataFim || filtroTipo !== "Todos" || filtroPreg || filtroCamp || filtroDiacon;

  /* ── Loading ──────────────────────────────────────────────────────── */
  if (loading) return <TelaCarregando isDark={isDark} texto="Carregando cultos…" minHeight="60vh" background="transparent" />;

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ color: t.text, fontFamily: "'Inter',sans-serif", paddingBottom: 48 }}>
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "20px 16px 0" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
          *, *::before, *::after { box-sizing: border-box; }
          .disc-input{width:100%;background:${t.bgInput};border:1px solid ${t.borderInput};color:${t.text};padding:11px 14px 11px 40px;border-radius:11px;outline:none;font-family:'Inter',sans-serif;font-size:14px;font-weight:300;transition:border-color .25s;-webkit-appearance:none}
          .disc-input:focus{border-color:${t.gold}80}.disc-input::placeholder{color:${t.placeholder}}
          .disc-date{flex:1;min-width:130px;background:${t.bgInput};border:1px solid ${t.borderInput};color:${t.text};padding:10px 12px;border-radius:11px;outline:none;font-family:'Inter',sans-serif;font-size:13px;transition:border-color .25s;-webkit-appearance:none}
          .disc-date:focus{border-color:${t.gold}80}
          .disc-btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:0 14px;height:36px;border-radius:100px;border:1px solid ${t.border};cursor:pointer;background:transparent;color:${t.textSec};font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;transition:border-color .2s,color .2s;white-space:nowrap}
          .disc-btn-ghost:hover{border-color:${t.gold};color:${t.gold}}
          .disc-btn-blue{display:inline-flex;align-items:center;gap:6px;padding:0 16px;height:36px;border-radius:100px;border:none;cursor:pointer;background:linear-gradient(135deg,${AURA.blueDark},${AURA.blue});color:#fff;font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;transition:opacity .2s,transform .2s;box-shadow:0 5px 18px ${AURA.blue}40;white-space:nowrap}
          .disc-btn-blue:hover{opacity:.9;transform:translateY(-1px)}.disc-btn-blue:disabled{opacity:.4;cursor:not-allowed}
          .disc-select{background:${t.bgInput};border:1px solid ${t.borderInput};color:${t.text};padding:6px 10px;border-radius:8px;font-family:'Inter',sans-serif;font-size:12px;font-weight:500;cursor:pointer;outline:none;-webkit-appearance:none;appearance:none}
          .disc-select option{background:${t.bgEl};color:${t.text}}
          .disc-modal-overlay{position:fixed;inset:0;z-index:9999;background:${isDark?"rgba(10,10,15,.72)":"rgba(245,240,232,.72)"};backdrop-filter:blur(20px) saturate(140%);-webkit-backdrop-filter:blur(20px) saturate(140%);display:flex;align-items:flex-start;justify-content:center;padding:env(safe-area-inset-top,16px) 0 0;overflow-y:auto;-webkit-overflow-scrolling:touch}
          .disc-modal{width:100%;max-width:820px;margin:0 auto;background:${t.bg};border:1px solid ${t.border};overflow:hidden;display:flex;flex-direction:column;min-height:100%}
          @media(min-width:640px){.disc-modal-overlay{padding:env(safe-area-inset-top,24px) 16px 24px}.disc-modal{border-radius:24px;min-height:auto;margin-top:3vh}}
          .disc-modal-header{padding:18px 16px 16px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;border-bottom:1px solid ${t.border}}
          @media(min-width:640px){.disc-modal-header{padding:22px 26px 20px}}
          .disc-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:14px 16px;border-bottom:1px solid ${t.border}}
          @media(min-width:640px){.disc-kpis{gap:10px;padding:18px 26px}}
          @media(max-width:380px){.disc-kpis{grid-template-columns:1fr 1fr}.disc-kpis>div:last-child{grid-column:1/-1}}
          .disc-modal-footer{display:flex;gap:10px;padding:16px;border-top:1px solid ${t.border};margin-top:auto}
          @media(min-width:640px){.disc-modal-footer{padding:18px 26px}}@media(max-width:400px){.disc-modal-footer{flex-direction:column}}
        `}</style>

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: `linear-gradient(135deg, ${AURA.gold}20, ${AURA.gold}08)`, border: `1px solid ${AURA.gold}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Church size={20} style={{ color: AURA.gold }} />
            </div>
            <div>
              <p style={{ fontSize: 9, letterSpacing: ".2em", fontWeight: 600, color: `${t.gold}88`, margin: "0 0 3px", textTransform: "uppercase" }}>Pastoral · Dashboard</p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(17px,4vw,23px)", fontWeight: 500, margin: 0, color: t.text }}>Cultos</h2>
            </div>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <button className="disc-btn-ghost" onClick={() => setShowFilter(s => !s)}><Filter size={13} /> {showFilter ? "Ocultar" : "Filtros"}</button>
            <button className="disc-btn-ghost" onClick={() => setShowRanking(s => !s)}><Trophy size={13} /> Ranking</button>
            <button className="disc-btn-ghost" onClick={() => setShowTipoComp(s => !s)} style={{ borderColor: `${AURA.purple}40`, color: AURA.purple }}><BarChart2 size={13} /> Tipos</button>
            <button className="disc-btn-ghost" onClick={() => setShowComparativo(s => !s)} style={{ borderColor: `${AURA.green}40`, color: AURA.green }}><GitCompareArrows size={13} /> Comparar</button>
            <button className="disc-btn-ghost" onClick={() => setShowHeatmap(s => !s)} style={{ borderColor: `${AURA.orange}40`, color: AURA.orange }}><Flame size={13} /> Heatmap</button>
            <button className="disc-btn-ghost" onClick={() => setShowMetas(s => !s)} style={{ borderColor: `${AURA.yellow}40`, color: AURA.yellow }}><Target size={13} /> Metas</button>
            {campanhaStats && <button className="disc-btn-ghost" onClick={() => setShowCampanha(s => !s)} style={{ borderColor: `${AURA.yellow}40`, color: AURA.yellow }}><Megaphone size={13} /> Campanhas</button>}
            <button className="disc-btn-ghost" onClick={carregarCultos}><RefreshCw size={13} /></button>
            <button className="disc-btn-blue" onClick={gerarPDFComGraficos} disabled={!filtrados.length}><Download size={13} /> PDF</button>
            <button className="disc-btn-ghost" onClick={gerarPDFResumo} disabled={!filtrados.length} style={{ borderColor: `${AURA.green}40`, color: AURA.green }}><Printer size={13} /> Resumo</button>
          </div>
        </motion.div>

        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${t.gold}50, transparent)`, margin: "18px 0" }} />

        {erro && (
          <div style={{ padding: "14px 16px", borderRadius: 13, marginBottom: 18, background: `${AURA.red}10`, border: `1px solid ${AURA.red}28`, display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={15} style={{ color: AURA.red, flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: AURA.red, margin: 0 }}>{erro.msg}</p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
           KPI DASHBOARD — MoM COMPARISON
        ══════════════════════════════════════════════════════════════════ */}
        {momData && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <TrendingUp size={14} style={{ color: AURA.green }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: t.textSec }}>
                {fmtMes(mesAtual)} vs {fmtMes(mesAnterior)}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
              {momData.map((k, i) => (
                <div key={i} style={{ padding: "14px 14px", borderRadius: 14, background: t.bgEl, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 6, boxShadow: `0 2px 10px rgba(0,0,0,${isDark ? ".15" : ".04"})` }}>
                  <span style={{ fontSize: 9, letterSpacing: ".1em", color: t.textMuted, fontWeight: 700, textTransform: "uppercase" }}>{k.label}</span>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 26, fontWeight: 700, color: k.color, margin: 0, lineHeight: 1, fontFamily: "'Playfair Display',serif" }}>{k.atual}</p>
                    <VarBadge v={k.variacao} t={t} />
                  </div>
                  <p style={{ fontSize: 10, color: t.textMuted, margin: 0 }}>mês anterior: {k.anterior}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
           DESTAQUES — RECORDE E QUEDA
        ══════════════════════════════════════════════════════════════════ */}
        {destaques && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10, marginBottom: 20 }}>
            <div style={{ padding: "16px", borderRadius: 14, background: `linear-gradient(135deg, ${AURA.gold}08, ${AURA.yellow}04)`, border: `1px solid ${AURA.gold}25` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Trophy size={14} style={{ color: AURA.gold }} />
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: AURA.gold }}>RECORDE</span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 4px" }}>{destaques.recorde.tipoCulto || "Culto"} — {fmtData(destaques.recorde.data)}</p>
              <p style={{ fontSize: 12, color: t.textSec, margin: "0 0 6px" }}>{destaques.recorde.pregador || "—"} · {destaques.recorde.textoPregado || ""}</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: AURA.gold, margin: 0, fontFamily: "'Playfair Display',serif" }}>{somaTotais(destaques.recorde)} <span style={{ fontSize: 11, fontWeight: 400, color: t.textMuted }}>pessoas</span></p>
            </div>
            {destaques.quedas.length > 0 && (
              <div style={{ padding: "16px", borderRadius: 14, background: `linear-gradient(135deg, ${AURA.red}06, rgba(200,16,46,.02))`, border: `1px solid ${AURA.red}20` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <AlertTriangle size={14} style={{ color: AURA.red }} />
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: AURA.red }}>QUEDA DETECTADA</span>
                </div>
                {destaques.quedas.map((q, i) => (
                  <div key={i} style={{ marginBottom: i < destaques.quedas.length - 1 ? 8 : 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: "0 0 2px" }}>
                      Culto de {q.tipo}: {fmtData(q.culto.data)}
                    </p>
                    <p style={{ fontSize: 11, color: t.textSec, margin: 0 }}>
                      {somaTotais(q.culto)} pessoas · média: {q.media} · queda de {q.culto.quedaPct || "?"}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
           ALERTAS DE QUEDA CONSECUTIVA
        ══════════════════════════════════════════════════════════════════ */}
        {alertas.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 18 }}>
            <div style={{ padding: "12px 16px", borderRadius: 14, background: `${AURA.orange}08`, border: `1px solid ${AURA.orange}25`, display: "flex", alignItems: "flex-start", gap: 10 }}>
              <AlertTriangle size={16} style={{ color: AURA.orange, flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: AURA.orange, margin: "0 0 4px", letterSpacing: ".08em", textTransform: "uppercase" }}>Alertas de Queda Consecutiva</p>
                {alertas.map((a, i) => (
                  <p key={i} style={{ fontSize: 12, color: t.textSec, margin: "2px 0" }}>
                    <strong style={{ color: t.text }}>{a.tipo}</strong> — queda de {a.quedaPct}% nas últimas edições (média: {a.media})
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
           METAS DE CRESCIMENTO
        ══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showMetas && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }} style={{ overflow: "hidden", marginBottom: 18 }}>
              <PanelCard t={t} isDark={isDark}>
                <SectionHeader icon={Target} iconColor={AURA.yellow} title="Metas de Crescimento" subtitle={`Meta para ${fmtMes(mesAtual) || "mês atual"}`} bgTint={isDark ? "rgba(253,184,19,.03)" : "rgba(253,184,19,.05)"} t={t} />
                <div style={{ padding: "16px 18px" }}>
                  {metaStats.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, marginBottom: 16 }}>
                      {metaStats.map((m, i) => (
                        <div key={i} style={{ padding: "14px", borderRadius: 14, background: t.bgInput, border: `1px solid ${t.border}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: t.text }}>{m.tipo}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: m.pct >= 100 ? AURA.green : m.pct >= 70 ? AURA.yellow : AURA.red }}>{m.pct}%</span>
                          </div>
                          <ProgressBar value={m.atual} max={m.meta} color={m.pct >= 100 ? AURA.green : m.pct >= 70 ? AURA.yellow : AURA.red} />
                          <p style={{ fontSize: 10, color: t.textMuted, margin: "6px 0 0" }}>{m.atual} / {m.meta} pessoas</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <label style={{ fontSize: 9, letterSpacing: ".12em", fontWeight: 700, color: t.textMuted, textTransform: "uppercase", marginBottom: 4, display: "block" }}>Tipo</label>
                      <select className="disc-select" value={metaEditTipo} onChange={e => setMetaEditTipo(e.target.value)} style={{ width: "100%", padding: "8px 10px", fontSize: 12 }}>
                        <option value="">Selecione…</option>
                        {["Vitória", "Santa Ceia", "Celebração", "Missões", "Outro"].map(tc => <option key={tc} value={tc}>{tc}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <label style={{ fontSize: 9, letterSpacing: ".12em", fontWeight: 700, color: t.textMuted, textTransform: "uppercase", marginBottom: 4, display: "block" }}>Meta (pessoas)</label>
                      <input type="number" className="disc-input" value={metaEditValor} onChange={e => setMetaEditValor(e.target.value)} placeholder="Ex: 300" style={{ padding: "8px 12px", fontSize: 12 }} />
                    </div>
                    <button onClick={salvarMeta} className="disc-btn-blue" style={{ height: 36 }}><Target size={13} /> Definir</button>
                  </div>
                </div>
              </PanelCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════════
           FILTROS
        ══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showFilter && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }} style={{ overflow: "hidden", marginBottom: 18 }}>
              <PanelCard t={t} isDark={isDark}>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, background: isDark ? "rgba(201,169,110,.03)" : "rgba(201,169,110,.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Filter size={14} style={{ color: AURA.gold }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: t.textSec }}>Filtros Avançados</span>
                  </div>
                  {temFiltro && <button onClick={limparFiltros} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, border: `1px solid ${AURA.red}30`, background: `${AURA.red}08`, cursor: "pointer", color: AURA.red, fontSize: 9, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}><X size={10} /> Limpar</button>}
                </div>
                <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <p style={{ fontSize: 9, letterSpacing: ".14em", fontWeight: 700, color: t.textMuted, margin: "0 0 8px", textTransform: "uppercase" }}>Atalhos</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[{ k: "este_mes", l: "Este Mês" }, { k: "mes_anterior", l: "Mês Anterior" }, { k: "ultimos_90", l: "Últimos 90 dias" }, { k: "este_ano", l: "Este Ano" }, { k: "ultimo_ano", l: "Último Ano" }].map(p => (
                        <button key={p.k} onClick={() => aplicarPreset(p.k)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${t.borderInput}`, background: t.bgInput, color: t.textSec, fontSize: 11, fontWeight: 500, cursor: "pointer", transition: "all .2s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = AURA.gold; e.currentTarget.style.color = AURA.gold; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = t.borderInput; e.currentTarget.style.color = t.textSec; }}>{p.l}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ position: "relative" }}>
                    <Search size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: t.gold, opacity: .5, pointerEvents: "none" }} />
                    <input className="disc-input" placeholder="Buscar por pregador, texto ou campanha…" value={busca} onChange={e => setBusca(e.target.value)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                    <div><label style={{ fontSize: 9, letterSpacing: ".12em", fontWeight: 700, color: t.textMuted, textTransform: "uppercase", marginBottom: 5, display: "block" }}>Data Início</label><input className="disc-date" type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} style={{ width: "100%" }} /></div>
                    <div><label style={{ fontSize: 9, letterSpacing: ".12em", fontWeight: 700, color: t.textMuted, textTransform: "uppercase", marginBottom: 5, display: "block" }}>Data Fim</label><input className="disc-date" type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} style={{ width: "100%" }} /></div>
                    <div><label style={{ fontSize: 9, letterSpacing: ".12em", fontWeight: 700, color: t.textMuted, textTransform: "uppercase", marginBottom: 5, display: "block" }}>Tipo</label><select className="disc-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{ width: "100%" }}>{TIPOS_CULTO.map(tc => <option key={tc} value={tc}>{tc}</option>)}</select></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                    {pregadores.length > 0 && <div><label style={{ fontSize: 9, letterSpacing: ".12em", fontWeight: 700, color: t.textMuted, textTransform: "uppercase", marginBottom: 5, display: "block" }}>Pregador</label><select className="disc-select" value={filtroPreg} onChange={e => setFiltroPreg(e.target.value)} style={{ width: "100%" }}><option value="">Todos</option>{pregadores.map(p => <option key={p} value={p}>{p}</option>)}</select></div>}
                    {campanhas.length > 0 && <div><label style={{ fontSize: 9, letterSpacing: ".12em", fontWeight: 700, color: t.textMuted, textTransform: "uppercase", marginBottom: 5, display: "block" }}>Campanha</label><select className="disc-select" value={filtroCamp} onChange={e => setFiltroCamp(e.target.value)} style={{ width: "100%" }}><option value="">Todas</option>{campanhas.map(c => <option key={c} value={c}>{c}</option>)}</select></div>}
                    {diaconos.length > 0 && <div><label style={{ fontSize: 9, letterSpacing: ".12em", fontWeight: 700, color: t.textMuted, textTransform: "uppercase", marginBottom: 5, display: "block" }}>Diácono</label><select className="disc-select" value={filtroDiacon} onChange={e => setFiltroDiacon(e.target.value)} style={{ width: "100%" }}><option value="">Todos</option>{diaconos.map(d => <option key={d} value={d}>{d}</option>)}</select></div>}
                  </div>
                </div>
              </PanelCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════════
           RANKING DE PREGADORES
        ══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showRanking && rankingPregadores.length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }} style={{ overflow: "hidden", marginBottom: 18 }}>
              <PanelCard t={t} isDark={isDark}>
                <SectionHeader icon={Trophy} iconColor={AURA.gold} title="Ranking de Pregadores" subtitle={`${rankingPregadores.length} pregador${rankingPregadores.length !== 1 ? "es" : ""} · ${filtrados.length} culto${filtrados.length !== 1 ? "s" : ""}`} bgTint={isDark ? "rgba(201,169,110,.03)" : "rgba(201,169,110,.05)"} t={t} />
                <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {rankingPregadores.map((p, i) => (
                    <div key={p.nome} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: i === 0 ? `linear-gradient(135deg, ${AURA.gold}08, ${AURA.yellow}04)` : "transparent", border: i === 0 ? `1px solid ${AURA.gold}25` : `1px solid transparent`, transition: "all .2s" }}
                      onMouseEnter={e => { if (i > 0) e.currentTarget.style.background = t.bgInput; }}
                      onMouseLeave={e => { if (i > 0) e.currentTarget.style.background = "transparent"; }}>
                      {i < 3 ? <Medalha posicao={i} size={34} /> : <span style={{ width: 34, height: 34, borderRadius: 10, background: t.bgInput, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: t.textMuted, flexShrink: 0 }}>{i + 1}</span>}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nome}</p>
                          <p style={{ fontSize: 15, fontWeight: 700, color: i === 0 ? AURA.gold : t.text, margin: 0, fontFamily: "'Playfair Display',serif", flexShrink: 0 }}>{p.total}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 5, borderRadius: 3, background: t.border, overflow: "hidden" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ duration: .6, delay: i * .05 }} style={{ height: "100%", borderRadius: 3, background: i === 0 ? `linear-gradient(90deg, ${AURA.gold}, ${AURA.yellow})` : i === 1 ? "linear-gradient(90deg, #C0C0C0, #A0A0A0)" : i === 2 ? "linear-gradient(90deg, #CD7F32, #A0522D)" : `linear-gradient(90deg, ${AURA.blue}60, ${AURA.blue})` }} />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, flexShrink: 0 }}>{p.qtd} culto{p.qtd !== 1 ? "s" : ""}</span>
                        </div>
                        <p style={{ fontSize: 10, color: t.textMuted, margin: "3px 0 0" }}>Média de {p.media} por culto</p>
                      </div>
                    </div>
                  ))}
                </div>
              </PanelCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════════
           COMPARAÇÃO POR TIPO — BARRAS AGRUPADAS + PIE
        ══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showTipoComp && tipoCompData.length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }} style={{ overflow: "hidden", marginBottom: 18 }}>
              <PanelCard t={t} isDark={isDark}>
                <SectionHeader icon={BarChart2} iconColor={AURA.purple} title="Comparação por Tipo de Culto" subtitle="Qual tipo atrai mais gente historicamente" bgTint={isDark ? "rgba(139,92,246,.03)" : "rgba(139,92,246,.05)"} t={t} />
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div ref={tipoChartRef}>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={tipoCompData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                          <XAxis dataKey="tipo" tick={{ fontSize: 10, fill: t.textMuted }} />
                          <YAxis tick={{ fontSize: 10, fill: t.textMuted }} />
                          <Tooltip content={<ChartTooltip t={t} />} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Bar dataKey="membros" name="Membros" fill={AURA.blue} radius={[3,3,0,0]} />
                          <Bar dataKey="visitantes" name="Visitantes" fill={AURA.gold} radius={[3,3,0,0]} />
                          <Bar dataKey="criancas" name="Crianças" fill={AURA.purple} radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div ref={pieChartRef}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: t.textMuted, textAlign: "center", marginBottom: 8 }}>Proporção Membros × Visitantes</p>
                      <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                          <Pie data={pieData} dataKey="membros" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill={AURA.blue} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
                            {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip content={<ChartTooltip t={t} />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {/* Tabela resumo */}
                  <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                    {tipoCompData.map((d, i) => (
                      <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: `${TIPO_CORES[d.tipo]}08`, border: `1px solid ${TIPO_CORES[d.tipo]}20`, textAlign: "center" }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: TIPO_CORES[d.tipo], margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".08em" }}>{d.tipo}</p>
                        <p style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: 0, fontFamily: "'Playfair Display',serif" }}>{d.total}</p>
                        <p style={{ fontSize: 9, color: t.textMuted, margin: "2px 0 0" }}>{d.qtd} culto{d.qtd !== 1 ? "s" : ""} · média {d.media}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </PanelCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════════
           HEATMAP
        ══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showHeatmap && heatmapData.maxVal > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }} style={{ overflow: "hidden", marginBottom: 18 }}>
              <PanelCard t={t} isDark={isDark}>
                <SectionHeader icon={Flame} iconColor={AURA.orange} title="Heatmap de Presença" subtitle="Média de presença por dia da semana × semana do mês" bgTint={isDark ? "rgba(249,115,22,.03)" : "rgba(249,115,22,.05)"} t={t} />
                <div ref={heatmapRef} style={{ padding: "16px 18px", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 4 }}>
                    <thead>
                      <tr>
                        <th style={{ fontSize: 9, color: t.textMuted, padding: "4px 8px", textAlign: "left", fontWeight: 700, letterSpacing: ".08em" }}></th>
                        {[1, 2, 3, 4, 5].map(w => <th key={w} style={{ fontSize: 9, color: t.textMuted, padding: "4px 8px", textAlign: "center", fontWeight: 700, letterSpacing: ".08em" }}>{w}ª Sem</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {DIAS_SEMANA.map((dia, di) => (
                        <tr key={di}>
                          <td style={{ fontSize: 10, fontWeight: 600, color: t.textSec, padding: "4px 8px", whiteSpace: "nowrap" }}>{dia}</td>
                          {[0, 1, 2, 3, 4].map(sem => {
                            const val = heatmapData.avgs[di][sem];
                            const intensity = heatmapData.maxVal > 0 ? val / heatmapData.maxVal : 0;
                            const bg = intensity === 0 ? (isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.03)") : `rgba(201,169,110,${0.08 + intensity * 0.55})`;
                            return (
                              <td key={sem} style={{ padding: "8px 6px", textAlign: "center", borderRadius: 6, background: bg, transition: "background .2s" }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: intensity > 0.5 ? "#fff" : t.text, margin: 0, fontFamily: "'Playfair Display',serif" }}>{val || "—"}</p>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
                    <span style={{ fontSize: 9, color: t.textMuted }}>Menos</span>
                    {[0.1, 0.25, 0.4, 0.55].map((o, i) => <div key={i} style={{ width: 18, height: 12, borderRadius: 3, background: `rgba(201,169,110,${o})` }} />)}
                    <span style={{ fontSize: 9, color: t.textMuted }}>Mais</span>
                  </div>
                </div>
              </PanelCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════════
           COMPARATIVO MENSAL (MANUAL)
        ══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showComparativo && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }} style={{ overflow: "hidden", marginBottom: 18 }}>
              <PanelCard t={t} isDark={isDark}>
                <SectionHeader icon={GitCompareArrows} iconColor={AURA.green} title="Comparativo Mensal" subtitle="Compare dois meses lado a lado" bgTint={isDark ? "rgba(22,163,74,.03)" : "rgba(22,163,74,.05)"} t={t} />
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div><label style={{ fontSize: 9, letterSpacing: ".12em", fontWeight: 700, color: AURA.blue, textTransform: "uppercase", marginBottom: 6, display: "block" }}>Mês 1</label>
                      <select className="disc-select" value={mes1} onChange={e => setMes1(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 13 }}><option value="">Selecione…</option>{mesesDisponiveis.map(ym => <option key={ym} value={ym}>{fmtMes(ym)}</option>)}</select></div>
                    <div><label style={{ fontSize: 9, letterSpacing: ".12em", fontWeight: 700, color: AURA.gold, textTransform: "uppercase", marginBottom: 6, display: "block" }}>Mês 2</label>
                      <select className="disc-select" value={mes2} onChange={e => setMes2(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 13 }}><option value="">Selecione…</option>{mesesDisponiveis.map(ym => <option key={ym} value={ym}>{fmtMes(ym)}</option>)}</select></div>
                  </div>
                  {!mes1 || !mes2 ? (
                    <div style={{ textAlign: "center", padding: "28px 16px" }}><GitCompareArrows size={28} style={{ color: `${t.gold}25`, margin: "0 auto 8px" }} /><p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>Selecione dois meses</p></div>
                  ) : comparativoData ? (
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))", gap: 10, marginBottom: 16 }}>
                        {comparativoData.map((row, i) => {
                          const v = variacao(row.v1, row.v2);
                          return (
                            <div key={i} style={{ padding: "12px", borderRadius: 12, background: t.bgInput, border: `1px solid ${t.border}` }}>
                              <span style={{ fontSize: 9, letterSpacing: ".1em", color: t.textMuted, fontWeight: 700, textTransform: "uppercase" }}>{row.label}</span>
                              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 4, gap: 6 }}>
                                <div><p style={{ fontSize: 9, color: AURA.blue, margin: "0 0 1px", fontWeight: 600 }}>{fmtMes(mes1).split(" ")[0]?.slice(0, 3)}</p><p style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: 0, fontFamily: "'Playfair Display',serif" }}>{row.v1}</p></div>
                                <div style={{ textAlign: "right" }}><p style={{ fontSize: 9, color: AURA.gold, margin: "0 0 1px", fontWeight: 600 }}>{fmtMes(mes2).split(" ")[0]?.slice(0, 3)}</p><p style={{ fontSize: 20, fontWeight: 700, color: t.textSec, margin: 0, fontFamily: "'Playfair Display',serif" }}>{row.v2}</p></div>
                              </div>
                              <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}><VarBadge v={v} t={t} /></div>
                            </div>
                          );
                        })}
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={comparativoData.filter(r => r.label !== "Qtd Cultos")} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: t.textMuted }} />
                          <YAxis tick={{ fontSize: 10, fill: t.textMuted }} />
                          <Tooltip content={<ChartTooltip t={t} />} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Bar dataKey="v1" name={fmtMes(mes1)} fill={AURA.blue} radius={[4,4,0,0]} />
                          <Bar dataKey="v2" name={fmtMes(mes2)} fill={AURA.gold} radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : null}
                </div>
              </PanelCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════════
           CAMPANHAS
        ══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showCampanha && campanhaStats && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }} style={{ overflow: "hidden", marginBottom: 18 }}>
              <PanelCard t={t} isDark={isDark}>
                <SectionHeader icon={Megaphone} iconColor={AURA.yellow} title="Campanhas" bgTint={isDark ? "rgba(253,184,19,.03)" : "rgba(253,184,19,.05)"} t={t} />
                <div style={{ padding: "16px 18px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 10 }}>
                  {campanhaStats.map(c => (
                    <div key={c.nome} style={{ padding: "16px", borderRadius: 14, background: `${AURA.yellow}06`, border: `1px solid ${AURA.yellow}18`, transition: "all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${AURA.yellow}40`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${AURA.yellow}18`; e.currentTarget.style.transform = ""; }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: "0 0 10px" }}>{c.nome}</p>
                      <div style={{ display: "flex", gap: 18 }}>
                        {[{ l: "Cultos", v: c.cultos }, { l: "Média", v: c.media }, { l: "Total", v: c.total }].map((item, i) => (
                          <div key={i}><p style={{ fontSize: 8, letterSpacing: ".12em", color: t.textMuted, margin: 0, textTransform: "uppercase", fontWeight: 700 }}>{item.l}</p><p style={{ fontSize: 18, fontWeight: 700, color: AURA.yellow, margin: "2px 0 0", fontFamily: "'Playfair Display',serif" }}>{item.v}</p></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </PanelCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════════
           GRÁFICO DE EVOLUÇÃO
        ══════════════════════════════════════════════════════════════════ */}
        {chartData.length > 1 && (
          <div ref={chartRef} style={{ background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 18, padding: 16, marginBottom: 20, boxShadow: `0 4px 20px rgba(0,0,0,${isDark ? ".25" : ".06"})` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <BarChart2 size={16} style={{ color: AURA.blue }} />
              <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 500, color: t.text, margin: 0 }}>Evolução dos Totais</h4>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: t.textMuted }} />
                <YAxis tick={{ fontSize: 10, fill: t.textMuted }} />
                <Tooltip content={<ChartTooltip t={t} />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="membros" name="Membros" fill={AURA.blue} radius={[4,4,0,0]} />
                <Bar dataKey="visitantes" name="Visitantes" fill={AURA.gold} radius={[4,4,0,0]} />
                <Bar dataKey="criancas" name="Crianças" fill={AURA.purple} radius={[4,4,0,0]} />
                <Bar dataKey="total" name="Total" fill={AURA.green} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── BARRA DE ESTADO ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 13px", background: `${AURA.gold}14`, border: `1px solid ${AURA.gold}28`, borderRadius: 10 }}>
            <Church size={12} style={{ color: AURA.gold }} />
            <span style={{ fontSize: 9, letterSpacing: ".14em", color: AURA.gold, fontWeight: 700 }}>{filtrados.length} CULTO{filtrados.length !== 1 ? "S" : ""}</span>
          </div>
          {filtrados.length > PAGE_SIZES[0] && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 11, color: t.textMuted }}>Por página:</span>
              <div style={{ display: "flex", gap: 4 }}>
                {PAGE_SIZES.map(s => <button key={s} onClick={() => { setPageSize(s); setPage(0); }} style={{ width: 32, height: 28, borderRadius: 7, border: `1px solid ${pageSize === s ? AURA.gold : t.border}`, background: pageSize === s ? `${AURA.gold}18` : "transparent", color: pageSize === s ? AURA.gold : t.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>{s}</button>)}
              </div>
            </div>
          )}
        </div>

        {/* ── GRID DE CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          <AnimatePresence mode="popLayout">
            {paginaAtual.map((c, i) => {
              const tc = TIPO_CORES[c.tipoCulto] || TIPO_CORES["Outro"];
              const tot = somaTotais(c);
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} transition={{ delay: i * .04 }}
                  style={{ background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 18, overflow: "hidden", cursor: "pointer", transition: "transform .25s, border-color .25s, box-shadow .25s", position: "relative" }}
                  onClick={() => setSelected(c)}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = `${t.gold}55`; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,${isDark ? .35 : .1})`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = ""; }}>
                  <div style={{ height: 3, background: `linear-gradient(90deg, ${tc}, ${t.gold})` }} />
                  <div style={{ padding: "16px 16px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <span style={{ background: TIPO_BGS[c.tipoCulto] || TIPO_BGS["Outro"], color: tc, border: `1px solid ${TIPO_BORDERS[c.tipoCulto] || TIPO_BORDERS["Outro"]}`, borderRadius: 99, padding: "3px 10px", fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>{c.tipoCulto || "Culto"}</span>
                      <ChevronRight size={14} style={{ color: t.textMuted, flexShrink: 0 }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><Calendar size={11} style={{ color: t.gold, flexShrink: 0 }} /><span style={{ fontSize: 12, fontWeight: 300, color: t.textSec }}>{fmtData(c.data)}</span>{c.horario && (<><span style={{ fontSize: 12, color: t.textMuted }}>·</span><Clock size={11} style={{ color: t.gold, flexShrink: 0 }} /><span style={{ fontSize: 12, fontWeight: 300, color: t.textSec }}>{c.horario}</span></>)}</div>
                    {c.pregador && <p style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.pregador}</p>}
                    {c.textoPregado && <p style={{ fontSize: 11, fontWeight: 300, color: t.textSec, margin: "0 0 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontStyle: "italic" }}>"{c.textoPregado}"</p>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: `1px solid ${t.border}` }}>
                    <div style={{ padding: "10px 8px", textAlign: "center", borderRight: `1px solid ${t.border}` }}><p style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: 0, lineHeight: 1 }}>{c.quantidadeMembros || 0}</p><p style={{ fontSize: 7, letterSpacing: ".1em", color: t.textMuted, margin: "3px 0 0" }}>MEMBROS</p></div>
                    <div style={{ padding: "10px 8px", textAlign: "center", borderRight: `1px solid ${t.border}` }}><p style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: 0, lineHeight: 1 }}>{c.visitantesSimpatizantes || 0}</p><p style={{ fontSize: 7, letterSpacing: ".1em", color: t.textMuted, margin: "3px 0 0" }}>VISITANTES</p></div>
                    <div style={{ padding: "10px 8px", textAlign: "center" }}><p style={{ fontSize: 18, fontWeight: 700, color: AURA.blue, margin: 0, lineHeight: 1 }}>{tot}</p><p style={{ fontSize: 7, letterSpacing: ".1em", color: t.textMuted, margin: "3px 0 0" }}>TOTAL</p></div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── VAZIO ── */}
        {!erro && filtrados.length === 0 && (
          <div style={{ textAlign: "center", padding: "52px 24px", background: t.bgEl, borderRadius: 20, border: `2px dashed ${t.border}`, marginTop: 12 }}>
            <AlertCircle size={34} style={{ color: `${t.gold}40`, margin: "0 auto 12px" }} />
            <p style={{ fontSize: 13, fontWeight: 300, color: t.textMuted, margin: 0 }}>Nenhum culto encontrado.</p>
          </div>
        )}

        <Paginacao page={safePage} totalPages={totalPages} onChange={setPage} t={t} totalItems={filtrados.length} pageSize={pageSize} />

        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${t.gold}50, transparent)`, margin: "28px 0 0" }} />
        <p style={{ textAlign: "center", fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", paddingBottom: 16, color: isDark ? "rgba(245,240,232,.1)" : "rgba(26,16,8,.12)" }}></p>
      </div>

      <AnimatePresence>
        {selected && <ModalCulto culto={selected} isDark={isDark} t={t} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
    Users, Calendar, CheckCircle2, XCircle, ChevronRight, Filter, RotateCcw,
    Loader2, History, Star, AlertCircle, X, Building2, TrendingUp, Award,
} from "lucide-react";
import TelaCarregando from "../../components/TelaCarregando.jsx";

/* ─── Tokens AURA (mesmo padrão do PastorPage / PainelPastor) ─────────── */
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
    green:     "#1E7A4C",
    greenDark: "#125C39",
    purple:    "#5B2A6E",
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
        optionBg:    isDark ? "#12121A"                : "#F5F0E8",
    };
}

const BASE = "/api/acompanhamento/discipulado";

const TIPOS_ESTUDO = [
    { value: "ESTUDO_BIBLICO",          label: "Estudo Bíblico" },
    { value: "ACOMPANHAMENTO",          label: "Acompanhamento" },
    { value: "VIDA_CRISTA",             label: "Vida Cristã" },
    { value: "ORACAO",                  label: "Oração" },
    { value: "NOVO_CONVERTIDO",         label: "Novo Convertido" },
    { value: "LIDERANCA",               label: "Liderança" },
    { value: "FAMILIA",                 label: "Família" },
    { value: "RELACIONAMENTO_COM_DEUS", label: "Relacionamento com Deus" },
    { value: "OUTRO",                   label: "Outro" },
];
const labelTipoEstudo = (v) => TIPOS_ESTUDO.find((t) => t.value === v)?.label || v || "—";

function hoje() { return new Date().toISOString().slice(0, 10); }
function formatarDataBR(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
}
function extrairErro(err) {
    const data = err?.response?.data;
    if (data?.message) return data.message;
    if (data?.title) return data.title;
    return "Ocorreu um erro. Tente novamente.";
}

/* Normaliza o tipo do registro (INDIVIDUAL / COLETIVO).
   O campo "tipo" vindo do backend nem sempre é confiável, então usamos
   também o FORMATO do registro como sinal: registros coletivos trazem
   participantes/presentes; individuais trazem o nome do membro. Quando os
   dois sinais batem, ótimo; quando o formato é claro, ele tem prioridade
   sobre o campo "tipo" (que é o que estava causando a mistura na busca). */
function normalizarTipo(r) {
    const bruto = r?.tipo ? String(r.tipo).trim().toUpperCase() : "";
    const temParticipantes =
        r?.quantidadeParticipantes != null || r?.participantes != null || Array.isArray(r?.presentes);
    const temMembro = !!r?.membroNome;

    if (temParticipantes && !temMembro) return "COLETIVO";
    if (temMembro && !temParticipantes) return "INDIVIDUAL";
    if (bruto === "COLETIVO" || bruto === "INDIVIDUAL") return bruto;
    return temParticipantes ? "COLETIVO" : "INDIVIDUAL";
}

/* ════════════════════════════════════════════════════════════════════
   ESTILOS (prefixo "rdc-")
   ════════════════════════════════════════════════════════════════════ */
function GlobalStyles({ t, isDark }) {
    return (
        <style>{`
      @keyframes rdc-spin { to { transform: rotate(360deg); } }
      .rdc-spin { animation: rdc-spin 1s linear infinite; }

      .rdc-root{ font-family:'Inter',sans-serif; color:${t.text}; }

      .rdc-card {
        background:${t.bgEl}; border:1px solid ${t.border}; border-radius:18px; padding:18px;
        backdrop-filter:blur(10px);
      }

      .rdc-select-celula {
        display:flex; align-items:center; gap:10px; margin-bottom:18px; flex-wrap:wrap;
      }
      .rdc-select-celula select {
        flex:1; min-width:220px; padding:12px 14px; border-radius:12px; background:${t.bgInput};
        border:1px solid ${t.borderInput}; color:${t.text}; font-size:13.5px; font-family:'Inter',sans-serif; outline:none;
      }
      .rdc-select-celula select option{ background:${t.optionBg}; color:${t.text}; }

      .rdc-kpi-grid{ display:grid; grid-template-columns:repeat(1,1fr); gap:10px; margin-bottom:18px; }
      @media(min-width:480px){ .rdc-kpi-grid{ grid-template-columns:repeat(3,1fr); } }
      .rdc-kpi{ background:${t.bgEl}; border:1px solid ${t.border}; border-radius:16px; padding:14px; }
      .rdc-kpi-icon{ width:30px; height:30px; border-radius:9px; display:flex; align-items:center; justify-content:center; margin-bottom:8px; }
      .rdc-kpi-value{ font-size:22px; font-weight:700; color:${t.text}; margin:0 0 3px; }
      .rdc-kpi-label{ font-size:10px; color:${t.textMuted}; margin:0; font-weight:500; }

      .rdc-filters{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
      @media(min-width:640px){ .rdc-filters{ grid-template-columns:repeat(3,1fr); } }
      @media(min-width:900px){ .rdc-filters{ grid-template-columns:repeat(5,1fr); } }
      .rdc-field label{
        display:block; font-size:10px; font-weight:600; letter-spacing:.06em; text-transform:uppercase;
        color:${t.textMuted}; margin-bottom:5px;
      }
      .rdc-field input, .rdc-field select{
        width:100%; padding:9px 12px; border-radius:10px; background:${t.bgInput};
        border:1px solid ${t.borderInput}; color:${t.text}; font-size:12.5px; font-family:'Inter',sans-serif; outline:none;
      }
      .rdc-field select option{ background:${t.optionBg}; color:${t.text}; }

      .rdc-btn{
        display:inline-flex; align-items:center; gap:7px; padding:9px 15px; border-radius:100px; border:none;
        cursor:pointer; font-size:12px; font-weight:600; transition:all .2s;
      }
      .rdc-btn-primary{ background:linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue}); color:#fff; }
      .rdc-btn-primary:hover{ transform:translateY(-1px); }
      .rdc-btn-ghost{ background:${isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)"}; border:1px solid ${t.border}; color:${t.textSec}; }
      .rdc-btn-ghost:hover{ border-color:${AURA.gold}; color:${AURA.gold}; }
      .rdc-btn-danger{ background:rgba(200,16,46,.12); border:1px solid rgba(200,16,46,.35); color:#E88; }
      .rdc-btn-sm{ padding:7px 12px; font-size:11px; }

      .rdc-hist-head, .rdc-hist-row{
        display:grid; grid-template-columns:1fr 1fr 1fr 1fr 1fr; gap:8px; align-items:center; padding:11px 8px;
      }
      .rdc-hist-head{
        font-size:9.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:${t.textMuted};
        border-bottom:1px solid ${t.border};
      }
      .rdc-hist-row{ border-bottom:1px solid ${t.border}; font-size:12px; }
      .rdc-hist-row:last-child{ border-bottom:none; }
      .rdc-hist-cell-title{ font-size:10px; font-weight:700; color:${t.textMuted}; text-transform:uppercase; letter-spacing:.05em; margin-bottom:2px; display:none; }
      @media(max-width:820px){
        .rdc-hist-head{ display:none; }
        .rdc-hist-row{ grid-template-columns:1fr; gap:4px; border-radius:12px; background:${isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)"}; margin-bottom:8px; padding:12px; }
        .rdc-hist-cell-title{ display:block; }
      }

      .rdc-link{ color:${AURA.gold}; font-weight:600; cursor:pointer; text-decoration:underline; text-underline-offset:2px; }

      .rdc-badge{ display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:100px; font-size:10.5px; font-weight:700; }
      .rdc-badge-ok{ background:rgba(30,122,76,.15); color:${AURA.green}; }
      .rdc-badge-off{ background:rgba(200,16,46,.13); color:${AURA.red}; }
      .rdc-badge-ind{ background:rgba(0,61,165,.13); color:${AURA.blue}; }
      .rdc-badge-col{ background:rgba(91,42,110,.15); color:#A671C0; }

      .rdc-empty{ text-align:center; padding:36px 16px; color:${t.textMuted}; font-size:13px; display:flex; flex-direction:column; align-items:center; gap:10px; }
      .rdc-loading{ display:flex; align-items:center; justify-content:center; padding:60px 0; color:${t.textMuted}; }

      .rdc-overlay{ position:fixed; inset:0; z-index:200; background:rgba(0,0,0,.55); display:flex; align-items:flex-end; justify-content:center; backdrop-filter:blur(3px); }
      @media(min-width:640px){ .rdc-overlay{ align-items:center; padding:20px; } }
      .rdc-modal{
        background:${isDark ? "#12121A" : "#FBFAF6"}; width:100%; max-width:600px; max-height:92vh; overflow-y:auto;
        border-radius:22px 22px 0 0; border:1px solid ${t.border};
      }
      @media(min-width:640px){ .rdc-modal{ border-radius:22px; } }
      .rdc-modal-head{
        display:flex; align-items:center; justify-content:space-between; padding:20px 20px 14px;
        border-bottom:1px solid ${t.border}; position:sticky; top:0; background:${isDark ? "#12121A" : "#FBFAF6"};
      }
      .rdc-modal-title{ font-size:17px; font-weight:700; margin:0; color:${t.text}; }
      .rdc-modal-body{ padding:18px 20px 22px; }
      .rdc-close-btn{
        width:32px; height:32px; border-radius:50%; border:1px solid ${t.border}; background:transparent;
        color:${t.textMuted}; display:flex; align-items:center; justify-content:center; cursor:pointer;
      }
      .rdc-check-row{ display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:10px; }
      .rdc-checklist{ max-height:240px; overflow-y:auto; border:1px solid ${t.border}; border-radius:14px; padding:6px; }
    `}</style>
    );
}

/* ════════════════════════════════════════════════════════════════════
   MODAL genérico
   ════════════════════════════════════════════════════════════════════ */
function Modal({ title, onClose, children }) {
    return createPortal(
        <div className="rdc-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div
                className="rdc-modal"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: .25 }}
            >
                <div className="rdc-modal-head">
                    <h3 className="rdc-modal-title">{title}</h3>
                    <button className="rdc-close-btn" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="rdc-modal-body">{children}</div>
            </motion.div>
        </div>,
        document.body
    );
}

function KpiCard({ icon, value, label, color }) {
    return (
        <div className="rdc-kpi">
            <div className="rdc-kpi-icon" style={{ background: `${color}18`, color }}>{icon}</div>
            <p className="rdc-kpi-value">{value ?? 0}</p>
            <p className="rdc-kpi-label">{label}</p>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — RELATÓRIOS DE DISCIPULADO DAS CÉLULAS
   ════════════════════════════════════════════════════════════════════ */
export default function RelatoriosDiscipuladoCelulas({ isDark = true }) {
    const t = theme(isDark);

    const [celulas, setCelulas] = useState([]);
    const [celulaId, setCelulaId] = useState("");
    const [loadingCelulas, setLoadingCelulas] = useState(true);

    const [filtros, setFiltros] = useState({ dataInicio: "", dataFim: "", tipo: "", tema: "", tipoEstudo: "", mes: "" });
    const [lista, setLista] = useState([]);
    const [loadingHistorico, setLoadingHistorico] = useState(true);
    const [erroGeral, setErroGeral] = useState(null);

    const [coletivoAberto, setColetivoAberto] = useState(null);

    const carregarCelulas = useCallback(async () => {
        setLoadingCelulas(true);
        try {
            const res = await api.get(`${BASE}/pastor/celulas`);
            setCelulas(Array.isArray(res.data) ? res.data : (res.data?.content || []));
        } catch {
            setErroGeral("Não foi possível carregar as células.");
        } finally {
            setLoadingCelulas(false);
        }
    }, []);

    const carregarHistorico = useCallback(async () => {
        setLoadingHistorico(true);
        try {
            // Se um mês foi selecionado, convertemos para um intervalo de datas
            // (primeiro e último dia do mês), a menos que "De" / "Até" já tenham sido preenchidos manualmente.
            const filtrosEfetivos = { ...filtros };
            if (filtrosEfetivos.mes) {
                const [ano, mesNum] = filtrosEfetivos.mes.split("-");
                const ultimoDia = new Date(Number(ano), Number(mesNum), 0).getDate();
                if (!filtrosEfetivos.dataInicio) filtrosEfetivos.dataInicio = `${ano}-${mesNum}-01`;
                if (!filtrosEfetivos.dataFim) filtrosEfetivos.dataFim = `${ano}-${mesNum}-${String(ultimoDia).padStart(2, "0")}`;
            }
            delete filtrosEfetivos.mes;

            const params = {};
            Object.entries(filtrosEfetivos).forEach(([k, v]) => { if (v) params[k] = v; });
            if (celulaId) params.celulaId = celulaId;
            const res = await api.get(`${BASE}/pastor/historico`, { params });
            setLista(Array.isArray(res.data) ? res.data : (res.data?.content || []));
        } catch {
            setErroGeral("Não foi possível carregar o histórico de discipulado.");
        } finally {
            setLoadingHistorico(false);
        }
    }, [filtros, celulaId]);

    useEffect(() => { carregarCelulas(); }, [carregarCelulas]);
    useEffect(() => { carregarHistorico(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const celulaSelecionada = useMemo(() => celulas.find((c) => String(c.id) === String(celulaId)), [celulas, celulaId]);

    // Filtro de tipo (Individual / Coletivo) aplicado no cliente, garantindo que a busca
    // funcione corretamente mesmo que o backend não filtre por "tipo" corretamente.
    const listaFiltrada = useMemo(() => {
        if (!filtros.tipo) return lista;
        return lista.filter((r) => normalizarTipo(r) === filtros.tipo);
    }, [lista, filtros.tipo]);

    const totais = useMemo(() => {
        const individuais = listaFiltrada.filter((r) => normalizarTipo(r) === "INDIVIDUAL").length;
        const coletivos = listaFiltrada.filter((r) => normalizarTipo(r) === "COLETIVO").length;
        return { individuais, coletivos, total: listaFiltrada.length };
    }, [listaFiltrada]);

    const limparFiltros = () => setFiltros({ dataInicio: "", dataFim: "", tipo: "", tema: "", tipoEstudo: "", mes: "" });

    return (
        <div className="rdc-root">
            <GlobalStyles t={t} isDark={isDark} />

            <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: AURA.gold, opacity: .8, margin: "0 0 4px" }}>
                    Acompanhamento Pastoral
                </p>
                <h2 style={{ fontSize: "clamp(18px,4vw,23px)", fontWeight: 700, margin: 0, color: t.text }}>
                    Relatórios de Discipulado das Células
                </h2>
            </div>

            {erroGeral && (
                <div className="rdc-card" style={{ marginBottom: 16, borderColor: "rgba(200,16,46,.35)", display: "flex", gap: 8, alignItems: "center" }}>
                    <AlertCircle size={16} color={AURA.red} /> <span style={{ fontSize: 12.5, color: t.textSec }}>{erroGeral}</span>
                </div>
            )}

            <div className="rdc-card" style={{ marginBottom: 18 }}>
                <div className="rdc-select-celula">
                    <Building2 size={16} color={t.textMuted} style={{ flexShrink: 0 }} />
                    <select value={celulaId} onChange={(e) => setCelulaId(e.target.value)} disabled={loadingCelulas}>
                        <option value="">Todas as células</option>
                        {celulas.map((c) => (
                            <option key={c.id} value={c.id}>{c.nome} — {c.liderNome} ({c.qtdMembros} membros)</option>
                        ))}
                    </select>
                    <button className="rdc-btn rdc-btn-primary rdc-btn-sm" onClick={carregarHistorico}>
                        <Filter size={13} /> Aplicar
                    </button>
                </div>

                {celulaSelecionada && (
                    <p style={{ fontSize: 12, color: t.textSec, margin: 0 }}>
                        Exibindo dados de <strong style={{ color: t.text }}>{celulaSelecionada.nome}</strong>, liderada por <strong style={{ color: t.text }}>{celulaSelecionada.liderNome}</strong>.
                    </p>
                )}
            </div>

            <div className="rdc-kpi-grid">
                <KpiCard icon={<History size={15} />} value={totais.total} label="Registros no filtro" color={AURA.blue} />
                <KpiCard icon={<Users size={15} />} value={totais.individuais} label="Discipulados individuais" color={AURA.blue} />
                <KpiCard icon={<Users size={15} />} value={totais.coletivos} label="Discipulados coletivos" color={AURA.purple} />
            </div>

            <div className="rdc-card" style={{ marginTop: 4, marginBottom: 18 }}>
                <div className="rdc-filters">
                    <div className="rdc-field">
                        <label>Mês</label>
                        <input type="month" max={hoje().slice(0, 7)} value={filtros.mes} onChange={(e) => setFiltros((f) => ({ ...f, mes: e.target.value }))} />
                    </div>
                    <div className="rdc-field">
                        <label>De</label>
                        <input type="date" max={hoje()} value={filtros.dataInicio} onChange={(e) => setFiltros((f) => ({ ...f, dataInicio: e.target.value }))} />
                    </div>
                    <div className="rdc-field">
                        <label>Até</label>
                        <input type="date" max={hoje()} value={filtros.dataFim} onChange={(e) => setFiltros((f) => ({ ...f, dataFim: e.target.value }))} />
                    </div>
                    <div className="rdc-field">
                        <label>Tipo</label>
                        <select value={filtros.tipo} onChange={(e) => setFiltros((f) => ({ ...f, tipo: e.target.value }))}>
                            <option value="">Todos</option>
                            <option value="INDIVIDUAL">Individual</option>
                            <option value="COLETIVO">Coletivo</option>
                        </select>
                    </div>
                    <div className="rdc-field">
                        <label>Tema</label>
                        <input placeholder="Buscar por tema" value={filtros.tema} onChange={(e) => setFiltros((f) => ({ ...f, tema: e.target.value }))} />
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="rdc-btn rdc-btn-primary rdc-btn-sm" onClick={carregarHistorico}><Filter size={13} /> Filtrar</button>
                    <button className="rdc-btn rdc-btn-ghost rdc-btn-sm" onClick={limparFiltros}><RotateCcw size={13} /> Limpar</button>
                </div>
            </div>

            <div className="rdc-card">
                <div className="rdc-hist-head">
                    <span>Data</span>
                    <span>Tipo</span>
                    <span>Célula</span>
                    <span>Membro / Participantes</span>
                    <span>Tema · Líder · Status</span>
                </div>

                {loadingHistorico ? (
                    <TelaCarregando isDark={isDark} minHeight="40vh" background="transparent" />
                ) : listaFiltrada.length === 0 ? (
                    <div className="rdc-empty"><History size={26} /> Nenhum registro encontrado para os filtros aplicados.</div>
                ) : (
                    listaFiltrada.map((r, idx) => {
                        const tipoNormalizado = normalizarTipo(r);
                        return (
                            <div className="rdc-hist-row" key={r.id ?? idx}>
                                <div>
                                    <span className="rdc-hist-cell-title">Data</span>
                                    {formatarDataBR(r.data)}
                                </div>
                                <div>
                                    <span className="rdc-hist-cell-title">Tipo</span>
                                    <span className={`rdc-badge ${tipoNormalizado === "COLETIVO" ? "rdc-badge-col" : "rdc-badge-ind"}`}>
                            {tipoNormalizado === "COLETIVO" ? "Coletivo" : "Individual"}
                          </span>
                                </div>
                                <div>
                                    <span className="rdc-hist-cell-title">Célula</span>
                                    {r.celulaNome || r.celula || "—"}
                                </div>
                                <div>
                                    <span className="rdc-hist-cell-title">Membro / Participantes</span>
                                    {tipoNormalizado === "COLETIVO"
                                        ? <span className="rdc-link" onClick={() => setColetivoAberto(r.id)}>Coletivo · {r.quantidadeParticipantes ?? r.participantes ?? 0} participantes</span>
                                        : (r.membroNome || "—")}
                                </div>
                                <div>
                                    <span className="rdc-hist-cell-title">Tema · Líder · Status</span>
                                    <div style={{ fontWeight: 600, color: t.text }}>{r.tema || "—"}</div>
                                    <div style={{ fontSize: 11, color: t.textMuted, margin: "2px 0 4px" }}>{r.liderNome || "—"}</div>
                                    <span className={`rdc-badge ${r.status === "CANCELADO" ? "rdc-badge-off" : "rdc-badge-ok"}`}>
                            {r.status === "CANCELADO" ? "Cancelado" : "Concluído"}
                          </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <AnimatePresence>
                {coletivoAberto && (
                    <ColetivoDetalheModalPastor
                        t={t} id={coletivoAberto}
                        onClose={() => setColetivoAberto(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   MODAL — DETALHES DO COLETIVO (visão pastor)
   ════════════════════════════════════════════════════════════════════ */
function ColetivoDetalheModalPastor({ t, id, onClose }) {
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    const carregar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`${BASE}/coletivo/${id}`);
            setDados(res.data || {});
        } catch (err) {
            setErro(extrairErro(err));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { carregar(); }, [carregar]);

    const presentes = dados?.presentes || [];

    return (
        <Modal title="Detalhes do Encontro" onClose={onClose}>
            {loading ? (
                <div className="rdc-loading"><Loader2 size={22} className="rdc-spin" /></div>
            ) : erro ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center", color: AURA.red, fontSize: 13 }}>
                    <AlertCircle size={16} /> {erro}
                </div>
            ) : (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                        <div>
                            <p style={{ fontSize: 10, letterSpacing: ".05em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 3px" }}>Data / Horário</p>
                            <p style={{ margin: 0, fontWeight: 700, color: t.text }}>{formatarDataBR(dados?.data)} {dados?.horario ? `· ${dados.horario}` : ""}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 10, letterSpacing: ".05em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 3px" }}>Célula</p>
                            <p style={{ margin: 0, fontWeight: 700, color: t.text }}>{dados?.celulaNome || dados?.celula || "—"}</p>
                        </div>
                    </div>

                    <p style={{ fontSize: 10, letterSpacing: ".05em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 3px" }}>Tipo de estudo · Tema</p>
                    <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 15, color: t.text }}>
                        {dados?.tipoEstudoDescricao || labelTipoEstudo(dados?.tipoEstudo)} — {dados?.tema}
                    </p>

                    {dados?.local && (
                        <>
                            <p style={{ fontSize: 10, letterSpacing: ".05em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 3px" }}>Local</p>
                            <p style={{ margin: "0 0 12px", color: t.textSec, fontSize: 13 }}>{dados.local}</p>
                        </>
                    )}

                    {dados?.observacoes && (
                        <>
                            <p style={{ fontSize: 10, letterSpacing: ".05em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 3px" }}>Observações</p>
                            <p style={{ margin: "0 0 14px", color: t.textSec, fontSize: 13 }}>{dados.observacoes}</p>
                        </>
                    )}

                    <p style={{ fontSize: 12.5, color: t.textSec, margin: "0 0 14px" }}>
                        {dados?.quantidadePresentes ?? presentes.length} presentes
                    </p>

                    <p style={{ fontSize: 10, letterSpacing: ".05em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 8px" }}>
                        Presentes ({presentes.length})
                    </p>
                    <div className="rdc-checklist" style={{ marginBottom: 16 }}>
                        {presentes.map((p, idx) => (
                            <div key={p.membroId ?? idx} className="rdc-check-row">
                                <span style={{ width: 22, textAlign: "center", fontSize: 11, color: t.textMuted, fontWeight: 700 }}>{idx + 1}.</span>
                                <span style={{ fontSize: 13, color: t.text }}>{p.membroNome}</span>
                            </div>
                        ))}
                        {presentes.length === 0 && <p style={{ padding: 10, fontSize: 12, color: t.textMuted }}>Nenhum presente listado.</p>}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className={`rdc-badge ${dados?.status === "CANCELADO" ? "rdc-badge-off" : "rdc-badge-ok"}`}>
                  {dados?.status === "CANCELADO" ? "Cancelado" : "Concluído"}
                </span>
                    </div>
                </>
            )}
        </Modal>
    );
}
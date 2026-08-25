import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
    Users, UserCheck, CheckCircle2, XCircle,
    Plus, X, ChevronRight, ChevronLeft, Search, AlertCircle,
    Loader2, History, Filter, RotateCcw, Check,
    ClipboardList,
} from "lucide-react";
import { AURA, theme } from "./liderTheme";

/* ════════════════════════════════════════════════════════════════════
   CONSTANTES
   ════════════════════════════════════════════════════════════════════ */
const BASE = "/api/acompanhamento/discipulado";

const TIPOS_ESTUDO = [
    { value: "ESTUDO_BIBLICO",              label: "Estudo Bíblico" },
    { value: "ACOMPANHAMENTO",              label: "Acompanhamento" },
    { value: "VIDA_CRISTA",                 label: "Vida Cristã" },
    { value: "ORACAO",                      label: "Oração" },
    { value: "NOVO_CONVERTIDO",             label: "Novo Convertido" },
    { value: "LIDERANCA",                   label: "Liderança" },
    { value: "FAMILIA",                     label: "Família" },
    { value: "RELACIONAMENTO_COM_DEUS",     label: "Relacionamento com Deus" },
    { value: "OUTRO",                       label: "Outro" },
];
const labelTipoEstudo = (v) => TIPOS_ESTUDO.find((t) => t.value === v)?.label || v || "—";

const MSG_MEMBRO_JA_DISCIPULADO =
    "Este membro já foi discipulado nesta semana. Um novo discipulado individual poderá ser registrado somente na próxima semana.";

function hoje() {
    return new Date().toISOString().slice(0, 10);
}
function formatarDataBR(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
}
function extrairErro(err) {
    const data = err?.response?.data;
    if (data?.errorCode === "MEMBRO_JA_DISCIPULADO_SEMANA") return MSG_MEMBRO_JA_DISCIPULADO;
    if (err?.response?.status === 422) {
        const erros = data?.errors || data?.fieldErrors || data?.violations;
        if (Array.isArray(erros) && erros.length) {
            return erros.map((e) => e.mensagem || e.message || e.defaultMessage || JSON.stringify(e)).join(" · ");
        }
        if (erros && typeof erros === "object") return Object.values(erros).join(" · ");
    }
    if (data?.message) return data.message;
    if (data?.title) return data.title;
    return "Ocorreu um erro. Tente novamente.";
}

/* Títulos de cada tela do wizard */
const TITULOS = {
    escolha:              "Acompanhamento Membro",
    "individual-lista":   "Discipulado Individual",
    "individual-form":    "Registrar Discipulado Individual",
    "individual-historico": "Histórico do Membro",
    "coletivo-lista":     "Discipulado Coletivo",
    "coletivo-form":      "Registrar Discipulado Coletivo",
    "coletivo-detalhe":   "Detalhes do Encontro",
    "historico-geral":    "Histórico",
};

/* ════════════════════════════════════════════════════════════════════
   ESTILOS GLOBAIS (prefixo "ad-")
   ════════════════════════════════════════════════════════════════════ */
function GlobalStyles({ t, isDark }) {
    return (
        <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

      @keyframes ad-spin { to { transform: rotate(360deg); } }
      .ad-spin { animation: ad-spin 1s linear infinite; }

      .ad-root { font-family:'Inter',sans-serif; color:${t.text}; }

      .ad-card {
        background:${t.bgEl}; border:1px solid ${t.border}; border-radius:18px;
        padding:16px; backdrop-filter:blur(10px);
      }
      .ad-section-title { font-family:'Fraunces',serif; font-size:15px; font-weight:600; margin:0 0 4px; color:${t.text}; }
      .ad-section-sub { font-size:12px; color:${t.textMuted}; margin:0 0 14px; }

      /* Tela de escolha */
      .ad-choice-link {
        display:flex; align-items:center; justify-content:space-between; gap:8px;
        padding:16px; border-radius:16px; background:${t.bgEl}; border:1px solid ${t.border};
        cursor:pointer; margin-bottom:10px; transition:all .2s;
      }
      .ad-choice-link:hover { border-color:${AURA.gold}; transform:translateY(-1px); }
      .ad-choice-link:last-child{ margin-bottom:0; }
      .ad-choice-link-left { display:flex; align-items:center; gap:12px; }
      .ad-choice-icon {
        width:42px; height:42px; border-radius:13px; display:flex; align-items:center; justify-content:center;
        flex-shrink:0;
      }
      .ad-choice-name { font-family:'Fraunces',serif; font-size:14.5px; font-weight:600; color:${t.text}; margin:0 0 2px; }
      .ad-choice-desc { font-size:11px; color:${t.textMuted}; margin:0; }

      .ad-cta-row { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:18px; }
      .ad-btn {
        display:inline-flex; align-items:center; justify-content:center; gap:7px;
        padding:11px 16px; border-radius:100px; border:none; cursor:pointer;
        font-size:12.5px; font-weight:600; letter-spacing:.02em; transition:all .25s;
      }
      .ad-btn-primary {
        background:linear-gradient(135deg, ${AURA.mossDeep}, ${AURA.moss}); color:#fff;
        box-shadow:0 8px 22px rgba(30,63,102,.3);
      }
      .ad-btn-primary:hover{ transform:translateY(-1px); }
      .ad-btn-primary:disabled{ opacity:.45; cursor:not-allowed; transform:none; }
      .ad-btn-ghost {
        background:${isDark ? "rgba(255,255,255,.05)" : "rgba(30,63,102,.06)"};
        border:1px solid ${t.border}; color:${t.textSec};
      }
      .ad-btn-ghost:hover{ border-color:${AURA.gold}; color:${AURA.gold}; }
      .ad-btn-danger {
        background:rgba(158,42,43,.12); border:1px solid rgba(158,42,43,.35); color:${AURA.redLight};
      }
      .ad-btn-danger:hover{ background:rgba(158,42,43,.2); }
      .ad-btn-sm { padding:7px 13px; font-size:11.5px; }
      .ad-btn-block { width:100%; }

      .ad-search {
        display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:100px;
        background:${t.bgInput}; border:1px solid ${t.borderInput}; margin-bottom:14px;
      }
      .ad-search input {
        flex:1; background:transparent; border:none; outline:none; color:${t.text}; font-size:13px; font-family:'Inter',sans-serif;
      }
      .ad-search input::placeholder{ color:${t.placeholder}; }

      .ad-row {
        display:flex; align-items:center; justify-content:space-between; gap:10px;
        padding:12px 6px; border-bottom:1px solid ${t.border}; cursor:pointer; transition:background .2s;
      }
      .ad-row:last-child{ border-bottom:none; }
      .ad-row:hover{ background:${isDark ? "rgba(255,255,255,.025)" : "rgba(30,63,102,.03)"}; border-radius:12px; }
      .ad-row-left{ display:flex; align-items:center; gap:11px; min-width:0; flex:1; }
      .ad-avatar {
        width:36px; height:36px; border-radius:50%; flex-shrink:0;
        background:linear-gradient(135deg, ${AURA.mossDeep}, ${AURA.moss}); color:#fff;
        display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px;
        font-family:'Fraunces',serif;
      }
      .ad-row-name { font-size:13px; font-weight:600; color:${t.text}; margin:0 0 2px; }
      .ad-row-meta { font-size:10.5px; color:${t.textMuted}; margin:0; display:flex; gap:7px; flex-wrap:wrap; }
      .ad-row-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }

      .ad-badge {
        display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:100px;
        font-size:10.5px; font-weight:700; letter-spacing:.03em; white-space:nowrap;
      }
      .ad-badge-ok  { background:rgba(74,124,92,.15); color:${AURA.green}; }
      .ad-badge-off { background:rgba(158,42,43,.13); color:${AURA.clay}; }

      .ad-empty {
        text-align:center; padding:30px 16px; color:${t.textMuted}; font-size:13px;
        display:flex; flex-direction:column; align-items:center; gap:10px;
      }

      .ad-filters { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
      .ad-field label {
        display:block; font-size:9.5px; font-weight:600; letter-spacing:.06em; text-transform:uppercase;
        color:${t.textMuted}; margin-bottom:5px;
      }
      .ad-field input, .ad-field select {
        width:100%; padding:9px 12px; border-radius:10px; background:${t.bgInput};
        border:1px solid ${t.borderInput}; color:${t.text}; font-size:12px; font-family:'Inter',sans-serif; outline:none;
      }
      .ad-field select option { background:${t.optionBg}; color:${t.text}; }
      .ad-field input:focus, .ad-field select:focus{ border-color:${AURA.gold}; }

      .ad-hist-row {
        padding:12px; border-radius:12px; margin-bottom:8px;
        background:${isDark ? "rgba(255,255,255,.02)" : "rgba(30,63,102,.025)"};
        font-size:12px;
      }

      .ad-link { color:${AURA.mossLight}; font-weight:600; cursor:pointer; text-decoration:underline; text-underline-offset:2px; }
      .ad-link:hover{ color:${AURA.gold}; }

      /* Modal único */
      .ad-overlay {
        position:fixed; inset:0; z-index:200; background:rgba(0,0,0,.55);
        display:flex; align-items:flex-end; justify-content:center; backdrop-filter:blur(3px);
      }
      @media(min-width:640px){ .ad-overlay{ align-items:center; padding:20px; } }
      .ad-modal {
        background:${isDark ? "#161B29" : "#FBFAF6"}; width:100%; max-width:600px; max-height:92vh; overflow-y:auto;
        border-radius:22px 22px 0 0; border:1px solid ${t.border}; box-shadow:0 -10px 40px rgba(0,0,0,.35);
        display:flex; flex-direction:column;
      }
      @media(min-width:640px){ .ad-modal{ border-radius:22px; box-shadow:0 20px 60px rgba(0,0,0,.4); } }
      .ad-modal-head {
        display:flex; align-items:center; gap:10px; padding:18px 18px 14px;
        border-bottom:1px solid ${t.border}; position:sticky; top:0; background:${isDark ? "#161B29" : "#FBFAF6"}; z-index:1;
      }
      .ad-modal-title { font-family:'Fraunces',serif; font-size:16px; font-weight:600; margin:0; color:${t.text}; flex:1; min-width:0; word-break:break-word; }
      .ad-modal-body { padding:16px 18px 22px; }
      .ad-icon-btn {
        width:32px; height:32px; border-radius:50%; border:1px solid ${t.border}; background:transparent;
        color:${t.textMuted}; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;
      }
      .ad-icon-btn:hover{ color:${AURA.gold}; border-color:${AURA.gold}; }
      .ad-icon-btn.danger:hover{ color:${AURA.clay}; border-color:${AURA.clay}; }

      .ad-form-group{ margin-bottom:13px; }
      .ad-form-row{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
      .ad-form-group label {
        display:block; font-size:10.5px; font-weight:600; letter-spacing:.04em; text-transform:uppercase;
        color:${t.textMuted}; margin-bottom:6px;
      }
      .ad-input, .ad-select, .ad-textarea {
        width:100%; padding:10px 13px; border-radius:12px; background:${t.bgInput};
        border:1px solid ${t.borderInput}; color:${t.text}; font-size:13px; font-family:'Inter',sans-serif; outline:none;
        transition:border-color .2s;
      }
      .ad-select option{ background:${t.optionBg}; color:${t.text}; }
      .ad-input:focus, .ad-select:focus, .ad-textarea:focus{ border-color:${AURA.gold}; }
      .ad-textarea{ resize:vertical; min-height:64px; font-family:'Inter',sans-serif; }

      .ad-alert {
        display:flex; gap:9px; padding:12px 14px; border-radius:14px; font-size:12.5px; line-height:1.5;
        margin-bottom:14px; align-items:flex-start;
      }
      .ad-alert-error { background:rgba(158,42,43,.1); border:1px solid rgba(158,42,43,.3); color:${isDark ? "#E19A9B" : AURA.clayDeep}; }
      .ad-alert-success{ background:rgba(74,124,92,.1); border:1px solid rgba(74,124,92,.3); color:${isDark ? "#8FCB9F" : AURA.greenDark}; }

      .ad-checklist { max-height:220px; overflow-y:auto; border:1px solid ${t.border}; border-radius:14px; padding:6px; }
      .ad-check-row { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:10px; cursor:pointer; }
      .ad-check-row:hover{ background:${isDark ? "rgba(255,255,255,.04)" : "rgba(30,63,102,.05)"}; }
      .ad-checkbox {
        width:19px; height:19px; border-radius:6px; border:1.5px solid ${t.borderInput}; flex-shrink:0;
        display:flex; align-items:center; justify-content:center; transition:all .15s;
      }
      .ad-checkbox.checked { background:${AURA.moss}; border-color:${AURA.moss}; }
      .ad-check-name{ font-size:13px; color:${t.text}; }

      .ad-count-pill {
        display:flex; align-items:center; justify-content:center; padding:12px 15px; border-radius:14px;
        background:${isDark ? "rgba(255,255,255,.04)" : "rgba(30,63,102,.05)"}; border:1px solid ${t.border};
        margin:13px 0; font-size:12.5px; color:${t.textSec}; font-weight:600;
      }

      .ad-timeline-item { padding:13px 0; border-bottom:1px solid ${t.border}; }
      .ad-timeline-item:last-child{ border-bottom:none; }

      .ad-toast-wrap { position:fixed; top:16px; left:50%; transform:translateX(-50%); z-index:400; width:calc(100% - 32px); max-width:420px; }
      .ad-toast {
        display:flex; align-items:flex-start; gap:10px; padding:14px 16px; border-radius:14px;
        box-shadow:0 12px 30px rgba(0,0,0,.3); font-size:13px; line-height:1.4;
      }
      .ad-toast-success{ background:linear-gradient(135deg, ${AURA.greenDark}, ${AURA.green}); color:#fff; }
      .ad-toast-error{ background:linear-gradient(135deg, ${AURA.clayDeep}, ${AURA.clay}); color:#fff; }

      .ad-loading-wrap { display:flex; align-items:center; justify-content:center; padding:50px 0; color:${t.textMuted}; }
    `}</style>
    );
}

/* ════════════════════════════════════════════════════════════════════
   COMPONENTES AUXILIARES
   ════════════════════════════════════════════════════════════════════ */
function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return;
        const id = setTimeout(onClose, 4200);
        return () => clearTimeout(id);
    }, [toast, onClose]);

    return createPortal(
        <div className="ad-toast-wrap">
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`ad-toast ${toast.type === "error" ? "ad-toast-error" : "ad-toast-success"}`}
                        initial={{ opacity: 0, y: -18, scale: .95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: .96 }}
                        transition={{ duration: .25 }}
                    >
                        {toast.type === "error" ? <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} /> : <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />}
                        <span>{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>,
        document.body
    );
}

/* ════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — UM ÚNICO MODAL, NAVEGAÇÃO INTERNA
   ════════════════════════════════════════════════════════════════════
   Props:
     open     — controla a visibilidade do modal
     onClose  — chamado ao fechar (X)
   ════════════════════════════════════════════════════════════════════ */
export default function AcompanhamentoDiscipulado({ isDark = true, open, onClose }) {
    const t = theme(isDark);
    const [toast, setToast] = useState(null);
    const notify = useCallback((message, type = "success") => setToast({ message, type }), []);

    // pilha de navegação dentro do modal: [{ view, ...params }]
    const [stack, setStack] = useState([{ view: "escolha" }]);
    const atual = stack[stack.length - 1];
    const push = (view, params = {}) => setStack((s) => [...s, { view, ...params }]);
    const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

    const fecharTudo = useCallback(() => {
        setStack([{ view: "escolha" }]);
        onClose?.();
    }, [onClose]);

    const [pendentesSemana, setPendentesSemana] = useState(null);
    const [membros, setMembros] = useState([]);
    const [loadingMembros, setLoadingMembros] = useState(true);

    const fetchResumo = useCallback(async () => {
        try {
            const res = await api.get(`${BASE}/indicadores`);
            setPendentesSemana(res.data?.membrosNaoDiscipuladosSemana ?? null);
        } catch {
            setPendentesSemana(null);
        }
    }, []);

    const fetchMembros = useCallback(async () => {
        setLoadingMembros(true);
        try {
            const res = await api.get(`${BASE}/membros`);
            setMembros(Array.isArray(res.data) ? res.data : (res.data?.content || []));
        } catch {
            notify("Não foi possível carregar os membros.", "error");
        } finally {
            setLoadingMembros(false);
        }
    }, [notify]);

    const recarregarTudo = useCallback(() => { fetchResumo(); fetchMembros(); }, [fetchResumo, fetchMembros]);

    useEffect(() => {
        if (open) { fetchResumo(); fetchMembros(); }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!open) return null;

    const titulo = TITULOS[atual.view] || "Acompanhamento";

    return createPortal(
        <div className="ad-root">
            <GlobalStyles t={t} isDark={isDark} />
            <Toast toast={toast} onClose={() => setToast(null)} />

            <div className="ad-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) fecharTudo(); }}>
                <motion.div
                    className="ad-modal"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: .25, ease: "easeOut" }}
                >
                    <div className="ad-modal-head">
                        {stack.length > 1 ? (
                            <button className="ad-icon-btn" onClick={back} aria-label="Voltar"><ChevronLeft size={17} /></button>
                        ) : (
                            <div style={{ width: 32 }} />
                        )}
                        <h3 className="ad-modal-title">{titulo}</h3>
                        <button className="ad-icon-btn danger" onClick={fecharTudo} aria-label="Fechar"><X size={16} /></button>
                    </div>

                    <div className="ad-modal-body">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={atual.view + (atual.membroId ?? "") + (atual.id ?? "")}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: .18 }}
                            >
                                {atual.view === "escolha" && (
                                    <TelaEscolha
                                        t={t} pendentesSemana={pendentesSemana}
                                        onEscolher={(v) => push(v)}
                                    />
                                )}

                                {atual.view === "individual-lista" && (
                                    <TelaIndividualLista
                                        t={t} membros={membros} loading={loadingMembros}
                                        onRegistrar={(m) => push("individual-form", { membroPre: m })}
                                        onVerHistorico={(m) => push("individual-historico", { membroId: m.membroId, membroNome: m.membroNome })}
                                    />
                                )}

                                {atual.view === "individual-form" && (
                                    <FormIndividual
                                        t={t} membros={membros} membroPre={atual.membroPre}
                                        onSalvo={(msg) => { notify(msg); recarregarTudo(); back(); }}
                                        onErro={(msg) => notify(msg, "error")}
                                    />
                                )}

                                {atual.view === "individual-historico" && (
                                    <HistoricoIndividual
                                        t={t} membroId={atual.membroId} membroNome={atual.membroNome}
                                        notify={notify}
                                    />
                                )}

                                {atual.view === "coletivo-lista" && (
                                    <TelaColetivoLista
                                        t={t} notify={notify}
                                        onRegistrar={() => push("coletivo-form")}
                                        onAbrirDetalhe={(id) => push("coletivo-detalhe", { id })}
                                    />
                                )}

                                {atual.view === "coletivo-form" && (
                                    <FormColetivo
                                        t={t} membros={membros}
                                        onSalvo={(msg) => { notify(msg); recarregarTudo(); back(); }}
                                        onErro={(msg) => notify(msg, "error")}
                                    />
                                )}

                                {atual.view === "coletivo-detalhe" && (
                                    <DetalheColetivo
                                        t={t} id={atual.id} notify={notify}
                                    />
                                )}

                                {atual.view === "historico-geral" && (
                                    <TelaHistoricoGeral
                                        t={t} notify={notify} membros={membros}
                                        onAbrirColetivo={(id) => push("coletivo-detalhe", { id })}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>,
        document.body
    );
}

/* ════════════════════════════════════════════════════════════════════
   TELA 0 — ESCOLHA (pergunta inicial, 3 opções)
   ════════════════════════════════════════════════════════════════════ */
function TelaEscolha({ t, pendentesSemana, onEscolher }) {
    return (
        <div>
            <p className="ad-section-sub" style={{ marginBottom: 16 }}>O que você deseja fazer?</p>

            <div className="ad-choice-link" onClick={() => onEscolher("individual-lista")}>
                <div className="ad-choice-link-left">
                    <div className="ad-choice-icon" style={{ background: `${AURA.mossLight}18`, color: AURA.mossLight }}>
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <p className="ad-choice-name">Discipulado Individual</p>
                        <p className="ad-choice-desc">
                            {pendentesSemana === null ? "Ver membros da célula" : `${pendentesSemana} pendente(s) esta semana`}
                        </p>
                    </div>
                </div>
                <ChevronRight size={16} color={t.textMuted} />
            </div>

            <div className="ad-choice-link" onClick={() => onEscolher("coletivo-lista")}>
                <div className="ad-choice-link-left">
                    <div className="ad-choice-icon" style={{ background: `${AURA.roxoLight}18`, color: AURA.roxoLight }}>
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="ad-choice-name">Discipulado Coletivo</p>
                        <p className="ad-choice-desc">Encontros em grupo da célula</p>
                    </div>
                </div>
                <ChevronRight size={16} color={t.textMuted} />
            </div>

            <div className="ad-choice-link" onClick={() => onEscolher("historico-geral")}>
                <div className="ad-choice-link-left">
                    <div className="ad-choice-icon" style={{ background: `${AURA.gold}18`, color: AURA.gold }}>
                        <History size={20} />
                    </div>
                    <div>
                        <p className="ad-choice-name">Histórico</p>
                        <p className="ad-choice-desc">Todos os registros da célula</p>
                    </div>
                </div>
                <ChevronRight size={16} color={t.textMuted} />
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   DISCIPULADO INDIVIDUAL — lista
   ════════════════════════════════════════════════════════════════════ */
function TelaIndividualLista({ t, membros, loading, onRegistrar, onVerHistorico }) {
    const [busca, setBusca] = useState("");
    const filtrados = useMemo(() => {
        const q = busca.trim().toLowerCase();
        if (!q) return membros;
        return membros.filter((m) => m.membroNome?.toLowerCase().includes(q));
    }, [membros, busca]);

    return (
        <div>
            <div className="ad-search">
                <Search size={14} color={t.textMuted} />
                <input placeholder="Buscar membro…" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>

            <div className="ad-card">
                {loading ? (
                    <div className="ad-loading-wrap"><Loader2 size={20} className="ad-spin" /></div>
                ) : filtrados.length === 0 ? (
                    <div className="ad-empty"><Users size={22} /> Nenhum membro encontrado.</div>
                ) : (
                    filtrados.map((m) => {
                        const realizado = m.statusSemanal === "REALIZADO" || m.discipuladoEstaSemana === true;
                        return (
                            <div key={m.membroId} className="ad-row" onClick={() => (realizado ? onVerHistorico(m) : onRegistrar(m))}>
                                <div className="ad-row-left">
                                    <div className="ad-avatar">{m.membroNome?.charAt(0).toUpperCase()}</div>
                                    <div style={{ minWidth: 0 }}>
                                        <p className="ad-row-name">{m.membroNome}</p>
                                        <p className="ad-row-meta">
                                            <span>Último: {formatarDataBR(m.ultimoDiscipulado)}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="ad-row-right">
                                    {realizado ? (
                                        <span className="ad-badge ad-badge-ok"><CheckCircle2 size={11} /> Realizado</span>
                                    ) : (
                                        <button className="ad-btn ad-btn-primary ad-btn-sm" onClick={(e) => { e.stopPropagation(); onRegistrar(m); }}>
                                            <Plus size={12} /> Registrar
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   FORM — REGISTRAR INDIVIDUAL
   ════════════════════════════════════════════════════════════════════ */
function FormIndividual({ t, membros, membroPre, onSalvo, onErro }) {
    const [form, setForm] = useState({
        membroId: membroPre?.membroId || "",
        data: hoje(), horario: "", tipoEstudo: "ESTUDO_BIBLICO", tipoEstudoOutro: "",
        tema: "", observacoes: "", local: "",
    });
    const [erro, setErro] = useState(null);
    const [salvando, setSalvando] = useState(false);

    const membrosDisponiveis = useMemo(
        () => membros.filter((m) => m.statusSemanal !== "REALIZADO" && m.discipuladoEstaSemana !== true),
        [membros]
    );

    const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

    const salvar = async () => {
        setErro(null);
        if (!form.membroId) return setErro("Selecione o membro.");
        if (!form.data) return setErro("Informe a data.");
        if (!form.horario) return setErro("Informe o horário.");
        if (!form.tema.trim()) return setErro("Informe o tema.");
        if (form.tipoEstudo === "OUTRO" && !form.tipoEstudoOutro.trim()) return setErro("Descreva o tipo de estudo.");

        setSalvando(true);
        try {
            const payload = {
                membroId: Number(form.membroId), data: form.data, horario: form.horario,
                tipoEstudo: form.tipoEstudo,
                tipoEstudoOutro: form.tipoEstudo === "OUTRO" ? form.tipoEstudoOutro : null,
                tema: form.tema, observacoes: form.observacoes || null, local: form.local || null,
            };
            await api.post(`${BASE}/individual`, payload);
            onSalvo("Discipulado registrado com sucesso!");
        } catch (err) {
            const msg = extrairErro(err);
            setErro(msg);
            onErro(msg);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div>
            {erro && <div className="ad-alert ad-alert-error"><AlertCircle size={16} style={{ flexShrink: 0 }} /> <span>{erro}</span></div>}

            <div className="ad-form-group">
                <label>Membro</label>
                <select className="ad-select" value={form.membroId} onChange={set("membroId")} disabled={!!membroPre}>
                    <option value="">Selecione…</option>
                    {(membroPre ? membros : membrosDisponiveis).map((m) => (
                        <option key={m.membroId} value={m.membroId}>{m.membroNome}</option>
                    ))}
                </select>
            </div>

            <div className="ad-form-row">
                <div className="ad-form-group">
                    <label>Data</label>
                    <input type="date" className="ad-input" max={hoje()} value={form.data} onChange={set("data")} />
                </div>
                <div className="ad-form-group">
                    <label>Horário</label>
                    <input type="time" className="ad-input" value={form.horario} onChange={set("horario")} />
                </div>
            </div>

            <div className="ad-form-group">
                <label>Tipo de estudo</label>
                <select className="ad-select" value={form.tipoEstudo} onChange={set("tipoEstudo")}>
                    {TIPOS_ESTUDO.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
                </select>
            </div>

            {form.tipoEstudo === "OUTRO" && (
                <div className="ad-form-group">
                    <label>Descreva o tipo de estudo</label>
                    <input className="ad-input" value={form.tipoEstudoOutro} onChange={set("tipoEstudoOutro")} placeholder="Ex.: Aconselhamento" />
                </div>
            )}

            <div className="ad-form-group">
                <label>Tema</label>
                <input className="ad-input" value={form.tema} onChange={set("tema")} placeholder="Ex.: Fé e confiança em Deus" />
            </div>

            <div className="ad-form-group">
                <label>Local</label>
                <input className="ad-input" value={form.local} onChange={set("local")} placeholder="Ex.: Igreja, residência…" />
            </div>

            <div className="ad-form-group">
                <label>Observações</label>
                <textarea className="ad-textarea" value={form.observacoes} onChange={set("observacoes")} placeholder="Opcional" />
            </div>

            <button className="ad-btn ad-btn-primary ad-btn-block" disabled={salvando} onClick={salvar}>
                {salvando ? <Loader2 size={15} className="ad-spin" /> : <Check size={15} />} Salvar Discipulado
            </button>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   HISTÓRICO DO MEMBRO (individual)
   ════════════════════════════════════════════════════════════════════ */
function HistoricoIndividual({ t, membroId, membroNome, notify }) {
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);

    const carregar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`${BASE}/individual/historico/${membroId}`);
            setDados(res.data || {});
        } catch {
            notify("Não foi possível carregar o histórico do membro.", "error");
        } finally {
            setLoading(false);
        }
    }, [membroId, notify]);

    useEffect(() => { carregar(); }, [carregar]);

    const itens = dados?.itens || dados?.historico || dados?.content || [];
    if (loading) return <div className="ad-loading-wrap"><Loader2 size={20} className="ad-spin" /></div>;

    return (
        <div>
            <p style={{ fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 600, margin: "0 0 4px", color: t.text }}>{membroNome}</p>
            <p style={{ fontSize: 12, color: t.textMuted, margin: "0 0 16px" }}>
                {dados?.totalDiscipulados ?? itens.length} discipulado(s) registrado(s)
            </p>

            {itens.length === 0 ? (
                <div className="ad-empty"><History size={22} /> Nenhum discipulado registrado ainda.</div>
            ) : (
                itens.map((item) => (
                    <div key={item.id} className="ad-timeline-item">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 5 }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: t.text }}>
                                    {formatarDataBR(item.data)} {item.horario ? `às ${item.horario}` : ""}
                                </p>
                                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: t.textMuted }}>
                                    {item.tipoEstudoDescricao || labelTipoEstudo(item.tipoEstudo)}
                                </p>
                            </div>
                            <span className={`ad-badge ${item.status === "CANCELADO" ? "ad-badge-off" : "ad-badge-ok"}`}>
                      {item.status === "CANCELADO" ? "Cancelado" : "Concluído"}
                    </span>
                        </div>
                        <p style={{ margin: "0 0 4px", fontSize: 12.5, color: t.text, fontWeight: 600 }}>{item.tema}</p>
                        {item.local && <p style={{ margin: "0 0 4px", fontSize: 11.5, color: t.textSec }}>📍 {item.local}</p>}
                        {item.observacoes && <p style={{ margin: "0 0 8px", fontSize: 11.5, color: t.textSec }}>{item.observacoes}</p>}
                    </div>
                ))
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   DISCIPULADO COLETIVO — lista
   ════════════════════════════════════════════════════════════════════ */
function TelaColetivoLista({ t, notify, onRegistrar, onAbrirDetalhe }) {
    const [lista, setLista] = useState([]);
    const [loading, setLoading] = useState(true);

    const carregar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`${BASE}/historico`, { params: { tipo: "COLETIVO" } });
            setLista(Array.isArray(res.data) ? res.data : (res.data?.content || []));
        } catch {
            notify("Não foi possível carregar os encontros coletivos.", "error");
        } finally {
            setLoading(false);
        }
    }, [notify]);

    useEffect(() => { carregar(); }, [carregar]);

    return (
        <div>
            <div className="ad-cta-row">
                <button className="ad-btn ad-btn-primary ad-btn-block" onClick={onRegistrar}>
                    <Plus size={14} /> Registrar Discipulado Coletivo
                </button>
            </div>

            <p className="ad-section-title" style={{ fontSize: 13 }}>Encontros registrados</p>
            <div className="ad-card">
                {loading ? (
                    <div className="ad-loading-wrap"><Loader2 size={20} className="ad-spin" /></div>
                ) : lista.length === 0 ? (
                    <div className="ad-empty"><Users size={22} /> Nenhum encontro coletivo registrado ainda.</div>
                ) : (
                    lista.map((e) => (
                        <div key={e.id} className="ad-row" onClick={() => onAbrirDetalhe(e.id)}>
                            <div className="ad-row-left">
                                <div className="ad-avatar" style={{ background: `linear-gradient(135deg, ${AURA.roxoDeep}, ${AURA.roxo})` }}>
                                    <Users size={15} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p className="ad-row-name">{e.tema || labelTipoEstudo(e.tipoEstudo)}</p>
                                    <p className="ad-row-meta">
                                        <span>{formatarDataBR(e.data)}</span>
                                        <span>· {e.quantidadeParticipantes ?? e.participantes ?? "—"} participantes</span>
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={15} color={t.textMuted} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   FORM — REGISTRAR COLETIVO
   ════════════════════════════════════════════════════════════════════ */
function FormColetivo({ t, membros, onSalvo, onErro }) {
    const [form, setForm] = useState({
        data: hoje(), horario: "", tipoEstudo: "ESTUDO_BIBLICO", tipoEstudoOutro: "",
        tema: "", local: "", observacoes: "",
    });
    const [participantes, setParticipantes] = useState(new Set());
    const [erro, setErro] = useState(null);
    const [salvando, setSalvando] = useState(false);

    const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

    const toggleMembro = (id) => {
        setParticipantes((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const todosMarcados = membros.length > 0 && participantes.size === membros.length;
    const toggleTodos = () => setParticipantes(todosMarcados ? new Set() : new Set(membros.map((m) => m.membroId)));

    const salvar = async () => {
        setErro(null);
        if (!form.data) return setErro("Informe a data.");
        if (!form.horario) return setErro("Informe o horário.");
        if (!form.tema.trim()) return setErro("Informe o tema.");
        if (form.tipoEstudo === "OUTRO" && !form.tipoEstudoOutro.trim()) return setErro("Descreva o tipo de estudo.");
        if (participantes.size === 0) return setErro("Marque ao menos um participante presente.");

        setSalvando(true);
        try {
            const payload = {
                data: form.data, horario: form.horario, tipoEstudo: form.tipoEstudo,
                tipoEstudoOutro: form.tipoEstudo === "OUTRO" ? form.tipoEstudoOutro : null,
                tema: form.tema, local: form.local || null, observacoes: form.observacoes || null,
                participantesIds: Array.from(participantes),
            };
            await api.post(`${BASE}/coletivo`, payload);
            onSalvo("Discipulado coletivo registrado com sucesso!");
        } catch (err) {
            const msg = extrairErro(err);
            setErro(msg);
            onErro(msg);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div>
            {erro && <div className="ad-alert ad-alert-error"><AlertCircle size={16} style={{ flexShrink: 0 }} /> <span>{erro}</span></div>}

            <div className="ad-form-row">
                <div className="ad-form-group">
                    <label>Data</label>
                    <input type="date" className="ad-input" max={hoje()} value={form.data} onChange={set("data")} />
                </div>
                <div className="ad-form-group">
                    <label>Horário</label>
                    <input type="time" className="ad-input" value={form.horario} onChange={set("horario")} />
                </div>
            </div>

            <div className="ad-form-group">
                <label>Tipo de estudo</label>
                <select className="ad-select" value={form.tipoEstudo} onChange={set("tipoEstudo")}>
                    {TIPOS_ESTUDO.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
                </select>
            </div>

            {form.tipoEstudo === "OUTRO" && (
                <div className="ad-form-group">
                    <label>Descreva o tipo de estudo</label>
                    <input className="ad-input" value={form.tipoEstudoOutro} onChange={set("tipoEstudoOutro")} />
                </div>
            )}

            <div className="ad-form-group">
                <label>Tema</label>
                <input className="ad-input" value={form.tema} onChange={set("tema")} placeholder="Ex.: Fé" />
            </div>

            <div className="ad-form-group">
                <label>Local</label>
                <input className="ad-input" value={form.local} onChange={set("local")} placeholder="Ex.: Igreja" />
            </div>

            <div className="ad-form-group">
                <label>Observações</label>
                <textarea className="ad-textarea" value={form.observacoes} onChange={set("observacoes")} />
            </div>

            <div className="ad-form-group">
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Participantes</span>
                    <span
                        style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", textTransform: "none", color: AURA.gold, fontWeight: 600 }}
                        onClick={toggleTodos}
                    >
              <span className={`ad-checkbox ${todosMarcados ? "checked" : ""}`} style={{ width: 16, height: 16 }}>
                {todosMarcados && <Check size={11} color="#fff" />}
              </span>
              Selecionar todos
            </span>
                </label>
                <div className="ad-checklist">
                    {membros.length === 0 && <p style={{ padding: 10, fontSize: 12, color: t.textMuted }}>Nenhum membro na célula.</p>}
                    {membros.map((m) => {
                        const checked = participantes.has(m.membroId);
                        return (
                            <div key={m.membroId} className="ad-check-row" onClick={() => toggleMembro(m.membroId)}>
                                <span className={`ad-checkbox ${checked ? "checked" : ""}`}>{checked && <Check size={12} color="#fff" />}</span>
                                <span className="ad-check-name">{m.membroNome}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="ad-count-pill">
                {participantes.size} participante{participantes.size === 1 ? "" : "s"} selecionado{participantes.size === 1 ? "" : "s"}
            </div>

            <button className="ad-btn ad-btn-primary ad-btn-block" disabled={salvando} onClick={salvar}>
                {salvando ? <Loader2 size={15} className="ad-spin" /> : <Check size={15} />} Salvar Encontro
            </button>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   DETALHES DO COLETIVO
   ════════════════════════════════════════════════════════════════════ */
function DetalheColetivo({ t, id, notify }) {
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);

    const carregar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`${BASE}/coletivo/${id}`);
            setDados(res.data || {});
        } catch {
            notify("Não foi possível carregar os detalhes do encontro.", "error");
        } finally {
            setLoading(false);
        }
    }, [id, notify]);

    useEffect(() => { carregar(); }, [carregar]);

    if (loading) return <div className="ad-loading-wrap"><Loader2 size={20} className="ad-spin" /></div>;
    const presentes = dados?.presentes || [];

    return (
        <div>
            <div className="ad-form-row" style={{ marginBottom: 4 }}>
                <div>
                    <p style={{ fontSize: 9.5, letterSpacing: ".05em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 3px" }}>Data / Horário</p>
                    <p style={{ margin: 0, fontWeight: 600, color: t.text, fontSize: 13 }}>{formatarDataBR(dados?.data)} {dados?.horario ? `· ${dados.horario}` : ""}</p>
                </div>
                <div>
                    <p style={{ fontSize: 9.5, letterSpacing: ".05em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 3px" }}>Tipo de estudo</p>
                    <p style={{ margin: 0, fontWeight: 600, color: t.text, fontSize: 13 }}>{dados?.tipoEstudoDescricao || labelTipoEstudo(dados?.tipoEstudo)}</p>
                </div>
            </div>

            <p style={{ fontSize: 9.5, letterSpacing: ".05em", textTransform: "uppercase", color: t.textMuted, margin: "13px 0 3px" }}>Tema</p>
            <p style={{ margin: "0 0 10px", fontWeight: 600, fontSize: 14, color: t.text }}>{dados?.tema}</p>

            {dados?.local && (
                <>
                    <p style={{ fontSize: 9.5, letterSpacing: ".05em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 3px" }}>Local</p>
                    <p style={{ margin: "0 0 10px", color: t.textSec, fontSize: 12.5 }}>{dados.local}</p>
                </>
            )}

            {dados?.observacoes && (
                <>
                    <p style={{ fontSize: 9.5, letterSpacing: ".05em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 3px" }}>Observações</p>
                    <p style={{ margin: "0 0 12px", color: t.textSec, fontSize: 12.5 }}>{dados.observacoes}</p>
                </>
            )}

            <div className="ad-count-pill">
                {dados?.quantidadePresentes ?? presentes.length} presente{(dados?.quantidadePresentes ?? presentes.length) === 1 ? "" : "s"}
            </div>

            <p style={{ fontSize: 9.5, letterSpacing: ".05em", textTransform: "uppercase", color: t.textMuted, margin: "14px 0 8px" }}>
                Presentes ({presentes.length})
            </p>
            <div className="ad-checklist" style={{ marginBottom: 14 }}>
                {presentes.map((p, idx) => (
                    <div key={p.membroId ?? idx} className="ad-check-row" style={{ cursor: "default" }}>
                        <span style={{ width: 20, textAlign: "center", fontSize: 10.5, color: t.textMuted, fontWeight: 700 }}>{idx + 1}.</span>
                        <span className="ad-check-name">{p.membroNome}</span>
                    </div>
                ))}
                {presentes.length === 0 && <p style={{ padding: 10, fontSize: 12, color: t.textMuted }}>Nenhum presente listado.</p>}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className={`ad-badge ${dados?.status === "CANCELADO" ? "ad-badge-off" : "ad-badge-ok"}`}>
            {dados?.status === "CANCELADO" ? "Cancelado" : "Concluído"}
          </span>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   HISTÓRICO GERAL (com filtros)
   ════════════════════════════════════════════════════════════════════ */
function TelaHistoricoGeral({ t, notify, membros, onAbrirColetivo }) {
    const [filtros, setFiltros] = useState({ dataInicio: "", dataFim: "", membroId: "", tipo: "", tema: "", tipoEstudo: "" });
    const [lista, setLista] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            Object.entries(filtros).forEach(([k, v]) => { if (v) params[k] = v; });
            const res = await api.get(`${BASE}/historico`, { params });
            setLista(Array.isArray(res.data) ? res.data : (res.data?.content || []));
        } catch {
            notify("Não foi possível carregar o histórico.", "error");
        } finally {
            setLoading(false);
        }
    }, [filtros, notify]);

    useEffect(() => { buscar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const limparFiltros = () => setFiltros({ dataInicio: "", dataFim: "", membroId: "", tipo: "", tema: "", tipoEstudo: "" });

    return (
        <div>
            <div className="ad-cta-row" style={{ marginBottom: 10 }}>
                <button className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setMostrarFiltros((v) => !v)}>
                    <Filter size={12} /> {mostrarFiltros ? "Ocultar filtros" : "Filtros"}
                </button>
            </div>

            {mostrarFiltros && (
                <div className="ad-card" style={{ marginBottom: 14 }}>
                    <div className="ad-filters">
                        <div className="ad-field">
                            <label>De</label>
                            <input type="date" max={hoje()} value={filtros.dataInicio} onChange={(e) => setFiltros((f) => ({ ...f, dataInicio: e.target.value }))} />
                        </div>
                        <div className="ad-field">
                            <label>Até</label>
                            <input type="date" max={hoje()} value={filtros.dataFim} onChange={(e) => setFiltros((f) => ({ ...f, dataFim: e.target.value }))} />
                        </div>
                        <div className="ad-field">
                            <label>Membro</label>
                            <select value={filtros.membroId} onChange={(e) => setFiltros((f) => ({ ...f, membroId: e.target.value }))}>
                                <option value="">Todos</option>
                                {membros.map((m) => <option key={m.membroId} value={m.membroId}>{m.membroNome}</option>)}
                            </select>
                        </div>
                        <div className="ad-field">
                            <label>Tipo</label>
                            <select value={filtros.tipo} onChange={(e) => setFiltros((f) => ({ ...f, tipo: e.target.value }))}>
                                <option value="">Todos</option>
                                <option value="INDIVIDUAL">Individual</option>
                                <option value="COLETIVO">Coletivo</option>
                            </select>
                        </div>
                        <div className="ad-field">
                            <label>Tema</label>
                            <input placeholder="Buscar por tema" value={filtros.tema} onChange={(e) => setFiltros((f) => ({ ...f, tema: e.target.value }))} />
                        </div>
                        <div className="ad-field">
                            <label>Tipo de estudo</label>
                            <select value={filtros.tipoEstudo} onChange={(e) => setFiltros((f) => ({ ...f, tipoEstudo: e.target.value }))}>
                                <option value="">Todos</option>
                                {TIPOS_ESTUDO.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="ad-btn ad-btn-primary ad-btn-sm" onClick={buscar}><Filter size={12} /> Filtrar</button>
                        <button className="ad-btn ad-btn-ghost ad-btn-sm" onClick={limparFiltros}><RotateCcw size={12} /> Limpar</button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="ad-loading-wrap"><Loader2 size={20} className="ad-spin" /></div>
            ) : lista.length === 0 ? (
                <div className="ad-empty"><History size={22} /> Nenhum registro encontrado.</div>
            ) : (
                lista.map((r, idx) => (
                    <div className="ad-hist-row" key={r.id ?? idx}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <strong style={{ color: t.text }}>{formatarDataBR(r.data)}</strong>
                            <span className="ad-badge" style={{ background: r.tipo === "COLETIVO" ? "rgba(91,42,110,.14)" : "rgba(30,63,102,.12)", color: r.tipo === "COLETIVO" ? AURA.roxoLight : AURA.mossLight }}>
                      {r.tipo === "COLETIVO" ? "Coletivo" : "Individual"}
                    </span>
                        </div>
                        <p style={{ margin: "0 0 4px", color: t.text, fontWeight: 600 }}>
                            {r.tipo === "COLETIVO"
                                ? <span className="ad-link" onClick={() => onAbrirColetivo(r.id)}>Coletivo · {r.quantidadeParticipantes ?? r.participantes ?? 0} participantes</span>
                                : (r.membroNome || "—")}
                        </p>
                        <p style={{ margin: "0 0 6px", color: t.textSec }}>{r.tema || "—"}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: t.textMuted }}>{r.liderNome || "—"}</span>
                            <span className={`ad-badge ${r.status === "CANCELADO" ? "ad-badge-off" : "ad-badge-ok"}`}>
                      {r.status === "CANCELADO" ? "Cancelado" : "Concluído"}
                    </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
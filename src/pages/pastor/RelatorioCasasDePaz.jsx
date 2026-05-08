import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home, ChevronDown, ChevronUp, CheckCircle,
    Clock, XCircle, Activity, Filter, RotateCcw,
    Star, Droplets, Heart, FileDown, Loader2,
} from "lucide-react";

// ─── PALETA IEQ ──────────────────────────────────────────────────────────────
const IEQ = {
    red:      "#C8102E",
    redDark:  "#8B0B1F",
    redLight: "#E8294A",
    yellow:   "#FDB813",
    blue:     "#003DA5",
    offWhite: "#F5F0E8",
    teal:     "#5DCAA5",
    blueFade: "#7AABF4",
    gray:     "#B4B2A9",
};

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
    EM_ANDAMENTO: { label: "Em Andamento", color: IEQ.teal,     bg: "rgba(93,202,165,.12)",  border: "rgba(93,202,165,.3)",  Icon: Clock       },
    CONCLUIDA:    { label: "Concluída",    color: IEQ.blueFade, bg: "rgba(0,61,165,.12)",    border: "rgba(0,61,165,.3)",    Icon: CheckCircle  },
    CANCELADA:    { label: "Cancelada",    color: IEQ.redLight, bg: "rgba(200,16,46,.1)",    border: "rgba(200,16,46,.25)",  Icon: XCircle      },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] || {
        label: status, color: "#888",
        bg: "rgba(136,136,136,.1)", border: "rgba(136,136,136,.25)", Icon: Activity,
    };
    const { label, color, bg, border } = cfg;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 11px", borderRadius: 99,
            fontFamily: "'Cinzel',serif", fontSize: 8.5, fontWeight: 700, letterSpacing: ".13em",
            background: bg, border: `1px solid ${border}`, color,
        }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />
            {label.toUpperCase()}
        </span>
    );
}

function ProgressBar({ realizados = 0, total = 0 }) {
    const p = pct(realizados, total);
    const restantes = Math.max(0, total - realizados);
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".16em", color: "rgba(245,240,232,.3)" }}>ENCONTROS</span>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".13em", color: "rgba(245,240,232,.3)" }}>
                    {realizados} / {total} · {restantes} RESTANTE{restantes !== 1 ? "S" : ""}
                </span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${IEQ.redDark},${IEQ.red})` }}
                />
            </div>
        </div>
    );
}

function MiniStat({ label, value, sub, color }) {
    return (
        <div style={{ background: "rgba(0,0,0,.18)", border: "1px solid rgba(200,16,46,.08)", borderRadius: 8, padding: "9px 12px" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".15em", color: "rgba(245,240,232,.28)", marginBottom: 5 }}>{label}</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 17, fontWeight: 700, lineHeight: 1, color: color || IEQ.offWhite }}>{value}</div>
            {sub && <div style={{ fontFamily: "'EB Garamond',serif", fontSize: 11, color: "rgba(245,240,232,.45)", marginTop: 2 }}>{sub}</div>}
        </div>
    );
}

function Avatar({ name, blue = false }) {
    return (
        <div style={{
            width: 28, height: 28, borderRadius: 7, flexShrink: 0,
            background: blue ? "rgba(0,61,165,.12)" : "rgba(200,16,46,.12)",
            border: `1px solid ${blue ? "rgba(0,61,165,.25)" : "rgba(200,16,46,.2)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700,
            color: blue ? IEQ.blueFade : IEQ.redLight,
        }}>
            {initials(name)}
        </div>
    );
}

function Div() {
    return <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(200,16,46,.2),transparent)", margin: "10px 0" }} />;
}

// ─── GERADOR DE PDF VIA BACKEND ───────────────────────────────────────────────
async function gerarPDFReal(grupo) {
    // Monta o payload conforme CasaDePazPdfRequestDTO esperado pelo backend
    const payload = {
        celulaName: grupo.celulaName,
        casas: grupo.casas,
    };

    // POST com responseType blob para receber o binário do PDF
    const response = await api.post(
        "/api/casas-de-paz/relatorio/pdf",
        payload,
        { responseType: "blob" }
    );

    // Tenta extrair o nome do arquivo do header Content-Disposition
    const disposition = response.headers?.["content-disposition"] || "";
    const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)/i);
    const filename = match
        ? decodeURIComponent(match[1].replace(/\+/g, " ").trim())
        : `Relatorio_CasasDePaz_${grupo.celulaName.replace(/[^a-zA-Z0-9À-ú]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Cria URL temporária e dispara o download
    const url  = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href     = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

// ─── CARD DE CASA DE PAZ ──────────────────────────────────────────────────────
function CasaCard({ casa }) {
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
                background: "rgba(255,255,255,.025)",
                border: "1px solid rgba(200,16,46,.1)",
                borderRadius: 10, padding: "14px 16px", marginBottom: 10,
            }}
        >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                <div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".11em", color: IEQ.offWhite }}>
                        {casa.nome || "?"}
                    </div>
                    {casa.endereco && <div style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: "rgba(245,240,232,.5)", marginTop: 2 }}>{casa.endereco}</div>}
                    {casa.dataInicio && <div style={{ fontFamily: "'EB Garamond',serif", fontSize: 11, color: "rgba(245,240,232,.35)", marginTop: 2 }}>Início: {fmtDate(casa.dataInicio)}</div>}
                </div>
                <StatusBadge status={casa.status} />
            </div>

            <ProgressBar realizados={realizados} total={total} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 8, marginBottom: 12 }}>
                <MiniStat label="REALIZADOS" value={realizados} sub="encontros" />
                <MiniStat label="RESTANTES"  value={restantes}  sub="encontros" />
                <MiniStat label="VISITANTES" value={numVis}     sub="únicos" />
                <MiniStat label="DECISÕES"   value={totalDec}   sub="total" color={IEQ.yellow} />
            </div>

            {(lider || auxiliar) && (
                <>
                    <Div />
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".18em", color: "rgba(245,240,232,.28)", marginBottom: 7 }}>EQUIPE RESPONSÁVEL</div>
                        {lider && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                <Avatar name={lider} />
                                <div>
                                    <div style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: IEQ.offWhite, fontWeight: 500 }}>{lider}</div>
                                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".14em", color: "rgba(245,240,232,.28)" }}>LÍDER</div>
                                </div>
                            </div>
                        )}
                        {auxiliar && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Avatar name={auxiliar} blue />
                                <div>
                                    <div style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: IEQ.offWhite, fontWeight: 500 }}>{auxiliar}</div>
                                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".14em", color: "rgba(245,240,232,.28)" }}>AUXILIAR</div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            <Div />
            <div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".18em", color: "rgba(245,240,232,.28)", marginBottom: 7 }}>
                    VISITANTES ({numVis})
                </div>
                {uniq.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {uniq.map((v, i) => (
                            <span key={i} title={v.decisao || ""} style={{
                                background: v.decisao ? "rgba(253,184,19,.1)" : "rgba(255,255,255,.04)",
                                border: `1px solid ${v.decisao ? "rgba(253,184,19,.25)" : "rgba(200,16,46,.12)"}`,
                                borderRadius: 5, padding: "3px 9px",
                                fontFamily: "'EB Garamond',serif", fontSize: 12,
                                color: v.decisao ? IEQ.yellow : "rgba(245,240,232,.5)",
                            }}>
                                {v.nome}{v.decisao ? " ★" : ""}
                            </span>
                        ))}
                    </div>
                ) : numVis > 0 ? (
                    <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: "rgba(245,240,232,.35)", fontStyle: "italic" }}>
                        {numVis} visitante{numVis !== 1 ? "s" : ""} registrado{numVis !== 1 ? "s" : ""}
                    </p>
                ) : (
                    <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: "rgba(245,240,232,.25)", fontStyle: "italic" }}>Nenhum visitante registrado</p>
                )}
            </div>

            {totalDec > 0 && (
                <>
                    <Div />
                    <div>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".18em", color: "rgba(245,240,232,.28)", marginBottom: 7 }}>DECISÕES REGISTRADAS</div>
                        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                            {aceitacoes > 0 && (
                                <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 7, background: "rgba(93,202,165,.1)", fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 700, letterSpacing: ".13em", color: IEQ.teal }}>
                                    <Heart size={10} /> {aceitacoes} ACEITAÇÃO{aceitacoes !== 1 ? "ES" : ""}
                                </span>
                            )}
                            {reconcil > 0 && (
                                <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 7, background: "rgba(253,184,19,.1)", fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 700, letterSpacing: ".13em", color: IEQ.yellow }}>
                                    <Star size={10} /> {reconcil} RECONCILIAÇÃO{reconcil !== 1 ? "ÕES" : ""}
                                </span>
                            )}
                            {batismos > 0 && (
                                <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 7, background: "rgba(0,61,165,.12)", fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 700, letterSpacing: ".13em", color: IEQ.blueFade }}>
                                    <Droplets size={10} /> {batismos} BATISMO{batismos !== 1 ? "S" : ""}
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
function CelulaSection({ grupo }) {
    const [aberta, setAberta]         = useState(true);
    const [pdfLoading, setPdfLoading] = useState(false);

    const totalDec  = grupo.casas.reduce((acc, c) => acc
        + (c.totalAceitouJesus  ?? c.aceitacoes     ?? 0)
        + (c.totalReconciliacao ?? c.reconciliacoes ?? 0)
        + (c.totalDesejoBatismo ?? c.batismos       ?? 0), 0);
    const concl     = grupo.casas.filter((c) => c.status === "CONCLUIDA").length;
    const andamento = grupo.casas.filter((c) => c.status === "EM_ANDAMENTO").length;

    const handlePDF = async (e) => {
        e.stopPropagation();
        setPdfLoading(true);
        try {
            await gerarPDFReal(grupo);
        } catch (err) {
            console.error("Erro ao gerar PDF:", err);
            alert("Erro ao gerar PDF. Verifique o console.");
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <div style={{
            background: "rgba(17,10,13,.97)",
            border: "1px solid rgba(200,16,46,.15)",
            borderRadius: 12, marginBottom: 16, overflow: "hidden",
        }}>
            <div
                onClick={() => setAberta(!aberta)}
                style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px", cursor: "pointer",
                    borderBottom: aberta ? "1px solid rgba(200,16,46,.08)" : "none",
                    transition: "background .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,16,46,.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: "rgba(200,16,46,.1)", border: "1px solid rgba(200,16,46,.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, color: IEQ.redLight,
                    }}>
                        {initials(grupo.celulaName)}
                    </div>
                    <div>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: IEQ.offWhite }}>
                            {grupo.celulaName}
                        </div>
                        <div style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: "rgba(245,240,232,.5)", marginTop: 2 }}>
                            {grupo.casas.length} casa{grupo.casas.length !== 1 ? "s" : ""} de paz
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 16 }}>
                        {[
                            { val: grupo.casas.length, lbl: "CASAS",      color: IEQ.offWhite },
                            { val: concl,              lbl: "CONCLUÍDAS", color: IEQ.teal     },
                            { val: andamento,          lbl: "ANDAMENTO",  color: IEQ.yellow   },
                            { val: totalDec,           lbl: "DECISÕES",   color: IEQ.blueFade },
                        ].map(({ val, lbl, color }) => (
                            <div key={lbl} style={{ textAlign: "center" }}>
                                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color }}>{val}</div>
                                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".13em", color: "rgba(245,240,232,.28)" }}>{lbl}</div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handlePDF}
                        disabled={pdfLoading}
                        style={{
                            background: "rgba(200,16,46,.12)", color: IEQ.redLight,
                            border: "1px solid rgba(200,16,46,.3)", borderRadius: 7,
                            fontFamily: "'Cinzel',serif", fontSize: 8.5, fontWeight: 700, letterSpacing: ".13em",
                            cursor: pdfLoading ? "not-allowed" : "pointer",
                            padding: "7px 13px", display: "inline-flex", alignItems: "center", gap: 5,
                            transition: "all .2s", opacity: pdfLoading ? .6 : 1,
                        }}
                        onMouseEnter={(e) => { if (!pdfLoading) e.currentTarget.style.background = "rgba(200,16,46,.22)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(200,16,46,.12)"; }}
                    >
                        {pdfLoading
                            ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> GERANDO...</>
                            : <><FileDown size={12} /> BAIXAR PDF</>}
                    </button>

                    {aberta ? <ChevronUp size={14} color="rgba(245,240,232,.3)" /> : <ChevronDown size={14} color="rgba(245,240,232,.3)" />}
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
                        <div style={{ padding: "14px 16px" }}>
                            {grupo.casas.length === 0 ? (
                                <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: "rgba(245,240,232,.3)", textAlign: "center", padding: "20px 0" }}>
                                    Nenhuma casa encontrada.
                                </p>
                            ) : (
                                grupo.casas.map((c) => <CasaCard key={c.id} casa={c} />)
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

    // KPIs calculados a partir de TODOS os dados
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

    // Carrega células para o select
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/celulas");
                setCelulas(res.data || []);
            } catch (e) { console.warn("Erro ao carregar células:", e); }
        })();
    }, []);

    // Agrupa lista plana por célula
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

            // Aceita tanto lista plana quanto { content: [...] } (Page do Spring)
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

    // Carrega tudo ao montar
    useEffect(() => { buscar(); }, []);

    function limpar() {
        setFCelula(""); setFStatus(""); setFDini(""); setFDfim("");
        setTimeout(buscar, 0);
    }

    const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
    const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

    const globalStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .rdcp-select,.rdcp-input{
            background:rgba(255,255,255,.04);border:1px solid rgba(200,16,46,.15);
            border-radius:7px;color:${textPrimary};font-family:'EB Garamond',serif;
            font-size:13px;padding:8px 11px;outline:none;width:100%;
            -webkit-appearance:none;transition:border-color .2s;
        }
        .rdcp-select:focus,.rdcp-input:focus{border-color:#C8102E;}
        .rdcp-select option{background:#120809;}
        input[type="date"].rdcp-input::-webkit-calendar-picker-indicator{filter:invert(1) opacity(0.4);cursor:pointer}
    `;

    const kpis = [
        { lbl: "TOTAL CASAS",    val: kpiTotal, color: IEQ.red,      sub: "no período"                },
        { lbl: "CONCLUÍDAS",     val: kpiCon,   color: IEQ.teal,     sub: "encerradas"                },
        { lbl: "EM ANDAMENTO",   val: kpiAnd,   color: IEQ.yellow,   sub: "ativas"                    },
        { lbl: "TOTAL DECISÕES", val: kpiDec,   color: IEQ.blueFade, sub: "aceit. + reconc. + batis." },
        { lbl: "VISITANTES",     val: kpiVis,   color: IEQ.gray,     sub: "únicos registrados"        },
    ];

    return (
        <>
            <style>{globalStyles}</style>

            {/* Título */}
            <div style={{ marginBottom: 22 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".22em", color: "rgba(200,16,46,.55)" }}>
                    IEQ PITUAÇU · PAINEL PASTORAL
                </div>
                <div style={{
                    fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700, letterSpacing: ".16em", marginTop: 3,
                    background: "linear-gradient(90deg,#8B0B1F,#C8102E,#FDB813,#003DA5)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                    RELATÓRIOS · CASAS DE PAZ
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 20 }}>
                {kpis.map(({ lbl, val, color, sub }) => (
                    <div key={lbl} style={{
                        background: isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)",
                        border: "1px solid rgba(200,16,46,.15)", borderRadius: 11, padding: "14px 16px",
                        position: "relative", overflow: "hidden",
                    }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "11px 0 0 11px", background: color }} />
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".18em", color: "rgba(245,240,232,.3)", marginBottom: 8 }}>{lbl}</div>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 24, fontWeight: 700, lineHeight: 1, color: textPrimary }}>{val}</div>
                        <div style={{ fontFamily: "'EB Garamond',serif", fontSize: 11, color: textSec, marginTop: 4 }}>{sub}</div>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div style={{
                background: isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)",
                border: "1px solid rgba(200,16,46,.15)", borderRadius: 12,
                padding: "16px 18px", marginBottom: 20,
                display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end",
            }}>
                {[
                    { id: "cel", lbl: "CÉLULA", el: (
                            <select className="rdcp-select" value={fCelula} onChange={(e) => setFCelula(e.target.value)}>
                                <option value="">Todas as células</option>
                                {celulas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </select>
                        )},
                    { id: "sts", lbl: "STATUS", el: (
                            <select className="rdcp-select" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                                <option value="">Todos</option>
                                <option value="EM_ANDAMENTO">Em Andamento</option>
                                <option value="CONCLUIDA">Concluída</option>
                                <option value="CANCELADA">Cancelada</option>
                            </select>
                        )},
                    { id: "di", lbl: "DATA INÍCIO", el: <input className="rdcp-input" type="date" value={fDini} onChange={(e) => setFDini(e.target.value)} /> },
                    { id: "df", lbl: "DATA FIM",    el: <input className="rdcp-input" type="date" value={fDfim} onChange={(e) => setFDfim(e.target.value)} /> },
                ].map(({ id, lbl, el }) => (
                    <div key={id} style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 120 }}>
                        <label style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".18em", color: "rgba(245,240,232,.28)" }}>{lbl}</label>
                        {el}
                    </div>
                ))}
                <button onClick={buscar} style={{
                    background: "linear-gradient(135deg,#8B0B1F,#C8102E)", color: "#fff", border: "none", borderRadius: 7,
                    fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700, letterSpacing: ".14em",
                    cursor: "pointer", padding: "9px 18px", height: 37,
                    display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                }}>
                    <Filter size={13} /> FILTRAR
                </button>
                <button onClick={limpar} style={{
                    background: "rgba(255,255,255,.04)", color: textSec,
                    border: "1px solid rgba(200,16,46,.15)", borderRadius: 7,
                    fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700, letterSpacing: ".14em",
                    cursor: "pointer", padding: "9px 14px", height: 37,
                    display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", transition: "all .2s",
                }}>
                    <RotateCcw size={13} /> LIMPAR
                </button>
            </div>

            {/* Conteúdo */}
            {loading ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                    <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: IEQ.red }} />
                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".22em", color: "rgba(245,240,232,.3)", marginTop: 14 }}>
                        CARREGANDO RELATÓRIO...
                    </p>
                </div>
            ) : dados.length === 0 ? (
                <div style={{
                    background: isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)",
                    border: "1px solid rgba(200,16,46,.15)", borderRadius: 12,
                    padding: "50px 20px", textAlign: "center",
                }}>
                    <Home size={32} color="rgba(245,240,232,.2)" style={{ marginBottom: 14 }} />
                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".2em", color: "rgba(245,240,232,.3)" }}>
                        NENHUM RESULTADO ENCONTRADO
                    </p>
                    <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: "rgba(245,240,232,.25)", marginTop: 6 }}>
                        Tente ajustar os filtros ou limpar a busca.
                    </p>
                </div>
            ) : (
                <AnimatePresence>
                    {dados.map((grupo) => <CelulaSection key={grupo.celulaId} grupo={grupo} />)}
                </AnimatePresence>
            )}

            {/* Rodapé */}
            <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(200,16,46,.2),transparent)", marginTop: 32 }} />
            <p style={{ textAlign: "center", fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".18em", color: "rgba(245,240,232,.2)", padding: "20px 0 8px" }}>
                © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
            </p>
        </>
    );
}
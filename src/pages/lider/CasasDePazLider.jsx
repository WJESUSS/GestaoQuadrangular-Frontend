import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Plus, X, Loader2, CheckCircle2, ChevronDown, Search, Calendar } from "lucide-react";

const IEQ = {
    red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
    yellow: "#FDB813", blue: "#003DA5", blueDark: "#002470",
    blueLight: "#1A56C4", offWhite: "#F5F0E8",
};

const TOTAL_ENCONTROS = 7;

function BadgeStatus({ status }) {
    const s = (status || "").toLowerCase();
    if (s.includes("ativ")) return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 99, fontFamily: "'Cinzel',serif", fontSize: "8.5px", fontWeight: 700, letterSpacing: ".15em", color: "#7A9E7E", border: "1px solid rgba(122,158,126,.35)", background: "rgba(122,158,126,.1)" }}>● ATIVA</span>;
    if (s.includes("cancel")) return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 99, fontFamily: "'Cinzel',serif", fontSize: "8.5px", fontWeight: 700, letterSpacing: ".15em", color: IEQ.redLight, border: "1px solid rgba(200,16,46,.35)", background: "rgba(200,16,46,.1)" }}>● CANCELADA</span>;
    if (s.includes("conclu")) return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 99, fontFamily: "'Cinzel',serif", fontSize: "8.5px", fontWeight: 700, letterSpacing: ".15em", color: IEQ.yellow, border: "1px solid rgba(253,184,19,.35)", background: "rgba(253,184,19,.1)" }}>● CONCLUÍDA</span>;
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 99, fontFamily: "'Cinzel',serif", fontSize: "8.5px", fontWeight: 700, letterSpacing: ".15em", color: IEQ.yellow, border: "1px solid rgba(253,184,19,.35)", background: "rgba(253,184,19,.1)" }}>● PENDENTE</span>;
}

function IEQModal({ open, onClose, title, children, isDark, textPrimary, textSecondary }) {
    if (!open) return null;
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(10,6,8,.85)", backdropFilter: "blur(16px)", zIndex: 0 }} />
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 480, background: isDark ? "rgba(17,10,13,.98)" : "rgba(255,255,255,.97)", border: "1px solid rgba(200,16,46,.2)", borderRadius: "16px 16px 0 0", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "24px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexShrink: 0 }}>
                    <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 700, letterSpacing: ".15em", color: textPrimary, margin: 0 }}>{title}</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: textSecondary, padding: 4 }}><X size={18} /></button>
                </div>
                <div style={{ overflowY: "auto", flex: 1 }}>{children}</div>
            </motion.div>
        </div>
    );
}

// ─── Hook: busca membros filtrando pela célula do líder logado ────────────────
function useMembros(celulaId) {
    const [membros, setMembros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro]       = useState(null);

    const buscar = useCallback(async () => {
        if (!celulaId) return; // aguarda ter o id
        setLoading(true);
        setErro(null);
        try {
            // mesmo endpoint usado no carregarDados
            const res = await api.get(`/celulas/${celulaId}/membros`);
            setMembros(
                Array.isArray(res.data)
                    ? res.data
                    : res.data?.content ?? res.data?.data ?? []
            );
        } catch {
            setErro("Não foi possível carregar membros da célula.");
            setMembros([]);
        } finally {
            setLoading(false);
        }
    }, [celulaId]);

    return { membros, loading, erro, buscar };
}

function useVisitantes() {
    const [visitantes, setVisitantes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);
    const buscar = useCallback(async () => {
        setLoading(true); setErro(null);
        try {
            const res = await api.get("/visitantes");
            setVisitantes(Array.isArray(res.data) ? res.data : res.data?.content ?? res.data?.data ?? []);
        } catch { setErro("Não foi possível carregar visitantes."); setVisitantes([]); }
        finally { setLoading(false); }
    }, []);
    return { visitantes, loading, erro, buscar };
}

function PessoaSelector({ items, loading, erro, onSelect, selectedId, placeholder, textPrimary, textSecondary, isDark, labelKey = "nome" }) {
    const [busca, setBusca] = useState("");
    const filtrados = items.filter(p => (p[labelKey] ?? p.nomeCompleto ?? "").toLowerCase().includes(busca.toLowerCase()));
    const inputStyle = { width: "100%", background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)", border: `1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"}`, color: textPrimary, padding: "10px 14px 10px 36px", borderRadius: 8, outline: "none", fontFamily: "'EB Garamond',serif", fontSize: 14, boxSizing: "border-box" };

    if (loading) return <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0", color: textSecondary, fontFamily: "'EB Garamond',serif", fontSize: 13 }}><Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: IEQ.red }} /> Carregando...</div>;
    if (erro)    return <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: IEQ.redLight, padding: "12px 0" }}>{erro}</p>;

    return (
        <div>
            <div style={{ position: "relative", marginBottom: 10 }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: textSecondary, pointerEvents: "none" }} />
                <input className="cp-input" style={inputStyle} placeholder={placeholder} value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
            <div style={{ maxHeight: 220, overflowY: "auto", border: `1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.1)"}`, borderRadius: 8 }}>
                {filtrados.length === 0
                    ? <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: textSecondary, padding: "14px 16px", margin: 0 }}>
                        {busca ? `Nenhum resultado para "${busca}".` : "Nenhum membro encontrado na célula."}
                    </p>
                    : filtrados.map((p, i) => {
                        const nome = p[labelKey] ?? p.nomeCompleto ?? `#${p.id}`;
                        const sel  = selectedId === p.id;
                        return (
                            <div key={p.id} onClick={() => onSelect(p)}
                                 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", cursor: "pointer", background: sel ? (isDark ? "rgba(200,16,46,.18)" : "rgba(200,16,46,.08)") : "transparent", borderBottom: i < filtrados.length - 1 ? `1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.06)"}` : "none", transition: "background .15s" }}
                                 onMouseEnter={e => { if (!sel) e.currentTarget.style.background = isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)"; }}
                                 onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, color: sel ? IEQ.red : textSecondary }}>
                                        {nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: textPrimary, margin: 0, fontWeight: sel ? 600 : 400 }}>{nome}</p>
                                        {p.telefone && <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 11, color: textSecondary, margin: "1px 0 0" }}>{p.telefone}</p>}
                                    </div>
                                </div>
                                {sel && <CheckCircle2 size={16} color={IEQ.red} />}
                            </div>
                        );
                    })}
            </div>
            {selectedId && (() => {
                const p    = items.find(x => x.id === selectedId);
                const nome = p ? (p[labelKey] ?? p.nomeCompleto ?? `#${p.id}`) : "";
                return <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: "#7A9E7E", margin: "8px 0 0" }}>✓ Selecionado: <strong>{nome}</strong></p>;
            })()}
        </div>
    );
}

export default function CasasDePazLider({ celulaId, isDark = true }) {
    const [casas, setCasas]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    // ── Filtros ──────────────────────────────────────────────────────────────
    const [busca, setBusca]           = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim]       = useState("");

    const [modalCriar, setModalCriar]       = useState(false);
    const [modalVisitante, setModalVisitante] = useState(false);
    const [modalEncontro, setModalEncontro]   = useState(false);
    const [modalCancelar, setModalCancelar]   = useState(false);
    const [targetCasaId, setTargetCasaId]     = useState(null);
    const [targetCasaNome, setTargetCasaNome] = useState("");
    const [fCriar, setFCriar] = useState({ nome: "", endereco: "", nomeAnfitriao: "", lider: null, auxiliar: null });
    const [visitanteSelecionado, setVisitanteSelecionado] = useState(null);
    const [fEnc, setFEnc]     = useState({ data: new Date().toISOString().split("T")[0], decisoesPorVisitante: [] });
    const [submitting, setSubmitting] = useState(false);

    // ── Hook membros agora recebe celulaId → filtra pela célula ──────────────
    const membrosHook    = useMembros(celulaId);
    const visitantesHook = useVisitantes();

    const textPrimary   = isDark ? IEQ.offWhite : "#1A0A0D";
    const textSecondary = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
    const cardBg        = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
    const cardBorder    = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";
    const ieqCard       = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, backdropFilter: "blur(24px)" };
    const inputStyle    = { width: "100%", background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)", border: `1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"}`, color: textPrimary, padding: "12px 14px", borderRadius: 8, outline: "none", fontFamily: "'EB Garamond',serif", fontSize: 15, boxSizing: "border-box" };
    const labelStyle    = { fontFamily: "'Cinzel',serif", fontSize: "8.5px", letterSpacing: ".18em", color: textSecondary, margin: "0 0 6px", display: "block" };

    const globalCss = `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes cpfadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .cp-card-anim{animation:cpfadeUp .45s ease both}
        .cp-casa-card{transition:border-color .25s,box-shadow .25s}
        .cp-casa-card:hover{border-color:rgba(200,16,46,.4)!important;box-shadow:0 8px 28px rgba(200,16,46,.1)}
        .cp-btn-ghost{background:${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.06)"};color:${isDark ? IEQ.offWhite : "#8B0B1F"};border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};border-radius:8px;font-family:'Cinzel',serif;font-size:9.5px;font-weight:700;letter-spacing:.14em;cursor:pointer;transition:all .25s;padding:9px 14px}
        .cp-btn-ghost:hover{border-color:${IEQ.red};background:rgba(200,16,46,.1)}
        .cp-btn-primary{background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red});color:#fff;border:none;border-radius:8px;font-family:'Cinzel',serif;font-size:10px;font-weight:700;letter-spacing:.15em;cursor:pointer;padding:11px 20px;transition:all .25s;display:inline-flex;align-items:center;gap:8px}
        .cp-btn-primary:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.1)}
        .cp-btn-primary:disabled{opacity:.5;cursor:not-allowed}
        .cp-btn-blue{background:linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue});color:#fff;border:none;border-radius:8px;font-family:'Cinzel',serif;font-size:10px;font-weight:700;letter-spacing:.15em;cursor:pointer;padding:11px 20px;transition:all .25s;display:inline-flex;align-items:center;gap:8px}
        .cp-btn-blue:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.1)}
        .cp-btn-blue:disabled{opacity:.5;cursor:not-allowed}
        .cp-btn-sage{background:rgba(122,158,126,.12);color:#7A9E7E;border:1px solid rgba(122,158,126,.3);border-radius:8px;font-family:'Cinzel',serif;font-size:9px;font-weight:700;letter-spacing:.14em;cursor:pointer;padding:9px 14px;transition:all .2s}
        .cp-btn-sage:hover{background:rgba(122,158,126,.2)}
        .cp-btn-danger{background:rgba(200,16,46,.1);color:${IEQ.redLight};border:1px solid rgba(200,16,46,.3);border-radius:8px;font-family:'Cinzel',serif;font-size:9px;font-weight:700;letter-spacing:.14em;cursor:pointer;padding:9px 14px;transition:all .2s}
        .cp-btn-danger:hover{background:rgba(200,16,46,.2)}
        .cp-btn-clear{background:transparent;color:${textSecondary};border:1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"};border-radius:8px;font-family:'Cinzel',serif;font-size:8.5px;font-weight:700;letter-spacing:.12em;cursor:pointer;padding:8px 12px;transition:all .2s;white-space:nowrap}
        .cp-btn-clear:hover{border-color:${IEQ.red};color:${IEQ.redLight}}
        .cp-input:focus{border-color:${IEQ.red}!important;box-shadow:0 0 0 3px rgba(200,16,46,.12)}
        .cp-input::placeholder{color:${isDark ? "rgba(245,240,232,.22)" : "rgba(26,10,13,.3)"}}
        .cp-input option{background:${isDark ? "#110A0D" : "#fff"}}
        input[type="date"].cp-input::-webkit-calendar-picker-indicator{filter:${isDark ? "invert(1) opacity(0.4)" : "opacity(0.5)"};cursor:pointer}
        @media(min-width:500px){.cp-stats-responsive{grid-template-columns:repeat(4,1fr)!important}}
        @media(min-width:600px){.cp-filters-grid{grid-template-columns:1fr 1fr!important}}
    `;

    const carregarCasas = useCallback(async () => {
        try {
            setLoading(true);
            const url = celulaId ? `/api/casas-de-paz?celulaId=${celulaId}` : "/api/casas-de-paz";
            const res = await api.get(url);
            setCasas(Array.isArray(res.data) ? res.data : res.data?.content ?? []);
        } catch (err) { console.error(err); setCasas([]); }
        finally { setLoading(false); }
    }, [celulaId]);

    useEffect(() => { carregarCasas(); }, [carregarCasas]);

    // ── Filtragem ─────────────────────────────────────────────────────────────
    const casasFiltradas = casas.filter(c => {
        const textoOk = (c.nome ?? "").toLowerCase().includes(busca.toLowerCase()) ||
            (c.endereco ?? "").toLowerCase().includes(busca.toLowerCase());
        const dataInicioStr  = c.dataInicio ?? c.dataInicioAtividade ?? c.dataCriacao ?? null;
        const dataInicioCasa = dataInicioStr ? new Date(dataInicioStr) : null;
        const inicioOk = !dataInicio || (dataInicioCasa && dataInicioCasa >= new Date(dataInicio));
        const fimOk    = !dataFim    || (dataInicioCasa && dataInicioCasa <= new Date(dataFim + "T23:59:59"));
        return textoOk && inicioOk && fimOk;
    });

    const temFiltroData = dataInicio || dataFim;
    const limparFiltros = () => { setBusca(""); setDataInicio(""); setDataFim(""); };

    // ── Modais ────────────────────────────────────────────────────────────────
    const abrirModalCriar = () => {
        setFCriar({ nome: "", endereco: "", nomeAnfitriao: "", lider: null, auxiliar: null });
        membrosHook.buscar(); // já filtra por celulaId dentro do hook
        setModalCriar(true);
    };

    const abrirModalVisitante = (casaId) => {
        setTargetCasaId(casaId);
        setVisitanteSelecionado(null);
        visitantesHook.buscar();
        setModalVisitante(true);
    };

    const abrirModalEncontro = (casaId) => {
        const casa = casas.find(c => c.id === casaId);
        setTargetCasaId(casaId);
        const visitantesDaCasa = (casa?.visitantes ?? []).map(v => ({
            visitanteId:   v.id,
            visitanteNome: v.nome ?? v.nomeCompleto ?? `#${v.id}`,
            aceitouJesus:  false,
            reconciliacao: false,
            desejoBatismo: false,
        }));
        setFEnc({ data: new Date().toISOString().split("T")[0], decisoesPorVisitante: visitantesDaCasa });
        setModalEncontro(true);
    };

    const abrirModalCancelar = (casaId, casaNome) => {
        setTargetCasaId(casaId);
        setTargetCasaNome(casaNome || "");
        setModalCancelar(true);
    };

    const toggleDecisao = (visitanteId, campo) => {
        setFEnc(f => ({
            ...f,
            decisoesPorVisitante: f.decisoesPorVisitante.map(d =>
                d.visitanteId === visitanteId ? { ...d, [campo]: !d[campo] } : d
            ),
        }));
    };

    // ── Estatísticas ──────────────────────────────────────────────────────────
    const totalCasas       = casas.length;
    const casasAtivas      = casas.filter(c => (c.status || "").toLowerCase().includes("ativ")).length;
    const totalVisitantes  = casas.reduce((s, c) => s + (c.visitantes || []).length, 0);
    const totalEncontros   = casas.reduce((s, c) => s + (c.encontrosRealizados ?? 0), 0);

    // ── Ações ─────────────────────────────────────────────────────────────────
    const criarCasa = async () => {
        if (!fCriar.nome.trim())        return alert("Informe o nome da casa.");
        if (!fCriar.nomeAnfitriao.trim()) return alert("Informe o nome do anfitrião.");
        if (!fCriar.lider)              return alert("Selecione o líder.");
        if (!fCriar.auxiliar)           return alert("Selecione o auxiliar.");
        if (fCriar.lider.id === fCriar.auxiliar.id)
            return alert("Líder e auxiliar devem ser pessoas diferentes.");
        setSubmitting(true);
        try {
            await api.post("/api/casas-de-paz", {
                nome:             fCriar.nome.trim(),
                nomeAnfitriao:    fCriar.nomeAnfitriao.trim(),
                endereco:         fCriar.endereco.trim(),
                telefoneContato:  fCriar.telefoneContato || "",
                dataInicio:       new Date().toISOString().split("T")[0],
                celulaId,
                liderId:          fCriar.lider.id,
                auxiliarId:       fCriar.auxiliar.id,
            });
            setModalCriar(false);
            carregarCasas();
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao criar casa.");
        } finally {
            setSubmitting(false);
        }
    };

    const adicionarVisitante = async () => {
        if (!visitanteSelecionado) return alert("Selecione um visitante.");
        setSubmitting(true);
        try {
            await api.post(`/api/casas-de-paz/${targetCasaId}/visitantes/${visitanteSelecionado.id}`);
            setModalVisitante(false);
            setVisitanteSelecionado(null);
            carregarCasas();
        } catch (err) { alert(err.response?.data?.message || "Erro ao adicionar visitante."); }
        finally { setSubmitting(false); }
    };

    const registrarEncontro = async () => {
        if (!fEnc.data) return alert("Informe a data.");
        setSubmitting(true);
        try {
            const decisoes = fEnc.decisoesPorVisitante.flatMap(d => {
                const lista = [];
                if (d.aceitouJesus)  lista.push({ visitanteId: d.visitanteId, tipoDecisao: "ACEITOU_JESUS" });
                if (d.reconciliacao) lista.push({ visitanteId: d.visitanteId, tipoDecisao: "RECONCILIOU" });
                if (d.desejoBatismo) lista.push({ visitanteId: d.visitanteId, tipoDecisao: "BATISMO_AGUAS" });
                return lista;
            });
            await api.post(`/api/casas-de-paz/${targetCasaId}/encontros`, {
                dataEncontro: fEnc.data,
                observacoes:  "",
                decisoes,
            });
            setModalEncontro(false);
            setFEnc({ data: new Date().toISOString().split("T")[0], decisoesPorVisitante: [] });
            carregarCasas();
        } catch (err) { alert(err.response?.data?.message || "Erro ao registrar encontro."); }
        finally { setSubmitting(false); }
    };

    const cancelarCasa = async () => {
        setSubmitting(true);
        try {
            await api.patch(`/api/casas-de-paz/${targetCasaId}/cancelar`);
            setModalCancelar(false);
            carregarCasas();
        } catch (err) { alert(err.response?.data?.message || "Erro ao cancelar."); }
        finally { setSubmitting(false); }
    };

    if (loading) return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
            <style>{globalCss}</style>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: IEQ.red }} />
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".2em", color: textSecondary, marginTop: 14 }}>CARREGANDO CASAS DE PAZ...</p>
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <style>{globalCss}</style>

            {/* Título */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,61,165,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Home size={20} color={IEQ.blue} /></div>
                    <div>
                        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, letterSpacing: ".16em", color: textPrimary, margin: 0 }}>CASAS DE PAZ</h2>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textSecondary, margin: "2px 0 0" }}>Gerencie suas casas, visitantes e encontros</p>
                    </div>
                </div>
                <button className="cp-btn-primary" onClick={abrirModalCriar}><Plus size={14} /> NOVA CASA</button>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }} className="cp-stats-responsive">
                {[
                    { label: "TOTAL",       value: totalCasas,      color: textPrimary,    sub: "casas"        },
                    { label: "ATIVAS",      value: casasAtivas,     color: "#7A9E7E",      sub: "funcionando"  },
                    { label: "VISITANTES",  value: totalVisitantes, color: IEQ.yellow,     sub: "cadastrados"  },
                    { label: "ENCONTROS",   value: totalEncontros,  color: IEQ.blueLight,  sub: "realizados"   },
                ].map((s, i) => (
                    <div key={s.label} className="cp-card-anim" style={{ ...ieqCard, padding: "18px 20px", animationDelay: `${i * 0.07}s` }}>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8.5px", letterSpacing: ".2em", color: textSecondary, margin: 0 }}>{s.label}</p>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 28, fontWeight: 700, color: s.color, margin: "4px 0 2px" }}>{s.value}</p>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: textSecondary, margin: 0 }}>{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Lista ────────────────────────────────────────────────────────── */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".18em", color: textPrimary, margin: 0 }}>LISTA DE CASAS</p>
                    <button className="cp-btn-ghost" onClick={carregarCasas}>↻ ATUALIZAR</button>
                </div>

                {/* Filtros */}
                <div style={{ ...ieqCard, padding: "16px 18px", marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8.5px", letterSpacing: ".18em", color: textSecondary, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                            <Search size={11} /> FILTROS DE BUSCA
                        </p>
                        {(busca || temFiltroData) && (
                            <button className="cp-btn-clear" onClick={limparFiltros}>✕ LIMPAR FILTROS</button>
                        )}
                    </div>
                    <div style={{ position: "relative" }}>
                        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: textSecondary, pointerEvents: "none" }} />
                        <input className="cp-input" style={{ ...inputStyle, paddingLeft: 36, fontSize: 14 }} placeholder="Buscar por nome ou endereço..." value={busca} onChange={e => setBusca(e.target.value)} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }} className="cp-filters-grid">
                        <div>
                            <p style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 5 }}><Calendar size={9} /> DATA INÍCIO — DE</p>
                            <input type="date" className="cp-input" style={inputStyle} value={dataInicio} max={dataFim || undefined} onChange={e => setDataInicio(e.target.value)} />
                        </div>
                        <div>
                            <p style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 5 }}><Calendar size={9} /> DATA INÍCIO — ATÉ</p>
                            <input type="date" className="cp-input" style={inputStyle} value={dataFim} min={dataInicio || undefined} onChange={e => setDataFim(e.target.value)} />
                        </div>
                    </div>
                    {(busca || temFiltroData) && (
                        <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 12, color: textSecondary, margin: 0 }}>
                            {casasFiltradas.length === 0
                                ? "Nenhuma casa encontrada com os filtros aplicados."
                                : `${casasFiltradas.length} casa${casasFiltradas.length !== 1 ? "s" : ""} encontrada${casasFiltradas.length !== 1 ? "s" : ""}.`}
                        </p>
                    )}
                </div>

                {/* Cards */}
                {casas.length === 0 ? (
                    <div style={{ ...ieqCard, textAlign: "center", padding: "56px 24px" }}>
                        <Home size={36} style={{ color: textSecondary, marginBottom: 14 }} />
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: ".18em", color: textSecondary, margin: "0 0 6px" }}>NENHUMA CASA CADASTRADA</p>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 14, color: textSecondary }}>Clique em "Nova Casa" para começar.</p>
                    </div>
                ) : casasFiltradas.length === 0 ? (
                    <div style={{ ...ieqCard, textAlign: "center", padding: "40px 24px" }}>
                        <Search size={28} style={{ color: textSecondary, marginBottom: 12 }} />
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: ".18em", color: textSecondary, margin: "0 0 6px" }}>NENHUM RESULTADO</p>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: textSecondary }}>Ajuste os filtros para encontrar uma casa.</p>
                    </div>
                ) : casasFiltradas.map((c, i) => {
                    const isOpen     = expandedId === c.id;
                    const visitantes = c.visitantes || [];
                    const encontros  = c.encontros  || [];
                    const cancelada  = (c.status || "").toLowerCase().includes("cancel");

                    let realizados, restantes;
                    if (c.encontrosRestantes !== undefined && c.encontrosRestantes !== null) {
                        restantes  = c.encontrosRestantes;
                        realizados = TOTAL_ENCONTROS - restantes;
                    } else if (c.encontrosRealizados !== undefined && c.encontrosRealizados !== null) {
                        realizados = c.encontrosRealizados;
                        restantes  = TOTAL_ENCONTROS - realizados;
                    } else if (encontros.length > 0) {
                        realizados = encontros.length;
                        restantes  = Math.max(0, TOTAL_ENCONTROS - realizados);
                    } else {
                        realizados = 0;
                        restantes  = TOTAL_ENCONTROS;
                    }
                    realizados = Math.max(0, Math.min(realizados, TOTAL_ENCONTROS));
                    restantes  = Math.max(0, Math.min(restantes,  TOTAL_ENCONTROS));
                    const concluida = restantes === 0 && !cancelada;

                    return (
                        <motion.div key={c.id} className="cp-card-anim cp-casa-card"
                                    style={{ ...ieqCard, marginBottom: 10, overflow: "hidden", animationDelay: `${i * 0.06}s`, borderColor: concluida ? "rgba(122,158,126,.4)" : isOpen ? "rgba(200,16,46,.4)" : cardBorder }}
                                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        >
                            {/* Header */}
                            <div onClick={() => setExpandedId(isOpen ? null : c.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer", gap: 12, flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0, background: concluida ? "rgba(122,158,126,.15)" : "linear-gradient(135deg,rgba(200,16,46,.15),rgba(0,61,165,.15))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                                        {concluida ? "🏠" : "🏡"}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700, letterSpacing: ".1em", color: textPrimary, margin: 0 }}>{c.nome || "Casa " + c.id}</p>
                                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: textSecondary, margin: "2px 0 0" }}>{c.endereco || "Endereço não informado"}</p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                                    <div style={{ textAlign: "center", width: 44, height: 44, borderRadius: "50%", border: `2px solid ${concluida ? "#7A9E7E" : "rgba(200,16,46,.3)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: concluida ? "#7A9E7E" : textPrimary, lineHeight: 1 }}>{restantes}</span>
                                        <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 9, color: textSecondary, lineHeight: 1, marginTop: 2 }}>rest.</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 14 }}>
                                        <div style={{ textAlign: "center" }}>
                                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: textPrimary, margin: 0 }}>{visitantes.length}</p>
                                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 11, color: textSecondary, margin: 0 }}>visitas</p>
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: concluida ? "#7A9E7E" : textPrimary, margin: 0 }}>{realizados}/{TOTAL_ENCONTROS}</p>
                                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 11, color: textSecondary, margin: 0 }}>encontros</p>
                                        </div>
                                    </div>
                                    <BadgeStatus status={concluida ? "concluida" : c.status} />
                                    <ChevronDown size={16} color={textSecondary} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .25s" }} />
                                </div>
                            </div>

                            <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${concluida ? "rgba(122,158,126,.3)" : isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"},transparent)`, margin: "0 20px" }} />

                            {concluida && (
                                <div style={{ margin: "12px 20px 4px", padding: "16px 20px", borderRadius: 10, background: isDark ? "rgba(122,158,126,.1)" : "rgba(122,158,126,.07)", border: "1px solid rgba(122,158,126,.35)", display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ fontSize: 28, flexShrink: 0 }}>🎉</div>
                                    <div>
                                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".18em", color: "#7A9E7E", margin: "0 0 4px" }}>CASA CONCLUÍDA!</p>
                                        <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: textSecondary, margin: 0 }}>Todos os {TOTAL_ENCONTROS} encontros foram realizados com sucesso.</p>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: "flex", gap: 8, padding: "12px 20px", flexWrap: "wrap" }}>
                                {!cancelada && !concluida && <button className="cp-btn-sage"   onClick={() => abrirModalVisitante(c.id)}>+ VISITANTE</button>}
                                {!cancelada && !concluida && <button className="cp-btn-ghost"  onClick={() => abrirModalEncontro(c.id)}>📋 ENCONTRO</button>}
                                {!cancelada              && <button className="cp-btn-danger"  onClick={() => abrirModalCancelar(c.id, c.nome)}>✕ CANCELAR</button>}
                            </div>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }} style={{ overflow: "hidden" }}>
                                        <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 14, borderTop: `1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}` }}>
                                            {(c.liderNome || c.auxiliarNome) && (
                                                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                                    {[{ label: "LÍDER", nome: c.liderNome }, { label: "AUXILIAR", nome: c.auxiliarNome }].map(({ label, nome }) => nome ? (
                                                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                            <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "rgba(200,16,46,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, color: IEQ.red }}>
                                                                {nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: ".15em", color: textSecondary, margin: 0 }}>{label}</p>
                                                                <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: textPrimary, margin: 0 }}>{nome}</p>
                                                            </div>
                                                        </div>
                                                    ) : null)}
                                                </div>
                                            )}

                                            <div>
                                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8.5px", letterSpacing: ".2em", color: textSecondary, margin: "0 0 10px" }}>👥 VISITANTES ({visitantes.length})</p>
                                                {visitantes.length ? (
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                        {visitantes.map((v, vi) => (
                                                            <div key={vi} style={{ background: isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.06)", border: `1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.1)"}`, borderRadius: 99, padding: "5px 14px", fontFamily: "'EB Garamond',serif", fontSize: 13, color: textPrimary, display: "flex", alignItems: "center", gap: 6 }}>
                                                                <span>👤</span><span>{v.nome ?? v.nomeCompleto ?? v.name ?? v}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: textSecondary }}>Nenhum visitante cadastrado ainda.</p>}
                                            </div>

                                            <div>
                                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8.5px", letterSpacing: ".2em", color: textSecondary, margin: "0 0 10px" }}>📋 ENCONTROS ({realizados}/{TOTAL_ENCONTROS})</p>
                                                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                                                    {Array.from({ length: TOTAL_ENCONTROS }, (_, idx) => (
                                                        <div key={idx} style={{ flex: 1, height: 4, borderRadius: 99, background: idx < realizados ? (idx < realizados - 1 ? IEQ.red : IEQ.yellow) : (isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"), transition: "background .3s" }} />
                                                    ))}
                                                </div>
                                                {encontros.length ? encontros.slice(-TOTAL_ENCONTROS).reverse().map((e, ei) => (
                                                    <div key={ei} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 0", borderBottom: ei < Math.min(TOTAL_ENCONTROS - 1, encontros.length - 1) ? `1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.06)"}` : "none" }}>
                                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: IEQ.yellow, marginTop: 5, flexShrink: 0 }} />
                                                        <div>
                                                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, fontWeight: 500, color: textPrimary, margin: 0 }}>Encontro {encontros.length - ei}</p>
                                                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: textSecondary, margin: "1px 0 4px" }}>
                                                                {(e.dataEncontro || e.data) ? new Date(e.dataEncontro ?? e.data).toLocaleDateString("pt-BR") : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )) : <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: textSecondary }}>Nenhum encontro registrado.</p>}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* MODAIS */}
            <AnimatePresence>

                {/* CRIAR CASA */}
                {modalCriar && (
                    <IEQModal open={modalCriar} onClose={() => setModalCriar(false)} title="NOVA CASA DE PAZ" isDark={isDark} textPrimary={textPrimary} textSecondary={textSecondary}>
                        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <p style={labelStyle}>NOME DA CASA *</p>
                                    <input className="cp-input" style={inputStyle} placeholder="Casa da Esperança" value={fCriar.nome} onChange={e => setFCriar(f => ({ ...f, nome: e.target.value }))} />
                                </div>
                                <div>
                                    <p style={labelStyle}>NOME DO ANFITRIÃO *</p>
                                    <input className="cp-input" style={inputStyle} placeholder="João Silva" value={fCriar.nomeAnfitriao} onChange={e => setFCriar(f => ({ ...f, nomeAnfitriao: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <p style={labelStyle}>ENDEREÇO</p>
                                <input className="cp-input" style={inputStyle} placeholder="Rua, número, bairro" value={fCriar.endereco} onChange={e => setFCriar(f => ({ ...f, endereco: e.target.value }))} />
                            </div>

                            {/* Líder — apenas membros da célula */}
                            <div>
                                <p style={labelStyle}>
                                    LÍDER * <span style={{ fontWeight: 400, opacity: .6 }}>— membros da sua célula</span>
                                </p>
                                <PessoaSelector
                                    items={membrosHook.membros}
                                    loading={membrosHook.loading}
                                    erro={membrosHook.erro}
                                    selectedId={fCriar.lider?.id}
                                    onSelect={p => setFCriar(f => ({ ...f, lider: p }))}
                                    placeholder="Pesquisar líder..."
                                    textPrimary={textPrimary}
                                    textSecondary={textSecondary}
                                    isDark={isDark}
                                />
                            </div>

                            {/* Auxiliar — exclui quem já foi escolhido como líder */}
                            <div>
                                <p style={labelStyle}>
                                    AUXILIAR * <span style={{ fontWeight: 400, opacity: .6 }}>— membros da sua célula</span>
                                </p>
                                <PessoaSelector
                                    items={membrosHook.membros.filter(m => m.id !== fCriar.lider?.id)}
                                    loading={membrosHook.loading}
                                    erro={membrosHook.erro}
                                    selectedId={fCriar.auxiliar?.id}
                                    onSelect={p => setFCriar(f => ({ ...f, auxiliar: p }))}
                                    placeholder="Pesquisar auxiliar..."
                                    textPrimary={textPrimary}
                                    textSecondary={textSecondary}
                                    isDark={isDark}
                                />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="cp-btn-ghost" style={{ flex: 1 }} onClick={() => setModalCriar(false)}>CANCELAR</button>
                            <button className="cp-btn-primary" style={{ flex: 2, justifyContent: "center" }} onClick={criarCasa} disabled={submitting}>
                                {submitting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "CRIAR CASA"}
                            </button>
                        </div>
                    </IEQModal>
                )}

                {/* ADICIONAR VISITANTE */}
                {modalVisitante && (
                    <IEQModal open={modalVisitante} onClose={() => setModalVisitante(false)} title="ADICIONAR VISITANTE" isDark={isDark} textPrimary={textPrimary} textSecondary={textSecondary}>
                        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                            <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: textSecondary, margin: 0 }}>Selecione um visitante já cadastrado no sistema.</p>
                            <PessoaSelector items={visitantesHook.visitantes} loading={visitantesHook.loading} erro={visitantesHook.erro} selectedId={visitanteSelecionado?.id} onSelect={setVisitanteSelecionado} placeholder="Pesquisar visitante..." textPrimary={textPrimary} textSecondary={textSecondary} isDark={isDark} />
                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="cp-btn-ghost" style={{ flex: 1 }} onClick={() => setModalVisitante(false)}>CANCELAR</button>
                            <button className="cp-btn-blue" style={{ flex: 2, justifyContent: "center" }} onClick={adicionarVisitante} disabled={submitting || !visitanteSelecionado}>
                                {submitting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "ADICIONAR"}
                            </button>
                        </div>
                    </IEQModal>
                )}

                {/* REGISTRAR ENCONTRO */}
                {modalEncontro && (
                    <IEQModal open={modalEncontro} onClose={() => setModalEncontro(false)} title="REGISTRAR ENCONTRO" isDark={isDark} textPrimary={textPrimary} textSecondary={textSecondary}>
                        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <p style={labelStyle}>DATA *</p>
                                <input className="cp-input" style={inputStyle} type="date" value={fEnc.data} onChange={e => setFEnc(f => ({ ...f, data: e.target.value }))} />
                            </div>
                            <div>
                                <p style={labelStyle}>DECISÕES POR VISITANTE</p>
                                {fEnc.decisoesPorVisitante.length === 0 ? (
                                    <div style={{ border: `1px dashed ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}`, borderRadius: 10, padding: "24px 16px", textAlign: "center" }}>
                                        <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: textSecondary, margin: 0, lineHeight: 1.6 }}>
                                            Nenhum visitante cadastrado nesta casa.<br />
                                            Adicione visitantes antes de registrar decisões.
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {fEnc.decisoesPorVisitante.map(d => (
                                            <div key={d.visitanteId} style={{ borderRadius: 10, border: `1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.1)"}`, background: isDark ? "rgba(255,255,255,.02)" : "rgba(200,16,46,.02)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: isDark ? "rgba(253,184,19,.12)" : "rgba(253,184,19,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, color: IEQ.yellow }}>
                                                        {d.visitanteNome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                                                    </div>
                                                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: textPrimary, margin: 0 }}>{d.visitanteNome}</p>
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 40 }}>
                                                    {[
                                                        { key: "aceitouJesus",  emoji: "🙏", label: "Aceitou Jesus",      color: "#7A9E7E"      },
                                                        { key: "reconciliacao", emoji: "🕊️", label: "Reconciliação",       color: IEQ.blueLight  },
                                                        { key: "desejoBatismo", emoji: "💧", label: "Desejo de Batismo",   color: IEQ.yellow     },
                                                    ].map(({ key, emoji, label, color }) => {
                                                        const checked = d[key];
                                                        return (
                                                            <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "7px 10px", borderRadius: 8, background: checked ? `${color}18` : "transparent", border: `1px solid ${checked ? color + "50" : "transparent"}`, transition: "all .15s" }}>
                                                                <input type="checkbox" checked={checked} onChange={() => toggleDecisao(d.visitanteId, key)} style={{ width: 15, height: 15, accentColor: color, cursor: "pointer", flexShrink: 0 }} />
                                                                <span style={{ fontSize: 14 }}>{emoji}</span>
                                                                <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: checked ? color : textPrimary, fontWeight: checked ? 600 : 400, transition: "color .15s" }}>{label}</span>
                                                                {checked && <CheckCircle2 size={13} color={color} style={{ marginLeft: "auto", flexShrink: 0 }} />}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {fEnc.decisoesPorVisitante.some(d => d.aceitouJesus || d.reconciliacao || d.desejoBatismo) && (
                                <div style={{ background: isDark ? "rgba(122,158,126,.08)" : "rgba(122,158,126,.06)", border: "1px solid rgba(122,158,126,.25)", borderRadius: 10, padding: "12px 16px" }}>
                                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: ".2em", color: "#7A9E7E", margin: "0 0 8px" }}>RESUMO DAS DECISÕES</p>
                                    {fEnc.decisoesPorVisitante.filter(d => d.aceitouJesus || d.reconciliacao || d.desejoBatismo).map(d => (
                                        <div key={d.visitanteId} style={{ marginBottom: 6 }}>
                                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, color: textPrimary, margin: "0 0 2px", fontWeight: 500 }}>{d.visitanteNome}</p>
                                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                {d.aceitouJesus  && <span style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: ".1em", color: "#7A9E7E"     }}>🙏 ACEITOU JESUS</span>}
                                                {d.reconciliacao && <span style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: ".1em", color: IEQ.blueLight }}>🕊️ RECONCILIAÇÃO</span>}
                                                {d.desejoBatismo && <span style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: ".1em", color: IEQ.yellow    }}>💧 BATISMO</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="cp-btn-ghost" style={{ flex: 1 }} onClick={() => setModalEncontro(false)}>CANCELAR</button>
                            <button className="cp-btn-blue" style={{ flex: 2, justifyContent: "center" }} onClick={registrarEncontro} disabled={submitting}>
                                {submitting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "REGISTRAR"}
                            </button>
                        </div>
                    </IEQModal>
                )}

                {/* CANCELAR CASA */}
                {modalCancelar && (
                    <IEQModal open={modalCancelar} onClose={() => setModalCancelar(false)} title="CANCELAR CASA" isDark={isDark} textPrimary={textPrimary} textSecondary={textSecondary}>
                        <div style={{ padding: "16px 24px 20px" }}>
                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 15, color: textPrimary, lineHeight: 1.6 }}>
                                Tem certeza que deseja cancelar <strong>"{targetCasaNome}"</strong>? Esta ação não poderá ser desfeita facilmente.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
                            <button className="cp-btn-ghost" style={{ flex: 1 }} onClick={() => setModalCancelar(false)}>VOLTAR</button>
                            <button className="cp-btn-danger" style={{ flex: 2, padding: "12px 20px", fontFamily: "'Cinzel',serif", fontSize: "10px", fontWeight: 700, letterSpacing: ".15em", cursor: "pointer", borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center" }} onClick={cancelarCasa} disabled={submitting}>
                                {submitting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "SIM, CANCELAR"}
                            </button>
                        </div>
                    </IEQModal>
                )}

            </AnimatePresence>
        </div>
    );
}
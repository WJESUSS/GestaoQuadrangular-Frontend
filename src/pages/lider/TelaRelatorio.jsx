import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api.js";
import {
  Calendar, BookOpen, Loader2, ChevronDown,
  UserCheck, ClipboardCheck, Trophy, Users2, CheckCircle2,
  Edit3, ArrowLeft, AlertTriangle, History,
} from "lucide-react";

/* ─── Cores Oficiais IEQ ─── */
const IEQ = {
  red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
  yellow: "#FDB813", yellowDark: "#C48C00",
  blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
  white: "#FFFFFF", offWhite: "#F5F0E8",
  dark: "#0A0608", darkCard: "#110A0D",
};

const draftKey = (celulaId) => `ieq_relatorio_draft_${celulaId}`;

function QuadrangularCross({ size = 32 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gVR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={IEQ.redLight} /><stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHR" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={IEQ.blueDark} /><stop offset="50%" stopColor={IEQ.blueLight} /><stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowR"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect x="38" y="4" width="24" height="92" rx="3" fill="url(#gVR)" filter="url(#glowR)" />
        <rect x="4" y="38" width="92" height="24" rx="3" fill="url(#gHR)" filter="url(#glowR)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowR)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

/* ══════════════════════════════════════════════════════
   TELA DE EDIÇÃO DE RELATÓRIO EXISTENTE
══════════════════════════════════════════════════════ */
function TelaEditarRelatorio({ relatorioId, onVoltar, onSalvo, isDark = false }) {
  const [loading,       setLoading]       = useState(true);
  const [salvando,      setSalvando]      = useState(false);
  const [pessoas,       setPessoas]       = useState([]);
  const [nomeCelula,    setNomeCelula]    = useState("");
  const [nomeLider,     setNomeLider]     = useState("");
  const [celulaId,      setCelulaId]      = useState(null);
  const [sucesso,       setSucesso]       = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());

  const [form, setForm] = useState({
    dataReuniao: "",
    estudo: "",
    selecionadosKeys: [],
    decisoes: {},
  });

  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const selectBg = isDark ? "#1a0a0d" : "#ffffff";

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const headers = { Authorization: `Bearer ${token}` };

      const resRelatorio = await api.get(`/relatorios/${relatorioId}`, { headers });
      const rel = resRelatorio.data;

      setNomeCelula(rel.nomeCelula || "");
      setNomeLider(rel.nomeLider || "");
      setCelulaId(rel.celulaId);

      const [resMembros, resVisitantes] = await Promise.all([
        api.get(`/celulas/${rel.celulaId}/membros`, { headers }),
        api.get(`/visitantes/celula/${rel.celulaId}/ativos`, { headers }),
      ]);

      const membros    = (resMembros.data    || []).map(m => ({ id: m.id, nome: m.nome, tipo: "MEMBRO",    uKey: `MEMBRO-${m.id}` }));
      const visitantes = (resVisitantes.data || []).map(v => ({ id: v.id, nome: v.nome, tipo: "VISITANTE", uKey: `VISITANTE-${v.id}` }));
      setPessoas([...membros, ...visitantes].sort((a, b) => a.nome.localeCompare(b.nome)));

      const keysPresentes = [
        ...(rel.membrosPresentes    || []).map(m => `MEMBRO-${m.id}`),
        ...(rel.visitantesPresentes || []).map(v => `VISITANTE-${v.id}`),
      ];

      const decisoesIniciais = {};
      (rel.visitantesPresentes || []).forEach(v => {
        decisoesIniciais[`VISITANTE-${v.id}`] = v.decisaoEspiritual || "NENHUMA";
      });

      setForm({
        dataReuniao: rel.dataReuniao || "",
        estudo: rel.estudo || "",
        selecionadosKeys: keysPresentes,
        decisoes: decisoesIniciais,
      });
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
      alert("Não foi possível carregar o relatório.");
    } finally {
      setLoading(false);
    }
  }, [relatorioId]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const alternarPresenca = (uKey) => {
    const isMarcado = form.selecionadosKeys.includes(uKey);
    setProcessingIds(prev => new Set(prev).add(uKey));
    setForm(prev => {
      const novasKeys = isMarcado
          ? prev.selecionadosKeys.filter(k => k !== uKey)
          : [...prev.selecionadosKeys, uKey];
      const novasDecisoes = { ...prev.decisoes };
      if (isMarcado) delete novasDecisoes[uKey];
      return { ...prev, selecionadosKeys: novasKeys, decisoes: novasDecisoes };
    });
    setTimeout(() => setProcessingIds(prev => { const n = new Set(prev); n.delete(uKey); return n; }), 200);
  };

  const membrosPresentes    = form.selecionadosKeys.filter(k => k.startsWith("MEMBRO-")).length;
  const visitantesPresentes = form.selecionadosKeys.filter(k => k.startsWith("VISITANTE-")).length;
  const total               = membrosPresentes + visitantesPresentes;

  const handleSalvar = async () => {
    if (!form.estudo.trim()) return alert("Informe o tema do estudo.");
    try {
      setSalvando(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const payload = {
        celulaId: Number(celulaId),
        dataReuniao: form.dataReuniao,
        estudo: form.estudo.trim(),
        membrosPresentesIds: form.selecionadosKeys
            .filter(k => k.startsWith("MEMBRO-"))
            .map(k => Number(k.replace("MEMBRO-", ""))),
        visitantesPresentes: form.selecionadosKeys
            .filter(k => k.startsWith("VISITANTE-"))
            .map(k => ({
              id: Number(k.replace("VISITANTE-", "")),
              decisaoEspiritual: form.decisoes[k] || "NENHUMA",
            })),
        quantidadeVisitantes: 0,
      };

      await api.put(`/relatorios/${relatorioId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSucesso(true);
      setTimeout(() => { setSucesso(false); if (onSalvo) onSalvo(); }, 2200);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <QuadrangularCross size={40} />
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".2em", color: IEQ.red, marginTop: 14 }}>CARREGANDO RELATÓRIO...</p>
        </div>
      </div>
  );

  return (
      <div style={{ minHeight: "100vh", position: "relative", paddingBottom: 120 }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "0 16px" }}>

          {/* Botão Voltar */}
          <div style={{ paddingTop: 20, paddingBottom: 8 }}>
            <button
                onClick={onVoltar}
                style={{
                  background: "none", border: `1px solid ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}`,
                  color: tp, padding: "9px 16px", borderRadius: 8, cursor: "pointer",
                  fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".15em",
                  display: "flex", alignItems: "center", gap: 8,
                }}
            >
              <ArrowLeft size={13} /> VOLTAR
            </button>
          </div>

          {/* Toast sucesso */}
          {sucesso && (
              <div style={{
                marginBottom: 12, animation: "fadeIn .4s ease",
                background: "linear-gradient(135deg,#0d6e3a,#0a5530)",
                borderRadius: 10, padding: "14px 20px",
                display: "flex", alignItems: "center", gap: 12,
                fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: ".16em", color: "#fff",
                boxShadow: "0 4px 20px rgba(13,110,58,.4)",
              }}>
                <CheckCircle2 size={16} /> RELATÓRIO ATUALIZADO COM SUCESSO!
              </div>
          )}

          {/* Banner aviso */}
          <div style={{
            marginBottom: 12,
            background: "linear-gradient(135deg,rgba(253,184,19,.15),rgba(196,140,0,.1))",
            border: "1px solid rgba(253,184,19,.3)",
            borderRadius: 10, padding: "13px 18px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <AlertTriangle size={16} style={{ color: IEQ.yellow, flexShrink: 0 }} />
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".14em", color: IEQ.yellowDark, margin: 0 }}>
              MODO EDIÇÃO — Você está alterando um relatório já enviado.
            </p>
          </div>

          {/* Header */}
          <div style={{
            padding: "36px 40px 32px", marginBottom: 24,
            background: isDark ? "linear-gradient(135deg,#1A0A0D,#0A0608)" : `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`,
            borderRadius: 14, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(-55deg,rgba(255,255,255,.03) 0 10px,transparent 10px 20px)", backgroundSize: "40px 40px" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", width: 64, height: 64, borderRadius: "50%", border: "1px solid rgba(200,16,46,.35)", animation: "pulse 3s ease-in-out infinite" }} />
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Edit3 size={22} style={{ color: "#fff" }} />
                  </div>
                </div>
                <div>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".22em", color: "rgba(255,255,255,.5)", margin: 0 }}>EDITANDO RELATÓRIO #{relatorioId}</p>
                  <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: "4px 0 0", letterSpacing: ".1em" }}>
                    {nomeCelula.toUpperCase()}
                  </h1>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UserCheck size={18} style={{ color: "#fff" }} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: "rgba(255,255,255,.5)", margin: 0 }}>LÍDER RESPONSÁVEL</p>
                  <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>{nomeLider}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Campos */}
          <div className="ieq-card" style={{ padding: "26px 28px", marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="ieq-label"><Calendar size={11} style={{ display: "inline", marginRight: 6 }} />DATA DA REUNIÃO</label>
                <input className="ieq-input" type="date" value={form.dataReuniao} onChange={e => setForm({ ...form, dataReuniao: e.target.value })} />
              </div>
              <div>
                <label className="ieq-label"><BookOpen size={11} style={{ display: "inline", marginRight: 6 }} />TEMA DO ESTUDO</label>
                <input className="ieq-input" placeholder="Qual foi o estudo?" value={form.estudo} onChange={e => setForm({ ...form, estudo: e.target.value })} />
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "MEMBROS",    val: membrosPresentes,    color: IEQ.red },
              { label: "VISITANTES", val: visitantesPresentes, color: IEQ.blue },
              { label: "TOTAL",      val: total,               color: IEQ.yellow, highlight: true },
            ].map(({ label, val, color, highlight }) => (
                <div key={label} className="ieq-kpi" style={highlight ? { background: `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, border: "none" } : {}}>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: highlight ? "rgba(255,255,255,.6)" : ts, margin: "0 0 6px" }}>{label}</p>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 38, fontWeight: 700, color: highlight ? "#fff" : color, margin: 0, lineHeight: 1 }}>{val}</p>
                </div>
            ))}
          </div>

          {/* Chamada */}
          <div className="ieq-card" style={{ overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`, display: "flex", alignItems: "center", gap: 10 }}>
              <Users2 size={18} style={{ color: IEQ.red }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".16em", color: tp }}>CHAMADA</span>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".12em", color: ts, marginLeft: "auto" }}>{pessoas.length} PESSOAS</span>
            </div>
            <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
              {pessoas.map((pessoa) => {
                const marcado     = form.selecionadosKeys.includes(pessoa.uKey);
                const isVisitante = pessoa.tipo === "VISITANTE";
                const processing  = processingIds.has(pessoa.uKey);
                return (
                    <div key={pessoa.uKey} className="ieq-person-row" style={{ background: marcado ? (isDark ? "rgba(200,16,46,.07)" : "rgba(200,16,46,.05)") : "transparent" }}>
                      <button
                          onClick={() => alternarPresenca(pessoa.uKey)}
                          disabled={processing}
                          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", transition: "all .2s" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 8,
                            background: marcado ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})` : (isDark ? "rgba(255,255,255,.06)" : "rgba(200,16,46,.08)"),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: marcado ? "#fff" : (isDark ? IEQ.offWhite : "#1A0A0D"),
                            fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16,
                            transition: "all .3s", transform: marcado ? "scale(1.05)" : "scale(1)",
                          }}>
                            {processing ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : pessoa.nome.charAt(0)}
                          </div>
                          <div style={{ textAlign: "left" }}>
                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, fontWeight: marcado ? 600 : 400, color: marcado ? tp : ts, margin: 0 }}>{pessoa.nome}</p>
                            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".15em", color: isVisitante ? IEQ.yellow : IEQ.red }}>{pessoa.tipo}</span>
                          </div>
                        </div>
                        <div style={{
                          width: 26, height: 26, borderRadius: 6,
                          border: `2px solid ${marcado ? IEQ.red : (isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)")}`,
                          background: marcado ? IEQ.red : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s",
                        }}>
                          {marcado && <CheckCircle2 size={14} style={{ color: "#fff" }} />}
                        </div>
                      </button>
                      {marcado && isVisitante && (
                          <div style={{ padding: "0 24px 18px 82px" }}>
                            <div className="ieq-card" style={{ padding: "16px 18px" }}>
                              <label className="ieq-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Trophy size={11} /> DECISÃO ESPIRITUAL
                              </label>
                              <div style={{ position: "relative" }}>
                                <select
                                    className="ieq-select"
                                    value={form.decisoes[pessoa.uKey] || "NENHUMA"}
                                    onChange={e => setForm(prev => ({ ...prev, decisoes: { ...prev.decisoes, [pessoa.uKey]: e.target.value } }))}
                                >
                                  <option value="NENHUMA">Só visita</option>
                                  <option value="ACEITOU_JESUS">Aceitou Jesus</option>
                                  <option value="RECONCILIOU">Reconciliou</option>
                                  <option value="BATISMO_AGUAS">Deseja Batismo</option>
                                </select>
                                <ChevronDown size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: ts, pointerEvents: "none" }} />
                              </div>
                            </div>
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botão salvar fixo */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, width: "100%", padding: "16px 24px", zIndex: 50,
          background: isDark ? "linear-gradient(to top,rgba(10,6,8,1) 60%,transparent)" : "linear-gradient(to top,rgba(240,234,232,1) 60%,transparent)",
        }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <button
                onClick={handleSalvar}
                disabled={salvando || !form.estudo.trim()}
                style={{
                  width: "100%", padding: "17px 0", borderRadius: 10, border: "none",
                  background: (salvando || !form.estudo.trim()) ? "rgba(200,16,46,.3)" : `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`,
                  color: "#fff", cursor: (salvando || !form.estudo.trim()) ? "not-allowed" : "pointer",
                  fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".22em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .25s",
                }}
            >
              {salvando
                  ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> SALVANDO...</>
                  : <><ClipboardCheck size={17} /> SALVAR ALTERAÇÕES ({total} PRESENTES)</>
              }
            </button>
          </div>
        </div>
      </div>
  );
}

/* ══════════════════════════════════════════════════════
   TELA PRINCIPAL — NOVO RELATÓRIO + HISTÓRICO
══════════════════════════════════════════════════════ */
export default function TelaRelatorio({ isDark = false }) {
  /* Modo: "novo" | "historico" | "editar" */
  const [modo,            setModo]            = useState("novo");
  const [relatorioEditId, setRelatorioEditId] = useState(null);

  /* ── NOVO: estado do modal de duplicação ── */
  const [modalDuplicado, setModalDuplicado] = useState(null);
  // null | { relatorioId, dataReuniao, estudo }

  const [celula,        setCelula]        = useState(null);
  const [pessoas,       setPessoas]       = useState([]);
  const [historico,     setHistorico]     = useState([]);
  const [loadingHist,   setLoadingHist]   = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [enviando,      setEnviando]      = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [rascunhoCarregado, setRascunhoCarregado] = useState(false);

  const prontoParaSalvar = useRef(false);

  const [form, setForm] = useState({
    celulaId: null,
    dataReuniao: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })(),
    estudo: "",
    selecionadosKeys: [],
    decisoes: {},
  });

  /* Salvar rascunho no localStorage */
  useEffect(() => {
    if (!prontoParaSalvar.current || !form.celulaId) return;
    try {
      localStorage.setItem(draftKey(form.celulaId), JSON.stringify({
        dataReuniao: form.dataReuniao, estudo: form.estudo,
        selecionadosKeys: form.selecionadosKeys, decisoes: form.decisoes,
        salvoEm: new Date().toISOString(),
      }));
    } catch (err) { console.warn("Não foi possível salvar rascunho:", err); }
  }, [form]);

  const carregarDados = useCallback(async () => {
    try {
      prontoParaSalvar.current = false;
      setLoading(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const headers = { Authorization: `Bearer ${token}` };
      const resCelula = await api.get("/celulas/minha-celula", { headers });
      const dadosCelula = resCelula.data;
      setCelula(dadosCelula);

      const [resMembros, resVisitantes] = await Promise.all([
        api.get(`/celulas/${dadosCelula.id}/membros`, { headers }),
        api.get(`/visitantes/celula/${dadosCelula.id}/ativos`, { headers }),
      ]);
      const membros    = (resMembros.data    || []).map(m => ({ id: m.id, nome: m.nome, tipo: "MEMBRO",    uKey: `MEMBRO-${m.id}` }));
      const visitantes = (resVisitantes.data || []).map(v => ({ id: v.id, nome: v.nome, tipo: "VISITANTE", uKey: `VISITANTE-${v.id}` }));
      setPessoas([...membros, ...visitantes].sort((a, b) => a.nome.localeCompare(b.nome)));

      let restaurou = false;
      try {
        const raw = localStorage.getItem(draftKey(dadosCelula.id));
        if (raw) {
          const draft = JSON.parse(raw);
          setForm({
            celulaId: dadosCelula.id,
            dataReuniao: draft.dataReuniao || (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })(),
            estudo: draft.estudo || "",
            selecionadosKeys: draft.selecionadosKeys || [],
            decisoes: draft.decisoes || {},
          });
          restaurou = true;
          setRascunhoCarregado(true);
          setTimeout(() => setRascunhoCarregado(false), 4000);
        }
      } catch (err) { console.warn("Erro ao ler rascunho:", err); }

      if (!restaurou) setForm(prev => ({ ...prev, celulaId: dadosCelula.id }));
      setTimeout(() => { prontoParaSalvar.current = true; }, 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  /* Carregar histórico */
  const carregarHistorico = useCallback(async () => {
    try {
      setLoadingHist(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const res = await api.get("/relatorios/historico", { headers: { Authorization: `Bearer ${token}` } });
      setHistorico(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    } finally {
      setLoadingHist(false);
    }
  }, []);

  useEffect(() => {
    if (modo === "historico") carregarHistorico();
  }, [modo, carregarHistorico]);

  const alternarPresenca = (uKey) => {
    const isMarcado = form.selecionadosKeys.includes(uKey);
    setProcessingIds(prev => new Set(prev).add(uKey));
    setForm(prev => {
      const novasKeys = isMarcado ? prev.selecionadosKeys.filter(k => k !== uKey) : [...prev.selecionadosKeys, uKey];
      const novasDecisoes = { ...prev.decisoes };
      if (isMarcado) delete novasDecisoes[uKey];
      return { ...prev, selecionadosKeys: novasKeys, decisoes: novasDecisoes };
    });
    setTimeout(() => setProcessingIds(prev => { const n = new Set(prev); n.delete(uKey); return n; }), 200);
  };

  const membrosPresentes    = form.selecionadosKeys.filter(k => k.startsWith("MEMBRO-")).length;
  const visitantesPresentes = form.selecionadosKeys.filter(k => k.startsWith("VISITANTE-")).length;
  const total               = membrosPresentes + visitantesPresentes;

  /* ══════════════════════════════════════════════════════
     handleSubmit — com verificação de duplicata
  ══════════════════════════════════════════════════════ */
  const handleSubmit = async () => {
    if (!form.estudo.trim()) return alert("Informe o tema do estudo.");

    // ── Verifica se já existe relatório na mesma data ──
    try {
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const res = await api.get("/relatorios/historico", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existente = (res.data || []).find(
          (r) => r.dataReuniao === form.dataReuniao
      );
      if (existente) {
        // Bloqueia e abre o modal de duplicação
        setModalDuplicado({
          relatorioId: existente.id,
          dataReuniao:  existente.dataReuniao,
          estudo:       existente.estudo || "Sem tema",
        });
        return;
      }
    } catch (err) {
      // Se a checagem falhar, continua (fail-open)
      console.warn("Não foi possível verificar duplicata:", err);
    }
    // ──────────────────────────────────────────────────

    try {
      setEnviando(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const payload = {
        celulaId: Number(form.celulaId),
        dataReuniao: form.dataReuniao,
        estudo: form.estudo.trim(),
        membrosPresentesIds: form.selecionadosKeys
            .filter(k => k.startsWith("MEMBRO-"))
            .map(k => Number(k.replace("MEMBRO-", ""))),
        visitantesPresentes: form.selecionadosKeys
            .filter(k => k.startsWith("VISITANTE-"))
            .map(k => ({
              id: Number(k.replace("VISITANTE-", "")),
              decisaoEspiritual: form.decisoes[k] || "NENHUMA",
            })),
      };
      await api.post("/relatorios", payload, { headers: { Authorization: `Bearer ${token}` } });
      try { localStorage.removeItem(draftKey(form.celulaId)); } catch (_) {}
      prontoParaSalvar.current = false;
      setForm(f => ({ ...f, estudo: "", selecionadosKeys: [], decisoes: {} }));
      setTimeout(() => { prontoParaSalvar.current = true; }, 0);
      alert("Relatório enviado com sucesso!");
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao enviar relatório.");
    } finally { setEnviando(false); }
  };

  const nomeCelula       = celula?.nome || "Carregando...";
  const nomeUsuarioLider = celula?.nomeLider || celula?.lider?.nome || celula?.usuario?.nome || "Líder";
  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const selectBg = isDark ? "#1a0a0d" : "#ffffff";

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing:border-box; }
    @keyframes stripe { 0%{background-position:0 0} 100%{background-position:60px 60px} }
    @keyframes pulse  { 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.12);opacity:.12} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes modalIn { from{opacity:0;transform:scale(.94) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
    .ieq-bg-stripe {
      position:fixed; inset:0; pointer-events:none; z-index:0;
      background:repeating-linear-gradient(-55deg,
        ${isDark ? "rgba(200,16,46,.04)" : "rgba(200,16,46,.05)"} 0 10px,transparent 10px 20px,
        ${isDark ? "rgba(253,184,19,.03)" : "rgba(253,184,19,.04)"} 20px 30px,transparent 30px 40px);
      background-size:60px 60px; animation:stripe 8s linear infinite;
    }
    .ieq-card {
      background:${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius:14px; backdrop-filter:blur(24px);
    }
    .ieq-input {
      width:100%;
      background:${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      color:${tp}; padding:12px 16px; border-radius:8px; outline:none;
      font-family:'EB Garamond',serif; font-size:15px; transition:all .25s;
    }
    .ieq-input:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-input::placeholder { color:${ts}; }
    .ieq-select {
      width:100%; background:${selectBg};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      color:${tp}; padding:12px 16px; border-radius:8px; outline:none;
      font-family:'EB Garamond',serif; font-size:15px; cursor:pointer; transition:all .25s;
      -webkit-appearance:none; appearance:none;
    }
    .ieq-select:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-select option { background:${selectBg}; color:${tp}; }
    .ieq-label {
      display:block; margin-bottom:6px;
      font-family:'Cinzel',serif; font-size:9.5px; letter-spacing:.18em; color:${IEQ.red};
    }
    .ieq-person-row {
      border-bottom:1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.07)"};
      transition:background .2s;
    }
    .ieq-person-row:last-child { border-bottom:none; }
    .ieq-kpi {
      background:${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius:12px; padding:20px; text-align:center;
    }
    .ieq-toast {
      animation:fadeIn .35s ease;
      background:linear-gradient(135deg,${IEQ.blue},${IEQ.blueDark});
      border-radius:10px; padding:12px 18px;
      display:flex; align-items:center; gap:10px;
      font-family:'Cinzel',serif; font-size:9.5px; letter-spacing:.16em; color:#fff;
      box-shadow:0 4px 20px rgba(0,61,165,.35);
    }
    .pulse-ring { position:absolute; border-radius:50%; border:1px solid rgba(200,16,46,.35); animation:pulse 3s ease-in-out infinite; }
    .spin-icon  { animation:spin 1s linear infinite; }
    .divider    { height:1px; background:linear-gradient(90deg,transparent,${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"},transparent); }
    .ieq-tab {
      flex:1; padding:12px; border:none; cursor:pointer;
      font-family:'Cinzel',serif; font-size:9px; letter-spacing:.16em;
      transition:all .25s; display:flex; align-items:center; justify-content:center; gap:7px;
    }
    .ieq-hist-card {
      border-bottom:1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.07)"};
      padding:18px 20px; display:flex; align-items:center; justify-content:space-between;
      transition:background .2s;
    }
    .ieq-hist-card:last-child { border-bottom:none; }
    .ieq-edit-btn {
      display:flex; align-items:center; gap:6px;
      padding:8px 14px; border-radius:7px; border:none; cursor:pointer;
      font-family:'Cinzel',serif; font-size:8.5px; letter-spacing:.14em;
      background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red}); color:#fff;
      transition:opacity .2s;
    }
    .ieq-edit-btn:hover { opacity:.85; }
    .ieq-modal-overlay {
      position:fixed; inset:0; z-index:200;
      background:rgba(0,0,0,.6); backdrop-filter:blur(5px);
      display:flex; align-items:center; justify-content:center; padding:0 20px;
    }
    .ieq-modal-box {
      background:${isDark ? "#110A0D" : "#fff"};
      border:1px solid rgba(253,184,19,.35);
      border-radius:16px; padding:28px 28px 24px;
      max-width:420px; width:100%;
      animation:modalIn .3s cubic-bezier(.34,1.56,.64,1);
      box-shadow:0 20px 60px rgba(0,0,0,.4);
    }
    .ieq-modal-cancel {
      flex:1; padding:13px 0; border-radius:9px;
      border:1px solid ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"};
      background:transparent; color:${tp}; cursor:pointer;
      font-family:'Cinzel',serif; font-size:9px; letter-spacing:.16em;
      transition:background .2s;
    }
    .ieq-modal-cancel:hover { background:${isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)"}; }
    .ieq-modal-confirm {
      flex:1; padding:13px 0; border-radius:9px; border:none;
      background:linear-gradient(135deg,${IEQ.yellowDark},${IEQ.yellow});
      color:${IEQ.dark}; cursor:pointer;
      font-family:'Cinzel',serif; font-size:9px; font-weight:700; letter-spacing:.16em;
      display:flex; align-items:center; justify-content:center; gap:8px;
      transition:opacity .2s;
    }
    .ieq-modal-confirm:hover { opacity:.88; }
  `;

  /* Tela de edição */
  if (modo === "editar" && relatorioEditId) {
    return (
        <>
          <style>{globalStyles}</style>
          <div className="ieq-bg-stripe" />
          <TelaEditarRelatorio
              relatorioId={relatorioEditId}
              isDark={isDark}
              onVoltar={() => { setModo("historico"); setRelatorioEditId(null); }}
              onSalvo={() => { setModo("historico"); setRelatorioEditId(null); carregarHistorico(); }}
          />
        </>
    );
  }

  if (loading) return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: "center" }}>
          <QuadrangularCross size={40} />
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".2em", color: IEQ.red, marginTop: 14 }}>CARREGANDO...</p>
        </div>
      </div>
  );

  return (
      <div style={{ minHeight: "100vh", position: "relative", paddingBottom: 120 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg-stripe" />

        {/* ══════════════════════════════════════════════════════
          MODAL — Relatório duplicado na mesma data
      ══════════════════════════════════════════════════════ */}
        {modalDuplicado && (
            <div className="ieq-modal-overlay" onClick={() => setModalDuplicado(null)}>
              <div className="ieq-modal-box" onClick={e => e.stopPropagation()}>

                {/* Ícone + título */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(253,184,19,.15)",
                    border: "1px solid rgba(253,184,19,.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <AlertTriangle size={22} style={{ color: IEQ.yellow }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: ".2em", fontWeight: 700, color: tp, margin: 0 }}>
                      RELATÓRIO JÁ ENVIADO
                    </p>
                    <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: ts, margin: "3px 0 0" }}>
                      {new Date(modalDuplicado.dataReuniao + "T12:00:00").toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Mensagem */}
                <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, color: ts, lineHeight: 1.65, margin: "0 0 16px" }}>
                  Já existe um relatório enviado para esta data. Deseja{" "}
                  <strong style={{ color: tp, fontWeight: 600 }}>editar o relatório existente</strong>{" "}
                  em vez de criar um novo?
                </p>

                {/* Card do relatório existente */}
                <div style={{
                  background: isDark ? "rgba(253,184,19,.06)" : "rgba(253,184,19,.08)",
                  border: "1px solid rgba(253,184,19,.25)",
                  borderRadius: 10, padding: "14px 18px", marginBottom: 22,
                }}>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".16em", color: IEQ.yellowDark, margin: "0 0 5px" }}>
                    TEMA DO ESTUDO EXISTENTE
                  </p>
                  <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 17, fontWeight: 600, color: tp, margin: 0 }}>
                    {modalDuplicado.estudo}
                  </p>
                </div>

                {/* Botões */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                      className="ieq-modal-cancel"
                      onClick={() => setModalDuplicado(null)}
                  >
                    CANCELAR
                  </button>
                  <button
                      className="ieq-modal-confirm"
                      onClick={() => {
                        const id = modalDuplicado.relatorioId;
                        setModalDuplicado(null);
                        setRelatorioEditId(id);
                        setModo("editar");
                      }}
                  >
                    <Edit3 size={14} /> EDITAR EXISTENTE
                  </button>
                </div>
              </div>
            </div>
        )}

        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "0 16px" }}>

          {/* Abas Novo / Histórico */}
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", margin: "16px 0", border: `1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"}` }}>
            {[
              { key: "novo",      label: "NOVO RELATÓRIO", icon: <ClipboardCheck size={13} /> },
              { key: "historico", label: "HISTÓRICO",      icon: <History size={13} /> },
            ].map(tab => (
                <button
                    key={tab.key}
                    className="ieq-tab"
                    onClick={() => setModo(tab.key)}
                    style={{
                      background: modo === tab.key
                          ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`
                          : (isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"),
                      color: modo === tab.key ? "#fff" : ts,
                    }}
                >
                  {tab.icon} {tab.label}
                </button>
            ))}
          </div>

          {/* ABA: HISTÓRICO */}
          {modo === "historico" && (
              <div className="ieq-card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <History size={18} style={{ color: IEQ.red }} />
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".16em", color: tp }}>SEUS RELATÓRIOS</span>
                </div>

                {loadingHist ? (
                    <div style={{ padding: 40, textAlign: "center" }}>
                      <Loader2 size={28} style={{ color: IEQ.red, animation: "spin 1s linear infinite" }} />
                    </div>
                ) : historico.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center" }}>
                      <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".16em", color: ts }}>NENHUM RELATÓRIO ENCONTRADO</p>
                    </div>
                ) : (
                    historico.map(rel => (
                        <div key={rel.id} className="ieq-hist-card">
                          <div>
                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".14em", color: tp, margin: "0 0 4px" }}>
                              {rel.dataReuniao ? new Date(rel.dataReuniao + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "?"}
                            </p>
                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: ts, margin: "0 0 6px" }}>{rel.estudo || "Sem tema"}</p>
                            <div style={{ display: "flex", gap: 10 }}>
                              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".12em", color: IEQ.red }}>{rel.totalPresentes || 0} PRESENTES</span>
                            </div>
                          </div>
                          <button
                              className="ieq-edit-btn"
                              onClick={() => { setRelatorioEditId(rel.id); setModo("editar"); }}
                          >
                            <Edit3 size={12} /> EDITAR
                          </button>
                        </div>
                    ))
                )}
              </div>
          )}

          {/* ABA: NOVO RELATÓRIO */}
          {modo === "novo" && (
              <>
                {rascunhoCarregado && (
                    <div style={{ marginBottom: 12 }}>
                      <div className="ieq-toast">
                        <CheckCircle2 size={15} />
                        RASCUNHO RESTAURADO — suas marcações anteriores foram recuperadas
                      </div>
                    </div>
                )}

                {/* Header */}
                <div style={{
                  padding: "40px 40px 36px", marginBottom: 24,
                  background: isDark ? "linear-gradient(135deg,#1A0A0D,#0A0608)" : `linear-gradient(135deg,${IEQ.blue},${IEQ.blueDark})`,
                  borderRadius: 14, position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(-55deg,rgba(255,255,255,.03) 0 10px,transparent 10px 20px)", backgroundSize: "40px 40px" }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <div className="pulse-ring" style={{ width: 64, height: 64 }} />
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <QuadrangularCross size={28} />
                        </div>
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".22em", color: "rgba(255,255,255,.5)", margin: 0 }}>RELATÓRIO SEMANAL</p>
                        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, color: "#fff", margin: "4px 0 0", letterSpacing: ".1em" }}>
                          {nomeCelula.toUpperCase()}
                        </h1>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <UserCheck size={18} style={{ color: "#fff" }} />
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: "rgba(255,255,255,.5)", margin: 0 }}>LÍDER RESPONSÁVEL</p>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>{nomeUsuarioLider}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campos */}
                <div className="ieq-card" style={{ padding: "26px 28px", marginBottom: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label className="ieq-label"><Calendar size={11} style={{ display: "inline", marginRight: 6 }} />DATA DA REUNIÃO</label>
                      <input className="ieq-input" type="date" value={form.dataReuniao} onChange={e => setForm({ ...form, dataReuniao: e.target.value })} />
                    </div>
                    <div>
                      <label className="ieq-label"><BookOpen size={11} style={{ display: "inline", marginRight: 6 }} />TEMA DO ESTUDO</label>
                      <input className="ieq-input" placeholder="Qual foi o estudo de hoje?" value={form.estudo} onChange={e => setForm({ ...form, estudo: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "MEMBROS",    val: membrosPresentes,    color: IEQ.red },
                    { label: "VISITANTES", val: visitantesPresentes, color: IEQ.blue },
                    { label: "TOTAL",      val: total,               color: IEQ.yellow, highlight: true },
                  ].map(({ label, val, color, highlight }) => (
                      <div key={label} className="ieq-kpi" style={highlight ? { background: `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, border: "none" } : {}}>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: highlight ? "rgba(255,255,255,.6)" : ts, margin: "0 0 6px" }}>{label}</p>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 38, fontWeight: 700, color: highlight ? "#fff" : color, margin: 0, lineHeight: 1 }}>{val}</p>
                      </div>
                  ))}
                </div>

                {/* Chamada */}
                <div className="ieq-card" style={{ overflow: "hidden", marginBottom: 16 }}>
                  <div style={{ padding: "20px 24px", borderBottom: `1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`, display: "flex", alignItems: "center", gap: 10 }}>
                    <Users2 size={18} style={{ color: IEQ.red }} />
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".16em", color: tp }}>CHAMADA</span>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".12em", color: ts, marginLeft: "auto" }}>{pessoas.length} PESSOAS</span>
                  </div>
                  <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
                    {pessoas.map((pessoa) => {
                      const marcado     = form.selecionadosKeys.includes(pessoa.uKey);
                      const isVisitante = pessoa.tipo === "VISITANTE";
                      const processing  = processingIds.has(pessoa.uKey);
                      return (
                          <div key={pessoa.uKey} className="ieq-person-row" style={{ background: marcado ? (isDark ? "rgba(200,16,46,.07)" : "rgba(200,16,46,.05)") : "transparent" }}>
                            <button
                                onClick={() => alternarPresenca(pessoa.uKey)}
                                disabled={processing}
                                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", transition: "all .2s" }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{
                                  width: 44, height: 44, borderRadius: 8,
                                  background: marcado ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})` : (isDark ? "rgba(255,255,255,.06)" : "rgba(200,16,46,.08)"),
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: marcado ? "#fff" : (isDark ? IEQ.offWhite : "#1A0A0D"),
                                  fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16,
                                  transition: "all .3s", transform: marcado ? "scale(1.05)" : "scale(1)",
                                }}>
                                  {processing ? <Loader2 size={18} className="spin-icon" /> : pessoa.nome.charAt(0)}
                                </div>
                                <div style={{ textAlign: "left" }}>
                                  <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, fontWeight: marcado ? 600 : 400, color: marcado ? tp : ts, margin: 0 }}>{pessoa.nome}</p>
                                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".15em", color: isVisitante ? IEQ.yellow : IEQ.red }}>{pessoa.tipo}</span>
                                </div>
                              </div>
                              <div style={{
                                width: 26, height: 26, borderRadius: 6,
                                border: `2px solid ${marcado ? IEQ.red : (isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)")}`,
                                background: marcado ? IEQ.red : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s",
                              }}>
                                {marcado && <CheckCircle2 size={14} style={{ color: "#fff" }} />}
                              </div>
                            </button>
                            {marcado && isVisitante && (
                                <div style={{ padding: "0 24px 18px 82px" }}>
                                  <div className="ieq-card" style={{ padding: "16px 18px" }}>
                                    <label className="ieq-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                      <Trophy size={11} /> DECISÃO ESPIRITUAL
                                    </label>
                                    <div style={{ position: "relative" }}>
                                      <select
                                          className="ieq-select"
                                          value={form.decisoes[pessoa.uKey] || "NENHUMA"}
                                          onChange={e => setForm(prev => ({ ...prev, decisoes: { ...prev.decisoes, [pessoa.uKey]: e.target.value } }))}
                                      >
                                        <option value="NENHUMA">Só visita</option>
                                        <option value="ACEITOU_JESUS">Aceitou Jesus</option>
                                        <option value="RECONCILIOU">Reconciliou</option>
                                        <option value="BATISMO_AGUAS">Deseja Batismo</option>
                                      </select>
                                      <ChevronDown size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: ts, pointerEvents: "none" }} />
                                    </div>
                                  </div>
                                </div>
                            )}
                          </div>
                      );
                    })}
                  </div>
                </div>
              </>
          )}
        </div>

        {/* Botão fixo — só aparece na aba novo */}
        {modo === "novo" && (
            <div style={{
              position: "fixed", bottom: 0, left: 0, width: "100%", padding: "16px 24px", zIndex: 50,
              background: isDark ? "linear-gradient(to top,rgba(10,6,8,1) 60%,transparent)" : "linear-gradient(to top,rgba(240,234,232,1) 60%,transparent)",
            }}>
              <div style={{ maxWidth: 720, margin: "0 auto" }}>
                <button
                    onClick={handleSubmit}
                    disabled={enviando || !form.estudo.trim()}
                    style={{
                      width: "100%", padding: "17px 0", borderRadius: 10, border: "none",
                      background: (enviando || !form.estudo.trim()) ? "rgba(200,16,46,.3)" : `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`,
                      color: "#fff", cursor: (enviando || !form.estudo.trim()) ? "not-allowed" : "pointer",
                      fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".22em",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .25s",
                    }}
                >
                  {enviando
                      ? <><Loader2 size={17} className="spin-icon" /> ENVIANDO...</>
                      : <><ClipboardCheck size={17} /> FINALIZAR RELATÓRIO ({total})</>
                  }
                </button>
              </div>
            </div>
        )}
      </div>
  );
}
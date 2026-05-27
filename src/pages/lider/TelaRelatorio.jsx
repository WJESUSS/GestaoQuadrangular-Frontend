import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import api from "../../services/api.js";
import {
  Loader2, CheckCircle2, Calendar, UserCheck, Save,
  History, Edit3, ArrowLeft, AlertTriangle, ClipboardCheck,
} from "lucide-react";

const IEQ = {
  red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
  yellow: "#FDB813", yellowDark: "#C48C00",
  blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
  white: "#FFFFFF", offWhite: "#F5F0E8",
  dark: "#0A0608", darkCard: "#110A0D",
};

const draftKey = (celulaId, inicio) => `ieq_discipulado_draft_${celulaId}_${inicio}`;

function QuadrangularCross({ size = 32 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gVD" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={IEQ.redLight} /><stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHD" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={IEQ.blueDark} /><stop offset="50%" stopColor={IEQ.blueLight} /><stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowD"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect x="38" y="4" width="24" height="92" rx="3" fill="url(#gVD)" filter="url(#glowD)" />
        <rect x="4" y="38" width="92" height="24" rx="3" fill="url(#gHD)" filter="url(#glowD)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowD)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

function obterSemanaAtual() {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const domingo = new Date(hoje);
  domingo.setDate(hoje.getDate() - diaSemana);
  const sabado = new Date(domingo);
  sabado.setDate(domingo.getDate() + 6);
  const fmt = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { inicio: fmt(domingo), fim: fmt(sabado) };
}

const COLUNAS = [
  { campo: "escolaBiblica", label: "EBD",        emoji: "📖" },
  { campo: "quartaNoite",   label: "4ª Noite",   emoji: "🌙" },
  { campo: "quintaNoite",   label: "5ª Noite",   emoji: "⭐" },
  { campo: "domingoManha",  label: "Dom. Manhã", emoji: "☀️" },
  { campo: "domingoNoite",  label: "Dom. Noite", emoji: "🌟" },
];

// ─── Helpers localStorage ───────────────────────────────────────
function lsDraftSave(key, presencas, fim) {
  try { localStorage.setItem(key, JSON.stringify({ presencas, fim, salvoEm: new Date().toISOString() })); }
  catch (e) { console.warn("localStorage indisponível:", e); }
}
function lsDraftLoad(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}
function lsDraftRemove(key) { try { localStorage.removeItem(key); } catch { } }

/* ═══════════════════════════════════════════════════════════════
   TELA DE EDIÇÃO DE RELATÓRIO DE DISCIPULADO EXISTENTE
═══════════════════════════════════════════════════════════════ */
function TelaEditarDiscipulado({ relatorioId, onVoltar, onSalvo, isDark = false }) {
  const [loading,   setLoading]   = useState(true);
  const [salvando,  setSalvando]  = useState(false);
  const [sucesso,   setSucesso]   = useState(false);
  const [nomeCelula, setNomeCelula] = useState("");
  const [membros,   setMembros]   = useState([]);
  const [inicio,    setInicio]    = useState("");
  const [fim,       setFim]       = useState("");
  const [presencas, setPresencas] = useState([]);

  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
        const headers = { Authorization: `Bearer ${token}` };
        const res = await api.get(`/discipulado/relatorio-semanal/${relatorioId}`, { headers });
        const rel = res.data;
        setNomeCelula(rel.nomeCelula || "");
        setInicio(rel.inicio || "");
        setFim(rel.fim || "");
        setMembros(rel.membros || []);
        setPresencas(rel.presencas || []);
      } catch (err) {
        console.error("Erro ao carregar relatório de discipulado:", err);
        alert("Não foi possível carregar o relatório.");
      } finally {
        setLoading(false);
      }
    })();
  }, [relatorioId]);

  const alterarPresenca = (index, campo) => {
    setPresencas(prev => {
      const novo = [...prev];
      if (!novo[index]) return prev;
      novo[index] = { ...novo[index], [campo]: !novo[index][campo] };
      return novo;
    });
  };

  const stats = useMemo(() => {
    const totalGeral    = presencas.reduce((acc, p) => acc + COLUNAS.filter(c => p[c.campo]).length, 0);
    const totalPossivel = presencas.length * COLUNAS.length;
    const porcentagem   = totalPossivel > 0 ? Math.round((totalGeral / totalPossivel) * 100) : 0;
    return { totalGeral, porcentagem };
  }, [presencas]);

  const handleSalvar = async () => {
    try {
      setSalvando(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const payload = presencas.map(({ nomeMembro, membroId, ...rest }) => ({
        membroId: Number(membroId), ...rest,
      }));
      await api.put(
          `/discipulado/relatorio-semanal/${relatorioId}?inicio=${inicio}&fim=${fim}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
      );
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
      <div style={{ position: "relative", paddingBottom: 100 }}>

        {/* Voltar */}
        <div style={{ paddingTop: 20, paddingBottom: 8 }}>
          <button onClick={onVoltar} style={{
            background: "none", border: `1px solid ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}`,
            color: tp, padding: "9px 16px", borderRadius: 8, cursor: "pointer",
            fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".15em",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <ArrowLeft size={13} /> VOLTAR AO HISTÓRICO
          </button>
        </div>

        {sucesso && (
            <div style={{ marginBottom: 12, animation: "fadeIn .4s ease", background: "linear-gradient(135deg,#0d6e3a,#0a5530)", borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: ".16em", color: "#fff", boxShadow: "0 4px 20px rgba(13,110,58,.4)" }}>
              <CheckCircle2 size={16} /> RELATÓRIO ATUALIZADO COM SUCESSO!
            </div>
        )}

        {/* Banner modo edição */}
        <div style={{ marginBottom: 12, background: isDark ? "rgba(253,184,19,.08)" : "rgba(253,184,19,.12)", border: "1px solid rgba(253,184,19,.3)", borderRadius: 10, padding: "13px 18px", display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={16} style={{ color: IEQ.yellow, flexShrink: 0 }} />
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".14em", color: IEQ.yellowDark, margin: 0 }}>
            MODO EDIÇÃO — Você está alterando um relatório já enviado. Período: {inicio} → {fim}
          </p>
        </div>

        {/* Header */}
        <div style={{ padding: "36px 40px 32px", marginBottom: 16, background: isDark ? "linear-gradient(135deg,#1A0A0D,#0A0608)" : `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, borderRadius: 14, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(-55deg,rgba(255,255,255,.03) 0 10px,transparent 10px 20px)", backgroundSize: "40px 40px" }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Edit3 size={22} style={{ color: "#fff" }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".22em", color: "rgba(255,255,255,.5)", margin: 0 }}>EDITANDO RELATÓRIO DE DISCIPULADO</p>
              <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: "4px 0 0", letterSpacing: ".1em" }}>{nomeCelula.toUpperCase()}</h1>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { label: "MEMBROS",    val: membros.length,      color: IEQ.red },
            { label: "PRESENÇAS",  val: stats.totalGeral,    color: IEQ.blue },
            { label: "FREQUÊNCIA", val: `${stats.porcentagem}%`, color: stats.porcentagem > 60 ? IEQ.yellow : IEQ.red, highlight: stats.porcentagem > 60 },
          ].map(({ label, val, color, highlight }) => (
              <div key={label} className="ieq-kpi" style={highlight ? { background: `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, border: "none" } : {}}>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: highlight ? "rgba(255,255,255,.55)" : ts, margin: "0 0 6px" }}>{label}</p>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 36, fontWeight: 700, color: highlight ? "#fff" : color, margin: 0, lineHeight: 1 }}>{val}</p>
              </div>
          ))}
        </div>

        {/* Lista membros */}
        <div className="ieq-card" style={{ overflow: "hidden", marginBottom: 80 }}>
          <div style={{ padding: "14px 24px", borderBottom: `1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`, background: isDark ? "rgba(200,16,46,.04)" : "rgba(200,16,46,.03)", display: "grid", gridTemplateColumns: "1fr repeat(5,60px)", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".16em", color: ts }}>MEMBRO</span>
            {COLUNAS.map(({ label, emoji }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, lineHeight: 1 }}>{emoji}</div>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".1em", color: ts, margin: "4px 0 0" }}>{label.toUpperCase()}</p>
                </div>
            ))}
          </div>

          {membros.map((m, i) => {
            const p     = presencas[i];
            const total = p ? COLUNAS.filter(c => p[c.campo]).length : 0;
            const pct   = Math.round((total / COLUNAS.length) * 100);
            return (
                <div key={m.id} className="ieq-member-block">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="ieq-avatar" style={{ background: `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})` }}>
                        {m.nome.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, fontWeight: 600, color: tp, margin: 0 }}>{m.nome}</p>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".12em", color: ts, margin: "2px 0 0" }}>ID #{m.id}</p>
                      </div>
                    </div>
                    <div style={{ padding: "5px 14px", borderRadius: 99, background: total === COLUNAS.length ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})` : (isDark ? "rgba(255,255,255,.05)" : "rgba(200,16,46,.06)"), border: `1px solid ${total === COLUNAS.length ? IEQ.red : (isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)")}` }}>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".14em", color: total === COLUNAS.length ? "#fff" : ts }}>{total}/{COLUNAS.length}</span>
                    </div>
                  </div>

                  <div style={{ height: 4, borderRadius: 99, background: isDark ? "rgba(255,255,255,.06)" : "rgba(200,16,46,.08)", marginBottom: 14, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: pct === 100 ? IEQ.yellow : `linear-gradient(90deg,${IEQ.red},${IEQ.blue})`, transition: "width .4s ease" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                    {COLUNAS.map(({ campo, label, emoji }) => {
                      const marcado = p?.[campo];
                      return (
                          <button key={campo} className="ieq-presence-btn" onClick={() => alterarPresenca(i, campo)}
                                  style={{ borderColor: marcado ? IEQ.red : (isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"), background: marcado ? (isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.07)") : (isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)"), transform: marcado ? "scale(1.04)" : "scale(1)" }}>
                            <span style={{ fontSize: 18, filter: marcado ? "none" : "grayscale(1)", opacity: marcado ? 1 : 0.4, transition: "all .2s" }}>{marcado ? "✅" : emoji}</span>
                            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".1em", color: marcado ? IEQ.red : ts, fontWeight: 700 }}>{label.toUpperCase()}</span>
                          </button>
                      );
                    })}
                  </div>
                </div>
            );
          })}
        </div>

        {/* Botão fixo */}
        <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", padding: "16px 24px", zIndex: 50, background: isDark ? "linear-gradient(to top,rgba(10,6,8,1) 60%,transparent)" : "linear-gradient(to top,rgba(240,234,232,1) 60%,transparent)" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <button onClick={handleSalvar} disabled={salvando}
                    style={{ width: "100%", padding: "17px 0", borderRadius: 10, border: "none", background: salvando ? "rgba(200,16,46,.3)" : `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, color: "#fff", cursor: salvando ? "not-allowed" : "pointer", fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".22em", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .25s" }}>
              {salvando ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> SALVANDO...</> : <><ClipboardCheck size={17} /> SALVAR ALTERAÇÕES</>}
            </button>
          </div>
        </div>
      </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════ */
export default function RelatorioDiscipulado({ isDark = false }) {
  const [modo,              setModo]              = useState("novo"); // "novo" | "historico" | "editar"
  const [relatorioEditId,   setRelatorioEditId]   = useState(null);
  const [relatorioDuplicado, setRelatorioDuplicado] = useState(null);

  const [celula,            setCelula]            = useState(null);
  const [membros,           setMembros]           = useState([]);
  const [presencas,         setPresencas]         = useState([]);
  const [inicio,            setInicio]            = useState("");
  const [fim,               setFim]               = useState("");
  const [loading,           setLoading]           = useState(true);
  const [enviando,          setEnviando]          = useState(false);
  const [erro,              setErro]              = useState("");
  const [sucesso,           setSucesso]           = useState("");
  const [rascunhoCarregado, setRascunhoCarregado] = useState(false);
  const [salvouAgora,       setSalvouAgora]       = useState(false);
  const [historico,         setHistorico]         = useState([]);
  const [loadingHist,       setLoadingHist]       = useState(false);

  const celulaIdRef  = useRef(null);
  const inicioRef    = useRef("");
  const fimRef       = useRef("");
  const carregouRef  = useRef(false);
  const saveTimer    = useRef(null);

  const inicializarPresencas = useCallback((lista) =>
      lista.map((m) => ({
        membroId: m.id, nomeMembro: m.nome,
        escolaBiblica: false, quartaNoite: false,
        quintaNoite: false, domingoManha: false, domingoNoite: false,
      })), []);

  const agendarSave = useCallback((novasPresencas, novoFim) => {
    if (!carregouRef.current) return;
    const key = draftKey(celulaIdRef.current, inicioRef.current);
    if (!key || !celulaIdRef.current || !inicioRef.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      lsDraftSave(key, novasPresencas, novoFim);
      setSalvouAgora(true);
      setTimeout(() => setSalvouAgora(false), 2000);
    }, 800);
  }, []);

  const carregarDados = useCallback(async () => {
    carregouRef.current = false;
    setLoading(true);
    setErro("");
    try {
      const res = await api.get("/celulas/minha-celula");
      if (!res.data) { setErro("Célula não vinculada."); return; }
      const celData = res.data;
      setCelula(celData);
      celulaIdRef.current = celData.id;
      const lista = celData.membros || [];
      setMembros(lista);
      const semana = obterSemanaAtual();
      inicioRef.current = semana.inicio;
      fimRef.current    = semana.fim;
      const draft = lsDraftLoad(draftKey(celData.id, semana.inicio));
      if (draft?.presencas) {
        const idsAtuais   = new Set(lista.map(m => m.id));
        const idsRascunho = new Set(draft.presencas.map(p => p.membroId));
        const filtradas   = draft.presencas.filter(p => idsAtuais.has(p.membroId));
        const novos       = lista.filter(m => !idsRascunho.has(m.id)).map(m => ({
          membroId: m.id, nomeMembro: m.nome,
          escolaBiblica: false, quartaNoite: false,
          quintaNoite: false, domingoManha: false, domingoNoite: false,
        }));
        setPresencas([...filtradas, ...novos]);
        setInicio(semana.inicio);
        const fimSalvo = draft.fim || semana.fim;
        setFim(fimSalvo); fimRef.current = fimSalvo;
        setRascunhoCarregado(true);
        setTimeout(() => setRascunhoCarregado(false), 5000);
      } else {
        setPresencas(inicializarPresencas(lista));
        setInicio(semana.inicio);
        setFim(semana.fim);
      }
    } catch {
      setErro("Erro ao carregar dados.");
    } finally {
      setLoading(false);
      carregouRef.current = true;
    }
  }, [inicializarPresencas]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  // ─── Carregar histórico ──────────────────────────────────────
  const carregarHistorico = useCallback(async () => {
    try {
      setLoadingHist(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const res = await api.get("/discipulado/historico", { headers: { Authorization: `Bearer ${token}` } });
      setHistorico(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar histórico de discipulado:", err);
    } finally {
      setLoadingHist(false);
    }
  }, []);

  useEffect(() => {
    if (modo === "historico") carregarHistorico();
  }, [modo, carregarHistorico]);

  // ─── Troca de semana ─────────────────────────────────────────
  const handleInicioChange = useCallback((novoInicio) => {
    carregouRef.current = false;
    setInicio(novoInicio);
    inicioRef.current = novoInicio;
    setRelatorioDuplicado(null);
    const draft = lsDraftLoad(draftKey(celulaIdRef.current, novoInicio));
    if (draft?.presencas) {
      setPresencas(draft.presencas);
      const f = draft.fim || fimRef.current;
      setFim(f); fimRef.current = f;
      setRascunhoCarregado(true);
      setTimeout(() => setRascunhoCarregado(false), 5000);
    } else {
      setMembros(prev => { const novas = inicializarPresencas(prev); setPresencas(novas); return prev; });
    }
    carregouRef.current = true;
  }, [inicializarPresencas]);

  // ─── Marcar presença ─────────────────────────────────────────
  const alterarPresenca = useCallback((index, campo) => {
    setPresencas(prev => {
      const novo = [...prev];
      if (!novo[index]) return prev;
      novo[index] = { ...novo[index], [campo]: !novo[index][campo] };
      agendarSave(novo, fimRef.current);
      return novo;
    });
  }, [agendarSave]);

  const handleFimChange = useCallback((novoFim) => {
    setFim(novoFim); fimRef.current = novoFim;
    setPresencas(prev => { agendarSave(prev, novoFim); return prev; });
  }, [agendarSave]);

  const stats = useMemo(() => {
    const totalGeral    = presencas.reduce((acc, p) => acc + COLUNAS.filter(c => p[c.campo]).length, 0);
    const totalPossivel = presencas.length * COLUNAS.length;
    const porcentagem   = totalPossivel > 0 ? Math.round((totalGeral / totalPossivel) * 100) : 0;
    return { totalGeral, porcentagem };
  }, [presencas]);

  // ─── Enviar (com verificação de duplicata) ───────────────────
  const enviarRelatorio = async () => {
    setErro(""); setSucesso("");
    if (!inicio || !fim || !celula?.id || presencas.length === 0)
      return setErro("Verifique os dados.");
    setEnviando(true);
    try {
      // Verificar duplicata no histórico
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const resHist = await api.get("/discipulado/historico", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jaExiste = (resHist.data || []).find(r => r.inicio === inicio);
      if (jaExiste) {
        setRelatorioDuplicado(jaExiste);
        setEnviando(false);
        return;
      }

      const payload = presencas.map(({ nomeMembro, membroId, ...rest }) => ({
        membroId: Number(membroId), ...rest,
      }));
      await api.post(`/discipulado/relatorio-semanal?inicio=${inicio}&fim=${fim}`, payload);
      lsDraftRemove(draftKey(celula.id, inicio));
      carregouRef.current = false;
      setMembros(prev => { const zeradas = inicializarPresencas(prev); setPresencas(zeradas); return prev; });
      carregouRef.current = true;
      setSucesso("Relatório enviado com sucesso! ✅");
      setTimeout(() => setSucesso(""), 5000);
    } catch (e) {
      setErro(e?.response?.data?.message || "Erro no envio.");
    } finally {
      setEnviando(false);
    }
  };

  // ─── Estilos ─────────────────────────────────────────────────
  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing:border-box; }
    @keyframes stripe    { 0%{background-position:0 0} 100%{background-position:60px 60px} }
    @keyframes pulse     { 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.12);opacity:.12} }
    @keyframes spin      { to{transform:rotate(360deg)} }
    @keyframes fadeIn    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:.35} }
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
    .ieq-kpi {
      background:${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"};
      border-radius:12px; padding:22px; text-align:center; animation:fadeIn .5s ease both;
    }
    .ieq-input-date {
      background:transparent; border:none; outline:none;
      font-family:'Cinzel',serif; font-size:10px; letter-spacing:.12em;
      color:${tp}; cursor:pointer; font-weight:700;
    }
    .ieq-member-block {
      padding:22px 24px;
      border-bottom:1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.07)"};
      animation:fadeIn .4s ease both;
    }
    .ieq-member-block:last-child { border-bottom:none; }
    .ieq-presence-btn {
      display:flex; flex-direction:column; align-items:center; gap:6px;
      padding:12px 8px; border-radius:10px; border:1px solid; cursor:pointer;
      transition:all .2s; background:none;
    }
    .ieq-avatar {
      width:42px; height:42px; border-radius:8px;
      display:flex; align-items:center; justify-content:center;
      font-family:'Cinzel',serif; font-weight:700; font-size:16px; color:#fff;
    }
    .ieq-btn-submit {
      width:100%; padding:16px 0; border:none; border-radius:10px; cursor:pointer;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.2em;
      display:flex; align-items:center; justify-content:center; gap:10px;
      background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red}); color:#fff;
      transition:all .25s; box-shadow:0 8px 24px rgba(200,16,46,.25);
    }
    .ieq-btn-submit:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.1); }
    .ieq-btn-submit:disabled { opacity:.4; cursor:not-allowed; box-shadow:none; }
    .ieq-alert {
      padding:14px 20px; border-radius:8px; text-align:center;
      font-family:'Cinzel',serif; font-size:10px; letter-spacing:.14em; font-weight:700;
      animation:slideDown .3s ease;
    }
    .ieq-toast {
      animation:slideDown .35s ease; border-radius:10px; padding:12px 18px;
      display:flex; align-items:center; gap:10px;
      font-family:'Cinzel',serif; font-size:9.5px; letter-spacing:.16em;
      box-shadow:0 4px 20px rgba(0,61,165,.35);
    }
    .ieq-saved-badge {
      display:inline-flex; align-items:center; gap:5px;
      font-family:'Cinzel',serif; font-size:8.5px; letter-spacing:.14em;
      color:${IEQ.yellow}; animation:blink 1.2s ease 2;
    }
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
      transition:opacity .2s; flex-shrink:0;
    }
    .ieq-edit-btn:hover { opacity:.85; }
    .pulse-ring { position:absolute; border-radius:50%; border:1px solid rgba(200,16,46,.35); animation:pulse 3s ease-in-out infinite; }
    .spin-icon  { animation:spin 1s linear infinite; }
    .divider    { height:1px; background:linear-gradient(90deg,transparent,${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"},transparent); }
  `;

  // ─── Modo edição ─────────────────────────────────────────────
  if (modo === "editar" && relatorioEditId) {
    return (
        <div style={{ position: "relative", paddingBottom: 48 }}>
          <style>{globalStyles}</style>
          <div className="ieq-bg-stripe" />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
            <TelaEditarDiscipulado
                relatorioId={relatorioEditId}
                isDark={isDark}
                onVoltar={() => { setModo("historico"); setRelatorioEditId(null); }}
                onSalvo={() => { setModo("historico"); setRelatorioEditId(null); carregarHistorico(); }}
            />
          </div>
        </div>
    );
  }

  if (loading) return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", gap: 14 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <QuadrangularCross size={40} />
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: ".2em", color: IEQ.red }}>CARREGANDO MEMBROS...</p>
      </div>
  );

  return (
      <div style={{ position: "relative", paddingBottom: 48 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg-stripe" />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Abas */}
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"}` }}>
            {[
              { key: "novo",      label: "NOVO RELATÓRIO", icon: <CheckCircle2 size={13} /> },
              { key: "historico", label: "HISTÓRICO",      icon: <History size={13} /> },
            ].map(tab => (
                <button key={tab.key} className="ieq-tab" onClick={() => setModo(tab.key)}
                        style={{ background: modo === tab.key ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})` : (isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"), color: modo === tab.key ? "#fff" : ts }}>
                  {tab.icon} {tab.label}
                </button>
            ))}
          </div>

          {/* ══════════ ABA: HISTÓRICO ══════════ */}
          {modo === "historico" && (
              <div className="ieq-card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <History size={18} style={{ color: IEQ.red }} />
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".16em", color: tp }}>RELATÓRIOS DE DISCIPULADO</span>
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
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".14em", color: tp, margin: "0 0 4px" }}>
                              {rel.inicio
                                  ? `${new Date(rel.inicio + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })} → ${new Date((rel.fim || rel.inicio) + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`
                                  : "—"}
                            </p>
                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: ts, margin: "0 0 6px" }}>
                              {rel.totalPresencas ?? rel.totalGeral ?? 0} presenças registradas
                            </p>
                            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".12em", color: IEQ.red }}>
                      {rel.frequencia ?? "—"}% DE FREQUÊNCIA
                    </span>
                          </div>
                          <button className="ieq-edit-btn" onClick={() => { setRelatorioEditId(rel.id); setModo("editar"); }}>
                            <Edit3 size={12} /> EDITAR
                          </button>
                        </div>
                    ))
                )}
              </div>
          )}

          {/* ══════════ ABA: NOVO RELATÓRIO ══════════ */}
          {modo === "novo" && (
              <>
                {/* Toast rascunho restaurado */}
                {rascunhoCarregado && (
                    <div className="ieq-toast" style={{ background: `linear-gradient(135deg,${IEQ.blue},${IEQ.blueDark})`, color: "#fff" }}>
                      <Save size={15} />
                      RASCUNHO RESTAURADO — suas marcações anteriores foram recuperadas automaticamente
                    </div>
                )}

                {/* Banner de duplicata */}
                {relatorioDuplicado && (
                    <div style={{ background: isDark ? "rgba(253,184,19,.08)" : "rgba(253,184,19,.12)", border: "1px solid rgba(253,184,19,.35)", borderRadius: 10, padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <AlertTriangle size={18} style={{ color: IEQ.yellow, flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: ".14em", color: IEQ.yellowDark, margin: "0 0 6px" }}>
                            RELATÓRIO JÁ ENVIADO PARA ESTE PERÍODO
                          </p>
                          <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: ts, margin: "0 0 14px" }}>
                            Já existe um relatório de discipulado para a semana de{" "}
                            <strong>{new Date(relatorioDuplicado.inicio + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</strong>.
                            Deseja editá-lo?
                          </p>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button onClick={() => setRelatorioDuplicado(null)}
                                    style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid rgba(253,184,19,.4)", background: "none", color: IEQ.yellowDark, cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".14em" }}>
                              CANCELAR
                            </button>
                            <button onClick={() => { setRelatorioEditId(relatorioDuplicado.id); setRelatorioDuplicado(null); setModo("editar"); }}
                                    style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: `linear-gradient(135deg,${IEQ.yellowDark},${IEQ.yellow})`, color: "#1A0A0D", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700, letterSpacing: ".14em", display: "flex", alignItems: "center", gap: 7 }}>
                              <Edit3 size={13} /> EDITAR RELATÓRIO
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                )}

                {/* Header */}
                <div className="ieq-card" style={{ padding: "28px 32px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <div className="pulse-ring" style={{ width: 64, height: 64 }} />
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: isDark ? "#1A0A0D" : "#fff", border: "1px solid rgba(200,16,46,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <QuadrangularCross size={28} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                          <UserCheck size={14} style={{ color: IEQ.red }} />
                          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".2em", color: IEQ.red }}>RELATÓRIO DE DISCIPULADO</span>
                        </div>
                        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 700, letterSpacing: ".12em", color: tp, margin: 0 }}>
                          {celula?.nome?.toUpperCase() || "CÉLULA"}
                        </h2>
                        <div style={{ marginTop: 6, height: 18 }}>
                          {salvouAgora && (
                              <span className="ieq-saved-badge"><Save size={10} /> RASCUNHO SALVO</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 8, background: isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.05)", border: `1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"}` }}>
                      <Calendar size={14} style={{ color: IEQ.red }} />
                      <input type="date" className="ieq-input-date" value={inicio} onChange={e => handleInicioChange(e.target.value)} />
                      <span style={{ color: ts, fontFamily: "'Cinzel',serif", fontSize: 10 }}>→</span>
                      <input type="date" className="ieq-input-date" value={fim} onChange={e => handleFimChange(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    { label: "MEMBROS",    val: membros.length,         color: IEQ.red },
                    { label: "PRESENÇAS",  val: stats.totalGeral,       color: IEQ.blue },
                    { label: "FREQUÊNCIA", val: `${stats.porcentagem}%`, color: stats.porcentagem > 60 ? IEQ.yellow : IEQ.red, highlight: stats.porcentagem > 60 },
                  ].map(({ label, val, color, highlight }) => (
                      <div key={label} className="ieq-kpi" style={highlight ? { background: `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, border: "none" } : {}}>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: highlight ? "rgba(255,255,255,.55)" : ts, margin: "0 0 6px" }}>{label}</p>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 36, fontWeight: 700, color: highlight ? "#fff" : color, margin: 0, lineHeight: 1 }}>{val}</p>
                      </div>
                  ))}
                </div>

                {erro && <div className="ieq-alert" style={{ background: "rgba(200,16,46,.08)", border: "1px solid rgba(200,16,46,.3)", color: IEQ.red }}>{erro.toUpperCase()}</div>}
                {sucesso && <div className="ieq-alert" style={{ background: "rgba(0,61,165,.08)", border: "1px solid rgba(0,61,165,.3)", color: isDark ? IEQ.blueLight : IEQ.blue }}>{sucesso.toUpperCase()}</div>}

                {/* Lista de membros */}
                <div className="ieq-card" style={{ overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(5,60px)", padding: "14px 24px", borderBottom: `1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`, background: isDark ? "rgba(200,16,46,.04)" : "rgba(200,16,46,.03)", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".16em", color: ts }}>MEMBRO</span>
                    {COLUNAS.map(({ label, emoji }) => (
                        <div key={label} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 14, lineHeight: 1 }}>{emoji}</div>
                          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".1em", color: ts, margin: "4px 0 0" }}>{label.toUpperCase()}</p>
                        </div>
                    ))}
                  </div>

                  {membros.map((m, i) => {
                    const p     = presencas[i];
                    const total = p ? COLUNAS.filter(c => p[c.campo]).length : 0;
                    const pct   = Math.round((total / COLUNAS.length) * 100);
                    return (
                        <div key={m.id} className="ieq-member-block">
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div className="ieq-avatar" style={{ background: `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})` }}>
                                {m.nome.charAt(0)}
                              </div>
                              <div>
                                <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, fontWeight: 600, color: tp, margin: 0 }}>{m.nome}</p>
                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".12em", color: ts, margin: "2px 0 0" }}>ID #{m.id}</p>
                              </div>
                            </div>
                            <div style={{ padding: "5px 14px", borderRadius: 99, background: total === COLUNAS.length ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})` : (isDark ? "rgba(255,255,255,.05)" : "rgba(200,16,46,.06)"), border: `1px solid ${total === COLUNAS.length ? IEQ.red : (isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)")}` }}>
                              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".14em", color: total === COLUNAS.length ? "#fff" : ts }}>{total}/{COLUNAS.length}</span>
                            </div>
                          </div>

                          <div style={{ height: 4, borderRadius: 99, background: isDark ? "rgba(255,255,255,.06)" : "rgba(200,16,46,.08)", marginBottom: 14, overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: pct === 100 ? IEQ.yellow : `linear-gradient(90deg,${IEQ.red},${IEQ.blue})`, transition: "width .4s ease" }} />
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                            {COLUNAS.map(({ campo, label, emoji }) => {
                              const marcado = p?.[campo];
                              return (
                                  <button key={campo} className="ieq-presence-btn" onClick={() => alterarPresenca(i, campo)}
                                          style={{ borderColor: marcado ? IEQ.red : (isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"), background: marcado ? (isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.07)") : (isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)"), transform: marcado ? "scale(1.04)" : "scale(1)" }}>
                                    <span style={{ fontSize: 18, filter: marcado ? "none" : "grayscale(1)", opacity: marcado ? 1 : 0.4, transition: "all .2s" }}>{marcado ? "✅" : emoji}</span>
                                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".1em", color: marcado ? IEQ.red : ts, fontWeight: 700 }}>{label.toUpperCase()}</span>
                                  </button>
                              );
                            })}
                          </div>
                        </div>
                    );
                  })}
                </div>

                <button className="ieq-btn-submit" onClick={enviarRelatorio} disabled={enviando || loading || membros.length === 0}>
                  {enviando
                      ? <><Loader2 size={17} className="spin-icon" /> PROCESSANDO...</>
                      : <><CheckCircle2 size={17} /> FINALIZAR RELATÓRIO DA SEMANA</>}
                </button>

                <div className="divider" />
                <p style={{ textAlign: "center", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".15em", color: ts }}>
                  © IEQ PITAUÇU · SISTEMA SEGURO · {new Date().getFullYear()}
                </p>
              </>
          )}
        </div>
      </div>
  );
}
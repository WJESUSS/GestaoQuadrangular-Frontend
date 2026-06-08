import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api.js";
import {
  Calendar, BookOpen, Loader2, ChevronDown,
  UserCheck, ClipboardCheck, Trophy, Users2, CheckCircle2,
  Edit3, ArrowLeft, AlertTriangle, History, Lock, XCircle, Ban,
} from "lucide-react";

const IEQ = {
  red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
  yellow: "#FDB813", yellowDark: "#C48C00",
  blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
  white: "#FFFFFF", offWhite: "#F5F0E8",
  dark: "#0A0608", darkCard: "#110A0D",
};

const DECISAO_CONFIG = {
  ACEITOU_JESUS: { label: "Aceitou Jesus", cor: "#185FA5", bg: "#E6F1FB", borda: "#B5D4F4", icone: "✝️" },
  RECONCILIOU:   { label: "Reconciliou",   cor: "#854F0B", bg: "#FAEEDA", borda: "#FAC775", icone: "🙏" },
  BATISMO_AGUAS: { label: "Deseja Batismo",cor: "#0F6E56", bg: "#E1F5EE", borda: "#9FE1CB", icone: "💧" },
};

// ─── Mapa de motivos PT-BR ───────────────────────────────────────────────────
const MOTIVO_LABELS = {
  AUSENCIA_LIDER:      { label: "Ausência do líder",        icone: "👤" },
  PROBLEMA_CLIMATICO:  { label: "Problema climático",       icone: "🌧️" },
  EVENTO_IGREJA:       { label: "Evento da igreja",         icone: "⛪" },
  PROBLEMA_SAUDE:      { label: "Problema de saúde",        icone: "🏥" },
  LOCAL_INDISPONIVEL:  { label: "Local indisponível",       icone: "🔒" },
  VIAGEM_MEMBROS:      { label: "Viagem dos membros",       icone: "✈️" },
  CANCELADA_PASTOR:    { label: "Cancelada pelo pastor",    icone: "✋" },
  OUTRO:               { label: "Outro motivo",             icone: "📋" },
};

const draftKey = (celulaId) => `ieq_relatorio_draft_${celulaId}`;

const BIBLIA = [
  { nome: "Gênesis", cap: 50 }, { nome: "Êxodo", cap: 40 }, { nome: "Levítico", cap: 27 },
  { nome: "Números", cap: 36 }, { nome: "Deuteronômio", cap: 34 }, { nome: "Josué", cap: 24 },
  { nome: "Juízes", cap: 21 }, { nome: "Rute", cap: 4 }, { nome: "1 Samuel", cap: 31 },
  { nome: "2 Samuel", cap: 24 }, { nome: "1 Reis", cap: 22 }, { nome: "2 Reis", cap: 25 },
  { nome: "1 Crônicas", cap: 29 }, { nome: "2 Crônicas", cap: 36 }, { nome: "Esdras", cap: 10 },
  { nome: "Neemias", cap: 13 }, { nome: "Ester", cap: 10 }, { nome: "Jó", cap: 42 },
  { nome: "Salmos", cap: 150 }, { nome: "Provérbios", cap: 31 }, { nome: "Eclesiastes", cap: 12 },
  { nome: "Cânticos", cap: 8 }, { nome: "Isaías", cap: 66 }, { nome: "Jeremias", cap: 52 },
  { nome: "Lamentações", cap: 5 }, { nome: "Ezequiel", cap: 48 }, { nome: "Daniel", cap: 12 },
  { nome: "Oséias", cap: 14 }, { nome: "Joel", cap: 3 }, { nome: "Amós", cap: 9 },
  { nome: "Obadias", cap: 1 }, { nome: "Jonas", cap: 4 }, { nome: "Miqueias", cap: 7 },
  { nome: "Naum", cap: 3 }, { nome: "Habacuque", cap: 3 }, { nome: "Sofonias", cap: 3 },
  { nome: "Ageu", cap: 2 }, { nome: "Zacarias", cap: 14 }, { nome: "Malaquias", cap: 4 },
  { nome: "Mateus", cap: 28 }, { nome: "Marcos", cap: 16 }, { nome: "Lucas", cap: 24 },
  { nome: "João", cap: 21 }, { nome: "Atos", cap: 28 }, { nome: "Romanos", cap: 16 },
  { nome: "1 Coríntios", cap: 16 }, { nome: "2 Coríntios", cap: 13 }, { nome: "Gálatas", cap: 6 },
  { nome: "Efésios", cap: 6 }, { nome: "Filipenses", cap: 4 }, { nome: "Colossenses", cap: 4 },
  { nome: "1 Tessalonicenses", cap: 5 }, { nome: "2 Tessalonicenses", cap: 3 },
  { nome: "1 Timóteo", cap: 6 }, { nome: "2 Timóteo", cap: 4 }, { nome: "Tito", cap: 3 },
  { nome: "Filemom", cap: 1 }, { nome: "Hebreus", cap: 13 }, { nome: "Tiago", cap: 5 },
  { nome: "1 Pedro", cap: 5 }, { nome: "2 Pedro", cap: 3 }, { nome: "1 João", cap: 5 },
  { nome: "2 João", cap: 1 }, { nome: "3 João", cap: 1 }, { nome: "Judas", cap: 1 },
  { nome: "Apocalipse", cap: 22 },
];

const TEMAS_FIXOS = [
  "A adoração verdadeira","Alegria do Senhor","Amizade com Deus","Fé em meio às provas",
  "Esperança em tempos difíceis","Família segundo o coração de Deus","Deus é fiel",
  "Cristo, nossa esperança","O amor de Cristo","Paz que excede todo entendimento",
  "Vida guiada pelo Espírito Santo","Chamados para servir","O Deus do impossível",
  "Vitória pelo sangue do Cordeiro","Voltando ao primeiro amor",
];

const normalizarData = (dataStr) => {
  if (!dataStr) return "";
  return String(dataStr).substring(0, 10);
};

function dispararAtualizacaoMetas(celulaId) {
  window.dispatchEvent(
      new CustomEvent("ieq:metas:recalculadas", { detail: { celulaId: Number(celulaId) } })
  );
}

// ─── Badge de decisão ────────────────────────────────────────────────────────
function BadgeDecisao({ decisao }) {
  const cfg = DECISAO_CONFIG[decisao];
  if (!cfg) return null;
  return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "2px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600,
        fontFamily: "'EB Garamond', serif",
        background: cfg.bg, color: cfg.cor, border: `1px solid ${cfg.borda}`,
        whiteSpace: "nowrap", flexShrink: 0,
      }}>
      {cfg.icone} {cfg.label}
        <Lock size={9} style={{ marginLeft: 3, opacity: 0.6 }} />
    </span>
  );
}

// ─── Badge de "Não realizada" para o histórico ───────────────────────────────
function BadgeNaoRealizada({ motivo }) {
  const cfg = MOTIVO_LABELS[motivo] || MOTIVO_LABELS.OUTRO;
  return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 600,
        fontFamily: "'Cinzel', serif", letterSpacing: ".1em",
        background: "rgba(253,184,19,.15)", color: "#C48C00",
        border: "1px solid rgba(253,184,19,.4)",
        whiteSpace: "nowrap",
      }}>
      <Ban size={10} /> NÃO REALIZADA · {cfg.icone} {cfg.label.toUpperCase()}
    </span>
  );
}

function DecisaoReadOnly({ decisao, isDark, ts, tp }) {
  const cfg = decisao && decisao !== "NENHUMA" ? DECISAO_CONFIG[decisao] : null;
  return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8,
        background: isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)",
        border: `1px solid ${isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.1)"}`,
      }}>
        <Lock size={13} style={{ color: isDark ? "rgba(245,240,232,.3)" : "rgba(26,10,13,.3)", flexShrink: 0 }} />
        {cfg ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'EB Garamond',serif", fontSize: 14, color: cfg.cor, fontWeight: 600 }}>
          {cfg.icone} {cfg.label}
        </span>
        ) : (
            <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: ts, fontStyle: "italic" }}>Sem decisão registrada</span>
        )}
        <span style={{ marginLeft: "auto", fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".14em", color: isDark ? "rgba(245,240,232,.25)" : "rgba(26,10,13,.25)" }}>
        SOMENTE LEITURA
      </span>
      </div>
  );
}

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

// ─── Toast de sucesso (célula realizada) ─────────────────────────────────────
function ToastSucesso({ total, onClose }) {
  const [saindo, setSaindo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setSaindo(true); setTimeout(() => { if (onClose) onClose(); }, 450); }, 4800);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px",
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
        animation: saindo ? "ieqOverlayOut .45s ease forwards" : "ieqOverlayIn .3s ease forwards",
      }}>
        <div style={{
          background: "linear-gradient(160deg, #0d6e3a 0%, #0a5530 60%, #073d22 100%)",
          borderRadius: 22, padding: "32px 40px 28px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
          minWidth: 300, maxWidth: 380, width: "100%",
          boxShadow: "0 16px 60px rgba(13,110,58,.5)",
          animation: saindo ? "ieqToastOut .45s cubic-bezier(.4,0,.6,1) forwards" : "ieqToastIn .55s cubic-bezier(.34,1.56,.64,1) forwards",
        }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(255,255,255,.18)", border: "2px solid rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={32} style={{ color: "#fff" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 700, letterSpacing: ".18em", color: "#fff", margin: "0 0 8px" }}>GLÓRIA A DEUS!</p>
            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 18, color: "rgba(255,255,255,.82)", lineHeight: 1.55, margin: 0 }}>
              Relatório enviado com sucesso.<br /><em>O Senhor viu cada presença!</em>
            </p>
          </div>
          <div style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 20, padding: "6px 14px", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".14em", color: "rgba(255,255,255,.92)", display: "flex", alignItems: "center", gap: 6 }}>
            <Users2 size={12} /> {total} PRESENTES
          </div>
        </div>
      </div>
  );
}

// ─── Toast de sucesso (célula NÃO realizada) ─────────────────────────────────
function ToastNaoRealizada({ motivo, onClose }) {
  const [saindo, setSaindo] = useState(false);
  const cfg = MOTIVO_LABELS[motivo] || MOTIVO_LABELS.OUTRO;
  useEffect(() => {
    const t = setTimeout(() => { setSaindo(true); setTimeout(() => { if (onClose) onClose(); }, 450); }, 4800);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px",
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
        animation: saindo ? "ieqOverlayOut .45s ease forwards" : "ieqOverlayIn .3s ease forwards",
      }}>
        <div style={{
          background: "linear-gradient(160deg, #7a5200 0%, #5c3d00 60%, #3d2800 100%)",
          borderRadius: 22, padding: "32px 40px 28px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
          minWidth: 300, maxWidth: 380, width: "100%",
          boxShadow: "0 16px 60px rgba(196,140,0,.4)",
          animation: saindo ? "ieqToastOut .45s cubic-bezier(.4,0,.6,1) forwards" : "ieqToastIn .55s cubic-bezier(.34,1.56,.64,1) forwards",
        }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(255,255,255,.12)", border: "2px solid rgba(253,184,19,.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
            {cfg.icone}
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 700, letterSpacing: ".18em", color: IEQ.yellow, margin: "0 0 8px" }}>REGISTRADO</p>
            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 17, color: "rgba(255,255,255,.82)", lineHeight: 1.55, margin: 0 }}>
              Ausência de célula registrada.<br /><em>Deus conhece cada circunstância.</em>
            </p>
          </div>
          <div style={{ background: "rgba(253,184,19,.15)", border: "1px solid rgba(253,184,19,.35)", borderRadius: 20, padding: "6px 14px", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".12em", color: IEQ.yellow, display: "flex", alignItems: "center", gap: 6 }}>
            <Ban size={11} /> {cfg.label.toUpperCase()}
          </div>
        </div>
      </div>
  );
}

function SeletorReferenciaBiblica({ value, onChange, isDark }) {
  const [inputVal, setInputVal] = useState(value || "");
  const [sugestoes, setSugestoes] = useState([]);
  const [aberto, setAberto] = useState(false);
  const inputRef = useRef(null);
  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  useEffect(() => { if (value !== inputVal) setInputVal(value || ""); }, [value]);

  const gerarSugestoes = (texto) => {
    if (!texto.trim()) { setSugestoes([]); return; }
    const lower = texto.toLowerCase();
    const livrosMatch = BIBLIA.filter(l => l.nome.toLowerCase().includes(lower)).slice(0, 4).map(l => l.nome);
    const temasMatch = TEMAS_FIXOS.filter(t => t.toLowerCase().includes(lower)).slice(0, 10);
    const todas = [...new Set([...livrosMatch, ...temasMatch])];
    if (texto.trim() && !todas.some(s => s.toLowerCase() === lower)) todas.unshift(texto.trim());
    setSugestoes(todas.slice(0, 12));
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInputVal(val); onChange(val); gerarSugestoes(val); setAberto(true);
  };

  return (
      <div>
        <label className="ieq-label">
          <BookOpen size={11} style={{ display: "inline", marginRight: 6 }} />
          TEMA / REFERÊNCIA BÍBLICA
        </label>
        <div style={{ position: "relative" }}>
          <input
              ref={inputRef} className="ieq-input" type="text"
              placeholder="Ex: João 3:16 ou A fé que move..."
              value={inputVal} onChange={handleChange}
              onFocus={() => { if (inputVal.trim()) { gerarSugestoes(inputVal); setAberto(true); } }}
              onBlur={() => setTimeout(() => setAberto(false), 160)}
              autoComplete="off"
          />
          {aberto && sugestoes.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 200,
                background: isDark ? "#1a0a0d" : "#fff",
                border: `1px solid ${isDark ? "rgba(200,16,46,.3)" : "rgba(200,16,46,.22)"}`,
                borderRadius: 10, maxHeight: 260, overflowY: "auto",
                boxShadow: "0 8px 28px rgba(0,0,0,.22)",
              }}>
                {sugestoes.map((s, i) => (
                    <button key={i} onMouseDown={() => { setInputVal(s); onChange(s); setSugestoes([]); setAberto(false); }}
                            style={{
                              width: "100%", background: "none", border: "none", cursor: "pointer",
                              padding: "11px 16px", textAlign: "left",
                              fontFamily: "'EB Garamond',serif", fontSize: 15,
                              color: isDark ? IEQ.offWhite : "#1A0A0D",
                              borderBottom: i < sugestoes.length - 1 ? `1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.07)"}` : "none",
                            }}
                    >{s}</button>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}

/* =============================================================
   SELETOR DE MOTIVO — célula não realizada
============================================================= */
function SeletorMotivo({ value, onChange, isDark }) {
  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  return (
      <div>
        <label className="ieq-label">
          <Ban size={11} style={{ display: "inline", marginRight: 6 }} />
          MOTIVO DA NÃO REALIZAÇÃO
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {Object.entries(MOTIVO_LABELS).map(([key, { label, icone }]) => {
            const selecionado = value === key;
            return (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "13px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                      textAlign: "left", transition: "all .2s",
                      background: selecionado
                          ? `linear-gradient(135deg,${IEQ.yellowDark},${IEQ.yellow})`
                          : (isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"),
                      boxShadow: selecionado ? "0 4px 16px rgba(253,184,19,.3)" : "none",
                      outline: selecionado ? "none" : `1px solid ${isDark ? "rgba(253,184,19,.15)" : "rgba(253,184,19,.25)"}`,
                    }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{icone}</span>
                  <span style={{
                    fontFamily: "'EB Garamond',serif", fontSize: 14, lineHeight: 1.3,
                    color: selecionado ? IEQ.dark : tp,
                    fontWeight: selecionado ? 600 : 400,
                  }}>{label}</span>
                  {selecionado && (
                      <CheckCircle2 size={14} style={{ color: IEQ.dark, marginLeft: "auto", flexShrink: 0 }} />
                  )}
                </button>
            );
          })}
        </div>
      </div>
  );
}

/* =============================================================
   TELA EDITAR RELATÓRIO
============================================================= */
function TelaEditarRelatorio({ relatorioId, onVoltar, onSalvo, isDark = false }) {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [pessoas, setPessoas] = useState([]);
  const [nomeCelula, setNomeCelula] = useState("");
  const [nomeLider, setNomeLider] = useState("");
  const [celulaId, setCelulaId] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [decisoesVisitantes, setDecisoesVisitantes] = useState({});
  const [relatorioRealizada, setRelatorioRealizada] = useState(true);
  const [motivoNaoRealizacao, setMotivoNaoRealizacao] = useState(null);

  const [form, setForm] = useState({ dataReuniao: "", estudo: "", selecionadosKeys: [] });

  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

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
      setRelatorioRealizada(rel.realizada !== false);
      setMotivoNaoRealizacao(rel.motivoNaoRealizacao || null);

      const [resMembros, resVisitantes] = await Promise.all([
        api.get(`/celulas/${rel.celulaId}/membros`, { headers }),
        api.get(`/visitantes/celula/${rel.celulaId}/ativos`, { headers }),
      ]);

      const membros    = (resMembros.data   || []).map(m => ({ id: m.id, nome: m.nome, tipo: "MEMBRO",    uKey: `MEMBRO-${m.id}`    }));
      const visitantes = (resVisitantes.data || []).map(v => ({ id: v.id, nome: v.nome, tipo: "VISITANTE", uKey: `VISITANTE-${v.id}` }));
      setPessoas([...membros, ...visitantes].sort((a, b) => a.nome.localeCompare(b.nome)));

      const decisoesMap = {};
      await Promise.all(
          (resVisitantes.data || []).map(async (v) => {
            try {
              const res = await api.get(`/visitantes/${v.id}`, { headers });
              decisoesMap[v.id] = res.data?.decisaoEspiritual ?? null;
            } catch { decisoesMap[v.id] = null; }
          })
      );
      setDecisoesVisitantes(decisoesMap);

      const keysPresentes = [
        ...(rel.membrosPresentes  || []).map(m => `MEMBRO-${m.id}`),
        ...(rel.visitantesPresentes || []).map(v => `VISITANTE-${v.id}`),
      ];
      setForm({ dataReuniao: normalizarData(rel.dataReuniao), estudo: rel.estudo || "", selecionadosKeys: keysPresentes });
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
      alert("Não foi possível carregar o relatório.");
    } finally { setLoading(false); }
  }, [relatorioId]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const alternarPresenca = (uKey) => {
    const isMarcado = form.selecionadosKeys.includes(uKey);
    setProcessingIds(prev => new Set(prev).add(uKey));
    setForm(prev => ({
      ...prev,
      selecionadosKeys: isMarcado ? prev.selecionadosKeys.filter(k => k !== uKey) : [...prev.selecionadosKeys, uKey],
    }));
    setTimeout(() => setProcessingIds(prev => { const n = new Set(prev); n.delete(uKey); return n; }), 200);
  };

  const membrosPresentes    = form.selecionadosKeys.filter(k => k.startsWith("MEMBRO-")).length;
  const visitantesPresentes = form.selecionadosKeys.filter(k => k.startsWith("VISITANTE-")).length;
  const total = membrosPresentes + visitantesPresentes;

  const handleSalvar = async () => {
    if (relatorioRealizada && !form.estudo.trim()) return alert("Informe o tema ou referência bíblica do estudo.");
    if (!relatorioRealizada && !motivoNaoRealizacao) return alert("Selecione o motivo da não realização.");
    try {
      setSalvando(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const payload = relatorioRealizada
          ? {
            celulaId: Number(celulaId),
            dataReuniao: normalizarData(form.dataReuniao),
            estudo: form.estudo.trim(),
            membrosPresentesIds: form.selecionadosKeys.filter(k => k.startsWith("MEMBRO-")).map(k => Number(k.replace("MEMBRO-", ""))),
            visitantesPresentes: form.selecionadosKeys.filter(k => k.startsWith("VISITANTE-")).map(k => {
              const id = Number(k.replace("VISITANTE-", ""));
              return { id, decisaoEspiritual: decisoesVisitantes[id] ?? "NENHUMA" };
            }),
          }
          : {
            celulaId: Number(celulaId),
            dataReuniao: normalizarData(form.dataReuniao),
            realizada: false,
            motivoNaoRealizacao,
          };
      await api.put(`/relatorios/${relatorioId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setSucesso(true);
      setTimeout(() => { setSucesso(false); if (onSalvo) onSalvo(); }, 2200);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar alterações.");
    } finally { setSalvando(false); }
  };

  if (loading) return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <QuadrangularCross size={40} />
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".2em", color: IEQ.red, marginTop: 14 }}>CARREGANDO RELATÓRIO...</p>
        </div>
      </div>
  );

  const podeSalvar = relatorioRealizada ? form.estudo.trim() : motivoNaoRealizacao;

  return (
      <div style={{ minHeight: "100vh", position: "relative", paddingBottom: 120 }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ paddingTop: 20, paddingBottom: 8 }}>
            <button onClick={onVoltar} style={{ background: "none", border: `1px solid ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}`, color: tp, padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".15em", display: "flex", alignItems: "center", gap: 8 }}>
              <ArrowLeft size={13} /> VOLTAR
            </button>
          </div>

          {sucesso && (
              <div style={{ marginBottom: 12, animation: "fadeIn .4s ease", background: "linear-gradient(135deg,#0d6e3a,#0a5530)", borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: ".16em", color: "#fff" }}>
                <CheckCircle2 size={16} /> RELATÓRIO ATUALIZADO COM SUCESSO!
              </div>
          )}

          <div style={{ marginBottom: 12, background: "linear-gradient(135deg,rgba(253,184,19,.15),rgba(196,140,0,.1))", border: "1px solid rgba(253,184,19,.3)", borderRadius: 10, padding: "13px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={16} style={{ color: IEQ.yellow, flexShrink: 0 }} />
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".14em", color: IEQ.yellowDark, margin: 0 }}>
              MODO EDIÇÃO — Você está alterando um relatório já enviado.
            </p>
          </div>

          {/* Cabeçalho */}
          <div style={{ padding: "36px 40px 32px", marginBottom: 24, background: isDark ? "linear-gradient(135deg,#1A0A0D,#0A0608)" : `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, borderRadius: 14, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(-55deg,rgba(255,255,255,.03) 0 10px,transparent 10px 20px)", backgroundSize: "40px 40px" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Edit3 size={22} style={{ color: "#fff" }} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".22em", color: "rgba(255,255,255,.5)", margin: 0 }}>EDITANDO RELATÓRIO #{relatorioId}</p>
                  <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: "4px 0 0", letterSpacing: ".1em" }}>{nomeCelula.toUpperCase()}</h1>
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

          {/* Toggle realizada / não realizada */}
          <ToggleRealizacao realizada={relatorioRealizada} onChange={setRelatorioRealizada} isDark={isDark} />

          {relatorioRealizada ? (
              <>
                {/* Formulário */}
                <div className="ieq-card" style={{ padding: "26px 28px", marginBottom: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label className="ieq-label"><Calendar size={11} style={{ display: "inline", marginRight: 6 }} />DATA DA REUNIÃO</label>
                      <input className="ieq-input" type="date" style={{ colorScheme: isDark ? "dark" : "light" }}
                             value={form.dataReuniao} onChange={e => setForm({ ...form, dataReuniao: e.target.value })} />
                    </div>
                    <div>
                      <SeletorReferenciaBiblica value={form.estudo} onChange={val => setForm({ ...form, estudo: val })} isDark={isDark} />
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "MEMBROS",    val: membrosPresentes,    color: IEQ.red  },
                    { label: "VISITANTES", val: visitantesPresentes, color: IEQ.blue },
                    { label: "TOTAL",      val: total, color: IEQ.yellow, highlight: true },
                  ].map(({ label, val, color, highlight }) => (
                      <div key={label} className="ieq-kpi" style={highlight ? { background: `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, border: "none" } : {}}>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: highlight ? "rgba(255,255,255,.6)" : ts, margin: "0 0 6px" }}>{label}</p>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 38, fontWeight: 700, color: highlight ? "#fff" : color, margin: 0, lineHeight: 1 }}>{val}</p>
                      </div>
                  ))}
                </div>

                {/* Chamada */}
                <ListaChamada pessoas={pessoas} form={form} setForm={setForm} processingIds={processingIds} setProcessingIds={setProcessingIds} decisoesVisitantes={decisoesVisitantes} isDark={isDark} tp={tp} ts={ts} />
              </>
          ) : (
              /* Painel de motivo */
              <div className="ieq-card" style={{ padding: "26px 28px", marginBottom: 16 }}>
                <div style={{ marginBottom: 20 }}>
                  <label className="ieq-label"><Calendar size={11} style={{ display: "inline", marginRight: 6 }} />DATA DA REUNIÃO</label>
                  <input className="ieq-input" type="date" style={{ colorScheme: isDark ? "dark" : "light" }}
                         value={form.dataReuniao} onChange={e => setForm({ ...form, dataReuniao: e.target.value })} />
                </div>
                <SeletorMotivo value={motivoNaoRealizacao} onChange={setMotivoNaoRealizacao} isDark={isDark} />
              </div>
          )}
        </div>

        {/* Botão fixo */}
        <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", padding: "16px 24px", zIndex: 50, background: isDark ? "linear-gradient(to top,rgba(10,6,8,1) 60%,transparent)" : "linear-gradient(to top,rgba(240,234,232,1) 60%,transparent)" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <button
                onClick={handleSalvar} disabled={salvando || !podeSalvar}
                style={{
                  width: "100%", padding: "17px 0", borderRadius: 10, border: "none",
                  background: (salvando || !podeSalvar) ? "rgba(200,16,46,.3)" : (relatorioRealizada ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})` : `linear-gradient(135deg,${IEQ.yellowDark},${IEQ.yellow})`),
                  color: (relatorioRealizada || salvando || !podeSalvar) ? "#fff" : IEQ.dark,
                  cursor: (salvando || !podeSalvar) ? "not-allowed" : "pointer",
                  fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".22em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .25s",
                }}
            >
              {salvando
                  ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> SALVANDO...</>
                  : relatorioRealizada
                      ? <><ClipboardCheck size={17} /> SALVAR ALTERAÇÕES ({total} PRESENTES)</>
                      : <><Ban size={17} /> SALVAR — CÉLULA NÃO REALIZADA</>
              }
            </button>
          </div>
        </div>
      </div>
  );
}

/* =============================================================
   TOGGLE — Realizada / Não Realizada (componente reutilizável)
============================================================= */
function ToggleRealizacao({ realizada, onChange, isDark }) {
  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  return (
      <div className="ieq-card" style={{ padding: "6px", marginBottom: 16, display: "flex", gap: 6 }}>
        {[
          { val: true,  label: "CÉLULA REALIZADA",     icon: <CheckCircle2 size={13} /> },
          { val: false, label: "CÉLULA NÃO REALIZADA", icon: <Ban size={13} /> },
        ].map(({ val, label, icon }) => {
          const ativo = realizada === val;
          return (
              <button key={String(val)} onClick={() => onChange(val)} style={{
                flex: 1, padding: "12px 8px", borderRadius: 8, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".14em",
                transition: "all .25s",
                background: ativo
                    ? (val ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})` : `linear-gradient(135deg,${IEQ.yellowDark},${IEQ.yellow})`)
                    : "transparent",
                color: ativo ? (val ? "#fff" : IEQ.dark) : ts,
              }}>
                {icon} {label}
              </button>
          );
        })}
      </div>
  );
}

/* =============================================================
   LISTA DE CHAMADA (componente extraído para reutilizar)
============================================================= */
function ListaChamada({ pessoas, form, setForm, processingIds, setProcessingIds, decisoesVisitantes, isDark, tp, ts }) {
  const alternarPresenca = (uKey) => {
    const isMarcado = form.selecionadosKeys.includes(uKey);
    setProcessingIds(prev => new Set(prev).add(uKey));
    setForm(prev => ({
      ...prev,
      selecionadosKeys: isMarcado ? prev.selecionadosKeys.filter(k => k !== uKey) : [...prev.selecionadosKeys, uKey],
    }));
    setTimeout(() => setProcessingIds(prev => { const n = new Set(prev); n.delete(uKey); return n; }), 200);
  };

  return (
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
            const decisao     = isVisitante ? (decisoesVisitantes[pessoa.id] ?? null) : null;
            const temDecisao  = decisao && decisao !== "NENHUMA";

            return (
                <div key={pessoa.uKey} className="ieq-person-row" style={{ background: marcado ? (isDark ? "rgba(200,16,46,.07)" : "rgba(200,16,46,.05)") : "transparent" }}>
                  <button
                      onClick={() => alternarPresenca(pessoa.uKey)} disabled={processing}
                      style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", transition: "all .2s" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                        background: marcado ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})` : (isDark ? "rgba(255,255,255,.06)" : "rgba(200,16,46,.08)"),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: marcado ? "#fff" : (isDark ? IEQ.offWhite : "#1A0A0D"),
                        fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16, transition: "all .3s",
                      }}>
                        {processing ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : pessoa.nome.charAt(0)}
                      </div>
                      <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, fontWeight: marcado ? 600 : 400, color: marcado ? tp : ts, margin: 0 }}>{pessoa.nome}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 3 }}>
                          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".15em", color: isVisitante ? IEQ.yellow : IEQ.red }}>{pessoa.tipo}</span>
                          {isVisitante && temDecisao && <BadgeDecisao decisao={decisao} />}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${marcado ? IEQ.red : (isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)")}`,
                      background: marcado ? IEQ.red : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s",
                    }}>
                      {marcado && <CheckCircle2 size={14} style={{ color: "#fff" }} />}
                    </div>
                  </button>

                  {marcado && isVisitante && (
                      <div style={{ padding: "0 24px 16px 82px" }}>
                        <div className="ieq-card" style={{ padding: "12px 16px" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".14em", color: ts, marginBottom: 8 }}>
                            <Lock size={10} /> DECISÃO ESPIRITUAL
                          </label>
                          <DecisaoReadOnly decisao={decisao} isDark={isDark} ts={ts} tp={tp} />
                          {temDecisao && (
                              <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 12, color: ts, margin: "8px 0 0" }}>
                                Para alterar a decisão, acesse o cadastro do visitante.
                              </p>
                          )}
                        </div>
                      </div>
                  )}
                </div>
            );
          })}
        </div>
      </div>
  );
}

/* =============================================================
   TELA PRINCIPAL — NOVO RELATÓRIO + HISTÓRICO
============================================================= */
export default function TelaRelatorio({ isDark = false }) {
  const [modo, setModo] = useState("novo");
  const [relatorioEditId, setRelatorioEditId] = useState(null);
  const [modalDuplicado, setModalDuplicado] = useState(null);
  const [celula, setCelula] = useState(null);
  const [pessoas, setPessoas] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [rascunhoCarregado, setRascunhoCarregado] = useState(false);
  const [toastSucesso, setToastSucesso] = useState(null);
  const [toastNaoRealizada, setToastNaoRealizada] = useState(null);
  const [decisoesVisitantes, setDecisoesVisitantes] = useState({});

  // ── Estado do toggle ──────────────────────────────────────────────────────
  const [celulaRealizada, setCelulaRealizada] = useState(true);
  const [motivoNaoRealizacao, setMotivoNaoRealizacao] = useState(null);

  const prontoParaSalvar = useRef(false);

  const [form, setForm] = useState({
    celulaId: null,
    dataReuniao: (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })(),
    estudo: "", selecionadosKeys: [],
  });

  useEffect(() => {
    if (!prontoParaSalvar.current || !form.celulaId) return;
    try {
      localStorage.setItem(draftKey(form.celulaId), JSON.stringify({
        dataReuniao: form.dataReuniao, estudo: form.estudo,
        selecionadosKeys: form.selecionadosKeys, salvoEm: new Date().toISOString(),
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

      const membros    = (resMembros.data   || []).map(m => ({ id: m.id, nome: m.nome, tipo: "MEMBRO",    uKey: `MEMBRO-${m.id}`    }));
      const visitantes = (resVisitantes.data || []).map(v => ({ id: v.id, nome: v.nome, tipo: "VISITANTE", uKey: `VISITANTE-${v.id}` }));
      setPessoas([...membros, ...visitantes].sort((a, b) => a.nome.localeCompare(b.nome)));

      const decisoesMap = {};
      await Promise.all(
          (resVisitantes.data || []).map(async (v) => {
            try {
              const res = await api.get(`/visitantes/${v.id}`, { headers });
              decisoesMap[v.id] = res.data?.decisaoEspiritual ?? null;
            } catch { decisoesMap[v.id] = null; }
          })
      );
      setDecisoesVisitantes(decisoesMap);

      let restaurou = false;
      try {
        const raw = localStorage.getItem(draftKey(dadosCelula.id));
        if (raw) {
          const draft = JSON.parse(raw);
          const hoje = new Date();
          setForm({
            celulaId: dadosCelula.id,
            dataReuniao: draft.dataReuniao || `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`,
            estudo: draft.estudo || "",
            selecionadosKeys: draft.selecionadosKeys || [],
          });
          restaurou = true;
          setRascunhoCarregado(true);
          setTimeout(() => setRascunhoCarregado(false), 4000);
        }
      } catch (err) { console.warn("Erro ao ler rascunho:", err); }
      if (!restaurou) setForm(prev => ({ ...prev, celulaId: dadosCelula.id }));
      setTimeout(() => { prontoParaSalvar.current = true; }, 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const carregarHistorico = useCallback(async () => {
    try {
      setLoadingHist(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const res = await api.get("/relatorios/historico", { headers: { Authorization: `Bearer ${token}` } });
      setHistorico(res.data || []);
    } catch (err) { console.error("Erro ao carregar histórico:", err); }
    finally { setLoadingHist(false); }
  }, []);

  useEffect(() => { if (modo === "historico") carregarHistorico(); }, [modo, carregarHistorico]);

  const membrosPresentes    = form.selecionadosKeys.filter(k => k.startsWith("MEMBRO-")).length;
  const visitantesPresentes = form.selecionadosKeys.filter(k => k.startsWith("VISITANTE-")).length;
  const total = membrosPresentes + visitantesPresentes;

  // ── Submit principal ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // ── Célula NÃO realizada ──────────────────────────────────────────────
    if (!celulaRealizada) {
      if (!motivoNaoRealizacao) return alert("Selecione o motivo da não realização.");
      try {
        setEnviando(true);
        const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
        await api.post("/relatorios/nao-realizada", {
          celulaId: Number(form.celulaId),
          dataReuniao: form.dataReuniao,
          motivoNaoRealizacao,
        }, { headers: { Authorization: `Bearer ${token}` } });

        setToastNaoRealizada({ motivo: motivoNaoRealizacao });
        setMotivoNaoRealizacao(null);
        setCelulaRealizada(true);
      } catch (err) {
        alert(err.response?.data?.message || "Erro ao registrar ausência de célula.");
      } finally { setEnviando(false); }
      return;
    }

    // ── Célula realizada — verificação de duplicata ───────────────────────
    if (!form.estudo.trim()) return alert("Informe o tema ou referência bíblica do estudo.");

    try {
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const res = await api.get("/relatorios/historico", { headers: { Authorization: `Bearer ${token}` } });
      const existente = (res.data || []).find(r => normalizarData(r.dataReuniao) === normalizarData(form.dataReuniao));
      if (existente) {
        setModalDuplicado({ relatorioId: existente.id, dataReuniao: existente.dataReuniao, estudo: existente.estudo || "Sem tema" });
        return;
      }
    } catch (err) { console.warn("Não foi possível verificar duplicata:", err); }

    try {
      setEnviando(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const totalEnviado = total;

      await api.post("/relatorios", {
        celulaId: Number(form.celulaId),
        dataReuniao: form.dataReuniao,
        estudo: form.estudo.trim(),
        membrosPresentesIds: form.selecionadosKeys.filter(k => k.startsWith("MEMBRO-")).map(k => Number(k.replace("MEMBRO-", ""))),
        visitantesPresentes: form.selecionadosKeys.filter(k => k.startsWith("VISITANTE-")).map(k => {
          const id = Number(k.replace("VISITANTE-", ""));
          return { id, decisaoEspiritual: decisoesVisitantes[id] ?? "NENHUMA" };
        }),
      }, { headers: { Authorization: `Bearer ${token}` } });

      try {
        await api.put(`/metas/celula/${form.celulaId}/recalcular`, {}, { headers: { Authorization: `Bearer ${token}` } });
        dispararAtualizacaoMetas(form.celulaId);
      } catch (err) { console.warn("Não foi possível recalcular metas:", err); }

      try { localStorage.removeItem(draftKey(form.celulaId)); } catch (_) {}
      prontoParaSalvar.current = false;
      setForm(f => ({ ...f, estudo: "", selecionadosKeys: [] }));
      setTimeout(() => { prontoParaSalvar.current = true; }, 0);
      setToastSucesso({ total: totalEnviado });
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao enviar relatório.");
    } finally { setEnviando(false); }
  };

  const nomeCelula       = celula?.nome || "Carregando...";
  const nomeUsuarioLider = celula?.nomeLider || celula?.lider?.nome || celula?.usuario?.nome || "Líder";
  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  // ── Botão principal habilitado? ───────────────────────────────────────────
  const podoEnviar = celulaRealizada ? form.estudo.trim() : motivoNaoRealizacao;

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing:border-box; }
    @keyframes stripe  { 0%{background-position:0 0} 100%{background-position:60px 60px} }
    @keyframes pulse   { 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.12);opacity:.12} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes fadeIn  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes modalIn { from{opacity:0;transform:scale(.94) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes ieqOverlayIn  { from{opacity:0} to{opacity:1} }
    @keyframes ieqOverlayOut { from{opacity:1} to{opacity:0} }
    @keyframes ieqToastIn    { from{opacity:0;transform:scale(.88) translateY(28px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes ieqToastOut   { from{opacity:1;transform:scale(1) translateY(0)} to{opacity:0;transform:scale(.92) translateY(-18px)} }
    .ieq-bg-stripe { position:fixed;inset:0;pointer-events:none;z-index:0;background:repeating-linear-gradient(-55deg,${isDark?"rgba(200,16,46,.04)":"rgba(200,16,46,.05)"} 0 10px,transparent 10px 20px,${isDark?"rgba(253,184,19,.03)":"rgba(253,184,19,.04)"} 20px 30px,transparent 30px 40px);background-size:60px 60px;animation:stripe 8s linear infinite; }
    .ieq-card { background:${isDark?"rgba(17,10,13,.97)":"rgba(255,255,255,.92)"};border:1px solid ${isDark?"rgba(200,16,46,.15)":"rgba(200,16,46,.12)"};border-radius:14px;backdrop-filter:blur(24px); }
    .ieq-input { width:100%;background:${isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)"};border:1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)"};color:${tp};padding:12px 16px;border-radius:8px;outline:none;font-family:'EB Garamond',serif;font-size:15px;transition:all .25s; }
    .ieq-input:focus { border-color:${IEQ.red};box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-input::placeholder { color:${ts}; }
    .ieq-label { display:block;margin-bottom:6px;font-family:'Cinzel',serif;font-size:9.5px;letter-spacing:.18em;color:${IEQ.red}; }
    .ieq-person-row { border-bottom:1px solid ${isDark?"rgba(200,16,46,.08)":"rgba(200,16,46,.07)"};transition:background .2s; }
    .ieq-person-row:last-child { border-bottom:none; }
    .ieq-kpi { background:${isDark?"rgba(17,10,13,.97)":"rgba(255,255,255,.92)"};border:1px solid ${isDark?"rgba(200,16,46,.15)":"rgba(200,16,46,.12)"};border-radius:12px;padding:20px;text-align:center; }
    .ieq-toast { animation:fadeIn .35s ease;background:linear-gradient(135deg,${IEQ.blue},${IEQ.blueDark});border-radius:10px;padding:12px 18px;display:flex;align-items:center;gap:10px;font-family:'Cinzel',serif;font-size:9.5px;letter-spacing:.16em;color:#fff;box-shadow:0 4px 20px rgba(0,61,165,.35); }
    .pulse-ring { position:absolute;border-radius:50%;border:1px solid rgba(200,16,46,.35);animation:pulse 3s ease-in-out infinite; }
    .ieq-tab { flex:1;padding:12px;border:none;cursor:pointer;font-family:'Cinzel',serif;font-size:9px;letter-spacing:.16em;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:7px; }
    .ieq-hist-card { border-bottom:1px solid ${isDark?"rgba(200,16,46,.08)":"rgba(200,16,46,.07)"};padding:18px 20px;display:flex;align-items:center;justify-content:space-between;transition:background .2s; }
    .ieq-hist-card:last-child { border-bottom:none; }
    .ieq-edit-btn { display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:7px;border:none;cursor:pointer;font-family:'Cinzel',serif;font-size:8.5px;letter-spacing:.14em;background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red});color:#fff;transition:opacity .2s; }
    .ieq-edit-btn:hover { opacity:.85; }
    .ieq-modal-overlay { position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.6);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:0 20px; }
    .ieq-modal-box { background:${isDark?"#110A0D":"#fff"};border:1px solid rgba(253,184,19,.35);border-radius:16px;padding:28px 28px 24px;max-width:420px;width:100%;animation:modalIn .3s cubic-bezier(.34,1.56,.64,1);box-shadow:0 20px 60px rgba(0,0,0,.4); }
    .ieq-modal-cancel { flex:1;padding:13px 0;border-radius:9px;border:1px solid ${isDark?"rgba(200,16,46,.25)":"rgba(200,16,46,.2)"};background:transparent;color:${tp};cursor:pointer;font-family:'Cinzel',serif;font-size:9px;letter-spacing:.16em;transition:background .2s; }
    .ieq-modal-confirm { flex:1;padding:13px 0;border-radius:9px;border:none;background:linear-gradient(135deg,${IEQ.yellowDark},${IEQ.yellow});color:${IEQ.dark};cursor:pointer;font-family:'Cinzel',serif;font-size:9px;font-weight:700;letter-spacing:.16em;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s; }
  `;

  if (modo === "editar" && relatorioEditId) {
    return (
        <>
          <style>{globalStyles}</style>
          <div className="ieq-bg-stripe" />
          <TelaEditarRelatorio
              relatorioId={relatorioEditId} isDark={isDark}
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

        {toastSucesso    && <ToastSucesso     total={toastSucesso.total}       onClose={() => setToastSucesso(null)} />}
        {toastNaoRealizada && <ToastNaoRealizada motivo={toastNaoRealizada.motivo} onClose={() => setToastNaoRealizada(null)} />}

        {/* Modal duplicado */}
        {modalDuplicado && (
            <div className="ieq-modal-overlay" onClick={() => setModalDuplicado(null)}>
              <div className="ieq-modal-box" onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, background: "rgba(253,184,19,.15)", border: "1px solid rgba(253,184,19,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertTriangle size={22} style={{ color: IEQ.yellow }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: ".2em", fontWeight: 700, color: tp, margin: 0 }}>RELATÓRIO JÁ ENVIADO</p>
                    <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: ts, margin: "3px 0 0" }}>
                      {new Date(normalizarData(modalDuplicado.dataReuniao) + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, color: ts, lineHeight: 1.65, margin: "0 0 16px" }}>
                  Já existe um relatório para esta data. Deseja <strong style={{ color: tp }}>editar o relatório existente</strong>?
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="ieq-modal-cancel" onClick={() => setModalDuplicado(null)}>CANCELAR</button>
                  <button className="ieq-modal-confirm" onClick={() => { const id = modalDuplicado.relatorioId; setModalDuplicado(null); setRelatorioEditId(id); setModo("editar"); }}>
                    <Edit3 size={14} /> EDITAR EXISTENTE
                  </button>
                </div>
              </div>
            </div>
        )}

        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "0 16px" }}>
          {/* Abas */}
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", margin: "16px 0", border: `1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"}` }}>
            {[
              { key: "novo",      label: "NOVO RELATÓRIO", icon: <ClipboardCheck size={13} /> },
              { key: "historico", label: "HISTÓRICO",       icon: <History size={13} /> },
            ].map(tab => (
                <button key={tab.key} className="ieq-tab" onClick={() => setModo(tab.key)} style={{ background: modo === tab.key ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})` : (isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"), color: modo === tab.key ? "#fff" : ts }}>
                  {tab.icon} {tab.label}
                </button>
            ))}
          </div>

          {/* ── ABA HISTÓRICO ─────────────────────────────────────────────────── */}
          {modo === "historico" && (
              <div className="ieq-card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <History size={18} style={{ color: IEQ.red }} />
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".16em", color: tp }}>SEUS RELATÓRIOS</span>
                </div>
                {loadingHist ? (
                    <div style={{ padding: 40, textAlign: "center" }}><Loader2 size={28} style={{ color: IEQ.red, animation: "spin 1s linear infinite" }} /></div>
                ) : historico.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center" }}><p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".16em", color: ts }}>NENHUM RELATÓRIO ENCONTRADO</p></div>
                ) : (
                    historico.map(rel => {
                      const naoRealizada = rel.realizada === false;
                      return (
                          <div key={rel.id} className="ieq-hist-card" style={{ background: naoRealizada ? (isDark ? "rgba(253,184,19,.04)" : "rgba(253,184,19,.05)") : "transparent" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".14em", color: tp, margin: "0 0 4px" }}>
                                {rel.dataReuniao ? new Date(normalizarData(rel.dataReuniao) + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "?"}
                              </p>
                              {naoRealizada ? (
                                  <div style={{ marginBottom: 6 }}>
                                    <BadgeNaoRealizada motivo={rel.motivoNaoRealizacao} />
                                  </div>
                              ) : (
                                  <>
                                    <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: ts, margin: "0 0 6px" }}>{rel.estudo || "Sem referência"}</p>
                                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".12em", color: IEQ.red }}>{rel.totalPresentes || 0} PRESENTES</span>
                                  </>
                              )}
                            </div>
                            <button className="ieq-edit-btn" onClick={() => { setRelatorioEditId(rel.id); setModo("editar"); }}>
                              <Edit3 size={12} /> EDITAR
                            </button>
                          </div>
                      );
                    })
                )}
              </div>
          )}

          {/* ── ABA NOVO RELATÓRIO ────────────────────────────────────────────── */}
          {modo === "novo" && (
              <>
                {rascunhoCarregado && (
                    <div style={{ marginBottom: 12 }}>
                      <div className="ieq-toast"><CheckCircle2 size={15} /> RASCUNHO RESTAURADO — suas marcações anteriores foram recuperadas</div>
                    </div>
                )}

                {/* Cabeçalho azul */}
                <div style={{ padding: "40px 40px 36px", marginBottom: 24, background: isDark ? "linear-gradient(135deg,#1A0A0D,#0A0608)" : `linear-gradient(135deg,${IEQ.blue},${IEQ.blueDark})`, borderRadius: 14, position: "relative", overflow: "hidden" }}>
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
                        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, color: "#fff", margin: "4px 0 0", letterSpacing: ".1em" }}>{nomeCelula.toUpperCase()}</h1>
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

                {/* ── TOGGLE REALIZADA / NÃO REALIZADA ── */}
                <ToggleRealizacao realizada={celulaRealizada} onChange={setCelulaRealizada} isDark={isDark} />

                {celulaRealizada ? (
                    <>
                      {/* Formulário */}
                      <div className="ieq-card" style={{ padding: "26px 28px", marginBottom: 16 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <div>
                            <label className="ieq-label"><Calendar size={11} style={{ display: "inline", marginRight: 6 }} />DATA DA REUNIÃO</label>
                            <input className="ieq-input" type="date" style={{ colorScheme: isDark ? "dark" : "light" }}
                                   value={form.dataReuniao} onChange={e => setForm({ ...form, dataReuniao: e.target.value })} />
                          </div>
                          <div>
                            <SeletorReferenciaBiblica value={form.estudo} onChange={val => setForm({ ...form, estudo: val })} isDark={isDark} />
                          </div>
                        </div>
                      </div>

                      {/* KPIs */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                        {[
                          { label: "MEMBROS",    val: membrosPresentes,    color: IEQ.red  },
                          { label: "VISITANTES", val: visitantesPresentes, color: IEQ.blue },
                          { label: "TOTAL",      val: total, color: IEQ.yellow, highlight: true },
                        ].map(({ label, val, color, highlight }) => (
                            <div key={label} className="ieq-kpi" style={highlight ? { background: `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, border: "none" } : {}}>
                              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: highlight ? "rgba(255,255,255,.6)" : ts, margin: "0 0 6px" }}>{label}</p>
                              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 38, fontWeight: 700, color: highlight ? "#fff" : color, margin: 0, lineHeight: 1 }}>{val}</p>
                            </div>
                        ))}
                      </div>

                      {/* Chamada */}
                      <ListaChamada
                          pessoas={pessoas} form={form} setForm={setForm}
                          processingIds={processingIds} setProcessingIds={setProcessingIds}
                          decisoesVisitantes={decisoesVisitantes} isDark={isDark} tp={tp} ts={ts}
                      />
                    </>
                ) : (
                    /* ── PAINEL DE MOTIVO ── */
                    <div className="ieq-card" style={{ padding: "26px 28px", marginBottom: 16 }}>
                      <div style={{ marginBottom: 20 }}>
                        <label className="ieq-label"><Calendar size={11} style={{ display: "inline", marginRight: 6 }} />DATA DA REUNIÃO</label>
                        <input className="ieq-input" type="date" style={{ colorScheme: isDark ? "dark" : "light" }}
                               value={form.dataReuniao} onChange={e => setForm({ ...form, dataReuniao: e.target.value })} />
                      </div>
                      <SeletorMotivo value={motivoNaoRealizacao} onChange={setMotivoNaoRealizacao} isDark={isDark} />
                    </div>
                )}
              </>
          )}
        </div>

        {/* Botão fixo */}
        {modo === "novo" && (
            <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", padding: "16px 24px", zIndex: 50, background: isDark ? "linear-gradient(to top,rgba(10,6,8,1) 60%,transparent)" : "linear-gradient(to top,rgba(240,234,232,1) 60%,transparent)" }}>
              <div style={{ maxWidth: 720, margin: "0 auto" }}>
                <button
                    onClick={handleSubmit} disabled={enviando || !podoEnviar}
                    style={{
                      width: "100%", padding: "17px 0", borderRadius: 10, border: "none",
                      background: (enviando || !podoEnviar)
                          ? "rgba(200,16,46,.3)"
                          : celulaRealizada
                              ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`
                              : `linear-gradient(135deg,${IEQ.yellowDark},${IEQ.yellow})`,
                      color: (!celulaRealizada && !enviando && podoEnviar) ? IEQ.dark : "#fff",
                      cursor: (enviando || !podoEnviar) ? "not-allowed" : "pointer",
                      fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".22em",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .25s",
                    }}
                >
                  {enviando
                      ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> ENVIANDO...</>
                      : celulaRealizada
                          ? <><ClipboardCheck size={17} /> FINALIZAR RELATÓRIO ({total})</>
                          : <><Ban size={17} /> REGISTRAR AUSÊNCIA DE CÉLULA</>
                  }
                </button>
              </div>
            </div>
        )}
      </div>
  );
}
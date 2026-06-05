import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import api from "../../services/api.js";
import {
  Loader2, CheckCircle2, Calendar, UserCheck, Save,
  History, Edit3, AlertTriangle, ChevronLeft, Eye, BookOpen, Users2,
} from "lucide-react";

const IEQ = {
  red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
  yellow: "#FDB813", yellowDark: "#C48C00",
  blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
  white: "#FFFFFF", offWhite: "#F5F0E8",
  dark: "#0A0608", darkCard: "#110A0D",
};

const COLUNAS = [
  { campo: "escolaBiblica", label: "EBQ",        emoji: "📖" },
  { campo: "quartaNoite",   label: "4ª Noite",   emoji: "🕐" },
  { campo: "quintaNoite",   label: "5ª Noite",   emoji: "🕐" },
  { campo: "domingoManha",  label: "Dom. Manhã", emoji: "🌅" },
  { campo: "domingoNoite",  label: "Dom. Noite", emoji: "🕐" },
];

const HISTORICO_LIMITE = 3;

const draftKey = (celulaId, inicio) => `ieq_discipulado_draft_${celulaId}_${inicio}`;

function lsDraftSave(key, presencas, fim) {
  try { localStorage.setItem(key, JSON.stringify({ presencas, fim, salvoEm: new Date().toISOString() })); } catch (_) {}
}
function lsDraftLoad(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function lsDraftRemove(key) {
  try { localStorage.removeItem(key); } catch (_) {}
}

function obterSemanaAtual() {
  const hoje = new Date();
  const dom = new Date(hoje); dom.setDate(hoje.getDate() - hoje.getDay());
  const sab = new Date(dom);  sab.setDate(dom.getDate() + 6);
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  return { inicio: fmt(dom), fim: fmt(sab) };
}

function QuadrangularCross({ size = 32 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={IEQ.redLight}/><stop offset="100%" stopColor={IEQ.redDark}/>
          </linearGradient>
          <linearGradient id="gH" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={IEQ.blueDark}/><stop offset="50%" stopColor={IEQ.blueLight}/><stop offset="100%" stopColor={IEQ.blueDark}/>
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gV)" filter="url(#glow)"/>
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gH)" filter="url(#glow)"/>
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glow)"/>
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55"/>
      </svg>
  );
}

/* ??????????????????????????????????????????
   COMPONENTE: Toast de Sucesso Animado (Discipulado)
?????????????????????????????????????????? */
function ToastSucessoDiscipulado({ totalPresencas, porcentagem, nomeCelula, modoEdicao, onClose }) {
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSaindo(true);
      setTimeout(() => { if (onClose) onClose(); }, 450);
    }, 4800);
    return () => clearTimeout(t);
  }, [onClose]);

  const confettiCores = [
    IEQ.yellow, IEQ.red, IEQ.blue, IEQ.yellow,
    IEQ.redLight, IEQ.blueLight, IEQ.yellow, IEQ.red,
  ];

  const corPrincipal1 = modoEdicao ? IEQ.blueDark : "#0d6e3a";
  const corPrincipal2 = modoEdicao ? IEQ.blue     : "#0a5530";
  const corPrincipal3 = modoEdicao ? "#002470"    : "#073d22";

  return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 20px",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        animation: saindo ? "ieqOverlayOut .45s ease forwards" : "ieqOverlayIn .3s ease forwards",
      }}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
          animation: saindo
              ? "ieqToastOut .45s cubic-bezier(.4,0,.6,1) forwards"
              : "ieqToastIn .55s cubic-bezier(.34,1.56,.64,1) forwards",
        }}>
          {/* Confetes */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, height: 32, alignItems: "flex-end" }}>
            {confettiCores.map((cor, i) => (
                <div key={i} style={{
                  width: i % 3 === 0 ? 12 : 8,
                  height: i % 3 === 0 ? 12 : 8,
                  borderRadius: i % 2 === 0 ? "50%" : 2,
                  background: cor,
                  opacity: 0,
                  animation: `ieqConfetti 1.4s ease ${0.04 + i * 0.06}s forwards`,
                }} />
            ))}
          </div>

          {/* Card principal */}
          <div style={{
            background: `linear-gradient(160deg, ${corPrincipal1} 0%, ${corPrincipal2} 60%, ${corPrincipal3} 100%)`,
            borderRadius: 22,
            padding: "32px 40px 28px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
            minWidth: 300, maxWidth: 390, width: "100%",
            boxShadow: modoEdicao
                ? "0 16px 60px rgba(0,61,165,.5), 0 0 0 1px rgba(255,255,255,.08)"
                : "0 16px 60px rgba(13,110,58,.5), 0 0 0 1px rgba(255,255,255,.08)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Brilhos internos decorativos */}
            <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,.04)", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:-20, left:-20, width:100, height:100, borderRadius:"50%", background:"rgba(253,184,19,.06)", pointerEvents:"none" }}/>

            {/* Ícone com anéis pulsantes */}
            <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ position:"absolute", inset:-8, borderRadius:"50%", border:"2px solid rgba(255,255,255,.25)", animation:"ieqRingPulse 2s ease-out forwards" }}/>
              <div style={{ position:"absolute", inset:-16, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,.12)", animation:"ieqRingPulse 2s ease-out .3s forwards" }}/>
              <div style={{
                width:68, height:68, borderRadius:"50%",
                background:"rgba(255,255,255,.18)", border:"2px solid rgba(255,255,255,.35)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                {modoEdicao
                    ? <Edit3 size={30} style={{ color:"#fff" }}/>
                    : <CheckCircle2 size={32} style={{ color:"#fff" }}/>
                }
              </div>
            </div>

            {/* Cruz IEQ decorativa */}
            <div style={{ marginTop:-6, marginBottom:-6 }}>
              <QuadrangularCross size={22}/>
            </div>

            {/* Título */}
            <div style={{ textAlign:"center" }}>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:18, fontWeight:700, letterSpacing:".18em", color:"#fff", margin:"0 0 8px" }}>
                {modoEdicao ? "ATUALIZADO!" : "GLÓRIA A DEUS!"}
              </p>
              <p style={{ fontFamily:"'EB Garamond',serif", fontSize:18, color:"rgba(255,255,255,.82)", lineHeight:1.55, margin:0 }}>
                {modoEdicao
                    ? <>Relatório de discipulado<br /><em>atualizado com sucesso!</em></>
                    : <>Relatório de discipulado enviado.<br /><em>O Senhor viu cada presença!</em></>
                }
              </p>
            </div>

            {/* Divisor */}
            <div style={{ width:"100%", height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)" }}/>

            {/* Pills de informação */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
              <div style={{
                background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)",
                borderRadius:20, padding:"6px 14px",
                fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".14em",
                color:"rgba(255,255,255,.92)", display:"flex", alignItems:"center", gap:6,
              }}>
                <Users2 size={12}/> {totalPresencas} PRESENÇAS
              </div>
              <div style={{
                background: porcentagem >= 60 ? "rgba(253,184,19,.2)" : "rgba(200,16,46,.15)",
                border: `1px solid ${porcentagem >= 60 ? "rgba(253,184,19,.35)" : "rgba(200,16,46,.3)"}`,
                borderRadius:20, padding:"6px 14px",
                fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".14em",
                color: porcentagem >= 60 ? IEQ.yellow : "rgba(255,255,255,.85)",
                display:"flex", alignItems:"center", gap:6,
              }}>
                <CheckCircle2 size={12}/> {porcentagem}% FREQ.
              </div>
              {nomeCelula && (
                  <div style={{
                    background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)",
                    borderRadius:20, padding:"6px 14px",
                    fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".12em",
                    color:"rgba(255,255,255,.75)", display:"flex", alignItems:"center", gap:6,
                  }}>
                    <UserCheck size={12}/> {nomeCelula.toUpperCase()}
                  </div>
              )}
            </div>

            {/* Versículo */}
            <p style={{ fontFamily:"'EB Garamond',serif", fontStyle:"italic", fontSize:14, color:"rgba(255,255,255,.5)", textAlign:"center", margin:0, lineHeight:1.5 }}>
              "Ide, portanto, e fazei discípulos de todas as nações."
            </p>
            <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".18em", color:"rgba(255,255,255,.3)", margin:"-12px 0 0" }}>
              MATEUS 28:19
            </p>
          </div>
        </div>
      </div>
  );
}

// ?????????????????????????????????????????????????????????????????????????????
// ABA HISTÓRICO
// ?????????????????????????????????????????????????????????????????????????????
function AbaHistorico({ isDark, onVerDetalhe }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState("");

  useEffect(() => {
    api.get("/discipulado/historico")
        .then(r => setHistorico(Array.isArray(r.data) ? r.data : []))
        .catch(() => setErro("Erro ao carregar histórico."))
        .finally(() => setLoading(false));
  }, []);

  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  if (loading) return (
      <div style={{ display:"flex", justifyContent:"center", padding:"48px 0" }}>
        <Loader2 size={24} style={{ color: IEQ.red, animation:"spin 1s linear infinite" }}/>
      </div>
  );

  if (erro) return (
      <div style={{ padding:"20px", textAlign:"center", color: IEQ.red, fontFamily:"'Cinzel',serif", fontSize:11 }}>
        {erro.toUpperCase()}
      </div>
  );

  if (historico.length === 0) return (
      <div style={{ padding:"48px 0", textAlign:"center" }}>
        <History size={40} style={{ color: ts, marginBottom:12 }}/>
        <p style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".18em", color:ts }}>
          NENHUM RELATÓRIO ENVIADO AINDA
        </p>
      </div>
  );

  const slice = historico.slice(0, HISTORICO_LIMITE);

  return (
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ padding:"0 4px" }}>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".16em", color:ts }}>
            ÚLTIMAS {slice.length} SEMANA{slice.length !== 1 ? "S" : ""} REGISTRADA{slice.length !== 1 ? "S" : ""}
          </span>
        </div>

        {slice.map((item) => {
          const totalPossivel  = item.totalPossivel ?? (item.totalMembros ?? 0) * COLUNAS.length;
          const totalPresencas = item.totalPresencas ?? 0;
          const pct = totalPossivel > 0 ? Math.round((totalPresencas / totalPossivel) * 100) : 0;

          return (
              <div key={item.id} style={{
                background: isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)",
                border: `1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"}`,
                borderRadius:12, padding:"18px 22px",
                display:"flex", alignItems:"center", justifyContent:"space-between", gap:16,
                animation:"fadeIn .4s ease both",
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <Calendar size={13} style={{ color: IEQ.red }}/>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".14em", color:tp, fontWeight:700 }}>
                      {item.inicio} → {item.fim}
                    </span>
                  </div>
                  <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:ts }}>{item.totalMembros ?? "?"} MEMBROS</span>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:ts }}>{totalPresencas} PRESENÇAS</span>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, color: pct > 60 ? IEQ.yellow : IEQ.red }}>{pct}% FREQ.</span>
                  </div>
                  <div style={{ marginTop:10, height:3, borderRadius:99, background: isDark ? "rgba(255,255,255,.06)" : "rgba(200,16,46,.08)", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, borderRadius:99, background: pct > 60 ? IEQ.yellow : `linear-gradient(90deg,${IEQ.red},${IEQ.blue})`, transition:"width .4s ease" }}/>
                  </div>
                </div>
                <button
                    onClick={() => onVerDetalhe(item)}
                    style={{
                      background:"none", border:`1px solid ${isDark ? "rgba(200,16,46,.3)" : "rgba(200,16,46,.25)"}`,
                      borderRadius:8, padding:"8px 14px", cursor:"pointer",
                      display:"flex", alignItems:"center", gap:6,
                      fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".12em", color: IEQ.red,
                      transition:"all .2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(200,16,46,.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <Eye size={13}/> VER
                </button>
              </div>
          );
        })}
      </div>
  );
}

// ?????????????????????????????????????????????????????????????????????????????
// DETALHE HISTÓRICO
// ?????????????????????????????????????????????????????????????????????????????
function DetalheHistorico({ item, isDark, onVoltar, onEditar }) {
  const [detalhe, setDetalhe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/discipulado/relatorio-semanal/${item.id}`)
        .then(r => setDetalhe(r.data))
        .catch(() => setDetalhe(null))
        .finally(() => setLoading(false));
  }, [item.id]);

  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  if (loading) return (
      <div style={{ display:"flex", justifyContent:"center", padding:"48px 0" }}>
        <Loader2 size={24} style={{ color: IEQ.red, animation:"spin 1s linear infinite" }}/>
      </div>
  );

  const presencas = detalhe?.presencas ?? detalhe?.membros ?? [];

  return (
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div className="ieq-card" style={{ padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={onVoltar} style={{ background:"none", border:"none", cursor:"pointer", padding:6, color: IEQ.red, display:"flex", alignItems:"center" }}>
              <ChevronLeft size={20}/>
            </button>
            <div>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color: IEQ.red, margin:0 }}>RELATÓRIO</p>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, color:tp, margin:"4px 0 0" }}>
                {item.inicio} → {item.fim}
              </p>
            </div>
          </div>
          <button
              onClick={() => onEditar(item, detalhe)}
              style={{
                background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`,
                border:"none", borderRadius:8, padding:"10px 18px", cursor:"pointer",
                display:"flex", alignItems:"center", gap:8,
                fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".14em", color:"#fff",
              }}
          >
            <Edit3 size={13}/> EDITAR
          </button>
        </div>

        {presencas.length === 0 ? (
            <p style={{ textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:10, color:ts }}>SEM DADOS DE PRESENÇAS</p>
        ) : (
            <div className="ieq-card" style={{ overflow:"hidden" }}>
              <div style={{
                display:"grid", gridTemplateColumns:"1fr repeat(5,60px)",
                padding:"12px 22px", gap:8,
                borderBottom:`1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`,
                background: isDark ? "rgba(200,16,46,.04)" : "rgba(200,16,46,.03)",
              }}>
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".16em", color:ts }}>MEMBRO</span>
                {COLUNAS.map(({ label }) => (
                    <div key={label} style={{ textAlign:"center" }}>
                      <p style={{ fontFamily:"'Cinzel',serif", fontSize:7.5, letterSpacing:".1em", color:ts, margin:0 }}>{label.toUpperCase()}</p>
                    </div>
                ))}
              </div>
              {presencas.map((p, i) => {
                const nome  = p.nomeMembro ?? p.nome ?? "?";
                const total = COLUNAS.filter(c => p[c.campo]).length;
                return (
                    <div key={p.membroId ?? i} style={{
                      display:"grid", gridTemplateColumns:"1fr repeat(5,60px)",
                      padding:"14px 22px", gap:8, alignItems:"center",
                      borderBottom: i < presencas.length - 1
                          ? `1px solid ${isDark ? "rgba(200,16,46,.06)" : "rgba(200,16,46,.05)"}` : "none",
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{
                          width:34, height:34, borderRadius:6,
                          background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:13, color:"#fff",
                        }}>{nome.charAt(0)}</div>
                        <div>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:15, fontWeight:600, color:tp, margin:0 }}>{nome}</p>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, color:ts, margin:"2px 0 0" }}>{total}/{COLUNAS.length} PRESENÇAS</p>
                        </div>
                      </div>
                      {COLUNAS.map(({ campo, emoji }) => (
                          <div key={campo} style={{ display:"flex", justifyContent:"center" }}>
                            <span style={{ fontSize:18, filter: p[campo] ? "none" : "grayscale(1)", opacity: p[campo] ? 1 : 0.25 }}>
                              {p[campo] ? "✅" : emoji}
                            </span>
                          </div>
                      ))}
                    </div>
                );
              })}
            </div>
        )}
      </div>
  );
}

// ?????????????????????????????????????????????????????????????????????????????
// COMPONENTE PRINCIPAL
// ?????????????????????????????????????????????????????????????????????????????
export default function RelatorioDiscipulado({ isDark = false }) {
  const [aba, setAba] = useState("relatorio");
  const [detalheItem, setDetalheItem] = useState(null);
  const [celula, setCelula] = useState(null);
  const [membros, setMembros] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [rascunhoCarregado, setRascunhoCarregado] = useState(false);
  const [salvouAgora, setSalvouAgora] = useState(false);
  const [verificandoExistente, setVerificandoExistente] = useState(false);
  const [relatorioExistente, setRelatorioExistente] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  /* Estado do toast animado */
  const [toastSucesso, setToastSucesso] = useState(null);
  // null | { totalPresencas, porcentagem, nomeCelula, modoEdicao }

  const celulaIdRef = useRef(null);
  const inicioRef = useRef("");
  const fimRef = useRef("");
  const carregouRef = useRef(false);
  const saveTimer = useRef(null);

  const inicializarPresencas = useCallback((lista) =>
      lista.map(m => ({
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

  const verificarExistente = useCallback(async (ini, fi) => {
    if (!ini || !fi) return;
    setVerificandoExistente(true);
    setRelatorioExistente(null);
    setModoEdicao(false);
    try {
      const res = await api.get(`/discipulado/relatorio-semanal?inicio=${ini}&fim=${fi}`);
      const lista = Array.isArray(res.data) ? res.data : [];
      if (lista.length > 0) setRelatorioExistente(lista[0]);
    } catch {
    } finally {
      setVerificandoExistente(false);
    }
  }, []);

  const carregarDados = useCallback(async () => {
    carregouRef.current = false;
    setLoading(true);
    setErro("");
    try {
      const res = await api.get("/celulas/minha-celula");
      if (!res.data) {
        setErro("Célula não vinculada.");
        return;
      }
      const celData = res.data;
      setCelula(celData);
      celulaIdRef.current = celData.id;
      const lista = celData.membros || [];
      setMembros(lista);
      const semana = obterSemanaAtual();
      inicioRef.current = semana.inicio;
      fimRef.current = semana.fim;

      const draft = lsDraftLoad(draftKey(celData.id, semana.inicio));
      if (draft?.presencas) {
        const idsAtuais = new Set(lista.map(m => m.id));
        const idsRascunho = new Set(draft.presencas.map(p => p.membroId));
        const filtradas = draft.presencas.filter(p => idsAtuais.has(p.membroId));
        const novos = lista.filter(m => !idsRascunho.has(m.id)).map(m => ({
          membroId: m.id, nomeMembro: m.nome,
          escolaBiblica: false, quartaNoite: false,
          quintaNoite: false, domingoManha: false, domingoNoite: false,
        }));
        setPresencas([...filtradas, ...novos]);
        const fimSalvo = draft.fim || semana.fim;
        setFim(fimSalvo);
        fimRef.current = fimSalvo;
        setRascunhoCarregado(true);
        setTimeout(() => setRascunhoCarregado(false), 5000);
      } else {
        setPresencas(inicializarPresencas(lista));
        setFim(semana.fim);
      }
      setInicio(semana.inicio);
      await verificarExistente(semana.inicio, semana.fim);
    } catch {
      setErro("Erro ao carregar dados.");
    } finally {
      setLoading(false);
      carregouRef.current = true;
    }
  }, [inicializarPresencas, verificarExistente]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleInicioChange = useCallback(async (novoInicio) => {
    carregouRef.current = false;
    setInicio(novoInicio);
    inicioRef.current = novoInicio;
    const draft = lsDraftLoad(draftKey(celulaIdRef.current, novoInicio));
    if (draft?.presencas) {
      setPresencas(draft.presencas);
      const f = draft.fim || fimRef.current;
      setFim(f);
      fimRef.current = f;
      setRascunhoCarregado(true);
      setTimeout(() => setRascunhoCarregado(false), 5000);
    } else {
      setMembros(prev => {
        setPresencas(inicializarPresencas(prev));
        return prev;
      });
    }
    carregouRef.current = true;
    await verificarExistente(novoInicio, fimRef.current);
  }, [inicializarPresencas, verificarExistente]);

  const handleFimChange = useCallback((novoFim) => {
    setFim(novoFim);
    fimRef.current = novoFim;
    setPresencas(prev => {
      agendarSave(prev, novoFim);
      return prev;
    });
  }, [agendarSave]);

  const alterarPresenca = useCallback((index, campo) => {
    setPresencas(prev => {
      const novo = [...prev];
      if (!novo[index]) return prev;
      novo[index] = {...novo[index], [campo]: !novo[index][campo]};
      agendarSave(novo, fimRef.current);
      return novo;
    });
  }, [agendarSave]);

  const stats = useMemo(() => {
    const totalGeral = presencas.reduce((acc, p) => acc + COLUNAS.filter(c => p[c.campo]).length, 0);
    const totalPossivel = presencas.length * COLUNAS.length;
    const porcentagem = totalPossivel > 0 ? Math.round((totalGeral / totalPossivel) * 100) : 0;
    return {totalGeral, porcentagem};
  }, [presencas]);

  const entrarModoEdicao = useCallback(async (item, detalhePreCarregado) => {
    setErro("");
    setModoEdicao(true);
    setAba("relatorio");
    setDetalheItem(null);
    if (item.inicio) {
      setInicio(item.inicio);
      inicioRef.current = item.inicio;
    }
    if (item.fim) {
      setFim(item.fim);
      fimRef.current = item.fim;
    }
    setRelatorioExistente(item);
    try {
      const detalhe = detalhePreCarregado
          || (await api.get(`/discipulado/relatorio-semanal/${item.id}`)).data;
      const pArr = detalhe?.presencas ?? detalhe?.membros ?? [];
      const merged = membros.map(m => {
        const found = pArr.find(p => (p.membroId ?? p.id) === m.id);
        return found
            ? {...found, membroId: m.id, nomeMembro: m.nome}
            : {
              membroId: m.id, nomeMembro: m.nome,
              escolaBiblica: false, quartaNoite: false,
              quintaNoite: false, domingoManha: false, domingoNoite: false
            };
      });
      setPresencas(merged);
      carregouRef.current = true;
    } catch {
      setErro("Erro ao carregar dados para edição.");
    }
  }, [membros]);

  // ✅ FUNÇÃO CORRIGIDA: enviarRelatorio com celulaId obrigatório
  const enviarRelatorio = async () => {
    setErro("");
    if (!inicio || !fim || !celula?.id || presencas.length === 0) return setErro("Verifique os dados.");
    setEnviando(true);

    /* Captura stats antes de limpar */
    const totalEnviado = stats.totalGeral;
    const pctEnviado = stats.porcentagem;
    const nomeCell = celula?.nome || "";
    const eraEdicao = modoEdicao;

    try {
      // ✅ CORRIGIDO: Adiciona celulaId obrigatório ao payload
      const payload = presencas.map(({nomeMembro, membroId, ...rest}) => ({
        membroId: Number(membroId),
        celulaId: celula?.id,
        ...rest
      }));

      if (modoEdicao && relatorioExistente?.id) {
        await api.put(`/discipulado/relatorio-semanal/${relatorioExistente.id}?inicio=${inicio}&fim=${fim}`, payload);
      } else {
        await api.post(`/discipulado/relatorio-semanal?inicio=${inicio}&fim=${fim}`, payload);
      }
      lsDraftRemove(draftKey(celula.id, inicio));
      setModoEdicao(false);
      carregouRef.current = false;
      setMembros(prev => {
        setPresencas(inicializarPresencas(prev));
        return prev;
      });
      carregouRef.current = true;
      await verificarExistente(inicio, fim);

      /* Exibe o toast animado */
      setToastSucesso({
        totalPresencas: totalEnviado,
        porcentagem: pctEnviado,
        nomeCelula: nomeCell,
        modoEdicao: eraEdicao
      });
    } catch (e) {
      const mensagemErro = e?.response?.data?.message || "Erro no envio.";
      console.error("❌ Erro ao enviar relatório:", {
        status: e?.response?.status,
        data: e?.response?.data,
        message: e?.message,
      });
      setErro(mensagemErro);
    } finally {
      setEnviando(false);
    }
  };

  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing:border-box; }
    @keyframes stripe   { 0%{background-position:0 0} 100%{background-position:60px 60px} }
    @keyframes pulse    { 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.12);opacity:.12} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes fadeIn   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideDown{ from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:.35} }
    /* 🎉 Toast de sucesso 🎉 */
    @keyframes ieqOverlayIn  { from{opacity:0} to{opacity:1} }
    @keyframes ieqOverlayOut { from{opacity:1} to{opacity:0} }
    @keyframes ieqToastIn    { from{opacity:0;transform:scale(.88) translateY(28px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes ieqToastOut   { from{opacity:1;transform:scale(1) translateY(0)} to{opacity:0;transform:scale(.92) translateY(-18px)} }
    @keyframes ieqRingPulse  { 0%{opacity:0;transform:scale(.85)} 40%{opacity:.7} 100%{opacity:0;transform:scale(1.55)} }
    @keyframes ieqConfetti   { 0%{opacity:0;transform:translateY(-20px) rotate(0deg) scale(.5)} 35%{opacity:1;transform:translateY(4px) rotate(120deg) scale(1)} 100%{opacity:.15;transform:translateY(22px) rotate(260deg) scale(.8)} }
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
    .ieq-tab { display:flex; align-items:center; gap:8px; padding:10px 20px; border:none; cursor:pointer; border-radius:8px; font-family:'Cinzel',serif; font-size:10px; letter-spacing:.16em; font-weight:700; transition:all .2s; }
    .ieq-tab-active   { background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red}); color:#fff; box-shadow:0 4px 14px rgba(200,16,46,.3); }
    .ieq-tab-inactive { background:${isDark ? "rgba(255,255,255,.04)" : "rgba(200,16,46,.05)"}; color:${ts}; border:1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.1)"}; }
    .ieq-tab-inactive:hover { background:rgba(200,16,46,.08); }
    .ieq-input-date { background:transparent; border:none; outline:none; font-family:'Cinzel',serif; font-size:10px; letter-spacing:.12em; color:${tp}; cursor:pointer; font-weight:700; }
    .ieq-member-block { padding:22px 24px; border-bottom:1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.07)"}; animation:fadeIn .4s ease both; }
    .ieq-member-block:last-child { border-bottom:none; }
    .ieq-presence-btn { display:flex; flex-direction:column; align-items:center; gap:6px; padding:12px 8px; border-radius:10px; border:1px solid; cursor:pointer; transition:all .2s; background:none; }
    .ieq-avatar { width:42px; height:42px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-weight:700; font-size:16px; color:#fff; }
    .ieq-btn-submit { width:100%; padding:16px 0; border:none; border-radius:10px; cursor:pointer; font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.2em; display:flex; align-items:center; justify-content:center; gap:10px; color:#fff; transition:all .25s; }
    .ieq-btn-submit:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.1); }
    .ieq-btn-submit:disabled { opacity:.4; cursor:not-allowed; box-shadow:none; }
    .ieq-alert { padding:14px 20px; border-radius:8px; text-align:center; font-family:'Cinzel',serif; font-size:10px; letter-spacing:.14em; font-weight:700; animation:slideDown .3s ease; }
    .ieq-toast { animation:slideDown .35s ease; border-radius:10px; padding:12px 18px; display:flex; align-items:center; gap:10px; font-family:'Cinzel',serif; font-size:9.5px; letter-spacing:.16em; box-shadow:0 4px 20px rgba(0,61,165,.35); }
    .ieq-saved-badge { display:inline-flex; align-items:center; gap:5px; font-family:'Cinzel',serif; font-size:8.5px; letter-spacing:.14em; color:${IEQ.yellow}; animation:blink 1.2s ease 2; }
    .ieq-warning-banner { padding:16px 20px; border-radius:10px; animation:slideDown .3s ease; background:${isDark ? "rgba(253,184,19,.08)" : "rgba(253,184,19,.1)"}; border:1px solid rgba(253,184,19,.4); display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .ieq-edit-banner { padding:16px 20px; border-radius:10px; animation:slideDown .3s ease; background:${isDark ? "rgba(0,61,165,.1)" : "rgba(0,61,165,.07)"}; border:1px solid rgba(0,61,165,.3); display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .pulse-ring { position:absolute; border-radius:50%; border:1px solid rgba(200,16,46,.35); animation:pulse 3s ease-in-out infinite; }
    .spin-icon  { animation:spin 1s linear infinite; }
    .divider    { height:1px; background:linear-gradient(90deg,transparent,${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"},transparent); }
  `;

  if (loading) return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 0",
        gap: 14
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <QuadrangularCross size={40}/>
        <p style={{fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: ".2em", color: IEQ.red}}>CARREGANDO
          MEMBROS...</p>
      </div>
  );

  return (
      <div style={{position: "relative", paddingBottom: 48}}>
        <style>{globalStyles}</style>
        <div className="ieq-bg-stripe"/>

        {/* 🎉 TOAST DE SUCESSO ANIMADO 🎉 */}
        {toastSucesso && (
            <ToastSucessoDiscipulado
                totalPresencas={toastSucesso.totalPresencas}
                porcentagem={toastSucesso.porcentagem}
                nomeCelula={toastSucesso.nomeCelula}
                modoEdicao={toastSucesso.modoEdicao}
                onClose={() => setToastSucesso(null)}
            />
        )}

        <div style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 800,
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>

          {rascunhoCarregado && (
              <div className="ieq-toast"
                   style={{background: `linear-gradient(135deg,${IEQ.blue},${IEQ.blueDark})`, color: "#fff"}}>
                <Save size={15}/> RASCUNHO RESTAURADO → suas marcações anteriores foram recuperadas automaticamente
              </div>
          )}

          {/* Header */}
          <div className="ieq-card" style={{padding: "28px 32px"}}>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16
            }}>
              <div style={{display: "flex", alignItems: "center", gap: 18}}>
                <div style={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <div className="pulse-ring" style={{width: 64, height: 64}}/>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: isDark ? "#1A0A0D" : "#fff",
                    border: "1px solid rgba(200,16,46,.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <QuadrangularCross size={28}/>
                  </div>
                </div>
                <div>
                  <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 6}}>
                    <UserCheck size={14} style={{color: IEQ.red}}/>
                    <span style={{
                      fontFamily: "'Cinzel',serif",
                      fontSize: 9,
                      letterSpacing: ".2em",
                      color: IEQ.red
                    }}>DISCIPULADO</span>
                  </div>
                  <h2 style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: ".12em",
                    color: tp,
                    margin: 0
                  }}>
                    {celula?.nome?.toUpperCase() || "CÉLULA"}
                  </h2>
                  <div style={{marginTop: 6, height: 18}}>
                    {salvouAgora && <span className="ieq-saved-badge"><Save size={10}/> RASCUNHO SALVO</span>}
                  </div>
                </div>
              </div>
              <div style={{display: "flex", gap: 8}}>
                <button className={`ieq-tab ${aba === "relatorio" ? "ieq-tab-active" : "ieq-tab-inactive"}`}
                        onClick={() => {
                          setAba("relatorio");
                          setDetalheItem(null);
                        }}>
                  <UserCheck size={13}/> RELATÓRIO
                </button>
                <button className={`ieq-tab ${aba === "historico" ? "ieq-tab-active" : "ieq-tab-inactive"}`}
                        onClick={() => {
                          setAba("historico");
                          setDetalheItem(null);
                        }}>
                  <History size={13}/> HISTÓRICO
                </button>
              </div>
            </div>
          </div>

          {/* ABA HISTÓRICO */}
          {aba === "historico" && (
              detalheItem
                  ? <DetalheHistorico item={detalheItem} isDark={isDark} onVoltar={() => setDetalheItem(null)}
                                      onEditar={(item, detalhe) => entrarModoEdicao(item, detalhe)}/>
                  : <AbaHistorico isDark={isDark} onVerDetalhe={setDetalheItem}/>
          )}

          {/* ABA RELATÓRIO */}
          {aba === "relatorio" && (
              <>
                <div className="ieq-card"
                     style={{padding: "16px 24px", display: "flex", alignItems: "center", gap: 10}}>
                  <Calendar size={14} style={{color: IEQ.red}}/>
                  <input type="date" className="ieq-input-date" value={inicio}
                         onChange={e => handleInicioChange(e.target.value)}/>
                  <span style={{color: ts, fontFamily: "'Cinzel',serif", fontSize: 10}}>→</span>
                  <input type="date" className="ieq-input-date" value={fim}
                         onChange={e => handleFimChange(e.target.value)}/>
                  {verificandoExistente && <Loader2 size={13} style={{
                    color: IEQ.red,
                    animation: "spin 1s linear infinite",
                    marginLeft: "auto"
                  }}/>}
                </div>

                {relatorioExistente && !modoEdicao && (
                    <div className="ieq-warning-banner">
                      <AlertTriangle size={18} style={{color: IEQ.yellow, flexShrink: 0}}/>
                      <div style={{flex: 1}}>
                        <p style={{
                          fontFamily: "'Cinzel',serif",
                          fontSize: 10,
                          letterSpacing: ".16em",
                          color: IEQ.yellow,
                          margin: 0,
                          fontWeight: 700
                        }}>RELATÓRIO JÁ ENVIADO PARA ESTA SEMANA</p>
                        <p style={{fontFamily: "'Cinzel',serif", fontSize: 9, color: ts, margin: "4px 0 0"}}>Um
                          relatório já foi registrado para o período selecionado.</p>
                      </div>
                      <button onClick={() => entrarModoEdicao(relatorioExistente, null)} style={{
                        background: `linear-gradient(135deg,${IEQ.yellowDark},${IEQ.yellow})`,
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 18px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        fontFamily: "'Cinzel',serif",
                        fontSize: 9,
                        letterSpacing: ".14em",
                        color: "#000",
                        fontWeight: 700
                      }}>
                        <Edit3 size={13}/> EDITAR RELATÓRIO
                      </button>
                    </div>
                )}

                {modoEdicao && (
                    <div className="ieq-edit-banner">
                      <Edit3 size={16} style={{color: IEQ.blueLight, flexShrink: 0}}/>
                      <div style={{flex: 1}}>
                        <p style={{
                          fontFamily: "'Cinzel',serif",
                          fontSize: 10,
                          letterSpacing: ".16em",
                          color: IEQ.blueLight,
                          margin: 0,
                          fontWeight: 700
                        }}>MODO EDIÇÃO ATIVO</p>
                        <p style={{fontFamily: "'Cinzel',serif", fontSize: 9, color: ts, margin: "4px 0 0"}}>Você está
                          editando um relatório já enviado. As alterações substituirão o envio anterior.</p>
                      </div>
                      <button onClick={() => {
                        setModoEdicao(false);
                        setMembros(prev => {
                          setPresencas(inicializarPresencas(prev));
                          return prev;
                        });
                      }} style={{
                        background: "none",
                        border: `1px solid rgba(0,61,165,.3)`,
                        borderRadius: 8,
                        padding: "8px 14px",
                        cursor: "pointer",
                        fontFamily: "'Cinzel',serif",
                        fontSize: 9,
                        color: IEQ.blueLight
                      }}>
                        CANCELAR
                      </button>
                    </div>
                )}

                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12}}>
                  {[
                    {label: "MEMBROS", val: membros.length, color: IEQ.red},
                    {label: "PRESENÇAS", val: stats.totalGeral, color: IEQ.blue},
                    {
                      label: "FREQUÊNCIA",
                      val: `${stats.porcentagem}%`,
                      color: stats.porcentagem > 60 ? IEQ.yellow : IEQ.red,
                      highlight: stats.porcentagem > 60
                    },
                  ].map(({label, val, color, highlight}) => (
                      <div key={label} className="ieq-kpi" style={highlight ? {
                        background: `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`,
                        border: "none"
                      } : {}}>
                        <p style={{
                          fontFamily: "'Cinzel',serif",
                          fontSize: 8.5,
                          letterSpacing: ".18em",
                          color: highlight ? "rgba(255,255,255,.55)" : ts,
                          margin: "0 0 6px"
                        }}>{label}</p>
                        <p style={{
                          fontFamily: "'Cinzel',serif",
                          fontSize: 36,
                          fontWeight: 700,
                          color: highlight ? "#fff" : color,
                          margin: 0,
                          lineHeight: 1
                        }}>{val}</p>
                      </div>
                  ))}
                </div>

                {erro && <div className="ieq-alert" style={{
                  background: "rgba(200,16,46,.08)",
                  border: `1px solid rgba(200,16,46,.3)`,
                  color: IEQ.red
                }}>{erro.toUpperCase()}</div>}

                <div className="ieq-card" style={{
                  overflow: "hidden",
                  opacity: (relatorioExistente && !modoEdicao) ? 0.4 : 1,
                  pointerEvents: (relatorioExistente && !modoEdicao) ? "none" : "auto",
                  transition: "opacity .3s"
                }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr repeat(5,60px)",
                    padding: "14px 24px",
                    gap: 8,
                    alignItems: "center",
                    borderBottom: `1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`,
                    background: isDark ? "rgba(200,16,46,.04)" : "rgba(200,16,46,.03)"
                  }}>
                    <span style={{
                      fontFamily: "'Cinzel',serif",
                      fontSize: 9,
                      letterSpacing: ".16em",
                      color: ts
                    }}>MEMBRO</span>
                    {COLUNAS.map(({label, emoji}) => (
                        <div key={label} style={{textAlign: "center"}}>
                          <div style={{fontSize: 14, lineHeight: 1}}>{emoji}</div>
                          <p style={{
                            fontFamily: "'Cinzel',serif",
                            fontSize: 7.5,
                            letterSpacing: ".1em",
                            color: ts,
                            margin: "4px 0 0"
                          }}>{label.toUpperCase()}</p>
                        </div>
                    ))}
                  </div>

                  {membros.map((m, i) => {
                    const p = presencas[i];
                    const total = p ? COLUNAS.filter(c => p[c.campo]).length : 0;
                    const pct = Math.round((total / COLUNAS.length) * 100);
                    return (
                        <div key={m.id} className="ieq-member-block">
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 14
                          }}>
                            <div style={{display: "flex", alignItems: "center", gap: 12}}>
                              <div className="ieq-avatar"
                                   style={{background: `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`}}>{m.nome.charAt(0)}</div>
                              <div>
                                <p style={{
                                  fontFamily: "'EB Garamond',serif",
                                  fontSize: 16,
                                  fontWeight: 600,
                                  color: tp,
                                  margin: 0
                                }}>{m.nome}</p>
                                <p style={{
                                  fontFamily: "'Cinzel',serif",
                                  fontSize: 8,
                                  letterSpacing: ".12em",
                                  color: ts,
                                  margin: "2px 0 0"
                                }}>ID #{m.id}</p>
                              </div>
                            </div>
                            <div style={{
                              padding: "5px 14px",
                              borderRadius: 99,
                              background: total === COLUNAS.length ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})` : (isDark ? "rgba(255,255,255,.05)" : "rgba(200,16,46,.06)"),
                              border: `1px solid ${total === COLUNAS.length ? IEQ.red : (isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)")}`
                            }}>
                              <span style={{
                                fontFamily: "'Cinzel',serif",
                                fontSize: 9,
                                letterSpacing: ".14em",
                                color: total === COLUNAS.length ? "#fff" : ts
                              }}>{total}/{COLUNAS.length}</span>
                            </div>
                          </div>
                          <div style={{
                            height: 4,
                            borderRadius: 99,
                            background: isDark ? "rgba(255,255,255,.06)" : "rgba(200,16,46,.08)",
                            marginBottom: 14,
                            overflow: "hidden"
                          }}>
                            <div style={{
                              height: "100%",
                              borderRadius: 99,
                              width: `${pct}%`,
                              background: pct === 100 ? IEQ.yellow : `linear-gradient(90deg,${IEQ.red},${IEQ.blue})`,
                              transition: "width .4s ease"
                            }}/>
                          </div>
                          <div style={{display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8}}>
                            {COLUNAS.map(({campo, label, emoji}) => {
                              const marcado = p?.[campo];
                              return (
                                  <button key={campo} className="ieq-presence-btn"
                                          onClick={() => alterarPresenca(i, campo)} style={{
                                    borderColor: marcado ? IEQ.red : (isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"),
                                    background: marcado ? (isDark ? "rgba(200,16,46,.12)" : "rgba(200,16,46,.07)") : (isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)"),
                                    transform: marcado ? "scale(1.04)" : "scale(1)"
                                  }}>
                                    <span style={{
                                      fontSize: 18,
                                      filter: marcado ? "none" : "grayscale(1)",
                                      opacity: marcado ? 1 : 0.4,
                                      transition: "all .2s"
                                    }}>{marcado ? "✅" : emoji}</span>
                                    <span style={{
                                      fontFamily: "'Cinzel',serif",
                                      fontSize: 7.5,
                                      letterSpacing: ".1em",
                                      color: marcado ? IEQ.red : ts,
                                      fontWeight: 700
                                    }}>{label.toUpperCase()}</span>
                                  </button>
                              );
                            })}
                          </div>
                        </div>
                    );
                  })}
                </div>

                <button className="ieq-btn-submit" onClick={enviarRelatorio}
                        disabled={enviando || loading || membros.length === 0 || (relatorioExistente && !modoEdicao)}
                        style={{
                          background: modoEdicao ? `linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})` : `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`,
                          boxShadow: modoEdicao ? "0 8px 24px rgba(0,61,165,.25)" : "0 8px 24px rgba(200,16,46,.25)"
                        }}>
                  {enviando ? <><Loader2 size={17} className="spin-icon"/> PROCESSANDO...</> : modoEdicao ? <><Edit3
                      size={17}/> SALVAR ALTERAÇÕES</> : <><CheckCircle2 size={17}/> FINALIZAR RELATÓRIO DA SEMANA</>}
                </button>
              </>
          )}

          <div className="divider"/>
          <p style={{
            textAlign: "center",
            fontFamily: "'Cinzel',serif",
            fontSize: 9,
            letterSpacing: ".15em",
            color: ts
          }}>
            © IEQ PITUAÇÚ · SISTEMA SEGURO · {new Date().getFullYear()}
          </p>
        </div>
      </div>
  );
}
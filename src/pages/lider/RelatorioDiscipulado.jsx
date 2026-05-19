import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import api from "../../services/api.js";
import { Loader2, CheckCircle2, Calendar, UserCheck } from "lucide-react";

/* ─── Cores Oficiais IEQ ─── */
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
  const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() + diffSegunda);
  const domingo = new Date(segunda);
  domingo.setDate(segunda.getDate() + 6);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  return { inicio: fmt(segunda), fim: fmt(domingo) };
}

const COLUNAS = [
  { campo: "escolaBiblica", label: "EBD",       emoji: "📖" },
  { campo: "quartaNoite",   label: "4ª Noite",   emoji: "🌙" },
  { campo: "quintaNoite",   label: "5ª Noite",   emoji: "⭐" },
  { campo: "domingoManha",  label: "Dom. Manhã", emoji: "☀️" },
  { campo: "domingoNoite",  label: "Dom. Noite", emoji: "🌟" },
];

export default function RelatorioDiscipulado({ isDark = false }) {
  const [celula,           setCelula]           = useState(null);
  const [membros,          setMembros]          = useState([]);
  const [presencas,        setPresencas]        = useState([]);
  const [inicio,           setInicio]           = useState("");
  const [fim,              setFim]              = useState("");
  const [loading,          setLoading]          = useState(true);
  const [enviando,         setEnviando]         = useState(false);
  const [erro,             setErro]             = useState("");
  const [sucesso,          setSucesso]          = useState("");
  const [rascunhoCarregado,setRascunhoCarregado]= useState(false);

  /* ─── Impede auto-save durante o carregamento inicial ─── */
  const prontoParaSalvar = useRef(false);
  const celulaIdRef      = useRef(null);
  const inicioRef        = useRef("");

  const inicializarPresencas = useCallback((lista) =>
      lista.map((m) => ({
        membroId: m.id, nomeMembro: m.nome,
        escolaBiblica:false, quartaNoite:false, quintaNoite:false, domingoManha:false, domingoNoite:false,
      })), []);

  /* ─── Auto-save: só dispara após carregamento concluído ─── */
  useEffect(() => {
    if (!prontoParaSalvar.current || !celulaIdRef.current || !inicioRef.current || presencas.length === 0) return;
    try {
      const draft = { presencas, fim, salvoEm: new Date().toISOString() };
      localStorage.setItem(draftKey(celulaIdRef.current, inicioRef.current), JSON.stringify(draft));
    } catch (err) {
      console.warn("Não foi possível salvar rascunho:", err);
    }
  }, [presencas, fim]);

  const carregarDados = useCallback(async () => {
    prontoParaSalvar.current = false; // bloqueia auto-save durante carga
    setLoading(true); setErro("");
    try {
      const res = await api.get("/celulas/minha-celula");
      if (!res.data) { setErro("Célula não vinculada."); return; }
      setCelula(res.data);
      celulaIdRef.current = res.data.id;
      const lista = res.data.membros || [];
      setMembros(lista);

      const semana = obterSemanaAtual();
      inicioRef.current = semana.inicio;

      /* ─── Tenta restaurar rascunho ─── */
      let restaurou = false;
      try {
        const raw = localStorage.getItem(draftKey(res.data.id, semana.inicio));
        if (raw) {
          const draft = JSON.parse(raw);
          // Adiciona membros novos que não estavam no rascunho
          const idsNoRascunho = new Set(draft.presencas.map(p => p.membroId));
          const novosMembros = lista
              .filter(m => !idsNoRascunho.has(m.id))
              .map(m => ({
                membroId: m.id, nomeMembro: m.nome,
                escolaBiblica:false, quartaNoite:false, quintaNoite:false, domingoManha:false, domingoNoite:false,
              }));
          setPresencas([...draft.presencas, ...novosMembros]);
          setInicio(semana.inicio);
          setFim(draft.fim || semana.fim);
          restaurou = true;
          setRascunhoCarregado(true);
          setTimeout(() => setRascunhoCarregado(false), 4000);
        }
      } catch (err) {
        console.warn("Erro ao ler rascunho:", err);
      }

      if (!restaurou) {
        setPresencas(inicializarPresencas(lista));
        setInicio(semana.inicio);
        setFim(semana.fim);
      }

      /* ─── Libera auto-save após tudo definido ─── */
      setTimeout(() => { prontoParaSalvar.current = true; }, 0);
    } catch { setErro("Erro ao carregar dados."); }
    finally { setLoading(false); }
  }, [inicializarPresencas]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  /* ─── Troca de período: tenta carregar rascunho da semana escolhida ─── */
  const handleInicioChange = (novoInicio) => {
    prontoParaSalvar.current = false;
    setInicio(novoInicio);
    inicioRef.current = novoInicio;
    try {
      const raw = celulaIdRef.current
          ? localStorage.getItem(draftKey(celulaIdRef.current, novoInicio))
          : null;
      if (raw) {
        const draft = JSON.parse(raw);
        setPresencas(draft.presencas);
        setFim(draft.fim || fim);
        setRascunhoCarregado(true);
        setTimeout(() => setRascunhoCarregado(false), 4000);
      } else {
        setPresencas(inicializarPresencas(membros));
      }
    } catch (err) {
      console.warn("Erro ao ler rascunho:", err);
      setPresencas(inicializarPresencas(membros));
    }
    setTimeout(() => { prontoParaSalvar.current = true; }, 0);
  };

  const alterarPresenca = (index, campo) => {
    setPresencas(prev => {
      const novo = [...prev];
      if (novo[index]) novo[index] = { ...novo[index], [campo]: !novo[index][campo] };
      return novo;
    });
  };

  const totalPresencasMembro = (index) => {
    const p = presencas[index];
    return p ? COLUNAS.filter(c => p[c.campo]).length : 0;
  };

  const stats = useMemo(() => {
    const totalGeral    = presencas.reduce((acc, _, i) => acc + totalPresencasMembro(i), 0);
    const totalPossivel = presencas.length * COLUNAS.length;
    const porcentagem   = totalPossivel > 0 ? Math.round((totalGeral / totalPossivel) * 100) : 0;
    return { totalGeral, porcentagem };
  }, [presencas]);

  const enviarRelatorio = async () => {
    setErro(""); setSucesso("");
    if (!inicio || !fim || !celula?.id || presencas.length === 0) return setErro("Verifique os dados.");
    setEnviando(true);
    try {
      const payload = presencas.map(({ nomeMembro, membroId, ...rest }) => ({ membroId: Number(membroId), ...rest }));
      await api.post(`/discipulado/relatorio-semanal?inicio=${inicio}&fim=${fim}`, payload);

      /* ─── Limpa rascunho e reseta presenças ─── */
      try { localStorage.removeItem(draftKey(celula.id, inicio)); } catch (_) {}
      prontoParaSalvar.current = false;
      setPresencas(inicializarPresencas(membros));
      setTimeout(() => { prontoParaSalvar.current = true; }, 0);

      setSucesso("Relatório enviado com sucesso!");
      setTimeout(() => setSucesso(""), 4000);
    } catch (e) { setErro(e?.response?.data?.message || "Erro no envio."); }
    finally { setEnviando(false); }
  };

  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing:border-box; }
    @keyframes stripe { 0%{background-position:0 0} 100%{background-position:60px 60px} }
    @keyframes pulse  { 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.12);opacity:.12} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

    .ieq-bg-stripe {
      position:fixed; inset:0; pointer-events:none; z-index:0;
      background:repeating-linear-gradient(-55deg,
        ${isDark?"rgba(200,16,46,.04)":"rgba(200,16,46,.05)"} 0 10px,transparent 10px 20px,
        ${isDark?"rgba(253,184,19,.03)":"rgba(253,184,19,.04)"} 20px 30px,transparent 30px 40px);
      background-size:60px 60px; animation:stripe 8s linear infinite;
    }
    .ieq-card {
      background:${isDark?"rgba(17,10,13,.97)":"rgba(255,255,255,.92)"};
      border:1px solid ${isDark?"rgba(200,16,46,.15)":"rgba(200,16,46,.12)"};
      border-radius:14px; backdrop-filter:blur(24px);
    }
    .ieq-kpi {
      background:${isDark?"rgba(17,10,13,.97)":"rgba(255,255,255,.92)"};
      border:1px solid ${isDark?"rgba(200,16,46,.12)":"rgba(200,16,46,.1)"};
      border-radius:12px; padding:22px; text-align:center;
      animation:fadeIn .5s ease both;
    }
    .ieq-input-date {
      background:transparent; border:none; outline:none;
      font-family:'Cinzel',serif; font-size:10px; letter-spacing:.12em;
      color:${tp}; cursor:pointer; font-weight:700;
    }
    .ieq-member-block {
      padding:22px 24px;
      border-bottom:1px solid ${isDark?"rgba(200,16,46,.08)":"rgba(200,16,46,.07)"};
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
      animation: slideDown .35s ease;
      background: linear-gradient(135deg, ${IEQ.blue}, ${IEQ.blueDark});
      border-radius: 10px; padding: 12px 18px;
      display: flex; align-items: center; gap: 10px;
      font-family: 'Cinzel', serif; font-size: 9.5px; letter-spacing: .16em; color: #fff;
      box-shadow: 0 4px 20px rgba(0,61,165,.35);
    }
    .pulse-ring { position:absolute; border-radius:50%; border:1px solid rgba(200,16,46,.35); animation:pulse 3s ease-in-out infinite; }
    .spin-icon  { animation:spin 1s linear infinite; }
    .divider    { height:1px; background:linear-gradient(90deg,transparent,${isDark?"rgba(200,16,46,.25)":"rgba(200,16,46,.2)"},transparent); }
  `;

  if (loading) return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"64px 0", gap:14 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <QuadrangularCross size={40} />
        <p style={{ fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".2em", color:IEQ.red }}>CARREGANDO MEMBROS...</p>
      </div>
  );

  return (
      <div style={{ position:"relative", paddingBottom:48 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg-stripe" />

        <div style={{ position:"relative", zIndex:1, maxWidth:800, margin:"0 auto", padding:"0 16px", display:"flex", flexDirection:"column", gap:16 }}>

          {rascunhoCarregado && (
              <div className="ieq-toast">
                <CheckCircle2 size={15} />
                RASCUNHO RESTAURADO — suas marcações anteriores foram recuperadas
              </div>
          )}

          {/* ── Header ── */}
          <div className="ieq-card" style={{ padding:"28px 32px" }}>
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:18 }}>
                <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                  <div className="pulse-ring" style={{ width:64, height:64 }} />
                  <div style={{ width:48, height:48, borderRadius:"50%", background:isDark?"#1A0A0D":"#fff", border:"1px solid rgba(200,16,46,.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <QuadrangularCross size={28} />
                  </div>
                </div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                    <UserCheck size={14} style={{ color:IEQ.red }} />
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:IEQ.red }}>RELATÓRIO DE DISCIPULADO</span>
                  </div>
                  <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:18, fontWeight:700, letterSpacing:".12em", color:tp, margin:0 }}>
                    {celula?.nome?.toUpperCase() || "CÉLULA"}
                  </h2>
                </div>
              </div>
              <div style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 18px", borderRadius:8,
                background:isDark?"rgba(255,255,255,.04)":"rgba(200,16,46,.05)",
                border:`1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)"}`,
              }}>
                <Calendar size={14} style={{ color:IEQ.red }} />
                <input type="date" className="ieq-input-date" value={inicio} onChange={e => handleInicioChange(e.target.value)} />
                <span style={{ color:ts, fontFamily:"'Cinzel',serif", fontSize:10 }}>—</span>
                <input type="date" className="ieq-input-date" value={fim} onChange={e => setFim(e.target.value)} />
              </div>
            </div>
          </div>

          {/* ── KPIs ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            {[
              { label:"MEMBROS",   val:membros.length,   color:IEQ.red },
              { label:"PRESENÇAS", val:stats.totalGeral, color:IEQ.blue },
              { label:"FREQUÊNCIA", val:`${stats.porcentagem}%`, color: stats.porcentagem > 60 ? IEQ.yellow : IEQ.red, highlight: stats.porcentagem > 60 },
            ].map(({ label, val, color, highlight }) => (
                <div key={label} className="ieq-kpi" style={ highlight ? { background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, border:"none" } : {} }>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".18em", color:highlight?"rgba(255,255,255,.55)":ts, margin:"0 0 6px" }}>{label}</p>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:36, fontWeight:700, color:highlight?"#fff":color, margin:0, lineHeight:1 }}>{val}</p>
                </div>
            ))}
          </div>

          {erro && (
              <div className="ieq-alert" style={{ background:"rgba(200,16,46,.08)", border:`1px solid rgba(200,16,46,.3)`, color:IEQ.red }}>
                {erro.toUpperCase()}
              </div>
          )}
          {sucesso && (
              <div className="ieq-alert" style={{ background:`rgba(0,61,165,.08)`, border:`1px solid rgba(0,61,165,.3)`, color:isDark?IEQ.blueLight:IEQ.blue }}>
                {sucesso.toUpperCase()}
              </div>
          )}

          {/* ── Lista de membros ── */}
          <div className="ieq-card" style={{ overflow:"hidden" }}>
            <div style={{
              display:"grid", gridTemplateColumns:"1fr repeat(5,60px)",
              padding:"14px 24px",
              borderBottom:`1px solid ${isDark?"rgba(200,16,46,.1)":"rgba(200,16,46,.08)"}`,
              background:isDark?"rgba(200,16,46,.04)":"rgba(200,16,46,.03)",
              alignItems:"center", gap:8,
            }}>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".16em", color:ts }}>MEMBRO</span>
              {COLUNAS.map(({ label, emoji }) => (
                  <div key={label} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:14, lineHeight:1 }}>{emoji}</div>
                    <p style={{ fontFamily:"'Cinzel',serif", fontSize:7.5, letterSpacing:".1em", color:ts, margin:"4px 0 0" }}>{label.toUpperCase()}</p>
                  </div>
              ))}
            </div>

            {membros.map((m, i) => {
              const total = totalPresencasMembro(i);
              const pct   = Math.round((total / COLUNAS.length) * 100);
              return (
                  <div key={m.id} className="ieq-member-block">
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div className="ieq-avatar" style={{ background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})` }}>
                          {m.nome.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:16, fontWeight:600, color:tp, margin:0 }}>{m.nome}</p>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".12em", color:ts, margin:"2px 0 0" }}>ID #{m.id}</p>
                        </div>
                      </div>
                      <div style={{
                        padding:"5px 14px", borderRadius:99,
                        background: total===COLUNAS.length ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})` : (isDark?"rgba(255,255,255,.05)":"rgba(200,16,46,.06)"),
                        border:`1px solid ${total===COLUNAS.length?IEQ.red:(isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.15)")}`,
                      }}>
                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".14em", color:total===COLUNAS.length?"#fff":ts }}>
                          {total}/{COLUNAS.length}
                        </span>
                      </div>
                    </div>

                    <div style={{ height:4, borderRadius:99, background:isDark?"rgba(255,255,255,.06)":"rgba(200,16,46,.08)", marginBottom:14, overflow:"hidden" }}>
                      <div style={{
                        height:"100%", borderRadius:99, width:`${pct}%`,
                        background: pct===100 ? IEQ.yellow : `linear-gradient(90deg,${IEQ.red},${IEQ.blue})`,
                        transition:"width .4s ease",
                      }} />
                    </div>

                    <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
                      {COLUNAS.map(({ campo, label, emoji }) => {
                        const marcado = presencas[i]?.[campo];
                        return (
                            <button
                                key={campo}
                                className="ieq-presence-btn"
                                onClick={() => alterarPresenca(i, campo)}
                                style={{
                                  borderColor: marcado ? IEQ.red : (isDark?"rgba(200,16,46,.15)":"rgba(200,16,46,.12)"),
                                  background: marcado
                                      ? (isDark?"rgba(200,16,46,.12)":"rgba(200,16,46,.07)")
                                      : (isDark?"rgba(255,255,255,.02)":"rgba(0,0,0,.02)"),
                                  transform: marcado ? "scale(1.04)" : "scale(1)",
                                }}
                            >
                              <span style={{ fontSize:18, filter: marcado ? "none" : "grayscale(1)", opacity: marcado ? 1 : 0.4, transition:"all .2s" }}>
                                {marcado ? "✅" : emoji}
                              </span>
                              <span style={{ fontFamily:"'Cinzel',serif", fontSize:7.5, letterSpacing:".1em", color: marcado ? IEQ.red : ts, fontWeight:700 }}>
                                {label.toUpperCase()}
                              </span>
                            </button>
                        );
                      })}
                    </div>
                  </div>
              );
            })}
          </div>

          <button
              className="ieq-btn-submit"
              onClick={enviarRelatorio}
              disabled={enviando || loading || membros.length === 0}
          >
            {enviando
                ? <><Loader2 size={17} className="spin-icon" /> PROCESSANDO...</>
                : <><CheckCircle2 size={17} /> FINALIZAR RELATÓRIO DA SEMANA</>}
          </button>

          <div className="divider" />
          <p style={{ textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".15em", color:ts }}>
            © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
          </p>
        </div>
      </div>
  );
}
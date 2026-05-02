import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import {
  Calendar, BookOpen, Loader2, ChevronDown,
  UserCheck, ClipboardCheck, Trophy, Users2, Sparkles, CheckCircle2,
} from "lucide-react";

/* ─── Cores Oficiais IEQ ─── */
const IEQ = {
  red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
  yellow: "#FDB813", yellowDark: "#C48C00",
  blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
  white: "#FFFFFF", offWhite: "#F5F0E8",
  dark: "#0A0608", darkCard: "#110A0D",
};

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

export default function TelaRelatorio({ isDark = false }) {
  const [celula,        setCelula]        = useState(null);
  const [pessoas,       setPessoas]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [enviando,      setEnviando]      = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());

  const [form, setForm] = useState({
    celulaId: null,
    dataReuniao: new Date().toISOString().split("T")[0],
    estudo: "",
    selecionadosKeys: [],
    decisoes: {},
  });

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const headers = { Authorization: `Bearer ${token}` };
      const resCelula = await api.get("/celulas/minha-celula", { headers });
      const dadosCelula = resCelula.data;
      setCelula(dadosCelula);
      setForm(prev => ({ ...prev, celulaId: dadosCelula.id }));
      const [resMembros, resVisitantes] = await Promise.all([
        api.get(`/celulas/${dadosCelula.id}/membros`, { headers }),
        api.get(`/visitantes/celula/${dadosCelula.id}/ativos`, { headers }),
      ]);
      const membros   = (resMembros.data   || []).map(m => ({ id:m.id, nome:m.nome, tipo:"MEMBRO",    uKey:`MEMBRO-${m.id}` }));
      const visitantes= (resVisitantes.data|| []).map(v => ({ id:v.id, nome:v.nome, tipo:"VISITANTE", uKey:`VISITANTE-${v.id}` }));
      setPessoas([...membros, ...visitantes].sort((a,b) => a.nome.localeCompare(b.nome)));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const alternarPresenca = (uKey) => {
    const isMarcado = form.selecionadosKeys.includes(uKey);
    setProcessingIds(prev => new Set(prev).add(uKey));
    setForm(prev => {
      const novasKeys = isMarcado ? prev.selecionadosKeys.filter(k=>k!==uKey) : [...prev.selecionadosKeys, uKey];
      const novasDecisoes = { ...prev.decisoes };
      if (isMarcado) delete novasDecisoes[uKey];
      return { ...prev, selecionadosKeys: novasKeys, decisoes: novasDecisoes };
    });
    setTimeout(() => setProcessingIds(prev => { const n=new Set(prev); n.delete(uKey); return n; }), 200);
  };

  const membrosPresentes   = form.selecionadosKeys.filter(k=>k.startsWith("MEMBRO-")).length;
  const visitantesPresentes= form.selecionadosKeys.filter(k=>k.startsWith("VISITANTE-")).length;
  const total              = membrosPresentes + visitantesPresentes;

  const handleSubmit = async () => {
    if (!form.estudo.trim()) return alert("Informe o tema do estudo.");
    try {
      setEnviando(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const payload = {
        celulaId: Number(form.celulaId),
        dataReuniao: form.dataReuniao,
        estudo: form.estudo.trim(),
        membrosPresentesIds: form.selecionadosKeys.filter(k=>k.startsWith("MEMBRO-")).map(k=>Number(k.replace("MEMBRO-",""))),
        visitantesPresentes: form.selecionadosKeys.filter(k=>k.startsWith("VISITANTE-")).map(k=>({ id:Number(k.replace("VISITANTE-","")), decisaoEspiritual:form.decisoes[k]||"NENHUMA" })),
      };
      await api.post("/relatorios", payload, { headers:{ Authorization:`Bearer ${token}` } });
      alert("Relatório enviado com sucesso!");
      setForm(f => ({ ...f, estudo:"", selecionadosKeys:[], decisoes:{} }));
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao enviar relatório.");
    } finally { setEnviando(false); }
  };

  const nomeCelula     = celula?.nome             || "Carregando...";
  const nomeUsuarioLider = celula?.lider?.nome || celula?.usuario?.nome || "Líder";
  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing:border-box; }
    @keyframes stripe { 0%{background-position:0 0} 100%{background-position:60px 60px} }
    @keyframes pulse  { 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.12);opacity:.12} }
    @keyframes spin   { to{transform:rotate(360deg)} }

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

    .ieq-input {
      width:100%;
      background:${isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)"};
      border:1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)"};
      color:${tp}; padding:12px 16px; border-radius:8px; outline:none;
      font-family:'EB Garamond',serif; font-size:15px; transition:all .25s;
    }
    .ieq-input:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-input::placeholder { color:${ts}; }

    .ieq-select {
      width:100%;
      background:${isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)"};
      border:1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)"};
      color:${tp}; padding:12px 16px; border-radius:8px; outline:none;
      font-family:'EB Garamond',serif; font-size:15px; cursor:pointer; transition:all .25s; appearance:none;
    }
    .ieq-select:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }

    .ieq-label {
      display:block; margin-bottom:6px;
      font-family:'Cinzel',serif; font-size:9.5px; letter-spacing:.18em; color:${IEQ.red};
    }

    .ieq-person-row {
      border-bottom:1px solid ${isDark?"rgba(200,16,46,.08)":"rgba(200,16,46,.07)"};
      transition:background .2s;
    }
    .ieq-person-row:last-child { border-bottom:none; }

    .ieq-kpi {
      background:${isDark?"rgba(17,10,13,.97)":"rgba(255,255,255,.92)"};
      border:1px solid ${isDark?"rgba(200,16,46,.15)":"rgba(200,16,46,.12)"};
      border-radius:12px; padding:20px; text-align:center;
    }

    .pulse-ring { position:absolute; border-radius:50%; border:1px solid rgba(200,16,46,.35); animation:pulse 3s ease-in-out infinite; }
    .spin-icon  { animation:spin 1s linear infinite; }
    .divider    { height:1px; background:linear-gradient(90deg,transparent,${isDark?"rgba(200,16,46,.25)":"rgba(200,16,46,.2)"},transparent); }
  `;

  if (loading) return (
      <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign:"center" }}>
          <QuadrangularCross size={40} />
          <p style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:".2em", color:IEQ.red, marginTop:14 }}>CARREGANDO...</p>
        </div>
      </div>
  );

  return (
      <div style={{ minHeight:"100vh", position:"relative", paddingBottom:120 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg-stripe" />

        <div style={{ position:"relative", zIndex:1, maxWidth:720, margin:"0 auto", padding:"0 16px" }}>

          {/* Hero */}
          <div style={{
            padding:"40px 40px 36px",
            marginBottom:24,
            background: isDark ? `linear-gradient(135deg,#1A0A0D,#0A0608)` : `linear-gradient(135deg,${IEQ.blue},${IEQ.blueDark})`,
            borderRadius:14, position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:`repeating-linear-gradient(-55deg,rgba(255,255,255,.03) 0 10px,transparent 10px 20px)`, backgroundSize:"40px 40px" }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                  <div className="pulse-ring" style={{ width:64, height:64 }} />
                  <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <QuadrangularCross size={28} />
                  </div>
                </div>
                <div>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".22em", color:"rgba(255,255,255,.5)", margin:0 }}>RELATÓRIO SEMANAL</p>
                  <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:700, color:"#fff", margin:"4px 0 0", letterSpacing:".1em" }}>
                    {nomeCelula.toUpperCase()}
                  </h1>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:38, height:38, borderRadius:8, background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <UserCheck size={18} style={{ color:"#fff" }} />
                </div>
                <div>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".18em", color:"rgba(255,255,255,.5)", margin:0 }}>LÍDER RESPONSÁVEL</p>
                  <p style={{ fontFamily:"'EB Garamond',serif", fontSize:16, fontWeight:600, color:"#fff", margin:0 }}>{nomeUsuarioLider}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dados da reunião */}
          <div className="ieq-card" style={{ padding:"26px 28px", marginBottom:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <label className="ieq-label"><Calendar size={11} style={{ display:"inline", marginRight:6 }} />DATA DA REUNIÃO</label>
                <input className="ieq-input" type="date" value={form.dataReuniao} onChange={e => setForm({...form, dataReuniao:e.target.value})} />
              </div>
              <div>
                <label className="ieq-label"><BookOpen size={11} style={{ display:"inline", marginRight:6 }} />TEMA DO ESTUDO</label>
                <input className="ieq-input" placeholder="Qual foi o estudo de hoje?" value={form.estudo} onChange={e => setForm({...form, estudo:e.target.value})} />
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
            {[
              { label:"MEMBROS",    val:membrosPresentes,    color:IEQ.red },
              { label:"VISITANTES", val:visitantesPresentes, color:IEQ.blue },
              { label:"TOTAL",      val:total,               color:IEQ.yellow, highlight:true },
            ].map(({ label, val, color, highlight }) => (
                <div key={label} className="ieq-kpi" style={ highlight ? { background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, border:"none" } : {} }>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".18em", color: highlight?"rgba(255,255,255,.6)":ts, margin:"0 0 6px" }}>{label}</p>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:38, fontWeight:700, color: highlight?"#fff":color, margin:0, lineHeight:1 }}>{val}</p>
                </div>
            ))}
          </div>

          {/* Lista de chamada */}
          <div className="ieq-card" style={{ overflow:"hidden", marginBottom:16 }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${isDark?"rgba(200,16,46,.1)":"rgba(200,16,46,.08)"}`, display:"flex", alignItems:"center", gap:10 }}>
              <Users2 size={18} style={{ color:IEQ.red }} />
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".16em", color:tp }}>CHAMADA</span>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".12em", color:ts, marginLeft:"auto" }}>{pessoas.length} PESSOAS</span>
            </div>

            <div style={{ maxHeight:"55vh", overflowY:"auto" }}>
              {pessoas.map((pessoa) => {
                const marcado     = form.selecionadosKeys.includes(pessoa.uKey);
                const isVisitante = pessoa.tipo === "VISITANTE";
                const processing  = processingIds.has(pessoa.uKey);

                return (
                    <div key={pessoa.uKey} className="ieq-person-row" style={{ background: marcado ? (isDark?"rgba(200,16,46,.07)":"rgba(200,16,46,.05)") : "transparent" }}>
                      <button
                          onClick={() => alternarPresenca(pessoa.uKey)}
                          disabled={processing}
                          style={{ width:"100%", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 24px", transition:"all .2s" }}
                      >
                        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                          <div style={{
                            width:44, height:44, borderRadius:8,
                            background: marcado ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})` : (isDark?"rgba(255,255,255,.06)":"rgba(200,16,46,.08)"),
                            display:"flex", alignItems:"center", justifyContent:"center",
                            color: marcado?"#fff":(isDark?IEQ.offWhite:"#1A0A0D"),
                            fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:16,
                            transition:"all .3s", transform: marcado?"scale(1.05)":"scale(1)",
                          }}>
                            {processing ? <Loader2 size={18} className="spin-icon" /> : pessoa.nome.charAt(0)}
                          </div>
                          <div style={{ textAlign:"left" }}>
                            <p style={{ fontFamily:"'EB Garamond',serif", fontSize:16, fontWeight: marcado?600:400, color: marcado?tp:ts, margin:0 }}>{pessoa.nome}</p>
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".15em", color: isVisitante?IEQ.yellow:IEQ.red }}>{pessoa.tipo}</span>
                          </div>
                        </div>
                        <div style={{
                          width:26, height:26, borderRadius:6,
                          border: `2px solid ${marcado?IEQ.red:(isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)")}`,
                          background: marcado?IEQ.red:"transparent",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          transition:"all .3s",
                        }}>
                          {marcado && <CheckCircle2 size={14} style={{ color:"#fff" }} />}
                        </div>
                      </button>

                      {marcado && isVisitante && (
                          <div style={{ padding:"0 24px 18px 82px" }}>
                            <div className="ieq-card" style={{ padding:"16px 18px" }}>
                              <label className="ieq-label" style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <Trophy size={11} /> DECISÃO ESPIRITUAL
                              </label>
                              <div style={{ position:"relative" }}>
                                <select
                                    className="ieq-select"
                                    value={form.decisoes[pessoa.uKey] || "NENHUMA"}
                                    onChange={e => setForm(prev => ({ ...prev, decisoes:{ ...prev.decisoes, [pessoa.uKey]:e.target.value } }))}
                                >
                                  <option value="NENHUMA">Só visita</option>
                                  <option value="ACEITOU_JESUS">Aceitou Jesus</option>
                                  <option value="RECONCILIOU">Reconciliou</option>
                                  <option value="BATISMO_AGUAS">Deseja Batismo</option>
                                </select>
                                <ChevronDown size={14} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:ts, pointerEvents:"none" }} />
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

        {/* Botão fixo */}
        <div style={{ position:"fixed", bottom:0, left:0, width:"100%", padding:"16px 24px", zIndex:50, background: isDark?"linear-gradient(to top,rgba(10,6,8,1) 60%,transparent)":"linear-gradient(to top,rgba(240,234,232,1) 60%,transparent)" }}>
          <div style={{ maxWidth:720, margin:"0 auto" }}>
            <button
                onClick={handleSubmit}
                disabled={enviando || !form.estudo.trim()}
                style={{
                  width:"100%", padding:"17px 0", borderRadius:10, border:"none",
                  background: (enviando||!form.estudo.trim()) ? "rgba(200,16,46,.3)" : `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`,
                  color:"#fff", cursor: (enviando||!form.estudo.trim()) ? "not-allowed":"pointer",
                  fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".22em",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:10, transition:"all .25s",
                }}
            >
              {enviando ? <><Loader2 size={17} className="spin-icon" /> ENVIANDO...</> : <><ClipboardCheck size={17} /> FINALIZAR RELATÓRIO ({total})</>}
            </button>
          </div>
        </div>
      </div>
  );
}
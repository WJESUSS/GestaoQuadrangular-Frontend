import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Users, Calendar, BookOpen, AlertCircle,
  Loader2, Filter, Sparkles, X,
  UserCheck, MessageSquare, TrendingUp, UserPlus, Ban, AlertTriangle,
  Bell, BellRing, CheckCheck, Clock, Briefcase, Plane, HeartPulse,
  HelpCircle, UserX, Sun, Moon, LogOut, ChevronRight, ChevronDown,
  Target, Home, Flame, CalendarDays, Plus, Search, Trash2,
} from "lucide-react";

/* ─── Tokens AURA ─────────────────────────────────────────────────────── */
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
  yellowDark:"#C48C00",
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
    glow1:       isDark ? "rgba(201,169,110,.05)"  : "rgba(201,169,110,.08)",
    glow2:       isDark ? "rgba(201,169,110,.04)"  : "rgba(201,169,110,.06)",
    cardHover:   isDark ? "rgba(201,169,110,.2)"   : "rgba(201,169,110,.35)",
    placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
  };
}

const MOTIVO_LABELS = {
  AUSENCIA_LIDER:     { label: "Ausência do líder",     icone: "👤" },
  PROBLEMA_CLIMATICO: { label: "Problema climático",    icone: "🌧️" },
  EVENTO_IGREJA:      { label: "Evento da igreja",      icone: "⛪" },
  PROBLEMA_SAUDE:     { label: "Problema de saúde",     icone: "🏥" },
  LOCAL_INDISPONIVEL: { label: "Local indisponível",    icone: "🔒" },
  VIAGEM_MEMBROS:     { label: "Viagem dos membros",    icone: "✈️" },
  CANCELADA_PASTOR:   { label: "Cancelada pelo pastor", icone: "✋" },
  OUTRO:              { label: "Outro motivo",           icone: "📋" },
};

const JUSTIFICATIVAS = {
  TRABALHO: { label: "Trabalho", icon: <Briefcase size={11}/>, cor: "#6366F1", bg: "rgba(99,102,241,.1)",  borda: "rgba(99,102,241,.28)" },
  VIAGEM:   { label: "Viagem",   icon: <Plane     size={11}/>, cor: "#0891B2", bg: "rgba(8,145,178,.1)",   borda: "rgba(8,145,178,.28)" },
  DOENCA:   { label: "Doença",   icon: <HeartPulse size={11}/>, cor: "#DC2626", bg: "rgba(220,38,38,.1)", borda: "rgba(220,38,38,.28)" },
  OUTROS:   { label: "Outros",   icon: <HelpCircle size={11}/>, cor: "#D97706", bg: "rgba(217,119,6,.1)",  borda: "rgba(217,119,6,.28)" },
};

function getMotivoLabel(m) { return MOTIVO_LABELS[m] || { label: m || "Não informado", icone: "📋" }; }
function getJustificativaInfo(v) {
  return JUSTIFICATIVAS[v] || { label: v || "Outro", icon: <HelpCircle size={11}/>, cor: "#9A9080", bg: "rgba(154,144,128,.1)", borda: "rgba(154,144,128,.28)" };
}

const NOTIF_KEY = "ieq_notif_lidas_aura";
function getNotifLidas() { try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]"); } catch { return []; } }
function salvarNotifLida(id) { const l = getNotifLidas(); if (!l.includes(id)) { l.push(id); localStorage.setItem(NOTIF_KEY, JSON.stringify(l)); } }
function marcarTodasLidas(ids) { localStorage.setItem(NOTIF_KEY, JSON.stringify(ids)); }

function formatarDataLocal(dataStr) {
  if (!dataStr) return "?";
  const [ano, mes, dia] = dataStr.split("-").map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

function getDecisaoTexto(d) {
  return ({ ACEITOU_JESUS:"Novo Convertido", RECONCILIOU:"Reconciliação", BATISMO_AGUAS:"Deseja Batismo", NENHUMA:"Nenhuma" }[d] || d || "—");
}
function getDecisaoCor(d) {
  if (d === "ACEITOU_JESUS") return { background:"rgba(22,163,74,.12)",  color:"#16a34a", borderColor:"rgba(22,163,74,.3)"  };
  if (d === "RECONCILIOU")   return { background:"rgba(14,165,233,.12)", color:"#0ea5e9", borderColor:"rgba(14,165,233,.3)"  };
  if (d === "BATISMO_AGUAS") return { background:"rgba(139,92,246,.12)", color:"#8b5cf6", borderColor:"rgba(139,92,246,.3)"  };
  return                            { background:"rgba(200,16,46,.08)",  color:AURA.redDark, borderColor:"rgba(200,16,46,.2)" };
}

/* ─── Logo IEQ ─────────────────────────────────────────────────────────── */
function IEQCross({ size = 36 }) {
  return (
      <img src="/quadrangular.png" alt="IEQ"
           style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }} />
  );
}

/* ─── Badge de justificativa ──────────────────────────────────────────── */
function BadgeJust({ valor }) {
  const c = getJustificativaInfo(valor);
  return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:99,
        background:c.bg, color:c.cor, border:`1px solid ${c.borda}`,
        fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:700, letterSpacing:".06em", whiteSpace:"nowrap" }}>
      {c.icon} {c.label.toUpperCase()}
    </span>
  );
}

/* ─── Painel de notificações AURA ─────────────────────────────────────── */
function NotificacaoPanel({ naoRealizadas, isDark, t, onVerDetalhes }) {
  const [aberto, setAberto] = useState(false);
  const [lidas, setLidas]   = useState(getNotifLidas);
  const ref = useRef(null);

  useEffect(() => {
    function fora(e) { if (ref.current && !ref.current.contains(e.target)) setAberto(false); }
    if (aberto) document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto]);

  const naoLidas = naoRealizadas.filter(r => !lidas.includes(r.id));
  const count = naoLidas.length;

  return (
      <div ref={ref} style={{ position:"relative" }}>
        <button onClick={() => setAberto(!aberto)}
                style={{ position:"relative",
                  background: count > 0 ? `linear-gradient(135deg,${AURA.yellowDark},#a86d00)` : (isDark ? "rgba(255,255,255,.04)" : "rgba(201,169,110,.06)"),
                  border: count > 0 ? "none" : `1px solid ${t.border}`,
                  borderRadius:12, width:38, height:38, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", transition:"all .25s" }}>
          {count > 0
              ? <BellRing size={16} style={{ color:"#fff" }} />
              : <Bell size={16} style={{ color:t.textMuted }} />}
          {count > 0 && (
              <span style={{ position:"absolute", top:-6, right:-6, background:AURA.red, color:"#fff",
                borderRadius:99, fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:700, padding:"1px 5px",
                minWidth:16, textAlign:"center", border:`2px solid ${t.bg}` }}>{count}</span>
          )}
        </button>

        <AnimatePresence>
          {aberto && (
              <motion.div initial={{ opacity:0, y:-8, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }}
                          exit={{ opacity:0, y:-8, scale:.97 }} transition={{ duration:.18 }}
                          style={{ position:"absolute", top:"calc(100% + 10px)", right:0, width:"min(360px, 90vw)",
                            maxHeight:480, background:t.bgEl, border:`1px solid ${AURA.gold}30`,
                            borderRadius:16, boxShadow:"0 20px 60px rgba(0,0,0,.3)", zIndex:9999,
                            overflow:"hidden", display:"flex", flexDirection:"column" }}>

                {/* Header */}
                <div style={{ padding:"14px 16px", background:`linear-gradient(135deg,${AURA.blueDark},${AURA.blue})`,
                  display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <BellRing size={14} style={{ color:AURA.gold }} />
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".16em",
                      fontWeight:700, color:AURA.gold }}>ALERTAS DE CÉLULAS</span>
                    {count > 0 && (
                        <span style={{ background:"rgba(201,169,110,.2)", color:AURA.gold, borderRadius:99,
                          fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:700, padding:"2px 7px" }}>
                    {count} NOVA{count > 1?"S":""}
                  </span>
                    )}
                  </div>
                  {count > 0 && (
                      <button onClick={() => { marcarTodasLidas(naoRealizadas.map(r=>r.id)); setLidas(getNotifLidas()); }}
                              style={{ background:"rgba(201,169,110,.15)", border:"1px solid rgba(201,169,110,.3)",
                                borderRadius:6, padding:"4px 8px", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                        <CheckCheck size={11} style={{ color:AURA.gold }} />
                        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:8, color:AURA.gold }}>LER TUDO</span>
                      </button>
                  )}
                </div>

                <div style={{ overflowY:"auto", flex:1 }}>
                  {naoRealizadas.length === 0 ? (
                      <div style={{ padding:"32px 20px", textAlign:"center" }}>
                        <CheckCheck size={28} style={{ color:`${AURA.gold}40`, margin:"0 auto 10px" }} />
                        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, letterSpacing:".12em",
                          color:t.textMuted, margin:0 }}>NENHUM ALERTA PENDENTE</p>
                      </div>
                  ) : naoRealizadas.map(rel => {
                    const motivo = getMotivoLabel(rel.motivoNaoRealizacao);
                    const isLida = lidas.includes(rel.id);
                    return (
                        <div key={rel.id}
                             onClick={() => { onVerDetalhes(rel); setAberto(false); }}
                             style={{ padding:"12px 16px",
                               borderBottom:`1px solid ${isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.06)"}`,
                               cursor:"pointer", display:"flex", alignItems:"center", gap:10,
                               background: isLida ? "transparent" : (isDark?"rgba(201,169,110,.04)":"rgba(201,169,110,.06)"),
                               position:"relative", transition:"background .2s" }}
                             onMouseEnter={e => e.currentTarget.style.background=isDark?"rgba(201,169,110,.08)":"rgba(201,169,110,.1)"}
                             onMouseLeave={e => e.currentTarget.style.background=isLida?"transparent":(isDark?"rgba(201,169,110,.04)":"rgba(201,169,110,.06)")}>
                          {!isLida && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3,
                            background:`linear-gradient(180deg,${AURA.gold},${AURA.yellowDark})`, borderRadius:"0 2px 2px 0" }} />}
                          <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, fontSize:18,
                            background: isLida ? (isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)") : `${AURA.gold}18`,
                            display:"flex", alignItems:"center", justifyContent:"center" }}>{motivo.icone}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:600,
                              color:t.text, margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              {rel.nomeCelula}
                            </p>
                            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                              <Ban size={9} style={{ color:AURA.yellowDark }} />
                              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, color:AURA.yellowDark,
                                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {motivo.label}
                        </span>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:3 }}>
                              <Clock size={8} style={{ color:t.textMuted }} />
                              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:t.textMuted }}>
                          {formatarDataLocal(rel.dataReuniao)}
                        </span>
                            </div>
                          </div>
                          {!isLida && (
                              <button onClick={e => { e.stopPropagation(); salvarNotifLida(rel.id); setLidas(getNotifLidas()); }}
                                      style={{ background:`${AURA.gold}20`, border:`1px solid ${AURA.gold}40`,
                                        borderRadius:6, padding:"4px 6px", cursor:"pointer", flexShrink:0 }}>
                                <CheckCheck size={11} style={{ color:AURA.gold }} />
                              </button>
                          )}
                        </div>
                    );
                  })}
                </div>

                {naoRealizadas.length > 0 && (
                    <div style={{ padding:"8px 16px", borderTop:`1px solid ${t.border}`,
                      textAlign:"center" }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:8, letterSpacing:".12em", color:t.textMuted }}>
                  {naoRealizadas.length - count} DE {naoRealizadas.length} VISUALIZADAS
                </span>
                    </div>
                )}
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}

/* ─── Modal de detalhe AURA ───────────────────────────────────────────── */
function ModalDetalhe({ rel, isDark, t, onClose }) {
  if (!rel) return null;
  const naoRealizada = rel.realizada === false;
  const motivo       = naoRealizada ? getMotivoLabel(rel.motivoNaoRealizacao) : null;
  const comDecisao   = (rel.visitantesPresentes || []).filter(v => v.decisaoEspiritual && v.decisaoEspiritual !== "NENHUMA");
  const ausentesJust = (rel.membrosAusentes || []).filter(a => a.justificativaFalta);
  const ausentesSem  = (rel.membrosAusentes || []).filter(a => !a.justificativaFalta);

  return (
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  style={{
                    position:"fixed", inset:0, zIndex:9999,
                    background:"rgba(10,10,15,.88)",
                    backdropFilter:"blur(16px)",
                    display:"flex",
                    alignItems:"flex-start",          /* ← cola no topo */
                    justifyContent:"center",
                    padding:"env(safe-area-inset-top, 16px) 12px 12px",
                    overflowY:"auto",                 /* ← permite rolar o fundo se necessário */
                    WebkitOverflowScrolling:"touch",
                  }}
                  onClick={onClose}>

        <motion.div
            initial={{ y:-40, opacity:0, scale:.97 }}
            animate={{ y:0,   opacity:1, scale:1   }}
            exit={{    y:-40, opacity:0, scale:.97 }}
            transition={{ type:"spring", stiffness:320, damping:30 }}
            onClick={e => e.stopPropagation()}
            style={{
              width:"100%", maxWidth:680,
              display:"flex", flexDirection:"column",
              background:t.bgEl, border:`1px solid ${t.border}`,
              borderRadius:22, overflow:"hidden",
              boxShadow:"0 32px 80px rgba(0,0,0,.55)",
              marginTop:0,
              /* A caixa cresce com o conteúdo — sem maxHeight fixo aqui */
            }}>

          {/* Header do modal */}
          <div style={{ padding:"20px 20px 16px", flexShrink:0,
            background: naoRealizada
                ? `linear-gradient(135deg,${AURA.yellowDark},#a86d00)`
                : `linear-gradient(135deg,${AURA.blueDark},${AURA.blue})`,
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:42, height:42, background:"rgba(255,255,255,.15)", borderRadius:12,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize: naoRealizada ? 20 : undefined }}>
                {naoRealizada ? <span>{motivo.icone}</span> : <UserCheck size={20} style={{ color:"#fff" }} />}
              </div>
              <div>
                <h3 style={{ fontFamily:"'Inter',sans-serif", fontSize:15, fontWeight:700,
                  color:"#fff", margin:"0 0 3px", letterSpacing:".01em" }}>{rel.nomeCelula}</h3>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:"rgba(255,255,255,.65)", margin:0 }}>
                  {formatarDataLocal(rel.dataReuniao)}
                  {naoRealizada && <span style={{ marginLeft:8, background:"rgba(0,0,0,.2)",
                    padding:"2px 8px", borderRadius:99, fontSize:9 }}>✕ NÃO REALIZADA</span>}
                  {!naoRealizada && comDecisao.length > 0 && (
                      <span style={{ marginLeft:8, background:`${AURA.gold}30`, color:AURA.gold,
                        padding:"2px 8px", borderRadius:99, fontSize:9 }}>✦ {comDecisao.length} DECISÃO</span>
                  )}
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.15)", border:"none",
              color:"#fff", padding:10, borderRadius:10, cursor:"pointer", display:"flex" }}>
              <X size={18} />
            </button>
          </div>

          {/* Corpo — sem overflow interno; o overlay externo rola */}
          <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:16 }}>
            {naoRealizada && (
                <div style={{ padding:"24px 20px", background:isDark?"rgba(201,169,110,.06)":"rgba(201,169,110,.08)",
                  border:`1px solid ${AURA.gold}40`, borderRadius:16, textAlign:"center" }}>
                  <div style={{ fontSize:44, marginBottom:10 }}>{motivo.icone}</div>
                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".2em",
                    color:AURA.yellowDark, fontWeight:700, margin:"0 0 6px" }}>MOTIVO DA AUSÊNCIA</p>
                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:18, fontWeight:600,
                    color:t.text, margin:"0 0 16px" }}>{motivo.label}</p>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"9px 16px",
                    background:`${AURA.gold}18`, border:`1px solid ${AURA.gold}40`, borderRadius:99,
                    fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".12em", color:AURA.yellowDark }}>
                    <Ban size={12} /> CÉLULA NÃO REALIZADA NESTA DATA
                  </div>
                </div>
            )}

            {!naoRealizada && (
                <>
                  {/* KPIs rápidos */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                    {[
                      { label:"MEMBROS", value: rel.membrosPresentes?.length || 0, color:t.text, bg:isDark?"rgba(255,255,255,.04)":"rgba(201,169,110,.06)" },
                      { label:"VISITANTES", value: (rel.visitantesPresentes?.length||0)+(rel.quantidadeVisitantes||0), color:AURA.yellowDark, bg:"rgba(201,169,110,.08)" },
                      { label:"TOTAL", value: (rel.membrosPresentes?.length||0)+(rel.visitantesPresentes?.length||0)+(rel.quantidadeVisitantes||0), color:"#fff",
                        bg:`linear-gradient(135deg,${AURA.blueDark},${AURA.blue})` },
                    ].map((k,i) => (
                        <div key={i} style={{ background:k.bg, borderRadius:12, padding:"12px 10px", textAlign:"center",
                          border:i<2?`1px solid ${t.border}`:"none" }}>
                          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:22, fontWeight:700, color:k.color, margin:0 }}>{k.value}</p>
                          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:8, letterSpacing:".12em", color:i===2?"rgba(255,255,255,.6)":t.textMuted, margin:"3px 0 0" }}>{k.label}</p>
                        </div>
                    ))}
                  </div>

                  {/* Estudo */}
                  {rel.estudo && (
                      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px",
                        background:isDark?"rgba(255,255,255,.03)":"rgba(201,169,110,.05)",
                        border:`1px solid ${t.border}`, borderRadius:12 }}>
                        <BookOpen size={15} style={{ color:AURA.gold, flexShrink:0 }} />
                        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:300, color:t.textSec, margin:0 }}>
                          {rel.estudo}
                        </p>
                      </div>
                  )}

                  {/* Decisões espirituais */}
                  {comDecisao.length > 0 && (
                      <div style={{ padding:"16px 18px", background:isDark?"rgba(201,169,110,.06)":"rgba(201,169,110,.08)",
                        border:`1px solid ${AURA.gold}40`, borderRadius:14 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                          <Sparkles size={14} style={{ color:AURA.gold }} />
                          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".16em",
                            color:AURA.gold, fontWeight:700 }}>DECISÕES ESPIRITUAIS ({comDecisao.length})</span>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                          {comDecisao.map((v, i) => (
                              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                                flexWrap:"wrap", gap:8, padding:"10px 14px",
                                background:isDark?"rgba(255,255,255,.04)":"rgba(255,255,255,.75)",
                                border:`1px solid ${getDecisaoCor(v.decisaoEspiritual).borderColor}`, borderRadius:10 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                                  <div style={{ width:32, height:32, borderRadius:8, background:`${getDecisaoCor(v.decisaoEspiritual).color}18`,
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13,
                                    color:getDecisaoCor(v.decisaoEspiritual).color }}>{v.nome.charAt(0)}</div>
                                  <span style={{ fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:500, color:t.text }}>{v.nome}</span>
                                </div>
                                <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:99,
                                  fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:700, letterSpacing:".08em",
                                  border:"1px solid", ...getDecisaoCor(v.decisaoEspiritual) }}>
                          {getDecisaoTexto(v.decisaoEspiritual)}
                        </span>
                              </div>
                          ))}
                        </div>
                      </div>
                  )}

                  {/* Faltas justificadas */}
                  {ausentesJust.length > 0 && (
                      <div style={{ padding:"16px 18px", background:isDark?"rgba(99,102,241,.06)":"rgba(99,102,241,.07)",
                        border:"1px solid rgba(99,102,241,.25)", borderRadius:14 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                          <UserX size={14} style={{ color:"#6366F1" }} />
                          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".16em",
                            color:"#6366F1", fontWeight:700 }}>FALTAS JUSTIFICADAS ({ausentesJust.length})</span>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                          {ausentesJust.map((a, i) => (
                              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                                flexWrap:"wrap", gap:8, padding:"10px 14px",
                                background:isDark?"rgba(255,255,255,.04)":"rgba(255,255,255,.75)",
                                border:`1px solid ${getJustificativaInfo(a.justificativaFalta).borda}`, borderRadius:10 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                                  <div style={{ width:32, height:32, borderRadius:8,
                                    background:`${getJustificativaInfo(a.justificativaFalta).cor}18`,
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13,
                                    color:getJustificativaInfo(a.justificativaFalta).cor }}>
                                    {(a.nome || a.membroNome || "?").charAt(0)}
                                  </div>
                                  <span style={{ fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:400, color:t.text }}>
                            {a.nome || a.membroNome || `Membro #${a.membroId || a.id}`}
                          </span>
                                </div>
                                <BadgeJust valor={a.justificativaFalta} />
                              </div>
                          ))}
                        </div>
                      </div>
                  )}

                  {/* Membros presentes */}
                  {rel.membrosPresentes?.length > 0 && (
                      <div>
                        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".16em",
                          color:t.textMuted, margin:"0 0 10px" }}>MEMBROS PRESENTES ({rel.membrosPresentes.length})</p>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))", gap:8 }}>
                          {rel.membrosPresentes.map((m, i) => (
                              <div key={i} style={{ padding:"9px 12px",
                                background:isDark?"rgba(255,255,255,.04)":"rgba(201,169,110,.05)",
                                border:`1px solid ${t.border}`, borderRadius:10,
                                fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:400, color:t.text }}>
                                {m.nome || m}
                              </div>
                          ))}
                        </div>
                      </div>
                  )}

                  {/* Ausentes sem justificativa */}
                  {ausentesSem.length > 0 && (
                      <div>
                        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".16em",
                          color:t.textMuted, margin:"0 0 10px" }}>AUSENTES SEM JUSTIFICATIVA ({ausentesSem.length})</p>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))", gap:8 }}>
                          {ausentesSem.map((a, i) => (
                              <div key={i} style={{ padding:"9px 12px",
                                background:isDark?"rgba(255,255,255,.02)":"rgba(0,0,0,.03)",
                                border:`1px dashed ${isDark?"rgba(255,255,255,.1)":"rgba(0,0,0,.1)"}`, borderRadius:10,
                                fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:400, color:t.textMuted }}>
                                {a.nome || a.membroNome || `Membro #${a.membroId || a.id}`}
                              </div>
                          ))}
                        </div>
                      </div>
                  )}

                  {/* Visitantes */}
                  {rel.visitantesPresentes?.length > 0 && (
                      <div>
                        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".16em",
                          color:AURA.yellowDark, margin:"0 0 10px" }}>VISITANTES ({rel.visitantesPresentes.length})</p>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:10 }}>
                          {rel.visitantesPresentes.map((v, i) => (
                              <div key={i} style={{ padding:"12px 14px", background:isDark?"rgba(201,169,110,.06)":"rgba(201,169,110,.08)",
                                border:`1px solid ${AURA.gold}40`, borderRadius:12 }}>
                                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:600,
                                  color:t.text, margin:"0 0 6px" }}>{v.nome}</p>
                                <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:99,
                                  fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:700, letterSpacing:".08em",
                                  border:"1px solid", ...getDecisaoCor(v.decisaoEspiritual) }}>
                          {getDecisaoTexto(v.decisaoEspiritual)}
                        </span>
                              </div>
                          ))}
                        </div>
                      </div>
                  )}

                  {/* Observações */}
                  {rel.observacoes && (
                      <div style={{ padding:"14px 16px", background:isDark?"rgba(255,255,255,.03)":"rgba(201,169,110,.05)",
                        border:`1px solid ${t.border}`, borderRadius:12 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                          <MessageSquare size={13} style={{ color:AURA.gold }} />
                          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".14em",
                            color:AURA.gold, fontWeight:600 }}>OBSERVAÇÕES DO LÍDER</span>
                        </div>
                        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:14, fontStyle:"italic",
                          color:t.textSec, margin:0 }}>"{rel.observacoes}"</p>
                      </div>
                  )}
                </>
            )}

            {/* Botão fechar no rodapé — útil no mobile */}
            <div style={{ paddingTop:4, paddingBottom:"max(8px, env(safe-area-inset-bottom, 8px))" }}>
              <button onClick={onClose}
                      style={{ width:"100%", padding:"13px", borderRadius:100, border:`1px solid ${t.border}`,
                        cursor:"pointer", background:"transparent", color:t.textSec,
                        fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600,
                        letterSpacing:".14em", textTransform:"uppercase", transition:"all .3s",
                        display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
                      onMouseEnter={e=>{ e.currentTarget.style.borderColor=AURA.gold; e.currentTarget.style.color=AURA.gold; }}
                      onMouseLeave={e=>{ e.currentTarget.style.borderColor=t.border; e.currentTarget.style.color=t.textSec; }}>
                <X size={14} /> Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
  );
}

/* ─── Card de célula realizada ─────────────────────────────────────────── */
function CardRealizada({ rel, isDark, t, onClick, delay }) {
  const m = rel.membrosPresentes?.length || 0;
  const v = (rel.visitantesPresentes?.length || 0) + (rel.quantidadeVisitantes || 0);
  const decisoes = (rel.visitantesPresentes || []).filter(vt => vt.decisaoEspiritual && vt.decisaoEspiritual !== "NENHUMA");
  const ausentesJust = (rel.membrosAusentes || []).filter(a => a.justificativaFalta);

  return (
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay }}
                  onClick={onClick}
                  style={{ background:t.bgEl, border:`1px solid ${t.border}`, borderRadius:18,
                    overflow:"hidden", cursor:"pointer", transition:"all .3s", position:"relative" }}
                  whileHover={{ y:-4 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${AURA.gold}60`; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,${isDark?.4:.12})`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = isDark?"rgba(201,169,110,.1)":"rgba(201,169,110,.2)"; e.currentTarget.style.boxShadow = "none"; }}>

        {/* Topo decorativo */}
        <div style={{ height:3, background:`linear-gradient(90deg,${AURA.blue},${AURA.gold})` }} />

        <div style={{ padding:"18px 18px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:`${AURA.blue}18`,
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Calendar size={18} style={{ color:AURA.blue }} />
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:8, letterSpacing:".1em", color:t.textMuted, margin:"0 0 2px" }}>DATA</p>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:500, color:t.text, margin:0 }}>
                {formatarDataLocal(rel.dataReuniao)}
              </p>
            </div>
          </div>

          <h3 style={{ fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:700,
            color:t.text, margin:"0 0 10px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {rel.nomeCelula}
          </h3>

          {rel.estudo && (
              <div style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 10px",
                background:isDark?"rgba(255,255,255,.03)":"rgba(201,169,110,.05)",
                borderRadius:8, marginBottom: (decisoes.length > 0 || ausentesJust.length > 0) ? 8 : 14 }}>
                <BookOpen size={11} style={{ color:AURA.gold, flexShrink:0 }} />
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:t.textMuted, margin:0,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {rel.estudo}
                </p>
              </div>
          )}

          {decisoes.length > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 10px",
                background:`${AURA.gold}10`, border:`1px solid ${AURA.gold}30`, borderRadius:8,
                marginBottom: ausentesJust.length > 0 ? 8 : 14 }}>
                <Sparkles size={10} style={{ color:AURA.yellowDark, flexShrink:0 }} />
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:9, color:AURA.yellowDark, margin:0 }}>
                  {decisoes.length} DECISÃO{decisoes.length > 1 ? "ÕES" : ""} ESPIRITUAL{decisoes.length > 1 ? "IS" : ""}
                </p>
              </div>
          )}

          {ausentesJust.length > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 10px",
                background:"rgba(99,102,241,.08)", border:"1px solid rgba(99,102,241,.2)", borderRadius:8, marginBottom:14 }}>
                <UserX size={10} style={{ color:"#6366F1", flexShrink:0 }} />
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:9, color:"#6366F1", margin:0 }}>
                  {ausentesJust.length} FALTA{ausentesJust.length > 1 ? "S" : ""} JUSTIFICADA{ausentesJust.length > 1 ? "S" : ""}
                </p>
              </div>
          )}
        </div>

        {/* Stats footer */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
          borderTop:`1px solid ${t.border}` }}>
          {[
            { label:"MBR", value:m,   color:t.text    },
            { label:"VIS", value:v,   color:AURA.yellowDark },
            { label:"TTL", value:m+v, color:AURA.blue  },
          ].map((k, ki) => (
              <div key={ki} style={{ padding:"11px 8px", textAlign:"center",
                borderRight: ki<2 ? `1px solid ${t.border}` : "none" }}>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:18, fontWeight:700, color:k.color, margin:0 }}>{k.value}</p>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:8, letterSpacing:".1em", color:t.textMuted, margin:"2px 0 0" }}>{k.label}</p>
              </div>
          ))}
        </div>

        <div style={{ padding:"8px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".1em", color:AURA.gold, fontWeight:600 }}>VER DETALHES</span>
          <ChevronRight size={13} style={{ color:AURA.gold }} />
        </div>
      </motion.div>
  );
}

/* ─── Card de célula NÃO realizada ────────────────────────────────────── */
function CardNaoRealizada({ rel, t, isDark, onClick, delay }) {
  const motivo = getMotivoLabel(rel.motivoNaoRealizacao);
  return (
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay }}
                  onClick={onClick}
                  style={{ background:t.bgEl, border:`1px solid ${AURA.gold}40`, borderRadius:18,
                    overflow:"hidden", cursor:"pointer", transition:"all .3s" }}
                  whileHover={{ y:-4 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = AURA.gold; e.currentTarget.style.boxShadow = `0 12px 32px rgba(201,169,110,.15)`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${AURA.gold}40`; e.currentTarget.style.boxShadow = "none"; }}>

        <div style={{ height:3, background:`linear-gradient(90deg,${AURA.yellowDark},${AURA.gold})` }} />
        <div style={{ padding:"18px 18px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:`${AURA.gold}18`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
              {motivo.icone}
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:8, letterSpacing:".1em", color:t.textMuted, margin:"0 0 2px" }}>DATA</p>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:500, color:t.text, margin:0 }}>
                {formatarDataLocal(rel.dataReuniao)}
              </p>
            </div>
          </div>

          <h3 style={{ fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:700,
            color:t.text, margin:"0 0 10px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {rel.nomeCelula}
          </h3>

          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px",
            background:`${AURA.gold}10`, border:`1px solid ${AURA.gold}30`, borderRadius:10, marginBottom:14 }}>
            <Ban size={11} style={{ color:AURA.yellowDark, flexShrink:0 }} />
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:AURA.yellowDark, fontWeight:500 }}>
            {motivo.label}
          </span>
          </div>
        </div>

        <div style={{ padding:"8px 18px", borderTop:`1px solid ${AURA.gold}20`,
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".1em", color:AURA.yellowDark, fontWeight:600 }}>VER DETALHES</span>
          <ChevronRight size={13} style={{ color:AURA.yellowDark }} />
        </div>
      </motion.div>
  );
}

/* ─── KPI Card ─────────────────────────────────────────────────────────── */
function KPICard({ icon, label, value, isDark, t, destaque, alerta }) {
  const bg = destaque
      ? `linear-gradient(135deg,${AURA.blueDark},${AURA.blue})`
      : alerta
          ? (value > 0 ? `linear-gradient(135deg,${AURA.yellowDark},#a86d00)` : t.bgEl)
          : t.bgEl;
  const textColor = (destaque || (alerta && value > 0)) ? "#fff" : t.text;
  const subColor  = (destaque || (alerta && value > 0)) ? "rgba(255,255,255,.6)" : t.textMuted;
  const iconBg    = (destaque || (alerta && value > 0)) ? "rgba(255,255,255,.15)" : `${AURA.gold}18`;

  return (
      <div style={{ background:bg, border:(destaque||(alerta&&value>0)) ? "none" : `1px solid ${t.border}`,
        borderRadius:18, padding:"18px 16px", display:"flex", alignItems:"center", gap:14,
        backdropFilter:"blur(20px)" }}>
        <div style={{ width:44, height:44, borderRadius:12, background:iconBg,
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {React.cloneElement(icon, { style:{ color: (destaque||(alerta&&value>0)) ? "#fff" : AURA.gold } })}
        </div>
        <div>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".16em",
            color:subColor, margin:"0 0 2px", fontWeight:500 }}>{label}</p>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:26, fontWeight:700, color:textColor, margin:0 }}>{value}</p>
        </div>
      </div>
  );
}

/* ─── Componente Principal ─────────────────────────────────────────────── */
export default function TelaRelatorio({ isDark = false, usuarioLogado, celula, onVoltar }) {
  const [relatorios,  setRelatorios]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [erro,        setErro]        = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRel, setSelectedRel] = useState(null);
  const [dataInicio,  setDataInicio]  = useState("");
  const [dataFim,     setDataFim]     = useState("");

  const t = theme(isDark);

  // ── Para uso standalone sem props ──
  const nomeUsuario = usuarioLogado?.nome || "Líder";
  const nomeCelula  = celula?.nome || "";

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
    @keyframes dl-spin   { to { transform: rotate(360deg); } }
    @keyframes dl-pulse  { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
    @keyframes dl-blink  { 0%,100%{opacity:1;} 50%{opacity:.3;} }
    @keyframes stripe-aura {
      0%   { background-position: 0 0; }
      100% { background-position: 60px 60px; }
    }
    .aura-spin { animation: dl-spin 1s linear infinite; }
    .aura-pulse { animation: dl-pulse 3s ease-in-out infinite; }
    .aura-blink { animation: dl-blink 2s ease-in-out infinite; }

    .aura-date-input {
      background: ${t.bgInput};
      border: 1px solid ${t.borderInput};
      color: ${t.text};
      padding: 11px 14px; border-radius: 12px; outline: none; flex: 1; min-width: 0;
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
      transition: all .25s; -webkit-appearance: none; appearance: none;
    }
    .aura-date-input:focus {
      border-color: ${AURA.gold}80;
      box-shadow: 0 0 0 3px ${AURA.gold}15;
    }

    /* Grid responsivo */
    .aura-kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .aura-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 14px;
    }

    @media (max-width: 900px) {
      .aura-kpi-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 600px) {
      .aura-kpi-grid { grid-template-columns: 1fr 1fr; }
      .aura-cards-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 380px) {
      .aura-kpi-grid { grid-template-columns: 1fr 1fr; }
    }

    /* Scroll suave em iOS */
    .aura-scroll { -webkit-overflow-scrolling: touch; }

    /* Safe area iOS */
    .aura-root {
      padding-bottom: max(40px, env(safe-area-inset-bottom, 40px));
    }

    /* Tap highlight Android/iOS */
    .aura-card-tap { -webkit-tap-highlight-color: transparent; }
  `;

  const carregarSemanaAtual = () => {
    const hoje = new Date(); const diaSem = hoje.getDay();
    const diff = diaSem === 0 ? 6 : diaSem - 1;
    const seg = new Date(hoje); seg.setDate(hoje.getDate() - diff);
    const dom = new Date(seg); dom.setDate(seg.getDate() + 6);
    setDataInicio(seg.toISOString().split("T")[0]);
    setDataFim(dom.toISOString().split("T")[0]);
  };

  useEffect(() => { carregarSemanaAtual(); }, []);

  const carregarRelatorios = useCallback(async () => {
    if (!dataInicio || !dataFim) return;
    try {
      setLoading(true); setErro(null);
      // ── MOCK para demonstração ──────────────────────────────────────────
      // Substitua pela chamada real: api.get(`/relatorios/semana?inicio=${dataInicio}&fim=${dataFim}`)
      await new Promise(r => setTimeout(r, 800));
      setRelatorios([
        {
          id: 1, nomeCelula: "Célula Graça", dataReuniao: dataInicio, realizada: true,
          estudo: "O Espírito Santo e os Dons", quantidadeVisitantes: 0,
          membrosPresentes: [{ nome:"Ana Lima" },{ nome:"Carlos Rocha" },{ nome:"Bia Melo" },{ nome:"João Pedro" }],
          visitantesPresentes: [{ nome:"Marcelo Torres", decisaoEspiritual:"ACEITOU_JESUS" }],
          membrosAusentes: [{ nome:"Rita Farias", justificativaFalta:"TRABALHO" },{ nome:"Paulo Nunes" }],
          observacoes: "Reunião muito abençoada, Marcelo aceitou Jesus!",
        },
        {
          id: 2, nomeCelula: "Célula Fé", dataReuniao: dataInicio, realizada: true,
          estudo: "Fé que move montanhas", quantidadeVisitantes: 1,
          membrosPresentes: [{ nome:"Lara Dias" },{ nome:"Tiago Sousa" },{ nome:"Fernanda Cruz" },{ nome:"Bruno Lima" },{ nome:"Clara Neto" }],
          visitantesPresentes: [],
          membrosAusentes: [{ nome:"Sandro Gomes", justificativaFalta:"DOENCA" }],
          observacoes: "",
        },
        {
          id: 3, nomeCelula: "Célula Esperança", dataReuniao: dataInicio, realizada: false,
          motivoNaoRealizacao: "PROBLEMA_SAUDE",
        },
        {
          id: 4, nomeCelula: "Célula Amor", dataReuniao: dataInicio, realizada: true,
          estudo: "Amor incondicional", quantidadeVisitantes: 0,
          membrosPresentes: [{ nome:"Helena Costa" },{ nome:"Pedro Alves" },{ nome:"Sara Mota" }],
          visitantesPresentes: [{ nome:"Rebeca Pires", decisaoEspiritual:"RECONCILIOU" }],
          membrosAusentes: [],
          observacoes: "",
        },
        {
          id: 5, nomeCelula: "Célula Luz", dataReuniao: dataInicio, realizada: false,
          motivoNaoRealizacao: "VIAGEM_MEMBROS",
        },
      ]);
    } catch {
      setErro("Erro ao buscar relatórios. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => { if (dataInicio && dataFim) carregarRelatorios(); }, [carregarRelatorios]);

  const { realizadas, naoRealizadas } = useMemo(() => ({
    realizadas:    relatorios.filter(r => r.realizada !== false),
    naoRealizadas: relatorios.filter(r => r.realizada === false),
  }), [relatorios]);

  const totais = useMemo(() => realizadas.reduce((acc, rel) => {
    const m  = rel.membrosPresentes?.length || 0;
    const v  = (rel.visitantesPresentes?.length || 0) + (rel.quantidadeVisitantes || 0);
    const jf = (rel.membrosAusentes || []).filter(a => a.justificativaFalta).length;
    return { membros:acc.membros+m, visitantes:acc.visitantes+v, geral:acc.geral+m+v, justificadas:acc.justificadas+jf };
  }, { membros:0, visitantes:0, geral:0, justificadas:0 }), [realizadas]);

  /* ── Loading state ── */
  if (loading) return (
      <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", background:t.bg }}>
        <style>{globalStyles}</style>
        <div style={{ position:"relative", display:"inline-flex", marginBottom:20 }}>
          <div className="aura-pulse" style={{ position:"absolute", width:80, height:80,
            top:"50%", left:"50%", transform:"translate(-50%,-50%)",
            border:"1px solid rgba(201,169,110,.25)", borderRadius:"50%" }} />
          <div style={{ width:52, height:52, borderRadius:"50%",
            background:isDark?"rgba(18,18,26,.99)":"#fff", border:"1.5px solid rgba(201,169,110,.28)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <IEQCross size={36} />
          </div>
        </div>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:600,
          letterSpacing:".25em", textTransform:"uppercase", color:AURA.gold, opacity:.7 }}>
          Carregando relatórios…
        </p>
      </div>
  );

  /* ── Render principal ── */
  return (
      <div className="aura-root aura-scroll"
           style={{ minHeight:"100vh", background:t.bg, color:t.text, position:"relative" }}>
        <style>{globalStyles}</style>

        {/* Glow de fundo */}
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
          background:`radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
                    radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%)` }} />

        <div style={{ position:"relative", zIndex:1, maxWidth:1100, margin:"0 auto", padding:"24px 16px 0" }}>

          {/* ── Header ── */}
          <motion.div initial={{ opacity:0, y:-18 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }}
                      style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
                        flexWrap:"wrap", gap:16, marginBottom:24 }}>

            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              {onVoltar && (
                  <button onClick={onVoltar}
                          style={{ background:isDark?"rgba(255,255,255,.04)":"rgba(201,169,110,.06)",
                            border:`1px solid ${t.border}`, borderRadius:12, width:38, height:38,
                            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                            color:t.textMuted, flexShrink:0, transition:"all .25s" }}
                          onMouseEnter={e=>{ e.currentTarget.style.borderColor=AURA.gold; e.currentTarget.style.color=AURA.gold; }}
                          onMouseLeave={e=>{ e.currentTarget.style.borderColor=t.border; e.currentTarget.style.color=t.textMuted; }}>
                    ←
                  </button>
              )}
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                  <Sparkles size={11} style={{ color:AURA.gold }} />
                  <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".2em",
                    fontWeight:500, color:`${AURA.gold}88` }}>GESTÃO DA REDE</span>
                </div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(18px,4vw,26px)",
                  fontWeight:500, letterSpacing:".03em", margin:0, color:t.text }}>
                  Relatórios de <span style={{ color:AURA.gold }}>Células</span>
                </h2>
                {nomeCelula && (
                    <p style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:300,
                      color:t.textSec, margin:"3px 0 0" }}>
                      {nomeCelula} · {nomeUsuario}
                    </p>
                )}
              </div>
            </div>

            {/* Ações do header */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              <NotificacaoPanel naoRealizadas={naoRealizadas} isDark={isDark} t={t}
                                onVerDetalhes={rel => setSelectedRel(rel)} />

              <button onClick={() => setShowFilters(!showFilters)}
                      style={{ background:isDark?"rgba(255,255,255,.04)":"rgba(201,169,110,.06)",
                        border:`1px solid ${t.border}`, borderRadius:12, padding:"0 16px", height:38,
                        cursor:"pointer", display:"flex", alignItems:"center", gap:7, color:t.textSec,
                        fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600, letterSpacing:".12em",
                        textTransform:"uppercase", transition:"all .25s" }}
                      onMouseEnter={e=>{ e.currentTarget.style.borderColor=AURA.gold; e.currentTarget.style.color=AURA.gold; }}
                      onMouseLeave={e=>{ e.currentTarget.style.borderColor=t.border; e.currentTarget.style.color=t.textSec; }}>
                <Filter size={14} />
                {showFilters ? "Ocultar" : "Filtrar"}
              </button>
            </div>
          </motion.div>

          {/* Divider dourado */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, ${AURA.gold})` }} />
            <div style={{ width:5, height:5, borderRadius:"50%", background:AURA.gold }} />
            <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, ${AURA.gold})` }} />
          </div>

          {/* ── Filtros ── */}
          <AnimatePresence>
            {showFilters && (
                <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
                            exit={{ height:0, opacity:0 }} style={{ overflow:"hidden", marginBottom:20 }}>
                  <div style={{ background:t.bgEl, border:`1px solid ${t.border}`, borderRadius:16,
                    padding:"16px 18px", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center",
                    backdropFilter:"blur(20px)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:200 }}>
                  <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".14em",
                    color:t.textMuted, whiteSpace:"nowrap" }}>DE</span>
                      <input className="aura-date-input" type="date"
                             value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:200 }}>
                  <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".14em",
                    color:t.textMuted, whiteSpace:"nowrap" }}>ATÉ</span>
                      <input className="aura-date-input" type="date"
                             value={dataFim} onChange={e => setDataFim(e.target.value)} />
                    </div>
                    <button onClick={carregarSemanaAtual}
                            style={{ padding:"11px 16px", borderRadius:100,
                              border:`1px solid ${t.border}`, cursor:"pointer", background:"transparent",
                              color:t.textSec, fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600,
                              letterSpacing:".12em", textTransform:"uppercase", transition:"all .3s", whiteSpace:"nowrap" }}
                            onMouseEnter={e=>{ e.currentTarget.style.borderColor=AURA.gold; e.currentTarget.style.color=AURA.gold; }}
                            onMouseLeave={e=>{ e.currentTarget.style.borderColor=t.border; e.currentTarget.style.color=t.textSec; }}>
                      Esta semana
                    </button>
                    <button onClick={carregarRelatorios}
                            style={{ padding:"11px 20px", borderRadius:100, border:"none", cursor:"pointer",
                              background:`linear-gradient(135deg,${AURA.blueDark},${AURA.blue})`, color:"#fff",
                              fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600,
                              letterSpacing:".12em", textTransform:"uppercase", transition:"all .3s",
                              boxShadow:`0 6px 20px ${AURA.blue}40` }}>
                      Aplicar
                    </button>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* ── KPIs ── */}
          <div className="aura-kpi-grid">
            <KPICard icon={<Users size={20}/>}     label="MEMBROS"       value={totais.membros}      isDark={isDark} t={t} />
            <KPICard icon={<UserPlus size={20}/>}  label="VISITANTES"    value={totais.visitantes}   isDark={isDark} t={t} />
            <KPICard icon={<TrendingUp size={20}/>} label="TOTAL GERAL"  value={totais.geral}         isDark={isDark} t={t} destaque />
            <KPICard icon={<UserX size={20}/>}     label="FALTAS JUST."  value={totais.justificadas} isDark={isDark} t={t} />
            <KPICard icon={<Ban size={20}/>}       label="NÃO REALIZADAS" value={naoRealizadas.length} isDark={isDark} t={t} alerta />
          </div>

          {/* ── Erro ── */}
          {erro && (
              <div style={{ padding:"16px 20px", borderRadius:14, marginBottom:20,
                background:`${AURA.red}12`, border:`1px solid ${AURA.red}30`,
                display:"flex", alignItems:"center", gap:10 }}>
                <AlertCircle size={16} style={{ color:AURA.red, flexShrink:0 }} />
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:AURA.red, margin:0 }}>{erro}</p>
              </div>
          )}

          {/* ── Células NÃO realizadas ── */}
          {naoRealizadas.length > 0 && (
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px",
                    background:`${AURA.gold}12`, border:`1px solid ${AURA.gold}40`, borderRadius:10 }}>
                    <AlertTriangle size={13} style={{ color:AURA.yellowDark }} />
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".16em",
                      color:AURA.yellowDark, fontWeight:700 }}>
                  CÉLULAS NÃO REALIZADAS — {naoRealizadas.length}
                </span>
                  </div>
                  <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${AURA.gold}50,transparent)` }} />
                </div>
                <div className="aura-cards-grid">
                  {naoRealizadas.map((rel, i) => (
                      <CardNaoRealizada key={rel.id} rel={rel} t={t} isDark={isDark}
                                        onClick={() => setSelectedRel(rel)} delay={i*.05} />
                  ))}
                </div>
              </motion.div>
          )}

          {/* ── Células realizadas ── */}
          {realizadas.length > 0 && (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px",
                    background:`${AURA.blue}15`, border:`1px solid ${AURA.blue}40`, borderRadius:10 }}>
                    <Calendar size={13} style={{ color:AURA.blue }} />
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".16em",
                      color:AURA.blue, fontWeight:700 }}>
                  CÉLULAS REALIZADAS — {realizadas.length}
                </span>
                  </div>
                  <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${AURA.blue}50,transparent)` }} />
                </div>
                <div className="aura-cards-grid">
                  {realizadas.map((rel, i) => (
                      <CardRealizada key={rel.id} rel={rel} isDark={isDark} t={t}
                                     onClick={() => setSelectedRel(rel)} delay={i*.04} />
                  ))}
                </div>
              </>
          )}

          {/* Vazio */}
          {relatorios.length === 0 && !loading && (
              <div style={{ textAlign:"center", padding:"56px 24px", background:t.bgEl,
                borderRadius:20, border:`2px dashed ${t.border}`, marginTop:16 }}>
                <AlertCircle size={36} style={{ color:`${AURA.gold}40`, margin:"0 auto 14px" }} />
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:300,
                  color:t.textMuted, margin:0 }}>Nenhum relatório encontrado para o período.</p>
              </div>
          )}

          <div style={{ height:1, background:`linear-gradient(90deg,transparent,${AURA.gold}30,transparent)`,
            margin:"28px 0 16px" }} />
          <p style={{ textAlign:"center", fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:500,
            letterSpacing:".18em", textTransform:"uppercase",
            color:isDark?"rgba(245,240,232,.1)":"rgba(26,16,8,.12)", paddingBottom:16 }}>
            © {new Date().getFullYear()} IEQ Pituaçu — Sistema Eclesiástico
          </p>
        </div>

        {/* ── Modal de detalhe ── */}
        <AnimatePresence>
          {selectedRel && (
              <ModalDetalhe rel={selectedRel} isDark={isDark} t={t} onClose={() => setSelectedRel(null)} />
          )}
        </AnimatePresence>
      </div>
  );
}